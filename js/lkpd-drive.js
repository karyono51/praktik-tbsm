/* lkpd-drive.js: foto bukti praktik per item pemeriksaan (ikon kamera) dan penyimpanan di Google Drive.
   - Foto per item diambil dari tabel Hasil pemeriksaan (satu foto per item). Bagian "Foto tambahan" tetap ada (maksimal 3).
   - Saat disinkronkan ke Appwrite, foto diunggah lewat Appwrite Function `foto-drive` ke Google Drive. Database hanya menyimpan
     penanda `drive:<fileId>` di kolom data. Label foto per item berbentuk `c<nomor>|<nama komponen>`.
   - Bila fungsi foto-drive belum dipasang, foto disimpan di database seperti sebelumnya (tidak ada yang hilang).
   - Foto yang tersimpan di Drive ditampilkan lewat fungsi yang sama (guru/admin, atau pemilik foto). */
var LD={cache:{},loading:{},failed:{},off:false,MAXC:150000};
ICO.camera='<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';

function ldGen(f){return f.filter(function(x){return x.item===undefined}).length}
function ldParse(x){var m=/^c(\d+)\|([\s\S]*)$/.exec(x.label||'');return m?{item:+m[1],name:m[2]}:{item:-1,name:x.label||''}}
function ldItemName(i){var m=(window.LKPD_MODULES||[]).filter(function(x){return x.id===LK.module})[0];return m&&m.checks&&m.checks[i]?String(m.checks[i][0]):'Item '+(i+1)}

/* ---------- Kamera per item (form siswa) ---------- */
function ldRowCam(i){
 var f=lkFotos(),k=-1;f.forEach(function(x,j){if(x.item===i)k=j});
 if(k>-1)return '<div class="ld-cam"><img class="ld-thumb" src="'+f[k].data+'" alt="Foto bukti '+lkEsc(f[k].label)+'"><button type="button" class="btn small danger" data-act="ld-del" data-v="'+i+'">Hapus foto</button></div>';
 return '<div class="ld-cam"><label class="btn small ld-btn" title="Foto bukti untuk item ini">'+svg(ICO.camera,16)+' Foto<input type="file" accept="image/*" data-ld-photo="'+i+'" hidden></label></div>';
}
function ldCompress(file,cb){
 var img=new Image(),url=URL.createObjectURL(file);
 img.onerror=function(){URL.revokeObjectURL(url);cb(null)};
 img.onload=function(){
  var side=960,out=null;
  for(var t=0;t<4&&!out;t++){
   var k=Math.min(1,side/Math.max(img.width,img.height)),c=document.createElement('canvas');
   c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));
   c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   for(var q=.7;q>=.4;q-=.1){var u=c.toDataURL('image/jpeg',q);if(u.length<=LD.MAXC){out=u;break}}
   side=Math.round(side*.75);
  }
  URL.revokeObjectURL(url);cb(out);
 };
 img.src=url;
}
document.addEventListener('change',function(e){
 var t=e.target;if(!t.matches||!t.matches('[data-ld-photo]'))return;
 var file=t.files&&t.files[0];if(!file)return;
 var i=Number(t.dataset.ldPhoto);
 ldCompress(file,function(data){
  if(!data){toast('Foto tidak dapat diproses. Coba foto lain.');return}
  var f=lkFotos().filter(function(x){return x.item!==i});
  f.push({label:ldItemName(i).slice(0,90),data:data,item:i});
  if(lkSaveFotos(f))render();
 });
});
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="ld-del"]');if(!b)return;
 var i=Number(b.dataset.v);lkSaveFotos(lkFotos().filter(function(x){return x.item!==i}));render();
});

/* ---------- Panggilan ke fungsi foto-drive ---------- */
async function ldCall(p){
 var cl=(Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
 var ex=await new Appwrite.Functions(cl).createExecution(CFG.FN_FOTO||'foto-drive',JSON.stringify(p),false,'/','POST',{'content-type':'application/json'});
 var out={};try{out=JSON.parse(ex.responseBody||'{}')}catch(e){}
 if(ex.responseStatusCode>=400||!out.ok){var er=new Error(out.error||('Fungsi foto-drive gagal (kode '+ex.responseStatusCode+')'));er.status=ex.responseStatusCode;throw er}
 return out;
}
/* Unggah ke Drive sebelum dokumen lkpd_bukti dibuat (dipanggil dari createOwned di pwa.js). */
async function ldUpload(o){
 if(!Cloud.on||LD.off||typeof o.data!=='string'||o.data.indexOf('data:')!==0)return;
 try{
  var r=await ldCall({action:'upload',data:o.data});
  LD.cache[r.fileId]=o.data;o.data='drive:'+r.fileId;
 }catch(e){
  if(e&&(e.code===404||/could not be found|not found/i.test(e.message||''))&&!e.status){LD.off=true;return}
  throw e;
 }
}
var _ldCreateOwned=createOwned;
createOwned=async function(db,col,o,F){if(col==='lkpd_bukti')await ldUpload(o);return _ldCreateOwned.apply(this,arguments)};

/* ---------- Menampilkan foto ---------- */
function ldPaint(id,src){
 document.querySelectorAll('img[data-fid="'+id+'"]').forEach(function(im){
  if(src){im.src=src;im.classList.remove('ld-wait','ld-fail')}else{im.classList.remove('ld-wait');im.classList.add('ld-fail');im.alt='Foto tidak dapat dimuat'}
 });
}
function ldFetch(id,lkpdId){
 if(LD.loading[id]||(LD.failed[id]&&Date.now()-LD.failed[id]<30000))return;
 LD.loading[id]=1;
 ldCall({action:'get',lkpdId:lkpdId,fileId:id}).then(function(r){LD.cache[id]=r.data;ldPaint(id,r.data)})
  .catch(function(e){LD.failed[id]=Date.now();ldPaint(id,null);toast((e&&e.message)||'Foto tidak dapat dimuat')})
  .then(function(){delete LD.loading[id]});
}
var LD_BLANK='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
function lkBuktiHtml(z){
 var b=lkBuktiAll(z.id).slice().sort(function(a,c){return ldParse(a).item-ldParse(c).item}),h='<h3>Foto bukti praktik</h3>';
 if(!b.length)return h+'<p class="note">'+(LK.loadingB===z.id?'Memuat foto bukti…':'Tidak ada foto bukti.')+'</p>';
 return h+'<div class="lk-fotos">'+b.map(function(x){
  var p=ldParse(x),d=String(x.data||''),fid='',src=d;
  if(d.indexOf('drive:')===0){fid=d.slice(6);src=LD.cache[fid]||'';if(!src)ldFetch(fid,z.id)}
  var cap=(p.item>=0?'Item '+(p.item+1)+' · ':'')+lkEsc(p.name);
  return '<figure class="lk-foto"><img '+(fid?'data-fid="'+lkEsc(fid)+'" ':'')+'class="'+(fid&&!src?'ld-wait':'')+'" src="'+(src||LD_BLANK)+'" alt="'+cap+'"><figcaption>'+cap+'</figcaption></figure>';
 }).join('')+'</div>';
}

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='.ld-cam{margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ld-btn{display:inline-flex;align-items:center;gap:6px;cursor:pointer}.ld-thumb{width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}.lk-foto img.ld-wait{min-height:110px;background:var(--line);animation:ldp 1.2s ease-in-out infinite}.lk-foto img.ld-fail{min-height:60px;background:var(--line)}@keyframes ldp{50%{opacity:.5}}';
 document.head.appendChild(s);
})();
