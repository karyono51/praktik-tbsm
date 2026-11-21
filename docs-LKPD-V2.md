# LKPD v2 dan Observasi LKPD Praktik v2

Tambahan aditif: LKPD dan observasi lama tidak diubah. Pilot: LKPD-X-07 (Penggunaan dan Perawatan Alat Ukur). Modul v2 adalah modul LKPD yang punya objek `v2`; mesin v2 hanya aktif untuk modul itu.

## 1. Berkas
- `js/lkpd-v2-x07.js`: data modul LKPD-X-07 (status awal Draft; angka standar dikosongkan untuk diisi guru dari manual servis). Butir K3, kelompok K3 (`v2.k3grup`), dan keterangan aspek (`ket`) ada di sini dan dapat disesuaikan dengan kondisi bengkel.
- `js/lkpd-v2.js`: mesin v2.
- `js/lkpd-v2-soal.js`: tipe soal isian angka (`t:'isian'`, `kunci`, `tol`).
- `js/observasi-v2.js`: Observasi LKPD Praktik v2 (rubrik diambil dari `m.v2.obs` tiap LKPD).
- `tools/uji-lkpd-v2.mjs`: uji tanpa peramban (`node tools/uji-lkpd-v2.mjs`, 166 uji).

## 2. Alur siswa
Urutan tab: Materi, Lembar Kerja, Evaluasi.

### Materi
- **Rencana pertemuan:** daftar lipat. Tiap pertemuan tertutup bawaan, ringkasannya "N JP · M menit", isinya kegiatan dan langkah (termasuk penanda saksi guru). Status buka/tutup diingat selama sesi; saat mencetak semua terbuka. Waktu aktual per pertemuan diisi siswa di Lembar Kerja (isian menit).
- **Memahami (teori):** termasuk topik teori K3, **Koreksi nol alat**, dan **Perawatan dan penyimpanan**, sehingga soal gerbang 3 dan 5 punya dasar di Materi.
- **Gerbang masuk:** semua soal harus dijawab agar Lembar Kerja terbuka; guru menandai benar di Detail (syarat lulus `gate.min`, 4 dari 5). Bentuk soal di bagian 4.
- **K3:** judul "Keselamatan dan Kesehatan Kerja (K3)"; 10 butir dalam 4 kelompok (APD; persiapan diri dan area kerja; larangan saat praktik; kebersihan dan keadaan darurat). Paraf guru hanya pada 4 butir APD.

### Lembar Kerja
- **Langkah:** langkah bertanda saksi guru diverifikasi guru di Detail pengumpulan (`payload.v2.verif`), begitu juga paraf APD.
- **Tabel data:** rata-rata dan selisih dihitung otomatis; kelengkapan tabel ikut nilai. Tabel F1 dan F2 memuat catatan koreksi nol (`cat` pada data tabel).
- **Soal isian angka:** dinilai otomatis (koma atau titik, toleransi `tol`).
- **Latihan membaca skala:** tidak lagi berlabel F4; kunci data `q0` sampai `q7` tetap.
- **Foto wajib:** memakai `m.fotoWajib` yang sudah ada.

## 3. Penilaian
- **Nilai otomatis** hanya perkiraan awal. Nilai akhir adalah nilai guru di Detail pengumpulan, yang menggantikan nilai otomatis.
- **Nilai kinerja resmi** berasal dari Observasi v2 dan nilai koreksi guru.
- **Penilaian kinerja oleh guru:** tiap aspek lipat berisi bobot, poin yang dinilai (`ket`), arti skor 4 sampai 1, dan penanda aspek penghenti. Ditambah **Syarat kompeten** (8 indikator + bukti), **Yang diamati dan kesalahan umum**, serta contoh hitung nilai.
- **Detail guru:** jawaban siswa, kunci, pembahasan, dan level soal tampil; kotak Jawaban benar terisi otomatis dari penilaian sebelum guru menyimpan verifikasi, dan dapat diubah.

## 4. Soal gerbang masuk (bentuk PG, HOTS, bentuk soal TKA)
- Gerbang LKPD-X-07 terdiri dari 5 soal: 3 PG (5 pilihan, 1 kunci), 1 PG kompleks (kunci minimal 2), 1 PG kategori (Benar/Salah). Semua soal tunggal berstimulus dan berlevel Aplikasi atau Penalaran (`lvl`; saat ini 3 Aplikasi, 2 Penalaran).
- Format soal sama dengan `m.quiz`: `{t:'pg'|'kompleks'|'kategori', q, o, a, e}` atau `rows` untuk kategori.
- Jawaban gerbang PG disimpan di `q100` sampai `q104` (indeks 100 ke atas) agar tidak bertabrakan dengan soal F4 (`q0` sampai `q7`). Dibaca pembaca jawaban dan dinilai fungsi soal yang ada (`lkpd-soal.js`). Soal gerbang isian lama (`q` + `kunci` teks, `gate<i>`) tetap didukung.
- Benar bila semua pilihan tepat (kompleks dan kategori tidak ada nilai sebagian). Lembar Kerja terbuka bila kelima soal terjawab.
- Soal 5: panjang pilihan diseimbangkan (kunci C tidak lagi paling panjang). Pembahasan soal 2 menjelaskan semua pengecoh.
- Catatan: draf yang dikerjakan dengan gerbang isian lama tidak terbaca sebagai jawaban PG; siswa perlu menjawab ulang gerbang.

## 5. Observasi LKPD Praktik v2
- **Penilaian aspek (skala 1-4 + nilai, sama dengan Observasi UKK):** untuk tiap aspek penguji memilih tombol **1-4**, lalu mengisi **nilai** bulat sesuai rentang skala. Kolom nilai terkunci sampai skala dipilih, dan menolak angka di luar rentang (pesan merah "Nilai harus 75-90").

| Skala | Kesimpulan | Rentang nilai |
|---|---|---|
| 1 | Belum Kompeten | 0-60 (<61) |
| 2 | Cukup Kompeten | 61-74 |
| 3 | Kompeten | 75-90 |
| 4 | Sangat Kompeten | 91-100 |

- Deskriptor rubrik tiap skala (`d` di `m.v2.obs`) tampil di bawah tombol untuk skala yang dipilih, dan semua deskriptor ada di lipatan **Kriteria skala**. Kolom **Keterangan (opsional)** per aspek tetap ada.
- **Nilai akhir = jumlah(nilai aspek x bobot / 100)**, dibulatkan. Kategori: 91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, di bawah 61 Belum Kompeten. Aspek penghenti (K3) berskala 1 = praktik dihentikan dan kategori Belum Kompeten. Keputusan Kompeten tetap mensyaratkan semua indikator tercentang, semua aspek terisi, dan K3 tidak berskala 1.
- **Bar bawah** (menempel di layar): `N / 6 terisi`, nilai sementara atau akhir, tombol **Belum diisi** (gulir ke aspek pertama yang belum lengkap dan menyorotnya) dan **Simpan**. Simpan ditolak bila ada aspek yang skala atau nilainya belum valid.
- **Penyimpanan:** `payload.nilai[id aspek]` = nilai 0-100, `payload.nilai['l_'+id aspek]` = skala 1-4, indikator tetap `i0..iN`. Tanpa perubahan skema Appwrite; `skor` = nilai akhir 0-100.
- **Catatan format lama** (skor 1-4 per aspek tanpa kunci `l_`) tetap dapat dilihat, dicetak, dan diekspor dengan hitungan lama (jumlah(skor / 4 x bobot), kategori Sangat Baik/Baik/Cukup/Kurang). Bila diubah, aspeknya diisi ulang dengan skala dan nilai (indikator ikut terbawa).
- Penyimpanan: koleksi `observasi`, `tipe='siswa'`, `payload.v=2` (tanpa perubahan skema Appwrite).
- **PDF:** per catatan (aspek berbobot, indikator, keputusan, tanda tangan). Format baru memuat kolom Skor (skala), Nilai, dan Berbobot.
- **Excel:** tombol Excel lama menulis catatan v2 pada lembar terpisah per LKPD (kolom mengikuti rubrik; kolom terakhir Format penilaian membedakan skala + nilai dengan skor 1-4 lama); lembar lama tidak lagi tercampur baris v2.

## 6. Cetak dan cadangan draf
- **Cetak:** Lembar Kerja v2 tetap tercetak walau gerbang belum selesai (sebelumnya siswa mencetak halaman "terkunci"). Mata pelajaran di cetakan memakai nama master (Dasar-Dasar Teknik Otomotif (DDPK); Kompetensi Keahlian Teknik Sepeda Motor).
- **Cadangan draf:** tombol Cadangkan draf (unduh berkas .json) dan Pulihkan draf di Lembar Kerja v2. Draf LKPD tersimpan di perangkat; cadangkan setelah tiap pertemuan. Berkas hanya bisa dipulihkan pada LKPD dan akun yang sama.

## 7. Penerbitan dan penyimpanan
- Modul v2 dimuat sebagai Draft. Guru menerbitkan lewat tombol Terbitkan di daftar LKPD. Tombol Edit dan Salin dinonaktifkan untuk modul v2 sampai Editor v2 tersedia.
- Semua data siswa memakai kunci yang sama dengan mesin lama (`step<i>`, `safe<i>`, `actual<i>`, `q<i>`), jadi draf, foto bukti, nilai koreksi, rekap, dan sinkronisasi tidak berubah. Tanpa perubahan skema Appwrite.
- Pengaturan mode Latihan/Ujian (Kelola LKPD > Pengaturan) berlaku untuk v2: Teori ringkas menyembunyikan kartu Memahami; Penjelasan langkah menyembunyikan isi tiap pertemuan dan "Poin kritis"; Petunjuk komponen menyembunyikan keterangan dan acuan komponen pemeriksaan (`lk2ModeFilter`).

## 8. Batas yang diketahui
- Draf belum sinkron ke server (hanya cadangan manual lewat berkas); foto bukti memakai alur foto yang ada.
- Editor v2 belum ada; perubahan isi modul v2 dilakukan di berkas data.
- Kunci gerbang dan kunci soal isian ikut di data modul (terbaca di sisi klien, sama seperti kunci soal lain).
- Belum diuji dengan Appwrite dan peramban sungguhan; uji di lingkungan uji dulu.
