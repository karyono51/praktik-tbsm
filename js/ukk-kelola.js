/* ukk-kelola.js: tata kelola UKK untuk guru dan admin, disamakan dengan pola modul LKPD.
   ALUR (dua tingkat, seperti LKPD Praktik):
     1. Daftar unit UKK per kelas (kartu ringkas: Kelola unit, Tampilkan/Sembunyikan, + UKK baru).
     2. Kelola unit: satu halaman dengan tab Hasil penilaian dan Pengaturan, tombol Pratinjau, Edit isi, Duplikat.
   TEKNIS: dokumen UKK ikut koleksi lkpd_modules (penanda jenis:'ukk'), sehingga sinkronisasi Appwrite, antrean offline, izin
   label lkpdeditor, dan penyimpanan lokal sama persis dengan modul LKPD. Penyimpanan lewat satu pintu (ukkStore) yang memeriksa
   ID, status, waktu, butir, jadwal, dan ukuran dokumen (maks. sekitar 450 KB). Unit bawaan (UKK-1..4) tidak dapat dihapus,
   hanya disembunyikan (draft), dan hasil edit disimpan sebagai salinan penimpa; unit buatan sendiri dapat dihapus (diarsipkan,
   nilai lama tetap terbaca di rekap).
   PENGEDITAN: editor terstruktur bertab (Info, Identitas lembar, Butir pemeriksaan), baris terpisah dengan tombol naik, turun,
   hapus, Tempel banyak, lencana masalah per tab, draf otomatis di perangkat, Simpan dan Pratinjau. */
var UKS={id:null,tab:'hasil',f:'penilaian',set:null,ed:null,prev:null};
var UKK_BASE=JOBS.filter(function(j){return j.ukk}).map(function(j){return j});
var UKK_ARSIP0=JOBS_ARSIP.slice();
var UKK_MAXBYTES=450*1024,UKK_MAXITEM=60;
(function(){var st=document.createElement('style');st.textContent=
'.uks-hint{font-size:13px;color:var(--muted)}.uks-pv{border-left:4px solid var(--accent);font-size:13.5px;line-height:1.5}'+
'.uke-item{grid-template-columns:26px 1fr auto}.uke-wj{display:flex;align-items:center;gap:8px;font-size:13.5px}.uke-wj input{width:22px;height:22px;accent-color:var(--accent)}';
document.head.appendChild(st)})();

/* ---------- Data ---------- */
function ukkIsBase(id){return UKK_BASE.some(function(j){return j.id===id})}
function ukkDocs(){return (S.lkpdModules||[]).map(function(m){
 var x=Object.assign({},m),p=null;
 if(x.payload&&typeof x.payload==='string'){try{p=JSON.parse(x.payload)}catch(e){}}
 if(p&&typeof p==='object'){delete p.payload;x=Object.assign({},p,x)}
 return x}).filter(function(x){return x.jenis==='ukk'})}
function ukkT(s){var t=s?new Date(s).getTime():0;return isNaN(t)?0:t}
function ukkFmt(s){var t=ukkT(s);return t?new Date(t).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
function ukkMakeJob(d,base){
 var f=Object.assign({},(base&&base.form)||FORM_UKK,d.form||{});
 var items=(d.items||[]).map(function(i,k){return {id:d.id+'-'+k,a:'R',no:k+1,t:String(i.t||''),std:String(i.std||''),k:!!i.k,f:!!i.f}});
 return {id:d.id,kelas:d.kelas,judul:d.title,unit:d.unit||'',menit:Number(d.duration)||20,ukk:true,skkni:d.skkni||'',form:f,items:items,
  cfg:{tampil:d.status==='published'&&d.active!==false,mode:d.mode==='ujian'?'ujian':'latihan',maxTry:Math.max(0,parseInt(d.maxTry,10)||0),buka:d.buka||'',tutup:d.tutup||''},
  custom:!base,dihapus:!!d.dihapus,diubah:!!base};
}
function ukkRebuild(){
 var docs=ukkDocs(),map={},arsip=[],order=[];
 UKK_BASE.forEach(function(j){
  var b=Object.assign({},j);b.cfg={tampil:true,mode:'latihan',maxTry:0,buka:'',tutup:''};map[j.id]=b;order.push(j.id)});
 docs.forEach(function(d){
  if(d.reset){return}
  var base=UKK_BASE.filter(function(j){return j.id===d.id})[0];
  /* unit bawaan tidak bisa dihapus: dokumen lama bertanda hapus dibaca sebagai disembunyikan */
  if(base&&d.dihapus)d=Object.assign({},d,{dihapus:false,status:'draft',active:false});
  var job=ukkMakeJob(d,base);
  if(!(d.id in map))order.push(d.id);
  map[d.id]=job;
 });
 var jobs=[];
 order.forEach(function(id){var j=map[id];if(j.dihapus)arsip.push(j);else jobs.push(j)});
 JOBS=jobs;
 JOBS_ARSIP=UKK_ARSIP0.concat(arsip);
}
/* LKPD tidak boleh ikut menampilkan dokumen UKK */
(function(){
 var r0=lkRefreshModules;
 window.lkRefreshModules=function(){r0.apply(this,arguments);LKPD_MODULES=LKPD_MODULES.filter(function(m){return m.jenis!=='ukk'});ukkRebuild()};
 try{lkRefreshModules()}catch(e){ukkRebuild()}
})();

/* ---------- Aturan tampil untuk siswa ---------- */
function ukkTampil(j){return !j.cfg||j.cfg.tampil!==false}
/* Kesempatan ujian hanya dihitung dari pengerjaan Ujian siswa sendiri (tipe Penilaian yang dikirim akunnya, bukan oleh guru) */
function ukkPakai(j){var id=S.user?S.user.id:'',un=S.user?S.user.username:'';return visibleResults().filter(function(r){return r.jobId===j.id&&r.sid===id&&r.tipe==='Penilaian'&&r.oleh===un}).length}
/* Pesan kunci menurut sudut pandang siswa. used: jumlah kesempatan terpakai (null = abaikan batas kesempatan, dipakai pratinjau). */
function ukkKunciUntuk(j,used){
 if(!j||!j.cfg)return '';
 if(!ukkTampil(j))return 'Unit ini belum dibuka oleh guru.';
 var n=Date.now(),b=ukkT(j.cfg.buka),t=ukkT(j.cfg.tutup);
 if(b&&n<b)return 'Belum dibuka. Dibuka '+ukkFmt(j.cfg.buka);
 if(t&&n>t)return 'Sudah ditutup sejak '+ukkFmt(j.cfg.tutup);
 if(used!==null&&j.cfg.mode==='ujian'&&j.cfg.maxTry>0&&used>=j.cfg.maxTry)return 'Kesempatan ujian habis ('+j.cfg.maxTry+' kali).';
 return '';
}
function ukkKunci(j){if(isStaff()||!j||!j.cfg)return '';return ukkKunciUntuk(j,ukkPakai(j))}

/* ---------- Penyimpanan satu pintu ---------- */
function ukkSimpanDoc(d){
 S.lkpdModules=S.lkpdModules||[];
 delete d.payload;
 var i=S.lkpdModules.findIndex(function(x){return x.id===d.id}),old=i>=0?S.lkpdModules[i]:null;
 d.jenis='ukk';d.version=1;d.updatedAt=Date.now();d.updatedBy=S.user.username||S.user.id;d.r=old&&old.r?1:0;d.d=1;
 if(i<0)S.lkpdModules.push(d);else S.lkpdModules[i]=d;
 lkSaveModules();lkRefreshModules();
}
function ukkDocOf(id){return ukkDocs().filter(function(x){return x.id===id})[0]||null}
function ukkJobBy(id){return JOBS.filter(function(j){return j.id===id})[0]||null}
function ukkIdTaken(id){
 var k=String(id).toLowerCase();
 return [].concat(LKPD_MODULES||[],JOBS||[],JOBS_ARSIP||[],S.lkpdModules||[]).some(function(x){return String(x.id||x.moduleId||'').toLowerCase()===k});
}
function ukkDocFromJob(j){
 return {id:j.id,jenis:'ukk',title:j.judul,kelas:j.kelas,fase:(KELAS[j.kelas]||{}).fase||'F',unit:j.unit,duration:j.menit,skkni:j.skkni||'',
  form:Object.assign({},j.form),items:j.items.map(function(i){return {t:i.t,std:i.std,k:!!i.k,f:!!i.f}}),
  status:j.cfg&&j.cfg.tampil===false?'draft':'published',active:!(j.cfg&&j.cfg.tampil===false),mode:j.cfg&&j.cfg.mode==='ujian'?'ujian':'latihan',maxTry:j.cfg?j.cfg.maxTry:0,buka:j.cfg?j.cfg.buka:'',tutup:j.cfg?j.cfg.tutup:''};
}
function ukkValidateDoc(d){
 if(!/^[A-Za-z0-9_-]{2,32}$/.test(String(d.id||'')))return 'ID unit wajib 2–32 karakter: huruf, angka, _ atau -.';
 var t=String(d.title||'').trim();
 if(!t||t.length>180)return 'Judul wajib diisi (maks. 180 karakter).';
 var u=String(d.unit||'').trim();
 if(!u)return 'Tipe kendaraan / unit wajib diisi.';
 if(u.length>120)return 'Tipe kendaraan / unit maksimal 120 karakter.';
 if(!KELAS[d.kelas])return 'Kelas tidak valid.';
 if(['draft','published'].indexOf(d.status)<0)return 'Status unit tidak valid.';
 if(d.mode!==undefined&&['latihan','ujian'].indexOf(d.mode)<0)return 'Mode unit harus Latihan atau Ujian.';
 var m=Number(d.duration);if(!(m>=1&&m<=600))return 'Alokasi waktu 1 sampai 600 menit.';
 var items=d.items||[];
 if(!items.length)return 'Isi minimal satu butir pemeriksaan.';
 if(items.length>UKK_MAXITEM)return 'Maksimal '+UKK_MAXITEM+' butir per unit.';
 for(var i=0;i<items.length;i++){
  if(!String(items[i].t||'').trim())return 'Butir '+(i+1)+': nama komponen kosong.';
  if(String(items[i].t).length>200||String(items[i].std||'').length>300)return 'Butir '+(i+1)+': terlalu panjang (komponen maks. 200, standar maks. 300 karakter).';
 }
 var f=d.form||{},bad=['satuan','konsentrasi','kode','tahun','bentuk'].filter(function(k){return String(f[k]||'').length>120})[0];
 if(bad)return 'Identitas lembar "'+bad+'" maksimal 120 karakter.';
 var mt=parseInt(d.maxTry,10)||0;if(mt<0||mt>9)return 'Kesempatan mengerjakan 0 sampai 9 kali.';
 if(d.buka&&isNaN(ukkT(d.buka)))return 'Waktu buka tidak valid.';
 if(d.tutup&&isNaN(ukkT(d.tutup)))return 'Waktu tutup tidak valid.';
 if(d.buka&&d.tutup&&ukkT(d.tutup)<=ukkT(d.buka))return 'Waktu tutup harus setelah waktu buka.';
 try{if(JSON.stringify(d).length>UKK_MAXBYTES)return 'Ukuran unit terlalu besar (maks. sekitar 450 KB).'}catch(e){}
 return '';
}
/* Mengembalikan pesan galat, atau '' bila tersimpan. */
function ukkStore(doc){var err=ukkValidateDoc(doc);if(err)return err;ukkSimpanDoc(doc);return ''}
function ukkFlush(){setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500)}
function ukkIdBaru(){return 'UKK-'+Date.now().toString(36).toUpperCase()}
function ukkNilai(r){return Number(r.score)||0}

/* ---------- Tingkat 1: daftar unit ---------- */
window.ukkTopBar=function(){
 if(!isStaff())return '';
 return '<div class="lks-acts"><button type="button" class="btn primary small" data-act="ukm-baru">+ UKK baru</button><button type="button" class="btn small" data-act="ukm-showall">Tampilkan semua</button><button type="button" class="btn small" data-act="ukm-hideall">Sembunyikan semua</button></div>';
};
window.ukkCardInfo=function(j){
 var c=j.cfg||{},tags='';
 if(isStaff()){
  var rs=S.results.filter(function(r){return r.jobId===j.id&&r.tipe==='Penilaian'});
  var avg=rs.length?Math.round(rs.reduce(function(t,r){return t+ukkNilai(r)},0)/rs.length):0;
  tags='<span class="pill '+(ukkTampil(j)?'ok':'warn')+'">'+(ukkTampil(j)?'Tampil':'Tersembunyi')+'</span><span class="pill '+(c.mode==='ujian'?'warn':'ok')+'">'+(c.mode==='ujian'?'Ujian':'Latihan')+'</span>'+
   '<span class="pill plain">'+(rs.length?rs.length+' penilaian · rata-rata '+avg:'Belum ada penilaian')+'</span>'+
   (c.maxTry?'<span class="pill plain">'+c.maxTry+'× kesempatan</span>':'')+(c.buka?'<span class="pill plain">Buka '+esc(ukkFmt(c.buka))+'</span>':'')+(c.tutup?'<span class="pill plain">Tutup '+esc(ukkFmt(c.tutup))+'</span>':'')+
   (j.diubah?'<span class="pill plain">Diedit</span>':'')+(j.custom?'<span class="pill plain">Unit sendiri</span>':'');
 }else{
  tags='<span class="pill '+(c.mode==='ujian'?'warn':'ok')+'">'+(c.mode==='ujian'?'Ujian':'Latihan')+'</span>';
  if(c.mode==='ujian'&&c.maxTry)tags+='<span class="pill plain">Kesempatan '+ukkPakai(j)+'/'+c.maxTry+'</span>';
  if(c.tutup)tags+='<span class="pill plain">Tutup '+esc(ukkFmt(c.tutup))+'</span>';
 }
 return tags?'<div class="lkm-tags" style="display:flex;flex-wrap:wrap;gap:6px">'+tags+'</div>':'';
};
window.ukkCardAction=function(j){
 var id=esc(j.id);
 if(isStaff()){
  return '<div class="lks-acts"><button type="button" class="btn primary small grow" data-act="ukm-open" data-v="'+id+'">Kelola unit</button>'+
   '<button type="button" class="btn small" data-act="ukm-toggle" data-v="'+id+'">'+(ukkTampil(j)?'Sembunyikan':'Tampilkan')+'</button></div>';
 }
 var msg=ukkKunci(j),sisa=ujiSisaDraft?ujiSisaDraft(j.id,j.menit):null;
 if(sisa!==null)return '<span class="pill warn">'+(sisa>0?'Waktu berjalan · sisa '+mmss(sisa):'Waktu habis')+'</span> <button type="button" class="btn primary small" data-act="start" data-v="'+id+'">'+(sisa>0?'Lanjutkan':'Lihat hasil')+'</button>';
 if(msg)return '<span class="pill warn">'+esc(msg)+'</span>';
 return '<button type="button" class="btn primary small" data-act="start" data-v="'+id+'">'+(j.cfg&&j.cfg.mode==='ujian'?'Mulai ujian':'Mulai latihan')+'</button>';
};

/* ---------- Tingkat 2: kelola satu unit ---------- */
function ukkTabs(){
 return '<div class="lks-tabs"><div class="seg" role="tablist" aria-label="Kelola unit">'+[['hasil','Hasil penilaian'],['atur','Pengaturan']].map(function(t){
  return '<button type="button" role="tab" data-act="ukm-tab" data-v="'+t[0]+'" aria-pressed="'+(UKS.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div></div>';
}
function ukkHasil(j){
 var all=S.results.filter(function(r){return r.jobId===j.id}).sort(function(a,b){return b.ts-a.ts});
 var pen=all.filter(function(r){return r.tipe==='Penilaian'}),lat=all.length-pen.length;
 if(!lat&&UKS.f!=='penilaian')UKS.f='penilaian';
 var rows=UKS.f==='semua'?all:pen,avg=rows.length?Math.round(rows.reduce(function(t,r){return t+ukkNilai(r)},0)/rows.length):0,kom=rows.filter(function(r){return r.kompeten}).length;
 var chips=lat?'<div class="chips" role="group" aria-label="Filter jenis">'+[['penilaian','Penilaian · '+pen.length],['semua','Penilaian + Latihan · '+all.length]].map(function(c){return '<button type="button" data-act="ukm-f" data-v="'+c[0]+'" aria-pressed="'+(UKS.f===c[0])+'">'+c[1]+'</button>'}).join('')+'</div>':'';
 var list=rows.map(function(r){
  return '<article class="card"><div class="row sb"><b>'+esc(r.siswa)+'</b><span class="pill '+(r.kompeten?'ok':'bad')+'">'+(r.kompeten?'Kompeten':'Belum kompeten')+' · '+ukkNilai(r)+'</span></div>'+
   '<p class="note">'+new Date(r.ts).toLocaleDateString('id-ID')+' · '+esc(jenisTampil(r))+(r.penilai?' · oleh '+esc(r.penilai):'')+'</p>'+ukFotoTombol(r)+ukkPdfTombol(r)+'</article>';
 }).join('');
 return '<div class="lks-acts"><button type="button" class="btn primary small" data-act="start" data-v="'+esc(j.id)+'">Nilai siswa</button><button type="button" class="btn small" data-act="ukm-xls" data-v="'+esc(j.id)+'">Unduh Excel</button></div>'+
  '<div class="stats"><div class="card"><span class="label">Dinilai</span><b class="mono">'+rows.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+kom+'</b></div></div>'+chips+
  (list||'<div class="card muted">Belum ada penilaian untuk unit ini.</div>')+ukkAnalisis(j);
}
function ukkOpenAtur(j){
 if(UKS.set&&UKS.set.id===j.id)return;
 var c=j.cfg||{};UKS.set={id:j.id,tampil:ukkTampil(j),mode:c.mode==='ujian'?'ujian':'latihan',maxTry:c.maxTry||0,buka:c.buka||'',tutup:c.tutup||'',semua:false};
}
function ukkAtur(j){
 ukkOpenAtur(j);var d=UKS.set;
 var tries=[[0,'Tidak terbatas'],[1,'1 kali'],[2,'2 kali'],[3,'3 kali']].map(function(o){return '<option value="'+o[0]+'"'+(+d.maxTry===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('');
 var modeHtml='<div><span class="label">Mode</span><div class="seg" role="group" aria-label="Mode UKK"><button type="button" data-act="ukm-mode" data-v="latihan" aria-pressed="'+(d.mode!=='ujian')+'">Latihan</button><button type="button" data-act="ukm-mode" data-v="ujian" aria-pressed="'+(d.mode==='ujian')+'">Ujian</button></div></div><p class="note">'+(d.mode==='ujian'?'Ujian: hasil siswa tercatat sebagai Penilaian, masuk rekap nilai dan kompetensi, dan kesempatan mengerjakan bisa dibatasi.':'Latihan: siswa boleh mengulang tanpa batas. Hasil tercatat sebagai Latihan dan tidak masuk rekap nilai.')+'</p>'+ukFotoInfo(j);
 return '<section class="card" id="ukm-set" style="display:grid;gap:10px"><h3>Pengaturan: '+esc(j.judul)+'</h3>'+
  '<label class="lk-check"><input type="checkbox" data-ukm-s="tampil"'+(d.tampil?' checked':'')+'><span><b>Tampilkan ke siswa</b><small>Matikan untuk menyembunyikan unit (jadi draft). Perubahan ini langsung berlaku.</small></span></label>'+
  modeHtml+(d.mode==='ujian'?'<label class="f">Kesempatan mengerjakan ujian (per siswa)<select data-ukm-s="maxTry">'+tries+'</select></label>':'')+
  '<div class="two"><label class="f">Dibuka (opsional)<input type="datetime-local" data-ukm-s="buka" value="'+esc(d.buka)+'"></label><label class="f">Ditutup (opsional)<input type="datetime-local" data-ukm-s="tutup" value="'+esc(d.tutup)+'"></label></div>'+
  '<div><button type="button" class="btn small" data-act="ukm-kosongjadwal">Kosongkan jadwal</button></div>'+
  '<label class="lk-check"><input type="checkbox" data-ukm-s="semua"'+(d.semua?' checked':'')+'><span><b>Terapkan mode dan kesempatan ke semua UKK '+esc(KELAS[j.kelas].judul)+'</b><small>Status tampil dan jadwal tidak ikut diubah.</small></span></label>'+
  '<p class="note">Waktu mengerjakan tetap '+j.menit+' menit. Waktu berjalan otomatis, tidak bisa dijeda, dan hasil dihitung otomatis saat waktu habis.</p>'+
  '<div class="row"><button type="button" class="btn" data-act="ukm-batal-set">Batal</button><button type="button" class="btn primary grow" data-act="ukm-simpan-set">Simpan pengaturan</button></div></section>';
}
function ukkHub(){
 var j=ukkJobBy(UKS.id);if(!j||j.kelas!==S.kelas){UKS.id=null;UKS.set=null;return ''}
 var pub=ukkTampil(j),id=esc(j.id),wajib=j.items.filter(function(i){return i.k}).length,body;
 if(UKS.tab==='atur')body=ukkAtur(j);else{UKS.set=null;body=ukkHasil(j)}
 return '<div class="row"><button type="button" class="btn small" data-act="ukm-list">‹ Daftar UKK '+esc(KELAS[S.kelas].judul)+'</button></div>'+
  '<section class="card lks-card"><div class="row sb"><h2 class="grow">'+esc(j.judul)+'</h2><span class="pill '+(pub?'ok':'warn')+'">'+(pub?'Tampil':'Tersembunyi')+'</span></div>'+
  '<div class="meta"><span>'+esc(j.unit)+'</span><span class="mono">'+j.menit+' menit</span><span>'+j.items.length+' butir, '+wajib+' wajib</span></div>'+
  (j.skkni?'<div><span class="pill plain mono">SKKNI '+esc(j.skkni)+'</span></div>':'')+
  '<div class="lks-acts"><button type="button" class="btn small" data-act="ukm-prev" data-v="'+id+'">Pratinjau</button><button type="button" class="btn small" data-act="ukm-edit" data-v="'+id+'">Edit isi</button><button type="button" class="btn small" data-act="ukm-dup" data-v="'+id+'">Duplikat</button>'+
  '<button type="button" class="btn small" data-act="ukm-toggle" data-v="'+id+'">'+(pub?'Sembunyikan':'Tampilkan')+'</button>'+
  (j.diubah&&ukkIsBase(j.id)?'<button type="button" class="btn small" data-act="ukm-reset" data-v="'+id+'">Kembalikan bawaan</button>':'')+
  (!ukkIsBase(j.id)?'<button type="button" class="btn small danger" data-act="ukm-hapus" data-v="'+id+'">Hapus</button>':'')+'</div></section>'+
  ukkTabs()+body;
}

/* ---------- Pratinjau tampilan siswa ---------- */
function ukkPreview(){
 var j=ukkJobBy(UKS.prev);if(!j){UKS.prev=null;return ''}
 var f=j.form,msg=ukkKunciUntuk(j,null),c=j.cfg||{};
 var ro=function(l,v,w){return '<label class="f'+(w?' wide':'')+'">'+l+'<input value="'+esc(v)+'" readonly></label>'};
 var rows=j.items.map(function(i){
  return '<tr class="ukk-row" data-v=""><td data-label="Komponen">'+i.no+'. '+esc(i.t)+(i.k?' <span class="pill warn">Wajib</span>':'')+(i.f?' <span class="pill warn">Foto</span>':'')+'</td>'+
   '<td data-label="Hasil aktual"><input disabled placeholder="Nilai ukur / hasil"></td><td data-label="Standar manual">'+esc(i.std)+'</td>'+
   '<td data-label="Status"><select disabled><option>Belum diperiksa</option></select></td><td data-label="Catatan"><input disabled></td></tr>'}).join('');
 return '<div class="row"><button type="button" class="btn small" data-act="ukm-prev-close">‹ Kembali ke Kelola unit</button></div>'+
  '<div class="card uks-pv"><b>Pratinjau tampilan siswa</b> · pengisian dinonaktifkan, tidak ada yang tersimpan. '+(msg?'Saat ini siswa melihat: <b>'+esc(msg)+'</b>':'Unit ini terbuka untuk siswa'+(c.maxTry?' (kesempatan '+c.maxTry+' kali)':'')+(c.tutup?', ditutup '+esc(ukkFmt(c.tutup)):'')+'.')+'</div>'+
  '<section class="card"><h2>Identitas praktik</h2><p class="note">Uji Kompetensi Keahlian · Tahun Pelajaran '+esc(f.tahun)+' · Kode '+esc(f.kode)+'</p><div class="formgrid">'+
  ro('Sekolah',f.satuan)+ro('Konsentrasi keahlian',f.konsentrasi)+ro('Kelas',j.kelas)+ro('Tipe kendaraan',j.unit)+ro('Alokasi waktu',j.menit+' menit')+ro('Bentuk',f.bentuk)+'</div></section>'+
  '<section class="card"><h2>Hasil pemeriksaan</h2><p class="note">'+esc(j.judul)+'</p><div class="tablewrap"><table class="ukk"><thead><tr><th>Komponen</th><th>Hasil aktual</th><th>Standar manual</th><th>Status</th><th>Catatan</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}

/* ---------- Editor terstruktur ---------- */
var UKE={DKEY:'tbsm-ukk-ed-draft',timer:null,TABS:[['info','Info'],['identitas','Identitas lembar'],['butir','Butir pemeriksaan']]};
function ukeCp(x){return JSON.parse(JSON.stringify(x))}
function ukeT(v){return String(v==null?'':v).trim()}
function ukeNum(v){var s=ukeT(v).replace(',','.');return s===''?NaN:Number(s)}
function ukeBlank(i){return !ukeT(i.t)&&!ukeT(i.std)}
function ukeNew(src,mode){
 var f=Object.assign({},FORM_UKK,(src&&src.form)||{});
 var S0={id:mode==='edit'?src.id:ukkIdBaru(),title:src?src.title:'',unit:src?src.unit:'',kelas:src?src.kelas:S.kelas,duration:src?src.duration:20,skkni:src?(src.skkni||''):'',
  status:src&&mode==='edit'?(src.status==='published'?'published':'draft'):'draft',active:src?src.active!==false:true,form:{satuan:f.satuan||'',konsentrasi:f.konsentrasi||'',kode:f.kode||'',tahun:f.tahun||'',bentuk:f.bentuk||'',paket:f.paket||'1',tempat:f.tempat||'Sumedang'},
  items:src&&src.items&&src.items.length?src.items.map(function(i){return {t:i.t||'',std:i.std||'',k:!!i.k,f:!!i.f}}):[{t:'',std:'',k:false}]};
 if(mode==='dup')S0.title=S0.title+' (salinan)';
 var d={S:S0,tab:'info',paste:false,rec:null,focus:null,isNew:mode!=='edit',snap:JSON.stringify(S0),back:UKS.id};
 try{
  var raw=JSON.parse(localStorage.getItem(UKE.DKEY)||'null'),k=d.isNew?'(baru)':S0.id;
  if(raw&&raw.k===k&&raw.S&&JSON.stringify(raw.S)!==d.snap&&Date.now()-raw.ts<14*864e5)d.rec=raw;
 }catch(e){}
 UKS.ed=d;UKS.prev=null;UKS.set=null;
}
function ukeDirty(d){return !!d&&JSON.stringify(d.S)!==d.snap}
function ukeDraftSoon(){
 clearTimeout(UKE.timer);
 UKE.timer=setTimeout(function(){
  var d=UKS.ed;if(!d||!ukeDirty(d))return;
  try{localStorage.setItem(UKE.DKEY,JSON.stringify({k:d.isNew?'(baru)':d.S.id,ts:Date.now(),S:d.S}))}catch(e){}
 },700);
}
function ukeDraftClear(){clearTimeout(UKE.timer);try{localStorage.removeItem(UKE.DKEY)}catch(e){}}
function ukeIssues(d){
 var s=d.S,I=[],id=ukeT(s.id);
 function add(tab,msg){I.push({tab:tab,msg:msg})}
 if(!/^[A-Za-z0-9_-]{2,32}$/.test(id))add('info','ID unit wajib 2–32 karakter: huruf, angka, _ atau -');
 else if(d.isNew&&ukkIdTaken(id))add('info','ID "'+id+'" sudah dipakai unit atau modul lain');
 if(!ukeT(s.title))add('info','Judul unit belum diisi');else if(ukeT(s.title).length>180)add('info','Judul maksimal 180 karakter');
 if(!ukeT(s.unit))add('info','Tipe kendaraan / unit belum diisi');else if(ukeT(s.unit).length>120)add('info','Tipe kendaraan maksimal 120 karakter');
 if(!KELAS[s.kelas])add('info','Kelas tidak valid');
 var du=ukeNum(s.duration);if(!(du>=1&&du<=600))add('info','Alokasi waktu harus 1–600 menit');
 [['satuan','Sekolah'],['konsentrasi','Konsentrasi keahlian'],['kode','Kode'],['tahun','Tahun pelajaran'],['bentuk','Bentuk']].forEach(function(k){
  if(!ukeT(s.form[k[0]]))add('identitas',k[1]+' belum diisi');else if(ukeT(s.form[k[0]]).length>120)add('identitas',k[1]+' maksimal 120 karakter')});
 var it=s.items.filter(function(i){return !ukeBlank(i)});
 if(!it.length)add('butir','Tambahkan minimal satu butir pemeriksaan');
 if(it.length>UKK_MAXITEM)add('butir','Maksimal '+UKK_MAXITEM+' butir per unit');
 s.items.forEach(function(i,k){
  if(ukeBlank(i))return;
  if(!ukeT(i.t))add('butir','Butir no. '+(k+1)+': nama komponen kosong');
  else if(ukeT(i.t).length>200||ukeT(i.std).length>300)add('butir','Butir no. '+(k+1)+': terlalu panjang (komponen maks. 200, standar maks. 300 karakter)');
 });
 return I;
}
function ukeBuild(d){
 var s=d.S,old=ukkDocOf(s.id)||(!d.isNew&&ukkJobBy(s.id)?ukkDocFromJob(ukkJobBy(s.id)):null),src=old||{};
 var doc=Object.assign({},src,{id:ukeT(s.id),jenis:'ukk',version:1,title:ukeT(s.title),unit:ukeT(s.unit),kelas:s.kelas,fase:(KELAS[s.kelas]||{}).fase||'F',duration:Number(ukeNum(s.duration)),skkni:ukeT(s.skkni),
  form:{satuan:ukeT(s.form.satuan),konsentrasi:ukeT(s.form.konsentrasi),kode:ukeT(s.form.kode),tahun:ukeT(s.form.tahun),bentuk:ukeT(s.form.bentuk),paket:ukeT(s.form.paket)||'1',tempat:ukeT(s.form.tempat)||'Sumedang'},
  items:s.items.filter(function(i){return !ukeBlank(i)}).map(function(i){return {t:ukeT(i.t),std:ukeT(i.std),k:!!i.k,f:!!i.f}}),
  status:s.status==='published'?'published':'draft',active:!!s.active,maxTry:src.maxTry||0,buka:src.buka||'',tutup:src.tutup||''});
 /* pengaturan jadwal dan kesempatan dipertahankan dari panel Pengaturan */
 delete doc.reset;delete doc.dihapus;delete doc.payload;
 if(!doc.buka)delete doc.buka;if(!doc.tutup)delete doc.tutup;
 return doc;
}
function ukeSave(prev){
 var d=UKS.ed;if(!d)return;
 var iss=ukeIssues(d);
 if(iss.length){d.tab=iss[0].tab;ukeRe();toast(iss[0].msg+(iss.length>1?' (dan '+(iss.length-1)+' lainnya)':''));return}
 var doc=ukeBuild(d),err=ukkStore(doc);
 if(err){toast(err);return}
 ukeDraftClear();UKS.ed=null;UKS.id=doc.id;UKS.tab='hasil';UKS.set=null;UKS.prev=prev?doc.id:null;
 if(doc.kelas!==S.kelas){S.kelas=doc.kelas;try{persist()}catch(e){}}
 render();window.scrollTo(0,0);toast(prev?'Unit tersimpan, membuka pratinjau':'Unit tersimpan');ukkFlush();
}
function ukeClose(){
 var d=UKS.ed;ukeDraftClear();UKS.ed=null;
 if(d&&d.isNew&&!ukkJobBy(d.S.id))UKS.id=d.back&&ukkJobBy(d.back)?d.back:null;
 render();window.scrollTo(0,0);
}
function ukeIc(a,i,label,txt,dis,cls){return '<button type="button" class="lke-ic'+(cls?' '+cls:'')+'" data-uke-a="'+a+'" data-i="'+i+'" aria-label="'+label+'"'+(dis?' disabled':'')+'>'+txt+'</button>'}
function ukeCtl(i,n){return '<div class="lke-ctl">'+ukeIc('up',i,'Naikkan','↑',i===0)+ukeIc('down',i,'Turunkan','↓',i===n-1)+ukeIc('del',i,'Hapus butir','✕',false,'del')+'</div>'}
function ukeCalc(d){
 var s=d.S,it=s.items.filter(function(i){return !ukeBlank(i)}),w=it.filter(function(i){return i.k}).length;
 return '<div class="row sb"><b>'+it.length+' butir · '+w+' wajib</b><span class="pill '+(it.length&&it.length<=UKK_MAXITEM?'ok':'warn')+'">'+(it.length>UKK_MAXITEM?'Melebihi '+UKK_MAXITEM:(it.length?'Sesuai':'Belum ada butir'))+'</span></div>'+
  (w===0&&it.length?'<p class="note">Belum ada butir wajib. Butir wajib yang belum sesuai membuat hasil Belum Kompeten.</p>':'');
}
function ukeBar(d){
 var I=ukeIssues(d),cnt={};I.forEach(function(x){cnt[x.tab]=(cnt[x.tab]||0)+1});
 var tabs='<div class="lke-tabs" role="tablist">'+UKE.TABS.map(function(t){return '<button type="button" role="tab" data-uke-a="tab" data-v="'+t[0]+'" aria-pressed="'+(d.tab===t[0])+'">'+t[1]+'<span class="lke-badge'+(cnt[t[0]]?'':' ok')+'">'+(cnt[t[0]]||'✓')+'</span></button>'}).join('')+'</div>';
 var hl=I.length?'<div class="lke-health warn"><b>'+I.length+' hal perlu dilengkapi sebelum disimpan</b><ul>'+I.slice(0,3).map(function(x){return '<li><button type="button" data-uke-a="tab" data-v="'+x.tab+'">'+esc(x.msg)+'</button></li>'}).join('')+(I.length>3?'<li>dan '+(I.length-3)+' lainnya</li>':'')+'</ul></div>':'<div class="lke-health"><b>Semua bagian lengkap.</b> Unit siap disimpan.</div>';
 return tabs+hl;
}
function ukeTabInfo(d){
 var s=d.S,ro=!d.isNew,kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(s.kelas===k?' selected':'')+'>'+esc(KELAS[k].judul)+'</option>'}).join('');
 var vis=s.status==='published'&&s.active;
 return '<section class="card"><div class="two"><label class="f">ID unit'+(ro?' (tidak bisa diubah)':' (unik)')+'<input data-uke="id" value="'+esc(s.id)+'"'+(ro?' readonly':'')+' autocapitalize="characters"></label>'+
  '<label class="f">Kelas<select data-uke="kelas">'+kopt+'</select></label></div>'+
  '<label class="f">Judul unit<input data-uke="title" value="'+esc(s.title)+'" placeholder="contoh: Perawatan Berkala Sistem Rem"></label>'+
  '<label class="f">Tipe kendaraan / unit<input data-uke="unit" value="'+esc(s.unit)+'" placeholder="contoh: Honda Supra X 125 Karburator"></label>'+
  '<div class="two"><label class="f">Alokasi waktu (menit)<input type="number" inputmode="numeric" min="1" max="600" data-uke="duration" value="'+esc(s.duration)+'"></label>'+
  '<label class="f">Kode SKKNI (opsional)<input data-uke="skkni" value="'+esc(s.skkni)+'"></label></div>'+
  '<div><span class="label">Status</span><div class="seg" role="group" aria-label="Status unit"><button type="button" data-uke-a="status" data-v="draft" aria-pressed="'+(s.status!=='published')+'">Draft</button><button type="button" data-uke-a="status" data-v="published" aria-pressed="'+(s.status==='published')+'">Terbit</button></div></div>'+
  '<label class="lk-check"><input type="checkbox" data-uke="active"'+(s.active?' checked':'')+'><span><b>Unit aktif</b><small>Siswa hanya melihat unit yang Terbit dan Aktif. Kesempatan dan jadwal diatur di tab Pengaturan pada Kelola unit.</small></span></label>'+
  '<div class="lke-calc" id="uke-calc"><span class="pill '+(vis?'ok':'warn')+'" style="justify-self:start">'+(vis?'Terlihat oleh siswa kelas '+esc(s.kelas):'Tidak terlihat siswa (Draft atau nonaktif)')+'</span></div></section>';
}
function ukeTabIdentitas(d){
 var f=d.S.form;
 function fi(k,l,w){return '<label class="f'+(w?' wide':'')+'">'+l+'<input data-uke="form.'+k+'" value="'+esc(f[k])+'"></label>'}
 return '<section class="card"><div><h3>Identitas pada lembar UKK</h3><p class="note">Tampil di kartu Identitas praktik pada lembar penilaian dan PDF.</p></div><div class="formgrid">'+
  fi('satuan','Sekolah / satuan pendidikan',1)+fi('konsentrasi','Konsentrasi keahlian',1)+fi('kode','Kode')+fi('tahun','Tahun pelajaran')+fi('bentuk','Bentuk',1)+fi('paket','Nomor paket')+fi('tempat','Tempat pengesahan')+'</div></section>';
}
function ukePasteBox(d){
 if(!d.paste)return '';
 return '<div class="lke-list"><label class="f">Satu baris per butir: Komponen | Standar manual | wajib (kata wajib opsional di akhir). Nomor atau tanda di awal baris dibuang.<textarea id="uke-paste" rows="6" placeholder="Tempel di sini"></textarea></label><div class="row"><button type="button" class="btn small" data-uke-a="paste-close">Batal</button><button type="button" class="btn small primary" data-uke-a="paste-apply">Tambahkan</button></div></div>';
}
function ukeTabButir(d){
 var a=d.S.items;
 return '<section class="card"><div><h3>Butir pemeriksaan</h3><p class="note">Satu komponen per baris beserta standar manualnya. Centang Wajib bila butir menyangkut keselamatan atau ketepatan kerja: satu butir wajib yang belum sesuai membuat hasil Belum Kompeten. Nomor otomatis mengikuti urutan.</p></div>'+
  '<div class="lke-calc" id="uke-calc">'+ukeCalc(d)+'</div><div class="lke-list">'+
  a.map(function(x,i){return '<div class="lke-item uke-item"><span class="lke-n">'+(i+1)+'</span><div class="lke-f"><input data-uke="items.'+i+'.t" placeholder="Komponen (contoh: Tekanan ban depan)" value="'+esc(x.t)+'">'+
   '<textarea class="lke-1" rows="1" data-uke="items.'+i+'.std" placeholder="Standar manual (contoh: 200 kPa)">'+esc(x.std)+'</textarea>'+
   '<label class="uke-wj"><input type="checkbox" data-uke="items.'+i+'.k"'+(x.k?' checked':'')+'><span>Butir wajib</span></label><label class="uke-wj"><input type="checkbox" data-uke="items.'+i+'.f"'+(x.f?' checked':'')+'><span>Wajib foto</span></label></div>'+ukeCtl(i,a.length)+'</div>'}).join('')+'</div>'+
  '<div class="row" style="gap:6px"><button type="button" class="btn small primary" data-uke-a="add">+ Tambah butir</button>'+(d.paste?'':'<button type="button" class="btn small" data-uke-a="paste-open">Tempel banyak</button>')+'</div>'+ukePasteBox(d)+'</section>';
}
function ukeForm(){
 var d=UKS.ed,idx=UKE.TABS.map(function(t){return t[0]}).indexOf(d.tab),h='';
 if(d.rec)h+='<section class="card lke-rec"><b>Ada draf yang belum tersimpan</b><p class="note">Dari '+new Date(d.rec.ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'. Pulihkan untuk melanjutkan pekerjaan sebelumnya.</p><div class="row"><button type="button" class="btn small" data-uke-a="rec-drop">Buang draf</button><button type="button" class="btn small primary" data-uke-a="rec-use">Pulihkan</button></div></section>';
 h+='<div class="lke-top"><div><h2>'+(d.isNew?'UKK baru':'Edit unit')+'</h2><p class="note">'+(ukeT(d.S.id)?esc(ukeT(d.S.id))+' · ':'')+'Disimpan otomatis di perangkat ini sebagai draf.</p></div><div class="row"><button type="button" class="btn small" data-uke-a="cancel">Kembali</button><button type="button" class="btn small primary" data-uke-a="save">Simpan unit</button></div></div>';
 h+='<div id="uke-bar">'+ukeBar(d)+'</div>';
 h+=d.tab==='info'?ukeTabInfo(d):(d.tab==='identitas'?ukeTabIdentitas(d):ukeTabButir(d));
 h+='<div class="lke-nav"><button type="button" class="btn"'+(idx<=0?' disabled':'')+' data-uke-a="prev">← Sebelumnya</button>'+
  (idx>=UKE.TABS.length-1?'<div class="row"><button type="button" class="btn" data-uke-a="save-prev">Simpan dan pratinjau</button><button type="button" class="btn primary" data-uke-a="save">Simpan unit</button></div>':'<button type="button" class="btn primary" data-uke-a="next">Berikutnya →</button>')+'</div>';
 return '<div class="stack">'+h+'</div>';
}
function ukeLive(){
 var d=UKS.ed;if(!d)return;
 var b=$('#uke-bar');if(b)b.innerHTML=ukeBar(d);
 var c=$('#uke-calc');if(c&&d.tab==='butir')c.innerHTML=ukeCalc(d);
 ukeDraftSoon();
}
function ukeRe(){
 var d=UKS.ed,y=window.scrollY;render();window.scrollTo(0,y);
 if(d&&d.focus){var el=document.querySelector('[data-uke="'+d.focus+'"]');d.focus=null;if(el){try{el.focus({preventScroll:false})}catch(e){}}}
 ukeDraftSoon();
}
function ukeSet(p,v){
 var parts=p.split('.'),o=UKS.ed.S,i;
 for(i=0;i<parts.length-1;i++)o=o[/^\d+$/.test(parts[i])?+parts[i]:parts[i]];
 var k=parts[parts.length-1];o[/^\d+$/.test(k)?+k:k]=v;
}
function ukeMove(a,i,j){if(j<0||j>=a.length)return;var x=a.splice(i,1)[0];a.splice(j,0,x)}
function ukeParsePaste(txt){
 return String(txt).replace(/\r\n?/g,'\n').split('\n').map(function(x){return x.trim()}).filter(Boolean).map(function(l){
  l=l.replace(/^(?:[-•*·]+|\d+[.)])\s*/,'');
  var p=l.split('|').map(function(x){return x.trim()}),k=false;
  if(p.length>=3&&/^(wajib|1|ya|y|true)$/i.test(p[p.length-1])){k=true;p.pop()}
  return {t:p[0]||'',std:p.slice(1).join(' | '),k:k};
 });
}

/* ---------- Titik masuk tampilan (dipakai viewKatalog di views.js) ---------- */
window.ukkPanel=function(){
 if(!isStaff()){UKS.id=null;UKS.ed=null;UKS.prev=null;UKS.set=null;return ''}
 if(UKS.ed)return ukeForm();
 if(UKS.prev)return ukkPreview();
 if(UKS.id)return ukkHub();
 UKS.set=null;return '';
};

/* ---------- Tombol kembali HP dan perpindahan halaman ---------- */
(function(){
 var b0=bkBack;
 bkBack=function(){
  if(S.user&&isStaff()&&S.tab==='katalog'&&V.mode==='list'&&!document.querySelector('.ui-ov')&&(UKS.ed||UKS.prev||UKS.id)){
   if(UKS.ed){
    if(ukeDirty(UKS.ed)){
     if(!uiOk('bkukkeditor','Tutup editor?\nPerubahan yang belum disimpan akan hilang. Draf tetap tersimpan di perangkat ini.',function(){bkBack()},{ok:'Tutup',danger:true}))return;
    }
    ukeClose();return;
   }
   if(UKS.prev){UKS.prev=null;render();window.scrollTo(0,0);return}
   UKS.id=null;UKS.set=null;render();window.scrollTo(0,0);return;
  }
  b0.apply(this,arguments);
 };
 /* pindah menu, tab, atau kelas selalu kembali ke daftar unit */
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
  if(a==='menu'||a==='tab'||a==='kelas'||a==='kat-kelas'){UKS.id=null;UKS.set=null;UKS.prev=null;if(UKS.ed&&!ukeDirty(UKS.ed))UKS.ed=null}
 },true);
})();

/* ---------- Aksi ---------- */
function ukkToggle(id,show){
 var j=ukkJobBy(id);if(!j)return '';
 var dc=ukkDocOf(id)||ukkDocFromJob(j),doc=Object.assign({},dc);
 doc.status=show?'published':'draft';doc.active=!!show;delete doc.reset;delete doc.dihapus;
 return ukkStore(doc);
}
function ukkBulk(show){
 var ms=JOBS.filter(function(x){return x.kelas===S.kelas});if(!ms.length)return;
 uiConfirm((show?'Tampilkan':'Sembunyikan')+' semua '+ms.length+' unit UKK '+KELAS[S.kelas].judul+' untuk siswa?',{ok:show?'Tampilkan':'Sembunyikan'}).then(function(ok){
  if(!ok)return;var gagal='';
  ms.forEach(function(x){var e=ukkToggle(x.id,show);if(e&&!gagal)gagal=e});
  render();toast(gagal?gagal:(show?'Semua unit ditampilkan':'Semua unit disembunyikan'));ukkFlush();
 });
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a.indexOf('ukm-')!==0||!isStaff())return;
 e.stopPropagation();
 var j=v?ukkJobBy(v):null;
 if(a==='ukm-open'&&j){UKS.id=v;UKS.tab='hasil';UKS.f='penilaian';UKS.set=null;UKS.ed=null;UKS.prev=null;render();window.scrollTo(0,0)}
 else if(a==='ukm-list'){UKS.id=null;UKS.set=null;UKS.prev=null;render();window.scrollTo(0,0)}
 else if(a==='ukm-tab'){UKS.tab=v;UKS.set=null;render()}
 else if(a==='ukm-f'){UKS.f=v;render()}
 else if(a==='ukm-baru'){ukeNew(null,'new');render();window.scrollTo(0,0)}
 else if(a==='ukm-edit'&&j){ukeNew(ukkDocOf(j.id)||ukkDocFromJob(j),'edit');render();window.scrollTo(0,0)}
 else if(a==='ukm-dup'&&j){ukeNew(ukkDocOf(j.id)||ukkDocFromJob(j),'dup');render();window.scrollTo(0,0)}
 else if(a==='ukm-prev'&&j){UKS.prev=v;UKS.ed=null;render();window.scrollTo(0,0)}
 else if(a==='ukm-prev-close'){UKS.prev=null;render();window.scrollTo(0,0)}
 else if(a==='ukm-toggle'&&j){
  var show=!ukkTampil(j),err=ukkToggle(v,show);
  if(err){toast(err);return}
  if(UKS.set&&UKS.set.id===v)UKS.set.tampil=show;
  render();toast(show?'Unit ditampilkan':'Unit disembunyikan');ukkFlush();
 }
 else if(a==='ukm-showall')ukkBulk(true);
 else if(a==='ukm-hideall')ukkBulk(false);
 else if(a==='ukm-mode'&&UKS.set){UKS.set.mode=v==='ujian'?'ujian':'latihan';render()}
 else if(a==='ukm-xls'&&j){ukkXls(j)}
 else if(a==='ukm-kosongjadwal'&&UKS.set){UKS.set.buka='';UKS.set.tutup='';render()}
 else if(a==='ukm-batal-set'){UKS.set=null;UKS.tab='hasil';render()}
 else if(a==='ukm-simpan-set'&&UKS.set){
  var s=UKS.set;if(s.buka&&s.tutup&&ukkT(s.tutup)<=ukkT(s.buka)){toast('Waktu tutup harus setelah waktu buka');return}
  var main=ukkJobBy(s.id);if(!main)return;
  var target=s.semua?JOBS.filter(function(x){return x.kelas===main.kelas}):[main],n=0,gagal='';
  target.forEach(function(x){
   var dc=ukkDocOf(x.id)||ukkDocFromJob(x),doc=Object.assign({},dc);
   doc.mode=s.mode==='ujian'?'ujian':'latihan';doc.maxTry=s.maxTry;
   if(x.id===s.id){doc.status=s.tampil?'published':'draft';doc.active=!!s.tampil;if(s.buka)doc.buka=s.buka;else delete doc.buka;if(s.tutup)doc.tutup=s.tutup;else delete doc.tutup}
   delete doc.reset;delete doc.dihapus;
   var e=ukkStore(doc);if(e){if(!gagal)gagal=e}else n++;
  });
  if(gagal){toast(gagal);return}
  UKS.set=null;UKS.tab='hasil';render();toast(n>1?'Pengaturan diterapkan ke '+n+' unit':'Pengaturan tersimpan');ukkFlush();
 }
 else if(a==='ukm-reset'&&j){
  uiConfirm('Kembalikan '+j.judul+' ke isi bawaan aplikasi? Hasil edit akan hilang.',{ok:'Kembalikan'}).then(function(ok){
   if(!ok)return;var dc=ukkDocOf(j.id)||{id:j.id,title:j.judul,kelas:j.kelas,fase:(KELAS[j.kelas]||{}).fase||'F',duration:j.menit};
   var doc=Object.assign({},dc,{reset:true,status:'published',active:true});ukkSimpanDoc(doc);render();toast('Dikembalikan ke bawaan');ukkFlush();
  });
 }
 else if(a==='ukm-hapus'&&j&&!ukkIsBase(j.id)){
  uiConfirm('Hapus unit "'+j.judul+'"?\nNilai yang sudah tersimpan tidak dihapus dan tetap terbaca di rekap.',{ok:'Hapus',danger:true}).then(function(ok){
   if(!ok)return;var dc=ukkDocOf(j.id)||ukkDocFromJob(j),doc=Object.assign({},dc,{dihapus:true,status:'draft',active:false});delete doc.reset;
   ukkSimpanDoc(doc);UKS.id=null;UKS.set=null;render();toast('Unit dihapus');ukkFlush();
  });
 }
},true);
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset)return;
 if(t.dataset.ukmS!==undefined&&UKS.set){
  var n=t.dataset.ukmS;UKS.set[n]=t.type==='checkbox'?t.checked:(n==='maxTry'?parseInt(t.value,10)||0:t.value);
  /* ceklis Tampilkan langsung mengubah status unit, sama seperti tombol Tampilkan/Sembunyikan */
  if(n==='tampil'&&isStaff()){var er=ukkToggle(UKS.set.id,!!t.checked);if(er){toast(er);UKS.set.tampil=!t.checked}render();ukkFlush()}
  return;
 }
 var p=t.dataset.uke;if(!p||!UKS.ed)return;
 if(!(t.type==='checkbox'||t.tagName==='SELECT'))return;
 ukeSet(p,t.type==='checkbox'?t.checked:t.value);
 if(p==='kelas'){ukeRe();return}
 ukeLive();
});
document.addEventListener('input',function(e){
 var t=e.target,p=t.dataset&&t.dataset.uke;
 if(!p||!UKS.ed||t.type==='checkbox'||t.tagName==='SELECT')return;
 ukeSet(p,t.value);ukeLive();
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-uke-a]');if(!b)return;
 var d=UKS.ed;if(!d||!isStaff())return;
 var a=b.dataset.ukeA,i=b.dataset.i!==undefined?+b.dataset.i:-1,v=b.dataset.v,s=d.S;
 e.stopPropagation();
 if(a==='tab'){d.tab=v;d.paste=false;ukeRe();window.scrollTo(0,0)}
 else if(a==='prev'||a==='next'){var ix=UKE.TABS.map(function(t){return t[0]}).indexOf(d.tab)+(a==='next'?1:-1);if(UKE.TABS[ix]){d.tab=UKE.TABS[ix][0];d.paste=false;ukeRe();window.scrollTo(0,0)}}
 else if(a==='save')ukeSave(false);
 else if(a==='save-prev')ukeSave(true);
 else if(a==='cancel'){
  if(!ukeDirty(d)){ukeClose();return}
  uiConfirm('Tutup editor?\nPerubahan yang belum disimpan tidak masuk ke unit. Draf tetap tersimpan di perangkat ini dan bisa dipulihkan saat editor dibuka lagi.',{ok:'Tutup',danger:true}).then(function(ok){if(ok){UKS.ed=null;render();window.scrollTo(0,0)}});
 }
 else if(a==='status'){s.status=v;ukeRe()}
 else if(a==='add'){if(s.items.length>=UKK_MAXITEM){toast('Maksimal '+UKK_MAXITEM+' butir');return}s.items.push({t:'',std:'',k:false});d.focus='items.'+(s.items.length-1)+'.t';ukeRe()}
 else if(a==='del'){s.items.splice(i,1);if(!s.items.length)s.items.push({t:'',std:'',k:false});ukeRe()}
 else if(a==='up'){ukeMove(s.items,i,i-1);ukeRe()}
 else if(a==='down'){ukeMove(s.items,i,i+1);ukeRe()}
 else if(a==='paste-open'){d.paste=true;ukeRe();var ta=$('#uke-paste');if(ta)ta.focus()}
 else if(a==='paste-close'){d.paste=false;ukeRe()}
 else if(a==='paste-apply'){
  var ta2=$('#uke-paste'),items=ukeParsePaste(ta2?ta2.value:'');
  if(!items.length){toast('Tidak ada baris untuk ditambahkan');return}
  s.items=s.items.filter(function(x){return !ukeBlank(x)}).concat(items);d.paste=false;ukeRe();toast(items.length+' baris ditambahkan');
 }
 else if(a==='rec-use'){d.S=d.rec.S;d.rec=null;ukeRe();toast('Draf dipulihkan')}
 else if(a==='rec-drop'){d.rec=null;ukeDraftClear();ukeRe()}
},true);
