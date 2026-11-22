# Pembeda LKPD mode Latihan dan mode Ujian

Berkas: `js/lkpd-pandu.js` (logika baru), pengait kecil di `js/lkpd-mode.js`, `js/lkpd-staff.js`, `js/lkpd-editor.js`, `js/lkpd-drive.js`. Uji: `node tools/uji-pandu.mjs`. Tidak ada perubahan Appwrite: pengaturan baru disimpan pada objek LKPD seperti pengaturan mode yang sudah ada.

## 1. Latihan berpemandu, Ujian mandiri
- **Latihan** (opsi guru "Latihan berpemandu", bawaan aktif): tab Lembar Kerja diawali kartu panduan hijau. Petunjuk komponen dan poin kritis langkah tampil penuh. Angka acuan standar tidak langsung tampak: siswa membukanya lewat tombol **Bantuan: lihat angka acuan** setelah mencoba sendiri.
- **Ujian**: kartu oranye "Ujian mandiri" memuat aturan (tanpa petunjuk dan angka acuan, cari standar di manual servis, langkah saksi guru harus disaksikan guru, jumlah kesempatan). Angka acuan **selalu** disembunyikan saat Ujian, terlepas dari sakelar "Petunjuk komponen". Opsi **Foto bukti wajib pada semua komponen (Ujian)** menambah foto wajib ke semua komponen pemeriksaan (di luar daftar foto wajib biasa).
- Berlaku untuk LKPD v2 pada tampilan siswa dan Pratinjau guru.

## 2. Gerbang Latihan ke Ujian
- Pengaturan LKPD berstatus **Ujian** punya bagian "Gerbang Latihan ke Ujian": pilih LKPD Latihan prasyarat (satu kelas) dan syarat **KKM 1 kali** atau **2 kali berturut-turut**. Hanya nilai Latihan siswa yang bersangkutan yang dihitung (nilai koreksi guru bila ada).
- Selama belum terpenuhi, kartu Ujian menampilkan "Latih lagi n/N" dan tombol **Buka latihan**; Ujian tidak bisa dibuka maupun dikirim. Bila terpenuhi tampil "Siap ujian".
- **Remedial:** bila Ujian terakhir siswa belum kompeten (di bawah KKM), hanya nilai Latihan **sesudah** Ujian itu yang dihitung, sehingga siswa harus berlatih lagi sebelum mengulang. Tombolnya berubah menjadi "Latihan terarah (remedial)". Batas kesempatan Ujian tetap berlaku.
- Guru tidak terkena gerbang. Bila LKPD Latihan rujukan tersembunyi atau dihapus, gerbang dilewati supaya siswa tidak terkunci selamanya.
- Tombol **Buat salinan Latihan dari LKPD ini** membuat LKPD baru (id `<id>-L`, judul "(Latihan)", mode Latihan, tampil, tanpa kunci pertemuan) lengkap dengan isinya, lalu memilihnya sebagai gerbang. Pengaturan baru tersimpan setelah **Simpan pengaturan**.
- Gerbang tidak ikut saat "Terapkan ke semua LKPD" (gerbang khusus per LKPD).

## 3. Paket cepat
Tombol **Paket Latihan** dan **Paket Ujian** di atas panel Pengaturan mengisi semua opsi sekaligus (belum tersimpan sampai Simpan pengaturan; jadwal dan status tampil tidak diubah).
- Paket Latihan: mode Latihan, tanpa batas kesempatan, kunci dan pembahasan tampil, panduan aktif, tanpa gerbang, foto semua komponen mati.
- Paket Ujian: mode Ujian, 1 kesempatan, teori, penjelasan langkah, dan petunjuk disembunyikan, kunci tidak tampil, foto bukti wajib pada semua komponen. Gerbang yang sudah dipilih tidak dihapus.

## 4. Catatan
- Gerbang dan penghitungan memakai data pengumpulan di perangkat (`S.lkpd`), sama seperti penghitung kesempatan Ujian. Ini penegak di sisi aplikasi, bukan di server.
- Pengaturan baru: `gerbang`, `gKali`, `fotoUjian`, `pandu` pada objek LKPD.
