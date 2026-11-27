window.APP_CONFIG={
  APPWRITE_ENDPOINT:'https://sgp.cloud.appwrite.io/v1',
  APPWRITE_PROJECT:'6b08f9a2001e88fb5ac6',
  DB:'tbsm',
  /* Opsional: peringatan bila satu perangkat membaca sekian dokumen dalam sehari (monitoring di Cek sinkronisasi). Contoh: DB_BATAS_BACA:3000 */
  PENDAFTARAN_TERBUKA:false,
  ADMIN_EMAIL:'2603039008@uhamka.ac.id',
  /* CBT aman (kunci jawaban dan penilaian di server). Aktifkan HANYA setelah fungsi terpasang; lihat docs-CBT.md */
  CBT_AMAN:true,
  /* Penanda UserAgent Exambro, dipisah koma; salah satu cocok = dianggap Exambro. Exambro Ex tidak menambah kata khusus, hanya UserAgent WebView Android ("Version/4.0"). Samakan dengan EXAMBRO_UA di fungsi server. */
  EXAMBRO_UA:'TBSM-EXAM,Version/4.0',
  /* Safe Exam Browser (SEB): UserAgent SEB memuat 'SEB/' (Windows, macOS) atau 'SEB_iOS' (iPad/iPhone). Di SEB layar penuh tidak diwajibkan karena SEB sudah mode kios. */
  SEB_UA:'SEB/,SEB_iOS',
  FN_CBT:'akun-admin',   /* ID fungsi yang melayani aksi CBT: 'akun-admin' (paket gratis) atau 'cbt' */
  /* Penyimpanan jalur panas ujian (soal_run, soal_hasil, soal_kunci): 'appwrite' atau 'neon'. Hanya berlaku bila CBT_AMAN:true.
     CATATAN: sekolah ini sudah pakai 'neon' (variabel fungsi CBT_DB=neon, tabel siap, data lama tersalin).
     JANGAN dikembalikan ke 'appwrite' saat push. up.sh menjaga nilai ini dari config.js di repo, tetapi bila zip baru
     memuat nilai lain dan Anda memang ingin mengganti, jalankan: CBT_DB_PAKSA=1 sh up.sh (lihat docs-NEON.md). */
  CBT_DB:'neon',
  /* Dimatikan: CBT hanya membaca Neon, tidak lagi membaca cadangan lama di Appwrite. Samakan dengan CBT_LEGACY=0 di variabel fungsi (docs-NEON.md). Untuk menyalakan lagi, ubah ke true. */
  CBT_LEGACY:false
  /* CBT_DENYUT: selang simpan jawaban ke server dalam ms (bawaan 15000) */
};
