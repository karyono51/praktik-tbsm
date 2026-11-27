#!/usr/bin/env node
/* Uji pembungkus klien js/neon-db.js tanpa peramban: Cloud, Appwrite, dan cbtFn tiruan.  node tools/uji-neon-klien.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };

const Q = (m, a, v) => JSON.stringify({ method: m, attribute: a, values: v });
function dunia(cfg, neonDocs, lamaDocs) {
  const log = { fn: [], raw: [] };
  const rawDb = {
    async listDocuments(db, col, queries) {
      log.raw.push(['list', col]);
      let docs = (lamaDocs[col] || []).slice(), lim = 25, cur = null;
      (queries || []).forEach((s) => { const q = JSON.parse(s); if (q.method === 'equal') docs = docs.filter((d) => q.values.includes(d[q.attribute] === undefined ? d.$id : d[q.attribute])); if (q.method === 'limit') lim = q.values[0]; if (q.method === 'cursorAfter') cur = q.values[0]; });
      if (cur) docs = docs.slice(docs.findIndex((d) => d.$id === cur) + 1);
      return { total: docs.length, documents: docs.slice(0, lim) };
    },
    async getDocument(db, col, id) { log.raw.push(['get', col, id]); return { $id: id, dari: 'appwrite' }; },
    async createDocument() { log.raw.push(['create']); return {}; }, async updateDocument() { log.raw.push(['update']); return {}; }, async deleteDocument() { log.raw.push(['delete']); return {}; }
  };
  const ctx = {
    console, window: null, CFG: Object.assign({ DB: 'tbsm', CBT_AMAN: true }, cfg),
    Appwrite: { Query: { limit: (n) => Q('limit', undefined, [n]), cursorAfter: (id) => Q('cursorAfter', undefined, [id]), equal: (a, v) => Q('equal', a, v) } },
    cbtFn: async (b) => {
      log.fn.push(b);
      const err = (code, msg) => { const e = new Error(msg); e.code = code; return e; };
      if (b.action !== 'dok') throw err(400, 'aksi');
      const all = (neonDocs[b.col] || []).filter((d) => !b.q || Object.keys(b.q).every((k) => b.q[k].includes(k === '$id' ? d.$id : d[k]))).sort((x, y) => (x.$id < y.$id ? -1 : 1));
      if (b.op === 'get') { const d = all.find((x) => x.$id === b.id); if (!d) throw err(404, 'Dokumen tidak ditemukan'); return { ok: true, doc: d }; }
      if (b.op === 'create') { if ((neonDocs[b.col] || []).some((x) => x.$id === b.id)) throw err(409, 'Dokumen sudah ada'); const d = Object.assign({ $id: b.id }, b.data); (neonDocs[b.col] = neonDocs[b.col] || []).push(d); return { ok: true, doc: d }; }
      if (b.op === 'list') { let x = all; if (b.cursor) x = x.filter((d) => d.$id > b.cursor); const r = { ok: true, docs: x.slice(0, b.limit) }; if (b.total) r.total = all.length; return r; }
      return { ok: true, doc: {} };
    }
  };
  ctx.window = ctx; ctx.Cloud = {
    on: true, db: null,
    init() { this.db = rawDb; },
    async list(col, extra) { return (await this.db.listDocuments('tbsm', col, extra || [])).documents; }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/neon-db.js'), 'utf8'), ctx);
  return { ctx, log, rawDb };
}
const mk = (pre, n, extra) => Array.from({ length: n }, (_, i) => Object.assign({ $id: pre + String(1000 + i), sid: 'A' + (i % 3), sesiId: 'S1' }, extra || {}));

console.log('Tidak aktif');
let w = dunia({ CBT_DB: 'appwrite' }, {}, {}); w.ctx.Cloud.init();
cek('CBT_DB bukan neon: Cloud.db tetap Appwrite asli', w.ctx.Cloud.db === w.rawDb);
w = dunia({ CBT_DB: 'neon', CBT_AMAN: false }, {}, {}); w.ctx.Cloud.init();
cek('CBT_AMAN false: neon diabaikan', w.ctx.Cloud.db === w.rawDb);

console.log('Aktif: rute per koleksi');
w = dunia({ CBT_DB: 'neon' }, { soal_hasil: mk('h', 3) }, {}); w.ctx.Cloud.init(); const db = w.ctx.Cloud.db;
cek('Cloud.db dibungkus', db !== w.rawDb && db.__neon === true);
let r = await db.getDocument('tbsm', 'akun', 'x'); cek('koleksi lain tetap langsung ke Appwrite', r.dari === 'appwrite' && w.log.fn.length === 0);
r = await db.getDocument('tbsm', 'soal_hasil', 'h1001'); cek('get soal_hasil lewat fungsi', r.$id === 'h1001' && w.log.fn[0].op === 'get');
let e = null; try { await db.getDocument('tbsm', 'soal_hasil', 'nope'); } catch (x) { e = x; } cek('404 dari server tetap berkode 404 (kode lama mengandalkan ini)', e && e.code === 404);
e = null; try { await db.createDocument('tbsm', 'soal_kunci', 'tk_1', { payload: '{}' }); await db.createDocument('tbsm', 'soal_kunci', 'tk_1', { payload: '{}' }); } catch (x) { e = x; } cek('409 pada create ganda', e && e.code === 409);
await db.updateDocument('tbsm', 'soal_run', 'r1', { ext: 300 }); await db.deleteDocument('tbsm', 'soal_run', 'r1');
cek('update dan delete soal_run lewat fungsi', w.log.fn.slice(-2).map((x) => x.op).join() === 'update,delete' && !w.log.raw.some((x) => x[0] === 'update' || x[0] === 'delete'));
cek('pembungkus lain (audit, batas waktu) bisa membungkus lagi', typeof db.updateDocument === 'function' && typeof Object.getPrototypeOf(db).getDocument === 'function');

console.log('Daftar lengkap: Neon + lama');
w = dunia({ CBT_DB: 'neon' }, { soal_hasil: mk('h', 230) }, { soal_hasil: [{ $id: 'h1000', dari: 'lama', sid: 'A0' }, { $id: 'hOLD1', sid: 'A1', sesiId: 'S1' }, { $id: 'hOLD2', sid: 'A2', sesiId: 'S1' }] }); w.ctx.Cloud.init();
let L = await w.ctx.Cloud.list('soal_hasil', [Q('equal', 'sesiId', ['S1'])]);
cek('230 dari Neon + 2 lama unik = 232 (h1000 ganda tidak dihitung dua kali)', L.length === 232, L.length);
cek('bila ID sama, versi Neon menang', L.find((d) => d.$id === 'h1000').dari === undefined);
const halaman = w.log.fn.filter((x) => x.op === 'list');
cek('Neon dibaca per 100 dokumen (3 panggilan)', halaman.length === 3 && halaman.every((x) => x.limit <= 100), halaman.map((x) => x.limit).join());
cek('filter sesiId diteruskan ke server', halaman[0].q.sesiId[0] === 'S1');
w.ctx.CFG.CBT_LEGACY = false; w.log.fn.length = 0; w.log.raw.length = 0;
L = await w.ctx.Cloud.list('soal_hasil', []);
cek('CBT_LEGACY=false: hanya Neon, Appwrite tidak disentuh', L.length === 230 && w.log.raw.length === 0, L.length + ' / ' + w.log.raw.length);
w.log.fn.length = 0; L = await w.ctx.Cloud.list('banksoal', []); cek('koleksi lain memakai daftar bawaan (tanpa fungsi)', Array.isArray(L) && w.log.fn.length === 0, w.log.fn.length);

console.log('Satu halaman (layar Hapus nilai)');
w = dunia({ CBT_DB: 'neon' }, { soal_run: mk('r', 3) }, { soal_run: [{ $id: 'rOLD1' }, { $id: 'rOLD2' }, { $id: 'rOLD3' }] }); w.ctx.Cloud.init();
r = await w.ctx.Cloud.db.listDocuments('tbsm', 'soal_run', [Q('limit', undefined, [50])]);
cek('halaman 50: 3 Neon dilengkapi 3 lama', r.documents.length === 6 && r.total === 6, r.documents.length + '/' + r.total);
r = await w.ctx.Cloud.db.listDocuments('tbsm', 'soal_run', [Q('limit', undefined, [1])]);
cek('limit 1 (hitung): total = Neon + lama', r.documents.length === 1 && r.total === 6, r.documents.length + '/' + r.total);
w.ctx.CFG.CBT_LEGACY = false; r = await w.ctx.Cloud.db.listDocuments('tbsm', 'soal_run', [Q('limit', undefined, [1])]);
cek('tanpa cadangan: total hanya Neon', r.total === 3, r.total);

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
