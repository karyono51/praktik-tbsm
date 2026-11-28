/* Arsip absensi mingguan ke Drive (harian: koleksi observasi; pkl: koleksi pkl_catat). Hanya admin.
   Berkas dibaca ulang dan dicocokkan. Penghapusan lewat aksi terpisah, hanya absensi harian. */
const SUMBER = {
  harian: { col: 'observasi', cocok: (d) => d.tipe === 'absen', q: [] },
  pkl: { col: 'pkl_catat', cocok: (d) => d.jenis === 'absen', q: [{ method: 'equal', attribute: 'jenis', values: ['absen'] }] }
};
export function rentang(senin) {
  const t = Date.parse(senin + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(senin) || isNaN(t) || new Date(t).getUTCDay() !== 1) return null;
  return [senin, new Date(t + 6 * 86400000).toISOString().slice(0, 10)];
}
export async function arsipAbsen(callerId, body, auth, key, h) {
  const { aw, accessToken, folderId, gfetch, Fail } = h;
  const s = SUMBER[body.jenis], r = rentang(String(body.minggu || ''));
  if (!s || !r) throw new Fail('Permintaan tidak valid (jenis atau tanggal Senin).', 400);
  const u = await aw('/users/' + encodeURIComponent(callerId), { 'X-Appwrite-Key': key || '' });
  if (!(u.labels || []).includes('admin')) throw new Fail('Hanya admin yang boleh mengarsipkan.', 403);
  if (r[1] >= new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)) throw new Fail('Minggu ini belum selesai.', 400);
  const docs = [];
  let after = null;
  for (;;) {
    const p = new URLSearchParams();
    [...s.q, { method: 'limit', values: [100] }, ...(after ? [{ method: 'cursorAfter', values: [after] }] : [])]
      .forEach((q) => p.append('queries[]', JSON.stringify(q)));
    const L = (await aw('/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/' + s.col + '/documents?' + p, auth)).documents || [];
    L.forEach((d) => { const t = String(d.tanggal || '').slice(0, 10); if (s.cocok(d) && t >= r[0] && t <= r[1]) docs.push(d); });
    if (L.length < 100) break;
    after = L[L.length - 1].$id;
  }
  if (!docs.length) return { ok: true, jumlah: 0 };
  const tok = await accessToken(), parent = await folderId(tok);
  const nama = 'arsip-absen_' + body.jenis + '_' + r[0] + '.json';
  const q = encodeURIComponent("name='" + nama + "' and '" + parent + "' in parents and trashed=false");
  const cari = await gfetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)', {}, tok);
  if (!cari.ok) throw new Fail('Gagal memeriksa arsip di Drive (' + cari.status + ').', 502);
  let id = (((await cari.json()).files || [])[0] || {}).id;
  const unduh = async () => {
    const x = await gfetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', {}, tok);
    if (!x.ok) throw new Fail('Arsip tidak bisa dibaca (' + x.status + ').', 502);
    return x.text();
  };
  /* arsip lama digabung menurut ID, jadi dokumen yang sudah pernah diarsipkan tidak hilang */
  const peta = new Map();
  if (id) JSON.parse(await unduh()).dokumen.forEach((d) => peta.set(d.$id, d));
  docs.forEach((d) => peta.set(d.$id, gabung(peta.get(d.$id), d)));
  const isi = JSON.stringify({ v: 1, jenis: body.jenis, dari: r[0], sampai: r[1], dibuat: new Date().toISOString(), dokumen: [...peta.values()] });
  if (!id) {
    const c = await gfetch('https://www.googleapis.com/drive/v3/files?fields=id', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: nama, parents: [parent], mimeType: 'application/json', appProperties: { kind: 'arsip-absen' } }) }, tok);
    id = (await c.json().catch(() => ({}))).id;
    if (!c.ok || !id) throw new Fail('Gagal membuat berkas arsip (' + c.status + ').', 502);
  }
  const w = await gfetch('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: isi }, tok);
  if (!w.ok) throw new Fail('Gagal menulis arsip (' + w.status + ').', 502);
  if ((await unduh()) !== isi) throw new Fail('Verifikasi arsip gagal: isi di Drive tidak sama.', 502);
  return { ok: true, jumlah: docs.length, total: peta.size, fileId: id };
}

/* sesi yang dibuat ulang setelah dihapus (ID sama, waktu buat beda) digabung per siswa agar isi arsip lama tidak tertimpa */
export function gabung(lama, baru) {
  if (!lama || !lama.$createdAt || lama.$createdAt === baru.$createdAt) return baru;
  const a = JSON.parse(lama.payload || '{}'), b = JSON.parse(baru.payload || '{}');
  const rows = { ...a.rows, ...b.rows };
  return { ...baru, payload: JSON.stringify({ ...a, ...b, rows }), skor: Object.values(rows).filter((x) => x.s === 'H').length };
}
async function cariArsip(minggu, tok, parent, h) {
  const q = encodeURIComponent("name='arsip-absen_harian_" + minggu + ".json' and '" + parent + "' in parents and trashed=false");
  const c = await h.gfetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)', {}, tok);
  if (!c.ok) throw new h.Fail('Gagal memeriksa arsip di Drive (' + c.status + ').', 502);
  const f = ((await c.json()).files || [])[0];
  if (!f) return null;
  const x = await h.gfetch('https://www.googleapis.com/drive/v3/files/' + f.id + '?alt=media', {}, tok);
  if (!x.ok) throw new h.Fail('Arsip tidak bisa dibaca (' + x.status + ').', 502);
  return JSON.parse(await x.text()).dokumen;
}
async function peran(callerId, key, h) {
  return (await h.aw('/users/' + encodeURIComponent(callerId), { 'X-Appwrite-Key': key || '' })).labels || [];
}
/* guru hanya menerima sesi miliknya; admin menerima semua */
export async function bacaArsip(callerId, body, key, h) {
  const L = await peran(callerId, key, h), adm = L.includes('admin');
  if (!adm && !L.includes('guru')) throw new h.Fail('Hanya guru atau admin.', 403);
  const m = (Array.isArray(body.minggu) ? body.minggu : []).slice(0, 6).filter((x) => rentang(String(x)));
  const tok = await h.accessToken(), parent = await h.folderId(tok), dokumen = [];
  for (const w of m) ((await cariArsip(w, tok, parent, h)) || []).forEach((d) => { if (adm || d.pengamatId === callerId) dokumen.push(d); });
  return { ok: true, dokumen };
}
/* hapus hanya dokumen yang sudah ada di arsip dan tidak berubah sejak diarsipkan; dibatasi per panggilan agar tidak melewati batas waktu */
export async function hapusArsip(callerId, body, auth, key, h) {
  if (!(await peran(callerId, key, h)).includes('admin')) throw new h.Fail('Hanya admin yang boleh menghapus.', 403);
  if (!rentang(String(body.minggu || ''))) throw new h.Fail('Tanggal Senin tidak valid.', 400);
  const tok = await h.accessToken(), L = await cariArsip(body.minggu, tok, await h.folderId(tok), h);
  if (!L) throw new h.Fail('Minggu ini belum diarsipkan.', 400);
  const mulai = Math.max(0, Number(body.mulai) || 0), ids = [];
  let berubah = 0;
  for (const d of L.slice(mulai, mulai + 20)) {
    const path = '/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/observasi/documents/' + encodeURIComponent(d.$id);
    let now;
    try { now = await h.aw(path, auth); } catch (e) { if (/\(404\)/.test(e.message)) { ids.push(d.$id); continue; } throw e; }
    if (now.tipe !== 'absen' || now.$updatedAt !== d.$updatedAt) { berubah++; continue; }
    await h.hapusDok(path, auth);
    ids.push(d.$id);
  }
  return { ok: true, ids, berubah, lanjut: mulai + 20 < L.length ? mulai + 20 : null };
}

/* Kehadiran milik pemanggil saja. Identitas dari sesi login (email -> dokumen akun); isian dari aplikasi tidak dipercaya. */
export async function absenSaya(callerId, body, key, h) {
  const r = rentang(String(body.minggu || ''));
  if (!r) throw new h.Fail('Tanggal Senin tidak valid.', 400);
  if (!key) throw new h.Fail('Izin fungsi belum lengkap (users.read dan documents.read).', 500);
  const auth = { 'X-Appwrite-Key': key }, db = '/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/';
  const daftar = async (col, qs) => {
    const p = new URLSearchParams();
    qs.forEach((q) => p.append('queries[]', JSON.stringify(q)));
    return (await h.aw(db + col + '/documents?' + p, auth)).documents || [];
  };
  const email = String((await h.aw('/users/' + encodeURIComponent(callerId), auth)).email || '').toLowerCase();
  const akun = email && (await daftar('akun', [{ method: 'equal', attribute: 'email', values: [email] }, { method: 'limit', values: [1] }]))[0];
  if (!akun || akun.aktif === false) throw new h.Fail('Akun siswa tidak ditemukan.', 403);
  const peta = new Map(), tok = await h.accessToken();
  ((await cariArsip(r[0], tok, await h.folderId(tok), h)) || []).forEach((d) => peta.set(d.$id, d));
  /* ts = waktu ubah terakhir (berindeks), jadi sesi minggu ini pasti ber-ts sesudah Senin dikurangi satu hari */
  let after = null;
  for (;;) {
    const L = await daftar('observasi', [{ method: 'greaterThanEqual', attribute: 'ts', values: [Date.parse(r[0] + 'T00:00:00Z') - 86400000] },
      { method: 'limit', values: [100] }, ...(after ? [{ method: 'cursorAfter', values: [after] }] : [])]);
    L.forEach((d) => { if (d.tipe === 'absen' && d.tanggal >= r[0] && d.tanggal <= r[1]) peta.set(d.$id, gabung(peta.get(d.$id), d)); });
    if (L.length < 100) break;
    after = L[L.length - 1].$id;
  }
  const sesi = [];
  peta.forEach((d) => {
    let x;
    try { x = JSON.parse(d.payload || '{}').rows[akun.$id]; } catch (e) { return; }
    if (x) sesi.push({ tanggal: d.tanggal, status: x.s, mapel: d.mapel, guru: d.guru });
  });
  sesi.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  return { ok: true, sesi };
}
