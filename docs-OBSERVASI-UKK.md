# Observasi UKK

Menu **Observasi UKK** (Admin dan Guru) berisi **4 lembar** observasi praktik Uji Kompetensi Keahlian, kode KM25.2.2.2, alokasi 20 menit, tahun pelajaran 2026/2027. Siswa tidak melihat menu ini.

| Lembar | Judul tugas | Aspek |
|---|---|---|
| Observasi 1 | Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR) | 26 (4+16+3+3) |
| Observasi 2 | Perawatan Berkala Sistem CVT (Honda Beat Pop) | 19 (4+9+3+3) |
| Observasi 3 | Perawatan Berkala Sistem Rem (Honda Supra X 125 Karburator) | 23 (4+13+3+3) |
| Observasi 4 | Perawatan Berkala Sistem Kelistrikan Bodi (Honda Supra Fit) | 20 (4+10+3+3) |

Pilih lembar lewat kolom **Lembar observasi** di atas daftar, lalu ketuk **+ Observasi baru**. Setiap kartu di daftar menampilkan nama lembarnya.

## Isi lembar
- Identitas: nama siswa (pilih dari akun Siswa atau ketik manual), NIS, kelas, tanggal, penguji.
- Tiap lembar terdiri dari 4 bagian (A Persiapan 4, B Proses kerja sesuai lembar, C K3 dan lingkungan 3, D Hasil dan waktu 3). Tiap aspek dipilih **Kompeten** atau **Belum Kompeten**, dengan keterangan opsional. Spesifikasi (mis. 13,0-13,2 V, idle 1.700 ± 100 rpm) tampil sebagai petunjuk di bawah aspek.
- Nilai = jumlah aspek Kompeten / jumlah aspek lembar x 100. Kesimpulan akhir dan nilai konversi:
  - 91-100: **Sangat Kompeten**
  - 75-90: **Kompeten**
  - 61-74: **Cukup Kompeten**
  - di bawah 61: **Belum Kompeten**
- Kesimpulan selalu dihitung dari nilai, sehingga observasi lama (yang dulu memakai KKM) otomatis tampil sesuai kriteria baru.

## Hak akses dan penyimpanan
- Admin melihat dan mengelola semua observasi UKK; Guru hanya miliknya sendiri.
- Memakai koleksi `observasi` yang sama dengan observasi lain, dengan `tipe` = `ukk`. Lembar yang dipakai disimpan di dalam `payload` (kunci `lembar`: `vario`, `cvt`, `rem`, `bodi`); data lama tanpa kunci ini otomatis dibaca sebagai `vario`. Tidak ada perubahan skema Appwrite. Sinkron, antrean offline, dan Cek sinkronisasi ikut berlaku.
- Observasi UKK tidak muncul di Observasi guru maupun Observasi praktik siswa.

## Ekspor
- **PDF** per observasi (berkop sekolah, tanda tangan siswa dan penguji).
- **Excel** rekap (K = Kompeten, BK = Belum Kompeten per aspek), satu sheet per lembar yang sudah berisi data.

## Berkas
- Baru: `js/observasi-ukk.js`, `docs-OBSERVASI-UKK.md`.
- Terdaftar di `index.html` (satu baris script) dan `service-worker.js` (daftar cache, versi `tbsm-v90`).

## Pembaruan: 4 lembar
- `js/observasi-ukk.js` diubah menjadi registri lembar (`OBU.lembar`, `obuLb`, `obuKey`). Lembar 2-4 diambil dari berkas Observasi_2, _3, _4.
- `service-worker.js` naik ke `tbsm-v92`; `index.html` memuat `observasi-ukk.js?v=91`.
