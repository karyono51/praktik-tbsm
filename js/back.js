/* back.js: tombol back HP.
   - Semua peran: back hanya mundur satu tingkat di dalam aplikasi sampai Beranda. Di Beranda back tidak keluar dari aplikasi.
   - Siswa saat mode Ujian (LKPD Ujian terbuka, Unit Ujian berjalan, atau CBT Online Ujian berjalan/mengirim): back dinonaktifkan.
   - Back selalu mundur satu tingkat: sub-halaman Bank soal/CBT Online -> halaman utamanya, hasil penilaian yang belum disimpan meminta konfirmasi dulu.
   Cara kerja: riwayat peramban diberi satu entri penjaga. Setiap back yang jatuh ke entri dasar dipasang penjaga lagi. */
function bkCbtUjian(){
 /* CBT Online mode Ujian milik siswa: sedang dikerjakan (run) atau sedang mengirim jawaban (sending) */
 if(typeof BS==='undefined'||!S.user||isStaff()||(S.tab!=='banksoal'&&S.tab!=='cbtonline'))return false;
 if(BS.sub==='sending')return true;
 return !!(BS.sub==='run'&&BS.run&&BS.run.mode==='ujian'&&!BS.run.done);
}
function bkUjian(){
 if(!S.user||isStaff())return false;
 if(V.mode==='list'&&bkCbtUjian())return true;
 if(V.mode==='exam')return !(V.job&&V.job.ukk&&V.job.cfg&&V.job.cfg.mode==='latihan'); /* Latihan UKK boleh keluar (waktu tetap berjalan, isian tersimpan) */
 if(S.tab!=='lkpd'||!LK.open||LK.detail||LK.editor||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return false;
 var m=typeof lkmCur==='function'?lkmCur():null;
 return !!(m&&lkmCfg(m).mode==='ujian');
}
function bkBack(){
 if(!S.user)return;
 if(document.querySelector('.ui-ov')){var x=document.querySelector('.ui-ov [data-u="x"]');if(x)x.click();return}
 if(bkUjian()){toast('Tombol kembali dinonaktifkan selama ujian. Selesaikan dan kirim dulu.');return}
 if(V.mode==='exam'){var bk=document.querySelector('[data-act="back"]');if(leaveExam(bk||null))render();return}
 if(V.mode==='result'&&!V.saved&&V.items&&!uiOk('bkhasil','Hasil penilaian belum disimpan.\nKeluar sekarang akan membuang hasil ini.',function(){bkBack()},{ok:'Buang hasil',danger:true}))return;
 if(V.mode!=='list'){V.mode='list';render();window.scrollTo(0,0);return}
 if(typeof BS!=='undefined'&&(S.tab==='banksoal'||S.tab==='cbtonline')){
  /* satu tingkat ke atas di dalam Bank soal / CBT Online; latihan yang sedang berjalan tidak diutak-atik */
  if(BS.form){var bf=document.querySelector('[data-bs="batalform"]');if(bf)bf.click();else{BS.form=null;render()}window.scrollTo(0,0);return}
  if(BS.sf){var bs2=document.querySelector('[data-bs="sesibatal"]');if(bs2)bs2.click();else{BS.sf=null;render()}window.scrollTo(0,0);return}
  if(BS.sub&&BS.sub!=='home'&&!(BS.sub==='run'&&BS.run)){BS.sub='home';BS.res=null;render();window.scrollTo(0,0);return}
 }
 if(S.tab==='lkpd'){
  if(typeof LKA!=='undefined'&&LKA.id){LKA.id=null;render();window.scrollTo(0,0);return}
  if(LK.detail){var lb=document.querySelector('[data-act="lk-back"]');if(lb)lb.click();else{LK.detail=null;render()}return}
  if(LK.editor){
   if(!uiOk('bkeditor','Tutup editor?\nPerubahan yang belum disimpan akan hilang.',function(){bkBack()},{ok:'Tutup',danger:true}))return;
   LK.editor=null;LK.open=false;LK.tab='materi';render();window.scrollTo(0,0);return;
  }
  if(LK.open){LK.open=false;LK.detail=null;LK.editor=null;LK.preview=false;LK.tab='materi';render();window.scrollTo(0,0);return}
 }
 if((S.tab==='observasi'||S.tab==='observasi-siswa')&&typeof OB!=='undefined'&&OB.mode!=='list'){
  var c=document.querySelector('[data-act="ob-cancel"]');
  if(c){c.click();return}
  OB.mode='list';OB.d=null;render();return;
 }
 if(S.tab!=='beranda'){S.tab='beranda';LK.open=false;LK.detail=null;LK.editor=null;LK.preview=false;render();window.scrollTo(0,0)}
}
(function(){
 try{
  if(!(history.state&&history.state.tbsm)){history.replaceState({tbsm:'base'},'');history.pushState({tbsm:'guard'},'')}
 }catch(e){}
 window.addEventListener('popstate',function(e){
  var s=e.state;
  if(s&&(s.tbsm==='guard'||s.sheet))return;
  try{history.pushState({tbsm:'guard'},'')}catch(x){}
  bkBack();
 });
})();
