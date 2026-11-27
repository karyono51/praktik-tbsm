/* rute.js: tiap menu punya alamat (#rekap-nilai) dan judul tab sendiri. Dimuat PALING AKHIR.
   - Alamat bisa ditandai (bookmark) atau dibagikan. Setelah masuk, menu dibuka HANYA bila barisnya ada di laci
     untuk peran aktif; hak akses tetap diatur modul masing-masing.
   - Alamat ditulis dengan replaceState (riwayat tidak bertambah), jadi tombol back HP (back.js) tidak berubah.
   - Di Safe Exam Browser / Exambro alamat tidak disentuh (hash Config Key dan startURL harus tetap).
   - Menu di balik login tidak diindeks mesin pencari; halaman publik untuk SEO adalah index.html dan tentang.html. */
(function(){
 var TUNGGU='tbsm-rute',JUDUL_AWAL=document.title;
 function kunci(){
  if(window.SafeExamBrowser)return true;
  var ua=String(navigator.userAgent||''),k=String((window.CFG&&(CFG.EXAMBRO_UA+','+CFG.SEB_UA))||'SEB/,SEB_iOS,TBSM-EXAM').split(',');
  /* "Version/4.0" juga dipakai WebView biasa: di sana alamat berhash tidak berguna, jadi ikut dilewati */
  return k.some(function(x){x=x.trim();return x&&ua.indexOf(x)>-1});
 }
 function slugDari(id){
  var m=/^(lkpd|kelas):(.+)$/.exec(id);
  if(m)return (m[1]==='lkpd'?'lkpd-':'ukk-')+'kelas-'+m[2].toLowerCase();
  return MENU_ITEM[id]?MENU_ITEM[id][0]:'';
 }
 function idDari(slug){
  var m=/^(lkpd|ukk)-kelas-([a-z0-9]+)$/.exec(slug);
  if(m)return (m[1]==='lkpd'?'lkpd:':'kelas:')+m[2].toUpperCase();
  for(var id in MENU_ITEM)if(slug&&MENU_ITEM[id][0]===slug)return id;
  return '';
 }
 function bersih(h){var s=String(h||'').replace(/^.*#/,'').toLowerCase();return idDari(s)||s==='beranda'?s:''}
 function simpan(s){try{if(s)sessionStorage.setItem(TUNGGU,s);else sessionStorage.removeItem(TUNGGU)}catch(e){}}
 function baca(){try{return sessionStorage.getItem(TUNGGU)||''}catch(e){return ''}}
 function idAktif(){
  if(S.tab==='lkpd')return 'lkpd:'+S.kelas;
  if(S.tab==='katalog')return 'kelas:'+S.kelas;
  return S.tab;
 }
 function tulis(slug){
  var url=location.pathname+location.search+(slug?'#'+slug:'');
  if(url!==location.pathname+location.search+location.hash)history.replaceState(history.state,'',url);
 }
 function namaHalaman(id){
  var m=/^(lkpd|kelas):(.+)$/.exec(id);
  if(m)return (m[1]==='lkpd'?'LKPD Kelas ':'UKK Kelas ')+m[2];
  return MENU_ITEM[id]?MENU_ITEM[id][1]:'';
 }
 function sinkron(){
  if(!S.user)return;
  var id=idAktif(),nama=V.mode==='exam'?'Penilaian praktik':V.mode==='result'?'Hasil penilaian':namaHalaman(id);
  var sk=typeof schCfg==='function'&&schCfg();
  document.title=(nama?nama+' | ':'')+'KBM Praktik TBSM'+(sk?' '+sk.nama:'');
  if(V.mode==='list'&&!kunci())tulis(slugDari(id));
 }
 /* buka menu dari alamat: lewat jalur klik menu yang sama (cek kelas, konfirmasi hasil belum disimpan) */
 function buka(slug){
  if(!S.user)return;
  var id=slug==='beranda'?'beranda':idDari(slug);
  var r=id&&document.querySelector('#drawer .srow[data-act="menu"][data-v="'+id+'"]');
  if(!r){if(id)toast('Menu itu tidak tersedia untuk peran aktif');sinkron();return}
  if(id!==idAktif()||V.mode!=='list')r.click();else sinkron();
 }
 var awal=bersih(location.hash);if(awal)simpan(awal);
 var sedang=false,pernahMasuk=false,pernahKeluar=false;
 var lama=render;
 render=function(){
  var r=lama.apply(this,arguments);
  try{
   if(!S.user){
    document.title=JUDUL_AWAL;
    /* keluar: bersihkan alamat agar akun berikutnya mulai dari Beranda */
    if(pernahMasuk){pernahMasuk=false;pernahKeluar=true;simpan('');tulis('')}
   }else{
    pernahMasuk=true;
    var t=!sedang&&baca();
    if(t){simpan('');sedang=true;try{buka(t)}finally{sedang=false}}
    else if(!sedang)sinkron();
   }
  }catch(e){if(window.console)console.warn('rute',e)}
  return r;
 };
 /* Alamat diketik atau tautan #... diklik membuat entri riwayat baru (state kosong).
    Mundur ke entri lama (back.js, laci menu) punya state: cukup samakan lagi alamatnya dengan halaman yang tampil. */
 var baru=false;
 window.addEventListener('popstate',function(e){
  baru=!e.state;
  /* laci ditutup saat keluar: entri lama masih membawa alamat menu, bersihkan lagi */
  if(!S.user){if(pernahKeluar&&!kunci())setTimeout(function(){if(!S.user)tulis('')},0);return}
  if(!baru)setTimeout(function(){try{sinkron()}catch(x){}},0);
 });
 window.addEventListener('hashchange',function(e){
  var ketik=baru;baru=false;
  if(!S.user||kunci())return;
  if(!ketik){sinkron();return}
  /* siswa yang sedang ujian tidak boleh dipindah lewat alamat */
  if(typeof bkUjian==='function'&&bkUjian()){sinkron();return}
  var s=bersih(e.newURL.indexOf('#')>-1?e.newURL:'');
  if(s)buka(s);else sinkron();
 });
 /* login Google: alamat kembali tanpa bagian #; tujuan tetap diingat di sessionStorage */
 if(typeof Cloud!=='undefined')Cloud.google=function(){var u=location.href.split('#')[0];this.acc.createOAuth2Session('google',u,u)};
})();
