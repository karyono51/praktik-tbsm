/* tebak-token.js: kartu "Salah token" untuk pengawas.
   Menampilkan siswa yang salah memasukkan token pada sesi yang sedang dipantau (Ruang ujian untuk proktor, Pantau untuk guru/admin),
   status blokirnya (tingkat 1 dan 2 otomatis pulih, tingkat 3 terkunci), dan tombol Buka blokir.
   Data dari fungsi server (aksi tebak, bukaTebak). Pembatasnya sendiri bekerja di server (docs-TEBAK-TOKEN.md). */
(function(){
 var TB={sesi:'',rows:[],t:0,now:0,busy:false,err:'',ada:false};
 function peran(){try{return !!S.user&&Cloud.on?actRole():''}catch(e){return ''}}
 function boleh(){var r=peran();return r==='proktor'||r==='guru'||r==='admin'}
 function wadah(){return document.getElementById('ru-body')||document.getElementById('pn-body')}
 function sesiAktif(){
  var s=document.getElementById('ru-sesi');if(s&&s.value)return s.value;
  var p=window.PNref;return p&&p.sesi&&p.sesi!=='ALL'?p.sesi:'';
 }
 function mm(d){d=Math.max(0,Math.round(d));return Math.floor(d/60)+':'+('0'+d%60).slice(-2)}
 function html(){
  if(!TB.rows.length)return '';
  var el=Math.round((Date.now()-TB.t)/1000);
  var h='<div class="card" id="tb-card"><div class="row sb"><span class="label">Salah token</span>'+(TB.rows.length>1?'<button type="button" class="btn small" data-tb="semua">Buka semua</button>':'')+'</div>'+
   '<p class="note">Siswa yang salah memasukkan token. Blokir tingkat 1 dan 2 pulih sendiri; yang terkunci perlu dibuka pengawas. Tanyakan dulu apakah siswa itu salah ketik atau token bocor.</p>';
  h+=TB.rows.map(function(r){
   var sisa=Math.max(0,(r.sisa||0)-el);
   var st=r.kunci?'<span class="pill bad">Terkunci</span>':sisa>0?'<span class="pill warn">Diblokir '+mm(sisa)+'</span>':'<span class="pill">Salah ×'+r.n+'</span>';
   var btn=(r.kunci||sisa>0)?'<button type="button" class="btn small" data-tb="buka" data-sid="'+esc(r.sid)+'" data-nm="'+esc(r.nama||'siswa ini')+'">Buka</button>':'';
   return '<div class="row sb"><span><b>'+esc(r.nama||r.sid)+'</b> <span class="note">'+esc(r.kelas||'')+' · total salah '+r.tot+'</span></span><span class="row">'+st+btn+'</span></div>';
  }).join('');
  return h+'</div>';
 }
 function pasang(){
  var w=wadah(),e=document.getElementById('tb-card');
  if(!w||!boleh()){if(e)e.remove();return}
  var h=html();
  if(!h){if(e)e.remove();return}
  if(e&&e.parentNode===w&&e.dataset.t===String(TB.t))return;
  if(e)e.remove();
  w.insertAdjacentHTML('afterbegin',h);var n=document.getElementById('tb-card');if(n)n.dataset.t=String(TB.t);
 }
 async function muat(){
  var id=sesiAktif();
  if(TB.busy||!id||!boleh()||!wadah()||navigator.onLine===false)return;
  TB.busy=true;
  try{var j=await cbtFn({action:'tebak',sesiId:id});if(id===sesiAktif()){TB.sesi=id;TB.rows=j.rows||[];TB.now=j.now;TB.t=Date.now();TB.err=''}}
  catch(e){TB.err=(e&&e.message)||String(e);if(id!==TB.sesi)TB.rows=[]}
  TB.busy=false;pasang();
 }
 async function aksi(body,ok){
  try{await cbtFn(body);toast(ok);TB.busy=false;await muat()}
  catch(e){toast('Gagal: '+((e&&e.message)||e))}
 }
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-tb]');if(!b||!boleh())return;
  var id=sesiAktif();if(!id)return;
  if(b.dataset.tb==='buka')uiConfirm('Buka blokir token untuk '+(b.dataset.nm||'siswa ini')+'? Ia boleh mencoba memasukkan token lagi.',{ok:'Buka'}).then(function(ok){if(ok)aksi({action:'bukaTebak',sesiId:id,sid:b.dataset.sid},'Blokir dibuka')});
  else if(b.dataset.tb==='semua')uiConfirm('Buka blokir token semua siswa di daftar ini?',{ok:'Buka semua'}).then(function(ok){if(ok)aksi({action:'bukaTebak',sesiId:id,semua:true},'Semua blokir dibuka')});
 });
 /* isi kartu ulang setelah layar digambar ulang (Ruang ujian dan Pantau mengganti isi wadahnya sendiri) */
 var jadwal=0;
 try{new MutationObserver(function(){if(jadwal)return;jadwal=requestAnimationFrame(function(){jadwal=0;if(wadah()&&boleh()){if(TB.rows.length)pasang();if(!TB.t||sesiAktif()!==TB.sesi)muat()}else{TB.rows=[];TB.t=0}})}).observe(document.body,{childList:true,subtree:true})}catch(e){}
 setInterval(function(){if(document.hidden)return;muat()},8000);
 window.tebakToken={muat:muat,html:html,state:TB};
})();
