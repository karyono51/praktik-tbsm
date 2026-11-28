#!/usr/bin/env node
/* Audit hak akses Siswa, Guru, Admin.   node tools/uji-hak-akses.mjs            (uji)
                                         node tools/uji-hak-akses.mjs --matriks  (cetak tabel Markdown untuk docs-HAK-AKSES.md)
   Bagian 1: izin koleksi di appwrite.json (profil aman CBT dipakai, sesuai CBT_AMAN:true).
   Bagian 2: pengecekan peran di sisi klien (PERM, can, isStaff, visibleResults) memakai js/core.js.
   Bagian 3: aturan yang tidak boleh dilanggar, supaya perubahan izin berikutnya tidak diam-diam melemahkan keamanan. */
import fs from 'node:fs';
import path from 'node:path';
import { dunia, root } from './_dunia-offline.mjs';
let gagal = 0, lulus = 0;
const cek = (nama, kondisi, info) => { if (kondisi) { lulus++; console.log('  ok   ' + nama); } else { gagal++; console.log('  GAGAL ' + nama + (info !== undefined ? '  -> ' + info : '')); } };

const conf = JSON.parse(fs.readFileSync(path.join(root, 'appwrite.json'), 'utf8'));
const aman = conf.profilAman || {};
const koleksi = {};
for (const c of conf.collections) {
  const izin = (aman[c.$id] && aman[c.$id].$permissions) || c.$permissions || [];
  const ds = aman[c.$id] ? aman[c.$id].documentSecurity : c.documentSecurity;
  koleksi[c.$id] = { izin: izin.map((p) => p.replace(/"/g, '')), ds: !!ds };
}
const punya = (id, aksi, peran) => koleksi[id].izin.includes(aksi + '(' + peran + ')');
/* peran efektif: siswa = users; guru = users + label:guru; admin = users + label:admin */
const boleh = (id, aksi, peran) => punya(id, aksi, 'users') || punya(id, aksi, 'any') || (peran !== 'siswa' && punya(id, aksi, 'label:' + peran));
const AKSI = ['read', 'create', 'update', 'delete'];
const hurufAksi = { read: 'B', create: 'T', update: 'U', delete: 'H' };

if (process.argv.includes('--matriks')) {
  console.log('| Koleksi | Siswa | Guru | Admin | Dokumen per pemilik |\n|---|---|---|---|---|');
  for (const id of Object.keys(koleksi)) {
    const sel = (p) => AKSI.filter((a) => boleh(id, a, p)).map((a) => hurufAksi[a]).join('') || '-';
    console.log('| `' + id + '` | ' + sel('siswa') + ' | ' + sel('guru') + ' | ' + sel('admin') + ' | ' + (koleksi[id].ds ? 'ya' : 'tidak') + ' |');
  }
  process.exit(0);
}

console.log('1. Izin koleksi (appwrite.json)');
cek('tidak ada koleksi yang memakai peran any', Object.keys(koleksi).every((id) => !koleksi[id].izin.some((p) => /\(any\)/.test(p))));
cek('siswa tidak boleh mengubah atau menghapus dokumen mana pun', Object.keys(koleksi).every((id) => !boleh(id, 'update', 'siswa') && !boleh(id, 'delete', 'siswa')),
  Object.keys(koleksi).filter((id) => boleh(id, 'update', 'siswa') || boleh(id, 'delete', 'siswa')).join(','));
const SISWA_BUAT = ['hasil', 'lkpd', 'lkpd_bukti', 'pkl_catat'].sort();
const nyataBuat = Object.keys(koleksi).filter((id) => boleh(id, 'create', 'siswa')).sort();
cek('siswa hanya boleh membuat di koleksi yang memang dipakai siswa', JSON.stringify(nyataBuat) === JSON.stringify(SISWA_BUAT), nyataBuat.join(','));
const SISWA_BACA = ['banksoal', 'pkl', 'soal_sesi'].sort();
const nyataBaca = Object.keys(koleksi).filter((id) => boleh(id, 'read', 'siswa')).sort();
cek('siswa hanya boleh membaca koleksi yang diterima (baseline)', JSON.stringify(nyataBaca) === JSON.stringify(SISWA_BACA), nyataBaca.join(','));
cek('profil aman: siswa tidak membuat soal_run dan soal_hasil (hanya fungsi cbt)', !boleh('soal_run', 'create', 'siswa') && !boleh('soal_hasil', 'create', 'siswa'));
cek('kunci jawaban (soal_kunci) tidak terbaca siswa', !boleh('soal_kunci', 'read', 'siswa'));
cek('audit, akademik_sdm: hanya admin', ['audit', 'akademik_sdm'].every((id) => !boleh(id, 'read', 'guru') && boleh(id, 'read', 'admin')));
cek('guru tidak menulis akademik, akademik_sdm, audit', ['akademik', 'akademik_sdm', 'audit'].every((id) => !boleh(id, 'create', 'guru') && !boleh(id, 'update', 'guru') && !boleh(id, 'delete', 'guru')));
cek('akun: hanya staf yang membaca, hanya admin yang membuat', !boleh('akun', 'read', 'siswa') && !boleh('akun', 'create', 'siswa') && !boleh('akun', 'create', 'guru') && boleh('akun', 'read', 'guru') && boleh('akun', 'create', 'admin'));
cek('guru tidak mengubah atau menghapus akun (siswa tidak membuat atau membaca akun)', !boleh('akun', 'update', 'guru') && !boleh('akun', 'delete', 'guru'));
cek('hapus data dan penghapusan akun hanya admin', boleh('akun', 'delete', 'admin') && !boleh('akun', 'delete', 'guru') && boleh('hasil', 'delete', 'admin') && !boleh('hasil', 'delete', 'guru') && boleh('lkpd', 'delete', 'admin') && !boleh('lkpd', 'delete', 'guru'));
cek('koleksi yang dibuat siswa memakai izin per dokumen', Object.keys(koleksi).filter((id) => boleh(id, 'create', 'siswa')).every((id) => koleksi[id].ds),
  Object.keys(koleksi).filter((id) => boleh(id, 'create', 'siswa') && !koleksi[id].ds).join(','));
cek('uid_map tidak bisa dibuat atau diubah lewat izin koleksi oleh siswa', !boleh('uid_map', 'create', 'siswa') && !boleh('uid_map', 'update', 'siswa'));
cek('observasi: siswa tidak menulis, tidak membaca', !boleh('observasi', 'create', 'siswa') && !boleh('observasi', 'read', 'siswa'));
cek('lkpd_modules hanya untuk label lkpdeditor', Object.keys(koleksi).every((id) => id !== 'lkpd_modules' || koleksi[id].izin.every((p) => /label:lkpdeditor/.test(p))));

console.log('2. Pengecekan peran di klien (js/core.js)');
{
  const w = dunia(), c = w.ctx;
  const sebagai = (peran, rl) => { c.S.user = { id: 'u_' + peran, nama: peran, peran: rl || peran }; c.S.act = peran; c.S.role = peran; };
  sebagai('siswa');
  cek('siswa: tidak punya izin staf', ['akun', 'kkm', 'hapus', 'nilai', 'observasi', 'observasi-semua', 'akademik'].every((p) => !c.can(p)));
  cek('siswa: bukan staf', !c.isStaff());
  sebagai('guru');
  cek('guru: nilai dan observasi saja', c.can('nilai') && c.can('observasi') && !c.can('akun') && !c.can('hapus') && !c.can('akademik') && !c.can('kkm') && !c.can('observasi-semua'));
  cek('guru: staf', c.isStaff());
  sebagai('admin');
  cek('admin: semua izin', ['akun', 'kkm', 'hapus', 'nilai', 'observasi', 'observasi-semua', 'akademik'].every((p) => c.can(p)));
  sebagai('proktor');
  cek('peran tanpa daftar izin (proktor sebelum pengawas.js dimuat) tidak membuat galat dan tidak punya izin', !c.isStaff() && !c.can('akun') && !c.can('nilai'));
  c.S.user = null;
  cek('tanpa login: tidak ada izin', !c.can('nilai') && !c.isStaff());
  /* peran ganda: izin mengikuti peran AKTIF, bukan gabungan */
  c.S.user = { id: 'u9', nama: 'Ganda', peran: 'guru,siswa' }; c.S.act = 'siswa'; c.S.role = 'siswa';
  cek('peran ganda guru+siswa aktif sebagai siswa: izin staf tertutup', !c.can('nilai') && !c.isStaff());
  c.S.act = 'guru'; c.S.role = 'guru';
  cek('peran ganda guru+siswa aktif sebagai guru: izin guru terbuka', c.can('nilai') && c.isStaff());
  cek('peran ganda tidak otomatis admin', !c.can('akun'));
  c.S.user = { id: 'u10', nama: 'X', peran: 'admin-palsu' }; c.S.act = 'siswa';
  cek('peran tidak dikenal dianggap siswa', JSON.stringify(c.roleList(c.S.user)) === '["siswa"]', JSON.stringify(c.roleList(c.S.user)));
  /* visibleResults: siswa hanya melihat nilainya sendiri */
  c.S.results = [{ id: 'a', sid: 's1', ts: 1 }, { id: 'b', sid: 's2', ts: 2 }, { id: 'c', sid: 's1', ts: 3 }];
  c.S.user = { id: 's1', nama: 'S1', peran: 'siswa' }; c.S.act = 'siswa'; c.S.role = 'siswa';
  cek('siswa hanya melihat hasil sendiri', c.visibleResults().length === 2 && c.visibleResults().every((r) => r.sid === 's1'));
  c.S.user = { id: 'g1', nama: 'G', peran: 'guru' }; c.S.act = 'guru'; c.S.role = 'guru';
  cek('guru melihat hasil semua siswa', c.visibleResults().length === 3);
}

console.log('3. Fungsi server memeriksa peran');
{
  const peng = fs.readFileSync(path.join(root, 'js/pengawas.js'), 'utf8'), kep = fs.readFileSync(path.join(root, 'js/kepsek.js'), 'utf8');
  cek('proktor hanya berizin pantau', /PERM\.proktor=\['pantau'\]/.test(peng));
  const kp = (kep.match(/PERM\.kepsek=\[([^\]]*)\]/) || [, ''])[1];
  cek('kepala sekolah tanpa izin akun, hapus, kkm', !/akun|hapus|kkm/.test(kp), kp);
  const kode = fs.readFileSync(path.join(root, 'functions/cbt/src/main.js'), 'utf8');
  cek('fungsi cbt membaca label pengguna dari server (bukan dari klien)', /labels/.test(kode));
  cek('fungsi cbt menolak aksi staf untuk bukan staf', /(403|ditolak|Forbidden|bukan staf|tidak berwenang)/i.test(kode));
}

console.log('4. Validasi di server (batas atribut Appwrite)');
{
  const semua = conf.collections.flatMap((c) => (c.attributes || []).map((a) => ({ kol: c.$id, ...a })));
  const tanpaBatasInt = semua.filter((a) => a.type === 'integer' && (a.min === undefined || a.max === undefined));
  cek('semua atribut integer punya batas min dan max', tanpaBatasInt.length === 0, tanpaBatasInt.map((a) => a.kol + '.' + a.key).join(','));
  const tanpaUkuran = semua.filter((a) => a.type === 'string' && !(a.size > 0));
  cek('semua atribut teks punya ukuran maksimum', tanpaUkuran.length === 0, tanpaUkuran.map((a) => a.kol + '.' + a.key).join(','));
  const NILAI = /^(score|practice|theory|koreksi)$/;
  const salahNilai = semua.filter((a) => NILAI.test(a.key) && a.type === 'integer' && (a.min !== 0 || a.max !== 100));
  cek('atribut nilai (score, practice, theory, koreksi) dibatasi 0 sampai 100', salahNilai.length === 0, salahNilai.map((a) => a.kol + '.' + a.key).join(','));
  const besar = semua.filter((a) => a.type === 'string' && a.size > 500000);
  cek('tidak ada atribut teks di atas 500 ribu karakter (batas beban baca)', besar.length === 0, besar.map((a) => a.kol + '.' + a.key + '=' + a.size).join(','));
  const sid = semua.filter((a) => a.key === 'sid' && a.type === 'string' && a.size < 36);
  cek('atribut sid cukup panjang untuk ID Appwrite (36)', sid.length === 0);
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
