/* pkl-xls.js: ekspor, template, dan impor Excel (xlsx/xls/csv) untuk daftar Tempat PKL, tab Tempat PKL di menu PKL.
   Guru dan Admin: Impor Excel, Template, Ekspor Excel. Kepala Sekolah: hanya Ekspor Excel. Siswa tidak melihat tombolnya.
   Aturan impor:
   - Kolom dikenali dari judulnya (huruf besar/kecil dan tanda baca diabaikan), jadi berkas hasil Ekspor Excel bisa diedit lalu diimpor kembali.
   - Kunci pencocokan: Nama dunia kerja + Kota. Sama dengan data yang ada = memperbarui, selain itu = tempat baru.
     Bila Kota di berkas kosong dan hanya satu tempat bernama sama, tempat itu yang diperbarui.
   - Sel kosong tidak menghapus isi yang sudah ada. Baris yang tidak berubah dilewati.
   - Pratinjau (jumlah baru, diperbarui, ditolak) ditampilkan dulu; data baru tersimpan setelah Terapkan.
   - Penyimpanan lewat pkPut('tempat', ...) seperti formulir, jadi mode lokal, Appwrite, dan antrean offline mengikuti aturan yang sama.
   Bergantung pada pkl.js (pkList, pkPut, pkLoad, PK, pkPksStatus, pkKunjunganAkhir, pkTerisi, pkToday) dan export.js (needX). */
var PKX={busy:false};
var PKX_MAKS=500,PKX_TEKS=1000;
/* k = kunci data (sama dengan pkSchema('tempat')), h = judul kolom di Excel, a = nama lain yang dikenali, ml = boleh beberapa baris */
var PKX_KOL=[
 {k:'nama',h:'Nama dunia kerja',a:['nama','namatempat','namatempatpkl','tempatpkl','namaperusahaan','perusahaan','dudi','mitra']},
 {k:'bidang',h:'Bidang usaha',a:['bidang','bidangusahakompetensi','bidangusahakompetensiyangdilatih']},
 {k:'alamat',h:'Alamat',a:[],ml:1},
 {k:'kota',h:'Kota/kabupaten',a:['kota','kabupaten']},
 {k:'negeri',h:'Lokasi',a:['negeri','dalamluarnegeri']},
 {k:'telp',h:'Telepon/WA',a:['telepon','telp','wa','hp','nohp','notelepon']},
 {k:'pimpinan',h:'Pimpinan/HRD',a:['pimpinan','hrd']},
 {k:'instruktur',h:'Instruktur',a:['pembimbingduniakerja','instrukturpembimbingduniakerja']},
 {k:'instrTelp',h:'Kontak instruktur',a:['telpinstruktur','teleponinstruktur','hpinstruktur']},
 {k:'kuota',h:'Kuota',a:['kuotasiswa']},
 {k:'jam',h:'Jam kerja',a:['jam']},
 {k:'pks',h:'No. PKS sekolah',a:['pkssekolah','noperjanjiansekolah']},
 {k:'pksMitra',h:'No. PKS mitra',a:['pksmitra','noperjanjianmitra']},
 {k:'pksMulai',h:'PKS mulai',a:['berlakumulai','perjanjianberlakumulai']},
 {k:'pksSelesai',h:'PKS selesai',a:['berlakusampai','perjanjianberlakusampai']},
 {k:'fasilitas',h:'Fasilitas',a:['fasilitasinsentif'],ml:1},
 {k:'lat',h:'Lintang',a:['lat','latitude']},
 {k:'lng',h:'Bujur',a:['lng','long','lon','longitude']},
 {k:'radius',h:'Radius (m)',a:['radiusabsen','radiusabsenm']},
 {k:'cat',h:'Catatan',a:['keterangan'],ml:1}
];
/* Kolom informasi: ikut di berkas ekspor, diabaikan saat impor */
var PKX_INFO=['Siswa aktif','Status PKS','Monitoring terakhir'];
function pkxHdr(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]/g,'')}
var PKX_MAP={};
PKX_KOL.forEach(function(c){[pkxHdr(c.h)].concat(c.a,[c.k.toLowerCase()]).forEach(function(a){if(!PKX_MAP[a])PKX_MAP[a]=c})});
function pkxNorm(s){return String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function pkxKey(n,k){return pkxNorm(n)+'|'+pkxNorm(k)}
function pkxKosong(v){return v===''||v==null||(typeof v==='string'&&!v.trim())}

/* ---------- Pembacaan nilai sel ---------- */
function pkxTeks(v,ml){
 if(v==null)return '';
 var s=typeof v==='number'?(isFinite(v)?String(v):''):String(v);
 s=s.replace(/\r\n?/g,'\n').trim();
 return ml?s.replace(/[ \t]+\n/g,'\n'):s.replace(/\s*\n\s*/g,' ').replace(/\s{2,}/g,' ');
}
function pkxAngka(v){
 if(typeof v==='number')return isFinite(v)?v:null;
 var s=String(v==null?'':v).replace(/\s/g,'').replace(',','.');
 return /^-?\d+(\.\d+)?$/.test(s)?+s:null;
}
function pkxP2(n){return (n<10?'0':'')+n}
/* Tanggal: sel tanggal Excel (angka seri), yyyy-mm-dd, atau dd/mm/yyyy (hari lebih dulu). '' bila kosong, null bila tidak terbaca. */
function pkxTgl(v){
 if(pkxKosong(v))return '';
 var y,m,d,t;
 if(typeof v==='number'){
  if(!(v>=20000&&v<80000)||!(window.XLSX&&XLSX.SSF&&XLSX.SSF.parse_date_code))return null;
  var p=XLSX.SSF.parse_date_code(v);if(!p)return null;y=p.y;m=p.m;d=p.d;
 }else{
  var s=String(v).trim(),a=s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/),b=s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2}|\d{4})$/);
  if(a){y=+a[1];m=+a[2];d=+a[3]}
  else if(b){d=+b[1];m=+b[2];y=+b[3];if(b[3].length===2)y+=2000}
  else return null;
 }
 t=new Date(Date.UTC(y,m-1,d));
 if(y<1990||y>2100||t.getUTCFullYear()!==y||t.getUTCMonth()!==m-1||t.getUTCDate()!==d)return null;
 return y+'-'+pkxP2(m)+'-'+pkxP2(d);
}

/* ---------- Penguraian baris (murni, tanpa pustaka Excel kecuali pembacaan tanggal seri) ----------
   raw: larik objek dari sheet_to_json (judul kolom → nilai). ada: tempat yang sudah tersimpan.
   Hasil: {ok:[{line,baru,rec,p}], err:[{line,msg}], same, contoh}. line = nomor baris di Excel (judul = baris 1). */
function pkxParse(raw,ada){
 var ok=[],err=[],seen={},same=0,contoh=0,byKey={},byNama={};
 (ada||[]).forEach(function(t){var k=pkxKey(t.nama,t.kota);if(!byKey[k])byKey[k]=t;var n=pkxNorm(t.nama);(byNama[n]=byNama[n]||[]).push(t)});
 raw.forEach(function(r0,i){
  var line=i+2,r={},any=false;
  Object.keys(r0).forEach(function(h){
   var c=PKX_MAP[pkxHdr(h)];if(!c)return;
   var v=r0[h];if(pkxKosong(v))return;
   any=true;if(pkxKosong(r[c.k]))r[c.k]=v;
  });
  if(!any)return;
  function bad(m){err.push({line:line,msg:m})}
  var nama=pkxTeks(r.nama,false);
  if(!nama)return bad('Nama dunia kerja kosong');
  if(/^\(contoh\)/i.test(nama)){contoh++;return}
  if(nama.length>200)return bad('Nama dunia kerja terlalu panjang (maksimal 200 karakter)');
  var p={nama:nama},gagal='';
  PKX_KOL.forEach(function(c){
   if(gagal||c.k==='nama')return;
   var v=r[c.k];if(pkxKosong(v))return;
   var n,s;
   if(c.k==='negeri'){
    s=pkxTeks(v).toLowerCase();
    if(/luar/.test(s))p.negeri='luar';else if(/dalam/.test(s))p.negeri='dalam';else gagal='Lokasi harus "Dalam negeri" atau "Luar negeri": '+pkxTeks(v);
   }else if(c.k==='kuota'){
    n=pkxAngka(v);
    if(n==null||n<0||n>1000||n!==Math.floor(n))gagal='Kuota harus bilangan bulat 0 sampai 1000: '+pkxTeks(v);else p.kuota=n;
   }else if(c.k==='lat'||c.k==='lng'){
    var mx=c.k==='lat'?90:180;n=pkxAngka(v);
    if(n==null||Math.abs(n)>mx)gagal=c.h+' harus angka antara -'+mx+' dan '+mx+': '+pkxTeks(v);else p[c.k]=n;
   }else if(c.k==='radius'){
    n=pkxAngka(v);
    if(n==null||n<=0||n>50000)gagal='Radius harus angka lebih dari 0 (meter): '+pkxTeks(v);else p.radius=Math.round(n);
   }else if(c.k==='pksMulai'||c.k==='pksSelesai'){
    s=pkxTgl(v);
    if(s===null)gagal='Tanggal "'+c.h+'" tidak terbaca (tulis yyyy-mm-dd atau dd/mm/yyyy): '+pkxTeks(v);else p[c.k]=s;
   }else{
    s=pkxTeks(v,c.ml);
    if(s.length>PKX_TEKS)gagal='Kolom "'+c.h+'" terlalu panjang (maksimal '+PKX_TEKS+' karakter)';else p[c.k]=s;
   }
  });
  if(gagal)return bad(gagal);
  if(p.pksMulai&&p.pksSelesai&&p.pksSelesai<p.pksMulai)return bad('PKS selesai lebih awal dari PKS mulai');
  var key=pkxKey(nama,p.kota||'');
  if(seen[key])return bad('Duplikat di dalam berkas (sama dengan baris '+seen[key]+'): '+nama);
  seen[key]=line;
  var ex=byKey[key]||null;
  if(!ex&&!p.kota){var L=byNama[pkxNorm(nama)]||[];if(L.length===1)ex=L[0]}
  if(!ex)return ok.push({line:line,baru:true,rec:null,p:p});
  var beda=Object.keys(p).filter(function(k){
   var cur=ex[k];if(k==='negeri'&&!cur)cur='dalam';if(k==='radius'&&!cur)cur=200;
   return String(cur==null?'':cur)!==String(p[k]);
  });
  if(!beda.length)return same++;
  ok.push({line:line,baru:false,rec:ex,p:p});
 });
 return {ok:ok,err:err,same:same,contoh:contoh};
}
function pkxRakit(it){
 var o=it.rec?Object.assign({},it.rec,it.p):Object.assign({id:uid(),negeri:'dalam',radius:200},it.p);
 if(!o.radius)o.radius=200;
 return o;
}
function pkxRingkas(h){
 var b=h.ok.filter(function(x){return x.baru}).length,u=h.ok.length-b,t=[];
 if(b)t.push(b+' tempat baru');if(u)t.push(u+' diperbarui');if(h.same)t.push(h.same+' tidak berubah');if(h.err.length)t.push(h.err.length+' ditolak');
 return t.join(', ');
}
function pkxGalat(h){
 return h.err.slice(0,6).map(function(x){return 'Baris '+x.line+': '+x.msg}).join('\n')+(h.err.length>6?'\n…dan '+(h.err.length-6)+' lainnya':'');
}
async function pkxTerapkan(items){
 var baru=0,ubah=0,tunda=0;
 for(var i=0;i<items.length;i+=5){
  await Promise.all(items.slice(i,i+5).map(function(it){
   return pkPut('tempat',pkxRakit(it)).then(function(ok){return ok},function(){return false}).then(function(ok){if(it.baru)baru++;else ubah++;if(!ok)tunda++});
  }));
 }
 return {baru:baru,ubah:ubah,tunda:tunda};
}
async function pkxImpor(file){
 if(!file)return;
 if(typeof actRole==='function'&&actRole()==='kepsek'||!isStaff()){toast('Hanya Guru atau Admin yang dapat mengimpor data PKL.');return}
 if(PKX.busy)return;
 if(!needX())return;
 if(PK.loading||!PK.loaded){toast('Data PKL masih dimuat. Coba lagi sebentar.');return}
 PKX.busy=true;
 try{
  var wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
  if(!wb.SheetNames||!wb.SheetNames.length){toast('Berkas tidak berisi lembar data.');return}
  var nm=wb.SheetNames.filter(function(n){return /^tempat\s*pkl$/i.test(n)})[0]||wb.SheetNames[0];
  var raw=XLSX.utils.sheet_to_json(wb.Sheets[nm],{defval:'',raw:true});
  if(!raw.length){toast('Berkas kosong atau judul kolom tidak terbaca. Pakai tombol Template.');return}
  if(!Object.keys(raw[0]).some(function(h){var c=PKX_MAP[pkxHdr(h)];return c&&c.k==='nama'})){toast('Kolom "Nama dunia kerja" tidak ditemukan. Pakai tombol Template.');return}
  if(raw.length>PKX_MAKS){toast('Maksimal '+PKX_MAKS+' baris per impor.');return}
  var h=pkxParse(raw,pkList('tempat'));
  if(!h.ok.length){
   var m0='Tidak ada baris yang dapat diimpor.'+(h.same?' '+h.same+' baris sama dengan data yang sudah ada.':'')+(h.contoh&&!h.err.length&&!h.same?' Hanya baris contoh yang ditemukan.':'')+(h.err.length?'\n\n'+pkxGalat(h):'');
   if(typeof uiInfo==='function')await uiInfo(m0);else toast(m0.split('\n')[0]);
   return;
  }
  var msg='Impor Tempat PKL: '+pkxRingkas(h)+'.'+(h.err.length?'\n\nBaris yang ditolak tidak diimpor:\n'+pkxGalat(h):'')+'\n\nSel kosong tidak menghapus data yang sudah ada.';
  var go=typeof uiConfirm==='function'?await uiConfirm(msg,{ok:'Terapkan '+h.ok.length}):true;
  if(!go)return;
  var r=await pkxTerapkan(h.ok);
  toast('Impor selesai: '+r.baru+' baru, '+r.ubah+' diperbarui'+(h.same?', '+h.same+' tidak berubah':'')+(h.err.length?', '+h.err.length+' ditolak':'')+(r.tunda?'. '+r.tunda+' tersimpan di perangkat dan dikirim saat online.':''));
  render();
 }catch(e){
  toast('Gagal membaca berkas: '+String((e&&e.message)||e).slice(0,100));
 }finally{PKX.busy=false}
}

/* ---------- Ekspor dan template ---------- */
function pkxJudul(){return PKX_KOL.map(function(c){return c.h})}
function pkxBaris(t){
 return PKX_KOL.map(function(c){
  var v=t[c.k];
  if(c.k==='negeri')return v==='luar'?'Luar negeri':'Dalam negeri';
  return v==null?'':v;
 });
}
function pkxPetunjuk(){
 return [['Kolom','Aturan'],
  ['Nama dunia kerja','Wajib. Nama + Kota yang sama dengan data yang sudah ada memperbarui tempat itu; selain itu ditambahkan sebagai tempat baru.'],
  ['Lokasi','Dalam negeri atau Luar negeri. Kosong pada tempat baru = Dalam negeri.'],
  ['Kuota','Bilangan bulat. Kosong atau 0 = tanpa batas kuota.'],
  ['PKS mulai, PKS selesai','Tanggal: yyyy-mm-dd (2027-06-30), dd/mm/yyyy (30/06/2027), atau sel tanggal Excel.'],
  ['Lintang, Bujur','Angka desimal, mis. -6.9175 dan 107.6191 (koma desimal juga diterima). Dipakai untuk cek lokasi absen siswa.'],
  ['Radius (m)','Toleransi jarak absen dalam meter. Kosong pada tempat baru = 200.'],
  ['Telepon/WA, Kontak instruktur','Format kolom sebagai Teks agar angka 0 di depan tidak hilang.'],
  ['Sel kosong','Tidak menghapus isi yang sudah ada pada tempat yang diperbarui.'],
  ['Kolom informasi','Siswa aktif, Status PKS, dan Monitoring terakhir hanya ada di berkas ekspor dan diabaikan saat impor.'],
  ['Baris contoh','Baris yang namanya diawali (CONTOH) dilewati otomatis. Hapus atau ganti dengan data Anda.'],
  ['Batas','Maksimal '+PKX_MAKS+' baris per impor. Impor hanya untuk Guru dan Admin; sebelum diterapkan ada pratinjau jumlah baru, diperbarui, dan ditolak.']];
}
function pkxLebar(extra){return PKX_KOL.map(function(c){return {wch:{nama:32,alamat:34,fasilitas:30,cat:26,bidang:26,instruktur:20,pimpinan:20}[c.k]||16}}).concat(extra?[{wch:12},{wch:20},{wch:18}]:[])}
function pkxTulis(wb,nama){
 var ws=XLSX.utils.aoa_to_sheet(wb.data);ws['!cols']=wb.lebar;
 var ps=XLSX.utils.aoa_to_sheet(pkxPetunjuk());ps['!cols']=[{wch:30},{wch:110}];
 var bk=XLSX.utils.book_new();XLSX.utils.book_append_sheet(bk,ws,'Tempat PKL');XLSX.utils.book_append_sheet(bk,ps,'Petunjuk');
 XLSX.writeFile(bk,nama);
}
function pkxEkspor(){
 if(!needX())return;
 var T=pkList('tempat').slice().sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
 if(!T.length){toast('Belum ada tempat PKL untuk diekspor. Pakai Template untuk mengisi data awal.');return}
 var data=[pkxJudul().concat(PKX_INFO)].concat(T.map(function(t){
  var k=pkKunjunganAkhir(t.id);
  return pkxBaris(t).concat([pkTerisi(t.id,''),pkPksStatus(t)[1],k?k.tanggal:'']);
 }));
 pkxTulis({data:data,lebar:pkxLebar(true)},'tempat-pkl-'+(typeof schKode==='function'&&schKode()||'semua').toLowerCase()+'-'+pkToday()+'.xlsx');
}
function pkxTemplate(){
 if(!needX())return;
 var contoh=['(CONTOH) PT Mitra Otomotif Sejahtera','Bengkel dan servis sepeda motor','Jl. Soekarno-Hatta No. 100','Bandung','Dalam negeri','022-1234567','Bapak Andi (HRD)','Bapak Dedi','081234567890',5,'08.00-16.00','012/PKS/2026','045/MITRA/2026','2026-07-01','2027-06-30','Uang saku dan makan siang',-6.9175,107.6191,200,''];
 pkxTulis({data:[pkxJudul(),contoh],lebar:pkxLebar(false)},'Template_Impor_Tempat_PKL.xlsx');
}

/* ---------- Tombol dan peristiwa ---------- */
function pkxBar(){
 var lihat=typeof actRole==='function'&&actRole()==='kepsek';
 return '<div class="row" style="gap:6px;flex-wrap:wrap">'+(lihat?'':'<label class="btn small" style="cursor:pointer">Impor Excel<input type="file" accept=".xlsx,.xls,.csv" data-pkximp hidden></label><button type="button" class="btn small" data-act="pkl-tpl-tempat">Template</button>')+
  '<button type="button" class="btn small" data-act="pkl-xls-tempat">Ekspor Excel</button><button type="button" class="btn small" data-act="pkl-pdf-tab" data-v="tempat">Cetak PDF</button></div>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="pkl-"]');if(!b||!S.user)return;
 var a=b.dataset.act;
 if(a==='pkl-xls-tempat')pkxEkspor();
 else if(a==='pkl-tpl-tempat'){if(typeof actRole==='function'&&actRole()==='kepsek'){toast('Peran Kepala Sekolah hanya dapat melihat data.');return}pkxTemplate()}
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||t.dataset.pkximp===undefined||!S.user)return;
 var f=t.files&&t.files[0];t.value='';pkxImpor(f);
});
