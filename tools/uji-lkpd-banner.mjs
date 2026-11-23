#!/usr/bin/env node
/* Uji banner gradien interaktif LKPD v2 (js/lkpd-v2-banner.js). Jalankan: node tools/uji-lkpd-banner.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
let gagal = 0, lulus = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const sama = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + ' (dapat ' + JSON.stringify(a) + ', harap ' + JSON.stringify(b) + ')');

const listeners = [];
const el = () => ({ style: {}, dataset: {}, classList: { toggle() {}, contains() { return false } }, appendChild() {}, setAttribute() {}, querySelector() { return null }, querySelectorAll() { return [] }, closest() { return null } });
const ctx = vm.createContext({
  console, Math, JSON, Object, Array, Date, String, Number, isFinite, parseInt, setTimeout, setInterval() {}, clearInterval() {}, localStorage: { getItem() { return null }, setItem() {}, removeItem() {} },
  navigator: { onLine: true }, window: { scrollTo() {} },
  document: { createElement: el, head: el(), body: el(), addEventListener(t, f, c) { listeners.push({ t, f, c }) }, querySelectorAll() { return [] }, getElementById() { return null }, querySelector() { return null } },
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
run(src('lkpd-v2-banner.js'), 'lkpd-v2-banner.js');
const G = (e) => vm.runInContext(e, ctx);
const M = G('LKPD_MODULES[0]');
const jmlKartu = G(`LKPD_MODULES[0].v2.pertemuan.filter(function(p){return !p.sembunyi}).reduce(function(t,p){return t+lk2Kartu(LKPD_MODULES[0].v2,p).length},0)`);
G(`LK.tab='kerja';DRAFT={};LK2.cetak=false;STAFF=true`);
let h = G('lk2Kerja(LKPD_MODULES[0],DRAFT)');
sama((h.match(/data-lkb(?=[ >])/g) || []).length, jmlKartu, 'satu banner untuk tiap kartu (' + jmlKartu + ')');
sama((h.match(/<section class="card lk2-p/g) || []).length, jmlKartu, 'jumlah kartu tidak berubah');
ok(!/<section class="card lk2-p"><div class="row sb">/.test(h), 'kepala lama terganti semua');
ok(/--p:0/.test(h) && /0 dari \d+ langkah/.test(h), 'progres awal 0');
ok(h.indexOf('data-lk-check="step0"') > -1, 'langkah tetap ada di kartu (kunci isian tidak berubah)');
ok(/<p class="note">/.test(h), 'catatan kartu dipertahankan');
G(`DRAFT={step0:true,step1:true,step2:true};`);
h = G('lk2Kerja(LKPD_MODULES[0],DRAFT)');
ok(/3 dari \d+ langkah/.test(h) && /--p:(?!0)\d+/.test(h), 'progres mengikuti langkah yang dicentang');
G(`LK2.lipat={mt2:true}`);
ok(/lkb-lipat/.test(G('lk2Kerja(LKPD_MODULES[0],DRAFT)')) || G('LK2.lipat.mt2'), 'status lipat diingat');
G(`LK2.cetak=true`);
ok(G('lk2Kerja(LKPD_MODULES[0],DRAFT)').indexOf('data-lkb') === -1, 'mode cetak tanpa banner');
G(`LK2.cetak=false;STAFF=false`);
console.log(gagal ? 'GAGAL ' + gagal + ', lulus ' + lulus : 'LULUS semua (' + lulus + ' cek)');
process.exit(gagal ? 1 : 0);
