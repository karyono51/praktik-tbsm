#!/usr/bin/env node
/* Uji Master LKPD V2 (js/lkpd-master.js): LKPD-DDO-ALT-02 sebagai master. node tools/uji-lkpd-master.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0; const ok = (c, m) => { if (c) lulus++; else { gagal++; console.log('GAGAL: ' + m); } };
const log = { toast: [], render: 0 }; const hs = [];
const ctx = vm.createContext({ console, JSON, Math, Object, Array, String, Number, Date, RegExp, window: null,
  document: { addEventListener(t, f, c) { hs.push({ t, f, c }); }, createElement() { return { style: {} } }, head: { appendChild() {} }, body: {} } });
ctx.window = ctx; ctx.scrollTo = () => {};
const src = (f) => fs.readFileSync(path.join(root, 'js', f), 'utf8');
const run = (code, n) => vm.runInContext(code, ctx, { filename: n });
run(src('lkpd-modul.js'), 'a'); run(src('lkpd-v2-x06.js'), 'b'); run(src('lkpd.js').split('\n').slice(0, 19).join('\n'), 'c');
run(`LKPD_MODULES=LKPD_MODULES.concat(LKPD_EXTRA_MODULES);
function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}function lkEsc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var STAFF=true;function isStaff(){return STAFF}var LKS={id:'LKPD-DDO-ALT-02'};function lksMod(){return LKPD_MODULES.find(function(x){return x.id===LKS.id})}
function lksHub(){return '<div class="row">kembali</div><section class="card lks-card">kartu</section><section class="card">tab</section>'}
var LK={},LKA={},LKM={};function render(){}function toast(m){__toast.push(m)}
function lkEditorDefaults(m){var d={id:m.id,title:m.title,kelas:m.kelas,status:'x',active:true};d.src=JSON.parse(JSON.stringify(m));return d}`, 'stub');
ctx.__toast = log.toast;
run(src('lkpd-master.js'), 'lkpd-master.js');
const G = (e) => vm.runInContext(e, ctx);
const klik = (v) => hs.filter((h) => h.t === 'click' && h.c === true).forEach((h) => h.f({ target: { closest: (s) => /lkms-baru/.test(s) ? { dataset: { v } } : null }, stopPropagation() {}, preventDefault() {} }));
const master = () => G('LKPD_MODULES.find(function(x){return x.id==="LKPD-DDO-ALT-02"})');
const salin = () => JSON.parse(JSON.stringify(master()));

/* master memenuhi semua butir */
const cek = ctx.lkmsCek(master());
ok(cek.length === 14, '14 butir daftar periksa (' + cek.length + ')');
ok(cek.every((x) => x.ok), 'LKPD-DDO-ALT-02 memenuhi semua butir master: ' + cek.filter((x) => !x.ok).map((x) => x.k).join('; '));
ok(ctx.lkmsMaster(master()) === true, 'LKPD-DDO-ALT-02 dikenali sebagai master');
const v1 = salin(); delete v1.v2; v1.id = 'X-1'; /* LKPD v1 bawaan sudah dihapus: tiru bentuknya */
ok(ctx.lkmsMaster(v1) === false && ctx.lkmsCek(v1)[0].ok === false, 'LKPD v1 bukan master dan bukan v2');
/* salinan dengan id lain bukan master */
const cp = salin(); cp.id = 'LKPD-DDO-GBR-01';
ok(ctx.lkmsMaster(cp) === false, 'salinan dengan ID lain bukan master');
/* tiap kerusakan terdeteksi pada butir yang tepat */
const rusak = (fn, butir, nama) => { const m = salin(); fn(m); const c = ctx.lkmsCek(m); const g = c.filter((x) => !x.ok); ok(g.length >= 1 && g.some((x) => x.k.indexOf(butir) === 0), nama + ': butir "' + butir + '" terdeteksi (gagal: ' + g.map((x) => x.k.slice(0, 20)).join(' | ') + ')'); return c; };
rusak((m) => { m.objectives = ['a']; }, 'Tujuan', 'tujuan kurang');
rusak((m) => { m.theory = m.theory.filter((x) => !/pemantik/i.test(x[0])); }, 'Pertanyaan pemantik', 'tanpa pemantik');
rusak((m) => { m.v2.pertemuan[0].kegiatan = [1]; }, 'Rencana pertemuan', 'pertemuan awal berkegiatan');
rusak((m) => { m.v2.pertemuan.forEach((p) => { p.kegiatan = (p.kegiatan || []).filter((k) => k !== 3); }); }, 'Setiap kegiatan terpetakan', 'kegiatan 3 tak terpetakan');
rusak((m) => { m.v2.gate.qs[0].e = ''; }, 'Gerbang masuk', 'pembahasan gerbang kosong');
rusak((m) => { m.v2.gate.qs[1].a = 9; }, 'Gerbang masuk', 'kunci di luar pilihan');
rusak((m) => { m.v2.gate.qs[2].a = [0]; }, 'Gerbang masuk', 'kunci kompleks tunggal');
rusak((m) => { m.v2.gate.qs[3].lvl = 'Hafalan'; }, 'Gerbang masuk', 'level bukan HOTS');
rusak((m) => { m.v2.apd = []; }, 'K3 dan APD', 'tanpa APD');
rusak((m) => { m.v2.k3grup[0].i = m.v2.k3grup[0].i.slice(1); }, 'K3 dan APD', 'butir K3 tak terkelompok');
rusak((m) => { m.v2.langkah.forEach((l) => { l.saksi = false; }); }, 'Setiap kegiatan punya langkah', 'tanpa langkah bersaksi');
rusak((m) => { m.v2.tabel = [{ id: 'F1', k: 1, kol: [], baris: [] }]; }, 'Tabel data', 'tabel tanpa kolom dan baris');
rusak((m) => { m.v2.cekK.pop(); }, 'Pemeriksaan dan bukti', 'cekK tak sepadan');
rusak((m) => { m.fotoWajib = []; }, 'Pemeriksaan dan bukti', 'tanpa wajib foto');
rusak((m) => { m.v2.pertemuan[1].latihan = ['ZZ']; }, 'Latihan membaca skala', 'id latihan tak ada');
rusak((m) => { m.v2.analisis = ['a']; }, 'Analisis', 'analisis kurang');
const cb = rusak((m) => { m.v2.obs.aspek[0].b = 25; }, 'Penilaian kinerja', 'bobot 105%');
ok(/105%/.test(cb.filter((x) => !x.ok).map((x) => x.t).join(' ')), 'pesan menyebut total bobot 105%');
rusak((m) => { m.v2.obs.aspek.forEach((a) => { delete a.stop; }); }, 'Penilaian kinerja', 'tanpa aspek penghenti');
rusak((m) => { m.v2.tindak = {}; }, 'Tindak lanjut', 'tanpa tindak lanjut');
rusak((m) => { m.v2.cekAlat = []; }, 'Cek kondisi alat', 'tanpa cek alat');
/* tampilan Kelola LKPD */
G('STAFF=true;LKS.id="LKPD-DDO-ALT-02"');
let h = G('lksHub()');
ok(/Master LKPD V2/.test(h) && /14\/14/.test(h) && /data-act="lkms-baru" data-v="LKPD-DDO-ALT-02">Buat LKPD v2 dari master/.test(h) && /Semua butir master terpenuhi/.test(h), 'master: kartu, 14/14, tombol Buat dari master');
ok(h.indexOf('kartu</section><section class="lkms') < 0 && h.indexOf('</section><section class="card lkms">') > -1, 'kartu master dipasang tepat setelah kartu LKPD');
G('STAFF=false'); ok(G('lksHub()').indexOf('lkms') < 0, 'siswa tidak melihat kartu master');
G('STAFF=true;LKS.id="X-1"'); ok(G('lksHub()').indexOf('lkms') < 0, 'LKPD v1: tidak ada kartu master');
/* LKPD v2 turunan: kelengkapan, tanpa tombol master */
G(`var t=JSON.parse(JSON.stringify(LKPD_MODULES.find(function(x){return x.id==="LKPD-DDO-ALT-02"})));t.id="LKPD-DDO-GBR-02";t.v2.dari="LKPD-DDO-ALT-02";t.v2.tindak={};LKPD_MODULES.push(t);LKS.id="LKPD-DDO-GBR-02"`);
h = G('lksHub()');
ok(/Kelengkapan sesuai master V2/.test(h) && /13\/14/.test(h) && /Turunan master LKPD-DDO-ALT-02/.test(h) && /Tindak lanjut remedial dan pengayaan<\/b>: Tindak lanjut belum lengkap/.test(h) && h.indexOf('lkms-baru') < 0, 'turunan: kelengkapan 13/14, asal master, butir kurang tampil, tanpa tombol');
/* aksi Buat LKPD v2 dari master */
const sebelum = JSON.stringify(master());
G('STAFF=false;LK.editor=null'); klik('LKPD-DDO-ALT-02'); ok(G('LK.editor') === null, 'siswa: aksi ditolak');
G('STAFF=true'); klik('LKPD-DDO-GBR-02'); ok(G('LK.editor') === null && /tidak ditemukan/.test(log.toast.slice(-1)[0] || ''), 'bukan master: aksi ditolak dengan pesan');
klik('LKPD-DDO-ALT-02');
const ed = G('LK.editor');
ok(ed && ed.id === '' && ed.status === 'draft' && ed.active === false && ed.kelas === 'X' && /\(baru dari master\)/.test(ed.title), 'editor terbuka: ID kosong, draf, tidak aktif, judul penanda');
ok(ed.src.v2.dari === 'LKPD-DDO-ALT-02' && ed.src.v2.peta === undefined, 'salinan mencatat asal master dan tidak membawa peta ke soal lama');
ok(ed.src.v2.gate.qs.length === 5 && ed.src.v2.pertemuan.length === 5 && ed.src.quiz.length === 10, 'salinan membawa seluruh struktur master (5 pertemuan, 5 soal gerbang, 10 latihan)');
ok(G('LK.tab') === 'editor' && G('LKA.id') === null, 'status editor dibuka');
ok(JSON.stringify(master()) === sebelum, 'master tidak berubah oleh pembuatan salinan');
ok(ctx.lkmsCek(ed.src).filter((x) => !x.ok).length === 0, 'salinan baru langsung lengkap sesuai master');
console.log(`\nUji Master LKPD V2: ${lulus} lulus, ${gagal} gagal`); process.exit(gagal ? 1 : 0);
