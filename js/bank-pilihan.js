/* bank-pilihan.js: lembar pilihan buatan aplikasi untuk SEMUA dropdown (<select>), dengan huruf seperti menu samping (14px).
   Daftar pilihan bawaan HP (dialog <select> Android) memakai huruf besar dan tidak bisa diatur lewat CSS, jadi ketukan pada <select>
   dialihkan ke lembar pilihan yang mengikuti tema. Nilai tetap ditulis ke <select> aslinya lalu peristiwa input dan change dikirim, jadi
   logika halaman mana pun tidak berubah. Lembar memakai kelas ui-ov, sehingga tombol back HP menutupnya lebih dulu (back.js).
   Dikecualikan: <select multiple>, <select size>, select di dalam tabel (cetak/UKK), dan select yang diberi atribut data-native.
   Atribut yang dikenali (semuanya opsional):
   - select[data-judul="..."]  judul lembar (bila tidak ada: aria-label, teks label, teks tepat di atas, judul kartu, lalu "Pilih").
   - option[data-ket="..."]    keterangan kecil di bawah teks pilihan (mis. nama lengkap jurusan).
   - option[value=""]          dianggap pilihan kosong: tampil redup dan terpisah, memilihnya mengosongkan isian.
   - Pembangun HTML bersama: bpSelect / bpField di js/komponen.js (menulis atribut di atas dengan benar).
   - kotak Cari muncul otomatis bila pilihan 8 atau lebih; select[data-cari] memaksa tampil, select[data-tanpa-cari] menyembunyikan. */
(function(){
 function bolehGanti(t){return !!t&&t.tagName==='SELECT'&&!t.disabled&&!t.multiple&&!(t.size>1)&&!t.hasAttribute('data-native')&&!(t.closest&&t.closest('table,#bp-ov'))}
 function cari(e){var t=e.target;return bolehGanti(t)?t:null}
 function tutup(){var o=document.getElementById('bp-ov');if(o)o.remove()}
 function judul(s){
  var a=s.getAttribute('data-judul')||s.getAttribute('aria-label');if(a)return a;
  var l=s.closest&&s.closest('label'),n=l&&l.firstChild;
  if(n&&n.nodeType===3&&String(n.nodeValue).trim())return String(n.nodeValue).trim();
  /* label yang teksnya tidak di simpul pertama (mis. didahului ikon): ambil semua teks langsung milik label */
  if(l&&l.childNodes){var tx='';Array.prototype.forEach.call(l.childNodes,function(c){if(c.nodeType===3)tx+=c.nodeValue});tx=tx.replace(/\s+/g,' ').trim();if(tx&&tx.length<=60)return tx}
  var p=s.previousElementSibling,t=p&&String(p.textContent||'').trim();
  if(t&&t.length<=60&&!p.querySelector('select,input'))return t;
  var c=s.closest&&s.closest('.card'),b=c&&c.querySelector('b,h2,h3,.label');
  t=b&&String(b.textContent||'').trim();
  return t&&t.length<=60?t:'Pilih';
 }
 var AMBANG_CARI=8;
 function buka(s){
  tutup();
  var opts=[],cur=s.value,h='',n=0;
  function ket(o){var k=o.getAttribute&&o.getAttribute('data-ket');return k?String(k):''}
  function it(o){
   opts.push(o);
   var kosong=o.value==='',k=ket(o);
   if(!kosong)n++;
   return '<button type=\"button\" class=\"bp-i'+(kosong?' bp-kosong':'')+'\" role=\"option\" data-i=\"'+(opts.length-1)+'\" aria-selected=\"'+(o.value===cur)+'\"'+(o.disabled?' disabled':'')+'>'+esc(o.textContent)+(k?'<small class=\"bp-k\">'+esc(k)+'</small>':'')+'</button>';
  }
  Array.prototype.forEach.call(s.children,function(c){
   if(c.tagName==='OPTGROUP'){h+='<div class=\"bp-g\">'+esc(c.label)+'</div>';Array.prototype.forEach.call(c.children,function(o){h+=it(o)})}
   else if(c.tagName==='OPTION')h+=it(c);
  });
  var cari=!s.hasAttribute('data-tanpa-cari')&&(s.hasAttribute('data-cari')||n>=AMBANG_CARI);
  var jd=judul(s),ov=document.createElement('div');
  ov.id='bp-ov';ov.className='ui-ov bp-ov';
  ov.innerHTML='<div class=\"bp-sheet\" role=\"dialog\" aria-modal=\"true\" aria-label=\"'+esc(jd)+'\"><div class=\"bp-h\"><span>'+esc(jd)+'</span><button type=\"button\" class=\"bp-x\" data-u=\"x\">Tutup</button></div>'+(cari?'<input type=\"search\" class=\"bp-q\" placeholder=\"Cari pilihan\" aria-label=\"Cari pilihan\" autocomplete=\"off\">':'')+'<div class=\"bp-l\" role=\"listbox\">'+h+'<p class=\"bp-0\" hidden>Tidak ada yang cocok.</p></div></div>';
  ov.addEventListener('click',function(e){
   var t=e.target;
   if(t===ov||(t.closest&&t.closest('.bp-x'))){tutup();return}
   var b=t.closest&&t.closest('.bp-i');if(!b||b.disabled)return;
   var o=opts[+b.getAttribute('data-i')];tutup();
   if(o&&s.value!==o.value){s.value=o.value;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  /* kotak Cari: menyaring pilihan menurut teks dan keterangannya; judul kelompok yang kosong ikut disembunyikan */
  ov.addEventListener('input',function(e){
   var t=e.target;if(!t||!t.classList||!t.classList.contains('bp-q'))return;
   var q=String(t.value||'').trim().toLowerCase(),ada=0,grup=null,grupAda=0;
   function tutupGrup(){if(grup)grup.hidden=!grupAda}
   Array.prototype.forEach.call(ov.querySelectorAll('.bp-g,.bp-i'),function(x){
    if(x.classList.contains('bp-g')){tutupGrup();grup=x;grupAda=0;return}
    var cocok=!q||String(x.textContent||'').toLowerCase().indexOf(q)>-1;
    x.hidden=!cocok;if(cocok){ada++;grupAda++}
   });
   tutupGrup();
   var kos=ov.querySelector('.bp-0');if(kos)kos.hidden=ada>0;
  });
  document.body.appendChild(ov);
  var on=ov.querySelector('[aria-selected="true"]');if(on&&on.scrollIntoView)on.scrollIntoView({block:'center'});
 }
 /* Mata pelajaran di form soal: kolom ketik bebas + tombol Pilih yang membuka daftar mapel (pengganti datalist bawaan yang sering kosong di Android) */
 function bukaMapel(){
  var inp=document.getElementById('bf-mapel');if(!inp)return;
  tutup();
  var list=(window.bsMapelList?bsMapelList():[]),cur=String(inp.value||'').trim(),opts=[],h='';
  function it(m){opts.push(m);return '<button type=\"button\" class=\"bp-i\" role=\"option\" data-i=\"'+(opts.length-1)+'\" aria-selected=\"'+(m===cur)+'\">'+esc(m)+'</button>'}
  if(window.bsMapelGrup)bsMapelGrup(list).forEach(function(g){h+='<div class=\"bp-g\">'+esc(g.judul)+'</div>'+g.items.map(it).join('')});
  else h+=list.map(it).join('');
  if(!list.length)h+='<p class=\"bp-g\">Belum ada mapel. Ketik nama mapel di kolomnya.</p>';
  var ov=document.createElement('div');
  ov.id='bp-ov';ov.className='ui-ov bp-ov';
  ov.innerHTML='<div class=\"bp-sheet\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Mata pelajaran\"><div class=\"bp-h\"><span>Mata pelajaran</span><button type=\"button\" class=\"bp-x\" data-u=\"x\">Tutup</button></div><div class=\"bp-l\" role=\"listbox\">'+h+'<button type=\"button\" class=\"bp-i bp-baru\" data-baru=\"1\">+ Ketik mapel baru</button></div></div>';
  ov.addEventListener('click',function(e){
   var t=e.target;
   if(t===ov||(t.closest&&t.closest('.bp-x'))){tutup();return}
   var b=t.closest&&t.closest('.bp-i');if(!b)return;
   if(b.getAttribute('data-baru')){tutup();inp.focus();return}
   var m=opts[+b.getAttribute('data-i')];tutup();
   if(m!==undefined){inp.value=m;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  document.body.appendChild(ov);
  var on=ov.querySelector('[aria-selected=\"true\"]');if(on&&on.scrollIntoView)on.scrollIntoView({block:'center'});
 }
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bs=\"pilmapel\"]');if(!b)return;e.preventDefault();e.stopPropagation();bukaMapel()},true);
 /* mencegah dialog bawaan, lalu membuka lembar sendiri */
 document.addEventListener('mousedown',function(e){if(cari(e))e.preventDefault()},true);
 document.addEventListener('click',function(e){var s=cari(e);if(!s)return;e.preventDefault();e.stopPropagation();buka(s)},true);
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){tutup();return}
  var s=cari(e);if(s&&(e.key==='Enter'||e.key===' ')){e.preventDefault();buka(s)}
 },true);
})();
