/* Pra-unduh soal (siswa): menyiapkan soal sesi ujian di perangkat SEBELUM token dirilis dan ujian dimulai.
   Yang diunduh: gambar soal dan pilihan (dari Drive lewat fungsi foto-drive, disimpan di IndexedDB oleh soal-gambar.js)
   serta salinan terbaru teks soal dari Bank soal. Tujuannya: saat ratusan siswa menekan Mulai bersamaan, tidak ada lagi
   antrean unduh gambar, dan ujian tetap utuh bila sinyal putus di tengah jalan.
   Yang TIDAK berubah: siapa yang boleh ikut, token, jadwal, dan pemilihan soal tetap diputuskan server saat Mulai.
   Kunci jawaban tidak pernah ikut diunduh. Tidak ada perubahan Appwrite.
   Bergantung pada: banksoal.js (BS, bsPool, bsSesiStatus), soal-gambar.js (sgRefs, sgResolve, SG), jam.js, cbt.js (bsMulaiUjian).
   Konfigurasi opsional di js/config.js: PRA_UNDUH_MENIT (bawaan 120): unduh otomatis dimulai sekian menit sebelum sesi dibuka. */
(function(){
'use strict';
var PD={st:{},busy:{},lastLoad:0,auto:{}};
var MAKS_GAMBAR=250,CAP_AUTO=120000,PEKERJA=4;
function e(v){return window.esc?esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid(){return window.S&&S.user?S.user.id:''}
function kunci(){return 'tbsm-pra-'+uid()}
function muat(){try{PD.st=JSON.parse(localStorage.getItem(kunci())||'{}')||{}}catch(x){PD.st={}}}
function simpan(){try{localStorage.setItem(kunci(),JSON.stringify(PD.st))}catch(x){}}
function awal(){var c=window.APP_CONFIG&&APP_CONFIG.PRA_UNDUH_MENIT;return (c===0?0:(+c||120))*60000}
function daring(){return navigator.onLine!==false&&window.Cloud&&Cloud.on}

/* soal yang mungkin dipakai sesi ini. Sesi manual: daftar guru. Sesi acak: seluruh pool yang cocok untuk kelas siswa
   (server memilih sebagian; mengunduh gambar pool lebih aman daripada menebak). */
function kandidat(s){
 var kelas=(window.S&&S.user&&S.user.kelas)||'',ids;
 if(s.pilih==='manual')ids=(s.ids||[]).filter(function(id){return !!bsSoalById(id)});
 else{
  var mf=s.mapelF||[];
  ids=bsPool('ujian',kelas).filter(function(q){return !mf.length||mf.indexOf(q.mapel)>-1}).map(function(q){return q.id});
 }
 return ids;
}
function refsOf(ids){
 var out=[];
 ids.forEach(function(id){var q=bsSoalById(id);if(!q)return;sgRefs(q).forEach(function(r){if(r&&String(r).indexOf('drive:')===0&&out.indexOf(r)<0)out.push(r)})});
 return out;
}
function sudahAda(ref){return !!SG.mem[sgKey(ref)]}

/* segarkan teks soal bila salinan di perangkat sudah lama (guru bisa mengubah soal setelah siswa masuk) */
async function segarkan(){
 if(!daring()||!window.bsLoad||BS.loading)return;
 if(Date.now()-PD.lastLoad<120000)return;
 PD.lastLoad=Date.now();
 try{await bsLoad()}catch(x){}
}

/* unduh semua gambar; opt.cap = batas waktu (ms). Mengembalikan {soal, n, gagal, ok} dan menyimpan status. */
async function siapkan(s,opt){
 opt=opt||{};
 if(!s||!uid())return null;
 if(PD.busy[s.id])return PD.busy[s.id].janji;
 var b={n:0,sel:0,janji:null};PD.busy[s.id]=b;
 b.janji=(async function(){
  var hasil={ts:Date.now(),soal:0,n:0,gagal:0,ok:false,potong:false};
  try{
   if(daring())await segarkan();
   var ids=kandidat(s);hasil.soal=ids.length;
   var refs=refsOf(ids);
   if(refs.length>MAKS_GAMBAR){refs=refs.slice(0,MAKS_GAMBAR);hasil.potong=true}
   hasil.n=refs.length;b.n=refs.length;
   if(!daring()&&refs.some(function(r){return !sudahAda(r)})){
    /* tanpa sinyal: hitung yang sudah ada di IndexedDB */
    var ada=0;
    for(var k=0;k<refs.length;k++){var v=await sgResolve(refs[k]);if(v)ada++}
    hasil.gagal=refs.length-ada;
   }else{
    var i=0;
    var kerja=async function(){
     while(i<refs.length){
      var r=refs[i++],d=null;
      try{d=await sgResolve(r)}catch(x){d=null}
      if(!d){hasil.gagal++}
      b.sel++;
      if(window.render&&opt.gambar!==false&&b.sel%5===0)ulang();
     }
    };
    var jalan=Promise.all(new Array(Math.min(PEKERJA,Math.max(1,refs.length))).fill(0).map(kerja));
    var tunggu=new Promise(function(res){setTimeout(function(){res('habis')},opt.cap||CAP_AUTO)});
    var r2=await Promise.race([jalan,tunggu]);
    if(r2==='habis'){hasil.gagal=Math.max(hasil.gagal,refs.filter(function(r){return !sudahAda(r)}).length)}
   }
   hasil.ok=hasil.gagal===0&&!hasil.potong;
  }catch(x){hasil.ok=false;hasil.gagal=hasil.gagal||1}
  PD.st[s.id]=hasil;simpan();
  delete PD.busy[s.id];
  ulang();
  return hasil;
 })();
 return b.janji;
}
var _ulang=0;
function ulang(){
 if(_ulang)return;
 _ulang=setTimeout(function(){_ulang=0;
  try{if(window.BS&&(BS.sub==='run'||BS.run))return;
   if(window.S&&(S.tab==='cbtonline'||S.tab==='banksoal')&&window.render)render()}catch(x){}
 },300);
}

function dilayani(s){return window.bsSesiStatus?bsSesiStatus(s):{k:'off'}}
function selesai(s){return BS.D.hasil.some(function(x){return x.sid===uid()&&x.sesiId===s.id&&x.mode==='ujian'})}
/* hanya sesi yang belum selesai, belum berakhir, dan dalam jendela unduh */
function layak(s){
 var st=dilayani(s);if(st.k==='off'||st.k==='end'||selesai(s))return false;
 if(st.k==='soon'&&s.mulai&&s.mulai-Jam.now()>awal())return false;
 return true;
}

/* baris status di kartu sesi (dipanggil banksoal.js) */
window.pdBaris=function(s,done){
 try{
  if(done||!window.S||!S.user||(window.actRole&&actRole()!=='siswa'))return '';
  var st=dilayani(s);if(st.k==='off'||st.k==='end')return '';
  if(!Object.keys(PD.st).length)muat();
  var b=PD.busy[s.id],h=PD.st[s.id];
  if(b)return '<p class="note pd-baris">Mengunduh soal… '+b.sel+' dari '+b.n+' gambar</p>';
  var ids=kandidat(s);
  if(!refsOf(ids).length&&!(h&&h.ok))return '';   /* sesi tanpa gambar: tidak ada yang perlu diunduh */
  var ts=h&&h.ts?new Date(h.ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'';
  if(h&&h.ok)return '<p class="note pd-baris"><span class="pill ok">Soal siap</span> '+(h.n?h.n+' gambar tersimpan di perangkat':'Tidak ada gambar')+' · '+ts+'. Sinyal tetap perlu untuk Mulai dan mengirim jawaban.</p>';
  var pesan=h?'<span class="pill warn">Belum lengkap</span> '+(h.gagal>0?h.gagal+' gambar belum terunduh. ':'')+(h.potong?'Soal terlalu banyak gambar untuk diunduh sekaligus. ':''):'<span class="pill plain">Belum diunduh</span> ';
  return '<div class="pd-baris"><p class="note">'+pesan+'</p><button type="button" class="btn" data-pd="siap" data-v="'+e(s.id)+'"'+(daring()?'':' disabled')+'>'+(h?'Coba lagi':'Siapkan soal')+'</button></div>';
 }catch(x){return ''}
};

document.addEventListener('click',function(ev){
 var t=ev.target.closest&&ev.target.closest('[data-pd]');if(!t)return;
 if(t.dataset.pd==='siap'){
  var s=BS.D.sesi.filter(function(x){return x.id===t.dataset.v})[0];if(!s)return;
  if(!daring()){toast('Tidak ada sinyal. Coba lagi saat tersambung.');return}
  toast('Mengunduh soal…');
  siapkan(s,{cap:120000}).then(function(h){
   if(!h)return;
   toast(h.ok?'Soal siap di perangkat':(h.gagal+' gambar belum terunduh. Coba lagi dengan sinyal lebih baik.'));
  });
 }
});

/* unduh otomatis: sesi yang akan dibuka (dalam jendela) atau sudah dibuka, sekali per sesi per pembukaan aplikasi */
function otomatis(){
 try{
  if(!window.S||!S.user||!window.BS||!BS.loaded||!daring())return;
  if(window.actRole&&actRole()!=='siswa')return;
  if(!Object.keys(PD.st).length)muat();
  var daftar=bsSesiUntuk(S.user.kelas||'').filter(layak);
  daftar.forEach(function(s){
   if(PD.auto[s.id]||PD.busy[s.id])return;
   var h=PD.st[s.id];
   if(h&&h.ok&&Date.now()-h.ts<6*3600000)return;
   PD.auto[s.id]=1;
   if(!refsOf(kandidat(s)).length){PD.st[s.id]={ts:Date.now(),soal:kandidat(s).length,n:0,gagal:0,ok:true,potong:false};simpan();return}
   siapkan(s,{cap:CAP_AUTO});
  });
 }catch(x){}
}
setInterval(otomatis,20000);
setTimeout(otomatis,4000);
window.addEventListener('online',function(){PD.auto={};setTimeout(otomatis,1500)});

/* Mulai ujian: bila gambar belum lengkap dan ada sinyal, selesaikan dulu (maks 25 detik) SEBELUM jam ujian berjalan. */
if(typeof window.bsMulaiUjian==='function'){
 var _mulai=window.bsMulaiUjian;
 window.bsMulaiUjian=async function(s,run){
  if(PD.gate)return;
  try{
   if(s&&daring()&&!BS.run){
    var h=PD.st[s.id];
    if(!(h&&h.ok)){
     var perlu=refsOf(kandidat(s)).some(function(r){return !sudahAda(r)});
     if(perlu){PD.gate=1;toast('Menyiapkan gambar soal…');try{await siapkan(s,{cap:25000,gambar:false})}finally{PD.gate=0}}
    }
   }
  }catch(x){}
  return _mulai.apply(this,arguments);
 };
}
window.pdSiapkan=siapkan;window.pdKandidat=kandidat;window.PD=PD;
})();
