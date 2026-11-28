/* pkl.js: menu Praktik Kerja Lapangan (PKL). Mengacu pada Panduan PKL sebagai Mata Pelajaran (Direktorat SMK, 2023).
   Siswa: tempat dan pembimbing saya, absen masuk/pulang dengan selfie (jam, tanggal, dan lokasi GPS ikut tercatat), izin/sakit, jurnal kegiatan
   (Lampiran 2), daftar tempat PKL. Guru/Admin: Tempat PKL (perjanjian kerja sama, instruktur, kuota, koordinat), Penempatan, Absensi, Jurnal (catatan
   pembimbing), Kunjungan monitoring (minimal sebulan sekali), Nilai (4 TP, Lampiran 4-5), Kelengkapan per siswa, Rekap, dan unduh Excel.
   Penyimpanan: mode lokal di localStorage 'tbsm-pkl'; mode Appwrite di koleksi pkl (tempat, penempatan), pkl_catat (absen, jurnal; dibuat siswa),
   pkl_nilai (kunjungan, nilai, kelengkapan; hanya guru/admin). Selfie dikecilkan (maks 480 px, sekitar 40 KB). Bila fungsi foto-drive terpasang, selfie diunggah ke Google Drive dan payload hanya menyimpan
   'drive:<fileId>' (ditampilkan lewat aksi getpkl); bila belum terpasang, selfie tetap disimpan di payload absen.
   PDF (jsPDF): Daftar Nilai PKL per siswa (Lampiran 5) dan Jurnal PKL (Lampiran 2).
   Excel dan PDF daftar per tab: js/pkl-xls.js (Tempat PKL), js/pkl-io.js (tab lain), js/pkl-pdf.js. */
var PKC={tempat:'pkl',tugas:'pkl',absen:'pkl_catat',jurnal:'pkl_catat',kunjungan:'pkl_nilai',nilai:'pkl_nilai',cek:'pkl_nilai',setelan:'pkl'};
var PKKEY='tbsm-pkl',PKFOTO=40000;
var PKD={cache:{},loading:{},failed:{},q:[],run:0,off:false,tm:0};
var PK={D:{tempat:[],tugas:[],absen:[],jurnal:[],kunjungan:[],nilai:[],cek:[],setelan:[]},loaded:false,loading:false,err:[],tab:'tempat',mode:'list',f:null,fk:'',gps:null,gpsMsg:'',ft:'',flt:{},vis:{},tOpen:false};
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
 var rest={};Object.keys(o).forEach(function(x){if(['r','d','err','fotoAda','dibuat'].indexOf(x)<0)rest[x]=o[x]});
 return {jenis:k,sekolah:String(o.sekolah||'').slice(0,8),nama:k==='tugas'?'':String(o.nama||o.judul||'').slice(0,200),ts:o.ts||Date.now(),oleh:String((S.user&&S.user.id)||'').slice(0,64),
  sid:String(o.sid||'').slice(0,64),tanggal:String(o.tanggal||'').slice(0,10),payload:JSON.stringify(rest)};
}
function pkParse(d){
 var o={};try{o=JSON.parse(d.payload||'{}')}catch(e){}
 o.id=d.$id;o.jenis=d.jenis;o.ts=d.ts;o.sid=d.sid||o.sid||'';o.tanggal=d.tanggal||o.tanggal||'';o.sekolah=d.sekolah||o.sekolah||'';if(d.$createdAt)o.dibuat=d.$createdAt;o.r=1;o.d=0;return o;
}
function pkSlug(x,n){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,n)}
/* Unggah selfie ke Drive lewat fungsi foto-drive (ldCall di lkpd-drive.js). Fungsi belum dipasang: selfie tetap di payload. Galat lain: dilempar, absen diulang nanti. */
async function pkUploadFoto(o){
 if(!Cloud.on||PKD.off||typeof ldCall!=='function'||typeof o.foto!=='string'||o.foto.indexOf('data:')!==0)return;
 var u=pkUser(o.sid)||S.user||{},nama=['PKL',pkSlug(o.kelas||u.kelas,8),pkSlug(o.nama||u.nama,30),o.tipe||'jurnal',String(o.tanggal||'').replace(/-/g,'')+'-'+String(o.jam||pkJam(o.ts)).replace(':',''),pkSlug(String(o.id).slice(-4),4)].filter(Boolean).join('_');
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
  if(k==='absen'||k==='jurnal')await pkUploadFoto(o);
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
var PK_PENUH=24*3600000,PK_INC='tbsm-pkl-inc';
function pkIncBaca(){try{return JSON.parse(localStorage.getItem(PK_INC)||'null')}catch(e){return null}}
function pkIncTulis(o){try{localStorage.setItem(PK_INC,JSON.stringify(o))}catch(e){}}
async function pkLoad(){
 if(PK.loading||!S.user)return;
 PK.loading=true;PK.err=[];
 try{
  if(!PK.loaded)pkLoadLocal();
  if(Cloud.on&&Cloud.db&&navigator.onLine!==false){
   await pkFlush();
   var Q=Appwrite.Query,me=S.user.id,jobs=[],staf=isStaff();
   /* staf: setelah pembacaan penuh, tiap muat hanya dokumen yang berubah ($updatedAt) yang dibaca; penuh lagi tiap PK_PENUH (dokumen yang dihapus di perangkat lain ikut hilang) */
   var inc=staf?pkIncBaca():null,incOn=!!(inc&&inc.u===me&&inc.db===CFG.DB&&Date.now()-inc.full<PK_PENUH&&PK.D.tugas&&PK.D.tugas.length+PK.D.tempat.length>0);
   if(staf){['pkl','pkl_catat','pkl_nilai'].forEach(function(c){jobs.push([c,incOn&&inc.s[c]?[Q.greaterThan('$updatedAt',new Date(Date.parse(inc.s[c])-15000).toISOString())]:[]])})}
   else{jobs.push(['pkl',[Q.equal('jenis',['tempat','setelan'])]],['pkl',[Q.equal('sid',[me])]],['pkl_catat',[Q.equal('sid',[me])]])}
   var rows={},okCol={},mx={};
   await Promise.all(jobs.map(async function(j){
    try{(await Cloud.list(j[0],j[1])).forEach(function(d){var o=pkParse(d);if(d.$updatedAt&&(!mx[j[0]]||d.$updatedAt>mx[j[0]]))mx[j[0]]=d.$updatedAt;if(PK.D[o.jenis])(rows[o.jenis]=rows[o.jenis]||[]).push(o)});okCol[j[0]]=(okCol[j[0]]===false)?false:true}
    catch(e){okCol[j[0]]=false;PK.err.push(j[0]+': '+((e&&e.message)||e))}
   }));
   Object.keys(PK.D).forEach(function(k){
    if(okCol[PKC[k]]!==true)return;
    var neu;
    if(incOn&&staf){
     /* gabung ke salinan di perangkat; dokumen lokal yang belum terkirim tidak ditimpa */
     neu=PK.D[k].slice();
     (rows[k]||[]).forEach(function(o){var i=neu.findIndex(function(y){return y.id===o.id});if(i<0)neu.push(o);else if(neu[i].r&&!neu[i].d)neu[i]=o});
    }else{
     var keep=PK.D[k].filter(function(x){return !x.r||x.d});neu=(rows[k]||[]).slice();
     keep.forEach(function(x){var i=neu.findIndex(function(y){return y.id===x.id});if(i<0)neu.push(x);else neu[i]=x});
    }
    PK.D[k]=neu;
   });
   if(staf&&okCol.pkl===true&&okCol.pkl_catat===true&&okCol.pkl_nilai===true){
    var ns=incOn?Object.assign({},inc.s):{},nowIso=new Date().toISOString();
    ['pkl','pkl_catat','pkl_nilai'].forEach(function(c){ns[c]=mx[c]&&(!ns[c]||mx[c]>ns[c])?mx[c]:(ns[c]||nowIso)});
    pkIncTulis({u:me,db:CFG.DB,s:ns,full:incOn?inc.full:Date.now()});
   }
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
 var t=pkTugasSiswa(sid),A=pkList('absen').filter(function(x){return x.sid===sid&&!x.uji}),from=t&&t.mulai||'',to=t&&t.selesai&&t.selesai<pkToday()?t.selesai:pkToday();
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

/* ---------- Pilihan (select) ----------
   Semua <select> PKL (isian formulir, saringan tab, dan pengaturan) dibuat lewat SATU pembangun bersama, bpSelect di js/komponen.js,
   supaya lembar pilihan buatan aplikasi (js/bank-pilihan.js) terpakai penuh: judul lembar (data-judul), keterangan kecil tiap pilihan
   (data-ket), kelompok (optgroup), pilihan kosong terpisah (value=""), pilihan nonaktif, dan kotak Cari (otomatis bila 8 pilihan atau lebih).
   Di sini hanya nama pendek PKL yang meneruskan ke pembangun itu, jadi sisa kode PKL tidak berubah. Bentuk data dan opsi: lihat komponen.js. */
function pkO(v,l,ket,off){return bpO(v,l,ket,off)}
function pkG(g,o){return bpG(g,o)}
function pkNorm(L){return bpNorm(L)}
function pkFlat(L){return bpFlat(L)}
function pkSelectHtml(attr,L,cur,opt){return bpSelect(attr,L,cur,opt)}
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
/* Tempat. ctx 'tugas': yang masih ada kuota lebih dulu, yang penuh dinonaktifkan. ctx 'kunjungan': yang perlu monitoring (lebih dari 30 hari tanpa monitoring) lebih dulu. */
function pkOptTempat(ctx,f){
 var exc=ctx==='tugas'&&f&&f.id||'',A=[],B=[],C=[];
 pkList('tempat').slice().sort(pkUrutNama).forEach(function(t){
  var n=pkTerisi(t.id,exc),kuota=+t.kuota||0,isi=n+(kuota?'/'+kuota:'')+' siswa',ps=pkPksStatus(t),k=pkKunjunganAkhir(t.id),h=k?pkHariSejak(k.tanggal):null;
  if(ctx==='tugas'){
   var penuh=!!kuota&&n>=kuota;
   (penuh?B:A).push(pkO(t.id,t.nama,[t.kota,isi,ps[0]==='bad'?ps[1]:''].filter(Boolean).join(' · '),penuh));
  }else{
   (n?(h==null||h>30?A:B):C).push(pkO(t.id,t.nama,[t.kota,isi,k?'Terakhir dimonitor '+h+' hari lalu':'Belum pernah dimonitor'].filter(Boolean).join(' · ')));
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
  jurnal:[PF('tanggal','Tanggal','date',{r:1}),PF('unit','Unit kerja / pekerjaan','text',{r:1}),PF('uraian','Uraian kegiatan','textarea',{r:1}),PF('foto','Foto kegiatan','foto')],
  jurnalcat:[PF('cat','Catatan instruktur / pembimbing','textarea'),PF('verif','Diketahui oleh','select',{o:PK_VERIF,jd:'Diketahui oleh'})],
  kunjungan:[PF('tanggal','Tanggal','date',{r:1}),PF('tempatId','Tempat PKL','select',Object.assign({r:1},T1('kunjungan'))),PF('guruId','Guru pembimbing','select',G1('kunjungan')),
   PF('mode','Cara','select',{o:PK_MODE,jd:'Cara monitoring'}),PF('temuan','Temuan (penempatan, kesesuaian pekerjaan, kondisi siswa)','textarea'),PF('tindak','Tindak lanjut','textarea')],
  nilai:[PF('sid','Siswa','select',Object.assign({r:1},S1('nilai'))),PF('tp1','TP 1 · '+tp[0],'number',{ph:'0-100'}),PF('tp2','TP 2 · '+tp[1],'number',{ph:'0-100'}),PF('tp3','TP 3 · '+tp[2],'number',{ph:'0-100'}),PF('tp4','TP 4 · '+tp[3],'number',{ph:'0-100'}),
   PF('catGuru','Catatan guru pembimbing','textarea'),PF('catInstr','Catatan instruktur dunia kerja','textarea')]
 }[k]||[];
}
function pkField(fl,val,f){
 var n=' data-pkl="'+fl.k+'"',v=val==null?'':val,h;
 if(fl.t==='foto'){
  var w=pkFotoWajib('jurnal'),src=v?pkFotoSrc({id:(f&&f.id)||'',foto:v}):'';
  return '<div class="f">'+esc(fl.l)+(w?' *':' (opsional)')+'<div class="pk-row">'+(src?'<img class="pk-pv" src="'+src+'" alt="Foto kegiatan">':'<div class="pk-pv pk-kosong">'+(v?'Foto tersimpan':(w?'Foto wajib':'Belum ada foto'))+'</div>')+
   '<div style="display:grid;gap:8px"><button type="button" class="btn primary" data-act="pkl-fotoj">'+svg(ICO.camera||'',18)+' '+(v?'Ganti foto':'Ambil / pilih foto')+'</button>'+(v?'<button type="button" class="btn small danger" data-act="pkl-fotoj-hapus">Hapus foto</button>':'')+
   '<input type="file" accept="image/*" data-pklfotoj hidden></div></div></div>';
 }
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
var PK_SATUAN={tempat:'tempat',tugas:'penempatan',absen:'catatan',jurnal:'jurnal',kunjungan:'monitoring',nilai:'nilai',cek:'siswa',rekap:'siswa',daftar:'tempat'};
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
var PK_JUDUL={tempat:'Tempat PKL',tugas:'Penempatan siswa',jurnal:'Jurnal kegiatan',jurnalcat:'Catatan jurnal',kunjungan:'Monitoring PKL',nilai:'Nilai PKL'};
/* Tombol Simpan/Batal ada di atas formulir (tidak perlu menggulir), disusul pesan galat tepat di bawahnya. */
function pkAksiAtas(aksi,label){
 return '<div class="row pk-aksi" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" data-act="'+aksi+'">'+esc(label)+'</button><button type="button" class="btn" data-act="pkl-cancel">Batal</button></div>'+(PK.msg?'<div class="err">'+esc(PK.msg)+'</div>':'');
}
function pkFormView(){
 var k=PK.fk,sk=k==='jurnalcat'?'jurnalcat':k,F=pkSchema(sk),f=PK.f||{};
 var h='<div class="card"><b>'+esc(PK_JUDUL[k]||k)+(f.id?' · ubah':' · baru')+'</b>'+pkAksiAtas('pkl-save','Simpan');
 if(k==='jurnalcat'&&f.uraian)h+='<div class="note">'+esc(f.tanggal)+' · '+esc(f.unit||'')+' · '+esc(f.uraian)+'</div>';
 h+=F.map(function(fl){return pkField(fl,f[fl.k],f)+(k==='tempat'&&fl.k==='lng'?pkLokTools():'')+(k==='tempat'&&fl.k==='pksSelesai'?pkSuratTools(f):'')}).join('');
 if(k==='nilai')h+='<div class="note" id="pk-na">'+pkNilaiTeks(f)+'</div>';
 return h+'</div>';
}
function pkNilaiTeks(f){var v=pkNilaiAkhir(f);return v==null?'Nilai akhir: isi minimal satu TP (rata-rata keempat TP).':'Nilai akhir (rata-rata TP yang terisi): <b>'+v+'</b> · '+pkPredikat(v)}

/* ---------- Pengaturan PKL (admin) ----------
   Satu dokumen jenis 'setelan' per sekolah di koleksi pkl (dibaca semua pengguna login, ditulis guru/admin): zona absen, foto wajib per item, daftar tempat untuk siswa. */
var PK_SET0={tolak:'tolak',daftar:'belum',foto:{masuk:1,pulang:1,izin:0,sakit:0,jurnal:1}};
function pkSet(){
 var r=pkList('setelan')[0]||{};
 return {tolak:r.tolak==='tandai'?'tandai':'tolak',daftar:['selalu','belum','tidak'].indexOf(r.daftar)>-1?r.daftar:'belum',foto:Object.assign({},PK_SET0.foto,r.foto||{})};
}
function pkFotoWajib(k){return !!pkSet().foto[k]}
function pkSetSimpan(p){
 if(actRole()!=='admin')return;
 var cur=pkList('setelan')[0],o=cur?Object.assign({},cur):{id:'setelan_'+String((typeof schKode==='function'&&schKode())||'x').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20)};
 if(p.foto)o.foto=Object.assign({},pkSet().foto,p.foto);
 ['tolak','daftar'].forEach(function(k){if(p[k]!=null)o[k]=p[k]});
 pkPut('setelan',o).then(function(ok){toast(ok?'Pengaturan tersimpan.':'Pengaturan tersimpan di perangkat, akan dikirim saat online.');render()});
 render();
}
function pkTabSetelan(){
 var st=pkSet(),
  FT=[['masuk','Absen masuk (selfie)'],['pulang','Absen pulang (selfie)'],['izin','Izin (foto surat/bukti)'],['sakit','Sakit (foto surat/bukti)'],['jurnal','Jurnal kegiatan (foto kegiatan)']];
 return '<div class="card"><b>Pengaturan PKL</b><div class="note">Berlaku untuk semua siswa di sekolah ini. Perubahan langsung tersimpan.</div>'+
  bpField('Absen masuk/pulang di luar zona tempat PKL',' data-pkset="tolak"',[bpO('tolak','Tolak (siswa tidak bisa mengirim)','Siswa tidak bisa mengirim absen'),bpO('tandai','Terima, tandai "Di luar lokasi"','Absen tetap masuk, diberi tanda')],st.tolak,{tanpaCari:true})+
  '<div class="note">Zona = radius dari titik koordinat tempat PKL (isi di Tempat PKL). Tempat tanpa koordinat tidak bisa dicek, absen tetap diterima. GPS belum terbaca atau akurasi lebih buruk dari 500 m ditolak. Izin dan sakit tidak dibatasi lokasi.</div>'+
  '<div class="f">Foto wajib per item'+FT.map(function(x){return '<label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" data-pksetf="'+x[0]+'"'+(st.foto[x[0]]?' checked':'')+'> <span>'+esc(x[1])+'</span></label>'}).join('')+'</div>'+
  bpField('Daftar tempat PKL di halaman siswa',' data-pkset="daftar"',[bpO('belum','Hanya sebelum siswa ditempatkan'),bpO('selalu','Selalu tampil'),bpO('tidak','Disembunyikan')],st.daftar,{tanpaCari:true})+'</div>';
}

/* ---------- Koordinat tempat PKL: lokasi saya, peta, atau tempel dari Google Maps ----------
   Peta memakai Leaflet + OpenStreetMap, dimuat dari CDN hanya saat tombol "Pilih di peta" diketuk (tidak menambah beban halaman lain). */
var PK_LEAF={css:'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',js:'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
 cssSri:'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',jsSri:'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='};
function pkLokTools(){
 return '<div class="pk-lok"><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn small" data-act="pkl-lok-gps">Pakai lokasi saya</button><button type="button" class="btn small" data-act="pkl-lok-peta">Pilih di peta</button></div>'+
  '<div class="note">'+esc(PK.lokMsg||'Atau tempel koordinat dari Google Maps (mis. -6.9175, 107.6191) ke kolom Lintang.')+'</div></div>';
}
function pkLokIsi(lat,lng,msg){PK.f.lat=(+lat).toFixed(6);PK.f.lng=(+lng).toFixed(6);PK.lokMsg=msg||'';render()}
function pkLokGps(){
 if(!navigator.geolocation){PK.lokMsg='Perangkat tidak mendukung lokasi.';return render()}
 PK.lokMsg='Mengambil lokasi…';render();
 navigator.geolocation.getCurrentPosition(function(p){pkLokIsi(p.coords.latitude,p.coords.longitude,'Lokasi terisi (akurasi ±'+Math.round(p.coords.accuracy)+' m). Pastikan Anda sedang berada di tempat PKL.')},
  function(){PK.lokMsg='Lokasi tidak tersedia. Aktifkan izin lokasi, atau pilih di peta.';render()},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
/* "-6.9175, 107.6191" (salinan dari Google Maps) di kolom Lintang dipecah otomatis ke Lintang dan Bujur */
function pkLokTempel(v){
 var m=/^\s*(-?\d{1,3}(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/.exec(String(v||''));if(!m)return null;
 var la=+m[1].replace(',','.'),ln=+m[2].replace(',','.');
 return Math.abs(la)<=90&&Math.abs(ln)<=180?[la,ln]:null;
}
function pkLeaflet(cb){
 if(typeof window!=='undefined'&&window.L&&window.L.map)return cb(true);
 if(PK._leaf){PK._leaf.push(cb);return}
 PK._leaf=[cb];
 var c=document.createElement('link'),s=document.createElement('script'),
  fin=function(ok){var q=PK._leaf;PK._leaf=null;if(!ok){try{c.remove();s.remove()}catch(e){}}q.forEach(function(f){f(ok)})};
 c.rel='stylesheet';c.href=PK_LEAF.css;c.integrity=PK_LEAF.cssSri;c.crossOrigin='anonymous';document.head.appendChild(c);
 s.src=PK_LEAF.js;s.integrity=PK_LEAF.jsSri;s.crossOrigin='anonymous';
 s.onload=function(){fin(!!(window.L&&window.L.map))};s.onerror=function(){fin(false)};document.head.appendChild(s);
}
function pkPeta(){
 var f=PK.f||{},la=parseFloat(String(f.lat==null?'':f.lat).replace(',','.')),ln=parseFloat(String(f.lng==null?'':f.lng).replace(',','.')),
  ada=isFinite(la)&&isFinite(ln)&&Math.abs(la)<=90&&Math.abs(ln)<=180,rad=+f.radius||200,pos=ada?[la,ln]:[-6.9175,107.6191],
  ov=document.createElement('div');
 ov.className='pk-peta';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Pilih lokasi di peta');
 ov.innerHTML='<div class="pk-peta-bar"><form class="pk-peta-cari"><input type="search" placeholder="Cari nama tempat atau alamat" aria-label="Cari lokasi" enterkeyhint="search"><button type="submit" class="btn small">Cari</button></form></div>'+
  '<div class="pk-peta-map" id="pk-peta-map"></div>'+
  '<div class="pk-peta-ft"><div class="note" data-pkp="info">Memuat peta…</div><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" data-pkp="ok">Gunakan lokasi ini</button><button type="button" class="btn" data-pkp="gps">Lokasi saya</button><button type="button" class="btn" data-pkp="x">Batal</button></div></div>';
 document.body.appendChild(ov);
 var info=ov.querySelector('[data-pkp="info"]'),map=null,cur=null,
  tutup=function(){if(map){try{map.remove()}catch(e){}}ov.remove()};
 ov.querySelector('[data-pkp="x"]').addEventListener('click',tutup);
 pkLeaflet(function(ok){
  if(!ok){info.textContent='Peta gagal dimuat (perlu internet). Gunakan "Pakai lokasi saya" atau tempel koordinat dari Google Maps ke kolom Lintang.';return}
  map=L.map('pk-peta-map').setView(pos,ada?17:13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  var mk=L.marker(pos,{draggable:true,icon:L.divIcon({className:'pk-pin',html:'<span></span>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map),
   ring=L.circle(pos,{radius:rad,color:'#0a8f4e',weight:2,fillOpacity:.12}).addTo(map),
   set=function(a,b,geser){cur=[a,b];mk.setLatLng(cur);ring.setLatLng(cur);if(geser)map.setView(cur,Math.max(map.getZoom(),17));
    info.textContent='Lintang '+a.toFixed(6)+' · Bujur '+b.toFixed(6)+' · lingkaran hijau = radius absen '+rad+' m'};
  set(pos[0],pos[1]);if(!ada)info.textContent='Ketuk peta atau geser pin ke tempat PKL. Bisa juga cari alamat di atas.';
  map.on('click',function(e){set(e.latlng.lat,e.latlng.lng)});
  mk.on('dragend',function(){var p=mk.getLatLng();set(p.lat,p.lng)});
  setTimeout(function(){if(map)map.invalidateSize()},60);
  ov.querySelector('form').addEventListener('submit',function(e){
   e.preventDefault();var q=ov.querySelector('input').value.trim();if(!q)return;info.textContent='Mencari…';
   fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q='+encodeURIComponent(q)).then(function(r){return r.json()}).then(function(a){
    if(!a||!a[0]){info.textContent='Tempat tidak ditemukan. Coba kata kunci lain.';return}
    set(+a[0].lat,+a[0].lon,true);
   }).catch(function(){info.textContent='Pencarian gagal (perlu internet).'});
  });
  ov.querySelector('[data-pkp="gps"]').addEventListener('click',function(){
   if(!navigator.geolocation){info.textContent='Perangkat tidak mendukung lokasi.';return}
   info.textContent='Mengambil lokasi…';
   navigator.geolocation.getCurrentPosition(function(p){set(p.coords.latitude,p.coords.longitude,true)},function(){info.textContent='Lokasi tidak tersedia. Aktifkan izin lokasi.'},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });
  ov.querySelector('[data-pkp="ok"]').addEventListener('click',function(){
   if(!cur)return;var a=cur[0],b=cur[1];tutup();pkLokIsi(a,b,'Lokasi dipilih dari peta.');
  });
 });
}

/* ---------- Surat perjanjian: pindai dengan kamera menjadi PDF ----------
   Halaman difoto, dijadikan abu-abu dan dikontraskan seperti hasil pindai, disusun jadi satu PDF (jsPDF), lalu diunggah ke Drive (fungsi foto-drive, kind 'pks') saat Simpan.
   Di data tempat hanya tersimpan penanda 'drive:<fileId>' (pksFile) dan jumlah halaman (pksHal); PDF hanya dapat dibuka guru/admin. */
var PK_SCAN_HAL=8,PK_SCAN_MAX=260000;
function pkSuratTools(f){
 var p=PK.pksPdf,ada=p||f.pksFile,
  ket=p?('PDF baru ('+p.hal+' halaman, ±'+Math.round(p.data.length*.75/1024)+' KB) diunggah saat Simpan.'):(f.pksFile?'Surat perjanjian sudah terlampir'+(f.pksHal?' ('+f.pksHal+' halaman)':'')+'.':'Belum ada surat perjanjian terlampir.');
 return '<div class="pk-lok"><div class="note"><b>Surat perjanjian (PDF)</b><br>'+esc(ket)+'</div><div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn small" data-act="pkl-scan">'+svg(ICO.camera||'',16)+' Pindai dengan kamera</button>'+
  (ada?'<button type="button" class="btn small" data-act="pkl-surat-buka">Buka PDF</button><button type="button" class="btn small danger" data-act="pkl-surat-hapus">Lepas</button>':'')+'</div></div>';
}
function pkScanDok(g,w,h){
 var im=g.getImageData(0,0,w,h),d=im.data,n=w*h,hist=new Array(256),i,y;
 for(i=0;i<256;i++)hist[i]=0;
 for(i=0;i<n;i++){y=(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114)|0;d[i*4]=y;hist[y]++}
 var c=0,lo=0,hi=255;for(i=0;i<256;i++){c+=hist[i];if(c>=n*.01){lo=i;break}}
 c=0;for(i=255;i>=0;i--){c+=hist[i];if(c>=n*.35){hi=i;break}}
 if(hi-lo<40){hi=Math.min(255,lo+40)}
 for(i=0;i<n;i++){y=(d[i*4]-lo)*255/(hi-lo);y=y<0?0:y>255?255:y;if(y>205)y=255;d[i*4]=d[i*4+1]=d[i*4+2]=y;d[i*4+3]=255}
 g.putImageData(im,0,0);
}
function pkScanProses(file,mode,cb){
 var img=new Image(),url=URL.createObjectURL(file);
 img.onerror=function(){URL.revokeObjectURL(url);cb(null)};
 img.onload=function(){
  var side=1400,out=null;
  for(var t=0;t<5&&!out;t++){
   var k=Math.min(1,side/Math.max(img.width,img.height)),c=document.createElement('canvas');
   c.width=Math.max(1,Math.round(img.width*k));c.height=Math.max(1,Math.round(img.height*k));
   var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
   if(mode==='dok')pkScanDok(g,c.width,c.height);
   for(var q=.7;q>=.4;q-=.1){var u=c.toDataURL('image/jpeg',q);if(u.length<=PK_SCAN_MAX){out={d:u,w:c.width,h:c.height};break}}
   side=Math.round(side*.8);
  }
  URL.revokeObjectURL(url);cb(out);
 };
 img.src=url;
}
function pkScanPdf(pages){
 var J=window.jspdf.jsPDF,doc=null;
 pages.forEach(function(p){
  var land=p.w>p.h,pw=land?297:210,ph=land?210:297;
  if(!doc)doc=new J({unit:'mm',format:'a4',orientation:land?'l':'p'});else doc.addPage('a4',land?'l':'p');
  var r=Math.min(pw/p.w,ph/p.h),w=p.w*r,h=p.h*r;doc.addImage(p.d,'JPEG',(pw-w)/2,(ph-h)/2,w,h,undefined,'FAST');
 });
 return doc.output('datauristring').replace(/^data:application\/pdf;[^,]*base64,/,'data:application/pdf;base64,');
}
var PK_SC_IK={x:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 bolt:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M13 3L5 13.500h6L10 21l8-10.500h-6z"/></svg>',
 gal:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="4.500" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.600"/><path d="M4 17l5-4.500 4 3.500 3-2.500 4 3.500"/></svg>'};
function pkScan(opt){
 opt=opt||{};var jdl=opt.judul||'Pindai surat perjanjian';
 var pages=[],mode='dok',stream=null,busy=false,torch=false,ov=document.createElement('div');
 ov.className='pk-sc';ov.setAttribute('role','dialog');ov.setAttribute('aria-label',jdl);
 ov.innerHTML='<div class="pk-sc-top"><button type="button" class="pk-sc-ic" data-sc="x" aria-label="Tutup">'+PK_SC_IK.x+'</button><div class="pk-sc-jd"><b>'+esc(jdl)+'</b><span data-sc="cnt"></span></div><button type="button" class="pk-sc-ic" data-sc="torch" aria-label="Lampu kamera" aria-pressed="false" hidden>'+PK_SC_IK.bolt+'</button></div>'+
  '<div class="pk-sc-view"><video playsinline muted autoplay data-sc="vid"></video><div class="pk-sc-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="pk-sc-hint" data-sc="hint" role="status">Menyalakan kamera…</div><div class="pk-sc-off" data-sc="off" hidden></div></div>'+
  '<div class="pk-sc-strip" data-sc="strip"></div>'+
  '<div class="pk-sc-bar"><button type="button" class="pk-sc-sd" data-sc="gal">'+PK_SC_IK.gal+'<span>Galeri</span></button><button type="button" class="pk-sc-shut" data-sc="shot" aria-label="Ambil foto halaman" disabled><i></i></button>'+
  '<div class="pk-sc-mode" role="group" aria-label="Mode pindai"><button type="button" data-sc-mode="dok" aria-pressed="true">Dokumen</button><button type="button" data-sc-mode="warna" aria-pressed="false">Warna</button></div></div>'+
  '<div class="pk-sc-act"><button type="button" class="btn" data-sc="batal">Batal</button><button type="button" class="btn primary" data-sc="pdf" disabled>Buat PDF</button></div>'+
  '<input type="file" accept="image/*" capture="environment" data-sc="fk" hidden><input type="file" accept="image/*" multiple data-sc="fg" hidden>';
 document.body.appendChild(ov);
 var $=function(k){return ov.querySelector('[data-sc="'+k+'"]')},vid=$('vid'),
  hint=function(t){$('hint').textContent=t},
  henti=function(){if(stream){stream.getTracks().forEach(function(t){try{t.stop()}catch(e){}});stream=null}},
  tutup=function(){henti();ov.remove()},
  paint=function(){
   $('cnt').textContent=pages.length?pages.length+' dari '+PK_SCAN_HAL+' halaman':'Belum ada halaman';
   $('strip').innerHTML=pages.length?pages.map(function(p,i){return '<div class="pk-sc-th"><img src="'+p.d+'" alt="Halaman '+(i+1)+'"><b>'+(i+1)+'</b><button type="button" data-sc-del="'+i+'" aria-label="Hapus halaman '+(i+1)+'">×</button></div>'}).join(''):'<span class="pk-sc-kosong">Halaman yang sudah difoto tampil di sini.</span>';
   var st=$('strip');if(st.scrollTo)st.scrollTo({left:st.scrollWidth});
   $('pdf').disabled=!pages.length;$('pdf').textContent=pages.length?'Buat PDF ('+pages.length+' hal.)':'Buat PDF';
   $('shot').disabled=!stream||busy||pages.length>=PK_SCAN_HAL;
  },
  tambah=function(files){
   var q=Array.prototype.slice.call(files||[]);
   (function next(){
    if(!q.length||pages.length>=PK_SCAN_HAL){if(q.length)toast('Maksimal '+PK_SCAN_HAL+' halaman.');busy=false;hint(stream?'Sejajarkan halaman di dalam bingkai':'Kamera mati');return paint()}
    busy=true;hint('Memproses halaman…');paint();
    pkScanProses(q.shift(),mode,function(r){if(r)pages.push(r);else toast('Foto gagal diproses.');next()});
   })();
  },
  mati=function(msg){
   henti();vid.hidden=true;var o=$('off');o.hidden=false;
   o.innerHTML='<div class="pk-sc-offt">'+esc(msg)+'</div><button type="button" class="btn primary" data-sc="fkbtn">Buka kamera perangkat</button><button type="button" class="btn" data-sc="galbtn">Pilih dari galeri</button>';
   $('fkbtn').addEventListener('click',function(){$('fk').click()});$('galbtn').addEventListener('click',function(){$('fg').click()});
   hint('Kamera langsung tidak aktif');paint();
  },
  mulai=function(){
   var md=navigator.mediaDevices;
   if(!(md&&md.getUserMedia)||window.isSecureContext===false)return mati('Kamera langsung butuh sambungan aman (https) dan peramban yang mendukung.');
   md.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:2560},height:{ideal:1440}},audio:false}).then(function(s){
    if(!document.body.contains(ov)){s.getTracks().forEach(function(t){t.stop()});return}
    stream=s;vid.srcObject=s;var pl=vid.play();if(pl&&pl.catch)pl.catch(function(){});
    hint('Sejajarkan halaman di dalam bingkai');paint();
    var tr=s.getVideoTracks()[0],cap=(tr&&tr.getCapabilities&&tr.getCapabilities())||{};
    if(cap.torch)$('torch').hidden=false;
    try{if(cap.focusMode&&cap.focusMode.indexOf('continuous')>-1)tr.applyConstraints({advanced:[{focusMode:'continuous'}]})}catch(e){}
   }).catch(function(e){
    var n=String((e&&e.name)||'')+' '+String((e&&e.message)||'');
    mati(/NotAllowed|Permission|Denied/i.test(n)?'Izin kamera ditolak. Izinkan kamera untuk situs ini di pengaturan peramban, atau pakai kamera perangkat.':/NotFound|DevicesNotFound|Overconstrained/i.test(n)?'Kamera tidak ditemukan di perangkat ini.':'Kamera tidak bisa dibuka (mungkin sedang dipakai aplikasi lain).');
   });
  };
 paint();mulai();
 $('x').addEventListener('click',tutup);$('batal').addEventListener('click',tutup);
 $('gal').addEventListener('click',function(){$('fg').click()});
 ['fk','fg'].forEach(function(k){$(k).addEventListener('change',function(e){var fl=e.target.files;tambah(fl);setTimeout(function(){e.target.value=''},0)})});
 $('torch').addEventListener('click',function(){
  var tr=stream&&stream.getVideoTracks()[0];if(!tr)return;torch=!torch;
  tr.applyConstraints({advanced:[{torch:torch}]}).then(function(){$('torch').setAttribute('aria-pressed',String(torch))}).catch(function(){torch=false;toast('Lampu kamera tidak didukung.')});
 });
 $('shot').addEventListener('click',function(){
  if(!stream||busy||pages.length>=PK_SCAN_HAL)return;
  var w=vid.videoWidth,h=vid.videoHeight;if(!w||!h)return;
  var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(vid,0,0,w,h);
  ov.classList.add('kilat');setTimeout(function(){ov.classList.remove('kilat')},140);
  c.toBlob(function(b){if(b)tambah([b]);else toast('Foto gagal diambil.')},'image/jpeg',.92);
 });
 ov.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-sc-del],[data-sc-mode]');if(!b)return;
  if(b.hasAttribute('data-sc-del')){pages.splice(+b.getAttribute('data-sc-del'),1);paint()}
  else{mode=b.getAttribute('data-sc-mode');Array.prototype.forEach.call(ov.querySelectorAll('[data-sc-mode]'),function(x){x.setAttribute('aria-pressed',String(x===b))})}
 });
 $('pdf').addEventListener('click',function(){
  if(!pages.length||busy||!pkPdfSiap())return;
  try{
   var d=pkScanPdf(pages);
   if(d.length>5000000){toast('PDF terlalu besar. Kurangi jumlah halaman.');return}
   if(typeof opt.onPdf==='function'){tutup();opt.onPdf(d,pages.length);return}
   PK.pksPdf={data:d,hal:pages.length};tutup();render();
  }catch(e){toast('PDF gagal dibuat.')}
 });
}
/* Pemindai mandiri dari pintasan dasbor admin: hasil langsung diunduh sebagai PDF, tidak disimpan ke data PKL. */
function pkUnduhPdf(dataUrl,nama){
 var a=String(dataUrl).split(','),b=atob(a[1]||''),u=new Uint8Array(b.length),i;
 for(i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
 var url=URL.createObjectURL(new Blob([u],{type:'application/pdf'})),l=document.createElement('a');
 l.href=url;l.download=nama||'pindai.pdf';document.body.appendChild(l);l.click();l.remove();
 setTimeout(function(){URL.revokeObjectURL(url)},60000);
}
function pkPindaiMandiri(){
 pkScan({judul:'Pindai dokumen',onPdf:function(d,n){
  pkUnduhPdf(d,'Pindai_'+pkToday().replace(/-/g,'')+'.pdf');
  toast('PDF '+n+' halaman diunduh.');
 }});
}
async function pkSuratUnggah(){
 var p=PK.pksPdf,f=PK.f;if(!p)return true;
 if(!Cloud.on||typeof ldCall!=='function'){
  if(p.data.length>700000){PK.msg='Surat terlalu besar untuk mode lokal (maks ±500 KB). Kurangi jumlah halaman atau pakai mode Appwrite.';render();return false}
  f.pksFile=p.data;f.pksHal=p.hal;PK.pksPdf=null;return true;
 }
 try{
  var r=await ldCall({action:'upload',kind:'pks',data:p.data,nama:['PKS',pkSlug(f.nama,40),pkToday().replace(/-/g,'')].filter(Boolean).join('_')});
  f.pksFile='drive:'+r.fileId;f.pksHal=p.hal;PK.pksPdf=null;return true;
 }catch(e){
  var m=(e&&e.message)||'galat';
  PK.msg='Surat perjanjian gagal diunggah: '+m+(/tidak valid|tidak dikenal|bukan gambar/i.test(m)?' (fungsi foto-drive perlu diperbarui, lihat docs-PKL.md).':'');
  render();return false;
 }
}
function pkBukaPdf(dataUrl,nama){
 var a=String(dataUrl).split(','),b=atob(a[1]||''),u=new Uint8Array(b.length),i;
 for(i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
 var url=URL.createObjectURL(new Blob([u],{type:'application/pdf'})),w=window.open(url,'_blank');
 if(!w){var l=document.createElement('a');l.href=url;l.download=nama||'surat-perjanjian.pdf';document.body.appendChild(l);l.click();l.remove()}
 setTimeout(function(){URL.revokeObjectURL(url)},60000);
}
function pkSuratBuka(t){
 if(!t)return;
 if(t.data&&!t.pksFile)return pkBukaPdf(t.data);
 var ref=String(t.pksFile||'');
 if(ref.indexOf('data:')===0)return pkBukaPdf(ref,'surat-perjanjian-'+pkSlug(t.nama,30)+'.pdf');
 if(ref.indexOf('drive:')===0&&typeof ldCall==='function'){
  toast('Mengambil surat perjanjian…');
  ldCall({action:'getpks',docId:t.id,fileId:ref.slice(6)}).then(function(r){pkBukaPdf(r.data,'surat-perjanjian-'+pkSlug(t.nama,30)+'.pdf')}).catch(function(e){toast((e&&e.message)||'Surat tidak bisa dibuka.')});
  return;
 }
 toast('Belum ada surat perjanjian terlampir.');
}

/* ---------- Absen dengan selfie ---------- */
function pkGps(){
 PK.gps=null;
 if(!navigator.geolocation){PK.gpsMsg='Perangkat tidak mendukung lokasi.';return}
 PK.gpsMsg='Mengambil lokasi…';
 navigator.geolocation.getCurrentPosition(function(p){
  PK.gps={lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy),t:Date.now()};PK.gpsMsg='';if(S.tab==='pkl'&&PK.mode==='absen')render();
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
 var f=PK.f||{},tg=pkTugasSiswa(S.user.id),tp=tg&&pkById('tempat',tg.tempatId),hadir=f.tipe==='masuk'||f.tipe==='pulang',wajib=pkFotoWajib(f.tipe),st=pkSet(),ada=pkTempatBerkoordinat(tp);
 var h='<div class="card"><b>Absen PKL</b>'+pkAksiAtas('pkl-absen-kirim','Kirim absen')+'<div class="note">'+esc(pkToday())+' · '+esc(pkJam())+(tp?' · '+esc(tp.nama):'')+'</div>';
 h+='<div class="chips" role="group" aria-label="Jenis absen">'+Object.keys(PK_TIPE).map(function(k){return '<button type="button" data-act="pkl-tipe" data-v="'+k+'" aria-pressed="'+(f.tipe===k)+'">'+PK_TIPE[k]+'</button>'}).join('')+'</div>';
 h+='<div class="pk-row">'+(f.foto?'<img class="pk-pv" src="'+f.foto+'" alt="Selfie absen">':'<div class="pk-pv pk-kosong">'+(wajib?(hadir?'Selfie wajib':'Foto wajib'):'Foto surat/bukti (opsional)')+'</div>')+
  '<div style="display:grid;gap:8px"><button type="button" class="btn primary" data-act="pkl-selfie">'+svg(ICO.camera||'',18)+' '+(f.foto?'Ulangi foto':(hadir?'Ambil selfie':'Ambil foto'))+'</button>'+
  '<input type="file" accept="image/*" capture="user" data-pklfoto hidden></div></div>';
 var g=PK.gps,msg=PK.gpsMsg;
 h+='<div class="note">'+(g?'Lokasi terbaca (akurasi ±'+g.acc+' m).':esc(msg||'Lokasi belum terbaca.'))+(g&&ada?' Jarak ke tempat PKL ±'+pkJarak(+tp.lat,+tp.lng,g.lat,g.lng)+' m.':'')+' <button type="button" class="btn small" data-act="pkl-gps">Muat ulang lokasi</button>'+
  (hadir&&ada&&st.tolak==='tolak'?'<br>Absen '+PK_TIPE[f.tipe].toLowerCase()+' hanya diterima di dalam zona tempat PKL (radius '+(+tp.radius||200)+' m).':'')+'</div>';
 h+='<label class="f">Catatan'+(hadir?' (opsional)':' / keterangan *')+'<textarea rows="2" data-pkl="cat">'+esc(f.cat||'')+'</textarea></label>';
 return h+'</div>';
}
function pkTempatBerkoordinat(tp){return !!(tp&&tp.lat&&tp.lng&&!isNaN(+tp.lat)&&!isNaN(+tp.lng))}
/* Lokasi dianggap segar bila dibaca kurang dari 90 detik lalu; bila tidak, dibaca ulang sebelum zona absen masuk/pulang diperiksa. */
function pkGpsSegar(cb){
 if(!navigator.geolocation){PK.gps=null;return cb()}
 PK.gpsMsg='Memeriksa lokasi…';render();
 navigator.geolocation.getCurrentPosition(function(p){PK.gps={lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy),t:Date.now()};PK.gpsMsg='';cb()},
  function(){PK.gps=null;PK.gpsMsg='Lokasi tidak tersedia. Aktifkan izin lokasi agar kehadiran tercatat di tempat PKL.';cb()},{enableHighAccuracy:true,timeout:12000,maximumAge:0});
}
function pkAbsenKirim(){
 var f=PK.f||{},me=S.user,tg=pkTugasSiswa(me.id),t=pkToday(),tipe=f.tipe,hadir=tipe==='masuk'||tipe==='pulang',needFoto=pkFotoWajib(tipe);
 if(hadir&&f.foto&&!f.fotoLangsung){f.foto='';PK.msg='Ambil selfie langsung dari kamera.';return render()}
 if(actRole()!=='siswa'){PK.msg='Absen PKL hanya bisa diisi oleh siswa.';return render()}
 if(f.foto&&f.fotoTgl!==t){f.foto='';PK.msg='Foto bukan diambil hari ini. Ambil ulang.';return render()}
 if(!tg){PK.msg='Anda belum ditempatkan di tempat PKL. Hubungi guru pembimbing.';return render()}
 if(needFoto&&!f.foto){PK.msg=hadir?'Ambil selfie terlebih dahulu.':'Lampirkan foto terlebih dahulu.';return render()}
 if(!hadir&&!String(f.cat||'').trim()){PK.msg='Isi keterangan '+PK_TIPE[tipe].toLowerCase()+'.';return render()}
 var A=pkList('absen').filter(function(x){return x.sid===me.id&&x.tanggal===t});
 if(A.some(function(x){return x.tipe===tipe&&(tipe==='masuk'||tipe==='pulang')})){PK.msg='Absen '+PK_TIPE[tipe].toLowerCase()+' hari ini sudah tercatat.';return render()}
 if(tipe==='pulang'&&!A.some(function(x){return x.tipe==='masuk'})){PK.msg='Absen masuk hari ini belum tercatat.';return render()}
 if((tipe==='izin'||tipe==='sakit')&&A.some(function(x){return x.tipe===tipe})){PK.msg='Keterangan '+PK_TIPE[tipe].toLowerCase()+' hari ini sudah tercatat.';return render()}
 var tp=pkById('tempat',tg.tempatId),ada=pkTempatBerkoordinat(tp),cek=hadir&&ada&&pkSet().tolak==='tolak';
 var lanjut=function(){
  var g=PK.gps,jarak=null,lok='?',rad=tp&&(+tp.radius||200);
  if(g&&ada){jarak=pkJarak(+tp.lat,+tp.lng,g.lat,g.lng);lok=jarak<=rad+Math.min(g.acc||0,200)?'ya':'tidak'}
  if(cek){
   if(!g){PK.msg='Lokasi belum terbaca. Aktifkan izin lokasi, ketuk Muat ulang lokasi, lalu kirim lagi.';return render()}
   if((g.acc||0)>500){PK.msg='Akurasi lokasi terlalu rendah (±'+g.acc+' m). Pindah ke area terbuka, ketuk Muat ulang lokasi, lalu kirim lagi.';return render()}
   if(lok==='tidak'){PK.msg='Absen ditolak: Anda ±'+jarak+' m dari titik tempat PKL (batas '+rad+' m). Absen '+PK_TIPE[tipe].toLowerCase()+' hanya bisa di dalam zona tempat PKL. Bila Anda sudah di sana, ketuk Muat ulang lokasi lalu kirim lagi.';return render()}
  }
  var o={id:uid(),sid:me.id,nama:me.nama,kelas:me.kelas||'',tanggal:t,jam:pkJam(),tipe:tipe,foto:f.foto||'',cat:String(f.cat||'').trim(),tempatId:tg.tempatId,lokasi:lok,
   lat:g?+g.lat.toFixed(5):null,lng:g?+g.lng.toFixed(5):null,acc:g?g.acc:null,jarak:jarak};
  pkPut('absen',o).then(function(ok){PK.mode='list';PK.f=null;PK.msg='';toast(ok?'Absen '+PK_TIPE[tipe].toLowerCase()+' tercatat.':'Absen tersimpan di perangkat, akan dikirim saat online.');render()});
 };
 if(cek&&(!PK.gps||(PK.gps.t&&Date.now()-PK.gps.t>90000)))return pkGpsSegar(lanjut);
 lanjut();
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
 }else h+='<div class="note">Anda belum ditempatkan. Guru pembimbing akan menetapkan tempat PKL Anda'+(pkSet().daftar==='tidak'?'.':'; daftar tempat ada di bawah.')+'</div>';
 h+='</div>';
 if(tg){
  h+='<div class="card"><b>Hari ini ('+esc(t)+')</b><div class="chips" style="gap:6px">'+Object.keys(PK_TIPE).map(function(k){var a=hr.filter(function(x){return x.tipe===k})[0];return a?pkPill('ok',PK_TIPE[k]+' '+a.jam):''}).join('')+(hr.length?'':pkPill('warn','Belum absen'))+'</div>'+
   '<div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn primary" data-act="pkl-absen">'+svg(ICO.camera||'',18)+' Absen dengan selfie</button><button type="button" class="btn" data-act="pkl-new" data-k="jurnal">Tulis jurnal</button></div></div>';
  var r=pkRekap(me.id);
  h+='<div class="stats"><div class="card"><span class="label">Hadir</span><b class="mono">'+r.hadir+'</b></div><div class="card"><span class="label">Izin · Sakit</span><b class="mono">'+r.izin+' · '+r.sakit+'</b></div><div class="card"><span class="label">Tanpa ket.</span><b class="mono">'+r.alpa+'</b></div></div>';
 }
 h+='<div class="card"><b>Riwayat absen</b>'+(mine.length?mine.slice(0,12).map(pkAbsenBaris).join(''):'<div class="note">Belum ada absen.</div>')+'</div>';
 h+='<div class="card"><b>Jurnal kegiatan</b>'+(jr.length?'<div class="row"><button type="button" class="btn small" data-act="pkl-pdf-jurnal" data-v="'+esc(me.id)+'">PDF jurnal saya</button></div>':'')+(jr.length?jr.slice(0,15).map(function(j){return pkJurnalBaris(j,false)}).join(''):'<div class="note">Belum ada jurnal.</div>')+'</div>';
 var T0=pkList('tempat').sort(pkUrutNama),Z=pkSaring('daftar',T0),T=Z.list,sd=pkSet().daftar;
 if(sd==='selalu'||(sd==='belum'&&!tg))h+='<div class="card"><details data-pkd="daftar"'+(PK.tOpen?' open':'')+'><summary><b>Daftar tempat PKL ('+T.length+(Z.aktif?' dari '+T0.length:'')+')</b></summary>'+Z.bar+(T.length?T.map(function(x){return pkTempatCard(x,false)}).join(''):'<div class="note">'+(T0.length?'Tidak ada tempat PKL yang cocok dengan saringan.':'Belum ada tempat PKL.')+'</div>')+'</details></div>';
 return h;
}
function pkAbsenBaris(a){
 var lok=a.lokasi==='ya'?pkPill('ok','Di lokasi'):a.lokasi==='tidak'?pkPill('warn','Di luar lokasi'+(a.jarak!=null?' ±'+a.jarak+' m':'')):'';
 return '<div class="pk-row" style="padding:6px 0;border-top:1px solid var(--line)">'+(function(){var src=pkFotoSrc(a);return src?'<img class="pk-th" data-act="pkl-zoom" data-v="'+esc(a.id)+'" src="'+src+'" alt="Selfie '+esc(a.nama||'')+'">':((a.foto||a.fotoAda)?'<div class="pk-th pk-kosong">foto</div>':'')})()+
  '<div class="note" style="flex:1"><b>'+esc(PK_TIPE[a.tipe]||a.tipe)+'</b> · '+esc(a.tanggal)+' '+esc(a.jam||'')+(a.nama&&isStaff()?' · '+esc(a.nama)+(a.kelas?' ('+esc(a.kelas)+')':''):'')+' '+lok+(a.cat?'<br>'+esc(a.cat):'')+(a.r?'':'<br>'+pkPill('warn','Belum terkirim'))+'</div></div>';
}
function pkThumb(a){var src=pkFotoSrc(a);return src?'<img class="pk-th" data-act="pkl-zoom" data-v="'+esc(a.id)+'" src="'+src+'" alt="Foto">':((a.foto||a.fotoAda)?'<div class="pk-th pk-kosong">foto</div>':'')}
function pkJurnalBaris(j,staff){
 return '<div style="padding:6px 0;border-top:1px solid var(--line)"><div class="pk-row">'+pkThumb(j)+'<div class="note" style="flex:1"><b>'+esc(j.tanggal)+'</b> · '+esc(j.unit||'')+(staff&&j.nama?' · '+esc(j.nama):'')+'<br>'+esc(j.uraian||'')+
  (j.cat?'<br><i>Catatan: '+esc(j.cat)+'</i>':'')+(j.verif?'<br>'+pkPill('ok','Diketahui: '+({instruktur:'instruktur',guru:'guru pembimbing',keduanya:'instruktur dan guru'}[j.verif]||j.verif)):(staff?'<br>'+pkPill('warn','Menunggu catatan'):''))+(j.r?'':' '+pkPill('warn','Belum terkirim'))+'</div></div>'+
  (staff?'<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="jurnalcat" data-v="'+esc(j.id)+'">Beri catatan</button><button type="button" class="btn small danger" data-act="pkl-del" data-k="jurnal" data-v="'+esc(j.id)+'">Hapus</button></div>':
   (!j.verif&&Date.now()-j.ts<7*86400000?'<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="jurnal" data-v="'+esc(j.id)+'">Ubah</button></div>':''))+'</div>';
}

/* ---------- Tampilan guru dan admin ---------- */
var PK_TABS=[['tempat','Tempat PKL'],['tugas','Penempatan'],['absen','Absensi'],['jurnal','Jurnal'],['kunjungan','Monitoring'],['nilai','Nilai'],['cek','Kelengkapan'],['rekap','Rekap']];
/* Judul dan menu mengikuti tampilan Administrasi Akademik (kelas akd-*). Urutan tab = urutan tahap PKL. */
var PK_IKON={tempat:'<path d="M12 21s-6.5-5.600-6.500-11a6.500 6.500 0 0 1 13 0c0 5.4-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
 tugas:'<circle cx="9" cy="8" r="3.200"/><path d="M3 20c0-3.300 2.700-6 6-6s6 2.700 6 6M16 11l2 2 3.500-4"/>',
 absen:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>',
 jurnal:'<path d="M5 4.500h13v15H8a3 3 0 0 1-3-3zM9 9h6M9 12.500h6"/>',
 kunjungan:'<circle cx="6" cy="18" r="2.500"/><circle cx="18" cy="6" r="2.500"/><path d="M8.500 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.500"/>',
 nilai:'<path d="m12 4 2.400 5 5.400.700-4 3.800 1 5.400-4.800-2.700L7.200 19l1-5.400-4-3.800 5.400-.700z"/>',
 cek:'<path d="M4 7l1.700 1.700L9 5.500M4 16l1.700 1.700L9 14.500M12 7h8M12 16h8"/>',
 rekap:'<path d="M5 20V10M12 20V4M19 20v-7"/>',saya:'<circle cx="12" cy="8" r="3.500"/><path d="M5 20c0-3.900 3.100-7 7-7s7 3.100 7 7"/>'};
PK_IKON.setelan='<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M18.400 5.600l-2.100 2.100M7.700 16.300l-2.100 2.100"/>';
function pkTabs(){return PK_TABS.concat(actRole()==='admin'?[['setelan','Pengaturan']]:[])}
function pkIkon(k,n){return typeof svg==='function'?svg(PK_IKON[k],n):''}
function pkMenuHtml(){
 return '<div class="akd-tabs pk-tabs" role="tablist" aria-label="Menu PKL">'+pkTabs().map(function(x){var on=PK.tab===x[0];return '<button type="button" role="tab" data-act="pkl-tab" data-v="'+x[0]+'" aria-selected="'+on+'" aria-pressed="'+on+'">'+pkIkon(x[0],16)+'<span>'+x[1]+'</span></button>'}).join('')+'</div>';
}
/* tab aktif digeser ke tengah setelah layar digambar ulang */
function pkTabTampak(){
 var bar=document.querySelector&&document.querySelector('.pk-tabs'),on=bar&&bar.querySelector('[aria-selected="true"]');
 if(on&&bar.scrollTo)bar.scrollTo({left:Math.max(0,on.offsetLeft-bar.offsetLeft-(bar.clientWidth-on.offsetWidth)/2)});
}
function pkTambah(k,label){return '<div class="row"><button type="button" class="btn small primary" data-act="pkl-new" data-k="'+k+'">+ '+esc(label)+'</button></div>'}
function pkAksi(k,id){return '<div class="row" style="gap:6px"><button type="button" class="btn small" data-act="pkl-edit" data-k="'+k+'" data-v="'+esc(id)+'">Ubah</button><button type="button" class="btn small danger" data-act="pkl-del" data-k="'+k+'" data-v="'+esc(id)+'">Hapus</button></div>'}
function pkRingkas(){
 var t=pkToday(),T=pkList('tempat'),G=pkList('tugas').filter(function(x){return x.status==='aktif'}),A=pkList('absen').filter(function(x){return x.tanggal===t&&x.tipe==='masuk'&&!x.uji}),
  J=pkList('jurnal').filter(function(x){return !x.verif}),tel=T.filter(function(x){var k=pkKunjunganAkhir(x.id),n=G.filter(function(g){return g.tempatId===x.id}).length;if(!n)return false;var h=k?pkHariSejak(k.tanggal):999;return h>30}).length,
  bel=pkSiswaAll().filter(pkPeserta).filter(function(u){return !pkTugasSiswa(u.id)}).length;
 function st(l,v,c){return '<div class="card"><span class="label">'+l+'</span><b class="mono">'+v+'</b>'+(c?'<span class="note">'+c+'</span>':'')+'</div>'}
 return '<div class="stats pk-stats">'+st('Tempat PKL',T.length)+st('Siswa PKL',G.length,bel+' belum ditempatkan')+st('Hadir hari ini',A.length+'/'+G.length)+'</div>'+
  '<div class="stats pk-stats">'+st('Jurnal baru',J.length,'menunggu catatan')+st('Perlu dimonitor',''+tel,'> 30 hari')+st('Nilai',pkList('nilai').length,'sudah diisi')+'</div>';
}
function pkStaffView(){
 if(PK.tab==='setelan'&&actRole()!=='admin')PK.tab='tempat';
 var f={tempat:pkTabTempat,tugas:pkTabTugas,absen:pkTabAbsen,jurnal:pkTabJurnal,kunjungan:pkTabKunjungan,nilai:pkTabNilai,cek:pkTabCek,rekap:pkTabRekap,setelan:pkTabSetelan}[PK.tab]||pkTabTempat;
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(pkTabTampak);
 return pkMenuHtml()+f()+pkRingkas();
}
function pkTabTempat(){
 var T0=pkList('tempat').sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')}),Z=pkSaring('tempat',T0),T=Z.list;
 return '<div class="card"><b>Daftar tempat PKL ('+T.length+(Z.aktif?' dari '+T0.length:'')+')</b>'+pkTambah('tempat','Tempat PKL baru')+(typeof pkxBar==='function'?pkxBar():'')+Z.bar+(T.length?T.map(function(t){
  var ps=pkPksStatus(t),n=pkList('tugas').filter(function(x){return x.tempatId===t.id&&x.status==='aktif'}).length,k=pkKunjunganAkhir(t.id),h=k?pkHariSejak(k.tanggal):null;
  return '<div style="padding:8px 0;border-top:1px solid var(--line)">'+pkTempatCard(t,false)+
   '<div class="note">'+(t.pks?'PKS sekolah: '+esc(t.pks):'')+(t.pksMitra?' · PKS mitra: '+esc(t.pksMitra):'')+(t.pksSelesai?' · berlaku s.d. '+esc(t.pksSelesai):'')+(t.fasilitas?'<br>Fasilitas: '+esc(t.fasilitas):'')+
   '<br>'+(k?'Monitoring terakhir '+esc(k.tanggal)+' ('+h+' hari lalu)':'Belum pernah dimonitor')+(n&&(h==null||h>30)?' '+pkPill('warn','Perlu monitoring'):'')+(t.lat&&t.lng?' · '+pkPill('plain','Koordinat terisi'):' · '+pkPill('warn','Koordinat belum diisi: lokasi absen tidak bisa dicek'))+(t.pksFile?'<br><button type="button" class="btn small" data-act="pkl-surat-lihat" data-v="'+esc(t.id)+'">Surat perjanjian (PDF)</button>':'')+'</div>'+pkAksi('tempat',t.id)+'</div>'}).join(''):'<div class="note">'+(T0.length?'Tidak ada tempat PKL yang cocok dengan saringan.':'Belum ada tempat PKL.')+'</div>')+'</div>';
}
function pkTabTugas(){
 var G0=pkList('tugas').sort(function(a,b){return pkTempatNama(a.tempatId).localeCompare(pkTempatNama(b.tempatId),'id')||pkNm(a).localeCompare(pkNm(b),'id')}),Z=pkSaring('tugas',G0),G=Z.list,bel=pkSiswaAll().filter(pkPeserta).filter(function(u){return !pkTugasSiswa(u.id)});
 return '<div class="card"><b>Penempatan siswa ('+G.length+(Z.aktif?' dari '+G0.length:'')+')</b>'+pkTambah('tugas','Penempatan baru')+(typeof pkoBar==='function'?pkoBar('tugas'):'')+Z.bar+
  (bel.length?'<details><summary class="note">'+bel.length+' siswa belum ditempatkan</summary><div class="note">'+bel.map(function(u){return esc(u.nama)+(u.kelas?' ('+esc(u.kelas)+')':'')}).join(', ')+'</div></details>':'')+
  (G.length?G.map(function(g){var gu=g.guruId&&pkUser(g.guruId);return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(pkNm(g))+'</b>'+(pkKl(g)?' ('+esc(pkKl(g))+')':'')+' · '+esc(pkTempatNama(g.tempatId))+'<br>Pembimbing: '+esc(gu?gu.nama:(g.guruNama||'-'))+(g.instruktur?' · Instruktur: '+esc(g.instruktur):'')+'<br>'+esc(g.mulai||'-')+' s.d. '+esc(g.selesai||'-')+' '+pkPill(g.status==='aktif'?'ok':'plain',g.status||'aktif')+'</div>'+pkAksi('tugas',g.id)+'</div>'}).join(''):'<div class="note">'+(G0.length?'Tidak ada penempatan yang cocok dengan saringan.':'Belum ada penempatan.')+'</div>')+'</div>';
}
function pkTabAbsen(){
 var d=PK.ft||pkToday(),A0=pkList('absen').filter(function(x){return x.tanggal===d}).sort(function(a,b){return String(a.jam).localeCompare(String(b.jam))}),Z=pkSaring('absen',A0),A=Z.list,G=pkList('tugas').filter(function(x){return x.status==='aktif'}),
  sdh={};A.forEach(function(x){if(!x.uji&&(x.tipe==='masuk'||x.tipe==='izin'||x.tipe==='sakit'))sdh[x.sid]=1});var blm=G.filter(function(g){return !sdh[g.sid]});
 return pkUjiKartu()+'<div class="card"><b>Absensi harian</b><label class="f">Tanggal<input type="date" data-pkft value="'+esc(d)+'"></label>'+(typeof pkoBar==='function'?pkoBar('absen'):'')+Z.bar+
  '<div class="note">'+A.length+(Z.aktif?' dari '+A0.length:'')+' catatan · '+blm.length+' siswa belum absen'+(blm.length?': '+blm.map(function(g){return esc(pkNm(g))}).join(', '):'')+'</div>'+
  (A.length?A.map(function(a){return pkAbsenBaris(a)+pkTandaAbsen(a)+(actRole()==='admin'?'<div class="row"><button type="button" class="btn small danger" data-act="pkl-del" data-k="absen" data-v="'+esc(a.id)+'">Hapus</button></div>':'')}).join(''):'<div class="note">'+(A0.length?'Tidak ada catatan yang cocok dengan saringan.':'Belum ada absen pada tanggal ini.')+'</div>')+'</div>';
}
/* tanda untuk guru: data uji, atau tanggal absen berbeda dengan tanggal diterima server (WIB) */
function pkTandaAbsen(a){
 if(a.uji)return '<div class="note"><span class="pill warn">Data uji coba admin</span> tidak dihitung di rekap</div>';
 if(!a.dibuat)return '';
 var s=new Date(Date.parse(a.dibuat)+7*3600000).toISOString().slice(0,10);
 return s===a.tanggal?'':'<div class="note"><span class="pill warn">Periksa tanggal</span> diterima server '+esc(s)+' (offline atau jam HP tidak sesuai)</div>';
}
/* fasilitas uji coba: hanya admin, tanpa selfie, selalu bertanda uji */
function pkUjiKartu(){
 if(actRole()!=='admin')return '';
 var G=pkList('tugas').filter(function(g){return g.status==='aktif'});
 return '<details class="card"><summary><b>Uji coba absen (khusus admin)</b></summary><div class="note">Data bertanda uji, tanpa selfie, tidak dihitung di rekap. Hapus setelah selesai menguji.</div>'+
  '<label class="f">Siswa<select id="pkuji-sid">'+G.map(function(g){return '<option value="'+esc(g.sid)+'">'+esc(pkNm(g))+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Tanggal<input type="date" id="pkuji-tgl" max="'+pkToday()+'" value="'+pkToday()+'"></label>'+
  '<button type="button" class="btn small primary" data-act="pkl-uji"'+(G.length?'':' disabled')+'>Buat data uji (Masuk)</button></details>';
}
function pkUjiBuat(){
 if(actRole()!=='admin')return toast('Hanya admin.');
 var sid=(document.getElementById('pkuji-sid')||{}).value,tgl=(document.getElementById('pkuji-tgl')||{}).value,tg=sid&&pkTugasSiswa(sid);
 if(!tg||!/^\d{4}-\d{2}-\d{2}$/.test(tgl)||tgl>pkToday())return toast('Pilih siswa dan tanggal yang tidak melewati hari ini.');
 pkPut('absen',{id:uid(),sid:sid,nama:pkNm(tg),kelas:pkKl(tg),sekolah:tg.sekolah||'',tanggal:tgl,jam:pkJam(),tipe:'masuk',foto:'',cat:'Uji coba admin',tempatId:tg.tempatId,lokasi:'?',uji:true})
  .then(function(ok){toast(ok?'Data uji dibuat.':'Data uji tersimpan di perangkat, belum terkirim.');render()});
}
function pkTabJurnal(){
 var J0=pkList('jurnal').sort(function(a,b){return (a.verif?1:0)-(b.verif?1:0)||String(b.tanggal).localeCompare(String(a.tanggal))}),Z=pkSaring('jurnal',J0),J=Z.list.slice(0,60);
 return '<div class="card"><b>Jurnal kegiatan siswa ('+(Z.aktif?Z.list.length+' dari ':'')+J0.length+')</b><div class="note">Yang belum diberi catatan tampil lebih dulu. Maksimal 60 terbaru di layar; Excel dan PDF memuat semua yang tampil sesuai saringan.</div>'+(typeof pkoBar==='function'?pkoBar('jurnal'):'')+Z.bar+(J.length?J.map(function(j){return pkJurnalBaris(j,true)}).join(''):'<div class="note">'+(J0.length?'Tidak ada jurnal yang cocok dengan saringan.':'Belum ada jurnal.')+'</div>')+'</div>';
}
function pkTabKunjungan(){
 var K0=pkList('kunjungan').sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))}),Z=pkSaring('kunjungan',K0),K=Z.list;
 return '<div class="card"><b>Daftar monitoring ('+K.length+(Z.aktif?' dari '+K0.length:'')+')</b><div class="note">Panduan: guru pembimbing memantau minimal sebulan sekali (kunjungan atau komunikasi dengan dunia kerja).</div>'+pkTambah('kunjungan','Monitoring baru')+(typeof pkoBar==='function'?pkoBar('kunjungan'):'')+Z.bar+
  (K.length?K.map(function(k){var gu=k.guruId&&pkUser(k.guruId);return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(k.tanggal)+'</b> · '+esc(pkTempatNama(k.tempatId))+' · '+(k.mode==='daring'?'daring':'langsung')+' · '+esc(gu?gu.nama:(k.guruNama||'-'))+(k.temuan?'<br>Temuan: '+esc(k.temuan):'')+(k.tindak?'<br>Tindak lanjut: '+esc(k.tindak):'')+'</div>'+pkAksi('kunjungan',k.id)+'</div>'}).join(''):'<div class="note">'+(K0.length?'Tidak ada monitoring yang cocok dengan saringan.':'Belum ada monitoring.')+'</div>')+'</div>';
}
function pkTabNilai(){
 var N0=pkList('nilai').sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')}),Z=pkSaring('nilai',N0),N=Z.list;
 PK.vis.nilai=N.map(function(x){return x.sid});
 return '<div class="card"><b>Nilai PKL ('+N.length+(Z.aktif?' dari '+N0.length:'')+')</b><div class="note">Empat TP (Lampiran 4 dan 5 panduan). Kehadiran diambil otomatis dari absensi.</div>'+pkTambah('nilai','Nilai baru').replace('</div>',N.length?'<button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="semua">'+(Z.aktif?'PDF nilai yang tampil ('+N.length+')':'PDF semua nilai')+'</button></div>':'</div>')+(typeof pkoBar==='function'?pkoBar('nilai'):'')+Z.bar+
  (N.length?N.map(function(n){var v=pkNilaiAkhir(n),r=pkRekap(n.sid),tp=pkTP();return '<div style="padding:8px 0;border-top:1px solid var(--line)"><div class="note"><b>'+esc(n.nama||'')+'</b>'+(n.kelas?' ('+esc(n.kelas)+')':'')+' · '+esc(pkTempatNama(n.tempatId))+
   '<br>'+[1,2,3,4].map(function(i){return 'TP'+i+': '+(n['tp'+i]===''||n['tp'+i]==null?'-':n['tp'+i])}).join(' · ')+'<br>Nilai akhir: <b>'+(v==null?'-':v)+'</b> '+(v==null?'':pkPill(v>=75?'ok':'warn',pkPredikat(v)))+
   '<br>Kehadiran: sakit '+r.sakit+', izin '+r.izin+', tanpa keterangan '+r.alpa+(n.catGuru?'<br>Guru: '+esc(n.catGuru):'')+(n.catInstr?'<br>Instruktur: '+esc(n.catInstr):'')+'</div>'+pkAksi('nilai',n.id).replace('</div>','<button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="'+esc(n.sid)+'">PDF</button></div>')+'</div>'}).join(''):'<div class="note">'+(N0.length?'Tidak ada nilai yang cocok dengan saringan.':'Belum ada nilai.')+'</div>')+'</div>';
}
function pkCekOf(sid){return pkById('cek','cek_'+sid)}
function pkTabCek(){
 var G0=pkList('tugas').filter(function(x){return x.status!=='dibatalkan'}).sort(function(a,b){return pkNm(a).localeCompare(pkNm(b),'id')}),Z=pkSaring('cek',G0),G=Z.list;
 return '<div class="card"><b>Kelengkapan PKL per siswa</b><div class="note">Centang saat dokumen atau tahapan sudah terpenuhi. Tersimpan otomatis.</div>'+(typeof pkoBar==='function'?pkoBar('cek'):'')+Z.bar+(G.length?G.map(function(g){
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
 return '<div class="card"><b>Rekap PKL per siswa'+(Z.aktif?' ('+R.length+' dari '+R0.length+')':'')+'</b><div class="row"><button type="button" class="btn small primary" data-act="pkl-xls">Unduh Excel</button></div>'+(typeof pkoBar==='function'?pkoBar('rekap'):'')+Z.bar+
  '<div class="note">Tanpa keterangan = hari kerja Senin-Jumat sejak mulai PKL dikurangi hadir, izin, dan sakit (perkiraan; hari libur belum dikurangi).</div>'+
  '<div class="akd-twrap"><table class="akd-tbl akd-tbl-l"><thead><tr><th>Siswa</th><th>Tempat</th><th>Hadir</th><th>Izin</th><th>Sakit</th><th>T.ket</th><th>Di luar lokasi</th><th>Jurnal</th><th>Kelengkapan</th><th>Nilai</th><th>PDF</th></tr></thead><tbody>'+
  (R.length?R.map(function(x){return '<tr><td>'+esc(pkNm(x.g))+'</td><td>'+esc(pkTempatNama(x.g.tempatId))+'</td><td>'+x.r.hadir+'</td><td>'+x.r.izin+'</td><td>'+x.r.sakit+'</td><td>'+x.r.alpa+'</td><td>'+x.r.luar+'</td><td>'+x.jurnal+'</td><td>'+x.cek+'/'+PK_CEK.length+'</td><td>'+(x.nilai==null?'-':x.nilai)+'</td><td><button type="button" class="btn small" data-act="pkl-pdf-nilai" data-v="'+esc(x.g.sid)+'">Nilai</button> <button type="button" class="btn small" data-act="pkl-pdf-jurnal" data-v="'+esc(x.g.sid)+'">Jurnal</button></td></tr>'}).join(''):'<tr><td colspan="11">Belum ada penempatan.</td></tr>')+'</tbody></table></div></div>';
}
function pkXls(){
 if(typeof XLSX==='undefined'){toast('Pustaka Excel belum termuat.');return}
 var wb=XLSX.utils.book_new(),sh=function(n,rows){XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.length?rows:[{Keterangan:'Belum ada data'}]),n)},tp=pkTP();
 sh('Tempat PKL',pkList('tempat').map(function(t){var k=pkKunjunganAkhir(t.id);return {Nama:t.nama,Bidang:t.bidang||'',Alamat:t.alamat||'',Kota:t.kota||'',Lokasi:t.negeri==='luar'?'Luar negeri':'Dalam negeri',Telepon:t.telp||'',Pimpinan:t.pimpinan||'',Instruktur:t.instruktur||'','Kontak instruktur':t.instrTelp||'',Kuota:t.kuota||'','Siswa aktif':pkList('tugas').filter(function(x){return x.tempatId===t.id&&x.status==='aktif'}).length,'Jam kerja':t.jam||'','No. PKS sekolah':t.pks||'','No. PKS mitra':t.pksMitra||'','PKS mulai':t.pksMulai||'','PKS selesai':t.pksSelesai||'','Status PKS':pkPksStatus(t)[1],Fasilitas:t.fasilitas||'','Monitoring terakhir':k?k.tanggal:''}}));
 sh('Penempatan',pkList('tugas').map(function(g){var gu=g.guruId&&pkUser(g.guruId);return {Siswa:pkNm(g),Kelas:pkKl(g),Tempat:pkTempatNama(g.tempatId),'Guru pembimbing':gu?gu.nama:(g.guruNama||''),Instruktur:g.instruktur||'',Mulai:g.mulai||'',Selesai:g.selesai||'',Status:g.status||''}}));
 sh('Absensi',pkList('absen').filter(function(x){return !x.uji}).sort(function(a,b){return a.ts-b.ts}).map(function(a){return {Tanggal:a.tanggal,Jam:a.jam||'',Siswa:a.nama||'',Kelas:a.kelas||'',Jenis:PK_TIPE[a.tipe]||a.tipe,Tempat:pkTempatNama(a.tempatId),Lokasi:a.lokasi==='ya'?'Di lokasi':a.lokasi==='tidak'?'Di luar lokasi':'Tidak diketahui','Jarak (m)':a.jarak==null?'':a.jarak,Selfie:(a.foto||a.fotoAda)?'Ada':'Tidak',Catatan:a.cat||''}}));
 sh('Rekap kehadiran',pkRekapBaris().map(function(x){return {Siswa:pkNm(x.g),Kelas:pkKl(x.g),Tempat:pkTempatNama(x.g.tempatId),Hadir:x.r.hadir,Izin:x.r.izin,Sakit:x.r.sakit,'Tanpa keterangan':x.r.alpa,'Masuk di luar lokasi':x.r.luar,'Jurnal':x.jurnal,'Kelengkapan':x.cek+'/'+PK_CEK.length,'Nilai akhir':x.nilai==null?'':x.nilai,Guru:x.guru}}));
 sh('Jurnal',pkList('jurnal').sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))}).map(function(j){return {Tanggal:j.tanggal,Siswa:j.nama||'',Kelas:j.kelas||'','Unit kerja':j.unit||'',Uraian:j.uraian||'',Catatan:j.cat||'','Diketahui oleh':j.verif||''}}));
 sh('Monitoring',pkList('kunjungan').sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))}).map(function(k){var gu=k.guruId&&pkUser(k.guruId);return {Tanggal:k.tanggal,Tempat:pkTempatNama(k.tempatId),Guru:gu?gu.nama:(k.guruNama||''),Cara:k.mode==='daring'?'Daring':'Langsung',Temuan:k.temuan||'','Tindak lanjut':k.tindak||''}}));
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
function pkJurnalSiswa(sid){return pkList('jurnal').filter(function(x){return x.sid===sid}).sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))})}
function pkPdfJurnalHal(doc,sid){
 var J=pkJurnalSiswa(sid),I=pkIdentSiswa(sid);
 pkKop(doc,'JURNAL KEGIATAN PRAKTIK KERJA LAPANGAN');
 var y=pkPdfIdent(doc,[I.rows[0],I.rows[2],I.rows[4],I.rows[5],I.rows[6],I.rows[7]],44)+4;
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:8.5,cellPadding:2,valign:'top'},headStyles:PK_TH,head:[['No','Hari/Tanggal','Unit kerja/Pekerjaan','Uraian kegiatan','Catatan']],
  body:J.map(function(j,i){return [String(i+1),pkAscii(pkTglHari(j.tanggal)),pkAscii(j.unit),pkAscii(j.uraian),pkAscii(j.cat||'')]}),columnStyles:{0:{cellWidth:8,halign:'center'},1:{cellWidth:30},2:{cellWidth:34},4:{cellWidth:38}}});
 pkTtd(doc,doc.lastAutoTable.finalY+10,['Guru Pembimbing',I.guru],['Instruktur Dunia Kerja',I.instr]);
}
function pkPdfJurnal(sid){
 if(!pkPdfSiap())return;
 var J=pkJurnalSiswa(sid),I=pkIdentSiswa(sid);
 if(!J.length){toast('Belum ada jurnal untuk dicetak.');return}
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 pkPdfJurnalHal(doc,sid);
 pkPdfFoot(doc);
 doc.save('Jurnal-PKL-'+pkSlug((I.u&&I.u.nama)||'siswa',30)+'.pdf');
}

/* ---------- Tampilan utama ---------- */
var PK_CSS=document.createElement('style');
PK_CSS.textContent='.pk-judul{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}.pk-judul .akd-ctx{flex-wrap:wrap}'+
 '.stats.pk-stats{gap:8px}.stats.pk-stats .card{padding:8px 10px;gap:0;align-content:start}.pk-stats .label,.pk-stats .note{font-size:12px;line-height:1.3;margin:0}.pk-stats b{font-size:18px;line-height:1.35}'+
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
 var sk=typeof schNama==='function'?schNama():'',kd=typeof schKode==='function'?schKode():'',staf=isStaff();
 var d=new Date(),y=d.getMonth()>=6?d.getFullYear():d.getFullYear()-1;
 var tab=pkTabs().filter(function(x){return x[0]===PK.tab})[0]||PK_TABS[0];
 function pil(t,n){return '<span class="pill'+(n?' plain':'')+'">'+esc(t)+'</span>'}
 return '<div class="pk-judul"><div class="sechead akd-head"><span class="ico">'+pkIkon(staf?tab[0]:'saya',18)+'</span><div class="grow"><div class="akd-crumb">Praktik Kerja Lapangan</div><h2>'+(staf?tab[1]:'PKL saya')+'</h2></div></div>'+
  '<div class="row akd-ctx">'+pil('Tahun ajaran '+y+'/'+(y+1)+(PK_SEMESTER[kd]?' · Semester '+pkSemesterTeks(kd):''))+(sk?pil(sk,1):'')+pil('Kelas XII',1)+(actRole()==='kepsek'?pil('Hanya lihat',1):'')+'</div></div>';
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
 var sk=k;PK.fk=k;PK.msg='';PK.lokMsg='';PK.pksPdf=null;
 var rec=id?pkById(k==='jurnalcat'?'jurnal':k,id):null;
 PK.f=rec?Object.assign({},rec):Object.assign({},pkDefault(k));
 PK.mode='form';render();
}
function pkSimpan(){
 var k=PK.fk,f=PK.f||{},F=pkSchema(k),dk=k==='jurnalcat'?'jurnal':k,me=S.user,miss=F.filter(function(x){return x.r&&!String(f[x.k]==null?'':f[x.k]).trim()}).map(function(x){return x.l});
 if(miss.length){PK.msg='Lengkapi: '+miss.join(', ');return render()}
 if(k==='jurnal'&&pkFotoWajib('jurnal')&&!f.foto){PK.msg='Lampirkan foto kegiatan.';return render()}
 if(k==='tempat'&&PK.pksPdf)return pkSuratUnggah().then(function(ok){if(ok)pkSimpan()});
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
 var a=pkById('absen',id)||pkById('jurnal',id),src=a&&pkFotoSrc(a);if(!src){toast('Foto sedang dimuat. Coba lagi sebentar.');return}
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
 else if(a==='pkl-cancel'){PK.pksPdf=null;PK.mode='list';PK.f=null;PK.msg='';render()}
 else if(a==='pkl-save')pkSimpan();
 else if(a==='pkl-del'){
  if(k==='absen'&&actRole()!=='admin'){toast('Hanya admin yang boleh menghapus absen.');return}
  var dk=k;if(typeof uiConfirm==='function')uiConfirm('Hapus data ini?\nData yang dihapus tidak bisa dikembalikan.').then(function(ok){if(ok)pkDel(dk,v).then(render)});else pkDel(dk,v).then(render);
 }
 else if(a==='pkl-uji')pkUjiBuat();
 else if(a==='pkl-absen')pkAbsenBuka();
 else if(a==='pkl-tipe'){PK.f.tipe=v;PK.msg='';render()}
 else if(a==='pkl-gps'){pkGps();render()}
 else if(a==='pkl-lok-gps')pkLokGps();
 else if(a==='pkl-fotoj'){var fj=document.querySelector('[data-pklfotoj]');if(fj)fj.click()}
 else if(a==='pkl-fotoj-hapus'){PK.f.foto='';render()}
 else if(a==='pkl-scan')pkScan();
 else if(a==='pkl-pindai')pkPindaiMandiri();
 else if(a==='pkl-surat-buka')pkSuratBuka(PK.pksPdf||PK.f);
 else if(a==='pkl-surat-lihat')pkSuratBuka(pkById('tempat',v));
 else if(a==='pkl-surat-hapus'){PK.pksPdf=null;PK.f.pksFile='';PK.f.pksHal='';render()}
 else if(a==='pkl-lok-peta')pkPeta();
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
 if(t.dataset.pkl==='lat'&&PK.fk==='tempat'&&PK.f){var tp=pkLokTempel(t.value);if(tp){pkLokIsi(tp[0],tp[1],'Koordinat dari Google Maps terbaca.');return}}
  if(t.dataset.pkl&&PK.f){PK.f[t.dataset.pkl]=t.value;if(PK.fk==='nilai'&&/^tp[1-4]$/.test(t.dataset.pkl)){var el=document.getElementById('pk-na');if(el)el.innerHTML=pkNilaiTeks(PK.f)}}
});
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.getAttribute&&d.getAttribute('data-pkd')==='daftar')PK.tOpen=!!d.open},true);
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||!S.user)return;
 if(t.dataset.pkset!==undefined){var sp={};sp[t.dataset.pkset]=t.value;pkSetSimpan(sp);return}
 if(t.dataset.pksetf!==undefined){var sf={};sf[t.dataset.pksetf]=t.checked?1:0;pkSetSimpan({foto:sf});return}
 if(t.dataset.pkfilter!==undefined&&t.tagName==='SELECT'){
  var pf=String(t.dataset.pkfilter).split(':');(PK.flt[pf[0]]=PK.flt[pf[0]]||{})[pf[1]]=t.value;render();
 }else if(t.dataset.pkl&&PK.f&&t.tagName==='SELECT'){
  PK.f[t.dataset.pkl]=t.value;
  var hk=(PK_HOOK[PK.fk]||{})[t.dataset.pkl];
  if(hk&&hk(PK.f,t.value))render();else pkKetPerbarui(t);
 }else if(t.dataset.pklfoto!==undefined&&t.files&&t.files[0]){
  /* selfie masuk/pulang harus baru dipotret: berkas lama dari galeri ditolak (batas 10 menit); izin/sakit boleh melampirkan surat lama */
  var hdr=PK.f.tipe==='masuk'||PK.f.tipe==='pulang';
  if(hdr&&Math.abs(Date.now()-(t.files[0].lastModified||0))>600000){PK.f.foto='';PK.msg='Foto lama tidak bisa dipakai. Ambil selfie langsung dari kamera.';t.value='';render();return}
  pkCompress(t.files[0],function(u){if(!u){PK.msg='Foto gagal diproses. Coba lagi.';render();return}PK.f.foto=u;PK.f.fotoTgl=pkToday();PK.f.fotoLangsung=hdr;PK.msg='';render()});
 }else if(t.dataset.pklfotoj!==undefined&&t.files&&t.files[0]){
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
