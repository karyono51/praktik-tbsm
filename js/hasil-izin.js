/* Izin per dokumen koleksi hasil.
   Siswa mencatat ID login Appwrite-nya di koleksi uid_map (id dokumen = ID login, sid = ID akun aplikasi).
   Guru/admin memakai pemetaan itu agar nilai Penilaian dibaca siswa pemiliknya saja. */
(function(){
 function myAuth(){
  var id=Cloud.authId;
  if(!id){try{var j=JSON.parse(localStorage.getItem('tbsm-auth')||'null');if(j&&S.user&&j.sid===S.user.id)id=j.auth}catch(e){}}
  return id||null}
 function emailOf(u){return String((u&&u.email)||'').toLowerCase()}
 function readUser(id){return Appwrite.Permission.read(Appwrite.Role.user(id))}

 /* siswa: catat ID login sekali per sesi lewat fungsi server akun-admin (aksi claim; email diambil server dari akun Auth).
    Fungsi belum diperbarui (galat 403/400/404): cadangan lama menulis langsung ke koleksi, yang berhenti bekerja setelah izin create dicabut. */
 var claimed=false,tanpaFn=false;
 async function claim(){
  if(claimed||!Cloud.on||!S.user||!Cloud.db)return;
  var id=myAuth();if(!id)return;
  if(!tanpaFn){
   try{
    var cl=(Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
    var ex=await new Appwrite.Functions(cl).createExecution(CFG.FN_AKUN||'akun-admin',JSON.stringify({action:'claim'}),false,'/','POST',{'content-type':'application/json'});
    var j={};try{j=JSON.parse(ex.responseBody||'{}')}catch(e){}
    if(j.ok){claimed=true;return}
    var st=ex.responseStatusCode||0;
    if(st===404&&/belum terdaftar/i.test(j.error||''))return;   /* akun memang belum ada: jangan dicadangkan */
    if(st>=500)return;                                          /* galat sementara: coba lagi nanti */
    tanpaFn=true;                                               /* fungsi versi lama (403/400): pakai cadangan */
   }catch(e){if(e&&(e.code===404||/not found/i.test(e.message||'')))tanpaFn=true;else return}
  }
  try{await Cloud.db.createDocument(CFG.DB,'uid_map',id,{sid:S.user.id,email:emailOf(S.user)});claimed=true}
  catch(e){if(e&&e.code===409)claimed=true}}

 /* staf: pemetaan sid -> daftar ID login, hanya yang emailnya cocok dengan akun */
 var map=null,mapTs=0;
 async function loadMap(force){
  if(map&&!force&&Date.now()-mapTs<60000)return map;
  var docs=await Cloud.list('uid_map'),em={};
  (S.users||[]).forEach(function(u){em[u.id]=emailOf(u)});
  var m={};
  docs.forEach(function(d){if(em[d.sid]&&em[d.sid]===String(d.email||'').toLowerCase())(m[d.sid]=m[d.sid]||[]).push(d.$id)});
  map=m;mapTs=Date.now();return m}

 async function izinHasil(o){
  if(!S.user)return null;
  if(o.sid===S.user.id){var a=myAuth();return a?[readUser(a)]:null}
  if(!isStaff())return null;
  try{var ids=(await loadMap())[o.sid];return ids&&ids.length?ids.map(readUser):null}catch(e){return null}}

 var prevCreate=createOwned;
 createOwned=async function(db,col,o,F){
  if(col!=='hasil'||!o.sid)return prevCreate.apply(this,arguments);
  var pm=await izinHasil(o);
  if(pm){try{return await db.createDocument(CFG.DB,col,o.id,pick(o,F),pm)}catch(e){if(e&&e.code===409)throw e}}
  return db.createDocument(CFG.DB,col,o.id,pick(o,F))};

 /* staf: beri izin baca pemilik pada hasil yang belum punya (data lama atau siswa baru login) */
 var granting=false,lastGrant=0;
 async function beriIzin(force){
  if(granting||!Cloud.on||!S.user||!isStaff())return 0;
  if(!force&&Date.now()-lastGrant<120000)return 0;
  granting=true;var n=0;
  try{
   var m=await loadMap(true),docs=await Cloud.list('hasil');
   for(var i=0;i<docs.length;i++){
    var d=docs[i],ids=m[d.sid];if(!ids||!ids.length)continue;
    var cur=d.$permissions||[],add=ids.filter(function(u){return !cur.some(function(p){return p.indexOf('user:'+u)>-1})});
    if(!add.length)continue;
    try{await Cloud.db.updateDocument(CFG.DB,'hasil',d.$id,{},cur.concat(add.map(readUser)));n++}catch(e){}}
   lastGrant=Date.now();
  }catch(e){}
  granting=false;return n}
 window.hasilBeriIzin=beriIzin;

 var prevFlush=Cloud.flush;
 Cloud.flush=async function(){
  var r=await prevFlush.apply(this,arguments);
  try{await claim();beriIzin(false)}catch(e){}
  return r};
 var prevEnter=Cloud.enter;
 Cloud.enter=async function(){
  var r=await prevEnter.apply(this,arguments);
  try{claim();beriIzin(true)}catch(e){}
  return r};
})();
