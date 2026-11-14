/* lkpd-editor.js: Editor Guru LKPD versi terstruktur (pengganti formulir teks panjang di lkpd.js).
   - Tab: Info, Tujuan & teori, Alat & K3, Langkah, Pemeriksaan, Soal, Penilaian. Setiap tab punya lencana jumlah masalah.
   - Isi modul diedit sebagai baris terpisah (tanpa pemisah "|" dan tanpa JSON mentah). Tombol naik, turun, hapus, tambah, dan Tempel banyak.
   - Soal: editor visual untuk PG, PG kompleks, dan PG kategori (ketuk huruf untuk menandai kunci). Mode JSON lanjutan tetap tersedia.
   - Penghitung langsung: total menit langkah terhadap alokasi waktu, jumlah bobot, kesiapan simpan.
   - Simpan otomatis ke perangkat (draf), dengan tombol Pulihkan bila editor dibuka lagi.
   Berkas ini membungkus lkEditorDefaults dan mengganti lkEditorForm. Validasi akhir tetap memakai lkValidateModule,
   penyimpanan memakai lkModuleStore, jadi mode lokal, Appwrite, dan antrean offline bekerja seperti biasa. */
var LKE={
 TABS:[['info','Info'],['tujuan','Tujuan & teori'],['bahan','Alat & K3'],['langkah','Langkah'],['cek','Pemeriksaan'],['soal','Soal'],['nilai','Penilaian']],
 VAL:[['vehicle','Tipe kendaraan wajib diisi siswa'],['evidence','Bukti pemeriksaan wajib diisi'],['cause','Analisis penyebab wajib diisi'],['conclusion','Kesimpulan wajib diisi'],['atLeastOneCheck','Minimal satu komponen pemeriksaan sudah terisi']],
 DKEY:'tbsm-lkpd-ed-draft',timer:null,MAXO:8,MAXR:10
};
(function(){var st=document.createElement('style');st.textContent=
'.lke-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between}'+
'.lke-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 6px;scrollbar-width:thin}.lke-tabs button{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--surface);border-radius:99px;padding:7px 13px;font-size:13px;font-weight:600;color:var(--muted)}'+
'.lke-tabs button[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--onc)}'+
'.lke-badge{min-width:18px;height:18px;border-radius:9px;padding:0 5px;font-size:11px;line-height:18px;text-align:center;font-weight:700;background:var(--bad);color:#fff}.lke-badge.ok{background:var(--ok-bg);color:var(--ok)}'+
'.lke-tabs button[aria-pressed=true] .lke-badge.ok{background:rgba(255,255,255,.25);color:#fff}'+
'.lke-health{border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.5;background:var(--ok-bg);color:var(--ok)}.lke-health.warn{background:var(--warn-bg);color:var(--warn)}'+
'.lke-health button{border:0;background:none;padding:0;color:inherit;font:inherit;text-decoration:underline;text-align:left}.lke-health ul{margin:4px 0 0;padding-left:18px}'+
'.lke-item{display:grid;grid-template-columns:26px 1fr auto;gap:8px;align-items:start;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--bg)}'+
'.lke-item>.lke-n{font-size:12px;font-weight:700;color:var(--muted);padding-top:10px;text-align:center}.lke-item .lke-f{display:grid;gap:6px;min-width:0}'+
'.lke-item textarea,.lke-item input{background:var(--surface)}textarea.lke-1{min-height:44px;field-sizing:content}'+
'.lke-ctl{display:flex;flex-direction:column;gap:4px}.lke-ic{width:34px;height:34px;border:1px solid var(--line);background:var(--surface);border-radius:9px;font-size:15px;line-height:1;padding:0;color:var(--muted)}.lke-ic:disabled{opacity:.3}.lke-ic.del{color:var(--bad)}'+
'.lke-list{display:grid;gap:8px}.lke-bar2{height:8px;border-radius:99px;background:var(--line);overflow:hidden}.lke-bar2 i{display:block;height:100%;background:var(--accent);border-radius:99px}.lke-bar2.bad i{background:var(--bad)}.lke-bar2.warn i{background:var(--warn)}'+
'.lke-calc{display:grid;gap:6px;font-size:13px}.lke-q{border:1px solid var(--line);border-radius:12px;background:var(--bg);overflow:hidden}.lke-q.open{border-color:var(--accent);background:var(--surface)}.lke-q.err{border-color:var(--bad)}'+
'.lke-qh{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:10px;width:100%;border:0;background:none;text-align:left}.lke-qh b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:550;font-size:14px}'+
'.lke-qb{display:grid;gap:10px;padding:0 10px 12px}.lke-opt{display:grid;grid-template-columns:36px 1fr 34px;gap:8px;align-items:center}'+
'.lke-key{width:36px;height:36px;border-radius:50%;border:2px solid var(--line);background:var(--surface);font-weight:700;color:var(--muted);padding:0}.lke-key[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--onc)}.lke-key.sq{border-radius:10px}'+
'.lke-kat{display:grid;grid-template-columns:1fr auto 34px;gap:8px;align-items:center}.lke-tf{display:flex;gap:4px}.lke-tf button{border:1px solid var(--line);background:var(--surface);border-radius:9px;padding:7px 10px;font-size:13px;font-weight:600;color:var(--muted)}.lke-tf button[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--onc)}'+
'.lke-seg3{grid-template-columns:repeat(3,1fr)}.lke-weights{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:380px){.lke-weights{grid-template-columns:1fr}}'+
'.lke-qerr{color:var(--bad);font-size:12.5px}.lke-nav{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap}.lke-rec{border-left:4px solid var(--warn)}'+
'.lke-range{width:100%;padding:0;accent-color:var(--accent)}';
document.head.appendChild(st)})();

/* ---------- Pembantu ---------- */
function lkeCp(x){return JSON.parse(JSON.stringify(x==null?[]:x))}
function lkeStr(v){return String(v==null?'':v)}
function lkeT(v){return lkeStr(v).trim()}
function lkeNum(v){var s=lkeT(v).replace(',','.');if(s==='')return NaN;return Number(s)}
function lkeSteps(s){return s.steps.reduce(function(t,x){var n=lkeNum(x.m);return t+(n>0?n:0)},0)}
function lkeAny(a){return a.some(function(x){return lkeT(x)})}
function lkeBlank(row){return !lkeAny(row)}

/* ---------- Inisialisasi state ---------- */
var _lkeDef=lkEditorDefaults;
lkEditorDefaults=function(m){var d=_lkeDef.apply(this,arguments);d.src=m?lkeCp(lkSerialize(m)):null;d.S=null;return d};
function lkeInit(d){
 if(d.S)return d.S;
 var src=d.src||{},r=src.rubric||{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},fresh=!d.src;
 var val=src.validation||{vehicle:true,evidence:true,cause:true,conclusion:true,atLeastOneCheck:true},vv={};
 LKE.VAL.forEach(function(k){vv[k[0]]=!!val[k[0]]});
 var s={id:d.id||'',title:d.title||'',kelas:d.kelas||'X',sekolah:(d.sekolah!==undefined?d.sekolah:(src.sekolah!==undefined?src.sekolah:(fresh?(schKode()||''):''))),fase:d.fase||'E',unit:d.unit||'',duration:d.duration||45,skkni:d.skkni||'',status:d.status||'draft',active:d.active!==false,
  objectives:lkeCp(src.objectives),theory:lkeCp(src.theory),tools:lkeCp(src.tools),safety:lkeCp(src.safety),
  steps:(src.steps||[]).map(function(x){return {t:x[0],m:x[1],i:x[2]}}),checks:lkeCp(src.checks),symptoms:lkeCp(src.symptoms),quiz:lkeCp(src.quiz),
  w:{steps:r.steps,safety:r.safety,checks:r.checks,analysis:r.analysis,practice:r.practiceWeight},val:vv};
 if(fresh){s.objectives=[''];s.theory=[['','']];s.tools=[''];s.safety=[''];s.steps=[{t:'',m:'',i:''}];s.checks=[['','']];s.symptoms=[''];s.quiz=[lkeNewQ('pg')]}
 d.S=s;d.tab=d.tab||'info';d.qi=-1;d.paste=null;d.json=false;d.snap=JSON.stringify(s);d.isNew=!d.id;
 /* draf tersimpan dari sesi sebelumnya */
 try{
  var raw=JSON.parse(localStorage.getItem(LKE.DKEY)||'null'),k=d.id||'(baru)';
  if(raw&&raw.k===k&&raw.S&&JSON.stringify(raw.S)!==d.snap&&Date.now()-raw.ts<14*864e5)d.rec=raw;
 }catch(e){}
 return s;
}
function lkeNewQ(t){
 if(t==='kategori')return {t:'kategori',q:'',rows:[['',true],['',false]],e:''};
 if(t==='kompleks')return {t:'kompleks',q:'',o:['','',''],a:[],e:''};
 return {q:'',o:['','',''],a:-1,e:''};
}
function lkeDirty(d){return !!d.S&&JSON.stringify(d.S)!==d.snap}
function lkeDraftSoon(){
 clearTimeout(LKE.timer);
 LKE.timer=setTimeout(function(){
  var d=LK.editor;if(!d||!d.S||!lkeDirty(d))return;
  try{localStorage.setItem(LKE.DKEY,JSON.stringify({k:d.id||'(baru)',ts:Date.now(),S:d.S}))}catch(e){}
 },700);
}
function lkeDraftClear(){clearTimeout(LKE.timer);try{localStorage.removeItem(LKE.DKEY)}catch(e){}}

/* ---------- Soal: bersihkan dan periksa ---------- */
function lkeClean(q){
 var t=lkqType(q),txt=lkeT(q.q),e=lkeT(q.e),out;
 if(t==='kategori'){
  out={t:'kategori',q:txt,rows:(q.rows||[]).filter(function(r){return lkeT(r[0])}).map(function(r){return [lkeT(r[0]),!!r[1]]})};
  if(q.lab&&(q.lab[0]!=='Benar'||q.lab[1]!=='Salah'))out.lab=q.lab.slice();
 }else{
  var map=[],o=[];
  (q.o||[]).forEach(function(x,k){x=lkeT(x);if(x){map[k]=o.length;o.push(x)}});
  if(t==='kompleks'){
   var a=(Array.isArray(q.a)?q.a:[]).filter(function(k){return map[k]!==undefined}).map(function(k){return map[k]}).sort(function(x,y){return x-y});
   out={t:'kompleks',q:txt,o:o,a:a};
  }else out={q:txt,o:o,a:map[q.a]!==undefined?map[q.a]:-1};
 }
 if(e)out.e=e;
 if(q.src)out.src=q.src;
 return out;
}
function lkeQIssue(q){
 var c=lkeClean(q),t=lkqType(q);
 if(!c.q)return 'Pertanyaan belum diisi';
 if(t==='kategori')return c.rows.length<2?'Isi minimal 2 pernyataan':'';
 if(c.o.length<(t==='pg'?2:3))return 'Isi minimal '+(t==='pg'?2:3)+' pilihan jawaban';
 if(t==='pg'&&c.a<0)return 'Ketuk huruf untuk menandai satu jawaban benar';
 if(t==='kompleks'&&!c.a.length)return 'Ketuk huruf untuk menandai minimal satu jawaban benar';
 return '';
}

/* ---------- Daftar masalah ---------- */
function lkeIssues(d){
 var s=d.S,I=[],id=lkeT(s.id);
 function add(tab,msg){I.push({tab:tab,msg:msg})}
 if(!/^[A-Za-z0-9_-]{2,32}$/.test(id))add('info','ID modul wajib 2–32 karakter: huruf, angka, _ atau -');
 else if(d.isNew&&(LKPD_MODULES||[]).some(function(x){return x.id===id}))add('info','ID "'+id+'" sudah dipakai modul lain');
 if(!lkeT(s.title))add('info','Judul modul belum diisi');else if(lkeT(s.title).length>180)add('info','Judul maksimal 180 karakter');
 if(!lkeT(s.unit))add('info','Unit/objek praktik belum diisi');
 if(!lkeT(s.fase)||lkeT(s.fase).length>8)add('info','Fase wajib diisi (maksimal 8 karakter)');
 var du=lkeNum(s.duration);
 if(!(du>0&&du<=600))add('info','Alokasi waktu harus 1–600 menit');
 if(!lkeAny(s.objectives))add('tujuan','Tambahkan minimal satu tujuan pembelajaran');
 var th=s.theory.filter(function(r){return !lkeBlank(r)});
 if(!th.length)add('tujuan','Tambahkan minimal satu topik teori');
 s.theory.forEach(function(r,i){if(!lkeBlank(r)&&(!lkeT(r[0])||!lkeT(r[1])))add('tujuan','Teori no. '+(i+1)+': topik dan penjelasan harus diisi')});
 if(!lkeAny(s.tools))add('bahan','Tambahkan minimal satu alat atau bahan');
 if(!lkeAny(s.safety))add('bahan','Tambahkan minimal satu butir K3');
 var st=s.steps.filter(function(x){return !lkeBlank([x.t,x.m,x.i])});
 if(!st.length)add('langkah','Tambahkan minimal satu langkah kerja');
 s.steps.forEach(function(x,i){if(!lkeBlank([x.t,x.m,x.i])&&(!lkeT(x.t)||!lkeT(x.i)||!(lkeNum(x.m)>0)))add('langkah','Langkah no. '+(i+1)+': judul, menit (lebih dari 0), dan instruksi harus diisi')});
 if(st.length&&du>0&&lkeSteps(s)!==du)add('langkah','Total menit langkah ('+lkeSteps(s)+') harus sama dengan alokasi waktu ('+du+')');
 var ck=s.checks.filter(function(r){return !lkeBlank(r)});
 if(!ck.length)add('cek','Tambahkan minimal satu komponen pemeriksaan');
 s.checks.forEach(function(r,i){if(!lkeBlank(r)&&(!lkeT(r[0])||!lkeT(r[1])))add('cek','Komponen no. '+(i+1)+': nama dan kriteria harus diisi')});
 if(!s.quiz.length)add('soal','Tambahkan minimal satu soal evaluasi');
 s.quiz.forEach(function(q,i){var m=lkeQIssue(q);if(m)add('soal','Soal no. '+(i+1)+': '+m)});
 var w=s.w,ws=['steps','safety','checks','analysis'].map(function(k){return lkeNum(w[k])});
 if(ws.some(function(x){return !(x>=0)}))add('nilai','Semua bobot praktik harus diisi angka 0 atau lebih');
 else if(ws.reduce(function(t,x){return t+x},0)!==100)add('nilai','Bobot praktik berjumlah '+ws.reduce(function(t,x){return t+x},0)+'%, harus tepat 100%');
 var pr=lkeNum(w.practice);if(!(pr>=0&&pr<=100))add('nilai','Bobot praktik nilai akhir harus 0–100%');
 return I;
}

/* ---------- Susun modul untuk disimpan ---------- */
function lkeBuild(d){
 var s=d.S,w=s.w,pr=Number(lkeNum(w.practice)),
 m={id:lkeT(s.id),version:1,title:lkeT(s.title),kelas:lkeT(s.kelas).toUpperCase(),sekolah:(schNorm(s.sekolah)==='ALL'?'':schNorm(s.sekolah)),fase:lkeT(s.fase),unit:lkeT(s.unit),duration:Number(lkeNum(s.duration)),skkni:lkeT(s.skkni),
  status:s.status==='published'?'published':'draft',active:!!s.active,
  objectives:s.objectives.map(lkeT).filter(Boolean),
  theory:s.theory.filter(function(r){return !lkeBlank(r)}).map(function(r){return [lkeT(r[0]),lkeT(r[1])]}),
  tools:s.tools.map(lkeT).filter(Boolean),safety:s.safety.map(lkeT).filter(Boolean),
  steps:s.steps.filter(function(x){return !lkeBlank([x.t,x.m,x.i])}).map(function(x){return [lkeT(x.t),Number(lkeNum(x.m)),lkeT(x.i)]}),
  checks:s.checks.filter(function(r){return !lkeBlank(r)}).map(function(r){return [lkeT(r[0]),lkeT(r[1])]}),
  symptoms:s.symptoms.map(lkeT).filter(Boolean),quiz:s.quiz.map(lkeClean),
  rubric:{steps:Number(lkeNum(w.steps)),safety:Number(lkeNum(w.safety)),checks:Number(lkeNum(w.checks)),analysis:Number(lkeNum(w.analysis)),practiceWeight:pr,theoryWeight:100-pr},validation:{}};
 LKE.VAL.forEach(function(k){if(s.val[k[0]])m.validation[k[0]]=true});
 /* pertahankan pengaturan dari panel Pengaturan (mode, kesempatan, jadwal, foto wajib) dan versi soal bawaan */
 var o=(LKPD_MODULES||[]).find(function(x){return x.id===m.id});
 if(o){
  ['mode','maxTry','showKey','hideTeori','hideLangkah','hidePetunjuk','buka','tutup'].forEach(function(k){if(o[k]!==undefined)m[k]=o[k]});
  if(Array.isArray(o.fotoWajib)){
   var nm=o.fotoWajib.map(function(i){return o.checks[i]&&o.checks[i][0]}).filter(Boolean);
   m.fotoWajib=[];m.checks.forEach(function(c,i){if(nm.indexOf(c[0])>-1)m.fotoWajib.push(i)});
  }
 }
 if(lkBuiltin(m.id))m.quizV=LKQ.VER;
 return m;
}
function lkeSave(prev){
 var d=LK.editor;if(!d||!d.S)return;
 var iss=lkeIssues(d);
 if(iss.length){d.tab=iss[0].tab;lkeRe();toast(iss[0].msg+(iss.length>1?' (dan '+(iss.length-1)+' lainnya)':''));return}
 var m=lkeBuild(d),err=lkValidateModule(m);
 if(err){toast(err);return}
 lkModuleStore(m);lkeDraftClear();
 LK.editor=null;LK.module=m.id;
 if(prev){LK.tab='materi';LK.preview=true;LK.open=true}else LK.tab='editor';
 render();window.scrollTo(0,0);toast(prev?'Modul tersimpan, membuka pratinjau':'Modul tersimpan');
}

/* ---------- Render ---------- */
function lkeIc(a,p,i,label,txt,dis,cls){return '<button type="button" class="lke-ic'+(cls?' '+cls:'')+'" data-lke-a="'+a+'" data-p="'+p+'" data-i="'+i+'" aria-label="'+label+'"'+(dis?' disabled':'')+'>'+txt+'</button>'}
function lkeCtl(p,i,n){return '<div class="lke-ctl">'+lkeIc('up',p,i,'Naikkan','↑',i===0)+lkeIc('down',p,i,'Turunkan','↓',i===n-1)+lkeIc('del',p,i,'Hapus baris','✕',false,'del')+'</div>'}
function lkePasteBox(d,p){
 if(d.paste!==p)return '<button type="button" class="btn small" data-lke-a="paste-open" data-p="'+p+'">Tempel banyak</button>';
 var hint={theory:'Satu baris per topik: Topik | Penjelasan',checks:'Satu baris per komponen: Komponen | Kriteria',steps:'Satu baris per langkah: Menit | Judul | Instruksi'}[p]||'Satu baris per butir. Nomor atau tanda di awal baris dibuang otomatis.';
 return '<div class="lke-list" style="grid-column:1/-1"><label class="f">'+hint+'<textarea id="lke-paste" rows="6" placeholder="Tempel di sini"></textarea></label><div class="row"><button type="button" class="btn small" data-lke-a="paste-close">Batal</button><button type="button" class="btn small primary" data-lke-a="paste-apply" data-p="'+p+'">Tambahkan</button></div></div>';
}
function lkeAddRow(d,p,label){
 return '<div class="row" style="gap:6px"><button type="button" class="btn small primary" data-lke-a="add" data-p="'+p+'">+ '+label+'</button>'+(d.paste===p?'':lkePasteBox(d,p))+'</div>'+(d.paste===p?lkePasteBox(d,p):'');
}
function lkeSimple(d,p,title,hint,ph,addLabel){
 var a=d.S[p],h='<section class="card"><div><h3>'+title+'</h3><p class="note">'+hint+'</p></div><div class="lke-list">';
 h+=a.map(function(x,i){return '<div class="lke-item"><span class="lke-n">'+(i+1)+'</span><textarea class="lke-1" rows="1" data-lke="'+p+'.'+i+'" placeholder="'+esc(ph)+'">'+esc(x)+'</textarea>'+lkeCtl(p,i,a.length)+'</div>'}).join('');
 return h+'</div>'+lkeAddRow(d,p,addLabel)+'</section>';
}
function lkePairs(d,p,title,hint,l1,l2,addLabel,longB){
 var a=d.S[p],h='<section class="card"><div><h3>'+title+'</h3><p class="note">'+hint+'</p></div><div class="lke-list">';
 h+=a.map(function(x,i){return '<div class="lke-item"><span class="lke-n">'+(i+1)+'</span><div class="lke-f"><input data-lke="'+p+'.'+i+'.0" placeholder="'+esc(l1)+'" value="'+esc(x[0])+'">'+
  (longB?'<textarea class="lke-1" rows="2" data-lke="'+p+'.'+i+'.1" placeholder="'+esc(l2)+'">'+esc(x[1])+'</textarea>':'<input data-lke="'+p+'.'+i+'.1" placeholder="'+esc(l2)+'" value="'+esc(x[1])+'">')+'</div>'+lkeCtl(p,i,a.length)+'</div>'}).join('');
 return h+'</div>'+lkeAddRow(d,p,addLabel)+'</section>';
}
function lkeTabInfo(d){
 var s=d.S,ro=!d.isNew;
 return '<section class="card"><div class="two"><label class="f">ID modul'+(ro?' (tidak bisa diubah)':' (unik)')+'<input data-lke="id" value="'+esc(s.id)+'" placeholder="contoh: X-7"'+(ro?' readonly':'')+' autocapitalize="characters"></label>'+
  '<label class="f">Kelas<select data-lke="kelas" data-lke-r="1">'+lkKelasOpts(s.kelas)+'</select></label></div>'+
  '<label class="f">Sekolah<select data-lke="sekolah">'+schOptModul(s.sekolah)+'</select></label>'+
  '<label class="f">Judul modul<input data-lke="title" value="'+esc(s.title)+'" placeholder="contoh: Pemeriksaan Busi dan Sistem Pengapian"></label>'+
  '<label class="f">Unit/objek praktik<input data-lke="unit" value="'+esc(s.unit)+'" placeholder="contoh: Sepeda motor 4 langkah injeksi"></label>'+
  '<div class="two"><label class="f">Alokasi waktu (menit)<input type="number" inputmode="numeric" min="1" max="600" data-lke="duration" value="'+esc(s.duration)+'"></label>'+
  '<label class="f">Fase<input data-lke="fase" value="'+esc(s.fase)+'" maxlength="8"></label></div>'+
  '<label class="f">Kode standar kompetensi (opsional)<input data-lke="skkni" value="'+esc(s.skkni)+'" placeholder="contoh: OTO.SM02.026.01"></label>'+
  '<div><span class="label">Status</span><div class="seg" role="group" aria-label="Status modul"><button type="button" data-lke-a="set" data-p="status" data-v="draft" aria-pressed="'+(s.status!=='published')+'">Draft</button><button type="button" data-lke-a="set" data-p="status" data-v="published" aria-pressed="'+(s.status==='published')+'">Terbit</button></div></div>'+
  '<label class="lk-check"><input type="checkbox" data-lke="active"'+(s.active?' checked':'')+'><span><b>Modul aktif</b><small>Siswa hanya melihat modul yang Terbit dan Aktif.</small></span></label>'+
  '<div class="lke-calc" id="lke-calc">'+lkeCalc(d)+'</div></section>';
}
function lkeTabSteps(d){
 var s=d.S,a=s.steps,h='<section class="card"><div><h3>Langkah kerja</h3><p class="note">Urutan prosedur praktik. Total menit semua langkah harus sama dengan alokasi waktu modul.</p></div><div class="lke-calc" id="lke-calc">'+lkeCalc(d)+'</div><div class="lke-list">';
 h+=a.map(function(x,i){return '<div class="lke-item"><span class="lke-n">'+(i+1)+'</span><div class="lke-f"><div class="two" style="grid-template-columns:1fr 92px"><input data-lke="steps.'+i+'.t" placeholder="Judul langkah" value="'+esc(x.t)+'"><input type="number" inputmode="numeric" min="1" data-lke="steps.'+i+'.m" placeholder="Menit" value="'+esc(x.m)+'" aria-label="Menit"></div>'+
  '<textarea class="lke-1" rows="2" data-lke="steps.'+i+'.i" placeholder="Instruksi untuk siswa">'+esc(x.i)+'</textarea></div>'+lkeCtl('steps',i,a.length)+'</div>'}).join('');
 return h+'</div>'+lkeAddRow(d,'steps','Tambah langkah')+'</section>';
}
function lkeTabNilai(d){
 var s=d.S,w=s.w;
 function wi(k,l){return '<label class="f">'+l+'<input type="number" inputmode="numeric" min="0" max="100" data-lke="w.'+k+'" value="'+esc(w[k])+'"></label>'}
 return '<section class="card"><div><h3>Bobot nilai praktik</h3><p class="note">Pembagian nilai praktik antar komponen. Jumlahnya harus tepat 100%.</p></div>'+
  '<div class="lke-weights">'+wi('steps','Langkah kerja (%)')+wi('safety','K3 (%)')+wi('checks','Pemeriksaan (%)')+wi('analysis','Analisis (%)')+'</div>'+
  '<div class="row" style="gap:6px"><button type="button" class="btn small" data-lke-a="w-std">Standar 30/20/25/25</button><button type="button" class="btn small" data-lke-a="w-eq">Bagi rata</button><button type="button" class="btn small" data-lke-a="w-fix">Sesuaikan ke 100</button></div>'+
  '<div class="lke-calc" id="lke-calc">'+lkeCalc(d)+'</div></section>'+
  '<section class="card"><div><h3>Nilai akhir: praktik dan teori</h3><p class="note">Geser untuk mengatur. Bobot teori otomatis menjadi sisanya.</p></div>'+
  '<input class="lke-range" type="range" min="0" max="100" step="5" data-lke="w.practice" value="'+esc(w.practice)+'" aria-label="Bobot praktik nilai akhir"><div class="lke-calc" id="lke-calc2">'+lkeCalc2(d)+'</div></section>'+
  '<section class="card"><div><h3>Isian wajib siswa</h3><p class="note">Siswa tidak bisa mengirim LKPD sebelum bagian yang dicentang terisi. Kosongkan semua bila tidak perlu validasi.</p></div>'+
  LKE.VAL.map(function(k){return '<label class="lk-check"><input type="checkbox" data-lke="val.'+k[0]+'"'+(s.val[k[0]]?' checked':'')+'><span><b>'+k[1]+'</b></span></label>'}).join('')+'</section>';
}
/* Blok hitung yang diperbarui langsung saat mengetik */
function lkeCalc(d){
 var s=d.S,t=d.tab;
 if(t==='langkah'){
  var tot=lkeSteps(s),du=lkeNum(s.duration),ok=tot===du,pct=du>0?Math.min(100,Math.round(tot/du*100)):0;
  return '<div class="row sb"><b>Total '+tot+' dari '+(du>0?du:'?')+' menit</b><span class="pill '+(ok?'ok':'warn')+'">'+(ok?'Sesuai':(du>0&&tot<du?'Kurang '+(du-tot):'Lebih '+(tot-du)))+'</span></div><div class="lke-bar2 '+(ok?'':(tot>du?'bad':'warn'))+'"><i style="width:'+pct+'%"></i></div>'+
   (!ok&&tot>0?'<div><button type="button" class="btn small" data-lke-a="fit">Jadikan '+tot+' menit sebagai alokasi modul</button></div>':'');
 }
 if(t==='nilai'){
  var w=s.w,v=['steps','safety','checks','analysis'].map(function(k){return lkeNum(w[k])}),sum=v.reduce(function(a,x){return a+(x>=0?x:0)},0),ok2=sum===100;
  return '<div class="row sb"><b>Total '+sum+'%</b><span class="pill '+(ok2?'ok':'warn')+'">'+(ok2?'Tepat 100%':(sum<100?'Kurang '+(100-sum):'Lebih '+(sum-100)))+'</span></div><div class="lke-bar2 '+(ok2?'':(sum>100?'bad':'warn'))+'"><i style="width:'+Math.min(100,sum)+'%"></i></div>';
 }
 if(t==='info'){
  var vis=s.status==='published'&&s.active;
  return '<span class="pill '+(vis?'ok':'warn')+'" style="justify-self:start">'+(vis?'Terlihat oleh siswa kelas '+esc(s.kelas):'Tidak terlihat siswa (Draft atau nonaktif)')+'</span>';
 }
 if(t==='soal'){
  var c={pg:0,kompleks:0,kategori:0};s.quiz.forEach(function(q){c[lkqType(q)]++});
  return '<span class="note">'+s.quiz.length+' soal · '+c.pg+' PG · '+c.kompleks+' PG kompleks · '+c.kategori+' PG kategori</span>';
 }
 return '';
}
function lkeCalc2(d){var pr=lkeNum(d.S.w.practice);pr=pr>=0&&pr<=100?pr:0;return '<div class="row sb"><b>Praktik '+pr+'%</b><b>Teori '+(100-pr)+'%</b></div><div class="lke-bar2"><i style="width:'+pr+'%"></i></div>'}
function lkeBar(d){
 var I=lkeIssues(d),cnt={};I.forEach(function(x){cnt[x.tab]=(cnt[x.tab]||0)+1});
 var tabs='<div class="lke-tabs" role="tablist">'+LKE.TABS.map(function(t){return '<button type="button" role="tab" data-lke-a="tab" data-v="'+t[0]+'" aria-pressed="'+(d.tab===t[0])+'">'+t[1]+'<span class="lke-badge'+(cnt[t[0]]?'':' ok')+'">'+(cnt[t[0]]||'✓')+'</span></button>'}).join('')+'</div>';
 var hl=I.length?'<div class="lke-health warn"><b>'+I.length+' hal perlu dilengkapi sebelum disimpan</b><ul>'+I.slice(0,3).map(function(x){return '<li><button type="button" data-lke-a="tab" data-v="'+x.tab+'">'+esc(x.msg)+'</button></li>'}).join('')+(I.length>3?'<li>dan '+(I.length-3)+' lainnya</li>':'')+'</ul></div>':'<div class="lke-health"><b>Semua bagian lengkap.</b> Modul siap disimpan.</div>';
 return tabs+hl;
}

/* ---------- Soal ---------- */
function lkeQHtml(d,q,i){
 var t=lkqType(q),c=lkeClean(q),iss=lkeQIssue(q),open=d.qi===i,n=d.S.quiz.length;
 var tl={pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori'}[t];
 var head='<button type="button" class="lke-qh" data-lke-a="q-open" data-i="'+i+'" aria-expanded="'+open+'"><span class="pill'+(iss?' warn':' ok')+'">'+(i+1)+'</span><b>'+(c.q?esc(c.q):'<span class="muted">Soal belum diisi</span>')+'</b><span class="pill plain">'+tl+'</span></button>';
 if(!open)return '<div class="lke-q'+(iss?' err':'')+'">'+head+'</div>';
 var b='<div class="lke-qb"><div class="seg lke-seg3" role="group" aria-label="Jenis soal">'+[['pg','PG'],['kompleks','PG kompleks'],['kategori','PG kategori']].map(function(x){return '<button type="button" data-lke-a="q-type" data-i="'+i+'" data-v="'+x[0]+'" aria-pressed="'+(t===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'+
  '<label class="f">Pertanyaan<textarea rows="3" data-lke="quiz.'+i+'.q" placeholder="Tulis pertanyaan">'+esc(q.q)+'</textarea></label>';
 if(t==='kategori'){
  var lab=q.lab||['Benar','Salah'];
  b+='<div><span class="label">Pernyataan (pilih '+esc(lab[0])+' atau '+esc(lab[1])+' sebagai kunci)</span></div><div class="lke-list">'+q.rows.map(function(r,k){
   return '<div class="lke-kat"><textarea class="lke-1" rows="1" data-lke="quiz.'+i+'.rows.'+k+'.0" placeholder="Pernyataan '+(k+1)+'">'+esc(r[0])+'</textarea>'+
    '<div class="lke-tf"><button type="button" data-lke-a="q-kat" data-i="'+i+'" data-j="'+k+'" data-v="1" aria-pressed="'+(!!r[1])+'">'+esc(lab[0])+'</button><button type="button" data-lke-a="q-kat" data-i="'+i+'" data-j="'+k+'" data-v="0" aria-pressed="'+(!r[1])+'">'+esc(lab[1])+'</button></div>'+
    '<button type="button" class="lke-ic del" data-lke-a="q-row-del" data-i="'+i+'" data-j="'+k+'" aria-label="Hapus pernyataan">✕</button></div>'}).join('')+'</div>'+
   (q.rows.length<LKE.MAXR?'<div><button type="button" class="btn small" data-lke-a="q-row-add" data-i="'+i+'">+ Pernyataan</button></div>':'');
 }else{
  b+='<div><span class="label">Pilihan jawaban. Ketuk huruf untuk menandai '+(t==='pg'?'satu jawaban benar':'semua jawaban benar')+'.</span></div><div class="lke-list">'+q.o.map(function(o,k){
   var on=t==='pg'?q.a===k:(Array.isArray(q.a)&&q.a.indexOf(k)>-1);
   return '<div class="lke-opt"><button type="button" class="lke-key'+(t==='kompleks'?' sq':'')+'" data-lke-a="q-key" data-i="'+i+'" data-j="'+k+'" aria-pressed="'+on+'" aria-label="Jawaban benar '+lkeLtr(k)+'">'+lkeLtr(k)+'</button>'+
    '<input data-lke="quiz.'+i+'.o.'+k+'" placeholder="Pilihan '+lkeLtr(k)+'" value="'+esc(o)+'"><button type="button" class="lke-ic del" data-lke-a="q-opt-del" data-i="'+i+'" data-j="'+k+'" aria-label="Hapus pilihan"'+(q.o.length<=2?' disabled':'')+'>✕</button></div>'}).join('')+'</div>'+
   (q.o.length<LKE.MAXO?'<div><button type="button" class="btn small" data-lke-a="q-opt-add" data-i="'+i+'">+ Pilihan</button></div>':'');
 }
 b+='<label class="f">Pembahasan (opsional)<textarea rows="2" data-lke="quiz.'+i+'.e" placeholder="Penjelasan jawaban yang benar">'+esc(q.e||'')+'</textarea></label>'+
  (iss?'<div class="lke-qerr">'+esc(iss)+'</div>':'')+
  '<div class="row" style="gap:6px;flex-wrap:wrap">'+lkeIc('q-up','quiz',i,'Naikkan soal','↑ Naik',i===0,'')+lkeIc('q-down','quiz',i,'Turunkan soal','↓ Turun',i===n-1,'')+
  '<button type="button" class="btn small" data-lke-a="q-dup" data-i="'+i+'">Duplikat</button><button type="button" class="btn small danger" data-lke-a="q-del" data-i="'+i+'">Hapus soal</button></div></div>';
 return '<div class="lke-q open'+(iss?' err':'')+'">'+head+b+'</div>';
}
function lkeLtr(k){return String.fromCharCode(65+k)}
function lkeTabSoal(d){
 var s=d.S;
 if(d.json){
  return '<section class="card"><div class="row sb"><div><h3>Soal (mode JSON)</h3><p class="note">Untuk pengguna lanjutan atau tempel dari sumber lain. Format PG, kompleks, dan kategori sama seperti dokumentasi.</p></div></div>'+
   '<textarea id="lke-json" rows="16" spellcheck="false" style="font-family:ui-monospace,monospace;font-size:12.5px">'+esc(d.jsonText||'')+'</textarea>'+(d.jsonErr?'<div class="err">'+esc(d.jsonErr)+'</div>':'')+
   '<div class="row"><button type="button" class="btn" data-lke-a="json-off">Kembali ke editor visual</button><button type="button" class="btn primary grow" data-lke-a="json-apply">Terapkan JSON</button></div></section>';
 }
 return '<section class="card"><div class="row sb"><div><h3>Soal evaluasi</h3><p class="note">Ketuk soal untuk membuka dan mengedit.</p></div></div><div class="lke-calc" id="lke-calc">'+lkeCalc(d)+'</div>'+
  '<div class="lke-list">'+s.quiz.map(function(q,i){return lkeQHtml(d,q,i)}).join('')+'</div>'+
  '<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small primary" data-lke-a="q-add" data-v="pg">+ PG</button><button type="button" class="btn small primary" data-lke-a="q-add" data-v="kompleks">+ PG kompleks</button><button type="button" class="btn small primary" data-lke-a="q-add" data-v="kategori">+ PG kategori</button><button type="button" class="btn small" data-lke-a="json-on">Mode JSON</button></div></section>';
}

lkEditorForm=function(d){
 var s=lkeInit(d),idx=LKE.TABS.map(function(t){return t[0]}).indexOf(d.tab),h='';
 if(d.rec)h+='<section class="card lke-rec"><b>Ada draf yang belum tersimpan</b><p class="note">Dari '+new Date(d.rec.ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'. Pulihkan untuk melanjutkan pekerjaan sebelumnya.</p><div class="row"><button type="button" class="btn small" data-lke-a="rec-drop">Buang draf</button><button type="button" class="btn small primary" data-lke-a="rec-use">Pulihkan</button></div></section>';
 h+='<div class="lke-top"><div><h2>'+(d.isNew?'Modul baru':'Edit modul')+'</h2><p class="note">'+(lkeT(s.id)?esc(lkeT(s.id))+' · ':'')+'Disimpan otomatis di perangkat ini sebagai draf.</p></div><div class="row"><button type="button" class="btn small" data-lke-a="cancel">Kembali</button><button type="button" class="btn small primary" data-lke-a="save">Simpan modul</button></div></div>';
 h+='<div id="lke-bar">'+lkeBar(d)+'</div>';
 if(d.tab==='info')h+=lkeTabInfo(d);
 else if(d.tab==='tujuan')h+=lkeSimple(d,'objectives','Tujuan pembelajaran','Apa yang harus dicapai siswa setelah praktik. Satu butir per baris.','Contoh: Mengukur tegangan baterai dengan multimeter','Tambah tujuan')+lkePairs(d,'theory','Teori ringkas','Materi singkat yang dibaca siswa sebelum praktik (disembunyikan pada mode Ujian bila diatur).','Topik','Penjelasan','Tambah topik',true);
 else if(d.tab==='bahan')h+=lkeSimple(d,'tools','Alat dan bahan','Peralatan dan bahan yang disiapkan siswa.','Contoh: Multimeter digital','Tambah alat/bahan')+lkeSimple(d,'safety','Keselamatan dan kesehatan kerja (K3)','Menjadi daftar centang K3 yang dikerjakan siswa sebelum praktik.','Contoh: Gunakan wearpack dan sepatu tertutup','Tambah butir K3')+lkeSimple(d,'symptoms','Gejala atau diagnosis (opsional)','Daftar gejala yang bisa dipilih siswa pada bagian analisis.','Contoh: Starter tidak bereaksi','Tambah gejala');
 else if(d.tab==='langkah')h+=lkeTabSteps(d);
 else if(d.tab==='cek')h+=lkePairs(d,'checks','Tabel pemeriksaan','Komponen yang diperiksa siswa. Siswa mengisi hasil aktual, standar manual, status, dan catatan untuk tiap baris.','Komponen (contoh: Tegangan baterai diam)','Kriteria pemeriksaan (contoh: Volt, kondisi ukur)','Tambah komponen',false);
 else if(d.tab==='soal')h+=lkeTabSoal(d);
 else h+=lkeTabNilai(d);
 h+='<div class="lke-nav"><button type="button" class="btn"'+(idx<=0?' disabled':'')+' data-lke-a="prev">← Sebelumnya</button>'+
  (idx>=LKE.TABS.length-1?'<div class="row"><button type="button" class="btn" data-lke-a="save-prev">Simpan dan pratinjau</button><button type="button" class="btn primary" data-lke-a="save">Simpan modul</button></div>':'<button type="button" class="btn primary" data-lke-a="next">Berikutnya →</button>')+'</div>';
 return '<div class="stack">'+h+'</div>';
};

/* ---------- Pembaruan tanpa render ulang ---------- */
function lkeLive(){
 var d=LK.editor;if(!d||!d.S)return;
 var b=$('#lke-bar');if(b)b.innerHTML=lkeBar(d);
 var c=$('#lke-calc');if(c)c.innerHTML=lkeCalc(d);
 var c2=$('#lke-calc2');if(c2)c2.innerHTML=lkeCalc2(d);
 lkeDraftSoon();
}
function lkeRe(){
 var d=LK.editor,y=window.scrollY;render();window.scrollTo(0,y);
 if(d&&d.focus){var el=document.querySelector('[data-lke="'+d.focus+'"]');d.focus=null;if(el){try{el.focus({preventScroll:false})}catch(e){}}}
 lkeDraftSoon();
}
function lkeRef(p){
 var s=LK.editor.S,parts=p.split('.'),o=s,i;
 for(i=0;i<parts.length-1;i++)o=o[/^\d+$/.test(parts[i])?+parts[i]:parts[i]];
 var k=parts[parts.length-1];return {o:o,k:/^\d+$/.test(k)?+k:k};
}
function lkeSet(p,v){var r=lkeRef(p);r.o[r.k]=v}
function lkeList(p){return LK.editor.S[p]}
function lkeBlankRow(p){return p==='steps'?{t:'',m:'',i:''}:(p==='theory'||p==='checks')?['','']:''}
function lkeMove(a,i,j){if(j<0||j>=a.length)return;var x=a.splice(i,1)[0];a.splice(j,0,x)}

/* ---------- Tempel banyak ---------- */
function lkeParsePaste(p,txt){
 var lines=String(txt).replace(/\r\n?/g,'\n').split('\n').map(function(x){return x.trim()}).filter(Boolean),out=[];
 function clean(x){return x.replace(/^(?:[-•*·]+|\d+[.)])\s*/,'')}
 lines.forEach(function(l){
  if(p==='theory'||p==='checks'){var a=clean(l).split('|');out.push([a[0].trim(),a.slice(1).join('|').trim()])}
  else if(p==='steps'){var b=clean(l).split('|');
   if(b.length>=3)out.push({m:b[0].trim(),t:b[1].trim(),i:b.slice(2).join('|').trim()});
   else out.push({m:'',t:b[0].trim(),i:b.slice(1).join('|').trim()})}
  else out.push(clean(l));
 });
 return out;
}

/* ---------- Aksi klik ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lke-a]');if(!b)return;
 var d=LK.editor;if(!d||!d.S||!isStaff())return;
 var a=b.dataset.lkeA,p=b.dataset.p,i=b.dataset.i!==undefined?+b.dataset.i:-1,j=b.dataset.j!==undefined?+b.dataset.j:-1,v=b.dataset.v,s=d.S,q;
 e.stopPropagation();
 if(a==='tab'){d.tab=v;d.paste=null;lkeRe();window.scrollTo(0,0)}
 else if(a==='prev'||a==='next'){var ix=LKE.TABS.map(function(t){return t[0]}).indexOf(d.tab)+(a==='next'?1:-1);if(LKE.TABS[ix]){d.tab=LKE.TABS[ix][0];d.paste=null;lkeRe();window.scrollTo(0,0)}}
 else if(a==='save')lkeSave(false);
 else if(a==='save-prev')lkeSave(true);
 else if(a==='cancel'){
  var out=function(){lkeDraftClear();LK.editor=null;render();window.scrollTo(0,0)};
  if(!lkeDirty(d)){out();return}
  uiConfirm('Tutup editor?\nPerubahan yang belum disimpan tidak masuk ke modul. Draf tetap tersimpan di perangkat ini dan bisa dipulihkan saat editor dibuka lagi.',{ok:'Tutup',danger:true}).then(function(ok){if(ok){LK.editor=null;render();window.scrollTo(0,0)}});
 }
 else if(a==='set'){lkeSet(p,v);lkeRe()}
 else if(a==='add'){var arr=lkeList(p);arr.push(lkeBlankRow(p));d.focus=p+'.'+(arr.length-1)+(p==='steps'?'.t':(p==='theory'||p==='checks')?'.0':'');lkeRe()}
 else if(a==='del'){var ar=lkeList(p);ar.splice(i,1);if(!ar.length)ar.push(lkeBlankRow(p));lkeRe()}
 else if(a==='up'){lkeMove(lkeList(p),i,i-1);lkeRe()}
 else if(a==='down'){lkeMove(lkeList(p),i,i+1);lkeRe()}
 else if(a==='paste-open'){d.paste=p;lkeRe();var ta=$('#lke-paste');if(ta)ta.focus()}
 else if(a==='paste-close'){d.paste=null;lkeRe()}
 else if(a==='paste-apply'){
  var ta2=$('#lke-paste'),items=lkeParsePaste(p,ta2?ta2.value:'');
  if(!items.length){toast('Tidak ada baris untuk ditambahkan');return}
  var cur=lkeList(p).filter(function(x){return p==='steps'?!lkeBlank([x.t,x.m,x.i]):Array.isArray(x)?!lkeBlank(x):!!lkeT(x)});
  s[p]=cur.concat(items);d.paste=null;lkeRe();toast(items.length+' baris ditambahkan');
 }
 else if(a==='fit'){s.duration=lkeSteps(s);lkeRe()}
 else if(a==='w-std'){s.w.steps=30;s.w.safety=20;s.w.checks=25;s.w.analysis=25;lkeRe()}
 else if(a==='w-eq'){s.w.steps=25;s.w.safety=25;s.w.checks=25;s.w.analysis=25;lkeRe()}
 else if(a==='w-fix'){
  var ks=['steps','safety','checks','analysis'],vs=ks.map(function(k){var n=lkeNum(s.w[k]);return n>0?n:0}),tot=vs.reduce(function(x,y){return x+y},0);
  if(!tot){s.w.steps=30;s.w.safety=20;s.w.checks=25;s.w.analysis=25}
  else{
   var sc=vs.map(function(x){return Math.floor(x*100/tot)}),rest=100-sc.reduce(function(x,y){return x+y},0),big=vs.indexOf(Math.max.apply(null,vs));
   sc[big]+=rest;ks.forEach(function(k,n){s.w[k]=sc[n]});
  }
  lkeRe();
 }
 /* soal */
 else if(a==='q-open'){d.qi=d.qi===i?-1:i;lkeRe()}
 else if(a==='q-add'){s.quiz.push(lkeNewQ(v));d.qi=s.quiz.length-1;lkeRe()}
 else if(a==='q-del'){
  uiConfirm('Hapus soal no. '+(i+1)+'?',{ok:'Hapus',danger:true}).then(function(ok){if(!ok)return;s.quiz.splice(i,1);d.qi=-1;lkeRe()});
 }
 else if(a==='q-dup'){s.quiz.splice(i+1,0,lkeCp(s.quiz[i]));d.qi=i+1;lkeRe()}
 else if(a==='q-up'){lkeMove(s.quiz,i,i-1);d.qi=i-1;lkeRe()}
 else if(a==='q-down'){lkeMove(s.quiz,i,i+1);d.qi=i+1;lkeRe()}
 else if(a==='q-type'){
  q=s.quiz[i];var cur=lkqType(q);if(cur===v)return;
  var n=lkeNewQ(v);n.q=q.q||'';n.e=q.e||'';
  if(cur!=='kategori'&&v!=='kategori'){n.o=(q.o||[]).slice();while(n.o.length<3)n.o.push('');n.a=v==='pg'?(Array.isArray(q.a)?(q.a.length?q.a[0]:-1):q.a):(Array.isArray(q.a)?q.a.slice():(q.a>=0?[q.a]:[]))}
  s.quiz[i]=n;lkeRe();
 }
 else if(a==='q-key'){
  q=s.quiz[i];
  if(lkqType(q)==='pg')q.a=q.a===j?-1:j;
  else{q.a=Array.isArray(q.a)?q.a:[];var at=q.a.indexOf(j);if(at>-1)q.a.splice(at,1);else q.a.push(j)}
  lkeRe();
 }
 else if(a==='q-opt-add'){q=s.quiz[i];if(q.o.length<LKE.MAXO){q.o.push('');d.focus='quiz.'+i+'.o.'+(q.o.length-1);lkeRe()}}
 else if(a==='q-opt-del'){
  q=s.quiz[i];if(q.o.length<=2)return;q.o.splice(j,1);
  if(lkqType(q)==='pg'){if(q.a===j)q.a=-1;else if(q.a>j)q.a--}
  else q.a=(q.a||[]).filter(function(x){return x!==j}).map(function(x){return x>j?x-1:x});
  lkeRe();
 }
 else if(a==='q-kat'){s.quiz[i].rows[j][1]=v==='1';lkeRe()}
 else if(a==='q-row-add'){q=s.quiz[i];if(q.rows.length<LKE.MAXR){q.rows.push(['',true]);d.focus='quiz.'+i+'.rows.'+(q.rows.length-1)+'.0';lkeRe()}}
 else if(a==='q-row-del'){q=s.quiz[i];if(q.rows.length>2){q.rows.splice(j,1);lkeRe()}else toast('Minimal 2 pernyataan')}
 else if(a==='json-on'){d.json=true;d.jsonErr='';d.jsonText=JSON.stringify(s.quiz.map(lkeClean),null,2);lkeRe()}
 else if(a==='json-off'){d.json=false;d.jsonErr='';lkeRe()}
 else if(a==='json-apply'){
  var ta3=$('#lke-json'),arr2;
  try{arr2=JSON.parse(ta3?ta3.value:'[]')}catch(err){d.jsonText=ta3?ta3.value:'';d.jsonErr='JSON tidak valid: '+err.message;lkeRe();return}
  if(!Array.isArray(arr2)){d.jsonText=ta3.value;d.jsonErr='JSON harus berupa daftar soal [ ... ]';lkeRe();return}
  var badIx=-1;arr2.forEach(function(x,k){if(badIx<0&&!lkqValid(x))badIx=k});
  if(badIx>-1){d.jsonText=ta3.value;d.jsonErr='Soal no. '+(badIx+1)+' tidak sesuai format (PG: q, o, a. Kompleks: t, q, o, a[]. Kategori: t, q, rows).';lkeRe();return}
  s.quiz=arr2.map(function(x){x=lkeCp(x);if(!x.e)x.e='';return x});d.json=false;d.jsonErr='';d.qi=-1;lkeRe();toast(arr2.length+' soal diterapkan');
 }
 else if(a==='rec-use'){d.S=d.rec.S;d.rec=null;d.qi=-1;lkeRe();toast('Draf dipulihkan')}
 else if(a==='rec-drop'){d.rec=null;lkeDraftClear();lkeRe()}
},true);

/* ---------- Input ---------- */
document.addEventListener('input',function(e){
 var t=e.target,p=t.dataset&&t.dataset.lke;
 if(!p||!LK.editor||!LK.editor.S||t.type==='checkbox'||t.tagName==='SELECT')return;
 lkeSet(p,t.value);lkeLive();
});
document.addEventListener('change',function(e){
 var t=e.target,p=t.dataset&&t.dataset.lke;
 if(!p||!LK.editor||!LK.editor.S)return;
 if(!(t.type==='checkbox'||t.tagName==='SELECT'))return;
 var d=LK.editor,s=d.S;
 if(p==='kelas'){
  var old=s.kelas;s.kelas=t.value;
  if(KELAS[t.value]&&(!lkeT(s.fase)||(KELAS[old]&&s.fase===KELAS[old].fase)))s.fase=KELAS[t.value].fase;
  lkeRe();return;
 }
 lkeSet(p,t.type==='checkbox'?t.checked:t.value);
 lkeLive();
});
