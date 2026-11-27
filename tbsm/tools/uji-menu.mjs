/* Uji susunan menu (js/menu-peta.js): node tools/uji-menu.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/menu-peta.js', import.meta.url), 'utf8'), ctx);
let gagal = 0;
const T = (n, c) => { console.log((c ? '  ok   ' : '  GAGAL ') + n); if (!c) gagal++; };
const slug = Object.values(ctx.MENU_ITEM).map((x) => x[0]).filter(Boolean);
T('alamat menu unik', new Set(slug).size === slug.length);
T('alamat hanya huruf kecil, angka, tanda hubung', slug.every((s) => /^[a-z0-9-]+$/.test(s)));
T('setiap menu beralamat punya kelompok', Object.keys(ctx.MENU_ITEM).every((id) => ctx.menuKelompok(id, false)));
T('menu per kelas masuk kelompoknya', ctx.menuKelompok('lkpd:X').key === 'ajar' && ctx.menuKelompok('kelas:XI').key === 'ukk');
T('acuan: staf di Pengaturan, siswa di Nilai dan acuan', ctx.menuKelompok('acuan', false).key === 'sys' && ctx.menuKelompok('acuan', true).key === 'nilai');
const idx = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const at = (f) => idx.indexOf('js/' + f + '.js');
T('urutan muat: menu-peta sebelum menu-dasbor, rute paling akhir', at('menu-peta') > 0 && at('menu-peta') < at('menu-dasbor') && [...idx.matchAll(/<script src="js\/([^"?]+)\.js/g)].pop()[1] === 'rute');
process.exit(gagal ? 1 : 0);
