/* bank-cp.js: filter Elemen CP pada halaman Bank soal (guru/admin) dan keterangan CP pada kartu soal.
   Data pemetaan ada di cp-peta.js (soal bawaan). Soal sendiri belum punya CP: ada di pilihan "Belum dipetakan".
   Filter cocok bila elemen utama atau elemen tambahan soal sama dengan pilihan. Dimuat sebelum bank-filter.js. */
(function(){
 function info(id){var v=window.CP_PETA&&CP_PETA[id];if(!v)return null;var a=v.split('|');return{e:a[0],tp:a[1],tam:a[2],ky:a[3]}}
 function kode(t){var m=/^(E[1-7]|F[1-7])/.exec(t||'');return m?m[1]:''}
 function nama(k){return k==='NA'?'Di luar CP kejuruan':((k[0]==='E'?'Fase E ':'Fase F ')+(CP_EL[k]||k))}
 function cocok(s,f){
  var i=info(s.id);
  if(f==='none')return !i;
  if(!i)return false;
  return i.e===f||kode(i.tam)===f||(i.tam&&i.tam.split('; ').some(function(x){return kode(x)===f}));
 }
 window.cpNote=function(id){
  var i=info(id);if(!i)return '';
  if(i.e==='NA')return '<p class="note">CP: di luar CP kejuruan (muatan umum TKA)</p>';
  return '<p class="note">CP: '+esc(nama(i.e))+(i.tp?' · TP '+esc(i.tp):'')+(i.tam?' · juga '+esc(i.tam):'')+(i.ky&&i.ky!=='Tinggi'?' · pemetaan '+esc(i.ky.toLowerCase()):'')+'</p>';
 };
 if(typeof BS!=='undefined'&&BS.flt&&BS.flt.cp===undefined)BS.flt.cp='';
 if(typeof bsFiltered==='function'){
  var _cpF=bsFiltered;
  bsFiltered=function(){
   var l=_cpF.apply(this,arguments),f=BS.flt&&BS.flt.cp;
   return f?l.filter(function(s){return cocok(s,f)}):l;
  };
 }
 function opsi(all){
  var c={};Object.keys(CP_EL).forEach(function(k){c[k]=0});c.none=0;
  all.forEach(function(s){
   var i=info(s.id);if(!i){c.none++;return}
   var seen={};seen[i.e]=1;if(i.tam)i.tam.split('; ').forEach(function(x){var k=kode(x);if(k)seen[k]=1});
   Object.keys(seen).forEach(function(k){c[k]++});
  });
  var cur=(BS.flt&&BS.flt.cp)||'';
  function o(k,t){return '<option value="'+k+'"'+(cur===k?' selected':'')+'>'+esc(t)+' ('+c[k]+')</option>'}
  var h='<option value="">Semua</option>';
  h+='<optgroup label="Fase E (Kelas X)">'+['E1','E2','E3','E4','E5','E6','E7'].map(function(k){return o(k,k+' '+CP_EL[k])}).join('')+'</optgroup>';
  h+='<optgroup label="Fase F (Kelas XI-XII)">'+['F1','F2','F3','F4','F5','F6','F7'].map(function(k){return o(k,k+' '+CP_EL[k])}).join('')+'</optgroup>';
  h+='<optgroup label="Lainnya">'+o('NA','Di luar CP kejuruan')+o('none','Belum dipetakan (soal sendiri)')+'</optgroup>';
  return h;
 }
 if(typeof bsViewBank==='function'){
  var _cpVB=bsViewBank;
  bsViewBank=function(){
   var h=_cpVB.apply(this,arguments),k='</div><div class="stack" id="bq-list">',i=h.indexOf(k);
   if(i<0)return h;
   var sel='<label class="f">Elemen CP<select data-bs="flt" data-k="cp">'+opsi(bsSoalAll())+'</select></label>';
   return h.slice(0,i)+sel+h.slice(i);
  };
 }
})();
