# Refresh dan LKPD per kelas (cache tbsm-v20)

## Refresh
- Posisi halaman (menu, kelas, modul LKPD, tab) disimpan dan dipulihkan setelah reload, berlaku 24 jam. Login baru tetap ke Beranda. Penilaian yang sedang berjalan tidak dipulihkan.
- Tombol **Segarkan** di header dan baris **Segarkan data** di dasbor: mengirim data yang menunggu sinkron, lalu mengambil ulang hasil, LKPD, dan modul dari Appwrite tanpa pindah halaman.
- Baris **Perbarui aplikasi** di dasbor: memeriksa versi baru. Bila sudah terbaru, ada pilihan bersihkan cache dan muat ulang paksa (perlu internet).
- Bila versi baru terdeteksi, muncul bilah "Versi baru aplikasi sudah siap" dengan tombol Muat ulang.
- Penyebab tampilan lama: berkas service-worker.js ikut di-cache peramban. Kini didaftarkan dengan `updateViaCache:'none'`, berkas index.html memakai `?v=21`, dan aplikasi memeriksa pembaruan saat dibuka kembali, saat online, dan tiap 30 menit.

## Setiap rilis berikutnya
1. Naikkan `CACHE` di service-worker.js (misalnya tbsm-v21).
2. Ganti `?v=21` di index.html dengan nomor yang sama.

## LKPD Praktik per kelas (pengganti Unit Ujian)
- Dasbor: bagian **LKPD praktik** berisi Kelas X, XI, XII. Beranda juga menghitung modul LKPD per kelas.
- Daftar kartu per kelas, seperti Unit Ujian: judul, unit, durasi, jumlah langkah dan soal, kode SKKNI, status Kompeten atau Belum kompeten memakai KKM aplikasi.
- Siswa hanya melihat modul terbit untuk kelasnya. Statusnya ikut nilai koreksi guru bila sudah ada.
- Guru dan admin: Buka modul, Pratinjau, Edit, Terbitkan atau Jadikan draft, Modul baru (kelas terisi sesuai kelas yang dibuka), Rekap kelas.
- Unit Ujian lama masih ada di dasbor bagian Lainnya, dengan pilihan kelas di atas daftarnya, sampai Anda siap menghapusnya.

## Timer LKPD dan footer (cache tbsm-v21)
- Footer LKPD kini tiga baris: waktu dan tombol Mulai/Jeda/Lanjut, empat penanda progres (K3, Langkah, Periksa, Soal), lalu Simpan draf, Kirim LKPD, Cetak.
- Timer sama seperti Unit Ujian: hitung maju, mulai otomatis saat siswa mulai mengisi, merah bila melewati target menit modul.
- Waktu tersimpan per siswa dan modul, tahan reload, berhenti saat keluar dari modul, dan dicatat saat LKPD dikirim (tampil sebagai "Waktu" di Detail dan masuk kolom detik di tabel hasil).
