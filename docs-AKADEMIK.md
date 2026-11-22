# Administrasi Akademik

Menu di laci menu (staf): kelompok **Administrasi Akademik** dengan submenu Guru, Kelas, Daftar siswa, Mata pelajaran, dan Tata kelola.

## Pasang (sekali)
1. Buat dua koleksi baru di Appwrite: `node tools/setup-appwrite.mjs --only=akademik,akademik_sdm`
   - `akademik`: tahun ajaran, rombel, mata pelajaran, tugas mengajar. Dibaca guru dan admin, ditulis admin.
   - `akademik_sdm`: profil guru (NIP, NUPTK, status, pendidikan). Dibaca dan ditulis admin saja; dipisah karena memuat data pribadi.
   - Bila koleksi ini sudah terpasang dari versi lama, jalankan lagi `node tools/setup-appwrite.mjs --only=akademik_sdm` (atau hapus izin `read("label:guru")` di Appwrite Console) agar guru tidak lagi bisa membacanya.
2. Push ke GitHub seperti biasa. Versi berkas dan cache distempel otomatis oleh `tools/rilis.mjs`.
3. Masuk sebagai admin, buka Administrasi Akademik. Kurikulum bawaan dimuat otomatis saat pertama dibuka.

## Isi
- **Mata pelajaran**: struktur kurikulum SMK (umum, kejuruan, pilihan). Tiap elemen CP menjadi mata pelajaran:
  Dasar-Dasar Teknik Otomotif (8 elemen, Fase E) dan Teknik Sepeda Motor (7 elemen, Fase F), masing-masing memuat unit SKKNI terkait.
  JP sengaja kosong: isi sesuai struktur kurikulum sekolah.
- **Kelas**: rombel per sekolah dan tingkat, wali kelas, anggota siswa. Tombol Sinkronkan dari akun membuat rombel awal dari data siswa.
- **Guru**: daftar dari akun berperan Guru, profil, dan tugas mengajar (mapel x rombel x JP per minggu).
- **Tata kelola**: tahun ajaran aktif (dipakai juga pada formulir UKK), pemeriksaan kelengkapan, acuan regulasi, katalog 55 unit SKKNI, ekspor Excel.

## Sinkronisasi dengan data yang sudah ada
Tombol Sinkronkan: memuat mapel bawaan, mengimpor nama mata pelajaran dari bank soal yang belum ada di master,
membuat rombel dari akun siswa (per sekolah dan tingkat), dan melaporkan akun tanpa sekolah. Aman diulang.
Daftar Mata pelajaran di form bank soal kini memuat mapel master. Modul LKPD terkait dihitung dari kata kunci judul.

## Hak akses
Admin: semua. Guru: melihat mapel, rombel, dan tugas mengajar; profil SDM (NIP, NUPTK) hanya admin. Siswa: tidak ada akses.
Data mengikuti sekolah yang sedang aktif di header (DF atau Medina); data tanpa sekolah dipakai bersama.

## Acuan (ditinjau 15 November 2026)
- Permendikbudristek 12/2024, diubah dengan Permendikdasmen 13/2025 (struktur kurikulum).
- Keputusan Kepala BSKAP 046/H/KR/2025, Lampiran III SMK/MAK (Capaian Pembelajaran). Mencabut 032/H/KR/2024.
- Kepmenaker 147/2019, SKKNI Bidang Teknik Sepeda Motor (kode unit G.45TSM01.001.2 sampai .055.2).
Periksa dokumen resmi sebelum dipakai sebagai dasar keputusan.

## Daftar mata pelajaran per kelompok (v100)
- Mata pelajaran dikelompokkan: **Kelompok Umum**, **Kelompok Kejuruan**, **Dasar-Dasar Program Keahlian Teknik Otomotif** (Dasar-Dasar Teknik Otomotif dan elemennya), **Kompetensi Keahlian Teknik Sepeda Motor** (Teknik Sepeda Motor dan elemennya), dan **Mata Pelajaran Pilihan**. Kolom Kelompok di data tidak diubah; pengelompokan ini hanya tampilan (mengikuti kolom Komponen). Ketuk judul kelompok untuk menyembunyikan atau menampilkannya (pencarian otomatis membuka semua kelompok).
- Urutan mengikuti struktur kurikulum SMK: Umum (PABP, Pendidikan Pancasila, Bahasa Indonesia, PJOK, Sejarah, Seni dan Budaya, Muatan Lokal);
  Kejuruan (Matematika, Bahasa Inggris, Informatika, Projek IPAS, Dasar-Dasar Teknik Otomotif, Teknik Sepeda Motor, Kreativitas/Inovasi/Kewirausahaan, PKL); lalu Pilihan.
  Elemen CP mengikuti induknya sesuai nomor elemen; mapel tambahan menyusul di akhir kelompoknya. Urutan yang sama dipakai di pilihan mapel dan ekspor Excel.
- Judul yang diawali "LKPD" (mis. LKPD X-1 Pemeriksaan Baterai dan Sistem Starter, yang masuk dari soal modul di bank soal) bukan mata pelajaran: disembunyikan dari daftar, pilihan mapel, dan tidak lagi diimpor oleh Sinkronkan kurikulum.

## Perbaikan tata kelola (v101)
- **Profil SDM hanya admin**: izin baca `label:guru` dicabut dari `akademik_sdm`. Aplikasi tidak lagi memuat atau menampilkan NIP/NUPTK untuk guru.
- **JP hanya dari tugas yang berlaku**: tugas dihitung bila rombelnya aktif dan tahun ajarannya sama dengan tahun ajaran aktif (pergantian semester tidak menghapus tugas). Tugas lain tetap tampil di daftar dengan keterangan "tidak berlaku". Pemeriksaan "guru belum bertugas" dan "mapel belum punya pengampu" memakai aturan yang sama.
- **Jumlah siswa rombel** memakai satu hitungan di kartu Kelas, daftar siswa, dan Excel: hanya akun siswa aktif.
- **Pemeriksaan baru**: siswa di lebih dari satu rombel, tingkat rombel berbeda dengan kelas akun, anggota nonaktif atau akunnya hilang.
- **Tugas mengajar**: mapel yang dibatasi tingkat tidak bisa dipasang ke rombel tingkat lain; JP harus bilangan bulat 1 sampai 40; mapel dan rombel yang sama sudah diampu guru lain meminta konfirmasi (mengajar bersama).
- **Kode mapel `TB-xx`** memakai nomor terbesar yang ada, jadi tidak kembar setelah ada yang dihapus. **Tahun ajaran bawaan** memakai id tetap, dua perangkat admin tidak lagi membuat ganda. Tahun ajaran dan semester yang sama tidak bisa ditambah dua kali, dan menandai satu tahun ajaran aktif menonaktifkan yang lain.

## Fokus mapel produktif (v102)
Aplikasi difokuskan pada mata pelajaran produktif/kejuruan: **Dasar-Dasar Teknik Otomotif**, **Teknik Sepeda Motor** (beserta elemen CP), dan **PKL**.
- **Bawaan** hanya memuat mapel itu (18 mapel). Mapel umum, Matematika, Bahasa Inggris, Informatika, Projek IPAS, KIK, dan Koding tidak lagi dibawa.
- **Penanda produktif**: dari kotak *Mapel produktif* di formulir mapel. Data lama tanpa penanda dikenali otomatis (DDTO, TSM, PKL, elemen CP, dan komponen Dasar Program/Konsentrasi Keahlian). Penanda eksplisit mengalahkan pengenalan otomatis.
- **Yang hanya menghitung mapel produktif**: pemeriksaan "mapel belum punya guru pengampu", pilihan mapel pada tugas mengajar, daftar mapel pada form bank soal, dan statistik halaman Mata pelajaran. Tugas mengajar pada mapel non-produktif ditolak (centang dulu Mapel produktif bila memang diperlukan).
- **Daftar mapel**: chip Produktif, Dasar Program, Kompetensi Keahlian; chip **Non-produktif (n)** muncul bila ada. Kelompok produktif ditampilkan lebih dulu.
- **Data lama di Appwrite tidak dihapus.** Di Tata kelola, tombol **Arsipkan n mapel non-produktif** mengarsipkan yang belum dipakai pada tugas mengajar (bisa diaktifkan lagi). Excel mata pelajaran memuat kolom Produktif.

## Perapian dan validasi (v103)
- **Rombel**: nama yang sama pada sekolah dan tahun ajaran yang sama (rombel aktif) ditolak; sekolah atau tahun ajaran lain boleh memakai nama itu.
- **Mata pelajaran**: kode tidak boleh kembar (huruf besar/kecil dianggap sama); JP kosong atau bilangan bulat 1 sampai 40; mapel yang sudah punya elemen CP tidak bisa dijadikan elemen CP.
- **Tahun ajaran**: tahun kedua harus satu lebih besar (2026/2027, bukan 2026/2028); tanggal selesai tidak boleh lebih awal dari tanggal mulai.
- **Atur anggota**: saat disimpan, id ganda dan siswa yang sudah ada di rombel lain dibuang.
- **Jumlah LKPD terkait**: kata kunci pendek (3 huruf atau kurang, mis. ev, ban, rem) harus cocok sebagai kata utuh; sebelumnya "ev" cocok dengan "evaluasi" dan "ban" dengan "bank". Kata kunci lebih panjang cocok pada awal kata.
- **Keluar akun** mengosongkan pilihan anggota, filter, pencarian, dan status lipat kelompok; akun berikutnya di perangkat yang sama mulai dari tampilan awal.
- **Daftar guru** tidak lagi galat bila kode sekolah akun ditulis huruf kecil.
- **Excel Tugas mengajar** memuat kolom Tahun ajaran dan Status (Berlaku / Tidak berlaku).

## Tampilan dan submenu (v104)
- **Submenu di laci menu**: Administrasi Akademik kini kelompok yang bisa dibuka dan ditutup (di bawah Pembelajaran) berisi lima submenu: Guru, Kelas, Daftar siswa, Mata pelajaran, Tata kelola. Kelompok terbuka otomatis saat salah satu halamannya aktif. Guru melihat keterangan "Tugas mengajar saya".
- **Kepala halaman**: judul kecil "Administrasi Akademik" di atas nama halaman; tahun ajaran, sekolah, dan tanda "Hanya lihat" tampil sebagai pil, bukan satu kalimat panjang.
- **Bilah tab** di dalam halaman: satu baris yang bisa digeser, berikon, tab aktif digulir ke tengah. Filter (Kelas X, Produktif, dan sebagainya) tetap berbentuk chip agar tidak tertukar dengan navigasi.
- **Jarak kartu** seragam; kartu guru memakai avatar inisial; baris tahun ajaran dan pemeriksaan kelengkapan memakai garis pemisah; Hak akses, Acuan regulasi, dan Katalog SKKNI digabung menjadi satu kartu "Acuan dan referensi".
