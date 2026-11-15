#!/usr/bin/env node
/* Uji soal grup (stimulus bersama): soal-grup.js, serta sambungannya di banksoal.js, lkpd-soal.js, lkpd-editor.js, cetak-soal.js.
   node tools/uji-grup.mjs */
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
  Cloud: { on: false }, S: { user: { id: 'g1', nama: 'Guru', kelas: 'X' }, tab: 'banksoal', lkpdModules: [] }, CFG: {}, ICO: {}, SOAL_TKA: [],
  toast: (m) => { ctx.__toasts.push(m); }, __toasts: [], esc, lkEsc: esc,
  uid: () => 'u' + Math.random().toString(36).slice(2, 10), svg: () => '', $$: () => [], $: () => null, render() {}, isStaff: () => true, can: () => true,
  fromDoc: (d) => d, pick: (o, ks) => { const x = {}; ks.forEach((k) => { x[k] = o[k]; }); return x; },
  Jam: { now: () => Date.now() }, mmss: String, schAkunOk: () => true, schPeta: () => ({}), schHasilOk: () => true, schLabelModul: String, schKode: () => '', schNorm: String,
  uiConfirm: async () => true, viewKatalog() {}, LD: { SIDE: 800, MAXC: 100000 }, ldCall: async () => ({ ok: true, fileId: 'F1' }),
  ldSlug: (s, n) => String(s || '').replace(/[^A-Za-z0-9]+/g, '-').slice(0, n),
  LK: { editor: null }, LKM: { reveal: {} }, LKPD_MODULES: [], LKPD_DEFAULT_MODULES: [], lkBuiltin: () => false,
  lkRefreshModules() {}, lkBuildModule: (v) => v, lkDraft: () => ({}), lkRead: () => ({}), lkmCur: () => null,
  LOGO: 'data:image/png;base64,LOGO', SEK: { nama: 'SMKS Contoh', program: 'TBSM', alamat: 'Jl. Contoh 1' },
  lkioExport() {}, uiOk: () => true, lkEditorDefaults: () => ({}), lkSerialize: (m) => m, lkModuleStore() {}, lkeLive() {},
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {}; ctx.scrollTo = () => {};
vm.createContext(ctx);
const run = (code) => vm.runInContext(code, ctx);
for (const f of ['js/banksoal.js', 'js/soal-gambar.js', 'js/lkpd-soal.js', 'js/lkpd-editor.js', 'js/lkpd-gambar.js', 'js/cetak-soal.js', 'js/soal-grup.js']) {
  try { vm.runInContext(baca(f), ctx, { filename: f }); }
  catch (e) { ok('memuat ' + f, false, e.message); }
}

console.log('Pembantu umum');
run("var L=[{id:'a',gs:'G1',st:'Teks',gn:2},{id:'b',gs:'G1',st:'Teks',gn:1},{id:'c'},{id:'d',gs:'G2',si:'drive:X'},{id:'e',gs:'G1',st:'Teks',gn:3}];");
ok('sgrAda: perlu penanda grup dan isi stimulus', run("sgrAda({gs:'g',st:'x'})&&sgrAda({gs:'g',si:'drive:x'})&&!sgrAda({gs:'g'})&&!sgrAda({st:'x'})"));
ok('sgrSpan: deretan berurutan dengan grup sama', run("JSON.stringify(sgrSpan([{gs:'A'},{gs:'A'},{gs:'A'},{gs:'B'}],1))")==='[0,2]');
ok('sgrSpan: soal tanpa grup = dirinya sendiri', run("JSON.stringify(sgrSpan([{},{gs:'A'}],0))")==='[0,0]');
ok('sgrAwal hanya benar di anggota pertama', run("sgrAwal([{gs:'A',st:'x'},{gs:'A',st:'x'}],0)&&!sgrAwal([{gs:'A',st:'x'},{gs:'A',st:'x'}],1)"));
ok('sgrLabel menulis rentang nomor', run("sgrLabel([{},{gs:'A',st:'x'},{gs:'A',st:'x'},{gs:'A',st:'x'}],2)")==='untuk soal no. 2-4');
ok('sgrAturList: urutan akhir b,a,e,c,d', run("sgrAturList(L).map(function(x){return x.id}).join(',')")==='b,a,e,c,d', run("sgrAturList(L).map(function(x){return x.id}).join(',')"));
ok('sgrAturList: berfungsi lewat fungsi pengambil (id -> soal)', run("var M={};L.forEach(function(x){M[x.id]=x});sgrAturList(['a','c','b'],function(i){return M[i]}).join(',')")==='b,a,c');
run("var P=[];for(var i=0;i<4;i++)P.push({id:'g'+i,gs:'G'});for(var j=0;j<6;j++)P.push({id:'s'+j});");
ok('sgrPilih: tidak melebihi jumlah dan memuat grup utuh bila muat', run("var r=sgrPilih(P,6);r.length===6&&r.filter(function(q){return q.gs}).length===4"));
ok('sgrPilih: jumlah lebih sedikit dari grup mengisi dari soal biasa dulu', run("var r2=sgrPilih(P,3);r2.length===3&&r2.every(function(q){return !q.gs})"));
ok('sgrPilih: n=0 mengambil semua', run("sgrPilih(P,0).length")===10);
ok('sgrPilih: tidak ada soal ganda', run("var r3=sgrPilih(P,7),seen={};r3.every(function(q){if(seen[q.id])return false;seen[q.id]=1;return true})"));
ok('sgrBox memuat teks dan keterangan, aman dari HTML', run("var bx=sgrBox({gs:'g',st:'Baca <b>ini</b>\\nBaris 2'},'untuk soal no. 1-2');bx.indexOf('&lt;b&gt;ini')>-1&&bx.indexOf('<br>Baris 2')>-1&&bx.indexOf('untuk soal no. 1-2')>-1"));
ok('sgrBox: tanpa stimulus = kosong', run("sgrBox({q:'x'},'')")==='');
ok('sgrBox memuat gambar stimulus', run("sgrBox({gs:'g',si:'data:image/jpeg;base64,STIM'},'').indexOf('STIM')>-1"));

console.log('Gambar stimulus ikut mesin gambar');
ok('sgRefs mengumpulkan si', run("JSON.stringify(sgRefs({qi:'drive:a',si:'drive:s',oi:['drive:b']}))")==='["drive:a","drive:b","drive:s"]');
ok('sgAda: soal hanya bergambar stimulus dihitung', run("sgAda({si:'drive:s'})")===true);
run("var unggah=[];ldCall=async function(p){unggah.push(p);return {ok:true,fileId:'FILE'+String(unggah.length).padStart(8,'0')}};");
await vm.runInContext("(async function(){var m={id:'G-1',quiz:[{q:'a',o:['x','y'],a:0,gs:'G',st:'t',si:'data:image/jpeg;base64,/9j/SSSS'},{q:'b',o:['x','y'],a:1,gs:'G',st:'t',si:'data:image/jpeg;base64,/9j/SSSS'}]};globalThis.__m=m;globalThis.__u=await lkgUploadModul(m)})()", ctx);
ok('LKPD: gambar stimulus diunggah dan penanda jadi drive:', run("__u===true&&__m.quiz[0].si.indexOf('drive:')===0&&__m.quiz[1].si.indexOf('drive:')===0"));
ok('lkgModRefs memuat gambar stimulus', run("lkgModRefs({quiz:[{q:'a',si:'drive:S'}]}).join()")==='drive:S');
run("sgGet=function(k){return Promise.resolve(SG.mem[k]||null)};");
run("unggah.length=0;var tmpRef='tmp:abc';sgPut(tmpRef,'data:image/jpeg;base64,/9j/TTTT');");
await vm.runInContext("(async function(){var a=await sgUploadRef('tmp:abc','n1'),b=await sgUploadRef('tmp:abc','n2');globalThis.__same=(a===b)})()", ctx);
ok('penanda tmp: yang sama (grup) diunggah sekali', run('__same')===true && run('unggah.length')===1, run('unggah.length'));
await vm.runInContext("(async function(){var o={id:'sx1abc',mapel:'Dasar',q:'q',si:'data:image/jpeg;base64,/9j/UUUU'};globalThis.__ub=await sgUploadAll(o);globalThis.__o=o})()", ctx);
ok('Bank soal: sgUploadAll mengunggah si', run("__ub===true&&__o.si.indexOf('drive:')===0"));
await vm.runInContext("(async function(){var o={id:'sx2',si:'data:image/jpeg;base64,/9j/VVVV'};await sgStash(o);globalThis.__st=o})()", ctx);
ok('sgStash tanpa IndexedDB membiarkan data (tetap terunggah saat sinkron)', run("__st.si.indexOf('data:')===0||__st.si.indexOf('tmp:')===0"));

console.log('Bank soal: penyimpanan');
run("var Q={id:'q1',tipe:'pg',mapel:'D',q:'x',opts:['a','b','c','d','e'],kunci:1,gs:'G9',gn:2,st:'Bacaan',si:'drive:SSSSSSSSSSSS'};bsPack('soal',Q);var PL=JSON.parse(Q.payload);");
ok('payload (mode biasa) memuat gs, gn, st, si', run("PL.gs==='G9'&&PL.gn===2&&PL.st==='Bacaan'&&PL.si==='drive:SSSSSSSSSSSS'&&PL.kunci===1"));
run("CFG.CBT_AMAN=true;Cloud.on=true;var Q2={id:'q2',tipe:'pg',mapel:'D',q:'x',opts:['a','b','c','d','e'],kunci:2,gs:'G9',gn:1,st:'Bacaan'};bsPack('soal',Q2);var PL2=JSON.parse(Q2.payload);");
ok('payload mode aman memuat stimulus dan tidak memuat kunci', run("PL2.gs==='G9'&&PL2.st==='Bacaan'&&PL2.kunci===undefined&&Q2.kc.kunci===2"));
run("CFG.CBT_AMAN=false;Cloud.on=false;var Q3={id:'q3',tipe:'pg',mapel:'D',q:'x',opts:['a','b','c','d','e'],kunci:0};bsPack('soal',Q3);");
ok('soal tanpa grup: payload tanpa kolom grup', run("var p3=JSON.parse(Q3.payload);p3.gs===undefined&&p3.st===undefined&&p3.si===undefined"));
ok('bsParse mengembalikan gs, gn, st, si', run("var P=bsParse({id:'q1',payload:Q.payload});P.gs==='G9'&&P.gn===2&&P.st==='Bacaan'&&P.si==='drive:SSSSSSSSSSSS'"));

console.log('Bank soal: form dan penyebaran');
ok('bsNewForm membawa gs/st/si/gn saat soal diubah', run("var F=bsNewForm(Q);F.gs==='G9'&&F.st==='Bacaan'&&F.si==='drive:SSSSSSSSSSSS'&&F.gn===2"));
ok('bsNewForm soal baru: tanpa grup', run("var F0=bsNewForm(null);F0.gs===''&&F0.st===''&&F0.si===''"));
run("BS.D.soal=[{id:'m1',tipe:'pg',mapel:'D',q:'a',opts:['a','b','c','d','e'],kunci:0,gs:'G9',gn:1,st:'Lama'},{id:'m2',tipe:'pg',mapel:'D',q:'b',opts:['a','b','c','d','e'],kunci:1,gs:'G9',gn:2,st:'Lama'},{id:'m3',tipe:'pg',mapel:'D',q:'c',opts:['a','b','c','d','e'],kunci:1}];BS.all=null;");
run("var puts=[];var _pp=bsPut;bsPut=function(k,o){puts.push(o.id);return Promise.resolve(true)};sgrSebar({id:'m1',gs:'G9',st:'Baru',si:'tmp:zz'});bsPut=_pp;");
ok('sgrSebar menyamakan anggota grup lain, tidak menyentuh soal di luar grup', run("BS.D.soal[1].st==='Baru'&&BS.D.soal[1].si==='tmp:zz'&&BS.D.soal[2].st===undefined&&puts.join()==='m2'"), run('puts.join()'));
ok('sgrBankGroups menghitung anggota', run("var g=sgrBankGroups('D');g.length===1&&g[0].n===2&&g[0].gs==='G9'"));
ok('sgrBankGroups menyaring menurut mapel', run("sgrBankGroups('Lain').length")===0);
ok('sgrGnBaru: urutan berikutnya dalam grup', run("sgrGnBaru('G9','')")===3 && run("sgrGnBaru('G9','m2')")===2);
ok('form: pilihan stimulus dan teks muncul saat grup dipilih', run("var fh=sgrFormHtml({mapel:'D',gs:'G9',st:'Baru',si:'',id:'m1'});fh.indexOf('data-sgr=\"bgrup\"')>-1&&fh.indexOf('id=\"bf-st\"')>-1&&fh.indexOf('1 soal lain')>-1"), run("sgrFormHtml({mapel:'D',gs:'G9',st:'Baru',si:'',id:'m1'})"));
ok('form: tanpa grup tidak menampilkan kolom teks stimulus', run("sgrFormHtml({mapel:'D',gs:'',st:'',si:''}).indexOf('id=\"bf-st\"')")===-1);

console.log('Bank soal: ujian dan tampilan');
run("BS.D.soal=[];['a','b','c'].forEach(function(x,i){BS.D.soal.push({id:'g'+x,tipe:'pg',mapel:'D',q:'Soal '+x,opts:['1','2','3','4','5'],kunci:0,aktif:true,tujuan:'keduanya',gs:'GR',gn:i+1,st:'Stimulus bersama',kelas:''})});['x','y','z','w'].forEach(function(x){BS.D.soal.push({id:'s'+x,tipe:'pg',mapel:'D',q:'Tunggal '+x,opts:['1','2','3','4','5'],kunci:0,aktif:true,tujuan:'keduanya',kelas:''})});BS.all=null;");
ok('bsMake (latihan): anggota grup berdampingan dan urut gn', run("var okAll=true;for(var t=0;t<30;t++){var r=bsMake('latihan',null,{n:7}),ix=r.ids.filter(function(i){return i.charAt(0)==='g'}).map(function(i){return r.ids.indexOf(i)});if(ix.length!==3||ix[2]-ix[0]!==2||r.ids.join().indexOf('ga,gb,gc')<0)okAll=false};okAll"));
ok('bsMake (latihan) jumlah 4: grup utuh (3 anggota) atau tidak ikut, tidak pernah terpotong', run("var ok4=true;for(var t=0;t<60;t++){var r4=bsMake('latihan',null,{n:4}),ng=r4.ids.filter(function(i){return i.charAt(0)==='g'}).length;if(r4.ids.length!==4||(ng!==0&&ng!==3))ok4=false}ok4"));
ok('bsMake (ujian otomatis) mematuhi jumlah', run("var rr=bsMake('ujian',{id:'s',judul:'J',durasi:30,jumlah:5,acak:true,pilih:'otomatis'});rr.ids.length===5"));
run("var RUN={ids:['ga','gb','gc','sx'],ans:{},oo:{},chk:{}};var h1=bsQBody(bsSoalById('gb'),RUN,'answer');var h2=bsQBody(bsSoalById('sx'),RUN,'answer');");
ok('bsQBody: stimulus tampil di tiap soal grup dengan rentang nomor', run("h1.indexOf('Stimulus bersama')>-1&&h1.indexOf('untuk soal no. 1-3')>-1"));
ok('bsQBody: soal tunggal tanpa kotak stimulus', run("h2.indexOf('sgr-box')<0"));
ok('bsRev: stimulus tampil, kecuali bila diminta disembunyikan', run("bsRev(bsSoalById('ga'),null,1,true).indexOf('sgr-box')>-1&&bsRev(bsSoalById('gb'),null,2,true,true).indexOf('sgr-box')<0"));

console.log('Kuis LKPD');
run("var MQ={id:'M',quiz:[{q:'Soal 1',o:['a','b'],a:0,gs:'G',st:'Teks bacaan',si:''},{q:'Soal 2',o:['a','b'],a:1,gs:'G',st:'Teks bacaan'},{q:'Soal 3',o:['a','b'],a:0}]};var QH=lkqQuizHtml(MQ,{});");
ok('stimulus tampil sekali di atas soal pertama grup', run("QH.split('Teks bacaan').length-1")===1 && run("QH.indexOf('sgr-box')<QH.indexOf('1. Soal 1')"));
ok('keterangan rentang nomor', run("QH.indexOf('untuk soal no. 1-2')>-1"));
ok('soal di luar grup tidak berubah', run("QH.indexOf('3. Soal 3')>-1"));
ok('lkqSig tidak berubah karena stimulus (jawaban tetap terbaca)', run("lkqSig(MQ)===lkqSig({quiz:[{q:'Soal 1',o:['a','b'],a:0},{q:'Soal 2',o:['a','b'],a:1},{q:'Soal 3',o:['a','b'],a:0}]})"));
ok('lkeClean membawa gs, st, si', run("var c1=lkeClean({q:'x',o:['a','b'],a:0,gs:'G',st:'  Teks  ',si:'drive:S'});c1.gs==='G'&&c1.st==='Teks'&&c1.si==='drive:S'"));
ok('lkeClean: soal tanpa grup tidak menambah kolom', run("var c2=lkeClean({q:'x',o:['a','b'],a:0});c2.gs===undefined&&c2.st===undefined&&c2.si===undefined"));
ok('lkeClean: grup tanpa isi stimulus dilepas', run("var c3=lkeClean({q:'x',o:['a','b'],a:0,gs:'G',st:' '});c3.gs===undefined"));
ok('lkeQIssue: grup tanpa stimulus ditandai', run("lkeQIssue({q:'x',o:['a','b'],a:0,gs:'G',st:''})").indexOf('Stimulus')===0);
ok('lkeQIssue: grup berisi stimulus lolos', run("lkeQIssue({q:'x',o:['a','b'],a:0,gs:'G',st:'ada'})")==='');
ok('lkeClean: gambar stimulus saja cukup', run("lkeQIssue({q:'x',o:['a','b'],a:0,gs:'G',st:'',si:'drive:S'})")==='');
ok('editor: pilihan stimulus muncul dan menawarkan pakai stimulus soal lain', run("var D={S:{quiz:[{q:'a',o:['x','y'],a:0,gs:'G',st:'Halo'},{q:'b',o:['x','y'],a:0}]}};var eh=sgrLkeHtml(D,D.S.quiz[1],1);eh.indexOf('Pakai stimulus soal no. 1')>-1&&eh.indexOf('Buat stimulus baru')>-1"));
ok('editor: soal beranggota grup menampilkan teks dan jumlah pemakai', run("var eh2=sgrLkeHtml(D,D.S.quiz[0],0);eh2.indexOf('data-sgr=\"lst\"')>-1&&eh2.indexOf('Halo')>-1"));
run("var S2={quiz:[{gs:'G',st:'A',si:'x'},{gs:'G',st:'old'},{gs:'H',st:'B'}]};S2.quiz[0].st='Baru';sgrLkeSebar(S2,0);");
ok('sgrLkeSebar menyamakan hanya grup yang sama', run("S2.quiz[1].st==='Baru'&&S2.quiz[1].si==='x'&&S2.quiz[2].st==='B'"));
ok('lkpd-io mempertahankan grup pada impor soal yang tidak berubah', /grpOf\[sk\]/.test(baca('js/lkpd-io.js')));

console.log('Cetak soal');
run("var GA={id:'ga',tipe:'pg',mapel:'D',q:'Soal A',opts:['1','2','3','4','5'],kunci:0,gs:'GR',gn:1,st:'Bacalah wacana <ini>',aktif:true},GB={id:'gb',tipe:'pg',mapel:'D',q:'Soal B',opts:['1','2','3','4','5'],kunci:1,gs:'GR',gn:2,st:'Bacalah wacana <ini>',aktif:true},SX={id:'sx',tipe:'pg',mapel:'D',q:'Tunggal',opts:['1','2','3','4','5'],kunci:2,aktif:true},KP={id:'kp',tipe:'kompleks',mapel:'D',q:'Komplek',opts:['1','2','3','4','5'],kunci:[0,2],gs:'GR',gn:3,st:'Bacalah wacana <ini>',aktif:true};");
run("CS.img={};var CH=csBuild([GA,SX,GB,KP],{judul:'T',kunci:true});var tipePG=CH.slice(0,CH.indexOf('B. Pilihan ganda kompleks'));");
ok('stimulus tercetak sekali per grup di tiap bagian', run("tipePG.split('Bacalah wacana &lt;ini&gt;').length-1")===1 && run("CH.split('Bacalah wacana &lt;ini&gt;').length-1")===2);
ok('keterangan rentang nomor soal grup pada cetak', run("CH.indexOf('untuk soal nomor 1 sampai 2')>-1"));
ok('anggota grup berdampingan di cetak (A, B lalu Tunggal)', run("CH.indexOf('Soal A')<CH.indexOf('Soal B')&&CH.indexOf('Soal B')<CH.indexOf('Tunggal')"));
ok('nomor kunci jawaban sama dengan nomor soal', run("CH.indexOf('<td class=\"c\">3</td><td>PG</td><td>C</td>')>-1&&CH.indexOf('<td class=\"c\">2</td><td>PG</td><td>B</td>')>-1"));
ok('csPilih: jumlah memuat grup utuh bila cukup, dan soal tunggal dipakai dulu bila tidak', run("csPilih([GA,SX,GB,KP],{jumlah:4}).length")===4 && run("var p1=csPilih([GA,SX,GB,KP],{jumlah:1});p1.length===1&&p1[0].id==='sx'"));
ok('csMuat mengumpulkan gambar stimulus', run("var refs=[];[{si:'drive:S'}].forEach(function(q){sgRefs(q).forEach(function(r){refs.push(r)})});refs.join()")==='drive:S');
ok('index.html memuat soal-grup.js setelah lkpd-gambar.js', baca('index.html').indexOf('js/soal-grup.js') > baca('index.html').indexOf('js/lkpd-gambar.js'));
ok('service worker memuat soal-grup.js', /js\/soal-grup\.js\?v=/.test(baca('service-worker.js')));

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
