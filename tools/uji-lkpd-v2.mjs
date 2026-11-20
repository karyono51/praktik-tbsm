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
function lkqType(q){return q&&q.t==='kompleks'?'kompleks':q&&q.t==='kategori'?'kategori':'pg'}
function lkqAnswered(q,a){return typeof a==='number'}
function lkqPoint(q,a){return a===q.a?1:0}
function lkqValid(q){return !!(q&&q.q&&Array.isArray(q.o))}
function lkqAnsText(q,a){return 'orig'}function lkqKeyText(q){return 'orig'}
function lkqVerdict(q,a){return typeof a==='number'?['ok','Benar']:['warn','Belum dijawab']}
function lkqRender(q,i,d){return '<div>pg</div>'}
function lkqQuizHtml(m,d){return m.quiz.map(function(q,i){return lkqRender(q,i,d)}).join('')}
function lkqDetail(q,i,a){return '<p>'+(i+1)+'. '+lkqVerdict(q,a)[1]+'</p>'}
var LKPD_MODULES=[];
`, 'stub-lkpd');
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
sama(G(`lk2Gate(LKPD_MODULES[0],{gate0:'Diameter dalam',gate1:'ab'}).n`), 1, 'gerbang: jawaban <3 huruf tidak dihitung');
ok(G(`lk2Gate(LKPD_MODULES[0],{gate0:'aaa',gate1:'aaa',gate2:'aaa',gate3:'aaa',gate4:'aaa'}).ok`) === true, 'gerbang terbuka bila 5 terjawab');

/* ---------- Soal isian ---------- */
const Q = (id) => M.quiz.find((q) => q.id === id);
const pt = (id, a) => G(`lkqPoint(LKPD_MODULES[0].quiz[${M.quiz.indexOf(Q(id))}],${JSON.stringify(a)})`);
sama([pt('J1', '24,35'), pt('J1', '24.35'), pt('J1', ' 24,35 '), pt('J1', '24,36'), pt('J1', '24,3'), pt('J1', ''), pt('J1', 'x'), pt('D2', '0,22'), pt('D2', '0,2')], [1, 1, 1, 0, 0, 0, 0, 1, 0], 'isian: koma/titik benar, toleransi 0,005, salah/kosong = 0');
sama(M.quiz.map((q) => q.kunci), [24.35, 31.28, 12.45, 7.78, 12.35, 5.63, 2.45, 0.22], 'kunci F4 sama dengan versi guru');
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
M.v2.gate.qs.forEach((q, i) => (penuh['gate' + i] = 'jawaban lengkap'));
M.v2.analisis.forEach((q, i) => (penuh['ana' + i] = 'analisis yang cukup panjang'));
M.v2.tabel.forEach((t) => t.baris.forEach((b, r) => t.kol.forEach((k) => { if (k.t !== 'rata' && k.t !== 'selisih') penuh[`t_${t.id}_${r}_${k.k}`] = k.t === 'status' ? 'Sesuai' : '1'; })));
M.quiz.forEach((q, i) => (penuh['q' + i] = String(q.kunci).replace('.', ',')));
let sc = G(`lkScore(${JSON.stringify(penuh)})`);
sama([sc.practice, sc.theory, sc.final, sc.answered], [100, 100, 100, 8], 'semua terisi benar = 100');
const kosong = G(`lkScore({})`);
sama([kosong.practice, kosong.theory, kosong.final], [0, 0, 0], 'kosong = 0');
const sebagian = Object.assign({}, penuh); M.quiz.slice(0, 4).forEach((q, i) => (sebagian['q' + i] = '99'));
sama(G(`lkScore(${JSON.stringify(sebagian)})`).theory, 50, '4 dari 8 benar = teori 50');

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
sama(G('SUBMITTED'), 1, 'kirim lanjut bila gerbang selesai');
const rd = G('lkRead()');
ok(rd.v2 && rd.v2.ver === 2 && rd.v2.gate === 5 && rd.v2.tabel === 100 && Math.abs(rd.v2.calc.F1[0].rata - 1) < 1e-9, 'payload memuat v2.calc, gerbang, dan kelengkapan tabel');

/* ---------- Detail dan verifikasi guru ---------- */
const payload = Object.assign({}, penuh, rd, { student: 'Budi', school: 'SMKS Medina' });
G(`STAFF=true`);
const det = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(payload)})`);
ok(/Gerbang masuk/.test(det) && /data-lk2v="g0"/.test(det) && /data-lk2v="s2"/.test(det) && /data-lk2v="a0"/.test(det) && /lk2-verif/.test(det), 'Detail guru memuat kotak verifikasi gerbang, saksi, dan APD');
ok(/Kunci: Diameter dalam dan kedalaman/.test(det), 'kunci gerbang tampil untuk guru');
G(`STAFF=false`);
const detS = G(`lkDetailBody({id:'z',moduleId:'LKPD-X-07',payload:''},${JSON.stringify(Object.assign({}, payload, { v2: Object.assign({}, rd.v2, { verif: { g: { 0: 1, 1: 1, 2: 1, 3: 1 }, s: { 2: 1 }, a: {}, ts: 1, by: 'Guru' } }) }))})`);
ok(!/data-lk2v/.test(detS) && !/Kunci: Diameter/.test(detS), 'siswa tidak melihat kunci dan kotak verifikasi');
ok(/4 dari 5 benar[^<]*\(syarat minimal 4\): <b>lulus/.test(detS), 'Detail menghitung gerbang 4/5 = lulus');

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
ok(/ob2-on/.test(html) && /Siti/.test(html), 'formulir baru menawarkan pilihan formulir v2 dan tetap menampilkan formulir lama');
G(`document.dispatchLike=function(){}`);
// pilih v2 lewat state langsung (jalur klik bergantung DOM)
G(`OB.d.v2='LKPD-X-07';OB.d.per={};OB.d.nilai={};OB.d.cat={};OB.d.cur='';obsEnsure(OB.d)`);
html = G('obsStuHtml(OB.d)');
ok(/Yang diamati dan kesalahan umum/.test(html) && (html.match(/data-act="ob2-rate"/g) || []).length === 24 && (html.match(/data-ob2i=/g) || []).length === 8, 'formulir v2: panduan, 6 aspek x 4 deskriptor, 8 indikator');
ok(/Pakai formulir lama/.test(html), 'formulir v2 menyediakan kembali ke formulir lama');
// simpan tanpa lengkap
G(`OB.d.mapel='';OB.d.tanggal='2026-11-20';OB.d.kelas='X';OB.d.jenis='Bengkel sekolah';toasts.length=0;S.observasi=[];obsSaveSiswa()`);
ok(G('toasts').some((t) => /Lengkapi skor 6 aspek/.test(t)) && G('S.observasi.length') === 0, 'simpan ditolak bila aspek belum lengkap');
// lengkapi dua siswa
G(`OB.d.nilai=${JSON.stringify(semua4)};obsFlush(OB.d);obsLoad(OB.d,'s2');OB.d.nilai=Object.assign({},${JSON.stringify(semua4)},{k3:1});obsFlush(OB.d);obsSaveSiswa()`);
const rec = G('S.observasi');
sama(rec.length, 2, 'dua siswa tersimpan sebagai dua catatan');
const p1 = JSON.parse(rec[0].payload), p2 = JSON.parse(rec[1].payload);
ok(p1.v === 2 && p1.mod === 'LKPD-X-07' && rec[0].skor === 100 && p1.hasil.kompeten === true && rec[0].tipe === 'siswa' && rec[0].mapel === M.title, 'catatan v2: penanda versi, modul, skor, kompeten, mapel otomatis dari judul modul');
ok(p2.hasil.stop === true && p2.hasil.kompeten === false && rec[1].kategori === 'Kurang', 'siswa dengan K3 = 1 tersimpan sebagai dihentikan/tidak kompeten');
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
ok(dd.v2 === 'LKPD-X-07' && dd.nilai.k3 === 4, 'Ubah catatan v2 memulihkan modul dan skor');
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
ok(bk.pairs[1][1].length === 3 && bk.pairs[1][1][0].length === 7 + 6 + 7 && bk.pairs[1][1][1][bk.pairs[1][1][0].indexOf('Nilai')] === 100, 'Excel v2: 2 siswa, kolom 6 aspek, nilai tercatat');
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

console.log(`\nUji LKPD v2: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
