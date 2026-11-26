/* Uji menu PKL (js/pkl.js): node tools/uji-pkl.mjs
   Mencakup: hitungan (jarak, hari kerja, rekap, nilai), absen selfie siswa (validasi, duplikat, lokasi), penempatan (kuota, ganda),
   tempat, nilai, jurnal, kelengkapan, mode Appwrite (koleksi, payload, kueri siswa), Kepala Sekolah hanya melihat, appwrite.json, menu. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const USERS = [
  { id: 'g1', nama: 'Pak Guru', peran: 'guru', sekolah: 'MEDINA' },
  { id: 's1', nama: 'Ani', peran: 'siswa', kelas: 'XII', sekolah: 'MEDINA' },
  { id: 's2', nama: 'Budi', peran: 'siswa', kelas: 'XII', sekolah: 'MEDINA' },
  { id: 'a1', nama: 'Admin', peran: 'admin', sekolah: 'ALL' },
];
function boot(opt = {}) {
  const hs = {}, log = { toast: [], create: [], update: [], remove: [], list: [], render: 0, conf: 0 }, store = {}, dbDocs = (opt.docs || []).slice();
  const peran = opt.peran || 'guru', me = opt.me || (peran === 'siswa' ? USERS[1] : USERS[0]);
  const el = () => ({ appendChild() {}, remove() {}, addEventListener() {}, setAttribute() {}, style: {} });
  const ctx = {
    console, navigator: { onLine: true }, Math, JSON, Object, Array, Number, String, Date, Promise, parseInt, setTimeout: () => 0, Image: function () {}, URL: {},
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    document: { addEventListener(t, f) { (hs[t] = hs[t] || []).push(f); }, getElementById: () => null, querySelector: () => null, createElement: el, head: el(), body: el() },
    window: { addEventListener() {} }, ICO: { chev: '', camera: '' }, NAVTABS: [], svg: () => '',
    S: { tab: 'pkl', user: me, users: USERS.slice() }, CFG: { DB: 'tbsm' }, Appwrite: { Query: { equal: (k, v) => 'equal:' + k + ':' + v } },
    hasRole: (u, r) => String(u.peran).split(',').includes(r), actRole: () => peran, isStaff: () => peran !== 'siswa',
    schKode: () => 'MEDINA', schAkunOk: () => true,
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast: (m) => log.toast.push(m), uid: () => 'loc' + (ctx._n = (ctx._n || 0) + 1), _n: 0, ymd: () => '2026-11-26',
    render: () => { log.render++; }, viewKatalog: () => 'katalog', uiConfirm: async () => { log.conf++; return true; },
    Cloud: { on: !!opt.cloud, remove: async (c, id) => { log.remove.push([c, id]); return true; },
      list: async (col, extra) => { log.list.push([col, extra]); return dbDocs.filter((d) => d._col === col).map((d) => ({ ...d })); },
      db: { createDocument: async (db, col, id, doc) => { log.create.push({ col, id, doc }); dbDocs.push({ $id: id, _col: col, ...doc }); },
        updateDocument: async (db, col, id, doc) => { log.update.push({ col, id, doc }); } } },
    XLSX: null, ...(opt.ctx || {}),
  };
  vm.createContext(ctx);
  vm.runInContext(baca('js/pkl.js') + '\n;this.PK=PK;', ctx);
  const klik = (act, d = {}) => hs.click.forEach((f) => f({ target: { closest: () => ({ dataset: { act, ...d } }) } }));
  return { ctx, log, hs, store, dbDocs, klik };
}
const tempat = (o = {}) => ({ id: 't1', nama: 'PT Maju Motor', alamat: 'Jl. Soekarno-Hatta 1', kota: 'Bandung', instruktur: 'Pak Dedi', instrTelp: '0812', kuota: 2, lat: -6.9175, lng: 107.6191, radius: 200, pks: '012/PKS', pksSelesai: '2027-12-31', sekolah: 'MEDINA', r: 1, d: 0, ...o });
const tugas = (o = {}) => ({ id: 'g1x', sid: 's1', nama: 'Ani', kelas: 'XII', tempatId: 't1', guruId: 'g1', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif', sekolah: 'MEDINA', r: 1, d: 0, ...o });

(async () => {
  console.log('Hitungan');
  let { ctx: x } = boot();
  T('tempel koordinat Google Maps dipecah (titik desimal)', JSON.stringify(x.pkLokTempel('-6.9175, 107.6191')) === '[-6.9175,107.6191]');
  T('tempel koordinat dipecah (koma desimal, pemisah spasi)', JSON.stringify(x.pkLokTempel('-6,9175 107,6191')) === '[-6.9175,107.6191]');
  T('satu angka atau di luar rentang tidak dipecah', x.pkLokTempel('-6.9175') === null && x.pkLokTempel('95, 107') === null && x.pkLokTempel('-6,917') === null);
  x.PK.fk = 'tempat'; x.PK.f = { lat: '', lng: '' }; x.PK.lokMsg = '';
  T('formulir tempat memuat tombol lokasi saya dan peta', /pkl-lok-gps/.test(x.pkFormView()) && /pkl-lok-peta/.test(x.pkFormView()));
  x.PK.fk = 'tugas'; x.PK.f = {};
  T('formulir lain tidak memuat tombol lokasi', !/pkl-lok-peta/.test(x.pkFormView()));
  T('jarak 0 m di titik yang sama', x.pkJarak(-6.9175, 107.6191, -6.9175, 107.6191) === 0);
  T('jarak ±1,1 km untuk selisih 0,01 derajat lintang', Math.abs(x.pkJarak(-6.9175, 107.6191, -6.9075, 107.6191) - 1112) < 15);
  T('hari kerja Sen-Jum: 2 Nov (Senin) s.d. 8 Nov = 5', x.pkHariKerja('2026-11-02', '2026-11-08') === 5);
  T('hari kerja akhir sebelum awal = 0', x.pkHariKerja('2026-11-09', '2026-11-02') === 0);
  T('nilai akhir rata-rata TP terisi', x.pkNilaiAkhir({ tp1: 80, tp2: 90, tp3: '', tp4: 70 }) === 80 && x.pkNilaiAkhir({ tp1: '', tp2: '' }) === null);
  T('predikat', x.pkPredikat(92) === 'Sangat baik' && x.pkPredikat(75) === 'Baik' && x.pkPredikat(60) === 'Cukup' && x.pkPredikat(40) === 'Perlu bimbingan');
  T('status perjanjian: belum / berlaku / berakhir', x.pkPksStatus({})[1] === 'Perjanjian belum diisi' && x.pkPksStatus({ pks: 'a', pksSelesai: '2027-01-01' })[0] === 'ok' && x.pkPksStatus({ pks: 'a', pksSelesai: '2026-01-01' })[0] === 'bad');
  T('4 TP bawaan dari AKD_PKL_TP atau cadangan', x.pkTP().length === 4);

  console.log('Absen siswa (mode lokal)');
  let b = boot({ peran: 'siswa' }); x = b.ctx;
  x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas());
  x.PK.f = { tipe: 'masuk', foto: '', cat: '' }; x.PK.mode = 'absen'; x.pkAbsenKirim();
  T('masuk tanpa selfie ditolak', /selfie/i.test(x.PK.msg) && x.PK.D.absen.length === 0, x.PK.msg);
  x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,AAA', cat: '' }; x.PK.gps = { lat: -6.9175, lng: 107.6191, acc: 20 }; x.pkAbsenKirim();
  await Promise.resolve(); await Promise.resolve();
  const a1 = x.PK.D.absen[0];
  T('absen masuk tersimpan dengan selfie, lokasi di tempat', a1 && a1.tipe === 'masuk' && a1.foto && a1.lokasi === 'ya' && a1.jarak === 0 && a1.sid === 's1' && a1.tempatId === 't1' && a1.r === 1, a1);
  x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,AAA', cat: '' }; x.PK.mode = 'absen'; x.pkAbsenKirim();
  T('absen masuk ganda pada hari yang sama ditolak', /sudah tercatat/.test(x.PK.msg) && x.PK.D.absen.length === 1, x.PK.msg);
  x.PK.f = { tipe: 'sakit', foto: '', cat: '' }; x.pkAbsenKirim();
  T('sakit tanpa keterangan ditolak', /keterangan/i.test(x.PK.msg));
  x.PK.f = { tipe: 'pulang', foto: 'data:image/jpeg;base64,BBB', cat: '' }; x.PK.gps = { lat: -6.80, lng: 107.6191, acc: 10 }; x.pkAbsenKirim();
  await Promise.resolve(); await Promise.resolve();
  T('absen pulang jauh dari tempat ditandai di luar lokasi', x.PK.D.absen[1] && x.PK.D.absen[1].lokasi === 'tidak' && x.PK.D.absen[1].jarak > 10000, x.PK.D.absen[1]);
  T('rekap: 1 hari hadir, hari kerja dihitung dari mulai PKL', x.pkRekap('s1').hadir === 1 && x.pkRekap('s1').hk === 19 && x.pkRekap('s1').alpa === 18, x.pkRekap('s1'));
  let b2 = boot({ peran: 'siswa', me: USERS[2] }); b2.ctx.PK.D.tempat.push(tempat());
  b2.ctx.PK.f = { tipe: 'masuk', foto: 'data:x', cat: '' }; b2.ctx.pkAbsenKirim();
  T('siswa belum ditempatkan tidak bisa absen', /belum ditempatkan/.test(b2.ctx.PK.msg));
  b2.ctx.PK.f = { tipe: 'pulang', foto: 'x', cat: '' }; b2.ctx.PK.D.tugas.push(tugas({ id: 'g2x', sid: 's2', nama: 'Budi' })); b2.ctx.pkAbsenKirim();
  T('pulang tanpa masuk ditolak', /masuk hari ini belum/.test(b2.ctx.PK.msg), b2.ctx.PK.msg);
  const vs = x.viewPkl();
  T('tampilan siswa: tempat, tombol absen selfie, riwayat, jurnal, daftar tempat', /PT Maju Motor/.test(vs) && /pkl-absen/.test(vs) && /Riwayat absen/.test(vs) && /Jurnal kegiatan/.test(vs) && /Daftar tempat PKL/.test(vs) && /Di lokasi/.test(vs));
  T('tampilan siswa tidak memuat menu kelola (Penempatan, Nilai, Kelengkapan)', !/pkl-tab/.test(vs));
  x.PK.mode = 'absen'; const va = x.viewPkl();
  T('form absen: pilihan Masuk/Pulang/Izin/Sakit, input kamera depan, lokasi', /pkl-tipe/.test(va) && /capture="user"/.test(va) && /Muat ulang lokasi/.test(va) && /Sakit/.test(va));
  x.PK.mode = 'list'; x.PK.fk = 'jurnal'; x.PK.f = { tanggal: '2026-11-26', unit: 'Servis berkala', uraian: 'Ganti oli dan filter' }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  T('jurnal siswa tersimpan atas nama sendiri', x.PK.D.jurnal.length === 1 && x.PK.D.jurnal[0].sid === 's1' && x.PK.D.jurnal[0].tempatId === 't1');
  x.PK.fk = 'jurnal'; x.PK.f = { tanggal: '2026-11-26', unit: '', uraian: '' }; x.pkSimpan();
  T('jurnal wajib diisi', /Lengkapi/.test(x.PK.msg));

  console.log('Guru: tempat, penempatan, nilai, kelengkapan');
  b = boot({ peran: 'guru' }); x = b.ctx;
  x.PK.fk = 'tempat'; x.PK.f = { nama: '', negeri: 'dalam' }; x.pkSimpan();
  T('tempat: nama wajib', /Lengkapi/.test(x.PK.msg));
  x.PK.f = { nama: 'CV Bintang', negeri: 'dalam', lat: '-6,9', lng: 'abc', radius: '' }; x.pkSimpan();
  T('tempat: koordinat bukan angka ditolak', /Koordinat/.test(x.PK.msg));
  x.PK.f = { nama: 'CV Bintang', negeri: 'dalam', lat: '-6,9', lng: '107.6', radius: '', kuota: '1', instruktur: 'Bu Rina' }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  const tb = x.PK.D.tempat[0];
  T('tempat tersimpan: koordinat angka (koma desimal), radius bawaan 200, kuota angka', tb && tb.lat === -6.9 && tb.lng === 107.6 && tb.radius === 200 && tb.kuota === 1, tb);
  x.PK.fk = 'tugas'; x.PK.f = { sid: 's1', tempatId: tb.id, guruId: 'g1', mulai: '2026-11-02', selesai: '2026-10-01', status: 'aktif' }; x.pkSimpan();
  T('penempatan: selesai sebelum mulai ditolak', /Tanggal selesai/.test(x.PK.msg));
  x.PK.f = { sid: 's1', tempatId: tb.id, guruId: 'g1', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  const tg = x.PK.D.tugas[0];
  T('penempatan tersimpan: guru dan instruktur ikut tempat, TANPA nama/kelas siswa (koleksi pkl dapat dibaca semua pengguna)', tg && tg.nama === undefined && tg.kelas === undefined && tg.sid === 's1' && tg.guruNama === 'Pak Guru' && tg.instruktur === 'Bu Rina' && x.pkNm(tg) === 'Ani' && x.pkKl(tg) === 'XII', tg);
  x.PK.f = { sid: 's2', tempatId: tb.id, mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }; x.pkSimpan();
  T('penempatan: kuota penuh ditolak', /Kuota/.test(x.PK.msg), x.PK.msg);
  x.PK.D.tempat.push(tempat()); x.PK.f = { sid: 's1', tempatId: 't1', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }; x.pkSimpan();
  T('penempatan: siswa dengan penempatan aktif lain ditolak', /sudah punya penempatan aktif/.test(x.PK.msg), x.PK.msg);
  x.PK.fk = 'nilai'; x.PK.f = { sid: 's1', tp1: 80, tp2: 90, tp3: '', tp4: 70, catGuru: 'Baik' }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  const nl = x.PK.D.nilai[0];
  T('nilai tersimpan, tempat dari penempatan, nilai akhir 80', nl && nl.tempatId === tb.id && x.pkNilaiAkhir(nl) === 80, nl);
  x.PK.f = { sid: 's1', tp1: 120 }; x.pkSimpan();
  T('nilai di luar 0-100 ditolak', /0 sampai 100/.test(x.PK.msg));
  x.PK.f = { sid: 's1', tp1: 100, tp2: 100, tp3: 100, tp4: 100 }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  T('nilai siswa yang sama diperbarui, bukan ganda', x.PK.D.nilai.length === 1 && x.pkNilaiAkhir(x.PK.D.nilai[0]) === 100);
  x.pkCekToggle('s1', 'pks', true); x.pkCekToggle('s1', 'laporan', true); x.pkCekToggle('s1', 'pks', false);
  T('kelengkapan: centang tersimpan per siswa (cek_<sid>)', x.PK.D.cek.length === 1 && x.PK.D.cek[0].id === 'cek_s1' && x.PK.D.cek[0].items.laporan === true && x.PK.D.cek[0].items.pks === false);
  x.PK.fk = 'kunjungan'; x.PK.f = { tanggal: '2026-11-20', tempatId: tb.id, guruId: 'g1', mode: 'luring', temuan: 'Sesuai' }; x.pkSimpan(); await Promise.resolve(); await Promise.resolve();
  T('kunjungan tersimpan dan jadi kunjungan terakhir (6 hari lalu)', x.PK.D.kunjungan.length === 1 && x.pkKunjunganAkhir(tb.id).tanggal === '2026-11-20' && x.pkHariSejak('2026-11-20') === 6);
  for (const tab of ['tempat', 'tugas', 'absen', 'jurnal', 'kunjungan', 'nilai', 'cek', 'rekap']) { x.PK.tab = tab; const v = x.viewPkl(); T('tampilan guru tab ' + tab + ' tampil tanpa galat', typeof v === 'string' && /pkl-tab/.test(v) && v.length > 400); }
  x.PK.tab = 'rekap'; T('rekap memuat siswa, tempat, nilai 100, kelengkapan 1/11', /Ani/.test(x.viewPkl()) && />100</.test(x.viewPkl()) && /1\/11/.test(x.viewPkl()));
  x.PK.tab = 'tempat'; T('tempat berkuota penuh, perjanjian, dan perlu monitoring tampil', /Perjanjian/.test(x.viewPkl()) && /CV Bintang/.test(x.viewPkl()));
  b.klik('pkl-new', { k: 'tugas' }); T('klik + Penempatan membuka form', x.PK.mode === 'form' && x.PK.fk === 'tugas');
  const fv = x.viewPkl(); T('form penempatan: pilihan siswa, tempat, guru', /Ani/.test(fv) && /CV Bintang/.test(fv) && /Pak Guru/.test(fv) && /pkl-save/.test(fv));
  b.klik('pkl-cancel'); T('batal kembali ke daftar', x.PK.mode === 'list');
  b.klik('pkl-del', { k: 'nilai', v: x.PK.D.nilai[0].id }); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  T('hapus meminta konfirmasi lalu menghapus', b.log.conf === 1 && x.PK.D.nilai.length === 0);

  console.log('Mode Appwrite');
  b = boot({ peran: 'siswa', cloud: true }); x = b.ctx;
  b.dbDocs.push({ $id: 't1', _col: 'pkl', jenis: 'tempat', sekolah: 'MEDINA', nama: 'PT Maju', ts: 1, sid: '', tanggal: '', payload: JSON.stringify({ nama: 'PT Maju', alamat: 'X' }) });
  b.dbDocs.push({ $id: 'x9', _col: 'pkl', jenis: 'tugas', sekolah: 'MEDINA', nama: 'Ani', ts: 1, sid: 's1', tanggal: '', payload: JSON.stringify({ tempatId: 't1', status: 'aktif', mulai: '2026-11-02', selesai: '2027-05-02' }) });
  await x.pkLoad();
  T('siswa memuat tempat, penempatan sendiri, dan catatannya dengan kueri terarah', b.log.list.length === 3 && b.log.list.some((l) => l[0] === 'pkl' && String(l[1]).includes('equal:jenis:tempat')) && b.log.list.some((l) => l[0] === 'pkl' && String(l[1]).includes('equal:sid:s1')) && b.log.list.some((l) => l[0] === 'pkl_catat' && String(l[1]).includes('equal:sid:s1')), b.log.list);
  b.dbDocs.push({ $id: 'x10', _col: 'pkl', jenis: 'tugas', sekolah: 'MEDINA', nama: '', ts: 1, sid: 's9', tanggal: '', payload: JSON.stringify({ tempatId: 't1' }) });
  T('data Appwrite terbaca dengan payload di-parse', x.PK.D.tempat[0].nama === 'PT Maju' && x.PK.D.tugas[0].tempatId === 't1' && x.PK.D.tugas[0].r === 1);
  x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,QQ==', cat: 'ok' }; x.PK.gps = null; x.pkAbsenKirim(); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  const c = b.log.create[0];
  T('absen dikirim ke koleksi pkl_catat dengan kolom sid, tanggal, jenis dan selfie di payload', c && c.col === 'pkl_catat' && c.doc.jenis === 'absen' && c.doc.sid === 's1' && c.doc.tanggal === '2026-11-26' && JSON.parse(c.doc.payload).foto.startsWith('data:image') && c.doc.payload.length < 60000, c && Object.keys(c.doc));
  T('absen tanpa GPS pada tempat berkoordinat: lokasi tidak diketahui (tidak memblokir)', JSON.parse(c.doc.payload).lokasi === '?');
  const sv = JSON.parse(b.store['tbsm-pkl']);
  T('salinan perangkat tidak menyimpan selfie yang sudah terkirim (hemat ruang)', sv.absen[0].foto === undefined && sv.absen[0].fotoAda === 1, sv.absen[0]);
  b = boot({ peran: 'guru', cloud: true }); x = b.ctx; await x.pkLoad();
  T('guru memuat ketiga koleksi penuh', JSON.stringify(b.log.list.map((l) => l[0]).sort()) === '["pkl","pkl_catat","pkl_nilai"]');
  x.PK.fk = 'kunjungan'; x.PK.f = { tanggal: '2026-11-20', tempatId: 't1', mode: 'luring' }; x.pkSimpan(); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  T('kunjungan masuk koleksi pkl_nilai', b.log.create[0] && b.log.create[0].col === 'pkl_nilai' && b.log.create[0].doc.jenis === 'kunjungan');
  b.ctx.Cloud.db.createDocument = async () => { throw { code: 500, message: 'down' }; };
  x.PK.fk = 'kunjungan'; x.PK.f = { tanggal: '2026-11-21', tempatId: 't1', mode: 'luring' }; x.pkSimpan(); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  T('gagal kirim: data tetap di perangkat, ditandai belum terkirim', x.PK.D.kunjungan.some((k) => k.tanggal === '2026-11-21' && !k.r));

  console.log('Kepala Sekolah hanya melihat');
  b = boot({ peran: 'kepsek' }); x = b.ctx; x.PK.D.tempat.push(tempat());
  b.klik('pkl-new', { k: 'tempat' }); T('kepsek: tambah data diblokir', x.PK.mode === 'list' && b.log.toast.some((m) => /hanya dapat melihat/.test(m)));
  b.klik('pkl-del', { k: 'tempat', v: 't1' }); T('kepsek: hapus diblokir', x.PK.D.tempat.length === 1);
  T('kepsek: tampilan tetap bisa dibuka', /pkl-tab/.test(x.viewPkl()));


  console.log('Selfie ke Drive (foto-drive)');
  {
    const calls = [];
    const ld = async (p) => { calls.push(p); if (p.action === 'upload') return { ok: true, fileId: 'FILEIDABC123' }; if (p.action === 'getpkl') return { ok: true, data: 'data:image/jpeg;base64,ZZZ' }; throw new Error('?'); };
    let d = boot({ peran: 'siswa', cloud: true, ctx: { ldCall: ld } }); let x = d.ctx;
    x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas());
    x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,QQ==', cat: '' }; x.pkAbsenKirim(); for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r));
    const up = calls.find((c) => c.action === 'upload'), cr = d.log.create[0];
    T('selfie diunggah ke Drive dengan nama PKL_Kelas_Nama_jenis_waktu', up && /^PKL_XII_Ani_masuk_20261126-\d{4}_[A-Za-z0-9]+$/.test(up.nama) && up.data.startsWith('data:image/jpeg'), up);
    T('payload absen hanya menyimpan penanda drive:<fileId> (database tidak terisi foto)', cr && JSON.parse(cr.doc.payload).foto === 'drive:FILEIDABC123' && cr.doc.payload.length < 800, cr && cr.doc.payload.slice(0, 200));
    T('selfie yang baru diunggah langsung tampil dari cache tanpa unduh ulang', x.pkFotoSrc(x.PK.D.absen[0]).startsWith('data:image/jpeg') && !calls.some((c) => c.action === 'getpkl'));
    T('salinan perangkat menyimpan penanda drive (bukan hilang)', JSON.parse(d.store['tbsm-pkl']).absen[0].foto === 'drive:FILEIDABC123');
    const asing = { id: 'absX', foto: 'drive:OTHERFILE9999' };
    T('selfie dari Drive belum ada di cache: kosong dulu, lalu diminta lewat getpkl dengan docId dan fileId', x.pkFotoSrc(asing) === '' && calls.some((c) => c.action === 'getpkl' && c.docId === 'absX' && c.fileId === 'OTHERFILE9999'));
    await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
    T('setelah selesai dimuat, selfie tampil dari cache', x.pkFotoSrc(asing) === 'data:image/jpeg;base64,ZZZ');
    const bnyk = []; for (let i = 0; i < 8; i++) bnyk.push({ id: 'q' + i, foto: 'drive:BANYAKFILE' + i + 'XXXX' });
    let aktif = 0, maks = 0; x.ldCall = async () => { aktif++; maks = Math.max(maks, aktif); await new Promise((r) => setImmediate(r)); aktif--; return { ok: true, data: 'data:image/jpeg;base64,A' }; };
    bnyk.forEach((a) => x.pkFotoSrc(a)); for (let i = 0; i < 30; i++) await new Promise((r) => setImmediate(r));
    T('pengambilan foto dari Drive dibatasi 3 sekaligus', maks > 0 && maks <= 3, maks);
    // fungsi belum dipasang: selfie tetap di payload
    d = boot({ peran: 'siswa', cloud: true, ctx: { ldCall: async () => { const e = new Error('Function with the requested ID could not be found'); e.code = 404; throw e; } } }); x = d.ctx;
    x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas());
    x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,QQ==', cat: '' }; x.pkAbsenKirim(); for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r));
    T('fungsi foto-drive belum dipasang: selfie tetap tersimpan di payload dan absen terkirim', d.log.create[0] && JSON.parse(d.log.create[0].doc.payload).foto.startsWith('data:image/jpeg') && x.PKD.off === true);
    // galat lain: absen diulang, selfie tidak hilang
    d = boot({ peran: 'siswa', cloud: true, ctx: { ldCall: async () => { const e = new Error('Google down'); e.status = 502; throw e; } } }); x = d.ctx;
    x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas());
    x.PK.f = { tipe: 'masuk', foto: 'data:image/jpeg;base64,QQ==', cat: '' }; x.pkAbsenKirim(); for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r));
    T('unggah Drive gagal (galat server): absen belum terkirim, selfie tetap utuh di perangkat untuk dicoba lagi', d.log.create.length === 0 && x.PK.D.absen[0].r !== 1 && x.PK.D.absen[0].foto.startsWith('data:image/jpeg') && JSON.parse(d.store['tbsm-pkl']).absen[0].foto.startsWith('data:image/jpeg'));
  }

  console.log('PDF nilai dan jurnal');
  {
    const saved = [], tabel = [], hal = { n: 0 };
    class Doc { constructor() { this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }; }
      setFont() { return this; } setFontSize() { return this; } setDrawColor() { return this; } setTextColor() { return this; } text(...a) { (this.txt = this.txt || []).push(String(a[0])); return this; } line() { return this; } addImage() { return this; }
      addPage() { hal.n++; return this; } setPage() { return this; } getNumberOfPages() { return hal.n + 1; } save(n) { saved.push(n); }
      autoTable(o) { tabel.push(o); this.lastAutoTable = { finalY: 120 }; } }
    const pdfCtx = { window: { addEventListener() {}, jspdf: { jsPDF: Doc } }, schEf: () => ({ nama: 'SMKS Medina', alamat: 'Jl. X', program: 'Teknik Otomotif', logo: '' }), akNis: () => '0012345' };
    let d = boot({ peran: 'guru', ctx: pdfCtx }); let x = d.ctx;
    x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas(), tugas({ id: 'g2x', sid: 's2' }));
    x.PK.D.nilai.push({ id: 'n1', sid: 's1', nama: 'Ani', tp1: 80, tp2: 90, tp3: '', tp4: 70, catGuru: 'Rajin', catInstr: 'Disiplin', r: 1 }, { id: 'n2', sid: 's2', nama: 'Budi', tp1: 60, tp2: 60, tp3: 60, tp4: 60, r: 1 });
    x.PK.D.jurnal.push({ id: 'j1', sid: 's1', nama: 'Ani', tanggal: '2026-11-03', unit: 'Servis berkala', uraian: 'Ganti oli – filter', cat: 'Bagus', r: 1 }, { id: 'j0', sid: 's1', nama: 'Ani', tanggal: '2026-11-02', unit: 'Orientasi', uraian: 'Mengenal bengkel', r: 1 });
    d.klik('pkl-pdf-nilai', { v: 's1' });
    T('PDF nilai satu siswa tersimpan: Nilai-PKL-Ani.pdf', saved[0] === 'Nilai-PKL-Ani.pdf', saved);
    const th = tabel.find((o) => o.head && o.head[0][0] === 'Tujuan Pembelajaran');
    T('PDF nilai: tabel TP, skor, deskripsi dengan 4 TP + nilai akhir 80', th && JSON.stringify(th.head) === '[["Tujuan Pembelajaran","Skor","Deskripsi"]]' && th.body.length === 5 && th.body[0][1] === '80' && th.body[2][1] === '-' && th.body[4][0].content === 'Nilai akhir (rata-rata)' && th.body[4][1].content === '80' && th.body[1][2] === 'Sangat baik', th && th.body);
    const idn = tabel[0].body.map((r) => r[0] + r[2]).join('|');
    T('PDF nilai: identitas (nama, NIS, kelas, program, tempat, periode, instruktur, pembimbing)', /Ani/.test(idn) && /0012345/.test(idn) && /XII/.test(idn) && /Teknik Otomotif/.test(idn) && /PT Maju Motor/.test(idn) && /Pak Dedi/.test(idn) && /Pak Guru/.test(idn) && /2 November 2026/.test(idn), idn);
    T('PDF nilai: kehadiran dan catatan guru/instruktur ikut tercetak', tabel.some((o) => o.head && o.head[0][0] === 'Kehadiran' && o.body[2][0] === 'Tanpa keterangan') && tabel.some((o) => o.head && o.head[0][0] === 'Catatan' && /Rajin/.test(o.body[0][0]) && /Disiplin/.test(o.body[0][0])));
    saved.length = 0; hal.n = 0; d.klik('pkl-pdf-nilai', { v: 'semua' });
    T('PDF semua nilai: satu berkas, satu halaman per siswa', saved[0] === 'Nilai-PKL-semua.pdf' && hal.n === 1, [saved, hal.n]);
    saved.length = 0; tabel.length = 0; d.klik('pkl-pdf-jurnal', { v: 's1' });
    const tj = tabel.find((o) => o.head && o.head[0][0] === 'No');
    T('PDF jurnal: Jurnal-PKL-Ani.pdf, diurutkan tanggal, tanda baca khusus diganti agar aman di PDF', saved[0] === 'Jurnal-PKL-Ani.pdf' && tj && tj.body.length === 2 && tj.body[0][3] === 'Mengenal bengkel' && tj.body[1][3] === 'Ganti oli - filter' && /Senin/.test(tj.body[0][1]), tj && tj.body);
    saved.length = 0; d.klik('pkl-pdf-jurnal', { v: 's2' }); T('PDF jurnal tanpa data: tidak membuat berkas', saved.length === 0 && d.log.toast.some((m) => /Belum ada jurnal/.test(m)));
    d = boot({ peran: 'siswa', ctx: pdfCtx }); x = d.ctx; x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas());
    x.PK.D.jurnal.push({ id: 'j1', sid: 's1', nama: 'Ani', tanggal: '2026-11-03', unit: 'U', uraian: 'V', r: 1 }, { id: 'j2', sid: 's2', nama: 'Budi', tanggal: '2026-11-03', unit: 'U', uraian: 'V', r: 1 });
    const s0 = saved.length; d.klik('pkl-pdf-jurnal', { v: 's2' }); T('siswa tidak bisa mencetak jurnal siswa lain', saved.length === s0);
    d.klik('pkl-pdf-jurnal', { v: 's1' }); T('siswa bisa mencetak jurnal sendiri', saved.length === s0 + 1);
    d.klik('pkl-pdf-nilai', { v: 's1' }); T('siswa tidak bisa mencetak daftar nilai', saved.length === s0 + 1);
    T('tombol PDF jurnal ada di tampilan siswa', /pkl-pdf-jurnal/.test(x.viewPkl()));
    d = boot({ peran: 'guru', ctx: pdfCtx }); x = d.ctx; x.PK.D.tempat.push(tempat()); x.PK.D.tugas.push(tugas()); x.PK.D.nilai.push({ id: 'n1', sid: 's1', nama: 'Ani', tp1: 80, r: 1 });
    x.PK.tab = 'nilai'; const vn = x.viewPkl(); x.PK.tab = 'rekap'; const vr = x.viewPkl();
    T('tombol PDF ada di tab Nilai (per siswa dan semua) dan tab Rekap (Nilai, Jurnal)', /pkl-pdf-nilai" data-v="s1"/.test(vn) && /PDF semua nilai/.test(vn) && /pkl-pdf-nilai" data-v="s1">Nilai/.test(vr) && /pkl-pdf-jurnal" data-v="s1">Jurnal/.test(vr));
    d = boot({ peran: 'guru' }); d.ctx.PK.D.nilai.push({ id: 'n1', sid: 's1', tp1: 80 }); d.klik('pkl-pdf-nilai', { v: 's1' });
    T('pustaka PDF belum termuat: pesan, tanpa galat', d.log.toast.some((m) => /Pustaka PDF/.test(m)));
  }

  console.log('Fungsi foto-drive: aksi getpkl');
  {
    process.env.GOOGLE_CLIENT_ID = 'i'; process.env.GOOGLE_CLIENT_SECRET = 's'; process.env.GOOGLE_REFRESH_TOKEN = 'r'; process.env.APPWRITE_ENDPOINT = 'http://aw/v1'; process.env.APPWRITE_FUNCTION_PROJECT_ID = 'p';
    const fn = (await import('../functions/foto-drive/src/main.js?' + Date.now())).default;
    const aw = []; let docs = {}, labels = ['siswa'], driveHit = 0;
    const asli = globalThis.fetch;
    globalThis.fetch = async (url, opt = {}) => {
      url = String(url);
      if (url.includes('oauth2.googleapis.com')) return { ok: true, status: 200, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
      if (url.includes('googleapis.com/drive/v3/files/')) { driveHit++; return { ok: true, status: 200, headers: { get: () => 'image/jpeg' }, arrayBuffer: async () => Buffer.from([0xff, 0xd8, 0xff, 0x01]) }; }
      if (url.startsWith('http://aw/v1/users/')) { aw.push(url); return { ok: true, status: 200, json: async () => ({ labels }) }; }
      if (url.startsWith('http://aw/v1/databases/tbsm/collections/pkl_catat/documents/')) {
        aw.push({ url, h: opt.headers }); const id = decodeURIComponent(url.split('/').pop()); const dd = docs[id];
        return dd ? { ok: true, status: 200, json: async () => dd } : { ok: false, status: 404, json: async () => ({ message: 'not found' }) };
      }
      throw new Error('fetch tak dikenal: ' + url);
    };
    const jalan = async (body, hdr) => { let out = null, code = 200; await fn({ req: { headers: { 'x-appwrite-user-id': 'u1', ...hdr }, bodyJson: body }, res: { json: (o, c) => { out = o; code = c || 200; return o; } }, error: () => {} }); return { out, code }; };
    docs.DOC1 = { $id: 'DOC1', payload: JSON.stringify({ foto: 'drive:FILEIDABC123' }), $permissions: ['read("user:u1")'] };
    let r = await jalan({ action: 'getpkl', docId: 'DOC1', fileId: 'FILEIDABC123' }, { 'x-appwrite-user-jwt': 'JWT' });
    T('getpkl (JWT): dokumen dibaca atas nama pengguna, foto dikembalikan sebagai data URL', r.out.ok === true && r.out.data.startsWith('data:image/jpeg;base64,') && aw.some((a) => a.h && a.h['X-Appwrite-JWT'] === 'JWT'), r);
    r = await jalan({ action: 'getpkl', docId: 'DOC1', fileId: 'LAINNYAFILE999' }, { 'x-appwrite-user-jwt': 'JWT' });
    T('getpkl: fileId yang tidak sama dengan penanda di dokumen ditolak 404', r.code === 404 && r.out.ok === false);
    const hit = driveHit; r = await jalan({ action: 'getpkl', docId: 'NOPE', fileId: 'FILEIDABC123' }, { 'x-appwrite-user-jwt': 'JWT' });
    T('getpkl: dokumen tidak terbaca (izin Appwrite menolak) tidak menyentuh Drive', r.out.ok === false && driveHit === hit);
    r = await jalan({ action: 'getpkl', docId: '../x', fileId: 'FILEIDABC123' }, { 'x-appwrite-user-jwt': 'JWT' }); T('getpkl: docId tidak valid ditolak 400', r.code === 400);
    r = await jalan({ action: 'getpkl', docId: 'DOC1', fileId: 'pendek' }, { 'x-appwrite-user-jwt': 'JWT' }); T('getpkl: fileId tidak valid ditolak 400', r.code === 400);
    docs.DOC2 = { $id: 'DOC2', payload: JSON.stringify({ foto: 'drive:FILEIDABC123' }), $permissions: ['read("user:lain")'] };
    r = await jalan({ action: 'getpkl', docId: 'DOC2', fileId: 'FILEIDABC123' }, { 'x-appwrite-key': 'KEY' });
    T('getpkl (mode kunci): non-guru yang bukan pemilik ditolak 403', r.code === 403, r);
    labels = ['guru']; r = await jalan({ action: 'getpkl', docId: 'DOC2', fileId: 'FILEIDABC123' }, { 'x-appwrite-key': 'KEY' });
    T('getpkl (mode kunci): guru boleh melihat', r.out.ok === true);
    labels = ['siswa']; r = await jalan({ action: 'getpkl', docId: 'DOC1', fileId: 'FILEIDABC123' }, { 'x-appwrite-key': 'KEY' });
    T('getpkl (mode kunci): pemilik boleh melihat', r.out.ok === true);
    r = await fn({ req: { headers: {}, bodyJson: { action: 'getpkl' } }, res: { json: (o, c) => ({ o, c }) }, error() {} }); T('getpkl tanpa login ditolak 401', r.c === 401);
    globalThis.fetch = asli;
  }

  console.log('Pilihan sistematis (bank-pilihan)');
  {
    const b = boot({ peran: 'guru' }), x = b.ctx;
    x.S.users.push({ id: 's3', nama: 'Cici', peran: 'siswa', kelas: 'XII B', sekolah: 'MEDINA' });
    x.PK.D.tempat.push(tempat({ id: 'tp1', nama: 'PT Maju Motor', kota: 'Bandung', kuota: 2 }), tempat({ id: 'tp2', nama: 'CV Bintang', kota: 'Cimahi', kuota: 1, pks: '', pksSelesai: '', bidang: 'Servis' }), tempat({ id: 'tp3', nama: 'Bengkel Sinar', kota: 'bandung', kuota: 0 }));
    x.PK.D.tugas.push(tugas({ id: 'a1', sid: 's1', tempatId: 'tp2', guruId: 'g1' }));
    x.PK.D.nilai.push({ id: 'n1', sid: 's1', nama: 'Ani', tempatId: 'tp2', tp1: 80, tp2: 80, tp3: 80, tp4: 80 });
    const sel = (h, k) => (h.match(new RegExp('<select data-pkl="' + k + '"[\\s\\S]*?</select>')) || [''])[0];
    b.klik('pkl-new', { k: 'tugas' });
    const f1 = x.viewPkl(), ss = sel(f1, 'sid'), st = sel(f1, 'tempatId');
    T('penempatan baru: judul lembar, kotak Cari paksa, dan kelompok siswa', /data-judul="Pilih siswa"/.test(ss) && /data-cari/.test(ss) && /<optgroup label="Belum ditempatkan">/.test(ss) && /<optgroup label="Sudah punya penempatan aktif">/.test(ss), ss);
    T('siswa yang sudah punya penempatan aktif dinonaktifkan dan keterangannya menyebut tempat', /<option value="s1" data-ket="Sudah aktif di CV Bintang" disabled>/.test(ss) && !/<option value="s2"[^>]*disabled/.test(ss), ss);
    T('pilihan kosong "(pilih siswa)" ada agar bisa dikosongkan', /<option value=""[^>]*>\(pilih siswa\)<\/option>/.test(ss));
    T('tempat: kelompok kuota, keterangan kota dan isi, tempat penuh nonaktif, tanpa kuota tetap bisa dipilih', /<optgroup label="Masih ada kuota">/.test(st) && /<optgroup label="Kuota penuh">/.test(st) && /value="tp2" data-ket="Cimahi · 1\/1 siswa · Perjanjian belum diisi" disabled/.test(st) && /value="tp3"[^>]*>/.test(st) && !/value="tp3"[^>]*disabled/.test(st), st);
    T('keterangan pilihan terpilih tampil di bawah kolom (kosong = tersembunyi)', /<span class="pk-ket" data-pkket hidden><\/span>/.test(f1));
    x.PK.D.tugas.push(tugas({ id: 'a2', sid: 's2', tempatId: 'tp2', guruId: '', status: 'selesai' }));
    x.PK.mode = 'list'; b.klik('pkl-edit', { k: 'tugas', v: 'a1' });
    const f2 = x.viewPkl(), ss2 = sel(f2, 'sid'), st2 = sel(f2, 'tempatId');
    T('ubah penempatan: siswa dan tempat yang sedang terpilih tidak dinonaktifkan', /<option value="s1"[^>]* selected>/.test(ss2) && !/<option value="s1"[^>]*disabled/.test(ss2) && /<option value="tp2"[^>]* selected>/.test(st2) && !/<option value="tp2"[^>]*disabled/.test(st2), [ss2, st2]);
    T('ubah penempatan: keterangan pilihan terpilih terisi', /<span class="pk-ket" data-pkket>Cimahi/.test(f2), f2.match(/pk-ket[^<]*</g));
    T('guru: keterangan jumlah siswa bimbingan aktif', /value="g1" data-ket="1 siswa bimbingan aktif"/.test(sel(f2, 'guruId')) || /data-ket="[^"]*bimbingan aktif"/.test(sel(f2, 'guruId')), sel(f2, 'guruId'));
    x.PK.f = Object.assign({}, x.PK.f, { sid: 'zz', tempatId: 'hilang' });
    const f3 = x.viewPkl();
    T('nilai yang tidak ada lagi tetap tampil sebagai pilihan terpilih (tidak dikosongkan diam-diam)', /value="zz"[^>]* selected>\(siswa tidak ditemukan\)/.test(sel(f3, 'sid')) && /value="hilang"[^>]* selected>\(tempat dihapus\)/.test(sel(f3, 'tempatId')), [sel(f3, 'sid'), sel(f3, 'tempatId')]);
    b.klik('pkl-cancel');
    b.klik('pkl-new', { k: 'nilai' });
    const fn = sel(x.viewPkl(), 'sid');
    T('nilai: siswa dikelompokkan belum dinilai / sudah dinilai (dengan nilai akhir) / belum ditempatkan', /<optgroup label="Sudah dinilai"><option value="s1" data-ket="Nilai akhir 80 · CV Bintang">/.test(fn) && /<optgroup label="Belum ditempatkan">/.test(fn) && /value="s3" data-ket="Belum ditempatkan"/.test(fn), fn);
    b.klik('pkl-cancel');
    b.klik('pkl-new', { k: 'kunjungan' });
    const fk = x.viewPkl(), sk = sel(fk, 'tempatId');
    T('kunjungan: tempat berpenghuni tanpa kunjungan masuk kelompok "Perlu monitoring"', /<optgroup label="Perlu monitoring \(lebih dari 30 hari\)"><option value="tp2" data-ket="Cimahi · 1\/1 siswa · Belum pernah dimonitor">/.test(sk) && /<optgroup label="Belum ada siswa aktif">/.test(sk), sk);
    T('cara kunjungan punya keterangan', /data-judul="Cara monitoring"/.test(sel(fk, 'mode')) && /data-ket="Datang ke tempat PKL"/.test(sel(fk, 'mode')));
    T('status penempatan punya keterangan kuota', /data-ket="Dihitung dalam kuota tempat"/.test(sel(f2, 'status')));
    // pemicu: memilih tempat kunjungan mengisi guru yang membimbing di tempat itu; memilih tempat penempatan mengisi instruktur
    x.PK.f = { tanggal: '2026-11-26', mode: 'luring' }; let r0 = b.log.render;
    b.hs.change.forEach((fx) => fx({ target: { tagName: 'SELECT', value: 'tp2', dataset: { pkl: 'tempatId' } } }));
    T('kunjungan: pilih tempat mengisi guru pembimbing otomatis dan menggambar ulang', x.PK.f.tempatId === 'tp2' && x.PK.f.guruId === 'g1' && b.log.render === r0 + 1, x.PK.f);
    x.PK.f.guruId = 'g9'; r0 = b.log.render;
    b.hs.change.forEach((fx) => fx({ target: { tagName: 'SELECT', value: 'tp1', dataset: { pkl: 'tempatId' } } }));
    T('kunjungan: guru yang sudah dipilih tidak ditimpa', x.PK.f.guruId === 'g9' && b.log.render === r0, x.PK.f);
    x.PK.fk = 'tugas'; x.PK.f = { status: 'aktif' };
    b.hs.change.forEach((fx) => fx({ target: { tagName: 'SELECT', value: 'tp1', dataset: { pkl: 'tempatId' } } }));
    T('penempatan: pilih tempat mengisi instruktur dari tempat', x.PK.f.instruktur === 'Pak Dedi', x.PK.f);
    b.klik('pkl-cancel');

    console.log('Saringan (select) per tab');
    x.PK.tab = 'tugas';
    const t0 = x.viewPkl();
    T('tab Penempatan: baris saringan tempat, kelas, guru, status dengan jumlah di keterangan', /data-pkfilter="tugas:tempat"/.test(t0) && /data-pkfilter="tugas:status"/.test(t0) && /data-judul="Saring: Tempat PKL"/.test(t0) && /data-ket="1 penempatan"/.test(t0), t0.match(/data-pkfilter[^>]*>/g));
    b.hs.change.forEach((fx) => fx({ target: { tagName: 'SELECT', value: 'selesai', dataset: { pkfilter: 'tugas:status' } } }));
    const t1 = x.viewPkl();
    T('saringan status: hanya yang cocok tampil, judul memuat "n dari total", ada tombol setel ulang', x.PK.flt.tugas.status === 'selesai' && /Penempatan siswa \(1 dari 2\)/.test(t1) && /Menampilkan 1 dari 2 penempatan/.test(t1) && /pkl-flt-reset/.test(t1) && /Budi/.test(t1.replace(/<select[\s\S]*?<\/select>/g, '')) && !/<b>Ani<\/b>/.test(t1), x.PK.flt);
    b.klik('pkl-flt-reset', { v: 'tugas' });
    T('setel ulang mengosongkan saringan tab itu', Object.keys(x.PK.flt.tugas).length === 0);
    x.PK.flt.tugas = { tempat: 'tidak-ada' }; const t2 = x.viewPkl();
    T('saringan yang nilainya sudah tidak ada otomatis dikosongkan (tidak menampilkan daftar kosong)', x.PK.flt.tugas.tempat === '' && /Penempatan siswa \(2\)/.test(t2), x.PK.flt.tugas);
    x.PK.tab = 'tempat'; x.PK.flt.tempat = { kota: 'bandung' }; const tt = x.viewPkl();
    T('tab Tempat: kota disatukan tanpa beda huruf besar-kecil (Bandung = bandung), tersaring 2 dari 3', /Daftar tempat PKL \(2 dari 3\)/.test(tt) && /data-ket="2 tempat"/.test(tt) && !/CV Bintang/.test(tt.replace(/<select[\s\S]*?<\/select>/g, '')), tt.match(/Daftar tempat PKL \([^)]*\)/));
    x.PK.flt.tempat = { monitor: 'perlu' }; const tm = x.viewPkl();
    T('tab Tempat: saringan Monitoring memakai aturan 30 hari yang sama dengan ringkasan', /Daftar tempat PKL \(1 dari 3\)/.test(tm) && /CV Bintang/.test(tm), tm.match(/Daftar tempat PKL \([^)]*\)/));
    x.PK.flt.tempat = {};
    x.PK.tab = 'nilai'; x.PK.flt.nilai = {};
    const tn0 = x.viewPkl();
    T('tab Nilai tanpa saringan: tombol tetap "PDF semua nilai"', /PDF semua nilai/.test(tn0) && x.PK.vis.nilai.length === 1);
    x.PK.D.nilai.push({ id: 'n2', sid: 's2', nama: 'Budi', kelas: 'XII', tempatId: 'tp2', tp1: 70 });
    x.PK.flt.nilai = { siswa: 's2' }; const tn1 = x.viewPkl();
    T('tab Nilai disaring: tombol PDF memuat jumlah yang tampil dan hanya mencetak yang tampil', /PDF nilai yang tampil \(1\)/.test(tn1) && JSON.stringify(x.PK.vis.nilai) === '["s2"]', x.PK.vis);
    x.PK.flt.nilai = {};
    x.PK.tab = 'rekap'; x.PK.flt.rekap = { tempat: 'tp2' }; const tr = x.viewPkl();
    T('tab Rekap: tersaring menurut tempat dan tetap memuat tombol Excel', /Rekap PKL per siswa \(1 dari 1\)|Rekap PKL per siswa/.test(tr) && /pkl-xls/.test(tr));
    x.PK.flt.rekap = {};
    x.PK.tab = 'absen'; const ta = x.viewPkl();
    T('tab Absensi: saringan jenis tersedia bersama pemilih tanggal', /data-pkfilter="absen:tipe"/.test(ta) || /Belum ada absen pada tanggal ini/.test(ta));
    const hh = boot({ peran: 'siswa' }), xs = hh.ctx;
    xs.PK.D.tempat.push(tempat({ id: 'tp1', nama: 'PT Maju', kota: 'Bandung', bidang: 'Otomotif' }), tempat({ id: 'tp2', nama: 'CV Bintang', kota: 'Cimahi', bidang: 'Servis' }));
    let sv = xs.viewPkl();
    T('siswa: daftar tempat punya saringan kota dan bidang, tertutup bila belum dibuka', /data-pkfilter="daftar:kota"/.test(sv) && /data-pkfilter="daftar:bidang"/.test(sv) && /<details data-pkd="daftar"><summary>/.test(sv), sv.match(/<details[^>]*>/));
    hh.hs.toggle.forEach((fx) => fx({ target: { getAttribute: (a) => (a === 'data-pkd' ? 'daftar' : null), open: true } }));
    hh.hs.change.forEach((fx) => fx({ target: { tagName: 'SELECT', value: 'cimahi', dataset: { pkfilter: 'daftar:kota' } } }));
    sv = xs.viewPkl();
    T('siswa: daftar tetap terbuka setelah menyaring dan hanya memuat tempat yang cocok', /<details data-pkd="daftar" open>/.test(sv) && /Daftar tempat PKL \(1 dari 2\)/.test(sv) && /CV Bintang/.test(sv.replace(/<select[\s\S]*?<\/select>/g, '')) && !/PT Maju/.test(sv.replace(/<select[\s\S]*?<\/select>/g, '')), sv.match(/Daftar tempat PKL \([^)]*\)/));
  }
  console.log('Judul, tombol Simpan di atas, basmalah');
  {
    const b = boot({ peran: 'guru', ctx: { schNama: () => 'SMKS Medina Bandung' } }), x = b.ctx;
    const v = x.viewPkl();
    T('judul PKL gaya Akademik di paling atas: nama tab, sekolah, dan menu tab', v.indexOf('<div class="pk-judul">') === 0 && /akd-crumb">Praktik Kerja Lapangan<.*<h2>Tempat PKL</.test(v) && /SMKS Medina Bandung/.test(v) && /akd-tabs pk-tabs/.test(v), v.slice(0, 300));
    b.klik('pkl-new', { k: 'tempat' }); x.PK.msg = 'Lengkapi: Nama dunia kerja';
    const f = x.viewPkl(), iS = f.indexOf('data-act="pkl-save"'), iF = f.indexOf('<label class="f">'), iE = f.indexOf('Lengkapi: Nama');
    T('formulir: Simpan dan Batal di atas semua isian, pesan galat tepat di bawahnya, tidak ada tombol Simpan ganda di bawah', iS > -1 && iS < iF && iE > iS && iE < iF && f.split('data-act="pkl-save"').length === 2, [iS, iE, iF]);
    b.klik('pkl-cancel');
    const bs = boot({ peran: 'siswa', ctx: { schNama: () => 'SMKS Medina Bandung' } }), xs = bs.ctx;
    xs.PK.D.tempat.push(tempat()); xs.PK.D.tugas.push(tugas()); xs.PK.msg = ''; xs.PK.mode = 'absen'; xs.PK.f = { tipe: 'masuk', foto: '', cat: '' };
    const a = xs.viewPkl();
    T('form absen: Kirim absen di atas, sebelum pilihan jenis dan selfie', a.indexOf('pkl-absen-kirim') > -1 && a.indexOf('pkl-absen-kirim') < a.indexOf('pkl-tipe') && a.split('pkl-absen-kirim').length === 2);
    const ui = baca('js/ui.js'), css = baca('css/app.css');
    T('bar atas memuat basmalah lengkap dan gayanya ada', /class="bsm" lang="ar" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ<\/p>/.test(ui) && /\.bsm\{/.test(css));
  }
  console.log('Semua <select> PKL lewat pembangun yang sama');
  {
    const src = baca('js/pkl.js');
    T('tidak ada lagi <select> yang dirakit manual di luar pkSelectHtml', (src.match(/'<select/g) || []).length === 1, (src.match(/'<select/g) || []).length);
    const x = boot().ctx;
    const r = x.pkSelectHtml(' data-pkl="a"', [['', 'Kosong'], ['1', 'Satu', 'ket satu', true], { g: 'Grup', o: [{ v: '2', l: 'Dua', ket: '', off: false }] }, { g: 'Grup kosong', o: [] }], '1', { judul: 'Judul <b>', cari: true });
    T('pembangun: judul di-escape, cari, ket, opsi nonaktif yang terpilih tetap bisa dipilih, kelompok kosong dibuang', /data-judul="Judul &lt;b&gt;"/.test(r.html) && /data-cari/.test(r.html) && /<option value="1" data-ket="ket satu" selected>/.test(r.html) && !/Grup kosong/.test(r.html) && r.ket === 'ket satu', r);
    const r2 = x.pkSelectHtml('', [['a', 'A']], 'b', {});
    T('pembangun: nilai di luar daftar ditambahkan sebagai pilihan terpilih', /<option value="b" data-ket="Pilih ulang" selected>\(data tidak ditemukan\)/.test(r2.html), r2.html);
  }

  console.log('Konfigurasi');
  { const bb = boot({ peran: 'guru', cloud: true }); bb.ctx.PK.fk = 'tugas'; bb.ctx.PK.D.tempat.push(tempat({ id: 'tz', kuota: 5 })); bb.ctx.PK.f = { sid: 's2', tempatId: 'tz', mulai: '2026-11-02', selesai: '2027-05-02', status: 'aktif' }; bb.ctx.pkSimpan(); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
    const cd = bb.log.create[0]; T('penempatan terkirim ke pkl tanpa nama siswa (kolom nama kosong, payload tanpa nama)', cd && cd.col === 'pkl' && cd.doc.nama === '' && !/Budi/.test(cd.doc.payload) && cd.doc.sid === 's2', cd); }
  const aw = JSON.parse(baca('appwrite.json')), K = Object.fromEntries(aw.collections.map((c) => [c.$id, c]));
  const P = (id) => K[id].$permissions.map((p) => p.replace(/\\"/g, '"'));
  T('appwrite.json: koleksi pkl, pkl_catat, pkl_nilai ada', !!K.pkl && !!K.pkl_catat && !!K.pkl_nilai);
  T('pkl: semua pengguna boleh baca, hanya guru/admin menulis', P('pkl').includes('read("users")') && !P('pkl').some((p) => /^(create|update|delete)\("users"\)/.test(p)) && P('pkl').includes('create("label:guru")'));
  T('pkl_catat: siswa boleh membuat; document security aktif; baca hanya guru/admin', K.pkl_catat.documentSecurity === true && P('pkl_catat').includes('create("users")') && !P('pkl_catat').includes('read("users")') && P('pkl_catat').includes('read("label:guru")'));
  T('pkl_nilai: tidak ada izin untuk siswa (users)', !P('pkl_nilai').some((p) => /"users"/.test(p)) && K.pkl_nilai.documentSecurity === false);
  const kol = (id) => K[id].attributes.map((a) => a.key).join();
  T('ketiga koleksi punya kolom jenis, sekolah, nama, ts, oleh, sid, tanggal, payload', ['pkl', 'pkl_catat', 'pkl_nilai'].every((id) => kol(id) === 'jenis,sekolah,nama,ts,oleh,sid,tanggal,payload'));
  T('indeks untuk kueri siswa (jenis, sid) ada', K.pkl.indexes.some((i) => i.attributes[0] === 'sid') && K.pkl.indexes.some((i) => i.attributes[0] === 'jenis') && K.pkl_catat.indexes.some((i) => i.attributes[0] === 'sid'));
  T('index.html memuat js/pkl.js', /js\/pkl\.js/.test(baca('index.html')));
  T('menu-dasbor: kelompok Praktik Kerja Lapangan berisi baris pkl', /key:'pkl',label:'Praktik Kerja Lapangan'[^}]*keys:\['pkl'\]/.test(baca('js/menu-peta.js')));
  const m = boot(); T('tab pkl terdaftar di NAVTABS', m.ctx.NAVTABS.includes('pkl'));
  console.log(`\nUji PKL: ${pass} lulus, ${fail} gagal`); process.exit(fail ? 1 : 0);
})();
