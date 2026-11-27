# Pengamanan v73: pemeriksaan deploy, audit izin, foto kelompok

## Pemeriksaan otomatis sebelum deploy
GitHub Actions kini menjalankan tiga langkah sebelum Pages diterbitkan. Bila ada yang gagal, deploy dibatalkan dan versi lama tetap aktif.
1. `node tools/periksa.mjs`: sintaks semua JS (termasuk fungsi Appwrite dan alat), JSON valid, berkas yang dirujuk ada, skrip CDN memakai SRI, ikon manifest ada, dan **tidak ada rahasia ter-commit** (API key Appwrite, rahasia dan token Google, kunci privat).
2. `node tools/rilis.mjs`: versi berkas dari hash isi.
3. `node tools/audit-izin.mjs`: audit izin koleksi di `appwrite.json`. Gagal hanya bila muncul temuan baru di luar `tools/audit-izin.baseline.json`.
Ketiganya bisa dijalankan sendiri di Termux; hanya rilis yang menulis berkas (index.html dan service-worker.js).

## Hasil audit izin (8 temuan, semuanya diterima di baseline)
Penjelasan lengkap: `node tools/audit-izin.mjs --semua`. Audit membaca `CBT_AMAN` di `js/config.js`; bila `true`, yang dinilai adalah profil aman (`profilAman` di appwrite.json).
| Tingkat | Koleksi | Masalah | Hilang bila |
|---|---|---|---|
| Tinggi | `banksoal`, `soal_sesi` | Semua pengguna login membaca koleksi yang payload-nya memuat kunci jawaban. | Mode CBT aman aktif (`docs-CBT.md`) |
| Sedang | `soal_hasil` | Siswa membuat dokumen dengan bidang score/benar. | Mode CBT aman aktif |
| Sedang | `hasil`, `lkpd` | Siswa membuat dokumen dengan bidang nilai/koreksi (score, kompeten, koreksi, umpan, verifOleh, verifTs); bisa dipalsukan lewat API. | Koreksi dipindah ke koleksi khusus staf (belum dikerjakan) |
| Sedang | `akun` | Semua pengguna login membaca seluruh daftar akun, dan siswa boleh membuat dokumen `akun` dengan bidang `peran`. | Create diubah ke `label:admin` (lihat di bawah) |
| Rendah | `akun` | create(users) tanpa document security. | Sama |
Label Auth (`guru`, `admin`) tetap menentukan wewenang di server, jadi siswa tidak bisa membaca nilai siswa lain atau mengubah dokumen orang lain. Risiko di atas adalah pemalsuan milik sendiri, pembacaan kunci (mode biasa), dan pembacaan daftar akun.
Soal bawaan di berkas JS publik (`soal-tka.js`, `soal-lkpd/*.js`) kuncinya tetap terbuka; `docs-CBT.md` sudah menyebut soal bawaan tidak dipakai pada ujian mode aman.

## Langkah berikutnya, dari yang paling murah
1. **Aktifkan mode CBT aman** sesuai `docs-CBT.md` (fungsi dulu, lalu `CBT_AMAN:true`, lalu `--profil=aman`). Ini menutup temuan kunci dan `soal_hasil`.
2. **`akun`**: setelah akun admin pertama ada dan `PENDAFTARAN_TERBUKA:false`, ubah Create menjadi `label:admin`, lalu uji tambah akun oleh admin dan guru.
3. **Koreksi guru**: pindahkan `koreksi`, `umpan`, `verifOleh`, `verifTs` ke koleksi baru yang hanya bisa dibuat staf (`create(label:guru)`); siswa membaca lewat izin pemilik. Klien mengabaikan bidang itu di dokumen `lkpd` buatan siswa.
Setelah salah satu langkah dikerjakan, jalankan `node tools/audit-izin.mjs --terima` agar baseline merapikan temuan yang sudah hilang.
Bandingkan izin di server dengan `appwrite.json`: `node tools/audit-izin.mjs --server` (API key scope `databases.read` dan `collections.read`; hapus kuncinya setelah selesai).

## Foto kelompok UKK
Mode Latihan kelompok kini mencatat foto bukti untuk setiap anggota (izin baca milik anggota itu). Berkas di Drive diunggah sekali dan dipakai bersama (`ldUpload` memakai sidik jari isi foto). Hasil kelompok yang disimpan sebelum versi ini tetap hanya punya foto pada anggota pertama. Tanpa fungsi foto-drive (cadangan ke database), foto dicatat sebanyak jumlah anggota, jadi pasang fungsinya lebih dulu.
