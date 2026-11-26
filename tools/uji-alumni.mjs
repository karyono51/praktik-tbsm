/* Uji modul Alumni dan Tracer (js/alumni.js): node tools/uji-alumni.mjs
   Mencakup: status turunan dari jawaban tracer, validasi NISN/tahun/duplikat, simpan lokal dan Appwrite (payload),
   filter tampilan, Kepala Sekolah hanya melihat, dasbor, impor/ekspor, appwrite.json dan izin koleksi. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

function boot(opt = {}) {
  const hs = {}, log = { toast: [], create: [], update: [], remove: [], conf: 0 };
  const peran = opt.peran || 'guru';
  const store = {};
  const dbDocs = (opt.docs || []).slice();
  const ctx = {
    console, navigator: { onLine: true }, Math, JSON, Object, Array, Number, String, Date, Promise, parseInt, setTimeout: () => 0,
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    document: { addEventListener(t, f) { (hs[t] = hs[t] || []).push(f); }, getElementById: () => null, querySelector: () => null },
    window: { scrollTo() {}, open() {} },
    ICO: { chev: '' }, NAVTABS: [], NAVPERM: {}, V: { mode: 'list' }, svg: () => '',
    S: { tab: 'alumni', user: { id: 'u1', nama: 'Pak Guru', sekolah: 'MEDINA' } },
    CFG: { DB: 'tbsm' }, Appwrite: { ID: { unique: () => 'id' + (ctx._n = (ctx._n || 0) + 1) } }, _n: 0,
    can: (p) => (peran === 'admin' ? true : p === 'nilai'), actRole: () => peran,
    schKode: () => 'MEDINA', schLintas: () => false, schNama: () => 'SMKS Medina Bandung',
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast: (m) => log.toast.push(m), uid: () => 'loc' + (ctx._n = (ctx._n || 0) + 1),
    ymd: () => '2026-11-26', needX: () => true, render: () => {}, viewKatalog: () => 'katalog',
    uiConfirm: async () => { log.conf++; return true; },
    Cloud: {
      on: !!opt.cloud,
      list: async () => dbDocs.map((d) => ({ ...d })),
      remove: async (c, id) => { log.remove.push(id); return true; },
      db: {
        createDocument: async (db, col, id, doc) => { log.create.push({ col, id, doc }); dbDocs.push({ $id: id, ...doc }); },
        updateDocument: async (db, col, id, doc) => { log.update.push({ col, id, doc }); },
      },
    },
  };
  ctx.window.XLSX = null;
  vm.createContext(ctx);
  vm.runInContext(baca('js/alumni.js') + '\n;this.AL=AL;this.alTurunStatus=alTurunStatus;this.alSimpan=alSimpan;this.alHapus=alHapus;this.alKolom=alKolom;this.alFilter=alFilter;this.alSudah=alSudah;this.alKosong=alKosong;this.viewAlumni=viewAlumni;this.alMuat=alMuat;this.alHp=alHp;this.alNisn=alNisn;this.alTulis=alTulis;this.alKeDoc=alKeDoc;this.alDariDoc=alDariDoc;this.alSimpanSatu=alSimpanSatu;this.alDaftarHtml=alDaftarHtml;this.AL_Q=AL_Q;', ctx, { filename: 'alumni.js' });
  return { ctx, log, hs, store, dbDocs };
}

(async () => {
  console.log('Status turunan');
  const b = boot();
  const x = b.ctx;
  T('bekerja sebagai karyawan -> bekerja', x.alTurunStatus({ kerja: 'Ya', jenisKerja: 'Buruh/karyawan/pegawai' }) === 'bekerja');
  T('berwirausaha -> wirausaha', x.alTurunStatus({ kerja: 'Ya', jenisKerja: 'Berwirausaha sendiri tanpa dibantu orang lain' }) === 'wirausaha');
  T('tidak bekerja, kuliah -> kuliah', x.alTurunStatus({ kerja: 'Tidak', kuliah: 'Ya' }) === 'kuliah');
  T('tidak bekerja, tidak kuliah -> menganggur', x.alTurunStatus({ kerja: 'Tidak', kuliah: 'Tidak' }) === 'menganggur');
  T('belum dijawab -> kosong', x.alTurunStatus({}) === '');
  T('alHp 08 -> 62', x.alHp('0812-345 678') === '62812345678');
  T('alNisn buang non-angka', x.alNisn('00 61-23') === '006123');

  console.log('Menu dan izin');
  T('tab alumni terdaftar di NAVTABS', x.NAVTABS.includes('alumni'));
  T('NAVPERM alumni = nilai', x.NAVPERM.alumni === 'nilai');
  T('guru boleh menulis', x.alTulis() === true);
  const k = boot({ peran: 'kepsek' });
  T('kepsek hanya melihat', k.ctx.alTulis() === false);
  T('viewKatalog dialihkan ke tab alumni', x.viewKatalog() !== 'katalog' && /Alumni dan Tracer/.test(x.viewKatalog()));
  x.S.tab = 'rekap';
  T('tab lain tetap ke tampilan asal', x.viewKatalog() === 'katalog');
  x.S.tab = 'alumni';

  console.log('Simpan lokal');
  await x.alMuat();
  T('muat lokal kosong', x.AL.loaded && x.AL.rows.length === 0);
  x.AL.cur = { ...x.alKosong(), nisn: '123', nama: 'Budi' };
  await x.alSimpan();
  T('NISN pendek ditolak', b.log.toast.pop() === 'NISN harus 10 digit' && x.AL.rows.length === 0);
  x.AL.cur = { ...x.alKosong(), nisn: '0061234567', nama: '', tahun: '' };
  await x.alSimpan();
  T('nama kosong ditolak', b.log.toast.pop() === 'Nama wajib diisi');
  x.AL.cur = { ...x.alKosong(), nisn: '0061234567', nama: 'Budi', tahun: '25' };
  await x.alSimpan();
  T('tahun tidak valid ditolak', b.log.toast.pop() === 'Tahun lulus tidak valid');
  x.AL.cur = { ...x.alKosong(), nisn: '0061234567', nama: 'Budi', tahun: '2025', prodi: 'TSM', dudiLink: 'ftp://x' };
  await x.alSimpan();
  T('tautan atasan harus http(s)', /diawali http/.test(b.log.toast.pop()));
  x.AL.cur = { ...x.alKosong(), nisn: '0061234567', nama: 'Budi', tahun: '2025', prodi: 'TSM', hp: '081234', t: { kuliah: 'Tidak', kerja: 'Ya', jenisKerja: 'Buruh/karyawan/pegawai', sesuai: 'Sesuai', asp1: 4, asp2: 3 } };
  await x.alSimpan();
  T('tersimpan, satu baris', x.AL.rows.length === 1 && x.AL.rows[0].nama === 'Budi');
  T('status otomatis bekerja', x.AL.rows[0].status === 'bekerja');
  T('sekolah terisi MEDINA', x.AL.rows[0].sekolah === 'MEDINA');
  T('tersimpan di localStorage', JSON.parse(b.store['tbsm-alumni']).length === 1);
  T('tracer terisi terdeteksi', x.alSudah(x.AL.rows[0]) === true);
  x.AL.cur = { ...x.alKosong(), nisn: '0061234567', nama: 'Dobel', tahun: '2025' };
  await x.alSimpan();
  T('NISN dobel ditolak', b.log.toast.pop() === 'NISN ini sudah terdaftar' && x.AL.rows.length === 1);
  const id1 = x.AL.rows[0].id;
  x.AL.cur = JSON.parse(JSON.stringify(x.AL.rows[0])); x.AL.cur.nama = 'Budi Santoso';
  await x.alSimpan();
  T('ubah data tidak menggandakan', x.AL.rows.length === 1 && x.AL.rows[0].id === id1 && x.AL.rows[0].nama === 'Budi Santoso');

  console.log('Filter dan tampilan');
  x.AL.rows.push({ id: 'z', nisn: '0061111111', nama: 'Ani', prodi: 'TKR', sekolah: 'MEDINA', tahun: '2024', status: '', t: {} });
  x.AL.rows.push({ id: 'y', nisn: '0062222222', nama: 'Luar', prodi: 'TKJ', sekolah: 'DF', tahun: '2025', status: '', t: {} });
  T('data sekolah lain tidak tampil', x.alKolom().length === 2 && !x.alKolom().some((r) => r.nama === 'Luar'));
  x.AL.q = 'ani'; T('cari nama', x.alFilter(x.alKolom()).length === 1 && x.alFilter(x.alKolom())[0].nama === 'Ani'); x.AL.q = '';
  x.AL.q = '0061234'; T('cari NISN', x.alFilter(x.alKolom()).length === 1); x.AL.q = '';
  x.AL.th = '2024'; T('filter tahun', x.alFilter(x.alKolom()).length === 1); x.AL.th = '';
  x.AL.st = 'belum'; T('filter belum diisi', x.alFilter(x.alKolom()).length === 1 && x.alFilter(x.alKolom())[0].nama === 'Ani'); x.AL.st = '';
  const h = x.alDaftarHtml();
  T('daftar memuat nama dan jumlah', /Budi Santoso/.test(h) && /2 dari 2 alumni/.test(h));
  x.AL.q = '<img src=x onerror=1>'; x.AL.rows.push({ id: 'w', nisn: '0063333333', nama: '<img src=x onerror=1>', sekolah: 'MEDINA', tahun: '', t: {} });
  T('nama berbahaya di-escape', !/<img src=x/.test(x.alDaftarHtml())); x.AL.q = '';
  x.AL.v = 'dash'; x.AL.loaded = true;
  const d = x.viewAlumni();
  T('dasbor memuat ringkasan dan aspek', /Ringkasan/.test(d) && /Rata-rata kualitas/.test(d) && /Belum mengisi tracer/.test(d));
  x.AL.v = 'list';

  console.log('Hapus');
  x.AL.cur = x.AL.rows[0];
  await x.alHapus();
  T('guru tidak boleh menghapus (hanya admin)', b.log.conf === 0 && x.AL.rows.length === 4);
  const a = boot({ peran: 'admin' });
  await a.ctx.alMuat();
  a.ctx.AL.cur = { ...a.ctx.alKosong(), nisn: '0069999999', nama: 'Hapus Saya', tahun: '2025', t: {} };
  await a.ctx.alSimpan();
  a.ctx.AL.cur = { ...a.ctx.AL.rows[0] };
  await a.ctx.alHapus();
  T('admin menghapus setelah konfirmasi', a.log.conf === 1 && a.ctx.AL.rows.length === 0);

  console.log('Mode Appwrite');
  const c = boot({ cloud: true, peran: 'admin' });
  await c.ctx.alMuat();
  c.ctx.AL.cur = { ...c.ctx.alKosong(), nisn: '0068888888', nama: 'Cloud Cika', tahun: '2025', prodi: 'TSM', hp: '0811', email: 'c@x.id', dudiStatus: 'diteruskan', t: { kerja: 'Ya', kuliah: 'Tidak', jenisKerja: 'Buruh/karyawan/pegawai', asp1: 4 } };
  await c.ctx.alSimpan();
  const cr = c.log.create[0];
  T('createDocument ke koleksi alumni', cr && cr.col === 'alumni' && /^id/.test(cr.id));
  T('field atas dan tahun integer', cr.doc.nisn === '0068888888' && cr.doc.tahun === 2025 && cr.doc.sekolah === 'MEDINA' && cr.doc.status === 'bekerja');
  const pl = JSON.parse(cr.doc.payload);
  T('payload memuat kontak, tautan atasan, tracer', pl.hp === '0811' && pl.dudiStatus === 'diteruskan' && pl.t.asp1 === 4);
  T('tidak menulis ke localStorage saat cloud', !c.store['tbsm-alumni']);
  c.ctx.AL.cur = JSON.parse(JSON.stringify(c.ctx.AL.rows[0])); c.ctx.AL.cur.nama = 'Cloud Cika 2';
  await c.ctx.alSimpan();
  T('ubah memakai updateDocument', c.log.update.length === 1 && c.log.update[0].id === cr.id && c.log.create.length === 1);
  const rt = c.ctx.alDariDoc({ $id: 'q', nisn: '1', nama: 'N', tahun: 2025, payload: '{bukan json' });
  T('payload rusak tidak membuat galat', rt.id === 'q' && rt.t && typeof rt.t === 'object');
  const c2 = boot({ cloud: true, docs: [{ $id: 'd1', nisn: '0067777777', nama: 'Dari Server', prodi: 'TSM', sekolah: 'MEDINA', tahun: 2024, status: 'kuliah', ts: 1, oleh: 'x', payload: JSON.stringify({ hp: '08', t: { kuliah: 'Ya', kerja: 'Tidak' } }) }] });
  await c2.ctx.alMuat();
  T('muat dari server memetakan dokumen', c2.ctx.AL.rows.length === 1 && c2.ctx.AL.rows[0].t.kuliah === 'Ya' && c2.ctx.alSudah(c2.ctx.AL.rows[0]));

  console.log('Definisi form');
  const semua = x.AL_Q.flat();
  T('kunci pertanyaan unik', new Set(semua.map((q) => q.k)).size === semua.length);
  T('15 aspek dan 2 dampak ada', [...Array(15).keys()].every((i) => semua.some((q) => q.k === 'asp' + (i + 1))) && semua.some((q) => q.k === 'dmp1') && semua.some((q) => q.k === 'dmp2'));
  T('skala memiliki 4 pilihan', semua.filter((q) => q.t === 'k').every((q) => q.o.length === 4));

  console.log('Berkas');
  const conf = JSON.parse(baca('appwrite.json'));
  const col = (conf.collections || conf.tables).find((z) => z.$id === 'alumni');
  T('appwrite.json memuat koleksi alumni', !!col);
  T('izin: guru dan admin baca/tulis, hapus hanya admin', col.$permissions.includes('read("label:guru")') && col.$permissions.includes('create("label:guru")') && col.$permissions.includes('delete("label:admin")') && !col.$permissions.includes('delete("label:guru")') && !col.$permissions.some((p) => /"users"|"any"/.test(p)));
  T('atribut sesuai pemetaan klien', ['nisn', 'nama', 'prodi', 'sekolah', 'tahun', 'status', 'ts', 'oleh', 'payload'].every((n) => col.attributes.some((a) => a.key === n)));
  const idx = baca('index.html');
  T('index.html memuat alumni.js sebelum menu-dasbor.js', idx.indexOf('js/alumni.js') > 0 && idx.indexOf('js/alumni.js') < idx.indexOf('js/menu-dasbor.js'));
  T('menu-dasbor memuat kelompok alumni', /keys:\['alumni'\]/.test(baca('js/menu-dasbor.js')));
  T('service worker menyimpan alumni.js', /js\/alumni\.js\?v=[0-9a-f]+/.test(baca('service-worker.js')));

  console.log(`\n${pass} lulus, ${fail} gagal`);
  process.exit(fail ? 1 : 0);
})();
