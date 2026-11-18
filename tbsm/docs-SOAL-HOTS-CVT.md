# Bank soal HOTS: LKPD XI-3 Pembongkaran dan Pemasangan Komponen CVT

Berkas: `js/soal-lkpd/xi3.js` (60 soal, ID `lkxi3-01` sampai `lkxi3-60` tidak berubah, jadi pemetaan CP di `cp-peta.js` tetap berlaku).

## Dasar aturan
- **Bentuk soal** (Perka BSKAP 045/H/AN/2025 dan Peraturan Kepala BKPDM No. 1 Tahun 2026 tentang Kerangka Asesmen TKA SMK/MAK): tiga bentuk, semuanya **soal tunggal**, jadi stimulus (kasus, gejala, tabel ukur) ditulis di dalam teks soal itu sendiri.
- **Level kognitif** (BKPDM 1/2026): Pengetahuan dan Pemahaman, Aplikasi, Penalaran. Soal HOTS = Aplikasi dan Penalaran (data, kasus, analisis, evaluasi, keputusan).
- **Aturan bank soal aplikasi ini** (docs-BANK-SOAL.md): PG 5 pilihan tepat 1 kunci; PG kompleks 5 pilihan, kunci minimal 2; PG kategori 3 sampai 6 pernyataan dengan label Benar/Salah atau Sesuai/Tidak Sesuai. Soal lama bawaan memakai 4 pilihan pada PG kompleks; versi baru 5 pilihan.

## Komposisi
| Bentuk | Jumlah | Pengetahuan dan Pemahaman | Aplikasi | Penalaran |
|---|---|---|---|---|
| PG sederhana (01-40) | 40 | 6 | 12 | 22 |
| PG kompleks (41-50) | 10 | 0 | 3 | 7 |
| PG kategori (51-60) | 10 | 0 | 3 | 7 |
| **Total** | **60** | **6 (10%)** | **18 (30%)** | **36 (60%)** |

Tiap soal membawa properti baru `lvl` (nama level kognitif). Properti ini belum dipakai tampilan; aman diabaikan oleh aplikasi dan fungsi server (`bangun-bawaan.mjs` hanya membaca id, tipe, kunci, rk, n, bahas).

## Acuan angka (sama dengan unit UKK-2, Honda Beat Pop)
| Komponen | Standar | Batas servis |
|---|---|---|
| V-belt (lebar) | 18,5 mm | 17,5 mm |
| Roller weight (diameter) | 17,92-18,08 mm, bobot 15 g | 17,3 mm |
| Kanvas weight set clutch (tebal) | - | 2,0 mm |
| Mangkok kopling (diameter dalam) | 112,0-112,2 mm | 112,5 mm |
| Per CVT (panjang bebas) | 127,5 mm | 124,7 mm |

Prinsip keputusan yang dipakai di soal: **ganti bila melewati batas servis, bukan bila keluar rentang standar**; roller dan sepatu kopling diganti **satu set**; belt diukur di beberapa titik dan dipakai nilai terkecil; torsi mur selalu dengan kunci torsi sesuai manual. Bila manual unit di sekolah berbeda, sesuaikan angka di soal 07-11, 29, 40, 43, 48, 51.

## Pola soal
Diagnosis dari gejala (selip, menyentak, merangkak, tenaga atas turun, bunyi kasar), keputusan dari data ukur, menemukan akar masalah (oli, puli bergelombang), evaluasi prosedur dan K3LH, perhitungan rasio, dan kesimpulan laporan. Pengecoh dibuat masuk akal (kesalahan umum siswa), bukan jawaban jelas keliru.

## Pemasangan
1. `unzip -o` di `~/tbsm`, lalu `git add . && git commit && git push`.
2. **Deploy ulang fungsi `cbt` dan `akun-admin`** karena `bawaan.json` berubah (kunci jawaban server). Jumlah soal tetap 1.320.
3. Buka aplikasi, menu **Perbarui aplikasi** (versi `tbsm-v2611170556`).
4. Hasil latihan atau ujian lama untuk soal XI-3 tetap tersimpan, tetapi soal yang sama kini berisi pertanyaan berbeda; hapus sesi ujian lama bila perlu.
