# Dua sekolah dalam satu sistem (v98)

Satu aplikasi, satu database Appwrite. Logo, nama, alamat, kop PDF/cetak, dan ikon PWA mengikuti sekolah.

## Pasang (sekali)
1. Tambah atribut `sekolah` (string, ukuran 8, tidak wajib) pada tabel `akun`:
   `node tools/setup-appwrite.mjs --only=akun` (atribut yang sudah ada dilewati), atau tambah manual di Appwrite Console.
2. Push zip ini ke GitHub seperti biasa. Service worker menjadi `tbsm-v98`; di ponsel ketuk Perbarui aplikasi.
3. Isi sekolah akun lewat **Akun > Ubah** atau impor Excel (kolom `Sekolah`: DF, MEDINA, atau ALL).
   Akun admin Anda: pilih **Semua sekolah (lintas)** atau biarkan kosong (admin otomatis lintas sekolah).

## Tautan per sekolah (bagikan ke siswa)
- Darul Fatwa: `https://karyono51.github.io/praktik-tbsm/?s=df`
- Medina: `https://karyono51.github.io/praktik-tbsm/?s=medina`

Tautan menentukan logo di halaman login dan ikon PWA saat dipasang. Setelah login, sekolah akun yang menentukan.
Tanpa `?s=`, login menampilkan kedua logo. PWA lama perlu dihapus lalu dipasang ulang dari tautan sekolahnya.

## Admin lintas sekolah
Tombol sekolah di header (DF / Medina) berganti sekolah yang dikelola: logo, kop PDF/cetak, daftar akun, roster siswa, rekap nilai, observasi.
Akun yang sekolahnya belum diisi tetap tampil di kedua sekolah sampai diatur.

## Sesi ujian, LKPD, dan UKK per sekolah (v99)
Sesi ujian bank soal, modul LKPD, dan unit UKK punya pilihan **Sekolah** di form masing-masing (tanpa kolom Appwrite baru; tersimpan di payload).
- Isi DF atau Medina: hanya tampil untuk siswa sekolah itu, dan untuk admin/guru saat sekolah itu yang aktif.
- Kosong ("Semua sekolah (bersama)"): tampil di kedua sekolah. Semua data lama otomatis berstatus bersama.
- Sesi, modul, atau unit baru otomatis memakai sekolah yang sedang aktif di header.
- Hasil ujian di rekap ikut difilter menurut sekolah siswa.
Bank soal tetap satu bersama; yang dipisah hanya sesinya.
