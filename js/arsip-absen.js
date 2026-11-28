/* Evaluasi absensi mingguan (harian dan PKL) serta tombol arsip ke Drive (admin). Dipasang di rekap absensi dan rekap PKL. */
var AR={m:{}};
function arYmd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function arSenin(t){var d=t?new Date(t+'T00:00:00'):new Date();if(!t)d.setDate(d.getDate()-7);d.setDate(d.getDate()-(d.getDay()+6)%7);return arYmd(d)}
function arAkhir(s){var d=new Date(s+'T00:00:00');d.setDate(d.getDate()+6);return arYmd(d)}
/* baris: satu per siswa. Harian dihitung per sesi kehadiran; PKL per hari. */
function arHitung(j,senin){
 var akhir=arAkhir(senin),M={};
 function B(id,n,k){return M[id]||(M[id]={nama:n,kelas:k,H:0,S:0,I:0,A:0,hari:{}})}
 function dalam(t){return t>=senin&&t<=akhir}
 if(j==='harian'){
  var U={};(S.users||[]).forEach(function(u){U[u.id]=u});
  (typeof schObsList==='function'?schObsList(S.observasi||[]):S.observasi||[]).forEach(function(r){
   if(r.tipe!=='absen'||r.kategori!=='hadir'||!dalam(String(r.tanggal)))return;
   var R=abPay(r).rows;Object.keys(R).forEach(function(id){var u=U[id];if(!u)return;var b=B(id,u.nama,u.kelas||'');if(b[R[id].s]!=null)b[R[id].s]++});
  });
 }else{
  pkList('absen').forEach(function(a){
   if(a.uji||!dalam(a.tanggal)||a.tipe==='pulang')return;
   var b=B(a.sid,pkNm(a),pkKl(a)),k=a.tipe==='masuk'?'H':a.tipe==='sakit'?'S':a.tipe==='izin'?'I':'';
   if(k&&!b.hari[a.tanggal]){b.hari[a.tanggal]=1;b[k]++}
  });
 }
 return Object.keys(M).map(function(id){return M[id]}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
}
function arUji(m){return pkList('absen').filter(function(a){return a.uji&&a.tanggal>=m&&a.tanggal<=arAkhir(m)}).length}
function arKartu(j){
 var m=AR.m[j]||(AR.m[j]=arSenin()),L=arHitung(j,m);
 return '<div class="card"><b>Evaluasi mingguan '+(j==='pkl'?'PKL':'harian')+'</b><label class="f">Pilih tanggal dalam minggu<input type="date" data-ar="'+j+'" value="'+m+'"></label>'+
  '<div class="note">'+m+' s.d. '+arAkhir(m)+' · '+L.length+' siswa tercatat'+(j==='pkl'&&arUji(m)?' (+'+arUji(m)+' data uji, ikut diarsipkan)':'')+(j==='pkl'?'. Alpa PKL tidak dihitung di sini.':'')+'</div>'+
  (j==='harian'&&AR.pesan?'<div class="note" role="status">'+AR.pesan+'</div>':'')+
  '<div class="row"><button type="button" class="btn small primary" data-arxls="'+j+'">Ekspor Excel minggu</button>'+
  (S.role==='admin'&&Cloud.on?'<button type="button" class="btn small" data-arkirim="'+j+'">Arsipkan ke Drive</button>'+(j==='pkl'?'<button type="button" class="btn small danger" data-arpklhapus="'+m+'">Hapus dari Appwrite</button>':'')+(j==='harian'?'<button type="button" class="btn small danger" data-arhapus="'+m+'">Hapus dari Appwrite</button>':''):'')+'</div></div>';
}
if(typeof abViewRekap==='function'){var _arAb=abViewRekap;abViewRekap=function(){return arKartu('harian')+_arAb()}}
if(typeof pkTabRekap==='function'){var _arPk=pkTabRekap;pkTabRekap=function(){return arKartu('pkl')+_arPk()}}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.ar&&t.value){AR.m[t.dataset.ar]=arSenin(t.value);render()}});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-arxls],[data-arkirim]');if(!b)return;
 var j=b.dataset.arxls||b.dataset.arkirim,m=AR.m[j];
 if(b.dataset.arxls){
  var L=arHitung(j,m);if(!L.length)return toast('Belum ada data pada minggu ini.');
  if(typeof XLSX==='undefined')return toast('Pustaka Excel belum termuat.');
  var wb=XLSX.utils.book_new(),A=[['Nama','Kelas','Hadir','Sakit','Izin'].concat(j==='harian'?['Alpa']:[])];
  L.forEach(function(x){A.push([x.nama,x.kelas,x.H,x.S,x.I].concat(j==='harian'?[x.A]:[]))});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(A),'Mingguan');XLSX.writeFile(wb,'Absensi-'+j+'-'+m+'.xlsx');return;
 }
 b.disabled=true;
 ldCall({action:'arsip-absen',jenis:j,minggu:m,sekolah:schKode()}).then(function(r){toast(r.jumlah?'Terarsip dan terverifikasi: '+r.jumlah+' dokumen '+schNama()+(r.berkas?' dalam '+r.berkas+' berkas rombel':'')+'.':'Tidak ada data '+schNama()+' untuk diarsipkan.')})
  .catch(function(x){toast('Arsip gagal: '+x.message)}).then(function(){b.disabled=false});
});

/* ---- baca arsip harian: disimpan terpisah dari S.observasi agar tidak ikut sinkron ---- */
AR.doc={};AR.st={};AR.pesan='';
function arSeninBulan(b){var a=[],d=new Date(arSenin(b+'-01')+'T00:00:00'),y;for(;;){y=arYmd(d);if(y.slice(0,7)>b)break;a.push(y);d.setDate(d.getDate()+7)}return a}
function arMuat(minggu){
 if(!Cloud.on||!S.user)return Promise.resolve(false);
 var u=S.user.id+'|'+S.role;if(AR.u!==u){AR.u=u;AR.doc={};AR.st={}}
 var perlu=minggu.filter(function(w){return !AR.st[w]});if(!perlu.length)return Promise.resolve(false);
 perlu.forEach(function(w){AR.st[w]=1});AR.pesan='Memuat arsip dari Drive…';
 return ldCall({action:'baca-arsip',minggu:perlu}).then(function(r){
  if(AR.u!==u)return;r.dokumen.forEach(function(d){AR.doc[d.$id]=fromDoc(d)});perlu.forEach(function(w){AR.st[w]=2});AR.pesan='';render();return true;
 }).catch(function(x){perlu.forEach(function(w){AR.st[w]=3});AR.pesan='Arsip Drive gagal dimuat, rekap bisa belum lengkap. Ketuk tombol segarkan arsip. ('+esc(x.message)+')';render()});
}
/* dokumen yang masih ada di Appwrite diutamakan; arsip hanya mengisi yang sudah dihapus */
function arDenganArsip(fn){
 var asli=S.observasi||[],ada={};asli.forEach(function(r){ada[r.id]=1});
 S.observasi=asli.concat(Object.keys(AR.doc).filter(function(id){return !ada[id]}).map(function(id){return AR.doc[id]}));
 try{return fn()}finally{S.observasi=asli}
}
if(typeof abRekapData==='function'){var _arRd=abRekapData;abRekapData=function(){return arDenganArsip(_arRd)}}
var _arHit=arHitung;arHitung=function(j,m){return j==='harian'?arDenganArsip(function(){return _arHit(j,m)}):_arHit(j,m)};
if(typeof abViewRekap==='function'){var _arVr=abViewRekap;abViewRekap=function(){
 var h=_arVr();
 setTimeout(function(){arMuat(arSeninBulan(AB.rk.bulan)).then(function(){return arMuat([AR.m.harian])})},0);
 return '<div class="row"><button type="button" class="btn small" data-arsegar="1">Segarkan arsip</button></div>'+h;
}}
/* sesi yang sudah dipindah ke arsip tidak boleh dibuat ulang sebagian */
if(typeof abSet==='function'){var _arSet=abSet;abSet=function(rb,t,j){
 var id=abDocId(rb,t,j);
 if(AR.doc[id]&&!abRec(rb,t,j)){toast('Sesi ini sudah diarsipkan dan tidak bisa diubah.');return false}
 return _arSet.apply(this,arguments);
}}
/* t = {d: dihapus sekarang, s: sudah terhapus sebelumnya, lewat: berubah, gagal: masih ada}. Server lama tidak mengirim dihapus/sudah: dianggap semua dihapus. */
function arTambah(t,r){t.d+=r.dihapus!=null?r.dihapus:r.ids.length;t.s+=r.sudah||0;t.lewat+=r.berubah||0;t.gagal+=r.gagal||0;return t}
function arPesan(sn,kata,t){
 var p=[t.d+' '+kata+' '+sn+' dihapus sekarang'];
 if(t.s)p.push(t.s+' sudah terhapus sebelumnya');
 if(t.lewat)p.push(t.lewat+' berubah (arsipkan ulang dulu)');
 if(t.gagal)p.push(t.gagal+' GAGAL dihapus, masih ada di Appwrite (cek izin hapus akun admin)');
 return p.join(', ')+'.';
}
function arHapus(m,mulai,t){
 return ldCall({action:'hapus-arsip',minggu:m,mulai:mulai,sekolah:AR.sk}).then(function(r){
  var buang={};r.ids.forEach(function(i){buang[i]=1});
  S.observasi=(S.observasi||[]).filter(function(x){return !(x.tipe==='absen'&&buang[x.id]&&!x.d)});save();
  arTambah(t,r);
  return r.lanjut!=null?arHapus(m,r.lanjut,t):t;
 });
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-arhapus],[data-arsegar]');if(!b)return;
 if(b.dataset.arsegar){AR.st={};AR.doc={};AR.pesan='';render();return}
 var m=b.dataset.arhapus;
 var sk=schKode(),sn=schNama();
 if(!sk)return toast('Pilih sekolah dulu.');
 if(!uiOk('arhapus'+sk+m,'Hapus absensi harian '+sn+' minggu '+m+' dari Appwrite?\nData tetap ada di arsip Drive. Penghapusan tidak bisa dibatalkan, dan sesi tidak bisa diubah lagi.',b,{ok:'Hapus',cancel:'Batal',danger:true}))return;
 b.disabled=true;AR.sk=sk;delete AR.st[m];
 arMuat([m]).then(function(){
  if(AR.st[m]!==2)throw new Error('arsip belum terbaca di aplikasi, penghapusan dibatalkan.');
  return arHapus(m,0,{d:0,s:0,lewat:0,gagal:0});
 }).then(function(r){toast(arPesan(sn,'sesi',r));render()})
  .catch(function(x){toast('Hapus gagal: '+x.message)}).then(function(){b.disabled=false});
});

/* ---- evaluasi kehadiran di halaman Absensi siswa (dimuat saat diketuk agar hemat) ---- */
var ARS={m:'',d:null,pesan:'',u:''};
var AR_ST={H:'Hadir',S:'Sakit',I:'Izin',A:'Alpa'};
function arSiswa(){
 if(ARS.u!==S.user.id){ARS={m:'',d:null,pesan:'',u:S.user.id}}
 if(!ARS.m)ARS.m=arSenin(arYmd(new Date()));
 var h='<div class="card"><b>Kehadiran mingguan saya</b><label class="f">Pilih tanggal dalam minggu<input type="date" data-ars="1" value="'+ARS.m+'"></label><div class="note">'+ARS.m+' s.d. '+arAkhir(ARS.m)+'</div>'+
  '<button type="button" class="btn small primary" data-arslihat="1">Lihat kehadiran</button>';
 if(ARS.pesan)h+='<div class="note" role="status">'+esc(ARS.pesan)+'</div>';
 if(ARS.d){
  var c={H:0,S:0,I:0,A:0};ARS.d.forEach(function(x){if(c[x.status]!=null)c[x.status]++});
  h+=ARS.d.length?'<div class="row">'+Object.keys(c).map(function(k){return '<span class="pill plain">'+AR_ST[k]+' '+c[k]+'</span>'}).join('')+'</div>'+
   ARS.d.map(function(x){return '<div class="note"><b>'+esc(abTglIndo(x.tanggal))+' · '+esc(AR_ST[x.status]||x.status)+'</b><br>'+esc(x.mapel)+' · '+esc(x.guru)+'</div>'}).join('')
   :'<div class="note">Belum ada absensi tercatat pada minggu ini.</div>';
 }
 return h+'</div>';
}
/* halaman Absensi siswa (pintasan Beranda): barcode dan kehadiran mingguan */
if(typeof viewKatalog==='function'){var _arVk=viewKatalog;viewKatalog=function(){
 if(S.tab==='absensi'&&S.user&&actRole()==='siswa')return '<div class="card"><div class="row sb"><div class="grow"><b>Barcode absensi saya</b><div class="note">Tunjukkan ke guru untuk absensi kehadiran dan praktik.</div></div><button type="button" class="btn small primary" data-act="abme">Tampilkan</button></div></div>'+(Cloud.on?arSiswa():'<div class="note">Kehadiran mingguan tersedia saat aplikasi tersambung ke server.</div>');
 return _arVk.apply(this,arguments);
}}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.ars&&t.value){ARS.m=arSenin(t.value);ARS.d=null;ARS.pesan='';render()}});
document.addEventListener('click',function(e){
 if(!(e.target.closest&&e.target.closest('[data-arslihat]')))return;
 var m=ARS.m,u=ARS.u;ARS.d=null;ARS.pesan='Memuat…';render();
 ldCall({action:'absen-saya',minggu:m}).then(function(r){if(ARS.m===m&&ARS.u===u){ARS.d=r.sesi;ARS.pesan='';render()}})
  .catch(function(x){if(ARS.m===m&&ARS.u===u){ARS.pesan='Gagal memuat: '+x.message;render()}});
});

/* ---- arsip PKL: hanya di memori, digabung saat dibaca (tidak ikut sinkron) ---- */
var ARP={u:'',st:0,L:[],pesan:''};
function arpAkun(){var u=(S.user&&S.user.id)+'|'+actRole();if(ARP.u!==u)ARP={u:u,st:0,L:[],pesan:''}}
if(typeof pkList==='function'){var _arPl=pkList;pkList=function(k){
 var L=_arPl(k);if(k!=='absen'||!S.user)return L;arpAkun();
 var ada={};PK.D.absen.forEach(function(x){ada[x.id]=1});
 return L.concat(ARP.L.filter(function(x){return !ada[x.id]&&pkOk(x)&&(isStaff()||x.sid===S.user.id)}));
}}
if(typeof pkById==='function'){var _arPi=pkById;pkById=function(k,id){
 return _arPi(k,id)||(k==='absen'?ARP.L.filter(function(x){return x.id===id})[0]||null:null);
}}
function arpMuat(){
 arpAkun();if(!Cloud.on||!S.user||ARP.st)return;
 var X=ARP,hasil=[];X.st=1;
 (function ambil(mulai){return ldCall({action:'baca-arsip-pkl',mulai:mulai}).then(function(r){
  r.dokumen.forEach(function(d){var o=pkParse(d);o.arsip=true;hasil.push(o)});
  return r.lanjut!=null?ambil(r.lanjut):null;
 })})(0).then(function(){if(ARP===X){X.L=hasil;X.st=2;X.pesan='';render()}})
  .catch(function(e){if(ARP===X){X.st=3;X.pesan=e.message;render()}});
}
if(typeof viewPkl==='function'){var _arVp=viewPkl;viewPkl=function(){
 var h=_arVp.apply(this,arguments);if(!Cloud.on)return h;
 arpAkun();if(!ARP.st)setTimeout(arpMuat,0);
 var n=ARP.st===3?'<div class="note" role="status">Arsip absen gagal dimuat, riwayat dan rekap bisa belum lengkap ('+esc(ARP.pesan)+') <button type="button" class="btn small" data-arpsegar="1">Coba lagi</button></div>':
  ARP.st<2?'<div class="note" role="status">Memuat arsip absen dari Drive…</div>':'';
 return n+h;
}}
/* ekspor dan cetak ditahan selama arsip belum lengkap */
document.addEventListener('click',function(e){
 if(S.tab!=='pkl'||!Cloud.on||ARP.st===2)return;
 var b=e.target.closest&&e.target.closest('[data-act^="pkl-xls"],[data-act^="pkl-pdf"],[data-act^="pko"],[data-arxls="pkl"]');
 if(b){e.preventDefault();e.stopImmediatePropagation();toast('Tunggu arsip absen selesai dimuat, atau ketuk Coba lagi.')}
},true);
function arpHapus(m,mulai,t){
 return ldCall({action:'hapus-arsip',jenis:'pkl',minggu:m,mulai:mulai,sekolah:ARP.sk}).then(function(r){
  var buang={};r.ids.forEach(function(i){buang[i]=1});
  PK.D.absen=PK.D.absen.filter(function(x){return !(buang[x.id]&&!x.d)});pkSaveLocal();
  arTambah(t,r);
  return r.lanjut!=null?arpHapus(m,r.lanjut,t):t;
 });
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-arpklhapus],[data-arpsegar]');if(!b)return;
 if(b.dataset.arpsegar){ARP.st=0;render();return}
 if(actRole()!=='admin')return;
 var m=b.dataset.arpklhapus;
 var sk=schKode(),sn=schNama();
 if(!sk)return toast('Pilih sekolah dulu.');
 if(!uiOk('arpkl'+sk+m,'Hapus absen PKL '+sn+' minggu '+m+' dari Appwrite?\nData tetap ada di arsip Drive. Penghapusan tidak bisa dibatalkan.',b,{ok:'Hapus',cancel:'Batal',danger:true}))return;
 b.disabled=true;ARP.st=0;arpMuat();
 var X=ARP;X.sk=sk;
 new Promise(function(ok,no){var n=0;(function tunggu(){if(X.st===2)return ok();if(X.st===3||++n>120)return no(new Error('arsip belum terbaca, penghapusan dibatalkan.'));setTimeout(tunggu,500)})()})
  .then(function(){return arpHapus(m,0,{d:0,s:0,lewat:0,gagal:0})})
  .then(function(r){toast(arPesan(sn,'catatan',r));render()})
  .catch(function(x){toast('Hapus gagal: '+x.message)}).then(function(){b.disabled=false});
});
