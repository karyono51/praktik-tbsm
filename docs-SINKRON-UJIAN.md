# Sinkron saat ujian (v69)

## Temuan pada versi sebelumnya
1. Hasil ujian (soal_hasil) hanya masuk antrean bila perangkat offline. Galat server seperti 429 (terlalu banyak permintaan) atau 5xx hanya menampilkan pesan dan data tidak dikirim ulang.
2. Tidak ada percobaan ulang otomatis; hanya saat perangkat kembali online atau saat Segarkan ditekan.
3. Permintaan tanpa batas waktu: koneksi macet membuat flush menggantung dan penanda `busy` tidak pernah dilepas, sehingga sinkron berikutnya tidak berjalan.
4. Layar hasil baru tampil setelah pengiriman selesai, jadi siswa melihat layar membeku bila jaringan lambat.
5. Waktu ujian habis bersamaan membuat semua perangkat mengirim pada detik yang sama.
6. Data yang dibuat saat flush sedang berjalan bisa tertinggal; perubahan saat pengiriman bisa tertimpa penanda `d=0`.
7. Pengiriman satu per satu, bank soal dibaca berurutan (3 koleksi), halaman daftar hanya 100 dokumen.

## Perbaikan
- Batas waktu 20 detik per permintaan (40 detik untuk daftar), dianggap galat sementara.
- Percobaan ulang otomatis tiap 3 detik dengan jeda bertahap 2, 4, 8, 16, 32, maksimal 60 detik, ditambah variasi acak. Segera dicoba lagi saat online, aplikasi dibuka kembali, atau jendela fokus.
- Galat sementara (jaringan, 401, 408, 425, 429, 5xx) selalu masuk antrean. Galat permanen (400, 403, 404) ditandai dan tidak diulang terus.
- Data bank soal yang belum terkirim dimasukkan kembali ke antrean otomatis.
- Layar hasil tampil langsung; pengiriman berjalan di latar belakang dan catatan "Menunggu terkirim" hilang sendiri setelah berhasil.
- Pengiriman otomatis saat waktu habis diberi jeda acak 0 sampai 4 detik.
- Sinkron umum 4 item sekaligus, urutan: hasil, LKPD, observasi, akun, foto bukti. Penanda `d` aman terhadap perubahan saat pengiriman.
- Bank soal dibaca paralel, halaman daftar 500 dokumen.

## Saran saat hari ujian
- Buka aplikasi dan login di semua perangkat sebelum ujian, saat jaringan masih lega, agar soal dan sesi sudah termuat dan berkas aplikasi ter-cache.
- Jangan memperbarui aplikasi di tengah ujian.
- Setelah ujian, guru memeriksa panel Cek sinkronisasi; siswa yang masih "menunggu sinkron" cukup membiarkan aplikasi terbuka dengan internet aktif.
