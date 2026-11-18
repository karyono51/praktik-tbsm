/* kepsek.js: peran Kepala Sekolah (hanya-lihat). Dimuat paling akhir.
   - Daftar peran: Admin, Kepala Sekolah, Guru, Siswa. Akun boleh berperan ganda (mis. Kepala Sekolah + Guru).
   - Bisa melihat data sekolahnya: rekap nilai dan analisis, riwayat latihan, hasil CBT Online, observasi, Akademik.
   - Tidak bisa mengubah apa pun selama peran aktifnya Kepala Sekolah: semua penulisan ke Appwrite (dokumen dan fungsi)
     ditolak di sini, dan tombol yang jelas bersifat mengubah data dihentikan dengan pesan.
   - Syarat di Appwrite: akun Kepala Sekolah diberi label `guru` (agar boleh MEMBACA koleksi). Lihat docs-KEPSEK.md. */
(function(){
 if(typeof PERAN==='undefined'||typeof PERM==='undefined')return;
 var MSG='Peran Kepala Sekolah hanya dapat melihat data.';
 PERAN.kepsek='Kepala Sekolah';
 PERM.kepsek=['nilai','observasi','observasi-semua','akademik'];
 URUT=['admin','kepsek','guru','siswa'];
 function kp(){try{return !!S.user&&actRole()==='kepsek'}catch(e){return false}}
 function tolak(){var e=new Error(MSG);e.code=403;return e}

 /* 1. Penulisan dokumen ke Appwrite */
 if(typeof Cloud!=='undefined'){
  var i0=Cloud.init;
  Cloud.init=function(){
   i0.apply(this,arguments);
   var db=this.db;if(!db)return;
   ['createDocument','updateDocument','deleteDocument'].forEach(function(m){
    var f=db[m];if(typeof f!=='function')return;
    db[m]=function(){if(kp())return Promise.reject(tolak());return f.apply(db,arguments)};
   });
  };
  var f0=Cloud.flush;
  Cloud.flush=function(){if(kp())return Promise.resolve();return f0.apply(this,arguments)};
  var r0=Cloud.remove;
  Cloud.remove=function(){if(kp()){toast(MSG);return Promise.resolve(false)}return r0.apply(this,arguments)};
 }

 /* 2. Fungsi server: hanya aksi baca */
 var BACA=['ulasan','periksa','get','getsoal','ping'];
 try{
  var P=window.Appwrite&&Appwrite.Functions&&Appwrite.Functions.prototype;
  if(P&&P.createExecution){
   var c0=P.createExecution;
   P.createExecution=function(fid,body){
    if(kp()){var a='';try{a=JSON.parse(body||'{}').action}catch(e){}
     if(BACA.indexOf(a)<0)return Promise.reject(tolak())}
    return c0.apply(this,arguments);
   };
  }
 }catch(e){}

 /* 3. Tombol dan pilihan yang jelas mengubah data */
 var BS_TULIS=/^(aktif|baru|hapushasil|hapussoal|salin|sesiaktif|sesibaru|sesigandakan|sesihapus|sesisimpan|sesiubah|simpansoal|ubah|tuj|kirimulang|bsio-apply|pn-(akhiri|ext|extall|nilai|nilai1|nilaisemua|reset|susulan|token|buka|bukasesi)|an-ulang)$/;
 var ACT_BOLEH=/^(menu|drawer|refresh|switchrole|menulogout|mypw|updateapp|akunfilter|rtab|back)$/;
 var ACT_TULIS=/(hapus|delete|simpan|save|tambah|add|baru|new|impor|imp[a-z]*apply|reset|edit|ubah|kkm|setpw|nonaktif|salin|ganda|submit|kirim|akhiri)/i;
 function blok(e){
  if(!kp())return;
  var t=e.target&&e.target.closest?e.target.closest('[data-bs],[data-act]'):null;if(!t)return;
  var bs=t.getAttribute('data-bs'),ac=t.getAttribute('data-act');
  var tulis=(bs&&BS_TULIS.test(bs))||(ac&&!ACT_BOLEH.test(ac)&&ACT_TULIS.test(ac));
  if(!tulis)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.type==='click')toast(MSG);else render();
 }
 document.addEventListener('click',blok,true);
 document.addEventListener('change',blok,true);
})();
