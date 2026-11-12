/* lkpd-integritas.js (v55): pemeriksaan integritas penilaian LKPD untuk Guru dan Admin.
   TIDAK mengubah rumus nilai. Menandai pengiriman yang perlu dicek guru:
   - Nilai tidak cocok: nilai tersimpan dibandingkan dengan hitung ulang dari isian siswa (nilai dihitung di perangkat siswa, jadi bisa diubah lewat API).
   - Terlalu cepat atau waktu tidak tercatat, semua langkah/K3 dicentang tanpa waktu yang wajar.
   - Isian analisis sangat singkat (25 poin analisis diberikan untuk isian apa pun).
   - Isian analisis atau hasil aktual identik dengan siswa lain pada modul yang sama (kemungkinan salin).
   Hanya Ujian yang diperiksa. Tanda ini petunjuk, bukan vonis: keputusan tetap pada guru lewat Nilai koreksi. */
var LKI={f:'ALL'};
function lkiPay(x){try{return typeof x.payload==='string'?JSON.parse(x.payload||'{}'):(x.payload||{})}catch(e){return {}}}
function lkiNorm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function lkiScoreFor(m,d){
 var r=m.rubric||{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  safe=m.safety.filter(function(x,i){return d['safe'+i]}).length,work=m.steps.filter(function(x,i){return d['step'+i]}).length,
  rows=m.checks.filter(function(x,i){return lkRowOk(d,i)}).length,correct=0;
 m.quiz.forEach(function(q,i){correct+=lkqPoint(q,d['q'+i])});
 var analysis=d.evidence&&d.cause&&d.conclusion?1:0,
  practice=Math.round(work/m.steps.length*r.steps+safe/m.safety.length*r.safety+rows/m.checks.length*r.checks+analysis*r.analysis),
  theory=Math.round(correct/m.quiz.length*100);
 return {practice:practice,theory:theory,final:Math.round(practice*(r.practiceWeight/100)+theory*(r.theoryWeight/100)),work:work,safe:safe};
}
function lkiMod(id){return (LKPD_MODULES||[]).filter(function(m){return m.id===id})[0]||null}
/* indeks isian per modul untuk deteksi kemiripan: hanya pengiriman TERBARU tiap siswa */
function lkiIndeks(){
 var by={},ix={};
 (S.lkpd||[]).forEach(function(x){
  if(typeof lkmModeOf==='function'&&lkmModeOf(x)==='latihan')return;
  var k=x.moduleId+'|'+x.sid;if(!by[k]||x.ts>by[k].ts)by[k]=x;
 });
 Object.keys(by).forEach(function(k){
  var x=by[k],p=lkiPay(x),a=lkiNorm([p.evidence,p.cause,p.conclusion].join(' | ')),
   v=[];for(var i=0;i<40;i++){if(p['actual'+i]!==undefined)v.push(lkiNorm(p['actual'+i]))}
  var ak=v.filter(Boolean).length>=3?v.join('|'):'';
  (ix[x.moduleId]=ix[x.moduleId]||[]).push({sid:x.sid,nama:x.siswa,ana:a.length>=30?a:'',akt:ak});
 });
 return ix;
}
function lkiFlags(x,ix){
 var out=[];
 if(typeof lkmModeOf==='function'&&lkmModeOf(x)==='latihan')return out;
 var m=lkiMod(x.moduleId),p=lkiPay(x);if(!m)return out;
 var stale=false;try{stale=lkqStale(m,p)}catch(e){}
 if(!stale){
  try{
   var sc=lkiScoreFor(m,p);
   if(!isNaN(sc.practice+sc.theory+sc.final)&&(sc.practice!==x.practice||sc.theory!==x.theory||sc.final!==x.score))
    out.push({k:'nilai',lv:'bad',t:'Nilai tersimpan ('+x.score+') berbeda dari hitung ulang isian ('+sc.final+'). Data mungkin diubah, atau modul diedit setelah dikirim.'});
   var det=Number(p.detik)||0,tgt=(Number(m.duration)||0)*60,semua=sc.work===m.steps.length&&sc.safe===m.safety.length;
   if(semua&&(!det||(tgt&&det<tgt*0.25)))out.push({k:'cepat',lv:'warn',t:'Semua langkah dan K3 dicentang'+(det?' dalam '+Math.max(1,Math.round(det/60))+' menit dari target '+m.duration+' menit.':' tanpa waktu pengerjaan tercatat.')});
   else if(det&&tgt&&det<tgt*0.25)out.push({k:'cepat',lv:'warn',t:'Dikerjakan '+Math.max(1,Math.round(det/60))+' menit dari target '+m.duration+' menit.'});
  }catch(e){}
 }
 var L=[p.evidence,p.cause,p.conclusion].map(function(s){return String(s||'').trim().length});
 if(L.some(function(n){return n>0&&n<15}))out.push({k:'singkat',lv:'warn',t:'Isian analisis sangat singkat (kurang dari 15 karakter), tetapi tetap mendapat poin analisis penuh.'});
 var me=lkiNorm([p.evidence,p.cause,p.conclusion].join(' | ')),ia=ix&&ix[x.moduleId]||[],dup=[],dupA=[];
 var v=[];for(var i=0;i<40;i++){if(p['actual'+i]!==undefined)v.push(lkiNorm(p['actual'+i]))}
 var mk=v.filter(Boolean).length>=3?v.join('|'):'';
 ia.forEach(function(o){if(o.sid===x.sid)return;if(me.length>=30&&o.ana===me)dup.push(o.nama);if(mk&&o.akt===mk)dupA.push(o.nama)});
 if(dup.length)out.push({k:'mirip',lv:'warn',t:'Isian analisis identik dengan '+dup.slice(0,3).join(', ')+(dup.length>3?' dan '+(dup.length-3)+' lainnya':'')+'.'});
 if(dupA.length)out.push({k:'mirip',lv:'warn',t:'Seluruh hasil aktual identik dengan '+dupA.slice(0,3).join(', ')+(dupA.length>3?' dan '+(dupA.length-3)+' lainnya':'')+'.'});
 return out;
}
function lkiAll(){
 var ix=lkiIndeks(),res={};
 (S.lkpd||[]).forEach(function(x){var f=lkiFlags(x,ix);if(f.length)res[x.id]=f});
 return res;
}
function lkiTitle(f){return f.map(function(a){return a.t}).join(' ').replace(/"/g,"'")}

var _lkiView=viewLKPD;
viewLKPD=function(){
 if(!S.user||!isStaff())return _lkiView();
 var detail=LK.detail&&LK.detail.id;
 if(detail){
  var h0=_lkiView(),x=(S.lkpd||[]).filter(function(r){return r.id===detail})[0],fl=x?lkiFlags(x,lkiIndeks()):[];
  var box='<h3>Pemeriksaan penilaian</h3>'+(fl.length?'<ul class="plain">'+fl.map(function(a){return '<li><span class="pill '+a.lv+'">'+(a.lv==='bad'?'Cek nilai':'Perlu dicek')+'</span> '+lkEsc(a.t)+'</li>'}).join('')+'</ul><p class="note">Tanda ini petunjuk. Putuskan lewat Nilai koreksi di bawah.</p>':'<p class="note">Tidak ada temuan otomatis.</p>');
  return h0.indexOf('<h3>Penilaian guru</h3>')>-1?h0.replace('<h3>Penilaian guru</h3>',box+'<h3>Penilaian guru</h3>'):h0;
 }
 if(!LK.open||LK.tab!=='riwayat'||LK.editor)return _lkiView();
 var all=lkiAll(),n=Object.keys(all).length;
 if(!n&&LKI.f!=='ALL')LKI.f='ALL';
 var orig=S.lkpd,h;
 if(LKI.f==='cek')S.lkpd=(orig||[]).filter(function(r){return all[r.id]});
 try{h=_lkiView()}finally{S.lkpd=orig}
 h=h.replace(/<button class="btn small" data-act="lk-detail" data-v="([^"]+)">Detail<\/button>/g,function(m,id){
  var f=all[id];if(!f)return m;
  var bad=f.some(function(a){return a.lv==='bad'});
  return '<span class="pill '+(bad?'bad':'warn')+'" title="'+lkEsc(lkiTitle(f))+'">'+(bad?'Cek nilai':'Perlu dicek')+'</span> '+m;
 });
 if(n){
  var chips='<div class="chips" role="group" aria-label="Pemeriksaan penilaian"><button type="button" data-act="lki-f" data-v="ALL" aria-pressed="'+(LKI.f==='ALL')+'">Semua data</button><button type="button" data-act="lki-f" data-v="cek" aria-pressed="'+(LKI.f==='cek')+'">Perlu dicek · '+n+'</button></div>';
  var i=h.indexOf('Rekap pengumpulan LKPD'),j=i<0?-1:h.indexOf('</span></div>',i);
  if(j>-1)h=h.slice(0,j+13)+chips+h.slice(j+13);
 }
 return h;
};
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="lki-f"]');if(!b)return;
 LKI.f=b.dataset.v;render();
});
