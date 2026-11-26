/* judul-menu.js: judul gaya Administrasi Akademik untuk tiap menu, dari satu tempat. Dimuat paling akhir.
   Administrasi Akademik dan PKL sudah punya judul sendiri. Beranda, ujian berlangsung, dan hasil tidak diubah. */
(function(){
 var A='Pembelajaran',U='Ujian dan nilai',V2='Supervisi',P='Pengaturan';
 var M={rekap:[U,'Rekap nilai','rekap'],banksoal:[U,'Bank soal','menu'],cbtonline:[U,'CBT Online','menu'],riwayatlatihan:[U,'Riwayat latihan siswa','rekap'],
  kompetensi:[U,'Rekap kompetensi siswa','rekap'],'nilai-akhir-ukk':[U,'Rekap nilai akhir UKK','rekap'],ruangujian:[U,'Ruang ujian','menu'],
  observasi:[V2,'Observasi guru','observasi'],'observasi-siswa':[V2,'Observasi LKPD Praktik','observasi'],'observasi-ukk':[V2,'Observasi UKK','observasi'],
  alumni:['Alumni','Alumni dan Tracer','alumni'],acuan:[P,'Acuan dan aturan','acuan'],akun:[P,'Akun','akun'],hapusnilai:[P,'Hapus nilai','menu'],logaudit:[P,'Log audit','menu'],sinkron:[P,'Cek sinkronisasi','segarkan']};
 function info(){
  var t=S.tab;
  if(M[t])return M[t];
  if(t==='beranda'||t==='pkl'||/^akd-/.test(t))return null;
  var k=typeof KELAS!=='undefined'&&KELAS[S.kelas];
  return k?[A,(t==='lkpd'?'LKPD ':'Unit ujian ')+k.judul,'kelas']:null;
 }
 function polos(x){return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
 /* judul lama yang sama dengan judul baru disembunyikan; tombol dan label di sebelahnya tetap ada */
 function buangKembar(main,nama){
  var h=main.querySelectorAll('h2'),n=polos(nama);
  for(var i=0;i<h.length&&i<2;i++){
   var x=polos(h[i].textContent);
   if(!x||(x.indexOf(n)!==0&&n.indexOf(x)!==0))continue;
   var box=h[i].parentNode;h[i].hidden=true;h[i].style.display='none';
   var ic=box.classList.contains('sechead')&&box.querySelector(':scope > .ico');if(ic)ic.style.display='none';
   /* label di samping judul lama yang mengulang sekolah aktif atau peran (sudah ada di header/judul) ikut disembunyikan */
   var ulang=['admin','proktor'],c=typeof schCfg==='function'&&schCfg();
   if(c)[schKode(),c.pendek,c.nama].forEach(function(v){if(v)ulang.push(polos(v))});
   [].forEach.call(box.children,function(e){if(e.classList.contains('pill')&&ulang.indexOf(polos(e.textContent))>-1)e.style.display='none'});
   if((box.classList.contains('sechead')||box.classList.contains('row'))&&[].every.call(box.children,function(e){return e.style.display==='none'}))box.style.display='none';
   return;
  }
 }
 function pasang(){
  if(!window.S||!S.user||typeof V==='undefined'||V.mode!=='list')return;
  var main=document.querySelector('#app main'),m=info();
  if(!m||!main||main.querySelector('.jm-head'))return;
  var ta=null;try{ta=typeof akTahunAktif==='function'?akTahunAktif():null}catch(e){}
  var d=new Date(),y=d.getMonth()>=6?d.getFullYear():d.getFullYear()-1;
  var teks='Tahun ajaran '+(ta?ta.nama+' · '+ta.semester:y+'/'+(y+1)+' · '+(d.getMonth()>=6?'Ganjil':'Genap'));
  var sk=typeof schCfg==='function'&&schCfg();
  function pil(t,c){return '<span class="pill'+(c?' plain':'')+'">'+esc(t)+'</span>'}
  if(M[S.tab]&&!document.querySelector('#drawer .srow[data-v="'+S.tab+'"]'))return;
  buangKembar(main,m[1]);
  main.insertAdjacentHTML('afterbegin','<div class="jm-head"><div class="sechead akd-head"><span class="ico">'+svg(ICO[m[2]]||ICO.menu,18)+'</span><div class="grow"><div class="akd-crumb">'+esc(m[0])+'</div><h2>'+esc(m[1])+'</h2></div></div>'+
   '<div class="row akd-ctx">'+pil(teks)+(sk?pil(sk.nama,1):'')+(typeof actRole==='function'&&actRole()==='kepsek'?pil('Hanya lihat',1):'')+'</div></div>');
 }
 if(typeof render==='function'){var lama=render;render=function(){var r=lama.apply(this,arguments);try{pasang()}catch(e){if(window.console)console.warn('judul-menu',e)}return r}}
})();
