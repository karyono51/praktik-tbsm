window.APP_CONFIG={
  APPWRITE_ENDPOINT:'https://sgp.cloud.appwrite.io/v1',
  APPWRITE_PROJECT:'6af2a76d00199ba40ab0',
  DB:'tbsm',
  PENDAFTARAN_TERBUKA:false,
  ADMIN_EMAIL:'2603039008@uhamka.ac.id',
  /* CBT aman (kunci jawaban dan penilaian di server). Aktifkan HANYA setelah fungsi terpasang; lihat docs-CBT.md */
  CBT_AMAN:true,
  /* Penanda UserAgent Exambro, dipisah koma; salah satu cocok = dianggap Exambro. Exambro Ex tidak menambah kata khusus, hanya UserAgent WebView Android ("Version/4.0"). Samakan dengan EXAMBRO_UA di fungsi server. */
  EXAMBRO_UA:'TBSM-EXAM,Version/4.0',
  /* Safe Exam Browser (SEB): UserAgent SEB memuat 'SEB/' (Windows, macOS) atau 'SEB_iOS' (iPad/iPhone). Di SEB layar penuh tidak diwajibkan karena SEB sudah mode kios. */
  SEB_UA:'SEB/,SEB_iOS',
  FN_CBT:'akun-admin'   /* ID fungsi yang melayani aksi CBT: 'akun-admin' (paket gratis) atau 'cbt' */
  /* CBT_DENYUT: selang simpan jawaban ke server dalam ms (bawaan 15000) */
};
