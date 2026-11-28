/* Uji ekspor/impor Excel dan cetak PDF di semua tab PKL (js/pkl-io.js, js/pkl-pdf.js): node tools/uji-pkl-io.mjs
   SheetJS dan jsPDF diganti tiruan kecil (XLSX.read/utils/writeFile, jsPDF.text/autoTable/save) karena tidak dimuat di node.
   Diuji: tombol per tab dan peran, isi ekspor mengikuti saringan, template, impor Penempatan/Monitoring/Nilai/Kelengkapan
   (pencocokan siswa/tempat/guru, kuota, satu penempatan aktif, pindah tempat, sel kosong, pratinjau, Appwrite), PDF per tab, pemasangan skrip. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const USERS = [
  { id: 'g1', nama: 'Pak Guru', peran: 'guru', sekolah: 'MEDINA' }, { id: 'g2', nama: 'Bu Sari', peran: 'guru', sekolah: 'MEDINA' },
  { id: 's1', nama: 'Ani', peran: 'siswa', kelas: 'XII', username: '26030390', sekolah: 'MEDINA' },
  { id: 's2', nama: 'Budi', peran: 'siswa', kelas: 'XII', username: '26030391', sekolah: 'MEDINA' },
  { id: 's3', nama: 'Cici', peran: 'siswa', kelas: 'XI', username: '26030392', sekolah: 'MEDINA' },
  { id: 's4', nama: 'Dedi', peran: 'siswa', kelas: 'XII', username: '26030393', sekolah: 'MEDINA' },
  { id: 's5', nama: 'Dedi', peran: 'siswa', kelas: 'XII', username: '26030394', sekolah: 'MEDINA' },
  { id: 's6', nama: 'Eka', peran: 'siswa', kelas: 'XII', username: '26030395', sekolah: 'MEDINA' },
];
const TGL = '2026-11-26';
const serial = (y, m, d) => (Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000;
function boot(opt = {}) {
  const hs = {}, log = { toast: [], create: [], update: [], render: 0, conf: [], info: [], files: [] }, store = {}, dbDocs = (opt.docs || []).slice(), pdf = [];
  const peran = opt.peran || 'guru', me = opt.me || (peran === 'siswa' ? USERS[2] : USERS[0]);
  const el = () => ({ appendChild() {}, remove() {}, addEventListener() {}, setAttribute() {}, style: {} });
  const XLSX = {
    SSF: { parse_date_code: (n) => { const d = new Date(Date.UTC(1899, 11, 30) + n * 86400000); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; } },
    read: (b) => b.__wb,
    utils: { book_new: () => ({ SheetNames: [], Sheets: {} }), book_append_sheet: (wb, ws, n) => { wb.SheetNames.push(n); wb.Sheets[n] = ws; }, aoa_to_sheet: (aoa) => ({ aoa }),
      sheet_to_json: (ws) => ws.rows ? ws.rows : ws.aoa.slice(1).map((r) => Object.fromEntries(ws.aoa[0].map((h, i) => [h, r[i] === undefined ? '' : r[i]]))) },
    writeFile: (wb, name) => { log.files.push({ wb, name }); },
  };
  function JsPDF(o) {
    const d = { opt: o, texts: [], tables: [], pages: 1, saved: null, lastAutoTable: { finalY: 100 },
      internal: { pageSize: { getWidth: () => (o && o.orientation === 'landscape' ? 297 : 210), getHeight: () => (o && o.orientation === 'landscape' ? 210 : 297) } } };
    ['setFont', 'setFontSize', 'setTextColor', 'setDrawColor', 'line', 'addImage', 'setPage'].forEach((m) => { d[m] = () => d; });
    d.text = (t) => { d.texts.push(String(t)); return d; }; d.addPage = () => { d.pages++; return d; }; d.getNumberOfPages = () => d.pages;
    d.autoTable = (op) => { d.tables.push(op); }; d.save = (n) => { d.saved = n; }; pdf.push(d); return d;
  }
  const ctx = {
    console, navigator: { onLine: true }, Math, JSON, Object, Array, Number, String, Date, Promise, parseInt, setTimeout: () => 0, Image: function () {}, URL: {},
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    document: { addEventListener(t, f) { (hs[t] = hs[t] || []).push(f); }, getElementById: () => null, querySelector: () => null, createElement: el, head: el(), body: el() },
    window: { addEventListener() {}, XLSX, jspdf: { jsPDF: JsPDF } }, ICO: { chev: '', camera: '' }, NAVTABS: [], svg: () => '',
    S: { tab: 'pkl', user: me, users: USERS.concat(opt.users || []) }, CFG: { DB: 'tbsm' }, Appwrite: { Query: { equal: (k, v) => 'equal:' + k + ':' + v } },
    hasRole: (u, r) => String(u.peran).split(',').includes(r), actRole: () => peran, isStaff: () => peran !== 'siswa',
    schKode: () => 'MEDINA', schAkunOk: () => true, schEf: () => ({ nama: 'SMKS Medina', alamat: 'Bandung', program: 'TSM' }),
    akNis: (u) => { const n = String((u && (u.username || String(u.email || '').split('@')[0])) || '').trim(); if (/^\d{8}$/.test(n)) return n.slice(0, 4) + '.' + n.slice(4); return /^[\d.]+$/.test(n) ? n : ''; },
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast: (m) => log.toast.push(m), uid: () => 'loc' + (ctx._n = (ctx._n || 0) + 1), _n: 0, ymd: () => TGL, render: () => { log.render++; }, viewKatalog: () => 'katalog',
    uiConfirm: async (m, o) => { log.conf.push([m, o]); return !opt.tolak; }, uiInfo: async (m) => { log.info.push(m); }, needX: () => true, needP: () => true, XLSX,
    Cloud: { on: !!opt.cloud, remove: async () => true, list: async (col) => dbDocs.filter((d) => d._col === col).map((d) => ({ ...d })),
      db: { createDocument: async (db, col, id, doc) => { log.create.push({ col, id, doc }); dbDocs.push({ $id: id, _col: col, ...doc }); }, updateDocument: async (db, col, id, doc) => { log.update.push({ col, id, doc }); } } },
  };
  vm.createContext(ctx);
  vm.runInContext(['komponen', 'pkl', 'pkl-xls', 'pkl-io', 'pkl-pdf'].map((n) => baca('js/' + n + '.js')).join('\n') + '\n;this.PK=PK;this.PKO=PKO;this.PKX=PKX;', ctx);
  const klik = (act, d = {}) => hs.click.forEach((f) => f({ target: { closest: () => ({ dataset: { act, ...d } }) } }));
  const ubah = (tab, f) => hs.change.forEach((f2) => f2({ target: { dataset: { pkoimp: tab }, files: [f], value: 'x' } }));
  return { ctx, log, hs, store, dbDocs, pdf, klik, ubah };
}
const base = (o) => ({ sekolah: 'MEDINA', r: 1, d: 0, ts: 1, ...o });
const DATA = () => ({
  tempat: [base({ id: 't1', nama: 'PT Maju Motor', kota: 'Bandung', kuota: 2, instruktur: 'Pak Dedi', alamat: 'Jl. A', pksSelesai: '2027-12-31' }), base({ id: 't2', nama: 'CV Bintang – Jaya', kota: 'Cimahi', kuota: 1, instruktur: 'Bu Eni' }), base({ id: 't3', nama: 'PT Baru Jaya', kota: 'Garut', kuota: 3, instruktur: 'Pak Rudi' })],
  tugas: [base({ id: 'g1x', sid: 's1', tempatId: 't1', guruId: 'g1', guruNama: 'Pak Guru', instruktur: 'Pak Dedi', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }), base({ id: 'g2x', sid: 's2', tempatId: 't2', guruId: 'g2', guruNama: 'Bu Sari', instruktur: 'Bu Eni', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' })],
  absen: [base({ id: 'a1', sid: 's1', tanggal: TGL, tipe: 'masuk', jam: '07:05', lokasi: 'ya', tempatId: 't1' }), base({ id: 'a2', sid: 's1', tanggal: TGL, tipe: 'pulang', jam: '16:00', lokasi: 'ya', tempatId: 't1' }), base({ id: 'a3', sid: 's2', tanggal: TGL, tipe: 'izin', jam: '06:50', cat: 'Acara keluarga', tempatId: 't2' })],
  jurnal: [base({ id: 'j1', sid: 's1', tanggal: '2026-11-25', unit: 'Bengkel', uraian: 'Servis berkala', tempatId: 't1', verif: 'belum' }), base({ id: 'j2', sid: 's1', tanggal: '2026-11-26', unit: 'Bengkel', uraian: 'Ganti oli', cat: 'Bagus', verif: 'instruktur', tempatId: 't1' }), base({ id: 'j3', sid: 's2', tanggal: '2026-11-26', unit: 'Las', uraian: 'Las sambungan', tempatId: 't2' })],
  kunjungan: [base({ id: 'k1', tanggal: '2026-11-20', tempatId: 't1', guruId: 'g1', guruNama: 'Pak Guru', mode: 'luring', temuan: 'Baik', tindak: 'Tambah variasi' })],
  nilai: [base({ id: 'n1', sid: 's1', nama: 'Ani', kelas: 'XII', tempatId: 't1', tp1: 80, tp2: 90, tp3: '', tp4: '', catGuru: 'Rajin' })],
  cek: [base({ id: 'cek_s1', sid: 's1', nama: 'Ani', items: { pembekalan: true } })],
});
async function siap(opt = {}, mod) {
  const b = boot(opt), d = DATA(); if (mod) mod(d);
  Object.keys(d).forEach((k) => { b.ctx.PK.D[k] = d[k]; }); await b.ctx.pkLoad(); b.log.toast.length = 0; return b;
}
const berkas = (rows, nama) => ({ arrayBuffer: async () => ({ __wb: { SheetNames: [nama || 'Sheet1'], Sheets: { [nama || 'Sheet1']: { rows } } } }) });
const berkasWb = (wb) => ({ arrayBuffer: async () => ({ __wb: wb }) });
const sheet = (f, n) => f.wb.Sheets[n].aoa;
const tick = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setImmediate(r)); };
const pasang = (b, tab, rows, nm) => b.ctx.pkoImpor(tab, berkas(rows, nm));

(async () => {
  console.log('Tombol per tab dan peran');
  let b = await siap(), x = b.ctx;
  const tampil = (tab) => { x.PK.tab = tab; return x.viewPkl(); };
  const tombol = (v, tab) => ({ imp: new RegExp('data-pkoimp="' + tab + '"').test(v), tpl: new RegExp('pkl-tpl-tab" data-v="' + tab + '"').test(v), xls: new RegExp('pkl-xls-tab" data-v="' + tab + '"').test(v), pdf: new RegExp('pkl-pdf-tab" data-v="' + tab + '"').test(v) });
  const jj = (o) => JSON.stringify(o);
  const semua = { imp: true, tpl: true, xls: true, pdf: true };
  T('Penempatan: impor, template, ekspor, PDF', jj(tombol(tampil('tugas'), 'tugas')) === jj(semua));
  T('Monitoring, Nilai, Kelengkapan: impor, template, ekspor, PDF', ['kunjungan', 'nilai', 'cek'].every((t) => jj(tombol(tampil(t), t)) === jj(semua)));
  T('Absensi dan Jurnal: hanya ekspor dan PDF (tanpa impor/template)', ['absen', 'jurnal'].every((t) => jj(tombol(tampil(t), t)) === jj({ imp: false, tpl: false, xls: true, pdf: true })));
  T('Rekap: Excel tabel ini + PDF, tombol Unduh Excel lama tetap ada', (() => { const v = tampil('rekap'); return jj(tombol(v, 'rekap')) === jj({ imp: false, tpl: false, xls: true, pdf: true }) && /Excel tabel ini/.test(v) && /data-act="pkl-xls"/.test(v); })());
  T('Tempat PKL: impor/template/ekspor lama + tombol PDF', (() => { const v = tampil('tempat'); return /data-pkximp/.test(v) && /pkl-xls-tempat/.test(v) && jj(tombol(v, 'tempat')) === jj({ imp: false, tpl: false, xls: false, pdf: true }); })());
  T('tombol berada setelah tombol tambah dan sebelum daftar', (() => { const v = tampil('tugas'); return v.indexOf('Penempatan baru') < v.indexOf('Impor Excel') && v.indexOf('Impor Excel') < v.indexOf('Budi'); })());
  T('catatan Jurnal menyebut Excel/PDF memuat semua yang tampil', /Excel dan PDF memuat semua/.test(tampil('jurnal')));
  b = await siap({ peran: 'kepsek', me: { id: 'k1', nama: 'Kepsek', peran: 'kepsek', sekolah: 'MEDINA' } }); x = b.ctx;
  T('kepsek: hanya ekspor dan PDF di semua tab', ['tugas', 'absen', 'jurnal', 'kunjungan', 'nilai', 'cek', 'rekap'].every((t) => { x.PK.tab = t; const o = tombol(x.viewPkl(), t); return !o.imp && !o.tpl && o.xls && o.pdf; }));
  b.klik('pkl-tpl-tab', { v: 'tugas' }); T('kepsek: template diblokir', b.log.files.length === 0);
  await pasang(b, 'tugas', [{ 'Nama siswa': 'Eka', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02' }]);
  T('kepsek: impor diblokir walau dipanggil langsung', x.PK.D.tugas.length === 2 && b.log.toast.some((m) => /Hanya Guru atau Admin/.test(m)));
  b.klik('pkl-xls-tab', { v: 'tugas' }); b.klik('pkl-pdf-tab', { v: 'tugas' });
  T('kepsek: ekspor dan cetak boleh', b.log.files.length === 1 && b.pdf.length === 1);
  b = await siap({ peran: 'siswa' }); x = b.ctx; await pasang(b, 'tugas', [{ Nama: 'Eka' }]); b.klik('pkl-pdf-tab', { v: 'tugas' });
  T('siswa: tidak bisa impor maupun cetak daftar', x.PK.D.tugas.length === 2 && b.pdf.length === 0);
  T('siswa: tampilan tidak memuat tombol baru', !/pkl-xls-tab|pkl-pdf-tab|data-pkoimp/.test(x.viewPkl()));
  b = await siap(); b.klik('pkl-xls-tab', { v: 'ngawur' }); b.klik('pkl-pdf-tab', { v: 'ngawur' }); T('tab tidak dikenal diabaikan', b.log.files.length === 0 && b.pdf.length === 0);

  console.log('Ekspor Excel per tab');
  b = await siap(); x = b.ctx; b.klik('pkl-xls-tab', { v: 'tugas' });
  let f = b.log.files[0], w = sheet(f, 'Penempatan');
  T('Penempatan: nama berkas, judul, urut tempat', f.name === 'penempatan-pkl-medina-2026-11-26.xlsx' && w[0].join() === 'Nama siswa,NIS/Username,Kelas,Tempat PKL,Kota tempat,Guru pembimbing,Instruktur,Mulai,Selesai,Status' && w.length === 3 && w[1][3] === 'CV Bintang – Jaya', [f.name, w[0]]);
  T('Penempatan: isi baris Ani (NIS berformat, kota, guru, tanggal teks, status)', w[2].join() === 'Ani,2603.0390,XII,PT Maju Motor,Bandung,Pak Guru,Pak Dedi,2026-11-02,2027-05-02,Aktif', w[2]);
  x.PK.flt.tugas = { tempat: 't1' }; b.klik('pkl-xls-tab', { v: 'tugas' }); T('Penempatan: ekspor mengikuti saringan tempat', sheet(b.log.files[1], 'Penempatan').length === 2);
  b = await siap(); x = b.ctx; b.klik('pkl-xls-tab', { v: 'absen' }); f = b.log.files[0];
  const ab = sheet(f, 'Absensi ' + TGL), ra = sheet(f, 'Catatan absen');
  T('Absensi: berkas bernama dengan tanggal, dua lembar', f.name === 'absensi-pkl-medina-2026-11-26.xlsx' && f.wb.SheetNames.join() === 'Absensi 2026-11-26,Catatan absen');
  T('Absensi: Ani Hadir (masuk, pulang, di lokasi); Budi Izin dengan keterangan', ab.length === 3 && ab[2][1] === 'Ani' && ab[2].slice(4, 8).join() === '07:05,16:00,Hadir,Di lokasi' && ab[1][6] === 'Izin' && ab[1][8] === 'Acara keluarga', ab);
  T('Absensi: lembar Catatan absen memuat semua catatan hari itu', ra.length === 4 && ra.some((r) => r[4] === 'Pulang'), ra);
  x.PK.ft = '2026-11-20'; b.klik('pkl-xls-tab', { v: 'absen' });
  T('Absensi: tanggal lain = semua Belum absen, nama berkas ikut tanggal', b.log.files[1].name.endsWith('2026-11-20.xlsx') && sheet(b.log.files[1], 'Absensi 2026-11-20').slice(1).every((r) => r[6] === 'Belum absen'));
  b = await siap({}, (d) => { d.jurnal = Array.from({ length: 70 }, (_, i) => base({ id: 'jj' + i, sid: 's1', tanggal: '2026-10-' + String(1 + (i % 28)).padStart(2, '0'), uraian: 'u' + i, tempatId: 't1' })); }); x = b.ctx; b.klik('pkl-xls-tab', { v: 'jurnal' });
  T('Jurnal: semua 70 baris diekspor (layar hanya 60)', sheet(b.log.files[0], 'Jurnal').length === 71);
  b = await siap(); x = b.ctx; b.klik('pkl-xls-tab', { v: 'jurnal' }); w = sheet(b.log.files[0], 'Jurnal');
  T('Jurnal: kolom, urut tanggal, label verifikasi', w[0].join() === 'Tanggal,Siswa,Kelas,Tempat PKL,Unit kerja,Uraian kegiatan,Catatan,Diketahui oleh,Diberi catatan oleh' && w[1][0] === '2026-11-25' && w[2][7] === 'Instruktur', w);
  b.klik('pkl-xls-tab', { v: 'kunjungan' }); w = sheet(b.log.files[1], 'Monitoring');
  T('Monitoring: Kunjungan langsung, kota, guru, temuan', w[1].join() === '2026-11-20,PT Maju Motor,Bandung,Pak Guru,Kunjungan langsung,Baik,Tambah variasi', w[1]);
  b.klik('pkl-xls-tab', { v: 'nilai' }); w = sheet(b.log.files[2], 'Nilai');
  T('Nilai: TP1-TP4, nilai akhir 85, predikat Baik, catatan', w[0].slice(4, 8).every((h, i) => h.startsWith('TP' + (i + 1))) && w[1].slice(4).join() === '80,90,,,85,Baik,Rajin,', w[1]);
  b.klik('pkl-xls-tab', { v: 'cek' }); w = sheet(b.log.files[3], 'Kelengkapan');
  T('Kelengkapan: 11 tahapan Ya/Belum dan jumlah', w[0].length === 16 && w[0][4] === 'Pembekalan' && w[1][4] === 'Ya' && w[1][5] === 'Belum' && w[1][15] === '1/11' && w.length === 3, w[1]);
  b.klik('pkl-xls-tab', { v: 'rekap' }); w = sheet(b.log.files[4], 'Rekap');
  T('Rekap: hadir/izin/sakit/jurnal/kelengkapan/nilai', w[0].length === 12 && w[1][0] === 'Ani' && w[1][3] === 1 && w[1][8] === 2 && w[1][9] === '1/11' && w[1][10] === 85, w[1]);
  x.PK.flt.rekap = { tempat: 't2' }; b.klik('pkl-xls-tab', { v: 'rekap' }); T('Rekap: mengikuti saringan', sheet(b.log.files[5], 'Rekap').length === 2 && sheet(b.log.files[5], 'Rekap')[1][0] === 'Budi');
  b = await siap({}, (d) => { d.tugas = []; d.absen = []; d.jurnal = []; d.kunjungan = []; d.nilai = []; d.cek = []; }); x = b.ctx;
  ['tugas', 'jurnal', 'kunjungan', 'nilai', 'cek', 'rekap', 'absen'].forEach((t) => b.klik('pkl-xls-tab', { v: t }));
  T('data kosong: tidak ada berkas, ada pesan', b.log.files.length === 0 && b.log.toast.length === 7, b.log.toast);

  console.log('Template');
  b = await siap({}, (d) => { d.cek.push(base({ id: 'cek_s2', sid: 's2', items: { pembekalan: true, pks: true } })); }); x = b.ctx; b.klik('pkl-tpl-tab', { v: 'tugas' }); f = b.log.files[0];
  T('Template Penempatan: lembar utama, 3 rujukan, petunjuk', f.name === 'Template_Impor_Penempatan_PKL.xlsx' && f.wb.SheetNames.join() === 'Penempatan,Rujukan Siswa,Rujukan Tempat,Rujukan Guru,Petunjuk');
  w = sheet(f, 'Rujukan Siswa');
  T('Rujukan Siswa: hanya peserta (XII/sudah ditempatkan), status penempatan, NIS', w.slice(1).map((r) => r[0]).join() === 'Ani,Budi,Dedi,Dedi,Eka' && w[1][1] === '2603.0390' && w[1][3] === 'Aktif di PT Maju Motor' && w[5][3] === 'Belum ditempatkan', w);
  T('Rujukan Tempat: kuota, terisi, sisa', sheet(f, 'Rujukan Tempat')[1].join() === 'CV Bintang – Jaya,Cimahi,1,1,0' && sheet(f, 'Rujukan Tempat')[3].join() === 'PT Maju Motor,Bandung,2,1,1' && sheet(f, 'Rujukan Guru').length === 3);
  T('Template: contoh bertanda (CONTOH) dan petunjuk berisi aturan pindah tempat', /^\(CONTOH\)/.test(sheet(f, 'Penempatan')[1][0]) && sheet(f, 'Petunjuk').some((r) => /Memindahkan siswa/.test(r[1])));
  await b.ctx.pkoImpor('tugas', berkasWb(f.wb)); T('Template Penempatan kosong: tidak ada data masuk', x.PK.D.tugas.length === 2 && b.log.conf.length === 0 && /contoh/i.test(b.log.info[0] || ''), b.log.info);
  b.klik('pkl-tpl-tab', { v: 'kunjungan' }); f = b.log.files[1];
  T('Template Monitoring: contoh + Rujukan Tempat/Guru', f.name === 'Template_Impor_Monitoring_PKL.xlsx' && f.wb.SheetNames.join() === 'Monitoring,Rujukan Tempat,Rujukan Guru,Petunjuk' && /^\(CONTOH\)/.test(sheet(f, 'Monitoring')[1][1]));
  b.klik('pkl-tpl-tab', { v: 'nilai' }); f = b.log.files[2]; w = sheet(f, 'Nilai');
  T('Template Nilai: berisi siswa ditempatkan lengkap dengan nilai saat ini', f.name === 'Template_Impor_Nilai_PKL.xlsx' && w.slice(1).map((r) => r[0]).join() === 'Budi,Ani' && w[2].slice(4, 6).join() === '80,90' && w[1].slice(4, 6).join() === ',', w);
  await b.ctx.pkoImpor('nilai', berkasWb(f.wb)); T('Template Nilai tanpa perubahan: tidak ada yang diterapkan', b.log.conf.length === 0 && /sama dengan data/.test(b.log.info[b.log.info.length - 1] || ''), b.log.info);
  b.klik('pkl-tpl-tab', { v: 'cek' }); f = b.log.files[3]; w = sheet(f, 'Kelengkapan');
  T('Template Kelengkapan: kondisi saat ini per siswa, round-trip tanpa perubahan', w.length === 3 && w.some((r) => r[0] === 'Budi' && r[4] === 'Ya' && r[5] === 'Ya'));
  await b.ctx.pkoImpor('cek', berkasWb(f.wb)); T('round-trip Kelengkapan: tidak berubah', b.log.conf.length === 0 && /sama dengan data/.test(b.log.info[b.log.info.length - 1] || ''), b.log.info);
  T('tab tanpa template (absen, jurnal) tidak punya spesifikasi impor', b.ctx.pkoSpec('absen') === null && b.ctx.pkoSpec('jurnal') === null && b.ctx.PK_CEK.length === b.ctx.PKO_PENDEK.length);

  console.log('Impor Penempatan');
  b = await siap(); x = b.ctx;
  await pasang(b, 'tugas', [
    { 'Nama siswa': 'Eka', 'NIS/Username': 26030395, 'Tempat PKL': 'PT Maju Motor', 'Kota tempat': 'Bandung', 'Guru pembimbing': 'bu  sari', Mulai: serial(2026, 11, 2), Selesai: '02/05/2027' },
    { 'NIS/Username': '2603.0393', 'Tempat PKL': 'PT Maju Motor', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'Nama siswa': 'Dedi', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'Nama siswa': 'Cici', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'Nama siswa': 'Zzz', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'Tempat Hantu', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'PT Baru Jaya', 'Guru pembimbing': 'Pak Hantu', Mulai: '2026-11-02', Selesai: '2027-05-02' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'PT Baru Jaya', Mulai: 'besok', Selesai: '2027-05-02' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2027-06-01', Selesai: '2027-05-02' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02', Status: 'ngawur' },
    { 'NIS/Username': '26030394', 'Tempat PKL': 'PT Baru Jaya' },
    { 'Nama siswa': '(CONTOH) Ahmad', 'Tempat PKL': 'PT Baru Jaya' },
  ], 'Penempatan');
  let m = (b.log.conf[0] || [''])[0];
  T('pratinjau: 1 baru, 10 ditolak, alasan per baris', /1 penempatan baru, 10 ditolak/.test(m) && /Baris 3: .*Kuota PT Maju Motor \(2\) sudah penuh/.test(m) && /Baris 4: Ada 2 siswa bernama "Dedi"/.test(m) && /Baris 5: Cici bukan peserta PKL/.test(m) && /Baris 6: Siswa tidak ditemukan: Zzz/.test(m) && /dan 4 lainnya/.test(m), m);
  T('tombol pratinjau: Terapkan 1', b.log.conf[0][1].ok === 'Terapkan 1');
  const nt = x.PK.D.tugas.filter((t) => t.sid === 's6')[0];
  T('tersimpan: Eka di PT Maju Motor, guru Bu Sari, tanggal serial dan dd/mm/yyyy terbaca, status aktif, sekolah terisi', x.PK.D.tugas.length === 3 && nt && nt.tempatId === 't1' && nt.guruId === 'g2' && nt.guruNama === 'Bu Sari' && nt.mulai === '2026-11-02' && nt.selesai === '2027-05-02' && nt.status === 'aktif' && nt.sekolah === 'MEDINA' && nt.instruktur === 'Pak Dedi' && !('nama' in nt) && !('kelas' in nt), nt);
  b = await siap(); x = b.ctx; b.log.conf.length = 0;
  await pasang(b, 'tugas', [{ 'Nama siswa': 'Ani', 'Tempat PKL': 'PT Maju Motor', 'Guru pembimbing': 'Bu Sari', Selesai: '2027-06-30' }]);
  const up = x.pkById('tugas', 'g1x');
  T('perbarui penempatan yang ada (siswa+tempat sama): guru dan selesai berubah, mulai/instruktur tetap', /1 diperbarui/.test(b.log.conf[0][0]) && up.guruNama === 'Bu Sari' && up.selesai === '2027-06-30' && up.mulai === '2026-11-02' && up.instruktur === 'Pak Dedi' && x.PK.D.tugas.length === 2, up);
  b.log.conf.length = 0; b.log.info.length = 0;
  await pasang(b, 'tugas', [{ 'Nama siswa': 'Ani', 'Tempat PKL': 'PT Maju Motor', 'Guru pembimbing': 'Bu Sari', Selesai: '2027-06-30', Status: 'Aktif' }]);
  T('impor ulang sama: tidak berubah', b.log.conf.length === 0 && /1 baris sama/.test(b.log.info[0]));
  b = await siap(); x = b.ctx;
  await pasang(b, 'tugas', [
    { 'Nama siswa': 'Ani', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-12-01', Selesai: '2027-06-01', Status: 'Aktif' },
    { 'Nama siswa': 'Ani', 'Tempat PKL': 'PT Maju Motor', Status: 'Selesai' },
    { 'Nama siswa': 'Budi', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-12-01', Selesai: '2027-06-01' }]);
  T('pindah tempat dalam satu berkas: baris Selesai diproses lebih dulu; Budi (masih aktif di tempat lain) ditolak', /1 penempatan baru, 1 diperbarui, 1 ditolak/.test(b.log.conf[0][0]) && /Baris 4: Budi sudah punya penempatan aktif di CV Bintang – Jaya/.test(b.log.conf[0][0]), b.log.conf[0][0]);
  T('hasil pindah: lama Selesai, baru Aktif di PT Baru Jaya', x.pkById('tugas', 'g1x').status === 'selesai' && x.PK.D.tugas.some((t) => t.sid === 's1' && t.tempatId === 't3' && t.status === 'aktif'));
  b = await siap({ tolak: true }); x = b.ctx; await pasang(b, 'tugas', [{ 'Nama siswa': 'Eka', 'Tempat PKL': 'PT Baru Jaya', Mulai: '2026-11-02', Selesai: '2027-05-02' }]);
  T('Batal pada pratinjau: tidak ada perubahan, tidak terkunci', x.PK.D.tugas.length === 2 && x.PKO.busy === false);
  b = await siap({ cloud: true, docs: [{ $id: 'g1x', _col: 'pkl', jenis: 'tugas', sekolah: 'MEDINA', ts: 1, sid: 's1', nama: 'Ani', tanggal: '', payload: JSON.stringify({ sid: 's1', tempatId: 't1', guruId: 'g1', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }) },
   { $id: 't1', _col: 'pkl', jenis: 'tempat', sekolah: 'MEDINA', ts: 1, sid: '', nama: 'PT Maju Motor', tanggal: '', payload: JSON.stringify({ nama: 'PT Maju Motor', kota: 'Bandung', kuota: 5 }) }] }); x = b.ctx;
  await pasang(b, 'tugas', [{ 'Nama siswa': 'Ani', 'Tempat PKL': 'PT Maju Motor', Selesai: '2027-07-01' }, { 'Nama siswa': 'Eka', 'Tempat PKL': 'PT Maju Motor', Mulai: '2026-11-02', Selesai: '2027-05-02' }]);
  const cr = b.log.create.filter((c) => c.col === 'pkl'), uu = b.log.update.filter((c) => c.col === 'pkl');
  T('Appwrite: penempatan baru dibuat (jenis tugas, sid siswa), yang ada diperbarui', cr.length === 1 && cr[0].doc.jenis === 'tugas' && cr[0].doc.sid === 's6' && uu.length === 1 && uu[0].id === 'g1x' && JSON.parse(uu[0].doc.payload).selesai === '2027-07-01', [cr, uu]);

  console.log('Impor Monitoring');
  b = await siap(); x = b.ctx;
  await pasang(b, 'kunjungan', [
    { Tanggal: '2026-11-20', 'Tempat PKL': 'PT Maju Motor', Cara: 'Daring', Temuan: '' },
    { Tanggal: serial(2026, 11, 25), 'Tempat PKL': 'CV Bintang – Jaya', 'Kota tempat': 'Cimahi', Cara: 'Kunjungan langsung', Temuan: 'Aman', 'Tindak lanjut': 'Pantau bulan depan' },
    { Tanggal: '25/11/2026', 'Tempat PKL': 'CV Bintang – Jaya' },
    { Tanggal: '', 'Tempat PKL': 'PT Baru Jaya' }, { Tanggal: '2026-11-21', 'Tempat PKL': 'Hantu' }, { Tanggal: '2026-11-21', 'Tempat PKL': 'PT Baru Jaya', Cara: 'Telepati' }, { Tanggal: 'xx', 'Tempat PKL': 'PT Baru Jaya' },
    { Tanggal: '2026-11-22', 'Tempat PKL': '(CONTOH) PT Mitra' }], 'Monitoring');
  m = b.log.conf[0][0];
  T('pratinjau: 1 baru, 1 diperbarui, 5 ditolak (duplikat, tanggal kosong, tempat hantu, cara salah, tanggal tak terbaca)', /1 monitoring baru, 1 diperbarui, 5 ditolak/.test(m) && /Duplikat di dalam berkas/.test(m) && /Baris 5: Tanggal kosong/.test(m) && /Cara harus/.test(m), m);
  const k1 = x.pkById('kunjungan', 'k1'), k2 = x.PK.D.kunjungan.filter((k) => k.tanggal === '2026-11-25')[0];
  T('perbarui: cara jadi daring, temuan/tindak lama tetap (sel kosong tidak menghapus)', k1.mode === 'daring' && k1.temuan === 'Baik' && k1.tindak === 'Tambah variasi', k1);
  T('baru: guru default = pembimbing siswa aktif di tempat itu, cara langsung, sekolah terisi', k2 && k2.tempatId === 't2' && k2.guruId === 'g2' && k2.guruNama === 'Bu Sari' && k2.mode === 'luring' && k2.temuan === 'Aman' && k2.tindak === 'Pantau bulan depan' && k2.sekolah === 'MEDINA', k2);

  console.log('Impor Nilai');
  b = await siap(); x = b.ctx;
  await pasang(b, 'nilai', [
    { 'Nama siswa': 'Ani', 'Tempat PKL': 'info', 'TP3 Kompetensi teknis': '88,5', 'Nilai akhir': 999, 'Catatan instruktur': 'Terampil' },
    { 'NIS/Username': 26030395, 'TP1 Soft skills': 70, 'TP2 Norma, POS, dan K3LH': 75, 'Catatan guru': 'Perlu latihan' },
    { 'Nama siswa': 'Budi' }, { 'Nama siswa': 'Cici', TP1: 80 }, { 'Nama siswa': 'Dedi', TP1: 80 }, { 'Nama siswa': 'Ani', TP1: 80 },
    { 'NIS/Username': '26030393', TP1: 101 }, { 'NIS/Username': '26030393', TP2: 'abc' }, { 'NIS/Username': '26030394', TP4: 60 }, { 'Nama siswa': '(CONTOH) Z', TP1: 1 }], 'Nilai');
  m = b.log.conf[0][0];
  T('pratinjau: 2 baru (Eka dan Dedi kedua), 1 diperbarui, 5 ditolak', /2 nilai baru, 1 diperbarui, 5 ditolak/.test(m), m);
  T('pesan menyebut jumlah baris tanpa isian dilewati dan alasan galat', /1 baris tanpa isian dilewati/.test(m) && /bukan peserta PKL/.test(m) && /Ada 2 siswa bernama "Dedi"/.test(m) && /Duplikat di dalam berkas/.test(m) && /TP1 harus angka 0 sampai 100: 101/.test(m) && /TP2 harus angka/.test(m), m);
  const na = x.pkById('nilai', 'n1'), ne = x.PK.D.nilai.filter((n) => n.sid === 's6')[0];
  T('Ani diperbarui: TP3 88,5 (koma desimal), TP1/TP2 lama tetap, catatan instruktur ditambah, catatan guru lama tetap', na.tp1 === 80 && na.tp2 === 90 && na.tp3 === 88.5 && na.catInstr === 'Terampil' && na.catGuru === 'Rajin', na);
  T('Eka baru: TP1/TP2, nama/kelas dari akun, TP kosong tetap kosong; tanpa tempat karena belum ditempatkan', ne && ne.tp1 === 70 && ne.tp2 === 75 && ne.tp3 === '' && ne.nama === 'Eka' && ne.kelas === 'XII' && ne.catGuru === 'Perlu latihan' && ne.sekolah === 'MEDINA' && x.pkNilaiAkhir(ne) === 72.5, ne);

  console.log('Impor Kelengkapan');
  b = await siap(); x = b.ctx;
  await pasang(b, 'cek', [
    { 'Nama siswa': 'Ani', 'Naskah PKS': 'Ya', 'Jaminan K3': 'V', Pembekalan: '' },
    { 'NIS/Username': '26030391', Pembekalan: 1, 'Asesmen instruktur': 'sudah' },
    { 'NIS/Username': '26030395', Pembekalan: 'Ya' }, { 'Nama siswa': 'Cici', Pembekalan: 'Ya' }, { 'Nama siswa': 'Ani', Pembekalan: 'Belum' }, { 'Nama siswa': 'Budi', Pembekalan: 'mungkin' }, { 'Nama siswa': 'Dedi' }], 'Kelengkapan');
  m = b.log.conf[0][0];
  T('pratinjau: 1 baru (Budi), 1 diperbarui (Ani), 4 ditolak, 1 baris identitas saja dilewati', /1 siswa baru, 1 diperbarui, 4 ditolak/.test(m) && /1 baris tanpa isian dilewati/.test(m) && /Eka belum punya penempatan/.test(m) && /Kolom "Pembekalan" harus Ya atau Belum: mungkin/.test(m), m);
  const ca = x.pkCekOf('s1'), cb = x.pkCekOf('s2');
  T('Ani: pks dan jaminan ditambah, pembekalan lama tetap (sel kosong tidak menghapus)', ca.items.pembekalan === true && ca.items.pks === true && ca.items.jaminan === true && ca.id === 'cek_s1', ca);
  T('Budi baru: id cek_s2, pembekalan dan asesmen Ya', cb && cb.id === 'cek_s2' && cb.items.pembekalan === true && cb.items.asesInstr === true && cb.nama === 'Budi' && cb.sekolah === 'MEDINA', cb);
  b = await siap(); x = b.ctx; await pasang(b, 'cek', [{ 'Nama siswa': 'Budi', Pembekalan: 'Belum', Laporan: 'Tidak' }]);
  T('semua Belum untuk siswa tanpa catatan: tidak membuat catatan kosong', !x.pkCekOf('s2') && /sama dengan data/.test(b.log.info[0] || ''), b.log.info);

  console.log('Penjaga impor');
  b = await siap(); x = b.ctx;
  await pasang(b, 'nilai', []); T('berkas kosong', b.log.toast.some((m) => /Pakai tombol Template/.test(m)));
  b.log.toast.length = 0; await pasang(b, 'nilai', [{ Foo: 'x' }]); T('judul kolom tidak dikenali', b.log.toast.some((m) => /Judul kolom tidak dikenali \(Nilai\)/.test(m)));
  b.log.toast.length = 0; await pasang(b, 'nilai', Array.from({ length: 501 }, () => ({ 'Nama siswa': 'Ani', TP1: 1 }))); T('lebih dari 500 baris', b.log.toast.some((m) => /Maksimal 500/.test(m)));
  b.log.toast.length = 0; await b.ctx.pkoImpor('nilai', { arrayBuffer: async () => { throw new Error('rusak'); } }); T('berkas rusak: pesan galat dan tidak terkunci', b.log.toast.some((m) => /Gagal membaca berkas: rusak/.test(m)) && x.PKO.busy === false);
  const sb = boot(); sb.ctx.PK.loaded = false; await sb.ctx.pkoImpor('nilai', berkas([{ 'Nama siswa': 'Ani', TP1: 1 }])); T('data belum dimuat: impor menunggu', sb.log.toast.some((m) => /masih dimuat/.test(m)));
  b = await siap(); b.ubah('nilai', berkas([{ 'Nama siswa': 'Eka', TP1: 90 }], 'Nilai')); await tick();
  T('memilih berkas pada input memicu impor sampai tersimpan', b.ctx.PK.D.nilai.some((n) => n.sid === 's6' && n.tp1 === 90));
  b = await siap(); x = b.ctx; await pasang(b, 'nilai', [{ 'Nama siswa': 'Ani', TP1: 95 }], 'Lembar lain'); T('lembar dipilih: nama lembar tak cocok memakai lembar pertama', x.pkById('nilai', 'n1').tp1 === 95);

  console.log('Cetak PDF');
  b = await siap(); x = b.ctx; b.klik('pkl-pdf-tab', { v: 'tugas' }); let d = b.pdf[0];
  T('Penempatan: A4 landscape, kop, judul, nama berkas', d.opt.orientation === 'landscape' && d.opt.format === 'a4' && d.texts.some((t) => /DAFTAR PENEMPATAN SISWA/.test(t)) && d.saved === 'Penempatan-PKL-medina-2026-11-26.pdf', [d.opt, d.saved]);
  T('Penempatan: judul kolom, 2 baris, tahun ajaran dan jumlah di keterangan, tanda tangan', d.tables[0].head[0].join() === 'No,Siswa,Kelas,Tempat PKL,Guru pembimbing,Instruktur,Periode,Status' && d.tables[0].body.length === 2 && d.texts.some((t) => /Tahun ajaran 2026\/2027.*Jumlah: 2/.test(t)) && d.texts.includes('Koordinator PKL'));
  T('teks PDF dibersihkan dari tanda yang tak didukung (en dash menjadi -)', d.tables[0].body[0][3] === 'CV Bintang - Jaya');
  x.PK.flt.tugas = { tempat: 't1' }; b.klik('pkl-pdf-tab', { v: 'tugas' });
  T('saringan aktif tercantum di keterangan dan membatasi isi', b.pdf[1].tables[0].body.length === 1 && b.pdf[1].texts.some((t) => /Saringan: Tempat PKL: PT Maju Motor/.test(t)));
  ['tempat', 'kunjungan', 'nilai', 'cek', 'rekap'].forEach((t) => b.klik('pkl-pdf-tab', { v: t }));
  const [pt, pk, pn, pc, pr] = b.pdf.slice(2);
  T('Tempat: kuota terisi/kuota, PKS, monitoring terakhir', pt.tables[0].body.length === 3 && pt.tables[0].body[2][5] === '1/2' && /Monitoring/.test(pt.tables[0].head[0].join()) && pt.saved === 'Tempat-PKL-medina-2026-11-26.pdf' && pt.tables[0].body[2][7] === '20 November 2026', pt.tables[0].body);
  T('Monitoring: tanggal, cara, temuan, tindak lanjut', pk.tables[0].body[0].join() === '1,20 November 2026,PT Maju Motor,Pak Guru,Langsung,Baik,Tambah variasi' && pk.saved === 'Monitoring-PKL-medina-2026-11-26.pdf', pk.tables[0].body[0]);
  T('Rekap nilai: TP, nilai akhir, predikat, S/I/A, catatan keterangan', pn.tables[0].head[0].slice(4, 10).join() === 'TP1,TP2,TP3,TP4,Nilai akhir,Predikat' && pn.tables[0].body[0].slice(4, 10).join() === '80,90,-,-,85,Baik' && pn.texts.some((t) => /S = sakit/.test(t)), pn.tables[0].body[0]);
  T('Kelengkapan: matriks v/-, jumlah, keterangan', pc.tables[0].head[0].length === 15 && pc.tables[0].body[0].slice(3).join() === 'v,-,-,-,-,-,-,-,-,-,-,1/11' && pc.texts.some((t) => /v = sudah/.test(t)), pc.tables[0].body[0]);
  T('Rekap: kehadiran, jurnal, kelengkapan, nilai', pr.tables[0].body[0].join() === '1,Ani,XII,PT Maju Motor,1,0,0,' + pr.tables[0].body[0][7] + ',0,2,1/11,85', pr.tables[0].body[0]);
  b = await siap(); x = b.ctx; b.klik('pkl-pdf-tab', { v: 'absen' }); d = b.pdf[0];
  T('Daftar hadir harian: tanggal di judul, status, nama berkas', d.texts.some((t) => /DAFTAR HADIR PESERTA DIDIK PKL - /.test(t)) && d.tables[0].body.map((r) => r[6]).join() === 'Izin,Hadir' && d.tables[0].body[1][4] === '07:05' && d.saved === 'Daftar-Hadir-PKL-medina-2026-11-26.pdf', d.tables[0].body);
  b.klik('pkl-pdf-tab', { v: 'jurnal' }); d = b.pdf[1];
  T('Jurnal banyak siswa: satu doc, satu halaman per siswa (2), tiap halaman bertabel', d.pages === 2 && d.tables.filter((t) => t.head && t.head[0][0] === 'No').length === 2 && d.saved === 'Jurnal-PKL-medina-2026-11-26.pdf' && d.texts.filter((t) => /JURNAL KEGIATAN/.test(t)).length === 2, [d.pages, d.saved]);
  x.PK.flt.jurnal = { siswa: 's1' }; b.klik('pkl-pdf-tab', { v: 'jurnal' }); T('Jurnal: saringan siswa = satu halaman', b.pdf[2].pages === 1);
  x.pkPdfJurnal('s1'); d = b.pdf[3];
  T('PDF jurnal per siswa (Lampiran 2) tetap bekerja setelah dipecah per halaman', d.pages === 1 && /^Jurnal-PKL-/.test(d.saved) && d.tables.some((t) => t.body && t.body.length === 2), [d.saved, d.pages]);
  x.pkPdfJurnal('s6'); T('jurnal kosong per siswa: pesan, tanpa berkas', b.pdf.length === 4 && b.log.toast.some((m) => /Belum ada jurnal untuk dicetak/.test(m)));
  b = await siap({}, (d2) => { d2.tugas = []; d2.jurnal = []; d2.kunjungan = []; d2.nilai = []; d2.cek = []; d2.tempat = []; }); x = b.ctx;
  ['tugas', 'jurnal', 'kunjungan', 'nilai', 'cek', 'rekap', 'absen', 'tempat'].forEach((t) => b.klik('pkl-pdf-tab', { v: t }));
  T('data kosong: tidak ada PDF, ada pesan untuk tiap tab', b.pdf.length === 0 && b.log.toast.length === 8, b.log.toast);
  b = await siap({}, (d2) => { d2.tugas = [d2.tugas[0]]; }); x = b.ctx; x.PK.D.tugas[0].guruId = ''; x.PK.D.tugas[0].guruNama = ''; b.klik('pkl-pdf-tab', { v: 'tugas' });
  T('penempatan tanpa guru: tercetak dengan "-", tidak gagal', b.pdf[0].tables[0].body[0][4] === '-');

  console.log('Pemasangan');
  const idx = baca('index.html'), sw = baca('service-worker.js'), pos = (n) => idx.indexOf('js/' + n + '.js');
  T('index.html: pkl-xls, pkl-io, pkl-pdf berurutan tepat setelah pkl.js', pos('pkl') > 0 && pos('pkl-xls') > pos('pkl') && pos('pkl-io') > pos('pkl-xls') && pos('pkl-pdf') > pos('pkl-io') && pos('pkl-pdf') < pos('absensi'));
  T('versi (?v=hash) dan service worker mencakup ketiga berkas baru', ['pkl-xls', 'pkl-io', 'pkl-pdf'].every((n) => new RegExp('js/' + n + '\\.js\\?v=[0-9a-f]+').test(idx) && new RegExp('js/' + n + '\\.js\\?v=[0-9a-f]+').test(sw)));
  const src = ['pkl-io', 'pkl-pdf'].map((n) => baca('js/' + n + '.js')).join('\n'), nama = [...src.matchAll(/^(?:async )?function (\w+)|^var (\w+)/gm)].map((q) => q[1] || q[2]), bentrok = [];
  for (const fl of fs.readdirSync(new URL('../js/', import.meta.url), { recursive: true }).filter((n) => n.endsWith('.js') && !/^pkl-(io|pdf)\.js$/.test(n))) {
    const t = baca('js/' + fl); nama.forEach((n) => { if (new RegExp('(?:^|[;\\n])\\s*(?:async\\s+)?(?:function|var|let|const)\\s+' + n + '\\b').test(t)) bentrok.push(fl + ':' + n); });
  }
  T('nama global pkl-io.js dan pkl-pdf.js (pko*, pkp*, PKO*) tidak bentrok', nama.length > 40 && bentrok.length === 0, bentrok);
  const srcPkl = baca('js/pkl.js');
  T('pkl.js memanggil pkoBar/pkxBar hanya bila ada (tetap jalan tanpa modul tambahan)', ['tugas', 'absen', 'jurnal', 'kunjungan', 'nilai', 'cek', 'rekap'].every((t) => srcPkl.includes("typeof pkoBar==='function'?pkoBar('" + t + "')")) && srcPkl.includes("typeof pkxBar==='function'"));
  console.log(`\nUji PKL IO: ${pass} lulus, ${fail} gagal`); process.exit(fail ? 1 : 0);
})();
