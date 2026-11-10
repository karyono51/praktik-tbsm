/* pwa.js: pendaftaran service worker, tombol pasang, banner offline, antrean sinkron Appwrite */
var QK='tbsm-queue',SK='tbsm-snap';
function pendingList(){
 var u=S.users.filter(function(o){return !o.r||o.d}),h=S.results.filter(function(o){return !o.r||o.d});
 return {akun:u,hasil:h}}
function pendingCount(){var p=pendingList();return p.akun.length+p.hasil.length}
function savePending(){
 try{var p=pendingList();if(p.akun.length||p.hasil.length)localStorage.setItem(QK,JSON.stringify(p));else localStorage.removeItem(QK)}catch(e){}}
function saveSnap(){
 try{if(Cloud.on&&S.user&&pendingCount()===0)localStorage.setItem(SK,JSON.stringify({user:S.user,users:S.users,results:S.results,ts:Date.now()}))}catch(e){}}
function restorePending(){
 try{var q=JSON.parse(localStorage.getItem(QK)||'null');if(!q)return;
  [[q.akun||[],S.users],[q.hasil||[],S.results]].forEach(function(pair){
   pair[0].forEach(function(o){var i=pair[1].findIndex(function(x){return x.id===o.id});
    if(i<0)pair[1].push(o);else if(o.d){pair[1][i]=o}})});
  syncRoster()}catch(e){}}
function loadSnap(){
 try{var s=JSON.parse(localStorage.getItem(SK)||'null');if(!s||!s.user)return false;
  S.users=s.users||[s.user];S.results=s.results||[];S.user=s.user;restorePending();
  var me=S.users.find(function(u){return u.id===s.user.id})||s.user;enter(me);return true}catch(e){return false}}
function dropSnap(){try{localStorage.removeItem(SK)}catch(e){}}

/* banner jaringan */
function netbar(){
 var el=document.getElementById('netbar');if(!el){el=document.createElement('div');el.id='netbar';el.setAttribute('role','status');document.body.appendChild(el)}
 var n=Cloud.on?pendingCount():0,off=navigator.onLine===false;
 if(!off&&!n){el.hidden=true;return}
 el.hidden=false;el.className=off?'off':'sync';
 el.textContent=(off?'Offline':'Online')+(n?' · '+n+' data menunggu sinkron':' · menampilkan data tersimpan');
}
(function(){
 if(Cloud.on){
  var e0=Cloud.enter;
  Cloud.enter=async function(me){await e0.call(this,me);restorePending();if(pendingCount())Cloud.flush();else saveSnap();netbar()};
  var f0=Cloud.flush;
  Cloud.flush=async function(){
   if(!S.user)return;
   savePending();
   if(navigator.onLine===false){netbar();toast('Offline: data disimpan di perangkat, disinkronkan saat online');return}
   await f0.call(this);savePending();saveSnap();netbar()};
 }
 window.addEventListener('online',function(){netbar();if(Cloud.on&&S.user&&pendingCount())Cloud.flush().then(function(){if(!pendingCount())toast('Data tersinkron ke Appwrite');if(typeof render==='function')render()})});
 window.addEventListener('offline',netbar);
 document.addEventListener('DOMContentLoaded',netbar);
 setInterval(netbar,4000);
})();

/* tombol pasang aplikasi */
var deferredInstall=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;
 var b=document.getElementById('pwabtn');if(!b){b=document.createElement('button');b.id='pwabtn';b.type='button';b.className='btn small primary';b.textContent='Pasang aplikasi';document.body.appendChild(b);
  b.addEventListener('click',function(){if(!deferredInstall)return;deferredInstall.prompt();deferredInstall.userChoice.then(function(){deferredInstall=null;b.remove()})})}});
window.addEventListener('appinstalled',function(){var b=document.getElementById('pwabtn');if(b)b.remove();toast('Aplikasi terpasang')});
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('service-worker.js').catch(function(){})});
