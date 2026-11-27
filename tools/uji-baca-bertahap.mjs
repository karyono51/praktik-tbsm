#!/usr/bin/env node
/* Uji pembacaan bertahap saat login dan Segarkan (js/core.js: Cloud.muatData). node tools/uji-baca-bertahap.mjs
   Server Appwrite ditiru: yang dihitung adalah jumlah dokumen yang dikembalikan (cara Appwrite menghitung "database reads"). */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };

const src = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8');
const cut = (a, b, incl = true) => { const i = src.indexOf(a); const j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('potongan tidak ditemukan: ' + a); return src.slice(i, j + (incl ? b.length : 0)); };
const kode = [
  cut('function fromDoc(d)', '\n', false),
  cut('function lkModDoc(d)', '\n', false),
  cut('var INC_V=1', 'return {arr:[],st:null,n:0,inc:false}}}'),
  'var Cloud={ ' + cut('muatData:async function', 'obs:R.obs&&R.obs.arr}}') + ' };',
].join('\n');

let NOW = Date.parse('2026-11-27T09:00:00Z');
class D extends Date { constructor(...a) { if (a.length) super(...a); else super(NOW); } static now() { return NOW; } }
const store = {};
const server = {}; let baca = 0, tanyaBertahap = 0, gagalBertahap = false; const log = [];
const iso = (t) => new Date(t).toISOString();
const Q = { limit: (n) => ({ m: 'limit', v: n }), cursorAfter: (v) => ({ m: 'cur', v }), equal: (a, v) => ({ m: 'eq', a, v }), greaterThan: (a, v) => ({ m: 'gt', a, v }) };
const ctx = {
  console: { log() {}, warn() {}, error: console.error }, Promise, JSON, Math, Object, Array, String, Number, Error, Date: D,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  CFG: { DB: 'tbsm' }, Appwrite: { Query: Q }, S: { user: null, users: [], results: [], lkpd: [], lkpdModules: [], observasi: [] },
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(kode + '\nthis.Cloud=Cloud;this.incBase=incBase;this.INC_PENUH=INC_PENUH;', ctx);
const Cloud = ctx.Cloud;
/* list() meniru Cloud.list: menyaring dengan equal dan greaterThan, menghitung dokumen yang dikembalikan */
Cloud.list = async function (col, extra = []) {
  let rows = (server[col] || []).slice();
  let gt = false;
  for (const q of extra) {
    if (q.m === 'eq') rows = rows.filter((d) => q.v.includes(d[q.a]));
    if (q.m === 'gt') { gt = true; rows = rows.filter((d) => Date.parse(d[q.a]) > Date.parse(q.v)); }
  }
  if (gt) { tanyaBertahap++; if (gagalBertahap) throw new Error('indeks tidak ada'); }
  baca += rows.length; log.push(col + ':' + (gt ? 'bertahap' : 'penuh') + ':' + rows.length);
  return JSON.parse(JSON.stringify(rows));
};
const doc = (id, t, extra = {}) => Object.assign({ $id: id, $updatedAt: iso(t) }, extra);
const T0 = NOW - 5 * 86400000;
const buat = () => {
  server.akun = []; server.hasil = []; server.lkpd = []; server.lkpd_modules = []; server.observasi = [];
  for (let i = 0; i < 40; i++) server.akun.push(doc('u' + i, T0 + i * 60000, { nama: 'U' + i, peran: i < 3 ? 'guru' : 'siswa', email: 'u' + i + '@x.id' }));
  for (let i = 0; i < 300; i++) server.hasil.push(doc('h' + i, T0 + i * 60000, { sid: 'u' + (3 + i % 37), score: 80 }));
  for (let i = 0; i < 200; i++) server.lkpd.push(doc('l' + i, T0 + i * 60000, { sid: 'u' + (3 + i % 37), score: 70 }));
  for (let i = 0; i < 25; i++) server.lkpd_modules.push(doc('LKPD-' + i, T0 + i * 60000, { moduleId: 'LKPD-' + i, title: 'M' + i, payload: JSON.stringify({ steps: [i] }) }));
  for (let i = 0; i < 30; i++) server.observasi.push(doc('o' + i, T0 + i * 60000, { guruId: 'u0' }));
};
const staf = { id: 'u0', peran: 'guru' }, siswa = { id: 'u5', peran: 'siswa' };
/* meniru Cloud.enter + saveSnap */
const masuk = async (p, isStaf, { paksa = false, mem = false } = {}) => {
  baca = 0; log.length = 0; tanyaBertahap = 0;
  const Dt = await Cloud.muatData(p, isStaf, paksa, mem);
  ctx.S.user = p; ctx.S.users = Dt.users || [p]; ctx.S.results = Dt.results; ctx.S.lkpd = Dt.lkpd; ctx.S.lkpdModules = Dt.mods; if (Dt.obs) ctx.S.observasi = Dt.obs;
  return Dt;
};
const simpanSnap = () => { store['tbsm-snap'] = JSON.stringify({ user: ctx.S.user, users: ctx.S.users, results: ctx.S.results, lkpd: ctx.S.lkpd, lkpdModules: ctx.S.lkpdModules, observasi: ctx.S.observasi, inc: ctx.S.inc, ts: NOW }); };

console.log('Staf: login pertama (belum ada salinan) membaca penuh');
buat();
let r = await masuk(staf, true);
const total = 40 + 300 + 200 + 25 + 30;
ok('login pertama membaca semua dokumen', baca === total, baca + ' dari ' + total);
ok('hasil lengkap termuat', r.users.length === 40 && r.results.length === 300 && r.lkpd.length === 200 && r.mods.length === 25 && r.obs.length === 30);
ok('payload modul LKPD diurai seperti semula', r.mods[3].steps && r.mods[3].steps[0] === 3 && r.mods[3].r === 1 && r.mods[3].d === 0);
ok('status bertahap tercatat per koleksi', ['akun', 'hasil', 'lkpd', 'mods', 'obs'].every((k) => ctx.S.inc.c[k] && ctx.S.inc.c[k].s));
simpanSnap();

console.log('Staf: login berikutnya hanya membaca yang berubah');
NOW += 3600000;
server.hasil[10] = doc('h10', NOW - 1000, { sid: 'u8', score: 95 });
server.hasil.push(doc('hBARU', NOW - 500, { sid: 'u9', score: 60 }));
server.lkpd_modules[2] = doc('LKPD-2', NOW - 800, { moduleId: 'LKPD-2', title: 'Diubah', payload: '{}' });
r = await masuk(staf, true);
/* tiap koleksi membaca ulang dokumen terbarunya (jendela pengaman 15 detik): paling banyak 1 dokumen tambahan per koleksi */
ok('hanya 3 perubahan + dokumen pengaman yang dibaca (bukan ' + total + ')', baca >= 3 && baca <= 3 + 5, baca + ' ' + log.join(' '));
ok('nilai yang diubah ikut diperbarui', r.results.find((x) => x.id === 'h10').score === 95);
ok('nilai baru muncul, jumlah total benar', r.results.some((x) => x.id === 'hBARU') && r.results.length === 301);
ok('modul yang diubah terbarui', r.mods.find((x) => x.id === 'LKPD-2').title === 'Diubah' && r.mods.length === 25);
ok('koleksi lain utuh', r.users.length === 40 && r.lkpd.length === 200 && r.obs.length === 30);
simpanSnap();

console.log('Staf: tidak ada perubahan sama sekali = nol pembacaan');
NOW += 60000;
r = await masuk(staf, true);
ok('tanpa perubahan, hanya dokumen pengaman (paling banyak 1 per koleksi) yang dibaca', baca <= 5 + 1, baca + ' ' + log.join(' '));
simpanSnap();

console.log('Segarkan memakai data yang sedang dipakai');
NOW += 60000;
server.observasi.push(doc('oBARU', NOW - 100, { guruId: 'u1' }));
r = await masuk(staf, true, { mem: true });
ok('Segarkan hanya membaca dokumen baru + pengaman', baca <= 5 + 2 && r.obs.some((x) => x.id === 'oBARU') && r.obs.length === 31, baca + ' ' + log.join(' '));

console.log('Dokumen yang dihapus di perangkat lain');
server.hasil = server.hasil.filter((x) => x.$id !== 'h20');
NOW += 60000;
r = await masuk(staf, true, { mem: true });
ok('belum hilang selama pembacaan bertahap (diketahui, menunggu pembacaan penuh)', r.results.some((x) => x.id === 'h20'));
NOW += 9 * 3600000;
r = await masuk(staf, true, { mem: true });
ok('setelah melewati batas pembacaan penuh (8 jam) dokumen terhapus hilang', !r.results.some((x) => x.id === 'h20') && baca >= 300, baca);
server.hasil = server.hasil.filter((x) => x.$id !== 'h21');
ctx.window.TBSM_PENUH = true;
r = await masuk(staf, true, { mem: true, paksa: true });
ok('pembacaan dipaksa (setelah Hapus nilai) langsung menghilangkan dokumen terhapus', !r.results.some((x) => x.id === 'h21'));

console.log('Dokumen lokal yang belum terkirim tidak ditimpa');
simpanSnap(); NOW += 60000;
ctx.S.results.find((x) => x.id === 'h30').score = 11; ctx.S.results.find((x) => x.id === 'h30').d = 1;
server.hasil.find((x) => x.$id === 'h30').$updatedAt = iso(NOW - 100); server.hasil.find((x) => x.$id === 'h30').score = 99;
r = await masuk(staf, true, { mem: true });
ok('perubahan lokal (d=1) bertahan', r.results.find((x) => x.id === 'h30').score === 11);
ctx.S.results.find((x) => x.id === 'h30').d = 0;

console.log('Cadangan bila pembacaan bertahap gagal');
simpanSnap(); NOW += 60000;
gagalBertahap = true;
r = await masuk(staf, true, { mem: true });
ok('kembali ke pembacaan penuh, data tetap lengkap', r.results.length === 299 && baca >= 300 && r.users.length === 40, baca + ' ' + r.results.length);
gagalBertahap = false;

console.log('Salinan milik akun lain tidak dipakai');
simpanSnap();
r = await masuk({ id: 'u1', peran: 'guru' }, true);
ok('akun berbeda membaca penuh', baca >= 300, baca);
simpanSnap();
r = await masuk({ id: 'u1', peran: 'guru' }, false);
ok('peran berbeda (staf -> siswa) membaca penuh, hanya miliknya', r.results.every((x) => x.sid === 'u1') && !r.users, log.join(' '));

console.log('Penghapusan di perangkat ini setelah salinan disimpan');
buat(); r = await masuk(staf, true); simpanSnap();
store['tbsm-hapus-ts'] = String(NOW + 1000); NOW += 5000;
r = await masuk(staf, true);
ok('salinan yang lebih tua dari penghapusan tidak dipakai (baca penuh)', baca === total, baca);
simpanSnap();
r = await masuk(staf, true);
ok('setelah salinan baru disimpan, pembacaan bertahap lagi', baca <= 5 + 1, baca);

console.log('Siswa: nilai dan LKPD miliknya, modul bertahap');
buat(); NOW += 1000; r = await masuk(siswa, false); simpanSnap();
const milikHasil = server.hasil.filter((x) => x.sid === 'u5').length, milikLk = server.lkpd.filter((x) => x.sid === 'u5').length;
ok('login pertama siswa: hanya miliknya + 25 modul', baca === milikHasil + milikLk + 25, baca + ' vs ' + (milikHasil + milikLk + 25));
ok('siswa tidak memuat akun dan observasi', !r.users && !r.obs);
NOW += 600000;
server.hasil.push(doc('hS', NOW - 100, { sid: 'u5', score: 88 })); server.hasil.push(doc('hLain', NOW - 100, { sid: 'u6', score: 88 }));
r = await masuk(siswa, false);
ok('login berikutnya siswa membaca ' + baca + ' dokumen (bukan ' + (milikHasil + milikLk + 25) + ')', baca >= 1 && baca <= 1 + 3, baca + ' ' + log.join(' '));
ok('nilai siswa lain tidak ikut terbaca', !r.results.some((x) => x.id === 'hLain') && r.results.some((x) => x.id === 'hS'));
simpanSnap(); NOW += 4 * 3600000;
r = await masuk(siswa, false);
ok('siswa: pembacaan penuh diulang tiap 3 jam', baca >= milikHasil + milikLk + 25, baca);

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
