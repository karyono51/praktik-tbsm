/* bank-filter.js: kartu Cari/filter di halaman Bank soal (guru/admin) disembunyikan secara bawaan.
   Tombol "Cari dan filter" membukanya; lencana menunjukkan jumlah filter yang sedang aktif.
   Dimuat paling akhir agar pembungkus lain (butir, cetak-soal, impor) sudah menyisipkan isinya ke kartu. */
(function(){
 if(typeof bsViewBank!=='function'||typeof BS==='undefined')return;
 var _fbVB=bsViewBank;
 bsViewBank=function(){
  var h=_fbVB.apply(this,arguments),k0='<div class="card"><label class="f">Cari<',a=h.indexOf(k0),k1='</div><div class="stack" id="bq-list">',b=h.indexOf(k1,a);
  if(a<0||b<0)return h;
  var e=b+6,card=h.slice(a,e),f=BS.flt||{},n=0;
  ['q','mapel','tipe','tuj','stat'].forEach(function(x){if(f[x])n++});
  var open=!!BS.fltOpen,
   btn='<button type="button" class="btn" data-bs="fltoggle" aria-expanded="'+open+'">'+(open?'Tutup pencarian':'Cari dan filter soal')+(n&&!open?' · '+n+' filter aktif':'')+'</button>';
  return h.slice(0,a)+btn+(open?card:'')+h.slice(e);
 };
 document.addEventListener('click',function(e){
  var t=e.target.closest&&e.target.closest('[data-bs="fltoggle"]');if(!t)return;
  BS.fltOpen=!BS.fltOpen;render();
 });
})();
