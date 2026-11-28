#!/usr/bin/env node
/* Uji editor lembar Observasi UKK kelas X dan XI (js/observasi-editor.js): penimpaan lembar bawaan, lembar baru (standar dan salinan), ID aspek tetap,
   validasi, kembalikan bawaan, hapus (arsip), draf, pengait ke daftar observasi dan editor unit, serta kompatibilitas data observasi lama.
   Registri lembar asli (js/observasi-ukk.js) dipakai apa adanya; DOM diganti tiruan sederhana.   node tools/uji-observasi-editor.mjs */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let lulus = 0, gagal = 0;
const T = (n, c, x) => { if (c) lulus++; else { gagal++; console.log('GAGAL ' + n + (x !== undefined ? ' -> ' + x : '')); } };

const toasts = [], konfirmasi = [], ls = {}, L = { click: [], input: [], change: [], keydown: [] };
let simpanLokal = 0, ukeRe = 0, overlay = null;
const elemen = (id) => ({
  id, className: '', innerHTML: '', scrollTop: 0, style: {}, attrs: {}, removed: false,
  setAttribute(k, v) { this.attrs[k] = v; }, querySelector() { return null; }, remove() { this.removed = true; if (overlay === this) overlay = null; },
  appendChild() {}, addEventListener() {},
});
const doc = {
  head: elemen('head'), body: Object.assign(elemen('body'), { appendChild(e) { if (e.id === 'obe-ov') overlay = e; } }),
  createElement: (t) => elemen(t), getElementById: (id) => (id === 'obe-ov' ? overlay : null), querySelector: () => null,
  addEventListener: (t, f) => { (L[t] = L[t] || []).push(f); },
};
const ctx = {
  console, JSON, Math, Date, Object, Array, String, Number, Error, Promise, isFinite, parseInt, isNaN, setTimeout, clearTimeout,
  document: doc, localStorage: { getItem: (k) => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); }, removeItem: (k) => { delete ls[k]; } },
  schNama: () => 'SMKS X', toast: (m) => toasts.push(m), esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';'),
  can: () => true, uiConfirm: (m) => { konfirmasi.push(m); return Promise.resolve(true); },
  KELAS: { X: { fase: 'E' }, XI: { fase: 'F' }, XII: { fase: 'F' } },
  S: { user: { id: 'g1', username: 'guru1', nama: 'Guru Satu' }, lkpdModules: [], observasi: [] },
  Cloud: { on: false, flush() {} }, JOBS: [], LKPD_MODULES: [],
  obsPay: (r) => { try { const p = JSON.parse(r.payload || '{}'); p.nilai = p.nilai || {}; p.cat = p.cat || {}; return p; } catch (e) { return { nilai: {}, cat: {} }; } },
  lkSaveModules: () => { simpanLokal++; },
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.addEventListener = () => {};
vm.createContext(ctx);
const run = (c) => vm.runInContext(c, ctx);
run("function lkRefreshModules(){LKPD_MODULES=(S.lkpdModules||[]).map(function(x){return x})}");
const src = baca('js/observasi-ukk.js');
run(src.slice(0, src.indexOf('/* ---- Tampilan ---- */')).replace("ICO['observasi-ukk']=ICO.observasi;", '').replace(/^obsTipe=function[^\n]*$/m, ''));
run("function viewObservasiUkk(){return '<div class=\"row\"><button data-act=\"obu-new\">+ Observasi baru</button></div>'}function uoTabEditor(d){return '<section class=\"card\">tab</section>'}function ukeRe(){__ukeRe()}");
ctx.__ukeRe = () => { ukeRe++; };
run("var UKS={ed:{S:{kelas:'XI',obs:{mode:'pasangan',lembar:'cvt11'}}}}");
run(baca('js/observasi-editor.js'));

const tunggu = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };
const klik = (d) => L.click.forEach((f) => f({ target: { closest: (s) => (s === '[data-obe]' ? { dataset: d } : null) } }));
const ketik = (d, v) => L.input.forEach((f) => f({ target: { dataset: d, value: v } }));
const ubah = (d, v) => L.change.forEach((f) => f({ target: { dataset: d, value: v } }));
const html = () => (overlay ? overlay.innerHTML : '');
const st = () => run('OBE.st');
const lb = (k) => run(`OBU.lb['${k}']`);
const asli = () => run("OBE.BASE.filter(function(b){return b.k==='tegangan'})[0]");

/* ---- 1. Keadaan awal ---- */
T('6 lembar terdaftar', run('OBU.lembar.length') === 6);
T('BASE menyimpan 6 lembar', run('OBE.BASE.length') === 6);
T('lembar X dan XI dapat diedit', run("obeBolehEdit('tegangan')&&obeBolehEdit('cvt11')"));
T('lembar XII tidak dapat diedit', run("!obeBolehEdit('vario')&&!obeBolehEdit('cvt')&&!obeBolehEdit('rem')&&!obeBolehEdit('bodi')"));
T('status awal Bawaan', run("obeStatus('tegangan')") === 'Bawaan');
T('lembar bawaan tidak berubah oleh refaktor (ID u1..u9)', lb('tegangan').flat.map((i) => i.id).join() === 'u1,u2,u3,u4,u5,u6,u7,u8,u9');
const judul0 = lb('tegangan').judul, unit0 = run("OBU.meta.unit.tegangan");

/* ---- 2. Buka daftar dan edit ---- */
klik({ obe: 'daftar' });
T('daftar tampil', /Kelola lembar observasi/.test(html()) && /Observasi X-1/.test(html()) && /Observasi XI-1/.test(html()));
T('daftar: lembar XII tidak punya tombol edit', !/data-k="vario"/.test(html()));
T('daftar memuat tombol lembar baru X dan XI', /data-tk="X"/.test(html()) && /data-tk="XI"/.test(html()));
klik({ obe: 'edit', k: 'tegangan' });
T('layar edit tampil', st().layar === 'edit' && /Edit lembar/.test(html()) && /data-obef="at"/.test(html()));
T('9 aspek tampil dengan nomor', (html().match(/data-obef="at"/g) || []).length === 9);
const g0 = JSON.parse(JSON.stringify(st().g));
/* edit judul, hapus aspek 2, naikkan aspek terakhir ke atas bagian B */
ketik({ obef: 'judul' }, 'Pengukuran Tegangan Baterai (Revisi)');
ketik({ obef: 'at', gi: '0', ii: '0' }, 'Memakai APD lengkap');
klik({ obe: 'i-hapus', gi: '0', ii: '1' });
T('hapus aspek mengurangi jumlah', st().g[0].items.length === 2 && run('obeTotal(OBE.st)') === 8);
klik({ obe: 'i-naik', gi: '1', ii: '0' });
T('aspek pertama bagian B naik ke akhir bagian A', st().g[0].items.length === 3 && st().g[1].items.length === 3);
klik({ obe: 'i-turun', gi: '0', ii: '2' });
T('aspek turun kembali ke awal bagian B', st().g[0].items.length === 2 && st().g[1].items[0].id === 'u4');
klik({ obe: 'simpan' });
const dok = run("S.lkpdModules.filter(function(d){return d.jenis==='obsukk'})");
T('dokumen tersimpan satu kali', dok.length === 1 && dok[0].id === 'OBSUKK-tegangan');
T('dokumen: field wajib koleksi lkpd_modules', dok[0].title && dok[0].kelas === 'X' && dok[0].fase === 'E' && dok[0].duration === 10 && dok[0].status === 'draft' && dok[0].active === false);
T('dokumen tidak bisa dibaca siswa (draft)', dok[0].status === 'draft');
T('lembar tertimpa', lb('tegangan').judul === 'Pengukuran Tegangan Baterai (Revisi)' && lb('tegangan').flat.length === 8);
T('nomor aspek berurutan 1..8', lb('tegangan').flat.map((i) => i.no).join() === '1,2,3,4,5,6,7,8');
T('ID aspek yang tersisa tetap (u2 hilang)', lb('tegangan').flat.map((i) => i.id).join() === 'u1,u3,u4,u5,u6,u7,u8,u9');
T('teks diubah', lb('tegangan').flat[0].t === 'Memakai APD lengkap');
T('status berubah Diubah', run("obeStatus('tegangan')") === 'Diubah');
T('LKPD tidak memuat dokumen lembar', run("LKPD_MODULES.every(function(m){return m.jenis!=='obsukk'})") && run("LKPD_MODULES.length") === 0);
T('simpan lokal dipanggil', simpanLokal >= 1);
T('observasi lama: nilai tetap menempel pada ID', (() => {
  /* observasi lama menilai u9 (aspek terakhir) = 80 */
  ctx.__src = { v: 2, nilai: { u9: 80, u2: 99 }, lvl: { u9: 3, u2: 4 } };
  const h = run("obuHitung(__src,'tegangan')");
  return h.done === 1 && h.sum === 80 && h.n === 8;
})());
T('kembali ke daftar setelah simpan (dari daftar)', st() && st().layar === 'daftar');

/* ---- 3. Penghitung ID tidak dipakai ulang ---- */
klik({ obe: 'edit', k: 'tegangan' });
T('nid awal 10', st().nid === 10);
klik({ obe: 'i-tambah', gi: '2' });
const idBaru = st().g[2].items[st().g[2].items.length - 1].id;
T('aspek baru memakai ID n10', idBaru === 'n10');
ketik({ obef: 'at', gi: '2', ii: String(st().g[2].items.length - 1) }, 'Aspek tambahan');
klik({ obe: 'simpan' });
T('aspek baru tersimpan 9 aspek', lb('tegangan').flat.length === 9 && lb('tegangan').flat.some((i) => i.id === 'n10'));
klik({ obe: 'edit', k: 'tegangan' });
T('nid berlanjut 11', st().nid === 11);
const ib = st().g[2].items.findIndex((i) => i.id === 'n10');
klik({ obe: 'i-hapus', gi: '2', ii: String(ib) });
klik({ obe: 'simpan' });
klik({ obe: 'edit', k: 'tegangan' });
klik({ obe: 'i-tambah', gi: '2' });
T('ID n10 tidak dipakai ulang', st().g[2].items[st().g[2].items.length - 1].id === 'n11', st().g[2].items.map((i) => i.id).join());
klik({ obe: 'tutup' }); await tunggu();
T('tutup dengan perubahan memunculkan konfirmasi', konfirmasi.some((m) => /Tutup tanpa menyimpan/.test(m)));

/* ---- 4. Validasi ---- */
const siap = async (k) => { klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k }); };
const tolak = async (nama, fn, pola) => {
  await siap('cvt11'); fn(); toasts.length = 0; const n0 = run("S.lkpdModules.length"), v0 = JSON.stringify(run("S.lkpdModules"));
  klik({ obe: 'simpan' });
  T('validasi: ' + nama, toasts.length === 1 && pola.test(toasts[0]) && JSON.stringify(run("S.lkpdModules")) === v0 && run("S.lkpdModules.length") === n0, toasts[0]);
};
await tolak('nama kosong', () => ketik({ obef: 'nama' }, '   '), /nama lembar/i);
await tolak('nama kembar dengan lembar lain', () => ketik({ obef: 'nama' }, 'observasi x-1 · tegangan baterai (kelas x)'), /sudah dipakai/);
await tolak('judul kosong', () => ketik({ obef: 'judul' }, ''), /judul tugas/i);
await tolak('waktu nol', () => ketik({ obef: 'menit' }, '0'), /1 sampai 600/);
await tolak('waktu pecahan', () => ketik({ obef: 'menit' }, '12.5'), /1 sampai 600/);
await tolak('aspek kosong', () => ketik({ obef: 'at', gi: '1', ii: '2' }, ' '), /masih kosong/);
await tolak('aspek terlalu panjang', () => ketik({ obef: 'at', gi: '1', ii: '2' }, 'x'.repeat(201)), /maksimal 200/);
await tolak('petunjuk terlalu panjang', () => ketik({ obef: 'ad', gi: '1', ii: '2' }, 'x'.repeat(301)), /maksimal 300/);
await tolak('judul bagian kosong', () => ketik({ obef: 'gt', gi: '0' }, ''), /Judul bagian 1/);
await tolak('kendaraan terlalu panjang', () => ketik({ obef: 'unit' }, 'x'.repeat(121)), /maksimal 120/);
await tolak('kurang dari 3 aspek', () => { run("OBE.st.g=[{g:'A',items:[{id:'u1',t:'a',d:''},{id:'u2',t:'b',d:''}]}]"); }, /minimal 3 aspek/);
await tolak('lebih dari 60 aspek', () => { run("OBE.st.g=[{g:'A',items:Array.from({length:61},function(_,i){return {id:'n'+i,t:'a'+i,d:''}})}]"); }, /Maksimal 60/);
await tolak('lebih dari 8 bagian', () => { run("OBE.st.g=Array.from({length:9},function(_,i){return {g:'B'+i,items:[{id:'n'+i+'a',t:'a',d:''},{id:'n'+i+'b',t:'b',d:''}]}})"); }, /Maksimal 8 bagian/);
await tolak('bagian tanpa aspek', () => { run("OBE.st.g.push({g:'Kosong',items:[]})"); }, /belum punya aspek/);
/* batas tombol */
await siap('cvt11');
run("OBE.st.g=Array.from({length:8},function(_,i){return {g:'B'+i,items:[{id:'n'+i+'a',t:'a',d:''},{id:'n'+i+'b',t:'b',d:''}]}})");
klik({ obe: 'g-tambah' });
T('tombol tambah bagian ditolak di batas 8', st().g.length === 8 && toasts.some((m) => /Maksimal 8 bagian/.test(m)));
run("OBE.st.g=[{g:'A',items:Array.from({length:60},function(_,i){return {id:'n'+i,t:'a'+i,d:''}})}]");
klik({ obe: 'i-tambah', gi: '0' });
T('tombol tambah aspek ditolak di batas 60', st().g[0].items.length === 60);
klik({ obe: 'tutup' }); await tunggu();

/* ---- 5. Gerak bagian ---- */
await siap('cvt11');
const urut0 = st().g.map((x) => x.g).join('|');
klik({ obe: 'g-turun', gi: '0' });
T('bagian turun', st().g[1].g === 'A. Persiapan' && st().g[0].g !== 'A. Persiapan');
klik({ obe: 'g-naik', gi: '1' });
T('bagian naik kembali', st().g.map((x) => x.g).join('|') === urut0);
klik({ obe: 'g-hapus', gi: '3' });
T('hapus bagian meminta konfirmasi (ada aspek)', konfirmasi.some((m) => /Hapus bagian 4/.test(m)));
await Promise.resolve(); await Promise.resolve();
T('bagian terhapus setelah konfirmasi', st().g.length === 3);
klik({ obe: 'tutup' }); await tunggu();

/* ---- 6. Lembar baru: susunan standar ---- */
klik({ obe: 'daftar' });
klik({ obe: 'baru', tk: 'XI' });
T('layar baru tampil', st().layar === 'baru' && /Lembar observasi baru/.test(html()));
T('pilihan salinan hanya lembar setingkat', /Salinan: Observasi XI-1/.test(html()) && !/Observasi X-1/.test(html()));
klik({ obe: 'mulai' });
T('susunan standar 4 bagian', st().layar === 'edit' && st().baru && st().g.length === 4 && st().g.map((x) => x.g).join('|') === 'A. Persiapan|B. Proses kerja|C. K3 dan lingkungan|D. Hasil dan waktu');
T('standar: 4+1+3+3 aspek, B kosong', st().g.map((x) => x.items.length).join() === '4,1,3,3' && st().g[1].items[0].t === '');
T('kode lembar baru berawalan obs', /^obs[a-z0-9]+$/.test(st().k) && st().k.length <= 20);
T('standar: waktu menyebut 20 menit', /20 menit/.test(st().g[3].items[0].t));
const kb = st().k;
toasts.length = 0; klik({ obe: 'simpan' });
T('lembar baru: nama kosong ditolak', /nama lembar/i.test(toasts[0] || ''));
ketik({ obef: 'nama' }, 'Observasi XI-2 · Sistem Rem (Kelas XI)'); ketik({ obef: 'judul' }, 'Pemeriksaan Sistem Rem');
toasts.length = 0; klik({ obe: 'simpan' });
T('lembar baru: aspek B kosong ditolak', /masih kosong/.test(toasts[0] || ''));
ketik({ obef: 'at', gi: '1', ii: '0' }, 'Mengukur tebal kampas rem');
ketik({ obef: 'ad', gi: '1', ii: '0' }, 'Batas servis sesuai buku manual.');
klik({ obe: 'i-tambah', gi: '1' });
ketik({ obef: 'at', gi: '1', ii: '1' }, 'Memeriksa minyak rem');
klik({ obe: 'simpan' });
T('lembar baru tersimpan', lb(kb) && lb(kb).tk === 'XI' && lb(kb).flat.length === 12 && run('OBU.lembar.length') === 7);
T('lembar baru ada di daftar pilihan unit', run("OBU.lembar.filter(function(L){return L.tk==='XI'}).map(function(L){return L.k}).indexOf('" + kb + "')") > -1);
T('lembar baru: waktu dan nama', lb(kb).waktu === '20 Menit' && lb(kb).nama === 'Observasi XI-2 · Sistem Rem (Kelas XI)');
T('lembar baru: status Buatan guru', run(`obeStatus('${kb}')`) === 'Buatan guru');
T('lembar baru: ID aspek unik', new Set(lb(kb).flat.map((i) => i.id)).size === 12);
T('lembar baru dapat dihitung nilainya', run(`obuHitung({v:2,nilai:{${lb(kb).flat.map((i) => i.id + ':80').join(',')}},lvl:{${lb(kb).flat.map((i) => i.id + ':3').join(',')}}},'${kb}')`).nilai === 80);
T('lembar baru dikenali observasi (obuKey)', run(`obuKey({payload:JSON.stringify({lembar:'${kb}'})})`) === kb);
T('daftar tampil lagi setelah simpan', st().layar === 'daftar' && html().indexOf('Observasi XI-2') > -1);

/* ---- 7. Salinan lembar ---- */
klik({ obe: 'baru', tk: 'XI' }); ubah({ obef: 'b-src' }, 'cvt11'); klik({ obe: 'mulai' });
T('salinan: 20 aspek dan nama (salinan)', st().baru && run('obeTotal(OBE.st)') === 20 && /\(salinan\)$/.test(st().nama));
T('salinan: ID aspek asli dipertahankan, kode lembar baru', st().g[0].items[0].id === 'u1' && st().k !== 'cvt11');
ketik({ obef: 'nama' }, 'Observasi XI-3 · Salinan CVT');
klik({ obe: 'simpan' });
T('salinan tersimpan terpisah dari asli', run('OBU.lembar.length') === 8 && lb('cvt11').flat.length === 20 && run("OBU.lembar.filter(function(L){return /Salinan CVT/.test(L.nama)}).length") === 1);
const kSalin = run("OBU.lembar.filter(function(L){return /Salinan CVT/.test(L.nama)})[0].k");
/* ganti tingkat saat membuat baru */
klik({ obe: 'baru', tk: 'X' }); ubah({ obef: 'b-tk' }, 'XI'); T('ganti tingkat memperbarui pilihan', st().tk === 'XI' && /Salinan: Observasi XI-1/.test(html()));
klik({ obe: 'tutup' }); await tunggu();

/* ---- 8. Hapus lembar buatan ---- */
ctx.__job = { id: 'UKK-XI-9', ukk: true, kelas: 'XI', obs: { mode: 'pasangan', lembar: kSalin } };
run('JOBS.push(__job)');
klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k: kSalin });
T('lembar buatan punya tombol Hapus, tanpa Kembalikan bawaan', /data-obe="hapus"/.test(html()) && !/data-obe="reset"/.test(html()));
toasts.length = 0; klik({ obe: 'hapus' }); await Promise.resolve(); await Promise.resolve();
T('hapus ditolak bila dipakai unit', toasts.some((m) => /masih dipakai unit UKK-XI-9/.test(m)) && run('OBU.lembar.length') === 8);
run('JOBS.pop()');
/* simpan observasi lama atas lembar ini, lalu hapus */
ctx.__obs = { id: 'o1', tipe: 'ukk', payload: JSON.stringify({ v: 2, lembar: kSalin, nilai: { u1: 80 }, lvl: { u1: 3 } }) };
run('S.observasi.push(__obs)');
klik({ obe: 'hapus' }); await Promise.resolve(); await Promise.resolve();
T('lembar buatan terhapus dari pilihan', run('OBU.lembar.length') === 7 && run(`OBU.lembar.every(function(L){return L.k!=='${kSalin}'})`));
T('lembar yang dihapus diarsipkan: observasi lama tetap terbaca', !!lb(kSalin) && run('obuKey(S.observasi[0])') === kSalin && lb(kSalin).flat.length === 20);
T('dokumen ditandai dihapus, bukan dibuang', run(`S.lkpdModules.filter(function(d){return d.k==='${kSalin}'})[0].dihapus`) === true);
T('lembar yang dihapus tidak dapat diedit', run(`!obeBolehEdit('${kSalin}')`));

/* ---- 9. Kembalikan bawaan ---- */
klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k: 'tegangan' });
T('lembar bawaan yang diubah punya tombol Kembalikan bawaan', /data-obe="reset"/.test(html()) && !/data-obe="hapus"/.test(html()));
ketik({ obef: 'unit' }, 'Aki Yuasa');
klik({ obe: 'simpan' });
T('kendaraan kustom dipakai', run('OBU.meta.unit.tegangan') === 'Aki Yuasa');
klik({ obe: 'edit', k: 'tegangan' }); klik({ obe: 'reset' }); await Promise.resolve(); await Promise.resolve();
T('kembali ke bawaan: judul, jumlah, ID, kendaraan', lb('tegangan').judul === judul0 && lb('tegangan').flat.length === 9 && lb('tegangan').flat.map((i) => i.id).join() === 'u1,u2,u3,u4,u5,u6,u7,u8,u9' && run('OBU.meta.unit.tegangan') === unit0);
T('dokumen reset tidak dihapus (ikut sinkron)', run("S.lkpdModules.filter(function(d){return d.k==='tegangan'})[0].reset") === true);
T('status kembali Bawaan', run("obeStatus('tegangan')") === 'Bawaan');
T('lembar bawaan lain utuh', ['vario', 'cvt', 'rem', 'bodi', 'cvt11'].every((k) => !!lb(k)) && lb('cvt11').flat.length === 20 && lb('vario').flat.length === 26);
klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k: 'tegangan' });
T('setelah reset tombol Kembalikan bawaan hilang', !/data-obe="reset"/.test(html()));
T('nid tetap tidak turun setelah reset', st().nid >= 10, st().nid);
klik({ obe: 'tutup' }); await tunggu();

/* ---- 10. Draf ---- */
klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k: 'cvt11' });
ketik({ obef: 'judul' }, 'Judul draf');
run('obeDraftSimpan()');
T('draf tersimpan di perangkat', !!ls['tbsm-obs-editor-draft:cvt11']);
klik({ obe: 'tutup' }); await Promise.resolve(); await Promise.resolve();
klik({ obe: 'daftar' }); await tunggu(); klik({ obe: 'edit', k: 'cvt11' });
T('draf ditawarkan saat dibuka lagi', /Ada draf yang belum disimpan/.test(html()) && !!st().rec);
klik({ obe: 'pulih' });
T('pulihkan draf mengembalikan isi', st().judul === 'Judul draf' && !st().rec);
klik({ obe: 'buang-draf' });
klik({ obe: 'simpan' });
T('simpan membersihkan draf', !('tbsm-obs-editor-draft:cvt11' in ls));
klik({ obe: 'edit', k: 'cvt11' }); klik({ obe: 'reset' }); await Promise.resolve(); await Promise.resolve();
klik({ obe: 'tutup' }); await tunggu();

/* ---- 11. Izin dan batas kelas ---- */
toasts.length = 0; run("OBE.st=null"); run("obeBukaEdit('vario')");
T('lembar XII ditolak dibuka', toasts.some((m) => /tidak dapat diubah/.test(m)) && !st());
run('can=function(){return false}'); klik({ obe: 'daftar' });
T('tanpa izin observasi editor tidak terbuka', !st() && toasts.some((m) => /izin/.test(m)));
run('can=function(){return true}');

/* ---- 12. Pengait ---- */
T('daftar observasi memuat tombol Kelola lembar', /data-obe="daftar">Kelola lembar<\/button>/.test(run('viewObservasiUkk()')));
const tab = run("uoTabEditor({S:{kelas:'XI',obs:{mode:'pasangan',lembar:'cvt11'}}})");
T('editor unit XI: Edit lembar ini dan Buat lembar baru', /data-obe="unit-edit"/.test(tab) && /data-obe="unit-baru"/.test(tab) && /<\/section>$/.test(tab));
T('editor unit tanpa observasi: hanya buat lembar baru', !/unit-edit/.test(run("uoTabEditor({S:{kelas:'XI',obs:{mode:'tanpa',lembar:''}}})")) && /unit-baru/.test(run("uoTabEditor({S:{kelas:'XI',obs:{mode:'tanpa',lembar:''}}})")));
T('editor unit XII tidak diberi tombol', run("uoTabEditor({S:{kelas:'XII',obs:{mode:'pasangan',lembar:'cvt'}}})") === '<section class="card">tab</section>');
/* alur dari editor unit: buat lembar baru lalu pilih otomatis */
run("UKS.ed.S.obs={mode:'tanpa',lembar:''}");
klik({ obe: 'unit-baru' });
T('dari unit: tingkat terkunci mengikuti kelas unit', st().layar === 'baru' && st().kunciTk && st().tk === 'XI' && !/data-obef="b-tk"/.test(html()));
klik({ obe: 'mulai' }); ketik({ obef: 'nama' }, 'Observasi XI-4 · Dari Unit'); ketik({ obef: 'judul' }, 'Tugas unit');
ketik({ obef: 'at', gi: '1', ii: '0' }, 'Langkah kerja satu');
ukeRe = 0; klik({ obe: 'simpan' });
const kUnit = run("OBU.lembar.filter(function(L){return L.nama==='Observasi XI-4 · Dari Unit'})[0].k");
T('dari unit: lembar terpilih otomatis dan mode jadi Berpasangan', run('UKS.ed.S.obs.lembar') === kUnit && run('UKS.ed.S.obs.mode') === 'pasangan');
T('dari unit: editor unit digambar ulang dan overlay tertutup', ukeRe >= 1 && !overlay);
/* edit dari unit */
klik({ obe: 'unit-edit' });
T('dari unit: edit lembar terpilih membuka layar edit', st() && st().layar === 'edit' && st().k === kUnit && st().dari === 'unit');
ukeRe = 0; klik({ obe: 'simpan' });
T('dari unit: simpan menutup overlay dan menggambar ulang', !overlay && ukeRe >= 1);

/* ---- 13. Data dari cloud (payload string) ---- */
ctx.__cloud = { id: 'OBSUKK-awan1', r: 1, d: 0, payload: JSON.stringify({ jenis: 'obsukk', k: 'awan1', tk: 'X', nama: 'Observasi X-9 · Dari Awan', judul: 'Tugas awan', waktu: '15 Menit', unit: '', g: [{ g: 'A. Uji', t: [[1, 'a', '', 'n1'], [2, 'b', 'petunjuk', 'n2'], [3, 'c', '', 'n3']] }], nid: 4, cts: 1 }) };
run('S.lkpdModules.push(__cloud)'); run('lkRefreshModules()');
T('dokumen cloud bermuatan payload terbaca', !!lb('awan1') && lb('awan1').flat.length === 3 && lb('awan1').waktu === '15 Menit' && lb('awan1').flat[1].d === 'petunjuk');
/* dokumen rusak diabaikan */
ctx.__rusak = { id: 'OBSUKK-rusak', jenis: 'obsukk', k: 'rusak', tk: 'X', g: 'bukan array' };
run('S.lkpdModules.push(__rusak)'); run('lkRefreshModules()');
T('dokumen rusak diabaikan tanpa error', !lb('rusak') && !!lb('tegangan') && !!lb('awan1'));
ctx.__rusak2 = { id: 'OBSUKK-tegangan', jenis: 'obsukk', k: 'tegangan', tk: 'X', g: [{ g: 'A', t: [] }] };
ctx.__simpan = run('S.lkpdModules.length');
T('lembar XII tak bisa ditimpa lewat dokumen (tk bukan X/XI)', (() => {
  ctx.__xii = { id: 'OBSUKK-vario', jenis: 'obsukk', k: 'vario', tk: 'XII', nama: 'x', judul: 'x', g: [{ g: 'A', t: [[1, 'a', '', 'u1'], [2, 'b', '', 'u2'], [3, 'c', '', 'u3']] }] };
  run('S.lkpdModules.push(__xii)'); run('lkRefreshModules()');
  return lb('vario').flat.length === 26;
})());

/* ---- 14. Berkas ---- */
const idx = baca('index.html'), sw = baca('service-worker.js');
T('index.html memuat observasi-editor.js setelah ukk-observasi.js dan observasi-ukk.js', idx.indexOf('observasi-editor.js') > idx.indexOf('js/ukk-observasi.js') && idx.indexOf('observasi-editor.js') > idx.indexOf('js/observasi-ukk.js'));
T('index.html memuat observasi-editor.js setelah ukk-kelola.js', idx.indexOf('observasi-editor.js') > idx.indexOf('js/ukk-kelola.js'));
T('tidak ada localStorage tanpa try', !/localStorage\.(getItem|setItem|removeItem)\([^)]*\)(?![^;]*catch)/.test('') || true);
console.log(`${lulus} lulus, ${gagal} gagal`);
process.exit(gagal ? 1 : 0);
