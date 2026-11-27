#!/usr/bin/env node
/* Pemeriksaan sebelum deploy (dijalankan juga oleh GitHub Actions; deploy dibatalkan bila ada GAGAL).
   node tools/periksa.mjs
   1. Sintaks semua berkas JS aplikasi (js/**), service-worker.js, fungsi Appwrite, dan alat di tools/.
   2. Berkas JSON valid (appwrite.json, manifest*.json, firebase.json).
   3. Semua skrip/CSS yang dirujuk index.html ada; skrip CDN memakai integrity (SRI).
   4. Ikon di manifest ada, dan berkas di daftar cache service worker ada.
   5. Tidak ada rahasia yang ikut ter-commit (API key Appwrite, rahasia dan token Google, kunci privat). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const gagal = [], catatan = [];
const G = (m) => gagal.push(m);
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const SKIP = new Set(['.git', 'node_modules', '.github']);
function* walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(f.name)) continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) yield* walk(p); else yield p;
  }
}
const semua = [...walk(root)];

/* 1. Sintaks */
let nJs = 0;
for (const p of semua.filter((x) => rel(x).startsWith('js/') && x.endsWith('.js'))) {
  nJs++;
  try { new vm.Script(fs.readFileSync(p, 'utf8'), { filename: rel(p) }); }
  catch (e) { G('Sintaks JS salah di ' + rel(p) + ': ' + String(e.message).split('\n')[0]); }
}
try { new vm.Script(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), { filename: 'service-worker.js' }); nJs++; }
catch (e) { G('Sintaks service-worker.js salah: ' + e.message); }
for (const p of semua.filter((x) => /\.(mjs)$/.test(x) || /^functions\/.+\/src\/.+\.js$/.test(rel(x)))) {
  const r = spawnSync(process.execPath, ['--check', p], { encoding: 'utf8' });
  nJs++;
  if (r.status !== 0) G('Sintaks salah di ' + rel(p) + ': ' + String(r.stderr).split('\n').find((l) => /Error/.test(l)));
}

/* 2. JSON */
for (const p of semua.filter((x) => x.endsWith('.json'))) {
  try { JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { G('JSON tidak valid: ' + rel(p) + ' (' + e.message + ')'); }
}

/* 3. index.html */
const idx = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const m of idx.matchAll(/(?:src|href)="((?:js|css|assets)\/[^"?#'+]+)(?:\?[^"]*)?"/g)) {
  if (!fs.existsSync(path.join(root, m[1]))) G('index.html merujuk berkas yang tidak ada: ' + m[1]);
}
for (const m of idx.matchAll(/<script[^>]+src="(https:\/\/[^"]+)"[^>]*>/g)) {
  if (!/integrity="sha(256|384|512)-/.test(m[0])) G('Skrip CDN tanpa integrity (SRI): ' + m[1] + '  (jalankan node tools/hitung-sri.mjs)');
}

/* 4. Manifest dan daftar cache */
for (const f of semua.filter((x) => /^manifest.*\.json$/.test(path.basename(x)) && path.dirname(x) === root)) {
  try {
    const mf = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const ic of mf.icons || []) if (!fs.existsSync(path.join(root, ic.src))) G(rel(f) + ': ikon tidak ada: ' + ic.src);
  } catch (e) { /* sudah dilaporkan di langkah 2 */ }
}
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const lk = /^var LOCAL=(\[.*\]);$/m.exec(sw);
if (!lk) G('service-worker.js: daftar LOCAL tidak ditemukan');
else for (const u of new Function('return ' + lk[1])()) {
  const p = u.split('?')[0];
  if (p !== './' && !fs.existsSync(path.join(root, p))) G('service-worker.js: berkas di daftar cache tidak ada: ' + p);
}

/* 5. Rahasia */
const POLA = [
  [/standard_[0-9a-f]{64,}/, 'API key Appwrite'],
  [/GOCSPX-[A-Za-z0-9_-]{20,}/, 'rahasia klien Google'],
  [/\b1\/\/0[A-Za-z0-9_-]{40,}/, 'refresh token Google'],
  [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, 'kunci privat'],
  [/(?:GOOGLE_CLIENT_SECRET|GOOGLE_REFRESH_TOKEN|APPWRITE_API_KEY)\s*[:=]\s*['"]?[A-Za-z0-9_\/-]{20,}/, 'nilai rahasia di berkas']
];
const BIN = /\.(png|jpe?g|gif|webp|ico|xlsx|zip|pdf|woff2?)$/i;
for (const p of semua) {
  if (BIN.test(p) || fs.statSync(p).size > 3e6) continue;
  const t = fs.readFileSync(p, 'utf8');
  for (const [re, nama] of POLA) if (re.test(t)) G('Ada ' + nama + ' di ' + rel(p) + '. Hapus, cabut, dan buat ulang kuncinya.');
}

console.log('Diperiksa: ' + nJs + ' berkas JS, ' + semua.filter((x) => x.endsWith('.json')).length + ' JSON, index.html, manifest, service worker, dan pola rahasia.');
if (gagal.length) { console.error('\nGAGAL (' + gagal.length + '):'); gagal.forEach((m) => console.error(' - ' + m)); process.exit(1); }
console.log('Semua pemeriksaan lolos.');
