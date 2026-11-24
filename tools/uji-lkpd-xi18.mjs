#!/usr/bin/env node
/* Uji modul LKPD-XI-18 (Transmisi dan CVT): data, master V2, hitungan kunci. node tools/uji-lkpd-xi18.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0; const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, JSON, Math, Object, Array, String, Number, Date, RegExp, window: null,
  document: { addEventListener() {}, createElement() { return { style: {} } }, head: { appendChild() {} }, body: {} } });
ctx.window = ctx;
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
const run = (code, n) => vm.runInContext(code, ctx, { filename: n });
run(src('lkpd-modul.js'), 'a'); run(src('lkpd-v2-x07.js'), 'b'); run(src('lkpd-v2-xi18.js'), 'c'); run(src('lkpd.js').split('\n').slice(0, 19).join('\n'), 'd');
run(`function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}function lkEsc(x){return String(x==null?'':x)}
var STAFF=true;function isStaff(){return STAFF}var LKS={id:'LKPD-X-07'};function lksMod(){return null}function lksHub(){return ''}
var LK={},LKA={},LKM={};function render(){}function toast(){}function lkEditorDefaults(m){return {src:m}}`, 'stub');
run(src('lkpd-master.js'), 'lkpd-master.js');
const G = (e) => vm.runInContext(e, ctx);
const m = G('LKPD_MODULES.find(function(x){return x.id==="LKPD-XI-18"})');
ok(!!m, 'LKPD-XI-18 terdaftar'); const V = m.v2;
ok(G('LKPD_MODULES.filter(function(x){return x.id==="LKPD-XI-18"}).length') === 1, 'terdaftar satu kali');
ok(m.status === 'draft' && m.active === false && m.kelas === 'XI', 'status Draft, tidak aktif, Kelas XI');
ok(G('LKPD_MODULES.some(function(x){return x.id==="LKPD-X-07"})'), 'LKPD-X-07 tetap ada');
/* master V2: 14 butir */
const cek = ctx.lkmsCek(m);
ok(cek.length === 14 && cek.every((x) => x.ok), 'memenuhi 14 butir master: ' + cek.filter((x) => !x.ok).map((x) => x.k + ' (' + x.t + ')').join('; '));
ok(ctx.lkmsMaster(m) === false, 'bukan master (master tetap X-07)');
/* waktu */
const P = V.pertemuan;
ok(P.length === 6 && P.every((p) => p.jp === 6 && p.menit === 270), '6 pertemuan x 6 JP x 270 menit');
ok(P.reduce((t, p) => t + p.jp, 0) === V.jp && V.jp === 36, 'jumlah JP = 36');
ok(m.duration === P.reduce((t, p) => t + p.menit, 0), 'duration = jumlah menit pertemuan');
const mk = (k) => V.langkah.filter((l) => l.k === k).reduce((t, l) => t + l.menit, 0);
P.forEach((p) => { if (p.kegiatan.length) ok(p.praktik === p.kegiatan.reduce((t, k) => t + mk(k), 0) && p.praktik < p.menit, 'P' + p.n + ' target praktik = jumlah menit langkah dan < menit pertemuan'); });
ok(P.filter((p) => p.kegiatan.length > 1).length === 0, 'kegiatan tidak digabung dalam satu pertemuan');
ok(V.kegiatan.length === 4 && [1, 2, 3, 4].every((k) => P.some((p) => p.kegiatan.join() === String(k))), 'tiap kegiatan punya satu pertemuan sendiri');
ok(V.langkah.length === m.steps.length && V.langkah.every((l, i) => l.i === i && (l.menit | 0) > 0), 'langkah sejajar steps');
[1, 2, 3, 4].forEach((k) => ok(V.langkah.some((l) => l.k === k && l.saksi), 'kegiatan ' + k + ' punya langkah bersaksi guru'));
/* rubrik */
const a = V.obs.aspek; ok(a.reduce((t, x) => t + x.b, 0) === 100, 'bobot rubrik 100');
const w = a.find((x) => x.id === 'waktu').ket;
ok(w.indexOf('total praktik ' + [1, 2, 3, 4].reduce((t, k) => t + mk(k), 0) + ' menit') > -1 && [1, 2, 3, 4].every((k) => w.indexOf(' ' + mk(k)) > -1), 'angka waktu rubrik sama dengan menit langkah');
ok(a.filter((x) => x.stop).length === 1 && a.find((x) => x.stop).id === 'k3', 'aspek penghenti = K3');
ok(V.obs.indikator.length === 8, '8 indikator');
/* check, foto, otomatis */
ok(V.cekK.length === m.checks.length && V.cekK.every((k) => k >= 1 && k <= 4), 'cekK sejajar checks');
ok(m.fotoWajib.every((i) => i < m.checks.length), 'fotoWajib valid');
Object.keys(V.cekAuto).forEach((i) => { const c = V.cekAuto[i], t = V.tabel.find((x) => x.id === c.t); ok(+i < m.checks.length && t && t.kol.some((k) => k.k === c.f) && t.k === V.cekK[i], 'cekAuto ' + i + ' menunjuk tabel kegiatan yang sama'); });
V.tabel.forEach((t) => ok(t.kol.some((k) => k.t === 'rata' && k.dari.every((d) => t.kol.some((x) => x.k === d))) && t.baris.length === 3, 'tabel ' + t.id + ' kolom rata-rata valid, 3 baris'));
/* K3 */
const cov = V.k3grup.reduce((t, g) => t.concat(g.i), []).sort((x, y) => x - y);
ok(cov.length === m.safety.length && cov.every((v, i) => v === i), 'butir K3 masing-masing satu kelompok'); ok(m.safety.length === 10, '10 butir K3');
/* soal latihan: kunci dihitung ulang */
const q = {}; m.quiz.forEach((x) => { q[x.id] = x; });
const near = (x, y) => Math.abs(x - y) < 1e-9;
ok(near(q.T1.kunci, 35 / 14), 'T1 = 35/14'); ok(near(q.T2.kunci, 3 * 1.5 * 2.8), 'T2 = 12,6');
ok(near(q.T3.kunci, +(22 - 21.1).toFixed(2)), 'T3 = 0,90'); ok(near(q.T4.kunci, 130 / 50), 'T4 = 2,6');
ok(near(q.T5.kunci, +((3.95 + 3.9 + 4.05) / 3).toFixed(2)), 'T5 = 3,97'); ok(near(q.T6.kunci, +(109 - 106.4).toFixed(2)), 'T6 = 2,6');
ok(near(q.T7.kunci, +(40.2 / 6).toFixed(2)), 'T7 = 6,7'); ok(near(q.T8.kunci, (18 - 5) / 100), 'T8 = 0,13 dan sama dengan gambar');
ok(m.quiz.length === 8 && m.quiz.every((x) => x.t === 'isian' && x.tol > 0 && x.e), '8 soal isian berkunci, bertoleransi, berpembahasan');
const ids = {}; m.quiz.forEach((x) => { ids[x.id] = (ids[x.id] || 0) + 1; }); ok(Object.values(ids).every((n) => n === 1), 'id soal unik');
ok(P.reduce((t, p) => t.concat(p.latihan || []), []).sort().join() === m.quiz.map((x) => x.id).sort().join(), 'tiap soal latihan masuk tepat satu pertemuan');
/* gerbang */
const g = V.gate.qs; ok(g.length === 5 && g.filter((x) => x.t === 'pg').length === 3 && g.some((x) => x.t === 'kompleks') && g.some((x) => x.t === 'kategori'), 'gerbang: 3 PG, 1 kompleks, 1 kategori');
ok(near(3 * 1.8 * 2.5, 13.5) && near(5400 / 13.5, 400) && g[1].o[g[1].a] === '400 rpm', 'G2 kunci 400 rpm');
ok(['1.000 rpm|' + 5400 / 5.4, '2.160 rpm|' + 5400 / 2.5, '1.800 rpm|' + 5400 / 3, '72.900 rpm|' + 5400 * 13.5].every((s) => g[1].o.indexOf(s.split('|')[0]) > -1 && near(+s.split('|')[1], +s.split('|')[0].replace(' rpm', '').replace('.', ''))), 'G2 pengecoh sesuai pembahasan');
g.filter((x) => x.t === 'pg').forEach((x, i) => { const L = x.o.map((s) => s.length), mx = Math.max.apply(null, L); ok(x.o.length === 5 && !(L[x.a] === mx && L.filter((n) => n === mx).length === 1 && x.t === 'pg' && L[x.a] > 20 && i !== 1), 'PG ' + (i + 1) + ': kunci bukan satu-satunya pilihan terpanjang'); });
ok(g.every((x) => x.e && x.e.length > 40 && (x.lvl === 'Aplikasi' || x.lvl === 'Penalaran')), 'semua soal gerbang berpembahasan dan berlevel');
ok(g[2].a.join() === '0,2' && g[3].rows.map((r) => r[1]).join() === 'true,false,true,false,true', 'kunci kompleks dan kategori sesuai rancangan');
/* tidak ada spesifikasi kendaraan yang dikarang: kolom standar tidak diisi */
ok(V.tabel.every((t) => !JSON.stringify(t).match(/"std":[^,}]*\d/)), 'kolom Standar kosong (diisi guru dari manual servis)');
ok(!/undefined|NaN/.test(JSON.stringify(m)), 'tanpa undefined atau NaN');
console.log('\nUji LKPD-XI-18: ' + lulus + ' lulus, ' + gagal + ' gagal'); process.exit(gagal ? 1 : 0);
