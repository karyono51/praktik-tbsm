# Pindah ke project Appwrite baru dari nol

Project baru: **Pakar 1501**, ID `6b08f9a2001e88fb5ac6`, wilayah Singapore (`sgp`, endpoint tidak berubah).
Alasan: kuota "Database reads" project lama habis ("Database reads limit for the current billing cycle has been exceeded") dan login tertolak.

## Yang ikut pindah dan yang tidak
- Ikut: skema database `tbsm` (19 koleksi dari `appwrite.json`), kode aplikasi, fungsi `akun-admin` dan `foto-drive`, data CBT di Neon.
- Tidak ikut: data lama (akun, nilai, LKPD, observasi, PKL), akun login, dan label. Semua pengguna mendaftar ulang dengan email yang sama dengan daftar akun yang diimpor admin.
- Data CBT di Neon masih menunjuk ke ID akun lama. Bila ingin bersih, kosongkan tiga tabel CBT (`soal_run`, `soal_hasil`, `soal_kunci`) lewat konsol SQL Neon: `TRUNCATE soal_run, soal_hasil, soal_kunci;`. Hasil ujian lama ikut hilang, jadi ekspor Excel dari Hasil dulu bila perlu (login lama sedang tertolak, jadi ini mungkin hanya bisa dilakukan setelah pemulihan).

## Urutan (selesaikan 1 sampai 6 SEBELUM push)
Begitu zip dipush, situs langsung memakai project baru yang masih kosong, dan login gagal sampai semua langkah selesai.

1. **API key 1 hari.** Console project Pakar 1501 > Overview > Integrations > API keys > Create. Scope: `databases.read`, `databases.write`, `collections.read`, `collections.write`, `attributes.read`, `attributes.write`, `indexes.read`, `indexes.write`. Jangan dibagikan atau difoto.
2. **Buat database.** Di Termux, `cd ~/tbsm` lalu `node tools/setup-appwrite.mjs --dry` (uji), kemudian `node tools/setup-appwrite.mjs` dan tempel key. Hasil: database `tbsm` dengan 19 koleksi. Skrip membaca ID project dari `appwrite.json`, yang sudah menunjuk ke project baru.
3. **Platform Web.** Overview > Integrations > Platforms > Add platform > Web. Hostname: `karyono51.github.io` (tanpa https dan tanpa nama repo). Cek di GitHub Settings > Pages bila memakai domain lain. Tanpa ini login ditolak (CORS atau "Invalid Origin"). Hostname `localhost` boleh dibiarkan untuk uji.
4. **Fungsi `akun-admin`.** Functions > Create function, ID `akun-admin`, runtime Node.js 18+, unggah `akun-admin.tar.gz`, entrypoint `src/main.js`, build `npm install`. Execute access: Users. Timeout 30 detik. Scope: `users.read`, `users.write`, `databases.read`, `databases.write`, `documents.read`, `documents.write`. Variabel: `NEON_URL` (connection string pooled, sama seperti project lama), `CBT_DB=neon`, `CBT_LEGACY=0`, serta `PRODI` bila bukan `tsm`. Deploy, lalu jalankan `node tools/setup-appwrite.mjs --profil=aman`.
5. **Fungsi `foto-drive`.** ID `foto-drive`, unggah `foto-drive.tar.gz`, Execute access: Users, scope `users.read` dan `documents.read`. Variabel: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (nilai lama), dan `DB_ID=tbsm`. Kosongkan `DRIVE_FOLDER_ID` bila token memakai scope `drive.file`.
6. **Hapus API key** dari langkah 1.
7. **Push.** `sh tools/cadangan.sh buat`, lalu `sh up.sh "pindah project Appwrite"`. Setelah deploy hijau, muat ulang aplikasi dua kali.
8. **Admin pertama.** Buka aplikasi > Daftar dengan email `ADMIN_EMAIL` di `js/config.js`. Console > Auth > Users > akun itu > Labels: `admin`. Lalu impor akun guru dan siswa dari Excel (template di menu Akun); mereka mendaftar dengan email yang sama (`PENDAFTARAN_TERBUKA` tetap `false`).
9. **Neon.** Di CBT Online (admin) buka kartu Neon: Uji sambungan. Backend harus `neon` dan "Cadangan Appwrite: mati".

## Bila ID salah satu huruf
`node tools/pindah-project.mjs <ID-benar>` memperbaiki `js/config.js`, `appwrite.json`, dan dokumen setup, lalu `node tools/rilis.mjs`.

## Kembali ke project lama
Pulihkan dari tag cadangan (`sh tools/cadangan.sh` menampilkan caranya) atau jalankan `node tools/pindah-project.mjs 6af2a76d00199ba40ab0`, lalu push. Project lama baru bisa dipakai lagi setelah kuotanya direset atau paketnya dinaikkan.

## Batas
Paket Free di project baru punya batas pembacaan yang sama. Pantau lewat kartu "Penggunaan database perangkat ini" di Cek sinkronisasi dan Usage di Console. Pembacaan bertahap (#456) dan penghitung `DB_BATAS_BACA` ada untuk menjaganya.
