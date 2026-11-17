/* cetak-riwayat.js: tombol Cetak di Bank soal > Riwayat latihan siswa (guru/admin).
   - Yang dicetak = SEMUA latihan yang cocok dengan filter yang sedang dipilih (nama, kelas, mapel), bukan hanya yang tampil di layar.
   - Kop sekolah, keterangan filter, ringkasan (jumlah latihan, rata-rata, tertinggi, terendah), lalu tabel per latihan.
   - Memakai window.print(): di dialog cetak ponsel pilih "Simpan sebagai PDF" bila ingin berkas.
   Bergantung pada: banksoal.js (BS, bsRlRows, bsJudul), sekolah.js (SEK), logo.js (LOGO). Tidak mengubah data atau koleksi Appwrite. */
(function(){
function t(s){var d=document.createElement('div');d.textContent=String(s==null?'':s);return d.innerHTML}
function tgl(ts){return ts?new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-'}

/* Susun HTML lembar cetak dari daftar baris hasil latihan dan filter aktif (fungsi murni, mudah diuji) */
function rcBuild(rows,f,now){
 f=f||{};
 var sk=typeof SEK!=='undefined'?SEK:{nama:'',program:'',alamat:''},logo=typeof LOGO!=='undefined'?LOGO:'';
 var skor=rows.map(function(x){return +x.score||0}),n=rows.length;
 var avg=n?Math.round(skor.reduce(function(a,b){return a+b},0)/n):0,mx=n?Math.max.apply(null,skor):0,mn=n?Math.min.apply(null,skor):0;
 var tg=(now||new Date()).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 var h='<div class="rc-kop"><img src="'+logo+'" alt=""><div><b>'+t(sk.nama)+'</b><span>'+t(sk.program)+'</span><small>'+t(sk.alamat)+'</small></div></div>';
 h+='<h1 class="rc-h">Riwayat Latihan Siswa</h1>';
 h+='<table class="rc-info"><tr><td>Nama siswa</td><td>: '+(f.q&&String(f.q).trim()?t(String(f.q).trim()):'Semua')+'</td><td>Jumlah latihan</td><td>: '+n+'</td></tr>'+
  '<tr><td>Kelas</td><td>: '+(f.kelas?t(f.kelas):'Semua')+'</td><td>Rata-rata nilai</td><td>: '+avg+'</td></tr>'+
  '<tr><td>Mapel</td><td>: '+(f.mapel?t(f.mapel):'Semua')+'</td><td>Tertinggi / terendah</td><td>: '+(n?mx+' / '+mn:'-')+'</td></tr></table>';
 if(!n)return h+'<p class="rc-kosong">Tidak ada latihan yang cocok dengan filter ini.</p><p class="rc-ft">Dicetak '+t(tg)+' · '+t(sk.nama)+'</p>';
 h+='<table class="rc-t"><thead><tr><th>No</th><th>Nama siswa</th><th>Kelas</th><th>Mapel / modul</th><th>Waktu</th><th>Benar</th><th>Durasi</th><th>Nilai</th></tr></thead><tbody>';
 rows.forEach(function(x,i){
  var jd=typeof bsJudul==='function'?bsJudul(x):(x.sesiJudul||'Latihan soal');
  h+='<tr><td class="c">'+(i+1)+'</td><td>'+t(x.siswa||'Tanpa nama')+'</td><td class="c">'+t(x.kelas||'-')+'</td><td>'+t(jd)+'</td><td>'+t(tgl(x.ts))+'</td><td class="c">'+t((x.benar==null?'-':x.benar)+' / '+(x.total==null?'-':x.total))+'</td><td class="c">'+Math.max(1,Math.round((x.detik||0)/60))+' mnt</td><td class="c"><b>'+t(x.score)+'</b></td></tr>';
 });
 h+='</tbody></table><p class="rc-ft">Dicetak '+t(tg)+' · '+t(sk.nama)+'</p>';
 return h;
}
window.rcBuild=rcBuild;

function bersih(){document.body.classList.remove('rc-printing');var e=document.getElementById('rc-print');if(e)e.remove()}
window.addEventListener('afterprint',bersih);

function cetak(){
 if(typeof bsRlRows!=='function'||typeof BS==='undefined')return;
 bersih();
 var rows=bsRlRows(),el=document.createElement('div');
 el.id='rc-print';el.innerHTML=rcBuild(rows,BS.rl,new Date());
 document.body.appendChild(el);document.body.classList.add('rc-printing');
 var img=el.querySelector('img'),go=function(){setTimeout(function(){window.print()},50)};
 if(img&&!img.complete){img.onload=go;img.onerror=go}else go();
}

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs="cetakrl"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();cetak();
},true);

/* tombol disisipkan setelah kartu filter pada tampilan Riwayat latihan siswa */
if(typeof bsViewRiwayatLatihan==='function'){
 var _rcV=bsViewRiwayatLatihan;
 bsViewRiwayatLatihan=function(){
  var h=_rcV.apply(this,arguments),k='<div class="stack" id="rl-list">',i=h.indexOf(k),
   b='<button type="button" class="btn" data-bs="cetakrl">Cetak riwayat sesuai filter</button>';
  return i<0?h+b:h.slice(0,i)+b+h.slice(i);
 };
}

(function(){
 var s=document.createElement('style');
 s.textContent='#rc-print{display:none}'+
 '@media print{@page{size:A4 landscape;margin:12mm 14mm}'+
 'body.rc-printing>*:not(#rc-print){display:none!important}'+
 'body.rc-printing #rc-print{display:block!important;font-family:"Times New Roman",Times,serif;font-size:10.5pt;line-height:1.3}'+
 '#rc-print,#rc-print *{color:#000!important;background:transparent!important;box-shadow:none!important}'+
 '#rc-print .rc-kop{display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:3px double #000;margin-bottom:8px}'+
 '#rc-print .rc-kop img{width:64px;height:64px;object-fit:contain;flex:0 0 auto;border-radius:0!important}'+
 '#rc-print .rc-kop div{flex:1;text-align:center}#rc-print .rc-kop b{display:block;font-size:15pt;text-transform:uppercase;letter-spacing:.02em}'+
 '#rc-print .rc-kop span{display:block;font-size:11pt;font-weight:600}#rc-print .rc-kop small{display:block;font-size:9pt}'+
 '#rc-print .rc-h{font-size:14pt;text-align:center;margin:6px 0 8px;text-transform:uppercase}'+
 '#rc-print .rc-info{width:100%;border-collapse:collapse;font-size:10.5pt;margin-bottom:8px}#rc-print .rc-info td{padding:1px 4px;vertical-align:top}#rc-print .rc-info td:nth-child(odd){white-space:nowrap;width:1%}'+
 '#rc-print .rc-t{width:100%;border-collapse:collapse;font-size:10pt}'+
 '#rc-print .rc-t th,#rc-print .rc-t td{border:1px solid #000;padding:2px 5px;text-align:left;vertical-align:top}'+
 '#rc-print .rc-t th{font-weight:700;text-align:center}#rc-print .rc-t td.c{text-align:center}'+
 '#rc-print .rc-t thead{display:table-header-group}#rc-print .rc-t tr{break-inside:avoid}'+
 '#rc-print .rc-kosong{text-align:center;margin:20px 0}'+
 '#rc-print .rc-ft{margin-top:10px;font-size:9pt;text-align:center;border-top:1px solid #999;padding-top:3px}'+
 '}';
 document.head.appendChild(s);
})();
})();
