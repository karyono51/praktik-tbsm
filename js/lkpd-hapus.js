/* lkpd-hapus.js (v91): Admin menghapus SATU pengumpulan LKPD dari halaman Detail.
   Sebelumnya satu-satunya cara hanya Administrasi > Hapus nilai, yang mengosongkan seluruh koleksi.
   - Tombol "Hapus pengumpulan ini" muncul di Detail hanya untuk peran aktif Admin (can('hapus')).
   - Ikut menghapus foto bukti yang terkait (lkpd_bukti, berkas di Drive tidak ikut terhapus).
   - Dokumen yang belum pernah sampai ke server (antrean offline) dianggap sudah terhapus di server; tetap dibuang dari perangkat.
   Dimuat paling akhir; hanya membungkus viewLKPD. */
(function(){
 var prev=viewLKPD;
 viewLKPD=function(){
  var h=prev();
  try{
   if(!S.user||!LK.detail||LK.editor||!can('hapus'))return h;
   var i=h.lastIndexOf('</section>');if(i<0)return h;
   var btn='<div class="row" style="margin-top:12px"><button type="button" class="btn danger" data-act="lk-hapus" data-v="'+lkEsc(LK.detail.id)+'">Hapus pengumpulan ini</button></div>';
   return h.slice(0,i)+btn+h.slice(i);
  }catch(e){return h}
 };
 function gone(e){return /not be found|not found|404/i.test(String((e&&e.message)||e))}
 async function hapusServer(col,id){
  try{await Cloud.db.deleteDocument(CFG.DB,col,id);return true}
  catch(e){if(gone(e))return true;toast('Gagal menghapus di server: '+((e&&e.message)||e));return false}
 }
 document.addEventListener('click',async function(e){
  var b=e.target.closest('[data-act="lk-hapus"]');if(!b)return;
  var id=b.dataset.v,z=(S.lkpd||[]).find(function(x){return x.id===id});
  if(!z||!can('hapus'))return;
  if(!(await uiConfirm('Hapus pengumpulan LKPD '+z.siswa+' ('+(z.kelas||'-')+', '+new Date(z.ts).toLocaleDateString('id-ID')+')?\nNilai dan foto buktinya ikut terhapus. Tindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
  if(Cloud.on){
   if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}
   var bk=(S.lkpdBukti||[]).filter(function(x){return x.lkpdId===id});
   for(var k=0;k<bk.length;k++){if(!(await hapusServer('lkpd_bukti',bk[k].id)))return}
   if(!(await hapusServer('lkpd',id)))return;
  }
  S.lkpd=S.lkpd.filter(function(x){return x.id!==id});
  S.lkpdBukti=(S.lkpdBukti||[]).filter(function(x){return x.lkpdId!==id});
  if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti',JSON.stringify(S.lkpdBukti))}catch(er){}}
  LK.detail=null;persist();render();window.scrollTo(0,0);toast('Pengumpulan dihapus');
 });
})();
