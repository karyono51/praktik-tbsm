/* ukk-prasyarat-pdf.js: cetak PDF soal dan kunci jawaban Prasyarat praktik UKK kelas X dan XI. Dimuat setelah ukk-gerbang-editor.js.
   - Dipanggil dari menu Kelola prasyarat (ukk-gerbang-editor.js): ukpCetak(job, soal, 'soal'|'kunci'). Soal yang dicetak = soal yang sedang diedit.
   - PDF soal: kop sekolah, identitas siswa (diisi tangan), petunjuk, lalu soal bernomor sama dengan kunci. PG: huruf pilihan; PG kompleks: kotak centang;
     PG kategori: tabel pernyataan dengan dua kotak (Benar, Salah). Soal tidak memuat kunci dan pembahasan.
   - PDF kunci (khusus guru): tabel No, Jenis, Level, Kunci, Pembahasan, aturan penilaian, dan KKM prasyarat.
   - Mesin PDF sama dengan lembar UKK (jsPDF dan autoTable). PDF dibuka di tab baru untuk dicetak; bila pop-up diblokir, berkas diunduh. */
var UKP={M:14,LH:4.6};
function ukpNamaFile(j,mode){return 'Prasyarat_'+(mode==='kunci'?'Kunci':'Soal')+'_'+String((j&&j.id)||'unit').replace(/[^A-Za-z0-9_-]+/g,'-')+'.pdf'}
function ukpJenis(q){var t=lkqType(q);return t==='kompleks'?'PG kompleks':t==='kategori'?'PG kategori':'Pilihan ganda'}
function ukpPetunjuk(q){
 var t=lkqType(q);
 return t==='kompleks'?'Pilih semua jawaban yang benar (lebih dari satu). Beri tanda centang pada kotak di depan pilihan yang benar.':
  t==='kategori'?'Tentukan setiap pernyataan Benar atau Salah, lalu beri tanda centang pada kotak yang sesuai.':
  'Pilih satu jawaban yang paling tepat dengan memberi tanda silang (X) pada huruf pilihan.';
}
function ukpKop(doc,judul,sub){
 var W=doc.internal.pageSize.getWidth(),M=UKP.M,x=M;
 try{
  var lg=typeof LOGO==='string'?LOGO:'';
  if(lg.indexOf('data:image/')===0){doc.addImage(lg,lg.indexOf('png')>0?'PNG':'JPEG',M,9,17,17);x=M+21}
 }catch(e){x=M}
 var s=(typeof SEK!=='undefined'&&SEK)?SEK:{nama:'',program:'',alamat:''},cx=(x+W-M)/2;
 doc.setTextColor(0).setFont('helvetica','bold').setFontSize(13).text(String(s.nama||'').toUpperCase(),cx,14,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text(String(s.program||''),cx,19,{align:'center'});
 doc.setFontSize(8.5).text(String(s.alamat||'').replace(/–/g,'-'),cx,24,{align:'center'});
 doc.setLineWidth(.6).line(M,28,W-M,28);doc.setLineWidth(.2).line(M,29.2,W-M,29.2);
 doc.setFont('helvetica','bold').setFontSize(12).text(judul,W/2,37,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text(sub,W/2,43,{align:'center'});
 return 49;
}
/* Pembuat dokumen. mode: 'soal' atau 'kunci'. */
function ukpPdfDoc(j,soal,mode){
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),M=UKP.M,LH=UKP.LH,tw=W-2*M;
 var kkm=typeof ukgKkm==='function'?ukgKkm():75,L='ABCDE';
 var tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 var sub=String(j.judul||'')+' · Kelas '+(j.kelas||'')+' · '+soal.length+' soal';
 var y;
 function perlu(h){if(y+h>H-16){doc.addPage();y=18}}
 function teks(t,x,w,size,style){
  doc.setFont('helvetica',style||'normal').setFontSize(size||10);
  var ls=doc.splitTextToSize(String(t==null?'':t),w);
  return ls;
 }
 function tulis(ls,x){ls.forEach(function(l){perlu(LH);doc.text(l,x,y);y+=LH})}

 if(mode==='kunci'){
  y=ukpKop(doc,'KUNCI JAWABAN PRASYARAT PRAKTIK UKK',sub);
  doc.setFont('helvetica','bold').setFontSize(9).text('Hanya untuk guru. Jangan dibagikan kepada siswa.',W/2,y,{align:'center'});y+=4;
  doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9,cellPadding:1.8,lineColor:60,lineWidth:.2,textColor:0,valign:'top'},
   headStyles:{fillColor:235,textColor:0,fontStyle:'bold',halign:'center',valign:'middle'},
   columnStyles:{0:{cellWidth:10,halign:'center'},1:{cellWidth:24},2:{cellWidth:22},3:{cellWidth:34}},
   head:[['No','Jenis','Level','Kunci','Pembahasan']],
   body:soal.map(function(q,i){return [String(i+1),ukpJenis(q),q.lvl||'',ukgKunciTeks(q),q.e||'']})});
  y=doc.lastAutoTable.finalY+6;
  var info='Penilaian: PG benar = 1, salah = 0. PG kompleks = (pilihan benar dipilih dikurangi pilihan salah dipilih) dibagi jumlah kunci, minimal 0. PG kategori = jumlah pernyataan tepat dibagi jumlah pernyataan. '+
   'Nilai prasyarat = jumlah poin dibagi jumlah soal x 100. Siswa lulus bila semua soal terjawab dan nilai minimal '+kkm+' (KKM prasyarat). Prasyarat tidak masuk nilai UKK.';
  tulis(teks(info,M,tw,9),M);
  y+=2;tulis(teks('Dicetak '+tgl,M,tw,8),M);
 }else{
  y=ukpKop(doc,'SOAL PRASYARAT PRAKTIK UKK',sub);
  doc.autoTable({startY:y,theme:'plain',styles:{fontSize:10,cellPadding:1,textColor:0},columnStyles:{0:{cellWidth:24},1:{cellWidth:68},2:{cellWidth:26}},body:[
   ['Nama',': ………………………………………','Kelas',': ………………'],['No. absen',': ………………………………………','Tanggal',': ………………'],
   ['Unit praktik',': '+(j.judul||''),'Nilai',': ………………']]});
  y=doc.lastAutoTable.finalY+4;
  var pet=teks('Petunjuk: kerjakan semua soal secara mandiri sebelum praktik. Nilai minimal '+kkm+' dari 100 untuk dapat memulai praktik. Soal dinilai seperti soal TKA: pilihan ganda benar bernilai 1; PG kompleks dan PG kategori dapat bernilai sebagian.',M,tw,9,'italic');
  tulis(pet,M);y+=2;doc.setLineWidth(.2).line(M,y-2,W-M,y-2);y+=2;
  var nx=M+9,bw=tw-9;
  soal.forEach(function(q,i){
   var t=lkqType(q),ql=teks(q.q,nx,bw,10.5);
   /* judul, pertanyaan, dan petunjuk jenis selalu satu halaman dengan sedikitnya pilihan pertama */
   perlu(LH*(ql.length+3)+10);
   doc.setFont('helvetica','bold').setFontSize(10.5).text((i+1)+'.',M+6,y,{align:'right'});
   doc.setFont('helvetica','normal');
   ql.forEach(function(l,k){doc.setFont('helvetica','normal').setFontSize(10.5).text(l,nx,y);y+=LH});
   doc.setFont('helvetica','italic').setFontSize(8.5).setTextColor(90).text(ukpPetunjuk(q),nx,y);doc.setTextColor(0);y+=LH+.6;
   if(t==='kategori'){
    var lab=q.lab||['Benar','Salah'],cb=nx+bw-30,cs=nx+bw-12;
    perlu(8);
    doc.setFont('helvetica','bold').setFontSize(9).text('Pernyataan',nx,y);doc.text(String(lab[0]),cb,y,{align:'center'});doc.text(String(lab[1]),cs,y,{align:'center'});y+=2;
    doc.setLineWidth(.2).line(nx,y,nx+bw,y);y+=LH-.6;
    q.rows.forEach(function(r){
     var rl=teks(r[0],nx,bw-48,10);
     perlu(LH*rl.length+2);
     doc.setFont('helvetica','normal').setFontSize(10);
     rl.forEach(function(l,k){doc.text(l,nx,y+k*LH)});
     doc.rect(cb-1.8,y-3.2,3.6,3.6);doc.rect(cs-1.8,y-3.2,3.6,3.6);
     y+=LH*rl.length;doc.setLineWidth(.1).line(nx,y-2.6,nx+bw,y-2.6);y+=.8;
    });
   }else{
    q.o.forEach(function(o,k){
     var ol=teks(o,nx+(t==='kompleks'?14:8),bw-(t==='kompleks'?14:8),10),ox=nx+(t==='kompleks'?14:8);
     perlu(LH*ol.length+1.5);
     if(t==='kompleks')doc.setLineWidth(.2).rect(nx+1,y-3.2,3.6,3.6);
     doc.setFont('helvetica','bold').setFontSize(10).text(L.charAt(k)+'.',t==='kompleks'?nx+7:nx+1,y);
     doc.setFont('helvetica','normal').setFontSize(10);
     ol.forEach(function(l,m){doc.text(l,ox,y+m*LH)});
     y+=LH*ol.length+.6;
    });
   }
   y+=3;
  });
  y+=2;tulis(teks('Dicetak '+tgl+' · '+(j.judul||''),M,tw,8),M);
 }
 if(typeof foot==='function')foot(doc);
 return doc;
}
/* Buka PDF di tab baru untuk dicetak; bila pop-up diblokir, unduh berkas. */
function ukpCetak(j,soal,mode){
 if(!j||!soal||!soal.length){toast('Belum ada soal prasyarat untuk dicetak');return}
 try{
  if(!(window.jspdf&&window.jspdf.jsPDF)){toast('Pembuat PDF belum dimuat. Periksa sinyal lalu coba lagi.');return}
  var doc=ukpPdfDoc(j,soal,mode),nama=ukpNamaFile(j,mode),w=null;
  try{w=window.open(doc.output('bloburl'),'_blank')}catch(e){w=null}
  if(!w){doc.save(nama);toast('PDF diunduh: '+nama)}
 }catch(e){toast('PDF gagal dibuat: '+(e&&e.message||e))}
}
