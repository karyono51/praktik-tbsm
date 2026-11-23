#!/usr/bin/env node
/* Uji pewaktu per kartu pertemuan LKPD v2 (lkpd-timer.js, bagian lkc*).
   node tools/uji-pewaktu-pertemuan.mjs
   Ujian: tidak bisa dijeda, satu kartu berjalan, berbasis jam dinding, berhenti hanya lewat Selesai. Latihan: bebas jeda. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
let lulus = 0, gagal = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const store = {};
const el = () => ({ style: {}, dataset: {}, classList: { toggle() {}, contains() { return false } }, appendChild() {}, setAttribute() {}, querySelector() { return null }, querySelectorAll() { return [] }, addEventListener() {} });
const ctx = vm.createContext({
  console, Math, JSON, Object, Array, String, Number, isFinite, parseInt, setTimeout, setInterval() { return 1 }, clearInterval() {},
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } },
  navigator: { onLine: true }, window: { scrollTo() {}, addEventListener() {} },
  document: { createElement: el, head: el(), body: el(), addEventListener() {}, querySelectorAll() { return [] }, getElementById() { return null }, querySelector() { return null } }
});
ctx.window = ctx; ctx.addEventListener = () => {}; ctx.NOW = 1000000;
ctx.Date = Object.assign(function () {}, { now: () => ctx.NOW });
const run = (code, name) => vm.runInContext(code, ctx, { filename: name });
run(`
var S={user:{id:'u1',nama:'Budi',kelas:'X'},lkpd:[],observasi:[],users:[],results:[],kkm:75};
var Cloud={on:false};var toasts=[];function toast(m){toasts.push(m)}function render(){}function persist(){}function save(){}function uid(){return 'x'}
function ymd(){return '2026-11-23'}function schNama(){return 'SMKS'}var STAFF=false;function isStaff(){return STAFF}
function esc(x){return String(x==null?'':x)}function lkEsc(x){return esc(x)}
var LK={module:'LKPD-X-07',tab:'kerja',detail:null,editor:null,preview:false};
function lkRowOk(){return false}function lkScore(){return {practice:0,theory:0,final:0,answered:0,correct:0}}function lkRead(){return {}}
function lkProgress(){return ''}function lkSubmit(){}function viewLKPD(){return 'V'}function lkDetailBody(){return 'D'}
function lkqQuizHtml(){return ''}function uiOk(k,m,f){return true}
var LKPD_MODULES=[];var MODE='ujian';
function lkmCfg(){return {mode:MODE}}function lkmCur(){return LKPD_MODULES[0]}function lkmSesiMenit(){return 80}
`, 'stub');
run(src('lkpd-soal.js').split('/* ---------- Pemasangan ke mesin LKPD ---------- */')[0], 'soal-inti');
run(src('lkpd-v2-x07.js'), 'x07');
run(`LKPD_MODULES=JSON.parse(JSON.stringify(LKPD_EXTRA_MODULES));`, 'modul');
run(src('lkpd-v2.js'), 'v2');
run(src('lkpd-v2-soal.js'), 'v2soal');
run(src('lkpd-timer.js'), 'timer');
const G = (e) => vm.runInContext(e, ctx);
const reset = () => { for (const k of Object.keys(store)) delete store[k]; G('LKC.m={}'); };

const keys = G('lkcCards(LKPD_MODULES[0]).map(function(c){return c.key})');
ok(keys.length === 4 && keys.join() === 'mt2,mt3,mtk3,mtk4', 'empat kartu kegiatan punya pewaktu sendiri: ' + keys.join());

/* Ujian */
G(`MODE='ujian';STAFF=false`); reset();
const m = 'LKPD_MODULES[0]';
ok(G('lktLocked()') === true, 'Ujian siswa: waktu terkunci');
ok(/tidak bisa dijeda/.test(G(`lkcRow(${m},lkcCards(${m})[0])`)), 'Ujian: kartu menyebut tidak bisa dijeda');
ok(G(`lkcStart(${m},'mt2')`) === true && G(`lkcGet(${m},'mt2').run`) === true, 'Ujian: kartu 1 mulai');
ok(G(`lkcStart(${m},'mt3')`) === false && G(`lkcGet(${m},'mt3').run`) === false && /Selesaikan dulu/.test(G('toasts[toasts.length-1]')), 'Ujian: kartu lain ditolak selama satu kartu berjalan');
ctx.NOW += 90 * 1000;
ok(G(`lkcSecNow(${m},'mt2')`) === 90, 'Ujian: waktu dari jam dinding (90 dtk)');
ok(G(`lkcMin(90)`) === '2' && G(`lkcMin(20)`) === '1' && G(`lkcMin(0)`) === '', 'menit dibulatkan, minimal 1, kosong bila 0');
ok(G(`lkcRO(${m},'mt2')`) === true && G(`lkcBtn(${m},'mt2')`) === 'Selesai kegiatan', 'Ujian: kolom waktu readonly, tombol hanya Selesai');
/* simulasi muat ulang: cache dikosongkan, waktu tetap dari penyimpanan dan jam dinding */
G('LKC.m={}'); ctx.NOW += 30 * 1000;
ok(G(`lkcGet(${m},'mt2').t0`) > 0 && G(`lkcGet(${m},'mt2').done`) === false, 'Ujian: muat ulang mempertahankan waktu mulai');
G(`lkcGet(${m},'mt2').run=true`);
ok(G(`lkcSecNow(${m},'mt2')`) === 120, 'Ujian: setelah muat ulang waktu tetap berjalan (120 dtk)');
G(`lkcStop(${m},'mt2',true)`);
ok(G(`lkcGet(${m},'mt2').done`) === true && G(`lkcStart(${m},'mt2')`) === false, 'Ujian: setelah Selesai tidak bisa dimulai lagi');
ctx.NOW += 600 * 1000;
ok(G(`lkcSecNow(${m},'mt2')`) === 120, 'Ujian: waktu berhenti setelah Selesai');
ok(G(`lkcStart(${m},'mt3')`) === true, 'Ujian: kartu 2 bisa mulai setelah kartu 1 selesai');
ctx.NOW += 60 * 1000;
ok(G(`lktSec()`) === 180, 'total waktu kiriman = jumlah semua kartu (180 dtk)');
G(`lkcClear(${m})`);
ok(G(`lkcTotal(${m})`) === 0 && Object.keys(store).length === 0, 'setelah kirim semua pewaktu kartu dibersihkan');

/* Latihan */
G(`MODE='latihan'`); reset();
ok(G('lktLocked()') === false, 'Latihan: tidak terkunci');
G(`lkcStart(${m},'mt2')`); G(`lkcGet(${m},'mt2').sec=45`);
G(`lkcStop(${m},'mt2',false)`);
ok(G(`lkcGet(${m},'mt2').run`) === false && G(`lkcGet(${m},'mt2').done`) === false && G(`lkcBtn(${m},'mt2')`) === 'Lanjut', 'Latihan: bisa dijeda dan dilanjutkan');
G(`lkcStart(${m},'mt2')`);
ok(G(`lkcStart(${m},'mt3')`) === true && G(`lkcGet(${m},'mt2').run`) === false && G(`lkcGet(${m},'mt3').run`) === true, 'Latihan: memulai kartu lain menjeda kartu sebelumnya');
ok(G(`lkcRO(${m},'mt3')`) === false, 'Latihan: kolom waktu boleh diedit');
/* guru */
G(`MODE='ujian';STAFF=true`);
ok(G('lktLocked()') === false, 'guru/pratinjau tidak dikunci');
const kerja = G(`lk2Kerja(${m},{})`);
ok((kerja.match(/data-ct="/g) || []).length === 4, 'Lembar Kerja memuat empat pewaktu kartu');
console.log(`\nUji pewaktu per pertemuan: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
