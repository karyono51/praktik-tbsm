/* pwa.js: pendaftaran service worker, tombol pasang, status jaringan di header, antrean sinkron Appwrite */
var QK='tbsm-queue',SK='tbsm-snap';
function pendingList(){
 var u=S.users.filter(function(o){return !o.r||o.d}),h=S.results.filter(function(o){return !o.r||o.d}),l=(S.lkpd||[]).filter(function(o){return !o.r||o.d});
 return {akun:u,hasil:h,lkpd:l}}
function pendingCount(){var p=pendingList();return p.akun.length+p.hasil.length+p.lkpd.length}
function savePending(){
 try{var p=pendingList();if(p.akun.length||p.hasil.length)localStorage.setItem(QK,JSON.stringify(p));else localStorage.removeItem(QK)}catch(e){}}
function saveSnap(){
 try{if(Cloud.on&&S.user&&pendingCount()===0)localStorage.setItem(SK,JSON.stringify({user:S.user,users:S.users,results:S.results,lkpd:S.lkpd||[],ts:Date.now()}))}catch(e){}}
function restorePending(){
 try{var q=JSON.parse(localStorage.getItem(QK)||'null');if(!q)return;
  [[q.akun||[],S.users],[q.hasil||[],S.results],[q.lkpd||[],S.lkpd||(S.lkpd=[])]].forEach(function(pair){
   pair[0].forEach(function(o){var i=pair[1].findIndex(function(x){return x.id===o.id});
    if(i<0)pair[1].push(o);else if(o.d){pair[1][i]=o}})});
  syncRoster()}catch(e){}}
function loadSnap(){
 try{var s=JSON.parse(localStorage.getItem(SK)||'null');if(!s||!s.user)return false;
  S.users=s.users||[s.user];S.results=s.results||[];S.lkpd=s.lkpd||[];S.user=s.user;restorePending();
  var me=S.users.find(function(u){return u.id===s.user.id})||s.user;enter(me);return true}catch(e){return false}}
function dropSnap(){try{localStorage.removeItem(SK)}catch(e){}}

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
  Cloud.enter=async function(me){await e0.call(this,me);restorePending();if(pendingCount())Cloud.flush();else saveSnap();netbar()};
  /* Sinkron per item: kegagalan satu item tidak menghentikan yang lain. Item yang sudah ada di server (ID sama) diperbarui, bukan membuat error berulang. */
  Cloud.flush=async function(){
   if(!this.on||!S.user||this.busy)return;
   savePending();
   if(navigator.onLine===false){netbar();toast('Offline: data disimpan di perangkat, disinkronkan saat online');return}
   this.busy=true;var fails=[];
   try{
    var jobs=[[S.users,'akun',FA],[S.results,'hasil',FH],[S.lkpd||[],'lkpd',FL]];
    for(var i=0;i<jobs.length;i++){var arr=jobs[i][0],col=jobs[i][1],F=jobs[i][2];
     for(var k=0;k<arr.length;k++){var o=arr[k];if(o.r&&!o.d)continue;
      try{
       if(!o.r){
        if(col==='akun'&&!o.email)o.email=(o.username||o.id)+'@tanpa-email.local';
        try{await this.db.createDocument(CFG.DB,col,o.id,pick(o,F))}
        catch(e1){if(e1&&(e1.code===409||/already exists|unique/i.test(e1.message||''))){await this.db.updateDocument(CFG.DB,col,o.id,pick(o,F))}else throw e1}
        o.r=1;o.d=0}
       else{await this.db.updateDocument(CFG.DB,col,o.id,pick(o,F));o.d=0}
      }catch(e2){fails.push(col+': '+((e2&&e2.message)||e2))}}}
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
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('service-worker.js').catch(function(){})});
