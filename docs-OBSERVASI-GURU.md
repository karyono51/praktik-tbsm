# Observasi Guru

Menu **Observasi guru** (Admin dan Guru) untuk supervisi pembelajaran di kelas dan bengkel praktik. Siswa tidak melihat menu ini.

## Isi formulir
- Identitas: guru (pilih dari akun berperan Guru, atau ketik manual), mata pelajaran/kompetensi keahlian, kelas, tanggal, jenis pembelajaran, jam ke-, materi.
- 16 butir dalam 4 bagian (Perencanaan, Pembukaan, Kegiatan Inti, Penutup), skor 1-4 (4 Sangat baik, 3 Baik, 2 Cukup, 1 Kurang), catatan opsional per butir.
- Kekuatan, hal yang perlu ditingkatkan, rekomendasi tindak lanjut.
- Nilai = total skor / 64 x 100. Kategori dari rata-rata skor: 3,5-4 Sangat Baik, 2,5-3,4 Baik, 1,5-2,4 Cukup, di bawah 1,5 Kurang.

## Hak akses
- Admin melihat, mengubah, dan menghapus semua observasi, serta mengunduh Excel.
- Guru hanya melihat dan mengelola observasi yang ia isi sendiri.
- Guru yang diamati belum bisa membuka hasilnya di aplikasi; bagikan lewat PDF.

## Ekspor
- **PDF** per observasi (berkop sekolah, tanda tangan pengamat dan guru).
- **Excel** rekap semua observasi yang terlihat, lengkap dengan skor tiap butir.

## Penyimpanan
- Mode lokal: `localStorage` kunci `tbsm-observasi`.
- Mode Appwrite: koleksi `observasi` (lihat `appwrite.json`), jalankan `appwrite push collections`. Izin koleksi: buat untuk label `guru` dan `admin`; baca, ubah, hapus untuk label `admin`. Dokumen memakai *document security*: pembuat otomatis dapat baca, ubah, hapus dokumennya sendiri. Pastikan akun guru diberi label `guru`.
- PWA: observasi yang dibuat saat offline diantre dan dikirim saat online, sama seperti nilai.
- Jika koleksi belum dibuat di Appwrite, aplikasi tetap berjalan; daftar observasi hanya kosong.

## Observasi praktik siswa
Menu kedua, **Observasi praktik siswa**, memakai mesin dan koleksi yang sama (`observasi`) dengan kolom `tipe` = `siswa`. Observasi guru lama (tanpa `tipe`) dianggap `guru`.
- Identitas: siswa (pilih dari akun berperan Siswa, kelas terisi otomatis, atau ketik manual), unit/pekerjaan praktik, kelas, tanggal, tempat praktik, jam ke-, kompetensi/jobsheet.
- 16 butir dalam 4 bagian: Persiapan Kerja, Proses Kerja, Hasil Kerja, Sikap Kerja. Skor 1-4, nilai, dan kategori dihitung sama seperti observasi guru.
- Penyimpanan: nama siswa disimpan di kolom `guru`, id akun siswa di `guruId`, unit praktik di `mapel`. Hak akses sama: Admin melihat semua, Guru hanya miliknya.
- Atribut `tipe` (string 8, tidak wajib) perlu ada di koleksi `observasi` pada mode Appwrite.
