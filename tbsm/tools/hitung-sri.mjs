#!/usr/bin/env node
/* Menambahkan integrity (SRI sha384) dan crossorigin ke <script src="https://..."> di index.html.
   Jalankan di Termux (perlu internet) dari folder proyek:  node tools/hitung-sri.mjs
   Uji tanpa menulis:  node tools/hitung-sri.mjs --dry
   Aman dijalankan ulang: hash lama dihitung ulang dan diganti. Jalankan lagi setiap versi pustaka CDN diubah.
   Setelah itu naikkan versi ?v= dan CACHE di service-worker.js. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'index.html');
const DRY = process.argv.includes('--dry');
let html = fs.readFileSync(file, 'utf8');
const re = /<script src="(https:\/\/[^"]+)"[^>]*><\/script>/g;
const tags = [...html.matchAll(re)];
if (!tags.length) { console.log('Tidak ada skrip CDN.'); process.exit(0); }

for (const m of tags) {
  const url = m[1];
  const res = await fetch(url);
  if (!res.ok) { console.error('GAGAL', res.status, url); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());
  const hash = 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
  const baru = `<script src="${url}" integrity="${hash}" crossorigin="anonymous"></script>`;
  html = html.replace(m[0], baru);
  console.log('OK', hash.slice(0, 22) + '…', url);
}
if (DRY) console.log('(dry) index.html tidak diubah');
else { fs.writeFileSync(file, html); console.log('index.html diperbarui'); }
