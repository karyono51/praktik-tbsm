/* ---- Penilaian lebih dari satu siswa: per siswa (rubrik sendiri-sendiri) atau kelompok (satu rubrik untuk semua anggota) ---- */
/* ---- Form identitas & data unit, serta isian rinci per butir (hasil ukur, spesifikasi, satuan, temuan) ---- */
function p2(n){return (n<10?'0':'')+n}
function todayISO(){var d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())}
function tsFromTgl(){var m=String(V.tgl||'').match(/^(\d{4})-(\d{2})-(\d{2})$/),n=new Date();if(!m)return Date.now();return new Date(+m[1],+m[2]-1,+m[3],n.getHours(),n.getMinutes(),n.getSeconds()).getTime()}
function fmtTgl(iso){var m=String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):''}
function idnOf(k){V.idn=V.idn||{};return V.idn[k]||(V.idn[k]={})}
function fdKey(){return V.kel?'*':V.peserta}
function fdPeek(id){var a=(V.fd||{})[fdKey()];return (a&&a[id])||{}}
function fdOf(id){V.fd=V.fd||{};var k=fdKey();V.fd[k]=V.fd[k]||{};return V.fd[k][id]||(V.fd[k][id]={})}
function fdHtml(i){
  var d=fdPeek(i.id),has=!!(d.v||d.s||d.k),open=!!(V.open&&V.open[i.id]);
  var meas=i.m?'<div class="three"><label class="f">Hasil ukur<input data-fd="'+i.id+'" data-f="v" inputmode="decimal" maxlength="24" value="'+esc(d.v||'')+'"></label><label class="f">Spesifikasi<input data-fd="'+i.id+'" data-f="s" maxlength="32" value="'+esc(d.s||'')+'" placeholder="mis. 12,6 - 13"></label><label class="f">Satuan<input data-fd="'+i.id+'" data-f="u" maxlength="12" value="'+esc(d.u||'')+'" placeholder="V, mm"></label></div>':'';
  return '<button type="button" class="fdt" data-act="fdtoggle" data-id="'+i.id+'" aria-expanded="'+open+'">'+(i.m?'Isi hasil ukur &amp; temuan':'Isi temuan')+(has?' <span class="fdd">terisi</span>':'')+'</button>'+
    '<div class="fdp" id="fdp-'+i.id+'"'+(open?'':' hidden')+'>'+meas+'<label class="f">Keterangan / temuan<textarea data-fd="'+i.id+'" data-f="k" rows="2" maxlength="300" placeholder="Kondisi, kerusakan, atau tindakan yang dilakukan">'+esc(d.k||'')+'</textarea></label></div>';
}
function idnHtml(){
  var staff=isStaff(),names=staff&&V.group.length?V.group:[V.peserta],kel=staff&&V.kel&&names.length>1,k=kel?'*':V.peserta,sh=idnOf(k);
  var nis=kel?names.map(function(n){return '<label class="f">NIS '+esc(n)+'<input data-idn="nis" data-n="'+esc(n)+'" inputmode="numeric" maxlength="20" value="'+esc(idnOf(n).nis||'')+'"></label>'}).join('')
    :'<label class="f">NIS<input data-idn="nis" data-n="'+esc(k)+'" inputmode="numeric" maxlength="20" value="'+esc(sh.nis||'')+'" placeholder="Nomor induk siswa"></label>';
  return '<div class="card"><h3>Identitas &amp; data unit</h3>'+
    (staff&&!kel&&names.length>1?'<p class="note">Diisi untuk: <b>'+esc(V.peserta)+'</b>. Ganti siswa lewat tab nama untuk mengisi data siswa lain.</p>':'')+
    '<label class="f">Tanggal praktik<input id="fd-tgl" type="date" value="'+esc(V.tgl||'')+'"></label>'+nis+
    '<div class="two"><label class="f">Kendaraan (merek &amp; tipe)<input data-idn="kend" data-n="'+esc(k)+'" maxlength="40" value="'+esc(sh.kend||'')+'" placeholder="mis. Honda Beat 2019"></label><label class="f">No. polisi<input data-idn="nopol" data-n="'+esc(k)+'" maxlength="14" value="'+esc(sh.nopol||'')+'" placeholder="mis. D 1234 AB"></label></div>'+
    '<p class="note">Semua kolom boleh dikosongkan. Isian rinci tiap butir ada di tombol di bawah butir.</p></div>';
}
function dataFor(name){
  var key=V.kel?'*':name,id=(V.idn||{})[name]||{},sh=V.kel?((V.idn||{})['*']||{}):id,t=function(x){return String(x==null?'':x).trim()};
  var o={nis:t(id.nis),kend:t(sh.kend),nopol:t(sh.nopol),tgl:V.tgl||''},f={},src=(V.fd||{})[key]||{};
  V.job.items.forEach(function(i,n){var x=src[i.id];if(x&&(t(x.v)||t(x.s)||t(x.k)))f[i.id]={n:n+1,t:i.t,v:t(x.v),s:t(x.s),u:t(x.u),k:t(x.k)}});
  if(Object.keys(f).length)o.f=f;return o}
function infoText(d){
  var a=[];if(d.nis)a.push('NIS '+d.nis);if(d.kend)a.push('Kendaraan '+d.kend);if(d.nopol)a.push('No. polisi '+d.nopol);
  var s=a.length?'Data unit: '+a.join(', ')+'.':'',u=[],k=[];
  Object.keys(d.f||{}).forEach(function(i){var x=d.f[i];if(x.v)u.push('#'+x.n+' '+x.v+(x.u?' '+x.u:'')+(x.s?' (std '+x.s+')':''));if(x.k)k.push('#'+x.n+' '+x.k)});
  if(u.length)s+=' Ukur: '+u.join('; ')+'.';if(k.length)s+=' Temuan: '+k.join('; ')+'.';return s.trim()}
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
  V={mode:'exam',job:j,checks:{},peserta:first,catatan:'',sec:0,running:false,res:null,group:first?[first]:[],kel:false,cks:{},notes:{},items:null,rc:0,fd:{},idn:{},open:{},tgl:todayISO()};
  V.cks[first]=V.checks;
  if(keep&&isStaff()){V.group=keep.group.slice();V.kel=keep.kel;V.peserta=V.group[0]||'';V.cks={};V.group.forEach(function(n){V.cks[n]={}});V.cks['*']={};V.cks[V.peserta]=V.cks[V.peserta]||{};V.checks=curChecks();if(keep.idn){V.idn=keep.idn;V.tgl=keep.tgl||V.tgl}}
  render();window.scrollTo(0,0);
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
    if(!V.kel&&doneOf(rn)&&!confirm('Keluarkan '+rn+'? Isian penilaiannya akan hilang.'))return;
    V.group=V.group.filter(function(x){return x!==rn});delete V.cks[rn];
    if(V.peserta===rn||V.kel)V.peserta=V.group[0];
    V.checks=curChecks();render();
  }
  else if(a==='rtab'){stashNote();V.rc=parseInt(v,10);V.peserta=V.items[V.rc].nama;V.res.calc=V.items[V.rc].calc;V.catatan=V.notes[noteKey()]||'';render();window.scrollTo(0,0)}
  else if(a==='chk'){
    var val=parseInt(v,10);V.checks[b.dataset.id]=val;
    if(!V.running&&!timer&&V.sec===0)startTimer(),$('#tbtn').textContent='Jeda';
    var card=b.closest('.item');card.dataset.v=val;
    $$('button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===val))});
    syncProg();
  }
  else if(a==='fdtoggle'){var oid=b.dataset.id;V.open=V.open||{};V.open[oid]=!V.open[oid];var pn=document.getElementById('fdp-'+oid);if(pn)pn.hidden=!V.open[oid];b.setAttribute('aria-expanded',String(!!V.open[oid]))}
  else if(a==='timer'){if(V.running){stopTimer();b.textContent='Lanjut'}else{startTimer();b.textContent='Jeda'}}
  else if(a==='addsiswa'){
    var inp=$('#newsiswa'),nm=inp.value.trim();if(!nm){inp.focus();return}
    quickSiswa(nm,V.job.kelas);addMember(nm);toast('Siswa ditambahkan');
  }
  else if(a==='finish'){
    stopTimer();
    var ps=$('#peserta');if(ps&&!isStaff()){V.peserta=ps.value.trim();V.group=[V.peserta];V.cks[V.peserta]=V.checks}
    if(actRole()==='siswa'){S.siswaName=V.peserta;persist()}
    var nm=nameList();
    V.items=nm.map(function(n){return {nama:n,calc:calc(V.job,V.kel?V.cks['*']:(V.cks[n]||{}),S.kkm)}});
    V.rc=0;V.peserta=V.items[0].nama;V.res={calc:V.items[0].calc};V.catatan=V.notes[noteKey()]||'';
    V.mode='result';render();window.scrollTo(0,0);
  }
  else if(a==='redo'){var j=V.job,keep={group:nameList().slice(),kel:!!V.kel,idn:V.idn,tgl:V.tgl};startExam(j.id,keep)}
  else if(a==='save'){
    stashNote();
    var t0=tsFromTgl(),n=V.items.length;
    V.items.forEach(function(it,k){
      var nt=V.notes[V.kel?'*':it.nama]||'',dd=dataFor(it.nama),head=[(V.kel&&n>1)?'Penilaian kelompok ('+n+' siswa).':'',infoText(dd)].filter(Boolean).join(' ').slice(0,700);
      var rec={id:uid(),ts:t0+k,jobId:V.job.id,kelas:V.job.kelas,siswa:it.nama,tipe:isStaff()?'Penilaian':'Latihan',score:it.calc.score,kompeten:it.calc.kompeten,catatan:(head+' '+nt).trim().slice(0,1000),detik:V.sec,oleh:S.user.username,penilai:S.user.nama,sid:sidOf(it.nama)};
      if(dd.nis||dd.kend||dd.nopol||dd.f)rec.data=JSON.stringify(dd);
      S.results.push(rec);
    });
    persist();resetV();S.tab='rekap';render();window.scrollTo(0,0);toast(n>1?n+' hasil tersimpan':'Hasil tersimpan');
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
document.addEventListener('input',function(e){
  var t=e.target;if(V.mode!=='exam')return;
  if(t.id==='peserta')V.peserta=t.value;
  else if(t.dataset&&t.dataset.fd){fdOf(t.dataset.fd)[t.dataset.f]=t.value;var bt=document.querySelector('.fdt[data-id="'+t.dataset.fd+'"]'),d=fdPeek(t.dataset.fd);if(bt){var on=!!(d.v||d.s||d.k),sp=bt.querySelector('.fdd');if(on&&!sp)bt.insertAdjacentHTML('beforeend',' <span class="fdd">terisi</span>');else if(!on&&sp)sp.remove()}}
  else if(t.dataset&&t.dataset.idn)idnOf(t.dataset.n)[t.dataset.idn]=t.value;
  else if(t.id==='fd-tgl')V.tgl=t.value;
});
boot();
