# Pengamanan v72

## Yang diubah di kode
1. **`uid_map` lewat aksi `claim` di fungsi `akun-admin`.** Email diambil server dari akun Auth pemanggil, bukan dari kiriman siswa, jadi siswa tidak bisa lagi memetakan dirinya ke akun siswa lain (celah pembacaan nilai teman). Klien (`js/hasil-izin.js`) memanggil fungsi; bila fungsi belum diperbarui (galat 403/400/404) memakai cara lama.
2. **Durasi ujian dari sesi guru.** Saat ujian dilanjutkan dari server (`js/ujian-server.js`), durasi dan KKM diambil dari `soal_sesi`, bukan dari payload `soal_run` yang bisa diubah siswa lewat API.
3. **`appwrite.json`:** izin Create `users` pada `uid_map` dicabut. Hanya fungsi (API key) yang menulis.
4. **`tools/hitung-sri.mjs`:** menambahkan `integrity` (SRI sha384) dan `crossorigin` ke skrip CDN di `index.html`.

## Urutan pemasangan (jangan dibalik)
1. **Perbarui fungsi `akun-admin`** (paket Free hanya boleh 2 fungsi, jadi pemetaan digabung ke sini sebagai aksi `claim`): Functions > akun-admin > Deployments > buat deployment baru dari folder `functions/akun-admin` (`src/main.js`, `package.json`). Settings > Scopes: tambahkan `databases.read` dan `databases.write` (selain `users.read`, `users.write`). Execute access tetap **Users**. Deploy.
2. **Deploy zip v72** (git push), buka aplikasi dengan menu Perbarui aplikasi.
3. **Uji:** login sebagai satu siswa. Di Console, koleksi `uid_map` harus memuat dokumen dengan ID login siswa itu, `sid` dan `email` sesuai akunnya.
4. **Cabut izin create** di koleksi `uid_map` (Console > Settings > Permissions, hapus Create `users`), atau `node tools/setup-appwrite.mjs --only=uid_map --sync-izin`.
5. **Hapus dokumen `uid_map` lama** yang mencurigakan (`sid` tidak cocok dengan emailnya); dokumen sah akan terbentuk ulang lewat fungsi saat siswa login.
6. **SRI** (Termux, perlu internet): `node tools/hitung-sri.mjs`, buka aplikasi dan pastikan semua fitur jalan (login, Excel, PDF), lalu push. Bila ada skrip yang gagal dimuat, kembalikan `index.html` dengan `git checkout index.html`.

## Langkah di Appwrite Console (tidak bisa lewat kode)
- **Tutup pendaftaran publik** di Auth: batasi jumlah pengguna ke angka kecil di atas jumlah akun sekarang, dan buat akun baru lewat Kelola Akun/impor (fungsi `akun-admin`). Tanpa ini, orang luar tetap bisa mendaftar lewat API dan membaca `akun`, `banksoal`, dan `soal_sesi`.

## Yang belum tertutup
- Penilaian ujian dan kunci jawaban masih di perangkat siswa. Penutup penuh: Function penilai yang menilai dari jawaban `soal_run`, memeriksa waktu terhadap jam server, dan menulis `soal_hasil` sendiri.
- Izin baca `akun` untuk semua pengguna login.
