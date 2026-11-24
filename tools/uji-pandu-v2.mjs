#!/usr/bin/env node
/* Uji terpadu pembeda Latihan/Ujian dengan render LKPD v2 ASLI (lkpd-v2.js, data X-07) + lkpd-mode.js + lkpd-pandu.js. node tools/uji-pandu-v2.mjs */
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
const G = (e) => vm.runInContext(e, ctx);
run(`
function kelasBoleh(){return ['X']}
function lkcKelasInfo(){return {judul:'Kelas X',sub:''}}
function lkHasK(x){return x.koreksi!==undefined&&x.koreksi!==null&&x.koreksi!==''}
function lkNilai(x){return lkHasK(x)?Number(x.koreksi):x.score}
function schHasilList(a){return a}
function lkcRecs(m,staff){return schHasilList(S.lkpd||[]).filter(function(x){return x.moduleId===m.id&&(staff||x.sid===S.user.id)})}
function lkcModules(k,staff){return LKPD_MODULES.filter(function(m){return m.kelas===k&&(staff||(m.status==='published'&&m.active!==false))})}
function lkSerialize(m){var x=Object.assign({},m);delete x.r;delete x.d;return x}
function lkModuleStore(m){var i=LKPD_MODULES.findIndex(function(x){return x.id===m.id});if(i<0)LKPD_MODULES.push(m);else LKPD_MODULES[i]=m}
function lkBuildModule(v){return {id:v.id,checks:[]}}
`, 'stub2');
run(src('lkpd-mode.js'), 'lkpd-mode.js');
run(src('lkpd-pandu.js'), 'lkpd-pandu.js');
G(`LKPD_MODULES[0].kelas='X';LKPD_MODULES[0].status='published';LKPD_MODULES[0].active=true;LKPD_MODULES[0].checks[0][2]='0,00 mm';STAFF=true;LK.preview=true;LK.module='LKPD-X-07';LK.tab='kerja'`);
const kerja = (mode, extra) => { G(`LKPD_MODULES[0].mode='${mode}';Object.assign(LKPD_MODULES[0],${JSON.stringify(extra || {})})`); return G(`viewLKPD()`); };

/* Latihan */
let h = kerja('latihan');
ok(/Latihan berpemandu/.test(h), 'Latihan v2 asli: kartu panduan muncul');
ok(/<details class="lkp-b"><summary>Bantuan: lihat angka acuan<\/summary>Acuan: 0,00 mm<\/details>/.test(h), 'Latihan v2 asli: angka acuan di balik Bantuan');
ok(h.indexOf('lkp-pandu') < h.indexOf('Lembar Kerja') || h.indexOf('lkp-pandu') > -1, 'kartu panduan ada');
ok(/Mode Latihan/.test(h) && h.indexOf('lkm-banner') > -1, 'banner mode Latihan tetap ada');
ok(h.split('lkp-pandu').length === 2, 'kartu panduan hanya satu kali');
h = kerja('latihan', { pandu: false });
ok(!/lkp-pandu|lkp-b/.test(h) && /Acuan: 0,00 mm/.test(h), 'pandu=false: tampilan Latihan lama (acuan langsung tampil)');
G(`LK.tab='materi'`); h = G(`viewLKPD()`);
ok(!/lkp-pandu/.test(h), 'tab Materi tidak ada kartu panduan');
G(`LK.tab='evaluasi'`); h = G(`viewLKPD()`);
ok(!/lkp-pandu/.test(h), 'tab Evaluasi tidak ada kartu panduan');
G(`LK.tab='kerja'`);

/* Ujian */
h = kerja('ujian', { pandu: true, fotoUjian: true, maxTry: 1, tahap: false });
ok(/Ujian mandiri/.test(h) && !/Acuan: 0,00 mm|lk-acuan/.test(h), 'Ujian v2 asli: kartu mandiri dan acuan hilang');
ok(/Foto bukti wajib pada <b>semua/.test(h) || /semua<\/b> komponen/.test(h), 'Ujian: aturan foto semua komponen disebut');
ok(/Mode Ujian/.test(h), 'banner mode Ujian tetap ada');
h = kerja('ujian', { hidePetunjuk: false });
ok(!/lk-acuan/.test(h), 'Ujian: acuan hilang walau petunjuk komponen tidak disembunyikan');

G(`STAFF=false;LK.preview=false;LKPD_MODULES[0].mode='latihan'`);
ok(!/lkp-pandu/.test(G(`viewLKPD()`)) && /terkunci/.test(G(`viewLKPD()`)), 'siswa yang belum lulus gerbang masuk: Lembar Kerja terkunci tanpa kartu panduan');
G(`LKPD_MODULES[0].mode='ujian';STAFF=true;LK.preview=true`);
/* Foto wajib: komponen apa pun kini punya penanda wajib di tampilan siswa? (ldRowCam memakai ldReq) */
G(`LKPD_MODULES[0].fotoWajib=[0];LKPD_MODULES[0].fotoUjian=true`);
ok(G(`lkpFotoWajib(LKPD_MODULES[0])`).length === 7, 'Ujian + fotoUjian mewajibkan semua 7 komponen');
G(`LKPD_MODULES[0].fotoUjian=false`);
ok(G(`lkpFotoWajib(LKPD_MODULES[0])`).length === 1, 'tanpa fotoUjian hanya daftar bawaan');

/* Tahap Latihan lalu Ujian di LKPD-X-07 asli: satu LKPD, tanpa salinan */
G(`LKPD_MODULES[0].mode='ujian';LKPD_MODULES[0].tahap=true;LKPD_MODULES[0].gKali=2;LKPD_MODULES[0].maxTry=1;LKPD_MODULES[0].fotoUjian=true;S.lkpd=[];S.kelas='X';STAFF=false;LK.preview=false;LK.tab='kerja'`);
ok(G(`LKPD_MODULES.length`) === 1, 'hanya satu LKPD, tidak ada salinan');
/* Gerbang masuk soal TKA (v2) dianggap sudah lulus supaya Lembar Kerja terbuka bagi siswa uji */
G(`var _g0=lk2Gate,FORCE=true;lk2Gate=function(m,d){var g=_g0(m,d);if(FORCE)g.lulus=true;return g}`);
ok(G(`lkmLock(LKPD_MODULES[0])`) === '', 'siswa baru tidak terkunci: langsung bisa berlatih');
let dh = G(`lkListView()`);
ok((dh.match(/<article class="card job/g) || []).length === 1, 'daftar siswa: hanya satu kartu LKPD (tidak membingungkan)');
ok(/20 JP · 5 pertemuan/.test(dh) && !/900 menit/.test(dh), 'kartu LKPD-X-07 asli: 20 JP · 5 pertemuan, bukan 900 menit');
ok(/Tahap 1: Latihan 0\/2/.test(dh) && />Latihan<\/span>/.test(dh) && /Mulai latihan/.test(dh) && !/Mulai praktik/.test(dh), 'kartu siswa: label Latihan, Tahap 1 0/2, tombol Mulai latihan');
ok(!/Kesempatan 0\/1/.test(dh), 'kartu siswa tahap Latihan: kesempatan Ujian belum ditampilkan sebagai batas latihan');
h = G(`viewLKPD()`);
ok(/Mode Latihan/.test(h) && /Tahap 1 dari 2/.test(h) && /Latihan berpemandu/.test(h) && /Bantuan: lihat angka acuan/.test(h), 'LKPD asli tahap Latihan: spanduk tahap 1, kartu panduan, Bantuan angka acuan');
ok(!/Ujian mandiri/.test(h), 'tahap Latihan: tidak memuat kartu Ujian mandiri');
G(`S.lkpd.push({moduleId:'LKPD-X-07',sid:'u1',ts:10,score:80,payload:JSON.stringify({mode:'latihan'})},{moduleId:'LKPD-X-07',sid:'u1',ts:20,score:80,payload:JSON.stringify({mode:'latihan'})})`);
dh = G(`lkListView()`);
ok(/Tahap 2: Ujian/.test(dh) && />Ujian<\/span>/.test(dh) && /Mulai praktik/.test(dh) && !/Mulai latihan/.test(dh), 'kartu siswa: dua latihan lulus, LKPD yang sama menjadi Ujian (Tahap 2)');
h = G(`viewLKPD()`);
ok(/Mode Ujian/.test(h) && /Tahap 2 dari 2/.test(h) && /Ujian mandiri/.test(h) && !/lk-acuan/.test(h) && !/Latihan berpemandu/.test(h), 'LKPD asli tahap Ujian: spanduk tahap 2, kartu Ujian mandiri, angka acuan hilang');
ok(/Foto bukti wajib pada <b>semua/.test(h), 'tahap Ujian: aturan foto semua komponen disebut');
G(`LKPD_MODULES[0].maxTry=2;S.lkpd.push({moduleId:'LKPD-X-07',sid:'u1',ts:30,score:40,payload:JSON.stringify({mode:'ujian'})})`);
dh = G(`lkListView()`);
ok(/Remedial/.test(dh) && /Tahap 1: Latihan 0\/2/.test(dh) && /Latihan lagi/.test(dh), 'kartu siswa: Ujian gagal, kembali Tahap 1 dengan penanda Remedial dan tombol Latihan lagi');
G(`LKPD_MODULES[0].maxTry=1`);
dh = G(`lkListView()`);
ok(!/Remedial/.test(dh) && /Kesempatan 1\/1/.test(dh), 'jatah Ujian habis: tidak kembali ke Latihan, kesempatan 1/1');
G(`STAFF=true;S.lkpd=[]`);
dh = G(`lkListView()`);
ok(/Bertahap: Latihan/.test(dh) && !/Tahap 1: Latihan/.test(dh), 'kartu guru: tag Bertahap, tanpa status tahap siswa');
G(`STAFF=false`);

/* Gerbang masuk hanya di Latihan, Evaluasi hanya di Ujian (LKPD-X-07 asli) */
G(`FORCE=false;STAFF=false;LK.preview=false;S.lkpd=[];LKPD_MODULES[0].mode='ujian';LKPD_MODULES[0].tahap=true;LKPD_MODULES[0].gKali=1;LKPD_MODULES[0].maxTry=0`);
G(`LK.tab='materi'`); h = G(`viewLKPD()`);
ok(/id="lk2-gate"/.test(h) && /Gerbang masuk praktik/.test(h), 'Latihan: soal gerbang masuk tampil di tab Materi');
ok(!/data-v="evaluasi"/.test(h), 'Latihan: tab Evaluasi tidak ada');
G(`LK.tab='kerja'`); h = G(`viewLKPD()`);
ok(/Lembar Kerja terkunci/.test(h), 'Latihan: gerbang masuk tetap mengunci Lembar Kerja sampai lulus');
G(`LK.tab='evaluasi'`); h = G(`viewLKPD()`);
ok(/Evaluasi hanya dikerjakan pada tahap Ujian/.test(h) && !/Pembahasan latihan|Periksa jawaban/.test(h), 'Latihan: isi Evaluasi dan pembahasan tidak tampil');
/* Mode Latihan v2: pembahasan ada di bagian bawah Lembar Kerja (tab Evaluasi tidak ada di Latihan) */
G(`(function(){var m=LKPD_MODULES[0],d={};m.v2.gate.qs.forEach(function(q,i){var k='q'+(100+i);if(q.t==='pg')d[k]=q.a;else if(q.t==='kompleks')d[k]=q.a.slice();else{var o={};q.rows.forEach(function(r,j){o[j]=r[1]});d[k]=o}});DRAFT=d;m.tahap=false;m.mode='latihan';m.showKey=true})()`);
G(`LK.tab='kerja'`); h = G(`viewLKPD()`);
ok(/Latihan membaca skala/.test(h) && /Pembahasan latihan/.test(h) && /bagian bawah Lembar Kerja/.test(h) && !/pembahasan bisa dilihat di tab Evaluasi/.test(h), 'Latihan v2: pembahasan tampil di Lembar Kerja dan spanduk menunjuk tempat yang benar');
ok(h.indexOf('Pembahasan latihan') > -1 && h.indexOf('Pembahasan latihan') < h.indexOf('data-lk2d="bn-kunci"') && h.indexOf('data-lk2d="bn-kunci"') < h.indexOf('class="lk-actions"'), 'Latihan v2: Pembahasan di atas kartu Kunci pertemuan, kartu Kunci paling bawah sebelum bilah tombol');
G(`LK.tab='materi'`); h = G(`viewLKPD()`);
ok(!/Pembahasan latihan/.test(h), 'Latihan v2: pembahasan tidak muncul di tab Materi');
G(`(function(){var m=LKPD_MODULES[0];m.tahap=true;m.mode='ujian';DRAFT={}})()`);
/* Naik ke Ujian */
G(`S.lkpd.push({moduleId:'LKPD-X-07',sid:'u1',ts:10,score:80,payload:JSON.stringify({mode:'latihan'})})`);
G(`LK.tab='materi'`); h = G(`viewLKPD()`);
ok(!/id="lk2-gate"/.test(h) && !/Gerbang masuk praktik/.test(h), 'Ujian: soal gerbang masuk tidak tampil');
ok(/Tujuan pembelajaran/.test(h) && /Alat dan bahan/.test(h) && /Checklist|APD|K3/.test(h), 'Ujian: bagian lain Materi (tujuan, alat bahan, K3) tetap tampil');
ok(/data-v="evaluasi"/.test(h), 'Ujian: tab Evaluasi ada');
G(`LK.tab='kerja'`); h = G(`viewLKPD()`);
ok(!/Lembar Kerja terkunci/.test(h) && /Identitas praktik/.test(h), 'Ujian: Lembar Kerja terbuka tanpa gerbang masuk');
ok(G(`lk2Gate(LKPD_MODULES[0],{}).lulus`) === true, 'Ujian: lk2Gate lulus (kirim tidak dihambat gerbang)');
G(`LK.tab='evaluasi'`); h = G(`viewLKPD()`);
ok(!/Evaluasi hanya dikerjakan pada tahap Ujian/.test(h), 'Ujian: Evaluasi tampil (terkunci sampai praktik diverifikasi)');
/* Pratinjau guru = versi Ujian */
G(`STAFF=true;LK.preview=true;S.lkpd=[];LK.tab='materi'`); h = G(`viewLKPD()`);
ok(!/id="lk2-gate"/.test(h) && /data-v="evaluasi"/.test(h), 'Pratinjau guru: versi Ujian (tanpa gerbang masuk, ada Evaluasi)');
G(`STAFF=false;LK.preview=false;S.lkpd=[]`);
/* Skor Latihan hanya dari praktik */
G(`LKPD_MODULES[0].tahap=true;LKPD_MODULES[0].mode='ujian'`);
const sk = JSON.parse(G(`JSON.stringify(lkScore({}))`));
ok(sk.final === sk.practice && sk.theory === 0, 'nilai Latihan = nilai praktik (bobot teori tidak menurunkan)');
G(`S.lkpd.push({moduleId:'LKPD-X-07',sid:'u1',ts:10,score:80,payload:JSON.stringify({mode:'latihan'})})`);
const sj = JSON.parse(G(`JSON.stringify(lkScore({}))`));
ok(sj.final === Math.round(sj.practice * (G(`LKPD_MODULES[0].rubric.practiceWeight`) / 100) + sj.theory * (G(`LKPD_MODULES[0].rubric.theoryWeight`) / 100)), 'nilai Ujian: rumus asli (praktik x bobot + teori x bobot)');
G(`S.lkpd=[]`);
console.log(`\nUji terpadu v2: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
