/* Uji alamat keluar SEB: node tools/uji-seb-keluar.mjs
   Alamat yang dibuka tombol "Selesai dan keluar dari SEB" harus sama dengan quitURL di file .seb dari tools/buat-seb.mjs. */
import fs from 'node:fs'; import vm from 'node:vm'; import { execFileSync } from 'node:child_process'; import os from 'node:os'; import path from 'node:path';
const T = (n, c, i) => { console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); if (!c) process.exitCode = 1; };
const src = fs.readFileSync('js/cbt.js', 'utf8'), sch = fs.readFileSync('js/sekolah.js', 'utf8');
const m = src.match(/function sebKeluarUrl\(\)\{[\s\S]*?\n \}\n/);
T('fungsi sebKeluarUrl ada di cbt.js', !!m);
const base = 'https://karyono51.github.io', pathn = '/praktik-tbsm/';
const mk = (search, simpan, cfg) => {
  const store = simpan ? { 'tbsm-sch': simpan } : {};
  const ctx = { LOGO_DF: '', LOGO_MEDINA: '', LOGO: '', location: { origin: base, pathname: pathn, search }, URLSearchParams, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } }, APP_CONFIG: cfg || {} };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(sch.slice(0, sch.indexOf('/* admin lintas sekolah')), ctx);
  vm.runInContext('window.SCH_LIST=SCH_LIST;' + m[0], ctx);
  return vm.runInContext('sebKeluarUrl()', ctx);
};
// file .seb sesungguhnya dari alat pembuat
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seb-'));
for (const [kode, q] of [['medina', '?s=medina'], ['df', '?s=df']]) {
  const url = `${base}${pathn}?s=${kode}`;
  execFileSync(process.execPath, [path.resolve('tools/buat-seb.mjs'), url, `--nama=U-${kode}`, `--selesai=${base}${pathn}?s=${kode}&selesai=1`], { cwd: tmp, stdio: 'pipe' });
  const x = fs.readFileSync(path.join(tmp, `U-${kode}.seb`), 'utf8');
  const quit = (x.match(/<key>quitURL<\/key>\s*<string>([^<]*)<\/string>/) || [])[1].replace(/&amp;/g, '&');
  T(`alamat keluar ${kode} (dari ?s=) sama dengan quitURL di file .seb`, mk(q) === quit, [mk(q), quit]);
  T(`alamat keluar ${kode} (dari sekolah tersimpan, tanpa ?s=) sama dengan quitURL`, mk('', kode.toUpperCase()) === quit, [mk('', kode.toUpperCase()), quit]);
}
T('tanpa sekolah: tetap ?selesai=1', mk('') === base + pathn + '?selesai=1', mk(''));
T('APP_CONFIG.SEB_KELUAR menimpa', mk('?s=df', '', { SEB_KELUAR: 'https://x.y/z' }) === 'https://x.y/z');
T('tombol keluarseb hanya di SEB, hasil ujian, 30 menit', /isSeb\(\)\|\|isStaff\(\)|!isSeb\(\)\|\|isStaff\(\)/.test(src) && /h0\.mode!=='ujian'\|\|Jam\.now\(\)-h0\.ts>30\*60\*1000/.test(src));
T('klik keluarseb meminta konfirmasi lalu membuka alamat keluar', /a==='keluarseb'[\s\S]{0,200}uiConfirm[\s\S]{0,160}location\.href=sebKeluarUrl\(\)/.test(src));
