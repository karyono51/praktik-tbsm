/* form-draft.js: isian form tidak hilang saat "Segarkan data" maupun saat halaman dimuat ulang.
   1. Segarkan data (tombol segarkan di header): nilai semua kolom di layar dicatat sebelum data diambil,
      lalu dikembalikan ke kolom yang sama setelah layar digambar ulang. Form Bank soal/CBT Online disinkronkan
      dulu ke datanya (bsFormRead, bsSfRead) supaya ikut terbawa.
   2. Muat ulang halaman: isian teks di layar yang sedang dibuka dicatat di perangkat (localStorage, per akun,
      berlaku 24 jam) dan dikembalikan setelah halaman terbuka lagi pada tab yang sama. Form Bank soal memakai
      draft sendiri (bsDraftSave/bsDraftRestore di banksoal.js) karena datanya hidup di memori.
   3. Draf Bank soal (form soal), CBT Online (form sesi), dan Atur latihan siswa: datanya hidup di memori (BS.form, BS.sf, BS.lat),
      jadi disimpan utuh di localStorage (kunci tbsm-bsd, per akun, 24 jam) lewat bsDraftSave dan dipulihkan setelah soal selesai dimuat
      (bsDraftRestore). Draf dihapus otomatis saat form disimpan atau dibatalkan. Gambar soal ikut disimpan bila muat; bila penyimpanan
      penuh, draf disimpan tanpa gambar.
   Tidak pernah disimpan: kolom sandi, berkas, jawaban ujian (.bs-ur), isian LKPD siswa dan editor LKPD
   (keduanya sudah punya draft sendiri). Kolom diberi data-fd="skip" untuk dikecualikan.
   Bergantung pada: ui.js (render), nav.js (refreshData), core.js (S). Dimuat paling akhir. */
(function(){
var K='tbsm-fd',TTL=24*3600*1000,TEKS=/^(text|search|number|tel|email|url|date|time|datetime-local|month|week)$/,
    ST={pending:null,tries:0},tm=null;

function skip(e){
 var t=String(e.type||'').toLowerCase();
 if(t==='password'||t==='file'||t==='button'||t==='submit'||t==='reset'||t==='hidden'||t==='image')return true;
 if(e.getAttribute('data-fd')==='skip')return true;
 if(e.classList&&e.classList.contains('bs-ur'))return true;
 if(e.hasAttribute('data-lk-field'))return true;
 return false;
}
function list(){
 var a=document.querySelectorAll('#app input,#app select,#app textarea'),r=[];
 for(var i=0;i<a.length;i++)if(!skip(a[i]))r.push(a[i]);
 return r;
}
function keyOf(e,cnt){
 var t=String(e.type||e.tagName).toLowerCase(),b=e.id?('#'+e.id):[e.tagName,t,e.getAttribute('data-bs')||'',e.getAttribute('data-k')||'',e.getAttribute('name')||'',e.getAttribute('data-lkm')||'',e.getAttribute('placeholder')||''].join('|');
 if(t==='radio')b+='|'+e.value;
 cnt[b]=(cnt[b]||0)+1;
 return b+'#'+cnt[b];
}
function snap(){
 var o={},cnt={};
 list().forEach(function(e){
  var t=String(e.type||'').toLowerCase(),k=keyOf(e,cnt);
  if(t==='checkbox'||t==='radio')o[k]=e.checked?1:0;
  else{var v=String(e.value==null?'':e.value);o[k]=v.length>20000?v.slice(0,20000):v}
 });
 return o;
}
/* semuaJenis=true: juga pilihan (select), ceklis, dan radio; false: hanya isian teks */
function restore(o,semuaJenis){
 var cnt={},n=0;
 list().forEach(function(e){
  var t=String(e.type||'').toLowerCase(),k=keyOf(e,cnt);
  if(!(k in o))return;
  if(t==='checkbox'||t==='radio'){if(semuaJenis&&e.checked!==!!o[k]){e.checked=!!o[k];n++}return}
  if(e.tagName==='SELECT'){
   if(!semuaJenis)return;
   var ok=false;for(var i=0;i<e.options.length;i++)if(e.options[i].value===o[k]){ok=true;break}
   if(ok&&e.value!==o[k]){e.value=o[k];n++}
   return;
  }
  if(e.tagName==='TEXTAREA'||TEKS.test(t)){if(e.value!==o[k]){e.value=o[k];n++}}
 });
 return n;
}

/* ---- Segarkan data ---- */
function syncBS(){
 try{if(window.BS&&window.bsOn&&bsOn()){if(window.bsFormRead)bsFormRead();if(window.bsSfRead)bsSfRead();if(window.bsLatBaca)bsLatBaca()}}catch(e){}
}
if(typeof window.refreshData==='function'){
 var rd0=window.refreshData;
 window.refreshData=async function(){
  var o=null;
  try{if(window.S&&S.user){syncBS();o=snap()}}catch(e){}
  try{return await rd0.apply(this,arguments)}
  finally{try{if(o)restore(o,true)}catch(e){}}
 };
}


/* ---- Draf Bank soal / sesi CBT / Atur latihan (data di memori) ---- */
var BD={K:'tbsm-bsd',d:null,done:false};
try{var bj=JSON.parse(localStorage.getItem(BD.K)||'null');if(bj&&Date.now()-bj.t<=TTL)BD.d=bj;else if(bj)localStorage.removeItem(BD.K)}catch(e){}
if(!BD.d)BD.done=true;
function bdStaf(){try{return bsEdit()&&actRole()!=='siswa'}catch(e){return false}}
window.bsLatBaca=function(){
 if(!window.BS||!BS.lat)return;
 var m=document.getElementById('bl-mapel'),t=document.getElementById('bl-tipe');
 if(m)BS.lat.mapel=m.value;if(t)BS.lat.tipe=t.value;
};
window.bsDraftSave=function(){
 try{
  if(!BD.done||!window.BS||!window.S||!S.user||!window.bsOn||!bsOn())return;
  if(window.bsFormRead)bsFormRead();if(window.bsSfRead)bsSfRead();bsLatBaca();
  var lat=BS.sub==='latsetup'&&!BS.run;
  if(!BS.form&&!BS.sf&&!lat){localStorage.removeItem(BD.K);return}
  var o={u:S.user.id,t:Date.now(),tab:S.tab,bt:BS.tab,sub:lat?'latsetup':'',lat:lat?BS.lat:null,form:BS.form||null,sf:BS.sf||null};
  try{localStorage.setItem(BD.K,JSON.stringify(o))}
  catch(e){
   try{
    if(o.form){var f=JSON.parse(JSON.stringify(o.form));f.qi='';f.si='';f.oi=['','','','',''];o.form=f}
    localStorage.setItem(BD.K,JSON.stringify(o));
   }catch(e2){}
  }
 }catch(e){}
};
/* mengembalikan draf setelah halaman dimuat ulang; true bila ada yang dipulihkan (layar perlu digambar ulang) */
window.bsDraftRestore=function(){
 if(BD.done||!window.BS||!window.S||!S.user||!window.bsOn||!bsOn()||!BS.loaded)return false;
 BD.done=true;
 var d=BD.d;BD.d=null;
 if(!d||d.u!==S.user.id||d.tab!==S.tab||BS.run)return false;
 var n=false,staf=bdStaf();
 if(staf){
  if(d.form&&!BS.form&&!BS.sf&&S.tab!=='cbtonline'){BS.form=d.form;BS.tab='bank';n=true}
  if(d.sf&&!BS.form&&!BS.sf&&S.tab==='cbtonline'){BS.sf=d.sf;BS.tab=d.bt||'sesi';n=true}
 }else if(d.sub==='latsetup'&&BS.sub==='home'){
  BS.lat=Object.assign({mapel:'',tipe:'',n:10},d.lat||{});BS.sub='latsetup';n=true;
 }
 return n;
};

/* ---- Muat ulang halaman ---- */
function simpan(){
 try{
  if(!window.S||!S.user||ST.pending)return;
  if(window.bsDraftSave)bsDraftSave();
  var o=snap();
  if(!Object.keys(o).length){localStorage.removeItem(K);return}
  localStorage.setItem(K,JSON.stringify({u:S.user.id,t:Date.now(),tab:S.tab,snap:o}));
 }catch(e){}
}
function nanti(){clearTimeout(tm);tm=setTimeout(simpan,400)}
function sesudahRender(){
 if(!window.S||!S.user)return;
 if(ST.pending===null){
  var j=null;try{j=JSON.parse(localStorage.getItem(K)||'null')}catch(e){}
  ST.pending=(j&&j.u===S.user.id&&Date.now()-j.t<=TTL&&j.tab===S.tab&&j.snap)?j:false;
 }
 if(ST.pending){
  /* menunggu layar yang punya kolomnya (misalnya setelah "Memuat soal…"); menyerah setelah beberapa kali gambar ulang */
  var n=0;try{n=restore(ST.pending.snap,false)}catch(e){}
  if(n>0||++ST.tries>5||S.tab!==ST.pending.tab)ST.pending=false;
  return;
 }
 nanti();
}
if(typeof window.render==='function'){
 var r0=window.render;
 window.render=function(){
  var r=r0.apply(this,arguments);
  try{sesudahRender()}catch(e){}
  try{if(window.bsDraftRestore&&bsDraftRestore())r=r0.apply(this,arguments)}catch(e){}
  return r;
 };
}
document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('#app'))nanti()},true);
document.addEventListener('change',function(e){if(e.target&&e.target.closest&&e.target.closest('#app'))nanti()},true);
window.addEventListener('pagehide',simpan);
document.addEventListener('visibilitychange',function(){if(document.hidden)simpan()});
})();
