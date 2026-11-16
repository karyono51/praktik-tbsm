/* bank-cp.js: satu filter "Mapel / Elemen CP" pada halaman Bank soal (guru/admin), menggantikan filter Mapel.
   Struktur: tiap elemen CP (Kepka BSKAP 046/H/KR/2025) adalah satu kelompok. Isinya "Semua <elemen>" lalu unit LKPD yang menjadi bagian
   elemen itu (CP_UNIT). Di bawahnya mapel non-LKPD (Bahasa Indonesia, Matematika, Bahasa Inggris, Dasar TBSM).
   Urutan soal bank disusun ulang menurut elemen CP (Kelas X lalu XI-XII), urutan asli dipertahankan di dalam elemen.
   Nilai opsi: "c:<kode>" untuk elemen CP, "m:<mapel>" untuk mapel/unit. Memilih salah satu mengosongkan yang lain (BS.flt.cp / BS.flt.mapel).
   Dimuat sebelum bank-filter.js. */
(function(){
 var URUT=['E1','E2','E3','E4','E5','E6','E7','F1','F2','F3','F4','F5','F6','F7'];
 var NM={
  E1:'Wawasan Dunia Otomotif',E2:'Kecakapan Kerja, K3, Budaya Kerja',E3:'Gambar Teknik',E4:'Peralatan dan Perlengkapan',
  E5:'Kelistrikan dan Elektronika Dasar',E6:'Komponen Otomotif',E7:'Hidrolik dan Pneumatik',
  F1:'Engine',F2:'Sasis',F3:'Sistem Pemindah Tenaga',F4:'Sistem Kelistrikan',F5:'Motor Listrik dan Hybrid',
  F6:'EMS (Engine Management System)',F7:'Pengelolaan Bengkel'
 };
 function info(id){
  var v=window.CP_PETA&&CP_PETA[id];if(!v)return null;
  var a=v.split('|');return a[0]==='NA'?null:{e:a[0],tp:a[1],tam:a[2],ky:a[3]};
 }
 function kode(t){var m=/^(E[1-7]|F[1-7])/.exec(String(t||'').trim());return m?m[1]:''}
 function tamList(i){return i.tam?i.tam.split('; ').map(kode).filter(function(k,j,a){return k&&k!==i.e&&a.indexOf(k)===j}):[]}
 function cocok(s,f){var i=info(s.id);return !!i&&(i.e===f||tamList(i).indexOf(f)>-1)}
 function unitKey(m){var x=/^\s*LKPD\s+(XII|XI|X)\s*-\s*(\d+)/i.exec(String(m||''));return x?x[1].toUpperCase()+'-'+x[2]:''}
 /* keterangan CP satu baris pada kartu soal */
 window.cpNote=function(id){
  var i=info(id);if(!i)return '';
  var t=tamList(i).map(function(k){return NM[k]});
  return '<p class="note">CP: '+esc(NM[i.e])+(i.tp?' · TP '+esc(i.tp):'')+(t.length?' · juga '+esc(t.join(', ')):'')+(i.ky&&i.ky!=='Tinggi'?' · perlu dicek':'')+'</p>';
 };
 /* susun ulang urutan soal bank menurut elemen CP; soal tanpa CP (umum) di akhir */
 if(typeof bsSoalAll==='function'){
  var _cpA=bsSoalAll,_src=null,_out=null;
  bsSoalAll=function(){
   var l=_cpA.apply(this,arguments);
   if(l===_src&&_out&&_out.length===l.length)return _out;
   var a=l.map(function(s,n){var i=info(s.id);return {s:s,n:n,r:i?URUT.indexOf(i.e):99}});
   a.sort(function(x,y){return x.r-y.r||x.n-y.n});
   _src=l;_out=a.map(function(x){return x.s});
   return _out;
  };
 }
 if(typeof BS!=='undefined'&&BS.flt&&BS.flt.cp===undefined)BS.flt.cp='';
 if(typeof bsFiltered==='function'){
  var _cpF=bsFiltered;
  bsFiltered=function(){
   var l=_cpF.apply(this,arguments),f=BS.flt&&BS.flt.cp;
   return f?l.filter(function(s){return cocok(s,f)}):l;
  };
 }
 function pilihan(){
  var all=bsSoalAll(),f=BS.flt||{},cur=f.cp||'',cm=f.mapel||'',cnt=bsMapelHitung(all),mp=bsMapelList(),c={};
  URUT.forEach(function(k){c[k]=0});
  all.forEach(function(s){var i=info(s.id);if(!i)return;c[i.e]++;tamList(i).forEach(function(k){c[k]++})});
  function op(v,sel,t,n){return '<option value="'+esc(v)+'"'+(sel?' selected':'')+'>'+esc(t)+' ('+n+')</option>'}
  var h='<option value="">Semua</option>';
  URUT.forEach(function(k){
   if(!c[k])return;
   var u=mp.filter(function(m){return (window.CP_UNIT||{})[unitKey(m)]===k});
   h+='<optgroup label="'+esc(NM[k])+'">'+op('c:'+k,cur===k,'Semua '+NM[k],c[k])+
      u.map(function(m){return op('m:'+m,cm===m,m,cnt[m]||0)}).join('')+'</optgroup>';
  });
  var lain=mp.filter(function(m){return !(window.CP_UNIT||{})[unitKey(m)]});
  if(lain.length)h+=bsMapelOptHtml(lain,cm,cnt).replace(/<optgroup label="/g,'<optgroup label="Mapel · ').replace(/<option value="/g,'<option value="m:');
  return '<label class="f">Mapel / Elemen CP<select id="bq-mc">'+h+'</select></label>';
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
