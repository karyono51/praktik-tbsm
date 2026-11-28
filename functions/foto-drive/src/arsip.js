/* Arsip absensi mingguan ke Drive (harian: koleksi observasi; pkl: koleksi pkl_catat). Hanya admin.
   Berkas dibaca ulang dan dicocokkan. Tahap ini TIDAK menghapus dokumen Appwrite. */
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
  docs.forEach((d) => peta.set(d.$id, d));
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
