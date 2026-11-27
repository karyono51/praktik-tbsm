/* pkl-io.js: ekspor Excel di semua tab daftar PKL, serta template dan impor Excel untuk Penempatan, Monitoring, Nilai, dan Kelengkapan.
   (Tempat PKL ada di pkl-xls.js. Cetak PDF ada di pkl-pdf.js, memakai tabel dari pkoTabel di berkas ini.)
   Ekspor mengikuti saringan yang sedang aktif di tab (yang tampil = yang diekspor). Absensi diekspor per tanggal yang dipilih.
   Absensi dan Jurnal sengaja tanpa impor: keduanya dibuat siswa dengan selfie, jam perangkat, dan GPS sebagai bukti.
   Aturan impor (semua jenis):
   - Judul kolom dikenali tanpa memandang huruf besar/kecil dan tanda baca, jadi berkas hasil ekspor bisa diedit lalu diimpor kembali.
   - Siswa dikenali dari NIS/Username (angka dengan atau tanpa titik dan nol di depan) atau, bila kosong, dari nama (plus Kelas bila kembar).
   - Tempat dikenali dari Nama + Kota; guru dari nama akun guru. Yang tidak dikenali ditolak per baris, baris lain tetap jalan.
   - Sel kosong tidak menghapus isi yang sudah ada. Baris yang tidak berubah dilewati. Baris bertanda (CONTOH) dilewati.
   - Pratinjau (baru, diperbarui, tidak berubah, ditolak) tampil dulu; data tersimpan setelah Terapkan, lewat pkPut seperti formulir.
   Bergantung pada pkl.js, pkl-xls.js (pkxHdr, pkxNorm, pkxKosong, pkxTeks, pkxAngka, pkxTgl), dan export.js (needX). */
var PKO={busy:false,spec:{}};
var PKO_PENDEK=['Pembekalan','Naskah PKS','Jaminan K3','Persetujuan ortu','Program TP-ATP','Penyerahan','Orientasi','Laporan','Presentasi','Asesmen instruktur','Sertifikat'];
var PKO_NAMA={tempat:'tempat-pkl',tugas:'penempatan-pkl',absen:'absensi-pkl',jurnal:'jurnal-pkl',kunjungan:'monitoring-pkl',nilai:'nilai-pkl',cek:'kelengkapan-pkl',rekap:'rekap-pkl'};
var PKO_AKSI={tugas:['xls','tpl','imp','pdf'],absen:['xls','pdf'],jurnal:['xls','pdf'],kunjungan:['xls','tpl','imp','pdf'],nilai:['xls','tpl','imp','pdf'],cek:['xls','tpl','imp','pdf'],rekap:['xls','pdf'],tempat:['pdf']};
var PKO_PDFLABEL={tugas:'Cetak PDF',absen:'Cetak PDF harian',jurnal:'PDF jurnal',kunjungan:'Cetak PDF',nilai:'PDF rekap nilai',cek:'Cetak PDF',rekap:'Cetak PDF',tempat:'Cetak PDF'};

/* ---------- Pembantu umum ---------- */
function pkoNis(u){return (typeof akNis==='function'&&akNis(u))||(u&&u.username)||''}
/* NIS dibandingkan sebagai angka tanpa titik/spasi dan tanpa nol di depan (Excel sering menghapus nol di depan); selain angka dibandingkan sebagai teks */
function pkoNo(s){var t=String(s==null?'':s).trim(),d=t.replace(/[.\s-]/g,'');return /^\d+$/.test(d)?d.replace(/^0+/,''):pkxNorm(t)}
function pkoGuruNama(g){var u=g.guruId&&pkUser(g.guruId);return u?u.nama:(g.guruNama||'')}
function pkoKota(tid){var t=pkById('tempat',tid);return t&&t.kota||''}
function pkoUrutTN(a,b){return pkTempatNama(a.tempatId).localeCompare(pkTempatNama(b.tempatId),'id')||pkNm(a).localeCompare(pkNm(b),'id')}
function pkoAsc(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||(a.ts||0)-(b.ts||0)}
function pkoStatusTeks(s){return {aktif:'Aktif',selesai:'Selesai',dibatalkan:'Dibatalkan'}[s||'aktif']||String(s)}
function pkoPeserta(u){return typeof pkPeserta==='function'?pkPeserta(u):true}
function pkoKepsek(){return typeof actRole==='function'&&actRole()==='kepsek'}
function pkoTulis(sheets,nama){
 var bk=XLSX.utils.book_new();
 sheets.forEach(function(s){var ws=XLSX.utils.aoa_to_sheet(s[1]);ws['!cols']=(s[2]||[]).map(function(w){return {wch:w}});XLSX.utils.book_append_sheet(bk,ws,s[0])});
 XLSX.writeFile(bk,nama);
}
function pkoKode(){return (typeof schKode==='function'&&schKode()||'semua').toLowerCase()}

/* ---------- Daftar yang tampil (mengikuti saringan tab) ---------- */
function pkoAbsenHari(){
 var d=PK.ft||pkToday(),F=PK.flt.absen||{},A=pkList('absen').filter(function(x){return x.tanggal===d});
 return pkList('tugas').filter(function(g){return g.status==='aktif'&&(!F.tempat||g.tempatId===F.tempat)&&(!F.kelas||pkKl(g)===F.kelas)&&(!F.siswa||g.sid===F.siswa)}).sort(pkoUrutTN).map(function(g){
  var mine=A.filter(function(x){return x.sid===g.sid}),pick=function(tp){return mine.filter(function(x){return x.tipe===tp})[0]||null},m=pick('masuk'),p=pick('pulang'),iz=pick('izin'),sk=pick('sakit');
  var st=iz?'Izin':sk?'Sakit':m?'Hadir':'Belum absen',lok=m?(m.lokasi==='ya'?'Di lokasi':m.lokasi==='tidak'?'Di luar lokasi'+(m.jarak!=null?' ±'+m.jarak+' m':''):'Tidak diketahui'):'';
  return {g:g,d:d,masuk:m?m.jam||'':'',pulang:p?p.jam||'':'',status:st,lokasi:lok,cat:[m,iz,sk].filter(Boolean).map(function(x){return x.cat||''}).filter(Boolean).join('; ')};
 });
}
function pkoList(tab){
 if(tab==='tempat')return pkSaring('tempat',pkList('tempat').sort(pkUrutNama)).list;
 if(tab==='tugas')return pkSaring('tugas',pkList('tugas').sort(pkoUrutTN)).list;
 if(tab==='jurnal')return pkSaring('jurnal',pkList('jurnal').sort(pkoAsc)).list;
 if(tab==='kunjungan')return pkSaring('kunjungan',pkList('kunjungan').sort(pkoAsc)).list;
 if(tab==='nilai')return pkSaring('nilai',pkList('nilai').sort(pkUrutNama)).list;
 if(tab==='cek')return pkSaring('cek',pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(function(a,b){return pkNm(a).localeCompare(pkNm(b),'id')})).list;
 if(tab==='rekap')return pkSaring('rekap',pkRekapBaris(),function(x){return x.g}).list;
 if(tab==='absen')return pkoAbsenHari();
 return [];
}
/* Teks saringan aktif untuk keterangan di PDF dan Excel */
function pkoSaringTeks(tab){
 var F=PK.flt[tab]||{},out=[];
 (PK_SARING[tab]||[]).forEach(function(a){
  var v=F[a];if(!v)return;
  var l=PK_TETAP[a]?PK_TETAP[a][v]:a==='tempat'?pkTempatNama(v):(a==='guru'||a==='siswa')?((pkUser(v)||{}).nama||v):v;
  out.push((PK_SL[a]?PK_SL[a][0]:a)+': '+l);
 });
 return out.join('; ');
}

/* ---------- Tabel per tab: satu sumber untuk Excel (x) dan PDF (p) ----------
   x = lembar Excel [[nama,aoa,lebar]]; p = tabel PDF {judul,file,land,head,body,cols,ttd}; n = jumlah baris data. */
function pkoCekItem(sid,key){var c=pkCekOf(sid);return !!(c&&c.items&&c.items[key])}
function pkoTabel(tab){
 var L=pkoList(tab),tp=pkTP(),kd=pkoKode(),tg=pkToday(),T={tab:tab,n:L.length,saring:pkoSaringTeks(tab),x:[],p:null};
 var S=function(nm,head,body,w){T.x.push([nm,[head].concat(body),w])};
 if(tab==='tempat'){
  T.p={judul:'DAFTAR TEMPAT PRAKTIK KERJA LAPANGAN',file:'Tempat-PKL-'+kd+'-'+tg,land:true,head:['No','Nama dunia kerja','Bidang','Alamat','Instruktur / kontak','Kuota','Perjanjian (PKS)','Monitoring terakhir'],
   body:L.map(function(t,i){var k=pkKunjunganAkhir(t.id),ps=pkPksStatus(t);return [i+1,t.nama,t.bidang||'-',[t.alamat,t.kota].filter(Boolean).join(', ')||'-',(t.instruktur||'-')+(t.instrTelp?' ('+t.instrTelp+')':''),pkTerisi(t.id,'')+(t.kuota?'/'+t.kuota:''),ps[1]+(t.pksSelesai?' s.d. '+pkTgl(t.pksSelesai):''),k?pkTgl(k.tanggal):'Belum pernah']}),
   cols:{0:{cellWidth:9,halign:'center'},5:{cellWidth:16,halign:'center'}},ttd:['Koordinator PKL','Kepala Sekolah']};
 }else if(tab==='tugas'){
  S('Penempatan',['Nama siswa','NIS/Username','Kelas','Tempat PKL','Kota tempat','Guru pembimbing','Instruktur','Mulai','Selesai','Status'],L.map(function(g){var u=pkUser(g.sid);return [pkNm(g),u?pkoNis(u):'',pkKl(g),pkTempatNama(g.tempatId),pkoKota(g.tempatId),pkoGuruNama(g),g.instruktur||'',g.mulai||'',g.selesai||'',pkoStatusTeks(g.status)]}),[28,16,10,30,16,24,22,12,12,12]);
  T.p={judul:'DAFTAR PENEMPATAN SISWA PRAKTIK KERJA LAPANGAN',file:'Penempatan-PKL-'+kd+'-'+tg,land:true,head:['No','Siswa','Kelas','Tempat PKL','Guru pembimbing','Instruktur','Periode','Status'],
   body:L.map(function(g,i){return [i+1,pkNm(g),pkKl(g),pkTempatNama(g.tempatId),pkoGuruNama(g)||'-',g.instruktur||'-',pkTgl(g.mulai)+' s.d. '+pkTgl(g.selesai),pkoStatusTeks(g.status)]}),cols:{0:{cellWidth:9,halign:'center'},2:{cellWidth:16}},ttd:['Koordinator PKL','Kepala Sekolah']};
 }else if(tab==='absen'){
  var d=PK.ft||tg;
  S('Absensi '+d,['Tanggal','Siswa','Kelas','Tempat PKL','Masuk','Pulang','Status','Lokasi masuk','Keterangan'],L.map(function(r){return [r.d,pkNm(r.g),pkKl(r.g),pkTempatNama(r.g.tempatId),r.masuk,r.pulang,r.status,r.lokasi,r.cat]}),[12,28,10,30,8,8,12,22,36]);
  var raw=pkSaring('absen',pkList('absen').filter(function(x){return x.tanggal===d}).sort(function(a,b){return String(a.jam).localeCompare(String(b.jam))})).list;
  S('Catatan absen',['Tanggal','Jam','Siswa','Kelas','Jenis','Tempat PKL','Lokasi','Jarak (m)','Selfie','Catatan'],raw.map(function(a){return [a.tanggal,a.jam||'',a.nama||pkNm(a),a.kelas||pkKl(a),PK_TIPE[a.tipe]||a.tipe,pkTempatNama(a.tempatId),a.lokasi==='ya'?'Di lokasi':a.lokasi==='tidak'?'Di luar lokasi':'Tidak diketahui',a.jarak==null?'':a.jarak,(a.foto||a.fotoAda)?'Ada':'Tidak',a.cat||'']}),[12,8,28,10,10,30,16,10,8,36]);
  T.p={judul:'DAFTAR HADIR PESERTA DIDIK PKL - '+pkTglHari(d).toUpperCase(),file:'Daftar-Hadir-PKL-'+kd+'-'+d,land:true,head:['No','Siswa','Kelas','Tempat PKL','Masuk','Pulang','Status','Lokasi masuk','Keterangan'],
   body:L.map(function(r,i){return [i+1,pkNm(r.g),pkKl(r.g),pkTempatNama(r.g.tempatId),r.masuk||'-',r.pulang||'-',r.status,r.lokasi||'-',r.cat||'']}),cols:{0:{cellWidth:9,halign:'center'},4:{cellWidth:14,halign:'center'},5:{cellWidth:14,halign:'center'}},ttd:['Guru Pembimbing','Koordinator PKL']};
  T.file=['absensi-pkl-'+kd+'-'+d];
 }else if(tab==='jurnal'){
  S('Jurnal',['Tanggal','Siswa','Kelas','Tempat PKL','Unit kerja','Uraian kegiatan','Catatan','Diketahui oleh','Diberi catatan oleh'],L.map(function(j){var t=pkTugasSiswa(j.sid);return [j.tanggal,j.nama||pkNm(j),j.kelas||pkKl(j),pkTempatNama(j.tempatId||(t&&t.tempatId)),j.unit||'',j.uraian||'',j.cat||'',{instruktur:'Instruktur',guru:'Guru pembimbing',keduanya:'Instruktur dan guru'}[j.verif]||'',j.diberi||'']}),[12,28,10,30,24,60,40,20,22]);
 }else if(tab==='kunjungan'){
  S('Monitoring',['Tanggal','Tempat PKL','Kota tempat','Guru pembimbing','Cara','Temuan','Tindak lanjut'],L.map(function(k){var gu=k.guruId&&pkUser(k.guruId);return [k.tanggal,pkTempatNama(k.tempatId),pkoKota(k.tempatId),gu?gu.nama:(k.guruNama||''),k.mode==='daring'?'Daring':'Kunjungan langsung',k.temuan||'',k.tindak||'']}),[12,30,16,24,18,60,44]);
  T.p={judul:'LAPORAN MONITORING PRAKTIK KERJA LAPANGAN',file:'Monitoring-PKL-'+kd+'-'+tg,land:true,head:['No','Tanggal','Tempat PKL','Guru pembimbing','Cara','Temuan','Tindak lanjut'],
   body:L.map(function(k,i){var gu=k.guruId&&pkUser(k.guruId);return [i+1,pkTgl(k.tanggal),pkTempatNama(k.tempatId),gu?gu.nama:(k.guruNama||'-'),k.mode==='daring'?'Daring':'Langsung',k.temuan||'-',k.tindak||'-']}),cols:{0:{cellWidth:9,halign:'center'},1:{cellWidth:28}},ttd:['Guru Pembimbing','Koordinator PKL']};
 }else if(tab==='nilai'){
  S('Nilai',['Nama siswa','NIS/Username','Kelas','Tempat PKL'].concat([1,2,3,4].map(function(i){return 'TP'+i+' '+tp[i-1]}),['Nilai akhir','Predikat','Catatan guru','Catatan instruktur']),L.map(function(n){var u=pkUser(n.sid),v=pkNilaiAkhir(n);return [n.nama||pkNm(n),u?pkoNis(u):'',n.kelas||pkKl(n),pkTempatNama(n.tempatId)].concat([1,2,3,4].map(function(i){var s=n['tp'+i];return s===''||s==null?'':s}),[v==null?'':v,pkPredikat(v),n.catGuru||'',n.catInstr||''])}),[28,16,10,30,16,16,16,16,12,16,40,40]);
  T.p={judul:'REKAP NILAI PESERTA DIDIK MATA PELAJARAN PKL',file:'Rekap-Nilai-PKL-'+kd+'-'+tg,land:true,head:['No','Siswa','Kelas','Tempat PKL','TP1','TP2','TP3','TP4','Nilai akhir','Predikat','S','I','A'],
   body:L.map(function(n,i){var v=pkNilaiAkhir(n),r=pkRekap(n.sid);return [i+1,n.nama||pkNm(n),n.kelas||pkKl(n),pkTempatNama(n.tempatId)].concat([1,2,3,4].map(function(j){var s=n['tp'+j];return s===''||s==null?'-':s}),[v==null?'-':v,pkPredikat(v)||'-',r.sakit,r.izin,r.alpa])}),
   cols:{0:{cellWidth:9,halign:'center'},4:{halign:'center'},5:{halign:'center'},6:{halign:'center'},7:{halign:'center'},8:{halign:'center'},10:{halign:'center'},11:{halign:'center'},12:{halign:'center'}},ttd:['Guru Pembimbing','Koordinator PKL'],cat:'S = sakit, I = izin, A = tanpa keterangan (hari).'};
 }else if(tab==='cek'){
  S('Kelengkapan',['Nama siswa','NIS/Username','Kelas','Tempat PKL'].concat(PKO_PENDEK,['Jumlah']),L.map(function(g){var u=pkUser(g.sid),n=PK_CEK.filter(function(x){return pkoCekItem(g.sid,x[0])}).length;return [pkNm(g),u?pkoNis(u):'',pkKl(g),pkTempatNama(g.tempatId)].concat(PK_CEK.map(function(x){return pkoCekItem(g.sid,x[0])?'Ya':'Belum'}),[n+'/'+PK_CEK.length])}),[28,16,10,30].concat(PKO_PENDEK.map(function(){return 14}),[9]));
  T.p={judul:'KELENGKAPAN DOKUMEN DAN TAHAPAN PKL',file:'Kelengkapan-PKL-'+kd+'-'+tg,land:true,head:['No','Siswa','Tempat PKL'].concat(PKO_PENDEK,['Jml']),
   body:L.map(function(g,i){var n=PK_CEK.filter(function(x){return pkoCekItem(g.sid,x[0])}).length;return [i+1,pkNm(g),pkTempatNama(g.tempatId)].concat(PK_CEK.map(function(x){return pkoCekItem(g.sid,x[0])?'v':'-'}),[n+'/'+PK_CEK.length])}),
   cols:(function(){var c={0:{cellWidth:8,halign:'center'}};for(var i=3;i<15;i++)c[i]={halign:'center',cellWidth:i===14?12:15};return c})(),fs:7,ttd:['Koordinator PKL','Kepala Sekolah'],cat:'v = sudah terpenuhi, - = belum.'};
 }else if(tab==='rekap'){
  S('Rekap',['Siswa','Kelas','Tempat PKL','Hadir','Izin','Sakit','Tanpa keterangan','Masuk di luar lokasi','Jurnal','Kelengkapan','Nilai akhir','Guru pembimbing'],L.map(function(x){return [pkNm(x.g),pkKl(x.g),pkTempatNama(x.g.tempatId),x.r.hadir,x.r.izin,x.r.sakit,x.r.alpa,x.r.luar,x.jurnal,x.cek+'/'+PK_CEK.length,x.nilai==null?'':x.nilai,x.guru]}),[28,10,30,8,8,8,12,14,8,12,10,24]);
  T.p={judul:'REKAP KEHADIRAN DAN NILAI PESERTA DIDIK PKL',file:'Rekap-PKL-'+kd+'-'+tg,land:true,head:['No','Siswa','Kelas','Tempat PKL','Hadir','Izin','Sakit','T.ket','Luar lokasi','Jurnal','Kelengkapan','Nilai'],
   body:L.map(function(x,i){return [i+1,pkNm(x.g),pkKl(x.g),pkTempatNama(x.g.tempatId),x.r.hadir,x.r.izin,x.r.sakit,x.r.alpa,x.r.luar,x.jurnal,x.cek+'/'+PK_CEK.length,x.nilai==null?'-':x.nilai]}),
   cols:{0:{cellWidth:9,halign:'center'},4:{halign:'center'},5:{halign:'center'},6:{halign:'center'},7:{halign:'center'},8:{halign:'center'},9:{halign:'center'},10:{halign:'center'},11:{halign:'center'}},ttd:['Guru Pembimbing','Koordinator PKL'],cat:'Tanpa keterangan (T.ket) = hari kerja Senin-Jumat sejak mulai PKL dikurangi hadir, izin, dan sakit (perkiraan).'};
 }
 return T;
}
function pkoEkspor(tab){
 if(!needX())return;
 var T=pkoTabel(tab);
 if(!T.x.length)return;
 if(!T.n&&tab!=='absen'){toast('Belum ada data untuk diekspor'+(T.saring?' (cek saringan yang aktif)':'')+'.');return}
 if(tab==='absen'&&!T.n&&T.x[1][1].length<2){toast('Belum ada data absensi pada tanggal ini.');return}
 var d=tab==='absen'?(PK.ft||pkToday()):pkToday();
 pkoTulis(T.x,PKO_NAMA[tab]+'-'+pkoKode()+'-'+d+'.xlsx');
}

/* ---------- Spesifikasi impor ---------- */
function pkoCekKolom(){return PK_CEK.map(function(x,i){return [x[0],PKO_PENDEK[i]||x[1],[x[1],x[0]]]})}
function pkoSpec(tab){
 if(PKO.spec[tab])return PKO.spec[tab];
 var sp={
  tugas:{dk:'tugas',judul:'Penempatan',sheet:'Penempatan',satuan:'penempatan',tpl:'Template_Impor_Penempatan_PKL.xlsx',wajib:['tempat'],
   kol:[['nama','Nama siswa',['siswa','namasiswa','nama']],['nis','NIS/Username',['nis','nisn','username']],['kelas','Kelas',[]],['tempat','Tempat PKL',['tempat','duniakerja','namaduniakerja']],['kota','Kota tempat',['kota','kotakabupaten']],['guru','Guru pembimbing',['guru','pembimbing']],['instruktur','Instruktur',['pembimbingduniakerja']],['mulai','Mulai',['mulaipkl','tanggalmulai']],['selesai','Selesai',['selesaipkl','tanggalselesai']],['status','Status',[]]],
   id:['kelas','kota'],parse:function(rows){return pkoParseTugas(rows)}},
  kunjungan:{dk:'kunjungan',judul:'Monitoring',sheet:'Monitoring',satuan:'monitoring',tpl:'Template_Impor_Monitoring_PKL.xlsx',wajib:['tempat'],
   kol:[['tanggal','Tanggal',['tanggalmonitoring','tanggalkunjungan']],['tempat','Tempat PKL',['tempat','duniakerja','namaduniakerja']],['kota','Kota tempat',['kota','kotakabupaten']],['guru','Guru pembimbing',['guru','pembimbing']],['mode','Cara',['carakunjungan','caramonitoring']],['temuan','Temuan',[]],['tindak','Tindak lanjut',['tindaklanjut']]],
   id:['kota'],parse:function(rows){return pkoParseKunjungan(rows)}},
  nilai:{dk:'nilai',judul:'Nilai',sheet:'Nilai',satuan:'nilai',tpl:'Template_Impor_Nilai_PKL.xlsx',wajib:['nama','nis'],
   kol:[['nama','Nama siswa',['siswa','namasiswa','nama']],['nis','NIS/Username',['nis','nisn','username']],['kelas','Kelas',[]],['tempat','Tempat PKL',['tempat']],['catGuru','Catatan guru',['catatanguru','catatanpembimbing']],['catInstr','Catatan instruktur',['catataninstruktur','catatanduniakerja']]],
   res:function(hn){var m=hn.match(/^tp([1-4])/);return m?'tp'+m[1]:''},id:['nama','nis','kelas','tempat'],data:['tp1','tp2','tp3','tp4','catGuru','catInstr'],parse:function(rows){return pkoParseNilai(rows)}},
  cek:{dk:'cek',judul:'Kelengkapan',sheet:'Kelengkapan',satuan:'siswa',tpl:'Template_Impor_Kelengkapan_PKL.xlsx',wajib:['nama','nis'],
   kol:[['nama','Nama siswa',['siswa','namasiswa','nama']],['nis','NIS/Username',['nis','nisn','username']],['kelas','Kelas',[]],['tempat','Tempat PKL',['tempat']]].concat(pkoCekKolom()),
   id:['nama','nis','kelas','tempat'],data:PK_CEK.map(function(x){return x[0]}),parse:function(rows){return pkoParseCek(rows)}}
 }[tab];
 if(!sp)return null;
 sp.tab=tab;sp.map={};
 sp.kol.forEach(function(c){[pkxHdr(c[1]),pkxHdr(c[0])].concat((c[2]||[]).map(pkxHdr)).forEach(function(a){if(a&&!sp.map[a])sp.map[a]=c[0]})});
 return PKO.spec[tab]=sp;
}
/* Baca baris Excel menjadi {line,r:{kunci:nilai}}; baris tanpa isian sama sekali dilewati, baris yang hanya berisi identitas dilewati bila spesifikasi punya kolom data. */
function pkoBaris(raw,sp){
 var out=[],kosong=0;
 raw.forEach(function(r0,i){
  var r={},ada=false,data=false;
  Object.keys(r0).forEach(function(h){
   var hn=pkxHdr(h),k=sp.map[hn]||(sp.res?sp.res(hn):'');if(!k)return;
   var v=r0[h];if(pkxKosong(v))return;
   if(pkxKosong(r[k]))r[k]=v;
   ada=true;if(!sp.data||sp.data.indexOf(k)>-1)data=true;
  });
  if(!ada)return;
  if(sp.data&&!data){kosong++;return}
  out.push({line:i+2,r:r});
 });
 out.kosong=kosong;return out;
}
function pkoSiswaCari(r,pool){
 var nis=pkxTeks(r.nis),nama=pkxTeks(r.nama),kl=pkxTeks(r.kelas),L;
 if(nis){
  var k=pkoNo(nis);L=pool.filter(function(u){return pkoNo(pkoNis(u))===k||pkoNo(u.username)===k||pkoNo(String(u.email||'').split('@')[0])===k});
  if(L.length===1)return {u:L[0]};
  return {err:L.length?'NIS/Username "'+nis+'" cocok dengan '+L.length+' akun':'NIS/Username tidak ditemukan: '+nis};
 }
 if(!nama)return {err:'Nama siswa atau NIS/Username wajib diisi'};
 L=pool.filter(function(u){return pkxNorm(u.nama)===pkxNorm(nama)});
 if(kl&&L.length>1)L=L.filter(function(u){return pkxNorm(u.kelas)===pkxNorm(kl)});
 if(L.length===1)return {u:L[0]};
 return {err:L.length?'Ada '+L.length+' siswa bernama "'+nama+'". Isi NIS/Username.':'Siswa tidak ditemukan: '+nama+' (nama harus sama dengan akun, atau isi NIS/Username)'};
}
function pkoTempatCari(nama,kota){
 var n=pkxNorm(nama),k=pkxNorm(kota),L=pkList('tempat').filter(function(t){return pkxNorm(t.nama)===n&&(!k||pkxNorm(t.kota)===k)});
 if(L.length===1)return {t:L[0]};
 return {err:L.length?'Ada '+L.length+' tempat bernama "'+nama+'". Isi kolom Kota tempat.':'Tempat PKL tidak ditemukan: '+nama+(kota?' ('+kota+')':'')+'. Tambahkan dulu di tab Tempat PKL.'};
}
function pkoGuruCari(nama){
 var n=pkxNorm(nama),L=pkGuruAll().filter(function(u){return pkxNorm(u.nama)===n});
 if(L.length===1)return {g:L[0]};
 return {err:L.length?'Ada '+L.length+' guru bernama "'+nama+'"':'Guru pembimbing tidak ditemukan: '+nama+' (nama harus sama dengan akun guru)'};
}
function pkoHasil(){return {ok:[],err:[],same:0,contoh:0,kosong:0}}
function pkoAkhir(h,rows){h.kosong=rows.kosong||0;h.ok.sort(function(a,b){return a.line-b.line});h.err.sort(function(a,b){return a.line-b.line});return h}
function pkoContoh(v){return /^\(contoh\)/i.test(pkxTeks(v))}
function pkoSama(ex,o,keys,def){return keys.every(function(k){var a=ex[k],b=o[k];if(a==null||a==='')a=def&&def[k]!==undefined?def[k]:'';if(b==null||b==='')b=def&&def[k]!==undefined?def[k]:'';return String(a)===String(b)})}

/* Penempatan */
function pkoParseTugas(rows){
 var h=pkoHasil(),pool=pkSiswaAll(),virt=pkList('tugas').map(function(t){return {id:t.id,sid:t.sid,tempatId:t.tempatId,status:t.status||'aktif',o:t,baru:false}});
 function vAkt(sid,exc){return virt.filter(function(v){return v.sid===sid&&v.status==='aktif'&&v.id!==exc})[0]||null}
 function vIsi(tid,exc){return virt.filter(function(v){return v.tempatId===tid&&v.status==='aktif'&&v.id!==exc}).length}
 /* baris Selesai/Dibatalkan diproses lebih dulu agar slot aktif dan kuota terbebas sebelum penempatan aktif baru (siswa pindah tempat) */
 var rank=function(w){return /^(selesai|batal|dibatal)/i.test(pkxTeks(w.r.status))?0:1};
 rows.slice().sort(function(a,b){return rank(a)-rank(b)||a.line-b.line}).forEach(function(w){
  var r=w.r;function bad(m){h.err.push({line:w.line,msg:m})}
  if(pkoContoh(r.nama))return h.contoh++;
  var s=pkoSiswaCari(r,pool);if(s.err)return bad(s.err);var u=s.u;
  if(!pkoPeserta(u))return bad(u.nama+' bukan peserta PKL (kelas XII atau sudah punya penempatan)');
  if(pkxKosong(r.tempat))return bad('Tempat PKL kosong');
  var tc=pkoTempatCari(pkxTeks(r.tempat),pkxTeks(r.kota));if(tc.err)return bad(tc.err);var tp=tc.t;
  var gu=null;if(!pkxKosong(r.guru)){var gc=pkoGuruCari(pkxTeks(r.guru));if(gc.err)return bad(gc.err);gu=gc.g}
  var mulai=pkxTgl(r.mulai),selesai=pkxTgl(r.selesai);
  if(mulai===null)return bad('Tanggal "Mulai" tidak terbaca (tulis yyyy-mm-dd atau dd/mm/yyyy): '+pkxTeks(r.mulai));
  if(selesai===null)return bad('Tanggal "Selesai" tidak terbaca (tulis yyyy-mm-dd atau dd/mm/yyyy): '+pkxTeks(r.selesai));
  var st='';
  if(!pkxKosong(r.status)){var sx=pkxTeks(r.status).toLowerCase();st=/^aktif/.test(sx)?'aktif':/^selesai/.test(sx)?'selesai':/^(batal|dibatal)/.test(sx)?'dibatalkan':null;if(st===null)return bad('Status harus Aktif, Selesai, atau Dibatalkan: '+pkxTeks(r.status))}
  var cands=virt.filter(function(v){return v.sid===u.id&&v.tempatId===tp.id}),ex=null,ev=null;
  if(cands.length===1)ev=cands[0];
  else if(cands.length>1){ev=mulai&&cands.filter(function(c){return c.o.mulai===mulai})[0]||null;if(!ev)return bad('Siswa ini punya '+cands.length+' penempatan di tempat yang sama. Isi Mulai persis seperti data yang ada.')}
  if(ev){if(ev.baru)return bad('Duplikat di dalam berkas: '+u.nama+' di '+tp.nama);ex=ev.o}
  var o;
  if(ex)o=Object.assign({},ex);
  else{if(!mulai||!selesai)return bad('Mulai dan Selesai wajib diisi untuk penempatan baru');o={id:uid(),sid:u.id,status:'aktif'}}
  o.sid=u.id;o.tempatId=tp.id;
  if(gu){o.guruId=gu.id;o.guruNama=gu.nama}
  if(mulai)o.mulai=mulai;if(selesai)o.selesai=selesai;if(st)o.status=st;
  var ins=pkxTeks(r.instruktur);if(ins)o.instruktur=ins;else if(!o.instruktur)o.instruktur=tp.instruktur||'';
  if(o.selesai<o.mulai)return bad('Tanggal selesai lebih awal dari mulai');
  if((o.status||'aktif')==='aktif'){
   var dup=vAkt(u.id,o.id);if(dup)return bad(u.nama+' sudah punya penempatan aktif di '+pkTempatNama(dup.tempatId)+'. Tulis baris penempatan lama sebagai Selesai atau Dibatalkan.');
   if(tp.kuota&&vIsi(tp.id,o.id)>=+tp.kuota)return bad('Kuota '+tp.nama+' ('+tp.kuota+') sudah penuh');
  }
  if(ev){ev.tempatId=o.tempatId;ev.status=o.status||'aktif';ev.o=Object.assign({},ex,o)}
  else virt.push({id:o.id,sid:o.sid,tempatId:o.tempatId,status:o.status||'aktif',o:o,baru:true});
  if(ex&&pkoSama(ex,o,['tempatId','guruId','instruktur','mulai','selesai','status'],{status:'aktif'}))return h.same++;
  h.ok.push({line:w.line,baru:!ex,rec:ex,o:o});
 });
 return pkoAkhir(h,rows);
}
/* Monitoring */
function pkoParseKunjungan(rows){
 var h=pkoHasil(),seen={};
 rows.forEach(function(w){
  var r=w.r;function bad(m){h.err.push({line:w.line,msg:m})}
  if(pkoContoh(r.tempat))return h.contoh++;
  var tgl=pkxTgl(r.tanggal);
  if(pkxKosong(r.tanggal))return bad('Tanggal kosong');
  if(tgl===null)return bad('Tanggal tidak terbaca (tulis yyyy-mm-dd atau dd/mm/yyyy): '+pkxTeks(r.tanggal));
  if(pkxKosong(r.tempat))return bad('Tempat PKL kosong');
  var tc=pkoTempatCari(pkxTeks(r.tempat),pkxTeks(r.kota));if(tc.err)return bad(tc.err);var tp=tc.t;
  var gu=null;if(!pkxKosong(r.guru)){var gc=pkoGuruCari(pkxTeks(r.guru));if(gc.err)return bad(gc.err);gu=gc.g}
  var md='';if(!pkxKosong(r.mode)){var ms=pkxTeks(r.mode).toLowerCase();md=/daring|online|telepon|video/.test(ms)?'daring':/langsung|kunjung|luring|datang/.test(ms)?'luring':null;if(md===null)return bad('Cara harus "Kunjungan langsung" atau "Daring": '+pkxTeks(r.mode))}
  var key=tgl+'|'+tp.id;if(seen[key])return bad('Duplikat di dalam berkas (tanggal dan tempat sama dengan baris '+seen[key]+')');seen[key]=w.line;
  var ex=pkList('kunjungan').filter(function(k){return k.tanggal===tgl&&k.tempatId===tp.id})[0]||null,o=ex?Object.assign({},ex):{id:uid(),mode:'luring'};
  o.tanggal=tgl;o.tempatId=tp.id;if(md)o.mode=md;
  if(gu){o.guruId=gu.id;o.guruNama=gu.nama}
  else if(!ex){var g0=pkList('tugas').filter(function(x){return x.tempatId===tp.id&&x.status==='aktif'&&x.guruId})[0],u0=g0&&pkUser(g0.guruId);if(u0){o.guruId=u0.id;o.guruNama=u0.nama}}
  var tm=pkxTeks(r.temuan,true),tl=pkxTeks(r.tindak,true);
  if(tm.length>PKX_TEKS||tl.length>PKX_TEKS)return bad('Temuan atau tindak lanjut terlalu panjang (maksimal '+PKX_TEKS+' karakter)');
  if(tm)o.temuan=tm;if(tl)o.tindak=tl;
  if(ex&&pkoSama(ex,o,['guruId','mode','temuan','tindak'],{mode:'luring'}))return h.same++;
  h.ok.push({line:w.line,baru:!ex,rec:ex,o:o});
 });
 return pkoAkhir(h,rows);
}
/* Nilai */
function pkoParseNilai(rows){
 var h=pkoHasil(),pool=pkSiswaAll(),seen={};
 rows.forEach(function(w){
  var r=w.r;function bad(m){h.err.push({line:w.line,msg:m})}
  if(pkoContoh(r.nama))return h.contoh++;
  var s=pkoSiswaCari(r,pool);if(s.err)return bad(s.err);var u=s.u;
  if(!pkoPeserta(u))return bad(u.nama+' bukan peserta PKL (kelas XII atau sudah punya penempatan)');
  var p={},gagal='';
  [1,2,3,4].forEach(function(i){
   var v=r['tp'+i];if(gagal||pkxKosong(v))return;
   var n=pkxAngka(v);if(n==null||n<0||n>100)gagal='TP'+i+' harus angka 0 sampai 100: '+pkxTeks(v);else p['tp'+i]=Math.round(n*100)/100;
  });
  if(gagal)return bad(gagal);
  ['catGuru','catInstr'].forEach(function(k){var t=pkxTeks(r[k],true);if(t.length>PKX_TEKS)gagal='Catatan terlalu panjang (maksimal '+PKX_TEKS+' karakter)';else if(t)p[k]=t});
  if(gagal)return bad(gagal);
  if(seen[u.id])return bad('Duplikat di dalam berkas: '+u.nama+' (sama dengan baris '+seen[u.id]+')');seen[u.id]=w.line;
  var ex=pkList('nilai').filter(function(x){return x.sid===u.id})[0]||null,o=ex?Object.assign({},ex):{id:uid(),tp1:'',tp2:'',tp3:'',tp4:''};
  Object.assign(o,p);o.sid=u.id;o.nama=u.nama;o.kelas=u.kelas||'';
  var tg=pkTugasSiswa(u.id);if(tg)o.tempatId=tg.tempatId;
  if(ex&&pkoSama(ex,o,['tp1','tp2','tp3','tp4','catGuru','catInstr']))return h.same++;
  h.ok.push({line:w.line,baru:!ex,rec:ex,o:o});
 });
 return pkoAkhir(h,rows);
}
/* Kelengkapan */
function pkoYa(v){
 if(typeof v==='boolean')return v;
 if(typeof v==='number')return v===1?true:v===0?false:null;
 var s=pkxTeks(v).toLowerCase();
 if(/^(ya|y|iya|sudah|ok|v|x|1|true|✓|✔|lengkap|ada|selesai)$/.test(s))return true;
 if(/^(belum|tidak|t|n|no|0|false|-|kosong)$/.test(s))return false;
 return null;
}
function pkoParseCek(rows){
 var h=pkoHasil(),pool=pkSiswaAll(),seen={};
 var punya={};pkList('tugas').forEach(function(t){if(t.status!=='dibatalkan')punya[t.sid]=1});
 rows.forEach(function(w){
  var r=w.r;function bad(m){h.err.push({line:w.line,msg:m})}
  if(pkoContoh(r.nama))return h.contoh++;
  var s=pkoSiswaCari(r,pool);if(s.err)return bad(s.err);var u=s.u;
  if(!punya[u.id])return bad(u.nama+' belum punya penempatan PKL');
  var p={},gagal='';
  PK_CEK.forEach(function(x,i){var v=r[x[0]];if(gagal||pkxKosong(v))return;var y=pkoYa(v);if(y===null)gagal='Kolom "'+PKO_PENDEK[i]+'" harus Ya atau Belum: '+pkxTeks(v);else p[x[0]]=y});
  if(gagal)return bad(gagal);
  if(seen[u.id])return bad('Duplikat di dalam berkas: '+u.nama+' (sama dengan baris '+seen[u.id]+')');seen[u.id]=w.line;
  var ex=pkCekOf(u.id),items=Object.assign({},ex&&ex.items||{},p),o=ex?Object.assign({},ex):{id:'cek_'+u.id,sid:u.id};
  o.items=items;o.sid=u.id;o.nama=u.nama;
  var beda=Object.keys(p).some(function(k){return !!(ex&&ex.items&&ex.items[k])!==p[k]});
  if(ex&&!beda)return h.same++;
  if(!ex&&!Object.keys(p).some(function(k){return p[k]}))return h.same++;
  h.ok.push({line:w.line,baru:!ex,rec:ex,o:o});
 });
 return pkoAkhir(h,rows);
}

/* ---------- Template ---------- */
function pkoPetunjuk(tab){
 var umum=[['Sel kosong','Tidak menghapus isi yang sudah ada.'],['Baris contoh','Baris yang namanya diawali (CONTOH) dilewati otomatis.'],['Batas','Maksimal '+PKX_MAKS+' baris per impor. Hanya untuk Guru dan Admin. Ada pratinjau (baru, diperbarui, ditolak) sebelum diterapkan; baris yang salah tidak menggagalkan baris lain.']];
 var siswa=['Nama siswa, NIS/Username','Isi salah satunya. NIS/Username lebih pasti (angka boleh dengan atau tanpa titik dan nol di depan). Bila hanya nama: harus sama dengan nama akun; isi Kelas bila ada nama kembar.'];
 var A={
  tugas:[['Kolom','Aturan'],siswa,['Tempat PKL, Kota tempat','Wajib. Nama harus sama dengan yang ada di tab Tempat PKL; isi Kota bila ada nama kembar. Lihat lembar Rujukan.'],['Guru pembimbing','Boleh kosong. Nama harus sama dengan akun guru (lembar Rujukan Guru).'],['Instruktur','Kosong = ikut instruktur di data tempat.'],['Mulai, Selesai','Wajib untuk penempatan baru. yyyy-mm-dd, dd/mm/yyyy, atau sel tanggal Excel.'],['Status','Aktif, Selesai, atau Dibatalkan. Kosong pada penempatan baru = Aktif.'],['Pencocokan','Siswa + Tempat yang sudah ada = memperbarui penempatan itu (tanggal dan guru boleh diubah). Selain itu = penempatan baru.'],['Aturan','Satu penempatan aktif per siswa dan kuota tempat tetap dijaga. Memindahkan siswa: tulis baris tempat lama dengan Status Selesai, lalu baris tempat baru; baris Selesai diproses lebih dulu.'],['Peserta','Hanya siswa kelas XII atau yang sudah punya penempatan.']],
  kunjungan:[['Kolom','Aturan'],['Tanggal','Wajib. yyyy-mm-dd, dd/mm/yyyy, atau sel tanggal Excel.'],['Tempat PKL, Kota tempat','Wajib. Nama harus sama dengan tab Tempat PKL (lembar Rujukan Tempat).'],['Guru pembimbing','Kosong pada monitoring baru = guru pembimbing siswa aktif di tempat itu.'],['Cara','Kunjungan langsung atau Daring. Kosong pada monitoring baru = Kunjungan langsung.'],['Temuan, Tindak lanjut','Teks bebas.'],['Pencocokan','Tanggal + Tempat yang sama dengan data yang ada = memperbarui; selain itu = monitoring baru.']],
  nilai:[['Kolom','Aturan'],siswa,['TP1 sampai TP4','Angka 0-100 (desimal boleh). Nilai akhir dihitung otomatis dari TP yang terisi; kolom Nilai akhir dan Predikat di berkas ini hanya informasi.'],['Catatan guru, Catatan instruktur','Teks bebas.'],['Pencocokan','Satu nilai per siswa; yang sudah ada diperbarui. Baris tanpa TP dan catatan dilewati.'],['Berkas ini','Berisi siswa yang sudah ditempatkan beserta nilai saat ini, jadi tinggal diisi lalu diimpor.']],
  cek:[['Kolom','Aturan'],siswa,['11 kolom tahapan','Ya atau Belum (juga: Y, Sudah, V, 1 / Tidak, T, 0, -). Kosong = tidak diubah.'],['Pencocokan','Hanya siswa yang punya penempatan (selain Dibatalkan).'],['Berkas ini','Berisi kondisi saat ini, jadi tinggal diubah lalu diimpor.']]
 }[tab];
 return A.concat(umum);
}
function pkoRujukan(){
 var sw=pkSiswaAll().filter(pkoPeserta).map(function(u){var tg=pkTugasSiswa(u.id),a=pkAktifTugas(u.id,'');return [u.nama,pkoNis(u),u.kelas||'',a?'Aktif di '+pkTempatNama(a.tempatId):tg?'Pernah ditempatkan':'Belum ditempatkan']});
 var tm=pkList('tempat').slice().sort(pkUrutNama).map(function(t){var n=pkTerisi(t.id,'');return [t.nama,t.kota||'',t.kuota||'',n,t.kuota?Math.max(0,+t.kuota-n):'']});
 var gr=pkGuruAll().map(function(u){return [u.nama]});
 return [['Rujukan Siswa',[['Nama siswa','NIS/Username','Kelas','Status']].concat(sw),[28,16,10,30]],['Rujukan Tempat',[['Tempat PKL','Kota','Kuota','Terisi','Sisa']].concat(tm),[32,16,8,8,8]],['Rujukan Guru',[['Guru pembimbing']].concat(gr),[30]]];
}
function pkoTemplate(tab){
 if(!needX())return;
 if(pkoKepsek()){toast('Peran Kepala Sekolah hanya dapat melihat data.');return}
 var sp=pkoSpec(tab),tp=pkTP(),sheets;
 if(tab==='tugas'){
  sheets=[[sp.sheet,[['Nama siswa','NIS/Username','Kelas','Tempat PKL','Kota tempat','Guru pembimbing','Instruktur','Mulai','Selesai','Status'],['(CONTOH) Ahmad Fauzi','2603.0390','XII','PT Mitra Otomotif Sejahtera','Bandung','Bapak Guru','Bapak Dedi','2026-07-01','2027-06-30','Aktif']],[28,16,10,30,16,24,22,12,12,12]]].concat(pkoRujukan());
 }else if(tab==='kunjungan'){
  sheets=[[sp.sheet,[['Tanggal','Tempat PKL','Kota tempat','Guru pembimbing','Cara','Temuan','Tindak lanjut'],['2026-11-20','(CONTOH) PT Mitra Otomotif Sejahtera','Bandung','Bapak Guru','Kunjungan langsung','Siswa mengerjakan servis berkala sesuai kompetensi.','Tambah variasi pekerjaan kelistrikan.']],[12,34,16,24,18,60,44]]].concat(pkoRujukan().slice(1));
 }else if(tab==='nilai'){
  var G=pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(pkoUrutTN),seen={},rows=[];
  G.forEach(function(g){if(seen[g.sid])return;seen[g.sid]=1;var u=pkUser(g.sid),n=pkList('nilai').filter(function(x){return x.sid===g.sid})[0]||{},v=pkNilaiAkhir(n);
   rows.push([pkNm(g),u?pkoNis(u):'',pkKl(g),pkTempatNama(g.tempatId)].concat([1,2,3,4].map(function(i){var s=n['tp'+i];return s===''||s==null?'':s}),[v==null?'':v,pkPredikat(v),n.catGuru||'',n.catInstr||'']))});
  sheets=[[sp.sheet,[['Nama siswa','NIS/Username','Kelas','Tempat PKL'].concat([1,2,3,4].map(function(i){return 'TP'+i+' '+tp[i-1]}),['Nilai akhir','Predikat','Catatan guru','Catatan instruktur'])].concat(rows),[28,16,10,30,16,16,16,16,12,16,40,40]]];
 }else{
  var G2=pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(pkoUrutTN),seen2={},r2=[];
  G2.forEach(function(g){if(seen2[g.sid])return;seen2[g.sid]=1;var u=pkUser(g.sid);r2.push([pkNm(g),u?pkoNis(u):'',pkKl(g),pkTempatNama(g.tempatId)].concat(PK_CEK.map(function(x){return pkoCekItem(g.sid,x[0])?'Ya':'Belum'})))});
  sheets=[[sp.sheet,[['Nama siswa','NIS/Username','Kelas','Tempat PKL'].concat(PKO_PENDEK)].concat(r2),[28,16,10,30].concat(PKO_PENDEK.map(function(){return 14}))]];
 }
 sheets.push(['Petunjuk',pkoPetunjuk(tab),[30,110]]);
 pkoTulis(sheets,sp.tpl);
}

/* ---------- Impor ---------- */
function pkoRingkas(h,sp){
 var b=h.ok.filter(function(x){return x.baru}).length,u=h.ok.length-b,t=[];
 if(b)t.push(b+' '+sp.satuan+' baru');if(u)t.push(u+' diperbarui');if(h.same)t.push(h.same+' tidak berubah');if(h.err.length)t.push(h.err.length+' ditolak');
 return t.join(', ');
}
async function pkoTerapkan(sp,items){
 var baru=0,ubah=0,tunda=0;
 for(var i=0;i<items.length;i+=5){
  await Promise.all(items.slice(i,i+5).map(function(it){
   return pkPut(sp.dk,it.o).then(function(ok){return ok},function(){return false}).then(function(ok){if(it.baru)baru++;else ubah++;if(!ok)tunda++});
  }));
 }
 return {baru:baru,ubah:ubah,tunda:tunda};
}
async function pkoImpor(tab,file){
 var sp=pkoSpec(tab);if(!sp||!file)return;
 if(pkoKepsek()||!isStaff()){toast('Hanya Guru atau Admin yang dapat mengimpor data PKL.');return}
 if(PKO.busy||PKX.busy)return;
 if(!needX())return;
 if(PK.loading||!PK.loaded){toast('Data PKL masih dimuat. Coba lagi sebentar.');return}
 PKO.busy=true;
 try{
  var wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
  if(!wb.SheetNames||!wb.SheetNames.length){toast('Berkas tidak berisi lembar data.');return}
  var nm=wb.SheetNames.filter(function(n){return pkxHdr(n)===pkxHdr(sp.sheet)})[0]||wb.SheetNames[0];
  var raw=XLSX.utils.sheet_to_json(wb.Sheets[nm],{defval:'',raw:true});
  if(!raw.length){toast('Berkas kosong atau judul kolom tidak terbaca. Pakai tombol Template.');return}
  var heads=Object.keys(raw[0]).map(function(x){return sp.map[pkxHdr(x)]||(sp.res?sp.res(pkxHdr(x)):'')});
  if(!sp.wajib.some(function(k){return heads.indexOf(k)>-1})){toast('Judul kolom tidak dikenali ('+sp.judul+'). Pakai tombol Template.');return}
  if(raw.length>PKX_MAKS){toast('Maksimal '+PKX_MAKS+' baris per impor.');return}
  var rows=pkoBaris(raw,sp),h=sp.parse(rows);
  if(!h.ok.length){
   var m0='Tidak ada baris yang dapat diimpor.'+(h.same?' '+h.same+' baris sama dengan data yang sudah ada.':'')+(h.kosong?' '+h.kosong+' baris tanpa isian dilewati.':'')+(h.contoh&&!h.err.length&&!h.same?' Hanya baris contoh yang ditemukan.':'')+(h.err.length?'\n\n'+pkxGalat(h):'');
   if(typeof uiInfo==='function')await uiInfo(m0);else toast(m0.split('\n')[0]);
   return;
  }
  var msg='Impor '+sp.judul+' PKL: '+pkoRingkas(h,sp)+'.'+(h.kosong?'\n'+h.kosong+' baris tanpa isian dilewati.':'')+(h.err.length?'\n\nBaris yang ditolak tidak diimpor:\n'+pkxGalat(h):'')+'\n\nSel kosong tidak menghapus data yang sudah ada.';
  var go=typeof uiConfirm==='function'?await uiConfirm(msg,{ok:'Terapkan '+h.ok.length}):true;
  if(!go)return;
  var r=await pkoTerapkan(sp,h.ok);
  toast('Impor selesai: '+r.baru+' baru, '+r.ubah+' diperbarui'+(h.same?', '+h.same+' tidak berubah':'')+(h.err.length?', '+h.err.length+' ditolak':'')+(r.tunda?'. '+r.tunda+' tersimpan di perangkat dan dikirim saat online.':''));
  render();
 }catch(e){
  toast('Gagal membaca berkas: '+String((e&&e.message)||e).slice(0,100));
 }finally{PKO.busy=false}
}

/* ---------- Tombol dan peristiwa ---------- */
function pkoBar(tab){
 var A=PKO_AKSI[tab]||[],lihat=pkoKepsek(),h='';
 if(A.indexOf('imp')>-1&&!lihat)h+='<label class="btn small" style="cursor:pointer">Impor Excel<input type="file" accept=".xlsx,.xls,.csv" data-pkoimp="'+tab+'" hidden></label>';
 if(A.indexOf('tpl')>-1&&!lihat)h+='<button type="button" class="btn small" data-act="pkl-tpl-tab" data-v="'+tab+'">Template</button>';
 if(A.indexOf('xls')>-1)h+='<button type="button" class="btn small" data-act="pkl-xls-tab" data-v="'+tab+'">'+(tab==='rekap'?'Excel tabel ini':'Ekspor Excel')+'</button>';
 if(A.indexOf('pdf')>-1)h+='<button type="button" class="btn small" data-act="pkl-pdf-tab" data-v="'+tab+'">'+PKO_PDFLABEL[tab]+'</button>';
 return h?'<div class="row" style="gap:6px;flex-wrap:wrap">'+h+'</div>':'';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="pkl-"]');if(!b||!S.user)return;
 var a=b.dataset.act,v=b.dataset.v;
 if(a==='pkl-xls-tab'&&PKO_NAMA[v])pkoEkspor(v);
 else if(a==='pkl-tpl-tab'&&pkoSpec(v))pkoTemplate(v);
 else if(a==='pkl-pdf-tab'&&PKO_NAMA[v]){if(typeof pkpCetak==='function')pkpCetak(v);else toast('Modul cetak PDF belum termuat.')}
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||t.dataset.pkoimp===undefined||!S.user)return;
 var f=t.files&&t.files[0],tab=t.dataset.pkoimp;t.value='';pkoImpor(tab,f);
});
