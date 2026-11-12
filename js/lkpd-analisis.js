/* lkpd-analisis.js: Analisis hasil per modul LKPD (Admin dan Guru).
   Menampilkan soal yang paling banyak salah, langkah/K3/komponen yang sering terlewat, siswa yang perlu remedial,
   dan siswa yang belum mengumpulkan. Memakai pengiriman TERBARU tiap siswa. Bisa diunduh sebagai Excel.
   Soal dari pengiriman lama (susunan soal berubah) tidak dihitung agar nilai per soal tidak keliru. */
var LKA={id:null,mode:'ujian'};
(function(){var st=document.createElement('style');st.textContent=
'.lka-row{display:grid;gap:4px;padding:8px 0;border-top:1px solid var(--line)}.lka-row:first-of-type{border-top:0}'+
'.lka-bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.lka-bar i{display:block;height:100%;background:var(--ok)}'+
'.lka-bar[data-t="warn"] i{background:var(--warn)}.lka-bar[data-t="bad"] i{background:var(--bad)}';
document.head.appendChild(st)})();

function lkaPay(x){try{return typeof x.payload==='string'?JSON.parse(x.payload||'{}'):(x.payload||{})}catch(e){return {}}}
function lkaName(x){return Array.isArray(x)?String(x[0]):String(x)}
function lkaCut(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s}
function lkaTone(p){return p<50?'bad':p<75?'warn':'ok'}
function lkaRecs(m){
 var by={};
 (S.lkpd||[]).forEach(function(x){
  if(x.moduleId!==m.id)return;
  if(LKA.mode!=='semua'&&lkmModeOf(x)!==LKA.mode)return;
  if(!by[x.sid]||x.ts>by[x.sid].ts)by[x.sid]=x;
 });
 return Object.keys(by).map(function(k){var x=by[k];return {r:x,p:lkaPay(x)}});
}
function lkaStats(m){
 var recs=lkaRecs(m),n=recs.length,sum=function(f){return recs.reduce(function(t,x){return t+f(x)},0)};
 var qrecs=recs.filter(function(x){try{return !lkqStale(m,x.p)}catch(e){return true}});
 var qs=m.quiz.map(function(q,i){
  var pts=0,na=0,wrong={};
  qrecs.forEach(function(x){
   var a=x.p['q'+i];
   try{if(!lkqAnswered(q,a))na++;pts+=lkqPoint(q,a);if(lkqType(q)==='pg'&&lkqAnswered(q,a)&&a!==q.a)wrong[a]=(wrong[a]||0)+1}catch(e){}
  });
  var top=null,tv=0;Object.keys(wrong).forEach(function(k){if(wrong[k]>tv){tv=wrong[k];top=+k}});
  var t='pg';try{t=lkqType(q)}catch(e){}
  return {i:i,q:q,t:t,pct:qrecs.length?Math.round(pts/qrecs.length*100):0,na:na,top:top,tv:tv};
 });
 function cnt(list,f){return list.map(function(x,i){var c=recs.filter(function(r){return f(r.p,i)}).length;return {i:i,name:lkaName(x),pct:n?Math.round(c/n*100):0}})}
 var steps=cnt(m.steps,function(p,i){return !!p['step'+i]}),safe=cnt(m.safety,function(p,i){return !!p['safe'+i]}),checks=cnt(m.checks,function(p,i){return lkRowOk(p,i)});
 var ana=n?Math.round(recs.filter(function(r){return r.p.evidence&&r.p.cause&&r.p.conclusion}).length/n*100):0;
 var kk=S.kkm||75,low=recs.filter(function(x){return x.r.score<kk}).sort(function(a,b){return a.r.score-b.r.score});
 var sent={};recs.forEach(function(x){sent[x.r.sid]=1});
 var belum=(S.users||[]).filter(function(u){return roleList(u).indexOf('siswa')>-1&&u.aktif!==false&&u.kelas===m.kelas&&!sent[u.id]}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama))});
 return {recs:recs,n:n,qn:qrecs.length,skip:n-qrecs.length,qs:qs,steps:steps,safe:safe,checks:checks,ana:ana,kk:kk,low:low,belum:belum,
  avg:n?Math.round(sum(function(x){return x.r.score})/n):0,prak:n?Math.round(sum(function(x){return x.r.practice||0})/n):0,teori:n?Math.round(sum(function(x){return x.r.theory||0})/n):0,
  kom:n?Math.round(recs.filter(function(x){return x.r.score>=kk}).length/n*100):0};
}
function lkaBar(label,pct,extra){
 return '<div class="lka-row"><div class="row sb"><span>'+lkEsc(label)+'</span><b class="mono">'+pct+'%</b></div><div class="lka-bar" data-t="'+lkaTone(pct)+'" role="img" aria-label="'+pct+' persen"><i style="width:'+pct+'%"></i></div>'+(extra?'<div class="note">'+extra+'</div>':'')+'</div>';
}
function lkaView(){
 var m=LKPD_MODULES.find(function(x){return x.id===LKA.id});
 if(!m){LKA.id=null;return lkListView()}
 var s=lkaStats(m),TL={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori'};
 var chips='<div class="chips" role="group" aria-label="Mode data">'+[['ujian','Ujian'],['latihan','Latihan'],['semua','Semua']].map(function(c){return '<button type="button" data-act="lka-mode" data-v="'+c[0]+'" aria-pressed="'+(LKA.mode===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>';
 var h='<div class="row sb"><button type="button" class="btn small" data-act="lka-close">‹ Daftar LKPD</button>'+(s.n?'<button type="button" class="btn small primary" data-act="lka-xls">Unduh Excel</button>':'')+'</div>'+
  '<h2>Analisis: '+lkEsc(m.title)+'</h2><p class="note">Pengiriman terbaru tiap siswa. KKM '+s.kk+'.</p>'+chips;
 if(!s.n)return h+'<div class="card"><p class="muted">Belum ada pengumpulan pada mode ini.</p></div>'+lkaBelum(s);
 h+='<div class="stats"><div class="card"><span class="label">Siswa</span><b class="mono">'+s.n+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+s.avg+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+s.kom+'%</b></div></div>'+
  '<p class="note">Rata-rata nilai praktik '+s.prak+' · teori '+s.teori+'.</p>';
 var qs=s.qs.slice().sort(function(a,b){return a.pct-b.pct});
 h+='<section class="card"><h3>Soal evaluasi (paling sulit di atas)</h3>'+(s.skip?'<p class="note">'+s.skip+' pengiriman lama dilewati karena susunan soal sudah berubah.</p>':'')+
  (s.qn?qs.map(function(x){
   var ex=TL[x.t]+(x.pct<60?' · <b>perlu dibahas</b>':'')+(x.na?' · '+x.na+' tidak dijawab':'')+(x.top!==null?' · pengecoh terbanyak '+String.fromCharCode(65+x.top)+' ('+x.tv+' siswa)':'');
   return lkaBar('No. '+(x.i+1)+' · '+lkaCut(x.q.q,80),x.pct,ex);
  }).join(''):'<p class="muted">Tidak ada data soal yang bisa dihitung.</p>')+'</section>';
 h+='<section class="card"><h3>Langkah prosedur</h3><p class="note">Persentase siswa yang menyelesaikan.</p>'+s.steps.map(function(x){return lkaBar((x.i+1)+'. '+lkaCut(x.name,70),x.pct)}).join('')+'</section>'+
  '<section class="card"><h3>Checklist K3</h3>'+s.safe.map(function(x){return lkaBar((x.i+1)+'. '+lkaCut(x.name,70),x.pct)}).join('')+'</section>'+
  '<section class="card"><h3>Komponen pemeriksaan</h3><p class="note">Terisi lengkap (centang dan hasil aktual).</p>'+s.checks.map(function(x){return lkaBar((x.i+1)+'. '+lkaCut(x.name,70),x.pct)}).join('')+lkaBar('Analisis (bukti, penyebab, kesimpulan)',s.ana)+'</section>';
 h+='<section class="card"><h3>Perlu remedial (nilai di bawah '+s.kk+')</h3>'+(s.low.length?s.low.map(function(x){return '<div class="row sb"><span>'+lkEsc(x.r.siswa||'-')+'</span><b class="mono">'+x.r.score+'</b></div>'}).join(''):'<p class="muted">Semua siswa mencapai KKM.</p>')+'</section>'+lkaBelum(s);
 return h;
}
function lkaBelum(s){
 return '<section class="card"><h3>Belum mengumpulkan ('+s.belum.length+')</h3>'+(s.belum.length?'<p class="note">'+s.belum.map(function(u){return lkEsc(u.nama)}).join(', ')+'</p>':'<p class="muted">Semua siswa kelas ini sudah mengumpulkan, atau data siswa belum tersedia.</p>')+'</section>';
}
function lkaXls(){
 var m=LKPD_MODULES.find(function(x){return x.id===LKA.id});if(!m)return;
 var s=lkaStats(m);if(!s.n){toast('Belum ada data untuk diunduh');return}
 var wb=XLSX.utils.book_new(),A=XLSX.utils.aoa_to_sheet,add=function(n,r){XLSX.utils.book_append_sheet(wb,A(r),n)};
 add('Ringkasan',[['Modul',m.title],['Kelas',m.kelas],['Mode data',LKA.mode],['Jumlah siswa',s.n],['Rata-rata',s.avg],['Rata-rata praktik',s.prak],['Rata-rata teori',s.teori],['KKM',s.kk],['Kompeten (%)',s.kom]]);
 add('Soal',[['No','Tipe','Soal','% benar','Tidak dijawab']].concat(s.qs.map(function(x){return [x.i+1,x.t,String(x.q.q||''),x.pct,x.na]})));
 add('Langkah',[['Jenis','No','Butir','% terpenuhi']].concat(
  s.steps.map(function(x){return ['Langkah',x.i+1,x.name,x.pct]}),s.safe.map(function(x){return ['K3',x.i+1,x.name,x.pct]}),s.checks.map(function(x){return ['Komponen',x.i+1,x.name,x.pct]}),[['Analisis','','Bukti, penyebab, kesimpulan',s.ana]]));
 add('Siswa',[['Nama','Nilai','Praktik','Teori','Status','Tanggal']].concat(s.recs.slice().sort(function(a,b){return a.r.score-b.r.score}).map(function(x){return [x.r.siswa||'',x.r.score,x.r.practice||0,x.r.theory||0,x.r.score>=s.kk?'Kompeten':'Belum kompeten',tgl(x.r.ts)]}),[[],['Belum mengumpulkan']],s.belum.map(function(u){return [u.nama]})));
 dl(wb,'Analisis_'+String(m.id).replace(/[^A-Za-z0-9_-]/g,''));
}

/* ---- Penyambungan ke aplikasi ---- */
var _lkaList=lkListView;
lkListView=function(){
 var h=_lkaList();
 if(!isStaff())return h;
 return h.replace(/<button type="button" class="btn small" data-act="lkm-open" data-v="([^"]+)">Pengaturan<\/button>/g,'<button type="button" class="btn small" data-act="lka-open" data-v="$1">Analisis</button>$&');
};
var _lkaView=viewLKPD;
viewLKPD=function(){return (LKA.id&&isStaff())?lkaView():_lkaView()};
var _lkaRender=render;
render=function(){if(S.tab!=='lkpd'&&LKA.id)LKA.id=null;_lkaRender()};
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="lka-"]');if(!b||!isStaff())return;
 var a=b.dataset.act,v=b.dataset.v;e.stopPropagation();
 if(a==='lka-open'){var m=LKPD_MODULES.find(function(x){return x.id===v});if(!m)return;LKA.id=v;LKA.mode=(typeof lkmCfg==='function'&&lkmCfg(m).mode==='latihan')?'latihan':'ujian';render();window.scrollTo(0,0)}
 else if(a==='lka-close'){LKA.id=null;render();window.scrollTo(0,0)}
 else if(a==='lka-mode'){LKA.mode=v;render()}
 else if(a==='lka-xls')lkaXls();
},true);
