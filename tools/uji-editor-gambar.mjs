#!/usr/bin/env node
/* Uji nilai gambar skala di Editor LKPD v2: skgHitung cocok dengan kunci soal X-07, lkeGBox menampilkan kolom dan peringatan.
   node tools/uji-editor-gambar.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, Math, String, JSON, Number, isFinite, document: { addEventListener() {} } });
vm.runInContext(`
function lkqRender(q,i,d){return ''}
function lkgQHtml(q){return ''}
function esc(s){return String(s)}
function lkeT(v){return v==null?'':String(v).trim()}
function lkeNum(v){var s=lkeT(v).replace(',','.');if(s==='')return NaN;return Number(s)}`, ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'lkpd-skala-gambar.js'), 'utf8'), ctx);
const src = fs.readFileSync(path.join(root, 'js', 'lkpd-v2-editor.js'), 'utf8');
const mulai = src.indexOf('var LKE_GF=');
const akhir = src.indexOf('document.addEventListener', mulai);
ok(mulai > -1 && akhir > mulai, 'blok nilai gambar ada di editor');
vm.runInContext(src.slice(mulai, akhir), ctx);
const G = (e) => vm.runInContext(e, ctx);
// semua soal isian bergambar di data X-07: hitungan gambar = kunci
const x07 = fs.readFileSync(path.join(root, 'js', 'lkpd-v2-x07.js'), 'utf8');
const baris = x07.split('\n').filter(l => /t:'isian'/.test(l) && /g:\{/.test(l));
ok(baris.length >= 10, 'ada 10 soal isian bergambar (' + baris.length + ')');
for (const l of baris) {
  const id = /id:'(\w+)'/.exec(l)[1], kunci = +/kunci:([\d.]+)/.exec(l)[1];
  const g = /g:(\{[^}]*\})/.exec(l)[1];
  const hit = G('skgHitung(' + g.replace(/(\w+):/g, '"$1":').replace(/'/g, '"') + ')');
  ok(Math.abs(hit - kunci) < 1e-9, id + ': gambar ' + hit + ' = kunci ' + kunci);
}
ok(Number.isNaN(G('skgHitung({k:"jangka",res:0.05,main:24})')), 'data tidak lengkap menghasilkan NaN');
ok(Number.isNaN(G('skgHitung(null)')), 'tanpa gambar menghasilkan NaN');
const cocok = G('lkeGBox({kunci:24.35,g:{k:"jangka",res:0.05,main:24,n:7}},0)');
ok(/data-lkg="0.main"/.test(cocok) && /data-lkg="0.n"/.test(cocok), 'kolom skala utama dan nonius tampil');
ok(!/Samakan kunci/.test(cocok), 'kunci cocok: tanpa peringatan');
const beda = G('lkeGBox({kunci:24.4,g:{k:"jangka",res:0.05,main:24,n:7}},0)');
ok(/Samakan kunci/.test(beda) && /24,35 mm/.test(beda), 'kunci beda: peringatan dan tombol Samakan kunci');
for (const g of ['{k:"mikro",sel:7,half:true,bidal:28}', '{k:"dial",rev:2,b:45}', '{k:"olengan",max:32,min:10}']) {
  const h = G('lkeGBox({kunci:1,g:' + g + '},3)');
  ok(/data-lkg="3\./.test(h), 'kolom tampil untuk ' + g);
}
console.log('\nUji editor gambar skala: ' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
