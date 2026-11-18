# Daftar peserta tetap per sesi

Tanpa pembekuan, daftar peserta sesi dihitung dari kelas dan sekolah akun setiap kali dibuka. Siswa yang pindah kelas, dinonaktifkan, atau baru ditambahkan mengubah daftar hadir, berita acara, dan rekap.

## Membekukan
- **Menu Sesi** > ubah sesi > bagian **Daftar peserta** > **Bekukan daftar sekarang**, lalu simpan sesi.
- **Pantau** (guru/admin): sesi yang belum dibekukan menampilkan tombol **Bekukan daftar peserta**.
- Setelah dibekukan, bagian yang sama menyediakan:
  - **Tambah atau keluarkan siswa**: cari siswa dari kelas mana pun (susulan, remedial), centang untuk menambah, hapus centang untuk mengeluarkan.
  - **Perbarui dari kelas**: ganti daftar dengan daftar kelas saat ini (siswa susulan manual hilang).
  - **Lepas pembekuan**: kembali dihitung dari kelas.

## Yang berubah setelah dibekukan
- Server: hanya siswa di daftar yang bisa mulai, tanpa memandang kelas atau sekolah akunnya sekarang. Siswa di luar daftar melihat pesan tidak terdaftar sebagai peserta.
- Pantau, kartu peserta, daftar hadir (tertulis "daftar tetap"), dan rekap memakai daftar itu. Nama siswa tetap diambil dari akun terkini.
- Siswa hanya melihat sesi yang memuat dirinya.
- Penempatan ruang memakai daftar tetap. Mengeluarkan siswa dari daftar juga mengeluarkannya dari ruang.

## Batasan
- Akun yang dihapus tidak muncul lagi. Akun yang dinonaktifkan tetap tercatat di daftar, tetapi tidak bisa masuk.
- Daftar disimpan di dalam sesi (batas sekitar 17.000 karakter bersama penempatan ruang dan soal manual). Untuk ratusan siswa, pakai beberapa sesi.
- Id siswa di dalam sesi terbaca oleh peramban siswa, hanya berupa id akun tanpa nama.
- Perubahan fungsi server: deploy ulang `akun-admin`.
