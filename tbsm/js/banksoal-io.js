/* banksoal-io.js: impor dan ekspor bank soal TKA (Excel) untuk Admin dan Guru.
   Berkas ini memperluas banksoal.js: menambah tombol Impor soal, Template, dan Ekspor Excel di tab Bank soal.
   - Ekspor: soal yang sedang tampil sesuai filter (semua soal bila filter kosong), termasuk soal bawaan.
   - Impor: pratinjau dulu, baru diterapkan. Baris tanpa ID menjadi soal baru; ID soal sendiri memperbarui soal itu;
     ID soal bawaan hanya mengubah Peruntukan, Kelas, dan Status (isi soal bawaan tidak diubah). */
var BSIO={imp:null,busy:false,MAX:500};

/* ---------- Pemetaan kepala kolom ---------- */
var BSIO_HEAD=['ID','Jenis','Mapel','Topik','Kelas','Peruntukan','Status','Soal','A','B','C','D','E','Kunci','Label 1','Label 2',
 'Pernyataan 1','Kunci 1','Pernyataan 2','Kunci 2','Pernyataan 3','Kunci 3','Pernyataan 4','Kunci 4','Pernyataan 5','Kunci 5','Pernyataan 6','Kunci 6','Pembahasan','Grup','Stimulus','Rubrik','Bobot','Batas karakter'];
var BSIO_HB={};
(function(){
 var H={id:['id','kodesoal','kode'],tipe:['jenis','tipe','jenissoal'],mapel:['mapel','matapelajaran','mapelajaran'],topik:['topik'],kelas:['kelas'],
  tujuan:['peruntukan','tujuan'],status:['status'],q:['soal','teksoal','pertanyaan'],kunci:['kunci','kuncijawaban'],lab0:['label1','pilihanpertama'],
  lab1:['label2','pilihankedua'],bahas:['pembahasan','bahas'],gs:['grup','kodegrup'],st:['stimulus','teksstimulus'],rubrik:['rubrik','kriteria','rubrikpenilaian'],bobot:['bobot'],pj:['bataskarakter','batasjawaban']};
 Object.keys(H).forEach(function(c){H[c].forEach(function(a){BSIO_HB[a]=c})});
 for(var i=0;i<5;i++){var L=String.fromCharCode(97+i);BSIO_HB[L]='o'+i;BSIO_HB['pilihan'+L]='o'+i}
 for(var j=1;j<=6;j++){BSIO_HB['pernyataan'+j]='p'+(j-1);BSIO_HB['kunci'+j]='k'+(j-1)}
})();
function bsioKey(v){return String(v==null?'':v).toLowerCase().replace(/[^a-z0-9]/g,'')}
function bsioNorm(v){return String(v==null?'':v).toLowerCase().replace(/\s+/g,' ').trim()}
function bsioTxt(v){return String(v==null?'':v).replace(/\r\n?/g,'\n').trim()}

/* ---------- Ekspor ---------- */
function bsioRow(s){
 var r=[s.id,BS_TIPE[s.tipe]||s.tipe,s.mapel||'',s.topik||'',s.kelas||'Semua',BS_TUJ[s.tujuan]||'Latihan dan ujian',s.aktif===false?'Nonaktif':'Aktif',s.q||''];
 var o=s.opts||[],i;
 for(i=0;i<5;i++)r.push(o[i]!==undefined?o[i]:'');
 if(s.tipe==='pg')r.push(typeof s.kunci==='number'?bsLtr(s.kunci):'');
 else if(s.tipe==='kompleks')r.push((Array.isArray(s.kunci)?s.kunci:[]).map(bsLtr).join(','));
 else if(s.tipe==='uraian')r.push(s.kj||'');
 else r.push('');
 if(s.tipe==='kategori'){
  var lab=s.lab||['Benar','Salah'];r.push(lab[0],lab[1]);
  for(i=0;i<6;i++){var x=(s.rows||[])[i];r.push(x?x[0]:'',x?(x[1]?lab[0]:lab[1]):'')}
 }else{r.push('','');for(i=0;i<6;i++)r.push('','')}
 r.push(s.bahas||'');
 r.push(s.gs||'',s.gs&&s.st&&!bsioPrevSama(s)?s.st:'');
 if(s.tipe==='uraian')r.push((s.rub||[]).map(function(k){return k[0]+' | '+k[1]}).join('\n'),s.bobot||2,s.pj||1500);
 else r.push('','','');
 return r;
}
/* stimulus ditulis hanya di baris pertama tiap grup pada daftar yang sedang diekspor */
var BSIO_SEEN=null;
function bsioPrevSama(s){if(!BSIO_SEEN)return false;if(BSIO_SEEN[s.gs])return true;BSIO_SEEN[s.gs]=1;return false}
function bsioExport(){
 if(!bsioOk())return;
 if(typeof needX==='function'&&!needX())return;
 var list=bsFiltered();
 if(!list.length){toast('Tidak ada soal untuk diekspor');return}
 BSIO_SEEN={};
 var aoa=[BSIO_HEAD].concat(list.map(bsioRow));
 BSIO_SEEN=null;
 var wb=XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb,sheet(aoa,[16,13,18,22,8,18,9,60,26,26,26,26,26,8,10,10,34,10,34,10,34,10,34,10,34,10,34,10,50,14,60,44,8,12]),'Soal');
 XLSX.utils.book_append_sheet(wb,sheet(bsioHelp(),[16,110]),'Petunjuk');
 XLSX.writeFile(wb,'bank-soal-tka-'+ymd(Date.now())+'.xlsx');
 toast(list.length+' soal diekspor');
}
function bsioHelp(){
 return [['Kolom','Aturan'],
  ['ID','Kosong = soal baru. Jika diisi dengan ID soal sendiri yang sudah ada, soal itu diperbarui. ID soal bawaan (tka-...) hanya mengubah Peruntukan, Kelas, dan Status.'],
  ['Jenis','PG, PG kompleks, PG kategori, atau Uraian. Kosong = ditebak dari kolom Kunci dan Pernyataan.'],
  ['Mapel','Wajib. Maksimal 64 karakter.'],
  ['Topik','Boleh kosong. Maksimal 120 karakter.'],
  ['Kelas','X, XI, XII, atau Semua (kosong = Semua).'],
  ['Peruntukan','Latihan, Ujian, atau Latihan dan ujian (kosong = Latihan dan ujian).'],
  ['Status','Aktif atau Nonaktif (kosong = Aktif untuk soal baru, tidak berubah untuk soal yang diperbarui).'],
  ['Soal','Wajib. Teks soal.'],
  ['A sampai E','Pilihan jawaban untuk PG dan PG kompleks. Wajib 5 pilihan (A sampai E), semuanya terisi.'],
  ['Kunci','PG: tepat satu huruf, misalnya B. PG kompleks: minimal dua huruf, misalnya A,C. Huruf mengikuti kolom A sampai E.'],
  ['Label 1, Label 2','PG kategori saja. Pilih satu pasangan: Benar dan Salah, atau Sesuai dan Tidak Sesuai (kosong = Benar dan Salah).'],
  ['Pernyataan 1-6, Kunci 1-6','PG kategori saja. Isi 3 sampai 6 pernyataan. Kunci berisi Label 1 atau Label 2 (atau angka 1 / 2).'],
  ['Pembahasan','Boleh kosong.'],
  ['Uraian: Soal, Kunci, Rubrik','Jenis Uraian dinilai guru, hanya untuk Ujian (Peruntukan kosong atau Latihan dan ujian otomatis menjadi Ujian). Kolom A sampai E dikosongkan. Kolom Kunci berisi kunci jawaban atau pedoman (teks bebas, maksimal 3000 karakter). Kolom Rubrik wajib: satu kriteria per baris di dalam sel (Alt+Enter), format  kriteria | skor, misalnya Menyebut 3 langkah dengan benar | 6. Maksimal 6 kriteria, tiap skor lebih dari 0, jumlah skor = skor maksimum soal (maksimal 100).'],
  ['Uraian: Bobot, Batas karakter','Bobot (0,5 sampai 10, kosong = 2) menentukan pengaruh soal uraian terhadap nilai akhir dibanding soal PG yang bobotnya 1. Batas karakter jawaban siswa 100 sampai 3000 (kosong = 1500).'],
  ['Grup, Stimulus','Soal grup (opsional). Baris dengan kode Grup yang sama (misalnya G1) berbagi satu stimulus, dan soalnya berurutan menurut urutan baris. Isi kolom Stimulus pada salah satu baris grup (cukup satu, atau samakan bila diisi di beberapa baris). Kode yang sama dipakai ulang pada impor berikutnya untuk mapel yang sama memperbarui grup itu. Kolom Grup kosong tidak mengubah keanggotaan grup soal yang sudah ada. Gambar stimulus tidak ikut Excel: tambahkan lewat form Ubah soal.'],
  ['Catatan','Soal baru yang jenis, mapel, dan teksnya sama persis dengan soal yang sudah ada dilewati, tidak digandakan. Maksimal '+BSIO.MAX+' baris per impor. Hapus baris contoh sebelum impor. File hasil Ekspor Excel bisa diimpor ulang.']];
}
async function bsioTemplate(){
 if(!bsioOk())return;
 /* Utamakan berkas siap pakai (ada dropdown Jenis, Mapel, Kelas, Peruntukan, Status). Cadangan: dibuat di peramban tanpa dropdown. */
 try{
  var res=await fetch('templates/Template_Impor_Bank_Soal.xlsx',{cache:'no-cache'});
  if(res.ok){
   var url=URL.createObjectURL(await res.blob()),el=document.createElement('a');
   el.href=url;el.download='Template_Impor_Bank_Soal.xlsx';document.body.appendChild(el);el.click();el.remove();
   setTimeout(function(){URL.revokeObjectURL(url)},4000);return;
  }
 }catch(e){}
 bsioTemplateFallback();
}
function bsioTemplateFallback(){
 if(!bsioOk())return;
 if(typeof needX==='function'&&!needX())return;
 var e=function(a){while(a.length<BSIO_HEAD.length)a.push('');return a};
 var ex=[
  e(['','PG','Dasar TBSM','Sistem pengapian','X','Latihan dan ujian','Aktif','Busi berfungsi untuk ...','Memutar poros engkol','Memercikkan api pada campuran bahan bakar','Mengalirkan oli','Mendinginkan mesin','Menyaring udara','B']),
  e(['','PG kompleks','Dasar TBSM','Sistem pelumasan','XI','Latihan','Aktif','Pilih semua fungsi oli mesin.','Melumasi','Mendinginkan','Membersihkan','Menambah volume bahan bakar','Mengurangi gesekan','A,B,C,E']),
  (function(){var r=e(['','PG kategori','Dasar TBSM','K3','Semua','Ujian','Aktif','Tentukan benar atau salah pernyataan berikut.','','','','','','','Benar','Salah','Helm wajib dipakai saat praktik uji jalan','Benar','Oli bekas boleh dibuang ke selokan','Salah','Celah busi mengikuti manual servis','Benar']);r[28]='Pembahasan boleh dikosongkan.';return r})()
 ];
 /* contoh soal grup: dua soal berbagi satu stimulus (kode Grup sama, stimulus diisi di baris pertama) */
 var g1=e(['','PG','Dasar TBSM','Alat ukur','X','Latihan dan ujian','Aktif','Berdasarkan data pada stimulus, diameter luar poros adalah ...','24,10 mm','24,50 mm','25,10 mm','25,50 mm','26,10 mm','A']),
  g2=e(['','PG','Dasar TBSM','Alat ukur','X','Latihan dan ujian','Aktif','Berdasarkan data pada stimulus, alat ukur yang paling tepat untuk mengukur diameter luar poros adalah ...','Mistar','Jangka sorong','Meteran gulung','Busur derajat','Penggaris siku','B']);
 g1[29]='G1';g1[30]='Hasil pengukuran diameter luar poros memakai jangka sorong: skala utama 24 mm, skala nonius 10 (garis ke-10 berimpit), ketelitian 0,01 mm.';g2[29]='G1';
 ex.push(g1,g2);
 var u1=e(['','Uraian','Dasar TBSM','Alat ukur','X','Ujian','Aktif','Jelaskan langkah membaca hasil ukur jangka sorong dan sebutkan ketelitiannya.','','','','','','Skala utama dibaca dahulu, lalu skala nonius yang berimpit dengan garis skala utama. Ketelitian 0,05 mm atau 0,02 mm sesuai alat.']);
 u1[31]='Menyebut skala utama dibaca lebih dulu | 4\nMenyebut skala nonius yang berimpit | 4\nMenyebut ketelitian alat | 2';u1[32]='2';u1[33]='1500';
 ex.push(u1);
 book([['Soal',[BSIO_HEAD].concat(ex),[16,13,18,22,8,18,9,60,26,26,26,26,26,8,10,10,34,10,34,10,34,10,34,10,34,10,34,10,50,14,60,44,8,12]],
  ['Petunjuk',bsioHelp(),[16,110]]],'Template_Impor_Bank_Soal');
}

/* ---------- Impor: baca dan validasi ---------- */
function bsioKelas(v){
 var k=String(v==null?'':v).trim().toUpperCase();
 if(!k||k==='SEMUA'||k==='ALL'||k==='-')return '';
 return ['X','XI','XII'].indexOf(k)>-1?k:null;
}
function bsioTujuan(v){
 var k=bsioKey(v);
 if(!k||k==='keduanya'||k==='semua'||k==='latihandanujian')return 'keduanya';
 if(k==='latihan'||k==='ujian')return k;
 return null;
}
function bsioStatus(v){
 var k=bsioKey(v);
 if(!k)return undefined;
 if(['aktif','ya','1','true'].indexOf(k)>-1)return true;
 if(['nonaktif','tidakaktif','tidak','0','false'].indexOf(k)>-1)return false;
 return null;
}
function bsioTipe(v){
 var k=bsioKey(v);
 if(!k)return '';
 if(/uraian|essay|esai/.test(k))return 'uraian';
 if(/kategori/.test(k))return 'kategori';
 if(/kompleks/.test(k))return 'kompleks';
 if(k==='pg'||/pilihanganda/.test(k))return 'pg';
 return '?';
}
function bsioLetters(v){
 var m=String(v==null?'':v).toUpperCase().match(/[A-E]/g)||[],u=[];
 m.forEach(function(x){if(u.indexOf(x)<0)u.push(x)});
 return u;
}
/* Mengubah satu baris menjadi isi soal. Mengembalikan {err} atau {f}. */
function bsioBuild(r,tipe){
 var f={tipe:tipe,mapel:bsioTxt(r.mapel).slice(0,64),topik:bsioTxt(r.topik).slice(0,120),q:bsioTxt(r.q),bahas:bsioTxt(r.bahas)},i;
 if(!f.mapel)return {err:'Mapel wajib diisi'};
 if(!f.q)return {err:'Soal wajib diisi'};
 if(f.q.length>5000)return {err:'Teks soal terlalu panjang (maksimal 5000 karakter)'};
 if(tipe==='uraian'){
  var rub=[],ls=bsioTxt(r.rubrik).split('\n').map(function(x){return x.trim()}).filter(Boolean);
  if(!ls.length)return {err:'Rubrik wajib diisi untuk soal uraian (format: kriteria | skor)'};
  if(ls.length>6)return {err:'Rubrik maksimal 6 kriteria'};
  for(i=0;i<ls.length;i++){
   var mm=/^(.*\S)\s*[|;]\s*([0-9]+(?:[.,][0-9]+)?)$/.exec(ls[i]);
   if(!mm)return {err:'Rubrik baris '+(i+1)+' harus berformat: kriteria | skor'};
   var sk=Math.round(parseFloat(mm[2].replace(',','.'))*100)/100;
   if(!(sk>0))return {err:'Skor rubrik baris '+(i+1)+' harus lebih dari 0'};
   rub.push([mm[1].slice(0,120),sk]);
  }
  var mk=Math.round(rub.reduce(function(a,x){return a+x[1]},0)*100)/100;
  if(mk>100)return {err:'Jumlah skor rubrik maksimal 100 (sekarang '+mk+')'};
  var bb=bsioTxt(r.bobot)?parseFloat(bsioTxt(r.bobot).replace(',','.')):2,pj=bsioTxt(r.pj)?parseInt(bsioTxt(r.pj),10):1500;
  if(!(bb>=0.5&&bb<=10))return {err:'Bobot harus antara 0,5 dan 10'};
  if(!(pj>=100&&pj<=3000))return {err:'Batas karakter harus antara 100 dan 3000'};
  f.rub=rub;f.maks=mk;f.bobot=bb;f.pj=pj;f.kj=bsioTxt(r.kunci).slice(0,3000);
  return {f:f};
 }
 if(tipe==='kategori'){
  var l0=bsioTxt(r.lab0)||'Benar',l1=bsioTxt(r.lab1)||'Salah',rows=[],li=bsLabIdx([l0,l1]);
  if(li<0)return {err:'Label harus Benar dan Salah, atau Sesuai dan Tidak Sesuai'};
  l0=BS_LABS[li][0];l1=BS_LABS[li][1];
  for(i=0;i<6;i++){
   var t=bsioTxt(r['p'+i]);if(!t)continue;
   var kk=bsioKey(r['k'+i]),val;
   if(kk&&(kk===bsioKey(l0)||kk==='1'))val=true;
   else if(kk&&(kk===bsioKey(l1)||kk==='2'))val=false;
   else return {err:'Kunci '+(i+1)+' harus berisi "'+l0+'" atau "'+l1+'"'};
   rows.push([t,val]);
  }
  if(rows.length<3)return {err:'PG kategori butuh 3 sampai 6 pernyataan'};
  f.lab=[l0,l1];f.rows=rows;
  return {f:f};
 }
 var map=[],opts=[];
 for(i=0;i<5;i++){var o=bsioTxt(r['o'+i]);if(o){map[i]=opts.length;opts.push(o)}}
 if(opts.length<5)return {err:(tipe==='pg'?'PG':'PG kompleks')+' wajib 5 pilihan (A sampai E), semuanya terisi'};
 var ks=bsioLetters(r.kunci).map(function(x){return x.charCodeAt(0)-65});
 if(!ks.length)return {err:'Kunci wajib diisi (huruf A sampai E)'};
 var bad=ks.filter(function(x){return map[x]===undefined});
 if(bad.length)return {err:'Kunci '+bad.map(bsLtr).join(',')+' menunjuk pilihan yang kosong'};
 ks=ks.map(function(x){return map[x]}).sort(function(a,b){return a-b});
 if(tipe==='pg'){if(ks.length!==1)return {err:'PG hanya boleh satu kunci'};f.kunci=ks[0]}
 else{if(ks.length<2)return {err:'PG kompleks butuh minimal 2 kunci'};f.kunci=ks}
 f.opts=opts;
 return {f:f};
}
/* Memproses baris hasil baca Excel (sudah dipetakan ke nama kolom internal). Tanpa efek samping. */
function bsioProcess(rows){
 var res={add:[],upd:[],bw:[],err:[],dup:0},all=bsSoalAll(),have={},ownIds={},seenId={},seenKey={},me=(S.user&&S.user.nama?S.user.nama:'').slice(0,64),GR={},gcnt={},gbase={};
 all.forEach(function(s){have[[s.tipe,bsioNorm(s.mapel),bsioNorm(s.q)].join('|')]=1});
 BS.D.soal.forEach(function(d){if(!BS_IDX[d.id])ownIds[d.id]=d});
 /* grup: kode di file -> penanda grup (dipakai ulang bila sudah ada di Bank soal), teks stimulus, dan konflik antarbaris */
 function gsDari(code,mapel){
  if(BS.D.soal.some(function(d){return d.gs===code&&!BS_IDX[d.id]}))return code;
  return 'gi-'+bsioKey(mapel).slice(0,20)+'-'+bsioKey(code).slice(0,20);
 }
 var gMax=(window.SGR&&SGR.MAXT)||3000;
 rows.forEach(function(r,idx){
  var code=bsioTxt(r.gs).slice(0,60);if(!code)return;
  var g=gsDari(code,bsioTxt(r.mapel).slice(0,64)),t=bsioTxt(r.st),x=GR[g]||(GR[g]={st:'',line:idx+2,conf:0});
  if(t){if(x.st&&x.st!==t)x.conf=idx+2;else if(!x.st)x.st=t.slice(0,gMax)}
 });
 rows.forEach(function(r,idx){
  var line=idx+2,id=bsioTxt(r.id);
  function bad(m){res.err.push({line:line,msg:m})}
  var kelas=bsioKelas(r.kelas);if(kelas===null)return bad('Kelas harus X, XI, XII, atau Semua');
  var tuj=bsioTujuan(r.tujuan);if(tuj===null)return bad('Peruntukan harus Latihan, Ujian, atau Latihan dan ujian');
  var st=bsioStatus(r.status);if(st===null)return bad('Status harus Aktif atau Nonaktif');
  if(id){if(seenId[id])return bad('ID ganda di dalam file ('+id+')');seenId[id]=1}
  /* soal bawaan: hanya peruntukan, kelas, status */
  if(id&&BS_IDX[id]){
   var cur=bsSoalById(id),patch={};
   if(bsioTxt(r.tujuan)&&tuj!==cur.tujuan)patch.tujuan=tuj;
   if(String(r.kelas==null?'':r.kelas).trim()&&kelas!==(cur.kelas||''))patch.kelas=kelas;
   if(st!==undefined&&st!==(cur.aktif!==false))patch.aktif=st;
   if(!Object.keys(patch).length){res.dup++;return}
   res.bw.push({id:id,patch:patch,q:cur.q});return;
  }
  var tipe=bsioTipe(r.tipe);
  if(tipe==='?')return bad('Jenis harus PG, PG kompleks, PG kategori, atau Uraian');
  if(!tipe){
   if(bsioTxt(r.rubrik))tipe='uraian';
   else if(bsioTxt(r.p0)||bsioTxt(r.p1))tipe='kategori';
   else tipe=bsioLetters(r.kunci).length>1?'kompleks':'pg';
  }
  var b=bsioBuild(r,tipe);if(b.err)return bad(b.err);
  var f=b.f,ex=id?ownIds[id]:null;
  f.kelas=kelas;f.tujuan=tuj;
  if(tipe==='uraian'){if(tuj==='latihan')return bad('Soal uraian hanya untuk Ujian');f.tujuan='ujian'}
  var code=bsioTxt(r.gs).slice(0,60);
  if(code){
   var g=gsDari(code,f.mapel),gi=GR[g],mem=BS.D.soal.filter(function(d){return d.gs===g&&!BS_IDX[d.id]&&(d.st||d.si)})[0],memSi=BS.D.soal.filter(function(d){return d.gs===g&&!BS_IDX[d.id]&&d.si})[0];
   if(gi.conf)return bad('Stimulus grup "'+code+'" berbeda di baris '+gi.conf+'. Samakan atau isi di satu baris saja');
   if(!gi.st&&!(mem&&(mem.st||mem.si)))return bad('Stimulus grup "'+code+'" kosong. Isi kolom Stimulus pada salah satu baris grup');
   f.gs=g;f.st=gi.st||(mem&&mem.st)||'';
   if(!f.st)delete f.st;
   if(memSi)f.si=memSi.si;
   if(ex&&ex.gs===g)f.gn=ex.gn||1;
   else{
    if(gbase[g]===undefined)gbase[g]=window.sgrGnBaru?sgrGnBaru(g,ex&&ex.id):1;
    f.gn=gbase[g]+(gcnt[g]=(gcnt[g]===undefined?0:gcnt[g]+1));
   }
  }
  if(ex){
   var o=Object.assign({},ex);
   delete o.opts;delete o.kunci;delete o.rows;delete o.lab;delete o.rub;delete o.kj;delete o.maks;delete o.bobot;delete o.pj;
   Object.assign(o,f);o.ts=Date.now();o.aktif=st===undefined?ex.aktif!==false:st;o.oleh=ex.oleh||me;
   res.upd.push(o);return;
  }
  var key=[tipe,bsioNorm(f.mapel),bsioNorm(f.q)].join('|');
  if(have[key]||seenKey[key]){res.dup++;return}
  seenKey[key]=1;
  var nid=id&&/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(id)&&!BS_IDX[id]?id:uid();
  var n=Object.assign({id:nid,ts:Date.now(),aktif:st===undefined?true:st,oleh:me},f);
  res.add.push(n);
 });
 return res;
}
async function bsioParse(file){
 if(typeof needX==='function'&&!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
 var ws=wb.Sheets['Soal']||wb.Sheets[wb.SheetNames[0]];
 var raw=ws?XLSX.utils.sheet_to_json(ws,{defval:'',raw:false}):[];
 if(!raw.length)throw new Error('Tidak ada baris data. Pakai template dari tombol Template.');
 if(raw.length>BSIO.MAX)throw new Error('Maksimal '+BSIO.MAX+' baris per impor.');
 var cols={};Object.keys(raw[0]).forEach(function(k){var c=BSIO_HB[bsioKey(k)];if(c)cols[c]=1});
 if(!cols.q||!cols.mapel)throw new Error('Kolom Mapel dan Soal tidak ditemukan. Pakai template dari tombol Template.');
 var rows=[];
 raw.forEach(function(r){
  var o={},blank=true;
  Object.keys(r).forEach(function(k){
   var c=BSIO_HB[bsioKey(k)];
   if(String(r[k]).trim())blank=false;
   if(c&&(o[c]===undefined||o[c]===''))o[c]=r[k];
  });
  rows.push(blank?null:o);
 });
 /* baris kosong dibuang, nomor baris tetap mengikuti file */
 var keep=[],map=[];rows.forEach(function(r,i){if(r){keep.push(r);map.push(i)}});
 if(!keep.length)throw new Error('Tidak ada baris data. Pakai template dari tombol Template.');
 var res=bsioProcess(keep);
 res.err.forEach(function(e){e.line=map[e.line-2]+2});
 return res;
}
async function bsioApply(){
 var m=BSIO.imp;if(!m||BSIO.busy||!bsioOk())return;
 BSIO.busy=true;render();
 var pend=0,i,jobs=m.add.concat(m.upd);
 try{
  for(i=0;i<jobs.length;i++){var ok=await bsPut('soal',jobs[i]);if(!ok&&Cloud.on)pend++;if(jobs[i].gs&&window.sgrSebar)sgrSebar(jobs[i])}
  for(i=0;i<m.bw.length;i++){var ok2=await bsOverride(m.bw[i].id,m.bw[i].patch);if(!ok2&&Cloud.on)pend++}
 }finally{BSIO.busy=false;BSIO.imp=null;BS.all=null}
 toast((m.add.length+m.upd.length+m.bw.length)+' soal diproses'+(pend?' ('+pend+' menunggu terkirim)':''));
 render();
}

/* ---------- Tampilan ---------- */
function bsioOk(){return !!S.user&&bsEdit()&&actRole()!=='siswa'}
function bsioHtml(){
 if(!bsioOk())return '';
 var n=bsFiltered().length;
 var h='<div class="row"><label class="btn small filebtn">Impor soal<input id="bsimpfile" type="file" accept=".xlsx,.xls,.csv" hidden></label>'+
  '<button type="button" class="btn small" data-bs="bsio-tpl">Template</button>'+
  '<button type="button" class="btn small" data-bs="bsio-exp"'+(n?'':' disabled')+'>Ekspor Excel ('+n+')</button></div>';
 var m=BSIO.imp;
 if(m){
  var tot=m.add.length+m.upd.length+m.bw.length;
  h+='<div class="card"><h3>Pratinjau impor soal</h3><div class="row"><span class="pill ok">'+m.add.length+' baru</span><span class="pill">'+m.upd.length+' diperbarui</span>'+
   (m.bw.length?'<span class="pill">'+m.bw.length+' soal bawaan diatur</span>':'')+
   '<span class="pill plain">'+m.dup+' dilewati</span><span class="pill '+(m.err.length?'bad':'plain')+'">'+m.err.length+' ditolak</span></div>'+
   (m.err.length?'<ul class="plain note">'+m.err.slice(0,8).map(function(x){return '<li>Baris '+x.line+': '+esc(x.msg)+'</li>'}).join('')+(m.err.length>8?'<li>dan '+(m.err.length-8)+' lainnya</li>':'')+'</ul>':'')+
   '<div class="row"><button type="button" class="btn" data-bs="bsio-cancel"'+(BSIO.busy?' disabled':'')+'>Batal</button><button type="button" class="btn primary grow" data-bs="bsio-apply"'+(tot&&!BSIO.busy?'':' disabled')+'>'+(BSIO.busy?'Menyimpan…':'Terapkan '+tot+' soal')+'</button></div></div>';
 }
 return h;
}
var _bsioViewBank=bsViewBank;
bsViewBank=function(){
 var h=_bsioViewBank.apply(this,arguments),k='data-bs="baru">Tambah soal sendiri</button>',i=h.indexOf(k);
 return i<0?bsioHtml()+h:h.slice(0,i+k.length)+bsioHtml()+h.slice(i+k.length);
};

/* ---------- Aksi ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-bs]');if(!b||b.tagName==='SELECT')return;
 var a=b.dataset.bs;
 if(a==='bsio-tpl')bsioTemplate();
 else if(a==='bsio-exp')bsioExport();
 else if(a==='bsio-cancel'&&!BSIO.busy){BSIO.imp=null;render()}
 else if(a==='bsio-apply')bsioApply();
});
document.addEventListener('change',async function(e){
 if(e.target.id!=='bsimpfile')return;
 var f=e.target.files[0];if(!f)return;
 if(!bsioOk()){e.target.value='';return}
 try{BSIO.imp=await bsioParse(f)}catch(err){BSIO.imp=null;toast((err&&err.message)||'Gagal membaca file')}
 e.target.value='';
 render();
});
