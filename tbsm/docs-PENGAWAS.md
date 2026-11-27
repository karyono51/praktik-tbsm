# Rilis token, peran Proktor, dan log audit

Mengacu pada praktik CBT TKA: token dirilis pengawas saat ujian dimulai, pengawas tidak memegang kunci dan nilai, dan setiap aksi staf tercatat.

## 1. Rilis token
- Di form sesi (mode CBT aman) centang **Token dirilis pengawas**. Sesi baru memakainya secara bawaan. Sesi lama tetap memakai token tetap seperti sebelumnya.
- Kartu peserta tidak lagi mencetak token. Pengawas membacakannya saat ujian dimulai.
- Di **Pantau** (guru) atau **Ruang ujian** (proktor): **Rilis token** dengan masa berlaku 5 sampai 60 menit (server menerima 1 sampai 180). Siswa yang belum mulai hanya bisa masuk selama token berlaku. **Tutup token** menghentikannya sebelum waktunya.
- Siswa yang sudah mulai tetap bisa melanjutkan tanpa token (misalnya HP mati). Pemeriksaan tetap di server.
- Mengubah atau menyimpan sesi, serta **Ganti token**, menutup rilis yang sedang berjalan.
- Server menyimpan token di cache sampai 10 detik, jadi sesaat setelah rilis peserta mungkin masih ditolak. Minta mereka mencoba lagi.

## 2. Peran Proktor
Proktor tidak punya izin baca koleksi apa pun. Semua dilakukan lewat fungsi server:
- Boleh: merilis dan menutup token, melihat status peserta (nama, kelas, terjawab, sisa waktu, keluar halaman), tambah waktu 5 atau 15 menit, buka kunci, akhiri ujian siswa (menghentikan saja).
- Tidak boleh: melihat jawaban, kunci, nilai, soal; menilai, nilai ulang, hapus data.

Cara membuat akun:
1. Menu **Akun**, tambah akun, centang peran **Proktor** (boleh digabung dengan Siswa; kolom peran 64 karakter; instalasi lama perlu `node tools/perbesar-peran.mjs`, lihat docs-PERAN-GANDA.md), isi sekolah.
2. Appwrite Console > Auth > Users > akun tersebut > Labels: tambahkan `proktor`. **Jangan** beri label `guru`, karena itu memberi izin baca koleksi.
3. Atur sandi lewat menu Akun. Proktor masuk ke menu **Ruang ujian**.

Proktor hanya bisa memakai sesi di sekolahnya.

## 3. Log audit
- Menu **Pengaturan > Log audit** (admin). Memuat 300 catatan terbaru, bisa dicari.
- Dicatat server: rilis dan tutup token, tambah waktu, buka kunci, akhiri, nilai, nilai ulang, nilai uraian.
- Dicatat dari perangkat guru/admin (digabung per 2,5 detik): penghapusan nilai, catatan ujian, soal, sesi, akun, LKPD; perubahan sesi, akun, catatan ujian; ganti token.
- Token tidak pernah ditulis di log. Catatan perangkat bergantung pada koneksi dan klien, jadi bukan bukti hukum.
- Koleksi `audit`: baca hanya label `admin`; server menulis. Tidak ada izin ubah atau hapus dari aplikasi.

## Pemasangan (sekali)
1. `node tools/setup-appwrite.mjs --sync-izin` (membuat koleksi `audit`; atau tambahkan lewat Console dengan atribut di appwrite.json).
2. `node tools/gabung-cbt.mjs`, lalu deploy ulang fungsi **akun-admin** (atau `cbt` bila terpisah).
3. Perbarui aplikasi (`tbsm-update`), lalu **Segarkan**.
Sebelum langkah 1 dan 2 selesai, fitur lama tetap jalan; rilis token dan Ruang ujian baru berfungsi setelah fungsi server diperbarui.

## Pindah perangkat butuh izin pengawas

- Saat siswa mulai ujian, server mengikat catatan ujian ke satu perangkat (kode acak yang dibuat peramban, tanpa data pribadi).
- Muat ulang, atau menutup lalu membuka lagi di perangkat yang sama, tetap bebas tanpa token.
- Melanjutkan dari perangkat lain ditolak dengan pesan jelas. Pengawas menekan **Izinkan pindah perangkat** pada kartu siswa (Ruang ujian untuk proktor, Pantau untuk guru/admin). Izin berlaku 10 menit dan terpakai sekali.
- Setelah siswa pindah, perangkat lama tidak bisa lagi menyimpan atau mengirim jawaban.
- Log audit mencatat `run.izinPindah`, `run.pindahOk`, dan `run.pindahTolak` (penolakan menandakan token mungkin dibagikan).
- Batasan: kode perangkat berasal dari peramban, jadi ini penghalang terhadap token yang dibagikan, bukan jaminan mutlak. Siswa yang menghapus data peramban akan dianggap perangkat baru dan perlu izin.
- Perlu deploy ulang fungsi `akun-admin` (cbt.js ikut berubah) dan Perbarui aplikasi di perangkat.
