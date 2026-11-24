# LKPD v2 dan Observasi LKPD Praktik v2

Tambahan aditif: LKPD dan observasi lama tidak diubah. Pilot: LKPD-X-07 (Penggunaan dan Perawatan Alat Ukur). Modul v2 adalah modul LKPD yang punya objek `v2`; mesin v2 hanya aktif untuk modul itu.

## 1. Berkas
- `js/lkpd-v2-x07.js`: data modul LKPD-X-07 (status awal Draft; angka standar dikosongkan untuk diisi guru dari manual servis). Butir K3, kelompok K3 (`v2.k3grup`), dan keterangan aspek (`ket`) ada di sini dan dapat disesuaikan dengan kondisi bengkel.
- `js/lkpd-v2.js`: mesin v2.
- `js/lkpd-v2-soal.js`: tipe soal isian angka (`t:'isian'`, `kunci`, `tol`).
- `js/observasi-v2.js`: Observasi LKPD Praktik v2 (rubrik diambil dari `m.v2.obs` tiap LKPD).
- `tools/uji-lkpd-v2.mjs`: uji tanpa peramban (`node tools/uji-lkpd-v2.mjs`, 272 uji).

## 2. Alur siswa
Urutan tab: Materi, Lembar Kerja, Evaluasi.

### Materi
- **Rencana pertemuan:** daftar lipat. Tiap pertemuan tertutup bawaan, ringkasannya "N JP · M menit", isinya kegiatan dan langkah (termasuk penanda saksi guru). Status buka/tutup diingat selama sesi; saat mencetak semua terbuka. Waktu aktual per pertemuan diisi siswa di Lembar Kerja (isian menit).
- **Memahami (teori):** termasuk topik teori K3, **Koreksi nol alat**, dan **Perawatan dan penyimpanan**, sehingga soal gerbang 3 dan 5 punya dasar di Materi.
- **Gerbang masuk:** dinilai otomatis dengan acuan TKA dan menjadi syarat kelayakan masuk praktik. Lembar Kerja terbuka bila nilai gerbang minimal KKM (tidak pernah di bawah 75). Rumus dan skenario di bagian 4A.
- **K3:** judul "Keselamatan dan Kesehatan Kerja (K3)"; 10 butir dalam 4 kelompok (APD; persiapan diri dan area kerja; larangan saat praktik; kebersihan dan keadaan darurat). Paraf guru hanya pada 4 butir APD.

### Lembar Kerja
- **Langkah:** langkah bertanda saksi guru diverifikasi guru di Detail pengumpulan (`payload.v2.verif`), begitu juga paraf APD.
- **Tabel data:** rata-rata dan selisih dihitung otomatis; kelengkapan tabel ikut nilai. Tabel F1 dan F2 memuat catatan koreksi nol (`cat` pada data tabel).
- **Soal isian angka:** dinilai otomatis (koma atau titik, toleransi `tol`).
- **Latihan membaca skala:** dikerjakan di Lembar Kerja pada pertemuan yang memuatnya (`pertemuan[].latihan`), gambar skala tanpa label jawaban dan soal tanpa angka bacaan; kunci data `q0` sampai `q9` tetap dan soal yang sama dipakai tab Evaluasi. Pembahasan di mode Latihan ada di bagian bawah Lembar Kerja.
- **Koreksi nol alat:** rata-rata tabel = rata-rata bacaan dikurangi nol alat (`nol`, kosong dianggap 0), dibulatkan sesuai `dec` pada data tabel (2 desimal).
- **Syarat kirim:** semua butir K3 dicentang, dan Pemeriksaan dan bukti punya minimal satu komponen dengan hasil aktual dan Status. Pesan menyebut kolom yang kurang.
- **Foto wajib:** memakai `m.fotoWajib` yang sudah ada.

## 3. Penilaian
- **Nilai otomatis** hanya perkiraan awal. Nilai akhir adalah nilai guru di Detail pengumpulan, yang menggantikan nilai otomatis.
- **Nilai kinerja resmi** berasal dari Observasi v2 dan nilai koreksi guru.
- **Penilaian kinerja oleh guru:** tiap aspek lipat berisi bobot, poin yang dinilai (`ket`), arti skor 4 sampai 1, dan penanda aspek penghenti. Ditambah **Syarat kompeten** (8 indikator + bukti), **Yang diamati dan kesalahan umum**, serta contoh hitung nilai.
- **Detail guru:** jawaban siswa, kunci, pembahasan, dan level soal tampil; kotak Jawaban benar terisi otomatis dari penilaian sebelum guru menyimpan verifikasi, dan dapat diubah.

## 4. Soal gerbang masuk (bentuk PG, HOTS, bentuk soal TKA)
- Gerbang LKPD-X-07 terdiri dari 5 soal: 3 PG (5 pilihan, 1 kunci), 1 PG kompleks (kunci minimal 2), 1 PG kategori (Benar/Salah). Semua soal tunggal berstimulus dan berlevel Aplikasi atau Penalaran (`lvl`; saat ini 3 Aplikasi, 2 Penalaran).
- Format soal sama dengan `m.quiz`: `{t:'pg'|'kompleks'|'kategori', q, o, a, e}` atau `rows` untuk kategori.
- Jawaban gerbang PG disimpan di `q100` sampai `q104` (indeks 100 ke atas) agar tidak bertabrakan dengan soal F4 (`q0` sampai `q7`). Dibaca pembaca jawaban dan dinilai fungsi soal yang ada (`lkpd-soal.js`). Soal gerbang isian lama (`q` + `kunci` teks, `gate<i>`) tetap didukung.
- Penilaian: lihat bagian 4A (acuan TKA, nilai sebagian untuk PG kompleks dan PG kategori). Kriteria lama "4 dari 5 soal benar" (`gate.min`) sudah dihapus.
- Soal 5: panjang pilihan diseimbangkan (kunci C tidak lagi paling panjang). Pembahasan soal 2 menjelaskan semua pengecoh.
- Catatan: draf yang dikerjakan dengan gerbang isian lama tidak terbaca sebagai jawaban PG; siswa perlu menjawab ulang gerbang.

## 4A. Penilaian gerbang masuk (acuan TKA) dan KKM
Gerbang adalah **syarat kelayakan masuk praktik, bukan komponen nilai akhir**. Nilai akhir tetap praktik x 85% + teori x 15%.

| Bentuk soal | Poin per soal |
|---|---|
| PG | benar 1, salah 0 |
| PG kompleks | (pilihan benar terpilih - pilihan salah terpilih) / jumlah kunci, minimal 0 |
| PG kategori | pernyataan tepat / jumlah pernyataan |

- **Nilai gerbang** = jumlah poin / jumlah soal x 100, dibulatkan. Soal yang belum dijawab bernilai 0.
- **KKM gerbang** = `max(75, S.kkm)` (`lk2KkmGerbang`). KKM yang diatur admin di bawah 75 tidak dipakai; di atas 75 dipakai.
- **Lembar Kerja terbuka** bila nilai gerbang >= KKM gerbang. Staf (guru/admin), pratinjau, dan cetak tidak terkunci. Kirim LKPD ditolak untuk siswa bila gerbang belum lulus.
- **Gerbang lama** (soal isian teks, tanpa penilai otomatis): lulus bila semua soal terjawab.
- **Payload**: `payload.v2.gerbang = {nilai, poin, kkm, lulus}`; `payload.v2.gate` tetap berisi jumlah soal terjawab (kompatibilitas).
- **Detail guru**: tiap soal menampilkan jawaban, kunci, pembahasan, dan poin; ringkasan "Nilai gerbang (acuan TKA)". Kotak "Jawaban benar" dan `gate.min` dihapus.
- **Cetak**: lembar siswa memuat baris "Nilai gerbang ___ (dari 100; KKM 75)"; Kunci memuat rumus penskoran.

Contoh LKPD-X-07 (3 PG, 1 PG kompleks dengan 2 kunci, 1 PG kategori dengan 5 pernyataan):

| Jawaban | Nilai | Aturan lama 4 dari 5 | KKM 75 |
|---|---|---|---|
| Semua benar | 100 | lulus | lulus |
| 3 PG benar, kompleks 0, kategori 4/5 | 76 | gagal | lulus |
| 3 PG benar, kompleks 1/2, kategori 3/5 | 82 | gagal | lulus |
| 2 PG benar, kompleks penuh, kategori 4/5 | 76 | gagal | lulus |
| 3 PG benar, kompleks 0, kategori 3/5 | 72 | gagal | gagal |
| 2 PG benar, kompleks 1/2, kategori 5/5 | 70 | gagal | gagal |

Dengan 5 soal bobot sama, nilai gerbang selalu bilangan genap dan nilai terendah yang lulus adalah 76.

## 4B. Nilai praktik terverifikasi dan pembukaan Evaluasi
Tab Evaluasi (soal latihan membaca skala) terbuka bagi siswa bila **nilai praktik terverifikasi guru >= KKM evaluasi (minimal 75)**. Soal yang terkunci hanya kartu latihan; rubrik penilaian kinerja tetap terbaca. Guru, pratinjau, dan cetak tidak terkunci.

**Nilai praktik terverifikasi** (skala 100, bobot `rubric`): langkah 30 + K3 20 + pemeriksaan dan tabel 25 + analisis 25.
- **Langkah:** langkah bersaksi guru dihitung hanya bila guru mencentang saksi di Detail.
- **K3:** butir APD dihitung hanya bila guru mencentang paraf APD.
- **Pemeriksaan dan tabel:** dari isian siswa (rata-rata baris pemeriksaan lengkap dan kelengkapan tabel).
- **Analisis:** nilai 0-100 dari guru (kolom "Nilai analisis" di Detail), bukan lagi dihitung dari panjang jawaban. Belum diisi = 0 poin.
- Disimpan di `payload.v2.verif` = `{s, a, n, praktik, kkm, lulus, by, ts}` saat guru menekan "Simpan verifikasi guru". Nilai analisis wajib diisi (bilangan bulat 0-100) agar verifikasi tersimpan.
- Contoh: siswa mencentang semua dan mengetik jawaban analisis asal-asalan mendapat 54 (sebelumnya 75 dari nilai otomatis). Dengan semua langkah dan APD terverifikasi dan analisis 0, nilainya tepat 75.

**Status siswa** (`lk2Status`): Evaluasi terbuka bila ada pengumpulan LKPD miliknya yang diverifikasi dengan `verif.praktik` >= KKM; bila ada beberapa, dipakai yang tertinggi. Pesan di tab: belum kirim, menunggu verifikasi, atau nilai terverifikasi di bawah KKM. Kiriman Evaluasi tidak dihitung sebagai pengumpulan praktik.

**Kirim Evaluasi** (`lk2KirimEvaluasi`, tombol menggantikan Kirim LKPD di tab Evaluasi saat terbuka): kiriman terpisah berisi jawaban latihan. Nilai = praktik terverifikasi x bobot praktik (85%) + teori x bobot teori (15%), dicatat di `lkpd` (payload `v2.evaluasi = 1`) dan `hasil`. Detail guru menampilkan jawaban latihan dan kunci. Siswa boleh mengirim Evaluasi lebih dari sekali, sama seperti Kirim LKPD.

**Gerbang** tetap terpisah: gerbang hanya syarat kelayakan masuk praktik (bagian 4A), KKM gerbang dan KKM evaluasi masing-masing minimal 75.

## 4C. Kunci hasil per pertemuan (`js/lkpd-kunci.js`)
- **Siswa boleh mengunci pertemuan mana saja, kecuali pertemuan awal dan akhir.** Untuk LKPD-X-07 (5 pertemuan × 4 JP) yang bisa dikunci adalah Pertemuan 2 sampai 4 (Pertemuan 4 memuat Kegiatan 3 dan 4, tombolnya "Kunci Kegiatan 3 dan 4"), dengan urutan bebas. Pertemuan 1 (materi, gerbang masuk, APD) dan Pertemuan 5 (penilaian kinerja, refleksi) tidak dikunci siswa.
- **Kunci Pertemuan N hanya mengunci isian pertemuan N.** Isian dipetakan dari data modul (`lkkKeyMap`): langkah, tabel, dan komponen pemeriksaan lewat nomor kegiatan (`pertemuan[].kegiatan`); soal latihan lewat `pertemuan[].latihan`; analisis lewat pertemuan yang judulnya memuat "analisis"; waktu aktual `mt<N>` ke pertemuan N. Isian yang tidak terpetakan (gerbang, K3, refleksi, identitas) tetap bebas diubah.
- **Tombol:** bilah bawah menampilkan satu tombol "Kunci Pertemuan N" untuk tiap pertemuan yang belum terkunci. Pertemuan yang belum dibuka guru tampil nonaktif. Pertemuan tanpa isian tidak membuat catatan kosong.
- **Batas buka guru** (`pertBuka`, Pengaturan LKPD): "Semua pertemuan" = bebas mengunci P2 sampai sebelum terakhir; "Sampai Pertemuan N" membatasi.
- **Catatan kunci tidak berantai:** tiap catatan (`lkpd_bukti`, label `kunci|N`) hanya memuat isian barunya. Guru dapat membuka kunci pertemuan mana pun (tombol "Buka kunci PN" per pertemuan di status siswa) tanpa memengaruhi pertemuan lain. Catatan lama (aturan berurutan, berantai) tetap terbaca.
- Kunci tetap penegak di sisi aplikasi, bukan di server. Tidak ada perubahan Appwrite.

## 5. Observasi LKPD Praktik v2
- **Penilaian aspek (skala 1-4 + nilai, sama dengan Observasi UKK):** untuk tiap aspek penguji memilih tombol **1-4**, lalu mengisi **nilai** bulat sesuai rentang skala. Kolom nilai terkunci sampai skala dipilih, dan menolak angka di luar rentang (pesan merah "Nilai harus 75-90").

| Skala | Kesimpulan | Rentang nilai |
|---|---|---|
| 1 | Belum Kompeten | 0-60 (<61) |
| 2 | Cukup Kompeten | 61-74 |
| 3 | Kompeten | 75-90 |
| 4 | Sangat Kompeten | 91-100 |

- Deskriptor rubrik tiap skala (`d` di `m.v2.obs`) tampil di bawah tombol untuk skala yang dipilih, dan semua deskriptor ada di lipatan **Kriteria skala**. Kolom **Keterangan (opsional)** per aspek tetap ada.
- **Nilai akhir = jumlah(nilai aspek x bobot / 100)**, dibulatkan. Kategori: 91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, di bawah 61 Belum Kompeten. Aspek penghenti (K3) berskala 1 = praktik dihentikan dan kategori Belum Kompeten. Keputusan Kompeten tetap mensyaratkan semua indikator tercentang, semua aspek terisi, dan K3 tidak berskala 1.
- **Bar bawah** (menempel di layar): `N / 6 terisi`, nilai sementara atau akhir, tombol **Belum diisi** (gulir ke aspek pertama yang belum lengkap dan menyorotnya) dan **Simpan**. Simpan ditolak bila ada aspek yang skala atau nilainya belum valid.
- **Penyimpanan:** `payload.nilai[id aspek]` = nilai 0-100, `payload.nilai['l_'+id aspek]` = skala 1-4, indikator tetap `i0..iN`. Tanpa perubahan skema Appwrite; `skor` = nilai akhir 0-100.
- **Indikator kompeten** memakai skala 1-4 + nilai yang sama (bukan lagi kotak centang). Indikator tercapai bila berskala 3 atau 4. Kompeten bila semua indikator tercapai, semua aspek terisi, dan K3 tidak berskala 1. Indikator tidak memengaruhi nilai akhir. Bar bawah menghitung aspek dan indikator (mis. `0 / 14 terisi`), dan Simpan menunggu semuanya valid. Disimpan sebagai `payload.nilai['l_i'+n]` (skala) dan `payload.nilai['i'+n]` (nilai), penanda `payload.nilai._fi=2`.
- **Catatan format lama** (skor 1-4 per aspek tanpa kunci `l_`) tetap dapat dilihat, dicetak, dan diekspor dengan hitungan lama (jumlah(skor / 4 x bobot), kategori Sangat Baik/Baik/Cukup/Kurang). Catatan rilis sebelumnya yang indikatornya kotak centang juga tetap terbaca. Bila diubah, aspek (format skor lama) dan indikator diisi ulang dengan skala dan nilai.
- Penyimpanan: koleksi `observasi`, `tipe='siswa'`, `payload.v=2` (tanpa perubahan skema Appwrite).
- **PDF:** per catatan (aspek berbobot, indikator, keputusan, tanda tangan). Format baru memuat kolom Skor (skala), Nilai, dan Berbobot.
- **Excel:** tombol Excel lama menulis catatan v2 pada lembar terpisah per LKPD (kolom mengikuti rubrik; kolom terakhir Format penilaian membedakan skala + nilai dengan skor 1-4 lama); lembar lama tidak lagi tercampur baris v2.

## 6. Cetak dan cadangan draf
- **Cetak:** Lembar Kerja v2 tetap tercetak walau gerbang belum selesai (sebelumnya siswa mencetak halaman "terkunci"). Mata pelajaran di cetakan memakai nama master (Dasar-Dasar Teknik Otomotif (DDPK); Kompetensi Keahlian Teknik Sepeda Motor).
- **Cadangan draf:** tombol Cadangkan draf (unduh berkas .json) dan Pulihkan draf di Lembar Kerja v2. Draf LKPD tersimpan di perangkat; cadangkan setelah tiap pertemuan. Berkas hanya bisa dipulihkan pada LKPD dan akun yang sama.

## 7. Penerbitan dan penyimpanan
- Modul v2 dimuat sebagai Draft. Guru menerbitkan lewat tombol Terbitkan di daftar LKPD. Tombol Edit dan Salin dinonaktifkan untuk modul v2 sampai Editor v2 tersedia.
- Semua data siswa memakai kunci yang sama dengan mesin lama (`step<i>`, `safe<i>`, `actual<i>`, `q<i>`), jadi draf, foto bukti, nilai koreksi, rekap, dan sinkronisasi tidak berubah. Tanpa perubahan skema Appwrite.
- Pengaturan mode Latihan/Ujian (Kelola LKPD > Pengaturan) berlaku untuk v2: Teori ringkas menyembunyikan kartu Memahami; Penjelasan langkah menyembunyikan isi tiap pertemuan dan "Poin kritis"; Petunjuk komponen menyembunyikan keterangan dan acuan komponen pemeriksaan (`lk2ModeFilter`).

## 8. Batas yang diketahui
- Draf belum sinkron ke server (hanya cadangan manual lewat berkas); foto bukti memakai alur foto yang ada.
- Editor v2 belum ada; perubahan isi modul v2 dilakukan di berkas data.
- Kunci gerbang dan kunci soal isian ikut di data modul (terbaca di sisi klien, sama seperti kunci soal lain).
- Belum diuji dengan Appwrite dan peramban sungguhan; uji di lingkungan uji dulu.

## Format cetak PDF (Ctrl+P / Cetak)
- **Nama berkas:** judul halaman diganti sementara saat mencetak menjadi `LKPD <id LKPD> <judul LKPD> <nama sekolah>`, mis. `LKPD X-07 Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge) SMKS Medina Bandung`. Id LKPD = id modul tanpa awalan `LKPD-`; karakter terlarang pada nama berkas (`/ \ : * ? " < > |`) dibuang. Setelah dialog cetak ditutup, judul halaman dipulihkan. Sekolah dari sekolah aktif (`SEK.nama`).
- **Tabel hanya untuk bagian tertentu:** Rencana pertemuan (Pertemuan, JP, Menit, Kegiatan), tabel data F1 sampai F3, hasil pemeriksaan lama (bila ada), dan tanda tangan. Bagian lain berupa daftar dan kotak.
- **Dibuang dari cetakan:** tombol, status "Terjawab n dari 5", ajakan "ketuk", dan kalimat khusus aplikasi ("dihitung otomatis", "agar Lembar Kerja terbuka"). Catatan tabel diganti petunjuk hitung manual.
- **Kotak pilihan:** PG tercetak sebagai lingkaran, PG kompleks sebagai persegi, soal kategori sebagai baris pernyataan dengan pilihan Benar/Salah rata kanan, status pemeriksaan sebagai kotak centang. Jawaban yang sudah dipilih tercetak terisi.
- **Nomor halaman** "Halaman X dari Y" di kanan bawah (Chrome 131 ke atas; peramban lama mengabaikannya).
- Uji: `node tools/uji-cetak-pdf.mjs` (nama berkas). Tata letak diperiksa dengan Chromium.


## Format cetak PDF LKPD (js/lkpd-format.js)
Tombol Cetak menyusun lembar dari **data modul**, bukan dari tampilan layar, dengan format acuan PDF LKPD SMKS Medina Bandung. Uji: `node tools/uji-lkpd-format.mjs` (69 uji; `LKPD_HTML=/tmp/lkpd.html` menulis HTML cetak untuk diperiksa).
- **Modul v2 (LKPD-X-07)**: kop sekolah, judul hijau, identitas dua kolom (alokasi waktu 5 pertemuan × 4 JP), Tujuan pembelajaran, tabel Rencana pertemuan, lalu satu banner hijau per pertemuan (`Pertemuan n · judul` dan `4 JP · target 180 menit`). Isi tiap pertemuan: pertanyaan pemantik, Materi, Gerbang masuk (PG, PG kompleks dengan kotak centang, PG kategori berupa tabel Benar/Salah, baris Skor gerbang dan Paraf guru), Alat dan bahan, K3 dan APD (paraf hanya pada butir APD), Cek kondisi alat, langkah dengan Poin kritis dan Paraf guru, tabel F1 sampai F3, Pemeriksaan dan bukti (Foto bukti hanya pada item foto wajib, Sesuai standar, Tidak sesuai, Catatan), Latihan membaca skala (Jawab dan Cara hitung), Analisis, Refleksi, Tindak lanjut, Penilaian kinerja oleh guru, baris Waktu aktual pertemuan, dan tanda tangan.
- **Modul v1 dan LKPD buatan guru**: Tujuan, Materi, Alat dan bahan, Checklist K3, banner Prosedur praktik, Hasil pemeriksaan, Diagnosis dan analisis, Evaluasi pengetahuan, Bobot penilaian, dan tanda tangan.
- Isian siswa dari draf tercetak pada garis isian dan kotak centang; cetakan guru, admin, dan pratinjau berupa lembar kosong. Isian di-escape.
- Footer: `LKPD DDPK Kelas X · Alat Ukur · SMKS Medina Bandung` dan `Halaman N dari M` (margin box @page; peramban lama mencetak tanpa nomor halaman). Nama berkas PDF tetap `LKPD X-07 <judul> <nama sekolah>` dari `namaPdf` di `lkpd-cetak.js`.
- Data tambahan pada `LKPD-X-07`: `v2.judulPendek`, `v2.cekAlat`, `v2.tindak`, dan `latihan` pada pertemuan 2 sampai 4 (id soal latihan). Modul v2 lain yang belum memilikinya tetap tercetak, tanpa bagian itu.
- Bila generator gagal, `lkpd-cetak.js` memakai format lama (salinan tampilan layar yang dirapikan `v2Cetak`).

## Cetak Kunci dan Pembahasan Gerbang Masuk (khusus guru)
Tombol **Cetak kunci** muncul tepat di samping **Cetak** (pratinjau guru dan baris aksi) hanya untuk Guru dan Admin pada LKPD v2 yang punya gerbang masuk. Siswa tidak melihat tombol dan klik dari akun siswa ditolak. Dokumen satu halaman, formatnya mengikuti PDF Kunci_LKPD_SMKS_Medina_Bandung: judul hijau, keterangan syarat lulus dan larangan dibagikan ke siswa, Ketentuan soal (sebaran level dihitung dari data), tabel Kunci (No, Bentuk, Level, Kunci, Pembahasan; kategori per pernyataan), Peta ke soal lama (`v2.peta`), dan Kunci jawaban latihan (id, `kunci`, rumus `e`). Footer `Kunci gerbang masuk · LKPD Alat Ukur · SMKS Medina Bandung (khusus guru)` dan nomor halaman. Nama berkas PDF: `Kunci LKPD X-07 <judul> <nama sekolah>`. Semua isi diambil dari data modul, jadi kunci dan pembahasan di PDF selalu sama dengan penilaian di aplikasi. Kode: `lkfKunci` di `js/lkpd-format.js`; uji: `node tools/uji-lkpd-format.mjs` (66 uji).

## Foto pada Materi dan Soal evaluasi; Edit isi LKPD v2
- Edit isi: Tujuan & teori, tombol **Tambah foto** di tiap topik teori; Soal, tombol foto soal pada semua jenis soal (termasuk **Isian angka**). Foto dikecilkan otomatis (sisi terpanjang 800 px) dan diunggah ke Google Drive saat sinkron.
- Data: teori `[topik, uraian, foto]`; soal `qi` (foto soal), `oi` (foto pilihan, PG dan PG kompleks).
- Yang dikunci di editor v2: jumlah dan urutan Langkah, butir K3, dan komponen Pemeriksaan (terhubung ke `v2.langkah`, `v2.k3grup`, `v2.obs`). Teksnya boleh diubah. Rencana pertemuan dan tabel tidak diubah editor ini dan dipertahankan saat menyimpan.
- Uji: `node tools/uji-lkpd-foto.mjs`.

## Cetak LKPD dan Cetak kunci untuk semua LKPD
Format cetak (`js/lkpd-format.js`) dan tombol **Cetak kunci** berlaku untuk **semua LKPD**: 21 LKPD bawaan v1 (X-1 sampai XII-7), LKPD-X-07 (v2), dan LKPD buatan guru.
- **Cetak LKPD**: v2 memakai banner pertemuan; v1 dan buatan guru memakai Tujuan, Materi, Alat dan bahan, Checklist K3, banner Prosedur praktik, Hasil pemeriksaan, Diagnosis dan analisis, Evaluasi pengetahuan, Bobot penilaian, dan tanda tangan, dengan kop, judul hijau, identitas, dan footer yang sama.
- **Cetak kunci** (Guru dan Admin, di samping Cetak): LKPD v2 mencetak *Kunci dan Pembahasan Gerbang Masuk*; LKPD lain mencetak *Kunci dan Pembahasan Soal Evaluasi* (tabel No, Bentuk, Kunci, Pembahasan dari `m.quiz` yang sama dengan yang dilihat siswa; kolom Level hanya bila soal berlevel). Tombol dipasang oleh pembungkus `viewLKPD` di `lkpd-format.js`, hanya bila LKPD punya soal, dan tidak digandakan. Nama berkas PDF: `Kunci LKPD <id> <judul> <sekolah>`.
- Uji: `node tools/uji-lkpd-semua.mjs` memeriksa ke-22 LKPD (isi cetak lengkap, tanpa undefined/NaN, satu baris kunci per soal dengan huruf kunci sesuai data, pembahasan, footer, dan tombol hanya untuk staf). `LKPD_DUMP=/tmp/x LKPD_ID=XI-3` menulis HTML cetak dan kunci untuk diperiksa.

## Master LKPD V2 (LKPD-X-07)
**LKPD-X-07 adalah master LKPD V2**: acuan struktur dan format cetak untuk semua LKPD v2. Berkas: `js/lkpd-master.js` (dimuat setelah `lkpd-v2-editor.js`), uji: `node tools/uji-lkpd-master.mjs` (39 uji). Tidak ada koleksi atau atribut Appwrite baru. Master dikenali dari ID tetap `LKMS.ID` (`LKPD-X-07`), sehingga salinannya tidak ikut menjadi master.
- **Kelola LKPD (Guru/Admin), halaman LKPD v2**: kartu **Master LKPD V2** (pada master) atau **Kelengkapan sesuai master V2** (pada LKPD v2 lain) dengan penghitung `n/14` dan butir yang belum terpenuhi.
- **Buat LKPD v2 dari master**: tombol pada master membuka Editor LKPD berisi salinan (draf, tidak aktif, ID kosong, judul "… (baru dari master)"). Salinan mencatat `v2.dari` = ID master dan tidak membawa `peta` (peta ke soal lama milik master). Master tidak berubah. Isi tiap bagian lalu disesuaikan di Editor LKPD.
- **14 butir daftar periksa master**: tujuan (min. 3); pemantik dan materi (min. 4 topik); rencana pertemuan (awal dan akhir tanpa kegiatan, JP dan menit terisi); tiap kegiatan terpetakan ke pertemuan; gerbang masuk (min. 3 soal TKA berlevel Aplikasi/Penalaran, kunci valid, pembahasan); K3 dan APD (min. 5 butir, semua terkelompok, ada APD); langkah tiap kegiatan dan ada langkah bersaksi guru; tabel data (min. 1); pemeriksaan dan bukti (tiap komponen punya kegiatan, ada wajib foto); latihan membaca skala (min. 3 soal isian berkunci, id pada pertemuan ada); analisis dan refleksi (min. 3); penilaian kinerja (bobot 100%, rubrik skor 1-4, ada aspek penghenti); tindak lanjut remedial dan pengayaan; cek kondisi alat.
- Cetak LKPD dan **Cetak kunci** otomatis berlaku untuk turunan master karena disusun dari data modul (`lkpd-format.js`).
- Batas saat ini: editor v2 mengunci jumlah dan urutan langkah, butir K3, dan komponen pemeriksaan (teksnya bisa diubah). Soal gerbang masuk sudah bisa diedit penuh (lihat di bawah), sehingga turunan master dengan topik berbeda tidak perlu mengubah data lewat kode. Rencana pertemuan dan tabel data masih memakai isi master.

## Editor soal gerbang masuk (tab Soal, LKPD v2)
Soal gerbang masuk dapat diedit penuh di Editor LKPD (`js/lkpd-v2-editor.js`), tab **Soal**, bagian *Soal gerbang masuk*. Uji: `node tools/uji-lkpd-gerbang.mjs` (47 uji).
- Daftar soal ringkas (nomor, kutipan pertanyaan, bentuk, level); ketuk soal untuk membuka. Per soal: bentuk **PG**, **PG kompleks**, atau **PG kategori** (konversi membawa pertanyaan, pilihan, kunci, level, dan pembahasan), level **Aplikasi** atau **Penalaran**, pertanyaan, pilihan A sampai H (ketuk huruf untuk kunci; PG satu kunci, kompleks lebih dari satu), pernyataan Benar/Salah untuk kategori, foto soal dan pilihan, dan **Pembahasan (wajib)**.
- Tambah PG, PG kompleks, atau PG kategori (soal baru: 5 pilihan kosong atau 3 pernyataan), Naik, Turun, Duplikat, dan Hapus soal. Batas: minimal 3 dan maksimal 10 soal, minimal 4 pilihan, minimal 3 pernyataan kategori.
- Pemeriksaan sebelum simpan (daftar masalah editor): pertanyaan, jumlah pilihan, kunci, pembahasan, level, dan minimal 3 soal; pesan berawalan "Gerbang masuk no. N".
- Saat simpan, pilihan dan pernyataan kosong dibuang dan kunci mengikuti pilihan yang sama; soal yang tidak diubah tersimpan identik dengan aslinya. Hasil menjadi `v2.gate.qs`, sehingga **Cetak kunci**, penilaian gerbang (KKM), dan daftar periksa master otomatis mengikuti.
- Catatan: jawaban siswa yang sudah tersimpan mengikuti nomor soal, jadi ubah soal gerbang sebelum LKPD dipakai siswa. Hanya Guru dan Admin.

## LKPD-XI-17 (Transmisi Manual) dan LKPD-XI-18 (Transmisi Otomatis/CVT)
Dua modul v2 berikutnya, dibuat dari struktur master LKPD-X-07 dan mengikuti Matriks_LKPD_TSM_Kelas_X-XII_ringkas.xlsx (LKPD-XI-18 lama dipecah dua, masing-masing 18 JP). Berkas `js/lkpd-v2-xi17.js` dan `js/lkpd-v2-xi18.js`, uji `node tools/uji-lkpd-xi18.mjs`. Keduanya 6 pertemuan x 3 JP (135 menit). Target praktik = jumlah menit langkah tiap kegiatan (XI-17: 60, 60, 50, 60; XI-18: 55, 55, 70, 55). Soal latihan memakai isian angka; M5 (XI-17) memakai gambar keolengan. Standar, batas pakai, torsi, dan oli tidak diisi dan harus diisi guru dari manual servis. Status Draft: terbitkan lewat tombol Terbitkan setelah diperiksa.
