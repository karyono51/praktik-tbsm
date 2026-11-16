/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
/*build:2d5c17da13f3*/
var CACHE='tbsm-v2611160734';
var LOCAL=['./','index.html','manifest.json','manifest-df.json','manifest-medina.json','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','assets/logo-df.png','assets/logo-medina.png','assets/icon-df-192.png','assets/icon-df-512.png','assets/icon-medina-192.png','assets/icon-medina-512.png','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx','css/app.css?v=3a60d6e7','css/banksoal.css?v=8ca6aaee','js/config.js?v=3179dd36','js/pustaka.js?v=34c32766','js/logo.js?v=4fc37542','js/sekolah.js?v=5560ecd2','js/data.js?v=7da21601','js/util.js?v=2429e371','js/dialog.js?v=580e3480','js/core.js?v=8d8ccfe6','js/export.js?v=0dfdd8d9','js/views.js?v=50af0be5','js/ukk-aturan.js?v=8ccaa495','js/lkpd-modul.js?v=9cb1f516','js/lkpd.js?v=e5e0a36b','js/ui.js?v=674adac8','js/nilai.js?v=40f03a44','js/pwa.js?v=524e388c','js/lkpd-kelas.js?v=9b12732c','js/lkpd-timer.js?v=5c1fffc4','js/nav.js?v=23bc7a39','js/observasi.js?v=d9da96cb','js/akun-sandi.js?v=1d653041','js/lkpd-cetak.js?v=388f1707','js/lkpd-mode.js?v=29cf1385','js/lkpd-rekap-mode.js?v=a552fb43','js/kompetensi.js?v=49847b64','js/cek-sinkron.js?v=1346e33c','js/hapus-nilai.js?v=3f9b3b4c','js/lkpd-drive.js?v=fa27538e','js/soal-tka.js?v=8f3949cd','js/soal-lkpd/x1.js?v=f6225f82','js/soal-lkpd/x2.js?v=761c6620','js/soal-lkpd/x3.js?v=dfed69f1','js/soal-lkpd/x4.js?v=5bbd097b','js/soal-lkpd/x5.js?v=1574c4b0','js/soal-lkpd/x6.js?v=b7c04aab','js/soal-lkpd/xi1.js?v=c3140711','js/soal-lkpd/xi2.js?v=93345485','js/soal-lkpd/xi3.js?v=b29784d5','js/soal-lkpd/xi4.js?v=108c84e6','js/soal-lkpd/xi5.js?v=57712bcc','js/soal-lkpd/xi6.js?v=5d16f5e6','js/soal-lkpd/xi7.js?v=e08a1eaf','js/soal-lkpd/xi8.js?v=34dd8070','js/soal-lkpd/xii1.js?v=491e52f5','js/soal-lkpd/xii2.js?v=cd9bf38d','js/soal-lkpd/xii3.js?v=2877e38e','js/soal-lkpd/xii4.js?v=00e4b556','js/soal-lkpd/xii5.js?v=f567d475','js/soal-lkpd/xii6.js?v=b9c8a8c5','js/soal-lkpd/xii7.js?v=b437fcb5','js/lkpd-soal.js?v=521a75b1','js/jam.js?v=f16589d1','js/banksoal.js?v=99cff75e','js/banksoal-io.js?v=6abc1e83','js/soal-gambar.js?v=1311384c','js/ujian-server.js?v=3a0c3e89','js/sinkron-cepat.js?v=3d2b3949','js/siswa-ui.js?v=e628a027','js/cbt.js?v=8547552b','js/cbt-staf.js?v=10915b57','js/uraian.js?v=3218746b','js/back.js?v=dfb4b53d','js/lkpd-analisis.js?v=774f44c6','js/lkpd-integritas.js?v=f5ff9b60','js/lkpd-editor.js?v=add7d38a','js/lkpd-io.js?v=830e9f48','js/lkpd-gambar.js?v=f2912401','js/soal-grup.js?v=c95a49e8','js/butir.js?v=892969d7','js/lkpd-staff.js?v=5283dae1','js/lkpd-rekap-rapi.js?v=5d4f1fae','js/observasi-ukk.js?v=985fc76f','js/ukk-akhir.js?v=b5567a5d','js/akademik-data.js?v=37d45ee5','js/akademik.js?v=8e7406b3','js/menu-dasbor.js?v=7bf4fa2f','js/ukk-kelola.js?v=94950bb3','js/ukk-xls.js?v=fc35e7bb','js/nilai-analisis.js?v=4f9bd0e5','js/actions.js?v=f9258b74','js/uji-waktu.js?v=a8896741','js/ukk-foto.js?v=6de78bda','js/ukk-pdf.js?v=a848f55a','js/ukk-butir.js?v=9f5076f2','js/ukk-io.js?v=710b2018','js/cetak-uji.js?v=cdcd9aa3','js/cetak-soal.js?v=19afb113','js/bank-filter.js?v=b1a5b2e1','js/kepsek.js?v=5056063e','js/hasil-izin.js?v=6ac6e18f','js/lkpd-hapus.js?v=7ee93aa0','js/lkpd-rekap-kelas.js?v=3b97d0c4'];
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
