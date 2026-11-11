# Mengatur sandi akun (cache tbsm-v22)

## Mengapa sebelumnya tidak ada kolom sandi
Aplikasi memakai Appwrite Auth. Dari peramban, admin tidak boleh membuat akun login atau mengubah sandi orang lain. Itu hanya bisa dilakukan server dengan API key. Karena itu sandi sebelumnya hanya dibuat pengguna sendiri lewat Daftar.

## Yang baru
- Form Akun baru dan Ubah akun kini punya kolom **Sandi login** (minimal 8 karakter, boleh kosong).
  - Diisi: akun login dibuat atau sandinya diganti lewat fungsi server `akun-admin`.
  - Dikosongkan: pengguna membuat sandi sendiri lewat Daftar dengan email yang sama.
- Dasbor: baris **Ganti sandi** untuk semua pengguna (sandi lama, lalu sandi baru).

## Memasang fungsi (sekali saja, di Appwrite Console)
1. Functions > Create function > Runtime **Node.js 18 atau lebih baru**. Function ID: `akun-admin`.
2. Unggah isi folder `functions/akun-admin` (berkas `src/main.js` dan `package.json`). Entrypoint: `src/main.js`. Build command: `npm install`.
3. Settings > **Execute access**: Users.
4. Settings > **Scopes**: `users.read` dan `users.write`.
5. Deploy.
6. Pastikan akun admin punya label `admin` (Auth > Users > Labels). Fungsi menolak pemanggil tanpa label ini.

Bila ID fungsi berbeda, tambahkan `FN_AKUN:'id-anda'` di `js/config.js`.

## Uji
Tambah satu akun siswa dengan email dan sandi, lalu masuk dengan akun itu di perangkat lain. Bila muncul "Fungsi akun-admin belum dipasang", periksa Function ID dan Execute access.

## Catatan
- Impor Excel (v32+): kolom Sandi memakai fungsi `akun-admin` bila terpasang, jadi tanpa batas 10 akun per jam dan sandi akun yang sudah ada ikut diganti.
- Email siswa harus valid dan unik, termasuk bila admin yang mengisi sandinya.

## Tanpa fungsi akun-admin (v30+)
Bila fungsi `akun-admin` belum dipasang, kolom **Sandi login** di form akun tetap bekerja untuk email yang belum punya akun login: aplikasi membuatkan akun login baru dengan sandi itu, sehingga siswa bisa langsung Masuk. Impor Excel juga begitu: isi kolom Sandi (minimal 8 karakter) untuk membuat akun login massal.
- Email yang sudah punya akun login tidak diubah sandinya (aplikasi memberi tahu). Ubah lewat Console: Auth > Users, atau pasang fungsi `akun-admin`.
- Appwrite membatasi sekitar 10 akun baru per jam per jaringan. Impor yang lebih banyak berhenti di batas itu dan sisanya ditandai di berkas Hasil_Impor_Akun; ulangi setelah satu jam.
