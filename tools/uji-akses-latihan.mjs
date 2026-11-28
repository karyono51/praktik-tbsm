#!/usr/bin/env node
/* Uji akses latihan dibuka guru dan pembacaan hemat bank soal (js/banksoal.js, js/akses-latihan.js). node tools/uji-akses-latihan.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); } };
const src = fs.readFileSync(path.join(root, 'js/banksoal.js'), 'utf8');
const cut = (a, b) => { const i = src.indexOf(a); const j = src.indexOf(b, i + a.length); if (i < 0 || j < 0) throw new Error('potongan tidak ditemukan: ' + a); return src.slice(i, j); };
const kode = [
  cut('var BS_TINGKAT=', 'function bsKlsLabel'),
  cut('function bsSesiStatus(s){', 'function bsSesiUntuk'),
  cut('function bsSesiUntuk', 'function bsHasilSaya'),
  cut('var BS_FULL_MS', 'async function bsLoadRahasia'),
].join('\n');

let NOW = Date.parse('2026-11-28T08:00:00Z');
class D extends Date { constructor(...a) { if (a.length) super(...a); else super(NOW); } static now() { return NOW; } }
const store = {}, server = { soal_x: [] }; let baca = {}, staff = false;
const Q = { limit: (n) => ({ m: 'limit', v: n }), cursorAfter: (v) => ({ m: 'cur', v }), equal: (a, v) => ({ m: 'eq', a, v }), greaterThan: (a, v) => ({ m: 'gt', a, v }) };
const ctx = {
  console: { log() {}, warn() {}, error: console.error }, Promise, JSON, Math, Object, Array, String, Number, Error, Date: D,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, Appwrite: { Query: Q }, BSC: { soal: 'banksoal', sesi: 'soal_sesi', hasil: 'soal_hasil', lat: 'soal_sesi' }, BSRUN: 'tbsm-bs-run-',
  S: { user: { id: 'u5', kelas: 'X' } }, BS: { D: { soal: [], sesi: [], hasil: [], lat: [] }, err: [], loading: false, loaded: false, soalOk: false },
  schAkunOk: () => true, isStaff: () => staff, can: () => false, render() {}, bsFlushQ: async () => {}, bsSaveLocal() {}, bsLoadLocal() {}, bsLoadRahasia: async () => {}, bsMigrasi: async () => {}, bsAman: () => true,
  bsFromDoc: (d) => { const o = Object.assign({ id: d.$id, r: 1, d: 0 }, d); if (d.payload) Object.assign(o, JSON.parse(d.payload)); return o; },
  Jam: { now: () => NOW }, Cloud: { on: true, async list(col, extra = []) {
    let rows = (server[col] || []).slice();
    for (const q of extra) { if (q.m === 'eq') rows = rows.filter((d) => q.v.includes(d[q.a])); if (q.m === 'gt') rows = rows.filter((d) => Date.parse(d[q.a]) > Date.parse(q.v)); }
    baca[col] = (baca[col] || 0) + rows.length; return JSON.parse(JSON.stringify(rows)); } },
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(kode + '\nthis.bsLoad=bsLoad;this.bsLatAkses=bsLatAkses;this.bsLatBuka=bsLatBuka;this.bsAdaAkses=bsAdaAkses;this.bsLatPisah=bsLatPisah;', ctx);
const iso = (t) => new Date(t).toISOString();
const dk = (id, t, extra) => Object.assign({ $id: id, $updatedAt: iso(t), ts: t }, extra);
const lat = (id, kelas, extra = {}) => dk(id, NOW - 1000, { judul: 'Latihan', kelas, aktif: true, mulai: 0, selesai: 0, payload: JSON.stringify({ jenis: 'latihan', sekolah: '' }), ...extra });
const ujian = (id, extra = {}) => dk(id, NOW - 1000, { judul: 'Ujian', kelas: 'X', aktif: true, mulai: 0, selesai: 0, payload: JSON.stringify({ ids: [], pilih: 'otomatis' }), ...extra });
const reset = () => { Object.keys(store).forEach((k) => delete store[k]); baca = {}; ctx.BS.D = { soal: [], sesi: [], hasil: [], lat: [] }; ctx.BS.err = []; ctx.BS.loaded = false; ctx.BS.soalOk = false; ctx.BS.loading = false; };
server.banksoal = Array.from({ length: 300 }, (_, i) => dk('q' + i, NOW - 86400000, { tipe: 'pg', aktif: true }));
server.soal_hasil = [dk('h1', NOW - 5000, { sid: 'u5', mode: 'latihan' }), dk('h2', NOW - 5000, { sid: 'u9', mode: 'latihan' })];

console.log('Siswa: tanpa akses, bank soal tidak dibaca');
server.soal_sesi = [];
reset(); staff = false;
await ctx.bsLoad();
ok('bank soal tidak dibaca', !baca.banksoal, baca);
ok('sesi dan hasil sendiri dibaca', baca.soal_sesi === 0 && baca.soal_hasil === 1, baca);
ok('soalOk false dan latihan tertutup', ctx.BS.soalOk === false && ctx.bsLatBuka() === false);

console.log('Siswa: latihan dibuka untuk kelasnya');
server.soal_sesi = [lat('L1', 'X'), lat('L2', 'XI')];
reset();
await ctx.bsLoad();
ok('bank soal dibaca (300)', baca.banksoal === 300, baca);
ok('dokumen latihan dipisah dari sesi ujian', ctx.BS.D.sesi.length === 0 && ctx.BS.D.lat.length === 2, { s: ctx.BS.D.sesi.length, l: ctx.BS.D.lat.length });
ok('hanya akses kelas X yang berlaku', ctx.bsLatAkses('X').length === 1 && ctx.bsLatAkses('X')[0].id === 'L1' && ctx.bsLatAkses('XI')[0].id === 'L2' && ctx.bsLatAkses('XII').length === 0);
ok('gerbang terbuka dan soalOk true', ctx.bsLatBuka() === true && ctx.BS.soalOk === true);

console.log('Akses latihan semua kelas, dinonaktifkan, dan terjadwal');
ctx.BS.D.lat = [ctx.bsFromDoc(lat('A', 'ALL'))];
ok('ALL cocok untuk semua tingkat', ctx.bsLatAkses('XII').length === 1);
ctx.BS.D.lat[0].aktif = false;
ok('nonaktif menutup akses', ctx.bsLatAkses('X').length === 0 && ctx.bsLatBuka() === false);
ctx.BS.D.lat[0].aktif = true; ctx.BS.D.lat[0].mulai = NOW + 3600000;
ok('terjadwal (belum mulai) belum membuka', ctx.bsLatAkses('X').length === 0);
ctx.BS.D.lat[0].mulai = NOW - 7200000; ctx.BS.D.lat[0].selesai = NOW - 3600000;
ok('sudah lewat tutup tidak membuka', ctx.bsLatAkses('X').length === 0);

console.log('Siswa: tanpa latihan tetapi ada ujian terbuka/terjadwal');
server.soal_sesi = [ujian('U1')];
reset();
await ctx.bsLoad();
ok('ujian terbuka: bank soal dibaca dan sesi ujian tetap di BS.D.sesi', baca.banksoal === 300 && ctx.BS.D.sesi.length === 1 && ctx.BS.D.lat.length === 0, { baca, s: ctx.BS.D.sesi.length });
server.soal_sesi = [ujian('U2', { mulai: NOW + 3600000 })];
reset();
await ctx.bsLoad();
ok('ujian terjadwal (pra-unduh): bank soal dibaca', baca.banksoal === 300, baca);
server.soal_sesi = [ujian('U3', { aktif: false })];
reset();
await ctx.bsLoad();
ok('ujian nonaktif: bank soal tidak dibaca', !baca.banksoal, baca);
server.soal_sesi = [ujian('U4')];
server.soal_hasil.push(dk('h3', NOW - 5000, { sid: 'u5', mode: 'ujian', sesiId: 'U4' }));
reset();
await ctx.bsLoad();
ok('ujian sudah dikerjakan: bank soal tidak dibaca', !baca.banksoal, baca);
server.soal_hasil.pop();
server.soal_sesi = [];
reset(); store['tbsm-bs-run-u5'] = '{"mode":"ujian"}';
await ctx.bsLoad();
ok('pengerjaan belum selesai di perangkat: bank soal dibaca', baca.banksoal === 300, baca);

console.log('Staf: selalu membaca semuanya');
server.soal_sesi = [];
reset(); staff = true;
await ctx.bsLoad();
ok('staf membaca bank soal walau tanpa akses', baca.banksoal === 300 && ctx.BS.soalOk === true, baca);
staff = false;

console.log('Pemisahan latihan saat sesi dibaca penuh');
reset();
ctx.BS.D.lat = [{ id: 'HAPUS', r: 1, d: 0, jenis: 'latihan' }, { id: 'BARU', r: 0, d: 1, jenis: 'latihan' }];
ctx.BS.D.sesi = [ctx.bsFromDoc(lat('L9', 'X')), ctx.bsFromDoc(ujian('U9'))];
ctx.bsLatPisah(true);
ok('pembacaan penuh: yang terhapus di server hilang, yang belum terkirim tetap', ctx.BS.D.lat.map((x) => x.id).sort().join() === 'BARU,L9' && ctx.BS.D.sesi.map((x) => x.id).join() === 'U9', ctx.BS.D.lat.map((x) => x.id));
ctx.BS.D.sesi = [ctx.bsFromDoc(lat('L9', 'X', { judul: 'Baru' }))];
ctx.bsLatPisah(false);
ok('pembacaan bertahap: diperbarui tanpa menghapus yang lain', ctx.BS.D.lat.length === 2 && ctx.BS.D.lat.find((x) => x.id === 'L9').judul === 'Baru' && ctx.BS.D.sesi.length === 0);

console.log('Kode: gerbang, penyimpanan, dan registrasi');
ok('Mulai latihan dan Atur latihan dijaga', (src.match(/if\(!bsLatBuka\(\)\)\{toast\('Latihan belum dibuka oleh guru'\)/g) || []).length === 2);
const fd = fs.readFileSync(path.join(root, 'js/form-draft.js'), 'utf8'), al = fs.readFileSync(path.join(root, 'js/akses-latihan.js'), 'utf8');
ok('layar Atur latihan tidak tampil tanpa akses (pintasan, draf, sisa tampilan)', /if\(BS\.sub==='latsetup'\)\{if\(bsLatBuka\(\)\)return bsViewLatSetup\(\);BS\.sub='home'\}/.test(src) && /if\(bsLatBuka\(\)\)BS\.sub='latsetup'/.test(src) && /d\.sub==='latsetup'&&BS\.sub==='home'&&typeof bsLatBuka==='function'&&bsLatBuka\(\)/.test(fd));
ok('bank soal latihan kosong untuk siswa tanpa akses (salinan di perangkat tidak dipakai)', /function bsPool\(mode,kelas\)\{[^]*?mode==='latihan'&&S\.user&&!isStaff\(\)&&!bsLatBuka\(\)\)return \[\]/.test(src));
ok('Hapus akses latihan = ditandai tutup + hapus (bukan dihapus dari server), dan diabaikan gerbang', /s2\.aktif=false;s2\.hapus=true;bsPut\('lat',s2\)/.test(al) && !/bsDel\('lat'/.test(al) && /!s\.hapus&&schAkunOk\(s\)/.test(src));
ctx.BS.D.lat = [{ id: 'T1', kelas: 'X', aktif: false, hapus: true, mulai: 0, selesai: 0, r: 1 }, { id: 'T2', kelas: 'X', aktif: true, hapus: true, mulai: 0, selesai: 0, r: 1 }];
ok('akses bertanda hapus tidak membuka latihan walau aktif', ctx.bsLatBuka() === false);
ok('latihan menyimpan jenis di payload dan memakai koleksi soal_sesi', /k==='lat'\)o\.payload=JSON\.stringify\(\{jenis:'latihan'/.test(src) && /lat:'soal_sesi'/.test(src));
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
ok('akses-latihan.js dimuat setelah cbt-staf.js dan masuk cache', idx.indexOf('js/akses-latihan.js') > idx.indexOf('js/cbt-staf.js') && /akses-latihan\.js/.test(sw));
ok('modul guru memuat tanpa galat syntax', (() => { try { new vm.Script(fs.readFileSync(path.join(root, 'js/akses-latihan.js'), 'utf8')); return true; } catch (e) { return false; } })());

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
