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
  document: { createElement: el, head: el(), body: el(), addEventListener() {}, querySelectorAll() { return [] }, getElementById() { return null }, querySelector(q) { return (ctx.ADA_CT && q === '[data-ct]') ? {} : null } }
});
ctx.window = ctx; ctx.addEventListener = () => {}; ctx.NOW = 1000000;
ctx.Date = Object.assign(function () {}, { now: () => ctx.NOW });
const run = (code, name) => vm.runInContext(code, ctx, { filename: name });
run(`
var S={user:{id:'u1',nama:'Budi',kelas:'X'},lkpd:[],observasi:[],users:[],results:[],kkm:75};
var Cloud={on:false};var toasts=[];function toast(m){toasts.push(m)}function render(){}function persist(){}function save(){}function uid(){return 'x'}
function ymd(){return '2026-11-23'}function schNama(){return 'SMKS'}var STAFF=false;function isStaff(){return STAFF}
function esc(x){return String(x==null?'':x)}function lkEsc(x){return esc(x)}
var LK={module:'LKPD-DDO-ALT-02',tab:'kerja',detail:null,editor:null,preview:false};
function lkRowOk(){return false}function lkScore(){return {practice:0,theory:0,final:0,answered:0,correct:0}}function lkRead(){return {}}
function lkProgress(){return ''}function lkSubmit(){}function viewLKPD(){return 'V'}function lkDetailBody(){return 'D'}
function lkqQuizHtml(){return ''}function uiOk(k,m,f){return true}
var LKPD_MODULES=[];var MODE='ujian';
function lkDraft(){return {}}function uiOk(){return true}function lkmCfg(){return {mode:MODE}}function lkmCur(){return LKPD_MODULES[0]}function lkmSesiMenit(){return 80}
`, 'stub');
run(src('lkpd-soal.js').split('/* ---------- Pemasangan ke mesin LKPD ---------- */')[0], 'soal-inti');
run(src('lkpd-v2-x06.js'), 'x07');
run(`LKPD_MODULES=JSON.parse(JSON.stringify(LKPD_EXTRA_MODULES));`, 'modul');
run(src('lkpd-v2.js'), 'v2');
run(src('lkpd-v2-soal.js'), 'v2soal');
run(src('lkpd-kunci.js'), 'kunci');
run(src('lkpd-timer.js'), 'timer');
const G = (e) => vm.runInContext(e, ctx);
const reset = () => { for (const k of Object.keys(store)) delete store[k]; G('LKCT.m={}'); };

const keys = G('lkcCards(LKPD_MODULES[0]).map(function(c){return c.key})');
ok(keys.length === 4 && keys.join() === 'mt2,mt3,mtk3,mtk4', 'empat kartu kegiatan punya pewaktu sendiri: ' + keys.join());
const m = 'LKPD_MODULES[0]';
ctx.ADA_CT = true;
const buka = (k) => { G(`LK2.kartu='${k}'`); G('lkcSelaras()'); };
const jalan = (k) => G(`lkcGet(${m},'${k}').run`);

/* Tanpa tombol */
G(`MODE='ujian';STAFF=false`); reset(); G(`LK2={}`);
const row = G(`lkcRow(${m},lkcCards(${m})[0],true)`);
ok(/data-ct-clock/.test(row) && !/<button|lkc-toggle|Mulai|Jeda|Lanjut|Selesai/.test(row), 'kepala kartu hanya jam, tanpa tombol');
ok(!/<button|lkc-toggle/.test(G(`lkcRow(${m},lkcCards(${m})[0])`)), 'baris pewaktu besar juga tanpa tombol');

/* Ujian: kartu terbuka = jalan, tertutup = berhenti */
ok(jalan('mt2') === false, 'belum ada kartu terbuka: pewaktu diam');
buka('mt2');
ok(jalan('mt2') === true, 'kartu 1 dibuka: pewaktu jalan otomatis');
ctx.NOW += 90 * 1000;
ok(G(`lkcSecNow(${m},'mt2')`) === 90, 'Ujian: waktu dari jam dinding (90 dtk)');
ok(G(`lkcRO(${m},'mt2')`) === true, 'Ujian: kolom waktu readonly');
buka('mt3');
ok(jalan('mt2') === false && jalan('mt3') === true, 'pindah ke kartu 2: kartu 1 berhenti, kartu 2 jalan');
ok(G(`lkcGet(${m},'mt2').sec`) === 90, 'waktu kartu 1 tersimpan saat ditutup (90 dtk)');
ctx.NOW += 60 * 1000;
ok(G(`lkcSecNow(${m},'mt2')`) === 90 && G(`lkcSecNow(${m},'mt3')`) === 60, 'kartu yang tertutup tidak bertambah');
G(`LK2.kartu=''`); G('lkcSelaras()');
ok(jalan('mt3') === false && G(`lkcGet(${m},'mt3').sec`) === 60, 'kartu ditutup: pewaktu berhenti, waktu tersimpan');
buka('mt2');
ok(jalan('mt2') === true, 'kartu dibuka lagi: pewaktu jalan');
ctx.NOW += 30 * 1000;
ok(G(`lkcSecNow(${m},'mt2')`) === 120, 'dilanjutkan dari waktu terakhir (90 + 30 = 120 dtk)');
ok(G(`lkcMin(90)`) === '2' && G(`lkcMin(20)`) === '1' && G(`lkcMin(0)`) === '', 'menit dibulatkan, minimal 1, kosong bila 0');
ok(G('lktSec()') === 180, 'total waktu kiriman = jumlah semua kartu (120 + 60 dtk)');
/* pindah tab (kartu terlihat hilang dari layar) menghentikan pewaktu */
ctx.ADA_CT = false; G('lkcSelaras()');
ok(jalan('mt2') === false, 'pindah tab Materi: pewaktu berhenti');
ctx.ADA_CT = true; G('lkcSelaras()');
ok(jalan('mt2') === true, 'kembali ke Lembar Kerja dengan kartu masih terbuka: pewaktu jalan lagi');
/* muat ulang: tidak ada kartu terbuka, waktu tetap dari penyimpanan */
G('lkcStopAll("")'); G('LKCT.m={}'); G(`LK2={}`); G('lkcSelaras()');
ok(jalan('mt2') === false && G(`lkcGet(${m},'mt2').sec`) === 120, 'muat ulang: pewaktu diam, waktu kartu 1 tetap 120 dtk');
/* Kegiatan 3 dan 4 terpisah */
buka('mtk3'); ok(jalan('mtk3') === true && jalan('mtk4') === false, 'Kegiatan 3 jalan, Kegiatan 4 tidak');
buka('mtk4'); ok(jalan('mtk3') === false && jalan('mtk4') === true, 'Kegiatan 4 dibuka: Kegiatan 3 berhenti');
buka('tidak-ada'); ok(jalan('mtk4') === false, 'kartu tanpa pewaktu: tidak ada yang jalan');
/* Cetak tidak memulai */
G(`LK2={cetak:true,kartu:'mt2'}`); G('lkcSelaras()'); ok(jalan('mt2') === false, 'mode cetak: pewaktu tidak jalan');
G(`lkcClear(${m})`);
ok(G(`lkcTotal(${m})`) === 0 && Object.keys(store).length === 0, 'setelah kirim semua pewaktu kartu dibersihkan');

/* Latihan */
G(`MODE='latihan'`); reset(); G(`LK2={}`);
ok(G('lktLocked()') === false, 'Latihan: tidak terkunci');
buka('mt2'); G(`lkcGet(${m},'mt2').sec=45`);
buka('mt3');
ok(jalan('mt2') === false && jalan('mt3') === true && G(`lkcGet(${m},'mt2').sec`) === 45, 'Latihan: pindah kartu menghentikan kartu lama dan menjalankan yang baru');
ok(G(`lkcRO(${m},'mt3')`) === false, 'Latihan: kolom waktu boleh diedit');
/* guru */
G(`MODE='ujian';STAFF=true`);
ok(G('lktLocked()') === false, 'guru/pratinjau tidak dikunci');
const kerja = G(`lk2Kerja(${m},{})`);
ok((kerja.match(/data-ct="/g) || []).length === 4, 'Lembar Kerja memuat empat pewaktu kartu');
ok(!/data-act="lkc-toggle"/.test(kerja), 'Lembar Kerja tanpa tombol pewaktu');
/* Banner lipat dan overlay */
const bn = (h) => (h.match(/<details class="lk2-bn" data-lk2d="bn-(\w+)"( open)?>/g) || []).map((x) => x.replace(/.*bn-(\w+)".*/, '$1') + (/ open>$/.test(x) ? '+' : ''));
const kj = bn(kerja);
ok(kj.join() === 'identitas,analisis,refleksi', 'Lembar Kerja: banner lipat Identitas, Analisis, Refleksi (tertutup): ' + kj.join());
const mat = G(`lk2Materi(${m},{})`);
const mt = bn(mat);
ok(mt.join() === 'tujuan,rencana,teori,gate,alat,k3', 'Materi: banner lipat Tujuan, Rencana, Teori singkat, Gerbang, Alat dan bahan, K3 (tertutup): ' + mt.join());
ok(/<h2>Teori singkat<\/h2>/.test(mat) && !/<h2>Memahami<\/h2>/.test(mat), 'Memahami diganti Teori singkat');
G(`LK2.open={'bn-k3':true}`);
ok(/data-lk2d="bn-k3" open/.test(G(`lk2Materi(${m},{})`)), 'status buka banner diingat');
G(`LK2={cetak:true}`);
ok(bn(G(`lk2Materi(${m},{})`)).every((x) => x.endsWith('+')), 'cetak membuka semua banner');
G(`LK2={}`);
const ov = G('lk2Ov(true)');
ok(/data-v="materi"[^>]*>Materi &amp; Prosedur/.test(ov) && /data-v="kerja"[^>]*>Lembar Kerja/.test(ov) && /class="lk-ov lk-ov-bar"/.test(ov) && /class="lk-ov"/.test(G('lk2Ov(false)')), 'overlay tombol Materi & Prosedur dan Lembar Kerja (menumpang di bilah atau melayang)');
/* Ikon kunci pada kartu kegiatan yang dikunci; kartu terkunci tidak dihitung waktunya */
G(`S.lkpd=[];S.lkpdBukti=[{moduleId:LKPD_MODULES[0].id,sid:'u1',label:'kunci|2',data:JSON.stringify({n:2,f:{step0:'x'}}),ts:1}]`);
G(`MODE='latihan';STAFF=false`);
const terkunci = G(`lk2Terkunci(${m},'mt2')`);
ok(terkunci === true && G(`lk2Terkunci(${m},'mt3')`) === false, 'kartu Kegiatan 1 terkunci, Kegiatan 2 belum');
ok(/lk2-lock/.test(G(`lk2KunciIkon(${m},'mt2')`)) && G(`lk2KunciIkon(${m},'mt3')`) === '', 'ikon kunci hanya pada kartu yang dikunci');
G(`LK2={kartu:'mt2'}`); G('lkcSelaras()');
ok(G(`lkcGet(${m},'mt2').run`) === false, 'kartu terkunci dibuka: pewaktu tidak jalan');
G(`LK2={kartu:'mt3'}`); G('lkcSelaras()');
ok(G(`lkcGet(${m},'mt3').run`) === true, 'kartu belum terkunci: pewaktu jalan');
G(`LK2={}`);
/* Regresi: LKC dipakai lkpd-cetak.js (window.LKC); pewaktu memakai LKCT agar tidak saling menimpa di peramban. */
ok(!/\bLKC\b/.test(fs.readFileSync(path.join(root, 'js', 'lkpd-timer.js'), 'utf8')), 'pewaktu tidak memakai nama global LKC (bentrok dengan lkpd-cetak.js)');
console.log(`\nUji pewaktu per pertemuan: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
