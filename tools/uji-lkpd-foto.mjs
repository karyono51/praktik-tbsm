#!/usr/bin/env node
/* Uji foto pada Materi dan Soal evaluasi LKPD, soal isian angka di editor, dan editor yang aman untuk LKPD v2
   (js/lkpd-v2-editor.js). node tools/uji-lkpd-foto.mjs */
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
  console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, JSON, Math, Date, Object, Array, String, Number, Error, Buffer, isFinite,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, indexedDB: undefined,
  document: Object.assign(elStub(), { createElement: elStub, body: elStub(), head: elStub(), getElementById: () => null, querySelectorAll: () => [], hidden: false }),
  Cloud: { on: false }, S: { user: { id: 'g1', nama: 'Guru', kelas: '' }, tab: 'lkpd', lkpdModules: [] }, CFG: {}, ICO: {}, SOAL_TKA: [],
  toast: (m) => { ctx.__toasts.push(m); }, __toasts: [], esc, lkEsc: esc,
  uid: () => 'u' + Math.random().toString(36).slice(2, 10), svg: () => '', $$: () => [], $: () => null, render() {}, isStaff: () => true, can: () => true,
  fromDoc: (d) => d, pick: (o, ks) => { const x = {}; ks.forEach((k) => { x[k] = o[k]; }); return x; },
  Jam: { now: () => Date.now() }, mmss: String, schAkunOk: () => true, schPeta: () => ({}), schHasilOk: () => true, schLabelModul: String, schKode: () => '', schNorm: String,
  uiConfirm: async () => true, viewKatalog() {}, LD: { SIDE: 800, MAXC: 100000 }, ldCall: async () => ({ ok: true, fileId: 'F1' }),
  ldSlug: (s, n) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, n),
  KELAS: { X: { judul: 'Kelas X', fase: 'E' } }, lkKelasOpts: () => '', lkElOpts: () => '', schOptModul: () => '',
  LK: { editor: null }, LKM: { reveal: {} }, LKPD_MODULES: [], LKPD_DEFAULT_MODULES: [], lkBuiltin: () => false,
  lkRefreshModules() {}, lkBuildModule: (v) => v, lkDraft: () => ({}), lkRead: () => ({}), lkmCur: () => null,
  lkioExport() {}, uiOk: () => true, lkSerialize: (m) => { const x = Object.assign({}, m); delete x.r; delete x.d; return x; }, lkModuleStore() {},
  LKPD_EXTRA_MODULES: [], lk2Num: (a) => Number(String(a).replace(',', '.')), lk2Fmt: (n) => String(n).replace('.', ','), lk2Txt: (a) => String(a == null ? '' : a),
};
ctx.lkEditorDefaults = (m) => (m ? { id: m.id, title: m.title, kelas: m.kelas, fase: m.fase, unit: m.unit, duration: m.duration, skkni: m.skkni, status: m.status, active: m.active !== false } : { id: '' });
ctx.viewBeranda = () => '';
ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; ctx.scrollTo = () => {};
vm.createContext(ctx);
const run = (code) => vm.runInContext(code, ctx);
/* lkValidateModule asli dari lkpd.js */
const lkpd = baca('js/lkpd.js');
const vm0 = lkpd.split('\n').find((l) => l.startsWith('function lkValidateModule'));
run(vm0);
for (const f of ['js/banksoal.js', 'js/soal-gambar.js', 'js/lkpd-soal.js', 'js/lkpd-v2-soal.js', 'js/lkpd-editor.js', 'js/lkpd-gambar.js', 'js/lkpd-skala-gambar.js', 'js/soal-grup.js', 'js/lkpd-v2-x06.js', 'js/lkpd-v2-editor.js']) {
  try { vm.runInContext(baca(f), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}
const x07 = run('LKPD_EXTRA_MODULES.filter(function(m){return m.id===\'LKPD-DDO-ALT-02\'})[0]');
ok('modul X-06 termuat', !!x07 && x07.v2 && x07.v2.ver === 2);

console.log('Soal isian angka di editor');
run("var qi1={t:'isian',q:'Jangka sorong 0,05 mm: berapa bacaan?',kunci:45.55,tol:0.01,u:'mm',g:{k:'jangka'},e:'Bahas',id:'J4'};var ci1=lkeClean(qi1);");
ok('isian: t, kunci angka, tol, satuan, g, id dipertahankan', run("ci1.t==='isian'&&ci1.kunci===45.55&&ci1.tol===0.01&&ci1.u==='mm'&&ci1.g.k==='jangka'&&ci1.id==='J4'"), run('JSON.stringify(ci1)'));
ok('isian: tidak dipaksa menjadi PG (tanpa o/a)', run("ci1.o===undefined&&ci1.a===undefined"));
ok('isian: kunci berkoma dibaca angka', run("lkeClean({t:'isian',q:'x',kunci:'45,55',tol:'0,05'}).kunci")===45.55 && run("lkeClean({t:'isian',q:'x',kunci:'45,55',tol:'0,05'}).tol")===0.05);
ok('isian: tol kosong dihapus (pakai bawaan)', run("lkeClean({t:'isian',q:'x',kunci:'1',tol:''}).tol")===undefined);
ok('isian valid tanpa masalah', run("lkeQIssue(qi1)")==='');
ok('isian: kunci kosong ditolak', /Kunci/.test(run("lkeQIssue({t:'isian',q:'x',kunci:''})")));
ok('isian: pertanyaan kosong ditolak', /Pertanyaan/.test(run("lkeQIssue({t:'isian',q:'',kunci:'1'})")));
ok('isian: tol negatif ditolak', /Toleransi/.test(run("lkeQIssue({t:'isian',q:'x',kunci:'1',tol:'-1'})")));
ok('hasil bersih lolos lkqValid', run("lkqValid(ci1)")===true);
ok('lkeNewQ(isian) bentuk benar', run("var nq=lkeNewQ('isian');nq.t==='isian'&&nq.q===''&&nq.tol===0.01"));
ok('PG biasa tidak berubah', run("var cp=lkeClean({q:'x',o:['a','b'],a:1});cp.a===1&&cp.o.length===2&&lkeQIssue({q:'x',o:['a','b'],a:1})===''"));
run("var dd={S:{quiz:[qi1],theory:[['T1','uraian']]},qi:0,tab:'soal',src:null};var hq=lkeQHtml(dd,qi1,0);dd.qi=-1;var hc=lkeQHtml(dd,qi1,0);");
ok('kartu isian berlabel Isian angka (bukan undefined)', run("hc.indexOf('Isian angka')>-1&&hc.indexOf('undefined')<0"));
ok('kartu terbuka: tombol foto soal ada', run("hq.indexOf('data-lke-a=\"q-img\"')>-1&&hq.indexOf('Tambah gambar soal')>-1"));
ok('kartu terbuka: kolom kunci, toleransi, satuan', run("hq.indexOf('quiz.0.kunci')>-1&&hq.indexOf('quiz.0.tol')>-1&&hq.indexOf('quiz.0.u')>-1&&hq.indexOf('value=\"45.55\"')>-1"));
ok('kartu bergambar menampilkan penanda Foto', run("var qf2=Object.assign({},qi1,{qi:'drive:ABCDEFGHIJKL'});lkeQHtml({S:{quiz:[qf2]},qi:-1},qf2,0).indexOf('>Foto<')>-1"));
ok('ringkasan soal menghitung isian angka', run("lkeCalc({S:{quiz:[qi1,{q:'a',o:['a','b'],a:0}]},tab:'soal'})").indexOf('1 isian angka') > -1);

console.log('Foto pada soal isian (siswa)');
run("var qs={t:'isian',q:'Baca skala',kunci:1,tol:0.01,qi:'data:image/jpeg;base64,QQQQ',g:{k:'jangka',skala:0.05,nilai:12.35}};var hs=lkqRender(qs,0,{});");
ok('foto soal isian tampil dan bisa diperbesar', run("hs.indexOf('sg-q ld-zoom')>-1&&hs.indexOf('QQQQ')>-1"));
ok('kolom jawaban isian tetap ada', run("hs.indexOf('data-lk-field=\"q0\"')>-1"));
ok('isian tanpa foto: tidak ada gambar tambahan', run("lkqRender({t:'isian',q:'x',kunci:1},0,{}).indexOf('sg-q')<0"));
ok('detail guru memberi penanda Soal bergambar', run("lkqDetail(qs,0,'1').indexOf('Soal bergambar')>-1"));
ok('pembahasan memuat foto soal isian', run("lkqKeyHtml(qs,0,'1').indexOf('QQQQ')>-1"));

console.log('Foto pada Materi (teori)');
run("var dt={S:{theory:[['Jangka sorong','Uraian satu',''],['Mikrometer','Uraian dua','drive:ABCDEFGHIJKL'],['','']],quiz:[]},tab:'tujuan',src:null};var ht=lkePairs(dt,'theory','Teori','h','Topik','Penjelasan','Tambah',true);");
ok('baris tanpa foto: tombol Tambah foto', run("ht.indexOf('data-lkv-a=\"m-img\" data-i=\"0\">Tambah foto')>-1"));
ok('baris berfoto: tombol Ganti dan Hapus foto', run("ht.indexOf('data-i=\"1\">Ganti foto')>-1&&ht.indexOf('data-lkv-a=\"m-img-del\" data-i=\"1\"')>-1"));
ok('setiap baris teori punya kotak foto (3 baris)', run("(ht.match(/class=\"sg-box\"/g)||[]).length===3"));
ok('tab Pemeriksaan tidak mendapat tombol foto teori', run("lkePairs({S:{checks:[['a','b']]},tab:'cek'},'checks','C','h','K','K2','T',false).indexOf('m-img')<0"));
ok('lkvMateriImg: foto tampil, bisa diperbesar', run("lkvMateriImg(['T','U','data:image/jpeg;base64,AAAA']).indexOf('sg-q ld-zoom')>-1"));
ok('lkvMateriImg: tanpa foto kosong', run("lkvMateriImg(['T','U'])")==='' && run("lkvMateriImg(['T','U',''])")==='');
ok('lkvMateriImg: penanda sembarang ditolak', run("lkvMateriImg(['T','U','javascript:alert(1)'])")==='');
ok('Materi siswa (lkpd.js) memanggil lkvMateriImg', /lkvMateriImg\(x\)/.test(lkpd));
ok('Materi siswa v2 memanggil lkvMateriImg', /lkvMateriImg\(x\)/.test(baca('js/lkpd-v2.js')));
ok('Cetak memanggil lkvMateriImg', /lkvMateriImg\(x\)/.test(baca('js/lkpd-format.js')));

console.log('Unggah foto materi');
run("var unggah=[];ldCall=async function(p){unggah.push(p);return {ok:true,fileId:'FILE'+String(unggah.length).padStart(8,'0')}};");
await vm.runInContext("(async function(){var m={id:'LKPD-DDO-ALT-02',theory:[['A','a','data:image/jpeg;base64,/9j/AAAA'],['B','b'],['C','c','drive:KEEPKEEPKEEP']],quiz:[{q:'x',o:['a','b'],a:0,qi:'data:image/jpeg;base64,/9j/BBBB'}]};globalThis.__m=m;globalThis.__ubah=await lkgUploadModul(m)})()", ctx);
ok('foto materi dan foto soal diunggah (2 unggahan)', run('__ubah')===true && run('unggah.length')===2 && run("unggah.every(function(p){return p.kind==='soal'&&p.action==='upload'})"));
ok('foto materi menjadi drive:<id>', run("__m.theory[0][2].indexOf('drive:')===0&&__m.theory[1].length===2&&__m.theory[2][2]==='drive:KEEPKEEPKEEP'"));
ok('nama berkas foto materi memuat nomor topik', run("unggah.some(function(p){return /_materi1$/.test(p.nama)})"), run('JSON.stringify(unggah.map(function(p){return p.nama}))'));
ok('lkgBelumTerunggah: false setelah semua drive:', run("lkgBelumTerunggah(__m)")===false);
ok('lkgBelumTerunggah: true bila foto materi masih tmp:', run("lkgBelumTerunggah({theory:[['A','a','tmp:abc']],quiz:[{q:'x',o:['a','b'],a:0}]})")===true);
ok('lkgModAda mengenali foto materi saja', run("lkgModAda({theory:[['A','a','drive:ABCDEFGHIJKL']],quiz:[]})")===true && run("lkgModAda({theory:[['A','a']],quiz:[]})")===false);
run("ldCall=async function(){throw new Error('Jaringan putus')};");
await vm.runInContext("(async function(){var m={id:'X-8',theory:[['A','a','data:image/jpeg;base64,/9j/CCCC']],quiz:[]};globalThis.__m2=m;globalThis.__gal=null;try{await lkgUploadModul(m)}catch(e){globalThis.__gal=e.message}})()", ctx);
ok('unggah gagal: galat dilempar, penanda tetap', run('__gal')==='Jaringan putus' && run("__m2.theory[0][2].indexOf('data:')===0"));

console.log('Editor LKPD v2');
const iv = (src) => `var s0=JSON.parse(${JSON.stringify(JSON.stringify(src))});`;
ctx.__x07 = JSON.parse(JSON.stringify(x07));
run("var dv=lkEditorDefaults(__x07);dv.src=__x07;var sv=lkeInit(dv);dv.tab='tujuan';");
ok('lkvIs mengenali LKPD v2', run('lkvIs(dv)')===true && run("lkvIs({src:{id:'X-1'}})")===false && run('lkvIs({src:null})')===false);
ok('soal isian dari X-06 terbaca sebagai isian', run("sv.quiz.filter(function(q){return q.t==='isian'}).length")>=10);
const iss = run('lkeIssues(dv)');
ok('X-06: tidak ada masalah palsu (alokasi, menit langkah, isian)', iss.length === 0, JSON.stringify(iss.slice(0, 4)));
run("var mb=lkeBuild(dv);");
ok('simpan: objek v2 dipertahankan utuh', run("JSON.stringify(mb.v2)===JSON.stringify(__x07.v2)"));
ok('simpan: versi tetap 2, alokasi tetap', run("mb.version===2&&mb.duration===__x07.duration"));
ok('simpan: soal isian utuh (t, kunci, tol, g)', run("mb.quiz.every(function(q,i){var o=__x07.quiz[i];return q.t===o.t&&q.kunci===o.kunci&&(o.tol===undefined||q.tol===o.tol)&&JSON.stringify(q.g)===JSON.stringify(o.g)})"));
ok('simpan: langkah tetap bermenit 0 dan instruksi utuh', run("mb.steps.length===__x07.steps.length&&mb.steps.every(function(x,i){return x[1]===0&&x[2]===__x07.steps[i][2]})"));
ok('lkValidateModule menerima hasil simpan v2', run("lkValidateModule(mb)")==='', run('lkValidateModule(mb)'));
ok('modul non-v2 tetap divalidasi ketat (alokasi > 600 ditolak)', /Alokasi/.test(run("lkValidateModule(Object.assign({},mb,{v2:undefined}))")));
run("dv.S.theory[1][2]='tmp:abc';var mb2=lkeBuild(dv);");
ok('foto materi ikut modul tersimpan (elemen ketiga)', run("mb2.theory[1][2]==='tmp:abc'&&mb2.theory[0].length===2"));
run("dv.S.theory[1][2]='';var mb3=lkeBuild(dv);");
ok('foto dihapus: elemen ketiga hilang', run("mb3.theory[1].length===2"));
run("var fh=lkEditorForm(Object.assign(dv,{tab:'langkah'}));var fb=lkEditorForm(Object.assign(dv,{tab:'bahan'}));var fc=lkEditorForm(Object.assign(dv,{tab:'cek'}));var fs=lkEditorForm(Object.assign(dv,{tab:'soal'}));var ft=lkEditorForm(Object.assign(dv,{tab:'tujuan'}));");
ok('v2: tombol tambah/hapus/naik langkah, K3, pemeriksaan disembunyikan', run("!/data-lke-a=\"(up|down|del|add|paste-open)\" data-p=\"(steps|safety|checks)\"/.test(fh+fb+fc)"));
ok('v2: kolom menit langkah disembunyikan, catatan kunci tampil', run("fh.indexOf('steps.0.m')<0&&fh.indexOf('dikunci')>-1&&fb.indexOf('dikunci')>-1&&fc.indexOf('dikunci')>-1"));
ok('v2: teks langkah tetap bisa diedit', run("fh.indexOf('data-lke=\"steps.0.t\"')>-1&&fh.indexOf('data-lke=\"steps.0.i\"')>-1"));
ok('v2: tab Soal punya tombol + Isian angka', run("fs.indexOf('data-v=\"isian\">+ Isian angka')>-1"));
ok('v2: tab Teori punya tombol foto dan tombol tambah topik', run("ft.indexOf('data-lkv-a=\"m-img\"')>-1&&ft.indexOf('data-lke-a=\"add\" data-p=\"theory\"')>-1"));
ok('v2: tab Tujuan tetap bisa menambah tujuan', run("ft.indexOf('data-lke-a=\"add\" data-p=\"objectives\"')>-1"));
run("var dn={id:'X-9',src:{id:'X-9',theory:[['a','b']],quiz:[],objectives:['o'],steps:[['s',10,'i']],checks:[['c','k']],tools:['t'],safety:['k3'],symptoms:[]}};lkeInit(dn);dn.tab='langkah';var fn=lkEditorForm(dn);dn.tab='soal';var fn2=lkEditorForm(dn);");
ok('LKPD biasa: editor tidak dikunci dan tanpa tombol isian', run("fn.indexOf('dikunci')<0&&/data-lke-a=\"add\" data-p=\"steps\"/.test(fn)&&fn2.indexOf('+ Isian angka')<0"));
ok('LKPD biasa: pemeriksaan alokasi tetap berlaku', run("dn.S.duration=700;lkeIssues(dn).some(function(x){return /^Alokasi/.test(x.msg)})"));
ok('LKPD biasa: tidak menambah kolom v2 saat simpan', run("lkeBuild(dn).v2===undefined"));

console.log('Foto soal gerbang v2');
run("var dg=lkEditorDefaults(__x07);dg.src=__x07;var sg0=lkeInit(dg);dg.tab='soal';dg.gi=0;var hg=lkEditorForm(dg);");
ok('salinan gerbang dibuat tanpa menandai editor berubah', run("Array.isArray(sg0.gate)&&sg0.gate.length===__x07.v2.gate.qs.length&&lkeDirty(dg)===false"));
ok('tab Soal memuat bagian soal gerbang dengan tombol foto', run("hg.indexOf('Soal prasyarat masuk')>-1&&hg.indexOf('data-lkv-a=\"g-img\" data-i=\"0\" data-w=\"q\"')>-1"));
ok('pilihan gerbang PG punya tombol foto pilihan', run("hg.indexOf('foto pilihan A')>-1"));
run("sg0.gate[0].qi='data:image/jpeg;base64,/9j/GQ1';lkgFit(sg0.gate[0])[1]='data:image/jpeg;base64,/9j/GO1';var mg=lkeBuild(dg);");
ok('simpan: foto prasyarat masuk ke v2.gate.qs, kunci tetap', run("mg.v2.gate.qs[0].qi.indexOf('GQ1')>-1&&mg.v2.gate.qs[0].oi[1].indexOf('GO1')>-1&&JSON.stringify(mg.v2.gate.qs[0].a)===JSON.stringify(__x07.v2.gate.qs[0].a)&&mg.v2.gate.qs.length===__x07.v2.gate.qs.length"));
ok('simpan: soal gerbang tanpa foto tidak mendapat qi/oi', run("mg.v2.gate.qs.slice(1).every(function(q){return q.qi===undefined&&q.oi===undefined})"));
ok('foto gerbang dihitung belum terunggah', run("lkgBelumTerunggah(mg)")===true);
run("ldCall=async function(p){unggah.push(p);return {ok:true,fileId:'GATE'+String(unggah.length).padStart(8,'0')}};unggah.length=0;");
await vm.runInContext("(async function(){globalThis.__ug=await lkgUploadModul(mg)})()", ctx);
ok('unggah foto gerbang: 2 berkas, penanda jadi drive:', run("__ug===true&&unggah.length===2&&mg.v2.gate.qs[0].qi.indexOf('drive:')===0&&mg.v2.gate.qs[0].oi[1].indexOf('drive:')===0&&lkgBelumTerunggah(mg)===false"));
ok('nama berkas gerbang memuat nomor soal', run("unggah.some(function(p){return /_g1_soal$/.test(p.nama)})"));
ok('LKPD tanpa v2: tab Soal tanpa bagian gerbang', run("lkEditorForm(Object.assign(dn,{tab:'soal'})).indexOf('Soal prasyarat masuk')<0"));

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
