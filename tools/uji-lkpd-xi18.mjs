#!/usr/bin/env node
/* Uji modul LKPD-XI-17 (Transmisi Manual) dan LKPD-XI-18 (Transmisi Otomatis/CVT): data, master V2, hitungan kunci. node tools/uji-lkpd-xi18.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0; const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, JSON, Math, Object, Array, String, Number, Date, RegExp, window: null,
  document: { addEventListener() {}, createElement() { return { style: {} } }, head: { appendChild() {} }, body: {} } });
ctx.window = ctx;
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
const run = (code, n) => vm.runInContext(code, ctx, { filename: n });
run(src('lkpd-modul.js'), 'a'); run(src('lkpd-v2-x06.js'), 'b'); run(src('lkpd-v2-xi17.js'), 'c1'); run(src('lkpd-v2-xi18.js'), 'c2'); run(src('lkpd.js').split('\n').slice(0, 19).join('\n'), 'd');
run(`function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}function lkEsc(x){return String(x==null?'':x)}
var STAFF=true;function isStaff(){return STAFF}var LKS={id:'LKPD-X-06'};function lksMod(){return null}function lksHub(){return ''}
var LK={},LKA={},LKM={};function render(){}function toast(){}function lkEditorDefaults(m){return {src:m}}`, 'stub');
run(src('lkpd-master.js'), 'lkpd-master.js');
const G = (e) => vm.runInContext(e, ctx);
const near = (x, y) => Math.abs(x - y) < 1e-9;
ok(G('LKPD_MODULES.some(function(x){return x.id==="LKPD-X-06"})'), 'LKPD-X-06 tetap ada');

function uji(id, judul, skkni, kunciSoal, mengandung) {
  const m = G('LKPD_MODULES.find(function(x){return x.id==="' + id + '"})'); const T = (c, t) => ok(c, id + ': ' + t);
  T(!!m, 'terdaftar'); if (!m) return; const V = m.v2;
  T(G('LKPD_MODULES.filter(function(x){return x.id==="' + id + '"}).length') === 1, 'terdaftar satu kali');
  T(m.title === judul, 'judul sesuai matriks ringkas: ' + m.title);
  T(m.status === 'draft' && m.active === false && m.kelas === 'XI' && V.tp === 'XI.3.2', 'status Draft, tidak aktif, Kelas XI, TP XI.3.2');
  T(m.skkni.indexOf(skkni) === 0 && m.skkni.indexOf('verifikasi') > -1, 'unit SKKNI sesuai matriks ringkas dan bertanda verifikasi');
  const cek = ctx.lkmsCek(m);
  T(cek.length === 14 && cek.every((x) => x.ok), 'memenuhi 14 butir master: ' + cek.filter((x) => !x.ok).map((x) => x.k + ' (' + x.t + ')').join('; '));
  const P = V.pertemuan;
  T(P.length === 3 && P.every((p) => p.jp === 6 && p.menit === 270), '3 pertemuan x 6 JP x 270 menit (6 JP per pertemuan Kelas XI)');
  T(V.jp === 18 && P.reduce((t, p) => t + p.jp, 0) === 18, 'jumlah JP = 18 (sesuai matriks ringkas)');
  T(m.duration === P.reduce((t, p) => t + p.menit, 0), 'duration = jumlah menit pertemuan');
  const mk = (k) => V.langkah.filter((l) => l.k === k).reduce((t, l) => t + l.menit, 0);
  P.forEach((p) => { if (p.kegiatan.length) T(p.praktik === p.kegiatan.reduce((t, k) => t + mk(k), 0) && p.praktik > 0 && p.praktik < p.menit, 'P' + p.n + ' target praktik = jumlah menit langkah dan < menit pertemuan'); });
  T(P.every((p) => p.kegiatan.length >= 1) && P[1].kegiatan.join() === '2,3' && !!P[1].kartu.per, 'P1 Kegiatan 1, P2 Kegiatan 2 dan 3 (dua kartu), P3 Kegiatan 4');
  T(V.kegiatan.length === 4 && [1, 2, 3, 4].every((k) => P.filter((p) => p.kegiatan.indexOf(k) > -1).length === 1), 'tiap kegiatan masuk tepat satu pertemuan');
  T(V.langkah.length === m.steps.length && V.langkah.every((l, i) => l.i === i && l.menit > 0), 'langkah sejajar steps');
  [1, 2, 3, 4].forEach((k) => T(V.langkah.some((l) => l.k === k && l.saksi), 'kegiatan ' + k + ' punya langkah bersaksi'));
  const a = V.obs.aspek; T(a.reduce((t, x) => t + x.b, 0) === 100 && a.filter((x) => x.stop).length === 1 && a.find((x) => x.stop).id === 'k3', 'rubrik 100, penghenti K3');
  const w = a.find((x) => x.id === 'waktu').ket;
  T(w.indexOf('total praktik ' + [1, 2, 3, 4].reduce((t, k) => t + mk(k), 0) + ' menit') > -1 && [1, 2, 3, 4].every((k) => w.indexOf(' ' + mk(k)) > -1), 'angka waktu rubrik = menit langkah');
  T(V.obs.indikator.length === 8, '8 indikator');
  T(V.cekK.length === m.checks.length && V.cekK.every((k) => k >= 1 && k <= 4) && m.fotoWajib.every((i) => i < m.checks.length), 'cekK dan fotoWajib valid');
  T(Array.isArray(V.tabel) && V.tabel.length === 0 && !V.cekAuto, 'tanpa tabel F dan tanpa cekAuto: hasil aktual diisi manual di Pemeriksaan dan bukti');
  const cov = V.k3grup.reduce((t, g) => t.concat(g.i), []).sort((x, y) => x - y);
  T(cov.length === 10 && m.safety.length === 10 && cov.every((v, i) => v === i), '10 butir K3 masing-masing satu kelompok');
  /* soal latihan */
  const q = {}; m.quiz.forEach((x) => { q[x.id] = x; });
  kunciSoal(q, T, mk);
  T(m.quiz.every((x) => x.t === 'isian' && x.tol > 0 && x.e), 'soal isian berkunci, bertoleransi, berpembahasan');
  T(P.reduce((t, p) => t.concat(p.latihan || []), []).sort().join() === m.quiz.map((x) => x.id).sort().join(), 'tiap soal latihan masuk tepat satu pertemuan');
  const g = V.gate.qs; T(g.length === 5 && g.filter((x) => x.t === 'pg').length === 3 && g.some((x) => x.t === 'kompleks') && g.some((x) => x.t === 'kategori'), 'gerbang: 3 PG, 1 kompleks, 1 kategori');
  g.filter((x) => x.t === 'pg').forEach((x, i) => { const L = x.o.map((s) => s.length), mx = Math.max.apply(null, L); T(x.o.length === 5 && x.a >= 0 && x.a < 5 && !(L[x.a] === mx && L.filter((n) => n === mx).length === 1 && L[x.a] > 20), 'PG ' + (i + 1) + ': kunci bukan satu-satunya pilihan terpanjang'); });
  T(g.every((x) => x.e && x.e.length > 40 && (x.lvl === 'Aplikasi' || x.lvl === 'Penalaran')), 'soal gerbang berpembahasan dan berlevel');
  T(g[2].a.join() === '0,2' || g[2].a.join() === '0,1' || g[2].a.length >= 2, 'kunci kompleks lebih dari satu');
  T(g[3].rows.every((r) => typeof r[1] === 'boolean') && g[3].rows.some((r) => r[1]) && g[3].rows.some((r) => !r[1]), 'kategori punya Benar dan Salah');
  mengandung(m, g, T);
  T(V.tabel.every((t) => !JSON.stringify(t).match(/"std":[^,}]*\d/)), 'kolom Standar kosong (diisi guru dari manual servis)');
  T(!/undefined|NaN/.test(JSON.stringify(m)), 'tanpa undefined atau NaN');
}

uji('LKPD-XI-17', 'Perawatan dan Perbaikan Sistem Transmisi Manual', 'unit 051', (q, T) => {
  T(near(q.M1.kunci, 35 / 14), 'M1 = 35/14'); T(near(q.M2.kunci, 3 * 1.5 * 2.8), 'M2 = 12,6');
  T(near(q.M3.kunci, +((5.9 + 5.85 + 5.95) / 3).toFixed(2)), 'M3 = 5,90'); T(near(q.M4.kunci, +(6.3 - 5.9).toFixed(2)), 'M4 = 0,40');
  T(near(q.M5.kunci, (12 - 4) / 100) && q.M5.g.max === 12 && q.M5.g.min === 4, 'M5 = 0,08 dan sama dengan gambar'); T(near(q.M6.kunci, 6000 / 12), 'M6 = 500');
  T(Object.keys(q).length === 6, '6 soal latihan');
}, (m, g, T) => {
  T(near(3 * 1.8 * 2.5, 13.5) && near(5400 / 13.5, 400) && g[1].o[g[1].a] === '400 rpm', 'gerbang 2 kunci 400 rpm');
  T(g[3].rows.map((r) => r[1]).join() === 'true,true,false,false,true' && near(0.12 - 0.04, 0.08), 'kategori keolengan: 0,12 − 0,04 = 0,08 dan kunci sesuai rancangan');
  T(g[0].a === 0 && /garpu/.test(g[0].o[0]), 'gerbang 1: kunci ganti garpu');
});
uji('LKPD-XI-18', 'Perawatan dan Perbaikan Sistem Transmisi Otomatis (CVT)', 'unit 027', (q, T) => {
  T(near(q.C1.kunci, +(22 - 21.1).toFixed(2)), 'C1 = 0,90'); T(near(q.C2.kunci, 130 / 50), 'C2 = 2,6'); T(near(q.C3.kunci, +(40.2 / 6).toFixed(2)), 'C3 = 6,7');
  T(near(q.C4.kunci, +(20 - 19.7).toFixed(2)), 'C4 = 0,30'); T(near(q.C5.kunci, +((3.95 + 3.9 + 4.05) / 3).toFixed(2)), 'C5 = 3,97'); T(near(q.C6.kunci, +(109 - 106.4).toFixed(2)), 'C6 = 2,6');
  T(Object.keys(q).length === 6, '6 soal latihan');
}, (m, g, T) => {
  T(near(5200 / (130 / 50), 2000) && g[1].o[g[1].a] === '2.000 rpm', 'gerbang 2 kunci 2.000 rpm');
  T([13520, 2000, 5200, 3200, 65].every((v, i) => g[1].o[i] === String(v).replace(/(\d)(?=(\d{3})$)/, '$1.') + ' rpm') && near(5200 * 2.6, 13520) && near(5200 * 80 / 130, 3200) && near(5200 / 80, 65), 'pengecoh gerbang 2 sesuai pembahasan');
  T(g[2].a.join() === '0,2' && g[3].rows.map((r) => r[1]).join() === 'true,false,true,false,true', 'kunci kompleks dan kategori sesuai rancangan');
  T(!/transmisi manual|garpu|shift drum/i.test(JSON.stringify(m)), 'tidak memuat materi transmisi manual (ada di XI-17)');
});
/* Tabel F dihapus di X-06, XI-17, XI-18: tidak ada sisa rujukan tabel atau pengukuran berulang pada langkah, pemeriksaan, analisis, rubrik, indikator. */
['LKPD-X-06', 'LKPD-XI-17', 'LKPD-XI-18'].forEach((id) => {
  const m = G('LKPD_MODULES.find(function(x){return x.id===\"' + id + '\"})'); const V = m.v2;
  ok(V.tabel.length === 0 && !V.cekAuto, id + ': tanpa tabel F');
  const teks = JSON.stringify([m.steps, m.checks, V.analisis, V.obs, V.langkah]);
  ok(!/[Tt]abel F|\bF[123]\b|3 kali|3 titik|dirata|Rata-rata/.test(teks), id + ': tidak ada rujukan tabel F atau pengukuran berulang: ' + (teks.match(/.{20}([Tt]abel F|\bF[123]\b|3 kali|3 titik|dirata|Rata-rata).{20}/) || [''])[0]);
});
console.log('\nUji LKPD-XI-17 dan XI-18: ' + lulus + ' lulus, ' + gagal + ' gagal'); process.exit(gagal ? 1 : 0);
