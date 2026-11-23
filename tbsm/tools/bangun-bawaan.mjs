#!/usr/bin/env node
/* Membuat functions/cbt/src/bawaan.json dari js/soal-tka.js DAN semua js/soal-lkpd/*.js (soal per unit LKPD).
   Berkas ini memuat kunci semua soal bawaan untuk fungsi server cbt (penilaian latihan di server).
   Jalankan ulang setiap kali js/soal-tka.js atau js/soal-lkpd/*.js berubah:  node tools/bangun-bawaan.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
/* soal-tka.js dahulu (ia mengisi window.SOAL_TKA), lalu soal-lkpd/*.js menambahkan ke daftar yang sama, urutan seperti di index.html */
vm.runInContext(fs.readFileSync(path.join(root, 'js/soal-tka.js'), 'utf8'), sandbox);
const dirLkpd = path.join(root, 'js/soal-lkpd');
const urut = fs.existsSync(dirLkpd) ? fs.readdirSync(dirLkpd).filter((f) => f.endsWith('.js')).sort() : [];
urut.forEach((f) => vm.runInContext(fs.readFileSync(path.join(dirLkpd, f), 'utf8'), sandbox));
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
