#!/usr/bin/env node
/* Uji otomatis mode Neon fungsi CBT (functions/cbt/src/main.js + neon.js) memakai Appwrite dan Postgres tiruan di memori.
   Tanpa internet:  node tools/uji-neon.mjs
   Catatan: Postgres tiruan hanya mengenali bentuk SQL yang dipakai neon.js (tidak menjalankan SQL asli). Kebenaran SQL di Neon
   dibuktikan lewat aksi admin dbUji (siapkan:true) setelah deploy. */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };

/* ---------- Appwrite tiruan (sama seperti uji-cbt, ditambah DELETE) ---------- */
const cols = {}, users = {};
const col = (c) => (cols[c] = cols[c] || new Map());
let awCalls = 0; const hitCol = {};
globalThis.fetch = async (url, opt) => {
  awCalls++; { const mm = /collections\/([^/]+)\/documents/.exec(url); if (mm) hitCol[mm[1]] = (hitCol[mm[1]] || 0) + 1; }
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
  if (method === 'DELETE') { if (!c.delete(id)) return res(404, { message: 'tidak ada' }); return res(204, {}); }
  return res(400, { message: 'salah' });
};

/* ---------- Postgres tiruan: hanya bentuk SQL milik neon.js ---------- */
const pg = { soal_run: new Map(), soal_hasil: new Map(), soal_kunci: new Map() };
let sqlN = 0, sqlMati = false;
const kolom = (t) => (t === 'soal_kunci' ? [] : ['sid', 'sesi_id']);
const baris = (r) => ({ id: r.id, data: JSON.parse(JSON.stringify(r.data)), created_at: r.created_at, updated_at: r.updated_at });
function saring(rows, whereTeks, p) {
  for (const w of whereTeks.split(' AND ').filter(Boolean)) {
    let k;
    if ((k = /^(\w+) = ANY\(\$(\d+)::text\[\]\)$/.exec(w))) { const v = p[+k[2] - 1], c = k[1]; rows = rows.filter((r) => v.includes(String(c === 'id' ? r.id : r[c]))); }
    else if ((k = /^id > \$(\d+)$/.exec(w))) rows = rows.filter((r) => r.id > p[+k[1] - 1]);
    else throw new Error('SQL tiruan tidak mengenal: ' + w);
  }
  return rows;
}
async function sql(text, p) {
  sqlN++;
  if (sqlMati) throw new Error('koneksi putus');
  text = text.replace(/\s+/g, ' ').trim(); let m;
  if (text === 'SELECT 1') return { rows: [{ '?column?': 1 }] };
  if (/^CREATE /.test(text)) return { rows: [] };
  if ((m = /^SELECT count\(\*\)::int AS n FROM (\w+)$/.exec(text))) return { rows: [{ n: pg[m[1]].size }] };
  if ((m = /^SELECT count\(\*\)::int AS n FROM (\w+) WHERE (.*)$/.exec(text))) { const rows = saring([...pg[m[1]].values()], m[2], p); return { rows: [{ n: rows.length }] }; }
  if ((m = /^SELECT id, data, created_at, updated_at FROM (\w+) WHERE id = \$1$/.exec(text))) { const r = pg[m[1]].get(p[0]); return { rows: r ? [baris(r)] : [] }; }
  if ((m = /^INSERT INTO (\w+) \(([^)]*)\) VALUES \(([^)]*)\) ON CONFLICT \(id\) DO NOTHING RETURNING/.exec(text))) {
    const t = m[1], cs = m[2].split(', '), o = {}; cs.forEach((c, i) => { o[c] = p[i]; });
    if (pg[t].has(o.id)) return { rows: [] };
    const now = new Date(), r = { id: o.id, sid: o.sid || null, sesi_id: o.sesi_id || null, sekolah: o.sekolah || null, prodi: o.prodi || null, data: JSON.parse(o.data), created_at: o.created_at ? new Date(o.created_at) : now, updated_at: o.updated_at ? new Date(o.updated_at) : now };
    pg[t].set(r.id, r); return { rows: [baris(r)] };
  }
  if ((m = /^UPDATE (\w+) SET data = data \|\| \$2::jsonb, updated_at = now\(\) WHERE id = \$1 RETURNING/.exec(text))) {
    const r = pg[m[1]].get(p[0]); if (!r) return { rows: [] };
    Object.assign(r.data, JSON.parse(p[1])); r.updated_at = new Date(); return { rows: [baris(r)] };
  }
  if ((m = /^DELETE FROM (\w+) WHERE id = \$1 RETURNING id$/.exec(text))) return { rows: pg[m[1]].delete(p[0]) ? [{ id: p[0] }] : [] };
  if ((m = /^SELECT id, data, created_at, updated_at FROM (\w+)(?: WHERE (.*))? ORDER BY id LIMIT \$(\d+)$/.exec(text))) {
    const rows = saring([...pg[m[1]].values()], m[2] || '', p);
    rows.sort((a, b) => (a.id < b.id ? -1 : 1));
    return { rows: rows.slice(0, p[+m[3] - 1]).map(baris) };
  }
  throw new Error('SQL tiruan tidak mengenal: ' + text);
}

process.env.SEB_CONFIG_KEYS = 'a'.repeat(64);
process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'http://aw/v1'; process.env.APPWRITE_FUNCTION_PROJECT_ID = 'p';
process.env.CBT_DB = 'neon'; process.env.NEON_URL = 'postgres://tiruan'; process.env.PRODI = 'tsm';
const mod = await import(pathToFileURL(path.join(root, 'functions/cbt/src/main.js')).href);
const neon = await import(pathToFileURL(path.join(root, 'functions/cbt/src/neon.js')).href);
neon.neonPasang(sql);
async function call(uid, body) {
  const r = { status: 200, body: null, json(b, s) { r.body = b; r.status = s || 200; return r; } };
  await mod.cbtHandle({ req: { headers: { 'x-appwrite-user-id': uid, 'x-appwrite-key': 'k' } }, res: r, error: () => {}, body });
  return r;
}
const N = 12;
function siapkan() {
  Object.keys(cols).forEach((k) => delete cols[k]); Object.values(pg).forEach((m) => m.clear()); mod._uji.semuaReset(); process.env.CBT_LEGACY = '1'; sqlMati = false;
  users.g1 = { $id: 'g1', email: 'guru@x.id', labels: ['guru'] };
  users.ad = { $id: 'ad', email: 'admin@x.id', labels: ['admin'] };
  col('akun').set('AG', { $id: 'AG', email: 'guru@x.id', nama: 'Guru', aktif: true });
  col('akun').set('AD', { $id: 'AD', email: 'admin@x.id', nama: 'Admin', aktif: true });
  for (let i = 0; i < N; i++) {
    users['u' + i] = { $id: 'u' + i, email: 's' + i + '@x.id', labels: ['siswa'] };
    col('akun').set('A' + i, { $id: 'A' + i, email: 's' + i + '@x.id', nama: 'Siswa ' + i, kelas: 'XI-A', sekolah: 'MEDINA', aktif: true });
  }
  /* bank soal dan kunci LAMA tetap di Appwrite */
  for (let i = 0; i < 30; i++) {
    col('banksoal').set('q' + i, { $id: 'q' + i, aktif: true, tujuan: 'ujian', payload: JSON.stringify({ tipe: 'pg', q: 'Soal ' + i, opts: ['a', 'b', 'c', 'd', 'e'], mapel: 'M' }) });
    col('soal_kunci').set('q' + i, { $id: 'q' + i, $createdAt: '2026-01-01T00:00:00.000Z', $updatedAt: '2026-01-01T00:00:00.000Z', payload: JSON.stringify({ kunci: i % 4, bahas: '' }) });
  }
  col('soal_sesi').set('S1', { $id: 'S1', aktif: true, payload: JSON.stringify({ judul: 'UH', durasi: 60, jumlah: 20, kelas: 'XI-A', sekolah: 'MEDINA', tok: true, acak: true, tampil: true }) });
  col('soal_kunci').set('tk_S1', { $id: 'tk_S1', payload: JSON.stringify({ token: 'ABC123' }) });
}
const benar = (ids) => Object.fromEntries(ids.map((id) => [id, Number(id.slice(1)) % 4]));
const runIds = (rid) => JSON.parse(pg.soal_run.get(rid).data.payload).ids;

import fs from 'node:fs';
console.log('Skema');
{ const sk = fs.readFileSync(path.join(root, 'neon-schema.sql'), 'utf8').replace(/\s+/g, ' ');
  cek('neon-schema.sql memuat semua pernyataan NEON_SKEMA', neon.NEON_SKEMA.every((q) => sk.includes(q.replace(/\s+/g, ' ').trim().replace(/\( /g, '(').replace(/ \)/g, ')')) || sk.includes(q.replace(/\s+/g, ' ').trim())), 'jalankan ulang pembuatan neon-schema.sql'); }
console.log('Mulai, simpan, kirim: data baru ke Neon, kunci lama dari Appwrite');
siapkan();
let r = await call('ad', { action: 'dbUji' });
cek('dbUji admin: backend neon, 3 tabel kosong', r.status === 200 && r.body.backend === 'neon' && r.body.tabel.soal_run === 0 && r.body.CBT_LEGACY === true, JSON.stringify(r.body));
r = await call('g1', { action: 'dbUji' }); cek('dbUji ditolak untuk guru', r.status === 403);
r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'abc123' });
cek('mulai berhasil (kunci lama terbaca dari Appwrite)', r.status === 200 && r.body.ids.length === 20, JSON.stringify(r.body).slice(0, 100));
const rid = r.body.rid;
cek('catatan ujian ada di Neon, tidak di Appwrite', pg.soal_run.has(rid) && !col('soal_run').has(rid));
const row = pg.soal_run.get(rid);
cek('kolom sid, sesi, sekolah, prodi terisi', row.sid === 'A0' && row.sesi_id === 'S1' && row.sekolah === 'MEDINA' && row.prodi === 'tsm', JSON.stringify(row).slice(0, 120));
r = await call('u1', { action: 'simpan', rid, ans: {} }); cek('siswa lain tidak boleh menyimpan catatan orang lain', r.status === 403);
r = await call('u0', { action: 'simpan', rid, ans: { [runIds(rid)[0]]: 2 }, cur: 3, pindah: 2 }); cek('simpan berhasil', r.status === 200);
cek('simpan memperbarui jawaban di Neon', JSON.parse(pg.soal_run.get(rid).data.payload).ans[runIds(rid)[0]] === 2);
r = await call('u0', { action: 'kirim', rid, ans: benar(runIds(rid)), pindah: 2 });
cek('semua benar = 100', r.status === 200 && r.body.hasil.score === 100, JSON.stringify(r.body).slice(0, 100));
cek('hasil ada di Neon (bukan Appwrite) dan catatan ditandai selesai', pg.soal_hasil.size === 1 && col('soal_hasil').size === 0 && pg.soal_run.get(rid).data.done === true);
r = await call('u0', { action: 'kirim', rid, ans: {}, pindah: 0 }); cek('kirim ulang idempoten', r.body.hasil && r.body.hasil.score === 100 && pg.soal_hasil.size === 1);
r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('tidak bisa mengulang setelah selesai', r.status === 409);

console.log('Data lama di Appwrite (CBT_LEGACY=1)');
siapkan();
col('soal_hasil').set('hS1_A3', { $id: 'hS1_A3', $createdAt: '2026-02-01T00:00:00.000Z', sid: 'A3', siswa: 'Siswa 3', kelas: 'XI-A', mode: 'ujian', sesiId: 'S1', score: 80, benar: 16, total: 20, payload: '{}' });
r = await call('u3', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('hasil lama di Appwrite mencegah ujian diulang', r.status === 409, r.status + ' ' + (r.body && r.body.error));
r = await call('u4', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('siswa lain bisa mulai (masuk Neon)', r.status === 200 && pg.soal_run.size === 1);
for (const u of ['u5', 'u6']) { const x = await call(u, { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); await call(u, { action: 'kirim', rid: x.body.rid, ans: benar(runIds(x.body.rid)) }); }
r = await call('g1', { action: 'dok', op: 'list', col: 'soal_hasil', q: { sesiId: ['S1'] } });
cek('dok list (Neon saja) memuat hasil baru, bukan yang lama', r.status === 200 && r.body.docs.length === 2, r.body.docs && r.body.docs.length);
r = await call('g1', { action: 'nilaiUlang', sesiId: 'S1' });
cek('nilaiUlang membaca hasil lama (Appwrite) dan baru (Neon)', r.status === 200 && r.body.total === 3, JSON.stringify(r.body));

console.log('dok: hak akses');
r = await call('u5', { action: 'dok', op: 'list', col: 'soal_hasil' });
cek('siswa hanya melihat hasil miliknya (sid dipaksa server)', r.status === 200 && r.body.docs.length === 1 && r.body.docs[0].sid === 'A5', JSON.stringify(r.body).slice(0, 100));
r = await call('u5', { action: 'dok', op: 'list', col: 'soal_hasil', q: { sid: ['A6'] } });
cek('siswa tidak bisa membaca milik orang lain lewat filter sid', r.status === 200 && r.body.docs.every((d) => d.sid === 'A5'));
const hid6 = [...pg.soal_hasil.values()].find((x) => x.sid === 'A6').id;
r = await call('u5', { action: 'dok', op: 'get', col: 'soal_hasil', id: hid6 }); cek('siswa tidak bisa get hasil orang lain (404)', r.status === 404);
r = await call('u6', { action: 'dok', op: 'get', col: 'soal_hasil', id: hid6 }); cek('siswa bisa get hasil sendiri', r.status === 200 && r.body.doc.sid === 'A6');
r = await call('u5', { action: 'dok', op: 'create', col: 'soal_hasil', id: 'hX', data: { sid: 'A5', score: 100 } }); cek('siswa tidak bisa menulis hasil', r.status === 403 && !pg.soal_hasil.has('hX'));
r = await call('u5', { action: 'dok', op: 'delete', col: 'soal_hasil', id: hid6 }); cek('siswa tidak bisa menghapus', r.status === 403 && pg.soal_hasil.has(hid6));
r = await call('u5', { action: 'dok', op: 'list', col: 'soal_kunci' }); cek('siswa tidak bisa membaca soal_kunci', r.status === 403);
r = await call('g1', { action: 'dok', op: 'list', col: 'banksoal' }); cek('koleksi di luar daftar ditolak', r.status === 400);
r = await call('g1', { action: 'dok', op: 'get', col: 'soal_hasil', id: '../x' }); cek('ID tidak valid ditolak', r.status === 400);

console.log('dok: guru');
const rid4 = [...pg.soal_run.keys()][0];
r = await call('g1', { action: 'dok', op: 'update', col: 'soal_run', id: rid4, data: { ext: 300 } }); cek('guru mengubah ext catatan ujian', r.status === 200 && pg.soal_run.get(rid4).data.ext === 300 && r.body.doc.$createdAt);
r = await call('g1', { action: 'dok', op: 'update', col: 'soal_run', id: 'rTidakAda', data: { ext: 1 } }); cek('update dokumen tidak ada -> 404', r.status === 404);
r = await call('g1', { action: 'dok', op: 'create', col: 'soal_kunci', id: 'tk_S9', data: { payload: '{"token":"ZZ"}' } }); cek('guru membuat soal_kunci baru di Neon', r.status === 200 && pg.soal_kunci.has('tk_S9'));
r = await call('g1', { action: 'dok', op: 'create', col: 'soal_kunci', id: 'tk_S9', data: { payload: '{}' } }); cek('create ganda -> 409', r.status === 409);
r = await call('g1', { action: 'dok', op: 'update', col: 'soal_kunci', id: 'q3', data: { payload: '{"kunci":1}' } });
cek('update kunci lama (masih di Appwrite) jatuh ke Appwrite', r.status === 200 && JSON.parse(col('soal_kunci').get('q3').payload).kunci === 1 && !pg.soal_kunci.has('q3'));
r = await call('g1', { action: 'dok', op: 'delete', col: 'soal_run', id: rid4 }); cek('guru menghapus catatan ujian', r.status === 200 && !pg.soal_run.has(rid4));
r = await call('g1', { action: 'dok', op: 'delete', col: 'soal_run', id: rid4 }); cek('hapus lagi -> 404', r.status === 404);
r = await call('g1', { action: 'dok', op: 'create', col: 'soal_run', id: 'rBesar', data: { payload: 'x'.repeat(250000) } }); cek('dokumen terlalu besar ditolak', r.status === 400);
r = await call('g1', { action: 'dok', op: 'create', col: 'soal_run', id: 'rKunciDollar', data: { $id: 'palsu', $createdAt: 'x', sid: 'A1' } });
cek('kolom berawalan $ dibuang dari data', r.status === 200 && !('$id' in pg.soal_run.get('rKunciDollar').data));

console.log('dok: halaman (cursor)');
siapkan();
for (let i = 0; i < 230; i++) await neon.nCreate('soal_run', 'r' + String(1000 + i), { sid: 'A' + (i % 12), sesiId: 'S1', ts: i, done: false, payload: '{}' }, {});
let tot = 0, cur = null, hal = 0;
for (;;) { r = await call('g1', { action: 'dok', op: 'list', col: 'soal_run', q: { sesiId: ['S1'] }, limit: 100, cursor: cur }); tot += r.body.docs.length; hal++; if (r.body.docs.length < 100) break; cur = r.body.docs[r.body.docs.length - 1].$id; }
cek('230 catatan terbaca dalam 3 halaman tanpa duplikat', tot === 230 && hal === 3, tot + '/' + hal);
r = await call('g1', { action: 'dok', op: 'list', col: 'soal_run', q: { sid: ['A0'] }, limit: 1, total: true }); cek('total dihitung server (untuk hitungan di layar hapus nilai)', r.body.total === 20 && r.body.docs.length === 1, JSON.stringify(r.body).slice(0, 80));

console.log('Hapus: data lama yang sudah disalin ikut terhapus');
siapkan();
col('soal_hasil').set('hDup', { $id: 'hDup', sid: 'A1', mode: 'ujian', sesiId: 'S1', score: 50, payload: '{}' });
await call('ad', { action: 'dbSalin', col: 'soal_hasil' });
cek('hasil ada di kedua tempat setelah salin', pg.soal_hasil.has('hDup') && col('soal_hasil').has('hDup'));
r = await call('g1', { action: 'dok', op: 'delete', col: 'soal_hasil', id: 'hDup' });
cek('hapus membersihkan Neon dan Appwrite', r.status === 200 && !pg.soal_hasil.has('hDup') && !col('soal_hasil').has('hDup'));
col('soal_hasil').set('hLama', { $id: 'hLama', sid: 'A2', mode: 'ujian', sesiId: 'S1', payload: '{}' });
r = await call('g1', { action: 'dok', op: 'delete', col: 'soal_hasil', id: 'hLama' }); cek('hapus dokumen yang hanya ada di Appwrite', r.status === 200 && !col('soal_hasil').has('hLama'));

console.log('Salin data lama dan matikan cadangan');
siapkan();
col('soal_hasil').set('hOld1', { $id: 'hOld1', $createdAt: '2026-02-01T00:00:00.000Z', $updatedAt: '2026-02-01T00:00:00.000Z', sid: 'A1', siswa: 'Siswa 1', mode: 'ujian', sesiId: 'S1', score: 70, payload: '{}' });
r = await call('ad', { action: 'dbSalin', col: 'soal_kunci' });
cek('dbSalin soal_kunci: 31 dokumen masuk', r.status === 200 && r.body.baru === 31 && r.body.sisa === false && pg.soal_kunci.size === 31, JSON.stringify(r.body));
cek('waktu aslinya terjaga', pg.soal_kunci.get('q1').created_at.toISOString() === '2026-01-01T00:00:00.000Z');
r = await call('ad', { action: 'dbSalin', col: 'soal_kunci' }); cek('salin ulang tidak menimpa (baru = 0)', r.body.baru === 0 && r.body.baca === 31);
r = await call('ad', { action: 'dbSalin', col: 'soal_hasil' }); cek('dbSalin soal_hasil', r.body.baru === 1 && pg.soal_hasil.has('hOld1'));
r = await call('g1', { action: 'dbSalin', col: 'soal_kunci' }); cek('dbSalin ditolak untuk guru', r.status === 403);
process.env.CBT_LEGACY = '0'; mod._uji.semuaReset();
for (const k of [...col('soal_kunci').keys()]) col('soal_kunci').delete(k); col('soal_hasil').clear();
r = await call('u0', { action: 'mulai', sesiId: 'S1', token: 'ABC123' }); cek('CBT_LEGACY=0: kunci dan token dari Neon, Appwrite sudah kosong', r.status === 200 && r.body.ids.length === 20, JSON.stringify(r.body).slice(0, 100));
Object.keys(hitCol).forEach((k) => delete hitCol[k]); mod._uji.semuaReset(); await call('u1', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
cek('CBT_LEGACY=0: mulai tidak menyentuh soal_kunci, soal_hasil, soal_run di Appwrite', !hitCol.soal_kunci && !hitCol.soal_hasil && !hitCol.soal_run, JSON.stringify(hitCol));

console.log('Gangguan Neon');
sqlMati = true; mod._uji.semuaReset();
r = await call('u2', { action: 'mulai', sesiId: 'S1', token: 'ABC123' });
cek('Neon putus: galat jelas 502, bukan data hilang', r.status === 502 || r.status === 500, r.status + ' ' + (r.body && r.body.error));
r = await call('ad', { action: 'dbUji' }); cek('dbUji melaporkan galat sambungan', r.status === 502 && /Neon gagal/.test(r.body.error), JSON.stringify(r.body));
sqlMati = false;

console.log('Beban: panggilan per aksi');
siapkan(); process.env.CBT_LEGACY = '0'; await call('ad', { action: 'dbSalin', col: 'soal_kunci' }); mod._uji.semuaReset();
awCalls = 0; sqlN = 0; Object.keys(hitCol).forEach((k) => delete hitCol[k]);
await Promise.all(Array.from({ length: N }, (_, i) => call('u' + i, { action: 'mulai', sesiId: 'S1', token: 'ABC123' })));
cek(N + ' siswa mulai: nol permintaan Appwrite ke soal_run, soal_hasil, soal_kunci', !hitCol.soal_run && !hitCol.soal_hasil && !hitCol.soal_kunci, JSON.stringify(hitCol));
cek('semua siswa mendapat catatan di Neon', pg.soal_run.size === N, pg.soal_run.size);
console.log('       (rata-rata ' + (awCalls / N).toFixed(1) + ' panggilan Appwrite dan ' + (sqlN / N).toFixed(1) + ' SQL per siswa)');

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
