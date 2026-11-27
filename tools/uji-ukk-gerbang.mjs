#!/usr/bin/env node
/* Uji Gerbang praktik UKK kelas X dan XI (js/ukk-gerbang.js): data soal, penilaian TKA, KKM, penghadang saat mulai unit,
   alur jawab-kirim-mulai, pratinjau guru, kartu unit, dan nilai gerbang di rincian hasil.  node tools/uji-ukk-gerbang.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let lulus = 0, gagal = 0;
const T = (n, c, x) => { if (c) lulus++; else { gagal++; console.log('GAGAL ' + n + (x ? ' -> ' + x : '')); } };

/* fungsi penilai soal TKA asli dari lkpd-soal.js */
const lkq = baca('js/lkpd-soal.js');
const a0 = lkq.indexOf('function lkqType'), a1 = lkq.indexOf('function lkqValid');
const penilai = lkq.slice(a0, a1);

const store = {}, LIS = [], els = {};
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mk = () => ({ id: '', className: '', innerHTML: '', textContent: '', scrollTop: 0, style: {}, parentNode: null, setAttribute() {} });
const body = { style: {}, appendChild(el) { el.parentNode = body; els[el.id] = el; }, removeChild(el) { delete els[el.id]; el.parentNode = null; } };
const prog = { textContent: '' };
const JOBS = {
  'UKK-X-1': { id: 'UKK-X-1', judul: 'Pengukuran Arus, Tegangan, dan Hambatan', unit: 'Rangkaian lampu 12 V', ukk: true, cfg: { mode: 'latihan' }, items: [{ id: 'a' }] },
  'UKK-XI-1': { id: 'UKK-XI-1', judul: 'Pemeriksaan Komponen Sistem CVT', unit: 'Honda Beat Pop', ukk: true, cfg: { mode: 'ujian' }, items: [{ id: 'a' }] },
  'UKK-1': { id: 'UKK-1', judul: 'Engine', unit: 'Vario', ukk: true, cfg: { mode: 'latihan' }, items: [{ id: 'a' }] },
};
const toasts = [], mulai = [];
let STAFF = false, DRAFT = null, KUNCI = '';
const ctx = {
  console, JSON, Math, Date, Object, Array, String, Number, Error, isFinite,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  document: {
    addEventListener(t, f) { LIS.push({ t, f }); }, head: { appendChild() {} }, body,
    createElement: mk, getElementById: (id) => (id === 'ukg-prog' ? prog : (els[id] || null)),
  },
  S: { user: { id: 's1', username: 'siswa1' }, kkm: 75, results: [] },
  V: { job: null }, esc, toast: (m) => toasts.push(m),
  isStaff: () => STAFF, jobById: (id) => JOBS[id] || null,
  ujiDraftGet: () => DRAFT, ukkKunci: () => KUNCI,
  startExam: (id, keep) => { mulai.push([id, !!keep]); return 'asli'; },
  ukkCardAction: () => '<button>Mulai</button>',
  ukkSimpanRincian: (n0) => { ctx.S.results.slice(n0).forEach((r) => { if (!r.payload) r.payload = JSON.stringify({ nama: r.siswa }); }); },
  jenisTampil: (r) => r.tipe,
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(penilai, ctx);
vm.runInContext(baca('js/ukk-gerbang.js'), ctx, { filename: 'ukk-gerbang.js' });
const run = (c) => vm.runInContext(c, ctx);

const chg = (t) => LIS.filter((l) => l.t === 'change').forEach((l) => l.f({ target: t }));
const klik = (ukg, v) => { const node = { dataset: { ukg, v } }; LIS.filter((l) => l.t === 'click').forEach((l) => l.f({ target: { closest: (s) => (s === '[data-ukg]' ? node : null) } })); };
const ov = () => els['ukg-ov'];
const reset = () => { Object.keys(store).forEach((k) => delete store[k]); Object.keys(els).forEach((k) => delete els[k]); toasts.length = 0; mulai.length = 0; STAFF = false; DRAFT = null; KUNCI = ''; ctx.S.user = { id: 's1', username: 'siswa1' }; ctx.S.kkm = 75; ctx.S.results = []; run('UKG.job=null'); };
const benar = (q, i) => { /* jawab benar lewat kejadian change */
  const t = run(`lkqType(UKK_GERBANG['${q}'][${i}])`), s = run(`UKK_GERBANG['${q}'][${i}]`);
  if (t === 'kompleks') s.a.forEach((k) => chg({ dataset: { ukgIn: String(i) }, value: String(k), checked: true }));
  else if (t === 'kategori') s.rows.forEach((r, k) => chg({ dataset: { ukgIn: String(i), k: String(k) }, value: r[1] ? '1' : '0', checked: true }));
  else chg({ dataset: { ukgIn: String(i) }, value: String(s.a), checked: true });
};
const salah = (q, i) => {
  const t = run(`lkqType(UKK_GERBANG['${q}'][${i}])`), s = run(`UKK_GERBANG['${q}'][${i}]`);
  if (t === 'kompleks') { const x = [0, 1, 2, 3, 4].filter((k) => s.a.indexOf(k) < 0)[0]; chg({ dataset: { ukgIn: String(i) }, value: String(x), checked: true }); }
  else if (t === 'kategori') s.rows.forEach((r, k) => chg({ dataset: { ukgIn: String(i), k: String(k) }, value: r[1] ? '0' : '1', checked: true }));
  else chg({ dataset: { ukgIn: String(i) }, value: String((s.a + 1) % 5), checked: true });
};

/* ===== 1. Data soal ===== */
const IDS = ['UKK-X-1', 'UKK-XI-1'];
const kunciPg = [];
IDS.forEach((id) => {
  const L = run(`UKK_GERBANG['${id}']`);
  T(id + ': 5 soal', L.length === 5);
  T(id + ': 3 PG, 1 kompleks, 1 kategori', L.filter((q) => q.t === 'pg').length === 3 && L.filter((q) => q.t === 'kompleks').length === 1 && L.filter((q) => q.t === 'kategori').length === 1);
  L.forEach((q, i) => {
    const n = id + ' soal ' + (i + 1);
    T(n + ': teks, level, pembahasan', q.q.length > 20 && ['Aplikasi', 'Penalaran'].indexOf(q.lvl) > -1 && String(q.e || '').length > 20);
    if (q.t === 'pg') { T(n + ': PG 5 pilihan unik, kunci 0-4', q.o.length === 5 && new Set(q.o).size === 5 && Number.isInteger(q.a) && q.a >= 0 && q.a <= 4); kunciPg.push(q.a); }
    if (q.t === 'kompleks') T(n + ': kompleks 5 pilihan, kunci >= 2 urut unik', q.o.length === 5 && q.a.length >= 2 && q.a.every((k, x) => k >= 0 && k <= 4 && (x === 0 || k > q.a[x - 1])));
    if (q.t === 'kategori') T(n + ': kategori 3-6 pernyataan, ada Benar dan Salah', q.rows.length >= 3 && q.rows.length <= 6 && q.rows.some((r) => r[1] === true) && q.rows.some((r) => r[1] === false) && q.lab.length === 2);
  });
});
T('posisi kunci PG bervariasi (bukan satu huruf)', new Set(kunciPg).size >= 3, kunciPg.join());
T('ID unit sama dengan unit UKK di data.js', IDS.every((id) => baca('js/data.js').indexOf("id:'" + id + "'") > -1));

/* ===== 2. Penilaian ===== */
const hit = (id, fn) => { reset(); const L = run(`UKK_GERBANG['${id}']`); const jwb = {}; /* bangun jawaban lewat helper */ return L; };
function nilaiDengan(id, pola) { /* pola: string 'bbbbb' / 's' per soal */
  reset(); ctx.window.startExam(id);
  [...pola].forEach((c, i) => { if (c === 'b') benar(id, i); else if (c === 's') salah(id, i); });
  return run(`ukgNilai(ukgSoal(jobById('${id}')),UKG.jwb)`);
}
IDS.forEach((id) => {
  let r = nilaiDengan(id, 'bbbbb');
  T(id + ': semua benar = 100 lulus', r.nilai === 100 && r.lulus && r.n === 5 && r.poin === 5);
  r = nilaiDengan(id, 'bbbb-');
  T(id + ': satu soal kosong = tidak lulus walau nilai 80', r.nilai === 80 && !r.lulus && r.n === 4);
  r = nilaiDengan(id, 'sbbbb');
  T(id + ': satu PG salah = 80 lulus', r.nilai === 80 && r.lulus);
  r = nilaiDengan(id, 'ssbbb');
  T(id + ': dua PG salah = 60 belum lulus', r.nilai === 60 && !r.lulus);
  r = nilaiDengan(id, '-----');
  T(id + ': kosong semua = 0', r.nilai === 0 && !r.lulus && r.n === 0);
  r = nilaiDengan(id, 'bbbsb');
  T(id + ': kompleks dijawab salah = nilai 80 (poin 4)', r.nilai === 80 && r.poin === 4);
  r = nilaiDengan(id, 'bbbbs');
  T(id + ': kategori dibalik semua = poin 4 (nilai 80)', r.nilai === 80 && r.poin === 4);
});
{ /* kompleks sebagian: pilih satu kunci saja = 1/jumlah kunci */
  reset(); ctx.window.startExam('UKK-X-1'); benar('UKK-X-1', 0); benar('UKK-X-1', 1); benar('UKK-X-1', 2); benar('UKK-X-1', 4);
  const k = run("UKK_GERBANG['UKK-X-1'][3].a");
  chg({ dataset: { ukgIn: '3' }, value: String(k[0]), checked: true });
  const r = run("ukgNilai(ukgSoal(jobById('UKK-X-1')),UKG.jwb)");
  T('kompleks sebagian bernilai pecahan (1/3)', Math.abs(r.poin - (4 + 1 / 3)) < 0.01 && r.nilai === 87 && r.lulus, JSON.stringify(r));
}
{ /* KKM: tidak pernah di bawah 75, naik bila S.kkm lebih tinggi */
  reset(); ctx.S.kkm = 60; T('KKM gerbang minimal 75 walau S.kkm 60', run('ukgKkm()') === 75);
  ctx.S.kkm = 90; const r = nilaiDengan('UKK-X-1', 'sbbbb'); ctx.S.kkm = 90;
  T('S.kkm 90: nilai 80 belum lulus', run("ukgNilai(ukgSoal(jobById('UKK-X-1')),UKG.jwb)").lulus === false);
}

/* ===== 3. Penghadang saat mulai unit ===== */
reset(); ctx.window.startExam('UKK-X-1');
T('siswa belum lulus: unit tidak dimulai, gerbang tampil', mulai.length === 0 && !!ov() && ov().innerHTML.indexOf('Gerbang praktik') > -1);
T('gerbang memuat 5 soal dan tombol Kirim', (ov().innerHTML.match(/class="card ukg-q"/g) || []).length === 5 && ov().innerHTML.indexOf('data-ukg="kirim"') > -1);
T('teks kelas X: membuka latihan, kelas XI: membuka ujian', ov().innerHTML.indexOf('membuka latihan') > -1);
reset(); ctx.window.startExam('UKK-XI-1'); T('unit mode ujian: membuka ujian', ov() && ov().innerHTML.indexOf('membuka ujian') > -1);
reset(); STAFF = true; ctx.window.startExam('UKK-X-1'); T('guru tidak dihadang', mulai.length === 1 && !ov());
reset(); ctx.window.startExam('UKK-1'); T('unit tanpa gerbang tidak dihadang', mulai.length === 1 && !ov());
reset(); DRAFT = { t0: 1 }; ctx.window.startExam('UKK-X-1'); T('pekerjaan berjalan (draf) tidak dihadang', mulai.length === 1 && !ov());
reset(); ctx.window.startExam('UKK-X-1', { group: [] }); T('keep (ulang/redo) tidak dihadang', mulai.length === 1 && !ov());
reset(); KUNCI = 'Belum dibuka.'; ctx.window.startExam('UKK-X-1'); T('pesan kunci unit lebih dulu dari gerbang', mulai.length === 0 && !ov() && toasts[0] === 'Belum dibuka.');

/* ===== 4. Alur jawab, kirim, mulai ===== */
reset(); ctx.window.startExam('UKK-X-1');
for (let i = 0; i < 4; i++) benar('UKK-X-1', i);
T('penghitung terjawab diperbarui', prog.textContent === 'Terjawab 4 dari 5', prog.textContent);
klik('kirim'); T('kirim belum lengkap ditolak', toasts.some((m) => m.indexOf('Jawab semua soal dulu (4 dari 5)') > -1) && ov().innerHTML.indexOf('Hasil gerbang praktik') < 0);
benar('UKK-X-1', 4); klik('kirim');
T('kirim lengkap: hasil Lulus nilai 100', ov().innerHTML.indexOf('Lulus') > -1 && ov().innerHTML.indexOf('Nilai gerbang 100') > -1 && ov().innerHTML.indexOf('data-ukg="mulai"') > -1);
const db = JSON.parse(store['tbsm-ukk-gerbang-v1']);
T('jawaban tersimpan per akun dan unit', !!db.s1 && !!db.s1['UKK-X-1'] && Object.keys(db.s1['UKK-X-1'].jwb).length === 5);
klik('mulai'); T('Mulai menutup gerbang dan menjalankan unit', !ov() && mulai.length === 1 && mulai[0][0] === 'UKK-X-1');
mulai.length = 0; ctx.window.startExam('UKK-X-1'); T('sudah lulus: berikutnya langsung ke unit', mulai.length === 1 && !ov());
ctx.S.user = { id: 's2', username: 'siswa2' }; mulai.length = 0; ctx.window.startExam('UKK-X-1'); T('akun lain tetap dihadang', mulai.length === 0 && !!ov());
klik('tutup'); T('Tutup menghapus gerbang dan memulihkan scroll', !ov() && body.style.overflow === '');
/* jawaban salah: belum lulus, kunci tidak terbuka, boleh diulang */
reset(); ctx.window.startExam('UKK-XI-1'); for (let i = 0; i < 5; i++) salah('UKK-XI-1', i); klik('kirim');
{ const h = ov().innerHTML; const e0 = run("UKK_GERBANG['UKK-XI-1'][0].e").slice(0, 40);
  T('jawaban salah: Belum lulus, tanpa tombol Mulai', h.indexOf('Belum lulus') > -1 && h.indexOf('data-ukg="mulai"') < 0 && h.indexOf('data-ukg="ulang"') > -1);
  T('siswa tidak melihat kunci dan pembahasan', h.indexOf(esc(e0)) < 0 && h.indexOf('kunci:') < 0); }
klik('ulang'); T('Perbaiki jawaban kembali ke soal dengan jawaban tersimpan', ov().innerHTML.indexOf('Kirim jawaban') > -1 && ov().innerHTML.indexOf(' checked') > -1);
for (let i = 0; i < 5; i++) benar('UKK-XI-1', i); klik('kirim'); T('boleh diulang sampai lulus (tanpa batas percobaan)', ov().innerHTML.indexOf('Lulus') > -1);
/* pilihan ditukar: kompleks dicentang lalu dilepas */
reset(); ctx.window.startExam('UKK-X-1'); chg({ dataset: { ukgIn: '3' }, value: '0', checked: true }); chg({ dataset: { ukgIn: '3' }, value: '0', checked: false });
T('kompleks dilepas kembali = belum terjawab', run('UKG.jwb[3]') === undefined);

/* ===== 5. Pratinjau guru ===== */
reset(); STAFF = true; klik('pratinjau', 'UKK-X-1');
T('guru: pratinjau terbuka bertanda pratinjau', !!ov() && ov().innerHTML.indexOf('pratinjau guru') > -1);
for (let i = 0; i < 5; i++) benar('UKK-X-1', i); klik('kirim');
T('pratinjau memuat kunci dan pembahasan', ov().innerHTML.indexOf('kunci:') > -1 && ov().innerHTML.indexOf('Soal 5') > -1);
T('pratinjau tanpa tombol Mulai dan tidak disimpan', ov().innerHTML.indexOf('data-ukg="mulai"') < 0 && !store['tbsm-ukk-gerbang-v1']);
reset(); STAFF = false; klik('pratinjau', 'UKK-X-1'); T('siswa tidak dapat membuka pratinjau', !ov());

/* ===== 6. Kartu unit ===== */
reset(); let h = ctx.ukkCardAction(JOBS['UKK-X-1']);
T('kartu siswa belum lulus: ada penanda dan tombol asli', h.indexOf('Gerbang praktik belum lulus') > -1 && h.indexOf('<button>Mulai</button>') > -1);
ctx.window.startExam('UKK-X-1'); for (let i = 0; i < 5; i++) benar('UKK-X-1', i); klik('tutup');
h = ctx.ukkCardAction(JOBS['UKK-X-1']); T('kartu siswa lulus: Gerbang lulus 100', h.indexOf('Gerbang lulus · 100') > -1);
T('kartu unit tanpa gerbang tidak berubah', ctx.ukkCardAction(JOBS['UKK-1']) === '<button>Mulai</button>');
STAFF = true; h = ctx.ukkCardAction(JOBS['UKK-XI-1']); T('kartu guru: tombol Pratinjau gerbang', h.indexOf('data-ukg="pratinjau"') > -1 && h.indexOf('data-v="UKK-XI-1"') > -1);

/* ===== 7. Nilai gerbang di rincian hasil ===== */
reset(); ctx.window.startExam('UKK-XI-1'); for (let i = 0; i < 5; i++) benar('UKK-XI-1', i); klik('tutup');
ctx.V.job = JOBS['UKK-XI-1']; ctx.S.results = [{ id: 'r0', jobId: 'UKK-1', siswa: 'Lain' }, { id: 'r1', jobId: 'UKK-XI-1', siswa: 'Budi', tipe: 'Penilaian' }];
ctx.window.ukkSimpanRincian(1);
{ const p = JSON.parse(ctx.S.results[1].payload); T('payload hasil memuat gb {nilai, kkm, lulus}', p.gb && p.gb.nilai === 100 && p.gb.kkm === 75 && p.gb.lulus === true && p.nama === 'Budi', JSON.stringify(p)); }
T('hasil unit lain tidak disentuh', ctx.S.results[0].payload === undefined);
T('Hasil penilaian guru menampilkan nilai gerbang', ctx.jenisTampil(ctx.S.results[1]) === 'Penilaian · Gerbang 100');
T('hasil tanpa gerbang tampil seperti semula', ctx.jenisTampil({ tipe: 'Latihan' }) === 'Latihan');
reset(); STAFF = true; ctx.V.job = JOBS['UKK-XI-1']; ctx.S.results = [{ id: 'r1', jobId: 'UKK-XI-1', siswa: 'Budi' }]; ctx.window.ukkSimpanRincian(0);
T('hasil yang disimpan guru tidak diberi gb', JSON.parse(ctx.S.results[0].payload).gb === undefined);

console.log(lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
