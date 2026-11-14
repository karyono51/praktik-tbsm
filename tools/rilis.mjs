#!/usr/bin/env node
/* Siapkan rilis: versi berkas otomatis dari isi berkas, tanpa menaikkan angka manual.
   Jalankan:  node tools/rilis.mjs            (menulis index.html dan service-worker.js)
              node tools/rilis.mjs --cek      (hanya memeriksa; keluar 1 bila perlu rilis)
              node tools/rilis.mjs --pasang-hook   (pasang pre-commit git yang menjalankan skrip ini)
   Yang dikerjakan:
   1. Tiap <script src="js/..."> dan <link href="css/..."> di index.html diberi ?v=<hash isi berkas>.
      Berkas yang tidak berubah mendapat alamat yang sama, jadi tetap dipakai dari cache perangkat.
   2. service-worker.js: daftar LOCAL ditulis ulang dari index.html, nama CACHE (tbsm-v<yymmddHHMM>) berganti
      hanya bila ada isi yang berubah. Penanda build: di baris kedua menyimpan hash gabungan.
   Di GitHub Actions skrip ini dijalankan otomatis sebelum deploy, jadi lupa menjalankannya tidak membuat
   pengguna terjebak di versi lama. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CEK = args.includes('--cek');
const SENYAP = args.includes('--senyap');
const log = (...a) => { if (!SENYAP) console.log(...a); };

if (args.includes('--pasang-hook')) {
  const hook = path.join(root, '.git', 'hooks', 'pre-commit');
  if (!fs.existsSync(path.join(root, '.git'))) { console.error('Folder .git tidak ditemukan.'); process.exit(1); }
  fs.writeFileSync(hook, '#!/bin/sh\nnode tools/rilis.mjs --senyap && git add index.html service-worker.js\n', { mode: 0o755 });
  console.log('Hook pre-commit terpasang: versi berkas diperbarui otomatis setiap commit.');
  process.exit(0);
}

const sha = (buf) => crypto.createHash('sha1').update(buf).digest('hex');
const read = (f) => fs.readFileSync(path.join(root, f));
const gagal = (m) => { console.error('GAGAL: ' + m); process.exit(1); };

/* 1. index.html */
const indexRaw = read('index.html').toString('utf8');
const REF = /((?:src|href)=")((?:js|css)\/[^"?#]+)(?:\?v=[^"]*)?(")/g;
const hashed = [];            // [path, hash]
const hashOf = {};
let newIndex = indexRaw.replace(REF, (m, a, p, z) => {
  if (!fs.existsSync(path.join(root, p))) gagal('berkas dirujuk index.html tidak ada: ' + p);
  const h = hashOf[p] || (hashOf[p] = sha(read(p)).slice(0, 8));
  if (!hashed.some((x) => x[0] === p)) hashed.push([p, h]);
  return a + p + '?v=' + h + z;
});
const lama = {};
for (const m of indexRaw.matchAll(/((?:src|href)=")((?:js|css)\/[^"?#]+)\?v=([^"]*)"/g)) lama[m[2]] = m[3];
const berubah = hashed.filter(([p, h]) => lama[p] !== h).map(([p]) => p);

/* 2. service-worker.js */
let sw = read('service-worker.js').toString('utf8');
const mLocal = /^var LOCAL=(\[.*\]);$/m.exec(sw);
if (!mLocal) gagal('baris "var LOCAL=[...];" tidak ditemukan di service-worker.js');
const lokalLama = new Function('return ' + mLocal[1])();
const statis = lokalLama.map((u) => u.split('?')[0]).filter((u) => !/^(js|css)\//.test(u));
const hilang = statis.filter((u) => u !== './' && !fs.existsSync(path.join(root, u)));
if (hilang.length) gagal('berkas di daftar cache tidak ada: ' + hilang.join(', '));
const urls = [...statis, ...hashed.map(([p, h]) => p + '?v=' + h)];
/* cadangan: pastikan setiap berkas JS di folder js/ yang dirujuk lewat index.html ikut tercatat */
const sisa = [];
(function walk(d) { for (const f of fs.readdirSync(path.join(root, d))) { const r = d + '/' + f; if (fs.statSync(path.join(root, r)).isDirectory()) walk(r); else if (r.endsWith('.js') && !hashOf[r]) sisa.push(r); } })('js');

/* hash gabungan: isi tiap berkas lokal; index.html tanpa ?v= agar tidak melingkar */
const normIndex = newIndex.replace(/\?v=[0-9a-f]{8}/g, '');
const gabung = sha(urls.map((u) => {
  const p = u.split('?')[0];
  if (p === 'index.html') return p + ':' + sha(normIndex);
  if (p === './') return p;
  return p + ':' + sha(read(p));
}).join('\n')).slice(0, 12);

const markLama = (/\/\*build:([0-9a-f]+)\*\//.exec(sw) || [])[1];
let cache = (/^var CACHE='([^']+)';$/m.exec(sw) || [])[1];
if (markLama !== gabung || !cache) {
  const d = new Date(), z = (n) => String(n).padStart(2, '0');
  cache = 'tbsm-v' + String(d.getFullYear()).slice(2) + z(d.getMonth() + 1) + z(d.getDate()) + z(d.getHours()) + z(d.getMinutes());
}
const q = (a) => '[' + a.map((u) => "'" + u + "'").join(',') + ']';
let newSw = sw
  .replace(/^var CACHE='[^']*';$/m, "var CACHE='" + cache + "';")
  .replace(/^var LOCAL=\[.*\];$/m, 'var LOCAL=' + q(urls) + ';');
if (/\/\*build:[0-9a-f]+\*\//.test(newSw)) newSw = newSw.replace(/\/\*build:[0-9a-f]+\*\//, '/*build:' + gabung + '*/');
else newSw = newSw.replace(/^(.*\n)/, '$1/*build:' + gabung + '*/\n');

/* peringatan: skrip CDN di index.html yang belum ada di daftar CDN service worker */
const cdnSw = /^var CDN=(\[.*\]);$/m.exec(sw);
if (cdnSw) {
  const daftar = new Function('return ' + cdnSw[1])();
  for (const m of indexRaw.matchAll(/(?:src|href)="(https:\/\/[^"]+)"/g)) if (!daftar.includes(m[1]) && !/^https:\/\/[^/]+\/?$/.test(m[1])) log('Catatan: ' + m[1] + ' belum ada di daftar CDN service worker.');
}
if (sisa.length) log('Catatan: berkas JS tidak dirujuk index.html (tidak dimuat aplikasi): ' + sisa.join(', '));

const perlu = newIndex !== indexRaw || newSw !== sw;
if (CEK) {
  log(perlu ? 'Perlu rilis: jalankan  node tools/rilis.mjs' : 'Sudah terbaru (' + cache + ').');
  process.exit(perlu ? 1 : 0);
}
if (newIndex !== indexRaw) fs.writeFileSync(path.join(root, 'index.html'), newIndex);
if (newSw !== sw) fs.writeFileSync(path.join(root, 'service-worker.js'), newSw);
log(perlu ? 'Rilis disiapkan: ' + cache + ' (' + hashed.length + ' berkas berversi, ' + berubah.length + ' berubah)' : 'Tidak ada perubahan. ' + cache);
if (berubah.length && berubah.length <= 12) log('Berubah: ' + berubah.join(', '));
