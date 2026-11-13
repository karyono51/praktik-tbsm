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
Menu **LKPD praktik** memuat modul bawaan Fase E Kelas X: Pemeriksaan Baterai dan Sistem Starter (45 menit). Guru/Admin dapat membuka **Editor Guru** untuk membuat, mengubah, menduplikasi, menerbitkan, menonaktifkan, dan menghapus modul; siswa hanya melihat modul terbit. Editor mengelola tujuan, teori, alat-bahan, K3, langkah, tabel pemeriksaan, soal JSON, rubrik, dan validasi. Mode lokal memakai `localStorage`; mode Appwrite memakai koleksi terpisah `lkpd_modules` dengan document security dan label `lkpdeditor`. Pengumpulan tetap memakai koleksi `lkpd` dan masuk rekap `hasil`. PWA mengantrekan perubahan modul saat offline. Periksa `appwrite.json`, jalankan `appwrite push collections`, lalu buat label `lkpdeditor` dan berikan hanya kepada akun Guru/Admin yang berwenang. Lihat `docs-LKPD-MODULAR.md` untuk panduan editor, skema, izin, dan migrasi.

## Observasi guru
Menu **Observasi guru** (Admin dan Guru) berisi formulir supervisi pembelajaran 16 butir, skor 1-4, nilai dan kategori otomatis, ekspor PDF per observasi dan Excel rekap. Admin melihat semua observasi, Guru hanya miliknya sendiri. Mode Appwrite memakai koleksi `observasi`: jalankan `appwrite push collections`. Panduan lengkap di `docs-OBSERVASI-GURU.md`.
Menu **Observasi praktik siswa** (Admin dan Guru) memakai koleksi yang sama dengan atribut `tipe`; lihat `docs-OBSERVASI-GURU.md`.

## Rekap kompetensi, label Latihan, dan cek sinkronisasi (v40)
- **Rekap kompetensi** (menu, Admin dan Guru): satu halaman per siswa berisi status Kompeten atau Belum kompeten tiap unit, nilai uji praktik, nilai LKPD, dan observasi praktik. Unduh PDF per siswa dan Excel (sheet Ringkasan, Per unit, Observasi). Aturan: nilai terbaru dari tiap sumber; unit Kompeten bila semua sumber yang ada Kompeten; nilai Latihan tidak dihitung; observasi hanya bukti pendukung. Guru hanya melihat observasi yang ia isi sendiri.
- **Rekap LKPD**: tiap pengumpulan berlabel Latihan atau Ujian, dengan filter Semua, Ujian, Latihan (muncul bila ada data Latihan).
- **Cek sinkronisasi** (menu, Admin dan Guru): menampilkan data yang menunggu terkirim, galat sinkron terakhir, dan tombol Bandingkan dengan server untuk observasi, hasil, dan LKPD (hanya membaca). Mendeteksi data yang belum terkirim, data yang hilang di server, dan observasi tanpa izin pemilik.
- Berkas baru: `js/kompetensi.js`, `js/lkpd-rekap-mode.js`, `js/cek-sinkron.js`. Tidak ada perubahan pada Appwrite.

## Bank soal (v41, bentuk soal mengikuti acuan TKA)
Menu **Bank soal** (terpisah dari LKPD): 60 soal TKA SMK bawaan (40 PG, 10 PG kompleks, 10 PG kategori), latihan dengan pembahasan, ujian bertimer dari sesi guru, riwayat siswa, serta pengelolaan bank soal, sesi, dan hasil (ekspor Excel) untuk Guru dan Admin. Koleksi baru: `banksoal`, `soal_sesi`, `soal_hasil` (`node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil`). Berkas baru: `js/soal-tka.js`, `js/banksoal.js`, `css/banksoal.css`. Panduan di `docs-BANK-SOAL.md`.

**Impor dan ekspor soal (v47, Admin dan Guru)**: tab Bank soal punya tombol Impor soal, Template, dan Ekspor Excel. Impor memakai pratinjau, melewati soal ganda, dan hanya mengatur peruntukan, kelas, dan status untuk soal bawaan. Berkas baru: `js/banksoal-io.js`. Detail di `docs-BANK-SOAL.md`.

## Foto bukti per item dan Google Drive (v50)
LKPD punya tombol kamera di tiap komponen pada tabel Hasil pemeriksaan (satu foto per item) dan bagian Foto tambahan (maksimal 3). Foto diunggah ke Google Drive lewat Appwrite Function `foto-drive` (folder `functions/foto-drive`), database hanya menyimpan penanda `drive:<fileId>`. Kunci Google disimpan di environment variable fungsi, bukan di repo. Pemasangan dan uji di `docs-FOTO-DRIVE.md`. Berkas baru: `js/lkpd-drive.js`.

## Membuat database Appwrite dari HP
Belum punya database? Jalankan `node tools/setup-appwrite.mjs` di Termux (membuat database dan semua koleksi dari `appwrite.json`). Langkah lengkap di `docs-SETUP-APPWRITE.md`.

## Pembaruan v51: soal LKPD bentuk TKA, foto per item, dialog dalam aplikasi
- **Soal evaluasi LKPD**: tiap modul bawaan (21 modul) memakai 10 soal dari bank soal unitnya (`js/soal-lkpd/*.js`): 6 PG, 2 PG kompleks, 2 PG kategori (Benar/Salah). Komposisi diatur di `LKQ.MIX` pada `js/lkpd-soal.js`. Penilaian sama dengan Bank soal (nilai sebagian untuk kompleks dan kategori). Berkas baru: `js/lkpd-soal.js`.
- **Foto bukti**: foto tampil langsung di baris item pada tabel Hasil pemeriksaan (miniatur, ketuk untuk memperbesar). Bagian bawah hanya memuat foto tambahan. Foto dikecilkan (sisi 800 px, sekitar 60 KB). Tombol kamera memakai ikon.
- **Dialog dalam aplikasi**: `confirm()` dan `prompt()` bawaan peramban (yang menampilkan alamat situs) diganti dialog aplikasi, `js/dialog.js`.
- Cache service worker: `tbsm-v51`. Fungsi `foto-drive` tidak berubah, tidak perlu deploy ulang.

## Pembaruan v59: Editor LKPD terstruktur dan impor/ekspor modul
- **Editor Guru baru** (`js/lkpd-editor.js`): tab Info, Tujuan & teori, Alat & K3, Langkah, Pemeriksaan, Soal, Penilaian. Isi diedit sebagai baris terpisah (tanpa pemisah `|`), dengan tombol naik, turun, hapus, dan *Tempel banyak*. Soal diedit visual (PG, PG kompleks, PG kategori; ketuk huruf untuk menandai kunci), mode JSON tetap ada. Lencana per tab menunjukkan jumlah masalah, penghitung langsung untuk total menit langkah dan jumlah bobot, serta simpan otomatis ke perangkat dengan tombol Pulihkan. Pengaturan dari panel Pengaturan (mode, kesempatan, jadwal, foto wajib) tidak hilang saat modul disimpan.
- **Impor dan ekspor modul LKPD** (`js/lkpd-io.js`, Admin dan Guru): di daftar LKPD per kelas ada tombol Impor modul, Template, Ekspor kelas, Ekspor semua, dan Ekspor per modul. Satu berkas Excel dapat memuat banyak modul; detail di `docs-LKPD-MODULAR.md`.
- Tidak ada perubahan koleksi Appwrite. Cache service worker: `tbsm-v59`.

## Pembaruan v71: Rekap pengumpulan LKPD lebih rapi
Di halaman Rekap pengumpulan LKPD, deretan tombol Editor Guru, Materi & Prosedur, Lembar Kerja, Evaluasi, dan Rekap LKPD disembunyikan; chip kelas hanya muncul bila ada lebih dari satu kelas; chip Semua/Perlu dicek hanya muncul bila ada data yang perlu dicek; label Ujian di kartu hanya muncul bila ada data Latihan. Berkas baru: `js/lkpd-rekap-rapi.js`. Tidak ada perubahan Appwrite. Cache service worker: `tbsm-v71`.

## Pembaruan v72: pengamanan
Aksi `claim` pada fungsi `akun-admin` (pemetaan ID login tidak lagi bisa dipalsukan siswa), durasi ujian dipulihkan dari sesi guru, skrip `tools/hitung-sri.mjs` untuk SRI CDN. Urutan pemasangan wajib dibaca di `docs-PENGAMANAN-V72.md`. Cache service worker: `tbsm-v72`.

## Pembaruan v73: antrean modul LKPD tidak dikirim akun siswa
Antrean sinkron tersimpan per perangkat, bukan per akun. Perubahan modul LKPD sisa sesi guru/admin yang belum terkirim ikut dicoba dikirim saat siswa login di perangkat yang sama dan ditolak Appwrite (izin label lkpdeditor). Kini antrean modul hanya dihitung dan dikirim untuk guru/admin; untuk siswa tetap disimpan sampai guru/admin masuk. Cache service worker: `tbsm-v73`.

## Unit UKK 2026/2027 (v74)
Katalog uji praktik kini berisi 4 unit UKK (Kelas XII, 20 menit, kode KM25.2.2.2): UKK-1 Engine injeksi Vario KZR (16 item), UKK-2 CVT Beat Pop (9), UKK-3 Rem Supra X 125 karburator (13), UKK-4 Kelistrikan bodi Supra Fit (10). Tiap item lembar UKK menjadi butir proses kerja beserta standarnya; kolom Hasil Pemeriksaan dan Kesimpulan menjadi dua butir aspek Hasil. Butir wajib (penentu Kompeten): UKK-2 butir 9 (pemasangan CVT) dan UKK-3 butir 6 (kebocoran rem). Unit lama tetap di `JOBS_ARSIP` sehingga nilai lama tetap terbaca. Perubahan: `js/data.js`, versi `?v=74`, `CACHE=tbsm-v74`.

### Tampilan form UKK (v75)
Unit UKK ditampilkan seperti lembar UKK: identitas (satuan pendidikan, konsentrasi, kode, alokasi waktu, judul tugas, nama siswa, NIS/kelas, tanggal, penguji) dan tabel No, Nama item pekerjaan, Standar/Spesifikasi, Hasil Pemeriksaan (isian teks), Kesimpulan (Sesuai / Tidak sesuai). Di layar sempit tiap baris menjadi kartu. Skor = persentase butir Sesuai; butir Wajib tetap menentukan Kompeten. PDF per siswa (`UKK_nama_UKK-n.pdf`) memakai tata letak yang sama beserta catatan dan tanda tangan penguji. Isian Hasil Pemeriksaan ikut tersimpan di kolom catatan hasil. Berkas berubah: `js/data.js`, `js/views.js`, `js/actions.js`, `js/export.js`, `css/app.css`.
