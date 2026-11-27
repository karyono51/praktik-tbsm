#!/usr/bin/env node
/* Uji Edit LKPD v2 mengikuti form siswa (js/lkpd-v2-struktur.js): urutan tab, rencana pertemuan, langkah, tabel data,
   komponen pemeriksaan, kelompok K3, syarat kirim. Harness sama dengan uji-lkpd-gerbang.mjs. node tools/uji-lkpd-struktur.mjs */
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
for (const f of ['js/banksoal.js', 'js/soal-gambar.js', 'js/lkpd-soal.js', 'js/lkpd-v2-soal.js', 'js/lkpd-editor.js', 'js/lkpd-gambar.js', 'js/lkpd-skala-gambar.js', 'js/soal-grup.js', 'js/lkpd-v2-x06.js', 'js/lkpd-v2-x12.js', 'js/lkpd-v2-x18.js', 'js/lkpd-v2-xi17.js', 'js/lkpd-v2-xi18.js', 'js/lkpd-v2-editor.js', 'js/lkpd-v2-struktur.js']) {
  try { vm.runInContext(baca(f), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}

/* Modul bertabel: salinan LKPD-DDO-ALT-02 dengan tabel F1 sampai F3 dari fixtur (modul asli sekarang tanpa tabel) */
run("(function(){var s=LKPD_EXTRA_MODULES.filter(function(m){return m.id==='LKPD-DDO-ALT-02'})[0];var c=JSON.parse(JSON.stringify(s));c.id='LKPD-FIX-TABEL';LKPD_EXTRA_MODULES.push(c);window.__fixm=c})()");
run(baca('tools/fixtur-tabel-x06.js').replace('LKPD_MODULES[0]', '__fixm'), { filename: 'fixtur-tabel-x06.js' });
const mods = run("LKPD_EXTRA_MODULES.filter(function(m){return m.v2&&m.v2.ver===2})");
ok('enam modul v2 termuat (lima asli + satu salinan bertabel)', mods.length === 6, 'jumlah ' + mods.length);
ctx.__mods = mods; ctx.isStaff = () => true;
const G = (c) => run(c);
const fire = async (jenis, target) => {
  LIS.filter((l) => l.t === jenis).forEach((l) => l.f({ target, stopPropagation() {}, preventDefault() {} }));
  for (let k = 0; k < 4; k++) await Promise.resolve();
};
const data = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
const klik = (a, o = {}) => fire('click', { closest: (sel) => (sel.indexOf('data-lks-a') > -1 ? { disabled: false, dataset: Object.assign({ lksA: a }, data(o)) } : null) });
const ketik = (p, v) => fire('input', { dataset: { lksp: p }, value: String(v), type: 'text', tagName: 'INPUT' });
const ubah = (p, v, o = {}) => fire('change', { dataset: Object.assign({ lksp: p }, o), value: String(v), checked: v === true, type: typeof v === 'boolean' ? 'checkbox' : 'text', tagName: typeof v === 'boolean' ? 'INPUT' : 'SELECT' });
const pilih = (c, o, v) => fire('change', { dataset: Object.assign({ lksC: c }, data(o)), value: v === undefined ? '' : String(v), checked: v === true, type: typeof v === 'boolean' ? 'checkbox' : 'select-one', tagName: typeof v === 'boolean' ? 'INPUT' : 'SELECT' });
const buka = (id) => G("var m0=__mods.filter(function(m){return m.id==='" + id + "'})[0];__m0=m0;var dg=lkEditorDefaults(m0);dg.src=m0;lkeInit(dg);LK.editor=dg;dg.tab='info';lkEditorForm(dg);");
const form = (tab) => G("dg.tab='" + tab + "';lkEditorForm(dg)");
const hit = (re, s) => (s.match(re) || []).length;
const asli = G("JSON.stringify(__mods)");

console.log('Simpan tanpa perubahan identik untuk semua modul v2');
for (const m of mods) {
  buka(m.id);
  const sama = G("JSON.stringify(lkeBuild(dg).v2)===JSON.stringify(__m0.v2)");
  ok(m.id + ': v2 hasil simpan identik dengan aslinya', sama === true);
  ok(m.id + ': alokasi waktu dan fotoWajib tetap', G("var bb=lkeBuild(dg);bb.duration===__m0.duration&&JSON.stringify(bb.fotoWajib)===JSON.stringify(__m0.fotoWajib)") === true);
  ok(m.id + ': tanpa masalah struktur', G("lksIssues(dg).length") === 0, JSON.stringify(G("lksIssues(dg)")));
  ok(m.id + ': tidak dianggap berubah', G("lkeDirty(dg)") === false);
  ok(m.id + ': lolos lkValidateModule', G("lkValidateModule(lkeBuild(dg))") === '');
}

console.log('Urutan tab mengikuti form siswa');
buka('LKPD-DDO-ALT-02');
const f0 = form('info');
ok('tab v2: info, tujuan, rencana, gerbang, bahan, langkah, tabel, cek, kirim, soal, nilai', G("LKE.TABS.map(function(t){return t[0]}).join()") === 'info,tujuan,rencana,gerbang,bahan,langkah,tabel,cek,kirim,soal,nilai');
ok('bilah editor berkelompok: Info, Materi, Lembar Kerja, Evaluasi, dengan sub-tab bagian aktif', ['Info', 'Materi', 'Lembar Kerja', 'Evaluasi'].every((n) => f0.includes('<span class="lke-gt">' + n + '</span>')));
ok('sub-tab Materi: tujuan, rencana, gerbang, bahan', (() => { const m = form('tujuan'); return m.includes('aria-label="Bagian Materi"') && ['Tujuan & teori', 'Rencana pertemuan', 'Gerbang masuk', 'Alat & K3'].every((n) => m.includes(n)); })());
ok('Materi sebelum Lembar Kerja sebelum Evaluasi', f0.indexOf('>Materi<') < f0.indexOf('>Lembar Kerja<') && f0.indexOf('>Lembar Kerja<') < f0.indexOf('>Evaluasi<'));
G("var nv=lkeCp(__m0);delete nv.v2;var dn=lkEditorDefaults(nv);dn.src=nv;lkeInit(dn);LK.editor=dn;lkEditorForm(dn);");
ok('LKPD biasa tetap memakai tab lama (7 tab)', G("LKE.TABS.map(function(t){return t[0]}).join()") === 'info,tujuan,bahan,langkah,cek,soal,nilai');
ok('LKPD biasa tidak memuat bagian struktur v2', G("lkEditorForm(dn).indexOf('lks-grp')<0&&!dn.S.v2s"));
G("LK.editor=dg;lkEditorForm(dg)");
ok('kembali ke editor v2: tab v2 dipulihkan', G("LKE.TABS.length") === 11);

console.log('Tab Rencana pertemuan');
let h = form('rencana');
ok('5 pertemuan tampil ringkas (tertutup)', hit(/data-lks-a="p-open"/g, h) === 5 && h.indexOf('data-lksp="v2s.pertemuan.1.judul"') < 0);
ok('ringkasan total: 5 pertemuan, 20 JP, 900 menit', /5 pertemuan · 20 JP · 900 menit/.test(h));
ok('4 nama kegiatan dan 9 langkah dengan pilihan kegiatan, menit, saksi', hit(/data-lksp="v2s\.kegiatan\.\d"/g, h) === 4 && hit(/data-lksp="v2s\.langkah\.\d+\.k"/g, h) === 9 && hit(/data-lksp="v2s\.langkah\.\d+\.menit"/g, h) === 9 && hit(/data-lksp="v2s\.langkah\.\d+\.saksi"/g, h) === 9);
ok('3 langkah bersaksi tercentang pada ALT-02 (langkah 3, 5, 7, 8 = 4)', hit(/data-lksp="v2s\.langkah\.\d+\.saksi" checked/g, h) === 4);
await klik('p-open', { i: 1 });
h = form('rencana');
ok('buka pertemuan 2: judul, JP, menit, target praktik, kegiatan, kartu', ['judul', 'jp', 'menit', 'praktik', 'kartu.judul'].every((k) => h.indexOf('data-lksp="v2s.pertemuan.1.' + k + '"') > -1) && hit(/data-lks-c="p-keg" data-i="1"/g, h) === 4);
ok('pertemuan 2: kegiatan 1 tercentang saja', /data-k="1" checked/.test(h) && !/data-k="2" checked/.test(h));
ok('latihan soal J1-J4 tercentang pada pertemuan 2', hit(/data-lks-c="p-lat" data-i="1" data-id="J\d" checked/g, h) === 4 && hit(/data-lks-c="p-lat" data-i="1"/g, h) === 10);
ok('pertemuan 2 punya satu kegiatan: tanpa opsi pisahkan kartu', h.indexOf('data-lks-c="p-pisah" data-i="1"') < 0);
await klik('p-open', { i: 3 });
h = form('rencana');
ok('pertemuan 4 (dua kegiatan, dipisah): opsi pisah tercentang dan judul kartu per kegiatan', /data-lks-c="p-pisah" data-i="3" checked/.test(h) && h.indexOf('data-lksp="v2s.pertemuan.3.kartu.per.3"') > -1 && h.indexOf('data-lksp="v2s.pertemuan.3.kartu.per.4"') > -1);

console.log('Ubah pertemuan');
await ketik('v2s.pertemuan.1.judul', 'Kegiatan 1 jangka sorong baru');
await ketik('v2s.pertemuan.1.jp', '5');
await ketik('v2s.pertemuan.1.menit', '225');
let b1 = G("lkeBuild(dg)");
ok('judul, JP, menit pertemuan 2 tersimpan', b1.v2.pertemuan[1].judul === 'Kegiatan 1 jangka sorong baru' && b1.v2.pertemuan[1].jp === 5 && b1.v2.pertemuan[1].menit === 225);
ok('total JP v2 dan alokasi waktu mengikuti pertemuan (21 JP, 945 menit)', b1.v2.jp === 21 && b1.duration === 945);
ok('alokasi waktu di tab Info ikut berubah', G("dg.S.duration") === 945);
ok('pertemuan lain tidak berubah', JSON.stringify(b1.v2.pertemuan.filter((p, i) => i !== 1)) === JSON.stringify(mods[0].v2.pertemuan.filter((p, i) => i !== 1)));
ok('editor ditandai berubah, modul asli tidak termutasi', G("lkeDirty(dg)") === true && G("JSON.stringify(__mods)") === asli);
await ketik('v2s.pertemuan.1.menit', '0');
ok('menit 0 dilaporkan', G("lkeIssues(dg).some(function(x){return x.tab==='rencana'&&/Pertemuan 2: menit harus lebih dari 0/.test(x.msg)})"));
await ketik('v2s.pertemuan.1.menit', '225');
await ketik('v2s.pertemuan.1.judul', '');
ok('judul kosong dilaporkan', G("lkeIssues(dg).some(function(x){return x.tab==='rencana'&&/Pertemuan 2: judul belum diisi/.test(x.msg)})"));
await ketik('v2s.pertemuan.1.judul', 'Kegiatan 1 jangka sorong, latihan soal 1–4');
await ketik('v2s.pertemuan.1.jp', '4');
await ketik('v2s.pertemuan.1.menit', '180');
ok('dikembalikan: 20 JP, 900 menit', G("lkeBuild(dg).v2.jp")===20 && G("lkeBuild(dg).duration")===900);

console.log('Kegiatan, target praktik, langkah');
await pilih('p-keg', { i: 1, k: 1 }, false);
ok('kegiatan 1 dilepas dari pertemuan 2: belum masuk pertemuan mana pun', G("lkeIssues(dg).some(function(x){return /Kegiatan 1 belum masuk pertemuan mana pun/.test(x.msg)})"));
ok('target praktik tanpa kegiatan dilaporkan', G("lkeIssues(dg).some(function(x){return /Pertemuan 2: target praktik diisi tetapi tidak ada kegiatan/.test(x.msg)})"));
await pilih('p-keg', { i: 2, k: 1 }, true);
ok('kegiatan 1 pindah ke pertemuan 3 (bersama kegiatan 2)', JSON.stringify(G("dg.S.v2s.pertemuan[2].kegiatan.map(Number)")) === '[1,2]' && JSON.stringify(G("dg.S.v2s.pertemuan[1].kegiatan")) === '[]');
ok('target praktik 20 tidak sama dengan menit langkah 45', G("lkeIssues(dg).some(function(x){return /Pertemuan 3: target praktik 20 menit tidak sama dengan jumlah menit langkah \\(45\\)/.test(x.msg)})"));
await klik('p-samakan', { i: 2 });
ok('Samakan: target praktik menjadi 45 dan masalah hilang', G("lksN(dg.S.v2s.pertemuan[2].praktik)") === 45 && !G("lkeIssues(dg).some(function(x){return /Pertemuan 3: target/.test(x.msg)})"));
await pilih('p-keg', { i: 1, k: 1 }, true);
ok('dikembalikan: kegiatan 1 di pertemuan 2', JSON.stringify(G("dg.S.v2s.pertemuan[1].kegiatan.map(Number)")) === '[1]' && JSON.stringify(G("dg.S.v2s.pertemuan[2].kegiatan.map(Number)")) === '[2]');
await klik('p-samakan', { i: 1 });
await klik('p-samakan', { i: 2 });
ok('setelah dikembalikan, tidak ada masalah struktur dan target praktik asli', G("lksIssues(dg).length") === 0 && G("lkeBuild(dg).v2.pertemuan[1].praktik") === 25 && G("lkeBuild(dg).v2.pertemuan[2].praktik") === 20);
await ubah('v2s.langkah.0.k', 2, { lkst: 'n' });
ok('langkah 1 pindah ke kegiatan 2: judul langkah ikut berawalan Kegiatan 2', G("dg.S.steps[0].t").startsWith('Kegiatan 2 · ') && G("lkeBuild(dg).steps[0][0]").startsWith('Kegiatan 2 · ') && G("lkeBuild(dg).v2.langkah[0].k") === 2);
ok('menit langkah tidak cocok target praktik dilaporkan (kegiatan 1: 21 vs 25, kegiatan 2: 24 vs 20)', G("lkeIssues(dg).filter(function(x){return /target praktik/.test(x.msg)}).length") === 2);
await ubah('v2s.langkah.0.k', 1, { lkst: 'n' });
ok('dikembalikan ke kegiatan 1', G("lksIssues(dg).length") === 0 && G("lkeBuild(dg).steps[0][0]").startsWith('Kegiatan 1 · '));
await ubah('v2s.langkah.0.saksi', true);
await ketik('v2s.langkah.0.menit', '5');
b1 = G("lkeBuild(dg)");
ok('saksi guru dan menit langkah 1 tersimpan', b1.v2.langkah[0].saksi === true && b1.v2.langkah[0].menit === 5 && b1.v2.langkah[1].menit === 15);
ok('menit langkah 5 membuat target praktik kegiatan 1 tidak cocok (26 vs 25)', G("lkeIssues(dg).some(function(x){return /target praktik 25 menit tidak sama dengan jumlah menit langkah \\(26\\)/.test(x.msg)})"));
await ubah('v2s.langkah.0.saksi', false);
await ketik('v2s.langkah.0.menit', '4');
await ketik('v2s.kegiatan.0', 'Jangka sorong baru');
ok('nama kegiatan tersimpan', G("lkeBuild(dg).v2.kegiatan[0]") === 'Jangka sorong baru');
await ketik('v2s.kegiatan.0', 'Jangka sorong');
await ketik('v2s.kegiatan.2', '');
ok('nama kegiatan kosong dilaporkan', G("lkeIssues(dg).some(function(x){return /Nama kegiatan 3 belum diisi/.test(x.msg)})"));
await ketik('v2s.kegiatan.2', 'Dial gauge');

console.log('Kartu dan latihan');
await pilih('p-pisah', { i: 3 }, false);
let kt = G("lkeBuild(dg).v2.pertemuan[3].kartu");
ok('kartu tidak dipisah: judul kartu tetap, tanpa per', kt.judul === 'Kegiatan 3 dial gauge dan 4 perawatan' && kt.per === undefined);
await pilih('p-pisah', { i: 3 }, true);
kt = G("lkeBuild(dg).v2.pertemuan[3].kartu");
ok('kartu dipisah lagi: judul per kegiatan terisi otomatis', kt.per && /^Kegiatan 3 /.test(kt.per[3]) && /^Kegiatan 4 /.test(kt.per[4]));
await ketik('v2s.pertemuan.3.kartu.per.3', 'Dial gauge saja');
ok('judul kartu per kegiatan bisa diubah', G("lkeBuild(dg).v2.pertemuan[3].kartu.per[3]") === 'Dial gauge saja');
await ketik('v2s.pertemuan.3.kartu.per.3', 'Kegiatan 3 dial gauge');
await ketik('v2s.pertemuan.3.kartu.per.4', 'Kegiatan 4 perawatan');
await pilih('p-lat', { i: 1, id: 'M1' }, true);
ok('latihan M1 ditambahkan ke pertemuan 2', JSON.stringify(G("lkeBuild(dg).v2.pertemuan[1].latihan")) === '["J1","J2","J3","J4","M1"]');
await pilih('p-lat', { i: 1, id: 'M1' }, false);
await pilih('p-sembunyi', { i: 0 }, false);
ok('pertemuan 1 tidak lagi disembunyikan: tersimpan tanpa sembunyi', G("lkeBuild(dg).v2.pertemuan[0].sembunyi") === undefined);
await pilih('p-sembunyi', { i: 1 }, true);
ok('pertemuan berkegiatan disembunyikan dilaporkan', G("lkeIssues(dg).some(function(x){return /Pertemuan 2: disembunyikan dari Lembar Kerja/.test(x.msg)})"));
await pilih('p-sembunyi', { i: 1 }, false);
await pilih('p-sembunyi', { i: 0 }, true);
{ const A = JSON.parse(G("JSON.stringify(lkeBuild(dg).v2)")), B = mods[0].v2; const beda = Object.keys(B).filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
  ok('setelah dikembalikan, simpan identik lagi', beda.length === 0, beda.map((k) => k + ': ' + JSON.stringify(A[k]).slice(0, 300) + ' <> ' + JSON.stringify(B[k]).slice(0, 300)).join(' | ')); }

console.log('Gerbang masuk pindah tab');
h = form('gerbang');
ok('tab Gerbang masuk memuat 5 soal gerbang', hit(/data-lkv-a="gq-open"/g, h) === 5 && h.indexOf('Soal gerbang masuk') > -1);
h = form('soal');
ok('tab Evaluasi tidak lagi memuat soal gerbang', h.indexOf('Soal gerbang masuk') < 0 && h.indexOf('Soal evaluasi') > -1);
ok('tab Evaluasi tetap punya tombol soal isian angka', h.indexOf('data-v="isian"') > -1);
G("dg.S.gate.length=2");
ok('masalah gerbang tercatat di tab Gerbang masuk', G("lkeIssues(dg).some(function(x){return x.tab==='gerbang'&&/minimal 3 soal/.test(x.msg)})"));
buka('LKPD-DDO-ALT-02');

console.log('Alat & K3: kelompok dan paraf guru');
h = form('bahan');
ok('bagian Kelompok K3 tampil: 4 kelompok, 10 butir dengan pilihan kelompok dan paraf', h.indexOf('Kelompok K3 dan paraf guru') > -1 && hit(/data-lks-a="g-up"/g, h) === 4 && hit(/data-lks-c="k3-grup"/g, h) === 10 && hit(/data-lks-c="k3-apd"/g, h) === 10);
ok('4 butir APD bertanda paraf', hit(/data-lks-c="k3-apd" data-i="\d+" checked/g, h) === 4);
ok('butir K3 lama tetap terkunci (tanpa tombol tambah/hapus)', h.indexOf('data-lke-a="add" data-p="safety"') < 0);
await pilih('k3-grup', { i: 4 }, 0);
let kg = G("lkeBuild(dg).v2.k3grup");
ok('butir 5 pindah ke kelompok 1; kelompok 2 kehilangan butir 5; terurut', JSON.stringify(kg[0].i) === '[0,1,2,3,4]' && JSON.stringify(kg[1].i) === '[5,6]');
ok('tidak ada masalah setelah pindah', G("lksIssues(dg).length") === 0);
await klik('g-del', { i: 0 });
ok('kelompok berisi tidak bisa dihapus', G("dg.S.v2s.k3grup.length") === 4 && ctx.__toasts.some((t) => /Pindahkan dulu butir/.test(t)));
await klik('g-add');
ok('kelompok kosong dan tanpa nama dilaporkan', G("lksIssues(dg).some(function(x){return /Kelompok K3 5 kosong/.test(x.msg)})") && G("lksIssues(dg).some(function(x){return /Kelompok K3 5: nama kelompok belum diisi/.test(x.msg)})"));
await ketik('v2s.k3grup.4.judul', 'Lain-lain');
await pilih('k3-grup', { i: 9 }, 4);
kg = G("lkeBuild(dg).v2.k3grup");
ok('kelompok baru berisi butir 10; kelompok 4 berisi butir 9', JSON.stringify(kg[4].i) === '[9]' && JSON.stringify(kg[3].i) === '[8]' && kg[4].judul === 'Lain-lain');
await klik('g-up', { i: 4 });
ok('urutan kelompok bisa dinaikkan', G("lkeBuild(dg).v2.k3grup[3].judul") === 'Lain-lain');
await pilih('k3-grup', { i: 9 }, 4);
await klik('g-del', { i: 3 });
await pilih('k3-grup', { i: 4 }, 1);
ok('dikembalikan ke susunan asli', G("lksIssues(dg).length") === 0 && G("JSON.stringify(lkeBuild(dg).v2.k3grup)") === JSON.stringify(mods[0].v2.k3grup));
await pilih('k3-apd', { i: 4 }, true);
ok('butir 5 diparaf guru: apd bertambah, terurut', JSON.stringify(G("lkeBuild(dg).v2.apd")) === '[0,1,2,3,4]');
await pilih('k3-apd', { i: 0 }, false);
ok('butir 1 dilepas dari paraf', JSON.stringify(G("lkeBuild(dg).v2.apd")) === '[1,2,3,4]');
await pilih('k3-apd', { i: 4 }, false);
await pilih('k3-apd', { i: 0 }, true);
G("dg.S.v2s.k3grup[0].i=[0,1,2]");
ok('butir tanpa kelompok dilaporkan dan menampilkan pilihan "pilih kelompok"', G("lksIssues(dg).some(function(x){return /Butir K3 no. 4 belum masuk kelompok mana pun/.test(x.msg)})") && form('bahan').indexOf('(pilih kelompok)') > -1);
G("dg.S.v2s.k3grup[0].i=[0,1,2,3]");

console.log('Tabel data');
h = form('tabel');
ok('ALT-02 belum punya tabel: pesan dan tombol tambah', /belum memakai tabel data/.test(h) && h.indexOf('data-lks-a="t-add" data-v="ukur3"') > -1 && h.indexOf('data-lks-a="t-add" data-v="selisih"') > -1);
await klik('t-add', { v: 'ukur3' });
ok('tabel ukur 3 kali ditambahkan dan terbuka', G("dg.S.v2s.tabel.length") === 1 && G("dg.S.v2s.tabel[0].id") === 'T1' && form('tabel').indexOf('data-lksp="v2s.tabel.0.judul"') > -1);
let tb = G("lkeBuild(dg).v2.tabel[0]");
ok('tabel baru: kegiatan 1, 2 desimal, nol sekali, kolom rata-rata dari u1..u3', tb.k === 1 && tb.dec === 2 && tb.nolSekali === true && tb.kol.find((c) => c.k === 'rata').dari.join() === 'u1,u2,u3');
ok('tabel baru tanpa masalah', G("lksIssues(dg).length") === 0);
await ketik('v2s.tabel.0.judul', 'T1 · Jangka sorong (mm)');
await ketik('v2s.tabel.0.labelBaris', 'Jenis ukur');
await klik('t-row-add', { i: 0 });
await ketik('v2s.tabel.0.baris.0', 'Diameter luar');
await ketik('v2s.tabel.0.baris.1', 'Diameter dalam');
await ketik('v2s.tabel.0.kol.2.l', 'Ukur 1');
await ketik('v2s.tabel.0.cat', 'Isi apa adanya.');
await ubah('v2s.tabel.0.dec', 3, { lkst: 'n' });
await ubah('v2s.tabel.0.k', 2, { lkst: 'n' });
tb = G("lkeBuild(dg).v2.tabel[0]");
ok('judul, label baris, dua baris, nama kolom, catatan, desimal, kegiatan tersimpan', tb.judul === 'T1 · Jangka sorong (mm)' && tb.labelBaris === 'Jenis ukur' && tb.baris.join() === 'Diameter luar,Diameter dalam' && tb.kol[2].l === 'Ukur 1' && tb.cat === 'Isi apa adanya.' && tb.dec === 3 && tb.k === 2);
await klik('t-row-del', { i: 0 });
ok('hapus baris terakhir', G("lkeBuild(dg).v2.tabel[0].baris.length") === 1);
await klik('t-row-del', { i: 0 });
ok('baris terakhir tidak bisa dihapus', G("dg.S.v2s.tabel[0].baris.length") === 1);
await ketik('v2s.tabel.0.kol.2.l', '');
ok('nama kolom kosong dilaporkan', G("lkeIssues(dg).some(function(x){return x.tab==='tabel'&&/nama kolom ada yang kosong/.test(x.msg)})"));
await ketik('v2s.tabel.0.kol.2.l', '1');
await pilih('cek-auto', { i: 1 }, 'T1|rata');
ok('komponen 2 terisi otomatis dari rata-rata T1', JSON.stringify(G("lkeBuild(dg).v2.cekAuto")) === '{"1":{"t":"T1","f":"rata"}}');
await pilih('cek-auto', { i: 0 }, 'T1|nol');
ok('komponen 1 dari nol alat T1', G("lkeBuild(dg).v2.cekAuto[0].f") === 'nol');
await klik('t-del', { i: 0 });
ok('hapus tabel: tabel dan sumber otomatisnya ikut terhapus, tanpa masalah', G("dg.S.v2s.tabel.length") === 0 && G("Object.keys(dg.S.v2s.cekAuto).length") === 0 && G("lksIssues(dg).length") === 0);
await klik('t-add', { v: 'selisih' });
ok('tabel terbesar dan terkecil: kolom selisih memakai kolom besar dan kecil', G("var tt=lkeBuild(dg).v2.tabel[0];tt.kol.filter(function(c){return c.t==='selisih'})[0].a==='besar'&&tt.id==='T1'"));
await klik('t-del', { i: 0 });
G("dg.S.v2s.tabel=[]");
buka('LKPD-FIX-TABEL');
h = form('tabel');
ok('Modul bertabel: tiga tabel ringkas; satu dibuka menampilkan kolom dan baris', hit(/data-lks-a="t-open"/g, h) === 3);
await klik('t-open', { i: 0 });
h = form('tabel');
ok('F1: 3 baris, 8 kolom, nol sekali tercentang, label baris, catatan', hit(/data-lksp="v2s\.tabel\.0\.baris\.\d"/g, h) === 3 && hit(/data-lksp="v2s\.tabel\.0\.kol\.\d\.l"/g, h) === 8 && /data-lksp="v2s\.tabel\.0\.nolSekali" checked/.test(h) && /value="Jenis ukur"/.test(h));
ok('F1: kolom rata-rata bertanda otomatis', h.indexOf('rata-rata otomatis') > -1);
await klik('t-del', { i: 0 });
ok('hapus F1: sumber otomatis F1 (komponen 1 dan 2) ikut dihapus, F2 dan F3 tetap', G("JSON.stringify(Object.keys(dg.S.v2s.cekAuto))") === '["2","3","5"]' && G("dg.S.v2s.tabel.map(function(t){return t.id}).join()") === 'F2,F3');
buka('LKPD-FIX-TABEL');

console.log('Pemeriksaan');
h = form('cek');
ok('bagian Penempatan komponen: 7 komponen dengan kegiatan dan sumber otomatis', h.indexOf('Penempatan komponen di Lembar Kerja') > -1 && hit(/data-lksp="v2s\.cekK\.\d"/g, h) === 7 && hit(/data-lks-c="cek-auto"/g, h) === 7);
ok('sumber otomatis menawarkan nol, rata-rata, dan keolengan tabel', ['F1 · Jangka sorong (mm) · nol alat', 'F2 · Mikrometer (mm) · Rata-rata', 'F3 · Dial gauge (mm) · Keolengan'].every((x) => h.indexOf(x) > -1));
ok('komponen 2 terpilih F1|rata', /<option value="F1\|rata" selected>/.test(h));
await ubah('v2s.cekK.2', 4, { lkst: 'n' });
ok('kegiatan komponen 3 diubah ke 4', JSON.stringify(G("lkeBuild(dg).v2.cekK")) === '[1,1,4,2,3,3,4]');
await ubah('v2s.cekK.2', 2, { lkst: 'n' });
await pilih('cek-auto', { i: 6 }, '');
ok('sumber kosong untuk komponen tanpa auto tidak menambah entri', G("Object.keys(lkeBuild(dg).v2.cekAuto).join()") === '0,1,2,3,5');
await pilih('cek-auto', { i: 5 }, '');
ok('sumber otomatis dilepas dari komponen 6', G("Object.keys(lkeBuild(dg).v2.cekAuto).join()") === '0,1,2,3');
await pilih('cek-auto', { i: 5 }, 'F3|olengan');
G("dg.S.v2s.tabel=dg.S.v2s.tabel.filter(function(t){return t.id!=='F3'})");
ok('sumber yang tabelnya sudah tidak ada dilaporkan', G("lkeIssues(dg).some(function(x){return x.tab==='cek'&&/Komponen no. 6: sumber otomatis/.test(x.msg)})"));
buka('LKPD-FIX-TABEL');

console.log('Syarat kirim');
buka('LKPD-DDO-ALT-02');
h = form('kirim');
ok('ringkasan tiga syarat tetap: gerbang KKM 75, K3 10 butir 4 kelompok, pemeriksaan', /Gerbang masuk lulus.*minimal 75/.test(h) && /10 butir dalam 4 kelompok/.test(h) && /minimal satu komponen berisi hasil aktual dan status/.test(h));
ok('isian wajib siswa: 5 pengaturan dari LKE.VAL', hit(/data-lke="val\./g, h) === 5);
ok('foto wajib: 7 komponen, 5 tercentang (1, 3, 4, 5, 7)', hit(/data-lks-c="foto"/g, h) === 7 && hit(/data-lks-c="foto" data-i="\d" checked/g, h) === 5 && /5 dari 7 komponen wajib foto/.test(h));
await pilih('foto', { i: 1 }, true);
ok('foto wajib komponen 2 ditambahkan, terurut', JSON.stringify(G("lkeBuild(dg).fotoWajib")) === '[0,1,2,3,4,6]');
await pilih('foto', { i: 0 }, false);
ok('foto wajib komponen 1 dilepas', JSON.stringify(G("lkeBuild(dg).fotoWajib")) === '[1,2,3,4,6]');
await pilih('foto', { i: 1 }, false);
await pilih('foto', { i: 0 }, true);
ok('dikembalikan: fotoWajib asli', JSON.stringify(G("lkeBuild(dg).fotoWajib")) === JSON.stringify(mods[0].fotoWajib));
await pilih('foto', { i: 0 }, false);
await pilih('foto', { i: 1 }, false);
await pilih('foto', { i: 2 }, false);
await pilih('foto', { i: 3 }, false);
await pilih('foto', { i: 4 }, false);
await pilih('foto', { i: 6 }, false);
ok('semua foto wajib dilepas: fotoWajib kosong tersimpan', JSON.stringify(G("lkeBuild(dg).fotoWajib")) === '[]');

console.log('Draf lama tanpa struktur v2');
buka('LKPD-DDO-ALT-02');
G("var s0=dg.S;delete dg.S.v2s;var lama=dg.S;");
ok('salinan kerja dibuat ulang dari modul bila draf lama tidak memilikinya', G("lksV(dg).pertemuan.length") === 5 && G("lkeBuild(dg).v2.pertemuan.length") === 5);

console.log('Keamanan');
STAFF_OFF: {
  ctx.isStaff = () => false;
  buka('LKPD-DDO-ALT-02');
  await klik('p-open', { i: 2 });
  ok('bukan guru/admin: aksi diabaikan', G("dg.pi") === -1);
  ctx.isStaff = () => true;
}
ok('modul asli tidak termutasi sepanjang uji', G("JSON.stringify(__mods)") === asli);
console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
