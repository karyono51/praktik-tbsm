/* cbt.js (v80): layar ujian CBT untuk siswa di atas bank soal.
   - Token sesi (dibacakan pengawas), diperiksa fungsi server cbt (mode aman) atau lewat hash (mode biasa).
   - Navigasi nomor soal berwarna (dijawab, ragu-ragu, kosong) dan tombol Ragu-ragu.
   - Layar penuh, hitungan keluar halaman, peringatan, kunci layar (dibuka guru), atau kirim otomatis.
   - Tambah waktu dan akhiri ujian dari guru (ext, stop, pb di catatan ujian) ikut terbaca saat sinkron.
   - Mode CBT aman (CFG.CBT_AMAN): soal dipilih dan dinilai fungsi server cbt; kunci tidak pernah terunduh ke siswa.
   Dimuat setelah banksoal.js, ujian-server.js, dan siswa-ui.js. Dokumen: docs-CBT.md */
(function(){
 if(typeof BS==='undefined')return;
 var CBT={grace:0,kirimBusy:false,retry:0,retryTimer:0,pendChecked:false,kcBusy:{},kcErr:{}};

 /* ---------- Layar penuh ---------- */
 function fsSupported(){var d=document.documentElement;return !!(d.requestFullscreen||d.webkitRequestFullscreen)}
 function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement)}
 function fsReq(){var d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;if(!f)return;CBT.grace=Date.now()+3000;try{var p=f.call(d);if(p&&p.catch)p.catch(function(){})}catch(e){}}
 function fsExit(){try{var f=document.exitFullscreen||document.webkitExitFullscreen;if(f&&isFs()){var p=f.call(document);if(p&&p.catch)p.catch(function(){})}}catch(e){}}
 window.cbtMasukLayar=fsReq;

 /* ---------- Kebijakan sesi ---------- */
 function sesiOf(r){return BS.D.sesi.filter(function(x){return x.id===r.sesiId})[0]||{}}
 function pol(r){var s=sesiOf(r);return {batas:s.batas!==undefined?(+s.batas||0):(+r.batas||0),aksi:s.aksi||r.aksi||'peringatan',layar:s.layar!==undefined?!!s.layar:!!r.layar}}
 function viol(r){return Math.max(0,(r.pindah||0)-(r.pb||0))}
 function locked(r){var p=pol(r);return !!r&&r.mode==='ujian'&&p.aksi==='kunci'&&p.batas>0&&viol(r)>=p.batas}
 function inExam(){var r=BS.run;return !!(r&&r.mode==='ujian'&&!r.done&&S.tab==='banksoal'&&BS.sub==='run')}
 window.cbtDenyutMs=function(r){return locked(r)?8000:((window.CFG&&CFG.CBT_DENYUT)||60000)};
 /* ext (tambahan detik), stop (diakhiri guru), pb (batas pelanggaran yang dibuka guru) dari catatan ujian */
 window.cbtApply=function(r,d){
  if(!r||!d)return;
  if(d.ext!==undefined&&d.ext!==null)r.ext=Number(d.ext)||0;
  if(d.pb!==undefined&&d.pb!==null)r.pb=Number(d.pb)||0;
  if(d.stop!==undefined&&d.stop!==null)r.stop=d.stop===true;
 };

 /* ---------- Panggilan fungsi server ---------- */
 function lomba(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){var e=new Error('Waktu tunggu habis');e.code=408;rej(e)},ms);p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)})})}
 window.cbtFn=async function(body){
  var cl=(Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
  var t0=Date.now(),ex;
  try{ex=await lomba(new Appwrite.Functions(cl).createExecution(CFG.FN_CBT||'cbt',JSON.stringify(body),false,'/','POST',{'content-type':'application/json'}),25000)}
  catch(e){
   if(e&&(e.code===404||/not found/i.test(e.message||''))){var n=new Error('Fungsi server "cbt" belum dipasang. Hubungi admin (docs-CBT.md).');n.code=404;n.fatal=true;throw n}
   throw e;
  }
  var t1=Date.now(),j={};try{j=JSON.parse(ex.responseBody||'{}')}catch(e2){}
  if(!j.ok){
   var st=+ex.responseStatusCode||0,er=new Error(j.error||('Fungsi cbt gagal (kode '+st+')'));
   er.code=st||500;er.fatal=st>=400&&st<500;throw er;
  }
  if(j.now&&window.Jam)Jam.sampleMs(j.now,t0,t1);
  return j;
 };
 function cbtKc(kc){if(!kc)return;Object.keys(kc).forEach(function(id){BS.kc[id]=kc[id]});BS.all=null}
 function pesan(e){return (e&&e.message)||String(e)}

 /* ---------- Mulai ujian: token, layar penuh, server ---------- */
 var legacyMulai=window.bsMulaiUjian;
 window.bsMulaiUjian=async function(s,run){
  if(BS.starting||BS.run||CBT.mulai)return;
  CBT.mulai=true;
  try{
   var token='';
   if(s.tok){
    var t=await uiPrompt('Masukkan token ujian dari pengawas.',{title:'Token ujian',label:'Token',ok:'Mulai'});
    if(t===null)return;
    token=String(t).trim().toUpperCase();
    if(!token){toast('Token belum diisi');return}
    if(!bsAman()){
     var hh=await hashPw(token,s.tokS||'');
     if(!s.tokH||hh!==s.tokH){toast('Token salah');return}
    }
   }
   if(s.layar&&fsSupported())fsReq();
   if(!bsAman()){
    run.batas=s.batas||0;run.aksi=s.aksi||'peringatan';run.layar=!!s.layar;run.rg=run.rg||{};run.ext=0;run.pb=0;
    CBT.mulai=false;
    if(typeof legacyMulai==='function')return await legacyMulai(s,run);
    bsStartRun(run);return;
   }
   BS.starting=true;toast('Menyiapkan ujian…');
   try{
    var rs=await cbtFn({action:'mulai',sesiId:s.id,token:token});
    if(BS.run)return;
    var r={mode:'ujian',sesiId:s.id,sesiJudul:rs.sesiJudul,start:rs.start,dur:rs.dur,ids:rs.ids,oo:rs.oo||{},ans:rs.ans||{},cur:rs.cur||0,chk:rs.chk||{},pindah:rs.pindah||0,rg:rs.rg||{},sid:S.user.id,tampil:!!rs.tampil,kkm:rs.kkm,
     rid:rs.rid,srv:1,ext:rs.ext||0,stop:!!rs.stop,pb:rs.pb||0,batas:rs.batas||0,aksi:rs.aksi||'peringatan',layar:!!rs.layar};
    if(rs.resume)toast('Ujian dilanjutkan dari server');
    bsStartRun(r);
   }catch(e){
    fsExit();
    toast(pesan(e));
   }finally{BS.starting=false}
  }finally{CBT.mulai=false}
 };

 /* ---------- Tampilan soal ---------- */
 function nAns(r){return Object.keys(r.ans).filter(function(k){var s=bsSoalById(k);return s&&bsAnswered(s,r.ans[k])}).length}
 function nRg(r){return Object.keys(r.rg||{}).filter(function(k){return r.rg[k]&&r.ids.indexOf(k)>-1}).length}
 bsViewRun=function(){
  var r=BS.run,id=r.ids[r.cur],q=bsSoalById(id),exam=r.mode==='ujian',mode=exam?'answer':'check',h='';
  if(!q)return '<div class="card"><p>Soal ini sudah tidak tersedia.</p><button type="button" class="btn" data-bs="next">Lewati</button></div>';
  var p=pol(r),v=viol(r),rgc=nRg(r);
  h+='<div class="card"><div class="row sb"><b>'+esc(r.sesiJudul||'Latihan soal')+'</b><span class="note">Soal '+(r.cur+1)+' dari '+r.ids.length+' · terjawab '+nAns(r)+(exam&&rgc?' · ragu '+rgc:'')+'</span></div>';
  h+='<div class="bs-nav">'+r.ids.map(function(x,i){var s=bsSoalById(x),dn=s&&bsAnswered(s,r.ans[x]);return '<button type="button" class="'+(dn?'dn ':'')+((r.rg&&r.rg[x])?'rg ':'')+(i===r.cur?'cur':'')+'" data-bs="goto" data-v="'+i+'" aria-label="Soal '+(i+1)+(dn?', terjawab':', belum dijawab')+((r.rg&&r.rg[x])?', ragu-ragu':'')+'">'+(i+1)+'</button>'}).join('')+'</div>';
  if(exam){
   h+='<div class="bs-leg"><span><i class="dn"></i>Dijawab</span><span><i class="rg"></i>Ragu-ragu</span><span><i></i>Kosong</span></div>';
   var ex=[];
   if(p.batas>0)ex.push('<span class="pill '+(v?'warn':'plain')+'">Keluar halaman '+v+' dari '+p.batas+'</span>');
   if(p.layar&&fsSupported()&&!isFs())ex.push('<button type="button" class="btn small" data-bs="layar">Layar penuh</button>');
   if(ex.length)h+='<div class="row">'+ex.join('')+'</div>';
  }
  h+='</div>';
  h+='<div class="card"><div class="row sb"><span class="row"><span class="pill plain">'+esc(q.mapel||'')+'</span><span class="pill plain">'+BS_TIPE[q.tipe]+'</span></span>'+
   (exam?'<button type="button" class="btn small bs-rgb" data-bs="ragu" aria-pressed="'+!!(r.rg&&r.rg[id])+'">Ragu-ragu</button>':'')+'</div>'+bsQBody(q,r,mode);
  if(mode==='check'&&!r.chk[id])h+='<button type="button" class="btn" data-bs="cek"'+(bsAnswered(q,r.ans[id])&&!r.checking?'':' disabled')+'>'+(r.checking?'Memeriksa…':'Periksa jawaban')+'</button>';
  h+='</div>';
  var last=r.cur===r.ids.length-1;
  h+='<div class="bsbar"><span class="bsclock" id="bs-clock" role="timer">'+(r.dur?mmss(Math.ceil(bsRemain(r)/1000)):mmss(Math.floor((Jam.now()-r.start)/1000)))+'</span><button type="button" class="btn" data-bs="prev"'+(r.cur?'':' disabled')+'>Kembali</button>'+(last?'<button type="button" class="btn primary" data-bs="selesai">Selesai</button>':'<button type="button" class="btn primary" data-bs="next">Lanjut</button>')+'</div>';
  return h;
 };

 /* ---------- Penghitung waktu: tambah waktu, diakhiri guru, kunci ---------- */
 bsTimerOn=function(){
  if(BS.timer)clearInterval(BS.timer);
  BS.timer=setInterval(function(){
   var r=BS.run;
   if(!r){clearInterval(BS.timer);BS.timer=null;cbtPost();return}
   var el=document.getElementById('bs-clock');
   if(r.dur){var ms=bsRemain(r);if(el){el.textContent=mmss(Math.ceil(ms/1000));el.classList.toggle('low',ms<300000)}if(ms<=0){bsFinish(true);return}}
   else if(el)el.textContent=mmss(Math.floor((Jam.now()-r.start)/1000));
   if(r.mode==='ujian'&&r.stop&&!r.done){toast('Pengawas mengakhiri ujian. Jawaban dikirim.');bsFinish(true);return}
   cbtPost();
  },1000);
 };

 /* ---------- Kunci layar dan layar penuh wajib ---------- */
 function overlay(){
  var r=BS.run,need=null,p=r?pol(r):null;
  if(inExam()){
   if(locked(r))need='lock';
   else if(p.layar&&fsSupported()&&!isFs()&&Date.now()>CBT.grace)need='fs';
  }
  var el=document.getElementById('cbt-ov');
  if(!need){if(el)el.remove();return}
  var html=need==='lock'?
   '<div class="cbt-box"><h3>Ujian dikunci</h3><p>Kamu keluar dari halaman ujian '+viol(r)+' kali (batas '+p.batas+'). Waktu tetap berjalan. Panggil pengawas untuk membuka kunci.</p><button type="button" class="btn" data-bs="cekkunci">Periksa lagi</button></div>':
   '<div class="cbt-box"><h3>Layar penuh diperlukan</h3><p>Ujian ini harus dikerjakan dalam layar penuh. Waktu tetap berjalan.</p><button type="button" class="btn primary" data-bs="layar">Masuk layar penuh</button></div>';
  if(el&&el.dataset.k===need&&el.dataset.h===html)return;
  if(el)el.remove();
  el=document.createElement('div');el.id='cbt-ov';el.dataset.k=need;el.dataset.h=html;el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.innerHTML=html;
  document.body.appendChild(el);
 }
 function cbtPost(){
  try{
   document.body.classList.toggle('cbt-exam',inExam());
   overlay();
  }catch(e){}
 }
 var render0=render;
 render=function(){render0.apply(this,arguments);cbtPost()};

 function pelanggaran(r,sumber){
  var p=pol(r),v=viol(r);
  if(typeof bsRunSave==='function')bsRunSave();
  if(window.bsPushNow&&r.rid)bsPushNow();
  if(p.batas<=0)return;
  if(v>=p.batas&&p.aksi==='kirim'&&!r.done){toast('Batas pelanggaran terlewati. Jawaban dikirim otomatis.');bsFinish(true);return}
  if(p.aksi==='peringatan'&&!document.hidden)toast('Peringatan: keluar halaman '+v+'×. Batas '+p.batas+'×.');
  cbtPost();
 }
 document.addEventListener('visibilitychange',function(){
  var r=BS.run;if(!r||r.mode!=='ujian'||r.done)return;
  if(document.hidden){
   /* banksoal.js sudah menambah r.pindah; di sini hanya menerapkan aturan */
   pelanggaran(r,'hidden');
  }else{
   if(r.dur&&bsRemain(r)<=0)return;
   var p=pol(r);if(p.aksi==='peringatan'&&p.batas>0&&viol(r)>0)toast('Peringatan: keluar halaman '+viol(r)+'×. Batas '+p.batas+'×.');
   cbtPost();
   if(window.bsPushNow&&r.rid)bsPushNow();
  }
 });
 function fsChange(){
  var r=BS.run;if(!inExam())return;
  var p=pol(r);
  if(p.layar&&!isFs()&&Date.now()>CBT.grace){r.pindah=(r.pindah||0)+1;pelanggaran(r,'fs')}
  cbtPost();
 }
 document.addEventListener('fullscreenchange',fsChange);
 document.addEventListener('webkitfullscreenchange',fsChange);
 window.addEventListener('beforeunload',function(e){if(inExam()){e.preventDefault();e.returnValue=''}});
 ['contextmenu','copy','cut'].forEach(function(t){document.addEventListener(t,function(e){if(inExam()&&e.target&&e.target.closest&&e.target.closest('.bs-q,.bs-opts,.bs-kat'))e.preventDefault()})});

 /* ---------- Mengakhiri ujian dan latihan di server ---------- */
 var bsFinish0=bsFinish;
 bsFinish=function(auto){
  var r=BS.run;
  if(!r||r.done)return;
  if(!bsAman())return bsFinish0.apply(this,arguments);
  if(r.mode==='latihan')return finLatihan(r);
  if(!r.rid)return bsFinish0.apply(this,arguments);
  return finUjian(r,!!auto);
 };
 function pendKey(){return 'tbsm-cbt-kirim-'+(S.user?S.user.id:'')}
 function pendGet(){try{return JSON.parse(localStorage.getItem(pendKey())||'null')}catch(e){return null}}
 function pendSet(p){try{localStorage.setItem(pendKey(),JSON.stringify(p))}catch(e){}}
 function pendDel(){try{localStorage.removeItem(pendKey())}catch(e){}}
 function sleep(ms){return new Promise(function(res){setTimeout(res,ms)})}
 function hasilLokal(p,rs,mode){
  var h=rs.hasil;
  return {id:h.id,ts:h.ts,sid:S.user.id,siswa:S.user.nama,kelas:S.user.kelas||'',mode:mode,sesiId:p.sesiId||'',sesiJudul:p.judul||'',score:h.score,benar:h.benar,total:h.total,detik:h.detik,
   ans:p.ans,order:p.ids,oo:p.oo,pindah:rs.pindah||p.pindah||0,tampil:mode==='latihan'?true:!!rs.tampil,kkm:p.kkm,r:1,d:0};
 }
 function simpanHasil(h){
  BS.D.hasil=BS.D.hasil.filter(function(x){return x.id!==h.id});BS.D.hasil.push(h);BS.all=null;bsSaveLocal();
 }
 async function finUjian(r,auto){
  r.done=1;
  if(BS.timer){clearInterval(BS.timer);BS.timer=null}
  var p={rid:r.rid,sid:r.sid,sesiId:r.sesiId,judul:r.sesiJudul,ans:r.ans,pindah:r.pindah||0,ids:r.ids,oo:r.oo,kkm:r.kkm};
  pendSet(p);
  try{localStorage.removeItem(bsRunKey())}catch(e){}
  BS.run=null;BS.sub='sending';CBT.err='';
  fsExit();
  render();window.scrollTo(0,0);
  if(auto)await sleep(Math.floor(Math.random()*4000));
  return kirimPend(p);
 }
 async function kirimPend(p){
  if(CBT.kirimBusy)return;CBT.kirimBusy=true;clearTimeout(CBT.retryTimer);
  try{
   var rs=await cbtFn({action:'kirim',rid:p.rid,ans:p.ans,pindah:p.pindah});
   var h=hasilLokal(p,rs,'ujian');
   pendDel();CBT.retry=0;CBT.err='';
   simpanHasil(h);cbtKc(rs.kc);
   if(BS.sub==='sending'){BS.res=h.id;BS.sub='result'}
   if(S.tab==='banksoal'||BS.sub==='result')render();
  }catch(e){
   CBT.err=pesan(e);
   if(e&&e.fatal&&e.code!==408&&e.code!==429){
    /* galat tetap (mis. catatan tidak ada, sudah dikirim): jangan mengulang terus */
    if(e.code===409||/sudah/i.test(CBT.err)){pendDel();BS.sub='home';BS.loaded=false}
    CBT.retry=-1;
   }else{
    CBT.retry=Math.min(CBT.retry+1,6);
    CBT.retryTimer=setTimeout(function(){var q=pendGet();if(q)kirimPend(q)},Math.min(5000*CBT.retry,30000));
   }
   if(S.tab==='banksoal')render();
  }finally{CBT.kirimBusy=false}
 }
 async function finLatihan(r){
  if(r.sending)return;r.sending=1;
  try{
   var rs=await cbtFn({action:'kirim',mode:'latihan',ids:r.ids,ans:r.ans,oo:r.oo,detik:Math.round((Jam.now()-r.start)/1000)});
   r.done=1;
   if(BS.timer){clearInterval(BS.timer);BS.timer=null}
   try{localStorage.removeItem(bsRunKey())}catch(e){}
   var h=hasilLokal({sesiId:'',judul:'',ans:r.ans,ids:r.ids,oo:r.oo,pindah:0,kkm:r.kkm},rs,'latihan');
   simpanHasil(h);cbtKc(rs.kc);
   BS.run=null;BS.res=h.id;BS.sub='result';
   render();window.scrollTo(0,0);
  }catch(e){toast('Gagal mengirim latihan: '+pesan(e))}
  finally{r.sending=0}
 }
 function sendView(){
  var p=pendGet(),fatal=CBT.retry===-1;
  return '<div class="card center"><b>'+(fatal?'Pengiriman gagal':'Mengirim jawaban…')+'</b><p class="note">'+(CBT.err?esc(CBT.err)+(fatal?'':' Dicoba lagi otomatis. Jangan tutup halaman ini sebelum nilai tampil.'):'Jangan tutup halaman ini sebelum nilai tampil.')+'</p>'+
   (p&&!fatal?'<button type="button" class="btn primary" data-bs="kirimulang"'+(CBT.kirimBusy?' disabled':'')+'>Kirim sekarang</button>':'<button type="button" class="btn" data-bs="home">Kembali</button>')+'</div>';
 }
 var viewSiswa0=bsViewSiswa;
 bsViewSiswa=function(){if(BS.sub==='sending')return sendView();return viewSiswa0.apply(this,arguments)};
 /* kirim ulang yang tertunda (aplikasi ditutup saat mengirim) */
 var resume0=bsResume;
 bsResume=function(){
  resume0.apply(this,arguments);
  if(CBT.pendChecked||!S.user||!bsAman()||isStaff())return;
  CBT.pendChecked=true;
  var p=pendGet();
  if(p&&p.sid===S.user.id){BS.sub='sending';setTimeout(function(){kirimPend(p)},300)}
 };
 window.addEventListener('online',function(){var p=pendGet();if(p&&S.user&&bsAman()&&!CBT.kirimBusy)kirimPend(p)});

 /* ---------- Pembahasan soal sendiri: kunci diminta dari server ---------- */
 function needKc(h0){return (h0.order||[]).some(function(id){var q=bsSoalById(id);return q&&!bsHasKey(q)})}
 var viewResult0=bsViewResult;
 bsViewResult=function(){
  if(!bsAman()||isStaff())return viewResult0.apply(this,arguments);
  var h0=BS.D.hasil.filter(function(x){return x.id===BS.res})[0];
  if(!h0)return viewResult0.apply(this,arguments);
  var lat=h0.mode==='latihan',sesi=BS.D.sesi.filter(function(s){return s.id===h0.sesiId})[0],tampil=lat||(sesi&&sesi.tampil)||h0.tampil===true;
  if(!tampil||!needKc(h0))return viewResult0.apply(this,arguments);
  if(CBT.kcErr[h0.id])return viewResult0.apply(this,arguments).replace(/<div class="card"><div class="bs-rv">[\s\S]*$/,'')+'<p class="note center">Pembahasan belum bisa dimuat: '+esc(CBT.kcErr[h0.id])+'</p>';
  if(!CBT.kcBusy[h0.id]){
   CBT.kcBusy[h0.id]=1;
   cbtFn({action:'ulasan',hasilId:h0.id}).then(function(rs){cbtKc(rs.kc)},function(e){CBT.kcErr[h0.id]=pesan(e)}).then(function(){CBT.kcBusy[h0.id]=0;if(S.tab==='banksoal')render()});
  }
  return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Hasil</h2></div><div class="card center"><div class="bs-score mono">'+h0.score+'</div><p class="note">'+h0.benar+' benar dari '+h0.total+' soal</p></div><p class="muted center">Memuat pembahasan…</p>';
 };

 /* ---------- Aksi ---------- */
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
  var a=b.dataset.bs,r=BS.run;
  if(a==='cek'&&r&&bsAman()){
   var id=r.ids[r.cur];
   if(BS_IDX[id]||r.chk[id])return;               /* soal bawaan: kunci sudah ada di aplikasi */
   e.stopImmediatePropagation();
   if(r.checking||!bsAnswered(bsSoalById(id),r.ans[id]))return;
   r.checking=1;render();
   cbtFn({action:'periksa',qid:id,ans:r.ans[id]}).then(function(rs){
    BS.kc[id]=rs.kc;BS.all=null;r.chk[id]=1;bsRunSave();
   },function(er){toast('Gagal memeriksa: '+pesan(er))}).then(function(){r.checking=0;render()});
   return;
  }
  if(a==='selesai'&&r){
   e.stopImmediatePropagation();
   var un=r.ids.filter(function(x){var s2=bsSoalById(x);return !s2||!bsAnswered(s2,r.ans[x])}).length,rg=nRg(r),L=['Kirim jawaban sekarang?'];
   if(un)L.push(un+' soal belum dijawab.');
   if(rg)L.push(rg+' soal masih ditandai ragu-ragu.');
   uiConfirm(L.join('\n'),{ok:'Kirim'}).then(function(ok){if(ok&&BS.run===r)bsFinish(false)});
   return;
  }
  if(a==='ragu'&&r){
   var qid=r.ids[r.cur];r.rg=r.rg||{};
   if(r.rg[qid])delete r.rg[qid];else r.rg[qid]=1;
   bsRunSave();render();return;
  }
  if(a==='layar'){fsReq();setTimeout(function(){render()},400);return}
  if(a==='cekkunci'){
   if(window.bsPushNow&&r&&r.rid){bsPushNow().then(function(){cbtPost();if(!locked(r))toast('Kunci dibuka pengawas')})}
   return;
  }
  if(a==='kirimulang'){var p=pendGet();if(p&&!CBT.kirimBusy){CBT.retry=0;CBT.err='';kirimPend(p)}return}
 },true);

 /* bersihkan saat keluar akun */
 if(typeof doLogout==='function'){var lo0=doLogout;doLogout=async function(){CBT.pendChecked=false;CBT.kcErr={};CBT.kcBusy={};return lo0.apply(this,arguments)}}
})();
