#!/usr/bin/env node
/* Uji gambar skala tanpa label untuk soal Latihan membaca skala (lkpd-skala-gambar.js).
   node tools/uji-skala-tanpa-label.mjs
   Siswa melihat gambar tanpa angka jawaban; pembahasan dan kunci memakai gambar berlabel. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, Math, String, JSON });
vm.runInContext(`
function lkqRender(q,i,d){return '<div class="qbox"><b>'+(i+1)+'. '+q.q+'</b></div>'}
function lkgQHtml(q){return ''}`, ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'lkpd-skala-gambar.js'), 'utf8'), ctx, { filename: 'lkpd-skala-gambar.js' });
const G = (e) => vm.runInContext(e, ctx);
const kasus = {
  jangka: { q: 'J', g: { k: 'jangka', res: 0.05, main: 24, n: 7 }, label: /nonius ke-7/ },
  mikro: { q: 'M', g: { k: 'mikro', sel: 7, half: true, bidal: 28 }, label: /bidal 28/ },
  dial: { q: 'D', g: { k: 'dial', rev: 2, b: 45 }, label: /garis ke-45|Jarum kecil: 2/ },
  olengan: { q: 'O', g: { k: 'olengan', max: 32, min: 10 }, label: /0,32 mm|0,10 mm/ }
};
for (const [nama, c] of Object.entries(kasus)) {
  const siswa = G(`skgBox(${JSON.stringify(c)}.q?${JSON.stringify({ g: c.g })}:null,true)`);
  const kunci = G(`skgBox(${JSON.stringify({ g: c.g })})`);
  ok(/<svg/.test(siswa), nama + ': gambar siswa tetap tampil');
  ok(!c.label.test(siswa), nama + ': gambar siswa tanpa label jawaban');
  ok(c.label.test(kunci), nama + ': gambar pembahasan berlabel');
}
const sj = G(`skgBox(${JSON.stringify({ g: kasus.jangka.g })},true)`);
ok(!/#d32f2f/.test(sj), 'jangka sorong siswa: garis berimpit tidak disorot merah');
const rr = G(`lkqRender({id:'J1',q:'Baca',g:${JSON.stringify(kasus.jangka.g)}},0,{})`);
ok((rr.match(/<svg/g) || []).length === 1 && !/nonius ke-7/.test(rr), 'lkqRender siswa: satu gambar tanpa label');
console.log(`\nUji skala tanpa label: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
