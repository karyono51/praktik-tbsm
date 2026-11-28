#!/usr/bin/env node
/* Uji pembacaan bertahap modul PKL untuk staf (js/pkl.js: pkLoad). node tools/uji-pkl-bertahap.mjs
   Yang dihitung: jumlah dokumen yang dikembalikan server (cara Appwrite menghitung "database reads"). */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); } };
const src = fs.readFileSync(path.join(root, 'js/pkl.js'), 'utf8');
const a = src.indexOf('var PKC='), a2 = src.indexOf('\n', a);
const b = src.indexOf('function pkParse'), b2 = src.indexOf('function pkSlug');
const c = src.indexOf('var PK_PENUH='), c2 = src.indexOf('function pkPut(');
if (a < 0 || b < 0 || c < 0 || c2 < 0) throw new Error('potongan tidak ditemukan');
const kode = src.slice(a, a2) + '\n' + src.slice(b, b2) + '\n' + src.slice(c, c2);
let NOW = Date.parse('2026-11-28T08:00:00Z'), staf = true, baca = 0, gagalInc = false; const store = {};
class D extends Date { constructor(...x) { if (x.length) super(...x); else super(NOW); } static now() { return NOW; } }
const server = { pkl: [], pkl_catat: [], pkl_nilai: [] };
const iso = (t) => new Date(t).toISOString();
const Q = { greaterThan: (a, v) => ({ m: 'gt', a, v }), equal: (a, v) => ({ m: 'eq', a, v }) };
const ctx = {
  console: { log() {}, warn() {}, error: console.error }, Promise, JSON, Math, Object, Array, String, Number, Error, Date: D,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, Appwrite: { Query: Q }, CFG: { DB: 'tbsm' }, S: { user: { id: 'g1' }, tab: 'x' }, isStaff: () => staf, render() {},
  PK: { D: { tempat: [], tugas: [], absen: [], jurnal: [], kunjungan: [], nilai: [], cek: [], setelan: [] }, loaded: false, loading: false, err: [] },
  pkFlush: async () => {}, pkSaveLocal() {}, pkLoadLocal() {},
  Cloud: { on: true, db: {}, async list(col, extra = []) {
    let rows = server[col].slice(), inc = false;
    for (const q of extra) if (q.m === 'gt') { inc = true; rows = rows.filter((d) => Date.parse(d.$updatedAt) > Date.parse(q.v)); }
    if (inc && gagalInc) throw new Error('indeks tidak ada');
    baca += rows.length; return JSON.parse(JSON.stringify(rows)); } },
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(kode + '\nthis.pkLoad=pkLoad;', ctx);
const dok = (id, jenis, t, extra = {}) => Object.assign({ $id: id, $updatedAt: iso(t), jenis, ts: t, payload: '{}' }, extra);
const T0 = NOW - 3 * 86400000;
server.pkl = [dok('t1', 'tempat', T0), dok('t2', 'tempat', T0), dok('g1', 'tugas', T0, { sid: 's1' }), dok('g2', 'tugas', T0, { sid: 's2' })];
server.pkl_catat = Array.from({ length: 300 }, (_, i) => dok('a' + i, 'absen', T0 + i * 60000, { sid: 's' + (i % 2) }));
server.pkl_nilai = [dok('n1', 'nilai', T0, { sid: 's1' })];
const muat = async () => { baca = 0; ctx.PK.loading = false; await ctx.pkLoad(); return baca; };
const ada = (k, id) => ctx.PK.D[k].some((x) => x.id === id);

console.log('Staf: pembacaan pertama penuh');
let n = await muat();
ok('pertama membaca semua dokumen (' + n + ')', n === 4 + 300 + 1, n);
ok('data masuk ke salinan', ctx.PK.D.absen.length === 300 && ctx.PK.D.tempat.length === 2);

console.log('Staf: berikutnya hanya yang berubah');
NOW += 600000; n = await muat();
ok('tanpa perubahan hanya beberapa dokumen terbaca (' + n + ' dari 305, selisih = jendela tumpang tindih 15 dtk)', n <= 8, n);
server.pkl_catat.push(dok('baru', 'absen', NOW - 1000, { sid: 's1' }));
server.pkl_catat[5] = dok('a5', 'absen', NOW - 500, { sid: 's1', payload: JSON.stringify({ status: 'sakit' }) });
NOW += 60000; n = await muat();
ok('dokumen baru dan yang diubah terbaca saja (' + n + ')', n >= 2 && n <= 12, n);
ok('dokumen baru tergabung', ada('absen', 'baru') && ctx.PK.D.absen.length === 301);
ok('dokumen yang diubah diperbarui', ctx.PK.D.absen.find((x) => x.id === 'a5').status === 'sakit');

console.log('Dokumen lokal yang belum terkirim tidak ditimpa');
ctx.PK.D.absen.find((x) => x.id === 'a7').d = 1; ctx.PK.D.absen.find((x) => x.id === 'a7').catatan = 'lokal';
server.pkl_catat[7] = dok('a7', 'absen', NOW + 1000, { sid: 's1' });
NOW += 60000; await muat();
ok('perubahan lokal bertahan', ctx.PK.D.absen.find((x) => x.id === 'a7').catatan === 'lokal');

console.log('Pembacaan penuh berkala dan cadangan');
server.pkl_catat = server.pkl_catat.filter((x) => x.$id !== 'a9');
NOW += 60000; await muat();
ok('dokumen terhapus di perangkat lain belum hilang sebelum pembacaan penuh', ada('absen', 'a9'));
NOW += 25 * 3600000; n = await muat();
ok('lewat 24 jam: pembacaan penuh, dokumen terhapus hilang', !ada('absen', 'a9') && n >= 300, n);
gagalInc = true; NOW += 60000; n = await muat();
ok('pembacaan bertahap gagal (indeks): galat tercatat, data lama dipertahankan', ctx.PK.D.absen.length > 290, ctx.PK.err);
gagalInc = false;

console.log('Siswa: tidak memakai pembacaan bertahap, hanya miliknya');
staf = false; Object.keys(store).forEach((k) => delete store[k]);
ctx.PK.D = { tempat: [], tugas: [], absen: [], jurnal: [], kunjungan: [], nilai: [], cek: [], setelan: [] };
n = await muat();
ok('siswa tidak menulis status bertahap', !('tbsm-pkl-inc' in store));

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal'); process.exit(gagal ? 1 : 0);
