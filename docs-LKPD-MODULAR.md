# Arsitektur LKPD Modular — KBM Praktik TBSM

Mesin LKPD dipisahkan dari inti aplikasi. Autentikasi, peran, roster, navigasi, PWA, rekap dan ekspor tetap memakai sistem TBSM. Konten praktik disimpan sebagai data pada `LKPD_MODULES` di `js/lkpd.js`; renderer, penyimpanan, penilaian, dan pengumpulan bersifat generik.

## Modul pertama
`X-1` — Pemeriksaan Baterai dan Sistem Starter, Fase E Kelas X, target 45 menit. Berisi tujuan, teori, K3, tahapan praktik, tabel pemeriksaan, diagnosis, evaluasi, refleksi, dan pengumpulan.

## Menambahkan modul berikutnya
Tambahkan objek baru pada registry `LKPD_MODULES` dengan ID unik dan bentuk struktur data yang sama: `objectives`, `theory`, `safety`, `steps`, `checks`, `symptoms`, dan `quiz`. Renderer tidak perlu diubah. Pada iterasi berikutnya, registry ini dapat dipindahkan ke menu pengelolaan modul guru sehingga penambahan dilakukan tanpa mengedit kode.

## Data dan sinkronisasi
Pengumpulan disimpan pada koleksi Appwrite `lkpd` dengan metadata modul, siswa, nilai praktik/teori/akhir, status, dan `payload` JSON. Mode lokal memakai localStorage. PWA memasukkan data tertunda ke antrean dan menyinkronkan saat online. Jalankan `appwrite push collections` setelah meninjau `appwrite.json` untuk membuat koleksi baru.

## Keamanan
Koleksi mengikuti pola izin koleksi `hasil` yang sudah ada: pengguna login dapat membaca koleksi. Filter siswa pada UI bukan kontrol akses server. Untuk produksi, aktifkan document security/izin per dokumen atau gunakan Appwrite Function untuk validasi pemilik dan peran guru. Nilai otomatis adalah umpan balik formatif; guru memverifikasi bukti praktik. Kode SKKNI harus dicocokkan dengan dokumen resmi sebelum dipakai sebagai klaim sertifikasi.
