#!/usr/bin/env node
/* Uji format cetak PDF LKPD (js/lkpd-format.js) tanpa peramban; harness sama dengan uji-lkpd-v2.mjs.
   node tools/uji-lkpd-format.mjs   (LKPD_HTML=/tmp/lkpd.html menulis HTML cetak untuk diperiksa di peramban atau wkhtmltopdf)
   Harness asal: memuat berkas asli aplikasi dalam sandbox vm dengan stub DOM minimal.
   node tools/uji-lkpd-v2.mjs
   Yang diuji: hitungan rata-rata/selisih, kelengkapan tabel, gerbang masuk, soal isian angka (koma, toleransi), nilai otomatis,
   render tiap tab dan Detail, verifikasi guru, perilaku LKPD lama tidak berubah, serta hitungan dan simpan Observasi v2. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
let gagal = 0, lulus = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const sama = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + ' (dapat ' + JSON.stringify(a) + ', harap ' + JSON.stringify(b) + ')');

const listeners = []; const STYLES = [];
const el = () => ({ style: {}, dataset: {}, classList: { toggle() {}, contains() { return false } }, appendChild() {}, setAttribute() {}, querySelector() { return null }, querySelectorAll() { return [] }, closest() { return null } });
const ctx = vm.createContext({
  console, Math, JSON, Object, Array, Date, String, Number, isFinite, parseInt, setTimeout, setInterval() {}, clearInterval() {}, localStorage: { getItem() { return null }, setItem() {}, removeItem() {} },
  navigator: { onLine: true }, window: { scrollTo() {} },
  document: { createElement: (t) => { const e = el(); e.tag = t; STYLES.push(e); return e; }, head: el(), body: el(), addEventListener(t, f, c) { listeners.push({ t, f, c }) }, querySelectorAll() { return [] }, getElementById() { return null }, querySelector() { return null } },
});
ctx.window = ctx; ctx.scrollTo = () => {};
const run = (code, name) => vm.runInContext(code, ctx, { filename: name });

/* Stub mesin lama (hanya yang dipakai v2). Fungsi soal meniru perilaku lkpd-soal.js untuk PG. */
run(`
var S={user:{id:'u1',nama:'Budi',kelas:'X'},lkpd:[],observasi:[],users:[],results:[],kkm:75};
var Cloud={on:false};var KELAS={X:{judul:'Kelas X'}};
var toasts=[],renders=0,saved=0;
function toast(m){toasts.push(m)}function render(){renders++}function persist(){saved++}function save(){saved++}function uid(){return 'id'+Math.random().toString(36).slice(2)}
function ymd(){return '2026-11-20'}function schNama(){return 'SMKS Medina'}
var STAFF=false;function isStaff(){return STAFF}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lkEsc(x){return esc(x)}
var LK={module:'LKPD-X-07',tab:'materi',detail:null,editor:null,preview:false};
var DRAFT={};function lkDraft(){return DRAFT}
function lkRowOk(d,i){return !!d['row'+i]&&String(d['actual'+i]||'').trim()!==''}
function lkScore(d){return {practice:-1,theory:-1,final:-1,answered:0,correct:0}}
function lkRead(){return Object.assign({},DRAFT)}
function lkProgress(){return '<span>orig</span>'}
var SUBMITTED=0;function lkSubmit(){SUBMITTED++}
function viewLKPD(){return 'ORIG-VIEW'}
function lkDetailBody(){return 'ORIG-DETAIL'}
function lkqQuizHtml(m,d){return m.quiz.map(function(q,i){return lkqRender(q,i,d)}).join('')}
var LKPD_MODULES=[];
`, 'stub-lkpd');
/* Fungsi soal asli (lkpd-soal.js, sebelum bagian pemasangan) dimuat apa adanya agar PG, kompleks, dan kategori dinilai seperti di aplikasi. */
run(src('lkpd-soal.js').split('/* ---------- Pemasangan ke mesin LKPD ---------- */')[0], 'lkpd-soal-inti.js');
run(src('lkpd-v2-x07.js'), 'lkpd-v2-x07.js');
run(`LKPD_MODULES=JSON.parse(JSON.stringify(LKPD_EXTRA_MODULES));`, 'jalur-modul');
run(src('lkpd-v2.js'), 'lkpd-v2.js');
run(src('lkpd-v2-soal.js'), 'lkpd-v2-soal.js');
const G = (e) => vm.runInContext(e, ctx);

/* stub tambahan yang dipakai lkpd-format.js */
run(`var SEK={nama:'SMKS Medina Bandung',program:'Program Keahlian Teknik Sepeda Motor',alamat:'Jl. K.H. Ahmad Dahlan No. 13–15, Bandung'};var LOGO='data:image/png;base64,AAAA';function lkYN(v){return v==='ya'||v===true?'ya':v==='tidak'?'tidak':''}`, 'stub-format');
run(src('lkpd-format.js'), 'lkpd-format.js');
const M = G('LKPD_MODULES[0]');
const H = (d) => ({ d: d || {}, pihak: { siswa: 'Budi', tanggal: '21/11/2026', guru: 'Karyono, S.T.' }, semester: 'Ganjil 2026/2027', mapel: 'Dasar-Dasar Teknik Otomotif (DDPK)', akhir: '<div class="lkc-akhir">TTD</div>' });
const bangun = (m, d) => ctx.lkfBangun(m, H(d));
const kosong = bangun(M, {});
const teks = (h) => h.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const T = teks(kosong);

ok(typeof ctx.lkfBangun === 'function', 'lkfBangun tersedia');
/* kerangka seperti PDF acuan */
ok(/LEMBAR KERJA PESERTA DIDIK \(LKPD\) PRAKTIK/.test(T), 'judul lembar');
ok(/SMKS Medina Bandung/.test(T) && /class="lkf-kop"/.test(kosong), 'kop sekolah');
ok(/Judul\/Materi : Penggunaan dan Perawatan Alat Ukur/.test(T) && /Mata pelajaran : Dasar-Dasar Teknik Otomotif \(DDPK\)/.test(T) && /Kelas\/Semester : X \/ Ganjil 2026\/2027/.test(T) && /Fase\/Kurikulum : Fase E \/ Kurikulum Merdeka/.test(T), 'identitas kolom kiri');
ok(/Alokasi waktu : 6 pertemuan × 3 JP \(6 × 135 menit = 810 menit\)/.test(T), 'alokasi waktu 6 x 135 = 810');
ok(/Nama siswa : Budi/.test(T) && /Kelas \/ Kelompok/.test(T) && /Tanggal : 21\/11\/2026/.test(T) && /Asal komponen/.test(T) && /Guru\/Instruktur : Karyono, S.T./.test(T), 'identitas kolom kanan');
ok(/Tujuan pembelajaran Setelah menyelesaikan LKPD ini, kamu mampu:/.test(T), 'tujuan pembelajaran');
ok(/Rencana pertemuan Pertemuan JP Menit Kegiatan 1 3 135/.test(T), 'tabel rencana pertemuan');
const ban = kosong.match(/class="lkf-ban"/g) || [];
sama(ban.length, 6, 'enam banner pertemuan');
ok(/Pertemuan 1 · Pemantik, materi, gerbang masuk, APD, cek alat/.test(T) && /3 JP · target 135 menit/.test(T), 'banner pertemuan 1');
ok(/Pertemuan 2 · Kegiatan 1: Jangka sorong/.test(T) && /Pertemuan 4 · Kegiatan 3: Dial gauge/.test(T) && /Pertemuan 5 · Kegiatan 4:/.test(T), 'banner pertemuan berkegiatan');
ok(/Pertemuan 6 · /.test(T), 'banner pertemuan 6');
/* urutan bagian seperti PDF acuan */
const urut = ['Pertanyaan pemantik', 'Materi', 'Gerbang masuk praktik', 'Alat dan bahan', 'Keselamatan dan kesehatan kerja (K3) dan APD', 'Cek kondisi alat sebelum dipakai', 'Pertemuan 2 ·', 'Tabel F1', 'Latihan membaca skala jangka sorong', 'Pertemuan 3 ·', 'Tabel F2', 'Pertemuan 4 ·', 'Tabel F3', 'Latihan membaca skala dial gauge', 'Pertemuan 5 ·', 'Analisis dan keputusan teknis', 'Pertemuan 6 ·', 'Refleksi', 'Tindak lanjut', 'Penilaian kinerja oleh guru', 'TTD'];
let pos = -1, urutOk = true; urut.forEach((u) => { const i = T.indexOf(u, pos + 1); if (i < 0) { urutOk = false; console.log('  tidak ditemukan/berurutan: ' + u); } else pos = i; });
ok(urutOk, 'urutan bagian sama dengan PDF acuan');
/* gerbang masuk */
ok(/syarat lulus minimal 4 dari 5 soal benar/.test(T), 'syarat lulus gerbang');
ok(/1\. \(Pilihan ganda\)/.test(T) && /3\. \(Pilihan ganda kompleks: jawaban benar lebih dari satu\)/.test(T) && /4\. \(Pilihan ganda kategori: Benar\/Salah\)/.test(T), 'label bentuk soal');
ok(/☐ A\. Penyimpangan nol/.test(T), 'PG kompleks memakai kotak centang');
ok(/Pernyataan Benar Salah/.test(T) && /class="k">☐<\/td><td class="k">☐/.test(kosong), 'PG kategori berupa tabel Benar/Salah');
ok(/Skor gerbang:\s*(.*)dari 5 ☐ Lulus ☐ Belum lulus \(ulangi setelah belajar lagi\) Paraf guru/.test(T), 'baris skor gerbang');
/* K3 */
ok(/Alat pelindung diri/.test(T) && (T.match(/Paraf: /g) || []).length === M.v2.apd.length, 'paraf hanya pada butir APD (' + M.v2.apd.length + ')');
ok(/Cek kondisi alat sebelum dipakai ☐ Jangka sorong: permukaan ukur bersih/.test(T), 'cek kondisi alat memakai kotak centang');
/* tabel, pemeriksaan, latihan */
ok(/Tabel F1 · Jangka sorong \(mm\)/.test(T) && /Tabel F2 · Mikrometer \(mm\)/.test(T) && /Tabel F3 · Dial gauge \(mm\)/.test(T), 'tabel F1-F3');
ok(/Poin kritis: Catat penyimpangan nol/.test(T) && (T.match(/☐ Paraf guru/g) || []).length === 4, 'poin kritis dan 4 paraf guru pada langkah saksi');
ok((T.match(/☐ Foto bukti sudah diambil/g) || []).length === M.fotoWajib.length, 'kotak foto hanya pada item foto wajib');
ok(/Posisi nol jangka sorong[^☐]*☐ Foto bukti sudah diambil ☐ Sesuai standar ☐ Tidak sesuai Catatan:/.test(T), 'pemeriksaan: foto, sesuai, tidak sesuai, catatan');
ok(/Hasil ukur jangka sorong[^☐]*☐ Sesuai standar ☐ Tidak sesuai/.test(T) && !/Hasil ukur jangka sorong[^☐]*☐ Foto/.test(T), 'item tanpa foto wajib tidak punya kotak foto');
ok(/J1 Jangka sorong 0,05 mm.*?Jawab:\s*mm\s+Cara hitung:/.test(T) && /D2 Keolengan/.test(T), 'latihan J, M, D dengan baris Jawab dan Cara hitung');
ok(/Hitung dari soal, lalu isi hasilnya/.test(T), 'petunjuk latihan');
sama((T.match(/Waktu aktual pertemuan \d: /g) || []).length, 6, 'baris waktu aktual 6 pertemuan');
/* penilaian */
ok(/Persiapan dan K3/.test(T) && /Bobot Skor \(1–4\) Nilai/.test(T) && /Jumlah 100%/.test(T) && /Skor 1 pada Persiapan dan K3 berarti praktik dihentikan/.test(T), 'tabel penilaian kinerja');
/* isi siswa dari draf tercetak, kosong untuk guru */
const draf = { q100: 1, ['q' + 103]: { 0: true, 1: false }, q102: [0, 2], safe0: true, step0: true, mt1: '120', q0: '24,35', status0: 'Baik', actual0: '0,02', note0: 'nol bergeser', ana0: 'Diameter luar tidak sesuai' };
const isi = bangun(M, draf), Ti = teks(isi);
ok(/✔ B\. /.test(Ti), 'PG: pilihan terpilih bertanda');
ok(/☑ A\. /.test(Ti) && /☑ C\. /.test(Ti), 'PG kompleks: pilihan terpilih bertanda');
ok(/☑ Pakaian praktik \(wearpack\) lengkap/.test(Ti), 'K3: butir tercentang');
ok(/Waktu aktual pertemuan 1: 120 menit/.test(Ti), 'waktu aktual terisi');
ok(/Jawab: 24,35 mm/.test(Ti), 'jawaban latihan terisi');
ok(/☑ Sesuai standar/.test(Ti) && /Hasil aktual: 0,02; nol bergeser/.test(Ti), 'status dan catatan pemeriksaan terisi');
ok(/Diameter luar tidak sesuai/.test(Ti), 'jawaban analisis terisi');
ok(!/Diameter luar tidak sesuai/.test(T) && !/✔/.test(T) && !/☑/.test(T), 'lembar kosong bersih dari isian');
/* keamanan: HTML dari isian siswa di-escape */
ok(bangun(M, { note0: '<img src=x onerror=alert(1)>' }).indexOf('<img src=x') < 0, 'isian siswa di-escape');
/* gerbang lama (isian) dan modul v1 tetap tercetak */
const v1 = { id: 'LKPD-X-01', title: 'Uji v1', kelas: 'X', fase: 'E', duration: 90, objectives: ['a', 'b'], theory: [['T1', 'isi 1']], tools: ['kunci'], safety: ['APD'], steps: [['Langkah 1', 5, 'poin']], checks: [['Komponen A', 'ket', 'acuan']], symptoms: ['Gejala 1'], quiz: [{ t: 'pg', q: 'Soal?', o: ['a', 'b', 'c', 'd', 'e'], a: 1 }], rubric: { steps: 30, safety: 20, checks: 30, analysis: 20, practiceWeight: 70, theoryWeight: 30 } };
const t1 = teks(bangun(v1, { vehicle: 'Beat', safe0: true, actual0: '1,2', status0: 'Baik', q0: 1, symptom0: 'ya' }));
ok(/Alokasi waktu : 90 menit/.test(t1) && /Tipe kendaraan : Beat/.test(t1), 'v1: identitas');
ok(/Tujuan pembelajaran/.test(t1) && /1\. T1 isi 1/.test(t1) && /Alat dan bahan/.test(t1) && /☑ APD/.test(t1), 'v1: tujuan, materi, alat, K3');
ok(/Prosedur praktik 90 menit/.test(t1) && /1\. Langkah 1 · 5 menit/.test(t1), 'v1: prosedur praktik');
ok(/Komponen A/.test(t1) && /Hasil aktual Standar manual Status Catatan/.test(t1) && /Gejala 1 ☑ Ya ☐ Tidak/.test(t1), 'v1: tabel hasil pemeriksaan dan diagnosis');
ok(/Evaluasi pengetahuan 1\. Soal\?/.test(t1) && /✔ B\./.test(t1) && /Bobot penilaian/.test(t1), 'v1: evaluasi dan bobot');
/* footer dan gaya */
ok(/@bottom-right\{content:"Halaman " counter\(page\) " dari " counter\(pages\)/.test(kosong) && /@bottom-left\{content:"LKPD DDPK Kelas X · Alat Ukur · SMKS Medina Bandung"/.test(kosong), 'footer: identitas lembar dan nomor halaman');
const css = STYLES.filter((e) => e.tag === 'style').map((e) => e.textContent || '').join('');
ok(/#lk-print table\.lkf-ban td\{background:#1b5e20!important/.test(css) && /print-color-adjust:exact/.test(css), 'banner hijau dicetak berwarna');
if (process.env.LKPD_HTML) {
  fs.writeFileSync(process.env.LKPD_HTML, '<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:10mm 12mm 14mm}body{margin:0}' + css.replace(/@media print\{/, '').replace(/\}$/, '') + '#lk-print{display:block}</style><div id="lk-print" class="lkf" style="font-family:Arial,sans-serif;font-size:10pt">' + bangun(M, process.env.LKPD_ISI ? draf : {}).replace(/<style>[\s\S]*?<\/style>/, '') + '</div>');
}
console.log(`\nUji format cetak LKPD: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
