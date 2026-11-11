#!/usr/bin/env node
/* Membuat database dan semua koleksi Appwrite dari appwrite.json lewat REST API.
   Jalankan dari folder proyek:  node tools/setup-appwrite.mjs
   Uji tanpa mengirim apa pun:   node tools/setup-appwrite.mjs --dry
   Hanya koleksi tertentu:       node tools/setup-appwrite.mjs --only=observasi
   Samakan izin koleksi lama:    tambahkan --sync-izin (bawaan: izin koleksi yang sudah ada tidak diubah)
   API key dibaca dari APPWRITE_API_KEY atau ditanyakan saat dijalankan. Key TIDAK disimpan. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const SYNC = process.argv.includes('--sync-izin');
const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);
const cfgSrc = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const pick = (k) => (cfgSrc.match(new RegExp(k + "\\s*:\\s*'([^']*)'")) || [])[1];
const ENDPOINT = process.env.APPWRITE_ENDPOINT || pick('APPWRITE_ENDPOINT');
const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
const PROJECT = process.env.APPWRITE_PROJECT || conf.projectId || pick('APPWRITE_PROJECT');
const dbDef = conf.databases[0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tanyaRahasia(q) {
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
          process.stdout.write(`\n(key diterima, ${buf.trim().length} karakter, tidak ditampilkan)\n`);
          return resolve(buf.trim());
        }
        if (ch === '\u0003') process.exit(130);
        if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1); else buf += ch;
      }
    };
    inp.on('data', onData);
  });
}

let KEY = process.env.APPWRITE_API_KEY || '';
if (!KEY && !DRY) KEY = await tanyaRahasia('Tempel API key Appwrite lalu tekan Enter (tidak akan terlihat di layar): ');
if (!KEY && !DRY) { console.error('API key kosong.'); process.exit(1); }

console.log(`Endpoint : ${ENDPOINT}\nProject  : ${PROJECT}\nDatabase : ${dbDef.$id}${DRY ? '\nMODE UJI (--dry): tidak ada yang dikirim' : ''}\n`);

async function api(method, p, body) {
  if (DRY) { console.log(`  [dry] ${method} ${p}`); return { ok: true, data: {} }; }
  for (let t = 0; t < 4; t++) {
    let res;
    try {
      res = await fetch(ENDPOINT + p, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) { return { ok: false, status: 0, data: { message: 'Tidak bisa terhubung ke Appwrite (periksa internet): ' + e.message } }; }
    if (res.status === 429) { await sleep(3000); continue; }
    let data = {}; try { data = await res.json(); } catch {}
    return { ok: res.ok, status: res.status, data };
  }
  return { ok: false, status: 429, data: { message: 'Terkena batas laju, coba lagi nanti' } };
}

let gagal = 0;
function lapor(label, r) {
  if (r.ok) console.log(`  ok      ${label}`);
  else if (r.status === 409) console.log(`  sudah   ${label}`);
  else { gagal++; console.log(`  GAGAL   ${label}: ${r.data.message || r.status}`); }
  return r.ok || r.status === 409;
}

const DB = `/databases/${dbDef.$id}`;
console.log('Database');
// Periksa dulu: paket gratis membatasi jumlah database, sehingga membuat ulang bisa ditolak walau sudah ada.
let rdb = await api('GET', `/databases/${dbDef.$id}`);
if (rdb.ok) { rdb = { ok: false, status: 409, data: {} }; }
else if (rdb.status === 404) { rdb = await api('POST', '/databases', { databaseId: dbDef.$id, name: dbDef.name || dbDef.$id, enabled: true }); }
if (!lapor(dbDef.$id, rdb)) { console.error('\nBerhenti. Cek pesan di atas: biasanya scope API key kurang (butuh databases.read dan databases.write), Project ID salah, atau batas paket.'); process.exit(1); }

for (const c of conf.collections.filter((x) => !ONLY.length || ONLY.includes(x.$id))) {
  console.log(`\nKoleksi ${c.$id}`);
  const rc = await api('POST', `${DB}/collections`, {
    collectionId: c.$id, name: c.name || c.$id, permissions: c.$permissions || [],
    documentSecurity: !!c.documentSecurity, enabled: c.enabled !== false,
  });
  if (!lapor('koleksi', rc)) continue;
  if (rc.status === 409 && SYNC) {
    // Koleksi sudah ada: perbarui izin agar sama dengan appwrite.json
    lapor('izin diperbarui', await api('PUT', `${DB}/collections/${c.$id}`, {
      name: c.name || c.$id, permissions: c.$permissions || [], documentSecurity: !!c.documentSecurity, enabled: c.enabled !== false,
    }));
  }
  for (const a of c.attributes) {
    const body = { key: a.key, required: !!a.required, array: !!a.array };
    if (a.type === 'string') body.size = a.size;
    if (a.type === 'integer') { body.min = a.min; body.max = a.max; }
    lapor(`atribut ${a.key} (${a.type})`, await api('POST', `${DB}/collections/${c.$id}/attributes/${a.type}`, body));
  }
  if (!DRY) {
    process.stdout.write('  menunggu atribut siap');
    let siap = false;
    for (let i = 0; i < 90 && !siap; i++) {
      const r = await api('GET', `${DB}/collections/${c.$id}/attributes`);
      const list = (r.data && r.data.attributes) || [];
      if (list.some((x) => x.status === 'failed')) { gagal++; console.log('\n  GAGAL   ada atribut berstatus failed, periksa di Console'); break; }
      siap = list.length >= c.attributes.length && list.every((x) => x.status === 'available');
      if (!siap) { process.stdout.write('.'); await sleep(2000); }
    }
    console.log(siap ? ' siap' : ' (belum siap, indeks mungkin gagal; jalankan ulang skrip)');
  }
  for (const ix of c.indexes || []) {
    lapor(`indeks ${ix.key}`, await api('POST', `${DB}/collections/${c.$id}/indexes`, {
      key: ix.key, type: ix.type, attributes: ix.attributes, orders: ix.orders || [],
    }));
  }
}

console.log(gagal ? `\nSelesai dengan ${gagal} kegagalan. Skrip aman dijalankan ulang; yang sudah ada dilewati.` : '\nSelesai. Database dan semua koleksi siap. Hapus API key di Console bila tidak dipakai lagi.');
process.exit(gagal ? 1 : 0);
