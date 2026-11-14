/* menu-dasbor.js: merapikan menu dasbor (laci menu) untuk semua peran: Siswa, Guru, Admin.
   Tidak membuat baris baru: memakai ulang baris yang sudah dibuat ui.js dan modul lain (Bank soal, Rekap kompetensi,
   Cek sinkronisasi, dan seterusnya), lalu mengelompokkan dan mengurutkannya. Baris yang dibatasi per peran tetap
   mengikuti aturan aslinya; baris yang belum dikenal otomatis masuk kelompok "Lainnya".
   Fitur: judul kelompok selebar laci (tinggi 44 px) dengan jumlah isi dan panah; kelompok default tertutup kecuali yang berisi
   menu aktif; kelompok yang dibuka manual diingat di perangkat; blok "Terakhir dibuka" (maks 3); Keluar selalu terlihat;
   fokus keyboard terkunci di dalam laci saat terbuka. */
(function(){
 var st=document.createElement('style');st.textContent=
  '#drawer .sbody>.chip.grp{margin-top:10px}'+
  '#drawer .srow{padding:9px 12px;gap:12px;border-radius:16px}#drawer .srow .ico{width:38px;height:38px;border-radius:12px}#drawer .srow b{font-size:14.5px}'+
  '#drawer .srow small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '#drawer .srow.compact{padding:8px 12px;border-radius:14px;gap:12px}#drawer .srow.compact .ico{width:34px;height:34px;border-radius:11px}#drawer .srow.compact b{font-size:14px}'+
  '#drawer .grpbox{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}#drawer .srow{min-width:0;max-width:100%}#drawer .grpbox[hidden]{display:none}'+
  '#drawer .chip.grp{display:flex;align-self:stretch;width:100%;min-height:44px;padding:8px 14px;border-radius:14px;gap:8px;align-items:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}'+
  '#drawer .chip.grp .gn{margin-left:auto;min-width:22px;padding:1px 7px;border-radius:99px;background:var(--surface);color:var(--accent);font-size:12px;font-weight:700;text-align:center}'+
  '#drawer .chip.grp::after{content:"";flex:none;width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin:-3px 0 0 4px;transition:transform .15s}'+
  '#drawer .chip.grp[aria-expanded="true"]::after{transform:rotate(225deg);margin-top:3px}'+
  '#drawer .chip.grp.rec{cursor:default;min-height:30px;padding:4px 6px;background:transparent;margin-top:6px}#drawer .chip.grp.rec::after{display:none}'+
  '@media(prefers-reduced-motion:reduce){#drawer .chip.grp::after{transition:none}}';
 document.head.appendChild(st);

 /* Kelompok menurut urutan tampil. keys/pre: pengenal data-v baris; post: baris yang ditaruh setelah baris berawalan pre. */
 function groups(staff,admin){
  return [
   {key:'home',label:'',   ic:null,   keys:['beranda']},
   {key:'lkpd',label:staff?'LKPD Praktik':'LKPD Praktik kelas saya',ic:'kelas',pre:'lkpd:',post:['observasi-siswa']},
   {key:'ukk',label:staff?'UKK':'UKK kelas saya',ic:'kelas',pre:'kelas:',post:['observasi-ukk']},
   {key:'soal',label:'Soal dan ujian',ic:'menu',keys:['banksoal']},
   {key:'nilai',label:staff?'Penilaian dan acuan':'Nilai dan acuan',ic:'menu',keys:['rekap','kompetensi','observasi','acuan']},
   {key:'admin',label:'Administrasi',ic:'menu',keys:['akun']},
   {key:'app',label:'Akun dan aplikasi',ic:'keluar',keys:['sinkron','gantisandi','segarkan','perbarui'],compact:true},
   {key:'keluar',label:'',ic:null,keys:['keluar'],compact:true}
  ];
 }
 function icon(n){try{return n&&typeof ICO!=='undefined'&&ICO[n]?svg(ICO[n],16):''}catch(e){return ''}}

 /* Penyimpanan di perangkat (per akun): kelompok yang dibuka manual dan menu terakhir. Gagal simpan diabaikan. */
 function uid(){return (typeof S!=='undefined'&&S.user&&S.user.id)||'x'}
 function load(k,def){try{var v=JSON.parse(localStorage.getItem('tbsm.menu.'+k+'.'+uid())||'null');return v==null?def:v}catch(e){return def}}
 function save(k,v){try{localStorage.setItem('tbsm.menu.'+k+'.'+uid(),JSON.stringify(v))}catch(e){}}

 var sessionClosed={},lastCur='';
 function tidy(){
  var sb=document.querySelector('#drawer .sbody');if(!sb||sb.getAttribute('data-tidy')==='1'||!S.user)return;
  var rows=[].slice.call(sb.querySelectorAll('.srow'));if(!rows.length)return;
  var brand=sb.querySelector('.sbrand'),prof=sb.querySelector('.sprofile');
  var staff=isStaff(),G=groups(staff,typeof can==='function'&&can('akun')),used=[],out=[];
  G.forEach(function(g){
   var mine=[];
   /* urutan: baris keys, lalu baris berawalan pre (kelas dalam urutan aslinya), lalu baris post */
   (g.keys||[]).forEach(function(k){rows.forEach(function(r){if(r.dataset.v===k&&used.indexOf(r)<0){mine.push(r);used.push(r)}})});
   if(g.pre)rows.forEach(function(r){if(String(r.dataset.v).indexOf(g.pre)===0&&used.indexOf(r)<0){mine.push(r);used.push(r)}});
   (g.post||[]).forEach(function(k){rows.forEach(function(r){if(r.dataset.v===k&&used.indexOf(r)<0){mine.push(r);used.push(r)}})});
   if(!mine.length)return;
   if(g.compact)mine.forEach(function(r){r.classList.add('compact')});
   out.push({g:g,rows:mine});
  });
  var rest=rows.filter(function(r){return used.indexOf(r)<0});
  if(rest.length)out.push({g:{label:'Lainnya',ic:'menu'},rows:rest});

  /* menu aktif dan daftar terakhir dibuka */
  var curRow=rows.filter(function(r){return r.getAttribute('aria-current')==='page'})[0],curV=(curRow&&curRow.dataset.v)||(typeof S!=='undefined'?S.tab:'')||'';
  if(curV!==lastCur){sessionClosed={};lastCur=curV}
  var recent=load('recent',[]);if(!Array.isArray(recent))recent=[];
  var isMenu=function(v){return rows.some(function(r){return r.dataset.v===v&&r.dataset.act==='menu'})};
  if(curRow&&curRow.dataset.act==='menu'&&curV!=='beranda'&&recent[0]!==curV){recent=[curV].concat(recent.filter(function(v){return v!==curV})).slice(0,6);save('recent',recent)}
  var recRows=recent.filter(function(v){return v!==curV&&isMenu(v)}).slice(0,3).map(function(v){
   var src=rows.filter(function(r){return r.dataset.v===v&&r.dataset.act==='menu'})[0],c=src.cloneNode(true);
   c.removeAttribute('aria-current');c.classList.add('compact');return c});

  var pin=load('pin',{});if(!pin||typeof pin!=='object')pin={};
  /* susun ulang: logo+profil tetap di atas */
  [].slice.call(sb.children).forEach(function(c){if(c!==brand&&c!==prof)sb.removeChild(c)});
  out.forEach(function(o){
   var g=o.g,box=document.createElement('div');box.className='grpbox';
   o.rows.forEach(function(r){box.appendChild(r)});
   if(g.label){
    var tab=typeof S!=='undefined'?S.tab:'',k=g.key||g.label;
    var hasCur=o.rows.some(function(r){return r.getAttribute('aria-current')==='page'})||(!!tab&&((g.keys&&g.keys.indexOf(tab)>-1)||(g.post&&g.post.indexOf(tab)>-1)));
    var open=hasCur?!sessionClosed[k]:!!pin[k];
    var l=document.createElement('div');l.className='chip grp';l.innerHTML=icon(g.ic)+'<span>'+g.label+'</span><span class="gn" aria-hidden="true">'+o.rows.length+'</span>';
    l.setAttribute('role','button');l.setAttribute('tabindex','0');l.setAttribute('aria-expanded',String(open));
    l.setAttribute('aria-label',g.label+', '+o.rows.length+' menu');box.hidden=!open;
    var flip=function(){
     box.hidden=!box.hidden;var on=!box.hidden;l.setAttribute('aria-expanded',String(on));
     if(hasCur)sessionClosed[k]=!on;
     else{var p2=load('pin',{});if(!p2||typeof p2!=='object')p2={};if(on)p2[k]=true;else delete p2[k];save('pin',p2)}
    };
    l.addEventListener('click',flip);
    l.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});
    sb.appendChild(l);
   }
   sb.appendChild(box);
   if(g.key==='home'&&recRows.length){
    var rl=document.createElement('div');rl.className='chip grp rec';rl.innerHTML=icon('menu')+'<span>Terakhir dibuka</span>';
    var rb=document.createElement('div');rb.className='grpbox';recRows.forEach(function(r){rb.appendChild(r)});
    sb.appendChild(rl);sb.appendChild(rb);
   }
  });
  sb.setAttribute('data-tidy','1');
 }
 var _r=render;
 render=function(){_r.apply(this,arguments);try{tidy()}catch(e){}};

 /* Fokus keyboard terkunci di dalam laci saat terbuka; fokus awal ke menu aktif atau elemen pertama yang terlihat. */
 function vis(el){return !!el&&!el.closest('[hidden]')&&el.offsetParent!==null}
 function focusables(){var d=document.getElementById('drawer');return d?[].slice.call(d.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(vis):[]}
 document.addEventListener('keydown',function(e){
  if(e.key!=='Tab'||!document.body.classList.contains('dr-open'))return;
  var f=focusables();if(!f.length)return;
  var first=f[0],last=f[f.length-1],a=document.activeElement,inside=!!(a&&a.closest&&a.closest('#drawer'));
  if(e.shiftKey&&(a===first||!inside)){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&(a===last||!inside)){e.preventDefault();first.focus()}
 });
 if(typeof MutationObserver==='function')new MutationObserver(function(){
  if(!document.body.classList.contains('dr-open'))return;
  setTimeout(function(){
   var a=document.activeElement;if(a&&a.closest&&a.closest('#drawer')&&vis(a))return;
   var f=document.querySelector('#drawer [aria-current="page"]');if(!vis(f)){var all=focusables();f=all[0]}
   if(f)f.focus({preventScroll:true});
  },60);
 }).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
