# Panduan Pengamanan Appwrite — LKPD, Nilai Guru, dan Foto Bukti

Berkas `appwrite.json` pada versi ini **memperketat izin** koleksi `lkpd` dan menambah koleksi `lkpd_bukti`. Jika `appwrite.json` dipush sebelum langkah 1 selesai, guru tidak akan melihat data LKPD. Kerjakan berurutan.

## Langkah 1. Beri label ke akun staf (wajib, sebelum apa pun)
Appwrite Console > Auth > Users > pilih pengguna > Labels.
- Semua guru: label `guru`
- Admin: label `admin` (sudah dipakai di izin lama)
- Guru yang boleh mengelola modul LKPD: label `lkpdeditor`

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
- **Koleksi `akun` masih dapat dibaca semua pengguna login** (nama, email). Koleksi `hasil` sudah dikunci, lihat bagian di bawah.
- **Kunci jawaban soal** ada di data modul yang dibaca siswa. Solusi tuntas: Appwrite Function untuk menilai di server.
- Pembuatan akun oleh siswa ke koleksi `akun` masih diizinkan; peran aplikasi tidak menggantikan label server.


## Pengamanan koleksi `hasil` (v56)
Sebelumnya semua pengguna login bisa membaca seluruh nilai. Sekarang `hasil` memakai keamanan per dokumen: guru/admin membaca lewat label, siswa hanya membaca dokumennya sendiri.

**Urutan (jangan dibalik):**
1. Pastikan semua guru berlabel `guru` dan admin berlabel `admin` (Auth > Users > Labels).
2. Tambahkan koleksi baru `uid_map` (atribut `sid` string 64 dan `email` string 128, wajib; indeks key `sid`). Izin: Create `users`, Read `label:guru` dan `label:admin`, Delete `label:admin`. Dokumen Security mati. Atau jalankan `appwrite push collections`.
3. Di koleksi `hasil`, nyalakan **Document security** dan ubah izin: Create `users`; Read `label:guru`, `label:admin`; Update `label:guru`, `label:admin`; Delete `label:admin`. Hapus Read `users`.
4. Deploy zip ini. Login sebagai guru/admin sekali: aplikasi memberi izin baca pemilik ke nilai lama secara otomatis.

**Cara kerja:** saat siswa login, aplikasi mencatat ID login Appwrite-nya ke `uid_map`. Saat guru menyimpan nilai, aplikasi memberi izin baca ke ID itu. Siswa yang belum pernah login nilainya baru terlihat setelah ia login lalu guru/admin membuka aplikasi (izin diberikan otomatis, paling cepat tiap 2 menit saat sinkron).

**Batasan:** pencatatan `uid_map` dilakukan dari aplikasi siswa, jadi siswa yang paham API bisa mencatat dirinya sebagai siswa lain. Aplikasi hanya memakai catatan yang emailnya sama dengan email akun, tetapi email di `uid_map` ditulis siswa sendiri. Risikonya jauh lebih kecil daripada sebelumnya (semua nilai terbuka), tetapi tidak mutlak. Penutup penuh membutuhkan Appwrite Function.
