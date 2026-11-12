/* lkpd-mode.js: pengaturan LKPD untuk guru dan admin: tampil/sembunyi, mode Ujian atau Latihan, kesempatan, jadwal, pembahasan.
   Disimpan pada objek modul (ikut payload modul ke server). Berdiri sendiri: membungkus fungsi lkpd.js tanpa mengubahnya. */
var LKM={edit:null,d:null,reveal:{},sub:null};
(function(){var st=document.createElement('style');st.textContent=
'.lkm-banner{border-left:4px solid var(--accent);font-size:13.5px;line-height:1.5}.lkm-banner[data-m="ujian"]{border-left-color:var(--warn)}'+
'.lkm-tags{display:flex;flex-wrap:wrap;gap:6px}#lkm-panel{border:2px solid var(--accent);display:grid;gap:10px}';
document.head.appendChild(st)})();

/* ---- Konfigurasi modul ---- */
function lkmCfg(m){return {mode:m&&m.mode==='latihan'?'latihan':'ujian',maxTry:Math.max(0,parseInt(m&&m.maxTry,10)||0),showKey:!m||m.showKey!==false,hideTeori:!m||m.hideTeori!==false,hideLangkah:!m||m.hideLangkah!==false,hidePetunjuk:!m||m.hidePetunjuk!==false,buka:(m&&m.buka)||'',tutup:(m&&m.tutup)||''}}
function lkmT(s){var t=s?new Date(s).getTime():0;return isNaN(t)?0:t}
function lkmFmt(s){var t=lkmT(s);return t?new Date(t).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
function lkmLock(m){var c=lkmCfg(m),n=Date.now(),b=lkmT(c.buka),t=lkmT(c.tutup);if(b&&n<b)return 'Belum dibuka. Dibuka '+lkmFmt(c.buka);if(t&&n>t)return 'Sudah ditutup sejak '+lkmFmt(c.tutup);return ''}
function lkmModeOf(x){try{var p=typeof x.payload==='string'?JSON.parse(x.payload||'{}'):x.payload;return p&&p.mode==='latihan'?'latihan':'ujian'}catch(e){return 'ujian'}}
function lkmUsed(m){return (S.lkpd||[]).filter(function(x){return x.moduleId===m.id&&x.sid===S.user.id&&lkmModeOf(x)!=='latihan'}).length}
function lkmCur(){return (LKPD_MODULES||[]).find(function(x){return x.id===LK.module})}
function lkmPub(m){return m.status==='published'&&m.active!==false}

/* ---- Daftar LKPD per kelas (menggantikan tampilan daftar lama) ---- */
function lkListView(){
 var staff=isStaff(),kb=kelasBoleh();if(kb.indexOf(S.kelas)<0)S.kelas=kb[0];
 var k=lkcKelasInfo(S.kelas),mods=lkcModules(S.kelas,staff),panel=(staff&&LKM.edit)?lkmPanel():'';
 var cards=mods.map(function(m){
  var c=lkmCfg(m),recs=lkcRecs(m,staff),uj=recs.filter(function(x){return lkmModeOf(x)!=='latihan'}),la=recs.filter(function(x){return lkmModeOf(x)==='latihan'}),pub=lkmPub(m),st='',cls='',acts='',tags='';
  tags='<span class="pill '+(c.mode==='latihan'?'ok':'warn')+'">'+(c.mode==='latihan'?'Latihan':'Ujian')+'</span>'+
   (c.mode==='ujian'&&c.maxTry?'<span class="pill plain">'+c.maxTry+'× kesempatan</span>':'')+
   (c.buka?'<span class="pill plain">Buka '+lkEsc(lkmFmt(c.buka))+'</span>':'')+(c.tutup?'<span class="pill plain">Tutup '+lkEsc(lkmFmt(c.tutup))+'</span>':'');
  if(staff){
   var avg=uj.length?Math.round(uj.reduce(function(t,x){return t+lkNilai(x)},0)/uj.length):0,belum=uj.filter(function(x){return !lkHasK(x)}).length,parts=[];
   if(uj.length)parts.push(uj.length+' pengumpulan · rata-rata '+avg+(belum?' · '+belum+' belum dikoreksi':''));
   if(la.length)parts.push(la.length+' percobaan latihan');
   st='<span class="pill plain">'+(parts.length?parts.join(' · '):'Belum ada pengumpulan')+'</span>';
   acts='<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="lkc-open" data-v="'+lkEsc(m.id)+'">Buka modul</button><button type="button" class="btn small" data-act="lkc-preview" data-v="'+lkEsc(m.id)+'">Pratinjau</button><button type="button" class="btn small" data-act="lkc-edit" data-v="'+lkEsc(m.id)+'">Edit</button><button type="button" class="btn small" data-act="lkm-open" data-v="'+lkEsc(m.id)+'">Pengaturan</button><button type="button" class="btn small" data-act="lk-toggle" data-v="'+lkEsc(m.id)+'">'+(pub?'Sembunyikan':'Tampilkan')+'</button></div>';
  }else{
   var lock=lkmLock(m),used=uj.length,habis=c.mode==='ujian'&&c.maxTry>0&&used>=c.maxTry,l;
   if(c.mode==='latihan'){
    l=la.slice().sort(function(a,b){return b.ts-a.ts})[0];
    st=l?'<span class="pill plain">Skor latihan terakhir '+lkNilai(l)+' · '+la.length+' percobaan</span>':'<span class="pill plain">Belum dicoba</span>';
   }else{
    l=uj.slice().sort(function(a,b){return b.ts-a.ts})[0];
    if(l){var v=lkNilai(l),ok=v>=S.kkm;cls=ok?'st-ok':'st-bad';st='<span class="pill '+(ok?'ok':'bad')+'">'+(ok?'Kompeten':'Belum kompeten')+' · '+v+'</span>'+(lkHasK(l)?'':' <span class="pill plain">Menunggu guru</span>')}
    else st='<span class="pill plain">Belum dikerjakan</span>';
    if(c.maxTry)tags+='<span class="pill '+(habis?'bad':'plain')+'">Kesempatan '+used+'/'+c.maxTry+'</span>';
   }
   if(lock)acts='<span class="pill warn">'+lkEsc(lock)+'</span>';
   else acts='<button type="button" class="btn primary small" data-act="lkc-open" data-v="'+lkEsc(m.id)+'">'+(habis?'Lihat materi':(c.mode==='latihan'?(l?'Latihan lagi':'Mulai latihan'):(l?'Buka lagi':'Mulai praktik')))+'</button>';
  }
  return '<article class="card job '+cls+'"><div class="row sb"><h3 class="grow">'+lkEsc(m.title)+'</h3>'+(staff?'<span class="pill '+(pub?'ok':'warn')+'">'+(pub?'Tampil':'Tersembunyi')+'</span>':'')+'</div>'+
   '<div class="meta"><span>'+lkEsc(m.unit)+'</span><span class="mono">'+lkEsc(m.duration)+' menit</span><span>'+m.steps.length+' langkah, '+m.quiz.length+' soal</span></div>'+
   (m.skkni?'<div><span class="pill plain mono" title="Kode unit SKKNI">SKKNI '+lkEsc(m.skkni)+'</span></div>':'')+
   '<div class="lkm-tags">'+tags+'</div><div class="row sb" style="flex-wrap:wrap;gap:8px">'+st+'</div>'+acts+'</article>';
 }).join('');
 var top=staff?'<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="lkc-new">+ Modul baru</button><button type="button" class="btn small" data-act="lkc-rekap">Rekap kelas</button><button type="button" class="btn small" data-act="lkm-showall">Tampilkan semua</button><button type="button" class="btn small" data-act="lkm-hideall">Sembunyikan semua</button></div>':'<div class="row"><button type="button" class="btn small" data-act="lkc-rekap">Riwayat saya</button></div>';
 return '<div class="row sb"><div><h2>'+lkEsc(k.judul)+'</h2><p class="note">'+lkEsc(k.sub)+'</p></div><span class="pill plain">'+mods.length+' modul</span></div>'+
  '<p class="note">'+(staff?'Mode guru: atur tampil/sembunyi, mode Ujian atau Latihan, kesempatan, dan jadwal tiap modul lewat tombol Pengaturan. Nilai Ujian masuk rekap, nilai Latihan tidak.':'Kerjakan LKPD praktik, lampirkan foto bukti, lalu kirim. Modul berlabel Latihan boleh diulang dan nilainya tidak masuk rekap. Modul berlabel Ujian dinilai guru.')+' '+(kb.length>1?'Ganti kelas lewat menu di dasbor.':'Modul di sini khusus kelas kamu.')+'</p>'+top+panel+
  '<div class="jobs">'+(cards||'<div class="card muted">'+(staff?'Belum ada modul untuk kelas ini.':'Belum ada modul LKPD tampil untuk kelas ini. Hubungi guru.')+'</div>')+'</div>';
}

/* ---- Panel pengaturan (guru dan admin) ---- */
function lkmPanel(){
 var d=LKM.d,m=LKPD_MODULES.find(function(x){return x.id===LKM.edit});if(!m||!d)return '';
 var tries=[[0,'Tidak terbatas'],[1,'1 kali'],[2,'2 kali'],[3,'3 kali']].map(function(o){return '<option value="'+o[0]+'"'+(+d.maxTry===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('');
 var info=d.mode==='latihan'?'Latihan: siswa boleh mengulang tanpa batas. Nilai tidak masuk Rekap nilai.':'Ujian: nilai masuk Rekap nilai dan dikoreksi guru.'+(+d.maxTry?' Pengiriman dibatasi '+(+d.maxTry)+' kali per siswa.':'');
 return '<section class="card" id="lkm-panel"><div class="row sb"><h3 class="grow">Pengaturan: '+lkEsc(m.title)+'</h3><button type="button" class="btn small" data-act="lkm-cancel">Batal</button></div>'+
  '<label class="lk-check"><input type="checkbox" data-lkm="tampil"'+(d.tampil?' checked':'')+'><span><b>Tampilkan ke siswa</b><small>Matikan untuk menyembunyikan modul (jadi draft).</small></span></label>'+
  '<div><span class="label">Mode</span><div class="seg" role="group" aria-label="Mode LKPD"><button type="button" data-act="lkm-mode" data-v="latihan" aria-pressed="'+(d.mode==='latihan')+'">Latihan</button><button type="button" data-act="lkm-mode" data-v="ujian" aria-pressed="'+(d.mode==='ujian')+'">Ujian</button></div></div>'+
  '<p class="note">'+lkEsc(info)+'</p>'+
  (d.mode==='ujian'?'<label class="f">Kesempatan mengirim<select data-lkm="maxTry">'+tries+'</select></label><span class="label">Isi yang disembunyikan saat Ujian</span>'+[['hideTeori','Teori ringkas','Siswa tidak melihat materi teori di tab Materi.'],['hideLangkah','Penjelasan langkah prosedur','Hanya judul dan durasi langkah yang tampil.'],['hidePetunjuk','Petunjuk komponen di Lembar Kerja','Keterangan di bawah nama komponen disembunyikan.']].map(function(o){return '<label class="lk-check"><input type="checkbox" data-lkm="'+o[0]+'"'+(d[o[0]]?' checked':'')+'><span><b>'+o[1]+'</b><small>'+o[2]+'</small></span></label>'}).join('')+'<p class="note">Soal evaluasi, K3, alat dan bahan, serta lembar kerja tetap tampil. Pratinjau menampilkan versi siswa.</p>':'<label class="lk-check"><input type="checkbox" data-lkm="showKey"'+(d.showKey?' checked':'')+'><span><b>Tampilkan kunci dan pembahasan</b><small>Siswa bisa memeriksa jawaban soal di tab Evaluasi.</small></span></label>')+
  lkmFotoPanel(m,d)+
  '<div class="two"><label class="f">Dibuka (opsional)<input type="datetime-local" data-lkm="buka" value="'+lkEsc(d.buka)+'"></label><label class="f">Ditutup (opsional)<input type="datetime-local" data-lkm="tutup" value="'+lkEsc(d.tutup)+'"></label></div>'+
  '<div><button type="button" class="btn small" data-act="lkm-clear">Kosongkan jadwal</button></div>'+
  '<label class="lk-check"><input type="checkbox" data-lkm="semua"'+(d.semua?' checked':'')+'><span><b>Terapkan mode, kesempatan, dan pembahasan ke semua modul '+lkEsc(lkcKelasInfo(S.kelas).judul)+'</b><small>Status tampil dan jadwal tidak ikut diubah.</small></span></label>'+
  '<div class="row"><button type="button" class="btn" data-act="lkm-cancel">Batal</button><button type="button" class="btn primary grow" data-act="lkm-save">Simpan pengaturan</button></div></section>';
}
function lkmFotoPanel(m,d){
 var w=Array.isArray(d.fotoWajib)?d.fotoWajib:[];
 return '<div><span class="label">Foto bukti wajib per komponen</span><p class="note">Centang komponen di tabel Hasil pemeriksaan yang wajib difoto siswa. Siswa tidak bisa mengirim LKPD sebelum semua foto wajib terisi. Tanpa centang, foto bersifat opsional.</p>'+
  m.checks.map(function(c,i){return '<label class="lk-check"><input type="checkbox" data-lkm-foto="'+i+'"'+(w.indexOf(i)>-1?' checked':'')+'><span><b>'+(i+1)+'. '+lkEsc(c[0])+'</b><small>'+lkEsc(c[1])+'</small></span></label>'}).join('')+
  '<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small" data-act="lkm-foto-all">Wajibkan semua</button><button type="button" class="btn small" data-act="lkm-foto-none">Kosongkan</button></div></div>';
}
function lkmApply(src,d,full){
 var cp=lkSerialize(src);cp.mode=d.mode;cp.maxTry=Math.max(0,parseInt(d.maxTry,10)||0);cp.showKey=!!d.showKey;cp.hideTeori=!!d.hideTeori;cp.hideLangkah=!!d.hideLangkah;cp.hidePetunjuk=!!d.hidePetunjuk;
 if(full){cp.fotoWajib=(d.fotoWajib||[]).filter(function(i){return cp.checks[i]}).sort(function(a,b){return a-b});cp.status=d.tampil?'published':'draft';cp.active=!!d.tampil;if(d.buka)cp.buka=d.buka;else delete cp.buka;if(d.tutup)cp.tutup=d.tutup;else delete cp.tutup}
 lkModuleStore(cp);
}
function lkmSave(){
 var d=LKM.d,m=LKPD_MODULES.find(function(x){return x.id===LKM.edit});if(!m||!d)return;
 if(d.buka&&d.tutup&&lkmT(d.tutup)<=lkmT(d.buka)){toast('Waktu tutup harus setelah waktu buka');return}
 var n=1;lkmApply(m,d,true);
 if(d.semua)lkcModules(S.kelas,true).forEach(function(x){if(x.id!==m.id){lkmApply(x,d,false);n++}});
 LKM.edit=null;LKM.d=null;render();toast(n>1?'Pengaturan diterapkan ke '+n+' modul':'Pengaturan tersimpan');
 setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500);
}
function lkmBulk(show){
 var ms=lkcModules(S.kelas,true);if(!ms.length)return;
 uiConfirm((show?'Tampilkan':'Sembunyikan')+' semua '+ms.length+' modul '+lkcKelasInfo(S.kelas).judul+' untuk siswa?',{ok:show?'Tampilkan':'Sembunyikan'}).then(function(ok){
  if(!ok)return;
  ms.forEach(function(m){var cp=lkSerialize(m);cp.status=show?'published':'draft';cp.active=show;lkModuleStore(cp)});
  render();toast(show?'Semua modul ditampilkan':'Semua modul disembunyikan');
  setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500);
 });
}

/* ---- Aksi ---- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a==='lkc-open'&&!isStaff()){var mm=LKPD_MODULES.find(function(x){return x.id===v});var lk=mm?lkmLock(mm):'';if(lk){e.stopPropagation();toast(lk)}return}
 if(a==='lkm-reveal'){var cm=lkmCur();if(cm){LKM.reveal[cm.id]=!LKM.reveal[cm.id];render()}return}
 if(a.indexOf('lkm-')!==0||!isStaff())return;
 e.stopPropagation();
 if(a==='lkm-open'){var m=LKPD_MODULES.find(function(x){return x.id===v});if(!m)return;var c=lkmCfg(m);LKM.edit=v;LKM.d={tampil:lkmPub(m),mode:c.mode,maxTry:c.maxTry,showKey:c.showKey,hideTeori:c.hideTeori,hideLangkah:c.hideLangkah,hidePetunjuk:c.hidePetunjuk,buka:c.buka,tutup:c.tutup,semua:false,fotoWajib:(Array.isArray(m.fotoWajib)?m.fotoWajib.slice():[])};render();window.scrollTo(0,0)}
 else if(a==='lkm-cancel'){LKM.edit=null;LKM.d=null;render()}
 else if(a==='lkm-mode'&&LKM.d){LKM.d.mode=v;render()}
 else if(a==='lkm-foto-all'&&LKM.d){var mm=LKPD_MODULES.find(function(x){return x.id===LKM.edit});LKM.d.fotoWajib=mm.checks.map(function(c,i){return i});render()}
 else if(a==='lkm-foto-none'&&LKM.d){LKM.d.fotoWajib=[];render()}
 else if(a==='lkm-clear'&&LKM.d){LKM.d.buka='';LKM.d.tutup='';render()}
 else if(a==='lkm-save')lkmSave();
 else if(a==='lkm-showall')lkmBulk(true);
 else if(a==='lkm-hideall')lkmBulk(false);
},true);
document.addEventListener('change',function(e){
 var t=e.target;
 if(LKM.d&&t.dataset&&t.dataset.lkmFoto!==undefined){var i=Number(t.dataset.lkmFoto),w=(LKM.d.fotoWajib||[]).filter(function(x){return x!==i});if(t.checked)w.push(i);LKM.d.fotoWajib=w;return}
 if(!LKM.d||!t.dataset||!t.dataset.lkm)return;
 var n=t.dataset.lkm;LKM.d[n]=t.type==='checkbox'?t.checked:t.value;
});

/* ---- Tampilan modul: spanduk mode dan pembahasan latihan ---- */
function lkmFilter(h,c){
 if(c.mode!=='ujian')return h;
 try{
  if(LK.tab==='materi'){
   if(c.hideTeori)h=h.replace(/<h3>Teori ringkas<\/h3>[\s\S]*?(?=<div class="note">Gunakan manual)/,'<p class="note">Teori ringkas tidak ditampilkan pada mode Ujian.</p>');
   if(c.hideLangkah)h=h.replace(/(<label class="lk-step">[\s\S]*?<\/b>)<small>[\s\S]*?<\/small>/g,'$1');
  }else if(LK.tab==='kerja'&&c.hidePetunjuk){
   h=h.replace(/(<td data-label="Komponen">[^<]*)<small>[\s\S]*?<\/small>/g,'$1');
  }
 }catch(e){}
 return h;
}
var _lkmView=viewLKPD;
viewLKPD=function(){
 var h=_lkmView();
 if(LK.detail||LK.editor||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return h;
 var m=lkmCur();if(!m)return h;
 var c=lkmCfg(m),lock=lkmLock(m),t;
 if(c.mode==='latihan')t='<b>Mode Latihan</b> · boleh diulang tanpa batas, nilai tidak masuk rekap'+(c.showKey?', pembahasan bisa dilihat di tab Evaluasi.':'.');
 else t='<b>Mode Ujian</b> · nilai masuk rekap dan dikoreksi guru'+(c.maxTry?'. Kesempatan mengirim '+c.maxTry+' kali'+(isStaff()?'':' (terpakai '+lkmUsed(m)+')'):'')+(c.tutup?'. Ditutup '+lkEsc(lkmFmt(c.tutup)):'')+'.';
 if(lock)t+=' <b>'+lkEsc(lock)+'.</b>';
 var siswaView=!isStaff()||LK.preview;
 if(siswaView)h=lkmFilter(h,c);
 else if(c.mode==='ujian')t+=' Siswa melihat versi ringkas (teori, penjelasan langkah, dan petunjuk komponen dapat disembunyikan). Pakai Pratinjau untuk melihatnya.';
 var ban='<div class="card lkm-banner" data-m="'+c.mode+'">'+t+'</div>',i=h.indexOf('<div class="chips">');
 h=i>-1?h.slice(0,i)+ban+h.slice(i):ban+h;
 if(LK.tab==='evaluasi'&&c.mode==='latihan'&&c.showKey){
  var blk=lkmKeyBlock(m),j=h.indexOf('<div class="lk-actions">');
  h=j>-1?h.slice(0,j)+blk+h.slice(j):h+blk;
 }
 return h;
};
function lkmKeyBlock(m){
 var d=lkDraft(),on=LKM.reveal[m.id],h='<section class="card" data-lkm="1"><h2>Pembahasan latihan</h2>';
 if(!on)return h+'<p class="note">Jawab soal di atas, lalu periksa jawabanmu dan baca pembahasannya.</p><button type="button" class="btn small primary" data-act="lkm-reveal">Periksa jawaban</button></section>';
 var ok=0,rows=m.quiz.map(function(q,i){
  var a=d['q'+i],good=a===q.a;if(good)ok++;
  return '<div class="qbox"><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><div><span class="pill '+(a===undefined?'warn':good?'ok':'bad')+'">'+(a===undefined?'Belum dijawab':good?'Benar':'Kurang tepat')+'</span></div>'+
   (good?'':'<p>Kunci: <b>'+String.fromCharCode(65+q.a)+'. '+lkEsc(q.o[q.a])+'</b></p>')+(q.e?'<p class="note">'+lkEsc(q.e)+'</p>':'')+'</div>';
 }).join('');
 return h+'<p><b>Benar '+ok+' dari '+m.quiz.length+'</b></p>'+rows+'<button type="button" class="btn small" data-act="lkm-reveal">Sembunyikan pembahasan</button></section>';
}

/* ---- Pengiriman: batas kesempatan, jadwal, dan penandaan mode ---- */
var _lkmSubmit=lkSubmit;
lkSubmit=function(){
 var m=lkmCur();if(!m)return _lkmSubmit();
 var c=lkmCfg(m);
 if(!isStaff()){
  var lk=lkmLock(m);if(lk){toast(lk);return}
  if(c.mode==='ujian'&&c.maxTry>0){var u=lkmUsed(m);if(u>=c.maxTry){toast('Kesempatan ujian ini sudah habis ('+u+' dari '+c.maxTry+')');return}}
 }
 LKM.sub={mode:c.mode,mod:m.id,maxTry:c.maxTry,n0:(S.lkpd||[]).length};
 try{_lkmSubmit()}finally{lkmPatchLast();if(!Cloud.on){try{save()}catch(e){}}LKM.sub=null}
};
function lkmPatchLast(){
 var s=LKM.sub;if(!s||(S.lkpd||[]).length<=s.n0)return;
 var r=S.lkpd[S.lkpd.length-1];if(!r||r.moduleId!==s.mod)return;
 var p;try{p=JSON.parse(r.payload||'{}')}catch(e){p={}}
 if(p.mode)return;
 p.mode=s.mode;if(s.mode==='ujian'&&s.maxTry)p.maxTry=s.maxTry;r.payload=JSON.stringify(p);
 if(s.mode==='latihan'){for(var i=S.results.length-1;i>=0;i--){var x=S.results[i];if(x.tipe==='LKPD'&&x.ts===r.ts&&x.sid===r.sid){S.results.splice(i,1);break}}}
}
var _lkmPersist=persist;
persist=function(){if(LKM.sub)lkmPatchLast();return _lkmPersist.apply(this,arguments)};

/* ---- Editor modul: pertahankan pengaturan saat modul disimpan ---- */
var _lkmBuild=lkBuildModule;
lkBuildModule=function(v){
 var m=_lkmBuild(v),o=(LKPD_MODULES||[]).find(function(x){return x.id===m.id});
 if(o)['mode','maxTry','showKey','hideTeori','hideLangkah','hidePetunjuk','buka','tutup'].forEach(function(k){if(o[k]!==undefined)m[k]=o[k]});
 if(o&&Array.isArray(o.fotoWajib)){var nm=o.fotoWajib.map(function(i){return o.checks[i]&&o.checks[i][0]}).filter(Boolean);m.fotoWajib=[];m.checks.forEach(function(c,i){if(nm.indexOf(c[0])>-1)m.fotoWajib.push(i)})}
 return m;
};
