#!/usr/bin/env node
/* Memperbesar kolom `peran` koleksi `akun` di Appwrite dari 16 menjadi 64 karakter, supaya peran ganda yang panjang
   (mis. admin,guru,proktor = 18 karakter) bisa tersimpan. Aman dijalankan ulang; ukuran hanya dinaikkan, data tidak berubah.
   Jalankan dari folder proyek:  node tools/perbesar-peran.mjs         (API key ditanyakan; scope databases.read dan databases.write)
   Uji tanpa mengirim:           node tools/perbesar-peran.mjs --dry
   API key dibaca dari APPWRITE_API_KEY atau ditanyakan saat dijalankan dan TIDAK disimpan. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const UKURAN = 64;
const cfgSrc = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const pick = (k) => (cfgSrc.match(new RegExp(k + "\\s*:\\s*'([^']*)'")) || [])[1];
const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
const ENDPOINT = process.env.APPWRITE_ENDPOINT || pick('APPWRITE_ENDPOINT');
const PROJECT = process.env.APPWRITE_PROJECT || conf.projectId || pick('APPWRITE_PROJECT');
const DB = conf.databases[0].$id;
let KEY = process.env.APPWRITE_API_KEY || '';
if (!KEY && !DRY) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  KEY = (await rl.question('Tempel API key Appwrite lalu tekan Enter: ')).trim();
  rl.close();
}
if (!KEY && !DRY) { console.error('API key kosong.'); process.exit(1); }

async function api(method, p, body) {
  if (DRY) { console.log(`  [dry] ${method} ${p}`, body ? JSON.stringify(body) : ''); return { ok: true, data: { size: 16, required: true } }; }
  const res = await fetch(ENDPOINT + p, { method, headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY }, body: body ? JSON.stringify(body) : undefined });
  let data = {}; try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

const P = `/databases/${DB}/collections/akun/attributes/string/peran`;
console.log(`Endpoint: ${ENDPOINT}\nProject : ${PROJECT}\nDatabase: ${DB}\n`);
const cek = await api('GET', P);
if (!cek.ok) { console.error('GAGAL membaca kolom peran: ' + (cek.data.message || cek.status)); process.exit(1); }
if (cek.data.size >= UKURAN) { console.log(`Sudah ${cek.data.size} karakter, tidak ada yang diubah.`); process.exit(0); }
console.log(`Ukuran sekarang ${cek.data.size}, dinaikkan ke ${UKURAN}...`);
const r = await api('PATCH', P, { required: !!cek.data.required, default: cek.data.required ? undefined : (cek.data.default ?? null), size: UKURAN });
if (!r.ok) { console.error('GAGAL: ' + (r.data.message || r.status)); process.exit(1); }
console.log('Berhasil. Tunggu beberapa detik sampai status atribut available di Console, lalu buka aplikasi dan tekan Segarkan data.');
