#!/usr/bin/env node
/* Alat foto bukti Google Drive.
   node tools/foto-drive.mjs cek                    uji token Google dan folder Drive (membuat folder bila belum ada)
   node tools/foto-drive.mjs migrasi                simulasi: hitung foto lama yang masih tersimpan di database
   node tools/foto-drive.mjs migrasi --jalankan     pindahkan foto itu ke Drive, lalu ganti isi dokumen menjadi drive:<id>
          --batas N                                 paling banyak N foto per jalan (bawaan 200)
   Variabel (atau akan ditanyakan, tidak ditampilkan di layar):
     GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN   harus SAMA dengan yang dipakai fungsi foto-drive
     DRIVE_FOLDER_ID (opsional; kosongkan bila token memakai scope drive.file)
     APPWRITE_API_KEY  (hanya untuk migrasi) scope: documents.read, documents.write
   Aman diulang: dokumen yang sudah berisi drive:<id> dilewati. Foto diunggah dulu, dokumen baru diubah setelah unggahan berhasil. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOLDER_NAME = 'TBSM Bukti Praktik';
const argv = process.argv.slice(2);
const cmd = argv[0];
const JALAN = argv.includes('--jalankan');
const iB = argv.indexOf('--batas');
const BATAS = iB > -1 ? Math.max(1, parseInt(argv[iB + 1], 10) || 200) : 200;
const log = (...a) => console.log(...a);
const mati = (m) => { console.error(m); process.exit(1); };

function tanya(q) {
  return new Promise((resolve) => {
    process.stdout.write(q);
    const inp = process.stdin;
    if (!inp.isTTY) {
      const rl = readline.createInterface({ input: inp });
      let v = '';
      rl.once('line', (l) => { v = l.trim(); rl.close(); });
      rl.once('close', () => resolve(v));
      return;
    }
    let buf = '';
    inp.setRawMode(true); inp.resume(); inp.setEncoding('utf8');
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          inp.setRawMode(false); inp.pause(); inp.off('data', onData);
          process.stdout.write('\n');
          return resolve(buf.trim());
        }
        if (ch === '\u0003') process.exit(130);
        if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1); else buf += ch;
      }
    };
    inp.on('data', onData);
  });
}
async function env(nama, tanyaTeks, wajib = true) {
  const v = process.env[nama] || (wajib ? await tanya(tanyaTeks + ': ') : '');
  if (wajib && !v) mati(nama + ' kosong.');
  return v;
}

/* ---------- Google Drive (logika sama dengan functions/foto-drive/src/main.js) ---------- */
let G = null, tokenExp = 0, folderCache = '';
async function accessToken() {
  if (G && Date.now() < tokenExp - 60000) return G;
  const id = await env('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID');
  const sec = await env('GOOGLE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET');
  const rt = await env('GOOGLE_REFRESH_TOKEN', 'GOOGLE_REFRESH_TOKEN');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: sec, refresh_token: rt, grant_type: 'refresh_token' })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    if (j.error === 'invalid_grant') mati('Token Google kedaluwarsa atau dicabut. Buat ulang GOOGLE_REFRESH_TOKEN (aplikasi OAuth harus berstatus In production).');
    mati('Gagal meminta token Google (' + (j.error || r.status) + ').');
  }
  tokenExp = Date.now() + (Number(j.expires_in) || 3000) * 1000;
  return (G = j.access_token);
}
const gf = async (url, opt = {}) => fetch(url, { ...opt, headers: { ...(opt.headers || {}), Authorization: 'Bearer ' + (await accessToken()) } });
async function folderId() {
  if (process.env.DRIVE_FOLDER_ID) return process.env.DRIVE_FOLDER_ID;
  if (folderCache) return folderCache;
  const q = encodeURIComponent("name='" + FOLDER_NAME + "' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  const r = await gf('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id)&pageSize=1');
  const j = await r.json().catch(() => ({}));
  if (!r.ok) mati('Gagal membaca folder Drive (' + r.status + ').');
  if (j.files && j.files[0]) return (folderCache = j.files[0].id);
  const c = await gf('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  });
  const cj = await c.json().catch(() => ({}));
  if (!c.ok || !cj.id) mati('Gagal membuat folder Drive (' + c.status + ').');
  return (folderCache = cj.id);
}
function decode(dataUrl) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  const jpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e;
  const webp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
  if (!(jpg || png || webp)) return null;
  return { mime: m[1], buf, ext: m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg' };
}
const slug = (x, n) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, n);
async function unggah(img, nama, uid) {
  const parent = await folderId();
  const boundary = 'tbsm' + Date.now().toString(36);
  const meta = JSON.stringify({ name: nama + '.' + img.ext, parents: [parent], mimeType: img.mime, appProperties: { uid } });
  const body = Buffer.concat([
    Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + boundary + '\r\nContent-Type: ' + img.mime + '\r\n\r\n'),
    img.buf, Buffer.from('\r\n--' + boundary + '--')
  ]);
  const r = await gf('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST', headers: { 'content-type': 'multipart/related; boundary=' + boundary }, body
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error('unggah gagal (' + r.status + ')');
  return j.id;
}

/* ---------- perintah ---------- */
async function cek() {
  await accessToken();
  log('Token Google: valid');
  const f = await folderId();
  log('Folder "' + FOLDER_NAME + '": ' + f);
  const r = await gf('https://www.googleapis.com/drive/v3/about?fields=storageQuota');
  const q = ((await r.json().catch(() => ({}))).storageQuota) || {};
  if (q.usage) log('Kuota Drive: terpakai ' + Math.round(q.usage / 1048576) + ' MB' + (q.limit ? ' dari ' + Math.round(q.limit / 1048576) + ' MB' : ''));
  log('Siap dipakai fungsi foto-drive.');
}

async function migrasi() {
  const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
  const cfg = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
  const ENDPOINT = (process.env.APPWRITE_ENDPOINT || (cfg.match(/APPWRITE_ENDPOINT\s*:\s*'([^']*)'/) || [])[1] || '').replace(/\/$/, '');
  const DB = conf.databases[0].$id, PROJECT = conf.projectId;
  const KEY = await env('APPWRITE_API_KEY', 'APPWRITE_API_KEY (documents.read dan documents.write)');
  const aw = async (method, p, body, qs) => {
    const u = new URL(ENDPOINT + p);
    (qs || []).forEach((q) => u.searchParams.append('queries[]', JSON.stringify(q)));
    const r = await fetch(u, { method, headers: { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Appwrite ' + r.status + ': ' + String(j.message || '').slice(0, 120));
    return j;
  };
  const kol = '/databases/' + DB + '/collections/lkpd_bukti/documents';
  /* kumpulkan semua dokumen (halaman 25) */
  const semua = []; let cursor = null;
  for (;;) {
    const qs = [{ method: 'limit', values: [25] }]; if (cursor) qs.push({ method: 'cursorAfter', values: [cursor] });
    const j = await aw('GET', kol, null, qs);
    semua.push(...j.documents);
    if (j.documents.length < 25) break;
    cursor = j.documents[j.documents.length - 1].$id;
  }
  const lama = semua.filter((d) => String(d.data || '').startsWith('data:'));
  const drive = semua.filter((d) => String(d.data || '').startsWith('drive:')).length;
  const mb = Math.round(lama.reduce((n, d) => n + String(d.data).length, 0) * 0.75 / 1048576 * 10) / 10;
  log('lkpd_bukti: ' + semua.length + ' dokumen. Sudah di Drive: ' + drive + '. Masih di database: ' + lama.length + ' (sekitar ' + mb + ' MB).');
  if (!lama.length) return;
  if (!JALAN) { log('\nIni hanya simulasi. Tambahkan --jalankan untuk memindahkan (paling banyak ' + BATAS + ' foto per jalan).'); return; }
  let ok = 0, lewat = 0, gagal = 0;
  for (const d of lama.slice(0, BATAS)) {
    const img = decode(d.data);
    if (!img) { lewat++; log('  lewati ' + d.$id + ': bukan gambar yang dikenal'); continue; }
    try {
      const nama = 'Migrasi_' + slug(d.moduleId, 20) + '_' + slug(d.lkpdId, 20) + '_' + slug(String(d.label || '').split('|').pop(), 40) + '_' + d.$id.slice(-6);
      const fid = await unggah(img, nama, d.sid || '');
      try { await aw('PATCH', kol + '/' + d.$id, { data: { data: 'drive:' + fid } }); ok++; log('  ok ' + d.$id + ' -> drive:' + fid); }
      catch (e) { gagal++; log('  GAGAL ubah dokumen ' + d.$id + ' (berkas sudah ada di Drive: ' + fid + '): ' + e.message); }
    } catch (e) { gagal++; log('  GAGAL unggah ' + d.$id + ': ' + e.message); }
  }
  log('\nSelesai: dipindah ' + ok + ', dilewati ' + lewat + ', gagal ' + gagal + '. Masih di database: ' + (lama.length - ok) + '.');
  if (gagal) process.exitCode = 1;
}

if (cmd === 'cek') await cek();
else if (cmd === 'migrasi') await migrasi();
else mati('Pakai:  node tools/foto-drive.mjs cek | migrasi [--jalankan] [--batas N]');
