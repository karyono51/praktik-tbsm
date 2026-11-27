/* soal-gambar.js: gambar pada soal dan pada pilihan jawaban (PG dan PG kompleks). PG kategori: hanya soalnya.
   - Gambar dipilih dari galeri atau kamera, dikecilkan otomatis (sisi terpanjang 800 px) memakai ldCompress dari lkpd-drive.js.
   - Disimpan di Google Drive lewat fungsi foto-drive (aksi upload kind:'soal' hanya guru/admin; aksi getsoal boleh dibaca semua pengguna login).
   - Di soal hanya tersimpan penanda: q.qi (gambar soal) dan q.oi (daftar 5 gambar pilihan), bernilai '' atau 'drive:<fileId>'.
     Sebelum terunggah, penandanya 'tmp:<id>' dan gambarnya ada di IndexedDB perangkat guru.
   - Semua gambar yang sudah dimuat disimpan di IndexedDB perangkat (tbsm-soal-img), jadi ujian yang sedang berjalan tetap utuh saat offline.
   Bergantung pada: banksoal.js, lkpd-drive.js (ldCompress, ldCall, LD). */
var SG={mem:{},loading:{},failed:{},dbp:null,SIDE:800,MAXC:100000};

/* ---------- IndexedDB ---------- */
function sgDb(){
 if(SG.dbp)return SG.dbp;
 SG.dbp=new Promise(function(res){
  try{
   var rq=indexedDB.open('tbsm-soal-img',1);
   rq.onupgradeneeded=function(){rq.result.createObjectStore('img')};
   rq.onsuccess=function(){res(rq.result)};
   rq.onerror=function(){res(null)};
  }catch(e){res(null)}
 });
 return SG.dbp;
}
function sgGet(k){
 return sgDb().then(function(db){return new Promise(function(res){
  if(!db)return res(null);
  try{var r=db.transaction('img').objectStore('img').get(k);r.onsuccess=function(){res(r.result||null)};r.onerror=function(){res(null)}}catch(e){res(null)}
 })});
}
function sgPut(k,v){
 SG.mem[k]=v;
 return sgDb().then(function(db){return new Promise(function(res){
  if(!db)return res(false);
  try{var t=db.transaction('img','readwrite');t.objectStore('img').put(v,k);t.oncomplete=function(){res(true)};t.onerror=function(){res(false)};t.onabort=function(){res(false)}}catch(e){res(false)}
 })});
}

/* ---------- Penanda gambar ---------- */
function sgIsData(r){return typeof r==='string'&&r.indexOf('data:image/')===0}
function sgKey(r){return String(r||'').replace(/^drive:/,'')}
function sgRefs(q){
 var a=[];if(!q)return a;
 if(q.qi)a.push(q.qi);
 if(Array.isArray(q.oi))q.oi.forEach(function(x){if(x)a.push(x)});
 return a;
}
function sgAda(q){return sgRefs(q).length>0}
function sgOpt(q,i){return (q&&Array.isArray(q.oi)&&q.oi[i])||''}
/* pilihan dianggap terisi bila ada teks atau gambar */
function sgOptIsi(q,i){return !!(String(q.opts&&q.opts[i]||'').trim()||sgOpt(q,i))}

/* ---------- Memuat gambar ---------- */
function sgResolve(ref){
 if(!ref)return Promise.resolve(null);
 if(sgIsData(ref))return Promise.resolve(ref);
 var k=sgKey(ref);
 if(SG.mem[k])return Promise.resolve(SG.mem[k]);
 return sgGet(k).then(function(v){
  if(v){SG.mem[k]=v;return v}
  if(ref.indexOf('drive:')!==0)return null;
  if(!(window.Cloud&&Cloud.on)||navigator.onLine===false)return null;
  if(SG.failed[k]&&Date.now()-SG.failed[k]<30000)return null;
  if(!SG.loading[k]){
   SG.loading[k]=ldCall({action:'getsoal',fileId:k}).then(function(r){SG.failed[k]=0;return sgPut(k,r.data).then(function(){return r.data})})
    .catch(function(){SG.failed[k]=Date.now();return null})
    .then(function(d){delete SG.loading[k];return d});
  }
  return SG.loading[k];
 });
}
function sgPaint(k,src){
 document.querySelectorAll('img[data-sg="'+k+'"]').forEach(function(im){
  if(src){im.src=src;im.classList.remove('ld-wait','ld-fail')}else{im.classList.remove('ld-wait');im.classList.add('ld-fail');im.alt='Gambar tidak dapat dimuat'}
 });
}
function sgLoad(k,ref){sgResolve(ref).then(function(d){sgPaint(k,d)})}
/* <img> untuk satu gambar. cls berisi kelas tambahan; kelas ld-zoom membuat gambar bisa diperbesar. */
function sgImg(ref,cls,alt){
 if(!ref)return '';
 var a=esc(alt||'Gambar soal');
 if(sgIsData(ref))return '<img class="'+cls+'" src="'+ref+'" alt="'+a+'">';
 var k=sgKey(ref),src=SG.mem[k]||'';
 if(!src)sgLoad(k,ref);
 return '<img data-sg="'+esc(k)+'" class="'+cls+(src?'':' ld-wait')+'" src="'+(src||(typeof LD_BLANK!=='undefined'?LD_BLANK:'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='))+'" alt="'+a+'">';
}
function sgQHtml(q){return q&&q.qi?'<div class="sg-qwrap">'+sgImg(q.qi,'sg-q ld-zoom','Gambar soal')+'</div>':''}
/* isi satu pilihan: teks dan/atau gambar (di dalam <span>) */
function sgOptHtml(q,i){
 var t=String(q.opts&&q.opts[i]||''),g=sgOpt(q,i);
 return (t?'<span class="sg-t">'+esc(t)+'</span>':'')+(g?sgImg(g,'sg-o','Gambar pilihan '+String.fromCharCode(65+i)):'');
}

/* ---------- Siapkan untuk offline ---------- */
/* Muat semua gambar soal yang dipakai satu percobaan. Selesai bila semua sudah ada di perangkat, atau waktu habis. */
function sgPrefetch(ids,ms){
 var refs=[];
 (ids||[]).forEach(function(id){var q=bsSoalById(id);sgRefs(q).forEach(function(r){if(refs.indexOf(r)<0)refs.push(r)})});
 if(!refs.length)return Promise.resolve({n:0,gagal:0});
 var gagal=0,i=0,pekerja=4;
 function jalan(){
  if(i>=refs.length)return Promise.resolve();
  var r=refs[i++];
  return sgResolve(r).then(function(d){if(!d)gagal++;return jalan()});
 }
 var all=Promise.all(new Array(Math.min(pekerja,refs.length)).fill(0).map(jalan)).then(function(){return {n:refs.length,gagal:gagal}});
 var tunggu=new Promise(function(res){setTimeout(function(){res({n:refs.length,gagal:-1})},ms||20000)});
 return Promise.race([all,tunggu]);
}

/* ---------- Unggah ke Drive ---------- */
function sgSlug(s,n){return typeof ldSlug==='function'?ldSlug(s,n):String(s||'').replace(/[^A-Za-z0-9]+/g,'-').slice(0,n)}
/* ganti data: dan tmp: menjadi drive:<id>; kembalikan true bila ada yang berubah */
async function sgUploadRef(ref,nama){
 if(!ref||ref.indexOf('drive:')===0)return ref;
 var data=sgIsData(ref)?ref:await sgGet(sgKey(ref));
 if(!data)throw new Error('Gambar di perangkat tidak ditemukan. Pilih ulang gambarnya lewat Ubah soal.');
 var r=await ldCall({action:'upload',kind:'soal',data:data,nama:nama});
 await sgPut(r.fileId,data);
 return 'drive:'+r.fileId;
}
async function sgUploadAll(o){
 var ubah=false,base='Soal_'+sgSlug(o.mapel,20)+'_'+sgSlug(String(o.id).slice(-6),6);
 if(o.qi&&o.qi.indexOf('drive:')!==0){o.qi=await sgUploadRef(o.qi,base+'_soal');ubah=true}
 if(Array.isArray(o.oi)){
  for(var i=0;i<o.oi.length;i++){
   if(o.oi[i]&&o.oi[i].indexOf('drive:')!==0){o.oi[i]=await sgUploadRef(o.oi[i],base+'_'+String.fromCharCode(97+i));ubah=true}
  }
 }
 return ubah;
}
/* Pasang di jalur kirim soal: unggah gambar dulu, lalu kirim dokumen soal dengan penanda drive:. Gagal unggah: soal tetap di antrean. */
var _sgBsRemote=bsRemote;
bsRemote=async function(k,o){
 if(k==='soal'&&Cloud.on&&sgAda(o)&&sgRefs(o).some(function(r){return r.indexOf('drive:')!==0})){
  try{if(await sgUploadAll(o)){bsPack('soal',o)}}
  catch(e){
   o.err='Gambar: '+((e&&e.message)||e);
   if(navigator.onLine===false||bsRetryable(e)){bsQueueAdd(k,o.id)}
   else{o.bad=1;toast('Gambar soal gagal diunggah: '+((e&&e.message)||e))}
   bsSaveLocal();
   return false;
  }
 }
 return _sgBsRemote.apply(this,arguments);
};

/* Simpan gambar baru di IndexedDB dan ganti data: dengan tmp:<id> sebelum soal disimpan (localStorage tidak dipenuhi gambar). */
async function sgStash(o){
 async function satu(r){
  if(!sgIsData(r))return r||'';
  var id='tmp:'+uid();
  var ok=await sgPut(id,r);
  return ok?id:r;
 }
 if(o.qi)o.qi=await satu(o.qi);
 if(Array.isArray(o.oi)){for(var i=0;i<o.oi.length;i++)o.oi[i]=await satu(o.oi[i])}
 return o;
}

/* ---------- Mulai ujian: simpan semua gambar soal di perangkat ---------- */
/* Tidak menunda mulai ujian (waktu ujian sudah berjalan): gambar dimuat paralel di latar belakang dan tampil begitu siap.
   Setelah tersimpan di IndexedDB, ujian tetap utuh walau sinyal hilang. */
var _sgBsStartRun=bsStartRun;
bsStartRun=function(r){
 var out=_sgBsStartRun.apply(this,arguments);
 try{
  var perlu=(r.ids||[]).some(function(id){return sgRefs(bsSoalById(id)).some(function(x){return !SG.mem[sgKey(x)]})});
  if(perlu)sgPrefetch(r.ids,30000).then(function(h){if(h&&h.gagal!==0&&BS.run===r)toast('Sebagian gambar soal belum termuat. Pastikan sinyal baik.')});
 }catch(e){}
 return out;
};
/* ujian yang dilanjutkan setelah aplikasi dibuka ulang */
var _sgBsResume=bsResume;
bsResume=function(){
 var r=_sgBsResume.apply(this,arguments);
 if(BS.run&&BS.run.ids)sgPrefetch(BS.run.ids,20000);
 return r;
};

/* ---------- Form soal: pilih gambar ---------- */
function sgPilih(cb){
 var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.style.display='none';
 inp.addEventListener('change',function(){
  var f=inp.files&&inp.files[0];inp.remove();if(!f)return;
  if(typeof ldCompress!=='function'){toast('Pengolah gambar belum siap. Muat ulang aplikasi.');return}
  var s0=LD.SIDE,m0=LD.MAXC;LD.SIDE=SG.SIDE;LD.MAXC=SG.MAXC;
  ldCompress(f,function(d){LD.SIDE=s0;LD.MAXC=m0;if(!d){toast('Gambar tidak dapat diproses. Coba gambar lain.');return}cb(d)});
 });
 document.body.appendChild(inp);inp.click();
}
/* kotak gambar di form: w = 'q' (gambar soal) atau indeks pilihan 0..4 */
function sgFormBox(f,w){
 var ref=w==='q'?f.qi:(f.oi&&f.oi[w])||'',lbl=w==='q'?'gambar soal':'gambar pilihan '+bsLtr(w);
 var h='<div class="sg-box">';
 if(ref)h+=sgImg(ref,'sg-th ld-zoom','Pratinjau '+lbl);
 h+='<button type="button" class="btn small" data-bs="sgpilih" data-v="'+w+'">'+(ref?'Ganti':'Tambah')+' '+lbl+'</button>';
 if(ref)h+='<button type="button" class="btn small danger" data-bs="sghapus" data-v="'+w+'">Hapus</button>';
 return h+'</div>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs="sgpilih"],[data-bs="sghapus"]');
 if(!b||!BS.form)return;
 e.stopImmediatePropagation();
 var w=b.dataset.v==='q'?'q':+b.dataset.v,f=BS.form;
 bsFormRead();
 if(!Array.isArray(f.oi))f.oi=['','','','',''];
 if(b.dataset.bs==='sghapus'){if(w==='q')f.qi='';else f.oi[w]='';render();return}
 sgPilih(function(d){bsFormRead();if(w==='q')f.qi=d;else f.oi[w]=d;render()});
},true);

/* ---------- Ekspor Excel: gambar tidak ikut ---------- */
if(typeof bsioExport==='function'){
 var _sgExp=bsioExport;
 bsioExport=function(){
  var n=0;try{n=bsFiltered().filter(sgAda).length}catch(e){}
  var r=_sgExp.apply(this,arguments);
  if(n)setTimeout(function(){toast(n+' soal punya gambar. Gambar tidak ikut diekspor ke Excel.')},1800);
  return r;
 };
}

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='.sg-qwrap{margin:6px 0 10px}.sg-q{display:block;max-width:100%;max-height:320px;object-fit:contain;border-radius:10px;border:1px solid var(--line);background:#fff;cursor:zoom-in}'+
  '.bs-opt .sg-t{display:block}.sg-o{display:block;max-width:100%;max-height:170px;object-fit:contain;border-radius:8px;margin-top:4px;background:#fff}.bs-opt .sg-t+.sg-o{margin-top:6px}'+
  '.bs-orow{align-items:flex-start!important}.bs-orow input[type=radio],.bs-orow input[type=checkbox]{margin:30px 0 0!important}.bs-orow .grow{flex:1;min-width:0}'+
  '.sg-box{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:2px 0 10px}.sg-th{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--line);cursor:zoom-in}'+
  '.sg-q.ld-wait,.sg-o.ld-wait{min-height:90px;min-width:140px;background:var(--line);animation:ldp 1.2s ease-in-out infinite}.sg-q.ld-fail,.sg-o.ld-fail{min-height:60px;min-width:140px;background:var(--line)}';
 document.head.appendChild(s);
})();
