/* lkpd-v2-banner.js: banner gradien interaktif untuk kartu pertemuan/kegiatan LKPD v2 (LKPD-X-07), tab Lembar Kerja.
   Aditif: membungkus lk2Kerja (lkpd-v2.js) dan hanya mengganti kepala kartu `section.lk2-p`. Kunci isian, draf, foto, nilai,
   timer, dan sinkronisasi tidak disentuh. Dimuat tepat setelah lkpd-v2.js.
   Interaksi:
   - Gradien warna mengikuti kegiatan (1 jangka sorong hijau, 2 mikrometer teal, 3 dial gauge amber, 4 perawatan merah, lainnya hijau-merah logo).
   - Cincin dan bilah progres menghitung langkah kerja yang dicentang pada kartu itu, diperbarui langsung saat dicentang (tanpa render ulang).
   - Ketuk banner untuk melipat/membuka isi kartu (status diingat selama sesi). Isian tetap ada di halaman, jadi tetap tersimpan.
   - Gerak halus hanya bila perangkat tidak meminta kurangi gerak. Saat dicetak atau dibuat PDF, banner tidak dipakai. */
var PAL={1:['#19A85F','#0B6B3A'],2:['#2A9D8F','#0B5E52'],3:['#E8A21F','#B45309'],4:['#EF5361','#B3121F'],0:['#0F8A4B','#064E2B']};
(function(){
var st=document.createElement('style');st.textContent=
'.lkb{--g1:#0F8A4B;--g2:#064E2B;position:relative;display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:center;margin:-2px -2px 12px;padding:14px 14px 16px;border-radius:16px;color:#fff;cursor:pointer;overflow:hidden;'+
'background:linear-gradient(120deg,var(--g1),var(--g2) 55%,var(--g1));background-size:220% 100%;box-shadow:0 10px 22px -14px var(--g2);-webkit-tap-highlight-color:transparent;user-select:none}'+
'.lkb::before{content:"";position:absolute;right:-26px;top:-34px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 68%);pointer-events:none}'+
'.lkb::after{content:"";position:absolute;left:14px;bottom:0;width:46px;height:4px;border-radius:4px 4px 0 0;background:linear-gradient(90deg,#fff 0 70%,#D0101E 70%)}'+
'.lkb:focus-visible{outline:3px solid var(--accent);outline-offset:2px}'+
'.lkb-k{grid-column:1;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;opacity:.9;font-weight:700}'+
'.lkb h2{grid-column:1;margin:0;color:#fff;font-size:17px;line-height:1.25}'+
'.lkb-m{grid-column:1;display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}'+
'.lkb-m span{padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.2);font-size:12px;font-weight:600;white-space:nowrap}'+
'.lkb-r{grid-column:2;grid-row:1/4;position:relative;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;'+
'background:conic-gradient(#fff calc(var(--p,0)*1%),rgba(255,255,255,.25) 0)}'+
'.lkb-r::before{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--g2)}'+
'.lkb-r b{position:relative;font-size:13px}'+
'.lkb-bar{grid-column:1/-1;height:5px;margin-top:8px;border-radius:9px;background:rgba(255,255,255,.25);overflow:hidden}'+
'.lkb-bar i{display:block;height:100%;width:calc(var(--p,0)*1%);border-radius:9px;background:#fff}'+
'.lkb-c{position:absolute;right:12px;bottom:6px;font-size:11px;opacity:.85}'+
'.lkb-c::before{content:"\\25BE";display:inline-block;transition:transform .2s}'+
'.lk2-p.lkb-lipat .lkb-c::before{transform:rotate(-90deg)}'+
'.lk2-p.lkb-lipat>:not(.lkb){display:none!important}'+
'.lkb[data-done="1"] .lkb-r b::after{content:"\\2713";margin-left:1px}'+
'@media(prefers-reduced-motion:no-preference){.lkb{animation:lkbGeser 14s ease-in-out infinite alternate}.lkb-bar i{transition:width .35s}.lkb[data-done="1"] .lkb-r{animation:lkbDenyut 1.6s ease-in-out 2}'+
'@keyframes lkbGeser{from{background-position:0 0}to{background-position:100% 0}}@keyframes lkbDenyut{50%{transform:scale(1.1)}}}'+
'@media print{.lkb{display:none!important}.lk2-p.lkb-lipat>:not(.lkb){display:block!important}}';
document.head.appendChild(st)})();

function lkbEsc(s){return typeof lkEsc==='function'?lkEsc(s):String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function lkbPersen(a,b){return b>0?Math.round(a*100/b):0}
function lkbHead(m,d,p,c){
 var V=m.v2,k=c.ks&&c.ks.length?c.ks[0]:0,pal=PAL_(k),ids=[];
 (c.ks||[]).forEach(function(kk){V.langkah.forEach(function(l){if(l.k===kk)ids.push(l.i)})});
 var n=ids.filter(function(i){return d['step'+i]}).length,pr=lkbPersen(n,ids.length);
 var judul=c.judul?lkbEsc(c.judul):'Pertemuan '+p.n,kick='Pertemuan '+p.n+' · '+p.jp+' JP';
 var meta='<span>Target '+c.menit+' menit</span>'+(ids.length?'<span data-lkb-n>'+n+' dari '+ids.length+' langkah</span>':'<span>Tanpa langkah praktik</span>');
 var lipat=LK2.lipat&&LK2.lipat[c.key];
 return {open:'<section class="card lk2-p'+(lipat?' lkb-lipat':'')+'" data-lkb-key="'+lkbEsc(c.key)+'">',
  html:'<div class="lkb" role="button" tabindex="0" aria-expanded="'+(lipat?'false':'true')+'" style="--g1:'+pal[0]+';--g2:'+pal[1]+';--p:'+pr+'" data-lkb data-done="'+(ids.length&&n===ids.length?1:0)+'">'+
  '<span class="lkb-k">'+kick+'</span><h2>'+judul+'</h2><div class="lkb-m">'+meta+'</div>'+
  (ids.length?'<div class="lkb-r" aria-hidden="true"><b data-lkb-p>'+pr+'%</b></div><div class="lkb-bar"><i></i></div>':'')+
  '<span class="lkb-c">ketuk untuk '+(lipat?'membuka':'melipat')+'</span></div>'};
}
function PAL_(k){return PAL[k]||PAL[0]}

/* Ganti kepala kartu satu per satu, urutannya sama dengan lk2Kerja (pertemuan tak tersembunyi, lalu kartunya). Bila pola tak cocok, HTML asli dipakai. */
if(typeof lk2Kerja==='function'){
 var lkbAsli=lk2Kerja;
 lk2Kerja=function(m,d){
  var h=lkbAsli(m,d);
  try{
   if(LK2.cetak||!m||!m.v2||!m.v2.pertemuan)return h;
   var daftar=[];
   m.v2.pertemuan.forEach(function(p){if(p.sembunyi)return;lk2Kartu(m.v2,p).forEach(function(c){daftar.push({p:p,c:c})})});
   var i=0,RE=/<section class="card lk2-p"><div class="row sb"><h2>[\s\S]*?<\/h2><span class="pill">Target [^<]*<\/span><\/div>(<p class="note">[\s\S]*?<\/p>)?/g;
   var out=h.replace(RE,function(mm,nt){var x=daftar[i++];if(!x)return mm;var b=lkbHead(m,d,x.p,x.c);return b.open+b.html+(nt||'')});
   return i===daftar.length?out:h;
  }catch(e){return h}
 };
}

/* Progres langsung tanpa render ulang */
function lkbHitung(sec){
 var b=sec.querySelector('[data-lkb]');if(!b)return;
 var cs=sec.querySelectorAll('input[data-lk-check^="step"]'),n=0;cs.forEach(function(x){if(x.checked)n++});
 var pr=lkbPersen(n,cs.length);b.style.setProperty('--p',pr);b.dataset.done=cs.length&&n===cs.length?'1':'0';
 var t=b.querySelector('[data-lkb-p]');if(t)t.textContent=pr+'%';
 var l=b.querySelector('[data-lkb-n]');if(l)l.textContent=n+' dari '+cs.length+' langkah';
}
document.addEventListener('change',function(e){var t=e.target;if(!t||!t.matches||!t.matches('input[data-lk-check^="step"]'))return;var s=t.closest('section.lk2-p');if(s)lkbHitung(s)});

/* Lipat/buka dengan ketuk atau tombol Enter/Spasi */
function lkbToggle(b){
 var s=b.closest('section.lk2-p');if(!s)return;var k=s.dataset.lkbKey,on=!s.classList.contains('lkb-lipat');
 s.classList.toggle('lkb-lipat',on);b.setAttribute('aria-expanded',on?'false':'true');
 var c=b.querySelector('.lkb-c');if(c)c.textContent='ketuk untuk '+(on?'membuka':'melipat');
 LK2.lipat=LK2.lipat||{};LK2.lipat[k]=on;
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-lkb]');if(b)lkbToggle(b)});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-lkb]')){e.preventDefault();lkbToggle(e.target)}});
