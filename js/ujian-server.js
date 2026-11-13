/* ujian-server.js (v70): catatan ujian di server (koleksi soal_run).
   - Waktu mulai ujian = cap waktu server ($createdAt), jadi tidak bergantung jam HP.
   - Jawaban disimpan ke server tiap beberapa detik setelah ada perubahan (selain di HP).
   - Ujian berjalan bisa dilanjutkan di HP lain atau setelah data aplikasi terhapus, dengan waktu mulai yang sama.
   - Satu siswa satu catatan per sesi (ID tetap), jadi mulai ulang di perangkat lain tidak mengulang waktu.
   Bila koleksi soal_run belum dibuat (galat 404), semua ini dilewati dan ujian berjalan seperti v69 dengan jam server dari sampel lain.
   Dimuat setelah banksoal-io.js. */
(function(){
 if(!window.Cloud||!Cloud.on||typeof BS==='undefined')return;
 var COL='soal_run',st={timer:0,noCol:false};

 function h32(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)}
 /* ID dokumen maksimal 36 karakter: r + sesi_siswa, atau hash bila terlalu panjang */
 window.bsRunId=function(sesiId,sid){
  var k=(String(sesiId)+'_'+String(sid)).replace(/[^a-zA-Z0-9_.-]/g,'_');
  return 'r'+(k.length<=34?k:h32(String(sesiId))+h32(String(sid))+h32(k));
 };
 function pay(r){return JSON.stringify({mode:r.mode,sesiId:r.sesiId,sesiJudul:r.sesiJudul,dur:r.dur,ids:r.ids,oo:r.oo,ans:r.ans,cur:r.cur,chk:r.chk,pindah:r.pindah||0,tampil:r.tampil,kkm:r.kkm})}
 function lomba(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){var e=new Error('Waktu tunggu habis');e.code=408;rej(e)},ms);p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)})})}

 /* durasi dan KKM selalu dari sesi guru, bukan dari payload catatan yang bisa diubah siswa lewat API */
 function fixDur(r){try{var ss=BS.D.sesi.filter(function(x){return x.id===r.sesiId})[0];if(ss){r.dur=(ss.durasi||0)*60;if(ss.kkm!==undefined)r.kkm=ss.kkm}}catch(e){}}

 /* Mulai ujian: ambil atau buat catatan di server, lalu jalankan. Gagal terhubung: lanjut dengan jam yang ada dan sinkron menyusul. */
 window.bsMulaiUjian=async function(s,run){
  if(BS.starting||BS.run)return;
  BS.starting=true;toast('Menyiapkan ujian…');
  try{
   var rid=bsRunId(s.id,S.user.id);run.rid=rid;run.srv=0;
   if(!st.noCol&&navigator.onLine!==false){
    try{
     var doc=await lomba(Cloud.db.createDocument(CFG.DB,COL,rid,{sid:S.user.id,sesiId:s.id,ts:Jam.now(),done:false,payload:pay(run)}),8000);
     run.start=Date.parse(doc.$createdAt)||run.start;run.srv=1;
    }catch(e){
     if(e&&e.code===409){
      try{
       var ex=await lomba(Cloud.db.getDocument(CFG.DB,COL,rid),8000);
       if(ex.done){toast('Kamu sudah mengerjakan sesi ini');return}
       var p={};try{p=JSON.parse(ex.payload||'{}')}catch(e2){}
       if(p.ids&&p.ids.length){Object.assign(run,p);fixDur(run)}
       run.start=Date.parse(ex.$createdAt)||run.start;run.srv=1;
       toast('Ujian dilanjutkan dari server');
      }catch(e3){}
     }else if(e&&e.code===404)st.noCol=true;
    }
   }
   if(!Jam.ok)toast('Jam server belum terbaca, memakai jam perangkat sementara');
   if(BS.run)return;
   bsStartRun(run);
  }finally{BS.starting=false}
 };

 /* Simpan jawaban ke server: ditunda dan digabung agar ratusan siswa tidak menulis terus-menerus */
 async function push(){
  st.timer=0;var r=BS.run;
  if(!r||!r.rid||r.mode!=='ujian'||st.noCol||navigator.onLine===false)return;
  r.dirty=0;
  try{
   if(!r.srv){
    try{
     await Cloud.db.createDocument(CFG.DB,COL,r.rid,{sid:S.user.id,sesiId:r.sesiId,ts:Jam.now(),done:false,payload:pay(r)});
     r.srv=1;
    }catch(e){
     if(e&&e.code===409){
      /* sudah ada dari perangkat lain atau percobaan sebelumnya: ikuti waktu mulai server bila lebih awal */
      var ex=await Cloud.db.getDocument(CFG.DB,COL,r.rid),t=Date.parse(ex.$createdAt);
      if(t&&t<r.start)r.start=t;
      r.srv=1;
      if(ex.done){toast('Ujian ini sudah dikirim dari perangkat lain');}
     }else throw e;
    }
   }
   await Cloud.db.updateDocument(CFG.DB,COL,r.rid,{payload:pay(r)});
   bsRunSave0();
  }catch(e){
   if(e&&e.code===404)st.noCol=true;else r.dirty=1;
  }
 }
 function sched(){
  var r=BS.run;if(!r||r.mode!=='ujian'||!r.rid||st.noCol)return;
  r.dirty=1;
  if(!st.timer)st.timer=setTimeout(push,10000+Math.random()*4000);
 }
 var bsRunSave0=bsRunSave;
 bsRunSave=function(){bsRunSave0();sched()};
 /* kirim segera saat aplikasi disembunyikan atau ditutup */
 function segera(){var r=BS.run;if(r&&r.dirty&&r.rid){if(st.timer){clearTimeout(st.timer);st.timer=0}push()}}
 document.addEventListener('visibilitychange',function(){if(document.hidden)segera()});
 window.addEventListener('pagehide',segera);
 /* denyut: tiap 4 menit satu tulis ringan juga menyegarkan sampel jam server */
 setInterval(function(){if(BS.run&&BS.run.mode==='ujian'&&Jam.age()>240000)sched()},30000);
 window.addEventListener('online',segera);

 /* Tandai selesai di server setelah hasil dibuat */
 window.bsRunDone=function(r){
  if(!r||!r.rid||st.noCol)return;
  (async function(){
   for(var i=0;i<3;i++){
    try{await Cloud.db.updateDocument(CFG.DB,COL,r.rid,{done:true,payload:pay(r)});return}
    catch(e){if(e&&(e.code===404||e.code===400||e.code===403))return;await new Promise(function(res){setTimeout(res,3000*(i+1))})}
   }
  })();
 };

 /* Dipanggil bsLoad: bila ada ujian berjalan di server tetapi tidak di perangkat ini, lanjutkan */
 window.bsRunRestore=async function(){
  if(st.noCol||isStaff()||BS.run||!S.user||BS.starting)return;
  try{if(localStorage.getItem(bsRunKey()))return}catch(e){}
  var docs;
  try{docs=await Cloud.list(COL,[Appwrite.Query.equal('sid',[S.user.id])])}
  catch(e){if(e&&e.code===404)st.noCol=true;return}
  var d=docs.filter(function(x){return !x.done}).sort(function(a,b){return Date.parse(b.$createdAt)-Date.parse(a.$createdAt)})[0];
  if(!d)return;
  if(BS.D.hasil.some(function(h){return h.sid===S.user.id&&h.sesiId===d.sesiId&&h.mode==='ujian'}))return;
  var p={};try{p=JSON.parse(d.payload||'{}')}catch(e){}
  if(!p.ids||!p.ids.length)return;
  var r=Object.assign({},p,{start:Date.parse(d.$createdAt)||Jam.now(),sid:S.user.id,rid:d.$id,srv:1,done:0,dirty:0});fixDur(r);
  BS.run=r;BS.resumed=true;
  if(S.tab==='banksoal')BS.sub='run';
  bsRunSave0();
  if(r.dur&&bsRemain(r)<=0)setTimeout(function(){bsFinish(true)},0);else bsTimerOn();
  toast('Ujian yang sedang berjalan dilanjutkan');
 };
})();
