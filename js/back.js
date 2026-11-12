/* back.js: tombol back HP.
   - Semua peran: back hanya mundur satu tingkat di dalam aplikasi sampai Beranda. Di Beranda back tidak keluar dari aplikasi.
   - Siswa saat mode Ujian (LKPD Ujian terbuka atau Unit Ujian berjalan): back dinonaktifkan.
   Cara kerja: riwayat peramban diberi satu entri penjaga. Setiap back yang jatuh ke entri dasar dipasang penjaga lagi. */
function bkUjian(){
 if(!S.user||isStaff())return false;
 if(V.mode==='exam')return true;
 if(S.tab!=='lkpd'||!LK.open||LK.detail||LK.editor||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return false;
 var m=typeof lkmCur==='function'?lkmCur():null;
 return !!(m&&lkmCfg(m).mode==='ujian');
}
function bkBack(){
 if(!S.user)return;
 if(document.querySelector('.ui-ov')){var x=document.querySelector('.ui-ov [data-u="x"]');if(x)x.click();return}
 if(bkUjian()){toast('Tombol kembali dinonaktifkan selama ujian. Selesaikan dan kirim dulu.');return}
 if(V.mode==='exam'){var bk=document.querySelector('[data-act="back"]');if(leaveExam(bk||null))render();return}
 if(V.mode!=='list'){V.mode='list';render();window.scrollTo(0,0);return}
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
