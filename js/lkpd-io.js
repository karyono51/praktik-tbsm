/* lkpd-io.js: impor dan ekspor modul LKPD (Excel) untuk Admin dan Guru.
   Berkas ini memperluas daftar LKPD per kelas (lkpd-mode.js): menambah tombol Impor modul, Template, Ekspor kelas,
   Ekspor semua, dan Ekspor per modul. Tidak mengubah berkas lain.
   - Satu berkas Excel dapat memuat banyak modul. Isi modul dipecah ke beberapa sheet (Modul, Tujuan, Teori, Alat Bahan,
     K3, Langkah, Pemeriksaan, Gejala, Soal) yang dihubungkan dengan kolom ID Modul.
   - Impor: pratinjau dulu, baru diterapkan. Modul diproses utuh: bila ada satu kesalahan, modul itu ditolak seluruhnya.
     Validasi memakai lkValidateModule dan lkqValid yang sama dengan Editor Guru.
   - Penyimpanan lewat lkModuleStore (jalur yang sama dengan Editor Guru), jadi mode lokal, Appwrite, dan antrean offline
     bekerja seperti biasa. Data pengumpulan siswa tidak disentuh. */
var LKIO={imp:null,busy:false,MAX_MOD:100,MAX_ROW:5000,MAX_OPT:8,MAX_ROW_KAT:10,MAX_JSON:450000};

/* ---------- Definisi sheet dan kolom ---------- */
var LKIO_SHEET={modul:'Modul',tujuan:'Tujuan',teori:'Teori',alat:'Alat Bahan',k3:'K3',langkah:'Langkah',cek:'Pemeriksaan',gejala:'Gejala',soal:'Soal'};
var LKIO_SHEET_ALIAS={modul:['modul','daftarmodul'],tujuan:['tujuan','tujuanpembelajaran'],teori:['teori','teoriringkas'],
 alat:['alatbahan','alatdanbahan','alat'],k3:['k3','keselamatan','keselamatankerja'],langkah:['langkah','langkahkerja','prosedur'],
 cek:['pemeriksaan','tabelpemeriksaan','checklist'],gejala:['gejala','diagnosis','gejaladiagnosis'],soal:['soal','soalevaluasi','evaluasi']};
var LKIO_MOD_HEAD=['ID Modul','Judul','Kelas','Fase','Unit praktik','Durasi (menit)','Kode SKKNI','Status','Aktif',
 'Bobot langkah','Bobot K3','Bobot pemeriksaan','Bobot analisis','Bobot praktik','Bobot teori','Validasi',
 'Mode','Kesempatan','Tampilkan kunci','Sembunyikan teori','Sembunyikan langkah','Sembunyikan petunjuk','Buka','Tutup','Foto wajib'];
var LKIO_MOD_W=[14,42,8,7,34,10,18,10,7,9,9,11,9,9,9,34,9,11,10,11,11,11,17,17,14];
var LKIO_VKEYS=['vehicle','evidence','cause','conclusion','atLeastOneCheck'];

var LKIO_COLS={};
(function(){
 var C={
  modul:{id:['idmodul','id','kodemodul'],title:['judul','judulmodul'],kelas:['kelas'],fase:['fase'],unit:['unitpraktik','unit','objekpraktik'],
   dur:['durasimenit','durasi','alokasiwaktu'],skkni:['kodeskkni','skkni','kodestandar'],status:['status'],aktif:['aktif'],
   wsteps:['bobotlangkah'],wsafety:['bobotk3'],wchecks:['bobotpemeriksaan'],wanalysis:['bobotanalisis'],wpractice:['bobotpraktik'],wtheory:['bobotteori'],
   valid:['validasi','validasiwajib'],mode:['mode'],tries:['kesempatan','kesempatanmengirim'],showKey:['tampilkankunci'],
   hTeori:['sembunyikanteori'],hLangkah:['sembunyikanlangkah'],hPetunjuk:['sembunyikanpetunjuk'],buka:['buka','dibuka'],tutup:['tutup','ditutup'],foto:['fotowajib']},
  tujuan:{id:['idmodul','id'],a:['isi','tujuan','teks','item','butir']},
  teori:{id:['idmodul','id'],a:['topik'],b:['penjelasan','uraian']},
  alat:{id:['idmodul','id'],a:['isi','alat','alatbahan','teks','item','butir']},
  k3:{id:['idmodul','id'],a:['isi','k3','butir','teks','item']},
  langkah:{id:['idmodul','id'],a:['judul','judullangkah','langkah'],m:['menit','durasi','durasimenit'],b:['instruksi','uraian']},
  cek:{id:['idmodul','id'],a:['komponen'],b:['kriteria','kriteriapemeriksaan']},
  gejala:{id:['idmodul','id'],a:['isi','gejala','teks','item','butir']},
  soal:{id:['idmodul','id'],tipe:['jenis','tipe','jenissoal'],q:['soal','pertanyaan','teksoal'],kunci:['kunci','kuncijawaban'],
   lab0:['label1'],lab1:['label2'],bahas:['pembahasan','bahas']}
 };
 Object.keys(C).forEach(function(s){
  LKIO_COLS[s]={};
  Object.keys(C[s]).forEach(function(f){C[s][f].forEach(function(a){LKIO_COLS[s][a]=f})});
 });
 /* kolom soal bernomor: A sampai H, Pernyataan 1-10, Kunci 1-10 */
 for(var i=0;i<LKIO.MAX_OPT;i++){var L=String.fromCharCode(97+i);LKIO_COLS.soal[L]='o'+i;LKIO_COLS.soal['pilihan'+L]='o'+i}
 for(var j=1;j<=LKIO.MAX_ROW_KAT;j++){LKIO_COLS.soal['pernyataan'+j]='p'+(j-1);LKIO_COLS.soal['kunci'+j]='k'+(j-1)}
})();

/* ---------- Pembantu kecil ---------- */
function lkioKey(v){return String(v==null?'':v).toLowerCase().replace(/[^a-z0-9]/g,'')}
function lkioTxt(v){return String(v==null?'':v).replace(/\r\n?/g,'\n').trim()}
function lkioNum(v){var s=lkioTxt(v).replace(',','.');if(s==='')return null;var n=Number(s);return isFinite(n)?n:NaN}
function lkioBool(v){
 var k=lkioKey(v);if(!k)return undefined;
 if(['ya','y','aktif','1','true','benar','tampil'].indexOf(k)>-1)return true;
 if(['tidak','t','nonaktif','tidakaktif','0','false','salah','sembunyi'].indexOf(k)>-1)return false;
 return null;
}
function lkioStable(x){
 if(Array.isArray(x))return '['+x.map(lkioStable).join(',')+']';
 if(x&&typeof x==='object')return '{'+Object.keys(x).sort().filter(function(k){return x[k]!==undefined}).map(function(k){return JSON.stringify(k)+':'+lkioStable(x[k])}).join(',')+'}';
 return JSON.stringify(x);
}
function lkioStrip(m){var x=lkSerialize(m);if(Array.isArray(x.quiz))x.quiz=x.quiz.map(function(q){q=Object.assign({},q);if(q.t==='pg')delete q.t;if(!q.e)delete q.e;if(q.lab&&q.lab[0]==='Benar'&&q.lab[1]==='Salah')delete q.lab;return q});['updatedAt','updatedBy','payload','$id','$createdAt','$updatedAt','$permissions','$databaseId','$collectionId'].forEach(function(k){delete x[k]});return x}
function lkioLtr(i){return String.fromCharCode(65+i)}
/* 'YYYY-MM-DD HH:mm' atau 'DD/MM/YYYY HH:mm' menjadi 'YYYY-MM-DDTHH:mm'. undefined = kosong, '' = hapus, null = tidak valid. */
function lkioDT(v){
 var s=lkioTxt(v);if(!s)return undefined;if(s==='-')return '';
 var y,mo,d,h=0,mi=0,m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2})[.:](\d{2}))?/);
 if(m){y=+m[1];mo=+m[2];d=+m[3];if(m[4]!==undefined){h=+m[4];mi=+m[5]}}
 else{
  m=s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:[T\s]+(\d{1,2})[.:](\d{2}))?/);
  if(!m)return null;
  d=+m[1];mo=+m[2];y=+m[3];if(m[4]!==undefined){h=+m[4];mi=+m[5]}
 }
 if(mo<1||mo>12||d<1||d>31||h>23||mi>59)return null;
 var dt=new Date(y,mo-1,d);if(dt.getMonth()!==mo-1)return null;
 function p(n){return (n<10?'0':'')+n}
 return y+'-'+p(mo)+'-'+p(d)+'T'+p(h)+':'+p(mi);
}
function lkioShowDT(s){return s?String(s).replace('T',' '):''}

/* ============================================================
   EKSPOR
   ============================================================ */
function lkioSoalHead(nO,nR){
 var h=['ID Modul','No','Jenis','Soal'],i;
 for(i=0;i<nO;i++)h.push(lkioLtr(i));
 h.push('Kunci','Label 1','Label 2');
 for(i=1;i<=nR;i++)h.push('Pernyataan '+i,'Kunci '+i);
 h.push('Pembahasan');
 return h;
}
function lkioSoalRow(id,no,q,nO,nR){
 var t=lkqType(q),r=[id,no,t==='kategori'?'PG kategori':t==='kompleks'?'PG kompleks':'PG',q.q||''],i,o=q.o||[];
 for(i=0;i<nO;i++)r.push(o[i]!==undefined?o[i]:'');
 if(t==='pg')r.push(typeof q.a==='number'?lkioLtr(q.a):'');
 else if(t==='kompleks')r.push((Array.isArray(q.a)?q.a:[]).map(lkioLtr).join(','));
 else r.push('');
 if(t==='kategori'){
  var lab=q.lab||['Benar','Salah'];r.push(lab[0],lab[1]);
  for(i=0;i<nR;i++){var x=(q.rows||[])[i];r.push(x?x[0]:'',x?(x[1]?lab[0]:lab[1]):'')}
 }else{r.push('','');for(i=0;i<nR;i++)r.push('','')}
 r.push(q.e||'');
 return r;
}
/* Mengubah daftar modul menjadi {namaSheet: aoa}. Murni, tanpa efek samping. */
function lkioSheets(mods){
 var nO=5,nR=6,lossy=0,out={};
 mods.forEach(function(m){(m.quiz||[]).forEach(function(q){
  if(q.o&&q.o.length>nO)nO=Math.min(q.o.length,LKIO.MAX_OPT);
  if(q.rows&&q.rows.length>nR)nR=Math.min(q.rows.length,LKIO.MAX_ROW_KAT);
  if((q.o&&q.o.length>LKIO.MAX_OPT)||(q.rows&&q.rows.length>LKIO.MAX_ROW_KAT))lossy++;
 })});
 var A={modul:[LKIO_MOD_HEAD],tujuan:[['ID Modul','Isi']],teori:[['ID Modul','Topik','Penjelasan']],alat:[['ID Modul','Isi']],k3:[['ID Modul','Isi']],
  langkah:[['ID Modul','Judul','Menit','Instruksi']],cek:[['ID Modul','Komponen','Kriteria']],gejala:[['ID Modul','Isi']],soal:[lkioSoalHead(nO,nR)]};
 mods.forEach(function(m){
  var c=lkmCfg(m),r=m.rubric||{},v=m.validation||{},id=m.id;
  var foto=(Array.isArray(m.fotoWajib)?m.fotoWajib:[]).filter(function(i){return m.checks[i]}).map(function(i){return i+1}).join(',');
  A.modul.push([id,m.title||'',m.kelas||'',m.fase||'',m.unit||'',m.duration||'',m.skkni||'',m.status==='published'?'Terbit':'Draft',m.active===false?'Tidak':'Ya',
   r.steps,r.safety,r.checks,r.analysis,r.practiceWeight,r.theoryWeight,Object.keys(v).filter(function(k){return v[k]}).join(',')||'-',
   c.mode==='latihan'?'Latihan':'Ujian',c.maxTry,c.showKey?'Ya':'Tidak',c.hideTeori?'Ya':'Tidak',c.hideLangkah?'Ya':'Tidak',c.hidePetunjuk?'Ya':'Tidak',
   lkioShowDT(c.buka),lkioShowDT(c.tutup),foto]);
  (m.objectives||[]).forEach(function(x){A.tujuan.push([id,x])});
  (m.theory||[]).forEach(function(x){A.teori.push([id,x[0],x[1]])});
  (m.tools||[]).forEach(function(x){A.alat.push([id,x])});
  (m.safety||[]).forEach(function(x){A.k3.push([id,x])});
  (m.steps||[]).forEach(function(x){A.langkah.push([id,x[0],x[1],x[2]])});
  (m.checks||[]).forEach(function(x){A.cek.push([id,x[0],x[1]])});
  (m.symptoms||[]).forEach(function(x){A.gejala.push([id,x])});
  (m.quiz||[]).forEach(function(q,i){A.soal.push(lkioSoalRow(id,i+1,q,nO,nR))});
 });
 Object.keys(LKIO_SHEET).forEach(function(k){out[LKIO_SHEET[k]]=A[k]});
 out.__lossy=lossy;
 return out;
}
function lkioWidths(name,aoa){
 var w=({'Modul':LKIO_MOD_W,'Tujuan':[14,90],'Teori':[14,24,90],'Alat Bahan':[14,70],'K3':[14,90],'Langkah':[14,34,8,90],
  'Pemeriksaan':[14,34,60],'Gejala':[14,70]})[name];
 if(w)return w;
 var n=aoa[0].length,a=[14,5,13,60],i;
 for(i=4;i<n;i++)a.push(/^Pernyataan/.test(aoa[0][i])?34:(/^Kunci /.test(aoa[0][i])?10:(aoa[0][i]==='Pembahasan'?50:(aoa[0][i]==='Kunci'||/^Label/.test(aoa[0][i])?10:26))));
 return a;
}
function lkioWrite(mods,fname){
 var sh=lkioSheets(mods),wb=XLSX.utils.book_new();
 Object.keys(LKIO_SHEET).forEach(function(k){var n=LKIO_SHEET[k];XLSX.utils.book_append_sheet(wb,sheet(sh[n],lkioWidths(n,sh[n])),n)});
 XLSX.utils.book_append_sheet(wb,sheet(lkioHelp(),[26,120]),'Petunjuk');
 XLSX.writeFile(wb,fname);
 return sh.__lossy;
}
function lkioExport(scope,id){
 if(!lkioOk())return;
 if(typeof needX==='function'&&!needX())return;
 lkRefreshModules();
 var mods,tag;
 if(scope==='one'){var m=LKPD_MODULES.find(function(x){return x.id===id});if(!m){toast('Modul tidak ditemukan');return}mods=[m];tag=m.id}
 else if(scope==='all'){mods=LKPD_MODULES.slice();tag='semua'}
 else{mods=lkcModules(S.kelas,true);tag='kelas-'+S.kelas}
 if(!mods.length){toast('Tidak ada modul untuk diekspor');return}
 var lossy=lkioWrite(mods,'lkpd-modul-'+tag+'-'+ymd(Date.now())+'.xlsx');
 toast(mods.length+' modul diekspor'+(lossy?' ('+lossy+' soal melebihi batas kolom, sebagian terpotong)':''));
}
function lkioHelp(){
 return [['Sheet / kolom','Aturan'],
  ['Cara kerja','Satu berkas dapat memuat banyak modul. Sheet Modul berisi satu baris per modul. Sheet lain (Tujuan, Teori, Alat Bahan, K3, Langkah, Pemeriksaan, Gejala, Soal) berisi satu baris per butir dan dihubungkan lewat kolom ID Modul. Urutan baris = urutan tampil.'],
  ['Modul diproses utuh','Bila ada satu kesalahan di salah satu sheet, modul itu ditolak seluruhnya dan alasannya ditampilkan di pratinjau. Modul lain tetap diproses.'],
  ['ID Modul','Wajib. 2-32 karakter: huruf, angka, garis bawah, atau tanda hubung. ID baru = modul baru. ID yang sudah ada = modul itu diperbarui. ID modul bawaan (X-1 dan seterusnya) juga bisa diperbarui; hasilnya disimpan sebagai salinan, berkas bawaan tidak berubah.'],
  ['Pembaruan sebagian','Sheet yang ada di berkas akan menggantikan bagian itu pada modul yang sudah ada. Sheet yang tidak ada di berkas membuat bagian itu tidak berubah. Contoh: berkas hanya berisi sheet Soal akan hanya mengganti soal. Kolom kosong di sheet Modul juga berarti tidak berubah (untuk modul baru, memakai nilai bawaan).'],
  ['Judul, Kelas, Unit praktik','Wajib untuk modul baru. Kelas: X, XI, atau XII. Judul maksimal 180 karakter.'],
  ['Fase','Boleh kosong (diisi otomatis dari Kelas: X = E, XI dan XII = F).'],
  ['Durasi (menit)','Boleh kosong untuk modul baru: diisi dari jumlah menit sheet Langkah. Jumlah menit semua langkah harus sama dengan durasi.'],
  ['Status','Draft atau Terbit. Kosong = Draft untuk modul baru. Modul Draft tidak terlihat siswa.'],
  ['Aktif','Ya atau Tidak. Kosong = Ya untuk modul baru. Siswa hanya melihat modul yang Terbit dan Aktif.'],
  ['Bobot langkah, K3, pemeriksaan, analisis','Bobot praktik, harus berjumlah tepat 100. Kosong = 30, 20, 25, 25.'],
  ['Bobot praktik, teori','Bobot nilai akhir, harus berjumlah tepat 100. Kosong = 85 dan 15.'],
  ['Validasi','Daftar kunci pisah koma yang wajib diisi siswa: vehicle, evidence, cause, conclusion, atLeastOneCheck. Kosong = kelimanya (modul baru). Tulis - bila tidak ada validasi.'],
  ['Mode','Ujian atau Latihan. Ujian: nilai masuk rekap dan dikoreksi guru. Latihan: boleh diulang, nilai tidak masuk rekap. Kosong = Ujian.'],
  ['Kesempatan','Batas pengiriman per siswa untuk mode Ujian. 0 atau kosong = tidak terbatas.'],
  ['Tampilkan kunci','Mode Latihan: siswa bisa memeriksa jawaban dan pembahasan. Ya atau Tidak.'],
  ['Sembunyikan teori, langkah, petunjuk','Mode Ujian: sembunyikan teori ringkas, penjelasan langkah, atau petunjuk komponen dari siswa. Ya atau Tidak.'],
  ['Buka, Tutup','Jadwal opsional. Format 2026-11-12 08:00 atau 12/11/2026 08:00. Isi sebagai teks. Tulis - untuk menghapus jadwal lama.'],
  ['Foto wajib','Nomor baris di sheet Pemeriksaan yang wajib difoto siswa, pisah koma (contoh 1,3,4). Tulis semua untuk semua komponen, atau - untuk tidak ada.'],
  ['Teori','Satu baris per topik: Topik dan Penjelasan, keduanya wajib.'],
  ['Langkah','Satu baris per langkah: Judul, Menit (angka lebih dari 0), dan Instruksi, semuanya wajib.'],
  ['Pemeriksaan','Satu baris per komponen: Komponen dan Kriteria, keduanya wajib.'],
  ['Tujuan, Alat Bahan, K3','Minimal satu baris masing-masing. Gejala boleh kosong.'],
  ['Soal: Jenis','PG, PG kompleks, atau PG kategori. Kosong = ditebak dari kolom Kunci dan Pernyataan.'],
  ['Soal: A sampai H','Pilihan jawaban untuk PG dan PG kompleks. PG minimal 2 pilihan, PG kompleks minimal 3. Kolom kosong dilewati.'],
  ['Soal: Kunci','PG: satu huruf, misalnya B. PG kompleks: beberapa huruf, misalnya A,C. Huruf mengikuti kolom A sampai H.'],
  ['Soal: Label 1, Label 2','PG kategori saja. Dua pilihan jawaban, kosong = Benar dan Salah. Keduanya harus berbeda.'],
  ['Soal: Pernyataan dan Kunci 1-10','PG kategori saja. Minimal 2 pernyataan. Kunci berisi Label 1 atau Label 2 (atau angka 1 / 2).'],
  ['Soal: Pembahasan','Boleh kosong.'],
  ['Catatan','Maksimal '+LKIO.MAX_MOD+' modul dan '+LKIO.MAX_ROW+' baris per sheet. Data pengumpulan siswa tidak ikut diekspor dan tidak tersentuh impor. File hasil ekspor bisa diedit lalu diimpor ulang. Hapus baris contoh (CONTOH-1) bila tidak dipakai.']];
}
/* ---------- Template ---------- */
function lkioExample(){
 var m={id:'CONTOH-1',version:1,title:'Contoh: Pemeriksaan Busi',kelas:'X',fase:'E',unit:'Sepeda motor 4 langkah',duration:20,skkni:'',status:'draft',active:true,
  objectives:['Mengidentifikasi fungsi busi.','Memeriksa kondisi elektroda busi.'],
  theory:[['Busi','Memercikkan api untuk membakar campuran bahan bakar dan udara.']],
  tools:['Kunci busi','Feeler gauge','APD dan kain lap'],
  safety:['Pastikan mesin dingin sebelum melepas busi.','Kunci kontak OFF dan kabel busi dilepas dengan benar.'],
  steps:[['Persiapan',5,'Siapkan alat dan baca manual servis.'],['Lepas dan periksa busi',10,'Lepas busi, periksa warna dan kondisi elektroda.'],['Rapikan',5,'Pasang kembali, rapikan alat dan area kerja.']],
  checks:[['Warna elektroda','Normal, basah, atau berjelaga'],['Celah elektroda','Mm, bandingkan dengan manual']],
  symptoms:['Mesin sulit hidup','Tenaga mesin turun'],
  quiz:[{q:'Fungsi utama busi adalah ...',o:['Memercikkan api','Mengalirkan oli','Mendinginkan mesin'],a:0,e:'Busi memercikkan api pada ruang bakar.'},
   {t:'kompleks',q:'Pilih semua tindakan K3 yang benar.',o:['Mesin dingin sebelum melepas busi','Memakai APD','Melepas busi saat mesin menyala'],a:[0,1],e:'Mesin harus dingin dan APD dipakai.'},
   {t:'kategori',q:'Tentukan benar atau salah.',rows:[['Celah busi mengikuti manual servis',true],['Busi boleh dipasang tanpa dibersihkan dari kotoran',false]],e:'Ikuti manual servis dan pastikan bersih.'}],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},validation:{vehicle:true,evidence:true,cause:true,conclusion:true,atLeastOneCheck:true}};
 return m;
}
async function lkioTemplate(){
 if(!lkioOk())return;
 try{
  var res=await fetch('templates/Template_Impor_LKPD.xlsx',{cache:'no-cache'});
  if(res.ok){
   var url=URL.createObjectURL(await res.blob()),el=document.createElement('a');
   el.href=url;el.download='Template_Impor_LKPD.xlsx';document.body.appendChild(el);el.click();el.remove();
   setTimeout(function(){URL.revokeObjectURL(url)},4000);return;
  }
 }catch(e){}
 lkioTemplateFallback();
}
function lkioTemplateFallback(){
 if(!lkioOk())return;
 if(typeof needX==='function'&&!needX())return;
 lkioWrite([lkioExample()],'Template_Impor_LKPD.xlsx');
}

/* ============================================================
   IMPOR: baca dan validasi
   ============================================================ */
function lkioSheetKey(name){
 var k=lkioKey(name),f=null;
 Object.keys(LKIO_SHEET_ALIAS).forEach(function(s){if(LKIO_SHEET_ALIAS[s].indexOf(k)>-1)f=s});
 return f;
}
/* Mengubah isi sheet (hasil sheet_to_json) menjadi baris berkolom internal. Melempar Error bila kolom wajib hilang. */
function lkioRead(kind,raw){
 var map=LKIO_COLS[kind],cols={},rows=[];
 if(raw.length>LKIO.MAX_ROW)throw new Error('Sheet '+LKIO_SHEET[kind]+': maksimal '+LKIO.MAX_ROW+' baris.');
 if(raw.length)Object.keys(raw[0]).forEach(function(k){var c=map[lkioKey(k)];if(c)cols[c]=1});
 if(raw.length){
  if(!cols.id)throw new Error('Sheet '+LKIO_SHEET[kind]+': kolom ID Modul tidak ditemukan.');
  if(kind==='soal'&&!cols.q)throw new Error('Sheet Soal: kolom Soal tidak ditemukan.');
  if(kind==='modul'&&!cols.title&&!cols.dur&&!cols.status&&!cols.kelas)throw new Error('Sheet Modul: kolom Judul tidak ditemukan.');
 }
 raw.forEach(function(r,i){
  var o={},blank=true;
  Object.keys(r).forEach(function(k){
   var c=map[lkioKey(k)];
   if(String(r[k]).trim())blank=false;
   if(c&&(o[c]===undefined||o[c]===''))o[c]=r[k];
  });
  if(!blank)rows.push({f:o,line:i+2});
 });
 return rows;
}
function lkioLetters(v){
 var parts=String(v==null?'':v).toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean),u=[],bad=false;
 parts.forEach(function(x){
  if(!/^[A-H]$/.test(x)){bad=true;return}
  if(u.indexOf(x)<0)u.push(x);
 });
 return bad?null:u;
}
/* Satu baris sheet Soal menjadi satu soal. Mengembalikan {err} atau {q}. */
function lkioQuiz(r){
 var q0=lkioTxt(r.q),e=lkioTxt(r.bahas),i,tk=lkioKey(r.tipe),tipe;
 if(!q0)return {err:'Soal wajib diisi'};
 if(q0.length>5000)return {err:'Teks soal terlalu panjang (maksimal 5000 karakter)'};
 if(!tk){tipe=(lkioTxt(r.p0)||lkioTxt(r.p1))?'kategori':((lkioLetters(r.kunci)||[]).length>1?'kompleks':'pg')}
 else if(/kategori/.test(tk))tipe='kategori';
 else if(/kompleks/.test(tk))tipe='kompleks';
 else if(tk==='pg'||/pilihanganda/.test(tk))tipe='pg';
 else return {err:'Jenis harus PG, PG kompleks, atau PG kategori'};
 var q;
 if(tipe==='kategori'){
  var l0=lkioTxt(r.lab0)||'Benar',l1=lkioTxt(r.lab1)||'Salah',rows=[];
  if(lkioKey(l0)===lkioKey(l1))return {err:'Label 1 dan Label 2 harus berbeda'};
  for(i=0;i<LKIO.MAX_ROW_KAT;i++){
   var t=lkioTxt(r['p'+i]);if(!t)continue;
   var kk=lkioKey(r['k'+i]),val;
   if(kk&&(kk===lkioKey(l0)||kk==='1'))val=true;
   else if(kk&&(kk===lkioKey(l1)||kk==='2'))val=false;
   else return {err:'Kunci '+(i+1)+' harus berisi "'+l0+'" atau "'+l1+'"'};
   rows.push([t,val]);
  }
  if(rows.length<2)return {err:'PG kategori butuh minimal 2 pernyataan'};
  q={t:'kategori',q:q0,rows:rows};
  if(l0!=='Benar'||l1!=='Salah')q.lab=[l0,l1];
 }else{
  var map=[],opts=[];
  for(i=0;i<LKIO.MAX_OPT;i++){var o=lkioTxt(r['o'+i]);if(o){map[i]=opts.length;opts.push(o)}}
  if(opts.length<(tipe==='pg'?2:3))return {err:tipe==='pg'?'PG butuh minimal 2 pilihan':'PG kompleks butuh minimal 3 pilihan'};
  var ks=lkioLetters(r.kunci);
  if(ks===null)return {err:'Kunci hanya boleh berisi huruf A sampai H'};
  if(!ks.length)return {err:'Kunci wajib diisi'};
  ks=ks.map(function(x){return x.charCodeAt(0)-65});
  var bad=ks.filter(function(x){return map[x]===undefined});
  if(bad.length)return {err:'Kunci '+bad.map(lkioLtr).join(',')+' menunjuk pilihan yang kosong'};
  ks=ks.map(function(x){return map[x]}).sort(function(a,b){return a-b});
  if(tipe==='pg'){
   if(ks.length!==1)return {err:'PG hanya boleh satu kunci'};
   q={q:q0,o:opts,a:ks[0]};
  }else q={t:'kompleks',q:q0,o:opts,a:ks};
 }
 if(e)q.e=e;
 return lkqValid(q)?{q:q}:{err:'Format soal tidak valid'};
}
/* Membangun satu modul dari baris-barisnya. ex = modul yang sudah ada (atau null).
   Mengembalikan {m} atau {errs:[{sheet,line,msg}]}. */
function lkioBuild(id,mr,sec,present,ex){
 var errs=[];
 function E(sh,line,msg){errs.push({sheet:sh,line:line,msg:msg})}
 var base=ex?lkSerialize(ex):{id:id,version:1,title:'',kelas:'',fase:'',unit:'',duration:0,skkni:'',status:'draft',active:true,
  objectives:[],theory:[],tools:[],safety:[],steps:[],checks:[],symptoms:[],quiz:[],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:true,evidence:true,cause:true,conclusion:true,atLeastOneCheck:true}};
 var m=JSON.parse(JSON.stringify(base)),f=mr?mr.f:{},ln=mr?mr.line:0,v;
 m.id=id;m.version=base.version||1;

 /* --- sheet Modul --- */
 if(lkioTxt(f.title))m.title=lkioTxt(f.title);
 if(lkioTxt(f.unit))m.unit=lkioTxt(f.unit);
 if(lkioTxt(f.skkni))m.skkni=lkioTxt(f.skkni)==='-'?'':lkioTxt(f.skkni);
 if(lkioTxt(f.kelas)){
  var k=lkioTxt(f.kelas).toUpperCase();
  if(!KELAS[k])E('modul',ln,'Kelas harus '+Object.keys(KELAS).join(', '));else m.kelas=k;
 }
 if(lkioTxt(f.fase))m.fase=lkioTxt(f.fase).toUpperCase();
 else if(!ex&&KELAS[m.kelas])m.fase=KELAS[m.kelas].fase;
 if(!m.title&&!ex)E('modul',ln,'Judul wajib diisi');
 if(!m.unit&&!ex)E('modul',ln,'Unit praktik wajib diisi');
 if(!m.kelas&&!ex&&!lkioTxt(f.kelas))E('modul',ln,'Kelas wajib diisi');

 var st=lkioKey(f.status);
 if(st){
  if(['terbit','published','tampil','publish'].indexOf(st)>-1)m.status='published';
  else if(st==='draft'||st==='draf')m.status='draft';
  else E('modul',ln,'Status harus Draft atau Terbit');
 }
 v=lkioBool(f.aktif);
 if(v===null)E('modul',ln,'Aktif harus Ya atau Tidak');else if(v!==undefined)m.active=v;

 /* --- bagian berbaris --- */
 function need(key,label,arr){if(present[key]||!ex){if(!arr.length)E(key,0,'Tidak ada baris '+label+' untuk modul ini (minimal satu)')}}
 function lines(key,label){
  var out=[];
  (sec[key]||[]).forEach(function(r){var t=lkioTxt(r.f.a);if(t)out.push(t);else E(key,r.line,'Isi kosong')});
  need(key,label,out);return out;
 }
 if(present.tujuan||!ex)m.objectives=lines('tujuan','tujuan');
 if(present.alat||!ex)m.tools=lines('alat','alat dan bahan');
 if(present.k3||!ex)m.safety=lines('k3','K3');
 if(present.gejala||!ex)m.symptoms=lines('gejala','gejala').filter(Boolean);
 if(present.gejala&&!(sec.gejala||[]).length)m.symptoms=[];
 if(!present.gejala&&!ex)m.symptoms=[];
 if(present.teori||!ex){
  m.theory=[];
  (sec.teori||[]).forEach(function(r){
   var a=lkioTxt(r.f.a),b=lkioTxt(r.f.b);
   if(!a||!b){E('teori',r.line,'Topik dan Penjelasan wajib diisi');return}
   m.theory.push([a,b]);
  });
  need('teori','teori',m.theory);
 }
 if(present.cek||!ex){
  m.checks=[];
  (sec.cek||[]).forEach(function(r){
   var a=lkioTxt(r.f.a),b=lkioTxt(r.f.b);
   if(!a||!b){E('cek',r.line,'Komponen dan Kriteria wajib diisi');return}
   m.checks.push([a,b]);
  });
  need('cek','pemeriksaan',m.checks);
 }
 var stepsChanged=false;
 if(present.langkah||!ex){
  stepsChanged=true;m.steps=[];
  (sec.langkah||[]).forEach(function(r){
   var a=lkioTxt(r.f.a),b=lkioTxt(r.f.b),n=lkioNum(r.f.m);
   if(!a||!b){E('langkah',r.line,'Judul dan Instruksi wajib diisi');return}
   if(n===null||isNaN(n)||!(n>0)){E('langkah',r.line,'Menit harus angka lebih dari 0');return}
   m.steps.push([a,n,b]);
  });
  need('langkah','langkah',m.steps);
 }

 /* --- durasi dan bobot --- */
 var du=lkioNum(f.dur);
 if(du===null){
  if(stepsChanged)m.duration=m.steps.reduce(function(t,x){return t+(Number(x[1])||0)},0);
 }else if(isNaN(du)||!(du>0)||du>600||Math.round(du)!==du)E('modul',ln,'Durasi harus bilangan bulat 1 sampai 600');
 else m.duration=du;
 m.rubric=Object.assign({},m.rubric);
 [['wsteps','steps','Bobot langkah'],['wsafety','safety','Bobot K3'],['wchecks','checks','Bobot pemeriksaan'],['wanalysis','analysis','Bobot analisis'],
  ['wpractice','practiceWeight','Bobot praktik'],['wtheory','theoryWeight','Bobot teori']].forEach(function(w){
  var n=lkioNum(f[w[0]]);
  if(n===null)return;
  if(isNaN(n)||n<0)E('modul',ln,w[2]+' harus angka 0 atau lebih');else m.rubric[w[1]]=n;
 });
 var vs=lkioTxt(f.valid);
 if(vs){
  m.validation={};
  if(['-','tidakada','kosong','none'].indexOf(lkioKey(vs))<0||vs.length>12){
   if(vs!=='-'&&['tidakada','kosong','none'].indexOf(lkioKey(vs))<0)vs.split(/[,;\n]/).map(function(x){return x.trim()}).filter(Boolean).forEach(function(x){
    var c=LKIO_VKEYS.find(function(y){return y.toLowerCase()===x.toLowerCase()});
    if(!c)E('modul',ln,'Kunci validasi tidak dikenal: '+x);else m.validation[c]=true;
   });
  }
 }

 /* --- pengaturan mode --- */
 /* Pengaturan hanya ditulis bila berbeda dari pengaturan yang berlaku, supaya berkas hasil ekspor yang diimpor ulang tidak dianggap perubahan. */
 var cfg=lkmCfg(base);
 function setCfg(k,val){if(val!==cfg[k])m[k]=val}
 var mo=lkioKey(f.mode);
 if(mo){if(mo==='latihan'||mo==='ujian')setCfg('mode',mo);else E('modul',ln,'Mode harus Ujian atau Latihan')}
 var tr=lkioNum(f.tries);
 if(tr!==null){if(isNaN(tr)||tr<0||tr>10||Math.round(tr)!==tr)E('modul',ln,'Kesempatan harus bilangan bulat 0 sampai 10');else setCfg('maxTry',tr)}
 else if(lkioKey(f.tries)==='tidakterbatas')setCfg('maxTry',0);
 [['showKey','Tampilkan kunci','showKey'],['hTeori','Sembunyikan teori','hideTeori'],['hLangkah','Sembunyikan langkah','hideLangkah'],['hPetunjuk','Sembunyikan petunjuk','hidePetunjuk']].forEach(function(p){
  var b=lkioBool(f[p[0]]);
  if(b===null)E('modul',ln,p[1]+' harus Ya atau Tidak');else if(b!==undefined)setCfg(p[2],b);
 });
 ['buka','tutup'].forEach(function(k){
  var d=lkioDT(f[k]);
  if(d===null)E('modul',ln,(k==='buka'?'Buka':'Tutup')+' tidak valid. Pakai format 2026-11-12 08:00');
  else if(d==='')delete m[k];
  else if(d!==undefined&&d!==cfg[k])m[k]=d;
 });
 if(m.buka&&m.tutup&&m.tutup<=m.buka)E('modul',ln,'Waktu Tutup harus setelah Buka');

 /* --- foto wajib --- */
 var fs=lkioTxt(f.foto);
 if(fs){
  var kf=lkioKey(fs);
  if(kf==='semua')m.fotoWajib=m.checks.map(function(c,i){return i});
  else if(fs==='-'||kf==='tidakada'||kf==='kosong')m.fotoWajib=[];
  else{
   var idx=[];
   fs.split(/[,;\s]+/).filter(Boolean).forEach(function(x){
    var n=Number(x);
    if(!Number.isInteger(n)||n<1||n>m.checks.length)E('modul',ln,'Foto wajib: nomor '+x+' di luar daftar Pemeriksaan (1 sampai '+m.checks.length+')');
    else if(idx.indexOf(n-1)<0)idx.push(n-1);
   });
   m.fotoWajib=idx.sort(function(a,b){return a-b});
  }
 }else if(ex&&Array.isArray(ex.fotoWajib)&&present.cek){
  /* pemeriksaan diganti: pertahankan foto wajib untuk komponen bernama sama (seperti Editor Guru) */
  var nm=ex.fotoWajib.map(function(i){return ex.checks[i]&&ex.checks[i][0]}).filter(Boolean);
  m.fotoWajib=[];m.checks.forEach(function(c,i){if(nm.indexOf(c[0])>-1)m.fotoWajib.push(i)});
 }

 /* --- soal --- */
 if(present.soal||!ex){
  m.quiz=[];
  /* penanda asal soal bank (src) dipertahankan untuk soal yang jenis dan teksnya tidak berubah */
  var srcOf={};(base.quiz||[]).forEach(function(q){if(q.src)srcOf[lkqType(q)+'|'+q.q]=q.src});
  (sec.soal||[]).forEach(function(r){
   var b=lkioQuiz(r.f);
   if(b.err)E('soal',r.line,b.err);
   else{var sk=lkqType(b.q)+'|'+b.q.q;if(srcOf[sk])b.q.src=srcOf[sk];m.quiz.push(b.q)}
  });
  need('soal','soal',m.quiz);
  if(lkBuiltin(id))m.quizV=LKQ.VER;
 }

 if(errs.length)return {errs:errs};
 var ve=lkValidateModule(m);
 if(ve)return {errs:[{sheet:'modul',line:ln,msg:ve}]};
 if(JSON.stringify(m).length>LKIO.MAX_JSON)return {errs:[{sheet:'modul',line:ln,msg:'Modul terlalu besar untuk disimpan (maksimal sekitar 450 KB)'}]};
 return {m:m};
}
/* Memproses data hasil baca. data={rows:{modul:[..],...},present:{modul:true,...}}. Tanpa efek samping. */
function lkioProcess(data){
 var res={add:[],upd:[],same:0,err:[]},rows=data.rows,present=data.present,order=[],seen={},mrow={},sec={};
 function bad(id,sh,line,msg){res.err.push({id:id,sheet:LKIO_SHEET[sh]||sh,line:line,msg:msg})}
 function idOk(id){return /^[A-Za-z0-9_-]{2,32}$/.test(id)}
 var rejected={};
 (rows.modul||[]).forEach(function(r){
  var id=lkioTxt(r.f.id);
  if(!id){bad('-','modul',r.line,'ID Modul kosong');return}
  if(!idOk(id)){bad(id,'modul',r.line,'ID Modul harus 2-32 karakter: huruf, angka, _ atau -');rejected[id]=1;return}
  if(seen[id]){bad(id,'modul',r.line,'ID Modul ganda di dalam file');rejected[id]=1;return}
  seen[id]=1;order.push(id);mrow[id]=r;
 });
 ['tujuan','teori','alat','k3','langkah','cek','gejala','soal'].forEach(function(k){
  (rows[k]||[]).forEach(function(r){
   var id=lkioTxt(r.f.id);
   if(!id){bad('-',k,r.line,'ID Modul kosong');return}
   (sec[id]=sec[id]||{})[k]=(sec[id][k]||[]).concat([r]);
   if(!seen[id]&&!rejected[id]){
    seen[id]=2;order.push(id); /* hanya muncul di sheet bagian: boleh jika modulnya sudah ada */
   }
  });
 });
 if(order.length>LKIO.MAX_MOD)throw new Error('Maksimal '+LKIO.MAX_MOD+' modul per impor.');
 var have={};LKPD_MODULES.forEach(function(m){have[m.id]=m});
 order.forEach(function(id){
  var ex=have[id]||null;
  if(!idOk(id)){bad(id,'modul',0,'ID Modul harus 2-32 karakter: huruf, angka, _ atau -');return}
  if(!mrow[id]&&!ex){
   var first=null;Object.keys(sec[id]||{}).forEach(function(k){if(!first)first=k});
   bad(id,first||'modul',((sec[id]||{})[first]||[{line:0}])[0].line,'ID tidak ada di sheet Modul dan belum ada sebagai modul. Tambahkan barisnya di sheet Modul');return;
  }
  /* sheet bagian yang ada di berkas tapi tanpa baris untuk modul ini dianggap mengosongkan bagian itu */
  var b=lkioBuild(id,mrow[id]||null,sec[id]||{},present,ex);
  if(b.errs){b.errs.forEach(function(e){bad(id,e.sheet,e.line,e.msg)});return}
  if(ex){
   if(lkioStable(lkioStrip(ex))===lkioStable(lkioStrip(b.m))){res.same++;return}
   res.upd.push({m:b.m,builtin:lkBuiltin(id),title:b.m.title});
  }else res.add.push({m:b.m,title:b.m.title});
 });
 return res;
}
async function lkioParse(file){
 if(typeof needX==='function'&&!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),data={rows:{},present:{}},any=false;
 wb.SheetNames.forEach(function(n){
  var k=lkioSheetKey(n);if(!k||data.present[k])return;
  data.present[k]=true;any=true;
  data.rows[k]=lkioRead(k,XLSX.utils.sheet_to_json(wb.Sheets[n],{defval:'',raw:false}));
 });
 if(!any)throw new Error('Tidak ada sheet yang dikenali (Modul, Soal, dan lainnya). Pakai template dari tombol Template.');
 var total=Object.keys(data.rows).reduce(function(t,k){return t+data.rows[k].length},0);
 if(!total)throw new Error('Tidak ada baris data. Pakai template dari tombol Template.');
 lkRefreshModules();
 return lkioProcess(data);
}
async function lkioApply(){
 var m=LKIO.imp;if(!m||LKIO.busy||!lkioOk())return;
 var tot=m.add.length+m.upd.length;if(!tot)return;
 var nb=m.upd.filter(function(x){return x.builtin}).length;
 if(nb){
  var ok=await uiConfirm(nb+' modul bawaan akan diganti dengan salinan dari berkas ini. Berkas bawaan tidak berubah dan data pengumpulan siswa tetap aman. Lanjutkan?',{ok:'Terapkan'});
  if(!ok)return;
 }
 LKIO.busy=true;render();
 try{
  m.add.concat(m.upd).forEach(function(x){lkModuleStore(x.m)});
 }catch(e){toast('Gagal menyimpan: '+((e&&e.message)||e))}
 finally{LKIO.busy=false;LKIO.imp=null}
 toast(tot+' modul diproses');
 render();
 setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500);
}

/* ============================================================
   Tampilan
   ============================================================ */
function lkioOk(){return !!S.user&&isStaff()}
function lkioHtml(){
 if(!lkioOk())return '';
 var n=lkcModules(S.kelas,true).length,N=(LKPD_MODULES||[]).length;
 var h='<div class="row" style="flex-wrap:wrap;gap:6px"><label class="btn small filebtn">Impor modul<input id="lkioimp" type="file" accept=".xlsx,.xls,.csv" hidden></label>'+
  '<button type="button" class="btn small" data-lkio="tpl">Template</button>'+
  '<button type="button" class="btn small" data-lkio="exp-kelas"'+(n?'':' disabled')+'>Ekspor '+lkEsc(lkcKelasInfo(S.kelas).judul)+' ('+n+')</button>'+
  '<button type="button" class="btn small" data-lkio="exp-all"'+(N?'':' disabled')+'>Ekspor semua ('+N+')</button></div>';
 var m=LKIO.imp;
 if(m){
  var tot=m.add.length+m.upd.length,nb=m.upd.filter(function(x){return x.builtin}).length,bad={};
  m.err.forEach(function(x){bad[x.id]=(bad[x.id]||0)+1});
  var errIds=Object.keys(bad);
  h+='<div class="card"><h3>Pratinjau impor modul</h3><div class="row" style="flex-wrap:wrap;gap:6px"><span class="pill ok">'+m.add.length+' baru</span><span class="pill">'+m.upd.length+' diperbarui</span>'+
   '<span class="pill plain">'+m.same+' tanpa perubahan</span><span class="pill '+(errIds.length?'bad':'plain')+'">'+errIds.length+' modul ditolak</span></div>'+
   (m.add.length||m.upd.length?'<ul class="plain note">'+m.add.slice(0,6).map(function(x){return '<li>Baru: '+esc(x.m.id)+' · '+esc(x.title)+'</li>'}).join('')+
    m.upd.slice(0,6).map(function(x){return '<li>Perbarui: '+esc(x.m.id)+' · '+esc(x.title)+(x.builtin?' (bawaan)':'')+'</li>'}).join('')+
    (tot>12?'<li>dan '+(tot-Math.min(m.add.length,6)-Math.min(m.upd.length,6))+' lainnya</li>':'')+'</ul>':'')+
   (nb?'<p class="note">'+nb+' modul bawaan akan diganti dengan salinan. Berkas bawaan tidak berubah.</p>':'')+
   (m.add.some(function(x){return x.m.status!=='published'})||m.upd.some(function(x){return x.m.status!=='published'})?'<p class="note">Modul berstatus Draft tidak terlihat siswa sampai diterbitkan.</p>':'')+
   (m.err.length?'<p class="note"><b>Ditolak (modul diproses utuh, tidak ada yang disimpan sebagian):</b></p><ul class="plain note">'+m.err.slice(0,10).map(function(x){return '<li>'+esc(x.id)+' · sheet '+esc(x.sheet)+(x.line?' baris '+x.line:'')+': '+esc(x.msg)+'</li>'}).join('')+(m.err.length>10?'<li>dan '+(m.err.length-10)+' lainnya</li>':'')+'</ul>':'')+
   '<div class="row"><button type="button" class="btn" data-lkio="cancel"'+(LKIO.busy?' disabled':'')+'>Batal</button><button type="button" class="btn primary grow" data-lkio="apply"'+(tot&&!LKIO.busy?'':' disabled')+'>'+(LKIO.busy?'Menyimpan…':'Terapkan '+tot+' modul')+'</button></div></div>';
 }
 return h;
}
var _lkioList=lkListView;
lkListView=function(){
 var h=_lkioList.apply(this,arguments);
 if(!lkioOk())return h;
 /* tombol Ekspor di tiap kartu modul */
 try{
  lkcModules(S.kelas,true).forEach(function(m){
   var k='data-act="lkc-edit" data-v="'+lkEsc(m.id)+'">Edit</button>',i=h.indexOf(k);
   if(i>-1)h=h.slice(0,i+k.length)+'<button type="button" class="btn small" data-lkio="exp-one" data-v="'+lkEsc(m.id)+'">Ekspor</button>'+h.slice(i+k.length);
  });
 }catch(e){}
 /* blok impor/ekspor setelah baris tombol Modul baru */
 var key='data-act="lkc-new">+ Modul baru</button>',j=h.indexOf(key);
 if(j<0)return lkioHtml()+h;
 var end=h.indexOf('</div>',j);
 return end<0?h+lkioHtml():h.slice(0,end+6)+lkioHtml()+h.slice(end+6);
};

/* ---------- Aksi ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lkio]');if(!b)return;
 var a=b.dataset.lkio;
 if(a==='tpl')lkioTemplate();
 else if(a==='exp-kelas')lkioExport('kelas');
 else if(a==='exp-all')lkioExport('all');
 else if(a==='exp-one')lkioExport('one',b.dataset.v);
 else if(a==='cancel'&&!LKIO.busy){LKIO.imp=null;render()}
 else if(a==='apply')lkioApply();
});
document.addEventListener('change',async function(e){
 if(e.target.id!=='lkioimp')return;
 var f=e.target.files[0];if(!f)return;
 if(!lkioOk()){e.target.value='';return}
 try{LKIO.imp=await lkioParse(f)}catch(err){LKIO.imp=null;toast((err&&err.message)||'Gagal membaca file')}
 e.target.value='';
 render();
});
