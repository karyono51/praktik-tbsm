# Rancangan: soal uraian (essay) di Bank soal dan CBT Online

Status: fase 1 dan fase 2 selesai (soal, jawab siswa, penilaian guru, nilai akhir, impor/ekspor Excel, cetak soal, status di rekap). Fase 3 belum (analisis butir uraian, penilaian ulang massal). Soal uraian hanya untuk ujian, bukan latihan.

## 1. Tujuan dan batas
- Tambah jenis soal **Uraian** untuk ujian sekolah dan latihan. Bukan bagian TKA: bentuk TKA resmi hanya PG, PG kompleks, PG kategori (Perkaban BSKAP 045/2025; kerangka asesmen TKA SMK/MAK 2026).
- Soal uraian **tidak pernah masuk simulasi TKA**. Sesi bertanda TKA menolaknya, dan soal uraian diberi label "Bukan bentuk TKA".
- Dinilai **manual oleh guru** memakai rubrik. Tidak ada penilaian otomatis.
- Tidak ada perubahan skema Appwrite: data masuk ke `payload` yang sudah ada (hasil: 100.000 karakter, soal_kunci: 12.000 karakter).

## 2. Data soal
Jenis baru `uraian` di `BS_TIPE` (label "Uraian"). Kolom soal:

| Kolom | Isi | Disimpan di |
|---|---|---|
| `q`, `mapel`, `topik`, `kelas`, `tujuan` | sama seperti soal lain | payload soal |
| `maks` | skor maksimum (angka bulat, 1 sampai 100) | payload soal |
| `bobot` | bobot terhadap nilai akhir, default 2 (soal objektif tetap 1) | payload soal |
| `pj` | batas panjang jawaban siswa, default 1500 karakter | payload soal |
| `rub` | rubrik: daftar `[kriteria, skor]`, jumlah skor = `maks` | **soal_kunci** (rahasia) |
| `kj` | kunci jawaban model / pedoman penskoran | **soal_kunci** (rahasia) |
| `bahas` | pembahasan untuk siswa | soal_kunci |

Rubrik dan kunci memakai jalur yang sama dengan kunci PG (`o.kc`), jadi siswa tidak pernah mengunduhnya. `bsHasKey` untuk uraian bernilai benar bila `rub` terisi.

Aturan validasi soal sendiri: `maks` terisi, `rub` minimal 1 kriteria, jumlah skor rubrik sama dengan `maks`. Soal yang belum lengkap hanya untuk latihan.

## 3. Jawaban siswa
- Layar ujian: kolom teks (textarea) dengan penghitung karakter dan batas `pj`. Tombol Ragu-ragu dan penyimpanan otomatis ("Tersimpan hh.mm.ss") berjalan seperti soal lain.
- Jawaban disimpan sebagai teks di `ans[id]`. Dihitung "terjawab" bila tidak kosong (setelah dipangkas spasi).
- Tidak ada pengacakan pilihan. Soal grup (stimulus bersama) tetap bisa dipakai.
- Soal uraian tidak ikut cek-jawaban langsung di mode latihan. Pembahasan baru tampil setelah dinilai.
- Antrean offline (PWA) memakai jalur yang sama dengan jawaban lain.

## 4. Penilaian dua tahap
1. **Saat siswa mengirim:** fungsi server `cbt` menilai soal objektif seperti biasa. Soal uraian ditandai `menunggu`. Hasil berstatus **Menunggu penilaian uraian**; nilai sementara hanya dari soal objektif dan diberi label sementara.
2. **Guru menilai:** aksi server baru `nilaiUraian` (hanya guru/admin) menyimpan `nu: { idSoal: { skor, rub:[...], cat } }` di payload hasil. Penulisan lewat server supaya siswa tidak bisa mengubah skornya sendiri.
3. **Nilai akhir:** setelah semua uraian pada satu hasil dinilai, server menghitung ulang `score`:
   nilai = (jumlah skor objektif × 1 + jumlah (skor uraian ÷ maks) × bobot) ÷ (jumlah soal objektif + jumlah bobot uraian) × 100, dibulatkan.
   Aksi `nilaiUlang` yang sudah ada diperluas agar membaca `nu`.
4. Siswa melihat nilai akhir hanya setelah semua uraian dinilai (atau guru menekan **Terbitkan sementara**).

`bsFrac` untuk uraian mengembalikan `skor ÷ maks` bila sudah dinilai dan `null` bila belum, sehingga rekap, ekspor, dan Rekap kompetensi tidak menghitung soal yang belum dinilai sebagai nol.

## 5. Layar guru: Penilaian uraian
Tab baru di CBT Online (guru/admin), dirancang untuk HP:
- **Antrean:** daftar sesi dengan jumlah jawaban uraian belum dinilai, misalnya "12 dari 30 dinilai".
- **Mode per soal** (disarankan, supaya penilaian konsisten): pilih satu soal uraian, lalu geser dari jawaban siswa satu ke berikutnya. Mode **anonim** (nama disembunyikan) bisa dinyalakan.
- Di tiap jawaban: teks jawaban siswa, kunci model di panel yang bisa dibuka, **kotak centang rubrik** (ketuk untuk memberi skor per kriteria), kolom komentar, tombol **Simpan dan lanjut**.
- Penilai dan waktu penilaian dicatat. Menilai ulang diperbolehkan dan tercatat.
- Ringkasan: rata-rata skor tiap soal uraian dan jumlah siswa yang belum dinilai.

## 6. Impor Excel, cetak, analisis
- **Impor:** Jenis `Uraian`. Tambah dua kolom di ujung template: **Rubrik** (satu kriteria per baris sel, format `kriteria | skor`) dan **Skor maks**. Kolom Kunci diisi kunci jawaban model; Pembahasan tetap.
- **Cetak soal:** bagian baru Uraian dengan garis jawab, setelah PG kompleks dan PG kategori. Lembar kunci memuat rubrik dan kunci model.
- **Analisis butir:** pada tahap pertama soal uraian dikecualikan dari p dan DB. Tahap lanjut: p = rata-rata skor ÷ maks, DB memakai kelompok atas-bawah 27%.
- **Ekspor Excel/PDF rekap:** kolom nilai uraian dan status "menunggu" ditambahkan.

## 7. Berkas yang berubah
`js/banksoal.js` (jenis, form soal, validasi, `bsFrac`), `js/cbt.js` (layar jawab), `js/cbt-staf.js` (tab penilaian uraian), `js/banksoal-io.js` dan template xlsx (impor), `js/cetak-soal.js` (cetak), `js/butir.js` (analisis), `functions/cbt/src/main.js` (aksi `nilaiUraian`, hitung ulang, pengecualian TKA), `docs-BANK-SOAL.md`, `service-worker.js` (otomatis lewat `rilis.mjs`).

Catatan penting: perubahan fungsi server `cbt` harus **dideploy ulang di Appwrite** (tidak ikut deploy GitHub Pages). Siapkan langkahnya sebelum rilis, dan jalankan `tools/uji-cbt.mjs` serta `tools/audit-izin.mjs` sesudahnya.

## 8. Tahapan pengerjaan
1. **Fase 1 (inti):** jenis soal, form guru, jawab siswa, aksi server `nilaiUraian`, layar penilaian, nilai akhir.
2. **Fase 2:** impor Excel, template, cetak soal, ekspor rekap.
3. **Fase 3:** analisis butir uraian, mode anonim, komentar yang bisa dilihat siswa, penilaian ulang massal.

## 9. Risiko
- Jawaban uraian panjang membesar payload hasil. Batas 1500 karakter per soal dan maksimal 10 soal uraian per sesi menjaga total jauh di bawah 100.000 karakter.
- Nilai tertunda membuat siswa menunggu. Perlu label jelas "Menunggu penilaian" dan notifikasi di Beranda.
- Konsistensi penilaian antarguru. Rubrik wajib diisi dan mode per soal mengurangi variasi.
- Integritas ujian (copy-paste, pindah halaman) memakai pengaman CBT yang sudah ada tanpa perubahan.

## 10. Keputusan yang perlu dipastikan
1. Bobot uraian default 2 sudah sesuai, atau mau sama dengan soal objektif (1)?
2. Batas jawaban 1500 karakter cukup?
3. Siswa boleh melihat komentar dan rubrik yang terisi per soal setelah dinilai?
4. Mode anonim dinyalakan otomatis atau pilihan guru?

## Catatan pelaksanaan fase 2
- **Impor Excel:** Jenis `Uraian`; kolom baru `Rubrik` (satu kriteria per baris sel, format `kriteria | skor`), `Bobot` (default 2), `Batas karakter` (default 1500). Kolom `Kunci` berisi kunci jawaban teks. Peruntukan Latihan ditolak; kosong atau "Latihan dan ujian" menjadi Ujian. Ekspor Excel memuat kolom yang sama sehingga bisa diimpor ulang.
- **Cetak soal:** bagian "D. Uraian" dengan garis jawab dan skor maksimum; lembar kunci memuat rubrik dan kunci jawaban.
- **Rekap:** daftar Hasil menampilkan lencana "N uraian menunggu"; Excel hasil punya kolom Status nilai (Final / Sementara); rekap kelas menulis "Nilai sementara" pada Keterangan bila ada uraian belum dinilai.
- **Uji:** `node tools/uji-uraian.mjs` (impor) dan bagian "Soal uraian" di `node tools/uji-cbt.mjs` (nilai).
