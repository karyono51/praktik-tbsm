#!/usr/bin/env node
/* Uji js/core.js: Cloud.resolve mengambil profil lewat fungsi akun-admin (aksi profil), bukan membaca/membuat koleksi akun
   langsung (izin koleksi akun hanya staf). node tools/uji-profil-fungsi.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let lulus = 0, gagal = 0;
const ok = (n, c, x) => { if (c) { lulus++; console.log('  ok   ' + n); } else { gagal++; console.log('  GAGAL ' + n + (x !== undefined ? ' -> ' + JSON.stringify(x) : '')); } };
const src = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8');
const i0 = src.indexOf(' profilFn:async'), i1 = src.indexOf(' enter:async');
if (i0 < 0 || i1 < 0) throw new Error('potongan tidak ditemukan');
let resp, listCalls = 0, createCalls = 0, loggedOut = 0, fnThrow = null;
const ctx = {
  console, JSON, Promise, Error, Object, String, Number, localStorage: { setItem() {}, getItem: () => null },
  CFG: { ADMIN_EMAIL: 'admin@x.id', PENDAFTARAN_TERBUKA: false, DB: 'tbsm', APPWRITE_ENDPOINT: 'e', APPWRITE_PROJECT: 'p' },
  Appwrite: { Client: class { setEndpoint() { return this; } setProject() { return this; } }, Query: { equal: () => 1 },
    Functions: class { async createExecution() { if (fnThrow) throw fnThrow; return resp; } } },
  fromDoc: (d) => ({ id: d.$id, nama: d.nama, peran: d.peran }), uid: () => 'N1', schKode: () => '', pick: (o) => o, FA: [],
};
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext('var Cloud={acc:null,' + src.slice(i0, i1).replace(/,\s*$/, '') + '};', ctx);
const C = ctx.Cloud;
C.logout = async () => { loggedOut++; };
C.list = async () => { listCalls++; return []; };
C.db = { createDocument: async () => { createCalls++; } };
const R = (status, body) => ({ responseStatusCode: status, responseBody: JSON.stringify(body) });
const me = (e) => ({ email: e, name: 'N' });
const reset = () => { listCalls = createCalls = loggedOut = 0; fnThrow = null; };

console.log('Profil lewat fungsi akun-admin');
reset(); resp = R(200, { ok: true, doc: { $id: 's1', nama: 'Siswa', peran: 'siswa' } });
let p = await C.resolve(me('s@x.id'));
ok('profil diambil dari fungsi', p.id === 's1' && p.peran === 'siswa');
ok('tidak membaca atau membuat koleksi akun langsung', listCalls === 0 && createCalls === 0);

reset(); resp = R(404, { ok: false, error: 'Email belum terdaftar di daftar akun.' });
let err = null; try { await C.resolve(me('x@x.id')); } catch (e) { err = e; }
ok('email belum terdaftar: ditolak dan keluar', err && /belum terdaftar/.test(err.message) && loggedOut === 1);
ok('email belum terdaftar: tidak mencoba membuat akun', createCalls === 0);

reset(); resp = R(403, { ok: false, error: 'Akun nonaktif.' });
err = null; try { await C.resolve(me('n@x.id')); } catch (e) { err = e; }
ok('akun nonaktif: ditolak', err && /dinonaktifkan/.test(err.message) && loggedOut === 1);

reset(); resp = R(403, { ok: false, error: 'Hanya admin yang boleh mengatur sandi.' });
err = null; try { await C.resolve(me('s@x.id')); } catch (e) { err = e; }
ok('fungsi versi lama (403): pakai cara lama, siswa belum terdaftar ditolak', err && /belum terdaftar/.test(err.message) && listCalls === 1 && createCalls === 0);

reset(); fnThrow = Object.assign(new Error('Function not found'), { code: 404 });
err = null; try { await C.resolve(me('admin@x.id')); } catch (e) { err = e; }
ok('fungsi belum dipasang: admin pertama memakai cara lama', !err && listCalls === 1 && createCalls === 1);

reset(); resp = R(500, { ok: false });
err = null; try { await C.resolve(me('s@x.id')); } catch (e) { err = e; }
ok('galat server 500: tidak jatuh ke cara lama, pesan coba lagi', err && /Coba lagi/.test(err.message) && listCalls === 0);

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal'); process.exit(gagal ? 1 : 0);
