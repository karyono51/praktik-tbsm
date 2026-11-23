/* Uji Tata Kelola Bank Soal (js/bank-tata.js): node tools/uji-tata-bank.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const mk = (o) => ({ aktif: true, tujuan: 'keduanya', topik: 'T', bahas: 'B', kelas: '', ...o });
function boot(opt = {}) {
  const log = { ov: [], put: [], conf: [], toast: [] }, hs = {};
  const bank = opt.bank || [
    mk({ id: 'tka-01', bawaan: 1, tipe: 'pg', mapel: 'Matematika', q: 'bawaan 1', opts: ['a', 'b', 'c', 'd'], kunci: 1 }),
    mk({ id: 'tka-02', bawaan: 1, tipe: 'pg', mapel: 'Matematika', q: 'bawaan 2', opts: ['a', 'b', 'c', 'd'], kunci: 0, aktif: false }),
    mk({ id: 's1', tipe: 'pg', mapel: 'TBSM', q: 'soal lengkap', opts: ['a', 'b', 'c', 'd', 'e'], kunci: 2 }),
    mk({ id: 's2', tipe: 'pg', mapel: 'TBSM', q: 'soal 4 pilihan', opts: ['a', 'b', 'c', 'd'], kunci: 2, bahas: '', topik: '' }),
    mk({ id: 's3', tipe: 'kompleks', mapel: 'TBSM', q: 'tanpa kunci', opts: ['a', 'b', 'c', 'd', 'e'], kunci: [] }),
  ];
  const raw = bank.filter((q) => !q.bawaan).map((q) => ({ ...q }));
  const ctx = {
    console, window: {}, document: { addEventListener(t, f) { hs[t] = f; } },
    S: { user: { id: 'g1', role: 'guru' } }, Cloud: { on: false },
    BS: { flt: { q: '', mapel: '', tipe: '', tuj: '', n: 30 }, D: { soal: raw }, all: null, kcLoaded: true }, BS_IDX: { 'tka-01': 1, 'tka-02': 1 },
    BS_TIPE: { pg: 'PG', kompleks: 'PG kompleks', kategori: 'PG kategori', uraian: 'Uraian' },
    esc: (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    render() { log.render = (log.render || 0) + 1; }, toast(m) { log.toast.push(m); },
    uiConfirm(m, o) { log.conf.push(m); return Promise.resolve(opt.no ? false : true); },
    bsEdit: () => opt.siswa ? false : true, actRole: () => opt.siswa ? 'siswa' : 'guru', bsAman: () => false,
    bsSoalAll: () => bank, bsFiltered() { return bank.filter((q) => !ctx.BS.flt.mapel || q.mapel === ctx.BS.flt.mapel); },
    bsAturanSalah: (q) => (!q || q.bawaan) ? '' : (q.opts || []).length !== 5 ? 'pilihan harus 5 (A sampai E)' : '',
    bsHasKey: (q) => q.tipe === 'pg' ? typeof q.kunci === 'number' : Array.isArray(q.kunci) && q.kunci.length > 0,
    bsPool: () => bank.filter((q) => q.aktif), bsDupGrup: () => [],
    bsOverride(id, p) { log.ov.push([id, p]); const q = bank.find((x) => x.id === id); Object.assign(q, p); return Promise.resolve(true); },
    bsPut(k, o) { log.put.push([k, o.id, { ...o }]); const q = bank.find((x) => x.id === o.id); if (q) Object.assign(q, o); return Promise.resolve(true); },
    bsViewBank() { return '<div class="stats"></div><div class="card"><label class="f">Cari<input></label></div>'; },
  };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(new URL('../js/bank-tata.js', import.meta.url), 'utf8'), ctx);
  const klik = async (a, v) => { await hs.click({ target: { closest: () => ({ dataset: { bs: a, v }, tagName: 'BUTTON', disabled: false }) } }); };
  return { ctx, log, klik, bank, raw };
}
/* masalah per soal */
let { ctx, log, klik, bank, raw } = boot();
T('soal bawaan tidak punya masalah', ctx.bttMasalah(bank[0]).length === 0);
T('soal lengkap tidak punya masalah', ctx.bttMasalah(bank[2]).length === 0);
T('4 pilihan: belum sesuai aturan, tanpa pembahasan, tanpa topik', ctx.bttMasalah(bank[3]).length === 3, ctx.bttMasalah(bank[3]));
T('kunci kosong terdeteksi', ctx.bttMasalah(bank[4]).some((x) => /kunci/.test(x)));
const r = ctx.bttRingkas(bank);
T('ringkasan: 5 soal, 4 aktif, 1 nonaktif', r.total === 5 && r.aktif === 4 && r.off === 1, r);
T('ringkasan: 2 soal perlu perhatian, yang mendesak dulu', r.butuh.length === 2 && r.butuh[0].q.id === 's2' || r.butuh[0].q.id === 's3', r.butuh.map((x) => x.q.id));
/* tampilan */
let h = ctx.bttHtml();
T('panel tertutup: hanya tombol', /Tata Kelola Bank Soal/.test(h) && !/Aktifkan semua/.test(h));
ctx.BTT.open = true; h = ctx.bttHtml();
T('panel terbuka: aksi massal dan daftar perhatian', /Aktifkan semua/.test(h) && /Nonaktifkan semua/.test(h) && /Peruntukan: Ujian/.test(h) && /Soal perlu perhatian \(2\)/.test(h));
T('tombol Ubah per soal perlu perhatian', /data-bs="ubah" data-q="s2"/.test(h));
T('tanpa filter: menyebut seluruh bank', /seluruh bank \(5 soal\)/.test(h));
ctx.BS.flt.mapel = 'TBSM'; h = ctx.bttHtml();
T('dengan filter: menyebut sesuai filter', /3 soal sesuai filter/.test(h));
ctx.BS.flt.mapel = '';
T('bsViewBank disisipi sebelum kartu filter', ctx.bsViewBank().indexOf('Tata Kelola Bank Soal') < ctx.bsViewBank().indexOf('label class="f">Cari'));
/* siswa */
({ ctx } = boot({ siswa: true })); ctx.BTT.open = true;
T('siswa tidak melihat panel', ctx.bttHtml() === '');
/* aksi: nonaktifkan semua dengan filter TBSM */
({ ctx, log, klik, bank, raw } = boot());
ctx.BS.flt.mapel = 'TBSM';
await klik('btt-aktif', '0');
T('konfirmasi menyebut 3 soal sesuai filter', /3 soal sesuai filter/.test(log.conf[0] || ''), log.conf);
T('3 soal buatan lewat bsPut, tidak ada override', log.put.length === 3 && log.ov.length === 0);
T('semua soal TBSM nonaktif, bawaan tak tersentuh', bank.filter((q) => q.mapel === 'TBSM').every((q) => !q.aktif) && bank[0].aktif === true);
T('toast jumlah', /3 soal diperbarui/.test(log.toast[0] || ''), log.toast);
T('busy kembali false', ctx.BTT.busy === false);
/* aksi: aktifkan semua tanpa filter: melewati yang sudah aktif, bawaan lewat bsOverride */
({ ctx, log, klik, bank, raw } = boot());
await klik('btt-aktif', '1');
T('hanya soal nonaktif diubah (tka-02) lewat bsOverride', log.ov.length === 1 && log.ov[0][0] === 'tka-02' && log.put.length === 0, log);
T('konfirmasi menyebut seluruh bank, 1 soal', /1 soal \(seluruh bank\)/.test(log.conf[0]), log.conf);
/* aksi: peruntukan ujian: soal belum sesuai aturan diberi catatan */
({ ctx, log, klik, bank, raw } = boot());
await klik('btt-tuj', 'ujian');
T('peruntukan ujian: semua soal berubah', bank.every((q) => q.tujuan === 'ujian'));
T('catatan soal belum sesuai aturan tetap latihan', /1 soal belum sesuai aturan tetap hanya dipakai untuk latihan/.test(log.conf[0]), log.conf);
/* batal */
({ ctx, log, klik, bank } = boot({ no: true }));
await klik('btt-tuj', 'latihan');
T('batal konfirmasi: tidak ada penulisan', log.put.length === 0 && log.ov.length === 0 && ctx.BTT.busy === false);
/* tidak ada yang perlu diubah */
({ ctx, log, klik, bank } = boot());
await klik('btt-tuj', 'keduanya');
T('sudah sama semua: tidak meminta konfirmasi', log.conf.length === 0 && /Tidak ada soal yang perlu diubah/.test(log.toast[0] || ''), log);
/* nilai tujuan tidak dikenal diabaikan */
await klik('btt-tuj', 'sembarang');
T('peruntukan tidak dikenal diabaikan', log.conf.length === 0 && log.put.length === 0);
/* siswa: aksi ditolak */
({ ctx, log, klik } = boot({ siswa: true }));
await klik('btt-aktif', '0');
T('siswa: aksi massal tidak berjalan', log.conf.length === 0 && log.put.length === 0);
console.log('\n' + pass + ' lulus, ' + fail + ' gagal'); process.exit(fail ? 1 : 0);
