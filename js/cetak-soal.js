/* cetak-soal.js: cetak lembar soal untuk ujian kertas dari Bank soal (guru/admin), lengkap dengan gambar soal dan gambar pilihan.
   - Tombol "Cetak soal" di tab Bank soal. Soal yang dicetak = soal aktif sesuai pencarian/filter yang sedang dipakai.
   - Pilihan: judul, mapel, kelas, waktu, jumlah soal, acak urutan, kunci jawaban (halaman terpisah), pembahasan.
   - Soal dikelompokkan: PG, PG kompleks, PG kategori. Nomor berlanjut agar sama dengan kunci jawaban.
   - Gambar dimuat dulu ke perangkat (sgResolve), lalu dicetak sebagai data URI, jadi tampil juga bila sinyal hilang setelah termuat.
   - Mencetak memakai window.print(): di dialog cetak ponsel pilih "Simpan sebagai PDF" bila ingin berkas.
   Bergantung pada: banksoal.js (bs*), soal-gambar.js (sg*), sekolah.js (SEK), logo.js (LOGO), dialog.js (uiConfirm). */
var CS={img:{},k:null};
var CS_TIPE=['pg','kompleks','kategori','uraian'];
var CS_JUDUL={pg:'A. Pilihan ganda',kompleks:'B. Pilihan ganda kompleks',kategori:'C. Pilihan ganda kategori',uraian:'D. Uraian'};
var CS_PETUNJUK={
 pg:'Pilih satu jawaban yang paling tepat. Beri tanda silang (X) pada huruf pilihan yang benar.',
 kompleks:'Pilih semua jawaban yang benar (lebih dari satu). Beri tanda centang pada kotak di depan pilihan yang benar.',
 kategori:'Tentukan setiap pernyataan, lalu beri tanda centang pada kolom yang sesuai.',
 uraian:'Jawablah pertanyaan berikut dengan uraian pada tempat yang disediakan. Skor maksimum tiap soal tertera di akhir soal.'
};

function csPool(){return (typeof bsFiltered==='function'?bsFiltered():[]).filter(function(q){return q.aktif})}
function csKey(q){
 if(!bsHasKey(q))return '-';
 if(q.tipe==='pg')return bsLtr(q.kunci);
 if(q.tipe==='kompleks')return q.kunci.slice().sort(function(a,b){return a-b}).map(bsLtr).join(', ');
 if(q.tipe==='uraian')return 'Skor maks '+q.maks+'. Rubrik: '+q.rub.map(function(k){return k[0]+' ('+k[1]+')'}).join('; ')+(q.kj?'. Kunci: '+q.kj:'');
 var lab=q.lab||['Benar','Salah'];
 return q.rows.map(function(r,i){return (i+1)+') '+lab[r[1]?0:1]}).join('; ');
}
function csFile(){return '<span class="cs-line"></span>'}

/* ---------- Susun lembar ---------- */
function csImgHtml(ref,cls){
 if(!ref)return '';
 var d=CS.img[ref];
 return d?'<img class="'+cls+'" src="'+d+'" alt="">':'<span class="cs-noimg">[gambar tidak termuat]</span>';
}
function csSoalHtml(q,n){
 var h='<div class="cs-q"><div class="cs-n">'+n+'.</div><div class="cs-b"><div class="cs-t">'+bsText(q.q)+'</div>'+csImgHtml(q.qi,'cs-qi');
 if(q.tipe==='uraian'){
  var nl=q.maks>=10||(q.pj||0)>=1500?9:6,ln='';for(var z=0;z<nl;z++)ln+='<div class="cs-ul"></div>';
  h+='<div class="cs-sk">(skor maksimum '+(q.maks||'')+')</div><div class="cs-ua">'+ln+'</div>';
 }else if(q.tipe==='kategori'){
  var lab=q.lab||['Benar','Salah'];
  h+='<table class="cs-kt"><tr><th>Pernyataan</th><th>'+esc(lab[0])+'</th><th>'+esc(lab[1])+'</th></tr>'+
   q.rows.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td class="c"><i class="cs-box"></i></td><td class="c"><i class="cs-box"></i></td></tr>'}).join('')+'</table>';
 }else{
  h+='<div class="cs-os">'+q.opts.map(function(t,i){
   var g=typeof sgOpt==='function'?sgOpt(q,i):'';
   return '<div class="cs-o">'+(q.tipe==='kompleks'?'<i class="cs-box"></i>':'')+'<b>'+bsLtr(i)+'.</b><span>'+(t?'<span class="cs-ot">'+esc(t)+'</span>':'')+csImgHtml(g,'cs-oi')+'</span></div>';
  }).join('')+'</div>';
 }
 return h+'</div></div>';
}
/* soal satu jenis; anggota grup stimulus dibuat berdampingan agar stimulus tercetak sekali di atas deretannya */
function csJenis(items,t){var g=items.filter(function(q){return q.tipe===t});return typeof sgrAturList==='function'?sgrAturList(g):g}
function csStimHtml(q,a,b){
 var lab=b>a?'Bacalah stimulus berikut untuk soal nomor '+a+' sampai '+b+'.':'Bacalah stimulus berikut untuk soal nomor '+a+'.';
 return '<div class="cs-stim"><div class="cs-sl">'+lab+'</div>'+(q.st?'<div class="cs-st">'+bsText(q.st)+'</div>':'')+csImgHtml(q.si,'cs-qi')+'</div>';
}
function csKop(){
 return '<div class="cs-kop"><img src="'+LOGO+'" alt=""><div><b>'+esc(SEK.nama)+'</b><span>'+esc(SEK.program)+'</span><small>'+esc(SEK.alamat)+'</small></div></div>';
}
function csBuild(items,o){
 var tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 var h=csKop()+'<h1 class="cs-h">'+esc(o.judul||'Lembar Soal')+'</h1>'+
  '<table class="cs-info"><tr><td>Mata pelajaran</td><td>: '+(o.mapel?esc(o.mapel):csFile())+'</td><td>Nama</td><td>: '+csFile()+'</td></tr>'+
  '<tr><td>Kelas</td><td>: '+(o.kelas?esc(o.kelas):csFile())+'</td><td>No. absen</td><td>: '+csFile()+'</td></tr>'+
  '<tr><td>Waktu</td><td>: '+(o.waktu?esc(o.waktu)+' menit':csFile())+'</td><td>Hari / tanggal</td><td>: '+csFile()+'</td></tr>'+
  '<tr><td>Jumlah soal</td><td>: '+items.length+'</td><td>Nilai</td><td>: '+csFile()+'</td></tr></table>';
 var n=0;
 CS_TIPE.forEach(function(t){
  var g=csJenis(items,t);
  if(!g.length)return;
  h+='<div class="cs-sec"><h2>'+CS_JUDUL[t]+'</h2><p class="cs-pt">'+CS_PETUNJUK[t]+'</p></div>';
  g.forEach(function(q,k){
   if(typeof sgrAwal==='function'&&sgrAwal(g,k)){var sp=sgrSpan(g,k);h+=csStimHtml(q,n+sp[0]-k+1,n+sp[1]-k+1)}
   n++;h+=csSoalHtml(q,n);
  });
 });
 h+='<p class="cs-ft">Dicetak '+esc(tgl)+' · '+esc(SEK.nama)+'</p>';
 if(o.kunci){
  var m=0,rows=[];
  CS_TIPE.forEach(function(t){csJenis(items,t).forEach(function(q){m++;rows.push([m,q])})});
  h+='<div class="cs-kunci"><h1 class="cs-h">Kunci jawaban</h1><p class="cs-pt">'+esc(o.judul||'Lembar Soal')+(o.mapel?' · '+esc(o.mapel):'')+' · Hanya untuk guru. Jangan dibagikan kepada siswa.</p>'+
   '<table class="cs-kt cs-kk"><tr><th>No</th><th>Jenis</th><th>Kunci</th>'+(o.bahas?'<th>Pembahasan</th>':'')+'</tr>'+
   rows.map(function(r){var q=r[1];return '<tr><td class="c">'+r[0]+'</td><td>'+esc(BS_TIPE[q.tipe])+'</td><td>'+esc(csKey(q))+'</td>'+(o.bahas?'<td>'+(q.bahas?bsText(q.bahas):'')+'</td>':'')+'</tr>'}).join('')+'</table>'+
   '<p class="cs-pt">Penilaian: PG benar = 1, salah = 0. PG kompleks = (pilihan benar dipilih dikurangi pilihan salah dipilih) dibagi jumlah kunci, minimal 0. PG kategori = jumlah pernyataan tepat dibagi jumlah pernyataan. Nilai = rata-rata skor soal x 100, sama dengan penilaian di aplikasi. Soal uraian dinilai guru memakai rubrik; skor uraian dibagi skor maksimum, lalu dikalikan bobot soal (bawaan 2) dalam rata-rata nilai.</p></div>';
 }
 return h;
}

/* ---------- Cetak ---------- */
function csBersih(){document.body.classList.remove('cs-printing');var e=document.getElementById('cs-print');if(e)e.remove()}
window.addEventListener('afterprint',csBersih);

/* muat semua gambar; kembalikan jumlah yang gagal */
function csMuat(items){
 var refs=[];
 items.forEach(function(q){sgRefs(q).forEach(function(r){if(refs.indexOf(r)<0)refs.push(r)})});
 CS.img={};
 if(!refs.length)return Promise.resolve(0);
 var i=0,gagal=0;
 function jalan(){
  if(i>=refs.length)return Promise.resolve();
  var r=refs[i++];
  return sgResolve(r).then(function(d){if(d)CS.img[r]=d;else gagal++}).then(jalan);
 }
 return Promise.all([jalan(),jalan(),jalan(),jalan()]).then(function(){return gagal});
}
function csBaca(){
 var g=function(id){var e=document.getElementById(id);return e?e.value:''};
 var c=function(id){var e=document.getElementById(id);return !!(e&&e.checked)};
 return {judul:g('cs-judul').trim(),mapel:g('cs-mapel').trim(),kelas:g('cs-kelas').trim(),waktu:g('cs-waktu').trim(),jumlah:parseInt(g('cs-jumlah'),10)||0,acak:c('cs-acak'),kunci:c('cs-kunci'),bahas:c('cs-bahas')};
}
function csPilih(pool,o){
 var a=o.acak?bsShuffle(pool):pool.slice();
 var n=Math.max(1,Math.min(o.jumlah||a.length,a.length,200));
 return typeof sgrPilih==='function'?sgrPilih(a,n):a.slice(0,n);
}
function csJalan(){
 if(CS.k)return;
 var o=csBaca(),items=csPilih(csPool(),o);
 if(!items.length){toast('Tidak ada soal untuk dicetak.');return}
 CS.k=1;
 var btn=document.getElementById('cs-go');if(btn){btn.disabled=true;btn.textContent='Menyiapkan…'}
 csMuat(items).then(function(gagal){
  var lanjut=gagal?uiConfirm(gagal+' gambar belum termuat (periksa sinyal). Tetap cetak? Tempat gambar akan diberi keterangan.',{ok:'Tetap cetak'}):Promise.resolve(true);
  return Promise.resolve(lanjut).then(function(ok){
   if(!ok){return}
   csBersih();
   var el=document.createElement('div');el.id='cs-print';el.innerHTML=csBuild(items,o);document.body.appendChild(el);
   csTutup();
   document.body.classList.add('cs-printing');
   /* beri waktu gambar dipasang sebelum dialog cetak */
   var imgs=Array.prototype.slice.call(el.querySelectorAll('img')),tunggu=imgs.map(function(im){return im.complete?Promise.resolve():new Promise(function(r){im.onload=im.onerror=r})});
   return Promise.all(tunggu).then(function(){setTimeout(function(){window.print()},50)});
  });
 }).catch(function(){csBersih();toast('Gagal menyiapkan lembar soal.')}).then(function(){
  CS.k=null;var b=document.getElementById('cs-go');if(b){b.disabled=false;b.textContent='Cetak'}
 });
}

/* ---------- Dialog pengaturan ---------- */
function csTutup(){var m=document.getElementById('cs-modal');if(m)m.remove()}
function csBuka(){
 if(!(typeof bsEdit==='function'&&bsEdit())){toast('Hanya guru dan admin yang dapat mencetak soal.');return}
 var pool=csPool();
 if(!pool.length){toast('Tidak ada soal aktif pada daftar ini. Ubah pencarian atau filter dulu.');return}
 csTutup();
 var f=BS.flt,mp={};pool.forEach(function(q){if(q.mapel)mp[q.mapel]=1});
 var mapel=f.mapel||(Object.keys(mp).length===1?Object.keys(mp)[0]:'');
 var bergambar=pool.filter(function(q){return typeof sgAda==='function'&&sgAda(q)}).length;
 var m=document.createElement('div');m.id='cs-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Cetak soal');
 m.innerHTML='<div class="cs-card"><h2>Cetak soal</h2>'+
  '<p class="note">'+pool.length+' soal aktif sesuai pencarian dan filter saat ini'+(bergambar?', '+bergambar+' di antaranya bergambar':'')+'.</p>'+
  '<label class="f">Judul<input id="cs-judul" value="Lembar Soal" maxlength="80"></label>'+
  '<label class="f">Mata pelajaran<input id="cs-mapel" value="'+esc(mapel)+'" maxlength="80"></label>'+
  '<div class="two"><label class="f">Kelas<input id="cs-kelas" maxlength="20" placeholder="Boleh kosong"></label><label class="f">Waktu (menit)<input id="cs-waktu" type="number" inputmode="numeric" min="1" max="600" placeholder="Boleh kosong"></label></div>'+
  '<label class="f">Jumlah soal<input id="cs-jumlah" type="number" inputmode="numeric" min="1" max="'+Math.min(200,pool.length)+'" value="'+Math.min(200,pool.length)+'"></label>'+
  '<label class="cs-ck"><input id="cs-acak" type="checkbox"> Acak urutan soal</label>'+
  '<label class="cs-ck"><input id="cs-kunci" type="checkbox" checked> Sertakan kunci jawaban (halaman terpisah, untuk guru)</label>'+
  '<label class="cs-ck"><input id="cs-bahas" type="checkbox"> Sertakan pembahasan di kunci</label>'+
  '<p class="note">Pilih "Simpan sebagai PDF" di dialog cetak bila ingin berkas. Gambar dimuat dulu, jadi perlu sinyal sekali bila gambar belum pernah dibuka di perangkat ini.</p>'+
  '<div class="row"><button type="button" class="btn" id="cs-batal">Batal</button><button type="button" class="btn primary grow" id="cs-go">Cetak</button></div></div>';
 document.body.appendChild(m);
 document.getElementById('cs-batal').addEventListener('click',csTutup);
 document.getElementById('cs-go').addEventListener('click',csJalan);
 m.addEventListener('click',function(e){if(e.target===m)csTutup()});
 var j=document.getElementById('cs-judul');if(j)j.focus();
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs="cetaksoal"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 csBuka();
},true);

/* tombol Cetak soal di tab Bank soal (disisipkan sebelum kartu pencarian) */
if(typeof bsViewBank==='function'){
 var _csVB=bsViewBank;
 bsViewBank=function(){
  var h=_csVB.apply(this,arguments),k='<div class="card"><label class="f">Cari<',i=h.indexOf(k),b='<button type="button" class="btn" data-bs="cetaksoal">Cetak soal untuk ujian kertas</button>';
  return i<0?b+h:h.slice(0,i)+b+h.slice(i);
 };
}

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='#cs-print{display:none}'+
 '#cs-modal{position:fixed;inset:0;z-index:60;background:rgba(6,20,12,.5);display:flex;align-items:flex-end;justify-content:center;padding:0}'+
 '#cs-modal .cs-card{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:var(--surface,#fff);color:var(--text,inherit);border-radius:18px 18px 0 0;padding:16px 16px 20px;display:grid;gap:10px}'+
 '@media(min-width:640px){#cs-modal{align-items:center}#cs-modal .cs-card{border-radius:18px}}'+
 '#cs-modal .cs-ck{display:flex;gap:8px;align-items:center;font-size:14px}#cs-modal .cs-ck input{width:20px;height:20px;flex:none}'+
 '@media print{@page{size:A4;margin:12mm 14mm}'+
 'body.cs-printing>*:not(#cs-print){display:none!important}'+
 'body.cs-printing #cs-print{display:block!important;font-family:"Times New Roman",Times,serif;font-size:11.5pt;line-height:1.35}'+
 '#cs-print,#cs-print *{color:#000!important;background:transparent!important;box-shadow:none!important}'+
 '#cs-print .cs-kop{display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:3px double #000;margin-bottom:8px}'+
 '#cs-print .cs-kop img{width:64px;height:64px;object-fit:contain;flex:0 0 auto}'+
 '#cs-print .cs-kop div{flex:1;text-align:center}#cs-print .cs-kop b{display:block;font-size:15pt;text-transform:uppercase;letter-spacing:.02em}'+
 '#cs-print .cs-kop span{display:block;font-size:11pt;font-weight:600}#cs-print .cs-kop small{display:block;font-size:9pt}'+
 '#cs-print .cs-h{font-size:14pt;text-align:center;margin:6px 0 8px;text-transform:uppercase}'+
 '#cs-print .cs-info{width:100%;border-collapse:collapse;font-size:11pt;margin-bottom:6px}#cs-print .cs-info td{padding:2px 4px;vertical-align:bottom}#cs-print .cs-info td:nth-child(2n+1){white-space:nowrap}'+
 '#cs-print .cs-line{display:inline-block;min-width:42mm;border-bottom:1px dotted #000;height:1em}'+
 '#cs-print .cs-sec{margin-top:10px;break-after:avoid}#cs-print .cs-sec h2{font-size:12pt;margin:0 0 2px;border-bottom:1px solid #000}#cs-print .cs-pt{margin:2px 0 4px;font-size:10pt;font-style:italic}'+
 '#cs-print .cs-q{display:flex;gap:6px;margin:0 0 8px;break-inside:avoid}#cs-print .cs-n{flex:0 0 8mm;text-align:right;font-weight:700}#cs-print .cs-b{flex:1;min-width:0}'+
 '#cs-print .cs-qi{display:block;max-width:100%;max-height:62mm;object-fit:contain;margin:4px 0;border:1px solid #999}'+
 '#cs-print .cs-stim{border:1px solid #000!important;padding:2mm 3mm;margin:6px 0 8px;break-inside:avoid}#cs-print .cs-sl{font-weight:700;font-size:10pt;margin-bottom:2px}#cs-print .cs-st{text-align:justify}'+
 '#cs-print .cs-sk{font-size:90%;margin:3px 0 0;font-style:italic}#cs-print .cs-ua{margin-top:2mm}#cs-print .cs-ul{border-bottom:1px dotted #444;height:8mm}'+
 '#cs-print .cs-o{display:flex;gap:5px;align-items:flex-start;margin:2px 0}#cs-print .cs-o>b{flex:0 0 6mm}#cs-print .cs-o>span{flex:1;min-width:0}'+
 '#cs-print .cs-oi{display:block;max-width:100%;max-height:36mm;object-fit:contain;margin-top:2px;border:1px solid #bbb}#cs-print .cs-ot+.cs-oi{margin-top:3px}'+
 '#cs-print .cs-box{display:inline-block;flex:0 0 3.4mm;width:3.4mm;height:3.4mm;border:.3mm solid #000;margin-top:1.2mm}'+
 '#cs-print .cs-noimg{display:inline-block;border:1px dashed #000;padding:2mm 4mm;font-size:9pt}'+
 '#cs-print .cs-kt{width:100%;border-collapse:collapse;margin:4px 0;font-size:11pt}#cs-print .cs-kt th,#cs-print .cs-kt td{border:1px solid #000;padding:2px 5px;text-align:left;vertical-align:top}'+
 '#cs-print .cs-kt th:not(:first-child),#cs-print .cs-kt td.c{text-align:center;width:22mm}#cs-print .cs-kt tr{break-inside:avoid}#cs-print .cs-kt .cs-box{margin:0}'+
 '#cs-print .cs-kk td:nth-child(2){width:32mm}#cs-print .cs-kk th:not(:first-child){text-align:left;width:auto}#cs-print .cs-kk td.c{width:12mm}'+
 '#cs-print .cs-ft{margin-top:10px;font-size:9pt;text-align:center;border-top:1px solid #999;padding-top:3px}'+
 '#cs-print .cs-kunci{break-before:page}'+
 '}';
 document.head.appendChild(s);
})();
