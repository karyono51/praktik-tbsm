#!/usr/bin/env node
/* Mengganti ID project Appwrite di js/config.js, appwrite.json, dan docs-SETUP-APPWRITE.md.
   Pakai:  node tools/pindah-project.mjs <ID-project-baru>
   Hanya mengubah teks di berkas itu; tidak menghubungi Appwrite. Lihat docs-PINDAH-PROJECT.md. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baru = process.argv[2];
if (!baru || !/^[a-z0-9]{16,24}$/.test(baru)) { console.error('Pakai: node tools/pindah-project.mjs <ID-project-baru> (huruf kecil dan angka, 16 sampai 24 karakter)'); process.exit(1); }
const cfg = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const lama = (cfg.match(/APPWRITE_PROJECT\s*:\s*'([^']*)'/) || [])[1];
if (!lama) { console.error('APPWRITE_PROJECT tidak ditemukan di js/config.js'); process.exit(1); }
if (lama === baru) { console.log('ID sudah ' + baru + ', tidak ada yang diubah.'); process.exit(0); }
let n = 0;
for (const f of ['js/config.js', 'appwrite.json', 'docs-SETUP-APPWRITE.md']) {
  const p = path.join(root, f), s = fs.readFileSync(p, 'utf8');
  if (s.includes(lama)) { fs.writeFileSync(p, s.split(lama).join(baru)); n++; console.log('Diubah: ' + f); }
}
console.log(`ID project ${lama} -> ${baru} di ${n} berkas. Jalankan node tools/rilis.mjs sebelum push.`);
