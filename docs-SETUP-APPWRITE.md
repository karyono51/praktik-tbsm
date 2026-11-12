# Membuat database Appwrite dari HP (Termux)

Aplikasi sudah terhubung ke project `6af2a76d00199ba40ab0` (lihat `js/config.js`). Yang belum ada hanya database dan koleksinya. Skrip `tools/setup-appwrite.mjs` membuat semuanya dari `appwrite.json`, tanpa Appwrite CLI.

## 1. Buat API key (sekali pakai)
Appwrite Console (Chrome, aktifkan *Situs desktop*) > project **Uji Praktik TBSM** > **Overview** > **Integrations** > **API keys** > **Create API key**.
- Nama: `setup`. Expiration: 1 day.
- Scope yang dicentang (kalau ada pilihan "select all", boleh dipakai untuk key 1 hari ini; `databases.read` dan `databases.write` wajib): `databases.read`, `databases.write`, `collections.read`, `collections.write`, `attributes.read`, `attributes.write`, `indexes.read`, `indexes.write`.
- Salin secret-nya. Saat skrip meminta, key tidak akan tampil di layar. Jangan memotret atau membagikan layar yang menampilkan key. Jangan masukkan ke repo atau kirim ke siapa pun.

## 2. Jalankan di Termux
```
pkg install nodejs -y
cd ~/tbsm            # folder proyek (sesuaikan)
node tools/setup-appwrite.mjs --dry     # uji dulu, tidak mengirim apa pun
node tools/setup-appwrite.mjs           # tempel API key saat diminta
node tools/setup-appwrite.mjs --only=observasi   # bila hanya koleksi observasi yang belum ada
```
Atau: `APPWRITE_API_KEY=xxxx node tools/setup-appwrite.mjs`.
Skrip menunggu atribut siap (bisa 1 sampai 3 menit), lalu membuat indeks. Aman dijalankan ulang: yang sudah ada dilewati dan izin koleksi disamakan dengan `appwrite.json`. Setelah selesai, **hapus API key** di Console.

## 3. Daftarkan situs sebagai Web platform
Console > **Overview** > **Integrations** > **Platforms** > **Add platform** > **Web**. Hostname: `pakarmedina.github.io` (tanpa https dan tanpa nama repo). Tanpa ini login ditolak (error CORS atau "Invalid Origin").

## 4. Akun admin pertama
1. Buka aplikasi, ketuk **Belum punya akun? Daftar**, daftar dengan email admin di `ADMIN_EMAIL` (`js/config.js`). Email ini otomatis jadi Admin.
2. Console > **Auth** > **Users** > akun tadi > **Labels**: tambahkan `admin`. Untuk guru: label `guru`. Untuk yang boleh mengelola modul LKPD: `lkpdeditor`.
3. Akun lain: admin menambahkan lewat Kelola Akun atau impor Excel, lalu mereka mendaftar dengan email yang sama (`PENDAFTARAN_TERBUKA` masih `false`).

Label adalah izin di server. Tanpa label `admin`, ubah dan hapus data akan ditolak.

## 5. Uji
Masuk sebagai admin, tambah satu siswa, simpan satu nilai, muat ulang. Data harus tetap ada. Cek juga di Console > Databases > tbsm > koleksi `hasil`.
