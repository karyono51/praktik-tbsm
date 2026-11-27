/* ukk-observasi.js: tata kelola observasi per unit UKK. Dimuat sebelum ukk-kelola.js.
   Dokumen unit menyimpan obs:{mode,lembar}:
     paket    = unit + observasi satu paket: dibuka dari unit, satu nilai gabungan di detail dan PDF observasi.
     pasangan = dinilai dan dicetak terpisah, digabung berbobot di Nilai Akhir UKK.
     tanpa    = unit tanpa observasi (tidak masuk Nilai Akhir).
   Identitas lembar observasi (sekolah, konsentrasi, kode, tahun, bentuk, paket, tempat, waktu, kendaraan) mengikuti unit yang terhubung. */
var UO_BAWAAN={'UKK-1':'vario','UKK-2':'cvt','UKK-3':'rem','UKK-4':'bodi','UKK-X-1':'tegangan','UKK-XI-1':'cvt11'};
var UO_MODE={paket:'Satu paket',pasangan:'Berpasangan',tanpa:'Tanpa observasi'};
function uoNorm(o,id,kelas){
 if(!o||!UO_MODE[o.mode]){var l=UO_BAWAAN[id]||'';return {mode:l?'pasangan':'tanpa',lembar:l}}
 var L=OBU.lb[o.lembar];
 if(o.mode==='tanpa')return {mode:'tanpa',lembar:''};
 return {mode:o.mode,lembar:L&&L.tk===kelas?o.lembar:''};
}
function uoSekolahUnit(v){v=String(v||'').toUpperCase();return v==='ALL'?'':v}
/* Satu lembar hanya untuk satu unit pada sekolah yang sama. Unit khusus sekolah boleh menimpa unit bersama. */
function uoCek(d){
 var o=d.obs;if(!o||o.mode==='tanpa')return '';
 var L=OBU.lb[o.lembar];if(!L)return 'Pilih lembar observasi, atau pilih Tanpa observasi.';
 if(L.tk!==d.kelas)return 'Lembar observasi harus setingkat dengan kelas unit.';
 var sk=uoSekolahUnit(d.sekolah);
 var x=(typeof JOBS!=='undefined'?JOBS:[]).filter(function(j){return j.ukk&&j.id!==d.id&&j.obs&&j.obs.lembar===o.lembar&&uoSekolahUnit(j.sekolah)===sk})[0];
 return x?'Lembar ini sudah dipakai unit '+x.id+'.':'';
}
function uoSek(sid){var u=sid&&(S.users||[]).find(function(x){return x.id===sid}),k=String((u&&u.sekolah)||'').toUpperCase();return k||String(schKode()||'').toUpperCase()}
/* Unit yang terhubung ke lembar: utamakan unit khusus sekolah, lalu unit bersama. */
function uoUnit(lk,sek){
 sek=sek||String(schKode()||'').toUpperCase();
 var c=(typeof JOBS!=='undefined'?JOBS:[]).filter(function(j){return j.ukk&&j.obs&&j.obs.mode!=='tanpa'&&j.obs.lembar===lk});
 return c.filter(function(j){return sek&&uoSekolahUnit(j.sekolah)===sek})[0]||c.filter(function(j){return !uoSekolahUnit(j.sekolah)})[0]||(sek?null:c[0])||null;
}
function uoMeta(lk,sek){
 var L=obuLb(lk),M=OBU.meta,j=uoUnit(lk,sek),f=(j&&j.form)||FORM_UKK;
 /* lembar kelas X hanya mengamati sebagian tugas unit, jadi judulnya tetap judul lembar */
 return {job:j,satuan:j?schSatuan(j,f):M.satuan,konsentrasi:f.konsentrasi||M.konsentrasi,kode:f.kode||M.kode,tahun:f.tahun||M.tahun,bentuk:f.bentuk||FORM_UKK.bentuk,
  paket:f.paket||'1',tempat:f.tempat||FORM_UKK.tempat||'Sumedang',waktu:j?j.menit+' Menit':(L.waktu||M.waktu),penguji2:M.penguji2,
  kendaraan:j?j.unit:(M.unit[lk]||''),judul:j&&L.tk!=='X'?j.judul+' ('+j.unit+')':L.judul};
}
function uoMetaRekap(){return uoMeta(OU.lembar,'')}
function uoKet(j){return j?'Unit '+j.id+' · '+UO_MODE[j.obs.mode]:'Belum terhubung ke unit UKK. Atur di Kelola unit, tab Observasi pada Edit isi.'}
/* Nilai gabungan satu siswa untuk observasi pada unit bermode paket (nilai unit = Penilaian terbaru). */
function uoPaket(r){
 var j=uoUnit(obuKey(r),uoSek(r.guruId));if(!j||j.obs.mode!=='paket')return null;
 var n=String(r.guru||'').trim().toLowerCase();
 var h=(S.results||[]).filter(function(x){return x.jobId===j.id&&x.tipe==='Penilaian'&&(r.guruId&&x.sid?x.sid===r.guruId:(String(x.siswa||'').trim().toLowerCase()===n&&x.kelas===r.kelas))}).sort(function(a,b){return b.ts-a.ts})[0];
 var w=uaBobot(),u=h?(+h.score||0):null;
 return {job:j,wU:w,unit:u,obs:+r.skor||0,nilai:u==null?null:Math.round(w*u/100+(100-w)*(+r.skor||0)/100)};
}
function uoPaketCard(r){
 var p=uoPaket(r);if(!p)return '';
 return '<div class="card"><span class="label">Nilai satu paket · '+esc(p.job.id)+'</span>'+
  (p.nilai==null?'<p class="note">Menunggu nilai unit. Buka Kelola unit lalu Nilai siswa.</p>':'<div class="row sb"><span class="pill '+obuPill(obuKat(p.nilai))+'">'+esc(obuKat(p.nilai))+'</span><b class="mono">'+p.nilai+'</b></div><p class="note">Unit '+p.unit+' × '+p.wU+'% + Observasi '+p.obs+' × '+(100-p.wU)+'%</p>')+'</div>';
}
/* Pasangan untuk Nilai Akhir, menurut kelas dan sekolah siswa. Unit tersembunyi ikut hanya bila siswa sudah punya nilainya. */
function uoDipakai(id){return JOBS.some(function(j){return j.id===id&&j.obs&&j.obs.mode!=='tanpa'&&j.obs.lembar})}
function uoPasangan(kelas,sek,s){
 var out=[],pakai={};
 JOBS.forEach(function(j){
  if(!j.ukk||j.kelas!==kelas||!j.obs||j.obs.mode==='tanpa'||!j.obs.lembar||pakai[j.obs.lembar])return;
  var x=uoUnit(j.obs.lembar,sek);if(!x||x.kelas!==kelas)return;
  if(x.cfg&&x.cfg.tampil===false&&s.unit[x.id]==null&&s.obs[x.obs.lembar]==null)return;
  pakai[x.obs.lembar]=1;out.push({u:x.id,o:x.obs.lembar,mode:x.obs.mode});
 });
 return out;
}
/* ---- Editor unit: tab Observasi ---- */
function uoTabEditor(d){
 var s=d.S,o=s.obs||{mode:'tanpa',lembar:''},ada=OBU.lembar.filter(function(L){return L.tk===s.kelas});
 var opt='<option value="">Pilih lembar</option>'+ada.map(function(L){return '<option value="'+L.k+'"'+(o.lembar===L.k?' selected':'')+'>'+esc(L.nama)+'</option>'}).join('');
 return '<section class="card"><div><h3>Observasi unit ini</h3><p class="note">Identitas lembar observasi otomatis mengikuti tab Info dan Identitas lembar.</p></div>'+
  '<div class="seg" role="group" aria-label="Tata kelola observasi">'+Object.keys(UO_MODE).map(function(k){return '<button type="button" data-uo="'+k+'" aria-pressed="'+(o.mode===k)+'">'+UO_MODE[k]+'</button>'}).join('')+'</div>'+
  '<p class="note">'+(o.mode==='paket'?'Unit dan observasi dinilai sebagai satu paket: nilai gabungan tampil di detail dan PDF observasi.':o.mode==='pasangan'?'Unit dan observasi dinilai serta dicetak terpisah, lalu digabung berbobot di Nilai Akhir UKK.':'Unit tidak punya observasi dan tidak masuk Nilai Akhir UKK.')+'</p>'+
  (o.mode==='tanpa'?'':ada.length?'<label class="f">Lembar observasi<select data-uke="obs.lembar">'+opt+'</select></label>':'<p class="note">Belum ada lembar observasi untuk kelas '+esc(s.kelas)+'.</p>')+'</section>';
}
function uoHubCard(j){
 var o=j.obs||{mode:'tanpa'},L=OBU.lb[o.lembar];
 return '<section class="card"><span class="label">Observasi</span><b>'+UO_MODE[o.mode]+'</b>'+(o.mode!=='tanpa'&&L?'<p class="note">'+esc(L.nama)+'</p><div class="lks-acts"><button type="button" class="btn small'+(o.mode==='paket'?' primary':'')+'" data-uo-buka="'+esc(j.id)+'">Buka observasi unit ini</button></div>':'<p class="note">Ubah lewat Edit isi, tab Observasi.</p>')+'</section>';
}
document.addEventListener('click',function(e){
 var m=e.target.closest&&e.target.closest('[data-uo]');
 if(m&&UKS.ed){var o=UKS.ed.S.obs||{};UKS.ed.S.obs={mode:m.dataset.uo,lembar:o.lembar||''};ukeRe();return}
 var b=e.target.closest&&e.target.closest('[data-uo-buka]');
 if(b&&can('observasi')){
  var j=ukkJobBy(b.dataset.uoBuka);if(!j||!j.obs.lembar)return;
  var op=obuRbOpsi().filter(function(x){return obuTingkat(x)===j.kelas});
  OU.mode='list';OU.d=null;OU.view=null;OU.q='';OU.lembar=j.obs.lembar;
  if(!obuRbPilih()||obuTingkat(obuRbPilih())!==j.kelas)OU.rb=op.length===1?op[0].key:'';
  S.tab='observasi-ukk';render();window.scrollTo(0,0);
 }
});
