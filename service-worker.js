/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
/*build:fe5adb5f7bc7*/
var CACHE='tbsm-v2611251327';
var LOCAL=['./','index.html','manifest.json','manifest-df.json','manifest-medina.json','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','assets/logo-df.png','assets/logo-medina.png','assets/icon-df-192.png','assets/icon-df-512.png','assets/icon-medina-192.png','assets/icon-medina-512.png','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx','css/app.css?v=af70e2ac','css/banksoal.css?v=300450fd','js/config.js?v=2a1db95b','js/pustaka.js?v=34c32766','js/logo.js?v=4fc37542','js/sekolah.js?v=b43a795e','js/data.js?v=7da21601','js/util.js?v=2429e371','js/dialog.js?v=580e3480','js/core.js?v=e03e0723','js/neon-db.js?v=cdb532f0','js/export.js?v=33eb2959','js/views.js?v=e1c64abe','js/ukk-aturan.js?v=8ccaa495','js/lkpd-modul.js?v=fee9525f','js/lkpd-v2-x06.js?v=0b905aba','js/lkpd-v2-xi17.js?v=f8666dc6','js/lkpd-v2-xi18.js?v=0889ffa6','js/lkpd-v2-x12.js?v=919c6ed1','js/lkpd-v2-x18.js?v=525324b5','js/lkpd.js?v=4f98a8df','js/lkpd-kode.js?v=3030fa75','js/lkpd-v2.js?v=13b7beed','js/ui.js?v=d3a75588','js/nilai.js?v=40f03a44','js/pwa.js?v=de61146d','js/lkpd-kelas.js?v=15a382cb','js/lkpd-timer.js?v=a39bdd61','js/nav.js?v=c08b0411','js/observasi.js?v=c3bd203f','js/observasi-v2.js?v=b4f66eb2','js/akun-sandi.js?v=1d653041','js/lkpd-cetak.js?v=e777164f','js/lkpd-mode.js?v=ffaa8a9c','js/lkpd-pandu.js?v=6ef1ee9c','js/lkpd-kunci.js?v=de64852b','js/lkpd-rekap-mode.js?v=5988f670','js/kompetensi.js?v=3343a120','js/cek-sinkron.js?v=02fcc48e','js/hapus-nilai.js?v=305e3390','js/lkpd-drive.js?v=b17e391a','js/soal-tka.js?v=54730e7f','js/soal-lkpd/xi3.js?v=181d431b','js/lkpd-soal.js?v=e0c86af1','js/lkpd-v2-soal.js?v=ddb1533c','js/jam.js?v=f16589d1','js/banksoal.js?v=2e469051','js/ruang.js?v=2005aba2','js/banksoal-io.js?v=09aa508c','js/soal-gambar.js?v=1311384c','js/ujian-server.js?v=288ddb7f','js/sinkron-cepat.js?v=3d2b3949','js/siswa-ui.js?v=e26d27ef','js/cbt.js?v=aa71ed1f','js/neon-admin.js?v=549a295d','js/pra-unduh.js?v=1a0b84d3','js/cbt-staf.js?v=c228af2b','js/cetak-siswa.js?v=353b743c','js/label-proktor.js?v=c7c98e87','js/tebak-token.js?v=955a96ec','js/uraian.js?v=3218746b','js/back.js?v=dfb4b53d','js/lkpd-analisis.js?v=dd930316','js/lkpd-integritas.js?v=14850fe5','js/lkpd-editor.js?v=2080e101','js/lkpd-io.js?v=44172e36','js/lkpd-gambar.js?v=377c466e','js/lkpd-skala-gambar.js?v=2ee0febe','js/lkpd-format.js?v=f3bab8a3','js/soal-grup.js?v=c95a49e8','js/butir.js?v=892969d7','js/lkpd-staff.js?v=39b14545','js/lkpd-rekap-rapi.js?v=d0ba0a10','js/observasi-ukk.js?v=581c8311','js/ukk-akhir.js?v=10ff1630','js/akademik-data.js?v=aa2f2fab','js/akademik.js?v=39579e57','js/lkpd-elemen.js?v=b1d1d57e','js/menu-dasbor.js?v=db2aa645','js/ukk-kelola.js?v=212420d7','js/lkpd-samakan.js?v=7ec1f740','js/lkpd-v2-editor.js?v=b0cf6b5c','js/lkpd-v2-struktur.js?v=3ae63725','js/lkpd-master.js?v=613c9e17','js/ukk-xls.js?v=9f78c96b','js/nilai-analisis.js?v=4f9bd0e5','js/actions.js?v=38cf72d0','js/uji-waktu.js?v=ce2ed0da','js/ukk-foto.js?v=db0e35ba','js/ukk-pdf.js?v=02b55afd','js/ukk-butir.js?v=15808c0a','js/ukk-io.js?v=0a010076','js/cetak-uji.js?v=cdcd9aa3','js/cetak-soal.js?v=19afb113','js/cetak-riwayat.js?v=d71498bf','js/riwayat-hapus.js?v=afcaf110','js/bank-kelompok.js?v=57c64588','js/cp-peta.js?v=087de5f0','js/bank-cp.js?v=a24ab6b8','js/bank-bertingkat.js?v=ce789135','js/bank-pilihan.js?v=df572ccf','js/bank-tata.js?v=41d64980','js/bank-filter.js?v=33fba16b','js/kepsek.js?v=45aff61d','js/pengawas.js?v=b72915d1','js/hasil-izin.js?v=6ac6e18f','js/lkpd-hapus.js?v=7ee93aa0','js/lkpd-rekap-kelas.js?v=3b97d0c4'];
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
