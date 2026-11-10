# Uji Praktik TBSM

Aplikasi penilaian uji praktik Teknik Bisnis Sepeda Motor, SMKS Medina Bandung. Situs statis (HTML, CSS, JS), tanpa build step.

## Fitur
- **Peran**: Admin (kelola akun, KKM), Guru (menilai, lihat semua rekap), Siswa (latihan, lihat nilai sendiri).
- **Akun**: tambah, ubah, hapus, cari, filter peran. **Impor Excel** (.xlsx/.xls/.csv) dengan pratinjau dan validasi, **ekspor Excel**, **template impor**. Mode lokal otomatis membuatkan sandi awal dan mengunduh daftarnya.
- **Ekspor**: rekap nilai ke Excel (sheet Rekap, Per kelas, Per siswa) dan PDF berkop sekolah; lembar penilaian per siswa ke PDF.
- **Penyimpanan**: lokal (peramban) atau Appwrite (Auth email, Google, database).

## Jalankan lokal
Buka `index.html` atau jalankan `python3 -m http.server 8080`. Mode lokal: login `admin` / `admin123`, **segera ganti sandi** di menu Akun.

## Deploy
**GitHub Pages**: push ke branch `main`, aktifkan *Settings > Pages > Source: GitHub Actions*. Workflow ada di `.github/workflows/pages.yml`.

**Firebase Hosting (Google)**: `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` (public directory `.`, jangan timpa index.html), lalu `firebase deploy`. `firebase.json` sudah disiapkan.

**Appwrite Sites**: *Sites > Create site > Connect Git* ke repo ini. Framework: Other, build command kosong, output directory `./`.

## Aktifkan Appwrite (login akun dan sinkron data)
1. Buat project di Appwrite Console. Tambahkan **Web platform** dengan hostname situs Anda (github.io, web.app, atau domain Appwrite Sites).
2. Buat database dan koleksi: `npm i -g appwrite-cli`, `appwrite login`, ganti `projectId` di `appwrite.json`, lalu `appwrite push collections`. Jika CLI Anda memakai istilah *tables*, buat manual sesuai isi `appwrite.json`.
3. Isi `js/config.js`: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT`, dan `ADMIN_EMAIL` (email yang otomatis jadi admin).
4. **Google login**: Console > Auth > Settings > OAuth2 > Google, isi Client ID dan Secret dari Google Cloud Console, lalu salin redirect URI dari Appwrite ke Google.
5. Beri label `admin` pada akun admin (Console > Auth > Users > Labels). Izin ubah dan hapus koleksi hanya untuk label ini.

## Format impor akun
Kolom: `Nama, Username, Email, Sandi, Peran, Kelas, Status`. Unduh contoh dari tombol **Template** atau `templates/Template_Impor_Akun.xlsx`. Akun yang username/emailnya sudah ada diperbarui, bukan digandakan. Pada mode Appwrite, impor menyiapkan peran dan kelas berdasarkan email; pengguna tetap mendaftar sendiri.

## Keamanan (baca sebelum dipakai nyata)
- Pembatasan peran di antarmuka hanya mengatur tampilan. Penegakan sebenarnya ada pada **izin koleksi Appwrite**. Dengan izin bawaan, semua pengguna login bisa membaca koleksi; filter data siswa dilakukan aplikasi. Untuk privasi ketat, tambahkan Appwrite Function atau izin per dokumen.
- Mode lokal menyimpan akun di peramban dan hanya cocok untuk demo atau satu perangkat. Gunakan Appwrite untuk penggunaan bersama.
- Endpoint dan Project ID bersifat publik. Jangan menaruh API key di repo.
- Pustaka dimuat dari CDN dengan versi dipatok: appwrite 16.0.2, SheetJS 0.18.5, jsPDF 2.5.1, jspdf-autotable 3.8.2.
