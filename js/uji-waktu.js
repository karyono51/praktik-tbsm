/* uji-waktu.js: pengatur waktu uji praktik (UKK dan unit uji).
   - Syarat mulai: siswa wajib mengisi NIS (UKK) dan namanya terbaca; guru wajib memilih siswa. Selama belum terpenuhi,
     seluruh isian pemeriksaan terkunci, jadi tidak ada cara mengerjakan tanpa waktu berjalan.
   - Waktu dimulai otomatis pada isian pertama, memakai jam dinding (V.t0), tidak bisa dijeda.
   - Waktu berhenti hanya saat Hitung hasil ditekan atau batas menit habis (hasil dihitung otomatis).
   - Isian dan waktu mulai disimpan per akun dan unit di perangkat. Keluar atau memuat ulang halaman tidak menghentikan waktu:
     saat unit dibuka lagi, isian dilanjutkan dan sisa waktu dihitung dari jam dinding. */
(function(){
var DRAFT_MAX_LEWAT=6*3600; /* detik setelah batas habis: draft dianggap ditinggalkan dan dibuang */

function lim(){return V.job?V.job.menit*60:0}
function key(id){return 'tbsm-ujiw-'+(S.user?S.user.id:'')+'|'+id}
window.ujiDraftGet=function(id){try{return JSON.parse(localStorage.getItem(key(id))||'null')}catch(e){return null}};
window.ujiDraftDel=function(id){try{localStorage.removeItem(key(id))}catch(e){}};
function simpan(){
 if(V.mode!=='exam'||!V.t0||!V.job||!S.user)return;
 try{localStorage.setItem(key(V.job.id),JSON.stringify({t0:V.t0,nis:V.nis||'',group:V.group||[],kel:!!V.kel,peserta:V.peserta||'',cks:V.cks||{},hs:V.hs||{},hn:V.hn||{},notes:V.notes||{}}))}catch(e){}
}
/* Sisa detik dari draft (untuk daftar unit); null bila tidak ada draft */
window.ujiSisaDraft=function(id,menit){var d=ujiDraftGet(id);if(!d||!d.t0)return null;return menit*60-Math.floor((Date.now()-d.t0)/1000)};

/* ---- Syarat mulai ---- */
window.ujiSyarat=function(){
 if(V.mode!=='exam'||!V.job)return '';
 if(isStaff())return (!V.group||!V.group.length||!V.peserta)?'Pilih atau tambah siswa yang dinilai dulu. Isian terbuka setelah itu.':'';
 if(!String(V.peserta||'').trim())return 'Nama belum terbaca dari akun. Muat ulang halaman atau hubungi guru.';
 if(V.job.ukk&&String(V.nis||'').trim().length<3)return 'Isi NIS kamu dulu (minimal 3 karakter). Lembar pemeriksaan terbuka setelah NIS terisi, lalu waktu berjalan otomatis saat butir pertama diisi.';
 return '';
};
function paint(){
 var el=$('#clock');if(!el||V.mode!=='exam')return;
 var sisa=lim()-V.sec;
 el.textContent=mmss(Math.max(0,sisa));
 el.style.color=(V.t0&&sisa<=60)?'var(--bad)':'';
 var n=$('#clocknote');if(n)n.textContent=V.t0?'Sisa waktu':'Mulai otomatis';
}
function kunci(){
 if(V.mode!=='exam')return;
 var m=ujiSyarat(),lock=!!m;
 $$('.ukk-row input,.ukk-row select,.item button').forEach(function(x){x.disabled=lock});
 var h=$('#ujisyarat');if(h){h.textContent=m;h.hidden=!m}
 var n=$('#ukknis');if(n)n.readOnly=!!V.t0;
}

/* ---- Timer jam dinding ---- */
window.stopTimer=function(){if(timer){clearInterval(timer);timer=null}V.running=false};
window.startTimer=function(){
 if(timer||V.mode!=='exam'||!V.job)return;
 if(ujiSyarat())return;
 if(!V.t0)V.t0=Date.now()-(V.sec||0)*1000;
 V.running=true;
 var tick=function(){
  V.sec=Math.max(0,Math.floor((Date.now()-V.t0)/1000));paint();
  if(V.sec%5===0)simpan();
  if(V.sec>=lim())habis();
 };
 timer=setInterval(tick,1000);
 simpan();paint();kunci();tick();
};
var sedangHabis=false;
function habis(){
 if(V.mode!=='exam'||sedangHabis)return;
 sedangHabis=true;
 try{
  stopTimer();V.sec=lim();paint();
  toast('Waktu habis ('+V.job.menit+' menit). Hasil dihitung otomatis.');
  finishExam();
 }finally{sedangHabis=false}
}

/* ---- Hitung hasil: waktu berhenti, draft dibuang ---- */
var finish0=finishExam;
window.finishExam=function(){
 var id=V.job&&V.job.id;
 if(V.sec>lim())V.sec=lim();
 finish0();
 if(id)ujiDraftDel(id);
};

/* ---- Buka unit: lanjutkan draft bila ada ---- */
var start0=startExam;
window.startExam=function(id,keep){
 var dr=(!keep&&S.user)?ujiDraftGet(id):null,j=jobById(id);
 if(dr&&j&&(Date.now()-dr.t0)/1000>j.menit*60+DRAFT_MAX_LEWAT){ujiDraftDel(id);dr=null}
 if(!dr&&j&&typeof ukkKunci==='function'){var msg=ukkKunci(j);if(msg){toast(msg);return}}
 start0(id,keep);
 if(!dr||V.mode!=='exam'||!V.job||V.job.id!==id)return;
 V.t0=dr.t0;V.nis=dr.nis||'';
 V.peserta=dr.peserta||V.peserta;V.group=(dr.group&&dr.group.length)?dr.group:[V.peserta];V.kel=!!dr.kel&&isStaff();
 V.cks=dr.cks||{};V.hs=dr.hs||{};V.hn=dr.hn||{};V.notes=dr.notes||{};
 V.cks[V.kel?'*':V.peserta]=V.cks[V.kel?'*':V.peserta]||{};
 V.checks=curChecks();
 V.sec=Math.max(0,Math.floor((Date.now()-V.t0)/1000));
 render();
 if(V.sec>=lim())habis();
 else{startTimer();toast('Melanjutkan pekerjaan sebelumnya. Waktu tetap berjalan.')}
};

var render0=render;
window.render=function(){render0.apply(this,arguments);try{kunci();paint()}catch(e){}};

/* ---- Kejadian ---- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b||V.mode!=='exam')return;
 var a=b.dataset.act;
 if(a==='back'&&V.t0){
  if(!uiOk('uji-back','Waktu tetap berjalan dan tidak bisa dijeda.\nIsian tersimpan otomatis; lanjutkan dari daftar unit sebelum waktu habis.',b,{ok:'Keluar'})){e.stopPropagation();e.preventDefault();return}
  simpan();
 }
 else if(a==='redo'||a==='back'){}
},true);
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="redo"]');
 if(b&&V.job)ujiDraftDel(V.job.id);
},true);
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="chk"]');
 if(b&&V.mode==='exam')simpan();
});
document.addEventListener('input',function(e){
 if(V.mode!=='exam')return;
 if(e.target&&e.target.id==='ukknis')kunci();
 simpan();
});
document.addEventListener('change',function(e){if(V.mode==='exam')simpan()});
window.addEventListener('pagehide',simpan);
document.addEventListener('visibilitychange',function(){
 /* kembali ke tab setelah lama: hitung ulang dari jam dinding dan cek batas */
 if(document.visibilityState==='visible'&&V.mode==='exam'&&V.t0){V.sec=Math.max(0,Math.floor((Date.now()-V.t0)/1000));paint();if(V.sec>=lim())habis()}
});
})();
