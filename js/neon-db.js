/* neon-db.js: jalur data CBT lewat fungsi server (Neon) untuk soal_run, soal_hasil, soal_kunci.
   Aktif bila config.js: CBT_DB:'neon' dan CBT_AMAN:true. Di mode lain berkas ini tidak mengubah apa pun.
   Cloud.db diganti pembungkus: koleksi tiga itu dibaca dan ditulis lewat aksi 'dok' fungsi CBT (server memeriksa peran:
   siswa hanya membaca catatan dan hasil miliknya, guru dan admin penuh); koleksi lain tetap langsung ke Appwrite.
   Data lama di Appwrite tetap terbaca selama CFG.CBT_LEGACY bukan false (set false setelah data disalin, lihat docs-NEON.md).
   Harus dimuat tepat setelah core.js dan sebelum sinkron-cepat.js dan pengawas.js, supaya pembatas waktu dan pencatatan audit
   ikut membungkus pembungkus ini. Sakelar server (CBT_DB=neon di variabel fungsi) harus sama dengan sakelar ini; bila server
   belum Neon, aksi 'dok' tetap jalan lewat Appwrite, jadi mengembalikan ke Appwrite cukup dengan mengubah variabel fungsi. */
(function(){
 if(!window.Cloud||!Cloud.on)return;
 var COLS={soal_run:1,soal_hasil:1,soal_kunci:1},HAL=100;
 function aktif(){return !!(window.CFG&&CFG.CBT_DB==='neon'&&CFG.CBT_AMAN===true)}
 function lama(){return !(window.CFG&&CFG.CBT_LEGACY===false)}
 function fn(b){return window.cbtFn(b)}

 /* Query Appwrite (string JSON atau objek) -> {f: filter equal, lim, cur} */
 function baca(queries){
  var o={f:{},lim:null,cur:null};
  (queries||[]).forEach(function(q){
   try{if(typeof q==='string')q=JSON.parse(q)}catch(e){return}
   if(!q)return;
   if(q.method==='equal'&&(q.attribute==='sid'||q.attribute==='sesiId'||q.attribute==='$id'))o.f[q.attribute]=q.values;
   else if(q.method==='limit')o.lim=q.values[0];
   else if(q.method==='cursorAfter')o.cur=q.values[0];
  });
  return o;
 }
 /* satu atau beberapa halaman dari Neon sampai terkumpul `lim` dokumen atau habis */
 async function halaman(col,p,minta,denganTotal){
  var docs=[],cur=p.cur,tot;
  while(docs.length<minta){
   var n=Math.min(HAL,minta-docs.length);
   var r=await fn({action:'dok',op:'list',col:col,q:p.f,limit:n,cursor:cur,total:!!denganTotal&&tot===undefined});
   if(r.total!==undefined)tot=r.total;
   docs=docs.concat(r.docs||[]);
   if(!r.docs||r.docs.length<n)break;
   cur=r.docs[r.docs.length-1].$id;
  }
  return {docs:docs,total:tot};
 }
 function gabung(a,b){var s={};a.forEach(function(d){s[d.$id]=1});return a.concat(b.filter(function(d){return !s[d.$id]}))}

 var i0=Cloud.init;
 Cloud.init=function(){
  i0.apply(this,arguments);
  if(!aktif()||!this.db||this.db.__neon)return;
  var raw=this.db,db=Object.create(raw);
  db.__neon=true;this._rawDb=raw;
  db.getDocument=function(dbId,col,id){
   if(!COLS[col])return raw.getDocument.apply(raw,arguments);
   return fn({action:'dok',op:'get',col:col,id:id}).then(function(r){return r.doc});
  };
  db.createDocument=function(dbId,col,id,data){
   if(!COLS[col])return raw.createDocument.apply(raw,arguments);
   return fn({action:'dok',op:'create',col:col,id:id,data:data}).then(function(r){return r.doc});
  };
  db.updateDocument=function(dbId,col,id,data){
   if(!COLS[col])return raw.updateDocument.apply(raw,arguments);
   return fn({action:'dok',op:'update',col:col,id:id,data:data}).then(function(r){return r.doc});
  };
  db.deleteDocument=function(dbId,col,id){
   if(!COLS[col])return raw.deleteDocument.apply(raw,arguments);
   return fn({action:'dok',op:'delete',col:col,id:id}).then(function(){return {}});
  };
  /* satu halaman: Neon dulu; bila halaman pertama belum penuh, dilengkapi dokumen lama dari Appwrite (dipakai layar Hapus nilai) */
  db.listDocuments=async function(dbId,col,queries){
   if(!COLS[col])return raw.listDocuments.apply(raw,arguments);
   var p=baca(queries),minta=p.lim||25,r=await halaman(col,p,minta,true),docs=r.docs,total=r.total===undefined?docs.length:r.total;
   if(lama()&&!p.cur){
    try{
     var lr=await raw.listDocuments(dbId,col,queries);
     total+=Number(lr.total)||0;
     if(docs.length<minta)docs=gabung(docs,lr.documents||[]).slice(0,minta);
    }catch(e){}
   }
   return {total:total,documents:docs};
  };
  this.db=db;
 };

 /* daftar lengkap (dipakai hampir semua layar): semua halaman Neon + daftar lama dari Appwrite, Neon menang bila ID sama */
 var l0=Cloud.list;
 Cloud.list=async function(col,extra){
  if(!aktif()||!COLS[col]||!this._rawDb)return l0.apply(this,arguments);
  var p=baca(extra),neon=(await halaman(col,{f:p.f,cur:null},1e9,false)).docs;
  if(!lama())return neon;
  var tua=[];
  try{
   var raw=this._rawDb,cur=null,LIM=500;
   for(;;){
    var q=[Appwrite.Query.limit(LIM)].concat(extra||[]);if(cur)q.push(Appwrite.Query.cursorAfter(cur));
    var r=await raw.listDocuments(CFG.DB,col,q);tua=tua.concat(r.documents);
    if(r.documents.length<LIM)break;cur=r.documents[r.documents.length-1].$id;
   }
  }catch(e){/* Appwrite tidak bisa dibaca (izin siswa atau koleksi kosong): lanjut dengan data Neon */}
  return gabung(neon,tua);
 };
})();
