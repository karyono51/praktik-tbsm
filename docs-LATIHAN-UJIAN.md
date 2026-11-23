# Pembeda LKPD mode Latihan dan mode Ujian

Berkas: `js/lkpd-pandu.js` (logika baru), pengait kecil di `js/lkpd-mode.js`, `js/lkpd-staff.js`, `js/lkpd-editor.js`, `js/lkpd-drive.js`. Uji: `node tools/uji-pandu.mjs` (logika, panel, alur kirim, dan waktu, 101 uji) dan `node tools/uji-pandu-v2.mjs` (render LKPD v2 asli dan daftar kartu, 42 uji). Tidak ada perubahan Appwrite: pengaturan baru disimpan pada objek LKPD seperti pengaturan mode yang sudah ada.

## 0. Susunan panel Pengaturan
Panel kini terdiri dari **Ringkasan untuk siswa** (daftar efek pilihan saat ini, ikut berubah saat opsi diubah) lalu bagian bernomor yang mengikuti mode:
- **Mode Ujian:** 1 Paket dan mode, 2 Aturan Ujian (kesempatan, isi disembunyikan, foto semua komponen), 3 Latihan sebelum Ujian, 4 Jadwal dan kunci pertemuan, 5 Foto bukti per komponen, 6 Terapkan dan simpan.
- **Mode Latihan:** 1 Paket dan mode, 2 Aturan Latihan (kunci dan pembahasan, berpemandu), 3 Jadwal dan kunci pertemuan, 4 Foto bukti per komponen, 5 Terapkan dan simpan.
Kontrol khusus Ujian tidak tampil saat Latihan, dan sebaliknya. Mencentang "Latihan dulu, baru Ujian" langsung memunculkan kolom Syarat nilai.

## 1. Latihan berpemandu, Ujian mandiri
- **Latihan** (opsi guru "Latihan berpemandu", bawaan aktif): tab Lembar Kerja diawali kartu panduan hijau. Petunjuk komponen dan poin kritis langkah tampil penuh. Angka acuan standar tidak langsung tampak: siswa membukanya lewat tombol **Bantuan: lihat angka acuan** setelah mencoba sendiri.
- **Ujian**: kartu oranye "Ujian mandiri" memuat aturan (tanpa petunjuk dan angka acuan, cari standar di manual servis, langkah saksi guru harus disaksikan guru, jumlah kesempatan). Angka acuan **selalu** disembunyikan saat Ujian, terlepas dari sakelar "Petunjuk komponen". Opsi **Foto bukti wajib pada semua komponen (Ujian)** menambah foto wajib ke semua komponen pemeriksaan (di luar daftar foto wajib biasa).
- Berlaku untuk LKPD v2 pada tampilan siswa dan Pratinjau guru. Kartu hanya muncul saat Lembar Kerja terbuka (tidak di layar "Lembar Kerja terkunci").

## 2. Latihan lalu Ujian di satu LKPD (tanpa salinan)
- Cukup **satu LKPD**. Di Pengaturan LKPD berstatus **Ujian** ada bagian "Latihan sebelum Ujian" (tidak sama dengan "Gerbang masuk" soal TKA di dalam LKPD v2). Centang **Latihan dulu, baru Ujian**, lalu pilih syarat **KKM 1 kali** atau **2 kali berturut-turut**. Siswa tidak melihat dua LKPD berjudul sama.
- **Tahap 1, Latihan:** siswa baru memulai dari Latihan. LKPD tampil dengan mode Latihan (kartu berpemandu, Bantuan angka acuan, kunci dan pembahasan, tanpa batas kesempatan). Kartu daftar menampilkan "Tahap 1: Latihan n/N". Pengumpulan otomatis bertanda Latihan dan **tidak masuk Rekap nilai**.
- **Tahap 2, Ujian:** setelah nilai latihan mencapai KKM sesuai syarat, LKPD yang sama otomatis menjadi Ujian (Ujian mandiri, angka acuan disembunyikan, aturan kesempatan dan foto berlaku). Kartu menampilkan "Tahap 2: Ujian". Pengumpulan bertanda Ujian dan masuk Rekap nilai. Isian draf dikosongkan setiap kali LKPD dikirim, jadi Ujian dimulai dari lembar bersih.
- **Remedial:** bila Ujian terakhir siswa belum kompeten (di bawah KKM) dan masih ada jatah, LKPD kembali ke Tahap 1 dengan penanda "Remedial". Hanya nilai Latihan **sesudah** Ujian itu yang dihitung. Bila jatah Ujian sudah habis, LKPD tetap Ujian (latihan tambahan tidak membuka percobaan baru).
- Mode yang berlaku dihitung per siswa dari data pengumpulan (nilai koreksi guru bila ada). Guru selalu melihat konfigurasi dasar (Ujian) dengan keterangan alur bertahap, dan tidak terkena tahap. Pratinjau guru menampilkan versi Ujian.
- Tahap tidak ikut saat "Terapkan ke semua LKPD" (khusus per LKPD). Menyimpan sebagai mode Latihan membuang pengaturan tahap.
- **Perubahan dari versi sebelumnya:** tombol "Buat salinan Latihan" dan pilihan LKPD Latihan prasyarat dihapus. Bila ada salinan `-L` yang sudah dibuat, sembunyikan atau hapus lewat daftar LKPD. Bidang `gerbang` lama pada LKPD diabaikan dan dibuang saat pengaturan disimpan.

## 2b. Gerbang masuk hanya di Latihan, Evaluasi hanya di Ujian (LKPD v2)
Soal yang sama di dua tahap hanya menguji hafalan, jadi dipisah menurut mode yang sedang berlaku bagi siswa:
- **Latihan:** soal **Gerbang masuk** (TKA) tampil di tab Materi dan tetap mengunci Lembar Kerja sampai lulus. Tab **Evaluasi tidak ada** (isinya hanya catatan bahwa Evaluasi dikerjakan di Ujian), dan blok "Pembahasan latihan" tidak muncul. Nilai Latihan dihitung dari **praktik saja**, supaya bobot teori yang tidak dikerjakan tidak menurunkan nilai dan syarat KKM tahap Latihan adil.
- **Ujian:** soal Gerbang masuk **tidak tampil** dan tidak mengunci Lembar Kerja. Tab **Evaluasi ada**; aturan v2 yang lama tetap berlaku (terbuka setelah guru memverifikasi praktik dengan nilai minimal KKM). Nilai Ujian memakai rumus asli (praktik x bobot + teori x bobot).
- Pratinjau guru menampilkan versi Ujian. Detail kiriman Ujian di sisi guru tidak lagi memuat bagian Gerbang masuk. Detail kiriman Latihan tidak berubah.
- Berlaku juga untuk LKPD tanpa tahap: LKPD bermode Latihan murni memakai aturan Latihan, LKPD bermode Ujian memakai aturan Ujian.
- Gerbang masuk tidak menampilkan kunci atau pembahasan kepada siswa. Pembahasan hanya ada di blok "Pembahasan latihan" milik soal Evaluasi, yang kini tidak tampil di Latihan.

## 2c. Waktu: alokasi total berbeda dari waktu satu sesi
- `duration` LKPD v2 adalah **alokasi pembelajaran total** (LKPD-X-07: 20 JP x 45 menit = 900 menit, 5 pertemuan x 180 menit), bukan waktu sekali mengerjakan.
- Kartu dan daftar LKPD v2 kini menampilkan "20 JP · 5 pertemuan", bukan "900 menit". LKPD tanpa pertemuan tetap menampilkan menit.
- **Pewaktu:** target = menit per pertemuan (180). Ujian: merah bila melewati 180 menit, tidak bisa dijeda. Latihan: "Perkiraan 180 menit per pertemuan · waktu bebas", tidak pernah merah.
- **Pemeriksaan integritas:** peringatan "dikerjakan terlalu cepat" kini membandingkan dengan waktu satu pertemuan (bukan 810 menit). Sebelumnya setiap kiriman di bawah sekitar 202 menit terkena peringatan.
- Pewaktu adalah penghitung maju, bukan batas keras: LKPD tidak otomatis tertutup saat waktu lewat.

## 3. Paket cepat
Tombol **Paket Latihan** dan **Paket Ujian** di atas panel Pengaturan mengisi semua opsi sekaligus (belum tersimpan sampai Simpan pengaturan; jadwal dan status tampil tidak diubah).
- Paket Latihan: mode Latihan, tanpa batas kesempatan, kunci dan pembahasan tampil, panduan aktif, tanpa tahap Latihan, foto semua komponen mati.
- Paket Ujian: mode Ujian, 1 kesempatan, teori, penjelasan langkah, dan petunjuk disembunyikan, kunci tidak tampil, foto bukti wajib pada semua komponen. Pilihan Latihan dulu yang sudah dicentang tidak dihapus.

## 4. Catatan
- Tahap dan penghitungan memakai data pengumpulan di perangkat (`S.lkpd`), sama seperti penghitung kesempatan Ujian. Ini penegak di sisi aplikasi, bukan di server.
- Pengaturan baru: `tahap`, `gKali`, `fotoUjian`, `pandu` pada objek LKPD.
