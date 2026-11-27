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

# Tambahan v70: jam global dan catatan ujian di server

## Langkah wajib sekali (di Termux, dari folder proyek)
Buat koleksi baru `soal_run`:
`node tools/setup-appwrite.mjs --only=soal_run`
Tanpa koleksi ini ujian tetap berjalan (jam server tetap dipakai dari sampel lain), tetapi jawaban belum disimpan ke server dan ujian belum bisa dilanjutkan di HP lain.

## Jam global
- Hitung mundur dan pembukaan/penutupan sesi memakai `Jam.now()` (jam server Appwrite), bukan jam HP.
- Selisih jam dihitung dari cap waktu server pada setiap penulisan data (mulai ujian, simpan jawaban, kirim hasil), dan dari header Date bila terbaca. Sampel dengan waktu tempuh terkecil dipakai.
- Jam monotonik perangkat dipakai di antara sampel, jadi memutar jam HP mundur tidak memperpanjang waktu. Memutar maju hanya memperpendek waktu sampai sampel berikutnya mengoreksi.
- Saat ujian berjalan ada satu penulisan ringan tiap sekitar 4 menit untuk menyegarkan jam.

## Catatan ujian di server (soal_run)
- Waktu mulai = `$createdAt` dokumen di server. Satu dokumen per siswa per sesi (ID tetap).
- Jawaban disimpan ke server 10 sampai 14 detik setelah ada perubahan, dan segera saat aplikasi disembunyikan atau ditutup.
- Membuka ujian di HP lain atau setelah data aplikasi terhapus melanjutkan ujian yang sama dengan waktu mulai dan jawaban yang sama.
- ID hasil ujian dibuat tetap dari catatan ini, sehingga hasil tidak bisa terkirim ganda.
- Jika server tidak terjangkau saat Mulai, ujian tetap dimulai dengan jam yang ada dan disinkronkan menyusul; bila ternyata sudah ada catatan lebih awal di server, waktu mulai mengikuti yang lebih awal.

## Yang masih perlu diketahui
- Siswa yang menghapus dokumen `soal_run` miliknya lewat API langsung (bukan lewat aplikasi) bisa mengulang; izin hapus bisa dicabut di Console bila perlu.
- Selama offline penuh, jam hanya bisa mengandalkan jam monotonik dan sampel terakhir.
