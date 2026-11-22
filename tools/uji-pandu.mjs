#!/usr/bin/env node
/* Uji pembeda LKPD Latihan dan Ujian tanpa peramban (berkas asli lkpd-mode.js dan lkpd-pandu.js dalam sandbox vm, stub DOM minimal).
   node tools/uji-pandu.mjs
   Yang diuji: konfigurasi baru, gerbang Latihan ke Ujian (1 kali, 2 kali berturut-turut, remedial setelah Ujian gagal, rujukan tidak tampil),
   foto wajib Ujian, tampilan Latihan berpemandu dan Ujian mandiri, panel Pengaturan, Paket Latihan/Ujian, simpan pengaturan, salinan Latihan. */
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
  document: { createElement: el, head: el(), addEventListener(t, f, c) { listeners.push({ t, f, c }) } },
});
ctx.window = ctx; ctx.scrollTo = () => {};
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
function lkSubmit(){}
function lkmFilter0(){}
function lk2Is(m){return !!(m&&m.v2)}
function lk2ModeFilter(h){return h}
function mk(id,mode,extra){return Object.assign({id:id,title:'LKPD '+id,kelas:'X',status:'published',active:true,mode:mode,checks:[['A','a','5 mm'],['B','b'],['C','c']],steps:[],quiz:[],fotoWajib:[0],v2:{ver:2}},extra||{})}
var LKPD_MODULES=[mk('U','ujian',{gerbang:'L',gKali:2}),mk('L','latihan')];
`, 'stub');
run(src('lkpd-mode.js'), 'lkpd-mode.js');
run(src('lkpd-pandu.js'), 'lkpd-pandu.js');

const rec = (mod, ts, skor, mode) => `S.lkpd.push({moduleId:'${mod}',sid:'u1',ts:${ts},score:${skor},payload:JSON.stringify({mode:'${mode}'})});`;
const reset = () => G(`S.lkpd=[];STAFF=false;toasts=[];STORED.length=0;LKPD_MODULES=[mk('U','ujian',{gerbang:'L',gKali:2}),mk('L','latihan')];LKM.edit=null;LKM.d=null;`);

/* Konfigurasi */
let c = JSON.parse(G(`JSON.stringify(lkmCfg(LKPD_MODULES[0]))`));
ok(c.gerbang === 'L' && c.gKali === 2 && c.fotoUjian === false && c.pandu === true, 'lkmCfg membaca gerbang, gKali, fotoUjian, pandu');
c = JSON.parse(G(`JSON.stringify(lkmCfg({mode:'latihan'}))`));
ok(c.gerbang === '' && c.gKali === 1 && c.pandu === true, 'bawaan: tanpa gerbang, 1 kali, panduan aktif');
ok(G(`lkmCfg({gKali:'2'}).gKali`) === 2 && G(`lkmCfg({gKali:5}).gKali`) === 1, 'gKali hanya 1 atau 2');

/* Gerbang */
reset();
let g = JSON.parse(G(`JSON.stringify(lkpGate(LKPD_MODULES[0]).ok)`));
ok(g === false, 'tanpa latihan gerbang tertutup');
ok(/^Ujian terbuka setelah latihan mencapai nilai 75 dua kali berturut-turut \(0\/2\)$/.test(G(`lkmLock(LKPD_MODULES[0])`)), 'pesan kunci gerbang 0/2: ' + G(`lkmLock(LKPD_MODULES[0])`));
G(rec('L', 10, 80, 'latihan'));
sama(G(`lkpGate(LKPD_MODULES[0]).run`), 1, 'satu latihan lulus: 1/2');
ok(G(`lkpGate(LKPD_MODULES[0]).ok`) === false, 'butuh 2 berturut-turut');
G(rec('L', 20, 60, 'latihan'));
sama(G(`lkpGate(LKPD_MODULES[0]).run`), 0, 'latihan gagal memutus rangkaian');
G(rec('L', 30, 90, 'latihan') + rec('L', 40, 75, 'latihan'));
ok(G(`lkpGate(LKPD_MODULES[0]).ok`) === true, 'dua berturut-turut (90, 75 tepat KKM) membuka ujian');
sama(G(`lkmLock(LKPD_MODULES[0])`), '', 'tidak ada kunci saat gerbang terbuka');
ok(G(`lkcRecs(LKPD_MODULES[0],false).length`) === 0, 'rekaman latihan tidak dihitung sebagai pengumpulan ujian');
/* Guru tidak terkunci */
G(`S.lkpd=[];STAFF=true`);
sama(G(`lkmLock(LKPD_MODULES[0])`), '', 'guru tidak terkena gerbang');
/* Syarat 1 kali */
reset(); G(`LKPD_MODULES[0].gKali=1`); G(rec('L', 10, 80, 'latihan'));
ok(G(`lkpGate(LKPD_MODULES[0]).ok`) === true, 'syarat 1 kali: satu latihan lulus cukup');
/* Remedial */
G(rec('U', 20, 50, 'ujian'));
let gr = JSON.parse(G(`JSON.stringify(lkpGate(LKPD_MODULES[0]))`));
ok(gr.remedial === true && gr.ok === false && gr.run === 0, 'Ujian belum kompeten: latihan lama tidak dihitung (remedial)');
ok(/^Latih lagi dulu:/.test(G(`lkmLock(LKPD_MODULES[0])`)), 'pesan remedial');
G(rec('L', 30, 85, 'latihan'));
ok(G(`lkpGate(LKPD_MODULES[0]).ok`) === true && G(`lkpGate(LKPD_MODULES[0]).remedial`) === true, 'latihan sesudah ujian gagal membuka ujian ulang');
/* Ujian lulus tidak menutup lagi */
reset(); G(`LKPD_MODULES[0].gKali=1`); G(rec('L', 10, 80, 'latihan') + rec('U', 20, 90, 'ujian'));
ok(G(`lkpGate(LKPD_MODULES[0]).remedial`) === false && G(`lkpGate(LKPD_MODULES[0]).ok`) === true, 'ujian lulus: tidak remedial');
/* Jatah Ujian habis: gerbang tidak menahan lagi */
reset(); G(`LKPD_MODULES[0].gKali=1;LKPD_MODULES[0].maxTry=1`); G(rec('U', 20, 50, 'ujian'));
ok(G(`lkpGate(LKPD_MODULES[0])`) === null && G(`lkmLock(LKPD_MODULES[0])`) === '', 'jatah Ujian habis: tanpa gerbang (tidak ada percobaan baru yang perlu dibuka)');
reset(); G(`LKPD_MODULES[0].gKali=1;LKPD_MODULES[0].maxTry=2`); G(rec('U', 20, 50, 'ujian'));
ok(G(`lkpGate(LKPD_MODULES[0]).remedial`) === true, 'masih ada jatah: remedial berlaku');
/* Rujukan tidak tersedia */
reset(); G(`LKPD_MODULES[1].status='draft'`);
ok(G(`lkpGate(LKPD_MODULES[0])`) === null && G(`lkmLock(LKPD_MODULES[0])`) === '', 'latihan rujukan tersembunyi: gerbang dilewati, tidak mengunci siswa selamanya');
reset(); G(`LKPD_MODULES[0].gerbang='XYZ'`);
ok(G(`lkpGate(LKPD_MODULES[0])`) === null, 'rujukan tidak ada: tanpa gerbang');
reset(); G(`LKPD_MODULES[0].gerbang='U'`);
ok(G(`lkpGate(LKPD_MODULES[0])`) === null, 'gerbang ke diri sendiri diabaikan');
reset(); G(`LKPD_MODULES[0].mode='latihan'`);
ok(G(`lkpGate(LKPD_MODULES[0])`) === null, 'gerbang hanya untuk mode Ujian');

/* Kartu */
reset();
let ex = JSON.parse(G(`JSON.stringify(lkpCardExtra(LKPD_MODULES[0],lkmCfg(LKPD_MODULES[0]),[]))`));
ok(/Latih lagi 0\/2/.test(ex.tags) && /data-v="L"/.test(ex.acts) && /Buka latihan/.test(ex.acts), 'kartu: Latih lagi dan tombol ke latihan');
G(rec('L', 10, 80, 'latihan') + rec('L', 20, 80, 'latihan'));
ex = JSON.parse(G(`JSON.stringify(lkpCardExtra(LKPD_MODULES[0],lkmCfg(LKPD_MODULES[0]),[]))`));
ok(/Siap ujian/.test(ex.tags) && ex.acts === '', 'kartu: Siap ujian');
ok(G(`lkpCardExtra(LKPD_MODULES[1],lkmCfg(LKPD_MODULES[1]),[])`) === null, 'kartu latihan tanpa tambahan');
ok(/Prasyarat: LKPD L .* 2× berturut-turut/.test(G(`lkpStaffTag(LKPD_MODULES[0],lkmCfg(LKPD_MODULES[0]))`)), 'tag guru memuat gerbang');
sama(G(`lkpStaffTag(LKPD_MODULES[1],lkmCfg(LKPD_MODULES[1]))`), '', 'tag guru kosong untuk latihan');

/* Foto wajib */
reset();
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0], 'ujian biasa: foto wajib sesuai pengaturan');
G(`LKPD_MODULES[0].fotoUjian=true`);
sama(G(`lkpFotoWajib(LKPD_MODULES[0])`), [0, 1, 2], 'ujian + fotoUjian: semua komponen wajib foto');
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
reset(); G(`LKM.edit='U';LKM.d={tampil:true,mode:'ujian',maxTry:1,showKey:false,hideTeori:true,hideLangkah:true,hidePetunjuk:true,gerbang:'L',gKali:2,fotoUjian:false,pandu:true,buka:'',tutup:'',semua:false,fotoWajib:[0]}`);
let pn = G(`lkmPanel()`);
ok(/data-act="lkp-paket" data-v="latihan"/.test(pn) && /data-act="lkp-paket" data-v="ujian"/.test(pn), 'panel: tombol Paket Latihan dan Paket Ujian');
ok(/<select data-lkm="gerbang">/.test(pn) && /<option value="L" selected>/.test(pn) && /data-lkm="gKali"/.test(pn), 'panel Ujian: pilih gerbang (hanya LKPD Latihan) dan syarat');
ok(!/<option value="U"/.test(pn), 'panel: LKPD sendiri tidak jadi pilihan gerbang');
ok(/data-lkm="fotoUjian"/.test(pn) && /data-act="lkp-salin"/.test(pn), 'panel Ujian: foto semua komponen dan tombol salinan Latihan');
G(`LKM.d.mode='latihan'`);
pn = G(`lkmPanel()`);
ok(/data-lkm="pandu"/.test(pn) && !/data-lkm="gerbang"/.test(pn), 'panel Latihan: opsi berpemandu, tanpa gerbang');

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
ok(d.gerbang === 'L', 'Paket Ujian tidak menghapus gerbang yang sudah dipilih');
klik('lkp-paket', 'latihan');
d = JSON.parse(G(`JSON.stringify(LKM.d)`));
ok(d.mode === 'latihan' && d.maxTry === 0 && d.showKey === true && d.pandu === true && d.fotoUjian === false && d.gerbang === '', 'Paket Latihan: tanpa batas, kunci tampil, tanpa gerbang');
G(`STAFF=false`); G(`LKM.d.mode='ujian'`);
klik('lkp-paket', 'latihan');
ok(G(`LKM.d.mode`) === 'ujian', 'siswa tidak bisa memakai paket');

/* Simpan pengaturan */
reset(); G(`STAFF=true`);
G(`lkmApply(LKPD_MODULES[0],{mode:'ujian',maxTry:1,showKey:false,hideTeori:true,hideLangkah:true,hidePetunjuk:true,gerbang:'L',gKali:'2',fotoUjian:true,pandu:true,tampil:true,fotoWajib:[0]},true)`);
let st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.gerbang === 'L' && st.gKali === 2 && st.fotoUjian === true && st.mode === 'ujian', 'simpan: gerbang, syarat, foto ujian tersimpan pada LKPD');
G(`lkmApply(LKPD_MODULES[0],{mode:'latihan',maxTry:0,showKey:true,gerbang:'L',gKali:2,tampil:true,fotoWajib:[0]},true)`);
st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.gerbang === undefined && st.gKali === undefined, 'simpan sebagai Latihan: gerbang dibuang');
G(`lkmApply(LKPD_MODULES[0],{mode:'ujian',maxTry:1,gerbang:'U',tampil:true,fotoWajib:[]},true)`);
ok(G(`STORED[STORED.length-1].gerbang`) === undefined, 'gerbang ke diri sendiri tidak disimpan');
G(`lkmApply(LKPD_MODULES[1],{mode:'ujian',maxTry:1,gerbang:'U',fotoUjian:true,tampil:true,fotoWajib:[]},false)`);
st = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(st.fotoUjian === true && st.gerbang === undefined, 'terapkan ke semua LKPD: foto ujian ikut, gerbang tidak ikut');

/* Salinan Latihan */
reset(); G(`STAFF=true;LKM.edit='U';LKM.d={mode:'ujian',gerbang:''}`);
klik('lkp-salin');
let cp = JSON.parse(G(`JSON.stringify(STORED[STORED.length-1])`));
ok(cp.id === 'U-L' && cp.mode === 'latihan' && cp.status === 'published' && cp.maxTry === 0 && cp.gerbang === undefined && /\(Latihan\)$/.test(cp.title), 'salinan Latihan: id U-L, mode latihan, tampil');
ok(JSON.stringify(cp.checks) === G(`JSON.stringify(LKPD_MODULES[0].checks)`) && cp.v2 && cp.v2.ver === 2, 'salinan memuat isi dan data v2');
ok(G(`LKM.d.gerbang`) === 'U-L', 'salinan langsung dipilih sebagai gerbang');
G(`LKM.edit='U';LKM.d={mode:'ujian',gerbang:''}`);
klik('lkp-salin');
ok(G(`STORED[STORED.length-1].id`) === 'U-L2', 'salinan kedua memakai akhiran -L2 (id unik)');
G(`LKPD_MODULES.push(mk('ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789','ujian'));LKM.edit='ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789'`);
klik('lkp-salin');
ok(/^[A-Za-z0-9_-]{2,32}$/.test(G(`STORED[STORED.length-1].id`)), 'id salinan dari ID panjang tetap sah (maks 32)');
G(`STAFF=false`); const nS = G(`STORED.length`); klik('lkp-salin'); ok(G(`STORED.length`) === nS, 'siswa tidak bisa membuat salinan');

/* Pengiriman dikunci gerbang */
reset(); G(`LK.module='U';LK.tab='kerja'`);
G(`lkSubmit()`);
ok(G(`toasts.length`) === 1 && /Ujian terbuka setelah latihan/.test(G(`toasts[0]`)), 'kirim Ujian saat gerbang tertutup ditolak dengan pesan');

console.log(`\nUji pembeda Latihan dan Ujian: ${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
