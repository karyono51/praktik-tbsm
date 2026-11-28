import { arsipAbsen, rentang } from '../functions/foto-drive/src/arsip.js';
let gagal = 0; const T = (n, c) => { if (!c) { gagal++; console.log('GAGAL', n); } };
T('senin sah', rentang('2026-11-16')[1] === '2026-11-22'); T('bukan senin', !rentang('2026-11-17'));
let file = null, rusak = false, hapus = 0; const res = (b) => ({ ok: true, json: async () => b, text: async () => b });
const h = { Fail: class extends Error {}, accessToken: async () => 't', folderId: async () => 'f',
  aw: async (p) => p.startsWith('/users') ? { labels: ['admin'] } : { documents: [{ $id: 'a', tipe: 'absen', tanggal: '2026-11-17' }, { $id: 'b', tipe: 'absen', tanggal: '2026-11-25' }, { $id: 'c', tipe: 'ukk', tanggal: '2026-11-17' }] },
  gfetch: async (u, o) => { if (o.method === 'DELETE') hapus++; if (o.method === 'PATCH') { file = o.body; return res({}); } if (o.method === 'POST') return res({ id: 'x' }); if (u.includes('alt=media')) return res(rusak ? '{"dokumen":[]}' : file); return res({ files: file ? [{ id: 'x' }] : [] }); } };
const jalan = () => arsipAbsen('u', { jenis: 'harian', minggu: '2026-11-16' }, {}, 'k', h);
T('hanya absen minggu itu', (await jalan()).jumlah === 1); T('ulang tidak dobel', (await jalan()).total === 1);
rusak = true; T('verifikasi gagal terdeteksi', await jalan().then(() => false, () => true)); T('tidak menghapus', hapus === 0);
console.log(gagal ? gagal + ' gagal' : 'uji arsip: lolos'); process.exit(gagal ? 1 : 0);
