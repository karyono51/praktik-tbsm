/* butir.js: analisis butir soal (tingkat kesukaran, daya pembeda) di luar satu sesi.
   - Rumus sama dengan Analisis sesi di cbt-staf.js: kesukaran p = rata-rata skor soal (0 sampai 1); daya pembeda = rata-rata skor
     kelompok atas (27% nilai tertinggi) dikurangi kelompok bawah (27% terendah). Daya pembeda perlu minimal 6 pengerja (kelompok 2 orang).
     p: Sukar di bawah 0,30; Sedang 0,30-0,69; Mudah 0,70 ke atas. Daya pembeda: Baik 0,40 ke atas; Cukup 0,20-0,39; Perlu revisi 0-0,19;
     Bermasalah di bawah 0 (biasanya kunci salah atau soal ambigu).
   - Bank soal: statistik tiap soal dari SEMUA hasil ujian (bukan latihan) yang memuat soal itu, tampil sebagai label di daftar Bank soal
     dan filter "Statistik". Peringkat memakai nilai akhir ujian. Label baru diberi bila pengerja minimal BTR.MIN.
   - Kuis LKPD: daya pembeda per soal (lkpd-analisis.js) memakai fungsi btrItem di sini, peringkat dari skor total kuis.
   Bergantung pada: banksoal.js (bs*). Dimuat setelah cetak-soal.js. */
var BTR={cache:null,key:'',MIN:10};

function btrKes(p){return p===null||p===undefined?'-':p>=0.7?'Mudah':p>=0.3?'Sedang':'Sukar'}
function btrDbk(db){return db===null||db===undefined?'-':db>=0.4?'Baik':db>=0.2?'Cukup':db>=0?'Perlu revisi':'Bermasalah'}
function btrMean(a){return a.length?a.reduce(function(t,x){return t+x.f},0)/a.length:0}
/* rows: [{t:skor total pengerja, f:skor soal 0..1}] -> {n, p, db, kes, dbk} */
function btrItem(rows){
 var n=rows.length;
 if(!n)return {n:0,p:null,db:null,kes:'-',dbk:'-'};
 var p=btrMean(rows),db=null,g=Math.max(1,Math.round(n*0.27));
 if(g>=2){
  var s=rows.slice().sort(function(a,b){return b.t-a.t});
  db=btrMean(s.slice(0,g))-btrMean(s.slice(-g));
 }
 return {n:n,p:p,db:db,kes:btrKes(p),dbk:btrDbk(db)};
}
function btrF2(x){return x===null||x===undefined?'-':(Math.round(x*100)/100).toFixed(2).replace('.',',')}

/* ---------- Bank soal: statistik lintas sesi ---------- */
function btrBank(){
 var key=BS.D.hasil.length+':'+Object.keys(BS.kc||{}).length+':'+BS.D.soal.length;
 if(BTR.cache&&BTR.key===key)return BTR.cache;
 var by={};
 BS.D.hasil.forEach(function(h){
  if(h.mode!=='ujian'||!Array.isArray(h.order))return;
  var t=+h.score||0;
  h.order.forEach(function(id){
   var q=bsSoalById(id);if(!q||!bsHasKey(q))return;
   var fx=bsFracH(q,h.ans?h.ans[id]:null,h);if(fx===null)return;
   (by[id]=by[id]||[]).push({t:t,f:fx});
  });
 });
 var out={};Object.keys(by).forEach(function(id){out[id]=btrItem(by[id])});
 BTR.cache=out;BTR.key=key;return out;
}
function btrPill(id){
 var st=btrBank()[id];
 if(!st||!st.n)return '';
 if(st.n<BTR.MIN)return '<span class="pill plain" title="Label muncul bila minimal '+BTR.MIN+' pengerja">'+st.n+' pengerja ujian · data belum cukup</span>';
 return '<span class="pill '+(st.kes==='Mudah'?'ok':st.kes==='Sukar'?'bad':'warn')+'">p '+btrF2(st.p)+' · '+st.kes+'</span>'+
  (st.db===null?'':'<span class="pill '+(st.dbk==='Baik'?'ok':st.dbk==='Cukup'?'warn':'bad')+'">DB '+btrF2(st.db)+' · '+st.dbk+'</span>')+
  '<span class="pill plain">'+st.n+' pengerja</span>'+(st.db!==null&&st.db<0?'<span class="pill bad">Periksa kunci</span>':'');
}
var BTR_FLT=[['','Semua'],['sukar','Sukar (p di bawah 0,30)'],['mudah','Mudah (p 0,70 ke atas)'],['revisi','Daya beda rendah atau bermasalah'],['kosong','Belum ada data ujian']];
function btrCocok(id,f){
 var st=btrBank()[id],ok=!!(st&&st.n>=BTR.MIN);
 if(f==='kosong')return !st||!st.n;
 if(f==='sukar')return ok&&st.p<0.3;
 if(f==='mudah')return ok&&st.p>=0.7;
 if(f==='revisi')return ok&&st.db!==null&&st.db<0.2;
 return true;
}
if(typeof BS!=='undefined'&&BS.flt&&BS.flt.stat===undefined)BS.flt.stat='';
if(typeof bsFiltered==='function'){
 var _btrF=bsFiltered;
 bsFiltered=function(){
  var l=_btrF.apply(this,arguments),f=BS.flt&&BS.flt.stat;
  return f?l.filter(function(s){return btrCocok(s.id,f)}):l;
 };
}
if(typeof bsViewBank==='function'){
 var _btrVB=bsViewBank;
 bsViewBank=function(){
  var h=_btrVB.apply(this,arguments),k='</div><div class="stack" id="bq-list">',i=h.indexOf(k);
  if(i<0)return h;
  var cur=(BS.flt&&BS.flt.stat)||'';
  var sel='<label class="f">Statistik ujian<select data-bs="flt" data-k="stat">'+BTR_FLT.map(function(o){return '<option value="'+o[0]+'"'+(cur===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></label>';
  return h.slice(0,i)+sel+h.slice(i);
 };
}
