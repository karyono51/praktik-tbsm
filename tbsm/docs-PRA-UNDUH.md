# Pra-unduh soal

Siswa menyiapkan soal sesi di perangkatnya **sebelum** token dirilis dan ujian dimulai.

## Yang diunduh
- Gambar soal dan pilihan (dari Drive, disimpan di IndexedDB perangkat oleh `soal-gambar.js`).
- Salinan terbaru teks soal dari Bank soal (dimuat ulang bila salinan lebih dari 2 menit).
- **Kunci jawaban tidak pernah ikut.** Sesi manual: soal pilihan guru. Sesi acak: seluruh soal yang cocok untuk kelas dan mapel sesi (server tetap yang memilih sebagian saat Mulai).

## Cara kerja
- Kartu sesi siswa menampilkan status: **Soal siap**, **Belum lengkap** (dengan tombol Coba lagi), atau **Belum diunduh** (tombol Siapkan soal). Sesi tanpa gambar tidak menampilkan apa-apa.
- Unduh berjalan otomatis sejak `PRA_UNDUH_MENIT` menit sebelum sesi dibuka (bawaan 120, ubah di `js/config.js`; isi 0 untuk hanya dari tombol), dan diulang saat sinyal kembali.
- Menekan Mulai ujian dengan gambar yang belum lengkap: aplikasi menyelesaikan unduhan dulu (maksimal 25 detik) **sebelum** jam ujian berjalan.
- Status tersimpan per akun di perangkat (`tbsm-pra-<id akun>`).

## Yang tidak berubah
- Siapa yang boleh ikut, token, jadwal, ruang, dan pilihan soal tetap diputuskan server saat Mulai.
- Sinyal tetap perlu untuk Mulai, menyimpan, dan mengirim jawaban.
- Siswa sudah bisa membaca teks soal Bank soal sejak masuk (kunci tidak). Pra-unduh tidak menambah dan tidak mengurangi hal itu. Fungsinya mengurangi antrean unduh gambar saat ratusan siswa menekan Mulai bersamaan, dan menjaga ujian tetap utuh bila sinyal putus.

## Batasan
- Maksimal 250 gambar per sesi. Lebih dari itu ditandai Belum lengkap.
- Gambar yang belum diunggah ke Drive (penanda `tmp:`) tidak bisa diunduh siswa; unggah dulu lewat Ubah soal.
- Pantau guru belum menampilkan berapa siswa yang sudah siap (status hanya ada di perangkat siswa).

Uji: `node tools/uji-pra.mjs`. Tidak ada perubahan Appwrite dan fungsi `akun-admin`.
