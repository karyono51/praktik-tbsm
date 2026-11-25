# KBM Praktik TBSM

Aplikasi penilaian dan pembelajaran praktik Teknik Bisnis Sepeda Motor untuk **SMKS Medina Bandung** dan **SMKS Darul Fatwa** (dua sekolah dalam satu sistem; alamat `?s=medina` atau `?s=df`, lihat `docs-SEKOLAH.md`). Situs statis (HTML, CSS, JS biasa), tanpa bundler. Data disimpan lokal di peramban atau di Appwrite.

Isi: [Ringkasan fitur](#ringkasan-fitur) · [Memulai](#memulai) · [Keamanan](#keamanan) · [Fitur utama](#fitur-utama) · [Struktur berkas](#struktur-berkas) · [Alat bantu dan pemeriksaan](#alat-bantu-dan-pemeriksaan) · [Indeks dokumentasi](#indeks-dokumentasi) · [Riwayat pembaruan](#riwayat-pembaruan)

## Ringkasan fitur
Dikelompokkan menurut menu di aplikasi. Rincian tiap fitur ada di berkas dokumentasi yang disebut (lihat [indeks](#indeks-dokumentasi)).

- **Dasar**
  - **Peran**: Admin (kelola akun, KKM), Guru (menilai, lihat semua rekap), Siswa (latihan, lihat nilai sendiri). Satu akun boleh punya lebih dari satu peran (mis. Guru + Siswa); ketuk peran di header untuk berganti. Disimpan di kolom `peran` sebagai daftar koma, misalnya `guru,siswa`.
  - **Menilai banyak siswa**: di layar penilaian (admin dan guru), pilih siswa lalu tambahkan beberapa siswa. Mode *Per siswa*: tiap siswa punya rubrik sendiri, berpindah lewat tab. Mode *Kelompok*: satu rubrik untuk semua anggota, skor dan status yang sama disimpan untuk tiap anggota. Waktu pengerjaan satu untuk seluruh sesi.
  - **Akun**: tambah, ubah, hapus, cari, filter peran. **Impor Excel** (.xlsx/.xls/.csv) dengan pratinjau dan validasi, **ekspor Excel**, **template impor**. Mode lokal otomatis membuatkan sandi awal dan mengunduh daftarnya.
  - **Ekspor**: rekap nilai ke Excel (sheet Rekap, Per kelas, Per siswa) dan PDF berkop sekolah; lembar penilaian per siswa ke PDF.
  - **Penyimpanan**: lokal (peramban) atau Appwrite (Auth email, Google, database).
- **Pembelajaran praktik**: LKPD modular per kelas (X, XI, XII) dengan Editor Guru, foto bukti ke Google Drive, dan pilot LKPD v2; Observasi guru, Observasi LKPD praktik, dan Observasi UKK; Administrasi akademik.
- **Ujian**: Bank soal (PG, PG kompleks, PG kategori, uraian, soal grup, gambar), CBT Online dengan penilaian di server, ruang dan gelombang, Safe Exam Browser, pengawasan hari ujian.
- **Nilai dan analisis**: Rekap nilai, Rekap kompetensi, analisis nilai dan ekspor Excel, Cek sinkronisasi.
- **Pengelolaan**: akun dan peran (termasuk Proktor dan Kepala Sekolah), hapus nilai, log audit.
- **Offline**: dapat dipasang sebagai PWA; data baru diantre saat offline.

## Memulai

### Jalankan lokal
Buka `index.html` atau jalankan `python3 -m http.server 8080`. Mode lokal: login `admin` / `admin123`, **segera ganti sandi** di menu Akun.

### Deploy
**GitHub Pages**: push ke branch `main`, aktifkan *Settings > Pages > Source: GitHub Actions*. Workflow ada di `.github/workflows/pages.yml`.

**Firebase Hosting (Google)**: `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` (public directory `.`, jangan timpa index.html), lalu `firebase deploy`. `firebase.json` sudah disiapkan.

**Appwrite Sites**: *Sites > Create site > Connect Git* ke repo ini. Framework: Other, build command kosong, output directory `./`.

### Memasang pembaruan
Dari folder proyek di Termux, setiap ada zip baru `tbsm*.zip` di Downloads:
```
cd ~/tbsm && sh up.sh "pesan singkat"
```
`up.sh` memasang zip, menjalankan `tools/rilis.mjs` (versi berkas otomatis), `tools/periksa.mjs` (sintaks, berkas, SRI, rahasia), dan `tools/audit-izin.mjs`, lalu commit dan push; bila ada pemeriksaan gagal, tidak ada yang dikirim. Catatan: `up.sh` hanya menimpa dan menambah berkas, tidak menghapus berkas lama yang sudah tidak ada di zip. Lihat `docs-PASANG.md`.

### Aktifkan Appwrite (login akun dan sinkron data)
1. Buat project di Appwrite Console. Tambahkan **Web platform** dengan hostname situs Anda (github.io, web.app, atau domain Appwrite Sites).
2. Buat database dan koleksi: `npm i -g appwrite-cli`, `appwrite login`, ganti `projectId` di `appwrite.json`, lalu `appwrite push collections`. Jika CLI Anda memakai istilah *tables*, buat manual sesuai isi `appwrite.json`.
3. Isi `js/config.js`: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT`, dan `ADMIN_EMAIL` (email yang otomatis jadi admin).
4. **Google login**: Console > Auth > Settings > OAuth2 > Google, isi Client ID dan Secret dari Google Cloud Console, lalu salin redirect URI dari Appwrite ke Google.
5. Beri label `admin` pada akun admin (Console > Auth > Users > Labels). Izin ubah dan hapus koleksi hanya untuk label ini.

### Membuat database Appwrite dari HP
Belum punya database? Jalankan `node tools/setup-appwrite.mjs` di Termux (membuat database dan semua koleksi dari `appwrite.json`). Langkah lengkap di `docs-SETUP-APPWRITE.md`.

### Format impor akun
Kolom: `Nama, Username, Email, Sandi, Peran, Kelas, Status`. Unduh contoh dari tombol **Template** atau `templates/Template_Impor_Akun.xlsx`. Akun yang username/emailnya sudah ada diperbarui, bukan digandakan. Pada mode Appwrite, impor menyiapkan peran dan kelas berdasarkan email; pengguna tetap mendaftar sendiri.

## Keamanan
- Pembatasan peran di antarmuka hanya mengatur tampilan. Penegakan sebenarnya ada pada **izin koleksi Appwrite**. Dengan izin bawaan, semua pengguna login bisa membaca koleksi; filter data siswa dilakukan aplikasi. Untuk privasi ketat, tambahkan Appwrite Function atau izin per dokumen.
- Mode lokal menyimpan akun di peramban dan hanya cocok untuk demo atau satu perangkat. Gunakan Appwrite untuk penggunaan bersama.
- Endpoint dan Project ID bersifat publik. Jangan menaruh API key di repo.
- Pustaka dimuat dari CDN dengan versi dipatok: appwrite 16.0.2, SheetJS 0.18.5, jsPDF 2.5.1, jspdf-autotable 3.8.2.

Pengamanan lanjutan: `docs-PENGAMANAN-APPWRITE.md`, `docs-PENGAMANAN-V72.md`, `docs-PENGAMANAN-V73.md`. Audit izin koleksi dijalankan otomatis (`tools/audit-izin.mjs`).

## Fitur utama

### Impor nilai dan mode offline
**Impor nilai (admin dan guru).** Rekap nilai > Template nilai, isi, lalu Impor nilai. File Ekspor Excel Rekap juga bisa diimpor ulang. Baris yang sama (siswa, unit, tanggal, skor) dilewati, bukan digandakan. Pratinjau menampilkan baris yang ditolak beserta alasannya.

**PWA.** Aplikasi bisa dipasang (Chrome: tombol Pasang aplikasi atau menu > Instal; iPhone: Bagikan > Tambah ke Layar Utama) dan dibuka tanpa internet setelah pernah dibuka sekali saat online.
- Offline, data terakhir yang dimuat tetap tampil dan nilai baru diantre di perangkat, lalu otomatis dikirim ke Appwrite saat online. Banner di atas layar menunjukkan jumlah data yang menunggu.
- Masuk (login) tetap perlu internet. Offline hanya berlaku untuk sesi yang sudah masuk sebelumnya.
- Hapus akun dan hapus nilai hanya berlaku jika online.
- Keluar menghapus salinan data di perangkat. Data antrean yang belum terkirim tetap disimpan sampai berhasil dikirim.
- Versi cache dan `?v=` tiap berkas dibuat otomatis oleh `tools/rilis.mjs` (dijalankan `up.sh` dan GitHub Actions); tidak perlu mengubah `CACHE` di `service-worker.js` dengan tangan. Perangkat memuat versi baru setelah deploy hijau dan tombol Perbarui aplikasi diketuk.

### Modul LKPD modular
Menu **LKPD praktik** memuat 21 modul bawaan (X-1 sampai XII-7) per kelas, ditambah pilot **LKPD v2** untuk LKPD-X-06 (lihat `docs-LKPD-V2.md`). Guru/Admin dapat membuka **Editor Guru** untuk membuat, mengubah, menduplikasi, menerbitkan, menonaktifkan, dan menghapus modul; siswa hanya melihat modul terbit. Editor mengelola tujuan, teori, alat-bahan, K3, langkah, tabel pemeriksaan, soal JSON, rubrik, dan validasi. Mode lokal memakai `localStorage`; mode Appwrite memakai koleksi terpisah `lkpd_modules` dengan document security dan label `lkpdeditor`. Pengumpulan tetap memakai koleksi `lkpd` dan masuk rekap `hasil`. PWA mengantrekan perubahan modul saat offline. Periksa `appwrite.json`, jalankan `appwrite push collections`, lalu buat label `lkpdeditor` dan berikan hanya kepada akun Guru/Admin yang berwenang. Lihat `docs-LKPD-MODULAR.md` untuk panduan editor, skema, izin, dan migrasi.

### Observasi guru
Menu **Observasi guru** (Admin dan Guru) berisi formulir supervisi pembelajaran 16 butir, skor 1-4, nilai dan kategori otomatis, ekspor PDF per observasi dan Excel rekap. Admin melihat semua observasi, Guru hanya miliknya sendiri. Mode Appwrite memakai koleksi `observasi`: jalankan `appwrite push collections`. Panduan lengkap di `docs-OBSERVASI-GURU.md`.
Menu **Observasi LKPD Praktik** (Admin dan Guru) memakai koleksi yang sama dengan atribut `tipe`; lihat `docs-OBSERVASI-GURU.md`.

## Struktur berkas
```
index.html            satu halaman; memuat semua skrip berurutan (urutan penting, lihat catatan di bawah)
service-worker.js     cache cangkang aplikasi untuk offline; daftar dan nama cache ditulis otomatis oleh tools/rilis.mjs
manifest*.json        manifest PWA (umum, df, medina) dan ikon di assets/
css/                  app.css, banksoal.css
js/                   92 skrip aplikasi + js/soal-lkpd/ (21 berkas soal per modul LKPD)
functions/            Appwrite Functions: akun-admin, cbt, foto-drive
tools/                alat bantu dan uji (lihat bagian berikut)
templates/            template impor Excel (akun, bank soal, LKPD)
docs-*.md             dokumentasi per topik (lihat indeks)
appwrite.json         skema koleksi dan izin Appwrite
.github/workflows/    deploy GitHub Pages (periksa, rilis, audit izin, deploy)
```
Skrip di `js/` dimuat tanpa modul ES, jadi satu skrip dapat membungkus fungsi skrip sebelumnya. Karena itu **urutan `<script>` di `index.html` menentukan perilaku**: skrip pembungkus harus dimuat sesudah skrip yang dibungkus. Berkas JS baru harus didaftarkan di `index.html`; `tools/rilis.mjs` memberi catatan bila ada berkas JS yang tidak dirujuk.

Pengelompokan skrip menurut awalan nama:
- **Inti**: `config`, `core`, `data`, `util`, `dialog`, `ui`, `nav`, `views`, `actions`, `back`, `pwa`, `sekolah`, `logo`, `pustaka`.
- **LKPD**: `lkpd*` (modul, editor, kelas, timer, mode, rekap, cetak, impor/ekspor, drive, analisis), `lkpd-v2*`, `soal-lkpd/*`.
- **Observasi dan UKK**: `observasi*`, `ukk-*`, `kompetensi`, `nilai*`.
- **Bank soal dan ujian**: `banksoal*`, `bank-*`, `soal-*`, `butir`, `uraian`, `cbt*`, `ruang`, `ujian-server`, `uji-waktu`, `pra-unduh`, `pengawas`, `tebak-token`, `label-proktor`.
- **Cetak dan ekspor**: `cetak-*`, `export`.
- **Akademik dan akun**: `akademik*`, `akun-sandi`, `kepsek`, `menu-dasbor`.

## Alat bantu dan pemeriksaan
Dijalankan dari folder proyek dengan Node.js (tanpa pustaka tambahan).

- **Rilis dan pemeriksaan** (otomatis di `up.sh` dan GitHub Actions): `rilis.mjs` (versi berkas dan daftar cache offline), `periksa.mjs` (sintaks, berkas yang dirujuk, SRI, pola rahasia), `audit-izin.mjs` (izin koleksi Appwrite, hanya temuan baru yang menggagalkan).
- **Uji otomatis tanpa peramban**: `node tools/uji-<topik>.mjs`, yaitu `uji-cbt`, `uji-cetak-siswa`, `uji-gambar`, `uji-grup`, `uji-label`, `uji-lkpd-cetak`, `uji-lkpd-v2`, `uji-multikelas`, `uji-pandu`, `uji-pandu-v2`, `uji-pantau`, `uji-pra`, `uji-seb-keluar`, `uji-tata-bank`, `uji-tebak`, `uji-uraian`.
- **Penyiapan Appwrite dan server**: `setup-appwrite.mjs`, `cek-appwrite.mjs`, `perbesar-peran.mjs`, `bangun-bawaan.mjs`, `gabung-cbt.mjs`, `foto-drive.mjs`.
- **Lainnya**: `buat-seb.mjs` (berkas konfigurasi Safe Exam Browser), `hitung-sri.mjs` (SRI untuk skrip CDN).

## Indeks dokumentasi
### Pemasangan, Appwrite, dan keamanan
- `docs-PASANG.md`: Memasang pembaruan satu perintah (`up.sh`)
- `docs-SETUP-APPWRITE.md`: Membuat database Appwrite dari HP (Termux)
- `docs-PENGAMANAN-APPWRITE.md`: Pengamanan Appwrite: LKPD, nilai guru, foto bukti
- `docs-PENGAMANAN-V72.md`: Pengamanan v72
- `docs-PENGAMANAN-V73.md`: Pengamanan v73: pemeriksaan deploy, audit izin, foto kelompok
- `docs-FOTO-DRIVE.md`: Foto bukti praktik dan penyimpanan Google Drive
- `docs-SEKOLAH.md`: Dua sekolah dalam satu sistem (Medina dan Darul Fatwa)

### Akun, peran, dan pengawasan
- `docs-SANDI-AKUN.md`: Mengatur sandi akun
- `docs-PERAN-GANDA.md`: Peran ganda dan batas kolom peran
- `docs-KEPSEK.md`: Peran Kepala Sekolah (hanya-lihat)
- `docs-LABEL-PROKTOR.md`: Label login proktor otomatis
- `docs-PENGAWAS.md`: Rilis token, peran Proktor, log audit
- `docs-HAPUS-NILAI.md`: Hapus nilai (khusus Admin)
- `docs-HAPUS-RIWAYAT.md`: Hapus riwayat latihan (khusus Admin)

### Pembelajaran praktik: LKPD, observasi, akademik
- `docs-LKPD-MODULAR.md`: Arsitektur LKPD modular dan Editor Guru
- `docs-LKPD-V2.md`: LKPD v2 dan Observasi LKPD Praktik v2 (pilot LKPD-X-06)
- `docs-LKPD-SAMAKAN.md`: Edit LKPD disamakan dengan Edit UKK
- `docs-TEST-EDITOR-LKPD.md`: Laporan verifikasi Editor LKPD Guru
- `docs-REFRESH-DAN-LKPD-KELAS.md`: Refresh, rilis otomatis, LKPD per kelas, timer
- `docs-OBSERVASI-GURU.md`: Observasi guru dan observasi LKPD praktik
- `docs-OBSERVASI-UKK.md`: Observasi UKK
- `docs-AKADEMIK.md`: Administrasi akademik

### Bank soal dan soal LKPD
- `docs-BANK-SOAL.md`: Bank soal (bentuk soal mengikuti acuan TKA)
- `docs-SOAL-GRUP.md`: Soal grup (satu stimulus untuk beberapa soal)
- `docs-URAIAN.md`: Soal uraian (essay)
- `docs-CP-FILTER.md`: Filter Elemen CP
- `docs-FILTER-BERTINGKAT.md`: Filter bertingkat Bank soal
- `docs-SOAL-HOTS-BATERAI.md`: Soal HOTS LKPD X-1 Pemeriksaan Baterai dan Sistem Starter
- `docs-SOAL-HOTS-CVT.md`: Soal HOTS LKPD XI-3 Pembongkaran dan Pemasangan Komponen CVT

### Ujian CBT Online
- `docs-CBT.md`: CBT online dari Bank soal (penilaian di server)
- `docs-NEON.md`: jalur panas CBT di Neon (Postgres): variabel, urutan pasang, kembali ke Appwrite
- `docs-RUANG.md`: Ruang dan gelombang ujian
- `docs-ROMBEL-SESI.md`: Sesi satu tingkat, beberapa rombel
- `docs-DAFTAR-TETAP.md`: Daftar peserta tetap per sesi
- `docs-SINKRON-UJIAN.md`: Sinkron saat ujian
- `docs-PRA-UNDUH.md`: Pra-unduh soal
- `docs-SEB.md`: Integrasi Safe Exam Browser (SEB)
- `docs-ANTI-CURANG.md`: Pencegahan pelanggaran dan kecurangan di HP
- `docs-TEBAK-TOKEN.md`: Pembatas tebakan token berlapis
- `docs-CETAK-RIWAYAT.md`: Cetak riwayat latihan siswa

## Riwayat pembaruan
Rincian per versi (v40 sampai v95 dan seterusnya) ada di [`CHANGELOG.md`](CHANGELOG.md).
