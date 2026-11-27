/* Alat bersama uji offline dan beban: dunia peramban + Appwrite tiruan. */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const tidur = (ms) => new Promise((r) => setTimeout(r, ms));
const baca = (f) => fs.readFileSync(path.join(root, f), 'utf8');
/* ---- dunia tiruan ---- */
export function dunia(opsi = {}) {
  const toasts = [];
  const mem = new Map();
  const ls = { quotaPenuh: false,
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem(k, v) { if (this.quotaPenuh) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }, key: (i) => [...mem.keys()][i], get length() { return mem.size; } };
  if (opsi.ls) for (const [k, v] of opsi.ls) mem.set(k, v);
  const server = opsi.server || { docs: {}, log: [], aktif: 0, maks: 0, gagalBerikut: [], hilangRespons: 0, acak: 0, batasSerentak: 0 };
  const col = (c) => (server.docs[c] || (server.docs[c] = new Map()));
  const sim = async (jenis, c, id) => {
    server.aktif++; server.maks = Math.max(server.maks, server.aktif);
    const lewat = server.batasSerentak && server.aktif > server.batasSerentak;
    await tidur(1);
    server.aktif--;
    if (lewat) { const e = new Error('Rate limit'); e.code = 429; server.ditolak = (server.ditolak || 0) + 1; throw e; }
    const g = server.gagalBerikut.shift() || (server.acak && Math.random() < server.acak ? { code: 0, pesan: 'Failed to fetch' } : null);
    if (g) { const e = new Error(g.pesan || 'gagal'); e.code = g.code; throw e; }
    server.log.push([jenis, c, id]);
  };
  const db = {
    async createDocument(d, c, id, data) {
      await sim('create', c, id);
      if (col(c).has(id)) { const e = new Error('Document with the requested ID already exists'); e.code = 409; throw e; }
      col(c).set(id, Object.assign({ $id: id }, data));
      if (server.hilangRespons > 0) { server.hilangRespons--; const e = new Error('Failed to fetch'); e.code = 0; throw e; }
      return { $id: id };
    },
    async updateDocument(d, c, id, data) { await sim('update', c, id); col(c).set(id, Object.assign(col(c).get(id) || { $id: id }, data)); return { $id: id }; },
    async deleteDocument(d, c, id) { await sim('delete', c, id); col(c).delete(id); return {}; },
    async getDocument(d, c, id) { await sim('get', c, id); return col(c).get(id) || Promise.reject(Object.assign(new Error('nf'), { code: 404 })); },
    async listDocuments(d, c) { await sim('list', c); const a = [...col(c).values()]; return { total: a.length, documents: a }; }
  };
  const P = (n) => (x) => n + ':' + x;
  const ctx = {
    console, setTimeout, clearTimeout, Date, Math, JSON, Object, Array, Promise, String, Number, Error, RegExp, parseInt, parseFloat, isNaN, Uint8Array,
    localStorage: ls, navigator: { onLine: true }, toast: (m) => toasts.push(m),
    setInterval: () => 0,
    document: { addEventListener() {}, getElementById: () => null, hidden: false },
    render() {}, esc: (s) => String(s == null ? '' : s),
    uid: () => 'x' + Math.random().toString(36).slice(2, 12),
    schAkunOk: () => true, schMasuk() {}, schPeta: () => ({}), schHasilOk: () => true, schTerap() {}, schKode: () => '',
    KELAS: { X: 1, XI: 1, XII: 1 },
    Appwrite: { Client: class { setEndpoint() { return this; } setProject() { return this; } }, Account: class {}, Databases: class { constructor() { return db; } },
      Permission: { read: P('read'), update: P('update'), delete: P('delete') }, Role: { user: P('user') },
      Query: { limit: (n) => 'limit' + n, cursorAfter: (i) => 'cur' + i, equal: (a, v) => 'eq' + a + v }, ID: { unique: () => 'u' + Math.random().toString(36).slice(2, 10) } },
    APP_CONFIG: Object.assign({ APPWRITE_ENDPOINT: 'https://x', APPWRITE_PROJECT: 'p', DB: 'tbsm' }, opsi.cfg || {})
  };
  ctx.addEventListener = () => {}; ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  for (const f of ['js/core.js', 'js/pwa.js', 'js/pantau-db.js']) vm.runInContext(baca(f), ctx, { filename: f });
  ctx.Cloud.init();
  ctx.Cloud.authId = 'auth1';
  ctx.S.user = { id: 'g1', nama: 'Guru Uji', peran: 'guru' }; ctx.S.act = 'guru'; ctx.S.role = 'guru';
  return { ctx, server, toasts, ls, mem, db };
}
export const hasil = (i, x = {}) => Object.assign({ id: 'h' + i, ts: 1000 + i, jobId: 'J1', kelas: 'XI', siswa: 'Siswa ' + i, tipe: 'praktik', score: 80, sid: 's' + i }, x);

