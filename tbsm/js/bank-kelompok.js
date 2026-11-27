/* bank-kelompok.js: pengelompokan mata pelajaran di Bank soal.
   Sebelumnya daftar mapel berupa satu daftar urut abjad yang bercampur dengan 21 judul LKPD. Sekarang dikelompokkan:
   Kelompok Umum, Kelompok Kejuruan, Dasar-Dasar Program Keahlian, Kompetensi Keahlian, Pilihan (mengikuti Administrasi Akademik),
   lalu LKPD Kelas X, XI, XII (urut nomor unit), dan terakhir mapel lain yang diketik guru.
   Dimuat setelah akademik.js dan banksoal.js, sebelum bank-filter.js. Tidak mengubah data soal. */
(function(){
 var GR=[['umum','Kelompok Umum'],['kejuruan','Kelompok Kejuruan'],['dasar','Dasar-Dasar Program Keahlian Teknik Otomotif'],['konsentrasi','Kompetensi Keahlian Teknik Sepeda Motor'],['pilihan','Mata Pelajaran Pilihan'],['lkpd-x','LKPD Kelas X'],['lkpd-xi','LKPD Kelas XI'],['lkpd-xii','LKPD Kelas XII'],['lain','Mapel lainnya']];
 /* mapel bawaan bank soal yang tidak selalu ada di master */
 var BAWAAN={'Bahasa Indonesia':'umum','Matematika':'kejuruan','Bahasa Inggris':'kejuruan','Dasar TBSM':'dasar'};
 function gi(k){for(var i=0;i<GR.length;i++)if(GR[i][0]===k)return i;return GR.length-1}
 function nrm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim()}
 /* nama mapel master -> {g:kelompok, i:urutan}; kosong bila Administrasi Akademik belum dimuat */
 function master(){
  var o={};
  try{
   if(typeof akMapelAll==='function'&&typeof akGrupKey==='function'){
    akMapelAll().forEach(function(m,i){var k=nrm(m.nama);if(k&&!o[k])o[k]={g:akGrupKey(m),i:i}});
   }
  }catch(e){}
  return o;
 }
 function info(nama,M){
  var s=String(nama||''),l=s.match(/^\s*LKPD\s+(XII|XI|X)\s*-\s*(\d+)/i);
  if(l)return {g:'lkpd-'+l[1].toLowerCase(),i:+l[2]};
  var m=M[nrm(s)];
  if(m)return {g:m.g,i:m.i};
  var b=BAWAAN[s];
  if(b)return {g:b,i:100000};
  return {g:'lain',i:100000};
 }
 function urut(list){
  var M=master(),seen={},a=[];
  (list||[]).forEach(function(x){if(x&&!seen[x]){seen[x]=1;a.push(x)}});
  var inf={};a.forEach(function(x){inf[x]=info(x,M)});
  return a.sort(function(p,q){
   var x=inf[p],y=inf[q];
   return gi(x.g)-gi(y.g)||x.i-y.i||String(p).localeCompare(String(q),'id',{numeric:true});
  }).map(function(x){return {nama:x,g:inf[x].g}});
 }
 /* [{k, judul, items:[nama,...]}] hanya kelompok yang berisi */
 window.bsMapelGrup=function(list){
  var out=[],by={};
  urut(list).forEach(function(r){
   if(!by[r.g]){by[r.g]={k:r.g,judul:GR[gi(r.g)][1],items:[]};out.push(by[r.g])}
   by[r.g].items.push(r.nama);
  });
  return out;
 };
 /* daftar mapel datar tetapi urut menurut kelompok (menggantikan urut abjad) */
 if(typeof bsMapelList==='function'){
  var _kl=bsMapelList;
  bsMapelList=function(){return urut(_kl.apply(this,arguments)).map(function(r){return r.nama})};
 }
 /* jumlah soal per mapel; sumber default semua soal bank */
 window.bsMapelHitung=function(src){
  var c={};(src||(typeof bsSoalAll==='function'?bsSoalAll():[])).forEach(function(q){if(q.mapel)c[q.mapel]=(c[q.mapel]||0)+1});
  return c;
 };
 /* <option> berkelompok untuk <select>. cnt (opsional): peta nama->jumlah soal, ditampilkan di label. */
 window.bsMapelOptHtml=function(list,sel,cnt){
  return bsMapelGrup(list).map(function(g){
   return '<optgroup label="'+esc(g.judul)+'">'+g.items.map(function(m){
    var n=cnt?(cnt[m]||0):null;
    return '<option value="'+esc(m)+'"'+(sel===m?' selected':'')+'>'+esc(m)+(n===null?'':' ('+n+')')+'</option>';
   }).join('')+'</optgroup>';
  }).join('');
 };
 /* chip berkelompok (sesi ujian). pilih: daftar mapel terpilih */
 window.bsMapelChipsHtml=function(list,pilih,cnt){
  pilih=pilih||[];
  return bsMapelGrup(list).map(function(g){
   return '<span class="label" style="display:block;margin:10px 0 4px">'+esc(g.judul)+'</span><div class="chips">'+g.items.map(function(m){
    var on=pilih.indexOf(m)>-1,n=cnt?(cnt[m]||0):null,mati=n===0&&!on;
    return '<button type="button" data-bs="sfmapel" data-v="'+esc(m)+'" aria-pressed="'+on+'"'+(mati?' disabled style="opacity:.45"':'')+'>'+esc(m)+(n===null?'':' ('+n+')')+'</button>';
   }).join('')+'</div>';
  }).join('');
 };
})();
