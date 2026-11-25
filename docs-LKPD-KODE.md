# Kode LKPD: prodi dan CP (tanpa tingkat)

Format: `LKPD-<PRODI>-<CP>-<NN>`, contoh `LKPD-DDO-ALT-02`, `LKPD-TSM-PMT-03`.

- **PRODI**: `DDO` = Dasar-Dasar Program Keahlian Teknik Otomotif (dipakai bersama semua prodi otomotif, sehingga LKPD dasar tidak digandakan saat TKR masuk), `TSM` = Teknik Sepeda Motor, `TKR` disiapkan untuk nanti. Nilainya sejajar dengan `PRODI` di Neon (`tsm`, `tkr`).
- **CP**: singkatan elemen CP. DDO: `BIS` Wawasan Dunia Otomotif, `K3` Kecakapan Kerja Dasar, K3, dan Budaya Kerja, `GBR` Gambar Teknik, `ALT` Peralatan dan Perlengkapan Tempat Kerja, `ELK` Dasar Kelistrikan dan Elektronika, `KOM` Komponen Otomotif, `HID` Hidrolik dan Pneumatik. TSM: `BKL` Pengelolaan bengkel, `ENG` engine, `KEL` sistem kelistrikan, `SAS` sasis, `PMT` sistem pemindah tenaga, `LST` sepeda motor listrik dan hybrid, `EMS` engine management system.
- **NN**: nomor urut dalam prodi dan CP itu, dua digit, tidak menyebut tingkat. Nomor yang sudah dipakai tidak berubah dan tidak dipakai ulang.
- **Tingkat (X, XI, XII)** adalah isian `kelas` pada modul dan `kl` pada Peta LKPD. LKPD boleh naik atau turun tingkat (mis. dari XI ke X) tanpa mengubah kode dan tanpa memutus data siswa.

## Kode lama tetap terbaca
Pemetaan 54 kode lama (`LKPD-X-06`, `LKPD-XI-17`, ...) ke kode baru ada di `AKD_LKPD_ALIAS` (`js/akademik-data.js`) dan di isian `alias` pada modul. `js/lkpd-kode.js` menyediakan `lkKodeBaru`, `lkKodeLama`, `lkKodeSama`, `lkKodeParse`, `lkKodeBerikut`. Setiap `lkRefreshModules` membaca hasil, bukti, dan modul terkelola yang masih memuat kode lama sebagai kode baru (hanya di memori, tidak menambah kolom database). LKPD v1 (`X-1` s.d. `XII-7`) memakai skema sendiri dan tidak berubah.

| Lama | Baru |
|---|---|
| LKPD-X-06 (Alat Ukur) | LKPD-DDO-ALT-02 |
| LKPD-X-12 | LKPD-DDO-ELK-01 |
| LKPD-X-18 | LKPD-DDO-KOM-03 |
| LKPD-XI-17 | LKPD-TSM-PMT-02 |
| LKPD-XI-18 | LKPD-TSM-PMT-03 |

## Mengubah Peta LKPD
`python3 tools/matriks-lkpd.py <berkas.xlsx>` membangun ulang Peta LKPD dari matriks (kode di sheet tetap kode lama). Nomor yang sudah tercatat di `AKD_LKPD_ALIAS` dipertahankan; LKPD baru mendapat nomor berikutnya dalam CP-nya. `python3 tools/matriks-lkpd.py --migrasi` hanya mengonversi blok yang sudah ada (dipakai satu kali pada pengalihan ini; aman diulang).

## Editor LKPD guru
Tab Info punya pilihan **Prodi** dan **CP**. Pada LKPD baru, ID terisi otomatis dengan nomor berikutnya (boleh diubah). Kelas tetap bisa diganti kapan saja.

## Uji
`node tools/uji-lkpd-kode.mjs` (40 butir).
