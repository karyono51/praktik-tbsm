# Komponen bersama: pilihan, tombol, kartu, lipatan

Berkas: `js/komponen.js` (pembangun HTML, murni, tanpa DOM), `css/komponen.css` (gaya baku), `js/bank-pilihan.js` (lembar pilihan). Uji: `node tools/uji-komponen.mjs`.

## Pilihan (`<select>`)
Jangan menulis `'<select>...'` manual. Pakai:

- `bpField('Label', ' data-k="x"', daftar, nilai, {kosong:'Semua', cari:true, wajib:true})` untuk `<label class="f">` + select.
- `bpSelect(attr, daftar, nilai, {judul, cari, tanpaCari, kosong, fb})` bila label dibuat sendiri; mengembalikan `{html, ket}`.
- Data: `bpO(nilai, teks, ket, off)`, `bpG(judul, [opsi])`, atau `[nilai, teks, ket, off]`, atau string tunggal.

Yang didapat otomatis: judul lembar (data-judul), keterangan kecil tiap pilihan, kelompok, pilihan kosong terpisah, pilihan nonaktif, kotak Cari bila 8 pilihan atau lebih, dan nilai tersimpan yang sudah tidak ada tetap tampil ("Pilih ulang") agar ubah data tidak mengosongkannya diam-diam. Nilai terpilih tidak pernah ikut dinonaktifkan.

Modul PKL (`js/pkl.js`) sudah sepenuhnya memakai ini (`pkO`, `pkG`, `pkSelectHtml` hanya nama pendek yang meneruskan ke `bpO`, `bpG`, `bpSelect`), termasuk dua pilihan di tab Pengaturan. Modul lain masih merakit `<select>` sendiri dan tetap berjalan, karena lembar pilihan berlaku untuk semua `<select>`. Judul lembar kini juga terbaca bila teks label tidak berada di simpul pertama.

Migrasi modul lain dilakukan bertahap. Prioritas (paling banyak select): `banksoal.js` (17), `observasi.js`, `lkpd-editor.js`, `ukk-kelola.js`, `ruang.js`, `observasi-ukk.js`.

## Tombol
Satu kelas dasar `.btn`, varian lewat kelas:

| Kelas | Pakai untuk |
|---|---|
| `.btn.primary` | aksi utama, satu per kartu atau layar |
| `.btn` | aksi biasa |
| `.btn.ghost` | aksi sekunder tanpa garis |
| `.btn.danger` | hapus; `.btn.danger.solid` untuk konfirmasi akhir |
| `.btn.small` | aksi di dalam baris atau kartu |
| `.btn.block` / `.btn.grow` | selebar wadah / mengisi sisa baris |

Kelompokkan dengan `.btn-row` (turun baris bila sempit; `.btn-row.end` rata kanan). Pembangun: `uiBtn(teks, {act, data, v, kecil, penuh, tumbuh, off, ikon})` dan `uiBtns([...])`. Tinggi sentuh minimum 40 px (small 34 px), cincin fokus terlihat untuk papan ketik. Semua tombol wajib `type="button"` kecuali tombol kirim formulir; uji komponen memeriksanya.

## Kartu
`.card` dengan kepala `.card-h` (judul kiri, `.card-a` aksi kanan), isi, dan kaki `.card-f` untuk tombol aksi kartu. Varian: `.flat`, `.tint`, `.warn`, `.bad`, `.ok` (garis kiri berwarna). Pembangun: `uiCard({judul, sub, aksi, isi, kaki, v})`.

## Lipatan
`<details class="lip">` dengan judul dan panah di kanan; `.lip.card` bila dibungkus kartu. `<details>` polos (tanpa kelas) otomatis memakai gaya yang sama, jadi lipatan lama di Akademik, LKPD, dan PKL ikut seragam tanpa diubah. Lipatan khusus modul (`lk2-bn`, `lk2-more`, `obu-exp`, `akd-ref`, dan sebagainya) tetap memakai gayanya sendiri. Pembangun: `uiLip({judul, sub, isi, buka, kunci, kartu})`.

## Aturan untuk kode baru
1. Pilihan, tombol, kartu, dan lipatan baru ditulis lewat pembangun di atas atau kelas bakunya, bukan gaya inline.
2. Satu aksi utama (`primary`) per kartu.
3. Jangan menaruh `style="..."` pada tombol; tambah varian di `css/komponen.css` bila perlu.
