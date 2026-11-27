# Hapus riwayat latihan (khusus Admin)

Menu: **Riwayat latihan siswa**. Tombol hanya muncul bila peran aktif Admin; izin hapus juga dijaga server.

- **Hapus** di tiap kartu: menghapus satu riwayat latihan setelah konfirmasi.
- **Hapus semua sesuai filter**: menghapus semua latihan yang cocok dengan filter nama, kelas, dan mapel. Wajib mengetik **HAPUS**. Tanpa filter berarti semua riwayat latihan.
- Yang terhapus hanya hasil latihan. Hasil ujian CBT (CBT Online > Hasil), soal, sesi, dan akun tidak berubah.
- Butuh internet bila memakai Appwrite. Perangkat lain perlu menekan Segarkan. Penghapusan tercatat di Log audit (menu Pengaturan, khusus admin): jumlah data dan contohnya. Unduh atau cetak riwayat dulu bila perlu arsip.

Berkas: `js/riwayat-hapus.js` (dimuat setelah `cetak-riwayat.js`), tanpa perubahan koleksi.
