/* neon.js: penyimpanan Neon (Postgres) untuk jalur panas CBT: soal_run, soal_hasil, soal_kunci.
   Bentuk dokumen sengaja sama dengan Appwrite ($id, $createdAt, $updatedAt, lalu kolom data), jadi kode CBT lain tidak berubah.
   Aktif bila variabel lingkungan fungsi CBT_DB=neon dan NEON_URL berisi connection string Neon (host berisi -pooler, sslmode=require).
   Pustaka "pg" dimuat hanya saat Neon dipakai; mode Appwrite tidak membutuhkannya.
   Satu project Neon untuk semua jurusan: kolom sekolah dan prodi ikut disimpan (prodi dari variabel PRODI, bawaan 'tsm'). */

export const NEON_COLS = new Set(['soal_run', 'soal_hasil', 'soal_kunci']);
export const neonAktif = () => String(process.env.CBT_DB || '').toLowerCase() === 'neon' && !!process.env.NEON_URL;

/* Skema (idempoten). Dijalankan oleh aksi admin dbUji, atau salin dari neon-schema.sql ke SQL Editor Neon. */
export const NEON_SKEMA = [
  `CREATE TABLE IF NOT EXISTS soal_run (
     id text PRIMARY KEY, sid text, sesi_id text, sekolah text, prodi text,
     data jsonb NOT NULL DEFAULT '{}'::jsonb,
     created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_soal_run_sesi ON soal_run (sesi_id)`,
  `CREATE INDEX IF NOT EXISTS idx_soal_run_sid ON soal_run (sid)`,
  `CREATE TABLE IF NOT EXISTS soal_hasil (
     id text PRIMARY KEY, sid text, sesi_id text, sekolah text, prodi text,
     data jsonb NOT NULL DEFAULT '{}'::jsonb,
     created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_soal_hasil_sesi ON soal_hasil (sesi_id)`,
  `CREATE INDEX IF NOT EXISTS idx_soal_hasil_sid ON soal_hasil (sid)`,
  `CREATE TABLE IF NOT EXISTS soal_kunci (
     id text PRIMARY KEY, sekolah text, prodi text,
     data jsonb NOT NULL DEFAULT '{}'::jsonb,
     created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`
];

/* nama tabel hanya dari daftar tetap (tidak pernah dari masukan pengguna) */
const T = (col) => { if (!NEON_COLS.has(col)) throw new Error('Koleksi bukan milik Neon: ' + col); return col; };

let POOL = null, EXEC = null;
/* Untuk uji otomatis: ganti pelaksana SQL dengan tiruan. */
export function neonPasang(fn) { EXEC = fn; }
async function exec(text, params) {
  if (EXEC) return EXEC(text, params || []);
  if (!POOL) {
    const mod = await import('pg');
    const Pool = (mod.default && mod.default.Pool) || mod.Pool;
    POOL = new Pool({ connectionString: process.env.NEON_URL, max: Number(process.env.NEON_POOL) || 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000 });
    POOL.on('error', () => { /* sambungan menganggur putus: pool membuat yang baru */ });
  }
  return POOL.query(text, params || []);
}
const err = (msg, code) => { const e = new Error(msg); e.code = code; return e; };

/* baris -> dokumen bergaya Appwrite */
function doc(r) {
  const d = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || {});
  return Object.assign({ $id: r.id, $createdAt: new Date(r.created_at).toISOString(), $updatedAt: new Date(r.updated_at).toISOString() }, d);
}
const J = (o) => JSON.stringify(o || {});
const str = (v, n) => (v === undefined || v === null || v === '' ? null : String(v).slice(0, n || 64));

export async function nGet(col, id) {
  const r = await exec('SELECT id, data, created_at, updated_at FROM ' + T(col) + ' WHERE id = $1', [String(id)]);
  return r.rows[0] ? doc(r.rows[0]) : null;
}

/* meta: {sekolah, prodi}. Id sudah ada -> galat 409 (sama seperti Appwrite). */
export async function nCreate(col, id, data, meta) {
  meta = meta || {};
  const d = data || {};
  const sid = str(d.sid, 36), sesi = str(d.sesiId, 36);
  const cols = col === 'soal_kunci' ? ['id', 'sekolah', 'prodi', 'data'] : ['id', 'sid', 'sesi_id', 'sekolah', 'prodi', 'data'];
  const vals = col === 'soal_kunci' ? [String(id), str(meta.sekolah, 32), str(meta.prodi, 16), J(d)] : [String(id), sid, sesi, str(meta.sekolah, 32), str(meta.prodi, 16), J(d)];
  const ph = vals.map((_, i) => (i === vals.length - 1 ? '$' + (i + 1) + '::jsonb' : '$' + (i + 1))).join(', ');
  const r = await exec('INSERT INTO ' + T(col) + ' (' + cols.join(', ') + ') VALUES (' + ph + ') ON CONFLICT (id) DO NOTHING RETURNING id, data, created_at, updated_at', vals);
  if (!r.rows[0]) throw err('Dokumen sudah ada', 409);
  return doc(r.rows[0]);
}

/* Gabungkan kolom yang dikirim ke data (seperti PATCH Appwrite). Tidak ada -> galat 404. */
export async function nUpdate(col, id, patch) {
  const p = patch || {};
  const r = await exec('UPDATE ' + T(col) + ' SET data = data || $2::jsonb, updated_at = now() WHERE id = $1 RETURNING id, data, created_at, updated_at', [String(id), J(p)]);
  if (!r.rows[0]) throw err('Dokumen tidak ditemukan', 404);
  return doc(r.rows[0]);
}

export async function nDelete(col, id) {
  const r = await exec('DELETE FROM ' + T(col) + ' WHERE id = $1 RETURNING id', [String(id)]);
  if (!r.rows[0]) throw err('Dokumen tidak ditemukan', 404);
  return { ok: true };
}

/* filter: {sesiId:[..], sid:[..], $id:[..]} (equal saja). */
function syarat(col, f, cursor) {
  const where = [], p = [];
  const add = (kolom, vals) => { if (!Array.isArray(vals)) return; p.push(vals.map(String)); where.push(kolom + ' = ANY($' + p.length + '::text[])'); };
  if (col !== 'soal_kunci') { add('sid', f.sid); add('sesi_id', f.sesiId); }
  add('id', f.$id);
  if (cursor) { p.push(String(cursor)); where.push('id > $' + p.length); }
  return { where, p };
}
/* Halaman berurutan id; cursor = id terakhir halaman sebelumnya. */
export async function nList(col, filter, opt) {
  opt = opt || {};
  const { where, p } = syarat(col, filter || {}, opt.cursor);
  p.push(Math.max(1, Math.min(Number(opt.limit) || 100, 500)));
  const r = await exec('SELECT id, data, created_at, updated_at FROM ' + T(col) + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY id LIMIT $' + p.length, p);
  return r.rows.map(doc);
}
export async function nCount(col, filter) {
  const { where, p } = syarat(col, filter || {}, null);
  const r = await exec('SELECT count(*)::int AS n FROM ' + T(col) + (where.length ? ' WHERE ' + where.join(' AND ') : ''), p);
  return r.rows[0].n;
}

/* Uji koneksi dan siapkan skema. Dipanggil admin lewat aksi dbUji. */
export async function nUji(siapkan) {
  const t0 = Date.now();
  await exec('SELECT 1');
  const ms = Date.now() - t0;
  if (siapkan) for (const q of NEON_SKEMA) await exec(q);
  const ada = {};
  for (const c of NEON_COLS) {
    try { const r = await exec('SELECT count(*)::int AS n FROM ' + c); ada[c] = r.rows[0].n; } catch (e) { ada[c] = null; }
  }
  return { ms, tabel: ada };
}

/* Salin dokumen dari Appwrite ($id, $createdAt, $updatedAt, kolom...) ke Neon dengan waktu aslinya. Yang sudah ada di Neon tidak ditimpa. -> jumlah yang baru masuk */
export async function nSalin(col, docs, meta) {
  meta = meta || {};
  let n = 0;
  for (const d of docs) {
    const data = {}; Object.keys(d).forEach((k) => { if (k[0] !== '$') data[k] = d[k]; });
    const t1 = d.$createdAt || new Date().toISOString(), t2 = d.$updatedAt || t1;
    const base = col === 'soal_kunci' ? { c: ['id', 'sekolah', 'prodi', 'data', 'created_at', 'updated_at'], v: [String(d.$id), str(meta.sekolah, 32), str(meta.prodi, 16), J(data), t1, t2] }
      : { c: ['id', 'sid', 'sesi_id', 'sekolah', 'prodi', 'data', 'created_at', 'updated_at'], v: [String(d.$id), str(data.sid, 36), str(data.sesiId, 36), str(meta.sekolah, 32), str(meta.prodi, 16), J(data), t1, t2] };
    const ph = base.v.map((_, i) => '$' + (i + 1) + (base.c[i] === 'data' ? '::jsonb' : base.c[i].endsWith('_at') ? '::timestamptz' : '')).join(', ');
    const r = await exec('INSERT INTO ' + T(col) + ' (' + base.c.join(', ') + ') VALUES (' + ph + ') ON CONFLICT (id) DO NOTHING RETURNING id', base.v);
    if (r.rows[0]) n++;
  }
  return n;
}
