import { arsipAbsen, bacaArsip, hapusArsip, gabung, absenSaya, bacaArsipPkl, dokPklArsip, rentang, namaBerkas, pilih, satukan } from '../functions/foto-drive/src/arsip.js';
let gagal = 0; const T = (n, c) => { if (!c) { gagal++; console.log('GAGAL', n); } };
const nolak = (p) => p.then(() => false, () => true);
T('senin sah', rentang('2026-11-16')[1] === '2026-11-22'); T('bukan senin', !rentang('2026-11-17'));
T('nama berkas per rombel', namaBerkas('harian', '2026-11-16', 'DF', 'XII TBSM 1') === 'arsip-absen_harian_2026-11-16_DF_XII-TBSM-1.json');
T('nama berkas tanpa rombel', namaBerkas('pkl', '2026-11-16', 'MEDINA', '') === 'arsip-absen_pkl_2026-11-16_MEDINA_tanpa-rombel.json');
T('nama berkas aman dari karakter aneh', !/['"\\/ ]/.test(namaBerkas('pkl', '2026-11-16', 'DF', "X TSM '1'/../ é")));

/* ---- Drive tiruan: banyak berkas, daftar berhalaman, pencarian nama persis; menghapus berkas Drive = galat ---- */
const drive = { files: new Map(), seq: 0, rusak: false, halaman: 0, gagalProp: false, gagalNama: false };
const res = (b) => ({ ok: true, json: async () => b, text: async () => b });
const taruh = (name, dokumen, props = { kind: 'arsip-absen' }) => { const id = 'f' + (++drive.seq); drive.files.set(id, { id, name, props, isi: JSON.stringify({ dokumen }) }); return id; };
const kosong = () => { drive.files.clear(); drive.rusak = false; drive.halaman = 0; drive.gagalProp = false; drive.gagalNama = false; };
const nama = () => [...drive.files.values()].map((f) => f.name).sort();
const isiBerkas = (n) => JSON.parse([...drive.files.values()].find((f) => f.name === n).isi);
const gfetch = async (u, o = {}) => {
  const url = new URL(u), id = url.pathname.split('/').pop();
  if (o.method === 'POST') { const b = JSON.parse(o.body), nid = 'f' + (++drive.seq); drive.files.set(nid, { id: nid, name: b.name, props: b.appProperties || {}, isi: '' }); return res({ id: nid }); }
  if (o.method === 'PATCH') { drive.files.get(id).isi = o.body; return res({}); }
  if (o.method === 'DELETE') throw new Error('arsip tidak boleh dihapus dari Drive');
  if (url.searchParams.get('alt') === 'media') { const f = drive.files.get(id); return f ? res(drive.rusak ? '{"dokumen":[]}' : f.isi) : { ok: false, status: 404 }; }
  const q = url.searchParams.get('q') || '', ex = /name='([^']+)'/.exec(q);
  if (!ex && /appProperties has/.test(q) && drive.gagalProp) return { ok: false, status: 400, json: async () => ({}), text: async () => '' };
  if (!ex && /name contains/.test(q) && drive.gagalNama) return { ok: false, status: 400, json: async () => ({}), text: async () => '' };
  const L = [...drive.files.values()].filter((f) => ex ? f.name === ex[1] : /appProperties has/.test(q) ? f.props.kind === 'arsip-absen' : f.name.startsWith('arsip-absen_'));
  const off = Number(url.searchParams.get('pageToken') || 0), sz = drive.halaman || 1000;
  return res({ files: L.slice(off, off + sz).map((f) => ({ id: f.id, name: f.name })), nextPageToken: off + sz < L.length ? String(off + sz) : undefined });
};

/* ---- Appwrite tiruan berstatus ---- */
const nf = () => new Error('Appwrite menolak permintaan (404): Document with the requested ID could not be found.');
const idDok = (p) => decodeURIComponent(p.split('/').pop());
const st = { labels: ['admin'], email: 'adm@x', akun: [], kelas: [], data: { observasi: [], pkl_catat: [] }, simpan: new Map(), buta: new Set(), panggilHapus: 0, gagalBaca: false, kelasGalat: false, kueri: [], dibaca: 0, tolak400: false, galat500: false };
/* daftar dokumen seperti Appwrite: equal, greaterThanEqual, limit, cursorAfter; mencatat jumlah dokumen yang dibaca */
const daftarDok = (col, params) => {
  let L = st.data[col] || [], limit = 25, after = null;
  const qs = params.getAll('queries[]').map((x) => JSON.parse(x));
  st.kueri.push(qs);
  qs.forEach((q) => {
    if (q.method === 'greaterThanEqual' && st.tolak400) throw new Error('Appwrite menolak permintaan (400): Invalid query');
    if (q.method === 'greaterThanEqual' && st.galat500) throw new Error('Appwrite menolak permintaan (500): galat');
    if (q.method === 'equal') L = L.filter((d) => q.values.includes(d[q.attribute]));
    else if (q.method === 'greaterThanEqual') L = L.filter((d) => String(d[q.attribute]) >= String(q.values[0]));
    else if (q.method === 'limit') limit = q.values[0];
    else if (q.method === 'cursorAfter') after = q.values[0];
  });
  const mulai = after ? L.findIndex((d) => d.$id === after) + 1 : 0, hasil = L.slice(mulai, mulai + limit);
  st.dibaca += hasil.length;
  return { documents: hasil };
};
const aw = async (p, hd = {}) => {
  if (p.startsWith('/users')) return { labels: st.labels, email: st.email };
  if (p.includes('/collections/akun/documents?')) return { documents: st.akun };
  if (p.includes('/collections/akademik/documents?')) { if (st.kelasGalat) throw new Error('Appwrite menolak permintaan (500): galat'); return { documents: st.kelas }; }
  const m = /\/collections\/(observasi|pkl_catat)\/documents\?/.exec(p);
  if (m) return daftarDok(m[1], new URL('http://x' + p).searchParams);
  const id = idDok(p);
  if (st.gagalBaca && hd['X-Appwrite-Key'] && st.panggilHapus > 0) throw new Error('Appwrite menolak permintaan (502): galat');
  if (!st.simpan.has(id) || (hd['X-Appwrite-JWT'] && st.buta.has(id))) throw nf();
  return st.simpan.get(id);
};
const hapusDok = async (p, hd = {}) => { st.panggilHapus++; const id = idDok(p); if (hd['X-Appwrite-JWT'] && st.buta.has(id)) return; st.simpan.delete(id); };
const h = { Fail: class extends Error {}, accessToken: async () => 't', folderId: async () => 'f', aw, gfetch, hapusDok };
const ulang = () => { st.labels = ['admin']; st.email = 'adm@x'; st.akun = []; st.kelas = []; st.data = { observasi: [], pkl_catat: [] }; st.simpan = new Map(); st.buta = new Set(); st.panggilHapus = 0; st.gagalBaca = false; st.kelasGalat = false; st.kueri = []; st.dibaca = 0; st.tolak400 = false; st.galat500 = false; kosong(); };

/* ================= arsip harian: satu berkas per rombel ================= */
const sesi = (id, tgl, rb, rn, rows, extra = {}) => ({ $id: id, tipe: 'absen', tanggal: tgl, $updatedAt: tgl + 'T05:00:00.000+00:00', $createdAt: '0', payload: JSON.stringify({ rb, rn, rows }), ...extra });
const R = (...ids) => Object.fromEntries(ids.map((i) => [i, { s: 'H' }]));
ulang();
st.akun = [{ $id: 's1', sekolah: 'DF' }, { $id: 's3', sekolah: 'DF' }, { $id: 's9', sekolah: 'MEDINA' }];
st.data.observasi = [sesi('a', '2026-11-17', 'k1', 'X TSM 1', R('s1')), sesi('d', '2026-11-18', 'k2', 'X TSM 2', R('s3')), sesi('b', '2026-11-25', 'k1', 'X TSM 1', R('s1')),
  { ...sesi('c', '2026-11-17', 'k1', 'X TSM 1', R('s1')), tipe: 'ukk' }, sesi('m', '2026-11-17', 'k9', 'X TSM M', R('s9'))];
const jalan = () => arsipAbsen('u', { jenis: 'harian', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h);
const j1 = await jalan();
T('hanya absen DF minggu itu', j1.jumlah === 2);
T('dua rombel = dua berkas, nama berisi sekolah dan rombel', j1.berkas === 2 && nama().join('|') === 'arsip-absen_harian_2026-11-16_DF_X-TSM-1.json|arsip-absen_harian_2026-11-16_DF_X-TSM-2.json');
T('tiap berkas hanya memuat rombelnya', isiBerkas(nama()[0]).dokumen.map((d) => d.$id).join() === 'a' && isiBerkas(nama()[1]).dokumen.map((d) => d.$id).join() === 'd');
T('berkas mencatat sekolah dan rombel', isiBerkas(nama()[0]).sekolah === 'DF' && isiBerkas(nama()[0]).rombel === 'X TSM 1');
T('berkas diberi penanda arsip', [...drive.files.values()].every((f) => f.props.kind === 'arsip-absen'));
const j2 = await jalan();
T('arsip ulang tidak ganda dan tidak menambah berkas', j2.total === 2 && drive.files.size === 2);
drive.rusak = true; T('verifikasi gagal terdeteksi', await nolak(jalan())); drive.rusak = false;
/* berkas lama (belum per rombel) tidak disentuh */
kosong();
const idLama = taruh('arsip-absen_harian_2026-11-16.json', [sesi('a', '2026-11-17', 'k1', 'X TSM 1', R('s1'))]); const lamaSebelum = drive.files.get(idLama).isi;
await jalan();
T('berkas lama utuh setelah arsip per rombel', drive.files.get(idLama).isi === lamaSebelum && drive.files.size === 3);

/* ================= baca arsip harian (gabungan semua berkas) ================= */
ulang();
const arsipDok = (id, g, rows = R('s1')) => ({ $id: id, $updatedAt: '1', $createdAt: '0', tipe: 'absen', pengamatId: g, payload: JSON.stringify({ rows }) });
taruh('arsip-absen_harian_2026-11-16.json', [arsipDok('a', 'g1'), arsipDok('b', 'g2')]);
taruh('arsip-absen_harian_2026-11-16_DF_X-TSM-2.json', [arsipDok('e', 'g1'), arsipDok('a', 'g1')]);
taruh('arsip-absen_harian_2026-11-23_DF_X-TSM-1.json', [arsipDok('z', 'g1')]);
taruh('arsip-absen_pkl_2026-11-16.json', [arsipDok('p', 'g1')]);
taruh('catatan.json', [arsipDok('q', 'g1')]);
st.labels = ['guru'];
const bg = await bacaArsip('g1', { minggu: ['2026-11-16'] }, 'k', h);
T('guru: milik sendiri dari semua berkas minggu itu, tanpa ganda', bg.dokumen.map((d) => d.$id).sort().join() === 'a,e');
T('guru: jenis dan minggu lain tidak ikut', !bg.dokumen.some((d) => ['p', 'q', 'z'].includes(d.$id)));
st.labels = ['admin'];
T('admin: semua sesi minggu itu', (await bacaArsip('u', { minggu: ['2026-11-16', '2026-11-23'] }, 'k', h)).dokumen.length === 4);
drive.halaman = 2;
T('daftar berkas berhalaman terbaca semua', (await bacaArsip('u', { minggu: ['2026-11-16', '2026-11-23'] }, 'k', h)).dokumen.length === 4);
drive.halaman = 0;
st.labels = ['siswa'];
T('siswa tidak boleh baca arsip harian', await nolak(bacaArsip('u', { minggu: ['2026-11-16'] }, 'k', h)));

/* daftar berkas: kueri penanda wajib, kueri awalan nama hanya tambahan */
ulang(); st.labels = ['admin'];
taruh('arsip-absen_harian_2026-11-16.json', [arsipDok('a', 'g1')], {});
taruh('arsip-absen_harian_2026-11-16_DF_X-TSM-1.json', [arsipDok('b', 'g1')]);
T('berkas tanpa penanda tetap ditemukan lewat awalan nama', (await bacaArsip('u', { minggu: ['2026-11-16'] }, 'k', h)).dokumen.length === 2);
drive.gagalNama = true;
T('kueri awalan nama gagal: berkas bertanda tetap terbaca', (await bacaArsip('u', { minggu: ['2026-11-16'] }, 'k', h)).dokumen.map((d) => d.$id).join() === 'b');
drive.gagalNama = false; drive.gagalProp = true;
T('kueri penanda gagal: pembacaan ditolak, bukan diam-diam kosong', await nolak(bacaArsip('u', { minggu: ['2026-11-16'] }, 'k', h)));
drive.gagalProp = false;

/* ================= gabungan dokumen ganda antarberkas ================= */
const g = gabung({ $createdAt: '1', payload: '{"rows":{"s1":{"s":"H"}}}' }, { $createdAt: '2', payload: '{"rows":{"s2":{"s":"H"}}}' });
T('sesi dibuat ulang digabung', g.skor === 2);
T('ganda: yang lebih baru menang', pilih({ $id: 'x', $updatedAt: '1', $createdAt: '0', v: 'lama' }, { $id: 'x', $updatedAt: '2', $createdAt: '0', v: 'baru' }).v === 'baru');
T('ganda: urutan berkas tidak menentukan', pilih({ $id: 'x', $updatedAt: '2', $createdAt: '0', v: 'baru' }, { $id: 'x', $updatedAt: '1', $createdAt: '0', v: 'lama' }).v === 'baru');
T('satukan: satu dokumen per ID', satukan([[{ $id: 'x', $updatedAt: '1' }, { $id: 'y', $updatedAt: '1' }], [{ $id: 'x', $updatedAt: '2' }]]).length === 2);
T('PKL dibuat ulang: yang waktu buatnya lebih baru menang, tidak digabung', pilih({ $id: 'x', $createdAt: '1', jenis: 'absen', payload: '{"a":1}' }, { $id: 'x', $createdAt: '2', jenis: 'absen', payload: '{"b":2}' }).payload === '{"b":2}');

/* ================= hapus dari Appwrite: dibaca dari semua berkas, dibuktikan ================= */
ulang();
st.akun = [{ $id: 's1', sekolah: 'DF' }];
const mk = (id) => ({ $id: id, sid: 's1', jenis: 'absen', $updatedAt: '1', $createdAt: '0' });
const PB = { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, JW = { 'X-Appwrite-JWT': 'jwt' };
const pasang = (...ids) => ids.forEach((i) => st.simpan.set(i, mk(i)));
pasang('x1', 'x2', 'x3');
taruh('arsip-absen_pkl_2026-11-16_DF_XII-TBSM-1.json', [mk('x1'), mk('x2')]);
taruh('arsip-absen_pkl_2026-11-16_DF_XII-TBSM-2.json', [mk('x3'), mk('x1')]);
const r1 = await hapusArsip('u', PB, JW, 'k', h);
T('hapus: dokumen dari dua berkas rombel terhapus nyata dan terbukti', r1.dihapus === 3 && r1.sudah === 0 && r1.gagal === 0 && st.simpan.size === 0);
st.panggilHapus = 0;
const r2 = await hapusArsip('u', PB, JW, 'k', h);
T('hapus ulang: 0 dihapus, 3 sudah terhapus sebelumnya, tanpa panggilan hapus', r2.dihapus === 0 && r2.sudah === 3 && r2.gagal === 0 && st.panggilHapus === 0);
T('hapus ulang: ids lengkap untuk membersihkan salinan lokal', r2.ids.length === 3);
pasang('x1', 'x2', 'x3'); st.buta.add('x2');
const r3 = await hapusArsip('u', PB, JW, 'k', h);
T('yang tak bisa dihapus token admin dilaporkan GAGAL', r3.dihapus === 2 && r3.gagal === 1 && !r3.ids.includes('x2') && st.simpan.has('x2') && r3.sudah === 0);
st.simpan.clear(); st.buta.clear(); st.simpan.set('x1', { ...mk('x1'), $updatedAt: '9' }); st.simpan.set('x2', mk('x2')); st.simpan.set('x3', mk('x3'));
const r4 = await hapusArsip('u', PB, JW, 'k', h);
T('dokumen berubah sejak arsip tidak dihapus', r4.berubah === 1 && r4.dihapus === 2 && st.simpan.has('x1') && !st.simpan.has('x2') && !st.simpan.has('x3'));
T('tanpa kunci fungsi ditolak', await nolak(hapusArsip('u', PB, JW, '', h)));
pasang('x1', 'x2', 'x3'); st.panggilHapus = 0; st.gagalBaca = true;
T('galat selain 404 saat verifikasi tidak dianggap berhasil', await nolak(hapusArsip('u', PB, JW, 'k', h)));
st.gagalBaca = false;
T('minggu tanpa berkas arsip ditolak', await nolak(hapusArsip('u', { ...PB, minggu: '2026-11-09' }, JW, 'k', h)));
st.labels = ['guru'];
T('guru tidak boleh hapus', await nolak(hapusArsip('g1', { minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h)));
st.labels = ['admin'];
/* berkas lama (tanpa rombel) dan berkas per rombel untuk dokumen yang sama: versi terbaru menang, tidak salah hapus */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }];
st.simpan.set('x1', { ...mk('x1'), $updatedAt: '5' });
taruh('arsip-absen_pkl_2026-11-16.json', [{ ...mk('x1'), $updatedAt: '1' }]);
taruh('arsip-absen_pkl_2026-11-16_DF_XII-TBSM-1.json', [{ ...mk('x1'), $updatedAt: '5' }]);
const r5 = await hapusArsip('u', PB, JW, 'k', h);
T('versi arsip terbaru dipakai untuk pemeriksaan perubahan', r5.dihapus === 1 && r5.berubah === 0);
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }]; st.simpan.set('x1', { ...mk('x1'), $updatedAt: '5' });
taruh('arsip-absen_pkl_2026-11-16.json', [{ ...mk('x1'), $updatedAt: '1' }]);
const r6 = await hapusArsip('u', PB, JW, 'k', h);
T('arsip hanya punya versi lama: dokumen yang sudah berubah tidak dihapus', r6.berubah === 1 && r6.dihapus === 0 && st.simpan.has('x1'));

/* ================= kehadiran siswa dari arsip ================= */
ulang();
const sa = (id, tgl, rows) => ({ $id: id, tipe: 'absen', tanggal: tgl, $updatedAt: '1', $createdAt: '0', payload: JSON.stringify({ rows }) });
taruh('arsip-absen_harian_2026-11-16.json', [sa('lama', '2026-11-17', { s1: { s: 'H', c: 'rahasia' }, s2: { s: 'A' } })]);
taruh('arsip-absen_harian_2026-11-16_DF_X-TSM-1.json', [sa('lain', '2026-11-18', { s1: { s: 'S' } })]);
st.email = 'a@x.id'; st.labels = [];
st.data.observasi = [sa('baru', '2026-11-19', { s1: { s: 'I' } }), sa('orang', '2026-11-19', { s2: { s: 'H' } })];
st.akun = [{ $id: 's1' }];
const y = await absenSaya('auth1', { minggu: '2026-11-16', sid: 's2' }, 'k', h);
T('siswa: arsip semua berkas + aktif, hanya miliknya', y.sesi.length === 3 && y.sesi.map((v) => v.status).sort().join('') === 'HIS');
T('siswa: tanpa catatan dan data siswa lain', !/rahasia|s2/.test(JSON.stringify(y)));

/* ================= PKL: baca arsip dan selfie ================= */
ulang();
const pk = (id, sid, extra = {}) => ({ $id: id, sid, payload: '{}', $updatedAt: '1', $createdAt: '0', ...extra });
taruh('arsip-absen_pkl_2026-11-16.json', [pk('p1', 's1', { $permissions: ['read("user:auth1")'] }), pk('p2', 's2'), pk('p3', 's1', { payload: '{"uji":true}' })]);
taruh('arsip-absen_pkl_2026-11-16_DF_XII-TBSM-1.json', [pk('p1', 's1', { $permissions: ['read("user:auth1")'], $updatedAt: '2' }), pk('p4', 's1', { $permissions: ['read("user:auth1")'] })]);
st.email = 'a@x.id'; st.labels = []; st.akun = [{ $id: 's1', email: 'a@x.id' }];
const pkS = await bacaArsipPkl('auth1', {}, 'k', h);
T('PKL siswa: miliknya, tanpa data uji, tanpa ganda antarberkas', pkS.dokumen.map((d) => d.$id).sort().join() === 'p1,p4');
st.labels = ['guru'];
T('PKL staf: semua tanpa ganda dan tanpa data uji', (await bacaArsipPkl('g', {}, 'k', h)).dokumen.map((d) => d.$id).sort().join() === 'p1,p2,p4');
st.labels = [];
T('selfie arsip: pemilik boleh (dari berkas rombel)', (await dokPklArsip('auth1', 'p4', '2026-11-18', 'k', h)).$id === 'p4');
T('selfie arsip: siswa lain ditolak', await nolak(dokPklArsip('auth2', 'p1', '2026-11-18', 'k', h)));
/* banyak minggu dan berkas: lima minggu per panggilan, daftar berhalaman */
ulang(); st.labels = ['admin'];
for (let m = 0; m < 7; m++) { const t = new Date(Date.parse('2026-08-03T00:00:00Z') + m * 7 * 86400000).toISOString().slice(0, 10); for (let k = 0; k < 15; k++) taruh('arsip-absen_pkl_' + t + '_DF_R' + k + '.json', [pk('d' + m + '-' + k, 's1')]); }
drive.halaman = 20;
const pa = await bacaArsipPkl('u', { mulai: 0 }, 'k', h), pb = await bacaArsipPkl('u', { mulai: pa.lanjut }, 'k', h);
T('PKL: 105 berkas (>100) terbaca lengkap lewat dua panggilan', pa.lanjut === 5 && pb.lanjut === null && pa.dokumen.length + pb.dokumen.length === 105);
drive.halaman = 0;

/* banyak rombel sekaligus (jalur paralel): tiap rombel satu berkas, jumlah dan isi tepat */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }]; st.data.observasi = [];
for (let k = 0; k < 12; k++) st.data.observasi.push(sesi('b' + k, '2026-11-17', 'k' + k, 'XII R' + k, R('s1')));
const banyak = await jalan();
T('12 rombel = 12 berkas, tiap berkas satu sesi', banyak.berkas === 12 && drive.files.size === 12 && banyak.jumlah === 12 && banyak.total === 12 && [...drive.files.values()].every((f) => JSON.parse(f.isi).dokumen.length === 1));
T('hasil per berkas cocok dengan isinya', banyak.daftar.every((b) => isiBerkas(b.nama).dokumen.length === b.jumlah && isiBerkas(b.nama).rombel === b.rombel));
T('hasil per berkas menunjuk berkas Drive yang benar', banyak.daftar.every((b) => drive.files.get(b.fileId) && drive.files.get(b.fileId).name === b.nama));
drive.rusak = true; T('12 rombel: verifikasi gagal terdeteksi', await nolak(jalan())); drive.rusak = false;
/* ================= arsip PKL: dikelompokkan per rombel ================= */
ulang();
st.akun = [{ $id: 's1', sekolah: 'DF' }, { $id: 's2', sekolah: 'DF' }, { $id: 's3', sekolah: 'DF' }, { $id: 'm1', sekolah: 'MEDINA' }];
st.kelas = [{ $id: 'k1', jenis: 'kelas', sekolah: 'DF', nama: 'XII TBSM 1', payload: JSON.stringify({ anggota: ['s1', 's2'] }) },
  { $id: 'k2', jenis: 'kelas', sekolah: 'DF', nama: 'XII TBSM 2', payload: JSON.stringify({ anggota: ['s2'], aktif: false }) },
  { $id: 'k3', jenis: 'kelas', sekolah: 'MEDINA', nama: 'XII TSM M', payload: JSON.stringify({ anggota: ['m1', 's3'] }) },
  { $id: 'k5', jenis: 'kelas', sekolah: 'DF', nama: 'XII TBSM 0 lama', payload: JSON.stringify({ anggota: ['s3'], aktif: false }) }];
/* s3 hanya ada di rombel nonaktif DF dan di rombel sekolah lain: harus tetap "tanpa rombel" */
const pd = (id, sid) => ({ $id: id, jenis: 'absen', sid, tanggal: '2026-11-17', $updatedAt: '2026-11-17T05:00:00.000+00:00', $createdAt: '0', payload: '{}' });
st.data.pkl_catat = [pd('a1', 's1'), pd('a2', 's2'), pd('a3', 's3'), pd('a4', 'm1')];
const ap = await arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h);
T('PKL: hanya DF diarsipkan', ap.jumlah === 3);
T('PKL: dikelompokkan per rombel aktif, tanpa rombel terpisah', nama().join('|') === 'arsip-absen_pkl_2026-11-16_DF_XII-TBSM-1.json|arsip-absen_pkl_2026-11-16_DF_tanpa-rombel.json');
T('PKL: isi berkas sesuai rombel', isiBerkas(nama()[0]).dokumen.map((d) => d.$id).sort().join() === 'a1,a2' && isiBerkas(nama()[1]).dokumen.map((d) => d.$id).join() === 'a3');
const ap2 = await arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'MEDINA' }, {}, 'k', h);
T('PKL Medina: berkas Medina terpisah dari DF', ap2.jumlah === 1 && nama().includes('arsip-absen_pkl_2026-11-16_MEDINA_XII-TSM-M.json') && drive.files.size === 3);
T('PKL: berkas DF tidak tersentuh arsip Medina', isiBerkas('arsip-absen_pkl_2026-11-16_DF_XII-TBSM-1.json').dokumen.length === 2);
/* siswa pindah rombel: arsip ulang tidak menghilangkan dan tidak menggandakan saat dibaca */
st.kelas[0].payload = JSON.stringify({ anggota: ['s1'] }); st.kelas.push({ $id: 'k4', jenis: 'kelas', sekolah: 'DF', nama: 'XII TBSM 3', payload: JSON.stringify({ anggota: ['s2'] }) });
await arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h);
T('pindah rombel: dokumen tetap satu saat dibaca', (await bacaArsipPkl('u', {}, 'k', h)).dokumen.filter((d) => d.$id === 'a2').length === 1);
/* daftar rombel gagal dibaca: arsip berhenti, tidak menulis apa pun */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }]; st.data.pkl_catat = [pd('a1', 's1')]; st.kelasGalat = true;
T('daftar rombel gagal: arsip PKL ditolak dan tidak menulis', await nolak(arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h)) && drive.files.size === 0);
function seninIni() { const d = new Date(Date.now() + 7 * 3600000); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); return d.toISOString().slice(0, 10); }
T('minggu berjalan tidak boleh diarsipkan', await nolak(arsipAbsen('u', { jenis: 'harian', minggu: seninIni(), sekolah: 'DF' }, {}, 'k', h)));
st.labels = ['guru'];
T('guru tidak boleh mengarsipkan', await nolak(arsipAbsen('g', { jenis: 'harian', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h)));
st.labels = ['admin'];

/* ================= hemat baca: sumber dibatasi waktu ubah di server ================= */
const JB = { jenis: 'harian', minggu: '2026-11-16', sekolah: 'DF' };
const ses = (id, tgl, upd) => ({ ...sesi(id, tgl, 'k1', 'X TSM 1', R('s1')), $updatedAt: upd });
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }];
st.data.observasi = [
  ses('lama1', '2026-09-01', '2026-09-01T05:00:00.000+00:00'), ses('lama2', '2026-10-05', '2026-10-05T05:00:00.000+00:00'), ses('lama3', '2026-11-02', '2026-11-02T05:00:00.000+00:00'),
  ses('minggu', '2026-11-17', '2026-11-17T05:00:00.000+00:00'),
  ses('dikoreksi', '2026-11-18', '2026-12-05T05:00:00.000+00:00'),
  ses('dibuatdini', '2026-11-18', '2026-11-10T05:00:00.000+00:00')];
const hm = await arsipAbsen('u', JB, {}, 'k', h);
T('hemat: hanya dokumen dengan waktu ubah sejak 7 hari sebelum Senin dibaca', hm.penyaring === 'tanggal' && hm.dibaca === 3 && st.dibaca === 3);
T('hemat: sesi yang dikoreksi belakangan (waktu ubah sesudah minggunya) tetap terarsip', hm.jumlah === 3 && isiBerkas(nama()[0]).dokumen.some((d) => d.$id === 'dikoreksi'));
T('hemat: sesi yang dibuat 6 hari lebih awal dari tanggalnya tetap terarsip', isiBerkas(nama()[0]).dokumen.some((d) => d.$id === 'dibuatdini'));
T('hemat: riwayat lama tidak dibaca dan tidak masuk arsip', !isiBerkas(nama()[0]).dokumen.some((d) => /^lama/.test(d.$id)));
const kq = st.kueri[0].find((q) => q.method === 'greaterThanEqual');
T('hemat: kueri memakai $updatedAt (jam server) dan batas ISO', kq && kq.attribute === '$updatedAt' && kq.values[0] === '2026-11-09T00:00:00.000Z');
T('hemat: kueri tanpa batas atas', !st.kueri[0].some((q) => q.method === 'lessThanEqual' || q.method === 'lessThan'));
/* kueri ditolak (400): mundur ke pembacaan penuh, hasil tetap benar */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }]; st.tolak400 = true;
st.data.observasi = [ses('lama1', '2026-09-01', '2026-09-01T05:00:00.000+00:00'), ses('minggu', '2026-11-17', '2026-11-17T05:00:00.000+00:00')];
const pn = await arsipAbsen('u', JB, {}, 'k', h);
T('kueri ditolak: pembacaan penuh, sesi minggu itu tetap terarsip', pn.penyaring === 'penuh' && pn.dibaca === 2 && pn.jumlah === 1 && isiBerkas(nama()[0]).dokumen[0].$id === 'minggu');
/* galat selain 400 tidak ditelan */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }]; st.galat500 = true; st.data.observasi = [ses('minggu', '2026-11-17', '2026-11-17T05:00:00.000+00:00')];
T('galat 500 saat membaca: arsip ditolak, tidak mundur diam-diam dan tidak menulis', await nolak(arsipAbsen('u', JB, {}, 'k', h)) && drive.files.size === 0 && st.kueri.length === 1);
/* banyak dokumen: halaman 100 dengan cursor, hanya yang baru dibaca */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }];
st.data.observasi = [];
for (let i = 0; i < 300; i++) st.data.observasi.push(ses('o' + i, '2026-08-03', '2026-08-03T05:00:00.000+00:00'));
for (let i = 0; i < 230; i++) st.data.observasi.push({ ...ses('n' + i, '2026-11-17', '2026-11-17T05:00:00.000+00:00'), payload: JSON.stringify({ rb: 'k1', rn: 'X TSM 1', rows: R('s1') }) });
const bn = await arsipAbsen('u', JB, {}, 'k', h);
T('230 dokumen baru dibaca lewat 3 halaman, 300 dokumen lama tidak dibaca', bn.dibaca === 230 && st.dibaca === 230 && st.kueri.length === 3 && bn.jumlah === 230);
/* PKL: absen minggu itu saja yang dibaca */
ulang(); st.akun = [{ $id: 's1', sekolah: 'DF' }];
st.data.pkl_catat = [{ ...pd('p-lama', 's1'), tanggal: '2026-08-03', $updatedAt: '2026-08-03T05:00:00.000+00:00' }, pd('p-baru', 's1'), { ...pd('p-jurnal', 's1'), jenis: 'jurnal' }];
const hp = await arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h);
T('PKL hemat: hanya absen minggu itu dibaca (jurnal dan riwayat lama tidak)', hp.dibaca === 1 && hp.jumlah === 1 && st.kueri[0].some((q) => q.method === 'equal' && q.attribute === 'jenis') && st.kueri[0].some((q) => q.attribute === '$updatedAt'));

/* ================= pemisahan sekolah (arsip dan hapus) ================= */
ulang();
const akunDua = [{ $id: 's1', sekolah: 'DF' }, { $id: 's2', sekolah: 'MEDINA' }];
st.akun = akunDua;
const dok = [{ $id: 'dfp', sid: 's1', jenis: 'absen', $updatedAt: '1', $createdAt: '0' }, { $id: 'mdp', sid: 's2', jenis: 'absen', $updatedAt: '1', $createdAt: '0' }];
dok.forEach((d) => st.simpan.set(d.$id, d));
taruh('arsip-absen_pkl_2026-11-16.json', dok);
await hapusArsip('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'MEDINA' }, {}, 'k', h);
T('Medina tidak menghapus PKL DF', st.simpan.has('dfp') && !st.simpan.has('mdp'));
T('tanpa sekolah ditolak', await nolak(hapusArsip('u', { jenis: 'pkl', minggu: '2026-11-16' }, {}, 'k', h)));
st.akun = [...akunDua, { $id: 'a1', email: 'adm@x', sekolah: 'MEDINA' }];
T('admin satu sekolah ditolak untuk sekolah lain', await nolak(hapusArsip('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h)));
T('admin satu sekolah ditolak mengarsipkan sekolah lain', await nolak(arsipAbsen('u', { jenis: 'pkl', minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h)));
ulang(); st.akun = akunDua;
const sh = (id, ids) => ({ $id: id, tipe: 'absen', $updatedAt: '1', $createdAt: '0', payload: JSON.stringify({ rows: R(...ids) }) });
taruh('arsip-absen_harian_2026-11-16.json', [sh('hdf', ['s1']), sh('hmd', ['s2']), sh('campur', ['s1', 's2'])]);
[sh('hdf', ['s1']), sh('hmd', ['s2']), sh('campur', ['s1', 's2'])].forEach((d) => st.simpan.set(d.$id, d));
await hapusArsip('u', { minggu: '2026-11-16', sekolah: 'DF' }, {}, 'k', h);
T('harian: hanya sesi sekolah itu, campuran dilewati', !st.simpan.has('hdf') && st.simpan.has('hmd') && st.simpan.has('campur'));
console.log(gagal ? gagal + ' gagal' : 'uji arsip: lolos'); process.exit(gagal ? 1 : 0);
