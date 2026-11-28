/* observasi-editor.js: editor lembar Observasi UKK kelas X dan XI untuk guru dan admin. Dimuat setelah ukk-observasi.js dan ukk-kelola.js.
   FUNGSI
     - Mengubah nama lembar, judul tugas, alokasi waktu, tipe kendaraan/alat, bagian (judul, urutan), dan aspek (teks, petunjuk, urutan).
     - Membuat lembar baru (standar 4 bagian A-D, atau salinan lembar setingkat) untuk unit buatan sendiri; lembar baru dapat dipilih di tab Observasi pada Edit isi unit.
     - Mengembalikan lembar bawaan (UKK-X-1 dan UKK-XI-1) ke isi asli. Lembar buatan sendiri dapat dihapus bila tidak dipakai unit (diarsipkan: observasi lama tetap terbaca).
     - Lembar kelas XII (Observasi 1-4) tidak dapat diubah di sini.
   BATAS: 1-8 bagian, 3-60 aspek, teks aspek maks. 200 dan petunjuk maks. 300 karakter.
   PENYIMPANAN
     - Dokumen lembar ikut koleksi lkpd_modules (penanda jenis:'obsukk', id 'OBSUKK-<kode lembar>', status draft agar tidak terbaca siswa), sehingga sinkronisasi Appwrite,
       antrean offline, dan penyimpanan lokal sama dengan unit UKK (tanpa perubahan skema). Dokumen berisi isi lengkap lembar; lembar bawaan yang diubah menimpa bawaan,
       reset:true = kembali ke bawaan, dihapus:true = lembar buatan yang diarsipkan.
     - Aspek punya ID tetap (id di t[3]); nomor tampil selalu berurutan menurut posisi. Dengan begitu nilai observasi lama tetap menempel pada aspek yang sama
       walau urutan atau nomor berubah. Aspek baru memakai ID baru dari penghitung nid yang tidak pernah dipakai ulang.
     - Draf otomatis di perangkat (localStorage tbsm-obs-editor-draft:<kode>). */
var OBE={MAXG:8,MAXI:60,MINI:3,MAXN:80,MAXJ:180,MAXT:200,MAXD:300,MAXU:120,MAXBYTES:120*1024,DKEY:'tbsm-obs-editor-draft',TK:['X','XI'],st:null,timer:null,BASE:null,UNIT0:null};
(function(){var st=document.createElement('style');st.textContent=
'.obe-ov{position:fixed;inset:0;z-index:1000;background:var(--bg,#fff);overflow:auto;-webkit-overflow-scrolling:touch}'+
'.obe-box{max-width:720px;margin:0 auto;padding:14px 14px 90px;display:grid;gap:10px}'+
'.obe-bar{position:sticky;bottom:0;padding:10px 0;background:var(--bg,#fff);display:flex;gap:8px}'+
'.obe-it{display:grid;grid-template-columns:30px 1fr;gap:6px 8px;padding:8px 0;border-top:1px solid var(--line,#ddd)}'+
'.obe-no{font-weight:600;color:var(--muted,#666);padding-top:8px;text-align:right}'+
'.obe-f{display:grid;gap:6px}.obe-f textarea,.obe-f input{width:100%}'+
'.obe-ac{grid-column:2;display:flex;gap:6px;flex-wrap:wrap}'+
'.obe-gh{display:grid;gap:8px}.obe-bad{color:var(--bad,#c33);font-size:13px;margin:0}';
document.head.appendChild(st)})();

/* ---------- Data ---------- */
function obeCp(x){return JSON.parse(JSON.stringify(x))}
function obeT(v){return String(v==null?'':v).trim()}
function obeEl(){return document.getElementById('obe-ov')}
OBE.UNIT0=obeCp(OBU.meta.unit);
/* Salinan isi asli semua lembar bawaan, diambil sebelum ada timpaan. */
OBE.BASE=OBU.lembar.map(function(L){return obeCp({k:L.k,tk:L.tk||'XII',nama:L.nama,judul:L.judul,waktu:L.waktu||'',unit:OBE.UNIT0[L.k]||'',g:L.g})});
function obeDocs(){return (S.lkpdModules||[]).map(function(m){
 var x=Object.assign({},m),p=null;
 if(x.payload&&typeof x.payload==='string'){try{p=JSON.parse(x.payload)}catch(e){}}
 if(p&&typeof p==='object'){delete p.payload;x=Object.assign({},p,x)}
 return x}).filter(function(x){return x.jenis==='obsukk'})}
function obeDocOf(k){return obeDocs().filter(function(d){return d.k===k})[0]||null}
function obeIsBase(k){return OBE.BASE.some(function(b){return b.k===k})}
function obeBolehEdit(k){var L=OBU.lb[k];return !!L&&OBE.TK.indexOf(L.tk)>-1&&OBU.lembar.some(function(x){return x.k===k})}
function obeStatus(k){if(!obeIsBase(k))return 'Buatan guru';var d=obeDocOf(k);return d&&!d.reset?'Diubah':'Bawaan'}
function obeUnitPakai(k){return (typeof JOBS!=='undefined'?JOBS:[]).filter(function(j){return j.ukk&&j.obs&&j.obs.mode!=='tanpa'&&j.obs.lembar===k})}
function obeJumlahObs(k){return (S.observasi||[]).filter(function(r){return r&&r.tipe==='ukk'&&obuKey(r)===k}).length}
function obeNidMin(L){var m=0;L.flat.forEach(function(i){var n=parseInt(String(i.id).replace(/\D/g,''),10)||0;if(n>m)m=n});return m+1}
function obeIds(L){return L.flat.map(function(i){return i.id}).sort().join('|')}

/* Dokumen tersimpan menjadi definisi lembar (bentuk yang sama dengan OBU.lembar). Mengembalikan null bila rusak. */
function obeDariDoc(d){
 if(!d||!d.k||OBE.TK.indexOf(d.tk)<0||!Array.isArray(d.g)||!d.g.length)return null;
 if(!d.g.every(function(g){return g&&typeof g.g==='string'&&Array.isArray(g.t)&&g.t.length&&g.t.every(function(t){return Array.isArray(t)})}))return null;
 var n=0;
 return {k:String(d.k),tk:d.tk,nama:String(d.nama||d.title||d.k),judul:String(d.judul||''),waktu:String(d.waktu||''),unit:String(d.unit||''),
  g:d.g.map(function(g){return {g:g.g,t:g.t.map(function(t){n++;return [n,String(t[1]||''),String(t[2]||''),t[3]||('u'+t[0])]})}})};
}
/* Pasang bawaan + timpaan ke OBU.lembar dan OBU.lb. Dipanggil setiap lkRefreshModules. */
function obeTerap(){
 var map={},order=[],arsip=[];
 OBE.BASE.forEach(function(b){map[b.k]=obeCp(b);order.push(b.k)});
 obeDocs().sort(function(a,b){return (a.cts||0)-(b.cts||0)}).forEach(function(d){
  if(d.reset)return;
  var L=obeDariDoc(d);if(!L)return;
  if(d.dihapus){if(!obeIsBase(L.k))arsip.push(L);return}
  if(!(L.k in map))order.push(L.k);
  map[L.k]=L;
 });
 OBU.lembar.length=0;OBU.lb={};OBU.meta.unit={};
 arsip.forEach(obuBangun);
 order.forEach(function(k){var L=map[k];OBU.lembar.push(obuBangun(L));if(L.unit)OBU.meta.unit[L.k]=L.unit});
 /* lembar bawaan tanpa tipe kendaraan baru tetap memakai nilai asli */
 Object.keys(OBE.UNIT0).forEach(function(k){if(!(k in OBU.meta.unit)&&!(map[k]&&map[k].unit))OBU.meta.unit[k]=OBE.UNIT0[k]});
}
/* Lembar tidak boleh ikut tampil di daftar LKPD. */
(function(){
 var r0=window.lkRefreshModules;
 window.lkRefreshModules=function(){r0.apply(this,arguments);LKPD_MODULES=LKPD_MODULES.filter(function(m){return m.jenis!=='obsukk'});obeTerap()};
 try{lkRefreshModules()}catch(e){obeTerap()}
})();

/* ---------- Suntingan ---------- */
function obeDariLembar(L,doc){
 var n=obeNidMin(L);if(doc&&doc.nid>n)n=doc.nid;
 return {k:L.k,tk:L.tk,nama:L.nama,judul:L.judul,menit:parseInt(L.waktu,10)||20,unit:L.unit||OBU.meta.unit[L.k]||'',nid:n,
  g:L.grup.map(function(g){return {g:g.g,items:g.items.map(function(i){return {id:i.id,t:i.t,d:i.d||''}})}})};
}
function obeStandar(tk,menit){
 var v=OBE.BASE.filter(function(b){return b.k==='vario'})[0],n=0;
 function a(t){n++;return {id:'n'+n,t:t,d:''}}
 function dari(g){return g.t.map(function(t){return a(t[1])})}
 var g0=dari(v.g[0]),gb=[a('')],gc=dari(v.g[2]),gd=dari(v.g[3]);
 gd[0].t='Menyelesaikan pekerjaan dalam '+menit+' menit';
 return {k:'',tk:tk,nama:'',judul:'',menit:menit,unit:'',nid:n+1,g:[{g:'A. Persiapan',items:g0},{g:'B. Proses kerja',items:gb},{g:'C. K3 dan lingkungan',items:gc},{g:'D. Hasil dan waktu',items:gd}]};
}
function obeKodeBaru(){var k;do{k='obs'+Date.now().toString(36)+Math.floor(Math.random()*36).toString(36)}while(OBU.lb[k]);return k}
function obeIsi(st){return {tk:st.tk,nama:st.nama,judul:st.judul,menit:st.menit,unit:st.unit,nid:st.nid,g:st.g}}
function obeSnap(st){return JSON.stringify(obeIsi(st))}
function obeTotal(st){var n=0;st.g.forEach(function(g){n+=g.items.length});return n}

/* Pemeriksaan. Mengembalikan {msg,sel} atau null. */
function obeCek(st){
 var nama=obeT(st.nama),n=obeTotal(st),gi,ii,g,it;
 if(!nama)return {msg:'Isi nama lembar.',sel:'[data-obef="nama"]'};
 if(nama.length>OBE.MAXN)return {msg:'Nama lembar maksimal '+OBE.MAXN+' karakter.',sel:'[data-obef="nama"]'};
 if(OBU.lembar.some(function(L){return L.k!==st.k&&L.nama.toLowerCase()===nama.toLowerCase()}))return {msg:'Nama lembar sudah dipakai lembar lain.',sel:'[data-obef="nama"]'};
 if(!obeT(st.judul))return {msg:'Isi judul tugas.',sel:'[data-obef="judul"]'};
 if(obeT(st.judul).length>OBE.MAXJ)return {msg:'Judul tugas maksimal '+OBE.MAXJ+' karakter.',sel:'[data-obef="judul"]'};
 if(!(st.menit>=1&&st.menit<=600&&st.menit===Math.floor(st.menit)))return {msg:'Alokasi waktu 1 sampai 600 menit.',sel:'[data-obef="menit"]'};
 if(obeT(st.unit).length>OBE.MAXU)return {msg:'Tipe kendaraan atau alat maksimal '+OBE.MAXU+' karakter.',sel:'[data-obef="unit"]'};
 if(!st.g.length)return {msg:'Isi minimal satu bagian.',sel:''};
 if(st.g.length>OBE.MAXG)return {msg:'Maksimal '+OBE.MAXG+' bagian.',sel:''};
 for(gi=0;gi<st.g.length;gi++){
  g=st.g[gi];
  if(!obeT(g.g))return {msg:'Judul bagian '+(gi+1)+' masih kosong.',sel:'[data-obef="gt"][data-gi="'+gi+'"]'};
  if(obeT(g.g).length>OBE.MAXN)return {msg:'Judul bagian '+(gi+1)+' maksimal '+OBE.MAXN+' karakter.',sel:'[data-obef="gt"][data-gi="'+gi+'"]'};
  if(!g.items.length)return {msg:'Bagian '+(gi+1)+' belum punya aspek. Tambahkan aspek atau hapus bagian.',sel:'[data-obef="gt"][data-gi="'+gi+'"]'};
  for(ii=0;ii<g.items.length;ii++){
   it=g.items[ii];
   if(!obeT(it.t))return {msg:'Aspek di bagian '+(gi+1)+' (urutan '+(ii+1)+') masih kosong.',sel:'[data-obef="at"][data-gi="'+gi+'"][data-ii="'+ii+'"]'};
   if(obeT(it.t).length>OBE.MAXT)return {msg:'Teks aspek maksimal '+OBE.MAXT+' karakter.',sel:'[data-obef="at"][data-gi="'+gi+'"][data-ii="'+ii+'"]'};
   if(obeT(it.d).length>OBE.MAXD)return {msg:'Petunjuk aspek maksimal '+OBE.MAXD+' karakter.',sel:'[data-obef="ad"][data-gi="'+gi+'"][data-ii="'+ii+'"]'};
  }
 }
 if(n<OBE.MINI)return {msg:'Isi minimal '+OBE.MINI+' aspek.',sel:''};
 if(n>OBE.MAXI)return {msg:'Maksimal '+OBE.MAXI+' aspek per lembar.',sel:''};
 return null;
}
/* Dokumen untuk disimpan. Nomor aspek dibuat berurutan menurut posisi; ID tetap dipertahankan. */
function obeDoc(st,extra){
 var no=0,nama=obeT(st.nama),old=obeDocOf(st.k);
 var d={id:'OBSUKK-'+st.k,jenis:'obsukk',k:st.k,tk:st.tk,nama:nama,judul:obeT(st.judul),waktu:st.menit+' Menit',unit:obeT(st.unit),
  title:nama.slice(0,180),kelas:st.tk,fase:(KELAS[st.tk]||{}).fase||'F',duration:st.menit,status:'draft',active:false,nid:st.nid,cts:(old&&old.cts)||Date.now(),
  g:st.g.map(function(g){return {g:obeT(g.g),t:g.items.map(function(i){no++;return [no,obeT(i.t),obeT(i.d),i.id]})}})};
 return Object.assign(d,extra||{});
}
function obeSimpanDoc(d){
 S.lkpdModules=S.lkpdModules||[];delete d.payload;
 var i=S.lkpdModules.findIndex(function(x){return x.id===d.id}),old=i>=0?S.lkpdModules[i]:null;
 d.jenis='obsukk';d.version=1;d.updatedAt=Date.now();d.updatedBy=(S.user&&(S.user.username||S.user.id))||'';d.r=old&&old.r?1:0;d.d=1;
 if(i<0)S.lkpdModules.push(d);else S.lkpdModules[i]=d;
 lkSaveModules();lkRefreshModules();
}
/* Satu pintu penyimpanan: memeriksa dulu, lalu menyimpan. Mengembalikan pesan galat, atau '' bila tersimpan. */
function obeStore(st,extra){
 var e=obeCek(st);if(e)return e.msg;
 var d=obeDoc(st,extra);
 try{if(JSON.stringify(d).length>OBE.MAXBYTES)return 'Ukuran lembar terlalu besar.'}catch(x){}
 obeSimpanDoc(d);return '';
}
function obeFlush(){setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500)}

/* ---------- Draf ---------- */
function obeDraftKey(k){return OBE.DKEY+':'+k}
function obeDraftSimpan(){var st=OBE.st;if(!st||st.layar!=='edit')return;try{localStorage.setItem(obeDraftKey(st.k),JSON.stringify({ts:Date.now(),s:obeCp(obeIsi(st))}))}catch(e){}}
function obeDraftTunda(){clearTimeout(OBE.timer);OBE.timer=setTimeout(obeDraftSimpan,600)}
function obeDraftBuang(k){try{localStorage.removeItem(obeDraftKey(k))}catch(e){}}
function obeDraftBaca(k){try{var x=JSON.parse(localStorage.getItem(obeDraftKey(k))||'null');return x&&x.s&&Array.isArray(x.s.g)?x:null}catch(e){return null}}

/* ---------- Tampilan ---------- */
function obeBuka(layar,o){
 OBE.st=Object.assign({layar:layar,fokus:null,rec:null},o||{});
 obeGambar(false);
}
function obeBukaEdit(k,o){
 var L=OBU.lb[k];if(!L||!obeBolehEdit(k)){toast('Lembar ini tidak dapat diubah');return}
 var st=Object.assign(obeDariLembar(L,obeDocOf(k)),{layar:'edit',fokus:null,rec:null,baru:false},o||{});
 st.snap=obeSnap(st);
 var dr=obeDraftBaca(k);if(dr&&JSON.stringify(dr.s)!==JSON.stringify(obeCp(obeIsi(st))))st.rec=dr;
 OBE.st=st;obeGambar(false);
}
function obeTutup(paksa){
 var st=OBE.st;
 var kotor=!!st&&st.layar==='edit'&&obeSnap(st)!==st.snap;
 var fin=function(){if(kotor)obeDraftSimpan();clearTimeout(OBE.timer);OBE.st=null;var ov=obeEl();if(ov)ov.remove();document.body.style.overflow=''};
 if(!kotor||paksa){fin();return}
 uiConfirm('Tutup tanpa menyimpan?\nPerubahan yang belum disimpan tetap ada sebagai draf di perangkat ini.',{ok:'Tutup'}).then(function(y){if(y)fin()});
}
function obeGambar(keep){
 var st=OBE.st;if(!st){var o0=obeEl();if(o0)o0.remove();return}
 var ov=obeEl(),y=ov?ov.scrollTop:0;
 if(!ov){ov=document.createElement('div');ov.id='obe-ov';ov.className='obe-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Editor lembar observasi UKK');document.body.appendChild(ov);document.body.style.overflow='hidden'}
 ov.innerHTML=st.layar==='daftar'?obeDaftarHtml():st.layar==='baru'?obeBaruHtml(st):obeEditHtml(st);
 ov.scrollTop=keep?y:0;
 if(st.fokus){var f=ov.querySelector(st.fokus);st.fokus=null;if(f){try{f.focus({preventScroll:false})}catch(e){f.focus()}}}
}
function obeDaftarHtml(){
 var h='<div class="obe-box"><div class="row sb"><div><span class="label">Observasi UKK</span><h2>Kelola lembar observasi</h2></div><button type="button" class="btn small" data-obe="tutup">Tutup</button></div>'+
  '<p class="note">Lembar kelas X dan XI dapat diubah atau dibuat baru. Lembar dipakai bersama oleh semua sekolah. Lembar baru dipilih di Edit isi unit, tab Observasi. Lembar kelas XII (Observasi 1-4) tidak dapat diubah di sini.</p>';
 OBE.TK.forEach(function(tk){
  var L=OBU.lembar.filter(function(x){return x.tk===tk});
  h+='<h3>Kelas '+tk+'</h3>';
  if(!L.length)h+='<div class="card muted">Belum ada lembar.</div>';
  L.forEach(function(x){
   var u=obeUnitPakai(x.k),n=obeJumlahObs(x.k),st=obeStatus(x.k);
   h+='<section class="card" style="display:grid;gap:6px"><div class="row sb"><b>'+esc(x.nama)+'</b><span class="pill '+(st==='Bawaan'?'plain':'ok')+'">'+esc(st)+'</span></div>'+
    '<p class="note">'+esc(x.judul)+'</p>'+
    '<p class="note">'+x.flat.length+' aspek · '+x.grup.length+' bagian · '+esc(x.waktu||'-')+' · '+(u.length?'Dipakai unit '+esc(u.map(function(j){return j.id}).join(', ')):'Belum dihubungkan ke unit')+(n?' · '+n+' observasi tersimpan':'')+'</p>'+
    '<div class="lks-acts"><button type="button" class="btn small primary" data-obe="edit" data-k="'+esc(x.k)+'">Edit lembar</button></div></section>';
  });
 });
 h+='<section class="card" style="display:grid;gap:8px"><b>Lembar baru</b><p class="note">Untuk unit UKK buatan sendiri. Mulai dari susunan standar (4 bagian) atau salinan lembar yang ada.</p><div class="lks-acts">'+
  OBE.TK.map(function(tk){return '<button type="button" class="btn small" data-obe="baru" data-tk="'+tk+'">+ Lembar kelas '+tk+'</button>'}).join('')+'</div></section></div>';
 return h;
}
function obeBaruHtml(st){
 var src=OBU.lembar.filter(function(L){return L.tk===st.tk});
 return '<div class="obe-box"><div class="row sb"><div><span class="label">Observasi UKK</span><h2>Lembar observasi baru</h2></div><button type="button" class="btn small" data-obe="'+(st.dari==='daftar'?'daftar':'tutup')+'">'+(st.dari==='daftar'?'‹ Daftar':'Batal')+'</button></div>'+
  '<section class="card" style="display:grid;gap:10px"><label class="f">Tingkat kelas'+(st.kunciTk?'<input type="text" value="Kelas '+esc(st.tk)+'" disabled>':'<select data-obef="b-tk">'+OBE.TK.map(function(t){return '<option value="'+t+'"'+(st.tk===t?' selected':'')+'>Kelas '+t+'</option>'}).join('')+'</select>')+'</label>'+
  '<label class="f">Mulai dari<select data-obef="b-src"><option value="">Susunan standar (A Persiapan, B Proses kerja, C K3, D Hasil dan waktu)</option>'+src.map(function(L){return '<option value="'+esc(L.k)+'"'+(st.src===L.k?' selected':'')+'>Salinan: '+esc(L.nama)+'</option>'}).join('')+'</select></label>'+
  '<p class="note">Lembar baru belum tersimpan sampai Anda menekan Simpan lembar di layar berikutnya.</p>'+
  '<button type="button" class="btn primary" data-obe="mulai">Mulai menyusun</button></section></div>';
}
function obeEditHtml(st){
 var n=obeTotal(st),no=0,base=obeIsBase(st.k),doc=obeDocOf(st.k),pakai=obeUnitPakai(st.k),jo=obeJumlahObs(st.k);
 var h='<div class="obe-box"><div class="row sb"><div><span class="label">'+(st.baru?'Lembar baru':'Edit lembar')+' · Kelas '+esc(st.tk)+'</span><h2>'+esc(obeT(st.nama)||'Lembar tanpa nama')+'</h2></div>'+
  (st.dari==='daftar'?'<button type="button" class="btn small" data-obe="daftar">‹ Daftar</button>':'<button type="button" class="btn small" data-obe="tutup">Tutup</button>')+'</div>';
 if(st.rec)h+='<div class="card"><b>Ada draf yang belum disimpan</b><p class="note">Tersimpan di perangkat ini pada '+esc(new Date(st.rec.ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+'.</p><div class="row"><button type="button" class="btn small primary" data-obe="pulih">Pulihkan draf</button><button type="button" class="btn small" data-obe="buang-draf">Buang draf</button></div></div>';
 if(jo)h+='<p class="note">'+jo+' observasi tersimpan memakai lembar ini. Aspek yang ditambah atau dihapus mengubah pembagi nilai pada observasi lama saat dibuka. Mengubah teks atau urutan aspek tidak menggeser nilai yang sudah diisi.</p>';
 h+='<section class="card" style="display:grid;gap:10px"><label class="f">Nama lembar (tampil di menu dan daftar)<input type="text" maxlength="'+OBE.MAXN+'" data-obef="nama" value="'+esc(st.nama)+'" placeholder="Contoh: Observasi XI-2 · Sistem Rem (Kelas XI)"></label>'+
  '<label class="f">Judul tugas (tampil di layar dan PDF)<input type="text" maxlength="'+OBE.MAXJ+'" data-obef="judul" value="'+esc(st.judul)+'"></label>'+
  '<div class="two"><label class="f">Alokasi waktu (menit)<input type="number" inputmode="numeric" min="1" max="600" data-obef="menit" value="'+esc(st.menit)+'"></label><label class="f">Tipe kendaraan / alat (opsional)<input type="text" maxlength="'+OBE.MAXU+'" data-obef="unit" value="'+esc(st.unit)+'"></label></div>'+
  '<p class="note">Bila lembar dihubungkan ke unit, judul, waktu, dan kendaraan di layar dan PDF mengikuti unit'+(pakai.length?' ('+esc(pakai.map(function(j){return j.id}).join(', '))+')':'')+'. <b>'+n+' aspek</b> dalam '+st.g.length+' bagian. Nilai akhir = jumlah nilai semua aspek ÷ '+n+'.</p></section>';
 st.g.forEach(function(g,gi){
  h+='<section class="card obe-gh"><div class="row sb"><b>Bagian '+(gi+1)+'</b><span class="pill plain">'+g.items.length+' aspek</span></div>'+
   '<input type="text" maxlength="'+OBE.MAXN+'" data-obef="gt" data-gi="'+gi+'" value="'+esc(g.g)+'" aria-label="Judul bagian '+(gi+1)+'" placeholder="Contoh: B. Proses kerja">'+
   '<div class="lks-acts"><button type="button" class="btn small" data-obe="g-naik" data-gi="'+gi+'" aria-label="Naikkan bagian '+(gi+1)+'"'+(gi===0?' disabled':'')+'>↑</button><button type="button" class="btn small" data-obe="g-turun" data-gi="'+gi+'" aria-label="Turunkan bagian '+(gi+1)+'"'+(gi===st.g.length-1?' disabled':'')+'>↓</button><button type="button" class="btn small danger" data-obe="g-hapus" data-gi="'+gi+'"'+(st.g.length<=1?' disabled':'')+'>Hapus bagian</button></div>';
  g.items.forEach(function(it,ii){
   no++;
   h+='<div class="obe-it"><div class="obe-no">'+no+'</div><div class="obe-f"><textarea rows="2" maxlength="'+OBE.MAXT+'" data-obef="at" data-gi="'+gi+'" data-ii="'+ii+'" aria-label="Aspek '+no+'" placeholder="Aspek yang dinilai">'+esc(it.t)+'</textarea>'+
    '<input type="text" maxlength="'+OBE.MAXD+'" data-obef="ad" data-gi="'+gi+'" data-ii="'+ii+'" value="'+esc(it.d)+'" aria-label="Petunjuk aspek '+no+'" placeholder="Petunjuk atau spesifikasi (opsional)"></div>'+
    '<div class="obe-ac"><button type="button" class="btn small" data-obe="i-naik" data-gi="'+gi+'" data-ii="'+ii+'" aria-label="Naikkan aspek '+no+'"'+(gi===0&&ii===0?' disabled':'')+'>↑</button><button type="button" class="btn small" data-obe="i-turun" data-gi="'+gi+'" data-ii="'+ii+'" aria-label="Turunkan aspek '+no+'"'+(gi===st.g.length-1&&ii===g.items.length-1?' disabled':'')+'>↓</button><button type="button" class="btn small danger" data-obe="i-hapus" data-gi="'+gi+'" data-ii="'+ii+'" aria-label="Hapus aspek '+no+'"'+(g.items.length<=1?' disabled':'')+'>Hapus</button></div></div>';
  });
  h+='<div><button type="button" class="btn small" data-obe="i-tambah" data-gi="'+gi+'"'+(n>=OBE.MAXI?' disabled':'')+'>+ Aspek di bagian ini</button></div></section>';
 });
 h+='<section class="card" style="display:grid;gap:8px"><div class="lks-acts"><button type="button" class="btn small" data-obe="g-tambah"'+(st.g.length>=OBE.MAXG?' disabled':'')+'>+ Bagian baru</button></div>'+
  (n>=OBE.MAXI?'<p class="note">Sudah '+OBE.MAXI+' aspek (batas maksimal).</p>':'')+
  (st.baru?'':(base?(doc&&!doc.reset?'<div class="lks-acts"><button type="button" class="btn small danger" data-obe="reset">Kembalikan ke bawaan</button></div>':''):'<div class="lks-acts"><button type="button" class="btn small danger" data-obe="hapus">Hapus lembar</button></div>'))+'</section>'+
  '<p class="obe-bad" id="obe-msg" aria-live="polite"></p>'+
  '<div class="obe-bar"><button type="button" class="btn primary grow" data-obe="simpan">Simpan lembar</button></div></div>';
 return h;
}

/* ---------- Simpan, kembalikan, hapus ---------- */
function obeSelesai(k){
 var st=OBE.st,cb=st&&st.onSave,dari=st&&st.dari;
 if(st)st.snap=obeSnap(st);
 if(dari==='daftar'){OBE.st={layar:'daftar',fokus:null,rec:null};obeGambar(false)}else obeTutup(true);
 try{if(cb)cb(k);else if(typeof UKS!=='undefined'&&UKS.ed&&typeof ukeRe==='function')ukeRe();else if(typeof render==='function')render()}catch(e){}
}
function obeSimpan(){
 var st=OBE.st;if(!st||st.layar!=='edit')return;
 var e=obeCek(st);
 if(e){toast(e.msg);var m=document.getElementById('obe-msg');if(m)m.textContent=e.msg;if(e.sel){var el=document.querySelector('#obe-ov '+e.sel);if(el){el.scrollIntoView({block:'center'});try{el.focus()}catch(x){}}}return}
 var L=OBU.lb[st.k],pakai=obeJumlahObs(st.k),ids=[];
 st.g.forEach(function(g){g.items.forEach(function(i){ids.push(i.id)})});
 var ubah=!!L&&obeIds(L)!==ids.sort().join('|');
 var lanjut=function(){
  var er=obeStore(st);if(er){toast(er);return}
  obeFlush();obeDraftBuang(st.k);
  toast('Lembar observasi tersimpan ('+obeTotal(st)+' aspek)');
  obeSelesai(st.k);
 };
 if(pakai&&ubah&&typeof uiConfirm==='function')uiConfirm(pakai+' observasi tersimpan memakai lembar ini.\nAspek yang ditambah atau dihapus mengubah pembagi nilai pada observasi lama saat dibuka. Simpan perubahan?',{ok:'Simpan'}).then(function(y){if(y)lanjut()});
 else lanjut();
}
function obeReset(){
 var st=OBE.st;if(!st||!obeIsBase(st.k))return;
 var b=OBE.BASE.filter(function(x){return x.k===st.k})[0];
 var a=obeDariLembar(obuBangun(Object.assign(obeCp(b),{})),null);
 /* ID bawaan dipakai lagi; penghitung nid dipertahankan agar ID aspek buatan tidak dipakai ulang */
 a.nid=Math.max(a.nid,st.nid||0);
 var d=obeDoc(a,{reset:true});
 obeSimpanDoc(d);obeFlush();obeDraftBuang(st.k);
 toast('Lembar dikembalikan ke bawaan');
 obeSelesai(st.k);
}
function obeHapus(){
 var st=OBE.st;if(!st||obeIsBase(st.k))return;
 var u=obeUnitPakai(st.k);
 if(u.length){toast('Lembar masih dipakai unit '+u.map(function(j){return j.id}).join(', ')+'. Ubah pilihan lembar di unit itu dulu.');return}
 var L=OBU.lb[st.k];if(!L)return;
 var a=obeDariLembar(L,obeDocOf(st.k));
 var d=obeDoc(a,{dihapus:true});
 obeSimpanDoc(d);obeFlush();obeDraftBuang(st.k);
 toast('Lembar dihapus');
 obeSelesai(st.k);
}

/* ---------- Kejadian ---------- */
function obeTanya(pesan,fn,bahaya){
 if(typeof uiConfirm==='function'){uiConfirm(pesan,{ok:'Lanjut',danger:!!bahaya}).then(function(y){if(y)fn()});return}
 fn();
}
function obeCekBuka(){if(!S.user||!can('observasi')){toast('Tidak punya izin');return false}return true}
document.addEventListener('click',function(e){
 var b=e.target&&e.target.closest&&e.target.closest('[data-obe]');if(!b)return;
 var a=b.dataset.obe,st=OBE.st,gi=+b.dataset.gi,ii=+b.dataset.ii,k=b.dataset.k,g,it,t;
 if(a==='daftar'){if(!obeCekBuka())return;
  if(st&&st.layar==='edit'&&obeSnap(st)!==st.snap){obeTanya('Kembali ke daftar tanpa menyimpan?\nPerubahan tetap ada sebagai draf di perangkat ini.',function(){obeDraftSimpan();OBE.st={layar:'daftar',fokus:null,rec:null};obeGambar(false)});return}
  OBE.st={layar:'daftar',fokus:null,rec:null};obeGambar(false);return}
 if(a==='edit'){if(obeCekBuka())obeBukaEdit(k,{dari:'daftar'});return}
 if(a==='baru'){if(obeCekBuka())obeBuka('baru',{tk:b.dataset.tk==='XI'?'XI':'X',src:'',dari:'daftar'});return}
 if(a==='unit-edit'){if(!obeCekBuka()||typeof UKS==='undefined'||!UKS.ed)return;obeBukaEdit(UKS.ed.S.obs&&UKS.ed.S.obs.lembar,{dari:'unit'});return}
 if(a==='unit-baru'){
  if(!obeCekBuka()||typeof UKS==='undefined'||!UKS.ed)return;
  var kl=UKS.ed.S.kelas;if(OBE.TK.indexOf(kl)<0){toast('Editor lembar tersedia untuk unit kelas X dan XI');return}
  obeBuka('baru',{tk:kl,kunciTk:true,src:'',dari:'unit',onSave:function(kb){
   if(typeof UKS!=='undefined'&&UKS.ed){var o=UKS.ed.S.obs||{};UKS.ed.S.obs={mode:o.mode&&o.mode!=='tanpa'?o.mode:'pasangan',lembar:kb};if(typeof ukeRe==='function')ukeRe()}
  }});return}
 if(a==='tutup'){obeTutup();return}
 if(!st)return;
 if(a==='mulai'){
  var src=st.src&&OBU.lb[st.src]&&OBU.lb[st.src].tk===st.tk?OBU.lb[st.src]:null,kb=obeKodeBaru(),dasar;
  if(src){dasar=obeDariLembar(src,null);dasar.nama=src.nama+' (salinan)';dasar.nid=Math.max(dasar.nid,obeNidMin(src))}
  else{dasar=obeStandar(st.tk,20)}
  var s2=Object.assign(dasar,{k:kb,tk:st.tk,layar:'edit',fokus:'[data-obef="nama"]',rec:null,baru:true,dari:st.dari,onSave:st.onSave});
  if(!src){s2.nama='';s2.judul=''}
  s2.snap='';OBE.st=s2;obeGambar(false);return}
 if(st.layar!=='edit')return;
 if(a==='simpan'){obeSimpan();return}
 if(a==='reset'){obeTanya('Kembalikan lembar ke bawaan?\nIsi lembar buatan guru dihapus dan lembar kembali ke isi aslinya. Nilai observasi yang sudah tersimpan tidak dihapus.',obeReset,true);return}
 if(a==='hapus'){obeTanya('Hapus lembar ini?\nLembar hilang dari pilihan. Observasi yang sudah tersimpan tetap terbaca.',obeHapus,true);return}
 if(a==='pulih'){if(st.rec){var r=st.rec.s;st.tk=r.tk||st.tk;st.nama=r.nama;st.judul=r.judul;st.menit=r.menit;st.unit=r.unit;st.nid=Math.max(st.nid||0,r.nid||0);st.g=obeCp(r.g);st.rec=null;obeGambar(true)}return}
 if(a==='buang-draf'){obeDraftBuang(st.k);st.rec=null;obeGambar(true);return}
 if(a==='g-tambah'){
  if(st.g.length>=OBE.MAXG){toast('Maksimal '+OBE.MAXG+' bagian');return}
  if(obeTotal(st)>=OBE.MAXI){toast('Maksimal '+OBE.MAXI+' aspek per lembar');return}
  st.g.push({g:'',items:[{id:'n'+(st.nid++),t:'',d:''}]});st.fokus='[data-obef="gt"][data-gi="'+(st.g.length-1)+'"]';obeDraftTunda();obeGambar(true);return}
 if(a==='g-naik'||a==='g-turun'){
  var x=gi+(a==='g-naik'?-1:1);if(!st.g[gi]||!st.g[x])return;
  t=st.g[gi];st.g[gi]=st.g[x];st.g[x]=t;obeDraftTunda();obeGambar(true);return}
 if(a==='g-hapus'){
  if(!st.g[gi]||st.g.length<=1)return;
  var cnt=st.g[gi].items.length;
  var fn=function(){var s3=OBE.st;if(!s3||!s3.g[gi])return;s3.g.splice(gi,1);obeDraftTunda();obeGambar(true)};
  if(cnt)obeTanya('Hapus bagian '+(gi+1)+' beserta '+cnt+' aspeknya?\nPerubahan baru berlaku setelah Simpan lembar.',fn,true);else fn();return}
 g=st.g[gi];if(!g)return;
 if(a==='i-tambah'){
  if(obeTotal(st)>=OBE.MAXI){toast('Maksimal '+OBE.MAXI+' aspek per lembar');return}
  g.items.push({id:'n'+(st.nid++),t:'',d:''});st.fokus='[data-obef="at"][data-gi="'+gi+'"][data-ii="'+(g.items.length-1)+'"]';obeDraftTunda();obeGambar(true);return}
 it=g.items[ii];if(!it)return;
 if(a==='i-hapus'){if(g.items.length<=1)return;g.items.splice(ii,1);obeDraftTunda();obeGambar(true);return}
 if(a==='i-naik'||a==='i-turun'){
  var up=a==='i-naik';
  if(up){
   if(ii>0){g.items[ii]=g.items[ii-1];g.items[ii-1]=it}
   else if(gi>0){g.items.splice(ii,1);st.g[gi-1].items.push(it)}
   else return;
  }else{
   if(ii<g.items.length-1){g.items[ii]=g.items[ii+1];g.items[ii+1]=it}
   else if(gi<st.g.length-1){g.items.splice(ii,1);st.g[gi+1].items.unshift(it)}
   else return;
  }
  /* bagian yang kehilangan semua aspek tidak dibiarkan kosong tanpa tanda; Simpan akan menolaknya */
  obeDraftTunda();obeGambar(true);return}
});
document.addEventListener('input',function(e){
 var t=e.target,st=OBE.st;if(!t||!t.dataset||t.dataset.obef===undefined||!st||st.layar!=='edit')return;
 var f=t.dataset.obef,gi=+t.dataset.gi,ii=+t.dataset.ii,g=st.g[gi];
 if(f==='nama')st.nama=t.value;else if(f==='judul')st.judul=t.value;else if(f==='unit')st.unit=t.value;
 else if(f==='menit')st.menit=t.value===''?0:Number(t.value);
 else if(f==='gt'&&g)g.g=t.value;
 else if(f==='at'&&g&&g.items[ii])g.items[ii].t=t.value;
 else if(f==='ad'&&g&&g.items[ii])g.items[ii].d=t.value;
 else return;
 obeDraftTunda();
});
document.addEventListener('change',function(e){
 var t=e.target,st=OBE.st;if(!t||!t.dataset||t.dataset.obef===undefined||!st||st.layar!=='baru')return;
 if(t.dataset.obef==='b-tk'){st.tk=t.value==='XI'?'XI':'X';st.src='';obeGambar(true)}
 else if(t.dataset.obef==='b-src')st.src=t.value;
});
document.addEventListener('keydown',function(e){
 if(e.key!=='Escape'||!OBE.st||document.querySelector('.ui-ov'))return;
 obeTutup();
});

/* ---------- Pengait ---------- */
(function(){
 /* Tombol Edit lembar dan Lembar baru di daftar Observasi UKK (setelah rombel dipilih) */
 var v0=window.viewObservasiUkk;
 if(typeof v0==='function')window.viewObservasiUkk=function(){
  var h=v0.apply(this,arguments);
  try{
   if(!can('observasi')||OU.mode!=='list')return h;
   var key='data-act="obu-new">+ Observasi baru</button>',p=h.indexOf(key);if(p<0)return h;
   return h.slice(0,p+key.length)+'<button type="button" class="btn small" data-obe="daftar">Kelola lembar</button>'+h.slice(p+key.length);
  }catch(e){return h}
 };
 /* Tab Observasi pada Edit isi unit: edit lembar terpilih atau buat lembar baru untuk unit ini */
 var t0=window.uoTabEditor;
 if(typeof t0==='function')window.uoTabEditor=function(d){
  var h=t0.apply(this,arguments);
  try{
   var s=d.S;if(!s||OBE.TK.indexOf(s.kelas)<0||!can('observasi'))return h;
   var o=s.obs||{},bisa=o.mode!=='tanpa'&&o.lembar&&obeBolehEdit(o.lembar);
   var tb='<div class="lks-acts">'+(bisa?'<button type="button" class="btn small" data-obe="unit-edit">Edit lembar ini</button>':'')+'<button type="button" class="btn small" data-obe="unit-baru">+ Buat lembar baru</button></div>'+
    '<p class="note">Lembar kelas X dan XI dapat disusun sendiri. Perubahan lembar berlaku untuk semua unit dan sekolah yang memakainya.</p>';
   var q=h.lastIndexOf('</section>');return q<0?h+tb:h.slice(0,q)+tb+h.slice(q);
  }catch(e){return h}
 };
 /* Tombol kembali perangkat menutup editor lebih dulu */
 window.addEventListener('load',function(){
  if(typeof bkBack!=='function')return;
  var b0=bkBack;
  bkBack=function(){if(OBE.st&&!document.querySelector('.ui-ov')){obeTutup();return}return b0.apply(this,arguments)};
 });
})();
