#!/usr/bin/env node
/* Uji tampilan pengawas hari ujian (js/cbt-staf.js): peringatan, ringkasan per kelas, cadangan Excel otomatis. node tools/uji-pantau.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };
const store = {}, toasts = [], files = [], sheets = [];
let NOW = Date.parse('2026-11-21T08:00:00Z');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const el = () => ({ addEventListener() {}, appendChild() {}, remove() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, dataset: {}, querySelector: () => null, querySelectorAll: () => [] });
const ctx = {
  console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, Promise, JSON, Math, Date, Object, Array, String, Number, Error,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  document: Object.assign(el(), { hidden: false, getElementById: () => null, createElement: el, body: el() }),
  esc, toast: (m) => toasts.push(m), render() {}, Jam: { now: () => NOW }, S: { user: { id: 'g1' }, users: [], kkm: 75 },
  Cloud: { on: true, list: async () => [] }, CFG: {}, Appwrite: { Query: { equal: () => ({}) } },
  BS: { D: { sesi: [], hasil: [] }, tab: 'pantau', tk: {}, tkR: {} },
  bsOn: () => true, bsAman: () => true, isStaff: () => true, hasRole: (u, r) => (u.peran || []).includes(r), schAkunOk: () => true,
  bsSesiStatus: (s) => (s.selesai && NOW > s.selesai ? { k: 'end' } : s.mulai && NOW < s.mulai ? { k: 'soon' } : { k: 'on' }),
  bsFromDoc: (d) => d, bsWaktu: String, mmss: String, ymd: (t) => new Date(t).toISOString().slice(0, 10),
  XLSX: { utils: { book_new: () => ({ s: [] }), json_to_sheet: (r) => r, book_append_sheet: (wb, sh, nm) => { wb.s.push(nm); sheets.push({ nm, rows: sh }); } }, writeFile: (wb, nm) => files.push(nm) },
  autoNilai: async () => {}, cbtFn: async () => ({ rows: [], now: NOW }),
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; vm.createContext(ctx);
try { vm.runInContext(fs.readFileSync(path.join(root, 'js/cbt-staf.js'), 'utf8'), ctx, { filename: 'cbt-staf.js' }); } catch (e) { ok('memuat cbt-staf.js', false, e.message); }
const U = ctx._ujiPantau; ok('kait uji tersedia', !!U);
if (!U) process.exit(1);

/* data uji: 2 kelas, 10 siswa */
const mkUser = (i, kls) => ({ id: 'A' + i, nama: 'Siswa ' + i, kelas: kls, sekolah: 'MEDINA', aktif: true, peran: ['siswa'] });
ctx.S.users = []; for (let i = 0; i < 6; i++) ctx.S.users.push(mkUser(i, 'XI-A')); for (let i = 6; i < 10; i++) ctx.S.users.push(mkUser(i, 'XI-B'));
const sesi = { id: 'S3', judul: 'Ujian SEB', kelas: 'ALL', sekolah: 'MEDINA', seb: true, durasi: 30, kkm: 70, mulai: NOW - 20 * 60000, selesai: NOW + 3600000 };
ctx.BS.D.sesi = [sesi];
const run = (sid, o = {}) => Object.assign({ $id: 'R' + sid, sid, sesiId: 'S3', $createdAt: new Date(NOW - 10 * 60000).toISOString(), $updatedAt: new Date(NOW - 20000).toISOString(), payload: JSON.stringify({ dur: 1800, ids: ['q1', 'q2'], ans: { q1: 1 }, pindah: 0 }) }, o);
const P = U.PN; P.sesi = 'S3'; P.sesiLoaded = 'S3';
P.runs = [
  run('A0'),                                                                    // mengerjakan, aktif
  run('A1', { $updatedAt: new Date(NOW - 300000).toISOString() }),             // mengerjakan, tidak aktif 5 menit
  run('A2', { done: true }),                                                    // selesai
  run('A6')                                                                     // kelas XI-B mengerjakan
];
P.hasil = [{ sesiId: 'S3', mode: 'ujian', sid: 'A2', score: 80, benar: 8, total: 10, detik: 600, pindah: 0 }];
const rowsOf = () => { const runs = {}; P.runs.forEach((d) => { runs[d.sid] = d; }); const hs = {}; P.hasil.forEach((h) => { hs[h.sid] = h; });
  return ctx.S.users.map((u) => ({ u, s: U.status(u, sesi, runs, hs) })); };
const hitung = (rows) => { const c = { belum: 0, on: 0, done: 0, lock: 0, habis: 0 }; rows.forEach((r) => { c[r.s.k]++; }); return c; };

console.log('Peringatan dan ringkasan per kelas');
let rows = rowsOf(), c = hitung(rows);
let h = U.peringatan(sesi, rows, c);
ok('siswa tidak aktif lebih dari 2,5 menit diperingatkan, lengkap dengan nama', /1 siswa tidak aktif/.test(h) && /Siswa 1/.test(h), h);
ok('siswa yang aktif tidak disebut', !/Siswa 0\b/.test(h));
ok('belum mulai 6 dari 10 setelah 20 menit: diperingatkan', /6 dari 10 siswa belum mulai/.test(h), h);
const pk = U.perKelas(rows);
ok('ringkasan per kelas memuat dua kelas dengan hitungan benar', /XI-A<\/b> · 6 siswa · selesai <b class="mono">1<\/b> · mengerjakan <b class="mono">2<\/b> · belum <b class="mono">3<\/b> · tidak aktif <b class="mono">1<\/b>/.test(pk) && /XI-B<\/b> · 4 siswa/.test(pk), pk);
ok('satu kelas saja: tanpa ringkasan per kelas', U.perKelas(rows.filter((r) => r.u.kelas === 'XI-A')) === '');
ok('nama siswa di peringatan aman dari HTML', (() => { ctx.S.users[1].nama = '<b>X</b>'; const r = rowsOf(); const t = U.peringatan(sesi, r, hitung(r)); ctx.S.users[1].nama = 'Siswa 1'; return !/<b>X<\/b>/.test(t) && /&lt;b&gt;X/.test(t); })());

console.log('SEB ditolak');
P.seb.S3 = { now: NOW, rows: [{ sid: 'A3', nama: 'Siswa 3', kelas: 'XI-A', n: 2, why: 'ck', last: NOW - 60000 }, { sid: 'A4', nama: 'Siswa 4', kelas: 'XI-A', n: 1, why: 'ua', last: NOW - 120000 }, { sid: 'A2', nama: 'Siswa 2', kelas: 'XI-A', n: 1, why: 'ua', last: NOW - 90000 }, { sid: 'A5', nama: 'Siswa 5', kelas: 'XI-A', n: 1, why: 'ck', last: NOW - 40 * 60000 }] };
h = U.peringatan(sesi, rowsOf(), c);
ok('2 siswa belum mulai yang ditolak SEB: diperingatkan dengan rincian alasan', /2 siswa ditolak SEB dalam 15 menit terakhir \(1 Config Key tidak cocok, 1 bukan dibuka dari SEB\)/.test(h), h);
ok('siswa yang akhirnya berhasil (A2) dan penolakan lama (A5) tidak dihitung', !/Siswa 2\b/.test(h.split('ditolak SEB')[1] || '') && !/Siswa 5/.test(h));
ok('alasan Config Key disertai petunjuk perbaikan', /SEB_CONFIG_KEYS/.test(h));
sesi.seb = false; ok('sesi bukan Wajib SEB: tidak ada peringatan SEB', !/ditolak SEB/.test(U.peringatan(sesi, rowsOf(), c))); sesi.seb = true;
P.runs = P.runs.map((d) => d); for (const k of ['A0', 'A1', 'A6']) P.runs.find((d) => d.sid === k).$updatedAt = new Date(NOW - 5000).toISOString();
rows = rowsOf(); c = hitung(rows);
ok('semua aktif, belum mulai sedikit: tanpa peringatan tidak aktif', !/tidak aktif lebih/.test(U.peringatan(sesi, rows, c)));

console.log('Cadangan Excel');
ctx.localStorage.removeItem('tbsm-cad-S3');
ok('Cadangan manual berhasil', U.cadangan(false) === true && files.length === 1 && /^cadangan-Ujian_SEB-\d{4}-\d{2}-\d{2}-\d{4}\.xlsx$/.test(files[0]), files.join());
const st = sheets.find((x) => x.nm === 'Status dan nilai').rows;
ok('lembar Status dan nilai memuat semua 10 siswa', st.length === 10, st.length);
const a2 = st.find((x) => x.Nama === 'Siswa 2'), a0 = st.find((x) => x.Nama === 'Siswa 0'), a9 = st.find((x) => x.Nama === 'Siswa 9');
ok('siswa selesai: nilai dan ketuntasan benar', a2.Nilai === 80 && a2.Tuntas === 'Tuntas' && a2.Benar === 8, JSON.stringify(a2));
ok('siswa mengerjakan: terjawab 1/2, belum bernilai', a0.Terjawab === '1/2' && a0.Nilai === '', JSON.stringify(a0));
ok('siswa belum mulai: status Belum mulai', a9.Status === 'Belum mulai' && a9.Terjawab === '', JSON.stringify(a9));
ok('lembar SEB ditolak dan Info ikut dibuat', sheets.some((x) => x.nm === 'SEB ditolak' && x.rows.length === 4) && sheets.some((x) => x.nm === 'Info' && x.rows[0].Jenis === 'Manual'));

console.log('Cadangan otomatis');
files.length = 0; toasts.length = 0; ctx.localStorage.removeItem('tbsm-cad-S3');
U.auto(); ok('sesi masih berjalan dan belum semua selesai: tidak otomatis', files.length === 0);
NOW = sesi.selesai + 60000;   // sesi berakhir semenit lalu
U.auto(); ok('sesi berakhir: cadangan diunduh otomatis sekali, dengan pemberitahuan', files.length === 1 && toasts.some((t) => /diunduh otomatis/.test(t)), files.join());
U.auto(); U.auto(); ok('dipanggil lagi: tidak mengunduh ulang', files.length === 1, files.length);
ctx.localStorage.removeItem('tbsm-cad-S3'); files.length = 0; NOW = sesi.selesai + 3 * 24 * 3600000;
U.auto(); ok('sesi berakhir lebih dari 24 jam lalu: tidak otomatis saat pengawas sekadar membuka', files.length === 0, files.join());
NOW = sesi.selesai - 60000; sesi.selesai = NOW + 3600000; files.length = 0; ctx.localStorage.removeItem('tbsm-cad-S3');
P.runs = ctx.S.users.map((u) => run(u.id, { done: true })); P.hasil = ctx.S.users.map((u) => ({ sesiId: 'S3', mode: 'ujian', sid: u.id, score: 70, benar: 7, total: 10, detik: 500 }));
U.auto(); ok('semua peserta selesai sebelum waktu habis: cadangan otomatis', files.length === 1, files.join());
files.length = 0; ctx.localStorage.removeItem('tbsm-cad-S3'); P.err = 'gagal memuat';
U.auto(); ok('data gagal dimuat: tidak mencadangkan data kosong', files.length === 0); P.err = '';

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
