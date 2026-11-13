/* lkpd-rekap-rapi.js (v71): merapikan tombol di Rekap pengumpulan LKPD.
   - Baris tombol Editor Guru, Materi & Prosedur, Lembar Kerja, Evaluasi, Rekap LKPD disembunyikan di halaman rekap
     (tombol kembali "‹ Daftar LKPD" sudah ada di atas halaman).
   - Chip kelas disembunyikan bila hanya ada satu kelas (nama kelas sudah tampil di judul kelompok).
   - Chip Semua/Perlu dicek hanya muncul bila ada data yang perlu dicek; label dipersingkat.
   - Label Ujian di kartu disembunyikan bila belum ada data Latihan (label baru berguna bila keduanya ada).
   Dimuat setelah lkpd-staff.js; hanya membungkus viewLKPD, tidak mengubah berkas lain. */
(function(){
 var prev=viewLKPD;
 viewLKPD=function(){
  var h=prev();
  try{
   if(!S.user||!LK.open||LK.tab!=='riwayat'||LK.detail||LK.editor)return h;
   /* 1. deretan tab modul (Editor Guru; Materi, Lembar Kerja, Evaluasi, Rekap) */
   h=h.replace(/<div class="chips">(?:<button[^>]*data-act="lk-tab"[^>]*>[^<]*<\/button>)+<\/div>/g,'');
   /* 2. chip kelas: tidak perlu bila hanya satu kelas */
   h=h.replace(/<div class="chips lk-kf">([\s\S]*?)<\/div>/,function(m,inner){
    return (inner.match(/<button/g)||[]).length<=2?'':m});
   /* 3. label Ujian di kartu bila tidak ada data Latihan */
   var rows=typeof lkrRows==='function'?lkrRows():[],adaLatihan=typeof lkrMode==='function'&&rows.some(function(x){return lkrMode(x)==='latihan'});
   if(!adaLatihan)h=h.replace(/<span class="pill warn">Ujian<\/span>\s*/g,'');
   /* 4. label chip status lebih singkat */
   h=h.replace('data-v="ALL" aria-pressed="true">Semua data<','data-v="ALL" aria-pressed="true">Semua<').replace('data-v="ALL" aria-pressed="false">Semua data<','data-v="ALL" aria-pressed="false">Semua<');
   /* 5. satu baris aksi rapi di tiap kartu: label di kiri, Detail di kanan */
   h=h.replace(/<div class="row" style="align-items:center">/g,'<div class="row rk-acts">');
  }catch(e){}
  return h;
 };
})();
