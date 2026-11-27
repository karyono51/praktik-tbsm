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

Soal ada di `UKK_GERBANG` (kunci ID unit). Unit lain (UKK-1 sampai UKK-4) dan unit hasil **Duplikat** (ID baru) **tidak** bergerbang.

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

## Mengubah soal
Soal dan angka (batas servis, standar tegangan) ada di `UKK_GERBANG` dalam `js/ukk-gerbang.js`. Bila manual unit di sekolah berbeda, sesuaikan angka di soal CVT dan juga di unit (`data.js`), aturan angka (`ukk-aturan.js`), dan lembar observasi (`observasi-ukk.js`). Editor gerbang UKK di aplikasi belum ada.
