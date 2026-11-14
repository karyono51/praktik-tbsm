# Observasi UKK

Menu **Observasi UKK** (Admin dan Guru) berisi lembar observasi praktik Uji Kompetensi Keahlian: *Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR)*, kode KM25.2.2.2, alokasi 20 menit, tahun pelajaran 2026/2027. Siswa tidak melihat menu ini.

## Isi lembar
- Identitas: nama siswa (pilih dari akun Siswa atau ketik manual), NIS, kelas, tanggal, penguji.
- 26 aspek dalam 4 bagian (A Persiapan 4, B Proses kerja 16, C K3 dan lingkungan 3, D Hasil dan waktu 3). Tiap aspek dipilih **Kompeten** atau **Belum Kompeten**, dengan keterangan opsional. Spesifikasi (mis. 13,0-13,2 V, idle 1.700 ± 100 rpm) tampil sebagai petunjuk di bawah aspek.
- Nilai = jumlah aspek Kompeten / 26 x 100. Hasil akhir **Kompeten** bila nilai minimal KKM aplikasi (menu Akun), selain itu **Belum Kompeten**.

## Hak akses dan penyimpanan
- Admin melihat dan mengelola semua observasi UKK; Guru hanya miliknya sendiri.
- Memakai koleksi `observasi` yang sama dengan observasi lain, dengan `tipe` = `ukk`. Tidak ada perubahan skema Appwrite. Sinkron, antrean offline, dan Cek sinkronisasi ikut berlaku.
- Observasi UKK tidak muncul di Observasi guru maupun Observasi praktik siswa.

## Ekspor
- **PDF** per observasi (berkop sekolah, tanda tangan siswa dan penguji).
- **Excel** rekap (K = Kompeten, BK = Belum Kompeten per aspek).

## Berkas
- Baru: `js/observasi-ukk.js`, `docs-OBSERVASI-UKK.md`.
- Terdaftar di `index.html` (satu baris script) dan `service-worker.js` (daftar cache, versi `tbsm-v90`).
