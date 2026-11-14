/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
/*build:4e1cd0a495d8*/
var CACHE='tbsm-v2611141429';
var LOCAL=['./','index.html','manifest.json','manifest-df.json','manifest-medina.json','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','assets/logo-df.png','assets/logo-medina.png','assets/icon-df-192.png','assets/icon-df-512.png','assets/icon-medina-192.png','assets/icon-medina-512.png','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx','css/app.css?v=3a60d6e7','css/banksoal.css?v=495f28a6','js/config.js?v=533935b2','js/logo.js?v=4fc37542','js/sekolah.js?v=5560ecd2','js/data.js?v=7da21601','js/util.js?v=2429e371','js/dialog.js?v=580e3480','js/core.js?v=142510ee','js/export.js?v=633ab720','js/views.js?v=f6e37ee1','js/ukk-aturan.js?v=63f3da01','js/lkpd-modul.js?v=9cb1f516','js/lkpd.js?v=e5e0a36b','js/ui.js?v=084df5b1','js/nilai.js?v=40f03a44','js/pwa.js?v=675b1a75','js/lkpd-kelas.js?v=9b12732c','js/lkpd-timer.js?v=5c1fffc4','js/nav.js?v=2bae3a83','js/observasi.js?v=d9da96cb','js/akun-sandi.js?v=1d653041','js/lkpd-cetak.js?v=388f1707','js/lkpd-mode.js?v=29cf1385','js/lkpd-rekap-mode.js?v=a552fb43','js/kompetensi.js?v=49847b64','js/cek-sinkron.js?v=1346e33c','js/lkpd-drive.js?v=08e589f4','js/soal-tka.js?v=8f3949cd','js/soal-lkpd/x1.js?v=f6225f82','js/soal-lkpd/x2.js?v=761c6620','js/soal-lkpd/x3.js?v=dfed69f1','js/soal-lkpd/x4.js?v=5bbd097b','js/soal-lkpd/x5.js?v=1574c4b0','js/soal-lkpd/x6.js?v=b7c04aab','js/soal-lkpd/xi1.js?v=c3140711','js/soal-lkpd/xi2.js?v=93345485','js/soal-lkpd/xi3.js?v=b29784d5','js/soal-lkpd/xi4.js?v=108c84e6','js/soal-lkpd/xi5.js?v=57712bcc','js/soal-lkpd/xi6.js?v=5d16f5e6','js/soal-lkpd/xi7.js?v=e08a1eaf','js/soal-lkpd/xi8.js?v=34dd8070','js/soal-lkpd/xii1.js?v=491e52f5','js/soal-lkpd/xii2.js?v=cd9bf38d','js/soal-lkpd/xii3.js?v=2877e38e','js/soal-lkpd/xii4.js?v=00e4b556','js/soal-lkpd/xii5.js?v=f567d475','js/soal-lkpd/xii6.js?v=b9c8a8c5','js/soal-lkpd/xii7.js?v=b437fcb5','js/lkpd-soal.js?v=1580ee16','js/jam.js?v=f16589d1','js/banksoal.js?v=5c5eba7a','js/banksoal-io.js?v=46bd1b22','js/ujian-server.js?v=4b201489','js/sinkron-cepat.js?v=8e86d031','js/siswa-ui.js?v=e628a027','js/back.js?v=e8e96c23','js/lkpd-analisis.js?v=7a2a2148','js/lkpd-integritas.js?v=1e6b043d','js/lkpd-editor.js?v=748112b8','js/lkpd-io.js?v=4d04fa4c','js/lkpd-staff.js?v=17480a82','js/lkpd-rekap-rapi.js?v=5d4f1fae','js/observasi-ukk.js?v=985fc76f','js/menu-dasbor.js?v=469bba98','js/ukk-kelola.js?v=218baa8a','js/ukk-xls.js?v=047b749e','js/nilai-analisis.js?v=4f9bd0e5','js/actions.js?v=509d183e','js/uji-waktu.js?v=d49010fc','js/ukk-foto.js?v=f11e24df','js/ukk-pdf.js?v=a848f55a','js/cetak-uji.js?v=cdcd9aa3','js/hasil-izin.js?v=474af542'];
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
  e.respondWith(fetch(r,{cache:'no-cache'}).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res
  }).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(r.mode==='navigate'?caches.match('index.html'):Response.error())})}));
  return;
 }
 if(CDNHOST.indexOf(u.hostname)>-1){
  e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){
   if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res})}));
 }
});
