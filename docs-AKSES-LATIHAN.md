# Akses latihan dibuka guru

CBT tetap **mode aman** (`CBT_AMAN:true`, Neon). Perubahan ini hanya mengatur siapa yang boleh memulai latihan dan kapan bank soal dibaca dari Appwrite.

## Siswa
- **Latihan**: tombol Mulai latihan hanya tampil bila ada akses latihan yang dibuka guru untuk tingkat kelasnya dan sedang berlaku (aktif, dalam jadwal). Selain itu tampil "Latihan belum dibuka oleh guru".
- **Ujian**: tidak berubah. Sesi harus aktif dan dalam jadwal; token, SEB, dan Exambro mengikuti pengaturan sesi.
- Latihan yang sudah berjalan di perangkat tetap bisa dilanjutkan dan dikirim bila akses ditutup di tengah jalan.

## Guru dan admin
CBT Online, tab **Sesi**, kartu **Akses latihan siswa** (di atas daftar sesi):
- **Buka akses latihan**: pilih Semua kelas, X, XI, atau XII; isi waktu mulai dan tutup bila perlu (opsional). Tanpa jadwal, akses berlaku sampai ditutup.
- **Tutup / Buka**: menonaktifkan atau mengaktifkan lagi tanpa menghapus.
- **Hapus**: menghapus akses (dengan konfirmasi).
Akses mengikuti sekolah akun (sama seperti sesi ujian).

## Alur baca Appwrite siswa
| Saat | Dibaca |
|---|---|
| Login/Beranda | `sesi`, `hasil` milik sendiri, dan data login lain (hasil, LKPD, modul LKPD) |
| Ada akses (latihan dibuka, ujian terbuka/terjadwal belum dikerjakan, pengerjaan belum selesai) | ditambah `soal` (bank soal) |
| Tanpa akses | `soal` **tidak dibaca**; salinan lama di perangkat tidak dipakai |
Pembacaan berikutnya tetap bertahap (hanya dokumen yang berubah, penuh tiap 6 jam). Staf membaca `soal` seperti biasa. Bila akses dibuka saat siswa sudah di halaman, ketuk Segarkan; bank soal dibaca setelahnya.

## Penyimpanan
Dokumen `soal_sesi` dengan `payload.jenis='latihan'` dan `kelas` (`ALL`, `X`, `XI`, atau `XII`); kolom lain dikosongkan (`durasi`, `jumlah`, `kkm` = 0). Di perangkat disimpan di `BS.D.lat` (`tbsm-bs-lat`), terpisah dari `BS.D.sesi`, sehingga daftar sesi ujian, Pengawas, dan pra-unduh tidak berubah.

## Batas
- Gerbang berlaku di aplikasi (klien). Fungsi server `cbt` belum memeriksa akses saat latihan dikirim, jadi ini pengendali alur, bukan pengaman terhadap pengguna yang memodifikasi klien.
- Akses per rombel atau per siswa belum ada (hanya per tingkat kelas).
- Uji: `node tools/uji-akses-latihan.mjs`.

## Penutupan jalur (catatan)
- Atur latihan hanya tampil bila `bsLatBuka()`; pintasan Beranda dan pemulihan draf ikut diperiksa.
- Hapus akses = tandai `aktif:false` dan `hapus:true` (dokumen tetap di server agar perangkat siswa tahu lewat pembacaan bertahap).
- Akses hanya berlaku bila tanggal/jam perangkat benar; sesi yang sudah lewat jadwal otomatis tertutup.
