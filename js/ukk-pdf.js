/* ukk-pdf.js: PDF lembar UKK (tahap 3). Mengikuti lembar kerja UKK SMK:
   kop dengan kotak RAHASIA dan Paket, identitas, nomor peserta 13 kotak (dari NIS), tabel pemeriksaan,
   lampiran foto bukti (satu per butir), dan pengesahan (NILAI, Penguji Internal dan Eksternal).
   Menggantikan pdfUkk lama di export.js. Dipanggil dari pdfOne saat V.job.ukk. */
function ukkPdfDoc(){
 var ct=$('#catatan');V.catatan=ct?ct.value.trim():'';
 var fin=!!V.res;
 var j=V.job,c=fin?V.res.calc:calc(V.job,V.kel?V.cks['*']:(V.cks[V.peserta]||{}),S.kkm),f=j.form||{},doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 var multi=V.kel&&V.items&&V.items.length>1,key=V.kel?'*':V.peserta;
 var nama=multi?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||'');
 var hs=(V.hs||{})[key]||{},hn=(V.hn||{})[key]||{},ck=V.cks[key]||{},fo=(V.fo||{})[key]||{};
 var paket=String(f.paket||'1'),tempat=f.tempat||'Sumedang';
 var tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});

 /* Kop */
 doc.setLineWidth(.3).rect(14,10,44,9);
 doc.setFont('helvetica','normal').setFontSize(9).text('RAHASIA',36,16,{align:'center'});
 doc.rect(W-38,10,24,17);
 doc.setFontSize(8).text('Paket',W-26,16,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(13).text(paket,W-26,23,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(13).text('UJI KOMPETENSI KEAHLIAN',W/2,38,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text('TAHUN PELAJARAN '+(f.tahun||''),W/2,45,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(11).text('LEMBAR KERJA SISWA',W/2,57,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text('UJIAN PRAKTIK KEJURUAN',W/2,63,{align:'center'});

 /* Identitas */
 doc.autoTable({startY:70,theme:'plain',styles:{fontSize:10,cellPadding:1,textColor:0},columnStyles:{0:{cellWidth:48}},body:[
  ['Satuan Pendidikan',': '+(f.satuan||'')],['Kompetensi Keahlian',': '+(f.konsentrasi||'')],['Kode',': '+(f.kode||'')],
  ['Alokasi Waktu',': '+j.menit+' Menit'],['Bentuk Soal',': '+(f.bentuk||'')],['Tipe kendaraan',': '+(j.unit||'')],
  ['Judul tugas',': '+j.judul],['Nama Peserta',': '+(nama||'………………………………')],['Kelas',': '+j.kelas],['Tanggal',': '+tgl]]});
 var y=doc.lastAutoTable.finalY+4;
 /* Nomor peserta: 13 kotak diisi dari NIS */
 doc.setFontSize(10).text('Nomor Peserta (NIS)',14,y+4);
 var nis=String(V.nis||'').toUpperCase().replace(/\s/g,''),bx=62,bw=6.5;
 for(var k=0;k<13;k++){doc.rect(bx+k*bw,y,bw,bw);if(nis[k])doc.setFontSize(10).text(nis[k],bx+k*bw+bw/2,y+4.6,{align:'center'})}
 y+=bw+6;

 /* Tabel pemeriksaan */
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9,cellPadding:1.8,lineColor:60,lineWidth:.2,textColor:0,valign:'top'},
  headStyles:{fillColor:235,textColor:0,fontStyle:'bold',halign:'center',valign:'middle'},
  columnStyles:{0:{cellWidth:12,halign:'center'},1:{cellWidth:50},2:{cellWidth:44},3:{cellWidth:46},4:{cellWidth:30,halign:'center'}},
  head:[['No urut','Jenis pekerjaan','Standar / batas servis','Hasil pengukuran / analisis','Kesimpulan']],
  body:j.items.map(function(i){
   var hasil=(hs[i.id]||'')+(hn[i.id]?(hs[i.id]?'\n':'')+'Catatan: '+hn[i.id]:'');
   return [String(i.no),i.t+(i.k?' (Wajib)':''),i.std,hasil,ck[i.id]===1?'Sesuai':(ck[i.id]===0?'Tidak sesuai':'')];
  })});
 y=doc.lastAutoTable.finalY+5;

 /* Ringkasan dan catatan */
 var ringkas=fin?('Hasil: '+(c.kompeten?'KOMPETEN':'BELUM KOMPETEN')+', skor '+c.score+' (KKM '+S.kkm+'), waktu '+mmss(V.sec)+' dari '+j.menit+' menit.'):('Lembar belum dihitung. Waktu berjalan '+mmss(V.sec)+' dari '+j.menit+' menit.');
 doc.setFontSize(9).text(ringkas,14,y+3);
 if(V.catatan){var lines=doc.splitTextToSize('Catatan: '+V.catatan,W-28);doc.text(lines,14,y+9);y+=lines.length*4.5}
 y+=14;

 /* Pengesahan */
 if(y+62>H-16){doc.addPage();y=20}
 var bh=48,lx=14,lw=78,rx=W-14-86,rw=86;
 doc.setFont('helvetica','bold').setFontSize(10).text('NILAI',lx+lw/2,y+6,{align:'center'});
 doc.rect(lx,y,lw,bh).line(lx,y+10,lx+lw,y+10);
 doc.setFont('helvetica','bold').setFontSize(16).text(fin?String(c.score):'-',lx+lw/2,y+24,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(9).text((fin?(c.kompeten?'Kompeten':'Belum kompeten'):'Belum selesai')+' · KKM '+S.kkm,lx+lw/2,y+34,{align:'center'});
 doc.setFontSize(9).text(tempat+', '+tgl,rx+rw,y-3,{align:'right'});
 doc.setFont('helvetica','bold').setFontSize(10).text('PENGUJI',rx+rw/2,y+6,{align:'center'});
 doc.rect(rx,y,rw,bh).line(rx,y+10,rx+rw,y+10);
 doc.setFont('helvetica','normal').setFontSize(9);
 /* dua sub-kotak: Penguji Internal di atas, Penguji Eksternal di bawah; masing-masing ada ruang tanda tangan */
 doc.text('Penguji Internal',rx+3,y+16);doc.line(rx+3,y+27,rx+rw-3,y+27);
 doc.text('Penguji Eksternal',rx+3,y+31);doc.line(rx+3,y+42,rx+rw-3,y+42);
 y+=bh+8;

 /* Lampiran foto bukti */
 var ada=j.items.filter(function(i){return fo[i.id]});
 if(ada.length){
  doc.addPage();doc.setFont('helvetica','bold').setFontSize(12).text('LAMPIRAN FOTO BUKTI',W/2,16,{align:'center'});
  doc.setFont('helvetica','normal').setFontSize(9).text(j.judul+' · '+nama,W/2,22,{align:'center'});
  var cw=86,ch=60,gx=14,gy=30;
  ada.forEach(function(i,n){
   var col=n%2,row=Math.floor(n/2),x=gx+col*(cw+6),yy=gy+(row%3)*(ch+14);
   if(n>0&&row%3===0&&col===0){doc.addPage();yy=gy}
   try{doc.addImage(fo[i.id],'JPEG',x,yy,cw,ch-10)}catch(e){doc.rect(x,yy,cw,ch-10);doc.text('Foto tidak dapat ditampilkan',x+4,yy+8)}
   doc.setFontSize(9).text('Butir '+i.no+' · '+i.t,x,yy+ch-4);
  });
 }

 foot(doc);
 return doc;
}
function ukkNamaFile(){var multi=V.kel&&V.items&&V.items.length>1;var nm=multi?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||'');return 'UKK_'+slug(nm||'siswa')+'_'+V.job.id+'.pdf'}
/* Unduh PDF (hasil) */
function pdfUkk(){ukkPdfDoc().save(ukkNamaFile())}
/* Cetak (ujian dan hasil): PDF yang sama dibuka di tab baru untuk dicetak */
function ukkCetakPdf(){var w=window.open(ukkPdfDoc().output('bloburl'),'_blank');if(!w)toast('Izinkan pop-up untuk membuka PDF cetak, atau pakai Unduh PDF')}
