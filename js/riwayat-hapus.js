/* riwayat-hapus.js: Admin menghapus riwayat latihan siswa (Bank soal > Riwayat latihan siswa).
   - Tombol "Hapus" di tiap kartu latihan, dan "Hapus semua sesuai filter" (harus mengetik HAPUS).
   - Hanya peran aktif Admin (can('hapus')); izin hapus juga dijaga server (label admin atau guru pada soal_hasil).
   - Yang terhapus hanya hasil latihan (mode 'latihan', koleksi soal_hasil). Hasil ujian CBT tidak tersentuh
     (dihapus lewat CBT Online > Hasil). Soal, sesi, dan akun tidak berubah.
   Bergantung pada: banksoal.js (BS, bsDel, bsRlRows, bsRlList), dialog.js (uiConfirm, uiPrompt), core.js (can). */
(function(){
function admin(){return typeof can==='function'&&!!S.user&&can('hapus')}
function offline(){return typeof Cloud!=='undefined'&&Cloud.on&&navigator.onLine===false}

/* sisipkan tombol Hapus di tiap kartu, dan tombol hapus massal di bawah ringkasan */
if(typeof bsRlList==='function'){
 var _rlList=bsRlList;
 bsRlList=function(){
  var h=_rlList.apply(this,arguments);
  if(!admin()||h.indexOf('data-bs="detail"')<0)return h;
  h=h.replace(/(<button type="button" class="btn small" data-bs="detail" data-v="([^"]*)">Detail<\/button>)/g,
   '<span class="row">$1<button type="button" class="btn small danger" data-bs="rlhapus" data-v="$2">Hapus</button></span>');
  var n=bsRlRows().length,
   b='<button type="button" class="btn danger" data-bs="rlhapussemua">Hapus semua sesuai filter ('+n+')</button>';
  return h.replace(/(<p class="note">[^<]*<b class="mono">[^<]*<\/b><\/p>)/,'$1'+b);
 };
}

async function hapusSatu(id){
 if(offline()){toast('Offline: penghapusan butuh internet');return}
 var ok=await uiConfirm('Hapus riwayat latihan ini?\nNilai latihan siswa ini hilang dari daftar dan tidak bisa dikembalikan.',{ok:'Hapus',danger:true});
 if(!ok||!admin())return;
 await bsDel('hasil',id);
 var gagal=BS.D.hasil.some(function(x){return x.id===id});
 toast(gagal?'Gagal menghapus. Coba lagi saat online.':'Riwayat latihan dihapus');
 render();
}

async function hapusSemua(){
 if(!admin())return;
 var rows=bsRlRows();
 if(!rows.length){toast('Tidak ada latihan yang cocok dengan filter');return}
 if(offline()){toast('Offline: penghapusan butuh internet');return}
 var f=BS.rl,ket=[];
 if(f.kelas)ket.push('kelas '+f.kelas);if(f.mapel)ket.push(f.mapel);if(f.q&&String(f.q).trim())ket.push('nama "'+String(f.q).trim()+'"');
 var v=await uiPrompt('Hapus '+rows.length+' riwayat latihan?\n'+(ket.length?'Filter: '+ket.join(', ')+'.':'Tidak ada filter: SEMUA riwayat latihan akan terhapus.')+'\nTidak bisa dikembalikan. Ketik HAPUS untuk melanjutkan.',{ok:'Hapus semua',danger:true,label:'Ketik HAPUS'});
 if(v==null)return;
 if(String(v).trim().toUpperCase()!=='HAPUS'){toast('Dibatalkan: kata HAPUS tidak cocok');return}
 if(!admin())return;
 var ids=rows.map(function(x){return x.id}),n=0;
 toast('Menghapus '+ids.length+' riwayat…');
 for(var i=0;i<ids.length;i+=5){
  await Promise.all(ids.slice(i,i+5).map(function(id){return bsDel('hasil',id)}));
 }
 var sisa=ids.filter(function(id){return BS.D.hasil.some(function(x){return x.id===id})}).length;
 n=ids.length-sisa;
 toast(n+' riwayat dihapus'+(sisa?', '+sisa+' gagal':''));
 BS.rl.n=20;render();
}

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs="rlhapus"],[data-bs="rlhapussemua"]');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(b.dataset.bs==='rlhapus')hapusSatu(b.dataset.v);else hapusSemua();
},true);
})();
