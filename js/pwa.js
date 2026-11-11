/* pwa.js: pendaftaran service worker, tombol pasang, status jaringan di header, antrean sinkron Appwrite */
var QK='tbsm-queue',SK='tbsm-snap';
function pendingList(){
 var u=S.users.filter(function(o){return !o.r||o.d}),h=S.results.filter(function(o){return !o.r||o.d}),l=(S.lkpd||[]).filter(function(o){return !o.r||o.d}),m=(S.lkpdModules||[]).filter(function(o){return !o.r||o.d}),b=(S.lkpdBukti||[]).filter(function(o){return !o.r||o.d}),ob=(S.observasi||[]).filter(function(o){return !o.r||o.d});
 return {akun:u,hasil:h,lkpd:l,lkpd_modules:m,lkpd_bukti:b,observasi:ob}}
function pendingCount(){var p=pendingList();return p.akun.length+p.hasil.length+p.lkpd.length+(p.lkpd_modules||[]).length+(p.lkpd_bukti||[]).length+(p.observasi||[]).length}
function savePending(){
 try{var p=pendingList();if(p.akun.length||p.hasil.length||p.lkpd.length||(p.lkpd_modules||[]).length||(p.lkpd_bukti||[]).length||(p.observasi||[]).length)localStorage.setItem(QK,JSON.stringify(p));else localStorage.removeItem(QK)}catch(e){}}
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
  Cloud.enter=async function(me){await e0.call(this,me);if(S.user&&roleList(S.user).some(function(r){return r!=='siswa'}))S.observasi=await loadObsDocs(this);restorePending();if(pendingCount())Cloud.flush();else saveSnap();netbar()};
  /* Sinkron per item: kegagalan satu item tidak menghentikan yang lain. Item yang sudah ada di server (ID sama) diperbarui, bukan membuat error berulang. */
  Cloud.flush=async function(){
   if(!this.on||!S.user||this.busy)return;
   savePending();
   if(navigator.onLine===false){netbar();toast('Offline: data disimpan di perangkat, disinkronkan saat online');return}
   this.busy=true;var fails=[];
   try{
    var jobs=[[S.users,'akun',FA],[S.results,'hasil',FH],[S.lkpd||[],'lkpd',FL],[S.lkpdBukti||[],'lkpd_bukti',FB],[S.observasi||[],'observasi',FO]];
    for(var i=0;i<jobs.length;i++){var arr=jobs[i][0],col=jobs[i][1],F=jobs[i][2];
     for(var k=0;k<arr.length;k++){var o=arr[k];if(o.r&&!o.d)continue;
      try{
       if(!o.r){
        if(col==='akun'&&!o.email)o.email=(o.username||o.id)+'@tanpa-email.local';
        try{await createOwned(this.db,col,o,F)}
        catch(e1){if(e1&&(e1.code===409||/already exists|unique/i.test(e1.message||''))){await this.db.updateDocument(CFG.DB,col,o.id,pick(o,F))}else throw e1}
        o.r=1;o.d=0}
       else{await this.db.updateDocument(CFG.DB,col,o.id,pick(o,F));o.d=0}
      }catch(e2){fails.push(col+': '+((e2&&e2.message)||e2))}}}
    for(var j=0;j<(S.lkpdModules||[]).length;j++){var m=S.lkpdModules[j];if(m.r&&!m.d)continue;try{var data={moduleId:m.id,title:m.title,kelas:m.kelas,fase:m.fase,duration:m.duration,status:m.status||'draft',active:m.active!==false,payload:JSON.stringify((function(x){var y=Object.assign({},x);delete y.r;delete y.d;return y})(m)),updatedAt:m.updatedAt||Date.now(),updatedBy:m.updatedBy||S.user.username||S.user.id};var perms=[Appwrite.Permission.read(Appwrite.Role.label('lkpd-editor')),Appwrite.Permission.update(Appwrite.Role.label('lkpd-editor')),Appwrite.Permission.delete(Appwrite.Role.label('lkpd-editor'))];if(data.status==='published'&&data.active)perms.push(Appwrite.Permission.read(Appwrite.Role.users()));if(!m.r){try{await this.db.createDocument(CFG.DB,'lkpd_modules',m.id,data,perms)}catch(ex){if(ex&&ex.code===409)await this.db.updateDocument(CFG.DB,'lkpd_modules',m.id,data,perms);else throw ex}}else await this.db.updateDocument(CFG.DB,'lkpd_modules',m.id,data,perms);m.r=1;m.d=0}catch(me){fails.push('lkpd_modules: '+((me&&me.message)||me))}}
   }catch(e){fails.push(String((e&&e.message)||e))}
   this.busy=false;savePending();saveSnap();netbar();
   if(fails.length)toast('Sinkronisasi gagal ('+fails.length+'): '+fails[0]);
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
