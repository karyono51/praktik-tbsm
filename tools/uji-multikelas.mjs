#!/usr/bin/env node
/* Uji sesi beberapa kelas dan pembagian ruang berkapasitas (js/banksoal.js dan js/ruang.js). node tools/uji-multikelas.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };

const soal = [
  { id: 'a', aktif: true, tujuan: 'ujian', kelas: 'X' }, { id: 'b', aktif: true, tujuan: 'ujian', kelas: 'XI' },
  { id: 'c', aktif: true, tujuan: 'keduanya', kelas: 'XII' }, { id: 'd', aktif: true, tujuan: 'ujian', kelas: '' }, { id: 'e', aktif: false, tujuan: 'ujian', kelas: 'X' },
];
const siswa = [];
const ctx = { console, JSON, Math, Date, Object, Array, String, Number, Set, S: { users: siswa }, bsSoalAll: () => soal, bsAturanSalah: () => false,
  document: { addEventListener() {}, getElementById: () => null, querySelector: () => null },
  esc: (s) => String(s == null ? '' : s), hasRole: (u, r) => (u.peran || []).includes(r), bsDtv: () => '', bsWaktu: String, toast() {}, uiConfirm: async () => true };
ctx.window = ctx; vm.createContext(ctx);
const bank = fs.readFileSync(path.join(root, 'js/banksoal.js'), 'utf8');
vm.runInContext(bank.match(/var BS_TINGKAT[\s\S]*?function bsSfKls\(f\)\{return bsKls\(f\)\}/)[0], ctx);
vm.runInContext(bank.match(/function bsPool\(mode,kelas\)\{[\s\S]*?\n\}/)[0], ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/ruang.js'), 'utf8'), ctx, { filename: 'ruang.js' });
const run = (code) => vm.runInContext(code, ctx);
const ids = (l) => l.map((q) => q.id).join('');

console.log('Kelas sesi');
ok("'ALL', kosong, dan semua tiga tingkat = semua kelas", ['ALL', '', undefined, 'X,XI,XII', 'XII,X,XI'].every((k) => run(`bsKls({kelas:${JSON.stringify(k)}})`).length === 0));
ok('satu tingkat', run("bsKls({kelas:'XI'})").join() === 'XI');
ok('dua tingkat diurutkan X, XI, XII dan spasi dimaafkan', run("bsKls({kelas:'XII, X'})").join() === 'X,XII');
ok('bsKlsCocok: tingkat terpilih saja', run("bsKlsCocok({kelas:'X,XI'},'XI')") && !run("bsKlsCocok({kelas:'X,XI'},'XII')") && run("bsKlsCocok({kelas:'ALL'},'XII')") && !run("bsKlsCocok({kelas:'XI'},'X')"));
ok('label', run("bsKlsLabel({kelas:'ALL'})") === 'semua' && run("bsKlsLabel({kelas:'ALL'},true)") === 'Semua' && run("bsKlsLabel({kelas:'XI'})") === 'XI' && run("bsKlsLabel({kelas:'X,XII'})") === 'X dan XII');
ok('bsKlsNilai: kosong atau lengkap menjadi ALL', run("bsKlsNilai([])") === 'ALL' && run("bsKlsNilai(['X','XI','XII'])") === 'ALL' && run("bsKlsNilai(['XII','X'])") === 'X,XII');
ok('bsSesiUntuk memakai bsKlsCocok', /bsKlsCocok\(s,kelas\)/.test(bank));

console.log('Soal untuk beberapa kelas');
ok('pool satu tingkat (soal tanpa kelas ikut)', ids(run("bsPool('ujian','XI')")) === 'bd');
ok('pool dua tingkat', ids(run("bsPool('ujian',['X','XI'])")) === 'abd');
ok('pool semua kelas', ids(run("bsPool('ujian','')")) === 'abcd' && ids(run("bsPool('ujian',[])")) === 'abcd');

console.log('Pembagian ruang');
const mk = (n, kelas, aw = 0) => Array.from({ length: n }, (_, i) => ({ id: kelas + '-' + String(i + aw).padStart(3, '0'), kelas }));
const R = (...kap) => kap.map((k, i) => ({ id: 'r' + i, nama: 'R' + i, kap: k, sis: [] }));
const jml = (h) => h.per.map((p) => p.length).join();
const kelasDi = (h, i) => [...new Set(h.per[i].map((x) => x.split('-')[0]))].join('+');
const uni = (h) => h.per.flat().concat(h.sisa);
{
  const ros = mk(90, 'XI');
  let h = run('rgBagi')(ros, R(30, 30, 30), 'rata'); ok('satu kelas 90 siswa ke 3 ruang berkapasitas 30: 30,30,30', jml(h) === '30,30,30' && !h.sisa.length, jml(h));
  h = run('rgBagi')(ros, R(0, 0, 0), 'rata'); ok('tanpa kapasitas: dibagi rata 30,30,30', jml(h) === '30,30,30', jml(h));
  h = run('rgBagi')(mk(10, 'XI'), R(0, 0, 0), 'rata'); ok('10 siswa 3 ruang: 4,3,3 (sisa dibagi dari ruang pertama)', jml(h) === '4,3,3', jml(h));
  h = run('rgBagi')(mk(40, 'XI'), R(36, 36, 36), 'rata'); ok('kapasitas longgar: tetap rata 14,13,13 (bukan 36,4,0)', jml(h) === '14,13,13', jml(h));
  h = run('rgBagi')(mk(40, 'XI'), R(36, 36, 36), 'penuh'); ok('mode penuh: 36,4,0', jml(h) === '36,4,0', jml(h));
  h = run('rgBagi')(mk(40, 'XI'), R(30, 0), 'penuh'); ok('mode penuh: ruang tanpa batas menampung sisa (30,10)', jml(h) === '30,10', jml(h));
  h = run('rgBagi')(ros, R(30, 30), 'rata'); ok('kapasitas kurang: 60 ditempatkan, 30 belum muat', jml(h) === '30,30' && h.sisa.length === 30, jml(h) + ' sisa ' + h.sisa.length);
  h = run('rgBagi')(mk(10, 'XI'), R(2, 0, 4), 'rata'); ok('campuran kapasitas dan tanpa batas: 2 + 4 terisi, sisanya ke ruang tanpa batas', jml(h) === '2,4,4' || jml(h) === '2,3,5' || (h.per[0].length === 2 && h.per[2].length <= 4 && uni(h).length === 10), jml(h));
  const dua = mk(40, 'XI').concat(mk(30, 'XII'));
  h = run('rgBagi')(dua, R(35, 35), 'rata'); ok('dua kelas rata (urut kelas): ruang 1 = XI 35, ruang 2 = XI 5 + XII 30', jml(h) === '35,35' && kelasDi(h, 0) === 'XI' && kelasDi(h, 1) === 'XI+XII', jml(h) + ' / ' + kelasDi(h, 0) + ' / ' + kelasDi(h, 1));
  h = run('rgBagi')(dua, R(35, 35), 'campur'); ok('mode campur: tiap ruang berisi kedua kelas', jml(h) === '35,35' && kelasDi(h, 0) === 'XI+XII' && kelasDi(h, 1) === 'XI+XII', jml(h));
  h = run('rgBagi')(dua, R(60, 10), 'campur'); ok('mode campur menghormati kapasitas', h.per[1].length <= 10 && h.per[0].length <= 60 && uni(h).length === 70, jml(h));
  h = run('rgBagi')(ros, R(30, 30, 30), 'rata'); ok('tiap siswa tepat sekali, tanpa ganda', new Set(uni(h)).size === 90 && uni(h).length === 90);
  h = run('rgBagi')(ros, [], 'rata'); ok('tanpa ruang: semua belum ditempatkan', h.sisa.length === 90);
  h = run('rgBagi')([], R(30, 30), 'rata'); ok('tanpa siswa: ruang kosong', jml(h) === '0,0' && !h.sisa.length);
  const f = run('rgBagi')(mk(3, 'X'), R(0), 'tidak-dikenal'); ok('mode tak dikenal diperlakukan seperti rata', jml(f) === '3');
}

console.log('Penyimpanan dan pemeriksaan ruang');
{
  const pak = run("rgPak([{id:'r1',nama:'Lab 1',kap:36.7,sis:['a'],pk:'p'},{id:'r2',nama:'Lab 2',kap:0,sis:[]},{id:'r3',nama:'Lab 3',kap:5000,sis:[]}])");
  ok('kapasitas tersimpan (dibulatkan ke bawah, maksimal 999) dan kosong tidak disimpan', pak[0].kap === 36 && !('kap' in pak[1]) && pak[2].kap === 999, JSON.stringify(pak));
  ok('rgCek menolak ruang melebihi kapasitas', /melebihi kapasitas 2/.test(run("rgCek({ruang:[{id:'r1',nama:'Lab 1',kap:2,sis:['a','b','c']}]})")));
  ok('rgCek menerima ruang tepat penuh dan ruang tanpa batas', run("rgCek({ruang:[{id:'r1',nama:'Lab 1',kap:2,sis:['a','b']},{id:'r2',nama:'Lab 2',sis:['c','d','e']}]})") === '');
  siswa.push({ id: 'u1', kelas: 'XI' }, { id: 'u2', kelas: 'XI' }, { id: 'u3', kelas: 'XII' });
  ok('komposisi kelas isi ruang', run("rgKomp({sis:['u1','u2','u3']})") === 'XI 2 · XII 1');
}
{
  const bk = [];
  ['XI', 'XII', 'X'].forEach((k) => { for (let i = 0; i < 3; i++) bk.push({ id: k + i, kelas: k, nama: 'S' + k + i, peran: ['siswa'], aktif: true, sekolah: 'MEDINA' }); });
  siswa.length = 0; bk.forEach((u) => siswa.push(u));
  const ros = run("rgRoster({kelas:'X,XI',sekolah:'MEDINA'})");
  ok('rgRoster untuk sesi dua tingkat memuat X dan XI saja, urut kelas lalu nama', ros.map((u) => u.id).join() === 'X0,X1,X2,XI0,XI1,XI2', ros.map((u) => u.id).join());
  ok('rgRoster semua kelas memuat semuanya', run("rgRoster({kelas:'ALL',sekolah:'MEDINA'})").length === 9);
}

console.log('Rombel');
{
  const mkU = (rom, tk, n, sek = 'MEDINA') => Array.from({ length: n }, (_, i) => ({ id: rom + '#' + String(i + 1).padStart(2, '0'), nama: 'Nama ' + String(i + 1).padStart(2, '0'), kelas: tk, sekolah: sek, aktif: true, peran: ['siswa'] }));
  const t1 = mkU('X TSM-1', 'X', 36), t2 = mkU('X TSM-2', 'X', 36), u1 = mkU('XI TSM-1', 'XI', 10), tanpa = mkU('XII', 'XII', 2), nonaktif = mkU('X TSM-3', 'X', 2).map((u) => ({ ...u, aktif: false }));
  siswa.length = 0; [...t2, ...u1, ...tanpa, ...t1, ...nonaktif].forEach((u) => siswa.push(u));   // sengaja acak urutannya
  ctx.AKD = { loaded: true, loading: false, D: { kelas: [
    { id: 'k1', nama: 'X TSM-1', tingkat: 'X', sekolah: 'MEDINA', aktif: true, anggota: t1.map((u) => u.id) },
    { id: 'k2', nama: 'X TSM-2', tingkat: 'X', sekolah: 'MEDINA', aktif: true, anggota: t2.map((u) => u.id) },
    { id: 'k3', nama: 'X TSM-3', tingkat: 'X', sekolah: 'MEDINA', aktif: true, anggota: nonaktif.map((u) => u.id) },
    { id: 'k4', nama: 'XI TSM-1', tingkat: 'XI', sekolah: 'MEDINA', aktif: true, anggota: u1.map((u) => u.id) },
    { id: 'k5', nama: 'X Lama', tingkat: 'X', sekolah: 'MEDINA', aktif: false, anggota: [] },
    { id: 'k6', nama: 'X DF-1', tingkat: 'X', sekolah: 'DF', aktif: true, anggota: [] }] } };
  ctx.akKelasAll = () => ctx.AKD.D.kelas;
  run('rgPetaReset')();
  ok('rgGrup: nama rombel, atau tingkat bila belum punya rombel', run("rgGrup(S.users.filter(function(u){return u.id==='X TSM-1#01'})[0])") === 'X TSM-1' && run("rgGrup(S.users.filter(function(u){return u.id==='XII#01'})[0])") === 'XII');
  const urut = run("rgUrut(S.users)").map((u) => u.id);
  ok('rgUrut: tingkat X dulu, lalu per rombel, lalu nama; rombel tidak bercampur', urut[0] === 'X TSM-1#01' && urut[35] === 'X TSM-1#36' && urut[36] === 'X TSM-2#01' && urut.indexOf('XI TSM-1#01') > urut.indexOf('X TSM-2#36') && urut.at(-1).startsWith('XII#'), urut.slice(0, 3).join() + ' ... ' + urut.slice(-2).join());
  ok('rgRombelList: sesuai tingkat, sekolah, dan aktif', run("rgRombelList({kelas:'X',sekolah:'MEDINA'})").map((k) => k.id).join() === 'k1,k2,k3' && run("rgRombelList({kelas:'X,XI',sekolah:'MEDINA'})").map((k) => k.id).join() === 'k1,k2,k3,k4' && run("rgRombelList({kelas:'ALL',sekolah:'DF'})").map((k) => k.id).join() === 'k6,k1,k2,k3,k4'.split(',').filter((x) => x === 'k6').join());
  ctx.__f = { rmb: ['k1', 'k2', 'k3'] };
  const dr = run('rgDariRombel(__f)');
  ok('rgDariRombel: gabungan anggota rombel terpilih, siswa nonaktif dilewati, urut rombel', dr.length === 72 && dr[0].id === 'X TSM-1#01' && dr[36].id === 'X TSM-2#01', dr.length);
  ctx.__f = { rmb: ['k1', 'k1'] };
  ok('rombel dipilih dobel tidak menggandakan siswa', run('rgDariRombel(__f)').length === 36);
  const ros = dr;
  let h = run('rgBagi')(ros, R(40, 40), 'rata');
  ok('2 rombel (36 + 36) di 2 ruang: satu rombel utuh per ruang', jml(h) === '36,36' && run('rgKomp')({ sis: h.per[0] }) === 'X TSM-1 36' && run('rgKomp')({ sis: h.per[1] }) === 'X TSM-2 36', run('rgKomp')({ sis: h.per[0] }));
  h = run('rgBagi')(ros, R(24, 24, 24), 'rata');
  ok('72 siswa di 3 ruang x 24: satu rombel disebar ke dua ruang, urut', jml(h) === '24,24,24' && run('rgKomp')({ sis: h.per[1] }) === 'X TSM-1 12 · X TSM-2 12' && run('rgKomp')({ sis: h.per[2] }) === 'X TSM-2 24', [0, 1, 2].map((i) => run('rgKomp')({ sis: h.per[i] })).join(' | '));
  h = run('rgBagi')(mkU('X TSM-1', 'X', 36), R(12, 12, 12), 'rata');
  ok('satu rombel 36 siswa disebar ke 3 ruang x 12', jml(h) === '12,12,12' && !h.sisa.length);
  h = run('rgBagi')(ros, R(36, 36), 'campur');
  ok('mode campur: tiap ruang berisi dua rombel', run('rgKomp')({ sis: h.per[0] }) === 'X TSM-1 18 · X TSM-2 18', run('rgKomp')({ sis: h.per[0] }));
  ctx.AKD.D.kelas = [];
  run('rgPetaReset')();
  ok('tanpa data rombel: kembali memakai tingkat', run("rgGrup(S.users.filter(function(u){return u.id==='X TSM-1#01'})[0])") === 'X');
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
