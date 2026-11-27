/* Uji lembar pilihan buatan aplikasi (js/bank-pilihan.js): node tools/uji-pilihan.mjs
   Memastikan SEMUA <select> biasa dialihkan ke lembar tema, dengan pengecualian yang disengaja, dan nilai ditulis balik dengan input + change. */
import fs from 'node:fs'; import vm from 'node:vm';
let pass = 0, fail = 0;
const T = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  GAGAL ') + n + (c ? '' : ' ' + JSON.stringify(i))); };
const baca = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

function boot() {
  const hs = {}, body = { kids: [], appendChild(o) { this.kids.push(o); } };
  const ovs = {};
  const document = {
    addEventListener(t, f) { (hs[t] = hs[t] || []).push(f); },
    getElementById(id) { return id === 'bp-ov' ? (body.kids.filter((k) => !k.dihapus).pop() || null) : null; },
    createElement() {
      const o = { handlers: {}, innerHTML: '', id: '', className: '', dihapus: false, remove() { this.dihapus = true; }, addEventListener(t, f) { this.handlers[t] = f; },
        _n: null,
        nodes() { if (!this._n) { this._n = []; const re = /<(button|div|p)[^>]*? class="(bp-i[^"]*|bp-g|bp-0)"([^>]*)>([\s\S]*?)<\/\1>/g; let m; while ((m = re.exec(this.innerHTML))) { const k = m[2]; this._n.push({ className: k, hidden: / hidden/.test(m[3]), textContent: m[4].replace(/<[^>]+>/g, ' '), classList: { contains: (c) => k.split(' ').indexOf(c) > -1 } }); } } return this._n; },
        querySelectorAll(sel) { const ok = sel.split(',').map((x) => x.trim().replace('.', '')); return this.nodes().filter((n) => ok.some((c) => n.classList.contains(c))); },
        querySelector(sel) { if (sel === '.bp-0') return this.nodes().find((n) => n.classList.contains('bp-0')) || null; return null; } };
      return o;
    },
    body,
  };
  const ctx = { console, document, window: {}, esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])), Array, Event: class { constructor(t) { this.type = t; } } };
  vm.createContext(ctx);
  vm.runInContext(baca('js/bank-pilihan.js'), ctx, { filename: 'bank-pilihan.js' });
  const opt = (v, t, extra = {}) => ({ tagName: 'OPTION', value: v, textContent: t, disabled: false, ket: extra.ket, getAttribute(a) { return a === 'data-ket' ? this.ket || null : null; }, ...extra });
  function select(over = {}) {
    const ev = [];
    const s = { tagName: 'SELECT', disabled: false, multiple: false, size: 0, value: 'X', attrs: over.attrs || {}, inTable: !!over.inTable, ev,
      hasAttribute(a) { return a in this.attrs; }, getAttribute(a) { return this.attrs[a] || null; },
      closest(sel) { if (/table/.test(sel)) return this.inTable ? {} : null; return null; },
      previousElementSibling: over.prev || null, children: over.children || [opt('X', 'Kelas X'), opt('XI', 'Kelas XI'), opt('XII', 'Kelas XII')],
      dispatchEvent(e) { ev.push(e.type); return true; }, ...over.props };
    return s;
  }
  function klik(target) {
    let dicegah = false;
    const e = { target, preventDefault() { dicegah = true; }, stopPropagation() {} };
    target.closest = target.closest || (() => null);
    (hs.click || []).forEach((f) => f(e));
    return dicegah;
  }
  const sheet = () => body.kids.filter((k) => !k.dihapus).pop() || null;
  return { klik, select, sheet, body, hs, opt };
}

console.log('Dropdown biasa dialihkan');
{
  const b = boot(); const s = b.select({ attrs: { 'aria-label': 'Kelas' } });
  const dicegah = b.klik(s);
  const o = b.sheet();
  T('ketukan pada select membuka lembar, dialog bawaan dicegah', dicegah && !!o && /bp-sheet/.test(o.innerHTML));
  T('lembar memuat semua opsi dan judul dari aria-label', o && (o.innerHTML.match(/class="bp-i"/g) || []).length === 3 && /aria-label="Kelas"/.test(o.innerHTML));
  T('opsi aktif bertanda terpilih', o && /data-i="0" aria-selected="true"/.test(o.innerHTML));
  const pilih = { closest: (sel) => (/bp-i/.test(sel) ? { getAttribute: () => '2', disabled: false } : null) };
  o.handlers.click({ target: pilih });
  T('memilih opsi menulis nilai, kirim input lalu change, lembar tertutup', s.value === 'XII' && s.ev.join() === 'input,change' && b.sheet() === null, { v: s.value, ev: s.ev });
}
{
  const b = boot(); const s = b.select({ children: [b.opt('X', 'Kelas X')] });
  b.klik(s); const o = b.sheet();
  o.handlers.click({ target: { closest: (sel) => (/bp-i/.test(sel) ? { getAttribute: () => '0', disabled: false } : null) } });
  T('memilih opsi yang sama tidak memicu perubahan', s.ev.length === 0);
}

console.log('Pengecualian yang disengaja');
{
  const b = boot();
  T('select di dalam tabel (cetak/UKK) tidak diganti', !b.klik(b.select({ inTable: true })) && b.sheet() === null);
  T('select multiple tidak diganti', !b.klik(b.select({ props: { multiple: true } })) && b.sheet() === null);
  T('select ber-size (daftar) tidak diganti', !b.klik(b.select({ props: { size: 5 } })) && b.sheet() === null);
  T('select data-native tidak diganti', !b.klik(b.select({ attrs: { 'data-native': '' } })) && b.sheet() === null);
  T('select nonaktif tidak diganti', !b.klik(b.select({ props: { disabled: true } })) && b.sheet() === null);
  T('elemen bukan select diabaikan', !b.klik({ tagName: 'INPUT' }) && b.sheet() === null);
}

console.log('Judul lembar');
{
  const b = boot(); b.klik(b.select({ prev: { textContent: 'Tempat praktik', querySelector: () => null } }));
  T('judul dari teks tepat di atas select', /aria-label="Tempat praktik"/.test(b.sheet().innerHTML));
  const b2 = boot(); b2.klik(b2.select());
  T('tanpa petunjuk judul memakai "Pilih"', /aria-label="Pilih"/.test(b2.sheet().innerHTML));
}

console.log('Fitur lembar pilihan');
{
  const b = boot(); const s = b.select({ attrs: { 'data-judul': 'Jurusan' }, children: [b.opt('', 'Pilih jurusan'), b.opt('TSM', 'TSM', { ket: 'Teknik Sepeda Motor' }), b.opt('TKJ', 'TKJ', { ket: 'Teknik Komputer dan Jaringan' })], props: { value: 'TKJ' } });
  b.klik(s); const h = b.sheet().innerHTML;
  T('data-judul dipakai sebagai judul lembar', /aria-label="Jurusan"/.test(h) && /<span>Jurusan<\/span>/.test(h));
  T('keterangan pilihan tampil di bawah teks', /TSM<small class="bp-k">Teknik Sepeda Motor<\/small>/.test(h));
  T('pilihan kosong (value "") diberi gaya redup', /class="bp-i bp-kosong"[^>]*>Pilih jurusan/.test(h) && (h.match(/bp-kosong/g) || []).length === 1);
  T('pilihan aktif bertanda terpilih (TKJ)', /data-i="2" aria-selected="true"/.test(h));
  T('daftar pendek: tanpa kotak cari', !/class="bp-q"/.test(h));
  const kos = { closest: (sel) => (/bp-i/.test(sel) ? { getAttribute: () => '0', disabled: false } : null) };
  b.sheet().handlers.click({ target: kos });
  T('memilih pilihan kosong mengosongkan isian', s.value === '' && s.ev.join() === 'input,change');
}
{
  const banyak = (b, n) => Array.from({ length: n }, (_, i) => b.opt('v' + i, i % 2 ? 'Teman ' + i : 'Media sosial ' + i));
  const b = boot(); b.klik(b.select({ children: banyak(b, 7) }));
  T('7 pilihan: tanpa kotak cari', !/class="bp-q"/.test(b.sheet().innerHTML));
  const b2 = boot(); b2.klik(b2.select({ children: banyak(b2, 8) }));
  T('8 pilihan atau lebih: muncul kotak cari', /class="bp-q"/.test(b2.sheet().innerHTML));
  const b3 = boot(); b3.klik(b3.select({ children: banyak(b3, 12), attrs: { 'data-tanpa-cari': '' } }));
  T('data-tanpa-cari menyembunyikan kotak cari', !/class="bp-q"/.test(b3.sheet().innerHTML));
  const b4 = boot(); b4.klik(b4.select({ children: banyak(b4, 3), attrs: { 'data-cari': '' } }));
  T('data-cari memaksa kotak cari tampil', /class="bp-q"/.test(b4.sheet().innerHTML));
  const o = b2.sheet(); const sat = (v) => o.handlers.input({ target: { classList: { contains: (c) => c === 'bp-q' }, value: v } });
  const tampil = () => o.querySelectorAll('.bp-i').filter((n) => !n.hidden).length;
  sat('teman'); T('cari menyaring pilihan menurut teks', tampil() === 4, tampil());
  T('tanpa hasil: pesan "Tidak ada yang cocok" tampil', (sat('zzz'), o.querySelector('.bp-0').hidden === false && tampil() === 0));
  sat(''); T('kosongkan cari: semua pilihan kembali', tampil() === 8 && o.querySelector('.bp-0').hidden === true);
}

console.log('Berkas dan tema');
{
  const css = baca('css/banksoal.css');
  T('huruf pilihan 14px seperti menu', /\.bp-i\{[^}]*font-size:14px/.test(css));
  const js = baca('js/bank-pilihan.js');
  T('tidak lagi memakai daftar selektor tetap', !/#bq-mp|#sf-kelas/.test(js));
  T('index.html memuat bank-pilihan.js', /js\/bank-pilihan\.js\?v=[0-9a-f]+/.test(baca('index.html')));
}

console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
