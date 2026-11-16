# Filter Mapel / Elemen CP pada Bank soal

Satu dropdown **Mapel / Elemen CP** menggantikan filter Mapel di halaman Bank soal. LKPD adalah bagian dari elemen CP.

- Tiap **elemen CP** (nama langsung, tanpa kode) adalah satu kelompok. Isinya: "Semua <elemen>" (semua soal elemen itu, termasuk soal LKPD dan Dasar TBSM) lalu unit LKPD yang menjadi bagian elemen itu. Elemen yang belum punya soal disembunyikan.
- Di bawahnya **Mapel** non-LKPD: Bahasa Indonesia, Matematika, Bahasa Inggris, Dasar TBSM.
- Unit XII-1 (Servis Berkala) lintas elemen: unitnya ditaruh di Pengelolaan Bengkel, sedangkan soalnya tetap dipetakan per soal (muncul juga di Engine, Sasis, dan seterusnya lewat "Semua <elemen>").
- Urutan soal bank disusun ulang menurut elemen CP (Kelas X lalu XI-XII); soal umum di akhir.
- Kartu soal menampilkan satu baris: CP: nama elemen · TP · juga (elemen tambahan) · perlu dicek (bila kurang pasti).
- Memilih satu pilihan mengosongkan yang lain. Jenis dan Peruntukan tetap sebaris di bawahnya. Ekspor Excel dan cetak soal ikut daftar yang difilter.
- Data: `js/cp-peta.js` (1.320 soal + peta unit LKPD ke elemen). Sumber: Pemetaan_Bank_Soal_ke_Elemen_CP.xlsx.
