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
  /* hemat baca: pemetaan cukup dicatat sekali per akun per perangkat, diulang tiap 7 hari */
  var ck='tbsm-claim-'+id;
  try{var ts=+localStorage.getItem(ck)||0;if(ts&&Date.now()-ts<7*86400000){claimed=true;return}}catch(e){}
  if(!tanpaFn){
   try{
    var cl=(Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
    var ex=await new Appwrite.Functions(cl).createExecution(CFG.FN_AKUN||'akun-admin',JSON.stringify({action:'claim'}),false,'/','POST',{'content-type':'application/json'});
    var j={};try{j=JSON.parse(ex.responseBody||'{}')}catch(e){}
    if(j.ok){claimed=true;try{localStorage.setItem(ck,String(Date.now()))}catch(e){}return}
    var st=ex.responseStatusCode||0;
    if(st===404&&/belum terdaftar/i.test(j.error||''))return;   /* akun memang belum ada: jangan dicadangkan */
    if(st>=500)return;                                          /* galat sementara: coba lagi nanti */
    tanpaFn=true;                                               /* fungsi versi lama (403/400): pakai cadangan */
   }catch(e){if(e&&(e.code===404||/not found/i.test(e.message||'')))tanpaFn=true;else return}
  }
  try{await Cloud.db.createDocument(CFG.DB,'uid_map',id,{sid:S.user.id,email:emailOf(S.user)});claimed=true}
  catch(e){if(e&&e.code===409)claimed=true}
  if(claimed){try{localStorage.setItem(ck,String(Date.now()))}catch(e){}}}

 /* staf: pemetaan sid -> daftar ID login, hanya yang emailnya cocok dengan akun.
    Hemat kuota baca: daftar uid_map disimpan di perangkat (tbsm-izin) dan hanya dokumen yang berubah sejak pembacaan terakhir yang diambil. */
 var IZ_K='tbsm-izin',IZ_PENUH=3*86400000,IZ_MUNDUR=15000;
 function izBaca(){try{var j=JSON.parse(localStorage.getItem(IZ_K)||'null');if(j&&S.user&&j.u===S.user.id&&j.db===CFG.DB&&Array.isArray(j.raw))return j}catch(e){}return null}
 function izTulis(j){try{localStorage.setItem(IZ_K,JSON.stringify(j))}catch(e){}}
 function izMax(docs,prev){var m=prev?Date.parse(prev):0;docs.forEach(function(d){var t=Date.parse(d.$updatedAt);if(t>m)m=t});return m?new Date(m).toISOString():null}
 function izSejak(iso){return Appwrite.Query.greaterThan('$updatedAt',new Date(Date.parse(iso)-IZ_MUNDUR).toISOString())}
 function izPeta(raw){
  var em={};(S.users||[]).forEach(function(u){em[u.id]=emailOf(u)});
  var m={};raw.forEach(function(d){if(em[d.sid]&&em[d.sid]===String(d.email||'').toLowerCase())(m[d.sid]=m[d.sid]||[]).push(d.id)});
  return m}
 /* hasil: {map, baru:[sid yang uid_map-nya baru/berubah], penuh:true bila uid_map dibaca penuh} */
 var map=null,mapTs=0;
 async function bacaUid(penuh){
  var st=izBaca(),raw,sejak=null,baru=[];
  if(!penuh&&st&&st.ms&&Date.now()-st.full<IZ_PENUH){
   try{
    var d=await Cloud.list('uid_map',[izSejak(st.ms)]);
    raw=st.raw.slice();
    d.forEach(function(x){var o={id:x.$id,sid:x.sid,email:x.email},k=raw.findIndex(function(y){return y.id===o.id});
     if(k<0){raw.push(o);baru.push(o.sid)}else{if(raw[k].sid!==o.sid||String(raw[k].email||'')!==String(o.email||''))baru.push(o.sid);raw[k]=o}});
    sejak=izMax(d,st.ms);
    return {raw:raw,ms:sejak,baru:baru,penuh:false,full:st.full,hs:st.hs}
   }catch(e){}
  }
  var all=await Cloud.list('uid_map');
  raw=all.map(function(x){return {id:x.$id,sid:x.sid,email:x.email}});
  return {raw:raw,ms:izMax(all,null),baru:[],penuh:true,full:Date.now(),hs:null}}
 async function loadMap(force){
  if(map&&!force&&Date.now()-mapTs<60000)return map;
  var r=await bacaUid(false),st=izBaca()||{};
  /* siswa yang pemetaannya baru muncul dicatat di bk, dan diurus beriIzin (hasil lama mereka perlu izin) */
  izTulis(Object.assign({},st,{u:S.user.id,db:CFG.DB,raw:r.raw,ms:r.ms,full:r.full,bk:(st.bk||[]).concat(r.baru)}));
  map=izPeta(r.raw);mapTs=Date.now();return map}

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

 /* staf: beri izin baca pemilik pada hasil yang belum punya (data lama atau siswa baru login).
    Pembacaan penuh seluruh hasil hanya sekali tiap IZ_PENUH (atau pertama kali di perangkat ini); selebihnya hanya
    hasil yang berubah sejak pembacaan terakhir, ditambah hasil milik siswa yang pemetaan login-nya baru muncul. */
 var granting=false,lastGrant=0,upd=[];
 async function beriIzinDoc(d,m){
  var ids=m[d.sid];if(!ids||!ids.length)return 0;
  var cur=d.$permissions||[],add=ids.filter(function(u){return !cur.some(function(p){return p.indexOf('user:'+u)>-1})});
  if(!add.length)return 0;
  try{var r=await Cloud.db.updateDocument(CFG.DB,'hasil',d.$id,{},cur.concat(add.map(readUser)));if(r&&r.$updatedAt)upd.push(r);return 1}catch(e){return 0}}
 async function beriIzin(force){
  if(granting||!Cloud.on||!S.user||!isStaff())return 0;
  if(!force&&Date.now()-lastGrant<300000)return 0;
  granting=true;var n=0;
  try{
   var prev=izBaca(),u=await bacaUid(false),m=izPeta(u.raw),docs,hs;
   map=m;mapTs=Date.now();
   var penuhHasil=!prev||!prev.hs||Date.now()-(prev.hfull||0)>IZ_PENUH;
   if(!penuhHasil){
    try{
     docs=await Cloud.list('hasil',[izSejak(prev.hs)]);
     var sids=((prev.bk||[]).concat(u.baru)).filter(function(x,i,a){return x&&a.indexOf(x)===i});
     for(var k=0;k<sids.length;k+=50){var lama=await Cloud.list('hasil',[Appwrite.Query.equal('sid',sids.slice(k,k+50))]);docs=docs.concat(lama)}
     hs=izMax(docs,prev.hs)
    }catch(e){penuhHasil=true}
   }
   if(penuhHasil){docs=await Cloud.list('hasil');hs=izMax(docs,null)}
   var seen={};upd=[];
   for(var i=0;i<docs.length;i++){var d=docs[i];if(seen[d.$id])continue;seen[d.$id]=1;n+=await beriIzinDoc(d,m)}
   /* waktu ubah dokumen yang baru kita beri izin ikut dihitung, supaya putaran berikutnya tidak membacanya lagi sebagai "berubah" */
   hs=izMax(upd,hs);
   izTulis({u:S.user.id,db:CFG.DB,raw:u.raw,ms:u.ms,full:u.full,hs:hs,hfull:penuhHasil?Date.now():prev.hfull,bk:[]});
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
  try{claim();setTimeout(function(){try{beriIzin(true)}catch(e){}},10000)}catch(e){}
  return r};
})();
