# Panduan Pengamanan Appwrite — LKPD, Nilai Guru, dan Foto Bukti

Berkas `appwrite.json` pada versi ini **memperketat izin** koleksi `lkpd` dan menambah koleksi `lkpd_bukti`. Jika `appwrite.json` dipush sebelum langkah 1 selesai, guru tidak akan melihat data LKPD. Kerjakan berurutan.

## Langkah 1. Beri label ke akun staf (wajib, sebelum apa pun)
Appwrite Console > Auth > Users > pilih pengguna > Labels.
- Semua guru: label `guru`
- Admin: label `admin` (sudah dipakai di izin lama)
- Guru yang boleh mengelola modul LKPD: label `lkpd-editor`

Label adalah izin server. Kolom peran di aplikasi hanya mengatur tampilan.

## Langkah 2. Cadangkan data
Ekspor rekap dari aplikasi (Excel/PDF) dan, bila bisa, ekspor database dari Console.

## Langkah 3. Tambah atribut dan koleksi baru
Cara cepat: `appwrite push collections` dari folder proyek. Cara manual di Console (database `tbsm`):

Koleksi `lkpd`, tambah atribut (semuanya tidak wajib):
`koreksi` (integer 0–100), `umpan` (string 1000), `verifOleh` (string 128), `verifTs` (integer).

Koleksi baru `lkpd_bukti` (Document security **aktif**):
`lkpdId` string 36 wajib, `sid` string 36 wajib, `moduleId` string 32 wajib, `ts` integer wajib, `label` string 100, `data` string 300000 wajib. Indeks `key` pada `lkpdId`.

Tunggu semua atribut berstatus *Available* sebelum lanjut.

## Langkah 4. Izin koleksi
| Koleksi | Document security | Izin koleksi |
|---|---|---|
| `lkpd` | Aktif | Create: Users. Read: label `guru`, `admin`. Update: label `guru`, `admin`. Delete: label `admin` |
| `lkpd_bukti` | Aktif | Create: Users. Read: label `guru`, `admin`. Update: label `admin`. Delete: label `guru`, `admin` |
| `hasil` | (tetap) | Tambahkan Update: label `guru` agar nilai koreksi tersinkron |

Aplikasi memberi setiap dokumen `lkpd` dan `lkpd_bukti` baru izin baca untuk pemiliknya, sehingga siswa hanya membaca miliknya sendiri.

## Langkah 5. Pendaftaran
`js/config.js` kini berisi `PENDAFTARAN_TERBUKA:false`. Email yang belum ada di daftar akun ditolak saat login, sehingga akun Google sembarang tidak otomatis menjadi siswa. Tambahkan siswa lewat Kelola Akun atau impor Excel sebelum mereka login. Ubah ke `true` bila ingin pendaftaran terbuka lagi.

## Langkah 6. Uji dengan tiga akun
1. Siswa A kirim LKPD dengan satu foto. Siswa B tidak melihat data A (buka Riwayat; cek juga lewat Console bila perlu).
2. Guru (label `guru`) melihat semua pengumpulan dan foto, lalu menyimpan nilai koreksi. Nilai di rekap hasil ikut berubah.
3. Siswa A melihat "Nilai guru" dan umpan balik.
4. Akun siswa tidak bisa mengisi nilai koreksi (tombol tidak muncul).

## Yang berubah dan yang belum aman
- **Data LKPD lama** tidak punya izin pemilik. Guru/admin tetap melihatnya, tetapi siswa tidak lagi melihat riwayat LKPD lama mereka. Nilainya di koleksi `hasil` tetap tampil.
- **Nilai masih dihitung di perangkat siswa.** Siswa yang paham teknis masih bisa mengirim skor sembarang. Karena itu gunakan **nilai guru** (koreksi) untuk rapor; pengumpulan tanpa koreksi berstatus "belum diverifikasi".
- **Koleksi `hasil` dan `akun` masih dapat dibaca semua pengguna login** (nama, nilai, email). Mengamankannya butuh pemetaan akun aplikasi ke ID pengguna Appwrite, belum dikerjakan.
- **Kunci jawaban soal** ada di data modul yang dibaca siswa. Solusi tuntas: Appwrite Function untuk menilai di server.
- Pembuatan akun oleh siswa ke koleksi `akun` masih diizinkan; peran aplikasi tidak menggantikan label server.
