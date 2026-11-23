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
  if(!(await uiConfirm('Hapus pengumpulan LKPD '+z.siswa+' ('+(z.kelas||'-')+', '+new Date(z.ts).toLocaleDateString('id-ID')+')?\nNilainya di Rekap nilai dan foto buktinya ikut terhapus. Tindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
  if(Cloud.on){
   if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}
   var bk=(S.lkpdBukti||[]).filter(function(x){return x.lkpdId===id});
   for(var k=0;k<bk.length;k++){if(!(await hapusServer('lkpd_bukti',bk[k].id)))return}
   var hs=(S.results||[]).filter(function(x){return x.tipe==='LKPD'&&x.ts===z.ts&&x.sid===z.sid});
   for(var m=0;m<hs.length;m++){if(!(await hapusServer('hasil',hs[m].id)))return}
   if(!(await hapusServer('lkpd',id)))return;
  }
  S.results=(S.results||[]).filter(function(x){return !(x.tipe==='LKPD'&&x.ts===z.ts&&x.sid===z.sid)});
  S.lkpd=S.lkpd.filter(function(x){return x.id!==id});
  S.lkpdBukti=(S.lkpdBukti||[]).filter(function(x){return x.lkpdId!==id});
  if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti',JSON.stringify(S.lkpdBukti))}catch(er){}}
  LK.detail=null;persist();render();window.scrollTo(0,0);toast('Pengumpulan dihapus');
 });
 /* Rekap nilai: Admin menghapus satu baris nilai (koleksi hasil) */
 document.addEventListener('click',async function(e){
  var b=e.target.closest('[data-act="hasil-hapus"]');if(!b)return;
  var id=b.dataset.v,r=(S.results||[]).find(function(x){return x.id===id});
  if(!r||!can('hapus'))return;
  if(!(await uiConfirm('Hapus nilai '+(r.siswa||'tanpa nama')+' (Kelas '+(r.kelas||'-')+', '+new Date(r.ts).toLocaleDateString('id-ID')+')?\nTindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
  if(Cloud.on){
   if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}
   if(!(await hapusServer('hasil',id)))return;
  }
  S.results=S.results.filter(function(x){return x.id!==id});persist();render();toast('Nilai dihapus');
 });
})();
