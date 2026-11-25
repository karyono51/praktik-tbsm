/* banksoal.js: Bank soal per unit LKPD (bentuk soal mengikuti acuan TKA).
   Siswa: Latihan (periksa per soal), Ujian bertimer (sesi dari guru), Riwayat.
   Guru/Admin: Bank soal (peruntukan latihan/ujian/keduanya, soal sendiri), Sesi ujian, Hasil (ekspor Excel).
   Koleksi Appwrite: banksoal, soal_sesi, soal_hasil (lihat appwrite.json). Mode lokal memakai localStorage. */
var BSC={soal:'banksoal',sesi:'soal_sesi',hasil:'soal_hasil'};
var BSF={
 soal:['ts','tipe','mapel','topik','kelas','tujuan','aktif','oleh','payload'],
 sesi:['ts','judul','kelas','durasi','jumlah','acak','mulai','selesai','aktif','kkm','oleh','payload'],
 hasil:['ts','sid','siswa','kelas','mode','sesiId','sesiJudul','score','benar','total','detik','payload']
};
var BSK={soal:'tbsm-bs-soal',sesi:'tbsm-bs-sesi',hasil:'tbsm-bs-hasil'},BSQ='tbsm-bs-queue',BSRUN='tbsm-bs-run-';
var BS={sub:'home',tab:'bank',D:{soal:[],sesi:[],hasil:[]},loaded:false,loading:false,err:[],run:null,res:null,
 form:null,sf:null,flt:{mapel:'',tipe:'',tuj:'',q:'',n:30},hs:'ALL',lat:{mapel:'',tipe:'',n:10},open:{},timer:null,resumed:false,all:null,kc:{},tk:{},kcLoaded:false};
/* Mode CBT aman: kunci jawaban tidak ikut soal yang dibaca siswa, nilai dihitung fungsi server cbt (config.js: CBT_AMAN:true). */
function bsAman(){return !!(window.Cloud&&Cloud.on&&window.CFG&&CFG.CBT_AMAN===true)}
function bsHasKey(q){
 if(!q)return false;
 if(q.tipe==='pg')return typeof q.kunci==='number';
 if(q.tipe==='kompleks')return Array.isArray(q.kunci)&&q.kunci.length>0;
 if(q.tipe==='uraian')return Array.isArray(q.rub)&&q.rub.length>0;
 if(q.tipe==='kategori')return Array.isArray(q.rows)&&q.rows.length>0&&q.rows.every(function(r){return typeof r[1]==='boolean'});
 return false;
}
var BS_TIPE={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori',uraian:'Uraian'};
var BS_TUJ={latihan:'Latihan',ujian:'Ujian',keduanya:'Latihan dan ujian'};
var BS_IDX={};(window.SOAL_TKA||[]).forEach(function(b){BS_IDX[b.id]=b});
ICO.cbtonline='<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="m9 10 2 2 4-4"/>';
ICO.banksoal='<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>';
/* ikon Latihan soal berbasis CBT: laptop berisi daftar soal dan tanda centang (untuk siswa) */
ICO.latihan='<rect x="4" y="4" width="16" height="11" rx="2"/><path d="M2 19h20"/><path d="M8 8h3M8 11h2"/><path d="m12.5 11 1.5 1.5L17 9.5"/>';

/* ---------- Penyimpanan ---------- */
function bsLoadLocal(){['soal','sesi','hasil'].forEach(function(k){try{BS.D[k]=JSON.parse(localStorage.getItem(BSK[k])||'[]')}catch(e){BS.D[k]=[]}})}
function bsSaveLocal(){['soal','sesi','hasil'].forEach(function(k){try{localStorage.setItem(BSK[k],JSON.stringify(BS.D[k]))}catch(e){}})}
function bsClear(){
 BS.kc={};BS.tk={};BS.tkR={};BS.kcLoaded=false;
 try{Object.keys(BSK).forEach(function(k){localStorage.removeItem(BSK[k])});if(Cloud.on)localStorage.removeItem(BSQ)}catch(e){}
 if(BS.timer){clearInterval(BS.timer);BS.timer=null}
 BS.D={soal:[],sesi:[],hasil:[]};BS.loaded=false;BS.resumed=false;BS.run=null;BS.res=null;BS.sub='home';BS.form=null;BS.sf=null;BS.all=null;
}
function bsParse(o){if(typeof o.payload==='string'){try{var x=JSON.parse(o.payload||'{}');for(var k in x)o[k]=x[k];if(o.tipe&&!x.bawaan&&bsHasKey(o)&&!BS_IDX[o.id])o.legacy=1}catch(e){}}return o}
function bsFromDoc(d){return bsParse(fromDoc(d))}
function bsPack(k,o){
 if(k==='soal'){
  if(BS_IDX[o.id])o.payload='{"bawaan":1}';
  else if(bsAman()){
   /* kunci dan pembahasan dipisah ke koleksi soal_kunci (hanya guru/admin yang bisa membaca) */
   if(bsHasKey(o))o.kc={kunci:o.kunci,rk:o.tipe==='kategori'?o.rows.map(function(r){return !!r[1]}):undefined,rub:o.tipe==='uraian'?o.rub:undefined,kj:o.tipe==='uraian'?(o.kj||''):undefined,bahas:o.bahas||''};
   o.payload=JSON.stringify({q:o.q,opts:o.opts,rows:o.rows?o.rows.map(function(r){return [r[0]]}):undefined,lab:o.lab,ks:1,qi:o.qi||undefined,oi:o.oi||undefined,maks:o.maks||undefined,bobot:o.bobot||undefined,pj:o.pj||undefined,dib:o.dib||undefined,dari:o.dari||undefined});
  }else o.payload=JSON.stringify({q:o.q,opts:o.opts,kunci:o.kunci,rows:o.rows,lab:o.lab,bahas:o.bahas,qi:o.qi||undefined,oi:o.oi||undefined,rub:o.rub,kj:o.kj,maks:o.maks||undefined,bobot:o.bobot||undefined,pj:o.pj||undefined,dib:o.dib||undefined,dari:o.dari||undefined});
 }
 else if(k==='sesi')o.payload=JSON.stringify({ids:o.ids||[],jns:(o.jns&&o.pilih!=='manual')?o.jns:undefined,jumlahUr:(typeof o.jumlahUr==='number'&&!o.jns&&o.pilih!=='manual')?o.jumlahUr:undefined,pilih:o.pilih||'otomatis',mapelF:o.mapelF||[],tampil:!!o.tampil,sekolah:o.sekolah||'',tok:o.tok?1:0,tokR:o.tokR?1:0,tokH:bsAman()?undefined:(o.tokH||undefined),tokS:bsAman()?undefined:(o.tokS||undefined),batas:o.batas||0,aksi:o.aksi||'peringatan',layar:!!o.layar,exambro:!!o.exambro,seb:!!o.seb,ruang:(o.ruang&&o.ruang.length)?o.ruang:undefined,pes:Array.isArray(o.pes)?o.pes:undefined,pesTs:Array.isArray(o.pes)?(o.pesTs||0):undefined,rmb:(Array.isArray(o.pes)&&o.rmb&&o.rmb.length)?o.rmb:undefined,nomor:(Array.isArray(o.pes)&&o.nomor)?o.nomor:undefined});
 else o.payload=JSON.stringify({ans:o.ans,order:o.order,oo:o.oo,pindah:o.pindah||0,pts:o.pts});
}
function bsQueueGet(){try{return JSON.parse(localStorage.getItem(BSQ)||'[]')}catch(e){return []}}
function bsQueueAdd(k,id){var q=bsQueueGet();if(q.indexOf(k+':'+id)<0)q.push(k+':'+id);try{localStorage.setItem(BSQ,JSON.stringify(q))}catch(e){}}
/* Galat yang layak dicoba ulang: tanpa kode (jaringan), waktu habis, sesi habis, terlalu banyak permintaan, atau galat server. */
function bsRetryable(e){var c=e&&e.code;return !c||c===401||c===408||c===425||c===429||c>=500}
/* koleksi soal_kunci: kunci soal (id = id soal) dan token sesi (id = tk_ + id sesi). Hanya guru/admin yang bisa membaca. */
async function bsRahasiaPut(id,obj){
 var data={payload:JSON.stringify(obj)};
 try{await Cloud.db.createDocument(CFG.DB,'soal_kunci',id,data)}catch(e){if(e&&e.code===409)await Cloud.db.updateDocument(CFG.DB,'soal_kunci',id,data);else throw e}
}
function bsKcSave(){try{if(isStaff())localStorage.setItem('tbsm-bs-kunci',JSON.stringify({kc:BS.kc,tk:BS.tk}))}catch(e){}}
function bsKcLoadLocal(){try{var j=JSON.parse(localStorage.getItem('tbsm-bs-kunci')||'null');if(j){BS.kc=j.kc||{};BS.tk=j.tk||{}}}catch(e){}}
async function bsRemote(k,o){
 var col=BSC[k],data=pick(o,BSF[k]);
 try{
  var db=Cloud.db;
  if(k==='soal'&&o.kc){await bsRahasiaPut(o.id,{kunci:o.kc.kunci,rk:o.kc.rk,bahas:o.kc.bahas})}
  if(k==='sesi'&&o.tokP&&o.tok){try{await bsRahasiaPut('tk_'+o.id,{token:o.tokP})}catch(e2){if(bsAman()||!(e2&&e2.code===404))throw e2}}
  if(!o.r){try{await db.createDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===409)await db.updateDocument(CFG.DB,col,o.id,data);else throw e}}
  else{try{await db.updateDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===404)await db.createDocument(CFG.DB,col,o.id,data);else throw e}}
  o.r=1;o.d=0;o.bad=0;o.err='';
  if(k==='soal'&&o.kc){BS.kc[o.id]=o.kc;delete o.kc;bsKcSave()}
  if(k==='sesi'&&o.tokP&&o.tok){BS.tk[o.id]=o.tokP;BS.tkR[o.id]={rilis:0,berlaku:0}}
  bsSaveLocal();return true;
 }catch(e){
  o.err=((e&&e.code)?e.code+' · ':'')+((e&&e.message)||String(e));
  if(navigator.onLine===false||bsRetryable(e))bsQueueAdd(k,o.id);
  else{o.bad=1;toast('Gagal menyimpan ke server: '+((e&&e.message)||e))}
  bsSaveLocal();
  return false;
 }
}
async function bsFlushQ(){
 if(!Cloud.on)return;
 var q=bsQueueGet(),rest=[];
 for(var i=0;i<q.length;i++){
  var p=q[i].split(':'),k=p[0],id=p.slice(1).join(':'),o=BS.D[k]&&BS.D[k].filter(function(x){return x.id===id})[0];
  if(!o||(o.r&&!o.d)||o.bad)continue;
  var ok=await bsRemote(k,o);if(!ok&&!o.bad)rest.push(q[i]);
 }
 try{if(rest.length)localStorage.setItem(BSQ,JSON.stringify(rest));else localStorage.removeItem(BSQ)}catch(e){}
}
/* delay (ms) dipakai pengiriman hasil ujian otomatis agar ratusan siswa tidak mengirim pada detik yang sama */
function bsPut(k,o,delay){
 bsPack(k,o);o.d=1;
 var a=BS.D[k],i=a.findIndex(function(x){return x.id===o.id});if(i<0)a.push(o);else a[i]=o;
 BS.all=null;bsSaveLocal();
 if(!Cloud.on){o.r=1;o.d=0;bsSaveLocal();return Promise.resolve(true)}
 if(delay>0){bsQueueAdd(k,o.id);return new Promise(function(res){setTimeout(function(){res(bsRemote(k,o))},delay)})}
 return bsRemote(k,o);
}
async function bsDel(k,id){
 var a=BS.D[k],i=a.findIndex(function(x){return x.id===id});if(i<0)return;
 var o=a[i];a.splice(i,1);BS.all=null;bsSaveLocal();
 if(Cloud.on&&o.r){var ok=await Cloud.remove(BSC[k],id);if(!ok){a.push(o);BS.all=null;bsSaveLocal()}}
}
async function bsLoad(){
 if(BS.loading||!S.user)return;
 BS.loading=true;BS.err=[];
 try{
  if(!BS.loaded)bsLoadLocal();
  if(Cloud.on&&navigator.onLine===false)BS.err.push('Offline: memakai salinan terakhir di perangkat.');
  else if(Cloud.on){
   await bsFlushQ();
   var Q=Appwrite.Query,jobs=[['soal',[]],['sesi',[]],['hasil',isStaff()?[]:[Q.equal('sid',[S.user.id])]]];
   await Promise.all(jobs.map(async function(jb){
    var k=jb[0];
    try{
     var rows=(await Cloud.list(BSC[k],jb[1])).map(bsFromDoc),keep=BS.D[k].filter(function(x){return !x.r||x.d});
     BS.D[k]=rows;
     keep.forEach(function(x){var j=BS.D[k].findIndex(function(y){return y.id===x.id});if(j<0)BS.D[k].push(x);else BS.D[k][j]=x});
    }catch(e){BS.err.push(BSC[k]+': '+((e&&e.message)||e))}
   }));
   bsSaveLocal();
   if(isStaff())await bsLoadRahasia();
   if(bsAman()&&isStaff()&&can('nilai'))await bsMigrasi();
   if(typeof bsRunRestore==='function'){try{await bsRunRestore()}catch(e){}}
  }
 }finally{BS.loading=false;BS.loaded=true;BS.all=null;render()}
}

/* staf: baca soal_kunci (kunci soal dan token sesi) */
async function bsLoadRahasia(){
 if(!BS.kcLoaded)bsKcLoadLocal();
 try{
  var docs=await Cloud.list('soal_kunci'),kc={},tk={},tkr={};
  docs.forEach(function(d){var p={};try{p=JSON.parse(d.payload||'{}')}catch(e){}if(d.$id.indexOf('tk_')===0){tk[d.$id.slice(3)]=p.token||'';tkr[d.$id.slice(3)]={rilis:Number(p.rilis)||0,berlaku:Number(p.berlaku)||0}}else kc[d.$id]=p});
  /* kunci yang baru dibuat di perangkat ini dan belum terkirim tetap dipertahankan */
  BS.D.soal.forEach(function(x){if(x.kc)kc[x.id]=x.kc});
  BS.kc=kc;BS.tk=tk;BS.tkR=tkr;BS.kcLoaded=true;BS.all=null;bsKcSave();
 }catch(e){if(!(e&&e.code===404))BS.err.push('soal_kunci: '+((e&&e.message)||e))}
}
/* pindahkan kunci dari soal lama (payload berisi kunci) ke soal_kunci, lalu bersihkan payload soal */
async function bsMigrasi(){
 var L=BS.D.soal.filter(function(d){return d.legacy&&!BS_IDX[d.id]&&bsHasKey(d)});
 if(!L.length)return;
 var n=0;
 for(var i=0;i<L.length;i++){L[i].legacy=0;if(await bsPut('soal',L[i]))n++}
 if(n)toast(n+' soal dilindungi: kunci dipindah ke koleksi khusus guru');
}

/* ---------- Soal ---------- */
function bsSoalAll(){
 if(BS.all)return BS.all;
 var ov={},out=[];BS.D.soal.forEach(function(d){ov[d.id]=d});
 (window.SOAL_TKA||[]).forEach(function(b){
  var o=ov[b.id],c=Object.assign({},b);
  c.bawaan=1;c.aktif=o?o.aktif!==false:true;c.tujuan=(o&&o.tujuan)||b.tujuan||'keduanya';
  if(o&&o.kelas!==undefined)c.kelas=o.kelas;
  out.push(c);
 });
 BS.D.soal.forEach(function(d){if(!BS_IDX[d.id]){var c=Object.assign({},d);c.aktif=d.aktif!==false;c.tujuan=d.tujuan||'keduanya';
  var kc=BS.kc[d.id];
  if(kc&&!bsHasKey(c)){
   if(kc.kunci!==undefined)c.kunci=kc.kunci;
   if(c.tipe==='kategori'&&kc.rk&&c.rows)c.rows=c.rows.map(function(r,i){return [r[0],kc.rk[i]!==false]});
   if(c.tipe==='uraian'){if(kc.rub&&!c.rub)c.rub=kc.rub;if(kc.kj&&!c.kj)c.kj=kc.kj}
   if(kc.bahas&&!c.bahas)c.bahas=kc.bahas;
  }
  out.push(c)}});
 return (BS.all=out);
}
function bsSoalById(id){return bsSoalAll().filter(function(q){return q.id===id})[0]}
/* judul riwayat/latihan: nama sesi bila ada, kalau latihan memakai nama mata pelajaran dari soal-soalnya */
function bsJudul(o){
 if(!o)return 'Latihan soal';
 if(o.sesiJudul)return o.sesiJudul;
 var all=bsSoalAll();if(BS._mmFor!==all){BS._mm={};all.forEach(function(q){BS._mm[q.id]=q.mapel||''});BS._mmFor=all}
 var seen={},ls=[];(o.order||o.ids||[]).forEach(function(id){var m=BS._mm[id];if(m&&!seen[m]){seen[m]=1;ls.push(m)}});
 if(!ls.length)return 'Latihan soal';
 return ls.length===1?ls[0]:ls[0]+' + '+(ls.length-1)+' mapel lain';
}
function bsMapelList(){var m={};bsSoalAll().forEach(function(q){if(q.mapel)m[q.mapel]=1});return Object.keys(m).sort()}
/* Jenis soal latihan: 'pg' = PG + PG kompleks + PG kategori (jadi satu), 'uraian' = uraian, '' = semua */
function bsLatJns(t){return t==='uraian'?'uraian':t?'pg':''}
function bsLatTipe(q,t){t=bsLatJns(t);return !t||(t==='uraian'?q.tipe==='uraian':q.tipe!=='uraian')}
/* Kelas sesi: 'ALL' (semua), satu tingkat ('XI'), atau beberapa tingkat dipisah koma ('X,XI'). Urutan X, XI, XII. */
var BS_TINGKAT=['X','XI','XII'];
function bsKls(s){
 var k=s&&typeof s==='object'?s.kelas:s;
 if(Array.isArray(k))k=k.join(',');
 k=String(k||'').trim();
 if(!k||k==='ALL')return [];
 var l=k.split(',').map(function(x){return x.trim()}).filter(Boolean),o=[];
 BS_TINGKAT.forEach(function(t){if(l.indexOf(t)>-1)o.push(t)});
 l.forEach(function(x){if(o.indexOf(x)<0)o.push(x)});
 return o.length>=BS_TINGKAT.length&&BS_TINGKAT.every(function(t){return o.indexOf(t)>-1})&&o.length===BS_TINGKAT.length?[]:o;
}
function bsKlsCocok(s,kelas){var l=bsKls(s);return !l.length||l.indexOf(kelas)>-1}
function bsKlsLabel(s,kap){var l=bsKls(s);return !l.length?(kap?'Semua':'semua'):l.length===1?l[0]:l.slice(0,-1).join(', ')+' dan '+l[l.length-1]}
function bsKlsNilai(l){l=(l||[]).filter(function(x){return BS_TINGKAT.indexOf(x)>-1});return !l.length||l.length===BS_TINGKAT.length?'ALL':BS_TINGKAT.filter(function(t){return l.indexOf(t)>-1}).join(',')}
function bsSfKls(f){return bsKls(f)}
function bsPool(mode,kelas){
 var ks=Array.isArray(kelas)?kelas:(kelas?[kelas]:[]);
 return bsSoalAll().filter(function(q){return q.aktif&&(q.tujuan==='keduanya'||q.tujuan===mode)&&!(mode==='ujian'&&bsAturanSalah(q))&&(!q.kelas||!ks.length||ks.indexOf(q.kelas)>-1)});
}
function bsOverride(id,patch){
 var b=BS_IDX[id],o=BS.D.soal.filter(function(x){return x.id===id})[0];
 if(!o){o={id:id,ts:Date.now(),tipe:b.tipe,mapel:b.mapel,topik:b.topik||'',kelas:b.kelas||'',tujuan:b.tujuan||'keduanya',aktif:true,oleh:S.user.nama,bawaan:1}}
 Object.assign(o,patch);return bsPut('soal',o);
}
function bsShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
/* Aturan bentuk soal TKA (soal bawaan dikecualikan):
   PG sederhana: 5 pilihan (A sampai E), tepat 1 kunci.
   PG kompleks (MCMA): 5 pilihan, kunci minimal 2.
   PG kategori: 3 sampai 6 pernyataan, label Benar/Salah atau Sesuai/Tidak Sesuai.
   Soal sendiri yang belum memenuhi aturan hanya dipakai untuk latihan (tidak masuk pool ujian). */
var BS_LABS=[['Benar','Salah'],['Sesuai','Tidak Sesuai']];
function bsLabIdx(l){var a=String(l&&l[0]||'').trim().toLowerCase(),b=String(l&&l[1]||'').trim().toLowerCase();for(var i=0;i<BS_LABS.length;i++)if(BS_LABS[i][0].toLowerCase()===a&&BS_LABS[i][1].toLowerCase()===b)return i;return -1}
function bsAturanSalah(q){
 if(!q||q.bawaan)return '';
 if(q.tipe==='uraian')return q.maks>=1?'':'skor maksimum dan rubrik wajib';
 if(q.tipe==='kategori'){var n=(q.rows||[]).length;if(n<3||n>6)return 'pernyataan harus 3 sampai 6';if(bsLabIdx(q.lab||['Benar','Salah'])<0)return 'label harus Benar/Salah atau Sesuai/Tidak Sesuai';return ''}
 if((q.opts||[]).length!==5)return 'pilihan harus 5 (A sampai E)';
 if(q.tipe==='kompleks'&&Array.isArray(q.kunci)&&q.kunci.length<2)return 'kunci minimal 2';
 return '';
}
function bsTujEf(q){return bsAturanSalah(q)&&q.tujuan!=='latihan'?'latihan':q.tujuan}
function bsFrac(q,a){
 if(a==null||!bsHasKey(q)||q.tipe==='uraian')return 0;
 if(q.tipe==='pg')return a===q.kunci?1:0;
 if(q.tipe==='kompleks'){
  var sel=Array.isArray(a)?a:[];if(!sel.length)return 0;
  var b=0,s=0;sel.forEach(function(i){if(q.kunci.indexOf(i)>-1)b++;else s++});
  return Math.max(0,(b-s)/q.kunci.length);
 }
 if(q.tipe==='kategori'){
  if(!Array.isArray(a))return 0;var b=0,sl=0;
  q.rows.forEach(function(r,i){var v=a[i];if(v!==0&&v!==1)return;if(v===(r[1]?0:1))b++;else sl++});
  return Math.max(0,(b-sl)/q.rows.length);
 }
 return 0;
}
function bsAnswered(q,a){
 if(a==null)return false;
 if(q.tipe==='kompleks')return Array.isArray(a)&&a.length>0;
 if(q.tipe==='kategori')return Array.isArray(a)&&a.some(function(x){return x===0||x===1});
 if(q.tipe==='uraian')return typeof a==='string'&&a.trim().length>0;
 return true;
}
function bsText(s){return esc(s).replace(/\n/g,'<br>')}
/* nilai satu catatan: soal objektif bobot 1; uraian bobot q.bobot (default 2) setelah dinilai guru (nu). Uraian belum dinilai = pend, belum dihitung. */
function bsHitung(ids,ansOf,nu,lat){
 var sum=0,w=0,ben=0,pend=0;
 ids.forEach(function(id){
  var q=bsSoalById(id);if(!q)return;
  if(q.tipe==='uraian'){
   if(lat)return;
   var g=nu&&nu[id],bb=q.bobot>0?q.bobot:2;
   if(g&&typeof g.skor==='number'){var f0=Math.max(0,Math.min(1,g.skor/(g.mk||q.maks||1)));sum+=f0*bb;w+=bb;if(f0>=0.9999)ben++}
   else if(bsAnswered(q,ansOf(id)))pend++;
   else w+=bb;
   return;
  }
  var f=bsFrac(q,ansOf(id));sum+=f;w+=1;if(f>=0.9999)ben++;
 });
 return {sum:sum,w:w,ben:ben,pend:pend,score:w?Math.round(sum/w*100):0};
}
function bsLtr(i){return String.fromCharCode(65+i)}
function bsWaktu(ts){return ts?new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'-'}
function bsDtv(ts){if(!ts)return '';var d=new Date(ts-new Date(ts).getTimezoneOffset()*60000);return d.toISOString().slice(0,16)}
function bsOn(){return S.tab==='banksoal'||S.tab==='cbtonline'||S.tab==='riwayatlatihan'}
function bsEdit(){return !!S.user&&isStaff()&&can('nilai')}

/* ---------- Sesi dan percobaan ---------- */
/* Jumlah soal per jenis (sesi otomatis). s.jns={pg,kompleks,kategori,uraian}: tiap jenis diambil acak sebanyak angkanya (0 = tidak dipakai).
   Mengembalikan daftar kelompok [{t:[jenis],n}] berurutan PG, kompleks, kategori, uraian; null = cara lama (satu jumlah, semua jenis dicampur).
   jumlahUr (versi sebelumnya): PG/kompleks/kategori = jumlah, uraian = jumlahUr. */
function bsGrup(s){
 if(!s||s.pilih==='manual')return null;
 var j=s.jns;
 if(j&&typeof j==='object'){
  var g=[];['pg','kompleks','kategori','uraian'].forEach(function(t){var n=Math.max(0,Math.min(200,parseInt(j[t],10)||0));if(n>0)g.push({t:[t],n:n})});
  return g.length?g:null;
 }
 if(typeof s.jumlahUr==='number'&&s.jumlahUr>=0){var g2=[{t:['pg','kompleks','kategori'],n:s.jumlah||0}];if(s.jumlahUr>0)g2.push({t:['uraian'],n:s.jumlahUr});return g2}
 return null;
}
function bsGrupNama(g){return g.t.length>1?'PG':BS_TIPE[g.t[0]]}
function bsJnsForm(s){
 if(s.jns&&typeof s.jns==='object')return {pg:+s.jns.pg||0,kompleks:+s.jns.kompleks||0,kategori:+s.jns.kategori||0,uraian:+s.jns.uraian||0};
 if(typeof s.jumlahUr==='number')return {pg:s.jumlah||0,kompleks:0,kategori:0,uraian:s.jumlahUr};
 return null;
}
function bsUrAkhir(ids){
 var pg=[],ur=[];
 ids.forEach(function(id){var q=bsSoalById(id);(q&&q.tipe==='uraian'?ur:pg).push(id)});
 return pg.concat(ur);
}
function bsJmlTxt(s){
 if(s.pilih==='manual')return (s.ids||[]).length+' soal pilihan';
 var g=bsGrup(s);
 if(g)return g.map(function(x){return (x.n||'semua')+' '+bsGrupNama(x)}).join(' + ')+' acak';
 return (s.jumlah||'semua')+' soal acak';
}
function bsSesiStatus(s){
 var n=Jam.now();
 if(s.aktif===false)return {k:'off',t:'Nonaktif',c:'plain'};
 if(s.mulai&&n<s.mulai)return {k:'soon',t:'Terjadwal',c:'warn'};
 if(s.selesai&&n>s.selesai)return {k:'end',t:'Berakhir',c:'plain'};
 return {k:'on',t:'Dibuka',c:'ok'};
}
function bsSesiUntuk(kelas){return BS.D.sesi.filter(function(s){return (Array.isArray(s.pes)?(!S.user||s.pes.indexOf(S.user.id)>-1):bsKlsCocok(s,kelas))&&schAkunOk(s)})}
function bsHasilSaya(){return BS.D.hasil.filter(function(h){return h.sid===S.user.id}).sort(function(a,b){return b.ts-a.ts})}
function bsRunKey(){return BSRUN+S.user.id}
function bsRunSave(){if(BS.run)try{localStorage.setItem(bsRunKey(),JSON.stringify(BS.run))}catch(e){}}
function bsMake(mode,sesi,opt){
 var kelas=S.user.kelas||'',ids,acak=true;
 if(mode==='ujian'){
  acak=sesi.acak!==false;
  if(sesi.pilih==='manual')ids=(sesi.ids||[]).filter(function(id){return !!bsSoalById(id)});
  else{
   var pool=bsPool('ujian',kelas).filter(function(q){return !(sesi.mapelF&&sesi.mapelF.length)||sesi.mapelF.indexOf(q.mapel)>-1});
   pool=bsShuffle(pool);
   var pk=function(l,n){return window.sgrPilih?sgrPilih(l,n):l.slice(0,n||l.length)};
   var gr=bsGrup(sesi);
   if(gr){
    ids=[];
    gr.forEach(function(g){ids=ids.concat(pk(pool.filter(function(q){return g.t.indexOf(q.tipe)>-1}),g.n))});
    ids=ids.map(function(q){return q.id});
   }else ids=pk(pool,sesi.jumlah).map(function(q){return q.id});
  }
  if(acak&&sesi.pilih==='manual')ids=bsShuffle(ids);
  if(window.sgrAturList)ids=sgrAturList(ids,bsSoalById);
  if(bsGrup(sesi))ids=bsUrAkhir(ids);
 }else{
  var p2=bsPool('latihan',kelas).filter(function(q){return (!opt.mapel||q.mapel===opt.mapel)&&bsLatTipe(q,opt.tipe)});
  ids=(window.sgrPilih?sgrPilih(bsShuffle(p2),opt.n):bsShuffle(p2).slice(0,opt.n||p2.length)).map(function(q){return q.id});
  if(window.sgrAturList)ids=sgrAturList(ids,bsSoalById);
 }
 var oo={};
 ids.forEach(function(id){var q=bsSoalById(id);if(q&&q.opts){var ix=q.opts.map(function(_,i){return i});oo[id]=acak?bsShuffle(ix):ix}});
 return {mode:mode,sesiId:sesi?sesi.id:'',sesiJudul:sesi?sesi.judul:'',start:Jam.now(),dur:sesi?(sesi.durasi||0)*60:0,ids:ids,oo:oo,ans:{},cur:0,chk:{},pindah:0,sid:S.user.id,tampil:sesi?!!sesi.tampil:true,kkm:sesi&&sesi.kkm?sesi.kkm:S.kkm};
}
function bsStartRun(r){
 BS.run=r;BS.sub='run';bsRunSave();bsTimerOn();render();window.scrollTo(0,0);
}
function bsRemain(r){return Math.max(0,r.start+(r.dur+(r.ext||0))*1000-Jam.now())}
function bsTimerOn(){
 if(BS.timer)clearInterval(BS.timer);
 BS.timer=setInterval(function(){
  var r=BS.run;if(!r){clearInterval(BS.timer);BS.timer=null;return}
  var el=document.getElementById('bs-clock');
  if(r.dur){var ms=bsRemain(r);if(el){el.textContent=mmss(Math.ceil(ms/1000));el.classList.toggle('low',ms<300000)}if(ms<=0)bsFinish(true)}
  else if(el)el.textContent=mmss(Math.floor((Jam.now()-r.start)/1000));
 },1000);
}
async function bsFinish(auto){
 var r=BS.run;if(!r||r.done)return;r.done=1;
 if(BS.timer){clearInterval(BS.timer);BS.timer=null}
 var lat0=r.mode==='latihan',urn=lat0?r.ids.filter(function(x){var q=bsSoalById(x);return q&&q.tipe==='uraian'}).length:0,tot=r.ids.length-urn,hg=bsHitung(r.ids,function(x){return r.ans[x]},null,lat0),sum=hg.sum,ben=hg.ben;
 var h={id:r.rid?('h'+r.rid.slice(1)):uid(),ts:Jam.now(),sid:r.sid,siswa:S.user.nama,kelas:S.user.kelas||'',mode:r.mode,sesiId:r.sesiId||'',sesiJudul:r.sesiJudul||'',
  score:hg.score,benar:ben,total:tot,detik:Math.min(Math.round((Jam.now()-r.start)/1000),r.dur||1e9),
  ans:r.ans,order:r.ids,oo:r.oo,pindah:r.pindah||0,pts:+sum.toFixed(2),pend:hg.pend||undefined,urlat:urn||undefined,tampil:r.tampil,kkm:r.kkm};
 try{localStorage.removeItem(bsRunKey())}catch(e){}
 BS.run=null;BS.res=h.id;BS.sub='result';
 var sp=bsPut('hasil',h,auto?Math.floor(Math.random()*4000):0);
 if(typeof bsRunDone==='function')bsRunDone(r);
 if(auto)toast('Waktu habis. Jawaban dikirim otomatis.');
 render();window.scrollTo(0,0);
 sp.then(function(){if(BS.sub==='result'&&BS.res===h.id&&bsOn())render()});
}
function bsResume(){
 if(BS.resumed||!S.user)return;BS.resumed=true;
 var r=null;try{r=JSON.parse(localStorage.getItem(bsRunKey())||'null')}catch(e){}
 if(!r||r.sid!==S.user.id||r.done)return;
 BS.run=r;if(bsOn())BS.sub='run';
 if(r.dur&&bsRemain(r)<=0){setTimeout(function(){bsFinish(true)},0);return}
 bsTimerOn();
}
document.addEventListener('visibilitychange',function(){
 var r=BS.run;if(r&&r.mode==='ujian'&&document.hidden){r.pindah=(r.pindah||0)+1;bsRunSave()}
 if(r&&!document.hidden&&r.dur&&bsRemain(r)<=0)bsFinish(true);
});

/* ---------- Tampilan soal ---------- */
function bsQBody(q,r,mode){
 var a=r?r.ans[q.id]:null,locked=mode==='check'&&r&&r.chk[q.id],h=(window.sgrBox&&q.gs?sgrBox(q,r&&r.ids?sgrLabel(r.ids.map(bsSoalById),r.ids.indexOf(q.id)):''):'')+'<p class="bs-q">'+bsText(q.q)+'</p>'+(window.sgQHtml?sgQHtml(q):'');
 if(q.tipe==='uraian'){
  h+=bsUraianBox(q,a,mode==='check',locked);
 }else if(q.tipe==='pg'||q.tipe==='kompleks'){
  if(q.tipe==='kompleks')h+='<p class="note">Pilih semua jawaban yang benar.</p>';
  var order=(r&&r.oo[q.id])||q.opts.map(function(_,i){return i});
  h+='<div class="bs-opts">'+order.map(function(oi,pos){
   var sel=q.tipe==='pg'?a===oi:(Array.isArray(a)&&a.indexOf(oi)>-1),cls='';
   if(locked){var key=q.tipe==='pg'?q.kunci===oi:q.kunci.indexOf(oi)>-1;cls=key?' ok':(sel?' bad':'')}
   return '<button type="button" class="bs-opt'+cls+'" data-bs="ans" data-q="'+q.id+'" data-v="'+oi+'" aria-pressed="'+!!sel+'"'+(locked?' disabled':'')+'><b class="ltr">'+bsLtr(pos)+'</b><span>'+(window.sgOptHtml?sgOptHtml(q,oi):esc(q.opts[oi]))+'</span></button>';
  }).join('')+'</div>';
 }else{
  var lab=q.lab||['Benar','Salah'];
  h+='<div class="bs-kat">'+q.rows.map(function(row,ri){
   var v=Array.isArray(a)?a[ri]:null;
   return '<div class="bs-kr"><span>'+esc(row[0])+'</span><span class="bs-kb">'+[0,1].map(function(vi){
    var cls='';if(locked){var okv=(row[1]?0:1)===vi;cls=okv?' ok':(v===vi?' bad':'')}
    return '<button type="button" class="bs-opt small'+cls+'" data-bs="kat" data-q="'+q.id+'" data-r="'+ri+'" data-v="'+vi+'" aria-pressed="'+(v===vi)+'"'+(locked?' disabled':'')+'>'+esc(lab[vi])+'</button>';
   }).join('')+'</span></div>';
  }).join('')+'</div>';
 }
 if(locked&&q.bahas)h+='<div class="bs-bahas"><b>Pembahasan</b><p>'+bsText(q.bahas)+'</p></div>';
 return h;
}
function bsUraianBox(q,a,lat,locked){
 var pj=q.pj>0?q.pj:1500,t=typeof a==='string'?a:'',h;
 h='<p class="note">'+(lat?'Latihan uraian: tulis jawabanmu, lalu ketuk Periksa jawaban untuk membandingkan dengan kunci. Tidak dinilai.':'Jawab dengan uraian. Jawaban dinilai guru setelah ujian.')+'</p>'+
  '<textarea class="bs-ur" data-q="'+q.id+'" rows="9" maxlength="'+pj+'" placeholder="Tulis jawabanmu di sini" aria-label="Jawaban uraian"'+(locked?' readonly':'')+'>'+esc(t)+'</textarea>'+
  '<p class="note bs-urc" data-q="'+q.id+'">'+t.length+' / '+pj+' karakter</p>';
 if(lat&&locked){
  if(q.kj)h+='<div class="bs-urj bs-urk"><b>Kunci jawaban</b><p>'+bsText(q.kj)+'</p></div>';
  if(Array.isArray(q.rub)&&q.rub.length)h+='<div class="bs-urj bs-urk"><b>Rubrik penilaian mandiri</b>'+q.rub.map(function(k){return '<div class="row sb"><span>'+esc(k[0])+'</span><b class="mono">maks '+k[1]+'</b></div>'}).join('')+'</div>';
  if(!q.kj&&!(Array.isArray(q.rub)&&q.rub.length))h+='<p class="note">Kunci tidak ditampilkan. Bahas jawabanmu bersama guru.</p>';
 }
 return h;
}
document.addEventListener('input',function(e){
 var t=e.target;if(!t||!t.classList||!t.classList.contains('bs-ur'))return;
 var r=BS.run;if(!r||r.chk[t.dataset.q])return;
 r.ans[t.dataset.q]=t.value===''?null:t.value;
 var c=document.querySelector('.bs-urc[data-q="'+t.dataset.q+'"]');if(c)c.textContent=t.value.length+' / '+(t.maxLength>0?t.maxLength:1500)+' karakter';
 var cb=document.querySelector('[data-bs="cek"]');if(cb)cb.disabled=!t.value.trim();
 bsRunSave();
});
/* skor 0..1 satu soal pada satu hasil; uraian yang belum dinilai = null (belum dihitung) */
function bsFracH(q,a,h){
 if(!q)return 0;
 if(q.tipe!=='uraian')return bsFrac(q,a);
 if(!bsAnswered(q,a))return 0;
 var g=h&&h.nu&&h.nu[q.id];
 if(!g||typeof g.skor!=='number')return null;
 return Math.max(0,Math.min(1,g.skor/(g.mk||q.maks||1)));
}
function bsRevNu(q){return q.tipe==='uraian'&&BS.revNu?BS.revNu[q.id]:null}
function bsRevCls(q,a,f){
 if(!bsAnswered(q,a))return 'plain';
 if(q.tipe==='uraian'){var g=bsRevNu(q);if(!g)return 'warn';var r0=g.skor/(g.mk||q.maks||1);return r0>=0.9999?'ok':r0>0?'warn':'bad'}
 return f>=0.9999?'ok':f>0?'warn':'bad';
}
function bsRevTxt(q,a,f){
 if(!bsAnswered(q,a))return 'Tidak dijawab';
 if(q.tipe==='uraian'){var g=bsRevNu(q);return g?('Skor '+g.skor+' dari '+(g.mk||q.maks||'?')):'Menunggu penilaian guru'}
 return f>=0.9999?'Benar':f>0?'Sebagian':'Salah';
}
function bsRevUraian(q,a,showAns){
 var g=bsRevNu(q),h='<div class="bs-urj"><b>Jawabanmu</b><p>'+(bsAnswered(q,a)?bsText(a):'<span class="note">Tidak dijawab</span>')+'</p></div>';
 if(showAns&&g){
  if(Array.isArray(q.rub)&&q.rub.length&&Array.isArray(g.rub))h+='<div class="bs-urj"><b>Rubrik</b>'+q.rub.map(function(k,i){return '<div class="row sb"><span>'+esc(k[0])+'</span><b class="mono">'+(g.rub[i]!=null?g.rub[i]:0)+' / '+k[1]+'</b></div>'}).join('')+'</div>';
  if(g.cat)h+='<div class="bs-urj"><b>Komentar guru</b><p>'+bsText(g.cat)+'</p></div>';
 }
 if(showAns&&q.kj)h+='<div class="bs-urj"><b>Kunci jawaban</b><p>'+bsText(q.kj)+'</p></div>';
 return h;
}
function bsRev(q,a,n,showAns,noStim){
 var f=bsFrac(q,a),hd=n===''?'':'<div class="row"><b>'+n+'.</b><span class="pill plain">'+esc(q.mapel||'')+'</span><span class="pill '+bsRevCls(q,a,f)+'">'+bsRevTxt(q,a,f)+'</span></div>',h='<div class="bs-rv">'+hd+(window.sgrBox&&!noStim?sgrBox(q,''):'')+'<p class="bs-q">'+bsText(q.q)+'</p>'+(window.sgQHtml?sgQHtml(q):'');
 if(q.tipe==='uraian'){
  h+=bsRevUraian(q,a,showAns);
 }else if(q.tipe==='kategori'){
  var lab=q.lab||['Benar','Salah'];
  h+='<div class="bs-kat">'+q.rows.map(function(row,ri){
   var v=Array.isArray(a)?a[ri]:null,kv=row[1]?0:1,ok=v===kv;
   return '<div class="bs-kr '+(v==null?'':ok?'ok':'bad')+'"><span>'+esc(row[0])+'</span><span class="note">'+(showAns?('Jawabanmu: '+(v==null?'-':esc(lab[v]))+' · Kunci: '+esc(lab[kv])):('Jawabanmu: '+(v==null?'-':esc(lab[v]))))+'</span></div>';
  }).join('')+'</div>';
 }else{
  h+='<div class="bs-opts">'+q.opts.map(function(t,i){
   var sel=q.tipe==='pg'?a===i:(Array.isArray(a)&&a.indexOf(i)>-1),key=q.tipe==='pg'?q.kunci===i:q.kunci.indexOf(i)>-1;
   var cls=showAns?(key?' ok':(sel?' bad':'')):(sel?' sel':'');
   return '<div class="bs-opt static'+cls+'"><b class="ltr">'+bsLtr(i)+'</b><span>'+(window.sgOptHtml?sgOptHtml(q,i):esc(t))+(sel?' <em>(jawabanmu)</em>':'')+(showAns&&key?' ✓':'')+'</span></div>';
  }).join('')+'</div>';
 }
 if(showAns&&q.bahas)h+='<div class="bs-bahas"><b>Pembahasan</b><p>'+bsText(q.bahas)+'</p></div>';
 return h+'</div>';
}

/* ---------- Siswa ---------- */
function bsViewSiswa(){
 var cbt=S.tab==='cbtonline';
 if(BS.sub==='run'&&BS.run)return bsViewRun();
 if(BS.sub==='result')return bsViewResult();
 if(BS.sub==='latsetup')return bsViewLatSetup();
 if(BS.sub==='riwayat')return bsViewRiwayat();
 var kelas=S.user.kelas||'',h='',run=BS.run;
 if(run)h+='<div class="card bs-resume"><b>'+(run.mode==='ujian'?'Ujian sedang berjalan':'Latihan belum selesai')+'</b><p class="note">'+esc(bsJudul(run))+' · '+Object.keys(run.ans).length+' dari '+run.ids.length+' soal terjawab</p><button type="button" class="btn primary" data-bs="lanjut">Lanjutkan</button></div>';
 var tujuan=(cbt&&typeof navSesiId==='function')?navSesiId():'';
 var sesi=bsSesiUntuk(kelas).filter(function(s){return bsSesiStatus(s).k!=='off'}).sort(function(a,b){return ((b.id===tujuan)-(a.id===tujuan))||((b.ts||0)-(a.ts||0))});
 if(cbt)h+='<section class="recent"><div class="sechead"><h2>Ujian</h2></div>';
 if(cbt&&!sesi.length)h+='<p class="muted">Belum ada sesi ujian untuk kelasmu.</p>';
 if(cbt)h+=sesi.map(function(s){
  var st=bsSesiStatus(s),done=BS.D.hasil.filter(function(x){return x.sid===S.user.id&&x.sesiId===s.id&&x.mode==='ujian'})[0],go=st.k==='on'&&!done&&!(run&&run.sesiId===s.id);
  var jml=s.pilih==='manual'?(s.ids||[]).length:bsGrup(s)?bsGrup(s).reduce(function(a,g){return a+g.n},0):(s.jumlah||'semua');
  return '<div class="card"'+(tujuan&&s.id===tujuan?' style="border:2px solid var(--primary,#1a73e8)"':'')+'>'+(tujuan&&s.id===tujuan?'<p class="note"><b>Ujian untuk file SEB ini</b></p>':'')+'<div class="row sb"><b>'+esc(s.judul)+'</b><span class="pill '+(done?'ok':st.c)+'">'+(done?'Selesai':st.t)+'</span></div><p class="note">'+jml+' soal · '+(s.durasi||0)+' menit'+(s.mulai?' · mulai '+bsWaktu(s.mulai):'')+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+(s.tok?' · pakai token':'')+'</p>'+
   (done?'<p>Nilai: <b class="mono">'+done.score+'</b> ('+done.benar+' benar dari '+done.total+')</p>':'')+
   (window.pdBaris?pdBaris(s,done):'')+
   (go?'<button type="button" class="btn primary" data-bs="mulaiujian" data-v="'+s.id+'">Mulai ujian</button>':'')+'</div>';
 }).join('')+'</section>';
 if(cbt)return h+bsRiwayatBlok('ujian');
 var pool=bsPool('latihan',kelas).length;
 h+='<section class="recent"><div class="sechead"><h2>Latihan</h2></div><div class="card"><p class="note">'+pool+' soal latihan tersedia.</p><button type="button" class="btn primary" data-bs="latsetup"'+(pool?'':' disabled')+'>Mulai latihan</button></div></section>';
return h+bsRiwayatBlok('latihan');
}
/* riwayat per jenis: Bank soal menampilkan latihan, CBT Online menampilkan ujian */
function bsRwList(mode){return bsHasilSaya().filter(function(x){return mode==='ujian'?x.mode==='ujian':x.mode==='latihan'})}
function bsRiwayatBlok(mode){
 var rw=bsRwList(mode);BS.rwMode=mode;
 var h='<section class="recent"><div class="sechead"><h2>Riwayat '+(mode==='ujian'?'ujian':'latihan')+'</h2>'+(rw.length>5?'<button type="button" class="link" data-bs="riwayat">Lihat semua</button>':'')+'</div>';
 h+=rw.length?rw.slice(0,5).map(bsRiwayatRow).join(''):'<p class="muted">Belum ada riwayat '+(mode==='ujian'?'ujian':'latihan')+'.</p>';
 return h+'</section>';
}
function bsRiwayatRow(x){
 var lat=x.mode==='latihan';
 return '<div class="card"><div class="row sb"><span class="row"><span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':'Ujian')+'</span><b>'+esc(bsJudul(x))+'</b></span><b class="mono">'+x.score+'</b></div><div class="row sb"><span class="note">'+bsWaktu(x.ts)+' · '+x.benar+' benar dari '+x.total+' · '+Math.max(1,Math.round(x.detik/60))+' menit</span><button type="button" class="btn small" data-bs="detail" data-v="'+x.id+'">Detail</button></div></div>';
}
function bsViewRiwayat(){
 var rw=bsRwList(S.tab==='cbtonline'?'ujian':'latihan');
 return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Riwayat</h2></div>'+(rw.length?rw.map(bsRiwayatRow).join(''):'<p class="muted">Belum ada riwayat.</p>');
}
function bsViewLatSetup(){
 var kelas=S.user.kelas||'',L=BS.lat,pool=bsPool('latihan',kelas).filter(function(q){return (!L.mapel||q.mapel===L.mapel)&&bsLatTipe(q,L.tipe)});
 var mp=bsMapelList(),n=L.n,cnt=bsMapelHitung(bsPool('latihan',kelas));
 return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Atur latihan</h2></div><div class="card lat-set">'+
  '<label class="f">Mata pelajaran<select id="bl-mapel"><option value="">Semua</option>'+bsMapelOptHtml(mp.filter(function(m){return cnt[m]||L.mapel===m}),L.mapel,cnt)+'</select></label>'+
  '<label class="f">Jenis soal<select id="bl-tipe"><option value="">Semua</option>'+[['pg','PG'],['uraian','Uraian']].map(function(t){return '<option value="'+t[0]+'"'+(bsLatJns(L.tipe)===t[0]?' selected':'')+'>'+t[1]+'</option>'}).join('')+'</select></label>'+
  '<div><span class="label">Jumlah soal</span><div class="chips" role="group">'+[5,10,20,30].map(function(v){return '<button type="button" data-bs="latn" data-v="'+v+'" aria-pressed="'+(n===v)+'">'+v+'</button>'}).join('')+'</div></div>'+
  '<p class="note">'+pool.length+' soal sesuai pilihan.</p><button type="button" class="btn primary" data-bs="latmulai"'+(pool.length?'':' disabled')+'>Mulai</button></div>';
}
function bsViewRun(){
 var r=BS.run,id=r.ids[r.cur],q=bsSoalById(id),mode=r.mode==='latihan'?'check':'answer',h='';
 if(!q){return '<div class="card"><p>Soal ini sudah tidak tersedia.</p><button type="button" class="btn" data-bs="next">Lewati</button></div>'}
 var ans=Object.keys(r.ans).filter(function(k){var s=bsSoalById(k);return s&&bsAnswered(s,r.ans[k])}).length;
 h+='<div class="card"><div class="row sb"><b>'+esc(bsJudul(r))+'</b><span class="note">Soal '+(r.cur+1)+' dari '+r.ids.length+' · terjawab '+ans+'</span></div><div class="bs-nav">'+
  r.ids.map(function(x,i){var s=bsSoalById(x),dn=s&&bsAnswered(s,r.ans[x]);return '<button type="button" class="'+(dn?'dn ':'')+(i===r.cur?'cur':'')+'" data-bs="goto" data-v="'+i+'" aria-label="Soal '+(i+1)+'">'+(i+1)+'</button>'}).join('')+'</div></div>';
 h+='<div class="card"><div class="row"><span class="pill plain">'+esc(q.mapel||'')+'</span><span class="pill plain">'+BS_TIPE[q.tipe]+'</span></div>'+bsQBody(q,r,mode);
 if(mode==='check'&&!r.chk[id])h+='<button type="button" class="btn" data-bs="cek"'+(bsAnswered(q,r.ans[id])?'':' disabled')+'>Periksa jawaban</button>';
 h+='</div>';
 var last=r.cur===r.ids.length-1;
 h+='<div class="bsbar"><span class="bsclock" id="bs-clock" role="timer">'+(r.dur?mmss(Math.ceil(bsRemain(r)/1000)):mmss(Math.floor((Jam.now()-r.start)/1000)))+'</span><button type="button" class="btn" data-bs="prev"'+(r.cur?'':' disabled')+'>Kembali</button>'+(last?'<button type="button" class="btn primary" data-bs="selesai">Selesai</button>':'<button type="button" class="btn primary" data-bs="next">Lanjut</button>')+'</div>';
 return h;
}
function bsViewResult(){
 var h0=BS.D.hasil.filter(function(x){return x.id===BS.res})[0];
 if(!h0)return '<div class="card"><p>Hasil tidak ditemukan.</p><button type="button" class="btn" data-bs="home">Kembali</button></div>';
 var lat=h0.mode==='latihan',sesi=BS.D.sesi.filter(function(s){return s.id===h0.sesiId})[0],kkm=(sesi&&sesi.kkm)||h0.kkm||S.kkm,tampil=lat||(sesi&&sesi.tampil)||h0.tampil===true||isStaff();
 var h='<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Hasil</h2></div><div class="card center"><span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':'Ujian')+'</span><div class="bs-score mono">'+h0.score+'</div>'+
  (lat?'':'<span class="pill '+(h0.score>=kkm?'ok':'bad')+'">'+(h0.score>=kkm?'Kompeten':'Belum kompeten')+' · KKM '+kkm+'</span>')+
  '<p class="note">'+h0.benar+' benar dari '+h0.total+' soal · '+Math.max(1,Math.round(h0.detik/60))+' menit'+(h0.pindah?' · keluar halaman '+h0.pindah+'×':'')+(h0.pend?' · '+h0.pend+' soal uraian menunggu penilaian guru (nilai sementara)':'')+(h0.urlat?' · '+h0.urlat+' soal uraian latihan (tidak dinilai)':'')+'</p>'+(h0.r||!Cloud.on?'':'<p class="note">Nilai belum masuk ke server guru.'+(h0.err?' Penyebab: '+esc(h0.err):'')+'</p><button type="button" class="btn small primary" data-bs="kirimulang" data-v="'+h0.id+'">Kirim ulang</button>')+'</div>';
 if(!tampil)return h+'<p class="note center">Pembahasan ujian ditampilkan guru setelah sesi berakhir.</p>';
 BS.revNu=h0.nu||null;
 var prevG='';(h0.order||[]).forEach(function(id,i){var q=bsSoalById(id),dup=!!(q&&q.gs&&q.gs===prevG);prevG=q&&q.gs||'';h+=q?'<div class="card">'+bsRev(q,(h0.ans||{})[id],i+1,true,dup)+'</div>':'<div class="card"><p class="muted">Soal '+(i+1)+' sudah tidak tersedia.</p></div>'});
 return h;
}

/* ---------- Guru: kerangka ---------- */
function bsViewStaff(){
 /* Bank soal: khusus soal. CBT Online: Sesi, Pantau, Hasil, Analisis. */
 if(S.tab==='riwayatlatihan')return bsViewRiwayatLatihan();
 if(S.tab!=='cbtonline'){BS.tab='bank';return BS.form?bsViewForm():bsViewBank()}
 if(BS.tab==='bank')BS.tab='sesi';
 var upn=window.urPending?urPending():0,tabs=[['sesi','Sesi'],['pantau','Pantau'],['hasil','Hasil'],['uraian','Uraian'+(upn?' ('+upn+')':'')],['analisis','Analisis']];
 var h=bsCbtRingkas()+'<div class="seg bs5" role="tablist">'+tabs.map(function(t){return '<button type="button" role="tab" data-bs="tab" data-v="'+t[0]+'" aria-pressed="'+(BS.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
 if(BS.tab==='sesi')return h+(BS.sf?bsViewSesiForm():bsViewSesi());
 if(BS.tab==='pantau')return h+(window.bsViewPantau?bsViewPantau():'');
 if(BS.tab==='uraian')return h+(window.bsViewUraian?bsViewUraian():'');
 if(BS.tab==='analisis')return h+(window.bsViewAnalisis?bsViewAnalisis():'');
 return h+bsViewHasil();
}
/* ringkasan CBT Online (guru): sesi, sesi dibuka, hasil ujian masuk (rata-rata nilai disembunyikan) */
function bsCbtRingkas(){
 if(BS.sf)return '';
 var pm=schPeta(),ses=BS.D.sesi.filter(schAkunOk),buka=ses.filter(function(x){return bsSesiStatus(x).k==='on'}).length;
 var hs=BS.D.hasil.filter(function(x){return x.mode==='ujian'&&schHasilOk(x,pm)});
 return '<div class="stats"><div class="card"><span class="label">Sesi</span><b class="mono">'+ses.length+'</b></div><div class="card"><span class="label">Dibuka</span><b class="mono">'+buka+'</b></div><div class="card"><span class="label">Selesai</span><b class="mono">'+hs.length+'</b></div></div>'+(can('akun')?'<p class="note">Mode ujian: <b>'+(bsAman()?'Aman':'Biasa')+'</b></p>':'');
}

/* ---------- Guru: bank soal ---------- */
function bsFiltered(){
 var f=BS.flt,q=f.q.toLowerCase();
 return bsSoalAll().filter(function(s){
  return (!f.mapel||s.mapel===f.mapel)&&(!f.tipe||s.tipe===f.tipe)&&(!f.tuj||s.tujuan===f.tuj)&&(!q||(s.q+' '+(s.topik||'')+' '+(s.mapel||'')).toLowerCase().indexOf(q)>-1);
 });
}
/* Peta soal yang pernah diubah: salinan dari soal bawaan. Memakai penanda dari (soal baru); salinan lama dicocokkan dari kemiripan teks soal (mapel sama, kata sama minimal 60%). Disimpan sementara per daftar soal. */
function bsSalinPeta(){
 var all=bsSoalAll();if(BS.sm&&BS.smFor===all)return BS.sm;
 var m={b:{},s:{}},baw=all.filter(function(x){return x.bawaan}),kb={};
 function kata(t){var o={},n=0;String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').forEach(function(w){if(w.length>2&&!o[w]){o[w]=1;n++}});o.n=n;return o}
 baw.forEach(function(b){kb[b.id]=kata(b.q)});
 all.forEach(function(x){
  if(x.bawaan)return;
  if(x.dari&&kb[x.dari]){m.b[x.dari]=1;m.s[x.id]=x.dari;return}
  var kx=kata(x.q),best=0,bid='';if(!kx.n)return;
  baw.forEach(function(b){
   if(b.mapel!==x.mapel)return;
   var k2=kb[b.id],i=0;for(var w in kx){if(w!=='n'&&k2[w])i++}
   var j=i/(kx.n+k2.n-i);if(j>best){best=j;bid=b.id}
  });
  if(best>=0.6){m.b[bid]=1;m.s[x.id]=bid}
 });
 BS.sm=m;BS.smFor=all;return m;
}
function bsPilUbah(s,pm){
 if(s.dib)return '<span class="pill warn" title="Terakhir diubah '+esc(bsWaktu(s.dib))+'">Diubah · '+esc(bsWaktu(s.dib).split(',')[0].split(' pukul')[0])+'</span>';
 if(s.bawaan&&pm.b[s.id])return '<span class="pill warn" title="Soal bawaan ini sudah disalin dan diubah menjadi soal sendiri">Sudah disalin dan diubah</span>';
 if(!s.bawaan&&pm.s[s.id])return '<span class="pill warn" title="Hasil salin dan ubah dari soal bawaan">Diubah dari bawaan</span>';
 return '';
}
/* ---------- Cek soal duplikat ---------- */
function bsDupTok(t){var o={},n=0;String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').forEach(function(w){if(w.length>2&&!o[w]){o[w]=1;n++}});return {s:o,n:n}}
function bsDupJac(a,b){if(!a.n||!b.n)return 0;var i=0,w;for(w in a.s)if(b.s[w])i++;return i/(a.n+b.n-i)}
function bsDupNorm(t){return String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function bsDupTeks(x){return x.q+' '+(x.opts?x.opts.join(' '):'')+' '+(x.rows?x.rows.map(function(r){return r[0]}).join(' '):'')}
/* Kelompok duplikat: soal sejenis dalam satu mapel dengan teks soal sama persis, teks soal sangat mirip (80% kata sama),
   atau soal beserta pilihan/pernyataan 75% sama. Hasil disimpan sementara per daftar soal dan mapel terpilih. */
function bsDupGrup(){
 var all=bsSoalAll(),mp=BS.flt.mapel||'';
 if(BS.dg&&BS.dgA===all&&BS.dgM===mp)return BS.dg;
 var src=all.filter(function(x){return !mp||x.mapel===mp}),bk={},par={},T={};
 function fi(a){while(par[a]!==a){par[a]=par[par[a]];a=par[a]}return a}
 src.forEach(function(x){par[x.id]=x.id;T[x.id]={q:bsDupTok(x.q),f:bsDupTok(bsDupTeks(x)),n:bsDupNorm(x.q)};(bk[(x.mapel||'')+'|'+x.tipe]=bk[(x.mapel||'')+'|'+x.tipe]||[]).push(x)});
 Object.keys(bk).forEach(function(k){
  var L=bk[k];
  for(var i=0;i<L.length;i++)for(var j=i+1;j<L.length;j++){
   var a=L[i],b=L[j],ta=T[a.id],tb=T[b.id];
   if((ta.n&&ta.n===tb.n)||bsDupJac(ta.q,tb.q)>=0.8||bsDupJac(ta.f,tb.f)>=0.75){var ra=fi(a.id),rb=fi(b.id);if(ra!==rb)par[rb]=ra}
  }
 });
 var gr={};src.forEach(function(x){var r=fi(x.id);(gr[r]=gr[r]||[]).push(x)});
 var out=Object.keys(gr).map(function(k){return gr[k]}).filter(function(a){return a.length>1});
 out.forEach(function(a){a.sort(function(x,y){return (y.bawaan?1:0)-(x.bawaan?1:0)||String(x.id).localeCompare(String(y.id))})});
 out.sort(function(a,b){return b.length-a.length||String(a[0].mapel).localeCompare(String(b[0].mapel))||String(a[0].id).localeCompare(String(b[0].id))});
 BS.dg=out;BS.dgA=all;BS.dgM=mp;return out;
}
function bsDupHtml(){
 var g=bsDupGrup(),pm=bsSalinPeta(),tot=g.reduce(function(t,a){return t+a.length},0),mp=BS.flt.mapel||'';
 var h='<div class=\"card\"><div class=\"row sb\"><b>Cek soal duplikat</b><button type=\"button\" class=\"btn small\" data-bs=\"dupx\">Tutup</button></div><p class=\"note\">'+(mp?esc(mp):'Semua mapel')+' · '+g.length+' kelompok ('+tot+' soal). Dianggap duplikat bila teks soal sama persis, teks soal 80% sama, atau soal dan pilihannya 75% sama. Hanya soal sejenis dalam satu mapel yang dibandingkan. Pilih Mapel di filter untuk mempersempit.</p></div>';
 if(!g.length)return h+'<p class=\"muted center\" style=\"padding:20px 0\">Tidak ditemukan soal duplikat.</p>';
 h+=g.slice(0,40).map(function(a,i){
  return '<div class=\"card\"><div class=\"row sb\"><b>Kelompok '+(i+1)+'</b><span class=\"pill plain\">'+a.length+' soal</span></div>'+a.map(function(x){
   var op=BS.open[x.id];
   return '<div style=\"border-top:1px solid var(--line);margin-top:10px;padding-top:10px\"><div class=\"row bs-tags\"><span class=\"pill plain\">'+BS_TIPE[x.tipe]+'</span>'+(x.bawaan?'<span class=\"pill plain\">Bawaan</span>':'<span class=\"pill\">Soal sendiri</span>')+bsPilUbah(x,pm)+(x.aktif?'':'<span class=\"pill bad\">Nonaktif</span>')+'</div>'+
    '<p class=\"bs-qs\">'+esc(String(x.q).slice(0,160))+(String(x.q).length>160?'…':'')+'</p><p class=\"note mono\">'+esc(x.id)+(x.topik?' · '+esc(x.topik):'')+'</p>'+
    '<div class=\"row\"><button type=\"button\" class=\"btn small\" data-bs=\"lihat\" data-q=\"'+x.id+'\">'+(op?'Tutup':'Lihat')+'</button><button type=\"button\" class=\"btn small\" data-bs=\"aktif\" data-q=\"'+x.id+'\">'+(x.aktif?'Nonaktifkan':'Aktifkan')+'</button>'+(!x.bawaan?'<button type=\"button\" class=\"btn small danger\" data-bs=\"hapussoal\" data-q=\"'+x.id+'\">Hapus</button>':'')+'</div>'+(op?bsRev(x,null,'',true):'')+'</div>';
  }).join('')+'</div>';
 }).join('');
 if(g.length>40)h+='<p class=\"note center\">'+(g.length-40)+' kelompok lainnya tidak ditampilkan. Pilih Mapel untuk melihatnya.</p>';
 return h;
}
function bsListIsi(){return BS.dup?bsDupHtml():bsBankList()}
function bsBankList(){
 var all=bsFiltered(),sh=all.slice(0,BS.flt.n);
 return sh.map(function(s){
  var op=BS.open[s.id],ar=bsAturanSalah(s),pm=bsSalinPeta();
  return '<div class="card"><div class="row bs-tags"><span class="pill plain">'+esc(s.mapel||'')+'</span><span class="pill plain">'+BS_TIPE[s.tipe]+'</span>'+(s.bawaan?'<span class="pill plain">Bawaan</span>':'<span class="pill">Soal sendiri</span>')+bsPilUbah(s,pm)+(s.gs?'<span class="pill plain">Grup stimulus</span>':'')+(window.btrPill?btrPill(s.id):'')+(s.aktif?'':'<span class="pill bad">Nonaktif</span>')+(ar?'<span class="pill warn">Belum sesuai aturan</span>':'')+'</div>'+
   '<p class="bs-qs">'+esc(String(s.q).slice(0,150))+(String(s.q).length>150?'…':'')+'</p>'+
   (s.topik?'<p class="note">Topik: '+esc(s.topik)+(s.kelas?' · Kelas '+esc(s.kelas):'')+'</p>':'')+
   (window.cpNote?cpNote(s.id):'')+
   (ar?'<p class="note">Belum sesuai aturan ('+ar+'), hanya dipakai untuk latihan. Ubah soal agar bisa masuk ujian.</p>':'')+'<label class="f">Peruntukan<select data-bs="tuj" data-q="'+s.id+'">'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(s.tujuan===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label>'+
   '<div class="row"><button type="button" class="btn small" data-bs="lihat" data-q="'+s.id+'">'+(op?'Tutup':'Lihat')+'</button><button type="button" class="btn small" data-bs="aktif" data-q="'+s.id+'">'+(s.aktif?'Nonaktifkan':'Aktifkan')+'</button>'+
   '<button type="button" class="btn small" data-bs="'+(s.bawaan?'salin':'ubah')+'" data-q="'+s.id+'">'+(s.bawaan?'Salin dan ubah':'Ubah')+'</button>'+
   (!s.bawaan?'<button type="button" class="btn small danger" data-bs="hapussoal" data-q="'+s.id+'">Hapus</button>':'')+'</div>'+
   (op?bsRev(s,null,'',true):'')+'</div>';
 }).join('')+(all.length>sh.length?'<button type="button" class="btn" data-bs="lagi">Tampilkan lebih banyak ('+(all.length-sh.length)+')</button>':'')+(all.length?'':'<p class="muted">Tidak ada soal yang cocok.</p>');
}
function bsViewBank(){
 var all=bsSoalAll(),c={latihan:0,ujian:0,keduanya:0,off:0};
 all.forEach(function(s){if(!s.aktif)c.off++;else c[bsTujEf(s)]++});
 var f=BS.flt,mp=bsMapelList(),cnt=bsMapelHitung(all);
 return '<div class="stats"><div class="card"><span class="label">Total</span><b class="mono">'+all.length+'</b></div><div class="card"><span class="label">Latihan</span><b class="mono">'+(c.latihan+c.keduanya)+'</b></div><div class="card"><span class="label">Ujian</span><b class="mono">'+(c.ujian+c.keduanya)+'</b></div></div>'+
  '<button type="button" class="btn" data-bs="dup" aria-pressed="'+(!!BS.dup)+'">'+(BS.dup?'Kembali ke daftar soal':'Cek soal duplikat')+'</button>'+'<button type="button" class="btn primary" data-bs="baru">Tambah soal sendiri</button>'+
  '<div class="card"><label class="f">Cari<input id="bq-q" type="search" value="'+esc(f.q)+'" placeholder="Kata dalam soal atau topik"></label><div class="two"><label class="f">Mapel<select data-bs="flt" data-k="mapel"><option value="">Semua</option>'+bsMapelOptHtml(mp,f.mapel,cnt)+'</select></label>'+
  '<label class="f">Jenis<select data-bs="flt" data-k="tipe"><option value="">Semua</option>'+Object.keys(BS_TIPE).map(function(t){return '<option value="'+t+'"'+(f.tipe===t?' selected':'')+'>'+BS_TIPE[t]+'</option>'}).join('')+'</select></label></div>'+
  '<label class="f">Peruntukan<select data-bs="flt" data-k="tuj"><option value="">Semua</option>'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(f.tuj===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label>'+(c.off?'<p class="note">'+c.off+' soal nonaktif.</p>':'')+'</div>'+
  '<div class="stack" id="bq-list">'+bsListIsi()+'</div>'+'';
}
/* Menu khusus guru/admin: riwayat latihan semua siswa (hasil ujian ada di CBT Online > Hasil) */
BS.rl={q:'',kelas:'',mapel:'',n:20};
ICO.riwayatlatihan='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
function bsRlRows(){
 var pm=schPeta(),f=BS.rl,q=String(f.q||'').trim().toLowerCase();
 return BS.D.hasil.filter(function(x){
  if(x.mode!=='latihan'||!schHasilOk(x,pm))return false;
  if(f.kelas&&(x.kelas||'')!==f.kelas)return false;
  if(f.mapel&&bsJudul(x).indexOf(f.mapel)!==0)return false;
  if(q&&String(x.siswa||'').toLowerCase().indexOf(q)<0)return false;
  return true;
 }).sort(function(a,b){return b.ts-a.ts});
}
function bsRlList(){
 var rows=bsRlRows(),mx=BS.rl.n||20,avg=rows.length?Math.round(rows.reduce(function(t,x){return t+(+x.score||0)},0)/rows.length):0;
 if(!rows.length)return '<p class="muted center" style="padding:20px 0">Belum ada latihan yang cocok.</p>';
 return '<p class="note">'+rows.length+' latihan · rata-rata nilai <b class="mono">'+avg+'</b></p>'+rows.slice(0,mx).map(function(x){
  return '<div class="card"><div class="row sb"><span class="row"><span class="pill ok">Latihan</span><b>'+esc(x.siswa||'Tanpa nama')+'</b></span><b class="mono">'+x.score+'</b></div><div class="row sb"><span class="note">Kelas '+esc(x.kelas||'-')+' · '+esc(bsJudul(x))+'<br>'+bsWaktu(x.ts)+' · '+x.benar+' benar dari '+x.total+' · '+Math.max(1,Math.round((x.detik||0)/60))+' menit</span><button type="button" class="btn small" data-bs="detail" data-v="'+x.id+'">Detail</button></div></div>';
 }).join('')+(rows.length>mx?'<button type="button" class="btn" data-bs="rlmore">Tampilkan lebih banyak ('+(rows.length-mx)+' lagi)</button>':'');
}
function bsViewRiwayatLatihan(){
 var pm=schPeta(),f=BS.rl,all=BS.D.hasil.filter(function(x){return x.mode==='latihan'&&schHasilOk(x,pm)}),kl={},mp={};
 all.forEach(function(x){if(x.kelas)kl[x.kelas]=1;var m=bsJudul(x);if(m&&m!=='Latihan soal'&&m.indexOf(' + ')<0)mp[m]=1});
 bsMapelList().forEach(function(m){mp[m]=1});
 var sel=function(k,lab,o){return '<label class="f">'+lab+'<select data-bs="rlf" data-k="'+k+'"><option value="">Semua</option>'+(k==='mapel'?bsMapelOptHtml(Object.keys(o),f[k]):Object.keys(o).sort().map(function(v){return '<option'+(f[k]===v?' selected':'')+'>'+esc(v)+'</option>'}).join(''))+'</select></label>'};
 return '<div class="card"><label class="f">Cari nama siswa<input id="rl-q" type="search" value="'+esc(f.q)+'" placeholder="Nama siswa"></label><div class="two">'+sel('kelas','Kelas',kl)+sel('mapel','Mapel',mp)+'</div></div><div class="stack" id="rl-list">'+bsRlList()+'</div>';
}

/* ---------- Guru: form soal ---------- */
function bsNewForm(s){
 var f={id:s?s.id:'',tipe:s?s.tipe:'pg',mapel:s?s.mapel:'',topik:s?(s.topik||''):'',kelas:s?(s.kelas||''):'',tujuan:s?s.tujuan:'keduanya',q:s?s.q:'',opts:['','','','',''],kunci:[],rows:[],lab:['Benar','Salah'],bahas:s?(s.bahas||''):'',qi:s?(s.qi||''):'',oi:['','','','',''],gs:s?(s.gs||''):'',st:s?(s.st||''):'',si:s?(s.si||''):'',gn:s?(s.gn||0):0,rub:[],kj:s?(s.kj||''):'',bobot:s&&s.bobot>0?s.bobot:2,pj:s&&s.pj>0?s.pj:1500};
 if(s&&Array.isArray(s.rub))f.rub=s.rub.map(function(r){return [r[0],r[1]]});
 while(f.rub.length<6)f.rub.push(['','']);
 if(s&&Array.isArray(s.oi))s.oi.forEach(function(g,i){if(i<5)f.oi[i]=g||''});
 if(s&&s.opts){s.opts.forEach(function(t,i){f.opts[i]=t});f.kunci=Array.isArray(s.kunci)?s.kunci.slice():[s.kunci]}
 if(s&&s.rows){f.rows=s.rows.map(function(r){return [r[0],r[1]]});var li=bsLabIdx(s.lab||['Benar','Salah']);f.lab=BS_LABS[li<0?0:li].slice()}
 while(f.rows.length<6)f.rows.push(['',true]);
 return f;
}
function bsFormRead(){
 var f=BS.form;if(!f||!document.getElementById('bf-q'))return;
 function v(id){var e=document.getElementById(id);return e?e.value:''}
 var stE=document.getElementById('bf-st');if(stE)f.st=stE.value;
 f.mapel=v('bf-mapel');f.topik=v('bf-topik');f.kelas=v('bf-kelas');f.tujuan=v('bf-tujuan')||f.tujuan;f.q=v('bf-q');f.bahas=v('bf-bahas');
 if(f.tipe==='uraian'){f.kj=v('bf-kj');f.bobot=+v('bf-bobot')||2;f.pj=+v('bf-pj')||1500;for(var u=0;u<6;u++){var ut=document.getElementById('bf-ut'+u),us=document.getElementById('bf-us'+u);if(ut)f.rub[u]=[ut.value,us?us.value:'']}}
 for(var i=0;i<5;i++){var e=document.getElementById('bf-o'+i);if(e)f.opts[i]=e.value}
 f.kunci=$$('.bf-k').filter(function(x){return x.checked}).map(function(x){return +x.value});
 if(f.tipe==='kategori'){
  f.lab=BS_LABS[+v('bf-lab')===1?1:0].slice();
  for(var j=0;j<6;j++){var t=document.getElementById('bf-r'+j),k=document.getElementById('bf-rk'+j);if(t)f.rows[j]=[t.value,k?k.value==='0':true]}
 }
}
function bsViewForm(){
 var f=BS.form,mp=bsMapelList(),h='<div class="row"><button type="button" class="btn small" data-bs="batalform">Batal</button><h2>'+(f.id?'Ubah soal':'Soal baru')+'</h2></div><div class="card">';
 h+='<div class="seg bs4">'+Object.keys(BS_TIPE).map(function(t){return '<button type="button" data-bs="ftipe" data-v="'+t+'" aria-pressed="'+(f.tipe===t)+'">'+BS_TIPE[t]+'</button>'}).join('')+'</div>';
 h+='<label class="f">Mata pelajaran<span class="bf-mprow"><input id="bf-mapel" value="'+esc(f.mapel)+'" placeholder="Ketik mapel baru atau ketuk Pilih" autocomplete="off"><button type="button" class="btn" data-bs="pilmapel">Pilih</button></span></label>';
 h+='<label class="f">Topik (opsional)<input id="bf-topik" value="'+esc(f.topik)+'"></label>';
 h+='<div class="two"><label class="f">Kelas<select id="bf-kelas">'+[['','Semua kelas'],['X','Kelas X'],['XI','Kelas XI'],['XII','Kelas XII']].map(function(k){return '<option value="'+k[0]+'"'+(f.kelas===k[0]?' selected':'')+'>'+k[1]+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Peruntukan<select id="bf-tujuan">'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(f.tujuan===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label></div>';
 if(f.tipe==='uraian')h+='<p class="note">Soal uraian dinilai guru pada ujian. Pada latihan, siswa mengisi jawaban lalu membandingkannya dengan kunci/rubrik (tidak dinilai). Default Peruntukan: Ujian, agar soal ujian tidak bocor ke latihan; pilih Latihan atau Latihan dan ujian bila boleh dilatih. Bukan bentuk soal TKA, jadi jangan dipakai untuk simulasi TKA.</p>';
 if(window.sgrFormHtml)h+=sgrFormHtml(f);
 h+='<label class="f">Teks soal<textarea id="bf-q" rows="4">'+esc(f.q)+'</textarea></label>';
 if(window.sgFormBox)h+=sgFormBox(f,'q');
 if(f.tipe==='uraian')h+=bsUraianForm(f);
 else if(f.tipe==='kategori'){
  h+='<label class="f">Pilihan jawaban<select id="bf-lab" data-bs="flab">'+BS_LABS.map(function(l,i){return '<option value="'+i+'"'+(bsLabIdx(f.lab)===i?' selected':'')+'>'+esc(l[0]+' / '+l[1])+'</option>'}).join('')+'</select></label><p class="note">Wajib 3 sampai 6 pernyataan.</p>';
  h+=f.rows.map(function(r,i){return '<div class="two"><label class="f">Pernyataan '+(i+1)+(i<3?' (wajib)':'')+'<input id="bf-r'+i+'" value="'+esc(r[0])+'"></label><label class="f">Kunci<select id="bf-rk'+i+'"><option value="0"'+(r[1]?' selected':'')+'>'+esc(f.lab[0])+'</option><option value="1"'+(r[1]?'':' selected')+'>'+esc(f.lab[1])+'</option></select></label></div>'}).join('');
 }else{
   h+=[0,1,2,3,4].map(function(i){return '<div class="row bs-orow"><input class="bf-k" type="'+(f.tipe==='pg'?'radio':'checkbox')+'" name="bf-kunci" value="'+i+'" aria-label="Kunci '+bsLtr(i)+'"'+(f.kunci.indexOf(i)>-1?' checked':'')+'><div class="grow"><label class="f">Pilihan '+bsLtr(i)+'<input id="bf-o'+i+'" value="'+esc(f.opts[i])+'"></label>'+(window.sgFormBox?sgFormBox(f,i):'')+'</div></div>'}).join('');h+='<p class="note">'+(f.tipe==='pg'?'Wajib 5 pilihan (A sampai E), tandai tepat satu kunci.':'Wajib 5 pilihan (A sampai E), tandai minimal 2 kunci.')+' Tiap pilihan boleh berisi teks, gambar, atau keduanya.</p>';
 }
 h+='<label class="f">Pembahasan (opsional)<textarea id="bf-bahas" rows="3">'+esc(f.bahas)+'</textarea></label>';
 h+='<button type="button" class="btn primary" data-bs="simpansoal">Simpan soal</button></div>';
 return h;
}
function bsUraianForm(f){
 var tot=Math.round(f.rub.reduce(function(a,r){return a+(+r[1]||0)},0)*100)/100;
 return '<p class="note">Rubrik penilaian: isi 1 sampai 6 kriteria beserta skor tiap kriteria. Skor maksimum soal = jumlah skor kriteria (sekarang '+tot+').</p>'+
  f.rub.map(function(r,i){return '<div class="two"><label class="f">Kriteria '+(i+1)+(i<1?' (wajib)':'')+'<input id="bf-ut'+i+'" value="'+esc(r[0])+'" placeholder="Contoh: Menyebut 3 langkah dengan benar"></label><label class="f">Skor<input id="bf-us'+i+'" type="number" inputmode="decimal" min="0" max="100" step="0.5" value="'+esc(r[1])+'"></label></div>'}).join('')+
  '<label class="f">Kunci jawaban / pedoman (hanya guru yang melihat sebelum dinilai)<textarea id="bf-kj" rows="4">'+esc(f.kj)+'</textarea></label>'+
  '<div class="two"><label class="f">Bobot terhadap soal PG (1 = sama)<input id="bf-bobot" type="number" inputmode="decimal" min="0.5" max="10" step="0.5" value="'+esc(f.bobot)+'"></label><label class="f">Batas karakter jawaban<input id="bf-pj" type="number" inputmode="numeric" min="100" max="3000" step="50" value="'+esc(f.pj)+'"></label></div>';
}
function bsFormSave(){
 bsFormRead();var f=BS.form,q=String(f.q).trim(),mapel=String(f.mapel).trim();
 if(!mapel){toast('Isi mata pelajaran');return}
 if(!q){toast('Isi teks soal');return}
 var o={id:f.id||uid(),ts:Date.now(),tipe:f.tipe,mapel:mapel.slice(0,64),topik:String(f.topik).trim().slice(0,120),kelas:f.kelas,tujuan:f.tujuan,aktif:true,oleh:S.user.nama.slice(0,64),q:q,bahas:String(f.bahas).trim()};
 var ex=BS.D.soal.filter(function(x){return x.id===o.id})[0];if(ex){o.aktif=ex.aktif!==false;o.oleh=ex.oleh||o.oleh}
 if(ex||f.salin)o.dib=Date.now();
 if(ex&&ex.dari)o.dari=ex.dari;else if(f.salin&&f.dari)o.dari=f.dari;/* penanda: soal ini pernah diubah (atau salinan yang diubah dari soal bawaan) */
 if(f.tipe==='uraian'){
  var rb=f.rub.filter(function(r){return String(r[0]).trim()}).map(function(r){return [String(r[0]).trim().slice(0,120),Math.round((+r[1]||0)*100)/100]});
  if(!rb.length){toast('Isi minimal 1 kriteria rubrik');return}
  if(rb.some(function(r){return !(r[1]>0)})){toast('Setiap kriteria harus punya skor lebih dari 0');return}
  var mk=Math.round(rb.reduce(function(a,r){return a+r[1]},0)*100)/100;
  if(mk>100){toast('Total skor rubrik maksimal 100');return}
  o.rub=rb;o.maks=mk;o.kj=String(f.kj||'').trim().slice(0,3000);o.bobot=Math.max(0.5,Math.min(10,+f.bobot||2));o.pj=Math.max(100,Math.min(3000,Math.round(+f.pj||1500)));
 }else if(f.tipe==='kategori'){
  var li2=bsLabIdx(f.lab);
  if(li2<0){toast('Pilih pasangan jawaban: Benar/Salah atau Sesuai/Tidak Sesuai');return}
  var rows=f.rows.filter(function(r){return String(r[0]).trim()}).map(function(r){return [String(r[0]).trim(),!!r[1]]});
  if(rows.length<3){toast('Isi minimal 3 pernyataan (maksimal 6)');return}
  o.lab=BS_LABS[li2].slice();o.rows=rows;
 }else{
  if(f.opts.some(function(t,i){return !String(t).trim()&&!(Array.isArray(f.oi)&&f.oi[i])})){toast('Isi kelima pilihan (A sampai E): teks atau gambar');return}
  var opts=f.opts.map(function(t){return String(t).trim()});
  var ks=f.kunci.filter(function(i){return i>=0&&i<5});
  if(f.tipe==='pg'){if(ks.length!==1){toast('Tandai tepat satu kunci');return}o.kunci=ks[0]}
  else{if(ks.length<2){toast('Centang minimal 2 kunci');return}o.kunci=ks}
  o.opts=opts;
  if(Array.isArray(f.oi)&&f.oi.some(function(g){return g}))o.oi=f.oi.slice(0,5);
 }
 if(f.qi)o.qi=f.qi;
 if(f.gs){
  var stx=String(f.st||'').trim().slice(0,(window.SGR&&SGR.MAXT)||3000);
  if(!stx&&!f.si){toast('Isi teks atau gambar stimulus, atau pilih Tanpa stimulus');return}
  o.gs=f.gs;o.gn=f.gn||1;if(stx)o.st=stx;if(f.si)o.si=f.si;
 }
 BS.form=null;
 (window.sgStash?sgStash(o):Promise.resolve(o)).then(function(){return bsPut('soal',o)}).then(function(ok){if(window.sgrSebar)sgrSebar(o);toast(ok?'Soal tersimpan':'Soal tersimpan di perangkat, menunggu terkirim');render();bsPosPulih()});
 render();bsPosPulih();
}

/* ---------- Guru: sesi ujian ---------- */
function bsViewSesi(){
 var ss=BS.D.sesi.filter(schAkunOk).sort(function(a,b){return (b.ts||0)-(a.ts||0)}),h='<button type="button" class="btn primary" data-bs="sesibaru">Buat sesi ujian</button>';
 if(!ss.length)h+='<p class="muted">Belum ada sesi ujian.</p>';
 h+=ss.map(function(s){
  var st=bsSesiStatus(s),n=BS.D.hasil.filter(function(x){return x.sesiId===s.id}).length,jml=bsJmlTxt(s)+((s.pilih!=='manual'&&s.mapelF&&s.mapelF.length)?' ('+s.mapelF.join(', ')+')':'');
  return '<div class="card"><div class="row sb"><b>'+esc(s.judul)+'</b><span class="pill '+st.c+'">'+st.t+'</span></div><p class="note">'+schLabelModul(s.sekolah)+' · Kelas '+esc(bsKlsLabel(s))+(s.rmb&&s.rmb.length?' ('+s.rmb.length+' rombel)':'')+' · '+jml+' · '+(s.durasi||0)+' menit · KKM '+(s.kkm||S.kkm)+'</p><p class="note">'+(s.mulai?'Mulai '+bsWaktu(s.mulai):'Tanpa jadwal mulai')+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+' · '+n+' pengumpulan'+(s.acak!==false?' · diacak':'')+(s.tampil?' · pembahasan ditampilkan':'')+'</p>'+
   '<div class="row"><button type="button" class="btn small" data-bs="sesiubah" data-q="'+s.id+'">Ubah</button><button type="button" class="btn small" data-bs="sesiaktif" data-q="'+s.id+'">'+(s.aktif===false?'Aktifkan':'Nonaktifkan')+'</button><button type="button" class="btn small" data-bs="sesihasil" data-q="'+s.id+'">Lihat hasil</button><button type="button" class="btn small" data-bs="sesigandakan" data-q="'+s.id+'">Gandakan</button><button type="button" class="btn small danger" data-bs="sesihapus" data-q="'+s.id+'">Hapus</button></div></div>';
 }).join('');
 return h;
}
/* geser waktu n hari kerja ke depan (Sabtu dan Minggu dilewati); 0 tetap 0 */
function bsGeserKerja(ts,n){
 if(!ts)return 0;
 var d=new Date(ts),k=0;
 while(k<n){d.setDate(d.getDate()+1);var w=d.getDay();if(w!==0&&w!==6)k++}
 return d.getTime();
}
function bsNewSesi(s){
 return s?{id:s.id,judul:s.judul,kelas:s.kelas||'ALL',durasi:s.durasi||60,jumlah:s.jumlah||20,jns:bsJnsForm(s),pilih:s.pilih||'otomatis',mapelF:(s.mapelF||[]).slice(),ids:(s.ids||[]).slice(),acak:s.acak!==false,tampil:!!s.tampil,kkm:s.kkm||S.kkm,mulai:s.mulai||0,selesai:s.selesai||0,aktif:s.aktif!==false,sekolah:s.sekolah||'',q:'',tok:!!s.tok,tokR:!!s.tokR,tokP:BS.tk[s.id]||s.tokP||'',batas:s.batas||0,aksi:s.aksi||'peringatan',layar:!!s.layar,exambro:!!s.exambro,seb:!!s.seb,ruang:(s.ruang||[]).map(function(r){return Object.assign({},r,{sis:(r.sis||[]).slice()})}),pes:Array.isArray(s.pes)?s.pes.slice():null,pesTs:s.pesTs||0,rmb:Array.isArray(s.rmb)?s.rmb.slice():[],pesRmb:(Array.isArray(s.rmb)&&s.rmb.length)?1:0,nomor:s.nomor?Object.assign({},s.nomor):null}:
  {id:'',judul:'',kelas:'ALL',durasi:60,jumlah:20,jns:null,pilih:'otomatis',mapelF:[],ids:[],acak:true,tampil:false,kkm:S.kkm,mulai:0,selesai:0,aktif:true,sekolah:schKode()||'',q:'',tok:false,tokR:bsAman(),tokP:'',batas:0,aksi:'peringatan',layar:false,exambro:false,seb:false,ruang:[],pes:null,pesTs:0,rmb:[],nomor:null};
}
function bsSfRead(){
 var f=BS.sf;if(!f||!document.getElementById('sf-judul'))return;
 function v(id){var e=document.getElementById(id);return e?e.value:''}
 function c(id){var e=document.getElementById(id);return !!(e&&e.checked)}
 f.judul=v('sf-judul');var rk=document.querySelector('.sf-kls:checked');if(rk)f.kelas=rk.value==='ALL'?'ALL':bsKlsNilai([rk.value]);if(document.getElementById('sf-sekolah'))f.sekolah=v('sf-sekolah');f.durasi=+v('sf-durasi')||0;f.pilih=v('sf-pilih')||f.pilih;f.kkm=+v('sf-kkm')||f.kkm;
 if(document.getElementById('sf-jumlah'))f.jumlah=+v('sf-jumlah')||0;
 if(document.getElementById('sf-jm')){
  if(v('sf-jm')==='jenis'){
   var jj={};['pg','kompleks','kategori','uraian'].forEach(function(t){var e=document.getElementById('sf-jn-'+t);jj[t]=e?Math.max(0,Math.min(200,parseInt(e.value,10)||0)):(f.jns?(f.jns[t]||0):(t==='pg'?(f.jumlah||0):0))});
   f.jns=jj;
  }else f.jns=null;
 }
 f.acak=c('sf-acak');f.tampil=c('sf-tampil');f.aktif=c('sf-aktif');
 if(document.getElementById('sf-tok')){f.tok=c('sf-tok');if(document.getElementById('sf-tokr'))f.tokR=c('sf-tokr');f.tokP=v('sf-tokp').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);f.batas=Math.max(0,Math.min(50,+v('sf-batas')||0));f.aksi=v('sf-aksi')||'peringatan';f.layar=c('sf-layar');f.exambro=false;f.seb=c('sf-seb')}
 f.mulai=v('sf-mulai')?new Date(v('sf-mulai')).getTime():0;f.selesai=v('sf-selesai')?new Date(v('sf-selesai')).getTime():0;
}
function bsTokenBaru(){var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',t='',b=new Uint32Array(6);try{crypto.getRandomValues(b)}catch(e){for(var i=0;i<6;i++)b[i]=Math.floor(Math.random()*4294967296)}for(var j=0;j<6;j++)t+=A[b[j]%A.length];return t}
/* dasar pool ujian: peruntukan ujian/keduanya, lolos aturan TKA, soal bawaan dikecualikan di mode aman. kls kosong = semua kelas */
function bsSfBase(kls){return bsPool('ujian',kls||'').filter(function(q){return !bsAman()||!q.bawaan})}
function bsSfPoolFor(f,kls){var mf=f.mapelF||[];return bsSfBase(kls).filter(function(q){return !mf.length||mf.indexOf(q.mapel)>-1})}
/* ringkasan: jumlah per mapel (tanpa batas mapel), per jenis, dan per kelas siswa (soal tanpa kelas dihitung untuk semua kelas) */
function bsSfStat(f){
 var kls=bsSfKls(f),base=bsSfBase(kls),pm={},sel=bsSfPoolFor(f,kls),pt={},pk={};
 base.forEach(function(q){pm[q.mapel]=(pm[q.mapel]||0)+1});
 sel.forEach(function(q){pt[q.tipe]=(pt[q.tipe]||0)+1});
 var pkT={};
 (kls.length?kls:['X','XI','XII']).forEach(function(k){var l=bsSfPoolFor(f,k),c={};l.forEach(function(q){c[q.tipe]=(c[q.tipe]||0)+1});pk[k]=l.length;pkT[k]=c});
 return {base:base.length,pm:pm,sel:sel.length,pt:pt,pk:pk,pkT:pkT};
}
/* daftar kelas yang soalnya kurang dari jumlah diminta (teks siap tampil); kosong = cukup */
function bsSfKurang(f,st){
 var ks=Object.keys(st.pk),out=[];
 var gr=bsGrup(f);
 if(gr){
  ks.forEach(function(k){
   var m=[];
   gr.forEach(function(x){var a=x.t.reduce(function(t,y){return t+((st.pkT[k]||{})[y]||0)},0);if(x.n>0&&a<x.n)m.push(bsGrupNama(x)+' '+a+' dari '+x.n)});
   if(m.length)out.push('Kelas '+k+': '+m.join(', '));
  });
 }else{
  var j=f.jumlah>0?f.jumlah:st.sel;
  if(f.jumlah>0)ks.filter(function(k){return st.pk[k]<j}).forEach(function(k){out.push('Kelas '+k+' hanya mendapat '+st.pk[k]+' soal')});
 }
 return out;
}
function bsSfNote(f){
 var st=bsSfStat(f);
 if(!st.sel)return '<p class="note" style="color:var(--bad)"><b>0 soal ujian tersedia.</b> '+esc(bsSfAlasan(f))+'</p>';
 var h='<p class="note"><b>'+st.sel+' soal ujian tersedia</b> untuk pilihan ini.</p>';
 var tp=Object.keys(BS_TIPE).filter(function(t){return st.pt[t]}).map(function(t){return BS_TIPE[t]+' '+st.pt[t]});
 if(tp.length)h+='<p class="note">Jenis: '+tp.join(' · ')+(st.pt.uraian?'. Soal uraian dinilai manual oleh guru.':'')+'</p>';
 var ks=Object.keys(st.pk);
 if(bsSfKls(f).length!==1)h+='<p class="note">Per kelas siswa: '+ks.map(function(k){return 'Kelas '+k+' '+st.pk[k]}).join(' · ')+'</p>';
 var kr=bsSfKurang(f,st);
 if(kr.length)h+='<p class="note" style="color:var(--warn)"><b>Soal tersedia kurang dari jumlah yang diminta.</b> '+kr.join('; ')+'.</p>';
 return h;
}
function bsSfRefresh(){
 var f=BS.sf;if(!f)return;
 var n=document.getElementById('sf-note');if(n)n.innerHTML=bsSfNote(f);
 var c=document.getElementById('sf-chips');if(c)c.innerHTML=bsSfChips(f);
}
function bsSfChips(f){
 var mp=bsMapelList(),st=bsSfStat(f),sel=f.mapelF||[];
 var extra=sel.filter(function(m){return mp.indexOf(m)<0});
 return '<div class="row" style="margin:2px 0 4px"><button type="button" class="btn small" data-bs="sfmall">Semua mapel</button><button type="button" class="btn small" data-bs="sfmada">Hanya yang ada soal</button></div>'+
  (function(){
   var ada=mp.filter(function(m){return (st.pm[m]||0)>0||sel.indexOf(m)>-1}),kosong=mp.length-ada.length;
   return (ada.length?bsMapelChipsHtml(f.mapelAll?mp:ada,sel,st.pm):'<p class="note">Belum ada mapel yang punya soal ujian untuk kelas ini.</p>')+
    (kosong>0?'<div class="row" style="margin:8px 0 0"><button type="button" class="btn small" data-bs="sfmkosong">'+(f.mapelAll?'Sembunyikan':'Tampilkan')+' '+kosong+' mapel tanpa soal</button></div>':'');
  })()+
  (extra.length?'<span class="label" style="display:block;margin:10px 0 4px">Tidak ada di daftar mapel (ketuk untuk melepas)</span><div class="chips">'+extra.map(function(m){return '<button type="button" data-bs="sfmapel" data-v="'+esc(m)+'" aria-pressed="true">'+esc(m)+'</button>'}).join('')+'</div>':'')+
  (sel.length?'<p class="note" style="margin-top:8px">'+sel.length+' mapel dipilih.</p>':'');
}
function bsSfPool(f){
 return bsPool('ujian',bsSfKls(f)).filter(function(q){return (!bsAman()||!q.bawaan)&&(!(f.mapelF&&f.mapelF.length)||f.mapelF.indexOf(q.mapel)>-1)});
}
/* alasan pool ujian kosong: bawaan tidak dipakai di mode aman, soal sendiri belum memenuhi aturan TKA, peruntukan latihan, kelas/mapel tidak cocok */
function bsSfAlasan(f){
 var kls=bsSfKls(f),aman=bsAman(),bw=0,tkaSalah=0,latihan=0,kelasLain=0,mapelLain=0;
 bsSoalAll().forEach(function(q){
  if(!q.aktif)return;
  if(q.bawaan){if(aman&&(q.tujuan==='keduanya'||q.tujuan==='ujian')&&(!q.kelas||!kls.length||kls.indexOf(q.kelas)>-1))bw++;return}
  if(q.tujuan==='latihan'){latihan++;return}
  if(q.tujuan!=='keduanya'&&q.tujuan!=='ujian')return;
  if(q.kelas&&kls.length&&kls.indexOf(q.kelas)<0){kelasLain++;return}
  if(bsAturanSalah(q)){tkaSalah++;return}
  if(f.mapelF&&f.mapelF.length&&f.mapelF.indexOf(q.mapel)<0){mapelLain++;return}
 });
 var r=[];
 if(bw)r.push(bw+' soal bawaan tidak dipakai untuk ujian di mode CBT aman (kunci jawabannya ada di aplikasi). Pakai Salin dan ubah di Bank soal, lalu set peruntukan Ujian atau Keduanya.');
 if(tkaSalah)r.push(tkaSalah+' soal sendiri belum memenuhi aturan TKA (PG 5 pilihan A sampai E, kompleks kunci minimal 2, kategori 3 sampai 6 pernyataan), jadi hanya masuk latihan.');
 if(latihan)r.push(latihan+' soal sendiri berperuntukan Latihan saja.');
 if(kelasLain)r.push(kelasLain+' soal sendiri untuk kelas lain.');
 if(mapelLain)r.push(mapelLain+' soal sendiri di luar mata pelajaran yang dipilih.');
 if(!r.length)r.push('Belum ada soal sendiri berperuntukan Ujian atau Keduanya.');
 return r.join(' ');
}
/* mode pilih sendiri: daftar bisa disaring (cari, mapel, jenis); tampil paling banyak 120 butir agar HP tetap ringan */
function bsSfManualAll(f){
 var q=String(f.q||'').toLowerCase().trim();
 return bsSfBase(bsSfKls(f)).filter(function(x){return (!f.mf||x.mapel===f.mf)&&(!f.tf||x.tipe===f.tf)&&(!q||(x.q+' '+x.mapel+' '+(x.topik||'')).toLowerCase().indexOf(q)>-1)});
}
function bsSfManual(){
 var f=BS.sf,all=bsSfManualAll(f),list=all.slice(0,120);
 return '<div class="bs-pick" id="sf-list">'+list.map(function(s){return '<label class="bs-pk"><input type="checkbox" class="sf-id" value="'+s.id+'"'+(f.ids.indexOf(s.id)>-1?' checked':'')+'><span><small>'+esc(s.mapel)+' · '+BS_TIPE[s.tipe]+(s.kelas?' · Kelas '+esc(s.kelas):'')+'</small><br>'+esc(String(s.q).slice(0,110))+'</span></label>'}).join('')+
  (all.length>list.length?'<p class="muted" style="padding:10px 12px">Menampilkan '+list.length+' dari '+all.length+' soal. Persempit dengan pencarian, mapel, atau jenis.</p>':'')+
  (list.length?'':'<p class="muted" style="padding:10px 12px">Tidak ada soal ujian yang cocok. '+esc(bsSfAlasan(f))+'</p>')+'</div>';
}
function bsSfManualInfo(f){
 var ok={};bsSfBase(bsSfKls(f)).forEach(function(q){ok[q.id]=1});
 var buang=f.ids.filter(function(id){return !ok[id]}).length,n=bsSfManualAll(f).length;
 return f.ids.length+' soal dipilih · '+n+' cocok dengan filter. Hanya soal berperuntukan ujian atau keduanya yang memenuhi aturan TKA yang tampil.'+(buang?' <span style="color:var(--warn)">'+buang+' soal terpilih sudah tidak memenuhi syarat (kelas, peruntukan, atau aturan TKA) dan akan dilepas saat disimpan.</span>':'');
}
function bsSfManualBar(f){
 var st=bsSfStat({kelas:f.kelas,mapelF:[]});
 var mo='<option value="">Semua mapel</option>'+bsMapelOptHtml(Object.keys(st.pm),f.mf||'',st.pm);
 var to='<option value="">Semua jenis</option>'+Object.keys(BS_TIPE).map(function(t){return '<option value="'+t+'"'+(f.tf===t?' selected':'')+'>'+BS_TIPE[t]+'</option>'}).join('');
 return '<label class="f">Cari soal<input id="sf-q" type="search" value="'+esc(f.q||'')+'" placeholder="Kata dalam soal, mapel, atau topik"></label>'+
  '<div class="two"><label class="f">Mapel<select id="sf-mf">'+mo+'</select></label><label class="f">Jenis<select id="sf-tf">'+to+'</select></label></div>'+
  '<div class="row"><button type="button" class="btn small" data-bs="sfpsemua">Pilih semua yang cocok</button><button type="button" class="btn small" data-bs="sfkosong">Kosongkan pilihan</button></div>'+
  '<p class="note" id="sf-n">'+bsSfManualInfo(f)+'</p>';
}
function bsSfManualRefresh(){
 var f=BS.sf;if(!f)return;
 var l=document.getElementById('sf-list');if(l)l.outerHTML=bsSfManual();
 var n=document.getElementById('sf-n');if(n)n.innerHTML=bsSfManualInfo(f);
}
function bsViewSesiForm(){
 var f=BS.sf,mp=bsMapelList(),oto=f.pilih!=='manual';
 var h='<div class="row"><button type="button" class="btn small" data-bs="sesibatal">Batal</button><h2>'+(f.id?'Ubah sesi':'Sesi ujian baru')+'</h2></div><div class="card">';
 h+='<label class="f">Judul sesi<input id="sf-judul" value="'+esc(f.judul)+'" placeholder="Contoh: Simulasi TKA 1"></label>';
h+='<div class="f"><span class="label">Kelas peserta</span><div class="sf-seg">'+(function(){var cur=bsKls(f);return [['ALL','Semua kelas']].concat(BS_TINGKAT.map(function(t){return [t,'Kelas '+t]})).map(function(k){var on=k[0]==='ALL'?!cur.length:(cur.length===1&&cur[0]===k[0]);return '<label class="bs-ck"><input type="radio" name="sf-kls" class="sf-kls" value="'+k[0]+'"'+(on?' checked':'')+'> '+k[1]+'</label>'}).join('')})()+'</div><small class="muted">'+(bsKls(f).length>1?'Sesi lama ini memakai '+esc(bsKlsLabel(f))+'. Pilih satu tingkat untuk mengubahnya.':'Satu sesi untuk satu tingkat. Rombelnya dipilih di bawah.')+'</small></div>';
 h+='<div id="rmb-box">'+(window.rgRombel?rgRombel(f):'')+'</div>';
 h+='<div class="two"><label class="f">Durasi (menit)<input id="sf-durasi" type="number" inputmode="numeric" min="1" max="300" value="'+f.durasi+'"></label></div>';
 h+='<label class="f">Sekolah<select id="sf-sekolah">'+schOptModul(f.sekolah)+'</select></label>';
 h+='<label class="f">Cara memilih soal<select id="sf-pilih"><option value="otomatis"'+(oto?' selected':'')+'>Otomatis (acak per siswa)</option><option value="manual"'+(oto?'':' selected')+'>Pilih soal sendiri</option></select></label>';
 if(oto){
  var jn=f.jns;
  h+='<label class="f">Jumlah soal ditentukan<select id="sf-jm"><option value="campur"'+(jn?'':' selected')+'>Satu jumlah (semua jenis dicampur)</option><option value="jenis"'+(jn?' selected':'')+'>Per jenis soal</option></select></label>';
  if(jn){
   var nI=function(t,l){return '<label class="f">'+l+'<input id="sf-jn-'+t+'" type="number" inputmode="numeric" min="0" max="200" value="'+(jn[t]||0)+'"></label>'};
   h+='<div class="two">'+nI('pg','PG')+nI('kompleks','PG kompleks')+'</div><div class="two">'+nI('kategori','PG kategori')+nI('uraian','Uraian')+'</div><p class="note" style="margin:-4px 0 8px">Isi 0 untuk jenis yang tidak dipakai. Tiap siswa mendapat soal acak berbeda; uraian ditaruh paling akhir.</p>';
  }else h+='<label class="f">Jumlah soal<input id="sf-jumlah" type="number" inputmode="numeric" min="1" max="200" value="'+f.jumlah+'"></label>';
  h+='<div><span class="label">Batasi mata pelajaran (kosong = semua)</span><div id="sf-chips">'+bsSfChips(f)+'</div></div><div id="sf-note">'+bsSfNote(f)+'</div>';
 }else{
  h+=bsSfManualBar(f)+bsSfManual();
 }
 h+='<label class="bs-ck"><input id="sf-acak" type="checkbox"'+(f.acak?' checked':'')+'> Acak urutan soal dan pilihan jawaban</label>';
 h+='<label class="bs-ck"><input id="sf-tampil" type="checkbox"'+(f.tampil?' checked':'')+'> Tampilkan pembahasan ke siswa setelah selesai</label>';
 h+='<div class="two"><label class="f">KKM<input id="sf-kkm" type="number" inputmode="numeric" min="0" max="100" value="'+f.kkm+'"></label><span></span></div>';
 h+='<div class="two"><label class="f">Dibuka mulai (opsional)<input id="sf-mulai" type="datetime-local" value="'+bsDtv(f.mulai)+'"></label><label class="f">Ditutup (opsional)<input id="sf-selesai" type="datetime-local" value="'+bsDtv(f.selesai)+'"></label></div>';
 h+=(window.rgForm?rgForm(f):'');
 h+='<div class="card" style="background:var(--bg)"><b>Pengamanan CBT</b>';
 h+='<label class="bs-ck"><input id="sf-tok" type="checkbox"'+(f.tok?' checked':'')+'> Wajib token</label>';
 h+='<div id="sf-tokbox" class="bs-sub"'+(f.tok?'':' hidden')+'>';
 h+=(bsAman()?'<label class="bs-ck"><input id="sf-tokr" type="checkbox"'+(f.tokR?' checked':'')+'> Token dirilis pengawas saat ujian dimulai</label><p class="note" style="margin:-4px 0 0">Berlaku sementara. Kartu peserta tidak memuat token.</p>':'<p class="note" style="margin:0">Token dibacakan pengawas saat ujian dimulai.</p>');
 h+='<div class="row" style="align-items:flex-end"><label class="f grow">Token<input id="sf-tokp" value="'+esc(f.tokP)+'" maxlength="12" autocapitalize="characters" placeholder="Otomatis"></label><button type="button" class="btn small" data-bs="sftoken">Acak</button></div>';
 h+='</div>';
 h+='<div class="two"><label class="f">Batas keluar halaman<input id="sf-batas" type="number" inputmode="numeric" min="0" max="50" value="'+(f.batas||0)+'"></label><label class="f">Bila melewati batas<select id="sf-aksi">'+[['peringatan','Beri peringatan saja'],['kunci','Kunci layar, guru yang membuka'],['kirim','Kirim jawaban otomatis']].map(function(a){return '<option value="'+a[0]+'"'+(f.aksi===a[0]?' selected':'')+'>'+a[1]+'</option>'}).join('')+'</select></label></div>';
 h+='<label class="bs-ck"><input id="sf-layar" type="checkbox"'+(f.layar?' checked':'')+'> Wajib layar penuh (keluar dari layar penuh dihitung pelanggaran)</label>';
 h+='<label class="bs-ck"><input id="sf-seb" type="checkbox"'+(f.seb?' checked':'')+'> Wajib Safe Exam Browser (SEB): hanya bisa dimulai dari SEB dengan file konfigurasi sekolah</label>';
 h+='</div>';
 h+='<label class="bs-ck"><input id="sf-aktif" type="checkbox"'+(f.aktif?' checked':'')+'> Sesi aktif (terlihat oleh siswa)</label>';
 h+='<button type="button" class="btn primary" data-bs="sesisimpan">Simpan sesi</button></div>';
 return h;
}
async function bsSfSave(){
 bsSfRead();var f=BS.sf;
 if(!String(f.judul).trim()){toast('Isi judul sesi');return}
 if(!(f.durasi>0)){toast('Isi durasi dalam menit');return}
 if(f.pilih==='manual'&&!f.ids.length){toast('Pilih minimal satu soal');return}
 if(f.pilih==='manual'){
  var okb={};bsSfBase(bsSfKls(f)).forEach(function(q){okb[q.id]=1});
  var n0=f.ids.length;f.ids=f.ids.filter(function(id){return okb[id]});
  if(!f.ids.length){toast('Tidak ada soal terpilih yang memenuhi syarat ujian');render();return}
  if(f.ids.length<n0)toast((n0-f.ids.length)+' soal tidak memenuhi syarat dan dilepas');
 }
 if(f.pilih!=='manual'){
  if(f.jns&&!bsGrup(f)){toast('Isi jumlah minimal satu jenis soal');return}
  if(!bsSfPool(f).length){toast('Belum ada soal ujian untuk pilihan ini. Lihat keterangan merah di formulir.');return}
  var st=bsSfStat(f),kr=bsSfKurang(f,st);
  if(kr.length&&!(await uiConfirm('Jumlah soal yang diminta ('+bsJmlTxt(f)+') melebihi soal tersedia.\n'+kr.join('\n')+'\nSiswa hanya mendapat soal yang tersedia. Tetap simpan?',{ok:'Tetap simpan'})))return;
 }
 if(f.mulai&&f.selesai&&f.selesai<=f.mulai){toast('Waktu tutup harus setelah waktu mulai');return}
 if(window.rgCek){
  var eg=rgCek(f);if(eg){toast(eg);return}
  var bl=rgBelum(f);
  if(bl&&!(await uiConfirm(bl+' siswa belum ditempatkan di ruang dan tidak bisa mulai ujian. Tetap simpan?',{ok:'Tetap simpan'})))return;
 }
 var ex=BS.D.sesi.filter(function(x){return x.id===f.id})[0];
 var o=Object.assign(ex||{},{id:f.id||uid(),ts:ex?ex.ts:Date.now(),judul:String(f.judul).trim().slice(0,160),kelas:f.kelas,durasi:f.durasi,jumlah:f.pilih==='manual'?f.ids.length:bsGrup(f)?bsGrup(f).reduce(function(a,g){return a+g.n},0):Math.max(1,f.jumlah||1),jns:(f.pilih!=='manual'&&bsGrup(f))?f.jns:undefined,jumlahUr:undefined,acak:f.acak,mulai:f.mulai||0,selesai:f.selesai||0,aktif:f.aktif,kkm:Math.min(100,Math.max(0,f.kkm||0)),oleh:ex?ex.oleh:S.user.nama.slice(0,64),ids:f.ids,pilih:f.pilih,mapelF:f.mapelF,tampil:f.tampil,sekolah:schNorm(f.sekolah)==='ALL'?'':schNorm(f.sekolah),tok:!!f.tok,tokR:!!f.tok&&!!f.tokR&&bsAman(),batas:f.batas||0,aksi:f.aksi||'peringatan',layar:!!f.layar,exambro:!!f.exambro,seb:!!f.seb,ruang:window.rgPak?rgPak(f.ruang):[],pes:Array.isArray(f.pes)?f.pes:undefined,pesTs:Array.isArray(f.pes)?(f.pesTs||Date.now()):undefined,rmb:(Array.isArray(f.pes)&&f.rmb&&f.rmb.length&&bsKls(f).length===1)?f.rmb.slice():undefined,nomor:(Array.isArray(f.pes)&&f.nomor)?{p:String(f.nomor.p||'').slice(0,16),d:Math.max(2,Math.min(5,+f.nomor.d||3)),a:Math.max(0,+f.nomor.a||1)}:undefined});
 if(o.tok){
  if(!f.tokP)f.tokP=bsTokenBaru();
  o.tokP=f.tokP;
  if(!bsAman()){o.tokS=uid();o.tokH=await hashPw(o.tokP,o.tokS)}
 }else{o.tokP='';o.tokH=undefined;o.tokS=undefined}
 BS.sf=null;bsPut('sesi',o).then(function(ok){toast(ok?'Sesi tersimpan':'Sesi tersimpan di perangkat, menunggu terkirim');render()});
 render();
}

/* ---------- Guru: hasil ---------- */
function bsHasilRows(){
 var pm=schPeta();
 return BS.D.hasil.filter(function(h){return schHasilOk(h,pm)&&(BS.hs==='ALL'||(BS.hs==='latihan'?h.mode==='latihan':h.sesiId===BS.hs))}).sort(function(a,b){return b.ts-a.ts});
}
function bsViewHasil(){
 var rows=bsHasilRows(),avg=rows.length?Math.round(rows.reduce(function(s,x){return s+x.score},0)/rows.length):0;
 var ses=BS.D.sesi.filter(schAkunOk).sort(function(a,b){return (b.ts||0)-(a.ts||0)});
 var h='<div class="card"><label class="f">Tampilkan<select data-bs="hs"><option value="ALL"'+(BS.hs==='ALL'?' selected':'')+'>Semua</option><option value="latihan"'+(BS.hs==='latihan'?' selected':'')+'>Latihan siswa</option>'+ses.map(function(s){return '<option value="'+s.id+'"'+(BS.hs===s.id?' selected':'')+'>'+esc(s.judul)+'</option>'}).join('')+'</select></label></div>';
 h+='<div class="stats"><div class="card"><span class="label">Pengumpulan</span><b class="mono">'+rows.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div><div class="card"><span class="label">Tertinggi</span><b class="mono">'+(rows.length?Math.max.apply(null,rows.map(function(x){return x.score})):0)+'</b></div></div>';
 h+='<div class="row"><button type="button" class="btn small" data-bs="ekspor"'+(rows.length?'':' disabled')+'>Ekspor Excel</button></div>';
 if(!rows.length)return h+'<p class="muted">Belum ada hasil.</p>';
 var hmax=BS.hmax||100;
 h+=rows.slice(0,hmax).map(function(x){
  var lat=x.mode==='latihan',kkm=((BS.D.sesi.filter(function(s){return s.id===x.sesiId})[0]||{}).kkm)||S.kkm;
  return '<div class="card"><div class="row sb"><b>'+esc(x.siswa)+'</b><b class="mono">'+x.score+'</b></div><div class="row">'+(x.pend?'<span class="pill warn">'+x.pend+' uraian menunggu</span>':'')+'<span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':x.mode==='arsip'?'Arsip':'Ujian')+'</span>'+(lat||x.mode==='arsip'?'':'<span class="pill '+(x.score>=kkm?'ok':'bad')+'">'+(x.score>=kkm?'Kompeten':'Belum')+'</span>')+'<span class="pill plain">Kelas '+esc(x.kelas||'-')+'</span>'+(x.pindah?'<span class="pill bad">Keluar halaman '+x.pindah+'×</span>':'')+'</div><p class="note">'+esc(bsJudul(x))+' · '+bsWaktu(x.ts)+' · '+x.benar+' benar dari '+x.total+' · '+Math.max(1,Math.round(x.detik/60))+' menit</p><div class="row"><button type="button" class="btn small" data-bs="detail" data-v="'+x.id+'">Detail jawaban</button>'+(!lat&&x.mode==='ujian'&&window.csCetakSatu?'<button type="button" class="btn small" data-bs="hs-cetak" data-v="'+x.id+'">Cetak</button>':'')+(can('hapus')||can('nilai')?'<button type="button" class="btn small danger" data-bs="hapushasil" data-v="'+x.id+'">Hapus</button>':'')+'</div></div>';
 }).join('')+(rows.length>hmax?'<button type="button" class="btn" data-bs="hmore">Tampilkan lebih banyak ('+(rows.length-hmax)+' lagi)</button>':'');
 return h;
}
/* hapus catatan ujian di server (soal_run) bersama hasilnya, jika tidak siswa tetap dianggap sudah selesai dan tidak bisa mengulang */
async function bsHapusRun(h){
 if(!Cloud.on||!h||h.mode!=='ujian'||!h.sesiId)return;
 var ids=['r'+String(h.id).slice(1)];if(window.bsRunId)ids.push(bsRunId(h.sesiId,h.sid));
 for(var i=0;i<ids.length;i++){try{await Cloud.db.deleteDocument(CFG.DB,'soal_run',ids[i])}catch(e){}}
}
function bsExport(){
 if(typeof XLSX==='undefined'){if(window.Pustaka)Pustaka.muat();toast('Pustaka Excel sedang disiapkan. Coba lagi sebentar.');return}
 var rows=bsHasilRows().map(function(x){return {Nama:x.siswa,Kelas:x.kelas||'',Jenis:x.mode==='latihan'?'Latihan':x.mode==='arsip'?'Arsip':'Ujian',Sesi:bsJudul(x),Nilai:x.score,'Status nilai':x.pend?('Sementara, '+x.pend+' uraian belum dinilai'):'Final','Soal benar':x.benar,'Jumlah soal':x.total,'Durasi (menit)':Math.round(x.detik/6)/10,'Keluar halaman':x.pindah||0,Waktu:new Date(x.ts).toLocaleString('id-ID')}});
 var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Hasil');
 XLSX.writeFile(wb,'hasil-bank-soal-'+ymd(Date.now())+'.xlsx');
}

/* ---------- Tampilan utama ---------- */
function viewBankSoal(){
 if(!BS.loaded&&!BS.loading)setTimeout(bsLoad,0);
 /* pindah antara Bank soal dan CBT Online: kembali ke halaman utama menu, kecuali ujian/latihan yang sedang berjalan */
 if(BS.lastTab&&BS.lastTab!==S.tab){if(!(BS.sub==='run'&&BS.run))BS.sub='home';BS.res=null;BS.form=null;BS.sf=null}
 BS.lastTab=S.tab;
 var staff=bsEdit(),cbt=S.tab==='cbtonline',rl=S.tab==='riwayatlatihan',sw=!(staff&&actRole()!=='siswa'),h='<div class="sechead"><span class="ico">'+svg(rl?ICO.riwayatlatihan:cbt?ICO.cbtonline:(sw?ICO.latihan:ICO.banksoal),18)+'</span><h2>'+(rl?'Riwayat latihan siswa':cbt?'CBT Online '+esc(schNama()):(sw?'Latihan Soal Berbasis CBT Online':'Bank soal'))+'</h2></div>';
 if(!BS.loaded)return h+'<p class="muted center" style="padding:32px 0">Memuat soal…</p>';
 if(BS.err.length)h+='<div class="err">'+BS.err.map(esc).join('<br>')+(BS.err.some(function(e){return /collection|not found|could not be found/i.test(e)})?'<br>Koleksi belum dibuat di Appwrite. Jalankan: node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil':'')+'</div>';
 if(BS.sub==='detail'||BS.sub==='result')return h+bsViewResult();
 if(staff&&actRole()!=='siswa')return h+bsViewStaff();
 /* pintasan "Latihan soal" di Beranda: langsung ke Atur latihan (bila tidak ada latihan/ujian yang sedang berjalan) */
 if(BS.cepat){BS.cepat=0;if(!BS.run&&!cbt&&BS.sub==='home')BS.sub='latsetup'}
 return h+bsViewSiswa();
}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-cepat="latihan"]');if(t)BS.cepat=1},true);
var _bsViewKat=viewKatalog;
viewKatalog=function(){
 if(bsOn()&&S.user)return viewBankSoal();
 return _bsViewKat.apply(this,arguments);
};
var _bsRender=render;
render=function(){
 _bsRender.apply(this,arguments);
 try{
  if(!S.user)return;
  bsResume();
  if(BS.run&&bsOn()&&BS.sub==='run')document.body.classList.add('has-bar');
  var sb=document.querySelector('.sbody');
  if(sb&&!sb.querySelector('[data-v="banksoal"]')){
   var sw2=!(isStaff()&&actRole()!=='siswa'),cur=V.mode==='list'?S.tab:'',rk=sb.querySelector('.srow[data-v="rekap"]');
   var html='<button type="button" class="srow" data-act="menu" data-v="banksoal"'+(cur==='banksoal'?' aria-current="page"':'')+'><span class="ico">'+svg(sw2?ICO.latihan:ICO.banksoal,22)+'</span><span class="st"><b>'+(sw2?'Latihan Soal Berbasis CBT Online':'Bank soal')+'</b><small>'+(sw2?'Latihan soal dan riwayat':'Kumpulan soal latihan dan ujian')+'</small></span>'+svg(ICO.chev,18)+'</button>';
   html+='<button type="button" class="srow" data-act="menu" data-v="cbtonline"'+(cur==='cbtonline'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.cbtonline,22)+'</span><span class="st"><b>CBT Online</b><small>'+(isStaff()&&actRole()!=='siswa'?'Sesi, pantau, hasil, analisis':'Ujian online dan riwayat')+'</small></span>'+svg(ICO.chev,18)+'</button>';
   if(rk)rk.insertAdjacentHTML('afterend',html);else sb.insertAdjacentHTML('beforeend',html);
  }
  if(sb&&!sb.querySelector('[data-v="riwayatlatihan"]')&&isStaff()&&actRole()!=='siswa'){
   var cb=sb.querySelector('.srow[data-v="cbtonline"]'),cr=V.mode==='list'?S.tab:'',hr='<button type="button" class="srow" data-act="menu" data-v="riwayatlatihan"'+(cr==='riwayatlatihan'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.riwayatlatihan,22)+'</span><span class="st"><b>Riwayat latihan siswa</b><small>Hasil latihan soal semua siswa</small></span>'+svg(ICO.chev,18)+'</button>';
   if(cb)cb.insertAdjacentHTML('afterend',hr);else sb.insertAdjacentHTML('beforeend',hr);
  }
 }catch(e){}
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('banksoal')<0)NAVTABS.push('banksoal','cbtonline','riwayatlatihan');
if(typeof doLogout==='function'){var _bsLogout=doLogout;doLogout=async function(){bsClear();return _bsLogout.apply(this,arguments)}}
if(typeof refreshData==='function'){var _bsRefresh=refreshData;refreshData=async function(){await _bsRefresh.apply(this,arguments);BS.loaded=false;if(bsOn())render()}}
window.addEventListener('online',function(){if(S.user&&Cloud.on)bsFlushQ()});

/* ---------- Aksi ---------- */
function bsRerenderList(){var el=document.getElementById('bq-list');if(el)el.innerHTML=bsListIsi()}
/* Posisi daftar Bank soal: dicatat saat form Ubah/Salin/Tambah dibuka, dipulihkan saat form ditutup (Batal atau Simpan).
   Kartu soal yang diubah dikembalikan ke tinggi layar yang sama; bila kartunya tidak ada lagi (mis. terfilter), pakai posisi gulir semula. */
function bsPosSimpan(qid){
 var y=window.scrollY||window.pageYOffset||0,top=null;
 try{var el=qid?document.querySelector('#bq-list [data-q="'+String(qid).replace(/([\\"])/g,'\\$1')+'"]'):null,c=el&&el.closest('.card');if(c)top=c.getBoundingClientRect().top}catch(x){}
 BS.pos={id:qid||'',y:y,top:top};
}
function bsPosPulih(){
 var p=BS.pos;if(!p||!document.getElementById('bq-list'))return;
 var y=p.y,sy=window.scrollY||window.pageYOffset||0;
 if(p.id&&p.top!==null){try{var el=document.querySelector('#bq-list [data-q="'+String(p.id).replace(/([\\"])/g,'\\$1')+'"]'),c=el&&el.closest('.card');if(c)y=c.getBoundingClientRect().top+sy-p.top}catch(x){}}
 window.scrollTo(0,Math.max(0,y));
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
 var a=b.dataset.bs,v=b.dataset.v,qid=b.dataset.q,r=BS.run;
 if(a==='home'){BS.sub='home';BS.res=null;render();window.scrollTo(0,0)}
 else if(a==='lanjut'){if(BS.run){BS.sub='run';render()}}
 else if(a==='riwayat'){BS.sub='riwayat';render();window.scrollTo(0,0)}
 else if(a==='detail'){BS.res=v;BS.sub='detail';render();window.scrollTo(0,0)}
 else if(a==='latsetup'){BS.sub='latsetup';render()}
 else if(a==='rlmore'){BS.rl.n=(BS.rl.n||20)+20;render()}
 else if(a==='latn'){var lm=document.getElementById('bl-mapel'),lt=document.getElementById('bl-tipe');if(lm)BS.lat.mapel=lm.value;if(lt)BS.lat.tipe=lt.value;BS.lat.n=+v;render()}
 else if(a==='latmulai'){
  var m=document.getElementById('bl-mapel'),t=document.getElementById('bl-tipe');if(m)BS.lat.mapel=m.value;if(t)BS.lat.tipe=t.value;
  var run=bsMake('latihan',null,BS.lat);if(!run.ids.length){toast('Tidak ada soal untuk pilihan ini');return}bsStartRun(run);
 }
 else if(a==='mulaiujian'){
  var s=BS.D.sesi.filter(function(x){return x.id===v})[0];if(!s)return;
  if(bsSesiStatus(s).k!=='on'){toast('Sesi belum dibuka atau sudah berakhir');return}
  if(BS.D.hasil.some(function(x){return x.sid===S.user.id&&x.sesiId===s.id&&x.mode==='ujian'})){toast('Kamu sudah mengerjakan sesi ini');return}
  if(BS.run){toast('Selesaikan pengerjaan yang sedang berjalan dahulu');return}
  var run2=bsMake('ujian',s);if(!run2.ids.length){toast('Sesi ini belum memiliki soal');return}
  uiConfirm('Mulai ujian "'+s.judul+'"?\n'+run2.ids.length+' soal, '+s.durasi+' menit.\nWaktu berjalan terus meskipun aplikasi ditutup.\nUjian hanya bisa dikerjakan sekali.',{ok:'Mulai'}).then(function(ok){if(ok&&!BS.run&&!BS.starting){if(typeof bsMulaiUjian==='function')bsMulaiUjian(s,run2);else bsStartRun(run2)}});
 }
 else if(a==='ans'&&r){
  var q=bsSoalById(qid);if(!q||r.chk[qid])return;var ov=+v;
  if(q.tipe==='pg')r.ans[qid]=ov;
  else{var ar=Array.isArray(r.ans[qid])?r.ans[qid].slice():[],i=ar.indexOf(ov);if(i>-1)ar.splice(i,1);else ar.push(ov);r.ans[qid]=ar}
  bsRunSave();render();
 }
 else if(a==='kat'&&r){
  var q2=bsSoalById(qid);if(!q2||r.chk[qid])return;
  var arr=Array.isArray(r.ans[qid])?r.ans[qid].slice():q2.rows.map(function(){return null});arr[+b.dataset.r]=+v;r.ans[qid]=arr;bsRunSave();render();
 }
 else if(a==='cek'&&r){var id=r.ids[r.cur];if(bsAnswered(bsSoalById(id),r.ans[id])){r.chk[id]=1;bsRunSave();render()}}
 else if(a==='goto'&&r){r.cur=+v;bsRunSave();render();window.scrollTo(0,0)}
 else if(a==='next'&&r){if(r.cur<r.ids.length-1){r.cur++;bsRunSave();render();window.scrollTo(0,0)}}
 else if(a==='prev'&&r){if(r.cur>0){r.cur--;bsRunSave();render();window.scrollTo(0,0)}}
 else if(a==='selesai'&&r){
  var un=r.ids.filter(function(x){var s2=bsSoalById(x);return !s2||!bsAnswered(s2,r.ans[x])}).length;
  uiConfirm(un?'Kirim jawaban sekarang?\n'+un+' soal belum dijawab.':'Kirim jawaban sekarang?',{ok:'Kirim'}).then(function(ok){if(ok&&BS.run===r)bsFinish(false)});
 }
 /* guru */
 else if(a==='tab'){bsFormRead();bsSfRead();BS.tab=v;BS.form=null;BS.sf=null;render()}
 else if(a==='lihat'){BS.open[qid]=!BS.open[qid];bsRerenderList()}
 else if(a==='lagi'){BS.flt.n+=30;bsRerenderList()}
 else if(a==='aktif'){var sq=bsSoalById(qid);if(sq){var np={aktif:!sq.aktif};(BS_IDX[qid]?bsOverride(qid,np):bsPut('soal',Object.assign(BS.D.soal.filter(function(x){return x.id===qid})[0],np))).then(function(){render()});render()}}
 else if(a==='dup'){BS.dup=!BS.dup;render();window.scrollTo(0,0)}
 else if(a==='dupx'){BS.dup=false;render();window.scrollTo(0,0)}
 else if(a==='baru'){bsPosSimpan('');BS.form=bsNewForm(null);render();window.scrollTo(0,0)}
 else if(a==='salin'||a==='ubah'){
  var so=bsSoalById(qid);if(!so)return;bsPosSimpan(qid);var f=bsNewForm(so);if(a==='salin'){f.id='';f.salin=1;f.dari=qid}BS.form=f;render();window.scrollTo(0,0);
 }
 else if(a==='hapussoal'){uiConfirm('Hapus soal ini?\nSoal yang sudah dipakai tidak akan tampil di riwayat siswa.',{ok:'Hapus',danger:true}).then(function(ok){if(ok)bsDel('soal',qid).then(function(){render()})})}
 else if(a==='batalform'){BS.form=null;render();bsPosPulih()}
 else if(a==='ftipe'){bsFormRead();BS.form.tipe=v;if(v==='uraian')BS.form.tujuan='ujian';if(v==='pg'&&BS.form.kunci.length>1)BS.form.kunci=[BS.form.kunci[0]];render()}
 else if(a==='simpansoal')bsFormSave();
 else if(a==='sesibaru'){BS.sf=bsNewSesi(null);render();window.scrollTo(0,0)}
 else if(a==='sesiubah'){var sx=BS.D.sesi.filter(function(x){return x.id===qid})[0];if(sx){BS.sf=bsNewSesi(sx);render();window.scrollTo(0,0)}}
 else if(a==='sesibatal'){BS.sf=null;render()}
 else if(a==='sesisimpan')bsSfSave();
 else if(a==='sftoken'){var te=document.getElementById('sf-tokp');if(te){te.value=bsTokenBaru();var tc=document.getElementById('sf-tok');if(tc)tc.checked=true}}
 else if(a==='sfmapel'){bsSfRead();var mf=BS.sf.mapelF,ix=mf.indexOf(v);if(ix>-1)mf.splice(ix,1);else mf.push(v);bsSfRefresh()}
 else if(a==='sfmkosong'){bsSfRead();BS.sf.mapelAll=!BS.sf.mapelAll;bsSfRefresh()}
  else if(a==='sfmall'){bsSfRead();BS.sf.mapelF=[];bsSfRefresh()}
 else if(a==='sfmada'){bsSfRead();var cm=bsSfStat(BS.sf).pm;BS.sf.mapelF=Object.keys(cm).filter(function(m){return cm[m]>0});bsSfRefresh()}
 else if(a==='sfpsemua'&&BS.sf){bsSfRead();bsSfManualAll(BS.sf).forEach(function(q){if(BS.sf.ids.indexOf(q.id)<0)BS.sf.ids.push(q.id)});bsSfManualRefresh()}
 else if(a==='sfkosong'&&BS.sf){bsSfRead();BS.sf.ids=[];bsSfManualRefresh()}
 else if(a==='sesiaktif'){var sa=BS.D.sesi.filter(function(x){return x.id===qid})[0];if(sa){sa.aktif=sa.aktif===false;bsPut('sesi',sa).then(function(){render()});render()}}
 else if(a==='sesigandakan'){
  var sg=BS.D.sesi.filter(function(x){return x.id===qid})[0];if(!sg)return;
  uiPrompt('Gandakan untuk berapa hari kerja berikutnya? (1 sampai 5)',{title:'Gandakan sesi',label:'Jumlah hari',ok:'Gandakan'}).then(async function(t){
   if(t===null)return;
   var n=Math.max(1,Math.min(5,parseInt(t,10)||1)),HR=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
   for(var i=1;i<=n;i++){
    var f=bsNewSesi(sg);f.id='';f.tokP='';f.mulai=bsGeserKerja(sg.mulai,i);f.selesai=bsGeserKerja(sg.selesai,i);
    f.judul=sg.judul+' ('+(f.mulai?HR[new Date(f.mulai).getDay()]:'salinan '+i)+')';
    if(n===1){BS.sf=f;render();window.scrollTo(0,0);return}
    BS.sf=f;await bsSfSave();
   }
   toast(n+' sesi digandakan. Ubah judul atau soal bila perlu');render();
  });
 }
 else if(a==='sesihasil'){BS.hs=qid;BS.tab='hasil';render();window.scrollTo(0,0)}
 else if(a==='sesihapus'){uiConfirm('Hapus sesi ini?\nHasil siswa yang sudah masuk tidak ikut terhapus.',{ok:'Hapus',danger:true}).then(function(ok){if(ok)bsDel('sesi',qid).then(function(){render()})})}
 else if(a==='kirimulang'){var hk=BS.D.hasil.filter(function(x){return x.id===v})[0];if(hk){hk.bad=0;toast('Mengirim…');bsRemote('hasil',hk).then(function(ok){toast(ok?'Nilai terkirim':'Masih gagal: '+(hk.err||'periksa koneksi'));render()})}}
 else if(a==='ekspor')bsExport();
 else if(a==='hapushasil'){uiConfirm('Hapus hasil ini?\nSiswa bisa mengerjakan sesi ujian itu lagi.',{ok:'Hapus',danger:true}).then(function(ok){if(ok){var hh=BS.D.hasil.filter(function(x){return x.id===v})[0];bsDel('hasil',v).then(function(){if(hh)return bsHapusRun(hh)}).then(function(){render()})}})}
});
document.addEventListener('change',function(e){
 var t=e.target;
 if(t.classList&&t.classList.contains('sf-id')&&BS.sf){
  var ix=BS.sf.ids.indexOf(t.value);if(t.checked&&ix<0)BS.sf.ids.push(t.value);else if(!t.checked&&ix>-1)BS.sf.ids.splice(ix,1);
  var n=document.getElementById('sf-n');if(n)n.innerHTML=bsSfManualInfo(BS.sf);return;
 }
 if(t.id==='bl-mapel'||t.id==='bl-tipe'){BS.lat[t.id==='bl-mapel'?'mapel':'tipe']=t.value;render();return}
 if(t.classList&&t.classList.contains('sf-kls')&&BS.sf){
  var k0=bsKlsNilai(bsKls(BS.sf));
  bsSfRead();
  if(window.rgGantiTingkat&&bsKlsNilai(bsKls(BS.sf))!==k0)rgGantiTingkat(BS.sf);
  render();return;
 }
 if(t.id==='sf-pilih'||t.id==='sf-jm'){bsSfRead();render();return}
 if((t.id==='sf-mf'||t.id==='sf-tf')&&BS.sf){BS.sf[t.id==='sf-mf'?'mf':'tf']=t.value;bsSfManualRefresh();return}
 var a=t.dataset&&t.dataset.bs;if(!a)return;
 if(a==='tuj'){var id=t.dataset.q;(BS_IDX[id]?bsOverride(id,{tujuan:t.value}):bsPut('soal',Object.assign(BS.D.soal.filter(function(x){return x.id===id})[0],{tujuan:t.value}))).then(function(){toast('Peruntukan diubah')});BS.all=null}
 else if(a==='flab'){bsFormRead();render()}
 else if(a==='flt'){BS.flt[t.dataset.k]=t.value;BS.flt.n=30;render()}
 else if(a==='hs'){BS.hs=t.value;render()}
 else if(a==='rlf'){BS.rl[t.dataset.k]=t.value;BS.rl.n=20;render()}
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(t.id==='bq-q'){BS.flt.q=t.value;BS.flt.n=30;bsRerenderList()}
 else if(t.id==='rl-q'){BS.rl.q=t.value;BS.rl.n=20;var rl=document.getElementById('rl-list');if(rl)rl.innerHTML=bsRlList()}
 else if(t.id==='sf-q'&&BS.sf){BS.sf.q=t.value;bsSfManualRefresh()}
 else if((t.id==='sf-jumlah'||(t.id||'').indexOf('sf-jn-')===0)&&BS.sf){bsSfRead();var nn=document.getElementById('sf-note');if(nn)nn.innerHTML=bsSfNote(BS.sf)}
});

/* ---------- Pemberitahuan ujian di beranda ---------- */
function bsHitung(ms){
 var m=Math.max(1,Math.round(ms/60000));
 if(m<60)return m+' menit';
 if(m<1440)return Math.floor(m/60)+' jam'+(m%60?' '+(m%60)+' menit':'');
 return Math.round(m/1440)+' hari';
}
/* sesi yang relevan: siswa = dibuka atau terjadwal untuk kelasnya dan belum dikerjakan; guru = sesi dibuka */
function bsSesiInfo(){
 if(!S.user||!BS.loaded)return [];
 if(isStaff()&&actRole()!=='siswa')return BS.D.sesi.filter(function(x){return schAkunOk(x)&&bsSesiStatus(x).k==='on'});
 return bsSesiUntuk(S.user.kelas||'').filter(function(x){
  var k=bsSesiStatus(x).k;
  return (k==='on'||k==='soon')&&!BS.D.hasil.some(function(h){return h.sid===S.user.id&&h.sesiId===x.id&&h.mode==='ujian'});
 }).sort(function(a,b){return (a.mulai||0)-(b.mulai||0)});
}
function bsInfoCard(){
 if(isStaff()&&actRole()!=='siswa')return '';
 var L=bsSesiInfo();if(!L.length)return '';
 var now=Jam.now();
 return '<div class="card" id="ujian-info"><b>Ujian CBT</b>'+L.map(function(x){
  var on=bsSesiStatus(x).k==='on';
  return '<div class="row sb"><span><b>'+esc(x.judul)+'</b><br><span class="note">'+(on?'Dibuka'+(x.selesai?' · tutup '+bsWaktu(x.selesai):''):'Dimulai '+bsWaktu(x.mulai)+' · '+bsHitung(x.mulai-now)+' lagi')+' · '+(x.durasi||0)+' menit</span></span><button type="button" class="btn small'+(on?' primary':'')+'" data-act="menu" data-v="cbtonline">'+(on?'Buka':'Lihat')+'</button></div>';
 }).join('')+'</div>';
}
var _bsBeranda=viewBeranda;
viewBeranda=function(){
 var h=_bsBeranda.apply(this,arguments);
 try{
  if(S.user&&!BS.loaded&&!BS.loading)setTimeout(bsLoad,0);
  var n=bsSesiInfo().filter(function(x){return bsSesiStatus(x).k==='on'}).length;
  if(n)h=h.replace('<span>CBT Online</span>','<span>CBT Online <small class="pill ok">'+n+' dibuka</small></span>');
  h=bsInfoCard()+h;
 }catch(e){}
 return h;
};
setInterval(function(){
 if(!S.user||S.tab!=='beranda'||V.mode!=='list'||document.hidden||!BS.loaded)return;
 var el=document.getElementById('ujian-info'),h=bsInfoCard();
 if(el&&h)el.outerHTML=h;
 else if(el&&!h)el.remove();
 else if(!el&&h)render();
},30000);
