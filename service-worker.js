/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
/*build:51be70efc1a0*/
var CACHE='tbsm-v2611170653';
var LOCAL=['./','index.html','manifest.json','manifest-df.json','manifest-medina.json','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','assets/logo-df.png','assets/logo-medina.png','assets/icon-df-192.png','assets/icon-df-512.png','assets/icon-medina-192.png','assets/icon-medina-512.png','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx','css/app.css?v=8ec466cf','css/banksoal.css?v=177a6e7b','js/config.js?v=3179dd36','js/pustaka.js?v=34c32766','js/logo.js?v=4fc37542','js/sekolah.js?v=b43a795e','js/data.js?v=7da21601','js/util.js?v=2429e371','js/dialog.js?v=580e3480','js/core.js?v=8d8ccfe6','js/export.js?v=0dfdd8d9','js/views.js?v=6c8d6cee','js/ukk-aturan.js?v=8ccaa495','js/lkpd-modul.js?v=9cb1f516','js/lkpd.js?v=9b428c30','js/ui.js?v=674adac8','js/nilai.js?v=40f03a44','js/pwa.js?v=524e388c','js/lkpd-kelas.js?v=5162023f','js/lkpd-timer.js?v=5c1fffc4','js/nav.js?v=23bc7a39','js/observasi.js?v=c3bd203f','js/akun-sandi.js?v=1d653041','js/lkpd-cetak.js?v=91adba54','js/lkpd-mode.js?v=59650dff','js/lkpd-rekap-mode.js?v=5988f670','js/kompetensi.js?v=3343a120','js/cek-sinkron.js?v=02fcc48e','js/hapus-nilai.js?v=305e3390','js/lkpd-drive.js?v=4d8c28f7','js/soal-tka.js?v=8f3949cd','js/soal-lkpd/x1.js?v=f6225f82','js/soal-lkpd/x2.js?v=761c6620','js/soal-lkpd/x3.js?v=dfed69f1','js/soal-lkpd/x4.js?v=5bbd097b','js/soal-lkpd/x5.js?v=1574c4b0','js/soal-lkpd/x6.js?v=b7c04aab','js/soal-lkpd/xi1.js?v=c3140711','js/soal-lkpd/xi2.js?v=93345485','js/soal-lkpd/xi3.js?v=4d7e8aad','js/soal-lkpd/xi4.js?v=108c84e6','js/soal-lkpd/xi5.js?v=57712bcc','js/soal-lkpd/xi6.js?v=5d16f5e6','js/soal-lkpd/xi7.js?v=e08a1eaf','js/soal-lkpd/xi8.js?v=34dd8070','js/soal-lkpd/xii1.js?v=491e52f5','js/soal-lkpd/xii2.js?v=cd9bf38d','js/soal-lkpd/xii3.js?v=2877e38e','js/soal-lkpd/xii4.js?v=00e4b556','js/soal-lkpd/xii5.js?v=f567d475','js/soal-lkpd/xii6.js?v=b9c8a8c5','js/soal-lkpd/xii7.js?v=b437fcb5','js/lkpd-soal.js?v=e0c86af1','js/jam.js?v=f16589d1','js/banksoal.js?v=329d85c9','js/banksoal-io.js?v=6abc1e83','js/soal-gambar.js?v=1311384c','js/ujian-server.js?v=3a0c3e89','js/sinkron-cepat.js?v=3d2b3949','js/siswa-ui.js?v=e26d27ef','js/cbt.js?v=8547552b','js/cbt-staf.js?v=10915b57','js/uraian.js?v=3218746b','js/back.js?v=dfb4b53d','js/lkpd-analisis.js?v=f2523403','js/lkpd-integritas.js?v=d01a884a','js/lkpd-editor.js?v=119fc019','js/lkpd-io.js?v=44172e36','js/lkpd-gambar.js?v=377c466e','js/soal-grup.js?v=c95a49e8','js/butir.js?v=892969d7','js/lkpd-staff.js?v=1363e336','js/lkpd-rekap-rapi.js?v=d0ba0a10','js/observasi-ukk.js?v=6a9b5a26','js/ukk-akhir.js?v=10ff1630','js/akademik-data.js?v=37d45ee5','js/akademik.js?v=026d9fef','js/lkpd-elemen.js?v=b1d1d57e','js/menu-dasbor.js?v=7bf4fa2f','js/ukk-kelola.js?v=458e552f','js/lkpd-samakan.js?v=7ec1f740','js/ukk-xls.js?v=9f78c96b','js/nilai-analisis.js?v=4f9bd0e5','js/actions.js?v=38cf72d0','js/uji-waktu.js?v=a8896741','js/ukk-foto.js?v=6de78bda','js/ukk-pdf.js?v=02b55afd','js/ukk-butir.js?v=15808c0a','js/ukk-io.js?v=0a010076','js/cetak-uji.js?v=cdcd9aa3','js/cetak-soal.js?v=19afb113','js/cetak-riwayat.js?v=d71498bf','js/bank-kelompok.js?v=57c64588','js/cp-peta.js?v=f70c410c','js/bank-cp.js?v=a24ab6b8','js/bank-bertingkat.js?v=ce789135','js/bank-pilihan.js?v=cb592344','js/bank-filter.js?v=33fba16b','js/kepsek.js?v=5056063e','js/hasil-izin.js?v=6ac6e18f','js/lkpd-hapus.js?v=7ee93aa0','js/lkpd-rekap-kelas.js?v=3b97d0c4'];
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
