# Peran Kepala Sekolah (hanya-lihat)

Peran `kepsek` (tampil "Kepala Sekolah") untuk kepala sekolah, misalnya SMKS Medina Bandung.

## Yang bisa dilihat
Rekap nilai dan analisis, Riwayat latihan siswa, hasil CBT Online, observasi (guru, LKPD praktik, UKK), dan menu Akademik, semuanya terbatas pada sekolah di akunnya.

## Yang tidak bisa
Mengubah, menambah, atau menghapus data apa pun, mengelola akun, mengubah KKM, menghapus nilai. Semua penulisan ditolak di aplikasi selama peran aktifnya Kepala Sekolah.

## Cara membuat akun
1. Di aplikasi, menu **Akun** > tambah akun. Centang peran **Kepala Sekolah** dan pilih sekolah **Medina**.
2. Appwrite Console > **Auth** > **Users** > akun tersebut > **Labels**: tambahkan `guru`. Label ini diperlukan agar akun boleh membaca koleksi (izin baca koleksi memakai label `guru`/`admin`).
3. Atur sandi lewat menu Akun seperti akun lain.

## Catatan keamanan
Label `guru` di Appwrite juga memberi izin tulis di tingkat database. Pembatasan hanya-lihat dijalankan oleh aplikasi, jadi cocok untuk pengguna tepercaya. Untuk pembatasan di tingkat server, butuh label khusus `kepsek` dan izin koleksi baru lewat `tools/setup-appwrite.mjs`.
Kolom peran kini 64 karakter, cukup untuk semua gabungan. Instalasi lama yang kolomnya masih 16 karakter perlu menjalankan `node tools/perbesar-peran.mjs` (lihat docs-PERAN-GANDA.md).
