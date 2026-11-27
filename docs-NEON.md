# Neon untuk jalur panas CBT

Tiga koleksi yang paling banyak ditulis saat ujian dipindahkan ke Postgres Neon: `soal_run` (catatan ujian dan jawaban sementara), `soal_hasil` (nilai), dan `soal_kunci` (kunci soal, token, catatan tebakan token). Akun, login, LKPD, observasi, sesi, bank soal, foto, dan semua koleksi lain tetap di Appwrite. Tidak ada batas jumlah baca/tulis di Neon; yang dibatasi hanya jam komputasi, penyimpanan, dan transfer (cek halaman paket Neon).

Yang tetap memakai kuota Appwrite: satu eksekusi fungsi per simpan, mulai, dan kirim.

## Cara kerja
- Hanya untuk **mode CBT aman** (`CBT_AMAN:true`). Penilaian dan semua tulis siswa sudah lewat fungsi server. Mode biasa memerlukan siswa menulis langsung ke database, jadi `CBT_DB:'neon'` diabaikan bila `CBT_AMAN` bukan `true`.
- Fungsi `akun-admin` (kode `cbt.js` dan `neon.js`, hasil `node tools/gabung-cbt.mjs`) membaca dan menulis tiga koleksi itu ke Neon bila variabel fungsi `CBT_DB=neon` dan `NEON_URL` terisi. Kode CBT lainnya tidak berubah.
- Klien (`js/neon-db.js`) membungkus `Cloud.db`: tiga koleksi itu lewat aksi `dok` pada fungsi. Server memeriksa peran. Siswa hanya membaca catatan dan hasil miliknya; guru dan admin membaca dan menulis; `soal_kunci` hanya guru dan admin.
- Satu project Neon untuk semua jurusan: tiap baris menyimpan `sekolah` dan `prodi` (dari variabel fungsi `PRODI`, bawaan `tsm`). Filter per jurusan belum dipakai di tampilan; kolomnya disiapkan.

## Variabel
Fungsi `akun-admin` (Settings, Variables):

| Variabel | Isi |
|---|---|
| `NEON_URL` | connection string **pooled** (host berisi `-pooler`, berakhiran `sslmode=require`). Rahasia. Sudah Anda simpan. |
| `CBT_DB` | `neon` untuk aktif. Kosong atau `appwrite` = seperti semula. |
| `PRODI` | opsional, bawaan `tsm` (tkr, tkj, otkp untuk jurusan lain). |
| `CBT_LEGACY` | bawaan aktif. `0` mematikan pembacaan cadangan dari Appwrite. |
| `NEON_POOL` | opsional, maksimum sambungan per instans fungsi (bawaan 5). |

`js/config.js`: `CBT_DB:'neon'` dan `CBT_LEGACY:false` (cadangan Appwrite dimatikan; ubah ke `true` untuk menyalakan lagi).

## Urutan pasang (lakukan saat tidak ada ujian berjalan)
Ujian yang sedang berjalan saat peralihan tidak boleh dipindah di tengah; catatannya tetap di Appwrite dan ikut terbaca lewat cadangan, tetapi lebih aman memilih waktu tanpa ujian.

1. **Kode baru, belum aktif.** Jalankan `node tools/gabung-cbt.mjs`, unggah `functions/akun-admin` sebagai tar.gz (perintah build `npm install`, karena `pg` baru ditambahkan), lalu push situs seperti biasa. `CBT_DB` belum diisi, jadi semuanya berjalan seperti kemarin.
2. **Aktifkan di server.** Tambah variabel `CBT_DB=neon` di fungsi `akun-admin`, redeploy. Mulai saat ini fungsi memakai Neon.
3. **Siapkan dan uji.** Di CBT Online (akun admin) buka kartu **Neon**: tap **Siapkan tabel**, lalu **Uji sambungan**. Hasil yang benar: backend neon, ada jumlah baris tiga tabel (0 semua). Jika gagal, pesannya muncul di kartu (biasanya `NEON_URL` bukan yang pooled, atau belum redeploy).
4. **Salin data lama.** Tap **Salin data lama**. Kunci soal, hasil, dan catatan ujian lama disalin ke Neon dengan waktu aslinya. Aman diulang; yang sudah ada tidak ditimpa.
5. **Aktifkan di klien.** Ubah `CBT_DB:'neon'` di `js/config.js`, push. Siswa dan guru yang sudah membuka aplikasi mendapat versi baru setelah memuat ulang.
6. **Uji sebelum ujian sungguhan.** Buat sesi dengan soal buatan guru dan token, mulai dari HP siswa uji, jawab, kirim, lalu cek Pantau dan Hasil. Jalankan `node tools/uji-cbt.mjs` dan `node tools/uji-neon.mjs` bila mengubah kode.
7. **Matikan cadangan** (opsional, setelah semua data lama tersalin dan terlihat di Hasil): `CBT_LEGACY=0` di fungsi dan `CBT_LEGACY:false` di config.js. Ini menghemat satu pembacaan Appwrite per aksi.

## Kembali ke Appwrite
Ubah `CBT_DB` di fungsi menjadi `appwrite` (atau hapus) lalu redeploy; klien tidak perlu diubah karena aksi `dok` tetap bekerja lewat Appwrite. Data yang sempat ditulis di Neon tidak ikut kembali; ekspor Excel dari Hasil bila perlu.

## Batas dan catatan
- Hasil ujian lama di Appwrite tetap tampil selama `CBT_LEGACY` aktif; Neon menang bila ID sama. Hapus nilai menghapus di kedua tempat.
- Catatan ujian yang sedang berjalan di Appwrite saat peralihan dibaca lewat cadangan, tetapi pantauan dan "akhiri semua" hanya melihat catatan di Neon. Hindari peralihan di tengah ujian.
- Neon membuat komputasi tidur setelah 5 menit tanpa aktivitas; siswa pertama bisa terasa lebih lambat 1 sampai 2 detik. Bila batas bulanan paket gratis terlampaui, Neon menghentikan komputasi sampai bulan berikutnya. Pantau di dasbor Neon pada hari ujian.
- Uji otomatis memakai Postgres tiruan di memori (`tools/uji-neon.mjs`); SQL asli belum dijalankan di sana. Tombol **Siapkan tabel** dan **Uji sambungan** adalah pembuktiannya di Neon sungguhan.
- `neon-schema.sql` sama dengan tombol Siapkan tabel (dibuat dari `NEON_SKEMA`); boleh dijalankan manual di SQL Editor Neon.

## Menjaga CBT_DB saat push

`up.sh` membaca `CBT_DB` dari `js/config.js` di repo sebelum zip dipasang, lalu memulihkannya bila zip membawa nilai lain, sehingga `'neon'` tidak tertimpa. Untuk sengaja memakai nilai dari zip (misalnya kembali ke Appwrite): `CBT_DB_PAKSA=1 sh up.sh`.
