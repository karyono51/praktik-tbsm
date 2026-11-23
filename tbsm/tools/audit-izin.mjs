#!/usr/bin/env node
/* Audit izin koleksi Appwrite (hanya membaca).
   node tools/audit-izin.mjs                  temuan BARU di appwrite.json (di luar baseline); keluar 1 bila ada yang baru
   node tools/audit-izin.mjs --semua          tampilkan semua temuan beserta penjelasan, termasuk yang sudah diterima
   node tools/audit-izin.mjs --terima         simpan temuan saat ini sebagai baseline (tools/audit-izin.baseline.json)
   node tools/audit-izin.mjs --server         bandingkan juga izin di server Appwrite dengan appwrite.json
                                              (API key scope: databases.read, collections.read; dari APPWRITE_API_KEY atau ditanyakan)
   Baseline = risiko yang sudah diketahui dan diterima. Deploy hanya gagal bila muncul temuan baru, misalnya seseorang
   menambah izin any atau create(users) pada koleksi yang menyimpan nilai. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
const BASE = path.join(root, 'tools/audit-izin.baseline.json');
const LABEL_DIKENAL = new Set(['guru', 'admin', 'lkpdeditor']);
/* Koleksi yang isinya memuat kunci jawaban soal (bidang kunci ada di payload) */
const KUNCI = new Set(['banksoal', 'soal_sesi']);   /* tanpa mode aman, kunci ada di payload koleksi ini */
/* Bidang yang menentukan nilai atau keputusan guru; bila siswa boleh membuat dokumen, bidang ini bisa dipalsukan lewat API */
const BIDANG_NILAI = /^(score|kompeten|koreksi|umpan|verifOleh|verifTs|kkm|benar)$/;

/* Mode CBT: bila CBT_AMAN:true, izin yang dinilai adalah profil aman (appwrite.json > profilAman), karena itu yang dipasang di server */
const cfgJs = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const AMAN = /CBT_AMAN\s*:\s*true/.test(cfgJs);
if (AMAN && conf.profilAman) conf.collections = conf.collections.map((c) => (conf.profilAman[c.$id] ? Object.assign({}, c, conf.profilAman[c.$id]) : c));
console.log('Mode CBT: ' + (AMAN ? 'aman (profil aman dinilai)' : 'biasa (CBT_AMAN:false)') + '\n');

const izin = (c) => (c.$permissions || []).map((p) => { const m = /^(\w+)\("([^"]+)"\)$/.exec(p); return m ? { aksi: m[1], siapa: m[2] } : { aksi: '?', siapa: p }; });
const temuan = [];
const T = (tingkat, id, kol, judul, saran) => temuan.push({ tingkat, id: id + ':' + kol, kol, judul, saran });

for (const c of conf.collections) {
  const P = izin(c), k = c.$id;
  const attrs = (c.attributes || []).map((a) => a.key);
  if (P.some((p) => p.siapa === 'any' || p.siapa === 'guests'))
    T('TINGGI', 'ANY', k, 'Izin untuk siapa saja / tamu (any/guests).', 'Ganti dengan users atau label:guru / label:admin.');
  const ubah = P.filter((p) => ['update', 'delete'].includes(p.aksi) && p.siapa === 'users');
  if (ubah.length)
    T('TINGGI', 'UBAH-USERS', k, 'Semua pengguna login boleh ' + [...new Set(ubah.map((p) => p.aksi))].join('/') + ' dokumen siapa pun.', 'Batasi ke label:guru / label:admin, atau pakai document security dengan izin pemilik.');
  const bacaUsers = P.some((p) => p.aksi === 'read' && p.siapa === 'users');
  if (k === 'soal_kunci' && (bacaUsers || P.some((p) => p.aksi === 'read' && (p.siapa === 'any' || p.siapa === 'guests'))))
    T('TINGGI', 'KUNCI-BOCOR', k, 'Koleksi kunci jawaban bisa dibaca di luar staf.', 'Batasi read ke label:guru dan label:admin.');
  if (bacaUsers && KUNCI.has(k) && !AMAN)
    T('TINGGI', 'KUNCI', k, 'Semua pengguna login bisa membaca koleksi ini, dan isinya memuat kunci jawaban soal (mode CBT biasa). Siswa dapat membaca kunci lewat API atau alat pengembang.', 'Aktifkan mode CBT aman: lihat docs-CBT.md (fungsi akun-admin diperbarui, CBT_AMAN:true, lalu node tools/setup-appwrite.mjs --profil=aman).');
  else if (bacaUsers && !KUNCI.has(k))
    T('SEDANG', 'BACA-USERS', k, 'Semua pengguna login bisa membaca seluruh isi koleksi (' + attrs.slice(0, 7).join(', ') + ').', 'Terima bila datanya memang tidak sensitif, atau pindah ke document security dengan izin baca per pemilik.');
  const buat = P.some((p) => p.aksi === 'create' && p.siapa === 'users');
  const nilai = attrs.filter((a) => BIDANG_NILAI.test(a));
  if (buat && nilai.length)
    T('SEDANG', 'NILAI-PALSU', k, 'Siswa boleh membuat dokumen dan mengisi bidang penentu nilai (' + nilai.join(', ') + '); lewat API, nilai atau koreksi guru bisa dipalsukan.', 'Tulis bidang itu hanya oleh staf (koleksi terpisah create(label:guru)) atau lewat fungsi server. Untuk soal_hasil dan soal_run: profil aman CBT (docs-CBT.md).');
  if (buat && attrs.includes('peran'))
    T('SEDANG', 'PERAN-PALSU', k, 'Siswa boleh membuat dokumen dengan bidang peran. Wewenang data tetap ditentukan label Auth di server, tetapi dokumen akun palsu (peran admin) bisa memunculkan menu admin di tampilan, dan bila email belum terdaftar dokumen itu dipakai saat login.', 'Setelah akun admin pertama ada dan PENDAFTARAN_TERBUKA:false, ubah izin create menjadi label:admin (uji dulu: guru dan admin menambah akun lewat Kelola Akun).');
  if (buat && c.documentSecurity === false)
    T('RENDAH', 'DOCSEC-MATI', k, 'create(users) tetapi document security mati: dokumen tidak bisa dibatasi per pemilik.', 'Aktifkan document security.');
  for (const p of P) if (p.siapa.startsWith('label:') && !LABEL_DIKENAL.has(p.siapa.slice(6)))
    T('RENDAH', 'LABEL-ASING:' + p.siapa.slice(6), k, 'Label ' + p.siapa + ' tidak ada di daftar label yang dikenal (guru, admin, lkpdeditor).', 'Periksa ejaan label, atau tambahkan ke daftar di tools/audit-izin.mjs.');
}

let base = new Set();
try { base = new Set(JSON.parse(fs.readFileSync(BASE, 'utf8')).diterima || []); } catch { /* belum ada baseline */ }

if (args.includes('--terima')) {
  fs.writeFileSync(BASE, JSON.stringify({ catatan: 'Risiko yang sudah diketahui dan diterima. Ubah hanya setelah ditinjau.', diterima: temuan.map((t) => t.id).sort() }, null, 2) + '\n');
  console.log('Baseline disimpan: ' + temuan.length + ' temuan diterima.');
  process.exit(0);
}

const urut = { TINGGI: 0, SEDANG: 1, RENDAH: 2 };
const baru = temuan.filter((t) => !base.has(t.id));
const tampil = (args.includes('--semua') ? temuan : baru).slice().sort((a, b) => urut[a.tingkat] - urut[b.tingkat]);
for (const t of tampil) {
  console.log('[' + t.tingkat + '] ' + t.kol + ' (' + t.id.split(':')[0] + ')' + (base.has(t.id) ? '  [diterima]' : '  [BARU]'));
  console.log('   ' + t.judul + '\n   Saran: ' + t.saran + '\n');
}
console.log('Temuan: ' + temuan.length + ' (baru ' + baru.length + ', diterima ' + (temuan.length - baru.length) + ').');
const hilang = [...base].filter((id) => !temuan.some((t) => t.id === id));
if (hilang.length) console.log('Sudah tidak ada lagi (bagus; jalankan --terima untuk merapikan baseline): ' + hilang.join(', '));

async function tanyaRahasia(q) {
  return new Promise((resolve) => {
    process.stdout.write(q);
    const inp = process.stdin;
    if (!inp.isTTY) { const rl = readline.createInterface({ input: inp }); let v = ''; rl.once('line', (l) => { v = l.trim(); rl.close(); }); rl.once('close', () => resolve(v)); return; }
    let buf = ''; inp.setRawMode(true); inp.resume(); inp.setEncoding('utf8');
    const on = (chunk) => { for (const ch of chunk) { if (ch === '\r' || ch === '\n') { inp.setRawMode(false); inp.pause(); inp.off('data', on); process.stdout.write('\n'); return resolve(buf.trim()); } if (ch === '\u0003') process.exit(130); if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1); else buf += ch; } };
    inp.on('data', on);
  });
}

let drift = 0;
if (args.includes('--server')) {
  const cfg = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
  const ENDPOINT = (process.env.APPWRITE_ENDPOINT || (cfg.match(/APPWRITE_ENDPOINT\s*:\s*'([^']*)'/) || [])[1] || '').replace(/\/$/, '');
  const KEY = process.env.APPWRITE_API_KEY || await tanyaRahasia('Tempel API key (databases.read, collections.read): ');
  const DB = conf.databases[0].$id;
  console.log('\nMembandingkan dengan server (' + DB + ')…');
  for (const c of conf.collections) {
    const r = await fetch(ENDPOINT + '/databases/' + DB + '/collections/' + c.$id, { headers: { 'X-Appwrite-Project': conf.projectId, 'X-Appwrite-Key': KEY } }).catch((e) => ({ ok: false, status: 0, json: async () => ({ message: e.message }) }));
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { console.log('- ' + c.$id + ': tidak terbaca (' + r.status + ' ' + (j.message || '') + ')'); drift++; continue; }
    const norm = (a) => new Set((a || []).map((p) => String(p).replace(/\s+/g, '')));
    const s = norm(j.$permissions), f = norm(c.$permissions);
    const lebih = [...s].filter((p) => !f.has(p)), kurang = [...f].filter((p) => !s.has(p));
    const ds = j.documentSecurity !== c.documentSecurity;
    if (lebih.length || kurang.length || ds) {
      drift++;
      console.log('- ' + c.$id + ': BEDA' + (lebih.length ? '\n    ada di server, tidak di appwrite.json: ' + lebih.join(', ') : '') + (kurang.length ? '\n    ada di appwrite.json, tidak di server: ' + kurang.join(', ') : '') + (ds ? '\n    document security server=' + j.documentSecurity + ', appwrite.json=' + c.documentSecurity : ''));
    } else console.log('- ' + c.$id + ': sama');
  }
  if (!drift) console.log('Izin di server sama dengan appwrite.json.');
}
process.exit(baru.length || drift ? 1 : 0);
