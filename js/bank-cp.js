/* bank-cp.js: satu filter "Mapel / Elemen CP" pada halaman Bank soal (guru/admin), menggantikan filter Mapel.
   Pilihan berupa nama elemen CP (Kepka BSKAP 046/H/KR/2025) atau nama mapel. Nilai opsi: "c:<kode>" untuk CP, "m:<mapel>" untuk mapel.
   Memilih salah satu mengosongkan yang lain (BS.flt.cp / BS.flt.mapel). Data ada di cp-peta.js (soal bawaan).
   Filter CP cocok bila elemen utama atau elemen tambahan soal sama. Dimuat sebelum bank-filter.js. */
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
 /* keterangan CP satu baris pada kartu soal */
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
 function opsiCp(all,cur){
  var c={none:0};Object.keys(NM).forEach(function(k){c[k]=0});
  all.forEach(function(s){
   var i=info(s.id);if(!i){c.none++;return}
   c[i.e]++;tamList(i).forEach(function(k){c[k]++});
  });
  function o(k,t){return '<option value="c:'+k+'"'+(cur===k?' selected':'')+'>'+esc(t)+' ('+c[k]+')</option>'}
  function g(t,ks){return '<optgroup label="'+t+'">'+ks.map(function(k){return o(k,NM[k])}).join('')+'</optgroup>'}
  return g('Elemen CP · Kelas X',['E1','E2','E3','E4','E5','E6','E7'])+g('Elemen CP · Kelas XI-XII',['F1','F2','F3','F4','F5','F6','F7'])+
   '<optgroup label="Elemen CP · Lainnya">'+o('NA',NM.NA)+o('none','Belum dipetakan')+'</optgroup>';
 }
 function opsiMapel(all,cur){
  var h=bsMapelOptHtml(bsMapelList(),cur,bsMapelHitung(all));
  return h.replace(/<optgroup label="/g,'<optgroup label="Mapel · ').replace(/<option value="/g,'<option value="m:');
 }
 function pilihan(){
  var all=bsSoalAll(),f=BS.flt||{};
  return '<label class="f">Mapel / Elemen CP<select id="bq-mc"><option value="">Semua</option>'+opsiCp(all,f.cp||'')+opsiMapel(all,f.mapel||'')+'</select></label>';
 }
 if(typeof bsViewBank==='function'){
  var _cpVB=bsViewBank;
  bsViewBank=function(){
   var h=_cpVB.apply(this,arguments),mc=pilihan();
   var re=/<div class="two">(<label class="f">Mapel<select[\s\S]*?<\/select><\/label>)(<label class="f">Jenis<select[\s\S]*?<\/select><\/label>)<\/div>(<label class="f">Peruntukan<select[\s\S]*?<\/select><\/label>)/;
   if(re.test(h))return h.replace(re,function(_,m,j,p){return mc+'<div class="two">'+j+p+'</div>'});
   return h.replace(/<label class="f">Mapel<select[\s\S]*?<\/select><\/label>/,function(){return mc});
  };
 }
 document.addEventListener('change',function(e){
  var t=e.target;if(!t||t.id!=='bq-mc')return;
  var v=t.value;BS.flt.mapel='';BS.flt.cp='';
  if(v.indexOf('m:')===0)BS.flt.mapel=v.slice(2);else if(v.indexOf('c:')===0)BS.flt.cp=v.slice(2);
  BS.flt.n=30;render();
 });
})();
