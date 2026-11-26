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
    createElement() { const o = { handlers: {}, innerHTML: '', id: '', className: '', dihapus: false, remove() { this.dihapus = true; }, addEventListener(t, f) { this.handlers[t] = f; }, querySelector: () => null }; return o; },
    body,
  };
  const ctx = { console, document, window: {}, esc: (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])), Array, Event: class { constructor(t) { this.type = t; } } };
  vm.createContext(ctx);
  vm.runInContext(baca('js/bank-pilihan.js'), ctx, { filename: 'bank-pilihan.js' });
  const opt = (v, t, extra = {}) => ({ tagName: 'OPTION', value: v, textContent: t, disabled: false, ...extra });
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
