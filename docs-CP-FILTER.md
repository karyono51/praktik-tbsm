# Filter Elemen CP pada Bank soal

Dropdown gabungan **Mapel / Elemen CP** sudah digantikan oleh filter bertingkat Mapel > Kelas > Modul/LKPD (lihat `docs-FILTER-BERTINGKAT.md`). Elemen CP tetap bisa disaring lewat dropdown **Elemen CP (tambahan)** di bawahnya.

- Elemen CP (nama langsung, tanpa kode) yang punya soal pada pilihan di atasnya ditampilkan beserta jumlahnya; soal lintas elemen (mis. unit XII-1 Servis Berkala) ikut terhitung di elemen tambahannya.
- Kartu soal menampilkan satu baris: CP: nama elemen · TP · juga (elemen tambahan) · perlu dicek (bila kurang pasti).
- Urutan soal bank disusun menurut elemen CP (Kelas X lalu XI-XII); soal umum di akhir.
- Ekspor Excel dan cetak soal ikut daftar yang difilter.
- Data: `js/cp-peta.js` (1.320 soal + peta unit LKPD ke elemen). Sumber: Pemetaan_Bank_Soal_ke_Elemen_CP.xlsx. Logika: `js/bank-cp.js`.
