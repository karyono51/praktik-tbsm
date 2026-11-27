/* ukk-gerbang-editor.js: editor soal Gerbang praktik UKK untuk guru dan admin (unit kelas X dan XI). Dimuat setelah ukk-gerbang.js.
   FUNGSI
     - Guru menyusun sendiri soal gerbang tiap unit: PG (2-5 pilihan, satu kunci), PG kompleks (3-5 pilihan, satu atau lebih kunci),
       PG kategori (2-8 pernyataan Benar/Salah). MAKSIMAL 20 SOAL per unit (UKG.MAX di ukk-gerbang.js), minimal 1 bila gerbang aktif.
     - Berlaku untuk unit UKK kelas X dan XI: bawaan (UKK-X-1, UKK-XI-1), unit buatan sendiri, dan hasil Duplikat.
     - Gerbang bisa dimatikan per unit (on:false): siswa langsung masuk unit.
   PENYIMPANAN
     - Soal disimpan DI DALAM dokumen unit (doc.gerbang = {on, soal, v}), sehingga ikut sinkronisasi lkpd_modules, antrean offline,
       dan penyimpanan lokal yang sama dengan unit (tanpa perubahan skema Appwrite). Penyimpanan lewat satu pintu ukkStore (validasi di bawah).
     - Tanpa doc.gerbang, unit memakai soal bawaan UKK_GERBANG (bila ada). doc.gerbang=null berarti "kembalikan ke bawaan / hapus gerbang buatan".
     - Draf otomatis di perangkat (localStorage tbsm-ukk-gerbang-draft), dapat dipulihkan saat editor dibuka lagi.
     - Jawaban siswa yang tersimpan memakai tanda tangan soal (ukgSig): bila soal, pilihan, atau kunci diubah, siswa mengerjakan gerbang lagi.
   Pratinjau memakai draf yang sedang diedit (belum perlu disimpan) dan memuat kunci serta pembahasan. */
var UGE={DKEY:'tbsm-ukk-gerbang-draft',LVL:['Pemahaman','Aplikasi','Penalaran'],MAXO:5,MAXR:8,MAXQ:1000,MAXOPT:300,MAXE:1500,st:null,timer:null};
(function(){var st=document.createElement('style');st.textContent=
'.uge-opt{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:4px 0}'+
'.uge-opt input[type=text]{width:100%;min-width:0}.uge-k{display:flex;align-items:center;gap:4px;font-size:13px}'+
'.uge-k input{width:22px;height:22px;accent-color:var(--accent,#0a7)}'+
'.uge-row{display:grid;gap:6px;padding:8px 0;border-top:1px solid var(--line,#ddd)}.uge-row textarea{width:100%}'+
'.uge-bad{color:var(--bad,#c33);font-size:13px;margin:0}.uge-nav{display:flex;gap:8px}.uge-nav .btn{flex:1}'+
'.uge-it .lks-acts{flex-wrap:wrap}';
document.head.appendChild(st)})();

/* ---------- Data soal ---------- */
function ugeCp(x){return JSON.parse(JSON.stringify(x))}
function ugeT(v){return String(v==null?'':v).trim()}
function ugeEl(){return document.getElementById('uge-ov')}
function ugeJob(id){return (typeof ukkJobBy==='function'&&ukkJobBy(id))||jobById(id)}
function ugeJenisNama(t){return t==='kompleks'?'PG kompleks':t==='kategori'?'PG kategori':'Pilihan ganda'}
function ugeBaru(t){
 if(t==='kompleks')return {t:'kompleks',lvl:'Penalaran',q:'',o:['','','',''],a:[],e:''};
 if(t==='kategori')return {t:'kategori',lvl:'Penalaran',q:'',rows:[['',true],['',false],['',true]],lab:['Benar','Salah'],e:''};
 return {t:'pg',lvl:'Aplikasi',q:'',o:['','','',''],a:-1,e:''};
}
/* Soal yang sedang berlaku untuk unit, sebagai bahan suntingan. */
function ugeAwal(j){
 var g=j.gerbang,src;
 if(g&&typeof g==='object')return {on:g.on!==false,soal:ugeCp(Array.isArray(g.soal)?g.soal:[])};
 src=(typeof UKK_GERBANG!=='undefined'&&UKK_GERBANG[j.id])||[];
 return {on:true,soal:ugeCp(src)};
}
function ugeCek(q){
 var t=lkqType(q),i,seen={};
 if(!ugeT(q.q))return 'Isi teks pertanyaan.';
 if(ugeT(q.q).length>UGE.MAXQ)return 'Pertanyaan maksimal '+UGE.MAXQ+' karakter.';
 if(String(q.e||'').length>UGE.MAXE)return 'Pembahasan maksimal '+UGE.MAXE+' karakter.';
 if(t==='kategori'){
  if(!Array.isArray(q.rows)||q.rows.length<2)return 'Isi minimal 2 pernyataan.';
  if(q.rows.length>UGE.MAXR)return 'Maksimal '+UGE.MAXR+' pernyataan.';
  for(i=0;i<q.rows.length;i++){
   if(!ugeT(q.rows[i][0]))return 'Pernyataan '+(i+1)+' masih kosong.';
   if(ugeT(q.rows[i][0]).length>UGE.MAXOPT)return 'Pernyataan '+(i+1)+' maksimal '+UGE.MAXOPT+' karakter.';
  }
  if(!q.rows.some(function(r){return r[1]===true})||!q.rows.some(function(r){return r[1]===false}))return 'Harus ada minimal satu pernyataan Benar dan satu Salah.';
  return '';
 }
 var min=t==='kompleks'?3:2;
 if(!Array.isArray(q.o)||q.o.length<min)return 'Isi minimal '+min+' pilihan.';
 if(q.o.length>UGE.MAXO)return 'Maksimal '+UGE.MAXO+' pilihan.';
 for(i=0;i<q.o.length;i++){
  var s=ugeT(q.o[i]);
  if(!s)return 'Pilihan '+'ABCDE'.charAt(i)+' masih kosong.';
  if(s.length>UGE.MAXOPT)return 'Pilihan '+'ABCDE'.charAt(i)+' maksimal '+UGE.MAXOPT+' karakter.';
  if(seen[s.toLowerCase()])return 'Ada dua pilihan yang sama.';
  seen[s.toLowerCase()]=1;
 }
 if(t==='kompleks'){
  if(!Array.isArray(q.a)||!q.a.length)return 'Centang minimal satu kunci jawaban.';
  if(!q.a.every(function(x){return Number.isInteger(x)&&x>=0&&x<q.o.length}))return 'Kunci jawaban tidak sah.';
 }else if(!Number.isInteger(q.a)||q.a<0||q.a>=q.o.length)return 'Pilih satu kunci jawaban.';
 return '';
}
/* Periksa seluruh daftar: {err, i} dengan i = nomor soal bermasalah (-1 bila masalahnya jumlah soal). */
function ugeCekSemua(on,soal){
 var i,e;
 if(!Array.isArray(soal))return {err:'Daftar soal tidak sah.',i:-1};
 if(soal.length>UKG.MAX)return {err:'Maksimal '+UKG.MAX+' soal per unit.',i:-1};
 if(on&&!soal.length)return {err:'Tambahkan minimal satu soal, atau matikan gerbang.',i:-1};
 for(i=0;i<soal.length;i++){e=ugeCek(soal[i]);if(e)return {err:'Soal '+(i+1)+': '+e,i:i}}
 return {err:'',i:-1};
}
function ugeBersih(q){
 var t=lkqType(q),o={t:t,lvl:UGE.LVL.indexOf(q.lvl)>-1?q.lvl:'Aplikasi',q:ugeT(q.q)};
 if(t==='kategori'){o.rows=q.rows.map(function(r){return [ugeT(r[0]),!!r[1]]});o.lab=['Benar','Salah']}
 else{o.o=q.o.map(ugeT);o.a=t==='kompleks'?q.a.slice().sort(function(x,y){return x-y}):q.a}
 o.e=ugeT(q.e);
 return o;
}
/* Pemeriksaan di pintu penyimpanan unit (ukkValidateDoc): berlaku juga bagi dokumen dari impor atau sinkronisasi lokal. */
function ugeCekDoc(d){
 var g=d&&d.gerbang;
 if(g===undefined||g===null)return '';
 if(typeof g!=='object'||Array.isArray(g))return 'Gerbang praktik tidak sah.';
 var c=ugeCekSemua(g.on!==false,g.soal);
 return c.err?'Gerbang praktik: '+c.err:'';
}

/* ---------- Draf di perangkat ---------- */
function ugeIsi(st){return JSON.stringify({on:!!st.on,soal:st.soal})}
function ugeKotor(st){return ugeIsi(st)!==st.snap}
function ugeDraftBuang(){clearTimeout(UGE.timer);try{localStorage.removeItem(UGE.DKEY)}catch(e){}}
function ugeDraftSimpan(){
 var st=UGE.st;clearTimeout(UGE.timer);if(!st)return;
 try{if(ugeKotor(st))localStorage.setItem(UGE.DKEY,JSON.stringify({id:st.id,ts:Date.now(),on:!!st.on,soal:st.soal}));else localStorage.removeItem(UGE.DKEY)}catch(e){}
}
function ugeDraftTunda(){clearTimeout(UGE.timer);UGE.timer=setTimeout(ugeDraftSimpan,600)}
function ugeDraftAmbil(id,snap){
 try{
  var r=JSON.parse(localStorage.getItem(UGE.DKEY)||'null');
  if(r&&r.id===id&&Array.isArray(r.soal)&&JSON.stringify({on:!!r.on,soal:r.soal})!==snap&&Date.now()-r.ts<14*864e5)return r;
 }catch(e){}
 return null;
}

/* ---------- Tampilan ---------- */
function ugeBuka(j){
 if(!ugkBisaSafe(j))return;
 var a=ugeAwal(j),st={id:j.id,on:a.on,soal:a.soal,layar:'daftar',i:0,snap:'',rec:null};
 st.snap=ugeIsi(st);st.rec=ugeDraftAmbil(j.id,st.snap);
 UGE.st=st;ugeGambar(false);
}
function ugkBisaSafe(j){return typeof ukgBisa==='function'&&ukgBisa(j)}
function ugeTutup(){
 ugeDraftSimpan();UGE.st=null;
 var ov=ugeEl();if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
 document.body.style.overflow='';
}
function ugeGambar(keep){
 var st=UGE.st;if(!st)return;
 var j=ugeJob(st.id);if(!j){ugeTutup();return}
 var ov=ugeEl(),y=ov?ov.scrollTop:0;
 if(!ov){ov=document.createElement('div');ov.id='uge-ov';ov.className='ukg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Editor gerbang praktik');document.body.appendChild(ov);document.body.style.overflow='hidden'}
 ov.innerHTML=st.layar==='soal'&&st.soal[st.i]?ugeSoalHtml(j,st):ugeDaftarHtml(j,st);
 ov.scrollTop=keep?y:0;
}
function ugeStatusSimpan(j){
 var g=j.gerbang;
 if(g&&typeof g==='object')return g.on===false?'Dimatikan (buatan guru)':'Buatan guru';
 return typeof UKK_GERBANG!=='undefined'&&UKK_GERBANG[j.id]?'Soal bawaan':'Belum ada gerbang';
}
function ugeDaftarHtml(j,st){
 var n=st.soal.length,penuh=n>=UKG.MAX,sudah=!!(j.gerbang&&typeof j.gerbang==='object'),bawaan=typeof UKK_GERBANG!=='undefined'&&!!UKK_GERBANG[j.id];
 var h='<div class="ukg-box"><div class="row sb"><div><span class="label">Editor gerbang praktik</span><h2>'+esc(j.judul)+'</h2></div><button type="button" class="btn small" data-uge="tutup">Tutup</button></div>';
 if(st.rec)h+='<div class="card"><b>Ada draf yang belum disimpan</b><p class="note">Tersimpan di perangkat ini pada '+esc(new Date(st.rec.ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+' ('+st.rec.soal.length+' soal).</p><div class="row"><button type="button" class="btn small" data-uge="buang-draf">Buang draf</button><button type="button" class="btn primary small grow" data-uge="pulih">Pulihkan draf</button></div></div>';
 h+='<section class="card" style="display:grid;gap:8px"><label class="lk-check"><input type="checkbox" data-ugef="on"'+(st.on?' checked':'')+'><span><b>Gerbang aktif</b><small>Siswa wajib lulus gerbang sebelum memulai unit. Matikan agar siswa langsung masuk unit.</small></span></label>'+
  '<p class="note"><b>'+n+' dari '+UKG.MAX+' soal</b> · KKM gerbang '+ukgKkm()+' · semua soal wajib dijawab · tanpa batas percobaan · tidak masuk nilai UKK. Status tersimpan: '+esc(ugeStatusSimpan(j))+'.</p></section>';
 if(!n)h+='<div class="card muted">Belum ada soal. Tambahkan soal di bawah'+(bawaan?' atau muat soal bawaan':'')+'.</div>';
 st.soal.forEach(function(q,i){
  var e=ugeCek(q),pv=ugeT(q.q);
  h+='<section class="card uge-it" data-i="'+i+'"><div class="row sb"><b>Soal '+(i+1)+'</b><span><span class="pill plain">'+ugeJenisNama(lkqType(q))+'</span> <span class="pill '+(e?'bad':'ok')+'">'+(e?'Belum lengkap':'Lengkap')+'</span></span></div>'+
   '<p class="note">'+(pv?esc(pv.length>110?pv.slice(0,110)+'…':pv):'(pertanyaan kosong)')+'</p>'+(e?'<p class="uge-bad">'+esc(e)+'</p>':'')+
   '<div class="lks-acts"><button type="button" class="btn small primary" data-uge="edit" data-i="'+i+'">Edit</button>'+
   '<button type="button" class="btn small" data-uge="naik" data-i="'+i+'" aria-label="Naikkan soal '+(i+1)+'"'+(i===0?' disabled':'')+'>↑</button>'+
   '<button type="button" class="btn small" data-uge="turun" data-i="'+i+'" aria-label="Turunkan soal '+(i+1)+'"'+(i===n-1?' disabled':'')+'>↓</button>'+
   '<button type="button" class="btn small" data-uge="dup" data-i="'+i+'"'+(penuh?' disabled':'')+'>Duplikat</button>'+
   '<button type="button" class="btn small danger" data-uge="hapus" data-i="'+i+'">Hapus</button></div></section>';
 });
 h+='<section class="card" style="display:grid;gap:8px"><b>Tambah soal</b>'+(penuh?'<p class="note">Sudah '+UKG.MAX+' soal (batas maksimal). Hapus satu soal untuk menambah.</p>':'')+
  '<div class="lks-acts"><button type="button" class="btn small" data-uge="tambah" data-t="pg"'+(penuh?' disabled':'')+'>+ Pilihan ganda</button><button type="button" class="btn small" data-uge="tambah" data-t="kompleks"'+(penuh?' disabled':'')+'>+ PG kompleks</button><button type="button" class="btn small" data-uge="tambah" data-t="kategori"'+(penuh?' disabled':'')+'>+ PG kategori</button></div>'+
  '<div class="lks-acts">'+(bawaan?'<button type="button" class="btn small" data-uge="bawaan">Muat soal bawaan</button>':'')+(n?'<button type="button" class="btn small danger" data-uge="kosong">Kosongkan semua soal</button>':'')+
  (sudah?'<button type="button" class="btn small danger" data-uge="reset">'+(bawaan?'Kembalikan ke soal bawaan':'Hapus gerbang buatan')+'</button>':'')+'</div></section>'+
  '<div class="ukg-bar"><button type="button" class="btn" data-uge="pratinjau"'+(n?'':' disabled')+'>Pratinjau</button><button type="button" class="btn primary grow" data-uge="simpan">Simpan gerbang</button></div></div>';
 return h;
}
function ugeOpsiHtml(q,t){
 var L='ABCDE',h='';
 if(t==='kategori'){
  h+='<span class="label">Pernyataan (tentukan Benar atau Salah)</span>';
  q.rows.forEach(function(r,k){
   h+='<div class="uge-row"><label class="f">Pernyataan '+(k+1)+'<textarea rows="2" maxlength="'+UGE.MAXOPT+'" data-ugef="row" data-k="'+k+'">'+esc(r[0])+'</textarea></label>'+
    '<div class="row"><label class="f grow">Jawaban yang benar<select data-ugef="rowv" data-k="'+k+'"><option value="1"'+(r[1]===true?' selected':'')+'>Benar</option><option value="0"'+(r[1]===false?' selected':'')+'>Salah</option></select></label>'+
    '<button type="button" class="btn small danger" data-uge="row-hapus" data-k="'+k+'"'+(q.rows.length<=2?' disabled':'')+'>Hapus</button></div></div>';
  });
  return h+'<div><button type="button" class="btn small" data-uge="row-tambah"'+(q.rows.length>=UGE.MAXR?' disabled':'')+'>+ Pernyataan</button></div>';
 }
 h+='<span class="label">'+(t==='kompleks'?'Pilihan (centang semua yang benar)':'Pilihan (pilih satu kunci di sebelah kiri)')+'</span>';
 q.o.forEach(function(o,k){
  var ck=t==='kompleks'?(Array.isArray(q.a)&&q.a.indexOf(k)>-1):q.a===k;
  h+='<div class="uge-opt"><label class="uge-k" title="Kunci jawaban"><input type="'+(t==='kompleks'?'checkbox':'radio')+'" name="uge-key" data-ugef="'+(t==='kompleks'?'keyc':'key')+'" data-k="'+k+'"'+(ck?' checked':'')+'><b>'+L.charAt(k)+'</b></label>'+
   '<input type="text" maxlength="'+UGE.MAXOPT+'" data-ugef="opt" data-k="'+k+'" value="'+esc(o)+'" placeholder="Pilihan '+L.charAt(k)+'" aria-label="Pilihan '+L.charAt(k)+'">'+
   '<button type="button" class="btn small danger" data-uge="opt-hapus" data-k="'+k+'" aria-label="Hapus pilihan '+L.charAt(k)+'"'+(q.o.length<=(t==='kompleks'?3:2)?' disabled':'')+'>×</button></div>';
 });
 return h+'<div><button type="button" class="btn small" data-uge="opt-tambah"'+(q.o.length>=UGE.MAXO?' disabled':'')+'>+ Pilihan</button></div>';
}
function ugeSoalHtml(j,st){
 var q=st.soal[st.i],t=lkqType(q),n=st.soal.length,e=ugeCek(q);
 return '<div class="ukg-box"><div class="row sb"><button type="button" class="btn small" data-uge="daftar">‹ Daftar soal</button><span class="pill plain">'+ugeJenisNama(t)+'</span></div>'+
  '<h2>Soal '+(st.i+1)+' dari '+n+'</h2>'+
  '<section class="card" style="display:grid;gap:10px"><label class="f">Level<select data-ugef="lvl">'+UGE.LVL.map(function(l){return '<option'+(q.lvl===l?' selected':'')+'>'+l+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Pertanyaan (sertakan data ukur atau kasus di dalam soal)<textarea rows="5" maxlength="'+UGE.MAXQ+'" data-ugef="q">'+esc(q.q)+'</textarea></label>'+
  ugeOpsiHtml(q,t)+
  '<label class="f">Pembahasan (hanya terlihat oleh guru di pratinjau)<textarea rows="4" maxlength="'+UGE.MAXE+'" data-ugef="e">'+esc(q.e||'')+'</textarea></label>'+
  '<p class="uge-bad" id="uge-msg" aria-live="polite">'+esc(e)+'</p></section>'+
  '<div class="uge-nav"><button type="button" class="btn" data-uge="sebelum"'+(st.i===0?' disabled':'')+'>‹ Sebelumnya</button><button type="button" class="btn primary" data-uge="daftar">Selesai</button><button type="button" class="btn" data-uge="sesudah"'+(st.i>=n-1?' disabled':'')+'>Berikutnya ›</button></div>'+
  '<div><button type="button" class="btn small danger" data-uge="hapus" data-i="'+st.i+'">Hapus soal ini</button></div></div>';
}

/* ---------- Simpan ---------- */
function ugeSimpan(){
 var st=UGE.st;if(!st)return;
 var j=ugeJob(st.id);if(!j||!ugkBisaSafe(j)){toast('Tidak dapat menyimpan gerbang unit ini');return}
 var c=ugeCekSemua(st.on,st.soal);
 if(c.err){toast(c.err);if(c.i>=0){st.i=c.i;st.layar='soal';ugeGambar(false)}return}
 var doc=ugeCp(ukkDocOf(j.id)||ukkDocFromJob(j));
 doc.gerbang={on:!!st.on,soal:st.soal.map(ugeBersih),v:1};
 var e=ukkStore(doc);if(e){toast(e);return}
 ukkFlush();ugeDraftBuang();
 st.soal=doc.gerbang.soal.map(ugeCp);st.snap=ugeIsi(st);st.rec=null;st.layar='daftar';
 toast('Gerbang praktik tersimpan ('+st.soal.length+' soal'+(st.on?'':', dimatikan')+')');
 try{if(typeof render==='function')render()}catch(x){}
 ugeGambar(false);
}
function ugeReset(){
 var st=UGE.st;if(!st)return;
 var j=ugeJob(st.id);if(!j)return;
 var doc=ugeCp(ukkDocOf(j.id)||ukkDocFromJob(j));doc.gerbang=null;
 var e=ukkStore(doc);if(e){toast(e);return}
 ukkFlush();ugeDraftBuang();
 var a=ugeAwal(ugeJob(st.id)||j);st.on=a.on;st.soal=a.soal;st.snap=ugeIsi(st);st.rec=null;st.layar='daftar';
 toast('Gerbang dikembalikan');
 try{if(typeof render==='function')render()}catch(x){}
 ugeGambar(false);
}
function ugeTanya(pesan,fn,bahaya){
 if(typeof uiConfirm==='function'){uiConfirm(pesan,{ok:'Lanjut',danger:!!bahaya}).then(function(y){if(y)fn()});return}
 fn();
}

/* ---------- Kejadian ---------- */
document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest&&e.target.closest('[data-uge]');if(!b)return;
 var a=b.dataset.uge,st=UGE.st,i=+b.dataset.i,k=+b.dataset.k,q,j;
 if(a==='buka'){j=ugeJob(b.dataset.v);if(j&&ugkBisaSafe(j))ugeBuka(j);return}
 if(!st)return;
 q=st.soal[st.i];
 if(a==='tutup'){ugeTutup();return}
 if(a==='daftar'){st.layar='daftar';ugeGambar(false);return}
 if(a==='edit'){if(st.soal[i]){st.i=i;st.layar='soal';ugeGambar(false)}return}
 if(a==='sebelum'){if(st.i>0){st.i--;ugeGambar(false)}return}
 if(a==='sesudah'){if(st.i<st.soal.length-1){st.i++;ugeGambar(false)}return}
 if(a==='tambah'){
  if(st.soal.length>=UKG.MAX){toast('Maksimal '+UKG.MAX+' soal per unit');return}
  st.soal.push(ugeBaru(b.dataset.t));st.i=st.soal.length-1;st.layar='soal';ugeDraftTunda();ugeGambar(false);return;
 }
 if(a==='naik'||a==='turun'){
  var d=a==='naik'?-1:1,x=i+d;if(!st.soal[i]||!st.soal[x])return;
  var tmp=st.soal[i];st.soal[i]=st.soal[x];st.soal[x]=tmp;ugeDraftTunda();ugeGambar(true);return;
 }
 if(a==='dup'){
  if(st.soal.length>=UKG.MAX){toast('Maksimal '+UKG.MAX+' soal per unit');return}
  if(st.soal[i]){st.soal.splice(i+1,0,ugeCp(st.soal[i]));ugeDraftTunda();ugeGambar(true)}return;
 }
 if(a==='hapus'){
  if(!st.soal[i])return;
  ugeTanya('Hapus soal '+(i+1)+'?\nSoal ini hilang dari daftar. Perubahan baru berlaku setelah Simpan gerbang.',function(){
   var s2=UGE.st;if(!s2||!s2.soal[i])return;
   s2.soal.splice(i,1);if(s2.i>=s2.soal.length)s2.i=Math.max(0,s2.soal.length-1);s2.layar='daftar';ugeDraftTunda();ugeGambar(false);
  },true);return;
 }
 if(a==='bawaan'){
  if(typeof UKK_GERBANG==='undefined'||!UKK_GERBANG[st.id])return;
  ugeTanya('Muat soal bawaan?\nSemua soal yang sedang diedit diganti dengan soal bawaan unit ini.',function(){
   var s2=UGE.st;if(!s2)return;s2.soal=ugeCp(UKK_GERBANG[s2.id]);s2.on=true;s2.layar='daftar';ugeDraftTunda();ugeGambar(false);
  },true);return;
 }
 if(a==='kosong'){
  ugeTanya('Kosongkan semua soal?\nSemua soal di editor dihapus. Perubahan baru berlaku setelah Simpan gerbang.',function(){
   var s2=UGE.st;if(!s2)return;s2.soal=[];s2.layar='daftar';ugeDraftTunda();ugeGambar(false);
  },true);return;
 }
 if(a==='reset'){
  ugeTanya('Kembalikan gerbang unit ini?\nSoal buatan guru dihapus dan unit memakai soal bawaan (bila ada). Jawaban siswa yang tersimpan tetap, tetapi hanya berlaku bila soalnya sama.',ugeReset,true);return;
 }
 if(a==='pulih'){
  if(st.rec){st.on=!!st.rec.on;st.soal=ugeCp(st.rec.soal);st.rec=null;st.i=0;ugeGambar(false)}return;
 }
 if(a==='buang-draf'){ugeDraftBuang();st.rec=null;ugeGambar(true);return}
 if(a==='pratinjau'){
  j=ugeJob(st.id);var c=ugeCekSemua(true,st.soal);
  if(c.err){toast(c.err);if(c.i>=0){st.i=c.i;st.layar='soal';ugeGambar(false)}return}
  UKG.ovr={id:st.id,soal:st.soal.map(ugeBersih)};ukgBuka(j,true);return;
 }
 if(a==='simpan'){ugeSimpan();return}
 /* penyuntingan pilihan dan pernyataan pada layar soal */
 if(!q)return;
 var t=lkqType(q);
 if(a==='opt-tambah'&&q.o&&q.o.length<UGE.MAXO){q.o.push('');ugeDraftTunda();ugeGambar(true)}
 else if(a==='opt-hapus'&&q.o&&q.o.length>(t==='kompleks'?3:2)&&q.o[k]!==undefined){
  q.o.splice(k,1);
  if(t==='kompleks')q.a=(q.a||[]).filter(function(x){return x!==k}).map(function(x){return x>k?x-1:x});
  else q.a=q.a===k?-1:(q.a>k?q.a-1:q.a);
  ugeDraftTunda();ugeGambar(true);
 }
 else if(a==='row-tambah'&&q.rows&&q.rows.length<UGE.MAXR){q.rows.push(['',true]);ugeDraftTunda();ugeGambar(true)}
 else if(a==='row-hapus'&&q.rows&&q.rows.length>2&&q.rows[k]){q.rows.splice(k,1);ugeDraftTunda();ugeGambar(true)}
});
function ugeMsg(){
 var st=UGE.st,el=document.getElementById('uge-msg');
 if(st&&el&&st.soal[st.i])el.textContent=ugeCek(st.soal[st.i]);
}
document.addEventListener('input',function(e){
 var t=e.target,st=UGE.st;if(!t||!t.dataset||t.dataset.ugef===undefined||!st)return;
 var q=st.soal[st.i],f=t.dataset.ugef,k=+t.dataset.k;if(!q)return;
 if(f==='q')q.q=t.value;else if(f==='e')q.e=t.value;
 else if(f==='opt'&&q.o)q.o[k]=t.value;
 else if(f==='row'&&q.rows&&q.rows[k])q.rows[k][0]=t.value;
 else return;
 ugeMsg();ugeDraftTunda();
});
document.addEventListener('change',function(e){
 var t=e.target,st=UGE.st;if(!t||!t.dataset||t.dataset.ugef===undefined||!st)return;
 var f=t.dataset.ugef,k=+t.dataset.k,q=st.soal[st.i];
 if(f==='on'){st.on=!!t.checked;ugeDraftTunda();return}
 if(!q)return;
 if(f==='lvl'&&UGE.LVL.indexOf(t.value)>-1)q.lvl=t.value;
 else if(f==='key'&&t.checked)q.a=k;
 else if(f==='keyc'){
  var a=Array.isArray(q.a)?q.a.slice():[],p=a.indexOf(k);
  if(t.checked&&p<0)a.push(k);if(!t.checked&&p>-1)a.splice(p,1);
  a.sort(function(x,y){return x-y});q.a=a;
 }
 else if(f==='rowv'&&q.rows&&q.rows[k])q.rows[k][1]=(t.value==='1');
 else return;
 ugeMsg();ugeDraftTunda();
});

/* ---------- Pengait ke unit UKK ---------- */
(function(){
 /* Unit membawa gerbang buatan guru ke objek job (dibaca ukgSoal) */
 var m0=window.ukkMakeJob;
 if(typeof m0==='function')window.ukkMakeJob=function(d){
  var j=m0.apply(this,arguments);
  if(j&&d&&d.gerbang&&typeof d.gerbang==='object')j.gerbang=d.gerbang;
  return j;
 };
 /* Menyimpan unit dari editor unit tidak boleh menghapus gerbang: dokumen tanpa kolom gerbang mewarisinya. gerbang:null = hapus. */
 var s0=window.ukkSimpanDoc;
 if(typeof s0==='function')window.ukkSimpanDoc=function(d){
  if(d&&d.gerbang===undefined&&typeof ukkDocOf==='function'){var o=ukkDocOf(d.id);if(o&&o.gerbang)d.gerbang=o.gerbang}
  return s0.apply(this,arguments);
 };
 var v0=window.ukkValidateDoc;
 if(typeof v0==='function')window.ukkValidateDoc=function(d){return v0.apply(this,arguments)||ugeCekDoc(d)};
 /* Kartu Gerbang praktik di halaman Kelola unit, sebelum tab Hasil/Pengaturan */
 var h0=window.ukkHub;
 if(typeof h0==='function')window.ukkHub=function(){
  var h=h0.apply(this,arguments);if(!h)return h;
  var j=typeof UKS!=='undefined'?ugeJob(UKS.id):null,c=j&&ugkBisaSafe(j)?ugeHubCard(j):'';
  if(!c)return h;
  var p=h.indexOf('<div class="lks-tabs">');
  return p<0?h+c:h.slice(0,p)+c+h.slice(p);
 };
 /* Menutup pratinjau gerbang tidak boleh membuka kunci gulir halaman di belakang editor */
 var t0=window.ukgTutup;
 if(typeof t0==='function')window.ukgTutup=function(){var r=t0.apply(this,arguments);if(ugeEl())document.body.style.overflow='hidden';return r};
 try{if(typeof ukkRebuild==='function')ukkRebuild()}catch(e){}
})();
function ugeHubCard(j){
 var n=ukgSoal(j).length,g=j.gerbang,aktif=!!(g&&typeof g==='object'&&g.on===false);
 return '<section class="card" style="display:grid;gap:8px"><div class="row sb"><h3>Gerbang praktik</h3><span class="pill '+(aktif?'warn':n?'ok':'plain')+'">'+esc(aktif?'Dimatikan':n?ugeStatusSimpan(j)+' · '+n+' soal':'Belum ada')+'</span></div>'+
  '<p class="note">Siswa harus lulus gerbang (nilai minimal KKM gerbang, tanpa batas percobaan) sebelum memulai unit. Maksimal '+UKG.MAX+' soal. Gerbang tidak masuk nilai UKK.</p>'+
  '<div class="lks-acts"><button type="button" class="btn primary small" data-uge="buka" data-v="'+esc(j.id)+'">Editor gerbang</button>'+(n?'<button type="button" class="btn small" data-ukg="pratinjau" data-v="'+esc(j.id)+'">Pratinjau gerbang</button>':'')+'</div></section>';
}
