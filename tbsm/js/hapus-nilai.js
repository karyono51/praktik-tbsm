/* hapus-nilai.js: Admin menghapus seluruh nilai yang sudah masuk (di server dan di perangkat ini).
   Menu: Administrasi > Hapus nilai. Hanya peran aktif Admin (can('hapus')); izin hapus juga dijaga server (label admin).
   Tidak ikut terhapus: akun, LKPD, bank soal, sesi ujian, observasi guru, dan berkas foto di Google Drive. */
var HN={sel:{hasil:true,lkpd:true,bukti:true,ujian:true},cnt:null,hit:false,ket:'',busy:false,log:[],prog:''};
var HN_URUT=['hasil','lkpd','bukti','ujian'];
var HN_KOL={
 hasil:{nama:'Hasil penilaian',sub:'Rekap nilai, UKK, penilaian guru, dan latihan',cols:['hasil']},
 lkpd:{nama:'LKPD Praktik',sub:'Pengumpulan siswa dan nilai koreksi guru',cols:['lkpd']},
 bukti:{nama:'Foto bukti praktik',sub:'Foto LKPD dan UKK. Berkas di Drive tidak ikut terhapus',cols:['lkpd_bukti']},
 ujian:{nama:'Ujian CBT dan latihan Bank soal',sub:'Nilai dan sesi pengerjaan siswa',cols:['soal_hasil','soal_run']}
};
var HN_FRASA='HAPUS NILAI';
if(typeof ICO!=='undefined'&&!ICO.hapus)ICO.hapus='<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>';
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('hapusnilai')<0)NAVTABS.push('hapusnilai');

function hnAdmin(){return !!S.user&&can('hapus')}
function hnTotal(){return HN_URUT.reduce(function(t,k){return HN.sel[k]&&HN.cnt&&HN.cnt[k]>0?t+HN.cnt[k]:t},0)}

/* Jumlah dokumen per jenis: dari server bila online, dari perangkat bila mode lokal */
async function hnHitung(){
 if(HN.hit)return;HN.hit=true;
 var c={};
 if(!Cloud.on){
  c={hasil:(S.results||[]).length,lkpd:(S.lkpd||[]).length,bukti:(S.lkpdBukti||[]).length,ujian:0};
 }else{
  for(var i=0;i<HN_URUT.length;i++){
   var k=HN_URUT[i],n=0,ok=true;
   for(var j=0;j<HN_KOL[k].cols.length;j++){
    try{var r=await Cloud.db.listDocuments(CFG.DB,HN_KOL[k].cols[j],[Appwrite.Query.limit(1)]);n+=Number(r.total)||0}
    catch(e){if(!/not be found|not found|404/i.test(String((e&&e.message)||e)))ok=false}
   }
   c[k]=ok?n:-1;
  }
 }
 HN.cnt=c;render();
}

/* Kosongkan satu koleksi di server: ambil 50, hapus 5 sekaligus, ulangi sampai habis atau tidak ada kemajuan */
async function hnKosongkan(col,tick){
 var n=0,gal={},guard=0;
 for(;;){
  if(++guard>4000)break;
  var r;
  try{r=await Cloud.db.listDocuments(CFG.DB,col,[Appwrite.Query.limit(50)])}
  catch(e){if(/not be found|not found|404/i.test(String((e&&e.message)||e)))return {n:n,gagal:Object.keys(gal).length,skip:true};throw e}
  var d=r.documents||[];if(!d.length)break;
  var bad=0;
  for(var i=0;i<d.length;i+=5){
   await Promise.all(d.slice(i,i+5).map(function(x){return Cloud.db.deleteDocument(CFG.DB,col,x.$id).then(function(){n++},function(){bad++;gal[x.$id]=1})}));
   if(tick)tick(n);
  }
  if(bad>=d.length)break;
 }
 return {n:n,gagal:Object.keys(gal).length};
}

async function hnJalan(){
 if(!hnAdmin()||HN.busy)return;
 var pilih=HN_URUT.filter(function(k){return HN.sel[k]});
 if(!pilih.length){toast('Pilih minimal satu jenis data');return}
 if(HN.ket.trim().toUpperCase()!==HN_FRASA){toast('Ketik '+HN_FRASA+' untuk melanjutkan');return}
 if(Cloud.on&&navigator.onLine===false){toast('Offline: penghapusan butuh internet');return}
 HN.busy=true;HN.log=[];HN.prog='';render();
 var gagalTotal=0;
 try{
  for(var i=0;i<pilih.length;i++){
   var k=pilih[i],ringkas=[];
   if(Cloud.on){
    for(var j=0;j<HN_KOL[k].cols.length;j++){
     var col=HN_KOL[k].cols[j];
     var r=await hnKosongkan(col,function(n){var el=document.getElementById('hn-prog');if(el)el.textContent='Menghapus '+col+': '+n+' dokumen…'});
     gagalTotal+=r.gagal;
     ringkas.push(r.skip?col+': koleksi belum ada':col+': '+r.n+' terhapus'+(r.gagal?', '+r.gagal+' gagal':''));
    }
   }else ringkas.push('perangkat ini');
   HN.log.push(HN_KOL[k].nama+' ('+ringkas.join('; ')+')');
  }
  /* bersihkan salinan di perangkat ini */
  if(HN.sel.hasil)S.results=[];
  if(HN.sel.lkpd){S.lkpd=[];if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-records','[]')}catch(e){}}}
  if(HN.sel.bukti){S.lkpdBukti=[];if(typeof LK!=='undefined')LK.remote={};if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti','[]')}catch(e){}}}
  try{if(typeof persist==='function')persist();else if(typeof save==='function')save()}catch(e){}
  HN.cnt=null;HN.hit=false;HN.ket='';
  toast(gagalTotal?'Selesai, '+gagalTotal+' dokumen gagal dihapus':'Nilai terpilih sudah dihapus');
 }catch(e){
  HN.log.push('Berhenti karena galat: '+String((e&&e.message)||e).slice(0,160));
 }
 HN.busy=false;render();
 try{if(Cloud.on&&typeof refreshData==='function')refreshData()}catch(e){}
}

function viewHapusNilai(){
 if(!HN.hit&&!HN.busy)setTimeout(hnHitung,0);
 var rows=HN_URUT.map(function(k){
  var c=HN.cnt?HN.cnt[k]:null,pill=c==null?'…':c<0?'tidak terbaca':c+' data';
  return '<label class="card row sb" style="align-items:center;gap:12px;cursor:pointer"><span style="display:flex;gap:12px;align-items:center;min-width:0"><input type="checkbox" data-act="hn-cek" data-v="'+k+'"'+(HN.sel[k]?' checked':'')+(HN.busy?' disabled':'')+'><span style="min-width:0"><b>'+HN_KOL[k].nama+'</b><br><small class="note">'+HN_KOL[k].sub+'</small></span></span><span class="pill">'+pill+'</span></label>';
 }).join('');
 var ok=HN.ket.trim().toUpperCase()===HN_FRASA&&hnTotal()>=0&&HN_URUT.some(function(k){return HN.sel[k]})&&!HN.busy;
 var log=HN.log.length?'<section class="card"><h3>Hasil</h3><ul class="plain">'+HN.log.map(function(l){return '<li>'+esc(l)+'</li>'}).join('')+'</ul></section>':'';
 return '<div class="row sb"><h2>Hapus nilai</h2><span class="pill bad">Admin</span></div>'+
  '<section class="card"><p class="note">Menghapus nilai siswa yang sudah masuk, di server dan di perangkat ini. <b>Tidak bisa dibatalkan.</b> Akun, LKPD, bank soal, sesi ujian, dan observasi guru tidak ikut terhapus. Perangkat lain perlu menekan Segarkan.</p>'+
  '<div class="row"><button type="button" class="btn small" data-act="xlsrekap">Unduh Excel rekap dulu</button></div></section>'+
  rows+
  '<section class="card"><label for="hn-ket"><b>Ketik '+HN_FRASA+' untuk melanjutkan</b></label><input id="hn-ket" type="text" autocomplete="off" autocapitalize="characters" value="'+esc(HN.ket)+'"'+(HN.busy?' disabled':'')+' style="margin:8px 0">'+
  '<button type="button" id="hn-go" class="btn danger" data-act="hn-go"'+(ok?'':' disabled')+'>'+(HN.busy?'Menghapus…':'Hapus nilai terpilih')+'</button>'+
  '<p id="hn-prog" class="note" aria-live="polite">'+esc(HN.prog)+'</p></section>'+log;
}

var _viewKatHn=viewKatalog;
viewKatalog=function(){
 if(S.tab==='hapusnilai'&&hnAdmin())return viewHapusNilai();
 return _viewKatHn.apply(this,arguments);
};
var _renderHn=render;
render=function(){
 _renderHn.apply(this,arguments);
 try{
  if(!S.user||!hnAdmin())return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="hapusnilai"]'))return;
  var cur=V.mode==='list'?S.tab:'';
  sb.insertAdjacentHTML('beforeend','<button type="button" class="srow" data-act="menu" data-v="hapusnilai"'+(cur==='hapusnilai'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.hapus,22)+'</span><span class="st"><b>Hapus nilai</b><small>Hapus seluruh nilai yang sudah masuk</small></span>'+svg(ICO.chev,18)+'</button>');
 }catch(e){}
};
document.addEventListener('change',function(e){
 var c=e.target.closest&&e.target.closest('[data-act="hn-cek"]');if(!c||HN.busy)return;
 HN.sel[c.dataset.v]=!!c.checked;render();
});
document.addEventListener('input',function(e){
 if(!e.target||e.target.id!=='hn-ket')return;
 HN.ket=e.target.value;
 var go=document.getElementById('hn-go');
 if(go)go.disabled=!(HN.ket.trim().toUpperCase()===HN_FRASA&&HN_URUT.some(function(k){return HN.sel[k]})&&!HN.busy);
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="hn-go"]');if(!b)return;
 hnJalan();
});
/* keluar dari halaman ini: reset isian agar tidak terbawa */
document.addEventListener('click',function(e){
 var m=e.target.closest&&e.target.closest('[data-act="menu"],[data-act="tab"]');
 if(m&&m.dataset.v!=='hapusnilai'&&!HN.busy){HN.ket='';HN.log=[];HN.hit=false;HN.cnt=null}
});
