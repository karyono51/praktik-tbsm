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
h = kerja('ujian', { pandu: true, fotoUjian: true, maxTry: 1, gerbang: '' });
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

/* Gerbang terhadap LKPD asli */
G(`LKPD_MODULES[0].mode='ujian';LKPD_MODULES[0].gerbang='LKPD-X-07-L';LKPD_MODULES[0].gKali=1;S.lkpd=[];LK.tab='kerja'`);
G(`lkpSalin_test=0`);
G(`STAFF=true;LKM.edit='LKPD-X-07';LKM.d={mode:'ujian',gerbang:''}`);
G(`lkpSalin()`);
const L = G(`LKPD_MODULES.find(function(x){return x.id==='LKPD-X-07-L'})`);
ok(L && L.mode === 'latihan' && L.status === 'published' && L.v2 && L.v2.langkah.length === 6 || (L && L.v2), 'salinan LKPD-X-07 asli: lengkap dengan data v2');
G(`STAFF=false;LK.preview=false`);
ok(/Ujian terbuka setelah latihan/.test(G(`lkmLock(LKPD_MODULES[0])`)), 'siswa: ujian terkunci sebelum latihan');
h = G(`viewLKPD()`);
ok(/Ujian terbuka setelah latihan/.test(h), 'banner ujian memuat pesan gerbang');
G(`S.lkpd.push({moduleId:'LKPD-X-07-L',sid:'u1',ts:5,score:90,payload:JSON.stringify({mode:'latihan'})})`);
ok(G(`lkmLock(LKPD_MODULES[0])`) === '', 'setelah latihan 90: ujian terbuka');
/* Daftar kartu siswa (lkListView asli) */
G(`S.lkpd=[];STAFF=false;LK.preview=false;S.kelas='X';LKPD_MODULES[0].gKali=2;LKPD_MODULES[0].maxTry=0`);
let dh = G(`lkListView()`);
ok(/Latih lagi 0\/2/.test(dh) && /Buka latihan/.test(dh) && /Ujian terbuka setelah latihan/.test(dh) && !/Mulai praktik/.test(dh), 'kartu siswa: Ujian terkunci, tombol Buka latihan, tanpa Mulai praktik');
ok(/Mulai latihan/.test(dh), 'kartu Latihan salinan tampil dengan Mulai latihan');
G(`S.lkpd.push({moduleId:'LKPD-X-07-L',sid:'u1',ts:10,score:80,payload:JSON.stringify({mode:'latihan'})},{moduleId:'LKPD-X-07-L',sid:'u1',ts:20,score:80,payload:JSON.stringify({mode:'latihan'})})`);
dh = G(`lkListView()`);
ok(/Siap ujian/.test(dh) && /Mulai praktik/.test(dh) && !/Buka latihan/.test(dh), 'kartu siswa: dua latihan lulus, Siap ujian dan tombol Mulai praktik');
G(`S.lkpd.push({moduleId:'LKPD-X-07',sid:'u1',ts:30,score:40,payload:JSON.stringify({mode:'ujian'})})`);
dh = G(`lkListView()`);
ok(/Remedial/.test(dh) && /Latihan terarah \(remedial\)/.test(dh) && /Belum kompeten/.test(dh), 'kartu siswa: Ujian gagal, Remedial dan tombol Latihan terarah');
G(`STAFF=true`);
dh = G(`lkListView()`);
ok(/Prasyarat: /.test(dh) && !/Latih lagi/.test(dh), 'kartu guru: tag Prasyarat, tanpa status gerbang siswa');
G(`STAFF=false`);
console.log(`\nUji terpadu v2: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
