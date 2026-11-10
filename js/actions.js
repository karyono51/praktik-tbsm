function startExam(id){
  stopTimer();
  var j=jobById(id);
  var ro=S.roster.filter(function(r){return r.kelas===j.kelas});
  V={mode:'exam',job:j,checks:{},peserta:isStaff()?(ro[0]?ro[0].nama:''):S.siswaName,catatan:'',sec:0,running:false,res:null};
  render();window.scrollTo(0,0);
}
function syncProg(){
  var done=Object.keys(V.checks).length,total=V.job.items.length;
  var p=$('#prog');if(p)p.textContent=done;
  var f=$('#fin');if(f)f.disabled=done<total;
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.dataset.act,v=b.dataset.v;
  if(false){S.role=v;persist();V={mode:'list',job:null,checks:{},peserta:'',catatan:'',sec:0,running:false,res:null};stopTimer();render()}
  else if(a==='tab'){S.tab=v;render();window.scrollTo(0,0)}
  else if(a==='kelas'){S.kelas=v;persist();render()}
  else if(a==='filter'){S.filter=v;render()}
  else if(a==='start'){startExam(v)}
  else if(a==='back'){stopTimer();V.mode='list';render()}
  else if(a==='chk'){
    var val=parseInt(v,10);V.checks[b.dataset.id]=val;
    if(!V.running&&!timer&&V.sec===0)startTimer(),$('#tbtn').textContent='Jeda';
    var card=b.closest('.item');card.dataset.v=val;
    $$('button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===val))});
    syncProg();
  }
  else if(a==='timer'){if(V.running){stopTimer();b.textContent='Lanjut'}else{startTimer();b.textContent='Jeda'}}
  else if(a==='addsiswa'){
    var inp=$('#newsiswa'),nm=inp.value.trim();if(!nm){inp.focus();return}
    quickSiswa(nm,V.job.kelas);V.peserta=nm;
    var keep=V.checks;render();V.checks=keep;toast('Siswa ditambahkan');
  }
  else if(a==='finish'){
    stopTimer();
    var ps=$('#peserta');if(ps)V.peserta=ps.value.trim();
    if(S.role==='siswa'){S.siswaName=V.peserta;persist()}
    V.res={calc:calc(V.job,V.checks,S.kkm)};V.mode='result';render();window.scrollTo(0,0);
  }
  else if(a==='redo'){var j=V.job;startExam(j.id)}
  else if(a==='save'){
    var ct=$('#catatan');V.catatan=ct?ct.value.trim():'';
    var c=V.res.calc;
    S.results.push({id:uid(),ts:Date.now(),jobId:V.job.id,kelas:V.job.kelas,siswa:V.peserta,tipe:isStaff()?'Penilaian':'Latihan',score:c.score,kompeten:c.kompeten,catatan:V.catatan,detik:V.sec,oleh:S.user.username,penilai:S.user.nama,sid:sidOf(V.peserta)});
    persist();V={mode:'list',job:null,checks:{},peserta:'',catatan:'',sec:0,running:false,res:null};S.tab='rekap';render();window.scrollTo(0,0);toast('Hasil tersimpan');
  }
  else if(a==='csv'){
    var rows=S.results.filter(function(r){return S.filter==='ALL'||r.kelas===S.filter}).sort(function(x,y){return x.ts-y.ts});
    var q=function(s){return '"'+String(s==null?'':s).replace(/"/g,'""')+'"'};
    var txt=['Tanggal,Kelas,Siswa,Unit,Jenis,Skor,Status'].concat(rows.map(function(r){var j=jobById(r.jobId);return [new Date(r.ts).toISOString().slice(0,10),r.kelas,q(r.siswa),q(j?j.judul:r.jobId),r.tipe,r.score,r.kompeten?'Kompeten':'Belum kompeten'].join(',')})).join('\n');
    var done=function(){toast('CSV disalin')};
    var fallback=function(){$('#csvbox').innerHTML='<textarea id="csvta" readonly style="min-height:140px;font-family:var(--f-mono);font-size:12px">'+esc(txt)+'</textarea>';var t=$('#csvta');t.focus();t.select()};
    try{navigator.clipboard.writeText(txt).then(done,fallback)}catch(err){fallback()}
  }
  else if(a==='rmcontoh'){S.results=S.results.filter(function(r){return !r.contoh});S.roster=S.roster.filter(function(r){return !r.contoh});persist();render()}
  else if(a==='rmall'){
    if(b.dataset.sure){if(can('hapus')){S.results=[];persist();render()}}
    else{b.dataset.sure='1';b.textContent='Ketuk lagi untuk menghapus'}
  }
});
document.addEventListener('change',function(e){
  if(e.target.id==='peserta'&&V.mode==='exam')V.peserta=e.target.value;
  if(e.target.id==='kkm'){var n=parseInt(e.target.value,10);if(n>=60&&n<=100){S.kkm=n;persist();toast('KKM '+n)}else{e.target.value=S.kkm}}
});
document.addEventListener('input',function(e){if(e.target.id==='peserta'&&V.mode==='exam')V.peserta=e.target.value});
boot();
