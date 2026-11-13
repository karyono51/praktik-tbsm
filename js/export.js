/* export.js: impor akun (xls/xlsx/csv), ekspor Excel, dan PDF */
var HM={};
(function(){var H={nama:['nama','namalengkap','name'],username:['username','user','akun','nis','nip'],email:['email','surel'],pw:['password','sandi','katasandi'],peran:['peran','role','level'],kelas:['kelas','class','tingkat'],aktif:['status','aktif']};Object.keys(H).forEach(function(c){H[c].forEach(function(a){HM[a]=c})})})();
function normKelas(v){v=String(v||'').toUpperCase().replace(/KELAS|[\s-]/g,'');var m=v.match(/^(XII|XI|X|12|11|10)/);return m?({'12':'XII','11':'XI','10':'X'}[m[1]]||m[1]):''}
function normPeran(v){v=String(v||'').toLowerCase();var o=[];if(v.indexOf('admin')>-1)o.push('admin');if(/guru|asesor|teacher/.test(v))o.push('guru');if(/siswa|murid|student/.test(v)||!o.length)o.push('siswa');return o.join(',')}
function normAktif(v){return !/^(tidak|nonaktif|non-aktif|0|false|no|n)$/i.test(String(v||'').trim())}
function needX(){if(!window.XLSX){toast('Pustaka Excel belum termuat, periksa koneksi');return false}return true}
function needP(){if(!(window.jspdf&&window.jspdf.jsPDF)){toast('Pustaka PDF belum termuat, periksa koneksi');return false}return true}
function sheet(aoa,w){var s=XLSX.utils.aoa_to_sheet(aoa);s['!cols']=w.map(function(x){return {wch:x}});return s}
function dl(wb,name){XLSX.writeFile(wb,name+'_'+new Date().toISOString().slice(0,10)+'.xlsx')}
function book(pairs,name){var wb=XLSX.utils.book_new();pairs.forEach(function(p){XLSX.utils.book_append_sheet(wb,sheet(p[1],p[2]),p[0])});dl(wb,name)}

/* ---------- Akun: impor ---------- */
function cariAkun(un,email){
 un=String(un||'').trim().toLowerCase();email=String(email||'').trim().toLowerCase();
 return S.users.find(function(u){return (un&&String(u.username||'').toLowerCase()===un)||(email&&String(u.email||'').toLowerCase()===email)})||null;
}
async function parseAkun(f){
 if(!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 var raw=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false});
 if(!raw.length)throw new Error('File kosong atau header tidak terbaca.');
 if(raw.length>1000)throw new Error('Maksimal 1000 baris per impor.');
 var ok=[],err=[],seen={},skip=0;
 raw.forEach(function(r0,i){
  var line=i+2,r={},any=false;
  Object.keys(r0).forEach(function(k){var c=HM[String(k).toLowerCase().replace(/[^a-z0-9]/g,'')],v=String(r0[k]).trim();if(v)any=true;if(c)r[c]=v});
  if(!any)return;
  var nama=r.nama||'',email=(r.email||'').toLowerCase(),un=(r.username||'').toLowerCase().replace(/\s+/g,'');
  function bad(m){err.push({line:line,msg:m})}
  if(!nama)return bad('Nama kosong');
  if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return bad('Email tidak valid: '+email);
  if(Cloud.on&&!email)return bad('Email wajib pada mode Appwrite');
  if(!un)un=email?email.split('@')[0]:slug(nama);
  var peran=normPeran(r.peran),isSw=hasRole({peran:peran},'siswa'),kelas=isSw?normKelas(r.kelas):'';
  if(isSw&&!kelas)return bad('Kelas siswa harus X, XI, atau XII');
  if(r.pw&&!Cloud.on&&r.pw.length<6)return bad('Sandi minimal 6 karakter');
  if(r.pw&&Cloud.on&&r.pw.length<8)return bad('Sandi minimal 8 karakter');
  var keys=[un,email].filter(Boolean);
  if(keys.some(function(k){return seen[k]}))return bad('Duplikat di dalam file: '+(email||un));
  keys.forEach(function(k){seen[k]=1});
  var ex=cariAkun(un,email),akt=normAktif(r.aktif);
  if(ex&&!r.pw&&String(ex.nama||'').trim()===nama&&(!email||String(ex.email||'').toLowerCase()===email)&&ex.peran===peran&&(ex.kelas||'')===kelas&&(ex.aktif!==false)===akt){skip++;return}
  ok.push({line:line,nama:nama,username:un,email:email,pw:r.pw||'',peran:peran,kelas:kelas,aktif:akt,id:ex?ex.id:null});
 });
 if(!ok.length&&!err.length&&!skip)throw new Error('Tidak ada baris data. Pakai template dari tombol Template.');
 return {ok:ok,err:err,skip:skip};
}
async function applyImport(){
 if(A.impBusy||!A.imp)return;
 A.impBusy=true;
 var imp=A.imp;A.imp=null;
 try{await applyImport2(imp)}finally{A.impBusy=false}
}
async function applyImport2(imp){
 var out=[],hasGen=false,nl=0,stopL=false;
 for(var i=0;i<imp.ok.length;i++){
  var r=imp.ok[i],u=(r.id&&S.users.find(function(x){return x.id===r.id}))||cariAkun(r.username,r.email),gen='',st='';
  r.id=u?u.id:null;
  if(u){
   if(u.id===S.user.id){r.peran=u.peran;r.aktif=true}
   Object.assign(u,{nama:r.nama,email:r.email||u.email,peran:r.peran,kelas:r.kelas,aktif:r.aktif});u.d=1;
   if(r.pw&&!Cloud.on)await setPw(u,r.pw);
  }else{
   u={id:uid(),nama:r.nama,username:r.username,email:r.email,peran:r.peran,kelas:r.kelas,aktif:r.aktif,dibuat:Date.now()};
   if(!Cloud.on){gen=r.pw?'':genPw();if(gen)hasGen=true;await setPw(u,r.pw||gen)}
   S.users.push(u);
  }
  if(Cloud.on&&r.pw){
   if(stopL)st='login dilewati (batas Appwrite)';
   else try{var lr=await Cloud.setPw(u.email,r.pw,u.nama);if(lr.created===false)st='sandi login diganti (fungsi akun-admin)';else{st='login dibuat';nl++}}catch(lx){if(/sudah punya akun login/.test((lx&&lx.message)||''))st='login sudah ada, sandi tidak diubah';else{st='login GAGAL: '+((lx&&lx.message)||lx);if(/Terlalu banyak/.test(st))stopL=true}}
  }
  out.push([r.nama,u.username,u.email,peranLabel(u.peran),u.kelas,r.id?'Diperbarui':'Baru',gen||(Cloud.on?(st||'(daftar sendiri dengan email ini)'):'(sesuai file)')]);
 }
 var n=imp.ok.length;persist();
 if(hasGen&&needX())book([['Hasil impor',[['Nama','Username','Email','Peran','Kelas','Status','Sandi awal']].concat(out),[26,18,28,9,7,12,30]]],'Hasil_Impor_Akun');
 if(Cloud.on&&out.some(function(o){return /GAGAL|dilewati/.test(o[6])})&&needX())book([['Hasil impor',[['Nama','Username','Email','Peran','Kelas','Status','Login']].concat(out),[26,18,28,9,7,12,40]]],'Hasil_Impor_Akun');
 toast(n+' akun diproses'+(imp.skip?', '+imp.skip+' yang sama dilewati':'')+(hasGen?', daftar sandi awal diunduh':'')+(nl?', '+nl+' akun login dibuat':''));
}

/* ---------- Akun: ekspor dan template ---------- */
function xlsAkun(){
 if(!needX())return;
 var L=S.users.slice().sort(function(a,b){return a.peran.localeCompare(b.peran)||a.nama.localeCompare(b.nama)});
 book([['Akun',[['No','Nama','Username','Email','Peran','Kelas','Status','Dibuat']].concat(L.map(function(u,i){return [i+1,u.nama,u.username,u.email||'',peranLabel(u.peran),u.kelas||'',u.aktif===false?'Nonaktif':'Aktif',u.dibuat?new Date(u.dibuat).toLocaleDateString('id-ID'):'']})),[5,28,20,30,9,7,10,12]]],'Akun_TBSM');
}
function tplAkun(){
 if(!needX())return;
 book([['Akun',[['Nama','Username','Email','Sandi','Peran','Kelas','Status'],['Contoh Siswa','contoh.siswa','contoh.siswa@sekolah.sch.id','','siswa','X','aktif'],['Contoh Guru','contoh.guru','contoh.guru@sekolah.sch.id','','guru','','aktif']],[26,18,30,14,9,8,9]],
  ['Petunjuk',[['Kolom','Aturan'],['Nama','Wajib.'],['Username','Boleh kosong, otomatis dari email atau nama. Harus unik.'],['Email','Wajib jika memakai Appwrite. Harus unik.'],['Sandi','Mode lokal: minimal 6 karakter. Kosong = dibuatkan otomatis dan diunduh setelah impor. Mode Appwrite: dipakai membuat akun login baru (minimal 8 karakter); email yang sudah punya login tidak diubah.'],['Peran','admin, guru, atau siswa. Kosong = siswa.'],['Kelas','Wajib untuk siswa: X, XI, atau XII.'],['Status','aktif atau nonaktif. Kosong = aktif.'],['Catatan','Akun yang usernamenya atau emailnya sudah ada akan diperbarui, bukan digandakan. Hapus dua baris contoh sebelum impor.']],[12,100]]],'Template_Impor_Akun');
}

/* ---------- Rekap: Excel ---------- */
function filt(){return visibleResults().filter(function(r){return S.filter==='ALL'||r.kelas===S.filter})}
/* Observasi praktik siswa di Rekap nilai (hanya Admin dan Guru; mengikuti filter kelas) */
function obsRekapList(){return (can('observasi')&&typeof obsVisible==='function')?obsVisible('siswa').filter(function(r){return S.filter==='ALL'||r.kelas===S.filter}):[]}
function obsRekapHtml(){
 var L=obsRekapList();if(!L.length)return '';
 var avg=Math.round(L.reduce(function(t,r){return t+(+r.skor||0)},0)/L.length);
 return '<h3>Observasi praktik siswa</h3><div class="stats"><div class="card"><span class="label">Observasi</span><b class="mono">'+L.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div></div>'+
  L.map(function(r){return '<div class="card" style="gap:6px"><div class="row sb"><b>'+esc(r.guru)+'</b><span class="pill '+obsKatCls(r.kategori)+'">'+esc(r.kategori)+'</span></div><div class="note">'+esc(r.mapel)+'</div><div class="row sb"><span class="note">Kelas '+esc(r.kelas)+' · '+esc(obsTgl(r.tanggal))+(r.pengamat?' · '+esc(r.pengamat):'')+'</span><span class="mono" style="font-weight:600">'+(+r.skor||0)+'</span></div></div>'}).join('')
}
function obsRekapUrut(){return obsRekapList().slice().sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts})}
function agg(list){var n=list.length;return [n,n?Math.round(list.reduce(function(s,r){return s+r.score},0)/n):0,n?Math.round(100*list.filter(function(r){return r.kompeten}).length/n)/100:0]}
function xlsRekap(){
 if(!needX())return;
 var L=filt().sort(function(a,b){return a.ts-b.ts});
 var wb=XLSX.utils.book_new();
 var rows=[['No','Tanggal','Kelas','Siswa','Unit praktik','SKKNI','Jenis','Skor','Status','KKM','Penilai','Durasi (menit)','Catatan']].concat(L.map(function(r,i){var j=jobById(r.jobId)||{};return [i+1,new Date(r.ts).toLocaleDateString('id-ID'),r.kelas,r.siswa||'',j.judul||r.jobId,j.skkni||'',r.tipe,r.score,r.kompeten?'Kompeten':'Belum kompeten',S.kkm,r.penilai||r.oleh||'',r.detik?Math.round(r.detik/6)/10:'',r.catatan||'']}));
 XLSX.utils.book_append_sheet(wb,sheet(rows,[5,12,8,26,44,18,11,7,16,6,20,13,40]),'Rekap');
 var k=[['Kelas','Jumlah data','Rata-rata','Persen kompeten']].concat(['X','XI','XII'].map(function(c){return [c].concat(agg(L.filter(function(r){return r.kelas===c})))}));
 var ks=sheet(k,[10,13,11,16]);for(var i=2;i<=4;i++)if(ks['D'+i])ks['D'+i].z='0%';
 XLSX.utils.book_append_sheet(wb,ks,'Per kelas');
 var by={};L.forEach(function(r){var key=(r.siswa||'Tanpa nama')+'|'+r.kelas;(by[key]=by[key]||[]).push(r)});
 var sw=[['Siswa','Kelas','Jumlah data','Rata-rata','Persen kompeten']].concat(Object.keys(by).sort().map(function(key){var p=key.split('|');return [p[0],p[1]].concat(agg(by[key]))}));
 var ss=sheet(sw,[28,8,13,11,16]);for(var m=2;m<=sw.length;m++)if(ss['E'+m])ss['E'+m].z='0%';
 XLSX.utils.book_append_sheet(wb,ss,'Per siswa');
 var O=obsRekapUrut();
 if(O.length){var orows=[['No','Tanggal','Kelas','Siswa','Unit praktik','Jam ke-','Kompetensi/jobsheet','Nilai','Kategori','Pengamat']].concat(O.map(function(r,i){var p=obsPay(r);return [i+1,obsTgl(r.tanggal),r.kelas,r.guru,r.mapel,p.jam||'',p.materi||'',+r.skor||0,r.kategori,r.pengamat||'']}));XLSX.utils.book_append_sheet(wb,sheet(orows,[5,18,8,26,40,8,34,7,14,22]),'Observasi siswa')}
 dl(wb,'Rekap_Uji_Praktik_TBSM');
}

/* ---------- PDF ---------- */
function kop(doc,judul){
 var W=doc.internal.pageSize.getWidth();
 try{doc.addImage(LOGO,'JPEG',14,10,18,18)}catch(e){}
 doc.setFont('helvetica','bold').setFontSize(13).text('SMKS MEDINA BANDUNG',36,16);
 doc.setFont('helvetica','normal').setFontSize(8.5).text('Jl. K.H. Ahmad Dahlan No. 13-15, Kel. Burangrang, Kec. Lengkong, Kota Bandung 40262',36,21);
 doc.setDrawColor(200).line(14,31,W-14,31);
 doc.setFont('helvetica','bold').setFontSize(12).text(judul,14,40);
 doc.setFont('helvetica','normal');
}
function foot(doc){
 var n=doc.getNumberOfPages(),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 for(var i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8).setTextColor(120).text('KBM Praktik TBSM - dicetak '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),14,H-8).text('Halaman '+i+'/'+n,W-14,H-8,{align:'right'})}
}
function ttd(doc,y,labels){
 var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 if(y>H-50){doc.addPage();y=24}
 doc.setFontSize(10).setTextColor(0);
 labels.forEach(function(l,i){var x=labels.length===1?W-50:(i?W-50:50);doc.text(i===labels.length-1?'Bandung, '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'',x,y,{align:'center'});doc.text(l[0],x,y+5,{align:'center'});doc.text(l[1]||'(................................)',x,y+28,{align:'center'})});
}
var TH={fillColor:[11,107,58],textColor:255,fontStyle:'bold'};
function pdfRekap(){
 if(!needP())return;
 var L=filt().sort(function(a,b){return a.ts-b.ts}),a=agg(L);
 var doc=new window.jspdf.jsPDF({orientation:'l',unit:'mm',format:'a4'});
 kop(doc,'Rekap Nilai KBM Praktik TBSM'+(S.filter==='ALL'?'':' - Kelas '+S.filter));
 doc.setFontSize(9.5).text('Data: '+a[0]+'   Rata-rata: '+a[1]+'   Kompeten: '+Math.round(a[2]*100)+'%   KKM: '+S.kkm,14,46);
 doc.autoTable({startY:50,theme:'grid',styles:{fontSize:8.5,cellPadding:2},headStyles:TH,
  head:[['No','Tanggal','Kelas','Siswa','Unit praktik','Jenis','Skor','Status']],
  body:L.map(function(r,i){var j=jobById(r.jobId);return [i+1,new Date(r.ts).toLocaleDateString('id-ID'),r.kelas,r.siswa||'-',j?j.judul:r.jobId,r.tipe,r.score,r.kompeten?'Kompeten':'Belum kompeten']}),
  columnStyles:{0:{cellWidth:10},1:{cellWidth:24},2:{cellWidth:14},6:{cellWidth:14,halign:'center'},7:{cellWidth:32}},
  didParseCell:function(d){if(d.section==='body'&&d.column.index===7)d.cell.styles.textColor=d.cell.raw==='Kompeten'?[4,120,87]:[185,28,28]}});
 var O=obsRekapUrut();
 if(O.length){var y0=doc.lastAutoTable.finalY+10;if(y0>doc.internal.pageSize.getHeight()-40){doc.addPage();y0=20}
  doc.setFont('helvetica','bold').setFontSize(11).text('Observasi Praktik Siswa ('+O.length+' observasi, rata-rata '+Math.round(O.reduce(function(t,r){return t+(+r.skor||0)},0)/O.length)+')',14,y0);doc.setFont('helvetica','normal');
  doc.autoTable({startY:y0+3,theme:'grid',styles:{fontSize:8.5,cellPadding:2},headStyles:TH,head:[['No','Tanggal','Kelas','Siswa','Unit praktik','Nilai','Kategori']],
   body:O.map(function(r,i){return [i+1,obsTgl(r.tanggal),r.kelas,r.guru,r.mapel,+r.skor||0,r.kategori]}),columnStyles:{0:{cellWidth:10},1:{cellWidth:30},2:{cellWidth:14},5:{cellWidth:14,halign:'center'},6:{cellWidth:28}}})}
 ttd(doc,doc.lastAutoTable.finalY+14,[[isStaff()?'Guru Mata Pelajaran':'Siswa',S.user.nama]]);
 foot(doc);doc.save('Rekap_Uji_Praktik_TBSM_'+new Date().toISOString().slice(0,10)+'.pdf');
}
function pdfOne(){
 if(!needP()||!V.res)return;
 if(V.job&&V.job.ukk)return pdfUkk();
 var ct=$('#catatan');V.catatan=ct?ct.value.trim():'';
 var j=V.job,c=V.res.calc,doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 kop(doc,'Lembar Penilaian KBM Praktik');
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:38,fontStyle:'bold'}},body:[
  [(V.kel&&V.items&&V.items.length>1)?'Kelompok':'Siswa',(V.kel&&V.items&&V.items.length>1)?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||'-')],['Kelas','Kelas '+j.kelas+' (Fase '+KELAS[j.kelas].fase+')'],['Unit praktik',j.judul],['Kode SKKNI',j.skkni||'-'],['Penilai',isStaff()?S.user.nama:'Latihan mandiri'],['Waktu pengerjaan',mmss(V.sec)+' dari target '+j.menit+' menit'],['KKM',String(S.kkm)]]});
 var y=doc.lastAutoTable.finalY+6;
 doc.setFontSize(26).setFont('helvetica','bold').setTextColor(0).text(String(c.score),14,y+10);
 doc.setFontSize(12).setTextColor.apply(doc,c.kompeten?[4,120,87]:[185,28,28]);doc.text(c.kompeten?'KOMPETEN':'BELUM KOMPETEN',40,y+9);doc.setTextColor(0).setFont('helvetica','normal');
 doc.autoTable({startY:y+16,theme:'grid',styles:{fontSize:9.5},headStyles:TH,head:[['Aspek','Bobot','Terpenuhi','Skor aspek']],
  body:Object.keys(ASPEK).filter(function(k){return c.by[k].y+c.by[k].n>0}).map(function(k){var t=c.by[k].y+c.by[k].n;return [ASPEK[k].n,ASPEK[k].w+'%',c.by[k].y+' / '+t,Math.round(ASPEK[k].w*(t?c.by[k].y/t:0)*10)/10]})});
 if(c.unmet.length)doc.autoTable({startY:doc.lastAutoTable.finalY+6,theme:'grid',styles:{fontSize:9},headStyles:{fillColor:[185,28,28],textColor:255},head:[['Butir belum terpenuhi','Wajib']],body:c.unmet.map(function(i){return [i.t,i.k?'Ya':'']}),columnStyles:{1:{cellWidth:16,halign:'center'}}});
 y=doc.lastAutoTable.finalY+8;
 if(V.catatan){doc.setFontSize(10).setFont('helvetica','bold').text('Catatan',14,y);doc.setFont('helvetica','normal');var t=doc.splitTextToSize(V.catatan,180);doc.text(t,14,y+5);y+=8+t.length*4.5}
 ttd(doc,y+8,[['Siswa',(V.kel&&V.items&&V.items.length>1)?V.items[0].nama+' dkk.':V.peserta],['Penilai',isStaff()?S.user.nama:'']]);
 foot(doc);doc.save((V.kel&&V.items&&V.items.length>1?'Penilaian_kelompok_':'Penilaian_'+slug(V.peserta||'siswa')+'_')+j.id+'.pdf');
}


/* ---------- Akun: cari dan hapus akun ganda (hasil impor berulang) ---------- */
function kelompokGanda(){
 var U=S.users,p=U.map(function(_,i){return i}),m={};
 function f(i){while(p[i]!==i){p[i]=p[p[i]];i=p[i]}return i}
 U.forEach(function(u,i){
  var em=String(u.email||'').trim().toLowerCase(),us=String(u.username||'').trim().toLowerCase(),ks=[];
  if(em)ks.push('e:'+em);if(us)ks.push('u:'+us);
  if(hasRole(u,'siswa')&&u.nama)ks.push('n:'+slug(u.nama)+'|'+(u.kelas||''));
  ks.forEach(function(k){if(k in m){var a=f(m[k]),b=f(i);if(a!==b)p[b]=a}else m[k]=i});
 });
 var g={};U.forEach(function(u,i){var r=f(i);(g[r]=g[r]||[]).push(u)});
 var pakai={};
 [S.results||[],S.lkpd||[],S.lkpdBukti||[]].forEach(function(L){L.forEach(function(o){if(o.sid)pakai[o.sid]=(pakai[o.sid]||0)+1})});
 return Object.keys(g).map(function(k){return g[k]}).filter(function(a){return a.length>1}).map(function(a){
  a.sort(function(x,y){
   function sk(u){return (u.id===S.user.id?1e6:0)+(pakai[u.id]||0)*10+(u.r?5:0)}
   return sk(y)-sk(x)||(x.dibuat||0)-(y.dibuat||0)});
  return {simpan:a[0],hapus:a.slice(1)};
 });
}
async function hapusGanda(){
 var G=kelompokGanda();if(!G.length){toast('Tidak ada akun ganda');return}
 var n=G.reduce(function(t,g){return t+g.hapus.length},0);
 var daftar=G.slice(0,8).map(function(g){return '• '+g.simpan.nama+' ('+(g.hapus.length+1)+' akun)'}).join('\n')+(G.length>8?'\n…dan '+(G.length-8)+' lainnya':'');
 if(!(await uiConfirm('Hapus '+n+' akun ganda?\n'+G.length+' akun punya salinan. Satu akun terbaik dipertahankan, data nilai dipindahkan ke akun itu.\n\n'+daftar,{ok:'Hapus '+n,danger:true})))return;
 var gagal=0,ok=0;
 for(var gi=0;gi<G.length;gi++){
  var g=G[gi],k=g.simpan,ids={};
  g.hapus.forEach(function(x){ids[x.id]=1});
  g.hapus.forEach(function(x){
   var rl=roleList(k);roleList(x).forEach(function(r){if(rl.indexOf(r)<0)rl.push(r)});
   k.peran=URUT.filter(function(r){return rl.indexOf(r)>-1}).join(',');
   if(!k.email&&x.email)k.email=x.email;
   if(!k.kelas&&x.kelas)k.kelas=x.kelas;
   if(x.aktif!==false)k.aktif=true;
  });
  k.d=1;
  [[S.results,['sid']],[S.lkpd,['sid']],[S.lkpdBukti,['sid']],[S.observasi,['guruId','pengamatId']]].forEach(function(pr){
   (pr[0]||[]).forEach(function(o){pr[1].forEach(function(f){if(o[f]&&ids[o[f]]){o[f]=k.id;o.d=1}})});
  });
  for(var hi=0;hi<g.hapus.length;hi++){
   var x=g.hapus[hi],done=true;
   if(x.r)done=await Cloud.remove('akun',x.id);
   if(done){S.users=S.users.filter(function(u){return u.id!==x.id});ok++}else gagal++;
  }
 }
 persist();
 toast(ok+' akun ganda dihapus'+(gagal?', '+gagal+' gagal di server':''));
}

/* PDF lembar UKK: tata letak sama dengan form HTML (identitas, tabel 5 kolom, catatan, tanda tangan penguji) */
function pdfUkk(){
 var ct=$('#catatan');V.catatan=ct?ct.value.trim():'';
 var j=V.job,c=V.res.calc,f=j.form,doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth();
 var multi=V.kel&&V.items&&V.items.length>1,key=V.kel?'*':V.peserta;
 var nama=multi?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||'');
 var hs=(V.hs||{})[key]||{},ck=V.cks[key]||{},penguji=isStaff()?S.user.nama:'';
 doc.setFont('helvetica','bold').setFontSize(13).text('UJI KOMPETENSI KEAHLIAN',W/2,16,{align:'center'});
 doc.text('Tahun Pelajaran '+f.tahun,W/2,22,{align:'center'});doc.setFont('helvetica','normal');
 var tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 doc.autoTable({startY:27,theme:'plain',styles:{fontSize:10,cellPadding:1,textColor:0},columnStyles:{0:{cellWidth:46}},body:[
  ['Satuan Pendidikan',': '+f.satuan],['Konsentrasi Keahlian',': '+f.konsentrasi],['Kode',': '+f.kode],['Alokasi Waktu',': '+j.menit+' Menit'],['Bentuk Soal',': '+f.bentuk],
  ['Judul Tugas',': '+j.judul+' ('+j.unit+')'],['Nama Siswa',': '+(nama||'………………………………')],['NIS / Kelas',': '+(V.nis||'………………')+' / '+j.kelas],['Tanggal',': '+tgl],['Penguji',': '+(penguji||'………………………………')]]});
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8,lineColor:60,lineWidth:.2,textColor:0,valign:'top'},
  headStyles:{fillColor:255,textColor:0,fontStyle:'bold',halign:'center'},
  columnStyles:{0:{cellWidth:10,halign:'center'},1:{cellWidth:48},2:{cellWidth:56},3:{cellWidth:38},4:{cellWidth:30}},
  head:[['No','Nama item pekerjaan','Standar/Spesifikasi','Hasil Pemeriksaan','Kesimpulan']],
  body:j.items.map(function(i){return [i.no,i.t,i.std,hs[i.id]||'',ck[i.id]===1?'Sesuai':(ck[i.id]===0?'Tidak sesuai':'')]})});
 var ringkas='Hasil: '+(c.kompeten?'KOMPETEN':'BELUM KOMPETEN')+', skor '+c.score+' (KKM '+S.kkm+'), waktu '+mmss(V.sec)+' dari '+j.menit+' menit';
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9.5,cellPadding:2,lineColor:60,lineWidth:.2,textColor:0,minCellHeight:30},
  columnStyles:{0:{cellWidth:118},1:{cellWidth:64,halign:'center'}},
  body:[[{content:'Catatan:\n'+(V.catatan?V.catatan+'\n':'')+ringkas},{content:'Penguji\n\n\n\n('+(penguji||'………………………')+')'}]]});
 foot(doc);doc.save('UKK_'+slug(nama||'siswa')+'_'+j.id+'.pdf');
}
