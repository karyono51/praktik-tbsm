/* pantau-db.js: monitoring penggunaan database Appwrite per perangkat.
   Appwrite menghitung tiap dokumen yang dibaca (Database Reads). Modul ini mencatat, per hari dan per koleksi,
   berapa dokumen dibaca, ditulis, dan dihapus oleh perangkat ini, lalu menampilkannya di Cek sinkronisasi.
   - Penghitung disimpan di localStorage (kunci tbsm-dbuse), 14 hari terakhir, hanya di perangkat ini.
   - Batas peringatan opsional: APP_CONFIG.DB_BATAS_BACA (dokumen dibaca per hari per perangkat). Tanpa nilai, tidak ada peringatan.
   - Meminta penyimpanan persisten agar antrean offline tidak dibuang peramban saat ruang perangkat menipis.
   Dimuat setelah sinkron-cepat.js (agar yang dihitung adalah panggilan jaringan sebenarnya) dan sebelum actions.js. */
var PDB={KEY:'tbsm-dbuse',HARI:14,w0:0};
function pdbHari(t){var d=new Date(t||Date.now());return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function pdbBaca(){try{var j=JSON.parse(localStorage.getItem(PDB.KEY)||'null');if(j&&j.h)return j}catch(e){}return {h:{}}}
function pdbSimpan(j){
 try{var ks=Object.keys(j.h).sort();while(ks.length>PDB.HARI){delete j.h[ks.shift()]}localStorage.setItem(PDB.KEY,JSON.stringify(j))}catch(e){}}
/* catat satu panggilan: jenis r (baca), w (tulis), d (hapus); n = jumlah dokumen */
function pdbCatat(kol,jenis,n){
 try{
  var j=PDB.cache||(PDB.cache=pdbBaca()),h=pdbHari(),x=j.h[h]||(j.h[h]={});
  var k=x[kol]||(x[kol]={r:0,w:0,d:0,q:0});
  k[jenis]+=Math.max(0,n|0);if(jenis==='r')k.q++;
  /* simpan paling sering tiap 2 detik agar ringan */
  var t=Date.now();if(t-PDB.w0>2000){PDB.w0=t;pdbSimpan(j)}else if(!PDB.tm){PDB.tm=setTimeout(function(){PDB.tm=0;PDB.w0=Date.now();pdbSimpan(j)},2200)}
  pdbPeringatan(x);
 }catch(e){}}
function pdbTotal(x,jenis){var s=0;Object.keys(x||{}).forEach(function(c){s+=x[c][jenis]||0});return s}
function pdbBatas(){var b=Number((window.APP_CONFIG||{}).DB_BATAS_BACA);return b>0?b:0}
function pdbPeringatan(x){
 var b=pdbBatas();if(!b)return;
 var r=pdbTotal(x,'r'),hari=pdbHari();
 if(r>=b*0.8&&PDB.warn!==hari){PDB.warn=hari;try{toast('Pembacaan database perangkat ini hari ini '+r+' dokumen, mendekati batas '+b+'. Kurangi membuka daftar besar berulang kali.')}catch(e){}}}
/* ringkasan untuk uji dan tampilan: hari ini, tujuh hari, koleksi terbanyak */
function pdbRingkas(){
 var j=PDB.cache||(PDB.cache=pdbBaca()),hari=pdbHari(),x=j.h[hari]||{};
 var ks=Object.keys(j.h).sort().slice(-7),minggu=0;ks.forEach(function(k){minggu+=pdbTotal(j.h[k],'r')});
 var kol=Object.keys(x).map(function(c){return {kol:c,r:x[c].r,w:x[c].w,d:x[c].d,q:x[c].q}}).sort(function(a,b){return b.r-a.r});
 return {hari:hari,baca:pdbTotal(x,'r'),tulis:pdbTotal(x,'w'),hapus:pdbTotal(x,'d'),minggu:minggu,batas:pdbBatas(),kol:kol,
  seri:Object.keys(j.h).sort().map(function(k){return {hari:k,baca:pdbTotal(j.h[k],'r')}})}}
function pdbReset(){PDB.cache={h:{}};pdbSimpan(PDB.cache);PDB.warn=''}
function pdbKartu(){
 if(typeof Cloud==='undefined'||!Cloud.on)return '';
 var r=pdbRingkas(),b=r.batas,pr=b?Math.min(100,Math.round(r.baca*100/b)):0;
 var h='<section class="card"><h3>Penggunaan database perangkat ini</h3><div class="kv" style="display:grid;gap:6px">'+
  '<div class="row sb"><span class="note">Dokumen dibaca hari ini</span><b>'+r.baca+(b?' / '+b:'')+'</b></div>'+
  (b?'<div style="height:6px;border-radius:3px;background:var(--line,#ddd)"><div style="height:6px;border-radius:3px;width:'+pr+'%;background:'+(pr>=80?'var(--bad,#c33)':'var(--ok,#2a7)')+'"></div></div>':'')+
  '<div class="row sb"><span class="note">Ditulis · dihapus hari ini</span><b>'+r.tulis+' · '+r.hapus+'</b></div>'+
  '<div class="row sb"><span class="note">Dokumen dibaca 7 hari terakhir</span><b>'+r.minggu+'</b></div>'+
  ((Cloud.dupN||Cloud.badN)?'<div class="row sb"><span class="note">Antrean dibersihkan (ganda · ID tidak sah)</span><b>'+(Cloud.dupN||0)+' · '+(Cloud.badN||0)+'</b></div>':'')+
  '</div>';
 if(r.kol.length)h+='<ul class="plain note" style="margin-top:8px">'+r.kol.slice(0,6).map(function(k){return '<li>'+esc(k.kol)+': '+k.r+' dibaca dalam '+k.q+' permintaan</li>'}).join('')+'</ul>';
 h+='<p class="note">Angka ini hanya dari perangkat ini. Total proyek ada di konsol Appwrite (Usage). Atur batas peringatan lewat DB_BATAS_BACA di config.js.</p>'+
  '<div class="row"><button type="button" class="btn small" data-act="pdb-reset">Atur ulang penghitung</button></div></section>';
 return h}
(function(){
 if(typeof Cloud==='undefined'||!Cloud.on)return;
 var i0=Cloud.init;
 Cloud.init=function(){
  i0.apply(this,arguments);
  var db=this.db;if(!db||db.__pdb)return;db.__pdb=1;
  var f=db.listDocuments;
  if(typeof f==='function')db.listDocuments=function(d,kol){return f.apply(db,arguments).then(function(r){pdbCatat(kol,'r',Math.max(1,(r&&r.documents&&r.documents.length)||0));return r},function(e){pdbCatat(kol,'r',1);throw e})};
  var g=db.getDocument;
  if(typeof g==='function')db.getDocument=function(d,kol){return g.apply(db,arguments).then(function(r){pdbCatat(kol,'r',1);return r},function(e){pdbCatat(kol,'r',1);throw e})};
  [['createDocument','w'],['updateDocument','w'],['deleteDocument','d']].forEach(function(p){
   var m=db[p[0]];if(typeof m!=='function')return;
   db[p[0]]=function(d,kol){return m.apply(db,arguments).then(function(r){pdbCatat(kol,p[1],1);return r})}});
 };
 /* kartu di halaman Cek sinkronisasi */
 if(typeof viewSinkron==='function'){var v0=viewSinkron;viewSinkron=function(){var h=v0.apply(this,arguments);return h+(typeof ckUser==='function'&&ckUser()?pdbKartu():'')}}
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-act="pdb-reset"]');if(!b)return;pdbReset();try{render()}catch(x){}});
 /* penyimpanan persisten: antrean offline tidak dibuang peramban bila ruang menipis */
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(function(p){if(!p)navigator.storage.persist().catch(function(){})}).catch(function(){})}catch(e){}
 window.addEventListener('pagehide',function(){try{if(PDB.cache)pdbSimpan(PDB.cache)}catch(e){}});
})();
