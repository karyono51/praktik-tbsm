/* bank-filter.js: halaman Bank soal (guru/admin). Filter bawaannya kosong (none), dan selama belum ada filter
   atau kata kunci, daftar kartu soal tidak ditampilkan (hanya petunjuk). Kartu Cari/filter tampil bawaan dan
   bisa ditutup lewat tombol; lencana menunjukkan jumlah filter yang aktif saat kartu ditutup.
   Dimuat paling akhir agar pembungkus lain (butir, cetak-soal, impor) sudah menyisipkan isinya ke kartu. */
(function(){
 function nAktif(){var f=(typeof BS!=='undefined'&&BS.flt)||{},n=0;['q','mapel','tipe','tuj','stat'].forEach(function(x){if(f[x])n++});return n}
 if(typeof bsBankList==='function'){
  var _fbBL=bsBankList;
  bsBankList=function(){
   if(!nAktif())return '<p class="muted center" style="padding:20px 0">Pilih mapel, jenis, atau peruntukan, atau ketik kata kunci untuk menampilkan soal.</p>';
   return _fbBL.apply(this,arguments);
  };
 }
 if(typeof bsViewBank!=='function'||typeof BS==='undefined')return;
 var _fbVB=bsViewBank;
 bsViewBank=function(){
  var h=_fbVB.apply(this,arguments),k0='<div class="card"><label class="f">Cari<',a=h.indexOf(k0),k1='</div><div class="stack" id="bq-list">',b=h.indexOf(k1,a);
  if(a<0||b<0)return h;
  var e=b+6,card=h.slice(a,e),n=nAktif();
  var open=BS.fltOpen!==false,
   btn='<button type="button" class="btn" data-bs="fltoggle" aria-expanded="'+open+'">'+(open?'Tutup pencarian':'Cari dan filter soal')+(n&&!open?' · '+n+' filter aktif':'')+'</button>';
  return h.slice(0,a)+btn+(open?card:'')+h.slice(e);
 };
 document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('[data-bs="fltoggle"]');if(!t)return;
  BS.fltOpen=!(BS.fltOpen!==false);render();
 });
})();
