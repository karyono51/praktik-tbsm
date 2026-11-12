/* Appwrite Function "foto-drive": menyimpan foto bukti praktik ke Google Drive dan menampilkannya kembali.
   Runtime Node.js 18+. Execute access: Users. Scopes: users.read, documents.read.
   Variabel lingkungan (Settings > Environment variables), JANGAN ditaruh di repo atau js/config.js:
     GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
     DB_ID            (opsional, bawaan: tbsm)
     DRIVE_FOLDER_ID  (opsional; kosongkan bila token memakai scope drive.file, folder "TBSM Bukti Praktik" dibuat otomatis)
   Aksi:
     upload: {action:'upload', data:'data:image/jpeg;base64,...', nama:'X_Budi_X-1_K03-Terminal_20261112-1345'}  -> {ok:true, fileId}   (semua pengguna login)
     get:    {action:'get', lkpdId, fileId}                          -> {ok:true, data:'data:...'}
             hanya guru/admin (label) atau pemilik foto (izin baca dokumen lkpd_bukti). */
// Tanpa pustaka node-appwrite: panggilan ke Appwrite memakai fetch bawaan Node (pustaka lama gagal di runtime Node terbaru: "fetch failed").

const FOLDER_NAME = 'TBSM Bukti Praktik';
const MAX_B64 = 420000;            // batas panjang teks base64 (foto aplikasi <= sekitar 260.000)
const ID_RE = /^[A-Za-z0-9_-]{10,100}$/;
let tokenCache = { t: null, exp: 0 };
let folderCache = null;

class Fail extends Error { constructor(msg, status) { super(msg); this.status = status; } }

async function accessToken() {
  if (tokenCache.t && Date.now() < tokenCache.exp - 60000) return tokenCache.t;
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: sec, GOOGLE_REFRESH_TOKEN: rt } = process.env;
  if (!id || !sec || !rt) throw new Fail('Fungsi belum dikonfigurasi (variabel GOOGLE_* belum diisi).', 500);
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: sec, refresh_token: rt, grant_type: 'refresh_token' })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    if (j.error === 'invalid_grant') throw new Fail('Token Google kedaluwarsa atau dicabut. Buat ulang GOOGLE_REFRESH_TOKEN (pastikan aplikasi OAuth berstatus In production).', 502);
    throw new Fail('Gagal meminta token Google (' + (j.error || r.status) + ').', 502);
  }
  tokenCache = { t: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3000) * 1000 };
  return tokenCache.t;
}

async function gfetch(url, opt, tok) {
  const r = await fetch(url, { ...opt, headers: { ...(opt && opt.headers), Authorization: 'Bearer ' + tok } });
  return r;
}

async function folderId(tok) {
  if (process.env.DRIVE_FOLDER_ID) return process.env.DRIVE_FOLDER_ID;
  if (folderCache) return folderCache;
  const q = encodeURIComponent("name='" + FOLDER_NAME + "' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const r = await gfetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)&pageSize=1', {}, tok);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Fail('Gagal membaca folder Drive (' + r.status + ').', 502);
  if (j.files && j.files[0]) return (folderCache = j.files[0].id);
  const c = await gfetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  }, tok);
  const cj = await c.json().catch(() => ({}));
  if (!c.ok || !cj.id) throw new Fail('Gagal membuat folder Drive (' + c.status + ').', 502);
  return (folderCache = cj.id);
}

function decodeImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new Fail('Format foto tidak valid.', 400);
  if (m[2].length > MAX_B64) throw new Fail('Foto terlalu besar.', 413);
  const buf = Buffer.from(m[2], 'base64');
  const jpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e;
  const webp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  if (!(jpg || png || webp)) throw new Fail('Isi berkas bukan gambar.', 400);
  return { mime: m[1], buf, ext: m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg' };
}

async function upload(callerId, body) {
  const img = decodeImage(body.data);
  const tok = await accessToken();
  const parent = await folderId(tok);
  // Nama berkas dari aplikasi (Kelas_Nama_Modul_Item_Waktu), disaring agar aman. Bila kosong, pakai ID pengguna + waktu.
  const label = String(body.nama || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 150);
  const name = (label || callerId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 36) + '_' + Date.now()) + '.' + img.ext;
  const boundary = 'tbsm' + Date.now().toString(36);
  const meta = JSON.stringify({ name, parents: [parent], mimeType: img.mime, appProperties: { uid: callerId } });
  const payload = Buffer.concat([
    Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + boundary + '\r\nContent-Type: ' + img.mime + '\r\n\r\n'),
    img.buf,
    Buffer.from('\r\n--' + boundary + '--')
  ]);
  const r = await gfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'content-type': 'multipart/related; boundary=' + boundary }, body: payload
  }, tok);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) {
    if (r.status === 404) folderCache = null;
    throw new Fail('Unggah ke Drive gagal (' + r.status + ').', 502);
  }
  return { ok: true, fileId: j.id };
}

async function aw(path, headers) {
  const base = String(process.env.APPWRITE_ENDPOINT || process.env.APPWRITE_FUNCTION_API_ENDPOINT || '').replace(/\/$/, '');
  if (!base) throw new Fail('Alamat API Appwrite tidak tersedia di fungsi.', 500);
  let r;
  try {
    r = await fetch(base + path, { headers: { 'X-Appwrite-Project': process.env.APPWRITE_FUNCTION_PROJECT_ID || '', ...headers } });
  } catch (e) {
    throw new Fail('Tidak dapat menghubungi Appwrite (' + ((e && e.cause && (e.cause.code || e.cause.message)) || (e && e.message) || 'galat jaringan') + ').', 502);
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Fail('Appwrite menolak permintaan (' + r.status + '): ' + String(j.message || '').slice(0, 120), r.status === 401 || r.status === 403 ? 403 : 502);
  return j;
}

async function get(callerId, body, auth, asUser) {
  const fileId = String(body.fileId || ''), lkpdId = String(body.lkpdId || '');
  if (!ID_RE.test(fileId) || !lkpdId || lkpdId.length > 64) throw new Fail('Permintaan tidak valid.', 400);
  const q = new URLSearchParams();
  q.append('queries[]', JSON.stringify({ method: 'equal', attribute: 'lkpdId', values: [lkpdId] }));
  q.append('queries[]', JSON.stringify({ method: 'limit', values: [50] }));
  const list = await aw('/databases/' + encodeURIComponent(process.env.DB_ID || 'tbsm') + '/collections/lkpd_bukti/documents?' + q.toString(), auth);
  const doc = (list.documents || []).find((d) => d.data === 'drive:' + fileId);
  if (!doc) throw new Fail('Foto tidak ditemukan atau Anda tidak berhak melihatnya.', 404);
  if (!asUser) {
    // Mode kunci fungsi (cadangan): periksa hak baca secara manual.
    const caller = await aw('/users/' + encodeURIComponent(callerId), auth);
    const staff = (caller.labels || []).some((l) => l === 'guru' || l === 'admin');
    const own = (doc.$permissions || []).includes('read("user:' + callerId + '")');
    if (!staff && !own) throw new Fail('Tidak berhak melihat foto ini.', 403);
  }
  const tok = await accessToken();
  const r = await gfetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?alt=media', {}, tok);
  if (!r.ok) throw new Fail('Foto tidak bisa diambil dari Drive (' + r.status + ').', r.status === 404 ? 404 : 502);
  const mime = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  return { ok: true, data: 'data:' + (/^image\//.test(mime) ? mime : 'image/jpeg') + ';base64,' + b64 };
}

export default async ({ req, res, error }) => {
  try {
    const callerId = req.headers['x-appwrite-user-id'];
    if (!callerId) return res.json({ ok: false, error: 'Harus login.' }, 401);
    let body = {};
    try { body = req.bodyJson || JSON.parse(req.bodyText || req.body || '{}'); } catch (e) { return res.json({ ok: false, error: 'Data tidak valid.' }, 400); }
    if (body.action === 'upload') return res.json(await upload(callerId, body));
    if (body.action === 'get') {
      // Utama: baca dokumen atas nama pengguna (JWT) sehingga izin dokumen Appwrite yang menentukan, tanpa scope tambahan.
      // Cadangan: kunci dinamis fungsi (butuh scope users.read dan documents.read).
      const jwt = req.headers['x-appwrite-user-jwt'];
      const auth = jwt ? { 'X-Appwrite-JWT': jwt } : { 'X-Appwrite-Key': req.headers['x-appwrite-key'] || '' };
      return res.json(await get(callerId, body, auth, !!jwt));
    }
    return res.json({ ok: false, error: 'Aksi tidak dikenal.' }, 400);
  } catch (e) {
    if (e instanceof Fail) return res.json({ ok: false, error: e.message }, e.status);
    const msg = String((e && e.message) || e);
    error(msg);
    // Sertakan penyebab singkat agar mudah didiagnosis (mis. scope fungsi belum diberikan). Hanya pengguna login yang bisa memanggil fungsi ini.
    return res.json({ ok: false, error: 'Kesalahan server: ' + msg.slice(0, 160) }, 500);
  }
};
