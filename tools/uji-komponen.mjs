/* Uji komponen bersama (js/komponen.js + css/komponen.css): node tools/uji-komponen.mjs
   Memastikan pembangun pilihan, tombol, kartu, dan lipatan menghasilkan satu bentuk baku, dan CSS-nya terpasang. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const ctx = { console }; vm.createContext(ctx);
vm.runInContext(baca('js/util.js').split('\n').filter((l) => /^function esc\(/.test(l)).join('\n') + '\n' + baca('js/komponen.js'), ctx);
const K = ctx;

/* pilihan */
let r = K.bpSelect(' data-x="1"', [K.bpO('a', 'A', 'ket a'), K.bpG('Grup', [K.bpO('b', 'B', '', true), K.bpO('c', 'C')])], 'a', { judul: 'Pilih huruf' });
T('select: atribut, judul, keterangan, kelompok', /<select data-x="1" data-judul="Pilih huruf">/.test(r.html) && /data-ket="ket a"/.test(r.html) && /<optgroup label="Grup">/.test(r.html), r.html);
T('select: ket nilai terpilih dikembalikan', r.ket === 'ket a');
T('select: opsi nonaktif disabled, yang terpilih tidak', /<option value="b" disabled>/.test(r.html) && /<option value="a" data-ket="ket a" selected>/.test(r.html));
r = K.bpSelect('', [['x', 'X'], ['y', 'Y', 'ket y', true]], 'y');
T('select: nonaktif yang sedang terpilih tetap terpilih', /<option value="y" data-ket="ket y" selected>/.test(r.html) && !/disabled/.test(r.html));
r = K.bpSelect('', ['p', 'q'], 'zz', { fb: 'Hilang' });
T('select: nilai tersimpan yang tidak ada ditampilkan (jangan dikosongkan diam-diam)', /<option value="zz" data-ket="Pilih ulang" selected>Hilang<\/option>/.test(r.html), r.html);
r = K.bpSelect('', ['p', 'q'], '', { kosong: 'Semua', cari: true });
T('select: opsi kosong di atas + data-cari', /<select data-cari><option value="" selected>Semua<\/option>/.test(r.html), r.html);
T('select: grup kosong tidak ditulis', !/optgroup/.test(K.bpSelect('', [K.bpG('Kosong', [])], '').html));
T('select: teks di-escape', /&lt;b&gt;/.test(K.bpSelect('', [K.bpO('1', '<b>')], '1').html) && !/<b>/.test(K.bpSelect('', [K.bpO('1', '<b>')], '1').html));
const f = K.bpField('Kelas', ' id="k"', ['X', 'XI'], 'XI', { wajib: true, tanpaCari: true });
T('field: label.f + judul dari teks label + wajib', /^<label class="f">Kelas \*<select id="k" data-judul="Kelas" data-tanpa-cari>/.test(f), f);

/* tombol */
let b = K.uiBtn('Simpan', { act: 'simpan', v: 'primary', kecil: true, data: { id: 'a"b' } });
T('tombol: kelas baku, data-act, data-*, di-escape', b === '<button type="button" class="btn primary small" data-act="simpan" data-id="a&quot;b">Simpan</button>', b);
T('tombol: nonaktif, penuh, ikon', /class="btn block" disabled>.*<svg\/> Hapus/.test(K.uiBtn('Hapus', { penuh: true, off: true, ikon: '<svg/>' })));
T('tombol: baris tombol', K.uiBtns([b, b]).startsWith('<div class="btn-row">') && K.uiBtns(b, { grid: true }).includes('btn-grid'));

/* kartu */
let c = K.uiCard({ judul: 'Judul', sub: 'sub', aksi: b, isi: '<p>isi</p>', kaki: b, v: 'warn' });
T('kartu: kepala, isi, kaki, varian', /^<div class="card warn"><div class="card-h"><div class="card-t"><b>Judul<\/b><small class="note">sub<\/small><\/div><div class="card-a">/.test(c) && /<p>isi<\/p><div class="card-f">/.test(c), c);
T('kartu: tanpa judul dan aksi tidak ada kepala', !/card-h/.test(K.uiCard({ isi: 'x' })));

/* lipatan */
let l = K.uiLip({ judul: 'Rincian', sub: '3', isi: 'isi', buka: true, kunci: 'data-pkd="daftar"', kartu: true });
T('lipatan: details.lip dengan summary, sub, isi, open, kunci', /^<details class="lip card" data-pkd="daftar" open><summary><span class="lip-t">Rincian<\/span><small class="note lip-s">3<\/small><\/summary><div class="lip-b">isi<\/div><\/details>$/.test(l), l);

/* CSS dan pemasangan */
const css = baca('css/komponen.css'), idx = baca('index.html'), sw = baca('service-worker.js');
T('index.html: komponen.js tepat setelah util.js dan sebelum modul lain', idx.indexOf('js/util.js') > 0 && idx.indexOf('js/komponen.js') > idx.indexOf('js/util.js') && idx.indexOf('js/komponen.js') < idx.indexOf('js/dialog.js'));
T('index.html: komponen.css setelah banksoal.css, sebelum tampilan.css', idx.indexOf('css/komponen.css') > idx.indexOf('css/banksoal.css') && idx.indexOf('css/komponen.css') < idx.indexOf('css/tampilan.css'));
T('service worker menyimpan komponen.js dan komponen.css', /js\/komponen\.js/.test(sw) && /css\/komponen\.css/.test(sw));
T('CSS: varian ghost, solid, block, grow, btn-row', ['.btn.ghost', '.btn.danger.solid', '.btn.block', '.btn.grow', '.btn-row'].every((k) => css.includes(k)));
T('CSS: kartu card-h, card-f, flat, tint, warn/bad/ok', ['.card-h', '.card-f', '.card.flat', '.card.tint', '.card.warn', '.card.bad', '.card.ok'].every((k) => css.includes(k)));
T('CSS: lipatan lip + details polos + fokus terlihat + reduced-motion', css.includes('details.lip>summary') && css.includes('details:not([class])') && css.includes(':focus-visible') && css.includes('prefers-reduced-motion'));

/* audit: tombol lama tanpa type="button" di dalam markup JS bisa mengirim form tanpa sengaja */
const js = fs.readdirSync(new URL('../js/', import.meta.url)).filter((x) => x.endsWith('.js'));
let tanpaTipe = 0, gaya = 0;
for (const x of js) { const s = baca('js/' + x); tanpaTipe += (s.match(/<button class="btn(?![^>]*type=)/g) || []).length; gaya += (s.match(/<button[^>]*class="btn[^"]*"[^>]*style="/g) || []).length; }
T('tidak ada <button class="btn"> tanpa type="button"', tanpaTipe === 0, tanpaTipe);
console.log(`\nUji komponen: ${pass} lulus, ${fail} gagal` + (gaya ? `  (info: ${gaya} tombol btn masih bergaya inline)` : ''));
process.exit(fail ? 1 : 0);
