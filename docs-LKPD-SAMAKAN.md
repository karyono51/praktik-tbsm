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
