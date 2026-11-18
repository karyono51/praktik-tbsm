/* Appwrite Function "cbt": ujian CBT dari bank soal dengan penilaian di server.
   Runtime Node.js 18+. Tanpa pustaka luar (memakai fetch bawaan Node).
   Execute access: Users. Scopes: users.read, documents.read, documents.write.
   Variabel lingkungan (opsional): DB_ID (bawaan: tbsm).

   Kunci jawaban soal sendiri disimpan di koleksi soal_kunci (hanya guru/admin yang boleh membaca), bukan di
   soal yang dibaca siswa. Hanya fungsi ini yang menilai, jadi nilai tidak bisa dipalsukan dari peramban.

   Aksi (body JSON, semua butuh login):
     mulai    {sesiId, token}                  siswa: mulai atau lanjutkan ujian. Server memilih soal, mengacak, memeriksa
                                               jadwal, kelas, sekolah, dan token. -> {rid,start,now,dur,ids,oo,ans,...}
     simpan   {rid, ans, cur, pindah, rg}      siswa: simpan jawaban sementara. -> {ext,stop,pb,now,start}
     kirim    {rid, ans, pindah}               siswa: akhiri ujian, server menilai. -> {hasil, kc}
     kirim    {mode:'latihan', ids, oo, ans}   siswa: simpan hasil latihan yang dinilai server.
     periksa  {qid, ans}                       siswa: periksa satu soal latihan. -> {frac, kc}
     ulasan   {hasilId}                        pemilik hasil: ambil kunci dan pembahasan (latihan, atau ujian bila guru menampilkan).
     akhiri   {rid}                            guru/admin: nilai dari jawaban tersimpan.
     akhiriSemua {sesiId}                      guru/admin: nilai peserta yang waktunya habis atau diakhiri, secukupnya dalam satu panggilan
                                               (batas waktu ~18 dtk). -> {n, sisa, gagal}; ulangi selama sisa > 0 dan n > 0.
     nilaiUlang  {sesiId}                      guru/admin: hitung ulang nilai hasil ujian sesi dengan kunci terbaru (setelah kunci dikoreksi).
                                               -> {total, n, sisa, lewat, gagal}; ulangi selama sisa > 0 dan n > 0.
     rilisToken  {sesiId, menit}               guru/admin/proktor: rilis token sesi, berlaku `menit` menit (bawaan 15, maks 180); menit 0 = tutup token.
                                               Sesi dengan tokR wajib token yang sedang dirilis. -> {token, rilis, berlaku, now}
     pantau      {sesiId}                      guru/admin/proktor: status peserta tanpa jawaban, kunci, atau nilai. -> {peserta[], tok, now}
     aksiRun     {rid, op, detik}              guru/admin/proktor: op = tambah (detik 300 atau 900) | bukaKunci | izinPindah (10 menit) | akhiri (hanya menghentikan, tanpa menilai).
                                               Mulai/simpan/kirim membawa `dev` (kode perangkat). Lanjut dari perangkat lain ditolak kecuali ada izinPindah.
     catat       {aksi, sesiId, ket}           guru/admin/proktor: catat aksi di perangkat ke log audit (diberi awalan klien.).
   Label Appwrite `proktor` (tanpa `guru`): hanya boleh memakai aksi rilisToken, pantau, aksiRun, dan catat. Semua aksi staf dicatat di koleksi `audit`.
*/
import crypto from 'node:crypto';
import fs from 'node:fs';

let BAWAAN = {};
try {
  const arr = JSON.parse(fs.readFileSync(new URL('./bawaan.json', import.meta.url), 'utf8'));
  arr.forEach((q) => { BAWAAN[q.id] = q; });
} catch (e) { BAWAAN = {}; }

const DB = () => process.env.DB_ID || 'tbsm';
const GRACE_MS = 90000;               // toleransi pengiriman jawaban setelah waktu habis
const ID_RE = /^[A-Za-z0-9_.-]{1,36}$/;

class Fail extends Error { constructor(msg, status) { super(msg); this.status = status || 400; } }

/* ---------- Cache ringan di instans fungsi yang hangat ----------
   Ratusan siswa memulai, menyimpan, dan mengirim bersamaan. Tanpa cache, tiap aksi memanggil Appwrite 4 sampai 10 kali
   (termasuk membaca seluruh bank soal). Isi cache hanya di memori fungsi, tidak pernah dikirim ke siswa, dan kedaluwarsa singkat. */
const TTL_USER = 60000, TTL_SOAL = 60000, TTL_SESI = 10000;   // sesi dan token sengaja singkat: perubahan guru berlaku dalam 10 detik
const BUDGET_MS = Number(process.env.CBT_BUDGET_MS) || 18000, PAR = 4;     // satu panggilan massal berhenti sebelum batas waktu fungsi (disarankan 30 dtk)
const EXAMBRO_UA = String(process.env.EXAMBRO_UA || 'TBSM-EXAM,VERSION/4.0').toUpperCase().split(',').map((t) => t.trim()).filter(Boolean);   // dipisah koma; samakan dengan EXAMBRO_UA di js/config.js
const MAX_SALAH = 10, JENDELA_SALAH = 5 * 60000;
const memo = { user: new Map(), soal: new Map(), sesi: new Map(), tok: new Map(), ros: new Map(), pool: null, salah: new Map() };
function memGet(m, k, ttl) { const e = m.get(k); return e && Date.now() - e.t < ttl ? e.v : undefined; }
function memSet(m, k, v, cap) { if (m.size >= cap) m.delete(m.keys().next().value); m.set(k, { t: Date.now(), v }); return v; }
function memReset() { memo.user.clear(); memo.soal.clear(); memo.sesi.clear(); memo.tok.clear(); memo.ros.clear(); memo.pool = null; }
/* satu pekerjaan yang sama dari banyak siswa sekaligus hanya dikerjakan sekali (mencegah serbuan saat cache masih kosong) */
const inflight = new Map();
function sekali(key, fn) { if (inflight.has(key)) return inflight.get(key); const p = Promise.resolve().then(fn).finally(() => inflight.delete(key)); inflight.set(key, p); return p; }
/* batas tebakan token per akun (per instans fungsi; cukup untuk menahan tebakan beruntun) */
function salahCek(id) {
  const e = memo.salah.get(id);
  if (e && Date.now() - e.t0 < JENDELA_SALAH && e.n >= MAX_SALAH) throw new Fail('Terlalu banyak token salah. Tunggu ' + Math.max(1, Math.ceil((JENDELA_SALAH - (Date.now() - e.t0)) / 60000)) + ' menit lalu coba lagi, atau minta pengawas.', 429);
}
function salahCatat(id) {
  const e = memo.salah.get(id), now = Date.now();
  if (!e || now - e.t0 >= JENDELA_SALAH) { if (memo.salah.size >= 5000) memo.salah.delete(memo.salah.keys().next().value); memo.salah.set(id, { n: 1, t0: now }); }
  else e.n++;
}
/* jalankan pekerjaan dengan paralelisme terbatas dan batas waktu; sisa pekerjaan dilaporkan, bukan dipaksa */
async function jalankan(items, fn, deadline) {
  let i = 0, ok = 0, gagal = 0, pesan = '';
  const w = async () => { for (;;) { if (Date.now() > deadline) return; const k = i++; if (k >= items.length) return; try { await fn(items[k]); ok++; } catch (e) { gagal++; pesan = String((e && e.message) || e); } } };
  await Promise.all(Array.from({ length: PAR }, w));
  return { ok, gagal, pesan };
}

/* ---------- REST Appwrite memakai kunci dinamis fungsi ---------- */
let KEY = '';
async function aw(method, path, body) {
  const base = String(process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT || '').replace(/\/$/, '');
  if (!base) throw new Fail('Alamat API Appwrite tidak tersedia di fungsi.', 500);
  let r;
  try {
    r = await fetch(base + path, {
      method,
      headers: { 'content-type': 'application/json', 'X-Appwrite-Project': process.env.APPWRITE_FUNCTION_PROJECT_ID || '', 'X-Appwrite-Key': KEY },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (e) { throw new Fail('Tidak dapat menghubungi Appwrite.', 502); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const f = new Fail(String(j.message || 'Appwrite menolak permintaan'), r.status === 404 ? 404 : r.status === 409 ? 409 : 502); f.code = r.status; throw f; }
  return j;
}
const colPath = (c) => '/databases/' + encodeURIComponent(DB()) + '/collections/' + encodeURIComponent(c) + '/documents';
const qs = (arr) => arr.map((q) => 'queries[]=' + encodeURIComponent(JSON.stringify(q))).join('&');
const Q = {
  equal: (attribute, values) => ({ method: 'equal', attribute, values }),
  limit: (n) => ({ method: 'limit', values: [n] }),
  cursorAfter: (id) => ({ method: 'cursorAfter', values: [id] })
};
async function getDoc(col, id) { return aw('GET', colPath(col) + '/' + encodeURIComponent(id)); }
async function tryGet(col, id) { try { return await getDoc(col, id); } catch (e) { if (e.code === 404) return null; throw e; } }
async function sesiDoc(id) {
  const c = memGet(memo.sesi, id, TTL_SESI); if (c) return c;
  return sekali('sesi:' + id, async () => { const d = await tryGet('soal_sesi', id); if (d) memSet(memo.sesi, id, d, 500); return d; });
}
/* token sesi: {token, rilis, berlaku}. rilis = waktu (ms) token dirilis pengawas, berlaku = menit; 0 bila belum dirilis atau sudah ditutup. */
async function tokenSesi(id) {
  const c = memGet(memo.tok, id, TTL_SESI); if (c !== undefined) return c;
  return sekali('tok:' + id, async () => {
    const kd = await tryGet('soal_kunci', 'tk_' + id); let o = { token: '', rilis: 0, berlaku: 0 };
    try { const j = JSON.parse((kd && kd.payload) || '{}'); o = { token: String(j.token || ''), rilis: Number(j.rilis) || 0, berlaku: Number(j.berlaku) || 0 }; } catch (e) { o = { token: '', rilis: 0, berlaku: 0 }; }
    return memSet(memo.tok, id, o, 500);
  });
}
const tokAktif = (ti, now) => !!(ti.rilis && ti.berlaku > 0 && now >= ti.rilis - 5000 && now <= ti.rilis + ti.berlaku * 60000);
async function listDocs(col, queries) {
  const out = []; let cur = null;
  for (;;) {
    const q = [Q.limit(100)].concat(queries || []); if (cur) q.push(Q.cursorAfter(cur));
    const r = await aw('GET', colPath(col) + '?' + qs(q));
    out.push(...(r.documents || []));
    if ((r.documents || []).length < 100) return out;
    cur = r.documents[r.documents.length - 1].$id;
  }
}
const createDoc = (col, id, data, perms) => aw('POST', colPath(col), { documentId: id, data, permissions: perms || [] });
const updateDoc = (col, id, data) => aw('PATCH', colPath(col) + '/' + encodeURIComponent(id), { data });
async function byIds(col, ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 50) {
    const part = ids.slice(i, i + 50);
    (await listDocs(col, [Q.equal('$id', part)])).forEach((d) => { out[d.$id] = d; });
  }
  return out;
}

/* ---------- Data soal ---------- */
function parse(doc) {
  const o = { id: doc.$id };
  Object.keys(doc).forEach((k) => { if (k[0] !== '$') o[k] = doc[k]; });
  if (typeof o.payload === 'string') { try { Object.assign(o, JSON.parse(o.payload || '{}')); } catch (e) { /* abaikan */ } }
  return o;
}
function keyOf(soal, kdoc) {
  /* kunci dari soal_kunci; cadangan: kunci lama yang masih ada di payload soal */
  if (kdoc) { try { const k = JSON.parse(kdoc.payload || '{}'); if (k.kunci !== undefined || k.rk || k.rub) return k; } catch (e) { /* lanjut */ } }
  if (soal.tipe === 'kategori' && Array.isArray(soal.rows) && soal.rows.every((r) => typeof r[1] === 'boolean')) return { rk: soal.rows.map((r) => !!r[1]), bahas: soal.bahas || '' };
  if (soal.kunci !== undefined) return { kunci: soal.kunci, bahas: soal.bahas || '' };
  return null;
}
/* kumpulkan {tipe, n, key} tiap soal; bawaan dari bawaan.json */
async function buildQ(ids) {
  const own = ids.filter((id) => !BAWAAN[id]);
  /* dokumen soal yang baru dibaca untuk pool ujian dipakai lagi; hanya kunci yang masih perlu diambil */
  const raw = memo.pool && Date.now() - memo.pool.t < TTL_SOAL ? memo.pool.raw : {}, docs = {}, miss = [];
  own.forEach((id) => { if (raw[id]) docs[id] = raw[id]; else miss.push(id); });
  if (miss.length) Object.assign(docs, await byIds('banksoal', miss));
  const kd = own.length ? await byIds('soal_kunci', own) : {};
  const out = {};
  ids.forEach((id) => {
    if (BAWAAN[id]) {
      const b = BAWAAN[id], ov = docs[id] ? parse(docs[id]) : null;
      out[id] = { id, bawaan: true, tipe: b.tipe, n: b.n, key: b.tipe === 'kategori' ? { rk: b.rk, bahas: b.bahas } : { kunci: b.kunci, bahas: b.bahas },
        aktif: ov ? ov.aktif !== false : true, tujuan: (ov && ov.tujuan) || b.tujuan || 'keduanya', kelas: ov && ov.kelas !== undefined ? ov.kelas : (b.kelas || '') };
      return;
    }
    const d = docs[id]; if (!d) return;
    const s = parse(d), key = keyOf(s, kd[id]);
    out[id] = { id, bawaan: false, tipe: s.tipe, n: s.tipe === 'uraian' ? 0 : s.tipe === 'kategori' ? (s.rows || []).length : (s.opts || []).length, key, lab: s.lab,
      maks: Number(s.maks) || 0, bobot: Number(s.bobot) > 0 ? Number(s.bobot) : 2, pj: Number(s.pj) > 0 ? Number(s.pj) : 1500,
      aktif: s.aktif !== false, tujuan: s.tujuan || 'keduanya', kelas: s.kelas || '' };
  });
  return out;
}
/* fresh = true: lewati cache (dipakai saat nilai ulang, supaya kunci yang baru dikoreksi ikut terbaca) */
async function loadQ(ids, fresh) {
  const out = {}, need = [];
  ids.forEach((id) => { const c = fresh ? undefined : memGet(memo.soal, id, TTL_SOAL); if (c) out[id] = c; else if (need.indexOf(id) < 0) need.push(id); });
  if (need.length) { const b = await sekali('q:' + (fresh ? 'f:' : '') + need.slice().sort().join(','), () => buildQ(need)); Object.keys(b).forEach((id) => { out[id] = memSet(memo.soal, id, b[id], 3000); }); }
  return out;
}
/* Aturan bentuk soal TKA untuk ujian (soal bawaan dikecualikan): PG 5 pilihan; PG kompleks 5 pilihan dan kunci minimal 2;
   PG kategori 3 sampai 6 pernyataan dengan label Benar/Salah atau Sesuai/Tidak Sesuai. Soal sendiri yang belum memenuhi hanya untuk latihan. */
const LABS = [['benar', 'salah'], ['sesuai', 'tidak sesuai']];
function labOk(lab) {
  const l = Array.isArray(lab) ? lab : ['Benar', 'Salah'];
  const a = String(l[0] || '').trim().toLowerCase(), b = String(l[1] || '').trim().toLowerCase();
  return LABS.some((p) => p[0] === a && p[1] === b);
}
/* dari dokumen soal (tanpa kunci) */
function aturanDoc(s) {
  if (!s || s.bawaan || BAWAAN[s.id]) return true;
  if (s.tipe === 'uraian') return Number(s.maks) >= 1;
  if (s.tipe === 'kategori') { const n = (s.rows || []).length; return n >= 3 && n <= 6 && labOk(s.lab); }
  return (s.opts || []).length === 5;
}
/* dari soal yang sudah dimuat (dengan kunci) */
function aturanOk(q) {
  if (!q) return false;
  if (q.bawaan) return true;
  if (q.tipe === 'uraian') return q.maks >= 1 && !!(q.key && Array.isArray(q.key.rub) && q.key.rub.length);
  if (q.tipe === 'kategori') return q.n >= 3 && q.n <= 6 && labOk(q.lab);
  if (q.n !== 5) return false;
  if (q.tipe === 'kompleks') return !q.key || !Array.isArray(q.key.kunci) || q.key.kunci.length >= 2;
  return true;
}
/* daftar soal yang boleh dipakai ujian otomatis; dibaca sekali lalu dipakai bersama oleh ratusan siswa */
async function poolUjian() {
  if (memo.pool && Date.now() - memo.pool.t < TTL_SOAL) return memo.pool.v;
  return sekali('pool', async () => {
    const docs = await listDocs('banksoal'), raw = {};
    docs.forEach((d) => { raw[d.$id] = d; });
    const v = docs.map(parse).filter((q) => !BAWAAN[q.id] && !q.bawaan && q.aktif !== false && aturanDoc(q) && (q.tujuan === 'keduanya' || q.tujuan === 'ujian' || !q.tujuan));
    memo.pool = { t: Date.now(), v, raw };
    return v;
  });
}
function frac(q, a) {
  if (!q || !q.key || a == null || q.tipe === 'uraian') return 0;
  const k = q.key;
  if (q.tipe === 'pg') return a === k.kunci ? 1 : 0;
  if (q.tipe === 'kompleks') {
    const sel = Array.isArray(a) ? a : []; if (!sel.length || !Array.isArray(k.kunci) || !k.kunci.length) return 0;
    let b = 0, s = 0; sel.forEach((i) => { if (k.kunci.indexOf(i) > -1) b++; else s++; });
    return Math.max(0, (b - s) / k.kunci.length);
  }
  if (q.tipe === 'kategori') {
    if (!Array.isArray(a) || !Array.isArray(k.rk) || !k.rk.length) return 0;
    let b = 0, sl = 0; k.rk.forEach((v, i) => { const x = a[i]; if (x !== 0 && x !== 1) return; if (x === (v ? 0 : 1)) b++; else sl++; });
    return Math.max(0, (b - sl) / k.rk.length);
  }
  return 0;
}
function cleanAns(ans, ids) {
  const out = {}; if (!ans || typeof ans !== 'object') return out;
  const ok = (v) => v === null || (Number.isInteger(v) && v >= 0 && v < 10);
  ids.forEach((id) => {
    const v = ans[id]; if (v === undefined) return;
    if (typeof v === 'string') { const t = v.slice(0, 3000); if (t.trim()) out[id] = t; }
    else if (Array.isArray(v)) { if (v.length <= 10 && v.every(ok)) out[id] = v; }
    else if (Number.isInteger(v) && v >= 0 && v < 10) out[id] = v;
  });
  return out;
}
/* nu = nilai uraian dari guru { idSoal: { skor, ... } }. Uraian yang belum dinilai tidak dihitung (pend) sampai guru menilainya. */
function nilai(ids, Qs, ans, nu) {
  let sum = 0, w = 0, ben = 0, pend = 0;
  ids.forEach((id) => {
    const q = Qs[id]; if (!q) return;
    if (q.tipe === 'uraian') {
      const g = nu && nu[id];
      if (g && typeof g.skor === 'number') { const mk = g.mk || q.maks || 1, b = q.bobot || 2, f = Math.max(0, Math.min(1, g.skor / mk)); sum += f * b; w += b; if (f >= 0.9999) ben++; }
      else if (ans && typeof ans[id] === 'string' && ans[id].trim()) pend++;
      else { w += q.bobot || 2; }   // tidak dijawab: nilai 0, tetap dihitung
      return;
    }
    const f = frac(q, ans[id]); sum += f; w += 1; if (f >= 0.9999) ben++;
  });
  return { score: w ? Math.round(sum / w * 100) : 0, benar: ben, total: ids.length, pts: +sum.toFixed(2), pend };
}
function kcOf(ids, Qs) {
  const kc = {};
  ids.forEach((id) => { const q = Qs[id]; if (q && q.key) kc[id] = q.key; });
  return kc;
}

/* ---------- Pengguna ---------- */
async function whoami(callerId) {
  const c = memGet(memo.user, callerId, TTL_USER); if (c) return c;
  const u = await aw('GET', '/users/' + encodeURIComponent(callerId));
  const labels = u.labels || [], staff = labels.includes('guru') || labels.includes('admin'), proktor = labels.includes('proktor'), admin = labels.includes('admin');
  const email = String(u.email || '').trim().toLowerCase();
  if (!email) throw new Fail('Akun login tidak punya email.', 400);
  const f = await listDocs('akun', [Q.equal('email', [email]), Q.limit(1)]);
  const akun = f[0];
  if (!akun) throw new Fail('Email belum terdaftar di daftar akun.', 404);
  if (akun.aktif === false) throw new Fail('Akun nonaktif.', 403);
  return memSet(memo.user, callerId, { id: callerId, staff, proktor, admin, akun }, 3000);
}
function sesiBoleh(s, akun, now) {
  if (s.aktif === false) throw new Fail('Sesi ujian tidak aktif.', 403);
  if (s.mulai && now < s.mulai) throw new Fail('Sesi belum dibuka.', 403);
  if (s.selesai && now > s.selesai) throw new Fail('Sesi sudah ditutup.', 403);
  if (s.kelas && s.kelas !== 'ALL' && s.kelas !== akun.kelas) throw new Fail('Sesi ini bukan untuk kelasmu.', 403);
  const sk = String(s.sekolah || '').toUpperCase(), ak = String(akun.sekolah || '').toUpperCase();
  if (sk && ak && ak !== 'ALL' && sk !== ak) throw new Fail('Sesi ini bukan untuk sekolahmu.', 403);
}

/* ---------- Ruang dan gelombang ----------
   Payload sesi memuat ruang: [{id, nama, gel, pk (id akun proktor), m, s (jadwal ruang, bila beda dari sesi), sis: [id akun siswa]}].
   Sesi beruang: siswa harus ditempatkan di salah satu ruang, jadwal buka/tutup mengikuti ruangnya (gelombang),
   dan proktor (bukan guru/admin) hanya memantau dan bertindak untuk siswa di ruang yang ia awasi. Sesi tanpa ruang bekerja seperti biasa. */
function ruangList(s) { return Array.isArray(s.ruang) ? s.ruang.filter((r) => r && Array.isArray(r.sis)) : []; }
function ruangSiswa(s, sid) { return ruangList(s).find((r) => r.sis.includes(sid)) || null; }
function ruangSaya(s, me) { return ruangList(s).filter((r) => r.pk && r.pk === me.akun.$id); }
function wajibRuangnya(s, me, sid) {
  if (me.staff || !ruangList(s).length) return;
  const r = ruangSiswa(s, sid); if (!r || r.pk !== me.akun.$id) throw new Fail('Siswa ini bukan di ruangmu.', 403);
}

/* ---------- Util ---------- */
function h32(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function runId(sesiId, sid) {
  const k = (String(sesiId) + '_' + String(sid)).replace(/[^a-zA-Z0-9_.-]/g, '_');
  return 'r' + (k.length <= 34 ? k : h32(String(sesiId)) + h32(String(sid)) + h32(k));
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function same(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
const userRead = (authId) => ['read("user:' + authId + '")'];
function runState(run) {
  const p = parse(run);
  return { p, start: Date.parse(run.$createdAt) || 0, dur: p.dur || 0, ext: Number(run.ext) || 0, stop: run.stop === true, pb: Number(run.pb) || 0 };
}
function endOf(st) { return st.start + (st.dur + st.ext) * 1000; }

/* ---------- Aksi ---------- */
async function mulai(me, body) {
  const sesiId = String(body.sesiId || ''); if (!ID_RE.test(sesiId)) throw new Fail('Sesi tidak valid.');
  const sd = await sesiDoc(sesiId); if (!sd) throw new Fail('Sesi tidak ditemukan.', 404);
  const s = parse(sd), now = Date.now(), sid = me.akun.$id, rid = runId(sesiId, sid);
  /* Wajib Exambro: UserAgent dikirim klien; bisa dipalsukan, jadi ini penghalang, bukan jaminan. */
  if (s.exambro && !EXAMBRO_UA.some((t) => String(body.ua || '').toUpperCase().includes(t))) throw new Fail('Sesi ini wajib dikerjakan lewat aplikasi Exambro.', 403);
  const ex = await tryGet('soal_run', rid);
  if (ex) {
    if (ex.done) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409);
    await cekPerangkat(ex, me, body, s);
    return resumeResp(ex, s, now);
  }
  let sj = s;
  if (ruangList(s).length) {
    const rg = ruangSiswa(s, sid);
    if (!rg) throw new Fail('Kamu belum ditempatkan di ruang ujian. Hubungi pengawas.', 403);
    sj = Object.assign({}, s, { mulai: Number(rg.m) || s.mulai, selesai: Number(rg.s) || s.selesai });   // jadwal gelombang ruang
  }
  sesiBoleh(sj, me.akun, now);
  if (s.tok) {
    salahCek(me.akun.$id);
    const ti = await tokenSesi(sesiId), tk = ti.token;
    const got = String(body.token || '').trim().toUpperCase();
    if (!tk) throw new Fail('Token sesi belum diatur guru.', 403);
    if (s.tokR && !tokAktif(ti, now)) throw new Fail('Token belum dirilis pengawas atau sudah kedaluwarsa. Minta pengawas merilis token.', 403);
    if (!got || !same(got, tk.toUpperCase())) { salahCatat(me.akun.$id); throw new Fail('Token salah.', 403); }
    memo.salah.delete(me.akun.$id);
  }
  if (await tryGet('soal_hasil', 'h' + rid.slice(1))) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409);
  let ids;
  const okKelas = (q) => !q.kelas || !me.akun.kelas || q.kelas === me.akun.kelas;
  if (s.pilih === 'manual') {
    /* hanya soal yang dipilih guru yang dibaca (bukan seluruh bank soal) */
    const want = Array.from(new Set(s.ids || [])), Q0 = await loadQ(want);
    ids = want.filter((id) => Q0[id] && !Q0[id].bawaan && Q0[id].aktif && aturanOk(Q0[id]) && (Q0[id].tujuan === 'keduanya' || Q0[id].tujuan === 'ujian'));
    if (s.acak !== false) ids = shuffle(ids);
  } else {
    const all = await poolUjian(), mf = s.mapelF || [];
    const Qa = all.length <= 600 ? await loadQ(all.map((q) => q.id)) : null;   // kunci seluruh pool diambil sekali untuk semua siswa, bukan per siswa
    const pool = shuffle(all.filter((q) => okKelas(q) && (!mf.length || mf.indexOf(q.mapel) > -1) && (!Qa || aturanOk(Qa[q.id]))));
    ids = pool.slice(0, s.jumlah || pool.length).map((q) => q.id);
  }
  if (!ids.length) throw new Fail('Sesi ini belum memiliki soal.', 400);
  const Qs = await loadQ(ids), oo = {};
  ids = ids.filter((id) => aturanOk(Qs[id]));
  if (!ids.length) throw new Fail('Sesi ini belum memiliki soal.', 400);
  ids.forEach((id) => { const q = Qs[id]; if (q && q.tipe !== 'kategori' && q.tipe !== 'uraian') { const ix = Array.from({ length: q.n }, (_, i) => i); oo[id] = s.acak !== false ? shuffle(ix) : ix; } });
  const dur = (s.durasi || 0) * 60;
  const p = { mode: 'ujian', sesiId, sesiJudul: s.judul || '', dur, ids, oo, ans: {}, cur: 0, chk: {}, pindah: 0, rg: {}, tampil: !!s.tampil, kkm: s.kkm };
  const dev = devId(body.dev); if (dev) p.dev = dev;
  let doc;
  try {
    doc = await createDoc('soal_run', rid, { sid, sesiId, ts: now, done: false, payload: JSON.stringify(p), ext: 0, stop: false, pb: 0 }, userRead(me.id));
  } catch (e) {
    if (e.code === 409) { const again = await getDoc('soal_run', rid); if (again.done) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409); await cekPerangkat(again, me, body, s); return resumeResp(again, s, now); }
    throw e;
  }
  return respRun(doc, s, now, false);
}
/* ---------- Pengikat perangkat ----------
   Catatan ujian diikat ke satu perangkat (kode acak yang dibuat peramban siswa, bukan identitas pribadi). Melanjutkan dari perangkat yang sama
   (muat ulang, peramban tertutup) tetap bebas. Dari perangkat lain harus ada izin pengawas (aksiRun op izinPindah) yang berlaku IZIN_MS.
   Ini penghalang terhadap token yang dibagikan atau akun yang dipinjam, bukan jaminan: kode perangkat berasal dari klien. */
const IZIN_MS = 10 * 60000;
function devId(v) { v = String(v || ''); return /^[A-Za-z0-9_-]{12,64}$/.test(v) ? v : ''; }
async function cekPerangkat(run, me, body, s) {
  const p = parse(run), dev = devId(body.dev), now = Date.now();
  if (!p.dev) { if (dev) await updateDoc('soal_run', run.$id, { payload: JSON.stringify(Object.assign({}, p, { dev })) }); return; }   // catatan lama: ikat pada perangkat pertama yang melanjutkan
  if (dev && dev === p.dev) return;
  if (dev && Number(p.izin) > now) {
    const next = Object.assign({}, p, { dev }); delete next.izin;
    await updateDoc('soal_run', run.$id, { payload: JSON.stringify(next) });
    await catatAudit(me, 'run.pindahOk', run.sesiId, String(me.akun.nama || run.sid), 'lanjut di perangkat baru dengan izin pengawas');
    return;
  }
  await catatAudit(me, 'run.pindahTolak', run.sesiId, String(me.akun.nama || run.sid), dev ? 'ditolak: perangkat lain tanpa izin pengawas' : 'ditolak: klien lama tanpa kode perangkat');
  throw new Fail(dev ? 'Ujian ini sedang dikerjakan di perangkat lain. Untuk pindah, minta pengawas menekan "Izinkan pindah perangkat", lalu coba lagi.' : 'Muat ulang aplikasi (tekan Segarkan) lalu coba lagi.', 403);
}
function perangkatSama(run, body) {   // simpan dan kirim: perangkat lama berhenti menimpa setelah ujian dipindahkan
  const p = parse(run), dev = devId(body.dev);
  if (p.dev && dev && dev !== p.dev) throw new Fail('Ujian ini sudah dilanjutkan di perangkat lain.', 409);
}
function respRun(doc, s, now, resume) {
  const st = runState(doc), p = st.p;
  return { ok: true, resume, rid: doc.$id, start: st.start, now, dur: st.dur, ids: p.ids || [], oo: p.oo || {}, ans: p.ans || {}, cur: p.cur || 0, chk: p.chk || {}, pindah: p.pindah || 0, rg: p.rg || {},
    ext: st.ext, stop: st.stop, pb: st.pb, sesiJudul: p.sesiJudul || s.judul || '', tampil: !!p.tampil, kkm: p.kkm !== undefined ? p.kkm : s.kkm, batas: s.batas || 0, aksi: s.aksi || 'peringatan', layar: !!s.layar };
}
function resumeResp(run, s, now) { return respRun(run, s, now, true); }

async function ownRun(me, rid) {
  if (!ID_RE.test(String(rid || ''))) throw new Fail('Catatan ujian tidak valid.');
  const run = await tryGet('soal_run', rid); if (!run) throw new Fail('Catatan ujian tidak ditemukan.', 404);
  if (!me.staff && run.sid !== me.akun.$id) throw new Fail('Bukan catatan ujianmu.', 403);
  return run;
}

async function simpan(me, body) {
  const run = await ownRun(me, body.rid), st = runState(run), now = Date.now();
  if (!run.done && !me.staff) perangkatSama(run, body);
  if (run.done) return { ok: true, done: true, ext: st.ext, stop: st.stop, pb: st.pb, now, start: st.start };
  if (now <= endOf(st) + GRACE_MS) {
    const p = st.p, ids = p.ids || [];
    const ans = cleanAns(body.ans, ids);
    const keep = Object.assign({}, p.ans || {}, ans);          // jawaban hanya bertambah atau berubah, tidak hilang karena klien lama
    ids.forEach((id) => { if (body.ans && Object.prototype.hasOwnProperty.call(body.ans, id) && body.ans[id] === null) delete keep[id]; });
    const rg = {}; if (body.rg && typeof body.rg === 'object') ids.forEach((id) => { if (body.rg[id]) rg[id] = 1; });
    const next = Object.assign({}, p, { ans: keep, cur: Math.max(0, Math.min(ids.length - 1, Number(body.cur) || 0)), pindah: Math.max(p.pindah || 0, Math.min(999, Number(body.pindah) || 0)), rg });
    await updateDoc('soal_run', run.$id, { payload: JSON.stringify(next) });
  }
  return { ok: true, ext: st.ext, stop: st.stop, pb: st.pb, now, start: st.start };
}

async function selesaikan(run, me, opt) {
  /* menilai satu catatan ujian dan membuat dokumen hasil (idempoten) */
  const st = runState(run), p = st.p, ids = p.ids || [], now = Date.now();
  const hid = 'h' + run.$id.slice(1);
  const Qs = await loadQ(ids);
  const ans = opt.ans ? Object.assign({}, p.ans || {}, cleanAns(opt.ans, ids)) : (p.ans || {});
  ids.forEach((id) => { const q = Qs[id]; if (q && q.tipe === 'uraian' && typeof ans[id] === 'string') ans[id] = ans[id].slice(0, q.pj || 1500); });
  const g = nilai(ids, Qs, ans);
  const end = endOf(st), t = Math.min(now, end);
  const akun = opt.akun || me.akun;
  const data = { ts: now, sid: run.sid, siswa: String(akun.nama || '').slice(0, 128), kelas: akun.kelas || '', mode: 'ujian', sesiId: run.sesiId, sesiJudul: String(p.sesiJudul || '').slice(0, 160),
    score: g.score, benar: g.benar, total: g.total, detik: Math.max(0, Math.min(Math.round((t - st.start) / 1000), st.dur + st.ext)),
    payload: JSON.stringify({ ans, order: ids, oo: p.oo || {}, pindah: Math.max(p.pindah || 0, opt.pindah || 0), pts: g.pts, pend: g.pend || undefined, tampil: !!p.tampil, kkm: p.kkm }) };
  let doc;
  try { doc = await createDoc('soal_hasil', hid, data, opt.perms || userRead(me.id)); }
  catch (e) {
    if (e.code !== 409) throw e;
    /* hasil sudah ada (kirim ganda atau guru sudah menilai): jangan menimpa, cukup tandai selesai */
    const old = await getDoc('soal_hasil', hid);
    if (!run.done) await updateDoc('soal_run', run.$id, { done: true });
    return { hasil: old, p: parse(old), dup: true, ids, Qs };
  }
  const pindahAkhir = Math.max(p.pindah || 0, opt.pindah || 0);
  await updateDoc('soal_run', run.$id, { done: true, payload: JSON.stringify(Object.assign({}, p, { ans, pindah: pindahAkhir })) });
  return { hasil: doc, p: parse(doc), ids, Qs };
}
function hasilOut(h) { const p = parse(h); return { id: h.$id, ts: h.ts, score: h.score, benar: h.benar, total: h.total, detik: h.detik, pend: p.pend || 0 }; }

async function kirimUjian(me, body) {
  const run = await ownRun(me, body.rid), st = runState(run), now = Date.now();
  if (!run.done && !me.staff) perangkatSama(run, body);
  const inWin = now <= endOf(st) + GRACE_MS || st.stop;
  const r = await selesaikan(run, me, { ans: inWin ? body.ans : null, pindah: Math.max(0, Math.min(999, Number(body.pindah) || 0)) });
  const tampil = !!r.p.tampil;
  return { ok: true, hasil: hasilOut(r.hasil), pindah: r.p.pindah || 0, tampil, kc: tampil ? kcOf(r.ids, r.Qs) : null };
}

async function kirimLatihan(me, body) {
  let ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string' && ID_RE.test(x)) : [];
  ids = Array.from(new Set(ids)).slice(0, 100);
  if (!ids.length) throw new Fail('Tidak ada soal.');
  const Qs = await loadQ(ids);
  ids = ids.filter((id) => Qs[id] && Qs[id].tipe !== 'uraian' && Qs[id].aktif && (Qs[id].tujuan === 'keduanya' || Qs[id].tujuan === 'latihan'));
  if (!ids.length) throw new Fail('Soal tidak tersedia untuk latihan.');
  const ans = cleanAns(body.ans, ids), g = nilai(ids, Qs, ans), now = Date.now();
  const oo = {}; if (body.oo && typeof body.oo === 'object') ids.forEach((id) => { const v = body.oo[id]; if (Array.isArray(v) && v.length <= 10 && v.every((x) => Number.isInteger(x) && x >= 0 && x < 10)) oo[id] = v; });
  const a = me.akun, hid = 'h' + crypto.randomBytes(8).toString('hex');
  const data = { ts: now, sid: a.$id, siswa: String(a.nama || '').slice(0, 128), kelas: a.kelas || '', mode: 'latihan', sesiId: '', sesiJudul: '', score: g.score, benar: g.benar, total: g.total,
    detik: Math.max(0, Math.min(86400, Number(body.detik) || 0)), payload: JSON.stringify({ ans, order: ids, oo, pindah: 0, pts: g.pts, tampil: true }) };
  const doc = await createDoc('soal_hasil', hid, data, userRead(me.id));
  return { ok: true, hasil: hasilOut(doc), kc: kcOf(ids, Qs) };
}

async function periksa(me, body) {
  const qid = String(body.qid || ''); if (!ID_RE.test(qid)) throw new Fail('Soal tidak valid.');
  const Qs = await loadQ([qid]), q = Qs[qid];
  if (!q || q.tipe === 'uraian' || !q.aktif || !(q.tujuan === 'keduanya' || q.tujuan === 'latihan')) throw new Fail('Soal tidak tersedia untuk latihan.', 403);
  const a = body.ans === undefined ? null : body.ans;
  return { ok: true, frac: frac(q, a), kc: q.key };
}

async function ulasan(me, body) {
  const hid = String(body.hasilId || ''); if (!ID_RE.test(hid)) throw new Fail('Hasil tidak valid.');
  const h = await tryGet('soal_hasil', hid); if (!h) throw new Fail('Hasil tidak ditemukan.', 404);
  if (!me.staff && h.sid !== me.akun.$id) throw new Fail('Bukan hasilmu.', 403);
  const p = parse(h);
  if (h.mode === 'ujian' && !me.staff && !p.tampil) throw new Fail('Pembahasan belum ditampilkan guru.', 403);
  const ids = p.order || [], Qs = await loadQ(ids);
  return { ok: true, kc: kcOf(ids, Qs), nu: p.nu || {} };
}

function needStaff(me) { if (!me.staff) throw new Fail('Hanya guru atau admin.', 403); }
async function akun(sid) { const d = await tryGet('akun', sid); return d ? Object.assign({ id: d.$id }, d) : null; }

async function akhiri(me, body) {
  needStaff(me);
  const run = await ownRun(me, body.rid);
  if (run.done) return { ok: true, done: true };
  const a = await akun(run.sid);
  const r = await selesaikan(run, me, { akun: a || { nama: '', kelas: '' }, perms: await permsFor(run.sid, me) });
  await catatAudit(me, 'nilai.akhiri', run.sesiId, (a && a.nama) || run.sid, 'dinilai dari jawaban tersimpan');
  return { ok: true, hasil: hasilOut(r.hasil) };
}
/* izin baca siswa pemilik: cari ID login lewat uid_map (sid -> id dokumen). Bila belum ada, hanya guru/admin yang membaca. */
async function permsFor(sid, me) {
  try {
    const m = await listDocs('uid_map', [Q.equal('sid', [sid]), Q.limit(5)]);
    const ids = m.map((d) => d.$id).slice(0, 3);
    return ids.length ? ids.map((i) => 'read("user:' + i + '")') : [];
  } catch (e) { return []; }
}
/* ID login siswa (untuk izin baca hasil) lewat uid_map, per kelompok agar tidak satu per satu */
async function uidMapFor(sids) {
  const out = {};
  try {
    for (let i = 0; i < sids.length; i += 50) {
      (await listDocs('uid_map', [Q.equal('sid', sids.slice(i, i + 50))])).forEach((d) => { (out[d.sid] = out[d.sid] || []).push(d.$id); });
    }
  } catch (e) { /* izin tidak tersedia: hanya guru/admin yang membaca */ }
  return out;
}
const permsOf = (map, sid) => (map[sid] || []).slice(0, 3).map((i) => 'read("user:' + i + '")');

async function akhiriSemua(me, body) {
  needStaff(me);
  const sesiId = String(body.sesiId || ''); if (!ID_RE.test(sesiId)) throw new Fail('Sesi tidak valid.');
  const deadline = Date.now() + BUDGET_MS;
  const runs = await listDocs('soal_run', [Q.equal('sesiId', [sesiId])]), now = Date.now();
  const due = runs.filter((run) => !run.done && (run.stop === true || now > endOf(runState(run))));
  if (!due.length) return { ok: true, n: 0, sisa: 0, gagal: 0 };
  const sids = Array.from(new Set(due.map((r) => r.sid)));
  const aMap = await byIds('akun', sids), uMap = await uidMapFor(sids);
  const r = await jalankan(due, async (run) => {
    const d = aMap[run.sid], a = d ? Object.assign({ id: d.$id }, d) : { nama: '', kelas: '' };
    await selesaikan(run, me, { akun: a, perms: permsOf(uMap, run.sid) });
  }, deadline);
  if (r.ok) await catatAudit(me, 'nilai.akhiriSemua', sesiId, '', r.ok + ' peserta dinilai');
  return { ok: true, n: r.ok, gagal: r.gagal, sisa: due.length - r.ok, pesan: r.pesan };
}

/* guru/admin menilai satu jawaban uraian. Nilai ditulis lewat server supaya siswa tidak bisa mengubah skornya sendiri. */
async function nilaiUraian(me, body) {
  needStaff(me);
  const hid = String(body.hasilId || ''), qid = String(body.qid || '');
  if (!ID_RE.test(hid) || !ID_RE.test(qid)) throw new Fail('Data tidak valid.');
  const h = await tryGet('soal_hasil', hid); if (!h) throw new Fail('Hasil tidak ditemukan.', 404);
  if (h.mode !== 'ujian') throw new Fail('Hanya hasil ujian yang dinilai.', 400);
  const p = parse(h), ids = p.order || [];
  if (!ids.includes(qid)) throw new Fail('Soal tidak ada di hasil ini.', 400);
  const Qs = await loadQ(ids, true), q = Qs[qid];
  if (!q || q.tipe !== 'uraian') throw new Fail('Soal ini bukan uraian.', 400);
  const maks = q.maks || 1;
  let skor = Number(body.skor);
  if (!Number.isFinite(skor)) throw new Fail('Skor tidak valid.', 400);
  skor = Math.max(0, Math.min(maks, Math.round(skor * 100) / 100));
  const rub = Array.isArray(body.rub) ? body.rub.slice(0, 20).map((x) => Math.max(0, Math.min(maks, Number(x) || 0))) : undefined;
  const nu = Object.assign({}, p.nu || {});
  nu[qid] = { skor, mk: maks, rub, cat: String(body.cat || '').slice(0, 300), oleh: String(me.akun.nama || '').slice(0, 64), ts: Date.now() };
  const g = nilai(ids, Qs, p.ans || {}, nu);
  const next = Object.assign({}, p, { nu, pts: g.pts, pend: g.pend || undefined });
  await updateDoc('soal_hasil', hid, { score: g.score, benar: g.benar, payload: JSON.stringify(next) });
  await catatAudit(me, 'nilai.uraian', h.sesiId || '', h.siswa || '', 'soal ' + qid + ' skor ' + skor);
  return { ok: true, score: g.score, benar: g.benar, pend: g.pend || 0, nu: nu[qid] };
}

/* hitung ulang nilai hasil ujian satu sesi dengan kunci terbaru. Hasil yang soalnya sudah dihapus atau kuncinya hilang
   dilewati (tidak diubah) supaya nilai siswa tidak turun karena soal yang hilang. */
async function nilaiUlang(me, body) {
  needStaff(me);
  const sesiId = String(body.sesiId || ''); if (!ID_RE.test(sesiId)) throw new Fail('Sesi tidak valid.');
  memReset();
  const deadline = Date.now() + BUDGET_MS;
  const hs = (await listDocs('soal_hasil', [Q.equal('sesiId', [sesiId])])).filter((h) => h.mode === 'ujian');
  const pj = (h) => { try { return JSON.parse(h.payload || '{}'); } catch (e) { return null; } };
  const semua = Array.from(new Set(hs.reduce((a, h) => a.concat((pj(h) || {}).order || []), [])));
  const Qs = await loadQ(semua, true), kerja = []; let lewat = 0;
  hs.forEach((h) => {
    const p = pj(h), ids = (p && p.order) || [];
    if (!p || !ids.length || ids.some((id) => !Qs[id] || !Qs[id].key)) { lewat++; return; }
    const g = nilai(ids, Qs, p.ans || {}, p.nu);
    if (g.score !== h.score || g.benar !== h.benar || (g.pend || 0) !== (p.pend || 0)) kerja.push({ h, p, g });
  });
  const r = await jalankan(kerja, ({ h, p, g }) => updateDoc('soal_hasil', h.$id, { score: g.score, benar: g.benar, payload: JSON.stringify(Object.assign({}, p, { pts: g.pts, pend: g.pend || undefined })) }), deadline);
  if (r.ok) await catatAudit(me, 'nilai.ulang', sesiId, '', r.ok + ' nilai diperbarui');
  return { ok: true, total: hs.length, n: r.ok, gagal: r.gagal, sisa: kerja.length - r.ok, lewat, pesan: r.pesan };
}


/* ---------- Pengawas (guru, admin, proktor) ---------- */
function needPawas(me) { if (!me.staff && !me.proktor) throw new Fail('Hanya guru, admin, atau proktor.', 403); }
function sekolahOk(s, me) {
  if (me.admin) return;
  const sk = String(s.sekolah || '').toUpperCase(), ak = String((me.akun && me.akun.sekolah) || '').toUpperCase();
  if (sk && ak && ak !== 'ALL' && sk !== ak) throw new Fail('Sesi ini bukan untuk sekolahmu.', 403);
}
/* catatan audit: gagal menulis tidak boleh menggagalkan aksi (mis. koleksi audit belum dibuat) */
async function catatAudit(me, aksi, sesiId, target, ket) {
  try {
    const peran = me.admin ? 'admin' : me.staff ? 'guru' : me.proktor ? 'proktor' : '';
    await createDoc('audit', 'a' + Date.now().toString(36) + crypto.randomBytes(5).toString('hex'), {
      ts: Date.now(), aktor: String((me.akun && me.akun.$id) || '').slice(0, 36), nama: String((me.akun && me.akun.nama) || '').slice(0, 64), peran,
      aksi: String(aksi).slice(0, 40), sesiId: String(sesiId || '').slice(0, 36), target: String(target || '').slice(0, 64), ket: String(ket || '').slice(0, 300)
    });
  } catch (e) { /* abaikan */ }
}
async function sesiPawas(me, body) {
  const sesiId = String(body.sesiId || ''); if (!ID_RE.test(sesiId)) throw new Fail('Sesi tidak valid.');
  const sd = await sesiDoc(sesiId); if (!sd) throw new Fail('Sesi tidak ditemukan.', 404);
  const s = parse(sd); sekolahOk(s, me);
  return { sesiId, s };
}
async function rilisToken(me, body) {
  needPawas(me);
  const { sesiId, s } = await sesiPawas(me, body);
  if (!s.tok) throw new Fail('Sesi ini tidak memakai token.', 400);
  if (ruangList(s).length && !me.staff && !ruangSaya(s, me).length) throw new Fail('Kamu bukan proktor ruang mana pun di sesi ini.', 403);
  const kd = await tryGet('soal_kunci', 'tk_' + sesiId); let j = {};
  try { j = JSON.parse((kd && kd.payload) || '{}'); } catch (e) { j = {}; }
  const token = String(j.token || ''); if (!kd || !token) throw new Fail('Token sesi belum diatur guru.', 403);
  const raw = Number(body.menit), m = body.menit === undefined || Number.isNaN(raw) ? 15 : Math.max(0, Math.min(180, Math.round(raw))), now = Date.now();
  await updateDoc('soal_kunci', 'tk_' + sesiId, { payload: JSON.stringify({ token, rilis: m ? now : 0, berlaku: m }) });
  memo.tok.delete(sesiId);
  await catatAudit(me, m ? 'token.rilis' : 'token.tutup', sesiId, s.judul || '', m ? m + ' menit' : '');
  return { ok: true, token: m ? token : '', rilis: m ? now : 0, berlaku: m, now };
}
async function rosterSesi(s) {
  const key = String(s.kelas || 'ALL') + '|' + String(s.sekolah || ''), c = memGet(memo.ros, key, 30000); if (c) return c;
  const sk = String(s.sekolah || '').toUpperCase();
  const all = await listDocs('akun', s.kelas && s.kelas !== 'ALL' ? [Q.equal('kelas', [s.kelas])] : []);
  const ros = all.filter((a) => a.aktif !== false && /(^|[,\s])siswa([,\s]|$)/.test(String(a.peran || '')) && (!sk || !a.sekolah || String(a.sekolah).toUpperCase() === 'ALL' || String(a.sekolah).toUpperCase() === sk))
    .map((a) => ({ id: a.$id, nama: String(a.nama || ''), kelas: a.kelas || '' })).sort((x, y) => x.nama.localeCompare(y.nama, 'id'));
  return memSet(memo.ros, key, ros, 200);
}
async function pantau(me, body) {
  needPawas(me);
  const { sesiId, s } = await sesiPawas(me, body), now = Date.now();
  const [runs, ros0] = await Promise.all([listDocs('soal_run', [Q.equal('sesiId', [sesiId])]), rosterSesi(s)]);
  const by = {}; runs.forEach((r) => { by[r.sid] = r; });
  const rl = ruangList(s), rmap = {}; rl.forEach((r) => r.sis.forEach((x) => { rmap[x] = r; }));
  let ros = ros0;
  if (rl.length && !me.staff) {
    const mine = ruangSaya(s, me); if (!mine.length) throw new Fail('Kamu bukan proktor ruang mana pun di sesi ini.', 403);
    const ok = new Set(); mine.forEach((r) => r.sis.forEach((x) => ok.add(x)));
    ros = ros0.filter((a) => ok.has(a.id));
  }
  const batas = Number(s.batas) || 0;
  const peserta = ros.map((a) => {
    const run = by[a.id], o = { sid: a.id, nama: a.nama, kelas: a.kelas, k: 'belum' };
    if (rmap[a.id]) { o.ruang = String(rmap[a.id].nama || ''); o.gel = String(rmap[a.id].gel || ''); }
    if (!run) return o;
    o.rid = run.$id;
    if (run.done) { o.k = 'done'; return o; }
    const st = runState(run), ids = st.p.ids || [], ans = st.p.ans || {};
    o.sisa = Math.round((endOf(st) - now) / 1000); o.ext = st.ext; o.v = Math.max(0, (st.p.pindah || 0) - st.pb); o.tot = ids.length;
    o.ans = ids.filter((id) => ans[id] !== undefined && ans[id] !== null).length; o.seen = Math.max(0, Math.round((now - (Date.parse(run.$updatedAt) || st.start)) / 1000));
    const lock = s.aksi === 'kunci' && batas > 0 && o.v >= batas;
    o.k = lock ? 'lock' : (o.sisa <= 0 || st.stop) ? 'habis' : 'on';
    if (st.stop) o.stop = true;
    if (Number(st.p.izin) > now) o.izin = Math.round((st.p.izin - now) / 1000);
    return o;
  });
  const tok = { pakai: !!s.tok, wajib: !!s.tokR, token: '', rilis: 0, berlaku: 0, sisa: 0 };
  if (s.tok) {
    const ti = await tokenSesi(sesiId), aktif = tokAktif(ti, now);
    tok.rilis = ti.rilis; tok.berlaku = ti.berlaku; tok.sisa = aktif ? Math.round((ti.rilis + ti.berlaku * 60000 - now) / 1000) : 0;
    if (!s.tokR || aktif) tok.token = ti.token;
  }
  const saya = rl.length && !me.staff ? ruangSaya(s, me).map((r) => String(r.nama || '')) : [];
  return { ok: true, now, judul: s.judul || '', durasi: s.durasi || 0, batas, peserta, tok, saya };
}
async function aksiRun(me, body) {
  needPawas(me);
  const rid = String(body.rid || ''); if (!ID_RE.test(rid)) throw new Fail('Catatan ujian tidak valid.');
  const run = await tryGet('soal_run', rid); if (!run) throw new Fail('Catatan ujian tidak ditemukan.', 404);
  const sd = await sesiDoc(run.sesiId); sekolahOk(sd ? parse(sd) : {}, me);
  if (run.done) throw new Fail('Ujian ini sudah selesai.', 409);
  wajibRuangnya(parse(sd || {}), me, run.sid);
  const st = runState(run), op = String(body.op || ''); let data, ket;
  if (op === 'tambah') {
    const d = Number(body.detik); if (d !== 300 && d !== 900) throw new Fail('Tambahan waktu hanya 5 atau 15 menit.', 400);
    data = { ext: st.ext + d }; ket = '+' + (d / 60) + ' menit';
  } else if (op === 'izinPindah') {
    data = { payload: JSON.stringify(Object.assign({}, st.p, { izin: Date.now() + IZIN_MS })) }; ket = 'izin pindah perangkat ' + (IZIN_MS / 60000) + ' menit';
  } else if (op === 'bukaKunci') { data = { pb: st.p.pindah || 0 }; ket = 'buka kunci'; }
  else if (op === 'akhiri') { data = { stop: true }; ket = 'diakhiri pengawas'; }
  else throw new Fail('Aksi tidak dikenal.', 400);
  await updateDoc('soal_run', rid, data);
  const a = await tryGet('akun', run.sid).catch(() => null);
  await catatAudit(me, 'run.' + op, run.sesiId, (a && a.nama) || run.sid, ket);
  return { ok: true };
}
async function catat(me, body) {
  needPawas(me);
  const aksi = String(body.aksi || '');
  if (!/^[a-z][a-z0-9._-]{2,32}$/.test(aksi)) throw new Fail('Aksi tidak valid.', 400);
  await catatAudit(me, 'klien.' + aksi, ID_RE.test(String(body.sesiId || '')) ? body.sesiId : '', '', body.ket);
  return { ok: true };
}

export const _uji = { frac, nilai, cleanAns, runId, parse, memReset, semuaReset: () => { memReset(); memo.salah.clear(); inflight.clear(); } };
export const CBT_AKSI = new Set(['mulai', 'simpan', 'kirim', 'periksa', 'ulasan', 'akhiri', 'akhiriSemua', 'nilaiUlang', 'nilaiUraian', 'rilisToken', 'pantau', 'aksiRun', 'catat']);

/* Dipakai sebagai fungsi sendiri (default export) atau dipanggil dari fungsi lain, mis. akun-admin (lihat tools/gabung-cbt.mjs). */
export async function cbtHandle({ req, res, error, body }) {
  try {
    const callerId = req.headers['x-appwrite-user-id'];
    if (!callerId) return res.json({ ok: false, error: 'Harus login.' }, 401);
    KEY = req.headers['x-appwrite-key'] || '';
    const me = await whoami(callerId);
    switch (body.action) {
      case 'mulai': return res.json(await mulai(me, body));
      case 'simpan': return res.json(await simpan(me, body));
      case 'kirim': return res.json(body.mode === 'latihan' ? await kirimLatihan(me, body) : await kirimUjian(me, body));
      case 'periksa': return res.json(await periksa(me, body));
      case 'ulasan': return res.json(await ulasan(me, body));
      case 'akhiri': return res.json(await akhiri(me, body));
      case 'akhiriSemua': return res.json(await akhiriSemua(me, body));
      case 'nilaiUlang': return res.json(await nilaiUlang(me, body));
      case 'nilaiUraian': return res.json(await nilaiUraian(me, body));
      case 'rilisToken': return res.json(await rilisToken(me, body));
      case 'pantau': return res.json(await pantau(me, body));
      case 'aksiRun': return res.json(await aksiRun(me, body));
      case 'catat': return res.json(await catat(me, body));
      default: return res.json({ ok: false, error: 'Aksi tidak dikenal.' }, 400);
    }
  } catch (e) {
    if (e instanceof Fail) return res.json({ ok: false, error: e.message }, e.status);
    const msg = String((e && e.message) || e);
    error(msg);
    return res.json({ ok: false, error: 'Kesalahan server: ' + msg.slice(0, 160) }, 500);
  }
}

export default async ({ req, res, error }) => {
  let body = {};
  try { body = req.bodyJson || JSON.parse(req.bodyText || req.body || '{}'); } catch (e) { return res.json({ ok: false, error: 'Data tidak valid.' }, 400); }
  return cbtHandle({ req, res, error, body });
};
