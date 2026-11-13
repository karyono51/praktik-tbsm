/* lkpd-staff.js: alur LKPD Praktik yang disederhanakan untuk Admin dan Guru.
   Dua tingkat saja, tanpa berputar:
     1. Daftar modul per kelas (kartu ringkas: Kelola, Tampil/Sembunyi).
     2. Kelola modul: satu halaman berisi tab Pengumpulan, Analisis, Pengaturan,
        dengan tombol Pratinjau, Edit isi, dan Ekspor di bagian atas.
   Detail pengumpulan (koreksi nilai), editor, dan pratinjau memakai layar lama; tombol kembali selalu
   mengarah ke halaman Kelola modul. Siswa tidak terpengaruh. Memuat ulang fungsi lama tanpa mengubahnya. */
var LKS={id:null,tab:'kumpul',f:'ujian'};
(function(){var st=document.createElement('style');st.textContent=
'.lks-card{display:grid;gap:8px}.lks-acts{display:flex;gap:6px;flex-wrap:wrap}.lks-acts .grow{flex:1 1 auto}'+
'.lks-tabs{position:sticky;top:0;z-index:2;background:var(--bg,var(--surface));padding:4px 0}'+
'.lks-tabs .seg{display:flex}.lks-tabs .seg button{flex:1 1 0}'+
'.lks-more{border:1px solid var(--line);border-radius:12px;padding:8px 12px;background:var(--surface)}.lks-more>summary{cursor:pointer;font-weight:600;font-size:14px;list-style:none}.lks-more>summary::-webkit-details-marker{display:none}.lks-more[open]>summary{margin-bottom:10px}.lks-more .row{margin:6px 0}'+
'.lks-sub{display:grid;gap:6px}.lks-hint{font-size:13px;color:var(--muted)}';
document.head.appendChild(st)})();

function lksOn(){return !!S.user&&isStaff()&&S.tab==='lkpd'}
function lksMod(){return (LKPD_MODULES||[]).find(function(x){return x.id===LKS.id})}
function lksIsLat(x){try{return lkmModeOf(x)==='latihan'}catch(e){return false}}
function lksFlags(){try{return typeof lkiAll==='function'?lkiAll():{}}catch(e){return {}}}

/* ---------- Tingkat 1: daftar modul ---------- */
function lksList(){
 var kb=kelasBoleh();if(kb.indexOf(S.kelas)<0)S.kelas=kb[0];
 var k=lkcKelasInfo(S.kelas),mods=lkcModules(S.kelas,true);
 var cards=mods.map(function(m){
  var c=lkmCfg(m),recs=lkcRecs(m,true),uj=recs.filter(function(x){return !lksIsLat(x)}),pub=lkmPub(m);
  var belum=uj.filter(function(x){return !lkHasK(x)}).length;
  var avg=uj.length?Math.round(uj.reduce(function(t,x){return t+lkNilai(x)},0)/uj.length):0;
  var sum=uj.length?uj.length+' pengumpulan · rata-rata '+avg:'Belum ada pengumpulan';
  return '<article class="card job lks-card"><div class="row sb"><h3 class="grow">'+lkEsc(m.title)+'</h3><span class="pill '+(pub?'ok':'warn')+'">'+(pub?'Tampil':'Tersembunyi')+'</span></div>'+
   '<div class="meta"><span>'+lkEsc(m.unit)+'</span><span class="mono">'+lkEsc(m.duration)+' menit</span><span>'+m.steps.length+' langkah, '+m.quiz.length+' soal</span></div>'+
   '<div class="lkm-tags"><span class="pill '+(c.mode==='latihan'?'ok':'warn')+'">'+(c.mode==='latihan'?'Latihan':'Ujian')+'</span><span class="pill plain">'+lkEsc(sum)+'</span>'+(belum?'<span class="pill bad">'+belum+' perlu dikoreksi</span>':'')+'</div>'+
   '<div class="lks-acts"><button type="button" class="btn primary small grow" data-act="lks-open" data-v="'+lkEsc(m.id)+'">Kelola modul</button>'+
   '<button type="button" class="btn small" data-act="lk-toggle" data-v="'+lkEsc(m.id)+'">'+(pub?'Sembunyikan':'Tampilkan')+'</button></div></article>';
 }).join('');
 var more='<details class="lks-more"'+(typeof LKIO!=='undefined'&&LKIO.imp?' open':'')+'><summary>Lainnya: tampil massal, impor dan ekspor Excel</summary>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small" data-act="lkm-showall">Tampilkan semua</button><button type="button" class="btn small" data-act="lkm-hideall">Sembunyikan semua</button></div>'+
  (typeof lkioHtml==='function'?lkioHtml():'')+'</details>';
 return '<div class="row sb"><div><h2>'+lkEsc(k.judul)+'</h2><p class="note">'+lkEsc(k.sub)+'</p></div><span class="pill plain">'+mods.length+' modul</span></div>'+
  '<div class="lks-acts"><button type="button" class="btn primary small" data-act="lkc-new">+ Modul baru</button><button type="button" class="btn small" data-act="lkc-rekap">Rekap semua modul</button></div>'+
  '<p class="lks-hint">Ketuk Kelola modul untuk melihat pengumpulan, analisis, pengaturan, dan mengedit isi modul dalam satu tempat.'+(kb.length>1?' Ganti kelas lewat menu di dasbor.':'')+'</p>'+
  '<div class="jobs">'+(cards||'<div class="card muted">Belum ada modul untuk kelas ini.</div>')+'</div>'+more;
}

/* ---------- Tingkat 2: kelola satu modul ---------- */
function lksTabs(){
 return '<div class="lks-tabs"><div class="seg" role="tablist" aria-label="Kelola modul">'+[['kumpul','Pengumpulan'],['analisis','Analisis'],['atur','Pengaturan']].map(function(t){
  return '<button type="button" role="tab" data-act="lks-tab" data-v="'+t[0]+'" aria-pressed="'+(LKS.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div></div>';
}
function lksKumpul(m){
 var all=lkcRecs(m,true),lat=all.filter(lksIsLat),uj=all.length-lat.length;
 if(!lat.length&&LKS.f!=='ujian')LKS.f='ujian';
 var rows=all.filter(function(x){return LKS.f==='semua'||!lksIsLat(x)}).sort(function(a,b){
  var ka=lkHasK(a)?1:0,kb=lkHasK(b)?1:0;return ka-kb||String(a.siswa).localeCompare(String(b.siswa))});
 var fl=lksFlags(),nilai=rows.map(lkNilai),avg=rows.length?Math.round(nilai.reduce(function(t,v){return t+v},0)/rows.length):0;
 var belumK=rows.filter(function(x){return !lkHasK(x)}).length;
 var sent={};all.forEach(function(x){sent[x.sid]=1});
 var tdk=(S.users||[]).filter(function(u){return roleList(u).indexOf('siswa')>-1&&u.aktif!==false&&u.kelas===m.kelas&&!sent[u.id]}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama))});
 var chips=lat.length?'<div class="chips" role="group" aria-label="Filter mode">'+[['ujian','Ujian · '+uj],['semua','Ujian + Latihan · '+all.length]].map(function(c){return '<button type="button" data-act="lks-f" data-v="'+c[0]+'" aria-pressed="'+(LKS.f===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>':'';
 var list=rows.map(function(x){
  var v=lkNilai(x),f=fl[x.id],bad=f&&f.some(function(a){return a.lv==='bad'});
  return '<article class="card"><div class="row sb"><b>'+lkEsc(x.siswa)+'</b><span class="pill '+(v>=S.kkm?'ok':'bad')+'">'+v+'/100</span></div>'+
   '<p class="note">'+new Date(x.ts).toLocaleDateString('id-ID')+(lksIsLat(x)?' · Latihan':'')+(lkHasK(x)?' · dikoreksi guru':' · belum dikoreksi')+'</p>'+
   '<div class="lks-acts">'+(f?'<span class="pill '+(bad?'bad':'warn')+'">'+(bad?'Cek nilai':'Perlu dicek')+'</span>':'')+'<button type="button" class="btn small primary" data-act="lk-detail" data-v="'+lkEsc(x.id)+'">'+(lkHasK(x)?'Lihat detail':'Detail dan koreksi')+'</button></div></article>';
 }).join('');
 return '<div class="stats"><div class="card"><span class="label">Terkumpul</span><b class="mono">'+rows.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div><div class="card"><span class="label">Perlu koreksi</span><b class="mono">'+belumK+'</b></div></div>'+chips+
  (list||'<div class="card muted">Belum ada pengumpulan untuk modul ini.</div>')+
  '<section class="card"><h3>Belum mengumpulkan ('+tdk.length+')</h3>'+(tdk.length?'<p class="note">'+tdk.map(function(u){return lkEsc(u.nama)}).join(', ')+'</p>':'<p class="muted">Semua siswa kelas ini sudah mengumpulkan, atau data siswa belum tersedia.</p>')+'</section>';
}
function lksAnalisis(m){
 LKA.id=m.id;
 var h=lkaView();
 return h.replace('<button type="button" class="btn small" data-act="lka-close">‹ Daftar LKPD</button>','<span></span>').replace(/<h2>Analisis: [^<]*<\/h2>/,'');
}
function lksOpenAtur(m){
 if(LKM.edit===m.id&&LKM.d)return;
 var c=lkmCfg(m);LKM.edit=m.id;
 LKM.d={tampil:lkmPub(m),mode:c.mode,maxTry:c.maxTry,showKey:c.showKey,hideTeori:c.hideTeori,hideLangkah:c.hideLangkah,hidePetunjuk:c.hidePetunjuk,buka:c.buka,tutup:c.tutup,semua:false,fotoWajib:(Array.isArray(m.fotoWajib)?m.fotoWajib.slice():[])};
}
function lksHub(){
 var m=lksMod();if(!m||m.kelas!==S.kelas){LKS.id=null;LKA.id=null;return lksList()}
 var c=lkmCfg(m),pub=lkmPub(m),body='';
 if(LKS.tab==='analisis'){body=lksAnalisis(m)}
 else{LKA.id=null;
  if(LKS.tab==='atur'){lksOpenAtur(m);body=lkmPanel()}
  else body=lksKumpul(m)}
 var xp=(typeof lkioOk==='function'&&lkioOk())?'<button type="button" class="btn small" data-lkio="exp-one" data-v="'+lkEsc(m.id)+'">Ekspor</button>':'';
 return '<div class="row"><button type="button" class="btn small" data-act="lks-list">‹ Daftar modul '+lkEsc(lkcKelasInfo(S.kelas).judul)+'</button></div>'+
  '<section class="card lks-card"><div class="row sb"><h2 class="grow">'+lkEsc(m.title)+'</h2><span class="pill '+(pub?'ok':'warn')+'">'+(pub?'Tampil':'Tersembunyi')+'</span></div>'+
  '<div class="meta"><span>'+lkEsc(m.unit)+'</span><span class="mono">'+lkEsc(m.duration)+' menit</span><span>'+(c.mode==='latihan'?'Latihan':'Ujian')+'</span></div>'+
  '<div class="lks-acts"><button type="button" class="btn small" data-act="lks-preview" data-v="'+lkEsc(m.id)+'">Pratinjau</button><button type="button" class="btn small" data-act="lks-edit" data-v="'+lkEsc(m.id)+'">Edit isi</button>'+xp+
  '<button type="button" class="btn small" data-act="lk-toggle" data-v="'+lkEsc(m.id)+'">'+(pub?'Sembunyikan':'Tampilkan')+'</button></div></section>'+
  lksTabs()+body;
}


/* Perbaikan sekali jalan: modul bawaan yang sudah terlanjur disembunyikan belum bisa dibaca siswa, sehingga di sisi siswa
   modul itu kembali memakai versi bawaan (tampil). Tandai agar izin baca ikut diperbarui saat sinkron berikutnya. */
function lksHeal(){
 try{
  if(LKS.healed||!Cloud.on||!S.user||!isStaff())return;
  var ms=S.lkpdModules||[];if(!ms.length)return;
  LKS.healed=true;   /* sekali per sesi: murah, dan tidak bergantung pada penanda lama di perangkat */
  var n=0;ms.forEach(function(m){if(lkBuiltin(m.id)&&(m.status!=='published'||m.active===false)&&m.r){m.d=1;n++}});
  if(n)lkSaveModules();
 }catch(e){}
}

/* ---------- Pengganti viewLKPD untuk guru/admin ---------- */
var _lksView=viewLKPD;
viewLKPD=function(){
 if(!lksOn())return _lksView();
 lksHeal();
 if(LK.detail||LK.editor){LKA.id=null;return _lksView()}
 if(LK.open&&LK.tab==='editor'){LK.open=false;LK.tab='materi'}   /* daftar Editor Guru lama tidak dipakai lagi */
 if(LK.open){LKA.id=null;return _lksView()}                      /* pratinjau dan rekap semua modul */
 if(LKS.id){return lksHub()}
 LKA.id=null;LKM.edit=null;LKM.d=null;
 return lksList();
};

/* Tombol kembali HP: dari Kelola modul ke daftar modul */
var _lksBack=bkBack;
bkBack=function(){
 if(lksOn()&&LKS.id&&!LK.open&&!LK.detail&&!LK.editor&&V.mode==='list'&&!document.querySelector('.ui-ov')){
  LKS.id=null;LKA.id=null;LKM.edit=null;LKM.d=null;render();window.scrollTo(0,0);return;
 }
 _lksBack();
};

/* ---------- Aksi ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;
 var a=b.dataset.act,v=b.dataset.v;
 /* pilih kelas dari menu/beranda: selalu mulai dari daftar modul */
 if(a==='menu'&&String(v).indexOf('lkpd:')===0){LKS.id=null;LKA.id=null;LKM.edit=null;LKM.d=null;return}
 if(!isStaff())return;
 if(a==='lks-open'){LKS.id=v;LKS.tab='kumpul';LKS.f='ujian';LKM.edit=null;LKM.d=null;LK.open=false;LK.detail=null;LK.editor=null;LK.preview=false;render();window.scrollTo(0,0)}
 else if(a==='lks-list'){LKS.id=null;LKA.id=null;LKM.edit=null;LKM.d=null;render();window.scrollTo(0,0)}
 else if(a==='lks-tab'){LKS.tab=v;LKM.edit=null;LKM.d=null;if(v==='analisis'){var m=lksMod();if(m)LKA.mode=lkmCfg(m).mode==='latihan'?'latihan':'ujian'}render()}
 else if(a==='lks-f'){LKS.f=v;render()}
 else if(a==='lks-preview'){LK.module=v;LK.tab='materi';LK.detail=null;LK.editor=null;LK.preview=true;LK.open=true;LKA.id=null;render();window.scrollTo(0,0)}
 else if(a==='lks-edit'){var mm=LKPD_MODULES.find(function(x){return x.id===v});if(mm){LK.module=v;LK.tab='editor';LK.detail=null;LK.preview=false;LK.open=true;LKA.id=null;LKM.edit=null;LKM.d=null;LK.editor=lkEditorDefaults(mm);render();window.scrollTo(0,0)}}
},true);
/* Setelah Simpan atau Batal pengaturan, kembali ke tab Pengumpulan */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="lkm-save"],[data-act="lkm-cancel"]');
 if(!b||!lksOn()||!LKS.id)return;
 setTimeout(function(){if(!LKM.edit&&LKS.tab==='atur'){LKS.tab='kumpul';render()}},0);
},true);
