#!/usr/bin/env node
/* Uji pembeda LKPD Latihan dan Ujian tanpa peramban (berkas asli lkpd-mode.js dan lkpd-pandu.js dalam sandbox vm, stub DOM minimal).
   node tools/uji-pandu.mjs
   Yang diuji: konfigurasi baru, tahap Latihan lalu Ujian di satu LKPD (1 kali, 2 kali berturut-turut, remedial setelah Ujian gagal, jatah habis),
   foto wajib Ujian, tampilan Latihan berpemandu dan Ujian mandiri, panel Pengaturan, Paket Latihan/Ujian, simpan pengaturan. */
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
const el = () => ({ style: {}, dataset: {}, appendChild() {}, setAttribute() {}, classList: { toggle() {}, contains() { return false } } });
const ctx = vm.createContext({
  console, Math, JSON, Object, Array, Date, String, Number, isFinite, parseInt, setTimeout() {}, 
  document: { createElement: el, head: el(), getElementById: (i) => ctx.__ids[i] || null, addEventListener(t, f, c) { listeners.push({ t, f, c }) } },
});
ctx.__ids = {}; ctx.window = ctx; ctx.scrollTo = () => {};
const run = (code, name) => vm.runInContext(code, ctx, { filename: name });
const G = (code) => run(code, 'uji');

run(`
var S={user:{id:'u1',nama:'Budi',kelas:'X'},lkpd:[],results:[],kkm:75,kelas:'X',lkpdModules:[]};
var Cloud={on:false};var toasts=[],renders=0;
function toast(m){toasts.push(m)}function render(){renders++}function persist(){}function save(){}
var STAFF=false;function isStaff(){return STAFF}
function lkEsc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var LK={module:'U',tab:'kerja',detail:null,editor:null,preview:false};
function kelasBoleh(){return ['X']}
function lkcKelasInfo(){return {judul:'Kelas X',sub:''}}
function lkHasK(x){return x.koreksi!==undefined&&x.koreksi!==null&&x.koreksi!==''}
function lkNilai(x){return lkHasK(x)?Number(x.koreksi):x.score}
function schHasilList(a){return a}
function lkcRecs(m,staff){return schHasilList(S.lkpd||[]).filter(function(x){return x.moduleId===m.id&&(staff||x.sid===S.user.id)})}
function lkcModules(k,staff){return LKPD_MODULES.filter(function(m){return m.kelas===k&&(staff||(m.status==='published'&&m.active!==false))})}
function lkSerialize(m){var x=Object.assign({},m);delete x.r;delete x.d;return x}
var STORED=[];function lkModuleStore(m){STORED.push(m);var i=LKPD_MODULES.findIndex(function(x){return x.id===m.id});if(i<0)LKPD_MODULES.push(m);else LKPD_MODULES[i]=m}
function lkDraft(){return {}}
function lkBuildModule(v){return {id:v.id,checks:[]}}
function viewLKPD(){return '<div class="chips"></div>'}
var TS=1000,SC=80;function lkSubmit(){TS++;S.lkpd.push({id:'r'+TS,moduleId:LK.module,sid:'u1',ts:TS,score:SC,payload:'{}'});S.results.push({id:'h'+TS,ts:TS,tipe:'LKPD',sid:'u1',score:SC})}
function lkmFilter0(){}
function lk2Is(m){return !!(m&&m.v2)}
function lk2ModeFilter(h){return h}
function mk(id,mode,extra){return Object.assign({id:id,title:'LKPD '+id,kelas:'X',status:'published',active:true,mode:mode,checks:[['A','a','5 mm'],['B','b'],['C','c']],steps:[],quiz:[],fotoWajib:[0],v2:{ver:2}},extra||{})}
var LKPD_MODULES=[mk('U','ujian',{tahap:true,gKali:2}),mk('L','latihan')];
`, 'stub');
run(src('lkpd-mode.js'), 'lkpd-mode.js');
run(src('lkpd-pandu.js'), 'lkpd-pandu.js');

const rec = (mod, ts, skor, mode) => `S.lkpd.push({moduleId:'${mod}',sid:'u1',ts:${ts},score:${skor},payload:JSON.stringify({mode:'${mode}'})});`;
const reset = () => G(`S.lkpd=[];STAFF=false;toasts=[];STORED.length=0;LKPD_MODULES=[mk('U','ujian',{tahap:true,gKali:2}),mk('L','latihan')];LKM.edit=null;LKM.d=null;`);

/* Konfigurasi */
let c = JSON.parse(G(`JSON.stringify(lkmCfgBase(LKPD_MODULES[0]))`));
ok(c.tahap === true && c.gKali === 2 && c.fotoUjian === false && c.pandu === true && c.mode === 'ujian', 'lkmCfgBase membaca tahap, gKali, fotoUjian, pandu');
c = JSON.parse(G(`JSON.stringify(lkmCfg({mode:'latihan'}))`));
ok(c.tahap === false && c.gKali === 1 && c.pandu === true, 'bawaan: tidak bertahap, 1 kali, panduan aktif');
ok(G(`lkmCfg({gKali:'2'}).gKali`) === 2 && G(`lkmCfg({gKali:5}).gKali`) === 1, 'gKali hanya 1 atau 2');
ok(G(`lkmCfg({mode:'ujian',gerbang:'L'}).tahap`) === false, 'bidang gerbang lama (LKPD kedua) diabaikan');

/* Tahap: satu LKPD, mode dihitung per siswa */
const U = `LKPD_MODULES[0]`, modeU = () => G(`lkmCfg(${U}).mode`);
reset();
ok(G(`lkpGate(${U}).ok`) === false && modeU() === 'latihan', 'siswa baru: LKPD bertahap dimulai sebagai Latihan');
let cf = JSON.parse(G(`JSON.stringify(lkmCfg(${U}))`));
ok(cf.showKey === true && cf.pandu === true && cf.maxTry === 0 && cf.fotoUjian === false && cf.fase === 'latihan', 'tahap Latihan: kunci tampil, panduan aktif, tanpa batas, foto semua tidak dipaksa');
sama(G(`lkmLock(${U})`), '', 'tidak ada kunci: siswa langsung bisa mulai latihan');
G(rec('U', 10, 80, 'latihan'));
sama(G(`lkpGate(${U}).run`), 1, 'satu latihan lulus: 1/2');
ok(modeU() === 'latihan', 'butuh 2 berturut-turut: masih Latihan');
G(rec('U', 20, 60, 'latihan'));
sama(G(`lkpGate(${U}).run`), 0, 'latihan gagal memutus rangkaian');
G(rec('U', 30, 90, 'latihan') + rec('U', 40, 75, 'latihan'));
ok(G(`lkpGate(${U}).ok`) === true && modeU() === 'ujian', 'dua berturut-turut (90, 75 tepat KKM): LKPD yang sama menjadi Ujian');
cf = JSON.parse(G(`JSON.stringify(lkmCfg(${U}))`));
ok(cf.fase === 'ujian' && cf.mode === 'ujian', 'tahap Ujian: pengaturan Ujian berlaku');
sama(G(`lkmUsed(${U})`), 0, 'pengumpulan Latihan tidak menghabiskan kesempatan Ujian');
/* Guru melihat konfigurasi dasar */
G(`STAFF=true`);
ok(modeU() === 'ujian' && G(`lkmCfg(${U}).tahap`) === true, 'guru selalu melihat konfigurasi dasar (Ujian)');
sama(G(`lkmLock(${U})`), '', 'guru tidak terkunci');
G(`STAFF=false`);
/* Syarat 1 kali */
reset(); G(`${U}.gKali=1`); G(rec('U', 10, 80, 'latihan'));
ok(G(`lkpGate(${U}).ok`) === true && modeU() === 'ujian', 'syarat 1 kali: satu latihan lulus cukup');
/* Remedial: Ujian gagal membawa siswa kembali ke Latihan */
G(rec('U', 20, 50, 'ujian'));
let gr = JSON.parse(G(`JSON.stringify(lkpGate(${U}))`));
ok(gr.remedial === true && gr.ok === false && gr.run === 0 && modeU() === 'latihan', 'Ujian belum kompeten: kembali ke Latihan, latihan lama tidak dihitung (remedial)');
G(rec('U', 30, 85, 'latihan'));
ok(G(`lkpGate(${U}).ok`) === true && G(`lkpGate(${U}).remedial`) === true && modeU() === 'ujian', 'latihan sesudah ujian gagal membuka Ujian ulang');
/* Ujian lulus tidak mengembalikan ke Latihan */
reset(); G(`${U}.gKali=1`); G(rec('U', 10, 80, 'latihan') + rec('U', 20, 90, 'ujian'));
ok(G(`lkpGate(${U}).remedial`) === false && modeU() === 'ujian', 'Ujian lulus: tidak remedial, tetap Ujian');
/* Jatah Ujian habis: tetap Ujian */
reset(); G(`${U}.gKali=1;${U}.maxTry=1`); G(rec('U', 20, 50, 'ujian'));
ok(G(`lkpGate(${U})`) === null && modeU() === 'ujian', 'jatah Ujian habis: tidak kembali ke Latihan (tidak ada percobaan baru)');
reset(); G(`${U}.gKali=1;${U}.maxTry=2`); G(rec('U', 20, 50, 'ujian'));
ok(G(`lkpGate(${U}).remedial`) === true && modeU() === 'latihan', 'masih ada jatah: remedial berlaku');
/* Tidak bertahap */
reset(); G(`${U}.tahap=false`);
ok(G(`lkpGate(${U})`) === null && modeU() === 'ujian', 'tanpa tahap: langsung Ujian');
reset(); G(`${U}.mode='latihan'`);
ok(G(`lkpGate(${U})`) === null && modeU() === 'latihan', 'tahap hanya untuk mode Ujian');
/* Pengumpulan ditandai sesuai tahap saat kirim */
reset();
ok(G(`lkmCfg(${U}).mode`) === 'latihan', 'sebelum kirim: tahap Latihan (pengumpulan akan bertanda latihan)');

/* Kartu */
reset();
let ex = JSON.parse(G(`JSON.stringify(lkpCardExtra(${U},lkmCfg(${U}),[]))`));
ok(/Tahap 1: Latihan 0\/2/.test(ex.tags) && ex.acts === '', 'kartu: Tahap 1 Latihan 0/2, tanpa tombol ke LKPD lain');
G(rec('U', 10, 80, 'latihan') + rec('U', 20, 80, 'latihan'));
ex = JSON.parse(G(`JSON.stringify(lkpCardExtra(${U},lkmCfg(${U}),[]))`));
ok(/Tahap 2: Ujian/.test(ex.tags) && !/ulang/.test(ex.tags), 'kartu: Tahap 2 Ujian');
ok(G(`lkpCardExtra(LKPD_MODULES[1],lkmCfg(LKPD_MODULES[1]),[])`) === null, 'kartu latihan biasa tanpa tambahan');
ok(/Bertahap: Latihan ≥ KKM 2× berturut-turut lalu Ujian/.test(G(`lkpStaffTag(${U},lkmCfgBase(${U}))`)), 'tag guru memuat alur bertahap');
sama(G(`lkpStaffTag(LKPD_MODULES[1],lkmCfg(LKPD_MODULES[1]))`), '', 'tag guru kosong untuk latihan');
/* Spanduk di dalam LKPD */
reset();
ok(/Tahap 1 dari 2\.<\/b> Capai nilai 75 dua kali berturut-turut \(0\/2\)/.test(G(`lkpBannerTahap(${U},lkmCfg(${U}))`)), 'spanduk siswa: tahap 1 dari 2');
G(rec('U', 10, 80, 'latihan') + rec('U', 20, 80, 'latihan'));
ok(/Tahap 2 dari 2/.test(G(`lkpBannerTahap(${U},lkmCfg(${U}))`)), 'spanduk siswa: tahap 2 dari 2');
G(`STAFF=true`);
ok(/Bertahap:<\/b> siswa memulai dari Latihan/.test(G(`lkpBannerTahap(${U},lkmCfg(${U}))`)), 'spanduk guru: penjelasan alur');
sama(G(`lkpBannerTahap(LKPD_MODULES[1],lkmCfg(LKPD_MODULES[1]))`), '', 'spanduk kosong bila tidak bertahap');

/* Foto wajib */
reset();
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0], 'ujian biasa: foto wajib sesuai pengaturan');
G(`LKPD_MODULES[0].fotoUjian=true;LKPD_MODULES[0].tahap=false`);
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0, 1, 2], 'ujian + fotoUjian: semua komponen wajib foto');
G(`LKPD_MODULES[0].tahap=true`);
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0], 'tahap Latihan (belum lulus): foto semua komponen belum dipaksa');
G(rec('U', 10, 90, 'latihan') + rec('U', 20, 90, 'latihan'));
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0, 1, 2], 'tahap Ujian (latihan lulus): semua komponen wajib foto');
G(`S.lkpd=[]`);
G(`LKPD_MODULES[0].mode='latihan'`);
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0], 'latihan tidak memaksa foto semua komponen');

/* Tampilan */
const H = `<section class="card"><h2>Identitas</h2></section><section class="card"><div class="lk2-cek"><b>Alat</b><small class="note">petunjuk</small><label class="f">Standar manual<input>` + `<small class="lk-acuan">Acuan: 5 mm</small></label></div></section>`;
reset(); G(`LK.tab='kerja'`);
let hp = run(`lkpPandu(${JSON.stringify(H)},lkmCfg({mode:'latihan'}))`, 'x');
ok(/Latihan berpemandu/.test(hp) && hp.indexOf('lkp-pandu') < hp.indexOf('Identitas'), 'Latihan: kartu panduan di atas lembar kerja');
ok(/<details class="lkp-b"><summary>Bantuan: lihat angka acuan<\/summary>Acuan: 5 mm<\/details>/.test(hp), 'Latihan: angka acuan dibuka lewat Bantuan');
ok(/<small class="note">petunjuk<\/small>/.test(hp), 'Latihan: petunjuk komponen tetap tampil');
ok(run(`lkpPandu(${JSON.stringify(H)},lkmCfg({mode:'latihan',pandu:false}))`, 'x') === H, 'panduan dimatikan guru: tampilan tidak berubah');
G(`LK.tab='materi'`);
ok(run(`lkpPandu(${JSON.stringify(H)},lkmCfg({mode:'latihan'}))`, 'x') === H, 'panduan hanya di tab Lembar Kerja');
G(`LK.tab='kerja'`);
let hm = run(`lkpMandiri(${JSON.stringify(H)},lkmCfg({mode:'ujian',fotoUjian:true,maxTry:2}))`, 'x');
ok(!/lk-acuan|5 mm/.test(hm), 'Ujian: angka acuan selalu disembunyikan');
ok(/Ujian mandiri/.test(hm) && /saksi guru/.test(hm) && /semua<\/b> komponen/.test(hm) && /2 kali/.test(hm), 'Ujian: kartu aturan mandiri (saksi, foto semua, kesempatan)');
ok(!/semua<\/b> komponen/.test(run(`lkpMandiri(${JSON.stringify(H)},lkmCfg({mode:'ujian'}))`, 'x')), 'Ujian tanpa fotoUjian: tidak menyebut foto semua komponen');
/* lkmFilter menyalurkan ke dua fungsi */
ok(/Latihan berpemandu/.test(run(`lkmFilter(${JSON.stringify(H)},lkmCfg({mode:'latihan'}))`, 'x')), 'lkmFilter mode Latihan memakai lkpPandu');
ok(/Ujian mandiri/.test(run(`lkmFilter(${JSON.stringify(H)},lkmCfg({mode:'ujian'}))`, 'x')), 'lkmFilter mode Ujian v2 memakai lkpMandiri');

/* Panel Pengaturan */
reset(); G(`LKM.edit='U';LKM.d={tampil:true,mode:'ujian',maxTry:1,showKey:false,hideTeori:true,hideLangkah:true,hidePetunjuk:true,tahap:true,gKali:2,fotoUjian:false,pandu:true,buka:'',tutup:'',semua:false,fotoWajib:[0]}`);
let pn = G(`lkmPanel()`);
ok(/data-act="lkp-paket" data-v="latihan"/.test(pn) && /data-act="lkp-paket" data-v="ujian"/.test(pn), 'panel: tombol Paket Latihan dan Paket Ujian');

ok(!/<select data-lkm="gerbang">/.test(pn) && !/lkp-salin/.test(pn), 'panel: tidak ada pilihan LKPD lain dan tidak ada tombol salinan');
ok(/data-lkm="fotoUjian"/.test(pn) && /data-lkm="tahap"[^>]* checked/.test(pn) && /data-lkm="gKali"/.test(pn), 'panel Ujian: foto semua komponen, Latihan dulu (tercentang), syarat nilai');
G(`LKM.d.mode='latihan'`);
pn = G(`lkmPanel()`);
ok(/data-lkm="pandu"/.test(pn) && !/data-lkm="tahap"/.test(pn), 'panel Latihan: opsi berpemandu, tanpa opsi tahap');

/* Paket cepat lewat klik */
const klik = (act, v) => {
  const btn = { dataset: { act, v } };
  const ev = { target: { closest: (s) => (s.indexOf('data-act') > -1 ? btn : null) }, stopPropagation() {} };
  ctx.__ev = ev;
  listeners.filter((l) => l.t === 'click').forEach((l) => { try { vm.runInContext('1', ctx); l.f(ev); } catch (e) { console.log('galat klik', e.message); } });
};
G(`STAFF=true`);
klik('lkp-paket', 'ujian');
let d = JSON.parse(G(`JSON.stringify(LKM.d)`));
ok(d.mode === 'ujian' && d.maxTry === 1 && d.showKey === false && d.hideTeori && d.hideLangkah && d.hidePetunjuk && d.fotoUjian === true, 'Paket Ujian: 1 kesempatan, sembunyikan isi, foto semua');
ok(d.tahap === true, 'Paket Ujian tidak menghapus pilihan Latihan dulu');
klik('lkp-paket', 'latihan');
d = JSON.parse(G(`JSON.stringify(LKM.d)`));
ok(d.mode === 'latihan' && d.maxTry === 0 && d.showKey === true && d.pandu === true && d.fotoUjian === false && d.tahap === false, 'Paket Latihan: tanpa batas, kunci tampil, tanpa tahap');
G(`STAFF=false`); G(`LKM.d.mode='ujian'`);
klik('lkp-paket', 'latihan');
ok(G(`LKM.d.mode`) === 'ujian', 'siswa tidak bisa memakai paket');

/* Simpan pengaturan */
reset(); G(`STAFF=true`);
G(`lkmApply(LKPD_MODULES[0],{mode:'ujian',maxTry:1,showKey:false,hideTeori:true,hideLangkah:true,hidePetunjuk:true,tahap:true,gKali:'2',fotoUjian:true,pandu:true,tampil:true,fotoWajib:[0]},true)`);
let st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.tahap === true && st.gKali === 2 && st.fotoUjian === true && st.mode === 'ujian' && st.gerbang === undefined, 'simpan: tahap, syarat, foto ujian tersimpan pada LKPD yang sama');
ok(G(`STORED.length`) === 1, 'simpan tidak membuat LKPD baru');
G(`lkmApply(LKPD_MODULES[0],{mode:'latihan',maxTry:0,showKey:true,tahap:true,gKali:2,tampil:true,fotoWajib:[0]},true)`);
st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.tahap === undefined && st.gKali === undefined, 'simpan sebagai Latihan: tahap dibuang');
G(`lkmApply(LKPD_MODULES[1],{mode:'ujian',maxTry:1,tahap:true,fotoUjian:true,tampil:true,fotoWajib:[]},false)`);
st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.fotoUjian === true && st.tahap === undefined, 'terapkan ke semua LKPD: foto ujian ikut, tahap tidak ikut');

/* Penataan panel: bagian bernomor mengikuti mode, ringkasan efek untuk siswa */
const bagian = (h) => [...h.matchAll(/<span class="lkp-no">(\d+)<\/span>([^<]*)<\/h4>/g)].map((x) => x[1] + ' ' + x[2]);
reset(); G(`LKM.edit='U';LKM.d={tampil:true,mode:'ujian',maxTry:1,showKey:false,hideTeori:true,hideLangkah:true,hidePetunjuk:true,tahap:true,gKali:2,fotoUjian:true,pandu:true,buka:'',tutup:'',semua:false,fotoWajib:[0]}`);
let pu = G(`lkmPanel()`);
sama(bagian(pu), ['1 Paket dan mode', '2 Aturan Ujian', '3 Latihan sebelum Ujian', '4 Jadwal dan kunci pertemuan', '5 Foto bukti per komponen', '6 Terapkan dan simpan'], 'panel Ujian: enam bagian bernomor berurutan');
G(`LKM.d.mode='latihan'`);
let pl = G(`lkmPanel()`);
sama(bagian(pl), ['1 Paket dan mode', '2 Aturan Latihan', '3 Jadwal dan kunci pertemuan', '4 Foto bukti per komponen', '5 Terapkan dan simpan'], 'panel Latihan: lima bagian, tanpa aturan Ujian dan tahap');
ok(!/data-lkm="maxTry"|data-lkm="hideTeori"|data-lkm="tahap"|data-lkm="fotoUjian"/.test(pl), 'panel Latihan tidak memuat kontrol khusus Ujian');
ok(/data-lkm="showKey"/.test(pl) && /data-lkm="pandu"/.test(pl) && !/data-lkm="showKey"/.test(pu), 'kontrol khusus Latihan hanya di panel Latihan');
ok((pu.match(/Foto bukti wajib per komponen<\/span>/g) || []).length === 0, 'label ganda di dalam bagian foto dibuang');
for (const k of ['tampil', 'buka', 'tutup', 'semua', 'maxTry', 'hideTeori', 'hideLangkah', 'hidePetunjuk', 'fotoUjian', 'tahap', 'gKali']) ok(new RegExp('data-lkm="' + k + '"').test(pu), 'panel Ujian tetap memuat data-lkm=' + k);
ok(/data-act="lkm-mode" data-v="latihan"/.test(pu) && /data-act="lkm-save"/.test(pu) && /data-act="lkm-clear"/.test(pu) && /data-lkm-foto="0"/.test(pu), 'tombol Mode, Simpan, Kosongkan jadwal, dan centang foto tetap ada');
ok(pu.indexOf('lkp-ring') < pu.indexOf('lkp-sec'), 'ringkasan berada di atas bagian bernomor');
if (process.env.DUMP_PANEL) { fs.writeFileSync(process.env.DUMP_PANEL + '-ujian.html', pu); fs.writeFileSync(process.env.DUMP_PANEL + '-latihan.html', pl); }
/* Ringkasan */
let rg = G(`lkpRingkas(LKPD_MODULES[0],LKM.d)`);
ok(/tidak terbatas|Boleh diulang/.test(rg) && /tidak masuk<\/b> Rekap/.test(rg) && /Kunci dan pembahasan: <b>tidak tampil/.test(rg), 'ringkasan Latihan');
G(`LKM.d.mode='ujian'`);
rg = G(`lkpRingkas(LKPD_MODULES[0],LKM.d)`);
ok(/1 kali<\/b>; nilai <b>masuk/.test(rg) && /Disembunyikan: <b>teori, penjelasan langkah, petunjuk komponen, angka acuan/.test(rg) && /wajib pada semua 3 komponen/.test(rg) && /Latihan dulu \(KKM 2 kali berturut-turut\), lalu otomatis Ujian di LKPD ini/.test(rg), 'ringkasan Ujian: kesempatan, disembunyikan, foto, prasyarat: ' + rg);
G(`LKM.d.maxTry=0;LKM.d.fotoUjian=false;LKM.d.fotoWajib=[];LKM.d.tahap=false;LKM.d.hideTeori=false;LKM.d.tampil=false`);
rg = G(`lkpRingkas(LKPD_MODULES[0],LKM.d)`);
ok(/tidak terbatas/.test(rg) && /foto bukti: <b>opsional|Foto bukti: <b>opsional/.test(rg) && /Alur: <b>langsung Ujian/.test(rg) && /draft/.test(rg) && !/<b>teori/.test(rg), 'ringkasan Ujian longgar: tanpa batas, foto opsional, langsung Ujian, draft');
/* Ringkasan hidup: berubah saat pilihan diubah, tanpa menggambar ulang panel */
const ring = { innerHTML: '' }; ctx.__ids['lkp-ring'] = ring;
const ubah = (nama, val, tipe) => { const t = { dataset: { lkm: nama }, type: tipe || 'checkbox', checked: val, value: val, closest: () => null }; listeners.filter((l) => l.t === 'change').forEach((l) => l.f({ target: t })); };
G(`LKM.d.mode='ujian';LKM.d.maxTry=0;LKM.d.fotoUjian=false;renders=0`);
ubah('fotoUjian', true);
ok(/wajib pada semua 3 komponen/.test(ring.innerHTML) && G(`renders`) === 0, 'ringkasan diperbarui saat opsi diubah tanpa render ulang');
ubah('maxTry', '2', 'select-one');
ok(/2 kali<\/b>/.test(ring.innerHTML), 'ringkasan mengikuti kesempatan mengirim');
/* Mencentang Latihan dulu menggambar ulang panel supaya kolom Syarat nilai muncul */
G(`renders=0`); ubah('tahap', true);
ok(G(`renders`) === 1 && G(`LKM.d.tahap`) === true, 'mencentang Latihan dulu: panel digambar ulang (kolom syarat nilai tampil)');
ok(/data-lkm="gKali"/.test(G(`lkmPanel()`)), 'setelah dipilih, kolom Syarat nilai tersedia');
G(`renders=0`); ubah('gKali', '2', 'select-one');
ok(G(`renders`) === 0 && G(`LKM.d.gKali`) === '2', 'mengubah syarat nilai tidak perlu render ulang');
ok(!/Isi paket<\/summary>[\s\S]*Isi paket/.test(pu), 'keterangan paket diringkas dalam bagian lipat');

/* Pengiriman: tanda mode mengikuti tahap, nilai Latihan tidak masuk rekap */
reset(); G(`LK.module='U';LK.tab='kerja';TS=1000;S.results=[];${U}.gKali=2;SC=80`);
G(`lkSubmit()`);
ok(G(`lkmModeOf(S.lkpd[0])`) === 'latihan' && G(`S.results.length`) === 0, 'kirim di tahap Latihan: bertanda latihan, tidak masuk Rekap nilai');
G(`lkSubmit()`);
ok(G(`lkmModeOf(S.lkpd[1])`) === 'latihan' && modeU() === 'ujian', 'dua latihan lulus: LKPD yang sama berubah menjadi Ujian');
ok(G(`toasts.length`) === 0, 'pesan Ujian terbuka tampil setelah jeda (tidak menimpa pesan terkirim)');
G(`SC=90;lkSubmit()`);
ok(G(`lkmModeOf(S.lkpd[2])`) === 'ujian' && G(`S.results.length`) === 1 && G(`lkmUsed(${U})`) === 1, 'kirim di tahap Ujian: bertanda ujian, masuk Rekap nilai, memakai satu kesempatan');
G(`SC=40;${U}.maxTry=0;lkSubmit()`);
ok(modeU() === 'latihan', 'Ujian gagal: LKPD yang sama kembali ke Latihan (remedial)');


/* Waktu: alokasi total (810 menit = 18 JP) berbeda dari waktu satu sesi (135 menit per pertemuan) */
{
  const tm = fs.readFileSync(path.join(root, 'js', 'lkpd-timer.js'), 'utf8').split('\n');
  const ambil = (awal, akhir) => tm.slice(tm.findIndex((l) => l.startsWith(awal)), tm.findIndex((l) => l.startsWith(akhir))).join('\n');
  G(ambil('function lktLimit', 'function lktTarget') + '\n' + ambil('function lktTarget', 'function lktBtnText'));
  G(`var V2=mk('V','ujian',{duration:810,unit:'u',v2:{jp:18,pertemuan:[1,2,3,4,5,6].map(function(n){return {n:n,jp:3,menit:135}})}});LKPD_MODULES.push(V2);LK.module='V';STAFF=false;S.lkpd=[]`);
  sama(G(`lkmSesiMenit(V2)`), 135, 'waktu satu sesi LKPD v2 = menit per pertemuan, bukan 810');
  sama(G(`lkmWaktuLabel(V2)`), '18 JP · 6 pertemuan', 'kartu LKPD v2 menampilkan JP dan pertemuan, bukan 810 menit');
  sama(G(`lkmSesiMenit({duration:45})`), 45, 'LKPD tanpa pertemuan: waktu sesi = durasi');
  G(`var V3=mk('V3','latihan',{duration:810,unit:'u',v2:{jp:18,pertemuan:[{n:1,jp:3,menit:135,sembunyi:true},{n:2,jp:3,menit:135,praktik:12},{n:3,jp:3,menit:135,praktik:8},{n:4,jp:3,menit:135,sembunyi:true}]}});LKPD_MODULES.push(V3)`);
  sama(G(`lkmSesiMenit(V3)`), 20, 'waktu sesi = total praktik 20 menit (12 + 8); pertemuan tersembunyi tidak dihitung');
  ok(/Perkiraan 20 menit praktik \(semua kegiatan\) · waktu bebas/.test(G(`lktTarget(V3)`)), 'pewaktu Latihan memakai total praktik 20 menit');
  sama(G(`lkmWaktuLabel({duration:45})`), '45 menit', 'LKPD tanpa pertemuan: label menit');
  sama(G(`lktLimit()`), 135 * 60, 'pewaktu Ujian: batas merah 135 menit');
  ok(/Target 135 menit per pertemuan/.test(G(`lktTarget(V2)`)), 'pewaktu Ujian: teks target per pertemuan');
  G(`V2.mode='latihan'`);
  sama(G(`lktLimit()`), 0, 'pewaktu Latihan: tidak ada batas (waktu bebas, tidak merah)');
  ok(/Perkiraan 135 menit per pertemuan · waktu bebas/.test(G(`lktTarget(V2)`)), 'pewaktu Latihan: perkiraan, waktu bebas');
  ok(/135 menit/.test(G(`lktTarget(V2)`)) && !/810/.test(G(`lktTarget(V2)`)), 'angka 810 tidak muncul di pewaktu');
  G(`LKPD_MODULES.pop();LK.module='U'`);
}

console.log(`\nUji pembeda Latihan dan Ujian: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
