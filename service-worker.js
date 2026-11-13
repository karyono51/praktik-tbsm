/* service-worker.js: cache cangkang aplikasi agar bisa dibuka offline. Data Appwrite tidak pernah di-cache. */
var CACHE='tbsm-v79';
var LOCAL=['./','index.html','manifest.json','css/app.css','css/banksoal.css','assets/logo.jpg','assets/icon-192.png','assets/icon-512.png','js/config.js','js/logo.js','js/data.js','js/util.js','js/dialog.js','js/core.js','js/export.js','js/views.js','js/lkpd-modul.js','js/lkpd.js','js/ui.js','js/siswa-ui.js','js/back.js','js/lkpd-analisis.js','js/lkpd-integritas.js','js/lkpd-editor.js','js/lkpd-io.js','js/lkpd-staff.js','js/lkpd-rekap-rapi.js','js/menu-dasbor.js','js/actions.js','js/cetak-uji.js','js/ukk-kelola.js','js/uji-waktu.js','js/hasil-izin.js','js/nilai.js','js/pwa.js','js/lkpd-kelas.js','js/lkpd-timer.js','js/nav.js','js/observasi.js','js/akun-sandi.js','js/lkpd-cetak.js','js/lkpd-mode.js','js/lkpd-rekap-mode.js','js/kompetensi.js','js/cek-sinkron.js','js/lkpd-drive.js','js/soal-tka.js','js/soal-lkpd/x1.js','js/soal-lkpd/x2.js','js/soal-lkpd/x3.js','js/soal-lkpd/x4.js','js/soal-lkpd/x5.js','js/soal-lkpd/x6.js','js/soal-lkpd/xi1.js','js/soal-lkpd/xi2.js','js/soal-lkpd/xi3.js','js/soal-lkpd/xi4.js','js/soal-lkpd/xi5.js','js/soal-lkpd/xi6.js','js/soal-lkpd/xi7.js','js/soal-lkpd/xi8.js','js/soal-lkpd/xii1.js','js/soal-lkpd/xii2.js','js/soal-lkpd/xii3.js','js/soal-lkpd/xii4.js','js/soal-lkpd/xii5.js','js/soal-lkpd/xii6.js','js/soal-lkpd/xii7.js','js/lkpd-soal.js','js/banksoal.js','js/banksoal-io.js','js/jam.js','js/ujian-server.js','js/sinkron-cepat.js','templates/Template_Impor_Bank_Soal.xlsx','templates/Template_Impor_LKPD.xlsx'];
var CDN=['https://cdn.jsdelivr.net/npm/appwrite@16.0.2/dist/iife/sdk.js','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'];
var CDNHOST=['cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){
  return Promise.all(LOCAL.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){})}).concat(CDN.map(function(u){return c.add(u).catch(function(){})})))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);
 if(u.origin===location.origin){
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
