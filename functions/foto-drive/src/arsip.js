/* Arsip absensi mingguan ke Drive (harian: koleksi observasi; pkl: koleksi pkl_catat). Hanya admin.
   Berkas dibaca ulang dan dicocokkan. Penghapusan lewat aksi terpisah. */
const SUMBER = {
  harian: { col: 'observasi', cocok: (d) => d.tipe === 'absen', q: [] },
  pkl: { col: 'pkl_catat', cocok: (d) => d.jenis === 'absen', q: [{ method: 'equal', attribute: 'jenis', values: ['absen'] }] }
};
const SEKOLAH = ['DF', 'MEDINA'];
const kodeSekolah = (v) => { const k = String(v || '').trim().toUpperCase(); return SEKOLAH.includes(k) ? k : ''; };
/* pemilah per sekolah untuk arsip dan hapus. Sekolah ditentukan dari akun siswa; admin yang terikat satu sekolah tidak boleh memproses sekolah lain. */
async function pemilahSekolah(callerId, body, jenis, key, h) {
  const sk = kodeSekolah(body.sekolah);
  if (!sk) throw new h.Fail('Sekolah belum dipilih. Perbarui aplikasi lalu pilih sekolah.', 400);
  const auth = { 'X-Appwrite-Key': key || '' }, akun = [];
  let after = null;
  for (;;) {
    const p = new URLSearchParams();
    [{ method: 'limit', values: [100] }, ...(after ? [{ method: 'cursorAfter', values: [after] }] : [])].forEach((q) => p.append('queries[]', JSON.stringify(q)));
    const L = (await h.aw('/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/akun/documents?' + p, auth)).documents || [];
    akun.push(...L);
    if (L.length < 100) break;
    after = L[L.length - 1].$id;
  }
  const email = String((await h.aw('/users/' + encodeURIComponent(callerId), auth)).email || '').toLowerCase();
  const saya = akun.find((a) => email && String(a.email || '').toLowerCase() === email);
  const milik = kodeSekolah(saya && saya.sekolah);
  if (milik && milik !== sk) throw new h.Fail('Akun Anda hanya boleh memproses sekolahnya sendiri.', 403);
  const peta = new Map(akun.map((a) => [a.$id, kodeSekolah(a.sekolah)]));
  return (d) => {
    if (jenis === 'pkl') return (peta.get(d.sid) || kodeSekolah(d.sekolah)) === sk;
    let ids = [];
    try { ids = Object.keys(JSON.parse(d.payload || '{}').rows || {}); } catch (e) { return false; }
    /* sesi campuran atau berisi siswa tanpa sekolah tidak diproses */
    return ids.length > 0 && ids.every((i) => peta.get(i) === sk);
  };
}
export function rentang(senin) {
  const t = Date.parse(senin + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(senin) || isNaN(t) || new Date(t).getUTCDay() !== 1) return null;
  return [senin, new Date(t + 6 * 86400000).toISOString().slice(0, 10)];
}
const DB = () => encodeURIComponent(process.env.DB_ID || 'tbsm');
const slug = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
/* rombel aktif sebuah sekolah: ID siswa -> nama rombel (koleksi akademik, jenis kelas). Hanya untuk mengelompokkan berkas PKL, yang tidak menyimpan rombel. */
async function petaRombel(sk, key, h) {
  const auth = { 'X-Appwrite-Key': key || '' }, docs = [];
  let after = null;
  for (;;) {
    const p = new URLSearchParams();
    [{ method: 'equal', attribute: 'jenis', values: ['kelas'] }, { method: 'limit', values: [100] }, ...(after ? [{ method: 'cursorAfter', values: [after] }] : [])]
      .forEach((q) => p.append('queries[]', JSON.stringify(q)));
    const L = (await h.aw('/databases/' + DB() + '/collections/akademik/documents?' + p, auth)).documents || [];
    docs.push(...L);
    if (L.length < 100) break;
    after = L[L.length - 1].$id;
  }
  const peta = new Map();
  docs.filter((d) => kodeSekolah(d.sekolah) === sk).sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id', { numeric: true })).forEach((d) => {
    let x; try { x = JSON.parse(d.payload || '{}'); } catch (e) { return; }
    if (x.aktif === false) return;
    (x.anggota || []).forEach((id) => { if (!peta.has(id)) peta.set(id, String(d.nama || x.nama || '')); });
  });
  return peta;
}
/* nama berkas per sekolah dan rombel. Pengelompokan hanya pengaturan letak: pembacaan selalu menggabungkan semua berkas minggu itu menurut ID dokumen. */
export function namaBerkas(jenis, senin, sk, label) {
  return 'arsip-absen_' + jenis + '_' + senin + '_' + sk + '_' + (slug(label) || 'tanpa-rombel') + '.json';
}
function labelRombel(jenis, d, peta) {
  if (jenis === 'pkl') return peta.get(d.sid) || '';
  try { const p = JSON.parse(d.payload || '{}'); return p.rn || (p.rb ? String(p.rb) : '') || (d.kelas ? 'kelas-' + d.kelas : ''); } catch (e) { return ''; }
}
/* Pembacaan sumber dibatasi waktu ubah di server ($updatedAt, bukan jam HP): dokumen sebuah minggu pasti diubah pada atau sesudah minggu itu,
   kecuali sesi yang dibuat lebih dari 7 hari lebih awal dari tanggalnya. Tanpa batas atas, jadi koreksi yang dilakukan belakangan tetap terbaca.
   Appwrite menghitung tiap dokumen yang dibaca, jadi ini mencegah pembacaan seluruh riwayat setiap kali arsip dijalankan.
   Bila Appwrite menolak kueri (400), dipakai pembacaan penuh seperti sebelumnya; galat lain tidak ditelan. */
const MARGIN_HARI = 7;
async function bacaSumber(s, r, auth, h) {
  const dasar = '/databases/' + DB() + '/collections/' + s.col + '/documents?';
  const baca = async (tambahan) => {
    const hasil = [];
    let after = null;
    for (;;) {
      const p = new URLSearchParams();
      [...s.q, ...tambahan, { method: 'limit', values: [100] }, ...(after ? [{ method: 'cursorAfter', values: [after] }] : [])]
        .forEach((q) => p.append('queries[]', JSON.stringify(q)));
      const L = (await h.aw(dasar + p, auth)).documents || [];
      hasil.push(...L);
      if (L.length < 100) return { hasil, dibaca: hasil.length };
      after = L[L.length - 1].$id;
    }
  };
  const sejak = new Date(Date.parse(r[0] + 'T00:00:00Z') - MARGIN_HARI * 86400000).toISOString();
  try {
    return { ...(await baca([{ method: 'greaterThanEqual', attribute: '$updatedAt', values: [sejak] }])), penyaring: 'tanggal' };
  } catch (e) {
    if (!/\(400\)/.test(String(e && e.message))) throw e;
    return { ...(await baca([])), penyaring: 'penuh' };
  }
}
export async function arsipAbsen(callerId, body, auth, key, h) {
  const { aw, accessToken, folderId, Fail } = h;
  const s = SUMBER[body.jenis], r = rentang(String(body.minggu || ''));
  if (!s || !r) throw new Fail('Permintaan tidak valid (jenis atau tanggal Senin).', 400);
  const u = await aw('/users/' + encodeURIComponent(callerId), { 'X-Appwrite-Key': key || '' });
  if (!(u.labels || []).includes('admin')) throw new Fail('Hanya admin yang boleh mengarsipkan.', 403);
  if (r[1] >= new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)) throw new Fail('Minggu ini belum selesai.', 400);
  const punya = await pemilahSekolah(callerId, body, body.jenis, key, h), sk = kodeSekolah(body.sekolah);
  const docs = [], { hasil, dibaca, penyaring } = await bacaSumber(s, r, auth, h);
  hasil.forEach((d) => { const t = String(d.tanggal || '').slice(0, 10); if (s.cocok(d) && t >= r[0] && t <= r[1] && punya(d)) docs.push(d); });
  if (!docs.length) return { ok: true, jumlah: 0, dibaca, penyaring };
  const rombel = body.jenis === 'pkl' ? await petaRombel(sk, key, h) : null;
  const grup = new Map();
  docs.forEach((d) => {
    const label = labelRombel(body.jenis, d, rombel), nama = namaBerkas(body.jenis, r[0], sk, label);
    if (!grup.has(nama)) grup.set(nama, { label: label || 'tanpa rombel', docs: [] });
    grup.get(nama).docs.push(d);
  });
  const tok = await accessToken(), parent = await folderId(tok);
  /* berkas rombel ditulis bersamaan (maks. 4) agar tidak melewati batas waktu fungsi; tiap berkas bebas dan idempoten, jadi galat sebagian aman diulang */
  const tulis = await paralel([...grup], ([nama, g]) => tulisArsip(nama, g.docs, { jenis: body.jenis, r, sk, label: g.label, tok, parent, h }), 4);
  const berkas = [...grup].map(([nama, g], i) => ({ nama, rombel: g.label, jumlah: g.docs.length, fileId: tulis[i].fileId }));
  const total = tulis.reduce((a, w) => a + w.total, 0);
  return { ok: true, jumlah: docs.length, total, berkas: berkas.length, daftar: berkas, dibaca, penyaring };
}
/* satu berkas: arsip lama berkas yang sama digabung menurut ID (dokumen yang pernah diarsipkan tidak hilang), ditulis, lalu dibaca ulang dan dicocokkan */
async function tulisArsip(nama, docs, c) {
  const { gfetch, Fail } = c.h, { tok, parent } = c;
  const q = encodeURIComponent("name='" + nama + "' and '" + parent + "' in parents and trashed=false");
  const cari = await gfetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)', {}, tok);
  if (!cari.ok) throw new Fail('Gagal memeriksa arsip di Drive (' + cari.status + ').', 502);
  let id = (((await cari.json()).files || [])[0] || {}).id;
  const unduh = async () => {
    const x = await gfetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', {}, tok);
    if (!x.ok) throw new Fail('Arsip tidak bisa dibaca (' + x.status + ').', 502);
    return x.text();
  };
  const peta = new Map();
  if (id) JSON.parse(await unduh()).dokumen.forEach((d) => peta.set(d.$id, d));
  docs.forEach((d) => peta.set(d.$id, gabung(peta.get(d.$id), d)));
  const isi = JSON.stringify({ v: 1, jenis: c.jenis, dari: c.r[0], sampai: c.r[1], sekolah: c.sk, rombel: c.label, dibuat: new Date().toISOString(), dokumen: [...peta.values()] });
  if (!id) {
    const m = await gfetch('https://www.googleapis.com/drive/v3/files?fields=id', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: nama, parents: [parent], mimeType: 'application/json', appProperties: { kind: 'arsip-absen' } }) }, tok);
    id = (await m.json().catch(() => ({}))).id;
    if (!m.ok || !id) throw new Fail('Gagal membuat berkas arsip (' + m.status + ').', 502);
  }
  const w = await gfetch('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: isi }, tok);
  if (!w.ok) throw new Fail('Gagal menulis arsip (' + w.status + ').', 502);
  if ((await unduh()) !== isi) throw new Fail('Verifikasi arsip gagal: isi di Drive tidak sama.', 502);
  return { fileId: id, total: peta.size };
}

/* sesi yang dibuat ulang setelah dihapus (ID sama, waktu buat beda) digabung per siswa agar isi arsip lama tidak tertimpa */
export function gabung(lama, baru) {
  if (!lama || !lama.$createdAt || lama.$createdAt === baru.$createdAt) return baru;
  const a = JSON.parse(lama.payload || '{}'), b = JSON.parse(baru.payload || '{}');
  const rows = { ...a.rows, ...b.rows };
  return { ...baru, payload: JSON.stringify({ ...a, ...b, rows }), skor: Object.values(rows).filter((x) => x.s === 'H').length };
}
/* Semua berkas arsip sebuah jenis: berkas lama (arsip-absen_<jenis>_<Senin>.json) dan berkas per rombel (..._<Senin>_<sekolah>_<rombel>.json).
   Daftar diambil lewat penanda appProperties atau awalan nama, lalu disaring ketat menurut nama di sini. */
const NAMA_RE = /^arsip-absen_(harian|pkl)_(\d{4}-\d{2}-\d{2})(?:_(.+))?\.json$/;
async function daftarBerkas(jenis, tok, parent, h) {
  const dasar = "'" + parent + "' in parents and trashed=false and ";
  /* kueri utama (penanda appProperties) wajib berhasil; kueri awalan nama hanya tambahan untuk berkas yang dibuat tanpa penanda */
  const [utama, nama] = await Promise.all([
    halamanBerkas(dasar + "appProperties has { key='kind' and value='arsip-absen' }", tok, h, true),
    halamanBerkas(dasar + "name contains 'arsip-absen_'", tok, h, false),
  ]);
  const unik = new Map();
  [...utama, ...nama].forEach((f) => { const m = NAMA_RE.exec(String(f.name)); if (m && m[1] === jenis) unik.set(f.id, { id: f.id, name: f.name, minggu: m[2] }); });
  return [...unik.values()];
}
async function halamanBerkas(kueri, tok, h, wajib) {
  const out = [], q = encodeURIComponent(kueri);
  let pt = '';
  try {
    for (let i = 0; i < 20; i++) {
      const c = await h.gfetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name),nextPageToken&pageSize=1000' + (pt ? '&pageToken=' + encodeURIComponent(pt) : ''), {}, tok);
      if (!c.ok) throw new h.Fail('Gagal memeriksa arsip di Drive (' + c.status + ').', 502);
      const j = await c.json();
      out.push(...(j.files || []));
      pt = j.nextPageToken || '';
      if (!pt) return out;
    }
    throw new h.Fail('Daftar berkas arsip terlalu banyak; pembacaan perlu diperluas.', 500);
  } catch (e) { if (wajib) throw e; return []; }
}
/* gabungan beberapa berkas: satu dokumen per ID. Sesi dibuat ulang (waktu buat beda) digabung per siswa; selain itu yang $updatedAt-nya lebih baru menang. */
export function pilih(a, b) {
  if (!a) return b;
  if (a.$createdAt && b.$createdAt && a.$createdAt !== b.$createdAt) {
    const [lama, baru] = a.$createdAt < b.$createdAt ? [a, b] : [b, a];
    return a.tipe === 'absen' && b.tipe === 'absen' ? gabung(lama, baru) : baru;
  }
  return String(b.$updatedAt || '') >= String(a.$updatedAt || '') ? b : a;
}
export function satukan(daftar) {
  const peta = new Map();
  daftar.forEach((L) => (L || []).forEach((d) => peta.set(d.$id, pilih(peta.get(d.$id), d))));
  return [...peta.values()];
}
async function paralel(item, fn, n) {
  const out = new Array(item.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, item.length) }, async () => { while (i < item.length) { const k = i++; out[k] = await fn(item[k]); } }));
  return out;
}
async function unduhBerkas(f, tok, h) {
  const x = await h.gfetch('https://www.googleapis.com/drive/v3/files/' + f.id + '?alt=media', {}, tok);
  if (!x.ok) throw new h.Fail('Arsip tidak bisa dibaca (' + x.status + ').', 502);
  return JSON.parse(await x.text()).dokumen;
}
/* null bila minggu itu belum punya berkas arsip sama sekali */
async function cariArsip(minggu, tok, parent, h, jenis = 'harian', daftar) {
  const F = (daftar || await daftarBerkas(jenis, tok, parent, h)).filter((f) => f.minggu === minggu);
  if (!F.length) return null;
  return satukan(await paralel(F, (f) => unduhBerkas(f, tok, h), 6));
}
async function peran(callerId, key, h) {
  return (await h.aw('/users/' + encodeURIComponent(callerId), { 'X-Appwrite-Key': key || '' })).labels || [];
}
/* guru hanya menerima sesi miliknya; admin menerima semua */
export async function bacaArsip(callerId, body, key, h) {
  const L = await peran(callerId, key, h), adm = L.includes('admin');
  if (!adm && !L.includes('guru')) throw new h.Fail('Hanya guru atau admin.', 403);
  const m = (Array.isArray(body.minggu) ? body.minggu : []).slice(0, 6).filter((x) => rentang(String(x)));
  const tok = await h.accessToken(), parent = await h.folderId(tok), dokumen = [], daftar = await daftarBerkas('harian', tok, parent, h);
  for (const w of m) ((await cariArsip(w, tok, parent, h, 'harian', daftar)) || []).forEach((d) => { if (adm || d.pengamatId === callerId) dokumen.push(d); });
  return { ok: true, dokumen };
}
/* hapus hanya dokumen yang sudah ada di arsip dan tidak berubah sejak diarsipkan; dibatasi per panggilan agar tidak melewati batas waktu.
   Keberadaan dokumen selalu diperiksa dengan kunci fungsi (bukan token admin): token yang tidak boleh membaca dokumen juga mendapat 404,
   jadi 404 dari token tidak membuktikan dokumennya hilang. Setiap penghapusan dibuktikan dengan membaca ulang (harus 404).
   Hasil: dihapus = terhapus pada panggilan ini; sudah = sudah tidak ada sebelumnya; gagal = masih ada setelah dihapus; berubah = dilewati. */
export async function hapusArsip(callerId, body, auth, key, h) {
  if (!key) throw new h.Fail('Izin fungsi belum lengkap (users.read dan documents.read).', 500);
  if (!(await peran(callerId, key, h)).includes('admin')) throw new h.Fail('Hanya admin yang boleh menghapus.', 403);
  const jenis = body.jenis === 'pkl' ? 'pkl' : 'harian', s = SUMBER[jenis];
  if (!rentang(String(body.minggu || ''))) throw new h.Fail('Tanggal Senin tidak valid.', 400);
  const tok = await h.accessToken(), L = await cariArsip(body.minggu, tok, await h.folderId(tok), h, jenis);
  if (!L) throw new h.Fail('Minggu ini belum diarsipkan.', 400);
  const punya = await pemilahSekolah(callerId, body, jenis, key, h), milik = L.filter(punya);
  const kunci = { 'X-Appwrite-Key': key };
  const mulai = Math.max(0, Number(body.mulai) || 0), dihapus = [], sudah = [];
  let berubah = 0, gagal = 0;
  for (const d of milik.slice(mulai, mulai + 20)) {
    const path = '/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/' + s.col + '/documents/' + encodeURIComponent(d.$id);
    let now;
    try { now = await h.aw(path, kunci); } catch (e) { if (/\(404\)/.test(e.message)) { sudah.push(d.$id); continue; } throw e; }
    if (!s.cocok(now) || now.$updatedAt !== d.$updatedAt) { berubah++; continue; }
    await h.hapusDok(path, auth);
    let masih = true;
    try { await h.aw(path, kunci); } catch (e) { if (/\(404\)/.test(e.message)) masih = false; else throw e; }
    if (masih) { gagal++; continue; }
    dihapus.push(d.$id);
  }
  return { ok: true, ids: [...dihapus, ...sudah], dihapus: dihapus.length, sudah: sudah.length, berubah, gagal, lanjut: mulai + 20 < milik.length ? mulai + 20 : null };
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

async function akunSaya(callerId, key, h) {
  const auth = { 'X-Appwrite-Key': key || '' };
  const email = String((await h.aw('/users/' + encodeURIComponent(callerId), auth)).email || '').toLowerCase();
  const p = new URLSearchParams();
  [{ method: 'equal', attribute: 'email', values: [email] }, { method: 'limit', values: [1] }].forEach((q) => p.append('queries[]', JSON.stringify(q)));
  const a = email && ((await h.aw('/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/akun/documents?' + p, auth)).documents || [])[0];
  if (!a || a.aktif === false) throw new h.Fail('Akun tidak ditemukan.', 403);
  return a.$id;
}
const uji = (d) => { try { return !!JSON.parse(d.payload || '{}').uji; } catch (e) { return false; } };
/* semua arsip PKL, lima minggu per panggilan (semua berkas rombel satu minggu dalam satu panggilan, jadi dokumen ganda antarberkas tersaring di sini).
   Guru/admin menerima semua; selain itu hanya miliknya. Data uji tidak dikirim. */
export async function bacaArsipPkl(callerId, body, key, h) {
  const L = await peran(callerId, key, h), staf = L.includes('admin') || L.includes('guru');
  const sid = staf ? null : await akunSaya(callerId, key, h);
  const tok = await h.accessToken(), parent = await h.folderId(tok), daftar = await daftarBerkas('pkl', tok, parent, h);
  const minggu = [...new Set(daftar.map((f) => f.minggu))].sort(), mulai = Math.max(0, Number(body.mulai) || 0), dokumen = [];
  for (const w of minggu.slice(mulai, mulai + 5)) ((await cariArsip(w, tok, parent, h, 'pkl', daftar)) || []).forEach((d) => { if (!uji(d) && (staf || d.sid === sid)) dokumen.push(d); });
  return { ok: true, dokumen, lanjut: mulai + 5 < minggu.length ? mulai + 5 : null };
}
/* dokumen absen PKL yang sudah dihapus dari Appwrite, untuk membuka selfie. Hak: guru/admin atau pemilik. */
export async function dokPklArsip(callerId, docId, tanggal, key, h) {
  const t = Date.parse(tanggal + 'T00:00:00Z');
  if (isNaN(t)) throw new h.Fail('Foto tidak ditemukan.', 404);
  const senin = new Date(t - ((new Date(t).getUTCDay() + 6) % 7) * 86400000).toISOString().slice(0, 10);
  const tok = await h.accessToken(), L = await cariArsip(senin, tok, await h.folderId(tok), h, 'pkl');
  const d = (L || []).find((x) => x.$id === docId);
  if (!d) throw new h.Fail('Foto tidak ditemukan atau Anda tidak berhak melihatnya.', 404);
  const R = await peran(callerId, key, h);
  if (!R.includes('admin') && !R.includes('guru') && !(d.$permissions || []).includes('read("user:' + callerId + '")')) throw new h.Fail('Tidak berhak melihat foto ini.', 403);
  return d;
}
