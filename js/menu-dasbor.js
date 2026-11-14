/* menu-dasbor.js: merapikan menu dasbor (laci menu) untuk semua peran: Siswa, Guru, Admin.
   Tidak membuat baris baru: memakai ulang baris yang sudah dibuat ui.js dan modul lain (Bank soal, Rekap kompetensi,
   Cek sinkronisasi, dan seterusnya), lalu mengelompokkan dan mengurutkannya. Baris yang dibatasi per peran tetap
   mengikuti aturan aslinya; baris yang belum dikenal otomatis masuk kelompok "Lainnya". */
(function(){
 var st=document.createElement('style');st.textContent=
 '#drawer .sbody>.chip.grp{margin-top:10px}'+
 '#drawer .srow.compact{padding:9px 12px;border-radius:14px;gap:12px}#drawer .srow.compact .ico{width:34px;height:34px;border-radius:11px}#drawer .srow.compact b{font-size:14px}'+
 '#drawer .grpbox{display:grid;gap:8px}';
 document.head.appendChild(st);

 /* Kelompok menurut urutan tampil. match: fungsi pengenal data-v baris. */
 function groups(staff,admin){
  return [
   {key:'home',label:'',   ic:null,   keys:['beranda']},
   {key:'lkpd',label:staff?'LKPD Praktik':'LKPD Praktik kelas saya',ic:'kelas',pre:'lkpd:',post:['observasi-siswa']},
   {key:'ukk',label:staff?'UKK':'UKK kelas saya',ic:'kelas',pre:'kelas:',post:['observasi-ukk']},
   {key:'soal',label:'Soal dan ujian',ic:'menu',keys:['banksoal']},
   {key:'nilai',label:staff?'Penilaian dan acuan':'Nilai dan acuan',ic:'menu',keys:['rekap','kompetensi','observasi','acuan']},
   {key:'admin',label:'Administrasi',ic:'menu',keys:['akun']},
   {key:'app',label:'Akun dan aplikasi',ic:'keluar',keys:['sinkron','gantisandi','segarkan','perbarui','keluar'],compact:true}
  ];
 }
 function icon(n){try{return n&&typeof ICO!=='undefined'&&ICO[n]?svg(ICO[n],16):''}catch(e){return ''}}
 function belongs(g,v){
  if(g.keys&&g.keys.indexOf(v)>-1)return true;
  return !!(g.pre&&String(v).indexOf(g.pre)===0);
 }
 function tidy(){
  var sb=document.querySelector('#drawer .sbody');if(!sb||sb.getAttribute('data-tidy')==='1'||!S.user)return;
  var rows=[].slice.call(sb.querySelectorAll('.srow'));if(!rows.length)return;
  var brand=sb.querySelector('.sbrand'),prof=sb.querySelector('.sprofile');
  var staff=isStaff(),G=groups(staff,typeof can==='function'&&can('akun')),used=[],out=[];
  G.forEach(function(g){
   var mine=[];
   /* urutan mengikuti daftar keys, lalu baris berawalan (kelas dalam urutan aslinya) */
   (g.keys||[]).forEach(function(k){rows.forEach(function(r){if(r.dataset.v===k&&used.indexOf(r)<0){mine.push(r);used.push(r)}})});
   if(g.pre)rows.forEach(function(r){if(String(r.dataset.v).indexOf(g.pre)===0&&used.indexOf(r)<0){mine.push(r);used.push(r)}});
   (g.post||[]).forEach(function(k){rows.forEach(function(r){if(r.dataset.v===k&&used.indexOf(r)<0){mine.push(r);used.push(r)}})});
   if(!mine.length)return;
   if(g.compact)mine.forEach(function(r){r.classList.add('compact')});
   out.push({g:g,rows:mine});
  });
  var rest=rows.filter(function(r){return used.indexOf(r)<0});
  if(rest.length)out.push({g:{label:'Lainnya',ic:'menu'},rows:rest});
  /* susun ulang: logo+profil tetap di atas */
  [].slice.call(sb.children).forEach(function(c){if(c!==brand&&c!==prof)sb.removeChild(c)});
  out.forEach(function(o){
   if(o.g.label){var l=document.createElement('div');l.className='chip grp';l.innerHTML=icon(o.g.ic)+o.g.label;sb.appendChild(l)}
   var box=document.createElement('div');box.className='grpbox';
   o.rows.forEach(function(r){box.appendChild(r)});sb.appendChild(box);
  });
  sb.setAttribute('data-tidy','1');
 }
 var _r=render;
 render=function(){_r.apply(this,arguments);try{tidy()}catch(e){}};
})();
