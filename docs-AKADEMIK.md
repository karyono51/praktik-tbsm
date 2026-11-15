# Administrasi Akademik

Menu baru di laci menu (staf): **Administrasi Akademik** berisi Guru, Kelas, Mata pelajaran, dan Tata kelola.

## Pasang (sekali)
1. Buat dua koleksi baru di Appwrite: `node tools/setup-appwrite.mjs --only=akademik,akademik_sdm`
   - `akademik`: tahun ajaran, rombel, mata pelajaran, tugas mengajar. Dibaca semua pengguna masuk, ditulis admin.
   - `akademik_sdm`: profil guru (NIP, NUPTK, status, pendidikan). Dibaca guru dan admin saja, ditulis admin.
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
Admin: semua. Guru: melihat mapel, rombel, dan profil sendiri. Siswa: tidak ada akses.
Data mengikuti sekolah yang sedang aktif di header (DF atau Medina); data tanpa sekolah dipakai bersama.

## Acuan (ditinjau 15 November 2026)
- Permendikbudristek 12/2024, diubah dengan Permendikdasmen 13/2025 (struktur kurikulum).
- Keputusan Kepala BSKAP 046/H/KR/2025, Lampiran III SMK/MAK (Capaian Pembelajaran). Mencabut 032/H/KR/2024.
- Kepmenaker 147/2019, SKKNI Bidang Teknik Sepeda Motor (kode unit G.45TSM01.001.2 sampai .055.2).
Periksa dokumen resmi sebelum dipakai sebagai dasar keputusan.
