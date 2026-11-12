/* lkpd-timer.js: pengatur waktu LKPD (hitung maju, merah bila melewati target menit). Waktu tersimpan per siswa dan modul.
   - Mode Latihan: Mulai/Jeda/Lanjut bebas. Bila siswa kembali mengisi LKPD saat timer terjeda, timer otomatis jalan lagi.
   - Mode Ujian (siswa): tombol Jeda dikunci. Timer berbasis jam dinding (waktu mulai disimpan), jadi terus berjalan
     walau halaman ditutup atau dimuat ulang, sampai LKPD dikirim. Guru dan admin (termasuk pratinjau) tidak dikunci. */
var LKT={key:'',sec:0,running:false,iv:null,t0:0};
function lktLocked(){var m=typeof lkmCur==='function'?lkmCur():null;return !!(m&&!isStaff()&&lkmCfg(m).mode==='ujian')}
function lktSec(){if(LKT.t0&&lktLocked())return Math.max(0,Math.floor((Date.now()-LKT.t0)/1000));return LKT.sec}
function lktStore(){return 'tbsm-lkpd-timer-'+LKT.key}
function lktSave(){try{if(LKT.key){var o={sec:LKT.sec,at:Date.now()};if(LKT.t0)o.t0=LKT.t0;localStorage.setItem(lktStore(),JSON.stringify(o))}}catch(e){}}
function lktMmss(n){var m=Math.floor(n/60),s=n%60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s}
function lktLimit(){var m=(LKPD_MODULES||[]).find(function(x){return x.id===LK.module});return m?(Number(m.duration)||0)*60:0}
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
 var render0=render;render=function(){render0();lktSync()};
 var vw=viewLKPD;
 viewLKPD=function(){
  var h=vw();
  if(h.indexOf('<div class="lk-actions">')<0)return h;
  var m=(LKPD_MODULES||[]).find(function(x){return x.id===LK.module});
  var row='<div class="lk-timer"><div><div class="mono lk-clock" id="lk-clock">'+lktMmss(LKT.sec)+'</div><div class="note">Target '+(m?lkEsc(m.duration):'-')+' menit'+(lktLocked()?' · waktu ujian tidak bisa dijeda':'')+'</div></div><button type="button" class="btn small" data-act="lkt-toggle" id="lk-tbtn"'+(LKT.running&&lktLocked()?' disabled':'')+'>'+lktBtnText()+'</button></div>';
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
  if(!t.matches||!t.matches('[data-lk-field],[data-lk-check],[data-lk-answer]'))return;
  if(!LKT.running)lktStart();
 }
 document.addEventListener('input',auto);
 document.addEventListener('change',auto);
 window.addEventListener('pagehide',lktSave);
})();
