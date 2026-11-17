/* lkpd-samakan.js: Edit LKPD disamakan dengan fasilitas Edit UKK (ukk-kelola.js).
   Berdiri sendiri: membungkus fungsi lkpd-editor.js dan lkpd-staff.js tanpa mengubah berkasnya.
   Yang disamakan:
   1. Halaman Kelola LKPD: tombol Duplikat, Kembalikan bawaan (LKPD bawaan yang sudah diedit), dan Hapus (LKPD buatan sendiri).
   2. Editor: tombol Kembali HP menutup editor tanpa tanya bila belum ada perubahan, dan bertanya hanya bila ada perubahan.
   3. Editor: pindah menu, tab, atau kelas menutup editor yang belum berubah (tidak tertinggal terbuka).
   4. Editor: ID baru juga diperiksa terhadap unit UKK (dokumen UKK memakai koleksi yang sama), dan ukuran dokumen dibatasi.
   5. Editor tab Pemeriksaan: kolom Standar manual dan centang Wajib foto langsung per baris (sebelumnya hanya di Pengaturan). Ikut naik, turun,
      hapus, dan salin bersama barisnya. Pengaturan lama tetap bisa dipakai. */
var LKZ={MAXBYTES:450*1024};

/* ---------- 1. Kelola LKPD: Duplikat, Kembalikan bawaan, Hapus ---------- */
function lkzHasCopy(id){return (S.lkpdModules||[]).some(function(x){return (x.id||x.moduleId)===id})}
(function(){
 var h0=lksHub;
 lksHub=function(){
  var html=h0.apply(this,arguments),m=lksMod();
  if(!m||!isStaff())return html;
  var id=lkEsc(m.id),extra='<button type="button" class="btn small" data-act="lks-dup" data-v="'+id+'">Duplikat</button>';
  if(lkBuiltin(m.id)&&lkzHasCopy(m.id))extra+='<button type="button" class="btn small" data-act="lks-reset" data-v="'+id+'">Kembalikan bawaan</button>';
  if(!lkBuiltin(m.id))extra+='<button type="button" class="btn small danger" data-act="lks-hapus" data-v="'+id+'">Hapus</button>';
  return html.replace(/(data-act="lk-toggle"[^>]*>[^<]*<\/button>)(<\/div><\/section>)/,'$1'+extra+'$2');
 };
})();
/* Hapus salinan tersimpan (LKPD buatan sendiri dihapus, LKPD bawaan kembali ke isi aslinya). Pengumpulan siswa tidak disentuh. */
function lkzHapusDoc(id,done){
 if(Cloud.on&&navigator.onLine===false){toast('Perlu koneksi internet untuk langkah ini');return}
 var lokal=function(){
  S.lkpdModules=(S.lkpdModules||[]).filter(function(x){return (x.id||x.moduleId)!==id});
  lkSaveModules();lkRefreshModules();done()};
 if(Cloud.on)Cloud.remove('lkpd_modules',id).then(function(ok){if(ok)lokal()});else lokal();
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;
 var a=b.dataset.act,v=b.dataset.v;
 if(a.indexOf('lks-')!==0||['lks-dup','lks-reset','lks-hapus'].indexOf(a)<0||!isStaff())return;
 e.stopPropagation();
 var m=(LKPD_MODULES||[]).find(function(x){return x.id===v});if(!m)return;
 if(a==='lks-dup'){
  var c=lkEditorDefaults(m);c.id='';c.title=m.title+' (salinan)';c.status='draft';c.active=false;c.kelas=m.kelas;
  LK.module=v;LK.tab='editor';LK.detail=null;LK.preview=false;LK.open=true;LKA.id=null;LKM.edit=null;LKM.d=null;LK.editor=c;
  render();window.scrollTo(0,0);
 }else if(a==='lks-reset'&&lkBuiltin(v)){
  uiConfirm('Kembalikan '+m.title+' ke isi bawaan aplikasi?\nHasil edit dan pengaturan LKPD ini akan hilang. Pengumpulan siswa tidak dihapus.',{ok:'Kembalikan'}).then(function(ok){
   if(!ok)return;lkzHapusDoc(v,function(){LKM.edit=null;LKM.d=null;render();toast('Dikembalikan ke bawaan')});
  });
 }else if(a==='lks-hapus'&&!lkBuiltin(v)){
  uiConfirm('Hapus LKPD "'+m.title+'"?\nPengumpulan siswa yang sudah tersimpan tidak dihapus dan tetap terbaca di rekap.',{ok:'Hapus',danger:true}).then(function(ok){
   if(!ok)return;lkzHapusDoc(v,function(){LKS.id=null;LKA.id=null;LKM.edit=null;LKM.d=null;render();window.scrollTo(0,0);toast('LKPD dihapus')});
  });
 }
},true);

/* ---------- 2. Tombol Kembali HP: tanya hanya bila ada perubahan ---------- */
(function(){
 var b0=bkBack;
 bkBack=function(){
  var d=LK.editor;
  if(S.user&&isStaff()&&S.tab==='lkpd'&&d&&d.S&&!LK.detail&&!(typeof LKA!=='undefined'&&LKA.id)&&!document.querySelector('.ui-ov')){
   if(lkeDirty(d)){
    if(!uiOk('bklkeditor','Tutup editor?\nPerubahan yang belum disimpan akan hilang. Draf tetap tersimpan di perangkat ini.',function(){bkBack()},{ok:'Tutup',danger:true}))return;
   }else lkeDraftClear();
   LK.editor=null;LK.open=false;LK.tab='materi';LK.preview=false;render();window.scrollTo(0,0);return;
  }
  b0.apply(this,arguments);
 };
})();

/* ---------- 3. Pindah menu, tab, atau kelas menutup editor yang belum berubah ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;
 var a=b.dataset.act;
 if(a!=='menu'&&a!=='tab'&&a!=='kelas'&&a!=='kat-kelas')return;
 var d=LK.editor;
 if(d&&d.S&&!lkeDirty(d)){lkeDraftClear();LK.editor=null;LK.open=false;LK.tab='materi';LK.preview=false}
},true);

/* ---------- 4. Pemeriksaan tambahan saat menyimpan ---------- */
(function(){
 var i0=lkeIssues;
 lkeIssues=function(d){
  var I=i0.apply(this,arguments),s=d.S,id=lkeT(s.id);
  if(d.isNew&&/^[A-Za-z0-9_-]{2,32}$/.test(id)&&!I.some(function(x){return x.tab==='info'&&/sudah dipakai/.test(x.msg)})){
   try{if(typeof ukkIdTaken==='function'&&ukkIdTaken(id))I.push({tab:'info',msg:'ID "'+id+'" sudah dipakai unit UKK atau LKPD lain'})}catch(e){}
  }
  try{if(JSON.stringify(s).length>LKZ.MAXBYTES)I.push({tab:'soal',msg:'Ukuran LKPD terlalu besar (maks. sekitar 450 KB). Kurangi teks atau soal.'})}catch(e){}
  return I;
 };
})();

/* ---------- 5. Wajib foto dan Standar manual per baris pemeriksaan ---------- */
/* Baris pemeriksaan di editor: [komponen, kriteria, fotoWajib(boolean), standarManual]. Elemen boolean tidak dihitung saat
   menilai baris kosong. Di modul tersimpan: [komponen, kriteria] atau [komponen, kriteria, standar] bila standar diisi;
   foto wajib tetap di modul.fotoWajib (daftar indeks). Standar manual tampil pada siswa sebagai "Acuan". */
lkeBlank=function(row){return !lkeAny(row.filter(function(x){return typeof x!=='boolean'}))};
(function(){
 var init0=lkeInit;
 lkeInit=function(d){
  var had=!!d.S,s=init0.apply(this,arguments);
  if(!had&&!d._fz){
   d._fz=true;
   var src=d.src||{},fw=Array.isArray(src.fotoWajib)?src.fotoWajib:[],sc=src.checks||[];
   s.checks.forEach(function(r,i){r[2]=fw.indexOf(i)>-1;r[3]=String((sc[i]&&sc[i][2])||'')});
   d.snap=JSON.stringify(s);
   /* draf lama (tanpa penanda foto dan standar) dibandingkan ulang terhadap kondisi awal yang baru */
   try{
    var raw=JSON.parse(localStorage.getItem(LKE.DKEY)||'null'),k=d.id||'(baru)';
    d.rec=(raw&&raw.k===k&&raw.S&&JSON.stringify(raw.S)!==d.snap&&Date.now()-raw.ts<14*864e5)?raw:null;
   }catch(e){}
  }
  return s;
 };
 var p0=lkePairs;
 lkePairs=function(d,p){
  var html=p0.apply(this,arguments);
  if(p!=='checks')return html;
  return html.replace(/(<input data-lke="checks\.(\d+)\.1"[^>]*>)(<\/div>)/g,function(_,inp,i,end){
   var r=d.S.checks[+i]||[];
   return inp+'<textarea class="lke-1" rows="1" data-lke="checks.'+i+'.3" placeholder="Standar manual (opsional, contoh: 12,6–13,2 V)">'+esc(r[3]||'')+'</textarea>'+
    '<label class="lkz-foto"><input type="checkbox" data-lke="checks.'+i+'.2"'+(r[2]===true?' checked':'')+'><span>Wajib foto bukti</span></label>'+end;
  });
 };
 var pb0=lkePasteBox;
 lkePasteBox=function(d,p){
  var h=pb0.apply(this,arguments);
  return p==='checks'?h.replace('Komponen | Kriteria','Komponen | Kriteria | Standar manual (bagian ketiga opsional)'):h;
 };
 var pp0=lkeParsePaste;
 lkeParsePaste=function(p,txt){
  var out=pp0.apply(this,arguments);
  if(p!=='checks')return out;
  var lines=String(txt).replace(/\r\n?/g,'\n').split('\n').map(function(x){return x.trim()}).filter(Boolean);
  if(lines.length!==out.length)return out;
  lines.forEach(function(l,i){
   var a=l.replace(/^(?:[-•*·]+|\d+[.)])\s*/,'').split('|').map(function(x){return x.trim()});
   if(a.length>=3){out[i]=[a[0],a[1],false,a.slice(2).join(' | ')]}
  });
  return out;
 };
 var b0=lkeBuild;
 lkeBuild=function(d){
  var m=b0.apply(this,arguments),s=d.S,idx=[],n=0;
  s.checks.forEach(function(r){
   if(lkeBlank(r))return;
   if(r[2]===true)idx.push(n);
   var std=lkeT(r[3]);if(std&&m.checks[n])m.checks[n].push(std);
   n++;
  });
  if(idx.length||Array.isArray(m.fotoWajib))m.fotoWajib=idx;
  return m;
 };
 var i1=lkeIssues;
 lkeIssues=function(d){
  var I=i1.apply(this,arguments);
  d.S.checks.forEach(function(r,i){if(!lkeBlank(r)&&lkeT(r[3]).length>300)I.push({tab:'cek',msg:'Komponen no. '+(i+1)+': standar manual maksimal 300 karakter'})});
  return I;
 };
})();
(function(){var st=document.createElement('style');st.textContent=
'.lkz-foto{display:flex;align-items:center;gap:8px;font-size:13.5px}.lkz-foto input{width:22px;height:22px;accent-color:var(--accent)}'+
'.lk-acuan{display:block;margin-top:4px;color:var(--muted);font-size:12.5px}';
document.head.appendChild(st)})();
