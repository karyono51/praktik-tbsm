# Koleksi akun tertutup untuk siswa

Sebelumnya semua pengguna login boleh membaca dan membuat dokumen `akun`, karena klien mencari profil sendiri saat login. Akibatnya siswa yang membuka API langsung bisa membaca nama, email, peran, dan kelas semua akun.

## Yang berubah
- `functions/akun-admin`: aksi baru **`profil`** (semua pengguna login). Server mengambil email dari akun Auth pemanggil, lalu mengembalikan dokumen `akun` miliknya. Email belum terdaftar: 404. Akun nonaktif: 403. Dokumen hanya dibuat otomatis untuk email admin pertama, bila variabel fungsi `ADMIN_EMAIL` diisi (opsional).
- `js/core.js`: `Cloud.resolve` memanggil fungsi itu lebih dulu. Fungsi versi lama atau belum dipasang (403/400/404 tanpa pesan "belum terdaftar"): kembali ke cara lama. Galat server 5xx: login berhenti dengan pesan coba lagi.
- `appwrite.json`, koleksi `akun`: create `label:admin`; read `label:guru` dan `label:admin`; update dan delete `label:admin`. Siswa tidak membaca atau membuat.
- Pendaftaran akun hanya lewat admin (impor atau Kelola Akun). `PENDAFTARAN_TERBUKA` tetap `false`.

## Urutan pasang (jangan dibalik)
1. Pasang ulang fungsi `akun-admin` (scope tetap `users.read`, `users.write`, `databases.read`, `databases.write`). Opsional: tambah variabel `ADMIN_EMAIL` berisi email admin pertama.
2. Push aplikasi (`sh up.sh`), tunggu Actions hijau, ketuk Perbarui aplikasi, uji login siswa dan guru.
3. Setelah login siswa dan guru berhasil, ubah izin koleksi `akun`: lewat `node tools/setup-appwrite.mjs --only=akun` dengan API key sementara, atau manual di Console > Databases > akun > Settings > Permissions.
4. Uji lagi: siswa login normal; di API langsung, siswa mendapat 401 saat membaca `akun`.

Kalau langkah 3 dikerjakan sebelum 1 dan 2, login siswa gagal. Pemulihan cepat: kembalikan izin `Users` untuk Create dan Read di koleksi `akun`.

## Admin pertama (proyek baru)
Buat pengguna admin di Console > Auth > Users dan beri label `admin` sebelum login pertama, atau isi `ADMIN_EMAIL` di fungsi. Tanpa salah satunya, dokumen akun admin tidak bisa dibuat.

Uji: `tools/uji-profil-fungsi.mjs` (8), `tools/uji-hak-akses.mjs`.
