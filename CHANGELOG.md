## Lembar pilihan untuk semua dropdown
- `js/bank-pilihan.js` sekarang berlaku untuk semua `<select>` di aplikasi (sebelumnya hanya daftar filter Bank soal dan Atur latihan siswa), sehingga dialog bawaan Android yang hurufnya besar diganti lembar pilihan bertema. Huruf pilihan 14px seperti menu samping (`css/banksoal.css`).
- Fitur baru lembar pilihan: judul eksplisit (`data-judul`), keterangan kecil per pilihan (`option[data-ket]`, dipakai untuk nama lengkap jurusan), pilihan kosong tampil redup, dan kotak Cari otomatis untuk 8 pilihan atau lebih (`data-cari` memaksa, `data-tanpa-cari` menyembunyikan).
- Dikecualikan: select di dalam tabel (cetak dan UKK), `select multiple`, `select size`, dan select ber-atribut `data-native`. Nilai tetap ditulis ke select aslinya dengan peristiwa input dan change, jadi logika halaman tidak berubah.
- Uji baru: `tools/uji-pilihan.mjs`.

## Alumni: jurusan per sekolah
- Daftar jurusan di form Alumni mengikuti sekolah: Darul Fatwa = TSM, TKJ; Medina = TSM, TKR, TKJ, OTKP (admin lintas sekolah melihat keempatnya). Kode tetap disimpan di kolom `prodi`. Kolom Jurusan berupa pilihan (select), bukan daftar saran, karena daftar saran tidak tampil di sebagian Chrome Android.
- Daftar Alumni punya filter Jurusan (ikut sekolah) di samping tahun dan status; ekspor Excel mengikuti filter itu. Template impor memuat petunjuk kolom Jurusan.
- Semua dropdown modul Alumni (form: Jurusan, Status alumni, Status tautan atasan, pertanyaan tracer berpilihan banyak; daftar dan dasbor: filter Jurusan, Tahun, Status) lewat satu fungsi `alSel` dan registri `AL_PIL` di `js/alumni.js`, dan lembar pilihannya digambar `bank-pilihan.js`. Pilihan tunggal dengan 4 opsi atau lebih menjadi dropdown (`AL_AMBANG_DROPDOWN`); ya/tidak dan skala 1-4 tetap radio. Label isian memakai gaya `label.f`, teks pertanyaan sedikit dikecilkan (`.al-q`).
- Impor Excel menerima nama lengkap jurusan selain kodenya. Alumni baru tidak lagi diisi TSM otomatis di Darul Fatwa.

## Modul Alumni dan Tracer
- `js/alumni.js` (baru, dimuat sebelum `menu-dasbor.js`): menu Alumni dan Tracer untuk admin, guru, dan Kepala Sekolah (hanya lihat). Data alumni, form tracer empat langkah meniru Tracer Vokasi, dasbor (status, kesesuaian, 15 aspek, belum mengisi + WhatsApp), impor/ekspor Excel, template.
- **Appwrite**: koleksi baru `alumni` di `appwrite.json` (baca/buat/ubah label guru dan admin, hapus admin). Jalankan `appwrite push collections` atau `node tools/setup-appwrite.mjs` sebelum memakai menu. Tidak ada perubahan fungsi server, Neon, atau koleksi lain.
- `js/menu-dasbor.js`: kelompok menu "Alumni dan Tracer". Tidak terhubung ke portal resmi; pengisian resmi tetap oleh alumni di portal.
- Uji baru `tools/uji-alumni.mjs` (51). Uji lain tidak berubah (`uji-lkpd-banner` 3 gagal dan `uji-lkpd-struktur` 1 gagal sudah ada sebelum perubahan ini). Dokumen: `docs-ALUMNI.md`.

## Edit LKPD v2 mengikuti form siswa
- `js/lkpd-v2-struktur.js` (baru, dimuat setelah `lkpd-v2-editor.js`): urutan tab editor LKPD v2 mengikuti form siswa (Info; Materi: Tujuan & teori, Rencana pertemuan, Gerbang masuk, Alat & K3; Lembar Kerja: Langkah, Tabel data, Pemeriksaan, Syarat kirim; Evaluasi; Penilaian). Soal gerbang masuk pindah dari tab Soal ke tab Gerbang masuk.
- **Rencana pertemuan** bisa diedit: judul, JP, menit, target praktik, kegiatan tiap pertemuan, kartu Lembar Kerja (judul, pisah per kegiatan), latihan soal, nama kegiatan, serta kegiatan, menit, dan saksi guru tiap langkah. Total JP dan alokasi waktu mengikuti pertemuan.
- **Tabel data**: judul, kegiatan, baris, desimal, catatan, nama kolom, tambah dari dua contoh, hapus. **Pemeriksaan**: kegiatan dan sumber hasil otomatis dari tabel. **K3**: kelompok dan butir APD berparaf. **Syarat kirim**: ringkasan, isian wajib, dan foto wajib.
- Tanpa perubahan, hasil simpan identik dengan modul asli (5 modul v2). Jumlah dan urutan langkah, butir K3, dan komponen tetap dikunci. Tidak ada perubahan server, Appwrite, atau Neon; `CBT_DB:'neon'` di `js/config.js` tidak disentuh; modul dipasang di atas kode LKPD baru (`LKPD-DDO-ALT-02` dan seterusnya).
- Uji baru `tools/uji-lkpd-struktur.mjs` (125; modul bertabel memakai salinan ALT-02 + `fixtur-tabel-x06.js`). Uji lain, `periksa`, dan `audit-izin` tidak berubah. Dokumen: `docs-LKPD-STRUKTUR.md`.

## Pembersihan: modul banner lama dan berkas sisa dibuang
- `js/lkpd-v2-banner.js` (banner gradien lama) dihapus bersama `tools/uji-lkpd-banner.mjs`: modul itu tidak lagi dimuat `index.html` dan tidak dirujuk berkas lain sejak kartu Kegiatan memakai kepala akordeon (`lk2-ph`, `lk2Bn`), sehingga polanya tidak pernah cocok dan ujinya gagal 3 butir sejak lama. Tampilan aplikasi tidak berubah.
- `js/lkpd-v2-x07.js` (sisa penggantian nama X-07 menjadi X-06, tidak dimuat) ikut dihapus. `up.sh` menghapus ketiga berkas ini setelah zip dipasang (zip tidak bisa menghapus).
- Seluruh uji (`periksa`, 32 skrip uji, `audit-izin`) kini lulus tanpa kegagalan.

## Administrasi Akademik: tabel Peta LKPD per prodi, CP, dan kelas
- `js/akademik.js`: tab Peta LKPD punya tampilan **Tabel** (bawaan) dan **Kartu**. Tabel 1: Rekap Prodi, CP, dan Kelas (jumlah LKPD · JP per CP untuk Kelas X, XI, XII, jumlah per prodi dan jumlah semua). Tabel 2: Daftar LKPD berkode (kode, kelas, semester, judul, TP, JP, status, kode lama). Filter dan pencarian berlaku untuk keduanya. Catatan usang "ID modul tidak diubah" diperbarui.
- Unduh Excel analisis: lembar baru **Rekap Prodi-CP-Kelas**. `css/app.css`: gaya `.akd-tbl` (gulir mendatar di HP, kolom kode tetap).
- Uji: `uji-akademik` 159 lulus (butir tabel dan Excel ditambah).

## LKPD: kode berbasis prodi dan CP (tanpa tingkat), kode lama tetap terbaca
- Kode baru `LKPD-<PRODI>-<CP>-<NN>` (mis. `LKPD-DDO-ALT-02`, `LKPD-TSM-PMT-03`); `DDO` = dasar bersama semua prodi otomotif, `TSM`, `TKR` disiapkan. Tingkat (X, XI, XII) tidak lagi ada di kode, hanya isian kelas, sehingga LKPD bisa naik atau turun tingkat tanpa mengubah kode. Rincian: `docs-LKPD-KODE.md`.
- `tools/matriks-lkpd.py`: menurunkan kode baru (`k`), kode lama (`ka`), `pr`, `cp`, dan blok `AKD_LKPD_PRODI`, `AKD_LKPD_CP`, `AKD_LKPD_ALIAS` (54 kode); nomor stabil; mode `--migrasi` mengonversi blok yang ada tanpa xlsx. `js/akademik-data.js`: Peta LKPD 54 baris berkode baru, padanan modul ikut.
- `js/lkpd-kode.js` (baru): `lkKodeBaru`, `lkKodeLama`, `lkKodeSama`, `lkKodeParse`, `lkKodeBerikut`, dan `lkKodeNormalisasi` (hasil, bukti, modul terkelola berkode lama dibaca sebagai kode baru di memori, dijalankan di `lkRefreshModules`).
- Lima modul LKPD v2 memakai id baru dengan `alias` kode lama, `prodi`, dan `cp` (X-06 menjadi DDO-ALT-02, X-12 menjadi DDO-ELK-01, X-18 menjadi DDO-KOM-03, XI-17 menjadi TSM-PMT-02, XI-18 menjadi TSM-PMT-03).
- Peta LKPD (Administrasi Akademik): dikelompokkan Prodi lalu CP (bawaan) atau Kelas saja; kartu memuat pill kelas dan kode lama; pencarian menerima kode lama; Excel menambah kolom Kode lama, Prodi, CP (singkatan).
- Editor LKPD guru, tab Info: pilihan Prodi dan CP, ID LKPD baru terisi otomatis dengan nomor berikutnya.
- Uji: `tools/uji-lkpd-kode.mjs` (baru, 40); `uji-akademik` disesuaikan (150); uji lain memakai kode baru dan tetap lulus.

## Link SEB: alamat tidak diubah di dalam SEB
- `js/nav.js`: `?go=cbt` tidak lagi dihapus dari alamat lewat `history.replaceState` bila dibuka di Safe Exam Browser (objek `SafeExamBrowser` atau UserAgent `SEB/`, `SEB_iOS`). Sebelumnya alamat yang dikirim ke server (`sebUrl`) menjadi `?s=medina&sesi=...` tanpa `go`, berbeda dari `startURL` di file .seb, sehingga hash Config Key bisa tidak cocok bila SEB menghitungnya dari alamat awal. Di luar SEB perilaku tetap (parameter `go` dihapus).
- Uji: `periksa`, `uji-cbt` 160, `audit-izin` tanpa temuan baru.

## CBT: jalur panas ke Neon (Postgres), opsional dan bisa dikembalikan
- `functions/cbt/src/neon.js` (baru), `functions/cbt/src/main.js`: lapisan dokumen memilih Neon untuk `soal_run`, `soal_hasil`, `soal_kunci` bila variabel fungsi `CBT_DB=neon` dan `NEON_URL` terisi; selain itu tetap Appwrite. Dokumen lama di Appwrite tetap terbaca dan terubah selama `CBT_LEGACY` bukan `0`. Kolom `sekolah` dan `prodi` (variabel `PRODI`, bawaan `tsm`) ikut disimpan.
- Aksi baru: `dok` (get, list, create, update, delete untuk klien; siswa hanya baca miliknya, `soal_kunci` hanya guru/admin), `dbUji` (admin: uji sambungan, `siapkan:true` membuat tabel), `dbSalin` (admin: salin data lama Appwrite ke Neon, berhenti di batas waktu dan melaporkan `sisa`). Terdaftar di `CBT_AKSI`.
- `js/neon-db.js` (baru, dimuat setelah core.js): `Cloud.db` dan `Cloud.list` untuk tiga koleksi itu lewat fungsi bila `CBT_DB:'neon'` dan `CBT_AMAN:true`; kode `404` dan `409` dipertahankan. `js/neon-admin.js` (baru): kartu admin di CBT Online (Uji sambungan, Siapkan tabel, Salin data lama). `js/config.js`: `CBT_DB:'appwrite'` (bawaan) dan `CBT_LEGACY:true`.
- `tools/gabung-cbt.mjs` menyalin `neon.js` ke `akun-admin`; `package.json` kedua fungsi menambah `pg` (dimuat hanya di mode Neon). `neon-schema.sql` dan `docs-NEON.md` baru.
- Uji: `tools/uji-neon.mjs` (51), `tools/uji-neon-klien.mjs` (18), `uji-cbt` 160 tetap lulus; `periksa` dan `audit-izin` tanpa temuan baru.

## CBT: jeda simpan jawaban lebih jarang dan bisa diatur (hemat kuota Appwrite gratis)
- `js/cbt.js`, `js/ujian-server.js`, `js/config.js`: simpan berkala 60 detik menjadi **90 detik** (`CBT_DENYUT`, dijepit 30 sampai 120 detik), simpan setelah jawaban berubah 10 sampai 14 detik menjadi **30 sampai 34 detik** (`CBT_SIMPAN`, dijepit 10 sampai 60 detik). Dikunci pengawas tetap 8 detik. Simpan saat aplikasi disembunyikan, online kembali, pindah soal tertentu, dan Selesai tidak berubah.
- Perkiraan: tulis database dan eksekusi fungsi per siswa per ujian turun sekitar separuh. Jawaban terakhir yang belum terkirim tetap ada di perangkat. Batas "tidak aktif" Pantau 2,5 menit tetap di atas 90 detik.
- Uji: `uji-cbt` 160, `periksa`, `audit-izin` tanpa temuan baru.

## CBT Online: ID sesi tampil dan bisa disalin
- `js/banksoal.js`: kartu sesi (guru/admin) menampilkan ID sesi dan tombol **Salin ID**, dipakai untuk `tools/buat-seb.mjs --sesi=ID`. Tidak ada perubahan server.

## SEB: link langsung ke sesi ujian
- `tools/buat-seb.mjs`: opsi baru `--sekolah`, `--go=cbt`, `--sesi=ID`. startURL memuat `?s=..&go=cbt&sesi=ID`; quitURL ikut membawa `?s=`.
- `js/nav.js`: membaca `?sesi=ID` (divalidasi), `navSesiId()`. `js/banksoal.js`: sesi tujuan tampil paling atas dengan tanda di CBT Online. Ujian tidak dimulai otomatis.
- Server tidak berubah: Config Key dihitung atas alamat lengkap yang dikirim SEB. Per-sesi = Config Key sendiri, gabungkan di `SEB_CONFIG_KEYS`.
- `docs-SEB.md`: bagian "Link SEB langsung ke sesi ujian". Uji: `uji-seb-keluar`, `uji-cbt` (160) lulus.

## LKPD v2: modul baru LKPD-X-18 (Membongkar, Memeriksa, dan Memasang Komponen sesuai Manual Servis)
- `js/lkpd-v2-x18.js` (baru, hanya data, Draft, tidak aktif): Kelas X Genap, TP X.6.4, job sheet praktik, **36 JP = 9 pertemuan x 4 JP (180 menit)** sesuai matriks ringkas jam revisi; unit SKKNI 034, 049 (L3), 051 (L3), 052 (L3) sebagai usulan yang perlu diverifikasi.
- Susunan: Pertemuan 1 (pemantik, materi, gerbang, APD, cek alat) dan Pertemuan 9 (penilaian kinerja, refleksi, remedial atau pengayaan) tanpa kegiatan; Pertemuan 2 sampai 8 = Kegiatan 1 sampai 7, satu kartu per pertemuan (tidak disatukan): 1 manual servis dan cover body, 2 pengencangan sesuai torsi dan urutan, 3 kepala silinder, 4 silinder, piston, dan ring, 5 generator section, 6 kopling dan transmisi (bak transmisi tidak dibuka; poros dan gigi tetap di LKPD-XI-17), 7 uji fungsi dan laporan servis. Tiap kegiatan menutup siklus bongkar, periksa, pasang sehingga engine utuh di akhir pertemuan.
- 42 langkah (waktu per kegiatan 100 sampai 135 menit, semua kurang dari 180), 12 komponen Pemeriksaan dan bukti, 12 soal latihan isian (torsi, kerataan, rasio kompresi, volume langkah, celah piston dan ring, hambatan stator, daya, plat kopling, persen waktu), gerbang 5 soal (3 PG, 1 PG kompleks, 1 PG kategori), 10 butir K3, 6 analisis, rubrik 6 aspek berbobot 100 dengan K3 sebagai aspek penghenti. Tanpa tabel F (`tabel:[]`).
- Angka spesifikasi (torsi, batas kerataan, celah, hambatan, tebal plat, oli) dikosongkan untuk diisi guru dari manual servis; angka pada soal hanya contoh hitung.
- `js/akademik-data.js` dan `tools/matriks-lkpd.py`: status Peta LKPD X-18 (dan X-12) menjadi Draft (V2). `index.html` dan `service-worker.js` memuat modul baru.
- Uji: `tools/uji-lkpd-x18.mjs` (baru, 48 lulus); xi18 100, x12 23, v2 280, master 39, format 69, semua 83, gerbang 47, akademik 149 lulus; `periksa` dan `audit-izin` tanpa temuan baru.

## LKPD v2: tombol Kunci kegiatan sesuai jumlah kegiatan
- `js/lkpd-kunci.js`: `lkkIsLockable` tidak lagi membatasi ke pertemuan tengah (`n>1 && n<total`). Setiap kegiatan yang kartunya tampil punya satu tombol kunci. Pada LKPD-XI-17 dan XI-18 (3 pertemuan) tombolnya kini **Kunci Kegiatan 1, 2, 3, 4** (sebelumnya hanya Kegiatan 2 dan 3). Pada modul 5 pertemuan (X-06) tidak berubah: pertemuan awal dan akhir tanpa kegiatan tetap tidak punya kunci. Pilihan "Sampai Kegiatan N" di Pengaturan guru ikut menampilkan semua kegiatan.
- Isian yang ikut terkunci per kegiatan tetap sama (langkah, pemeriksaan, soal latihan, waktu aktual, analisis); gerbang, K3, dan refleksi tetap bebas. Analisis XI-18 ikut Kegiatan 4 karena berada di pertemuan 3.
- Uji: `uji-lkpd-v2` 280 (ditambah 3 butir kunci XI-18), lainnya tetap lulus.

## LKPD: ceklis "Sudah terisi" pada Pemeriksaan dan bukti dihapus
- `js/lkpd.js`: kolom **Terisi** (kartu "Sudah terisi" di HP) pada tabel Hasil pemeriksaan dihapus. `lkRowOk` kini menganggap komponen terisi bila **Hasil aktual berisi dan Status dipilih** (bukan "Belum diperiksa"), sama dengan aturan LKPD v2 (`lk2Simpan` sudah menurunkan `row<i>` dari dua isian itu). Penghitung Periksa, syarat kirim, dan Analisis memakai aturan yang sama; draf lama yang hanya diceklis tanpa Status dihitung belum terisi.
- `js/lkpd-analisis.js`: keterangan "Terisi lengkap (centang dan hasil aktual)" menjadi "(hasil aktual dan status)".
- Uji: xi18 100, v2 277, master 39, format 69, semua 83, cetak 52, gerbang 47, foto 68, akademik 149, pandu-v2 45, pewaktu 40 lulus.

## LKPD v2: tabel F dihapus, hanya Pemeriksaan dan bukti yang dipakai (X-06, XI-17, XI-18)
- Tabel F1-F3 (kolom 1, 2, 3, Rata-rata, Standar, Status) dihapus dari LKPD-X-06, LKPD-XI-17, dan LKPD-XI-18 (`tabel:[]`, `cekAuto` dibuang). Hasil aktual, standar, status, dan foto kini hanya diisi di kartu **Pemeriksaan dan bukti** (Hasil aktual diisi manual, tidak lagi otomatis dari tabel).
- `js/lkpd-v2.js`: `lk2TabelPct` mengembalikan `null` bila modul tanpa tabel; nilai praktik (verifikasi dan skor) memakai Pemeriksaan saja tanpa dibagi dua dengan tabel; chip "Tabel %", catatan "Tabel n%" di Penilaian guru, dan blok "Data hasil pengukuran" di Detail tidak tampil. `v2.tabel` di data kiriman menjadi `null`. Mesin tabel tetap ada untuk modul lain yang memakai tabel.
- `js/lkpd-master.js`: butir "Tabel data" kini berbunyi "bila ada" (modul boleh tanpa tabel; tabel yang ada tetap harus punya kolom dan baris).
- Teks langkah, hint pemeriksaan, analisis (pertanyaan tentang 3 kali ukur diganti), rubrik Hasil kerja dan Prosedur, indikator, dan panduan observasi tidak lagi menyebut tabel F atau pengukuran 3 kali. Materi dan soal gerbang tentang koreksi nol alat tidak diubah.
- Uji: `tools/fixtur-tabel-x06.js` menyimpan tabel F X-06 lama khusus untuk uji mesin tabel (`uji-lkpd-v2`, `uji-lkpd-format`); `uji-lkpd-xi18` memeriksa tidak ada sisa rujukan tabel F. Lulus: xi18 100, v2 277, master 39, format 69, semua 83, akademik 149. `uji-lkpd-banner` gagal 3 butir sejak sebelum perubahan ini.

## Matriks ringkas jam revisi dipasang: LKPD-X-07 menjadi LKPD-X-06, XI-17 dan XI-18 menjadi 3 x 6 JP, Peta LKPD 54 LKPD
- **Kode modul Alat Ukur: LKPD-X-07 menjadi LKPD-X-06** (sesuai penomoran matriks ringkas; X-07 di matriks adalah Alat Diagnosis Dasar, 12 JP, belum ada modul). Berkas `js/lkpd-v2-x07.js` menjadi `js/lkpd-v2-x06.js`; master V2 (`LKMS.ID`), `LK.module`, padanan Peta LKPD, nama PDF (`LKPD X-06 ...`), dokumen, dan semua uji ikut diganti. Entri CHANGELOG di bawah ini yang menyebut X-07 adalah riwayat dan tidak diubah. Catatan: draf, pengumpulan, dan kunci yang sudah tersimpan dengan id lama `LKPD-X-07` tidak otomatis pindah; modul masih Draft, jadi sebaiknya belum ada data siswa.
- **Peta LKPD**: `tools/matriks-lkpd.py` ditulis ulang untuk membaca `Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx` (sheet Ringkasan, Matriks Ringkas); `AKD_LKPD_MATRIKS` kini 54 LKPD (X 19, XI 23, XII 12), JP per kelas 432, 648, 352. Status aplikasi: X-06 Draft (master V2), XI-17 dan XI-18 Draft (V2). Padanan XI-17 dan XI-18 menjadi `tepat`.
- **JP per pertemuan**: Kelas X 4 JP, Kelas XI 6 JP, Kelas XII 6 JP. Kelas X disesuaikan ke kelipatan 4 JP (10 LKPD berubah 2 JP: X-01 16, X-04 32, X-05 28, X-06 20, X-08 32, X-09 16, X-10 28, X-13 20, X-14 16, X-19 32; total semester tetap 216). Sisa hanya LKPD-XII-10 (22 JP = 3 x 6 + 4).
- **LKPD-XI-17 dan XI-18**: 6 pertemuan x 3 JP diganti 3 pertemuan x 6 JP (270 menit); Pertemuan 2 memuat Kegiatan 2 dan 3 sebagai dua kartu. Karena hanya 3 pertemuan, hanya Pertemuan 2 yang dapat dikunci siswa.
- `js/lkpd-master.js`: butir "awal dan akhir tanpa kegiatan" tidak berlaku untuk modul 3 pertemuan. `js/lkpd-v2.js`: kalimat penilaian guru menyebut rentang pertemuan praktik dari data (`lk2PertPraktik`).
- Uji: `uji-akademik` 149, `uji-lkpd-xi18` 102, `uji-lkpd-v2` 274, `uji-lkpd-master` 39, `uji-lkpd-semua` 83 lulus. `uji-lkpd-banner` gagal sejak sebelum perubahan ini (3 pemeriksaan). Tidak ada perubahan Appwrite.

## LKPD v2: modul LKPD-XI-17 (Transmisi Manual) dan LKPD-XI-18 (Transmisi Otomatis/CVT), Draft, mengikuti matriks ringkas
- Mengikuti `Matriks_LKPD_TSM_Kelas_X-XII_ringkas.xlsx`: LKPD-XI-18 lama (Transmisi termasuk CVT, 36 JP) dipecah menjadi **LKPD-XI-17 Transmisi Manual** (unit SKKNI 051, level 3) dan **LKPD-XI-18 Transmisi Otomatis (CVT)** (unit 027), masing-masing 18 JP, TP XI.3.2, Kelas XI Genap. Pembagian 18 + 18 JP adalah usulan matriks. Berkas data baru `js/lkpd-v2-xi17.js` dan `js/lkpd-v2-xi18.js` (modul XI-18 sebelumnya digabung, kini hanya CVT).
- Tiap modul: 6 pertemuan x 3 JP (135 menit); pertemuan 1 (materi, gerbang masuk, APD) dan 6 (penilaian, refleksi) tanpa praktik; Kegiatan 1 sampai 4 masing-masing satu pertemuan dan satu kartu. XI-17: pembongkaran dan gigi, garpu pemilih dan bearing, keolengan poros (dial gauge), perakitan dan uji fungsi. XI-18: V-belt, puli primer dan roller, puli sekunder dan kopling sentrifugal (SST), perakitan dan uji fungsi.
- Isi tiap modul: gerbang masuk 5 soal (3 PG, 1 PG kompleks, 1 PG kategori), 6 soal latihan isian berkunci, tabel pengukuran 3 kali, K3 10 butir (4 APD), rubrik 6 aspek berbobot 100 (K3 penghenti), 8 indikator.
- Angka spesifikasi (standar, batas pakai, torsi, jenis dan jumlah oli) sengaja kosong: guru mengisinya dari manual servis. Padanan SKKNI hanya usulan dan perlu diverifikasi.
- `js/akademik-data.js`: padanan modul XI-17 dan XI-18 ke baris matriks lama XI-18 ditandai `sebagian`. Peta LKPD di aplikasi masih memakai matriks revisi2 (62 LKPD); penomoran matriks ringkas (54 LKPD) belum dipasang ke aplikasi. `index.html` dan `service-worker.js` dirilis ulang. Tidak ada perubahan Appwrite.
- Uji: `tools/uji-lkpd-xi18.mjs` (kini memeriksa XI-17 dan XI-18: 14 butir master, hitungan kunci, menit langkah, rubrik); `tools/uji-lkpd-semua.mjs` memeriksa cetak dan kunci untuk tiga modul v2.

## LKPD v2: ukuran huruf judul LKPD, Foto tambahan, dan Pembahasan latihan disamakan
- Judul LKPD (mis. "Penggunaan dan Perawatan Alat Ukur ..."), **Foto tambahan**, dan **Pembahasan latihan** kini 17 px, sama dengan judul banner (`.lk-h2s` di `css/app.css`). Tidak ada perubahan Appwrite.

## Perbaikan: kartu Kunci pertemuan kembali paling bawah (di bawah Pembahasan latihan)
- Pada mode Latihan, kartu Pembahasan latihan sempat tampil di bawah kartu Kunci pertemuan dan progres, dengan ruang kosong di antaranya. Kini Pembahasan disisipkan sebelum kartu Kunci (`js/lkpd-mode.js`), jadi kartu Kunci pertemuan dan progres menjadi kartu paling bawah dan ruang kosong hilang. Uji `uji-pandu-v2` 45 (1 baru). Tidak ada perubahan Appwrite.

## LKPD v2: Alat dan bahan lipat, kartu kegiatan seragam, kunci di kartu bawah dengan ikon gembok, overlay disesuaikan
- **Alat dan bahan** kini banner lipat (tertutup bawaan) seperti bagian Materi lainnya.
- **Kartu Kegiatan** memakai gaya banner Identitas praktik: judul 17 px (sebelumnya besar), latar gradasi dan garis hijau di kiri; isi kartu diberi bantalan sendiri (`.card.lk2-p` di `css/app.css`).
- **Kunci pertemuan dan progres dipindah ke kartu paling bawah** (banner lipat, `lk2BawahKartu`), tidak lagi di dalam bilah tombol bawah, sehingga bilah hanya berisi Simpan draf, Kirim LKPD, Cetak.
- **Ikon gembok** di kanan jam pewaktu pada kartu kegiatan yang sudah dikunci (`lk2Terkunci`, `lk2KunciIkon`). Kartu yang terkunci tidak dihitung waktunya (pewaktu tidak jalan walau kartu dibuka).
- **Overlay Materi & Prosedur / Lembar Kerja** lebih kecil dan posisinya tidak lagi bergantung pada skrip: menumpang di atas bilah tombol bawah (`.lk-ov-bar`), atau melayang di dasar layar bila tidak ada bilah menempel (tab Materi siswa, pratinjau). Ruang kosong di akhir halaman agar isi tidak tertutup.
- Uji `uji-pewaktu-pertemuan` 40 (gembok, banner Alat dan bahan, overlay dua mode); `uji-lkpd-v2` 274, `uji-pandu-v2` 44, `uji-lkpd-format` 69, `uji-pandu` 103 tetap lulus; diperiksa di Chromium tanpa galat. Tidak ada perubahan Appwrite.

## LKPD v2: pewaktu otomatis mengikuti kartu, banner lipat, overlay tombol Materi dan Lembar Kerja
- **Pewaktu tanpa tombol.** Tombol Mulai/Jeda/Lanjut/Selesai dihapus; kepala kartu hanya menampilkan jam (titik berdenyut saat berjalan). Kartu Kegiatan **terbuka = pewaktu jalan, tertutup = berhenti** dan waktunya tersimpan; membuka lagi melanjutkan. Berlaku untuk semua kartu Kegiatan (1 sampai 4). Pindah ke kartu lain, pindah tab, keluar dari LKPD, atau muat ulang juga menghentikan pewaktu (`lkcSelaras` di `js/lkpd-timer.js`, dipanggil dari `lk2Buka` dan tiap render). Kirim membekukan waktu; setelah Kirim berhasil kartu ditutup.
  - Ujian tetap berbasis jam dinding dan kolom waktu terkunci, tetapi waktu **bisa berhenti dengan menutup kartu** (sesuai permintaan).
- **Banner lipat** (tertutup secara bawaan, status diingat selama sesi, cetak membuka semua; `lk2Bn` di `js/lkpd-v2.js`): Materi: Tujuan pembelajaran, Rencana pertemuan, **Teori singkat** (sebelumnya "Memahami"), Gerbang masuk praktik, K3. Lembar Kerja: Identitas praktik, Analisis dan keputusan teknis, Refleksi. Gerbang dan K3 menampilkan ringkasan progres di judul. Saat Kirim menemukan isian kurang, banner yang memuatnya dibuka otomatis; tombol "Ke gerbang masuk" membuka banner Gerbang.
- **Overlay tombol** Materi & Prosedur dan Lembar Kerja melayang di bawah layar (di atas bilah tindakan bila menempel); dua tombol itu dipindah dari deretan tombol atas. Evaluasi dan Riwayat/Rekap tetap di atas. Tersembunyi saat cetak.
- Uji `uji-pewaktu-pertemuan` ditulis ulang (36 pemeriksaan); `uji-lkpd-v2` 274, `uji-pandu-v2` 44, `uji-lkpd-format` 69 tetap lulus; diperiksa juga di Chromium tanpa galat. (`uji-lkpd-banner` gagal sejak sebelum perubahan ini karena `lkpd-v2-banner.js` tidak dimuat aplikasi.) Tidak ada perubahan Appwrite.

## LKPD v2 (X-07): kartu Lembar Kerja terbuka otomatis saat dipilih
- Hanya satu kartu Lembar Kerja yang terbuka. Mengetuk judul kartu atau fokus ke isian di dalamnya membuka kartu itu dan menutup kartu sebelumnya; mengetuk judul kartu yang terbuka menutupnya (`lk2Buka`, `.lk2-p.is-open` di `js/lkpd-v2.js` dan `css/app.css`).
- Saat Kirim LKPD menemukan isian kurang, kartu yang memuat isian merah pertama dibuka otomatis. Cetak tetap membuka semua kartu.
- **Pewaktu pindah ke kepala kartu**: di bawah judul, di kanan pill Target (jam dan tombol Mulai/Jeda/Selesai), terlihat juga saat kartu tertutup (`lkcRow(m,c,true)`, `.lk2-pm` di `css/app.css`).
- **Tidak meloncat**: saat kartu lain menutup, judul kartu yang dipilih dijaga di posisi layar semula (`lk2Buka`). Perbaikan juga untuk ketukan judul yang sempat membuka lalu langsung menutup (fokus ke judul diabaikan).
- Uji tetap lulus (`uji-lkpd-v2` 274). Tidak ada perubahan Appwrite.

## LKPD v2: Kegiatan tidak digabung di Rencana pertemuan dan cetak
- Aturan tetap: **Kegiatan tidak boleh disatukan.** Lembar Kerja sudah memisahkan kartu Kegiatan 3 dan 4; kini Rencana pertemuan dan cetak juga memisahkannya.
- **Rencana pertemuan (Materi):** ringkasan menjadi "K1 25 + K2 20 + K3 20 + K4 15" (sebelumnya "K3+4 35"); Pertemuan 4 menyebut "target praktik K3 20 + K4 15 menit" dan menampilkan daftar langkah serta target menit tiap kegiatan sendiri (`lk2PraktikTeks` di `js/lkpd-v2.js`).
- **Cetak (`js/lkpd-format.js`):** tabel rencana dan spanduk pertemuan memakai teks yang sama; judul Kegiatan 3 dan 4 memuat target menit masing-masing.
- Uji `uji-lkpd-v2` 274 (2 baru). Tidak ada perubahan Appwrite.

## Perbaikan: Lembar Kerja tidak bisa dibuka (bentrok nama global LKC)
- **Penyebab:** pewaktu per pertemuan (`js/lkpd-timer.js`) dan `js/lkpd-cetak.js` sama-sama memakai variabel global `LKC`. Di peramban yang terakhir dimuat menimpa yang lain, sehingga membuka tab Lembar Kerja menimbulkan galat ("Cannot read properties of undefined") dan siswa tetap di Materi.
- **Perbaikan:** variabel pewaktu diganti menjadi `LKCT`. Uji pewaktu mendapat pemeriksaan agar nama itu tidak dipakai lagi; diuji juga di Chromium (gerbang dijawab, Lembar Kerja terbuka, pewaktu kartu berjalan, tanpa galat).

## Editor LKPD v2: nilai gambar skala bisa diubah, kunci disamakan; Kompeten Observasi v2 mengikuti KKM
- **Kolom nilai gambar skala di Editor** (soal isian bergambar): jangka sorong (ketelitian, skala utama, garis nonius), mikrometer (selubung, garis 0,5 mm, bidal), dial gauge (putaran, garis jarum besar), keolengan (garis terbesar dan terkecil). Gambar menampilkan bacaan hasil hitungan (`skgHitung` di `js/lkpd-skala-gambar.js`, `lkeGBox` di `js/lkpd-v2-editor.js`).
- **Peringatan bila kunci tidak cocok dengan gambar**, dengan tombol **Samakan kunci** yang mengisi kunci dari gambar. Peringatan tidak menghalangi simpan.
- **Keputusan Kompeten di Observasi v2** kini juga mensyaratkan nilai akhir minimal KKM (`S.kkm`); catatan lama tidak berubah karena menyimpan hasilnya sendiri.
- Uji baru `uji-editor-gambar` (20 pemeriksaan, termasuk 10 kunci X-07 sama dengan hitungan gambar). Uji lain tetap lulus. Tidak ada perubahan Appwrite.

## LKPD v2: pewaktu per pertemuan, bilah bawah ringkas, Detail guru dilipat
- **Pewaktu per kartu pertemuan (LKPD v2).** Pewaktu tunggal di bilah bawah diganti pewaktu di tiap kartu Lembar Kerja (`lkcRow`, `lkc*` di `js/lkpd-timer.js`); LKPD lama tetap memakai pewaktu tunggal. Pewaktu mengisi kolom "Waktu aktual" otomatis (menit, dibulatkan, minimal 1) dan jumlah semua kartu menjadi waktu kiriman (`lktSec`).
  - **Ujian: waktu tidak bisa dijeda.** Mulai lewat tombol atau otomatis saat kartu diisi; berbasis jam dinding sehingga tetap berjalan walau halaman ditutup atau dimuat ulang; hanya satu kartu berjalan; berhenti lewat Selesai (setelah itu tidak bisa dimulai lagi) atau saat Kirim. Kolom waktu terkunci (readonly) agar tidak diketik manual. Pewaktu tiap pertemuan terpisah, jadi jam dinding tidak lagi terus berjalan lintas hari.
  - **Latihan:** Mulai/Jeda/Lanjut bebas, memulai kartu lain menjeda kartu sebelumnya, kolom boleh diedit. Setelah Kirim semua pewaktu kartu dibersihkan.
- **Bilah bawah tab Materi tidak lagi lengket dan tanpa "Kirim LKPD"** (siswa); hanya Simpan draf dan Cetak. Bilah di Lembar Kerja dirapatkan (`.lk-lite`, `.lk-actions` di `css/app.css`).
- **Detail guru dilipat:** Gerbang masuk, Data hasil pengukuran, Hasil pemeriksaan dan foto bukti, Latihan membaca skala, serta Analisis dan refleksi kini bagian lipat (`lk2DetB`). Identitas, APD, Langkah (kontrol verifikasi), Waktu, dan Kartu nilai tetap terbuka. Cetak membuka semua.
- Uji: `uji-lkpd-v2` 272, `uji-pandu-v2` 44, `uji-lkpd-format` 69, `uji-skala-tanpa-label` 14, uji baru `uji-pewaktu-pertemuan` 21. Tidak ada perubahan Appwrite.

## LKPD-X-07: perbaikan dari evaluasi tim (alur siswa, waktu, nilai)
- **Pesan Kirim LKPD menyebut kolomnya.** Bila Status pemeriksaan belum dipilih, pesan kini berbunyi mis. "Pemeriksaan dan bukti: pilih Status pada \u201cPosisi nol jangka sorong\u201d"; siswa dibawa ke tab yang tepat dan kolom yang kurang diberi garis merah (`lk2Kurang`, `LK2.tandai`, kelas `.lk2-need` di `css/app.css`).
- **K3 wajib dicentang semua sebelum kirim** (sebelumnya lupa mencentang diam-diam memotong hingga 20 poin). Pesan menyebut nomor butir yang belum.
- **Latihan membaca skala pindah ke Lembar Kerja**, per pertemuan (J di Pertemuan 2, M di Pertemuan 3, D di Pertemuan 4), kunci jawaban `q0` sampai `q9` tetap sama sehingga tab Evaluasi, Detail guru, dan cetak tidak berubah. Akibatnya nilai teori ikut terhitung pada kiriman pertama dan dialog kirim tidak lagi menyebut 10 soal "belum dijawab" yang memang terkunci.
- **Gambar latihan tanpa label dan soal tanpa angka bacaan.** `skgSvg(g, true)` menggambar skala tanpa penanda jawaban (garis berimpit tidak merah, tanpa "bidal 28", "garis ke-45", "0,32 mm"). Soal latihan hanya menyebut ketelitian alat. Pembahasan, Detail guru, dan Kunci cetak tetap memakai gambar berlabel.
- **Koreksi nol alat di hitungan otomatis.** Rata-rata F1 dan F2 kini = rata-rata bacaan dikurangi nol alat (kosong dianggap 0), dibulatkan 2 desimal (`dec:2` pada data tabel; sebelumnya tiga desimal mentah, mis. 22,417). F1 kini punya kolom Standar dan Status seperti F2 dan F3.
- **Standar waktu pemula 25 / 20 / 20 / 15 menit (total 80 menit)** menggantikan 9 / 4 / 3 / 4 (20 menit). Menit langkah K1 4+15+6, K2 6+14, K3 8+12, K4 10+5; target Pertemuan 2, 3, 4 = 25, 20, 35. Teks rubrik Waktu mengikuti otomatis.
- **Bawaan terbit Latihan lalu Ujian** (`tahap:true`, `mode:'ujian'` pada data X-07). Pengaturan yang sudah disimpan guru lewat Kelola LKPD tetap menang atas bawaan ini.
- **Pembahasan mode Latihan v2 muncul di bagian bawah Lembar Kerja** (sebelumnya spanduk menjanjikan tab Evaluasi yang tidak ada pada tahap Latihan). Spanduk ikut diubah.
- **Alarm palsu "Cek nilai" pada LKPD v2 diperbaiki.** Pemeriksaan integritas menghitung ulang nilai dengan rumus LKPD lama; kini memakai `lk2ScoreFor` (rumus v2) sehingga nilai tersimpan dan hitung ulang sama.
- **Catatan guru tidak bocor ke siswa/kunci:** kalimat "Ubah soal bila dial gauge sekolah berbeda" dihapus dari pembahasan D1, dan tabel "Peta ke soal lama" (artefak migrasi) tidak lagi dicetak di Kunci.
- Uji: `uji-lkpd-v2` 272, `uji-pandu-v2` 44, `uji-lkpd-format` 69, berkas baru `uji-skala-tanpa-label` 14. Tidak ada perubahan Appwrite.

## LKPD-X-07: kartu kegiatan tidak digabung
- Aturan: **kartu kegiatan tidak boleh digabung.** Pertemuan 4 (4 JP) tetap memuat Kegiatan 3 dan 4, tetapi Lembar Kerja kini punya **4 kartu**: Kegiatan 1 jangka sorong (9 menit), Kegiatan 2 mikrometer (4), Kegiatan 3 dial gauge (3), Kegiatan 4 perawatan (4).
- Data: `kartu:{judul, per:{3:'...',4:'...'}}` pada pertemuan yang memuat beberapa kegiatan memisahkan kartunya (`lk2Kartu`, `lk2Pisah` di `js/lkpd-v2.js`).
- Waktu aktual: kartu terpisah memakai `mtk3` dan `mtk4` (bukan `mt4` gabungan). Detail guru dan cetak menampilkan waktu per kegiatan.
- Kunci hasil: satuan kunci kini satu kartu kegiatan. Kegiatan 3 memakai nomor 4 dan Kegiatan 4 nomor **404** (`lkkUnits`, `lkkDibuka` di `js/lkpd-kunci.js`). Tombol: Kunci Kegiatan 1, 2, 3, 4. Pengaturan guru "Sampai Kegiatan N" ikut memisahkan Kegiatan 3 dan 4. Latihan skala dial gauge ikut Kegiatan 3; analisis ikut Kegiatan 4.
- LKPD-X-07 masih Draft, jadi belum ada kunci atau waktu aktual siswa yang terpengaruh. Uji: `uji-lkpd-v2` 252, `uji-lkpd-format` 69. Tidak ada perubahan Appwrite.

## LKPD-X-07: proporsi praktik 20 menit disesuaikan
- Total praktik tetap **20 menit**, kini dibagi menurut beban kerja: jangka sorong **9** (9 pembacaan + cek nol), mikrometer **4** (3 titik + cek nol), dial gauge **3**, perawatan dan penyimpanan **4** (3 alat + 5R). Sebelumnya 10 / 4 / 3 / 3, perawatan terlalu singkat untuk tiga alat.
- Menit langkah: K1 2+5+2, K2 1+3, K3 1+2, K4 3+1. Target kartu Lembar Kerja: P2 9, P3 4, P4 7 (Kegiatan 3 3 + Kegiatan 4 4).
- Kartu Kegiatan 3 dan 4 kini menampilkan target menit tiap kegiatan; teks rubrik Waktu dan efisiensi dihitung dari menit langkah (tidak lagi ditulis manual).
- Uji: `uji-lkpd-v2` kini memeriksa proporsi, rubrik, dan target per kegiatan. Tidak ada perubahan Appwrite.

## LKPD-X-07 disesuaikan ke 5 pertemuan × 4 JP
- Modul LKPD-X-07 (master V2) kini **20 JP = 5 pertemuan × 4 JP (180 menit), total 900 menit**, sebelumnya 18 JP = 6 pertemuan × 3 JP (810 menit). Sesuai Peta LKPD (X-07 20 JP) dan aturan Kelas X 4 JP per pertemuan.
- Susunan: P1 (awal: pemantik, materi, gerbang masuk, APD, cek alat), P2 Kegiatan 1 jangka sorong, P3 Kegiatan 2 mikrometer, **P4 Kegiatan 3 dial gauge dan Kegiatan 4 perawatan (latihan 9–10 dan analisis)**, P5 (akhir: penilaian kinerja, refleksi, remedial atau pengayaan). Target praktik tetap 20 menit (10 + 4 + 6). Soal gerbang, latihan, langkah, tabel, dan rubrik tidak berubah.
- Lembar Kerja kini 3 kartu (Kegiatan 1, Kegiatan 2, Kegiatan 3 dan 4). Kartu yang memuat dua kegiatan memberi judul tiap kegiatan, waktu aktual dicatat per kartu (`mt4` untuk Kegiatan 3 dan 4). Kunci hasil: siswa bisa mengunci P2 sampai P4; Kegiatan 3 dan 4 terkunci bersama. Keterangan penilaian guru mengikuti jumlah pertemuan (Pertemuan 2–4).
- **Perhatian:** kunci waktu aktual `mt5` (Kegiatan 4 lama) dan `mt6` tidak dipakai lagi. LKPD-X-07 masih Draft dan belum aktif, jadi belum ada kiriman siswa yang terpengaruh; kiriman lama (bila ada) tetap terbaca tetapi `mt5` tidak tampil.
- Uji disesuaikan: `uji-lkpd-v2` 248, `uji-lkpd-format` 68, `uji-lkpd-master` 39, `uji-pandu-v2` 42. Tidak ada perubahan Appwrite.

## Peta LKPD: JP per pertemuan
- Satu pertemuan: **Kelas X 4 JP, Kelas XI dan XII 6 JP** (`AKD_LKPD_TARGET.*.jpp`). Peta LKPD dan ekspor Excel kini menampilkan rincian pertemuan tiap LKPD (mis. `6 × 6 JP`, atau `3 × 6 JP + 1 × 4 JP (sisa)`).
- Kelas XI semuanya pas. Kelas XII pas kecuali LKPD-XII-10 (22 JP, ada satu pertemuan 4 JP karena total 352 JP bukan kelipatan 6). Kelas X: 12 LKPD disesuaikan ke kelipatan 4 JP dengan total tetap 432 JP (X-01 16, X-03 20, X-04 16, X-05 32, X-06 20, X-07 20, X-11 16, X-12 16, X-13 28, X-17 20, X-18 8, X-24 8). Catatan penyesuaian ada pada tiap baris. Susunan modul LKPD-X-07 di aplikasi (6 pertemuan × 3 JP) tidak diubah.

## Peta LKPD: estimasi minggu dan status dirapikan
- Estimasi minggu tiap LKPD kini dihitung dari JP dibagi JP per minggu (X 12, XI 18, XII 22) dengan dua desimal. Sebelumnya dibulatkan satu desimal sehingga total Kelas XI tampak 35,8 minggu, bukan 36. Kartu kelas di Peta LKPD kini menampilkan total minggu per kelas.
- `AKD_LKPD_TARGET.mg` diganti `jpm` (JP per minggu) agar tidak tertukar dengan `mg` per baris (jumlah minggu).
- Status LKPD-X-07 pada matriks menjadi "Draft (master V2)" (sebelumnya "Belum dibuat"). `tools/matriks-lkpd.py` ikut diperbarui (`STATUS_APLIKASI`, hitung `mg` dari JP, kunci `jpm`) sehingga hasilnya sama bila matriks dibangun ulang dari xlsx.
- `tools/uji-akademik.mjs` kini 146 uji. Tidak ada perubahan Appwrite.

# Riwayat pembaruan dan rincian fitur per versi

## Kartu Lembar Kerja LKPD-X-07 disederhanakan
- Tab Lembar Kerja: kartu **Pertemuan 1** dan **6** tidak tampil (`sembunyi:true` di `js/lkpd-v2-x07.js`). Kartu 2 sampai 5 berjudul **Kegiatan 1 jangka Sorong**, **Kegiatan 2 mikrometer**, **Kegiatan 3 dial gauge**, **Kegiatan 4 perawatan** (`kartu:{judul}`).
- **Total praktik 20 menit untuk semua kegiatan**, dibagi per kegiatan (`praktik` pada pertemuan): jangka sorong 9, mikrometer 4, dial gauge 3, perawatan 4 (disesuaikan kemudian). Tiap langkah punya alokasi menit (`menit` pada `v2.langkah`): K1 2+5+2, K2 1+3, K3 1+2, K4 3+1; jumlahnya sama dengan target kegiatan (diuji). Menit pertemuan (135) tetap sebagai waktu belajar.
- Kartu Lembar Kerja disusun sistematis: judul kegiatan, target menit, catatan "Alokasi praktik N dari total 20 menit", Langkah kerja (dengan menit tiap langkah), tabel data, Pemeriksaan dan bukti, lalu Waktu aktual per kegiatan. Judul ganda "Kegiatan 1 · Jangka sorong" dihapus.
- Pewaktu bawah memakai total praktik (`lkmPraktik`): "Perkiraan/Target 20 menit praktik (semua kegiatan)". Rencana pertemuan, rekap waktu, rubrik Waktu dan efisiensi, serta cetak ikut menyesuaikan.
- **Nol alat dicek 1 kali di awal:** tabel F1 dan F2 punya satu isian "Nol alat (cek 1 kali di awal, mm)" di atas tabel (`nolSekali:true`), bukan kolom per baris. Kunci data tetap `t_F1_0_nol` dan `t_F2_0_nol`, jadi draf lama tetap terbaca. Kelengkapan tabel, detail guru, dan cetak ikut (cetak: satu baris "Nol alat" di atas tabel).
- **Hasil aktual terisi otomatis dari tabel** (`v2.cekAuto`, `lk2Auto`): posisi nol jangka sorong dan mikrometer dari isian nol; hasil ukur jangka sorong dan mikrometer dari rata-rata tabel; keolengan dari F3. Kolom hanya-baca, berubah langsung saat siswa mengetik di tabel, dan disimpan ke `actual<i>` seperti biasa. Dial gauge terpasang dan alat di kotak tetap diisi manual.
- **Kunci hanya pada mode Latihan:** tombol Kunci tidak muncul di Ujian, dan catatan kunci lama tidak memaksa isian saat Ujian (`lkkLatihan`). Yang bisa dikunci hanya kegiatan yang kartunya tampil; tombol, pesan, status guru, dan panel Pengaturan memakai nama "Kegiatan N" (`lkkLabel`).
- Uji baru: `tools/uji-lkpd-v2.mjs` 248 uji, `tools/uji-pandu.mjs` 103 uji.

## Pembeda LKPD Latihan dan Ujian
- **Latihan berpemandu, Ujian mandiri:** Latihan menampilkan kartu panduan dan membuka angka acuan lewat tombol Bantuan; Ujian menyembunyikan angka acuan, menampilkan kartu aturan "Ujian mandiri", dan (opsional) mewajibkan foto bukti pada semua komponen.
- **Latihan lalu Ujian di satu LKPD (tanpa salinan):** centang "Latihan dulu, baru Ujian" di Pengaturan. Siswa memulai dari Latihan (Tahap 1, tidak masuk rekap); setelah nilai mencapai KKM 1 kali atau 2 kali berturut-turut, LKPD yang sama otomatis menjadi Ujian (Tahap 2). Ujian gagal membawa siswa kembali ke Latihan (remedial) selama masih ada jatah. Tidak ada LKPD kedua, jadi siswa tidak bingung dengan judul ganda.
- **Gerbang masuk hanya di Latihan, Evaluasi hanya di Ujian (LKPD v2):** soal yang sama di dua tahap hanya menguji hafalan. Latihan memuat Gerbang masuk dan Lembar Kerja (tanpa tab Evaluasi, nilai dari praktik saja); Ujian memuat Lembar Kerja tanpa Gerbang masuk lalu Evaluasi. Pratinjau guru menampilkan versi Ujian.
- **Waktu LKPD v2:** alokasi total (810 menit = 18 JP) tidak lagi dipakai sebagai waktu mengerjakan. Kartu menampilkan "18 JP · 6 pertemuan"; pewaktu bertarget menit per pertemuan (135), tidak merah di Latihan; peringatan "terlalu cepat" di pemeriksaan integritas memakai waktu satu pertemuan.
- **Panel Pengaturan disusun ulang:** Ringkasan untuk siswa di atas, lalu bagian bernomor yang mengikuti mode (Aturan Latihan atau Aturan Ujian dan Latihan sebelum Ujian). Mencentang Latihan dulu langsung menampilkan kolom Syarat nilai.
- **Paket cepat:** tombol Paket Latihan dan Paket Ujian di Pengaturan LKPD (tanpa sorotan mode; paket baru tersimpan setelah Simpan pengaturan).
- Berkas baru `js/lkpd-pandu.js`, `docs-LATIHAN-UJIAN.md`, `tools/uji-pandu.mjs` (101 uji), `tools/uji-pandu-v2.mjs` (42 uji, render v2 asli). Tidak ada perubahan Appwrite. Rincian: `docs-LATIHAN-UJIAN.md`.

## Observasi LKPD Praktik: peringatan kelas tidak sesuai
- Bila Kelas daftar siswa berbeda dari kelas LKPD yang dipilih (mis. LKPD-X-07 dengan Kelas XII), muncul catatan merah di bawah pilihan LKPD. Catatan tidak menghalangi penyimpanan dan ikut berubah saat kelas atau LKPD diganti. `tools/uji-lkpd-v2.mjs` kini 224 uji.

## Formulir Observasi LKPD Praktik dirapikan
- Pemilih **LKPD yang diobservasi** dipindah ke bagian atas formulir dan menggantikan kolom "Unit / pekerjaan praktik" (judul LKPD tampil utuh di bawah pilihan, tersimpan otomatis sebagai unit). Blok "Formulir v2" di bawah daftar siswa dihapus.
- **Kompetensi / jobsheet** terisi otomatis dengan kode LKPD (tetap bisa diubah), dan **Kelas** mengikuti kelas LKPD. Mengganti LKPD memperbarui isian itu.
- `tools/uji-lkpd-v2.mjs` kini 223 uji.

## Observasi LKPD Praktik v1 dihapus
- Formulir **Observasi LKPD Praktik** baru kini selalu memakai formulir v2 (rubrik dari LKPD v2, skala 1-4 + nilai). Tombol "Pakai formulir lama" dan "Pakai formulir v2" dihapus; bila belum ada LKPD v2 tampil pesan "Belum ada LKPD v2 untuk diobservasi".
- Catatan v1 yang sudah tersimpan **tidak dihapus** (tetap di Rekap nilai, Excel, PDF, dan bisa dibuka/diubah dengan formulir lama) supaya nilai siswa tidak hilang. Observasi guru (supervisi) tidak berubah.
- `tools/uji-lkpd-v2.mjs` kini 221 uji.

## LKPD v1 dihapus
- 21 modul LKPD v1 bawaan (X-1 sampai X-6, XI-1 sampai XI-8, XII-1 sampai XII-7) dihapus dari aplikasi: data di `js/lkpd.js` (X-1) dan `js/lkpd-modul.js` (20 modul lain) dikosongkan. Yang tersisa hanya **LKPD v2** (LKPD-X-07, `js/lkpd-v2-x07.js`) beserta mesin LKPD, Master LKPD V2, dan editornya.
- Modul LKPD default kini LKPD-X-07. Padanan Peta LKPD hanya LKPD-X-07; modul aplikasi tanpa padanan kini kosong.
- **Tidak dihapus:** data di Appwrite (salinan modul tersimpan, pengumpulan dan riwayat siswa, hasil penilaian). Modul v1 yang pernah disimpan/diedit guru di Appwrite masih akan tampil; hapus lewat menu Hapus LKPD bila perlu. Bank soal bawaan (54 soal XI-3) tidak berubah.
- Tes disesuaikan: `uji-akademik` 144, `uji-lkpd-master` 39, `uji-lkpd-semua` 29 (semua lulus).

## Bank soal bawaan: hanya soal bentuk TKA dan level HOTS
- Dihapus dari bank soal **bawaan**: 1.266 soal (soal-tka.js 60 soal, 20 unit LKPD selain XI-3 masing-masing 60 soal, dan 6 soal level Pengetahuan dan Pemahaman di XI-3). Alasan: bukan bentuk TKA (PG 4 opsi, kompleks/kategori di luar aturan) atau tidak berlevel HOTS (Aplikasi atau Penalaran).
- Tersisa **54 soal** di `js/soal-lkpd/xi3.js` (LKPD XI-3 Pembongkaran dan Pemasangan Komponen CVT): 34 PG, 10 PG kompleks, 10 PG kategori, semuanya level Aplikasi atau Penalaran.
- `js/cp-peta.js` dipangkas ke 54 soal; `functions/cbt/src/bawaan.json` dan salinannya di `functions/akun-admin/src` dibangun ulang (54 soal). **Deploy ulang fungsi akun-admin** agar penilaian server memakai daftar baru.
- Soal buatan guru di Appwrite tidak disentuh. LKPD bawaan yang soal banknya habis memakai soal evaluasi bawaan modul sendiri; salinan LKPD tersimpan yang sudah bertanda quizV tidak berubah.
- Berkas lama `js/soal-lkpd/*.js` selain `xi3.js` ikut dihapus dari paket; hapus juga di folder proyek (lihat catatan pemasangan).

## Peta LKPD: dikelompokkan per Elemen CP
- Di tab **Peta LKPD**, di dalam tiap kelas (X, XI, XII), LKPD kini dikelompokkan lagi per **Elemen CP** (mis. Kelas X: Wawasan Dunia Otomotif, Kecakapan Kerja Dasar K3 dan Budaya Kerja, dst., 7 elemen; XI 7 elemen; XII 7 elemen). Tiap kelompok elemen menampilkan jumlah LKPD dan total JP, dan bisa dilipat.
- Chip baru **Kelompokkan: Elemen CP / Kelas saja** (bawaan Elemen CP). Filter kelas, Ada di aplikasi, dan pencarian tetap berfungsi; jumlah LKPD (62) dan JP per kelas tidak berubah. Tidak ada perubahan Appwrite.
- `tools/uji-akademik.mjs` kini 144 uji.

## Peta LKPD: daftar dan JP diselaraskan dengan Matriks LKPD revisi2
- Tab baru **Peta LKPD** di Administrasi Akademik (di antara Mata pelajaran dan Tata kelola; juga di laci menu). Hanya lihat, memuat **62 LKPD** dari `Matriks_LKPD_TSM_Kelas_X-XII_SKKNI_revisi2.xlsx`: kode, judul, jenis, semester, elemen CP, TP, JP, estimasi minggu, unit SKKNI, status matriks, serta catatan dan usulan revisi.
- Kartu JP per kelas dihitung dari data dan dibandingkan dengan target: X 24 LKPD = 432 JP, XI 25 LKPD = 648 JP, XII 13 LKPD = 352 JP (semuanya sesuai target). Filter Semua, Kelas X, XI, XII, dan Ada di aplikasi; pencarian judul, kode, TP, elemen CP; kelompok per kelas bisa dilipat.
- **Padanan modul**: 15 kode matriks diberi padanan awal ke modul aplikasi (tepat, sebagian, atau kelas beda), misalnya LKPD-X-07 dengan LKPD-X-07 (v2) dan X-2, LKPD-XI-04 dengan XI-5. Tujuh modul aplikasi tanpa padanan (XI-1, XI-4, XII-1, XII-3, XII-4, XII-5, XII-7) didaftar di bawah daftar. ID modul **tidak diubah** karena pengumpulan siswa tersimpan menurut ID.
- Durasi modul di aplikasi (menit) tidak diubah: itu waktu satu sesi praktik atau ujian, bukan alokasi JP matriks.
- Catatan PKL dari matriks ikut ditampilkan: PKL kelas XII 736 JP, paling sedikit 16 minggu (Permendikdasmen 13/2025 Tabel 13); angka 792 dan 828 JP berasal dari struktur lama. Belum ada menu PKL.
- Lembar baru **Peta LKPD** pada ekspor Excel Administrasi Akademik. Data dibangun oleh `tools/matriks-lkpd.py <berkas.xlsx>` ke blok `AKD_LKPD_*` di `js/akademik-data.js`; padanan modul (`AKD_LKPD_PADAN`) diubah manual. `tools/uji-akademik.mjs` kini 141 uji. Tidak ada perubahan Appwrite.

## Daftar mapel kembali lengkap per kelompok kurikulum SMK
- Halaman **Mata pelajaran** menampilkan lagi **semua mapel SMK** menurut struktur kurikulum: **Kelompok Umum** (PABP, Pendidikan Pancasila, Bahasa Indonesia, PJOK, Sejarah, Seni dan Budaya, Muatan Lokal), **Kelompok Kejuruan** (Matematika, Bahasa Inggris, Informatika, Projek IPAS, Dasar-Dasar Teknik Otomotif, Teknik Sepeda Motor, Kreativitas/Inovasi/Kewirausahaan, PKL), dan **Mata Pelajaran Pilihan**. Tiap kelompok bisa disembunyikan.
- Kelompok **Dasar-Dasar Program Keahlian Teknik Otomotif** dan **Kompetensi Keahlian Teknik Sepeda Motor** dihapus. Dasar-Dasar Teknik Otomotif dan Teknik Sepeda Motor beserta elemen CP-nya kini berada di Kelompok Kejuruan (`akGrupTampil` di `js/akademik.js`).
- Chip filter: Semua (bawaan), Umum, Kejuruan, Pilihan, Produktif. Chip Non-produktif dan tombol "Arsipkan n mapel non-produktif" dihapus supaya mapel umum tidak ikut terarsip.
- Angka Mata pelajaran dan Elemen CP menghitung semua mapel aktif; Tanpa pengampu tetap hanya menghitung mapel produktif. Bawaan kurikulum memuat 31 baris (14 mapel, DDTO dan TSM beserta elemen). Sinkronkan kurikulum melengkapi yang belum ada.
- Pilihan mapel di tugas mengajar dan form bank soal tetap hanya mapel produktif. Pengelompokan di Bank soal tidak berubah. `tools/uji-akademik.mjs` kini 123 uji. Tidak ada perubahan Appwrite.

## UKK bukan mata pelajaran (daftar mapel Administrasi Akademik)
- **UKK Teknik Sepeda Motor (TB-02)** tidak lagi tampil sebagai mata pelajaran. UKK (Uji Kompetensi Keahlian) adalah asesmen kompetensi, bukan baris mapel di struktur kurikulum SMK maupun e-Rapor SMK. Judul yang diawali "UKK" atau "Uji Kompetensi Keahlian" kini disaring seperti judul "LKPD": disembunyikan dari daftar, pilihan mapel, statistik, dan tidak diimpor lagi oleh Sinkronkan kurikulum (`akBukanMapel` di `js/akademik.js`).
- Data lama di Appwrite tidak dihapus; barisnya hanya disembunyikan. Soal bank soal yang mapelnya "UKK ..." tidak berubah. `tools/uji-akademik.mjs` kini 120 uji. Tidak ada perubahan Appwrite.

## Editor soal gerbang masuk LKPD v2
- Tab Soal Editor LKPD v2 kini bisa mengedit penuh **soal gerbang masuk**: teks, pilihan, kunci, bentuk (PG, kompleks, kategori), level Aplikasi/Penalaran, pembahasan wajib, foto, tambah, hapus, urut, dan duplikat (3 sampai 10 soal). Pemeriksaan dan penyimpanan otomatis ke `v2.gate.qs`.
- Turunan Master LKPD V2 dengan topik berbeda kini bisa memakai soal gerbang sendiri. Uji baru `tools/uji-lkpd-gerbang.mjs` (47 uji). Tidak ada perubahan Appwrite.

## Katalog SKKNI selaras dengan matriks LKPD (v105)
- Lima judul unit SKKNI di Administrasi Akademik memakai judul resmi Kepmenaker 147/2019 seperti pada `Matriks_LKPD_TSM_Kelas_X-XII_SKKNI.xlsx`: 035, 036 (ABS), 037, 038 (CBS/UBS), dan 042 (ACG/SMG) tidak lagi disingkat. Selebihnya (50 unit) sudah sama. Pemetaan unit ke elemen CP tidak diubah.
- `tools/uji-akademik.mjs` kini 116 uji. Berkas: `js/akademik-data.js`. Tidak ada perubahan Appwrite.

## Administrasi Akademik: tampilan dan submenu (v104)
- Laci menu: **Administrasi Akademik** menjadi kelompok dengan submenu Guru, Kelas, Daftar siswa, Mata pelajaran, Tata kelola (`js/menu-dasbor.js` dan `js/akademik.js`); baris tunggal lama di kelompok Beranda dihapus.
- Halaman: kepala dengan judul kecil, pil tahun ajaran dan sekolah, bilah tab berikon yang bisa digeser, jarak kartu seragam, avatar inisial pada kartu guru, garis pemisah pada tahun ajaran dan pemeriksaan, tombol hitungan tanpa garis tebal, satu kartu Acuan dan referensi. Gaya baru di `css/app.css` (awalan `.akd`), mengikuti mode terang dan gelap.
- `tools/uji-akademik.mjs` kini 111 uji (tab, bungkus halaman, submenu laci, grup menu). Tidak ada perubahan Appwrite.

## Administrasi Akademik: perapian dan validasi (v103)
- Validasi simpan: rombel ganda (sekolah + tahun ajaran), kode mapel kembar, JP mapel 1-40, mapel berelemen tidak bisa jadi elemen, tahun ajaran harus berurutan (2026/2027), tanggal selesai tidak lebih awal dari mulai.
- Atur anggota rombel membuang id ganda dan siswa rombel lain saat disimpan.
- Pencocokan kata kunci LKPD terkait: kata pendek (ev, ban, rem, ems, ecu, cvt, k3) harus kata utuh; kata panjang cocok di awal kata.
- Keluar akun mereset status tampilan (pilihan anggota, filter, pencarian, kelompok terbuka); daftar guru aman untuk kode sekolah huruf kecil; input JP tugas mengajar min 1; atribut style ganda pada kartu mapel dirapikan.
- Excel Tugas mengajar: kolom Tahun ajaran dan Status. `tools/uji-akademik.mjs` kini 87 uji. Perubahan: `js/akademik.js`, `tools/uji-akademik.mjs`, `docs-AKADEMIK.md`. Tidak ada perubahan Appwrite.

## Administrasi Akademik fokus mapel produktif (v102)
- Bawaan kurikulum dipersempit ke Dasar-Dasar Teknik Otomotif, Teknik Sepeda Motor (dengan elemen CP), dan PKL. Penanda `produktif` pada mapel, kotak **Mapel produktif** di formulir.
- Pemeriksaan pengampu, pilihan tugas mengajar, mapel pada bank soal, dan statistik hanya menghitung mapel produktif; tugas pada mapel non-produktif ditolak.
- Daftar mapel: chip Produktif dan Non-produktif, kelompok produktif lebih dulu. Tombol **Arsipkan mapel non-produktif** di Tata kelola (data tidak dihapus). Kolom Produktif di Excel.
- Perbaikan kecil: teks formulir profil guru tidak lagi menyebut guru dapat membaca profil SDM. `tools/uji-akademik.mjs` kini 61 uji. Tidak ada perubahan Appwrite.

## Administrasi Akademik: perbaikan tata kelola (v101)
- **Profil SDM hanya admin**: izin baca `label:guru` dicabut dari `akademik_sdm` (NIP/NUPTK sebelumnya terbaca semua guru). Aplikasi tidak lagi memuat atau menampilkan profil SDM untuk guru. **Koleksi yang sudah terpasang perlu dijalankan ulang**: `node tools/setup-appwrite.mjs --only=akademik_sdm` (memperbarui izin).
- **JP guru** dihitung dari tugas yang berlaku saja (rombel aktif, tahun ajaran sama dengan yang aktif). Pemeriksaan "guru belum bertugas" dan "mapel belum punya pengampu" memakai aturan yang sama; tugas yang tidak berlaku diberi keterangan di daftar.
- **Jumlah siswa rombel** seragam di kartu Kelas, daftar siswa, dan Excel (hanya akun siswa aktif).
- **Tiga pemeriksaan baru** di Tata kelola: siswa di lebih dari satu rombel, tingkat rombel berbeda dengan kelas akun, anggota nonaktif atau akunnya hilang.
- **Tugas mengajar divalidasi**: tingkat mapel harus cocok dengan rombel, JP bilangan bulat 1 sampai 40, mapel+rombel yang sudah diampu guru lain meminta konfirmasi.
- **Kode `TB-xx`** tidak lagi kembar; **tahun ajaran bawaan** berid tetap; tahun ajaran+semester ganda ditolak; hanya satu tahun ajaran aktif; urutan semester Genap di atas Ganjil.
- Berkas baru `tools/uji-akademik.mjs` (40 uji). Perubahan: `js/akademik.js`, `appwrite.json` (izin `akademik_sdm`), `docs-AKADEMIK.md`.

## LKPD-X-07 menjadi Master LKPD V2
- Halaman Kelola LKPD memuat kartu **Master LKPD V2** pada LKPD-X-07 dan **Kelengkapan sesuai master V2** pada LKPD v2 lain (14 butir daftar periksa).
- Tombol **Buat LKPD v2 dari master** membuka Editor LKPD dengan salinan master (draf, tidak aktif, mencatat `v2.dari`). Master tidak berubah.
- Berkas baru `js/lkpd-master.js` dan `tools/uji-lkpd-master.mjs` (39 uji). Rincian di `docs-LKPD-V2.md`. Tidak ada perubahan Appwrite.

## Cetak LKPD dan Cetak kunci berlaku untuk semua LKPD
- Format cetak PDF dan tombol **Cetak kunci** kini untuk semua LKPD: v2 (gerbang masuk) dan 21 LKPD v1 serta buatan guru (kunci dan pembahasan soal evaluasi). Hanya Guru dan Admin yang melihat tombol; LKPD tanpa soal tidak menampilkannya.
- Rincian di `docs-LKPD-V2.md`; uji baru `tools/uji-lkpd-semua.mjs` (848 pemeriksaan atas 22 LKPD). Tidak ada perubahan Appwrite.

## Kunci pertemuan: urutan bebas, kecuali pertemuan awal dan akhir
- Siswa boleh mengunci pertemuan mana saja yang sudah dibuka guru. Pertemuan awal (P1) dan akhir (terakhir) tidak bisa dikunci siswa. Pada LKPD-X-07: P2-P5.
- Kunci Pertemuan N hanya mengunci isian pertemuan N (dipetakan lewat kegiatan, latihan, dan analisis); gerbang, K3, dan refleksi tetap bebas. Bilah bawah menampilkan satu tombol per pertemuan yang belum terkunci.
- Catatan kunci tidak lagi berantai, jadi guru dapat membuka kunci pertemuan mana pun (tombol "Buka kunci PN" per pertemuan). Batas buka guru (`pertBuka`) tetap berlaku.
- Rincian di `docs-LKPD-V2.md` bagian 4C; uji kunci ditulis ulang (221 uji LKPD v2). Tidak ada perubahan Appwrite.

## Evaluasi LKPD v2 terbuka setelah praktik terverifikasi guru (KKM 75), nilai analisis oleh guru
- **Nilai analisis oleh guru:** Detail guru punya kolom "Nilai analisis (0-100)"; tidak lagi dihitung dari panjang jawaban. Wajib diisi saat "Simpan verifikasi guru" (tombol dipindah ke kartu "Penilaian praktik oleh guru" di akhir Detail).
- **Praktik terverifikasi:** langkah bersaksi hanya dihitung bila disaksikan guru, butir APD hanya bila berparaf, analisis dari nilai guru. Disimpan di `payload.v2.verif` (`n`, `praktik`, `kkm`, `lulus`).
- **Evaluasi terkunci** (hanya kartu soal latihan) sampai nilai praktik terverifikasi >= KKM (minimal 75). Pesan jelas untuk belum kirim, menunggu verifikasi, atau di bawah KKM. Guru dan pratinjau tidak terkunci.
- **Kirim Evaluasi:** kiriman terpisah, nilai = praktik terverifikasi x 85% + teori x 15%, dicatat di `lkpd` dan `hasil`; Detail guru menampilkan jawaban dan kunci.
- Rincian di `docs-LKPD-V2.md` bagian 4B. 36 uji baru di `tools/uji-lkpd-v2.mjs`. Tidak ada perubahan Appwrite.

## Foto pada Materi dan Soal evaluasi, Edit LKPD aman untuk v2
- **Materi**: Edit LKPD, tab Tujuan & teori, tiap topik teori punya tombol **Tambah foto / Ganti / Hapus foto**. Foto tampil di Materi siswa (Memahami / Teori ringkas) dan di cetak. Penanda disimpan sebagai elemen ketiga baris teori `[topik, uraian, 'drive:<id>']`.
- **Soal evaluasi**: tombol foto soal sudah ada untuk PG, PG kompleks, dan PG kategori. Soal **isian angka** (10 soal latihan membaca skala LKPD-X-07) kini punya editor sendiri (pertanyaan, foto, kunci, toleransi, satuan, pembahasan) dan fotonya tampil di soal siswa, detail guru, dan cetak. Tombol **+ Isian angka** tersedia di LKPD v2.
- **Edit LKPD v2 diperbaiki**: sebelumnya "Edit isi" pada LKPD-X-07 menampilkan 21 masalah palsu (alokasi 810 menit, menit langkah 0, soal isian), soal isian berlabel `undefined` dan dipaksa menjadi PG, serta objek `v2` hilang bila disimpan. Kini objek `v2` dan kolom lain dipertahankan, pemeriksaan menit tidak berlaku untuk v2, dan jumlah/urutan langkah, butir K3, dan komponen pemeriksaan dikunci (teks tetap bisa diubah) karena terhubung ke indeks v2.
- Foto diunggah ke Google Drive saat modul disinkronkan, lewat fungsi `foto-drive` yang sama dengan gambar soal; tidak ada perubahan Appwrite. Foto tidak ikut diekspor ke Excel.
- Berkas baru: `js/lkpd-v2-editor.js` (dimuat setelah `lkpd-samakan.js`), `tools/uji-lkpd-foto.mjs` (59 uji). Perubahan kecil pada `lkpd.js`, `lkpd-v2.js`, `lkpd-format.js` (memanggil `lkvMateriImg`).
- **Soal gerbang masuk v2**: tab Soal memuat bagian "Soal gerbang masuk" dengan tombol foto untuk soal dan pilihan (teks dan kunci tidak diubah). Foto disimpan di `v2.gate.qs[].qi/oi` dan diunggah ke Drive seperti foto lain.

## Latihan membaca skala: 10 soal, kode disembunyikan, bergambar
Latihan membaca skala LKPD X-07 menjadi 10 soal (tambahan J4 jangka sorong 45,55 mm dan M4 mikrometer 9,41 mm). Kode soal (J1, M1, D1, dst.) tidak lagi tampil; `id` tetap ada di data. Tiap soal bergambar SVG yang digambar otomatis dari angka soal (parameter `q.g`): skala jangka sorong, mikrometer, dial gauge, dan keolengan. Berkas baru: `js/lkpd-skala-gambar.js`; gaya `.skg` di `css/app.css`. Tidak ada perubahan Appwrite.

**Cetak dirapikan**: cetak LKPD kini benar-benar memakai format acuan (`js/lkpd-format.js` sebelumnya tidak dimuat `index.html`, sehingga cetak jatuh ke format lama). Lembar latihan memuat 10 soal bernomor tanpa kode, tiap soal dengan gambar skala; J4 dan M4 masuk daftar pertemuan 2 dan 3; judul pertemuan dan bukti indikator memakai "latihan soal 1–4, 5–8, 9–10". Tombol **Cetak kunci** (Guru dan Admin) dipasang kembali di `js/lkpd-v2.js`; kunci cetak bernomor 1–10. Uji diperbarui: `uji-lkpd-format.mjs` (10 soal, gambar, tanpa kode), `uji-lkpd-v2.mjs` (formulir observasi skala 1–4 + nilai untuk 6 aspek dan 8 indikator, Excel 21 kolom, draf ubah catatan).

## Gerbang masuk LKPD v2 dinilai otomatis dengan acuan TKA
Nilai gerbang = jumlah poin soal TKA / jumlah soal x 100 (PG 1/0; PG kompleks dan PG kategori nilai sebagian). Lembar Kerja terbuka bila nilai gerbang >= KKM (minimal 75). Kriteria 4 dari 5 soal benar dihapus. Gerbang adalah syarat kelayakan masuk praktik, bukan komponen nilai akhir. Detail guru menampilkan poin per soal; payload menambah `v2.gerbang`. Rincian dan skenario di `docs-LKPD-V2.md` bagian 4A. Tidak ada perubahan Appwrite.

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

## CP PKL di Peta LKPD
Prodi `PKL` dengan empat elemen CP (SFT, HSP, HSG, WIR) ditambahkan ke matriks (`tools/matriks-lkpd.py`, `AKD_LKPD_PRODI`, `AKD_LKPD_CP`), data `AKD_PKL_ELEMEN`/`AKD_PKL_TP` di `js/akademik-data.js`, mapel turunan `m_pkl_1..4`, pilihan Elemen CP kelas XII di Editor LKPD, kartu **CP PKL** di Peta LKPD, dan lembar Excel **CP PKL**. Total 54 LKPD dan 1432 JP tidak berubah. Uji: `tools/uji-akademik.mjs`, `tools/uji-lkpd-kode.mjs`. Panduan di `docs-LKPD-KODE.md`.

## Menu PKL: absensi selfie, tempat PKL, penempatan, jurnal, kunjungan, nilai, kelengkapan
- `js/pkl.js` (baru), menu **PKL** (kelompok Praktik Kerja Lapangan). Siswa: absen Masuk/Pulang/Izin/Sakit dengan selfie dan lokasi GPS, jurnal kegiatan, tempat dan pembimbing. Guru/Admin: Tempat PKL (perjanjian kerja sama, instruktur, kuota, koordinat), Penempatan, Absensi, Jurnal, Kunjungan monitoring, Nilai 4 TP, Kelengkapan 11 butir, Rekap, dan Excel. Kepala Sekolah hanya melihat. Panduan: `docs-PKL.md`.
- `appwrite.json`: koleksi baru `pkl`, `pkl_catat`, `pkl_nilai` (jalankan `node tools/setup-appwrite.mjs --only=pkl,pkl_catat,pkl_nilai`). Penempatan di `pkl` tanpa nama siswa; temuan audit `BACA-USERS:pkl` diterima di `tools/audit-izin.baseline.json`.
- `tools/uji-pkl.mjs` (68 butir). `tools/uji-lkpd-struktur.mjs`: dua butir lama menguji penanda `lks-grp` yang sudah diganti bilah berkelompok (`lke-gt`); ujinya disesuaikan, aplikasi tidak berubah.

## PKL: selfie ke Google Drive dan cetak PDF nilai dan jurnal
- **Selfie ke Drive**: `js/pkl.js` mengunggah selfie lewat fungsi `foto-drive` (nama `PKL_<Kelas>_<Nama>_<jenis>_<tanggal-jam>`), payload absen hanya `drive:<fileId>`; ditampilkan lewat aksi baru `getpkl` (izin dokumen `pkl_catat`), maksimal 3 pengambilan sekaligus. Fungsi belum dipasang: selfie tetap di payload. `functions/foto-drive` v1.2.0 dan arsip `functions/foto-drive.tar.gz`.
- **PDF**: Daftar Nilai PKL per siswa atau semua (Lampiran 5) dan Jurnal PKL (Lampiran 2); siswa dapat mencetak jurnalnya sendiri.
- `tools/uji-pkl.mjs` kini 99 butir (Drive, PDF, dan fungsi `getpkl`).


## PKL: semua pilihan (select) memakai lembar pilihan secara penuh dan sistematis
- `js/pkl.js`: semua `<select>` PKL (isian formulir dan saringan tab) kini dibuat oleh satu pembangun, `pkSelectHtml`, dari satu bentuk data (opsi `{v,l,ket,off}`, kelompok `{g,o}`). Lembar pilihan `js/bank-pilihan.js` terpakai penuh: judul (`data-judul`), keterangan kecil (`data-ket`), kelompok (`optgroup`), pilihan kosong terpisah, pilihan nonaktif, dan kotak Cari.
- **Formulir**: Siswa dikelompokkan (Belum ditempatkan / Sudah punya penempatan aktif, yang kedua nonaktif); Tempat dikelompokkan menurut kuota (yang penuh nonaktif) dengan keterangan kota, isi/kuota, dan status perjanjian; di Kunjungan dikelompokkan menurut kebutuhan monitoring (lebih dari 30 hari). Nilai: Belum dinilai / Sudah dinilai (dengan nilai akhir) / Belum ditempatkan. Guru: jumlah siswa bimbingan aktif. Status dan Cara punya keterangan.
- Keterangan pilihan terpilih tampil di bawah kolom. Nilai yang tersimpan tetapi sudah tidak ada di daftar (akun nonaktif, tempat dihapus) tetap tampil, tidak dikosongkan diam-diam. Pilihan nonaktif yang sedang terpilih tetap bisa dipertahankan saat ubah data.
- Pemicu terpusat (`PK_HOOK`): tempat di Penempatan mengisi instruktur; tempat di Kunjungan mengisi guru pembimbing bila masih kosong.
- **Saringan per tab** (tabel `PK_SARING`): Tempat (kota, bidang, perjanjian, monitoring), Penempatan (tempat, kelas, guru, status), Absensi (tempat, kelas, siswa, jenis), Jurnal (tempat, kelas, siswa, catatan), Kunjungan (tempat, guru, cara), Nilai, Kelengkapan, Rekap, dan daftar tempat di tampilan siswa (kota, bidang). Jumlah data tampil di keterangan, saringan yang nilainya sudah hilang otomatis dikosongkan, ada tombol Setel ulang. Tombol PDF nilai di tab Nilai mencetak yang sedang tampil.
- Tidak ada perubahan di `js/bank-pilihan.js`, data, atau Appwrite. `tools/uji-pkl.mjs` kini 130 butir.

## Judul PKL, tombol Simpan di atas, basmalah di bar atas
- **Judul**: semua layar PKL diawali kartu "Praktik Kerja Lapangan (PKL)" beserta nama sekolah aktif (`pkJudulHtml`). Kartu siswa yang lama berjudul "Penempatan saya".
- **Simpan di atas**: tombol Simpan (Kirim absen pada form absen) dan Batal kini tepat di bawah judul formulir, dengan pesan galat langsung di bawahnya. Tombol di bagian bawah dihapus.
- **Basmalah**: bar atas aplikasi (semua halaman dan semua peran) memuat lafaz basmalah di atas sapaan "Halo" (`.bsm` di `css/app.css`, `js/ui.js`).
- `tools/uji-pkl.mjs` kini 134 butir.
