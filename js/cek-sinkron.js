/* cek-sinkron.js: panel Cek sinkronisasi (Guru, Admin, dan Siswa).
   Menunjukkan data yang menunggu terkirim, galat sinkron terakhir, dan membandingkan data di perangkat dengan server Appwrite
   (observasi, hasil, lkpd, dan koleksi bank soal: hasil ujian soal, sesi ujian, bank soal) agar terlihat apakah data benar-benar sudah ada di server. Hanya membaca, tidak mengubah data server. */
var CK={busy:false,res:null,ok:0,err:'',errTs:0,obsErr:''};
ICO.sinkron='<path d="M20 11a8 8 0 0 0-14.4-4.2M4 13a8 8 0 0 0 14.4 4.2"/><path d="M5.6 3v4h4M18.4 21v-4h-4"/>';

/* ---- Rekam hasil sinkron tanpa mengubah perilaku ---- */
(function(){
 var t0=toast;
 toast=function(m){if(/^(Sinkronisasi gagal|Gagal menyimpan ke server)/.test(String(m))){CK.err=String(m);CK.errTs=Date.now()}return t0.apply(this,arguments)};
 if(Cloud.on){
  var f0=Cloud.flush;
  Cloud.flush=async function(){
   var r=await f0.apply(this,arguments);
   ckMarkOk();
   return r;
  };
  /* sama seperti aslinya, hanya mencatat galat baca koleksi observasi (aslinya hanya console.warn) */
  loadObsDocs=async function(cloud){
   try{var r=(await cloud.list('observasi')).map(fromDoc);CK.obsErr='';return r}
   catch(e){CK.obsErr=(e&&e.message)||String(e);console.warn('Koleksi observasi belum dapat dibaca:',e);return []}
  };
 }
 if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('kompetensi')<0)NAVTABS.push('kompetensi','sinkron');
})();

function ckStaff(){return !!S.user&&isStaff()}
function ckUser(){return !!S.user}
function ckWaktu(ts){return ts?new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'-'}
function ckNama(col,o){
 if(col==='observasi')return (o.guru||'?')+' · '+(o.tanggal||'')+(o.mapel?' · '+o.mapel:'');
 if(col==='hasil')return (o.siswa||'?')+' · '+(o.jobId||'')+' · '+tgl(o.ts);
 if(col==='lkpd')return (o.siswa||'?')+' · '+(o.moduleTitle||o.moduleId||'')+' · '+tgl(o.ts);
 if(col==='lkpd_bukti')return 'Foto bukti · '+(o.label||'')+' · '+tgl(o.ts);
 if(col==='lkpd_modules')return 'Modul · '+(o.title||o.id);
 if(col==='soal_hasil')return (o.siswa||'?')+' · '+(o.mode==='latihan'?'Latihan':(o.sesiJudul||'Ujian'))+' · '+tgl(o.ts)+' · nilai '+o.score;
 if(col==='soal_sesi')return 'Sesi · '+(o.judul||o.id);
 if(col==='banksoal')return 'Soal · '+(o.topik||o.mapel||o.id)+(o.q?' · '+String(o.q).slice(0,40):'');
 return o.nama||o.username||o.id;
}
var CK_NAMA={akun:'Akun',hasil:'Hasil nilai',lkpd:'LKPD',lkpd_modules:'Modul LKPD',lkpd_bukti:'Foto bukti',observasi:'Observasi',soal_hasil:'Hasil ujian dan latihan soal',soal_sesi:'Sesi ujian soal',banksoal:'Bank soal'};
function ckBsOn(){return typeof BS!=='undefined'&&typeof BSC!=='undefined'&&Cloud.on}
function ckBsMuat(){if(ckBsOn()&&!BS.loaded&&!BS.loading&&typeof bsLoadLocal==='function')bsLoadLocal()}
/* data bank soal yang belum terkirim ke server (bank soal memakai jalur sinkron sendiri) */
function ckBsUnsent(){
 var o={};if(!ckBsOn())return o;ckBsMuat();
 ['soal','sesi','hasil'].forEach(function(k){
  var a=(BS.D[k]||[]).filter(function(x){return (!x.r||x.d)&&(k!=='hasil'||isStaff()||x.sid===S.user.id)});
  if(a.length)o[BSC[k]]=a;
 });
 return o;
}
function ckBsTotal(){var u=ckBsUnsent(),n=0;Object.keys(u).forEach(function(k){n+=u[k].length});return n}
function ckTotal(){return (Cloud.on?pendingCount():0)+ckBsTotal()}
function ckMarkOk(){try{if(navigator.onLine!==false&&ckTotal()===0){CK.ok=Date.now();CK.err=''}}catch(e){}}
/* kirim ulang semua data bank soal yang belum terkirim, termasuk yang tidak masuk antrean karena galat server */
async function ckBsKirim(){
 if(!ckBsOn()||typeof bsRemote!=='function')return;
 ckBsMuat();
 try{await bsFlushQ()}catch(e){}
 var K={};Object.keys(BSC).forEach(function(k){K[BSC[k]]=k});
 var u=ckBsUnsent();
 for(var c in u){for(var i=0;i<u[c].length;i++){await bsRemote(K[c],u[c][i])}}
 ckMarkOk();
}

async function ckListIds(col,extra){
 var Q=Appwrite.Query,docs;extra=extra||[];
 try{docs=await Cloud.list(col,[Q.select(['$id','$permissions'])].concat(extra))}
 catch(e){docs=await Cloud.list(col,extra)}
 return docs;
}
async function ckPeriksa(){
 if(CK.busy)return;
 if(!Cloud.on){toast('Mode lokal: tidak ada server untuk dibandingkan');return}
 if(navigator.onLine===false){toast('Offline: tidak bisa memeriksa server');return}
 CK.busy=true;CK.res=null;render();
 var res={ts:Date.now(),kol:[]};
 try{
  if(pendingCount())await Cloud.flush();
  await ckBsKirim();
  var staff=ckStaff(),Qr=Appwrite.Query,cols=staff?[['observasi',S.observasi||[],[]],['hasil',S.results||[],[]],['lkpd',S.lkpd||[],[]]]:[];
  if(ckBsOn()){
   ckBsMuat();
   cols.push(['soal_hasil',(BS.D.hasil||[]).filter(function(x){return staff||x.sid===S.user.id}),staff?[]:[Qr.equal('sid',[S.user.id])]]);
   if(staff){cols.push(['soal_sesi',BS.D.sesi||[],[]]);cols.push(['banksoal',BS.D.soal||[],[]])}
  }
  for(var i=0;i<cols.length;i++){
   var col=cols[i][0],loc=cols[i][1],ex=cols[i][2],k={col:col,lokal:loc.length,server:0,tunggu:[],hilang:[],baru:0,izin:null,err:''};
   try{
    var docs=await ckListIds(col,ex),sv={};
    docs.forEach(function(d){sv[d.$id]=d});k.server=docs.length;
    loc.forEach(function(o){
     if(sv[o.id])return;
     if(!o.r||o.d)k.tunggu.push(ckNama(col,o));else k.hilang.push(ckNama(col,o));
    });
    var li={};loc.forEach(function(o){li[o.id]=1});
    k.baru=docs.filter(function(d){return !li[d.$id]}).length;
    if(col==='observasi'&&Cloud.authId){
     var mine=docs.filter(function(d){return li[d.$id]&&d.$permissions!==undefined&&(loc.filter(function(o){return o.id===d.$id})[0]||{}).pengamatId===S.user.id});
     if(mine.length){
      var bad=mine.filter(function(d){return !(d.$permissions||[]).some(function(p){return p.indexOf('user:'+Cloud.authId)>-1})});
      k.izin={cek:mine.length,tanpa:bad.length};
     }
    }
   }catch(e){k.err=(e&&e.message)||String(e)}
   res.kol.push(k);
  }
 }catch(e){res.fatal=(e&&e.message)||String(e)}
 CK.res=res;CK.busy=false;ckMarkOk();render();
}

function viewSinkron(){
 if(!ckUser())return '<div class="card"><p class="muted">Masuk dulu untuk membuka halaman ini.</p></div>';
 var staff=ckStaff(),on=navigator.onLine!==false,p=Cloud.on?pendingList():{},tot=ckTotal();
 if(!staff)p=Object.keys(p).reduce(function(m,c){m[c]=p[c].filter(function(o){return !o.sid||o.sid===S.user.id});return m},{});
 var bu=ckBsUnsent();Object.keys(bu).forEach(function(c){p[c]=bu[c]});
 var h='<h2>Cek sinkronisasi</h2>';
 if(!Cloud.on){
  return h+'<section class="card"><p><b>Mode lokal.</b> Data hanya tersimpan di peramban perangkat ini dan tidak dikirim ke server. Aktifkan Appwrite di <code>js/config.js</code> agar data bisa muncul di perangkat lain.</p></section>';
 }
 h+='<section class="card"><div class="kv" style="display:grid;gap:6px">'+
  '<div class="row sb"><span class="note">Jaringan</span><span class="pill '+(on?'ok':'bad')+'">'+(on?'Online':'Offline')+'</span></div>'+
  '<div class="row sb"><span class="note">Menunggu terkirim</span><span class="pill '+(tot?'warn':'ok')+'">'+tot+' data</span></div>'+
  '<div class="row sb"><span class="note">Terakhir semua tersinkron</span><b>'+ckWaktu(CK.ok)+'</b></div>'+
  (staff&&CK.obsErr?'<p class="note" style="color:var(--bad)">Koleksi observasi tidak bisa dibaca dari server: '+esc(CK.obsErr)+'. Periksa bahwa koleksi observasi sudah dibuat (jalankan setup Appwrite) dan akun Anda berlabel guru atau admin.</p>':'')+
  (CK.err?'<p class="note" style="color:var(--bad)">Galat terakhir ('+ckWaktu(CK.errTs)+'): '+esc(CK.err)+'</p>':'')+
  '</div></section>';
 var rows=Object.keys(p).filter(function(c){return p[c].length}).map(function(c){
  return '<div><b>'+esc(CK_NAMA[c]||c)+' · '+p[c].length+'</b><ul class="plain note">'+p[c].slice(0,5).map(function(o){return '<li>'+esc(ckNama(c,o))+'</li>'}).join('')+(p[c].length>5?'<li>dan '+(p[c].length-5)+' lainnya</li>':'')+'</ul></div>'}).join('');
 if(rows)h+='<section class="card"><h3>Belum terkirim ke server</h3>'+rows+'</section>';
 else if(!tot&&!CK.res)h+='<p class="note">Tidak ada data yang menunggu terkirim di perangkat ini.</p>';
 h+='<div class="row"><button type="button" class="btn" data-act="ck-flush"'+(CK.busy||!tot?' disabled':'')+'>Kirim sekarang</button><button type="button" class="btn primary grow" data-act="ck-run"'+(CK.busy?' disabled':'')+'>'+(CK.busy?'Memeriksa…':'Bandingkan dengan server')+'</button></div>';
 var r=CK.res;
 if(r){
  if(r.fatal)h+='<div class="card"><p class="note" style="color:var(--bad)">Pemeriksaan gagal: '+esc(r.fatal)+'</p></div>';
  r.kol.forEach(function(k){
   var ok=!k.err&&!k.tunggu.length&&!k.hilang.length;
   h+='<section class="card"><div class="row sb"><b>'+esc(CK_NAMA[k.col]||k.col)+'</b><span class="pill '+(k.err?'bad':ok?'ok':'warn')+'">'+(k.err?'Gagal dibaca':ok?'Sinkron':'Perlu dicek')+'</span></div>'+
   (k.err?'<p class="note">'+esc(k.err)+'</p>':'<p class="note">Di perangkat '+k.lokal+' · di server '+k.server+(k.baru?' · '+k.baru+' ada di server tapi belum dimuat di perangkat ini (tekan Segarkan data)':'')+'</p>')+
   (k.tunggu.length?'<p class="note"><b>Belum terkirim ('+k.tunggu.length+'):</b> '+k.tunggu.slice(0,5).map(esc).join('; ')+'</p>':'')+
   (k.hilang.length?'<p class="note" style="color:var(--bad)"><b>Sudah bertanda terkirim tetapi tidak terbaca dari server ('+k.hilang.length+'):</b> '+k.hilang.slice(0,5).map(esc).join('; ')+'. Kemungkinan dihapus dari perangkat lain, atau akun ini tidak punya izin baca dokumen itu.</p>':'')+
   (k.izin?(k.izin.tanpa?'<p class="note" style="color:var(--bad)">'+k.izin.tanpa+' dari '+k.izin.cek+' observasi milik Anda tidak punya izin baca pemilik di server, sehingga tidak akan tampil bagi akun guru di perangkat lain (hanya admin yang melihatnya).</p>':'<p class="note">Izin pemilik: lengkap ('+k.izin.cek+' observasi milik Anda).</p>'):'')+
   '</section>';
  });
  h+='<p class="note">Diperiksa '+ckWaktu(r.ts)+'.'+(staff?' Guru hanya melihat dokumen yang boleh dibacanya, jadi jumlah server untuk akun guru bisa lebih kecil daripada milik admin.':' Hanya data milik Anda yang dibandingkan.')+'</p>';
 }
 if(staff){
  var dv=CK.drv;
  h+='<section class="card"><div class="row sb"><b>Foto bukti (Google Drive)</b>'+(dv?'<span class="pill '+(dv.ok?'ok':'bad')+'">'+(dv.ok?'Siap':'Bermasalah')+'</span>':'')+'</div>'+
   '<p class="note">'+(dv?esc(dv.msg)+' ('+ckWaktu(dv.ts)+')':'Periksa bahwa fungsi foto-drive terpasang, token Google masih berlaku, dan folder Drive bisa dibuka.')+'</p>'+
   '<button type="button" class="btn" data-act="ck-drive"'+(CK.drvBusy?' disabled':'')+'>'+(CK.drvBusy?'Memeriksa…':'Tes foto Drive')+'</button></section>';
 }
 if(staff)h+='<p class="note">Cara memastikan data muncul di perangkat lain: masuk di perangkat kedua dengan akun yang sama (atau akun admin), tekan Segarkan data, lalu buka halaman ini dan cocokkan jumlah Observasi di server.</p>';
 return h;
}
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-act^="ck-"]');if(!b)return;var a=b.dataset.act;
 if(a==='ck-run')ckPeriksa();
 else if(a==='ck-drive'){
  if(CK.drvBusy)return;
  if(navigator.onLine===false){toast('Offline: tes Drive butuh internet');return}
  if(typeof ldCall!=='function'){toast('Modul foto belum siap');return}
  CK.drvBusy=true;render();
  try{
   var o=await ldCall({action:'ping'});
   CK.drv={ok:true,ts:Date.now(),msg:'Token Google valid dan folder Drive terbaca.'+(o.pakaiMB!=null?' Terpakai '+o.pakaiMB+' MB'+(o.batasMB?' dari '+o.batasMB+' MB':'')+'.':'')};
  }catch(er){
   var m=String((er&&er.message)||er);
   CK.drv={ok:false,ts:Date.now(),msg:/not found|could not be found|function_not_found|404/i.test(m)&&!/Drive|Google/i.test(m)?'Fungsi foto-drive belum dipasang di Appwrite. Foto masih disimpan di database.':m};
  }finally{CK.drvBusy=false;render()}
 }
 else if(a==='ck-flush'){
  if(!Cloud.on||CK.busy)return;
  if(navigator.onLine===false){toast('Offline: kirim otomatis saat online');return}
  CK.busy=true;render();
  try{await Cloud.flush();await ckBsKirim()}finally{CK.busy=false;render()}
  if(!ckTotal())toast('Semua data sudah terkirim');
 }
});

/* ---- Menu dan tab: tambahkan Rekap kompetensi dan Cek sinkronisasi ke drawer ---- */
var _viewKat=viewKatalog;
viewKatalog=function(){
 if(S.tab==='kompetensi'&&typeof viewKompetensi==='function'&&can('nilai'))return viewKompetensi();
 if(S.tab==='sinkron'&&ckUser())return viewSinkron();
 return _viewKat.apply(this,arguments);
};
var _renderCk=render;
render=function(){
 _renderCk.apply(this,arguments);
 try{
  if(!S.user)return;
  var sb=document.querySelector('.sbody');if(!sb)return;
  var cur=V.mode==='list'?S.tab:'';
  function row(v,t,sub,ic){return '<button type="button" class="srow" data-act="menu" data-v="'+v+'"'+(cur===v?' aria-current="page"':'')+'><span class="ico">'+svg(ICO[ic],22)+'</span><span class="st"><b>'+t+'</b><small>'+sub+'</small></span>'+svg(ICO.chev,18)+'</button>'}
  var html=(can('nilai')?row('kompetensi','Rekap kompetensi','Status Kompeten per siswa dan unit','kompetensi'):'')+row('sinkron','Cek sinkronisasi',isStaff()?'Pastikan data masuk ke server':'Pastikan hasil Anda sudah terkirim','sinkron');
  var chips=[].slice.call(sb.querySelectorAll('.chip')),sesi=chips.filter(function(c){return /Sesi/.test(c.textContent)})[0];
  if(sesi)sesi.insertAdjacentHTML('beforebegin',html);else sb.insertAdjacentHTML('beforeend',html);
 }catch(e){}
};

/* Tombol kembali HP (back.js): dari detail Rekap kompetensi kembali ke daftar, bukan langsung ke Beranda */
window.addEventListener('load',function(){
 if(typeof bkBack!=='function')return;
 var b0=bkBack;
 bkBack=function(){
  if(S.user&&S.tab==='kompetensi'&&typeof KP!=='undefined'&&KP.key&&!document.querySelector('.ui-ov')){KP.key=null;render();window.scrollTo(0,0);return}
  return b0.apply(this,arguments);
 };
});
