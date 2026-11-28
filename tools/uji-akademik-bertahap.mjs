#!/usr/bin/env node
/* Uji pembacaan bertahap data akademik (js/akademik.js: akBacaInc, akLoad). node tools/uji-akademik-bertahap.mjs
   Server Appwrite ditiru: yang dihitung adalah jumlah dokumen yang dikembalikan (cara Appwrite menghitung "database reads"). */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); } };
const src = fs.readFileSync(path.join(root, 'js/akademik.js'), 'utf8');
const i0 = src.indexOf('var AK_FULL_MS'), i1 = src.indexOf('/* tahun ajaran aktif ikut dipakai');
if (i0 < 0 || i1 < 0) throw new Error('potongan tidak ditemukan');
const kode = src.slice(i0, i1);
let NOW = Date.parse('2026-11-28T08:00:00Z');
class D extends Date { constructor(...a) { if (a.length) super(...a); else super(NOW); } static now() { return NOW; } }
const store = {}, server = { akademik: [], akademik_sdm: [] }; let baca = 0, admin = true, gagalInc = false;
const Q = { greaterThan: (a, v) => ({ m: 'gt', a, v }) };
const iso = (t) => new Date(t).toISOString();
const ctx = {
  console: { log() {}, warn() {}, error: console.error }, Promise, JSON, Math, Object, Array, String, Number, Error, Date: D,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, Appwrite: { Query: Q }, S: { user: { id: 'u0' } }, AKD: { D: { tahun: [], kelas: [], mapel: [], tugas: [], guru: [] }, loading: false, loaded: false, err: [], seeded: true },
  isStaff: () => true, akEdit: () => admin, akLoadLocal() {}, akSaveLocal() {}, akFlushQ: async () => {}, akSeed: async () => {}, akTerap() {}, render() {},
  fromDoc: (d) => { const o = { id: d.$id }; Object.keys(d).forEach((k) => { if (k[0] !== '$') o[k] = d[k]; }); o.r = 1; return o; },
  akParse: (o) => { if (typeof o.payload === 'string') Object.assign(o, JSON.parse(o.payload)); return o; },
  Cloud: { on: true, async list(col, extra = []) {
    let rows = (server[col] || []).slice(), gt = false;
    for (const q of extra) if (q.m === 'gt') { gt = true; rows = rows.filter((d) => Date.parse(d[q.a]) > Date.parse(q.v)); }
    if (gt && gagalInc) throw new Error('indeks tidak ada');
    baca += rows.length; return JSON.parse(JSON.stringify(rows)); } },
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(kode + '\nthis.akLoad=akLoad;', ctx);
const doc = (id, jenis, t, extra = {}) => Object.assign({ $id: id, $updatedAt: iso(t), payload: JSON.stringify({ jenis, nama: id }) }, extra);
const T0 = NOW - 5 * 86400000;
const buat = () => {
  server.akademik = [];
  for (let i = 0; i < 4; i++) server.akademik.push(doc('t' + i, 'tahun', T0 + i * 60000));
  for (let i = 0; i < 12; i++) server.akademik.push(doc('k' + i, 'kelas', T0 + i * 60000));
  for (let i = 0; i < 16; i++) server.akademik.push(doc('m' + i, 'mapel', T0 + i * 60000));
  for (let i = 0; i < 4; i++) server.akademik.push(doc('g' + i, 'tugas', T0 + i * 60000));
  server.akademik_sdm = [];
  for (let i = 0; i < 6; i++) server.akademik_sdm.push(doc('s' + i, 'guru', T0 + i * 60000));
};
const muat = async () => { baca = 0; ctx.AKD.loaded = false; ctx.AKD.err = []; await ctx.akLoad(); return baca; };
const n = (k) => ctx.AKD.D[k].length;

console.log('Admin: pemuatan pertama membaca penuh');
buat();
let b = await muat();
ok('pertama membaca semua dokumen (36 + 6)', b === 42, b);
ok('data terpisah menurut jenis', n('tahun') === 4 && n('kelas') === 12 && n('mapel') === 16 && n('tugas') === 4 && n('guru') === 6, ['tahun', 'kelas', 'mapel', 'tugas', 'guru'].map(n));
ok('status bertahap tercatat per koleksi', !!store['tbsm.inc.ak.akademik.u0'] && !!store['tbsm.inc.ak.akademik_sdm.u0']);

console.log('Admin: pemuatan berikutnya hanya yang berubah');
NOW += 3600000;
b = await muat();
ok('tanpa perubahan: paling banyak 1 dokumen per koleksi (jendela pengaman 2 detik)', b <= 2, b);
ok('data tetap utuh', n('mapel') === 16 && n('guru') === 6);
for (let i = 0; i < 9; i++) { NOW += 60000; b = await muat(); }
ok('sembilan muat ulang lagi tetap hemat (<= 2 dokumen tiap kali)', b <= 2, b);

console.log('Perubahan dan dokumen baru');
NOW += 3600000;
server.akademik[20] = doc('m4', 'mapel', NOW - 2000, { payload: JSON.stringify({ jenis: 'mapel', nama: 'DIUBAH' }) });
server.akademik.push(doc('mBARU', 'mapel', NOW - 1000));
server.akademik_sdm.push(doc('sBARU', 'guru', NOW - 500));
b = await muat();
ok('hanya yang berubah dibaca', b <= 5, b);
ok('dokumen diubah terbarui dan dokumen baru muncul', ctx.AKD.D.mapel.find((x) => x.id === 'm4').nama === 'DIUBAH' && n('mapel') === 17 && n('guru') === 7, { m: n('mapel'), g: n('guru') });

console.log('Perubahan lokal yang belum terkirim tidak ditimpa');
ctx.AKD.D.mapel.find((x) => x.id === 'm5').nama = 'LOKAL'; ctx.AKD.D.mapel.find((x) => x.id === 'm5').d = 1;
NOW += 60000; server.akademik[21] = doc('m5', 'mapel', NOW - 100, { payload: JSON.stringify({ jenis: 'mapel', nama: 'SERVER' }) });
await muat();
ok('dokumen dengan perubahan lokal dipertahankan', ctx.AKD.D.mapel.find((x) => x.id === 'm5').nama === 'LOKAL');
ctx.AKD.D.mapel.find((x) => x.id === 'm5').d = 0;

console.log('Penghapusan di server terdeteksi lewat pemuatan penuh (tiap 6 jam)');
server.akademik = server.akademik.filter((d) => d.$id !== 'k3');
NOW += 60000; await muat();
ok('sebelum 6 jam: dokumen terhapus masih ada di salinan', n('kelas') === 12, n('kelas'));
NOW += 6 * 3600000 + 1000; b = await muat();
ok('lewat 6 jam: pembacaan penuh dan dokumen terhapus hilang', b >= 36 && n('kelas') === 11, { b, k: n('kelas') });

console.log('Galat pembacaan bertahap: kembali ke pembacaan penuh');
gagalInc = true; NOW += 60000; b = await muat();
ok('galat indeks: memuat penuh dan data utuh', b >= 36 && n('mapel') === 17, { b, m: n('mapel') });
gagalInc = false;

console.log('Guru (bukan admin): hanya koleksi akademik');
admin = false; ctx.AKD.D = { tahun: [], kelas: [], mapel: [], tugas: [], guru: [] }; Object.keys(store).forEach((k) => delete store[k]);
b = await muat();
ok('guru membaca 36 dokumen akademik dan tidak membaca akademik_sdm', b === 36 && n('guru') === 0, b);
admin = true;

console.log('Kode');
ok('akClear menghapus status bertahap', /tbsm\.inc\.ak\./.test(src.slice(src.indexOf('function akClear'), src.indexOf('function akClear') + 400)));
console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
