#!/usr/bin/env node
/* Uji editor soal gerbang masuk LKPD v2 (js/lkpd-v2-editor.js: teks, pilihan, kunci, level, pembahasan, urutan, tambah/hapus).
   Harness sama dengan uji-lkpd-foto.mjs. node tools/uji-lkpd-gerbang.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const store = {}; const LIS = [];
const elStub = () => ({ addEventListener() {}, appendChild() {}, remove() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, dataset: {}, querySelector: () => null, querySelectorAll: () => [], setAttribute() {}, click() {} });
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, JSON, Math, Date, Object, Array, String, Number, Error, Buffer, isFinite,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, indexedDB: undefined,
  document: Object.assign(elStub(), { addEventListener(t, f, c) { LIS.push({ t, f, c }); }, createElement: elStub, body: elStub(), head: elStub(), getElementById: () => null, querySelectorAll: () => [], hidden: false }),
  Cloud: { on: false }, S: { user: { id: 'g1', nama: 'Guru', kelas: '' }, tab: 'lkpd', lkpdModules: [] }, CFG: {}, ICO: {}, SOAL_TKA: [],
  toast: (m) => { ctx.__toasts.push(m); }, __toasts: [], esc, lkEsc: esc,
  uid: () => 'u' + Math.random().toString(36).slice(2, 10), svg: () => '', $$: () => [], $: () => null, render() {}, isStaff: () => true, can: () => true,
  fromDoc: (d) => d, pick: (o, ks) => { const x = {}; ks.forEach((k) => { x[k] = o[k]; }); return x; },
  Jam: { now: () => Date.now() }, mmss: String, schAkunOk: () => true, schPeta: () => ({}), schHasilOk: () => true, schLabelModul: String, schKode: () => '', schNorm: String,
  uiConfirm: async () => true, viewKatalog() {}, LD: { SIDE: 800, MAXC: 100000 }, ldCall: async () => ({ ok: true, fileId: 'F1' }),
  ldSlug: (s, n) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, n),
  KELAS: { X: { judul: 'Kelas X', fase: 'E' } }, lkKelasOpts: () => '', lkElOpts: () => '', schOptModul: () => '',
  LK: { editor: null }, LKM: { reveal: {} }, LKPD_MODULES: [], LKPD_DEFAULT_MODULES: [], lkBuiltin: () => false,
  lkRefreshModules() {}, lkBuildModule: (v) => v, lkDraft: () => ({}), lkRead: () => ({}), lkmCur: () => null,
  lkioExport() {}, uiOk: () => true, lkSerialize: (m) => { const x = Object.assign({}, m); delete x.r; delete x.d; return x; }, lkModuleStore() {},
  LKPD_EXTRA_MODULES: [], lk2Num: (a) => Number(String(a).replace(',', '.')), lk2Fmt: (n) => String(n).replace('.', ','), lk2Txt: (a) => String(a == null ? '' : a),
};
ctx.lkEditorDefaults = (m) => (m ? { id: m.id, title: m.title, kelas: m.kelas, fase: m.fase, unit: m.unit, duration: m.duration, skkni: m.skkni, status: m.status, active: m.active !== false } : { id: '' });
ctx.viewBeranda = () => '';
ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; ctx.scrollTo = () => {};
vm.createContext(ctx);
const run = (code) => vm.runInContext(code, ctx);
/* lkValidateModule asli dari lkpd.js */
const lkpd = baca('js/lkpd.js');
const vm0 = lkpd.split('\n').find((l) => l.startsWith('function lkValidateModule'));
run(vm0);
for (const f of ['js/banksoal.js', 'js/soal-gambar.js', 'js/lkpd-soal.js', 'js/lkpd-v2-soal.js', 'js/lkpd-editor.js', 'js/lkpd-gambar.js', 'js/lkpd-skala-gambar.js', 'js/soal-grup.js', 'js/lkpd-v2-x07.js', 'js/lkpd-v2-editor.js']) {
  try { vm.runInContext(baca(f), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}
const x07 = run('LKPD_EXTRA_MODULES.filter(function(m){return m.id===\'LKPD-X-07\'})[0]');
ok('modul X-07 termuat', !!x07 && x07.v2 && x07.v2.ver === 2);
ctx.__x07 = x07; ctx.isStaff = () => STAFF; let STAFF = true;
const klik = async (a, o = {}) => {
  LIS.filter((l) => l.t === 'click' && l.c === true).forEach((l) => l.f({ target: { closest: (sel) => (sel.indexOf('gq-') > -1 ? { disabled: false, dataset: Object.assign({ lkvA: a }, Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]))) } : null) }, stopPropagation() {}, preventDefault() {} }));
  for (let k = 0; k < 4; k++) await Promise.resolve();
};
const G = (c) => run(c);
const orig = JSON.stringify(x07.v2.gate.qs);
G("var dg=lkEditorDefaults(__x07);dg.src=__x07;var S0=lkeInit(dg);LK.editor=dg;dg.tab='soal';var d0=lkEditorForm(dg);");
console.log('Tampilan editor gerbang');
ok('bagian gerbang tampil dengan 5 soal ringkas', G("d0.indexOf('Soal gerbang masuk')>-1&&(d0.match(/data-lkv-a=\"gq-open\"/g)||[]).length===5"));
ok('catatan: minimal 3 soal, 5 pilihan, level, pembahasan wajib', G("/minimal 3 soal/.test(d0)&&/pembahasan wajib/.test(d0)&&/Aplikasi atau Penalaran/.test(d0)"));
ok('soal tertutup tidak memuat kolom isian', G("d0.indexOf('data-lke=\"gate.0.q\"')<0"));
ok('tombol tambah PG, PG kompleks, PG kategori', G("/gq-add\" data-v=\"pg\">\\+ PG</.test(d0)&&/gq-add\" data-v=\"kompleks\"/.test(d0)&&/gq-add\" data-v=\"kategori\"/.test(d0)"));
await klik('gq-open', { i: 0 });
G("var d1=lkEditorForm(dg);");
ok('buka soal 1: kolom pertanyaan, 5 pilihan, pembahasan, level, jenis', G("d1.indexOf('data-lke=\"gate.0.q\"')>-1&&(d1.match(/data-lke=\"gate\\.0\\.o\\.\\d\"/g)||[]).length===5&&d1.indexOf('data-lke=\"gate.0.e\"')>-1&&/gq-lvl/.test(d1)&&/gq-type/.test(d1)"));
ok('buka soal 1: kunci B bertanda, tombol foto tetap ada', G("/gq-key\" data-i=\"0\" data-j=\"1\" aria-pressed=\"true\"/.test(d1)&&d1.indexOf('data-lkv-a=\"g-img\" data-i=\"0\" data-w=\"q\"')>-1"));
ok('hanya satu soal terbuka', G("(d1.match(/lke-q open/g)||[]).length===1"));

console.log('Simpan');
ok('tanpa perubahan: gerbang tersimpan identik dengan aslinya', G("JSON.stringify(lkeBuild(dg).v2.gate.qs)")===orig);
G("lkeSet('gate.0.q','Pertanyaan baru gerbang');lkeSet('gate.0.e','Pembahasan baru');lkeSet('gate.0.o.2','Pilihan C baru');var m1=lkeBuild(dg).v2.gate.qs;");
ok('teks pertanyaan, pembahasan, dan pilihan terubah di simpanan', G("m1[0].q==='Pertanyaan baru gerbang'&&m1[0].e==='Pembahasan baru'&&m1[0].o[2]==='Pilihan C baru'&&m1[0].a===__x07.v2.gate.qs[0].a"));
ok('soal lain tidak berubah', G("JSON.stringify(m1.slice(1))===JSON.stringify(__x07.v2.gate.qs.slice(1))"));
ok('modul X-07 asli tidak termutasi', JSON.stringify(x07.v2.gate.qs) === orig);
ok('editor ditandai berubah', G("lkeDirty(dg)")===true);

console.log('Jenis soal, kunci, level');
await klik('gq-key', { i: 0, j: 3 });
ok('PG: ketuk huruf D memindahkan kunci ke D', G("dg.S.gate[0].a")===3);
await klik('gq-key', { i: 0, j: 3 });
ok('PG: ketuk lagi mengosongkan kunci', G("dg.S.gate[0].a")===-1);
ok('kunci kosong dilaporkan', G("lkeIssues(dg).some(function(x){return /Gerbang masuk no\\. 1: .*jawaban benar/.test(x.msg)})"));
await klik('gq-key', { i: 0, j: 1 });
await klik('gq-type', { i: 0, v: 'kompleks' });
ok('PG ke PG kompleks: kunci jadi daftar, pilihan, level, pembahasan, teks terbawa', G("var g0=dg.S.gate[0];g0.t==='kompleks'&&JSON.stringify(g0.a)==='[1]'&&g0.o.length===5&&g0.lvl==='Aplikasi'&&g0.e==='Pembahasan baru'&&g0.q==='Pertanyaan baru gerbang'"));
await klik('gq-key', { i: 0, j: 3 });
ok('kompleks: kunci ganda B dan D', G("JSON.stringify(dg.S.gate[0].a)")==='[1,3]');
ok('simpan kompleks: t kompleks, kunci terurut', G("var mk=lkeBuild(dg).v2.gate.qs[0];mk.t==='kompleks'&&JSON.stringify(mk.a)==='[1,3]'"));
await klik('gq-type', { i: 0, v: 'pg' });
ok('PG kompleks ke PG: ambil kunci pertama', G("dg.S.gate[0].t==='pg'&&dg.S.gate[0].a===1"));
await klik('gq-lvl', { i: 0, v: 'Penalaran' });
ok('level diganti Penalaran dan tersimpan', G("dg.S.gate[0].lvl==='Penalaran'&&lkeBuild(dg).v2.gate.qs[0].lvl==='Penalaran'"));
G("dg.S.gate[0].lvl='Hafalan'");
ok('level di luar Aplikasi/Penalaran dilaporkan', G("lkeIssues(dg).some(function(x){return /no\\. 1: Pilih level/.test(x.msg)})"));
await klik('gq-lvl', { i: 0, v: 'Aplikasi' });
G("dg.S.gate[0].e='';");
ok('pembahasan kosong dilaporkan', G("lkeIssues(dg).some(function(x){return /no\\. 1: Pembahasan wajib/.test(x.msg)})"));
G("dg.S.gate[0].e='Pembahasan baru';");

console.log('Pilihan dan pernyataan');
await klik('gq-opt-add', { i: 0 });
ok('tambah pilihan: 6 pilihan', G("dg.S.gate[0].o.length")===6);
G("dg.S.gate[0].o[5]='';dg.S.gate[0].o[0]='';dg.S.gate[0].a=1;var mb=lkeBuild(dg).v2.gate.qs[0];");
ok('simpan: pilihan kosong dibuang dan kunci mengikuti pilihan yang sama', G("mb.o.length===4&&mb.o[0]===__x07.v2.gate.qs[0].o[1]&&mb.a===0"));
G("dg.S.gate[0].o[0]='A pulih';dg.S.gate[0].o.pop();");
await klik('gq-opt-del', { i: 0, j: 4 });
ok('hapus pilihan sampai 4 diizinkan', G("dg.S.gate[0].o.length")===4);
ctx.__toasts.length = 0;
await klik('gq-opt-del', { i: 0, j: 3 });
ok('minimal 4 pilihan', G("dg.S.gate[0].o.length")===4 && ctx.__toasts.some((t) => /Minimal 4 pilihan/.test(t)));
G("var ik=dg.S.gate.findIndex(function(q){return q.t==='kategori'});");
const ik = G('ik');
ok('ada soal PG kategori pada data', ik >= 0);
const rows0 = G(`dg.S.gate[${ik}].rows.length`);
await klik('gq-kat', { i: ik, j: 0, v: 0 });
ok('kategori: kunci pernyataan 1 menjadi Salah', G(`dg.S.gate[${ik}].rows[0][1]`) === false);
await klik('gq-kat', { i: ik, j: 0, v: 1 });
ok('kategori: kembali Benar', G(`dg.S.gate[${ik}].rows[0][1]`) === true);
await klik('gq-row-add', { i: ik });
ok('kategori: tambah pernyataan', G(`dg.S.gate[${ik}].rows.length`) === rows0 + 1);
G(`dg.S.gate[${ik}].rows[${rows0}][0]=''`);
ok('simpan kategori: pernyataan kosong dibuang', G(`lkeBuild(dg).v2.gate.qs[${ik}].rows.length`) === rows0);
await klik('gq-row-del', { i: ik, j: rows0 });
ctx.__toasts.length = 0;
for (let k = 0; k < 4; k++) await klik('gq-row-del', { i: ik, j: 0 });
ok('kategori: minimal 3 pernyataan', G(`dg.S.gate[${ik}].rows.length`) === 3 && ctx.__toasts.some((t) => /Minimal 3 pernyataan/.test(t)));

console.log('Tambah, urut, duplikat, hapus');
G("dg.S.gate=lkeCp(__x07.v2.gate.qs);dg.gi=-1");
await klik('gq-add', { v: 'pg' });
ok('tambah PG: soal ke-6, 5 pilihan kosong, level Aplikasi, soal terbuka', G("var n6=dg.S.gate[5];dg.S.gate.length===6&&n6.t==='pg'&&n6.o.length===5&&n6.lvl==='Aplikasi'&&dg.gi===5"));
ok('soal baru kosong dilaporkan (pertanyaan)', G("lkeIssues(dg).some(function(x){return /no\\. 6: Pertanyaan belum diisi/.test(x.msg)})"));
await klik('gq-add', { v: 'kategori' });
ok('tambah PG kategori: 3 pernyataan', G("dg.S.gate[6].t==='kategori'&&dg.S.gate[6].rows.length===3"));
await klik('gq-add', { v: 'kompleks' });
ok('tambah PG kompleks: kunci kosong', G("dg.S.gate[7].t==='kompleks'&&Array.isArray(dg.S.gate[7].a)&&dg.S.gate[7].a.length===0"));
await klik('gq-add', { v: 'pg' }); await klik('gq-add', { v: 'pg' });
ctx.__toasts.length = 0;
await klik('gq-add', { v: 'pg' });
ok('maksimal 10 soal', G("dg.S.gate.length")===10 && ctx.__toasts.some((t) => /Maksimal 10/.test(t)));
G("dg.S.gate=lkeCp(__x07.v2.gate.qs)");
await klik('gq-down', { i: 0 });
ok('turun: soal 1 pindah ke posisi 2', G("dg.S.gate[1].q")===x07.v2.gate.qs[0].q && G("dg.S.gate[0].q")===x07.v2.gate.qs[1].q);
await klik('gq-up', { i: 1 });
ok('naik: kembali ke urutan asli', G("JSON.stringify(dg.S.gate)")===orig);
await klik('gq-dup', { i: 2 });
ok('duplikat: soal 3 disalin ke posisi 4', G("dg.S.gate.length===6&&JSON.stringify(dg.S.gate[3])===JSON.stringify(dg.S.gate[2])"));
await klik('gq-del', { i: 3 });
ok('hapus (setelah konfirmasi): kembali 5 soal', G("JSON.stringify(dg.S.gate)")===orig);
G("dg.S.gate=lkeCp(__x07.v2.gate.qs).slice(0,3)");
ctx.__toasts.length = 0;
await klik('gq-del', { i: 0 });
ok('minimal 3 soal: hapus ditolak', G("dg.S.gate.length")===3 && ctx.__toasts.some((t) => /minimal 3 soal/.test(t)));
G("dg.S.gate=lkeCp(__x07.v2.gate.qs).slice(0,2)");
ok('kurang dari 3 soal dilaporkan', G("lkeIssues(dg).some(function(x){return /Gerbang masuk minimal 3 soal/.test(x.msg)})"));
G("dg.S.gate=lkeCp(__x07.v2.gate.qs)");
ok('data asli X-07 tidak punya masalah gerbang', G("lkeIssues(dg).filter(function(x){return /^Gerbang masuk/.test(x.msg)}).length")===0);

console.log('Hak akses dan LKPD biasa');
STAFF = false; G("dg.S.gate=lkeCp(__x07.v2.gate.qs)");
await klik('gq-del', { i: 0 }); await klik('gq-add', { v: 'pg' });
ok('bukan guru/admin: aksi gerbang diabaikan', G("dg.S.gate.length")===5);
STAFF = true;
ok('LKPD biasa tidak punya aksi/bagian gerbang', G("var dz={id:'X-9',src:{id:'X-9',theory:[['a','b']],quiz:[],objectives:['o'],steps:[['s',10,'i']],checks:[['c','k']],tools:['t'],safety:['k3'],symptoms:[]}};lkeInit(dz);dz.tab='soal';lkEditorForm(dz).indexOf('gq-')<0&&lkeBuild(dz).v2===undefined"));
console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
