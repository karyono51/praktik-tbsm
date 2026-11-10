/* core.js: state, peran, penyimpanan lokal, autentikasi (lokal atau Appwrite) */
var CFG=window.APP_CONFIG||{};
var KEY='tbsm-uji-v2',SES='tbsm-sesi';
var PERAN={admin:'Admin',guru:'Guru',siswa:'Siswa'};
var PERM={admin:['akun','kkm','hapus','nilai'],guru:['nilai'],siswa:[]};
var S={role:'siswa',tab:'katalog',kelas:'X',kkm:+localStorage.getItem('tbsm-kkm')||75,siswaName:'',filter:'ALL',user:null,users:[],roster:[],results:[]};
var V={mode:'list',job:null,checks:{},peserta:'',catatan:'',sec:0,running:false,res:null},timer=null;
var CLOUD_ON=!!(CFG.APPWRITE_ENDPOINT&&CFG.APPWRITE_PROJECT&&window.Appwrite);
if(!CLOUD_ON){try{var d0=JSON.parse(localStorage.getItem(KEY)||'null');if(d0){S.users=d0.users||[];S.results=d0.results||[]}}catch(e){}}

function save(){try{localStorage.setItem('tbsm-kkm',S.kkm);if(!CLOUD_ON)localStorage.setItem(KEY,JSON.stringify({users:S.users,results:S.results}))}catch(e){}}
function persist(){syncRoster();save();Cloud.flush()}
/* Peran ganda: kolom peran menyimpan daftar dipisah koma (mis. 'guru,siswa', maksimal 16 karakter). Peran aktif dipilih di header. */
var URUT=['admin','guru','siswa'];
function roleList(u){var r=String((u&&u.peran)||'').split(/[,\s]+/).filter(function(x){return PERAN[x]});r.sort(function(a,b){return URUT.indexOf(a)-URUT.indexOf(b)});return r.length?r:['siswa']}
function hasRole(u,r){return roleList(u).indexOf(r)>-1}
function peranLabel(p){return roleList({peran:p}).map(function(r){return PERAN[r]}).join(' + ')}
function actRole(){return S.act||(S.user?roleList(S.user)[0]:'siswa')}
function setAct(r){S.act=r;S.role=r;try{localStorage.setItem('tbsm-act-'+S.user.id,r)}catch(e){}}
function can(p){return !!S.user&&PERM[actRole()].indexOf(p)>-1}
function isStaff(){return !!S.user&&actRole()!=='siswa'}
function syncRoster(){S.roster=S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false}).map(function(u){return {id:u.id,nama:u.nama,kelas:u.kelas}})}
function visibleResults(){return isStaff()?S.results:S.results.filter(function(r){return r.sid===S.user.id})}
function lastFor(id){return visibleResults().filter(function(x){return x.jobId===id}).sort(function(a,b){return b.ts-a.ts})[0]}
function sidOf(n){var u=S.users.find(function(x){return hasRole(x,'siswa')&&x.nama===n});return u?u.id:(actRole()==='siswa'?S.user.id:'')}
function slug(n){return String(n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'')}
function resetV(){V={mode:'list',job:null,checks:{},peserta:'',catatan:'',sec:0,running:false,res:null}}

/* ---- Sandi (mode lokal): SHA-256 + garam. Untuk produksi gunakan Appwrite. ---- */
var AL='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genPw(){return Array.from(crypto.getRandomValues(new Uint8Array(8)),function(b){return AL[b%AL.length]}).join('')}
async function hashPw(p,s){var t=s+':'+p;if(window.crypto&&crypto.subtle){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(b),function(x){return x.toString(16).padStart(2,'0')}).join('')}var h=5381;for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return 'f'+h}
async function setPw(u,pw){u.salt=uid();u.pw=await hashPw(pw,u.salt)}
async function seed(){if(!S.users.length){var u={id:uid(),nama:'Administrator',username:'admin',email:'',peran:'admin',kelas:'',aktif:true,dibuat:Date.now()};await setPw(u,'admin123');S.users.push(u);save()}}
async function localLogin(id,pw){id=id.toLowerCase();var u=S.users.find(function(x){return x.aktif!==false&&(x.username===id||(x.email&&x.email===id))});if(!u||!u.pw)return null;return (await hashPw(pw,u.salt))===u.pw?u:null}
function enter(u){S.user=u;var rl=roleList(u),sv='';try{sv=localStorage.getItem('tbsm-act-'+u.id)||''}catch(e){}S.act=rl.indexOf(sv)>-1?sv:rl[0];S.role=S.act;S.siswaName=u.nama;if(S.act==='siswa'&&u.kelas)S.kelas=u.kelas;S.tab='beranda';resetV();syncRoster()}
function quickSiswa(nama,kelas){var u={id:uid(),nama:nama,username:slug(nama)+'.'+Math.random().toString(36).slice(2,5),email:'',peran:'siswa',kelas:kelas,aktif:true,dibuat:Date.now()};S.users.push(u);persist();toast('Siswa ditambahkan')}

/* ---- Appwrite ---- */
var FA=['nama','username','email','peran','kelas','aktif'];
var FH=['ts','jobId','kelas','siswa','tipe','score','kompeten','catatan','detik','oleh','penilai','sid'];
function pick(o,F){var x={};F.forEach(function(k){if(o[k]!==undefined&&o[k]!==null)x[k]=o[k]});return x}
function fromDoc(d){var o={id:d.$id};Object.keys(d).forEach(function(k){if(k[0]!=='$')o[k]=d[k]});o.r=1;return o}
var Cloud={on:CLOUD_ON,busy:false,
 init:function(){var c=new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);this.acc=new Appwrite.Account(c);this.db=new Appwrite.Databases(c)},
 me:async function(){try{return await this.acc.get()}catch(e){if(e&&e.code===401)return null;if(navigator.onLine===false||!(e&&e.code))return 'offline';return null}},
 login:async function(e,p){await this.acc.createEmailPasswordSession(e,p)},
 register:async function(n,e,p){await this.acc.create(Appwrite.ID.unique(),e,p,n);await this.login(e,p)},
 google:function(){this.acc.createOAuth2Session('google',location.href,location.href)},
 logout:async function(){try{await this.acc.deleteSession('current')}catch(e){}},
 list:async function(col,extra){var out=[],cur=null;for(;;){var q=[Appwrite.Query.limit(100)].concat(extra||[]);if(cur)q.push(Appwrite.Query.cursorAfter(cur));var r=await this.db.listDocuments(CFG.DB,col,q);out=out.concat(r.documents);if(r.documents.length<100)return out;cur=r.documents[r.documents.length-1].$id}},
 resolve:async function(me){
  var em=me.email.toLowerCase(),f=await this.list('akun',[Appwrite.Query.equal('email',[em])]);
  if(f[0])return fromDoc(f[0]);
  var adm=em===String(CFG.ADMIN_EMAIL||'').toLowerCase();
  var p={id:uid(),nama:me.name||em,username:em.split('@')[0],email:em,peran:adm?'admin':'siswa',kelas:'X',aktif:true};
  await this.db.createDocument(CFG.DB,'akun',p.id,pick(p,FA));p.r=1;return p},
 enter:async function(me){var p=await this.resolve(me);if(p.aktif===false){await this.logout();throw new Error('Akun dinonaktifkan. Hubungi admin.')}
  S.user=p;S.users=[p];
  if(roleList(p).some(function(r){return r!=='siswa'})){S.users=(await this.list('akun')).map(fromDoc);S.results=(await this.list('hasil')).map(fromDoc)}
  else S.results=(await this.list('hasil',[Appwrite.Query.equal('sid',[p.id])])).map(fromDoc);
  enter(S.users.find(function(u){return u.id===p.id})||p)},
 flush:async function(){
  if(!this.on||!S.user||this.busy)return;this.busy=true;
  try{var jobs=[[S.users,'akun',FA],[S.results,'hasil',FH]];
   for(var i=0;i<jobs.length;i++){var arr=jobs[i][0],col=jobs[i][1],F=jobs[i][2];
    for(var k=0;k<arr.length;k++){var o=arr[k];
     if(!o.r){await this.db.createDocument(CFG.DB,col,o.id,pick(o,F));o.r=1;o.d=0}
     else if(o.d){await this.db.updateDocument(CFG.DB,col,o.id,pick(o,F));o.d=0}}}
  }catch(e){toast('Sinkronisasi gagal: '+(e.message||e))}
  this.busy=false},
 remove:async function(col,id){if(!this.on)return;try{await this.db.deleteDocument(CFG.DB,col,id)}catch(e){toast('Gagal menghapus di server')}}
};

async function boot(){
 try{
  if(Cloud.on){Cloud.init();var me=await Cloud.me();if(me==='offline'){loadSnap()}else if(me){await Cloud.enter(me)}else dropSnap()}
  else{await seed();var sid=localStorage.getItem(SES),u=S.users.find(function(x){return x.id===sid&&x.aktif!==false});if(u)enter(u)}
 }catch(e){A.err=e.message||String(e)}
 render();
}
