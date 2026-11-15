/* lkpd-gambar.js: gambar pada soal evaluasi (kuis) modul LKPD.
   Memakai mesin yang sama dengan Bank soal (soal-gambar.js): gambar dikecilkan otomatis, disimpan di Google Drive lewat
   fungsi foto-drive (upload kind:'soal' hanya guru/admin, getsoal boleh dibaca semua pengguna login), dan disalin ke
   IndexedDB perangkat supaya tetap tampil saat offline.
   Format soal modul bertambah dua kolom opsional (modul lama tetap terbaca):
     q.qi  gambar pada soal            '' atau 'drive:<fileId>' (sebelum terunggah: 'tmp:<id>')
     q.oi  gambar tiap pilihan         daftar sejajar dengan q.o (PG dan PG kompleks). PG kategori: hanya q.qi.
   Pilihan boleh berisi teks, gambar, atau keduanya.
   Alur guru: pilih gambar -> disimpan di IndexedDB (tmp:) -> modul disimpan lokal -> saat sinkron ke server, gambar diunggah
   dulu lalu penanda diganti 'drive:'. Bila unggah gagal (offline), modul tetap di antrean dan dikirim ulang saat sinyal kembali.
   Bergantung pada: soal-gambar.js (sg*), lkpd-drive.js (ldCall, ldCompress), lkpd-soal.js (lkq*), lkpd-editor.js (lke*). */
var LKG={timer:null};

/* ---------- Penanda ---------- */
function lkgRefs(q){return typeof sgRefs==='function'?sgRefs(q):[]}
function lkgAda(q){return lkgRefs(q).length>0}
function lkgModRefs(m){var a=[];(m&&m.quiz||[]).forEach(function(q){lkgRefs(q).forEach(function(r){if(a.indexOf(r)<0)a.push(r)})});return a}
function lkgModAda(m){return (m&&m.quiz||[]).some(lkgAda)}
/* teks pilihan untuk kunci/jawaban bila pilihan hanya gambar */
function lkgOT(q,k){var t=q&&q.o&&q.o[k];return t||(q&&Array.isArray(q.oi)&&q.oi[k]?'(gambar)':'')}
/* daftar gambar pilihan disejajarkan dengan q.o */
function lkgFit(q){
 var n=(q.o||[]).length,a=Array.isArray(q.oi)?q.oi.slice(0,n):[];
 while(a.length<n)a.push('');
 q.oi=a;return a;
}

/* ---------- Tampilan siswa ---------- */
function lkgQHtml(q){return q&&q.qi&&typeof sgImg==='function'?'<div class="sg-qwrap">'+sgImg(q.qi,'sg-q ld-zoom','Gambar soal')+'</div>':''}
/* gambar pilihan k (tidak bisa diperbesar supaya ketukan tidak salah memilih jawaban) */
function lkgOHtml(q,k){var g=q&&Array.isArray(q.oi)&&q.oi[k];return g&&typeof sgImg==='function'?sgImg(g,'sg-o','Gambar pilihan '+String.fromCharCode(65+k)):''}

/* ---------- Editor guru ---------- */
function lkgBox(q,i,w){
 var ref=w==='q'?(q.qi||''):((Array.isArray(q.oi)&&q.oi[w])||''),lbl=w==='q'?'gambar soal':'gambar pilihan '+String.fromCharCode(65+w);
 var h='<div class="sg-box">';
 if(ref&&typeof sgImg==='function')h+=sgImg(ref,'sg-th ld-zoom','Pratinjau '+lbl);
 h+='<button type="button" class="btn small" data-lke-a="q-img" data-i="'+i+'" data-w="'+w+'">'+(ref?'Ganti':'Tambah')+' '+lbl+'</button>';
 if(ref)h+='<button type="button" class="btn small danger" data-lke-a="q-img-del" data-i="'+i+'" data-w="'+w+'">Hapus</button>';
 return h+'</div>';
}
function lkgPilih(d,i,w){
 var q=d&&d.S&&d.S.quiz[i];if(!q)return;
 if(typeof sgPilih!=='function'){toast('Pengolah gambar belum siap. Muat ulang aplikasi.');return}
 sgPilih(function(data){
  var id='tmp:'+uid();
  sgPut(id,data).then(function(ok){
   if(LK.editor!==d)return;
   var ref=ok?id:data;               /* IndexedDB tidak tersedia: simpan langsung, tetap terunggah saat sinkron */
   if(w==='q')q.qi=ref;else{lkgFit(q)[+w]=ref}
   lkeRe();
  });
 });
}
function lkgHapus(d,i,w){
 var q=d&&d.S&&d.S.quiz[i];if(!q)return;
 if(w==='q')q.qi='';else if(Array.isArray(q.oi))lkgFit(q)[+w]='';
 lkeRe();
}

/* ---------- Unggah ke Drive saat modul dikirim ---------- */
/* Ganti tmp:/data: menjadi drive:<id> pada kuis modul m. Mengembalikan true bila ada yang berubah. Melempar galat bila unggah gagal. */
async function lkgUploadModul(m){
 if(!m||!Array.isArray(m.quiz)||typeof sgUploadRef!=='function')return false;
 var ubah=false,base='LKPD_'+sgSlug(m.id,24);
 for(var i=0;i<m.quiz.length;i++){
  var q=m.quiz[i],nm=base+'_s'+(i+1);
  if(q.qi&&q.qi.indexOf('drive:')!==0){q.qi=await sgUploadRef(q.qi,nm+'_soal');ubah=true}
  if(Array.isArray(q.oi)){
   for(var k=0;k<q.oi.length;k++){
    if(q.oi[k]&&q.oi[k].indexOf('drive:')!==0){q.oi[k]=await sgUploadRef(q.oi[k],nm+'_'+String.fromCharCode(97+k));ubah=true}
   }
  }
 }
 return ubah;
}
function lkgBelumTerunggah(m){return lkgModRefs(m).some(function(r){return r.indexOf('drive:')!==0})}

/* ---------- Siapkan untuk offline (siswa) ---------- */
/* Setelah daftar modul dimuat, unduh gambar kuis modul yang terbit agar tetap tampil saat sinyal hilang. Diam-diam, tidak mengganggu layar. */
function lkgPrefetch(){
 clearTimeout(LKG.timer);
 LKG.timer=setTimeout(function(){
  try{
   if(!(window.Cloud&&Cloud.on)||navigator.onLine===false||!window.S||!S.user||typeof isStaff!=='function'||isStaff())return;
   var refs=[];
   (S.lkpdModules||[]).forEach(function(m){if(m.status==='published'&&m.active!==false)lkgModRefs(m).forEach(function(r){if(r.indexOf('drive:')===0&&refs.indexOf(r)<0)refs.push(r)})});
   var i=0;
   function jalan(){if(i>=refs.length)return Promise.resolve();return sgResolve(refs[i++]).then(jalan,jalan)}
   [0,1,2].forEach(function(){jalan()});
  }catch(e){}
 },2500);
}
if(typeof lkRefreshModules==='function'){
 var _lkgRef=lkRefreshModules;
 lkRefreshModules=function(){var r=_lkgRef.apply(this,arguments);lkgPrefetch();return r};
}

/* ---------- Excel LKPD: gambar tidak ikut diekspor ---------- */
if(typeof lkioExport==='function'){
 var _lkgEx=lkioExport;
 lkioExport=function(scope,id){
  var r=_lkgEx.apply(this,arguments),n=0;
  try{
   var mods=scope==='one'?(LKPD_MODULES||[]).filter(function(x){return x.id===id}):(LKPD_MODULES||[]);
   n=mods.filter(lkgModAda).length;
  }catch(e){}
  if(n)setTimeout(function(){toast(n+' modul punya soal bergambar. Gambar tidak ikut diekspor ke Excel.')},1800);
  return r;
 };
}

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='.lke-oimg{margin:-4px 0 4px 44px}.lke-oimg .sg-box{margin:0}.lkq .sg-qwrap{margin:6px 0 8px}.lkq .lk-option .sg-o{margin-top:6px}';
 document.head.appendChild(s);
})();
