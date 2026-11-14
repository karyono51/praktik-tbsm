#!/usr/bin/env node
/* Membuat functions/cbt/src/bawaan.json dari js/soal-tka.js.
   Berkas ini memuat kunci 60 soal bawaan untuk fungsi server cbt (penilaian latihan di server).
   Jalankan ulang setiap kali js/soal-tka.js berubah:  node tools/bangun-bawaan.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'js/soal-tka.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const L = sandbox.window.SOAL_TKA || [];
if (!L.length) { console.error('SOAL_TKA kosong.'); process.exit(1); }
const out = L.map((q) => {
  const o = { id: q.id, tipe: q.tipe, tujuan: q.tujuan || 'keduanya', kelas: q.kelas || '', bahas: q.bahas || '' };
  if (q.tipe === 'kategori') { o.rk = q.rows.map((r) => !!r[1]); o.n = q.rows.length; }
  else { o.kunci = q.kunci; o.n = q.opts.length; }
  return o;
});
const dest = path.join(root, 'functions/cbt/src/bawaan.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`${out.length} soal bawaan ditulis ke ${path.relative(root, dest)}`);
