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
Menu **Observasi LKPD Praktik** (Admin dan Guru) memakai koleksi yang sama dengan atribut `tipe`; lihat `docs-OBSERVASI-GURU.md`.

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

## Pembaruan v76: Form UKK mengikuti Lembar Kerja LKPD
Form UKK Perawatan Berkala (UKK-1 sampai UKK-4) kini memakai tampilan tab Lembar Kerja LKPD: kartu **Identitas praktik** (sekolah, konsentrasi, nama siswa, NIS, kelas, tanggal, tipe kendaraan, penguji) dan kartu **Hasil pemeriksaan** dengan kolom Komponen, Hasil aktual, Standar manual, Status (Belum diperiksa, Sesuai, Tidak sesuai), dan Catatan per item. Status Sesuai tetap menjadi butir terpenuhi pada skor. Catatan per item ikut tersimpan di rekap dan di PDF UKK. Berkas berubah: `js/views.js`, `js/actions.js`, `js/export.js`, `css/app.css`. Cache service worker: `tbsm-v76`.

## Pembaruan v80: Tata kelola UKK disamakan dengan modul LKPD
Berkas utama: `js/ukk-kelola.js` (ditulis ulang), dengan penyesuaian kecil di `js/ui.js`, `js/menu-dasbor.js`, `js/views.js`. Ekspor dan impor UKK sengaja belum dibuat.

**Alur menu (dua tingkat, seperti LKPD Praktik)**
- Dasbor punya kelompok **UKK** dengan satu baris per kelas (siswa hanya melihat kelasnya).
- Tingkat 1, daftar unit: kartu ringkas dengan **Kelola unit** dan **Tampilkan/Sembunyikan**; di atas ada **+ UKK baru**, **Tampilkan semua**, **Sembunyikan semua**.
- Tingkat 2, **Kelola unit**: tombol Pratinjau, Edit isi, Duplikat, Tampilkan/Sembunyikan, Kembalikan bawaan (unit bawaan yang sudah diedit), Hapus (unit buatan sendiri); tab **Hasil penilaian** (tombol Nilai siswa, statistik, daftar hasil, filter Penilaian atau Penilaian + Latihan) dan **Pengaturan** (tampil, kesempatan, jadwal buka/tutup, terapkan ke semua UKK kelas).
- Tombol back HP mundur satu tingkat: editor (konfirmasi bila ada perubahan), pratinjau, Kelola unit, daftar. Pindah menu atau kelas selalu kembali ke daftar.
- Ceklis Tampilkan di Pengaturan dan tombol Tampilkan/Sembunyikan selalu sinkron.

**Teknis**
- Dokumen UKK tetap di koleksi `lkpd_modules` (`jenis:'ukk'`), jadi sinkronisasi Appwrite, antrean offline, dan izin label `lkpdeditor` sama dengan modul LKPD. Tidak ada koleksi atau atribut baru.
- Semua penyimpanan lewat satu pintu `ukkStore`, yang memanggil `ukkValidateDoc`: ID 2–32 karakter (huruf, angka, _ atau -), judul maks. 180, tipe kendaraan wajib, kelas valid, status draft/published, waktu 1–600 menit, 1–60 butir (komponen maks. 200, standar maks. 300 karakter), identitas lembar maks. 120 karakter, kesempatan 0–9, jadwal tutup setelah buka, ukuran dokumen maks. sekitar 450 KB.
- ID unit baru tidak boleh bentrok dengan unit atau modul LKPD lain (koleksi dipakai bersama).
- Unit bawaan (UKK-1 sampai UKK-4) tidak dapat dihapus, hanya disembunyikan. Dokumen lama yang bertanda hapus pada unit bawaan dibaca sebagai disembunyikan. Unit buatan sendiri yang dihapus diarsipkan, nilai lama tetap terbaca di rekap.
- Unit baru dan hasil duplikat dimulai sebagai Draft, seperti modul LKPD. Jadwal dan kesempatan dipertahankan saat isi unit diedit.

**Pengeditan**
- Editor terstruktur bertab: **Info** (ID, kelas, judul, tipe kendaraan, waktu, SKKNI, status Draft/Terbit, aktif), **Identitas lembar** (sekolah, konsentrasi, kode, tahun, bentuk), **Butir pemeriksaan**.
- Butir diedit sebagai baris terpisah (komponen, standar, ceklis Butir wajib) dengan tombol naik, turun, hapus, tambah, dan **Tempel banyak** (`Komponen | Standar | wajib`).
- Lencana masalah per tab dan ringkasan tiga masalah pertama; penghitung butir dan butir wajib langsung.
- Draf otomatis di perangkat (`localStorage`, kunci `tbsm-ukk-ed-draft`, berlaku 14 hari) dengan tombol Pulihkan.
- **Simpan unit** atau **Simpan dan pratinjau**. Pratinjau menampilkan lembar versi siswa tanpa pengisian dan menyebut apa yang saat ini dilihat siswa (belum dibuka, ditutup, atau terbuka).
- Cache service worker `tbsm-v80`, skrip `?v=76`.

## Pembaruan v81: analisis nilai, mode Latihan/Ujian UKK, dan pelengkap UKK
- **Analisis nilai** (Rekap nilai > tab **Analisis**, Admin dan Guru): distribusi nilai (0–59, 60–69, 70–79, 80–89, 90–100), daftar siswa remedial (status pengumpulan terakhir belum kompeten), rekap per unit, per kelas, per siswa (diurutkan dari rata-rata terendah), dan tren bulanan. Filter kelas mengikuti Rekap nilai. Pilihan **Penilaian** (default) atau **Penilaian + Latihan**.
- **Unduh Excel analisis** menghasilkan tujuh lembar: Ringkasan, Distribusi, Per unit, Per kelas, Per siswa, Tren bulanan, dan Remedial. Tombol Unduh Excel rekap pada tab Data tidak berubah. Berkas baru: `js/nilai-analisis.js`.
- **Mode Latihan dan Ujian per unit UKK** (Kelola unit > Pengaturan): Latihan boleh diulang tanpa batas dan hasilnya tercatat sebagai Latihan (tidak masuk rekap). Ujian mencatat hasil siswa sebagai Penilaian sehingga masuk rekap dan kompetensi. Pengaturan kesempatan hanya tampil pada mode Ujian.
- **Kesempatan ujian** hanya dihitung dari pengerjaan Ujian siswa sendiri (dikenali dari akun pengirim), bukan dari penilaian yang dibuat guru. Unit yang sudah ada tetap berstatus Latihan agar perilakunya tidak berubah sampai guru memilih Ujian.
- **Label mode** tampil di kartu unit untuk guru dan siswa. Tombol siswa berbunyi Mulai ujian atau Mulai latihan sesuai mode.
- **Pelengkap UKK**: Kelola unit > Hasil penilaian kini punya tombol **Unduh Excel** (sheet Ringkasan, Hasil, Distribusi, dan Belum dinilai) serta panel **Analisis unit** dan daftar **Belum dinilai** untuk siswa kelas unit yang belum punya penilaian. Berkas baru: `js/ukk-xls.js`.
- Tidak ada perubahan koleksi Appwrite. Mode unit disimpan di dokumen `lkpd_modules` (`jenis:'ukk'`) bersama pengaturan lain.
- Analisis per butir UKK (persentase Sesuai per item) belum tersedia: status tiap butir belum disimpan di catatan hasil.
- Cache service worker: `tbsm-v81`. Skrip `?v=81`.

## Pembaruan v82: foto wajib terlihat di pengaturan guru dan admin
- Kartu modul LKPD menampilkan lencana **Foto wajib N item** bila ada komponen yang wajib difoto (guru dan admin).
- Panel Pengaturan modul menampilkan daftar komponen yang wajib foto (sesuai yang tersimpan) di bagian atas bagian Foto bukti wajib, atau pesan bahwa belum ada item yang diwajibkan.
- Cache service worker: `tbsm-v82`. Skrip `?v=82`.

## Pembaruan v83: tahap 1 foto wajib UKK
- Editor butir UKK punya ceklis **Wajib foto** (satu foto per butir). Pengaturan unit menampilkan daftar butir yang wajib foto, dan pratinjau memberi lencana **Foto**.
- Di form siswa, butir wajib foto punya tombol kamera. Foto diambil lewat kamera yang sama dengan LKPD, dikompres, dan disimpan di draft perangkat per peserta (atau per kelompok di mode Latihan). Foto belum dikirim ke Drive; itu tahap 2.
- Tombol Hitung hasil tidak bisa dijalankan sebelum semua foto wajib terisi. Kekurangannya ditampilkan di bilah bawah.
- Mengambil foto pertama juga memulai waktu, sama seperti mengisi butir pertama.
- Cache service worker: `tbsm-v83`. Skrip `?v=83`.

## Pembaruan v84: tahap 2 foto wajib UKK (unggah dan penyimpanan)
- Saat Simpan, foto per butir UKK dicatat ke koleksi `lkpd_bukti` memakai jalur yang sama dengan LKPD: label `c<nomor>|<nama komponen>`, ID hasil sebagai `lkpdId`, ID unit sebagai `moduleId`. Unggah ke Google Drive dilakukan oleh fungsi `foto-drive` yang sama dan dengan pengaturan folder dan ukuran yang sama.
- Pada mode Latihan kelompok, foto hanya dicatat sekali untuk anggota pertama.
- Hasil yang punya foto bukti mendapat catatan "Foto bukti: n butir" dan tombol **Lihat foto** di Hasil penilaian.
- Cache service worker: `tbsm-v84`. Skrip `?v=84`.

## Pembaruan v85: perbaikan urutan muat dan UKK ujian individu
- Perbaikan: `ukk-foto.js` kini dimuat setelah `uji-waktu.js`. Pada v83 dan v84, file itu dimuat terlalu awal sehingga penjaga Hitung hasil (foto wajib belum lengkap) tidak terpasang.
- UKK mode Ujian dinilai per siswa. Tombol Kelompok dinonaktifkan dan pemulihan kelompok dari draft atau dari Ulangi dibatalkan untuk unit Ujian. Mode Latihan tetap boleh kelompok.
- Cache service worker: `tbsm-v85`. Skrip `?v=85`.

## Pembaruan v86: tahap 3 PDF UKK sesuai lembar kerja
- PDF UKK memakai tata letak lembar kerja UKK: kotak RAHASIA dan Paket di kop, judul UJI KOMPETENSI KEAHLIAN, LEMBAR KERJA SISWA, dan UJIAN PRAKTIK KEJURUAN.
- Identitas memuat satuan, kompetensi keahlian, kode, alokasi waktu, bentuk soal, tipe kendaraan, judul tugas, nama, kelas, dan tanggal. Nomor peserta ditampilkan dalam 13 kotak yang diisi dari NIS.
- Tabel pemeriksaan memakai kolom No urut, Jenis pekerjaan, Standar/batas servis, Hasil pengukuran/analisis, dan Kesimpulan (Sesuai atau Tidak sesuai). Catatan per butir ikut ditampilkan di kolom hasil.
- Lampiran foto bukti pada halaman tersendiri, satu foto per butir.
- Pengesahan: kotak NILAI (skor, status, KKM) dan kotak PENGUJI dengan baris Penguji Internal dan Penguji Eksternal. Tempat dan tanggal diambil dari pengaturan unit.
- Editor identitas unit punya kolom baru **Nomor paket** (default 1) dan **Tempat pengesahan** (default Sumedang).
- Cache service worker: `tbsm-v86`. Skrip `?v=86`.

## Pembaruan v87: Cetak UKK memakai PDF baru, latihan bisa selesai lebih awal
- Tombol **Cetak** pada UKK membuat PDF yang sama dengan **Unduh PDF** (kop, identitas, nomor peserta, tabel, lampiran foto, dan pengesahan), lalu membukanya di tab baru untuk dicetak. Sebelumnya Cetak memakai tampilan HTML lama.
- PDF bisa dibuat saat ujian masih berjalan. Nilai dan status ditulis "Belum selesai" sampai Hitung hasil ditekan.
- Mode Latihan boleh menekan Hitung hasil ketika setiap peserta sudah mengisi minimal satu butir dan foto wajib lengkap. Butir yang kosong dihitung belum sesuai. Mode Ujian tetap mensyaratkan semua butir terisi.
- Cache service worker: `tbsm-v87`. Skrip `?v=87`.

## Pembaruan v88: lampiran foto, penguji, dan label Latihan UKK
- Lampiran foto di PDF UKK mempertahankan rasio asli (foto potret dari HP tidak lagi dipaksa menjadi lanskap). Tiga foto per baris, enam per halaman, ukuran lebih kecil.
- Kotak PENGUJI membagi dua kolom, kiri Penguji Internal dan kanan Penguji Eksternal, masing-masing dengan garis tanda tangan.
- Hasil latihan UKK ditampilkan sebagai **Latihan UKK** di Rekap nilai, Hasil penilaian UKK, Excel, dan PDF rekap. Nilai yang tersimpan tetap "Latihan", jadi filter dan rekap kompetensi tidak berubah.
- Cache service worker: `tbsm-v88`. Skrip `?v=88`.

## Pembaruan v89: PDF UKK bisa diunduh ulang dari Rekap
- Saat **Simpan**, rincian setiap butir UKK (status, hasil ukur, catatan, standar, dan identitas lembar) disimpan di kolom `payload` pada koleksi `hasil`. Identitas dan standar disimpan sebagai salinan saat ujian, jadi PDF lama tidak berubah walaupun unitnya diedit kemudian.
- Kartu hasil UKK di **Rekap nilai** (siswa dan guru) dan di **Hasil penilaian** (guru) punya tombol **Unduh PDF**. PDF memakai tata letak yang sama dengan Unduh PDF di layar hasil, termasuk foto bukti. Foto diambil dari perangkat, atau dari Google Drive bila belum ada di perangkat.
- Kelompok: PDF setiap anggota menampilkan nama seluruh anggota. Foto hanya tersimpan pada anggota pertama, sehingga PDF anggota lain tidak memuat lampiran foto.
- Hasil yang disimpan sebelum v89 tidak punya rincian, sehingga tombol Unduh PDF tidak muncul untuk hasil tersebut.
- **Perlu `appwrite push collections`** agar atribut `payload` (100.000 karakter) ditambahkan ke koleksi `hasil`.
- Cache service worker: `tbsm-v89`. Skrip `?v=89`.
