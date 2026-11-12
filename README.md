# KBM Praktik TBSM

Aplikasi penilaian uji praktik Teknik Bisnis Sepeda Motor, SMKS Medina Bandung. Situs statis (HTML, CSS, JS), tanpa build step.

## Fitur
- **Peran**: Admin (kelola akun, KKM), Guru (menilai, lihat semua rekap), Siswa (latihan, lihat nilai sendiri). Satu akun boleh punya lebih dari satu peran (mis. Guru + Siswa); ketuk peran di header untuk berganti. Disimpan di kolom `peran` sebagai daftar koma, misalnya `guru,siswa`.
- **Menilai banyak siswa**: di layar penilaian (admin dan guru), pilih siswa lalu tambahkan beberapa siswa. Mode *Per siswa*: tiap siswa punya rubrik sendiri, berpindah lewat tab. Mode *Kelompok*: satu rubrik untuk semua anggota, skor dan status yang sama disimpan untuk tiap anggota. Waktu pengerjaan satu untuk seluruh sesi.
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

## Impor nilai dan mode offline

**Impor nilai (admin dan guru).** Rekap nilai > Template nilai, isi, lalu Impor nilai. File Ekspor Excel Rekap juga bisa diimpor ulang. Baris yang sama (siswa, unit, tanggal, skor) dilewati, bukan digandakan. Pratinjau menampilkan baris yang ditolak beserta alasannya.

**PWA.** Aplikasi bisa dipasang (Chrome: tombol Pasang aplikasi atau menu > Instal; iPhone: Bagikan > Tambah ke Layar Utama) dan dibuka tanpa internet setelah pernah dibuka sekali saat online.
- Offline, data terakhir yang dimuat tetap tampil dan nilai baru diantre di perangkat, lalu otomatis dikirim ke Appwrite saat online. Banner di atas layar menunjukkan jumlah data yang menunggu.
- Masuk (login) tetap perlu internet. Offline hanya berlaku untuk sesi yang sudah masuk sebelumnya.
- Hapus akun dan hapus nilai hanya berlaku jika online.
- Keluar menghapus salinan data di perangkat. Data antrean yang belum terkirim tetap disimpan sampai berhasil dikirim.
- Setelah mengubah berkas aplikasi, naikkan `CACHE` di `service-worker.js` (versi Editor LKPD ini memakai `tbsm-v14`) agar perangkat memuat versi baru.

## Modul LKPD modular
Menu **LKPD praktik** memuat modul bawaan Fase E Kelas X: Pemeriksaan Baterai dan Sistem Starter (45 menit). Guru/Admin dapat membuka **Editor Guru** untuk membuat, mengubah, menduplikasi, menerbitkan, menonaktifkan, dan menghapus modul; siswa hanya melihat modul terbit. Editor mengelola tujuan, teori, alat-bahan, K3, langkah, tabel pemeriksaan, soal JSON, rubrik, dan validasi. Mode lokal memakai `localStorage`; mode Appwrite memakai koleksi terpisah `lkpd_modules` dengan document security dan label `lkpd-editor`. Pengumpulan tetap memakai koleksi `lkpd` dan masuk rekap `hasil`. PWA mengantrekan perubahan modul saat offline. Periksa `appwrite.json`, jalankan `appwrite push collections`, lalu buat label `lkpd-editor` dan berikan hanya kepada akun Guru/Admin yang berwenang. Lihat `docs-LKPD-MODULAR.md` untuk panduan editor, skema, izin, dan migrasi.

## Observasi guru
Menu **Observasi guru** (Admin dan Guru) berisi formulir supervisi pembelajaran 16 butir, skor 1-4, nilai dan kategori otomatis, ekspor PDF per observasi dan Excel rekap. Admin melihat semua observasi, Guru hanya miliknya sendiri. Mode Appwrite memakai koleksi `observasi`: jalankan `appwrite push collections`. Panduan lengkap di `docs-OBSERVASI-GURU.md`.
Menu **Observasi praktik siswa** (Admin dan Guru) memakai koleksi yang sama dengan atribut `tipe`; lihat `docs-OBSERVASI-GURU.md`.

## Rekap kompetensi, label Latihan, dan cek sinkronisasi (v40)
- **Rekap kompetensi** (menu, Admin dan Guru): satu halaman per siswa berisi status Kompeten atau Belum kompeten tiap unit, nilai uji praktik, nilai LKPD, dan observasi praktik. Unduh PDF per siswa dan Excel (sheet Ringkasan, Per unit, Observasi). Aturan: nilai terbaru dari tiap sumber; unit Kompeten bila semua sumber yang ada Kompeten; nilai Latihan tidak dihitung; observasi hanya bukti pendukung. Guru hanya melihat observasi yang ia isi sendiri.
- **Rekap LKPD**: tiap pengumpulan berlabel Latihan atau Ujian, dengan filter Semua, Ujian, Latihan (muncul bila ada data Latihan).
- **Cek sinkronisasi** (menu, Admin dan Guru): menampilkan data yang menunggu terkirim, galat sinkron terakhir, dan tombol Bandingkan dengan server untuk observasi, hasil, dan LKPD (hanya membaca). Mendeteksi data yang belum terkirim, data yang hilang di server, dan observasi tanpa izin pemilik.
- Berkas baru: `js/kompetensi.js`, `js/lkpd-rekap-mode.js`, `js/cek-sinkron.js`. Tidak ada perubahan pada Appwrite.

## Bank soal TKA (v41)
Menu **Bank soal TKA** (terpisah dari LKPD): 60 soal TKA SMK bawaan (40 PG, 10 PG kompleks, 10 PG kategori), latihan dengan pembahasan, ujian bertimer dari sesi guru, riwayat siswa, serta pengelolaan bank soal, sesi, dan hasil (ekspor Excel) untuk Guru dan Admin. Koleksi baru: `banksoal`, `soal_sesi`, `soal_hasil` (`node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil`). Berkas baru: `js/soal-tka.js`, `js/banksoal.js`, `css/banksoal.css`. Panduan di `docs-BANK-SOAL.md`.

**Impor dan ekspor soal (v47, Admin dan Guru)**: tab Bank soal punya tombol Impor soal, Template, dan Ekspor Excel. Impor memakai pratinjau, melewati soal ganda, dan hanya mengatur peruntukan, kelas, dan status untuk soal bawaan. Berkas baru: `js/banksoal-io.js`. Detail di `docs-BANK-SOAL.md`.

## Foto bukti per item dan Google Drive (v50)
LKPD punya tombol kamera di tiap komponen pada tabel Hasil pemeriksaan (satu foto per item) dan bagian Foto tambahan (maksimal 3). Foto diunggah ke Google Drive lewat Appwrite Function `foto-drive` (folder `functions/foto-drive`), database hanya menyimpan penanda `drive:<fileId>`. Kunci Google disimpan di environment variable fungsi, bukan di repo. Pemasangan dan uji di `docs-FOTO-DRIVE.md`. Berkas baru: `js/lkpd-drive.js`.

## Membuat database Appwrite dari HP
Belum punya database? Jalankan `node tools/setup-appwrite.mjs` di Termux (membuat database dan semua koleksi dari `appwrite.json`). Langkah lengkap di `docs-SETUP-APPWRITE.md`.
