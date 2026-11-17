/* bank-cp.js: dasar filter Elemen CP pada Bank soal (guru/admin).
   Tiap elemen CP (Kepka BSKAP 046/H/KR/2025) dipetakan ke soal lewat CP_PETA (cp-peta.js). Berkas ini menyediakan:
   urutan soal bank menurut elemen CP (Kelas X lalu XI-XII; urutan asli dipertahankan di dalam elemen), keterangan CP satu baris
   pada kartu soal (cpNote), dan penyaring BS.flt.cp. Dropdown Mapel, Kelas, Modul/LKPD dan Elemen CP dirakit oleh bank-bertingkat.js,
   yang memakai BSCP di bawah. Dimuat sebelum bank-bertingkat.js dan bank-filter.js. */
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
 /* dipakai bank-bertingkat.js */
 window.BSCP={URUT:URUT,NM:NM,cocok:cocok,info:info,tamList:tamList};
})();
