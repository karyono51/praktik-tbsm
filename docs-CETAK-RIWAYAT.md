# Cetak riwayat latihan siswa

Berkas baru: `js/cetak-riwayat.js` (dimuat setelah `cetak-soal.js`). Tidak ada perubahan koleksi Appwrite dan tidak ada perubahan pada `banksoal.js`.

## Cara pakai
Bank soal > **Riwayat latihan siswa** (guru/admin). Atur filter **Cari nama siswa**, **Kelas**, dan **Mapel**, lalu ketuk **Cetak riwayat sesuai filter**. Di dialog cetak ponsel pilih *Simpan sebagai PDF* bila ingin berkas.

## Isi cetakan (A4 landscape)
- Kop sekolah aktif (nama, program, alamat, logo) dan judul **Riwayat Latihan Siswa**.
- Keterangan filter (Nama siswa, Kelas, Mapel; "Semua" bila kosong), jumlah latihan, rata-rata nilai, nilai tertinggi dan terendah.
- Tabel: No, Nama siswa, Kelas, Mapel/modul, Waktu, Benar/Total, Durasi, Nilai. Urutan sama dengan layar (terbaru di atas), kepala tabel diulang di tiap halaman.
- Yang dicetak **semua** latihan yang cocok dengan filter, bukan hanya yang tampil di layar (layar menampilkan 20 lalu "Tampilkan lebih banyak").
- Bila tidak ada yang cocok, tercetak keterangan kosong.

Data mengikuti aturan sekolah yang sama dengan layar (`schHasilOk`), jadi guru hanya mencetak siswa sekolahnya.
