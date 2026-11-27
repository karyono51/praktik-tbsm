# Gerbang praktik UKK (kelas X dan XI)

Berkas: `js/ukk-gerbang.js`. Uji: `node tools/uji-ukk-gerbang.mjs` (78 pemeriksaan). Tidak ada perubahan skema Appwrite.

## Fungsi
Siswa harus lulus **gerbang praktik** sebelum memulai unit UKK. Aturannya disamakan dengan gerbang masuk LKPD v2 (`docs-LKPD-V2.md` bagian 4A):
- Gerbang adalah **syarat kelayakan masuk praktik, bukan komponen nilai UKK**. Nilai unit dan Nilai Akhir UKK tidak berubah.
- 5 soal bentuk TKA: **3 PG, 1 PG kompleks, 1 PG kategori**, berlevel Aplikasi atau Penalaran, dengan stimulus (data ukur atau kasus) di dalam soal.
- Penilai soal sama dengan LKPD (`lkqPoint`): PG benar 1, salah 0; PG kompleks (benar terpilih - salah terpilih) / jumlah kunci, minimal 0; PG kategori pernyataan tepat / jumlah pernyataan.
- **Nilai gerbang** = jumlah poin / 5 x 100 (dibulatkan). **KKM gerbang** = `max(75, S.kkm)`: KKM yang diatur di bawah 75 tidak dipakai. Soal yang belum dijawab bernilai 0, dan semua soal wajib dijawab sebelum Kirim.
- **Tanpa batas percobaan**: siswa boleh mengubah jawaban dan mengirim ulang sampai lulus.
- **Kunci dan pembahasan tidak tampil ke siswa**; hanya guru yang melihatnya di Pratinjau gerbang.

## Unit yang bergerbang
| Unit | Kelas | Isi soal |
|---|---|---|
| `UKK-X-1` Pengukuran Arus, Tegangan, dan Hambatan pada Rangkaian Lampu | X | multimeter VDC dan jack, rata-rata tiga kali ukur (standar min. 12,4 V), bahaya ammeter paralel, ohmmeter dan nol alat, kasus data rangkaian |
| `UKK-XI-1` Pemeriksaan Komponen Sistem CVT | XI | V-belt (nilai terkecil terhadap batas servis 17,5 mm), mangkok kopling (batas servis 112,5 mm), SST dan pegas puli sekunder, roller dan kanvas satu set, kasus keputusan Layak pakai atau Ganti |

Soal bawaan ada di `UKK_GERBANG` (kunci ID unit); guru dapat menggantinya lewat editor. Unit lain (UKK-1 sampai UKK-4) tidak bergerbang. Unit hasil **Duplikat** (ID baru) tidak membawa soal, tetapi gerbangnya dapat dibuat di editor (bagian Editor gerbang).

## Alur siswa
1. Di kartu unit, siswa melihat penanda **Gerbang praktik belum lulus** (atau **Gerbang lulus · nilai**) dan tombol Mulai latihan / Mulai ujian seperti biasa.
2. Saat tombol Mulai diketuk dan gerbang belum lulus, **layar gerbang** terbuka di atas aplikasi (bukan unit). Pesan kunci unit (jadwal belum dibuka, kesempatan habis) tetap tampil lebih dulu.
3. Siswa menjawab, mengetuk **Kirim jawaban** (ditolak bila ada soal kosong). Layar hasil menampilkan nilai, KKM, dan Lulus atau Belum lulus.
4. Lulus: tombol **Mulai latihan/ujian** menutup gerbang dan menjalankan unit. Belum lulus: **Perbaiki jawaban** membuka soal lagi dengan jawaban yang sudah ada.
5. Gerbang dikerjakan **sebelum** unit dimulai, sehingga tidak memakai waktu dan kesempatan ujian. Berlaku di mode Latihan dan Ujian.
- Tidak dihadang: guru/admin; siswa yang sudah punya pekerjaan berjalan (draf, tombol Lanjutkan); Ulangi (`redo`); unit tanpa gerbang.

## Penyimpanan dan penegakan
- Jawaban gerbang disimpan **di perangkat** (`localStorage` kunci `tbsm-ukk-gerbang-v1`, per akun dan per unit). Status lulus dihitung ulang dari jawaban tersimpan, jadi KKM yang naik ikut berlaku. Seperti penghitung kesempatan ujian, ini penegak di sisi aplikasi, bukan di server. Siswa yang pindah perangkat mengerjakan gerbang lagi (tanpa batas percobaan).
- Kunci soal ikut di berkas skrip (terbaca di sisi klien), sama dengan kunci soal LKPD lain.

## Sisi guru
- **Pratinjau gerbang**: tombol di kartu unit (Guru dan Admin). Hasilnya **tidak disimpan** dan memuat kunci serta pembahasan tiap soal.
- Saat siswa menyimpan hasil unit, nilai gerbang ikut ke rincian hasil (`payload.gb = {nilai, kkm, lulus}`). Di **Hasil penilaian** unit, baris tiap siswa menampilkan "Penilaian · Gerbang 80".

## Editor gerbang (guru dan admin)
Berkas: `js/ukk-gerbang-editor.js`. Uji: `node tools/uji-ukk-gerbang-editor.mjs`. Tidak ada perubahan skema Appwrite.

**Membuka.** Untuk unit UKK **kelas X dan XI** (bawaan, buatan sendiri, dan hasil Duplikat): tombol **Editor gerbang** di kartu unit, dan kartu **Gerbang praktik** di halaman Kelola unit (di atas tab Hasil penilaian dan Pengaturan). Unit kelas XII tidak punya editor gerbang. Siswa tidak melihat tombolnya.

**Aturan soal (maksimal 20 per unit, minimal 1 bila gerbang aktif):**
| Jenis | Pilihan atau pernyataan | Kunci |
|---|---|---|
| Pilihan ganda | 2 sampai 5 pilihan, tanpa pilihan kembar | tepat satu |
| PG kompleks | 3 sampai 5 pilihan | satu atau lebih |
| PG kategori | 2 sampai 8 pernyataan Benar/Salah | harus ada Benar dan Salah |
Pertanyaan maks. 1000 karakter, pilihan atau pernyataan maks. 300, pembahasan maks. 1500 (pembahasan boleh kosong). Level: Pemahaman, Aplikasi, Penalaran. Tiap soal yang belum lengkap diberi penanda dan alasannya; **Simpan gerbang** menolak daftar yang masih ada soal belum lengkap dan langsung membuka soal itu.

**Fitur:** tambah soal (3 jenis), edit, naik, turun, duplikat, hapus, kosongkan semua, **Muat soal bawaan**, **Kembalikan ke soal bawaan** (atau Hapus gerbang buatan bila unit tidak punya soal bawaan), saklar **Gerbang aktif** (dimatikan = siswa langsung masuk unit), dan **Pratinjau** yang memakai draf yang sedang diedit (memuat kunci dan pembahasan, tidak menyimpan apa pun).

**Penyimpanan.** Soal gerbang disimpan di dalam dokumen unit sebagai `doc.gerbang = {on, soal, v}`, jadi ikut sinkronisasi `lkpd_modules`, antrean offline, dan penyimpanan lokal yang sama dengan unit. Penyimpanan lewat `ukkStore`, yang kini juga memeriksa gerbang (maks. 20 soal, tiap soal sah). Urutan sumber soal gerbang: pratinjau draf, gerbang buatan guru, lalu soal bawaan `UKK_GERBANG`. `gerbang:null` berarti kembali ke bawaan. Menyimpan unit dari editor unit (Edit isi) **tidak menghapus** gerbang buatan: dokumen tanpa kolom gerbang mewarisinya. Unit bawaan yang gerbangnya diedit tersimpan sebagai salinan penimpa (tombol Kembalikan bawaan milik unit ikut muncul); Kembalikan bawaan di tingkat unit juga mengembalikan gerbangnya.

**Draf.** Perubahan yang belum disimpan tersimpan otomatis di perangkat (`tbsm-ukk-gerbang-draft`, 14 hari) dan ditawarkan untuk dipulihkan saat editor dibuka lagi.

**Jawaban siswa dan perubahan soal.** Rekaman jawaban siswa kini membawa tanda tangan soal (jenis, teks, pilihan, kunci; tanpa pembahasan). Bila guru mengubah teks, pilihan, kunci, atau urutan soal, jawaban lama tidak dipakai dan siswa mengerjakan gerbang lagi. Mengubah hanya pembahasan atau level tidak menghapus kelulusan. Rekaman lama tanpa tanda tangan tetap berlaku untuk soal bawaan, tetapi tidak untuk soal buatan guru.

**Batasan.** Hasil Duplikat unit tidak membawa soal gerbang (guru membuatnya sendiri di editor). Gerbang tetap diperiksa di sisi aplikasi dan kuncinya terbaca di sisi klien. Ekspor dan impor Excel unit tidak membawa soal gerbang. Soal bawaan di `UKK_GERBANG` tetap tidak diubah oleh editor; angka CVT dan multimeter pada soal bawaan perlu diperiksa terhadap manual sekolah.

## Mengubah soal bawaan
Soal bawaan ada di `UKK_GERBANG` dalam `js/ukk-gerbang.js`. Bila manual unit di sekolah berbeda, cukup ubah soalnya lewat editor (jadi soal buatan guru). Untuk mengubah bawaan itu sendiri, sesuaikan angka di soal CVT dan juga di unit (`data.js`), aturan angka (`ukk-aturan.js`), dan lembar observasi (`observasi-ukk.js`).
