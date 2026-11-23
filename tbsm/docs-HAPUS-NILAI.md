# Hapus nilai (khusus Admin)

Menu: **Administrasi > Hapus nilai**. Hanya muncul bila peran aktif Admin; izin hapus juga dijaga server (label `admin`, atau `guru` untuk koleksi ujian dan foto).

## Yang bisa dihapus (centang per jenis)
| Jenis | Koleksi |
|---|---|
| Hasil penilaian (rekap nilai, UKK, latihan) | `hasil` |
| LKPD Praktik (pengumpulan dan koreksi guru) | `lkpd` |
| Foto bukti praktik (LKPD dan UKK) | `lkpd_bukti` |
| Ujian CBT dan latihan Bank soal | `soal_hasil`, `soal_run` |

## Tidak ikut terhapus
Akun, modul LKPD, bank soal, sesi ujian, observasi guru, dan **berkas foto di Google Drive** (folder `TBSM Bukti Praktik`; hapus manual di Drive bila perlu).

## Pengaman
- Harus mengetik **HAPUS NILAI** sebelum tombol aktif; tombol Unduh Excel rekap tersedia di halaman yang sama.
- Dokumen dihapus 5 sekaligus; yang gagal dihitung dan dilaporkan, tidak membuat proses berulang tanpa henti.
- Koleksi yang belum dibuat dilewati.
- Setelah selesai, data di perangkat dibersihkan dan disegarkan dari server. Perangkat lain perlu menekan Segarkan; pengiriman siswa yang masih menunggu antrean tetap akan terkirim saat online.
- Tidak ada catatan audit penghapusan; unduh rekap dulu bila perlu arsip.

# Status Perlu dicek setelah dikoreksi (LKPD)
Tanda otomatis (nilai tidak cocok, terlalu cepat, isian singkat, mirip siswa lain) kini berhenti menjadi **Perlu dicek** setelah guru menyimpan nilai koreksi, dan berubah menjadi **Ditinjau** (tanda tetap terlihat di detail sebagai catatan). Syarat "ditinjau": ada nilai koreksi, penanda `verifOleh` berisi nama staf yang dikenal, dan `verifTs` tidak lebih awal dari waktu pengiriman. Syarat ini mempersulit koreksi palsu dari siswa, bukan jaminan (lihat `docs-PENGAMANAN-V73.md`).
