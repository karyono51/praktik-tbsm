# CBT online dari Bank soal

## Menu (v terbaru)
- **Bank soal**: khusus soal (tambah, impor, ekspor, filter, peruntukan). Siswa: latihan dan riwayat latihan.
- **CBT Online** (menu baru, kelompok *Soal dan ujian*): guru/admin punya tab **Sesi**, **Pantau**, **Hasil**, **Analisis** dengan ringkasan (sesi, dibuka, selesai, rata-rata). Siswa: daftar ujian dan riwayat ujian.
- Tidak ada perubahan koleksi Appwrite. Soal ujian tetap diambil dari Bank soal.

## Fitur
- **Token ujian** per sesi (guru bisa mengganti token), batas pelanggaran, dan aksi: peringatan, kunci, atau kirim otomatis.
- **Layar ujian CBT**: navigasi nomor, tanda ragu-ragu, layar penuh, penghitung pelanggaran, kunci layar.
- **Pantau** (tab guru): status siswa langsung, tambah waktu (+5/+15 menit atau semua), akhiri ujian, buka kunci, reset, nilai semua yang belum kirim.
- **Analisis**: tingkat kesukaran, daya beda, sebaran pilihan, ekspor Excel (rekap nilai, analisis butir, daftar hadir).
- **Cetak daftar hadir** dan berita acara.
- **Penilaian di server (CBT aman)**: kunci jawaban tidak pernah dikirim ke siswa.

## Dua mode
| Mode | `CBT_AMAN` | Kunci jawaban | Penilaian |
|---|---|---|---|
| Biasa | `false` | di payload soal | di peramban siswa |
| Aman | `true` | koleksi `soal_kunci` (khusus guru/admin) | fungsi server |

Mode biasa memakai token ber-hash; mode aman menyimpan token hanya di `soal_kunci`.

## Pemasangan mode aman
Paket gratis Appwrite hanya mengizinkan 2 fungsi (`akun-admin`, `foto-drive`), jadi kode CBT digabung ke `akun-admin`.

1. `node tools/gabung-cbt.mjs` (menyalin `cbt.js` dan `bawaan.json` ke `functions/akun-admin/src`).
2. Deploy ulang fungsi `akun-admin`. Tambahkan scope `databases.read`, `databases.write`, `users.read` (selain yang sudah ada). Timeout disarankan 30 detik.
3. `node tools/setup-appwrite.mjs` (membuat koleksi `soal_kunci` dan atribut `ext`, `stop`, `pb` pada `soal_run`).
4. Di `js/config.js` isi `CBT_AMAN:true` (`FN_CBT:'akun-admin'`). Jika punya slot fungsi ketiga, deploy `functions/cbt` dan isi `FN_CBT:'cbt'`.
5. `node tools/setup-appwrite.mjs --profil=aman` (siswa tidak lagi bisa menulis langsung ke `soal_hasil` dan `soal_run`).
6. `node tools/rilis.mjs` lalu deploy situs.

Urutan penting: fungsi dulu, baru `CBT_AMAN:true`, baru `--profil=aman`.

## Migrasi
Soal lama yang kuncinya ada di payload dipindahkan otomatis ke `soal_kunci` saat guru membuka Bank soal setelah mode aman aktif.

## Catatan
- Soal bawaan (60 soal TKA) **tidak dipakai** pada ujian mode aman, karena kuncinya ada di repositori publik. Pakai soal buatan guru. Latihan tetap boleh.
- Jika `js/soal-tka.js` berubah, jalankan lagi `node tools/gabung-cbt.mjs` dan deploy ulang.
- Pelanggaran dihitung dari perpindahan tab/keluar layar penuh; kunci dibuka guru lewat Pantau (menyetel `pb`).
- Jawaban dikirim berkala ke server; pengiriman akhir yang gagal disimpan di perangkat dan dicoba ulang.
- Kunci jawaban tetap perlu dijaga: jangan beri label guru kepada siswa.

---

# Pembaruan: pemeriksaan dan penguatan CBT

## Perbaikan galat
- **Analisis butir dan "Keluar halaman" kosong setelah membuka Pantau.** Hasil yang dimuat dari server tidak diurai (jawaban, urutan soal, jumlah keluar halaman ada di `payload`), lalu menimpa salinan yang sudah benar. Sekarang diurai dengan `bsFromDoc`. Terukur pada uji: 0 dari 8 kartu analisis tampil sebelum perbaikan, 8 dari 8 sesudahnya.
- **Layar penuh tetap menyala bila ujian gagal dimulai** (mode biasa: sesi sudah dikerjakan, token salah di server, dan sejenisnya). Sekarang keluar otomatis.
- **Daftar Hasil terpotong di 100 baris** tanpa tanda apa pun. Sekarang ada tombol "Tampilkan lebih banyak" (ekspor Excel memang sudah memuat semua baris).

## Beban server (ratusan siswa sekaligus)
Fungsi CBT kini memakai cache singkat di memori (akun 60 dtk, soal dan kunci 60 dtk, sesi dan token 10 dtk) dan membaca bank soal sekali untuk semua siswa, bukan sekali per siswa. Perubahan guru pada sesi atau token berlaku dalam 10 detik; kunci soal dalam 60 detik (nilai ulang selalu membaca kunci terbaru).

Diukur dengan `tools/uji-cbt.mjs` (Appwrite tiruan, 300 siswa, bank 200 soal):

| Aksi | Sebelum | Sesudah |
|---|---|---|
| Mulai ujian | 3300 panggilan (11 per siswa) | 1508 (5 per siswa) |
| Kirim jawaban akhir | 2400 (8 per siswa) | 900 (3 per siswa) |
| Simpan berkala (tiap 10 sampai 14 dtk) | 4 per simpan | 2 per simpan |

## Fitur baru
- **Nilai ulang dengan kunci terbaru** (CBT Online, tab Analisis). Bila analisis menandai "Periksa kunci" dan guru memperbaiki kunci di Bank soal, semua nilai sesi dihitung ulang. Mode aman: dikerjakan fungsi server (`nilaiUlang`). Mode biasa: dihitung di perangkat guru. Hasil yang soalnya sudah dihapus atau kuncinya hilang **dilewati** supaya nilai siswa tidak turun karena soal yang hilang.
- **Reliabilitas (Cronbach alpha)** di ringkasan Analisis, serta lembar *Matriks skor* dan *Reliabilitas* pada ekspor Excel. Dihitung atas soal yang dikerjakan semua peserta; pada sesi dengan soal acak per siswa irisan bisa terlalu kecil sehingga kartu tidak tampil.
- **Status penyimpanan untuk siswa** di layar ujian: "Tersimpan 09:14:03", "Menyimpan…", "Offline · jawaban aman di perangkat", atau "Belum terkirim ke server · jangan tutup halaman". Percobaan ulang simpan dipercepat menjadi 15 detik bila ada yang belum terkirim.
- **Batas tebakan token**: 10 token salah dalam 5 menit membuat akun itu ditahan 5 menit (per instans fungsi, cukup menahan tebakan beruntun).
- **Nilai yang berakhir** (Pantau) kini berhenti rapi di batas waktu fungsi (±18 dtk) dan aplikasi mengulang otomatis sampai semua peserta ternilai, tanpa kena batas waktu fungsi pada sesi besar.
- **+5 menit semua** berjalan 8 siswa sekaligus; Pantau memuat lebih jarang bila peserta lebih dari 150.

## Uji otomatis
`node tools/uji-cbt.mjs` menguji fungsi server tanpa internet (25 pemeriksaan: token, kelas, jadwal, penilaian, kirim ganda, batas tebakan, beban, akhiri massal, nilai ulang). Jalankan setelah mengubah `functions/cbt/src/main.js`, lalu `node tools/gabung-cbt.mjs` dan deploy ulang `akun-admin`.

## Status mode saat ini
`js/config.js` masih `CBT_AMAN:false` (mode biasa). Pada mode ini kunci jawaban ikut dalam soal yang bisa dibaca semua siswa yang login, nilai dihitung di peramban siswa dan siswa boleh menulis `soal_hasil`, jadi nilai bisa dipalsukan dan kunci bisa dibaca lewat alat pengembang peramban. Untuk ujian yang menentukan nilai, aktifkan mode aman dengan urutan di bagian "Pemasangan mode aman" di atas (fungsi dulu, lalu `CBT_AMAN:true`, lalu `--profil=aman`). Perubahan di atas bekerja di kedua mode.

---

# Pembaruan: layar ujian untuk HP
Berlaku untuk ujian dan latihan (siswa). Kode: `js/cbt.js` (tampilan dan aksi) dan `css/banksoal.css` (bagian "Layar ujian untuk HP").

- **Header aplikasi disembunyikan selama mengerjakan** (kelas `bs-run` pada `body`), begitu juga footer. Ruang layar yang terpakai profil dan chip kelas kini untuk soal.
- **Bar atas ringkas dan tetap di atas:** judul sesi, "Soal x dari N · terjawab · ragu", tombol **Aa** (ukuran huruf normal/besar/sangat besar, diingat di perangkat), dan **timer** di kanan atas. Timer kuning di bawah 5 menit, merah berkedip di bawah 1 menit. Garis progres tipis di dasar bar.
- **Navigasi nomor satu baris** yang bisa digeser, nomor aktif otomatis dipusatkan; nomor terjawab, ragu-ragu, dan aktif berbeda warna.
- **Status simpan** (Tersimpan, Menyimpan, Offline, Belum terkirim), pelanggaran, dan tombol layar penuh dipadatkan ke satu baris di bawah nomor.
- **Kartu soal:** nomor soal, label mapel/jenis, dan tombol **Ragu-ragu** (bendera) dalam satu baris. Teks 17 px, pilihan jawaban setinggi 54 px dengan tanda centang, tombol Benar/Salah setinggi 50 px dan terisi penuh saat dipilih. Gambar mengikuti lebar layar.
- **Bar bawah:** Kembali, **Daftar** (menampilkan terjawab/total), dan Lanjut; di soal terakhir menjadi Selesai. Timer pindah ke atas.
- **Daftar soal** (lembar bawah): ringkasan terjawab/ragu/kosong, semua nomor, legenda, tombol **Ke soal kosong** dan **Selesai dan kirim**. Tutup dengan Tutup, ketuk latar, atau Esc.
- **Geser kiri/kanan pada kartu soal** untuk pindah soal (tidak pernah menekan Selesai).
- **Layar tetap menyala** selama mengerjakan bila peramban mendukung (Screen Wake Lock). Pull-to-refresh dimatikan selama ujian.
- Mode lanskap pendek memadatkan bar atas dan bawah. Layar lebar membatasi lebar soal agar tetap terbaca.
- Pesan sistem Chrome "tarik dari atas untuk keluar layar penuh" berasal dari peramban dan tidak bisa diubah aplikasi.

## Pengembangan CBT Online
- **Nilai otomatis (mode Biasa):** saat guru membuka Pantau, peserta yang sudah selesai tetapi nilainya belum masuk dinilai dari jawaban di server. Tombol Nilai dari jawaban tetap ada sebagai cadangan.
- **Pantau gabungan:** pilih Semua sesi dibuka untuk melihat ringkasan semua sesi yang berjalan, lalu Pantau sesi ini untuk detail.
- **Satu ujian per siswa dicek ke server:** siswa tidak bisa memulai ujian kedua selama ujian lain di perangkat apa pun belum selesai.
- **Cetak dan ekspor:** Hadir dan berita acara, Kartu token (satu kartu per siswa), Rekap per kelas (Excel, sheet Ringkasan dan per kelas).
- **Susulan:** tombol Susulan di Pantau mengarsipkan hasil lama (jenis Arsip, tidak dihitung di analisis) dan membuka kesempatan baru. Mode Biasa saja. Ulang tetap menghapus hasil.
- **Gandakan sesi:** salin sesi untuk 1 sampai 5 hari kerja berikutnya (Sabtu dan Minggu dilewati), token baru otomatis.
- **Pemberitahuan:** beranda siswa menampilkan ujian yang dibuka atau akan mulai, pintasan CBT Online menampilkan jumlah sesi dibuka.

---

# Cetak hasil per siswa
Guru/admin: **CBT Online > Analisis** atau **Pantau > Hasil per siswa** mencetak satu halaman lembar hasil untuk tiap siswa yang sudah selesai pada sesi (urut ruang, lalu kelas dan nama). **Hasil per siswa + rincian** menambah tabel jawaban per soal (jawaban, kunci, hasil) tanpa teks soal. Di tab **Hasil**, kartu hasil ujian punya tombol **Cetak** untuk satu siswa (dengan rincian).
- Isi: kop sekolah, nama, kelas, no. peserta, username, ruang dan proktor, sesi, jadwal, nilai, KKM, keterangan (Tuntas, Belum tuntas, atau nilai sementara bila ada uraian belum dinilai), soal benar, keluar halaman, kolom tanda tangan.
- Rincian memakai kunci di perangkat guru/admin; tanpa kunci, kolom kunci dan hasil tertulis "-". Jawaban uraian tidak dicetak, hanya skornya.
- Siswa yang belum mengerjakan tidak dicetak. Proktor tidak melihat nilai (hanya guru/admin), jadi tombolnya tidak menghasilkan halaman untuk proktor.
- Pencetakan dicatat di log audit sebagai `klien.cetak.hasil-siswa` (mode aman).
- Berkas: `js/cetak-siswa.js`, uji `tools/uji-cetak-siswa.mjs`. Tidak ada perubahan Appwrite atau fungsi.

---

# Pembaruan: jumlah soal per jenis (sesi otomatis)

Pada formulir sesi, cara memilih soal **Otomatis (acak per siswa)**, ada pilihan **Jumlah soal ditentukan**:
- **Satu jumlah (semua jenis dicampur)**: cara lama, bawaan formulir (20 soal).
- **Per jenis soal**: isi sendiri jumlah **PG**, **PG kompleks**, **PG kategori**, dan **Uraian**. Isi 0 untuk jenis yang tidak dipakai. Contoh: PG 25 + Uraian 5, atau PG 20 + PG kategori 5 + Uraian 3.

Tiap siswa mendapat soal acak berbeda untuk tiap jenis; uraian ditaruh paling akhir. Pilihan mapel dan kelas tetap berlaku.
- Tersimpan di `payload` sesi (`jns`), tanpa perubahan atribut Appwrite. Sesi lama tidak berubah.
- Peringatan "soal tersedia kurang" dihitung per kelas dan per jenis. Menyimpan dengan semua jenis 0 ditolak.
- Fungsi server (`functions/cbt`, salinan di `akun-admin/src/cbt.js`) ikut diubah: **deploy ulang `akun-admin`** bila memakai CBT mode aman. `node tools/uji-cbt.mjs`: 140 lulus.

---

# Pembaruan: ekspor akun siswa, pilih rombel/kelas dulu

Menu **Akun**, tombol **Ekspor siswa per kelas**: sebelum berkas dibuat, muncul lembar pilihan.
- **Semua rombel**: satu lembar per rombel, plus lembar siswa yang belum punya rombel dan lembar **Semua siswa**.
- **Satu rombel** (dari menu Akademik, lengkap dengan jumlah siswa), **Belum punya rombel**, atau **Kelas X / XI / XII** (dari kelas pada akun).
- Bila belum ada rombel, pilihan memakai kelas pada akun.

Kolom: No, NIS, Nama, Username, Email, Rombel, Kelas, Sekolah, Status. Hanya siswa dari sekolah yang boleh dilihat akun Anda. Sandi tidak ikut diekspor.

---

# Pembaruan: menu Akun

- **Ubah/Tambah akun** membuka formulir sebagai lembar dari bawah di atas daftar (sebelumnya di atas daftar sehingga harus menggulir ke atas dan kehilangan posisi). Daftar tidak bergeser: setelah **Simpan** atau **Tutup**, Anda kembali tepat di akun yang tadi dan bisa lanjut ke akun berikutnya. Tombol kembali HP menutup lembar.
- Label peran pada kartu akun memakai semua peran akun (mis. "Admin + Guru"); sebelumnya akun dengan lebih dari satu peran menampilkan "undefined".
- **Pilihan peran** pada formulir akun ditata rata dua kolom berupa kotak yang bisa diketuk; peran yang dipilih diberi warna hijau (sebelumnya tersusun tidak rata dan memotong baris).
- **CBT Online**: kartu **Rata-rata** di ringkasan atas (Sesi, Dibuka, Selesai) disembunyikan. Rata-rata di tab Hasil dan Analisis tidak berubah.

---

# Pembaruan: Atur latihan (filter jenis dan uraian)
- **Jenis soal** di Atur latihan kini: Semua, **PG** (gabungan PG, PG kompleks, PG kategori), dan **Uraian**. Draf lama bernilai kompleks/kategori otomatis dibaca sebagai PG.
- **Uraian di latihan**: siswa mengisi kotak jawaban, ketuk *Periksa jawaban*, lalu kotak terkunci dan tampil kunci jawaban dan rubrik untuk penilaian mandiri. Uraian latihan **tidak dihitung** dalam nilai (total soal hanya objektif) dan dicatat sebagai "soal uraian latihan (tidak dinilai)".
- **Peruntukan uraian** kini bisa dipilih guru (Latihan / Ujian / Latihan dan ujian). Default tetap Ujian, dan soal uraian lama tetap Ujian, jadi tidak bocor ke latihan sebelum guru mengubahnya. Impor Excel: kolom peruntukan dihormati, kosong = Ujian.
- Mode aman: kunci uraian ada di `soal_kunci`, jadi di latihan siswa hanya melihat rubrik/pesan "Kunci tidak ditampilkan".
- **Jumlah soal latihan**: pilihan 5, 10, 20, 30 (tombol "Semua" dihapus).

## Pantau hari ujian dan cadangan Excel (v82)
- **Kartu "Perlu perhatian"** di Pantau: siswa tidak aktif lebih dari 2,5 menit, siswa terkunci, siswa ditolak SEB (lihat docs-SEB.md), dan banyak siswa belum mulai (30% atau minimal 3 siswa, 10 menit setelah sesi dibuka).
- **Per kelas**: bila peserta sesi lebih dari satu kelas, ringkasan selesai, mengerjakan, belum, terkunci, habis, dan tidak aktif per kelas.
- **Cadangan Excel**: tombol "Cadangan Excel" di Pantau mengunduh status dan nilai semua peserta, catatan SEB ditolak, dan info sesi. Unduhan **otomatis sekali per sesi** bila Pantau sedang terbuka saat sesi berakhir (dalam 24 jam) atau semua peserta sudah selesai. Tanda sudah dicadangkan disimpan di perangkat; tombol manual selalu bisa dipakai lagi. Data yang gagal dimuat tidak pernah dicadangkan.
- Uji: `node tools/uji-pantau.mjs`, `node tools/uji-cbt.mjs`.
