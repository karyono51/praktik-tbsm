/* cbt-staf.js (v80): sisi guru/admin untuk CBT dari bank soal.
   - Tab Pantau: peserta, status, sisa waktu, jumlah keluar halaman; tambah waktu, akhiri, buka kunci, reset; token sesi.
   - Tab Analisis: ringkasan nilai, tingkat kesukaran, daya beda, sebaran pilihan jawaban; ekspor Excel.
   - Cetak daftar hadir dan berita acara ujian.
   Dimuat setelah cbt.js. Dokumen: docs-CBT.md */
(function(){
 if(typeof BS==='undefined')return;
 var PN={sesi:'',runs:[],hasil:[],at:0,busy:false,err:'',timer:0,sesiLoaded:'',coba:{}};
 var AN={sesi:'',urut:'p'};

 function sesiList(){return BS.D.sesi.filter(schAkunOk).sort(function(a,b){return (b.ts||0)-(a.ts||0)})}
 function pilihSesi(cur){
  var L=sesiList();
  if(cur&&L.some(function(s){return s.id===cur}))return cur;
  var on=L.filter(function(s){return bsSesiStatus(s).k==='on'})[0];
  return (on||L[0]||{}).id||'';
 }
 function bukaList(){return sesiList().filter(function(s){return bsSesiStatus(s).k==='on'})}
 function pilihPantau(cur){
  var on=bukaList();
  if(cur==='ALL')return on.length?'ALL':pilihSesi('');
  if(cur&&sesiList().some(function(s){return s.id===cur}))return cur;
  return on.length>1?'ALL':pilihSesi('');
 }
 function sesiById(id){return BS.D.sesi.filter(function(s){return s.id===id})[0]}
 function selSesi(act,cur,all){
  var L=sesiList();
  return '<label class="f">Sesi ujian<select data-bs="'+act+'">'+(all?'<option value="ALL"'+(cur==='ALL'?' selected':'')+'>Semua sesi dibuka</option>':'')+L.map(function(s){return '<option value="'+s.id+'"'+(s.id===cur?' selected':'')+'>'+esc(s.judul)+' · Kelas '+(s.kelas==='ALL'?'semua':s.kelas)+'</option>'}).join('')+'</select></label>';
 }
 function roster(s){
  return S.users.filter(function(u){
   if(!hasRole(u,'siswa')||u.aktif===false)return false;
   if(s.kelas&&s.kelas!=='ALL'&&u.kelas!==s.kelas)return false;
   var sk=String(s.sekolah||'').toUpperCase(),uk=String(u.sekolah||'').toUpperCase();
   if(sk&&uk&&uk!=='ALL'&&sk!==uk)return false;
   return true;
  }).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
 }
 function jam(ts){return ts?new Date(ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'-'}
 function pay(d){var p={};try{p=JSON.parse(d.payload||'{}')}catch(e){}return p}
 function hasilSesi(id){
  var m={};
  BS.D.hasil.filter(function(h){return h.sesiId===id&&h.mode==='ujian'}).forEach(function(h){m[h.sid]=h});
  PN.hasil.forEach(function(h){if(h.sesiId===id&&h.mode==='ujian')m[h.sid]=bsFromDoc(h)});
  return m;
 }

 /* ================= Pantau ================= */
 async function pnLoad(){
  var semua=PN.sesi==='ALL',s=semua?null:sesiById(PN.sesi),ids=semua?bukaList().map(function(x){return x.id}):(s?[s.id]:[]);
  if(!Cloud.on||!ids.length||PN.busy)return;
  PN.busy=true;
  try{
   var Q=Appwrite.Query;
   var r=await Promise.all([Cloud.list('soal_run',[Q.equal('sesiId',ids)]),Cloud.list('soal_hasil',[Q.equal('sesiId',ids)])]);
   PN.runs=r[0];PN.hasil=r[1];PN.at=Date.now();PN.err='';PN.sesiLoaded=PN.sesi;
   await autoNilai();
  }catch(e){PN.err=(e&&e.message)||String(e)}
  PN.busy=false;
 }
 function statusRow(u,s,runs,hs){
  var h=hs[u.id],run=runs[u.id];
  if(h)return {k:'done',t:'Selesai',c:'ok',h:h,run:run};
  if(!run)return {k:'belum',t:'Belum mulai',c:'plain'};
  var p=pay(run),ext=Number(run.ext)||0,start=Date.parse(run.$createdAt)||0,sisa=start+((p.dur||0)+ext)*1000-Jam.now();
  var v=Math.max(0,(p.pindah||0)-(Number(run.pb)||0)),batas=+s.batas||0;
  var lock=s.aksi==='kunci'&&batas>0&&v>=batas;
  var info={run:run,p:p,sisa:sisa,v:v,ext:ext,lock:lock,seen:Jam.now()-(Date.parse(run.$updatedAt)||start),stop:run.stop===true};
  if(run.done)return Object.assign({k:'done',t:'Selesai (menunggu nilai)',c:'ok'},info);
  if(lock)return Object.assign({k:'lock',t:'Terkunci',c:'bad'},info);
  if(sisa<=0||info.stop)return Object.assign({k:'habis',t:info.stop?'Diakhiri':'Waktu habis',c:'warn'},info);
  return Object.assign({k:'on',t:'Mengerjakan',c:'warn'},info);
 }
 function pnSemua(){
  var on=bukaList(),by={};PN.runs.forEach(function(d){(by[d.sesiId]=by[d.sesiId]||{})[d.sid]=d});
  var h='<p class="note">'+(PN.err?'Gagal memuat: '+esc(PN.err):'Diperbarui '+jam(PN.at)+' · otomatis tiap 8 detik')+'</p>';
  if(!on.length)return h+'<p class="muted">Tidak ada sesi yang sedang dibuka.</p>';
  return h+on.map(function(s){
   var runs=by[s.id]||{},hs=hasilSesi(s.id),c={belum:0,on:0,done:0,lock:0,habis:0},ros=roster(s);
   ros.forEach(function(u){var k=statusRow(u,s,runs,hs).k;c[k]=(c[k]||0)+1});
   return '<div class="card"><div class="row sb"><b>'+esc(s.judul)+'</b><span class="pill ok">Kelas '+(s.kelas==='ALL'||!s.kelas?'semua':esc(s.kelas))+'</span></div><p class="note">'+ros.length+' peserta'+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+'</p><p class="note">Belum <b class="mono">'+c.belum+'</b> · Mengerjakan <b class="mono">'+c.on+'</b> · Selesai <b class="mono">'+c.done+'</b> · Terkunci <b class="mono">'+c.lock+'</b> · Habis <b class="mono">'+c.habis+'</b></p><button type="button" class="btn small primary" data-bs="pn-bukasesi" data-v="'+s.id+'">Pantau sesi ini</button></div>';
  }).join('');
 }
 function pnBody(){
  if(PN.sesi==='ALL')return pnSemua();
  var s=sesiById(PN.sesi);
  if(!s)return '<p class="muted">Belum ada sesi ujian. Buat sesi di tab Sesi.</p>';
  var runs={};PN.runs.forEach(function(d){runs[d.sid]=d});
  var hs=hasilSesi(s.id),ros=roster(s),rows=ros.map(function(u){return {u:u,s:statusRow(u,s,runs,hs)}});
  /* peserta yang punya catatan tetapi tidak ada di daftar akun kelas */
  var count={belum:0,on:0,done:0,lock:0,habis:0};rows.forEach(function(r){count[r.s.k]++});
  var h='';
  if(s.tok){
   var tk=BS.tk[s.id]||s.tokP||'';
   h+='<div class="card center"><span class="label">Token sesi</span><div class="bs-token mono">'+(tk?esc(tk):'—')+'</div><button type="button" class="btn small" data-bs="pn-token">Ganti token</button></div>';
  }
  h+='<div class="stats">'+[['Belum','belum'],['Mengerjakan','on'],['Selesai','done'],['Terkunci','lock'],['Habis','habis']].map(function(x){return '<div class="card"><span class="label">'+x[0]+'</span><b class="mono">'+count[x[1]]+'</b></div>'}).join('')+'</div>';
  var ongoing=count.on+count.lock,tunggu=rows.filter(function(r){return r.s.k==='done'&&!r.s.h&&r.s.run}).length;
  h+='<div class="row">'+
   '<button type="button" class="btn small" data-bs="pn-refresh">Muat ulang</button>'+
   '<button type="button" class="btn small" data-bs="pn-extall"'+(ongoing?'':' disabled')+'>+5 menit semua</button>'+
   '<button type="button" class="btn small" data-bs="pn-nilai"'+(count.habis&&bsAman()?'':' disabled')+'>Nilai yang berakhir</button>'+
   (!bsAman()&&tunggu?'<button type="button" class="btn small primary" data-bs="pn-nilaisemua">Nilai dari jawaban ('+tunggu+')</button>':'')+'</div>';
  h+='<p class="note">'+(PN.err?'Gagal memuat: '+esc(PN.err):'Diperbarui '+jam(PN.at)+' · otomatis tiap 8 detik')+'</p>';
  if(!rows.length)return h+'<p class="muted">Tidak ada siswa terdaftar untuk sesi ini.</p>';
  h+=rows.map(function(r){
   var u=r.u,st=r.s,line='';
   if(st.k==='on'||st.k==='lock'||st.k==='habis'){
    var tot=(st.p.ids||[]).length,ans=Object.keys(st.p.ans||{}).filter(function(k){return (st.p.ids||[]).indexOf(k)>-1}).length;
    line='<p class="note">Terjawab '+ans+'/'+tot+' · sisa '+(st.sisa>0?mmss(Math.ceil(st.sisa/1000)):'0:00')+(st.ext?' (+'+Math.round(st.ext/60)+' mnt)':'')+' · keluar halaman '+st.v+(+s.batas?'/'+s.batas:'')+' · terakhir aktif '+Math.round(st.seen/1000)+' dtk lalu'+(st.k==='on'&&st.seen>150000?' <b>(tidak aktif)</b>':'')+'</p>';
   }else if(st.k==='done'){
    var kkm=+s.kkm||S.kkm;
    if(!st.h)line='<p class="note">Nilai belum masuk.</p>';
    else line='<p class="note">Nilai <b class="mono">'+(st.h?st.h.score:'-')+'</b>'+(st.h?' · '+st.h.benar+' benar dari '+st.h.total+' · '+(st.h.score>=kkm?'tuntas':'belum tuntas'):'')+'</p>';
   }
   var rid=st.run?st.run.$id:'',act='';
   if(st.k==='on'||st.k==='lock'||st.k==='habis'){
    act+='<button type="button" class="btn small" data-bs="pn-ext" data-v="'+rid+'" data-n="300">+5 mnt</button><button type="button" class="btn small" data-bs="pn-ext" data-v="'+rid+'" data-n="900">+15 mnt</button>';
    if(st.v>0||st.lock)act+='<button type="button" class="btn small" data-bs="pn-buka" data-v="'+rid+'">Buka kunci</button>';
    if(st.k!=='habis'||!st.stop)act+='<button type="button" class="btn small" data-bs="pn-akhiri" data-v="'+rid+'">Akhiri</button>';
   }
   if(st.k==='done'&&!st.h&&st.run&&!bsAman())act+='<button type="button" class="btn small primary" data-bs="pn-nilai1" data-v="'+rid+'">Nilai dari jawaban</button>';
   if(st.k==='done'&&st.h&&!bsAman())act+='<button type="button" class="btn small" data-bs="pn-susulan" data-v="'+u.id+'">Susulan</button>';
   if(st.k==='done'||st.run)act+='<button type="button" class="btn small danger" data-bs="pn-reset" data-v="'+u.id+'">Ulang</button>';
   return '<div class="card"><div class="row sb"><b>'+esc(u.nama)+'</b><span class="pill '+st.c+'">'+st.t+'</span></div><p class="note">Kelas '+esc(u.kelas||'-')+'</p>'+line+(act?'<div class="row">'+act+'</div>':'')+'</div>';
  }).join('');
  return h;
 }
 var CETAK='<button type="button" class="btn small" data-bs="an-hadir">Hadir dan berita acara</button><button type="button" class="btn small" data-bs="an-kartu">Kartu token</button><button type="button" class="btn small" data-bs="an-rekap">Rekap per kelas</button>';
 window.bsViewPantau=function(){
  if(!Cloud.on)return '<div class="card"><p>Pantau langsung butuh mode server (Appwrite). Aplikasi ini sedang berjalan tanpa server, jadi hanya data di perangkat ini yang ada.</p></div>';
  PN.sesi=pilihPantau(PN.sesi);
  if(PN.sesi&&PN.sesiLoaded!==PN.sesi&&!PN.busy)pnLoad().then(pnPaint);
  return '<div class="card">'+selSesi('pn-sesi',PN.sesi,true)+'</div><div id="pn-body">'+pnBody()+'</div>'+(PN.sesi&&PN.sesi!=='ALL'?'<div class="row">'+CETAK+'</div>':'');
 };
 function pnPaint(){var e=document.getElementById('pn-body');if(e)e.innerHTML=pnBody()}
 function inPantau(){return !!S.user&&bsOn()&&BS.tab==='pantau'&&isStaff()&&Cloud.on}
 function pnTimer(){
  if(inPantau()&&!PN.timer){PN.timer=setInterval(function(){if(!inPantau()){pnStop();return}if(document.hidden)return;if(PN.runs.length>150&&Date.now()-PN.at<14000)return;pnLoad().then(pnPaint)},8000)}
  else if(!inPantau())pnStop();
 }
 function pnStop(){if(PN.timer){clearInterval(PN.timer);PN.timer=0}}
 /* tampilkan ulang isi tanpa menunggu server (jam sisa waktu) */
 setInterval(function(){if(inPantau()&&!document.hidden)pnPaint()},1000);

 var render1=render;
 render=function(){render1.apply(this,arguments);try{pnTimer()}catch(e){}};

 async function tulisRun(rid,data,ok){
  try{
   await Cloud.db.updateDocument(CFG.DB,'soal_run',rid,data);
   if(ok)toast(ok);
   await pnLoad();pnPaint();
  }catch(e){
   var m=(e&&e.message)||String(e);
   toast(/attribute|unknown/i.test(m)?'Kolom ext/stop/pb belum ada di soal_run. Jalankan: node tools/setup-appwrite.mjs':'Gagal: '+m);
  }
 }
 /* mode biasa: guru menghitung nilai dari jawaban di catatan ujian (soal_run) bila nilai siswa gagal terkirim */
 async function nilaiRun(run,s){
  var p=pay(run),ids=p.ids||[],ans=p.ans||{},u=S.users.filter(function(x){return x.id===run.sid})[0];
  if(!ids.length)throw new Error('Catatan ujian tidak memuat daftar soal');
  var hg=bsHitung(ids,function(x){return ans[x]},null),sum=hg.sum,ben=hg.ben;
  var dur=(s.durasi||0)*60,start=Date.parse(run.$createdAt)||0,end=Date.parse(run.$updatedAt)||start;
  var h={id:'h'+run.$id.slice(1),ts:end||Jam.now(),sid:run.sid,siswa:u?u.nama:'(siswa)',kelas:u?(u.kelas||''):'',mode:'ujian',sesiId:s.id,sesiJudul:s.judul,
   score:hg.score,pend:hg.pend||undefined,benar:ben,total:ids.length,detik:Math.max(0,Math.min(Math.round((end-start)/1000),dur||1e9)),
   ans:ans,order:ids,oo:p.oo,pindah:p.pindah||0,pts:+sum.toFixed(2),tampil:s.tampil,kkm:s.kkm};
  var ok=await bsPut('hasil',h);
  if(!ok)throw new Error(h.err||'Server menolak penyimpanan');
  return h;
 }
 /* mode Biasa: peserta yang sudah selesai tetapi nilainya belum masuk dinilai otomatis dari jawaban di server; tiap catatan dicoba sekali */
 async function autoNilai(){
  if(bsAman()||!bsEdit())return;
  var n=0;
  for(var i=0;i<PN.runs.length;i++){
   var d=PN.runs[i];if(!d.done||PN.coba[d.$id])continue;
   var s=sesiById(d.sesiId);if(!s||hasilSesi(s.id)[d.sid])continue;
   PN.coba[d.$id]=1;
   try{await nilaiRun(d,s);n++}catch(e){}
  }
  if(n)toast(n+' nilai dihitung otomatis dari jawaban');
 }
 function runOf(rid){return PN.runs.filter(function(d){return d.$id===rid})[0]}

 /* aksi massal di server (akhiriSemua, nilaiUlang): server berhenti di batas waktunya dan melapor sisa; diulang sampai selesai */
 async function cbtMassal(aksi,sesiId,kata){
  var tot={n:0,sisa:0,gagal:0,lewat:0,total:0},putaran=0,rs;
  do{
   rs=await cbtFn({action:aksi,sesiId:sesiId});putaran++;
   tot.n+=rs.n||0;tot.gagal+=rs.gagal||0;tot.sisa=rs.sisa||0;tot.lewat=Math.max(tot.lewat,rs.lewat||0);tot.total=Math.max(tot.total,rs.total||0);
   if(rs.sisa>0)toast(tot.n+' '+kata+', sisa '+rs.sisa+'…');
  }while(rs.sisa>0&&rs.n>0&&putaran<30);
  return tot;
 }
 /* mode biasa (kunci ada di perangkat guru): hitung ulang di sini. Hasil yang soalnya hilang atau tanpa kunci dilewati. */
 async function nilaiUlangKlien(s){
  var hm=hasilSesi(s.id),kerja=[],lewat=0,tot=0,n=0;
  Object.keys(hm).forEach(function(k){
   var h=hm[k];tot++;
   var o=BS.D.hasil.filter(function(x){return x.id===h.id})[0]||h,ids=o.order||[];
   if(!ids.length||ids.some(function(id){var q=bsSoalById(id);return !q||!bsHasKey(q)})){lewat++;return}
   var hg2=bsHitung(ids,function(x){return o.ans?o.ans[x]:null},o.nu),sum=hg2.sum,ben=hg2.ben;
   var sc=hg2.score;
   if(sc!==o.score||ben!==o.benar)kerja.push({o:o,sc:sc,ben:ben,pts:+sum.toFixed(2)});
  });
  for(var i=0;i<kerja.length;i+=6){
   var rs=await Promise.all(kerja.slice(i,i+6).map(function(w){w.o.score=w.sc;w.o.benar=w.ben;w.o.pts=w.pts;return bsPut('hasil',w.o)}));
   rs.forEach(function(ok){if(ok)n++});
  }
  return {total:tot,n:n,sisa:kerja.length-n,lewat:lewat};
 }

 /* ================= Analisis ================= */
 function stat(arr){
  var n=arr.length;if(!n)return null;
  var s=arr.slice().sort(function(a,b){return a-b}),sum=arr.reduce(function(a,b){return a+b},0),m=sum/n;
  var sd=Math.sqrt(arr.reduce(function(a,b){return a+(b-m)*(b-m)},0)/n);
  return {n:n,mean:m,med:n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2,sd:sd,min:s[0],max:s[n-1]};
 }
 function analisis(sesiId){
  var s=sesiById(sesiId);if(!s)return null;
  var hm=hasilSesi(sesiId),H=Object.keys(hm).map(function(k){return hm[k]});
  var skor=H.map(function(h){return +h.score||0});
  var res={sesi:s,H:H,st:stat(skor),items:[],rel:reliabilitas(H)};
  var kkm=+s.kkm||S.kkm;res.tuntas=skor.filter(function(x){return x>=kkm}).length;res.kkm=kkm;
  var urut=H.slice().sort(function(a,b){return b.score-a.score}),g=Math.max(1,Math.round(H.length*0.27));
  var atas={},bawah={};urut.slice(0,g).forEach(function(h){atas[h.id]=1});urut.slice(-g).forEach(function(h){bawah[h.id]=1});
  if(H.length<2){g=0}
  var per={};
  H.forEach(function(h){
   (h.order||[]).forEach(function(id){
    var q=bsSoalById(id);if(!q)return;
    var o=per[id]=per[id]||{id:id,q:q,n:0,sum:0,au:0,an:0,bu:0,bn:0,pil:{},nokey:!bsHasKey(q)||q.tipe==='uraian'};
    var a=h.ans?h.ans[id]:undefined;
    if(o.nokey)return;
    var f=bsFrac(q,a==null?null:a);o.n++;o.sum+=f;
    if(atas[h.id]&&g){o.au+=f;o.an++}
    if(bawah[h.id]&&g&&!atas[h.id]){o.bu+=f;o.bn++}
    if(q.tipe==='pg'&&typeof a==='number')o.pil[a]=(o.pil[a]||0)+1;
    else if(q.tipe==='kompleks'&&Array.isArray(a))a.forEach(function(i){o.pil[i]=(o.pil[i]||0)+1});
    if(a==null)o.kosong=(o.kosong||0)+1;
   });
  });
  Object.keys(per).forEach(function(id){
   var o=per[id];
   o.p=o.n?o.sum/o.n:null;
   o.db=(o.an>=2&&o.bn>=2)?(o.au/o.an-o.bu/o.bn):null;
   o.kes=o.p===null?'-':o.p>=0.7?'Mudah':o.p>=0.3?'Sedang':'Sukar';
   o.dbk=o.db===null?'-':o.db>=0.4?'Baik':o.db>=0.2?'Cukup':o.db>=0?'Perlu revisi':'Bermasalah';
   res.items.push(o);
  });
  res.items.sort(function(a,b){
   if(AN.urut==='db')return (a.db===null?9:a.db)-(b.db===null?9:b.db);
   if(AN.urut==='n')return b.n-a.n;
   return (a.p===null?9:a.p)-(b.p===null?9:b.p);
  });
  return res;
 }

 /* reliabilitas (Cronbach alpha, skor sebagian ikut dihitung) atas soal yang dikerjakan SEMUA peserta.
    Pada sesi dengan soal acak per siswa, irisan soal bisa terlalu kecil: hasilnya kosong (bukan nol). */
 function reliabilitas(H){
  if(H.length<5)return null;
  var common=null;
  H.forEach(function(h){var ids=h.order||[];common=common===null?ids.slice():common.filter(function(x){return ids.indexOf(x)>-1})});
  common=(common||[]).filter(function(id){var q=bsSoalById(id);return q&&bsHasKey(q)&&q.tipe!=='uraian'});
  if(common.length<5)return null;
  var k=common.length,M=H.map(function(h){return common.map(function(id){var q=bsSoalById(id),a=h.ans?h.ans[id]:null;return bsFrac(q,a==null?null:a)})});
  function vr(a){var m=a.reduce(function(x,y){return x+y},0)/a.length;return a.reduce(function(x,y){return x+(y-m)*(y-m)},0)/(a.length-1)}
  var vt=vr(M.map(function(r){return r.reduce(function(x,y){return x+y},0)}));
  if(!(vt>0))return null;
  var sv=0;for(var j=0;j<k;j++)sv+=vr(M.map(function(r){return r[j]}));
  var al=(k/(k-1))*(1-sv/vt);
  return {a:al,k:k,n:H.length,common:common,M:M,ket:al>=0.8?'Sangat baik':al>=0.7?'Baik':al>=0.5?'Cukup':'Rendah'};
 }
 window.cbtReliabilitas=reliabilitas;
 var HURUF='ABCDEFGHIJ';
 function sebaran(o){
  var q=o.q;if(q.tipe==='kategori'||!q.opts)return '';
  var tot=o.n||1;
  return q.opts.map(function(_,i){
   var n=o.pil[i]||0,key=q.tipe==='pg'?q.kunci===i:(q.kunci||[]).indexOf(i)>-1;
   return '<span class="pill '+(key?'ok':'plain')+'">'+HURUF[i]+(key?'*':'')+' '+Math.round(n/tot*100)+'%</span>';
  }).join(' ');
 }
 window.bsViewAnalisis=function(){
  AN.sesi=pilihSesi(AN.sesi);
  if(!AN.sesi)return '<p class="muted">Belum ada sesi ujian.</p>';
  var a=analisis(AN.sesi),h='<div class="card">'+selSesi('an-sesi',AN.sesi)+'</div>';
  if(!a||!a.H.length)return h+'<p class="muted">Belum ada peserta yang selesai pada sesi ini.</p><div class="row"><button type="button" class="btn small" data-bs="an-hadir">Hadir dan berita acara</button><button type="button" class="btn small" data-bs="an-kartu">Kartu token</button><button type="button" class="btn small" data-bs="an-rekap">Rekap per kelas</button></div>';
  var st=a.st,f=function(x){return Math.round(x*10)/10};
  h+='<div class="stats"><div class="card"><span class="label">Peserta</span><b class="mono">'+st.n+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+f(st.mean)+'</b></div><div class="card"><span class="label">Median</span><b class="mono">'+f(st.med)+'</b></div><div class="card"><span class="label">Simpangan baku</span><b class="mono">'+f(st.sd)+'</b></div><div class="card"><span class="label">Tertinggi</span><b class="mono">'+st.max+'</b></div><div class="card"><span class="label">Terendah</span><b class="mono">'+st.min+'</b></div><div class="card"><span class="label">Tuntas (KKM '+a.kkm+')</span><b class="mono">'+Math.round(a.tuntas/st.n*100)+'%</b></div>'+(a.rel?'<div class="card"><span class="label">Reliabilitas (α)</span><b class="mono">'+a.rel.a.toFixed(2)+'</b><span class="note">'+a.rel.ket+' · '+a.rel.k+' soal</span></div>':'')+'</div>';
  h+='<div class="row"><button type="button" class="btn small" data-bs="an-ekspor">Ekspor Excel</button><button type="button" class="btn small" data-bs="an-hadir">Hadir dan berita acara</button><button type="button" class="btn small" data-bs="an-kartu">Kartu token</button><button type="button" class="btn small" data-bs="an-rekap">Rekap per kelas</button>'+(bsEdit()?'<button type="button" class="btn small" data-bs="an-ulang">Nilai ulang dengan kunci terbaru</button>':'')+'<label class="f" style="min-width:150px">Urutkan<select data-bs="an-urut"><option value="p"'+(AN.urut==='p'?' selected':'')+'>Tersukar dulu</option><option value="db"'+(AN.urut==='db'?' selected':'')+'>Daya beda terendah</option><option value="n"'+(AN.urut==='n'?' selected':'')+'>Paling banyak diujikan</option></select></label></div>';
  h+=a.items.map(function(o){
   if(o.nokey)return '<div class="card"><p class="note">'+esc(String(o.q.q||'').slice(0,100))+'</p><p class="note">Kunci tidak tersedia di perangkat ini, soal dilewati.</p></div>';
   var warn=o.db!==null&&o.db<0?'<span class="pill bad">Periksa kunci</span>':'';
   return '<div class="card"><div class="row sb"><span class="note">'+esc(o.q.mapel||'')+' · '+BS_TIPE[o.q.tipe]+' · '+o.n+' siswa</span>'+warn+'</div><p>'+esc(String(o.q.q||'').slice(0,160))+'</p>'+(window.sgAda&&sgAda(o.q)?'<div class="sg-box">'+(o.q.qi?sgImg(o.q.qi,'sg-th ld-zoom','Gambar soal'):'')+'<span class="pill plain">Soal bergambar</span></div>':'')+
    '<div class="row"><span class="pill '+(o.kes==='Mudah'?'ok':o.kes==='Sukar'?'bad':'warn')+'">p '+(o.p===null?'-':o.p.toFixed(2))+' · '+o.kes+'</span><span class="pill '+(o.dbk==='Baik'?'ok':o.dbk==='Cukup'?'warn':o.dbk==='-'?'plain':'bad')+'">DB '+(o.db===null?'-':o.db.toFixed(2))+' · '+o.dbk+'</span>'+(o.kosong?'<span class="pill plain">kosong '+o.kosong+'</span>':'')+'</div>'+
    (sebaran(o)?'<div class="row">'+sebaran(o)+'</div>':'')+'</div>';
  }).join('');
  return h;
 };

 function ekspor(){
  if(typeof XLSX==='undefined'){if(window.Pustaka)Pustaka.muat();toast('Pustaka Excel sedang disiapkan. Coba lagi sebentar.');return}
  var id=AN.sesi,s=sesiById(id),a=analisis(id);if(!s||!a)return;
  var kkm=a.kkm,ros=roster(s),hs=hasilSesi(id);
  var wb=XLSX.utils.book_new();
  var rek=a.H.slice().sort(function(x,y){return String(x.siswa).localeCompare(String(y.siswa),'id')}).map(function(h,i){return {No:i+1,Nama:h.siswa,Kelas:h.kelas||'',Nilai:h.score,Benar:h.benar,Soal:h.total,'Durasi (menit)':Math.round((h.detik||0)/6)/10,'Keluar halaman':h.pindah||0,Status:h.score>=kkm?'Tuntas':'Belum tuntas'}});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rek),'Rekap nilai');
  var items=a.items.filter(function(o){return !o.nokey}).map(function(o,i){return {No:i+1,Mapel:o.q.mapel||'',Tipe:BS_TIPE[o.q.tipe],Soal:String(o.q.q||'').slice(0,200),Peserta:o.n,'Kesukaran (p)':o.p===null?'':+o.p.toFixed(3),Kesukaran:o.kes,'Daya beda':o.db===null?'':+o.db.toFixed(3),'Ket. daya beda':o.dbk,Kosong:o.kosong||0}});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(items),'Analisis butir');
  var had=ros.map(function(u,i){var h=hs[u.id];return {No:i+1,Nama:u.nama,Kelas:u.kelas||'',Kehadiran:h?'Hadir':'Tidak hadir',Nilai:h?h.score:''}});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(had),'Daftar hadir');
  if(a.rel){
   var mx=a.H.map(function(h,i){var o={No:i+1,Nama:h.siswa,Kelas:h.kelas||''},tot=0;a.rel.common.forEach(function(id,j){var v=+a.rel.M[i][j].toFixed(3);o['S'+(j+1)]=v;tot+=v});o.Jumlah=+tot.toFixed(2);return o}).sort(function(x,y){return String(x.Nama).localeCompare(String(y.Nama),'id')});
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(mx),'Matriks skor');
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{Reliabilitas_alpha:+a.rel.a.toFixed(3),Keterangan:a.rel.ket,Jumlah_soal:a.rel.k,Peserta:a.rel.n}]),'Reliabilitas');
  }
  XLSX.writeFile(wb,'analisis-'+String(s.judul).replace(/[^\w-]+/g,'_').slice(0,40)+'-'+ymd(Date.now())+'.xlsx');
 }

 /* ================= Daftar hadir dan berita acara ================= */
 function teks(v){var d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML}
function sesiAktif(){return BS.tab==='pantau'&&PN.sesi&&PN.sesi!=='ALL'?PN.sesi:AN.sesi}
 function cetakHtml(html){
  var old=document.getElementById('uj-print');if(old)old.remove();
  var el=document.createElement('div');el.id='uj-print';el.innerHTML=html;document.body.appendChild(el);
  document.body.classList.add('uj-printing');
  setTimeout(function(){window.print()},50);
 }
 /* kartu peserta dan token: satu kartu per siswa terdaftar di sesi */
 function kartuToken(id){
  var s=sesiById(id);if(!s)return;
  var tk=BS.tk[s.id]||s.tokP||'';
  if(!s.tok||!tk){toast('Sesi ini tidak memakai token');return}
  var jd=(s.mulai?bsWaktu(s.mulai):'Sesuai jadwal guru')+(s.selesai?' sampai '+bsWaktu(s.selesai):'');
  var cards=roster(s).map(function(u){return '<div style="border:1px solid #000;padding:8px 10px;break-inside:avoid;font-size:10pt"><b>KARTU PESERTA UJIAN ONLINE</b><br>'+teks(SEK.nama)+'<hr style="margin:4px 0">Nama: <b>'+teks(u.nama)+'</b><br>Kelas: '+teks(u.kelas||'-')+'<br>Sesi: '+teks(s.judul)+'<br>Jadwal: '+teks(jd)+'<br>Durasi: '+(s.durasi||0)+' menit<br>Token: <b style="font-size:18pt;letter-spacing:3px">'+teks(tk)+'</b></div>'}).join('');
  if(!cards){toast('Tidak ada siswa terdaftar untuk sesi ini');return}
  cetakHtml('<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+cards+'</div>');
 }
 /* rekap nilai per kelas: sheet Ringkasan dan satu sheet per kelas */
 async function rekapKelas(id){
  if(typeof XLSX==='undefined'){if(window.Pustaka)Pustaka.muat();toast('Pustaka Excel sedang disiapkan. Coba lagi sebentar.');return}
  var s=sesiById(id);if(!s)return;
  if(Cloud.on&&PN.sesiLoaded!==id){PN.sesi=id;await pnLoad()}
  var hs=hasilSesi(id),kkm=+s.kkm||S.kkm,kls={};
  roster(s).forEach(function(u){var k=u.kelas||'-';(kls[k]=kls[k]||[]).push(u)});
  var wb=XLSX.utils.book_new(),ring=[];
  Object.keys(kls).sort().forEach(function(k){
   var rows=kls[k].map(function(u,i){var h=hs[u.id];return {No:i+1,Nama:u.nama,Kelas:k,Status:h?'Selesai':'Belum mengerjakan',Nilai:h?h.score:'','Soal benar':h?h.benar:'','Jumlah soal':h?h.total:'','Keluar halaman':h?(h.pindah||0):'',Keterangan:h?(h.score>=kkm?'Tuntas':'Belum tuntas'):''}});
   var sk=kls[k].map(function(u){return hs[u.id]}).filter(Boolean).map(function(h){return +h.score||0});
   ring.push({Kelas:k,Peserta:kls[k].length,Selesai:sk.length,'Belum mengerjakan':kls[k].length-sk.length,'Rata-rata':sk.length?Math.round(sk.reduce(function(a,b){return a+b},0)/sk.length*10)/10:'',Tertinggi:sk.length?Math.max.apply(null,sk):'',Terendah:sk.length?Math.min.apply(null,sk):'','Tuntas (%)':sk.length?Math.round(sk.filter(function(x){return x>=kkm}).length/sk.length*100):''});
   XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),String('Kelas '+k).replace(/[:\\\/?*\[\]]/g,'-').slice(0,31));
  });
  if(!ring.length){toast('Tidak ada siswa terdaftar untuk sesi ini');return}
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(ring),'Ringkasan');
  wb.SheetNames.unshift(wb.SheetNames.pop());
  XLSX.writeFile(wb,'rekap-kelas-'+String(s.judul).replace(/[^a-zA-Z0-9]+/g,'-').slice(0,40)+'-'+ymd(Date.now())+'.xlsx');
 }
 async function cetakHadir(id){
  var s=sesiById(id);if(!s)return;
  if(Cloud.on&&PN.sesiLoaded!==id){PN.sesi=id;await pnLoad()}
  var runs={};PN.runs.forEach(function(d){runs[d.sid]=d});
  var hs=hasilSesi(id),ros=roster(s);
  var hadir=0,rows=ros.map(function(u,i){
   var h=hs[u.id],run=runs[u.id],mulai=run?Date.parse(run.$createdAt):(h?(h.ts-(h.detik||0)*1000):0);
   if(h||run)hadir++;
   return '<tr><td>'+(i+1)+'</td><td>'+teks(u.nama)+'</td><td>'+teks(u.kelas||'')+'</td><td>'+((h||run)?'Hadir':'Tidak hadir')+'</td><td>'+(mulai?jam(mulai):'')+'</td><td>'+(h?jam(h.ts):'')+'</td><td>'+(h?h.score:'')+'</td><td>'+(h&&h.pindah?h.pindah:'')+'</td><td style="width:70px"></td></tr>';
  }).join('');
  var kop='<div class="ujk"><img src="'+LOGO+'" alt=""><div><b>'+teks(SEK.nama)+'</b><span>'+teks(SEK.program)+'</span><small>'+teks(SEK.alamat)+'</small></div></div>';
  var html=kop+'<h2 style="text-align:center;margin:6px 0">DAFTAR HADIR DAN BERITA ACARA UJIAN</h2>'+
   '<table style="margin-bottom:6px"><tbody><tr><td style="width:22%">Sesi ujian</td><td>'+teks(s.judul)+'</td><td style="width:18%">Kelas</td><td style="width:14%">'+teks(s.kelas==='ALL'?'Semua':s.kelas)+'</td></tr>'+
   '<tr><td>Hari dan tanggal</td><td>'+teks(new Date(s.mulai||Date.now()).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))+'</td><td>Durasi</td><td>'+(s.durasi||0)+' menit</td></tr></tbody></table>'+
   '<table><thead><tr><th>No</th><th>Nama</th><th>Kelas</th><th>Kehadiran</th><th>Mulai</th><th>Selesai</th><th>Nilai</th><th>Keluar halaman</th><th>Paraf</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<p style="margin-top:8px">Peserta terdaftar: <b>'+ros.length+'</b> · Hadir: <b>'+hadir+'</b> · Tidak hadir: <b>'+(ros.length-hadir)+'</b></p>'+
   '<p>Catatan selama ujian:</p><div style="border:1px solid #000;height:64px"></div>'+
   '<div style="display:flex;justify-content:space-between;margin-top:18px;text-align:center"><div style="width:45%">Pengawas<br><br><br><br>(................................)</div><div style="width:45%">Guru mata pelajaran<br><br><br><br>(................................)</div></div>';
  var old=document.getElementById('uj-print');if(old)old.remove();
  var el=document.createElement('div');el.id='uj-print';el.innerHTML=html;document.body.appendChild(el);
  document.body.classList.add('uj-printing');
  setTimeout(function(){window.print()},50);
 }

 /* ================= Aksi ================= */
 document.addEventListener('change',function(e){
  var b=e.target.closest&&e.target.closest('select[data-bs]');if(!b)return;
  var a=b.dataset.bs;
  if(a==='pn-sesi'){PN.sesi=b.value;PN.runs=[];PN.hasil=[];PN.sesiLoaded='';render()}
  else if(a==='an-sesi'){AN.sesi=b.value;render()}
  else if(a==='an-urut'){AN.urut=b.value;render()}
 });
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
  var a=b.dataset.bs,v=b.dataset.v;
  if(a==='pn-refresh'){pnLoad().then(pnPaint)}
  else if(a==='pn-bukasesi'){PN.sesi=v;PN.runs=[];PN.hasil=[];PN.sesiLoaded='';render()}
  else if(a==='pn-ext'){var run=runOf(v);if(run)tulisRun(v,{ext:(Number(run.ext)||0)+(+b.dataset.n||300)},'Waktu ditambah')}
  else if(a==='pn-akhiri'){uiConfirm('Akhiri ujian siswa ini? Jawabannya dikirim otomatis dan tidak bisa dilanjutkan.',{ok:'Akhiri',danger:true}).then(function(ok){if(ok)tulisRun(v,{stop:true},'Siswa akan mengirim jawabannya dalam beberapa detik')})}
  else if(a==='pn-buka'){var r2=runOf(v);if(r2)tulisRun(v,{pb:pay(r2).pindah||0},'Kunci dibuka')}
  else if(a==='pn-extall'){
   var s=sesiById(PN.sesi);
   uiConfirm('Tambah 5 menit untuk semua siswa yang sedang mengerjakan?',{ok:'Tambah'}).then(async function(ok){
    if(!ok)return;var n=0,aktif=PN.runs.filter(function(d){return !d.done});
    /* bertahap 8 sekaligus: ratusan siswa tidak menunggu satu per satu */
    for(var i=0;i<aktif.length;i+=8){
     var rs=await Promise.all(aktif.slice(i,i+8).map(function(d){return Cloud.db.updateDocument(CFG.DB,'soal_run',d.$id,{ext:(Number(d.ext)||0)+300}).then(function(){return 1},function(){return 0})}));
     rs.forEach(function(x){n+=x});
    }
    toast(n+' dari '+aktif.length+' siswa ditambah waktunya');await pnLoad();pnPaint();
   });
  }
  else if(a==='pn-nilai'){
   uiConfirm('Nilai semua peserta yang waktunya habis atau diakhiri, memakai jawaban tersimpan?',{ok:'Nilai'}).then(function(ok){
    if(!ok)return;
    cbtMassal('akhiriSemua',PN.sesi,'dinilai').then(function(t){toast(t.n+' peserta dinilai'+(t.sisa?', '+t.sisa+' belum selesai. Tekan lagi.':''));return pnLoad()}).then(pnPaint,function(er){toast('Gagal: '+((er&&er.message)||er))});
   });
  }
  else if(a==='pn-nilai1'||a==='pn-nilaisemua'){
   var s5=sesiById(PN.sesi);if(!s5||bsAman())return;PN.coba={};
   var target=a==='pn-nilai1'?PN.runs.filter(function(d){return d.$id===v}):PN.runs.filter(function(d){return d.done&&!hasilSesi(s5.id)[d.sid]});
   if(!target.length)return;
   (async function(){
    var n=0,gagal='';toast('Menilai '+target.length+' peserta…');
    for(var i=0;i<target.length;i++){try{await nilaiRun(target[i],s5)  ;n++}catch(er){gagal=(er&&er.message)||String(er)}}
    toast(n+' peserta dinilai'+(gagal?'. Gagal: '+gagal:''));await pnLoad();pnPaint();render();
   })();
  }
  else if(a==='pn-susulan'){
   var s6=sesiById(PN.sesi),u6=S.users.filter(function(x){return x.id===v})[0];
   if(!s6||bsAman())return;
   uiConfirm('Beri kesempatan susulan untuk '+(u6?u6.nama:'siswa ini')+'? Hasil sebelumnya disimpan sebagai arsip, siswa bisa mengerjakan lagi.',{ok:'Beri susulan'}).then(async function(ok){
    if(!ok)return;
    try{
     var h6=hasilSesi(s6.id)[v];if(!h6)return;
     var arsip=Object.assign({},h6,{id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,8),mode:'arsip',r:0,d:0,bad:0,err:''});
     if(!(await bsPut('hasil',arsip)))throw new Error(arsip.err||'Arsip gagal disimpan');
     await bsDel('hasil',h6.id);try{await Cloud.db.deleteDocument(CFG.DB,'soal_hasil',h6.id)}catch(er){}
     var run6=PN.runs.filter(function(d){return d.sid===v})[0];
     if(run6){try{await Cloud.db.deleteDocument(CFG.DB,'soal_run',run6.$id)}catch(er){}}
     PN.hasil=PN.hasil.filter(function(d){return d.sid!==v||d.mode!=='ujian'});
     toast('Susulan dibuka. Hasil lama diarsipkan');await pnLoad();pnPaint();render();
    }catch(er){toast('Gagal: '+((er&&er.message)||er))}
   });
  }
  else if(a==='pn-reset'){
   var s3=sesiById(PN.sesi),u=S.users.filter(function(x){return x.id===v})[0];
   uiConfirm('Ulangkan ujian untuk '+(u?u.nama:'siswa ini')+'? Hasil dan jawabannya dihapus, siswa bisa mulai dari awal.',{ok:'Ulangkan',danger:true}).then(async function(ok){
    if(!ok||!s3)return;
    try{
     var h=hasilSesi(s3.id)[v];
     if(h){await bsDel('hasil',h.id);try{await Cloud.db.deleteDocument(CFG.DB,'soal_hasil',h.id)}catch(er){}}
     var run=PN.runs.filter(function(d){return d.sid===v})[0];
     if(run){try{await Cloud.db.deleteDocument(CFG.DB,'soal_run',run.$id)}catch(er){}}
     PN.hasil=PN.hasil.filter(function(d){return d.sid!==v});
     toast('Siswa bisa mengulang');await pnLoad();pnPaint();
    }catch(er){toast('Gagal: '+((er&&er.message)||er))}
   });
  }
  else if(a==='pn-token'){
   var s4=sesiById(PN.sesi);if(!s4)return;
   s4.tok=true;s4.tokP=bsTokenBaru();
   (async function(){
    if(!bsAman()){s4.tokS=uid();s4.tokH=await hashPw(s4.tokP,s4.tokS)}
    BS.tk[s4.id]=s4.tokP;await bsPut('sesi',s4);bsKcSave();toast('Token diganti: '+s4.tokP);pnPaint();
   })();
  }
  else if(a==='an-ulang'){
   var s6=sesiById(AN.sesi);if(!s6||!bsEdit())return;
   uiConfirm('Hitung ulang nilai semua peserta sesi ini dengan kunci jawaban yang sekarang? Nilai siswa ikut berubah bila kunci sudah dikoreksi. Hasil yang soalnya sudah dihapus dilewati.',{ok:'Nilai ulang'}).then(async function(ok){
    if(!ok)return;
    try{
     toast('Menghitung ulang…');
     var t=bsAman()?await cbtMassal('nilaiUlang',s6.id,'diperbarui'):await nilaiUlangKlien(s6);
     PN.sesi=s6.id;PN.sesiLoaded='';await pnLoad();   /* muat ulang nilai dari server; salinan lama tidak boleh menimpa */
     if(bsAman()){BS.loaded=false;bsLoad()}
     toast(t.n+' dari '+t.total+' hasil diperbarui'+(t.lewat?', '+t.lewat+' dilewati (soal atau kunci tidak tersedia)':'')+(t.sisa?', '+t.sisa+' belum selesai. Tekan lagi.':''));
     render();
    }catch(er){toast('Gagal: '+((er&&er.message)||er))}
   });
  }
  else if(a==='hmore'){BS.hmax=(BS.hmax||100)+100;render()}
  else if(a==='an-ekspor')ekspor();
  else if(a==='an-hadir')cetakHadir(sesiAktif());
  else if(a==='an-kartu')kartuToken(sesiAktif());
  else if(a==='an-rekap')rekapKelas(sesiAktif());
 });
})();
