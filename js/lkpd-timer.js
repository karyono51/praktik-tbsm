/* lkpd-timer.js: pengatur waktu LKPD, sama seperti Unit Ujian (hitung maju, Mulai/Jeda/Lanjut, mulai otomatis saat mengisi,
   merah bila melewati target menit). Waktu tersimpan per siswa dan modul, tahan reload, dicatat saat LKPD dikirim. */
var LKT={key:'',sec:0,running:false,iv:null};
function lktSec(){return LKT.sec}
function lktStore(){return 'tbsm-lkpd-timer-'+LKT.key}
function lktSave(){try{if(LKT.key)localStorage.setItem(lktStore(),JSON.stringify({sec:LKT.sec}))}catch(e){}}
function lktMmss(n){var m=Math.floor(n/60),s=n%60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s}
function lktLimit(){var m=(LKPD_MODULES||[]).find(function(x){return x.id===LK.module});return m?(Number(m.duration)||0)*60:0}
function lktPaint(){
 var el=document.getElementById('lk-clock'),b=document.getElementById('lk-tbtn');
 if(el){el.textContent=lktMmss(LKT.sec);var lim=lktLimit();el.classList.toggle('over',lim>0&&LKT.sec>lim)}
 if(b)b.textContent=LKT.running?'Jeda':(LKT.sec>0?'Lanjut':'Mulai waktu');
}
function lktStop(){if(LKT.iv){clearInterval(LKT.iv);LKT.iv=null}LKT.running=false;lktSave()}
function lktStart(){if(LKT.iv||!LKT.key)return;LKT.running=true;LKT.iv=setInterval(function(){LKT.sec++;if(LKT.sec%5===0)lktSave();lktPaint()},1000);lktPaint()}
function lktReset(){lktStop();LKT.sec=0;try{if(LKT.key)localStorage.removeItem(lktStore())}catch(e){}lktPaint()}
function lktSync(){
 if(!document.getElementById('lk-clock')){if(LKT.key)lktStop();LKT.key='';return}
 var key=S.user.id+'|'+LK.module;
 if(LKT.key!==key){
  lktStop();LKT.key=key;LKT.sec=0;
  try{var j=JSON.parse(localStorage.getItem(lktStore())||'null');if(j&&j.sec>0)LKT.sec=j.sec}catch(e){}
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
  var row='<div class="lk-timer"><div><div class="mono lk-clock" id="lk-clock">'+lktMmss(LKT.sec)+'</div><div class="note">Target '+(m?lkEsc(m.duration):'-')+' menit</div></div><button type="button" class="btn small" data-act="lkt-toggle" id="lk-tbtn">'+(LKT.running?'Jeda':(LKT.sec>0?'Lanjut':'Mulai waktu'))+'</button></div>';
  return h.replace('<div class="lk-actions">','<div class="lk-actions">'+row);
 };
 var sub=lkSubmit;
 lkSubmit=function(){var n=(S.lkpd||[]).length;sub();if((S.lkpd||[]).length>n)lktReset()};
 document.addEventListener('click',function(e){var b=e.target.closest('[data-act="lkt-toggle"]');if(!b)return;if(LKT.running)lktStop();else lktStart();lktPaint()});
 document.addEventListener('change',function(e){if(e.target.matches&&e.target.matches('[data-lk-field],[data-lk-check],[data-lk-answer]')&&!LKT.running&&LKT.sec===0)lktStart()});
 window.addEventListener('pagehide',lktSave);
})();
