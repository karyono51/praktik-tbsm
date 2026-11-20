# Ruang dan gelombang ujian

## Membuat
1. Buka **Sesi**, buat atau ubah sesi, cari bagian **Ruang dan gelombang**.
2. **Tambah ruang**: isi nama ruang, gelombang (misalnya 1 atau 2), proktor, dan jadwal buka/tutup ruang bila berbeda dari jadwal sesi.
3. Isi **Kapasitas** tiap ruang (0 = tanpa batas), lalu pilih **Cara bagi otomatis** dan tekan **Bagi otomatis**. Siswa yang dibagi adalah siswa terdaftar (sesuai kelas dan sekolah sesi, atau daftar tetap). Pilihan cara bagi:
   - **Rata sesuai kapasitas, kelas berurutan** (bawaan): jumlah siswa tiap ruang dibuat serata mungkin tanpa melewati kapasitas. Siswa diisi berurutan menurut kelas lalu nama, jadi satu kelas utuh berada di ruang-ruang yang berdekatan. Contoh: kelas XI 90 siswa, tiga ruang berkapasitas 36, hasilnya 30, 30, 30.
   - **Isi ruang satu per satu sampai penuh**: ruang pertama diisi sampai kapasitas, lalu ruang berikutnya. Ruang tanpa batas menampung sisanya.
   - **Bergilir, tiap ruang campuran kelas**: siswa dibagikan bergilir sehingga tiap ruang berisi campuran kelas (ruang yang penuh dilewati).
   Bila kapasitas seluruh ruang kurang, siswa yang belum muat tetap berstatus belum ditempatkan dan aplikasi memberi tahu jumlahnya. **Tempatkan manual** memindahkan siswa satu per satu (ada pencarian).
   Tiap kartu ruang menampilkan jumlah siswa dari kapasitas dan komposisi kelasnya (misalnya XI 20 · XII 10). Sesi tidak bisa disimpan bila ada ruang yang melebihi kapasitas.
4. Simpan. Aplikasi mengingatkan bila ada siswa yang belum ditempatkan.

## Aturan yang dijalankan server
- Sesi beruang: siswa yang belum ditempatkan tidak bisa mulai (pesan: belum ditempatkan di ruang ujian).
- Jadwal buka/tutup mengikuti ruangnya, jadi gelombang 2 baru bisa mulai pada jam gelombang 2. Kolom jadwal ruang yang kosong memakai jadwal sesi.
- Proktor hanya melihat dan bertindak (tambah waktu, buka kunci, akhiri, izin pindah perangkat) untuk siswa di ruang yang ia awasi. Proktor yang tidak dipasang di ruang mana pun ditolak di sesi beruang. Guru dan admin tetap melihat semua ruang.
- Token tetap satu per sesi. Proktor ruang mana pun bisa merilisnya. Untuk gelombang, rilis token menjelang gelombang itu dimulai.
- Sesi tanpa ruang berjalan seperti biasa.

## Tampilan dan cetak
- Pantau (guru/admin): pilihan **Ruang** menyaring peserta, dan tiap kartu menampilkan ruang dan gelombang.
- Ruang ujian (proktor): menampilkan ruang yang diawasi, hanya siswa ruang itu.
- **Kartu peserta**: tercetak berurutan per ruang, memuat ruang, gelombang, dan jadwal ruang.
- **Hadir dan berita acara**: satu halaman per ruang, memuat nama ruang dan proktor.

## Batasan
- Penempatan disimpan di sesi (batas sekitar 17.000 karakter bersama daftar soal manual). Untuk ratusan siswa, pakai beberapa sesi.
- Daftar peserta belum dibekukan: siswa baru atau yang dipindah kelas setelah penempatan perlu ditempatkan lagi.
- Kapasitas hanya dipakai saat membagi dan memeriksa penempatan di aplikasi guru. Server tidak menolak siswa karena kapasitas; yang menentukan hanya penempatan di ruang.
- Perubahan fungsi server: deploy ulang `akun-admin`.
