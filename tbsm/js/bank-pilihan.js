/* bank-pilihan.js: daftar pilihan filter Bank soal (guru/admin) dengan huruf yang sama dengan kartu filter.
   Daftar pilihan bawaan HP (dialog <select> Android) memakai huruf besar dan tidak bisa diatur lewat CSS, jadi untuk dropdown filter
   Bank soal (Mapel, Kelas, Modul/LKPD, Elemen CP, Jenis, Peruntukan, Statistik ujian), Riwayat latihan siswa (Rombel/Kelas, Mapel) dan Atur latihan siswa (Mata pelajaran, Jenis soal) ketukan dialihkan ke lembar pilihan buatan
   aplikasi yang memakai huruf badan (15px). Nilai tetap ditulis ke <select> aslinya lalu peristiwa change dikirim, jadi semua logika
   filter (bank-bertingkat.js, banksoal.js, butir.js) tidak berubah. Lembar memakai kelas ui-ov, sehingga tombol back HP
   menutupnya lebih dulu (back.js). Dropdown lain di aplikasi tidak disentuh. Dimuat setelah bank-bertingkat.js. */
(function(){
 var SEL='#bq-mp,#bq-kls,#bq-mod,#bq-cp,#bl-mapel,#bl-tipe,#sf-kelas,#sf-sekolah,#sf-pilih,#sf-aksi,#sf-mf,#sf-tf,select[data-bs="flt"],select[data-bs="rlf"]';
 function cari(e){var t=e.target;return t&&t.matches&&t.matches(SEL)&&!t.disabled?t:null}
 function tutup(){var o=document.getElementById('bp-ov');if(o)o.remove()}
 function judul(s){
  var l=s.closest&&s.closest('label'),n=l&&l.firstChild;
  return n&&n.nodeType===3?String(n.nodeValue).trim():'Pilih';
 }
 function buka(s){
  tutup();
  var opts=[],cur=s.value,h='';
  function it(o){
   opts.push(o);
   return '<button type="button" class="bp-i" role="option" data-i="'+(opts.length-1)+'" aria-selected="'+(o.value===cur)+'"'+(o.disabled?' disabled':'')+'>'+esc(o.textContent)+'</button>';
  }
  Array.prototype.forEach.call(s.children,function(c){
   if(c.tagName==='OPTGROUP'){h+='<div class="bp-g">'+esc(c.label)+'</div>';Array.prototype.forEach.call(c.children,function(o){h+=it(o)})}
   else if(c.tagName==='OPTION')h+=it(c);
  });
  var jd=judul(s),ov=document.createElement('div');
  ov.id='bp-ov';ov.className='ui-ov bp-ov';
  ov.innerHTML='<div class="bp-sheet" role="dialog" aria-modal="true" aria-label="'+esc(jd)+'"><div class="bp-h"><span>'+esc(jd)+'</span><button type="button" class="bp-x" data-u="x">Tutup</button></div><div class="bp-l" role="listbox">'+h+'</div></div>';
  ov.addEventListener('click',function(e){
   var t=e.target;
   if(t===ov||(t.closest&&t.closest('.bp-x'))){tutup();return}
   var b=t.closest&&t.closest('.bp-i');if(!b||b.disabled)return;
   var o=opts[+b.getAttribute('data-i')];tutup();
   if(o&&s.value!==o.value){s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  document.body.appendChild(ov);
  var on=ov.querySelector('[aria-selected="true"]');if(on&&on.scrollIntoView)on.scrollIntoView({block:'center'});
 }
 /* mencegah dialog bawaan, lalu membuka lembar sendiri */
 document.addEventListener('mousedown',function(e){if(cari(e))e.preventDefault()},true);
 document.addEventListener('click',function(e){var s=cari(e);if(!s)return;e.preventDefault();e.stopPropagation();buka(s)},true);
 document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){tutup();return}
  var s=cari(e);if(s&&(e.key==='Enter'||e.key===' ')){e.preventDefault();buka(s)}
 },true);
})();
