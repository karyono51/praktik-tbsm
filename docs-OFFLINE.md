# Offline, antrean sinkron, pencegahan data ganda, monitoring database

## Alur data
Data baru dibuat di perangkat, ditandai belum terkirim, disimpan di localStorage (`tbsm-queue`), lalu dikirim ke Appwrite oleh `Cloud.flush` (`js/pwa.js`). `js/sinkron-cepat.js` memberi batas waktu 20 detik per permintaan dan percobaan ulang bertahap 2, 4, 8, 16, 32, maksimal 60 detik (acak 70 sampai 130 persen). Kirim ulang otomatis saat online, saat aplikasi difokuskan, dan tiap 3 detik bila masih ada sisa.

## Yang ditambahkan (27 November 2026)
- **Data ganda**: catatan hasil atau LKPD yang belum terkirim dan identik (pemilik, soal, waktu, skor) dijadikan satu sebelum dikirim, mis. tombol simpan ditekan dua kali. Catatan yang sudah ada di server tidak pernah dihapus dari daftar. ID yang sama di server (409, termasuk respons yang hilang setelah server menerima) diubah menjadi pembaruan, jadi tidak ada dokumen ganda.
- **ID tidak sah**: ID yang ditolak Appwrite dari awal ditandai `bad` dan tidak dicoba tanpa akhir. Terlihat di Cek sinkronisasi sebagai angka "ID tidak sah".
- **Penyimpanan penuh**: bila localStorage menolak menyimpan antrean, muncul peringatan (sebelumnya diam).
- **Penyimpanan persisten**: aplikasi meminta `navigator.storage.persist()` agar peramban tidak membuang antrean offline saat ruang menipis.
- **Monitoring database** (`js/pantau-db.js`): dokumen dibaca, ditulis, dihapus per koleksi per hari di perangkat ini, 14 hari terakhir, tampil di Cek sinkronisasi. Batas peringatan opsional lewat `DB_BATAS_BACA` di `js/config.js` (peringatan sekali per hari di 80 persen).
- `can()` tidak lagi galat untuk peran yang belum punya daftar izin.

## Pemulihan koneksi putus
Antrean pulih dari localStorage setelah aplikasi ditutup dan dibuka lagi (`restorePending`). Saat tidak ada internet, aplikasi membuka salinan terakhir (`loadSnap`). Cangkang aplikasi dibuka dari service worker; data Appwrite tidak pernah di-cache oleh service worker.

## Batas yang perlu diketahui
- Penghitung monitoring hanya dari perangkat ini. Total proyek: konsol Appwrite, Usage.
- Jika peramban menghapus data situs sebelum antrean terkirim, data itu hilang. Pasang aplikasi ke layar utama (PWA) dan minta siswa menekan Kirim sekarang di Cek sinkronisasi sebelum menutup.

## Uji
- `node tools/uji-offline.mjs` : 39 pemeriksaan (kirim, 409, putus lalu pulih, respons hilang, ganda, ID tidak sah, offline dan buka ulang, penyimpanan penuh, monitoring).
- `node tools/uji-beban.mjs` : 1500 data dengan 15 persen gagal acak; 60 perangkat dengan batas 40 serentak; 120 siswa selesai ujian bersamaan, separuh offline.
