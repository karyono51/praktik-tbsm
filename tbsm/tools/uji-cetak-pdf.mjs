#!/usr/bin/env node
/* Uji nama berkas PDF cetak LKPD (lkpd-cetak.js): LKPD <id LKPD> <judul LKPD> <nama sekolah>.
   node tools/uji-cetak-pdf.mjs
   Tata letak cetak (tabel hanya untuk rencana pertemuan, F1-F3, tanda tangan; kotak pilihan; Benar/Salah) diperiksa dengan Chromium (PDF Ctrl+P). */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + n + (x ? ' -> ' + x : '')); } };
const el = () => ({ addEventListener() {}, appendChild() {}, remove() {}, classList: { add() {}, remove() {} }, style: {}, set textContent(v) {}, set innerHTML(v) {} });
const ctx = { console, String, document: Object.assign(el(), { createElement: el, head: el(), body: el(), title: 'KBM Praktik TBSM' }), SEK: { nama: 'SMKS Medina Bandung' } };
ctx.window = ctx; ctx.addEventListener = () => {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/lkpd-cetak.js'), 'utf8'), ctx);
const L = ctx.LKC;
ok('LKC tersedia', !!L && typeof L.namaPdf === 'function');
const M = { id: 'LKPD-X-06', title: 'Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge)' };
const harap = 'LKPD X-06 Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge) SMKS Medina Bandung';
ok('format: LKPD <id> <judul> <sekolah>', L.namaPdf(M) === harap, L.namaPdf(M));
ctx.SEK = { nama: 'SMKS Darul Fatwa' };
ok('sekolah lain mengikuti sekolah aktif', L.namaPdf({ id: 'LKPD-XI-03', title: 'Rem Cakram' }) === 'LKPD XI-03 Rem Cakram SMKS Darul Fatwa', L.namaPdf({ id: 'LKPD-XI-03', title: 'Rem Cakram' }));
ok('karakter terlarang dibuang', L.namaPdf({ id: 'LKPD-X-01', title: 'Tune-up: 4/6 "uji" <awal>?' }) === 'LKPD X-01 Tune-up 4 6 uji awal SMKS Darul Fatwa', L.namaPdf({ id: 'LKPD-X-01', title: 'Tune-up: 4/6 "uji" <awal>?' }));
ok('id tanpa awalan LKPD tetap dipakai', L.namaPdf({ id: 'X-1', title: 'Uji' }) === 'LKPD X-1 Uji SMKS Darul Fatwa', L.namaPdf({ id: 'X-1', title: 'Uji' }));
ctx.SEK = undefined;
ok('tanpa sekolah: tetap LKPD <id> <judul>', L.namaPdf(M) === 'LKPD X-06 Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge)', L.namaPdf(M));
ok('tanpa modul: LKPD', L.namaPdf() === 'LKPD', L.namaPdf());
ok('tanpa spasi ganda atau tepi', !/\s\s|^\s|\s$/.test(L.namaPdf({ id: ' LKPD-X-02 ', title: '  A   B ' })), L.namaPdf({ id: ' LKPD-X-02 ', title: '  A   B ' }));
console.log(gagal ? `\nUji cetak PDF: ${lulus} lulus, ${gagal} gagal` : `\nUji cetak PDF: ${lulus} lulus, 0 gagal`);
process.exit(gagal ? 1 : 0);
