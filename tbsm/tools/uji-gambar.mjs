#!/usr/bin/env node
/* Uji gambar pada soal: (1) fungsi server foto-drive (upload kind:soal hanya guru/admin, getsoal hanya berkas bertanda soal),
   (2) fungsi klien soal-gambar.js dan pengemasan soal di banksoal.js.
   node tools/uji-gambar.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x ? ' -> ' + x : '')); } };

/* ---------- 1. Fungsi server ---------- */
const JPG = 'data:image/jpeg;base64,' + Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6]).toString('base64');
const drive = {};          // fileId -> {appProperties, bytes}
let nextId = 0;
process.env.GOOGLE_CLIENT_ID = 'x'; process.env.GOOGLE_CLIENT_SECRET = 'y'; process.env.GOOGLE_REFRESH_TOKEN = 'z';
process.env.DRIVE_FOLDER_ID = 'folder'; process.env.APPWRITE_ENDPOINT = 'https://aw.test/v1';
const labels = { guru1: ['guru'], admin1: ['admin'], siswa1: [] };
globalThis.fetch = async (url, opt = {}) => {
  url = String(url);
  const J = (o, st = 200) => ({ ok: st < 400, status: st, headers: { get: () => 'application/json' }, json: async () => o });
  if (url.startsWith('https://oauth2.googleapis.com/token')) return J({ access_token: 'T', expires_in: 3000 });
  if (url.startsWith('https://aw.test/v1/users/')) { const id = decodeURIComponent(url.split('/users/')[1]); return J({ labels: labels[id] || [] }); }
  if (url.startsWith('https://www.googleapis.com/upload/drive/v3/files')) {
    const id = 'F' + String(++nextId).padStart(12, '0');
    const body = Buffer.from(opt.body).toString('latin1');
    const m = /\{"name".*?\}\}|\{"name".*?\}(?=\r\n)/.exec(body);
    const meta = JSON.parse(body.slice(body.indexOf('{"name"'), body.indexOf('\r\n--', body.indexOf('{"name"'))));
    drive[id] = { appProperties: meta.appProperties, mimeType: meta.mimeType };
    return J({ id });
  }
  const mm = /files\/([^?]+)\?(.*)$/.exec(url);
  if (mm) {
    const f = drive[decodeURIComponent(mm[1])];
    if (!f) return J({}, 404);
    if (mm[2].startsWith('alt=media')) return { ok: true, status: 200, headers: { get: () => 'image/jpeg' }, arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff, 1, 2]).buffer };
    return J({ appProperties: f.appProperties, mimeType: f.mimeType });
  }
  return J({}, 404);
};
const fn = (await import(pathToFileURL(path.join(root, 'functions/foto-drive/src/main.js')).href)).default;
async function panggil(uid, body, key = 'KEY') {
  let out = null, st = 200;
  await fn({ req: { headers: { 'x-appwrite-user-id': uid, 'x-appwrite-key': key }, bodyJson: body }, res: { json: (o, s) => { out = o; st = s || 200; return o; } }, error: () => {} });
  return { out, st };
}
let r = await panggil('siswa1', { action: 'upload', kind: 'soal', data: JPG, nama: 'x' });
ok('siswa tidak boleh mengunggah gambar soal', r.st === 403);
r = await panggil('guru1', { action: 'upload', kind: 'soal', data: JPG, nama: 'Soal_Dasar_abc_soal' });
ok('guru boleh mengunggah gambar soal', r.out && r.out.ok && r.out.fileId, JSON.stringify(r.out));
const idSoal = r.out && r.out.fileId;
r = await panggil('admin1', { action: 'upload', kind: 'soal', data: JPG, nama: 'x' });
ok('admin boleh mengunggah gambar soal', r.out && r.out.ok);
r = await panggil('siswa1', { action: 'upload', data: JPG, nama: 'foto-bukti' });
ok('siswa tetap boleh mengunggah foto bukti praktik', r.out && r.out.ok);
const idBukti = r.out && r.out.fileId;
ok('berkas soal bertanda kind=soal', drive[idSoal] && drive[idSoal].appProperties.kind === 'soal');
ok('foto bukti tidak bertanda kind=soal', drive[idBukti] && !drive[idBukti].appProperties.kind);
r = await panggil('siswa1', { action: 'getsoal', fileId: idSoal });
ok('siswa boleh membaca gambar soal', r.out && r.out.ok && /^data:image\/jpeg;base64,/.test(r.out.data));
r = await panggil('siswa1', { action: 'getsoal', fileId: idBukti });
ok('getsoal menolak foto bukti praktik', r.st === 404);
r = await panggil('siswa1', { action: 'getsoal', fileId: 'F999999999999' });
ok('getsoal menolak berkas yang tidak ada', r.st === 404);
r = await panggil('siswa1', { action: 'getsoal', fileId: '../../etc' });
ok('getsoal menolak ID tidak valid', r.st === 400);
r = await panggil('guru1', { action: 'upload', kind: 'soal', data: JPG, nama: 'x' }, '');
ok('tanpa kunci fungsi, unggah soal ditolak dengan pesan jelas', r.st === 500 && /users\.read/.test(r.out.error), JSON.stringify(r.out));

/* ---------- 2. Klien ---------- */
const store = {};
const elStub = () => ({ addEventListener() {}, appendChild() {}, remove() {}, classList: { add() {}, remove() {}, toggle() {} }, style: {}, dataset: {}, querySelector: () => null, querySelectorAll: () => [], setAttribute() {}, click() {} });
const ctx = {
  console, setTimeout, clearTimeout, setInterval, clearInterval, Promise, JSON, Math, Date, Object, Array, String, Number, Error, Buffer,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  navigator: { onLine: true }, indexedDB: undefined,
  document: Object.assign(elStub(), { createElement: elStub, body: elStub(), head: elStub(), getElementById: () => null, querySelectorAll: () => [], hidden: false }),
  Cloud: { on: false }, S: { user: { id: 'g1', nama: 'Guru', kelas: '' }, tab: 'banksoal' }, CFG: {},
  ICO: {}, SOAL_TKA: [], toast: () => {}, esc: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  uid: () => 'u' + Math.random().toString(36).slice(2, 10), svg: () => '', $$: () => [], render() {}, isStaff: () => true, can: () => true, fromDoc: (d) => d, pick: (o, ks) => { const x = {}; ks.forEach((k) => { x[k] = o[k]; }); return x; },
  Jam: { now: () => Date.now() }, mmss: String, schAkunOk: () => true, schPeta: () => ({}), schHasilOk: () => true, schLabelModul: String, schKode: () => '', uiConfirm: async () => true,
  viewKatalog() {}, LD: { SIDE: 800, MAXC: 100000 }, ldCall: async () => ({ ok: true, fileId: 'F1' }), ldSlug: (s, n) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, n),
};
ctx.viewBeranda = () => ''; ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; ctx.scrollTo = () => {};
vm.createContext(ctx);
for (const f of ['js/banksoal.js', 'js/soal-gambar.js']) {
  try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}
const run = (code) => vm.runInContext(code, ctx);
ok('sgRefs mengumpulkan gambar soal dan pilihan', run("JSON.stringify(sgRefs({qi:'drive:a',oi:['','drive:b','','','drive:c']}))") === '["drive:a","drive:b","drive:c"]');
ok('sgAda: soal tanpa gambar', run("sgAda({q:'x',opts:['a']})") === false);
ok('sgOptIsi: pilihan hanya gambar dianggap terisi', run("sgOptIsi({opts:['','b'],oi:['drive:a','']},0)") === true && run("sgOptIsi({opts:['','b'],oi:['drive:a','']},1)") === true && run("sgOptIsi({opts:['','b'],oi:['drive:a','']},2)") === false);
run("var Q={id:'s1',tipe:'pg',mapel:'Dasar',q:'Perhatikan gambar',opts:['','B','C','D','E'],kunci:0,qi:'drive:AAAAAAAAAAAA',oi:['drive:BBBBBBBBBBBB','','','',''],bahas:''};bsPack('soal',Q);");
ok('payload (mode biasa) memuat qi dan oi', run("JSON.parse(Q.payload).qi==='drive:AAAAAAAAAAAA'&&JSON.parse(Q.payload).oi[0]==='drive:BBBBBBBBBBBB'&&JSON.parse(Q.payload).kunci===0"));
ok('payload soal tanpa gambar tidak menambah kolom qi/oi', run("var Z={id:'s2',tipe:'pg',mapel:'D',q:'x',opts:['a','b','c','d','e'],kunci:1};bsPack('soal',Z);JSON.parse(Z.payload).qi===undefined&&JSON.parse(Z.payload).oi===undefined"));
run("CFG.CBT_AMAN=true;Cloud.on=true;var Q2={id:'s3',tipe:'pg',mapel:'Dasar',q:'x',opts:['a','b','c','d','e'],kunci:2,qi:'drive:AAAAAAAAAAAA'};bsPack('soal',Q2);");
ok('payload mode aman memuat qi dan tidak memuat kunci', run("var p=JSON.parse(Q2.payload);p.qi==='drive:AAAAAAAAAAAA'&&p.kunci===undefined&&Q2.kc.kunci===2"));
run("CFG.CBT_AMAN=false;Cloud.on=false;");
ok('bsParse mengembalikan qi dan oi dari payload', run("var P=bsParse({id:'s9',payload:Q.payload});P.qi==='drive:AAAAAAAAAAAA'&&P.oi[0]==='drive:BBBBBBBBBBBB'"));
ok('bsQBody menampilkan gambar soal dan gambar pilihan', run("var h=bsQBody({id:'s1',tipe:'pg',q:'T',opts:['','B','C','D','E'],kunci:0,qi:'data:image/jpeg;base64,AAAA',oi:['data:image/jpeg;base64,BBBB','','','','']},null,'answer');h.indexOf('sg-q')>-1&&h.indexOf('sg-o')>-1"));
ok('soal bergambar tetap 5 pilihan (lolos aturan TKA)', run("bsAturanSalah(Q)")==='');
ok('bsNewForm membawa qi dan oi saat soal diubah', run("var F=bsNewForm(Q);F.qi==='drive:AAAAAAAAAAAA'&&F.oi[0]==='drive:BBBBBBBBBBBB'&&F.oi.length===5"));
ok('bsNewForm soal baru: tanpa gambar', run("var F2=bsNewForm(null);F2.qi===''&&F2.oi.every(function(x){return x===''})"));

/* alur kirim: gambar diunggah dulu, penanda diganti drive:, baru dokumen soal dikirim */
run("var kirim=[],unggah=[];Cloud.on=true;Cloud.db={createDocument:async function(db,col,id,data){kirim.push({col:col,id:id,data:data})},updateDocument:async function(db,col,id,data){kirim.push({col:col,id:id,data:data})}};CFG.DB='tbsm';ldCall=async function(p){unggah.push(p);return {ok:true,fileId:'FILE'+unggah.length+'AAAAAAAAAA'}};");
await vm.runInContext("(async function(){var o={id:'sx1abc',ts:1,tipe:'pg',mapel:'Dasar TBSM',topik:'',kelas:'',tujuan:'keduanya',aktif:true,oleh:'G',q:'Lihat',opts:['','b','c','d','e'],kunci:1,qi:'data:image/jpeg;base64,/9j/AAAA',oi:['data:image/jpeg;base64,/9j/BBBB','','','','']};bsPack('soal',o);var res=await bsRemote('soal',o);globalThis.__o=o;globalThis.__res=res})()", ctx);
ok('kirim soal bergambar berhasil', run('__res')===true, run('String(__o.err)'));
ok('gambar diunggah dua kali dengan kind=soal', run("unggah.length===2&&unggah.every(function(p){return p.kind==='soal'&&p.action==='upload'})"));
ok('penanda diganti menjadi drive:<id>', run("__o.qi.indexOf('drive:')===0&&__o.oi[0].indexOf('drive:')===0"));
ok('dokumen yang dikirim ke Appwrite tidak berisi data gambar', run("var pl=kirim[0].data.payload;pl.indexOf('data:image')<0&&JSON.parse(pl).qi.indexOf('drive:')===0"));
run("ldCall=async function(){throw new Error('Jaringan putus')};");
await vm.runInContext("(async function(){var o={id:'sx2abc',ts:1,tipe:'pg',mapel:'Dasar',tujuan:'keduanya',aktif:true,oleh:'G',q:'L',opts:['a','b','c','d','e'],kunci:1,qi:'data:image/jpeg;base64,/9j/AAAA'};bsPack('soal',o);kirim.length=0;globalThis.__res2=await bsRemote('soal',o);globalThis.__o2=o})()", ctx);
ok('unggah gagal: soal tidak dikirim tanpa gambarnya', run('__res2')===false&&run('kirim.length')===0);
ok('unggah gagal: penanda data tetap, soal masuk antrean', run("__o2.qi.indexOf('data:')===0&&bsQueueGet().indexOf('soal:sx2abc')>-1"));

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
