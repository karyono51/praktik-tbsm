/* bank-cp.js: filter Elemen CP pada halaman Bank soal (guru/admin) dan keterangan CP pada kartu soal.
   Data pemetaan ada di cp-peta.js (soal bawaan). Soal sendiri belum punya CP: ada di pilihan "Belum dipetakan".
   Filter cocok bila elemen utama atau elemen tambahan soal sama dengan pilihan. Dimuat sebelum bank-filter.js. */
(function(){
 var NM={
  E1:'Wawasan Dunia Otomotif',E2:'Kecakapan Kerja, K3, Budaya Kerja',E3:'Gambar Teknik',E4:'Peralatan dan Perlengkapan',
  E5:'Kelistrikan dan Elektronika Dasar',E6:'Komponen Otomotif',E7:'Hidrolik dan Pneumatik',
  F1:'Engine',F2:'Sasis',F3:'Sistem Pemindah Tenaga',F4:'Sistem Kelistrikan',F5:'Motor Listrik dan Hybrid',
  F6:'EMS (Engine Management System)',F7:'Pengelolaan Bengkel',NA:'Umum (di luar CP kejuruan)'
 };
 function info(id){var v=window.CP_PETA&&CP_PETA[id];if(!v)return null;var a=v.split('|');return{e:a[0],tp:a[1],tam:a[2],ky:a[3]}}
 function kode(t){var m=/^(E[1-7]|F[1-7])/.exec(String(t||'').trim());return m?m[1]:''}
 function tamList(i){return i.tam?i.tam.split('; ').map(kode).filter(function(k,j,a){return k&&k!==i.e&&a.indexOf(k)===j}):[]}
 function cocok(s,f){
  var i=info(s.id);
  if(f==='none')return !i;
  return !!i&&(i.e===f||tamList(i).indexOf(f)>-1);
 }
 window.cpNote=function(id){
  var i=info(id);if(!i)return '';
  if(i.e==='NA')return '<p class="note">CP: '+esc(NM.NA)+'</p>';
  var t=tamList(i).map(function(k){return NM[k]});
  return '<p class="note">CP: '+esc(NM[i.e])+(i.tp?' · TP '+esc(i.tp):'')+(t.length?' · juga '+esc(t.join(', ')):'')+(i.ky&&i.ky!=='Tinggi'?' · perlu dicek':'')+'</p>';
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
  var c={none:0};Object.keys(NM).forEach(function(k){c[k]=0});
  all.forEach(function(s){
   var i=info(s.id);if(!i){c.none++;return}
   c[i.e]++;tamList(i).forEach(function(k){c[k]++});
  });
  var cur=(BS.flt&&BS.flt.cp)||'';
  function o(k,t){return '<option value="'+k+'"'+(cur===k?' selected':'')+'>'+esc(t)+' ('+c[k]+')</option>'}
  function g(t,ks){return '<optgroup label="'+t+'">'+ks.map(function(k){return o(k,NM[k])}).join('')+'</optgroup>'}
  return '<option value="">Semua</option>'+g('Kelas X (Fase E)',['E1','E2','E3','E4','E5','E6','E7'])+g('Kelas XI-XII (Fase F)',['F1','F2','F3','F4','F5','F6','F7'])+
   '<optgroup label="Lainnya">'+o('NA',NM.NA)+o('none','Belum dipetakan')+'</optgroup>';
 }
 if(typeof bsViewBank==='function'){
  var _cpVB=bsViewBank;
  bsViewBank=function(){
   var h=_cpVB.apply(this,arguments),k='</div><div class="stack" id="bq-list">',i=h.indexOf(k);
   if(i<0)return h;
   var cp='<label class="f">Elemen CP<select data-bs="flt" data-k="cp">'+opsi(bsSoalAll())+'</select></label>';
   /* sejajarkan dengan filter Statistik ujian bila ada, supaya ringkas */
   var m=/<label class="f">Statistik ujian[\s\S]*?<\/select><\/label>/.exec(h);
   if(m)return h.slice(0,m.index)+'<div class="two">'+cp+m[0]+'</div>'+h.slice(m.index+m[0].length);
   return h.slice(0,i)+cp+h.slice(i);
  };
 }
})();
