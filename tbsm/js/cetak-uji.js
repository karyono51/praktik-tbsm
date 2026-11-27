/* cetak-uji.js: tombol Cetak untuk form uji praktik (V.mode exam) dan halaman hasil (V.mode result).
   Berdiri sendiri: menyalin tampilan aktif, memberi kop sekolah, mengganti kolom isian dengan teks, lalu window.print(). */
(function(){
/* SEK (nama, program, alamat sekolah aktif) didefinisikan di sekolah.js */
var CSS='#uj-print{display:none}'+
'@media print{'+
'@page{size:A4;margin:10mm 12mm}'+
'body.uj-printing>*:not(#uj-print){display:none!important}'+
'body.uj-printing #uj-print{display:block!important;font-size:10pt;line-height:1.3}'+
'#uj-print,#uj-print *{color:#000!important;background:transparent!important;box-shadow:none!important}'+
'#uj-print .ujk{display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:3px double #000;margin-bottom:8px}'+
'#uj-print .ujk img{width:64px;height:64px;object-fit:contain;flex:0 0 auto;border-radius:0!important}'+
'#uj-print .ujk div{flex:1;text-align:center}'+
'#uj-print .ujk b{display:block;font-size:15pt;letter-spacing:.02em;text-transform:uppercase}'+
'#uj-print .ujk span{display:block;font-size:10.5pt;font-weight:600}'+
'#uj-print .ujk small{display:block;font-size:8.5pt}'+
'#uj-print .card,#uj-print section.card{padding:4px 6px!important;margin:5px 0!important;border:1px solid #999!important;border-radius:0!important;break-inside:auto!important}'+
'#uj-print .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#uj-print .row.sb{justify-content:space-between}'+
'#uj-print h2{font-size:11pt;margin:3px 0 2px}#uj-print h3{font-size:10pt;margin:3px 0 2px}'+
'#uj-print p{margin:2px 0}#uj-print .note{font-size:9pt}'+
'#uj-print .pill{display:inline-block;border:1px solid #000!important;border-radius:99px;padding:0 6px;font-size:8.5pt}'+
'#uj-print .formgrid{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px}#uj-print .formgrid .wide{grid-column:1/-1}'+
'#uj-print .f{display:flex;flex-direction:column;font-size:9pt;margin:0}'+
'#uj-print .tablewrap{overflow:visible!important}'+
'#uj-print table{width:100%;border-collapse:collapse;font-size:9pt}'+
'#uj-print th,#uj-print td{border:1px solid #666!important;padding:3px 4px;vertical-align:top;text-align:left}'+
'#uj-print tr{break-inside:avoid}'+
'#uj-print .ujv{display:block;min-height:1.1em;border-bottom:1px dotted #000;white-space:pre-wrap;overflow-wrap:anywhere}'+
'#uj-print td .ujv{border-bottom:0}'+
'#uj-print .aspek-head{display:flex;justify-content:space-between;margin-top:8px;border-bottom:1px solid #000;font-weight:700}'+
'#uj-print .item{border:0!important;border-bottom:1px solid #ccc!important;padding:3px 0!important;display:block!important;break-inside:avoid}'+
'#uj-print .item .t{display:flex;gap:8px;justify-content:space-between}'+
'#uj-print .yn,#uj-print .ptabs,#uj-print .seg{display:none!important}'+
'#uj-print .ujs{display:block;font-weight:700;font-size:9pt}'+
'#uj-print .score{font-size:26pt;font-weight:700}'+
'#uj-print .meter{height:6px;border:1px solid #000;margin:2px 0}#uj-print .meter i{display:block;height:100%;background:#000!important}'+
'}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function teks(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function bersih(){document.body.classList.remove('uj-printing');var e=document.getElementById('uj-print');if(e)e.remove()}
window.addEventListener('afterprint',bersih);

function susun(){
 var app=document.getElementById('app');if(!app)return '';
 var live=Array.prototype.slice.call(app.querySelectorAll('input,select,textarea'));
 var cl=app.cloneNode(true);
 var kl=Array.prototype.slice.call(cl.querySelectorAll('input,select,textarea'));
 // buang elemen non-isi: header, bar bawah, menu samping, toast
 Array.prototype.forEach.call(cl.querySelectorAll('header,.bar,.scrim,aside,.netslot,.toast,.chips'),function(x){x.remove()});
 // ganti kolom isian dengan teks (nilai diambil dari elemen asli yang sedang tampil)
 kl.forEach(function(k,i){
  var a=live[i];if(!a||!k.parentNode)return;
  var v;
  if(a.tagName==='SELECT')v=a.selectedIndex>=0?a.options[a.selectedIndex].text:'';
  else v=a.value;
  var s=document.createElement('span');s.className='ujv';s.textContent=v;
  k.parentNode.replaceChild(s,k);
 });
 // butir rubrik: tampilkan status sebagai teks karena tombol disembunyikan
 Array.prototype.forEach.call(cl.querySelectorAll('.item[data-v]'),function(it){
  var v=it.getAttribute('data-v');
  var s=document.createElement('span');s.className='ujs';s.textContent=v==='1'?'Status: Terpenuhi':(v==='0'?'Status: Belum':'Status: Belum diisi');
  it.appendChild(s);
 });
 // tombol tidak dicetak
 Array.prototype.forEach.call(cl.querySelectorAll('button'),function(b){
  if(b.closest('.ptab'))return;b.remove();
 });
 var kop='<div class="ujk"><img src="'+LOGO+'" alt=""><div><b>'+teks(SEK.nama)+'</b><span>'+teks(SEK.program)+'</span><small>'+teks(SEK.alamat)+'</small></div></div>';
 var tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 var ft='<p class="note" style="margin-top:8px">Dicetak '+teks(tgl)+'</p>';
 return kop+cl.innerHTML+ft;
}

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="uji-print"]');
 if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(typeof V!=='undefined'&&V.job&&V.job.ukk&&typeof ukkCetakPdf==='function'){ukkCetakPdf();return}
 if(typeof V==='undefined'||(V.mode!=='exam'&&V.mode!=='result'))return;
 bersih();
 try{
  var el=document.createElement('div');el.id='uj-print';el.innerHTML=susun();document.body.appendChild(el);
  document.body.classList.add('uj-printing');
 }catch(err){bersih();if(typeof toast==='function')toast('Gagal menyiapkan lembar cetak');return}
 window.print();
},true);
})();
