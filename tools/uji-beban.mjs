#!/usr/bin/env node
/* Uji beban antrean sinkron (js/pwa.js) dengan server Appwrite tiruan.   node tools/uji-beban.mjs
   A. Satu perangkat, 1500 data, 15 persen permintaan gagal acak: harus konvergen tanpa data hilang atau ganda.
   B. 60 perangkat mengirim bersamaan ke server yang menolak (429) bila lebih dari 40 permintaan serentak.
   C. Ujian selesai serentak: 120 siswa menyimpan hasil, sebagian offline lalu online bersamaan.
   Angka waktu hanya penanda; yang diuji adalah kebenaran (jumlah dokumen di server) dan batas permintaan. */
import { dunia, hasil, tidur } from './_dunia-offline.mjs';
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };
const baruServer = (x = {}) => Object.assign({ docs: {}, log: [], aktif: 0, maks: 0, gagalBerikut: [], hilangRespons: 0, acak: 0, batasSerentak: 0 }, x);

console.log('A. Satu perangkat, 1500 data, 15% gagal acak');
{
  const server = baruServer({ acak: 0.15 });
  const w = dunia({ server }), { ctx } = w;
  const N = 1500;
  for (let i = 0; i < N; i++) ctx.S.results.push(hasil(i));
  const t0 = Date.now();
  let putaran = 0;
  while (ctx.pendingCount() > 0 && putaran < 60) { putaran++; await ctx.Cloud.flush(); }
  const dt = Date.now() - t0;
  cek('semua ' + N + ' data akhirnya terkirim', ctx.pendingCount() === 0, ctx.pendingCount());
  cek('jumlah dokumen di server tepat ' + N + ' (tidak hilang, tidak ganda)', server.docs.hasil.size === N, server.docs.hasil.size);
  cek('konvergen dalam 60 putaran', putaran < 60, putaran);
  cek('permintaan serentak tidak lebih dari 4', server.maks <= 4, server.maks);
  const create = server.log.filter((l) => l[0] === 'create').length;
  console.log('       putaran ' + putaran + ', ' + create + ' create, ' + (dt / 1000).toFixed(1) + ' dtk');
  cek('kirim ulang tidak melonjak (create + update < 2x data)', server.log.length < N * 2, server.log.length);
}

console.log('B. 60 perangkat bersamaan, batas 40 serentak');
{
  const server = baruServer({ batasSerentak: 40 });
  const dev = Array.from({ length: 60 }, (_, d) => { const w = dunia({ server }); for (let i = 0; i < 5; i++) w.ctx.S.results.push(hasil(d * 10 + i, { id: 'p' + d + '_' + i, sid: 's' + d })); return w.ctx; });
  let putaran = 0;
  while (dev.some((c) => c.pendingCount() > 0) && putaran < 40) { putaran++; await Promise.all(dev.map((c) => c.Cloud.flush())); await tidur(5); }
  cek('semua perangkat akhirnya kosong', dev.every((c) => c.pendingCount() === 0), dev.filter((c) => c.pendingCount()).length);
  cek('server menyimpan tepat 300 dokumen', server.docs.hasil.size === 300, server.docs.hasil.size);
  cek('server sempat menolak (429), beban tiruan nyata', (server.ditolak || 0) > 0, server.ditolak);
  cek('tak ada dokumen ganda (id unik per catatan)', new Set([...server.docs.hasil.keys()]).size === 300);
  console.log('       putaran ' + putaran + ', ditolak ' + (server.ditolak || 0) + ', puncak serentak ' + server.maks);
}

console.log('C. Ujian selesai serentak: 120 siswa, separuh offline lalu online');
{
  const server = baruServer({ batasSerentak: 60, acak: 0.05 });
  const dev = Array.from({ length: 120 }, (_, d) => {
    const w = dunia({ server });
    w.ctx.S.user = { id: 'sw' + d, nama: 'Siswa ' + d, peran: 'siswa' }; w.ctx.S.act = 'siswa'; w.ctx.S.role = 'siswa'; w.ctx.Cloud.authId = 'a' + d;
    w.ctx.S.results.push(hasil(d, { id: 'r' + d, sid: 'sw' + d }));
    w.ctx.S.results.push(hasil(d, { id: 'r' + d + 'dup', sid: 'sw' + d }));           /* dobel karena tombol ditekan dua kali */
    w.ctx.S.lkpd.push({ id: 'k' + d, ts: d + 1, moduleId: 'M1', siswa: 'Siswa ' + d, sid: 'sw' + d, score: 70 });
    if (d % 2) w.ctx.navigator.onLine = false;
    return w.ctx;
  });
  await Promise.all(dev.map((c) => c.Cloud.flush()));
  const awal = server.docs.hasil ? server.docs.hasil.size : 0;
  cek('yang online terkirim, yang offline tertahan', awal > 0 && awal <= 60, awal);
  cek('yang offline menyimpan antrean di perangkat', dev.filter((c, i) => i % 2).every((c) => c.pendingCount() > 0));
  dev.forEach((c) => { c.navigator.onLine = true; });
  let putaran = 0;
  while (dev.some((c) => c.pendingCount() > 0) && putaran < 40) { putaran++; await Promise.all(dev.map((c) => c.Cloud.flush())); await tidur(5); }
  cek('semua perangkat akhirnya kosong', dev.every((c) => c.pendingCount() === 0));
  cek('tepat 120 hasil di server (dobel dibuang)', server.docs.hasil.size === 120, server.docs.hasil.size);
  cek('tepat 120 LKPD di server', server.docs.lkpd.size === 120, server.docs.lkpd.size);
  cek('penghitung data ganda per perangkat tercatat', dev.every((c) => c.Cloud.dupN === 1));
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
