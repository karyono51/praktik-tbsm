/* ukk-akhir.js: rekap nilai UKK per unit, per observasi, dan nilai akhir per pasangan.
   Pasangan: UKK-1 + Observasi 1 (Engine), UKK-2 + Observasi 2 (CVT), UKK-3 + Observasi 3 (Rem), UKK-4 + Observasi 4 (Bodi).
   Nilai pasangan = bobot unit x nilai unit + bobot observasi x nilai observasi (bawaan 40 : 60, bisa diubah admin di halaman ini).
   Nilai akhir  = rata-rata nilai pasangan yang sudah lengkap; "lengkap" bila keempat pasangan lengkap, selain itu "sementara".
   Kesimpulan   = tabel konversi (91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, <61 Belum Kompeten).
   Remedial     = pasangan di bawah 61 mengulang unit dan observasinya; hasil terbaru otomatis menggantikan yang lama. */
var UA={kel:''};
var UKK_PAS=[{u:'UKK-1',o:'vario'},{u:'UKK-2',o:'cvt'},{u:'UKK-3',o:'rem'},{u:'UKK-4',o:'bodi'}];
function uaBobot(){var w=parseInt(localStorage.getItem('tbsm-ukk-bobot'),10);return isFinite(w)&&w>=0&&w<=100?w:40}
function uaKey(id,nama){
 if(id)return id;var n=String(nama||'').trim().toLowerCase();
 var u=(S.users||[]).find(function(x){return String(x.nama||'').trim().toLowerCase()===n});
 return u?u.id:'n:'+n}
function uaRata(a){var b=a.filter(function(x){return x!=null});return b.length?Math.round(b.reduce(function(t,x){return t+x},0)/b.length):null}
function uaData(kel){
 var M={},wU=uaBobot(),wO=100-wU;
 function ambil(k,nama,kelas){return M[k]||(M[k]={key:k,nama:nama,kelas:kelas,unit:{},obs:{}})}
 schHasilList(S.results||[]).filter(function(r){return /^UKK-\d+$/.test(r.jobId||'')&&r.tipe==='Penilaian'&&(!kel||r.kelas===kel)})
  .sort(function(a,b){return a.ts-b.ts}).forEach(function(r){var o=ambil(uaKey(r.sid,r.siswa),r.siswa,r.kelas);o.unit[r.jobId]=+r.score||0});
 obuRekapData(kel).forEach(function(x){
  var k=(S.users||[]).some(function(u){return u.id===x.key})?x.key:uaKey('',x.nama),o=ambil(k,x.nama,x.kelas);
  Object.keys(x.per).forEach(function(l){o.obs[l]=x.per[l].nilai})});
 return Object.keys(M).map(function(k){
  var s=M[k];
  s.pas=UKK_PAS.map(function(p){
   var u=s.unit[p.u],o=s.obs[p.o],nil=(u!=null&&o!=null)?Math.round(wU*u/100+wO*o/100):null;
   return {p:p,u:u,o:o,nilai:nil,kat:nil!=null?obuKat(nil):'',remedial:nil!=null&&nil<61}});
  var lk=s.pas.filter(function(x){return x.nilai!=null});
  s.avgU=uaRata(s.pas.map(function(x){return x.u}));s.avgO=uaRata(s.pas.map(function(x){return x.o}));
  s.akhir=uaRata(lk.map(function(x){return x.nilai}));s.kat=s.akhir!=null?obuKat(s.akhir):'';
  s.lengkap=lk.length===UKK_PAS.length;s.nRem=s.pas.filter(function(x){return x.remedial}).length;
  return s}).sort(function(a,b){return String(a.kelas).localeCompare(String(b.kelas))||String(a.nama).localeCompare(String(b.nama))})}
function uaNama(p){return (OBU.lb[p.o]&&OBU.lb[p.o].nama)||p.o}
function viewNilaiAkhirUkk(){
 var R=uaData(UA.kel),wU=uaBobot(),wO=100-wU,adm=can('kkm'),n=R.length,lg=R.filter(function(s){return s.lengkap}).length,rm=R.filter(function(s){return s.nRem}).length;
 var kopt='<option value="">Semua kelas</option>'+Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(UA.kel===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var cards=R.map(function(s){
  var rows=s.pas.map(function(x){
   return '<div class="item"><div class="row sb"><span class="note"><b>'+x.p.u+'</b> + Observasi '+(UKK_PAS.indexOf(x.p)+1)+' · '+esc(uaNama(x.p))+'</span>'+
    (x.nilai!=null?'<span><b class="mono">'+x.nilai+'</b> <span class="pill '+obuPill(x.kat)+'">'+esc(x.kat)+'</span></span>':'<span class="muted">belum lengkap</span>')+'</div>'+
    '<div class="row sb"><span class="note">Unit '+(x.u!=null?'<b class="mono">'+x.u+'</b>':'-')+' · Observasi '+(x.o!=null?'<b class="mono">'+x.o+'</b>':'-')+'</span>'+
    (x.remedial?'<span class="pill bad">Remedial: ulang '+x.p.u+' dan Observasi '+(UKK_PAS.indexOf(x.p)+1)+'</span>':'')+'</div></div>'}).join('');
  return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(s.nama)+'</h3>'+(s.akhir!=null?'<span class="pill '+obuPill(s.kat)+'">'+esc(s.kat)+'</span>':'')+'</div>'+
   '<div class="meta"><span>Kelas '+esc(s.kelas)+'</span><span>'+(s.lengkap?'Lengkap':'Sementara')+'</span></div>'+rows+
   '<div class="row sb"><span class="note">Rata-rata unit</span><b class="mono">'+(s.avgU!=null?s.avgU:'-')+'</b></div>'+
   '<div class="row sb"><span class="note">Rata-rata observasi</span><b class="mono">'+(s.avgO!=null?s.avgO:'-')+'</b></div>'+
   '<div class="row sb"><span class="note"><b>Nilai akhir</b> ('+(s.lengkap?'4 pasangan lengkap':'sementara')+')</span><b class="mono">'+(s.akhir!=null?s.akhir:'-')+'</b></div></article>'}).join('');
 return '<div class="row sb"><div><h2>Rekap Nilai Akhir UKK</h2><p class="note">Nilai unit dan observasi terbaru tiap siswa. Nilai remedial otomatis menggantikan nilai lama.</p></div><button type="button" class="btn small" data-act="menu" data-v="katalog">Kembali</button></div>'+
  '<label class="f">Kelas<select id="uakel">'+kopt+'</select></label>'+
  '<div class="card"><span class="label">Bobot nilai pasangan</span><div class="row sb"><label class="f grow">Unit UKK (%)<input type="number" id="uabobot" min="0" max="100" step="1" value="'+wU+'"'+(adm?'':' disabled')+'></label><div><span class="label">Observasi (%)</span><b class="mono" id="uawo">'+wO+'</b></div></div>'+
  '<p class="note">'+(adm?'Observasi otomatis = 100 dikurangi bobot unit.':'Bobot hanya dapat diubah admin.')+'</p></div>'+
  '<div class="stats"><div class="card"><span class="label">Siswa</span><b class="mono">'+n+'</b></div><div class="card"><span class="label">Lengkap</span><b class="mono">'+lg+'</b></div><div class="card"><span class="label">Perlu remedial</span><b class="mono">'+rm+'</b></div></div>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="ua-xls"'+(n?'':' disabled')+'>Unduh rekap (Excel)</button></div>'+
  '<div class="jobs">'+(cards||'<div class="card"><p class="muted">Belum ada nilai unit atau observasi'+(UA.kel?' untuk kelas ini':'')+'.</p></div>')+'</div>'}
function uaXls(){
 if(!needX())return;var R=uaData(UA.kel);if(!R.length){toast('Belum ada data untuk diunduh');return}
 var wU=uaBobot(),wO=100-wU,h=['No','Nama siswa','Kelas'];
 UKK_PAS.forEach(function(p,i){h=h.concat([p.u,'Observasi '+(i+1),'Nilai pasangan '+(i+1),'Kesimpulan '+(i+1)])});
 h=h.concat(['Rata-rata unit','Rata-rata observasi','Nilai akhir','Kesimpulan akhir','Status','Remedial']);
 var rows=[h].concat(R.map(function(s,i){var r=[i+1,s.nama,s.kelas];
  s.pas.forEach(function(x){r=r.concat([x.u!=null?x.u:'',x.o!=null?x.o:'',x.nilai!=null?x.nilai:'',x.kat])});
  return r.concat([s.avgU!=null?s.avgU:'',s.avgO!=null?s.avgO:'',s.akhir!=null?s.akhir:'',s.kat,s.lengkap?'Lengkap':'Sementara',s.pas.filter(function(x){return x.remedial}).map(function(x){return x.p.u}).join(', ')])}));
 var info=[['Rekap Nilai Akhir UKK'],['Kelas',UA.kel||'Semua kelas'],['Bobot unit (%)',wU],['Bobot observasi (%)',wO],['Jumlah siswa',R.length],[],
  ['Kesimpulan','Rentang nilai'],['Sangat Kompeten','91-100'],['Kompeten','75-90'],['Cukup Kompeten','61-74'],['Belum Kompeten','<61 (remedial: ulang unit dan observasi pasangan)']];
 book([['Nilai Akhir',rows,[5,26,8].concat(UKK_PAS.reduce(function(a){return a.concat([8,12,14,16])},[])).concat([14,18,12,18,11,14])],['Info',info,[34,48]]],'Nilai_Akhir_UKK')}
document.addEventListener('change',function(e){
 var t=e.target;if(!t)return;
 if(t.id==='uakel'){UA.kel=t.value;render();return}
 if(t.id==='uabobot'){if(!can('kkm'))return;var w=parseInt(t.value,10);if(!isFinite(w))w=40;w=Math.max(0,Math.min(100,w));try{localStorage.setItem('tbsm-ukk-bobot',String(w))}catch(x){}render()}});
document.addEventListener('input',function(e){var t=e.target;if(t&&t.id==='uabobot'){var w=parseInt(t.value,10),el=document.getElementById('uawo');if(el&&isFinite(w))el.textContent=Math.max(0,Math.min(100,100-w))}});
document.addEventListener('click',function(e){var b=e.target.closest('[data-act="ua-xls"]');if(b&&can('observasi'))uaXls()});
var _viewKatA=viewKatalog;
viewKatalog=function(){if(S.tab==='nilai-akhir-ukk'&&can('observasi'))return viewNilaiAkhirUkk();return _viewKatA.apply(this,arguments)};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('nilai-akhir-ukk')<0)NAVTABS.push('nilai-akhir-ukk');
ICO['nilai-akhir-ukk']=ICO['observasi-ukk']||ICO.observasi;
var _renderA=render;
render=function(){
 _renderA.apply(this,arguments);
 try{
  if(!S.user||!can('observasi'))return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="nilai-akhir-ukk"]'))return;
  var cur=V.mode==='list'?S.tab:'';
  var html='<button type="button" class="srow" data-act="menu" data-v="nilai-akhir-ukk"'+(cur==='nilai-akhir-ukk'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO['nilai-akhir-ukk'],22)+'</span><span class="st"><b>Nilai Akhir UKK</b><small>Unit + observasi per pasangan, remedial</small></span>'+svg(ICO.chev,18)+'</button>';
  var ref=sb.querySelector('[data-v="observasi-ukk"]');
  if(ref)ref.insertAdjacentHTML('afterend',html);else sb.insertAdjacentHTML('beforeend',html)
 }catch(err){}};
