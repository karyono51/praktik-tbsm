# Laporan Verifikasi — Editor LKPD Guru

## Pemeriksaan otomatis yang berhasil

- Seluruh berkas JavaScript (`js/*.js` dan `service-worker.js`) lolos `node --check`.
- `appwrite.json` lolos validasi JSON.
- Uji unit Node VM: membuat modul X-2, memvalidasi skema, memuat modul ke registry, menampilkan daftar Editor Guru, merender konten siswa, menyembunyikan draft dari siswa, menonaktifkan tombol pengumpulan pada pratinjau, dan menolak bobot rubrik yang tidak berjumlah 100%.
- Uji sinkronisasi Appwrite tiruan: modul terbit dikirim ke koleksi `lkpd_modules`, flag antrean berubah menjadi tersinkron, dan izin baca pengguna login disertakan.
- Uji integritas ZIP sumber sebelumnya berhasil sebelum ekstraksi.

## Belum dapat diverifikasi

- Uji browser end-to-end pada Chromium tidak dapat dijalankan di lingkungan kerja ini karena kebijakan lingkungan memblokir navigasi ke `localhost` maupun `file://`. Karena itu interaksi UI di browser nyata belum dinyatakan lulus.
- Tidak dilakukan deployment ke project Appwrite sebenarnya. Pembuatan koleksi, label `lkpdeditor`, autentikasi, izin per dokumen, dan sinkronisasi online harus diuji pada project sekolah sebelum digunakan.
- Uji multi-pengguna/perangkat dan uji offline PWA secara fisik belum dilakukan.

## Checklist uji setelah deployment

1. Login sebagai admin/guru berlabel `lkpdeditor`; buat modul draft, edit, duplikasi, pratinjau, terbitkan, nonaktifkan, dan hapus.
2. Login sebagai siswa; pastikan hanya modul terbit/aktif terlihat dan semua operasi editor ditolak oleh Appwrite.
3. Buat pengumpulan siswa dan pastikan nilai tampil di menu Rekap nilai serta detail LKPD.
4. Matikan jaringan, edit modul yang sudah ada atau buat modul baru, pulihkan jaringan, lalu pastikan antrean sinkron selesai.
5. Uji perubahan draft menjadi terbit dan pastikan izin baca siswa ikut berubah.
6. Audit terpisah koleksi `lkpd` dan `hasil`; izin lama untuk data nilai siswa belum diperketat oleh iterasi ini.
