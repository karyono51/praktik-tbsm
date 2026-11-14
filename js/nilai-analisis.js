/* nilai-analisis.js: tab Analisis di Rekap nilai (Admin dan Guru).
   Menampilkan distribusi nilai, siswa remedial, rekap per unit, per kelas, per siswa, dan tren bulanan.
   Mengikuti filter kelas Rekap nilai. Ekspor Excel berisi tujuh lembar.
   Dimuat setelah siswa-ui.js karena membungkus viewRekap. */
var NA={tab:'data',mode:'penilaian'};
(function(){var st=document.createElement('style');st.textContent=
'.na-row{display:grid;gap:4px;padding:8px 0;border-top:1px solid var(--line)}.na-row:first-of-type{border-top:0}'+
'.na-bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.na-bar i{display:block;height:100%;background:var(--ok)}'+
'.na-bar[data-t="warn"] i{background:var(--warn)}.na-bar[data-t="bad"] i{background:var(--bad)}'+
'.na-wrap{overflow-x:auto}.na-tbl{width:100%;border-collapse:collapse;font-size:13px}'+
'.na-tbl th,.na-tbl td{padding:6px 4px;border-top:1px solid var(--line);text-align:left;vertical-align:top}'+
'.na-tbl th{font-weight:600;color:var(--muted)}.na-tbl .num{text-align:right;font-family:var(--f-mono)}';
document.head.appendChild(st)})();

/* ---------- Data ---------- */
function naList(){return filt().filter(function(r){return NA.mode==='semua'||r.tipe==='Penilaian'}).sort(function(a,b){return a.ts-b.ts})}
function naNum(r){return Number(r.score)||0}
function naAgg(L){
 var n=L.length,sc=L.map(naNum),sum=sc.reduce(function(t,x){return t+x},0);
 return {n:n,avg:n?Math.round(sum/n):0,min:n?Math.min.apply(null,sc):0,max:n?Math.max.apply(null,sc):0,
  kom:n?L.filter(function(r){return r.kompeten}).length/n:0};
}
function naPct(ws,rows,col){for(var r=2;r<=rows;r++){var c=ws[col+r];if(c)c.z='0%'}}
var NA_BIN=['0–59','60–69','70–79','80–89','90–100'];
function naBinOf(s){return s<60?0:s<70?1:s<80?2:s<90?3:4}
function naDist(L){
 var cnt=[0,0,0,0,0];L.forEach(function(r){cnt[naBinOf(naNum(r))]++});
 return NA_BIN.map(function(t,i){return {t:t,n:cnt[i],p:L.length?cnt[i]/L.length:0}});
}
function naPerSiswa(L){
 var by={};
 L.forEach(function(r){var k=String(r.kelas)+'\u0001'+(r.siswa||'Tanpa nama');(by[k]=by[k]||[]).push(r)});
 return Object.keys(by).map(function(k){
  var p=k.split('\u0001'),list=by[k].slice().sort(function(a,b){return a.ts-b.ts});
  return {kelas:p[0],nama:p[1],list:list,last:list[list.length-1],a:naAgg(list)};
 }).sort(function(x,y){return x.a.avg-y.a.avg||String(x.nama).localeCompare(String(y.nama))});
}
function naPerUnit(L){
 var by={};L.forEach(function(r){(by[r.jobId]=by[r.jobId]||[]).push(r)});
 return Object.keys(by).map(function(id){
  var j=jobById(id)||{},list=by[id];
  return {id:id,judul:j.judul||id,kelas:j.kelas||list[0].kelas||'',a:naAgg(list)};
 }).sort(function(x,y){return (x.kelas<y.kelas?-1:x.kelas>y.kelas?1:0)||x.judul.localeCompare(y.judul)});
}
function naPerKelas(L){
 return ['X','XI','XII'].map(function(c){var l=L.filter(function(r){return r.kelas===c});return {k:c,a:naAgg(l),siswa:naPerSiswa(l).length}}).filter(function(x){return x.a.n});
}
function naTren(L){
 var by={};
 L.forEach(function(r){var d=new Date(r.ts),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');(by[k]=by[k]||[]).push(r)});
 return Object.keys(by).sort().map(function(k){return {bulan:k,a:naAgg(by[k])}});
}
function naRemedial(per){
 return per.filter(function(x){return x.last&&!x.last.kompeten}).sort(function(x,y){return naNum(x.last)-naNum(y.last)});
}

/* ---------- Tampilan ---------- */
function naBar(label,pct,extra,tone){
 var p=Math.round(pct*100),t=tone||(p<50?'bad':p<75?'warn':'ok');
 return '<div class="na-row"><div class="row sb"><span>'+label+'</span><b class="mono">'+p+'%</b></div><div class="na-bar" data-t="'+t+'" role="img" aria-label="'+p+' persen"><i style="width:'+p+'%"></i></div>'+(extra?'<div class="note">'+extra+'</div>':'')+'</div>';
}
function naChips(){
 return '<div class="chips" role="group" aria-label="Filter kelas">'+['ALL','X','XI','XII'].map(function(c){
  return '<button type="button" data-act="filter" data-v="'+c+'" aria-pressed="'+(S.filter===c)+'">'+(c==='ALL'?'Semua':'Kelas '+c)+'</button>'}).join('')+'</div>';
}
function naView(){
 var L=naList(),a=naAgg(L);
 var h='<div class="chips" role="group" aria-label="Jenis data">'+[['penilaian','Penilaian'],['semua','Penilaian + Latihan']].map(function(c){
  return '<button type="button" data-act="na-mode" data-v="'+c[0]+'" aria-pressed="'+(NA.mode===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>';
 if(!a.n)return h+'<div class="card"><p class="muted">Belum ada data untuk filter ini.</p></div>';
 var per=naPerSiswa(L),rem=naRemedial(per),dist=naDist(L);
 h+='<div class="stats"><div class="card"><span class="label">Data</span><b class="mono">'+a.n+'</b></div><div class="card"><span class="label">Siswa</span><b class="mono">'+per.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+a.avg+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+Math.round(a.kom*100)+'%</b></div></div>';
 h+='<section class="card"><h3>Distribusi nilai</h3><p class="note">Terendah '+a.min+', tertinggi '+a.max+', KKM '+S.kkm+'.</p>'+dist.map(function(b){return naBar(b.t+' ('+b.n+')',b.p,'','ok')}).join('')+'</section>';
 h+='<section class="card"><h3>Perlu remedial ('+rem.length+')</h3>'+(rem.length?'<p class="note">Pengumpulan terakhir siswa berstatus belum kompeten.</p>'+rem.map(function(x){return '<div class="row sb"><span>'+esc(x.nama)+' · '+esc(x.kelas)+'</span><b class="mono">'+naNum(x.last)+'</b></div>'}).join(''):'<p class="muted">Semua siswa berstatus kompeten pada data ini.</p>')+'</section>';
 h+='<section class="card"><h3>Per unit</h3><div class="na-wrap"><table class="na-tbl"><tr><th>Unit</th><th class="num">Data</th><th class="num">Rata</th><th class="num">Kompeten</th></tr>'+
  naPerUnit(L).map(function(u){return '<tr><td>'+esc(u.judul)+'<div class="note">Kelas '+esc(u.kelas)+'</div></td><td class="num">'+u.a.n+'</td><td class="num">'+u.a.avg+'</td><td class="num">'+Math.round(u.a.kom*100)+'%</td></tr>'}).join('')+'</table></div></section>';
 h+='<section class="card"><h3>Per kelas</h3><div class="na-wrap"><table class="na-tbl"><tr><th>Kelas</th><th class="num">Siswa</th><th class="num">Data</th><th class="num">Rata</th><th class="num">Kompeten</th></tr>'+
  naPerKelas(L).map(function(k){return '<tr><td>'+k.k+'</td><td class="num">'+k.siswa+'</td><td class="num">'+k.a.n+'</td><td class="num">'+k.a.avg+'</td><td class="num">'+Math.round(k.a.kom*100)+'%</td></tr>'}).join('')+'</table></div></section>';
 h+='<section class="card"><h3>Tren bulanan</h3><p class="note">Bar menunjukkan persen kompeten tiap bulan.</p>'+naTren(L).map(function(t){return naBar(t.bulan+' · '+t.a.n+' data · rata-rata '+t.a.avg,t.a.kom)}).join('')+'</section>';
 h+='<section class="card"><h3>Per siswa</h3><p class="note">Diurutkan dari rata-rata terendah. Status mengikuti pengumpulan terakhir.</p><div class="na-wrap"><table class="na-tbl"><tr><th>Siswa</th><th class="num">Data</th><th class="num">Rata</th><th class="num">Terakhir</th><th>Status</th></tr>'+
  per.map(function(x){var ok=!!x.last.kompeten;return '<tr><td>'+esc(x.nama)+'<div class="note">'+esc(x.kelas)+'</div></td><td class="num">'+x.a.n+'</td><td class="num">'+x.a.avg+'</td><td class="num">'+naNum(x.last)+'</td><td><span class="pill '+(ok?'ok':'bad')+'">'+(ok?'Kompeten':'Belum')+'</span></td></tr>'}).join('')+'</table></div></section>';
 h+='<div class="row"><button type="button" class="btn small primary" data-act="na-xls">Unduh Excel analisis</button></div>';
 return h;
}

/* ---------- Ekspor Excel: Ringkasan, Distribusi, Per unit, Per kelas, Per siswa, Tren bulanan, Remedial ---------- */
function naXls(){
 if(!needX())return;
 var L=naList();if(!L.length){toast('Belum ada data untuk diunduh');return}
 var a=naAgg(L),per=naPerSiswa(L),rem=naRemedial(per),wb=XLSX.utils.book_new(),add=function(n,ws){XLSX.utils.book_append_sheet(wb,ws,n)};
 var rows=[['Analisis nilai uji praktik TBSM'],['Filter kelas',S.filter==='ALL'?'Semua kelas':'Kelas '+S.filter],['Jenis data',NA.mode==='semua'?'Penilaian + Latihan':'Penilaian saja'],['Tanggal ekspor',new Date().toLocaleDateString('id-ID')],['KKM',S.kkm],['Jumlah data',a.n],['Jumlah siswa',per.length],['Rata-rata',a.avg],['Nilai terendah',a.min],['Nilai tertinggi',a.max],['Persen kompeten',Math.round(a.kom*100)],['Remedial (status terakhir belum kompeten)',rem.length]];
 add('Ringkasan',sheet(rows,[42,30]));
 var d=[['Rentang nilai','Jumlah','Persen']].concat(naDist(L).map(function(b){return [b.t,b.n,b.p]}));
 var ds=sheet(d,[16,10,10]);naPct(ds,d.length,'C');add('Distribusi',ds);
 var pu=[['Kode unit','Unit praktik','Kelas','Jumlah','Rata-rata','Terendah','Tertinggi','Persen kompeten']].concat(naPerUnit(L).map(function(u){return [u.id,u.judul,u.kelas,u.a.n,u.a.avg,u.a.min,u.a.max,u.a.kom]}));
 var pus=sheet(pu,[12,44,8,9,10,10,10,15]);naPct(pus,pu.length,'H');add('Per unit',pus);
 var pk=[['Kelas','Siswa','Jumlah','Rata-rata','Persen kompeten']].concat(naPerKelas(L).map(function(k){return [k.k,k.siswa,k.a.n,k.a.avg,k.a.kom]}));
 var pks=sheet(pk,[10,10,10,11,16]);naPct(pks,pk.length,'E');add('Per kelas',pks);
 var ps=[['Siswa','Kelas','Jumlah data','Rata-rata','Terendah','Tertinggi','Nilai terakhir','Status terakhir','Unit terakhir','Tanggal terakhir']].concat(per.map(function(x){
  var ln=x.last;return [x.nama,x.kelas,x.a.n,x.a.avg,x.a.min,x.a.max,naNum(ln),ln.kompeten?'Kompeten':'Belum kompeten',naPerUnitJudul(ln.jobId),new Date(ln.ts).toLocaleDateString('id-ID')]}));
 add('Per siswa',sheet(ps,[28,8,12,11,10,10,14,16,44,16]));
 var tr=[['Bulan','Jumlah','Rata-rata','Persen kompeten']].concat(naTren(L).map(function(t){return [t.bulan,t.a.n,t.a.avg,t.a.kom]}));
 var trs=sheet(tr,[12,10,11,16]);naPct(trs,tr.length,'D');add('Tren bulanan',trs);
 var rm=[['Siswa','Kelas','Unit terakhir','Nilai terakhir','Tanggal terakhir']].concat(rem.map(function(x){return [x.nama,x.kelas,naPerUnitJudul(x.last.jobId),naNum(x.last),new Date(x.last.ts).toLocaleDateString('id-ID')]}));
 add('Remedial',sheet(rm,[28,8,44,14,16]));
 dl(wb,'Analisis_Nilai');
}
function naPerUnitJudul(id){var j=jobById(id);return j?j.judul:id}

/* ---------- Penyambungan ke Rekap nilai ---------- */
var _naRekap=viewRekap;
viewRekap=function(){
 if(!can('nilai'))return _naRekap();
 var tog='<div class="seg" role="group" aria-label="Tampilan rekap" style="margin-bottom:8px"><button type="button" data-act="na-tab" data-v="data" aria-pressed="'+(NA.tab!=='analisis')+'">Data</button><button type="button" data-act="na-tab" data-v="analisis" aria-pressed="'+(NA.tab==='analisis')+'">Analisis</button></div>';
 if(NA.tab==='analisis')return '<h2>Rekap nilai</h2>'+tog+naChips()+naView();
 return _naRekap().replace('<h2>Rekap nilai</h2>','<h2>Rekap nilai</h2>'+tog);
};
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="na-"]');if(!b||!can('nilai'))return;
 var a=b.dataset.act,v=b.dataset.v;
 if(a==='na-tab'){NA.tab=v;render();window.scrollTo(0,0)}
 else if(a==='na-mode'){NA.mode=v;render()}
 else if(a==='na-xls')naXls();
});
