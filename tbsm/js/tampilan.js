/* tampilan.js: PUSAT pengaturan tampilan.
   - Bawaan untuk semua pengguna: ubah TP_BAWAAN lalu push.
   - Pilihan pengguna (menu Tampilan) disimpan di perangkat itu saja dan mengalahkan bawaan.
   - Gayanya ada di css/tampilan.css. Setelan baru: tambah satu baris di TP_SET dan aturannya di sana. */
var TP_BAWAAN={huruf:'normal',sudut:'normal',jarak:'normal',basmalah:'tampil',ringkas:'aktif',label:'tampil'};
var TP_SET=[
 ['huruf','Ukuran huruf isi',[['kecil','Kecil'],['normal','Normal'],['besar','Besar']]],
 ['sudut','Bentuk sudut',[['tegas','Tegas'],['normal','Normal'],['bulat','Bulat']]],
 ['jarak','Jarak antarisi',[['rapat','Rapat'],['normal','Normal']]],
 ['basmalah','Basmalah di bar atas',[['tampil','Tampil'],['sembunyi','Sembunyi']]],
 ['ringkas','Header mengecil saat digulir',[['aktif','Aktif'],['mati','Mati']]],
 ['label','Label di bawah judul menu',[['tampil','Tampil'],['sembunyi','Sembunyi']]]];
var TP_KUNCI='tbsm_tampilan';
function tpSimpanan(){try{return JSON.parse(localStorage.getItem(TP_KUNCI))||{}}catch(e){return {}}}
/* hanya nilai yang dikenal yang dipakai; selain itu kembali ke bawaan */
function tpNilai(){
 var s=tpSimpanan(),o={};
 TP_SET.forEach(function(x){var ok=x[2].some(function(p){return p[0]===s[x[0]]});o[x[0]]=ok?s[x[0]]:TP_BAWAAN[x[0]]});
 return o;
}
function tpTerap(){var o=tpNilai(),r=document.documentElement;Object.keys(o).forEach(function(k){r.setAttribute('data-tp-'+k,o[k])})}
function tpUbah(k,v){
 var s=tpSimpanan();if(k)s[k]=v;else s={};
 try{localStorage.setItem(TP_KUNCI,JSON.stringify(s))}catch(e){}
 tpTerap();
 if(tpNilai().ringkas==='mati'){var h=document.querySelector('header.top');if(h){h.classList.remove('mini');h.style.marginBottom=''}}
}
function tpIsi(){
 var o=tpNilai();
 return '<div class="tp-box" role="dialog" aria-modal="true" aria-label="Tampilan"><div class="tp-atas"><b>Tampilan</b><button type="button" class="btn small primary" data-tp="tutup">Selesai</button></div>'+
  TP_SET.map(function(x){return '<div class="tp-grup"><span>'+x[1]+'</span><div class="tp-pil">'+x[2].map(function(p){return '<button type="button" data-tp="set" data-k="'+x[0]+'" data-v="'+p[0]+'" aria-pressed="'+(o[x[0]]===p[0])+'">'+p[1]+'</button>'}).join('')+'</div></div>'}).join('')+
  '<button type="button" class="btn small" data-tp="reset">Kembalikan ke bawaan</button><p class="note">Pilihan ini berlaku di perangkat ini saja.</p></div>';
}
function tpTutup(){var el=document.getElementById('tp-panel');if(el)el.remove()}
function tpBuka(){tpTutup();var el=document.createElement('div');el.id='tp-panel';el.innerHTML=tpIsi();document.body.appendChild(el)}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-tp]');
 if(!b){if(e.target.id==='tp-panel')tpTutup();return}
 var a=b.getAttribute('data-tp');
 if(a==='buka'){var t=document.querySelector('#drawer [data-act="drawerclose"]');if(t)t.click();tpBuka()}
 else if(a==='tutup')tpTutup();
 else{tpUbah(a==='set'?b.getAttribute('data-k'):'',b.getAttribute('data-v'));document.getElementById('tp-panel').innerHTML=tpIsi()}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape')tpTutup()});
tpTerap();
/* baris menu Tampilan. Dipanggil menu-dasbor.js SEBELUM pengelompokan agar jumlah isi kelompok benar. */
function tpMenu(sb){
 if(!sb||sb.querySelector('[data-v="tampilan"]'))return;
 var a=sb.querySelector('.srow[data-v="gantisandi"]')||sb.querySelector('.srow[data-v="keluar"]');
 if(a)a.insertAdjacentHTML('beforebegin','<button type="button" class="srow" data-v="tampilan" data-tp="buka"><span class="ico">'+svg(ICO.gear||ICO.menu,22)+'</span><span class="st"><b>Tampilan</b><small>Huruf, sudut, jarak, header</small></span>'+svg(ICO.chev,18)+'</button>');
}
if(typeof render==='function'){var _tpRender=render;render=function(){var r=_tpRender.apply(this,arguments);
 try{tpMenu(document.querySelector('#drawer .sbody'))}catch(e){}
 return r}}
