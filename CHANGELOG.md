# Riwayat pembaruan dan rincian fitur per versi

## Format cetak PDF LKPD sesuai acuan
Cetak LKPD kini disusun dari data modul (`js/lkpd-format.js`) mengikuti format PDF LKPD SMKS Medina Bandung: banner pertemuan hijau, tabel isian, kotak centang, paraf, nomor halaman, untuk modul v2 dan semua versi lain. Rincian di `docs-LKPD-V2.md`. Tidak ada perubahan Appwrite.

Tombol **Cetak kunci** (Guru dan Admin) di samping Cetak mencetak Kunci dan Pembahasan Gerbang Masuk berformat PDF acuan; rincian di `docs-LKPD-V2.md`.

Dipindahkan dari README.md tanpa mengubah isi, agar README fokus pada panduan. Bagian di sini disusun menurut urutan versi lama ke baru; fitur yang masih dipakai juga dijelaskan di berkas `docs-*.md` (lihat indeks di README).

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
- Pada mode Latihan kelompok, foto kini dicatat untuk setiap anggota (berkas di Drive hanya diunggah sekali, lalu dipakai bersama). Hasil kelompok yang disimpan sebelum perubahan ini tetap hanya punya foto pada anggota pertama.
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
- Kelompok: PDF setiap anggota menampilkan nama seluruh anggota. Foto kini tersimpan untuk setiap anggota, sehingga PDF semua anggota memuat lampiran foto (hasil kelompok lama hanya punya foto pada anggota pertama).
- Hasil yang disimpan sebelum v89 tidak punya rincian, sehingga tombol Unduh PDF tidak muncul untuk hasil tersebut.
- **Perlu `appwrite push collections`** agar atribut `payload` (100.000 karakter) ditambahkan ke koleksi `hasil`.
- Cache service worker: `tbsm-v89`. Skrip `?v=89`.

**CBT online (Bank soal)**: token ujian, layar ujian ala CBT (navigasi nomor, ragu-ragu, layar penuh, kunci saat pindah tab), pemantauan langsung oleh guru (tambah waktu, akhiri, buka kunci), penilaian di server, daftar hadir cetak, dan analisis butir soal. Berkas baru: `js/cbt.js`, `js/cbt-staf.js`, `functions/cbt`, `tools/gabung-cbt.mjs`. Pemasangan di `docs-CBT.md`.

## Pembaruan UKK v90
- **Ujian siswa (mode Ujian)**: hasil tersimpan otomatis saat dihitung; tombol Ulangi dan catatan dikunci, siswa menekan Selesai. Mode Latihan boleh keluar saat berjalan (waktu tetap jalan, isian tersimpan).
- **Ekspor Excel UKK**: tombol Ekspor nilai kelas, sheet rincian butir (`js/ukk-butir.js`) dan impor/ekspor UKK (`js/ukk-io.js`).
- **Hapus satu pengumpulan LKPD (v91)**: Admin kini bisa menghapus satu pengumpulan dari halaman Detail (tombol "Hapus pengumpulan ini", ikut menghapus foto buktinya). Berkas: `js/lkpd-hapus.js`. Hapus nilai massal tetap di Administrasi > Hapus nilai.
- **Rekap LKPD per kelas (v93)**: Admin/Guru melihat semua kelas sekaligus, dikelompokkan per kelas dengan jumlah data dan rata-ratanya; tidak ada chip pilihan kelas. Berkas: `js/lkpd-rekap-kelas.js`.
- **Hapus nilai per baris (v94)**: di Rekap nilai, Admin punya tombol "Hapus nilai ini" di tiap kartu. Menghapus satu pengumpulan LKPD dari Detail kini ikut menghapus barisnya di Rekap nilai.
- **Kroscek navigasi (v95)**: (1) Tombol back HP kini nonaktif juga saat siswa mengerjakan atau mengirim CBT Online mode Ujian (sebelumnya hanya LKPD Ujian dan Unit Ujian). (2) Back dari sub-halaman Bank soal/CBT Online (Riwayat, Detail, Hasil, Atur latihan, form soal/sesi) kembali ke halaman utamanya dulu, bukan langsung ke Beranda. (3) Hasil penilaian yang belum disimpan meminta konfirmasi sebelum dibuang, baik lewat tombol back, menu laci, ganti peran, maupun keluar akun. (4) Pemulihan posisi setelah reload kini memeriksa izin peran aktif untuk tiap tab (`NAVPERM` di `js/nav.js`). (5) Menu Nilai Akhir UKK kini ikut kelompok UKK di laci (`js/ukk-akhir.js` dimuat sebelum `js/menu-dasbor.js`). Pemetaan back per tingkat: LKPD (editor, detail, modul), Observasi (form), Observasi UKK, Rekap kompetensi (detail), Bank soal/CBT (sub-halaman), Unit uji (ujian, hasil); tab lain langsung ke Beranda.

## Soal grup
Satu stimulus (teks atau gambar) untuk beberapa soal, di Bank soal dan kuis Editor LKPD, termasuk ujian dan cetak soal. Berkas baru: `js/soal-grup.js`, uji `tools/uji-grup.mjs`. Tidak ada perubahan Appwrite. Panduan di `docs-SOAL-GRUP.md`. Excel Bank soal dan LKPD punya kolom Grup dan Stimulus. Analisis butir lintas sesi di `js/butir.js`.

## Pra-unduh soal
Siswa menyiapkan gambar soal sesi sebelum token dirilis. Berkas baru: `js/pra-unduh.js`, uji `tools/uji-pra.mjs`. Tidak ada perubahan Appwrite atau fungsi. Panduan di `docs-PRA-UNDUH.md`.

## Format cetak PDF LKPD v2 dan gerbang PG
Nama berkas PDF `LKPD <id> <judul> <sekolah>`, tabel hanya untuk rencana pertemuan, F1 sampai F3, dan tanda tangan, soal PG/kompleks/kategori dan status tercetak sebagai kotak pilihan, unsur khusus aplikasi dibuang, nomor halaman. Gerbang masuk LKPD-X-07 berbentuk 5 soal PG (HOTS, bentuk TKA). Kolom `peran` akun jadi 64 karakter (`tools/perbesar-peran.mjs`). Rincian di `docs-LKPD-V2.md` dan `docs-PERAN-GANDA.md`.

