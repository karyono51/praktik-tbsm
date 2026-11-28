/* komponen.js: pembangun HTML bersama untuk pilihan (select), tombol, kartu, dan lipatan. Dimuat setelah util.js, sebelum modul lain.
   Tujuannya satu bentuk baku, supaya tampilan dan perilaku sama di semua menu, dan modul baru tidak menulis ulang markup.
   Gaya ada di css/komponen.css. Semua fungsi murni (tanpa DOM), jadi bisa diuji dengan node.

   PILIHAN (select) -> memakai lembar pilihan js/bank-pilihan.js
   Bentuk data: opsi = {v:nilai, l:teks, ket:keterangan kecil, off:true bila tidak boleh dipilih}; kelompok = {g:judul, o:[opsi]};
   daftar = larik opsi/kelompok. Daftar sederhana [nilai,teks,ket,off] atau string tunggal juga diterima.
   bpSelect(attr, daftar, nilaiSaatIni, {judul, cari, tanpaCari, kosong, fb}) -> {html, ket}
     attr     atribut tambahan pada <select>, diawali spasi, mis. ' data-pk="tempat"'. Wajib sudah di-escape pemanggil.
     judul    judul lembar pilihan (data-judul). Bila kosong, bank-pilihan memakai teks label.
     cari     true memaksa kotak Cari; tanpaCari true menyembunyikannya (otomatis tampil bila 8 pilihan atau lebih).
     kosong   teks pilihan kosong di paling atas (value=""), mis. 'Semua'. Tanpa ini tidak ada pilihan kosong.
     fb       teks untuk nilai tersimpan yang sudah tidak ada di daftar (supaya ubah data tidak mengosongkannya diam-diam).
   Nilai yang sedang terpilih tidak pernah ikut dinonaktifkan. */
(function(G){
 function h(s){return typeof G.esc==='function'?G.esc(s):String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function bpO(v,l,ket,off){return {v:v,l:l,ket:ket||'',off:!!off}}
 function bpG(g,o){return {g:g,o:o}}
 function bpNorm(L){return (L||[]).map(function(x){return Array.isArray(x)?bpO(x[0],x[1],x[2],x[3]):(typeof x==='string'||typeof x==='number'?bpO(x,x):x)})}
 function bpFlat(L){var out=[];bpNorm(L).forEach(function(x){if(x.o)x.o.forEach(function(y){out.push(y)});else out.push(x)});return out}
 function bpSelect(attr,L,cur,opt){
  opt=opt||{};cur=cur==null?'':String(cur);L=bpNorm(L);
  if(opt.kosong!=null&&!bpFlat(L).some(function(o){return String(o.v)===''}))L=[bpO('',opt.kosong)].concat(L);
  if(cur&&!bpFlat(L).some(function(o){return String(o.v)===cur}))L=L.concat([bpO(cur,opt.fb||'(data tidak ditemukan)','Pilih ulang')]);
  function one(o){return '<option value="'+h(o.v)+'"'+(o.ket?' data-ket="'+h(o.ket)+'"':'')+(String(o.v)===cur?' selected':(o.off?' disabled':''))+'>'+h(o.l)+'</option>'}
  var body=L.map(function(x){return x.o?(x.o.length?'<optgroup label="'+h(x.g)+'">'+x.o.map(one).join('')+'</optgroup>':''):one(x)}).join(''),
   a=(opt.judul?' data-judul="'+h(opt.judul)+'"':'')+(opt.cari?' data-cari':'')+(opt.tanpaCari?' data-tanpa-cari':''),
   sel=bpFlat(L).filter(function(o){return String(o.v)===cur})[0];
  return {html:'<select'+(attr||'')+a+'>'+body+'</select>',ket:sel&&sel.ket||''};
 }
 /* Pilihan dengan label: <label class="f">Teks<select>...</select></label>. Bentuk paling sering dipakai di formulir. */
 function bpField(label,attr,L,cur,opt){
  opt=opt||{};var r=bpSelect(attr,L,cur,{judul:opt.judul||label,cari:opt.cari,tanpaCari:opt.tanpaCari,kosong:opt.kosong,fb:opt.fb});
  return '<label class="f">'+h(label)+(opt.wajib?' *':'')+r.html+'</label>';
 }

 /* TOMBOL
    uiBtn(teks, {act, data:{k:v}, v:'primary'|'danger'|'ghost', kecil, penuh, tumbuh, off, ikon(html), tipe, aria}) -> string HTML
    Satu kelas dasar .btn, varian lewat kelas: primary, danger, ghost; ukuran small; lebar block (penuh) atau grow (tumbuh). */
 function uiBtn(teks,o){
  o=o||{};
  var c='btn'+(o.v?' '+o.v:'')+(o.kecil?' small':'')+(o.penuh?' block':'')+(o.tumbuh?' grow':'')+(o.cls?' '+o.cls:''),
   d=o.data?Object.keys(o.data).map(function(k){return ' data-'+k+'="'+h(o.data[k])+'"'}).join(''):'';
  return '<button type="'+(o.tipe||'button')+'" class="'+c+'"'+(o.act?' data-act="'+h(o.act)+'"':'')+d+(o.off?' disabled':'')+(o.aria?' aria-label="'+h(o.aria)+'"':'')+'>'+(o.ikon||'')+(o.ikon&&teks?' ':'')+h(teks)+'</button>';
 }
 /* Baris tombol: aksi utama di kanan, satu baris di HP; bila tak muat turun ke baris baru. */
 function uiBtns(isi,o){o=o||{};return '<div class="btn-row'+(o.grid?' btn-grid':'')+(o.rata?' '+o.rata:'')+'">'+(Array.isArray(isi)?isi.join(''):isi)+'</div>'}

 /* KARTU
    uiCard({judul, sub, aksi(html), isi(html), kaki(html), v:'flat'|'tint'|'warn'|'bad'|'ok', cls}) -> string HTML
    Kepala kartu: judul di kiri, aksi (tombol kecil) di kanan. Isi di tengah. Kaki berisi tombol-tombol aksi kartu. */
 function uiCard(o){
  o=o||{};
  var kep=(o.judul||o.aksi)?'<div class="card-h"><div class="card-t">'+(o.judul?'<b>'+h(o.judul)+'</b>':'')+(o.sub?'<small class="note">'+h(o.sub)+'</small>':'')+'</div>'+(o.aksi?'<div class="card-a">'+o.aksi+'</div>':'')+'</div>':'';
  return '<div class="card'+(o.v?' '+o.v:'')+(o.cls?' '+o.cls:'')+'">'+kep+(o.isi||'')+(o.kaki?'<div class="card-f">'+o.kaki+'</div>':'')+'</div>';
 }

 /* LIPATAN
    uiLip({judul, sub, isi(html), buka, kunci(data-pkd dsb. tanpa data-), kartu:true bila dibungkus kartu, cls}) -> string HTML
    Satu bentuk <details class="lip"> dengan panah di kanan. Hitungan/keterangan pendek ditaruh di sub. */
 function uiLip(o){
  o=o||{};
  return '<details class="lip'+(o.kartu?' card':'')+(o.cls?' '+o.cls:'')+'"'+(o.kunci?' '+o.kunci:'')+(o.buka?' open':'')+'><summary><span class="lip-t">'+h(o.judul||'')+'</span>'+(o.sub?'<small class="note lip-s">'+h(o.sub)+'</small>':'')+'</summary><div class="lip-b">'+(o.isi||'')+'</div></details>';
 }

 G.bpO=bpO;G.bpG=bpG;G.bpNorm=bpNorm;G.bpFlat=bpFlat;G.bpSelect=bpSelect;G.bpField=bpField;
 G.uiBtn=uiBtn;G.uiBtns=uiBtns;G.uiCard=uiCard;G.uiLip=uiLip;
})(this);
