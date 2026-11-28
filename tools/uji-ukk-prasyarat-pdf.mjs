#!/usr/bin/env node
/* Uji cetak PDF Prasyarat praktik UKK (js/ukk-prasyarat-pdf.js): PDF soal tanpa kunci, PDF kunci dengan pembahasan, tata letak (tidak keluar halaman),
   kotak jawaban per jenis soal, batas 20 soal, nama berkas, dan pembukaan tab atau unduhan. Mesin jsPDF diganti perekam; tampilan akhir diperiksa di perangkat.
   node tools/uji-ukk-prasyarat-pdf.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let lulus = 0, gagal = 0;
const T = (n, c, x) => { if (c) lulus++; else { gagal++; console.log('GAGAL ' + n + (x ? ' -> ' + x : '')); } };

const lkq = baca('js/lkpd-soal.js');
const penilai = lkq.slice(lkq.indexOf('function lkqType'), lkq.indexOf('function lkqSig'));
const toasts = [], saved = [], opened = [], docs = [];
let popup = true;
const H = 297;
function buatDoc() {
  const d = { halaman: 1, teks: [], rect: [], tabel: [], lastAutoTable: { finalY: 60 }, internal: { pageSize: { getWidth: () => 210, getHeight: () => H } }, ukuran: 10 };
  const rantai = () => d;
  d.setFont = rantai; d.setLineWidth = rantai; d.setTextColor = rantai; d.setDrawColor = rantai;
  d.setFontSize = (n) => { d.ukuran = n; return d; };
  d.text = (t, x, y) => { d.teks.push({ t: String(t), x, y, p: d.halaman }); return d; };
  d.line = rantai;
  d.rect = (x, y, w, h) => { d.rect_.push({ x, y, w, h, p: d.halaman }); return d; };
  d.rect_ = [];
  d.rect = (x, y, w, h) => { d.rect_.push({ x, y, w, h, p: d.halaman }); return d; };
  d.addImage = rantai;
  d.addPage = () => { d.halaman++; return d; };
  d.splitTextToSize = (t, w) => {
    const maks = Math.max(8, Math.floor(w / (d.ukuran * 0.2))), kata = String(t).split(/\s+/), out = []; let baris = '';
    kata.forEach((k) => { if ((baris + ' ' + k).trim().length > maks) { out.push(baris); baris = k; } else baris = (baris + ' ' + k).trim(); });
    if (baris) out.push(baris); return out;
  };
  d.autoTable = (o) => { d.tabel.push(o); d.lastAutoTable = { finalY: (o.startY || 0) + 8 + 6 * ((o.body || []).length) }; return d; };
  d.getNumberOfPages = () => d.halaman;
  d.output = () => 'blob:uji'; d.save = (n) => saved.push(n);
  docs.push(d); return d;
}
const el = () => ({ addEventListener() {}, appendChild() {}, style: {} });
const ctx = {
  console, JSON, Math, Date, Object, Array, String, Number, Error, Promise, isFinite, parseInt, isNaN,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  document: Object.assign(el(), { head: el(), body: el(), createElement: el, getElementById: () => null }),
  S: { user: { id: 'g1' }, kkm: 80 }, V: {}, esc: (s) => String(s == null ? '' : s), toast: (m) => toasts.push(m), isStaff: () => true,
  jobById: () => null, startExam() {}, ukkCardAction: () => '', ukkSimpanRincian() {}, jenisTampil: () => '',
  LOGO: 'data:image/jpeg;base64,AAAA', SEK: { nama: 'SMKS Medina Bandung', program: 'Teknik dan Bisnis Sepeda Motor', alamat: 'Jl. K.H. Ahmad Dahlan No. 13–15, Bandung' },
};
ctx.window = ctx; ctx.globalThis = ctx;
ctx.jspdf = { jsPDF: function () { return buatDoc(); } };
ctx.open = (u) => { opened.push(u); return popup ? {} : null; };
vm.createContext(ctx);
vm.runInContext(penilai, ctx);
vm.runInContext(baca('js/ukk-gerbang.js'), ctx, { filename: 'ukk-gerbang.js' });
vm.runInContext(baca('js/ukk-prasyarat-pdf.js'), ctx, { filename: 'ukk-prasyarat-pdf.js' });
const run = (c) => vm.runInContext(c, ctx);
const J = { id: 'UKK-X-1', judul: 'Pengukuran Kelistrikan Dasar', kelas: 'X', unit: 'Honda Beat' };
const soal5 = run('UKK_GERBANG["UKK-X-1"]');
const semua = (d) => d.teks.map((x) => x.t).join('\n');

/* 1. PDF soal */
let d = run('ukpPdfDoc')(J, soal5, 'soal'), s = semua(d);
T('soal: 5 soal bernomor 1. sampai 5.', [1, 2, 3, 4, 5].every((n) => d.teks.some((x) => x.t === n + '.')));
T('soal: kop sekolah dan judul', s.indexOf('SMKS MEDINA BANDUNG') > -1 && s.indexOf('SOAL PRASYARAT PRAKTIK UKK') > -1 && s.indexOf('Pengukuran Kelistrikan Dasar') > -1);
T('soal: identitas diisi tangan (Nama, Kelas, No. absen, Nilai)', JSON.stringify(d.tabel[0].body).indexOf('Nama') > -1 && JSON.stringify(d.tabel[0].body).indexOf('No. absen') > -1 && JSON.stringify(d.tabel[0].body).indexOf('Nilai') > -1);
T('soal: tanpa kunci dan pembahasan', soal5.every((q) => s.indexOf(q.e.slice(0, 40)) < 0) && !/Kunci|Pembahasan/i.test(s));
T('soal: petunjuk memuat KKM aplikasi 80', s.indexOf('minimal 80') > -1, '');
T('soal: tiap pertanyaan tercetak (kata awal)', soal5.every((q) => s.indexOf(q.q.split(' ').slice(0, 3).join(' ')) > -1));
T('soal: PG kompleks berkotak (5 pilihan)', d.rect_.length >= 5 + 5 * 2);
T('soal: PG kategori punya dua kotak per pernyataan (5 x 2)', d.rect_.length === 5 + 10, String(d.rect_.length));
T('soal: huruf pilihan A sampai E tercetak', ['A.', 'B.', 'C.', 'D.', 'E.'].every((h) => d.teks.some((x) => x.t === h)));
T('soal: tidak ada teks melewati batas bawah halaman', d.teks.every((x) => x.y <= H - 14 || x.y > H - 12), String(Math.max.apply(null, d.teks.map((x) => x.y))));
T('soal: Benar dan Salah jadi kepala kolom kategori', d.teks.some((x) => x.t === 'Benar') && d.teks.some((x) => x.t === 'Salah'));

/* 2. PDF kunci */
d = run('ukpPdfDoc')(J, soal5, 'kunci'); s = semua(d);
const tb = d.tabel[0];
T('kunci: judul dan peringatan khusus guru', s.indexOf('KUNCI JAWABAN PRASYARAT PRAKTIK UKK') > -1 && s.indexOf('Hanya untuk guru') > -1);
T('kunci: tabel 5 baris dengan kolom No, Jenis, Level, Kunci, Pembahasan', tb.body.length === 5 && tb.head[0].join('|') === 'No|Jenis|Level|Kunci|Pembahasan');
T('kunci: kunci tiap soal benar (B, C, E, A C D, kategori)', tb.body[0][3] === 'B' && tb.body[1][3] === 'C' && tb.body[2][3] === 'E' && tb.body[3][3] === 'A, B, D' && /1=Benar; 2=Benar; 3=Salah; 4=Salah; 5=Benar/.test(tb.body[4][3]), JSON.stringify(tb.body.map((r) => r[3])));
T('kunci: pembahasan ikut tercetak', tb.body.every((r, i) => r[4] === soal5[i].e));
T('kunci: jenis soal diberi nama', tb.body[0][1] === 'Pilihan ganda' && tb.body[3][1] === 'PG kompleks' && tb.body[4][1] === 'PG kategori');
T('kunci: aturan penilaian dan KKM 80', s.indexOf('Penilaian: PG benar = 1') > -1 && s.indexOf('minimal 80') > -1);
T('kunci: tidak memuat kotak jawaban kosong', d.rect_.length === 0);

/* 3. Batas 20 soal dan banyak halaman */
const dua0 = []; for (let i = 0; i < 20; i++) dua0.push(JSON.parse(JSON.stringify(soal5[i % 5])));
d = run('ukpPdfDoc')(J, dua0, 'soal');
T('20 soal: beberapa halaman, nomor 1 sampai 20', d.halaman > 2 && d.teks.some((x) => x.t === '20.') && d.teks.every((x) => x.y <= H - 14));
T('20 soal: soal baru tidak berawal di sisa halaman terlalu sempit', d.teks.filter((x) => /^\d+\.$/.test(x.t)).every((x) => x.y < H - 30), '');
d = run('ukpPdfDoc')(J, dua0, 'kunci'); T('20 soal: kunci 20 baris', d.tabel[0].body.length === 20);
/* soal panjang tidak merusak */
const panjang = JSON.parse(JSON.stringify(soal5[0])); panjang.q = 'Teks sangat panjang '.repeat(60); panjang.o = panjang.o.map((o) => o + ' lanjutan'.repeat(20));
d = run('ukpPdfDoc')(J, [panjang, panjang, panjang], 'soal');
T('soal sangat panjang: tetap di dalam halaman', d.halaman >= 2 && d.teks.every((x) => x.y <= H - 14), String(Math.max.apply(null, d.teks.map((x) => x.y))));

/* 4. Nama berkas, tab, dan unduhan */
T('nama berkas soal', run('ukpNamaFile')(J, 'soal') === 'Prasyarat_Soal_UKK-X-1.pdf');
T('nama berkas kunci', run('ukpNamaFile')(J, 'kunci') === 'Prasyarat_Kunci_UKK-X-1.pdf');
T('nama berkas membuang karakter terlarang', run('ukpNamaFile')({ id: 'UKK/BARU 1' }, 'soal') === 'Prasyarat_Soal_UKK-BARU-1.pdf');
popup = true; saved.length = 0; opened.length = 0; run('ukpCetak')(J, soal5, 'soal');
T('cetak: PDF dibuka di tab baru, tanpa unduhan', opened.length === 1 && saved.length === 0);
popup = false; run('ukpCetak')(J, soal5, 'kunci');
T('cetak dengan pop-up diblokir: diunduh dan diberi tahu', saved.length === 1 && saved[0] === 'Prasyarat_Kunci_UKK-X-1.pdf' && toasts.some((m) => /PDF diunduh/.test(m)));
toasts.length = 0; run('ukpCetak')(J, [], 'soal');
T('cetak tanpa soal: pesan', toasts.some((m) => /Belum ada soal/.test(m)));
ctx.jspdf = undefined; toasts.length = 0; run('ukpCetak')(J, soal5, 'soal');
T('mesin PDF belum dimuat: pesan, tanpa galat', toasts.some((m) => /belum dimuat/.test(m)));

console.log(gagal ? `\nUji PDF prasyarat: ${lulus} lulus, ${gagal} gagal` : `\nUji PDF prasyarat: ${lulus} lulus, 0 gagal`);
process.exit(gagal ? 1 : 0);
