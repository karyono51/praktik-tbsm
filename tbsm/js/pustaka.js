/* pustaka.js: pemuat pustaka berat (Excel, PDF) setelah aplikasi tampil, bukan sebelumnya.
   SheetJS (sekitar 900 KB) dan jsPDF (sekitar 350 KB) tidak dibutuhkan untuk membuka aplikasi, jadi
   tidak lagi memblokir tampilan awal. Dimuat saat perangkat senggang, atau segera bila fitur ekspor/impor dipakai.
   Alamat dan SRI sama dengan sebelumnya; service worker tetap menyimpannya untuk offline.
   Hubungan: Pustaka.muat() mengembalikan Promise; export.js (needX, needP) dan pemeriksa XLSX lain memanggilnya. */
(function(){
 var LIB=[
  ['xlsx','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw'],
  ['jspdf','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk'],
  ['autotable','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','sha384-fCAW/rDWORTbQXSiB7mOg0QtQ5c+r0f544y6XoKjuVva0nMBlCpNUjiFeG5iMdS3']
 ];
 var P=window.Pustaka={p:null,ok:false};
 function satu(x){
  return new Promise(function(res){
   var s=document.createElement('script');
   s.src=x[1];s.integrity=x[2];s.crossOrigin='anonymous';
   s.onload=function(){res(true)};
   s.onerror=function(){res(false)};
   document.head.appendChild(s);
  });
 }
 /* xlsx dan jsPDF diunduh bersamaan; autotable menunggu jsPDF karena memperluasnya */
 P.muat=function(){
  if(P.p)return P.p;
  P.p=Promise.all([satu(LIB[0]),satu(LIB[1]).then(function(a){return a?satu(LIB[2]):false})]).then(function(r){
   P.ok=!!(r[0]&&r[1]&&r[2]);
   if(!P.ok)P.p=null;   /* gagal (offline): boleh dicoba lagi nanti */
   return P.ok;
  });
  return P.p;
 };
 /* pemanasan: setelah halaman selesai dimuat dan perangkat senggang; ditunda bila siswa sedang mengerjakan ujian */
 function hangat(n){
  if(P.ok||P.p)return;
  try{if(window.BS&&BS.run&&n<8){setTimeout(function(){hangat(n+1)},15000);return}}catch(e){}
  if(navigator.onLine===false){setTimeout(function(){hangat(n+1)},30000);return}
  P.muat();
 }
 function jadwal(){
  var go=function(){hangat(0)};
  if(window.requestIdleCallback)requestIdleCallback(go,{timeout:6000});else setTimeout(go,3000);
 }
 if(document.readyState==='complete')jadwal();else window.addEventListener('load',function(){setTimeout(jadwal,1500)});
})();
