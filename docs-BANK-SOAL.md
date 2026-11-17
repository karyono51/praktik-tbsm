# Bank soal (v41, bentuk soal mengikuti acuan TKA)

Fitur terpisah dari LKPD. Menu: **Bank soal** (semua peran).

## Siswa
- **Latihan**: pilih mapel, jenis soal, dan jumlah. Tanpa batas waktu. Tombol *Periksa jawaban* menampilkan benar/salah dan pembahasan per soal. Hasil masuk Riwayat.
- **Ujian**: sesi dari guru untuk kelas siswa. Satu kali pengerjaan, timer mundur, soal dan pilihan diacak. Waktu tetap berjalan bila aplikasi ditutup; jawaban dikirim otomatis saat waktu habis. Berpindah dari halaman ujian dicatat (terlihat guru). Pembahasan tampil bila guru mengaktifkannya.
- **Riwayat**: semua latihan dan ujian, dengan detail jawaban sesuai aturan di atas.

## Guru dan Admin
- **Bank soal**: 60 soal bawaan (40 PG, 10 PG kompleks, 10 PG kategori). Atur *Peruntukan* tiap soal: Latihan, Ujian, atau Latihan dan ujian. Soal bisa dinonaktifkan. Soal bawaan tidak diubah isinya, tetapi bisa **Salin dan ubah**. **Tambah soal sendiri** (PG, PG kompleks, PG kategori, sesuai aturan bentuk soal di bawah) lengkap dengan kelas, topik, dan pembahasan.
- **Sesi ujian**: judul, kelas, durasi, KKM, jadwal buka/tutup (opsional), pilih soal otomatis (jumlah dan batasan mapel; tiap siswa mendapat soal berbeda) atau pilih soal sendiri, acak, tampilkan pembahasan.
- **Hasil**: filter per sesi atau latihan, nilai, status Kompeten, jumlah keluar halaman, detail jawaban, hapus hasil (siswa bisa mengulang sesi), **ekspor Excel**.

## Aturan bentuk soal (tiga jenis TKA)
Mengikuti tiga bentuk soal TKA SMA/SMK (Peraturan Kepala BSKAP No. 045 Tahun 2025). Berlaku untuk soal sendiri; soal bawaan dikecualikan.

| | PG sederhana | PG kompleks (MCMA) | PG kompleks kategori |
|---|---|---|---|
| Struktur | wajib 5 pilihan (A sampai E), tepat 1 kunci | wajib 5 pilihan, kunci minimal 2 | 3 sampai 6 pernyataan |
| Label | - | - | Benar/Salah atau Sesuai/Tidak Sesuai |
| Skor | benar 1, salah 0 | sebagian, pilihan salah mengurangi pilihan benar, minimal 0 | sebagian, respons salah mengurangi respons benar, minimal 0 |

- **Soal baru dan soal yang diubah** (form maupun impor Excel) ditolak bila tidak memenuhi aturan.
- **Soal sendiri lama atau hasil impor lama yang belum memenuhi aturan** tetap tampil, bertanda *Belum sesuai aturan*, dan hanya dipakai untuk **latihan**. Soal itu tidak masuk pool ujian (otomatis maupun pilihan manual) sampai dilengkapi lewat Ubah. Pemeriksaan ini juga berjalan di fungsi server CBT.
- **Soal bawaan** dikecualikan: 40 PG bawaan tetap 4 opsi. Soal PG kompleks dan kategori bawaan sudah memenuhi aturan.
- Label kategori lama di luar dua pasangan itu otomatis menjadi Benar/Salah saat soalnya dibuka di form Ubah.
- LKPD tidak berubah (modul LKPD punya editor soal sendiri).

## Penilaian
- PG: benar = 1, salah = 0.
- PG kompleks: (kunci terpilih − pilihan salah) ÷ jumlah kunci, minimal 0.
- PG kategori: (respons benar − respons salah) ÷ jumlah pernyataan, minimal 0. Pernyataan yang tidak dijawab dihitung kosong (tidak mengurangi).
- Uraian (bukan bentuk soal TKA, hanya untuk ujian sekolah): dinilai guru memakai rubrik di tab Uraian (CBT Online). Skor uraian ÷ skor maksimum dikalikan bobot (bawaan 2) dalam rata-rata nilai; soal PG bobotnya 1. Uraian yang belum dinilai belum dihitung dan nilai siswa ditandai sementara. Lihat docs-URAIAN.md.
- Nilai = jumlah skor ÷ jumlah soal × 100, dibulatkan.
- Rumus yang sama dipakai di aplikasi dan di fungsi server (`functions/cbt`, salinan di `akun-admin`).

## Pemasangan
1. Zip ini hanya berisi berkas yang berubah. Jalankan `unzip -o` di folder `~/tbsm`, lalu `git add . && git commit && git push`.
2. Buat koleksi Appwrite (sekali saja), dari folder proyek di Termux:
   `node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil`
   Hapus API key setelah selesai.
3. Buka aplikasi, menu **Perbarui aplikasi** (versi `tbsm-v41`).

## Koleksi dan izin
| Koleksi | Isi | Baca | Tulis |
|---|---|---|---|
| `banksoal` | soal buatan guru dan pengaturan peruntukan soal bawaan | semua pengguna login | label guru/admin |
| `soal_sesi` | sesi ujian | semua pengguna login | label guru/admin |
| `soal_hasil` | hasil latihan dan ujian | guru/admin, siswa hanya miliknya | siswa membuat; guru/admin ubah dan hapus |
| `soal_run` | catatan ujian berjalan (waktu mulai server, jawaban sementara) | guru/admin, siswa hanya miliknya | siswa membuat dan mengubah miliknya; guru/admin ubah dan hapus |

Catatan keamanan: kunci jawaban ikut terunduh ke peramban karena penilaian dilakukan di aplikasi, sama seperti LKPD. Cocok untuk latihan dan ujian harian. Untuk ujian bertaruhan tinggi gunakan Appwrite Function untuk menilai di server.

## Mode offline
Latihan dan ujian yang sedang berjalan tersimpan di perangkat. Hasil yang belum terkirim diantre dan dikirim saat online. Menu Segarkan data juga memuat ulang bank soal.

## Filter bertingkat
Pencarian Bank soal (guru/admin) memakai filter bertingkat Mapel > Kelas > Modul/LKPD, ditambah Elemen CP, Jenis, dan Peruntukan. Lihat docs-FILTER-BERTINGKAT.md.

## Impor dan ekspor soal (v47)
Hanya Guru dan Admin, di tab **Bank soal** (tombol Impor soal, Template, Ekspor Excel). Berkas: `js/banksoal-io.js`. Tidak ada perubahan koleksi Appwrite.
- **Ekspor Excel**: mengekspor soal yang sedang tampil sesuai filter (filter kosong = semua soal, termasuk bawaan). Berisi sheet Soal dan Petunjuk. File ini bisa diedit lalu diimpor ulang.
- **Template**: file `templates/Template_Impor_Bank_Soal.xlsx` berisi tiga soal contoh dan petunjuk kolom. Kolom Jenis, Kelas, Peruntukan, dan Status berupa dropdown. Kolom Mapel berupa dropdown dari mapel yang ada, tetapi boleh diketik bebas untuk mapel baru. Daftar mapel ada di sheet Daftar; tambahkan di sana bila ingin muncul di dropdown. Hapus baris contoh sebelum impor.
- **Impor**: .xlsx, .xls, atau .csv, maksimal 500 baris. Pratinjau dulu (baru, diperbarui, dilewati, ditolak beserta alasan per baris), lalu tekan Terapkan.
- Kolom: ID, Jenis, Mapel, Topik, Kelas, Peruntukan, Status, Soal, A sampai E, Kunci, Label 1, Label 2, Pernyataan 1-6, Kunci 1-6, Pembahasan.
- ID kosong = soal baru. ID soal sendiri yang sudah ada = soal diperbarui. ID soal bawaan (tka-...) = hanya Peruntukan, Kelas, dan Status yang berubah.
- Soal baru yang jenis, mapel, dan teksnya sama dengan soal yang sudah ada dilewati, jadi aman bila file diimpor dua kali.
- Kunci PG: satu huruf (B). PG kompleks: minimal dua huruf (A,C). PG kategori: isi Label 1 atau Label 2 (atau 1 / 2) pada Kunci 1-6; pilih pasangan Benar/Salah atau Sesuai/Tidak Sesuai.
- Uraian: Jenis Uraian, kosongkan A sampai E; Kunci = kunci jawaban teks; Rubrik = satu kriteria per baris sel, format `kriteria | skor` (maks 6 kriteria, jumlah skor maks 100); Bobot dan Batas karakter opsional.
- Baris yang melanggar aturan bentuk soal (kurang dari 5 pilihan, kunci kompleks kurang dari 2, pernyataan kurang dari 3, label di luar dua pasangan) ditolak pada pratinjau beserta alasannya.

## Gambar pada soal dan pilihan

- Berlaku untuk PG dan PG kompleks: satu gambar pada soal, dan satu gambar pada tiap pilihan (A sampai E). Pilihan boleh berisi teks, gambar, atau keduanya, tetapi tidak boleh kosong dua-duanya (aturan 5 pilihan tetap berlaku).
- PG kategori: hanya soalnya yang boleh bergambar, pernyataannya tidak.
- Gambar dipilih dari galeri atau kamera di form soal, lalu dikecilkan otomatis (sisi terpanjang 800 px, sekitar 100 KB).
- Penyimpanan: Google Drive lewat fungsi `foto-drive` (lihat docs-FOTO-DRIVE.md). Di soal hanya tersimpan penanda `qi` (gambar soal) dan `oi` (lima gambar pilihan) di kolom payload, jadi tidak perlu koleksi Appwrite baru.
- Saat soal disimpan, gambar baru ditaruh dulu di IndexedDB perangkat guru (`tmp:`), lalu diunggah ke Drive sebelum dokumen soal dikirim ke server. Bila unggah gagal (offline), soal tetap di antrean dan terkirim saat sinyal kembali.
- Siswa: gambar dimuat lewat `getsoal` dan disimpan di IndexedDB perangkat. Saat ujian dimulai semua gambar soal dimuat di latar belakang, jadi ujian yang sedang berjalan tetap utuh walau sinyal hilang.
- Impor Excel tidak membawa gambar; tambahkan gambar lewat Ubah soal setelah impor. Ekspor Excel tidak menyertakan gambar (aplikasi memberi tahu bila ada soal bergambar).
- Soal bawaan tidak bergambar.

## Cetak soal untuk ujian kertas

- Tab Bank soal (guru/admin): tombol **Cetak soal untuk ujian kertas**. Yang dicetak adalah soal aktif sesuai pencarian dan filter yang sedang dipakai, jadi atur filter mapel, jenis, atau peruntukan dulu.
- Pilihan di dialog: judul, mata pelajaran, kelas, waktu, jumlah soal, acak urutan soal, kunci jawaban (halaman terpisah untuk guru), dan pembahasan di kunci.
- Soal dikelompokkan PG, PG kompleks, PG kategori. PG kompleks memakai kotak centang, PG kategori berbentuk tabel Benar/Salah. Nomor berlanjut sesuai kunci jawaban.
- Gambar soal dan gambar pilihan ikut tercetak. Gambar dimuat dulu ke perangkat; bila ada yang belum termuat, aplikasi bertanya apakah tetap dicetak dan tempat gambarnya diberi keterangan.
- Lembar bukan hasil sesi ujian online (sesi memilih soal per siswa saat ujian dimulai). Untuk ujian kertas, pilih soal lewat filter lalu cetak.
- Di dialog cetak ponsel pilih "Simpan sebagai PDF" bila ingin berkas. Kode: `js/cetak-soal.js`.

## Pengelompokan mapel (v58x)
Berkas: `js/bank-kelompok.js` (dimuat setelah `akademik.js`, sebelum `bank-filter.js`). Tidak ada perubahan data atau koleksi Appwrite.
- Daftar mapel di Bank soal tidak lagi satu daftar abjad. Urutannya: Kelompok Umum, Kelompok Kejuruan, Dasar-Dasar Program Keahlian Teknik Otomotif, Kompetensi Keahlian Teknik Sepeda Motor, Mata Pelajaran Pilihan (mengikuti Administrasi Akademik), lalu **LKPD Kelas X, XI, XII** (urut nomor unit), dan **Mapel lainnya** (nama mapel yang diketik guru dan belum ada di master).
- Berlaku di: filter Mapel pada tab Bank soal (guru/admin, dengan jumlah soal per mapel), Atur latihan siswa (hanya mapel yang punya soal untuk kelas siswa, dengan jumlah soal), filter Mapel di Riwayat latihan, daftar saran mapel di form soal, dan chip "Batasi mata pelajaran" di sesi ujian.
- Judul LKPD dikenali dari awalan `LKPD X-`, `LKPD XI-`, `LKPD XII-`; bukan mata pelajaran, jadi ditaruh di kelompok LKPD sendiri.
- Mapel bawaan: Bahasa Indonesia (Umum), Matematika dan Bahasa Inggris (Kejuruan), Dasar TBSM (Dasar-Dasar Program Keahlian).
