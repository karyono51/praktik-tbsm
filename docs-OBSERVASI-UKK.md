# Observasi UKK

Menu **Observasi UKK** (Admin dan Guru) berisi **4 lembar** observasi praktik Uji Kompetensi Keahlian, kode KM25.2.2.2, alokasi 20 menit, tahun pelajaran 2026/2027. Siswa tidak melihat menu ini. Di laci menu, **Observasi UKK** berada di kelompok **UKK** (setelah daftar UKK kelas), dan **Observasi LKPD Praktik** berada di kelompok **LKPD Praktik** (setelah daftar kelas).

| Lembar | Judul tugas | Aspek |
|---|---|---|
| Observasi 1 | Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR) | 26 (4+16+3+3) |
| Observasi 2 | Perawatan Berkala Sistem CVT (Honda Beat Pop) | 19 (4+9+3+3) |
| Observasi 3 | Perawatan Berkala Sistem Rem (Honda Supra X 125 Karburator) | 23 (4+13+3+3) |
| Observasi 4 | Perawatan Berkala Sistem Kelistrikan Bodi (Honda Supra Fit) | 20 (4+10+3+3) |

Pilih lembar lewat kolom **Lembar observasi** di atas daftar, lalu ketuk **+ Observasi baru**. Setiap kartu di daftar menampilkan nama lembarnya.

## Isi lembar
- Identitas: nama siswa (pilih dari akun Siswa atau ketik manual), NIS, kelas, tanggal, penguji.
- Tiap lembar terdiri dari 4 bagian (A Persiapan 4, B Proses kerja sesuai lembar, C K3 dan lingkungan 3, D Hasil dan waktu 3). Tiap aspek dinilai dengan skala **1-4** (lihat bagian Penilaian), dengan keterangan opsional. Spesifikasi (mis. 13,0-13,2 V, idle 1.700 ± 100 rpm) tampil sebagai petunjuk di bawah aspek.
## Penilaian (skala 1-4)
Untuk setiap aspek penguji memilih tombol **1-4**, lalu mengisi **nilai** sesuai rentang skala yang dipilih. Di bawah tombol tampil keterangan rentang, dan kolom nilai menolak angka di luar rentang.

| Tombol | Kesimpulan | Rentang nilai yang boleh diisi |
|---|---|---|
| 1 | Belum Kompeten | 0-60 (<61) |
| 2 | Cukup Kompeten | 61-74 |
| 3 | Kompeten | 75-90 |
| 4 | Sangat Kompeten | 91-100 |

- **Nilai akhir = jumlah nilai semua aspek / N** (N = jumlah aspek lembar, dibulatkan ke bilangan bulat).
- Kesimpulan akhir memakai rentang yang sama pada nilai akhir: 91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, di bawah 61 Belum Kompeten.
- Observasi hanya bisa disimpan bila semua aspek sudah punya skala dan nilai yang valid.
- Payload baru: `v:2`, `nilai` (angka per aspek), `lvl` (skala 1-4 per aspek).
- Observasi lama (tanpa `v`, format Kompeten/Belum Kompeten) tetap bisa dilihat dan diunduh sebagaimana tersimpan. Bila diubah, aspeknya harus diisi ulang dengan skala 1-4.
- Kesimpulan selalu dihitung dari nilai, sehingga observasi lama (yang dulu memakai KKM) otomatis tampil sesuai kriteria baru.

## Hak akses dan penyimpanan
- Admin melihat dan mengelola semua observasi UKK; Guru hanya miliknya sendiri.
- Memakai koleksi `observasi` yang sama dengan observasi lain, dengan `tipe` = `ukk`. Lembar yang dipakai disimpan di dalam `payload` (kunci `lembar`: `vario`, `cvt`, `rem`, `bodi`); data lama tanpa kunci ini otomatis dibaca sebagai `vario`. Tidak ada perubahan skema Appwrite. Sinkron, antrean offline, dan Cek sinkronisasi ikut berlaku.
- Observasi UKK tidak muncul di Observasi guru maupun Observasi LKPD Praktik.

## Ekspor
- **PDF** per observasi, mengikuti lembar UKK: kotak RAHASIA dan Paket (Paket mengacu pada pengaturan paket UKK (FORM_UKK.paket), semua lembar = P1), judul *Uji Kompetensi Keahlian*, identitas (termasuk tipe kendaraan), 13 kotak Nomor Peserta (NIS), tabel aspek (No urut, Aspek, Capaian berisi langsung Belum Kompeten / Cukup Kompeten / Kompeten / Sangat Kompeten tanpa angka skala, Nilai, Keterangan), lalu pengesahan:
  - **NILAI** (nilai akhir dan kesimpulan) di kiri.
  - **PENGUJI** di kanan, tanpa border (hanya garis tanda tangan); nama penguji dicetak tepat di atas garis: **Penguji 1** = nama akun yang mengisi observasi (akun login, otomatis terisi di kolom Penguji), **Penguji 2** = **Tim AHASS**. Tempat dan tanggal mengikuti pengaturan UKK (Sumedang).
- **Excel rincian aspek**: satu sheet per lembar yang sudah berisi data, nilai tiap aspek.
- **Rekap nilai** (tombol *Rekap nilai* di daftar): satu kartu per siswa dengan nilai tiap lembar (observasi terbaru per lembar), rata-rata dari lembar yang sudah dinilai, dan kesimpulan. Bisa difilter per kelas.
- **Excel rekap nilai** (tombol *Unduh rekap nilai (Excel)* di halaman Rekap): sheet **Rekap Nilai** (siswa x lembar, rata-rata, kesimpulan), **Daftar Observasi** (semua observasi lengkap dengan Penguji 1 dan 2, jumlah nilai, N, nilai), dan **Ringkasan** (jumlah siswa per kesimpulan, rata-rata per lembar). Mengikuti filter kelas.
- **Footer** tiap halaman: kiri `paket-tahun pelajaran` (contoh P1-2026/2027), tengah `Hak Cipta pada Kemendikdasmen`, kanan `PP. halaman/jumlah halaman`.
- Admin merekap semua observasi; Guru hanya miliknya sendiri.

## Berkas
- Baru: `js/observasi-ukk.js`, `docs-OBSERVASI-UKK.md`.
- Terdaftar di `index.html` (satu baris script) dan `service-worker.js` (daftar cache, versi `tbsm-v90`).

## Pembaruan: 4 lembar
- `js/observasi-ukk.js` diubah menjadi registri lembar (`OBU.lembar`, `obuLb`, `obuKey`). Lembar 2-4 diambil dari berkas Observasi_2, _3, _4.
- `service-worker.js` naik ke `tbsm-v97`; `index.html` memuat `observasi-ukk.js?v=96` dan `css/app.css?v=90`.

## Nilai unit UKK (v100): aturan angka
`js/ukk-aturan.js` memuat aturan angka per butir (`UKK_ATURAN`, kunci = ID butir, mis. `UKK-1-0`) dan menggantikan hitungan `calc()` untuk unit UKK bila Hasil aktual dan Catatan ikut dikirim.
- Butir berangka: sistem membaca angka dari Hasil aktual (koma = desimal, 1.700 = 1700) dan menentukan status yang benar. Dapat nilai bila status pilihan siswa sama dengan yang benar; bila Tidak sesuai, Catatan wajib terisi. Nilai tepat di batas = Sesuai.
- Butir tanpa angka: dapat nilai bila Hasil aktual, Status, dan Catatan terisi. Butir tanpa aturan di `UKK_ATURAN` otomatis tanpa angka.
- Butir campuran (`tk:1`): Hasil aktual harus memuat teks selain angka dan satuan.
- Nilai unit = persentase butir yang dapat nilai; Kompeten bila >= KKM (butir kritis tidak dipakai).
- Aturan terikat ID butir (`UKK-n-k`): bila urutan butir unit diedit di editor UKK, aturan harus disesuaikan.
- Form menampilkan petunjuk isian pada kolom Hasil aktual dan keterangan "Perlu: ..." di bawah Catatan.

## Pembaruan: menu dan penamaan
- Menu **Observasi UKK** dipindah ke kelompok UKK; menu **Observasi LKPD Praktik** (sebelumnya Observasi praktik siswa) dipindah ke kelompok LKPD Praktik. Pengelompokan diatur di `js/menu-dasbor.js` (opsi `post`).
- Penamaan lama diganti di menu, kartu beranda, ubin, judul halaman, PDF, sheet dan nama berkas Excel (`Rekap_Observasi_LKPD_Praktik`), README dan dokumen. Nama internal (`observasi-siswa`, `tipe` = `siswa`) tidak diubah agar data lama tetap terbaca.
- `service-worker.js` naik ke `tbsm-v101`.
- Kelompok menu di laci (LKPD Praktik, UKK, Soal dan ujian, Penilaian dan acuan, Administrasi, Akun dan aplikasi) kini dapat dibuka/ditutup dengan mengetuk judulnya. Default tertutup, kecuali kelompok yang berisi menu yang sedang dibuka. Buka/tutup manual diingat selama menu aktif sama (`js/menu-dasbor.js`); Tombol **Keluar** dipisah dari kelompok Akun dan aplikasi sehingga selalu terlihat. `service-worker.js` naik ke `tbsm-v103`.

## Pembaruan: menu dan tombol
- **Judul kelompok menu** selebar laci, tinggi 44 px, dengan jumlah isi dan panah. Default tertutup kecuali kelompok yang berisi menu aktif. Kelompok yang dibuka manual diingat di perangkat (per akun); kelompok menu aktif selalu terbuka saat menu itu dibuka.
- **Terakhir dibuka**: sampai 3 menu terakhir tampil di bawah Beranda (disimpan di perangkat, per akun).
- **Baris menu** lebih padat (ikon 38 px) dan subjudul satu baris. **Keluar** tetap terlihat. Fokus keyboard terkunci di dalam laci saat terbuka.
- **Beranda**: ubin **Observasi UKK** untuk Admin dan Guru. Untuk 7 ubin (Admin), ubin Menu melebar satu baris penuh.
- **Form Observasi UKK**: bar tetap di bawah layar berisi jumlah terisi, nilai sementara, tombol **Belum diisi** (gulir ke aspek yang belum lengkap, disorot) dan **Simpan**. Simpan yang gagal karena belum lengkap juga menggulir ke aspek itu.
- **Warna skala 1-4**: 1 merah, 2 kuning, 3 hijau, 4 hijau dengan cincin; label Sangat Kompeten di rekap dan daftar berwarna hijau penuh.
- **Daftar**: tombol utama Observasi baru, lalu Rekap nilai dan menu **Ekspor** (Rekap nilai Excel, Rincian aspek Excel). Tombol PDF dan Excel menampilkan "Menyiapkan..." selama diproses. Tombol aksi tingginya minimal 42 px.
- Urutan skrip: `observasi-ukk.js` dimuat sebelum `menu-dasbor.js` agar baris menunya ikut dikelompokkan. `service-worker.js` naik ke `tbsm-v104`.
