# CBT online dari Bank soal

## Fitur
- **Token ujian** per sesi (guru bisa mengganti token), batas pelanggaran, dan aksi: peringatan, kunci, atau kirim otomatis.
- **Layar ujian CBT**: navigasi nomor, tanda ragu-ragu, layar penuh, penghitung pelanggaran, kunci layar.
- **Pantau** (tab guru): status siswa langsung, tambah waktu (+5/+15 menit atau semua), akhiri ujian, buka kunci, reset, nilai semua yang belum kirim.
- **Analisis**: tingkat kesukaran, daya beda, sebaran pilihan, ekspor Excel (rekap nilai, analisis butir, daftar hadir).
- **Cetak daftar hadir** dan berita acara.
- **Penilaian di server (CBT aman)**: kunci jawaban tidak pernah dikirim ke siswa.

## Dua mode
| Mode | `CBT_AMAN` | Kunci jawaban | Penilaian |
|---|---|---|---|
| Biasa | `false` | di payload soal | di peramban siswa |
| Aman | `true` | koleksi `soal_kunci` (khusus guru/admin) | fungsi server |

Mode biasa memakai token ber-hash; mode aman menyimpan token hanya di `soal_kunci`.

## Pemasangan mode aman
Paket gratis Appwrite hanya mengizinkan 2 fungsi (`akun-admin`, `foto-drive`), jadi kode CBT digabung ke `akun-admin`.

1. `node tools/gabung-cbt.mjs` (menyalin `cbt.js` dan `bawaan.json` ke `functions/akun-admin/src`).
2. Deploy ulang fungsi `akun-admin`. Tambahkan scope `databases.read`, `databases.write`, `users.read` (selain yang sudah ada). Timeout disarankan 30 detik.
3. `node tools/setup-appwrite.mjs` (membuat koleksi `soal_kunci` dan atribut `ext`, `stop`, `pb` pada `soal_run`).
4. Di `js/config.js` isi `CBT_AMAN:true` (`FN_CBT:'akun-admin'`). Jika punya slot fungsi ketiga, deploy `functions/cbt` dan isi `FN_CBT:'cbt'`.
5. `node tools/setup-appwrite.mjs --profil=aman` (siswa tidak lagi bisa menulis langsung ke `soal_hasil` dan `soal_run`).
6. `node tools/rilis.mjs` lalu deploy situs.

Urutan penting: fungsi dulu, baru `CBT_AMAN:true`, baru `--profil=aman`.

## Migrasi
Soal lama yang kuncinya ada di payload dipindahkan otomatis ke `soal_kunci` saat guru membuka Bank soal setelah mode aman aktif.

## Catatan
- Soal bawaan (60 soal TKA) **tidak dipakai** pada ujian mode aman, karena kuncinya ada di repositori publik. Pakai soal buatan guru. Latihan tetap boleh.
- Jika `js/soal-tka.js` berubah, jalankan lagi `node tools/gabung-cbt.mjs` dan deploy ulang.
- Pelanggaran dihitung dari perpindahan tab/keluar layar penuh; kunci dibuka guru lewat Pantau (menyetel `pb`).
- Jawaban dikirim berkala ke server; pengiriman akhir yang gagal disimpan di perangkat dan dicoba ulang.
- Kunci jawaban tetap perlu dijaga: jangan beri label guru kepada siswa.
