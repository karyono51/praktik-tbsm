/* pengawas.js: peran Proktor, rilis token, dan log audit. Dimuat setelah kepsek.js.
   - Peran `proktor` (pengawas ujian). Di Appwrite akunnya diberi label `proktor` (BUKAN `guru`), jadi tidak punya izin baca
     koleksi apa pun. Semua yang dilakukannya lewat fungsi server cbt: aksi pantau, rilisToken, aksiRun, catat
     (tanpa jawaban, kunci, atau nilai).
   - Menu Ruang ujian: token sesi (rilis dan tutup), status peserta, tambah waktu, buka kunci, akhiri.
   - Log audit (admin): aksi staf dari server (token, waktu, kunci, nilai) dan aksi di perangkat (hapus, ubah) yang
     dikirim lewat aksi catat. Koleksi `audit` hanya bisa dibaca admin.
   Bergantung pada: core.js, banksoal.js, cbt.js (cbtFn), dialog.js (uiConfirm). */
(function(){
if(typeof PERAN==='undefined'||typeof PERM==='undefined')return;
PERAN.proktor='Proktor';
PERM.proktor=['pantau'];
URUT=URUT.filter(function(r){return r!=='proktor'});URUT.splice(URUT.indexOf('siswa')<0?URUT.length:URUT.indexOf('siswa'),0,'proktor');
if(typeof NAVTABS!=='undefined'){NAVTABS.push('ruangujian');NAVPERM.ruangujian='pantau'}

function isPk(){try{return !!S.user&&actRole()==='proktor'}catch(e){return false}}
function isAdm(){try{return !!S.user&&Cloud.on&&actRole()==='admin'&&can('hapus')}catch(e){return false}}
function mmss(sec){sec=Math.max(0,Math.round(sec));return Math.floor(sec/60)+':'+('0'+(sec%60)).slice(-2)}
function jam(t){return new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}

/* form sesi: opsi token hanya tampil bila "Wajib token" dicentang */
document.addEventListener('change',function(e){
 if(!e.target||e.target.id!=='sf-tok')return;
 var b=document.getElementById('sf-tokbox');if(b)b.hidden=!e.target.checked;
});

/* ---------------- Ruang ujian (proktor) ---------------- */
var RU={sesi:'',d:null,t0:0,err:'',busy:false,menit:15,max:120,muat:false};
function sesiList(){
 var l=(typeof BS!=='undefined'&&BS.D&&BS.D.sesi||[]).filter(function(x){return x.aktif!==false&&(typeof schAkunOk!=='function'||schAkunOk(x))});
 var rank={on:0,soon:1,end:2};
 return l.sort(function(a,b){var ka=rank[bsSesiStatus(a).k],kb=rank[bsSesiStatus(b).k];return (ka-kb)||((b.mulai||0)-(a.mulai||0))});
}
function pilihSesi(){
 var l=sesiList();if(!RU.sesi||!l.some(function(x){return x.id===RU.sesi}))RU.sesi=l.length?l[0].id:'';
 return l;
}
async function ruMuat(){
 if(RU.busy||!RU.sesi)return;
 if(navigator.onLine===false){RU.err='Offline: data tidak dapat dimuat';ruPaint();return}
 RU.busy=true;var id=RU.sesi;
 try{var j=await cbtFn({action:'pantau',sesiId:id});if(id===RU.sesi){RU.d=j;RU.t0=Date.now();RU.err=''}}
 catch(e){RU.err=(e&&e.message)||String(e)}
 RU.busy=false;ruPaint();
}
async function ruAksi(body,ok){
 try{await cbtFn(body);if(ok)toast(ok);RU.busy=false;await ruMuat()}
 catch(e){toast('Gagal: '+((e&&e.message)||e))}
}
var URUTK={lock:0,on:1,habis:2,belum:3,done:4};
function ruBody(){
 var d=RU.d,h='';
 if(!RU.sesi)return '<p class="muted">Belum ada sesi ujian aktif.</p>';
 if(!d)return '<p class="note">'+(RU.err?'Gagal memuat: '+esc(RU.err):'Memuat…')+'</p>';
 var tk=d.tok,sisa=tk.sisa?Math.max(0,tk.sisa-Math.round((Date.now()-RU.t0)/1000)):0;
 if(!tk.pakai)h+='<div class="card center"><span class="label">Token</span><p class="note">Sesi ini tidak memakai token.</p></div>';
 else if(!tk.wajib)h+='<div class="card center"><span class="label">Token tetap</span><div class="bs-token mono">'+esc(tk.token||'—')+'</div><p class="note">Sesi ini memakai token tetap tanpa rilis.</p></div>';
 else h+='<div class="card center"><span class="label">Token sesi</span>'+
  (sisa>0?'<div class="bs-token mono">'+esc(tk.token)+'</div><p class="note">Berlaku <b class="mono" id="ru-tsisa" data-s="'+sisa+'" data-t="'+Date.now()+'">'+mmss(sisa)+'</b> lagi. Bacakan ke peserta.</p><div class="row"><button type="button" class="btn small" data-ru="rilis">Rilis ulang '+RU.menit+' mnt</button><button type="button" class="btn small danger" data-ru="tutup">Tutup token</button></div>'
  :'<div class="bs-token mono">—</div><p class="note">Token belum dirilis atau sudah ditutup. Peserta yang belum mulai belum bisa masuk.</p><div class="row"><button type="button" class="btn small primary" data-ru="rilis">Rilis token '+RU.menit+' mnt</button></div>')+
  '<label class="f" style="margin-top:8px">Masa berlaku<select id="ru-menit">'+[5,10,15,30,60].map(function(m){return '<option value="'+m+'"'+(RU.menit===m?' selected':'')+'>'+m+' menit</option>'}).join('')+'</select></label></div>';
 var c={belum:0,on:0,lock:0,habis:0,done:0};d.peserta.forEach(function(p){c[p.k]++});
 h+='<div class="stats">'+[['Belum','belum'],['Mengerjakan','on'],['Selesai','done'],['Terkunci','lock'],['Habis','habis']].map(function(x){return '<div class="card"><span class="label">'+x[0]+'</span><b class="mono">'+c[x[1]]+'</b></div>'}).join('')+'</div>';
 if(d.saya&&d.saya.length)h+='<p class="note">Ruang yang kamu awasi: <b>'+d.saya.map(esc).join(', ')+'</b></p>';
 h+='<div class="row"><button type="button" class="btn small" data-ru="muat">Muat ulang</button></div>';
 h+='<p class="note">'+(RU.err?'Gagal memuat: '+esc(RU.err):'Diperbarui '+jam(RU.t0)+' · otomatis tiap 8 detik')+'</p>';
 if(!d.peserta.length)return h+'<p class="muted">Tidak ada siswa terdaftar untuk sesi ini.</p>';
 var rows=d.peserta.slice().sort(function(a,b){return (URUTK[a.k]-URUTK[b.k])||a.nama.localeCompare(b.nama,'id')}),lm=150;
 h+=rows.slice(0,lm).map(function(p){
  var T={belum:['Belum mulai','plain'],on:['Mengerjakan','warn'],lock:['Terkunci','bad'],habis:[p.stop?'Diakhiri':'Waktu habis','warn'],done:['Selesai','ok']}[p.k],line='',act='';
  if(p.k==='on'||p.k==='lock'||p.k==='habis'){
   var s2=p.sisa-Math.round((Date.now()-RU.t0)/1000);
   line='<p class="note">Terjawab '+p.ans+'/'+p.tot+' · sisa '+mmss(s2)+(p.ext?' (+'+Math.round(p.ext/60)+' mnt)':'')+' · keluar halaman '+p.v+(d.batas?'/'+d.batas:'')+' · aktif '+p.seen+' dtk lalu'+(p.k==='on'&&p.seen>150?' <b>(tidak aktif)</b>':'')+'</p>';
   act='<button type="button" class="btn small" data-ru="tambah" data-rid="'+esc(p.rid)+'" data-n="300">+5 mnt</button><button type="button" class="btn small" data-ru="tambah" data-rid="'+esc(p.rid)+'" data-n="900">+15 mnt</button>';
   if(p.v>0||p.k==='lock')act+='<button type="button" class="btn small" data-ru="buka" data-rid="'+esc(p.rid)+'">Buka kunci</button>';
   if(p.k==='on'||p.k==='lock')act+='<button type="button" class="btn small'+(p.izin>0?' primary':'')+'" data-ru="pindah" data-rid="'+esc(p.rid)+'" data-nm="'+esc(p.nama)+'">'+(p.izin>0?'Izin pindah aktif':'Izinkan pindah perangkat')+'</button>';
   if(!p.stop)act+='<button type="button" class="btn small danger" data-ru="akhiri" data-rid="'+esc(p.rid)+'" data-nm="'+esc(p.nama)+'">Akhiri</button>';
  }
  return '<div class="card"><div class="row sb"><b>'+esc(p.nama)+'</b><span class="pill '+T[1]+'">'+T[0]+'</span></div><p class="note">'+(p.no?'<b class="mono">'+esc(p.no)+'</b> · ':'')+'Kelas '+esc(p.kelas||'-')+(p.ruang?' · '+esc(p.ruang)+(p.gel?' · gelombang '+esc(p.gel):''):'')+'</p>'+line+(act?'<div class="row">'+act+'</div>':'')+'</div>';
 }).join('')+(rows.length>lm?'<p class="note">Menampilkan '+lm+' dari '+rows.length+' peserta (yang perlu perhatian di atas).</p>':'');
 return h;
}
function ruPaint(){var el=document.getElementById('ru-body');if(el)el.innerHTML=ruBody()}
function viewRuang(){
 var l=pilihSesi();
 if(typeof BS!=='undefined'&&!BS.loaded&&!BS.loading&&typeof bsLoad==='function')setTimeout(function(){try{bsLoad()}catch(e){}},0);
 if(RU.sesi&&!RU.d&&!RU.busy&&!RU.muat){RU.muat=true;setTimeout(function(){RU.muat=false;ruMuat()},0)}
 var sel=l.length?'<label class="f">Sesi ujian<select id="ru-sesi">'+l.map(function(x){var st=bsSesiStatus(x);return '<option value="'+esc(x.id)+'"'+(x.id===RU.sesi?' selected':'')+'>'+esc(x.judul)+' · '+(x.kelas==='ALL'||!x.kelas?'semua kelas':x.kelas)+' · '+st.t+'</option>'}).join('')+'</select></label>':'';
 return '<div class="row sb"><h2>Ruang ujian</h2><span class="pill ok">Proktor</span></div>'+
  '<section class="card"><p class="note">Merilis token dan memantau peserta. Jawaban, kunci, dan nilai tidak ditampilkan di sini. Semua aksi tercatat di log audit.</p>'+sel+'</section><div id="ru-body">'+ruBody()+'</div>';
}
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.id)return;
 if(t.id==='ru-sesi'){RU.sesi=t.value;RU.d=null;RU.err='';ruPaint();ruMuat()}
 else if(t.id==='ru-menit'){RU.menit=+t.value||15;ruPaint()}
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-ru]');if(!b||!isPk())return;
 var a=b.dataset.ru,rid=b.dataset.rid;
 if(a==='muat')ruMuat();
 else if(a==='rilis')ruAksi({action:'rilisToken',sesiId:RU.sesi,menit:RU.menit},'Token dirilis');
 else if(a==='tutup')uiConfirm('Tutup token? Peserta yang belum mulai tidak bisa masuk sampai token dirilis lagi.',{ok:'Tutup token'}).then(function(ok){if(ok)ruAksi({action:'rilisToken',sesiId:RU.sesi,menit:0},'Token ditutup')});
 else if(a==='tambah')ruAksi({action:'aksiRun',rid:rid,op:'tambah',detik:+b.dataset.n},'Waktu ditambah');
 else if(a==='buka')ruAksi({action:'aksiRun',rid:rid,op:'bukaKunci'},'Kunci dibuka');
 else if(a==='pindah')uiConfirm('Izinkan '+(b.dataset.nm||'siswa ini')+' melanjutkan ujian dari perangkat lain? Izin berlaku 10 menit dan perangkat lama berhenti menyimpan jawaban setelah siswa pindah.',{ok:'Izinkan'}).then(function(ok){if(ok)ruAksi({action:'aksiRun',rid:rid,op:'izinPindah'},'Izin pindah perangkat 10 menit')});
 else if(a==='akhiri')uiConfirm('Akhiri ujian '+(b.dataset.nm||'siswa ini')+'? Jawabannya dikirim otomatis dan tidak bisa dilanjutkan.',{ok:'Akhiri',danger:true}).then(function(ok){if(ok)ruAksi({action:'aksiRun',rid:rid,op:'akhiri'},'Siswa akan mengirim jawabannya dalam beberapa detik')});
});
/* guru/admin: rilis dan tutup token dari Pantau (tombol dibuat cbt-staf.js) */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs="pn-rilis"],[data-bs="pn-tutup"]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 var rilis=b.dataset.bs==='pn-rilis',sid=(window.PNref&&PNref.sesi)||'';
 if(!sid||sid==='ALL')return;
 cbtFn({action:'rilisToken',sesiId:sid,menit:rilis?(+b.dataset.n||15):0}).then(function(j){
  BS.tkR=BS.tkR||{};BS.tkR[sid]={rilis:j.rilis||0,berlaku:j.berlaku||0};toast(rilis?'Token dirilis':'Token ditutup');render();
 }).catch(function(er){toast('Gagal: '+((er&&er.message)||er))});
},true);
/* ketukan 1 detik: hitung mundur token, dan muat ulang tiap 8 detik */
var tick=0;
setInterval(function(){
 try{
  var el=document.getElementById('ru-tsisa');
  if(el){var s=Math.max(0,(+el.dataset.s)-Math.round((Date.now()-(+el.dataset.t))/1000));el.textContent=mmss(s)}
  if(!isPk()||S.tab!=='ruangujian'||document.hidden)return;
  if(++tick>=8){tick=0;ruMuat()}
 }catch(e){}
},1000);

/* ---------------- Log audit (admin) ---------------- */
var AU={rows:[],err:'',busy:false,q:'',loaded:false};
var LAB={'token.rilis':'Rilis token','token.tutup':'Tutup token','token.ganti':'Ganti token','token.blokir':'Token salah: akun diblokir','token.bukaTebak':'Buka blokir token','run.tambah':'Tambah waktu','run.bukaKunci':'Buka kunci','run.akhiri':'Akhiri ujian siswa',
 'nilai.akhiri':'Nilai ujian siswa','nilai.akhiriSemua':'Nilai ujian yang berakhir','nilai.ulang':'Nilai ulang sesi','nilai.uraian':'Nilai soal uraian'};
var KOL={soal_run:'catatan ujian',soal_hasil:'hasil ujian/latihan',soal_sesi:'sesi ujian',banksoal:'soal',hasil:'nilai',lkpd:'LKPD',lkpd_bukti:'bukti LKPD',akun:'akun'};
function aksiLabel(a){
 if(LAB[a])return LAB[a];
 var m=/^klien\.(hapus|ubah|buat)\.(.+)$/.exec(a);
 if(m)return ({hapus:'Hapus',ubah:'Ubah',buat:'Buat'})[m[1]]+' '+(KOL[m[2]]||m[2]);
 if(a==='klien.token.ganti')return LAB['token.ganti'];
 return a.replace(/^klien\./,'');
}
async function auMuat(){
 if(AU.busy)return;AU.busy=true;AU.err='';
 try{
  var r=await Cloud.db.listDocuments(CFG.DB,'audit',[Appwrite.Query.orderDesc('$createdAt'),Appwrite.Query.limit(300)]);
  AU.rows=r.documents;AU.loaded=true;
 }catch(e){
  AU.err=(e&&e.code===404)||/not found|could not be found/i.test((e&&e.message)||'')?'Koleksi audit belum dibuat. Jalankan: node tools/setup-appwrite.mjs --sync-izin':((e&&e.message)||String(e));
  AU.loaded=true;
 }
 AU.busy=false;render();
}
function viewAudit(){
 if(!AU.loaded&&!AU.busy)setTimeout(auMuat,0);
 var q=AU.q.trim().toLowerCase(),sj={};try{BS.D.sesi.forEach(function(s){sj[s.id]=s.judul})}catch(e){}
 var rows=AU.rows.filter(function(d){return !q||[d.nama,d.peran,aksiLabel(d.aksi),d.target,d.ket,sj[d.sesiId]].join(' ').toLowerCase().indexOf(q)>-1});
 var list=rows.map(function(d){
  return '<div class="card"><div class="row sb"><b>'+esc(aksiLabel(d.aksi))+'</b><span class="note">'+esc(new Date(d.ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}))+'</span></div>'+
   '<p class="note">Oleh <b>'+esc(d.nama||'-')+'</b>'+(d.peran?' ('+esc(d.peran)+')':'')+(d.target?' · '+esc(d.target):'')+(sj[d.sesiId]?' · '+esc(sj[d.sesiId]):'')+'</p>'+(d.ket?'<p class="note">'+esc(d.ket)+'</p>':'')+'</div>';
 }).join('');
 return '<div class="row sb"><h2>Log audit</h2><span class="pill bad">Admin</span></div>'+
  '<section class="card"><p class="note">Aksi guru, proktor, dan admin pada ujian dan nilai: token, waktu, kunci, penilaian, serta penghapusan dan perubahan data. Maksimal 300 catatan terbaru. Catatan tidak bisa diubah atau dihapus dari aplikasi.</p>'+
  '<div class="row"><input id="au-q" type="search" placeholder="Cari nama, aksi, atau sesi" value="'+esc(AU.q)+'" style="flex:1"><button type="button" class="btn small" data-au="muat">Segarkan</button></div></section>'+
  (AU.err?'<p class="note">'+esc(AU.err)+'</p>':'')+
  (AU.busy&&!AU.rows.length?'<p class="note">Memuat…</p>':(list||(AU.err?'':'<p class="muted">Belum ada catatan.</p>')));
}
document.addEventListener('input',function(e){if(e.target&&e.target.id==='au-q'){AU.q=e.target.value;var p=e.target.selectionStart;render();var n=document.getElementById('au-q');if(n){n.focus();try{n.setSelectionRange(p,p)}catch(x){}}}});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-au="muat"]');if(b){AU.loaded=false;AU.rows=[];auMuat()}});

/* ---------------- Tampilan dan menu ---------------- */
var _vk=viewKatalog;
viewKatalog=function(){
 if(S.tab==='ruangujian'&&isPk())return viewRuang();
 if(S.tab==='logaudit'&&isAdm())return viewAudit();
 return _vk.apply(this,arguments);
};
var _enter=enter;
enter=function(u){_enter.apply(this,arguments);try{if(isPk())S.tab='ruangujian'}catch(e){}};
var _render=render;
render=function(){
 _render.apply(this,arguments);
 try{
  if(!S.user)return;
  var sb=document.querySelector('.sbody');if(!sb)return;
  var cur=V.mode==='list'?S.tab:'';
  function baris(v,ic,jd,ket){return '<button type="button" class="srow" data-act="menu" data-v="'+v+'"'+(cur===v?' aria-current="page"':'')+'><span class="ico">'+svg(ic,22)+'</span><span class="st"><b>'+jd+'</b><small>'+ket+'</small></span></button>'}
  if(isPk()&&!sb.querySelector('[data-v="ruangujian"]'))sb.insertAdjacentHTML('beforeend',baris('ruangujian',ICO.cbtonline,'Ruang ujian','Token dan pantau peserta'));
  if(isAdm()&&!sb.querySelector('[data-v="logaudit"]'))sb.insertAdjacentHTML('beforeend',baris('logaudit',ICO.hapus||ICO.cbtonline,'Log audit','Riwayat aksi guru dan proktor'));
 }catch(e){}
};

/* ---------------- Pencatatan aksi di perangkat ke audit ---------------- */
var AUD={buf:{},timer:0},HIT={soal_run:{update:'ubah',delete:'hapus'},soal_hasil:{delete:'hapus'},soal_sesi:{create:'buat',update:'ubah',delete:'hapus'},banksoal:{delete:'hapus'},hasil:{delete:'hapus'},lkpd:{delete:'hapus'},lkpd_bukti:{delete:'hapus'},akun:{create:'buat',update:'ubah',delete:'hapus'}};
function catat(op,col,id,data){
 try{
  if(!S.user||actRole()==='siswa'||typeof cbtFn!=='function')return;
  var aksi;
  if(col==='soal_kunci'){if(String(id).indexOf('tk_')!==0||op==='delete')return;aksi='token.ganti'}
  else{var o=HIT[col]&&HIT[col][op];if(!o)return;aksi=o+'.'+col}
  var b=AUD.buf[aksi]||(AUD.buf[aksi]={n:0,ids:[]});b.n++;
  var nm=col==='akun'&&S.users?(S.users.filter(function(u){return u.id===id})[0]||{}).nama:'';
  if(b.ids.length<3)b.ids.push(nm||String(id).slice(0,14)+(col==='soal_run'&&data?' '+JSON.stringify(data).slice(0,40):''));
  clearTimeout(AUD.timer);AUD.timer=setTimeout(kirim,2500);
 }catch(e){}
}
function kirim(){
 var buf=AUD.buf;AUD.buf={};
 Object.keys(buf).forEach(function(a){
  var b=buf[a];
  cbtFn({action:'catat',aksi:a,ket:b.n+' data'+(b.ids.length?': '+b.ids.join(', ')+(b.n>b.ids.length?', …':''):'')}).catch(function(){});
 });
}
if(typeof Cloud!=='undefined'){
 var i0=Cloud.init;
 Cloud.init=function(){
  i0.apply(this,arguments);
  var db=this.db;if(!db)return;
  [['createDocument','create'],['updateDocument','update'],['deleteDocument','delete']].forEach(function(m){
   var f=db[m[0]];if(typeof f!=='function')return;
   db[m[0]]=function(){
    var a=arguments,p=f.apply(db,a);
    if(p&&typeof p.then==='function')p.then(function(){catat(m[1],a[1],a[2],m[1]==='delete'?null:a[3]&&typeof a[3]==='object'?a[3]:null)},function(){});
    return p;
   };
  });
 };
}
window.__pengawas={RU:RU,AU:AU,ruBody:ruBody,viewAudit:viewAudit,aksiLabel:aksiLabel,catat:catat,kirim:kirim,AUD:AUD};
})();
