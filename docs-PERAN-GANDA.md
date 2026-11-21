# Peran ganda dan batas kolom peran

**Gejala:** menambah peran (mis. Proktor) pada akun yang sudah Admin dan Guru langsung memunculkan "Sinkronisasi gagal ... Attribute "peran" has invalid type. Value must be a valid string and no longer than 16 chars". Akun menunggu sinkron terus.

**Penyebab:** peran ganda disimpan sebagai daftar dipisah koma di kolom `peran` koleksi `akun`. Kolom lama hanya 16 karakter, sedangkan `admin,guru,proktor` 18 karakter dan `admin,kepsek,guru,proktor,siswa` 31 karakter. Penyimpanan ke Appwrite ditolak, data tetap aman di perangkat.

**Perbaikan (sekali saja):**
1. Di folder proyek: `node tools/perbesar-peran.mjs` (API key dengan scope databases.read dan databases.write; key tidak disimpan). Skrip menaikkan ukuran kolom ke 64 karakter. Data tidak berubah. Dapat diuji dengan `--dry`.
   Cara lain: Appwrite Console, Databases, tbsm, koleksi akun, atribut peran, ubah Size menjadi 64.
2. Tunggu status atribut `available`, lalu di aplikasi tekan Segarkan data. Antrean yang menunggu sinkron terkirim otomatis.
3. Instalasi baru memakai `appwrite.json` yang sudah 64, jadi tidak perlu langkah ini.

**Sementara belum diperbesar:** kurangi peran akun sampai 16 karakter atau kurang (mis. Admin + Proktor = 13).

Log audit (`audit.peran`) hanya mencatat satu peran (admin, guru, atau proktor) sehingga tidak terdampak.
