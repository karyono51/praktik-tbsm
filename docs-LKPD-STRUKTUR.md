# Edit LKPD v2 mengikuti form siswa

Berkas: `js/lkpd-v2-struktur.js` (dimuat tepat setelah `js/lkpd-v2-editor.js`). Uji: `node tools/uji-lkpd-struktur.mjs` (125 uji). Hanya berlaku untuk LKPD v2; LKPD lama tidak berubah.

## 1. Urutan tab
Mengikuti form siswa. Bilah tab memberi penanda kelompok.

| Kelompok | Tab |
|---|---|
| (awal) | Info |
| Materi | Tujuan & teori, Rencana pertemuan, Prasyarat masuk, Alat & K3 |
| Lembar Kerja | Langkah, Tabel data, Pemeriksaan, Syarat kirim |
| Evaluasi | Evaluasi (soal latihan membaca skala dan soal lain) |
| (akhir) | Penilaian |

Soal prasyarat masuk dipindah dari tab Soal ke tab **Prasyarat masuk**; editornya tetap yang di `lkpd-v2-editor.js`. Masalah prasyarat tercatat di tab Prasyarat masuk.

## 2. Rencana pertemuan
- **Pertemuan** (daftar ringkas, ketuk untuk membuka): judul, JP, menit, target praktik, kegiatan yang dimuat, opsi *Tanpa kartu di Lembar Kerja*, judul kartu Lembar Kerja, opsi *Pisahkan kartu per kegiatan* (dengan judul tiap kartu), dan latihan soal yang dikerjakan di pertemuan itu.
- Memilih kegiatan untuk sebuah pertemuan memindahkannya dari pertemuan lain; satu kegiatan hanya di satu pertemuan.
- **Target praktik** harus sama dengan jumlah menit langkah kegiatannya. Tombol *Samakan* (per pertemuan) dan *Samakan semua target praktik* mengisinya.
- **Nama kegiatan** dapat diubah; jumlahnya tetap.
- **Langkah tiap kegiatan**: pilih kegiatan, isi menit, dan tandai *Saksi guru*. Pindah kegiatan juga mengubah awalan judul langkah ("Kegiatan N · ..."). Judul dan isi langkah tetap diubah di tab Langkah.
- Saat simpan: `v2.jp` = jumlah JP pertemuan dan `duration` = jumlah menit pertemuan; alokasi waktu di tab Info ikut otomatis.
- Peringatan: mengubah pemisahan kartu atau nomor kegiatan setelah siswa mulai mengisi membuat waktu aktual lama tidak terbaca.

## 3. Tabel data
- Daftar tabel ringkas. Per tabel: judul, kegiatan, judul kolom label baris, baris (tambah atau hapus dari bawah supaya isian siswa tidak bergeser), desimal hasil hitung (0 sampai 4), *Nol alat dicek sekali di awal* (bila tabel punya kolom nol), catatan di bawah tabel, dan nama kolom.
- Jenis kolom (angka, teks, rata-rata, selisih, status) tetap karena rumusnya otomatis.
- **Tambah tabel** dari dua contoh: *ukur 3 kali (rata-rata)* dan *terbesar dan terkecil (selisih)*. Kode tabel dibuat otomatis (T1, T2, ...).
- **Hapus tabel** (dengan konfirmasi) juga menghapus sumber otomatis komponen pemeriksaan yang memakainya.
- LKPD-DDO-ALT-02 (dulu LKPD-X-06) belum punya tabel; tambahkan bila perlu.

## 4. Pemeriksaan
Di tab Pemeriksaan, bagian *Penempatan komponen di Lembar Kerja*: tiap komponen punya **kegiatan** (kartu tempatnya) dan **hasil aktual**: diisi siswa atau otomatis dari tabel (nol alat, rata-rata, atau selisih). Nama dan kriteria komponen tetap diubah di bagian atas tab; jumlah dan urutan komponen tetap.

## 5. Kelompok K3 dan paraf guru
Di tab Alat & K3: nama kelompok, urutan kelompok (Naik, Turun), tambah dan hapus kelompok (hanya yang kosong), pilihan kelompok untuk tiap butir, dan **Paraf guru (APD)** per butir. Tiap butir harus masuk tepat satu kelompok; bila tidak, butir itu tidak tampil di Materi siswa dan editor menolak simpan. Dengan lebih dari satu kelompok, tiap kelompok perlu nama.

## 6. Syarat kirim
Tab Syarat kirim merangkum tiga syarat tetap (prasyarat lulus sesuai KKM, semua butir K3 dicentang, minimal satu komponen berisi hasil aktual dan status) dan memuat dua pengaturan yang bisa diubah:
- **Isian wajib siswa** (pengaturan yang sama dengan tab Penilaian).
- **Foto bukti wajib** per komponen pemeriksaan (`fotoWajib`).

## 7. Pemeriksaan sebelum simpan
Masalah muncul di daftar editor dan lencana tab: judul, JP, dan menit pertemuan; kegiatan yang tidak ada, kembar, atau belum masuk pertemuan; target praktik tidak cocok; pertemuan tersembunyi yang memuat kegiatan; kegiatan tanpa langkah; menit langkah tidak valid; kelompok K3 kosong atau butir tanpa kelompok; judul tabel, kegiatan, baris, desimal, dan nama kolom; kegiatan komponen dan sumber otomatis yang tabelnya tidak ada.

## 8. Yang tetap dikunci
Jumlah dan urutan langkah, butir K3, dan komponen pemeriksaan (teksnya bisa diubah) karena terhubung ke data yang sudah diisi siswa. Analisis, refleksi, dan rubrik observasi belum bisa diedit di editor.

## 9. Keamanan data
Tanpa perubahan, hasil simpan identik dengan modul aslinya (diuji untuk keenam modul v2). Salinan kerja ada di `d.S.v2s` dan ikut draf otomatis; draf lama tanpa salinan itu dibuat ulang dari modul.
