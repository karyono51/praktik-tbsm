# Cetak riwayat latihan siswa

Berkas baru: `js/cetak-riwayat.js` (dimuat setelah `cetak-soal.js`). Tidak ada perubahan koleksi Appwrite dan tidak ada perubahan pada `banksoal.js`.

## Cara pakai
Bank soal > **Riwayat latihan siswa** (guru/admin). Atur filter **Cari nama siswa**, **Kelas**, dan **Mapel**, lalu ketuk **Cetak riwayat sesuai filter**. Di dialog cetak ponsel pilih *Simpan sebagai PDF* bila ingin berkas.

## Isi cetakan (A4 landscape)
- Kop sekolah aktif (nama, program, alamat, logo) dan judul **Riwayat Latihan Siswa**.
- Identitas dimulai dari **Kelas**, lalu **Mapel** ("Semua" bila filter kosong). Baris **Nama siswa** hanya muncul bila filter nama diisi. Di sisi kanan: jumlah latihan, rata-rata nilai, nilai tertinggi dan terendah.
- Tabel: No, **NIS** (setelah nomor; format 2627.1032 dari akun siswa, tanda - bila belum ada), Nama siswa, Kelas, Mapel/modul, Waktu, Benar/Total, Durasi, Nilai. Urutan sama dengan layar (terbaru di atas), kepala tabel diulang di tiap halaman.
- Yang dicetak **semua** latihan yang cocok dengan filter, bukan hanya yang tampil di layar (layar menampilkan 20 lalu "Tampilkan lebih banyak").
- Bila tidak ada yang cocok, tercetak keterangan kosong.

Data mengikuti aturan sekolah yang sama dengan layar (`schHasilOk`), jadi guru hanya mencetak siswa sekolahnya.
