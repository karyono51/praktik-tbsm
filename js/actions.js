/* ---- Penilaian lebih dari satu siswa: per siswa (rubrik sendiri-sendiri) atau kelompok (satu rubrik untuk semua anggota) ---- */
function noteKey(){return V.kel?'*':V.peserta}
function curChecks(){var k=V.kel?'*':V.peserta;return V.cks[k]||(V.cks[k]={})}
function nameList(){return V.group&&V.group.length?V.group:[V.peserta||'']}
function doneOf(n){return Object.keys(V.cks[n]||{}).length}
function groupComplete(){var t=V.job.items.length;if(V.kel)return doneOf('*')>=t;return nameList().every(function(n){return doneOf(n)>=t})}
function gcText(){var g=nameList();if(V.kel)return g.length+' anggota, satu penilaian bersama';if(g.length<2)return '';var t=V.job.items.length;return g.filter(function(n){return doneOf(n)>=t}).length+' dari '+g.length+' siswa lengkap'}
function anyChecked(){return Object.keys(V.cks||{}).some(function(k){return Object.keys(V.cks[k]).length>0})}
function stashNote(){var ct=$('#catatan');if(ct&&V.mode==='result')V.notes[noteKey()]=ct.value.trim();V.catatan=V.notes[noteKey()]||''}
function startExam(id,keep){
  stopTimer();
  var j=jobById(id);if(kelasBoleh().indexOf(j.kelas)<0){toast('Unit ini bukan untuk kelas kamu');return}
  var ro=S.roster.filter(function(r){return r.kelas===j.kelas});
  var first=isStaff()?(ro[0]?ro[0].nama:''):S.siswaName;
  V={mode:'exam',job:j,checks:{},peserta:first,catatan:'',sec:0,running:false,res:null,group:first?[first]:[],kel:false,cks:{},notes:{},items:null,rc:0,hs:{},nis:''};
  V.cks[first]=V.checks;
  if(keep&&isStaff()){V.group=keep.group.slice();V.kel=keep.kel;V.peserta=V.group[0]||'';V.cks={};V.group.forEach(function(n){V.cks[n]={}});V.cks['*']={};V.cks[V.peserta]=V.cks[V.peserta]||{};V.checks=curChecks()}
  render();window.scrollTo(0,0);
}
function finishExam(){
    stopTimer();
    var ps=$('#peserta');if(ps&&!isStaff()){V.peserta=ps.value.trim();V.group=[V.peserta];V.cks[V.peserta]=V.checks}
    if(actRole()==='siswa'){S.siswaName=V.peserta;persist()}
    var nm=nameList();
    V.items=nm.map(function(n){return {nama:n,calc:calc(V.job,V.kel?V.cks['*']:(V.cks[n]||{}),S.kkm)}});
    V.rc=0;V.peserta=V.items[0].nama;V.res={calc:V.items[0].calc};V.catatan=V.notes[noteKey()]||'';
    V.mode='result';render();window.scrollTo(0,0);
}
function addMember(n){
  if(!n||V.group.indexOf(n)>-1)return;
  V.group.push(n);V.cks[n]=V.cks[n]||{};
  V.peserta=V.kel?V.group[0]:n;
  V.checks=curChecks();render();
}
function syncProg(){
  var total=V.job.items.length,done=Object.keys(V.checks).length;
  var p=$('#prog');if(p)p.textContent=done;
  var f=$('#fin');if(f)f.disabled=!groupComplete();
  var g=$('#gcount');if(g)g.textContent=gcText();
  $$('.ptab[data-n]').forEach(function(t){var b=$('.pb',t);if(b)b.textContent=doneOf(t.dataset.n)+'/'+total});
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
  else if(a==='gmode'){V.kel=(v==='1');if(V.kel)V.cks['*']=V.cks['*']||{};V.peserta=V.group[0]||V.peserta;V.checks=curChecks();render()}
  else if(a==='ptab'){V.peserta=b.dataset.n;V.checks=curChecks();render()}
  else if(a==='padd'){var sel=$('#addpes');if(sel&&sel.value)addMember(sel.value)}
  else if(a==='prm'){
    var rn=b.dataset.n;if(V.group.length<2){toast('Minimal satu siswa');return}
    if(!V.kel&&doneOf(rn)&&!uiOk('prm:'+rn,'Keluarkan '+rn+'?\nIsian penilaiannya akan hilang.',b,{ok:'Keluarkan',danger:true}))return;
    V.group=V.group.filter(function(x){return x!==rn});delete V.cks[rn];
    if(V.peserta===rn||V.kel)V.peserta=V.group[0];
    V.checks=curChecks();render();
  }
  else if(a==='rtab'){stashNote();V.rc=parseInt(v,10);V.peserta=V.items[V.rc].nama;V.res.calc=V.items[V.rc].calc;V.catatan=V.notes[noteKey()]||'';render();window.scrollTo(0,0)}
  else if(a==='chk'){
    var val=parseInt(v,10);V.checks[b.dataset.id]=val;
    if(!V.running&&!timer&&V.sec===0)startTimer();
    var card=b.closest('.item,.ukk-row');card.dataset.v=val;
    $$('button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===val))});
    syncProg();
  }
  else if(a==='addsiswa'){
    var inp=$('#newsiswa'),nm=inp.value.trim();if(!nm){inp.focus();return}
    quickSiswa(nm,V.job.kelas);addMember(nm);toast('Siswa ditambahkan');
  }
  else if(a==='finish'){finishExam()}
  else if(a==='redo'){var j=V.job,keep={group:nameList().slice(),kel:!!V.kel};startExam(j.id,keep)}
  else if(a==='save'){
    stashNote();
    var t0=Date.now(),n=V.items.length;
    V.items.forEach(function(it,k){
      var nt=V.notes[V.kel?'*':it.nama]||'';
      if(V.job.ukk){var hh=(V.hs||{})[V.kel?'*':it.nama]||{},hn2=(V.hn||{})[V.kel?'*':it.nama]||{},hp=V.job.items.filter(function(i){return hh[i.id]||hn2[i.id]}).map(function(i){return i.no+'='+(hh[i.id]||'-')+(hn2[i.id]?' ('+hn2[i.id]+')':'')}).join('; ');if(hp)nt=(nt+' Hasil pemeriksaan: '+hp).trim().slice(0,1000)}
      if(V.kel&&n>1)nt=('Penilaian kelompok ('+n+' siswa). '+nt).trim().slice(0,1000);
      S.results.push({id:uid(),ts:t0+k,jobId:V.job.id,kelas:V.job.kelas,siswa:it.nama,tipe:isStaff()?'Penilaian':'Latihan',score:it.calc.score,kompeten:it.calc.kompeten,catatan:nt,detik:V.sec,oleh:S.user.username,penilai:S.user.nama,sid:sidOf(it.nama)});
    });
    persist();resetV();S.tab='rekap';render();window.scrollTo(0,0);toast(n>1?n+' hasil tersimpan':'Hasil tersimpan');
  }
  else if(a==='csv'){
    var rows=S.results.filter(function(r){return S.filter==='ALL'||r.kelas===S.filter}).sort(function(x,y){return x.ts-y.ts});
    var q=function(s){return '"'+String(s==null?'':s).replace(/"/g,'""')+'"'};
    var txt=['Tanggal,Kelas,Siswa,Unit,Jenis,Skor,Status'].concat(rows.map(function(r){var j=jobById(r.jobId);return [ymd(r.ts),r.kelas,q(r.siswa),q(j?j.judul:r.jobId),r.tipe,r.score,r.kompeten?'Kompeten':'Belum kompeten'].join(',')})).join('\n');
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
