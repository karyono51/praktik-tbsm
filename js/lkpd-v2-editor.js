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
   Bergantung pada: lkpd-editor.js (lke*), lkpd-gambar.js (lkg*), soal-gambar.js (sg*), lkpd-soal.js (lkq*), lkpd.js. */
var LKV={SKIP:{r:1,d:1,payload:1,updatedAt:1,updatedBy:1}};

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
   (q.g?'<p class="note">Gambar skala dibuat otomatis dari angka soal. Foto yang ditambahkan tampil di bawahnya.</p>':'')+
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
/* Soal gerbang ada di m.v2.gate.qs. Editor ini hanya mengelola fotonya (qi untuk soal, oi untuk pilihan); teks dan kunci tidak diubah.
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
  if(m.v2&&m.v2.gate&&Array.isArray(d.S.gate)){
   m.v2.gate.qs=d.S.gate.map(function(q){
    var c=lkeCp(q);
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
  if(!lkvIs(d)||d.json||!d.S.gate||!d.S.gate.length)return h;
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
function lkvGateHtml(d){
 return '<section class="card"><div><h3>Soal gerbang masuk (tab Materi siswa)</h3><p class="note">Di sini hanya foto yang bisa ditambahkan. Teks dan kunci soal gerbang tidak diubah.</p></div><div class="lke-list">'+
  d.S.gate.map(function(q,i){
   var h='<div class="lke-item" style="grid-template-columns:26px 1fr"><span class="lke-n">'+(i+1)+'</span><div class="lke-f"><b>'+esc(q.q||'')+'</b>'+lkvGBox(q,i,'q');
   if(Array.isArray(q.o)&&q.t!=='kategori')q.o.forEach(function(o,k){h+='<div class="note">'+String.fromCharCode(65+k)+'. '+esc(o||'')+'</div>'+lkvGBox(q,i,k)});
   return h+'</div></div>';
  }).join('')+'</div></section>';
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
