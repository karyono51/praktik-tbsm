#!/usr/bin/env node
/* Cek database Appwrite (hanya membaca, tidak mengubah apa pun).
   Jalankan:  node tools/cek-appwrite.mjs
   API key (1 hari) butuh scope: databases.read, collections.read, attributes.read, documents.read
   Key dibaca dari APPWRITE_API_KEY atau ditanyakan (tidak ditampilkan di layar). */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
const cfgSrc = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const ENDPOINT = process.env.APPWRITE_ENDPOINT || (cfgSrc.match(/APPWRITE_ENDPOINT\s*:\s*'([^']*)'/) || [])[1];
const PROJECT = conf.projectId;
const DB = conf.databases[0].$id;

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

const KEY = process.env.APPWRITE_API_KEY || await tanyaRahasia('Tempel API key (read-only, tidak akan terlihat): ');
if (!KEY) { console.error('API key kosong.'); process.exit(1); }

async function get(p, queries = []) {
  const qs = new URLSearchParams();
  queries.forEach((q) => qs.append('queries[]', JSON.stringify(q)));
  let res;
  try {
    res = await fetch(`${ENDPOINT}${p}${qs.toString() ? '?' + qs : ''}`, {
      headers: { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY },
    });
  } catch (e) { return { ok: false, status: 0, data: { message: 'Tidak bisa terhubung: ' + e.message } }; }
  let data = {}; try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}
const galat = (r) => `GAGAL (${r.status}): ${r.data.message || 'tidak diketahui'}`;

console.log(`Project ${PROJECT}, database ${DB}\n`);
const rdb = await get(`/databases/${DB}`);
if (!rdb.ok) { console.log('Database:', galat(rdb)); process.exit(1); }
console.log('Database tbsm: ada\n');

const rc = await get(`/databases/${DB}/collections`, [{ method: 'limit', values: [100] }]);
if (!rc.ok) { console.log('Daftar koleksi:', galat(rc)); process.exit(1); }
const ada = new Map(rc.data.collections.map((c) => [c.$id, c]));

for (const def of conf.collections) {
  const c = ada.get(def.$id);
  if (!c) { console.log(`- ${def.$id}: BELUM ADA`); continue; }
  const attrs = (await get(`/databases/${DB}/collections/${def.$id}/attributes`)).data.attributes || [];
  const punya = new Set(attrs.map((a) => a.key));
  const hilang = def.attributes.map((a) => a.key).filter((k) => !punya.has(k));
  const belum = attrs.filter((a) => a.status !== 'available').map((a) => a.key);
  const r1 = await get(`/databases/${DB}/collections/${def.$id}/documents`, [{ method: 'limit', values: [1] }]);
  const jumlah = r1.ok ? r1.data.total : galat(r1);
  console.log(`- ${def.$id}: ${jumlah} dokumen` + (hilang.length ? `; atribut KURANG: ${hilang.join(', ')}` : '') + (belum.length ? `; atribut belum siap: ${belum.join(', ')}` : ''));
}

// Rincian nilai uji per unit (koleksi hasil)
if (ada.has('hasil')) {
  const per = {}; let cur = null, n = 0;
  for (;;) {
    const q = [{ method: 'limit', values: [100] }];
    if (cur) q.push({ method: 'cursorAfter', values: [cur] });
    const r = await get(`/databases/${DB}/collections/hasil/documents`, q);
    if (!r.ok) { console.log('\nRincian hasil:', galat(r)); break; }
    for (const d of r.data.documents) { per[d.jobId] = (per[d.jobId] || 0) + 1; n++; }
    if (r.data.documents.length < 100) break;
    cur = r.data.documents[r.data.documents.length - 1].$id;
  }
  if (n) { console.log('\nNilai uji (hasil) per kode unit:'); Object.entries(per).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`)); }
}
console.log('\nSelesai. Hapus API key di Console bila tidak dipakai lagi.');
