/* cbt.js (v80): layar ujian CBT untuk siswa di atas bank soal.
   - Token sesi (dibacakan pengawas), diperiksa fungsi server cbt (mode aman) atau lewat hash (mode biasa).
   - Navigasi nomor soal berwarna (dijawab, ragu-ragu, kosong) dan tombol Ragu-ragu.
   - Layar penuh, hitungan keluar halaman, peringatan, kunci layar (dibuka guru), atau kirim otomatis.
   - Tambah waktu dan akhiri ujian dari guru (ext, stop, pb di catatan ujian) ikut terbaca saat sinkron.
   - Mode CBT aman (CFG.CBT_AMAN): soal dipilih dan dinilai fungsi server cbt; kunci tidak pernah terunduh ke siswa.
   Dimuat setelah banksoal.js, ujian-server.js, dan siswa-ui.js. Dokumen: docs-CBT.md */
(function(){
 if(typeof BS==='undefined')return;
 var CBT={grace:0,kirimBusy:false,retry:0,retryTimer:0,pendChecked:false,kcBusy:{},kcErr:{},nav:false,fs:0};
 try{CBT.fs=Math.max(0,Math.min(2,+localStorage.getItem('tbsm.cbt.fs')||0))}catch(e){}
 function runOn(){return !!(BS.run&&bsOn()&&BS.sub==='run')}

 /* ---------- Layar penuh ---------- */
 /* Exambro: UserAgent memuat kata EXAMBRO_UA (config.js). Di sana layar penuh wajib dilewati karena WebView sering tak mendukungnya. */
 function isExambro(){var k=(window.APP_CONFIG&&APP_CONFIG.EXAMBRO_UA)||'TBSM-EXAM';return String(navigator.userAgent||'').toUpperCase().indexOf(String(k).toUpperCase())>=0}
 window.cbtIsExambro=isExambro;
 function fsSupported(){var d=document.documentElement;return !!(d.requestFullscreen||d.webkitRequestFullscreen)}
 function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement)}
 function fsReq(){var d=document.documentElement,f=d.requestFullscreen||d.webkitRequestFullscreen;if(!f)return;CBT.grace=Date.now()+3000;try{var p=f.call(d);if(p&&p.catch)p.catch(function(){})}catch(e){}}
 function fsExit(){try{var f=document.exitFullscreen||document.webkitExitFullscreen;if(f&&isFs()){var p=f.call(document);if(p&&p.catch)p.catch(function(){})}}catch(e){}}
 window.cbtMasukLayar=fsReq;

 /* ---------- Kebijakan sesi ---------- */
 function sesiOf(r){return BS.D.sesi.filter(function(x){return x.id===r.sesiId})[0]||{}}
 function pol(r){var s=sesiOf(r);return {batas:s.batas!==undefined?(+s.batas||0):(+r.batas||0),aksi:s.aksi||r.aksi||'peringatan',layar:!isExambro()&&(s.layar!==undefined?!!s.layar:!!r.layar)}}
 function viol(r){return Math.max(0,(r.pindah||0)-(r.pb||0))}
 function locked(r){var p=pol(r);return !!r&&r.mode==='ujian'&&p.aksi==='kunci'&&p.batas>0&&viol(r)>=p.batas}
 function inExam(){var r=BS.run;return !!(r&&r.mode==='ujian'&&!r.done&&bsOn()&&BS.sub==='run')}
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
   if(window.bsRunLain){var lain=await bsRunLain(s);if(lain){toast('Kamu masih mengerjakan ujian "'+lain+'" (mungkin di perangkat lain). Selesaikan dahulu.');return}}
   if(s.exambro&&!isExambro()){toast('Sesi ini wajib dikerjakan lewat aplikasi Exambro. Buka alamat ujian dari Exambro.');return}
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
   if(s.layar&&!isExambro()&&fsSupported())fsReq();
   if(!bsAman()){
    run.batas=s.batas||0;run.aksi=s.aksi||'peringatan';run.layar=!!s.layar;run.rg=run.rg||{};run.ext=0;run.pb=0;
    CBT.mulai=false;
    if(typeof legacyMulai==='function'){var lr=await legacyMulai(s,run);if(!BS.run)fsExit();return lr}
    bsStartRun(run);return;
   }
   BS.starting=true;toast('Menyiapkan ujian…');
   try{
    var rs=await cbtFn({action:'mulai',sesiId:s.id,token:token,ua:String(navigator.userAgent||'').slice(0,400)});
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

 /* ---------- Status penyimpanan jawaban (agar siswa tahu jawabannya sudah aman) ---------- */
 function svInfo(r){
  if(!r||r.mode!=='ujian'||!r.rid)return null;
  var off=navigator.onLine===false,lama=r.dirty&&Date.now()-(r.lastPush||0)>30000;
  if(off)return {t:'Offline · jawaban aman di perangkat, terkirim saat online',c:'warn'};
  if(r.saveErr>=2||lama)return {t:'Belum terkirim ke server · jangan tutup halaman',c:'bad'};
  if(r.dirty)return {t:'Menyimpan…',c:'plain'};
  if(r.savedAt)return {t:'Tersimpan '+new Date(r.savedAt).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'}),c:'ok'};
  return {t:'Jawaban disimpan otomatis',c:'plain'};
 }
 function svPaint(r){
  var el=document.getElementById('cbt-sv'),i=svInfo(r);
  if(!el||!i)return;
  if(el.textContent!==i.t)el.textContent=i.t;
  var cl='pill '+i.c;if(el.className!==cl)el.className=cl;
 }
 window.cbtSvInfo=svInfo;

 /* ---------- Tampilan soal ---------- */
 function nAns(r){return Object.keys(r.ans).filter(function(k){var s=bsSoalById(k);return s&&bsAnswered(s,r.ans[k])}).length}
 function nRg(r){return Object.keys(r.rg||{}).filter(function(k){return r.rg[k]&&r.ids.indexOf(k)>-1}).length}
 /* Tampilan soal untuk HP: bar atas ringkas (judul, progres, timer, ukuran huruf), navigasi nomor satu baris yang bisa digeser,
  kartu soal dengan pilihan besar, bar bawah (Kembali, Daftar soal, Lanjut), dan Daftar soal sebagai lembar bawah. */
 var IC_L='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  IC_R='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  IC_G='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  IC_F='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4M6 5h11l-2 4 2 4H6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 function qState(r,x,i){var s=bsSoalById(x),dn=s&&bsAnswered(s,r.ans[x]),rg=!!(r.rg&&r.rg[x]);
  return {dn:dn,rg:rg,cls:(dn?'dn ':'')+(rg?'rg ':'')+(i===r.cur?'cur':''),lab:'Soal '+(i+1)+(dn?', terjawab':', belum dijawab')+(rg?', ragu-ragu':'')}}
 function sheetHtml(r,exam){
  var n=r.ids.length,na=nAns(r),rgc=nRg(r);
  return '<div id="ex-sheet" role="dialog" aria-modal="true" aria-label="Daftar soal"><div class="ex-sbg" data-bs="daftartutup"></div><div class="ex-sbody">'+
   '<div class="ex-handle" aria-hidden="true"></div><div class="row sb"><b>Daftar soal</b><button type="button" class="btn small" data-bs="daftartutup">Tutup</button></div>'+
   '<div class="ex-sum"><div><b>'+na+'</b><span>Terjawab</span></div>'+(exam?'<div><b>'+rgc+'</b><span>Ragu-ragu</span></div>':'')+'<div><b>'+(n-na)+'</b><span>Kosong</span></div></div>'+
   '<div class="ex-grid">'+r.ids.map(function(x,i){var st=qState(r,x,i);return '<button type="button" class="'+st.cls+'" data-bs="exgoto" data-v="'+i+'" aria-label="'+st.lab+'">'+(i+1)+'</button>'}).join('')+'</div>'+
   '<div class="bs-leg"><span><i class="dn"></i>Dijawab</span>'+(exam?'<span><i class="rg"></i>Ragu-ragu</span>':'')+'<span><i></i>Kosong</span></div>'+
   '<div class="ex-acts">'+(n-na?'<button type="button" class="btn" data-bs="kekosong">Ke soal kosong</button>':'')+(exam?'<button type="button" class="btn primary" data-bs="selesai">Selesai dan kirim</button>':'')+'</div></div></div>';
 }
 bsViewRun=function(){
  var r=BS.run,id=r.ids[r.cur],q=bsSoalById(id),exam=r.mode==='ujian',mode=exam?'answer':'check',h='';
  if(!q)return '<div class="card"><p>Soal ini sudah tidak tersedia.</p><button type="button" class="btn" data-bs="next">Lewati</button></div>';
  var p=pol(r),v=viol(r),rgc=nRg(r),na=nAns(r),n=r.ids.length,rem=r.dur?bsRemain(r):0,
   clock=r.dur?mmss(Math.ceil(rem/1000)):mmss(Math.floor((Jam.now()-r.start)/1000)),
   ex=[];
  if(exam){
   if(p.batas>0)ex.push('<span class="pill '+(v?'warn':'plain')+'">Keluar halaman '+v+' dari '+p.batas+'</span>');
   if(p.layar&&fsSupported()&&!isFs())ex.push('<button type="button" class="btn small" data-bs="layar">Layar penuh</button>');
   var sv=svInfo(r);if(sv)ex.push('<span class="pill '+sv.c+'" id="cbt-sv" role="status">'+esc(sv.t)+'</span>');
  }
  h+='<div class="ex-top"><div class="ex-bar"><div class="ex-ttl"><b>'+esc(r.sesiJudul||'Latihan soal')+'</b><span>Soal '+(r.cur+1)+' dari '+n+' · terjawab '+na+(exam&&rgc?' · ragu '+rgc:'')+'</span></div>'+
   '<button type="button" class="ex-aa" data-bs="huruf" aria-label="Ukuran huruf soal">Aa</button>'+
   '<span class="bsclock ex-clock'+(r.dur&&rem<300000?' low':'')+(r.dur&&rem<60000?' crit':'')+'" id="bs-clock" role="timer">'+clock+'</span></div>'+
   '<div class="ex-nav" id="ex-nav" role="group" aria-label="Navigasi soal">'+r.ids.map(function(x,i){var st=qState(r,x,i);return '<button type="button" class="'+st.cls+'" data-bs="goto" data-v="'+i+'" aria-label="'+st.lab+'"'+(i===r.cur?' aria-current="true"':'')+'>'+(i+1)+'</button>'}).join('')+'</div>'+
   (ex.length?'<div class="ex-st">'+ex.join('')+'</div>':'')+
   '<div class="ex-prog" aria-hidden="true"><i style="width:'+Math.round((r.cur+1)/n*100)+'%"></i></div></div>';
  h+='<div class="card ex-q"><div class="ex-qh"><span class="ex-no" aria-hidden="true">'+(r.cur+1)+'</span><span class="ex-chips"><span class="pill plain">'+esc(q.mapel||'')+'</span><span class="pill plain">'+BS_TIPE[q.tipe]+'</span></span>'+
   (exam?'<button type="button" class="ex-rg" data-bs="ragu" aria-pressed="'+!!(r.rg&&r.rg[id])+'">'+IC_F+'Ragu-ragu</button>':'')+'</div>'+bsQBody(q,r,mode);
  if(mode==='check'&&!r.chk[id])h+='<button type="button" class="btn" data-bs="cek"'+(bsAnswered(q,r.ans[id])&&!r.checking?'':' disabled')+'>'+(r.checking?'Memeriksa…':'Periksa jawaban')+'</button>';
  h+='</div>';
  var last=r.cur===n-1;
  h+='<div class="bsbar ex-foot"><button type="button" class="btn ex-prev" data-bs="prev"'+(r.cur?'':' disabled')+'>'+IC_L+'Kembali</button>'+
   '<button type="button" class="btn ex-list" data-bs="daftar" aria-haspopup="dialog">'+IC_G+'<b>'+na+'/'+n+'</b></button>'+
   (last?'<button type="button" class="btn primary ex-next" data-bs="selesai">Selesai</button>':'<button type="button" class="btn primary ex-next" data-bs="next">Lanjut'+IC_R+'</button>')+'</div>';
  if(CBT.nav)h+=sheetHtml(r,exam);
  return h;
 };

 /* ---------- Penghitung waktu: tambah waktu, diakhiri guru, kunci ---------- */
 bsTimerOn=function(){
  if(BS.timer)clearInterval(BS.timer);
  BS.timer=setInterval(function(){
   var r=BS.run;
   if(!r){clearInterval(BS.timer);BS.timer=null;cbtPost();return}
   var el=document.getElementById('bs-clock');
   if(r.dur){var ms=bsRemain(r);if(el){el.textContent=mmss(Math.ceil(ms/1000));el.classList.toggle('low',ms<300000);el.classList.toggle('crit',ms<60000)}if(ms<=0){bsFinish(true);return}}
   else if(el)el.textContent=mmss(Math.floor((Jam.now()-r.start)/1000));
   if(r.mode==='ujian'&&r.stop&&!r.done){toast('Pengawas mengakhiri ujian. Jawaban dikirim.');bsFinish(true);return}
   svPaint(r);
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
 /* Layar tetap menyala selama mengerjakan (bila peramban mendukung) dan nomor soal aktif dipusatkan di baris navigasi. */
 var WL={s:null,p:0};
 function wlSync(on){
  if(!('wakeLock' in navigator))return;
  if(on&&!WL.s&&!WL.p&&!document.hidden){WL.p=1;navigator.wakeLock.request('screen').then(function(x){WL.s=x;WL.p=0;x.addEventListener('release',function(){WL.s=null})},function(){WL.p=0})}
  else if(!on&&WL.s){try{WL.s.release()}catch(e){}WL.s=null}
 }
 document.addEventListener('visibilitychange',function(){if(!document.hidden)wlSync(runOn())});
 function centerNav(){
  var nv=document.getElementById('ex-nav'),c=nv&&nv.querySelector('.cur');
  if(nv&&c)nv.scrollLeft=Math.max(0,c.offsetLeft-(nv.clientWidth-c.offsetWidth)/2);
 }
 function cbtPost(){
  try{
   document.body.classList.toggle('cbt-exam',inExam());
   var on=runOn(),bc=document.body.classList;
   bc.toggle('bs-run',on);bc.toggle('ex-lock',on&&!!CBT.nav);bc.toggle('ex-fs1',on&&CBT.fs===1);bc.toggle('ex-fs2',on&&CBT.fs===2);
   if(!on)CBT.nav=false;
   wlSync(on);centerNav();
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
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&CBT.nav&&runOn()){CBT.nav=false;render()}});
 /* Geser kiri/kanan pada kartu soal untuk pindah soal (tidak berlaku di baris navigasi, daftar soal, atau saat menggulir tegak). */
 (function(){
  var x0=0,y0=0,t0=0,ok=false;
  document.addEventListener('touchstart',function(e){
   ok=false;if(!document.body.classList.contains('bs-run')||CBT.nav||e.touches.length!==1)return;
   var t=e.target;if(!t.closest||!t.closest('.ex-q'))return;
   ok=true;x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now();
  },{passive:true});
  document.addEventListener('touchend',function(e){
   if(!ok)return;ok=false;
   var c=e.changedTouches[0],dx=c.clientX-x0,dy=c.clientY-y0;
   if(Date.now()-t0>700||Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*2)return;
   var b=document.querySelector(dx<0?'.ex-next[data-bs="next"]':'.ex-prev:not([disabled])');if(b)b.click();
  },{passive:true});
 })();
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
   if(bsOn()||BS.sub==='result')render();
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
   if(bsOn())render();
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
   cbtFn({action:'ulasan',hasilId:h0.id}).then(function(rs){cbtKc(rs.kc)},function(e){CBT.kcErr[h0.id]=pesan(e)}).then(function(){CBT.kcBusy[h0.id]=0;if(bsOn())render()});
  }
  return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Hasil</h2></div><div class="card center"><div class="bs-score mono">'+h0.score+'</div><p class="note">'+h0.benar+' benar dari '+h0.total+' soal</p></div><p class="muted center">Memuat pembahasan…</p>';
 };

 /* ---------- Aksi ---------- */
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
  var a=b.dataset.bs,r=BS.run;
  if(a==='daftar'&&r){CBT.nav=true;render();return}
  if(a==='daftartutup'){CBT.nav=false;render();return}
  if(a==='exgoto'&&r){CBT.nav=false;r.cur=+b.dataset.v;bsRunSave();render();window.scrollTo(0,0);return}
  if(a==='kekosong'&&r){var fi=-1;for(var qi=0;qi<r.ids.length;qi++){var qq=bsSoalById(r.ids[qi]);if(!qq||!bsAnswered(qq,r.ans[r.ids[qi]])){fi=qi;break}}CBT.nav=false;if(fi>-1)r.cur=fi;bsRunSave();render();window.scrollTo(0,0);return}
  if(a==='huruf'){CBT.fs=(CBT.fs+1)%3;try{localStorage.setItem('tbsm.cbt.fs',String(CBT.fs))}catch(e){}toast(CBT.fs===0?'Huruf normal':CBT.fs===1?'Huruf besar':'Huruf sangat besar');render();return}
  if(a==='selesai'){CBT.nav=false;var shx=document.getElementById('ex-sheet');if(shx)shx.remove();document.body.classList.remove('ex-lock')}
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
