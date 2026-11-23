# Riwayat pembaruan dan rincian fitur per versi

## Kartu Lembar Kerja LKPD-X-07 disederhanakan
- Di tab Lembar Kerja, kartu **Pertemuan 1** dan **Pertemuan 6** tidak ditampilkan (`sembunyi:true` pada `js/lkpd-v2-x07.js`; mesin di `js/lkpd-v2.js` melewati pertemuan bertanda itu). Data pertemuan, Rencana pertemuan di Materi, JP, dan cetak tidak berubah.
- Kartu **Pertemuan 2** kini berjudul **Kegiatan 1 jangka Sorong** dengan **Target 10 menit** (`kartu:{judul,menit}`). Kartu Pertemuan 3, 4, 5 disesuaikan: **Kegiatan 2 mikrometer**, **Kegiatan 3 dial gauge**, **Kegiatan 4 perawatan**, masing-masing Target 10 menit.

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

