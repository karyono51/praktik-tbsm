/* lkpd-soal.js: soal evaluasi LKPD bentuk TKA (v51).
   - Setiap modul LKPD bawaan memakai 10 soal yang diambil dari bank soal unitnya (js/soal-lkpd/*.js, 60 soal per unit):
     6 PG, 2 PG kompleks, dan 2 PG kategori (Benar/Salah). Komposisi diubah lewat LKQ.MIX.
   - Format soal modul (m.quiz), terbaca mundur oleh modul lama:
       PG        {q, o:[..], a:indeks, e}
       Kompleks  {t:'kompleks', q, o:[..], a:[indeks..], e}
       Kategori  {t:'kategori', q, rows:[[pernyataan, true|false]..], lab:['Benar','Salah'], e}
   - Jawaban siswa di payload: PG = angka; kompleks = daftar indeks; kategori = {nomorBaris: true|false}.
   - Penilaian sama dengan Bank soal TKA: PG 1/0; kompleks (benar terpilih - salah terpilih) / jumlah kunci, minimal 0;
     kategori jumlah pernyataan tepat / jumlah pernyataan. Nilai teori = rata-rata skor soal x 100.
   - Pengumpulan menyimpan tanda tangan soal (qsig). Pengumpulan lama (soal lama) tidak dibandingkan dengan soal baru. */
var LKQ={MIX:{pg:6,kompleks:2,kategori:2},VER:2};

/* ---------- Pemilihan soal dari bank ---------- */
function lkqPick(list,n,off){
 var out=[],used={},len=list.length;if(!len||n<=0)return out;
 for(var i=0;i<n&&out.length<Math.min(n,len);i++){
  var k=(Math.floor((i+.5)*len/n)+(off||0))%len;
  while(used[k])k=(k+1)%len;used[k]=1;out.push(list[k]);
 }
 return out;
}
function lkqConv(b){
 if(b.tipe==='kompleks')return {t:'kompleks',q:b.q,o:b.opts.slice(),a:b.kunci.slice().sort(function(x,y){return x-y}),e:b.bahas||'',src:b.id};
 if(b.tipe==='kategori')return {t:'kategori',q:b.q,rows:b.rows.map(function(r){return [r[0],!!r[1]]}),lab:(b.lab||['Benar','Salah']).slice(0,2),e:b.bahas||'',src:b.id};
 return {t:'pg',q:b.q,o:b.opts.slice(),a:b.kunci,e:b.bahas||'',src:b.id};
}
function lkqQuizFor(unit){
 var all=(window.SOAL_TKA||[]).filter(function(b){return b.unit===unit}),by=function(t){return all.filter(function(b){return b.tipe===t})};
 if(!all.length)return null;
 var X=LKQ.MIX,list=[].concat(lkqPick(by('pg'),X.pg,0),lkqPick(by('kompleks'),X.kompleks,0),lkqPick(by('kategori'),X.kategori,1));
 return list.length?list.map(lkqConv):null;
}

/* ---------- Penilaian ---------- */
function lkqType(q){return q&&q.t==='kompleks'?'kompleks':q&&q.t==='kategori'?'kategori':'pg'}
function lkqAnswered(q,a){
 var t=lkqType(q);
 if(t==='kompleks')return Array.isArray(a)&&a.length>0;
 if(t==='kategori')return !!a&&typeof a==='object'&&q.rows.every(function(r,i){return typeof a[i]==='boolean'});
 return typeof a==='number';
}
function lkqPoint(q,a){
 var t=lkqType(q);
 if(t==='kompleks'){
  if(!Array.isArray(a))return 0;
  var good=a.filter(function(x){return q.a.indexOf(x)>-1}).length,bad=a.length-good;
  return Math.max(0,(good-bad)/q.a.length);
 }
 if(t==='kategori'){
  if(!a||typeof a!=='object')return 0;
  return q.rows.filter(function(r,i){return a[i]===r[1]}).length/q.rows.length;
 }
 return a===q.a?1:0;
}
function lkqFmt(n){var r=Math.round(n*10)/10;return String(r).replace('.',',')}
function lkqValid(q){
 if(!q||!q.q||typeof q.q!=='string')return false;
 var t=lkqType(q);
 if(t==='kompleks')return Array.isArray(q.o)&&q.o.length>=3&&Array.isArray(q.a)&&q.a.length>=1&&q.a.every(function(x){return Number.isInteger(x)&&x>=0&&x<q.o.length});
 if(t==='kategori')return Array.isArray(q.rows)&&q.rows.length>=2&&q.rows.every(function(r){return Array.isArray(r)&&r[0]&&typeof r[1]==='boolean'});
 return Array.isArray(q.o)&&q.o.length>=2&&Number.isInteger(q.a)&&q.a>=0&&q.a<q.o.length;
}
/* Tanda tangan isi soal: mencegah jawaban untuk soal lama dibaca sebagai jawaban soal baru. */
function lkqSig(m){
 var s=(m.quiz||[]).map(function(q){return lkqType(q)+'|'+q.q}).join('\n'),h=5381;
 for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;
 return 'q'+(m.quiz||[]).length+'-'+(h>>>0).toString(36);
}
function lkqStale(m,p){return p&&p.qsig?p.qsig!==lkqSig(m):m.quizV===LKQ.VER}

/* ---------- Tampilan soal siswa ---------- */
var LKQ_HINT={pg:'Pilihan ganda · pilih satu jawaban.',kompleks:'PG kompleks · pilih semua jawaban yang benar.',kategori:'PG kategori · tentukan tiap pernyataan.'};
function lkqRender(q,i,d){
 var t=lkqType(q),a=d['q'+i],h='<div class="qbox lkq" data-t="'+t+'"><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><span class="lkq-hint">'+LKQ_HINT[t]+'</span>';
 if(t==='kompleks'){
  h+=q.o.map(function(o,k){return '<label class="lk-option"><input type="checkbox" data-lkq-multi="'+i+'" value="'+k+'"'+(Array.isArray(a)&&a.indexOf(k)>-1?' checked':'')+'>'+String.fromCharCode(65+k)+'. '+lkEsc(o)+'</label>'}).join('');
 }else if(t==='kategori'){
  var lab=q.lab||['Benar','Salah'];
  h+=q.rows.map(function(r,k){
   var v=a&&typeof a==='object'?a[k]:undefined;
   return '<div class="lkq-row"><span>'+lkEsc(r[0])+'</span><span class="lkq-yn" role="radiogroup" aria-label="Pernyataan '+(k+1)+'">'+
    [[1,lab[0],true],[0,lab[1],false]].map(function(c){return '<label class="lkq-chip"><input type="radio" name="lkq'+i+'r'+k+'" data-lkq-cat="'+i+'" data-row="'+k+'" value="'+c[0]+'"'+(v===c[2]?' checked':'')+'><span>'+lkEsc(c[1])+'</span></label>'}).join('')+'</span></div>';
  }).join('');
 }else{
  h+=q.o.map(function(o,k){return '<label class="lk-option"><input type="radio" name="lkq'+i+'" data-lk-answer="'+i+'" value="'+k+'"'+(a===k?' checked':'')+'>'+String.fromCharCode(65+k)+'. '+lkEsc(o)+'</label>'}).join('');
 }
 return h+'</div>';
}
function lkqQuizHtml(m,d){return m.quiz.map(function(q,i){return lkqRender(q,i,d)}).join('')}

/* ---------- Jawaban dan kunci (detail guru, pembahasan latihan) ---------- */
function lkqAnsText(q,a){
 var t=lkqType(q);
 if(t==='kompleks')return Array.isArray(a)&&a.length?a.slice().sort(function(x,y){return x-y}).map(function(k){return String.fromCharCode(65+k)+'. '+(q.o[k]||'')}).join('; '):'';
 if(t==='kategori'){var lab=q.lab||['Benar','Salah'];return a&&typeof a==='object'?q.rows.map(function(r,k){return typeof a[k]==='boolean'?(k+1)+') '+lab[a[k]?0:1]:(k+1)+') -'}).join('; '):''}
 return typeof a==='number'?String.fromCharCode(65+a)+'. '+(q.o[a]||''):'';
}
function lkqKeyText(q){
 var t=lkqType(q);
 if(t==='kompleks')return q.a.map(function(k){return String.fromCharCode(65+k)+'. '+q.o[k]}).join('; ');
 if(t==='kategori'){var lab=q.lab||['Benar','Salah'];return q.rows.map(function(r,k){return (k+1)+') '+lab[r[1]?0:1]}).join('; ')}
 return String.fromCharCode(65+q.a)+'. '+q.o[q.a];
}
function lkqVerdict(q,a){
 var t=lkqType(q),touched=t==='pg'?typeof a==='number':t==='kompleks'?Array.isArray(a)&&a.length>0:!!a&&typeof a==='object'&&Object.keys(a).length>0;
 if(!touched)return ['warn','Belum dijawab'];
 var p=lkqPoint(q,a);return p>=1?['ok','Benar']:p>0?['warn','Sebagian benar']:['bad','Salah'];
}
function lkqDetail(q,i,a){
 var v=lkqVerdict(q,a),txt=lkqAnsText(q,a);
 return '<p><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><br>'+(txt&&v[1]!=='Belum dijawab'?lkEsc(txt)+' · <b>'+v[1].toLowerCase()+'</b>':'<span class="muted">Belum dijawab</span>')+'</p>';
}
function lkqKeyHtml(q,i,a){
 var v=lkqVerdict(q,a),good=lkqPoint(q,a)>=1;
 return '<div class="qbox"><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><div><span class="pill '+v[0]+'">'+v[1]+'</span></div>'+
  (good?'':'<p>Kunci: <b>'+lkEsc(lkqKeyText(q))+'</b></p>')+(q.e?'<p class="note">'+lkEsc(q.e)+'</p>':'')+'</div>';
}

/* ---------- Pemasangan ke mesin LKPD ---------- */
/* Modul bawaan memakai soal bank. Salinan tersimpan (hasil edit/pengaturan) dari modul bawaan yang belum bertanda quizV
   ikut diperbarui; salinan yang sudah diedit guru lewat Editor LKPD bertanda quizV dan tidak ditimpa. */
(function(){
 function apply(m){
  if(!m||!lkBuiltin(m.id)||m.quizV===LKQ.VER)return;
  var qz=lkqQuizFor(m.id);if(qz){m.quiz=qz;m.quizV=LKQ.VER}
 }
 (window.LKPD_DEFAULT_MODULES||[]).forEach(apply);
 var _refresh=lkRefreshModules;
 lkRefreshModules=function(){_refresh.apply(this,arguments);(LKPD_MODULES||[]).forEach(apply)};
 var _build=lkBuildModule;
 lkBuildModule=function(v){var m=_build.apply(this,arguments);if(lkBuiltin(m.id))m.quizV=LKQ.VER;return m};
 /* Draf lama berisi jawaban untuk soal lama: dibuang agar tidak terbaca sebagai jawaban soal baru. */
 var _draft=lkDraft;
 lkDraft=function(){
  var d=_draft.apply(this,arguments),m=typeof lkmCur==='function'?lkmCur():null;
  if(m&&(d.qsig?d.qsig!==lkqSig(m):m.quizV===LKQ.VER)){
   Object.keys(d).forEach(function(k){if(/^q\d+$/.test(k))delete d[k]});
   d.qsig=lkqSig(m);
  }
  return d;
 };
 /* Membaca jawaban PG kompleks dan kategori dari layar, lalu menandai isi soal pada data kiriman. */
 var _read=lkRead;
 lkRead=function(){
  var d=_read.apply(this,arguments),m=typeof lkmCur==='function'?lkmCur():null;
  var multi={},cat={},seenM={},seenC={};
  document.querySelectorAll('[data-lkq-multi]').forEach(function(x){var i=x.dataset.lkqMulti;seenM[i]=1;if(x.checked)(multi[i]=multi[i]||[]).push(Number(x.value))});
  Object.keys(seenM).forEach(function(i){if(multi[i]&&multi[i].length)d['q'+i]=multi[i].sort(function(a,b){return a-b});else delete d['q'+i]});
  document.querySelectorAll('[data-lkq-cat]').forEach(function(x){var i=x.dataset.lkqCat;seenC[i]=1;if(x.checked)(cat[i]=cat[i]||{})[x.dataset.row]=x.value==='1'});
  Object.keys(seenC).forEach(function(i){if(cat[i])d['q'+i]=cat[i];else delete d['q'+i]});
  if(m)d.qsig=lkqSig(m);
  return d;
 };
 /* Pembahasan Latihan (tab Evaluasi, mode Latihan dengan kunci terbuka). */
 if(typeof lkmKeyBlock==='function'){
  lkmKeyBlock=function(m){
   var d=lkDraft(),on=LKM.reveal[m.id],h='<section class="card" data-lkm="1"><h2>Pembahasan latihan</h2>';
   if(!on)return h+'<p class="note">Jawab soal di atas, lalu periksa jawabanmu dan baca pembahasannya.</p><button type="button" class="btn small primary" data-act="lkm-reveal">Periksa jawaban</button></section>';
   var sum=0,rows=m.quiz.map(function(q,i){sum+=lkqPoint(q,d['q'+i]);return lkqKeyHtml(q,i,d['q'+i])}).join('');
   return h+'<p><b>Skor '+lkqFmt(sum)+' dari '+m.quiz.length+'</b></p>'+rows+'<button type="button" class="btn small" data-act="lkm-reveal">Sembunyikan pembahasan</button></section>';
  };
 }
 /* Perubahan jawaban: simpan draf, perbarui progres, dan mulai timer (seperti isian lain). */
 document.addEventListener('change',function(e){
  var t=e.target;if(!t.matches||!t.matches('[data-lkq-multi],[data-lkq-cat]'))return;
  try{localStorage.setItem(lkKey(),JSON.stringify(lkRead()))}catch(x){}
  var pg=document.getElementById('lk-progress'),mm=typeof lkmCur==='function'?lkmCur():null;
  if(pg&&mm)pg.innerHTML=lkProgress(mm,lkDraft());
  if(typeof LKT!=='undefined'&&!LKT.running&&typeof lktStart==='function')lktStart();
 });
 lkRefreshModules();
 var st=document.createElement('style');
 st.textContent='.lkq-hint{display:block;font-size:12px;color:var(--muted);margin:1px 0 4px}.lkq-row{display:grid;gap:6px;padding:8px 0;border-top:1px solid var(--line);font-size:14px}.lkq-yn{display:flex;gap:8px}'+
  '.lkq-chip{position:relative;flex:1 1 0;cursor:pointer}.lkq-chip input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}'+
  '.lkq-chip span{display:block;text-align:center;border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:13px;font-weight:550;background:var(--bg)}'+
  '.lkq-chip input:checked+span{background:var(--accent);border-color:var(--accent);color:var(--onc)}.lkq-chip input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}'+
  '@media print{.lkq-chip span{padding:1px 8px;border-radius:0}.lkq-chip input:checked+span{background:transparent;color:#000;font-weight:700;text-decoration:underline}}';
 document.head.appendChild(st);
})();
