/* ukk-io.js (v81): Ekspor dan impor ISI unit UKK lewat Excel (Admin dan Guru).
   Berkas Excel punya dua sheet: Unit (satu baris per unit) dan Butir (satu baris per butir pemeriksaan).
   Impor memakai pratinjau, memeriksa semua aturan yang sama dengan editor (ukkValidateDoc), memperbarui unit yang kodenya sudah ada
   (jadwal dan pengaturan lain dipertahankan, isi butir diganti), dan menambah unit baru sebagai Draft kecuali kolom Status berisi Terbit.
   Nilai siswa tidak ikut diimpor di sini (pakai Impor nilai di Rekap nilai). */
var UKI_UH=['Kode unit','Judul','Tipe kendaraan','Kelas','Alokasi (menit)','SKKNI','Kode sekolah (DF/MEDINA/Semua)','Satuan pendidikan (lembar)','Konsentrasi','Kode lembar','Tahun pelajaran','Bentuk','Nomor paket','Tempat pengesahan','Mode (Latihan/Ujian)','Kesempatan (0=tak terbatas)','Status (Terbit/Draft)'];
var UKI_BH=['Kode unit','No','Komponen','Standar manual','Wajib (ya/kosong)','Wajib foto (ya/kosong)'];

function ukiKolom(k,sh){
 k=String(k).toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/^(kodeunit|kode|id|idunit)$/.test(k))return 'id';
 if(sh==='u'){
  if(/^(judul|title|namaunit|judultugas)$/.test(k))return 'title';
  if(/^(tipekendaraan|tipe|kendaraan|unit)$/.test(k))return 'unit';
  if(k==='kelas')return 'kelas';
  if(/^(alokasi|waktu|menit|durasi)/.test(k))return 'duration';
  if(k==='skkni'||k==='kodeskkni')return 'skkni';
  if(/^(kodesekolah|aksessekolah|untuksekolah)/.test(k))return 'sekolah';
  if(/^(satuan|namasekolah|sekolah)/.test(k))return 'satuan';
  if(/^konsentrasi/.test(k))return 'konsentrasi';
  if(/^(kodelembar|kodeform)/.test(k))return 'kode';
  if(/^tahun/.test(k))return 'tahun';
  if(/^nomorpaket|^paket/.test(k))return 'paket';
  if(/^tempat/.test(k))return 'tempat';
  if(k==='bentuk')return 'bentuk';
  if(/^mode/.test(k))return 'mode';
  if(/^kesempatan/.test(k))return 'maxTry';
  if(/^status/.test(k))return 'status';
 }else{
  if(/^(no|nomor|urutan)$/.test(k))return 'no';
  if(/^(komponen|item|namaitem|butir|pekerjaan)$/.test(k))return 't';
  if(/^(standar|spesifikasi)/.test(k))return 'std';
  if(/^wajibfoto|^foto/.test(k))return 'f';
  if(/^wajib/.test(k))return 'k';
 }
 return '';
}
function ukiBaris(r0,sh){
 var r={},any=false;
 Object.keys(r0).forEach(function(k){var c=ukiKolom(k,sh),v=String(r0[k]==null?'':r0[k]).trim();if(v)any=true;if(c&&!(c in r&&!v))r[c]=v});
 return any?r:null;
}
function ukiRowsUnit(jobs){
 return jobs.map(function(j){var f=j.form||{},c=j.cfg||{};
  return [j.id,j.judul,j.unit,j.kelas,j.menit,j.skkni||'',j.sekolah||'Semua',f.satuan||'',f.konsentrasi||'',f.kode||'',f.tahun||'',f.bentuk||'',f.paket||'1',f.tempat||'',c.mode==='ujian'?'Ujian':'Latihan',c.maxTry||0,ukkTampil(j)?'Terbit':'Draft'];
 });
}
function ukiRowsButir(jobs){
 var out=[];jobs.forEach(function(j){j.items.forEach(function(i){out.push([j.id,i.no,i.t,i.std,i.k?'ya':'',i.f?'ya':''])})});
 return out;
}
function ukiPetunjuk(){
 return [['Sheet / kolom','Aturan'],
  ['Unit','Satu baris per unit UKK. Kode unit 2–32 karakter (huruf, angka, _ atau -). Kode yang sudah ada diperbarui, kode baru ditambahkan.'],
  ['Kelas','X, XI, atau XII.'],['Alokasi (menit)','1 sampai 600.'],
  ['Mode','Latihan atau Ujian. Kosong = Latihan.'],['Kesempatan','0 sampai 9 (berlaku untuk mode Ujian). 0 = tidak terbatas.'],
  ['Status','Terbit atau Draft. Kosong = Draft untuk unit baru, tidak diubah untuk unit lama bila kolom dikosongkan.'],
  ['Kode sekolah','DF, MEDINA, atau Semua (unit tampil di semua sekolah). Kosong: unit baru ikut sekolah yang sedang dipilih, unit lama tidak berubah.'],
  ['Kolom identitas lembar','Satuan pendidikan, Konsentrasi, Kode lembar, Tahun pelajaran, Bentuk, Nomor paket, Tempat pengesahan. Kosong = ikut bawaan atau isi unit lama.'],
  ['Butir','Satu baris per butir, dikaitkan lewat Kode unit. No menentukan urutan (kosong = urutan baris). Maksimal 60 butir per unit; komponen maks. 200 dan standar maks. 300 karakter.'],
  ['Wajib foto','Isi ya untuk butir yang wajib difoto siswa (satu foto per butir).'],
  ['Wajib','Kolom lama: penanda butir wajib. Dalam penilaian UKK terbaru nilai unit dihitung dari persentase butir yang dapat nilai.'],
  ['Catatan','Jadwal buka/tutup dan pengaturan tampilan unit lama dipertahankan. Isi butir diganti seluruhnya sesuai sheet Butir.']];
}
function ukiExport(jobs,nama){
 if(!needX())return;
 if(!jobs.length){toast('Tidak ada unit untuk diekspor');return}
 book([['Unit',[UKI_UH].concat(ukiRowsUnit(jobs)),[11,44,28,8,14,18,22,24,28,14,16,22,10,16,20,22,18]],['Butir',[UKI_BH].concat(ukiRowsButir(jobs)),[11,5,48,56,16,16]],['Petunjuk',ukiPetunjuk(),[24,110]]],nama);
}
function ukiTemplate(){
 if(!needX())return;
 var u=[UKI_UH,['UKK-5','Perawatan Berkala Contoh','Honda Contoh','XII',20,'','Semua',FORM_UKK.satuan,FORM_UKK.konsentrasi,FORM_UKK.kode,FORM_UKK.tahun,FORM_UKK.bentuk,FORM_UKK.paket,FORM_UKK.tempat,'Latihan',0,'Draft']];
 var b=[UKI_BH,['UKK-5',1,'Tekanan ban depan','200 kPa','ya',''],['UKK-5',2,'Rantai: kekenduran','25–35 mm','',''],['UKK-5',3,'Lampu rem menyala','Menyala saat tuas ditarik','','ya']];
 book([['Unit',u,[11,44,28,8,14,18,22,24,28,14,16,22,10,16,20,22,18]],['Butir',b,[11,5,48,56,16,16]],['Petunjuk',ukiPetunjuk(),[24,110]]],'Template_Impor_Unit_UKK');
}

async function ukiParse(f){
 if(!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await f.arrayBuffer(),{type:'array'}),nm=wb.SheetNames;
 function cari(re){for(var i=0;i<nm.length;i++)if(re.test(nm[i].toLowerCase()))return wb.Sheets[nm[i]];return null}
 var su=cari(/^unit/)||wb.Sheets[nm[0]],sb=cari(/^(butir|item)/)||(nm.length>1?wb.Sheets[nm[1]]:null);
 if(!su||!sb)throw new Error('Berkas harus punya sheet Unit dan sheet Butir. Unduh Template untuk contohnya.');
 var ru=XLSX.utils.sheet_to_json(su,{defval:'',raw:false}),rb=XLSX.utils.sheet_to_json(sb,{defval:'',raw:false});
 if(!ru.length)throw new Error('Sheet Unit kosong atau header tidak terbaca.');
 if(ru.length>40||rb.length>2400)throw new Error('Terlalu besar: maksimal 40 unit dan 2400 butir per impor.');
 var err=[],units={},order=[],all=JOBS.concat(JOBS_ARSIP||[]);
 ru.forEach(function(r0,i){
  var r=ukiBaris(r0,'u');if(!r)return;
  var line='Unit baris '+(i+2),id=String(r.id||'').trim();
  function bad(m){err.push({line:line,msg:m})}
  if(!id)return bad('Kode unit kosong');
  var lk=id.toLowerCase();
  if(units[lk])return bad('Kode unit ganda: '+id);
  var kelas=normKelas(r.kelas);if(!kelas||!KELAS[kelas])return bad('Kelas tidak valid untuk '+id+' (pakai X, XI, atau XII)');
  if((LKPD_MODULES||[]).some(function(m){return String(m.id).toLowerCase()===lk}))return bad('Kode '+id+' sudah dipakai modul LKPD');
  var ex=all.filter(function(j){return String(j.id).toLowerCase()===lk})[0],aktif=ex&&ukkJobBy(ex.id);
  if(ex&&!ex.ukk)return bad('Kode '+id+' sudah dipakai unit uji praktik biasa');
  if(ex&&!aktif)return bad('Kode '+id+' pernah dipakai unit UKK yang dihapus. Pakai kode lain');
  var old=aktif?(ukkDocOf(aktif.id)||ukkDocFromJob(aktif)):null,of=(old&&old.form)||FORM_UKK;
  var doc=Object.assign({},old||{},{id:aktif?aktif.id:id,jenis:'ukk',version:1,title:String(r.title||'').trim(),unit:String(r.unit||'').trim(),kelas:kelas,fase:KELAS[kelas].fase,
   duration:Number(String(r.duration||'20').replace(',','.')),skkni:String(r.skkni||'').trim(),
   form:{satuan:r.satuan||of.satuan||'',konsentrasi:r.konsentrasi||of.konsentrasi||'',kode:r.kode||of.kode||'',tahun:r.tahun||of.tahun||'',bentuk:r.bentuk||of.bentuk||'',paket:r.paket||of.paket||'1',tempat:r.tempat||of.tempat||''},
   mode:/ujian/i.test(r.mode||'')?'ujian':(/latihan/i.test(r.mode||'')?'latihan':((old&&old.mode)||'latihan')),
   maxTry:r.maxTry!==undefined?(parseInt(r.maxTry,10)||0):((old&&old.maxTry)||0),items:[]});
  if(r.sekolah){var sk=schNorm(r.sekolah);if(sk==='ALL')doc.sekolah='';else if(sk)doc.sekolah=sk;else return bad('Kode sekolah tidak dikenal untuk '+id+' (pakai DF, MEDINA, atau Semua)')}
  else if(!old)doc.sekolah=schKode()||'';
  var st=String(r.status||'').toLowerCase();
  if(/terbit|publish|tampil/.test(st))doc.status='published';else if(/draft|sembunyi/.test(st))doc.status='draft';else if(!old)doc.status='draft';
  doc.active=doc.status==='published';
  delete doc.reset;delete doc.dihapus;delete doc.payload;
  units[lk]={doc:doc,upd:!!aktif,line:line,rows:[]};order.push(lk);
 });
 rb.forEach(function(r0,i){
  var r=ukiBaris(r0,'b');if(!r)return;
  var u=units[String(r.id||'').trim().toLowerCase()];
  if(!u){err.push({line:'Butir baris '+(i+2),msg:'Kode unit tidak ada di sheet Unit: '+(r.id||'kosong')});return}
  u.rows.push({n:parseFloat(String(r.no||'').replace(',','.')),i:u.rows.length,t:String(r.t||'').trim(),std:String(r.std||'').trim(),k:/^(ya|y|wajib|1|true|x|v)$/i.test(String(r.k||'').trim()),f:/^(ya|y|wajib|1|true|x|v)$/i.test(String(r.f||'').trim())});
 });
 var ok=[];
 order.forEach(function(lk){
  var u=units[lk];
  u.rows.sort(function(a,b){var an=isNaN(a.n),bn=isNaN(b.n);if(an||bn)return a.i-b.i;return a.n-b.n||a.i-b.i});
  u.doc.items=u.rows.filter(function(x){return x.t||x.std}).map(function(x){return {t:x.t,std:x.std,k:x.k,f:x.f}});
  var e=ukkValidateDoc(u.doc);
  if(e)err.push({line:u.line,msg:u.doc.id+': '+e});else ok.push({doc:u.doc,upd:u.upd});
 });
 if(!ok.length&&!err.length)throw new Error('Tidak ada data unit. Pakai Template.');
 return {ok:ok,err:err};
}
function ukiPreview(){
 var m=UKS.imp,baru=m.ok.filter(function(x){return !x.upd}).length,upd=m.ok.length-baru;
 return '<div class="card" style="gap:8px"><h3>Pratinjau impor unit UKK</h3><div class="row"><span class="pill ok">'+baru+' baru</span><span class="pill">'+upd+' diperbarui</span><span class="pill '+(m.err.length?'bad':'plain')+'">'+m.err.length+' ditolak</span></div>'+
  (m.ok.length?'<ul class="plain note">'+m.ok.slice(0,10).map(function(x){return '<li>'+esc(x.doc.id)+' · '+esc(x.doc.title)+' · '+x.doc.items.length+' butir '+(x.upd?'(perbarui)':'(baru, '+(x.doc.status==='published'?'Terbit':'Draft')+')')+'</li>'}).join('')+(m.ok.length>10?'<li>dan '+(m.ok.length-10)+' lainnya</li>':'')+'</ul>':'')+
  (m.err.length?'<ul class="plain note">'+m.err.slice(0,8).map(function(x){return '<li>'+esc(x.line)+': '+esc(x.msg)+'</li>'}).join('')+(m.err.length>8?'<li>dan '+(m.err.length-8)+' lainnya</li>':'')+'</ul>':'')+
  '<div class="row"><button type="button" class="btn" data-act="uki-cancel">Batal</button><button type="button" class="btn primary grow" data-act="uki-apply"'+(m.ok.length?'':' disabled')+'>Terapkan '+m.ok.length+' unit</button></div></div>';
}
function ukiBar(){
 if(!isStaff())return '';
 return '<div class="lks-acts"><label class="btn small filebtn">Impor unit<input id="uki-file" type="file" accept=".xlsx,.xls,.csv" hidden></label><button type="button" class="btn small" data-act="uki-tpl">Template</button><button type="button" class="btn small" data-act="uki-exp-all">Ekspor isi semua unit</button></div>'+(UKS.imp?ukiPreview():'');
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="uki-"]');if(!b||!isStaff())return;
 var a=b.dataset.act,v=b.dataset.v;
 if(a==='uki-tpl')ukiTemplate();
 else if(a==='uki-exp'){var j=ukkJobBy(v);if(j)ukiExport([j],'Unit_'+j.id)}
 else if(a==='uki-exp-all')ukiExport(JOBS.filter(function(j){return j.kelas===S.kelas&&j.ukk}),'Unit_UKK_'+S.kelas);
 else if(a==='uki-cancel'){UKS.imp=null;render()}
 else if(a==='uki-apply'&&UKS.imp){
  var m=UKS.imp,n=0,gagal='';
  m.ok.forEach(function(x){var er=ukkStore(x.doc);if(er){if(!gagal)gagal=x.doc.id+': '+er}else n++});
  UKS.imp=null;render();toast(gagal?'Sebagian gagal: '+gagal:n+' unit diimpor');ukkFlush();
 }
});
document.addEventListener('change',async function(e){
 if(!e.target||e.target.id!=='uki-file')return;
 var f=e.target.files[0];if(!f)return;
 try{UKS.imp=await ukiParse(f)}catch(err){UKS.imp=null;toast(err.message||'Gagal membaca berkas')}
 render();
});
