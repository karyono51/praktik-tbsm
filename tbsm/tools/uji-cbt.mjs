#!/usr/bin/env node
/* Uji otomatis fungsi server CBT (functions/cbt/src/main.js) memakai Appwrite tiruan di memori.
   Tanpa internet dan tanpa akun Appwrite:  node tools/uji-cbt.mjs
   Yang diuji: mulai (token, kelas, jadwal), simpan, kirim (penilaian, idempoten), batas tebakan token,
   jumlah panggilan ke Appwrite saat banyak siswa mulai, akhiriSemua (batas waktu dan sisa), nilaiUlang (kunci dikoreksi). */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };

/* ---------- Appwrite tiruan ---------- */
const cols = {}, users = {}; let calls = 0, lambat = 0;
const col = (c) => (cols[c] = cols[c] || new Map());
const jenis = {};
globalThis.fetch = async (url, opt) => {
  calls++; { const mm = /collections\/([^/]+)\/documents(\/[^?]+)?/.exec(url); const k = opt.method + ' ' + (mm ? mm[1] + (mm[2] ? '/id' : '') : 'users'); jenis[k] = (jenis[k] || 0) + 1; }
  if (lambat) await new Promise((r) => setTimeout(r, lambat));
  const method = opt.method, m = /\/databases\/[^/]+\/collections\/([^/]+)\/documents(?:\/([^?]+))?/.exec(url), um = /\/users\/([^/?]+)/.exec(url);
  const res = (status, body) => ({ ok: status < 300, status, json: async () => body });
  if (um && !m) { const u = users[decodeURIComponent(um[1])]; return u ? res(200, u) : res(404, { message: 'no user' }); }
  const c = col(m[1]), id = m[2] && decodeURIComponent(m[2]);
  if (method === 'GET' && id) { const d = c.get(id); return d ? res(200, d) : res(404, { message: 'tidak ada' }); }
  if (method === 'GET') {
    let docs = [...c.values()], lim = 25, cur = null;
    for (const q of new URL(url, 'http://x').searchParams.getAll('queries[]').map((x) => JSON.parse(x))) {
      if (q.method === 'equal') docs = docs.filter((d) => (q.attribute === '$id' ? q.values.includes(d.$id) : q.values.includes(d[q.attribute])));
      if (q.method === 'limit') lim = q.values[0];
      if (q.method === 'cursorAfter') cur = q.values[0];
    }
    if (cur) docs = docs.slice(docs.findIndex((d) => d.$id === cur) + 1);
    return res(200, { documents: docs.slice(0, lim), total: docs.length });
  }
  const body = JSON.parse(opt.body || '{}'), now = new Date().toISOString();
  if (method === 'POST') { if (c.has(body.documentId)) return res(409, { message: 'sudah ada' }); const d = Object.assign({ $id: body.documentId, $createdAt: now, $updatedAt: now }, body.data); c.set(d.$id, d); return res(201, d); }
  if (method === 'PATCH') { const d = c.get(id); if (!d) return res(404, { message: 'tidak ada' }); Object.assign(d, body.data, { $updatedAt: now }); return res(200, d); }
  return res(400, { message: 'salah' });
};
process.env.SEB_CONFIG_KEYS = 'a'.repeat(64);   // Config Key uji untuk sesi Wajib SEB
process.env.CBT_BUDGET_MS = '600';   // batas waktu massal dipersingkat agar jalur "sisa" ikut teruji
process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'http://aw/v1'; process.env.APPWRITE_FUNCTION_PROJECT_ID = 'p';
const mod = await import(pathToFileURL(path.join(root, 'functions/cbt/src/main.js')).href);
async function call(uid, body) {
  const r = { status: 200, body: null, json(b, s) { r.body = b; r.status = s || 200; return r; } };
  await mod.cbtHandle({ req: { headers: { 'x-appwrite-user-id': uid, 'x-appwrite-key': 'k' } }, res: r, error: () => {}, body });
  return r;
}
const N = 60;
function siapkan() {
  Object.keys(cols).forEach((k) => delete cols[k]); mod._uji.semuaReset();
  users.g1 = { $id: 'g1', email: 'guru@x.id', labels: ['guru'] };
  col('akun').set('AG', { $id: 'AG', email: 'guru@x.id', nama: 'Guru', aktif: true });
  for (let i = 0; i < N; i++) {
    users['u' + i] = { $id: 'u' + i, email: 's' + i + '@x.id', labels: ['siswa'] };
    col('akun').set('A' + i, { $id: 'A' + i, email: 's' + i + '@x.id', nama: 'Siswa ' + i, kelas: i < N - 1 ? 'XI-A' : 'XI-B', sekolah: 'MEDINA', aktif: true });
  }
  for (let i = 0; i < 30; i++) {
    col('banksoal').set('q' + i, { $id: 'q' + i, aktif: true, tujuan: 'ujian', payload: JSON.stringify({ tipe: 'pg', q: 'Soal ' + i, opts: ['a', 'b', 'c', 'd', 'e'], mapel: 'M' }) });
    col('soal_kunci').set('q' + i, { $id: 'q' + i, payload: JSON.stringify({ kunci: i % 4, bahas: '' }) });
  }
  col('soal_sesi').set('S1', { $id: 'S1', aktif: true, payload: JSON.stringify({ judul: 'UH', durasi: 60, jumlah: 20, kelas: 'XI-A', sekolah: 'MEDINA', tok: true, acak: true, tampil: true }) });
  col('soal_sesi').set('S2', { $id: 'S2', aktif: true, payload: JSON.stringify({ judul: 'Manual', durasi: 30, kelas: 'ALL', pilih: 'manual', ids: ['q1', 'q2', 'q3', 'q4', 'nirada'], acak: false }) });
  col('soal_kunci').set('tk_S1', { $id: 'tk_S1', payload: JSON.stringify({ token: 'ABC123' }) });
}
const benar = (ids) => Object.fromEntries(ids.map((id) => [id, Number(id.slice(1)) % 4]));
const runIds = (rid) => JSON.parse(col('soal_run').get(rid).payload).ids;

console.log('Mulai, simpan, kirim');
siapkan();
let r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'xxxxxx' });
cek('token salah ditolak', r.status === 403 && /Token salah/.test(r.body.error));
r = await call('u0', { action: 'mulai', sesiId: 'S1', token: ' abc123 ' });
cek('token benar (huruf kecil dan spasi dimaafkan) memulai ujian', r.status === 200 && r.body.ids.length === 20, JSON.stringify(r.body).slice(0, 120));
cek('payload ke siswa tidak memuat kunci', !/kunci/.test(JSON.stringify(r.body)));
const rid = r.body.rid;
r = await call('u59', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('siswa kelas lain (XI-B) ditolak', r.status === 403 && /kelas/i.test(r.body.error), r.body.error);
r = await call('u1', { action: 'simpan', rid, ans: {} }); cek('siswa lain tidak boleh menyimpan catatan orang lain', r.status === 403);
r = await call('u0', { action: 'simpan', rid, ans: { [runIds(rid)[0]]: 2 }, cur: 3, pindah: 2 }); cek('simpan berhasil', r.status === 200);
r = await call('u0', { action: 'kirim', rid, ans: benar(runIds(rid)), pindah: 2 });
cek('semua benar = 100', r.status === 200 && r.body.hasil.score === 100 && r.body.hasil.benar === 20, JSON.stringify(r.body).slice(0, 100));
r = await call('u0', { action: 'kirim', rid, ans: {}, pindah: 0 }); cek('kirim ulang idempoten (nilai tidak berubah)', r.body.hasil && r.body.hasil.score === 100);
r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('tidak bisa mengulang setelah selesai', r.status === 409);
r = await call('u2', { action: 'mulai', sesiId: 'S2' }); cek('sesi manual: soal tidak ada dilewati, urutan dijaga', r.status === 200 && r.body.ids.join() === 'q1,q2,q3,q4', r.body.ids && r.body.ids.join());

console.log('Batas tebakan token');
siapkan(); let tolak = 0, lim = 0;
for (let i = 0; i < 14; i++) { const x = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ZZZZ' + (10 + i) }); if (x.status === 429) lim++; if (x.status === 403) tolak++; }
cek('10 tebakan pertama dijawab 403, sisanya 429', tolak === 10 && lim === 4, tolak + '/' + lim);
r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('akun yang dibatasi tetap ditahan walau token benar', r.status === 429);
r = await call('u6', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('akun lain tidak ikut terhambat', r.status === 200);

console.log('Beban: banyak siswa mulai bersamaan');
siapkan(); calls = 0; Object.keys(jenis).forEach((k) => delete jenis[k]);
await Promise.all(Array.from({ length: 40 }, (_, i) => call('u' + i, { action: 'mulai', sesiId: 'S1', token: 'ABC123' })));
if (process.env.RINCI) console.log(jenis);
cek('40 siswa mulai: rata-rata panggilan Appwrite per siswa <= 6', calls / 40 <= 6, (calls / 40).toFixed(1));
calls = 0; const rid2 = 'rS1_A3';
await call('u3', { action: 'kirim', rid: rid2, ans: benar(runIds(rid2)) });
cek('satu pengiriman <= 5 panggilan (cache hangat)', calls <= 5, calls);

console.log('akhiriSemua: batas waktu dan sisa');
siapkan(); lambat = 0;
await Promise.all(Array.from({ length: 40 }, (_, i) => call('u' + i, { action: 'mulai', sesiId: 'S1', token: 'ABC123' })));
for (const d of col('soal_run').values()) d.stop = true;
r = await call('u1', { action: 'akhiriSemua', sesiId: 'S1' }); cek('siswa tidak boleh mengakhiri semua', r.status === 403);
lambat = 120; calls = 0; const t0 = Date.now();
r = await call('g1', { action: 'akhiriSemua', sesiId: 'S1' }); lambat = 0;
cek('berhenti rapi di batas waktu: sebagian ternilai, sisanya dilaporkan', r.status === 200 && r.body.n > 0 && r.body.sisa > 0 && r.body.n + r.body.sisa === 40, JSON.stringify(r.body));
let putaran = 1, rs = r.body;
while (rs.sisa > 0 && rs.n > 0 && putaran < 20) { rs = (await call('g1', { action: 'akhiriSemua', sesiId: 'S1' })).body; putaran++; }
cek('semua 40 peserta ternilai', col('soal_hasil').size === 40, col('soal_hasil').size);
cek('tidak ada hasil ganda bila diulang', (await call('g1', { action: 'akhiriSemua', sesiId: 'S1' })).body.n === 0);

console.log('nilaiUlang: kunci dikoreksi');
siapkan();
col('soal_sesi').set('S3', { $id: 'S3', aktif: true, payload: JSON.stringify({ judul: 'Manual 10', durasi: 30, kelas: 'ALL', pilih: 'manual', ids: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'], acak: false }) });
for (let i = 0; i < 6; i++) await call('u' + i, { action: 'mulai', sesiId: 'S3' });
for (let i = 0; i < 6; i++) { const id = 'rS3_A' + i; await call('u' + i, { action: 'kirim', rid: id, ans: benar(runIds(id)) }); }
const q0 = 'q0', q1 = 'q1';
r = await call('g1', { action: 'nilaiUlang', sesiId: 'S3' }); cek('tanpa perubahan kunci: tidak ada yang diubah', r.status === 200 && r.body.n === 0 && r.body.sisa === 0 && r.body.total === 6, JSON.stringify(r.body));
col('soal_kunci').get(q0).payload = JSON.stringify({ kunci: 3 });   // guru mengoreksi kunci: semua siswa tadi menjawab kunci lama
r = await call('u0', { action: 'nilaiUlang', sesiId: 'S3' }); cek('siswa tidak boleh nilai ulang', r.status === 403);
r = await call('g1', { action: 'nilaiUlang', sesiId: 'S3' });
const h0 = col('soal_hasil').get('hS3_A0');
cek('semua hasil dihitung ulang dengan kunci baru', r.body.n === 6 && h0.score === 90 && h0.benar === 9, JSON.stringify(r.body) + ' skor ' + h0.score);
cek('payload hasil tetap utuh (jawaban dan urutan soal)', JSON.parse(h0.payload).order.length === 10 && Object.keys(JSON.parse(h0.payload).ans).length === 10);
r = await call('g1', { action: 'nilaiUlang', sesiId: 'S3' }); cek('nilai ulang kedua kali stabil (tidak ada perubahan)', r.body.n === 0);
col('banksoal').delete(q1);   // soal dihapus setelah ujian: nilai siswa tidak boleh turun karenanya
r = await call('g1', { action: 'nilaiUlang', sesiId: 'S3' }); cek('hasil yang soalnya hilang dilewati, nilai tidak berubah', r.body.n === 0 && r.body.lewat === 6 && h0.score === 90, JSON.stringify(r.body));

console.log('Aturan bentuk soal TKA dan nilai PG kategori');
siapkan();
const tambah = (id, p) => col('banksoal').set(id, { $id: id, aktif: true, tujuan: 'ujian', payload: JSON.stringify(Object.assign({ q: 'Soal ' + id, mapel: 'M' }, p)) });
tambah('q50', { tipe: 'pg', opts: ['a', 'b', 'c', 'd'] });                                   // 4 pilihan: tidak memenuhi
tambah('q51', { tipe: 'kompleks', opts: ['a', 'b', 'c', 'd', 'e'] });                       // 1 kunci: tidak memenuhi
tambah('q52', { tipe: 'kompleks', opts: ['a', 'b', 'c', 'd', 'e'] });                       // 2 kunci: memenuhi
tambah('q53', { tipe: 'kategori', rows: [['p1'], ['p2'], ['p3']], lab: ['Benar', 'Salah'] }); // 3 pernyataan: memenuhi
tambah('q54', { tipe: 'kategori', rows: [['p1'], ['p2']], lab: ['Benar', 'Salah'] });         // 2 pernyataan: tidak memenuhi
tambah('q55', { tipe: 'kategori', rows: [['p1'], ['p2'], ['p3']], lab: ['Setuju', 'Tidak'] }); // label di luar dua pasang: tidak memenuhi
tambah('q56', { tipe: 'kategori', rows: [['p1'], ['p2'], ['p3']], lab: ['Sesuai', 'Tidak Sesuai'] }); // pasangan kedua: memenuhi
const kunciSoal = { q50: { kunci: 0 }, q51: { kunci: [0] }, q52: { kunci: [0, 1] }, q53: { rk: [true, false, true] }, q54: { rk: [true, false] }, q55: { rk: [true, false, true] }, q56: { rk: [true, false, true] } };
Object.keys(kunciSoal).forEach((id) => col('soal_kunci').set(id, { $id: id, payload: JSON.stringify(kunciSoal[id]) }));
col('soal_sesi').set('S9', { $id: 'S9', aktif: true, payload: JSON.stringify({ judul: 'Aturan', durasi: 30, kelas: 'ALL', pilih: 'manual', ids: ['q50', 'q51', 'q52', 'q53', 'q54', 'q55', 'q56'], acak: false }) });
r = await call('u10', { action: 'mulai', sesiId: 'S9' });
cek('sesi manual: hanya soal yang memenuhi aturan dipakai', r.status === 200 && r.body.ids.join() === 'q52,q53,q56', r.body.ids && r.body.ids.join());
col('soal_sesi').set('S7', { $id: 'S7', aktif: true, payload: JSON.stringify({ judul: 'Otomatis', durasi: 30, kelas: 'ALL', jumlah: 100, acak: true }) });
r = await call('u11', { action: 'mulai', sesiId: 'S7' });
cek('sesi otomatis: soal yang belum memenuhi aturan tidak masuk pool', r.status === 200 && r.body.ids.length === 33 && !['q50', 'q51', 'q54', 'q55'].some((x) => r.body.ids.indexOf(x) > -1), r.body.ids && r.body.ids.length);
col('soal_sesi').set('S8', { $id: 'S8', aktif: true, payload: JSON.stringify({ judul: 'Kategori', durasi: 30, kelas: 'ALL', pilih: 'manual', ids: ['q53'], acak: false }) });
const kat = [['semua benar', [0, 1, 0], 100], ['2 benar, 1 salah (salah mengurangi benar)', [0, 1, 1], 33], ['2 benar, 1 kosong (kosong tidak mengurangi)', [0, 1, null], 67], ['semua salah (nilai tidak negatif)', [1, 0, 1], 0], ['1 benar, 2 salah (nilai tidak negatif)', [0, 0, 1], 0]];
for (let i = 0; i < kat.length; i++) {
  const u = 'u' + (20 + i);
  const m = await call(u, { action: 'mulai', sesiId: 'S8' });
  const k = await call(u, { action: 'kirim', rid: m.body.rid, ans: { q53: kat[i][1] }, pindah: 0 });
  cek('kategori: ' + kat[i][0] + ' = ' + kat[i][2], k.status === 200 && k.body.hasil.score === kat[i][2], k.body.hasil ? k.body.hasil.score : JSON.stringify(k.body));
}
col('soal_sesi').set('S6', { $id: 'S6', aktif: true, payload: JSON.stringify({ judul: 'Kompleks', durasi: 30, kelas: 'ALL', pilih: 'manual', ids: ['q52'], acak: false }) });
const kom = [['kunci lengkap', [0, 1], 100], ['1 kunci benar saja', [0, undefined], 50], ['2 benar, 1 salah', [0, 1, 2], 50], ['1 benar, 1 salah (nilai tidak negatif)', [0, 3], 0]];
for (let i = 0; i < kom.length; i++) {
  const u = 'u' + (30 + i);
  const m = await call(u, { action: 'mulai', sesiId: 'S6' });
  const k = await call(u, { action: 'kirim', rid: m.body.rid, ans: { q52: kom[i][1].filter((x) => x !== undefined) }, pindah: 0 });
  cek('kompleks: ' + kom[i][0] + ' = ' + kom[i][2], k.status === 200 && k.body.hasil.score === kom[i][2], k.body.hasil ? k.body.hasil.score : JSON.stringify(k.body));
}

console.log('\nSoal uraian: nilai sementara dan nilai akhir');
{
  const U = mod._uji, pg = { tipe: 'pg', n: 5, key: { kunci: 1 } }, ur = { tipe: 'uraian', n: 0, maks: 10, bobot: 2, key: { rub: [['a', 10]] } };
  const Qs = { p1: pg, p2: pg, u1: ur }, ids = ['p1', 'p2', 'u1'];
  let g = U.nilai(ids, Qs, { p1: 1, p2: 1, u1: 'jawaban panjang' });
  cek('uraian dijawab tapi belum dinilai: tidak dihitung, ditandai menunggu', g.score === 100 && g.pend === 1, JSON.stringify(g));
  g = U.nilai(ids, Qs, { p1: 1, p2: 0, u1: 'jawaban' }, { u1: { skor: 5 } });
  cek('2 PG (1 benar) + uraian 5/10 bobot 2 = (1 + 1) / 4 = 50', g.score === 50 && g.pend === 0, JSON.stringify(g));
  g = U.nilai(ids, Qs, { p1: 1, p2: 1, u1: 'x' }, { u1: { skor: 10 } });
  cek('uraian skor penuh = 100 dan semua benar', g.score === 100 && g.benar === 3, JSON.stringify(g));
  g = U.nilai(ids, Qs, { p1: 1, p2: 1 });
  cek('uraian tidak dijawab dihitung 0 (bukan menunggu)', g.score === 50 && g.pend === 0, JSON.stringify(g));
  const c = U.cleanAns({ p1: 1, u1: 'teks', u2: '   ' }, ['p1', 'u1', 'u2']);
  cek('cleanAns: teks uraian diterima, teks kosong dibuang', c.u1 === 'teks' && c.u2 === undefined && c.p1 === 1, JSON.stringify(c));
  cek('frac: soal uraian tidak ikut hitungan objektif', U.frac(ur, 'teks') === 0);
  g = U.nilai(['u1'], { u1: ur }, { u1: 'x' }, { u1: { skor: 5, mk: 20 } });
  cek('skor memakai skor maksimum saat dinilai (mk), bukan maks soal sekarang: 5/20 = 25', g.score === 25, JSON.stringify(g));
}

console.log('\nRilis token, proktor, dan log audit');
{
  siapkan();
  users.p1 = { $id: 'p1', email: 'pk@x.id', labels: ['proktor'] };
  col('akun').set('AP', { $id: 'AP', email: 'pk@x.id', nama: 'Proktor', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  users.p2 = { $id: 'p2', email: 'pk2@x.id', labels: ['proktor'] };
  col('akun').set('AP2', { $id: 'AP2', email: 'pk2@x.id', nama: 'Proktor Lain', aktif: true, sekolah: 'LAIN', peran: 'proktor' });
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  const sesi = col('soal_sesi').get('S1'), pj = JSON.parse(sesi.payload); pj.tokR = true; pj.batas = 2; pj.aksi = 'kunci'; sesi.payload = JSON.stringify(pj);
  const auditAksi = () => [...col('audit').values()].map((d) => d.aksi);

  r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('token benar tetapi belum dirilis: ditolak', r.status === 403 && /belum dirilis/.test(r.body.error), r.body.error);
  r = await call('u0', { action: 'rilisToken', sesiId: 'S1', menit: 10 }); cek('siswa tidak boleh merilis token', r.status === 403);
  r = await call('u0', { action: 'pantau', sesiId: 'S1' }); cek('siswa tidak boleh memantau', r.status === 403);
  r = await call('p2', { action: 'rilisToken', sesiId: 'S1', menit: 10 }); cek('proktor sekolah lain ditolak', r.status === 403 && /sekolah/.test(r.body.error), r.body.error);
  r = await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 10 });
  cek('proktor merilis token 10 menit', r.status === 200 && r.body.token === 'ABC123' && r.body.berlaku === 10, JSON.stringify(r.body));
  r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'SALAH1' }); cek('token dirilis tetapi salah tetap ditolak', r.status === 403 && /Token salah/.test(r.body.error), r.body.error);
  r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('token dirilis dan benar: ujian mulai', r.status === 200 && r.body.ids.length === 20, r.body.error);
  const ridA = r.body.rid;

  col('soal_kunci').set('tk_S1', { $id: 'tk_S1', payload: JSON.stringify({ token: 'ABC123', rilis: Date.now() - 11 * 60000, berlaku: 10 }) }); mod._uji.semuaReset();
  r = await call('u1', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('token kedaluwarsa setelah masa berlaku', r.status === 403 && /kedaluwarsa/.test(r.body.error), r.body.error);
  r = await call('u0', { action: 'mulai', sesiId: 'S1' }); cek('siswa yang sudah mulai tetap bisa lanjut tanpa token', r.status === 200 && r.body.resume === true, r.body.error);
  r = await call('g1', { action: 'rilisToken', sesiId: 'S1', menit: 15 }); cek('guru juga bisa merilis ulang', r.status === 200 && r.body.berlaku === 15);
  r = await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 0 }); cek('tutup token: tidak ada token dikembalikan', r.status === 200 && r.body.token === '' && r.body.berlaku === 0, JSON.stringify(r.body));
  r = await call('u2', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('setelah ditutup siswa baru tidak bisa mulai', r.status === 403 && /belum dirilis/.test(r.body.error), r.body.error);
  r = await call('p1', { action: 'rilisToken', sesiId: 'S2', menit: 5 }); cek('sesi tanpa token tidak bisa dirilis', r.status === 400);
  await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 15 });
  r = await call('u3', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('rilis ulang membuka lagi', r.status === 200);
  col('soal_sesi').set('S3', { $id: 'S3', aktif: true, payload: JSON.stringify({ judul: 'Token lama', durasi: 30, kelas: 'ALL', tok: true, pilih: 'manual', ids: ['q1', 'q2'], acak: false }) });
  col('soal_kunci').set('tk_S3', { $id: 'tk_S3', payload: JSON.stringify({ token: 'LAMA11' }) });
  r = await call('u4', { action: 'mulai', sesiId: 'S3', token: 'LAMA11' }); cek('sesi lama tanpa tokR tetap jalan seperti dulu', r.status === 200, r.body.error);

  r = await call('p1', { action: 'pantau', sesiId: 'S1' });
  const pt = r.body.peserta || [], kunci = JSON.stringify(r.body);
  cek('pantau: daftar peserta kelas XI-A (59 siswa)', r.status === 200 && pt.length === 59, pt.length);
  cek('pantau: status mengerjakan dan jumlah terjawab tampil', pt.find((x) => x.sid === 'A0').k === 'on' && pt.find((x) => x.sid === 'A0').tot === 20 && pt.find((x) => x.sid === 'A9').k === 'belum');
  cek('pantau: tanpa jawaban, kunci, atau nilai', !/"ans":\{|kunci|score|payload/.test(kunci));
  cek('pantau: proktor melihat token yang sedang dirilis', r.body.tok.token === 'ABC123' && r.body.tok.sisa > 800 && r.body.tok.wajib === true, JSON.stringify(r.body.tok));
  await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 0 });
  r = await call('p1', { action: 'pantau', sesiId: 'S1' }); cek('pantau: token tidak tampil bila belum dirilis', r.body.tok.token === '' && r.body.tok.sisa === 0);

  const ridP = 'rS1_A0';
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'tambah', detik: 300 }); cek('proktor menambah 5 menit', r.status === 200 && Number(col('soal_run').get(ridP).ext) === 300);
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'tambah', detik: 600 }); cek('tambahan selain 5 atau 15 menit ditolak', r.status === 400);
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'tambah', detik: 900 }); cek('tambahan 15 menit menumpuk (300 + 900)', Number(col('soal_run').get(ridP).ext) === 1200);
  await call('u0', { action: 'simpan', rid: ridP, ans: {}, cur: 0, pindah: 3 });
  r = await call('p1', { action: 'pantau', sesiId: 'S1' }); cek('pindah halaman melewati batas: status terkunci', r.body.peserta.find((x) => x.sid === 'A0').k === 'lock', JSON.stringify(r.body.peserta.find((x) => x.sid === 'A0')));
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'bukaKunci' }); cek('proktor membuka kunci', r.status === 200 && Number(col('soal_run').get(ridP).pb) === 3);
  r = await call('p1', { action: 'pantau', sesiId: 'S1' }); cek('setelah dibuka status kembali mengerjakan', r.body.peserta.find((x) => x.sid === 'A0').k === 'on');
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'akhiri' }); cek('proktor mengakhiri: hanya menghentikan, belum dinilai', r.status === 200 && col('soal_run').get(ridP).stop === true && !col('soal_hasil').get('hS1_A0'));
  r = await call('p1', { action: 'aksiRun', rid: ridP, op: 'hapus' }); cek('op tidak dikenal ditolak', r.status === 400);
  r = await call('u1', { action: 'aksiRun', rid: ridP, op: 'tambah', detik: 300 }); cek('siswa tidak boleh memakai aksiRun', r.status === 403);
  r = await call('p1', { action: 'akhiri', rid: ridP }); cek('proktor tidak boleh menilai (akhiri)', r.status === 403);
  r = await call('p1', { action: 'akhiriSemua', sesiId: 'S1' }); cek('proktor tidak boleh akhiriSemua', r.status === 403);
  r = await call('p1', { action: 'nilaiUlang', sesiId: 'S1' }); cek('proktor tidak boleh nilai ulang', r.status === 403);
  r = await call('g1', { action: 'akhiri', rid: ridP }); cek('guru tetap bisa menilai', r.status === 200 && r.body.hasil);

  r = await call('p1', { action: 'catat', aksi: 'uji.catat', sesiId: 'S1', ket: 'percobaan' }); cek('catat dari proktor diterima', r.status === 200);
  r = await call('p1', { action: 'catat', aksi: 'Ada Spasi' }); cek('nama aksi tidak valid ditolak', r.status === 400);
  r = await call('u1', { action: 'catat', aksi: 'uji.catat' }); cek('siswa tidak boleh mencatat', r.status === 403);
  const A = auditAksi(), ds = [...col('audit').values()];
  cek('audit: rilis, tutup, tambah, buka kunci, akhiri, nilai, klien tercatat', ['token.rilis', 'token.tutup', 'run.tambah', 'run.bukaKunci', 'run.akhiri', 'nilai.akhiri', 'klien.uji.catat'].every((x) => A.includes(x)), A.join());
  cek('audit: aktor, peran, dan nama target terisi', ds.some((d) => d.aksi === 'run.tambah' && d.aktor === 'AP' && d.peran === 'proktor' && d.target === 'Siswa 0') && ds.some((d) => d.aksi === 'token.rilis' && d.peran === 'guru'));
  cek('audit: token tidak pernah ikut tertulis', !JSON.stringify(ds).includes('ABC123'));
  const rusak = col('audit'); cols.audit = undefined; delete cols.audit;
  const orig = globalThis.fetch; globalThis.fetch = async (u, o) => (/collections\/audit\//.test(u) && o.method === 'POST' ? { ok: false, status: 404, json: async () => ({ message: 'koleksi tidak ada' }) } : orig(u, o));
  r = await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 5 }); cek('koleksi audit belum ada: aksi tetap berhasil', r.status === 200 && r.body.token === 'ABC123', JSON.stringify(r.body));
  globalThis.fetch = orig; void rusak;
}

console.log('\nPengikat perangkat (pindah perangkat butuh izin pengawas)');
{
  siapkan();
  users.p1 = { $id: 'p1', email: 'pk@x.id', labels: ['proktor'] };
  col('akun').set('AP', { $id: 'AP', email: 'pk@x.id', nama: 'Proktor', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  const DA = 'perangkatA_123456789', DB2 = 'perangkatB_987654321';
  let r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123', dev: DA }); const rid = r.body.rid;
  cek('mulai mengikat catatan ke perangkat pertama', JSON.parse(col('soal_run').get(rid).payload).dev === DA);
  r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: DA }); cek('lanjut dari perangkat yang sama tanpa token', r.status === 200 && r.body.resume === true, r.body.error);
  r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: DB2 }); cek('perangkat lain tanpa izin ditolak', r.status === 403 && /perangkat lain/.test(r.body.error), r.body.error);
  r = await call('u0', { action: 'mulai', sesiId: 'S1' }); cek('klien lama tanpa kode perangkat ditolak', r.status === 403 && /Segarkan/.test(r.body.error), r.body.error);
  r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: '<x>' }); cek('kode perangkat tidak valid dianggap kosong', r.status === 403);
  r = await call('u1', { action: 'aksiRun', rid, op: 'izinPindah' }); cek('siswa tidak boleh memberi izin pindah', r.status === 403);
  r = await call('p1', { action: 'aksiRun', rid, op: 'izinPindah' }); cek('proktor memberi izin pindah', r.status === 200);
  r = await call('p1', { action: 'pantau', sesiId: 'S1' }); cek('pantau menandai izin yang aktif', (r.body.peserta.find((x) => x.sid === 'A0') || {}).izin > 0, JSON.stringify(r.body.peserta.find((x) => x.sid === 'A0')));
  r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: DB2 }); cek('dengan izin, perangkat baru bisa melanjutkan', r.status === 200 && r.body.resume === true, r.body.error);
  cek('izin terpakai sekali dan perangkat berganti', (() => { const p = JSON.parse(col('soal_run').get(rid).payload); return p.dev === DB2 && p.izin === undefined; })());
  r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: DA }); cek('perangkat lama kini ditolak lagi', r.status === 403);
  r = await call('u0', { action: 'simpan', rid, ans: {}, cur: 0, pindah: 0, dev: DA }); cek('perangkat lama tidak bisa menyimpan lagi', r.status === 409, JSON.stringify(r.body));
  r = await call('u0', { action: 'simpan', rid, ans: {}, cur: 0, pindah: 0, dev: DB2 }); cek('perangkat baru menyimpan normal', r.status === 200);
  r = await call('u0', { action: 'kirim', rid, ans: {}, dev: DA }); cek('perangkat lama tidak bisa mengirim', r.status === 409);
  /* izin kedaluwarsa */
  r = await call('u2', { action: 'mulai', sesiId: 'S2', dev: DA }); const rid2 = r.body.rid;
  const d2 = col('soal_run').get(rid2), p2 = JSON.parse(d2.payload); p2.izin = Date.now() - 1000; d2.payload = JSON.stringify(p2);
  r = await call('u2', { action: 'mulai', sesiId: 'S2', dev: DB2 }); cek('izin yang kedaluwarsa tidak berlaku', r.status === 403);
  /* catatan lama (tanpa dev) */
  const d3 = col('soal_run').get(rid2), p3 = JSON.parse(d3.payload); delete p3.dev; delete p3.izin; d3.payload = JSON.stringify(p3);
  r = await call('u2', { action: 'mulai', sesiId: 'S2', dev: DB2 }); cek('catatan lama tanpa perangkat: terikat ke yang pertama melanjutkan', r.status === 200 && JSON.parse(col('soal_run').get(rid2).payload).dev === DB2);
  const A = [...col('audit').values()].map((d) => d.aksi);
  cek('audit: izin, pindah, dan penolakan tercatat', ['run.izinPindah', 'run.pindahOk', 'run.pindahTolak'].every((x) => A.includes(x)), A.join());
}

console.log('\nRuang dan gelombang');
{
  siapkan();
  users.p1 = { $id: 'p1', email: 'pk@x.id', labels: ['proktor'] };
  col('akun').set('AP', { $id: 'AP', email: 'pk@x.id', nama: 'Proktor 1', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  users.p2 = { $id: 'p2', email: 'pk2@x.id', labels: ['proktor'] };
  col('akun').set('AP2', { $id: 'AP2', email: 'pk2@x.id', nama: 'Proktor 2', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  users.p3 = { $id: 'p3', email: 'pk3@x.id', labels: ['proktor'] };
  col('akun').set('AP3', { $id: 'AP3', email: 'pk3@x.id', nama: 'Proktor 3', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  const sesi = col('soal_sesi').get('S1'), pj = JSON.parse(sesi.payload); pj.tokR = true;
  const lalu = Date.now() - 3600e3, nanti = Date.now() + 3600e3;
  pj.ruang = [
    { id: 'r1', nama: 'Lab 1', gel: '1', pk: 'AP', m: lalu, s: nanti, sis: ['A0', 'A1', 'A2'] },
    { id: 'r2', nama: 'Lab 2', gel: '2', pk: 'AP2', m: nanti, s: nanti + 3600e3, sis: ['A3', 'A4'] }
  ];
  sesi.payload = JSON.stringify(pj);
  await call('g1', { action: 'rilisToken', sesiId: 'S1', menit: 30 });
  let r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123', dev: 'dev_aaaaaaaaaaaa' }); cek('siswa di ruang yang sedang buka bisa mulai', r.status === 200, r.body.error);
  r = await call('u3', { action: 'mulai', sesiId: 'S1', token: 'ABC123', dev: 'dev_bbbbbbbbbbbb' }); cek('gelombang 2 belum dibuka: siswa ditolak', r.status === 403 && /belum dibuka/.test(r.body.error), r.body.error);
  r = await call('u10', { action: 'mulai', sesiId: 'S1', token: 'ABC123', dev: 'dev_cccccccccccc' }); cek('siswa tanpa ruang ditolak', r.status === 403 && /belum ditempatkan/.test(r.body.error), r.body.error);
  r = await call('p1', { action: 'pantau', sesiId: 'S1' });
  cek('proktor 1 hanya melihat siswa ruangnya', r.status === 200 && r.body.peserta.map((x) => x.sid).sort().join() === 'A0,A1,A2', r.body.peserta && r.body.peserta.map((x) => x.sid).join());
  cek('peserta membawa nama ruang dan gelombang', r.body.peserta.every((x) => x.ruang === 'Lab 1' && x.gel === '1') && r.body.saya.join() === 'Lab 1');
  r = await call('p3', { action: 'pantau', sesiId: 'S1' }); cek('proktor tanpa ruang ditolak memantau', r.status === 403);
  r = await call('p3', { action: 'rilisToken', sesiId: 'S1', menit: 5 }); cek('proktor tanpa ruang ditolak merilis token', r.status === 403);
  r = await call('p1', { action: 'rilisToken', sesiId: 'S1', menit: 5 }); cek('proktor ber-ruang boleh merilis token', r.status === 200);
  r = await call('g1', { action: 'pantau', sesiId: 'S1' }); cek('guru melihat semua ruang', r.status === 200 && r.body.peserta.length >= 5 && r.body.peserta.some((x) => x.ruang === 'Lab 2'));
  r = await call('p1', { action: 'aksiRun', rid: 'rS1_A0', op: 'tambah', detik: 300 }); cek('proktor bertindak untuk siswa ruangnya', r.status === 200, r.body.error);
  r = await call('p2', { action: 'aksiRun', rid: 'rS1_A0', op: 'tambah', detik: 300 }); cek('proktor ruang lain ditolak', r.status === 403 && /ruangmu/.test(r.body.error), r.body.error);
  r = await call('g1', { action: 'aksiRun', rid: 'rS1_A0', op: 'tambah', detik: 300 }); cek('guru bebas bertindak lintas ruang', r.status === 200);
  /* sesi tanpa ruang tidak berubah */
  r = await call('u20', { action: 'mulai', sesiId: 'S2' }); cek('sesi tanpa ruang tetap berjalan seperti biasa', r.status === 200);
}

console.log('\nDaftar peserta tetap');
{
  siapkan();
  users.p1 = { $id: 'p1', email: 'pk@x.id', labels: ['proktor'] };
  col('akun').set('AP', { $id: 'AP', email: 'pk@x.id', nama: 'Proktor', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  const sesi = col('soal_sesi').get('S1'), pj = JSON.parse(sesi.payload); pj.tok = false; pj.pes = ['A0', 'A1', 'A59']; pj.pesTs = Date.now();   // A59 kelas XI-B, sesi untuk XI-A
  sesi.payload = JSON.stringify(pj);
  let r = await call('u0', { action: 'mulai', sesiId: 'S1', dev: 'dev_aaaaaaaaaaaa' }); cek('peserta di daftar bisa mulai', r.status === 200, r.body.error);
  r = await call('u2', { action: 'mulai', sesiId: 'S1', dev: 'dev_bbbbbbbbbbbb' }); cek('siswa kelas yang sama tapi tidak di daftar ditolak', r.status === 403 && /tidak terdaftar/.test(r.body.error), r.body.error);
  r = await call('u59', { action: 'mulai', sesiId: 'S1', dev: 'dev_cccccccccccc' }); cek('siswa kelas lain yang ditambahkan guru (susulan) boleh', r.status === 200, r.body.error);
  col('akun').get('A1').kelas = 'XII-C'; col('akun').get('A1').aktif = false;
  r = await call('u1', { action: 'mulai', sesiId: 'S1', dev: 'dev_dddddddddddd' }); cek('pindah kelas setelah dibekukan tidak mengubah hak ikut', r.status === 200 || /tidak aktif|nonaktif/i.test(r.body.error || ''), r.body.error);
  r = await call('g1', { action: 'pantau', sesiId: 'S1' });
  cek('pantau memakai daftar tetap (3 peserta, termasuk nonaktif dan kelas lain)', r.status === 200 && r.body.peserta.map((x) => x.sid).sort().join() === 'A0,A1,A59', r.body.peserta && r.body.peserta.map((x) => x.sid).join());
  const pj2 = JSON.parse(sesi.payload); delete pj2.pes; sesi.payload = JSON.stringify(pj2); mod._uji.semuaReset();
  r = await call('u2', { action: 'mulai', sesiId: 'S1', dev: 'dev_eeeeeeeeeeee' }); cek('tanpa daftar tetap: kembali dihitung dari kelas', r.status === 200, r.body.error);
}

console.log('\nNomor peserta');
{
  siapkan();
  users.p1 = { $id: 'p1', email: 'pk@x.id', labels: ['proktor'] };
  col('akun').set('AP', { $id: 'AP', email: 'pk@x.id', nama: 'Proktor', aktif: true, sekolah: 'MEDINA', peran: 'proktor' });
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  const sesi = col('soal_sesi').get('S1'), pj = JSON.parse(sesi.payload); pj.tok = false; pj.pes = ['A5', '', 'A2']; pj.nomor = { p: '26-TSM-', d: 3, a: 10 }; sesi.payload = JSON.stringify(pj);
  let r = await call('g1', { action: 'pantau', sesiId: 'S1' });
  const no = Object.fromEntries(r.body.peserta.map((x) => [x.sid, x.no]));
  cek('nomor mengikuti urutan daftar, mulai dari 10, 3 digit, dengan awalan', no.A5 === '26-TSM-010' && no.A2 === '26-TSM-012', JSON.stringify(no));
  cek('celah dijaga: nomor siswa setelah celah tidak bergeser dan celah tidak jadi peserta', r.body.peserta.length === 2);
  r = await call('u5', { action: 'mulai', sesiId: 'S1', dev: 'dev_aaaaaaaaaaaa' }); cek('daftar dengan celah tetap bisa dipakai mulai', r.status === 200, r.body.error);
}

console.log('\nPembatas tebakan token berlapis (database)');
{
  const realNow = Date.now; let geser = 0; Date.now = () => realNow() + geser;
  const salah = async (u, n) => { let last; for (let i = 0; i < n; i++) last = await call(u, { action: 'mulai', sesiId: 'S1', token: 'ZZ' + String(i).padStart(4, '0') }); return last; };
  siapkan();
  let r = await salah('u5', 10);
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('tingkat 1: diblokir walau token benar', r.status === 429 && /Tunggu/.test(r.body.error), r.body.error);
  mod._uji.semuaReset();   // simulasi fungsi restart / instans lain: memori kosong, database tetap
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('blokir tahan restart (disimpan di database)', r.status === 429, r.status + ' ' + r.body.error);
  geser += 6 * 60000; mod._uji.semuaReset();
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'SALAH9' });
  cek('lewat 5 menit: boleh mencoba lagi (403, bukan 429)', r.status === 403, r.status);
  await salah('u5', 9);   // total 10 salah lagi -> tingkat 2
  geser += 6 * 60000; mod._uji.semuaReset();
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('tingkat 2 memblokir 15 menit (6 menit belum cukup)', r.status === 429, r.status);
  geser += 10 * 60000; mod._uji.semuaReset();
  await salah('u5', 10);   // tingkat 3
  geser += 600 * 60000; mod._uji.semuaReset();
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('tingkat 3: terkunci sampai pengawas membuka', r.status === 429 && /dikunci/.test(r.body.error), r.body.error);
  r = await call('g1', { action: 'tebak', sesiId: 'S1' });
  const row = r.body.rows && r.body.rows.find((x) => x.sid === 'A5');
  cek('guru melihat akun terkunci di daftar tebakan', r.status === 200 && row && row.kunci === true && row.lv === 3 && row.nama === 'Siswa 5', JSON.stringify(r.body).slice(0, 160));
  r = await call('u1', { action: 'tebak', sesiId: 'S1' }); cek('siswa tidak boleh melihat daftar tebakan', r.status === 403);
  users.p2 = { $id: 'p2', email: 'pk2@x.id', labels: ['proktor'] }; col('akun').set('AP2', { $id: 'AP2', email: 'pk2@x.id', nama: 'Proktor Lain', aktif: true, sekolah: 'LAIN', peran: 'proktor' });
  r = await call('p2', { action: 'tebak', sesiId: 'S1' }); cek('pengawas sekolah lain ditolak', r.status === 403, r.status + ' ' + r.body.error);
  r = await call('u1', { action: 'bukaTebak', sesiId: 'S1', sid: 'A5' }); cek('siswa tidak boleh membuka blokir', r.status === 403);
  r = await call('g1', { action: 'bukaTebak', sesiId: 'S1', sid: 'A5' });
  cek('guru membuka blokir satu siswa', r.status === 200 && r.body.dibuka === 1, JSON.stringify(r.body));
  r = await call('u5', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  cek('setelah dibuka, token benar diterima', r.status === 200, r.status + ' ' + (r.body.error || ''));
  const aud = [...col('audit').values()].map((a) => a.aksi);
  cek('log audit mencatat blokir dan pembukaan', aud.includes('token.blokir') && aud.includes('token.bukaTebak'), aud.join());
  /* token benar membersihkan catatan salah */
  siapkan(); await salah('u7', 3);
  r = await call('g1', { action: 'tebak', sesiId: 'S1' }); cek('salah 3 kali: tampil di daftar (belum diblokir)', r.body.rows.some((x) => x.sid === 'A7' && x.n === 3 && !x.kunci), JSON.stringify(r.body.rows));
  await call('u7', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
  r = await call('g1', { action: 'tebak', sesiId: 'S1' }); cek('token benar menghapus catatan salah', !r.body.rows.some((x) => x.sid === 'A7'), JSON.stringify(r.body.rows));
  /* banjir tebakan sesi: akun yang sudah salah 3x ke atas diblokir lebih awal */
  siapkan();
  for (let u = 10; u < 40; u++) await salah('u' + u, 4);   // 120 salah di satu sesi
  r = await call('g1', { action: 'tebak', sesiId: 'S1' });
  cek('banjir tebakan: ada akun diblokir sebelum mencapai 10 salah', r.body.rows.some((x) => x.lv >= 1 && x.tot < 10), JSON.stringify(r.body.rows.slice(0, 3)));
  r = await call('u50', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('banjir: akun yang belum pernah salah tidak ikut terhambat', r.status === 200, r.status);
  /* database bermasalah tidak menggagalkan ujian */
  siapkan();
  const f0 = globalThis.fetch; globalThis.fetch = async (u, o) => (/soal_kunci\/(tz_|ti_)/.test(u) ? { ok: false, status: 500, json: async () => ({ message: 'rusak' }) } : f0(u, o));
  r = await call('u8', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('indeks tebakan rusak: siswa tetap bisa mulai', r.status === 200, r.status + ' ' + (r.body.error || ''));
  r = await call('u9', { action: 'mulai', sesiId: 'S1', token: 'SALAH1' }); cek('indeks tebakan rusak: token salah tetap 403', r.status === 403, r.status);
  globalThis.fetch = f0; Date.now = realNow;
}

console.log('\nSEB: penolakan dicatat untuk pengawas');
{
  const crypto = await import('node:crypto'), KEY = 'a'.repeat(64), URL0 = 'https://x.id/praktik/?s=medina';
  const hash = (u, k) => crypto.createHash('sha256').update(u + k).digest('hex');
  siapkan();
  col('soal_sesi').set('S3', { $id: 'S3', aktif: true, payload: JSON.stringify({ judul: 'Ujian SEB', durasi: 30, jumlah: 5, kelas: 'XI-A', sekolah: 'MEDINA', seb: true, acak: false }) });
  let r = await call('u1', { action: 'mulai', sesiId: 'S3', ua: 'Mozilla/5.0 Chrome' });
  cek('bukan SEB: ditolak 403', r.status === 403 && /Safe Exam Browser/.test(r.body.error), r.status);
  r = await call('u2', { action: 'mulai', sesiId: 'S3', ua: 'Mozilla SEB/3.5', sebUrl: URL0, sebCk: hash(URL0, 'b'.repeat(64)) });
  cek('SEB dengan Config Key salah: ditolak 403', r.status === 403, r.status);
  r = await call('u3', { action: 'mulai', sesiId: 'S3', ua: 'Mozilla SEB/3.5', sebUrl: URL0, sebCk: hash(URL0, KEY) });
  cek('SEB dengan Config Key benar: lolos', r.status === 200, r.status + ' ' + (r.body.error || ''));
  r = await call('g1', { action: 'sebTolak', sesiId: 'S3' });
  const bar = (r.body.rows || []);
  cek('pengawas melihat dua siswa ditolak, siswa yang lolos tidak', r.status === 200 && bar.length === 2 && !bar.some((x) => x.sid === 'A3'), JSON.stringify(r.body).slice(0, 200));
  cek('alasan dibedakan: bukan SEB (ua) dan Config Key (ck)', bar.some((x) => x.sid === 'A1' && x.why === 'ua') && bar.some((x) => x.sid === 'A2' && x.why === 'ck'), JSON.stringify(bar));
  cek('catatan memuat nama dan kelas', bar.every((x) => x.nama && x.kelas), JSON.stringify(bar));
  await call('u1', { action: 'mulai', sesiId: 'S3', ua: 'Mozilla/5.0 Chrome' });
  r = await call('g1', { action: 'sebTolak', sesiId: 'S3' });
  cek('percobaan beruntun dalam jeda tidak menulis ulang (hemat database)', r.body.rows.find((x) => x.sid === 'A1').n === 1, JSON.stringify(r.body.rows));
  r = await call('u4', { action: 'sebTolak', sesiId: 'S3' });
  cek('siswa tidak boleh melihat catatan penolakan', r.status === 403, r.status);
  /* database catatan rusak tidak mengubah hasil: tetap 403, bukan 500 */
  const f1 = globalThis.fetch; globalThis.fetch = async (u, o) => (/soal_kunci\/si_/.test(u) ? { ok: false, status: 500, json: async () => ({ message: 'rusak' }) } : f1(u, o));
  r = await call('u5', { action: 'mulai', sesiId: 'S3', ua: 'Mozilla/5.0 Chrome' });
  cek('catatan penolakan gagal ditulis: siswa tetap ditolak dengan 403', r.status === 403 && /Safe Exam Browser/.test(r.body.error), r.status);
  globalThis.fetch = f1;
}

console.log('\nDaftar aksi fungsi (akun-admin hanya meneruskan aksi di CBT_AKSI)');
console.log('\nSesi untuk beberapa kelas');
{
  siapkan();
  for (const [id, d] of col('akun')) if (/^A\d+$/.test(id)) d.peran = 'siswa';
  col('akun').get('A5').kelas = 'XII-C';   // 58 siswa XI-A (A0-A58 tanpa A5), 1 XI-B (A59), 1 XII-C (A5)
  const mk = (kelas) => { col('soal_sesi').set('SM', { $id: 'SM', aktif: true, payload: JSON.stringify({ judul: 'Multi', durasi: 30, jumlah: 3, kelas, sekolah: 'MEDINA', pilih: 'manual', ids: ['q1', 'q2', 'q3'], acak: false }) }); mod._uji.semuaReset(); };
  const mulai = async (u, dv) => call(u, { action: 'mulai', sesiId: 'SM', dev: 'dev_' + dv.padEnd(12, 'x') });
  mk('XI-A,XI-B');
  let r = await mulai('u0', 'a1'); cek('dua kelas: siswa kelas pertama boleh', r.status === 200, r.body && r.body.error);
  r = await mulai('u59', 'a2'); cek('dua kelas: siswa kelas kedua boleh', r.status === 200, r.body && r.body.error);
  r = await mulai('u5', 'a3'); cek('dua kelas: siswa kelas ketiga ditolak', r.status === 403 && /kelas/i.test(r.body.error), r.body && r.body.error);
  mk('XI-B, XII-C');
  r = await mulai('u1', 'a4'); cek('spasi sesudah koma dimaafkan; kelas yang tidak dipilih ditolak', r.status === 403 && /kelas/i.test(r.body.error), r.body && r.body.error);
  r = await mulai('u5', 'a5'); cek('kelas ketiga kini boleh', r.status === 200, r.body && r.body.error);
  mk('XI-A'); col('soal_run').clear(); mod._uji.semuaReset();   // bersihkan ujian berjalan dari langkah sebelumnya
  r = await mulai('u59', 'a6'); cek('satu kelas tetap bekerja seperti semula', r.status === 403 && /kelas/i.test(r.body.error), r.body && r.body.error);
  mk('ALL');
  r = await mulai('u2', 'a7'); cek('ALL tetap membuka semua kelas', r.status === 200, r.body && r.body.error);
  mk('XI-A,XI-B'); mod._uji.semuaReset();
  r = await call('g1', { action: 'pantau', sesiId: 'SM' });
  const kls = {}; (r.body.peserta || []).forEach((x) => { kls[x.kelas] = (kls[x.kelas] || 0) + 1; });
  cek('pantau memuat siswa kedua kelas saja (58 XI-A + 1 XI-B)', r.status === 200 && kls['XI-A'] === 58 && kls['XI-B'] === 1 && !kls['XII-C'], JSON.stringify(kls));
}

{
  const fs = await import('node:fs'), src = fs.readFileSync(path.join(root, 'functions/cbt/src/main.js'), 'utf8');
  const sw = src.slice(src.indexOf('switch (body.action)'), src.indexOf('switch (body.action)') + 3000);
  const aksi = [...sw.matchAll(/case '([A-Za-z]+)':/g)].map((m) => m[1]);
  const tak = aksi.filter((a) => !mod.CBT_AKSI.has(a));
  cek('setiap aksi di fungsi CBT terdaftar di CBT_AKSI (jika tidak, akun-admin menolaknya)', aksi.length > 10 && !tak.length, 'tidak terdaftar: ' + tak.join());
  cek('sebTolak terdaftar', mod.CBT_AKSI.has('sebTolak'));
  cek('salinan di akun-admin sama dengan fungsi CBT', fs.readFileSync(path.join(root, 'functions/akun-admin/src/cbt.js'), 'utf8') === src, 'jalankan: node tools/gabung-cbt.mjs');
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
