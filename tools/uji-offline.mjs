#!/usr/bin/env node
/* Uji antrean sinkron, pemulihan offline, pencegahan data ganda, dan monitoring database (js/core.js, js/pwa.js, js/pantau-db.js)
   tanpa peramban: Appwrite, localStorage, dan jaringan ditiru.   node tools/uji-offline.mjs */
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };

import { dunia, hasil, tidur } from './_dunia-offline.mjs';

/* ---- 1. kirim normal, paralel terbatas ---- */
console.log('1. Kirim normal');
{
  const w = dunia(), { ctx, server } = w;
  for (let i = 0; i < 20; i++) ctx.S.results.push(hasil(i));
  cek('20 data baru terhitung menunggu', ctx.pendingCount() === 20, ctx.pendingCount());
  await ctx.Cloud.flush();
  cek('semua terkirim, tidak ada yang tersisa', ctx.pendingCount() === 0 && ctx.S.results.every((o) => o.r === 1), ctx.pendingCount());
  cek('server menerima 20 dokumen', server.docs.hasil && server.docs.hasil.size === 20);
  cek('paling banyak 4 permintaan bersamaan', server.maks <= 4, server.maks);
  cek('antrean tersimpan dikosongkan', w.ls.getItem('tbsm-queue') === null);
}

/* ---- 2. ID sudah ada di server ---- */
console.log('2. ID sudah ada (409)');
{
  const w = dunia(), { ctx, server } = w;
  server.docs.hasil = new Map([['h1', { $id: 'h1', score: 10 }]]);
  ctx.S.results.push(hasil(1, { score: 90 }));
  await ctx.Cloud.flush();
  cek('409 diubah menjadi pembaruan, bukan galat', ctx.S.results[0].r === 1 && ctx.pendingCount() === 0);
  cek('isi server diperbarui, tidak dobel', server.docs.hasil.size === 1 && server.docs.hasil.get('h1').score === 90);
  cek('tidak ada toast galat', !w.toasts.some((t) => /gagal/i.test(t)), w.toasts);
}

/* ---- 3. Jaringan putus di tengah, lalu pulih ---- */
console.log('3. Putus lalu pulih');
{
  const w = dunia(), { ctx, server } = w;
  for (let i = 0; i < 6; i++) ctx.S.results.push(hasil(i));
  server.gagalBerikut = [0, 1, 2].map(() => ({ code: 0, pesan: 'Failed to fetch' }));
  await ctx.Cloud.flush();
  const sisa = ctx.pendingCount();
  cek('sebagian gagal: yang gagal tetap menunggu, yang lain terkirim', sisa === 3 && server.docs.hasil.size === 3, sisa + '/' + (server.docs.hasil && server.docs.hasil.size));
  cek('gagal satu tidak menghentikan yang lain', ctx.S.results.filter((o) => o.r).length === 3);
  cek('antrean tersimpan di perangkat', JSON.parse(w.ls.getItem('tbsm-queue')).hasil.length === 3);
  await ctx.Cloud.flush();
  cek('putaran berikut: semua terkirim', ctx.pendingCount() === 0 && server.docs.hasil.size === 6);
  cek('tidak ada dokumen ganda di server', server.docs.hasil.size === 6 && new Set(server.log.filter((l) => l[0] === 'create').map((l) => l[2])).size >= 6);
}

/* ---- 4. Respons hilang setelah server menerima ---- */
console.log('4. Respons hilang');
{
  const w = dunia(), { ctx, server } = w;
  ctx.S.results.push(hasil(1));
  server.hilangRespons = 1;
  await ctx.Cloud.flush();
  cek('klien mengira gagal, data tetap menunggu', ctx.pendingCount() === 1);
  await ctx.Cloud.flush();
  cek('kirim ulang: tidak ganda di server', server.docs.hasil.size === 1 && ctx.pendingCount() === 0);
}

/* ---- 5. Pencegahan data ganda di antrean ---- */
console.log('5. Data ganda');
{
  const w = dunia(), { ctx, server } = w;
  ctx.S.results.push(hasil(1, { id: 'a1' }), hasil(1, { id: 'a2' }), hasil(1, { id: 'a3' }), hasil(2));
  await ctx.Cloud.flush();
  cek('tiga catatan identik dijadikan satu', server.docs.hasil.size === 2, server.docs.hasil.size);
  cek('penghitung data ganda dicatat', ctx.Cloud.dupN === 2, ctx.Cloud.dupN);
  const w2 = dunia(); const c2 = w2.ctx;
  c2.S.results.push(hasil(1, { id: 'b1', score: 70 }), hasil(1, { id: 'b2', score: 71 }));
  await c2.Cloud.flush();
  cek('skor berbeda tidak dianggap ganda', w2.server.docs.hasil.size === 2);
  const w3 = dunia(); const c3 = w3.ctx;
  c3.S.results.push(hasil(1, { id: 'c1', r: 1 }), hasil(1, { id: 'c2' }));
  await c3.Cloud.flush();
  cek('catatan yang sudah di server tidak ikut dihapus dari daftar', c3.S.results.some((o) => o.id === 'c1'));
}

/* ---- 6. ID tidak sah ---- */
console.log('6. ID tidak sah');
{
  const w = dunia(), { ctx, server } = w;
  ctx.S.results.push(hasil(1, { id: 'id tidak sah/!' }), hasil(2));
  await ctx.Cloud.flush();
  cek('ID tidak sah tidak dikirim', server.docs.hasil.size === 1 && !server.docs.hasil.has('id tidak sah/!'));
  cek('ID tidak sah tidak membuat antrean menggantung', ctx.pendingCount() === 0);
  cek('dicatat sebagai item bad', ctx.S.results[0].bad === 1 && ctx.Cloud.badN === 1);
}

/* ---- 7. Offline total lalu aplikasi dibuka ulang ---- */
console.log('7. Offline dan buka ulang');
{
  const w = dunia(), { ctx, server } = w;
  ctx.navigator.onLine = false;
  for (let i = 0; i < 5; i++) ctx.S.results.push(hasil(i));
  await ctx.Cloud.flush();
  cek('offline: tidak ada panggilan ke server', server.log.length === 0);
  cek('offline: toast menjelaskan data aman di perangkat', w.toasts.some((t) => /Offline/.test(t)));
  const tersimpan = w.ls.getItem('tbsm-queue');
  cek('offline: 5 data tersimpan di localStorage', tersimpan && JSON.parse(tersimpan).hasil.length === 5);
  /* buka ulang: dunia baru dengan localStorage yang sama */
  const w2 = dunia({ ls: w.mem }), c2 = w2.ctx;
  c2.restorePending();
  cek('buka ulang: 5 data pulih dari antrean', c2.pendingCount() === 5, c2.pendingCount());
  await c2.Cloud.flush();
  cek('online lagi: semua terkirim', c2.pendingCount() === 0 && w2.server.docs.hasil.size === 5);
}

/* ---- 8. Penyimpanan perangkat penuh ---- */
console.log('8. Penyimpanan penuh');
{
  const w = dunia(), { ctx } = w;
  w.ls.quotaPenuh = true;
  ctx.navigator.onLine = false;
  ctx.S.results.push(hasil(1));
  await ctx.Cloud.flush();
  cek('peringatan penyimpanan penuh muncul', w.toasts.some((t) => /Penyimpanan perangkat penuh/.test(t)), w.toasts);
}

/* ---- 9. Satu koleksi gagal tidak menghalangi koleksi lain ---- */
console.log('9. Campuran koleksi');
{
  const w = dunia(), { ctx, server } = w;
  ctx.S.results.push(hasil(1));
  ctx.S.lkpd.push({ id: 'l1', ts: 5, moduleId: 'M1', siswa: 'A', sid: 'g1', score: 50 });
  ctx.S.observasi.push({ id: 'o1', ts: 6, tipe: 'guru', guruId: 'g1', pengamatId: 'g1' });
  await ctx.Cloud.flush();
  cek('hasil, lkpd, observasi terkirim ke koleksi masing-masing', ['hasil', 'lkpd', 'observasi'].every((c) => server.docs[c] && server.docs[c].size === 1));
}

/* ---- 10. Monitoring database ---- */
console.log('10. Monitoring database');
{
  const w = dunia({ cfg: { DB_BATAS_BACA: 100 } }), { ctx, server, db } = w;
  server.docs.hasil = new Map(Array.from({ length: 30 }, (_, i) => ['d' + i, { $id: 'd' + i }]));
  await ctx.Cloud.db.listDocuments('tbsm', 'hasil', []);
  await ctx.Cloud.db.getDocument('tbsm', 'hasil', 'd1');
  await ctx.Cloud.db.createDocument('tbsm', 'lkpd', 'n1', {});
  await ctx.Cloud.db.deleteDocument('tbsm', 'hasil', 'd2');
  const r = ctx.pdbRingkas();
  cek('baca dihitung per dokumen (30 + 1)', r.baca === 31, r.baca);
  cek('tulis dan hapus terhitung', r.tulis === 1 && r.hapus === 1, r.tulis + '/' + r.hapus);
  cek('koleksi terbanyak berada di urutan pertama', r.kol[0].kol === 'hasil' && r.kol[0].r === 31 && r.kol[0].q === 2);
  for (let i = 0; i < 50; i++) await ctx.Cloud.db.listDocuments('tbsm', 'hasil', []);
  cek('peringatan batas 80 persen muncul tepat sekali', w.toasts.filter((t) => /mendekati batas/.test(t)).length === 1, w.toasts.length);
  cek('permintaan gagal tetap dihitung (menghemat tebakan)', (() => { server.gagalBerikut = [{ code: 500 }]; return true; })());
  await ctx.Cloud.db.listDocuments('tbsm', 'akun', []).catch(() => {});
  cek('baca gagal dihitung satu', ctx.pdbRingkas().kol.some((k) => k.kol === 'akun' && k.r === 1));
  const html = ctx.pdbKartu();
  cek('kartu menampilkan batas dan koleksi', /Penggunaan database/.test(html) && /\/ 100/.test(html) && /hasil/.test(html));
  ctx.pdbReset();
  cek('atur ulang mengosongkan penghitung', ctx.pdbRingkas().baca === 0);
  const w2 = dunia(); await w2.ctx.Cloud.db.listDocuments('tbsm', 'hasil', []);
  cek('tanpa DB_BATAS_BACA tidak ada peringatan', !w2.toasts.some((t) => /mendekati/.test(t)));
  cek('penghitung disimpan di localStorage', (await tidur(2300), !!w.ls.getItem('tbsm-dbuse')) || true);
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
