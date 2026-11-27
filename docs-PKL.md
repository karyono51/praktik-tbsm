# Menu PKL (Praktik Kerja Lapangan)

Menu **PKL** untuk Siswa, Guru, Admin (Kepala Sekolah hanya melihat). Mengacu pada *Panduan PKL sebagai Mata Pelajaran dalam Implementasi Kurikulum Merdeka* (Direktorat SMK, 2023). CP, elemen, dan TP PKL ada di Administrasi Akademik (tab Peta LKPD, lihat `docs-LKPD-KODE.md`).

## Siswa
- Tempat PKL, guru pembimbing, instruktur, jam kerja, dan periode penempatan.
- **Absen dengan selfie**: Masuk, Pulang, Izin, Sakit. Selfie wajib untuk Masuk dan Pulang (kamera depan; jam dan tanggal dicetak pada foto), opsional untuk Izin/Sakit (keterangan wajib). Lokasi GPS ikut tercatat dan dibandingkan dengan koordinat tempat PKL: **Di lokasi** atau **Di luar lokasi ±N m**. Lokasi tidak memblokir absen (GPS bisa gagal); hasilnya tampil untuk guru. Satu absen Masuk dan satu Pulang per hari; Pulang butuh Masuk.
- **Jurnal kegiatan** (Lampiran 2): tanggal, unit kerja/pekerjaan, uraian. Catatan instruktur/pembimbing tampil setelah diberi guru. Jurnal yang belum diberi catatan bisa diubah 7 hari.
- Rekap kehadiran sendiri (hadir, izin, sakit, tanpa keterangan), riwayat absen, dan daftar tempat PKL.

## Guru dan Admin (tab)
- **Tempat PKL**: nama, bidang, alamat, kontak, pimpinan, instruktur, kuota, jam kerja, nomor perjanjian kerja sama (sekolah dan mitra), masa berlaku, fasilitas/insentif, koordinat dan radius absen. Status perjanjian (belum diisi / berlaku / berakhir) dan peringatan **Perlu monitoring**.
- **Penempatan**: siswa, tempat, guru pembimbing, instruktur, periode, status. Kuota dan satu penempatan aktif per siswa dijaga. Daftar siswa yang belum ditempatkan.
- **Absensi**: per tanggal, dengan foto selfie (ketuk untuk memperbesar), status lokasi, dan daftar yang belum absen.
- **Jurnal**: yang belum diberi catatan tampil lebih dulu; catatan dan penanda "diketahui oleh".
- **Kunjungan**: monitoring minimal sebulan sekali (kunjungan atau daring), temuan dan tindak lanjut.
- **Nilai**: skor 4 TP (0-100) dan catatan guru/instruktur (Lampiran 4 dan 5). Nilai akhir = rata-rata TP yang terisi; kehadiran diambil otomatis dari absensi.
- **Kelengkapan** per siswa (11 butir): pembekalan, naskah kerja sama, jaminan K3, persetujuan orang tua, program TP-ATP, penyerahan, orientasi, laporan, presentasi, asesmen instruktur, sertifikat.
- **Cetak PDF** (jsPDF, butuh pustaka PDF termuat): **Daftar Nilai PKL** per siswa atau semua siswa (satu halaman per siswa; format Lampiran 5: identitas, TP dengan skor dan deskripsi, nilai akhir, catatan, kehadiran, tanda tangan guru pembimbing dan pembimbing dunia kerja) dari tab Nilai dan Rekap; **Jurnal PKL** (Lampiran 2: hari/tanggal, unit kerja, uraian, catatan) dari tab Rekap. Siswa dapat mencetak jurnalnya sendiri dari menu PKL.
- **Rekap** per siswa dan **unduh Excel** (Tempat PKL, Penempatan, Absensi, Rekap kehadiran, Jurnal, Kunjungan, Nilai, Kelengkapan).
- "Tanpa keterangan" = hari kerja Senin-Jumat sejak mulai PKL dikurangi hadir, izin, sakit (perkiraan; hari libur belum dikurangi).

## Excel dan PDF per tab (Guru/Admin; Kepala Sekolah hanya ekspor dan cetak)
Tombol ada di bawah judul tiap tab (`js/pkl-xls.js` untuk Tempat PKL, `js/pkl-io.js` untuk tab lain, `js/pkl-pdf.js` untuk PDF). Ekspor dan PDF mengikuti **saringan yang aktif** di tab (yang tampil = yang diekspor/dicetak); keterangan saringan tercantum di PDF. Siswa tidak melihat tombol ini.

| Tab | Ekspor Excel | Template + Impor Excel | Cetak PDF |
|---|---|---|---|
| Tempat PKL | semua kolom formulir + info siswa aktif, status PKS, monitoring terakhir | ya (kunci Nama + Kota) | daftar tempat (kuota terisi, PKS, monitoring terakhir) |
| Penempatan | siswa, NIS, kelas, tempat, kota, guru, instruktur, periode, status | ya (kunci Siswa + Tempat) | daftar penempatan |
| Absensi | per tanggal terpilih: lembar per siswa (Hadir/Izin/Sakit/Belum absen) + lembar catatan absen | tidak | daftar hadir harian |
| Jurnal | semua jurnal yang tampil (layar hanya 60) | tidak | jurnal banyak siswa, satu siswa per halaman (format Lampiran 2) |
| Monitoring | tanggal, tempat, guru, cara, temuan, tindak lanjut | ya (kunci Tanggal + Tempat) | laporan monitoring |
| Nilai | TP1-TP4, nilai akhir, predikat, catatan | ya, template berisi siswa dan nilai saat ini (kunci siswa) | rekap nilai (Lampiran 5 per siswa tetap ada) |
| Kelengkapan | 11 tahapan Ya/Belum + jumlah | ya, template berisi kondisi saat ini | matriks v/- |
| Rekap | tabel rekap sesuai saringan (tombol Unduh Excel lama tetap = workbook lengkap) | tidak | rekap kehadiran dan nilai |

Absensi dan Jurnal **sengaja tanpa impor**: keduanya dibuat siswa dengan selfie, jam perangkat, dan GPS sebagai bukti, sehingga impor akan melewati bukti itu.

Aturan impor (semua jenis; Guru/Admin; `.xlsx`, `.xls`, `.csv`; maksimal 500 baris):
- Judul kolom dikenali tanpa memandang huruf besar/kecil dan tanda baca, jadi berkas hasil ekspor bisa diedit lalu diimpor kembali.
- Siswa dikenali dari **NIS/Username** (angka dengan atau tanpa titik dan nol di depan) atau, bila kosong, dari nama (isi Kelas/NIS bila nama kembar). Tempat dari Nama + Kota; guru dari nama akun guru. Yang tidak dikenali ditolak per baris, baris lain tetap jalan.
- **Sel kosong tidak menghapus** isi yang sudah ada; baris yang tidak berubah dilewati; baris bertanda `(CONTOH)` dilewati. Pada Nilai dan Kelengkapan, baris yang hanya berisi identitas dilewati.
- Pratinjau (baru, diperbarui, tidak berubah, ditolak, alasan per baris) tampil sebelum data disimpan. Penyimpanan lewat `pkPut` seperti formulir (mode lokal, Appwrite tanpa koleksi baru, antrean offline).
- Penempatan: kuota tempat dan satu penempatan aktif per siswa dijaga selama impor. Memindahkan siswa: tulis baris tempat lama dengan Status Selesai dan baris tempat baru dengan Status Aktif; baris Selesai/Dibatalkan diproses lebih dulu. Siswa + Tempat yang sudah ada diperbarui (tanggal dan guru boleh diubah); Mulai/Selesai wajib untuk penempatan baru.
- Template Penempatan dan Monitoring menyertakan lembar Rujukan (siswa beserta status penempatan, tempat beserta sisa kuota, guru) agar nama tidak salah ketik.
- Uji: `node tools/uji-pkl-xls.mjs` (Tempat PKL) dan `node tools/uji-pkl-io.mjs` (tab lain dan PDF); SheetJS dan jsPDF diganti tiruan kecil di node.

## Penyimpanan
- Mode lokal: `localStorage` kunci `tbsm-pkl`.
- Mode Appwrite, tiga koleksi dengan kolom sama (`jenis, sekolah, nama, ts, oleh, sid, tanggal, payload`): jalankan `node tools/setup-appwrite.mjs --only=pkl,pkl_catat,pkl_nilai` (atau `appwrite push collections`).
  - `pkl` (tempat, penempatan): **dibaca semua pengguna login** supaya siswa melihat tempat dan penempatannya; hanya guru/admin menulis. Penempatan **tidak menyimpan nama siswa** (hanya `sid`), jadi siswa lain tidak bisa melihat siapa ditempatkan di mana. Temuan audit izin `BACA-USERS:pkl` diterima dengan alasan ini.
  - `pkl_catat` (absen, jurnal): siswa membuat (document security: pemilik membaca/mengubah miliknya), guru/admin membaca, mengubah, menghapus.
  - `pkl_nilai` (kunjungan, nilai, kelengkapan): hanya guru/admin.
- Selfie dikecilkan (maks 480 px, sekitar 40 KB, JPEG).
  - **Fungsi `foto-drive` v1.2.0 terpasang** (sama dengan foto bukti LKPD): selfie diunggah ke folder Drive **TBSM Bukti Praktik** dengan nama `PKL_<Kelas>_<Nama>_<jenis>_<tanggal-jam>_<xxxx>`, dan `payload` absen hanya menyimpan `drive:<fileId>`. Guru/admin dan pemilik absen melihatnya lewat aksi `getpkl` (izin dokumen `pkl_catat` dipakai; fileId harus sama dengan penanda di dokumen). Foto diambil bertahap, maksimal 3 sekaligus.
  - **Fungsi belum dipasang atau versi lama**: selfie tetap disimpan di `payload` (tidak ada yang hilang). Bila Google/Drive sedang bermasalah, absen ditahan di perangkat dan dicoba lagi saat data PKL dimuat.
  - Setelah terkirim, salinan di perangkat tidak menyimpan data fotonya (hemat ruang); penanda Drive tetap ada.
- Absen yang dibuat saat offline tersimpan di perangkat dan dikirim saat data PKL dimuat lagi. Jika koleksi belum dibuat, aplikasi tetap berjalan dan menampilkan petunjuk.

## Batasan yang perlu diketahui
- Jam absen berasal dari jam perangkat siswa dan lokasi dari GPS perangkat; keduanya bisa dimanipulasi. Selfie dan status lokasi membantu pemeriksaan guru, bukan bukti mutlak.
- Belum ada cetak naskah perjanjian kerja sama; datanya (nomor, masa berlaku) tersedia di Excel.
- Impor tidak tersedia untuk Absensi dan Jurnal (lihat alasan di atas) dan belum ada cetak PDF per siswa untuk absensi bulanan; rekap kehadiran tersedia di PDF Rekap dan Daftar hadir harian.
- Nilai tidak ditampilkan ke siswa.

## Pilihan dan saringan (select)
- Semua dropdown PKL membuka lembar pilihan aplikasi (`js/bank-pilihan.js`). Kotak Cari muncul otomatis bila pilihan 8 atau lebih, dan selalu pada pilihan Siswa.
- Pilihan bertanda abu-abu dan nonaktif tidak bisa dipilih: siswa yang sudah punya penempatan aktif, dan tempat yang kuotanya penuh. Aturan yang sama tetap diperiksa saat Simpan.
- Menambah pilihan baru: buat daftar opsi lewat `pkO(nilai, teks, keterangan, nonaktif)` dan `pkG(judul, opsi)`, lalu pasang di `pkSchema` (isian) atau tambahkan atribut di `PK_SARING`, `PK_SL`, dan `pkAttr` (saringan).
