/* ukk-pdf.js: PDF lembar UKK. Satu pembuat dokumen (ukkPdfDoc) dipakai untuk:
   - Unduh PDF dan Cetak saat sesi berjalan atau baru selesai (keadaan dari V, ukkPdfState).
   - Unduh PDF dari kartu hasil di Rekap, untuk siswa dan guru (keadaan dari rincian tersimpan, ukkRecordState).
   Rincian per butir disimpan ke hasil.payload (JSON) saat Simpan (ukkSimpanRincian), jadi PDF bisa dibuat ulang.
   Lembar: kop RAHASIA dan Paket, identitas, nomor peserta 13 kotak dari NIS, tabel pemeriksaan, lampiran foto
   (rasio asli, 3 kolom), dan pengesahan (NILAI; PENGUJI Internal dan Eksternal kiri-kanan). */

/* ---------- Keadaan lembar ---------- */
/* Dari sesi aktif (V). Dipakai Unduh PDF dan Cetak saat ujian atau baru selesai. */
function ukkPdfState(){
 var key=V.kel?'*':V.peserta,multi=V.kel&&V.items&&V.items.length>1;
 var ct=$('#catatan'),fin=!!V.res;
 var c=fin?V.res.calc:calc(V.job,V.kel?V.cks['*']:(V.cks[V.peserta]||{}),S.kkm,(V.hs||{})[key]||{},(V.hn||{})[key]||{});
 return {job:V.job,nama:multi?V.items.map(function(x){return x.nama}).join(', '):(V.peserta||''),nis:V.nis||'',sec:V.sec||0,
  catatan:ct?ct.value.trim():'',kkm:S.kkm,fin:fin,score:c.score,kompeten:c.kompeten,
  hs:(V.hs||{})[key]||{},hn:(V.hn||{})[key]||{},ck:V.cks[key]||{},fo:(V.fo||{})[key]||{},
  tgl:new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
}

/* Rincian yang disimpan bersama satu hasil. key = '*' untuk kelompok, nama siswa untuk per siswa. */
function ukkDetail(key,r){
 var j=V.job,ck=V.cks[key]||{},hs=(V.hs||{})[key]||{},hn=(V.hn||{})[key]||{};
 return {v:1,
  job:{id:j.id,judul:j.judul,unit:j.unit,menit:j.menit,kelas:j.kelas,form:j.form,
   items:j.items.map(function(i){return {id:i.id,no:i.no,t:i.t,std:i.std,k:!!i.k,f:!!i.f}})},
  nama:r.siswa||'',nis:V.nis||'',kel:!!V.kel,anggota:V.kel?(V.group||[]).slice():null,
  sec:V.sec||0,kkm:S.kkm,score:r.score,kompeten:!!r.kompeten,ts:r.ts,
  catatan:(V.notes||{})[key]||'',
  st:j.items.map(function(i){var v=ck[i.id];return v===1?1:(v===0?0:null)}),
  hs:hs,hn:hn};
}
/* Dipanggil dari aksi Simpan, sebelum resetV: menulis rincian ke setiap hasil baru */
function ukkSimpanRincian(n0){
 if(!V.job||!V.job.ukk)return;
 S.results.slice(n0).forEach(function(r){
  if(r.jobId!==V.job.id)return;
  r.payload=JSON.stringify(ukkDetail(V.kel?'*':r.siswa,r));
 });
}

/* Keadaan lembar dari rincian tersimpan (tanpa foto; foto diisi oleh ukkFotoRekap) */
function ukkRecordState(r){
 var d=JSON.parse(r.payload),items=d.job.items,ck={},hs={},hn={};
 items.forEach(function(i,k){
  if(d.st[k]===1)ck[i.id]=1;else if(d.st[k]===0)ck[i.id]=0;
  hs[i.id]=(d.hs||{})[i.id]||'';hn[i.id]=(d.hn||{})[i.id]||'';
 });
 return {job:d.job,nama:(d.kel&&d.anggota&&d.anggota.length>1)?d.anggota.join(', '):d.nama,nis:d.nis||'',sec:d.sec||0,
  catatan:d.catatan||'',kkm:d.kkm,fin:true,score:d.score,kompeten:d.kompeten,hs:hs,hn:hn,ck:ck,fo:{},
  tgl:new Date(d.ts||r.ts).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
}

/* Foto bukti untuk hasil: lokal, atau dari Drive lewat foto-drive bila belum ada di perangkat.
   Kembali: {itemId: dataURL}. Label foto berbentuk c<nomor butir>|nama, nomor dimulai dari 0. */
async function ukkFotoRekap(r,items){
 var map={};
 if(Cloud.on&&navigator.onLine!==false&&!(LK.remote||{})[r.id]){
  try{var d=await Cloud.list('lkpd_bukti',[Appwrite.Query.equal('lkpdId',[r.id])]);LK.remote=LK.remote||{};LK.remote[r.id]=d.map(fromDoc)}catch(e){}
 }
 var list=lkBuktiAll(r.id);
 for(var k=0;k<list.length;k++){
  var x=list[k],p=ldParse(x),it=items[p.item];if(!it)continue;
  var src=String(x.data||'');
  if(src.indexOf('drive:')===0){
   var fid=src.slice(6);src=LD.cache[fid]||'';
   if(!src){try{var rr=await ldCall({action:'get',lkpdId:r.id,fileId:fid});src=rr.data||'';LD.cache[fid]=src}catch(e){src=''}}
  }
  if(src.indexOf('data:')===0)map[it.id]=src;
 }
 return map;
}

/* ---------- Pembuat dokumen ---------- */
/* Ukuran piksel JPEG dari penanda SOF; null bila tidak terbaca */
function ukkJpegDim(d){
 try{
  var b=atob(String(d).split(',')[1]),i=2;
  while(i<b.length-9){
   if(b.charCodeAt(i)!==0xFF){i++;continue}
   var m=b.charCodeAt(i+1);
   if(m===0xFF){i++;continue}
   if(m===0xD8||m===0x01||(m>=0xD0&&m<=0xD7)){i+=2;continue}
   if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC)return {h:(b.charCodeAt(i+5)<<8)|b.charCodeAt(i+6),w:(b.charCodeAt(i+7)<<8)|b.charCodeAt(i+8)};
   i+=2+((b.charCodeAt(i+2)<<8)|b.charCodeAt(i+3));
  }
 }catch(e){}
 return null;
}
function ukkPdfDoc(st){
 var j=st.job,f=j.form||{},doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 var nama=st.nama,hs=st.hs,hn=st.hn,ck=st.ck,fo=st.fo,fin=st.fin,paket=String(f.paket||'1'),tempat=f.tempat||'Sumedang',tgl=st.tgl;

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
 var nis=String(st.nis||'').toUpperCase().replace(/\s/g,''),bx=62,bw=6.5;
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
 var ringkas=fin?('Hasil: '+(st.kompeten?'KOMPETEN':'BELUM KOMPETEN')+', skor '+st.score+' (KKM '+st.kkm+'), waktu '+mmss(st.sec)+' dari '+j.menit+' menit.'):
  ('Lembar belum dihitung. Waktu berjalan '+mmss(st.sec)+' dari '+j.menit+' menit.');
 doc.setFontSize(9).text(ringkas,14,y+3);
 if(st.catatan){var lines=doc.splitTextToSize('Catatan: '+st.catatan,W-28);doc.text(lines,14,y+9);y+=lines.length*4.5}
 y+=14;

 /* Pengesahan: NILAI kiri, PENGUJI kanan dengan Internal dan Eksternal berdampingan */
 if(y+62>H-16){doc.addPage();y=20}
 var bh=48,lx=14,lw=78,rx=W-14-86,rw=86,mid=rx+rw/2;
 doc.setFont('helvetica','bold').setFontSize(10).text('NILAI',lx+lw/2,y+6,{align:'center'});
 doc.rect(lx,y,lw,bh).line(lx,y+10,lx+lw,y+10);
 doc.setFont('helvetica','bold').setFontSize(16).text(fin?String(st.score):'-',lx+lw/2,y+24,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(9).text((fin?(st.kompeten?'Kompeten':'Belum kompeten'):'Belum selesai')+' · KKM '+st.kkm,lx+lw/2,y+34,{align:'center'});
 doc.setFontSize(9).text(tempat+', '+tgl,rx+rw,y-3,{align:'right'});
 doc.setFont('helvetica','bold').setFontSize(10).text('PENGUJI',rx+rw/2,y+6,{align:'center'});
 doc.rect(rx,y,rw,bh).line(rx,y+10,rx+rw,y+10).line(mid,y+10,mid,y+bh);
 doc.setFont('helvetica','normal').setFontSize(9);
 doc.text('Penguji Internal',rx+rw/4,y+17,{align:'center'});doc.line(rx+4,y+38,mid-4,y+38);
 doc.text('Penguji Eksternal',mid+rw/4,y+17,{align:'center'});doc.line(mid+4,y+38,rx+rw-4,y+38);
 y+=bh+8;

 /* Lampiran foto bukti: rasio asli dipertahankan (foto HP umumnya potret); 3 kolom, 6 foto per halaman */
 var ada=j.items.filter(function(i){return fo[i.id]});
 if(ada.length){
  doc.addPage();doc.setFont('helvetica','bold').setFontSize(12).text('LAMPIRAN FOTO BUKTI',W/2,16,{align:'center'});
  doc.setFont('helvetica','normal').setFontSize(9).text(j.judul+' · '+nama,W/2,22,{align:'center'});
  var cw=56,mh=70,gap=5,gx=14,top=30,rowH=mh+14;
  ada.forEach(function(i,n){
   var pos=n%6,col=pos%3,row=Math.floor(pos/3);
   if(n>0&&pos===0)doc.addPage();
   var x=gx+col*(cw+gap),y0=top+row*rowH,dm=ukkJpegDim(fo[i.id])||{w:3,h:4},sc=Math.min(cw/dm.w,mh/dm.h),dw=dm.w*sc,dh=dm.h*sc,dx=x+(cw-dw)/2;
   try{doc.addImage(fo[i.id],'JPEG',dx,y0,dw,dh)}catch(e){doc.rect(x,y0,cw,mh);doc.setFontSize(8).text('Foto tidak dapat ditampilkan',x+3,y0+8)}
   doc.setFontSize(8).text('Butir '+i.no+' · '+i.t,x,y0+mh+5);
  });
 }

 foot(doc);
 return doc;
}
function ukkNamaFile(st){return 'UKK_'+slug(st.nama||'siswa')+'_'+st.job.id+'.pdf'}

/* ---------- Aksi ---------- */
/* Unduh PDF dari layar hasil (sesi aktif) */
function pdfUkk(){var st=ukkPdfState();ukkPdfDoc(st).save(ukkNamaFile(st))}
/* Cetak (ujian dan hasil): PDF yang sama dibuka di tab baru untuk dicetak */
function ukkCetakPdf(){var st=ukkPdfState();var w=window.open(ukkPdfDoc(st).output('bloburl'),'_blank');if(!w)toast('Izinkan pop-up untuk membuka PDF cetak, atau pakai Unduh PDF')}
/* Tombol Unduh PDF di kartu hasil (Rekap dan Hasil penilaian). Hanya untuk hasil yang punya rincian. */
function ukkPdfTombol(r){
 if(!r||!r.payload)return '';
 return '<div class="row" style="margin-top:6px"><button type="button" class="btn small" data-act="ukkpdf" data-v="'+esc(r.id)+'">Unduh PDF</button></div>';
}
/* Unduh PDF dari hasil tersimpan: rincian dari payload, foto dari lkpd_bukti atau Drive */
async function ukkUnduhRekap(rid){
 var r=S.results.filter(function(x){return x.id===rid})[0];
 if(!r||!r.payload){toast('PDF tidak tersedia untuk hasil ini');return}
 toast('Menyiapkan PDF…');
 try{
  var st=ukkRecordState(r);st.fo=await ukkFotoRekap(r,st.job.items);
  ukkPdfDoc(st).save(ukkNamaFile(st));
 }catch(e){toast('PDF gagal dibuat: '+(e.message||e))}
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="ukkpdf"]');if(!b)return;
 ukkUnduhRekap(b.dataset.v);
});
