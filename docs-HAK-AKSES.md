# Hak akses Siswa, Guru, Admin

Dibuat dari `appwrite.json` (profil aman CBT, sesuai `CBT_AMAN:true`) oleh `node tools/uji-hak-akses.mjs --matriks`.
Huruf: **B** baca, **T** tambah, **U** ubah, **H** hapus. Siswa = pengguna login tanpa label. Guru dan Admin = izin label ditambah izin pengguna login.

| Koleksi | Siswa | Guru | Admin | Dokumen per pemilik |
|---|---|---|---|---|
| `akun` | BT | BT | BTUH | tidak |
| `hasil` | T | BTU | BTUH | ya |
| `lkpd` | T | BTU | BTUH | ya |
| `lkpd_modules` | - | - | - | ya |
| `lkpd_bukti` | T | BTH | BTUH | ya |
| `observasi` | - | T | BTUH | ya |
| `banksoal` | B | BTUH | BTUH | tidak |
| `soal_sesi` | B | BTUH | BTUH | tidak |
| `soal_hasil` | - | BUH | BUH | ya |
| `uid_map` | - | B | BH | tidak |
| `soal_run` | - | BUH | BUH | ya |
| `soal_kunci` | - | BTUH | BTUH | tidak |
| `audit` | - | - | B | tidak |
| `akademik` | - | B | BTUH | tidak |
| `akademik_sdm` | - | - | BTUH | tidak |
| `alumni` | - | BTU | BTUH | tidak |
| `pkl` | B | BTUH | BTUH | tidak |
| `pkl_catat` | T | BTUH | BTUH | ya |
| `pkl_nilai` | - | BTUH | BTUH | tidak |

Catatan: `lkpd_modules` memakai label tersendiri `lkpdeditor`, yang diberikan ke guru atau admin tertentu, jadi barisnya kosong di kolom Guru dan Admin. `observasi` dibaca guru lewat izin per dokumen (miliknya).

## Aturan yang dijaga `tools/uji-hak-akses.mjs`
- Tidak ada koleksi berizin `any`.
- Siswa tidak pernah mengubah atau menghapus dokumen. Siswa hanya menambah di `akun`, `hasil`, `lkpd`, `lkpd_bukti`, `pkl_catat`.
- Siswa hanya membaca `akun`, `banksoal`, `pkl`, `soal_sesi`. Kunci jawaban (`soal_kunci`) tidak terbaca siswa.
- `audit` dan `akademik_sdm` hanya Admin. Guru tidak menulis `akademik`.
- Penghapusan akun dan nilai hanya Admin.
- Koleksi yang diisi siswa memakai izin per dokumen (kecuali `akun`), supaya siswa hanya membaca miliknya.
- Di klien, izin mengikuti **peran aktif** (peran ganda tidak menggabung izin), peran tidak dikenal dianggap siswa.
- Batas atribut Appwrite (validasi server): semua integer punya min dan max, nilai 0 sampai 100, semua teks punya ukuran maksimum.

## Risiko yang sudah diterima (baseline `tools/audit-izin.baseline.json`)
1. `akun` dan `pkl` terbaca semua pengguna login.
2. Siswa bisa membuat dokumen `akun` dengan bidang peran (PERAN-PALSU). Wewenang data tetap ditentukan label Auth di server.
3. Siswa bisa mengisi `score` di `hasil` dan `lkpd` lewat API (NILAI-PALSU). Dibatasi 0 sampai 100 oleh atribut, dan guru dapat mengoreksi. Nilai CBT tidak terkena karena ditulis fungsi server.

Menutup risiko 2 dan 3 butuh perubahan izin di server (create hanya label guru atau lewat fungsi). Itu tidak diubah di paket ini, karena perlu uji di Appwrite Anda lebih dulu.
