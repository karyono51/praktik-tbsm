/* Uji Administrasi Akademik (js/akademik.js): node tools/uji-akademik.mjs
   Mencakup: profil SDM hanya admin, JP dari tugas berlaku, hitung siswa rombel, pemeriksaan konsistensi,
   validasi tugas mengajar, kode TB-xx, tahun ajaran bawaan dan duplikat. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

function boot(opt = {}) {
  const hs = {}, log = { toast: [], conf: [], list: [], put: [], rows: [] };
  const peran = opt.peran || 'admin';
  const users = opt.users || [
    { id: 'g1', nama: 'Guru Satu', roles: ['guru'], sekolah: 'MEDINA', aktif: true },
    { id: 'g2', nama: 'Guru Dua', roles: ['guru'], sekolah: 'MEDINA', aktif: true },
    { id: 's1', nama: 'Siswa A', roles: ['siswa'], sekolah: 'MEDINA', kelas: 'X', aktif: true, username: '26271001' },
    { id: 's2', nama: 'Siswa B', roles: ['siswa'], sekolah: 'MEDINA', kelas: 'X', aktif: false },
    { id: 's3', nama: 'Siswa C', roles: ['siswa'], sekolah: 'MEDINA', kelas: 'XI', aktif: true },
  ];
  const store = {};
  const ctx = {
    console, addEventListener() {}, navigator: { onLine: true }, Math, JSON, Object, Array, Number, String, Date, Promise,
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
    document: { addEventListener(t, f) { hs[t] = f; }, getElementById: () => null, querySelector: () => null },
    ICO: {}, NAVTABS: [], V: { mode: 'list' }, svg: () => '',
    S: { user: { id: peran === 'admin' ? 'adm' : 'g1', role: peran }, users, tab: 'akd-guru' },
    CFG: { DB: 'tbsm' },
    SCH_LIST: { DF: { pendek: 'Darul Fatwa' }, MEDINA: { pendek: 'Medina' } }, SCH_URUT: ['DF', 'MEDINA'],
    can: () => true, actRole: () => peran, isStaff: () => true,
    hasRole: (u, r) => (u.roles || []).indexOf(r) > -1,
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast(m) { log.toast.push(m); }, render() { log.render = (log.render || 0) + 1; },
    uiConfirm(m) { log.conf.push(m); return Promise.resolve(opt.setuju !== false); },
    schAkunOk: () => true, schKode: () => 'MEDINA', ymd: () => '20261122',
    viewKatalog: () => '', doLogout: async () => {}, refreshData: async () => {},
    fromDoc: (d) => ({ ...d, id: d.$id || d.id }),
    Cloud: {
      on: !!opt.cloud,
      db: { createDocument: async (db, col, id, data) => { log.put.push([col, id, data]); return {}; }, updateDocument: async (db, col, id, data) => { log.put.push([col, id, data]); return {}; } },
      list: async (col) => { log.list.push(col); return []; }, remove: async () => true,
    },
    XLSX: { utils: { book_new: () => ({}), json_to_sheet: (r) => { log.rows.push(r); return r; }, book_append_sheet() {} }, writeFile() {} },
  };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(baca('js/akademik-data.js'), ctx);
  vm.runInContext(baca('js/akademik.js'), ctx);
  const klik = async (a, extra = {}) => { await hs.click({ target: { closest: () => ({ dataset: { akd: a, ...extra }, tagName: 'BUTTON' }) } }); };
  return { ctx, log, klik, AKD: ctx.AKD };
}
const tahun = (id, nama, sem, aktif) => ({ id, nama, semester: sem, aktif });
const kelas = (id, nama, tk, o = {}) => ({ id, nama, tingkat: tk, sekolah: 'MEDINA', aktif: true, anggota: [], tahunId: 't1', ...o });
const tugas = (id, g, m, k, jp, o = {}) => ({ id, guruId: g, mapelId: m, kelasId: k, jp, tahunId: 't1', ...o });

/* 1. JP hanya dari tugas yang berlaku */
{
  const { ctx, AKD } = boot();
  AKD.D.tahun = [tahun('t0', '2025/2026', 'Genap', false), tahun('t1', '2026/2027', 'Ganjil', true), tahun('t2', '2026/2027', 'Genap', false)];
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X'), kelas('k2', 'X TSM 2', 'X', { aktif: false }), kelas('k3', 'XI TSM 1', 'XI', { tahunId: 't0' })];
  AKD.D.tugas = [tugas('u1', 'g1', 'm1', 'k1', 4), tugas('u2', 'g1', 'm1', 'k2', 6), tugas('u3', 'g1', 'm1', 'k3', 8, { tahunId: 't0' })];
  T('JP hanya menghitung rombel aktif dan tahun ajaran aktif (4 dari 18)', ctx.akJp('g1') === 4, ctx.akJp('g1'));
  T('tugas rombel arsip tidak berlaku', !ctx.akBerlaku(AKD.D.tugas[1]));
  T('tugas tahun ajaran lalu tidak berlaku', !ctx.akBerlaku(AKD.D.tugas[2]));
  AKD.D.tahun[1].aktif = false; AKD.D.tahun[2].aktif = true;
  T('ganti semester (tahun sama) tidak menghapus tugas', ctx.akJp('g1') === 4, ctx.akJp('g1'));
  AKD.D.tahun[2].aktif = false;
  T('tanpa tahun ajaran aktif, rombel aktif tetap dihitung', ctx.akJp('g1') === 4 + 8, ctx.akJp('g1'));
  AKD.D.tahun[1].aktif = true;
  const h = ctx.akTugasHtml('g1');
  T('daftar tugas menandai yang tidak berlaku', (h.match(/tidak berlaku/g) || []).length === 2, h.match(/tidak berlaku/g));
  T('guru dengan semua tugas tidak berlaku dihitung belum bertugas', (() => { AKD.D.tugas = [tugas('u2', 'g2', 'm1', 'k2', 6)]; return ctx.akCek().find((c) => /Guru belum punya tugas/.test(c.t)).n === 2; })());
}

/* 2. Jumlah siswa rombel: satu hitungan */
{
  const { ctx, AKD, log } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X', { anggota: ['s1', 's2', 'sHilang'] })];
  T('akSiswaRombel: hanya siswa aktif (1 dari 3 id)', ctx.akSiswaRombel(AKD.D.kelas[0]).length === 1);
  S: {
    ctx.S.tab = 'akd-kelas';
    const h = ctx.viewAkdKelas();
    T('kartu Kelas menampilkan 1 siswa', /1 siswa/.test(h) && !/3 siswa/.test(h));
    ctx.akEkspor();
    const rom = log.rows.find((r) => r[0] && 'Jumlah siswa' in r[0]);
    T('Excel Rombel memakai hitungan yang sama', rom && rom[0]['Jumlah siswa'] === 1, rom);
  }
}

/* 3. Pemeriksaan konsistensi */
{
  const { ctx, AKD } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.D.kelas = [
    kelas('k1', 'X TSM 1', 'X', { anggota: ['s1', 's3', 's2', 'sHilang'], waliId: 'g1' }),
    kelas('k2', 'X TSM 2', 'X', { anggota: ['s1'], waliId: 'g2' }),
  ];
  const cek = (t) => ctx.akCek().find((c) => c.t.indexOf(t) === 0);
  const g = cek('Siswa masuk lebih dari satu rombel');
  T('siswa ganda rombel terdeteksi (s1 di dua rombel)', g.n === 1 && /Siswa A/.test(g.list[0]) && g.tone === 'bad', g);
  const b = cek('Tingkat rombel berbeda');
  T('tingkat akun XI di rombel X terdeteksi', b.n === 1 && /Siswa C/.test(b.list[0]), b);
  const h = cek('Anggota rombel yang akunnya');
  T('anggota nonaktif dan hilang terdeteksi (2)', h.n === 2, h);
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X', { anggota: ['s1'], waliId: 'g1' })];
  T('data bersih: ketiga cek baru bernilai OK', [g, b, h].every((_, i) => ['Siswa masuk lebih', 'Tingkat rombel berbeda', 'Anggota rombel yang akunnya'].every((t) => cek(t).n === 0)));
}

/* 4. Validasi tugas mengajar */
{
  const { ctx, AKD, log, klik } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X'), kelas('k2', 'XI TSM 1', 'XI')];
  AKD.D.mapel = [{ id: 'm1', nama: 'Dasar-Dasar Teknik Otomotif', tingkat: ['X'], aktif: true }, { id: 'm2', nama: 'Bahasa Indonesia', tingkat: [], aktif: true }];
  AKD.tg = 'g1';
  const coba = async (f) => { AKD.tgf = { ...f }; const n = AKD.D.tugas.length; log.toast.length = 0; await klik('tg-add'); return { baru: AKD.D.tugas.length - n, toast: log.toast.join('|') }; };
  let r = await coba({ mapelId: 'm1', kelasId: 'k2', jp: 4 });
  T('mapel tingkat X ke rombel XI ditolak', r.baru === 0 && /hanya untuk kelas X/.test(r.toast), r);
  for (const jp of ['', 0, 41, 2.5, -1]) { r = await coba({ mapelId: 'm1', kelasId: 'k1', jp }); T('JP ' + JSON.stringify(jp) + ' ditolak', r.baru === 0 && /1 sampai 40/.test(r.toast), r); }
  r = await coba({ mapelId: 'm1', kelasId: 'k1', jp: 4 });
  T('tugas sah tersimpan dengan JP bilangan bulat', r.baru === 1 && AKD.D.tugas[0].jp === 4 && AKD.D.tugas[0].tahunId === 't1', AKD.D.tugas);
  r = await coba({ mapelId: 'm1', kelasId: 'k1', jp: 4 });
  T('tugas kembar guru yang sama ditolak', r.baru === 0 && /sudah ada/.test(r.toast), r);
  AKD.tg = 'g2';
  r = await coba({ mapelId: 'm1', kelasId: 'k1', jp: 2 });
  T('guru lain di mapel+rombel sama: ada konfirmasi dan tersimpan bila setuju', r.baru === 1 && log.conf.length === 1 && /Guru Satu/.test(log.conf[0]), { r, c: log.conf });
  const b2 = boot({ setuju: false }); b2.AKD.D.tahun = AKD.D.tahun; b2.AKD.D.kelas = AKD.D.kelas; b2.AKD.D.mapel = AKD.D.mapel;
  b2.AKD.D.tugas = [tugas('u1', 'g1', 'm1', 'k1', 4)]; b2.AKD.tg = 'g2'; b2.AKD.tgf = { mapelId: 'm1', kelasId: 'k1', jp: 2 };
  await b2.klik('tg-add');
  T('bila konfirmasi ditolak, tugas tidak ditambah', b2.AKD.D.tugas.length === 1);
  const b3 = boot({ peran: 'guru' }); b3.AKD.tg = 'g1'; b3.AKD.D.kelas = AKD.D.kelas; b3.AKD.D.mapel = AKD.D.mapel;
  b3.AKD.tgf = { mapelId: 'm1', kelasId: 'k1', jp: 4 }; await b3.klik('tg-add');
  T('guru tidak bisa menambah tugas', b3.AKD.D.tugas.length === 0 && /Hanya admin/.test(b3.log.toast.join()));
}

/* 5. Kode TB-xx dan tahun ajaran bawaan */
{
  const { ctx, AKD, log } = boot();
  AKD.loaded = true;
  AKD.D.mapel = [{ id: 'a', kode: 'TB-01', nama: 'Lama A', aktif: true }, { id: 'c', kode: 'TB-03', nama: 'Lama C', aktif: false }];
  ctx.window.BS = ctx.BS = { loaded: true, D: { soal: [{ mapel: 'Mapel Baru X' }, { mapel: 'Mapel Baru Y' }, { mapel: 'Lama A' }] } };
  await ctx.akSinkron();
  const baru = AKD.D.mapel.filter((m) => /Mapel Baru/.test(m.nama)).map((m) => m.kode).sort();
  T('kode baru lanjut dari nomor terbesar (TB-04, TB-05), tidak kembar TB-03', JSON.stringify(baru) === '["TB-04","TB-05"]', baru);
  const kode = AKD.D.mapel.map((m) => m.kode).filter(Boolean);
  T('tidak ada kode mapel ganda', new Set(kode).size === kode.length, kode.filter((k, i) => kode.indexOf(k) !== i));
  T('tahun ajaran bawaan memakai id tetap', AKD.D.tahun.length === 1 && AKD.D.tahun[0].id === 't_20262027_ganjil', AKD.D.tahun.map((t) => t.id));
  const b = boot(); b.AKD.loaded = true; await b.ctx.akSeed();
  T('perangkat admin lain menghasilkan id yang sama (tidak ganda)', b.AKD.D.tahun[0].id === AKD.D.tahun[0].id);
  await b.ctx.akSeed();
  T('seed diulang tidak menambah tahun ajaran', b.AKD.D.tahun.length === 1);
  /* simpan tahun: duplikat ditolak, aktif tunggal */
  const x = boot(); x.AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  x.AKD.form = { k: 'tahun', o: { id: 'tz', nama: '2026/2027', semester: 'Ganjil', aktif: false }, judul: 'x' };
  await x.ctx.akSimpan();
  T('tahun ajaran dan semester sama ditolak', x.AKD.D.tahun.length === 1 && /sudah ada/.test(x.log.toast.join()));
  x.AKD.form = { k: 'tahun', o: { id: 'tg', nama: '2026/2027', semester: 'Genap', aktif: true }, judul: 'x' };
  await x.ctx.akSimpan();
  T('menandai tahun aktif menonaktifkan yang lain (satu aktif)', x.AKD.D.tahun.filter((t) => t.aktif).length === 1 && x.AKD.D.tahun.find((t) => t.aktif).id === 'tg', x.AKD.D.tahun);
}

/* 6. Profil SDM hanya admin */
{
  const g = boot({ peran: 'guru', cloud: true });
  g.AKD.D.guru = [{ id: 'gg1', akunId: 'g1', nip: '1999', nuptk: '2888' }];
  await g.ctx.akLoad();
  T('guru: hanya koleksi akademik yang dibaca, akademik_sdm tidak', JSON.stringify(g.log.list) === '["akademik"]', g.log.list);
  T('guru: salinan profil SDM lama dikosongkan', g.AKD.D.guru.length === 0);
  T('guru: akProfil kosong dan kartu tanpa NIP', g.ctx.akProfil('g1') === null && !/NIP|NUPTK/.test(g.ctx.akGuruCards()));
  T('guru: tombol Ubah/Lihat profil tidak ada', !/data-akd="profil"/.test(g.ctx.akGuruCards()));
  const a = boot({ cloud: true });
  await a.ctx.akLoad();
  T('admin: kedua koleksi dibaca', a.log.list.includes('akademik') && a.log.list.includes('akademik_sdm'), a.log.list);
  a.AKD.D.guru = [{ id: 'gg1', akunId: 'g1', nip: '1999', nuptk: '2888' }];
  T('admin: kartu menampilkan NIP dan tombol Ubah profil', /NIP 1999/.test(a.ctx.akGuruCards()) && /Ubah profil/.test(a.ctx.akGuruCards()));
  const conf = JSON.parse(baca('appwrite.json'));
  const sdm = (conf.collections || conf.tables).find((c) => c.$id === 'akademik_sdm');
  T('appwrite.json: akademik_sdm tanpa izin baca guru, baca admin ada', !sdm.$permissions.some((p) => /label:guru/.test(p)) && sdm.$permissions.includes('read("label:admin")'), sdm.$permissions);
  const akd = (conf.collections || conf.tables).find((c) => c.$id === 'akademik');
  T('appwrite.json: akademik tetap dibaca guru dan ditulis admin', akd.$permissions.includes('read("label:guru")') && !akd.$permissions.some((p) => /^(create|update|delete)\("label:guru"\)/.test(p)));
}

console.log('\n' + pass + ' lulus, ' + fail + ' gagal');
process.exit(fail ? 1 : 0);
