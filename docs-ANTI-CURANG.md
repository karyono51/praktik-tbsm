# Pencegahan pelanggaran dan kecurangan CBT di HP (v81)

Prinsip: pengaman di peramban bersifat **penghalang dan bukti**, bukan jaminan. Kode berjalan di HP siswa, jadi bisa dilewati
(misalnya memakai HP kedua). Karena itu aplikasi memakai lapisan: desain ujian, pencegahan, pendeteksian, lalu bukti untuk guru.

## Yang sudah ada sebelumnya
Token sesi, soal dan opsi diacak, penilaian dan kunci di server (mode aman), jam server, batas waktu, layar penuh wajib,
hitungan keluar halaman dengan aksi peringatan / kirim otomatis / kunci, layar tetap menyala, salin/potong/menu klik-kanan diblokir.

## Ditambahkan di v81
| Lapisan | Perubahan | Berkas |
|---|---|---|
| Deteksi | **Fokus hilang** (`blur` lebih dari 2,5 detik): layar terbelah, jendela melayang, panel notifikasi. Dihitung sebagai pelanggaran. | js/cbt.js |
| Deteksi | **Layar terbelah**: luas jendela mengecil di bawah 65% ukuran terbesar saat ujian (diabaikan saat keyboard layar aktif). | js/cbt.js |
| Bukti | **Log pelanggaran** `{waktu, jenis, lama}` (hidden, blur, split, fs, print), maks 40, tersimpan di catatan ujian dan tampil di CBT Online > Pantau dan hasil. | cbt.js, ujian-server.js, cbt-staf.js, fungsi server `simpan` |
| Pencegah | **Penanda air** nama + akun siswa di layar soal (menyulitkan foto layar dan tangkapan layar yang disebar). | cbt.js, banksoal.css |
| Pencegah | Blokir tempel, seret, pilih teks, tekan-lama pada soal; cetak (Ctrl+P) diblokir. | cbt.js, banksoal.css |
| Kebijakan | **Pakta integritas** pada konfirmasi mulai (Jangan Ganggu, tutup aplikasi lain, pelanggaran dicatat). | banksoal.js |

## Batas yang tidak bisa ditutup dari peramban
- Tangkapan layar dan rekam layar (hanya bisa diblokir aplikasi Android native seperti Exambro).
- HP/perangkat kedua, bantuan orang lain, AI di perangkat lain.
- Layar terbelah dan jendela melayang sebagian hanya terdeteksi, tidak bisa dicegah.
- iOS Safari tidak mendukung layar penuh untuk halaman web, jadi aturan "wajib layar penuh" sebaiknya dimatikan untuk siswa iPhone.

## Rekomendasi pengaturan sesi
- Batas keluar halaman 2 sampai 3, aksi **kunci** (guru membuka lewat Pantau) atau **kirim otomatis** untuk ujian penting.
- Acak soal dan opsi, durasi ketat, token sesi, mode CBT aman (`CBT_AMAN:true`).
- Pengawas melihat tab Pantau selama ujian; periksa catatan pelanggaran sebelum menetapkan nilai.
- Untuk ujian bernilai tinggi, kombinasikan dengan Exambro/layar tersemat Android (screen pinning) di perangkat ujian.
- Gunakan soal yang menuntut penalaran (studi kasus, gambar, diagram) bukan hafalan.

Penerapan fungsi server: deploy ulang `akun-admin` (atau `cbt`) agar `simpan` menerima `log`. Tanpa itu, log tetap
tampil di perangkat siswa tetapi tidak sampai ke Pantau pada mode aman.

## Mode Exambro (v82)
- `js/config.js` memuat `EXAMBRO_UA:'TBSM-EXAM'`. Pada konfigurasi Exambro (QR atau URL terenkripsi) isi **UserAgent** dengan kata yang memuat `TBSM-EXAM`, dan alamat aplikasi sebagai URL ujian.
- Sesi: centang **Wajib Exambro** di form sesi (bagian Pengamanan CBT). Siswa yang membuka dari Chrome atau peramban lain tidak bisa memulai ujian pada sesi itu.
- Di Exambro, **layar penuh wajib dilewati** (WebView sering tak mendukung layar penuh, sedangkan Exambro sudah mengunci aplikasi). Pelanggaran keluar halaman tetap dicatat.
- Mode CBT aman (`CBT_AMAN:true`): klien mengirim UserAgent dalam aksi `mulai`, dan fungsi server menolak bila tidak memuat kata penanda. Kata di server dapat diubah lewat variabel lingkungan fungsi `EXAMBRO_UA` (bawaan `TBSM-EXAM`) dan harus sama dengan di `config.js`. **Deploy ulang fungsi `akun-admin`** (atau `cbt`).
- Mode biasa (`CBT_AMAN:false`): pemeriksaan hanya di peramban siswa, jadi lebih mudah dilewati.
- UserAgent bisa dipalsukan oleh yang paham; anggap sebagai penghalang. Uji di 3-5 HP berbeda sebelum ujian sungguhan.
