/* pwa.js: pendaftaran service worker, tombol pasang, status jaringan di header, antrean sinkron Appwrite */
var QK='tbsm-queue',SK='tbsm-snap';
function pendingList(){
 var P=function(o){return (!o.r||o.d)&&!o.bad},u=S.users.filter(P),h=S.results.filter(P),l=(S.lkpd||[]).filter(P),m=(S.lkpdModules||[]).filter(P),b=(S.lkpdBukti||[]).filter(P),ob=(S.observasi||[]).filter(P);
 return {akun:u,hasil:h,lkpd:l,lkpd_modules:m,lkpd_bukti:b,observasi:ob}}
/* modul LKPD hanya bisa dikirim akun berlabel lkpdeditor (guru/admin): antrean modul sisa sesi guru tidak dihitung dan tidak dikirim saat siswa login di perangkat yang sama, tetapi tetap disimpan sampai guru/admin masuk */
function pendingCount(){var p=pendingList();return p.akun.length+p.hasil.length+p.lkpd.length+(isStaff()?(p.lkpd_modules||[]).length:0)+(p.lkpd_bukti||[]).length+(p.observasi||[]).length}
function savePending(){
 try{var p=pendingList();if(p.akun.length||p.hasil.length||p.lkpd.length||(p.lkpd_modules||[]).length||(p.lkpd_bukti||[]).length||(p.observasi||[]).length)localStorage.setItem(QK,JSON.stringify(p));else localStorage.removeItem(QK)}catch(e){if(!window._qw||Date.now()-window._qw>60000){window._qw=Date.now();try{toast('Penyimpanan perangkat penuh: data yang belum terkirim bisa hilang bila halaman ditutup. Sambungkan internet lalu tekan Kirim sekarang, atau kosongkan ruang perangkat.')}catch(e2){}}}}
/* Pencegahan data ganda: dua catatan belum terkirim dengan isi pengenal yang sama (mis. tombol simpan ditekan dua kali) dijadikan satu. ID harus sah di Appwrite; ID tidak sah ditandai bad agar tidak dicoba tanpa akhir. */
var ID_SAH=/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/;
function bersihkanAntrean(){
 var n={dup:0,bad:0},kunci={hasil:function(o){return o.ts?['h',o.sid,o.jobId,o.ts,o.siswa,o.score,o.tipe].join('|'):null},lkpd:function(o){return o.ts?['l',o.sid,o.moduleId,o.ts,o.score].join('|'):null}};
 [[S.results,'hasil'],[S.lkpd||[],'lkpd'],[S.observasi||[],'observasi'],[S.users,'akun'],[S.lkpdBukti||[],'lkpd_bukti']].forEach(function(pr){
  var arr=pr[0],kf=kunci[pr[1]],lihat={};
  for(var i=0;i<arr.length;i++){var o=arr[i];
   if(!o.r&&!o.bad&&!ID_SAH.test(String(o.id||''))){o.bad=1;n.bad++;continue}
   if(!kf)continue;var k=kf(o);if(!k)continue;
   if(lihat[k]!==undefined&&!o.r&&!o.d){arr.splice(i,1);i--;n.dup++}else if(lihat[k]===undefined)lihat[k]=i}
 });
 Cloud.dupN=(Cloud.dupN||0)+n.dup;Cloud.badN=(Cloud.badN||0)+n.bad;return n}
function saveSnap(){
 try{if(Cloud.on&&S.user&&pendingCount()===0)localStorage.setItem(SK,JSON.stringify({user:S.user,users:S.users,results:S.results,lkpd:S.lkpd||[],lkpdModules:S.lkpdModules||[],observasi:S.observasi||[],ts:Date.now()}))}catch(e){}}
function restorePending(){
 try{var q=JSON.parse(localStorage.getItem(QK)||'null');if(!q)return;
  [[q.akun||[],S.users],[q.hasil||[],S.results],[q.lkpd||[],S.lkpd||(S.lkpd=[])],[q.lkpd_modules||[],S.lkpdModules||(S.lkpdModules=[])],[q.lkpd_bukti||[],S.lkpdBukti||(S.lkpdBukti=[])],[q.observasi||[],S.observasi||(S.observasi=[])]].forEach(function(pair){
   pair[0].forEach(function(o){var i=pair[1].findIndex(function(x){return x.id===o.id});
    if(i<0)pair[1].push(o);else if(o.d){pair[1][i]=o}})});
  syncRoster()}catch(e){}}
function loadSnap(){
 try{var s=JSON.parse(localStorage.getItem(SK)||'null');if(!s||!s.user)return false;
  S.users=s.users||[s.user];S.results=s.results||[];S.lkpd=s.lkpd||[];S.lkpdModules=s.lkpdModules||[];S.observasi=s.observasi||[];S.user=s.user;restorePending();
  var me=S.users.find(function(u){return u.id===s.user.id})||s.user;enter(me);return true}catch(e){return false}}
function dropSnap(){try{localStorage.removeItem(SK)}catch(e){}}

/* Izin per dokumen: LKPD dan foto bukti milik siswa dapat dibaca pemiliknya. Guru/admin membaca lewat izin koleksi (label). */
function ownerPerms(col,o){
 var own=col==='observasi'?o.pengamatId:o.sid;
 if((col!=='lkpd'&&col!=='lkpd_bukti'&&col!=='observasi')||!S.user||own!==S.user.id)return null;
 var id=Cloud.authId;
 if(!id){try{var j=JSON.parse(localStorage.getItem('tbsm-auth')||'null');if(j&&j.sid===S.user.id)id=j.auth}catch(e){}}
 return id?(col==='observasi'?[Appwrite.Permission.read(Appwrite.Role.user(id)),Appwrite.Permission.update(Appwrite.Role.user(id)),Appwrite.Permission.delete(Appwrite.Role.user(id))]:[Appwrite.Permission.read(Appwrite.Role.user(id))]):null}
async function createOwned(db,col,o,F){
 var pm=ownerPerms(col,o);
 if(pm){try{return await db.createDocument(CFG.DB,col,o.id,pick(o,F),pm)}catch(e){if(e&&e.code===409)throw e}}
 return db.createDocument(CFG.DB,col,o.id,pick(o,F))}

/* status jaringan dan tombol pasang: tampil di header, di bawah judul (elemen #netslot dibuat oleh render) */
var deferredInstall=null;
function netbar(){
 var el=document.getElementById('netslot');if(!el)return;
 var n=Cloud.on?pendingCount():0,off=navigator.onLine===false,h='';
 if(off||n)h+='<i class="ns '+(off?'off':'sync')+'">'+(off?'Offline':'Online')+(n?' · '+n+' menunggu sinkron':' · data tersimpan')+'</i>';
 if(deferredInstall)h+='<button type="button" class="btn small primary" data-act="pwainstall">Pasang aplikasi</button>';
 if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}
 el.hidden=!h;
}
(function(){
 if(Cloud.on){
  var e0=Cloud.enter;
  Cloud.enter=async function(me){await e0.call(this,me);if(S.user&&roleList(S.user).some(function(r){return r!=='siswa'&&r!=='proktor'}))S.observasi=await loadObsDocs(this);restorePending();if(pendingCount())Cloud.flush();else saveSnap();netbar()};
  /* Sinkron per item: kegagalan satu item tidak menghentikan yang lain. Item yang sudah ada di server (ID sama) diperbarui, bukan membuat error berulang. */
  Cloud.flush=async function(){
   if(!this.on||!S.user||this.busy)return;
   bersihkanAntrean();savePending();
   if(navigator.onLine===false){netbar();toast('Offline: data disimpan di perangkat, disinkronkan saat online');return}
   this.busy=true;var fails=[];
   try{
    /* Urutan prioritas: hasil nilai, LKPD, observasi, akun, foto bukti (paling berat). Dikirim 4 item sekaligus. */
    var todo=[],self=this,idx=0;
    [[S.results,'hasil',FH],[S.lkpd||[],'lkpd',FL],[S.observasi||[],'observasi',FO],[S.users,'akun',FA],[S.lkpdBukti||[],'lkpd_bukti',FB]].forEach(function(jb){jb[0].forEach(function(o){if(!(o.r&&!o.d)&&!o.bad)todo.push([o,jb[1],jb[2]])})});
    var worker=async function(){
     while(idx<todo.length){var t=todo[idx++],o=t[0],col=t[1],F=t[2],wasNew=!o.r;
      try{
       /* d dinolkan sebelum kirim: bila item diubah lagi saat kirim berjalan, d kembali 1 dan terkirim pada putaran berikutnya */
       o.d=0;
       if(wasNew){
        if(col==='akun'&&!o.email)o.email=(o.username||o.id)+'@tanpa-email.local';
        try{await createOwned(self.db,col,o,F)}
        catch(e1){if(e1&&(e1.code===409||/already exists|unique/i.test(e1.message||''))){await self.db.updateDocument(CFG.DB,col,o.id,pick(o,F))}else throw e1}
        o.r=1}
       else{await self.db.updateDocument(CFG.DB,col,o.id,pick(o,F))}
      }catch(e2){o.d=1;fails.push(col+': '+((e2&&e2.message)||e2))}}
    };
    await Promise.all([worker(),worker(),worker(),worker()]);
    for(var j=0;isStaff()&&j<(S.lkpdModules||[]).length;j++){var m=S.lkpdModules[j];if(m.r&&!m.d)continue;try{if(typeof lkgUploadModul==='function'&&typeof lkgBelumTerunggah==='function'&&lkgBelumTerunggah(m)){try{if(await lkgUploadModul(m)){try{localStorage.setItem('tbsm-lkpd-modules',JSON.stringify(S.lkpdModules))}catch(ex0){}}}catch(ge){throw new Error('Gambar soal: '+((ge&&ge.message)||ge))}}var data={moduleId:m.id,title:m.title,kelas:m.kelas,fase:m.fase,duration:Math.min(600,Math.max(1,Math.round(Number(m.duration))||1)),status:m.status||'draft',active:m.active!==false,payload:JSON.stringify((function(x){var y=Object.assign({},x);delete y.r;delete y.d;delete y.payload;return y})(m)),updatedAt:m.updatedAt||Date.now(),updatedBy:m.updatedBy||S.user.username||S.user.id};var perms=[Appwrite.Permission.read(Appwrite.Role.label('lkpdeditor')),Appwrite.Permission.update(Appwrite.Role.label('lkpdeditor')),Appwrite.Permission.delete(Appwrite.Role.label('lkpdeditor'))];if((data.status==='published'&&data.active)||(typeof lkBuiltin==='function'&&lkBuiltin(m.id))||(m.jenis==='ukk'&&typeof ukkIsBase==='function'&&ukkIsBase(m.id)))perms.push(Appwrite.Permission.read(Appwrite.Role.users()));if(!m.r){try{await this.db.createDocument(CFG.DB,'lkpd_modules',m.id,data,perms)}catch(ex){if(ex&&ex.code===409)await this.db.updateDocument(CFG.DB,'lkpd_modules',m.id,data,perms);else throw ex}}else{try{await this.db.updateDocument(CFG.DB,'lkpd_modules',m.id,data,perms)}catch(ex2){if(ex2&&(ex2.code===404||ex2.type==='document_not_found'))await this.db.createDocument(CFG.DB,'lkpd_modules',m.id,data,perms);else throw ex2}}m.r=1;m.d=0}catch(me){fails.push('lkpd_modules: '+((me&&me.message)||me))}}
   }catch(e){fails.push(String((e&&e.message)||e))}
   this.busy=false;savePending();saveSnap();netbar();
   if(fails.length){var f0=/Attribute "peran"/.test(fails[0])?'kolom peran di Appwrite masih 16 karakter, terlalu pendek untuk gabungan peran akun ini. Jalankan node tools/perbesar-peran.mjs (lihat docs-PERAN-GANDA.md) atau kurangi peran akun.':fails[0];if(window.CK){CK.err='Sinkronisasi gagal ('+fails.length+'): '+f0;CK.errTs=Date.now()}if(!(Cloud.retrying&&Cloud.failN>1))toast('Sinkronisasi gagal ('+fails.length+'): '+f0)}
  };
 }
 window.addEventListener('online',function(){netbar();if(Cloud.on&&S.user&&pendingCount())Cloud.flush().then(function(){netbar();if(!pendingCount())toast('Data tersinkron ke Appwrite')})});
 window.addEventListener('offline',netbar);
 setInterval(netbar,4000);
})();
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;netbar()});
window.addEventListener('appinstalled',function(){deferredInstall=null;netbar();toast('Aplikasi terpasang')});
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="pwainstall"]');if(!b||!deferredInstall)return;
 deferredInstall.prompt();deferredInstall.userChoice.then(function(){deferredInstall=null;netbar()})});
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('service-worker.js',{updateViaCache:'none'}).catch(function(){})});
