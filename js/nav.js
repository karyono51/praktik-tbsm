/* nav.js: posisi halaman bertahan saat reload, tombol segarkan data, dan pembaruan aplikasi (cache) */
var NAV={restore:false,busy:false,hadCtl:false,updated:false};
var NAVK='tbsm-nav',NAVTTL=24*3600*1000;
var NAVTABS=['beranda','katalog','rekap','akun','acuan','lkpd','observasi','observasi-siswa'];

/* ---- Simpan dan pulihkan posisi halaman ---- */
function navSave(){
 if(!S.user||V.mode!=='list')return;
 try{localStorage.setItem(NAVK,JSON.stringify({u:S.user.id,t:Date.now(),tab:S.tab,kelas:S.kelas,lm:LK.module,lt:LK.tab,lo:!!LK.open,kf:LK.kf||''}))}catch(e){}
}
function navApply(u){
 var j;try{j=JSON.parse(localStorage.getItem(NAVK)||'null')}catch(e){j=null}
 if(!j||j.u!==u.id||Date.now()-j.t>NAVTTL)return;
 if(NAVTABS.indexOf(j.tab)<0||(j.tab==='akun'&&!can('akun'))||((j.tab==='observasi'||j.tab==='observasi-siswa')&&!can('observasi')))return;
 if(kelasBoleh().indexOf(j.kelas)>-1)S.kelas=j.kelas;
 S.tab=j.tab;
 if(j.tab==='lkpd'){
  if(j.lm)LK.module=j.lm;LK.kf=j.kf||'';LK.open=!!j.lo;
  if(['materi','kerja','evaluasi','riwayat'].indexOf(j.lt)>-1)LK.tab=j.lt;
 }
}
(function(){
 var render0=render;render=function(){render0();navSave();navFillVer()};
 var enter0=enter;enter=function(u){enter0(u);if(NAV.restore)navApply(u)};
 var boot0=boot;boot=async function(){NAV.restore=true;try{await boot0()}finally{NAV.restore=false}};
 window.addEventListener('pagehide',navSave);
})();

/* ---- Segarkan data dari Appwrite tanpa pindah halaman ---- */
if(Cloud.on){
 Cloud.refresh=async function(){
  var p=S.user,Q=Appwrite.Query,staff=roleList(p).some(function(r){return r!=='siswa'});
  var res,lk,us=null;
  if(staff){us=(await this.list('akun')).map(fromDoc);res=(await this.list('hasil')).map(fromDoc);lk=(await this.list('lkpd')).map(fromDoc)}
  else{res=(await this.list('hasil',[Q.equal('sid',[p.id])])).map(fromDoc);lk=(await this.list('lkpd',[Q.equal('sid',[p.id])])).map(fromDoc)}
  var mods=await loadLKPDModuleDocs(this);
  if(staff)S.observasi=await loadObsDocs(this);
  if(us){S.users=us;S.user=us.find(function(u){return u.id===p.id})||p}
  S.results=res;S.lkpd=lk;S.lkpdModules=mods;
  LK.remote={};
  syncRoster();saveSnap();
 };
}
async function refreshData(){
 if(!S.user||NAV.busy)return;
 if(navigator.onLine===false){toast('Offline: data tidak dapat disegarkan');return}
 NAV.busy=true;document.body.classList.add('refreshing');
 try{
  if(Cloud.on){
   if(pendingCount()){await Cloud.flush();if(pendingCount()){toast('Masih ada data menunggu sinkron. Coba lagi sebentar lagi.');return}}
   await Cloud.refresh();toast('Data diperbarui');
  }else toast('Mode lokal: data tersimpan di perangkat ini');
  navCheckUpdate();
 }catch(e){toast('Gagal menyegarkan: '+((e&&e.message)||e))}
 finally{NAV.busy=false;document.body.classList.remove('refreshing');render()}
}

/* ---- Pembaruan aplikasi (service worker dan cache) ---- */
function navVersion(){
 if(!window.caches)return Promise.resolve('');
 return caches.keys().then(function(ks){var v=ks.filter(function(k){return /^tbsm-v\d+/.test(k)}).sort(function(a,b){return parseInt(a.slice(6))-parseInt(b.slice(6))});return v.length?v[v.length-1]:''}).catch(function(){return ''});
}
function navFillVer(){var el=document.getElementById('appver');if(!el)return;navVersion().then(function(v){var e2=document.getElementById('appver');if(e2)e2.textContent=v?('Versi '+v+' · ketuk untuk cek pembaruan'):'Cek pembaruan aplikasi'})}
function navShowUpdate(){
 if(document.getElementById('updbar'))return;
 var d=document.createElement('div');d.id='updbar';d.className='updbar';d.setAttribute('role','status');
 d.innerHTML='<span>Versi baru aplikasi sudah siap.</span><button type="button" class="btn small primary" data-act="applyupdate">Muat ulang</button><button type="button" class="btn small" data-act="dismissupdate">Nanti</button>';
 document.body.appendChild(d);
}
function navCheckUpdate(){
 if(!('serviceWorker' in navigator)||navigator.onLine===false)return Promise.resolve();
 return navigator.serviceWorker.getRegistration().then(function(reg){return reg?reg.update():null}).catch(function(){});
}
function navForce(){
 if(navigator.onLine===false){toast('Perlu koneksi internet untuk memperbarui aplikasi');return}
 navSave();
 var t=[];
 if(window.caches)t.push(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}));
 if('serviceWorker' in navigator)t.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))}));
 Promise.all(t).catch(function(){}).then(function(){location.reload()});
}
function navManualUpdate(){
 if(!('serviceWorker' in navigator)){navForce();return}
 if(navigator.onLine===false){toast('Offline: tidak dapat memeriksa pembaruan');return}
 toast('Memeriksa pembaruan…');
 navCheckUpdate().then(function(){return new Promise(function(r){setTimeout(r,2500)})}).then(function(){
  if(NAV.updated){navShowUpdate();return}
  return navVersion().then(function(v){return uiConfirm('Aplikasi sudah versi terbaru'+(v?' ('+v+')':'')+'.\nJika tampilan masih lama, bersihkan cache dan muat ulang paksa?',{ok:'Muat ulang paksa'}).then(function(ok){if(ok)navForce()})});
 });
}
if('serviceWorker' in navigator){
 NAV.hadCtl=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(!NAV.hadCtl){NAV.hadCtl=true;return}NAV.updated=true;navShowUpdate()});
 document.addEventListener('visibilitychange',function(){if(!document.hidden)navCheckUpdate()});
 window.addEventListener('online',navCheckUpdate);
 setInterval(navCheckUpdate,30*60*1000);
}

document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
 if(a==='refresh'){if(typeof drOpen==='function')drOpen(false);refreshData()}
 else if(a==='updateapp'){if(typeof drOpen==='function')drOpen(false);navManualUpdate()}
 else if(a==='applyupdate'){navSave();location.reload()}
 else if(a==='dismissupdate'){var u=document.getElementById('updbar');if(u)u.remove()}
});
