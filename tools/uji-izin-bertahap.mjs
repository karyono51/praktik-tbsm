#!/usr/bin/env node
/* Uji pemberian izin nilai secara bertahap (js/hasil-izin.js): tidak lagi membaca seluruh koleksi hasil dan uid_map tiap kali.
   node tools/uji-izin-bertahap.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };

let NOW = Date.parse('2026-11-27T09:00:00Z');
class D extends Date { constructor(...a) { if (a.length) super(...a); else super(NOW); } static now() { return NOW; } }
const iso = (t) => new Date(t).toISOString();
const store = {}, server = { hasil: [], uid_map: [] }; let baca = 0, ubah = [];
const Q = { equal: (a, v) => ({ m: 'eq', a, v }), greaterThan: (a, v) => ({ m: 'gt', a, v }) };
const Cloud = {
  on: true, authId: 'A-guru',
  list: async (col, extra = []) => {
    let rows = server[col].slice();
    for (const q of extra) { if (q.m === 'eq') rows = rows.filter((d) => q.v.includes(d[q.a])); if (q.m === 'gt') rows = rows.filter((d) => Date.parse(d[q.a]) > Date.parse(q.v)); }
    baca += rows.length; return JSON.parse(JSON.stringify(rows));
  },
  db: { updateDocument: async (db, col, id, data, perms) => { const d = server[col].find((x) => x.$id === id); NOW += 1000; d.$permissions = perms; d.$updatedAt = iso(NOW); ubah.push(id); return JSON.parse(JSON.stringify(d)); }, createDocument: async () => ({}) },
  flush: async () => {}, enter: async () => {},
};
const ctx = {
  console: { log() {}, warn() {}, error: console.error }, Promise, JSON, Math, Object, Array, String, Number, Error, Date: D, setTimeout: () => 0,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  CFG: { DB: 'tbsm' }, Appwrite: { Query: Q, Permission: { read: (r) => 'read("' + r + '")' }, Role: { user: (id) => 'user:' + id } },
  Cloud, S: { user: { id: 'g1', email: 'guru@x.id', peran: 'guru' }, users: [] }, isStaff: () => true, createOwned: async () => ({}),
  addEventListener() {},
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/hasil-izin.js'), 'utf8'), ctx, { filename: 'hasil-izin.js' });
const beri = ctx.window.hasilBeriIzin; ok('hasilBeriIzin tersedia', typeof beri === 'function');

const T0 = NOW - 10 * 86400000;
for (let i = 0; i < 20; i++) ctx.S.users.push({ id: 's' + i, email: 's' + i + '@x.id' });
/* 15 siswa sudah punya pemetaan login; 5 siswa (s15..s19) belum */
for (let i = 0; i < 15; i++) server.uid_map.push({ $id: 'A' + i, sid: 's' + i, email: 's' + i + '@x.id', $updatedAt: iso(T0 + i * 60000) });
for (let i = 0; i < 200; i++) server.hasil.push({ $id: 'h' + i, sid: 's' + (i % 20), $permissions: i < 100 ? ['read("user:A' + (i % 20) + '")'] : [], $updatedAt: iso(T0 + i * 60000) });
const butuh = (d) => /^s(\d+)$/.test(d.sid) && +d.sid.slice(1) < 15 && !d.$permissions.some((p) => p.includes('user:A' + d.sid.slice(1)));
let perluAwal = server.hasil.filter(butuh).length;

console.log('Pertama kali di perangkat: pembacaan penuh');
let n = await beri(true);
ok('semua hasil yang belum berizin diberi izin (' + perluAwal + ')', n === perluAwal && ubah.length === perluAwal, n + ' ' + ubah.length);
ok('membaca uid_map dan seluruh hasil sekali (15 + 200)', baca === 215, baca);
ok('semua hasil siswa bermapping kini berizin', server.hasil.every((d) => !butuh(d)));

console.log('Berikutnya: hanya yang berubah');
NOW += 600000; baca = 0; ubah = [];
n = await beri(true);
ok('tidak ada yang baru: hanya dokumen pengaman yang terbaca, bukan 215', baca <= 20, baca);
const bacaKosong = baca;
NOW += 600000; baca = 0; ubah = [];
n = await beri(true);
ok('putaran ketiga: tetap hanya dokumen pengaman', baca <= 20, baca);

console.log('Hasil baru dan siswa yang baru mendaftarkan login');
NOW += 600000; baca = 0; ubah = [];
server.hasil.push({ $id: 'hBaru', sid: 's3', $permissions: [], $updatedAt: iso(NOW - 1000) });
server.uid_map.push({ $id: 'A15', sid: 's15', email: 's15@x.id', $updatedAt: iso(NOW - 500) });
const lamaS15 = server.hasil.filter((d) => d.sid === 's15').length;
n = await beri(true);
ok('hasil baru milik siswa lama diberi izin', server.hasil.find((d) => d.$id === 'hBaru').$permissions.some((p) => p.includes('user:A3')));
ok('hasil lama milik siswa yang baru mendaftar login ikut diberi izin (' + lamaS15 + ')', server.hasil.filter((d) => d.sid === 's15').every((d) => d.$permissions.some((p) => p.includes('user:A15'))));
ok('bacaan kecil, tidak membaca seluruh hasil', baca < 60, baca);

console.log('Throttle dan pembacaan penuh berkala');
NOW += 10000; baca = 0;
await beri(false);
ok('panggilan tanpa paksa dalam 5 menit tidak membaca apa pun', baca === 0, baca);
NOW += 4 * 86400000; baca = 0;
await beri(true);
ok('setelah 3 hari pembacaan penuh diulang', baca >= 200, baca);

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
