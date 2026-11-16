# Filter Elemen CP pada Bank soal

Menu Bank soal (guru/admin) kini punya filter **Elemen CP** (Kepka BSKAP 046/H/KR/2025): Fase E (E1-E7), Fase F (F1-F7), Di luar CP kejuruan, dan Belum dipetakan (soal sendiri).

- Filter cocok bila elemen utama **atau** elemen tambahan soal sama dengan pilihan; angka di tiap pilihan mengikuti aturan yang sama.
- Kartu soal menampilkan baris CP: elemen utama, kode TP (rujukan ATP draf), elemen tambahan, dan tingkat keyakinan bila bukan Tinggi.
- Filter ikut dipakai ekspor Excel dan cetak soal (keduanya memakai daftar yang difilter).
- Data: `js/cp-peta.js` (1.320 soal bawaan). Soal sendiri belum punya CP.
- Tidak ada perubahan koleksi Appwrite.

Pasang: `unzip -o`, lalu `git add . && git commit && git push` (versi berkas diatur tools/rilis.mjs).
