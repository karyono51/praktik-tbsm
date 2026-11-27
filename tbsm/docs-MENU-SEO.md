# Susunan menu, alamat per menu, dan SEO

## Susunan menu
Satu sumber: `js/menu-peta.js`. Laci menu, breadcrumb, dan judul memakai peta ini. Memindah menu cukup memindahkan id-nya di `MENU_KELOMPOK`. Menu baru: masukkan id ke kelompok dan ke `MENU_ITEM` (alamat, nama). Peta tidak mengatur hak akses.

Urutan: Beranda, Pembelajaran, Uji Kompetensi (UKK), CBT dan bank soal, Nilai dan laporan, PKL, Supervisi, Administrasi Akademik, Alumni dan Tracer, Pengaturan, Akun dan aplikasi, Keluar. Kelompok tanpa menu untuk peran aktif tidak tampil. Laci dengan 9 menu atau lebih punya kotak **Cari menu**.

## Alamat per menu (`js/rute.js`)
Contoh `#rekap-nilai`, `#lkpd-kelas-x`, `#ukk-kelas-xi`. Bisa digabung dengan sekolah: `?s=medina#pkl`. Sebelum masuk, tujuan diingat lalu dibuka setelah login, hanya bila menu tersedia untuk peran aktif. Riwayat peramban tidak bertambah, jadi tombol back tetap seperti semula. Di SEB/Exambro alamat tidak diubah. Siswa yang sedang ujian tidak bisa pindah lewat alamat.

## SEO
Yang bisa diindeks hanya halaman publik: `index.html` (layar awal) dan `tentang.html`. Menu di balik login tidak diindeks, dan alamat `#...` tidak dihitung sebagai halaman terpisah.

Setelah deploy:
1. Google Search Console, tambah properti *URL prefix* `https://karyono51.github.io/praktik-tbsm/`.
2. Kirim `sitemap.xml`. (`robots.txt` tidak dibuat: pada situs proyek GitHub Pages, mesin pencari hanya membaca robots.txt di akar domain.)
3. Inspeksi URL kedua halaman lalu *Minta pengindeksan*.
4. Pasang tautan ke aplikasi dari situs atau media sosial resmi sekolah.

Bila alamat situs berganti, ubah di `index.html` (canonical, og, JSON-LD), `tentang.html`, `sitemap.xml`, dan pengecualian di `tools/rilis.mjs`.
