/* Uji ekspor, template, dan impor Excel Tempat PKL (js/pkl-xls.js): node tools/uji-pkl-xls.mjs
   SheetJS tidak dimuat di node, jadi XLSX diganti tiruan kecil (read, sheet_to_json, aoa_to_sheet, writeFile, SSF.parse_date_code).
   Yang diuji: penguraian baris dan pesan galat, pencocokan tempat yang ada, sel kosong tidak menghapus, pratinjau lalu terapkan,
   mode lokal dan Appwrite, peran (Guru/Admin impor, Kepsek hanya ekspor), ekspor lalu impor ulang tanpa perubahan, template, batas, pemuatan skrip. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const USERS = [
  { id: 'g1', nama: 'Pak Guru', peran: 'guru', sekolah: 'MEDINA' },
  { id: 's1', nama: 'Ani', peran: 'siswa', kelas: 'XII', sekolah: 'MEDINA' },
];
const tick = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r)); };
const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;

function boot(opt = {}) {
  const hs = {}, log = { toast: [], create: [], update: [], list: [], render: 0, conf: [], info: [], files: [] }, store = {}, dbDocs = (opt.docs || []).slice();
  const peran = opt.peran || 'guru', me = opt.me || (peran === 'siswa' ? USERS[1] : USERS[0]);
  const el = () => ({ appendChild() {}, remove() {}, addEventListener() {}, setAttribute() {}, style: {} });
  const XLSX = {
    SSF: { parse_date_code: (n) => { const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; } },
    read: (b) => b.__wb,
    utils: {
      book_new: () => ({ SheetNames: [], Sheets: {} }),
      book_append_sheet: (wb, ws, n) => { wb.SheetNames.push(n); wb.Sheets[n] = ws; },
      aoa_to_sheet: (aoa) => ({ aoa }),
      sheet_to_json: (ws) => ws.rows ? ws.rows : ws.aoa.slice(1).map((r) => Object.fromEntries(ws.aoa[0].map((h, i) => [h, r[i] === undefined ? '' : r[i]]))),
    },
    writeFile: (wb, name) => { log.files.push({ wb, name }); },
  };
  const ctx = {
    console, navigator: { onLine: true }, Math, JSON, Object, Array, Number, String, Date, Promise, parseInt, setTimeout: () => 0, Image: function () {}, URL: {},
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    document: { addEventListener(t, f) { (hs[t] = hs[t] || []).push(f); }, getElementById: () => null, querySelector: () => null, createElement: el, head: el(), body: el() },
    window: { addEventListener() {}, XLSX }, ICO: { chev: '', camera: '' }, NAVTABS: [], svg: () => '',
    S: { tab: 'pkl', user: me, users: USERS.slice() }, CFG: { DB: 'tbsm' }, Appwrite: { Query: { equal: (k, v) => 'equal:' + k + ':' + v } },
    hasRole: (u, r) => String(u.peran).split(',').includes(r), actRole: () => peran, isStaff: () => peran !== 'siswa',
    schKode: () => 'MEDINA', schAkunOk: () => true,
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast: (m) => log.toast.push(m), uid: () => 'loc' + (ctx._n = (ctx._n || 0) + 1), _n: 0, ymd: () => '2026-11-26',
    render: () => { log.render++; }, viewKatalog: () => 'katalog',
    uiConfirm: async (m, o) => { log.conf.push([m, o]); return opt.tolak ? false : true; }, uiInfo: async (m) => { log.info.push(m); },
    needX: () => true, XLSX,
    Cloud: { on: !!opt.cloud, remove: async () => true,
      list: async (col, extra) => { log.list.push([col, extra]); return dbDocs.filter((d) => d._col === col).map((d) => ({ ...d })); },
      db: { createDocument: async (db, col, id, doc) => { log.create.push({ col, id, doc }); dbDocs.push({ $id: id, _col: col, ...doc }); },
        updateDocument: async (db, col, id, doc) => { log.update.push({ col, id, doc }); } } },
  };
  ctx.XLSX = XLSX;
  vm.createContext(ctx);
  vm.runInContext(baca('js/pkl.js') + '\n' + baca('js/pkl-xls.js') + '\n;this.PK=PK;this.PKX=PKX;', ctx);
  const klik = (act, d = {}) => hs.click.forEach((f) => f({ target: { closest: () => ({ dataset: { act, ...d } }) } }));
  const ubah = (f) => hs.change.forEach((f2) => f2({ target: { dataset: { pkximp: '' }, files: [f], value: 'x' } }));
  return { ctx, log, hs, store, dbDocs, klik, ubah };
}
const tempat = (o = {}) => ({ id: 't1', nama: 'PT Maju Motor', bidang: 'Bengkel', alamat: 'Jl. Soekarno-Hatta 1', kota: 'Bandung', negeri: 'dalam', telp: '022111', instruktur: 'Pak Dedi', instrTelp: '0812', kuota: 2, jam: '08.00-16.00', pks: '012/PKS', pksSelesai: '2027-12-31', lat: -6.9175, lng: 107.6191, radius: 200, sekolah: 'MEDINA', r: 1, d: 0, ts: 1, ...o });
const berkas = (rows, nama = 'Tempat PKL') => ({ arrayBuffer: async () => ({ __wb: { SheetNames: [nama], Sheets: { [nama]: { rows } } } }) });
const berkasWb = (wb) => ({ arrayBuffer: async () => ({ __wb: wb }) });
async function siap(opt = {}, data = []) {
  const b = boot(opt); b.ctx.PK.D.tempat = data; await b.ctx.pkLoad(); b.log.toast.length = 0; return b;
}

(async () => {
  console.log('Penguraian baris');
  let b = boot(), x = b.ctx;
  T('judul kolom dikenali: huruf besar/kecil, tanda baca, nama lain', (() => { const h = x.pkxParse([{ 'NAMA DUNIA KERJA': 'A', 'kota / kabupaten': 'Bandung', 'telepon/wa': '022', 'Radius (m)': 150, 'Kontak Instruktur': '08', 'no pks sekolah': 'X1' }], []); const p = h.ok[0] && h.ok[0].p; return p && p.nama === 'A' && p.kota === 'Bandung' && p.telp === '022' && p.radius === 150 && p.instrTelp === '08' && p.pks === 'X1'; })());
  T('nama lain: Nama, Perusahaan, Lat, Long diterima', (() => { const p = x.pkxParse([{ Perusahaan: 'B', Lat: '-6,9', Long: '107.6' }], []).ok[0].p; return p.nama === 'B' && p.lat === -6.9 && p.lng === 107.6; })());
  T('kolom informasi dan kolom asing diabaikan', (() => { const h = x.pkxParse([{ Nama: 'C', 'Siswa aktif': 5, 'Status PKS': 'Perjanjian berlaku', Lainnya: 'zzz' }], []); return h.ok.length === 1 && Object.keys(h.ok[0].p).join() === 'nama'; })());
  T('baris kosong dilewati tanpa galat; nomor baris = baris Excel', (() => { const h = x.pkxParse([{ Nama: '' }, { Nama: 'D' }, { Nama: '', Kota: 'X' }], []); return h.ok.length === 1 && h.ok[0].line === 3 && h.err.length === 1 && h.err[0].line === 4 && /Nama dunia kerja kosong/.test(h.err[0].msg); })());
  T('baris (CONTOH) dilewati dan dihitung', (() => { const h = x.pkxParse([{ Nama: '(CONTOH) PT Mitra', Kota: 'B' }], []); return h.ok.length === 0 && h.err.length === 0 && h.contoh === 1; })());
  T('Lokasi: Luar negeri/LUAR → luar, Dalam → dalam, lainnya ditolak', (() => { const h = x.pkxParse([{ Nama: 'a', Lokasi: 'Luar negeri' }, { Nama: 'b', Lokasi: 'LUAR' }, { Nama: 'c', Lokasi: 'dalam negeri' }, { Nama: 'd', Lokasi: 'Mars' }], []); return h.ok.map((o) => o.p.negeri).join() === 'luar,luar,dalam' && /Lokasi harus/.test(h.err[0].msg); })());
  T('Kuota: bilangan bulat 0-1000; 2,5 / -1 / abc ditolak', (() => { const h = x.pkxParse([{ Nama: 'a', Kuota: '3' }, { Nama: 'b', Kuota: 0 }, { Nama: 'c', Kuota: 2.5 }, { Nama: 'd', Kuota: -1 }, { Nama: 'e', Kuota: 'abc' }, { Nama: 'f', Kuota: 5000 }], []); return h.ok.length === 2 && h.ok[0].p.kuota === 3 && h.ok[1].p.kuota === 0 && h.err.length === 4; })());
  T('Lintang/Bujur: koma desimal; di luar rentang ditolak dengan nama kolom', (() => { const h = x.pkxParse([{ Nama: 'a', Lintang: '-6,9175', Bujur: '107,6191' }, { Nama: 'b', Lintang: 91 }, { Nama: 'c', Bujur: 181 }, { Nama: 'd', Lintang: 'abc' }], []); return h.ok[0].p.lat === -6.9175 && h.ok[0].p.lng === 107.6191 && /Lintang/.test(h.err[0].msg) && /Bujur/.test(h.err[1].msg) && h.err.length === 3; })());
  T('Radius: dibulatkan; 0 / negatif ditolak', (() => { const h = x.pkxParse([{ Nama: 'a', 'Radius (m)': 150.4 }, { Nama: 'b', 'Radius (m)': 0 }, { Nama: 'c', 'Radius (m)': -5 }], []); return h.ok[0].p.radius === 150 && h.err.length === 2; })());
  T('tanggal: angka seri Excel, yyyy-mm-dd, dd/mm/yyyy (hari dulu), dd-mm-yy', (() => { const p = x.pkxParse([{ Nama: 'a', 'PKS mulai': serial(2026, 7, 1), 'PKS selesai': '30/06/2027' }, { Nama: 'b', 'PKS mulai': '2026-07-05', 'PKS selesai': '5-8-27' }], []).ok; return p[0].p.pksMulai === '2026-07-01' && p[0].p.pksSelesai === '2027-06-30' && p[1].p.pksMulai === '2026-07-05' && p[1].p.pksSelesai === '2027-08-05'; })());
  T('tanggal tidak sah ditolak: 31/02/2027, teks, angka kecil', (() => { const h = x.pkxParse([{ Nama: 'a', 'PKS mulai': '31/02/2027' }, { Nama: 'b', 'PKS mulai': 'besok' }, { Nama: 'c', 'PKS selesai': 12 }], []); return h.ok.length === 0 && h.err.length === 3 && /PKS mulai/.test(h.err[0].msg); })());
  T('PKS selesai lebih awal dari mulai ditolak', /lebih awal/.test(x.pkxParse([{ Nama: 'a', 'PKS mulai': '2027-01-01', 'PKS selesai': '2026-01-01' }], []).err[0].msg));
  T('duplikat di dalam berkas (nama+kota sama, beda huruf/spasi) ditolak, kota berbeda boleh', (() => { const h = x.pkxParse([{ Nama: 'PT  Abc', Kota: 'Bandung' }, { Nama: 'pt abc', Kota: 'bandung' }, { Nama: 'PT Abc', Kota: 'Cimahi' }], []); return h.ok.length === 2 && h.err.length === 1 && /Duplikat.*baris 2/.test(h.err[0].msg); })());
  T('teks beberapa baris dirapikan: nama satu baris, alamat tetap beberapa baris', (() => { const p = x.pkxParse([{ Nama: ' PT\nAbc  ', Alamat: 'Jl. A\r\nNo. 1 ' }], []).ok[0].p; return p.nama === 'PT Abc' && p.alamat === 'Jl. A\nNo. 1'; })());
  T('angka di kolom teks jadi teks (No. PKS 123)', x.pkxParse([{ Nama: 'a', 'No. PKS sekolah': 123 }], []).ok[0].p.pks === '123');
  T('teks lebih dari 1000 karakter ditolak', x.pkxParse([{ Nama: 'a', Catatan: 'x'.repeat(1001) }], []).err.length === 1);

  console.log('Pencocokan dengan data yang ada');
  const ada = [tempat(), tempat({ id: 't2', nama: 'CV Bintang', kota: '', kuota: 1 }), tempat({ id: 't3', nama: 'PT Kembar', kota: 'Bandung' }), tempat({ id: 't4', nama: 'PT Kembar', kota: 'Cimahi' })];
  let h = x.pkxParse([{ Nama: 'pt maju  motor', Kota: 'BANDUNG', Kuota: 4 }], ada);
  T('nama+kota sama (abaikan huruf/spasi) = perbarui tempat yang ada', h.ok.length === 1 && !h.ok[0].baru && h.ok[0].rec.id === 't1');
  h = x.pkxParse([{ Nama: 'PT Maju Motor', Kota: 'Bandung', Alamat: 'Jl. Soekarno-Hatta 1', Kuota: 2, Lokasi: 'Dalam negeri', 'Radius (m)': 200, Lintang: -6.9175 }], ada);
  T('isi sama dengan data yang ada = tidak berubah (dilewati)', h.ok.length === 0 && h.same === 1);
  h = x.pkxParse([{ Nama: 'PT Maju Motor', Kota: 'Cimahi' }], ada);
  T('nama sama kota beda = tempat baru', h.ok.length === 1 && h.ok[0].baru);
  h = x.pkxParse([{ Nama: 'PT Maju Motor', Kuota: 7 }], ada);
  T('kota kosong di berkas + satu tempat bernama sama = memperbarui tempat itu', h.ok.length === 1 && !h.ok[0].baru && h.ok[0].rec.id === 't1');
  h = x.pkxParse([{ Nama: 'PT Kembar', Kuota: 7 }], ada);
  T('kota kosong tetapi ada dua tempat bernama sama = tempat baru (tidak menebak)', h.ok.length === 1 && h.ok[0].baru);
  h = x.pkxParse([{ Nama: 'CV Bintang', Kota: '', Kuota: 3 }], ada);
  T('tempat lama tanpa kota cocok dengan baris tanpa kota', h.ok.length === 1 && !h.ok[0].baru && h.ok[0].rec.id === 't2');
  const rk = x.pkxRakit(x.pkxParse([{ Nama: 'PT Maju Motor', Kota: 'Bandung', Kuota: 4 }], ada).ok[0]);
  T('sel kosong tidak menghapus: alamat, instruktur, koordinat tetap; kuota berubah', rk.id === 't1' && rk.alamat === 'Jl. Soekarno-Hatta 1' && rk.instruktur === 'Pak Dedi' && rk.lat === -6.9175 && rk.kuota === 4 && rk.r === 1);
  const rb = x.pkxRakit(x.pkxParse([{ Nama: 'PT Baru', Kota: 'Garut' }], []).ok[0]);
  T('tempat baru: id baru, Lokasi dalam negeri, radius 200', /^loc\d+$/.test(rb.id) && rb.negeri === 'dalam' && rb.radius === 200 && rb.kota === 'Garut' && !rb.r);

  console.log('Impor (mode lokal)');
  b = await siap({}, [tempat()]); x = b.ctx;
  await x.pkxImpor(berkas([
    { 'Nama dunia kerja': 'PT Maju Motor', 'Kota/kabupaten': 'Bandung', Kuota: 5, Instruktur: '' },
    { 'Nama dunia kerja': 'CV Baru Jaya', 'Kota/kabupaten': 'Garut', 'Lokasi': 'Luar negeri', Lintang: '-7,2', Bujur: '107,9' },
    { 'Nama dunia kerja': '', 'Kota/kabupaten': 'Cimahi', Alamat: 'tanpa nama' },
  ]));
  T('pratinjau: ringkasan jumlah dan baris yang ditolak, tombol Terapkan 2', b.log.conf.length === 1 && /1 tempat baru, 1 diperbarui, 1 ditolak/.test(b.log.conf[0][0]) && /Baris 4: Nama dunia kerja kosong/.test(b.log.conf[0][0]) && b.log.conf[0][1].ok === 'Terapkan 2', b.log.conf);
  T('hasil: 2 tempat, perbarui kuota 5 tanpa mengubah alamat/instruktur', x.PK.D.tempat.length === 2 && x.pkById('tempat', 't1').kuota === 5 && x.pkById('tempat', 't1').alamat === 'Jl. Soekarno-Hatta 1' && x.pkById('tempat', 't1').instruktur === 'Pak Dedi');
  const nw = x.PK.D.tempat.filter((t) => t.nama === 'CV Baru Jaya')[0];
  T('tempat baru tersimpan: luar negeri, koordinat angka, radius 200, sekolah terisi, r=1', nw && nw.negeri === 'luar' && nw.lat === -7.2 && nw.lng === 107.9 && nw.radius === 200 && nw.sekolah === 'MEDINA' && nw.r === 1 && nw.d === 0);
  T('tersimpan di perangkat (tbsm-pkl) dan toast selesai', JSON.parse(b.store['tbsm-pkl']).tempat.length === 2 && b.log.toast.some((m) => /Impor selesai: 1 baru, 1 diperbarui.*1 ditolak/.test(m)), b.log.toast);
  T('tampilan dibuat ulang setelah impor', b.log.render > 0);
  b.log.conf.length = 0; b.log.toast.length = 0;
  await x.pkxImpor(berkas([{ 'Nama dunia kerja': 'PT Maju Motor', 'Kota/kabupaten': 'Bandung', Kuota: 5 }]));
  T('impor ulang berkas yang sama: tidak ada yang diterapkan, info "sama dengan data yang ada"', b.log.conf.length === 0 && b.log.info.length === 1 && /1 baris sama/.test(b.log.info[0]));

  console.log('Impor dibatalkan');
  b = await siap({ tolak: true }, [tempat()]); x = b.ctx;
  await x.pkxImpor(berkas([{ Nama: 'PT Baru', Kota: 'X' }, { Nama: 'PT Maju Motor', Kota: 'Bandung', Kuota: 9 }]));
  T('Batal pada pratinjau: tidak ada data berubah', x.PK.D.tempat.length === 1 && x.pkById('tempat', 't1').kuota === 2 && b.log.conf.length === 1 && !b.log.toast.some((m) => /Impor selesai/.test(m)));
  T('setelah batal, impor bisa dijalankan lagi (tidak terkunci)', x.PKX.busy === false);

  console.log('Impor (mode Appwrite)');
  b = await siap({ cloud: true, docs: [{ $id: 't1', _col: 'pkl', jenis: 'tempat', sekolah: 'MEDINA', nama: 'PT Maju Motor', ts: 1, sid: '', tanggal: '', payload: JSON.stringify({ nama: 'PT Maju Motor', kota: 'Bandung', kuota: 2, alamat: 'Jl. A' }) }] });
  x = b.ctx; x.PK.D.tempat.forEach(() => {});
  T('muat dari Appwrite: 1 tempat', x.PK.D.tempat.length === 1 && x.PK.D.tempat[0].r === 1);
  await x.pkxImpor(berkas([{ Nama: 'PT Maju Motor', Kota: 'Bandung', Kuota: 6 }, { Nama: 'PT Baru', Kota: 'Garut', 'Jam kerja': '07.00-15.00' }]));
  const cr = b.log.create.filter((c) => c.col === 'pkl'), up = b.log.update.filter((c) => c.col === 'pkl');
  T('tempat baru dibuat di koleksi pkl: jenis tempat, nama, payload lengkap', cr.length === 1 && cr[0].doc.jenis === 'tempat' && cr[0].doc.nama === 'PT Baru' && JSON.parse(cr[0].doc.payload).jam === '07.00-15.00' && cr[0].doc.sekolah === 'MEDINA', cr);
  T('tempat lama diperbarui (bukan dibuat ulang): kuota 6, alamat lama utuh', up.length === 1 && up[0].id === 't1' && JSON.parse(up[0].doc.payload).kuota === 6 && JSON.parse(up[0].doc.payload).alamat === 'Jl. A', up);
  T('payload tidak memuat penanda internal (r, d)', !('r' in JSON.parse(cr[0].doc.payload)) && !('d' in JSON.parse(cr[0].doc.payload)));
  b.log.toast.length = 0; b.ctx.Cloud.db.createDocument = async () => { throw new Error('offline'); };
  await b.ctx.pkxImpor(berkas([{ Nama: 'PT Gagal Kirim' }]));
  T('gagal kirim ke server: tetap tersimpan di perangkat dan dilaporkan', b.ctx.PK.D.tempat.some((t) => t.nama === 'PT Gagal Kirim' && !t.r) && b.log.toast.some((m) => /1 tersimpan di perangkat/.test(m)), b.log.toast);

  console.log('Peran dan tombol');
  b = await siap({}, [tempat()]); x = b.ctx; x.PK.tab = 'tempat';
  let v = x.viewPkl();
  T('guru: tombol Impor Excel (input berkas), Template, Ekspor Excel tampil di tab Tempat PKL', /data-pkximp/.test(v) && /accept="\.xlsx,\.xls,\.csv"/.test(v) && /pkl-tpl-tempat/.test(v) && /pkl-xls-tempat/.test(v) && /Impor Excel/.test(v));
  T('tombol berada di bawah "+ Tempat PKL baru" dan di atas saringan/daftar', v.indexOf('Tempat PKL baru') < v.indexOf('Impor Excel') && v.indexOf('Impor Excel') < v.indexOf('PT Maju Motor'));
  b = await siap({ peran: 'kepsek', me: { id: 'k1', nama: 'Kepsek', peran: 'kepsek', sekolah: 'MEDINA' } }, [tempat()]); x = b.ctx; x.PK.tab = 'tempat'; v = x.viewPkl();
  T('kepsek: hanya Ekspor Excel; tanpa Impor dan Template', /pkl-xls-tempat/.test(v) && !/data-pkximp/.test(v) && !/pkl-tpl-tempat/.test(v));
  await x.pkxImpor(berkas([{ Nama: 'PT Sisipan' }]));
  T('kepsek: impor diblokir walau dipanggil langsung', x.PK.D.tempat.length === 1 && b.log.toast.some((m) => /Hanya Guru atau Admin/.test(m)) && b.log.conf.length === 0);
  b.klik('pkl-tpl-tempat'); T('kepsek: Template diblokir', b.log.files.length === 0);
  b.klik('pkl-xls-tempat'); T('kepsek: ekspor boleh', b.log.files.length === 1);
  b = await siap({ peran: 'siswa' }, [tempat()]); x = b.ctx;
  T('siswa: tampilan tidak memuat tombol impor/ekspor', !/pkl-xls-tempat|data-pkximp|pkl-tpl-tempat/.test(x.viewPkl()));
  await x.pkxImpor(berkas([{ Nama: 'PT Sisipan' }])); T('siswa: impor diblokir', x.PK.D.tempat.length === 1);
  b = await siap({ peran: 'admin', me: { id: 'a1', nama: 'Admin', peran: 'admin', sekolah: 'ALL' } }, []); x = b.ctx; x.PK.tab = 'tempat';
  T('admin: tombol impor tampil juga saat daftar masih kosong', /data-pkximp/.test(x.viewPkl()) && /Belum ada tempat PKL/.test(x.viewPkl()));

  console.log('Peristiwa');
  b = await siap({}, [tempat()]); x = b.ctx;
  b.ubah(berkas([{ Nama: 'PT Lewat Peristiwa', Kota: 'Garut' }])); await tick();
  T('memilih berkas pada input memicu impor sampai tersimpan', x.PK.D.tempat.some((t) => t.nama === 'PT Lewat Peristiwa'));
  b.klik('pkl-xls-tempat'); T('klik Ekspor Excel membuat berkas', b.log.files.length === 1);
  b.klik('pkl-tab', { v: 'tugas' }); T('aksi PKL lain tidak ikut memicu ekspor', b.log.files.length === 1);

  console.log('Ekspor');
  b = await siap({}, [tempat(), tempat({ id: 't2', nama: 'CV Bintang', kota: 'Cimahi', negeri: 'luar', kuota: 1, pks: '', pksSelesai: '', lat: undefined, lng: undefined })]); x = b.ctx;
  x.PK.D.tugas.push({ id: 'g1x', sid: 's1', tempatId: 't1', status: 'aktif', mulai: '2026-11-02', selesai: '2027-05-02', sekolah: 'MEDINA', r: 1, d: 0 });
  x.PK.D.kunjungan.push({ id: 'k1', tempatId: 't1', tanggal: '2026-11-20', sekolah: 'MEDINA', r: 1, d: 0 });
  b.klik('pkl-xls-tempat');
  const f = b.log.files[0], ws = f.wb.Sheets['Tempat PKL'].aoa;
  T('nama berkas: tempat-pkl-<sekolah>-<tanggal>.xlsx', f.name === 'tempat-pkl-medina-2026-11-26.xlsx', f.name);
  T('lembar Tempat PKL dan Petunjuk', f.wb.SheetNames.join() === 'Tempat PKL,Petunjuk' && f.wb.Sheets['Petunjuk'].aoa[0].join() === 'Kolom,Aturan');
  T('judul: 20 kolom data lalu 3 kolom informasi', ws[0].length === 23 && ws[0][0] === 'Nama dunia kerja' && ws[0][19] === 'Catatan' && ws[0].slice(20).join() === 'Siswa aktif,Status PKS,Monitoring terakhir', ws[0]);
  T('baris diurutkan nama: CV Bintang lebih dulu; Lokasi berlabel; koordinat angka', ws[1][0] === 'CV Bintang' && ws[1][4] === 'Luar negeri' && ws[2][0] === 'PT Maju Motor' && ws[2][4] === 'Dalam negeri' && ws[2][16] === -6.9175 && ws[2][17] === 107.6191);
  T('kolom informasi: siswa aktif 1, status PKS, monitoring terakhir', ws[2][20] === 1 && /Perjanjian berlaku/.test(ws[2][21]) && ws[2][22] === '2026-11-20' && ws[1][20] === 0);
  T('tanggal PKS ditulis sebagai teks yyyy-mm-dd (aman dibuka ulang)', ws[2][14] === '2027-12-31' && typeof ws[2][14] === 'string');
  b.log.conf.length = 0; b.log.info.length = 0;
  await x.pkxImpor(berkasWb(f.wb));
  T('berkas hasil ekspor diimpor ulang: tidak ada yang berubah, tidak ada yang ditolak', b.log.conf.length === 0 && b.log.info.length === 1 && /2 baris sama/.test(b.log.info[0]) && !/Baris \d/.test(b.log.info[0]), b.log.info);
  const wb2 = JSON.parse(JSON.stringify(f.wb)); wb2.Sheets['Tempat PKL'].aoa[2][9] = 8; wb2.Sheets['Tempat PKL'].aoa[2][2] = 'Alamat baru';
  await x.pkxImpor(berkasWb(wb2));
  T('ekspor → ubah di Excel → impor: hanya baris yang diubah diperbarui', b.log.conf.length === 1 && /1 diperbarui, 1 tidak berubah/.test(b.log.conf[0][0]) && x.pkById('tempat', 't1').kuota === 8 && x.pkById('tempat', 't1').alamat === 'Alamat baru' && x.pkById('tempat', 't2').kuota === 1);
  b = await siap({}, []); b.klik('pkl-xls-tempat');
  T('daftar kosong: tidak membuat berkas, ada petunjuk', b.log.files.length === 0 && b.log.toast.some((m) => /Belum ada tempat PKL/.test(m)));
  b = await siap({}, [tempat({ sekolah: 'DF' })]); x = b.ctx; x.schAkunOk = (u) => u.sekolah === 'MEDINA'; b.klik('pkl-xls-tempat');
  T('hanya tempat sekolah aktif yang diekspor (tempat sekolah lain tidak ikut)', b.log.files.length === 0);

  console.log('Template');
  b = await siap({}, []); x = b.ctx; b.klik('pkl-tpl-tempat');
  const tf = b.log.files[0], tw = tf.wb.Sheets['Tempat PKL'].aoa;
  T('nama berkas Template_Impor_Tempat_PKL.xlsx, judul sama dengan ekspor, satu baris contoh', tf.name === 'Template_Impor_Tempat_PKL.xlsx' && tw.length === 2 && tw[0].length === 20 && tw[0].join() === x.pkxJudul().join() && /^\(CONTOH\)/.test(tw[1][0]) && tw[1].length === 20);
  T('contoh realistis: tanggal teks, koordinat angka, kuota angka', tw[1][13] === '2026-07-01' && typeof tw[1][16] === 'number' && tw[1][9] === 5);
  T('lembar Petunjuk memuat aturan kolom dan baris (CONTOH)', tf.wb.Sheets['Petunjuk'].aoa.length >= 10 && tf.wb.Sheets['Petunjuk'].aoa.some((r) => /CONTOH/.test(r[0] + r[1])));
  await x.pkxImpor(berkasWb(tf.wb));
  T('template tanpa diisi: baris contoh dilewati, tidak ada data masuk', x.PK.D.tempat.length === 0 && b.log.conf.length === 0 && b.log.info.length === 1 && /contoh/i.test(b.log.info[0]), b.log.info);
  const wt = JSON.parse(JSON.stringify(tf.wb)); wt.Sheets['Tempat PKL'].aoa.push(['PT Diisi Guru', '', '', 'Bandung', 'Dalam negeri', '', '', '', '', 3, '', '', '', '', '', '', '', '', '', '']);
  await x.pkxImpor(berkasWb(wt));
  T('template yang diisi: baris contoh dilewati, baris guru masuk', x.PK.D.tempat.length === 1 && x.PK.D.tempat[0].nama === 'PT Diisi Guru' && x.PK.D.tempat[0].kuota === 3);

  console.log('Batas dan galat berkas');
  b = await siap({}, []); x = b.ctx;
  await x.pkxImpor(berkas([])); T('berkas tanpa baris: pesan memakai Template', b.log.toast.some((m) => /Pakai tombol Template/.test(m)));
  b.log.toast.length = 0; await x.pkxImpor(berkas([{ Alamat: 'x', Kota: 'y' }])); T('tanpa kolom Nama dunia kerja: ditolak dengan pesan jelas', b.log.toast.some((m) => /Kolom "Nama dunia kerja" tidak ditemukan/.test(m)) && x.PK.D.tempat.length === 0);
  b.log.toast.length = 0; await x.pkxImpor(berkas(Array.from({ length: 501 }, (_, i) => ({ Nama: 'T' + i })))); T('lebih dari 500 baris ditolak', b.log.toast.some((m) => /Maksimal 500 baris/.test(m)) && x.PK.D.tempat.length === 0);
  b.log.toast.length = 0; await x.pkxImpor(berkas(Array.from({ length: 500 }, (_, i) => ({ Nama: 'T' + i })))); T('tepat 500 baris diterima', x.PK.D.tempat.length === 500, x.PK.D.tempat.length);
  b = await siap({}, []); x = b.ctx; await x.pkxImpor({ arrayBuffer: async () => { throw new Error('berkas rusak'); } });
  T('berkas tidak terbaca: pesan galat, aplikasi tetap jalan, tidak terkunci', b.log.toast.some((m) => /Gagal membaca berkas: berkas rusak/.test(m)) && x.PKX.busy === false);
  await x.pkxImpor(berkas([{ Nama: 'A', 'PKS mulai': 'x' }, { Nama: 'B', Kuota: 'y' }]));
  T('semua baris salah: info berisi alasan per baris, tanpa pratinjau terapkan', b.log.conf.length === 0 && b.log.info.length === 1 && /Baris 2: Tanggal "PKS mulai"/.test(b.log.info[0]) && /Baris 3: Kuota/.test(b.log.info[0]), b.log.info);
  await x.pkxImpor(berkas(Array.from({ length: 9 }, () => ({ Nama: '', Kota: 'k' }))));
  T('galat banyak: tampil 6 baris pertama lalu "dan N lainnya"', /…dan 3 lainnya/.test(b.log.info[b.log.info.length - 1]));
  const sb = boot(); sb.ctx.PK.loaded = false; await sb.ctx.pkxImpor(berkas([{ Nama: 'A' }]));
  T('data PKL belum selesai dimuat: impor menunggu (agar tidak menggandakan tempat)', sb.log.toast.some((m) => /masih dimuat/.test(m)) && sb.ctx.PK.D.tempat.length === 0);
  sb.ctx.needX = () => false; sb.ctx.PK.loaded = true; await sb.ctx.pkxImpor(berkas([{ Nama: 'A' }]));
  T('pustaka Excel belum siap: tidak melakukan apa-apa', sb.ctx.PK.D.tempat.length === 0 && sb.log.conf.length === 0);

  console.log('Pemasangan');
  const src = baca('js/pkl-xls.js'), idx = baca('index.html'), sw = baca('service-worker.js');
  T('index.html memuat pkl-xls.js tepat setelah pkl.js', idx.indexOf('js/pkl.js') > 0 && idx.indexOf('js/pkl-xls.js') > idx.indexOf('js/pkl.js') && idx.indexOf('js/pkl-xls.js') < idx.indexOf('js/lkpd-drive.js'));
  T('index.html memberi versi (?v=hash) pada pkl-xls.js', /js\/pkl-xls\.js\?v=[0-9a-f]+/.test(idx));
  T('service worker menyimpan pkl-xls.js agar jalan offline', /js\/pkl-xls\.js\?v=[0-9a-f]+/.test(sw));
  const nama = [...src.matchAll(/^(?:async )?function (\w+)|^var (\w+)/gm)].map((m) => m[1] || m[2]);
  const bentrok = [];
  for (const fl of fs.readdirSync(new URL('../js/', import.meta.url), { recursive: true }).filter((n) => n.endsWith('.js') && n !== 'pkl-xls.js')) {
    const t = baca('js/' + fl); nama.forEach((n) => { if (new RegExp('(?:^|[;\\n])\\s*(?:async\\s+)?(?:function|var|let|const)\\s+' + n + '\\b').test(t)) bentrok.push(fl + ':' + n); });
  }
  T('nama global pkl-xls.js (pkx*, PKX*) tidak bentrok dengan berkas lain', nama.length > 20 && bentrok.length === 0, bentrok);
  T('pkl.js hanya memanggil pkxBar bila ada (tetap jalan tanpa pkl-xls.js)', /typeof pkxBar==='function'\?pkxBar\(\):''/.test(baca('js/pkl.js')));
  console.log(`\nUji PKL Excel: ${pass} lulus, ${fail} gagal`); process.exit(fail ? 1 : 0);
})();
