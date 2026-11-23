/* lkpd-timer.js: pengatur waktu LKPD (hitung maju, merah bila melewati target menit). Waktu tersimpan per siswa dan modul.
   - Mode Latihan: Mulai/Jeda/Lanjut bebas. Bila siswa kembali mengisi LKPD saat timer terjeda, timer otomatis jalan lagi.
   - Mode Ujian (siswa): tombol Jeda dikunci. Timer berbasis jam dinding (waktu mulai disimpan), jadi terus berjalan
     walau halaman ditutup atau dimuat ulang, sampai LKPD dikirim. Guru dan admin (termasuk pratinjau) tidak dikunci. */
var LKT={key:'',sec:0,running:false,iv:null,t0:0};
function lktLocked(){var m=typeof lkmCur==='function'?lkmCur():null;return !!(m&&!isStaff()&&lkmCfg(m).mode==='ujian')}
function lktSec(){var m2=typeof lkmCur==='function'?lkmCur():null;if(m2&&m2.v2&&m2.v2.pertemuan&&typeof lkcTotal==='function')return lkcTotal(m2);if(LKT.t0&&lktLocked())return Math.max(0,Math.floor((Date.now()-LKT.t0)/1000));return LKT.sec}
function lktStore(){return 'tbsm-lkpd-timer-'+LKT.key}
function lktSave(){try{if(LKT.key){var o={sec:LKT.sec,at:Date.now()};if(LKT.t0)o.t0=LKT.t0;localStorage.setItem(lktStore(),JSON.stringify(o))}}catch(e){}}
function lktMmss(n){var m=Math.floor(n/60),s=n%60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s}
function lktLimit(){var m=(LKPD_MODULES||[]).find(function(x){return x.id===LK.module});if(!m)return 0;if(typeof lkmCfg==='function'&&lkmCfg(m).mode==='latihan')return 0;/* Latihan: waktu bebas, tidak merah */return (typeof lkmSesiMenit==='function'?lkmSesiMenit(m):Number(m.duration)||0)*60}
function lktTarget(m){
 if(!m)return 'Target - menit';
 var sesi=typeof lkmSesiMenit==='function'?lkmSesiMenit(m):Number(m.duration)||0,v2=!!(m.v2&&m.v2.pertemuan),
  lat=typeof lkmCfg==='function'&&lkmCfg(m).mode==='latihan';
 return (lat?'Perkiraan ':'Target ')+lkEsc(sesi)+' menit'+(v2?(typeof lkmPraktik==='function'&&lkmPraktik(m)?' praktik (semua kegiatan)':' per pertemuan'):'')+(lat?' · waktu bebas':'');
}
function lktBtnText(){if(LKT.running)return lktLocked()?'Berjalan (terkunci)':'Jeda';return LKT.sec>0?'Lanjut':'Mulai waktu'}
function lktPaint(){
 var el=document.getElementById('lk-clock'),b=document.getElementById('lk-tbtn');
 if(el){el.textContent=lktMmss(LKT.sec);var lim=lktLimit();el.classList.toggle('over',lim>0&&LKT.sec>lim)}
 if(b){b.textContent=lktBtnText();b.disabled=LKT.running&&lktLocked();b.title=b.disabled?'Waktu ujian tidak bisa dijeda':''}
}
function lktStop(){if(LKT.iv){clearInterval(LKT.iv);LKT.iv=null}LKT.running=false;lktSave()}
function lktStart(){
 if(LKT.iv||!LKT.key)return;
 LKT.running=true;
 if(lktLocked()&&!LKT.t0)LKT.t0=Date.now()-LKT.sec*1000;
 LKT.iv=setInterval(function(){
  if(lktLocked()&&LKT.t0)LKT.sec=Math.max(0,Math.floor((Date.now()-LKT.t0)/1000));else LKT.sec++;
  if(LKT.sec%5===0)lktSave();lktPaint();
 },1000);
 lktSave();lktPaint();
}
function lktReset(){lktStop();LKT.sec=0;LKT.t0=0;try{if(LKT.key)localStorage.removeItem(lktStore())}catch(e){}lktPaint()}
function lktSync(){
 if(!document.getElementById('lk-clock')){if(LKT.key)lktStop();LKT.key='';return}
 var key=S.user.id+'|'+LK.module;
 if(LKT.key!==key){
  lktStop();LKT.key=key;LKT.sec=0;LKT.t0=0;
  try{
   var j=JSON.parse(localStorage.getItem(lktStore())||'null');
   /* Data waktu yang lebih tua dari pengiriman terakhir adalah sisa lama: buang, jangan dilanjutkan. */
   var lr=(S.lkpd||[]).filter(function(x){return x.sid===S.user.id&&x.moduleId===LK.module}).reduce(function(a,x){return Math.max(a,x.ts||0)},0);
   if(j&&lr&&((j.t0&&j.t0<lr)||(j.at&&j.at<lr))){j=null;localStorage.removeItem(lktStore())}
   if(j&&j.sec>0){LKT.sec=j.sec;if(j.t0)LKT.t0=j.t0}
  }catch(e){}
  /* Ujian: waktu yang sudah dimulai tidak boleh berhenti. Hitung ulang dari jam dinding dan jalankan lagi. */
  if(lktLocked()&&(LKT.t0||LKT.sec>0)){if(!LKT.t0)LKT.t0=Date.now()-LKT.sec*1000;LKT.sec=Math.floor((Date.now()-LKT.t0)/1000);lktStart()}
 }
 lktPaint();
}
(function(){
 var render0=render;render=function(){render0();lktSync();if(typeof lkcSync==='function')lkcSync()};
 var vw=viewLKPD;
 viewLKPD=function(){
  var h=vw();
  if(h.indexOf('<div class="lk-actions">')<0)return h;
  var m=(LKPD_MODULES||[]).find(function(x){return x.id===LK.module});
  if(m&&m.v2&&m.v2.pertemuan)return h; /* LKPD v2: pewaktu ada di tiap kartu pertemuan (lkcRow) */
  var row='<div class="lk-timer"><div><div class="mono lk-clock" id="lk-clock">'+lktMmss(LKT.sec)+'</div><div class="note">'+lktTarget(m)+(lktLocked()?' · waktu ujian tidak bisa dijeda':'')+'</div></div><button type="button" class="btn small" data-act="lkt-toggle" id="lk-tbtn"'+(LKT.running&&lktLocked()?' disabled':'')+'>'+lktBtnText()+'</button></div>';
  return h.replace('<div class="lk-actions">','<div class="lk-actions">'+row);
 };
 var sub=lkSubmit;
 lkSubmit=function(){
  var n=(S.lkpd||[]).length,sk='tbsm-lkpd-timer-'+(S.user?S.user.id:'')+'|'+LK.module;
  sub();
  if((S.lkpd||[]).length>n){
   /* Setelah terkirim halaman pindah ke Riwayat dan lktSync sudah mengosongkan LKT.key, jadi hapus data waktu lewat kunci yang dicatat sebelum kirim. */
   lktReset();try{localStorage.removeItem(sk)}catch(e){}
  }
 };
 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-act="lkt-toggle"]');if(!b)return;
  if(LKT.running){if(lktLocked())return;lktStop()}else lktStart();
  lktPaint();
 });
 /* Mengisi LKPD: memulai timer, dan melanjutkannya bila terjeda (Latihan). Ujian: memulai bila belum jalan. */
 function auto(e){
  var t=e.target;
  if(!t.matches||!t.matches('[data-lk-field],[data-lk-check],[data-lk-answer],[data-lk-yn]'))return;
  if(!LKT.running)lktStart();
 }
 document.addEventListener('input',auto);
 document.addEventListener('change',auto);
 window.addEventListener('pagehide',lktSave);
})();

/* ---------- Pewaktu per kartu pertemuan (LKPD v2) ----------
   Tiap kartu Lembar Kerja punya pewaktu sendiri dan mengisi kolom "Waktu aktual" (menit) otomatis.
   Ujian (siswa): mulai otomatis saat kartu pertama diisi atau lewat Mulai; tidak bisa dijeda; berbasis jam dinding sehingga tetap berjalan
   walau halaman ditutup; berhenti hanya lewat Selesai (atau saat Kirim) dan setelah itu tidak bisa dimulai lagi. Hanya satu kartu berjalan.
   Kolom waktu terkunci (readonly) agar tidak diketik manual. Latihan: Mulai/Jeda/Lanjut bebas dan kolom boleh diedit. */
var LKCT={iv:null,m:{}};
function lkcMod(){return typeof lkmCur==='function'?lkmCur():null}
function lkcSk(m,key){return 'tbsm-lkpd-ct-'+(S.user?S.user.id:'')+'|'+m.id+'|'+key}
function lkcGet(m,key){
 var k=lkcSk(m,key),o=LKCT.m[k];
 if(!o){o={sec:0,t0:0,run:false,done:false};try{var j=JSON.parse(localStorage.getItem(k)||'null');if(j){o.sec=j.sec||0;o.t0=j.t0||0;o.done=!!j.done}}catch(e){}LKCT.m[k]=o}
 return o}
function lkcSave(m,key){try{var o=lkcGet(m,key);localStorage.setItem(lkcSk(m,key),JSON.stringify({sec:o.sec,t0:o.t0,done:o.done,at:Date.now()}))}catch(e){}}
function lkcCards(m){var out=[];if(!m||!m.v2||!m.v2.pertemuan||typeof lk2Kartu!=='function')return out;m.v2.pertemuan.forEach(function(p){if(p.sembunyi)return;lk2Kartu(m.v2,p).forEach(function(c){if(c.ks&&c.ks.length)out.push(c)})});return out}
function lkcRO(m,key){var o=lkcGet(m,key);return lktLocked()&&(o.run||o.done||o.sec>0)}
function lkcTotal(m){return lkcCards(m).reduce(function(a,c){return a+lkcSecNow(m,c.key)},0)}
function lkcSecNow(m,key){var o=lkcGet(m,key);if(o.run&&lktLocked()&&o.t0)return Math.max(0,Math.floor((Date.now()-o.t0)/1000));return o.sec}
function lkcMin(sec){return sec>0?String(Math.max(1,Math.round(sec/60))):''}
function lkcRunning(m){var r=null;lkcCards(m).forEach(function(c){if(lkcGet(m,c.key).run)r=c});return r}
function lkcRow(m,c,kecil){
 if(!c.ks||!c.ks.length)return '';
 var o=lkcGet(m,c.key);
 if(kecil)return '<div class="lk-timer lk-ct lk-ct-s" data-ct="'+c.key+'" data-lim="'+(Number(c.menit)||0)*60+'"'+(lktLocked()?' title="Waktu tidak bisa dijeda"':'')+'><span class="mono lk-clock" data-ct-clock="'+c.key+'">'+lktMmss(lkcSecNow(m,c.key))+'</span><button type="button" class="btn small" data-act="lkc-toggle" data-key="'+c.key+'" data-ct-btn="'+c.key+'">'+lkcBtn(m,c.key)+'</button></div>';
 return '<div class="lk-timer lk-ct" data-ct="'+c.key+'" data-lim="'+(Number(c.menit)||0)*60+'"><div><div class="mono lk-clock" data-ct-clock="'+c.key+'">'+lktMmss(lkcSecNow(m,c.key))+'</div><div class="note">Pewaktu kartu ini · target '+lkEsc(c.menit)+' menit'+(lktLocked()?' · tidak bisa dijeda':'')+'</div></div><button type="button" class="btn small" data-act="lkc-toggle" data-key="'+c.key+'" data-ct-btn="'+c.key+'">'+lkcBtn(m,c.key)+'</button></div>'}
function lkcBtn(m,key){
 var o=lkcGet(m,key);
 if(lktLocked())return o.done?'Selesai':o.run?'Selesai kegiatan':'Mulai waktu';
 return o.run?'Jeda':o.sec>0?'Lanjut':'Mulai waktu'}
function lkcPaint(){
 var m=lkcMod();if(!m||!m.v2)return;
 lkcCards(m).forEach(function(c){
  var o=lkcGet(m,c.key),s=lkcSecNow(m,c.key),el=document.querySelector('[data-ct-clock="'+c.key+'"]'),b=document.querySelector('[data-ct-btn="'+c.key+'"]'),f=document.querySelector('[data-lk-field="'+c.key+'"]');
  if(el){el.textContent=lktMmss(s);el.classList.toggle('over',lktLocked()&&c.menit>0&&s>c.menit*60)}
  if(b){b.textContent=lkcBtn(m,c.key);b.disabled=!!(lktLocked()&&o.done)}
  if(f){if(lktLocked()&&(o.run||o.done||o.sec>0)){f.value=lkcMin(s);f.readOnly=true}else if(o.run&&!f.value)f.value=lkcMin(s)}
 })}
function lkcStop(m,key,fin){
 var o=lkcGet(m,key);o.sec=lkcSecNow(m,key);o.run=false;if(fin)o.done=true;lkcSave(m,key);
 if(!lkcRunning(m)&&LKCT.iv){clearInterval(LKCT.iv);LKCT.iv=null}}
function lkcStart(m,key){
 var o=lkcGet(m,key);if(o.run||o.done&&lktLocked())return false;
 var r=lkcRunning(m);if(r&&r.key!==key){if(lktLocked()){toast('Selesaikan dulu pewaktu '+(r.judul||'kartu sebelumnya'));return false}lkcStop(m,r.key,false)}
 o.run=true;if(lktLocked())o.t0=Date.now()-o.sec*1000;lkcSave(m,key);
 if(!LKCT.iv)LKCT.iv=setInterval(function(){var mm=lkcMod();if(!mm){clearInterval(LKCT.iv);LKCT.iv=null;return}lkcCards(mm).forEach(function(c){var q=lkcGet(mm,c.key);if(q.run){if(!lktLocked())q.sec++;else q.sec=lkcSecNow(mm,c.key)}});lkcPaint();if(!lkcRunning(mm)){clearInterval(LKCT.iv);LKCT.iv=null}},1000);
 return true}
/* Kartu dipilih (lk2Buka): pewaktu kartu itu mulai sendiri. Tidak mulai bila sudah berjalan, sudah Selesai (Ujian), mode cetak, atau ada kartu lain yang berjalan di Ujian (lkcStart memberi pesan). */
function lkcAutoMulai(key){
 var m=lkcMod();if(!m||!m.v2||!m.v2.pertemuan||(typeof LK2!=='undefined'&&LK2.cetak))return false;
 var ada=lkcCards(m).some(function(c){return c.key===key});if(!ada)return false;
 var o=lkcGet(m,key);if(o.run||(o.done&&lktLocked()))return false;
 var ok=lkcStart(m,key);lkcPaint();return ok}
function lkcSync(){
 var m=lkcMod();if(!m||!m.v2||!m.v2.pertemuan||!document.querySelector('[data-ct]'))return;
 /* Ujian: pewaktu yang sudah dimulai tetap berjalan setelah halaman dimuat ulang. */
 lkcCards(m).forEach(function(c){var o=lkcGet(m,c.key);if(lktLocked()&&o.t0&&!o.done&&!o.run&&o.sec>0){o.run=true}});
 if(lkcRunning(m)&&!LKCT.iv){var r=lkcRunning(m);var o2=lkcGet(m,r.key);o2.run=false;lkcStart(m,r.key)}
 lkcPaint()}
function lkcClear(m){lkcCards(m).forEach(function(c){var k=lkcSk(m,c.key);delete LKCT.m[k];try{localStorage.removeItem(k)}catch(e){}});if(LKCT.iv){clearInterval(LKCT.iv);LKCT.iv=null}}
(function(){
 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-act="lkc-toggle"]');if(!b)return;
  var m=lkcMod();if(!m)return;var key=b.dataset.key,o=lkcGet(m,key);
  if(lktLocked()){if(o.done)return;if(o.run){if(!uiOk('lkcdone:'+key,'Selesaikan kegiatan ini?\nWaktu berhenti dan tidak bisa dilanjutkan.',function(){var m2=lkcMod();if(m2){lkcStop(m2,key,true);lkcPaint()}},{ok:'Selesai'}))return;lkcStop(m,key,true)}else lkcStart(m,key)}
  else{if(o.run)lkcStop(m,key,false);else lkcStart(m,key)}
  lkcPaint()});
 /* Mengisi kartu memulai pewaktunya (bila belum ada kartu lain yang berjalan). */
 function auto(e){
  var t=e.target;if(!t.matches||!t.matches('[data-lk-field],[data-lk-check],[data-lk-yn]'))return;
  var sec=t.closest('section.lk2-p');if(!sec)return;var ct=sec.querySelector('[data-ct]');if(!ct)return;
  var m=lkcMod();if(!m||t.matches('[data-lk-field="'+ct.dataset.ct+'"]'))return;
  var o=lkcGet(m,ct.dataset.ct);if(o.run||o.done||lkcRunning(m))return;
  lkcStart(m,ct.dataset.ct);lkcPaint()}
 document.addEventListener('input',auto);document.addEventListener('change',auto);
 var sub=lkSubmit;
 lkSubmit=function(){
  var m=lkcMod(),n=(S.lkpd||[]).length,cards=m&&m.v2&&m.v2.pertemuan?lkcCards(m):[];
  /* Kirim menghentikan pewaktu yang masih berjalan agar waktunya tercatat. */
  var r=m&&cards.length?lkcRunning(m):null;if(r&&lktLocked()){lkcStop(m,r.key,true);lkcPaint()}
  sub();
  if(m&&cards.length&&(S.lkpd||[]).length>n)lkcClear(m)};
 window.addEventListener('pagehide',function(){var m=lkcMod();if(m)lkcCards(m).forEach(function(c){lkcSave(m,c.key)})});
})();
