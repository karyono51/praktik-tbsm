#!/usr/bin/env node
/* Uji cetak LKPD dan Kunci untuk SEMUA LKPD bawaan (X-1..XII-7 dan LKPD-DDO-ALT-02), tanpa peramban.
   node tools/uji-lkpd-semua.mjs
   Memuat data modul asli, soal evaluasi asli (js/soal-lkpd), dan js/lkpd-format.js; tiap LKPD diperiksa cetaknya dan kuncinya. */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0; const STY = [];
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const ctx = vm.createContext({ console, JSON, Math, Object, Array, String, Number, Date, RegExp, localStorage: { getItem() { return null }, setItem() {} },
  document: { addEventListener() {}, createElement() { const e = { style: {} }; STY.push(e); return e; }, head: { appendChild() {} }, body: {}, getElementById() { return null } } });
ctx.window = ctx;
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
const run = (code, n) => vm.runInContext(code, ctx, { filename: n });
run(src('lkpd-modul.js'), 'lkpd-modul.js'); run(src('lkpd-v2-x06.js'), 'lkpd-v2-x06.js'); run(src('lkpd-v2-xi17.js'), 'lkpd-v2-xi17.js'); run(src('lkpd-v2-xi18.js'), 'lkpd-v2-xi18.js');
run(src('lkpd.js').split('\n').slice(0, 19).join('\n'), 'lkpd-data.js');
fs.readdirSync(path.join(root, 'js/soal-lkpd')).forEach((f) => run(src('soal-lkpd/' + f), f));
run(src('lkpd-soal.js').split('/* ---------- Pemasangan ke mesin LKPD ---------- */')[0], 'lkpd-soal-inti.js');
run(`var SEK={nama:'SMKS Medina Bandung',program:'Program Keahlian Teknik Sepeda Motor',alamat:'Bandung'};var LOGO='data:,';function lkYN(v){return v==='ya'||v===true?'ya':v==='tidak'?'tidak':''}
function lkEsc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var STAFF=true;function isStaff(){return STAFF}var LK={module:'X-1',tab:'materi',preview:false};function toast(){}
function viewLKPD(){return '<div class="chips"><button data-act="lk-print">Cetak</button></div><div class="row"><button class="btn" data-act="lk-print">Cetak</button></div>'}`, 'stub');
run(src('lkpd-format.js'), 'lkpd-format.js');
const G = (e) => vm.runInContext(e, ctx);
G('LKPD_MODULES=LKPD_MODULES.concat(LKPD_EXTRA_MODULES)'); /* seperti lkpd.js baris 20 */
const ALL = G('LKPD_MODULES.filter(function(m,i,a){return a.findIndex(function(x){return x.id===m.id})===i})');
ok(ALL.length === 3 && ALL.map((m) => m.id).join() === 'LKPD-DDO-ALT-02,LKPD-TSM-PMT-02,LKPD-TSM-PMT-03', 'hanya LKPD v2 (LKPD-DDO-ALT-02, LKPD-TSM-PMT-02, LKPD-TSM-PMT-03) yang bawaan (dapat ' + ALL.map((m) => m.id).join(',') + ')');
const abc = (k) => String.fromCharCode(65 + k);
const teks = (h) => h.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<br>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const H = (d) => ({ d: d || {}, pihak: { siswa: 'Budi', tanggal: '21/11/2026', guru: 'Karyono, S.T.' }, semester: 'Ganjil 2026/2027', mapel: 'Mapel', akhir: '<div>TTD</div>' });
ctx.__m = null;
ALL.forEach((m0) => {
  const m = JSON.parse(JSON.stringify(m0));
  if (!m.v2) { const qz = G(`lkqQuizFor(${JSON.stringify(m.id)})`); if (qz && qz.length) m.quiz = qz; }
  const id = m.id;
  /* ----- cetak LKPD ----- */
  let h = ''; try { h = ctx.lkfBangun(m, H({})) } catch (e) { ok(false, id + ': cetak melempar galat ' + e.message) }
  const T = teks(h);
  ok(h.length > 3000, id + ': cetak terisi');
  ok(!/undefined|NaN|\[object/.test(T), id + ': cetak tanpa undefined/NaN');
  ok(T.indexOf('LEMBAR KERJA PESERTA DIDIK (LKPD) PRAKTIK') > -1 && T.indexOf(m.title) > -1, id + ': judul lembar dan judul LKPD');
  ok(/Alokasi waktu :/.test(T) && /Nama siswa : Budi/.test(T), id + ': identitas');
  ok((m.objectives || []).every((x) => T.indexOf(String(x).slice(0, 25)) > -1), id + ': semua tujuan tercetak');
  ok((m.theory || []).every((x) => T.indexOf(x[0]) > -1), id + ': semua materi tercetak');
  ok((m.tools || []).every((x) => T.indexOf(String(x).slice(0, 20)) > -1), id + ': semua alat tercetak');
  ok((m.steps || []).every((x) => T.indexOf(String(x[0]).replace(/^Kegiatan \d+ · /, '').slice(0, 20)) > -1), id + ': semua langkah tercetak');
  ok((m.checks || []).every((x) => T.indexOf(x[0]) > -1), id + ': semua komponen pemeriksaan tercetak');
  if (!m.v2) {
    ok(/Prosedur praktik/.test(T) && /Hasil pemeriksaan/.test(T) && /Diagnosis dan analisis/.test(T), id + ': bagian v1 lengkap');
    ok((m.quiz || []).every((q) => T.indexOf(String(q.q).slice(0, 25)) > -1), id + ': semua soal evaluasi tercetak');
    ok(!/✔|☑/.test(T), id + ': lembar kosong bersih dari isian');
  } else ok((h.match(/class="lkf-ban"/g) || []).length === m.v2.pertemuan.length, id + ': satu banner tiap pertemuan');
  ok(h.indexOf('<script') < 0, id + ': tanpa script');
  /* ----- kunci ----- */
  const qs = m.v2 ? m.v2.gate.qs : m.quiz;
  let kh = ''; try { kh = ctx.lkfKunci(m) } catch (e) { ok(false, id + ': kunci melempar galat ' + e.message) }
  const KT = teks(kh);
  ok(/KUNCI DAN PEMBAHASAN (GERBANG MASUK|SOAL EVALUASI) \(UNTUK GURU\)/.test(KT) && /Dokumen ini tidak dibagikan kepada siswa/.test(KT), id + ': judul dan larangan dibagikan');
  ok(!/undefined|NaN|\[object/.test(KT), id + ': kunci tanpa undefined/NaN');
  const barisKunci = (kh.match(/<tr><td class="k">\d+<\/td>/g) || []).length;
  ok(barisKunci === qs.length && qs.length >= 5, id + ': satu baris kunci per soal (' + barisKunci + ' dari ' + qs.length + ')');
  qs.forEach((q, i) => {
    const t = q.t === 'kompleks' ? 'kompleks' : q.t === 'kategori' ? 'kategori' : 'pg';
    const harap = t === 'pg' ? '<b>' + abc(q.a) + '</b>' : t === 'kompleks' ? (() => { const L = q.a.slice().sort((x, y) => x - y).map(abc); return '<b>' + (L.length > 1 ? L.slice(0, -1).join(', ') + ' dan ' + L[L.length - 1] : L[0]) + '</b>' })() : '<b>' + q.rows.map((r, k) => (k + 1) + ' ' + (r[1] ? 'Benar' : 'Salah')).join('<br>') + '</b>';
    ok(kh.indexOf('<td>' + harap + '</td>') > -1, id + ' soal ' + (i + 1) + ': kunci ' + t + ' sesuai data');
    const bahas = (q.e || q.bahas || '').slice(0, 30).replace(/&/g, '&amp;');
    ok(!bahas || KT.indexOf(String(q.e || q.bahas).slice(0, 30)) > -1, id + ' soal ' + (i + 1) + ': pembahasan tercetak');
  });
  ok(/@bottom-left\{content:"Kunci (gerbang masuk|evaluasi) · LKPD [^"]+ · SMKS Medina Bandung \(khusus guru\)"/.test(kh), id + ': footer kunci khusus guru');
  /* ----- tombol di samping Cetak ----- */
  ctx.__id = id; G('LK.module=__id;STAFF=true');
  const v = G('viewLKPD()');
  ok((v.match(/data-act="lk-print-kunci"/g) || []).length === 2 && /data-act="lk-print">Cetak<\/button><button data-act="lk-print-kunci">/.test(v) && /<button class="btn" data-act="lk-print-kunci">/.test(v), id + ': tombol Cetak kunci di samping kedua tombol Cetak');
  G('STAFF=false');
  ok(G('viewLKPD()').indexOf('lk-print-kunci') < 0, id + ': siswa tidak melihat tombol Cetak kunci');
});
/* LKPD tanpa soal tidak memunculkan tombol kunci; tombol tidak digandakan */
G(`LKPD_MODULES.push({id:'KOSONG',title:'Kosong',kelas:'X',quiz:[]});LK.module='KOSONG';STAFF=true`);
ok(G('viewLKPD()').indexOf('lk-print-kunci') < 0, 'LKPD tanpa soal: tidak ada tombol Cetak kunci');
if (process.env.LKPD_DUMP) { /* LKPD_DUMP=/tmp/x LKPD_ID=XI-3 menulis /tmp/x-lkpd.html dan /tmp/x-kunci.html untuk dilihat/dirender */
  const m = JSON.parse(JSON.stringify(ALL.find((x) => x.id === (process.env.LKPD_ID || 'X-1')))); if (!m.v2) { const qz = G(`lkqQuizFor(${JSON.stringify(m.id)})`); if (qz && qz.length) m.quiz = qz; }
  const css = STY.map((e) => e.textContent || '').join('').replace(/@media print\{/, '').replace(/\}$/, '');
  const bungkus = (b) => '<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:10mm 12mm 14mm}body{margin:0}' + css + '#lk-print{display:block}</style><div id="lk-print">' + b.replace(/<style>[\s\S]*?<\/style>/, '') + '</div>';
  fs.writeFileSync(process.env.LKPD_DUMP + '-lkpd.html', bungkus(ctx.lkfBangun(m, H({})))); fs.writeFileSync(process.env.LKPD_DUMP + '-kunci.html', bungkus(ctx.lkfKunci(m)));
}
console.log(`\nUji cetak LKPD dan Kunci untuk semua LKPD: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
