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
async function parseAkun(f){
 if(!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 var raw=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false});
 if(!raw.length)throw new Error('File kosong atau header tidak terbaca.');
 if(raw.length>1000)throw new Error('Maksimal 1000 baris per impor.');
 var ok=[],err=[],seen={};
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
  var keys=[un,email].filter(Boolean);
  if(keys.some(function(k){return seen[k]}))return bad('Duplikat di dalam file: '+(email||un));
  keys.forEach(function(k){seen[k]=1});
  var ex=S.users.find(function(u){return u.username===un||(email&&u.email===email)});
  ok.push({line:line,nama:nama,username:un,email:email,pw:r.pw||'',peran:peran,kelas:kelas,aktif:normAktif(r.aktif),id:ex?ex.id:null});
 });
 if(!ok.length&&!err.length)throw new Error('Tidak ada baris data. Pakai template dari tombol Template.');
 return {ok:ok,err:err};
}
async function applyImport(){
 var out=[],hasGen=false;
 for(var i=0;i<A.imp.ok.length;i++){
  var r=A.imp.ok[i],u=r.id&&S.users.find(function(x){return x.id===r.id}),gen='';
  if(u){
   if(u.id===S.user.id){r.peran=u.peran;r.aktif=true}
   Object.assign(u,{nama:r.nama,email:r.email||u.email,peran:r.peran,kelas:r.kelas,aktif:r.aktif});u.d=1;
   if(r.pw&&!Cloud.on)await setPw(u,r.pw);
  }else{
   u={id:uid(),nama:r.nama,username:r.username,email:r.email,peran:r.peran,kelas:r.kelas,aktif:r.aktif,dibuat:Date.now()};
   if(!Cloud.on){gen=r.pw?'':genPw();if(gen)hasGen=true;await setPw(u,r.pw||gen)}
   S.users.push(u);
  }
  out.push([r.nama,u.username,u.email,peranLabel(u.peran),u.kelas,r.id?'Diperbarui':'Baru',gen||(Cloud.on?'(daftar sendiri dengan email ini)':'(sesuai file)')]);
 }
 var n=A.imp.ok.length;A.imp=null;persist();
 if(hasGen&&needX())book([['Hasil impor',[['Nama','Username','Email','Peran','Kelas','Status','Sandi awal']].concat(out),[26,18,28,9,7,12,30]]],'Hasil_Impor_Akun');
 toast(n+' akun diproses'+(hasGen?', daftar sandi awal diunduh':''));
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
  ['Petunjuk',[['Kolom','Aturan'],['Nama','Wajib.'],['Username','Boleh kosong, otomatis dari email atau nama. Harus unik.'],['Email','Wajib jika memakai Appwrite. Harus unik.'],['Sandi','Mode lokal: minimal 6 karakter. Kosong = dibuatkan otomatis dan diunduh setelah impor. Mode Appwrite: diabaikan.'],['Peran','admin, guru, atau siswa. Kosong = siswa.'],['Kelas','Wajib untuk siswa: X, XI, atau XII.'],['Status','aktif atau nonaktif. Kosong = aktif.'],['Catatan','Akun yang usernamenya atau emailnya sudah ada akan diperbarui, bukan digandakan. Hapus dua baris contoh sebelum impor.']],[12,100]]],'Template_Impor_Akun');
}

/* ---------- Rekap: Excel ---------- */
function filt(){return visibleResults().filter(function(r){return S.filter==='ALL'||r.kelas===S.filter})}
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
 ttd(doc,doc.lastAutoTable.finalY+14,[[isStaff()?'Guru Mata Pelajaran':'Siswa',S.user.nama]]);
 foot(doc);doc.save('Rekap_Uji_Praktik_TBSM_'+new Date().toISOString().slice(0,10)+'.pdf');
}
function pdfOne(){
 if(!needP()||!V.res)return;
 var ct=$('#catatan');V.catatan=ct?ct.value.trim():'';
 var j=V.job,c=V.res.calc,doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),dd=dataFor(V.peserta),kg=V.kel&&V.items&&V.items.length>1;
 kop(doc,lkpdJudul(V.job));
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:38,fontStyle:'bold'}},body:[
  [(V.kel&&V.items&&V.items.length>1)?'Kelompok':'Siswa',(V.kel&&V.items&&V.items.length>1)?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||'-')],['Tanggal praktik',fmtTgl(dd.tgl)||'-'],kg?['NIS anggota',V.items.map(function(x){return x.nama+' ('+((V.idn&&V.idn[x.nama]&&String(V.idn[x.nama].nis||'').trim())||'-')+')'}).join(', ')]:['NIS',dd.nis||'-'],['Kendaraan',dd.kend||'-'],['No. polisi',dd.nopol||'-'],['Kelas','Kelas '+j.kelas+' (Fase '+KELAS[j.kelas].fase+')'],['Unit praktik',j.judul],['Kode SKKNI',j.skkni||'-'],['Penilai',isStaff()?S.user.nama:'Latihan mandiri'],['Waktu pengerjaan',mmss(V.sec)+' dari target '+j.menit+' menit'],['KKM',String(S.kkm)]]});
 var y=doc.lastAutoTable.finalY+6;
 doc.setFontSize(26).setFont('helvetica','bold').setTextColor(0).text(String(c.score),14,y+10);
 doc.setFontSize(12).setTextColor.apply(doc,c.kompeten?[4,120,87]:[185,28,28]);doc.text(c.kompeten?'KOMPETEN':'BELUM KOMPETEN',40,y+9);doc.setTextColor(0).setFont('helvetica','normal');
 doc.autoTable({startY:y+16,theme:'grid',styles:{fontSize:9.5},headStyles:TH,head:[['Aspek','Bobot','Terpenuhi','Skor aspek']],
  body:Object.keys(ASPEK).map(function(k){var t=c.by[k].y+c.by[k].n;return [ASPEK[k].n,ASPEK[k].w+'%',c.by[k].y+' / '+t,Math.round(ASPEK[k].w*(t?c.by[k].y/t:0)*10)/10]})});
 var fk=Object.keys(dd.f||{});
 if(fk.length)doc.autoTable({startY:doc.lastAutoTable.finalY+6,theme:'grid',styles:{fontSize:8.5},headStyles:TH,head:[['No','Butir','Hasil ukur','Spesifikasi','Keterangan']],body:fk.map(function(i){var x=dd.f[i];return [x.n,x.t,x.v?x.v+(x.u?' '+x.u:''):'-',x.s||'-',x.k||'-']}),columnStyles:{0:{cellWidth:9,halign:'center'},2:{cellWidth:24},3:{cellWidth:26}}});
 if(c.unmet.length)doc.autoTable({startY:doc.lastAutoTable.finalY+6,theme:'grid',styles:{fontSize:9},headStyles:{fillColor:[185,28,28],textColor:255},head:[['Butir belum terpenuhi','Wajib']],body:c.unmet.map(function(i){return [i.t,i.k?'Ya':'']}),columnStyles:{1:{cellWidth:16,halign:'center'}}});
 y=doc.lastAutoTable.finalY+8;
 if(V.catatan){doc.setFontSize(10).setFont('helvetica','bold').text('Catatan',14,y);doc.setFont('helvetica','normal');var t=doc.splitTextToSize(V.catatan,180);doc.text(t,14,y+5);y+=8+t.length*4.5}
 ttd(doc,y+8,[['Siswa',(V.kel&&V.items&&V.items.length>1)?V.items[0].nama+' dkk.':V.peserta],['Penilai',isStaff()?S.user.nama:'']]);
 foot(doc);doc.save((V.kel&&V.items&&V.items.length>1?'Penilaian_kelompok_':'Penilaian_'+slug(V.peserta||'siswa')+'_')+j.id+'.pdf');
}

/* ---- LKPD kosong yang bisa dicetak dan diisi tangan ---- */
function pdfLkpd(id){
 if(!needP())return;
 var j=jobById(id);if(!j)return;
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),k=KELAS[j.kelas];
 kop(doc,lkpdJudul(j));
 doc.setFont('helvetica','bold').setFontSize(11).text(j.judul,14,47);
 doc.setFont('helvetica','normal').setFontSize(9).setTextColor(90).text(j.unit+' | target '+j.menit+' menit'+(j.skkni?' | SKKNI '+j.skkni:''),14,52).setTextColor(0);
 doc.autoTable({startY:56,theme:'grid',styles:{fontSize:9.5,cellPadding:2.4,minCellHeight:8},columnStyles:{0:{cellWidth:40,fontStyle:'bold',fillColor:[242,247,244]},1:{cellWidth:51},2:{cellWidth:40,fontStyle:'bold',fillColor:[242,247,244]},3:{cellWidth:51}},
  body:[['Nama','','Kelas','Kelas '+j.kelas+' (Fase '+k.fase+')'],['NIS','','Tanggal praktik',''],['Kendaraan','','No. polisi','']]});
 var y=doc.lastAutoTable.finalY+7;
 doc.setFont('helvetica','bold').setFontSize(10).text('Petunjuk',14,y);doc.setFont('helvetica','normal').setFontSize(9.5);
 var pet=['Kenakan wearpack, sepatu kerja, dan APD sebelum mulai bekerja.','Baca buku manual atau SOP pekerjaan, lalu siapkan alat dan bahan.','Kerjakan berurutan dalam waktu '+j.menit+' menit.','Beri tanda V pada kolom Terpenuhi atau Belum. Butir bertanda Wajib harus terpenuhi agar dinyatakan kompeten.'];
 pet.forEach(function(t,i){var l=doc.splitTextToSize((i+1)+'. '+t,176);doc.text(l,16,y+5.5);y+=l.length*4.6+1.4});
 y+=5;doc.setFont('helvetica','bold').setFontSize(10).text('Alat dan bahan yang dipakai',14,y);
 doc.setDrawColor(170);for(var n=1;n<=2;n++)doc.line(14,y+n*7+1,W-14,y+n*7+1);
 var rows=[],no=0;
 Object.keys(ASPEK).forEach(function(a){
  var its=j.items.filter(function(i){return i.a===a});if(!its.length)return;
  rows.push([{content:ASPEK[a].n+' (bobot '+ASPEK[a].w+'%)',colSpan:6,styles:{fillColor:[226,242,233],fontStyle:'bold',textColor:[6,78,43]}}]);
  its.forEach(function(i){no++;rows.push([no,i.t,i.k?'Wajib':'','','',''])});
 });
 doc.autoTable({startY:y+22,theme:'grid',styles:{fontSize:9,cellPadding:2.2,minCellHeight:9,valign:'middle'},headStyles:TH,head:[['No','Butir pekerjaan','Wajib','Terpenuhi','Belum','Keterangan']],body:rows,
  columnStyles:{0:{cellWidth:9,halign:'center'},1:{cellWidth:78},2:{cellWidth:14,halign:'center',fontStyle:'bold'},3:{cellWidth:20},4:{cellWidth:16},5:{cellWidth:45}}});
 var ms=[];j.items.forEach(function(i,n){if(i.m)ms.push([n+1,i.t,'','',''])});
 if(ms.length){
  doc.setFont('helvetica','bold').setFontSize(10);var ty=doc.lastAutoTable.finalY+8;if(ty>H-50){doc.addPage();ty=22}
  doc.text('Data hasil ukur',14,ty);
  doc.autoTable({startY:ty+3,theme:'grid',styles:{fontSize:9,cellPadding:2.2,minCellHeight:10,valign:'middle'},headStyles:TH,head:[['No','Butir pengukuran','Hasil ukur','Spesifikasi','Satuan']],body:ms,columnStyles:{0:{cellWidth:9,halign:'center'},1:{cellWidth:83},2:{cellWidth:32},3:{cellWidth:36},4:{cellWidth:22}}});
 }
 var cy=doc.lastAutoTable.finalY+8;if(cy>H-70){doc.addPage();cy=22}
 doc.setFont('helvetica','bold').setFontSize(10).text('Catatan atau temuan',14,cy);
 doc.setDrawColor(170);for(var m=1;m<=3;m++)doc.line(14,cy+m*7,W-14,cy+m*7);
 ttd(doc,cy+32,[['Peserta didik'],['Guru / Asesor']]);
 foot(doc);doc.save('LKPD_Fase_'+k.fase+'_Kelas_'+j.kelas+'_'+j.id+'.pdf');
}
