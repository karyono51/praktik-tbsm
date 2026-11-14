/* observasi.js: Form Observasi Kinerja Guru (supervisi pembelajaran). Untuk Admin dan Guru.
   Admin melihat semua observasi. Guru hanya melihat observasi yang ia isi sendiri. */
var OBS_DEF={
 guru:{judul:'Observasi guru',sub:'Supervisi pembelajaran di kelas dan bengkel praktik.',nama:'Nama guru',namaMan:'Nama guru (manual)',pdf:'Form Observasi Kinerja Guru',diamati:'Guru yang diamati',pengamat:'Pengamat',unit:'Guru',
  mapelLab:'Mata pelajaran / kompetensi keahlian',jenisLab:'Jenis pembelajaran',materiLab:'Materi / kompetensi dasar',jenis:['Praktik di bengkel','Teori di kelas','Teori dan praktik'],
  grup:[
  {g:'A. Perencanaan Pembelajaran',t:['Tujuan pembelajaran dirumuskan dengan jelas','Kesesuaian materi dengan kompetensi dasar','Kesiapan media, alat, dan bahan praktik']},
  {g:'B. Pembukaan',t:['Apersepsi dan motivasi siswa','Penyampaian tujuan dan alur kegiatan']},
  {g:'C. Kegiatan Inti',t:['Penguasaan materi dan kebenaran konsep','Penggunaan metode yang variatif dan sesuai','Demonstrasi keterampilan praktik yang benar dan aman','Keterlibatan siswa dalam kegiatan','Pengelolaan kelas dan bengkel praktik','Penerapan K3 dan prosedur keselamatan kerja','Pemberian bimbingan dan umpan balik kepada siswa','Penggunaan bahasa dan komunikasi yang efektif','Pemanfaatan waktu pembelajaran']},
  {g:'D. Penutup',t:['Penarikan kesimpulan dan refleksi bersama siswa','Evaluasi atau penilaian hasil belajar']}]},
 siswa:{judul:'Observasi praktik siswa',sub:'Pengamatan proses dan sikap kerja siswa saat praktik.',nama:'Nama siswa',namaMan:'Nama siswa (manual)',pdf:'Form Observasi Praktik Siswa',diamati:'Siswa yang diamati',pengamat:'Guru pengamat',unit:'Siswa',
  mapelLab:'Unit / pekerjaan praktik',jenisLab:'Tempat praktik',materiLab:'Kompetensi / jobsheet',jenis:['Bengkel sekolah','Teaching factory','Industri (PKL)'],
  grup:[
  {g:'A. Persiapan Kerja',t:['Memakai APD dan pakaian praktik lengkap dan benar','Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan','Membaca dan memahami instruksi kerja (jobsheet/SOP)']},
  {g:'B. Proses Kerja',t:['Mengikuti urutan langkah kerja sesuai SOP','Memilih dan menggunakan alat dengan benar','Ketepatan pemeriksaan dan pengukuran','Menerapkan K3 selama bekerja','Ketelitian dan kerapian kerja','Efisiensi penggunaan waktu']},
  {g:'C. Hasil Kerja',t:['Hasil kerja sesuai standar dan spesifikasi','Merapikan dan membersihkan area kerja serta mengembalikan alat','Mengisi lembar kerja atau laporan dengan lengkap']},
  {g:'D. Sikap Kerja',t:['Disiplin dan tanggung jawab','Kerja sama dalam tim','Kemandirian dan inisiatif','Komunikasi dan sikap saat bekerja']}]}
};
Object.keys(OBS_DEF).forEach(function(k){var d=OBS_DEF[k],n=0;d.flat=[];d.grup.forEach(function(g){g.items=g.t.map(function(t){n++;var it={id:'o'+n,no:n,t:t,g:g.g};d.flat.push(it);return it})})});
function obsDef(t){return OBS_DEF[t]||OBS_DEF.guru}
function obsTipe(r){return r&&r.tipe==='siswa'?'siswa':'guru'}
var OBS_SKALA={4:'Sangat baik',3:'Baik',2:'Cukup',1:'Kurang'};
var OB={mode:'list',d:null,view:null,q:'',sq:'',tipe:'guru'};
ICO['observasi-siswa']='<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M9.5 20.5l1.8 1.8 3.5-3.8"/>';
ICO.observasi='<path d="M9 4.5h6a1 1 0 0 1 1 1V6h2a1 1 0 0 1 1 1v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2v-.5a1 1 0 0 1 1-1z"/><path d="m9 13.5 2 2 4-4.5"/>';

function obsKat(r){return r>=3.5?'Sangat Baik':r>=2.5?'Baik':r>=1.5?'Cukup':'Kurang'}
function obsKatCls(k){return k==='Sangat Baik'||k==='Baik'?'ok':k==='Cukup'?'warn':'bad'}
function obsHitung(nl,t){
 var fl=obsDef(t).flat,N=fl.length,tot=0,done=0;
 fl.forEach(function(i){var v=nl&&nl[i.id];if(v>=1&&v<=4){tot+=v;done++}});
 var rata=done?tot/done:0;
 return {done:done,n:N,tot:tot,max:N*4,rata:Math.round(rata*100)/100,nilai:Math.round(tot/(N*4)*100),kat:obsKat(rata)};
}
function obsPay(r){try{var p=JSON.parse(r.payload||'{}');p.nilai=p.nilai||{};p.cat=p.cat||{};return p}catch(e){return {nilai:{},cat:{}}}}
function obsBoleh(r){return can('observasi-semua')||(!!S.user&&r.pengamatId===S.user.id)}
function obsVisible(t){
 var L=(S.observasi||[]).filter(function(r){return obsTipe(r)===t&&(can('observasi-semua')||r.pengamatId===S.user.id)});
 return L.sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))||b.ts-a.ts});
}
function obsTgl(s){var p=String(s||'').split('-');if(p.length!==3)return s||'-';return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
function obsBaru(t){return {id:'',tipe:t,guruSel:'',guruNama:'',mapel:'',kelas:Object.keys(KELAS)[0],tanggal:ymd(Date.now()),jam:'',materi:'',jenis:obsDef(t).jenis[0],nilai:{},cat:{},kekuatan:'',perbaikan:'',tindak:'',pilih:[],man:[],per:{},cur:'',sesi:'',lock:false}}
function obsDraftDari(r){
 var p=obsPay(r),sel=(r.guruId&&S.users.some(function(u){return u.id===r.guruId}))?r.guruId:'__lain';
 return {id:r.id,tipe:obsTipe(r),guruSel:sel,guruNama:sel==='__lain'?r.guru:'',mapel:r.mapel||'',kelas:r.kelas||Object.keys(KELAS)[0],tanggal:r.tanggal||ymd(Date.now()),jam:p.jam||'',materi:p.materi||'',jenis:p.jenis||obsDef(obsTipe(r)).jenis[0],nilai:p.nilai,cat:p.cat,kekuatan:p.kekuatan||'',perbaikan:p.perbaikan||'',tindak:p.tindak||''};
}
function obsOrang(t){var role=t==='siswa'?'siswa':'guru';return S.users.filter(function(u){return hasRole(u,role)&&u.aktif!==false&&schAkunOk(u)}).sort(function(a,b){return (t==='siswa'?String(a.kelas).localeCompare(String(b.kelas)):0)||String(a.nama).localeCompare(String(b.nama))})}

/* ---- Tampilan ---- */
function viewObservasi(){
 var t0=S.tab==='observasi-siswa'?'siswa':'guru';
 if(OB.tipe!==t0){OB.tipe=t0;OB.mode='list';OB.d=null;OB.view=null;OB.q=''}
 if(OB.mode==='form'&&OB.d)return obsFormView();
 if(OB.mode==='view'&&OB.view)return obsDetailView();
 return obsListView();
}
function obsListView(){
 var T=OB.tipe,D=obsDef(T),L=obsVisible(T),q=OB.q.toLowerCase(),admin=can('observasi-semua');
 var F=L.filter(function(r){return !q||(r.guru+' '+r.mapel+' '+r.kelas+' '+(r.pengamat||'')).toLowerCase().indexOf(q)>-1});
 var avg=L.length?Math.round(L.reduce(function(t,r){return t+(+r.skor||0)},0)/L.length):0;
 var gset={};L.forEach(function(r){gset[r.guru]=1});
 var cards=F.map(function(r){
  var kc=obsKatCls(r.kategori);
  return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(r.guru)+'</h3><span class="pill '+kc+'">'+esc(r.kategori)+'</span></div>'+
   '<div class="meta"><span>'+esc(r.mapel)+'</span><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
   '<div class="row sb"><span class="note">'+(admin?D.pengamat+': '+esc(r.pengamat||'-'):'Observasi saya')+'</span><span class="mono" style="font-weight:600">Nilai '+(+r.skor||0)+'</span></div>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="ob-view" data-v="'+esc(r.id)+'">Lihat</button><button type="button" class="btn small" data-act="ob-pdf" data-v="'+esc(r.id)+'">PDF</button>'+
   (obsBoleh(r)?'<button type="button" class="btn small" data-act="ob-edit" data-v="'+esc(r.id)+'">Ubah</button><button type="button" class="btn small danger" data-act="ob-del" data-v="'+esc(r.id)+'">Hapus</button>':'')+'</div></article>';
 }).join('');
 return '<div class="row sb"><div><h2>'+D.judul+'</h2><p class="note">'+D.sub+'</p></div></div>'+
  '<div class="stats"><div class="card"><span class="label">Observasi</span><b class="mono">'+L.length+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div><div class="card"><span class="label">'+D.unit+'</span><b class="mono">'+Object.keys(gset).length+'</b></div></div>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="ob-new">+ Observasi baru</button>'+(L.length?'<button type="button" class="btn small" data-act="ob-xls">Unduh Excel</button>':'')+'</div>'+
  (L.length>3?'<label class="f">Cari<input id="obq" type="search" value="'+esc(OB.q)+'" placeholder="Nama, mata pelajaran/unit, kelas"></label>':'')+
  '<div class="jobs">'+(cards||'<div class="card"><p class="muted">'+(L.length?'Tidak ada observasi yang cocok.':'Belum ada observasi. Ketuk <b>+ Observasi baru</b> untuk mulai.')+'</p></div>')+'</div>'+
  '<p class="note">'+(admin?'Admin melihat semua observasi.':'Anda hanya melihat observasi yang Anda isi sendiri.')+' '+(Cloud.on?'Data tersinkron ke Appwrite.':'Data tersimpan di peramban ini.')+'</p>';
}
function obsFormView(){
 if(OB.d.tipe==='siswa')return obsFormSiswa();
 var d=OB.d,D=obsDef(d.tipe),h=obsHitung(d.nilai,d.tipe);
 var gopt='<option value="">Pilih '+(d.tipe==='siswa'?'siswa':'guru')+'</option>'+obsOrang(d.tipe).map(function(u){return '<option value="'+esc(u.id)+'"'+(d.guruSel===u.id?' selected':'')+'>'+esc(u.nama)+(d.tipe==='siswa'?' ('+esc(u.kelas||'-')+')':'')+'</option>'}).join('')+'<option value="__lain"'+(d.guruSel==='__lain'?' selected':'')+'>Lainnya (ketik nama)</option>';
 var kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(d.kelas===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var jopt=D.jenis.map(function(j){return '<option'+(d.jenis===j?' selected':'')+'>'+j+'</option>'}).join('');
 var items=D.grup.map(function(g){
  return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){
   var v=d.nilai[it.id]||'';
   return '<div class="item" data-s="'+v+'"><div class="t"><b>'+it.no+'. '+esc(it.t)+'</b></div><div class="seg rate" role="group" aria-label="Skor butir '+it.no+'">'+
    [1,2,3,4].map(function(s){return '<button type="button" data-act="ob-rate" data-id="'+it.id+'" data-v="'+s+'" aria-pressed="'+(+v===s)+'" title="'+OBS_SKALA[s]+'">'+s+'</button>'}).join('')+'</div>'+
    '<input class="obs-cat" data-id="'+it.id+'" maxlength="300" placeholder="Catatan (opsional)" value="'+esc(d.cat[it.id]||'')+'"></div>';
  }).join('');
 }).join('');
 return '<div class="row sb"><h2>'+(d.id?'Ubah: ':'Baru: ')+D.judul+'</h2><button type="button" class="btn small" data-act="ob-cancel">Batal</button></div>'+
  '<form class="card" data-form="obs-noop" onsubmit="return false">'+
  '<label class="f">'+D.nama+'<select data-ob="guruSel">'+gopt+'</select></label>'+
  (d.guruSel==='__lain'?'<label class="f">'+D.namaMan+'<input data-ob="guruNama" maxlength="120" value="'+esc(d.guruNama)+'"></label>':'')+
  '<label class="f">'+D.mapelLab+'<input data-ob="mapel" maxlength="120" value="'+esc(d.mapel)+'"></label>'+
  '<div class="two"><label class="f">Kelas<select data-ob="kelas">'+kopt+'</select></label><label class="f">Tanggal<input type="date" data-ob="tanggal" value="'+esc(d.tanggal)+'"></label></div>'+
  '<div class="two"><label class="f">'+D.jenisLab+'<select data-ob="jenis">'+jopt+'</select></label><label class="f">Jam ke-<input data-ob="jam" maxlength="20" value="'+esc(d.jam)+'"></label></div>'+
  '<label class="f">'+D.materiLab+'<input data-ob="materi" maxlength="200" value="'+esc(d.materi)+'"></label></form>'+
  '<p class="note">Skor: 4 Sangat baik, 3 Baik, 2 Cukup, 1 Kurang.</p>'+items+
  '<div class="card"><div class="row sb"><span class="note">Terisi</span><b class="mono"><span id="obprog">'+h.done+'</span> / '+h.n+'</b></div><div class="row sb"><span class="note">Nilai · kategori</span><b class="mono" id="obnilai">'+(h.done?h.nilai+' · '+h.kat:'-')+'</b></div></div>'+
  '<div class="card"><label class="f">Kekuatan yang teramati<textarea data-ob="kekuatan" maxlength="800">'+esc(d.kekuatan)+'</textarea></label>'+
  '<label class="f">Hal yang perlu ditingkatkan<textarea data-ob="perbaikan" maxlength="800">'+esc(d.perbaikan)+'</textarea></label>'+
  '<label class="f">Rekomendasi tindak lanjut<textarea data-ob="tindak" maxlength="800">'+esc(d.tindak)+'</textarea></label></div>'+
  '<div class="row"><button type="button" class="btn" data-act="ob-cancel">Batal</button><button type="button" class="btn primary grow" data-act="ob-save">Simpan observasi</button></div>';
}
function obsDetailView(){
 var r=OB.view,T=obsTipe(r),D=obsDef(T),p=obsPay(r),h=obsHitung(p.nilai,T);
 var rows=D.grup.map(function(g){
  return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){var v=p.nilai[it.id];
   return '<div class="card" style="gap:4px"><div class="row sb"><span>'+it.no+'. '+esc(it.t)+'</span><span class="pill plain mono">'+(v||'-')+'</span></div>'+(p.cat[it.id]?'<div class="note">'+esc(p.cat[it.id])+'</div>':'')+'</div>'}).join('');
 }).join('');
 var tx=function(j,t){return t?'<div class="card"><b>'+j+'</b><p>'+esc(t).replace(/\n/g,'<br>')+'</p></div>':''};
 return '<div class="row sb"><h2>Detail observasi</h2><button type="button" class="btn small" data-act="ob-back">Kembali</button></div>'+
  '<div class="card"><h3>'+esc(r.guru)+'</h3><div class="meta"><span>'+esc(r.mapel)+'</span><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
  '<div class="note">'+esc(p.jenis||'')+(p.jam?' · Jam ke-'+esc(p.jam):'')+(p.materi?' · '+esc(p.materi):'')+'</div><div class="note">'+D.pengamat+': '+esc(r.pengamat||'-')+'</div>'+
  '<div class="row sb"><span class="pill '+obsKatCls(r.kategori)+'">'+esc(r.kategori)+'</span><b class="mono">Nilai '+(+r.skor||0)+' · skor '+h.tot+'/'+h.max+'</b></div></div>'+rows+
  tx('Kekuatan yang teramati',p.kekuatan)+tx('Hal yang perlu ditingkatkan',p.perbaikan)+tx('Rekomendasi tindak lanjut',p.tindak)+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary" data-act="ob-pdf" data-v="'+esc(r.id)+'">Unduh PDF</button>'+(obsBoleh(r)?'<button type="button" class="btn" data-act="ob-edit" data-v="'+esc(r.id)+'">Ubah</button>':'')+'</div>';
}
function obsSync(){
 if(!OB.d)return;var h=obsHitung(OB.d.nilai,OB.d.tipe),a=$('#obprog'),b=$('#obnilai');
 if(a)a.textContent=h.done;if(b)b.textContent=h.done?h.nilai+' · '+h.kat:'-';
 var c=document.querySelector('.obs-chip[aria-pressed="true"] .cn');if(c){c.textContent=h.done+'/'+h.n;c.parentNode.dataset.full=h.done>=h.n?'1':'0'}
}

/* ---- Observasi praktik: banyak siswa sekaligus ---- */
(function(){var st=document.createElement('style');st.textContent=
'.obs-list{max-height:42vh;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:4px;display:grid;gap:2px}'+
'.obs-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;min-height:44px}'+
'.obs-row:active{background:var(--accent-soft)}.obs-row input{width:20px;height:20px;flex:none;accent-color:var(--accent)}'+
'.obs-row span{flex:1;min-width:0;overflow-wrap:anywhere}.obs-row small{color:var(--muted);flex:none}'+
'.obs-chips{display:flex;gap:6px;overflow-x:auto;padding:6px 0;position:sticky;top:0;z-index:5;background:var(--bg)}'+
'.obs-chip{flex:none;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:8px 12px;font-weight:650;font-size:13px;display:flex;gap:6px;align-items:center}'+
'.obs-chip small{font-weight:600;color:var(--muted)}'+
'.obs-chip[data-full="1"] small{color:var(--ok)}.obs-chip[data-full="1"]{border-color:var(--ok)}'+
'.obs-chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--onc)}.obs-chip[aria-pressed="true"] small{color:var(--onc)}';
document.head.appendChild(st)})();

function obsRoster(d){
 var m={};S.users.forEach(function(u){if(hasRole(u,'siswa')&&schAkunOk(u))m[u.id]={key:u.id,id:u.id,nama:u.nama,kelas:u.kelas||'',ak:u.aktif!==false}});
 (d.man||[]).forEach(function(x){m[x.key]={key:x.key,id:'',nama:x.nama,kelas:x.kelas||d.kelas,ak:true,man:true}});
 return m;
}
function obsAnyDone(d){
 if(d.tipe!=='siswa')return obsHitung(d.nilai,d.tipe).done>0;
 obsFlush(d);return Object.keys(d.per||{}).some(function(k){return obsHitung(d.per[k].nilai,'siswa').done>0});
}
function obsFlush(d){if(d.cur&&d.pilih.indexOf(d.cur)>-1)d.per[d.cur]={nilai:d.nilai,cat:d.cat,kekuatan:d.kekuatan,perbaikan:d.perbaikan,tindak:d.tindak}}
function obsLoad(d,k){var p=d.per[k]||(d.per[k]={nilai:{},cat:{},kekuatan:'',perbaikan:'',tindak:''});d.cur=k;d.nilai=p.nilai;d.cat=p.cat;d.kekuatan=p.kekuatan||'';d.perbaikan=p.perbaikan||'';d.tindak=p.tindak||''}
function obsEnsure(d){
 if(!d.pilih.length){d.cur='';d.nilai={};d.cat={};d.kekuatan='';d.perbaikan='';d.tindak='';return}
 if(!d.cur||d.pilih.indexOf(d.cur)<0)obsLoad(d,d.pilih[0]);
}
function obsDoneOf(d,k){return obsHitung(k===d.cur?d.nilai:(d.per[k]||{}).nilai,'siswa').done}
function obsVisibleRows(d){
 var R=obsRoster(d),q=String(OB.sq||'').toLowerCase();
 return Object.keys(R).map(function(k){return R[k]}).filter(function(x){
  if(d.pilih.indexOf(x.key)>-1)return true;
  if(!x.ak)return false;
  if(q&&x.nama.toLowerCase().indexOf(q)<0)return false;
  return x.man||!d.kelas||x.kelas===d.kelas;
 }).sort(function(a,b){return (b.man?1:0)-(a.man?1:0)||String(a.nama).localeCompare(String(b.nama))});
}
function obsListHtml(){
 var d=OB.d,rows=obsVisibleRows(d);
 if(!rows.length)return '<p class="note" style="padding:8px">Tidak ada siswa untuk kelas ini. Ketik nama di kolom bawah untuk menambah manual.</p>';
 return rows.map(function(x){return '<label class="obs-row"><input type="checkbox" data-obpick="'+esc(x.key)+'"'+(d.pilih.indexOf(x.key)>-1?' checked':'')+'><span>'+esc(x.nama)+(x.man?' (manual)':'')+'</span><small>'+esc(x.kelas||'-')+'</small></label>'}).join('');
}
function obsListRefresh(){var el=$('#oblist');if(el)el.innerHTML=obsListHtml();var c=$('#obcount');if(c)c.textContent=OB.d.pilih.length+' dipilih'}
function obsStuRefresh(scroll){
 var el=$('#obstu');if(el)el.innerHTML=obsStuHtml(OB.d);obsListRefresh();
 if(scroll&&el&&el.scrollIntoView)el.scrollIntoView({block:'start'});
}
function obsPickChange(t){
 var d=OB.d,k=t.dataset.obpick,on=t.checked,i=d.pilih.indexOf(k);
 if(!on&&i>-1){
  var dn=obsDoneOf(d,k);
  if(dn&&!uiOk('obpick:'+k,'Hapus skor siswa ini?\n'+dn+' butir sudah diisi.',t,{ok:'Hapus',danger:true})){t.checked=true;return}
 }
 obsFlush(d);
 if(on&&i<0)d.pilih.push(k);
 if(!on&&i>-1){d.pilih.splice(i,1);delete d.per[k];d.man=d.man.filter(function(x){return x.key!==k});if(d.cur===k)d.cur=''}
 obsEnsure(d);obsStuRefresh();
}
function obsItemsHtml(d){
 return obsDef('siswa').grup.map(function(g){
  return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){
   var v=d.nilai[it.id]||'';
   return '<div class="item" data-s="'+v+'"><div class="t"><b>'+it.no+'. '+esc(it.t)+'</b></div><div class="seg rate" role="group" aria-label="Skor butir '+it.no+'">'+
    [1,2,3,4].map(function(s){return '<button type="button" data-act="ob-rate" data-id="'+it.id+'" data-v="'+s+'" aria-pressed="'+(+v===s)+'" title="'+OBS_SKALA[s]+'">'+s+'</button>'}).join('')+'</div>'+
    '<input class="obs-cat" data-id="'+it.id+'" maxlength="300" placeholder="Catatan (opsional)" value="'+esc(d.cat[it.id]||'')+'"></div>';
  }).join('');
 }).join('');
}
function obsStuHtml(d){
 if(!d.pilih.length)return '<div class="card"><p class="muted">Pilih minimal satu siswa untuk mulai menilai.</p></div>';
 obsEnsure(d);
 var R=obsRoster(d),N=obsDef('siswa').flat.length,h=obsHitung(d.nilai,'siswa'),idx=d.pilih.indexOf(d.cur),cs=R[d.cur]||{nama:'-',kelas:''};
 var chips=d.pilih.map(function(k){var s=R[k]||{nama:'?'},dn=obsDoneOf(d,k);
  return '<button type="button" class="obs-chip" data-act="ob-pick" data-v="'+esc(k)+'" data-full="'+(dn>=N?1:0)+'" aria-pressed="'+(k===d.cur)+'">'+esc(String(s.nama).split(/\s+/).slice(0,2).join(' '))+' <small class="cn">'+dn+'/'+N+'</small></button>'}).join('');
 var multi=d.pilih.length>1;
 return '<div class="obs-chips" role="group" aria-label="Pilih siswa yang dinilai">'+chips+'</div>'+
  '<div class="card"><div class="row sb"><b>Menilai: '+esc(cs.nama)+'</b><span class="pill plain mono">'+esc(cs.kelas||'-')+'</span></div>'+
  '<p class="note">Siswa '+(idx+1)+' dari '+d.pilih.length+'. Skor: 4 Sangat baik, 3 Baik, 2 Cukup, 1 Kurang.</p>'+
  (multi?'<button type="button" class="btn small" data-act="ob-copy">Salin skor ini ke siswa lain yang belum diisi</button>':'')+'</div>'+
  obsItemsHtml(d)+
  '<div class="card"><div class="row sb"><span class="note">Terisi</span><b class="mono"><span id="obprog">'+h.done+'</span> / '+h.n+'</b></div><div class="row sb"><span class="note">Nilai · kategori</span><b class="mono" id="obnilai">'+(h.done?h.nilai+' · '+h.kat:'-')+'</b></div></div>'+
  '<div class="card"><label class="f">Kekuatan yang teramati<textarea data-ob="kekuatan" maxlength="800">'+esc(d.kekuatan)+'</textarea></label>'+
  '<label class="f">Hal yang perlu ditingkatkan<textarea data-ob="perbaikan" maxlength="800">'+esc(d.perbaikan)+'</textarea></label>'+
  '<label class="f">Rekomendasi tindak lanjut<textarea data-ob="tindak" maxlength="800">'+esc(d.tindak)+'</textarea></label></div>'+
  (multi&&idx<d.pilih.length-1?'<button type="button" class="btn primary" data-act="ob-next">Siswa berikutnya</button>':'');
}
function obsFormSiswa(){
 var d=OB.d,D=obsDef('siswa');obsEnsure(d);
 var kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(d.kelas===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var jopt=D.jenis.map(function(j){return '<option'+(d.jenis===j?' selected':'')+'>'+j+'</option>'}).join('');
 var R=obsRoster(d);
 var picker=d.lock?
  '<div class="card"><span class="label">'+D.diamati+'</span><b>'+esc((R[d.pilih[0]]||{}).nama||'-')+'</b></div>':
  '<div class="card"><div class="row sb"><b>'+D.diamati+'</b><span class="pill plain mono" id="obcount">'+d.pilih.length+' dipilih</span></div>'+
  '<p class="note">Centang beberapa siswa untuk dinilai dalam satu sesi praktik. Setiap siswa tersimpan sebagai satu observasi sendiri.</p>'+
  '<label class="f">Cari siswa<input id="obsq" type="search" maxlength="60" placeholder="Ketik nama" value="'+esc(OB.sq)+'"></label>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small" data-act="ob-all">Pilih semua yang tampil</button><button type="button" class="btn small" data-act="ob-none">Kosongkan pilihan</button></div>'+
  '<div id="oblist" class="obs-list">'+obsListHtml()+'</div>'+
  '<div class="row" style="gap:6px"><input id="obman" class="grow" maxlength="120" placeholder="Siswa lain (ketik nama)" aria-label="Nama siswa lain"><button type="button" class="btn small" data-act="ob-addman">Tambah</button></div></div>';
 return '<div class="row sb"><h2>'+(d.id?'Ubah: ':'Baru: ')+D.judul+'</h2><button type="button" class="btn small" data-act="ob-cancel">Batal</button></div>'+
  '<form class="card" data-form="obs-noop" onsubmit="return false">'+
  '<label class="f">'+D.mapelLab+'<input data-ob="mapel" maxlength="120" value="'+esc(d.mapel)+'"></label>'+
  '<div class="two"><label class="f">Kelas'+(d.lock?'':' (daftar siswa)')+'<select data-ob="kelas">'+kopt+'</select></label><label class="f">Tanggal<input type="date" data-ob="tanggal" value="'+esc(d.tanggal)+'"></label></div>'+
  '<div class="two"><label class="f">'+D.jenisLab+'<select data-ob="jenis">'+jopt+'</select></label><label class="f">Jam ke-<input data-ob="jam" maxlength="20" value="'+esc(d.jam)+'"></label></div>'+
  '<label class="f">'+D.materiLab+'<input data-ob="materi" maxlength="200" value="'+esc(d.materi)+'"></label></form>'+
  picker+'<div id="obstu">'+obsStuHtml(d)+'</div>'+
  '<div class="row"><button type="button" class="btn" data-act="ob-cancel">Batal</button><button type="button" class="btn primary grow" data-act="ob-save">Simpan observasi</button></div>';
}
function obsSaveSiswa(){
 var d=OB.d,D=obsDef('siswa'),N=D.flat.length;obsFlush(d);
 if(!d.pilih.length){toast('Pilih minimal satu siswa');return}
 if(!String(d.mapel||'').trim()){toast('Isi '+D.mapelLab.toLowerCase());return}
 if(!d.tanggal){toast('Isi tanggal observasi');return}
 var R=obsRoster(d);
 for(var i=0;i<d.pilih.length;i++){
  var k=d.pilih[i],pp=d.per[k]||{nilai:{}},hh=obsHitung(pp.nilai,'siswa');
  if(hh.done<N){obsLoad(d,k);obsStuRefresh(true);toast('Lengkapi skor '+((R[k]||{}).nama||'siswa')+' ('+hh.done+' dari '+N+')');return}
 }
 var sesi=d.sesi||uid(),n=0,jml=d.pilih.length;
 S.observasi=S.observasi||[];
 d.pilih.forEach(function(k){
  var s=R[k],p=d.per[k],h=obsHitung(p.nilai,'siswa');
  var payload=JSON.stringify({jenis:d.jenis,jam:String(d.jam||'').trim(),materi:String(d.materi||'').trim(),nilai:p.nilai,cat:p.cat,kekuatan:String(p.kekuatan||'').trim(),perbaikan:String(p.perbaikan||'').trim(),tindak:String(p.tindak||'').trim(),sesi:sesi,jumlah:jml});
  var f={tipe:'siswa',guruId:s.id||'',guru:String(s.nama).slice(0,120),mapel:String(d.mapel).trim().slice(0,120),kelas:(s.kelas&&KELAS[s.kelas])?s.kelas:d.kelas,tanggal:d.tanggal,skor:h.nilai,kategori:h.kat,payload:payload};
  var rec=(d.id&&jml===1)?S.observasi.find(function(x){return x.id===d.id}):null;
  if(rec){Object.assign(rec,f);if(rec.r)rec.d=1}
  else S.observasi.push(Object.assign({id:uid(),ts:Date.now()+n,pengamat:S.user.nama,pengamatId:S.user.id},f));
  n++;
 });
 persist();OB.mode='list';OB.d=null;render();window.scrollTo(0,0);toast(n>1?n+' observasi tersimpan':'Observasi tersimpan');
}
var _obsDraft0=obsDraftDari;
obsDraftDari=function(r){
 var d=_obsDraft0(r);
 if(d.tipe==='siswa'){
  var u=r.guruId&&S.users.find(function(x){return x.id===r.guruId}),key=u?u.id:'m0';
  d.man=u?[]:[{key:'m0',nama:r.guru,kelas:r.kelas}];d.pilih=[key];d.lock=true;d.sesi=obsPay(r).sesi||'';
  d.per={};d.per[key]={nilai:d.nilai,cat:d.cat,kekuatan:d.kekuatan,perbaikan:d.perbaikan,tindak:d.tindak};d.cur=key;
 }
 return d;
};

/* ---- Simpan, hapus ---- */
function obsSave(){
 if(OB.d.tipe==='siswa')return obsSaveSiswa();
 var d=OB.d,D=obsDef(d.tipe),h=obsHitung(d.nilai,d.tipe),guru='',gid='';
 if(d.guruSel==='__lain'){guru=String(d.guruNama||'').trim()}
 else if(d.guruSel){var u=S.users.find(function(x){return x.id===d.guruSel});if(u){guru=u.nama;gid=u.id}}
 if(!guru){toast('Pilih atau isi '+D.nama.toLowerCase());return}
 if(!String(d.mapel||'').trim()){toast('Isi '+D.mapelLab.toLowerCase());return}
 if(!d.tanggal){toast('Isi tanggal observasi');return}
 if(h.done<h.n){toast('Lengkapi skor semua butir ('+h.done+' dari '+h.n+')');return}
 var payload=JSON.stringify({jenis:d.jenis,jam:String(d.jam||'').trim(),materi:String(d.materi||'').trim(),nilai:d.nilai,cat:d.cat,kekuatan:String(d.kekuatan||'').trim(),perbaikan:String(d.perbaikan||'').trim(),tindak:String(d.tindak||'').trim()});
 var f={tipe:d.tipe,guruId:gid,guru:guru.slice(0,120),mapel:String(d.mapel).trim().slice(0,120),kelas:d.kelas,tanggal:d.tanggal,skor:h.nilai,kategori:h.kat,payload:payload};
 S.observasi=S.observasi||[];
 var rec=d.id?S.observasi.find(function(x){return x.id===d.id}):null;
 if(rec){Object.assign(rec,f);if(rec.r)rec.d=1}
 else S.observasi.push(Object.assign({id:uid(),ts:Date.now(),pengamat:S.user.nama,pengamatId:S.user.id},f));
 persist();OB.mode='list';OB.d=null;render();window.scrollTo(0,0);toast('Observasi tersimpan');
}
async function obsDelete(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||!obsBoleh(r))return;
 if(!(await uiConfirm('Hapus observasi '+r.guru+' ('+obsTgl(r.tanggal)+')?\nTindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
 if(Cloud.on&&r.r){if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}if(!(await Cloud.remove('observasi',id)))return}
 S.observasi=S.observasi.filter(function(x){return x.id!==id});persist();OB.mode='list';OB.view=null;render();toast('Observasi dihapus');
}

/* ---- Ekspor ---- */
function obsPdf(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||!needP())return;
 var T=obsTipe(r),D=obsDef(T),p=obsPay(r),h=obsHitung(p.nilai,T),doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 kop(doc,D.pdf);
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:50,fontStyle:'bold'}},body:[[D.nama,r.guru],[D.mapelLab,r.mapel],['Kelas',r.kelas],[D.jenisLab,p.jenis||'-'],['Tanggal observasi',obsTgl(r.tanggal)],['Jam ke-',p.jam||'-'],[D.materiLab,p.materi||'-'],[D.pengamat,r.pengamat||'-']]});
 var body=[];
 D.grup.forEach(function(g){body.push([{content:g.g,colSpan:4,styles:{fontStyle:'bold',fillColor:[232,240,235]}}]);g.items.forEach(function(it){body.push([it.no,it.t,String(p.nilai[it.id]||'-'),p.cat[it.id]||''])})});
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['No','Aspek yang diamati','Skor','Catatan']],body:body,columnStyles:{0:{cellWidth:10,halign:'center'},2:{cellWidth:14,halign:'center'}}});
 var y=doc.lastAutoTable.finalY+7,H=doc.internal.pageSize.getHeight();
 if(y>H-40){doc.addPage();y=22}
 doc.setFontSize(9).setTextColor(90).text('Skor: 4 Sangat baik, 3 Baik, 2 Cukup, 1 Kurang.',14,y);y+=6;
 doc.setFontSize(10.5).setTextColor(0).setFont('helvetica','bold').text('Total skor '+h.tot+' dari '+h.max+'   Rata-rata '+h.rata+'   Nilai '+r.skor+'   Kategori: '+r.kategori,14,y);doc.setFont('helvetica','normal');y+=8;
 [['Kekuatan yang teramati',p.kekuatan],['Hal yang perlu ditingkatkan',p.perbaikan],['Rekomendasi tindak lanjut',p.tindak]].forEach(function(t){
  var lines=doc.splitTextToSize(t[1]||'-',180);
  if(y+6+lines.length*4.6>H-20){doc.addPage();y=22}
  doc.setFontSize(10).setFont('helvetica','bold').text(t[0],14,y);doc.setFont('helvetica','normal').text(lines,14,y+5);y+=9+lines.length*4.6;
 });
 ttd(doc,y+4,[[D.pengamat,r.pengamat||''],[D.diamati,r.guru]]);
 foot(doc);doc.save((T==='siswa'?'Observasi_praktik_':'Observasi_')+slug(r.guru||'nama')+'_'+r.tanggal+'.pdf');
}
function obsXls(){
 if(!needX())return;var T=OB.tipe,D=obsDef(T),L=obsVisible(T).slice().sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts});
 var head=['No','Tanggal',D.unit,D.mapelLab,'Kelas',D.jenisLab,D.pengamat].concat(D.flat.map(function(i){return i.no+'. '+i.t})).concat(['Total skor','Rata-rata','Nilai','Kategori','Kekuatan','Perlu ditingkatkan','Tindak lanjut']);
 var aoa=[head].concat(L.map(function(r,i){var p=obsPay(r),h=obsHitung(p.nilai,T);
  return [i+1,r.tanggal,r.guru,r.mapel,r.kelas,p.jenis||'',r.pengamat||''].concat(D.flat.map(function(it){return p.nilai[it.id]||''})).concat([h.tot,h.rata,r.skor,r.kategori,p.kekuatan||'',p.perbaikan||'',p.tindak||''])}));
 book([[T==='siswa'?'Rekap Praktik Siswa':'Rekap Observasi Guru',aoa,head.map(function(x,i){return i===2||i===3?24:i>6&&i<7+D.flat.length?10:i>=7+D.flat.length+4?36:14})]],T==='siswa'?'Rekap_Observasi_Praktik_Siswa':'Rekap_Observasi_Guru');
}

/* ---- Aksi ---- */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;if(a.indexOf('ob-')!==0)return;
 if(!can('observasi'))return;
 if(a==='ob-new'){OB.sq='';OB.d=obsBaru(OB.tipe);OB.mode='form';render();window.scrollTo(0,0)}
 else if(a==='ob-edit'){var r=(S.observasi||[]).find(function(x){return x.id===v});if(!r||!obsBoleh(r))return;OB.sq='';OB.d=obsDraftDari(r);OB.mode='form';render();window.scrollTo(0,0)}
 else if(a==='ob-view'){var r2=(S.observasi||[]).find(function(x){return x.id===v});if(!r2)return;OB.view=r2;OB.mode='view';render();window.scrollTo(0,0)}
 else if(a==='ob-back'){OB.mode='list';OB.view=null;render();window.scrollTo(0,0)}
 else if(a==='ob-cancel'){if(OB.d&&obsAnyDone(OB.d)&&!uiOk('obcancel','Batalkan observasi?\nIsian yang belum disimpan akan hilang.',b,{ok:'Batalkan',cancel:'Kembali',danger:true}))return;OB.mode='list';OB.d=null;render();window.scrollTo(0,0)}
 else if(a==='ob-rate'){var s=parseInt(v,10),card=b.closest('.item');OB.d.nilai[b.dataset.id]=s;card.dataset.s=s;$$('button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===s))});obsSync()}
 else if(a==='ob-pick'&&OB.d){obsFlush(OB.d);obsLoad(OB.d,v);obsStuRefresh(true)}
 else if(a==='ob-next'&&OB.d){obsFlush(OB.d);var ix=OB.d.pilih.indexOf(OB.d.cur);if(ix>-1&&ix<OB.d.pilih.length-1){obsLoad(OB.d,OB.d.pilih[ix+1]);obsStuRefresh(true)}}
 else if(a==='ob-all'&&OB.d){obsFlush(OB.d);obsVisibleRows(OB.d).forEach(function(x){if(OB.d.pilih.indexOf(x.key)<0)OB.d.pilih.push(x.key)});obsEnsure(OB.d);obsStuRefresh()}
 else if(a==='ob-none'&&OB.d){if(obsAnyDone(OB.d)&&!uiOk('obnone','Kosongkan pilihan?\nSkor yang sudah diisi akan hilang.',b,{ok:'Kosongkan',danger:true}))return;OB.d.pilih=[];OB.d.man=[];OB.d.per={};OB.d.cur='';obsEnsure(OB.d);obsStuRefresh()}
 else if(a==='ob-addman'&&OB.d){var inp=$('#obman'),nm=inp?inp.value.trim():'';if(!nm){toast('Ketik nama siswa');return}obsFlush(OB.d);var mk='m'+Date.now().toString(36)+Math.floor(Math.random()*1e3);OB.d.man.push({key:mk,nama:nm.slice(0,120),kelas:OB.d.kelas});OB.d.pilih.push(mk);obsEnsure(OB.d);inp.value='';obsStuRefresh()}
 else if(a==='ob-copy'&&OB.d){obsFlush(OB.d);var src=OB.d.nilai,cnt=0;OB.d.pilih.forEach(function(k){if(k===OB.d.cur)return;var pp=OB.d.per[k]||(OB.d.per[k]={nilai:{},cat:{},kekuatan:'',perbaikan:'',tindak:''});if(!obsHitung(pp.nilai,'siswa').done){pp.nilai=Object.assign({},src);cnt++}});obsStuRefresh();toast(cnt?'Skor disalin ke '+cnt+' siswa. Periksa dan ubah per siswa.':'Semua siswa lain sudah punya skor')}
 else if(a==='ob-save')obsSave();
 else if(a==='ob-del')obsDelete(v);
 else if(a==='ob-pdf')obsPdf(v);
 else if(a==='ob-xls')obsXls();
});
document.addEventListener('input',function(e){
 var t=e.target;if(!OB.d||OB.mode!=='form')return;
 if(t.dataset&&t.dataset.ob&&t.tagName!=='SELECT')OB.d[t.dataset.ob]=t.value;
 else if(t.classList&&t.classList.contains('obs-cat'))OB.d.cat[t.dataset.id]=t.value;
});
document.addEventListener('change',function(e){
 var t=e.target;
 if(t.id==='obq'){OB.q=t.value;render();return}
 if(OB.d&&OB.mode==='form'&&t.dataset&&t.dataset.obpick!=null){obsPickChange(t);return}
 if(!OB.d||OB.mode!=='form'||!t.dataset||!t.dataset.ob)return;
 OB.d[t.dataset.ob]=t.value;
 if(t.dataset.ob==='kelas'&&OB.d.tipe==='siswa'){obsListRefresh();return}
 if(t.dataset.ob==='guruSel'){if(OB.d.tipe==='siswa'){var u=S.users.find(function(x){return x.id===t.value});if(u&&u.kelas&&KELAS[u.kelas])OB.d.kelas=u.kelas}render()}
});

document.addEventListener('input',function(e){var t=e.target;if(t.id==='obsq'&&OB.d&&OB.mode==='form'){OB.sq=t.value;obsListRefresh()}});
