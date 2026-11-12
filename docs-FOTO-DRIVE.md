# Foto bukti praktik per item dan penyimpanan Google Drive (v50)

## Yang berubah
- **Kamera per item**: di LKPD, tab Kerja, tabel *Hasil pemeriksaan*, tiap komponen punya tombol **Foto** (ikon kamera). Satu foto per item, bisa dihapus lalu diambil ulang. Foto dikecilkan lebih kecil (sisi 960 px, sekitar 110 KB).
- **Foto tambahan**: bagian "Foto bukti praktik" yang lama menjadi *Foto tambahan* (opsional, maksimal 3), misalnya foto keseluruhan unit.
- **Google Drive**: saat sinkron, foto diunggah lewat Appwrite Function `foto-drive` ke folder Drive **TBSM Bukti Praktik**. Database Appwrite hanya menyimpan penanda `drive:<fileId>` di kolom `data`, jadi ruang database tidak terpakai oleh foto baru.
- **Tampilan guru dan siswa**: foto dalam detail LKPD diurutkan per item dengan keterangan "Item N · nama komponen". Foto dari Drive dimuat lewat fungsi yang sama.
- Tidak ada perubahan skema koleksi Appwrite. Label foto per item disimpan sebagai `c<nomor>|<nama komponen>`.

## Keamanan
- `GOOGLE_CLIENT_SECRET` dan `GOOGLE_REFRESH_TOKEN` hanya boleh berada di **Environment variables fungsi**. Jangan taruh di repo, `js/config.js`, atau chat.
- Berkas di Drive bersifat privat. Peramban tidak pernah mendapat tautan Drive. Fungsi hanya mengirim foto kepada guru/admin (label `guru` atau `admin`) dan kepada pemilik foto (izin baca dokumen `lkpd_bukti`).
- Fungsi menolak berkas yang bukan gambar (cek byte awal berkas) dan foto di atas batas ukuran.

## Memasang fungsi (sekali saja, di Appwrite Console)
1. Functions > Create function > Runtime **Node.js 18 atau lebih baru** (Node 26 juga bisa; fungsi ini tidak memakai pustaka node-appwrite). Function ID: `foto-drive`.
2. Unggah isi folder `functions/foto-drive` (`src/main.js` dan `package.json`). Entrypoint: `src/main.js`. Build command: `npm install`.
3. Settings > **Execute access**: Users.
4. Settings > **Scopes**: `users.read` dan `documents.read`.
5. Settings > **Environment variables**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `DB_ID` (opsional, bawaan `tbsm`)
   - `DRIVE_FOLDER_ID` (opsional; **kosongkan** bila token memakai scope `drive.file`, folder dibuat otomatis)
6. Deploy.

Paket Appwrite gratis hanya mengizinkan 2 fungsi per project: `akun-admin` dan `foto-drive`. Bila ID fungsi berbeda, tambahkan `FN_FOTO:'id-anda'` di `js/config.js`.

## Token Google
- Aktifkan **Google Drive API** di proyek Google Cloud yang sama.
- Status aplikasi OAuth harus **In production**. Bila masih *Testing*, refresh token kedaluwarsa dalam 7 hari dan fungsi akan menjawab "Token Google kedaluwarsa".
- Scope yang disarankan: `https://www.googleapis.com/auth/drive.file`. Dengan scope ini fungsi hanya bisa mengakses berkas yang dibuatnya sendiri.
- Kuota Drive dibagi dengan Gmail dan Foto di akun itu. Gunakan akun khusus sekolah.

## Uji
1. Siswa membuka LKPD, memotret dua item, lalu **Kirim LKPD**.
2. Tunggu sinkron selesai (banner status hilang). Folder **TBSM Bukti Praktik** muncul di Drive akun itu.
3. Guru membuka Rekap LKPD > detail. Foto muncul di bagian *Foto bukti praktik* dengan keterangan item.
4. Siswa lain tidak boleh melihat foto itu (Cek lewat akun siswa berbeda).

## Perilaku bila ada masalah
- Fungsi `foto-drive` belum dipasang: foto disimpan di database seperti sebelumnya, tidak ada yang hilang.
- Fungsi terpasang tetapi Google gagal (misalnya token kedaluwarsa): foto tetap antre di perangkat siswa dan dicoba lagi pada sinkron berikutnya. Pesan galat muncul sebagai notifikasi.
- Foto lama (sebelum v49) tetap di database dan tetap tampil. Foto itu tidak dipindahkan otomatis ke Drive.
- Cetak LKPD: foto dari Drive baru tercetak bila sudah termuat di layar detail. Buka detail dan tunggu foto tampil sebelum mencetak.

## Pembaruan v50
- **Nama berkas di Drive** kini dapat dikenali: `Kelas_Nama-Siswa_IdModul_K03-Komponen_20261112-1345_xxxx.jpg` (`K<nomor item>`, atau `Tambahan-<keterangan>` untuk foto tambahan). Perlu **deploy ulang fungsi `foto-drive`** (folder `functions/foto-drive`). Fungsi lama tetap jalan, hanya memakai nama lama.
- **Kamera saja**: tombol Ambil foto membuka kamera langsung di aplikasi, tanpa pilihan galeri. Bila izin kamera ditolak atau peramban tidak mendukung, tombol cadangan membuka aplikasi kamera perangkat (`capture`). Perlu HTTPS.
- **Foto wajib**: Guru/Admin buka modul > Pengaturan > *Foto bukti wajib per komponen*, centang komponen, lalu simpan. Siswa tidak bisa mengirim LKPD sebelum semua foto wajib terisi. Tersimpan di modul sebagai `fotoWajib` (daftar indeks), tanpa perubahan skema Appwrite.
- **Timer**: mode Ujian, tombol Jeda terkunci dan waktu berbasis jam dinding (tetap berjalan walau halaman ditutup, berhenti saat LKPD dikirim). Mode Latihan, timer otomatis jalan lagi saat siswa mengisi LKPD.

## Pembaruan v51
- **Foto di baris item**: di detail LKPD (guru dan siswa), foto bukti tampil sebagai miniatur di bawah nama komponen pada tabel Hasil pemeriksaan. Ketuk miniatur untuk memperbesar, ketuk lagi atau tekan Esc untuk menutup. Bagian *Foto tambahan* di bawah hanya memuat foto tambahan (atau foto item yang sudah tidak ada di modul).
- **Ukuran**: foto dikecilkan ke sisi 800 px dengan batas sekitar 100 KB (`LD.SIDE` dan `LD.MAXC` di `js/lkpd-drive.js`). Foto lama tetap tampil.
- **Kamera**: tombol memakai ikon (ambil foto, foto ulang, hapus, batal, balik kamera, buka kamera perangkat). Perbaikan: tombol cadangan *Buka kamera* tidak lagi ikut tampil saat kamera langsung bekerja.
- Tidak ada perubahan pada fungsi `foto-drive` maupun skema Appwrite.
