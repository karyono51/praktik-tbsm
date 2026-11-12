/* siswa-ui.js: penyederhanaan tampilan untuk peran Siswa.
   - Modul LKPD: tombol Riwayat disembunyikan saat mengerjakan.
   - Rekap pengumpulan LKPD: deretan tombol Materi, Lembar Kerja, Evaluasi, Riwayat disembunyikan.
   - Rekap nilai: tombol filter Semua dan Kelas X/XI/XII disembunyikan (siswa hanya melihat nilainya sendiri). */
(function(){
 var vl=viewLKPD;
 viewLKPD=function(){
  var h=vl();
  if(!S.user||isStaff()||LK.detail||LK.editor)return h;
  try{
   if(LK.tab==='riwayat')h=h.replace(/<div class="chips">(?:<button data-act="lk-tab"[^>]*>[^<]*<\/button>)+<\/div>/,'');
   else h=h.replace(/<button data-act="lk-tab" data-v="riwayat"[^>]*>[^<]*<\/button>/,'');
  }catch(e){}
  return h;
 };
 var vr=viewRekap;
 viewRekap=function(){
  if(S.user&&actRole()==='siswa'){
   if(S.filter!=='ALL')S.filter='ALL';
   return vr().replace(/<div class="chips" role="group" aria-label="Filter kelas">[\s\S]*?<\/div>/,'');
  }
  return vr();
 };
})();
