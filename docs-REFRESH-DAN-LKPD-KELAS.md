# Refresh dan LKPD per kelas (cache tbsm-v25)

## Perbaikan v25: refresh loncat ke Beranda
- Penilaian yang sedang berjalan (Unit ujian) kini ikut dipulihkan setelah refresh: unit, siswa atau kelompok, isian, catatan, dan waktu (timer berhenti, ketuk Lanjut). Disimpan tiap 5 detik, saat aplikasi disembunyikan, dan saat ditutup. Halaman hasil tidak dipulihkan.
- Bila pemuatan dari server gagal di tengah jalan, aplikasi memakai data tersimpan di perangkat dan tetap memulihkan posisi (muncul pemberitahuan), tidak lagi jatuh ke tab bawaan.
- Posisi tersimpan tidak pernah ditimpa selama data belum selesai dimuat.

## Perbaikan v24: refresh selalu loncat ke Unit ujian
- Penyebab: saat data masih dimuat dari Appwrite, `S.user` sudah terisi tetapi tab masih bawaan lama (`katalog` = Unit ujian). Bila halaman dimuat ulang atau ditinggalkan pada saat itu, `navSave` menimpa posisi tersimpan dengan Unit ujian, sehingga reload berikutnya selalu ke sana.
- Perbaikan: `navSave` tidak menyimpan selama boot (nav.js), posisi disimpan sekali setelah boot selesai, tab bawaan kini `beranda` (core.js), dan tab tidak dikenal atau tanpa izin jatuh ke Beranda, bukan Unit ujian (ui.js).


## Refresh
- Posisi halaman (menu, kelas, modul LKPD, tab) disimpan dan dipulihkan setelah reload, berlaku 24 jam. Login baru tetap ke Beranda. Penilaian yang sedang berjalan tidak dipulihkan.
- Tombol **Segarkan** di header dan baris **Segarkan data** di dasbor: mengirim data yang menunggu sinkron, lalu mengambil ulang hasil, LKPD, dan modul dari Appwrite tanpa pindah halaman.
- Baris **Perbarui aplikasi** di dasbor: memeriksa versi baru. Bila sudah terbaru, ada pilihan bersihkan cache dan muat ulang paksa (perlu internet).
- Bila versi baru terdeteksi, muncul bilah "Versi baru aplikasi sudah siap" dengan tombol Muat ulang.
- Penyebab tampilan lama: berkas service-worker.js ikut di-cache peramban. Kini didaftarkan dengan `updateViaCache:'none'`, berkas index.html memakai `?v=23`, dan aplikasi memeriksa pembaruan saat dibuka kembali, saat online, dan tiap 30 menit.

## Setiap rilis berikutnya
1. Naikkan `CACHE` di service-worker.js (misalnya tbsm-v22).
2. Ganti `?v=23` di index.html dengan nomor yang sama.

## LKPD Praktik per kelas (pengganti Unit Ujian)
- Dasbor: bagian **LKPD praktik** berisi Kelas X, XI, XII. Beranda juga menghitung modul LKPD per kelas.
- Daftar kartu per kelas, seperti Unit Ujian: judul, unit, durasi, jumlah langkah dan soal, kode SKKNI, status Kompeten atau Belum kompeten memakai KKM aplikasi.
- Siswa hanya melihat modul terbit untuk kelasnya. Statusnya ikut nilai koreksi guru bila sudah ada.
- Guru dan admin: Buka modul, Pratinjau, Edit, Terbitkan atau Jadikan draft, Modul baru (kelas terisi sesuai kelas yang dibuka), Rekap kelas.
- Unit Ujian lama masih ada di dasbor bagian Lainnya, dengan pilihan kelas di atas daftarnya, sampai Anda siap menghapusnya.

## Timer LKPD dan footer (cache tbsm-v22)
- Footer LKPD kini tiga baris: waktu dan tombol Mulai/Jeda/Lanjut, empat penanda progres (K3, Langkah, Periksa, Soal), lalu Simpan draf, Kirim LKPD, Cetak.
- Timer sama seperti Unit Ujian: hitung maju, mulai otomatis saat siswa mulai mengisi, merah bila melewati target menit modul.
- Waktu tersimpan per siswa dan modul, tahan reload, berhenti saat keluar dari modul, dan dicatat saat LKPD dikirim (tampil sebagai "Waktu" di Detail dan masuk kolom detik di tabel hasil).
