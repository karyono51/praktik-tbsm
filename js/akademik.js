/* akademik.js: Administrasi Akademik (Guru, Kelas, Mata pelajaran, Tata kelola).
   Koleksi Appwrite: akademik (tahun, kelas, mapel, tugas; dibaca guru dan admin) dan akademik_sdm (profil guru: NIP, NUPTK;
   dibaca dan ditulis admin saja). Mode lokal memakai localStorage. Data acuan ada di akademik-data.js. */
var AKC={tahun:'akademik',kelas:'akademik',mapel:'akademik',tugas:'akademik',guru:'akademik_sdm'};
var AKK='tbsm-akd',AKQ='tbsm-akd-queue';
var AKD={D:{tahun:[],kelas:[],mapel:[],tugas:[],guru:[]},loaded:false,loading:false,err:[],seeded:false,form:null,mem:null,tg:null,tgf:{},q:'',fl:'ALL',tf:'ALL',sk:'',rep:null,open:{},busy:false};
ICO.akdGuru='<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>';
ICO.akdKelas='<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/>';
ICO.akdSiswa='<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 5.6"/>';
ICO.akdMapel='<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6"/>';
ICO.akdTata='<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-4"/>';
var AKTABS=['akd-guru','akd-kelas','akd-siswa','akd-mapel','akd-tata'];
var AKNAMA={'akd-guru':'Guru','akd-kelas':'Kelas','akd-siswa':'Daftar siswa','akd-mapel':'Mata pelajaran','akd-tata':'Tata kelola'};
var AKICO={'akd-guru':'akdGuru','akd-kelas':'akdKelas','akd-siswa':'akdSiswa','akd-mapel':'akdMapel','akd-tata':'akdTata'};
var AKTK=['X','XI','XII'];
function akOn(){return AKTABS.indexOf(S.tab)>-1}
function akEdit(){return !!S.user&&can('akademik')&&actRole()==='admin'}
function akId(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function akRetry(e){var c=e&&e.code;return !c||c===401||c===408||c===425||c===429||c>=500}
function akSek(v){v=String(v||'').toUpperCase();return SCH_LIST[v]?v:''}
function akSekLabel(v){return SCH_LIST[akSek(v)]?SCH_LIST[akSek(v)].pendek:'Semua sekolah'}

/* ---------- Penyimpanan ---------- */
function akLoadLocal(){try{var j=JSON.parse(localStorage.getItem(AKK)||'null');if(j)Object.keys(AKD.D).forEach(function(k){AKD.D[k]=j[k]||[]})}catch(e){}}
function akSaveLocal(){try{localStorage.setItem(AKK,JSON.stringify(AKD.D))}catch(e){}}
function akClear(){
 try{localStorage.removeItem(AKK);localStorage.removeItem(AKQ)}catch(e){}
 AKD.D={tahun:[],kelas:[],mapel:[],tugas:[],guru:[]};AKD.loaded=false;AKD.seeded=false;AKD.form=null;AKD.mem=null;AKD.tg=null;AKD.rep=null;
}
var AKX=['id','r','d','bad','err','jenis','sekolah','nama','ts','oleh','payload'];
function akParse(o){if(typeof o.payload==='string'){try{var x=JSON.parse(o.payload||'{}');for(var k in x)o[k]=x[k]}catch(e){}}return o}
function akPack(k,o){
 var p={};Object.keys(o).forEach(function(f){if(AKX.indexOf(f)<0)p[f]=o[f]});
 o.jenis=k;o.payload=JSON.stringify(p);
}
function akQueueGet(){try{return JSON.parse(localStorage.getItem(AKQ)||'[]')}catch(e){return []}}
function akQueueAdd(k,id){var q=akQueueGet();if(q.indexOf(k+':'+id)<0)q.push(k+':'+id);try{localStorage.setItem(AKQ,JSON.stringify(q))}catch(e){}}
async function akRemote(k,o){
 var col=AKC[k],data={jenis:k,sekolah:akSek(o.sekolah),nama:String(o.nama||'').slice(0,200),ts:o.ts||Date.now(),oleh:(S.user&&S.user.id)||'',payload:o.payload};
 try{
  var db=Cloud.db;
  if(!o.r){try{await db.createDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===409)await db.updateDocument(CFG.DB,col,o.id,data);else throw e}}
  else{try{await db.updateDocument(CFG.DB,col,o.id,data)}catch(e){if(e&&e.code===404)await db.createDocument(CFG.DB,col,o.id,data);else throw e}}
  o.r=1;o.d=0;o.bad=0;o.err='';akSaveLocal();return true;
 }catch(e){
  o.err=((e&&e.code)?e.code+' · ':'')+((e&&e.message)||String(e));
  if(navigator.onLine===false||akRetry(e))akQueueAdd(k,o.id);
  else{o.bad=1;toast('Gagal menyimpan ke server: '+((e&&e.message)||e))}
  akSaveLocal();return false;
 }
}
async function akFlushQ(){
 if(!Cloud.on)return;
 var q=akQueueGet(),rest=[];
 for(var i=0;i<q.length;i++){
  var p=q[i].split(':'),k=p[0],id=p.slice(1).join(':'),o=AKD.D[k]&&AKD.D[k].filter(function(x){return x.id===id})[0];
  if(!o||(o.r&&!o.d)||o.bad)continue;
  var ok=await akRemote(k,o);if(!ok&&!o.bad)rest.push(q[i]);
 }
 try{if(rest.length)localStorage.setItem(AKQ,JSON.stringify(rest));else localStorage.removeItem(AKQ)}catch(e){}
}
function akPut(k,o){
 o.ts=Date.now();akPack(k,o);o.d=1;
 var a=AKD.D[k],i=a.findIndex(function(x){return x.id===o.id});if(i<0)a.push(o);else a[i]=o;
 akSaveLocal();
 if(!Cloud.on){o.r=1;o.d=0;akSaveLocal();return Promise.resolve(true)}
 return akRemote(k,o);
}
async function akDel(k,id){
 var a=AKD.D[k],i=a.findIndex(function(x){return x.id===id});if(i<0)return;
 var o=a[i];a.splice(i,1);akSaveLocal();
 if(Cloud.on&&o.r){var ok=await Cloud.remove(AKC[k],id);if(!ok){a.push(o);akSaveLocal()}}
}
async function akLoad(){
 if(AKD.loading||!S.user||!isStaff())return;
 AKD.loading=true;AKD.err=[];
 try{
  if(!AKD.loaded)akLoadLocal();
  if(Cloud.on&&navigator.onLine===false)AKD.err.push('Offline: memakai salinan terakhir di perangkat.');
  else if(Cloud.on){
   await akFlushQ();
   var cols=[['akademik',['tahun','kelas','mapel','tugas']]],okAll=true;
   if(akEdit())cols.push(['akademik_sdm',['guru']]);else AKD.D.guru=[];
   await Promise.all(cols.map(async function(cc){
    try{
     var rows=(await Cloud.list(cc[0])).map(function(d){return akParse(fromDoc(d))});
     cc[1].forEach(function(k){
      var keep=AKD.D[k].filter(function(x){return !x.r||x.d});
      AKD.D[k]=rows.filter(function(x){return x.jenis===k});
      keep.forEach(function(x){var j=AKD.D[k].findIndex(function(y){return y.id===x.id});if(j<0)AKD.D[k].push(x);else AKD.D[k][j]=x});
     });
    }catch(e){okAll=false;AKD.err.push(cc[0]+': '+((e&&e.message)||e))}
   }));
   akSaveLocal();
   if(okAll&&akEdit()&&!AKD.seeded&&!AKD.D.mapel.length){AKD.seeded=true;AKD.loading=false;await akSeed()}
  }else if(akEdit()&&!AKD.seeded&&!AKD.D.mapel.length){AKD.seeded=true;AKD.loading=false;await akSeed()}
 }finally{AKD.loading=false;AKD.loaded=true;akTerap();render()}
}
/* tahun ajaran aktif ikut dipakai pada formulir UKK */
function akTerap(){try{var t=akTahunAktif();if(t&&typeof FORM_UKK!=='undefined')FORM_UKK.tahun=t.nama}catch(e){}}

/* ---------- Data turunan ---------- */
function akOk(o){return schAkunOk(o)}
function akAktif(a){return a.filter(function(x){return x.aktif!==false})}
function akTahunAktif(){return AKD.D.tahun.filter(function(t){return t.aktif})[0]||null}
/* Urutan mengikuti struktur kurikulum SMK: Kelompok Umum (PABP, Pancasila, B. Indonesia, PJOK, Sejarah, Seni, Muatan Lokal),
   Kelompok Kejuruan (Matematika, B. Inggris, Informatika, Projek IPAS, Dasar Program Keahlian, Konsentrasi Keahlian, Kreativitas/Kewirausahaan, PKL), lalu Pilihan.
   Mapel tambahan di luar daftar bawaan menyusul di akhir kelompoknya menurut kode. Elemen CP mengikuti induknya menurut nomor elemen. */
var AK_URUT=['m_pabp','m_pan','m_bind','m_pjok','m_sej','m_seni','m_mulok','m_mtk','m_bing','m_info','m_ipas','m_ddo','m_tsm','m_kik','m_pkl','m_kka'];
var AK_GRUP=[['umum','Kelompok Umum'],['kejuruan','Kelompok Kejuruan'],['dasar','Dasar-Dasar Program Keahlian Teknik Otomotif'],['konsentrasi','Kompetensi Keahlian Teknik Sepeda Motor'],['pilihan','Mata Pelajaran Pilihan']];
/* kelompok tampilan: Dasar Program Keahlian dan Konsentrasi Keahlian berdiri sendiri; selebihnya mengikuti kolom kelompok */
function akGrupKey(m){
 var k=String(m.komponen||''),id=String(m.id||'');
 if(id==='m_ddo'||id.indexOf('m_ddo_')===0||/^Dasar-Dasar Program Keahlian/i.test(k))return 'dasar';
 if(id==='m_tsm'||id.indexOf('m_tsm_')===0||/^Konsentrasi Keahlian/i.test(k))return 'konsentrasi';
 return AK_GRUP.some(function(x){return x[0]===m.kelompok})?m.kelompok:'kejuruan';
}
/* judul LKPD (mis. soal LKPD di bank soal) bukan mata pelajaran */
function akBukanMapel(m){return /^\s*LKPD\b/i.test(String(m&&m.nama||''))}
function akMapelAll(){
 var by={};AKD.D.mapel.forEach(function(m){by[m.id]=m});
 function rank(m){
  var t=(m.induk&&by[m.induk])||m,g=AK_GRUP.map(function(x){return x[0]}).indexOf(akGrupKey(t));if(g<0)g=1;
  var i=AK_URUT.indexOf(t.id);
  return [g,i>-1?i:AK_URUT.length,m===t?0:1,m===t?0:(+m.urut||0)];
 }
 return AKD.D.mapel.filter(function(m){return akOk(m)&&!akBukanMapel(m)}).sort(function(a,b){
  var x=rank(a),y=rank(b);
  for(var i=0;i<4;i++)if(x[i]!==y[i])return x[i]-y[i];
  return String(a.kode||'').localeCompare(String(b.kode||''),'id',{numeric:true})||String(a.nama).localeCompare(String(b.nama),'id');
 });
}
function akKelasAll(){return AKD.D.kelas.filter(akOk).sort(function(a,b){return AKTK.indexOf(a.tingkat)-AKTK.indexOf(b.tingkat)||String(a.nama).localeCompare(String(b.nama),'id',{numeric:true})})}
function akGuruList(){
 var L=S.users.filter(function(u){return hasRole(u,'guru')&&u.aktif!==false&&akOk(u)});
 if(!akEdit())L=L.filter(function(u){return u.id===S.user.id});
 return L.sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
}
/* Profil SDM (NIP, NUPTK) hanya untuk admin: koleksi akademik_sdm tidak dapat dibaca guru */
function akProfil(uid){if(!akEdit())return null;return AKD.D.guru.filter(function(x){return x.akunId===uid})[0]||null}
function akTugasGuru(uid){return AKD.D.tugas.filter(function(t){return t.guruId===uid})}
function akTugasMapel(id){return AKD.D.tugas.filter(function(t){return t.mapelId===id})}
function akTugasKelas(id){return AKD.D.tugas.filter(function(t){return t.kelasId===id})}
/* Tugas berlaku: rombel masih aktif dan tahun ajarannya sama dengan tahun ajaran aktif (semester tidak membedakan) */
function akTahunNama(id){var t=AKD.D.tahun.filter(function(x){return x.id===id})[0];return t?String(t.nama||''):''}
function akBerlaku(t){
 var k=akById('kelas',t.kelasId);if(!k||k.aktif===false)return false;
 var ta=akTahunAktif();if(!ta)return true;
 var n=akTahunNama(t.tahunId||k.tahunId);return !n||n===String(ta.nama||'');
}
function akTugasGuruAktif(uid){return akTugasGuru(uid).filter(akBerlaku)}
function akTugasMapelAktif(id){return akTugasMapel(id).filter(akBerlaku)}
function akJp(uid){return akTugasGuruAktif(uid).reduce(function(s,t){return s+(+t.jp||0)},0)}
function akById(k,id){return AKD.D[k].filter(function(x){return x.id===id})[0]||null}
function akNamaUser(id){var u=S.users.filter(function(x){return x.id===id})[0];return u?u.nama:'(akun tidak ditemukan)'}
function akSiswaAktif(){return S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&akOk(u)})}
function akAnggotaPeta(){var m={};AKD.D.kelas.forEach(function(k){if(k.aktif===false)return;(k.anggota||[]).forEach(function(id){m[id]=k.id})});return m}
function akLeaf(m){return !AKD.D.mapel.some(function(x){return x.induk===m.id&&x.aktif!==false})}
function akMapelNamaMaster(){if(!AKD.loaded&&!AKD.D.mapel.length)akLoadLocal();return akAktif(AKD.D.mapel).filter(function(m){return !akBukanMapel(m)}).map(function(m){return m.nama})}
function akNorm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}

/* ---------- Pemeriksaan tata kelola ---------- */
function akCek(){
 var out=[],kl=akAktif(akKelasAll()),mp=akAktif(akMapelAll()),guru=S.users.filter(function(u){return hasRole(u,'guru')&&u.aktif!==false&&akOk(u)}),
  pet=akAnggotaPeta(),sw=akSiswaAktif();
 var add=function(t,n,list,tab,tone){out.push({t:t,n:n,list:(list||[]).slice(0,6),tab:tab,tone:n?(tone||'warn'):'ok'})};
 add('Tahun ajaran aktif belum diatur',akTahunAktif()?0:1,[],'akd-tata','bad');
 add('Rombel tanpa wali kelas',kl.filter(function(k){return !k.waliId}).length,kl.filter(function(k){return !k.waliId}).map(function(k){return k.nama}),'akd-kelas');
 var tanpa=sw.filter(function(u){return !pet[u.id]});
 add('Siswa aktif belum masuk rombel',tanpa.length,tanpa.map(function(u){return u.nama}),'akd-kelas');
 var ls=mp.filter(function(m){return akLeaf(m)&&!akTugasMapelAktif(m.id).length&&(m.kelompok!=='pilihan')});
 add('Mata pelajaran belum punya guru pengampu',ls.length,ls.map(function(m){return m.nama}),'akd-mapel');
 var gt=guru.filter(function(u){return !akTugasGuruAktif(u.id).length});
 add('Guru belum punya tugas mengajar',gt.length,gt.map(function(u){return u.nama}),'akd-guru');
 var gs=S.users.filter(function(u){return (hasRole(u,'guru')||hasRole(u,'admin'))&&u.aktif!==false&&!SCH_LIST[String(u.sekolah||'').toUpperCase()]&&String(u.sekolah||'').toUpperCase()!=='ALL'});
 add('Akun guru/admin tanpa sekolah',gs.length,gs.map(function(u){return u.nama}),'akd-guru');
 var ss=S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&!SCH_LIST[String(u.sekolah||'').toUpperCase()]});
 add('Akun siswa tanpa sekolah',ss.length,ss.map(function(u){return u.nama}),'akd-kelas');
 var yatim=mp.filter(function(m){return m.induk&&!akById('mapel',m.induk)});
 add('Elemen mata pelajaran tanpa induk',yatim.length,yatim.map(function(m){return m.nama}),'akd-mapel');
 var kosong=kl.filter(function(k){return !(k.anggota||[]).length});
 add('Rombel belum punya anggota',kosong.length,kosong.map(function(k){return k.nama}),'akd-kelas');
 /* konsistensi anggota rombel dengan akun */
 var um={};S.users.forEach(function(u){um[u.id]=u});
 var cnt={},ganda=[],hilang=[],beda=[];
 kl.forEach(function(k){(k.anggota||[]).forEach(function(id){
  (cnt[id]=cnt[id]||[]).push(k.nama);
  var u=um[id];
  if(!u||!hasRole(u,'siswa')||u.aktif===false)hilang.push((u?u.nama:'(akun tidak ditemukan)')+' ('+k.nama+')');
  else if(u.kelas&&u.kelas!==k.tingkat)beda.push(u.nama+': akun kelas '+u.kelas+', rombel '+k.nama);
 })});
 Object.keys(cnt).forEach(function(id){if(cnt[id].length>1)ganda.push((um[id]?um[id].nama:'(akun tidak ditemukan)')+' ('+cnt[id].join(' dan ')+')')});
 add('Siswa masuk lebih dari satu rombel',ganda.length,ganda,'akd-kelas','bad');
 add('Tingkat rombel berbeda dengan kelas pada akun',beda.length,beda,'akd-kelas');
 add('Anggota rombel yang akunnya nonaktif atau hilang',hilang.length,hilang,'akd-kelas');
 return out;
}

/* ---------- Bawaan kurikulum dan sinkronisasi ---------- */
function akSeedList(){
 var L=[];
 AKD_MAPEL_UMUM.forEach(function(m,i){L.push(Object.assign({urut:i,fase:'',tingkat:m.tingkat||[],jp:'',sumber:'Struktur kurikulum SMK/MAK (Permendikdasmen 13/2025); CP Kepka BSKAP 046/H/KR/2025',skkni:[],kata:[]},m))});
 [[AKD_DDO,AKD_DDO_ELEMEN,'DP-01'],[AKD_TSM,AKD_TSM_ELEMEN,'KK-01']].forEach(function(p){
  L.push(Object.assign({jp:'',skkni:[],kata:[],urut:0},p[0]));
  p[1].forEach(function(e,i){
   L.push({id:p[0].id+'_'+(i+1),kode:p[2]+'.'+(i+1),nama:e.n,kelompok:'kejuruan',komponen:p[0].komponen,induk:p[0].id,fase:p[0].fase,tingkat:p[0].tingkat,jp:'',
    sumber:'Elemen CP '+p[0].nama+' (Kepka BSKAP 046/H/KR/2025)'+(e.skkni&&e.skkni.length?'; SKKNI Kepmenaker 147/2019':''),skkni:e.skkni||[],kata:e.kata||[],catatan:e.catatan||'',urut:i+1});
  });
 });
 return L;
}
async function akSeed(){
 if(!akEdit())return 0;
 var made=0,L=akSeedList().filter(function(o){return !akById('mapel',o.id)});
 for(var i=0;i<L.length;i+=6){
  await Promise.all(L.slice(i,i+6).map(function(o){o.aktif=true;o.bawaan=1;o.sekolah='';made++;return akPut('mapel',o)}));
 }
 if(!AKD.D.tahun.length){await akPut('tahun',{id:'t_'+AKD_REF.ta.replace(/\D/g,'')+'_ganjil',nama:AKD_REF.ta,semester:'Ganjil',aktif:true,sekolah:'',mulai:'',selesai:''});made++}
 akTerap();return made;
}
async function akSinkron(){
 if(!akEdit()||AKD.busy)return;
 AKD.busy=true;render();
 var rep={mapel:0,bank:0,rombel:0,anggota:0,tanpaSekolah:0,ts:Date.now()};
 try{
  if(!AKD.loaded)await akLoad();
  rep.mapel=await akSeed();
  /* nama mata pelajaran dari bank soal yang belum ada di master */
  try{if(window.bsLoad&&window.BS&&!BS.loaded&&!BS.loading)await bsLoad()}catch(e){}
  var nm={};AKD.D.mapel.forEach(function(m){nm[akNorm(m.nama)]=1});
  var baru={};((window.BS&&BS.D&&BS.D.soal)||[]).forEach(function(q){if(q.mapel&&!akBukanMapel({nama:q.mapel})&&!nm[akNorm(q.mapel)])baru[akNorm(q.mapel)]=String(q.mapel).trim()});
  var kodeN=AKD.D.mapel.reduce(function(mx,m){var r=/^TB-(\d+)$/.exec(m.kode||'');return r?Math.max(mx,+r[1]):mx},0);
  var nb=Object.keys(baru);
  for(var i=0;i<nb.length;i++){kodeN++;await akPut('mapel',{id:akId('m'),kode:'TB-'+(kodeN<10?'0'+kodeN:kodeN),nama:baru[nb[i]],kelompok:'kejuruan',komponen:'Tambahan (dari bank soal)',induk:'',fase:'',tingkat:[],jp:'',sumber:'Dari bank soal; tinjau dan petakan ke kurikulum',skkni:[],kata:[],aktif:true,sekolah:''});rep.bank++}
  /* rombel awal dari akun siswa: satu rombel per sekolah dan tingkat bila belum ada */
  var ta=akTahunAktif(),pet=akAnggotaPeta();
  for(var s=0;s<SCH_URUT.length;s++){
   for(var t=0;t<AKTK.length;t++){
    var sk=SCH_URUT[s],tk=AKTK[t];
    var sw=S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&String(u.sekolah||'').toUpperCase()===sk&&u.kelas===tk});
    if(!sw.length)continue;
    var ada=AKD.D.kelas.filter(function(k){return k.aktif!==false&&k.sekolah===sk&&k.tingkat===tk})[0];
    var belum=sw.filter(function(u){return !pet[u.id]}).map(function(u){return u.id});
    if(!ada){await akPut('kelas',{id:akId('k'),nama:tk+' TBSM',tingkat:tk,sekolah:sk,tahunId:ta?ta.id:'',waliId:'',anggota:belum,catatan:'Dibuat dari akun siswa',aktif:true});rep.rombel++;rep.anggota+=belum.length}
    else if(belum.length&&AKD.D.kelas.filter(function(k){return k.aktif!==false&&k.sekolah===sk&&k.tingkat===tk}).length===1){ada.anggota=(ada.anggota||[]).concat(belum);await akPut('kelas',ada);rep.anggota+=belum.length}
   }
  }
  rep.tanpaSekolah=S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&!SCH_LIST[String(u.sekolah||'').toUpperCase()]}).length;
  AKD.rep=rep;toast('Sinkronisasi selesai');
 }catch(e){toast('Sinkronisasi gagal: '+((e&&e.message)||e))}
 finally{AKD.busy=false;render()}
}

/* ---------- Tampilan ---------- */
function akNav(){
 return '<div class="chips" role="tablist">'+AKTABS.map(function(t){return '<button type="button" data-act="menu" data-v="'+t+'" aria-pressed="'+(S.tab===t)+'">'+AKNAMA[t]+'</button>'}).join('')+'</div>';
}
function akHead(){
 var ta=akTahunAktif(),c=schCfg();
 return '<div class="sechead"><span class="ico">'+svg(ICO[AKICO[S.tab]],18)+'</span><h2>'+AKNAMA[S.tab]+'</h2></div>'+
  '<p class="note">'+(ta?'Tahun ajaran '+esc(ta.nama)+' · '+esc(ta.semester):'Tahun ajaran belum diatur')+(c?' · '+esc(c.nama):'')+(akEdit()?'':' · hanya lihat')+'</p>'+akNav()+
  (AKD.err.length?'<div class="err">'+AKD.err.map(esc).join('<br>')+(AKD.err.some(function(e){return /collection|not found|could not be found/i.test(e)})?'<br>Koleksi belum dibuat di Appwrite. Jalankan: node tools/setup-appwrite.mjs --only=akademik,akademik_sdm':'')+'</div>':'');
}
function akPill(t,tone){return '<span class="pill'+(tone?' '+tone:'')+'">'+esc(t)+'</span>'}
function akSel(name,opts,val,attr){return '<select data-akf="'+name+'"'+(attr||'')+'>'+opts.map(function(o){var v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;return '<option value="'+esc(v)+'"'+(String(val||'')===String(v)?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select>'}
function akFld(l,inner,cls){return '<label class="f'+(cls?' '+cls:'')+'">'+l+inner+'</label>'}
function akInp(name,val,ph,type){return '<input data-akf="'+name+'" type="'+(type||'text')+'" value="'+esc(val==null?'':val)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'>'}
function akBtn(act,id,label,cls,k){return '<button type="button" class="btn small'+(cls?' '+cls:'')+'" data-akd="'+act+'"'+(id!=null?' data-id="'+esc(id)+'"':'')+(k?' data-k="'+k+'"':'')+'>'+label+'</button>'}

function viewAkd(){
 if(!AKD.loaded&&!AKD.loading)setTimeout(akLoad,0);
 var h=akHead();
 if(!AKD.loaded)return h+'<p class="muted center" style="padding:32px 0">Memuat data akademik…</p>';
 if(S.tab==='akd-guru')return h+viewAkdGuru();
 if(S.tab==='akd-kelas')return h+viewAkdKelas();
 if(S.tab==='akd-siswa')return h+viewAkdSiswa();
 if(S.tab==='akd-mapel')return h+viewAkdMapel();
 return h+viewAkdTata();
}
function akFormTop(){return AKD.form?akFormHtml():''}

/* --- Guru --- */
function viewAkdGuru(){
 var L=akGuruList(),h='',ed=akEdit();
 var jp=L.reduce(function(s,u){return s+akJp(u.id)},0),dg=L.filter(function(u){return akTugasGuruAktif(u.id).length}).length;
 h+='<div class="stats"><div class="card"><span class="label">Guru</span><b class="mono">'+L.length+'</b></div><div class="card"><span class="label">Sudah bertugas</span><b class="mono">'+dg+'</b></div><div class="card"><span class="label">Total JP/minggu</span><b class="mono">'+jp+'</b></div></div>';
 h+=akFormTop();
 if(AKD.tg)h+=akTugasHtml(AKD.tg);
 if(!AKD.form&&!AKD.tg){
  h+='<div class="card"><label class="f">Cari guru<input type="search" data-akd="q" value="'+esc(AKD.q)+'" placeholder="Nama atau email"></label></div>';
  h+='<div id="akd-list">'+akGuruCards()+'</div>';
 }
 return h;
}
function akGuruCards(){
 var q=akNorm(AKD.q),L=akGuruList().filter(function(u){return !q||akNorm(u.nama+' '+(u.email||'')).indexOf(q)>-1}),ed=akEdit();
 if(!L.length)return '<p class="muted center">Belum ada guru'+(AKD.q?' yang cocok':'')+'. Tambah akun berperan Guru di menu Akun.</p>';
 return L.map(function(u){
  var p=akProfil(u.id),tg=akTugasGuruAktif(u.id),mp={};tg.forEach(function(t){var m=akById('mapel',t.mapelId);if(m)mp[m.nama]=1});
  var mk=Object.keys(mp),wali=AKD.D.kelas.filter(function(k){return k.waliId===u.id&&k.aktif!==false});
  return '<div class="card"><div class="row sb"><b>'+esc(u.nama)+'</b>'+akPill(SCH_LIST[String(u.sekolah||'').toUpperCase()]?SCH_LIST[u.sekolah].pendek:(u.sekolah==='ALL'?'Semua sekolah':'Sekolah belum diatur'),SCH_LIST[String(u.sekolah||'').toUpperCase()]||u.sekolah==='ALL'?'':'warn')+'</div>'+
   '<div class="note">'+esc(u.email||u.username||'')+(p&&p.nip?' · NIP '+esc(p.nip):'')+(p&&p.nuptk?' · NUPTK '+esc(p.nuptk):'')+'</div>'+
   '<div class="row">'+akPill(akJp(u.id)+' JP/minggu')+wali.map(function(k){return akPill('Wali '+k.nama,'ok')}).join('')+(p&&p.tugasTambahan?akPill(p.tugasTambahan):'')+'</div>'+
   (mk.length?'<div class="note">'+esc(mk.slice(0,4).join(', '))+(mk.length>4?' dan '+(mk.length-4)+' lainnya':'')+'</div>':'<div class="note">Belum ada tugas mengajar.</div>')+
   '<div class="row">'+akBtn('tugas',u.id,'Tugas mengajar')+(ed?akBtn('profil',u.id,'Ubah profil'):'')+'</div></div>';
 }).join('');
}
function akTugasHtml(uid){
 var u=S.users.filter(function(x){return x.id===uid})[0];if(!u)return '';
 var ed=akEdit(),tg=akTugasGuru(uid),f=AKD.tgf;
 var mp=akAktif(akMapelAll()).filter(akLeaf),kl=akAktif(akKelasAll());
 var h='<div class="card"><div class="row sb"><b>Tugas mengajar · '+esc(u.nama)+'</b>'+akBtn('tg-tutup',null,'Tutup')+'</div>';
 h+=tg.length?tg.map(function(t){var m=akById('mapel',t.mapelId),k=akById('kelas',t.kelasId);
  return '<div class="row sb"><span><b>'+esc(m?m.nama:'(mapel dihapus)')+'</b><br><small class="note">'+esc(k?k.nama:'(rombel dihapus)')+' · '+(+t.jp||0)+' JP/minggu'+(akBerlaku(t)?'':' · tidak berlaku (rombel diarsipkan atau tahun lain)')+'</small></span>'+(ed?akBtn('tg-del',t.id,'Hapus','danger'):'')+'</div>'}).join(''):'<p class="muted">Belum ada tugas.</p>';
 if(ed){
  h+='<div class="two">'+
   '<label class="f">Mata pelajaran<select data-aktg="mapelId"><option value="">Pilih…</option>'+mp.map(function(m){return '<option value="'+esc(m.id)+'"'+(f.mapelId===m.id?' selected':'')+'>'+esc(m.nama)+'</option>'}).join('')+'</select></label>'+
   '<label class="f">Rombel<select data-aktg="kelasId"><option value="">Pilih…</option>'+kl.map(function(k){return '<option value="'+esc(k.id)+'"'+(f.kelasId===k.id?' selected':'')+'>'+esc(k.nama)+' ('+akSekLabel(k.sekolah)+')</option>'}).join('')+'</select></label></div>'+
   '<label class="f">JP per minggu<input data-aktg="jp" type="number" inputmode="numeric" min="0" max="40" value="'+esc(f.jp==null?'':f.jp)+'"></label>'+
   '<div class="row">'+akBtn('tg-add',null,'Tambah tugas','primary')+'</div>';
 }
 return h+'</div>';
}

/* --- Kelas --- */
function viewAkdKelas(){
 var ed=akEdit(),h='',kl=akAktif(akKelasAll()),sw=akSiswaAktif(),pet=akAnggotaPeta();
 var tanpa=sw.filter(function(u){return !pet[u.id]}).length;
 h+='<div class="stats"><div class="card"><span class="label">Rombel</span><b class="mono">'+kl.length+'</b></div><div class="card"><span class="label">Siswa aktif</span><b class="mono">'+sw.length+'</b></div><div class="card"><span class="label">Belum ber-rombel</span><b class="mono">'+tanpa+'</b></div></div>';
 if(AKD.mem)return h+akAnggotaHtml(AKD.mem);
 if(AKD.form)return h+akFormHtml();
 if(ed)h+='<div class="row">'+akBtn('kelas-baru',null,'Tambah rombel','primary')+akBtn('sinkron',null,AKD.busy?'Menyinkronkan…':'Sinkron dari akun')+'</div>';
 h+='<div class="chips">'+['ALL'].concat(AKTK).map(function(c){return '<button type="button" data-akd="tf" data-id="'+c+'" aria-pressed="'+(AKD.tf===c)+'">'+(c==='ALL'?'Semua':'Kelas '+c)+'</button>'}).join('')+'</div>';
 var L=akKelasAll().filter(function(k){return AKD.tf==='ALL'||k.tingkat===AKD.tf});
 if(!L.length)return h+'<p class="muted center">Belum ada rombel. '+(ed?'Ketuk Sinkronkan dari akun untuk membuat rombel awal dari data siswa.':'')+'</p>';
 return h+L.map(function(k){
  var tg=akTugasKelas(k.id),ta=akById('tahun',k.tahunId);
  return '<div class="card"'+(k.aktif===false?' style="opacity:.6"':'')+'><div class="row sb"><b>'+esc(k.nama)+'</b>'+akPill('Kelas '+k.tingkat)+'</div>'+
   '<div class="row">'+akPill(akSekLabel(k.sekolah))+akPill(akSiswaRombel(k).length+' siswa')+(ta?akPill(ta.nama):'')+(k.aktif===false?akPill('Arsip','warn'):'')+'</div>'+
   '<div class="note">Wali kelas: '+(k.waliId?esc(akNamaUser(k.waliId)):'belum ditetapkan')+'</div>'+
   (tg.length?'<div class="note">'+tg.slice(0,5).map(function(t){var m=akById('mapel',t.mapelId);return esc((m?m.nama:'?')+' ('+akNamaUser(t.guruId)+')')}).join('; ')+(tg.length>5?' dan '+(tg.length-5)+' lainnya':'')+'</div>':'')+
   '<div class="row">'+akBtn('daftar',k.id,'Daftar siswa','primary')+akBtn('anggota',k.id,ed?'Atur anggota':'Lihat anggota')+(ed?akBtn('edit',k.id,'Ubah rombel',null,'kelas')+akBtn('arsip',k.id,k.aktif===false?'Aktifkan':'Arsipkan',null,'kelas'):'')+'</div></div>';
 }).join('');
}

/* --- Daftar siswa per kelas --- */
/* NIS dari username: 26271032 menjadi 2627.1032 (8 angka dipisah titik di tengah); bukan angka tampil apa adanya, kosong bila tidak ada */
function akNis(u){
 var n=String((u&&(u.username||String(u.email||'').split('@')[0]))||'').trim();
 if(/^\d{8}$/.test(n))return n.slice(0,4)+'.'+n.slice(4);
 return /^[\d.]+$/.test(n)?n:'';
}
function akNisHtml(u){var n=akNis(u);return '<span class="ak-nis'+(n?'':' kosong')+'">'+(n?esc(n):'NIS belum ada')+'</span>'}
/* urut menurut NIS (naik); yang belum punya NIS di bawah, diurut nama */
function akUrutNis(a,b){
 var x=akNis(a).replace(/\D/g,''),y=akNis(b).replace(/\D/g,'');
 if(x&&!y)return -1;if(!x&&y)return 1;
 if(x!==y)return x.length-y.length||(x<y?-1:1);
 return String(a.nama).localeCompare(String(b.nama),'id');
}
function akSiswaRombel(k){
 var peta={};S.users.forEach(function(u){peta[u.id]=u});
 return (k.anggota||[]).map(function(id){return peta[id]}).filter(function(u){return u&&hasRole(u,'siswa')&&u.aktif!==false})
  .sort(akUrutNis);
}
function viewAkdSiswa(){
 var h='',kl=akAktif(akKelasAll()),pet=akAnggotaPeta();
 var sw=akSiswaAktif(),tanpa=sw.filter(function(u){return !pet[u.id]}).sort(akUrutNis);
 var one=AKD.sk?akById('kelas',AKD.sk):null;if(AKD.sk&&!one)AKD.sk='';
 h+='<div class="chips">'+['ALL'].concat(AKTK).map(function(c){return '<button type="button" data-akd="sf" data-id="'+c+'" aria-pressed="'+(!one&&AKD.tf===c)+'">'+(c==='ALL'?'Semua kelas':'Kelas '+c)+'</button>'}).join('')+'</div>';
 var L=one?[one]:kl.filter(function(k){return AKD.tf==='ALL'||k.tingkat===AKD.tf});
 L=L.slice().sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id',{numeric:true})});
 if(one)h+='<p class="note">Menampilkan satu rombel. Ketuk Semua kelas untuk melihat seluruhnya.</p>';
 if(!L.length)h+='<p class="muted center">Belum ada rombel'+(AKD.tf!=='ALL'?' untuk Kelas '+AKD.tf:'')+'.</p>';
 h+=L.map(function(k){
  var d=akSiswaRombel(k);
  return '<div class="card"><div class="row sb"><b>'+esc(k.nama)+'</b>'+akPill(d.length+' siswa','ok')+'</div>'+
   '<div class="note">'+esc(akSekLabel(k.sekolah))+' · Wali kelas: '+(k.waliId?esc(akNamaUser(k.waliId)):'belum ditetapkan')+'</div>'+
   (d.length?'<div class="ak-nh"><span>No</span><span>NIS</span><span>Nama</span></div><ol class="ak-nm">'+d.map(function(u){return '<li>'+akNisHtml(u)+'<span class="ak-n" title="'+esc(u.nama)+'">'+esc(u.nama)+'</span></li>'}).join('')+'</ol>':'<p class="muted">Belum ada siswa di rombel ini.</p>')+
   '<div class="row">'+akBtn('anggota',k.id,akEdit()?'Atur anggota':'Lihat anggota')+'</div></div>';
 }).join('');
 if(!one&&tanpa.length)h+='<div class="card"><div class="row sb"><b>Belum punya rombel</b>'+akPill(tanpa.length+' siswa','warn')+'</div><ol class="ak-nm">'+tanpa.map(function(u){return '<li>'+akNisHtml(u)+'<span class="ak-n">'+esc(u.nama)+(u.kelas?' <small class="note">(Kelas '+esc(u.kelas)+')</small>':'')+'</span></li>'}).join('')+'</ol></div>';
 return h;
}
function akAnggotaHtml(id){
 var k=akById('kelas',id);if(!k)return '';
 var ed=akEdit(),pet=akAnggotaPeta(),cur=AKD.memSel||(k.anggota||[]);
 var sw=S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&u.kelas===k.tingkat&&(!k.sekolah||!SCH_LIST[String(u.sekolah||'').toUpperCase()]||String(u.sekolah).toUpperCase()===k.sekolah)}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
 var h='<div class="card"><div class="row sb"><b>'+(ed?'Atur anggota':'Anggota')+' · '+esc(k.nama)+'</b>'+akBtn('ang-tutup',null,'Tutup')+'</div><p class="note">Siswa kelas '+esc(k.tingkat)+' '+(k.sekolah?'di '+esc(akSekLabel(k.sekolah)):'')+'. Siswa yang sudah masuk rombel lain tidak bisa dipilih.</p>';
 if(ed)h+='<div class="row">'+akBtn('ang-semua',null,'Pilih semua yang belum punya rombel')+'</div>';
 h+=sw.length?sw.map(function(u){var lain=pet[u.id]&&pet[u.id]!==k.id,on=cur.indexOf(u.id)>-1;
  return '<label class="ak-ang'+(lain?' lain':'')+'"><input type="checkbox" data-akm="'+esc(u.id)+'"'+(on?' checked':'')+((lain||!ed)?' disabled':'')+'><span>'+esc(u.nama)+(lain?' <small class="note">('+esc((akById('kelas',pet[u.id])||{}).nama||'rombel lain')+')</small>':'')+'</span></label>'}).join(''):'<p class="muted">Tidak ada siswa yang sesuai.</p>';
 if(ed)h+='<div class="row">'+akBtn('ang-simpan',id,'Simpan anggota','primary')+'</div>';
 return h+'</div>';
}

/* --- Mata pelajaran --- */
function viewAkdMapel(){
 var ed=akEdit(),h='';
 if(AKD.form)return akFormHtml();
 var all=akMapelAll(),aktif=akAktif(all);
 h+='<div class="stats"><div class="card"><span class="label">Mata pelajaran</span><b class="mono">'+aktif.filter(function(m){return !m.induk}).length+'</b></div><div class="card"><span class="label">Elemen CP</span><b class="mono">'+aktif.filter(function(m){return m.induk}).length+'</b></div><div class="card"><span class="label">Tanpa pengampu</span><b class="mono">'+aktif.filter(function(m){return akLeaf(m)&&m.kelompok!=='pilihan'&&!akTugasMapel(m.id).length}).length+'</b></div></div>';
 if(ed)h+='<div class="row">'+akBtn('mapel-baru',null,'Tambah mapel','primary')+akBtn('sinkron',null,AKD.busy?'Menyinkronkan…':'Sinkronkan kurikulum')+'</div>';
 h+='<div class="chips">'+[['ALL','Semua'],['umum','Umum'],['kejuruan','Kejuruan'],['dasar','Dasar Program'],['konsentrasi','Kompetensi Keahlian'],['pilihan','Pilihan']].map(function(c){return '<button type="button" data-akd="fl" data-id="'+c[0]+'" aria-pressed="'+(AKD.fl===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>';
 h+='<div class="card"><label class="f">Cari<input type="search" data-akd="q" value="'+esc(AKD.q)+'" placeholder="Nama, kode, atau kata kunci"></label></div>';
 h+='<div id="akd-list">'+akMapelCards()+'</div>';
 return h;
}
/* Elemen CP dilampirkan di bawah kartu mapel induk, dilipat seperti Sumber acuan */
function akElemenLampir(kids,buka){
 if(!kids||!kids.length)return '';
 var ed=akEdit();
 return '<details class=\"ak-elw\"'+(buka?' open':'')+'><summary class=\"note\">'+kids.length+' elemen CP</summary>'+kids.map(function(c){
  var mod=akModulTerkait(c),tg=akTugasMapel(c.id).length;
  return '<div class=\"ak-el\"'+(c.aktif===false?' style=\"opacity:.6\"':'')+'><div class=\"row sb\"><b>'+esc(c.nama)+'</b>'+(c.kode?'<span class=\"mono note\">'+esc(c.kode)+'</span>':'')+'</div>'+
   ((mod||tg||c.aktif===false)?'<div class=\"row\">'+(mod?akPill(mod+' LKPD'):'')+(tg?akPill(tg+' pengampu'):'')+(c.aktif===false?akPill('Arsip','warn'):'')+'</div>':'')+
   (c.catatan?'<div class=\"note\">'+esc(c.catatan)+'</div>':'')+
   (typeof lkElDetail==='function'?lkElDetail(c.id):'')+
   (c.sumber?'<details><summary class=\"note\">Sumber acuan</summary><div class=\"note\">'+esc(c.sumber)+'</div></details>':'')+
   (ed?'<div class=\"row\">'+akBtn('edit',c.id,'Ubah',null,'mapel')+akBtn('arsip',c.id,c.aktif===false?'Aktifkan':'Arsipkan',null,'mapel')+'</div>':'')+'</div>';
 }).join('')+'</details>';
}
function akMapelCard(m,child,kids,buka){
 var ed=akEdit(),tg=akTugasMapel(m.id),sk=(m.skkni||[]).filter(function(c){return AKD_SKKNI[c]}),mod=akModulTerkait(m);
 var pg={};tg.forEach(function(t){pg[akNamaUser(t.guruId)]=1});var pn=Object.keys(pg);
 return '<div class="card"'+(m.aktif===false?' style="opacity:.6"':'')+(child?' style="margin-left:14px;'+(m.aktif===false?'opacity:.6':'')+'"':'')+'><div class="row sb"><b>'+esc(m.nama)+'</b><span class="mono note">'+esc(m.kode||'')+'</span></div>'+
  '<div class="row">'+akPill(m.kelompok==='umum'?'Umum':m.kelompok==='pilihan'?'Pilihan':'Kejuruan')+(m.komponen&&!child?akPill(m.komponen):'')+(m.fase?akPill('Fase '+m.fase):'')+((m.tingkat||[]).length?akPill('Kelas '+m.tingkat.join(', ')):akPill('Semua kelas'))+(m.jp?akPill(m.jp+' JP/minggu'):'')+(m.induk?akPill('Elemen CP','ok'):'')+(m.sekolah?akPill(akSekLabel(m.sekolah)):'')+(m.aktif===false?akPill('Arsip','warn'):'')+'</div>'+
  '<div class="note">Pengampu: '+(pn.length?esc(pn.slice(0,3).join(', '))+(pn.length>3?' dan '+(pn.length-3)+' lainnya':''):'belum ada')+(mod?' · '+mod+' LKPD terkait':'')+'</div>'+
  (m.induk&&typeof lkElDetail==='function'?lkElDetail(m.id):'')+
  (m.catatan?'<div class="note">'+esc(m.catatan)+'</div>':'')+
  (sk.length?'<details><summary class="note">'+sk.length+' unit SKKNI (Kepmenaker 147/2019)</summary>'+sk.map(function(c){return '<div class="note"><span class="mono">'+akSkkniKode(c)+'</span> '+esc(AKD_SKKNI[c])+'</div>'}).join('')+'</details>':'')+
  (m.sumber?'<details><summary class="note">Sumber acuan</summary><div class="note">'+esc(m.sumber)+'</div></details>':'')+
  akElemenLampir(kids,buka)+
  (ed?'<div class="row">'+akBtn('edit',m.id,'Ubah',null,'mapel')+akBtn('arsip',m.id,m.aktif===false?'Aktifkan':'Arsipkan',null,'mapel')+'</div>':'')+'</div>';
}
function akModulTerkait(m){
 try{
  if(m.induk&&typeof lkElModulOf==='function'){var n0=lkElModulOf(m.id).length;if(n0)return n0}
  var ks=(m.kata||[]).map(akNorm).filter(Boolean);if(!ks.length||typeof LKPD_MODULES==='undefined')return 0;
  var tk=m.tingkat||[];
  return LKPD_MODULES.filter(function(x){if(tk.length&&tk.indexOf(x.kelas)<0)return false;var t=akNorm((x.title||'')+' '+(x.unit||''));return ks.some(function(k){return t.indexOf(k)>-1})}).length;
 }catch(e){return 0}
}
function akMapelCards(){
 var q=akNorm(AKD.q),all=akMapelAll().filter(function(m){return (AKD.fl==='ALL'||akGrupKey(m)===AKD.fl)&&(!q||akNorm(m.nama+' '+(m.kode||'')+' '+(m.kata||[]).join(' ')).indexOf(q)>-1)});
 if(!all.length)return '<p class="muted center">Belum ada mata pelajaran'+(AKD.q?' yang cocok':'')+'.</p>';
 var ids={};all.forEach(function(m){ids[m.id]=1});
 var tops=all.filter(function(m){return !m.induk||!ids[m.induk]}),out='',gr={},cari=!!q;
 AKD.gopen=AKD.gopen||{};
 tops.forEach(function(m){var g=akGrupKey(m);(gr[g]=gr[g]||[]).push(m)});
 AK_GRUP.forEach(function(g){
  var L=gr[g[0]];if(!L)return;
  var n=L.length,nc=0,body='',buka=cari||AKD.gopen[g[0]]!==false;
  L.forEach(function(m){
   var kids=all.filter(function(c){return c.induk===m.id});nc+=kids.length;
   body+=akMapelCard(m,false,kids,cari);
  });
  out+='<button type="button" class="akd-grp" data-akd="grp" data-id="'+g[0]+'" aria-expanded="'+buka+'"><span><b>'+g[1]+'</b><small class="note"> · '+n+' mapel'+(nc?', '+nc+' elemen CP':'')+'</small></span><span class="akd-chev" aria-hidden="true">'+(buka?'▾':'▸')+'</span></button>'+(buka?body:'');
 });
 return out;
}

/* --- Tata kelola --- */
function viewAkdTata(){
 var ed=akEdit(),h='';
 if(AKD.form)return akFormHtml();
 /* tahun ajaran */
 h+='<div class="card"><div class="row sb"><b>Tahun ajaran dan semester</b>'+(ed?akBtn('ta-baru',null,'Tambah','primary'):'')+'</div>';
 h+=AKD.D.tahun.length?AKD.D.tahun.slice().sort(function(a,b){return String(b.nama).localeCompare(String(a.nama))||((a.semester==='Genap'?0:1)-(b.semester==='Genap'?0:1))}).map(function(t){
  return '<div class="row sb"><span><b>'+esc(t.nama)+'</b> · '+esc(t.semester)+(t.aktif?' '+akPill('Aktif','ok'):'')+'</span>'+(ed?'<span class="row">'+(t.aktif?'':akBtn('ta-aktif',t.id,'Jadikan aktif'))+akBtn('edit',t.id,'Ubah',null,'tahun')+'</span>':'')+'</div>'}).join(''):'<p class="muted">Belum ada tahun ajaran.</p>';
 h+='</div>';
 /* pemeriksaan */
 var cek=akCek(),bad=cek.filter(function(c){return c.n}).length;
 h+='<div class="card"><div class="row sb"><b>Pemeriksaan kelengkapan</b>'+akPill(bad?bad+' perlu tindakan':'Semua lengkap',bad?'warn':'ok')+'</div>';
 h+=cek.map(function(c){return '<div class="row sb" style="padding:5px 0"><span>'+esc(c.t)+(c.n&&c.list.length?'<br><small class="note">'+esc(c.list.join(', '))+(c.n>c.list.length?' dan '+(c.n-c.list.length)+' lainnya':'')+'</small>':'')+'</span>'+(c.n?'<button type="button" class="pill '+c.tone+'" data-act="menu" data-v="'+c.tab+'">'+c.n+'</button>':akPill('OK','ok'))+'</div>'}).join('');
 h+='</div>';
 if(ed){
  h+='<div class="card"><b>Sinkronisasi dan ekspor</b><p class="note">Memuat mata pelajaran kurikulum bawaan, mengimpor nama mapel dari bank soal, dan membuat rombel awal dari akun siswa. Aman diulang: data yang sudah ada tidak ditimpa.</p><div class="row">'+akBtn('sinkron',null,AKD.busy?'Menyinkronkan…':'Sinkronkan sekarang','primary')+akBtn('ekspor',null,'Ekspor Excel')+'</div>';
  if(AKD.rep)h+='<p class="note">Terakhir: '+AKD.rep.mapel+' mapel/tahun ajaran baru, '+AKD.rep.bank+' mapel dari bank soal, '+AKD.rep.rombel+' rombel baru, '+AKD.rep.anggota+' siswa dimasukkan ke rombel'+(AKD.rep.tanpaSekolah?', '+AKD.rep.tanpaSekolah+' akun siswa belum diberi sekolah':'')+'.</p>';
  h+='</div>';
 }
 /* hak akses */
 h+='<div class="card"><details><summary><b>Hak akses data akademik</b></summary><div class="note">Admin: kelola tahun ajaran, rombel, mata pelajaran, profil dan tugas guru. Guru: melihat mata pelajaran, rombel, dan tugas mengajar. Siswa: tidak mengakses menu ini. NIP, NUPTK, dan data profil lain disimpan di koleksi terpisah yang hanya bisa dibaca dan diubah admin.</div></details></div>';
 /* regulasi */
 h+='<div class="card"><details><summary><b>Acuan regulasi</b></summary>'+AKD_REF.regulasi.map(function(r){return '<div class="note" style="margin-top:8px"><b>'+esc(r.k)+'</b><br>'+esc(r.t)+'</div>'}).join('')+'<div class="note" style="margin-top:8px">'+esc(AKD_REF.catatan)+'</div></details></div>';
 /* katalog SKKNI */
 h+='<div class="card"><details><summary><b>Katalog SKKNI Teknik Sepeda Motor</b> <span class="note">55 unit</span></summary>'+Object.keys(AKD_SKKNI).map(function(c){return '<div class="note" style="margin-top:4px"><span class="mono">'+akSkkniKode(c)+'</span> '+esc(AKD_SKKNI[c])+'</div>'}).join('')+'</details></div>';
 return h;
}

/* --- Formulir --- */
function akFormHtml(){
 var f=AKD.form,o=f.o,k=f.k,ed=akEdit(),h='<div class="card"><div class="row sb"><b>'+f.judul+'</b>'+akBtn('batal',null,'Tutup')+'</div>',ro=ed?'':' disabled';
 var guru=akGuruListAll();
 if(k==='kelas'){
  h+=akFld('Nama rombel',akInp('nama',o.nama,'Contoh: X TBSM 1'))+
   '<div class="two">'+akFld('Tingkat',akSel('tingkat',AKTK,o.tingkat))+akFld('Sekolah',akSel('sekolah',[['','Belum diatur']].concat(SCH_URUT.map(function(c){return [c,SCH_LIST[c].nama]})),o.sekolah))+'</div>'+
   '<div class="two">'+akFld('Tahun ajaran',akSel('tahunId',[['','Belum diatur']].concat(AKD.D.tahun.map(function(t){return [t.id,t.nama+' '+t.semester]})),o.tahunId))+akFld('Wali kelas',akSel('waliId',[['','Belum ditetapkan']].concat(guru.map(function(u){return [u.id,u.nama]})),o.waliId))+'</div>'+
   akFld('Catatan',akInp('catatan',o.catatan));
 }else if(k==='mapel'){
  var induks=AKD.D.mapel.filter(function(m){return !m.induk&&m.id!==o.id});
  h+='<div class="two">'+akFld('Kode',akInp('kode',o.kode,'KK-01'))+akFld('Kelompok',akSel('kelompok',[['umum','Umum'],['kejuruan','Kejuruan'],['pilihan','Pilihan']],o.kelompok))+'</div>'+
   akFld('Nama mata pelajaran / elemen',akInp('nama',o.nama))+
   akFld('Komponen',akInp('komponen',o.komponen,'Konsentrasi Keahlian'))+
   akFld('Induk (bila ini elemen CP)',akSel('induk',[['','Tidak ada']].concat(induks.map(function(m){return [m.id,m.nama]})),o.induk))+
   '<div class="two">'+akFld('Fase',akSel('fase',[['','-'],['E','E'],['F','F']],o.fase))+akFld('JP per minggu',akInp('jp',o.jp,'Isi sesuai struktur kurikulum','number'))+'</div>'+
   '<div><span class="label">Tingkat (kosong = semua)</span><div class="chips">'+AKTK.map(function(t){return '<label class="row" style="gap:6px"><input type="checkbox" data-akf="tingkat" data-akmulti="1" value="'+t+'"'+((o.tingkat||[]).indexOf(t)>-1?' checked':'')+'> '+t+'</label>'}).join('')+'</div></div>'+
   akFld('Sekolah (kosong = semua)',akSel('sekolah',[['','Semua sekolah']].concat(SCH_URUT.map(function(c){return [c,SCH_LIST[c].nama]})),o.sekolah))+
   akFld('Kode unit SKKNI (3 angka, pisahkan koma)',akInp('skkniTeks',(o.skkniTeks!=null?o.skkniTeks:(o.skkni||[]).join(', ')),'018, 019, 020'))+
   akFld('Kata kunci LKPD (pisahkan koma)',akInp('kataTeks',(o.kataTeks!=null?o.kataTeks:(o.kata||[]).join(', ')),'engine, karburator'))+
   akFld('Sumber acuan',akInp('sumber',o.sumber))+akFld('Catatan',akInp('catatan',o.catatan));
 }else if(k==='tahun'){
  h+='<div class="two">'+akFld('Tahun ajaran',akInp('nama',o.nama,'2026/2027'))+akFld('Semester',akSel('semester',['Ganjil','Genap'],o.semester))+'</div>'+
   '<div class="two">'+akFld('Mulai',akInp('mulai',o.mulai,'','date'))+akFld('Selesai',akInp('selesai',o.selesai,'','date'))+'</div>';
 }else if(k==='guru'){
  h+='<p class="note">'+esc(o.nama||'')+'. Data pribadi ini hanya dapat dibaca guru dan admin.</p>'+
   '<div class="two">'+akFld('NIP',akInp('nip',o.nip,'Opsional'))+akFld('NUPTK',akInp('nuptk',o.nuptk,'Opsional'))+'</div>'+
   '<div class="two">'+akFld('Status kepegawaian',akSel('status',[['','-'],['ASN','ASN (PNS/PPPK)'],['GTY','Guru tetap yayasan'],['GTT','Guru tidak tetap'],['Lainnya','Lainnya']],o.status))+akFld('Pendidikan terakhir',akSel('pendidikan',[['','-'],['D3','D3'],['S1','S1/D4'],['S2','S2'],['S3','S3']],o.pendidikan))+'</div>'+
   akFld('Bidang keahlian',akInp('bidang',o.bidang,'Contoh: Teknik Otomotif'))+
   akFld('Sertifikasi dan kompetensi',akInp('sertifikasi',o.sertifikasi,'Contoh: Pendidik, asesor kompetensi, SKKNI'))+
   akFld('Tugas tambahan',akInp('tugasTambahan',o.tugasTambahan,'Contoh: Ketua program keahlian'))+
   akFld('Catatan',akInp('catatan',o.catatan));
 }
 if(ed)h+='<div class="row">'+akBtn('simpan',null,'Simpan','primary')+'</div>';
 return h+'</div>';
}
function akGuruListAll(){return S.users.filter(function(u){return hasRole(u,'guru')&&u.aktif!==false&&akOk(u)}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')})}

/* ---------- Aksi ---------- */
function akBukaForm(k,o,judul){AKD.form={k:k,o:JSON.parse(JSON.stringify(o)),judul:judul};AKD.tg=null;AKD.mem=null;render();window.scrollTo(0,0)}
async function akSimpan(){
 var f=AKD.form;if(!f||!akEdit())return;
 var o=f.o,k=f.k;
 if(k==='kelas'){if(!String(o.nama||'').trim()){toast('Isi nama rombel');return}o.nama=o.nama.trim();o.sekolah=akSek(o.sekolah);o.anggota=o.anggota||[];o.aktif=o.aktif!==false}
 if(k==='mapel'){
  if(!String(o.nama||'').trim()){toast('Isi nama mata pelajaran');return}
  o.nama=o.nama.trim();o.sekolah=akSek(o.sekolah);o.tingkat=o.tingkat||[];
  if(o.skkniTeks!=null){o.skkni=o.skkniTeks.split(/[\s,;]+/).map(function(c){return c.replace(/\D/g,'')}).filter(function(c){return c&&AKD_SKKNI[('00'+c).slice(-3)]}).map(function(c){return ('00'+c).slice(-3)});delete o.skkniTeks}
  if(o.kataTeks!=null){o.kata=o.kataTeks.split(',').map(function(c){return c.trim()}).filter(Boolean);delete o.kataTeks}
  o.jp=o.jp===''||o.jp==null?'':+o.jp;o.aktif=o.aktif!==false;
 }
 if(k==='tahun'){
  if(!/^\d{4}\/\d{4}$/.test(String(o.nama||'').trim())){toast('Tulis tahun ajaran seperti 2026/2027');return}
  o.nama=o.nama.trim();
  if(AKD.D.tahun.some(function(t){return t.id!==o.id&&t.nama===o.nama&&t.semester===o.semester})){toast('Tahun ajaran dan semester itu sudah ada');return}
 }
 var ok=await akPut(k,o);
 if(k==='tahun'&&o.aktif){
  var lainA=AKD.D.tahun.filter(function(t){return t.id!==o.id&&t.aktif});
  for(var ia=0;ia<lainA.length;ia++){lainA[ia].aktif=false;await akPut('tahun',lainA[ia])}
  akTerap();
 }
 AKD.form=null;toast(ok?'Tersimpan':'Disimpan di perangkat, menunggu sinkron');render();
}
function akFieldSet(t){
 var f=AKD.form;if(!f)return;var key=t.dataset.akf,o=f.o;
 if(t.dataset.akmulti){var a=o[key]||[];var i=a.indexOf(t.value);if(t.checked&&i<0)a.push(t.value);if(!t.checked&&i>-1)a.splice(i,1);o[key]=AKTK.filter(function(x){return a.indexOf(x)>-1});return}
 o[key]=t.type==='number'?(t.value===''?'':+t.value):t.value;
}
function akRerenderList(){var el=document.getElementById('akd-list');if(el)el.innerHTML=S.tab==='akd-guru'?akGuruCards():akMapelCards()}
document.addEventListener('input',function(e){
 var t=e.target;if(!t||!t.dataset)return;
 if(t.dataset.akd==='q'){AKD.q=t.value;akRerenderList();return}
 if(t.dataset.akf!==undefined)akFieldSet(t);
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset)return;
 if(t.dataset.akf!==undefined)akFieldSet(t);
 if(t.dataset.aktg!==undefined)AKD.tgf[t.dataset.aktg]=t.type==='number'?(t.value===''?'':+t.value):t.value;
 if(t.dataset.akm!==undefined&&AKD.mem){
  var k=akById('kelas',AKD.mem);if(!k)return;var cur=AKD.memSel||(k.anggota||[]).slice(),i=cur.indexOf(t.dataset.akm);
  if(t.checked&&i<0)cur.push(t.dataset.akm);if(!t.checked&&i>-1)cur.splice(i,1);AKD.memSel=cur;
 }
});
document.addEventListener('click',async function(e){
 var b=e.target.closest&&e.target.closest('[data-akd]');if(!b||b.tagName==='INPUT')return;
 var a=b.dataset.akd,id=b.dataset.id,k=b.dataset.k,ed=akEdit();
 if(a==='tf'){AKD.tf=id;render()}
 else if(a==='sf'){AKD.tf=id;AKD.sk='';render()}
 else if(a==='daftar'){AKD.sk=id;AKD.mem=null;AKD.form=null;S.tab='akd-siswa';render();window.scrollTo(0,0)}
 else if(a==='fl'){AKD.fl=id;render()}
 else if(a==='grp'){AKD.gopen=AKD.gopen||{};AKD.gopen[id]=AKD.gopen[id]===false;render()}
 else if(a==='sinkron')akSinkron();
 else if(a==='ekspor')akEkspor();
 else if(!ed&&['kelas-baru','mapel-baru','ta-baru','ta-aktif','arsip','simpan','tg-add','tg-del','ang-simpan','ang-semua','edit','profil'].indexOf(a)>-1)toast('Hanya admin yang dapat mengubah data akademik');
 else if(a==='kelas-baru'){var ta=akTahunAktif();akBukaForm('kelas',{id:akId('k'),nama:'',tingkat:AKD.tf!=='ALL'?AKD.tf:'X',sekolah:schKode()||'',tahunId:ta?ta.id:'',waliId:'',anggota:[],catatan:'',aktif:true},'Rombel baru')}
 else if(a==='mapel-baru')akBukaForm('mapel',{id:akId('m'),kode:'',nama:'',kelompok:(AKD.fl==='umum'||AKD.fl==='pilihan')?AKD.fl:'kejuruan',komponen:AKD.fl==='dasar'?'Dasar-Dasar Program Keahlian':AKD.fl==='konsentrasi'?'Konsentrasi Keahlian':'',induk:'',fase:'',tingkat:[],jp:'',sumber:'',skkni:[],kata:[],catatan:'',aktif:true,sekolah:''},'Mata pelajaran baru');
 else if(a==='ta-baru')akBukaForm('tahun',{id:akId('t'),nama:'',semester:'Ganjil',aktif:false,mulai:'',selesai:'',sekolah:''},'Tahun ajaran baru');
 else if(a==='edit'){var x=akById(k,id);if(x)akBukaForm(k,x,'Ubah '+(k==='kelas'?'rombel':k==='mapel'?'mata pelajaran':'tahun ajaran'))}
 else if(a==='simpan')akSimpan();
 else if(a==='batal'){AKD.form=null;render()}
 else if(a==='arsip'){var y=akById(k,id);if(y){y.aktif=y.aktif===false;await akPut(k,y);render()}}
 else if(a==='ta-aktif'){
  var ls=AKD.D.tahun.slice();for(var i=0;i<ls.length;i++){var want=ls[i].id===id;if(!!ls[i].aktif!==want){ls[i].aktif=want;await akPut('tahun',ls[i])}}
  akTerap();toast('Tahun ajaran aktif diperbarui');render();
 }
 else if(a==='profil'){
  var u=S.users.filter(function(z){return z.id===id})[0];if(!u)return;
  var p=akProfil(id)||{id:('g'+id).slice(0,36),akunId:id,nama:u.nama,sekolah:SCH_LIST[String(u.sekolah||'').toUpperCase()]?u.sekolah:'',nip:'',nuptk:'',status:'',pendidikan:'',bidang:'',sertifikasi:'',tugasTambahan:'',catatan:''};
  p.nama=u.nama;akBukaForm('guru',p,'Profil guru');
 }
 else if(a==='tugas'){AKD.tg=id;AKD.tgf={};AKD.form=null;render();window.scrollTo(0,0)}
 else if(a==='tg-tutup'){AKD.tg=null;render()}
 else if(a==='tg-add'){
  var f=AKD.tgf;if(!f.mapelId||!f.kelasId){toast('Pilih mata pelajaran dan rombel');return}
  var mp0=akById('mapel',f.mapelId),kl0=akById('kelas',f.kelasId);
  if(!mp0||!kl0){toast('Mata pelajaran atau rombel tidak ditemukan');return}
  if((mp0.tingkat||[]).length&&mp0.tingkat.indexOf(kl0.tingkat)<0){toast(mp0.nama+' hanya untuk kelas '+mp0.tingkat.join(', ')+'; rombel '+kl0.nama+' kelas '+kl0.tingkat);return}
  var jp0=Number(f.jp);if(f.jp===''||f.jp==null||!Number.isInteger(jp0)||jp0<1||jp0>40){toast('JP per minggu harus bilangan bulat 1 sampai 40');return}
  if(AKD.D.tugas.some(function(t){return t.guruId===AKD.tg&&t.mapelId===f.mapelId&&t.kelasId===f.kelasId})){toast('Tugas itu sudah ada');return}
  var lain=AKD.D.tugas.filter(function(t){return t.guruId!==AKD.tg&&t.mapelId===f.mapelId&&t.kelasId===f.kelasId&&akBerlaku(t)});
  if(lain.length&&!(await uiConfirm(mp0.nama+' di '+kl0.nama+' sudah diampu '+lain.map(function(t){return akNamaUser(t.guruId)}).join(', ')+'. Tambahkan juga (mengajar bersama)?',{ok:'Tetap tambah'})))return;
  var ta2=akTahunAktif();await akPut('tugas',{id:akId('u'),guruId:AKD.tg,mapelId:f.mapelId,kelasId:f.kelasId,jp:jp0,tahunId:ta2?ta2.id:'',nama:'',sekolah:kl0.sekolah||''});
  AKD.tgf={};render();
 }
 else if(a==='tg-del'){if(await uiConfirm('Hapus tugas mengajar ini?',{ok:'Hapus'})){await akDel('tugas',id);render()}}
 else if(a==='anggota'){AKD.mem=id;AKD.memSel=null;AKD.form=null;render();window.scrollTo(0,0)}
 else if(a==='ang-tutup'){AKD.mem=null;AKD.memSel=null;render();window.scrollTo(0,0)}
 else if(a==='ang-semua'){
  var kk=akById('kelas',AKD.mem);if(!kk)return;var pet=akAnggotaPeta(),cur=(AKD.memSel||(kk.anggota||[])).slice();
  S.users.forEach(function(u){if(hasRole(u,'siswa')&&u.aktif!==false&&u.kelas===kk.tingkat&&(!kk.sekolah||!SCH_LIST[String(u.sekolah||'').toUpperCase()]||String(u.sekolah).toUpperCase()===kk.sekolah)&&(!pet[u.id]||pet[u.id]===kk.id)&&cur.indexOf(u.id)<0)cur.push(u.id)});
  AKD.memSel=cur;render();
 }
 else if(a==='ang-simpan'){var k2=akById('kelas',id);if(!k2)return;k2.anggota=(AKD.memSel||k2.anggota||[]).slice();await akPut('kelas',k2);AKD.mem=null;AKD.memSel=null;toast('Anggota tersimpan');render()}
});

/* ---------- Ekspor ---------- */
function akEkspor(){
 if(typeof XLSX==='undefined'){if(window.Pustaka)Pustaka.muat();toast('Pustaka Excel sedang disiapkan. Coba lagi sebentar.');return}
 var wb=XLSX.utils.book_new(),sh=function(n,rows){XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.length?rows:[{Keterangan:'Belum ada data'}]),n)};
 sh('Guru',akGuruListAll().map(function(u){var p=akProfil(u.id)||{};return {Nama:u.nama,Email:u.email||'',Sekolah:akSekLabel(u.sekolah),NIP:p.nip||'',NUPTK:p.nuptk||'',Status:p.status||'',Pendidikan:p.pendidikan||'','Tugas tambahan':p.tugasTambahan||'','JP per minggu':akJp(u.id)}}));
 sh('Rombel',akKelasAll().map(function(k){return {Rombel:k.nama,Tingkat:k.tingkat,Sekolah:akSekLabel(k.sekolah),'Tahun ajaran':(akById('tahun',k.tahunId)||{}).nama||'','Wali kelas':k.waliId?akNamaUser(k.waliId):'','Jumlah siswa':akSiswaRombel(k).length,Status:k.aktif===false?'Arsip':'Aktif'}}));
 sh('Mata pelajaran',akMapelAll().map(function(m){var ind=m.induk&&akById('mapel',m.induk);return {Kode:m.kode||'','Mata pelajaran':m.nama,Kelompok:m.kelompok,Komponen:m.komponen||'','Elemen dari':ind?ind.nama:'',Fase:m.fase||'',Tingkat:(m.tingkat||[]).join(', '),JP:m.jp||'','Unit SKKNI':(m.skkni||[]).map(akSkkniKode).join(', '),Sumber:m.sumber||'',Status:m.aktif===false?'Arsip':'Aktif'}}));
 sh('Tugas mengajar',AKD.D.tugas.filter(function(t){var k=akById('kelas',t.kelasId);return !k||akOk(k)}).map(function(t){return {Guru:akNamaUser(t.guruId),'Mata pelajaran':(akById('mapel',t.mapelId)||{}).nama||'',Rombel:(akById('kelas',t.kelasId)||{}).nama||'','JP per minggu':+t.jp||0}}));
 XLSX.writeFile(wb,'administrasi-akademik-'+(schKode()||'semua').toLowerCase()+'-'+ymd(Date.now())+'.xlsx');
}

/* ---------- Pemasangan ke aplikasi ---------- */
var _akViewKat=viewKatalog;
viewKatalog=function(){
 if(akOn()&&S.user&&isStaff())return viewAkd();
 return _akViewKat.apply(this,arguments);
};
var _akRender=render;
render=function(){
 _akRender.apply(this,arguments);
 try{
  if(!S.user||!isStaff())return;
  var sb=document.querySelector('.sbody');
  if(sb&&!sb.querySelector('[data-v="akd-guru"]')){
   var cur=V.mode==='list'?S.tab:'';
   var html='<button type="button" class="srow" data-act="menu" data-v="akd-guru"'+(AKTABS.indexOf(cur)>-1?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.akdTata,22)+'</span><span class="st"><b>Administrasi Akademik</b><small>'+(akEdit()?'Guru, kelas, daftar siswa, mata pelajaran, tata kelola':'Guru, kelas, daftar siswa, dan mata pelajaran')+'</small></span>'+svg(ICO.chev,18)+'</button>';
   var br=sb.querySelector('.srow[data-v="beranda"]');
   if(br)br.insertAdjacentHTML('afterend',html);else sb.insertAdjacentHTML('beforeend',html);
  }
 }catch(e){}
};
if(typeof NAVTABS!=='undefined')AKTABS.forEach(function(t){if(NAVTABS.indexOf(t)<0)NAVTABS.push(t)});
if(typeof doLogout==='function'){var _akLogout=doLogout;doLogout=async function(){akClear();return _akLogout.apply(this,arguments)}}
if(typeof refreshData==='function'){var _akRefresh=refreshData;refreshData=async function(){await _akRefresh.apply(this,arguments);AKD.loaded=false;if(akOn())render()}}
window.addEventListener('online',function(){if(S.user&&Cloud.on&&isStaff())akFlushQ()});
/* daftar mapel pada bank soal ikut mata pelajaran master */
if(typeof bsMapelList==='function'){var _akBm=bsMapelList;bsMapelList=function(){var a=_akBm.apply(this,arguments),m={};a.forEach(function(x){m[x]=1});akMapelNamaMaster().forEach(function(x){m[x]=1});return Object.keys(m).sort()}}
