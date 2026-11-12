# Bank soal (v41, bentuk soal mengikuti acuan TKA)

Fitur terpisah dari LKPD. Menu: **Bank soal** (semua peran).

## Siswa
- **Latihan**: pilih mapel, jenis soal, dan jumlah. Tanpa batas waktu. Tombol *Periksa jawaban* menampilkan benar/salah dan pembahasan per soal. Hasil masuk Riwayat.
- **Ujian**: sesi dari guru untuk kelas siswa. Satu kali pengerjaan, timer mundur, soal dan pilihan diacak. Waktu tetap berjalan bila aplikasi ditutup; jawaban dikirim otomatis saat waktu habis. Berpindah dari halaman ujian dicatat (terlihat guru). Pembahasan tampil bila guru mengaktifkannya.
- **Riwayat**: semua latihan dan ujian, dengan detail jawaban sesuai aturan di atas.

## Guru dan Admin
- **Bank soal**: 60 soal bawaan (40 PG, 10 PG kompleks, 10 PG kategori). Atur *Peruntukan* tiap soal: Latihan, Ujian, atau Latihan dan ujian. Soal bisa dinonaktifkan. Soal bawaan tidak diubah isinya, tetapi bisa **Salin dan ubah**. **Tambah soal sendiri** (PG, PG kompleks, PG kategori) lengkap dengan kelas, topik, dan pembahasan.
- **Sesi ujian**: judul, kelas, durasi, KKM, jadwal buka/tutup (opsional), pilih soal otomatis (jumlah dan batasan mapel; tiap siswa mendapat soal berbeda) atau pilih soal sendiri, acak, tampilkan pembahasan.
- **Hasil**: filter per sesi atau latihan, nilai, status Kompeten, jumlah keluar halaman, detail jawaban, hapus hasil (siswa bisa mengulang sesi), **ekspor Excel**.

## Penilaian
- PG: benar = 1, salah = 0.
- PG kompleks: (kunci terpilih − pilihan salah) ÷ jumlah kunci, minimal 0.
- PG kategori: jumlah pernyataan yang tepat ÷ jumlah pernyataan.
- Nilai = jumlah skor ÷ jumlah soal × 100, dibulatkan.

## Pemasangan
1. Zip ini hanya berisi berkas yang berubah. Jalankan `unzip -o` di folder `~/tbsm`, lalu `git add . && git commit && git push`.
2. Buat koleksi Appwrite (sekali saja), dari folder proyek di Termux:
   `node tools/setup-appwrite.mjs --only=banksoal,soal_sesi,soal_hasil`
   Hapus API key setelah selesai.
3. Buka aplikasi, menu **Perbarui aplikasi** (versi `tbsm-v41`).

## Koleksi dan izin
| Koleksi | Isi | Baca | Tulis |
|---|---|---|---|
| `banksoal` | soal buatan guru dan pengaturan peruntukan soal bawaan | semua pengguna login | label guru/admin |
| `soal_sesi` | sesi ujian | semua pengguna login | label guru/admin |
| `soal_hasil` | hasil latihan dan ujian | guru/admin, siswa hanya miliknya | siswa membuat; guru/admin ubah dan hapus |

Catatan keamanan: kunci jawaban ikut terunduh ke peramban karena penilaian dilakukan di aplikasi, sama seperti LKPD. Cocok untuk latihan dan ujian harian. Untuk ujian bertaruhan tinggi gunakan Appwrite Function untuk menilai di server.

## Mode offline
Latihan dan ujian yang sedang berjalan tersimpan di perangkat. Hasil yang belum terkirim diantre dan dikirim saat online. Menu Segarkan data juga memuat ulang bank soal.

## Impor dan ekspor soal (v47)
Hanya Guru dan Admin, di tab **Bank soal** (tombol Impor soal, Template, Ekspor Excel). Berkas: `js/banksoal-io.js`. Tidak ada perubahan koleksi Appwrite.
- **Ekspor Excel**: mengekspor soal yang sedang tampil sesuai filter (filter kosong = semua soal, termasuk bawaan). Berisi sheet Soal dan Petunjuk. File ini bisa diedit lalu diimpor ulang.
- **Template**: file `templates/Template_Impor_Bank_Soal.xlsx` berisi tiga soal contoh dan petunjuk kolom. Kolom Jenis, Kelas, Peruntukan, dan Status berupa dropdown. Kolom Mapel berupa dropdown dari mapel yang ada, tetapi boleh diketik bebas untuk mapel baru. Daftar mapel ada di sheet Daftar; tambahkan di sana bila ingin muncul di dropdown. Hapus baris contoh sebelum impor.
- **Impor**: .xlsx, .xls, atau .csv, maksimal 500 baris. Pratinjau dulu (baru, diperbarui, dilewati, ditolak beserta alasan per baris), lalu tekan Terapkan.
- Kolom: ID, Jenis, Mapel, Topik, Kelas, Peruntukan, Status, Soal, A sampai E, Kunci, Label 1, Label 2, Pernyataan 1-6, Kunci 1-6, Pembahasan.
- ID kosong = soal baru. ID soal sendiri yang sudah ada = soal diperbarui. ID soal bawaan (tka-...) = hanya Peruntukan, Kelas, dan Status yang berubah.
- Soal baru yang jenis, mapel, dan teksnya sama dengan soal yang sudah ada dilewati, jadi aman bila file diimpor dua kali.
- Kunci PG: satu huruf (B). PG kompleks: beberapa huruf (A,C). PG kategori: isi Label 1 atau Label 2 (atau 1 / 2) pada Kunci 1-6.
