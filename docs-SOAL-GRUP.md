# Soal grup (satu stimulus untuk beberapa soal)

Satu stimulus (teks bacaan, data, atau gambar) dipakai beberapa soal berurutan. Berlaku di **Bank soal** dan **kuis Editor LKPD**.

## Guru: Bank soal
1. Tambah atau ubah soal sendiri. Di bagian **Stimulus bersama**, pilih *Buat stimulus baru*, lalu isi teks dan/atau gambar.
2. Untuk soal berikutnya, pilih stimulus yang sama dari daftar (daftar menurut mapel yang diisi).
3. Mengubah teks atau gambar stimulus di satu soal ikut mengubahnya di semua soal grup itu saat **Simpan soal**.
4. Pilih *Tanpa stimulus* untuk melepas soal dari grup. Soal bawaan tidak bisa dijadikan grup (salin dulu lewat *Salin dan ubah*).

## Guru: Editor LKPD, tab Soal
Buka soal, lalu pilih **Stimulus bersama**: *Buat stimulus baru* atau *Pakai stimulus soal no. N*. Teks yang diketik langsung berlaku untuk semua soal dalam grup. Letakkan soal-soal satu grup berurutan (gunakan tombol Naik/Turun). Grup tanpa isi stimulus tidak bisa disimpan.

## Siswa
- Kuis LKPD: stimulus tampil sekali di atas deretan soal grup, dengan keterangan "untuk soal no. a-b". Juga tampil di pembahasan. Gambar stimulus bisa diketuk untuk diperbesar dan ikut diunduh untuk offline.
- Ujian dan latihan Bank soal (satu soal per layar): stimulus tampil di atas setiap soal grup.

## Ujian dan pengacakan
Anggota grup selalu berdampingan dan urut menurut nomor dalam grup. Pengacakan memindahkan grup sebagai satu blok. Bila jumlah soal membatasi pilihan, grup diambil utuh selama masih muat; soal tunggal dipakai lebih dulu untuk mengisi sisa, dan grup baru terpotong hanya bila tidak ada soal tunggal lagi.

## Cetak soal
Stimulus tercetak sekali di atas deretan soal grup per bagian (PG, PG kompleks, PG kategori), dengan keterangan "Bacalah stimulus berikut untuk soal nomor a sampai b". Bila satu grup berisi beberapa jenis soal, stimulusnya tercetak di tiap bagian tempat anggotanya muncul.

## Data
Tiga kolom opsional pada soal: `gs` (penanda grup), `st` (teks, maksimal 3000 karakter), `si` (gambar stimulus, `drive:<id>`). Bank soal juga memakai `gn` (urutan dalam grup). Disimpan di dalam `payload` yang sudah ada, jadi **tidak ada perubahan skema Appwrite dan tidak ada perubahan fungsi server**. Gambar stimulus memakai fungsi `foto-drive` yang sama dengan gambar soal.

## Excel
Sheet Soal (Bank soal dan LKPD) punya dua kolom di ujung: **Grup** dan **Stimulus**. Baris dengan kode Grup yang sama (misalnya G1) menjadi satu grup, berurutan menurut urutan baris. Isi Stimulus di salah satu baris (atau samakan bila diisi di beberapa baris); stimulus berbeda dalam satu grup ditolak. Kode yang sama dipakai ulang pada impor berikutnya (di Bank soal: untuk mapel yang sama; di LKPD: dalam modul yang sama), dan grup yang sudah punya gambar stimulus mempertahankan gambarnya. Ekspor menulis stimulus di baris pertama tiap grup, dan hasil ekspor bisa diimpor ulang. Kolom Grup kosong tidak mengubah keanggotaan grup soal yang sudah ada. Template Excel sudah memuat kedua kolom.

## Batasan
- Gambar stimulus tidak ikut Excel; tambahkan lewat form Ubah soal (Bank soal) atau Editor LKPD.
- Penilaian tidak berubah: tiap soal dinilai sendiri.

## Analisis butir soal (butir.js)
- **Bank soal:** tiap soal sendiri menampilkan tingkat kesukaran (p) dan daya pembeda (DB) dari semua hasil ujian yang memuat soal itu (latihan tidak dihitung), plus peringatan *Periksa kunci* bila DB negatif. Label baru muncul bila pengerja minimal 10. Filter **Statistik ujian** di daftar Bank soal: Sukar, Mudah, Daya beda rendah atau bermasalah, Belum ada data ujian. Filter ikut ke cetak soal.
- **LKPD:** halaman Analisis per modul menambah daya pembeda per soal (kelompok atas dan bawah 27% menurut skor total kuis) dan kolomnya di Excel.
- Ambang sama dengan Analisis sesi: p Sukar di bawah 0,30, Mudah 0,70 ke atas; DB Baik 0,40 ke atas, Cukup 0,20, Perlu revisi 0, Bermasalah di bawah 0. DB butuh minimal 6 pengerja.
