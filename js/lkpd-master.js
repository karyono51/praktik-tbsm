/* lkpd-master.js: LKPD-X-06 (Penggunaan dan Perawatan Alat Ukur) menjadi MASTER LKPD V2.
   Master = acuan struktur dan format untuk semua LKPD v2: pertemuan, gerbang masuk TKA, K3 dan APD, langkah bersaksi guru, tabel data,
   pemeriksaan dan bukti foto, latihan membaca skala, analisis, refleksi, tindak lanjut, penilaian kinerja, dan format cetak PDF.
   Berdiri sendiri: membungkus lksHub (lkpd-staff.js) tanpa mengubah berkasnya; dimuat setelah lkpd-v2-editor.js. Tanpa koleksi atau atribut baru.
   1. Kelola LKPD (Guru/Admin), halaman sebuah LKPD v2: kartu "Master LKPD V2" (pada master) atau "Kelengkapan sesuai master V2" (pada
      LKPD v2 lain) berisi daftar periksa kelengkapan dan butir yang belum terpenuhi.
   2. Tombol "Buat LKPD v2 dari master" pada master: membuka Editor LKPD dengan salinan master (draf, tidak aktif, ID kosong). Salinan memuat
      v2.dari = ID master dan tidak membawa peta ke soal lama milik master. Master sendiri tidak berubah.
   Master dikenali dari ID tetap LKMS.ID, jadi salinan tidak ikut menjadi master. */
var LKMS={ID:'LKPD-X-06'};
function lkmsMaster(m){return !!m&&m.id===LKMS.ID&&typeof lk2Is==='function'&&lk2Is(m)}
function lkmsE(x){return typeof lkEsc==='function'?lkEsc(x):String(x==null?'':x)}

/* Daftar periksa kelengkapan sesuai master. Mengembalikan [{k: butir, ok: bool, t: keterangan bila belum}]. */
function lkmsCek(m){
 var V=m&&m.v2,r=[];
 function add(k,ok,t){r.push({k:k,ok:!!ok,t:ok?'':(t||'')})}
 if(!V||V.ver!==2)return [{k:'Struktur LKPD v2',ok:false,t:'Bukan LKPD v2'}];
 var P=V.pertemuan||[],KG=V.kegiatan||[],G=(V.gate&&V.gate.qs)||[],LG=V.langkah||[],TB=V.tabel||[],CK=V.cekK||[],OB=(V.obs&&V.obs.aspek)||[];
 var ST=m.steps||[],SF=m.safety||[],CH=m.checks||[],QZ=m.quiz||[];
 add('Tujuan pembelajaran (minimal 3)',(m.objectives||[]).length>=3,'Tujuan kurang dari 3');
 add('Pertanyaan pemantik dan materi (minimal 4 topik)',(m.theory||[]).some(function(x){return /pemantik/i.test(x[0])})&&(m.theory||[]).length>=4,'Perlu pertanyaan pemantik dan minimal 4 topik teori');
 add('Rencana pertemuan: awal dan akhir tanpa kegiatan ukur (kecuali 3 pertemuan), JP dan menit terisi',P.length>=3&&(P.length===3||(!(P[0].kegiatan||[]).length&&!(P[P.length-1].kegiatan||[]).length))&&P.every(function(p){return p.jp>0&&p.menit>0}),'Minimal 3 pertemuan; bila 4 pertemuan atau lebih, pertemuan pertama dan terakhir tanpa kegiatan; JP dan menit harus terisi');
 add('Setiap kegiatan terpetakan ke pertemuan',KG.length>=1&&KG.every(function(x,i){return P.some(function(p){return (p.kegiatan||[]).indexOf(i+1)>-1})}),'Ada kegiatan yang belum masuk pertemuan mana pun');
 var gBad=[];G.forEach(function(q,i){
  var t=q.t||'pg',ok=!!q.e&&(q.lvl==='Aplikasi'||q.lvl==='Penalaran');
  if(t==='kategori')ok=ok&&(q.rows||[]).length>=3&&q.rows.every(function(x){return x[1]===true||x[1]===false});
  else if(t==='kompleks')ok=ok&&(q.o||[]).length>=4&&Array.isArray(q.a)&&q.a.length>=2&&q.a.every(function(k){return k>=0&&k<q.o.length});
  else ok=ok&&(q.o||[]).length>=4&&q.a>=0&&q.a<(q.o||[]).length;
  if(!ok)gBad.push(i+1);
 });
 add('Gerbang masuk: minimal 3 soal TKA berlevel, berkunci, dan berpembahasan',G.length>=3&&!gBad.length,G.length<3?'Soal gerbang kurang dari 3':'Soal perlu dilengkapi: nomor '+gBad.join(', '));
 var cover={};(V.k3grup||[]).forEach(function(g){(g.i||[]).forEach(function(i){cover[i]=(cover[i]||0)+1})});
 add('K3 dan APD: minimal 5 butir, semua terkelompok, ada butir APD',SF.length>=5&&SF.every(function(x,i){return cover[i]===1})&&(V.apd||[]).length>=1&&(V.apd||[]).every(function(i){return i>=0&&i<SF.length}),'Butir K3 harus minimal 5, masing-masing masuk satu kelompok, dan ada butir APD');
 add('Setiap kegiatan punya langkah, dan ada langkah bersaksi guru',KG.length>=1&&KG.every(function(x,i){return LG.some(function(l){return l.k===i+1})})&&LG.some(function(l){return l.saksi})&&LG.every(function(l){return ST[l.i]}),'Kegiatan tanpa langkah, atau tidak ada langkah bersaksi guru');
 add('Tabel data (minimal 1) terpetakan ke kegiatan',TB.length>=1&&TB.every(function(t){return t.id&&t.k>=1&&t.k<=KG.length&&(t.kol||[]).length>=2&&(t.baris||[]).length>=1}),'Perlu minimal 1 tabel dengan kolom dan baris');
 add('Pemeriksaan dan bukti: tiap komponen punya kegiatan, ada yang wajib foto',CH.length>=1&&CK.length===CH.length&&CK.every(function(k){return k>=1&&k<=KG.length})&&(m.fotoWajib||[]).length>=1&&(m.fotoWajib||[]).every(function(i){return i>=0&&i<CH.length}),'Setiap komponen pemeriksaan butuh kegiatan, dan minimal 1 wajib foto');
 var lat=QZ.filter(function(q){return q.id&&q.kunci!==undefined&&q.kunci!==null&&q.kunci!==''}),ids={};lat.forEach(function(q){ids[q.id]=1});
 add('Latihan membaca skala: minimal 3 soal isian berkunci, terpetakan ke pertemuan',lat.length>=3&&P.every(function(p){return (p.latihan||[]).every(function(id){return ids[id]})}),'Latihan minimal 3 soal berkunci, dan id latihan pada pertemuan harus ada');
 add('Analisis (minimal 3) dan refleksi (minimal 3)',(V.analisis||[]).length>=3&&(V.refleksi||[]).length>=3,'Analisis atau refleksi kurang dari 3');
 var sum=OB.reduce(function(t,a){return t+(+a.b||0)},0);
 add('Penilaian kinerja: bobot 100%, rubrik skor 1-4, ada aspek penghenti',OB.length>=3&&sum===100&&OB.every(function(a){return a.d&&a.d[1]&&a.d[2]&&a.d[3]&&a.d[4]})&&OB.some(function(a){return a.stop}),OB.length&&sum!==100?'Total bobot '+sum+'%, harus 100%':'Rubrik skor 1-4 dan aspek penghenti harus ada');
 add('Tindak lanjut remedial dan pengayaan',!!(V.tindak&&V.tindak.remedial&&V.tindak.pengayaan),'Tindak lanjut belum lengkap');
 add('Cek kondisi alat sebelum dipakai',(V.cekAlat||[]).length>=1,'Belum ada cek kondisi alat');
 return r;
}

function lkmsKartu(m){
 var master=lkmsMaster(m),cek=lkmsCek(m),ok=cek.filter(function(x){return x.ok}).length,miss=cek.filter(function(x){return !x.ok});
 var h='<section class="card lkms"><div class="row sb"><h3 class="grow">'+(master?'Master LKPD V2':'Kelengkapan sesuai master V2')+'</h3><span class="pill '+(miss.length?'warn':'ok')+'">'+ok+'/'+cek.length+'</span></div>';
 if(master)h+='<p class="note">LKPD ini master LKPD V2: acuan struktur dan format cetak PDF untuk semua LKPD v2. LKPD v2 baru dibuat dari salinannya, lalu isinya disesuaikan di Editor LKPD.</p>'+
  '<div class="lks-acts"><button type="button" class="btn small" data-act="lkms-baru" data-v="'+lkmsE(m.id)+'">Buat LKPD v2 dari master</button></div>';
 else if(m.v2&&m.v2.dari)h+='<p class="note">Turunan master '+lkmsE(m.v2.dari)+'.</p>';
 if(miss.length)h+='<ul class="lkf-ul lkms-miss">'+miss.map(function(x){return '<li><b>'+lkmsE(x.k)+'</b>: '+lkmsE(x.t)+'</li>'}).join('')+'</ul>';
 else h+='<p class="note">Semua butir master terpenuhi.</p>';
 return h+'</section>';
}
(function(){
 if(typeof lksHub!=='function')return;
 var h0=lksHub;
 lksHub=function(){
  var html=h0.apply(this,arguments);
  try{
   var m=lksMod();
   if(!m||!isStaff()||typeof lk2Is!=='function'||!lk2Is(m))return html;
   var i=html.indexOf('</section>');
   return i<0?html:html.slice(0,i+10)+lkmsKartu(m)+html.slice(i+10);
  }catch(e){return html}
 };
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-act="lkms-baru"]');if(!b)return;
  e.stopPropagation();e.preventDefault();
  if(!isStaff())return;
  var m=(LKPD_MODULES||[]).find(function(x){return x.id===b.dataset.v});
  if(!m||!lkmsMaster(m)){toast('Master LKPD V2 tidak ditemukan');return}
  var c=lkEditorDefaults(m);
  c.id='';c.title=m.title+' (baru dari master)';c.status='draft';c.active=false;c.kelas=m.kelas;
  if(c.src&&c.src.v2){c.src.v2.dari=m.id;delete c.src.v2.peta}
  LK.module=m.id;LK.tab='editor';LK.detail=null;LK.preview=false;LK.open=true;LKA.id=null;LKM.edit=null;LKM.d=null;LK.editor=c;
  render();window.scrollTo(0,0);toast('Isi ID dan judul baru, sesuaikan isinya, lalu simpan');
 },true);
})();
