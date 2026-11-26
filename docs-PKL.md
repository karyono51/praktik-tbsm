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
- **Rekap** per siswa dan **unduh Excel** (Tempat PKL, Penempatan, Absensi, Rekap kehadiran, Jurnal, Kunjungan, Nilai, Kelengkapan).
- "Tanpa keterangan" = hari kerja Senin-Jumat sejak mulai PKL dikurangi hadir, izin, sakit (perkiraan; hari libur belum dikurangi).

## Penyimpanan
- Mode lokal: `localStorage` kunci `tbsm-pkl`.
- Mode Appwrite, tiga koleksi dengan kolom sama (`jenis, sekolah, nama, ts, oleh, sid, tanggal, payload`): jalankan `node tools/setup-appwrite.mjs --only=pkl,pkl_catat,pkl_nilai` (atau `appwrite push collections`).
  - `pkl` (tempat, penempatan): **dibaca semua pengguna login** supaya siswa melihat tempat dan penempatannya; hanya guru/admin menulis. Penempatan **tidak menyimpan nama siswa** (hanya `sid`), jadi siswa lain tidak bisa melihat siapa ditempatkan di mana. Temuan audit izin `BACA-USERS:pkl` diterima dengan alasan ini.
  - `pkl_catat` (absen, jurnal): siswa membuat (document security: pemilik membaca/mengubah miliknya), guru/admin membaca, mengubah, menghapus.
  - `pkl_nilai` (kunjungan, nilai, kelengkapan): hanya guru/admin.
- Selfie dikecilkan (maks 480 px, sekitar 40 KB, JPEG) dan disimpan di `payload` absen. Setelah terkirim, salinan di perangkat tidak menyimpan fotonya (hemat ruang). Foto tidak dikirim ke Google Drive.
- Absen yang dibuat saat offline tersimpan di perangkat dan dikirim saat data PKL dimuat lagi. Jika koleksi belum dibuat, aplikasi tetap berjalan dan menampilkan petunjuk.

## Batasan yang perlu diketahui
- Jam absen berasal dari jam perangkat siswa dan lokasi dari GPS perangkat; keduanya bisa dimanipulasi. Selfie dan status lokasi membantu pemeriksaan guru, bukan bukti mutlak.
- Belum ada cetak PDF daftar nilai (Lampiran 5) dan naskah perjanjian kerja sama; data tersedia di Excel.
- Nilai tidak ditampilkan ke siswa.
