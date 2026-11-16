/* bank-filter.js: halaman Bank soal (guru/admin). Filter bawaannya kosong (none), dan selama belum ada filter
   atau kata kunci, daftar kartu soal tidak ditampilkan (hanya petunjuk). Kartu Cari/filter selalu tampil.
   Dimuat paling akhir agar pembungkus lain (butir, cetak-soal, impor) sudah menyisipkan isinya ke kartu. */
(function(){
 function nAktif(){var f=(typeof BS!=='undefined'&&BS.flt)||{},n=0;['q','mapel','tipe','tuj','stat','cp'].forEach(function(x){if(f[x])n++});return n}
 if(typeof bsBankList==='function'){
  var _fbBL=bsBankList;
  bsBankList=function(){
   if(!nAktif())return '<p class="muted center" style="padding:20px 0">Pilih mapel, jenis, peruntukan, atau elemen CP, atau ketik kata kunci untuk menampilkan soal.</p>';
   return _fbBL.apply(this,arguments);
  };
 }
})();
