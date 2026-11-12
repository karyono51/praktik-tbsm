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
function ldReq(i){var m=lkmCur();return !!(m&&Array.isArray(m.fotoWajib)&&m.fotoWajib.indexOf(i)>-1)}
function ldRowCam(i){
 var f=lkFotos(),k=-1;f.forEach(function(x,j){if(x.item===i)k=j});
 var req=ldReq(i)?' <span class="pill '+(k>-1?'ok':'warn')+'">Foto wajib</span>':'';
 if(k>-1)return '<div class="ld-cam"><img class="ld-thumb" src="'+f[k].data+'" alt="Foto bukti '+lkEsc(f[k].label)+'"><button type="button" class="btn small" data-act="ld-cam" data-v="'+i+'">'+svg(ICO.camera,16)+' Foto ulang</button><button type="button" class="btn small danger" data-act="ld-del" data-v="'+i+'">Hapus foto</button>'+req+'</div>';
 return '<div class="ld-cam"><button type="button" class="btn small ld-btn" data-act="ld-cam" data-v="'+i+'" title="Ambil foto bukti dengan kamera">'+svg(ICO.camera,16)+' Ambil foto</button>'+req+'</div>';
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

/* Kamera langsung (getUserMedia): foto hanya bisa diambil saat itu juga, tidak dari galeri.
   Bila kamera langsung tidak tersedia (izin ditolak, peramban lama), tombol cadangan memakai input capture="environment",
   yang membuka aplikasi kamera perangkat. */
function ldOpenCam(cb){
 var ov=document.createElement('div'),stream=null,facing='environment',closed=false;
 ov.className='ld-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Ambil foto bukti');
 ov.innerHTML='<div class="ld-box"><video playsinline autoplay muted></video><p class="note ld-msg"></p><div class="ld-bar"><button type="button" class="btn" data-c="x">Batal</button><button type="button" class="btn" data-c="f" hidden>Balik kamera</button><button type="button" class="btn primary" data-c="s" disabled>Ambil foto</button><label class="btn primary" data-c="fb" hidden>Buka kamera<input type="file" accept="image/*" capture="environment" hidden></label></div></div>';
 document.body.appendChild(ov);
 var vid=ov.querySelector('video'),msg=ov.querySelector('.ld-msg'),bs=ov.querySelector('[data-c="s"]'),bf=ov.querySelector('[data-c="f"]'),fb=ov.querySelector('[data-c="fb"]');
 function stop(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}}
 function close(){if(closed)return;closed=true;stop();ov.remove()}
 function fallback(why){stop();vid.hidden=true;bs.hidden=true;bf.hidden=true;fb.hidden=false;msg.textContent=why+' Tekan Buka kamera untuk memakai aplikasi kamera perangkat.'}
 function start(){
  stop();bs.disabled=true;msg.textContent='Membuka kamera…';
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1080}},audio:false}).then(function(s2){
   if(closed){s2.getTracks().forEach(function(t){t.stop()});return}
   stream=s2;vid.srcObject=s2;vid.play&&vid.play().catch(function(){});bs.disabled=false;msg.textContent='Arahkan kamera ke komponen, lalu tekan Ambil foto.';
   navigator.mediaDevices.enumerateDevices&&navigator.mediaDevices.enumerateDevices().then(function(d){bf.hidden=d.filter(function(x){return x.kind==='videoinput'}).length<2}).catch(function(){});
  }).catch(function(e){fallback(e&&e.name==='NotAllowedError'?'Izin kamera ditolak.':'Kamera tidak bisa dibuka.')});
 }
 ov.addEventListener('click',function(e){
  var b=e.target.closest('[data-c]');if(!b)return;var c=b.dataset.c;
  if(c==='x')close();
  else if(c==='f'){facing=facing==='environment'?'user':'environment';start()}
  else if(c==='s'){
   if(!vid.videoWidth)return;
   var cv=document.createElement('canvas');cv.width=vid.videoWidth;cv.height=vid.videoHeight;cv.getContext('2d').drawImage(vid,0,0);
   cv.toBlob(function(bl){close();if(bl)cb(bl);else toast('Foto gagal diambil. Coba lagi.')},'image/jpeg',.92);
  }
 });
 ov.querySelector('input').addEventListener('change',function(e){var f=e.target.files&&e.target.files[0];close();if(f)cb(f)});
 if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.isSecureContext))fallback('Kamera langsung tidak didukung di peramban ini.');
 else start();
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="ld-cam"]');if(!b)return;
 var v=b.dataset.v;
 if(v==='x'){
  if(ldGen(lkFotos())>=3){toast('Maksimal 3 foto tambahan');return}
  var sel=document.getElementById('lk-foto-label'),label=sel?sel.value:LK_FOTO_LABEL[0];
  ldOpenCam(function(file){ldCompress(file,function(data){
   if(!data){toast('Foto tidak dapat diproses. Coba lagi.');return}
   var f=lkFotos();if(ldGen(f)>=3){toast('Maksimal 3 foto tambahan');return}
   f.push({label:label,data:data});if(lkSaveFotos(f))render();
  })});
  return;
 }
 var i=Number(v);
 ldOpenCam(function(file){ldCompress(file,function(data){
  if(!data){toast('Foto tidak dapat diproses. Coba lagi.');return}
  var f=lkFotos().filter(function(x){return x.item!==i});
  f.push({label:ldItemName(i).slice(0,90),data:data,item:i});
  if(lkSaveFotos(f))render();
 })});
});
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="ld-del"]');if(!b)return;
 var i=Number(b.dataset.v);lkSaveFotos(lkFotos().filter(function(x){return x.item!==i}));render();
});

/* Foto wajib: modul dapat mewajibkan foto pada item tertentu (module.fotoWajib = daftar indeks komponen). Diatur guru/admin lewat Pengaturan modul. */
var _ldSubmit=lkSubmit;
lkSubmit=function(){
 if(!isStaff()){
  var m=lkmCur();
  if(m&&Array.isArray(m.fotoWajib)&&m.fotoWajib.length){
   var f=lkFotos(),miss=m.fotoWajib.filter(function(i){return m.checks[i]&&!f.some(function(x){return x.item===i})});
   if(miss.length){
    LK.tab='kerja';render();
    toast('Foto wajib belum lengkap ('+miss.length+'): '+miss.slice(0,3).map(function(i){return m.checks[i][0]}).join(', ')+(miss.length>3?', dan lainnya':''));
    return;
   }
  }
 }
 return _ldSubmit.apply(this,arguments);
};

/* ---------- Panggilan ke fungsi foto-drive ---------- */
async function ldCall(p){
 var cl=(Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
 var ex=await new Appwrite.Functions(cl).createExecution(CFG.FN_FOTO||'foto-drive',JSON.stringify(p),false,'/','POST',{'content-type':'application/json'});
 var out={};try{out=JSON.parse(ex.responseBody||'{}')}catch(e){}
 if(ex.responseStatusCode>=400||!out.ok){var er=new Error(out.error||('Fungsi foto-drive gagal (kode '+ex.responseStatusCode+')'));er.status=ex.responseStatusCode;throw er}
 return out;
}
/* Nama berkas di Drive: Kelas_Nama-Siswa_IdModul_K03-Komponen_20261112-1345_xxxx (K<nomor item> atau Tambahan-<keterangan>). */
function ldSlug(x,n){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,n)}
function ldFileName(o){
 var u=(S.users||[]).filter(function(x){return x.id===o.sid})[0]||S.user||{},p=ldParse(o),d=new Date(o.ts||Date.now());
 function z(n){return (n<10?'0':'')+n}
 var stamp=d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes());
 var part=p.item>=0?'K'+z(p.item+1)+'-'+ldSlug(p.name,30):'Tambahan-'+ldSlug(p.name,30);
 return [ldSlug(u.kelas,8),ldSlug(u.nama,30),ldSlug(o.moduleId,20),part,stamp,ldSlug(String(o.id||'').slice(-4),4)].filter(Boolean).join('_');
}
/* Unggah ke Drive sebelum dokumen lkpd_bukti dibuat (dipanggil dari createOwned di pwa.js). */
async function ldUpload(o){
 if(!Cloud.on||LD.off||typeof o.data!=='string'||o.data.indexOf('data:')!==0)return;
 try{
  var r=await ldCall({action:'upload',data:o.data,nama:ldFileName(o)});
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
 s.textContent='.ld-cam{margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ld-btn{display:inline-flex;align-items:center;gap:6px;cursor:pointer}.ld-thumb{width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid var(--line)}.lk-foto img.ld-wait{min-height:110px;background:var(--line);animation:ldp 1.2s ease-in-out infinite}.lk-foto img.ld-fail{min-height:60px;background:var(--line)}@keyframes ldp{50%{opacity:.5}}.ld-ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:12px}.ld-box{background:var(--card,#fff);color:var(--text,#111);border-radius:14px;padding:12px;width:min(520px,100%);display:grid;gap:10px;max-height:100%}.ld-box video{width:100%;max-height:60vh;background:#000;border-radius:10px;object-fit:contain}.ld-box video[hidden]{display:none}.ld-bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.ld-msg{margin:0}';
 document.head.appendChild(s);
})();
