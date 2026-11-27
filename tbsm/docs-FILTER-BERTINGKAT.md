# Filter bertingkat Bank soal (guru dan admin)

Halaman **Bank soal** kini memakai tiga dropdown bertingkat, menggantikan dropdown "Mapel / Elemen CP":

1. **Mapel**
2. **Kelas**
3. **Modul / LKPD**

Kelas dan Modul/LKPD baru aktif setelah Mapel dipilih. Isi tiap tingkat hanya pilihan yang ada pada tingkat di atasnya, lengkap dengan jumlah soal. Mengganti Mapel mengosongkan Kelas dan Modul; mengganti Kelas mengosongkan Modul bila modul itu tidak berada di kelas baru.

## Kesepakatan mapel dan kelas
| Mapel | Kelas | Modul/LKPD |
|---|---|---|
| Dasar-Dasar Teknik Otomotif | X | X-1 sampai X-6 (6 unit, 360 soal) |
| Kompetensi Keahlian Teknik Sepeda Motor | XI, XII | XI-1 sampai XI-8 (480 soal), XII-1 sampai XII-7 (420 soal) |
| Mapel lain | hanya bila soalnya punya kelas | tidak berlaku |

Mapel lain: Bahasa Indonesia (12), Matematika (14), Bahasa Inggris (9), Dasar TBSM (25), dan mapel yang diketik guru. Dasar TBSM sengaja tidak dimasukkan ke Dasar-Dasar Teknik Otomotif karena 25 soalnya tidak punya kelas dan isinya campuran materi Fase E dan F.

## Cara soal ditempatkan
- **Unit LKPD** (kolom `unit`, atau judul mapel berawalan "LKPD X-1 ...") menentukan mapel dan modul: unit X ke Dasar-Dasar Teknik Otomotif, unit XI dan XII ke Kompetensi Keahlian Teknik Sepeda Motor.
- Tanpa unit: nama mapel yang sama dengan judul di atas, dengan elemen CP-nya, atau dengan elemen master Administrasi Akademik ikut mapel induknya (huruf besar/kecil dan spasi ganda diabaikan).
- **Kelas** diambil dari kolom kelas soal; bila kosong dan soalnya punya unit, dari tingkat unitnya.
- Soal tanpa kelas ada di pilihan **Tanpa kelas**; soal tanpa unit di pilihan **Tanpa modul/LKPD**. Jadi setiap soal bisa dijangkau dan jumlah semua pilihan di satu tingkat sama dengan jumlah tingkat di atasnya.

## Elemen CP
Tetap ada sebagai dropdown tambahan di bawah Modul/LKPD (Kepka BSKAP 046/H/KR/2025). Jumlah soal per elemen mengikuti pilihan Mapel, Kelas, dan Modul di atasnya, dan pilihan elemen yang tidak punya soal pada kombinasi baru dikosongkan otomatis. Keterangan CP pada kartu soal dan urutan soal menurut elemen tidak berubah (`js/bank-cp.js`, data `js/cp-peta.js`).

## Yang ikut mengikuti filter
Daftar kartu, tombol **Ekspor Excel (n)**, dan **Cetak soal** memakai daftar yang sama. Tanpa filter apa pun, daftar tetap menampilkan petunjuk (aturan `bank-filter.js`), sehingga memilih Mapel sudah cukup untuk menampilkan soal.

## Cakupan
Hanya halaman Bank soal untuk guru dan admin. Latihan siswa dan pemilihan mapel di sesi ujian tidak diubah. Data soal tidak diubah, tidak ada koleksi Appwrite baru.

## Berkas
- `js/bank-bertingkat.js` (baru): logika, tampilan, dan penyaring. Dimuat setelah `bank-cp.js`, sebelum `bank-filter.js`.
- `js/bank-cp.js`: dropdown gabungan dihapus; logika CP tetap, dibagikan lewat `BSCP`.
- `js/bank-filter.js`: filter Mapel bertingkat dihitung sebagai filter aktif; petunjuk disesuaikan.
- `index.html`, `service-worker.js`: skrip baru terdaftar (distempel `tools/rilis.mjs`).
