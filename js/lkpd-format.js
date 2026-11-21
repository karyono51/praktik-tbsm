/* lkpd-format.js: format cetak PDF LKPD (kop, judul hijau, identitas dua kolom, banner pertemuan, tabel isian, tanda tangan,
   nomor halaman). Disusun dari DATA modul, bukan dari tampilan layar, sehingga hasilnya sama di semua perangkat.
   - Modul v2 (m.v2): Tujuan, Rencana pertemuan, lalu satu banner per pertemuan berisi pemantik, materi, gerbang masuk, alat dan bahan,
     K3 dan APD, langkah, tabel F1..Fn, pemeriksaan dan bukti, latihan membaca skala, analisis, refleksi, tindak lanjut, penilaian kinerja.
   - Modul v1 dan LKPD buatan guru (tanpa m.v2): Tujuan, Materi, Alat dan bahan, Checklist K3, Prosedur praktik, Hasil pemeriksaan,
     Diagnosis dan analisis, Evaluasi pengetahuan, Bobot penilaian.
   Isian siswa dari draf ikut tercetak pada garis isian; cetakan guru, admin, dan pratinjau berupa lembar kosong.
   Dipanggil oleh lkpd-cetak.js (window.lkfBangun). Bila gagal, lkpd-cetak.js memakai format lama. Nomor halaman memakai @page margin box
   (Chrome 131+, Edge, Android Chrome terbaru); peramban lama mencetak tanpa nomor halaman. */
(function(){
var HIJAU='#1b5e20';
var CSS='@media print{'+
'#lk-print,#lk-print *{-webkit-print-color-adjust:exact;print-color-adjust:exact}'+
'#lk-print .lkf{font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.35}'+
'#lk-print table.lkf-kop{width:100%;border-collapse:collapse;margin-bottom:8px}'+
'#lk-print table.lkf-kop td{border:0!important;border-bottom:2.5px solid #000!important;padding:0 0 6px;vertical-align:middle;text-align:center}#lk-print table.lkf-kop td.lg{width:66px}'+
'#lk-print table.lkf-kop img{width:60px;height:60px;object-fit:contain;border-radius:0!important}'+
'#lk-print table.lkf-kop b{display:block;font-size:16pt;letter-spacing:.02em;text-transform:uppercase}'+
'#lk-print table.lkf-kop span{display:block;font-size:10.5pt}#lk-print table.lkf-kop small{display:block;font-size:8pt;color:#444!important}'+
'#lk-print .lkf-jdl{text-align:center;font-weight:700;font-size:12pt;margin:8px 0 6px;color:'+HIJAU+'!important}'+
'#lk-print table.lkf-id{width:100%;border-collapse:collapse;font-size:9.5pt;margin-bottom:4px}'+
'#lk-print table.lkf-id td{border:0!important;padding:1px 4px;vertical-align:top}#lk-print table.lkf-id td.l{font-weight:700;white-space:nowrap;width:26mm}#lk-print table.lkf-id td.c{width:2mm;padding:1px 0}#lk-print table.lkf-id td.dot{border-bottom:1px dotted #000!important;min-width:40mm}'+
'#lk-print h2.lkf-h{color:'+HIJAU+'!important;font-size:11.5pt;margin:10px 0 3px;break-after:avoid}'+
'#lk-print h3.lkf-h3{font-size:10pt;margin:7px 0 2px;break-after:avoid}'+
'#lk-print table.lkf-ban{width:100%;border-collapse:collapse;margin:12px 0 5px;break-after:avoid;break-inside:avoid}'+
'#lk-print table.lkf-ban td{background:'+HIJAU+'!important;border:0!important;padding:4px 9px;font-weight:700}#lk-print table.lkf-ban td.r{text-align:right;font-weight:400;font-size:9pt;white-space:nowrap}'+
'#lk-print table.lkf-ban td,#lk-print table.lkf-ban td *{color:#fff!important}'+
'#lk-print p{margin:2px 0}#lk-print ul.lkf-ul{margin:2px 0 3px;padding-left:16px}#lk-print ul.lkf-ul li{margin:0}'+
'#lk-print .lkf-note{font-size:9pt;font-style:italic}#lk-print .lkf-small{font-size:8.5pt}'+
'#lk-print .lkf-fill{display:inline-block;min-width:30mm;border-bottom:1px dotted #000;min-height:1.1em;vertical-align:bottom;padding:0 2px;overflow-wrap:anywhere}'+
'#lk-print .lkf-line{display:block;border-bottom:1px dotted #000;min-height:1.5em;white-space:pre-wrap;overflow-wrap:anywhere}'+
'#lk-print table.lkf-t{width:100%;border-collapse:collapse;font-size:9pt;margin:3px 0 5px}'+
'#lk-print table.lkf-t th,#lk-print table.lkf-t td{border:1px solid #666!important;padding:3px 5px;vertical-align:top}'+
'#lk-print table.lkf-t th{background:#e4efe4!important;text-align:center}#lk-print table.lkf-t tr{break-inside:avoid}'+
'#lk-print table.lkf-t td.k{text-align:center}#lk-print table.lkf-t tbody tr.tinggi td{height:9mm}'+
'#lk-print .lkf-q{margin:4px 0;break-inside:avoid}#lk-print .lkf-o{margin:0 0 0 10px}#lk-print .lkf-sel{font-weight:700}'+
'#lk-print .lkf-st{margin:3px 0;break-inside:avoid}#lk-print .lkf-st small{display:block;color:#333!important}'+
'#lk-print .lkf-cek{margin:4px 0;break-inside:avoid}#lk-print .lkf-row{display:flex;gap:14px;flex-wrap:wrap}'+
'#lk-print .lkf-sg{display:block;border:1px solid #888!important;padding:3px 6px;margin:3px 0}'+
'#lk-print .lkf-wkt{margin-top:6px;font-size:9.5pt}'+
'#lk-print img{max-width:100%;max-height:5cm}'+
'}';
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

function E(x){return typeof lkEsc==='function'?lkEsc(x):String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function T(x){return String(x==null?'':x).trim()}
function box(on){return on?'☑':'☐'}
function fill(v,w){return '<span class="lkf-fill"'+(w?' style="min-width:'+w+'mm"':'')+'>'+E(v)+'</span>'}
function garis(v){return '<span class="lkf-line">'+E(v)+'</span>'}
function sen(s){s=T(s);return s?s.charAt(0).toUpperCase()+s.slice(1):s}
function abc(k){return String.fromCharCode(65+k)}

var TIPE={pg:'Pilihan ganda',kompleks:'Pilihan ganda kompleks: jawaban benar lebih dari satu',kategori:'Pilihan ganda kategori: Benar/Salah'};
function tipeSoal(q){return typeof lkqType==='function'?lkqType(q):(q&&q.t)||'pg'}
/* satu soal: PG (huruf; pilihan terpilih ditebalkan), kompleks (kotak centang), kategori (tabel Benar/Salah), isian (garis) */
function soal(q,no,a,opt){
 opt=opt||{};
 var t=tipeSoal(q),h='<div class="lkf-q"><p><b>'+no+'. '+(opt.tipe&&TIPE[t]?'('+TIPE[t]+') ':'')+E(q.q)+'</b></p>'+(typeof lkgQHtml==='function'?lkgQHtml(q):'');
 function og(k){return typeof lkgOHtml==='function'?lkgOHtml(q,k):''}
 if(t==='isian'){h+='<p>Jawab: '+fill(a,40)+(q.u?' '+E(q.u):'')+'</p>'}
 else if(t==='kategori'){
  var lab=q.lab||['Benar','Salah'],ans=a&&typeof a==='object'?a:{};
  h+='<table class="lkf-t"><thead><tr><th>Pernyataan</th><th style="width:16mm">'+E(lab[0])+'</th><th style="width:16mm">'+E(lab[1])+'</th></tr></thead><tbody>'+
   q.rows.map(function(r,k){return '<tr><td>'+E(r[0])+'</td><td class="k">'+box(ans[k]===true)+'</td><td class="k">'+box(ans[k]===false)+'</td></tr>'}).join('')+'</tbody></table>';
 }else if(t==='kompleks'){
  h+=(q.o||[]).map(function(o,k){var on=Array.isArray(a)&&a.indexOf(k)>-1;return '<p class="lkf-o'+(on?' lkf-sel':'')+'">'+box(on)+' '+abc(k)+'. '+E(o)+og(k)+'</p>'}).join('');
 }else{
  h+=(q.o||[]).map(function(o,k){var on=a===k;return '<p class="lkf-o'+(on?' lkf-sel':'')+'">'+(on?'✔ ':'')+abc(k)+'. '+E(o)+og(k)+'</p>'}).join('');
 }
 return h+'</div>';
}
function daftarSoal(m,d,opt){
 return (m.quiz||[]).map(function(q,i){
  var g='';try{if(typeof sgrBox==='function'&&typeof sgrAwal==='function'&&sgrAwal(m.quiz,i))g=sgrBox(q,sgrLabel(m.quiz,i))}catch(e){}
  return g+soal(q,i+1,d['q'+i],opt);
 }).join('');
}

/* ---------- Bagian umum ---------- */
function kop(){
 var S0=typeof SEK!=='undefined'?SEK:{nama:'',program:'',alamat:''};
 return '<table class="lkf-kop"><tbody><tr><td class="lg"><img src="'+(typeof LOGO!=='undefined'?LOGO:'')+'" alt=""></td><td><b>'+E(S0.nama)+'</b><span>'+E(S0.program)+'</span><small>'+E(S0.alamat)+'</small></td><td class="lg"></td></tr></tbody></table>';
}
function row2(a,b){return '<tr><td class="l">'+a[0]+'</td><td class="c">:</td><td>'+a[1]+'</td><td class="l">'+b[0]+'</td><td class="c">:</td><td'+(b[2]?' class="dot"':'')+'>'+b[1]+'</td></tr>'}
function alokasi(m){
 var V=m.v2;
 if(V&&V.pertemuan&&V.pertemuan.length){
  var P=V.pertemuan,tot=P.reduce(function(t,p){return t+p.menit},0),jp=P.reduce(function(t,p){return t+p.jp},0),sama=P.every(function(p){return p.jp===P[0].jp&&p.menit===P[0].menit});
  return sama?P.length+' pertemuan × '+P[0].jp+' JP ('+P.length+' × '+P[0].menit+' menit = '+tot+' menit)':P.length+' pertemuan, '+jp+' JP ('+tot+' menit)';
 }
 return m.duration+' menit';
}
function identitas(m,H){
 var d=H.d,p=H.pihak,v2=!!m.v2;
 var kiri=[['Judul/Materi',E(m.title)],['Mata pelajaran',E(H.mapel)],['Kelas/Semester',E((d.class||m.kelas)+' / '+H.semester)],['Fase/Kurikulum',E('Fase '+m.fase+' / Kurikulum Merdeka')],['Alokasi waktu',E(alokasi(m))]];
 var av=d.vehicle||d.komponen||'';
 var kanan=[['Nama siswa',E(p.siswa),!T(p.siswa)],['Kelas / Kelompok',fill(d.class||'',17)+' / '+fill(d.group||'',17)],['Tanggal',E(p.tanggal),!T(p.tanggal)],[v2?'Asal komponen':'Tipe kendaraan',E(av),!T(av)],['Guru/Instruktur',E(p.guru),!T(p.guru)]];
 return '<table class="lkf-id"><tbody>'+kiri.map(function(x,i){return row2(x,kanan[i])}).join('')+'</tbody></table>';
}
function tujuan(m){
 return '<h2 class="lkf-h">Tujuan pembelajaran</h2><p>Setelah menyelesaikan LKPD ini, kamu mampu:</p><ul class="lkf-ul">'+(m.objectives||[]).map(function(x){return '<li>'+E(x)+'</li>'}).join('')+'</ul>';
}
function materi(m,skip){
 var n=0;
 return '<h2 class="lkf-h">Materi</h2>'+(m.theory||[]).filter(function(x){return !skip||!skip.test(x[0])}).map(function(x){n++;return '<p><b>'+n+'. '+E(x[0])+'</b><br>'+E(x[1])+'</p>'}).join('');
}
function alat(m){return '<h2 class="lkf-h">Alat dan bahan</h2><ul class="lkf-ul">'+(m.tools||[]).map(function(x){return '<li>'+E(x)+'</li>'}).join('')+'</ul>'}
function k3Item(m,d,i,apd){return '<p class="lkf-o">'+box(!!d['safe'+i])+' '+E(m.safety[i])+(apd?' &nbsp; Paraf: '+fill('',16):'')+'</p>'}
function waktu(d,n){return '<p class="lkf-wkt">Waktu aktual pertemuan '+n+': '+fill(d['mt'+n],18)+' menit</p>'}

/* ---------- v2 ---------- */
function gerbang(m,d){
 var V=m.v2,qs=V.gate.qs,off=typeof LK2_GOFF!=='undefined'?LK2_GOFF:100;
 var h='<h2 class="lkf-h">Gerbang masuk praktik</h2><p>Kerjakan semua soal secara mandiri sebelum praktik. Guru memeriksa jawabanmu; syarat lulus minimal '+V.gate.min+' dari '+qs.length+' soal benar. Soal bentuk pilihan ganda kompleks dan benar/salah dinyatakan benar bila semua pilihannya tepat.</p>';
 qs.forEach(function(q,i){
  if(q.o||q.rows)h+=soal(q,i+1,d['q'+(off+i)],{tipe:1});
  else h+='<div class="lkf-q"><p><b>'+(i+1)+'. '+E(q.q)+'</b></p>'+garis(d['gate'+i])+'</div>';
 });
 return h+'<p>Skor gerbang: '+fill('',16)+' dari '+qs.length+' &nbsp; '+box(false)+' Lulus &nbsp; '+box(false)+' Belum lulus (ulangi setelah belajar lagi) &nbsp; Paraf guru: '+fill('',18)+'</p>';
}
function k3v2(m,d){
 var V=m.v2,g=V.k3grup||[{judul:'',i:m.safety.map(function(x,i){return i})}],apd=V.apd||[];
 return '<h2 class="lkf-h">Keselamatan dan kesehatan kerja (K3) dan APD</h2><p class="lkf-note">Centang bila sudah siap. Paraf guru pada butir APD.</p>'+
  g.map(function(x){return (x.judul?'<h3 class="lkf-h3">'+E(x.judul)+'</h3>':'')+x.i.map(function(i){return k3Item(m,d,i,apd.indexOf(i)>-1)}).join('')}).join('');
}
function cekAlat(m){
 var c=m.v2.cekAlat;if(!c||!c.length)return '';
 return '<h2 class="lkf-h">Cek kondisi alat sebelum dipakai</h2>'+c.map(function(x){return '<p class="lkf-o">'+box(false)+' '+E(x)+'</p>'}).join('');
}
function langkah(m,d,k){
 var V=m.v2,n=0;
 return V.langkah.filter(function(l){return l.k===k}).map(function(l){
  n++;var s=m.steps[l.i],t=String(s[0]).replace(/^Kegiatan \d+ · /,'');
  return '<div class="lkf-st"><b>'+n+'. '+E(t)+'</b>'+(d['step'+l.i]?' ✔':'')+'<small>Poin kritis: '+E(s[2])+(l.saksi?' &nbsp; '+box(false)+' Paraf guru':'')+'</small></div>';
 }).join('');
}
function tabelv2(m,t,d,calc){
 var head=[];t.kol.forEach(function(k,j){head.push(k.l);if(j===0&&t.labelBaris)head.push(t.labelBaris)});
 var rows=t.baris.map(function(lb,r){
  var c=[];t.kol.forEach(function(k,j){
   var v;
   if(k.t==='rata'||k.t==='selisih')v=calc&&calc[t.id]&&calc[t.id][r]&&typeof lk2Fmt==='function'?lk2Fmt(calc[t.id][r][k.k]):'';
   else v=d[typeof lk2K==='function'?lk2K(t.id,r,k.k):'t_'+t.id+'_'+r+'_'+k.k]||'';
   c.push('<td'+(k.t==='teks'?'':' class="k"')+'>'+E(v)+'</td>');
   if(j===0&&t.labelBaris)c.push('<td>'+E(lb)+'</td>');
  });
  return '<tr class="tinggi">'+c.join('')+'</tr>';
 }).join('');
 return '<h3 class="lkf-h3">Tabel '+E(t.judul)+'</h3><table class="lkf-t"><thead><tr>'+head.map(function(x){return '<th>'+E(x)+'</th>'}).join('')+'</tr></thead><tbody>'+rows+'</tbody></table>'+
  '<p class="lkf-note lkf-small">Rata-rata dan selisih dihitung dari angka yang diisi. '+(t.cat?E(t.cat):'')+'</p>';
}
function cekv2(m,d,i){
 var x=m.checks[i],foto=(m.fotoWajib||[]).indexOf(i)>-1,sv=T(d['status'+i]),ya=sv==='Baik',tdk=sv==='Perlu tindakan'||sv==='Tidak aman';
 var rinci=[];if(T(d['actual'+i]))rinci.push('Hasil aktual: '+d['actual'+i]);if(T(d['standard'+i]))rinci.push('Standar: '+d['standard'+i]);if(T(d['note'+i]))rinci.push(d['note'+i]);
 return '<div class="lkf-cek"><b>'+E(x[0])+'</b> <span class="lkf-small">'+E(x[1])+(x[2]?' (Acuan: '+E(x[2])+')':'')+'</span><div class="lkf-row">'+
  (foto?'<span>'+box(!!d['foto'+i])+' Foto bukti sudah diambil</span> &nbsp; &nbsp; ':'')+'<span>'+box(ya)+' Sesuai standar</span> &nbsp; &nbsp; <span>'+box(tdk)+' Tidak sesuai</span></div>'+
  '<p>Catatan: '+fill(rinci.join('; '),120)+'</p></div>';
}
function latihan(m,d,ids,nama,pertama){
 if(!ids||!ids.length)return '';
 var h='<h3 class="lkf-h3">Latihan membaca skala '+E(String(nama).toLowerCase())+'</h3>'+(pertama?'<p class="lkf-note">Hitung dari soal, lalu isi hasilnya. Koma atau titik boleh dipakai.</p>':'');
 ids.forEach(function(id){
  var i=-1;(m.quiz||[]).forEach(function(q,j){if(q.id===id)i=j});if(i<0)return;
  var q=m.quiz[i],tk=String(q.q).replace(new RegExp('^'+id+'\\s*·\\s*'),'');
  h+='<div class="lkf-q"><p><b>'+E(id)+'</b> '+E(tk)+'</p><p>Jawab: '+fill(d['q'+i],34)+' '+E(q.u||'')+' &nbsp; Cara hitung: '+fill('',70)+'</p></div>';
 });
 return h;
}
function daftarTanya(arr,d,pre){
 return arr.map(function(q,i){return '<div class="lkf-q"><p>'+(i+1)+'. '+E(q)+'</p>'+garis(d[pre+i])+'</div>'}).join('');
}
function penilaian(m){
 var O=m.v2.obs,stop=O.aspek.filter(function(a){return a.stop})[0],jml=O.aspek.reduce(function(t,a){return t+a.b},0);
 return '<h3 class="lkf-h3">Penilaian kinerja oleh guru</h3><p>Guru menilai kinerjamu saat praktik (skor 1–4 per aspek). Nilai = jumlah (skor ÷ 4 × bobot). Ketuntasan mengikuti KKTP sekolah.'+(stop?' Skor 1 pada '+E(stop.n)+' berarti praktik dihentikan.':'')+'</p>'+
  '<table class="lkf-t"><thead><tr><th>Aspek</th><th>Yang dinilai</th><th style="width:14mm">Bobot</th><th style="width:18mm">Skor (1–4)</th><th style="width:14mm">Nilai</th></tr></thead><tbody>'+
  O.aspek.map(function(a){return '<tr class="tinggi"><td><b>'+E(a.n)+'</b></td><td>'+E(String(a.ket||'').replace(/^Yang dinilai:\s*/,''))+'</td><td class="k">'+a.b+'%</td><td></td><td></td></tr>'}).join('')+
  '<tr><td colspan="2"><b>Jumlah</b></td><td class="k"><b>'+jml+'%</b></td><td></td><td></td></tr></tbody></table>'+
  '<p class="lkf-note">Nilai akhir ditetapkan guru dari penilaian kinerja dan nilai guru (di aplikasi: Observasi LKPD Praktik v2). Nilai otomatis aplikasi hanya perkiraan awal dari kelengkapan pengisian.</p>';
}
function bangunV2(m,H){
 var d=H.d,V=m.v2,calc=null,P=V.pertemuan||[];
 try{if(typeof lk2Calc==='function')calc=lk2Calc(m,d)}catch(e){}
 var jp=P.reduce(function(t,p){return t+p.jp},0);
 var h=tujuan(m)+'<h2 class="lkf-h">Rencana pertemuan</h2><table class="lkf-t"><thead><tr><th>Pertemuan</th><th>JP</th><th>Menit</th><th>Kegiatan</th></tr></thead><tbody>'+
  P.map(function(p){return '<tr><td class="k">'+p.n+'</td><td class="k">'+p.jp+'</td><td class="k">'+p.menit+'</td><td>'+E(sen(p.judul))+'</td></tr>'}).join('')+'</tbody></table>';
 var lastK=0;P.forEach(function(p){(p.kegiatan||[]).forEach(function(k){if(k>lastK)lastK=k})});
 var pemantik=(m.theory||[]).filter(function(x){return /pemantik/i.test(x[0])})[0];
 var first=true;
 P.forEach(function(p,pi){
  var ks=p.kegiatan||[],judul=ks.length?'Kegiatan '+ks.map(function(k){return k+': '+V.kegiatan[k-1]}).join('; '):sen(p.judul);
  h+='<table class="lkf-ban"><tbody><tr><td>Pertemuan '+p.n+' · '+E(judul)+'</td><td class="r">'+p.jp+' JP · target '+p.menit+' menit</td></tr></tbody></table>';
  if(pi===0){
   if(pemantik)h+='<p><b>Pertanyaan pemantik</b><br>'+E(pemantik[1])+'</p>'+garis('')+garis('');
   h+=materi(m,/pemantik/i)+gerbang(m,d)+alat(m)+k3v2(m,d)+cekAlat(m);
  }
  ks.forEach(function(k){
   h+='<h3 class="lkf-h3">Kegiatan '+k+' · '+E(V.kegiatan[k-1])+'</h3>'+langkah(m,d,k);
   V.tabel.filter(function(t){return t.k===k}).forEach(function(t){h+=tabelv2(m,t,d,calc)});
   var ada=false;V.cekK.forEach(function(kk,i){if(kk===k){if(!ada){h+='<h3 class="lkf-h3">Pemeriksaan dan bukti</h3>';ada=true}h+=cekv2(m,d,i)}});
  });
  if(p.latihan&&p.latihan.length){h+=latihan(m,d,p.latihan,ks.length?V.kegiatan[ks[0]-1]:'',first);first=false}
  if(ks.indexOf(lastK)>-1&&V.analisis&&V.analisis.length)h+='<h2 class="lkf-h">Analisis dan keputusan teknis</h2>'+daftarTanya(V.analisis,d,'ana');
  if(pi===P.length-1){
   h+=(V.refleksi&&V.refleksi.length?'<h2 class="lkf-h">Refleksi</h2>'+daftarTanya(V.refleksi,d,'ref'):'');
   if(V.tindak)h+='<h3 class="lkf-h3">Tindak lanjut</h3><p>'+E(V.tindak.remedial||'')+'</p><p>'+E(V.tindak.pengayaan||'')+'</p>';
   if(V.obs&&V.obs.aspek)h+=penilaian(m);
  }
  h+=waktu(d,p.n);
 });
 return h;
}

/* ---------- v1 dan LKPD buatan guru ---------- */
function bangunV1(m,H){
 var d=H.d,h=tujuan(m)+materi(m)+'<p class="lkf-note">Gunakan manual servis dan diagram sistem sesuai tipe kendaraan sebagai acuan utama. Catat spesifikasi pabrikan dan kondisi pengukuran.</p>'+alat(m);
 if((m.safety||[]).length)h+='<h2 class="lkf-h">Checklist K3</h2>'+m.safety.map(function(x,i){return k3Item(m,d,i,false)}).join('');
 h+='<table class="lkf-ban"><tbody><tr><td>Prosedur praktik</td><td class="r">'+m.duration+' menit</td></tr></tbody></table>'+(m.steps||[]).map(function(s,i){
  return '<div class="lkf-st"><b>'+box(!!d['step'+i])+' '+(i+1)+'. '+E(s[0])+(s[1]?' · '+E(s[1])+' menit':'')+'</b><small>'+E(s[2]||'')+'</small></div>';
 }).join('');
 h+='<h2 class="lkf-h">Hasil pemeriksaan</h2><p>Alat ukur/peralatan ukur: '+fill(d.meter,90)+'</p><p>Kondisi awal/catatan pengukuran:</p>'+garis(d.testCondition)+garis('');
 if((m.checks||[]).length)h+='<table class="lkf-t"><thead><tr><th style="width:8mm">No</th><th>Komponen</th><th>Hasil aktual</th><th>Standar manual</th><th>Status</th><th>Catatan</th></tr></thead><tbody>'+m.checks.map(function(x,i){
  var sv=T(d['status'+i]);
  return '<tr class="tinggi"><td class="k">'+(i+1)+'</td><td>'+E(x[0])+'<br><em class="lkf-small">('+E(x[1])+')</em></td><td>'+E(d['actual'+i])+'</td><td>'+E(d['standard'+i])+(x[2]?'<br><em class="lkf-small">Acuan: '+E(x[2])+'</em>':'')+'</td><td>'+E(sv==='Belum diperiksa'?'':sv)+'</td><td>'+E(d['note'+i])+'</td></tr>';
 }).join('')+'</tbody></table>';
 if((m.symptoms||[]).length||true){
  h+='<h2 class="lkf-h">Diagnosis dan analisis</h2>';
  (m.symptoms||[]).forEach(function(x,i){var v=typeof lkYN==='function'?lkYN(d['symptom'+i]):'';h+='<p class="lkf-o">'+E(x)+' &nbsp; '+box(v==='ya')+' Ya &nbsp; '+box(v==='tidak')+' Tidak</p>'});
  [['evidence','Bukti pemeriksaan'],['cause','Analisis kemungkinan penyebab'],['recommend','Rekomendasi tindakan'],['conclusion','Kesimpulan'],['reflection','Refleksi pembelajaran']].forEach(function(x){
   h+='<div class="lkf-q"><p><b>'+x[1]+'</b></p>'+garis(d[x[0]])+garis('')+'</div>';
  });
 }
 if((m.quiz||[]).length)h+='<h2 class="lkf-h">Evaluasi pengetahuan</h2>'+daftarSoal(m,d,{});
 if(m.rubric)h+='<h2 class="lkf-h">Bobot penilaian</h2><p>Praktik: langkah '+m.rubric.steps+'%, K3 '+m.rubric.safety+'%, pemeriksaan '+m.rubric.checks+'%, analisis '+m.rubric.analysis+'%. Nilai akhir: praktik '+m.rubric.practiceWeight+'% + teori '+m.rubric.theoryWeight+'%. KKTP mengikuti pengaturan KKM aplikasi.</p>';
 return h;
}

/* ---------- Penutup halaman: nomor halaman dan identitas lembar ---------- */
function footStyle(m,H,kiriTetap){
 var S0=typeof SEK!=='undefined'?SEK:{nama:''},ju=m.v2&&m.v2.judulPendek||m.id;
 var kiri='LKPD '+(m.kelas==='X'?'DDPK ':'')+'Kelas '+m.kelas+' · '+ju+' · '+S0.nama;
 if(kiriTetap)kiri=kiriTetap;
 kiri=String(kiri).replace(/["\\\n\r<>]/g,' ');
 return '<style>@media print{@page{size:A4;margin:10mm 12mm 16mm;@bottom-left{content:"'+kiri+'";font:8pt Arial,sans-serif;color:#555}@bottom-right{content:"Halaman " counter(page) " dari " counter(pages);font:8pt Arial,sans-serif;color:#555}}}</style>';
}
/* H: {d, pihak, semester, mapel, akhir}. d kosong untuk cetakan guru/pratinjau. */
/* ---------- Kunci dan pembahasan gerbang masuk (khusus guru) ---------- */
function kunciSoal(q){
 var t=tipeSoal(q);
 if(t==='kategori'){var lab=q.lab||['Benar','Salah'];return q.rows.map(function(r,k){return (k+1)+' '+E(r[1]?lab[0]:lab[1])}).join('<br>')}
 if(t==='kompleks'){var L=(q.a||[]).slice().sort(function(x,y){return x-y}).map(abc);return L.length>1?L.slice(0,-1).join(', ')+' dan '+L[L.length-1]:L[0]||''}
 if(q.o)return abc(q.a);
 return E(q.kunci!==undefined?q.kunci:q.a);
}
function hitungKoma(v){return String(v).replace('.',',')}
function kunciBangun(m){
 var V=m.v2,qs=V.gate.qs,BENTUK={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori'},lv={},ur=[];
 qs.forEach(function(q){if(!lv[q.lvl]){lv[q.lvl]=0;ur.push(q.lvl)}lv[q.lvl]++});
 var S0=typeof SEK!=='undefined'?SEK:{nama:''},ju=String(m.title||'').replace(/\s*\([^)]*\)\s*$/,'');
 var h='<div class="lkf">'+footStyle(m,{},'Kunci gerbang masuk · LKPD '+(V.judulPendek||m.id)+' · '+S0.nama+' (khusus guru)')+kop()+
  '<p class="lkf-jdl">KUNCI DAN PEMBAHASAN GERBANG MASUK (UNTUK GURU)</p>'+
  '<p>LKPD '+E(ju)+' · '+(m.kelas==='X'?'DDPK ':'')+'Kelas '+E(m.kelas)+' · Syarat lulus minimal '+V.gate.min+' dari '+qs.length+' soal benar. <b>Dokumen ini tidak dibagikan kepada siswa.</b></p>'+
  '<h2 class="lkf-h">Ketentuan soal</h2><ul class="lkf-ul">'+
  '<li><b>Bentuk soal</b> mengikuti tiga bentuk TKA SMK: pilihan ganda (5 pilihan, 1 kunci), pilihan ganda kompleks (5 pilihan, kunci lebih dari 1), dan pilihan ganda kategori (pernyataan Benar/Salah). Semuanya soal tunggal; stimulus (kasus, data ukur) ada di dalam soal.</li>'+
  '<li><b>Level kognitif:</b> soal HOTS berada pada level Aplikasi dan Penalaran. Sebaran soal gerbang: '+ur.map(function(x){return lv[x]+' '+E(x)}).join(', ')+'.</li>'+
  '<li><b>Pengecoh</b> dibuat dari kesalahan umum siswa, bukan jawaban yang jelas keliru.</li>'+
  '<li><b>Penskoran gerbang:</b> tiap soal benar = 1; soal kompleks dan kategori benar bila semua pilihan tepat.</li></ul>'+
  '<h2 class="lkf-h">Kunci</h2><table class="lkf-t"><thead><tr><th style="width:9mm">No</th><th style="width:22mm">Bentuk</th><th style="width:20mm">Level</th><th style="width:26mm">Kunci</th><th>Pembahasan</th></tr></thead><tbody>'+
  qs.map(function(q,i){return '<tr><td class="k">'+(i+1)+'</td><td>'+E(BENTUK[tipeSoal(q)]||tipeSoal(q))+'</td><td>'+E(q.lvl||'')+'</td><td><b>'+kunciSoal(q)+'</b></td><td>'+E(q.e||'')+'</td></tr>'}).join('')+'</tbody></table>';
 if(V.peta&&V.peta.length)h+='<h2 class="lkf-h">Peta ke soal lama</h2><table class="lkf-t"><thead><tr><th>Soal lama (isian)</th><th>Soal baru</th></tr></thead><tbody>'+V.peta.map(function(x,i){return '<tr><td>'+(i+1)+'. '+E(x[0])+'</td><td>'+E(x[1])+'</td></tr>'}).join('')+'</tbody></table>';
 var lat=(m.quiz||[]).filter(function(q){return q.id&&q.kunci!==undefined&&q.kunci!==null&&q.kunci!==''});
 if(lat.length){
  var satuan=lat[0].u||'';
  h+='<h2 class="lkf-h">Kunci jawaban latihan (untuk guru)</h2><table class="lkf-t"><thead><tr>'+lat.map(function(q){return '<th>'+E(q.id)+'</th>'}).join('')+'</tr></thead><tbody><tr>'+lat.map(function(q){return '<td class="k">'+E(hitungKoma(q.kunci))+'</td>'}).join('')+'</tr></tbody></table>'+
   '<p class="lkf-note lkf-small">'+(satuan?'Satuan: '+E(satuan)+'. ':'')+lat.filter(function(q){return q.e}).map(function(q){return E(q.id)+' = '+E(String(q.e).replace(/[.\s]+$/,''))}).join('; ')+'.</p>';
 }
 return h+'</div>';
}
window.lkfKunci=kunciBangun;
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="lk-print-kunci"]');if(!b)return;
 e.stopPropagation();e.preventDefault();
 try{
  if(typeof isStaff!=='function'||!isStaff()){toast('Kunci hanya untuk guru dan admin');return}
  var m=(typeof LKPD_MODULES!=='undefined'?LKPD_MODULES:[]).find(function(x){return x.id===LK.module});
  if(!m||!m.v2||!m.v2.gate||!m.v2.gate.qs||!m.v2.gate.qs.length){toast('LKPD ini belum punya gerbang masuk');return}
  var lama=document.getElementById('lk-print');if(lama)lama.remove();
  var el=document.createElement('div');el.id='lk-print';el.innerHTML=kunciBangun(m);document.body.appendChild(el);
  var t0=document.title,nm=window.LKC&&window.LKC.namaPdf?window.LKC.namaPdf(m):'LKPD '+m.id;
  document.title='Kunci '+nm;document.body.classList.add('lk-printing');
  var pulih=function(){document.body.classList.remove('lk-printing');document.title=t0;window.removeEventListener('afterprint',pulih)};
  window.addEventListener('afterprint',pulih);
  window.print();
 }catch(err){try{document.body.classList.remove('lk-printing')}catch(x){}try{toast('Kunci gagal dicetak')}catch(x){}}
},true);
window.lkfBangun=function(m,H){
 H.d=H.d||{};
 return '<div class="lkf">'+footStyle(m,H)+kop()+'<p class="lkf-jdl">LEMBAR KERJA PESERTA DIDIK (LKPD) PRAKTIK</p>'+identitas(m,H)+(m.v2&&m.v2.ver===2&&m.v2.pertemuan?bangunV2(m,H):bangunV1(m,H))+(H.akhir||'')+'</div>';
};
})();
