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

## Penyaringan menyeluruh dan nama sekolah di lembar UKK (v100)
Perbaikan untuk gejala: siswa Darul Fatwa muncul di akun Medina, dan "SMKS Darul Fatwa" muncul di Identitas praktik akun Medina.
- **Nama sekolah di lembar UKK** (Identitas praktik, PDF lembar kerja, pratinjau Kelola unit, Excel unit) kini mengikuti sekolah unit, atau sekolah aktif bila unitnya bersama.
  Nama bawaan yang sudah tersimpan di unit lama (Darul Fatwa atau Medina) tidak lagi menimpa. Teks yang diketik sendiri di tab Identitas lembar tetap dipakai apa adanya.
- **Disaring per sekolah** (sebelumnya semua sekolah tercampur): Belum dinilai dan Excel per unit UKK, nilai kelas UKK, analisis butir, rekap nilai akhir UKK, hasil per unit,
  Belum mengirim dan analisis LKPD, rekap LKPD, deteksi kemiripan LKPD, Rekap kompetensi, Unduh CSV nilai, observasi guru/siswa/UKK.
- **Akun yang kolom Sekolah-nya kosong tetap tampil di kedua sekolah** (aturan sejak v98). Bila masih ada siswa sekolah lain di daftar, isi Sekolah akun itu lewat **Akun > Ubah**
  atau impor Excel (kolom `Sekolah`: DF atau MEDINA). Akun Kepala Sekolah juga harus berisi sekolahnya; bila kosong, filter ikut tautan terakhir yang dibuka di perangkat itu.
- Hasil lama tanpa `sid` dicocokkan lewat nama dan kelas, dan hanya disaring bila nama itu tidak ambigu antar sekolah.
