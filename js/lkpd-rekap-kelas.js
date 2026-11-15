/* lkpd-rekap-kelas.js (v92): Rekap pengumpulan LKPD dikelompokkan sesuai kelasnya.
   Masalah: "Rekap kelas" dari Kelas XII membuka rekap berfilter XII; bila XII belum punya data, filter dibuang otomatis
   dan data kelas lain (mis. Kelas X) tampil di bawah judul Kelas XII.
   Perbaikan (Admin/Guru): chip kelas selalu tampil (Semua kelas + tiap kelas dengan jumlah datanya). Kelas terpilih hanya
   menampilkan datanya sendiri; bila kosong tampil "Belum ada pengumpulan LKPD <kelas>". "Semua kelas" tetap dikelompokkan
   per kelas lengkap dengan rata-ratanya. Dimuat paling akhir; hanya membungkus viewLKPD. */
(function(){
 var prev=viewLKPD;
 viewLKPD=function(){
  if(!S.user||!isStaff()||!LK.open||LK.tab!=='riwayat'||LK.detail||LK.editor)return prev();
  var orig=S.lkpd||[],kf=LK.kf||'',h;
  var ks=Object.keys(KELAS);orig.forEach(function(x){if(x.kelas&&ks.indexOf(x.kelas)<0)ks.push(x.kelas)});
  if(kf&&ks.indexOf(kf)<0)kf=LK.kf='';
  try{
   if(kf)S.lkpd=orig.filter(function(x){return x.kelas===kf});
   h=prev();
  }finally{S.lkpd=orig}
  try{
   var chips='<div class="chips lk-kf2" role="group" aria-label="Pilih kelas"><button type="button" data-act="lk-kf" data-v="" aria-pressed="'+(!kf)+'">Semua kelas · '+orig.length+'</button>'+
    ks.map(function(k){var n=orig.filter(function(x){return x.kelas===k}).length;return '<button type="button" data-act="lk-kf" data-v="'+lkEsc(k)+'" aria-pressed="'+(kf===k)+'">'+lkEsc(lkKelasName(k))+' · '+n+'</button>'}).join('')+'</div>';
   h=h.replace(/<div class="chips lk-kf">[\s\S]*?<\/div>/,'');
   var i=h.indexOf('Rekap pengumpulan LKPD'),j=i<0?-1:h.indexOf('</span></div>',i);
   if(j>-1)h=h.slice(0,j+13)+chips+h.slice(j+13);
   if(kf)h=h.replace('Belum ada pengumpulan LKPD.','Belum ada pengumpulan LKPD '+lkEsc(lkKelasName(kf))+'.');
  }catch(e){}
  return h;
 };
})();
