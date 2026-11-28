#!/usr/bin/env node
/* Uji Editor gerbang praktik UKK (js/ukk-gerbang-editor.js): validasi soal, batas 20 soal, penyimpanan ke dokumen unit,
   pewarisan saat unit disimpan dari editor unit, pembacaan oleh gerbang siswa, tanda tangan jawaban, draf, pratinjau, kartu dan halaman Kelola.
   Fungsi penyimpanan unit yang dipakai adalah salinan asli dari js/ukk-kelola.js.   node tools/uji-ukk-gerbang-editor.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let lulus = 0, gagal = 0;
const T = (n, c, x) => { if (c) lulus++; else { gagal++; console.log('GAGAL ' + n + (x ? ' -> ' + x : '')); } };

const lkq = baca('js/lkpd-soal.js');
const penilai = lkq.slice(lkq.indexOf('function lkqType'), lkq.indexOf('function lkqSig'));
const kel = baca('js/ukk-kelola.js');
const kelolaSlice = kel.slice(kel.indexOf('var UKS='), kel.indexOf('/* ---------- Tingkat 1: daftar unit'));

const store = {}, LIS = [], els = {}, timers = [], toasts = [], mulai = [];
let STAFF = true, CONFIRM = true, renders = 0;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mk = () => ({ id: '', className: '', innerHTML: '', textContent: '', scrollTop: 0, style: {}, parentNode: null, setAttribute() {} });
const body = { style: {}, appendChild(el) { el.parentNode = body; els[el.id] = el; }, removeChild(el) { delete els[el.id]; el.parentNode = null; } };
const prog = { textContent: '' }, msg = { textContent: '' };
const base = (id, kelas) => ({ id, kelas, judul: 'Unit ' + id, unit: 'Kendaraan', menit: 30, ukk: true, skkni: '', form: {}, items: [{ id: id + '-0', a: 'R', no: 1, t: 'Butir', std: 'Std', k: true, f: false }] });
const ctx = {
  console, JSON, Math, Date, Object, Array, String, Number, Error, Promise, isFinite, parseInt, isNaN,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  document: { addEventListener(t, f) { LIS.push({ t, f }); }, head: { appendChild() {} }, body, createElement: mk,
    getElementById: (id) => (id === 'uge-msg' ? (els['uge-ov'] ? msg : null) : id === 'ukg-prog' ? prog : (els[id] || null)) },
  setTimeout: (f) => { timers.push(f); return timers.length; }, clearTimeout: (n) => { if (n) timers[n - 1] = null; },
  S: { user: { id: 'g1', username: 'guru1' }, kkm: 75, results: [], lkpdModules: [], kelas: 'XI' },
  V: { job: null }, KELAS: { X: { fase: 'E', judul: 'Kelas X' }, XI: { fase: 'F', judul: 'Kelas XI' }, XII: { fase: 'F', judul: 'Kelas XII' } },
  FORM_UKK: { satuan: 'S', konsentrasi: 'K', kode: '1', tahun: '2026', bentuk: 'b', paket: '1', tempat: 't' },
  JOBS: [base('UKK-X-1', 'X'), base('UKK-XI-1', 'XI'), base('UKK-1', 'XII')], JOBS_ARSIP: [], LKPD_MODULES: [],
  uoNorm: (o) => o || { mode: 'tanpa' }, uoCek: () => '', lkSaveModules() {}, lkRefreshModules() {},
  esc, toast: (m) => toasts.push(m), isStaff: () => STAFF, ukkKunci: () => '', ujiDraftGet: () => null,
  jobById: (id) => ctx.JOBS.filter((j) => j.id === id)[0] || null,
  startExam: (id, keep) => { mulai.push([id, !!keep]); },
  ukkCardAction: () => '<button>Mulai</button>', ukkSimpanRincian() {}, jenisTampil: (r) => r.tipe,
  uiConfirm: () => Promise.resolve(CONFIRM), visibleResults: () => [], render: () => { renders++; },
  ukkHub: () => '<section>kartu unit</section><div class="lks-tabs">tab</div>',
};
ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(penilai, ctx);
vm.runInContext(kelolaSlice, ctx, { filename: 'ukk-kelola(potongan).js' });
vm.runInContext(baca('js/ukk-gerbang.js'), ctx, { filename: 'ukk-gerbang.js' });
vm.runInContext(baca('js/ukk-gerbang-editor.js'), ctx, { filename: 'ukk-gerbang-editor.js' });
const run = (c) => vm.runInContext(c, ctx);
const tick = () => new Promise((r) => setImmediate(r));
const flush = () => { const t = timers.splice(0); t.forEach((f) => f && f()); };

const fire = (tipe, attr, ds, extra) => { const node = Object.assign({ dataset: ds || {} }, extra || {}); LIS.filter((l) => l.t === tipe).forEach((l) => l.f({ target: { dataset: node.dataset, value: node.value, checked: node.checked, closest: (s) => (s === '[' + attr + ']' ? node : null) } })); };
const ge = (a, ds) => { fire('click', 'data-uge', Object.assign({ uge: a }, ds || {})); };
const gk = (a, ds) => { fire('click', 'data-ukg', Object.assign({ ukg: a }, ds || {})); };
const inp = (f, value, k) => { LIS.filter((l) => l.t === 'input').forEach((l) => l.f({ target: { dataset: { ugef: f, k: k === undefined ? undefined : String(k) }, value } })); };
const chg = (f, extra, k) => { LIS.filter((l) => l.t === 'change').forEach((l) => l.f({ target: Object.assign({ dataset: { ugef: f, k: k === undefined ? undefined : String(k) } }, extra) })); };
const ov = () => els['uge-ov'], gov = () => els['ukg-ov'];
const reset = (staff) => {
  Object.keys(store).forEach((k) => delete store[k]); Object.keys(els).forEach((k) => delete els[k]);
  toasts.length = 0; mulai.length = 0; timers.length = 0; STAFF = staff !== false; CONFIRM = true; renders = 0; body.style.overflow = '';
  ctx.S.user = STAFF ? { id: 'g1', username: 'guru1' } : { id: 's1', username: 'siswa1' };
  ctx.S.lkpdModules = []; ctx.S.kkm = 75; run('UKG.ov=null;UKG.ovr=null;UGE.st=null;lkRefreshModules()');
};
const job = (id) => run(`jobById('${id}')`);
const buka = (id) => { ge('buka', { v: id }); };
const pgSah = (t) => ({ t: 'pg', lvl: 'Aplikasi', q: t || 'Soal uji dengan data ukur 12,5 V.', o: ['a1', 'b2', 'c3', 'd4'], a: 1, e: 'Pembahasan.' });
const komSah = () => ({ t: 'kompleks', lvl: 'Penalaran', q: 'Pilih semua yang benar.', o: ['p', 'q', 'r', 's'], a: [0, 2], e: '' });
const katSah = () => ({ t: 'kategori', lvl: 'Penalaran', q: 'Tentukan Benar atau Salah.', rows: [['x', true], ['y', false], ['z', true]], lab: ['Benar', 'Salah'], e: '' });
const daftar = (n) => { const l = []; for (let i = 0; i < n; i++) l.push(i % 5 === 3 ? komSah() : i % 5 === 4 ? katSah() : pgSah('Soal ke-' + (i + 1))); return l; };
const unitSimpan = (id, soal, on) => { const j = job(id); const d = JSON.parse(JSON.stringify(run(`ukkDocOf('${id}')||ukkDocFromJob(jobById('${id}'))`))); d.gerbang = { on: on !== false, soal, v: 1 }; return run('ukkStore')(d); };

/* ===== 1. Validasi soal dan batas 20 ===== */
T('PG sah lolos', run('ugeCek')(pgSah()) === '');
T('PG tanpa kunci ditolak', /kunci/.test(run('ugeCek')(Object.assign(pgSah(), { a: -1 }))));
T('PG pertanyaan kosong ditolak', /pertanyaan/.test(run('ugeCek')(pgSah(' '))));
T('PG pilihan kosong ditolak', /kosong/.test(run('ugeCek')(Object.assign(pgSah(), { o: ['a', '', 'c'] }))));
T('PG dua pilihan sama ditolak (tanpa beda huruf besar)', /sama/.test(run('ugeCek')(Object.assign(pgSah(), { o: ['Ya', 'ya', 'c'] }))));
T('PG 6 pilihan ditolak', /Maksimal 5/.test(run('ugeCek')(Object.assign(pgSah(), { o: ['1', '2', '3', '4', '5', '6'] }))));
T('PG 1 pilihan ditolak', /minimal 2/.test(run('ugeCek')(Object.assign(pgSah(), { o: ['1'] }))));
T('kompleks sah lolos, tanpa kunci ditolak, 2 pilihan ditolak', run('ugeCek')(komSah()) === '' && /kunci/.test(run('ugeCek')(Object.assign(komSah(), { a: [] }))) && /minimal 3/.test(run('ugeCek')(Object.assign(komSah(), { o: ['p', 'q'], a: [0] }))));
T('kategori sah lolos', run('ugeCek')(katSah()) === '');
T('kategori semua Benar ditolak', /Benar dan satu Salah/.test(run('ugeCek')(Object.assign(katSah(), { rows: [['x', true], ['y', true]] }))));
T('kategori 9 pernyataan ditolak', /Maksimal 8/.test(run('ugeCek')(Object.assign(katSah(), { rows: Array.from({ length: 9 }, (_, i) => ['p' + i, i % 2 === 0]) }))));
T('pertanyaan terlalu panjang ditolak', /1000/.test(run('ugeCek')(pgSah('x'.repeat(1001)))));
{ const cs = run('ugeCekSemua');
  T('20 soal sah lolos', cs(true, daftar(20)).err === '');
  T('21 soal ditolak (maks. 20)', /Maksimal 20/.test(cs(true, daftar(21)).err));
  T('gerbang aktif tanpa soal ditolak, mati tanpa soal boleh', /minimal satu soal/.test(cs(true, []).err) && cs(false, []).err === '');
  const l = daftar(6); l[3].q = ''; const r = cs(true, l); T('soal bermasalah ditunjuk nomornya', r.i === 3 && /^Soal 4/.test(r.err)); }
{ const b = run('ugeBersih')({ t: 'kompleks', lvl: 'Salah', q: '  teks ', o: [' a ', 'b', 'c'], a: [2, 0], e: ' ', zzz: 1 });
  T('ugeBersih: pangkas, urut kunci, level tak dikenal jadi Aplikasi, buang kolom asing', b.q === 'teks' && b.a.join() === '0,2' && b.lvl === 'Aplikasi' && b.o[0] === 'a' && b.zzz === undefined && b.e === ''); }
T('ugeCekDoc: null dan tanpa gerbang lolos', run('ugeCekDoc')({}) === '' && run('ugeCekDoc')({ gerbang: null }) === '');
T('ugeCekDoc: 21 soal ditolak, bentuk salah ditolak', /Maksimal 20/.test(run('ugeCekDoc')({ gerbang: { on: true, soal: daftar(21) } })) && /tidak sah/.test(run('ugeCekDoc')({ gerbang: 'x' })));

/* ===== 2. Sumber soal untuk gerbang ===== */
reset();
T('bawaan: UKK-X-1 memakai UKK_GERBANG (5 soal)', run("ukgSoal(jobById('UKK-X-1'))").length === 5);
T('unit tanpa gerbang bawaan: 0 soal', run("ukgSoal(jobById('UKK-1'))").length === 0);
T('ukgBisa: staf kelas X dan XI ya, XII tidak', run("ukgBisa(jobById('UKK-X-1'))") && run("ukgBisa(jobById('UKK-XI-1'))") && !run("ukgBisa(jobById('UKK-1'))"));
{ STAFF = false; T('ukgBisa: siswa tidak', !run("ukgBisa(jobById('UKK-X-1'))")); STAFF = true; }
run("UKG.pv=false"); const sg = (g) => { const j = { id: 'UKK-X-1', gerbang: g }; return run('ukgSoal')(j); };
T('gerbang buatan menggantikan bawaan', sg({ on: true, soal: daftar(3) }).length === 3);
T('gerbang buatan dimatikan: 0 soal (tanpa jatuh ke bawaan)', sg({ on: false, soal: daftar(3) }).length === 0);
T('soal tidak sah dilewati, dibatasi 20', sg({ on: true, soal: [{ q: '' }].concat(daftar(25)) }).length === 20);

/* ===== 3. Membuka editor ===== */
reset(); buka('UKK-XI-1');
T('staf membuka editor: soal bawaan dimuat (5 soal)', !!ov() && ov().innerHTML.indexOf('Kelola prasyarat praktik') > -1 && (ov().innerHTML.match(/class="card uge-it"/g) || []).length === 5 && ov().innerHTML.indexOf('5 dari 20 soal') > -1);
T('kunci gulir halaman dikunci', body.style.overflow === 'hidden');
/* Menu Kelola prasyarat: pratinjau siswa, cetak soal PDF, cetak kunci PDF dalam satu layar */
{ const h = ov().innerHTML;
  T('Kelola prasyarat: menu memuat Pratinjau siswa, Cetak soal (PDF), Cetak kunci jawaban (PDF)', h.indexOf('data-uge="pratinjau"') > -1 && h.indexOf('data-uge="pdf-soal"') > -1 && h.indexOf('data-uge="pdf-kunci"') > -1);
  T('Kelola prasyarat: tidak ada kata gerbang di layar', !/gerbang/i.test(h.replace(/data-[a-z]+="[^"]*"/g, '')));
  const cetak = []; ctx.ukpCetak = (j, soal, mode) => cetak.push([j.id, soal.length, mode]);
  ge('pdf-soal'); ge('pdf-kunci');
  T('klik cetak: soal dan kunci memakai soal editor', cetak.length === 2 && cetak[0][0] === 'UKK-XI-1' && cetak[0][1] === 5 && cetak[0][2] === 'soal' && cetak[1][2] === 'kunci', JSON.stringify(cetak));
  ctx.ukpCetak = undefined; toasts.length = 0; ge('pdf-soal');
  T('cetak tanpa modul PDF: pesan, tanpa galat', toasts.some((m) => /belum dimuat/.test(m)));
  run('UGE.st.soal[0].q=""'); ctx.ukpCetak = (j, soal, mode) => cetak.push([j.id, soal.length, mode]); cetak.length = 0; toasts.length = 0; ge('pdf-kunci');
  T('soal belum lengkap: cetak ditolak dan editor menunjuk soal', cetak.length === 0 && toasts.some((m) => /^Soal 1:/.test(m)), toasts.join('|'));
  ge('daftar'); reset(); buka('UKK-XI-1'); }
T('tombol tambah tersedia di bawah 20', ov().innerHTML.indexOf('data-t="pg"') > -1 && ov().innerHTML.indexOf('data-t="pg" disabled') < 0);
ge('tutup'); T('tutup menghapus editor dan memulihkan gulir', !ov() && body.style.overflow === '');
reset(false); buka('UKK-XI-1'); T('siswa tidak dapat membuka editor', !ov());
reset(); buka('UKK-1'); T('unit kelas XII tidak punya editor gerbang', !ov());

/* ===== 4. Menyusun soal ===== */
reset(); STAFF = true; unitSimpan('UKK-XI-1', [], false); buka('UKK-XI-1');
T('gerbang dimatikan tersimpan: editor kosong, kotak aktif tidak dicentang', ov().innerHTML.indexOf('Belum ada soal') > -1 && ov().innerHTML.indexOf('data-ugef="on" checked') < 0);
chg('on', { checked: true });
ge('tambah', { t: 'pg' });
T('tambah PG membuka layar soal 1 dari 1', ov().innerHTML.indexOf('Soal 1 dari 1') > -1 && ov().innerHTML.indexOf('data-ugef="key"') > -1);
inp('q', 'Batas servis V-belt 17,5 mm; terukur 17,4 mm. Keputusan?'); T('pesan validasi berubah saat mengetik (pilihan masih kosong)', /kosong/.test(msg.textContent), msg.textContent);
[0, 1, 2, 3].forEach((k) => inp('opt', 'Pilihan ' + k, k));
T('belum ada kunci: pesan minta kunci', /kunci/.test(msg.textContent), msg.textContent);
chg('key', { checked: true, value: '2' }, 2); T('kunci dipilih: soal sah', msg.textContent === '');
ge('opt-tambah'); T('pilihan kelima ditambah, lalu tombol tambah nonaktif', ov().innerHTML.indexOf('data-uge="opt-tambah" disabled') > -1 && ov().innerHTML.indexOf('placeholder="Pilihan E"') > -1);
ge('opt-hapus', { k: '0' }); T('hapus pilihan di atas kunci: kunci bergeser (C jadi B)', run('UGE.st.soal[0].a') === 1 && run('UGE.st.soal[0].o.length') === 4);
ge('opt-hapus', { k: '1' }); T('hapus pilihan yang jadi kunci: kunci kosong', run('UGE.st.soal[0].a') === -1);
chg('key', { checked: true, value: '0' }, 0); inp('opt', 'Pilihan X', 2);
inp('e', 'Nilai terkecil dibandingkan dengan batas servis.'); chg('lvl', { value: 'Penalaran' });
T('pembahasan dan level tercatat', run('UGE.st.soal[0].e').indexOf('terkecil') > -1 && run('UGE.st.soal[0].lvl') === 'Penalaran');
ge('daftar'); ge('tambah', { t: 'kompleks' });
chg('keyc', { checked: true, value: '1' }, 1); chg('keyc', { checked: true, value: '3' }, 3); chg('keyc', { checked: false, value: '3' }, 3);
T('kompleks: centang dan lepas kunci', run('UGE.st.soal[1].a').join() === '1');
ge('opt-hapus', { k: '0' }); T('kompleks: hapus pilihan menggeser kunci', run('UGE.st.soal[1].a').join() === '0');
ge('opt-hapus', { k: '0' }); T('kompleks: tidak bisa kurang dari 3 pilihan', run('UGE.st.soal[1].o.length') === 3);
ge('daftar'); ge('tambah', { t: 'kategori' });
T('kategori baru: 3 pernyataan dan tombol hapus aktif', (ov().innerHTML.match(/data-ugef="rowv"/g) || []).length === 3);
ge('row-tambah'); ge('row-tambah'); ge('row-tambah'); ge('row-tambah'); ge('row-tambah'); ge('row-tambah');
T('kategori dibatasi 8 pernyataan', run('UGE.st.soal[2].rows.length') === 8 && ov().innerHTML.indexOf('data-uge="row-tambah" disabled') > -1);
[7, 6, 5, 4, 3, 2].forEach((k) => ge('row-hapus', { k: String(k) })); ge('row-hapus', { k: '1' });
T('kategori minimal 2 pernyataan', run('UGE.st.soal[2].rows.length') === 2);
chg('rowv', { value: '0' }, 0); T('Benar/Salah per pernyataan diubah', run('UGE.st.soal[2].rows[0][1]') === false);
ge('daftar'); T('daftar menandai soal belum lengkap', (ov().innerHTML.match(/Belum lengkap/g) || []).length >= 2);
ge('simpan');
T('simpan ditolak bila ada soal belum lengkap, tidak ada yang tersimpan, editor menunjuk soal', toasts.some((m) => /^Soal 2:/.test(m)) && run("ukkDocOf('UKK-XI-1').gerbang").on === false && ov().innerHTML.indexOf('Soal 2 dari 3') > -1);

/* ===== 5. Urutan, duplikat, hapus ===== */
reset(); buka('UKK-X-1');
const q0 = run('UGE.st.soal[0].q'), q1 = run('UGE.st.soal[1].q');
ge('turun', { i: '0' }); T('turunkan soal 1 menukar urutan', run('UGE.st.soal[0].q') === q1 && run('UGE.st.soal[1].q') === q0);
ge('naik', { i: '1' }); T('naikkan mengembalikan', run('UGE.st.soal[0].q') === q0);
T('soal pertama tidak bisa naik, terakhir tidak bisa turun', ov().innerHTML.indexOf('data-uge="naik" data-i="0" aria-label="Naikkan soal 1" disabled') > -1 && ov().innerHTML.indexOf('aria-label="Turunkan soal 5" disabled') > -1);
ge('dup', { i: '0' }); T('duplikat menyisipkan salinan setelah soal asal', run('UGE.st.soal.length') === 6 && run('UGE.st.soal[1].q') === q0);
CONFIRM = false; ge('hapus', { i: '1' }); await tick(); T('hapus dibatalkan: soal tetap', run('UGE.st.soal.length') === 6);
CONFIRM = true; ge('hapus', { i: '1' }); await tick(); T('hapus disetujui: soal hilang', run('UGE.st.soal.length') === 5);
for (let i = 0; i < 15; i++) ge('tambah', { t: 'pg' });
T('batas 20: 20 soal di editor', run('UGE.st.soal.length') === 20);
toasts.length = 0; ge('tambah', { t: 'pg' }); T('soal ke-21 ditolak dengan pesan', run('UGE.st.soal.length') === 20 && toasts[0] === 'Maksimal 20 soal per unit');
ge('daftar'); T('daftar: semua tombol tambah dan duplikat nonaktif pada 20 soal', ov().innerHTML.indexOf('data-t="pg" disabled') > -1 && ov().innerHTML.indexOf('data-t="kategori" disabled') > -1 && ov().innerHTML.indexOf('data-uge="dup" data-i="0" disabled') > -1 && ov().innerHTML.indexOf('20 dari 20 soal') > -1);
toasts.length = 0; ge('dup', { i: '0' }); T('duplikat pada 20 soal ditolak', run('UGE.st.soal.length') === 20 && toasts[0] === 'Maksimal 20 soal per unit');
ge('simpan'); T('20 soal dengan 15 soal kosong ditolak saat simpan', toasts.some((m) => /^Soal 6:/.test(m)));
CONFIRM = true; ge('kosong'); await tick(); T('Kosongkan semua soal', run('UGE.st.soal.length') === 0);
ge('bawaan'); await tick(); T('Muat soal bawaan: 5 soal dan gerbang aktif', run('UGE.st.soal.length') === 5 && run('UGE.st.on') === true);

/* ===== 6. Menyimpan dan dipakai gerbang siswa ===== */
reset(); buka('UKK-XI-1');
run('UGE.st.soal=' + JSON.stringify(daftar(12))); ge('daftar'); ge('simpan');
T('simpan sukses: toast, render ulang, kembali ke daftar', toasts.some((m) => /tersimpan \(12 soal\)/.test(m)) && renders > 0 && ov().innerHTML.indexOf('Kelola prasyarat praktik') > -1);
{ const d = run("ukkDocOf('UKK-XI-1')");
  T('tersimpan di dokumen unit (ikut sinkronisasi lkpd_modules)', d && d.gerbang && d.gerbang.on === true && d.gerbang.soal.length === 12 && d.jenis === 'ukk'); }
T('job unit membawa gerbang dan ukgSoal memakainya', job('UKK-XI-1').gerbang && run("ukgSoal(jobById('UKK-XI-1'))").length === 12);
T('data unit lain tidak berubah (UKK-X-1 tetap bawaan)', run("ukgSoal(jobById('UKK-X-1'))").length === 5);
ge('tutup');
/* siswa */
reset(false); /* reset memuat ulang dari S.lkpdModules yang dikosongkan: simpan ulang sebagai guru lalu ganti peran */
STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' }; unitSimpan('UKK-XI-1', daftar(12).map((q, i) => Object.assign(q, { q: 'Soal siswa ' + (i + 1) })), true);
STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' };
ctx.window.startExam('UKK-XI-1');
T('siswa dihadang gerbang buatan guru: 12 soal', !!gov() && (gov().innerHTML.match(/class="card ukg-q"/g) || []).length === 12 && mulai.length === 0);
T('siswa tidak melihat kunci/pembahasan', gov().innerHTML.indexOf('Pembahasan.') < 0 && gov().innerHTML.indexOf('kunci:') < 0);
const jawabSemua = (benarSemua) => { const L = run("ukgSoal(jobById('UKK-XI-1'))"); L.forEach((q, i) => { const t = run('lkqType')(q);
  if (t === 'kompleks') (benarSemua ? q.a : [q.a.length ? [0, 1, 2, 3].filter((x) => q.a.indexOf(x) < 0)[0] : 0]).forEach((k) => LIS.filter((l) => l.t === 'change').forEach((l) => l.f({ target: { dataset: { ukgIn: String(i) }, value: String(k), checked: true } })));
  else if (t === 'kategori') q.rows.forEach((r, k) => LIS.filter((l) => l.t === 'change').forEach((l) => l.f({ target: { dataset: { ukgIn: String(i), k: String(k) }, value: (r[1] === benarSemua) ? '1' : '0', checked: true } })));
  else LIS.filter((l) => l.t === 'change').forEach((l) => l.f({ target: { dataset: { ukgIn: String(i) }, value: String(benarSemua ? q.a : (q.a + 1) % q.o.length), checked: true } })); }); };
jawabSemua(true); gk('kirim');
T('12 soal benar semua: nilai 100, lulus', gov().innerHTML.indexOf('Nilai prasyarat 100') > -1 && gov().innerHTML.indexOf('Lulus') > -1);
{ const r = JSON.parse(store['tbsm-ukk-gerbang-v1']).s1['UKK-XI-1']; T('rekaman jawaban membawa tanda tangan soal', /^g12-/.test(r.sig)); }
gk('mulai'); T('lulus: unit dimulai', mulai.length === 1);
T('kartu siswa: Gerbang lulus 100', ctx.ukkCardAction(job('UKK-XI-1')).indexOf('Prasyarat lulus · 100') > -1);
/* guru mengubah KUNCI -> jawaban siswa tidak berlaku lagi */
STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' };
{ const sj = JSON.parse(JSON.stringify(run("ukgSoal(jobById('UKK-XI-1'))"))); sj[0].a = (sj[0].a + 1) % sj[0].o.length; unitSimpan('UKK-XI-1', sj, true); }
STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' }; mulai.length = 0; Object.keys(els).forEach((k) => delete els[k]);
ctx.window.startExam('UKK-XI-1');
T('kunci diubah: gerbang dibuka lagi dan jawaban lama dibuang', mulai.length === 0 && !!gov() && gov().innerHTML.indexOf(' checked') < 0);
gk('tutup');
/* guru hanya mengubah PEMBAHASAN -> jawaban tetap berlaku */
reset(false); STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' }; unitSimpan('UKK-XI-1', daftar(5), true);
STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' }; ctx.window.startExam('UKK-XI-1'); jawabSemua(true); gk('kirim'); gk('tutup');
STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' };
{ const sj = JSON.parse(JSON.stringify(run("ukgSoal(jobById('UKK-XI-1'))"))); sj[0].e = 'Pembahasan baru.'; unitSimpan('UKK-XI-1', sj, true); }
STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' }; mulai.length = 0;
ctx.window.startExam('UKK-XI-1'); T('hanya pembahasan berubah: siswa tetap lulus, langsung ke unit', mulai.length === 1 && !gov());
/* gerbang dimatikan guru */
reset(false); STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' }; unitSimpan('UKK-XI-1', [], false);
STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' }; ctx.window.startExam('UKK-XI-1'); T('gerbang dimatikan: siswa langsung masuk unit', mulai.length === 1 && !gov());
/* rekaman lama (tanpa sig) pada unit bawaan tetap berlaku, pada unit buatan guru dibuang */
reset(false); store['tbsm-ukk-gerbang-v1'] = JSON.stringify({ s1: { 'UKK-X-1': { jwb: { 0: 1, 1: 2, 2: 4, 3: [0, 1, 3], 4: { 0: true, 1: true, 2: false, 3: false, 4: true } }, ts: 1 } } });
T('rekaman lama tanpa tanda tangan: berlaku untuk soal bawaan', run("ukgInfo(jobById('UKK-X-1'))") && run("ukgInfo(jobById('UKK-X-1'))").lulus === true);
STAFF = true; ctx.S.user = { id: 'g1', username: 'guru1' }; unitSimpan('UKK-X-1', daftar(5), true); ctx.S.user = { id: 's1', username: 'siswa1' };
T('rekaman lama tanpa tanda tangan: tidak berlaku bagi soal buatan guru', run("ukgInfo(jobById('UKK-X-1'))") === null);

/* ===== 7. Pewarisan saat unit disimpan dari editor unit ===== */
reset(); STAFF = true; unitSimpan('UKK-XI-1', daftar(4), true);
{ const d = JSON.parse(JSON.stringify(run("ukkDocOf('UKK-XI-1')"))); delete d.gerbang; d.title = 'Judul diubah guru';
  T('simpan unit tanpa kolom gerbang berhasil', run('ukkStore')(d) === '');
  T('gerbang buatan tidak hilang saat unit disimpan dari editor unit', run("ukkDocOf('UKK-XI-1').gerbang.soal.length") === 4 && job('UKK-XI-1').gerbang.soal.length === 4 && job('UKK-XI-1').judul === 'Judul diubah guru');
  const d2 = JSON.parse(JSON.stringify(run("ukkDocOf('UKK-XI-1')"))); d2.gerbang = null; run('ukkStore')(d2);
  T('gerbang:null menghapus gerbang buatan (kembali ke 5 soal bawaan)', !job('UKK-XI-1').gerbang && run("ukgSoal(jobById('UKK-XI-1'))").length === 5);
  const d3 = JSON.parse(JSON.stringify(run("ukkDocOf('UKK-XI-1')"))); d3.gerbang = { on: true, soal: daftar(21), v: 1 };
  T('pintu simpan unit menolak 21 soal', /Maksimal 20/.test(run('ukkStore')(d3))); }

/* ===== 8. Unit buatan sendiri dan hasil duplikat (kelas X/XI) ===== */
reset(); STAFF = true;
{ const dasar = JSON.parse(JSON.stringify(run("ukkDocFromJob(jobById('UKK-XI-1'))"))); dasar.id = 'UKK-BARU1'; dasar.title = 'Unit buatan'; run('ukkStore')(dasar);
  T('unit buatan sendiri kelas XI muncul', !!job('UKK-BARU1') && job('UKK-BARU1').custom);
  T('kartu staf: Editor gerbang tampil walau unit belum bergerbang', ctx.ukkCardAction(job('UKK-BARU1')).indexOf('data-uge="buka"') > -1 && ctx.ukkCardAction(job('UKK-BARU1')).indexOf('data-ukg="pratinjau"') < 0);
  buka('UKK-BARU1'); T('editor unit buatan: kosong, aktif, siap menambah soal', ov().innerHTML.indexOf('0 dari 20 soal') > -1);
  ge('tambah', { t: 'pg' }); run('UGE.st.soal[0]=' + JSON.stringify(pgSah('Soal pertama unit buatan'))); ge('daftar'); ge('simpan');
  T('gerbang unit buatan tersimpan', job('UKK-BARU1').gerbang && job('UKK-BARU1').gerbang.soal.length === 1);
  STAFF = false; ctx.S.user = { id: 's1', username: 'siswa1' }; ctx.window.startExam('UKK-BARU1');
  T('siswa dihadang gerbang unit buatan (1 soal)', !!gov() && (gov().innerHTML.match(/class="card ukg-q"/g) || []).length === 1); }
reset(); T('kartu staf kelas XII: tanpa tombol Editor gerbang', ctx.ukkCardAction(job('UKK-1')).indexOf('data-uge') < 0);
T('kartu staf unit bawaan X: satu tombol Kelola prasyarat, tanpa tombol terpisah', ctx.ukkCardAction(job('UKK-X-1')).indexOf('data-ukg="pratinjau"') < 0 && ctx.ukkCardAction(job('UKK-X-1')).indexOf('Kelola prasyarat') > -1 && ctx.ukkCardAction(job('UKK-X-1')).indexOf('data-uge="buka"') > -1);
reset(false); T('kartu siswa: tanpa tombol editor', ctx.ukkCardAction(job('UKK-X-1')).indexOf('data-uge') < 0);

/* ===== 9. Kembalikan bawaan ===== */
reset(); STAFF = true; unitSimpan('UKK-XI-1', daftar(3), true); buka('UKK-XI-1');
T('gerbang buatan: tombol Kembalikan ke soal bawaan', ov().innerHTML.indexOf('Kembalikan ke soal bawaan') > -1 && ov().innerHTML.indexOf('3 dari 20 soal') > -1);
ge('reset'); await tick();
T('dikembalikan: 5 soal bawaan, job tanpa gerbang buatan', !job('UKK-XI-1').gerbang && run("ukgSoal(jobById('UKK-XI-1'))").length === 5 && run('UGE.st.soal.length') === 5);
T('setelah dikembalikan tombol Kembalikan hilang', ov().innerHTML.indexOf('Kembalikan ke soal bawaan') < 0);

/* ===== 10. Draf di perangkat ===== */
reset(); buka('UKK-X-1'); ge('tambah', { t: 'pg' }); inp('q', 'Draf soal baru'); flush();
T('draf tersimpan otomatis di perangkat', !!store['tbsm-ukk-gerbang-draft'] && JSON.parse(store['tbsm-ukk-gerbang-draft']).soal.length === 6);
ge('tutup'); buka('UKK-X-1');
T('buka lagi: tawaran Pulihkan draf (6 soal)', ov().innerHTML.indexOf('Ada draf yang belum disimpan') > -1 && ov().innerHTML.indexOf('(6 soal)') > -1 && ov().innerHTML.indexOf('5 dari 20 soal') > -1);
ge('pulih'); T('Pulihkan draf: 6 soal kembali', run('UGE.st.soal.length') === 6 && run('UGE.st.soal[5].q') === 'Draf soal baru');
ge('tutup'); buka('UKK-X-1'); ge('buang-draf'); T('Buang draf menghapus draf', !store['tbsm-ukk-gerbang-draft'] && ov().innerHTML.indexOf('Ada draf') < 0);
ge('tutup'); buka('UKK-XI-1'); T('draf unit lain tidak ditawarkan', ov().innerHTML.indexOf('Ada draf') < 0);
ge('tutup'); reset();

/* ===== 11. Pratinjau memakai draf ===== */
buka('UKK-X-1'); ge('tambah', { t: 'pg' }); run('UGE.st.soal[5]=' + JSON.stringify(pgSah('Soal draf yang belum disimpan')));
ge('daftar'); ge('pratinjau');
T('pratinjau memuat draf (6 soal) tanpa menyimpan', !!gov() && (gov().innerHTML.match(/class="card ukg-q"/g) || []).length === 6 && gov().innerHTML.indexOf('Soal draf yang belum disimpan') > -1 && !store['tbsm-ukk-gerbang-v1'] && !run("ukkDocOf('UKK-X-1')"));
T('pratinjau bertanda pratinjau guru', gov().innerHTML.indexOf('pratinjau guru') > -1);
gk('tutup'); T('menutup pratinjau: editor tetap terbuka, gulir tetap terkunci, draf pratinjau dilepas', !!ov() && body.style.overflow === 'hidden' && run('UKG.ovr') === null);
run('UGE.st.soal[5].q=""'); toasts.length = 0; ge('pratinjau'); T('pratinjau soal belum lengkap ditolak dan menunjuk soal', toasts.some((m) => /^Soal 6:/.test(m)) && !gov() && ov().innerHTML.indexOf('Soal 6 dari 6') > -1);
ge('tutup');

/* ===== 12. Halaman Kelola unit ===== */
reset(); run('UKS.id="UKK-XI-1"');
{ const h = ctx.ukkHub(); T('Kelola unit: kartu Gerbang praktik disisipkan sebelum tab', h.indexOf('Prasyarat praktik') > -1 && h.indexOf('Prasyarat praktik') < h.indexOf('lks-tabs') && h.indexOf('data-uge="buka"') > -1 && h.indexOf('Soal bawaan · 5 soal') > -1);
  unitSimpan('UKK-XI-1', daftar(7), true); T('status berubah: Buatan guru · 7 soal', ctx.ukkHub().indexOf('Buatan guru · 7 soal') > -1);
  unitSimpan('UKK-XI-1', [], false); T('status: Dimatikan, tanpa tombol Pratinjau', ctx.ukkHub().indexOf('Dimatikan') > -1 && ctx.ukkHub().indexOf('data-ukg="pratinjau"') < 0);
  run('UKS.id="UKK-1"'); T('unit kelas XII: halaman Kelola tidak berubah', ctx.ukkHub().indexOf('Prasyarat praktik') < 0);
  reset(false); run('UKS.id="UKK-XI-1"'); T('siswa: kartu tidak disisipkan', ctx.ukkHub().indexOf('Prasyarat praktik') < 0); }

/* ===== 13. Berkas rilis ===== */
T('index.html memuat editor setelah ukk-gerbang.js', /ukk-gerbang\.js[^\n]*\n<script src="js\/ukk-gerbang-editor\.js/.test(baca('index.html')));
T('service-worker menyimpan editor di cache', baca('service-worker.js').indexOf('js/ukk-gerbang-editor.js') > -1);

console.log(`${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
