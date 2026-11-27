#!/usr/bin/env node
/* Regresi penuh sebelum rilis produksi.   node tools/regresi.mjs
   Menjalankan berurutan: rilis --cek, periksa, audit-izin, lalu semua tools/uji-*.mjs.
   Hasil ringkas: satu baris per langkah, total lulus/gagal dari tiap uji, dan keluar 1 bila ada yang gagal.
   --cepat  melewati uji yang lama (uji-beban). */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cepat = process.argv.includes('--cepat');
const langkah = [['rilis --cek', ['tools/rilis.mjs', '--cek', '--senyap']], ['periksa', ['tools/periksa.mjs']], ['audit-izin', ['tools/audit-izin.mjs']]];
for (const f of fs.readdirSync(path.join(root, 'tools')).sort()) {
  if (!/^uji-.*\.mjs$/.test(f)) continue;
  if (cepat && f === 'uji-beban.mjs') continue;
  langkah.push([f.replace(/\.mjs$/, ''), ['tools/' + f]]);
}
let tLulus = 0, tGagal = 0, rusak = [];
const mulai = Date.now();
for (const [nama, args] of langkah) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = out.match(/(\d+) lulus,? (\d+) gagal/);
  const lulus = m ? +m[1] : 0, gagal = m ? +m[2] : 0;
  const ok = r.status === 0 && gagal === 0 && !/GAGAL/.test(out.split('\n').filter((l) => /^\s*GAGAL/.test(l)).join(''));
  tLulus += lulus; tGagal += gagal;
  if (!ok) rusak.push(nama);
  console.log((ok ? 'OK    ' : 'GAGAL ') + nama.padEnd(26) + (m ? lulus + ' lulus, ' + gagal + ' gagal' : (ok ? '' : 'kode ' + r.status)) + '  (' + ((Date.now() - t0) / 1000).toFixed(1) + ' dtk)');
  if (!ok) console.log(out.split('\n').filter((l) => /GAGAL|Error|gagal/i.test(l)).slice(0, 6).map((l) => '      ' + l).join('\n'));
}
console.log('\n' + langkah.length + ' langkah, ' + tLulus + ' pemeriksaan lulus, ' + tGagal + ' gagal, ' + ((Date.now() - mulai) / 1000).toFixed(0) + ' dtk');
if (rusak.length) { console.log('Perlu diperbaiki: ' + rusak.join(', ')); process.exit(1); }
console.log('Regresi bersih. Aman dirilis.');
