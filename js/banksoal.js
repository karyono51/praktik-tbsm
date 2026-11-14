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
 form:null,sf:null,flt:{mapel:'',tipe:'',tuj:'',q:'',n:30},hs:'ALL',lat:{mapel:'',tipe:'',n:10},open:{},timer:null,resumed:false,all:null};
var BS_TIPE={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori'};
var BS_TUJ={latihan:'Latihan',ujian:'Ujian',keduanya:'Latihan dan ujian'};
var BS_IDX={};(window.SOAL_TKA||[]).forEach(function(b){BS_IDX[b.id]=b});
ICO.banksoal='<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="m9 14 2 2 4-4"/>';

/* ---------- Penyimpanan ---------- */
function bsLoadLocal(){['soal','sesi','hasil'].forEach(function(k){try{BS.D[k]=JSON.parse(localStorage.getItem(BSK[k])||'[]')}catch(e){BS.D[k]=[]}})}
function bsSaveLocal(){['soal','sesi','hasil'].forEach(function(k){try{localStorage.setItem(BSK[k],JSON.stringify(BS.D[k]))}catch(e){}})}
function bsClear(){
 try{Object.keys(BSK).forEach(function(k){localStorage.removeItem(BSK[k])});if(Cloud.on)localStorage.removeItem(BSQ)}catch(e){}
 if(BS.timer){clearInterval(BS.timer);BS.timer=null}
 BS.D={soal:[],sesi:[],hasil:[]};BS.loaded=false;BS.resumed=false;BS.run=null;BS.res=null;BS.sub='home';BS.form=null;BS.sf=null;BS.all=null;
}
function bsParse(o){if(typeof o.payload==='string'){try{var x=JSON.parse(o.payload||'{}');for(var k in x)o[k]=x[k]}catch(e){}}return o}
function bsFromDoc(d){return bsParse(fromDoc(d))}
function bsPack(k,o){
 if(k==='soal')o.payload=BS_IDX[o.id]?'{"bawaan":1}':JSON.stringify({q:o.q,opts:o.opts,kunci:o.kunci,rows:o.rows,lab:o.lab,bahas:o.bahas});
 else if(k==='sesi')o.payload=JSON.stringify({ids:o.ids||[],pilih:o.pilih||'otomatis',mapelF:o.mapelF||[],tampil:!!o.tampil,sekolah:o.sekolah||''});
 else o.payload=JSON.stringify({ans:o.ans,order:o.order,oo:o.oo,pindah:o.pindah||0,pts:o.pts});
}
function bsQueueGet(){try{return JSON.parse(localStorage.getItem(BSQ)||'[]')}catch(e){return []}}
function bsQueueAdd(k,id){var q=bsQueueGet();if(q.indexOf(k+':'+id)<0)q.push(k+':'+id);try{localStorage.setItem(BSQ,JSON.stringify(q))}catch(e){}}
/* Galat yang layak dicoba ulang: tanpa kode (jaringan), waktu habis, sesi habis, terlalu banyak permintaan, atau galat server. */
function bsRetryable(e){var c=e&&e.code;return !c||c===401||c===408||c===425||c===429||c>=500}
async function bsRemote(k,o){
 var col=BSC[k],data=pick(o,BSF[k]);
 try{
  var db=Cloud.db;
  if(!o.r){try{await db.createDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===409)await db.updateDocument(CFG.DB,col,o.id,data);else throw e}}
  else{try{await db.updateDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===404)await db.createDocument(CFG.DB,col,o.id,data);else throw e}}
  o.r=1;o.d=0;o.bad=0;bsSaveLocal();return true;
 }catch(e){
  if(navigator.onLine===false||bsRetryable(e))bsQueueAdd(k,o.id);
  else{o.bad=1;bsSaveLocal();toast('Gagal menyimpan ke server: '+((e&&e.message)||e))}
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
   if(typeof bsRunRestore==='function'){try{await bsRunRestore()}catch(e){}}
  }
 }finally{BS.loading=false;BS.loaded=true;BS.all=null;render()}
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
 BS.D.soal.forEach(function(d){if(!BS_IDX[d.id]){var c=Object.assign({},d);c.aktif=d.aktif!==false;c.tujuan=d.tujuan||'keduanya';out.push(c)}});
 return (BS.all=out);
}
function bsSoalById(id){return bsSoalAll().filter(function(q){return q.id===id})[0]}
function bsMapelList(){var m={};bsSoalAll().forEach(function(q){if(q.mapel)m[q.mapel]=1});return Object.keys(m).sort()}
function bsPool(mode,kelas){
 return bsSoalAll().filter(function(q){return q.aktif&&(q.tujuan==='keduanya'||q.tujuan===mode)&&(!q.kelas||!kelas||q.kelas===kelas)});
}
function bsOverride(id,patch){
 var b=BS_IDX[id],o=BS.D.soal.filter(function(x){return x.id===id})[0];
 if(!o){o={id:id,ts:Date.now(),tipe:b.tipe,mapel:b.mapel,topik:b.topik||'',kelas:b.kelas||'',tujuan:b.tujuan||'keduanya',aktif:true,oleh:S.user.nama,bawaan:1}}
 Object.assign(o,patch);return bsPut('soal',o);
}
function bsShuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function bsFrac(q,a){
 if(a==null)return 0;
 if(q.tipe==='pg')return a===q.kunci?1:0;
 if(q.tipe==='kompleks'){
  var sel=Array.isArray(a)?a:[];if(!sel.length)return 0;
  var b=0,s=0;sel.forEach(function(i){if(q.kunci.indexOf(i)>-1)b++;else s++});
  return Math.max(0,(b-s)/q.kunci.length);
 }
 if(q.tipe==='kategori'){
  if(!Array.isArray(a))return 0;var n=0;
  q.rows.forEach(function(r,i){if(a[i]===(r[1]?0:1))n++});
  return n/q.rows.length;
 }
 return 0;
}
function bsAnswered(q,a){
 if(a==null)return false;
 if(q.tipe==='kompleks')return Array.isArray(a)&&a.length>0;
 if(q.tipe==='kategori')return Array.isArray(a)&&a.some(function(x){return x===0||x===1});
 return true;
}
function bsText(s){return esc(s).replace(/\n/g,'<br>')}
function bsLtr(i){return String.fromCharCode(65+i)}
function bsWaktu(ts){return ts?new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'-'}
function bsDtv(ts){if(!ts)return '';var d=new Date(ts-new Date(ts).getTimezoneOffset()*60000);return d.toISOString().slice(0,16)}
function bsEdit(){return !!S.user&&isStaff()&&can('nilai')}

/* ---------- Sesi dan percobaan ---------- */
function bsSesiStatus(s){
 var n=Jam.now();
 if(s.aktif===false)return {k:'off',t:'Nonaktif',c:'plain'};
 if(s.mulai&&n<s.mulai)return {k:'soon',t:'Terjadwal',c:'warn'};
 if(s.selesai&&n>s.selesai)return {k:'end',t:'Berakhir',c:'plain'};
 return {k:'on',t:'Dibuka',c:'ok'};
}
function bsSesiUntuk(kelas){return BS.D.sesi.filter(function(s){return (s.kelas==='ALL'||!s.kelas||s.kelas===kelas)&&schAkunOk(s)})}
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
   pool=bsShuffle(pool);ids=pool.slice(0,sesi.jumlah||pool.length).map(function(q){return q.id});
  }
  if(acak&&sesi.pilih==='manual')ids=bsShuffle(ids);
 }else{
  var p2=bsPool('latihan',kelas).filter(function(q){return (!opt.mapel||q.mapel===opt.mapel)&&(!opt.tipe||q.tipe===opt.tipe)});
  ids=bsShuffle(p2).slice(0,opt.n||p2.length).map(function(q){return q.id});
 }
 var oo={};
 ids.forEach(function(id){var q=bsSoalById(id);if(q&&q.opts){var ix=q.opts.map(function(_,i){return i});oo[id]=acak?bsShuffle(ix):ix}});
 return {mode:mode,sesiId:sesi?sesi.id:'',sesiJudul:sesi?sesi.judul:'',start:Jam.now(),dur:sesi?(sesi.durasi||0)*60:0,ids:ids,oo:oo,ans:{},cur:0,chk:{},pindah:0,sid:S.user.id,tampil:sesi?!!sesi.tampil:true,kkm:sesi&&sesi.kkm?sesi.kkm:S.kkm};
}
function bsStartRun(r){
 BS.run=r;BS.sub='run';bsRunSave();bsTimerOn();render();window.scrollTo(0,0);
}
function bsRemain(r){return Math.max(0,r.start+r.dur*1000-Jam.now())}
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
 var tot=r.ids.length,sum=0,ben=0;
 r.ids.forEach(function(id){var q=bsSoalById(id);if(!q)return;var f=bsFrac(q,r.ans[id]);sum+=f;if(f>=0.9999)ben++});
 var h={id:r.rid?('h'+r.rid.slice(1)):uid(),ts:Jam.now(),sid:r.sid,siswa:S.user.nama,kelas:S.user.kelas||'',mode:r.mode,sesiId:r.sesiId||'',sesiJudul:r.sesiJudul||'',
  score:tot?Math.round(sum/tot*100):0,benar:ben,total:tot,detik:Math.min(Math.round((Jam.now()-r.start)/1000),r.dur||1e9),
  ans:r.ans,order:r.ids,oo:r.oo,pindah:r.pindah||0,pts:+sum.toFixed(2),tampil:r.tampil,kkm:r.kkm};
 try{localStorage.removeItem(bsRunKey())}catch(e){}
 BS.run=null;BS.res=h.id;BS.sub='result';
 var sp=bsPut('hasil',h,auto?Math.floor(Math.random()*4000):0);
 if(typeof bsRunDone==='function')bsRunDone(r);
 if(auto)toast('Waktu habis. Jawaban dikirim otomatis.');
 render();window.scrollTo(0,0);
 sp.then(function(){if(BS.sub==='result'&&BS.res===h.id&&S.tab==='banksoal')render()});
}
function bsResume(){
 if(BS.resumed||!S.user)return;BS.resumed=true;
 var r=null;try{r=JSON.parse(localStorage.getItem(bsRunKey())||'null')}catch(e){}
 if(!r||r.sid!==S.user.id||r.done)return;
 BS.run=r;if(S.tab==='banksoal')BS.sub='run';
 if(r.dur&&bsRemain(r)<=0){setTimeout(function(){bsFinish(true)},0);return}
 bsTimerOn();
}
document.addEventListener('visibilitychange',function(){
 var r=BS.run;if(r&&r.mode==='ujian'&&document.hidden){r.pindah=(r.pindah||0)+1;bsRunSave()}
 if(r&&!document.hidden&&r.dur&&bsRemain(r)<=0)bsFinish(true);
});

/* ---------- Tampilan soal ---------- */
function bsQBody(q,r,mode){
 var a=r?r.ans[q.id]:null,locked=mode==='check'&&r&&r.chk[q.id],h='<p class="bs-q">'+bsText(q.q)+'</p>';
 if(q.tipe==='pg'||q.tipe==='kompleks'){
  if(q.tipe==='kompleks')h+='<p class="note">Pilih semua jawaban yang benar.</p>';
  var order=(r&&r.oo[q.id])||q.opts.map(function(_,i){return i});
  h+='<div class="bs-opts">'+order.map(function(oi,pos){
   var sel=q.tipe==='pg'?a===oi:(Array.isArray(a)&&a.indexOf(oi)>-1),cls='';
   if(locked){var key=q.tipe==='pg'?q.kunci===oi:q.kunci.indexOf(oi)>-1;cls=key?' ok':(sel?' bad':'')}
   return '<button type="button" class="bs-opt'+cls+'" data-bs="ans" data-q="'+q.id+'" data-v="'+oi+'" aria-pressed="'+!!sel+'"'+(locked?' disabled':'')+'><b class="ltr">'+bsLtr(pos)+'</b><span>'+esc(q.opts[oi])+'</span></button>';
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
function bsRev(q,a,n,showAns){
 var f=bsFrac(q,a),hd=n===''?'':'<div class="row"><b>'+n+'.</b><span class="pill plain">'+esc(q.mapel||'')+'</span><span class="pill '+(!bsAnswered(q,a)?'plain':f>=0.9999?'ok':f>0?'warn':'bad')+'">'+(!bsAnswered(q,a)?'Tidak dijawab':f>=0.9999?'Benar':f>0?'Sebagian':'Salah')+'</span></div>',h='<div class="bs-rv">'+hd+'<p class="bs-q">'+bsText(q.q)+'</p>';
 if(q.tipe==='kategori'){
  var lab=q.lab||['Benar','Salah'];
  h+='<div class="bs-kat">'+q.rows.map(function(row,ri){
   var v=Array.isArray(a)?a[ri]:null,kv=row[1]?0:1,ok=v===kv;
   return '<div class="bs-kr '+(v==null?'':ok?'ok':'bad')+'"><span>'+esc(row[0])+'</span><span class="note">'+(showAns?('Jawabanmu: '+(v==null?'-':esc(lab[v]))+' · Kunci: '+esc(lab[kv])):('Jawabanmu: '+(v==null?'-':esc(lab[v]))))+'</span></div>';
  }).join('')+'</div>';
 }else{
  h+='<div class="bs-opts">'+q.opts.map(function(t,i){
   var sel=q.tipe==='pg'?a===i:(Array.isArray(a)&&a.indexOf(i)>-1),key=q.tipe==='pg'?q.kunci===i:q.kunci.indexOf(i)>-1;
   var cls=showAns?(key?' ok':(sel?' bad':'')):(sel?' sel':'');
   return '<div class="bs-opt static'+cls+'"><b class="ltr">'+bsLtr(i)+'</b><span>'+esc(t)+(sel?' <em>(jawabanmu)</em>':'')+(showAns&&key?' ✓':'')+'</span></div>';
  }).join('')+'</div>';
 }
 if(showAns&&q.bahas)h+='<div class="bs-bahas"><b>Pembahasan</b><p>'+bsText(q.bahas)+'</p></div>';
 return h+'</div>';
}

/* ---------- Siswa ---------- */
function bsViewSiswa(){
 if(BS.sub==='run'&&BS.run)return bsViewRun();
 if(BS.sub==='result')return bsViewResult();
 if(BS.sub==='latsetup')return bsViewLatSetup();
 if(BS.sub==='riwayat')return bsViewRiwayat();
 var kelas=S.user.kelas||'',h='',run=BS.run;
 if(run)h+='<div class="card bs-resume"><b>'+(run.mode==='ujian'?'Ujian sedang berjalan':'Latihan belum selesai')+'</b><p class="note">'+esc(run.sesiJudul||'Latihan soal')+' · '+Object.keys(run.ans).length+' dari '+run.ids.length+' soal terjawab</p><button type="button" class="btn primary" data-bs="lanjut">Lanjutkan</button></div>';
 var sesi=bsSesiUntuk(kelas).filter(function(s){return bsSesiStatus(s).k!=='off'}).sort(function(a,b){return (b.ts||0)-(a.ts||0)});
 h+='<section class="recent"><div class="sechead"><h2>Ujian</h2></div>';
 if(!sesi.length)h+='<p class="muted">Belum ada sesi ujian untuk kelasmu.</p>';
 h+=sesi.map(function(s){
  var st=bsSesiStatus(s),done=BS.D.hasil.filter(function(x){return x.sid===S.user.id&&x.sesiId===s.id&&x.mode==='ujian'})[0],go=st.k==='on'&&!done&&!(run&&run.sesiId===s.id);
  var jml=s.pilih==='manual'?(s.ids||[]).length:(s.jumlah||'semua');
  return '<div class="card"><div class="row sb"><b>'+esc(s.judul)+'</b><span class="pill '+(done?'ok':st.c)+'">'+(done?'Selesai':st.t)+'</span></div><p class="note">'+jml+' soal · '+(s.durasi||0)+' menit'+(s.mulai?' · mulai '+bsWaktu(s.mulai):'')+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+'</p>'+
   (done?'<p>Nilai: <b class="mono">'+done.score+'</b> ('+done.benar+' benar dari '+done.total+')</p>':'')+
   (go?'<button type="button" class="btn primary" data-bs="mulaiujian" data-v="'+s.id+'">Mulai ujian</button>':'')+'</div>';
 }).join('')+'</section>';
 var pool=bsPool('latihan',kelas).length;
 h+='<section class="recent"><div class="sechead"><h2>Latihan</h2></div><div class="card"><p>Latihan tanpa batas waktu. Setiap soal bisa diperiksa langsung disertai pembahasan.</p><p class="note">'+pool+' soal latihan tersedia.</p><button type="button" class="btn primary" data-bs="latsetup"'+(pool?'':' disabled')+'>Mulai latihan</button></div></section>';
 var rw=bsHasilSaya();
 h+='<section class="recent"><div class="sechead"><h2>Riwayat</h2>'+(rw.length>5?'<button type="button" class="link" data-bs="riwayat">Lihat semua</button>':'')+'</div>';
 h+=rw.length?rw.slice(0,5).map(bsRiwayatRow).join(''):'<p class="muted">Belum ada riwayat pengerjaan.</p>';
 return h+'</section>';
}
function bsRiwayatRow(x){
 var lat=x.mode==='latihan';
 return '<div class="card"><div class="row sb"><span class="row"><span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':'Ujian')+'</span><b>'+esc(x.sesiJudul||'Latihan soal')+'</b></span><b class="mono">'+x.score+'</b></div><div class="row sb"><span class="note">'+bsWaktu(x.ts)+' · '+x.benar+' benar dari '+x.total+' · '+Math.max(1,Math.round(x.detik/60))+' menit</span><button type="button" class="btn small" data-bs="detail" data-v="'+x.id+'">Detail</button></div></div>';
}
function bsViewRiwayat(){
 var rw=bsHasilSaya();
 return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Riwayat</h2></div>'+(rw.length?rw.map(bsRiwayatRow).join(''):'<p class="muted">Belum ada riwayat.</p>');
}
function bsViewLatSetup(){
 var kelas=S.user.kelas||'',L=BS.lat,pool=bsPool('latihan',kelas).filter(function(q){return (!L.mapel||q.mapel===L.mapel)&&(!L.tipe||q.tipe===L.tipe)});
 var mp=bsMapelList(),n=L.n;
 return '<div class="row"><button type="button" class="btn small" data-bs="home">Kembali</button><h2>Atur latihan</h2></div><div class="card">'+
  '<label class="f">Mata pelajaran<select id="bl-mapel"><option value="">Semua</option>'+mp.map(function(m){return '<option'+(L.mapel===m?' selected':'')+'>'+esc(m)+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Jenis soal<select id="bl-tipe"><option value="">Semua</option>'+Object.keys(BS_TIPE).map(function(t){return '<option value="'+t+'"'+(L.tipe===t?' selected':'')+'>'+BS_TIPE[t]+'</option>'}).join('')+'</select></label>'+
  '<div><span class="label">Jumlah soal</span><div class="chips" role="group">'+[5,10,20,0].map(function(v){return '<button type="button" data-bs="latn" data-v="'+v+'" aria-pressed="'+(n===v)+'">'+(v||'Semua')+'</button>'}).join('')+'</div></div>'+
  '<p class="note">'+pool.length+' soal sesuai pilihan.</p><button type="button" class="btn primary" data-bs="latmulai"'+(pool.length?'':' disabled')+'>Mulai</button></div>';
}
function bsViewRun(){
 var r=BS.run,id=r.ids[r.cur],q=bsSoalById(id),mode=r.mode==='latihan'?'check':'answer',h='';
 if(!q){return '<div class="card"><p>Soal ini sudah tidak tersedia.</p><button type="button" class="btn" data-bs="next">Lewati</button></div>'}
 var ans=Object.keys(r.ans).filter(function(k){var s=bsSoalById(k);return s&&bsAnswered(s,r.ans[k])}).length;
 h+='<div class="card"><div class="row sb"><b>'+esc(r.sesiJudul||'Latihan soal')+'</b><span class="note">Soal '+(r.cur+1)+' dari '+r.ids.length+' · terjawab '+ans+'</span></div><div class="bs-nav">'+
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
  '<p class="note">'+h0.benar+' benar dari '+h0.total+' soal · '+Math.max(1,Math.round(h0.detik/60))+' menit'+(h0.pindah?' · keluar halaman '+h0.pindah+'×':'')+'</p>'+(h0.r||!Cloud.on?'':'<p class="note">Menunggu terkirim ke server.</p>')+'</div>';
 if(!tampil)return h+'<p class="note center">Pembahasan ujian ditampilkan guru setelah sesi berakhir.</p>';
 (h0.order||[]).forEach(function(id,i){var q=bsSoalById(id);h+=q?'<div class="card">'+bsRev(q,(h0.ans||{})[id],i+1,true)+'</div>':'<div class="card"><p class="muted">Soal '+(i+1)+' sudah tidak tersedia.</p></div>'});
 return h;
}

/* ---------- Guru: kerangka ---------- */
function bsViewStaff(){
 var tabs=[['bank','Bank soal'],['sesi','Sesi ujian'],['hasil','Hasil'],['coba','Coba']];
 var h='<div class="seg bs4" role="tablist">'+tabs.map(function(t){return '<button type="button" role="tab" data-bs="tab" data-v="'+t[0]+'" aria-pressed="'+(BS.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
 if(BS.tab==='bank')return h+(BS.form?bsViewForm():bsViewBank());
 if(BS.tab==='sesi')return h+(BS.sf?bsViewSesiForm():bsViewSesi());
 if(BS.tab==='hasil')return h+bsViewHasil();
 return h+bsCobaInfo();
}
function bsCobaInfo(){
 return '<div class="card"><b>Coba sebagai siswa</b><p class="note">Ganti peran ke Siswa lewat tombol peran di header (bila akunmu punya peran ganda) untuk mencoba latihan dan ujian. Sesi ujian dan soal yang kamu atur di sini langsung terlihat oleh siswa kelas yang dipilih.</p></div>';
}

/* ---------- Guru: bank soal ---------- */
function bsFiltered(){
 var f=BS.flt,q=f.q.toLowerCase();
 return bsSoalAll().filter(function(s){
  return (!f.mapel||s.mapel===f.mapel)&&(!f.tipe||s.tipe===f.tipe)&&(!f.tuj||s.tujuan===f.tuj)&&(!q||(s.q+' '+(s.topik||'')+' '+(s.mapel||'')).toLowerCase().indexOf(q)>-1);
 });
}
function bsBankList(){
 var all=bsFiltered(),sh=all.slice(0,BS.flt.n);
 return sh.map(function(s){
  var op=BS.open[s.id];
  return '<div class="card"><div class="row"><span class="pill plain">'+esc(s.mapel||'')+'</span><span class="pill plain">'+BS_TIPE[s.tipe]+'</span>'+(s.bawaan?'<span class="pill plain">Bawaan</span>':'<span class="pill">Soal sendiri</span>')+(s.aktif?'':'<span class="pill bad">Nonaktif</span>')+'</div>'+
   '<p class="bs-qs">'+esc(String(s.q).slice(0,150))+(String(s.q).length>150?'…':'')+'</p>'+
   (s.topik?'<p class="note">Topik: '+esc(s.topik)+(s.kelas?' · Kelas '+esc(s.kelas):'')+'</p>':'')+
   '<label class="f">Peruntukan<select data-bs="tuj" data-q="'+s.id+'">'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(s.tujuan===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label>'+
   '<div class="row"><button type="button" class="btn small" data-bs="lihat" data-q="'+s.id+'">'+(op?'Tutup':'Lihat')+'</button><button type="button" class="btn small" data-bs="aktif" data-q="'+s.id+'">'+(s.aktif?'Nonaktifkan':'Aktifkan')+'</button>'+
   '<button type="button" class="btn small" data-bs="'+(s.bawaan?'salin':'ubah')+'" data-q="'+s.id+'">'+(s.bawaan?'Salin dan ubah':'Ubah')+'</button>'+
   (!s.bawaan?'<button type="button" class="btn small danger" data-bs="hapussoal" data-q="'+s.id+'">Hapus</button>':'')+'</div>'+
   (op?bsRev(s,null,'',true):'')+'</div>';
 }).join('')+(all.length>sh.length?'<button type="button" class="btn" data-bs="lagi">Tampilkan lebih banyak ('+(all.length-sh.length)+')</button>':'')+(all.length?'':'<p class="muted">Tidak ada soal yang cocok.</p>');
}
function bsViewBank(){
 var all=bsSoalAll(),c={latihan:0,ujian:0,keduanya:0,off:0};
 all.forEach(function(s){if(!s.aktif)c.off++;else c[s.tujuan]++});
 var f=BS.flt,mp=bsMapelList();
 return '<div class="stats"><div class="card"><span class="label">Total</span><b class="mono">'+all.length+'</b></div><div class="card"><span class="label">Latihan</span><b class="mono">'+(c.latihan+c.keduanya)+'</b></div><div class="card"><span class="label">Ujian</span><b class="mono">'+(c.ujian+c.keduanya)+'</b></div></div>'+
  '<button type="button" class="btn primary" data-bs="baru">Tambah soal sendiri</button>'+
  '<div class="card"><label class="f">Cari<input id="bq-q" type="search" value="'+esc(f.q)+'" placeholder="Kata dalam soal atau topik"></label><div class="two"><label class="f">Mapel<select data-bs="flt" data-k="mapel"><option value="">Semua</option>'+mp.map(function(m){return '<option'+(f.mapel===m?' selected':'')+'>'+esc(m)+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Jenis<select data-bs="flt" data-k="tipe"><option value="">Semua</option>'+Object.keys(BS_TIPE).map(function(t){return '<option value="'+t+'"'+(f.tipe===t?' selected':'')+'>'+BS_TIPE[t]+'</option>'}).join('')+'</select></label></div>'+
  '<label class="f">Peruntukan<select data-bs="flt" data-k="tuj"><option value="">Semua</option>'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(f.tuj===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label>'+(c.off?'<p class="note">'+c.off+' soal nonaktif tidak muncul di latihan maupun ujian.</p>':'')+'</div>'+
  '<div class="stack" id="bq-list">'+bsBankList()+'</div>';
}

/* ---------- Guru: form soal ---------- */
function bsNewForm(s){
 var f={id:s?s.id:'',tipe:s?s.tipe:'pg',mapel:s?s.mapel:'',topik:s?(s.topik||''):'',kelas:s?(s.kelas||''):'',tujuan:s?s.tujuan:'keduanya',q:s?s.q:'',opts:['','','','',''],kunci:[],rows:[],lab:['Benar','Salah'],bahas:s?(s.bahas||''):''};
 if(s&&s.opts){s.opts.forEach(function(t,i){f.opts[i]=t});f.kunci=Array.isArray(s.kunci)?s.kunci.slice():[s.kunci]}
 if(s&&s.rows){f.rows=s.rows.map(function(r){return [r[0],r[1]]});f.lab=(s.lab||['Benar','Salah']).slice()}
 while(f.rows.length<6)f.rows.push(['',true]);
 return f;
}
function bsFormRead(){
 var f=BS.form;if(!f||!document.getElementById('bf-q'))return;
 function v(id){var e=document.getElementById(id);return e?e.value:''}
 f.mapel=v('bf-mapel');f.topik=v('bf-topik');f.kelas=v('bf-kelas');f.tujuan=v('bf-tujuan')||f.tujuan;f.q=v('bf-q');f.bahas=v('bf-bahas');
 for(var i=0;i<5;i++){var e=document.getElementById('bf-o'+i);if(e)f.opts[i]=e.value}
 f.kunci=$$('.bf-k').filter(function(x){return x.checked}).map(function(x){return +x.value});
 if(f.tipe==='kategori'){
  f.lab=[v('bf-lab0')||'Benar',v('bf-lab1')||'Salah'];
  for(var j=0;j<6;j++){var t=document.getElementById('bf-r'+j),k=document.getElementById('bf-rk'+j);if(t)f.rows[j]=[t.value,k?k.value==='0':true]}
 }
}
function bsViewForm(){
 var f=BS.form,mp=bsMapelList(),h='<div class="row"><button type="button" class="btn small" data-bs="batalform">Batal</button><h2>'+(f.id?'Ubah soal':'Soal baru')+'</h2></div><div class="card">';
 h+='<div class="seg bs3">'+Object.keys(BS_TIPE).map(function(t){return '<button type="button" data-bs="ftipe" data-v="'+t+'" aria-pressed="'+(f.tipe===t)+'">'+BS_TIPE[t]+'</button>'}).join('')+'</div>';
 h+='<label class="f">Mata pelajaran<input id="bf-mapel" list="bf-mp" value="'+esc(f.mapel)+'" placeholder="Contoh: Dasar TBSM"><datalist id="bf-mp">'+mp.map(function(m){return '<option value="'+esc(m)+'">'}).join('')+'</datalist></label>';
 h+='<label class="f">Topik (opsional)<input id="bf-topik" value="'+esc(f.topik)+'"></label>';
 h+='<div class="two"><label class="f">Kelas<select id="bf-kelas">'+[['','Semua kelas'],['X','Kelas X'],['XI','Kelas XI'],['XII','Kelas XII']].map(function(k){return '<option value="'+k[0]+'"'+(f.kelas===k[0]?' selected':'')+'>'+k[1]+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Peruntukan<select id="bf-tujuan">'+Object.keys(BS_TUJ).map(function(t){return '<option value="'+t+'"'+(f.tujuan===t?' selected':'')+'>'+BS_TUJ[t]+'</option>'}).join('')+'</select></label></div>';
 h+='<label class="f">Teks soal<textarea id="bf-q" rows="4">'+esc(f.q)+'</textarea></label>';
 if(f.tipe==='kategori'){
  h+='<div class="two"><label class="f">Pilihan pertama<input id="bf-lab0" value="'+esc(f.lab[0])+'"></label><label class="f">Pilihan kedua<input id="bf-lab1" value="'+esc(f.lab[1])+'"></label></div><p class="note">Isi minimal 2 pernyataan (maksimal 6). Pilih kunci untuk tiap pernyataan.</p>';
  h+=f.rows.map(function(r,i){return '<div class="two"><label class="f">Pernyataan '+(i+1)+'<input id="bf-r'+i+'" value="'+esc(r[0])+'"></label><label class="f">Kunci<select id="bf-rk'+i+'"><option value="0"'+(r[1]?' selected':'')+'>'+esc(f.lab[0])+'</option><option value="1"'+(r[1]?'':' selected')+'>'+esc(f.lab[1])+'</option></select></label></div>'}).join('');
 }else{
  h+='<p class="note">'+(f.tipe==='pg'?'Isi minimal 2 pilihan (maksimal 5) dan tandai satu kunci.':'Isi minimal 3 pilihan (maksimal 5) dan centang semua kunci yang benar.')+'</p>';
  h+=[0,1,2,3,4].map(function(i){return '<div class="row bs-orow"><input class="bf-k" type="'+(f.tipe==='pg'?'radio':'checkbox')+'" name="bf-kunci" value="'+i+'" aria-label="Kunci '+bsLtr(i)+'"'+(f.kunci.indexOf(i)>-1?' checked':'')+'><label class="f grow">Pilihan '+bsLtr(i)+'<input id="bf-o'+i+'" value="'+esc(f.opts[i])+'"></label></div>'}).join('');
 }
 h+='<label class="f">Pembahasan (opsional)<textarea id="bf-bahas" rows="3">'+esc(f.bahas)+'</textarea></label>';
 h+='<button type="button" class="btn primary" data-bs="simpansoal">Simpan soal</button></div>';
 return h;
}
function bsFormSave(){
 bsFormRead();var f=BS.form,q=String(f.q).trim(),mapel=String(f.mapel).trim();
 if(!mapel){toast('Isi mata pelajaran');return}
 if(!q){toast('Isi teks soal');return}
 var o={id:f.id||uid(),ts:Date.now(),tipe:f.tipe,mapel:mapel.slice(0,64),topik:String(f.topik).trim().slice(0,120),kelas:f.kelas,tujuan:f.tujuan,aktif:true,oleh:S.user.nama.slice(0,64),q:q,bahas:String(f.bahas).trim()};
 var ex=BS.D.soal.filter(function(x){return x.id===o.id})[0];if(ex){o.aktif=ex.aktif!==false;o.oleh=ex.oleh||o.oleh}
 if(f.tipe==='kategori'){
  var lab=[String(f.lab[0]).trim(),String(f.lab[1]).trim()];
  if(!lab[0]||!lab[1]||lab[0]===lab[1]){toast('Dua pilihan harus terisi dan berbeda');return}
  var rows=f.rows.filter(function(r){return String(r[0]).trim()}).map(function(r){return [String(r[0]).trim(),!!r[1]]});
  if(rows.length<2){toast('Isi minimal 2 pernyataan');return}
  o.lab=lab;o.rows=rows;
 }else{
  var map=[],opts=[];
  f.opts.forEach(function(t,i){if(String(t).trim()){map[i]=opts.length;opts.push(String(t).trim())}});
  var ks=f.kunci.filter(function(i){return map[i]!==undefined}).map(function(i){return map[i]});
  if(opts.length<(f.tipe==='pg'?2:3)){toast('Pilihan jawaban kurang');return}
  if(f.tipe==='pg'){if(ks.length!==1){toast('Tandai tepat satu kunci pada pilihan yang terisi');return}o.kunci=ks[0]}
  else{if(ks.length<1){toast('Centang minimal satu kunci');return}o.kunci=ks}
  o.opts=opts;
 }
 BS.form=null;bsPut('soal',o).then(function(ok){toast(ok?'Soal tersimpan':'Soal tersimpan di perangkat, menunggu terkirim');render()});
 render();
}

/* ---------- Guru: sesi ujian ---------- */
function bsViewSesi(){
 var ss=BS.D.sesi.filter(schAkunOk).sort(function(a,b){return (b.ts||0)-(a.ts||0)}),h='<button type="button" class="btn primary" data-bs="sesibaru">Buat sesi ujian</button>';
 if(!ss.length)h+='<p class="muted">Belum ada sesi ujian.</p>';
 h+=ss.map(function(s){
  var st=bsSesiStatus(s),n=BS.D.hasil.filter(function(x){return x.sesiId===s.id}).length,jml=s.pilih==='manual'?(s.ids||[]).length+' soal pilihan':(s.jumlah||'semua')+' soal acak'+((s.mapelF&&s.mapelF.length)?' ('+s.mapelF.join(', ')+')':'');
  return '<div class="card"><div class="row sb"><b>'+esc(s.judul)+'</b><span class="pill '+st.c+'">'+st.t+'</span></div><p class="note">'+schLabelModul(s.sekolah)+' · Kelas '+(s.kelas==='ALL'||!s.kelas?'semua':esc(s.kelas))+' · '+jml+' · '+(s.durasi||0)+' menit · KKM '+(s.kkm||S.kkm)+'</p><p class="note">'+(s.mulai?'Mulai '+bsWaktu(s.mulai):'Tanpa jadwal mulai')+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+' · '+n+' pengumpulan'+(s.acak!==false?' · diacak':'')+(s.tampil?' · pembahasan ditampilkan':'')+'</p>'+
   '<div class="row"><button type="button" class="btn small" data-bs="sesiubah" data-q="'+s.id+'">Ubah</button><button type="button" class="btn small" data-bs="sesiaktif" data-q="'+s.id+'">'+(s.aktif===false?'Aktifkan':'Nonaktifkan')+'</button><button type="button" class="btn small" data-bs="sesihasil" data-q="'+s.id+'">Lihat hasil</button><button type="button" class="btn small danger" data-bs="sesihapus" data-q="'+s.id+'">Hapus</button></div></div>';
 }).join('');
 return h;
}
function bsNewSesi(s){
 return s?{id:s.id,judul:s.judul,kelas:s.kelas||'ALL',durasi:s.durasi||60,jumlah:s.jumlah||20,pilih:s.pilih||'otomatis',mapelF:(s.mapelF||[]).slice(),ids:(s.ids||[]).slice(),acak:s.acak!==false,tampil:!!s.tampil,kkm:s.kkm||S.kkm,mulai:s.mulai||0,selesai:s.selesai||0,aktif:s.aktif!==false,sekolah:s.sekolah||'',q:''}:
  {id:'',judul:'',kelas:'ALL',durasi:60,jumlah:20,pilih:'otomatis',mapelF:[],ids:[],acak:true,tampil:false,kkm:S.kkm,mulai:0,selesai:0,aktif:true,sekolah:schKode()||'',q:''};
}
function bsSfRead(){
 var f=BS.sf;if(!f||!document.getElementById('sf-judul'))return;
 function v(id){var e=document.getElementById(id);return e?e.value:''}
 function c(id){var e=document.getElementById(id);return !!(e&&e.checked)}
 f.judul=v('sf-judul');f.kelas=v('sf-kelas')||f.kelas;if(document.getElementById('sf-sekolah'))f.sekolah=v('sf-sekolah');f.durasi=+v('sf-durasi')||0;f.pilih=v('sf-pilih')||f.pilih;f.kkm=+v('sf-kkm')||f.kkm;
 if(document.getElementById('sf-jumlah'))f.jumlah=+v('sf-jumlah')||0;
 f.acak=c('sf-acak');f.tampil=c('sf-tampil');f.aktif=c('sf-aktif');
 f.mulai=v('sf-mulai')?new Date(v('sf-mulai')).getTime():0;f.selesai=v('sf-selesai')?new Date(v('sf-selesai')).getTime():0;
}
function bsSfPool(f){
 return bsPool('ujian',f.kelas==='ALL'?'':f.kelas).filter(function(q){return !(f.mapelF&&f.mapelF.length)||f.mapelF.indexOf(q.mapel)>-1});
}
function bsSfManual(){
 var f=BS.sf,q=String(f.q||'').toLowerCase(),list=bsPool('ujian',f.kelas==='ALL'?'':f.kelas).filter(function(s){return !q||(s.q+' '+s.mapel).toLowerCase().indexOf(q)>-1});
 return '<div class="bs-pick" id="sf-list">'+list.map(function(s){return '<label class="bs-pk"><input type="checkbox" class="sf-id" value="'+s.id+'"'+(f.ids.indexOf(s.id)>-1?' checked':'')+'><span><small>'+esc(s.mapel)+' · '+BS_TIPE[s.tipe]+'</small><br>'+esc(String(s.q).slice(0,110))+'</span></label>'}).join('')+(list.length?'':'<p class="muted">Tidak ada soal ujian yang cocok.</p>')+'</div>';
}
function bsViewSesiForm(){
 var f=BS.sf,mp=bsMapelList(),oto=f.pilih!=='manual';
 var h='<div class="row"><button type="button" class="btn small" data-bs="sesibatal">Batal</button><h2>'+(f.id?'Ubah sesi':'Sesi ujian baru')+'</h2></div><div class="card">';
 h+='<label class="f">Judul sesi<input id="sf-judul" value="'+esc(f.judul)+'" placeholder="Contoh: Simulasi TKA 1"></label>';
 h+='<div class="two"><label class="f">Kelas<select id="sf-kelas">'+[['ALL','Semua kelas'],['X','Kelas X'],['XI','Kelas XI'],['XII','Kelas XII']].map(function(k){return '<option value="'+k[0]+'"'+(f.kelas===k[0]?' selected':'')+'>'+k[1]+'</option>'}).join('')+'</select></label><label class="f">Durasi (menit)<input id="sf-durasi" type="number" inputmode="numeric" min="1" max="300" value="'+f.durasi+'"></label></div>';
 h+='<label class="f">Sekolah<select id="sf-sekolah">'+schOptModul(f.sekolah)+'</select></label>';
 h+='<label class="f">Cara memilih soal<select id="sf-pilih"><option value="otomatis"'+(oto?' selected':'')+'>Otomatis dari bank soal (tiap siswa berbeda)</option><option value="manual"'+(oto?'':' selected')+'>Pilih soal sendiri</option></select></label>';
 if(oto){
  h+='<label class="f">Jumlah soal<input id="sf-jumlah" type="number" inputmode="numeric" min="1" max="200" value="'+f.jumlah+'"></label><div><span class="label">Batasi mata pelajaran (kosong = semua)</span><div class="chips">'+mp.map(function(m){return '<button type="button" data-bs="sfmapel" data-v="'+esc(m)+'" aria-pressed="'+(f.mapelF.indexOf(m)>-1)+'">'+esc(m)+'</button>'}).join('')+'</div></div><p class="note">'+bsSfPool(f).length+' soal ujian tersedia untuk pilihan ini.</p>';
 }else{
  h+='<label class="f">Cari soal<input id="sf-q" type="search" value="'+esc(f.q||'')+'"></label><p class="note" id="sf-n">'+f.ids.length+' soal dipilih. Hanya soal dengan peruntukan ujian atau keduanya yang tampil.</p>'+bsSfManual();
 }
 h+='<label class="bs-ck"><input id="sf-acak" type="checkbox"'+(f.acak?' checked':'')+'> Acak urutan soal dan pilihan jawaban</label>';
 h+='<label class="bs-ck"><input id="sf-tampil" type="checkbox"'+(f.tampil?' checked':'')+'> Tampilkan pembahasan ke siswa setelah selesai</label>';
 h+='<div class="two"><label class="f">KKM<input id="sf-kkm" type="number" inputmode="numeric" min="0" max="100" value="'+f.kkm+'"></label><span></span></div>';
 h+='<div class="two"><label class="f">Dibuka mulai (opsional)<input id="sf-mulai" type="datetime-local" value="'+bsDtv(f.mulai)+'"></label><label class="f">Ditutup (opsional)<input id="sf-selesai" type="datetime-local" value="'+bsDtv(f.selesai)+'"></label></div>';
 h+='<label class="bs-ck"><input id="sf-aktif" type="checkbox"'+(f.aktif?' checked':'')+'> Sesi aktif (terlihat oleh siswa)</label>';
 h+='<button type="button" class="btn primary" data-bs="sesisimpan">Simpan sesi</button></div>';
 return h;
}
function bsSfSave(){
 bsSfRead();var f=BS.sf;
 if(!String(f.judul).trim()){toast('Isi judul sesi');return}
 if(!(f.durasi>0)){toast('Isi durasi dalam menit');return}
 if(f.pilih==='manual'&&!f.ids.length){toast('Pilih minimal satu soal');return}
 if(f.pilih!=='manual'&&!bsSfPool(f).length){toast('Tidak ada soal ujian yang tersedia untuk pilihan ini');return}
 if(f.mulai&&f.selesai&&f.selesai<=f.mulai){toast('Waktu tutup harus setelah waktu mulai');return}
 var ex=BS.D.sesi.filter(function(x){return x.id===f.id})[0];
 var o=Object.assign(ex||{},{id:f.id||uid(),ts:ex?ex.ts:Date.now(),judul:String(f.judul).trim().slice(0,160),kelas:f.kelas,durasi:f.durasi,jumlah:f.pilih==='manual'?f.ids.length:Math.max(1,f.jumlah||1),acak:f.acak,mulai:f.mulai||0,selesai:f.selesai||0,aktif:f.aktif,kkm:Math.min(100,Math.max(0,f.kkm||0)),oleh:ex?ex.oleh:S.user.nama.slice(0,64),ids:f.ids,pilih:f.pilih,mapelF:f.mapelF,tampil:f.tampil,sekolah:schNorm(f.sekolah)==='ALL'?'':schNorm(f.sekolah)});
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
 h+=rows.slice(0,100).map(function(x){
  var lat=x.mode==='latihan',kkm=((BS.D.sesi.filter(function(s){return s.id===x.sesiId})[0]||{}).kkm)||S.kkm;
  return '<div class="card"><div class="row sb"><b>'+esc(x.siswa)+'</b><b class="mono">'+x.score+'</b></div><div class="row"><span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':'Ujian')+'</span>'+(lat?'':'<span class="pill '+(x.score>=kkm?'ok':'bad')+'">'+(x.score>=kkm?'Kompeten':'Belum')+'</span>')+'<span class="pill plain">Kelas '+esc(x.kelas||'-')+'</span>'+(x.pindah?'<span class="pill bad">Keluar halaman '+x.pindah+'×</span>':'')+'</div><p class="note">'+esc(x.sesiJudul||'Latihan soal')+' · '+bsWaktu(x.ts)+' · '+x.benar+' benar dari '+x.total+' · '+Math.max(1,Math.round(x.detik/60))+' menit</p><div class="row"><button type="button" class="btn small" data-bs="detail" data-v="'+x.id+'">Detail jawaban</button>'+(can('hapus')||can('nilai')?'<button type="button" class="btn small danger" data-bs="hapushasil" data-v="'+x.id+'">Hapus</button>':'')+'</div></div>';
 }).join('')+(rows.length>100?'<p class="note">Menampilkan 100 terbaru. Ekspor Excel memuat semuanya.</p>':'');
 return h;
}
function bsExport(){
 if(typeof XLSX==='undefined'){toast('Pustaka Excel belum termuat. Periksa koneksi.');return}
 var rows=bsHasilRows().map(function(x){return {Nama:x.siswa,Kelas:x.kelas||'',Jenis:x.mode==='latihan'?'Latihan':'Ujian',Sesi:x.sesiJudul||'Latihan soal',Nilai:x.score,'Soal benar':x.benar,'Jumlah soal':x.total,'Durasi (menit)':Math.round(x.detik/6)/10,'Keluar halaman':x.pindah||0,Waktu:new Date(x.ts).toLocaleString('id-ID')}});
 var wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Hasil');
 XLSX.writeFile(wb,'hasil-bank-soal-'+ymd(Date.now())+'.xlsx');
}

/* ---------- Tampilan utama ---------- */
function viewBankSoal(){
 if(!BS.loaded&&!BS.loading)setTimeout(bsLoad,0);
 var staff=bsEdit(),h='<div class="sechead"><span class="ico">'+svg(ICO.banksoal,18)+'</span><h2>Bank soal</h2></div>';
 if(!BS.loaded)return h+'<p class="muted center" style="padding:32px 0">Memuat soal…</p>';
 if(BS.err.length)h+='<div class="err">'+BS.err.map(esc).join('<br>')+(BS.err.some(function(e){return /collection|not found|could not be found/i.test(e)})?'<br>Koleksi belum dibuat di Appwrite. Jalankan: node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil':'')+'</div>';
 if(BS.sub==='detail'||BS.sub==='result')return h+bsViewResult();
 if(staff&&actRole()!=='siswa')return h+bsViewStaff();
 return h+bsViewSiswa();
}
var _bsViewKat=viewKatalog;
viewKatalog=function(){
 if(S.tab==='banksoal'&&S.user)return viewBankSoal();
 return _bsViewKat.apply(this,arguments);
};
var _bsRender=render;
render=function(){
 _bsRender.apply(this,arguments);
 try{
  if(!S.user)return;
  bsResume();
  if(BS.run&&S.tab==='banksoal'&&BS.sub==='run')document.body.classList.add('has-bar');
  var sb=document.querySelector('.sbody');
  if(sb&&!sb.querySelector('[data-v="banksoal"]')){
   var cur=V.mode==='list'?S.tab:'',rk=sb.querySelector('.srow[data-v="rekap"]');
   var html='<button type="button" class="srow" data-act="menu" data-v="banksoal"'+(cur==='banksoal'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.banksoal,22)+'</span><span class="st"><b>Bank soal</b><small>Soal per unit LKPD, bentuk TKA</small></span>'+svg(ICO.chev,18)+'</button>';
   if(rk)rk.insertAdjacentHTML('afterend',html);else sb.insertAdjacentHTML('beforeend',html);
  }
 }catch(e){}
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('banksoal')<0)NAVTABS.push('banksoal');
if(typeof doLogout==='function'){var _bsLogout=doLogout;doLogout=async function(){bsClear();return _bsLogout.apply(this,arguments)}}
if(typeof refreshData==='function'){var _bsRefresh=refreshData;refreshData=async function(){await _bsRefresh.apply(this,arguments);BS.loaded=false;if(S.tab==='banksoal')render()}}
window.addEventListener('online',function(){if(S.user&&Cloud.on)bsFlushQ()});

/* ---------- Aksi ---------- */
function bsRerenderList(){var el=document.getElementById('bq-list');if(el)el.innerHTML=bsBankList()}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
 var a=b.dataset.bs,v=b.dataset.v,qid=b.dataset.q,r=BS.run;
 if(a==='home'){BS.sub='home';BS.res=null;render();window.scrollTo(0,0)}
 else if(a==='lanjut'){if(BS.run){BS.sub='run';render()}}
 else if(a==='riwayat'){BS.sub='riwayat';render();window.scrollTo(0,0)}
 else if(a==='detail'){BS.res=v;BS.sub='detail';render();window.scrollTo(0,0)}
 else if(a==='latsetup'){BS.sub='latsetup';render()}
 else if(a==='latn'){BS.lat.n=+v;render()}
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
 else if(a==='baru'){BS.form=bsNewForm(null);render();window.scrollTo(0,0)}
 else if(a==='salin'||a==='ubah'){
  var so=bsSoalById(qid);if(!so)return;var f=bsNewForm(so);if(a==='salin')f.id='';BS.form=f;render();window.scrollTo(0,0);
 }
 else if(a==='hapussoal'){uiConfirm('Hapus soal ini?\nSoal yang sudah dipakai tidak akan tampil di riwayat siswa.',{ok:'Hapus',danger:true}).then(function(ok){if(ok)bsDel('soal',qid).then(function(){render()})})}
 else if(a==='batalform'){BS.form=null;render()}
 else if(a==='ftipe'){bsFormRead();BS.form.tipe=v;if(v==='pg'&&BS.form.kunci.length>1)BS.form.kunci=[BS.form.kunci[0]];render()}
 else if(a==='simpansoal')bsFormSave();
 else if(a==='sesibaru'){BS.sf=bsNewSesi(null);render();window.scrollTo(0,0)}
 else if(a==='sesiubah'){var sx=BS.D.sesi.filter(function(x){return x.id===qid})[0];if(sx){BS.sf=bsNewSesi(sx);render();window.scrollTo(0,0)}}
 else if(a==='sesibatal'){BS.sf=null;render()}
 else if(a==='sesisimpan')bsSfSave();
 else if(a==='sfmapel'){bsSfRead();var mf=BS.sf.mapelF,ix=mf.indexOf(v);if(ix>-1)mf.splice(ix,1);else mf.push(v);render()}
 else if(a==='sesiaktif'){var sa=BS.D.sesi.filter(function(x){return x.id===qid})[0];if(sa){sa.aktif=sa.aktif===false;bsPut('sesi',sa).then(function(){render()});render()}}
 else if(a==='sesihasil'){BS.hs=qid;BS.tab='hasil';render();window.scrollTo(0,0)}
 else if(a==='sesihapus'){uiConfirm('Hapus sesi ini?\nHasil siswa yang sudah masuk tidak ikut terhapus.',{ok:'Hapus',danger:true}).then(function(ok){if(ok)bsDel('sesi',qid).then(function(){render()})})}
 else if(a==='ekspor')bsExport();
 else if(a==='hapushasil'){uiConfirm('Hapus hasil ini?\nSiswa bisa mengerjakan sesi ujian itu lagi.',{ok:'Hapus',danger:true}).then(function(ok){if(ok)bsDel('hasil',v).then(function(){render()})})}
});
document.addEventListener('change',function(e){
 var t=e.target;
 if(t.classList&&t.classList.contains('sf-id')&&BS.sf){
  var ix=BS.sf.ids.indexOf(t.value);if(t.checked&&ix<0)BS.sf.ids.push(t.value);else if(!t.checked&&ix>-1)BS.sf.ids.splice(ix,1);
  var n=document.getElementById('sf-n');if(n)n.textContent=BS.sf.ids.length+' soal dipilih. Hanya soal dengan peruntukan ujian atau keduanya yang tampil.';return;
 }
 if(t.id==='sf-pilih'||t.id==='sf-kelas'){bsSfRead();render();return}
 var a=t.dataset&&t.dataset.bs;if(!a)return;
 if(a==='tuj'){var id=t.dataset.q;(BS_IDX[id]?bsOverride(id,{tujuan:t.value}):bsPut('soal',Object.assign(BS.D.soal.filter(function(x){return x.id===id})[0],{tujuan:t.value}))).then(function(){toast('Peruntukan diubah')});BS.all=null}
 else if(a==='flt'){BS.flt[t.dataset.k]=t.value;BS.flt.n=30;render()}
 else if(a==='hs'){BS.hs=t.value;render()}
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(t.id==='bq-q'){BS.flt.q=t.value;BS.flt.n=30;bsRerenderList()}
 else if(t.id==='sf-q'&&BS.sf){BS.sf.q=t.value;var l=document.getElementById('sf-list');if(l)l.outerHTML=bsSfManual()}
});
