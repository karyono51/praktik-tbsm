# Absensi kehadiran dan praktik lewat barcode

Siswa punya barcode (QR) pribadi. Guru atau admin memindainya dengan kamera atau dari gambar di galeri untuk mencatat **Hadir**, dan memberi keterangan **Sakit / Izin / Alpa** untuk siswa yang tidak masuk. Dua jenis absensi terpisah: **Kehadiran** (kelas) dan **Praktik** (kegiatan praktik).

## Alur kerja
1. **Siswa**: buka menu **Barcode saya** (atau kartu di beranda siswa). Tampil kartu berisi QR, nama, kelas, dan NIS. Tombol **Simpan gambar** menyimpan kartu ke galeri supaya bisa dipakai tanpa membuka aplikasi.
2. **Guru/admin**: menu **Absensi** (juga ubin di beranda). Pilih **kelas**, **tanggal**, dan **jenis** (Kehadiran atau Praktik; untuk Praktik isi kegiatannya).
3. **Scan kamera**: arahkan ke barcode siswa. Tiap kode yang terbaca langsung mencatat Hadir, dengan bunyi dan getar. Kode yang sama diabaikan 2,5 detik; siswa yang sudah hadir tidak dicatat dua kali. Siswa dari kelas lain, akun nonaktif, atau QR asing ditolak dengan pesan.
4. **Scan dari galeri**: pilih satu atau beberapa gambar (kartu yang dikirim siswa, tangkapan layar). Satu gambar boleh memuat beberapa barcode. Hasilnya tampil di kartu Hasil pindai terakhir.
5. **Tidak masuk**: di tiap siswa ada tombol status Hadir, Sakit, Izin, Alpa (ketuk lagi untuk menghapus). Ikon **barcode** di baris siswa membuka lembar keterangan: status, catatan (misalnya "demam, surat dokter menyusul"), tanggal dan jenis, serta QR siswa. Tombol **Belum ada status → Alpa** menandai sisa siswa sekaligus setelah semua dipindai.
6. **Rekap dan Excel**: per kelas, bulan, dan jenis; jumlah H/S/I/A dan persen hadir tiap siswa. Ekspor Excel berisi sheet Rekap dan Harian.

Admin juga mendapat ikon barcode di tiap baris siswa pada menu **Akun**; isinya sama dengan lembar keterangan.

## Isi barcode
`TBSM|<id akun>|<cek>`. `cek` (4 karakter) hanya mencegah QR sembarang terbaca sebagai siswa; ini bukan pengaman. Barcode yang dibagikan bisa dipakai orang lain, jadi guru tetap mencocokkan orang di kelas.

## Penyimpanan
Tanpa koleksi atau atribut Appwrite baru. Sesi disimpan di koleksi `observasi` (`S.observasi`) dengan `tipe='absen'`: satu dokumen per **guru + kelas + tanggal + jenis** (`ab-<yymmdd>-<h|p>-<kelas>-<hash guru>`), isi `payload` = status semua siswa pada sesi itu (`{rows:{<id siswa>:{s:'H|S|I|A',t:waktu,m:'s|m',c:catatan}},ket}`). Kolom `skor` = jumlah hadir, `kategori` = `hadir` atau `praktik`.
- Sinkron, antrean offline, dan Cek sinkronisasi ikut jalur observasi. Mencatat absensi bisa dilakukan offline.
- Hak akses mengikuti observasi: guru melihat sesinya sendiri, admin semua. Kepala Sekolah tidak mencatat absensi.
- Daftar Observasi guru/LKPD/UKK tidak menampilkan sesi absensi (`obsTipe` mengembalikan `absen`).
- Satu sesi memuat sampai sekitar 200 siswa (batas payload 20.000 karakter); kelas 45 siswa memakai sekitar 3-4 KB.
- Siswa belum bisa melihat riwayat absensinya sendiri di aplikasi, karena siswa tidak punya izin baca koleksi `observasi`.

## Pemindai dan peramban
Pemindai memakai `BarcodeDetector` bawaan peramban: Chrome dan Edge di Android serta desktop. Peramban yang belum mendukung (umumnya Safari/iPhone) tidak bisa memindai; guru memakai tombol status manual. Kamera membutuhkan https dan izin kamera. QR dibuat sendiri oleh `js/qr.js` (tanpa pustaka luar, jalan offline).

## Berkas
- `js/qr.js` pembuat QR (mode byte, koreksi galat M, versi 1-20). Diperiksa dengan pembaca QR OpenCV untuk semua versi.
- `js/absensi.js` seluruh fitur; dimuat setelah `observasi-ukk.js`. `js/menu-dasbor.js` (kelompok Absensi dan Barcode saya) dan `js/views.js` (ubin beranda) disesuaikan.
- Uji: `node tools/uji-absensi.mjs`.
