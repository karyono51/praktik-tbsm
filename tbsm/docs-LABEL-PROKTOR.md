# Label login proktor otomatis

Sebelumnya label `proktor`, `guru`, dan `admin` di Appwrite (Auth > Users > Labels) harus ditambahkan manual. Kini aplikasi menyamakannya dengan kolom peran.

## Cara kerja
- Simpan akun (admin, mode awan, ada email): label login akun itu otomatis disesuaikan. Pesan hasil muncul di kartu status Akun.
- Menu Akun > **Sinkron label login**: menyamakan semua akun aktif beremail sekaligus (berguna setelah impor Excel). Meminta konfirmasi, memproses maks 200 akun per panggilan.
- Peran yang dikelola: admin, guru, proktor. Peran siswa tidak memberi label. Label lain di akun dibiarkan.
- Akun yang belum punya login Appwrite dilewati ("belum punya akun login"). Ketuk Sinkron label setelah login dibuat.
- Admin tidak bisa mencabut label admin dari akunnya sendiri (server menolak).
- Hanya admin yang boleh. Server memeriksa label admin pemanggil.

## Pasang
1. Deploy ulang fungsi **akun-admin** (main.js berubah). Scope tetap `users.read` dan `users.write`.
2. `sh up.sh "label proktor"`, tunggu deploy hijau, ketuk Perbarui aplikasi dan Segarkan.
3. Jalankan **Sinkron label login** sekali untuk akun yang sudah ada.

## Catatan
- Jangan beri peran Guru pada akun yang hanya proktor: label `guru` memberi izin baca koleksi (lihat docs-PENGAWAS.md).
- Server menyimpan cache pengguna sampai beberapa detik, jadi label baru berlaku sesaat setelah disimpan; proktor sebaiknya masuk ulang.
- Uji: `node tools/uji-label.mjs`.
