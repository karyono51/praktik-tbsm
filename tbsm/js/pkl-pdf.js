/* pkl-pdf.js: cetak PDF daftar PKL per tab (jsPDF + autoTable, kop sekolah dan footer sama dengan Lampiran 2 dan 5 di pkl.js).
   Isi tabel diambil dari pkoTabel (pkl-io.js), jadi yang tercetak = yang tampil di tab sesuai saringan, dan selaras dengan Excel.
   Tab: Tempat, Penempatan, Absensi (daftar hadir per tanggal terpilih), Jurnal (banyak siswa, satu siswa per halaman),
   Monitoring, Nilai (rekap), Kelengkapan (matriks), Rekap. Cetak per siswa (Nilai Lampiran 5, Jurnal Lampiran 2) tetap di pkl.js.
   Kepala Sekolah dan Guru/Admin boleh mencetak; siswa tidak melihat tombolnya. */
function pkpTahunAjaran(){var d=new Date(),y=d.getMonth()>=6?d.getFullYear():d.getFullYear()-1;return y+'/'+(y+1)}
function pkpCetak(tab){
 if(typeof isStaff==='function'&&!isStaff())return;
 if(tab==='jurnal')return pkpJurnal();
 if(!pkPdfSiap())return;
 var T=pkoTabel(tab),p=T.p;
 if(!p){toast('Cetak PDF belum tersedia untuk tab ini.');return}
 if(!T.n){toast('Belum ada data untuk dicetak'+(T.saring?' (cek saringan yang aktif)':'')+'.');return}
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:p.land?'landscape':'portrait'});
 pkKop(doc,pkAscii(p.judul));
 var info='Tahun ajaran '+pkpTahunAjaran()+'   |   Jumlah: '+T.n+(T.saring?'   |   Saringan: '+T.saring:'');
 doc.setFontSize(9).setTextColor(60).text(pkAscii(info),14,46);doc.setTextColor(0);
 doc.autoTable({startY:50,theme:'grid',styles:{fontSize:p.fs||8.5,cellPadding:1.8,valign:'top'},headStyles:PK_TH,
  head:[p.head.map(pkAscii)],body:p.body.map(function(r){return r.map(pkAscii)}),columnStyles:p.cols||{}});
 var y=doc.lastAutoTable.finalY+6;
 if(p.cat){doc.setFontSize(8).setTextColor(90).text(pkAscii(p.cat),14,y);doc.setTextColor(0);y+=4}
 pkTtd(doc,y+6,[p.ttd[0],''],[p.ttd[1],'']);
 pkPdfFoot(doc);
 doc.save(p.file+'.pdf');
}
/* Jurnal: semua siswa pada daftar yang tampil, satu siswa per halaman dengan format Lampiran 2 */
function pkpJurnal(){
 if(!pkPdfSiap())return;
 var L=pkoList('jurnal'),seen={},sids=[];
 L.forEach(function(j){if(!seen[j.sid]){seen[j.sid]=1;sids.push(j.sid)}});
 sids=sids.sort(function(a,b){var ua=pkUser(a),ub=pkUser(b);return String(ua?ua.nama:a).localeCompare(String(ub?ub.nama:b),'id')});
 if(!sids.length){toast('Belum ada jurnal untuk dicetak'+(pkoSaringTeks('jurnal')?' (cek saringan yang aktif)':'')+'.');return}
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 sids.forEach(function(sid,i){if(i)doc.addPage();pkPdfJurnalHal(doc,sid)});
 pkPdfFoot(doc);
 doc.save('Jurnal-PKL-'+pkoKode()+'-'+pkToday()+'.pdf');
}
