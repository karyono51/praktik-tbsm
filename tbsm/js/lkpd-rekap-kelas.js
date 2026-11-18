/* lkpd-rekap-kelas.js (v93): Rekap pengumpulan LKPD (Admin/Guru) selalu menampilkan semua kelas,
   dikelompokkan per kelas (judul "KELAS X · n DATA · RATA-RATA nn"), tanpa chip pilihan kelas.
   Masalah lama: "Rekap kelas" dari Kelas XII membuka rekap berfilter XII; bila XII belum punya data, filter dibuang
   otomatis dan data kelas lain tampil tanpa penjelasan. Kini tidak ada filter kelas sama sekali, jadi tiap data
   selalu berada di bawah judul kelasnya sendiri. Dimuat paling akhir; hanya membungkus viewLKPD. */
(function(){
 var prev=viewLKPD;
 viewLKPD=function(){
  if(!S.user||!isStaff()||!LK.open||LK.tab!=='riwayat'||LK.detail||LK.editor)return prev();
  LK.kf='';
  var h=prev();
  try{h=h.replace(/<div class="chips lk-kf">[\s\S]*?<\/div>/,'')}catch(e){}
  return h;
 };
})();
