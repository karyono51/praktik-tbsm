#!/usr/bin/env node
/* Uji gambar pada kuis LKPD (lkpd-gambar.js, lkpd-editor.js, lkpd-soal.js) dan cetak soal (cetak-soal.js).
   node tools/uji-lkpd-cetak.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const store = {};
const elStub = () => ({ addEventListener() {}, appendChild() {}, remove() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, dataset: {}, querySelector: () => null, querySelectorAll: () => [], setAttribute() {}, click() {} });
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, JSON, Math, Date, Object, Array, String, Number, Error, Buffer,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, indexedDB: undefined,
  document: Object.assign(elStub(), { createElement: elStub, body: elStub(), head: elStub(), getElementById: () => null, querySelectorAll: () => [], hidden: false }),
  Cloud: { on: false }, S: { user: { id: 'g1', nama: 'Guru', kelas: '' }, tab: 'banksoal', lkpdModules: [] }, CFG: {}, ICO: {}, SOAL_TKA: [],
  toast: (m) => { ctx.__toasts.push(m); }, __toasts: [], esc, lkEsc: esc,
  uid: () => 'u' + Math.random().toString(36).slice(2, 10), svg: () => '', $$: () => [], $: () => null, render() {}, isStaff: () => true, can: () => true,
  fromDoc: (d) => d, pick: (o, ks) => { const x = {}; ks.forEach((k) => { x[k] = o[k]; }); return x; },
  Jam: { now: () => Date.now() }, mmss: String, schAkunOk: () => true, schPeta: () => ({}), schHasilOk: () => true, schLabelModul: String, schKode: () => '', schNorm: String,
  uiConfirm: async () => true, viewKatalog() {}, LD: { SIDE: 800, MAXC: 100000 }, ldCall: async () => ({ ok: true, fileId: 'F1' }),
  ldSlug: (s, n) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, n),
  LK: { editor: null }, LKM: { reveal: {} }, LKPD_MODULES: [], LKPD_DEFAULT_MODULES: [], lkBuiltin: () => false,
  lkRefreshModules() {}, lkBuildModule: (v) => v, lkDraft: () => ({}), lkRead: () => ({}), lkmCur: () => null,
  LOGO: 'data:image/png;base64,LOGO', SEK: { nama: 'SMKS Contoh', program: 'TBSM', alamat: 'Jl. Contoh 1' },
  lkioExport() {}, uiOk: () => true, lkEditorDefaults: () => ({}), lkSerialize: (m) => m, lkModuleStore() {},
};
ctx.viewBeranda = () => ''; ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; ctx.scrollTo = () => {};
vm.createContext(ctx);
const run = (code) => vm.runInContext(code, ctx);
for (const f of ['js/banksoal.js', 'js/soal-gambar.js', 'js/lkpd-soal.js', 'js/lkpd-editor.js', 'js/lkpd-gambar.js', 'js/cetak-soal.js']) {
  try { vm.runInContext(baca(f), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}

/* ---------- 1. Editor: bersihkan dan periksa ---------- */
console.log('Editor kuis LKPD');
run("var qa={q:'Lihat gambar',o:['','Roda','','Rantai'],oi:['drive:AAAAAAAAAAAA','','drive:CCCCCCCCCCCC',''],a:2,e:'',qi:'drive:QQQQQQQQQQQQ'};var ca=lkeClean(qa);");
ok('pilihan hanya gambar dipertahankan (teks kosong)', run("ca.o.length===4&&ca.o[0]===''&&ca.o[1]==='Roda'&&ca.o[2]===''&&ca.oi[0]==='drive:AAAAAAAAAAAA'&&ca.oi[2]==='drive:CCCCCCCCCCCC'"), run('JSON.stringify(ca)'));
ok('kunci tetap menunjuk pilihan gambar-saja', run("ca.a===2"));
ok('pilihan kosong tanpa gambar dibuang, kunci mengikuti', run("var cd=lkeClean({q:'x',o:['a','','c'],oi:['','',''],a:2});cd.o.length===2&&cd.a===1&&cd.oi===undefined"), run('JSON.stringify(cd)'));
ok('pilihan kosong di tengah dibuang, gambar pilihan sesudahnya ikut bergeser', run("var ce=lkeClean({q:'x',o:['a','','c'],oi:['','','drive:CCCCCCCCCCCC'],a:0});ce.o.length===2&&ce.o[1]==='c'&&ce.oi[1]==='drive:CCCCCCCCCCCC'&&ce.oi[0]===''"), run('JSON.stringify(ce)'));
ok('gambar soal ikut tersimpan', run("ca.qi==='drive:QQQQQQQQQQQQ'"));
ok('soal tanpa gambar tidak menambah kolom qi/oi', run("var cb=lkeClean({q:'x',o:['a','b'],a:0});cb.qi===undefined&&cb.oi===undefined"));
ok('pilihan hanya gambar dihitung sebagai pilihan terisi', run("lkeQIssue({q:'x',o:['',''],oi:['drive:AAAAAAAAAAAA','drive:BBBBBBBBBBBB'],a:0})")==='');
ok('pilihan kosong tanpa gambar tetap ditolak', run("lkeQIssue({q:'x',o:['',''],oi:['',''],a:0})")!=='');
ok('PG kompleks: kunci gambar-saja dipetakan benar', run("var ck=lkeClean({t:'kompleks',q:'x',o:['a','','c'],oi:['','drive:BBBBBBBBBBBB',''],a:[1,2]});ck.o.length===3&&ck.a.join()==='1,2'&&ck.oi[1]==='drive:BBBBBBBBBBBB'"));
ok('PG kategori: hanya gambar soal, tanpa oi', run("var kt=lkeClean({t:'kategori',q:'x',rows:[['p1',true],['p2',false]],qi:'drive:QQQQQQQQQQQQ',oi:['drive:AAAAAAAAAAAA']});kt.qi==='drive:QQQQQQQQQQQQ'&&kt.oi===undefined"));
ok('lkqValid menerima soal dengan pilihan gambar-saja', run("lkqValid(ca)")===true);
ok('lkgFit menyejajarkan oi dengan o', run("var qf={o:['a','b','c'],oi:['x']};lkgFit(qf).length===3&&qf.oi[1]===''"));
ok('kotak gambar editor: tombol Tambah/Ganti dan Hapus', run("var b1=lkgBox({o:['a','b'],qi:''},0,'q'),b2=lkgBox({o:['a','b'],qi:'data:image/jpeg;base64,AAAA'},0,'q');b1.indexOf('Tambah gambar soal')>-1&&b1.indexOf('q-img-del')<0&&b2.indexOf('Ganti gambar soal')>-1&&b2.indexOf('q-img-del')>-1"));
const ed = baca('js/lkpd-editor.js');
ok('editor memanggil lkgPilih/lkgHapus', /a==='q-img'\)\{lkgPilih/.test(ed) && /a==='q-img-del'\)\{lkgHapus/.test(ed));
ok('hapus pilihan ikut menghapus gambarnya', /Array\.isArray\(q\.oi\)\)lkgFit\(q\)\.splice\(j,1\)/.test(ed));

/* ---------- 2. Tampilan siswa ---------- */
console.log('Tampilan siswa');
run("var qs={q:'Lihat gambar',o:['','Roda','Rantai'],oi:['data:image/jpeg;base64,AAAA','',''],a:0,qi:'data:image/jpeg;base64,QQQQ'};var hs=lkqRender(qs,0,{});");
ok('gambar soal tampil dan bisa diperbesar', run("hs.indexOf('sg-q ld-zoom')>-1&&hs.indexOf('QQQQ')>-1"));
ok('gambar pilihan tampil dan tidak bisa diperbesar', run("hs.indexOf('class=\"sg-o\"')>-1&&hs.indexOf('AAAA')>-1&&hs.indexOf('sg-o ld-zoom')<0"));
ok('pilihan tetap bisa dipilih (radio ada)', run("(hs.match(/data-lk-answer/g)||[]).length===3"));
ok('soal lama tanpa gambar: tampilan tidak berubah', run("var hl=lkqRender({q:'x',o:['a','b'],a:0},0,{});hl.indexOf('<img')<0&&hl.indexOf('sg-')<0"));
ok('kunci: pilihan gambar-saja ditulis (gambar)', run("lkqKeyText(qs)")==='A. (gambar)');
ok('jawaban siswa: pilihan gambar-saja ditulis (gambar)', run("lkqAnsText(qs,0)")==='A. (gambar)');
ok('pembahasan memuat gambar soal', run("lkqKeyHtml(qs,0,1).indexOf('QQQQ')>-1"));
ok('detail guru memberi penanda Soal bergambar', run("lkqDetail(qs,0,0).indexOf('Soal bergambar')>-1"));
ok('kategori: gambar soal tampil', run("lkqRender({t:'kategori',q:'x',rows:[['p1',true],['p2',false]],qi:'data:image/jpeg;base64,QQQQ'},0,{}).indexOf('QQQQ')>-1"));

/* ---------- 3. Unggah ke Drive saat modul dikirim ---------- */
console.log('Unggah gambar kuis');
run("var unggah=[];ldCall=async function(p){unggah.push(p);return {ok:true,fileId:'FILE'+String(unggah.length).padStart(8,'0')}};");
await vm.runInContext("(async function(){var m={id:'X-9',quiz:[{q:'a',o:['','b'],oi:['data:image/jpeg;base64,/9j/AAAA',''],a:0,qi:'data:image/jpeg;base64,/9j/BBBB'},{q:'c',o:['d','e'],a:1,qi:'drive:KEEPKEEPKEEP'},{t:'kategori',q:'k',rows:[['p',true],['q',false]]}]};globalThis.__m=m;globalThis.__ubah=await lkgUploadModul(m)})()", ctx);
ok('lkgUploadModul melaporkan ada perubahan', run('__ubah')===true);
ok('dua gambar diunggah dengan kind=soal', run("unggah.length===2&&unggah.every(function(p){return p.kind==='soal'&&p.action==='upload'})"));
ok('penanda data: diganti drive:<id>', run("__m.quiz[0].qi.indexOf('drive:')===0&&__m.quiz[0].oi[0].indexOf('drive:')===0&&__m.quiz[0].oi[1]===''"));
ok('gambar yang sudah drive: tidak diunggah ulang', run("__m.quiz[1].qi==='drive:KEEPKEEPKEEP'"));
ok('nama berkas memuat ID modul dan nomor soal', run("unggah[0].nama.indexOf('LKPD_X-9_s1')===0"), run('unggah[0].nama'));
ok('lkgBelumTerunggah: false setelah semua drive:', run("lkgBelumTerunggah(__m)")===false);
run("ldCall=async function(){throw new Error('Jaringan putus')};");
await vm.runInContext("(async function(){var m={id:'X-8',quiz:[{q:'a',o:['x','y'],a:0,qi:'data:image/jpeg;base64,/9j/CCCC'}]};globalThis.__m2=m;globalThis.__gal=null;try{await lkgUploadModul(m)}catch(e){globalThis.__gal=e.message}})()", ctx);
ok('unggah gagal: galat dilempar agar modul tetap di antrean', run('__gal')==='Jaringan putus', run('String(__gal)'));
ok('unggah gagal: penanda data tetap', run("__m2.quiz[0].qi.indexOf('data:')===0&&lkgBelumTerunggah(__m2)===true"));
ok('lkgBelumTerunggah: modul tanpa gambar = false', run("lkgBelumTerunggah({quiz:[{q:'a',o:['a','b'],a:0}]})")===false);
const pwa = baca('js/pwa.js');
ok('pwa.js mengunggah gambar sebelum modul dikirim', pwa.indexOf('lkgUploadModul(m)') > -1 && pwa.indexOf('lkgUploadModul(m)') < pwa.indexOf("createDocument(CFG.DB,'lkpd_modules'"));
ok('modul bawaan dan modul tanpa gambar tidak diubah jalurnya', /lkgBelumTerunggah\(m\)\)\{try\{if\(await lkgUploadModul/.test(pwa));
ok('lkpd-io: gambar dipertahankan saat impor soal yang tidak berubah', /imgOf\[ik\]/.test(baca('js/lkpd-io.js')));

/* ---------- 4. Cetak soal ---------- */
console.log('Cetak soal');
const PG = { id: 'p1', tipe: 'pg', mapel: 'Dasar TBSM', q: 'Perhatikan gambar <busi>', opts: ['', 'Roda', 'Rantai', 'Piston', 'Katup'], kunci: 2, qi: 'drive:QQQQQQQQQQQQ', oi: ['drive:AAAAAAAAAAAA', '', '', '', ''], bahas: 'Rantai penggerak.', aktif: true };
const KP = { id: 'k1', tipe: 'kompleks', mapel: 'Dasar TBSM', q: 'Pilih komponen mesin', opts: ['Piston', 'Roda', 'Katup', 'Jok', 'Lampu'], kunci: [2, 0], aktif: true };
const KT = { id: 't1', tipe: 'kategori', mapel: 'Dasar TBSM', q: 'Tentukan pernyataan', rows: [['Busi memercikkan api', true], ['Oli diganti tiap hari', false]], lab: ['Benar', 'Salah'], aktif: true };
ctx.__PG = PG; ctx.__KP = KP; ctx.__KT = KT;
run("CS.img={'drive:QQQQQQQQQQQQ':'data:image/jpeg;base64,QQQQ','drive:AAAAAAAAAAAA':'data:image/jpeg;base64,AAAA'};");
run("var HK=csBuild([__KT,__PG,__KP],{judul:'Ulangan Harian',mapel:'Dasar TBSM',kelas:'X TBSM',waktu:'60',kunci:true,bahas:true});var HN=csBuild([__PG],{judul:'Tes',kunci:false});");
ok('kop sekolah dan judul tampil', run("HK.indexOf('SMKS Contoh')>-1&&HK.indexOf('Ulangan Harian')>-1&&HK.indexOf('X TBSM')>-1&&HK.indexOf('60 menit')>-1"));
ok('bagian PG, kompleks, kategori berurutan', run("var a=HK.indexOf('A. Pilihan ganda'),b=HK.indexOf('B. Pilihan ganda kompleks'),c=HK.indexOf('C. Pilihan ganda kategori');a>-1&&b>a&&c>b"));
ok('gambar soal dan gambar pilihan dicetak', run("HK.indexOf('cs-qi')>-1&&HK.indexOf('QQQQ')>-1&&HK.indexOf('cs-oi')>-1&&HK.indexOf('AAAA')>-1"));
ok('teks soal di-escape', run("HK.indexOf('&lt;busi&gt;')>-1&&HK.indexOf('<busi>')<0"));
ok('PG kompleks memakai kotak centang', run("(HK.match(/class=\"cs-box\"/g)||[]).length>=5"));
ok('PG kategori tampil sebagai tabel Benar/Salah', run("HK.indexOf('<th>Benar</th><th>Salah</th>')>-1&&HK.indexOf('Busi memercikkan api')>-1"));
ok('nomor berlanjut sesuai urutan bagian (PG=1, kompleks=2, kategori=3)', run("HK.indexOf('<div class=\"cs-n\">1.</div><div class=\"cs-b\"><div class=\"cs-t\">Perhatikan')>-1&&HK.indexOf('<div class=\"cs-n\">2.</div><div class=\"cs-b\"><div class=\"cs-t\">Pilih komponen')>-1&&HK.indexOf('<div class=\"cs-n\">3.</div><div class=\"cs-b\"><div class=\"cs-t\">Tentukan')>-1"));
ok('kunci jawaban di halaman terpisah dengan kunci benar', run("HK.indexOf('cs-kunci')>-1&&HK.indexOf('<td>C</td>')>-1&&HK.indexOf('<td>A, C</td>')>-1&&HK.indexOf('1) Benar; 2) Salah')>-1"));
ok('pembahasan ikut bila dipilih', run("HK.indexOf('Rantai penggerak.')>-1&&HK.indexOf('<th>Pembahasan</th>')>-1"));
ok('tanpa kunci: halaman kunci tidak dibuat', run("HN.indexOf('cs-kunci')<0&&HN.indexOf('Kunci jawaban')<0"));
ok('gambar yang tidak termuat diberi keterangan', run("CS.img={};csBuild([__PG],{judul:'x'}).indexOf('[gambar tidak termuat]')>-1"));
ok('csKey: soal tanpa kunci ditulis -', run("csKey({tipe:'pg',opts:['a','b']})")==='-');
ok('csPilih membatasi jumlah soal', run("csPilih([__PG,__KP,__KT],{jumlah:2}).length")===2 && run("csPilih([__PG,__KP,__KT],{jumlah:0}).length")===3 && run("csPilih([__PG,__KP,__KT],{jumlah:99}).length")===3);
const cs = baca('js/cetak-soal.js'), idx = baca('index.html');
ok('hanya guru/admin yang dapat membuka dialog cetak', /bsEdit\(\)\)\)\{toast\('Hanya guru dan admin/.test(cs));
ok('skrip cetak-soal dan lkpd-gambar terdaftar di index.html', /js\/cetak-soal\.js/.test(idx) && /js\/lkpd-gambar\.js/.test(idx));
ok('lkpd-gambar dimuat setelah lkpd-io (agar ekspor Excel terbungkus)', idx.indexOf('js/lkpd-gambar.js') > idx.indexOf('js/lkpd-io.js'));

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
