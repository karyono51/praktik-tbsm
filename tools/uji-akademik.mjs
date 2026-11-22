/* Uji Administrasi Akademik (js/akademik.js): node tools/uji-akademik.mjs
   Mencakup: profil SDM hanya admin, JP dari tugas berlaku, hitung siswa rombel, pemeriksaan konsistensi,
   validasi tugas mengajar, kode TB-xx, tahun ajaran bawaan dan duplikat, fokus mapel produktif, validasi simpan (v103). */
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
    document: { addEventListener(t, f) { hs[t] = f; }, getElementById: () => null, querySelector: (q) => (opt.sbody && q === '.sbody' ? opt.sbody : null) },
    ICO: {}, NAVTABS: [], V: { mode: 'list' }, svg: () => '',
    S: { user: { id: peran === 'admin' ? 'adm' : 'g1', role: peran }, users, tab: 'akd-guru' },
    CFG: { DB: 'tbsm' },
    SCH_LIST: { DF: { pendek: 'Darul Fatwa' }, MEDINA: { pendek: 'Medina' } }, SCH_URUT: ['DF', 'MEDINA'],
    can: () => true, actRole: () => peran, isStaff: () => true,
    hasRole: (u, r) => (u.roles || []).indexOf(r) > -1,
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])),
    toast(m) { log.toast.push(m); }, render() { log.render = (log.render || 0) + 1; },
    uiConfirm(m) { log.conf.push(m); return Promise.resolve(opt.setuju !== false); },
    schAkunOk: () => true, schKode: () => 'MEDINA', schCfg: () => ({ nama: 'SMKS Medina Bandung' }), ymd: () => '20261122',
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
  AKD.D.mapel = [{ id: 'm1', nama: 'Dasar-Dasar Teknik Otomotif', tingkat: ['X'], aktif: true, produktif: true }, { id: 'm2', nama: 'Bahasa Indonesia', tingkat: [], aktif: true }];
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

/* 7. Fokus mapel produktif (DDTO, Teknik Sepeda Motor, PKL) */
{
  const { ctx, AKD, log, klik } = boot();
  const seed = ctx.akSeedList();
  const ids = seed.map((m) => m.id);
  T('bawaan: seluruh mapel struktur kurikulum SMK (31 baris: 14 mapel, DDTO dan TSM beserta elemen CP)', seed.length === 31 && ['m_pabp', 'm_mtk', 'm_ddo', 'm_tsm', 'm_pkl', 'm_kka'].every((x) => ids.includes(x)), ids);
  T('bawaan: hanya DDTO, TSM, PKL dan elemennya bertanda produktif (18)', seed.filter((m) => m.produktif === true).length === 18 && seed.filter((m) => m.produktif === false).length === 13);
  /* data lama (tanpa tanda produktif) */
  const lama = (o) => ({ aktif: true, kelompok: 'kejuruan', ...o });
  AKD.D.mapel = [
    lama({ id: 'm_pabp', nama: 'Pendidikan Agama', kelompok: 'umum' }),
    lama({ id: 'm_mtk', nama: 'Matematika', komponen: 'Mata pelajaran kejuruan' }),
    lama({ id: 'm_ddo', nama: 'Dasar-Dasar Teknik Otomotif', komponen: 'Dasar-Dasar Program Keahlian' }),
    lama({ id: 'm_ddo_3', nama: 'Teknik Dasar', induk: 'm_ddo', komponen: 'Dasar-Dasar Program Keahlian' }),
    lama({ id: 'm_pkl', nama: 'Praktik Kerja Lapangan' }),
    lama({ id: 'x1', nama: 'Mapel tambahan', komponen: 'Konsentrasi Keahlian' }),
    lama({ id: 'x2', nama: 'Dipaksa bukan', komponen: 'Konsentrasi Keahlian', produktif: false }),
    lama({ id: 'x3', nama: 'Dipaksa produktif', kelompok: 'umum', produktif: true }),
  ];
  const pr = (id) => ctx.akProduktif(AKD.D.mapel.find((m) => m.id === id));
  T('data lama: umum dan Matematika bukan produktif', !pr('m_pabp') && !pr('m_mtk'));
  T('data lama: DDTO, elemennya, PKL, komponen konsentrasi produktif', pr('m_ddo') && pr('m_ddo_3') && pr('m_pkl') && pr('x1'));
  T('tanda eksplisit mengalahkan turunan', !pr('x2') && pr('x3'));
  /* pemeriksaan */
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  const c = ctx.akCek().find((x) => x.t.indexOf('Mata pelajaran belum punya guru') === 0);
  T('pemeriksaan pengampu hanya menilai mapel produktif', c.list.join('|').indexOf('Pendidikan Agama') < 0 && c.list.join('|').indexOf('Matematika') < 0 && /Praktik Kerja/.test(c.list.join('|')), c);
  /* daftar mapel */
  ctx.S.tab = 'akd-mapel';
  let h = ctx.viewAkdMapel();
  T('daftar mapel: bawaan menampilkan semua mapel SMK per kelompok', /Praktik Kerja Lapangan/.test(h) && /Pendidikan Agama/.test(h) && /Matematika/.test(h));
  T('kelompok: hanya Umum, Kejuruan, dan Pilihan (tanpa kelompok Dasar Program / Kompetensi Keahlian)', /Kelompok Umum/.test(h) && /Kelompok Kejuruan/.test(h) && !/<b>Dasar-Dasar Program Keahlian Teknik Otomotif<\/b>/.test(h) && !/<b>Kompetensi Keahlian Teknik Sepeda Motor<\/b>/.test(h));
  T('chip: Semua, Umum, Kejuruan, Pilihan, Produktif', ['Semua', 'Umum', 'Kejuruan', 'Pilihan', 'Produktif'].every((c) => new RegExp('>' + c + '<').test(h)) && !/Non-produktif/.test(h));
  AKD.fl = 'prod'; h = ctx.viewAkdMapel();
  T('chip Produktif menampilkan mapel produktif saja', /Praktik Kerja Lapangan/.test(h) && !/Pendidikan Agama/.test(h) && !/>Matematika</.test(h));
  AKD.fl = 'umum'; h = ctx.viewAkdMapel();
  T('chip Umum menampilkan Kelompok Umum saja', /Pendidikan Agama/.test(h) && !/Praktik Kerja Lapangan/.test(h));
  AKD.fl = 'ALL';
  /* bank soal */
  const nm = ctx.akMapelNamaMaster();
  T('daftar mapel bank soal hanya produktif', nm.includes('Praktik Kerja Lapangan') && !nm.includes('Matematika') && !nm.includes('Pendidikan Agama'), nm);
  /* tugas */
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X')]; AKD.tg = 'g1';
  const th = ctx.akTugasHtml('g1');
  T('pilihan tugas mengajar hanya mapel produktif', /Praktik Kerja Lapangan/.test(th) && !/Pendidikan Agama/.test(th) && !/value="m_mtk"/.test(th));
  AKD.tgf = { mapelId: 'm_mtk', kelasId: 'k1', jp: 2 }; log.toast.length = 0; await klik('tg-add');
  T('tugas pada mapel non-produktif ditolak dengan petunjuk', AKD.D.tugas.length === 0 && /Mapel produktif/.test(log.toast.join()), log.toast);
  AKD.D.mapel.find((m) => m.id === 'm_mtk').produktif = true;
  await klik('tg-add');
  T('setelah dicentang produktif, tugas diterima', AKD.D.tugas.length === 1);
  AKD.D.mapel.find((m) => m.id === 'm_mtk').produktif = undefined; delete AKD.D.mapel.find((m) => m.id === 'm_mtk').produktif;
  /* formulir: centang produktif */
  AKD.form = { k: 'mapel', o: { id: 'n1', nama: 'Baru', produktif: false, tingkat: [], kelompok: 'kejuruan' }, judul: 'x' };
  const fh = ctx.akFormHtml();
  T('formulir memuat kotak Mapel produktif', /data-akbool="1"/.test(fh) && !/data-akbool="1" checked/.test(fh));
  ctx.akFieldSet({ dataset: { akf: 'produktif', akbool: '1' }, checked: true, type: 'checkbox', value: 'on' });
  T('kotak produktif menyimpan boolean', AKD.form.o.produktif === true);
  AKD.form = null;
  /* arsipkan non-produktif */
  AKD.D.tugas = [tugas('u9', 'g1', 'x2', 'k1', 2)];
  const n0 = ctx.akNonProduktifAktif().map((m) => m.id).sort();
  T('kandidat arsip: non-produktif tanpa tugas (PABP, Matematika)', JSON.stringify(n0) === '["m_mtk","m_pabp"]', n0);
  await klik('arsip-non');
  const st = (id) => AKD.D.mapel.find((m) => m.id === id).aktif;
  T('arsip: non-produktif tanpa tugas diarsipkan, yang bertugas dan produktif tetap', st('m_pabp') === false && st('m_mtk') === false && st('x2') === true && st('m_ddo') === true && st('x3') === true, AKD.D.mapel.map((m) => [m.id, m.aktif]));
  T('arsip: ada dialog konfirmasi', log.conf.length === 1 && /2 mata pelajaran/.test(log.conf[0]), log.conf);
  /* ekspor */
  ctx.akEkspor();
  const mp = log.rows.find((r) => r[0] && 'Produktif' in r[0]);
  T('Excel mata pelajaran punya kolom Produktif Ya/Tidak', mp && mp.some((r) => r.Produktif === 'Ya') && mp.some((r) => r.Produktif === 'Tidak'));
  /* guru tidak bisa mengarsipkan */
  const g = boot({ peran: 'guru' }); g.AKD.D.mapel = [lama({ id: 'm_pabp', nama: 'Pendidikan Agama', kelompok: 'umum' })];
  await g.klik('arsip-non');
  T('guru tidak bisa mengarsipkan mapel', g.AKD.D.mapel[0].aktif === true && /Hanya admin/.test(g.log.toast.join()));
  /* urutan grup: produktif lebih dulu */
  T('urutan grup mengikuti struktur kurikulum: umum, kejuruan, pilihan', ctx.AK_GRUP.map((x) => x[0]).join() === 'umum,kejuruan,pilihan');
  T('DDTO, TSM, dan PKL masuk Kelompok Kejuruan', ['m_ddo', 'm_tsm', 'm_pkl'].every((id) => ctx.akGrupTampil({ id, kelompok: 'kejuruan', komponen: 'Konsentrasi Keahlian' }) === 'kejuruan'));
}

/* 8. Perapian v103: validasi simpan, kata kunci LKPD, anggota rombel */
{
  const { ctx, AKD, log } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  /* kata kunci pendek harus kata utuh */
  T('kata kunci pendek: "ev" tidak cocok dengan "evaluasi"', !ctx.akKataCocok(' evaluasi level pengukuran ', 'ev'));
  T('kata kunci pendek: "ban" tidak cocok dengan "bank soal"', !ctx.akKataCocok(' bank soal ', 'ban'));
  T('kata kunci pendek: "ban" cocok dengan kata utuh "ban"', ctx.akKataCocok(' penggantian ban sepeda motor ', 'ban'));
  T('kata kunci panjang cocok di awal kata (pendingin = pendinginan)', ctx.akKataCocok(' perawatan sistem pendinginan ', 'pendingin'));
  T('kata kunci panjang tidak cocok di tengah kata', !ctx.akKataCocok(' perawatan sistem pendinginan ', 'dingin'));
  ctx.LKPD_MODULES = [{ kelas: 'XI', title: 'Evaluasi level pengukuran', unit: '' }, { kelas: 'XI', title: 'Perawatan sistem pendinginan', unit: '' }, { kelas: 'X', title: 'Perawatan sistem pendinginan', unit: '' }];
  T('modul LKPD terkait: hanya yang benar-benar cocok dan sesuai tingkat (1)', ctx.akModulTerkait({ kata: ['ev', 'pendingin'], tingkat: ['XI'] }) === 1, ctx.akModulTerkait({ kata: ['ev', 'pendingin'], tingkat: ['XI'] }));

  /* simpan mata pelajaran */
  const coba = async (k, o) => { log.toast.length = 0; const n0 = AKD.D[k].length; AKD.form = { k, o, judul: 'x' }; await ctx.akSimpan(); return { toast: log.toast.join(' | '), tambah: AKD.D[k].length - n0 }; };
  AKD.D.mapel = [{ id: 'a1', kode: 'KK-01', nama: 'Teknik Sepeda Motor', kelompok: 'kejuruan', aktif: true, tingkat: [] }, { id: 'a1_1', kode: 'KK-01.1', nama: 'Engine', induk: 'a1', kelompok: 'kejuruan', aktif: true, tingkat: [] }];
  let r = await coba('mapel', { id: 'n1', kode: ' kk-01 ', nama: 'Baru', kelompok: 'kejuruan', tingkat: [], jp: '' });
  T('mapel: kode ganda ditolak (tak peka huruf besar)', r.tambah === 0 && /sudah dipakai/.test(r.toast), r);
  r = await coba('mapel', { id: 'n2', kode: 'KK-09', nama: 'Baru', kelompok: 'kejuruan', tingkat: [], jp: 41 });
  T('mapel: JP 41 ditolak', r.tambah === 0 && /1 sampai 40/.test(r.toast), r);
  r = await coba('mapel', { id: 'n2', kode: 'KK-09', nama: 'Baru', kelompok: 'kejuruan', tingkat: [], jp: 2.5 });
  T('mapel: JP pecahan ditolak', r.tambah === 0 && /1 sampai 40/.test(r.toast), r);
  r = await coba('mapel', { id: 'a1', kode: 'KK-01', nama: 'Teknik Sepeda Motor', kelompok: 'kejuruan', tingkat: [], induk: 'a0', jp: '' });
  T('mapel: yang sudah punya elemen tidak bisa jadi elemen', r.tambah === 0 && /tidak bisa dijadikan elemen/.test(r.toast), r);
  r = await coba('mapel', { id: 'n3', kode: 'KK-09', nama: 'Baru', kelompok: 'kejuruan', tingkat: [], jp: 3 });
  T('mapel: data sah tersimpan', r.tambah === 1 && AKD.D.mapel.find((m) => m.id === 'n3').jp === 3, r);
  r = await coba('mapel', { id: 'n3', kode: 'KK-09', nama: 'Baru diubah', kelompok: 'kejuruan', tingkat: [], jp: '' });
  T('mapel: mengubah mapel sendiri dengan kode yang sama tidak dianggap ganda', r.tambah === 0 && AKD.D.mapel.find((m) => m.id === 'n3').nama === 'Baru diubah', r);

  /* simpan tahun ajaran */
  r = await coba('tahun', { id: 'tx', nama: '2026/2028', semester: 'Genap', aktif: false });
  T('tahun ajaran: 2026/2028 ditolak', r.tambah === 0 && /satu lebih besar/.test(r.toast), r);
  r = await coba('tahun', { id: 'tx', nama: '2026/2027', semester: 'Genap', aktif: false, mulai: '2027-01-05', selesai: '2026-12-31' });
  T('tahun ajaran: selesai sebelum mulai ditolak', r.tambah === 0 && /lebih awal/.test(r.toast), r);
  r = await coba('tahun', { id: 'tx', nama: '2026/2027', semester: 'Genap', aktif: false, mulai: '2027-01-05', selesai: '2027-06-30' });
  T('tahun ajaran: semester Genap yang sah tersimpan', r.tambah === 1, r);

  /* simpan rombel */
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X')];
  r = await coba('kelas', kelas('k9', ' x tsm 1 ', 'X'));
  T('rombel: nama sama pada sekolah dan tahun yang sama ditolak', r.tambah === 0 && /sudah ada/.test(r.toast), r);
  r = await coba('kelas', kelas('k9', 'X TSM 1', 'X', { sekolah: 'DF' }));
  T('rombel: nama sama di sekolah lain diizinkan', r.tambah === 1, r);
  r = await coba('kelas', kelas('k8', 'X TSM 1', 'X', { tahunId: 't2' }));
  T('rombel: nama sama di tahun ajaran lain diizinkan', r.tambah === 1, r);
  r = await coba('kelas', kelas('k7', 'X TSM 1', 'X', { aktif: false }));
  T('rombel arsip dengan nama sama diizinkan', r.tambah === 1, r);
}

/* simpan anggota: tanpa ganda dan tanpa siswa rombel lain */
{
  const { AKD, klik } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X', { anggota: [] }), kelas('k2', 'X TSM 2', 'X', { anggota: ['s1'] })];
  AKD.mem = 'k1'; AKD.memSel = ['s3', 's3', 's1'];
  await klik('ang-simpan', { id: 'k1' });
  T('simpan anggota: duplikat dibuang dan siswa rombel lain tidak ikut', JSON.stringify(AKD.D.kelas[0].anggota) === '["s3"]', AKD.D.kelas[0].anggota);
  T('simpan anggota: status pilihan dibersihkan', AKD.memSel === null && AKD.mem === null);
}

/* 9. Status tampilan dibersihkan saat keluar akun */
{
  const { ctx, AKD } = boot();
  AKD.memSel = ['s1']; AKD.tf = 'XI'; AKD.fl = 'lain'; AKD.q = 'abc'; AKD.sk = 'k1'; AKD.gopen = { dasar: false }; AKD.tgf = { jp: 3 };
  ctx.akClear();
  T('keluar akun: pilihan anggota, filter, pencarian, dan kelompok terbuka kembali awal',
    AKD.memSel === null && AKD.tf === 'ALL' && AKD.fl === 'ALL' && AKD.q === '' && AKD.sk === '' && Object.keys(AKD.gopen).length === 0 && Object.keys(AKD.tgf).length === 0, { memSel: AKD.memSel, tf: AKD.tf, fl: AKD.fl, q: AKD.q });
}

/* 10. Kode sekolah huruf kecil pada akun guru tidak merusak daftar guru */
{
  const { ctx, AKD } = boot({ users: [{ id: 'g1', nama: 'Guru Satu', roles: ['guru'], sekolah: 'medina', aktif: true }, { id: 'g2', nama: 'Guru Dua', roles: ['guru'], sekolah: 'all', aktif: true }, { id: 'g3', nama: 'Guru Tiga', roles: ['guru'], aktif: true }] });
  let h = '', galat = null;
  try { h = ctx.akGuruCards(); } catch (e) { galat = e; }
  T('daftar guru: sekolah huruf kecil/ALL/kosong tidak menimbulkan galat', !galat && /Guru Satu/.test(h) && /Semua sekolah/.test(h) && /Sekolah belum diatur/.test(h), galat && galat.message);
  T('daftar guru: "medina" tampil sebagai nama sekolah', /Medina/.test(h));
}

/* 11. Ekspor tugas memuat tahun ajaran dan status */
{
  const { ctx, AKD, log } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.D.kelas = [kelas('k1', 'X TSM 1', 'X'), kelas('k2', 'X TSM 2', 'X', { aktif: false })];
  AKD.D.mapel = [{ id: 'm1', nama: 'Teknik Sepeda Motor', kelompok: 'kejuruan', aktif: true, produktif: true }];
  AKD.D.tugas = [tugas('u1', 'g1', 'm1', 'k1', 4), tugas('u2', 'g1', 'm1', 'k2', 6)];
  ctx.akEkspor();
  const tg = log.rows.find((r) => r[0] && 'Rombel' in r[0] && 'JP per minggu' in r[0] && 'Guru' in r[0]);
  T('Excel tugas: kolom Tahun ajaran dan Status', tg && tg[0]['Tahun ajaran'] === '2026/2027' && tg[0].Status === 'Berlaku' && tg[1].Status === 'Tidak berlaku', tg);
  ctx.S.tab = 'akd-guru'; ctx.AKD.tg = 'g1';
  T('input JP tugas mengajar: batas bawah 1', /data-aktg="jp"[^>]*min="1"/.test(ctx.akTugasHtml('g1')));
}

/* 12. Tampilan dan submenu (v104) */
{
  const { ctx, AKD } = boot();
  AKD.D.tahun = [tahun('t1', '2026/2027', 'Ganjil', true)];
  AKD.loaded = true;
  for (const t of ctx.AKTABS) {
    ctx.S.tab = t;
    const h = ctx.viewAkd();
    T('halaman ' + t + ' dibungkus .akd dengan kepala dan bilah tab', /^<div class="akd">/.test(h) && /akd-crumb/.test(h) && /class="akd-tabs"/.test(h), h.slice(0, 80));
    const dipilih = h.match(/aria-selected="true"/g) || [];
    T('halaman ' + t + ': tepat satu tab terpilih (' + t + ')', dipilih.length === 1 && new RegExp('data-v="' + t + '" aria-selected="true"').test(h), dipilih.length);
    T('halaman ' + t + ': lima tab dengan role=tab', (h.match(/role="tab"/g) || []).length === 5);
  }
  ctx.S.tab = 'akd-tata';
  const th = ctx.viewAkdTata();
  T('tata kelola: acuan, regulasi, dan katalog dalam satu kartu', (th.match(/class="card akd-ref"/g) || []).length === 1 && /Hak akses data akademik/.test(th) && /Acuan regulasi/.test(th) && /55 unit/.test(th));
  T('tata kelola: baris pemeriksaan memakai kelas akd-cek', /class="akd-cek"/.test(th) && !/padding:5px 0/.test(th));
  const gh = ctx.akGuruCards();
  T('kartu guru: avatar inisial', /class="akd-av"[^>]*>G</.test(gh));
}
{
  const sb = { html: '', pos: '', querySelector: () => null, insertAdjacentHTML(pos, html) { this.pos = pos; this.html += html; } };
  const { ctx } = boot({ sbody: sb });
  ctx.S.tab = 'akd-kelas';
  ctx.render();
  const v = (sb.html.match(/data-v="akd-[a-z]+"/g) || []).map((x) => x.slice(8, -1));
  T('submenu laci: lima baris Administrasi Akademik', JSON.stringify(v) === '["akd-guru","akd-kelas","akd-siswa","akd-mapel","akd-tata"]', v);
  T('submenu laci: hanya baris tab aktif bertanda aria-current', (sb.html.match(/aria-current="page"/g) || []).length === 1 && /data-v="akd-kelas" aria-current="page"/.test(sb.html));
  T('submenu laci: tiap baris punya judul dan keterangan', ['Guru', 'Kelas', 'Daftar siswa', 'Mata pelajaran', 'Tata kelola'].every((j) => sb.html.indexOf('<b>' + j + '</b>') > -1) && /Rombel dan wali kelas/.test(sb.html));
  const g = { html: '', querySelector: () => null, insertAdjacentHTML(pos, html) { this.html += html; } };
  const gb = boot({ peran: 'guru', sbody: g }); gb.ctx.S.tab = 'akd-guru'; gb.ctx.render();
  T('submenu laci untuk guru: keterangan khusus lihat-saja', /Tugas mengajar saya/.test(g.html) && /Tahun ajaran dan pemeriksaan/.test(g.html));
  const md = baca('js/menu-dasbor.js');
  T('menu-dasbor.js: grup Administrasi Akademik memuat kelima tab', ctx.AKTABS.every((t) => new RegExp("key:'akd'[^\\n]*'" + t + "'").test(md)));
  T('menu-dasbor.js: akd-guru tidak lagi tersisa di grup beranda', !/key:'home'[^\n]*akd-guru/.test(md));
}

/* 13. Katalog SKKNI selaras dengan Matriks_LKPD_TSM_Kelas_X-XII_SKKNI.xlsx (judul resmi, v105) */
{
  const { ctx } = boot();
  const k = ctx.AKD_SKKNI;
  T('katalog SKKNI: 55 unit', Object.keys(k).length === 55);
  T('SKKNI 035/036: judul resmi memuat Anti Lock Braking System', /Anti Lock Braking System/.test(k['035']) && /Anti Lock Braking System/.test(k['036']));
  T('SKKNI 037/038: judul resmi memuat Combi Brake System dan Unified Brake System', ['037', '038'].every((c) => /Combi Brake System \(CBS\)\/Unified Brake System \(UBS\)/.test(k[c])));
  T('SKKNI 042: judul resmi memuat Alternating Current Generator dan Smart Motor Generator', /Alternating Current Generator \(ACG\)\/Smart Motor Generator \(SMG\)/.test(k['042']));
  T('SKKNI: setiap judul diawali huruf kapital (gaya judul resmi)', Object.keys(k).every((c) => /^[A-Z]/.test(k[c]) && !/^[a-z]/.test(k[c])), Object.keys(k).filter((c) => !/^[A-Z]/.test(k[c])));
}

/* 14. UKK dan LKPD bukan mata pelajaran (penamaan mapel mengikuti struktur kurikulum / e-Rapor SMK) */
{
  const { ctx } = boot();
  const bukan = (n) => ctx.akBukanMapel({ nama: n });
  T('UKK bukan mapel: judul diawali UKK disaring', bukan('UKK Teknik Sepeda Motor') && bukan('  ukk TSM'));
  T('UKK bukan mapel: Uji Kompetensi Keahlian disaring', bukan('Uji Kompetensi Keahlian Teknik Sepeda Motor'));
  T('LKPD tetap bukan mapel', bukan('LKPD X-1 Pemeriksaan Baterai dan Sistem Starter'));
  T('mapel resmi tidak ikut tersaring', ['Dasar-Dasar Teknik Otomotif', 'Teknik Sepeda Motor', 'Praktik Kerja Lapangan'].every((n) => !bukan(n)));
}

console.log('\n' + pass + ' lulus, ' + fail + ' gagal');
process.exit(fail ? 1 : 0);
