/* lkpd-v2-editor.js: Edit LKPD untuk LKPD v2 (pilot LKPD-X-07) dan tombol foto pada Materi dan Soal evaluasi.
   Berdiri sendiri: membungkus fungsi lkpd-editor.js, lkpd-gambar.js, lkpd-soal.js, dan lkpd.js tanpa mengubah berkasnya.
   Dimuat paling akhir di antara berkas LKPD (setelah lkpd-samakan.js dan soal-grup.js).

   1. Foto pada Materi (Teori ringkas / "Memahami"): tiap topik teori punya tombol Tambah/Ganti/Hapus foto di editor, tab Tujuan & teori.
      Penanda foto disimpan sebagai elemen ketiga baris teori: [topik, uraian, 'drive:<id>'] (sebelum terunggah 'tmp:<id>').
      Tampil di Materi siswa dan di cetak. Mesin gambar yang sama dengan soal (soal-gambar.js): dikecilkan otomatis, disimpan di
      Google Drive lewat fungsi foto-drive, disalin ke IndexedDB perangkat supaya tetap tampil saat offline. Unggahan ke Drive
      terjadi saat modul disinkronkan (sama seperti gambar soal).
   2. Soal evaluasi: tombol foto soal sudah ada pada PG, PG kompleks, dan PG kategori. Soal isian angka (t:'isian') kini punya
      editor sendiri (pertanyaan, foto, kunci, toleransi, satuan, pembahasan) dan fotonya tampil di soal siswa. Sebelumnya soal isian
      tampil berlabel "undefined" dan dipaksa menjadi PG, sehingga kunci dan gambar skala hilang bila disimpan.
   3. Editor aman untuk LKPD v2: objek m.v2 (rencana pertemuan, gerbang, tabel, observasi) dan kolom lain dipertahankan saat menyimpan;
      pemeriksaan alokasi 1–600 menit dan menit per langkah tidak berlaku (waktu v2 diatur per pertemuan); jumlah/urutan langkah, butir K3,
      dan komponen pemeriksaan dikunci karena terhubung ke indeks v2 (teksnya tetap bisa diubah).
   4. Soal gerbang masuk v2 dapat diedit penuh di tab Soal (teks, pilihan, kunci, level Aplikasi/Penalaran, pembahasan, urutan, tambah/hapus).
   Bergantung pada: lkpd-editor.js (lke*), lkpd-gambar.js (lkg*), soal-gambar.js (sg*), lkpd-soal.js (lkq*), lkpd.js. */
var LKV={SKIP:{r:1,d:1,payload:1,updatedAt:1,updatedBy:1},MAXG:10};

function lkvIs(d){return !!(d&&d.src&&d.src.v2&&d.src.v2.ver===2)}
function lkvRefOk(r){return typeof r==='string'&&/^(drive:|tmp:|data:image\/)/.test(r)}

/* ---------- Gambar pada Materi: tampilan siswa dan cetak ---------- */
function lkvMateriImg(x){
 var r=x&&x[2];
 return lkvRefOk(r)&&typeof sgImg==='function'?'<div class="sg-qwrap">'+sgImg(r,'sg-q ld-zoom','Foto materi: '+(x[0]||''))+'</div>':'';
}

/* ---------- Gambar pada Materi: editor ---------- */
function lkvBox(d,i){
 var r=d.S.theory[i]||[],ref=lkvRefOk(r[2])?r[2]:'';
 var h='<div class="sg-box">';
 if(ref&&typeof sgImg==='function')h+=sgImg(ref,'sg-th ld-zoom','Pratinjau foto materi');
 h+='<button type="button" class="btn small" data-lkv-a="m-img" data-i="'+i+'">'+(ref?'Ganti':'Tambah')+' foto</button>';
 if(ref)h+='<button type="button" class="btn small danger" data-lkv-a="m-img-del" data-i="'+i+'">Hapus foto</button>';
 return h+'</div>';
}
(function(){
 var p0=lkePairs;
 lkePairs=function(d,p){
  var html=p0.apply(this,arguments);
  if(p!=='theory')return html;
  return html.replace(/(<textarea[^>]*data-lke="theory\.(\d+)\.1"[^>]*>[\s\S]*?<\/textarea>)/g,function(_,ta,i){return ta+lkvBox(d,+i)});
 };
})();
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lkv-a]');if(!b)return;
 var d=LK.editor;if(!d||!d.S||!isStaff())return;
 e.stopPropagation();
 var r=d.S.theory[+b.dataset.i];if(!r)return;
 if(b.dataset.lkvA==='m-img'){
  if(typeof sgPilih!=='function'){toast('Pengolah gambar belum siap. Muat ulang aplikasi.');return}
  sgPilih(function(data){
   var id='tmp:'+uid();
   sgPut(id,data).then(function(ok){
    if(LK.editor!==d)return;
    r[2]=ok?id:data;          /* IndexedDB tidak tersedia: simpan langsung, tetap terunggah saat sinkron */
    lkeRe();
   });
  });
 }else{r[2]='';lkeRe()}
},true);

/* Penanda foto ikut modul yang disimpan: baris teori [topik, uraian, foto] */
(function(){
 var b0=lkeBuild;
 lkeBuild=function(d){
  var m=b0.apply(this,arguments),s=d.S,n=0,src=d.src;
  s.theory.forEach(function(r){
   if(lkeBlank(r))return;
   if(lkvRefOk(r[2])&&m.theory[n])m.theory[n].push(r[2]);
   n++;
  });
  /* LKPD v2: pertahankan objek v2 dan kolom lain yang tidak diedit di sini */
  if(src&&src.v2){
   Object.keys(src).forEach(function(k){if(k.charAt(0)==='$'||LKV.SKIP[k]||m[k]!==undefined)return;m[k]=lkeCp(src[k])});
   m.v2=lkeCp(src.v2);m.version=src.version||2;
  }
  return m;
 };
})();

/* Daftar foto ikut hitungan (unggah Drive, siapkan offline, peringatan Excel) */
(function(){
 var r0=lkgModRefs;
 lkgModRefs=function(m){
  var a=r0.apply(this,arguments);
  (m&&m.theory||[]).forEach(function(x){var r=x&&x[2];if(lkvRefOk(r)&&a.indexOf(r)<0)a.push(r)});
  return a;
 };
 lkgModAda=function(m){return lkgModRefs(m).length>0};
 var u0=lkgUploadModul;
 lkgUploadModul=async function(m){
  var ubah=await u0.apply(this,arguments);
  if(m&&Array.isArray(m.theory)){
   var base='LKPD_'+sgSlug(m.id,24);
   for(var i=0;i<m.theory.length;i++){
    var x=m.theory[i];
    if(x&&lkvRefOk(x[2])&&x[2].indexOf('drive:')!==0){x[2]=await sgUploadRef(x[2],base+'_materi'+(i+1));ubah=true}
   }
  }
  return ubah;
 };
})();

/* ---------- Soal isian angka: editor ---------- */
(function(){
 var n0=lkeNewQ;
 lkeNewQ=function(t){
  if(t==='isian')return {t:'isian',q:'',kunci:'',tol:0.01,u:'',e:''};
  return n0.apply(this,arguments);
 };
 var c0=lkeClean;
 lkeClean=function(q){
  if(!q||q.t!=='isian')return c0.apply(this,arguments);
  var out=Object.assign({},q),tol=lkeNum(q.tol),e=lkeT(q.e),u=lkeT(q.u);
  out.q=lkeT(q.q);out.kunci=lkeNum(q.kunci);
  if(tol>=0)out.tol=tol;else delete out.tol;
  if(u)out.u=u;else delete out.u;
  if(e)out.e=e;else delete out.e;
  if(!q.qi)delete out.qi;
  return out;
 };
 var i0=lkeQIssue;
 lkeQIssue=function(q){
  if(!q||q.t!=='isian')return i0.apply(this,arguments);
  if(!lkeT(q.q))return 'Pertanyaan belum diisi';
  if(!isFinite(lkeNum(q.kunci)))return 'Kunci jawaban (angka) belum diisi';
  if(lkeT(q.tol)!==''&&!(lkeNum(q.tol)>=0))return 'Toleransi harus angka 0 atau lebih';
  return '';
 };
 var h0=lkeQHtml;
 lkeQHtml=function(d,q,i){
  if(!q||q.t!=='isian')return h0.apply(this,arguments);
  var c=lkeClean(q),iss=lkeQIssue(q),open=d.qi===i,n=d.S.quiz.length;
  var head='<button type="button" class="lke-qh" data-lke-a="q-open" data-i="'+i+'" aria-expanded="'+open+'"><span class="pill'+(iss?' warn':' ok')+'">'+(i+1)+'</span><b>'+(c.q?esc(c.q):'<span class="muted">Soal belum diisi</span>')+'</b>'+(q.qi?'<span class="pill plain">Foto</span>':'')+'<span class="pill plain">Isian angka</span></button>';
  if(!open)return '<div class="lke-q'+(iss?' err':'')+'">'+head+'</div>';
  var b='<div class="lke-qb">'+
   '<label class="f">Pertanyaan<textarea rows="3" data-lke="quiz.'+i+'.q" placeholder="Tulis pertanyaan">'+esc(q.q)+'</textarea></label>'+
   (typeof lkgBox==='function'?lkgBox(q,i,'q'):'')+
   (q.g?'<p class="note">Gambar skala dibuat otomatis dari data gambar soal ini (siswa melihatnya tanpa label jawaban). Nilai pada gambar tidak diubah di editor; bila kunci diganti, pastikan sesuai dengan gambar. Foto yang ditambahkan tampil di bawahnya.</p>':'')+
   '<div class="two"><label class="f">Kunci jawaban (angka)<input inputmode="decimal" data-lke="quiz.'+i+'.kunci" value="'+esc(q.kunci)+'" placeholder="contoh: 45,55"></label>'+
   '<label class="f">Toleransi<input inputmode="decimal" data-lke="quiz.'+i+'.tol" value="'+esc(q.tol===undefined?'':q.tol)+'" placeholder="contoh: 0,01"></label></div>'+
   '<label class="f">Satuan (opsional)<input data-lke="quiz.'+i+'.u" value="'+esc(q.u||'')+'" placeholder="contoh: mm"></label>'+
   '<label class="f">Pembahasan (opsional)<textarea rows="2" data-lke="quiz.'+i+'.e" placeholder="Penjelasan jawaban yang benar">'+esc(q.e||'')+'</textarea></label>'+
   (iss?'<div class="lke-qerr">'+esc(iss)+'</div>':'')+
   '<div class="row" style="gap:6px;flex-wrap:wrap">'+lkeIc('q-up','quiz',i,'Naikkan soal','↑ Naik',i===0,'')+lkeIc('q-down','quiz',i,'Turunkan soal','↓ Turun',i===n-1,'')+
   '<button type="button" class="btn small" data-lke-a="q-dup" data-i="'+i+'">Duplikat</button><button type="button" class="btn small danger" data-lke-a="q-del" data-i="'+i+'">Hapus soal</button></div></div>';
  return '<div class="lke-q open'+(iss?' err':'')+'">'+head+b+'</div>';
 };
 /* ringkasan jumlah soal memuat isian angka */
 var k0=lkeCalc;
 lkeCalc=function(d){
  var h=k0.apply(this,arguments);
  if(d.tab!=='soal')return h;
  var n=d.S.quiz.filter(function(q){return q&&q.t==='isian'}).length;
  return n?h.replace('</span>',' · '+n+' isian angka</span>'):h;
 };
 /* LKPD v2: tombol tambah soal isian angka */
 var t0=lkeTabSoal;
 lkeTabSoal=function(d){
  var h=t0.apply(this,arguments);
  if(!lkvIs(d)||d.json)return h;
  return h.replace('data-v="kategori">+ PG kategori</button>',function(s){return s+'<button type="button" class="btn small primary" data-lke-a="q-add" data-v="isian">+ Isian angka</button>'});
 };
 /* tampilan siswa: foto soal isian (soal PG, kompleks, kategori sudah ditangani lkpd-soal.js) */
 var r1=lkqRender;
 lkqRender=function(q,i,d){
  var h=r1.apply(this,arguments);
  if(q&&q.t==='isian'&&lkvRefOk(q.qi)&&typeof sgImg==='function'){
   var k=h.indexOf('</b>');
   if(k>-1)h=h.slice(0,k+4)+'<div class="sg-qwrap">'+sgImg(q.qi,'sg-q ld-zoom','Gambar soal')+'</div>'+h.slice(k+4);
  }
  return h;
 };
})();

/* ---------- LKPD v2: pemeriksaan dan penguncian struktur ---------- */
(function(){
 var is0=lkeIssues;
 lkeIssues=function(d){
  var I=is0.apply(this,arguments);
  if(!lkvIs(d))return I;
  return I.filter(function(x){return x.tab!=='langkah'&&!(x.tab==='info'&&/^Alokasi waktu/.test(x.msg))});
 };
 var v0=lkValidateModule;
 lkValidateModule=function(m){
  if(!m||!m.v2||m.v2.ver!==2)return v0.apply(this,arguments);
  /* waktu v2 per pertemuan: periksa sisanya dengan menit langkah 1 dan alokasi sama dengan jumlah langkah */
  var c=Object.assign({},m);
  c.steps=(m.steps||[]).map(function(x){return [x[0],1,x[2]]});c.duration=c.steps.length;
  return v0.call(this,c);
 };
 var k1=lkeCalc;
 lkeCalc=function(d){
  if(lkvIs(d)&&d.tab==='langkah')return '<span class="note">Waktu LKPD v2 diatur per pertemuan (total '+esc(d.S.duration)+' menit), bukan per langkah.</span>';
  return k1.apply(this,arguments);
 };
 var f0=lkEditorForm;
 lkEditorForm=function(d){
  var h=f0.apply(this,arguments);
  if(!lkvIs(d))return h;
  var catatan='<p class="note">LKPD v2: jumlah dan urutan butir ini dikunci karena terhubung ke rencana pertemuan, tabel, dan observasi v2. Teksnya tetap bisa diubah.</p>';
  h=h.replace(/<button[^>]*data-lke-a="(?:up|down|del|add|paste-open)"[^>]*data-p="(?:steps|safety|checks)"[^>]*>[^<]*<\/button>/g,'');
  h=h.replace(/<input type="number"[^>]*data-lke="steps\.\d+\.m"[^>]*>/g,'').replace(/style="grid-template-columns:1fr 92px"/g,'');
  if(d.tab==='langkah'||d.tab==='cek')h=h.replace('<section class="card">',function(s){return s+catatan});
  else if(d.tab==='bahan')h=h.replace('<h3>Keselamatan dan kesehatan kerja (K3)</h3>',function(s){return s+catatan});
  return h;
 };
})();

/* ---------- LKPD v2: foto pada soal gerbang masuk (Materi) ---------- */
/* Soal gerbang ada di m.v2.gate.qs. Editor mengelola teks, pilihan, kunci, level, pembahasan, urutan, tambah/hapus (minimal 3, maksimal 10), dan foto (qi untuk soal, oi untuk pilihan).
   Salinan kerja ada di d.S.gate dan ditulis kembali ke m.v2.gate.qs saat menyimpan. Tampil di tab Soal, bagian "Soal gerbang masuk". */
(function(){
 var i0=lkeInit;
 lkeInit=function(d){
  var had=!!d.S,s=i0.apply(this,arguments);
  if(!had&&lkvIs(d)&&!s.gate){
   s.gate=lkeCp((d.src.v2.gate&&d.src.v2.gate.qs)||[]);
   d.snap=JSON.stringify(s);
   try{
    var raw=JSON.parse(localStorage.getItem(LKE.DKEY)||'null'),k=d.id||'(baru)';
    d.rec=(raw&&raw.k===k&&raw.S&&raw.S.gate&&JSON.stringify(raw.S)!==d.snap&&Date.now()-raw.ts<14*864e5)?raw:null;
   }catch(e){}
  }
  return s;
 };
 var b0=lkeBuild;
 lkeBuild=function(d){
  var m=b0.apply(this,arguments);
  if(m.v2&&Array.isArray(d.S.gate)&&(m.v2.gate||d.S.gate.length)){
   if(!m.v2.gate)m.v2.gate={};
   m.v2.gate.qs=d.S.gate.map(function(q){
    /* mulai dari salinan soal asli agar bentuk dan urutan kolom tetap bila tidak diubah; nilai diganti dengan hasil pembersihan */
    var c=lkeCp(q),cl=lkeClean(q),t=lkqType(q);
    c.q=cl.q;if(cl.e)c.e=cl.e;else delete c.e;
    if(t==='kategori'){c.rows=cl.rows;delete c.o;delete c.a;delete c.oi;if(cl.lab)c.lab=cl.lab}
    else{c.o=cl.o;c.a=cl.a;delete c.rows;if(cl.oi)c.oi=cl.oi;else delete c.oi}
    if(t!=='pg'||q.t)c.t=t;
    if(!c.lvl)c.lvl='Aplikasi';
    if(cl.qi)c.qi=cl.qi;else delete c.qi;
    if(!lkvRefOk(c.qi))delete c.qi;
    if(Array.isArray(c.oi)){c.oi=c.oi.map(function(x){return lkvRefOk(x)?x:''});if(!c.oi.some(Boolean))delete c.oi}
    return c;
   });
  }
  return m;
 };
 var r0=lkgModRefs;
 lkgModRefs=function(m){
  var a=r0.apply(this,arguments);
  ((m&&m.v2&&m.v2.gate&&m.v2.gate.qs)||[]).forEach(function(q){lkgRefs(q).forEach(function(r){if(a.indexOf(r)<0)a.push(r)})});
  return a;
 };
 var u0=lkgUploadModul;
 lkgUploadModul=async function(m){
  var ubah=await u0.apply(this,arguments);
  var qs=m&&m.v2&&m.v2.gate&&m.v2.gate.qs;
  if(Array.isArray(qs)){
   var base='LKPD_'+sgSlug(m.id,24);
   for(var i=0;i<qs.length;i++){
    var q=qs[i],nm=base+'_g'+(i+1);
    if(q.qi&&q.qi.indexOf('drive:')!==0){q.qi=await sgUploadRef(q.qi,nm+'_soal');ubah=true}
    if(Array.isArray(q.oi))for(var k=0;k<q.oi.length;k++){
     if(q.oi[k]&&q.oi[k].indexOf('drive:')!==0){q.oi[k]=await sgUploadRef(q.oi[k],nm+'_'+String.fromCharCode(97+k));ubah=true}
    }
   }
  }
  return ubah;
 };
 var t0=lkeTabSoal;
 lkeTabSoal=function(d){
  var h=t0.apply(this,arguments);
  if(!lkvIs(d)||d.json||!d.S.gate)return h;
  return h+lkvGateHtml(d);
 };
})();
function lkvGBox(q,i,w){
 var ref=w==='q'?(q.qi||''):((Array.isArray(q.oi)&&q.oi[w])||''),lbl=w==='q'?'foto soal':'foto pilihan '+String.fromCharCode(65+w);
 var h='<div class="sg-box">';
 if(lkvRefOk(ref)&&typeof sgImg==='function')h+=sgImg(ref,'sg-th ld-zoom','Pratinjau '+lbl);
 h+='<button type="button" class="btn small" data-lkv-a="g-img" data-i="'+i+'" data-w="'+w+'">'+(ref?'Ganti':'Tambah')+' '+lbl+'</button>';
 if(ref)h+='<button type="button" class="btn small danger" data-lkv-a="g-img-del" data-i="'+i+'" data-w="'+w+'">Hapus</button>';
 return h+'</div>';
}
var LKV_GL=['Aplikasi','Penalaran'];
function lkvGIssue(q){
 var m=lkeQIssue(q);if(m)return m;
 if(!lkeT(q.e))return 'Pembahasan wajib diisi (dipakai pada Kunci dan Pembahasan)';
 if(LKV_GL.indexOf(q.lvl)<0)return 'Pilih level soal (Aplikasi atau Penalaran)';
 return '';
}
function lkvGNew(t){var n=lkeNewQ(t);n.t=t;n.lvl='Aplikasi';if(t==='kategori')n.rows=[['',true],['',false],['',true]];else n.o=['','','','',''];return n}
function lkvGConv(q,v){
 var cur=lkqType(q),n=lkvGNew(v);n.q=q.q||'';n.e=q.e||'';n.lvl=q.lvl||'Aplikasi';if(q.qi)n.qi=q.qi;
 if(cur!=='kategori'&&v!=='kategori'){
  n.o=(q.o||[]).slice();while(n.o.length<5)n.o.push('');
  n.a=v==='pg'?(Array.isArray(q.a)?(q.a.length?q.a[0]:-1):q.a):(Array.isArray(q.a)?q.a.slice():(q.a>=0?[q.a]:[]));
  if(Array.isArray(q.oi)){n.oi=q.oi.slice(0,n.o.length);while(n.oi.length<n.o.length)n.oi.push('')}
 }
 return n;
}
function lkvGItem(d,q,i){
 var t=lkqType(q),iss=lkvGIssue(q),open=d.gi===i,n=d.S.gate.length,lab=q.lab||['Benar','Salah'];
 var tl={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori'}[t]||t;
 var head='<button type="button" class="lke-qh" data-lkv-a="gq-open" data-i="'+i+'" aria-expanded="'+open+'"><span class="pill'+(iss?' warn':' ok')+'">'+(i+1)+'</span><b>'+(lkeT(q.q)?esc(q.q):'<span class="muted">Soal belum diisi</span>')+'</b><span class="pill plain">'+tl+'</span><span class="pill plain">'+esc(q.lvl||'Level?')+'</span></button>';
 if(!open)return '<div class="lke-q'+(iss?' err':'')+'">'+head+'</div>';
 function A(a,j,v){return 'data-lkv-a="'+a+'" data-i="'+i+'"'+(j!==undefined?' data-j="'+j+'"':'')+(v!==undefined?' data-v="'+v+'"':'')}
 var b='<div class="lke-qb"><div class="seg lke-seg3" role="group" aria-label="Jenis soal">'+[['pg','PG'],['kompleks','PG kompleks'],['kategori','PG kategori']].map(function(x){return '<button type="button" '+A('gq-type',undefined,x[0])+' aria-pressed="'+(t===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'+
  '<div class="seg" role="group" aria-label="Level soal">'+LKV_GL.map(function(x){return '<button type="button" '+A('gq-lvl',undefined,x)+' aria-pressed="'+(q.lvl===x)+'">'+x+'</button>'}).join('')+'</div>'+
  '<label class="f">Pertanyaan<textarea rows="3" data-lke="gate.'+i+'.q" placeholder="Tulis pertanyaan; kasus atau data ukur ada di dalam soal">'+esc(q.q||'')+'</textarea></label>'+lkvGBox(q,i,'q');
 if(t==='kategori'){
  b+='<div><span class="label">Pernyataan (pilih '+esc(lab[0])+' atau '+esc(lab[1])+' sebagai kunci)</span></div><div class="lke-list">'+(q.rows||[]).map(function(r,k){
   return '<div class="lke-kat"><textarea class="lke-1" rows="1" data-lke="gate.'+i+'.rows.'+k+'.0" placeholder="Pernyataan '+(k+1)+'">'+esc(r[0])+'</textarea>'+
    '<div class="lke-tf"><button type="button" '+A('gq-kat',k,'1')+' aria-pressed="'+(!!r[1])+'">'+esc(lab[0])+'</button><button type="button" '+A('gq-kat',k,'0')+' aria-pressed="'+(!r[1])+'">'+esc(lab[1])+'</button></div>'+
    '<button type="button" class="lke-ic del" '+A('gq-row-del',k)+' aria-label="Hapus pernyataan">✕</button></div>'}).join('')+'</div>'+
   ((q.rows||[]).length<LKE.MAXR?'<div><button type="button" class="btn small" '+A('gq-row-add')+'>+ Pernyataan</button></div>':'');
 }else{
  b+='<div><span class="label">Pilihan jawaban. Ketuk huruf untuk menandai '+(t==='pg'?'satu jawaban benar':'semua jawaban benar')+'.</span></div><div class="lke-list">'+(q.o||[]).map(function(o,k){
   var on=t==='pg'?q.a===k:(Array.isArray(q.a)&&q.a.indexOf(k)>-1);
   return '<div class="lke-opt"><button type="button" class="lke-key'+(t==='kompleks'?' sq':'')+'" '+A('gq-key',k)+' aria-pressed="'+on+'" aria-label="Jawaban benar '+lkeLtr(k)+'">'+lkeLtr(k)+'</button>'+
    '<input data-lke="gate.'+i+'.o.'+k+'" placeholder="Pilihan '+lkeLtr(k)+'" value="'+esc(o)+'"><button type="button" class="lke-ic del" '+A('gq-opt-del',k)+' aria-label="Hapus pilihan"'+(q.o.length<=4?' disabled':'')+'>✕</button></div><div class="lke-oimg">'+lkvGBox(q,i,k)+'</div>'}).join('')+'</div>'+
   ((q.o||[]).length<LKE.MAXO?'<div><button type="button" class="btn small" '+A('gq-opt-add')+'>+ Pilihan</button></div>':'');
 }
 b+='<label class="f">Pembahasan (wajib)<textarea rows="3" data-lke="gate.'+i+'.e" placeholder="Jelaskan jawaban benar dan kesalahan umum pada pengecoh">'+esc(q.e||'')+'</textarea></label>'+
  (iss?'<div class="lke-qerr">'+esc(iss)+'</div>':'')+
  '<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small" '+A('gq-up')+(i===0?' disabled':'')+'>↑ Naik</button><button type="button" class="btn small" '+A('gq-down')+(i===n-1?' disabled':'')+'>↓ Turun</button><button type="button" class="btn small" '+A('gq-dup')+'>Duplikat</button><button type="button" class="btn small danger" '+A('gq-del')+'>Hapus soal</button></div></div>';
 return '<div class="lke-q open'+(iss?' err':'')+'">'+head+b+'</div>';
}
function lkvGateHtml(d){
 var g=d.S.gate;
 return '<section class="card"><div><h3>Soal gerbang masuk (tab Materi siswa)</h3><p class="note">Soal TKA sebagai syarat masuk praktik: minimal 3 soal, lima pilihan, level Aplikasi atau Penalaran, dan pembahasan wajib. Foto soal dan pilihan bisa ditambahkan. Jawaban siswa yang sudah tersimpan mengikuti nomor soal, jadi ubah soal gerbang sebelum LKPD dipakai siswa.</p></div>'+
  '<div class="lke-list">'+g.map(function(q,i){return lkvGItem(d,q,i)}).join('')+'</div>'+
  '<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small primary" data-lkv-a="gq-add" data-v="pg">+ PG</button><button type="button" class="btn small primary" data-lkv-a="gq-add" data-v="kompleks">+ PG kompleks</button><button type="button" class="btn small primary" data-lkv-a="gq-add" data-v="kategori">+ PG kategori</button></div></section>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lkv-a^="g-img"]');if(!b)return;
 var d=LK.editor;if(!d||!d.S||!d.S.gate||!isStaff())return;
 e.stopPropagation();
 var q=d.S.gate[+b.dataset.i],w=b.dataset.w==='q'?'q':+b.dataset.w;if(!q)return;
 function set(v){if(w==='q')q.qi=v;else lkgFit(q)[w]=v}
 if(b.dataset.lkvA==='g-img'){
  if(typeof sgPilih!=='function'){toast('Pengolah gambar belum siap. Muat ulang aplikasi.');return}
  sgPilih(function(data){
   var id='tmp:'+uid();
   sgPut(id,data).then(function(ok){if(LK.editor!==d)return;set(ok?id:data);lkeRe()});
  });
 }else{set('');lkeRe()}
},true);

/* Aksi editor soal gerbang masuk (data-lkv-a="gq-..."). Teks bertaut ke d.S.gate lewat data-lke="gate.i...." (penangan input editor). */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lkv-a^="gq-"]');if(!b||b.disabled)return;
 var d=LK.editor;if(!d||!d.S||!Array.isArray(d.S.gate)||!isStaff())return;
 e.stopPropagation();
 var a=b.dataset.lkvA,i=+b.dataset.i,j=+b.dataset.j,v=b.dataset.v,g=d.S.gate,q=g[i];
 if(a==='gq-add'){
  if(g.length>=LKV.MAXG){toast('Maksimal '+LKV.MAXG+' soal gerbang');return}
  g.push(lkvGNew(v));d.gi=g.length-1;lkeRe();return;
 }
 if(!q)return;
 if(a==='gq-open'){d.gi=d.gi===i?-1:i;lkeRe()}
 else if(a==='gq-type'){if(lkqType(q)!==v){g[i]=lkvGConv(q,v);lkeRe()}}
 else if(a==='gq-lvl'){q.lvl=v;lkeRe()}
 else if(a==='gq-key'){
  if(lkqType(q)==='pg')q.a=q.a===j?-1:j;
  else{q.a=Array.isArray(q.a)?q.a:[];var at=q.a.indexOf(j);if(at>-1)q.a.splice(at,1);else q.a.push(j)}
  lkeRe();
 }
 else if(a==='gq-opt-add'){if(q.o.length<LKE.MAXO){q.o.push('');if(Array.isArray(q.oi))q.oi.push('');d.focus='gate.'+i+'.o.'+(q.o.length-1);lkeRe()}}
 else if(a==='gq-opt-del'){
  if(q.o.length<=4){toast('Minimal 4 pilihan');return}
  if(Array.isArray(q.oi))lkgFit(q).splice(j,1);q.o.splice(j,1);
  if(lkqType(q)==='pg'){if(q.a===j)q.a=-1;else if(q.a>j)q.a--}
  else q.a=(q.a||[]).filter(function(x){return x!==j}).map(function(x){return x>j?x-1:x});
  lkeRe();
 }
 else if(a==='gq-kat'){q.rows[j][1]=v==='1';lkeRe()}
 else if(a==='gq-row-add'){if(q.rows.length<LKE.MAXR){q.rows.push(['',true]);d.focus='gate.'+i+'.rows.'+(q.rows.length-1)+'.0';lkeRe()}}
 else if(a==='gq-row-del'){if(q.rows.length>3){q.rows.splice(j,1);lkeRe()}else toast('Minimal 3 pernyataan')}
 else if(a==='gq-up'){lkeMove(g,i,i-1);d.gi=i-1;lkeRe()}
 else if(a==='gq-down'){lkeMove(g,i,i+1);d.gi=i+1;lkeRe()}
 else if(a==='gq-dup'){
  if(g.length>=LKV.MAXG){toast('Maksimal '+LKV.MAXG+' soal gerbang');return}
  g.splice(i+1,0,lkeCp(q));d.gi=i+1;lkeRe();
 }
 else if(a==='gq-del'){
  if(g.length<=3){toast('Gerbang masuk minimal 3 soal');return}
  uiConfirm('Hapus soal gerbang no. '+(i+1)+'? Nomor soal berikutnya bergeser.',{ok:'Hapus',danger:true}).then(function(ok){if(!ok||LK.editor!==d)return;g.splice(i,1);d.gi=-1;lkeRe()});
 }
},true);
(function(){
 var i0=lkeIssues;
 lkeIssues=function(d){
  var I=i0.apply(this,arguments);
  if(lkvIs(d)&&d.S&&Array.isArray(d.S.gate)&&(d.S.gate.length||(d.src&&d.src.v2&&d.src.v2.gate))){
   if(d.S.gate.length<3)I.push({tab:'soal',msg:'Gerbang masuk minimal 3 soal'});
   d.S.gate.forEach(function(q,k){var m=lkvGIssue(q);if(m)I.push({tab:'soal',msg:'Gerbang masuk no. '+(k+1)+': '+m})});
  }
  return I;
 };
})();
