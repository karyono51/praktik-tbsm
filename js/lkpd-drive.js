/* lkpd-drive.js: foto bukti praktik per item pemeriksaan (ikon kamera) dan penyimpanan di Google Drive.
   - Foto per item diambil dari tabel Hasil pemeriksaan (satu foto per item). Bagian "Foto tambahan" tetap ada (maksimal 3).
   - Saat disinkronkan ke Appwrite, foto diunggah lewat Appwrite Function `foto-drive` ke Google Drive. Database hanya menyimpan
     penanda `drive:<fileId>` di kolom data. Label foto per item berbentuk `c<nomor>|<nama komponen>`.
   - Bila fungsi foto-drive belum dipasang, foto disimpan di database seperti sebelumnya (tidak ada yang hilang).
   - Foto yang tersimpan di Drive ditampilkan lewat fungsi yang sama (guru/admin, atau pemilik foto). */
var LD={cache:{},loading:{},failed:{},off:false,MAXC:100000,SIDE:800};
ICO.camera='<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';
ICO.close='<path d="M6 6l12 12M18 6L6 18"/>';
ICO.flip='<path d="M4 9a8 8 0 0 1 14-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M4 20v-4h4"/>';
ICO.trash='<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/>';
ICO.retake='<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>';

function ldGen(f){return f.filter(function(x){return x.item===undefined}).length}
function ldParse(x){var m=/^c(\d+)\|([\s\S]*)$/.exec(x.label||'');return m?{item:+m[1],name:m[2]}:{item:-1,name:x.label||''}}
function ldItemName(i){var m=(window.LKPD_MODULES||[]).filter(function(x){return x.id===LK.module})[0];return m&&m.checks&&m.checks[i]?String(m.checks[i][0]):'Item '+(i+1)}

/* ---------- Kamera per item (form siswa) ---------- */
function ldReq(i){var m=lkmCur();return !!(m&&Array.isArray(m.fotoWajib)&&m.fotoWajib.indexOf(i)>-1)}
function ldIb(act,ico,label,v,cls){return '<button type="button" class="btn small ld-ib'+(cls?' '+cls:'')+'" data-act="'+act+'" data-v="'+v+'" aria-label="'+label+'" title="'+label+'">'+svg(ICO[ico],18)+'</button>'}
function ldRowCam(i){
 var f=lkFotos(),k=-1;f.forEach(function(x,j){if(x.item===i)k=j});
 var req=ldReq(i)?'<span class="pill '+(k>-1?'ok':'warn')+'">Foto wajib</span>':'';
 if(k>-1)return '<div class="ld-cam"><img class="ld-thumb ld-zoom" src="'+f[k].data+'" alt="Foto bukti '+lkEsc(f[k].label)+'">'+ldIb('ld-cam','retake','Foto ulang',i)+ldIb('ld-del','trash','Hapus foto',i,'danger')+req+'</div>';
 return '<div class="ld-cam">'+ldIb('ld-cam','camera','Ambil foto bukti',i)+req+'</div>';
}
function ldCompress(file,cb){
 var img=new Image(),url=URL.createObjectURL(file);
 img.onerror=function(){URL.revokeObjectURL(url);cb(null)};
 img.onload=function(){
  var side=LD.SIDE,out=null;
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
 ov.innerHTML='<div class="ld-box"><video playsinline autoplay muted></video><p class="note ld-msg"></p><div class="ld-bar"><button type="button" class="ld-rb" data-c="x" aria-label="Batal" title="Batal">'+svg(ICO.close,22)+'</button><button type="button" class="ld-shot" data-c="s" disabled aria-label="Ambil foto" title="Ambil foto"><i></i></button><button type="button" class="ld-rb" data-c="f" hidden aria-label="Balik kamera" title="Balik kamera">'+svg(ICO.flip,22)+'</button><label class="ld-rb ld-open" data-c="fb" hidden aria-label="Buka kamera" title="Buka kamera">'+svg(ICO.camera,24)+'<input type="file" accept="image/*" capture="environment" hidden></label></div></div>';
 document.body.appendChild(ov);
 var vid=ov.querySelector('video'),msg=ov.querySelector('.ld-msg'),bs=ov.querySelector('[data-c="s"]'),bf=ov.querySelector('[data-c="f"]'),fb=ov.querySelector('[data-c="fb"]');
 function stop(){if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}}
 function close(){if(closed)return;closed=true;stop();ov.remove()}
 function fallback(why){stop();vid.hidden=true;bs.hidden=true;bf.hidden=true;fb.hidden=false;msg.textContent=why+' Ketuk ikon kamera untuk memakai aplikasi kamera perangkat.'}
 function start(){
  stop();bs.disabled=true;msg.textContent='Membuka kamera…';
  navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1080}},audio:false}).then(function(s2){
   if(closed){s2.getTracks().forEach(function(t){t.stop()});return}
   stream=s2;vid.srcObject=s2;vid.play&&vid.play().catch(function(){});bs.disabled=false;msg.textContent='Arahkan kamera ke komponen.';
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
function ldImgHtml(x,zid,cls){
 var p=ldParse(x),d=String(x.data||''),fid='',src=d;
 if(d.indexOf('drive:')===0){fid=d.slice(6);src=LD.cache[fid]||'';if(!src)ldFetch(fid,zid)}
 var cap=(p.item>=0?'Item '+(p.item+1)+' · ':'')+lkEsc(p.name);
 return '<img '+(fid?'data-fid="'+lkEsc(fid)+'" ':'')+'class="ld-zoom '+cls+(fid&&!src?' ld-wait':'')+'" src="'+(src||LD_BLANK)+'" alt="'+cap+'" loading="lazy">';
}
/* Foto bukti langsung di baris item pada tabel Hasil pemeriksaan (detail LKPD). Dipanggil dari lkDetailBody. */
function ldDetailFoto(z,i){
 var b=lkBuktiAll(z.id).filter(function(x){return ldParse(x).item===i});
 if(!b.length)return LK.loadingB===z.id?'<small class="ld-note">Memuat foto…</small>':'';
 return '<div class="ld-itemfoto">'+b.map(function(x){return ldImgHtml(x,z.id,'ld-th')}).join('')+'</div>';
}
/* Foto yang tidak terkait item (foto tambahan, atau item yang sudah tidak ada di modul). */
function lkBuktiHtml(z){
 var m=(window.LKPD_MODULES||[]).filter(function(x){return x.id===z.moduleId})[0],n=m&&m.checks?m.checks.length:0,all=lkBuktiAll(z.id);
 var extra=all.filter(function(x){var it=ldParse(x).item;return it<0||it>=n}).sort(function(a,c){return ldParse(a).item-ldParse(c).item});
 if(!extra.length){
  if(all.length)return '';
  return '<h3>Foto bukti praktik</h3><p class="note">'+(LK.loadingB===z.id?'Memuat foto bukti…':'Tidak ada foto bukti.')+'</p>';
 }
 return '<h3>Foto tambahan</h3><div class="lk-fotos">'+extra.map(function(x){
  var p=ldParse(x),cap=(p.item>=0?'Item '+(p.item+1)+' · ':'')+lkEsc(p.name);
  return '<figure class="lk-foto">'+ldImgHtml(x,z.id,'')+'<figcaption>'+cap+'</figcaption></figure>';
 }).join('')+'</div>';
}

/* Perbesar foto: ketuk gambar kecil untuk melihat penuh, ketuk di mana saja atau tekan Esc untuk menutup. */
document.addEventListener('click',function(e){
 var im=e.target.closest&&e.target.closest('img.ld-zoom');
 if(!im||im.classList.contains('ld-wait')||im.classList.contains('ld-fail')||im.getAttribute('src')===LD_BLANK)return;
 e.preventDefault();
 var ov=document.createElement('div');ov.className='ld-ov ld-lb';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Foto bukti');
 ov.innerHTML='<figure><img alt=""><figcaption></figcaption></figure><button type="button" class="ld-rb" aria-label="Tutup" title="Tutup">'+svg(ICO.close,22)+'</button>';
 ov.querySelector('img').src=im.src;ov.querySelector('img').alt=im.alt||'';ov.querySelector('figcaption').textContent=im.alt||'';
 function end(){document.removeEventListener('keydown',key,true);ov.remove()}
 function key(ev){if(ev.key==='Escape'){ev.stopPropagation();end()}}
 document.addEventListener('keydown',key,true);ov.addEventListener('click',end);document.body.appendChild(ov);
 ov.querySelector('button').focus();
});

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='[hidden]{display:none!important}'+
  '.ld-cam{margin-top:6px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.ld-ib{padding:6px 9px;line-height:0}.ld-ib svg{display:block}'+
  '.ld-thumb{width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid var(--line);cursor:zoom-in}'+
  '.ld-itemfoto{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.ld-th{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--line);cursor:zoom-in;display:block}'+
  '.ld-th.ld-wait,.ld-th.ld-fail{background:var(--line)}.ld-note{color:var(--muted)}'+
  '.lk-fotos{grid-template-columns:repeat(auto-fill,minmax(92px,1fr))!important;gap:8px!important}.lk-foto img{aspect-ratio:1;object-fit:cover;cursor:zoom-in}'+
  '.lk-foto img.ld-wait{min-height:92px;background:var(--line);animation:ldp 1.2s ease-in-out infinite}.lk-foto img.ld-fail{min-height:60px;background:var(--line)}.ld-th.ld-wait{animation:ldp 1.2s ease-in-out infinite}@keyframes ldp{50%{opacity:.5}}'+
  '.ld-ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:12px}'+
  '.ld-box{background:#0d0f0e;color:#fff;border-radius:18px;padding:10px 10px 14px;width:min(480px,100%);display:grid;gap:10px;max-height:100%}'+
  '.ld-box video{width:100%;max-height:68vh;background:#000;border-radius:12px;object-fit:contain}.ld-msg{margin:0;text-align:center;color:#c9d4cd;font-size:13px}.ld-msg:empty{display:none}'+
  '.ld-bar{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;padding:2px 10px}.ld-bar>[data-c=x]{grid-column:1;justify-self:start}.ld-bar>[data-c=s],.ld-bar>[data-c=fb]{grid-column:2}.ld-bar>[data-c=f]{grid-column:3;justify-self:end}'+
  '.ld-rb{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.12);color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer}.ld-rb:hover{background:rgba(255,255,255,.2)}'+
  '.ld-rb.ld-open{width:64px;height:64px;background:var(--accent);border-color:var(--accent);color:var(--onc,#fff)}'+
  '.ld-shot{width:68px;height:68px;border-radius:50%;border:4px solid #fff;background:transparent;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}.ld-shot i{width:48px;height:48px;border-radius:50%;background:#fff;display:block;transition:transform .1s}.ld-shot:active:not(:disabled) i{transform:scale(.88)}.ld-shot:disabled{opacity:.4;cursor:not-allowed}'+
  '.ld-lb{flex-direction:column;cursor:zoom-out}.ld-lb figure{margin:0;display:grid;gap:8px;justify-items:center;max-width:100%}.ld-lb img{max-width:100%;max-height:80vh;border-radius:10px;object-fit:contain}.ld-lb figcaption{color:#e4ece7;font-size:13px;text-align:center}.ld-lb .ld-rb{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px}'+
  '@media print{.ld-th{width:2.2cm;height:2.2cm}.ld-ib,.ld-cam .btn{display:none!important}}';
 document.head.appendChild(s);
})();
