# Pembatas tebakan token berlapis

Menggantikan pembatas lama (10 salah per 5 menit, hanya di memori satu instans fungsi). Pembatas lama tetap berjalan sebagai lapisan cadangan.

## Aturan
- **Per akun per sesi:** 10 token salah dalam 5 menit memicu blokir bertahap.
  - Tingkat 1: diblokir 5 menit. Tingkat 2: 15 menit. Tingkat 3: **terkunci** sampai guru/proktor membukanya.
  - Blokir berlaku walau token yang dikirim berikutnya benar.
- **Per sesi:** bila ada lebih dari 100 token salah dalam 5 menit di satu sesi, akun yang sudah salah 3 kali atau lebih langsung naik satu tingkat blokir. Akun yang belum pernah salah tidak terpengaruh, jadi satu siswa iseng tidak bisa mengunci seluruh kelas.
- Token benar menghapus catatan salah akun itu.
- Disimpan di database (koleksi `soal_kunci`, dokumen `tz_...` dan indeks `ti_...`), jadi tahan restart fungsi dan banyak instans. **Tidak ada koleksi atau atribut baru.**
- Bila database gagal dibaca atau ditulis, ujian tetap berjalan dengan pembatas memori lama (gagal-buka, bukan gagal-tutup).

## Untuk pengawas
- Kartu **Salah token** muncul otomatis di Ruang ujian (proktor) dan Pantau (guru/admin) bila ada siswa yang salah token pada sesi yang dibuka. Diperbarui tiap 8 detik.
- Status: `Salah ×n`, `Diblokir m:dd`, atau `Terkunci`. Tombol **Buka** (satu siswa) dan **Buka semua**.
- Proktor beruang hanya melihat dan membuka siswa di ruang yang ia awasi.
- Log audit: `token.blokir` (otomatis, dengan tingkat) dan `token.bukaTebak` (siapa yang membuka).

## Pasang (di luar jam ujian)
1. Deploy ulang fungsi **akun-admin** (`cbt.js` berubah). Bila memakai fungsi `cbt` terpisah, deploy keduanya.
2. `sh up.sh "pembatas token"`, tunggu deploy hijau, ketuk Perbarui aplikasi dan Segarkan.
3. Tidak perlu `setup-appwrite`.

## Batasan
- Daftar di kartu memuat maksimal 50 akun per sesi (yang diblokir dipertahankan paling akhir).
- Pembacaan dan penulisan indeks sesi tidak atomik. Bila banyak siswa salah bersamaan, hitungan agregat sesi bisa sedikit kurang; hitungan per akun tetap terpisah.
- Tebakan paralel dari satu akun dalam hitungan milidetik bisa lolos beberapa percobaan sebelum blokir tercatat. Dengan 1 miliar kemungkinan token dan masa berlaku token yang pendek, risikonya sangat kecil.
- Ini menahan tebakan dan membuat percobaan mencurigakan terlihat. Ini **tidak** mencegah token yang dibagikan siswa lewat pesan.

## Uji
`node tools/uji-cbt.mjs` (bagian "Pembatas tebakan token berlapis") dan `node tools/uji-tebak.mjs`.
