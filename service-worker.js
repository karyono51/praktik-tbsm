/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
/*build:391a1018c5ec*/
var CACHE='tbsm-v2611230514';
var LOCAL=['./','index.html','manifest.json','manifest-df.json','manifest-medina.json','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','assets/logo-df.png','assets/logo-medina.png','assets/icon-df-192.png','assets/icon-df-512.png','assets/icon-medina-192.png','assets/icon-medina-512.png','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx','css/app.css?v=b03770d0','css/banksoal.css?v=300450fd','js/config.js?v=5acba2c0','js/pustaka.js?v=34c32766','js/logo.js?v=4fc37542','js/sekolah.js?v=b43a795e','js/data.js?v=7da21601','js/util.js?v=2429e371','js/dialog.js?v=580e3480','js/core.js?v=e03e0723','js/export.js?v=33eb2959','js/views.js?v=e1c64abe','js/ukk-aturan.js?v=8ccaa495','js/lkpd-modul.js?v=f7d47b50','js/lkpd-v2-x07.js?v=14ad89d7','js/lkpd.js?v=4340ba56','js/lkpd-v2.js?v=8c554a05','js/ui.js?v=d3a75588','js/nilai.js?v=40f03a44','js/pwa.js?v=9136f00f','js/lkpd-kelas.js?v=46a3ca42','js/lkpd-timer.js?v=5c1fffc4','js/nav.js?v=55638c50','js/observasi.js?v=c3bd203f','js/observasi-v2.js?v=dee6ab8a','js/akun-sandi.js?v=1d653041','js/lkpd-cetak.js?v=c5ae6e27','js/lkpd-mode.js?v=2d18e6aa','js/lkpd-pandu.js?v=ee763759','js/lkpd-kunci.js?v=eb9b1588','js/lkpd-rekap-mode.js?v=5988f670','js/kompetensi.js?v=3343a120','js/cek-sinkron.js?v=02fcc48e','js/hapus-nilai.js?v=305e3390','js/lkpd-drive.js?v=b17e391a','js/soal-tka.js?v=54730e7f','js/soal-lkpd/xi3.js?v=181d431b','js/lkpd-soal.js?v=e0c86af1','js/lkpd-v2-soal.js?v=ddb1533c','js/jam.js?v=f16589d1','js/banksoal.js?v=cf567954','js/ruang.js?v=2005aba2','js/banksoal-io.js?v=09aa508c','js/soal-gambar.js?v=1311384c','js/ujian-server.js?v=3a0c3e89','js/sinkron-cepat.js?v=3d2b3949','js/siswa-ui.js?v=e26d27ef','js/cbt.js?v=e27f103c','js/pra-unduh.js?v=1a0b84d3','js/cbt-staf.js?v=c228af2b','js/cetak-siswa.js?v=353b743c','js/label-proktor.js?v=c7c98e87','js/tebak-token.js?v=955a96ec','js/uraian.js?v=3218746b','js/back.js?v=dfb4b53d','js/lkpd-analisis.js?v=9394c9af','js/lkpd-integritas.js?v=a954da5c','js/lkpd-editor.js?v=cb7ef7a3','js/lkpd-io.js?v=44172e36','js/lkpd-gambar.js?v=377c466e','js/lkpd-skala-gambar.js?v=be14883d','js/lkpd-format.js?v=1f1ff3ba','js/soal-grup.js?v=c95a49e8','js/butir.js?v=892969d7','js/lkpd-staff.js?v=6d144736','js/lkpd-rekap-rapi.js?v=d0ba0a10','js/observasi-ukk.js?v=581c8311','js/ukk-akhir.js?v=10ff1630','js/akademik-data.js?v=6bd13640','js/akademik.js?v=58052f58','js/lkpd-elemen.js?v=b1d1d57e','js/menu-dasbor.js?v=db2aa645','js/ukk-kelola.js?v=212420d7','js/lkpd-samakan.js?v=7ec1f740','js/lkpd-v2-editor.js?v=a522de34','js/lkpd-master.js?v=c4b78427','js/ukk-xls.js?v=9f78c96b','js/nilai-analisis.js?v=4f9bd0e5','js/actions.js?v=38cf72d0','js/uji-waktu.js?v=ce2ed0da','js/ukk-foto.js?v=db0e35ba','js/ukk-pdf.js?v=02b55afd','js/ukk-butir.js?v=15808c0a','js/ukk-io.js?v=0a010076','js/cetak-uji.js?v=cdcd9aa3','js/cetak-soal.js?v=19afb113','js/cetak-riwayat.js?v=d71498bf','js/riwayat-hapus.js?v=afcaf110','js/bank-kelompok.js?v=57c64588','js/cp-peta.js?v=087de5f0','js/bank-cp.js?v=a24ab6b8','js/bank-bertingkat.js?v=ce789135','js/bank-pilihan.js?v=df572ccf','js/bank-tata.js?v=41d64980','js/bank-filter.js?v=33fba16b','js/kepsek.js?v=45aff61d','js/pengawas.js?v=b72915d1','js/hasil-izin.js?v=6ac6e18f','js/lkpd-hapus.js?v=7ee93aa0','js/lkpd-rekap-kelas.js?v=3b97d0c4'];
var CDN=['https://cdn.jsdelivr.net/npm/appwrite@16.0.2/dist/iife/sdk.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'];
var VERSIONED=/\.(?:js|css)\?v=[0-9a-f]+$/;
var CDNHOST=['cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){
  return Promise.all(LOCAL.map(function(u){
   /* alamat ?v=<hash> tidak pernah berubah isinya: pakai salinan di cache lama bila ada, unduh hanya yang baru */
   if(VERSIONED.test(u))return caches.match(u).then(function(m){return m?c.put(u,m):c.add(u)}).catch(function(){});
   return c.add(new Request(u,{cache:'reload'})).catch(function(){})}).concat(CDN.map(function(u){return c.add(u).catch(function(){})})))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
  if(VERSIONED.test(u.pathname+u.search)){
   /* berkas berversi hash: cache dulu, tanpa tanya server tiap dibuka */
   e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){
    if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res
   }).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(x){return x||Response.error()})})}));
   return;
  }
  /* jaringan dulu agar versi terbaru cepat sampai, tetapi bila lebih dari 3 detik tanpa jawaban (sinyal sekolah lemah)
     pakai salinan di perangkat; unduhan tetap berjalan dan memperbarui cache untuk pembukaan berikutnya */
  var dariCache=function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(r.mode==='navigate'?caches.match('index.html'):Response.error())})};
  var jar=fetch(r,{cache:'no-cache'}).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res
  });
  var lambat=new Promise(function(ok){setTimeout(function(){caches.match(r,{ignoreSearch:true}).then(function(m){ok(m||null)})},3000)});
  e.respondWith(Promise.race([jar.catch(function(){return null}),lambat]).then(function(res){return res||jar.catch(dariCache)}).then(function(res){return res||dariCache()}));
  e.waitUntil(jar.catch(function(){}));
  return;
 }
 if(CDNHOST.indexOf(u.hostname)>-1){
  e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){
   if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res})}));
 }
});
