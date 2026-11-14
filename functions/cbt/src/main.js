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
     akhiriSemua {sesiId}                      guru/admin: nilai semua peserta yang waktunya habis atau diakhiri. -> {n}
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
  if (kdoc) { try { const k = JSON.parse(kdoc.payload || '{}'); if (k.kunci !== undefined || k.rk) return k; } catch (e) { /* lanjut */ } }
  if (soal.tipe === 'kategori' && Array.isArray(soal.rows) && soal.rows.every((r) => typeof r[1] === 'boolean')) return { rk: soal.rows.map((r) => !!r[1]), bahas: soal.bahas || '' };
  if (soal.kunci !== undefined) return { kunci: soal.kunci, bahas: soal.bahas || '' };
  return null;
}
/* kumpulkan {tipe, n, key} tiap soal; bawaan dari bawaan.json */
async function loadQ(ids) {
  const own = ids.filter((id) => !BAWAAN[id]);
  const docs = own.length ? await byIds('banksoal', own) : {};
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
    out[id] = { id, bawaan: false, tipe: s.tipe, n: s.tipe === 'kategori' ? (s.rows || []).length : (s.opts || []).length, key,
      aktif: s.aktif !== false, tujuan: s.tujuan || 'keduanya', kelas: s.kelas || '' };
  });
  return out;
}
function frac(q, a) {
  if (!q || !q.key || a == null) return 0;
  const k = q.key;
  if (q.tipe === 'pg') return a === k.kunci ? 1 : 0;
  if (q.tipe === 'kompleks') {
    const sel = Array.isArray(a) ? a : []; if (!sel.length || !Array.isArray(k.kunci) || !k.kunci.length) return 0;
    let b = 0, s = 0; sel.forEach((i) => { if (k.kunci.indexOf(i) > -1) b++; else s++; });
    return Math.max(0, (b - s) / k.kunci.length);
  }
  if (q.tipe === 'kategori') {
    if (!Array.isArray(a) || !Array.isArray(k.rk) || !k.rk.length) return 0;
    let n = 0; k.rk.forEach((v, i) => { if (a[i] === (v ? 0 : 1)) n++; });
    return n / k.rk.length;
  }
  return 0;
}
function cleanAns(ans, ids) {
  const out = {}; if (!ans || typeof ans !== 'object') return out;
  const ok = (v) => v === null || (Number.isInteger(v) && v >= 0 && v < 10);
  ids.forEach((id) => {
    const v = ans[id]; if (v === undefined) return;
    if (Array.isArray(v)) { if (v.length <= 10 && v.every(ok)) out[id] = v; }
    else if (Number.isInteger(v) && v >= 0 && v < 10) out[id] = v;
  });
  return out;
}
function nilai(ids, Qs, ans) {
  let sum = 0, ben = 0;
  ids.forEach((id) => { const q = Qs[id]; if (!q) return; const f = frac(q, ans[id]); sum += f; if (f >= 0.9999) ben++; });
  const tot = ids.length;
  return { score: tot ? Math.round(sum / tot * 100) : 0, benar: ben, total: tot, pts: +sum.toFixed(2) };
}
function kcOf(ids, Qs) {
  const kc = {};
  ids.forEach((id) => { const q = Qs[id]; if (q && q.key) kc[id] = q.key; });
  return kc;
}

/* ---------- Pengguna ---------- */
async function whoami(callerId) {
  const u = await aw('GET', '/users/' + encodeURIComponent(callerId));
  const labels = u.labels || [], staff = labels.includes('guru') || labels.includes('admin');
  const email = String(u.email || '').trim().toLowerCase();
  if (!email) throw new Fail('Akun login tidak punya email.', 400);
  const f = await listDocs('akun', [Q.equal('email', [email]), Q.limit(1)]);
  const akun = f[0];
  if (!akun) throw new Fail('Email belum terdaftar di daftar akun.', 404);
  if (akun.aktif === false) throw new Fail('Akun nonaktif.', 403);
  return { id: callerId, staff, akun };
}
function sesiBoleh(s, akun, now) {
  if (s.aktif === false) throw new Fail('Sesi ujian tidak aktif.', 403);
  if (s.mulai && now < s.mulai) throw new Fail('Sesi belum dibuka.', 403);
  if (s.selesai && now > s.selesai) throw new Fail('Sesi sudah ditutup.', 403);
  if (s.kelas && s.kelas !== 'ALL' && s.kelas !== akun.kelas) throw new Fail('Sesi ini bukan untuk kelasmu.', 403);
  const sk = String(s.sekolah || '').toUpperCase(), ak = String(akun.sekolah || '').toUpperCase();
  if (sk && ak && ak !== 'ALL' && sk !== ak) throw new Fail('Sesi ini bukan untuk sekolahmu.', 403);
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
  const sd = await tryGet('soal_sesi', sesiId); if (!sd) throw new Fail('Sesi tidak ditemukan.', 404);
  const s = parse(sd), now = Date.now(), sid = me.akun.$id, rid = runId(sesiId, sid);
  const ex = await tryGet('soal_run', rid);
  if (ex) {
    if (ex.done) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409);
    return resumeResp(ex, s, now);
  }
  sesiBoleh(s, me.akun, now);
  if (s.tok) {
    const kd = await tryGet('soal_kunci', 'tk_' + sesiId);
    let tk = ''; try { tk = String(JSON.parse((kd && kd.payload) || '{}').token || ''); } catch (e) { tk = ''; }
    const got = String(body.token || '').trim().toUpperCase();
    if (!tk) throw new Fail('Token sesi belum diatur guru.', 403);
    if (!got || !same(got, tk.toUpperCase())) throw new Fail('Token salah.', 403);
  }
  if (await tryGet('soal_hasil', 'h' + rid.slice(1))) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409);
  let ids;
  const all = (await listDocs('banksoal')).map(parse).filter((q) => !BAWAAN[q.id] && !q.bawaan && q.aktif !== false && (q.tujuan === 'keduanya' || q.tujuan === 'ujian' || !q.tujuan));
  const okKelas = (q) => !q.kelas || !me.akun.kelas || q.kelas === me.akun.kelas;
  if (s.pilih === 'manual') {
    const have = {}; all.forEach((q) => { have[q.id] = 1; });
    ids = (s.ids || []).filter((id) => have[id]);
    if (s.acak !== false) ids = shuffle(ids);
  } else {
    const mf = s.mapelF || [];
    const pool = shuffle(all.filter((q) => okKelas(q) && (!mf.length || mf.indexOf(q.mapel) > -1)));
    ids = pool.slice(0, s.jumlah || pool.length).map((q) => q.id);
  }
  if (!ids.length) throw new Fail('Sesi ini belum memiliki soal.', 400);
  const Qs = await loadQ(ids), oo = {};
  ids.forEach((id) => { const q = Qs[id]; if (q && q.tipe !== 'kategori') { const ix = Array.from({ length: q.n }, (_, i) => i); oo[id] = s.acak !== false ? shuffle(ix) : ix; } });
  const dur = (s.durasi || 0) * 60;
  const p = { mode: 'ujian', sesiId, sesiJudul: s.judul || '', dur, ids, oo, ans: {}, cur: 0, chk: {}, pindah: 0, rg: {}, tampil: !!s.tampil, kkm: s.kkm };
  let doc;
  try {
    doc = await createDoc('soal_run', rid, { sid, sesiId, ts: now, done: false, payload: JSON.stringify(p), ext: 0, stop: false, pb: 0 }, userRead(me.id));
  } catch (e) {
    if (e.code === 409) { const again = await getDoc('soal_run', rid); if (again.done) throw new Fail('Kamu sudah mengerjakan sesi ini.', 409); return resumeResp(again, s, now); }
    throw e;
  }
  return respRun(doc, s, now, false);
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
  const old = await tryGet('soal_hasil', hid);
  if (old) { if (!run.done) await updateDoc('soal_run', run.$id, { done: true }); return { hasil: old, p: parse(old), dup: true, ids, Qs: await loadQ(ids) }; }
  const Qs = await loadQ(ids);
  const ans = opt.ans ? Object.assign({}, p.ans || {}, cleanAns(opt.ans, ids)) : (p.ans || {});
  const g = nilai(ids, Qs, ans);
  const end = endOf(st), t = Math.min(now, end);
  const akun = opt.akun || me.akun;
  const data = { ts: now, sid: run.sid, siswa: String(akun.nama || '').slice(0, 128), kelas: akun.kelas || '', mode: 'ujian', sesiId: run.sesiId, sesiJudul: String(p.sesiJudul || '').slice(0, 160),
    score: g.score, benar: g.benar, total: g.total, detik: Math.max(0, Math.min(Math.round((t - st.start) / 1000), st.dur + st.ext)),
    payload: JSON.stringify({ ans, order: ids, oo: p.oo || {}, pindah: Math.max(p.pindah || 0, opt.pindah || 0), pts: g.pts, tampil: !!p.tampil, kkm: p.kkm }) };
  let doc;
  try { doc = await createDoc('soal_hasil', hid, data, opt.perms || userRead(me.id)); }
  catch (e) { if (e.code === 409) doc = await getDoc('soal_hasil', hid); else throw e; }
  const pindahAkhir = Math.max(p.pindah || 0, opt.pindah || 0);
  await updateDoc('soal_run', run.$id, { done: true, payload: JSON.stringify(Object.assign({}, p, { ans, pindah: pindahAkhir })) });
  return { hasil: doc, p: parse(doc), ids, Qs };
}
function hasilOut(h) { return { id: h.$id, ts: h.ts, score: h.score, benar: h.benar, total: h.total, detik: h.detik }; }

async function kirimUjian(me, body) {
  const run = await ownRun(me, body.rid), st = runState(run), now = Date.now();
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
  ids = ids.filter((id) => Qs[id] && Qs[id].aktif && (Qs[id].tujuan === 'keduanya' || Qs[id].tujuan === 'latihan'));
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
  if (!q || !q.aktif || !(q.tujuan === 'keduanya' || q.tujuan === 'latihan')) throw new Fail('Soal tidak tersedia untuk latihan.', 403);
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
  return { ok: true, kc: kcOf(ids, Qs) };
}

function needStaff(me) { if (!me.staff) throw new Fail('Hanya guru atau admin.', 403); }
async function akun(sid) { const d = await tryGet('akun', sid); return d ? Object.assign({ id: d.$id }, d) : null; }

async function akhiri(me, body) {
  needStaff(me);
  const run = await ownRun(me, body.rid);
  if (run.done) return { ok: true, done: true };
  const a = await akun(run.sid);
  const r = await selesaikan(run, me, { akun: a || { nama: '', kelas: '' }, perms: await permsFor(run.sid, me) });
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
async function akhiriSemua(me, body) {
  needStaff(me);
  const sesiId = String(body.sesiId || ''); if (!ID_RE.test(sesiId)) throw new Fail('Sesi tidak valid.');
  const runs = await listDocs('soal_run', [Q.equal('sesiId', [sesiId])]), now = Date.now();
  let n = 0;
  for (const run of runs) {
    if (run.done) continue;
    const st = runState(run);
    if (!(run.stop === true || now > endOf(st))) continue;
    const a = await akun(run.sid);
    await selesaikan(run, me, { akun: a || { nama: '', kelas: '' }, perms: await permsFor(run.sid, me) });
    n++;
  }
  return { ok: true, n };
}

export const _uji = { frac, nilai, cleanAns, runId, parse };
export const CBT_AKSI = new Set(['mulai', 'simpan', 'kirim', 'periksa', 'ulasan', 'akhiri', 'akhiriSemua']);

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
