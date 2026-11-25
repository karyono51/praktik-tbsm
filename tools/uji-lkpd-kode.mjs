#!/usr/bin/env node
/* Uji kode LKPD berbasis prodi dan CP (js/lkpd-kode.js, AKD_LKPD_ALIAS, kelima modul LKPD v2). node tools/uji-lkpd-kode.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0; const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, JSON, Math, Object, Array, String, Number, Date, RegExp, parseInt, window: null, document: { addEventListener() {}, createElement() { return { style: {} }; }, head: { appendChild() {} }, body: {} } });
ctx.window = ctx;
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8'); const run = (c, n) => vm.runInContext(c, ctx, { filename: n }); const G = (e) => vm.runInContext(e, ctx);
['lkpd-modul.js', 'lkpd-v2-x06.js', 'lkpd-v2-xi17.js', 'lkpd-v2-xi18.js', 'lkpd-v2-x12.js', 'lkpd-v2-x18.js'].forEach((f) => run(src(f), f));
run(src('akademik-data.js'), 'akademik-data.js');
run(`var LKPD_DEFAULT_MODULES=LKPD_EXTRA_MODULES.slice();var LKPD_MODULES=LKPD_DEFAULT_MODULES.slice();var refreshed=0;
function lkRefreshModules(){refreshed++}
var S={lkpd:[{id:'h1',moduleId:'LKPD-X-06'},{id:'h2',moduleId:'LKPD-DDO-ALT-02'},{id:'h3',moduleId:'X-1'}],
 lkpdBukti:[{id:'b1',moduleId:'LKPD-XI-17'}],lkpdModules:[{id:'LKPD-X-12',moduleId:'LKPD-X-12'},{id:'X-1',moduleId:'X-1'}]};`, 'stub');
run(src('lkpd-kode.js'), 'lkpd-kode.js');

const A = G('AKD_LKPD_ALIAS'), M = G('AKD_LKPD_MATRIKS');
ok(Object.keys(A).length === 54 && new Set(Object.values(A)).size === 54, 'alias: 54 kode lama -> 54 kode baru, satu lawan satu');
ok(Object.values(A).every((b) => /^LKPD-(DDO|TSM|TKR)-[A-Z0-9]{2,4}-\d\d$/.test(b)) && Object.keys(A).every((k) => /^LKPD-(X|XI|XII)-\d\d$/.test(k)), 'alias: bentuk kode lama dan baru');
ok(M.length === 54 && M.every((x) => A[x.ka] === x.k), 'matriks: k = alias[ka] untuk semua baris');
ok(M.every((x) => !/-(X|XI|XII)-/.test(x.k)), 'kode baru tidak memuat tingkat');
const bagi = {}; M.forEach((x) => { const [, pr, cp, nn] = x.k.split('-'); const kk = pr + '-' + cp; (bagi[kk] = bagi[kk] || []).push(Number(nn)); });
ok(Object.values(bagi).every((L) => L.slice().sort((a, b) => a - b).every((n, i) => n === i + 1)), 'nomor urut dalam tiap CP berurutan 01..n tanpa lubang');
const pasti = { 'LKPD-X-06': 'LKPD-DDO-ALT-02', 'LKPD-X-12': 'LKPD-DDO-ELK-01', 'LKPD-X-18': 'LKPD-DDO-KOM-03', 'LKPD-XI-17': 'LKPD-TSM-PMT-02', 'LKPD-XI-18': 'LKPD-TSM-PMT-03' };
Object.keys(pasti).forEach((k) => ok(A[k] === pasti[k], 'pemetaan ' + k + ' -> ' + pasti[k]));

/* kelima modul */
const mods = G('LKPD_DEFAULT_MODULES.filter(function(m){return m.v2})');
ok(mods.length === 5, 'lima modul LKPD v2');
mods.forEach((m) => {
  const p = ctx.lkKodeParse(m.id);
  ok(!!p && p.prodi === m.prodi && p.cp === m.cp, m.id + ': prodi dan cp pada modul sama dengan kode');
  ok(Array.isArray(m.alias) && A[m.alias[0]] === m.id, m.id + ': alias modul = kode lama di peta');
  const x = M.find((r) => r.k === m.id); ok(x && x.kl === m.kelas, m.id + ': tingkat modul = tingkat di matriks (atribut, bukan kode)');
});

/* fungsi */
ok(ctx.lkKodeBaru('LKPD-X-06') === 'LKPD-DDO-ALT-02' && ctx.lkKodeBaru('LKPD-DDO-ALT-02') === 'LKPD-DDO-ALT-02', 'lkKodeBaru: lama dan baru -> baru');
ok(ctx.lkKodeBaru('X-1') === 'X-1' && ctx.lkKodeBaru('') === '' && ctx.lkKodeBaru(null) === '' && ctx.lkKodeBaru('toString') === 'toString', 'lkKodeBaru: id lain (LKPD v1, kosong, nama bawaan objek) tidak berubah');
ok(ctx.lkKodeLama('LKPD-TSM-PMT-02') === 'LKPD-XI-17' && ctx.lkKodeLama('LKPD-XI-17') === 'LKPD-XI-17' && ctx.lkKodeLama('X-1') === '', 'lkKodeLama: bolak-balik');
ok(ctx.lkKodeSama('LKPD-X-06', 'LKPD-DDO-ALT-02') && !ctx.lkKodeSama('LKPD-X-06', 'LKPD-X-12'), 'lkKodeSama');
ok(G("lkKodeParse('LKPD-TSM-PMT-03').cp") === 'PMT' && G("lkKodeParse('LKPD-X-06')") === null && G("lkKodeParse('X-1')") === null, 'lkKodeParse');
ok(ctx.lkKodeBerikut('TSM', 'PMT') === 'LKPD-TSM-PMT-08' && ctx.lkKodeBerikut('DDO', 'ALT') === 'LKPD-DDO-ALT-04' && ctx.lkKodeBerikut('TKR', 'ENG') === 'LKPD-TKR-ENG-01', 'lkKodeBerikut: nomor berikutnya per prodi dan CP');
ok(ctx.lkKodeProdiList().map((p) => p[0]).join() === 'DDO,TSM,TKR' && ctx.lkKodeCpList('TSM').length === 7 && ctx.lkKodeCpList('DDO').length === 7 && ctx.lkKodeCpNama('TSM', 'PMT') === 'Perawatan dan perbaikan sistem pemindah tenaga', 'daftar prodi dan CP untuk editor');

/* data lama dibaca sebagai kode baru */
G('window.lkRefreshModules()');
ok(G('refreshed') === 1, 'pembungkus lkRefreshModules tetap memanggil fungsi aslinya');
ok(G("S.lkpd.map(function(x){return x.moduleId}).join()") === 'LKPD-DDO-ALT-02,LKPD-DDO-ALT-02,X-1', 'hasil siswa lama dibaca sebagai kode baru');
ok(G("S.lkpdBukti[0].moduleId") === 'LKPD-TSM-PMT-02', 'bukti lama dibaca sebagai kode baru');
ok(G("S.lkpdModules.map(function(x){return x.id+'/'+x.moduleId}).join()") === 'LKPD-DDO-ELK-01/LKPD-DDO-ELK-01,X-1/X-1', 'modul terkelola lama dipetakan; X-1 tidak berubah');
G('window.lkRefreshModules()'); ok(G("S.lkpd[0].moduleId") === 'LKPD-DDO-ALT-02', 'normalisasi idempoten');

/* tingkat berpindah, kode tetap */
const m0 = G("LKPD_MODULES.find(function(x){return x.id==='LKPD-TSM-PMT-02'})"); const k0 = m0.id; m0.kelas = 'X';
ok(m0.id === k0 && ctx.lkKodeBaru(m0.id) === k0 && ctx.lkKodeParse(m0.id).prodi === 'TSM', 'LKPD turun tingkat (XI -> X): kode tetap');

/* tidak ada kode lama tersisa di kode program (kecuali alias, data peta, dan berkas sisa) */
const sisa = [];
fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js') && !['akademik-data.js', 'lkpd-v2-x07.js', 'lkpd-kode.js'].includes(f)).forEach((f) => {
  src(f).split('\n').forEach((l, i) => { if (/LKPD-(XII|XI|X)-\d\d\b/.test(l) && !/alias:\[/.test(l)) sisa.push(f + ':' + (i + 1)); });
});
ok(!sisa.length, 'tidak ada kode lama di js/ selain isian alias: ' + sisa.join(' '));
console.log('Uji kode LKPD: ' + lulus + ' lulus, ' + gagal + ' gagal'); process.exit(gagal ? 1 : 0);
