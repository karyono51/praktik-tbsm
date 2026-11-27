# Bank soal HOTS: LKPD X-1 Pemeriksaan Baterai dan Sistem Starter

Berkas: `js/soal-lkpd/x1.js` (60 soal, ID `lkx1-01` sampai `lkx1-60` tidak berubah, jadi pemetaan CP di `cp-peta.js` tetap berlaku).

## Dasar aturan
- Bentuk soal: Perka BSKAP 045/H/AN/2025 (tiga bentuk soal TKA). Level kognitif: Peraturan Kepala BKPDM No. 1 Tahun 2026 (Pengetahuan dan Pemahaman, Aplikasi, Penalaran). Soal HOTS = Aplikasi dan Penalaran.
- Aturan bank soal aplikasi (docs-BANK-SOAL.md): PG 5 opsi tepat 1 kunci; PG kompleks 5 opsi, kunci minimal 2; PG kategori 3 sampai 6 pernyataan dengan label Benar/Salah atau Sesuai/Tidak Sesuai. Soal lama X-1 memakai 4 opsi pada 9 dari 10 PG kompleks; versi baru semuanya 5 opsi.

## Komposisi
| Bentuk | Jumlah | Pengetahuan dan Pemahaman | Aplikasi | Penalaran |
|---|---|---|---|---|
| PG sederhana (01-40) | 40 | 6 | 12 | 22 |
| PG kompleks (41-50) | 10 | 0 | 3 | 7 |
| PG kategori (51-60) | 10 | 0 | 3 | 7 |
| **Total** | **60** | **6 (10%)** | **18 (30%)** | **36 (60%)** |

Tiap soal membawa properti `lvl`. Properti ini belum dipakai tampilan; aman diabaikan oleh aplikasi dan fungsi server.

## Acuan angka (sama dengan unit UKK-1, Honda Beat Pop)
- Baterai penuh 13,0-13,2 V (kunci OFF); wajib diisi bila di bawah 12,3 V. Hasil di luar rentang berstatus Tidak sesuai, selaras dengan aturan nilai UKK.
- Angka lain yang dipakai di stimulus adalah **angka contoh** dan selalu tertulis di dalam soal: tegangan terminal baterai minimum saat starter bekerja 9,6 V, batas jatuh tegangan 0,5 V, arus tarik motor starter maksimum 90 A, tegangan pengisian 14,0-15,0 V pada 5.000 rpm, batas arus bocor 1 mA, harga komponen. **Cocokkan dengan manual unit di sekolah** (soal 19-22, 24-26, 28, 35, 44, 54-56) dan ubah angkanya bila berbeda.

## Pola soal
Diagnosis dari tabel ukur (baterai tidak laik beban, massa buruk, kontak relay, motor starter), pembandingan dua teknisi, sistem pengisian lemah atau berlebih, arus bocor, tegangan permukaan, pemilihan alat ukur, K3LH dan limbah B3, keputusan perbaikan dengan pertimbangan biaya, serta evaluasi laporan. Pengecoh dibuat masuk akal; panjang kunci dan pengecoh diseimbangkan (kunci tidak selalu opsi terpanjang atau terpendek), posisi kunci tersebar, dan susunan jawaban PG kompleks serta kategori diacak (rotasi tetap, hasilnya sama setiap dimuat).

## Perubahan dari versi lama
- 5 opsi pada seluruh PG kompleks (sebelumnya 9 dari 10 hanya 4 opsi dan 3 dari 4 opsi benar).
- Opsi kembar dibuang (soal lama 03, 09, 11, 27, 35). Soal lama 47 (tegangan DC 12 V sebagai bahaya) dibenahi: bahaya yang dibahas kini hubungan singkat dan gas.
- Topik tidak lagi berulang (sekring, baterai bengkak, relay masing-masing sebelumnya 4-6 soal).
- Materi baru: tegangan saat berbeban, jatuh tegangan, sistem pengisian, arus bocor, komponen motor starter.

## Pemasangan
1. `unzip -o` di `~/tbsm`, lalu `git add . && git commit && git push` (atau `sh up.sh`).
2. **Deploy ulang fungsi `cbt` dan `akun-admin`** karena `bawaan.json` berubah (kunci jawaban server). Jumlah soal tetap 1.320.
3. Buka aplikasi, menu **Perbarui aplikasi** (versi `tbsm-v2611180324`).
4. Hasil latihan atau ujian lama untuk soal X-1 tetap tersimpan, tetapi soal yang sama kini berisi pertanyaan berbeda; hapus sesi ujian lama yang memakai soal X-1 bila perlu.
