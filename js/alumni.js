/* alumni.js: modul Alumni dan Tracer Study (internal sekolah). Menu: Alumni dan Tracer.
   - Data alumni (NISN, nama, jurusan, tahun lulus, kontak, tautan atasan/DUDI) disimpan di koleksi `alumni` (Appwrite) atau di perangkat (mode lokal).
   - Form tracer tiga langkah meniru instrumen Tracer Vokasi Kemendikdasmen. Diisi oleh guru/admin (misalnya BKK) atas nama alumni; bukan pengganti portal resmi.
   - Dasbor ringkasan: status alumni, kesesuaian kerja, skor 15 aspek, daftar belum mengisi dengan pengingat WhatsApp.
   - Ekspor dan impor Excel. Peran Kepala Sekolah hanya melihat. Lihat docs-ALUMNI.md. */
var ALM={rows:null,loaded:false,busy:false,v:'list',cur:null,step:0,q:'',th:'',st:'',msg:''};
var AL_KOL='alumni',AL_LOCAL='tbsm-alumni',AL_PORTAL='https://tracervokasi.kemendikdasmen.go.id';
var AL_STATUS=[['bekerja','Bekerja'],['kuliah','Melanjutkan studi'],['wirausaha','Berwirausaha'],['lainnya','Kegiatan lainnya'],['menganggur','Belum bekerja/kuliah']];
var AL_DUDI=[['','Belum'],['diteruskan','Tautan diteruskan'],['terisi','Atasan sudah mengisi']];
var AL_S4=['Sangat tidak baik','Tidak baik','Baik','Sangat baik'];
var AL_ASP=['Belum memenuhi kebutuhan dunia kerja/usaha','Mendekati kebutuhan dunia kerja/usaha','Memenuhi kebutuhan dunia kerja/usaha','Melampaui kebutuhan dunia kerja/usaha'];
var AL_DMP=['Sangat tidak berdampak','Tidak berdampak','Berdampak','Sangat berdampak'];
var AL_ASPEK=['Fasilitas pembelajaran','Pembelajaran teori','Pembelajaran praktik/keterampilan','Bimbingan karier','Pembelajaran terkait budaya kerja','Pembelajaran terkait K-3','Pembelajaran bahasa asing','Pembelajaran teknologi informasi','Penanaman etika','Penanaman kejujuran','Penanaman tanggung jawab','Penanaman kedisiplinan','Kemampuan berkomunikasi','Kemampuan menyelesaikan masalah','Kemampuan bekerja sama dalam tim'];
var AL_YT=['Ya','Tidak'];
/* jurusan per sekolah: DF = Darul Fatwa, MEDINA = Medina Bandung. Kode disimpan di kolom prodi. */
var AL_PRODI_NAMA={TSM:'Teknik Sepeda Motor',TKR:'Teknik Kendaraan Ringan',TKJ:'Teknik Komputer dan Jaringan',OTKP:'Otomatisasi Tata Kelola Perkantoran'};
var AL_PRODI_SEK={DF:['TSM','TKJ'],MEDINA:['TSM','TKR','TKJ','OTKP']};
function alProdiList(sek){return AL_PRODI_SEK[sek]||['TSM','TKR','TKJ','OTKP']}
/* nama lengkap atau kode (huruf besar/kecil, tanda baca bebas) menjadi kode jurusan; tidak dikenal = teks apa adanya dalam huruf besar */
function alProdiKode(v){
 var t=String(v||'').trim();if(!t)return '';
 var u=t.toUpperCase().replace(/[^A-Z ]/g,'').replace(/\s+/g,' ').trim();
 if(AL_PRODI_NAMA[u])return u;
 for(var k in AL_PRODI_NAMA)if(AL_PRODI_NAMA[k].toUpperCase()===u)return k;
 return t.toUpperCase();
}
/* t: r radio, s pilihan, x teks, n angka, m kotak centang ganda, k skala 1-4 (disimpan sebagai angka) */
var AL_Q=[
 [
  {k:'kawin',l:'Status perkawinan',t:'s',o:['Belum menikah','Menikah','Lainnya']},
  {k:'kota',l:'Kab/kota tempat tinggal sekarang',t:'x'},
  {k:'kuliah',l:'Sedang melanjutkan studi di perguruan tinggi?',t:'r',o:AL_YT},
  {k:'kerja',l:'Dalam seminggu terakhir, sedang bekerja atau berwirausaha?',t:'r',o:AL_YT},
  {k:'jenisKerja',l:'Bentuk kegiatan/pekerjaan (isi bila bekerja atau berwirausaha)',t:'r',o:['Berwirausaha sendiri tanpa dibantu orang lain','Berwirausaha dengan dibantu buruh/pekerja tak dibayar','Berwirausaha dengan dibantu buruh/pekerja dibayar','Membantu menjalankan usaha/wirausaha keluarga','Buruh/karyawan/pegawai','Pekerja bebas (freelance / tidak punya majikan tetap)']}
 ],
 [
  {k:'sblLulus',l:'Sudah bekerja sebelum lulus SMK?',t:'r',o:AL_YT},
  {k:'pertama',l:'Kapan pertama kali mendapat pekerjaan setelah lulus (bulan-tahun, mis. 01-2025)',t:'x'},
  {k:'lokasi',l:'Lokasi tempat bekerja',t:'r',o:['Dalam negeri','Luar negeri']},
  {k:'jabatan',l:'Nama pekerjaan/jabatan saat ini',t:'x'},
  {k:'tempat',l:'Nama tempat bekerja',t:'x'},
  {k:'atasan',l:'Nama atasan langsung',t:'x'},
  {k:'jabAtasan',l:'Jabatan atasan langsung',t:'x'},
  {k:'kontakAtasan',l:'Email/nomor kontak atasan (tidak wajib)',t:'x'},
  {k:'instansi',l:'Jenis instansi/lembaga/perusahaan',t:'r',o:['Instansi pemerintah','Lembaga internasional','Lembaga non-profit (yayasan/LSM)','Lembaga profit (swasta/BUMN/BUMD)','Koperasi','Usaha perorangan','Rumah tangga']},
  {k:'jam',l:'Rata-rata jam kerja per minggu',t:'n'},
  {k:'gaji',l:'Gaji/upah per bulan',t:'r',o:['Kurang dari UMP','UMP sampai 1,2 UMP','Lebih dari 1,2 UMP']},
  {k:'ganti',l:'Berapa kali ganti pekerjaan sejak lulus?',t:'r',o:['Belum pernah','Satu kali','Dua kali','Tiga kali atau lebih']},
  {k:'info',l:'Dari mana informasi pekerjaan pertama?',t:'s',o:['Situs resmi pemerintah','Ikatan alumni','Layanan BKK SMK','Industri mitra SMK','Tempat magang/Prakerin/PKL','Iklan media cetak/online','Bursa kerja/job fair','Dinas ketenagakerjaan/LPK','Bantuan orang tua/famili/teman','Perusahaan/agen penyalur resmi','Platform pencarian kerja global','Program magang internasional/sukarelawan','Lainnya']},
  {k:'sesuai',l:'Kesesuaian pekerjaan dengan kompetensi keahlian di SMK',t:'r',o:['Sesuai','Tidak sesuai']},
  {k:'dibutuhkan',l:'Keahlian dari SMK dibutuhkan untuk pekerjaan saat ini?',t:'r',o:['Sangat dibutuhkan','Kurang dibutuhkan','Tidak dibutuhkan']},
  {k:'tingkat',l:'Tingkat pendidikan yang sesuai untuk pekerjaan saat ini',t:'r',o:['Lebih rendah dari SMK','Setingkat SMK/sederajat','Lebih tinggi dari SMK']}
 ],
 [
  {k:'alasan',l:'Alasan memilih SMK (boleh lebih dari satu)',t:'m',o:['Ingin cepat mendapat pekerjaan','Keinginan sendiri','Diajak teman','Keinginan orang tua/keluarga','Tidak diterima di sekolah lain','Lainnya']},
  {k:'lamaPkl',l:'Total lama Prakerin/PKL',t:'r',o:['Kurang dari 6 bulan','6 bulan','Lebih dari 6 bulan']},
  {k:'pklA',l:'Kualitas tempat Prakerin/PKL',t:'k',o:AL_S4},
  {k:'pklB',l:'Kesesuaian tugas Prakerin/PKL dengan program keahlian',t:'k',o:AL_S4},
  {k:'pklC',l:'Bimbingan selama Prakerin/PKL',t:'k',o:AL_S4},
  {k:'pklD',l:'Monitoring/kunjungan guru selama Prakerin/PKL',t:'k',o:AL_S4},
  {k:'sertifikat',l:'Memiliki sertifikat kompetensi dari industri/LSP saat di SMK?',t:'r',o:AL_YT}
 ].concat(AL_ASPEK.map(function(a,i){return {k:'asp'+(i+1),l:'Kualitas pendidikan ('+(i+1)+'): '+a,t:'k',o:AL_ASP}}),[
  {k:'dmp1',l:'Dampak sertifikat kompetensi terhadap pendapatan',t:'k',o:AL_DMP},
  {k:'dmp2',l:'Dampak sertifikat kompetensi terhadap kemudahan memperoleh pekerjaan',t:'k',o:AL_DMP}
 ])
];
var AL_LANGKAH=['Identitas','Data lulusan','Bekerja','Umpan balik'];
if(typeof ICO!=='undefined'&&!ICO.alumni)ICO.alumni='<path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>';
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('alumni')<0)NAVTABS.push('alumni');
if(typeof NAVPERM!=='undefined')NAVPERM.alumni='nilai';

function alLihat(){return !!S.user&&can('nilai')}
function alTulis(){return alLihat()&&actRole()!=='kepsek'}
function alAdmin(){return !!S.user&&can('hapus')}
function alSek(){return (typeof schKode==='function'&&schKode())||String((S.user&&S.user.sekolah)||'').toUpperCase().replace('ALL','')||''}
function alNisn(x){return String(x==null?'':x).replace(/\D/g,'')}
function alHp(x){var d=alNisn(x);if(!d)return '';if(d.indexOf('0')===0)d='62'+d.slice(1);return d}
function alLabel(L,k){var r=L.filter(function(x){return x[0]===k})[0];return r?r[1]:''}
function alSudah(r){return !!(r.t&&r.t.kuliah&&r.t.kerja)}

/* ---- Penyimpanan ---- */
function alKeDoc(r){
 var p={hp:r.hp||'',email:r.email||'',dudiLink:r.dudiLink||'',dudiStatus:r.dudiStatus||'',t:r.t||{}};
 return {nisn:r.nisn,nama:r.nama,prodi:r.prodi||'',sekolah:r.sekolah||'',tahun:parseInt(r.tahun,10)||0,status:r.status||'',ts:r.ts||Date.now(),oleh:String(r.oleh||'').slice(0,64),payload:JSON.stringify(p)};
}
function alDariDoc(d){
 var r={id:d.$id,r:1,nisn:d.nisn||'',nama:d.nama||'',prodi:d.prodi||'',sekolah:d.sekolah||'',tahun:d.tahun||'',status:d.status||'',ts:d.ts||0,oleh:d.oleh||'',t:{}};
 try{var p=JSON.parse(d.payload||'{}');r.hp=p.hp||'';r.email=p.email||'';r.dudiLink=p.dudiLink||'';r.dudiStatus=p.dudiStatus||'';r.t=p.t||{}}catch(e){}
 return r;
}
function alLocalBaca(){try{var a=JSON.parse(localStorage.getItem(AL_LOCAL)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function alLocalTulis(){try{localStorage.setItem(AL_LOCAL,JSON.stringify(ALM.rows||[]))}catch(e){toast('Gagal menyimpan di perangkat ini')}}
async function alMuat(){
 if(ALM.loaded||ALM.busy)return;ALM.busy=true;ALM.msg='';
 try{
  if(Cloud.on)ALM.rows=(await Cloud.list(AL_KOL)).map(alDariDoc);
  else ALM.rows=alLocalBaca();
  ALM.loaded=true;
 }catch(e){
  ALM.rows=[];ALM.loaded=true;
  ALM.msg=/not be found|not found|404/i.test(String((e&&e.message)||e))?'Koleksi alumni belum dibuat di Appwrite. Lihat docs-ALUMNI.md.':'Gagal membaca data alumni: '+String((e&&e.message)||e).slice(0,140);
 }
 ALM.busy=false;render();
}
async function alSimpanSatu(r){
 r.ts=Date.now();r.oleh=(S.user&&S.user.nama)||'';
 if(Cloud.on){
  var doc=alKeDoc(r);
  if(r.r&&r.id)await Cloud.db.updateDocument(CFG.DB,AL_KOL,r.id,doc);
  else{var id=Appwrite.ID.unique();await Cloud.db.createDocument(CFG.DB,AL_KOL,id,doc);r.id=id;r.r=1}
 }else if(!r.id)r.id=uid();
 var i=ALM.rows.findIndex(function(x){return x.id===r.id});
 if(i<0)ALM.rows.push(r);else ALM.rows[i]=r;
 if(!Cloud.on)alLocalTulis();
 return r;
}
function alSalin(r){return JSON.parse(JSON.stringify(r))}

/* ---- Turunan ---- */
function alKolom(){
 var sek=alSek(),lintas=typeof schLintas==='function'&&schLintas();
 return (ALM.rows||[]).filter(function(r){return lintas||!sek||!r.sekolah||r.sekolah===sek});
}
function alTurunStatus(t){
 if(t.kerja==='Ya')return /^Berwirausaha|^Membantu/.test(t.jenisKerja||'')?'wirausaha':'bekerja';
 if(t.kuliah==='Ya')return 'kuliah';
 if(t.kerja==='Tidak')return 'menganggur';
 return '';
}
function alFilter(rows){
 var q=ALM.q.trim().toLowerCase();
 return rows.filter(function(r){
  if(ALM.th&&String(r.tahun)!==ALM.th)return false;
  if(ALM.st==='belum'){if(alSudah(r))return false}
  else if(ALM.st&&r.status!==ALM.st)return false;
  if(q&&(String(r.nama).toLowerCase().indexOf(q)<0&&String(r.nisn).indexOf(q)<0))return false;
  return true;
 }).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
}
function alTahun(rows){var m={};rows.forEach(function(r){if(r.tahun)m[r.tahun]=1});return Object.keys(m).sort().reverse()}

/* ---- Tampilan ---- */
function alOpsi(L,v,kosong){return (kosong?'<option value="">'+esc(kosong)+'</option>':'')+L.map(function(x){return '<option value="'+esc(x[0])+'"'+(x[0]===v?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')}
function alBaris(r){
 var st=r.status?alLabel(AL_STATUS,r.status):'Belum diisi';
 var cls=r.status==='bekerja'||r.status==='wirausaha'||r.status==='kuliah'?'ok':r.status?'warn':'';
 return '<div class="card row sb" style="align-items:center;gap:10px"><div style="min-width:0"><b>'+esc(r.nama)+'</b><br><small class="muted">NISN '+esc(r.nisn)+' · '+esc(r.prodi||'-')+' · lulus '+esc(r.tahun||'-')+'</small><br>'+
  '<span class="pill '+cls+'">'+esc(st)+'</span> '+(alSudah(r)?'<span class="pill ok">Tracer terisi</span>':'<span class="pill">Tracer belum</span>')+
  (r.dudiStatus?' <span class="pill">'+esc(alLabel(AL_DUDI,r.dudiStatus))+'</span>':'')+'</div>'+
  '<div class="row" style="gap:6px;flex:none"><button type="button" class="btn small" data-act="al-edit" data-id="'+esc(r.id)+'">'+(alTulis()?'Buka':'Lihat')+'</button></div></div>';
}
function alDaftarHtml(){
 var rows=alKolom(),f=alFilter(rows);
 if(!rows.length)return '<section class="card"><p class="note">Belum ada data alumni. Tambahkan satu per satu atau impor dari Excel.</p></section>';
 if(!f.length)return '<section class="card"><p class="note">Tidak ada alumni yang cocok dengan filter.</p></section>';
 return '<p class="note" aria-live="polite">'+f.length+' dari '+rows.length+' alumni</p>'+f.slice(0,200).map(alBaris).join('')+(f.length>200?'<p class="note">Menampilkan 200 pertama. Persempit dengan pencarian atau filter.</p>':'');
}
function alTab(){
 return '<div class="row" style="gap:6px;margin:8px 0">'+[['list','Daftar'],['dash','Dasbor']].map(function(x){return '<button type="button" class="btn small'+(ALM.v===x[0]?' primary':'')+'" data-act="al-tab" data-v="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
}
function viewAlumniDaftar(){
 var rows=alKolom(),th=alTahun(rows);
 var aksi=alTulis()?'<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small primary" data-act="al-baru">Tambah alumni</button><label class="btn small" style="cursor:pointer">Impor Excel<input type="file" accept=".xlsx,.xls,.csv" data-act="al-imp" hidden></label><button type="button" class="btn small" data-act="al-tpl">Template</button><button type="button" class="btn small" data-act="al-xls">Ekspor Excel</button></div>':'<div class="row"><button type="button" class="btn small" data-act="al-xls">Ekspor Excel</button></div>';
 return '<section class="card"><p class="note">Data alumni untuk persiapan dan pemantauan Tracer Study Vokasi. Pengisian resmi tetap di portal <b>tracervokasi.kemendikdasmen.go.id</b> (alumni masuk dengan NISN). Modul ini menyimpan jawaban internal dan memantau siapa yang belum mengisi.</p>'+
  '<div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn small" href="'+AL_PORTAL+'" target="_blank" rel="noopener noreferrer">Buka portal resmi</a></div></section>'+alTab()+aksi+
  '<section class="card"><input id="al-q" type="search" placeholder="Cari nama atau NISN" value="'+esc(ALM.q)+'" autocomplete="off"><div class="row" style="gap:8px;margin-top:8px"><select id="al-th" aria-label="Tahun lulus"><option value="">Semua tahun</option>'+th.map(function(t){return '<option'+(ALM.th===t?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select><select id="al-st" aria-label="Status"><option value="">Semua status</option><option value="belum"'+(ALM.st==='belum'?' selected':'')+'>Tracer belum diisi</option>'+alOpsi(AL_STATUS,ALM.st)+'</select></div></section>'+
  '<div id="al-list">'+alDaftarHtml()+'</div>';
}
function alPct(n,t){return t?Math.round(n*1000/t)/10:0}
function viewAlumniDasbor(){
 var rows=alKolom().filter(function(r){return !ALM.th||String(r.tahun)===ALM.th}),th=alTahun(alKolom());
 var n=rows.length,sudah=rows.filter(alSudah).length;
 var stc={};AL_STATUS.forEach(function(s){stc[s[0]]=0});var tanpa=0;
 rows.forEach(function(r){if(stc[r.status]!=null)stc[r.status]++;else tanpa++});
 var ber=rows.filter(function(r){return alSudah(r)&&(r.status==='bekerja'||r.status==='wirausaha')&&r.t.sesuai});
 var ses=ber.filter(function(r){return r.t.sesuai==='Sesuai'}).length;
 var avg=AL_ASPEK.map(function(a,i){var v=rows.map(function(r){return r.t&&r.t['asp'+(i+1)]}).filter(function(x){return x>0});return {a:a,n:v.length,m:v.length?v.reduce(function(s,x){return s+x},0)/v.length:0}});
 var bar=function(p,c){return '<div style="height:8px;border-radius:99px;background:var(--line);overflow:hidden"><div style="height:100%;width:'+Math.min(100,p)+'%;background:'+(c||'var(--accent)')+'"></div></div>'};
 var belum=rows.filter(function(r){return !alSudah(r)}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
 var h='<section class="card"><div class="row sb" style="gap:8px"><b>Filter tahun lulus</b><select id="al-dth" style="max-width:160px" aria-label="Tahun lulus"><option value="">Semua</option>'+th.map(function(t){return '<option'+(ALM.th===t?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select></div></section>';
 h+='<section class="card"><b>Ringkasan</b><p class="note" style="margin:6px 0">'+n+' alumni · tracer terisi '+sudah+' ('+alPct(sudah,n)+'%)</p>'+bar(alPct(sudah,n))+'</section>';
 h+='<section class="card"><b>Status alumni</b>'+AL_STATUS.map(function(s){return '<div style="margin-top:10px"><div class="row sb"><span>'+esc(s[1])+'</span><span class="muted">'+stc[s[0]]+' · '+alPct(stc[s[0]],n)+'%</span></div>'+bar(alPct(stc[s[0]],n))+'</div>'}).join('')+(tanpa?'<p class="note">'+tanpa+' alumni belum punya status.</p>':'')+'</section>';
 h+='<section class="card"><b>Kesesuaian pekerjaan dengan keahlian</b><p class="note" style="margin:6px 0">'+(ber.length?ses+' dari '+ber.length+' alumni yang bekerja/berwirausaha menjawab sesuai ('+alPct(ses,ber.length)+'%)':'Belum ada jawaban.')+'</p>'+(ber.length?bar(alPct(ses,ber.length),'var(--ok)'):'')+'</section>';
 h+='<section class="card"><b>Rata-rata kualitas pendidikan (skala 1-4)</b>'+avg.map(function(x,i){return '<div style="margin-top:10px"><div class="row sb"><span>'+(i+1)+'. '+esc(x.a)+'</span><span class="muted">'+(x.n?x.m.toFixed(2):'-')+'</span></div>'+bar(x.m*25)+'</div>'}).join('')+'<p class="note">1 = belum memenuhi, 4 = melampaui kebutuhan dunia kerja/usaha.</p></section>';
 h+='<section class="card"><b>Belum mengisi tracer ('+belum.length+')</b>'+(belum.length?belum.slice(0,60).map(function(r){
  var wa=alHp(r.hp);
  return '<div class="row sb" style="align-items:center;gap:8px;margin-top:8px"><span style="min-width:0">'+esc(r.nama)+'<br><small class="muted">'+esc(r.prodi||'-')+' · '+esc(r.tahun||'-')+'</small></span>'+(wa?'<button type="button" class="btn small" data-act="al-wa" data-id="'+esc(r.id)+'">WhatsApp</button>':'<small class="muted">tanpa HP</small>')+'</div>';
 }).join('')+(belum.length>60?'<p class="note">Menampilkan 60 pertama.</p>':''):'<p class="note">Semua sudah mengisi.</p>')+'</section>';
 return h;
}
function alField(q,t){
 var v=t[q.k],id='alq-'+q.k,h='<div class="card" style="margin-bottom:8px"><b style="display:block;margin-bottom:6px">'+esc(q.l)+'</b>';
 if(q.t==='s')h+='<select data-alt="'+q.k+'"><option value="">Pilih</option>'+q.o.map(function(o){return '<option'+(v===o?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select>';
 else if(q.t==='x')h+='<input type="text" data-alt="'+q.k+'" value="'+esc(v||'')+'" autocomplete="off">';
 else if(q.t==='n')h+='<input type="number" inputmode="numeric" min="0" max="168" data-alt="'+q.k+'" value="'+esc(v==null?'':v)+'">';
 else if(q.t==='m')h+=q.o.map(function(o){return '<label class="row" style="gap:8px;align-items:center;margin:4px 0"><input type="checkbox" style="width:auto" data-alt="'+q.k+'" data-v="'+esc(o)+'"'+((v||[]).indexOf(o)>-1?' checked':'')+'><span>'+esc(o)+'</span></label>'}).join('');
 else q.o.forEach(function(o,i){
  var val=q.t==='k'?String(i+1):o,on=q.t==='k'?v===i+1:v===o;
  h+='<label class="row" style="gap:8px;align-items:center;margin:4px 0"><input type="radio" style="width:auto" name="'+id+'" data-alt="'+q.k+'" data-v="'+esc(val)+'"'+(on?' checked':'')+'><span>'+esc(o)+'</span></label>';
 });
 return h+'</div>';
}
function viewAlumniForm(){
 var c=ALM.cur,w=alTulis(),t=c.t||{},h='';
 h+='<div class="row sb"><h2>'+esc(c.nama||'Alumni baru')+'</h2>'+(w?'':'<span class="pill">Hanya lihat</span>')+'</div>';
 h+='<div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0">'+AL_LANGKAH.map(function(l,i){return '<button type="button" class="btn small'+(ALM.step===i?' primary':'')+'" data-act="al-step" data-v="'+i+'">'+(i+1)+'. '+l+'</button>'}).join('')+'</div>';
 h+='<fieldset'+(w?'':' disabled')+' style="border:0;padding:0;margin:0">';
 if(ALM.step===0){
  h+='<section class="card">'+
   '<label>NISN (10 digit)<input data-alf="nisn" inputmode="numeric" maxlength="10" value="'+esc(c.nisn)+'"></label>'+
   '<label>Nama lengkap<input data-alf="nama" value="'+esc(c.nama)+'" autocomplete="off"></label>'+
   '<label>Jurusan<input data-alf="prodi" list="al-prodi" value="'+esc(c.prodi)+'"><datalist id="al-prodi">'+alProdiList(c.sekolah||alSek()).map(function(k){return '<option value="'+k+'">'+esc(AL_PRODI_NAMA[k])+'</option>'}).join('')+'</datalist></label>'+
   '<label>Tahun lulus<input data-alf="tahun" inputmode="numeric" maxlength="4" value="'+esc(c.tahun)+'"></label>'+
   '<label>No. HP/WhatsApp<input data-alf="hp" inputmode="tel" value="'+esc(c.hp||'')+'"></label>'+
   '<label>Email<input data-alf="email" type="email" value="'+esc(c.email||'')+'"></label>'+
   '<label>Status alumni<select data-alf="status">'+alOpsi(AL_STATUS,c.status,'Belum diketahui')+'</select></label>'+
   '<label>Tautan survei atasan (dari portal, bagian akhir)<input data-alf="dudiLink" value="'+esc(c.dudiLink||'')+'" placeholder="https://"></label>'+
   '<label>Status tautan atasan<select data-alf="dudiStatus">'+alOpsi(AL_DUDI,c.dudiStatus||'')+'</select></label>'+
   '<p class="note">Data pribadi alumni. Gunakan hanya untuk keperluan tracer study dan pastikan alumni setuju datanya dicatat.</p></section>';
 }else{
  if(ALM.step===2)h+='<p class="note">Bagian ini diisi bila alumni bekerja atau berwirausaha.</p>';
  if(ALM.step===3)h+='<p class="note">Skala: 1 terendah, 4 tertinggi.</p>';
  h+=AL_Q[ALM.step-1].map(function(q){return alField(q,t)}).join('');
 }
 h+='</fieldset>';
 h+='<div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" class="btn" data-act="al-batal">Kembali</button>'+
  (ALM.step>0?'<button type="button" class="btn" data-act="al-step" data-v="'+(ALM.step-1)+'">Sebelumnya</button>':'')+
  (ALM.step<3?'<button type="button" class="btn" data-act="al-step" data-v="'+(ALM.step+1)+'">Berikutnya</button>':'')+
  (w?'<button type="button" class="btn primary" data-act="al-simpan">Simpan</button>':'')+
  (w&&c.id&&alAdmin()?'<button type="button" class="btn danger" data-act="al-hapus">Hapus</button>':'')+'</div>';
 return h;
}
function viewAlumni(){
 if(!ALM.loaded&&!ALM.busy)setTimeout(alMuat,0);
 var h='<div class="row sb"><h2>Alumni dan Tracer</h2><span class="pill">'+esc(alSek()||'Semua sekolah')+'</span></div>';
 if(ALM.msg)h+='<section class="card"><p class="note" style="color:var(--bad)">'+esc(ALM.msg)+'</p></section>';
 if(!ALM.loaded)return h+'<p class="center muted" style="padding:32px 0">Memuat data alumni…</p>';
 if(ALM.v==='form'&&ALM.cur)return viewAlumniForm();
 return h+(ALM.v==='dash'?alTab()+viewAlumniDasbor():viewAlumniDaftar());
}

var _viewKatAl=viewKatalog;
viewKatalog=function(){
 if(S.tab==='alumni'&&alLihat())return viewAlumni();
 return _viewKatAl.apply(this,arguments);
};
var _renderAl=render;
render=function(){
 _renderAl.apply(this,arguments);
 try{
  if(!S.user||!alLihat())return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="alumni"]'))return;
  var cur=V.mode==='list'?S.tab:'';
  sb.insertAdjacentHTML('beforeend','<button type="button" class="srow" data-act="menu" data-v="alumni"'+(cur==='alumni'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.alumni,22)+'</span><span class="st"><b>Alumni dan Tracer</b><small>Data alumni dan pemantauan tracer study</small></span>'+svg(ICO.chev,18)+'</button>');
 }catch(e){}
};

/* ---- Aksi ---- */
function alKosong(){return {id:'',r:0,nisn:'',nama:'',prodi:'',sekolah:alSek(),tahun:'',hp:'',email:'',status:'',dudiLink:'',dudiStatus:'',t:{}}}
async function alSimpan(){
 var c=ALM.cur;if(!c||!alTulis())return;
 c.nisn=alNisn(c.nisn);c.nama=String(c.nama||'').trim();
 if(c.nisn.length!==10){toast('NISN harus 10 digit');ALM.step=0;render();return}
 if(!c.nama){toast('Nama wajib diisi');ALM.step=0;render();return}
 if(c.tahun&&!/^(19|20)\d{2}$/.test(String(c.tahun))){toast('Tahun lulus tidak valid');ALM.step=0;render();return}
 if(c.dudiLink&&!/^https?:\/\//i.test(c.dudiLink)){toast('Tautan atasan harus diawali http:// atau https://');ALM.step=0;render();return}
 if((ALM.rows||[]).some(function(x){return x.nisn===c.nisn&&x.id!==c.id})){toast('NISN ini sudah terdaftar');ALM.step=0;render();return}
 if(!c.sekolah)c.sekolah=alSek();
 if(!c.status&&alSudah(c)){var d=alTurunStatus(c.t);if(d)c.status=d}
 if(Cloud.on&&navigator.onLine===false){toast('Offline: penyimpanan butuh internet');return}
 try{await alSimpanSatu(alSalin(c));toast('Data alumni tersimpan');ALM.v='list';ALM.cur=null;ALM.step=0}
 catch(e){toast('Gagal menyimpan: '+String((e&&e.message)||e).slice(0,120))}
 render();
}
async function alHapus(){
 var c=ALM.cur;if(!c||!c.id||!alAdmin())return;
 var ok=await uiConfirm('Hapus data alumni '+c.nama+'? Tidak bisa dibatalkan.',{ok:'Hapus'});if(!ok)return;
 if(Cloud.on&&!(await Cloud.remove(AL_KOL,c.id)))return;
 ALM.rows=ALM.rows.filter(function(x){return x.id!==c.id});if(!Cloud.on)alLocalTulis();
 ALM.v='list';ALM.cur=null;toast('Data alumni dihapus');render();
}
function alKolomXls(){
 var h=['NISN','Nama','Jurusan','Tahun lulus','HP','Email','Status','Tracer terisi','Status tautan atasan','Kab/kota','Bentuk kegiatan','Pekerjaan','Tempat kerja','Jenis instansi','Gaji','Kesesuaian'];
 AL_ASPEK.forEach(function(a,i){h.push('Aspek '+(i+1)+' '+a)});
 return h;
}
function alBarisXls(r){
 var t=r.t||{},o=[r.nisn,r.nama,r.prodi,r.tahun,r.hp||'',r.email||'',alLabel(AL_STATUS,r.status),alSudah(r)?'Ya':'Belum',alLabel(AL_DUDI,r.dudiStatus||''),t.kota||'',t.jenisKerja||'',t.jabatan||'',t.tempat||'',t.instansi||'',t.gaji||'',t.sesuai||''];
 AL_ASPEK.forEach(function(a,i){o.push(t['asp'+(i+1)]||'')});
 return o;
}
function alEkspor(){
 if(!needX())return;
 var rows=alFilter(alKolom());if(!rows.length){toast('Tidak ada data untuk diekspor');return}
 var wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet([alKolomXls()].concat(rows.map(alBarisXls)));
 ws['!cols']=alKolomXls().map(function(x,i){return {wch:i<2?24:i<8?16:20}});
 XLSX.utils.book_append_sheet(wb,ws,'Alumni');
 XLSX.writeFile(wb,'alumni-'+(alSek()||'semua').toLowerCase()+'-'+ymd(Date.now())+'.xlsx');
}
function alTemplate(){
 if(!needX())return;
 var wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet([['NISN','Nama','Jurusan','Tahun lulus','HP','Email','Status'],['0061234567','Contoh Nama','TSM',2025,'081234567890','nama@contoh.id','bekerja']]);
 ws['!cols']=[{wch:14},{wch:26},{wch:10},{wch:12},{wch:16},{wch:26},{wch:14}];
 var ket=XLSX.utils.aoa_to_sheet([['Kolom Status (boleh kosong): '+AL_STATUS.map(function(s){return s[0]}).join(', ')],['NISN wajib 10 digit. Baris dengan NISN yang sudah ada akan memperbarui data, bukan menggandakan.']]);
 XLSX.utils.book_append_sheet(wb,ws,'Alumni');XLSX.utils.book_append_sheet(wb,ket,'Petunjuk');
 XLSX.writeFile(wb,'Template_Impor_Alumni.xlsx');
}
async function alImpor(file){
 if(!file||!alTulis())return;
 if(!needX())return;
 if(Cloud.on&&navigator.onLine===false){toast('Offline: impor butuh internet');return}
 var ok=0,baru=0,ubah=0,lewat=[];
 try{
  var wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];
  var js=XLSX.utils.sheet_to_json(ws,{defval:''});
  if(js.length>1500){toast('Maksimal 1500 baris per impor');return}
  var get=function(o,names){for(var k in o){var kk=String(k).toLowerCase().replace(/[^a-z]/g,'');if(names.indexOf(kk)>-1)return String(o[k]).trim()}return ''};
  var st={};AL_STATUS.forEach(function(s){st[s[0]]=s[0];st[s[1].toLowerCase()]=s[0]});
  var jobs=[];
  js.forEach(function(o,i){
   var nisn=alNisn(get(o,['nisn']));if(nisn.length===9)nisn='0'+nisn;
   var nama=get(o,['nama','namalengkap']);
   if(nisn.length!==10||!nama){lewat.push('baris '+(i+2));return}
   var ada=ALM.rows.filter(function(x){return x.nisn===nisn})[0],r=ada?alSalin(ada):alKosong();
   r.nisn=nisn;r.nama=nama;
   var pr=get(o,['jurusan','prodi']);if(pr)r.prodi=alProdiKode(pr);
   var th=get(o,['tahunlulus','tahun']);if(/^(19|20)\d{2}$/.test(th))r.tahun=th;
   var hp=get(o,['hp','nohp','whatsapp','nohpwhatsapp']);if(hp)r.hp=hp;
   var em=get(o,['email']);if(em)r.email=em;
   var sx=st[get(o,['status']).toLowerCase()];if(sx)r.status=sx;
   if(!r.sekolah)r.sekolah=alSek();
   jobs.push([r,!!ada]);
  });
  for(var i=0;i<jobs.length;i+=5){
   await Promise.all(jobs.slice(i,i+5).map(function(j){return alSimpanSatu(j[0]).then(function(){ok++;if(j[1])ubah++;else baru++},function(){lewat.push('NISN '+j[0].nisn)})}));
  }
 }catch(e){toast('Gagal membaca berkas: '+String((e&&e.message)||e).slice(0,100));return}
 ALM.msg='';toast('Impor selesai: '+baru+' baru, '+ubah+' diperbarui'+(lewat.length?', '+lewat.length+' dilewati ('+lewat.slice(0,4).join(', ')+(lewat.length>4?', …':'')+')':''));render();
}
function alWa(id){
 var r=(ALM.rows||[]).filter(function(x){return x.id===id})[0];if(!r)return;
 var no=alHp(r.hp);if(!no){toast('Nomor HP belum diisi');return}
 var pesan='Assalamualaikum '+r.nama+', alumni '+schNama()+'. Mohon mengisi Tracer Study Vokasi Kemendikdasmen di '+AL_PORTAL+' (masuk memakai NISN). Terima kasih.';
 window.open('https://wa.me/'+no+'?text='+encodeURIComponent(pesan),'_blank','noopener,noreferrer');
}

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="al-"]');if(!b||b.tagName==='INPUT')return;
 var a=b.dataset.act;
 if(a==='al-tab'){ALM.v=b.dataset.v;render()}
 else if(a==='al-baru'){if(!alTulis())return;ALM.cur=alKosong();ALM.step=0;ALM.v='form';render()}
 else if(a==='al-edit'){var r=(ALM.rows||[]).filter(function(x){return x.id===b.dataset.id})[0];if(!r)return;ALM.cur=alSalin(r);ALM.cur.t=ALM.cur.t||{};ALM.step=0;ALM.v='form';render()}
 else if(a==='al-batal'){ALM.v='list';ALM.cur=null;ALM.step=0;render()}
 else if(a==='al-step'){ALM.step=Math.max(0,Math.min(3,parseInt(b.dataset.v,10)||0));render();window.scrollTo(0,0)}
 else if(a==='al-simpan')alSimpan();
 else if(a==='al-hapus')alHapus();
 else if(a==='al-xls')alEkspor();
 else if(a==='al-tpl')alTemplate();
 else if(a==='al-wa')alWa(b.dataset.id);
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset)return;
 if(t.dataset.act==='al-imp'){var f=t.files&&t.files[0];t.value='';alImpor(f);return}
 if(t.id==='al-th'){ALM.th=t.value;var l=document.getElementById('al-list');if(l)l.innerHTML=alDaftarHtml();return}
 if(t.id==='al-st'){ALM.st=t.value;var l2=document.getElementById('al-list');if(l2)l2.innerHTML=alDaftarHtml();return}
 if(t.id==='al-dth'){ALM.th=t.value;render();return}
 if(!ALM.cur||!alTulis())return;
 if(t.dataset.alf){ALM.cur[t.dataset.alf]=t.value;return}
 var k=t.dataset.alt;if(!k)return;
 var tt=ALM.cur.t=ALM.cur.t||{};
 if(t.type==='checkbox'){var a=(tt[k]||[]).slice(),i=a.indexOf(t.dataset.v);if(t.checked&&i<0)a.push(t.dataset.v);if(!t.checked&&i>-1)a.splice(i,1);tt[k]=a}
 else if(t.type==='radio'){var q=null;AL_Q.forEach(function(L){L.forEach(function(x){if(x.k===k)q=x})});tt[k]=q&&q.t==='k'?parseInt(t.dataset.v,10):t.dataset.v}
 else tt[k]=t.type==='number'?(t.value===''?'':Number(t.value)):t.value;
});
document.addEventListener('input',function(e){
 var t=e.target;if(!t)return;
 if(t.id==='al-q'){ALM.q=t.value;var l=document.getElementById('al-list');if(l)l.innerHTML=alDaftarHtml();return}
 if(!ALM.cur||!alTulis()||!t.dataset)return;
 if(t.dataset.alf)ALM.cur[t.dataset.alf]=t.value;
 else if(t.dataset.alt&&(t.type==='text'||t.type==='number'))(ALM.cur.t=ALM.cur.t||{})[t.dataset.alt]=t.type==='number'?(t.value===''?'':Number(t.value)):t.value;
});
/* keluar dari halaman ini: tutup formulir agar tidak terbawa */
document.addEventListener('click',function(e){
 var m=e.target.closest&&e.target.closest('[data-act="menu"],[data-act="tab"]');
 if(m&&m.dataset.v!=='alumni'){ALM.v='list';ALM.cur=null;ALM.step=0}
});
