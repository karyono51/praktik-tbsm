# Rilis produksi: cadangan, uji, deploy, rollback

## 1. Cadangan (sebelum push)
```
cd ~/tbsm
sh tools/cadangan.sh buat
```
Membuat tag `cadangan-<tanggal-jam>`, mengirim tag ke GitHub, dan menyimpan zip kode di `~/cadangan-tbsm/`. Data Appwrite dan Neon tidak ikut tercadangkan oleh langkah ini; ekspor dari konsol Appwrite atau Neon bila perlu.

## 2. Uji seluruh fitur
```
node tools/regresi.mjs
```
Menjalankan rilis --cek, periksa, audit-izin, dan semua `tools/uji-*.mjs` (termasuk uji-offline, uji-beban, uji-hak-akses). Harus berakhir "Regresi bersih". Tambahkan `--cepat` untuk melewati uji beban.

Uji manual di HP setelah deploy (lima menit):
1. Login Admin: Bank soal, CBT Online, Akun, LKPD, PKL, Cek sinkronisasi terbuka dan berisi data.
2. Login Guru: nilai dan observasi ada, menu Akun dan Hapus tidak ada.
3. Login Siswa: hanya menu siswa; kerjakan satu latihan.
4. Matikan data seluler, simpan satu hasil, nyalakan lagi: Cek sinkronisasi menunjukkan 0 menunggu.
5. Cek sinkronisasi, kartu "Penggunaan database": angka baca tampil.

## 3. Deploy
```
sh up.sh "pesan commit"
```
Tunggu run di GitHub Actions berwarna hijau. Buka aplikasi, muat ulang dua kali (service worker baru terpasang di muatan pertama, dipakai di kedua).

## 4. Rollback
Aplikasi berupa berkas statis, jadi rollback = mengembalikan berkas.
```
sh tools/cadangan.sh daftar
sh tools/cadangan.sh pulihkan cadangan-20261127-0905
```
Ini membuat commit baru yang isinya sama dengan tag, lalu push dan deploy ulang. Riwayat tidak dihapus, jadi pemulihan bisa dibatalkan. Setelah deploy, muat ulang dua kali.

Yang tidak ikut kembali: skema, izin, dan variabel fungsi di Appwrite, tabel Neon, dan data. Paket ini tidak mengubah semuanya itu, jadi rollback kode aman. Untuk rilis yang mengubah skema, ekspor datanya lebih dulu.

## 5. Catatan perubahan rilis ini
Lihat bagian teratas `CHANGELOG.md`. Perubahan kode: `js/pwa.js`, `js/core.js`, `js/pantau-db.js` (baru), `js/config.js` (komentar). Dokumen: `docs-OFFLINE.md`, `docs-HAK-AKSES.md`.

## 6. Sebelum menutup fallback CBT
`CBT_LEGACY` masih `true`. Matikan (`false` di klien dan `CBT_LEGACY=0` di fungsi) hanya setelah jumlah data lama dan baru di Neon dicocokkan; lihat `docs-NEON.md`.
