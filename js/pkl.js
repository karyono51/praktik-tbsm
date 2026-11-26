/* pkl.js: menu Praktik Kerja Lapangan (PKL). Mengacu pada Panduan PKL sebagai Mata Pelajaran (Direktorat SMK, 2023).
   Siswa: tempat dan pembimbing saya, absen masuk/pulang dengan selfie (jam, tanggal, dan lokasi GPS ikut tercatat), izin/sakit, jurnal kegiatan
   (Lampiran 2), daftar tempat PKL. Guru/Admin: Tempat PKL (perjanjian kerja sama, instruktur, kuota, koordinat), Penempatan, Absensi, Jurnal (catatan
   pembimbing), Kunjungan monitoring (minimal sebulan sekali), Nilai (4 TP, Lampiran 4-5), Kelengkapan per siswa, Rekap, dan unduh Excel.
   Penyimpanan: mode lokal di localStorage 'tbsm-pkl'; mode Appwrite di koleksi pkl (tempat, penempatan), pkl_catat (absen, jurnal; dibuat siswa),
   pkl_nilai (kunjungan, nilai, kelengkapan; hanya guru/admin). Selfie dikecilkan (maks 480 px, sekitar 40 KB). Bila fungsi foto-drive terpasang, selfie diunggah ke Google Drive dan payload hanya menyimpan
   'drive:<fileId>' (ditampilkan lewat aksi getpkl); bila belum terpasang, selfie tetap disimpan di payload absen.
   PDF (jsPDF): Daftar Nilai PKL per siswa (Lampiran 5) dan Jurnal PKL (Lampiran 2). */
var PKC={tempat:'pkl',tugas:'pkl',absen:'pkl_catat',jurnal:'pkl_catat',kunjungan:'pkl_nilai',nilai:'pkl_nilai',cek:'pkl_nilai'};
var PKKEY='tbsm-pkl',PKFOTO=40000;
var PKD={cache:{},loading:{},failed:{},q:[],run:0,off:false,tm:0};
var PK={D:{tempat:[],tugas:[],absen:[],jurnal:[],kunjungan:[],nilai:[],cek:[]},loaded:false,loading:false,err:[],tab:'tempat',mode:'list',f:null,fk:'',gps:null,gpsMsg:'',ft:'',flt:{},vis:{},tOpen:false};
ICO.pkl='<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>';
var PK_TIPE={masuk:'Masuk',pulang:'Pulang',izin:'Izin',sakit:'Sakit'};
var PK_CEK=[['pembekalan','Pembekalan PKL selesai'],['pks','Naskah perjanjian kerja sama ditandatangani'],['jaminan','Jaminan kesehatan dan keselamatan kerja tercantum di naskah'],
 ['ortu','Persetujuan orang tua/wali'],['program','Program PKL (TP-ATP) disahkan sekolah dan dunia kerja'],['serah','Penyerahan siswa ke dunia kerja'],['orientasi','Orientasi kerja oleh instruktur'],
 ['laporan','Laporan PKL dikumpulkan'],['presentasi','Presentasi laporan PKL'],['asesInstr','Asesmen instruktur diterima'],['sertifikat','Sertifikat/surat keterangan PKL dari dunia kerja']];
function pkTP(){return (typeof AKD_PKL_TP!=='undefined'&&AKD_PKL_TP.length===4)?AKD_PKL_TP:['Soft skills','Norma, POS, dan K3LH','Kompetensi teknis','Alur bisnis dan wawasan wirausaha']}

/* ---------- Data ---------- */
function pkToday(){return ymd(Date.now())}
function pkJam(ts){var d=new Date(ts||Date.now());return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function pkOk(o){return typeof schAkunOk==='function'?schAkunOk({sekolah:o.sekolah||''}):true}
function pkList(k){return PK.D[k].filter(pkOk)}
function pkById(k,id){return PK.D[k].filter(function(x){return x.id===id})[0]||null}
function pkSaveLocal(){
 var out={};
 Object.keys(PK.D).forEach(function(k){out[k]=PK.D[k].map(function(o){
  if(Cloud.on&&o.r&&!o.d&&typeof o.foto==='string'&&o.foto.indexOf('data:')===0){var c=Object.assign({},o);delete c.foto;c.fotoAda=1;return c}return o})});
 try{localStorage.setItem(PKKEY,JSON.stringify(out))}catch(e){toast('Penyimpanan perangkat penuh: data PKL tidak tersalin di perangkat.')}
}
function pkLoadLocal(){
 try{var j=JSON.parse(localStorage.getItem(PKKEY)||'null');if(j)Object.keys(PK.D).forEach(function(k){if(Array.isArray(j[k]))PK.D[k]=j[k]})}catch(e){}
}
function pkPack(k,o){
 var rest={};Object.keys(o).forEach(function(x){if(['r','d','err','fotoAda'].indexOf(x)<0)rest[x]=o[x]});
 return {jenis:k,sekolah:String(o.sekolah||'').slice(0,8),nama:k==='tugas'?'':String(o.nama||o.judul||'').slice(0,200),ts:o.ts||Date.now(),oleh:String((S.user&&S.user.id)||'').slice(0,64),
  sid:String(o.sid||'').slice(0,64),tanggal:String(o.tanggal||'').slice(0,10),payload:JSON.stringify(rest)};
}
function pkParse(d){
 var o={};try{o=JSON.parse(d.payload||'{}')}catch(e){}
 o.id=d.$id;o.jenis=d.jenis;o.ts=d.ts;o.sid=d.sid||o.sid||'';o.tanggal=d.tanggal||o.tanggal||'';o.sekolah=d.sekolah||o.sekolah||'';o.r=1;o.d=0;return o;
}
function pkSlug(x,n){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,n)}
/* Unggah selfie ke Drive lewat fungsi foto-drive (ldCall di lkpd-drive.js). Fungsi belum dipasang: selfie tetap di payload. Galat lain: dilempar, absen diulang nanti. */
async function pkUploadFoto(o){
 if(!Cloud.on||PKD.off||typeof ldCall!=='function'||typeof o.foto!=='string'||o.foto.indexOf('data:')!==0)return;
 var u=pkUser(o.sid)||S.user||{},nama=['PKL',pkSlug(o.kelas||u.kelas,8),pkSlug(o.nama||u.nama,30),o.tipe,String(o.tanggal||'').replace(/-/g,'')+'-'+String(o.jam||'').replace(':',''),pkSlug(String(o.id).slice(-4),4)].filter(Boolean).join('_');
 try{
  var r=await ldCall({action:'upload',data:o.foto,nama:nama});
  PKD.cache[r.fileId]=o.foto;o.foto='drive:'+r.fileId;
 }catch(e){
  if(e&&(e.code===404||/could not be found|not found/i.test(e.message||''))&&!e.status){PKD.off=true;return}
  throw e;
 }
}
/* Sumber gambar selfie: data URL langsung, atau dari Drive (diambil bertahap, maks 3 sekaligus) */
function pkFotoSrc(a){
 var f=a&&a.foto||'';if(f.indexOf('drive:')!==0)return f;
 var id=f.slice(6);if(PKD.cache[id])return PKD.cache[id];
 if(typeof ldCall==='function'&&!PKD.loading[id]&&!(PKD.failed[id]&&Date.now()-PKD.failed[id]<30000)){PKD.loading[id]=1;PKD.q.push([a.id,id]);pkPump()}
 return '';
}
function pkPump(){
 while(PKD.run<3&&PKD.q.length){
  var j=PKD.q.shift();PKD.run++;
  (function(docId,id){
   ldCall({action:'getpkl',docId:docId,fileId:id}).then(function(r){PKD.cache[id]=r.data}).catch(function(){PKD.failed[id]=Date.now()})
    .then(function(){PKD.run--;delete PKD.loading[id];pkPump();if(!PKD.tm){PKD.tm=setTimeout(function(){PKD.tm=0;if(S.tab==='pkl'&&PK.mode!=='form')render()},200)}});
  })(j[0],j[1]);
 }
}
async function pkRemote(k,o){
 if(!Cloud.on||!Cloud.db)return true;
 var col=PKC[k];
 try{
  if(k==='absen')await pkUploadFoto(o);
  var data=pkPack(k,o);
  if(!o.r){
   try{await Cloud.db.createDocument(CFG.DB,col,o.id,data)}
   catch(e){if(e&&e.code===409)await Cloud.db.updateDocument(CFG.DB,col,o.id,data);else throw e}
   o.r=1;
  }else await Cloud.db.updateDocument(CFG.DB,col,o.id,data);
  o.d=0;delete o.err;pkSaveLocal();return true;
 }catch(e){o.err=(e&&e.message)||'gagal';pkSaveLocal();return false}
}
async function pkFlush(){
 for(var k in PK.D){for(var i=0;i<PK.D[k].length;i++){var o=PK.D[k][i];if(!o.r||o.d)await pkRemote(k,o)}}
}
async function pkLoad(){
 if(PK.loading||!S.user)return;
 PK.loading=true;PK.err=[];
 try{
  if(!PK.loaded)pkLoadLocal();
  if(Cloud.on&&Cloud.db&&navigator.onLine!==false){
   await pkFlush();
   var Q=Appwrite.Query,me=S.user.id,jobs=[];
   if(isStaff()){['pkl','pkl_catat','pkl_nilai'].forEach(function(c){jobs.push([c,[]])})}
   else{jobs.push(['pkl',[Q.equal('jenis',['tempat'])]],['pkl',[Q.equal('sid',[me])]],['pkl_catat',[Q.equal('sid',[me])]])}
   var rows={},okCol={};
   await Promise.all(jobs.map(async function(j){
    try{(await Cloud.list(j[0],j[1])).forEach(function(d){var o=pkParse(d);if(PK.D[o.jenis])(rows[o.jenis]=rows[o.jenis]||[]).push(o)});okCol[j[0]]=(okCol[j[0]]===false)?false:true}
    catch(e){okCol[j[0]]=false;PK.err.push(j[0]+': '+((e&&e.message)||e))}
   }));
   Object.keys(PK.D).forEach(function(k){
    if(okCol[PKC[k]]!==true)return;
    var keep=PK.D[k].filter(function(x){return !x.r||x.d}),neu=(rows[k]||[]).slice();
    keep.forEach(function(x){var i=neu.findIndex(function(y){return y.id===x.id});if(i<0)neu.push(x);else neu[i]=x});
    PK.D[k]=neu;
   });
   pkSaveLocal();
  }else if(Cloud.on)PK.err.push('Offline: memakai salinan terakhir di perangkat.');
 }finally{PK.loading=false;PK.loaded=true;if(S.tab==='pkl')render()}
}
function pkPut(k,o){
 o.ts=Date.now();o.sekolah=o.sekolah||(typeof schKode==='function'?schKode():'')||'';o.d=1;
 var a=PK.D[k],i=a.findIndex(function(x){return x.id===o.id});if(i<0)a.push(o);else a[i]=o;
 pkSaveLocal();
 if(!Cloud.on){o.r=1;o.d=0;pkSaveLocal();return Promise.resolve(true)}
 return pkRemote(k,o);
}
async function pkDel(k,id){
 var a=PK.D[k],i=a.findIndex(function(x){return x.id===id});if(i<0)return;
 var o=a[i];a.splice(i,1);pkSaveLocal();
 if(Cloud.on&&o.r){var ok=await Cloud.remove(PKC[k],id);if(!ok){a.push(o);pkSaveLocal()}}
}

/* ---------- Orang dan tempat ---------- */
function pkSiswaAll(){return S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&(typeof schAkunOk!=='function'||schAkunOk(u))}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')})}
function pkGuruAll(){return S.users.filter(function(u){return hasRole(u,'guru')&&u.aktif!==false&&(typeof schAkunOk!=='function'||schAkunOk(u))}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')})}
function pkUser(id){return S.users.filter(function(u){return u.id===id})[0]||null}
function pkTugasSiswa(sid){var L=pkList('tugas').filter(function(t){return t.sid===sid&&t.status!=='dibatalkan'});return L.filter(function(t){return t.status!=='selesai'})[0]||L[0]||null}
/* Penempatan tersimpan di koleksi pkl yang dapat dibaca semua pengguna login, jadi tanpa nama siswa: nama dan kelas diambil dari akun lewat sid. */
function pkNm(o){var u=pkUser(o.sid);return (u&&u.nama)||o.nama||'(siswa tidak ditemukan)'}
function pkKl(o){var u=pkUser(o.sid);return (u&&u.kelas)||o.kelas||''}
function pkTempatNama(id){var t=pkById('tempat',id);return t?t.nama:'(tempat dihapus)'}
function pkJarak(a,b,c,d){var R=6371000,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return Math.round(2*R*Math.asin(Math.min(1,Math.sqrt(h))))}
function pkPksStatus(t){
 if(!t.pks&&!t.pksMitra)return ['bad','Perjanjian belum diisi'];
 if(t.pksSelesai&&t.pksSelesai<pkToday())return ['bad','Perjanjian berakhir'];
 return ['ok','Perjanjian berlaku'];
}
function pkKunjunganAkhir(tid){var L=pkList('kunjungan').filter(function(k){return k.tempatId===tid}).sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))});return L[0]||null}
function pkHariSejak(tgl){if(!tgl)return null;return Math.floor((Date.parse(pkToday())-Date.parse(tgl))/86400000)}

/* ---------- Rekap kehadiran ---------- */
function pkHariKerja(a,b){
 if(!a||!b||b<a)return 0;var n=0,d=new Date(a+'T00:00:00'),e=new Date(b+'T00:00:00');
 for(;d<=e;d.setDate(d.getDate()+1)){var w=d.getDay();if(w>0&&w<6)n++}return n;
}
function pkRekap(sid){
 var t=pkTugasSiswa(sid),A=pkList('absen').filter(function(x){return x.sid===sid}),from=t&&t.mulai||'',to=t&&t.selesai&&t.selesai<pkToday()?t.selesai:pkToday();
 if(from)A=A.filter(function(x){return x.tanggal>=from&&x.tanggal<=to});
 function hari(tp){var s={};A.filter(function(x){return x.tipe===tp}).forEach(function(x){s[x.tanggal]=1});return Object.keys(s)}
 var h=hari('masuk'),iz=hari('izin'),sk=hari('sakit'),ada={};h.concat(iz,sk).forEach(function(x){ada[x]=1});
 var hk=from?pkHariKerja(from,to):0,alpa=from?Math.max(0,hk-Object.keys(ada).length):0;
 return {hadir:h.length,izin:iz.length,sakit:sk.length,alpa:alpa,hk:hk,luar:A.filter(function(x){return x.tipe==='masuk'&&x.lokasi==='tidak'}).length};
}
function pkNilaiAkhir(n){
 if(!n)return null;var s=[1,2,3,4].map(function(i){return n['tp'+i]===''||n['tp'+i]==null?null:+n['tp'+i]}).filter(function(x){return x!==null&&!isNaN(x)});
 return s.length?Math.round(s.reduce(function(a,b){return a+b},0)/s.length*10)/10:null;
}
function pkPredikat(v){return v==null?'':v>=90?'Sangat baik':v>=75?'Baik':v>=60?'Cukup':'Perlu bimbingan'}

/* ---------- Pilihan (select) yang sistematis ----------
   Semua <select> PKL (isian formulir dan saringan tab) dibuat dari SATU bentuk data lewat SATU pembangun, pkSelectHtml, supaya lembar pilihan
   buatan aplikasi (js/bank-pilihan.js) terpakai penuh: judul lembar (data-judul), keterangan kecil tiap pilihan (data-ket), kelompok (optgroup),
   pilihan kosong yang terpisah (value=""), pilihan nonaktif, dan kotak Cari (otomatis bila 8 pilihan atau lebih).
   Bentuk data: opsi = {v:nilai, l:teks, ket:keterangan, off:true bila tidak boleh dipilih}; kelompok = {g:judul, o:[opsi]}; daftar = larik opsi/kelompok.
   Daftar lama berbentuk [nilai,teks,ket] tetap diterima. Nilai yang sedang tersimpan tapi sudah tidak ada di daftar (akun nonaktif, tempat dihapus)
   tetap ditampilkan agar ubah data tidak mengosongkannya diam-diam, dan opsi nonaktif yang sedang terpilih tidak ikut dinonaktifkan. */
function pkO(v,l,ket,off){return {v:v,l:l,ket:ket||'',off:!!off}}
function pkG(g,o){return {g:g,o:o}}
function pkNorm(L){return (L||[]).map(function(x){return Array.isArray(x)?pkO(x[0],x[1],x[2],x[3]):x})}
function pkFlat(L){var out=[];pkNorm(L).forEach(function(x){if(x.o)x.o.forEach(function(y){out.push(y)});else out.push(x)});return out}
function pkSelectHtml(attr,L,cur,opt){
 opt=opt||{};cur=cur==null?'':String(cur);L=pkNorm(L);
 if(cur&&!pkFlat(L).some(function(o){return String(o.v)===cur}))L=L.concat([pkO(cur,opt.fb||'(data tidak ditemukan)','Pilih ulang')]);
 function one(o){return '<option value="'+esc(o.v)+'"'+(o.ket?' data-ket="'+esc(o.ket)+'"':'')+(String(o.v)===cur?' selected':(o.off?' disabled':''))+'>'+esc(o.l)+'</option>'}
 var h=L.map(function(x){return x.o?(x.o.length?'<optgroup label="'+esc(x.g)+'">'+x.o.map(one).join('')+'</optgroup>':''):one(x)}).join(''),
  a=(opt.judul?' data-judul="'+esc(opt.judul)+'"':'')+(opt.cari?' data-cari':'')+(opt.tanpaCari?' data-tanpa-cari':''),
  sel=pkFlat(L).filter(function(o){return String(o.v)===cur})[0];
 return {html:'<select'+attr+a+'>'+h+'</select>',ket:sel&&sel.ket||''};
}
function pkUrutNama(a,b){return String(a.nama).localeCompare(String(b.nama),'id')}
function pkAktifTugas(sid,exc){return pkList('tugas').filter(function(t){return t.sid===sid&&t.status==='aktif'&&t.id!==exc})[0]||null}
function pkTerisi(tid,exc){return pkList('tugas').filter(function(t){return t.tempatId===tid&&t.status==='aktif'&&t.id!==exc}).length}
function pkBimbing(gid,exc){return pkList('tugas').filter(function(t){return t.guruId===gid&&t.status==='aktif'&&t.id!==exc}).length}
/* Siswa. ctx 'tugas': yang belum punya penempatan aktif lebih dulu, yang sudah punya dinonaktifkan (aturan satu penempatan aktif). ctx 'nilai': belum dinilai, sudah dinilai, belum ditempatkan. */
function pkOptSiswa(ctx,f){
 var exc=f&&f.id||'',cur=f&&f.sid||'',A=[],B=[],C=[];
 pkSiswaAll().filter(pkPeserta).forEach(function(u){
  var lab=u.nama+(u.kelas?' ('+u.kelas+')':'');
  if(ctx==='nilai'){
   var n=pkList('nilai').filter(function(x){return x.sid===u.id})[0],tt=pkTugasSiswa(u.id),tn=tt?pkTempatNama(tt.tempatId):'';
   if(n)B.push(pkO(u.id,lab,'Nilai akhir '+(pkNilaiAkhir(n)==null?'-':pkNilaiAkhir(n))+(tn?' · '+tn:'')));
   else if(tt)A.push(pkO(u.id,lab,tn));
   else C.push(pkO(u.id,lab,'Belum ditempatkan'));
  }else{
   var tg=pkAktifTugas(u.id,exc);
   if(tg)B.push(pkO(u.id,lab,'Sudah aktif di '+pkTempatNama(tg.tempatId),true));else A.push(pkO(u.id,lab,''));
  }
 });
 var ada=pkSiswaAll().some(function(u){return u.id===cur});
 if(cur&&!ada){var uu=pkUser(cur);A.unshift(pkO(cur,uu?uu.nama+(uu.kelas?' ('+uu.kelas+')':''):'(siswa tidak ditemukan)','Akun tidak aktif'))}
 return [pkO('','(pilih siswa)')].concat(ctx==='nilai'?[pkG('Belum dinilai',A),pkG('Sudah dinilai',B),pkG('Belum ditempatkan',C)]:[pkG('Belum ditempatkan',A),pkG('Sudah punya penempatan aktif',B)]);
}
/* Tempat. ctx 'tugas': yang masih ada kuota lebih dulu, yang penuh dinonaktifkan. ctx 'kunjungan': yang perlu monitoring (lebih dari 30 hari tanpa kunjungan) lebih dulu. */
function pkOptTempat(ctx,f){
 var exc=ctx==='tugas'&&f&&f.id||'',A=[],B=[],C=[];
 pkList('tempat').slice().sort(pkUrutNama).forEach(function(t){
  var n=pkTerisi(t.id,exc),kuota=+t.kuota||0,isi=n+(kuota?'/'+kuota:'')+' siswa',ps=pkPksStatus(t),k=pkKunjunganAkhir(t.id),h=k?pkHariSejak(k.tanggal):null;
  if(ctx==='tugas'){
   var penuh=!!kuota&&n>=kuota;
   (penuh?B:A).push(pkO(t.id,t.nama,[t.kota,isi,ps[0]==='bad'?ps[1]:''].filter(Boolean).join(' · '),penuh));
  }else{
   (n?(h==null||h>30?A:B):C).push(pkO(t.id,t.nama,[t.kota,isi,k?'Terakhir dikunjungi '+h+' hari lalu':'Belum pernah dikunjungi'].filter(Boolean).join(' · ')));
  }
 });
 return [pkO('','(pilih tempat PKL)')].concat(ctx==='tugas'?[pkG('Masih ada kuota',A),pkG('Kuota penuh',B)]:[pkG('Perlu monitoring (lebih dari 30 hari)',A),pkG('Sudah dipantau',B),pkG('Belum ada siswa aktif',C)]);
}
function pkOptGuru(){
 return [pkO('','(pilih guru pembimbing)')].concat(pkGuruAll().map(function(u){var n=pkBimbing(u.id,'');return pkO(u.id,u.nama,n?n+' siswa bimbingan aktif':'Belum membimbing siswa')}));
}
var PK_NEGERI=[['dalam','Dalam negeri'],['luar','Luar negeri']];
var PK_STATUS=[['aktif','Aktif','Dihitung dalam kuota tempat'],['selesai','Selesai','Tidak dihitung dalam kuota'],['dibatalkan','Dibatalkan','Tidak dihitung dalam kuota dan rekap']];
var PK_VERIF=[['','Belum diketahui'],['instruktur','Instruktur'],['guru','Guru pembimbing'],['keduanya','Instruktur dan guru']];
var PK_MODE=[['luring','Kunjungan langsung','Datang ke tempat PKL'],['daring','Daring (telepon/video)','Tanpa datang ke tempat PKL']];
/* Pilihan yang memicu perubahan isian lain. Mengembalikan true bila formulir perlu digambar ulang. */
var PK_HOOK={
 tugas:{tempatId:function(f,v){var tp=pkById('tempat',v);if(tp&&!f.instruktur)f.instruktur=tp.instruktur||'';return true}},
 kunjungan:{tempatId:function(f,v){if(f.guruId)return false;var g=pkList('tugas').filter(function(x){return x.tempatId===v&&x.status==='aktif'&&x.guruId})[0];if(!g)return false;f.guruId=g.guruId;return true}}
};
function pkKetPerbarui(t){
 try{var op=t.options&&t.options[t.selectedIndex],el=t.parentNode&&t.parentNode.querySelector&&t.parentNode.querySelector('[data-pkket]');if(!el)return;var k=op&&op.getAttribute&&op.getAttribute('data-ket')||'';el.textContent=k;el.hidden=!k}catch(x){}
}

/* ---------- Form generik ---------- */
function PF(k,l,t,x){return Object.assign({k:k,l:l,t:t||'text'},x||{})}
function pkSchema(k){
 var tp=pkTP(),
  S1=function(ctx){return {o:function(f){return pkOptSiswa(ctx,f)},jd:'Pilih siswa',cari:true,fb:'(siswa tidak ditemukan)'}},
  T1=function(ctx){return {o:function(f){return pkOptTempat(ctx,f)},jd:'Pilih tempat PKL',fb:'(tempat dihapus)'}},
  G1=function(){return {o:function(){return pkOptGuru()},jd:'Pilih guru pembimbing',fb:'(guru tidak ditemukan)'}};
 return {
  tempat:[PF('nama','Nama dunia kerja','text',{r:1}),PF('bidang','Bidang usaha / kompetensi yang dilatih'),PF('alamat','Alamat','textarea'),PF('kota','Kota/kabupaten'),
   PF('negeri','Lokasi','select',{o:PK_NEGERI,jd:'Lokasi tempat PKL'}),PF('telp','Telepon/WA kantor'),PF('pimpinan','Pimpinan/HRD'),PF('instruktur','Instruktur (pembimbing dunia kerja)'),
   PF('instrTelp','Kontak instruktur'),PF('kuota','Kuota siswa','number'),PF('jam','Jam kerja (siswa hanya shift pagi/siang)','text',{ph:'mis. 08.00-16.00'}),
   PF('pks','No. perjanjian kerja sama (sekolah)'),PF('pksMitra','No. perjanjian kerja sama (dunia kerja)'),PF('pksMulai','Perjanjian berlaku mulai','date'),PF('pksSelesai','Perjanjian berlaku sampai','date'),
   PF('fasilitas','Fasilitas/insentif (transport, konsumsi, uang saku)','textarea'),PF('lat','Lintang lokasi (untuk cek lokasi absen)','text',{ph:'mis. -6.9175'}),PF('lng','Bujur lokasi','text',{ph:'mis. 107.6191'}),
   PF('radius','Radius lokasi absen (meter)','number',{ph:'200'}),PF('cat','Catatan','textarea')],
  tugas:[PF('sid','Siswa','select',Object.assign({r:1},S1('tugas'))),PF('tempatId','Tempat PKL','select',Object.assign({r:1},T1('tugas'))),PF('guruId','Guru pembimbing','select',G1('tugas')),PF('instruktur','Instruktur (kosongkan = ikut tempat)'),
   PF('mulai','Mulai PKL','date',{r:1}),PF('selesai','Selesai PKL','date',{r:1}),PF('status','Status','select',{o:PK_STATUS,jd:'Status penempatan'})],
  jurnal:[PF('tanggal','Tanggal','date',{r:1}),PF('unit','Unit kerja / pekerjaan','text',{r:1}),PF('uraian','Uraian kegiatan','textarea',{r:1})],
  jurnalcat:[PF('cat','Catatan instruktur / pembimbing','textarea'),PF('verif','Diketahui oleh','select',{o:PK_VERIF,jd:'Diketahui oleh'})],
  kunjungan:[PF('tanggal','Tanggal','date',{r:1}),PF('tempatId','Tempat PKL','select',Object.assign({r:1},T1('kunjungan'))),PF('guruId','Guru pembimbing','select',G1('kunjungan')),
   PF('mode','Cara','select',{o:PK_MODE,jd:'Cara kunjungan'}),PF('temuan','Temuan (penempatan, kesesuaian pekerjaan, kondisi siswa)','textarea'),PF('tindak','Tindak lanjut','textarea')],
  nilai:[PF('sid','Siswa','select',Object.assign({r:1},S1('nilai'))),PF('tp1','TP 1 · '+tp[0],'number',{ph:'0-100'}),PF('tp2','TP 2 · '+tp[1],'number',{ph:'0-100'}),PF('tp3','TP 3 · '+tp[2],'number',{ph:'0-100'}),PF('tp4','TP 4 · '+tp[3],'number',{ph:'0-100'}),
   PF('catGuru','Catatan guru pembimbing','textarea'),PF('catInstr','Catatan instruktur dunia kerja','textarea')]
 }[k]||[];
}
function pkField(fl,val,f){
 var n=' data-pkl="'+fl.k+'"',v=val==null?'':val,h;
 if(fl.t==='textarea')h='<textarea rows="2"'+n+'>'+esc(v)+'</textarea>';
 else if(fl.t==='select'){
  var r=pkSelectHtml(n,typeof fl.o==='function'?fl.o(f||{}):fl.o,v,{judul:fl.jd||fl.l,cari:fl.cari,fb:fl.fb});
  h=r.html+'<span class="pk-ket" data-pkket'+(r.ket?'':' hidden')+'>'+esc(r.ket)+'</span>';
 }
 else h='<input'+n+' type="'+(fl.t==='number'?'number" inputmode="decimal':fl.t)+'" value="'+esc(v)+'"'+(fl.ph?' placeholder="'+esc(fl.ph)+'"':'')+'>';
 return '<label class="f">'+esc(fl.l)+(fl.r?' *':'')+h+'</label>';
}

/* ---------- Saringan (select) per tab ----------
   Tiap tab daftar punya baris saringan dari satu tabel (PK_SARING). Pilihannya diambil dari data tab itu sendiri, dengan jumlah data di keterangannya,
   dan saringan yang nilainya sudah tidak ada otomatis dikosongkan. Keadaan disimpan di PK.flt[tab][atribut]. */
var PK_SARING={tempat:['kota','bidang','pks','monitor'],tugas:['tempat','kelas','guru','status'],absen:['tempat','kelas','siswa','tipe'],jurnal:['tempat','kelas','siswa','verif'],
 kunjungan:['tempat','guru','mode'],nilai:['kelas','tempat','siswa'],cek:['tempat','kelas','siswa'],rekap:['tempat','kelas','guru'],daftar:['kota','bidang']};
var PK_SL={tempat:['Tempat PKL','Semua tempat'],kelas:['Kelas','Semua kelas'],siswa:['Siswa','Semua siswa'],guru:['Guru pembimbing','Semua guru'],status:['Status','Semua status'],tipe:['Jenis absen','Semua jenis'],
 verif:['Catatan','Semua jurnal'],mode:['Cara','Semua cara'],kota:['Kota','Semua kota'],bidang:['Bidang usaha','Semua bidang'],pks:['Perjanjian','Semua status'],monitor:['Monitoring','Semua tempat']};
var PK_SATUAN={tempat:'tempat',tugas:'penempatan',absen:'catatan',jurnal:'jurnal',kunjungan:'kunjungan',nilai:'nilai',cek:'siswa',rekap:'siswa',daftar:'tempat'};
var PK_TETAP={status:{aktif:'Aktif',selesai:'Selesai',dibatalkan:'Dibatalkan'},tipe:PK_TIPE,verif:{belum:'Belum diberi catatan',sudah:'Sudah diketahui'},mode:{luring:'Kunjungan langsung',daring:'Daring'},monitor:{perlu:'Perlu monitoring',aman:'Tidak perlu'}};
function pkAttr(a,o){
 if(a==='tempat')return o.tempatId||'';
 if(a==='kelas')return pkKl(o)||'';
 if(a==='siswa')return o.sid||'';
 if(a==='guru')return o.guruId||'';
 if(a==='status')return o.status||'aktif';
 if(a==='tipe')return o.tipe||'';
 if(a==='verif')return o.verif?'sudah':'belum';
 if(a==='mode')return o.mode==='daring'?'daring':'luring';
 if(a==='kota'||a==='bidang')return String(o[a]||'').trim().toLowerCase();
 if(a==='pks')return pkPksStatus(o)[1];
 if(a==='monitor'){var k=pkKunjunganAkhir(o.id),h=k?pkHariSejak(k.tanggal):null;return pkTerisi(o.id,'')&&(h==null||h>30)?'perlu':'aman'}
 return '';
}
function pkAttrLabel(a,v,o){
 if(a==='tempat')return pkTempatNama(v);
 if(a==='siswa')return pkNm(o);
 if(a==='guru'){var g=pkUser(v);return g?g.nama:(o.guruNama||v)}
 if(PK_TETAP[a])return PK_TETAP[a][v]||v;
 if(a==='kota'||a==='bidang')return String(o[a]||'').trim();
 return v;
}
function pkSaring(tab,recs,get){
 get=get||function(x){return x};
 var S0=PK.flt[tab]=PK.flt[tab]||{},bar='',aktif=0,out=recs,sat=PK_SATUAN[tab]||'data';
 (recs.length?PK_SARING[tab]||[]:[]).forEach(function(a){
  var cnt={},lab={},fixed=PK_TETAP[a];
  recs.forEach(function(r){var o=get(r),v=pkAttr(a,o);if(v===''||v==null)return;cnt[v]=(cnt[v]||0)+1;if(lab[v]===undefined)lab[v]=pkAttrLabel(a,v,o)});
  if(fixed)Object.keys(fixed).forEach(function(v){if(cnt[v]===undefined)cnt[v]=0;lab[v]=fixed[v]});
  var keys=Object.keys(lab);if(!fixed)keys.sort(function(x,y){return String(lab[x]).localeCompare(String(lab[y]),'id')});
  if(!keys.length)return;
  var cur=S0[a]||'';if(cur&&keys.indexOf(cur)<0){cur='';S0[a]=''}
  if(cur){aktif++;out=out.filter(function(r){return pkAttr(a,get(r))===cur})}
  bar+='<label class="f">'+esc(PK_SL[a][0])+pkSelectHtml(' data-pkfilter="'+tab+':'+a+'"',[pkO('',PK_SL[a][1])].concat(keys.map(function(v){return pkO(v,lab[v],cnt[v]+' '+sat)})),cur,{judul:'Saring: '+PK_SL[a][0]}).html+'</label>';
 });
 return {list:out,aktif:aktif,bar:bar?'<div class="pk-bar">'+bar+'</div>'+(aktif?'<div class="note">Menampilkan '+out.length+' dari '+recs.length+' '+sat+'. <button type="button" class="btn small" data-act="pkl-flt-reset" data-v="'+tab+'">Setel ulang saringan</button></div>':''):''};
}
function pkDefault(k){
 var t=pkToday();
 if(k==='tempat')return {negeri:'dalam',radius:200};
 if(k==='tugas')return {status:'aktif',mulai:t};
 if(k==='jurnal'||k==='kunjungan')return {tanggal:t,mode:'luring'};
 return {};
}
var PK_JUDUL={tempat:'Tempat PKL',tugas:'Penempatan siswa',jurnal:'Jurnal kegiatan',jurnalcat:'Catatan jurnal',kunjungan:'Kunjungan monitoring',nilai:'Nilai PKL'};
/* Tombol Simpan/Batal ada di atas formulir (tidak perlu menggulir), disusul pesan galat tepat di bawahnya. */
function pkAksiAtas(aksi,label){
 return '<div class="row pk-aksi" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" data-act="'+aksi+'">'+esc(label)+'</button><button type="button" class="btn" data-act="pkl-cancel">Batal</button></div>'+(PK.msg?'<div class="err">'+esc(PK.msg)+'</div>':'');
}
function pkFormView(){
 var k=PK.fk,sk=k==='jurnalcat'?'jurnalcat':k,F=pkSchema(sk),f=PK.f||{};
 var h='<div class="card"><b>'+esc(PK_JUDUL[k]||k)+(f.id?' · ubah':' · baru')+'</b>'+pkAksiAtas('pkl-save','Simpan');
 if(k==='jurnalcat'&&f.uraian)h+='<div class="note">'+esc(f.tanggal)+' · '+esc(f.unit||'')+' · '+esc(f.uraian)+'</div>';
 h+=F.map(function(fl){return pkField(fl,f[fl.k],f)}).join('');
 if(k==='nilai')h+='<div class="note" id="pk-na">'+pkNilaiTeks(f)+'</div>';
 return h+'</div>';
}
function pkNilaiTeks(f){var v=pkNilaiAkhir(f);return v==null?'Nilai akhir: isi minimal satu TP (rata-rata keempat TP).':'Nilai akhir (rata-rata TP yang terisi): <b>'+v+'</b> · '+pkPredikat(v)}

/* ---------- Absen dengan selfie ---------- */
function pkGps(){
 PK.gps=null;
 if(!navigator.geolocation){PK.gpsMsg='Perangkat tidak mendukung lokasi.';return}
 PK.gpsMsg='Mengambil lokasi…';
 navigator.geolocation.getCurrentPosition(function(p){
  PK.gps={lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy)};PK.gpsMsg='';if(S.tab==='pkl'&&PK.mode==='absen')render();
 },function(){PK.gpsMsg='Lokasi tidak tersedia. Aktifkan izin lokasi agar kehadiran tercatat di tempat PKL.';if(S.tab==='pkl'&&PK.mode==='absen')render()},{enableHighAccuracy:true,timeout:12000,maximumAge:30000});
}
function pkCompress(file,cb,cap){
 var img=new Image(),url=URL.createObjectURL(file);
 img.onerror=function(){URL.revokeObjectURL(url);cb(null)};
 img.onload=function(){
  var side=480,out=null,now=new Date(),cap2=cap||(pkToday()+' '+pkJam());
  for(var t=0;t<4&&!out;t++){
   var k=Math.min(1,side/Math.max(img.width,img.height)),c=document.createElement('canvas');
   c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));
   var g=c.getContext('2d');g.drawImage(img,0,0,c.width,c.height);
   g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,c.height-22,c.width,22);g.fillStyle='#fff';g.font='13px sans-serif';g.fillText(cap2,8,c.height-7);
   for(var q=.7;q>=.4;q-=.1){var u=c.toDataURL('image/jpeg',q);if(u.length<=PKFOTO){out=u;break}}
   side=Math.round(side*.75);
  }
  URL.revokeObjectURL(url);cb(out);
 };
 img.src=url;
}
function pkAbsenBuka(){
 var me=S.user.id,t=pkToday(),A=pkList('absen').filter(function(x){return x.sid===me&&x.tanggal===t}),has=function(tp){return A.some(function(x){return x.tipe===tp})};
 PK.mode='absen';PK.msg='';PK.f={tipe:has('masuk')?(has('pulang')?'masuk':'pulang'):'masuk',cat:'',foto:''};pkGps();render();
}
function pkAbsenView(){
 var f=PK.f||{},tg=pkTugasSiswa(S.user.id),tp=tg&&pkById('tempat',tg.tempatId),needFoto=f.tipe==='masuk'||f.tipe==='pulang';
 var h='<div class="card"><b>Absen PKL</b>'+pkAksiAtas('pkl-absen-kirim','Kirim absen')+'<div class="note">'+esc(pkToday())+' · '+esc(pkJam())+(tp?' · '+esc(tp.nama):'')+'</div>';
 h+='<div class="chips" role="group" aria-label="Jenis absen">'+Object.keys(PK_TIPE).map(function(k){return '<button type="button" data-act="pkl-tipe" data-v="'+k+'" aria-pressed="'+(f.tipe===k)+'">'+PK_TIPE[k]+'</button>'}).join('')+'</div>';
 h+='<div class="pk-row">'+(f.foto?'<img class="pk-pv" src="'+f.foto+'" alt="Selfie absen">':'<div class="pk-pv pk-kosong">'+(needFoto?'Selfie wajib':'Foto surat/bukti (opsional)')+'</div>')+
  '<div style="display:grid;gap:8px"><button type="button" class="btn primary" data-act="pkl-selfie">'+svg(ICO.camera||'',18)+' '+(f.foto?'Ulangi foto':(needFoto?'Ambil selfie':'Ambil foto'))+'</button>'+
  '<input type="file" accept="image/*" capture="user" data-pklfoto hidden></div></div>';
 var g=PK.gps,msg=PK.gpsMsg;
 h+='<div class="note">'+(g?'Lokasi terbaca (akurasi ±'+g.acc+' m).':esc(msg||'Lokasi belum terbaca.'))+(g&&tp&&tp.lat&&tp.lng&&!isNaN(+tp.lat)&&!isNaN(+tp.lng)?' Jarak ke tempat PKL ±'+pkJarak(+tp.lat,+tp.lng,g.lat,g.lng)+' m.':'')+' <button type="button" class="btn small" data-act="pkl-gps">Muat ulang lokasi</button></div>';
 h+='<label class="f">Catatan'+(needFoto?' (opsional)':' / keterangan *')+'<textarea rows="2" data-pkl="cat">'+esc(f.cat||'')+'</textarea></label>';
 return h+'</div>';
}
function pkAbsenKirim(){
 var f=PK.f||{},me=S.user,tg=pkTugasSiswa(me.id),t=pkToday(),tipe=f.tipe,needFoto=tipe==='masuk'||tipe==='pulang';
 if(!tg){PK.msg='Anda belum ditempatkan di tempat PKL. Hubungi guru pembimbing.';return render()}
 if(needFoto&&!f.foto){PK.msg='Ambil selfie terlebih dahulu.';return render()}
 if(!needFoto&&!String(f.cat||'').trim()){PK.msg='Isi keterangan '+PK_TIPE[tipe].toLowerCase()+'.';return render()}
 var A=pkList('absen').filter(function(x){return x.sid===me.id&&x.tanggal===t});
 if(A.some(function(x){return x.tipe===tipe&&(tipe==='masuk'||tipe==='pulang')})){PK.msg='Absen '+PK_TIPE[tipe].toLowerCase()+' hari ini sudah tercatat.';return render()}
 if(tipe==='pulang'&&!A.some(function(x){return x.tipe==='masuk'})){PK.msg='Absen masuk hari ini belum tercatat.';return render()}
 if((tipe==='izin'||tipe==='sakit')&&A.some(function(x){return x.tipe===tipe})){PK.msg='Keterangan '+PK_TIPE[tipe].toLowerCase()+' hari ini sudah tercatat.';return render()}
 var tp=pkById('tempat',tg.tempatId),g=PK.gps,jarak=null,lok='?';
 if(g&&tp&&tp.lat&&tp.lng&&!isNaN(+tp.lat)&&!isNaN(+tp.lng)){jarak=pkJarak(+tp.lat,+tp.lng,g.lat,g.lng);lok=jarak<=(+tp.radius||200)+Math.min(g.acc||0,200)?'ya':'tidak'}
 var o={id:uid(),sid:me.id,nama:me.nama,kelas:me.kelas||'',tanggal:t,jam:pkJam(),tipe:tipe,foto:f.foto||'',cat:String(f.cat||'').trim(),tempatId:tg.tempatId,lokasi:lok,
  lat:g?+g.lat.toFixed(5):null,lng:g?+g.lng.toFixed(5):null,acc:g?g.acc:null,jarak:jarak};
 pkPut('absen',o).then(function(ok){PK.mode='list';PK.f=null;PK.msg='';toast(ok?'Absen '+PK_TIPE[tipe].toLowerCase()+' tercatat.':'Absen tersimpan di perangkat, akan dikirim saat online.');render()});
}

/* ---------- Tampilan siswa ---------- */
function pkPill(c,t){return '<span class="pill '+c+'">'+esc(t)+'</span>'}
function pkTempatCard(t,kecil){
 var ps=pkPksStatus(t),n=pkList('tugas').filter(function(x){return x.tempatId===t.id&&x.status==='aktif'}).length;
 return '<div class="note"><b>'+esc(t.nama)+'</b>'+(t.bidang?' · '+esc(t.bidang):'')+'<br>'+esc([t.alamat,t.kota].filter(Boolean).join(', '))+
  (t.instruktur?'<br>Instruktur: '+esc(t.instruktur)+(t.instrTelp?' ('+esc(t.instrTelp)+')':''):'')+(t.jam?'<br>Jam kerja: '+esc(t.jam):'')+
  (kecil?'':'<br>'+pkPill(ps[0],ps[1])+' '+pkPill('plain',n+(t.kuota?'/'+t.kuota:'')+' siswa'))+'</div>';
}
function pkSiswaView(){
 var me=S.user,tg=pkTugasSiswa(me.id),tp=tg&&pkById('tempat',tg.tempatId),t=pkToday(),mine=pkList('absen').filter(function(x){return x.sid===me.id}).sort(function(a,b){return b.ts-a.ts}),
  hr=mine.filter(function(x){return x.tanggal===t}),jr=pkList('jurnal').filter(function(x){return x.sid===me.id}).sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))||b.ts-a.ts}),h='';
 h+='<div class="card"><b>Penempatan saya</b>';
 if(tg&&tp){
  var gu=tg.guruId&&pkUser(tg.guruId);
  h+=pkTempatCard(tp,true)+'<div class="note">Guru pembimbing: '+esc(gu?gu.nama:(tg.guruNama||'-'))+(tg.instruktur?' · Instruktur: '+esc(tg.instruktur):'')+'<br>Periode: '+esc(tg.mulai||'-')+' s.d. '+esc(tg.selesai||'-')+'</div>';
 }else h+='<div class="note">Anda belum ditempatkan. Guru pembimbing akan menetapkan tempat PKL Anda; daftar tempat ada di bawah.</div>';
 h+='</div>';
 if(tg){
  h+='<div class="card"><b>Hari ini ('+esc(t)+')</b><div class="chips" style="gap:6px">'+Object.keys(PK_TIPE).map(function(k){var a=hr.filter(function(x){return x.tipe===k})[0];return a?pkPill('ok',PK_TIPE[k]+' '+a.jam):''}).join('')+(hr.length?'':pkPill('warn','Belum absen'))+'</div>'+
   '<div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" data-act="pkl-absen">'+svg(ICO.camera||'',18)+' Absen dengan selfie</button><button type="button" class="btn" data-act="pkl-new" data-k="jurnal">Tulis jurnal</button></div></div>';
  var r=pkRekap(me.id);
  h+='<div class="stats"><div class="card"><span class="label">Hadir</span><b class="mono">'+r.hadir+'</b></div><div class="card"><span class="label">Izin · Sakit</span><b class="mono">'+r.izin+' · '+r.sakit+'</b></div><div class="card"><span class="label">Tanpa ket.</span><b class="mono">'+r.alpa+'</b></div></div>';
 }
 h+='<div class="card"><b>Riwayat absen</b>'+(mine.length?mine.slice(0,12).map(pkAbsenBaris).join(''):'<div class="note">Belum ada absen.</div>')+'</div>';
 h+='<div class="card"><b>Jurnal kegiatan</b>'+(jr.length?'<div class="row"><button type="button" class="btn small" data-act="pkl-pdf-jurnal" data-v="'+esc(me.id)+'">PDF jurnal saya</button></div>':'')+(jr.length?jr.slice(0,15).map(function(j){return pkJurnalBaris(j,false)}).join(''):'<div class="note">Belum ada jurnal.</div>')+'</div>';
 var T0=pkList('tempat').sort(pkUrutNama),Z=pkSaring('daftar',T0),T=Z.list;
 h+='<div class="card"><details data-pkd="daftar"'+(PK.tOpen?' open':'')+'><summary><b>Daftar tempat PKL ('+T.length+(Z.aktif?' dari '+T0.length:'')+')</b></summary>'+Z.bar+(T.length?T.map(function(x){return pkTempatCard(x,false)}).join(''):'<div class="note">'+(T0.length?'Tidak ada tempat PKL yang cocok dengan saringan.':'Belum ada tempat PKL.')+'</div>')+'</details></div>';
 return h;
}
function pkAbsenBaris(a){
 var lok=a.lokasi==='ya'?pkPill('ok','Di lokasi'):a.lokasi==='tidak'?pkPill('warn','Di luar lokasi'+(a.jarak!=null?' ±'+a.jarak+' m':'')):'';
 return '<div class="pk-row" style="padding:6px 0;border-top:1px solid var(--line)">'+(function(){var src=pkFotoSrc(a);return src?'<img class="pk-th" data-act="pkl-zoom" data-v="'+esc(a.id)+'" src="'+src+'" alt="Selfie '+esc(a.nama||'')+'">':((a.foto||a.fotoAda)?'<div class="pk-th pk-kosong">foto</div>':'')})()+
  '<div class="note" style="flex:1"><b>'+esc(PK_TIPE[a.tipe]||a.tipe)+'</b> · '+esc(a.tanggal)+' '+esc(a.jam||'')+(a.nama&&isStaff()?' · '+esc(a.nama)+(a.kelas?' ('+esc(a.kelas)+')':''):'')+' '+lok+(a.cat?'<br>'+esc(a.cat):'')+(a.r?'':'<br>'+pkPill('warn','Belum terkirim'))+'</div></div>';
}
function pkJurnalBaris(j,staff){
 return '<div style="padding:6px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(j.tanggal)+'</b> · '+esc(j.unit||'')+(staff&&j.nama?' · '+esc(j.nama):'')+'<br>'+esc(j.uraian||'')+
  (j.cat?'<br><i>Catatan: '+esc(j.cat)+'</i>':'')+(j.verif?'<br>'+pkPill('ok','Diketahui: '+({instruktur:'instruktur',guru:'guru pembimbing',keduanya:'instruktur dan guru'}[j.verif]||j.verif)):(staff?'<br>'+pkPill('warn','Menunggu catatan'):''))+(j.r?'':' '+pkPill('warn','Belum terkirim'))+'</div>'+
  (staff?'<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="jurnalcat" data-v="'+esc(j.id)+'">Beri catatan</button><button type="button" class="btn small danger" data-act="pkl-del" data-k="jurnal" data-v="'+esc(j.id)+'">Hapus</button></div>':
   (!j.verif&&Date.now()-j.ts<7*86400000?'<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="jurnal" data-v="'+esc(j.id)+'">Ubah</button></div>':''))+'</div>';
}

/* ---------- Tampilan guru dan admin ---------- */
var PK_TABS=[['tempat','Tempat PKL'],['tugas','Penempatan'],['absen','Absensi'],['jurnal','Jurnal'],['kunjungan','Kunjungan'],['nilai','Nilai'],['cek','Kelengkapan'],['rekap','Rekap']];
var PK_MENU=[['1. Persiapan',['tempat','tugas']],['2. Pelaksanaan',['absen','jurnal','kunjungan']],['3. Penilaian dan laporan',['nilai','cek','rekap']]];
function pkMenuHtml(){
 var nm={};PK_TABS.forEach(function(x){nm[x[0]]=x[1]});
 return '<nav class="card pk-menu" aria-label="Menu PKL">'+PK_MENU.map(function(g){return '<div class="pk-grup"><span class="label">'+g[0]+'</span><div class="pk-tombol n'+g[1].length+'">'+g[1].map(function(k){return '<button type="button" data-act="pkl-tab" data-v="'+k+'" aria-pressed="'+(PK.tab===k)+'">'+nm[k]+'</button>'}).join('')+'</div></div>'}).join('')+'</nav>';
}
function pkTambah(k,label){return '<div class="row"><button type="button" class="btn small primary" data-act="pkl-new" data-k="'+k+'">+ '+esc(label)+'</button></div>'}
function pkAksi(k,id){return '<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="'+k+'" data-v="'+esc(id)+'">Ubah</button><button type="button" class="btn small danger" data-act="pkl-del" data-k="'+k+'" data-v="'+esc(id)+'">Hapus</button></div>'}
function pkRingkas(){
 var t=pkToday(),T=pkList('tempat'),G=pkList('tugas').filter(function(x){return x.status==='aktif'}),A=pkList('absen').filter(function(x){return x.tanggal===t&&x.tipe==='masuk'}),
  J=pkList('jurnal').filter(function(x){return !x.verif}),tel=T.filter(function(x){var k=pkKunjunganAkhir(x.id),n=G.filter(function(g){return g.tempatId===x.id}).length;if(!n)return false;var h=k?pkHariSejak(k.tanggal):999;return h>30}).length,
  bel=pkSiswaAll().filter(pkPeserta).filter(function(u){return !pkTugasSiswa(u.id)}).length;
 function st(l,v,c){return '<div class="card"><span class="label">'+l+'</span><b class="mono">'+v+'</b>'+(c?'<span class="note">'+c+'</span>':'')+'</div>'}
 return '<div class="stats">'+st('Tempat PKL',T.length)+st('Siswa PKL',G.length,bel+' belum ditempatkan')+st('Hadir hari ini',A.length+'/'+G.length)+'</div>'+
  '<div class="stats">'+st('Jurnal baru',J.length,'menunggu catatan')+st('Tempat','' +tel,'tanpa kunjungan > 30 hari')+st('Nilai',pkList('nilai').length,'sudah diisi')+'</div>';
}
function pkStaffView(){
 var f={tempat:pkTabTempat,tugas:pkTabTugas,absen:pkTabAbsen,jurnal:pkTabJurnal,kunjungan:pkTabKunjungan,nilai:pkTabNilai,cek:pkTabCek,rekap:pkTabRekap}[PK.tab]||pkTabTempat;
 return pkMenuHtml()+f()+pkRingkas();
}
function pkTabTempat(){
 var T0=pkList('tempat').sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')}),Z=pkSaring('tempat',T0),T=Z.list;
 return '<div class="card"><b>Daftar tempat PKL ('+T.length+(Z.aktif?' dari '+T0.length:'')+')</b>'+pkTambah('tempat','Tempat PKL baru')+Z.bar+(T.length?T.map(function(t){
  var ps=pkPksStatus(t),n=pkList('tugas').filter(function(x){return x.tempatId===t.id&&x.status==='aktif'}).length,k=pkKunjunganAkhir(t.id),h=k?pkHariSejak(k.tanggal):null;
  return '<div style="padding:8px 0;border-top:1px solid var(--line)">'+pkTempatCard(t,false)+
   '<div class="note">'+(t.pks?'PKS sekolah: '+esc(t.pks):'')+(t.pksMitra?' · PKS mitra: '+esc(t.pksMitra):'')+(t.pksSelesai?' · berlaku s.d. '+esc(t.pksSelesai):'')+(t.fasilitas?'<br>Fasilitas: '+esc(t.fasilitas):'')+
   '<br>'+(k?'Kunjungan terakhir '+esc(k.tanggal)+' ('+h+' hari lalu)':'Belum pernah dikunjungi')+(n&&(h==null||h>30)?' '+pkPill('warn','Perlu monitoring'):'')+(t.lat&&t.lng?' · '+pkPill('plain','Koordinat terisi'):'')+'</div>'+pkAksi('tempat',t.id)+'</div>'}).join(''):'<div class="note">'+(T0.length?'Tidak ada tempat PKL yang cocok dengan saringan.':'Belum ada tempat PKL.')+'</div>')+'</div>';
}
function pkTabTugas(){
 var G0=pkList('tugas').sort(function(a,b){return pkTempatNama(a.tempatId).localeCompare(pkTempatNama(b.tempatId),'id')||pkNm(a).localeCompare(pkNm(b),'id')}),Z=pkSaring('tugas',G0),G=Z.list,bel=pkSiswaAll().filter(pkPeserta).filter(function(u){return !pkTugasSiswa(u.id)});
 return '<div class="card"><b>Penempatan siswa ('+G.length+(Z.aktif?' dari '+G0.length:'')+')</b>'+pkTambah('tugas','Penempatan baru')+Z.bar+
  (bel.length?'<details><summary class="note">'+bel.length+' siswa belum ditempatkan</summary><div class="note">'+bel.map(function(u){return esc(u.nama)+(u.kelas?' ('+esc(u.kelas)+')':'')}).join(', ')+'</div></details>':'')+
  (G.length?G.map(function(g){var gu=g.guruId&&pkUser(g.guruId);return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(pkNm(g))+'</b>'+(pkKl(g)?' ('+esc(pkKl(g))+')':'')+' · '+esc(pkTempatNama(g.tempatId))+'<br>Pembimbing: '+esc(gu?gu.nama:(g.guruNama||'-'))+(g.instruktur?' · Instruktur: '+esc(g.instruktur):'')+'<br>'+esc(g.mulai||'-')+' s.d. '+esc(g.selesai||'-')+' '+pkPill(g.status==='aktif'?'ok':'plain',g.status||'aktif')+'</div>'+pkAksi('tugas',g.id)+'</div>'}).join(''):'<div class="note">'+(G0.length?'Tidak ada penempatan yang cocok dengan saringan.':'Belum ada penempatan.')+'</div>')+'</div>';
}
function pkTabAbsen(){
 var d=PK.ft||pkToday(),A0=pkList('absen').filter(function(x){return x.tanggal===d}).sort(function(a,b){return String(a.jam).localeCompare(String(b.jam))}),Z=pkSaring('absen',A0),A=Z.list,G=pkList('tugas').filter(function(x){return x.status==='aktif'}),
  sdh={};A.forEach(function(x){if(x.tipe==='masuk'||x.tipe==='izin'||x.tipe==='sakit')sdh[x.sid]=1});var blm=G.filter(function(g){return !sdh[g.sid]});
 return '<div class="card"><b>Absensi harian</b><label class="f">Tanggal<input type="date" data-pkft value="'+esc(d)+'"></label>'+Z.bar+
  '<div class="note">'+A.length+(Z.aktif?' dari '+A0.length:'')+' catatan · '+blm.length+' siswa belum absen'+(blm.length?': '+blm.map(function(g){return esc(pkNm(g))}).join(', '):'')+'</div>'+
  (A.length?A.map(function(a){return pkAbsenBaris(a)+'<div class="row"><button type="button" class="btn small danger" data-act="pkl-del" data-k="absen" data-v="'+esc(a.id)+'">Hapus</button></div>'}).join(''):'<div class="note">'+(A0.length?'Tidak ada catatan yang cocok dengan saringan.':'Belum ada absen pada tanggal ini.')+'</div>')+'</div>';
}
function pkTabJurnal(){
 var J0=pkList('jurnal').sort(function(a,b){return (a.verif?1:0)-(b.verif?1:0)||String(b.tanggal).localeCompare(String(a.tanggal))}),Z=pkSaring('jurnal',J0),J=Z.list.slice(0,60);
 return '<div class="card"><b>Jurnal kegiatan siswa ('+(Z.aktif?Z.list.length+' dari ':'')+J0.length+')</b><div class="note">Yang belum diberi catatan tampil lebih dulu. Maksimal 60 terbaru.</div>'+Z.bar+(J.length?J.map(function(j){return pkJurnalBaris(j,true)}).join(''):'<div class="note">'+(J0.length?'Tidak ada jurnal yang cocok dengan saringan.':'Belum ada jurnal.')+'</div>')+'</div>';
}
function pkTabKunjungan(){
 var K0=pkList('kunjungan').sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))}),Z=pkSaring('kunjungan',K0),K=Z.list;
 return '<div class="card"><b>Kunjungan monitoring ('+K.length+(Z.aktif?' dari '+K0.length:'')+')</b><div class="note">Panduan: guru pembimbing memantau minimal sebulan sekali (kunjungan atau komunikasi dengan dunia kerja).</div>'+pkTambah('kunjungan','Kunjungan baru')+Z.bar+
  (K.length?K.map(function(k){var gu=k.guruId&&pkUser(k.guruId);return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(k.tanggal)+'</b> · '+esc(pkTempatNama(k.tempatId))+' · '+(k.mode==='daring'?'daring':'langsung')+' · '+esc(gu?gu.nama:(k.guruNama||'-'))+(k.temuan?'<br>Temuan: '+esc(k.temuan):'')+(k.tindak?'<br>Tindak lanjut: '+esc(k.tindak):'')+'</div>'+pkAksi('kunjungan',k.id)+'</div>'}).join(''):'<div class="note">'+(K0.length?'Tidak ada kunjungan yang cocok dengan saringan.':'Belum ada kunjungan.')+'</div>')+'</div>';
}
function pkTabNilai(){
 var N0=pkList('nilai').sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')}),Z=pkSaring('nilai',N0),N=Z.list;
 PK.vis.nilai=N.map(function(x){return x.sid});
 return '<div class="card"><b>Nilai PKL ('+N.length+(Z.aktif?' dari '+N0.length:'')+')</b><div class="note">Empat TP (Lampiran 4 dan 5 panduan). Kehadiran diambil otomatis dari absensi.</div>'+pkTambah('nilai','Nilai baru').replace('</div>',N.length?'<button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="semua">'+(Z.aktif?'PDF nilai yang tampil ('+N.length+')':'PDF semua nilai')+'</button></div>':'</div>')+Z.bar+
  (N.length?N.map(function(n){var v=pkNilaiAkhir(n),r=pkRekap(n.sid),tp=pkTP();return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(n.nama||'')+'</b>'+(n.kelas?' ('+esc(n.kelas)+')':'')+' · '+esc(pkTempatNama(n.tempatId))+
   '<br>'+[1,2,3,4].map(function(i){return 'TP'+i+': '+(n['tp'+i]===''||n['tp'+i]==null?'-':n['tp'+i])}).join(' · ')+'<br>Nilai akhir: <b>'+(v==null?'-':v)+'</b> '+(v==null?'':pkPill(v>=75?'ok':'warn',pkPredikat(v)))+
   '<br>Kehadiran: sakit '+r.sakit+', izin '+r.izin+', tanpa keterangan '+r.alpa+(n.catGuru?'<br>Guru: '+esc(n.catGuru):'')+(n.catInstr?'<br>Instruktur: '+esc(n.catInstr):'')+'</div>'+pkAksi('nilai',n.id).replace('</div>','<button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="'+esc(n.sid)+'">PDF</button></div>')+'</div>'}).join(''):'<div class="note">'+(N0.length?'Tidak ada nilai yang cocok dengan saringan.':'Belum ada nilai.')+'</div>')+'</div>';
}
function pkCekOf(sid){return pkById('cek','cek_'+sid)}
function pkTabCek(){
 var G0=pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(function(a,b){return pkNm(a).localeCompare(pkNm(b),'id')}),Z=pkSaring('cek',G0),G=Z.list;
 return '<div class="card"><b>Kelengkapan PKL per siswa</b><div class="note">Centang saat dokumen atau tahapan sudah terpenuhi. Tersimpan otomatis.</div>'+Z.bar+(G.length?G.map(function(g){
  var c=pkCekOf(g.sid)||{items:{}},n=PK_CEK.filter(function(x){return c.items&&c.items[x[0]]}).length;
  return '<details style="padding:6px 0;border-top:1px solid var(--line)"><summary><b>'+esc(pkNm(g))+'</b> <span class="note">'+esc(pkTempatNama(g.tempatId))+'</span> '+pkPill(n===PK_CEK.length?'ok':'plain',n+'/'+PK_CEK.length)+'</summary>'+
   PK_CEK.map(function(x){return '<label class="row" style="gap:8px;padding:4px 0"><input type="checkbox" data-pkcek="'+esc(g.sid)+'" data-i="'+x[0]+'"'+(c.items&&c.items[x[0]]?' checked':'')+'><span class="note">'+esc(x[1])+'</span></label>'}).join('')+'</details>'}).join(''):'<div class="note">'+(G0.length?'Tidak ada siswa yang cocok dengan saringan.':'Belum ada penempatan.')+'</div>')+'</div>';
}
function pkRekapBaris(){
 return pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(function(a,b){return pkNm(a).localeCompare(pkNm(b),'id')}).map(function(g){
  var r=pkRekap(g.sid),n=pkList('nilai').filter(function(x){return x.sid===g.sid})[0],c=pkCekOf(g.sid),nc=c?PK_CEK.filter(function(x){return c.items&&c.items[x[0]]}).length:0,gu=g.guruId&&pkUser(g.guruId);
  return {g:g,r:r,nilai:n?pkNilaiAkhir(n):null,jurnal:pkList('jurnal').filter(function(x){return x.sid===g.sid}).length,cek:nc,guru:gu?gu.nama:(g.guruNama||'')};
 });
}
function pkTabRekap(){
 var R0=pkRekapBaris(),Z=pkSaring('rekap',R0,function(x){return x.g}),R=Z.list;
 return '<div class="card"><b>Rekap PKL per siswa'+(Z.aktif?' ('+R.length+' dari '+R0.length+')':'')+'</b><div class="row"><button type="button" class="btn small primary" data-act="pkl-xls">Unduh Excel</button></div>'+Z.bar+
  '<div class="note">Tanpa keterangan = hari kerja Senin-Jumat sejak mulai PKL dikurangi hadir, izin, dan sakit (perkiraan; hari libur belum dikurangi).</div>'+
  '<div class="akd-twrap"><table class="akd-tbl akd-tbl-l"><thead><tr><th>Siswa</th><th>Tempat</th><th>Hadir</th><th>Izin</th><th>Sakit</th><th>T.ket</th><th>Di luar lokasi</th><th>Jurnal</th><th>Kelengkapan</th><th>Nilai</th><th>PDF</th></tr></thead><tbody>'+
  (R.length?R.map(function(x){return '<tr><td>'+esc(pkNm(x.g))+'</td><td>'+esc(pkTempatNama(x.g.tempatId))+'</td><td>'+x.r.hadir+'</td><td>'+x.r.izin+'</td><td>'+x.r.sakit+'</td><td>'+x.r.alpa+'</td><td>'+x.r.luar+'</td><td>'+x.jurnal+'</td><td>'+x.cek+'/'+PK_CEK.length+'</td><td>'+(x.nilai==null?'-':x.nilai)+'</td><td><button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="'+esc(x.g.sid)+'">Nilai</button> <button type="button" class="btn small" data-act="pkl-pdf-jurnal" data-v="'+esc(x.g.sid)+'">Jurnal</button></td></tr>'}).join(''):'<tr><td colspan="11">Belum ada penempatan.</td></tr>')+'</tbody></table></div></div>';
}
function pkXls(){
 if(typeof XLSX==='undefined'){toast('Pustaka Excel belum termuat.');return}
 var wb=XLSX.utils.book_new(),sh=function(n,rows){XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.length?rows:[{Keterangan:'Belum ada data'}]),n)},tp=pkTP();
 sh('Tempat PKL',pkList('tempat').map(function(t){var k=pkKunjunganAkhir(t.id);return {Nama:t.nama,Bidang:t.bidang||'',Alamat:t.alamat||'',Kota:t.kota||'',Lokasi:t.negeri==='luar'?'Luar negeri':'Dalam negeri',Telepon:t.telp||'',Pimpinan:t.pimpinan||'',Instruktur:t.instruktur||'','Kontak instruktur':t.instrTelp||'',Kuota:t.kuota||'','Siswa aktif':pkList('tugas').filter(function(x){return x.tempatId===t.id&&x.status==='aktif'}).length,'Jam kerja':t.jam||'','No. PKS sekolah':t.pks||'','No. PKS mitra':t.pksMitra||'','PKS mulai':t.pksMulai||'','PKS selesai':t.pksSelesai||'','Status PKS':pkPksStatus(t)[1],Fasilitas:t.fasilitas||'','Kunjungan terakhir':k?k.tanggal:''}}));
 sh('Penempatan',pkList('tugas').map(function(g){var gu=g.guruId&&pkUser(g.guruId);return {Siswa:pkNm(g),Kelas:pkKl(g),Tempat:pkTempatNama(g.tempatId),'Guru pembimbing':gu?gu.nama:(g.guruNama||''),Instruktur:g.instruktur||'',Mulai:g.mulai||'',Selesai:g.selesai||'',Status:g.status||''}}));
 sh('Absensi',pkList('absen').sort(function(a,b){return a.ts-b.ts}).map(function(a){return {Tanggal:a.tanggal,Jam:a.jam||'',Siswa:a.nama||'',Kelas:a.kelas||'',Jenis:PK_TIPE[a.tipe]||a.tipe,Tempat:pkTempatNama(a.tempatId),Lokasi:a.lokasi==='ya'?'Di lokasi':a.lokasi==='tidak'?'Di luar lokasi':'Tidak diketahui','Jarak (m)':a.jarak==null?'':a.jarak,Selfie:(a.foto||a.fotoAda)?'Ada':'Tidak',Catatan:a.cat||''}}));
 sh('Rekap kehadiran',pkRekapBaris().map(function(x){return {Siswa:pkNm(x.g),Kelas:pkKl(x.g),Tempat:pkTempatNama(x.g.tempatId),Hadir:x.r.hadir,Izin:x.r.izin,Sakit:x.r.sakit,'Tanpa keterangan':x.r.alpa,'Masuk di luar lokasi':x.r.luar,'Jurnal':x.jurnal,'Kelengkapan':x.cek+'/'+PK_CEK.length,'Nilai akhir':x.nilai==null?'':x.nilai,Guru:x.guru}}));
 sh('Jurnal',pkList('jurnal').sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))}).map(function(j){return {Tanggal:j.tanggal,Siswa:j.nama||'',Kelas:j.kelas||'','Unit kerja':j.unit||'',Uraian:j.uraian||'',Catatan:j.cat||'','Diketahui oleh':j.verif||''}}));
 sh('Kunjungan',pkList('kunjungan').sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))}).map(function(k){var gu=k.guruId&&pkUser(k.guruId);return {Tanggal:k.tanggal,Tempat:pkTempatNama(k.tempatId),Guru:gu?gu.nama:(k.guruNama||''),Cara:k.mode==='daring'?'Daring':'Langsung',Temuan:k.temuan||'','Tindak lanjut':k.tindak||''}}));
 sh('Nilai',pkList('nilai').map(function(n){var o={Siswa:n.nama||'',Kelas:n.kelas||'',Tempat:pkTempatNama(n.tempatId)};[1,2,3,4].forEach(function(i){o['TP'+i+' '+tp[i-1]]=n['tp'+i]==null?'':n['tp'+i]});o['Nilai akhir']=pkNilaiAkhir(n)==null?'':pkNilaiAkhir(n);o.Predikat=pkPredikat(pkNilaiAkhir(n));o['Catatan guru']=n.catGuru||'';o['Catatan instruktur']=n.catInstr||'';return o}));
 sh('Kelengkapan',pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).map(function(g){var c=pkCekOf(g.sid),o={Siswa:pkNm(g),Tempat:pkTempatNama(g.tempatId)};PK_CEK.forEach(function(x){o[x[1]]=c&&c.items&&c.items[x[0]]?'Ya':'Belum'});return o}));
 XLSX.writeFile(wb,'pkl-'+(typeof schKode==='function'&&schKode()||'semua').toLowerCase()+'-'+pkToday()+'.xlsx');
}


/* ---------- PDF: Daftar Nilai PKL (Lampiran 5) dan Jurnal PKL (Lampiran 2) ---------- */
function pkTgl(s){if(!s)return '-';var d=new Date(s+'T00:00:00');return isNaN(d.getTime())?String(s):d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function pkTglHari(s){if(!s)return '-';var d=new Date(s+'T00:00:00');return isNaN(d.getTime())?String(s):d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short',year:'numeric'})}
function pkPdfSiap(){
 if(typeof needP==='function')return needP();
 if(window.jspdf&&window.jspdf.jsPDF)return true;toast('Pustaka PDF belum termuat.');return false;
}
var PK_TH={fillColor:[11,107,58],textColor:255,fontStyle:'bold'};
function pkAscii(x){return String(x==null?'':x).replace(/[\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u00b7/g,'-')}
function pkKop(doc,judul){
 var W=doc.internal.pageSize.getWidth(),sc=typeof schEf==='function'?schEf():{nama:'',alamat:'',program:''};
 try{if(sc.logo)doc.addImage(sc.logo,'JPEG',14,10,18,18)}catch(e){}
 doc.setFont('helvetica','bold').setFontSize(13).text(pkAscii(sc.nama).toUpperCase(),36,16);
 doc.setFont('helvetica','normal').setFontSize(8.5).text(pkAscii(sc.alamat),36,21);
 doc.setDrawColor(200).line(14,31,W-14,31);
 doc.setFont('helvetica','bold').setFontSize(12).text(judul,W/2,40,{align:'center'});doc.setFont('helvetica','normal');
}
function pkTtd(doc,y,kiri,kanan){
 var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 if(y>H-55){doc.addPage();y=24}
 doc.setFontSize(10).setTextColor(0);
 doc.text('Bandung, '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),W-50,y,{align:'center'});
 doc.text(kiri[0],50,y+6,{align:'center'});doc.text(kanan[0],W-50,y+6,{align:'center'});
 doc.text('('+pkAscii(kiri[1]||'..............................')+')',50,y+30,{align:'center'});doc.text('('+pkAscii(kanan[1]||'..............................')+')',W-50,y+30,{align:'center'});
}
function pkPdfFoot(doc){
 var n=doc.getNumberOfPages(),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 for(var i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8).setTextColor(120).text('KBM Praktik TBSM - PKL - dicetak '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),14,H-8).text('Halaman '+i+'/'+n,W-14,H-8,{align:'right'})}
 doc.setTextColor(0);
}
function pkPdfIdent(doc,rows,y){
 doc.autoTable({startY:y,theme:'plain',styles:{fontSize:10,cellPadding:1},columnStyles:{0:{cellWidth:48,fontStyle:'bold'},1:{cellWidth:4}},body:rows.map(function(r){return [pkAscii(r[0]),':',pkAscii(r[1])]})});
 return doc.lastAutoTable.finalY;
}
function pkIdentSiswa(sid){
 var u=pkUser(sid)||{},tg=pkTugasSiswa(sid),tp=tg&&pkById('tempat',tg.tempatId),gu=tg&&tg.guruId&&pkUser(tg.guruId),sc=typeof schEf==='function'?schEf():{};
 var nis='';try{nis=typeof akNis==='function'?akNis(u):''}catch(e){}
 return {u:u,tg:tg,tp:tp,guru:gu?gu.nama:(tg&&tg.guruNama)||'',instr:(tg&&tg.instruktur)||(tp&&tp.instruktur)||'',
  rows:[['Nama peserta didik',u.nama||'-'],['NISN/NIS',nis||'-'],['Kelas',u.kelas||'-'],['Semester',pkSemesterTeks(u.sekolah||(typeof schKode==='function'?schKode():''))],['Program keahlian',sc.program||'-'],['Tempat PKL',tp?tp.nama:'-'],
   ['Tanggal PKL','Mulai: '+pkTgl(tg&&tg.mulai)+'   Selesai: '+pkTgl(tg&&tg.selesai)],['Nama instruktur',(tg&&tg.instruktur)||(tp&&tp.instruktur)||'-'],['Nama pembimbing',gu?gu.nama:((tg&&tg.guruNama)||'-')]]};
}
function pkPdfNilaiHal(doc,sid){
 var n=pkList('nilai').filter(function(x){return x.sid===sid})[0],I=pkIdentSiswa(sid),tp=pkTP(),v=pkNilaiAkhir(n),r=pkRekap(sid);
 pkKop(doc,'DAFTAR NILAI PESERTA DIDIK MATA PELAJARAN PKL');
 var d0=new Date(),y0=d0.getMonth()>=6?d0.getFullYear():d0.getFullYear()-1;
 var y=pkPdfIdent(doc,[['Tahun ajaran',y0+'/'+(y0+1)]].concat(I.rows),44)+4;
 var body=[1,2,3,4].map(function(i){var sk=n['tp'+i],ada=!(sk===''||sk==null);return [i+'. '+pkAscii(tp[i-1]),ada?String(sk):'-',ada?pkPredikat(+sk):'']});
 body.push([{content:'Nilai akhir (rata-rata)',styles:{fontStyle:'bold'}},{content:v==null?'-':String(v),styles:{fontStyle:'bold'}},{content:v==null?'':pkPredikat(v),styles:{fontStyle:'bold'}}]);
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9.5,cellPadding:2.2},headStyles:PK_TH,head:[['Tujuan Pembelajaran','Skor','Deskripsi']],body:body,columnStyles:{0:{cellWidth:100},1:{cellWidth:18,halign:'center'}}});
 y=doc.lastAutoTable.finalY+5;
 var cat=[n.catGuru?'Guru pembimbing: '+n.catGuru:'',n.catInstr?'Instruktur: '+n.catInstr:''].filter(Boolean).join('\n');
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9.5,cellPadding:2.2},headStyles:PK_TH,head:[['Catatan']],body:[[pkAscii(cat)||'-']]});
 y=doc.lastAutoTable.finalY+5;
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9.5,cellPadding:2.2},headStyles:PK_TH,head:[['Kehadiran','Hari']],body:[['Sakit',String(r.sakit)],['Izin',String(r.izin)],['Tanpa keterangan',String(r.alpa)]],columnStyles:{0:{cellWidth:60},1:{cellWidth:25,halign:'center'}},tableWidth:85});
 pkTtd(doc,doc.lastAutoTable.finalY+10,['Guru Pembimbing',I.guru],['Pembimbing Dunia Kerja',I.instr]);
}
function pkPdfNilai(sids){
 if(!pkPdfSiap())return;
 var L=sids.filter(function(sid){return pkList('nilai').some(function(x){return x.sid===sid})});
 if(!L.length){toast('Belum ada nilai PKL untuk dicetak.');return}
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 L.forEach(function(sid,i){if(i)doc.addPage();pkPdfNilaiHal(doc,sid)});
 pkPdfFoot(doc);
 var u=pkUser(L[0]);doc.save('Nilai-PKL-'+(L.length>1?'semua':pkSlug((u&&u.nama)||'siswa',30))+'.pdf');
}
function pkPdfJurnal(sid){
 if(!pkPdfSiap())return;
 var J=pkList('jurnal').filter(function(x){return x.sid===sid}).sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))}),I=pkIdentSiswa(sid);
 if(!J.length){toast('Belum ada jurnal untuk dicetak.');return}
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 pkKop(doc,'JURNAL KEGIATAN PRAKTIK KERJA LAPANGAN');
 var y=pkPdfIdent(doc,[I.rows[0],I.rows[2],I.rows[4],I.rows[5],I.rows[6],I.rows[7]],44)+4;
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:8.5,cellPadding:2,valign:'top'},headStyles:PK_TH,head:[['No','Hari/Tanggal','Unit kerja/Pekerjaan','Uraian kegiatan','Catatan']],
  body:J.map(function(j,i){return [String(i+1),pkAscii(pkTglHari(j.tanggal)),pkAscii(j.unit),pkAscii(j.uraian),pkAscii(j.cat||'')]}),columnStyles:{0:{cellWidth:8,halign:'center'},1:{cellWidth:30},2:{cellWidth:34},4:{cellWidth:38}}});
 pkTtd(doc,doc.lastAutoTable.finalY+10,['Guru Pembimbing',I.guru],['Instruktur Dunia Kerja',I.instr]);
 pkPdfFoot(doc);
 doc.save('Jurnal-PKL-'+pkSlug((I.u&&I.u.nama)||'siswa',30)+'.pdf');
}

/* ---------- Tampilan utama ---------- */
var PK_CSS=document.createElement('style');
PK_CSS.textContent='.pk-menu{display:grid;gap:10px}.pk-grup .label{display:block;margin-bottom:4px}.pk-tombol{display:grid;gap:6px}.pk-tombol.n2{grid-template-columns:1fr 1fr}.pk-tombol.n3{grid-template-columns:repeat(3,1fr)}'+
 '.pk-tombol button{min-height:44px;padding:6px 4px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:inherit;font:600 13px/1.25 inherit;font-family:inherit}.pk-tombol button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}'+
 '.pk-row{display:flex;gap:10px;align-items:flex-start}.pk-pv{width:150px;aspect-ratio:3/4;object-fit:cover;border-radius:14px;border:1px solid var(--line);flex:none}'+
 '.pk-th{width:44px;height:58px;object-fit:cover;border-radius:8px;cursor:zoom-in;flex:none;border:1px solid var(--line)}.pk-kosong{display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:var(--muted);background:var(--surface)}'+
 '.pk-bar{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0}.pk-bar .f{margin:0}.pk-ket{display:block;margin-top:4px;font-size:12px;color:var(--muted)}.pk-ket[hidden]{display:none}'+
 '.pk-zoom{position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:14px}.pk-zoom img{max-width:100%;max-height:100%;border-radius:12px}';
document.head.appendChild(PK_CSS);
/* Jadwal penyelenggaraan: peserta tingkat XII; Darul Fatwa semester 6, Medina semester 5. */
var PK_SEMESTER={DF:6,MEDINA:5};
function pkSemesterTeks(k){var n=PK_SEMESTER[String(k||'').toUpperCase()];return n?n+(n%2?' (ganjil)':' (genap)'):'-'}
function pkTingkatXII(kl){return /^\s*(XII|12)(?![IVX0-9])/i.test(String(kl||''))}
/* Siswa XI ke bawah tidak ditawarkan; yang sudah punya penempatan tetap tampil. */
function pkPeserta(u){return pkTingkatXII(u.kelas)||!!pkTugasSiswa(u.id)}
function pkJudulHtml(){
 var sk=typeof schNama==='function'?schNama():'';
 var kd=typeof schKode==='function'?schKode():'',jd=PK_SEMESTER[kd]?'Peserta kelas XII, semester '+pkSemesterTeks(kd):'';
 return '<div class="card pk-judul"><b>Praktik Kerja Lapangan (PKL)</b>'+(sk?'<div class="note">'+esc(sk)+'</div>':'')+(jd?'<div class="note">'+jd+'</div>':'')+'</div>';
}
function viewPkl(){
 if(!PK.loaded&&!PK.loading)setTimeout(pkLoad,0);
 var h=pkJudulHtml();
 if(PK.err.length)h+='<div class="err">'+PK.err.map(esc).join('<br>')+(PK.err.some(function(e){return /collection|not found|could not be found/i.test(e)})?'<br>Koleksi PKL belum dibuat di Appwrite. Jalankan: node tools/setup-appwrite.mjs --only=pkl,pkl_catat,pkl_nilai':'')+'</div>';
 if(PK.mode==='form')return h+pkFormView();
 if(PK.mode==='absen'&&!isStaff())return h+pkAbsenView();
 return h+(isStaff()?pkStaffView():pkSiswaView());
}
function pkFormBuka(k,id){
 var sk=k;PK.fk=k;PK.msg='';
 var rec=id?pkById(k==='jurnalcat'?'jurnal':k,id):null;
 PK.f=rec?Object.assign({},rec):Object.assign({},pkDefault(k));
 PK.mode='form';render();
}
function pkSimpan(){
 var k=PK.fk,f=PK.f||{},F=pkSchema(k),dk=k==='jurnalcat'?'jurnal':k,me=S.user,miss=F.filter(function(x){return x.r&&!String(f[x.k]==null?'':f[x.k]).trim()}).map(function(x){return x.l});
 if(miss.length){PK.msg='Lengkapi: '+miss.join(', ');return render()}
 var o=Object.assign({},f);
 if(!o.id)o.id=(k==='nilai'?'':uid())||uid();
 if(k==='nilai'){
  for(var i=1;i<=4;i++){var v=o['tp'+i];if(v===''||v==null){o['tp'+i]=''}else{v=+v;if(isNaN(v)||v<0||v>100){PK.msg='Nilai TP harus 0 sampai 100.';return render()}o['tp'+i]=v}}
  var ex=pkList('nilai').filter(function(x){return x.sid===o.sid&&x.id!==o.id})[0];if(ex)o.id=ex.id;
 }
 if(['tugas','nilai'].indexOf(k)>-1){var u=pkUser(o.sid);if(u&&k==='nilai'){o.nama=u.nama;o.kelas=u.kelas||''}if(k==='tugas'){delete o.nama;delete o.kelas}
  var tg=pkTugasSiswa(o.sid);if(k==='nilai'&&tg)o.tempatId=tg.tempatId}
 if(k==='tugas'){
  if(o.mulai&&o.selesai&&o.selesai<o.mulai){PK.msg='Tanggal selesai lebih awal dari mulai.';return render()}
  var gu=o.guruId&&pkUser(o.guruId);o.guruNama=gu?gu.nama:'';
  if(!o.instruktur){var tp=pkById('tempat',o.tempatId);o.instruktur=tp&&tp.instruktur||''}
  var dup=pkList('tugas').filter(function(x){return x.sid===o.sid&&x.id!==o.id&&x.status==='aktif'})[0];if(dup&&o.status==='aktif'){PK.msg='Siswa ini sudah punya penempatan aktif. Ubah yang lama menjadi Selesai atau Dibatalkan.';return render()}
  var tp2=pkById('tempat',o.tempatId);if(tp2&&tp2.kuota&&o.status==='aktif'){var terisi=pkList('tugas').filter(function(x){return x.tempatId===o.tempatId&&x.status==='aktif'&&x.id!==o.id}).length;if(terisi>=+tp2.kuota){PK.msg='Kuota tempat ini ('+tp2.kuota+') sudah penuh.';return render()}}
 }
 if(k==='tempat'){['lat','lng'].forEach(function(x){if(o[x]!==''&&o[x]!=null){var n=+String(o[x]).replace(',','.');if(isNaN(n)){PK.msg='Koordinat harus berupa angka.';o.__bad=1}else o[x]=n}else delete o[x]});if(o.__bad)return render();
  if(o.kuota!==''&&o.kuota!=null)o.kuota=+o.kuota;else delete o.kuota;o.radius=+o.radius||200}
 if(k==='jurnal'||k==='jurnalcat'){
  if(k==='jurnal'){o.sid=o.sid||me.id;if(!isStaff()){o.nama=me.nama;o.kelas=me.kelas||''}var t3=pkTugasSiswa(o.sid);o.tempatId=o.tempatId||(t3&&t3.tempatId)||''}
  else{o.diberi=me.nama}
 }
 if(k==='kunjungan'){var g2=o.guruId&&pkUser(o.guruId);o.guruNama=g2?g2.nama:''}
 delete o.__bad;
 pkPut(dk,o).then(function(ok){PK.mode='list';PK.f=null;PK.msg='';if(!ok)toast('Tersimpan di perangkat, akan dikirim saat online.');render()});
}
function pkCekToggle(sid,key,val){
 var c=pkCekOf(sid)||{id:'cek_'+sid,sid:sid,items:{}};c.items=c.items||{};c.items[key]=!!val;
 var u=pkUser(sid);c.nama=u?u.nama:c.nama||'';pkPut('cek',c);
}
function pkZoom(id){
 var a=pkById('absen',id),src=a&&pkFotoSrc(a);if(!src){toast('Foto sedang dimuat. Coba lagi sebentar.');return}
 var ov=document.createElement('div');ov.className='pk-zoom';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Selfie absen');
 ov.innerHTML='<img src="'+src+'" alt="Selfie '+esc(a.nama||'')+'">';ov.addEventListener('click',function(){ov.remove()});document.body.appendChild(ov);
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="pkl-"]');if(!b||!S.user)return;
 var a=b.dataset.act,k=b.dataset.k,v=b.dataset.v;
 if(actRole()==='kepsek'&&['pkl-new','pkl-edit','pkl-del','pkl-save','pkl-absen'].indexOf(a)>-1){toast('Peran Kepala Sekolah hanya dapat melihat data.');return}
 if(a==='pkl-tab'){PK.tab=v;render()}
 else if(a==='pkl-new')pkFormBuka(k);
 else if(a==='pkl-edit')pkFormBuka(k,v);
 else if(a==='pkl-cancel'){PK.mode='list';PK.f=null;PK.msg='';render()}
 else if(a==='pkl-save')pkSimpan();
 else if(a==='pkl-del'){
  var dk=k;if(typeof uiConfirm==='function')uiConfirm('Hapus data ini?\nData yang dihapus tidak bisa dikembalikan.').then(function(ok){if(ok)pkDel(dk,v).then(render)});else pkDel(dk,v).then(render);
 }
 else if(a==='pkl-absen')pkAbsenBuka();
 else if(a==='pkl-tipe'){PK.f.tipe=v;PK.msg='';render()}
 else if(a==='pkl-gps'){pkGps();render()}
 else if(a==='pkl-selfie'){var inp=document.querySelector('[data-pklfoto]');if(inp)inp.click()}
 else if(a==='pkl-absen-kirim')pkAbsenKirim();
 else if(a==='pkl-zoom')pkZoom(v);
 else if(a==='pkl-xls')pkXls();
 else if(a==='pkl-pdf-nilai'){if(!isStaff())return;pkPdfNilai(v==='semua'?(PK.vis.nilai||pkList('nilai').map(function(x){return x.sid})):[v])}
 else if(a==='pkl-flt-reset'){PK.flt[v]={};render()}
 else if(a==='pkl-pdf-jurnal'){if(!isStaff()&&v!==S.user.id)return;pkPdfJurnal(v)}
});
document.addEventListener('input',function(e){
 var t=e.target;if(!t||!t.dataset||PK.mode==='list')return;
 if(t.dataset.pkl&&PK.f){PK.f[t.dataset.pkl]=t.value;if(PK.fk==='nilai'&&/^tp[1-4]$/.test(t.dataset.pkl)){var el=document.getElementById('pk-na');if(el)el.innerHTML=pkNilaiTeks(PK.f)}}
});
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.getAttribute&&d.getAttribute('data-pkd')==='daftar')PK.tOpen=!!d.open},true);
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||!S.user)return;
 if(t.dataset.pkfilter!==undefined&&t.tagName==='SELECT'){
  var pf=String(t.dataset.pkfilter).split(':');(PK.flt[pf[0]]=PK.flt[pf[0]]||{})[pf[1]]=t.value;render();
 }else if(t.dataset.pkl&&PK.f&&t.tagName==='SELECT'){
  PK.f[t.dataset.pkl]=t.value;
  var hk=(PK_HOOK[PK.fk]||{})[t.dataset.pkl];
  if(hk&&hk(PK.f,t.value))render();else pkKetPerbarui(t);
 }else if(t.dataset.pklfoto!==undefined&&t.files&&t.files[0]){
  pkCompress(t.files[0],function(u){if(!u){PK.msg='Foto gagal diproses. Coba lagi.';render();return}PK.f.foto=u;PK.msg='';render()});
 }else if(t.dataset.pkft!==undefined){PK.ft=t.value;render()}
 else if(t.dataset.pkcek!==undefined){if(actRole()==='kepsek'){toast('Peran Kepala Sekolah hanya dapat melihat data.');t.checked=!t.checked;return}pkCekToggle(t.dataset.pkcek,t.dataset.i,t.checked)}
 else if(false)pkCekToggle(t.dataset.pkcek,t.dataset.i,t.checked);
});

/* ---- Menu, tab, dan tombol kembali ---- */
var _viewKatP=viewKatalog;
viewKatalog=function(){
 if(S.tab==='pkl'&&S.user)return viewPkl();
 return _viewKatP.apply(this,arguments);
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('pkl')<0)NAVTABS.push('pkl');
var _renderP=render;
render=function(){
 _renderP.apply(this,arguments);
 try{
  if(!S.user)return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="pkl"]'))return;
  var cur=S.tab==='pkl'?'pkl':'';
  var html='<button type="button" class="srow" data-act="menu" data-v="pkl"'+(cur?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.pkl,22)+'</span><span class="st"><b>PKL</b><small>'+(isStaff()?'Tempat, penempatan, absensi selfie, nilai':'Absen selfie, jurnal, tempat PKL')+'</small></span>'+svg(ICO.chev,18)+'</button>';
  var ks=sb.querySelectorAll('[data-v^="kelas:"]'),ref=ks.length?ks[ks.length-1]:null;
  if(ref)ref.insertAdjacentHTML('afterend',html);else sb.insertAdjacentHTML('beforeend',html);
 }catch(err){}
};
window.addEventListener('load',function(){
 if(typeof bkBack!=='function')return;
 var b0=bkBack;
 bkBack=function(){
  if(S.user&&S.tab==='pkl'&&PK.mode!=='list'&&!document.querySelector('.ui-ov,.pk-zoom')){PK.mode='list';PK.f=null;PK.msg='';render();return}
  return b0.apply(this,arguments);
 };
});
