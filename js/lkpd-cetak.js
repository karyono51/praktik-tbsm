/* lkpd-cetak.js: cetak LKPD dengan kop sekolah, identitas LKPD, seluruh isi LKPD, dan spasi rapat.
   Berdiri sendiri: tidak mengubah lkpd.js. Menangkap tombol Cetak lebih dulu, lalu menyusun lembar cetak. */
(function(){
/* SEK (nama, program, alamat sekolah aktif) didefinisikan di sekolah.js */
var CSS='#lk-print{display:none}'+
'@media print{'+
'@page{size:A4;margin:10mm 12mm 14mm;@bottom-right{content:"Halaman " counter(page) " dari " counter(pages);font:8pt sans-serif;color:#555}}'+
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
'.lkc-info td{padding:1px 3px;border:0!important;vertical-align:top}.lkc-info td:first-child{width:27mm;font-weight:700;white-space:nowrap}.lkc-info td.lkc-k{width:2.5mm;padding-right:0;border-bottom:1px dotted #000!important}.lkc-info td.lkc-v{border-bottom:1px dotted #000!important;min-height:1.1em}'+
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
'#lk-print input[type=checkbox],#lk-print input[type=radio]{-webkit-appearance:none;appearance:none;display:inline-block;flex:0 0 auto;width:3.2mm!important;height:3.2mm!important;min-width:3.2mm!important;margin:0 2mm 0 0!important;border:1px solid #000!important;vertical-align:-0.5mm}'+
'#lk-print input[type=checkbox]{border-radius:0!important}#lk-print input[type=radio]{border-radius:50%!important}'+
'#lk-print .lkq-row{display:flex!important;flex-direction:row!important;align-items:center;justify-content:space-between;gap:8px;padding:2px 0!important;margin:0!important;border-bottom:1px dotted #999!important;break-inside:avoid}#lk-print .lkq-row>span:first-child{flex:1 1 auto}#lk-print .lkq-yn{display:flex!important;flex:0 0 auto;gap:10px}#lk-print .lkq-chip{display:flex!important;align-items:center;flex:0 0 auto!important;min-height:0!important;padding:0!important;border:0!important}#lk-print .lk-yn{display:flex!important;flex-direction:row!important;align-items:center;justify-content:space-between;gap:8px;padding:2px 0!important;margin:0!important;border-bottom:1px dotted #999!important;break-inside:avoid}#lk-print .lk-yn-q{flex:1 1 auto}#lk-print .lk-yn-opt{display:flex;flex:0 0 auto;gap:10px}#lk-print .lk-yn-opt label{display:flex!important;align-items:center;flex:0 0 auto!important;min-height:0!important;padding:0!important;border:0!important}#lk-print input[type=checkbox]:checked,#lk-print input[type=radio]:checked{background:#000!important}'+
'#lk-print .lkq-hint{display:block;font-size:8pt;font-style:italic;margin:1px 0 2px}'+
'#lk-print table.lk2-t,#lk-print table.lkc-rp{width:100%;border-collapse:collapse;table-layout:auto}'+
'#lk-print table.lk2-t th,#lk-print table.lk2-t td,#lk-print table.lkc-rp th,#lk-print table.lkc-rp td{border:1px solid #000!important;padding:2px 4px;vertical-align:middle}'+
'#lk-print table.lk2-t td{height:8mm;display:table-cell!important;grid-column:auto!important}#lk-print table.lk2-t td::before{content:none!important;display:none!important}'+
'#lk-print table.lk2-t tr{display:table-row!important}#lk-print table.lk2-t thead{display:table-header-group!important}'+
'#lk-print .tablewrap{overflow:visible!important}#lk-print table.lk2-t input{border:0!important;width:100%;min-height:1.1em}'+
'#lk-print table.lkc-rp td.lkc-c{text-align:center;width:14mm}'+
'#lk-print .lk2-cek{border:1px solid #999;padding:3px 5px;margin:3px 0;break-inside:avoid}'+
'#lk-print details>summary{list-style:none}#lk-print details>summary::-webkit-details-marker{display:none}'+
'#lk-print .lk-foto img{max-height:5cm}'+
'#lk-print .lkc-no{width:7mm;text-align:center;white-space:nowrap}'+
'#lk-print .lkc-ket{font-style:italic;font-weight:400;font-size:7.5pt}'+
'.lkc-kosong{display:inline-block;width:38mm;border-bottom:1px dotted #000;height:1em;vertical-align:bottom}.lkc-akhir{margin-top:8px;break-inside:avoid}.lkc-tgl{text-align:right;font-size:10pt;margin:0 0 4px}'+
'#lk-print table.lkc-ttd{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10pt}'+
'#lk-print table.lkc-ttd td{border:0!important;text-align:center;vertical-align:bottom;padding:0 10mm}'+
'#lk-print .lkc-ttd .lkc-peran{height:1.4em;vertical-align:top}'+
'#lk-print .lkc-ttd .lkc-ruang{height:18mm}'+
'#lk-print .lkc-ttd .lkc-nama{border-bottom:1px solid #000!important;min-height:1.3em;font-weight:700;padding-bottom:1px}'+
'}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function bagian(tab){
 LK.tab=tab;
 var box=document.createElement('div');box.innerHTML=viewLKPD();
 return Array.prototype.filter.call(box.children,function(x){return x.tagName==='SECTION'&&!x.hasAttribute('data-lkm')}).map(function(x){return x.outerHTML}).join('');
}
function semester(){
 var t=new Date(),bln=t.getMonth()+1,y=t.getFullYear();
 return bln>=7?'Ganjil '+y+'/'+(y+1):'Genap '+(y-1)+'/'+y;
}
function mapel(m){return m.kelas==='X'?'Dasar-Dasar Teknik Otomotif (DDPK)':'Kompetensi Keahlian Teknik Sepeda Motor'}
function baris(arr){return arr.map(function(x){return '<tr><td>'+x[0]+'</td><td class="lkc-k">:</td><td class="lkc-v">'+lkEsc(x[1])+'</td></tr>'}).join('')}
/* Akun admin/guru yang mencetak menjadi Guru/instruktur; nama siswa dan tanggal dikosongkan (diisi tangan).
   Siswa yang mencetak: namanya jadi Nama siswa, tanggal dari isian lembar kerja. */
function pihak(d){
 var u=(window.S&&S.user&&S.user.nama)||'',staf=false;try{staf=isStaff()}catch(e){}
 if(staf||LK.preview)return {siswa:'',guru:u||d.teacher||'',tanggal:''};
 return {siswa:d.student||u,guru:d.teacher||'',tanggal:d.date||(typeof ymd==='function'?ymd(Date.now()):'')};
}
function tglPanjang(v){
 var t=v?new Date(v+'T00:00:00'):new Date();if(isNaN(t.getTime()))t=new Date();
 return t.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}
/* penutup: tempat dan tanggal, lalu tanda tangan siswa dan guru/instruktur tanpa garis tabel; nama di atas garis */
function akhir(d){
 var kota='';try{kota=schEf().kota||''}catch(e){}
 var p=pihak(d),siswa=p.siswa,guru=p.guru;
 var tgl=p.tanggal?lkEsc(tglPanjang(p.tanggal)):'<span class="lkc-kosong"></span>';
 return '<div class="lkc-akhir"><p class="lkc-tgl">'+(kota?lkEsc(kota)+', ':'')+tgl+'</p>'+
  '<table class="lkc-ttd"><tbody><tr><td class="lkc-peran">Siswa Praktik,</td><td class="lkc-peran">Guru/Instruktur,</td></tr>'+
  '<tr><td class="lkc-ruang"></td><td class="lkc-ruang"></td></tr>'+
  '<tr><td><div class="lkc-nama">'+lkEsc(siswa)+'</div></td><td><div class="lkc-nama">'+lkEsc(guru)+'</div></td></tr></tbody></table></div>';
}

/* Nama berkas PDF = judul halaman saat mencetak: "LKPD <id LKPD> <judul LKPD> <nama sekolah>",
   mis. "LKPD X-06 Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge) SMKS Medina Bandung".
   Id LKPD diambil dari id modul tanpa awalan "LKPD-". Karakter yang dilarang pada nama berkas dibuang. */
function bersihNama(t){return String(t||'').replace(/[\\/:*?"<>|\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim()}
function namaPdf(m){
 var n='';try{n=SEK.nama}catch(e){}
 var id=bersihNama(String((m&&m.id)||'').replace(/^LKPD[-_\s]*/i,'')),jd=bersihNama(m&&m.title);
 return bersihNama(['LKPD',id,jd,bersihNama(n)].filter(Boolean).join(' '))||'LKPD';
}
var JUDUL0=null;
function judulCetak(m){if(JUDUL0===null)JUDUL0=document.title;document.title=namaPdf(m)}
function judulPulih(){if(JUDUL0!==null){document.title=JUDUL0;JUDUL0=null}}
/* Rapikan cetakan modul v2: buang unsur khusus aplikasi, ubah rencana pertemuan menjadi tabel, buka semua lipatan.
   Tabel hanya untuk rencana pertemuan, tabel data F1-F3, dan rubrik; bagian lain berupa daftar dan kotak. */
function v2Cetak(box){
 Array.prototype.forEach.call(box.querySelectorAll('.lk-actions,button,[data-act],.lk2-prog'),function(x){x.remove()});
 Array.prototype.forEach.call(box.querySelectorAll('p.note'),function(n){
  var t=n.textContent;
  if(/Ketuk satu pertemuan/i.test(t))n.textContent=t.replace(/\s*Ketuk satu pertemuan[^.]*\./i,'');
  else if(/dihitung otomatis/i.test(t))n.textContent='Hitung sendiri: rata-rata = (1 + 2 + 3) \u00f7 3; keolengan = terbesar \u2212 terkecil.';
  else if(/^Terjawab \d+ dari/i.test(t.trim()))n.remove();
  else if(/Jawab semua soal agar Lembar Kerja terbuka/i.test(t))n.textContent=t.replace(/Jawab semua soal agar Lembar Kerja terbuka\.\s*/i,'Kerjakan semua soal sebelum praktik. ').replace(/;\s*guru memeriksa jawabanmu/i,'; guru memeriksa jawabanmu');
 });
 Array.prototype.forEach.call(box.querySelectorAll('section'),function(sc){
  var h2=sc.querySelector('h2');
  if(!h2||!/^Rencana pertemuan/i.test(h2.textContent.trim()))return;
  var rows=Array.prototype.map.call(sc.querySelectorAll('details.lk2-dt'),function(d){
   var b=d.querySelector('summary b'),sm=d.querySelector('summary small'),parts=(sm?sm.textContent:'').split('\u00b7').map(function(x){return x.trim()});
   var jp=(parts[0]||'').replace(/\s*JP.*/i,''),mn=(parts[1]||'').replace(/\s*menit.*/i,''),keg=parts.slice(2).join(' \u00b7 ');
   return '<tr><td class="lkc-c">'+lkEsc(String((b?b.textContent:'').replace(/^Pertemuan\s*/i,'')))+'</td><td class="lkc-c">'+lkEsc(jp)+'</td><td class="lkc-c">'+lkEsc(mn)+'</td><td>'+lkEsc(keg)+'</td></tr>';
  });
  if(!rows.length)return;
  var ds=sc.querySelectorAll('details.lk2-dt');
  var tb=document.createElement('table');tb.className='lkc-rp';
  tb.innerHTML='<thead><tr><th>Pertemuan</th><th>JP</th><th>Menit</th><th>Kegiatan</th></tr></thead><tbody>'+rows.join('')+'</tbody>';
  ds[0].parentNode.insertBefore(tb,ds[0]);
  Array.prototype.forEach.call(ds,function(d){d.remove()});
 });
 Array.prototype.forEach.call(box.querySelectorAll('select'),function(se){
  var ops=Array.prototype.filter.call(se.options,function(o){return o.value!==''&&!/^Belum/i.test(o.textContent.trim())}),sp=document.createElement('span');sp.className='lkc-ta';
  sp.textContent=ops.map(function(o){return (o.selected&&se.value!==''&&!/^Belum/i.test(se.selectedOptions[0].textContent.trim())?'\u2612 ':'\u2610 ')+o.textContent.trim()}).join('    ');
  se.parentNode.replaceChild(sp,se);
 });
 Array.prototype.forEach.call(box.querySelectorAll('details'),function(d){d.setAttribute('open','')});
}
function susun(m){
 /* Format baru (lkpd-format.js): disusun dari data modul. Bila gagal, jatuh ke format lama di bawah. */
 if(typeof window.lkfBangun==='function'){
  try{var st=false;try{st=isStaff()}catch(e){}var d0=lkDraft();return window.lkfBangun(m,{d:(st||LK.preview)?{}:d0,pihak:pihak(d0),semester:semester(),mapel:mapel(m),akhir:akhir(d0)})}
  catch(err){try{console.warn('Format cetak baru gagal, memakai format lama',err)}catch(x){}}
 }
 var asal=LK.tab,h,d=lkDraft();
 try{h=bagian('materi')+bagian('kerja')+bagian('evaluasi')}finally{LK.tab=asal}
 var box=document.createElement('div');box.innerHTML=h;
 Array.prototype.forEach.call(box.querySelectorAll('section'),function(sc){
  var h2=sc.querySelector('h2');if(h2&&/^Identitas praktik/i.test(h2.textContent.trim()))sc.remove();
 });
 Array.prototype.forEach.call(box.querySelectorAll('textarea'),function(t){
  var dv=document.createElement('div');dv.className='lkc-ta';dv.textContent=t.value;t.parentNode.replaceChild(dv,t);
 });
 if(m.v2)v2Cetak(box);
 /* tabel hasil pemeriksaan: kolom No, dan keterangan komponen dalam kurung, miring, huruf lebih kecil */
 Array.prototype.forEach.call(box.querySelectorAll('table'),function(tb){
  var th=tb.querySelectorAll('thead th');
  if(!th.length||th[0].textContent.trim()!=='Komponen'||!/Hasil aktual/i.test(tb.querySelector('thead').textContent))return;
  var tr0=tb.querySelector('thead tr'),n=document.createElement('th');n.className='lkc-no';n.textContent='No';tr0.insertBefore(n,tr0.firstChild);
  Array.prototype.forEach.call(tb.querySelectorAll('tbody tr'),function(tr,i){
   var td=document.createElement('td');td.className='lkc-no';td.textContent=i+1;tr.insertBefore(td,tr.firstChild);
   var k=tr.children[1],sm=k&&k.querySelector(':scope>small');
   if(sm){var em=document.createElement('em');em.className='lkc-ket';em.textContent='('+sm.textContent.trim()+')';sm.parentNode.replaceChild(em,sm);k.insertBefore(document.createTextNode(' '),em)}
  });
 });
 var kop='<div class="lkc-kop"><img src="'+LOGO+'" alt=""><div><b>'+lkEsc(SEK.nama)+'</b><span>'+lkEsc(SEK.program)+'</span><small>'+lkEsc(SEK.alamat)+'</small></div></div>';
 var kiri=baris([['Judul/Materi',m.title],['Mata pelajaran',mapel(m)],['Kelas/Semester',(d.class||m.kelas)+' / '+semester()],['Fase/Kurikulum','Fase '+m.fase+' / Kurikulum Merdeka'],['Waktu pengerjaan',m.duration+' menit']]);
 var p=pihak(d);
 var kanan=baris([['Nama siswa',p.siswa],['Kelompok',d.group||''],['Tanggal',p.tanggal],['Tipe kendaraan',d.vehicle||''],['Guru/instruktur',p.guru]]);
 var info='<div class="lkc-grid"><table class="lkc-info"><tbody>'+kiri+'</tbody></table><table class="lkc-info"><tbody>'+kanan+'</tbody></table></div>';
 return kop+info+box.innerHTML+akhir(d);
}
function bersih(){document.body.classList.remove('lk-printing');judulPulih()}
window.addEventListener('afterprint',bersih);
window.LKC={susun:susun,namaPdf:namaPdf};

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="lk-print"]');
 if(!b)return;
 if(typeof viewLKPD!=='function'||typeof lkRead!=='function'||typeof LK==='undefined'||LK.detail||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return;
 var m=LKPD_MODULES.find(function(x){return x.id===LK.module});
 if(!m)return;
 e.stopPropagation();
 var lama=document.getElementById('lk-print');if(lama)lama.remove();
 try{
  if(!LK.preview)localStorage.setItem(lkKey(),JSON.stringify(lkRead()));   /* pratinjau tidak menyimpan apa pun */
  var el=document.createElement('div');el.id='lk-print';el.innerHTML=susun(m);document.body.appendChild(el);
  document.body.classList.add('lk-printing');judulCetak(m);
 }catch(err){bersih()}
 window.print();
},true);
})();
