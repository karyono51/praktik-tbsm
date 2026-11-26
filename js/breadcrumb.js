/* breadcrumb.js: jejak halaman berformat  Beranda | Menu | Menu  di atas judul tiap menu.
   Tidak membuat daftar menu baru: label kelompok (di .akd-crumb) dan nama menu (h2 di sebelahnya) sudah dibuat oleh
   judul-menu.js, akademik.js, dan pkl.js, jadi breadcrumb selalu sama dengan judul yang tampil.
   - Beranda: tombol, kembali ke beranda (memakai data-act="menu" yang sudah ada, termasuk konfirmasi saat ujian/hasil belum disimpan).
   - Kelompok (mis. Ujian dan nilai, Pembelajaran): teks biasa, karena kelompok hanya pengelompokan di laci menu.
   - Menu aktif: teks tebal, aria-current="page".
   Bila nama kelompok dan nama menu sama atau yang satu diawali yang lain (mis. Alumni dan Tracer), kelompok dilewati
   agar tidak berulang. Dimuat paling akhir (setelah judul-menu.js). */
(function(){
 function polos(x){return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
 function esc2(s){return typeof esc==='function'?esc(s):String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

 function bangun(grup,halaman){
  var a=polos(grup),b=polos(halaman),ulang=!a||a===b||b.indexOf(a)===0||a.indexOf(b)===0;
  var li='<li><button type="button" class="bc-a" data-act="menu" data-v="beranda">Beranda</button></li>';
  if(!ulang)li+='<li class="bc-g">'+esc2(grup)+'</li>';
  li+='<li class="bc-now" aria-current="page">'+esc2(halaman)+'</li>';
  return '<nav class="akd-crumb bc" data-bc="1" aria-label="Breadcrumb"><ol>'+li+'</ol></nav>';
 }

 function pasang(){
  if(!window.S||!S.user)return;
  var daftar=document.querySelectorAll('#app .akd-crumb:not([data-bc])');
  for(var i=0;i<daftar.length;i++){
   var c=daftar[i],h=c.parentNode&&c.parentNode.querySelector('h2');
   var grup=(c.textContent||'').trim(),hal=h?(h.textContent||'').trim():'';
   if(!hal)continue;
   c.outerHTML=bangun(grup,hal);
  }
 }

 function aman(){try{pasang()}catch(e){if(window.console)console.warn('breadcrumb',e)}}

 /* 1. setelah setiap render */
 if(typeof render==='function'){
  var lama=render;
  render=function(){var r=lama.apply(this,arguments);aman();return r};
 }
 /* 2. cadangan: judul yang disusun ulang tanpa lewat render (mis. pindah tab PKL) */
 if(typeof MutationObserver==='function'){
  var jadwal=0,app=document.getElementById('app');
  if(app)new MutationObserver(function(){
   if(jadwal)return;
   jadwal=window.requestAnimationFrame?window.requestAnimationFrame(function(){jadwal=0;aman()}):setTimeout(function(){jadwal=0;aman()},16);
  }).observe(app,{childList:true,subtree:true});
 }
 aman();
})();
