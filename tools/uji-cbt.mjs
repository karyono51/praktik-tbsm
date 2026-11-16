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

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
