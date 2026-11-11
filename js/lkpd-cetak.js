/* lkpd-cetak.js: cetak LKPD dengan kop sekolah, identitas modul, seluruh isi LKPD, dan spasi rapat.
   Berdiri sendiri: tidak mengubah lkpd.js. Menangkap tombol Cetak lebih dulu, lalu menyusun lembar cetak. */
(function(){
var SEK={nama:'SMKS Medina Bandung',program:'Program Keahlian Teknik Sepeda Motor',alamat:'Jl. K.H. Ahmad Dahlan No. 13\u201315, Kel. Burangrang, Kec. Lengkong, Kota Bandung 40262'};
var CSS='#lk-print{display:none}'+
'@media print{'+
'@page{size:A4;margin:10mm 12mm}'+
'body.lk-printing>*:not(#lk-print){display:none!important}'+
'body.lk-printing #lk-print{display:block!important;font-size:10pt;line-height:1.3}'+
'#lk-print,#lk-print *{color:#000!important;background:transparent!important;box-shadow:none!important}'+
'.lkc-kop{display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:3px double #000;margin-bottom:6px}'+
'.lkc-kop img{width:64px;height:64px;object-fit:contain;flex:0 0 auto;border-radius:0!important}'+
'.lkc-kop div{flex:1;text-align:center}'+
'.lkc-kop b{display:block;font-size:15pt;letter-spacing:.02em;text-transform:uppercase}'+
'.lkc-kop span{display:block;font-size:10.5pt;font-weight:600}'+
'.lkc-kop small{display:block;font-size:8.5pt}'+
'.lkc-grid{display:flex;gap:12px;margin:0 0 6px}.lkc-grid table{flex:1 1 0;min-width:0}'+
'.lkc-info{width:100%;border-collapse:collapse;font-size:9.5pt}'+
'.lkc-info td{padding:1px 3px;border:0!important;vertical-align:top}.lkc-info td:first-child{width:27mm;font-weight:700;white-space:nowrap}.lkc-info td:last-child{border-bottom:1px dotted #000!important;min-height:1.1em}'+
'#lk-print .card{padding:4px 6px!important;margin:4px 0!important;border:1px solid #999!important;border-radius:0!important;break-inside:auto!important}'+
'#lk-print h2{font-size:11pt;margin:3px 0 2px}#lk-print h3{font-size:10pt;margin:3px 0 2px}'+
'#lk-print p{margin:2px 0}#lk-print ul{margin:2px 0;padding-left:16px}#lk-print li{margin:0}'+
'#lk-print .lk-checks{gap:0;margin:2px 0}'+
'#lk-print .lk-check,#lk-print .lk-step,#lk-print .lk-option{padding:1px 0!important;margin:0!important;gap:6px;break-inside:avoid}'+
'#lk-print .qbox{margin:3px 0;break-inside:avoid}'+
'#lk-print .formgrid{gap:3px 8px}#lk-print .f{margin:0;font-size:9.5pt}'+
'#lk-print .note{font-size:9pt;margin:2px 0}'+
'#lk-print table{font-size:9pt}#lk-print tr{break-inside:avoid}'+
'#lk-print input:not([type=checkbox]):not([type=radio]),#lk-print .lkc-ta{display:block;min-height:1.1em;border:0!important;border-bottom:1px dotted #000!important;white-space:pre-wrap;overflow-wrap:anywhere}'+
'#lk-print .lk-foto img{max-height:5cm}'+
'}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function bagian(tab){
 LK.tab=tab;
 var box=document.createElement('div');box.innerHTML=viewLKPD();
 return Array.prototype.filter.call(box.children,function(x){return x.tagName==='SECTION'}).map(function(x){return x.outerHTML}).join('');
}
function semester(){
 var t=new Date(),bln=t.getMonth()+1,y=t.getFullYear();
 return bln>=7?'Ganjil '+y+'/'+(y+1):'Genap '+(y-1)+'/'+y;
}
function mapel(m){return m.kelas==='X'?'DDPK':'Kompetensi Kejuruan TSM'}
function baris(arr){return arr.map(function(x){return '<tr><td>'+x[0]+'</td><td>'+(x[1]?': ':':')+lkEsc(x[1])+'</td></tr>'}).join('')}
function susun(m){
 var asal=LK.tab,h,d=lkDraft();
 try{h=bagian('materi')+bagian('kerja')+bagian('evaluasi')}finally{LK.tab=asal}
 var box=document.createElement('div');box.innerHTML=h;
 Array.prototype.forEach.call(box.querySelectorAll('section'),function(sc){
  var h2=sc.querySelector('h2');if(h2&&/^Identitas praktik/i.test(h2.textContent.trim()))sc.remove();
 });
 Array.prototype.forEach.call(box.querySelectorAll('textarea'),function(t){
  var dv=document.createElement('div');dv.className='lkc-ta';dv.textContent=t.value;t.parentNode.replaceChild(dv,t);
 });
 var kop='<div class="lkc-kop"><img src="'+LOGO+'" alt=""><div><b>'+lkEsc(SEK.nama)+'</b><span>'+lkEsc(SEK.program)+'</span><small>'+lkEsc(SEK.alamat)+'</small></div></div>';
 var kiri=baris([['Judul/Materi',m.title],['Mata pelajaran',mapel(m)],['Kelas/Semester',(d.class||m.kelas)+' / '+semester()],['Fase/Kurikulum','Fase '+m.fase+' / Kurikulum Merdeka'],['Waktu pengerjaan',m.duration+' menit']]);
 var kanan=baris([['Nama siswa',d.student||(window.S&&S.user&&S.user.nama)||''],['Kelompok',d.group||''],['Tanggal',d.date||(typeof ymd==='function'?ymd(Date.now()):'')],['Tipe kendaraan',d.vehicle||''],['Guru/instruktur',d.teacher||'']]);
 var info='<div class="lkc-grid"><table class="lkc-info"><tbody>'+kiri+'</tbody></table><table class="lkc-info"><tbody>'+kanan+'</tbody></table></div>';
 return kop+info+box.innerHTML;
}
function bersih(){document.body.classList.remove('lk-printing')}
window.addEventListener('afterprint',bersih);

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="lk-print"]');
 if(!b)return;
 if(typeof viewLKPD!=='function'||typeof lkRead!=='function'||typeof LK==='undefined'||LK.detail||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return;
 var m=LKPD_MODULES.find(function(x){return x.id===LK.module});
 if(!m)return;
 e.stopPropagation();
 var lama=document.getElementById('lk-print');if(lama)lama.remove();
 try{
  localStorage.setItem(lkKey(),JSON.stringify(lkRead()));
  var el=document.createElement('div');el.id='lk-print';el.innerHTML=susun(m);document.body.appendChild(el);
  document.body.classList.add('lk-printing');
 }catch(err){bersih()}
 window.print();
},true);
})();
