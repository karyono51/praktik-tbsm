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
    XLSX: null,
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
  T('menu-dasbor: kelompok Praktik Kerja Lapangan berisi baris pkl', /key:'pkl',label:'Praktik Kerja Lapangan'[^}]*keys:\['pkl'\]/.test(baca('js/menu-dasbor.js')));
  const m = boot(); T('tab pkl terdaftar di NAVTABS', m.ctx.NAVTABS.includes('pkl'));
  console.log(`\nUji PKL: ${pass} lulus, ${fail} gagal`); process.exit(fail ? 1 : 0);
})();
