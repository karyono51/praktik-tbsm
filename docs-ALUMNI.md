# Alumni dan Tracer

Menu **Alumni dan Tracer** (grup menu "Alumni dan Tracer") untuk admin, guru, dan Kepala Sekolah. Berkas: `js/alumni.js`. Uji: `node tools/uji-alumni.mjs` (51).

## Yang dilakukan dan tidak dilakukan
- Menyimpan data alumni dan jawaban tracer **internal sekolah**, memantau siapa yang belum mengisi, dan mengekspor ke Excel.
- **Tidak terhubung ke portal** Tracer Vokasi Kemendikdasmen (tidak ada API publik yang diketahui). Pengisian resmi tetap oleh alumni di `tracervokasi.kemendikdasmen.go.id` dengan NISN. Tombol "Buka portal resmi" ada di halaman Daftar.
- Form tracer diisi oleh guru/admin (mis. BKK) atas nama alumni, bukan oleh alumni sendiri. Alumni tidak punya akun aplikasi.
- Urutan dan butir pertanyaan meniru instrumen yang terlihat di portal. Pilihan jawaban **gaji** (kurang dari UMP, UMP sampai 1,2 UMP, lebih dari 1,2 UMP) disusun sendiri karena tampilan yang tersedia ambigu; cocokkan dengan portal bila perlu (`AL_Q` di `js/alumni.js`).

## Fitur
- **Daftar**: cari nama/NISN, filter tahun lulus dan status (termasuk "Tracer belum diisi"), tambah/ubah. Hapus hanya admin.
- **Form** empat langkah: Identitas (NISN 10 digit, nama, jurusan, tahun lulus, HP, email, status, tautan dan status survei atasan/DUDI), Data lulusan, Bekerja, Umpan balik (PKL, 15 aspek kualitas, dampak sertifikat). Status alumni diisi otomatis dari jawaban (bekerja, wirausaha, kuliah, belum bekerja/kuliah) bila belum dipilih.
- **Dasbor**: jumlah dan persen per status, kesesuaian kerja dengan keahlian, rata-rata 15 aspek (skala 1-4), daftar belum mengisi dengan tombol WhatsApp (pesan siap kirim berisi alamat portal).
- **Impor Excel** (.xlsx/.xls/.csv; kolom NISN, Nama, Jurusan, Tahun lulus, HP, Email, Status; NISN yang sudah ada diperbarui) dan **Template**. **Ekspor Excel** mengikuti filter daftar.
- Data dipisah per sekolah (kolom `sekolah`); akun lintas sekolah melihat semuanya.

## Pasang
1. Buat koleksi `alumni` di Appwrite. Dengan CLI: `appwrite push collections`, atau `node tools/setup-appwrite.mjs` (membuat semua koleksi dari `appwrite.json`; yang sudah ada dilewati). Tanpa koleksi, menu menampilkan pesan dan data tidak tersimpan.
2. Izin koleksi (sudah di `appwrite.json`): baca, buat, ubah untuk label `guru` dan `admin`; hapus hanya `admin`. Akun Kepala Sekolah berlabel `guru`, tetapi aplikasi menahan semua tulis saat peran aktifnya Kepala Sekolah.
3. Mode lokal (tanpa Appwrite): data tersimpan di perangkat (`tbsm-alumni`).

## Privasi
Berisi data pribadi alumni (kontak, kontak atasan, kisaran gaji). Semua akun berlabel `guru` bisa membacanya, sama seperti koleksi nilai. Catat hanya dengan persetujuan alumni dan batasi label `guru` pada yang berwenang. Koleksi memakai server Appwrite yang sama dengan proyek lain, jadi pisahkan per jurusan bila Appwrite dipisah.

## Belum ada
- Alumni mengisi sendiri lewat tautan atau token (butuh perubahan fungsi server).
- Ekspor PDF.
- Hubungan otomatis dengan akun siswa saat lulus.
