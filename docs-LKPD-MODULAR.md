# Arsitektur LKPD Modular — KBM Praktik TBSM

Mesin LKPD terpisah dari inti aplikasi. Autentikasi, peran, roster, navigasi, rekap nilai, ekspor, PWA, dan antrean offline tetap menggunakan sistem TBSM. Konten setiap modul adalah data dengan kontrak yang konsisten; renderer siswa tidak perlu diubah saat guru menambah modul.

## Modul bawaan

21 modul bawaan, satu untuk setiap unit ujian praktik: `X-1` sampai `X-6` (Fase E), `XI-1` sampai `XI-8`, dan `XII-1` sampai `XII-7` (Fase F). `X-1` ada di `js/lkpd.js` sebagai acuan format; `X-2` sampai `XII-7` ada di `js/lkpd-modul.js`. Durasi, kelas, dan kode SKKNI mengikuti data unit ujian di `js/data.js`. Angka spesifikasi (torsi, celah, tekanan, tegangan) sengaja tidak ditulis; siswa wajib membaca buku manual servis unit yang dipakai. Posisi opsi soal diputar otomatis agar kunci jawaban tersebar merata. Modul bawaan dapat diedit atau diduplikasi; hasil edit disimpan sebagai salinan di penyimpanan modul dan tidak mengubah berkas bawaan. Modul bawaan tidak dapat dihapus, hanya dijadikan draft. Data pengumpulan lama tidak dihapus saat modul diedit.

## Menggunakan Editor LKPD Guru

1. Login sebagai akun yang memiliki peran Guru atau Admin, lalu buka **LKPD praktik > Editor Guru**.
2. Pilih **Modul baru** atau **Duplikasi** pada modul yang sudah ada.
3. Isi ID unik (2–32 karakter: huruf, angka, garis bawah, atau tanda hubung), judul, fase, kelas, objek praktik, alokasi waktu, dan kode standar bila relevan.
4. Isi bagian konten. Untuk data berbaris, gunakan satu baris per item:
   - Teori: `Topik | Penjelasan`
   - Langkah kerja: `Menit | Judul langkah | Instruksi`
   - Tabel pemeriksaan: `Komponen | Kriteria pemeriksaan`
   - Tujuan, alat-bahan, K3, dan gejala: satu item per baris.
   - Soal: JSON array, contoh: `[ {"q":"Apa fungsi baterai?","o":["Menyimpan energi","Mendinginkan mesin"],"a":0,"e":"Baterai menyimpan energi listrik."} ]`. `a` adalah indeks jawaban benar dimulai dari 0.
5. Jumlah menit pada seluruh langkah harus sama dengan alokasi waktu modul. Atur bobot praktik (langkah, K3, pemeriksaan, analisis) sehingga total tepat 100%. Atur bobot nilai akhir praktik + teori sehingga total tepat 100%.
6. Tentukan validasi wajib dengan daftar kunci yang dipisahkan koma: `vehicle,evidence,cause,conclusion,atLeastOneCheck`. Kosongkan jika validasi tidak diperlukan. Kunci yang dikenal: `vehicle`, `evidence`, `cause`, `conclusion`, `atLeastOneCheck`.
7. Simpan sebagai Draft untuk disiapkan, atau Terbit dan aktifkan agar terlihat oleh siswa. Gunakan **Pratinjau** untuk melihat tampilan siswa. Pengumpulan dinonaktifkan selama pratinjau.
8. Edit, duplikasi, ubah status, atau hapus modul dari daftar editor. Penghapusan memerlukan konfirmasi dan tidak menghapus pengumpulan lama.

## Kontrak data modul

Setiap modul memiliki `id`, `title`, `fase`, `kelas`, `unit`, `duration`, `skkni`, `status`, `active`, `objectives[]`, `theory[[topik,uraian]]`, `tools[]`, `safety[]`, `steps[[judul,menit,instruksi]]`, `checks[[komponen,kriteria]]`, `symptoms[]`, `quiz[{q,o[],a,e}]`, `rubric{steps,safety,checks,analysis,practiceWeight,theoryWeight}`, dan `validation{...}`. Editor membentuk dan memvalidasi objek ini sebelum menyimpannya. Penambahan modul tidak memerlukan perubahan renderer atau core aplikasi.

## Penyimpanan dan sinkronisasi

- **Mode lokal:** modul disimpan di `localStorage` dengan key `tbsm-lkpd-modules`. Data hanya tersedia pada browser/perangkat yang sama.
- **Mode Appwrite:** modul disimpan pada koleksi `lkpd_modules`, terpisah dari koleksi pengumpulan `lkpd`. Konten lengkap berada pada atribut `payload`; atribut metadata digunakan untuk indeks dan status.
- **Offline:** perubahan modul yang belum tersinkron dimasukkan ke antrean PWA dan dikirim saat koneksi kembali. Cache service worker saat ini `tbsm-v19`.
- **Pengumpulan:** tetap masuk ke koleksi `lkpd` dan rekap nilai `hasil` dengan `jobId` sama dengan ID modul.

## Migrasi Appwrite dan izin server

1. Backup database Appwrite terlebih dahulu.
2. Tinjau `appwrite.json`, lalu jalankan `appwrite push collections` (atau buat koleksi `lkpd_modules` manual dengan atribut dan indeks yang sama). Jangan jalankan deployment sebelum koleksi tersedia.
3. Di Appwrite Console > Auth > Users > Labels, buat label `lkpd-editor`.
4. Berikan label `lkpd-editor` hanya kepada akun Guru/Admin yang memang boleh mengelola modul. Label ini adalah izin server; peran yang hanya tersimpan di kolom `akun.peran` tidak otomatis memberi hak tulis Appwrite.
5. Koleksi `lkpd_modules` mengaktifkan document security. Izin koleksi membatasi CRUD ke label `lkpd-editor`. Dokumen Draft hanya dapat dibaca label tersebut. Dokumen Terbit dan aktif diberi izin baca untuk pengguna yang login (`Role.users`), sementara ubah/hapus tetap untuk label editor.
6. Uji menggunakan akun siswa dan guru terpisah: siswa hanya dapat membaca modul terbit; siswa tidak dapat membuat, mengubah, menerbitkan, atau menghapus modul. Guru/Admin berlabel dapat mengelola modul. Jika kebutuhan role lebih kompleks, gunakan Appwrite Function sebagai API tepercaya untuk memeriksa role di server dan menulis dokumen.
7. Setelah deploy, uji login, daftar modul, penerbitan, perubahan izin, dan sinkronisasi offline. Jika Appwrite menolak izin/atribut, jangan menganggap data sudah tersinkron.

**Catatan keamanan penting:** filter UI bukan pengamanan server. Perlindungan modul pada Appwrite mengandalkan document security dan label `lkpd-editor`. Pastikan label hanya diberikan kepada staf berwenang. Koleksi pengumpulan `lkpd` yang sudah ada memiliki skema/izin lama; privasi nilai siswa masih perlu diaudit terpisah. Jangan menyatakan data pengumpulan aman secara server-side hanya karena layar siswa memfilter `sid`.

## Penilaian dan batasan

Nilai otomatis bersifat formatif sesuai bobot modul. Guru harus memverifikasi bukti praktik dan standar manual servis. Kode SKKNI harus dicocokkan dengan dokumen unit kompetensi resmi sebelum dipakai sebagai klaim sertifikasi. Editor saat ini mengelola soal pilihan ganda dalam JSON; bank soal visual, upload bukti foto, rubrik observasi per butir, dan pengaturan penugasan per rombel dapat dikembangkan pada tahap berikutnya.

## Nilai koreksi guru dan foto bukti

- Guru/Admin membuka **Rekap LKPD > Detail**, mengisi **Nilai koreksi (0–100)** dan umpan balik. Nilai guru menggantikan nilai otomatis di rekap dan di koleksi `hasil`. Pengumpulan tanpa koreksi ditandai "belum diverifikasi".
- Siswa dapat melampirkan maksimal 3 foto bukti di tab Lembar Kerja. Foto dikecilkan (sisi terpanjang 1024 px, JPEG) dan disimpan di koleksi `lkpd_bukti`; guru memuatnya saat membuka Detail.
- Pengaturan izin dan atribut baru: lihat `docs-PENGAMANAN-APPWRITE.md`.
