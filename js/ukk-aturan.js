/* ukk-aturan.js: aturan angka dan nilai butir untuk unit UKK (form Hasil aktual, Status, Catatan).
   NILAI BUTIR (1 atau 0, semua butir berbobot sama):
     - Butir berangka: sistem membaca angka dari Hasil aktual dan menentukan status yang benar (di luar batas standar = Tidak sesuai).
       Dapat nilai bila status pilihan siswa sama dengan status yang benar. Bila status Tidak sesuai, Catatan tindakan wajib terisi.
     - Butir tanpa angka: dapat nilai bila Hasil aktual, Status, dan Catatan terisi semua.
     - Butir campuran (angka dan teks): angka dinilai seperti butir berangka, dan Hasil aktual harus memuat teks selain angka dan satuan.
   NILAI UNIT = persentase butir yang dapat nilai (dibulatkan). Kompeten bila nilai >= KKM; butir kritis tidak lagi dipakai.
   BENTUK ATURAN per butir (daftar bagian, satu angka per bagian, urut di Hasil aktual):
     {r:[a,b]} rentang | {min:x} batas minimal | {max:x} batas maksimal | {v:x,tol:%} nilai tetap dengan toleransi | {a:[x,y],tol:%} salah satu dari beberapa nilai.
     Nilai tepat di batas dianggap Sesuai. h = petunjuk isian, tk = butir campuran. Butir tanpa aturan = tanpa angka. */
var UKK_ATURAN={
 'UKK-1-0':{p:[{r:[13,13.2]}],h:'Tegangan (V)'},
 'UKK-1-1':{p:[{a:[0.8,0.9],tol:5}],h:'Volume (L)'},
 'UKK-1-2':{p:[{a:[0.12,0.14],tol:5}],h:'Volume (L)'},
 'UKK-1-4':{p:[{v:0.51,tol:5}],tk:1,h:'Volume (L) dan level'},
 'UKK-1-5':{p:[{r:[0.08,0.12]},{r:[0.22,0.26]}],h:'IN; EX (mm)'},
 'UKK-1-7':{p:[{r:[0.8,0.9]}],tk:1,h:'Celah (mm) dan tipe busi'},
 'UKK-1-8':{p:[{r:[1600,1800]}],h:'Putaran (rpm)'},
 'UKK-1-9':{p:[{r:[2,6]}],h:'Jarak main (mm)'},
 'UKK-1-10':{p:[{v:294,tol:5},{min:98}],tk:1,h:'Tekanan (kPa); aliran (cm³/10 detik); bocor atau tidak'},
 'UKK-2-1':{p:[{min:17.5}],h:'Lebar (mm)'},
 'UKK-2-2':{p:[{min:17.3}],h:'Diameter (mm)'},
 'UKK-2-3':{p:[{min:2}],tk:1,h:'Tebal kanvas (mm) dan kondisi pegas'},
 'UKK-2-6':{p:[{max:112.5}],h:'Diameter dalam (mm)'},
 'UKK-2-7':{p:[{min:124.7}],tk:1,h:'Panjang bebas (mm) dan kekenduran'},
 'UKK-3-0':{p:[{r:[25,35]}],tk:1,h:'Kekenduran (mm) dan kondisi sprocket'},
 'UKK-3-1':{p:[{r:[10,20]}],h:'Jarak main (mm)'},
 'UKK-3-3':{p:[{min:3},{max:0.3}],h:'Tebal (mm); keolengan (mm)'},
 'UKK-3-6':{p:[{r:[20,30]}],h:'Jarak main (mm)'},
 'UKK-3-8':{p:[{r:[20,30]}],h:'Jarak main (mm)'},
 'UKK-3-9':{p:[{max:111}],h:'Diameter dalam (mm)'}
};
var UKK_EPS=1e-9;
/* angka dari teks: koma = desimal, titik ribuan (1.700) dibuang */
function ukkAngka(s){
 var t=String(s==null?'':s).replace(/(\d)\.(\d{3})(?!\d)/g,'$1$2').replace(/(\d),(\d)/g,'$1.$2');
 return (t.match(/\d+(?:\.\d+)?/g)||[]).map(Number)}
function ukkAdaTeks(s){
 var t=String(s==null?'':s).replace(/\d+(?:[.,]\d+)?/g,' ').replace(/\b(mm|cm3|cm|rpm|kpa|volt|ml|detik|dtk|sec|v|l|g|s)\b/gi,' ');
 return /[a-zA-Z]{3,}/.test(t)}
function ukkBagianOk(b,x){
 if(b.r)return x>=b.r[0]-UKK_EPS&&x<=b.r[1]+UKK_EPS;
 if(b.min!=null)return x>=b.min-UKK_EPS;
 if(b.max!=null)return x<=b.max+UKK_EPS;
 if(b.v!=null){var d=b.v*(b.tol||0)/100;return x>=b.v-d-UKK_EPS&&x<=b.v+d+UKK_EPS}
 if(b.a)return b.a.some(function(y){var d=y*(b.tol||0)/100;return x>=y-d-UKK_EPS&&x<=y+d+UKK_EPS});
 return false}
/* hasil: {poin:0|1, benar:0|1|null (status yang benar bila berangka), perlu:{hasil,status,catatan} bagian yang masih kurang} */
function ukkNilaiButir(item,status,hasil,catatan){
 var ar=UKK_ATURAN[item.id],h=String(hasil||'').trim(),c=String(catatan||'').trim(),kurang=[];
 var ada=status===1||status===0;
 if(!h)kurang.push('hasil');
 if(!ada)kurang.push('status');
 if(!ar){ /* tanpa angka */
  if(!c)kurang.push('catatan');
  return {poin:kurang.length?0:1,benar:null,kurang:kurang}}
 var n=ukkAngka(h);
 if(h&&n.length<ar.p.length)kurang.push('angka');
 if(ar.tk&&h&&!ukkAdaTeks(h))kurang.push('teks');
 var benar=null;
 if(n.length>=ar.p.length)benar=ar.p.every(function(b,i){return ukkBagianOk(b,n[i])})?1:0;
 if(ada&&status===0&&!c)kurang.push('catatan');
 var poin=(!kurang.length&&benar!==null&&status===benar)?1:0;
 return {poin:poin,benar:benar,kurang:kurang}}
/* calc untuk unit UKK: nilai unit = persentase butir yang dapat nilai */
function ukkCalc(job,checks,kkm,hs,hn){
 hs=hs||{};hn=hn||{};
 var by={},unmet=[],y=0,det={};
 Object.keys(ASPEK).forEach(function(a){by[a]={y:0,n:0}});
 job.items.forEach(function(i){
  var r=ukkNilaiButir(i,checks[i.id],hs[i.id],hn[i.id]);det[i.id]=r;
  if(r.poin){y++;by[i.a||'R'].y++}else{unmet.push(i);by[i.a||'R'].n++}});
 var n=job.items.length,score=n?Math.round(100*y/n):0;
 return {score:score,by:by,crit:[],unmet:unmet,kompeten:score>=kkm,butir:det}}
(function(){
 var c0=calc;
 calc=function(job,checks,kkm,hs,hn){
  if(job&&job.ukk&&hs!==undefined)return ukkCalc(job,checks,kkm,hs,hn);
  return c0.apply(this,arguments)};
})();
/* petunjuk isian dan penanda kekurangan di form */
function ukkHint(i){var a=UKK_ATURAN[i.id];return a&&a.h?a.h:'Hasil aktual'}
var UKK_KURANG={hasil:'hasil aktual',status:'status',angka:'angka',teks:'teks',catatan:'catatan'};
function ukkNeedHtml(i,status,hasil,catatan){
 var r=ukkNilaiButir(i,status,hasil,catatan),k=r.kurang;
 return k.length?'Perlu: '+k.map(function(x){return UKK_KURANG[x]}).join(', '):''}
function ukkTampilNeed(id){
 var row=document.querySelector('.ukk-row[data-id="'+id+'"]');if(!row||typeof V==='undefined'||!V.job)return;
 var it=V.job.items.filter(function(x){return x.id===id})[0],el=row.querySelector('.ukk-need');if(!it||!el)return;
 var v=V.checks[id],hs=hsOf()[id],hn=hnOf()[id];
 el.textContent=(v===undefined&&!hs&&!hn)?'':ukkNeedHtml(it,v,hs,hn)}
document.addEventListener('input',function(e){var t=e.target,id=t&&t.dataset&&(t.dataset.hs||t.dataset.hn);if(id)ukkTampilNeed(id)});
document.addEventListener('change',function(e){var t=e.target,id=t&&t.dataset&&t.dataset.ukst;if(id)ukkTampilNeed(id)});
