# Sesi ujian: satu tingkat, beberapa rombel

Satu sesi dipakai untuk **satu tingkat** (X, XI, atau XII) yang terdiri dari beberapa rombel, bukan lintas tingkat.

## Di formulir sesi
1. **Kelas peserta**: pilih salah satu: Semua kelas, Kelas X, Kelas XI, atau Kelas XII.
2. Setelah satu tingkat dipilih, muncul kotak **Rombel kelas X** (dst.) berisi rombel aktif tingkat itu untuk sekolah sesi, lengkap dengan jumlah siswa. Rombel dibuat di Administrasi Akademik (Kelas).
3. Centang rombel yang ikut (mis. X TSM 1 dan X TSM 2). **Semua rombel** mencentang semuanya, **Kosongkan** melepasnya.
4. Daftar peserta otomatis menjadi anggota rombel terpilih (daftar tetap, urut per rombel lalu nama). Tanpa centang, semua siswa tingkat itu ikut dan daftar dihitung dari tingkat seperti biasa.
5. Simpan sesi. Pilihan rombel ikut tersimpan, jadi muncul lagi saat sesi diubah. Kartu sesi menampilkan jumlah rombel.

## Perilaku
- Mengganti tingkat melepas rombel yang sudah dicentang, daftar peserta yang berasal dari rombel, dan penempatan ruang.
- Melepas semua centang mengembalikan daftar peserta ke hitungan dari tingkat. Daftar tetap yang dibuat manual (Bekukan daftar) tidak disentuh.
- Menambah atau mengeluarkan siswa manual (susulan) lalu mengubah centang rombel menyusun ulang daftar dari rombel, jadi susulan manual hilang.
- **Perbarui dari kelas** menarik ulang anggota rombel terpilih (bila siswa pindah rombel).
- Ruang dan gelombang tidak berubah: satu rombel boleh disebar ke beberapa ruang, dan tiap ruang menampilkan komposisi rombelnya.

## Sesi lama
Sesi yang dibuat untuk beberapa tingkat sekaligus (mis. X dan XII) tetap berjalan seperti semula. Di formulir muncul keterangan, dan nilainya hanya berubah bila memilih satu tingkat.

## Tidak ada perubahan server
Fungsi server sudah memakai daftar peserta tetap bila ada, jadi tidak perlu deploy ulang fungsi. Kolom baru `rmb` hanya ada di payload sesi.
