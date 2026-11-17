# Edit LKPD disamakan dengan Edit UKK

Berkas baru: `js/lkpd-samakan.js` (dimuat setelah `ukk-kelola.js`). Tidak ada berkas lama yang diubah selain `index.html` dan `service-worker.js` (hasil `tools/rilis.mjs`).

## Halaman Kelola LKPD
- **Duplikat**: membuka editor berisi salinan (ID kosong, judul "(salinan)", status Draft). Centang Wajib foto ikut tersalin.
- **Kembalikan bawaan**: hanya untuk LKPD bawaan yang sudah punya salinan tersimpan (diedit atau pernah disembunyikan). Salinan dihapus sehingga isi asli aplikasi dipakai lagi. Perlu koneksi bila memakai Appwrite.
- **Hapus**: hanya LKPD buatan sendiri. Pengumpulan siswa tidak dihapus.

## Editor
- Tombol Kembali HP: langsung menutup bila belum ada perubahan, bertanya bila ada perubahan (draf tetap tersimpan di perangkat).
- Pindah menu, tab, atau kelas menutup editor yang belum berubah.
- ID baru ditolak bila sudah dipakai LKPD maupun unit UKK (keduanya satu koleksi `lkpd_modules`, ID sama akan saling menimpa).
- Ukuran dokumen dibatasi sekitar 450 KB, sama seperti UKK.
- Tab Pemeriksaan: centang **Wajib foto bukti** per baris. Ikut naik, turun, dan hapus bersama barisnya. Pengaturan lama (Foto bukti wajib per komponen) tetap berfungsi; yang tersimpan terakhir yang berlaku.

## Uji manual
1. Kelola LKPD > Duplikat > simpan: LKPD baru muncul sebagai Draft.
2. Edit LKPD bawaan > simpan > Kembalikan bawaan: isi kembali seperti semula.
3. Tab Pemeriksaan: centang Wajib foto pada satu baris, simpan, buka Pengaturan: komponen itu sudah tercentang.
4. Buat LKPD baru dengan ID yang sama dengan unit UKK (mis. UKK-1): muncul peringatan di tab Info.
5. Buka editor, tidak mengubah apa pun, tekan tombol Kembali HP: langsung keluar tanpa pertanyaan.

## Standar manual pada tabel pemeriksaan
- Tiap baris di tab Pemeriksaan punya kolom **Standar manual** (opsional, maks. 300 karakter), mis. `12,6–13,2 V`. Tempel banyak menerima format `Komponen | Kriteria | Standar manual`.
- Tersimpan sebagai elemen ketiga baris: `checks: [komponen, kriteria, standar]`. Baris tanpa standar tetap `[komponen, kriteria]`, jadi modul lama tidak berubah.
- Siswa melihat teks **Acuan: ...** di bawah kolom Standar manual (kolom isian siswa tetap ada); guru melihatnya juga di Detail pengumpulan. Perubahan kecil ada di `js/lkpd.js`.
- Catatan: impor Excel LKPD masih memakai dua kolom, jadi impor yang menimpa Pemeriksaan akan menghapus standar manual. Ekspor/impor belum disesuaikan.

## Cetak LKPD (js/lkpd-cetak.js)
- Tabel Hasil pemeriksaan: kolom **No** di depan.
- Keterangan komponen (kriteria) ditulis dalam kurung, huruf miring, dan lebih kecil dari nama komponen.
- Akhir lembar: tempat dan tanggal (tempat mengikuti kota sekolah aktif, tanggal dari isian Tanggal atau hari ini), lalu tanda tangan **Siswa Praktik** dan **Guru/Instruktur** tanpa garis tabel; nama (dari isian Nama siswa dan Guru/instruktur) tertulis di atas garis.

## Tombol Cetak di pratinjau
Saat guru/admin membuka Pratinjau, tombol **Cetak** muncul di samping Editor Guru (bilah ttindakan bawah memang disembunyikan pada pratinjau). Mencetak dari pratinjau tidak menyimpan draf apa pun.

## Cetak: akun staf, tanggal, dan baris identitas
- Akun admin/guru yang mencetak otomatis menjadi **Guru/instruktur** (identitas dan tanda tangan); Nama siswa dikosongkan. Siswa yang mencetak: namanya jadi Nama siswa.
- Dari pratinjau/akun staf, **Tanggal** dikosongkan (identitas dan baris tempat-tanggal di akhir, diberi garis titik untuk ditulis tangan).
- Identitas memakai tiga kolom (label, titik dua, nilai) sehingga baris kedua nilai yang panjang rata dengan huruf pertama nilai, bukan dengan titik dua.

## Cetak: akun staf, tanggal, dan baris identitas
- Akun admin/guru yang mencetak otomatis menjadi **Guru/instruktur** (identitas dan tanda tangan); Nama siswa dikosongkan. Siswa yang mencetak: namanya jadi Nama siswa.
- Dari pratinjau/akun staf, **Tanggal** dikosongkan (identitas dan baris tempat-tanggal di akhir, diberi garis titik untuk ditulis tangan).
- Identitas memakai tiga kolom (label, titik dua, nilai) sehingga baris kedua nilai yang panjang rata dengan huruf pertama nilai, bukan dengan titik dua.
