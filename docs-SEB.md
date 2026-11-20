# Integrasi Safe Exam Browser (SEB)

## Yang sudah ada di aplikasi
- **Pengenalan SEB**: UserAgent SEB (`SEB/` di Windows dan macOS, `SEB_iOS` di iPad/iPhone) atau objek `SafeExamBrowser` dikenali. Di SEB layar penuh tidak diwajibkan (SEB sudah mode kios) dan tampilan ujian memakai mode terkunci seperti Exambro. Penanda dapat diubah di `js/config.js` (`SEB_UA`).
- **Sesi ujian, kotak "Wajib Safe Exam Browser (SEB)"**: siswa hanya bisa memulai dari SEB. Di luar SEB tampil pesan, dan server juga menolak (mode CBT aman).
- **Verifikasi Config Key di server** (jauh lebih kuat dari UserAgent): SEB menghitung hash `SHA-256(alamat halaman + Config Key)`; klien mengirimnya saat mulai, server mencocokkan dengan Config Key sekolah. Siswa tidak bisa memalsukannya tanpa Config Key.
- Kotak "Wajib Exambro" sudah dihapus dari form sesi. Menyimpan ulang sesi lama otomatis mematikan syarat Exambro-nya.

- **Keluar SEB otomatis**: setelah jawaban ujian terkirim, layar hasil memuat tombol "Selesai dan keluar dari SEB". Tombol membuka alamat keluar (`?s=medina&selesai=1` atau `?s=df&selesai=1`), sama dengan `quitURL` di file .seb, sehingga SEB menutup diri tanpa kata sandi keluar. Tombol hanya muncul di SEB, untuk hasil ujian (bukan latihan) yang baru dikirim, dan meminta konfirmasi. Bila SEB tidak menutup sendiri, pengawas memakai kata sandi keluar. Alamat dapat ditimpa lewat `SEB_KELUAR` di `js/config.js`. Syarat: file .seb dibuat dengan `buat-seb.mjs` (quitURL terisi dan `allowQuit` aktif); jika file diubah di Config Tool, jangan hapus quitURL.

## Langkah pasang
1. **Buat file konfigurasi**: `node tools/buat-seb.mjs https://ALAMAT-APLIKASI --keluar=SANDI --nama=Ujian-TBSM`
2. Buka `Ujian-TBSM.seb` di **SEB Config Tool**, periksa (mis. URL filter, tombol reload), lalu **Simpan**. Config Key tampil di tab *Exam*. Salin (64 karakter heksadesimal).
3. **Server**: pada fungsi yang melayani CBT (`akun-admin` bila FN_CBT = 'akun-admin') tambah variabel lingkungan `SEB_CONFIG_KEYS` = Config Key tadi (boleh beberapa, dipisah koma, mis. per versi file). Opsional `SEB_BEK` (Browser Exam Key) dan `SEB_UA`.
4. Jalankan `node tools/gabung-cbt.mjs`, lalu **deploy ulang** fungsi.
5. Buat sesi ujian, centang **Wajib Safe Exam Browser**. Bagikan file `.seb` ke siswa (komputer pakai SEB 3.x, iPad pakai SEB iOS), siswa membuka file itu, lalu masuk dan mulai ujian.

## Catatan penting
- **Ubah file .seb apa pun (bahkan satu opsi) = Config Key berubah.** Setelah itu perbarui `SEB_CONFIG_KEYS`.
- Tanpa `SEB_CONFIG_KEYS` server hanya memeriksa UserAgent. Itu penghalang ringan, bisa dipalsukan.
- Config Key dihitung dari alamat halaman. Pastikan alamat mulai di file .seb sama dengan alamat yang dibuka siswa (domain yang sama).
- Android tidak punya SEB resmi untuk ujian ini. Tetap gunakan Exambro di sana.
- Uji dulu dengan satu siswa percobaan sebelum hari ujian.

## Pemantauan siswa yang ditolak SEB (v82)
- Setiap kali siswa ditolak server pada sesi Wajib SEB, server mencatat nama, kelas, jumlah percobaan, dan **alasannya**: `bukan dibuka dari SEB` (UserAgent) atau `Config Key tidak cocok` (juga `Browser Exam Key tidak cocok` bila SEB_BEK diisi).
- Tab **Pantau** menampilkan kartu "Perlu perhatian" bila ada siswa yang belum mulai dan ditolak dalam 15 menit terakhir, lengkap dengan petunjuk perbaikan (Config Key: periksa file .seb sekolah yang benar, SEB_CONFIG_KEYS, dan deploy ulang fungsi).
- Catatan disimpan di koleksi `soal_kunci` (dokumen `si_...`, tanpa skema baru), paling banyak 100 siswa terbaru per sesi, satu tulisan per siswa tiap 15 detik. Gagal menulis tidak mengubah hasil penolakan.
- Aksi server baru `sebTolak` (guru, admin, proktor; proktor hanya melihat siswa ruangnya). **Fungsi akun-admin harus di-deploy ulang** agar aksi ini dikenali.
