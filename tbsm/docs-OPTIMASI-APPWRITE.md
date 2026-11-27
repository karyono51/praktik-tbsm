# Optimasi penggunaan Database Reads Appwrite

## Perubahan pada paket optimasi 27 November 2026

### 1. Cache singkat dan deduplikasi `Cloud.list`

`js/core.js` kini menyimpan hasil `Cloud.list(koleksi, query)` selama 8 detik dan membagikan Promise yang sama untuk permintaan identik yang berjalan bersamaan. Ini mencegah komponen yang meminta koleksi/query sama pada saat render atau proses login memicu beberapa `listDocuments` yang identik.

Cache dibersihkan setelah `Cloud.flush()` dan penghapusan dokumen melalui `Cloud.remove()`. Penulisan langsung dari modul lain tetap dapat memiliki jeda cache maksimal 8 detik.

### 2. Pemindaian izin nilai tidak lagi berjalan setiap login

Sebelumnya `js/hasil-izin.js` menjadwalkan `beriIzin(true)` setiap kali staf login. Fungsi tersebut membaca seluruh `uid_map`, membaca seluruh `hasil`, lalu memeriksa dan memperbarui izin dokumen satu per satu.

Sekarang pemindaian otomatis dibatasi maksimal sekali setiap 24 jam per browser melalui localStorage key `tbsm-hasil-izin-scan-v2`. Cache pemetaan `uid_map` juga diperpanjang dari 60 detik menjadi 5 menit. Pemanggilan manual `window.hasilBeriIzin(true)` tetap tersedia untuk pemeliharaan setelah perubahan pemetaan akun.

**Dampak/kompromi:** izin baca untuk akun siswa yang baru dipetakan pada dokumen hasil lama mungkin baru diperbarui saat pemindaian terjadwal berikutnya. Hasil baru tetap menggunakan jalur `createOwned` dan pemetaan yang tersedia saat pembuatan. Jika perlu memperbaiki izin segera, jalankan `hasilBeriIzin(true)` dari konsol browser sebagai staf yang berwenang saat koneksi database tersedia.

### 3. Jalur CBT Neon tidak diubah

`CBT_DB:'neon'` dan `CBT_LEGACY:true` dipertahankan. Dokumen proyek menyatakan data CBT lama sudah disalin, tetapi paket source code tidak dapat membuktikan status aktual tabel Neon maupun variabel fungsi Appwrite. Karena itu fallback legacy **tidak dimatikan otomatis**. Setelah administrator memeriksa jumlah data lama dan baru di Neon, serta memastikan variabel fungsi `CBT_DB=neon`, barulah lakukan prosedur tahap akhir pada `docs-NEON.md` dengan mengatur `CBT_LEGACY=0` di fungsi dan `CBT_LEGACY:false` pada klien.

## Validasi yang dijalankan

- `node tools/periksa.mjs` — lulus.
- `node tools/audit-izin.mjs` — 6 temuan baseline diterima, 0 temuan baru.
- `node tools/uji-neon.mjs` — 51 lulus, 0 gagal.
- `node tools/uji-neon-klien.mjs` — 18 lulus, 0 gagal.

## Batas paket ini

- Tidak ada perubahan pada database Appwrite, izin koleksi, variabel fungsi, tabel Neon, atau akun.
- Tidak ada migrasi data yang dijalankan.
- Paket ini tidak dapat mengaktifkan kembali API Appwrite yang sedang ditangguhkan akibat kuota. Setelah kuota kembali tersedia atau paket/budget disesuaikan, pantau Database Reads pada siklus berikutnya.
- Optimasi berikutnya yang disarankan adalah mengukur permintaan per koleksi dan mengubah tampilan staf menjadi pemuatan data bertahap. Perubahan itu memerlukan audit seluruh pemakai `S.users`, `S.results`, dan `S.lkpd` agar rekap dan ekspor tidak kehilangan data.
