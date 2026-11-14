/* ukk-foto.js: foto bukti per butir UKK (tahap 1).
   - Butir bertanda Wajib foto (field f) wajib difoto, satu foto per butir.
   - Foto disimpan di V.fo (per peserta, atau '*' untuk kelompok) dan ikut draft perangkat.
   - Tombol Hitung hasil ditahan sampai semua foto wajib terisi.
   Kamera memakai ldOpenCam dan ldCompress dari lkpd-drive.js. Unggah ke Drive dan penyimpanan di hasil dikerjakan di tahap 2. */
function ukFotoKey(){return V.kel?'*':V.peserta}
function ukFotoMap(){V.fo=V.fo||{};var k=ukFotoKey();return V.fo[k]||(V.fo[k]={})}
function ukFotoWajib(j){var u=j||V.job;return (u&&u.ukk)?(u.items||[]).filter(function(i){return i.f}):[]}
function ukFotoSimpan(){try{if(typeof ujiDraftSimpan==='function')ujiDraftSimpan()}catch(e){}}
/* Pesan kekurangan foto, atau '' bila semua foto wajib sudah terisi */
function ukFotoKurang(){
 if(!V.job||!V.job.ukk||V.mode!=='exam')return '';
 var w=ukFotoWajib();if(!w.length)return '';
 var keys=V.kel?['*']:(nameList().length?nameList():[V.peserta]),out=[];
 keys.forEach(function(k){
  var f=(V.fo||{})[k]||{},miss=w.filter(function(i){return !f[i.id]}).map(function(i){return i.no});
  if(miss.length)out.push((V.kel?'Kelompok':k)+': butir '+miss.join(', '));
 });
 return out.length?'Foto wajib belum lengkap. '+out.join('; '):'';
}
/* Sel foto di Komponen (form siswa). Kosong bila butir tidak wajib foto. */
function ukFotoCell(i){
 if(!i.f)return '';
 var has=((V.fo||{})[ukFotoKey()]||{})[i.id];
 return '<div class="ld-cam">'+(has?
   '<img class="ld-thumb ld-zoom" src="'+has+'" alt="Foto bukti '+i.no+'">'+ldIb('ukk-foto-del','trash','Hapus foto',i.id,'danger'):
   ldIb('ukk-foto','camera','Ambil foto bukti',i.id))+
  '<span class="pill '+(has?'ok':'warn')+'">Foto wajib</span></div>';
}
/* Ringkasan di Pengaturan unit (guru dan admin) */
function ukFotoInfo(j){
 var w=ukFotoWajib(j);
 return w.length?'<p class="note">Foto wajib: butir '+w.map(function(i){return i.no}).join(', ')+'. Ubah lewat Edit isi.</p>':'<p class="note">Tidak ada butir yang wajib foto.</p>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="ukk-foto"]');if(!b)return;
 var a=b.dataset.act,v=b.dataset.v;
 if(!V.job||!V.job.ukk||V.mode!=='exam')return;
 if(a==='ukk-foto'){
  ldOpenCam(function(file){ldCompress(file,function(data){
   if(!data){toast('Foto gagal diproses, coba lagi');return}
   ukFotoMap()[v]=data;ukFotoSimpan();
   if(!V.running&&V.sec===0)startTimer();
   render();toast('Foto tersimpan');
  })});
 }else if(a==='ukk-foto-del'){
  delete ukFotoMap()[v];ukFotoSimpan();render();
 }
});
/* Hitung hasil tidak bisa dijalankan bila foto wajib belum lengkap */
(function(){var f0=finishExam;finishExam=function(){var m=ukFotoKurang();if(m){toast(m);return}return f0.apply(this,arguments)}})();

/* ---------- Tahap 2: simpan foto bukti ke lkpd_bukti (jalur yang sama dengan LKPD) ---------- */
/* Dipanggil dari aksi Simpan, sebelum draft dihapus. n0 = jumlah hasil sebelum penyimpanan.
   Foto dicatat per hasil: lkpdId = ID hasil, moduleId = ID unit. Di mode Latihan kelompok, foto hanya dicatat sekali (pada anggota pertama). */
function ukFotoLampirkan(n0){
 if(!V.job||!V.job.ukk||!V.fo)return;
 S.lkpdBukti=S.lkpdBukti||[];
 var idx={};V.job.items.forEach(function(i,k){idx[i.id]={no:k,t:i.t}});
 S.results.slice(n0).filter(function(r){return r.jobId===V.job.id}).forEach(function(r,n){
  if(V.kel&&n>0)return;
  var map=V.fo[V.kel?'*':r.siswa]||{},ids=Object.keys(map).filter(function(id){return idx[id]&&map[id]});
  if(!ids.length)return;
  ids.forEach(function(id){
   S.lkpdBukti.push({id:uid(),lkpdId:r.id,sid:r.sid,moduleId:r.jobId,ts:r.ts,label:'c'+idx[id].no+'|'+String(idx[id].t||''),data:map[id]});
  });
  r.catatan=((r.catatan||'')+' Foto bukti: '+ids.length+' butir.').trim().slice(0,1000);
  if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti',JSON.stringify(S.lkpdBukti))}catch(e){toast('Foto bukti tidak muat di penyimpanan perangkat')}}
 });
}

/* ---------- Guru: melihat foto bukti pada Hasil penilaian ---------- */
var UKF={open:{},busy:{}};
function ukFotoLoad(rid){
 if(!Cloud.on||navigator.onLine===false)return;
 UKF.busy[rid]=1;
 Cloud.list('lkpd_bukti',[Appwrite.Query.equal('lkpdId',[rid])]).then(function(d){
  LK.remote=LK.remote||{};LK.remote[rid]=d.map(fromDoc);
 }).catch(function(){toast('Foto tidak dapat dimuat, periksa koneksi')}).then(function(){delete UKF.busy[rid];render()});
}
function ukFotoPanel(rid){
 if(UKF.busy[rid])return '<p class="note">Memuat foto…</p>';
 var a=lkBuktiAll(rid);
 if(!a.length)return '<p class="note">Tidak ada foto bukti.</p>';
 return '<div class="lk-fotos">'+a.map(function(x){
  var p=ldParse(x),cap=(p.item>=0?'Item '+(p.item+1)+' · ':'')+lkEsc(p.name);
  return '<figure class="lk-foto">'+ldImgHtml(x,rid,'')+'<figcaption>'+cap+'</figcaption></figure>';
 }).join('')+'</div>';
}
/* Tombol di kartu hasil; hanya untuk hasil yang punya foto bukti */
function ukFotoTombol(r){
 if(!/Foto bukti/.test(r.catatan||''))return '';
 var o=!!UKF.open[r.id];
 return '<div class="row" style="margin-top:6px"><button type="button" class="btn small" data-act="ukf-toggle" data-v="'+esc(r.id)+'">'+(o?'Sembunyikan foto':'Lihat foto')+'</button></div>'+(o?ukFotoPanel(r.id):'');
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="ukf-toggle"]');if(!b)return;
 var rid=b.dataset.v;UKF.open[rid]=!UKF.open[rid];
 if(UKF.open[rid])ukFotoLoad(rid);
 render();
});

/* ---------- UKK ujian dinilai per siswa (individu). Kelompok hanya untuk latihan. ---------- */
function ukIndividu(){return !!(V.job&&V.job.ukk&&V.job.cfg&&V.job.cfg.mode==='ujian')}
(function(){
 var s0=startExam;
 startExam=function(id,keep){
  var r=s0.apply(this,arguments);
  if(ukIndividu()&&V.kel){V.kel=false;V.peserta=V.group[0]||V.peserta;V.checks=curChecks();render()}
  return r;
 };
})();

/* Latihan boleh diselesaikan sebelum semua butir terisi (butir kosong dihitung belum sesuai).
   Ujian tetap mensyaratkan semua butir terisi. */
function ukBisaHitung(){
 if(!(V.job&&V.job.ukk&&V.job.cfg&&V.job.cfg.mode==='latihan'))return groupComplete();
 return V.kel?doneOf('*')>0:nameList().every(function(n){return doneOf(n)>0});
}

/* Label jenis di rekap dan Excel/PDF: latihan UKK ditandai "Latihan UKK". Nilai tersimpan tetap "Latihan". */
function jenisTampil(r){var j=jobById(r.jobId);return (r.tipe==='Latihan'&&j&&j.ukk)?'Latihan UKK':r.tipe}
