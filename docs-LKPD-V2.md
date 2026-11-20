# LKPD v2 dan Observasi LKPD Praktik v2

Tambahan aditif: LKPD dan observasi lama tidak diubah. Pilot: LKPD-X-07 (Penggunaan dan Perawatan Alat Ukur).

## Berkas
- `js/lkpd-v2-x07.js`: data modul LKPD-X-07 (status awal Draft; angka standar dikosongkan untuk diisi guru dari manual servis).
- `js/lkpd-v2.js`: mesin v2 (aktif hanya untuk modul yang punya objek `v2`).
- `js/lkpd-v2-soal.js`: tipe soal isian angka (`t:'isian'`, `kunci`, `tol`).
- `js/observasi-v2.js`: Observasi LKPD Praktik v2 (rubrik diambil dari `m.v2.obs` tiap LKPD).
- `tools/uji-lkpd-v2.mjs`: uji tanpa peramban (`node tools/uji-lkpd-v2.mjs`).

## Cara kerja
- **Pertemuan:** rencana per pertemuan (JP, menit) dan isian waktu aktual per pertemuan.
- **Gerbang masuk:** semua pertanyaan harus dijawab agar Lembar Kerja terbuka; guru menandai benar di Detail (syarat `gate.min`).
- **Tabel data:** rata-rata dan selisih dihitung otomatis; kelengkapan tabel ikut nilai.
- **Soal isian angka:** dinilai otomatis (koma atau titik, toleransi `tol`).
- **Saksi guru dan paraf APD:** diverifikasi guru di Detail pengumpulan (`payload.v2.verif`).
- **Foto wajib:** memakai `m.fotoWajib` yang sudah ada.
- **Nilai otomatis** hanya perkiraan awal; nilai kinerja resmi dari Observasi v2 dan nilai koreksi guru.
- **Penyimpanan:** tanpa perubahan skema Appwrite. Observasi v2: koleksi `observasi`, `tipe='siswa'`, `payload.v=2`.

## Penerbitan
Modul v2 dimuat sebagai Draft. Guru menerbitkan lewat tombol Terbitkan di daftar LKPD. Tombol Edit dan Salin dinonaktifkan untuk modul v2 sampai Editor v2 tersedia.

## Ditambahkan pada pembaruan ini
- **Cetak:** Lembar Kerja v2 tetap tercetak walau gerbang belum selesai (sebelumnya siswa mencetak halaman "terkunci").
- **Cadangan draf:** tombol Cadangkan draf (unduh berkas .json) dan Pulihkan draf di Lembar Kerja v2. Draf LKPD tersimpan di perangkat; cadangkan setelah tiap pertemuan. Berkas hanya bisa dipulihkan pada LKPD dan akun yang sama.
- **Observasi v2 PDF:** per catatan (aspek berbobot, indikator, keputusan, tanda tangan).
- **Observasi v2 Excel:** tombol Excel lama kini menulis catatan v2 pada lembar terpisah per LKPD (kolom mengikuti rubrik), dan lembar lama tidak lagi tercampur baris v2.

## Penyesuaian tampilan (hasil uji di ponsel)
- **Rencana pertemuan:** tabel diganti daftar lipat. Tiap pertemuan tertutup bawaan, ringkasannya "N JP · M menit", isinya kegiatan dan langkah (termasuk penanda saksi guru). Status buka/tutup diingat selama sesi; saat mencetak semua terbuka.
- **K3:** judul "Keselamatan dan Kesehatan Kerja (K3)"; 10 butir dalam 4 kelompok (APD; persiapan diri dan area kerja; larangan saat praktik; kebersihan dan keadaan darurat). Paraf guru tetap hanya pada 4 butir APD. Topik teori K3 ditambahkan di Memahami.
- **Penilaian kinerja:** tiap aspek lipat dengan bobot, poin yang dinilai (`ket`), arti skor 4 sampai 1, dan penanda aspek penghenti; ditambah Syarat kompeten (8 indikator + bukti), Yang diamati dan kesalahan umum, serta contoh hitung nilai.
- Butir K3, kelompok (`v2.k3grup`), dan keterangan aspek (`ket`) ada di `lkpd-v2-x07.js` dan dapat disesuaikan dengan kondisi bengkel.

## Batas yang diketahui
- Draf belum sinkron ke server (hanya cadangan manual lewat berkas); foto bukti memakai alur foto yang ada.
- Editor v2 belum ada; perubahan isi modul v2 dilakukan di berkas data.
- Kunci gerbang dan kunci soal isian ikut di data modul (terbaca di sisi klien, sama seperti kunci soal lain).
- Belum diuji dengan Appwrite dan peramban sungguhan; uji di lingkungan uji dulu.
