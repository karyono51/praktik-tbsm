#!/usr/bin/env node
/* Uji LKPD v2 dan Observasi LKPD Praktik v2 tanpa peramban: memuat berkas asli aplikasi dalam sandbox vm dengan stub DOM minimal.
   node tools/uji-lkpd-v2.mjs
   Yang diuji: hitungan rata-rata/selisih, kelengkapan tabel, gerbang masuk, soal isian angka (koma, toleransi), nilai otomatis,
   render tiap tab dan Detail, verifikasi guru, perilaku LKPD lama tidak berubah, serta hitungan dan simpan Observasi v2. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
let gagal = 0, lulus = 0;
const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const sama = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + ' (dapat ' + JSON.stringify(a) + ', harap ' + JSON.stringify(b) + ')');

const listeners = [];
const el = () => ({ style: {}, dataset: {}, classList: { toggle() {}, contains() { return false } }, appendChild() {}, setAttribute() {}, querySelector() { return null }, querySelectorAll() { return [] }, closest() { return null } });
const ctx = vm.createContext({
  console, Math, JSON, Object, Array, Date, String, Number, isFinite, parseInt, setTimeout, setInterval() {}, clearInterval() {}, localStorage: { getItem() { return null }, setItem() {}, removeItem() {} },
  navigator: { onLine: true }, window: { scrollTo() {} },
  document: { createElement: el, head: el(), body: el(), addEventListener(t, f, c) { listeners.push({ t, f, c }) }, querySelectorAll() { return [] }, getElementById() { return null }, querySelector() { return null } },
});
ctx.window = ctx; ctx.scrollTo = () => {};
const run = (code, name) => vm.runInContext(code, ctx, { filename: name });

/* Stub mesin lama (hanya yang dipakai v2). Fungsi soal meniru perilaku lkpd-soal.js untuk PG. */
run(`
var S={user:{id:'u1',nama:'Budi',kelas:'X'},lkpd:[],observasi:[],users:[],results:[],kkm:75};
var Cloud={on:false};var KELAS={X:{judul:'Kelas X'}};
var toasts=[],renders=0,saved=0;
function toast(m){toasts.push(m)}function render(){renders++}function persist(){saved++}function save(){saved++}function uid(){return 'id'+Math.random().toString(36).slice(2)}
function ymd(){return '2026-11-20'}function schNama(){return 'SMKS Medina'}
var STAFF=false;function isStaff(){return STAFF}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lkEsc(x){return esc(x)}
var LK={module:'LKPD-X-07',tab:'materi',detail:null,editor:null,preview:false};
var DRAFT={};function lkDraft(){return DRAFT}
function lkRowOk(d,i){return !!d['row'+i]&&String(d['actual'+i]||'').trim()!==''}
function lkScore(d){return {practice:-1,theory:-1,final:-1,answered:0,correct:0}}
function lkRead(){return Object.assign({},DRAFT)}
function lkProgress(){return '<span>orig</span>'}
var SUBMITTED=0;function lkSubmit(){SUBMITTED++}
function viewLKPD(){return 'ORIG-VIEW'}
function lkDetailBody(){return 'ORIG-DETAIL'}
function lkqQuizHtml(m,d){return m.quiz.map(function(q,i){return lkqRender(q,i,d)}).join('')}
var LKPD_MODULES=[];
`, 'stub-lkpd');
/* Fungsi soal asli (lkpd-soal.js, sebelum bagian pemasangan) dimuat apa adanya agar PG, kompleks, dan kategori dinilai seperti di aplikasi. */
run(src('lkpd-soal.js').split('/* ---------- Pemasangan ke mesin LKPD ---------- */')[0], 'lkpd-soal-inti.js');
run(src('lkpd-v2-x07.js'), 'lkpd-v2-x07.js');
run(`LKPD_MODULES=JSON.parse(JSON.stringify(LKPD_EXTRA_MODULES));`, 'jalur-modul');
run(src('lkpd-v2.js'), 'lkpd-v2.js');
run(src('lkpd-v2-soal.js'), 'lkpd-v2-soal.js');
const G = (e) => vm.runInContext(e, ctx);

/* ---------- Pemuatan modul ---------- */
const M = G('LKPD_MODULES[0]');
ok(M.id === 'LKPD-X-07' && M.v2 && M.v2.ver === 2, 'modul pilot termuat');
ok(M.status === 'draft' && M.active === false, 'pilot berstatus Draft (tidak terlihat siswa sebelum diterbitkan)');
sama(M.v2.pertemuan.reduce((t, p) => t + p.menit, 0), 810, '6 pertemuan = 810 menit');
sama(M.v2.pertemuan.reduce((t, p) => t + p.jp, 0), 18, '6 pertemuan = 18 JP');
sama(M.v2.langkah.length, M.steps.length, 'langkah v2 sejajar dengan steps lama');
sama(M.v2.langkah.filter((l) => l.saksi).length, 4, '4 langkah saksi guru');
sama(M.v2.obs.aspek.reduce((t, a) => t + a.b, 0), 100, 'bobot 6 aspek = 100');
sama(M.v2.obs.indikator.length, 8, '8 indikator kompeten');
sama(M.fotoWajib.map((i) => M.checks[i][0]), ['Posisi nol jangka sorong', 'Posisi nol mikrometer', 'Bacaan mikrometer pada benda', 'Dial gauge terpasang dengan pratekan', 'Alat di kotak setelah perawatan (5R)'], '5 item foto wajib sesuai usulan');
sama(M.v2.cekK.length, M.checks.length, 'setiap komponen terpetakan ke kegiatan');

/* ---------- Angka dan tabel ---------- */
sama([G("lk2Num('24,35')"), G("lk2Num(' 0.22 ')"), G("lk2Num('-0,02')"), G("lk2Num('')"), G("lk2Num('abc')"), G("lk2Num('1,2,3')")].map((x) => (Number.isNaN(x) ? 'NaN' : x)), [24.35, 0.22, -0.02, 'NaN', 'NaN', 'NaN'], 'lk2Num menerima koma/titik, menolak sampah');
sama([G('lk2Fmt(24.35)'), G('lk2Fmt(0.1+0.2)'), G('lk2Fmt(NaN)'), G('lk2Fmt(7)')], ['24,35', '0,3', '', '7'], 'lk2Fmt');
const d1 = { t_F1_0_u1: '24,00', t_F1_0_u2: '24,05', t_F1_0_u3: '24,10', t_F1_1_u1: '10', t_F1_1_u2: '10', t_F3_0_besar: '0,32', t_F3_0_kecil: '0,10' };
const calc = G(`lk2Calc(LKPD_MODULES[0],${JSON.stringify(d1)})`);
ok(Math.abs(calc.F1[0].rata - 24.05) < 1e-9, 'rata-rata F1 baris 1 = 24,05');
ok(Number.isNaN(calc.F1[1].rata), 'rata-rata kosong bila belum 3 ukuran');
ok(Math.abs(calc.F3[0].olengan - 0.22) < 1e-9, 'keolengan F3 = 0,22');
ok(G(`lk2TabelPct(LKPD_MODULES[0],{})`) === 0, 'tabel kosong = 0%');
const pct = G(`lk2TabelPct(LKPD_MODULES[0],${JSON.stringify(d1)})`);
ok(pct > 0 && pct < 1, 'tabel terisi sebagian = antara 0 dan 1');

/* ---------- Gerbang ---------- */
const GQ = M.v2.gate.qs;
const gKunci = { q100: 1, q101: 3, q102: [0, 2], q103: { 0: true, 1: false, 2: true, 3: false, 4: true }, q104: 2 };
sama(GQ.map((q) => q.t), ['pg', 'pg', 'kompleks', 'kategori', 'pg'], 'gerbang: 5 soal bentuk TKA (PG, PG, kompleks, kategori, PG)');
ok(GQ.every((q) => q.o ? q.o.length === 5 : q.rows.length >= 3 && q.rows.length <= 6), 'gerbang: PG dan kompleks 5 pilihan, kategori 3 sampai 6 pernyataan');
ok(GQ.every((q) => ['Aplikasi', 'Penalaran'].includes(q.lvl)), 'gerbang: semua level HOTS (Aplikasi/Penalaran)');
ok(GQ.every((q) => q.q.length > 90 && q.e), 'gerbang: tiap soal bersetimulus dan berpembahasan');
ok(GQ.filter((q) => q.t === 'pg').every((q) => Number.isInteger(q.a) && q.a < 5) && GQ[2].a.length >= 2, 'gerbang: PG 1 kunci, kompleks minimal 2 kunci');
sama(GQ.filter((q) => q.t === 'pg').map((q) => q.a), [1, 3, 2], 'gerbang: kunci PG tersebar (B, D, C)');
ok(GQ.every((q) => G(`lkqValid(LKPD_MODULES[0].v2.gate.qs[${GQ.indexOf(q)}])`) === true), 'gerbang: lolos lkqValid');
sama(G(`lk2Gate(LKPD_MODULES[0],{}).n`), 0, 'gerbang: kosong = 0 terjawab');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify(gKunci)})`), { n: 5, total: 5, ok: true, benar: 5, auto: true, poin: 5, nilai: 100, kkm: 75, lulus: true }, 'gerbang: semua kunci = 5 terjawab, 5 benar, nilai 100, lulus');
ok(M.v2.gate.min === undefined, 'gerbang: kriteria 4 dari 5 (gate.min) sudah dihapus dari data');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q100: 0 })}).benar`), 4, 'gerbang: satu PG salah = 4 benar');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q102: [0] })}).benar`), 4, 'gerbang: kompleks sebagian = bukan benar penuh');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q102: [0] })}).nilai`), 90, 'gerbang TKA: kompleks 1 dari 2 kunci = poin 0,5 (nilai 90)');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q102: [0, 1, 2] })}).benar`), 4, 'gerbang: kompleks dengan pilihan salah = bukan benar penuh');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q102: [0, 1, 2] })}).nilai`), 90, 'gerbang TKA: kompleks 2 kunci terpilih + 1 pilihan salah = (2-1)/2 = poin 0,5 (nilai 90)');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q103: { 0: true, 1: false, 2: true, 3: true, 4: true } })}).benar`), 4, 'gerbang: kategori satu pernyataan salah = bukan benar penuh');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q103: { 0: true, 1: false, 2: true, 3: true, 4: true } })}).nilai`), 96, 'gerbang TKA: kategori 4 dari 5 pernyataan tepat = poin 0,8 (nilai 96)');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, q103: { 0: true, 1: false } })})`).n, 4, 'gerbang: kategori belum lengkap = belum terjawab');
sama(G(`lk2Gate(LKPD_MODULES[0],{q100:1,q101:3})`).ok, false, 'gerbang: 2 dari 5 terjawab = belum semua terjawab');
sama(G(`lk2Gate(LKPD_MODULES[0],{q100:1,q101:3})`).lulus, false, 'gerbang: 2 dari 5 terjawab (nilai 40) = terkunci');
/* skenario nilai gerbang dengan acuan TKA dan KKM 75 */
const gN = (o) => G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ ...gKunci, ...o })})`);
const kat4 = { 0: true, 1: false, 2: true, 3: true, 4: true }, kat3 = { 0: true, 1: false, 2: true, 3: true, 4: false };
sama([gN({ q102: [1], q103: kat4 }).nilai, gN({ q102: [1], q103: kat4 }).lulus], [76, true], 'skenario: PG benar semua, kompleks 0, kategori 4/5 = 76 lulus (aturan lama 4 dari 5 menggagalkan)');
sama([gN({ q102: [0], q103: kat3 }).nilai, gN({ q102: [0], q103: kat3 }).lulus], [82, true], 'skenario: PG benar semua, kompleks 1/2, kategori 3/5 = 82 lulus');
sama([gN({ q102: [1], q103: kat3 }).nilai, gN({ q102: [1], q103: kat3 }).lulus], [72, false], 'skenario: PG benar semua, kompleks 0, kategori 3/5 = 72 belum lulus');
sama([gN({ q101: 0, q103: kat4 }).nilai, gN({ q101: 0, q103: kat4 }).lulus], [76, true], 'skenario: 1 PG salah, kompleks penuh, kategori 4/5 = 76 lulus');
sama([gN({ q101: 0, q102: [0], q103: gKunci.q103 }).nilai, gN({ q101: 0, q102: [0], q103: gKunci.q103 }).lulus], [70, false], 'skenario: 1 PG salah, kompleks 1/2, kategori penuh = 70 belum lulus');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ q100: 1, q101: 3, q102: [0, 2], q103: gKunci.q103 })})`).nilai, 80, 'soal belum dijawab bernilai 0 (4 soal benar = 80)');
sama(G(`lk2Gate(LKPD_MODULES[0],${JSON.stringify({ q100: 1, q101: 3, q102: [0, 2], q103: gKunci.q103 })})`).lulus, true, 'nilai 80 meski satu soal belum dijawab = lulus (acuan TKA)');
/* KKM gerbang tidak pernah di bawah 75 */
G(`S.kkm=60`); sama(G(`lk2KkmGerbang()`), 75, 'KKM gerbang: S.kkm 60 tetap 75');
G(`S.kkm=80`); sama(G(`lk2KkmGerbang()`), 80, 'KKM gerbang: S.kkm 80 dipakai');
sama(gN({ q102: [1], q103: kat4 }).lulus, false, 'KKM 80: nilai 76 belum lulus');
G(`S.kkm=75`);
sama(G(`lk2Gate(LKPD_MODULES[0],{q0:1,q1:3,q2:1,q3:1,q4:1}).n`), 0, 'gerbang: jawaban soal F4 (q0-q7) tidak bercampur dengan gerbang');
/* soal gerbang lama (isian teks) tetap didukung */
run(`var _lamaM={v2:{gate:{min:1,qs:[{q:'x',kunci:'y'},{q:'z',kunci:'w'}]}}};`, 'gerbang-lama');
sama(G(`lk2Gate(_lamaM,{gate0:'Diameter dalam',gate1:'ab'}).n`), 1, 'gerbang lama: jawaban <3 huruf tidak dihitung');
sama(G(`lk2Gate(_lamaM,{gate0:'Diameter dalam',gate1:'abc'}).lulus`), true, 'gerbang lama (isian teks): lulus bila semua terjawab');
sama(G(`lk2Gate(_lamaM,{gate0:'Diameter dalam',gate1:'ab'}).lulus`), false, 'gerbang lama: belum semua terjawab = terkunci');

/* ---------- Soal isian ---------- */
const Q = (id) => M.quiz.find((q) => q.id === id);
const pt = (id, a) => G(`lkqPoint(LKPD_MODULES[0].quiz[${M.quiz.indexOf(Q(id))}],${JSON.stringify(a)})`);
sama([pt('J1', '24,35'), pt('J1', '24.35'), pt('J1', ' 24,35 '), pt('J1', '24,36'), pt('J1', '24,3'), pt('J1', ''), pt('J1', 'x'), pt('D2', '0,22'), pt('D2', '0,2')], [1, 1, 1, 0, 0, 0, 0, 1, 0], 'isian: koma/titik benar, toleransi 0,005, salah/kosong = 0');
sama(M.quiz.map((q) => q.kunci), [24.35, 31.28, 12.45, 45.55, 7.78, 12.35, 5.63, 9.41, 2.45, 0.22], 'kunci F4 sama dengan versi guru');
ok(G(`lkqAnswered(LKPD_MODULES[0].quiz[0],'1')`) === true && G(`lkqAnswered(LKPD_MODULES[0].quiz[0],' ')`) === false, 'isian terjawab bila tidak kosong');
ok(G(`lkqValid(LKPD_MODULES[0].quiz[0])`) === true, 'isian valid');
ok(G(`lkqType({t:'isian'})`) === 'isian' && G(`lkqType({q:'x',o:['a','b'],a:0})`) === 'pg', 'tipe lama tetap dikenali');
sama(G(`lkqPoint({q:'x',o:['a','b'],a:1},1)`), 1, 'PG lama tetap dinilai fungsi asli');
ok(/Benar/.test(G(`lkqVerdict(LKPD_MODULES[0].quiz[0],'24,35')[1]`)) && /Salah/.test(G(`lkqVerdict(LKPD_MODULES[0].quiz[0],'1')[1]`)), 'verdict isian');
ok(/Jawaban J1|data-lk-field="q0"/.test(G(`lkqRender(LKPD_MODULES[0].quiz[0],0,{})`)), 'render isian memakai data-lk-field q<i>');

/* ---------- Nilai otomatis ---------- */
const penuh = {};
M.steps.forEach((s, i) => (penuh['step' + i] = true));
M.safety.forEach((s, i) => (penuh['safe' + i] = true));
M.checks.forEach((c, i) => { penuh['row' + i] = true; penuh['actual' + i] = '1'; });
Object.assign(penuh, gKunci);
M.v2.analisis.forEach((q, i) => (penuh['ana' + i] = 'analisis yang cukup panjang'));
M.v2.tabel.forEach((t) => t.baris.forEach((b, r) => t.kol.forEach((k) => { if (k.t !== 'rata' && k.t !== 'selisih') penuh[`t_${t.id}_${r}_${k.k}`] = k.t === 'status' ? 'Sesuai' : '1'; })));
M.quiz.forEach((q, i) => (penuh['q' + i] = String(q.kunci).replace('.', ',')));
let sc = G(`lkScore(${JSON.stringify(penuh)})`);
sama([sc.practice, sc.theory, sc.final, sc.answered], [100, 100, 100, 10], 'semua terisi benar = 100');
const kosong = G(`lkScore({})`);
sama([kosong.practice, kosong.theory, kosong.final], [0, 0, 0], 'kosong = 0');
const sebagian = Object.assign({}, penuh); M.quiz.slice(0, 5).forEach((q, i) => (sebagian['q' + i] = '99'));
sama(G(`lkScore(${JSON.stringify(sebagian)})`).theory, 50, '5 dari 10 benar = teori 50');

/* ---------- Render ---------- */
G(`LKPD_MODULES[0].status='published';LKPD_MODULES[0].active=true`);
['materi', 'kerja', 'evaluasi'].forEach((tab) => {
  G(`LK.tab='${tab}';DRAFT={}`);
  const h = G('viewLKPD()');
  ok(h.indexOf('<div class="chips">') > -1 && h.indexOf('<div class="lk-actions">') > -1, `tab ${tab}: penanda chips dan lk-actions ada (dipakai pembungkus banner/timer)`);
  ok(h.indexOf('LKPD-X-07') > -1, `tab ${tab}: render v2 (bukan tampilan lama)`);
});
G(`LK.tab='kerja';DRAFT={}`);
ok(/Lembar Kerja terkunci/.test(G('viewLKPD()')), 'Lembar Kerja terkunci sebelum gerbang selesai (siswa)');
G(`DRAFT=${JSON.stringify(penuh)};LK.tab='kerja'`);
const kerja = G('viewLKPD()');
ok(!/Lembar Kerja terkunci/.test(kerja) && /data-lk-field="t_F1_0_u1"/.test(kerja) && /data-lk-check="step2"/.test(kerja) && /saksi guru/.test(kerja), 'Lembar Kerja terbuka dengan tabel, langkah, dan penanda saksi');
ok(/data-lk2-calc="F1\|0\|rata"/.test(kerja) && /data-lk2-calc="F3\|0\|olengan"/.test(kerja), 'sel rata-rata/keolengan berupa teks hitung otomatis');
ok(/Kegiatan 1 jangka Sorong/.test(kerja) && /Kegiatan 2 mikrometer/.test(kerja) && /Kegiatan 3 dial gauge/.test(kerja) && /Kegiatan 4 perawatan/.test(kerja), 'Lembar Kerja: empat kartu berjudul kegiatan');
ok((kerja.match(/class="card lk2-p"/g) || []).length === 4 && !/<h2>Pertemuan \d/.test(kerja) && !/data-lk-field="mt1"/.test(kerja) && !/data-lk-field="mt6"/.test(kerja), 'Lembar Kerja: kartu Pertemuan 1 dan 6 tidak tampil, tersisa 4 kartu');
ok((kerja.match(/Target 20 menit/g) || []).length === 4 && !/Target 135 menit/.test(kerja), 'Lembar Kerja: target praktik 20 menit tiap kartu');
G(`STAFF=true;LK.preview=false;DRAFT={}`);
ok(!/Lembar Kerja terkunci/.test(G('viewLKPD()')), 'guru melihat Lembar Kerja tanpa gerbang');
G(`STAFF=false;LK.tab='materi'`);
ok(G('viewLKPD()').indexOf('LKPD-X-07') > -1, 'siswa melihat modul bila terbit');
G(`LKPD_MODULES[0].status='draft';LKPD_MODULES[0].active=false`);
ok(G('viewLKPD()') === 'ORIG-VIEW', 'siswa tidak melihat modul Draft (jatuh ke tampilan lama)');
G(`LKPD_MODULES[0].status='published';LKPD_MODULES[0].active=true`);
G(`LKPD_MODULES.push({id:'X-1',v2:undefined,status:'published',active:true});LK.module='X-1';LK.tab='materi'`);
ok(G('viewLKPD()') === 'ORIG-VIEW', 'LKPD lama (tanpa v2) tetap lewat tampilan lama');
sama(G(`lkScore({})`).practice, -1, 'LKPD lama tetap memakai penilaian lama');
G(`LK.module='LKPD-X-07'`);
G(`LK.detail={id:'z'};LK.tab='materi'`);
ok(G('viewLKPD()') === 'ORIG-VIEW', 'tampilan detail/riwayat tetap lewat jalur lama');
G(`LK.detail=null`);

/* ---------- Submit dan payload ---------- */
G(`SUBMITTED=0;DRAFT={};LK.tab='kerja'`);
G('lkSubmit()');
sama(G('SUBMITTED'), 0, 'kirim ditolak bila gerbang belum selesai');
ok(G('toasts').some((t) => /gerbang/i.test(t)), 'pesan gerbang ditampilkan');
G(`DRAFT=${JSON.stringify(penuh)}`);
G('lkSubmit()');
sama(G('SUBMITTED'), 1, 'kirim lanjut bila gerbang lulus');
/* gerbang terjawab semua tetapi nilai di bawah KKM = kirim ditolak */
G(`SUBMITTED=0;toasts.length=0;DRAFT=${JSON.stringify({ ...penuh, q100: 0, q101: 0 })}`);
G('lkSubmit()');
sama(G('SUBMITTED'), 0, 'kirim ditolak bila nilai gerbang 60 (< KKM 75) walau semua soal terjawab');
ok(G('toasts').some((t) => /KKM 75/.test(t)), 'pesan menyebut KKM 75');
G(`SUBMITTED=0;DRAFT=${JSON.stringify(penuh)}`);
G('lkSubmit()');
const rd = G('lkRead()');
ok(rd.v2 && rd.v2.ver === 2 && rd.v2.gate === 5 && rd.v2.gerbang && rd.v2.gerbang.nilai === 100 && rd.v2.gerbang.lulus === true && rd.v2.gerbang.kkm === 75 && rd.v2.tabel === 100 && Math.abs(rd.v2.calc.F1[0].rata - 1) < 1e-9, 'payload memuat v2.calc, gerbang, dan kelengkapan tabel');

/* ---------- Detail dan verifikasi guru ---------- */
const payload = Object.assign({}, penuh, rd, { student: 'Budi', school: 'SMKS Medina' });
G(`STAFF=true`);
const det = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(payload)})`);
ok(/Gerbang masuk/.test(det) && !/data-lk2v="g0"/.test(det) && /data-lk2v="s2"/.test(det) && /data-lk2v="a0"/.test(det) && /lk2-verif/.test(det), 'Detail guru memuat verifikasi saksi dan APD (gerbang dinilai otomatis, tanpa kotak Jawaban benar)');
ok(/Kunci: B\. rahang bawah, rahang atas, batang kedalaman/.test(det) && /Kunci: C\. dan |Kunci: A\./.test(det), 'kunci gerbang PG tampil untuk guru');
ok(/Penalaran/.test(det) && /Aplikasi/.test(det), 'Detail guru menampilkan level soal gerbang');
const detAuto = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(Object.assign({}, payload, { v2: { ver: 2 } }))})`);
ok(/Nilai gerbang \(acuan TKA\): <b>100<\/b> dari 100 · poin 5 dari 5 · KKM 75: <b>lulus/.test(detAuto) && /Poin: 1 dari 1/.test(detAuto), 'Detail menampilkan nilai gerbang otomatis 100 dan poin tiap soal');
const detSalah = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(Object.assign({}, payload, { q100: 0, q104: 0, v2: { ver: 2 } }))})`);
ok(/Nilai gerbang \(acuan TKA\): <b>60<\/b>[^<]*KKM 75: <b>belum lulus/.test(detSalah), '3 dari 5 benar = nilai 60 belum lulus');
G(`STAFF=false`);
const detS = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(Object.assign({}, payload, { v2: Object.assign({}, rd.v2, { verif: { g: { 0: 1, 1: 1, 2: 1, 3: 1 }, s: { 2: 1 }, a: {}, ts: 1, by: 'Guru' } }) }))})`);
ok(!/data-lk2v/.test(detS) && !/Kunci: B\./.test(detS), 'siswa tidak melihat kunci dan kotak verifikasi');
ok(/Nilai gerbang \(acuan TKA\): <b>100<\/b>[^<]*KKM 75: <b>lulus/.test(detS), 'siswa melihat nilai gerbang otomatis (lulus)');

/* ---------- Praktik terverifikasi guru dan pembukaan Evaluasi ---------- */
run(`function uiOk(){return true}`, 'stub-uiok-evaluasi');
const saksiIdx = M.v2.langkah.filter((l) => l.saksi).map((l) => l.i), apdIdx = M.v2.apd || [];
const sA = Object.fromEntries(saksiIdx.map((i) => [i, 1])), aA = Object.fromEntries(apdIdx.map((i) => [i, 1]));
const PV = (p, vf) => G(`lk2PraktikV(LKPD_MODULES[0],${JSON.stringify(p)},${JSON.stringify(vf)})`);
sama(PV(penuh, { s: sA, a: aA, n: 100 }).praktik, 100, 'praktik terverifikasi: semua lengkap, disaksikan, APD berparaf, analisis 100 = 100');
const tanpaGuru = Math.round((M.steps.length - saksiIdx.length) / M.steps.length * 30 + (M.safety.length - apdIdx.length) / M.safety.length * 20 + 25);
sama(PV(penuh, {}).praktik, tanpaGuru, 'tanpa verifikasi guru: langkah saksi, APD, dan analisis tidak dihitung');
ok(PV(penuh, {}).praktik < 75, 'centang semua + analisis asal tanpa guru TIDAK mencapai KKM 75 (sebelumnya 75)');
sama([PV(penuh, { s: sA, a: aA, n: 0 }).praktik, PV(penuh, { s: sA, a: aA, n: 0 }).lulus], [75, true], 'analisis 0 tetapi semua lain lengkap dan terverifikasi = tepat 75 = lulus');
sama(PV(penuh, { s: sA, a: aA, n: 60 }).praktik, 90, 'nilai analisis guru 60 = 15 poin (praktik 90)');
sama(PV(penuh, { s: sA, a: aA }).ana, null, 'nilai analisis belum diisi guru = belum dinilai (0 poin)');
sama(PV({}, { s: sA, a: aA, n: 100 }).praktik, 25, 'tanpa isian siswa, analisis guru 100 hanya 25 poin');
G(`S.kkm=80`); sama(PV(penuh, { s: sA, a: aA, n: 0 }).lulus, false, 'KKM 80: praktik 75 belum lulus'); G(`S.kkm=60`); sama(G('lk2KkmEvaluasi()'), 75, 'KKM evaluasi tidak pernah di bawah 75'); G(`S.kkm=75`);

/* status siswa dan pembukaan Evaluasi */
const kiriman = (vf, extra = {}, sid = 'u1') => ({ id: 'r' + Math.random(), moduleId: 'LKPD-X-07', sid, payload: JSON.stringify({ v2: Object.assign({ ver: 2 }, vf ? { verif: vf } : {}, extra) }) });
const lkpdAsli = G('S.lkpd');
const ST = (list) => { G(`S.lkpd=${JSON.stringify(list)}`); return G('lk2Status(LKPD_MODULES[0])'); };
sama(ST([]), { ada: false, verif: false, praktik: null, lulus: false, kkm: 75 }, 'status: belum kirim');
sama(ST([kiriman(null)]).lulus || ST([kiriman(null)]).verif, false, 'status: sudah kirim tetapi belum diverifikasi = tertutup');
sama([ST([kiriman({ ts: 1, praktik: 70 })]).verif, ST([kiriman({ ts: 1, praktik: 70 })]).lulus], [true, false], 'status: praktik terverifikasi 70 < 75 = tertutup');
sama([ST([kiriman({ ts: 1, praktik: 70 }), kiriman({ ts: 2, praktik: 80 })]).praktik, ST([kiriman({ ts: 1, praktik: 70 }), kiriman({ ts: 2, praktik: 80 })]).lulus], [80, true], 'status: ambil nilai praktik terverifikasi tertinggi; 80 = terbuka');
sama(ST([kiriman({ ts: 1, praktik: 75 })]).lulus, true, 'status: tepat 75 = terbuka');
sama(ST([kiriman({ ts: 1, praktik: 90 }, {}, 'u2')]).lulus, false, 'status: nilai siswa lain tidak berlaku');
sama(ST([kiriman({ ts: 1, praktik: 90 }, { evaluasi: 1 })]).ada, false, 'status: kiriman Evaluasi tidak dihitung sebagai pengumpulan praktik');
sama(ST([kiriman({ ts: 1, g: { 0: 1 } })]).verif, false, 'status: verifikasi lama tanpa nilai praktik belum dianggap lulus (verifikasi ulang)');
G(`S.kkm=80`); sama(ST([kiriman({ ts: 1, praktik: 78 })]).lulus, false, 'status: KKM 80, praktik 78 tertutup'); G(`S.kkm=75`);

/* tab Evaluasi: terkunci / terbuka */
const viewEval = (list, staff = false) => { G(`S.lkpd=${JSON.stringify(list)};STAFF=${staff};LK.module='LKPD-X-07';LK.tab='evaluasi';LK.preview=false;DRAFT={}`); return G('viewLKPD()'); };
let hv = viewEval([]);
ok(/Evaluasi terkunci/.test(hv) && /Kirim Lembar Kerja/.test(hv) && !/data-lk-field="q0"/.test(hv) && /data-act="lk-submit"/.test(hv) && !/lk2-eval-kirim/.test(hv), 'siswa belum kirim: soal Evaluasi terkunci, tombol Kirim LKPD');
hv = viewEval([kiriman(null)]);
ok(/Menunggu verifikasi/.test(hv) && !/data-lk-field="q0"/.test(hv), 'siswa sudah kirim: menunggu verifikasi guru');
hv = viewEval([kiriman({ ts: 1, praktik: 70 })]);
ok(/belum mencapai KKM 75/.test(hv) && /terverifikasimu 70/.test(hv) && !/data-lk-field="q0"/.test(hv), 'praktik terverifikasi 70: pesan belum mencapai KKM');
hv = viewEval([kiriman({ ts: 1, praktik: 80 })]);
ok(/Latihan membaca skala/.test(hv) && /data-lk-field="q0"/.test(hv) && /lk2-eval-kirim/.test(hv) && /Kirim Evaluasi/.test(hv) && !/Evaluasi terkunci/.test(hv), 'praktik terverifikasi 80: soal Evaluasi terbuka, tombol Kirim Evaluasi');
hv = viewEval([], true);
ok(/data-lk-field="q0"/.test(hv) && !/Evaluasi terkunci/.test(hv) && !/lk2-eval-kirim/.test(hv), 'guru melihat soal Evaluasi tanpa terkunci');
G(`STAFF=false;LK.tab='kerja'`); G(`S.lkpd=${JSON.stringify([kiriman({ ts: 1, praktik: 80 })])}`);
ok(!/lk2-eval-kirim/.test(G('viewLKPD()')), 'tombol Kirim Evaluasi hanya di tab Evaluasi');
ok(/Penilaian kinerja oleh guru/.test(viewEval([])), 'rubrik penilaian kinerja tetap terbaca meski soal Evaluasi terkunci');

/* Kirim Evaluasi */
const jawabBenar = (n) => { const d = {}; M.quiz.forEach((q, i) => { if (i < n) d['q' + i] = String(q.kunci).replace('.', ','); }); return d; };
G(`S.lkpd=${JSON.stringify([kiriman({ ts: 1, praktik: 80 })])};S.results=[];STAFF=false;LK.module='LKPD-X-07';LK.tab='evaluasi';LK.preview=false;DRAFT=${JSON.stringify(jawabBenar(M.quiz.length))};toasts.length=0`);
G('lk2KirimEvaluasi()');
let lastRec = G('S.lkpd[S.lkpd.length-1]'), pe = JSON.parse(lastRec.payload);
sama([G('S.lkpd.length'), lastRec.practice, lastRec.theory, lastRec.score, pe.v2.evaluasi, pe.v2.praktik], [2, 80, 100, 83, 1, 80], 'Kirim Evaluasi: praktik 80 + teori 100 = nilai 83 (80 x 85% + 100 x 15%)');
sama([G('S.results.length'), G('S.results[0].tipe'), G('S.results[0].score')], [1, 'LKPD', 83], 'Kirim Evaluasi: tercatat di hasil dengan nilai akhir');
ok(pe.q0 === String(M.quiz[0].kunci).replace('.', ',') && pe.student === 'Budi', 'Kirim Evaluasi: jawaban latihan tersimpan di payload');
G(`DRAFT=${JSON.stringify(jawabBenar(5))}`); G('lk2KirimEvaluasi()');
lastRec = G('S.lkpd[S.lkpd.length-1]');
sama([lastRec.theory, lastRec.score], [50, 76], 'Kirim Evaluasi: 5 dari 10 benar = teori 50, nilai 76');
G(`S.lkpd=[];S.results=[];toasts.length=0`); G('lk2KirimEvaluasi()');
sama([G('S.lkpd.length'), G('toasts').some((t) => /Evaluasi belum terbuka/.test(t))], [0, true], 'Kirim Evaluasi ditolak bila praktik belum terverifikasi lulus');
G(`S.lkpd=${JSON.stringify([kiriman({ ts: 1, praktik: 80 })])};STAFF=true`); G('lk2KirimEvaluasi()');
sama(G('S.lkpd.length'), 1, 'guru tidak mengirim Evaluasi'); G('STAFF=false');

/* Detail guru: nilai analisis dan nilai praktik terverifikasi */
G('STAFF=true');
const detP = (vf) => G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(Object.assign({}, penuh, { v2: { ver: 2, verif: vf } }))})`);
let dp = detP({});
ok(/id="lk2-ana-n"/.test(dp) && /data-act="lk2-verif">Simpan verifikasi guru/.test(dp) && /Belum diverifikasi/.test(dp), 'Detail guru: kolom nilai analisis, tombol simpan, dan status belum diverifikasi');
dp = detP({ ts: 1, by: 'Guru', s: sA, a: aA, n: 60, praktik: 90, lulus: true });
ok(/value="60"/.test(dp) && /Nilai praktik terverifikasi: <b class="mono">90<\/b> · KKM 75: <b>lulus, Evaluasi terbuka/.test(dp), 'Detail guru: nilai praktik terverifikasi 90 dan Evaluasi terbuka');
dp = detP({ ts: 1, by: 'Guru', s: {}, a: {}, n: 0 });
ok(/belum lulus, Evaluasi belum terbuka/.test(dp), 'Detail guru: tanpa saksi dan APD berparaf = belum lulus');
G('STAFF=false');
dp = detP({ ts: 1, by: 'Guru', s: sA, a: aA, n: 60, praktik: 90, lulus: true });
ok(!/id="lk2-ana-n"/.test(dp) && !/data-act="lk2-verif"/.test(dp) && /Nilai analisis: <b>60<\/b>/.test(dp), 'Detail siswa: nilai analisis hanya terbaca, tanpa kolom isian dan tombol simpan');
const evRec = { student: 'Budi', 'class': 'X', date: '2026-11-22', v2: { ver: 2, evaluasi: 1, praktik: 80 }, q0: '24,35' };
ok(/Evaluasi \(latihan membaca skala\)/.test(G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(evRec)})`)) && !/Gerbang masuk/.test(G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(evRec)})`)), 'Detail kiriman Evaluasi menampilkan jawaban latihan (bukan lembar kerja)');
G(`S.lkpd=${JSON.stringify(lkpdAsli)};S.results=[];STAFF=false;LK.tab='materi'`);

/* ---------- Observasi v2 (memakai observasi.js asli) ---------- */
run(`
var ICO={};function $(s){return document.querySelector(s)}function $$(s,r){return []}
function can(){return true}function hasRole(){return true}function schAkunOk(){return true}
function uiOk(){return true}async function uiConfirm(){return true}function svg(){return ''}
KELAS.XI={judul:'Kelas XI'};
S.users=[{id:'s1',nama:'Siti Aminah',kelas:'X',aktif:true,roles:['siswa']},{id:'s2',nama:'Deni',kelas:'X',aktif:true,roles:['siswa']}];
S.user={id:'g1',nama:'Pak Guru',kelas:'',username:'guru'};S.tab='observasi-siswa';
`, 'stub-obs');
run(src('observasi.js'), 'observasi.js');
run(src('observasi-v2.js'), 'observasi-v2.js');
const O = M.v2.obs;
const hit = (nl) => G(`ob2Hitung(${JSON.stringify(nl)},LKPD_MODULES[0].v2.obs)`);
const semua4 = { k3: 4, prosedur: 4, hasil: 4, waktu: 4, '5r': 4, sikap: 4 }; for (let i = 0; i < 8; i++) semua4['i' + i] = 1;
/* Format baru (sama dengan Observasi UKK): tiap aspek dan tiap indikator berskala 1-4 (l_<id>) ditambah nilai bulat dalam rentang skala (91-100 untuk skala 4). */
const nb = (l, v, ov) => { const o = { _fi: 2 }; O.aspek.forEach((a) => { o['l_' + a.id] = l; o[a.id] = v }); O.indikator.forEach((x, i) => { o['l_i' + i] = l; o['i' + i] = v }); return Object.assign(o, ov || {}) };
let h = hit(semua4);
sama([h.nilai, h.kompeten, h.stop, h.lengkap], [100, true, false, true], 'semua skor 4 + 8 indikator = 100, kompeten');
h = hit(Object.assign({}, semua4, { k3: 3, prosedur: 3, hasil: 3, waktu: 3, '5r': 3, sikap: 3 }));
sama(h.nilai, 75, 'semua skor 3 = 75');
h = hit({ k3: 4, prosedur: 3, hasil: 2, waktu: 1, '5r': 4, sikap: 3 });
sama(h.nilai, Math.round(20 + 22.5 + 12.5 + 2.5 + 5 + 7.5), 'campuran skor dihitung jumlah(skor/4 x bobot)');
h = hit(Object.assign({}, semua4, { k3: 1 }));
ok(h.stop === true && h.kompeten === false && h.nilai === 85, 'K3 = 1: praktik dihentikan, tidak kompeten, nilai tetap dihitung');
h = hit(Object.assign({}, semua4, { i3: 0 }));
ok(h.kompeten === false && h.kom === 7, 'satu indikator belum = belum kompeten');
h = hit({ k3: 4 });
ok(h.lengkap === false && h.kompeten === false && h.done === 1, 'aspek belum lengkap = belum bisa disimpan/kompeten');
sama([G(`ob2Kat({stop:true,nilai:90})`), G(`ob2Kat({stop:false,nilai:100})`), G(`ob2Kat({stop:false,nilai:60})`)], ['Kurang', 'Sangat Baik', 'Cukup'], 'kategori v2 memakai kategori lama; K3=1 selalu Kurang');

G(`OB.tipe='siswa';OB.d=obsBaru('siswa');OB.d.pilih=['s1','s2'];OB.d.man=[];OB.mode='form'`);
let html = G('obsStuHtml(OB.d)');
const atas = G('obsFormSiswa()');
ok(!/ob2-on/.test(html) && !/ob2-off/.test(html) && /ob2-rate/.test(html) && !/data-ob2mod/.test(html), 'observasi baru langsung memakai formulir v2; pemilih LKPD tidak lagi di blok penilaian');
ok(/LKPD yang diobservasi/.test(atas) && /data-ob2mod/.test(atas) && /type="hidden" data-ob="mapel"/.test(atas) && !/Unit \/ pekerjaan praktik<input/.test(atas), 'pemilih LKPD v2 di atas formulir menggantikan kolom unit');
G(`OB.d.kelas='XII'`);
ok(/id="ob2kelas"[^>]*>LKPD ini untuk Kelas X, sedangkan daftar siswa yang dipilih Kelas XII/.test(G('obsFormSiswa()')) && G(`ob2KelasCatatan(ob2Mod('LKPD-X-07'),'X')`) === '', 'peringatan bila kelas siswa berbeda dari kelas LKPD, kosong bila sama');
G(`OB.d.kelas='X'`);
ok(/data-ob="materi" maxlength="200" value="LKPD-X-07"/.test(atas) && /<option value="X" selected>Kelas X/.test(atas), 'jobsheet terisi otomatis kode LKPD dan kelas mengikuti LKPD');
G(`document.dispatchLike=function(){}`);
// pilih v2 lewat state langsung (jalur klik bergantung DOM)
G(`OB.d.v2='LKPD-X-07';OB.d.per={};OB.d.nilai={};OB.d.cat={};OB.d.cur='';obsEnsure(OB.d)`);
html = G('obsStuHtml(OB.d)');
ok(/Yang diamati dan kesalahan umum/.test(html) && (html.match(/data-act="ob2-rate"/g) || []).length === (6 + 8) * 4 && (html.match(/class="obu-nil ob2-nil"/g) || []).length === 14 && !/data-ob2i=/.test(html) && /<span id="ob2prog2">0<\/span> \/ 14 terisi/.test(html), 'formulir v2: panduan, 6 aspek + 8 indikator masing-masing skala 1-4 + kolom nilai, bar 0 / 14 terisi');
ok(!/Pakai formulir lama/.test(html), 'formulir v2 tidak lagi menawarkan kembali ke formulir lama');
// simpan tanpa lengkap
G(`OB.d.mapel='';OB.d.tanggal='2026-11-20';OB.d.kelas='X';OB.d.jenis='Bengkel sekolah';toasts.length=0;S.observasi=[];obsSaveSiswa()`);
ok(G('toasts').some((t) => /Lengkapi skor 6 aspek/.test(t)) && G('S.observasi.length') === 0, 'simpan ditolak bila aspek belum lengkap');
// lengkapi dua siswa
G(`OB.d.nilai=${JSON.stringify(nb(4, 100))};obsFlush(OB.d);obsLoad(OB.d,'s2');OB.d.nilai=${JSON.stringify(nb(4, 100, { l_k3: 1, k3: 50 }))};obsFlush(OB.d);obsSaveSiswa()`);
const rec = G('S.observasi');
sama(rec.length, 2, 'dua siswa tersimpan sebagai dua catatan');
const p1 = JSON.parse(rec[0].payload), p2 = JSON.parse(rec[1].payload);
ok(p1.v === 2 && p1.mod === 'LKPD-X-07' && rec[0].skor === 100 && p1.hasil.kompeten === true && rec[0].tipe === 'siswa' && rec[0].mapel === M.title, 'catatan v2: penanda versi, modul, skor, kompeten, mapel otomatis dari judul modul');
ok(p2.hasil.stop === true && p2.hasil.kompeten === false && rec[1].kategori === 'Belum Kompeten', 'siswa dengan K3 skala 1 tersimpan sebagai dihentikan/tidak kompeten (Belum Kompeten)');
// detail
G(`OB.view=S.observasi[0];OB.mode='view'`);
const dv = G('viewObservasi()');
ok(/Detail observasi v2/.test(dv) && /Kompeten/.test(dv) && /Tercapai/.test(dv), 'Detail v2 tampil');
G(`OB.view=S.observasi[1]`);
ok(/Praktik dihentikan \(K3\)/.test(G('viewObservasi()')), 'Detail v2 menandai praktik dihentikan');
// catatan lama tetap lewat detail lama
G(`S.observasi.push({id:'lama',tipe:'siswa',guru:'Lama',mapel:'X',kelas:'X',tanggal:'2026-11-01',skor:80,kategori:'Baik',pengamat:'G',payload:JSON.stringify({nilai:{o1:4},cat:{}})});OB.view=S.observasi[2]`);
ok(!/Detail observasi v2/.test(G('viewObservasi()')) && /Detail observasi/.test(G('viewObservasi()')), 'catatan formulir lama tetap memakai detail lama');
// ubah catatan v2 membawa d.v2
const dd = G(`obsDraftDari(S.observasi[0])`);
ok(dd.v2 === 'LKPD-X-07' && dd.nilai.l_k3 === 4 && dd.nilai.k3 === 100 && dd.nilai._fi === 2, 'Ubah catatan v2 memulihkan modul, skala, dan nilai tiap aspek');
// PDF v2: jsPDF palsu merekam isi
run(`
var __pdf={rows:[],texts:[],saved:'',heads:[]};
window.jspdf={jsPDF:function(){var d={internal:{pageSize:{getHeight:function(){return 297}}},lastAutoTable:{finalY:60},
 autoTable:function(o){__pdf.heads.push(o.head?o.head[0].join('|'):'');(o.body||[]).forEach(function(r){__pdf.rows.push(r.join('|'))});d.lastAutoTable={finalY:d.lastAutoTable.finalY+20}},
 setFontSize:function(){return d},setTextColor:function(){return d},setFont:function(){return d},text:function(t){__pdf.texts.push(String(t));return d},
 splitTextToSize:function(t){return [String(t)]},addPage:function(){},save:function(n){__pdf.saved=n}};return d}};
window.jspdf.jsPDF.API={autoTable:function(){}};
function needP(){return true}function needX(){return true}function kop(){}function ttd(){}function foot(){}var TH={};function slug(x){return String(x).toLowerCase().replace(/[^a-z0-9]+/g,'.')}
function schObsList(l){return l}var __book=null;function book(pairs,name){__book={pairs:pairs,name:name}}
`, 'stub-pdf-xls');
G(`toasts.length=0;obsPdf(S.observasi[0].id)`);
const pdf = G('__pdf');
ok(/^Observasi_praktik_v2_/.test(pdf.saved) && pdf.heads.some((x) => /Aspek\|Bobot\|Skor/.test(x)) && pdf.rows.some((x) => /Persiapan dan K3/.test(x)) && pdf.texts.some((x) => /Keputusan: Kompeten/.test(x)), 'PDF Observasi v2: nama berkas, tabel aspek, indikator, dan keputusan');
ok(pdf.rows.filter((x) => /Tercapai/.test(x)).length === 8, 'PDF Observasi v2 memuat 8 indikator tercapai');
G(`__pdf.saved='';__pdf.rows.length=0;obsPdf(S.observasi[1].id)`);
ok(G('__pdf').texts.some((x) => /Praktik dihentikan \(K3\)/.test(x)), 'PDF siswa K3 = 1 menandai praktik dihentikan');
G(`__pdf.saved='';obsPdf(S.observasi[2].id)`);
ok(/^Observasi_praktik_/.test(G('__pdf.saved')) && !/_v2_/.test(G('__pdf.saved')), 'PDF catatan lama tetap lewat jalur lama (bukan jalur v2)', G('__pdf.saved'));

// Excel: lembar lama tanpa catatan v2, lembar v2 terpisah dengan kolom aspek
G(`OB.tipe='siswa';__book=null;obsXls()`);
const bk = G('__book');
ok(bk && bk.pairs.length === 2 && bk.pairs[1][0] === 'Obs v2 LKPD-X-07', 'Excel: satu lembar lama + satu lembar v2 per LKPD', JSON.stringify(bk && bk.pairs.map((x) => x[0])));
ok(bk.pairs[0][1].length === 2, 'Excel: lembar lama hanya memuat catatan formulir lama (tanpa baris v2)');
ok(bk.pairs[1][1].length === 3 && bk.pairs[1][1][0].length === 7 + 6 + 8 && bk.pairs[1][1][1][bk.pairs[1][1][0].indexOf('Nilai')] === 100, 'Excel v2: 2 siswa, kolom 6 aspek, nilai tercatat');
ok(G(`typeof obsVisible('siswa')`) === 'object' && G(`obsVisible('siswa').length`) === 3 && G(`book.name`) !== 'x', 'Excel: pengganti sementara obsVisible/book dikembalikan');
G(`S.observasi=S.observasi.filter(function(r){return r.id==='lama'});__book=null;obsXls()`);
ok(G('__book.pairs.length') === 1 && G('__book.pairs[0][0]') === 'Rekap Observasi LKPD Praktik', 'Excel: tanpa catatan v2 perilaku lama tidak berubah');
G(`S.observasi=[];__book=null;`);

/* ---------- Cetak dan cadangan draf ---------- */
G(`STAFF=false;LK.preview=false;LK.tab='kerja';DRAFT={}`);
ok(/Lembar Kerja terkunci/.test(G('viewLKPD()')), 'tanpa cetak, siswa belum lulus gerbang melihat kunci');
const cap = listeners.filter((l) => l.t === 'click' && l.c === true);
cap.forEach((l) => l.f({ target: { closest: (q) => (/lk-print/.test(q) ? {} : null) } }));
ok(!/Lembar Kerja terkunci/.test(G('viewLKPD()')) && /data-lk-field="t_F1_0_u1"/.test(G('viewLKPD()')), 'saat mencetak, Lembar Kerja tidak terkunci dan tabel tercetak');
await new Promise((r) => setTimeout(r, 20));
ok(/Lembar Kerja terkunci/.test(G('viewLKPD()')), 'penanda cetak dilepas setelah klik selesai');
const kerjaBtn = G('viewLKPD()');
G(`DRAFT=${JSON.stringify(penuh)}`);
ok(/data-act="lk2-backup"/.test(G('viewLKPD()')) && /data-lk2-restore/.test(G('viewLKPD()')), 'tombol Cadangkan draf dan Pulihkan draf tampil di modul v2');
const bersih = G(`LK2.bersih({ok1:'a','bad key':'x','__proto__x':1,n:3,b:true,long:'${'z'.repeat(9000)}',o:{a:1},fn:1})`);
ok(bersih.ok1 === 'a' && !('bad key' in bersih) && bersih.n === 3 && bersih.b === true && bersih.long.length === 8000 && bersih.o.a === 1, 'pembersih draf: kunci dan ukuran dibatasi');

/* ---------- Tampilan: pertemuan lipat, K3, rincian penilaian ---------- */
G(`STAFF=false;LK.preview=false;LK.detail=null;LK.editor=null;LKPD_MODULES[0].status='published';LKPD_MODULES[0].active=true;LK.tab='materi';DRAFT={};LK2.open={};LK2.cetak=false`);
let mt = G('viewLKPD()');
ok((mt.match(/<details class="lk2-dt" data-lk2d="p\d"/g) || []).length === 6 && !/data-lk2d="p1" open/.test(mt), 'Rencana pertemuan: 6 bagian lipat, tertutup secara bawaan');
ok(/Pertemuan 1<\/b><small>3 JP · 135 menit/.test(mt) && !/<table[^>]*>[^]*Pertemuan<\/th>/.test(mt), 'ringkasan pertemuan berisi JP dan menit; tabel lama diganti');
ok(/Ketuk satu pertemuan/.test(mt) && /6 pertemuan · 18 JP · 810 menit/.test(mt), 'keterangan total pertemuan tampil');
ok(/Kegiatan 1 · jangka sorong/i.test(mt) || /Kegiatan 1/.test(mt), 'isi pertemuan memuat kegiatan');
ok(/saksi guru/.test(mt), 'langkah bertanda saksi guru terlihat di rencana pertemuan');
G(`LK2.open={p2:true}`);
ok(/data-lk2d="p2" open/.test(G('viewLKPD()')) && !/data-lk2d="p3" open/.test(G('viewLKPD()')), 'status buka satu pertemuan diingat saat render ulang');
G(`LK2.open={};LK2.cetak=true`);
ok((G('viewLKPD()').match(/data-lk2d="p\d" open/g) || []).length === 6, 'saat mencetak semua bagian lipat terbuka');
G(`LK2.cetak=false`);
ok(/Keselamatan dan Kesehatan Kerja \(K3\)/.test(mt) && !/K3 dan APD<\/h2>/.test(mt), 'judul K3 memakai istilah lengkap');
sama(G('LKPD_MODULES[0].safety.length'), 10, '10 butir K3 sesuai praktik alat ukur');
sama(G('LKPD_MODULES[0].v2.k3grup.map(function(g){return g.i.length})'), [4, 4 - 1, 1, 2], 'butir K3 dikelompokkan: APD, persiapan, larangan, kebersihan dan darurat');
sama(G('LKPD_MODULES[0].v2.k3grup.reduce(function(t,g){return t.concat(g.i)},[]).sort(function(a,b){return a-b}).join()'), '0,1,2,3,4,5,6,7,8,9', 'setiap butir K3 masuk tepat satu kelompok');
ok(/Alat pelindung diri \(APD\)/.test(mt) && /data-lk-check="safe9"/.test(mt) && /Sarung tangan hanya dipakai saat memegang benda tajam/.test(mt), 'kelompok APD dan butir terakhir tampil; sarung tangan dilepas saat membaca skala');
sama(G('LKPD_MODULES[0].v2.apd'), [0, 1, 2, 3], 'paraf guru hanya pada 4 butir APD');
ok(/K3\) pada praktik alat ukur/.test(mt) || /Keselamatan dan kesehatan kerja \(K3\) pada praktik alat ukur/.test(mt), 'topik teori K3 ada di Memahami');
G(`LK.tab='evaluasi'`);
const ev = G('viewLKPD()');
ok((ev.match(/data-lk2d="a[a-z0-9]+"/g) || []).length === 6, 'penilaian kinerja: 6 aspek lipat');
ok(/Bobot 20% · aspek penghenti/.test(ev) && /Bobot 30%/.test(ev) && /Bobot 25%/.test(ev) && /Bobot 10%/.test(ev) && /Bobot 5%/.test(ev), 'bobot dan penanda aspek penghenti tampil');
ok(/Skor 4<\/b> \(Sangat baik\)/.test(ev) && /Skor 1<\/b> \(Kurang\)/.test(ev), 'arti skor 4 sampai 1 tampil pada tiap aspek');
ok(/Yang dinilai: APD terpasang benar/.test(ev) && /Yang dinilai: jujur mencatat/.test(ev) && /target menit tiap pertemuan/.test(ev), 'poin yang dinilai tiap aspek tampil');
ok(/Syarat kompeten/.test(ev) && (ev.match(/Bukti: /g) || []).length === 8, 'syarat kompeten: 8 indikator beserta buktinya');
ok(/Yang diamati dan kesalahan umum/.test(ev) && /Kesalahan umum:/.test(ev) && /3 ÷ 4 × 30 = 22,5/.test(ev), 'panduan diamati dan contoh hitung nilai tampil');
G(`LK2.open={ak3:true}`);
ok(/data-lk2d="ak3" open/.test(G('viewLKPD()')), 'aspek yang dibuka tetap terbuka setelah render ulang');
G(`LK2.open={};LK.tab='materi'`);

/* ---------- Perbaikan evaluasi LKPD-X-07 ---------- */
const TH = M.theory.map((x) => x[0]);
ok(TH.includes('Koreksi nol alat') && TH.includes('Perawatan dan penyimpanan'), 'materi memuat koreksi nol dan perawatan (dasar soal gerbang 3 dan 5)');
const q5 = M.v2.gate.qs[4];
ok(q5.o[q5.a].length < Math.max(...q5.o.map((x) => x.length)), 'soal gerbang 5: kunci bukan pilihan terpanjang');
ok(/C memakai ketelitian/.test(M.v2.gate.qs[1].e), 'pembahasan soal 2 menjelaskan pengecoh C');
ok(M.v2.tabel.filter((t) => t.id === 'F1' || t.id === 'F2').every((t) => /penyimpangan nol/.test(t.cat || '')), 'tabel F1 dan F2 memuat catatan koreksi nol');
ok(G(`LK.module='${M.id}';LK.tab='evaluasi';viewLKPD()`).indexOf('Latihan membaca skala (F4)') < 0, 'judul latihan tanpa label F4');

/* ---------- Pengaturan mode Ujian/Latihan pada v2 ---------- */
G(`STAFF=false;LK.preview=false;LK.module='${M.id}';DRAFT=${JSON.stringify(penuh)}`);
const cU = (o) => JSON.stringify(Object.assign({ mode: 'ujian', hideTeori: false, hideLangkah: false, hidePetunjuk: false }, o));
G(`LK.tab='materi'`); const mat = G('viewLKPD()');
ok(/<h2>Memahami<\/h2>/.test(mat) && /Rencana pertemuan/.test(mat), 'v2 materi: teori dan rencana ada sebelum disaring');
const fMat = G(`lk2ModeFilter(viewLKPD(),${cU({ hideTeori: true, hideLangkah: true })})`);
ok(/Teori ringkas tidak ditampilkan/.test(fMat) && !new RegExp(M.theory[0][0]).test(fMat.slice(fMat.indexOf('<h2>Memahami'), fMat.indexOf('Gerbang masuk praktik'))), 'ujian: teori v2 disembunyikan');
ok(/Rincian langkah tidak ditampilkan/.test(fMat) && /Pertemuan 1/.test(fMat), 'ujian: isi pertemuan disembunyikan, judul pertemuan tetap');
ok(/Gerbang masuk praktik/.test(fMat), 'ujian: gerbang masuk tetap tampil');
G(`LK.tab='kerja'`); const ker = G('viewLKPD()');
const fKer = G(`lk2ModeFilter(viewLKPD(),${cU({ hideLangkah: true, hidePetunjuk: true })})`);
ok(/Poin kritis/.test(ker) && !/Poin kritis/.test(fKer), 'ujian: poin kritis langkah disembunyikan');
ok(/Rahang rapat/.test(ker) && !/Rahang rapat/.test(fKer) && /data-lk-field="actual0"/.test(fKer) && /Posisi nol jangka sorong/.test(fKer), 'ujian: petunjuk komponen disembunyikan, nama komponen dan kolom isian tetap');
ok(G(`lk2ModeFilter('X',{mode:'latihan',hideTeori:true})`) === 'X', 'latihan: tidak ada yang disaring');
ok(/Periksa jawaban/.test(G(`lk2KeyBlock(LKPD_MODULES[0],{},false)`)), 'latihan v2: tombol periksa jawaban');
const kb = G(`lk2KeyBlock(LKPD_MODULES[0],${JSON.stringify(penuh)},true)`);
ok(/Benar \d+ dari 10/.test(kb) && !/NaN|undefined/.test(kb), 'latihan v2: pembahasan memakai soal isian tanpa galat');

/* ---------- Kunci hasil per pertemuan (lkpd-kunci.js) ---------- */
run(`function lkDraft(){return Object.assign({},DRAFT)}function lkKey(){return 'kunci-uji'}var LKM={edit:null,d:null};function uiOk(k,m,cb){return true}async function uiConfirm(){return true}`, 'stub-kunci');
run(src('lkpd-kunci.js'), 'lkpd-kunci.js');
const KM = 'LKPD_MODULES[0]';
G(`STAFF=false;LK.preview=false;LK.module='${M.id}';LK.open=true;S.lkpdBukti=[];S.user={id:'u1',nama:'Budi',kelas:'X'};delete ${KM}.kunci;delete ${KM}.pertBuka;toasts=[];DRAFT={student:'Budi',actual0:'22.35',status0:'Sesuai',status1:'Belum diperiksa',actual2:'9.5',status2:'Baik',t_F1_0_nol:'0',t_F2_0_nol:'0.01',q0:2,q4:3,ana0:'sebab',safe0:true,q100:1,qsig:'x',school:'y'}`);
const merged = () => G(`Object.keys(lkkMerged(${KM})).sort()`);
ok(G(`lkkOn(${KM})`) === true, 'kunci: aktif bawaan untuk v2 enam pertemuan');
sama(G(`lkkLockable(${KM})`), [2, 3, 4, 5], 'kunci: siswa boleh mengunci P2 sampai P5 (kecuali pertemuan awal dan akhir)');
/* pertemuan awal dan akhir ditolak */
G(`toasts=[];lkkLock(1)`); G(`lkkLock(6)`);
ok(G('S.lkpdBukti.length') === 0 && G('toasts').filter((t) => /tidak dikunci oleh siswa/.test(t)).length === 2, 'kunci: Pertemuan 1 (awal) dan Pertemuan 6 (akhir) tidak bisa dikunci siswa');
/* peta isian per pertemuan */
const km = G(`lkkKeyMap(${KM})`);
sama([km.step0, km.step3, km.step5, km.step7, km.t_F1_0_nol, km.t_F2_0_nol, km.actual0, km.actual2, km.actual4, km.actual6, km.q0, km.q4, km.q8, km.ana0, km.mt3], [2, 3, 4, 5, 2, 3, 2, 3, 4, 5, 2, 3, 4, 5, 3], 'kunci: isian dipetakan ke pertemuan lewat kegiatan, latihan, dan analisis');
ok(km.safe0 === undefined && km.q100 === undefined && km.student === undefined && km.refleksi0 === undefined, 'kunci: gerbang, K3, dan identitas tidak terpetakan (tetap bebas)');
/* kunci tidak berurutan: P3 lebih dulu */
G(`lkkLock(3)`);
sama(G('S.lkpdBukti.map(function(x){return x.label+"|"+x.lkpdId+"|"+x.sid})'), ['kunci|3|k|LKPD-X-07|u1'], 'kunci: P3 bisa dikunci lebih dulu (urutan bebas)');
sama(merged(), ['actual2', 'q4', 'status2', 't_F2_0_nol'], 'kunci: hanya isian Pertemuan 3 yang terkunci (isian P2, P5, K3, dan gerbang tidak ikut)');
G(`DRAFT.actual2='99';DRAFT.actual0='11'`);
ok(G('lkRead().actual2') === '9.5' && G('lkDraft().actual2') === '9.5', 'kunci: nilai terkunci tidak bisa diubah lewat isian');
ok(G('lkRead().actual0') === '11', 'kunci: isian pertemuan lain yang belum terkunci tetap bebas');
sama(G('Object.keys(lkRead().kunci)'), ['3'], 'kunci: payload memuat waktu kunci tiap pertemuan');
G(`toasts=[];lkkLock(3)`);
ok(G('S.lkpdBukti.length') === 1 && /sudah dikunci/.test(G('toasts.join("|")')), 'kunci: pertemuan yang sudah terkunci tidak dikunci ulang');
/* P2 menyusul, hanya isian P2 */
G(`lkkLock(2)`);
sama(G('S.lkpdBukti.map(function(x){return x.label})'), ['kunci|3', 'kunci|2'], 'kunci: P2 menyusul setelah P3');
sama(merged(), ['actual0', 'actual2', 'q0', 'q4', 'status0', 'status2', 't_F1_0_nol', 't_F2_0_nol'], 'kunci: isian P2 terkunci; nilai bawaan "Belum diperiksa" tidak dikunci');
sama(Object.keys(JSON.parse(G('S.lkpdBukti[1].data')).f).sort(), ['actual0', 'q0', 'status0', 't_F1_0_nol'], 'kunci: catatan P2 hanya memuat isian P2 (tidak berantai dengan P3)');
/* batas pertemuan yang dibuka guru */
G(`${KM}.pertBuka=3;toasts=[];lkkLock(5)`);
ok(G('S.lkpdBukti.length') === 2 && /belum membuka Kegiatan 4/.test(G('toasts.join("|")')), 'kunci: pertemuan di atas batas buka guru tidak bisa dikunci');
G(`${KM}.pertBuka=0;lkkLock(5)`);
sama(G(`Object.keys(lkkLocks(${KM})).sort()`), ['2', '3', '5'], 'kunci: P5 terkunci setelah batas dibuka');
ok(merged().indexOf('ana0') > -1 && merged().indexOf('safe0') < 0 && merged().indexOf('q100') < 0, 'kunci: analisis ikut P5; K3 dan gerbang tetap tidak terkunci');
G(`toasts=[];lkkLock(4)`);
ok(G('S.lkpdBukti.length') === 3 && /Belum ada isian Kegiatan 3/.test(G('toasts.join("|")')), 'kunci: pertemuan tanpa isian tidak membuat catatan kosong');
/* tampilan */
const dis = G(`lkkDisable('<input data-lk-field="actual0" value="1"><input data-lk-field="actual7" value=""><select data-lk-field="status0"><option>a</option></select><input type="radio" data-lk-answer="0"><input type="checkbox" data-lk-check="safe0"><input type="checkbox" data-lk-check="safe9">',lkkMerged(${KM}))`);
ok((dis.match(/disabled/g) || []).length === 3 && !/actual7[^>]*disabled/.test(dis) && !/safe0[^>]*disabled/.test(dis), 'kunci: hanya kolom terkunci yang dinonaktifkan (isian, pilihan, pilihan ganda); K3 tetap bebas');
const kbk = G(`lkkBlock(${KM})`);
ok(/Kunci Kegiatan 3/.test(kbk) && /data-n="4"/.test(kbk) && !/data-n="1"/.test(kbk) && !/data-n="6"/.test(kbk) && !/Kunci Pertemuan/.test(kbk) && /Kunci kegiatan yang sudah selesai/.test(kbk), 'kunci: bilah bawah menawarkan kegiatan yang belum terkunci (nama kegiatan), tanpa Pertemuan 1 dan 6');
G(`${KM}.pertBuka=3`);
ok(/disabled[^>]*>Kunci Kegiatan 3/.test(G(`lkkBlock(${KM})`)) && /Belum dibuka guru/.test(G(`lkkBlock(${KM})`)), 'kunci: pertemuan di atas batas buka tampil nonaktif');
G(`${KM}.pertBuka=0`);
/* guru membuka kunci pertemuan mana pun tanpa memengaruhi yang lain */
G(`S.lkpdBukti=S.lkpdBukti.filter(function(x){return x.label!=="kunci|3"})`);
ok(merged().indexOf('actual2') < 0 && merged().indexOf('actual0') > -1 && merged().indexOf('ana0') > -1, 'kunci: guru membuka P3 saja, P2 dan P5 tetap terkunci');
G(`lkkLock(3)`);
ok(merged().indexOf('actual2') > -1, 'kunci: P3 bisa dikunci ulang setelah dibuka guru');
G(`Cloud.on=false;S.users=[{id:'u1',nama:'Budi'}]`);
const kst = G(`lkkStatus(${KM})`);
ok(/Buka kunci Kegiatan 1/.test(kst) && /Buka kunci Kegiatan 2/.test(kst) && /Buka kunci Kegiatan 4/.test(kst) && /Budi/.test(kst), 'kunci: status guru memuat tombol buka kunci per pertemuan');
const pn = G(`lkkPanel(${KM},{kunci:true,pertBuka:4})`);
ok(/data-lkm="kunci" checked/.test(pn) && /<option value="4" selected>/.test(pn) && /pertemuan awal dan akhir tidak ada kuncinya/.test(pn) && /Hanya tampil saat mode Latihan/.test(pn) && !/<option value="1"/.test(pn) && !/<option value="6"/.test(pn) && /Status kunci siswa/.test(pn), 'kunci: panel guru menampilkan sakelar, batas pertemuan, dan aturan awal/akhir');
/* kunci hanya pada mode Latihan */
G(`var MODEX='ujian';var lkmCfg=function(){return {mode:MODEX}}`);
ok(G(`lkkOn(${KM})`) === false && G('lkRead().actual2') === '99' && !/lkk-lock/.test(G(`lk2BkBlock(${KM})`)), 'kunci: mode Ujian tidak ada tombol kunci dan catatan kunci lama tidak memaksa isian');
G(`MODEX='latihan'`);
ok(G(`lkkOn(${KM})`) === true && /lkk-lock/.test(G(`lk2BkBlock(${KM})`)), 'kunci: mode Latihan tombol kunci muncul');
G(`delete globalThis.lkmCfg`);
/* mati / guru / pratinjau */
G(`${KM}.kunci=false`);
ok(G(`lkkOn(${KM})`) === false && G('lkRead().actual2') === '99', 'kunci: dimatikan guru, tidak ada penguncian');
G(`delete ${KM}.kunci;STAFF=true`);
ok(G('lkRead().actual2') === '99', 'kunci: tampilan guru tidak terkena penguncian');
G(`STAFF=false;LK.preview=true`);
ok(G('lkRead().actual2') === '99', 'kunci: pratinjau tidak terkena penguncian');

console.log(`\nUji LKPD v2: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
