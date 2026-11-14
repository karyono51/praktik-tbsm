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
