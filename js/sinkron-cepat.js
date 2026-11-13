/* sinkron-cepat.js (v69): sinkron lebih tangguh saat ujian.
   1. Batas waktu tiap permintaan ke Appwrite, agar koneksi macet tidak membuat antrean menggantung selamanya.
   2. Percobaan ulang otomatis dengan jeda bertahap (backoff + acak) selama masih ada data yang belum terkirim.
   3. Data yang dibuat saat flush sedang berjalan tidak lagi tertinggal.
   4. Data bank soal yang belum terkirim dimasukkan kembali ke antrean (penyembuhan otomatis).
   Berkas ini harus dimuat setelah banksoal-io.js dan sebelum actions.js (yang memanggil boot). */
(function(){
 if(!window.Cloud||!Cloud.on)return;
 var SC=window.SC={fail:0,next:0,run:false,again:false},TMO=20000,TMO_LIST=40000;

 function timeout(p,ms){
  return new Promise(function(res,rej){
   var t=setTimeout(function(){var e=new Error('Waktu tunggu server habis');e.code=408;rej(e)},ms);
   p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)});
  });
 }
 var i0=Cloud.init;
 Cloud.init=function(){
  i0.apply(this,arguments);
  var db=this.db;if(!db)return;
  ['createDocument','updateDocument','deleteDocument','getDocument','listDocuments'].forEach(function(m){
   var f=db[m];if(typeof f!=='function')return;
   var ms=m==='listDocuments'?TMO_LIST:TMO;
   db[m]=function(){return timeout(f.apply(db,arguments),ms)};
  });
 };

 /* flush yang dipanggil saat flush lain berjalan dicatat, lalu dijalankan ulang setelah selesai */
 var f1=Cloud.flush;
 Cloud.flush=async function(){
  if(this.busy){SC.again=true;return}
  await f1.apply(this,arguments);
  if(SC.again){SC.again=false;return Cloud.flush()}
 };

 function bsAntre(){try{return bsQueueGet().length}catch(e){return 0}}
 /* data bank soal belum terkirim yang tidak ada di antrean (mis. galat server pada versi lama) */
 function heal(){
  if(typeof BS==='undefined'||typeof bsQueueAdd!=='function'||!S.user||BS.loading)return;
  try{
   if(!BS.loaded)bsLoadLocal();
   ['soal','sesi','hasil'].forEach(function(k){
    (BS.D[k]||[]).forEach(function(x){
     if((!x.r||x.d)&&!x.bad&&(k!=='hasil'||isStaff()||x.sid===S.user.id))bsQueueAdd(k,x.id);
    });
   });
  }catch(e){}
 }
 function tersisa(){return pendingCount()+bsAntre()}

 async function tick(force){
  if(SC.run||!S.user||navigator.onLine===false)return;
  if(!force&&Date.now()<SC.next)return;
  heal();
  if(!tersisa()){SC.fail=0;SC.next=0;return}
  SC.run=true;Cloud.failN=SC.fail+1;Cloud.retrying=SC.fail>0;
  var sebelum=SC.fail;
  try{
   if(pendingCount())await Cloud.flush();
   if(bsAntre()&&typeof bsFlushQ==='function')await bsFlushQ();
  }catch(e){}
  SC.run=false;Cloud.retrying=false;
  if(tersisa()){
   SC.fail++;
   /* 2, 4, 8, 16, 32, maksimal 60 detik, dengan variasi acak 70 sampai 130 persen */
   SC.next=Date.now()+Math.min(60000,2000*Math.pow(2,SC.fail-1))*(0.7+Math.random()*0.6);
  }else{
   SC.fail=0;SC.next=0;
   try{netbar()}catch(e){}
   if(sebelum>0)toast('Data tersinkron ke Appwrite');
   try{if(typeof BS!=='undefined'&&BS.sub==='result'&&S.tab==='banksoal'&&!BS.run)render()}catch(e){}
  }
 }
 SC.tick=tick;
 setInterval(function(){tick(false)},3000);
 function segera(){SC.next=0;setTimeout(function(){tick(true)},Math.random()*1500)}
 window.addEventListener('online',segera);
 window.addEventListener('focus',segera);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)segera()});
})();
