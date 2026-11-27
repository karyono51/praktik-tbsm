/* bank-bertingkat.js: filter bertingkat pada halaman Bank soal (guru/admin), menggantikan filter Mapel / Elemen CP.
   Urutan: 1. Mapel  >  2. Kelas  >  3. Modul/LKPD. Pilihan tingkat bawah hanya aktif setelah tingkat di atasnya dipilih,
   dan hanya memuat isi yang benar-benar ada pada pilihan di atasnya (beserta jumlah soal).
   Kesepakatan:
   - Mapel "Dasar-Dasar Teknik Otomotif"            : Kelas X                 (unit LKPD X-1 sampai X-6)
   - Mapel "Kompetensi Keahlian Teknik Sepeda Motor": Kelas XI dan XII        (unit LKPD XI-1..XI-8, XII-1..XII-7)
   - Mapel lain (Bahasa Indonesia, Matematika, Bahasa Inggris, Dasar TBSM, dan yang diketik guru) tetap berdiri sendiri;
     Kelas hanya terisi bila soalnya punya kelas, dan Modul/LKPD tidak berlaku.
   Penempatan soal ke mapel: unit LKPD (kolom unit, atau judul "LKPD X-1 ...") menentukan mapel dan modul; tanpa unit, nama mapel
   yang sama dengan judul di atas, elemen CP-nya, atau elemen master Administrasi Akademik ikut mapel induknya. Kelas diambil dari
   kolom kelas soal; bila kosong dan soalnya punya unit, dari tingkat unitnya. Soal tanpa kelas muncul di pilihan "Tanpa kelas",
   soal tanpa unit di pilihan "Tanpa modul/LKPD", jadi tidak ada soal yang tidak terjangkau.
   Elemen CP tetap bisa disaring sebagai pilihan tambahan di bawahnya (jumlahnya mengikuti pilihan di atas).
   Status: BS.flt.mp ('', 'ddto', 'kk', atau 'm:<nama mapel>'), BS.flt.kls ('', 'X', 'XI', 'XII', atau '-' = tanpa kelas),
   BS.flt.mod ('', kode unit seperti 'XI-3', atau '-' = tanpa modul), BS.flt.cp (dari bank-cp.js). Data soal tidak diubah.
   Dimuat setelah bank-kelompok.js dan bank-cp.js, sebelum bank-filter.js. */
(function(){
 var TG={
  ddto:{judul:'Dasar-Dasar Teknik Otomotif',kelas:['X'],label:'Kelas X'},
  kk:{judul:'Kompetensi Keahlian Teknik Sepeda Motor',kelas:['XI','XII'],label:'Kelas XI-XII'}
 };
 var KLS=['X','XI','XII'];
 function nrm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim()}
 function ada(f){return typeof f==='function'}

 /* nama mapel (di luar judul LKPD) yang ikut mapel bertingkat: judul, elemen CP, dan elemen master Administrasi Akademik */
 function namaSet(){
  var d={},k={};
  d[nrm(TG.ddto.judul)]=1;k[nrm(TG.kk.judul)]=1;k['teknik sepeda motor']=1;
  try{AKD_DDO_ELEMEN.forEach(function(e){d[nrm(e.n)]=1})}catch(e){}
  try{AKD_TSM_ELEMEN.forEach(function(e){k[nrm(e.n)]=1})}catch(e){}
  try{AKD.D.mapel.forEach(function(m){
   if(m.id==='m_ddo'||m.induk==='m_ddo')d[nrm(m.nama)]=1;
   if(m.id==='m_tsm'||m.induk==='m_tsm')k[nrm(m.nama)]=1;
  })}catch(e){}
  return {ddto:d,kk:k};
 }
 function sigMaster(){try{return AKD.D.mapel.length}catch(e){return 0}}
 /* unit LKPD dari kolom unit atau judul mapel "LKPD X-1 ..." */
 function unit(s){
  var m=/^(XII|XI|X)-(\d+)$/.exec(String(s.unit||'').trim().toUpperCase())||/^\s*LKPD\s+(XII|XI|X)\s*-\s*(\d+)/i.exec(String(s.mapel||''));
  return m?{t:m[1].toUpperCase(),n:+m[2],k:m[1].toUpperCase()+'-'+(+m[2])}:null;
 }
 function hitung(s,N){
  var u=unit(s),kl=String(s.kelas||'').trim().toUpperCase(),g,mod='';
  if(u){g=u.t==='X'?'ddto':'kk';mod=u.k;if(!kl)kl=u.t}
  else{var n=nrm(s.mapel);g=N.ddto[n]?'ddto':N.kk[n]?'kk':'m:'+String(s.mapel||'')}
  return {g:g,kl:kl,mod:mod,u:u};
 }
 var C={src:null,sig:-1,map:null};
 function peta(){
  var l=bsSoalAll(),sg=sigMaster();
  if(C.src!==l||C.sig!==sg){var N=namaSet();C.map={};l.forEach(function(s){C.map[s.id]=hitung(s,N)});C.src=l;C.sig=sg}
  return C.map;
 }
 function G(s){return peta()[s.id]||hitung(s,namaSet())}

 function cocokKls(g,k){return !k||(k==='-'?!g.kl:g.kl===k)}
 function cocokMod(g,m){return !m||(m==='-'?!g.mod:g.mod===m)}
 /* soal bank pada tingkat tertentu: 1 = mapel, 2 = mapel + kelas, 3 = mapel + kelas + modul */
 function lingkup(tk){
  var f=BS.flt||{},l=bsSoalAll();
  if(!f.mp||tk<1)return l;
  return l.filter(function(s){
   var g=G(s);
   return g.g===f.mp&&(tk<2||cocokKls(g,f.kls))&&(tk<3||cocokMod(g,f.mod));
  });
 }
 function urutKelas(a,b){
  var x=a==='-'?99:KLS.indexOf(a),y=b==='-'?99:KLS.indexOf(b);
  if(x<0)x=50;if(y<0)y=50;
  return x-y||String(a).localeCompare(String(b),'id');
 }
 /* pilihan Kelas untuk mapel terpilih: kelas yang disepakati + kelas yang ada di data (+ Tanpa kelas bila ada soalnya) */
 function pilKelas(){
  var f=BS.flt,s1=lingkup(1),c={};
  s1.forEach(function(s){var k=G(s).kl||'-';c[k]=(c[k]||0)+1});
  (TG[f.mp]?TG[f.mp].kelas:[]).forEach(function(k){if(c[k]===undefined)c[k]=0});
  return {n:s1.length,c:c,ks:Object.keys(c).sort(urutKelas)};
 }
 /* pilihan Modul/LKPD: hanya untuk mapel bertingkat */
 function pilModul(){
  var f=BS.flt,s2=lingkup(2),u={},tanpa=0;
  if(!TG[f.mp])return {n:s2.length,list:[],tanpa:0};
  s2.forEach(function(s){
   var g=G(s);
   if(!g.mod){tanpa++;return}
   var o=u[g.mod]||(u[g.mod]={k:g.mod,t:g.u.t,n:g.u.n,nama:'',c:0});
   o.c++;if(!o.nama)o.nama=String(s.mapel||'').replace(/^\s*LKPD\s+/i,'');
  });
  var list=Object.keys(u).map(function(k){return u[k]}).sort(function(a,b){return KLS.indexOf(a.t)-KLS.indexOf(b.t)||a.n-b.n});
  list.forEach(function(o){o.label=o.nama?(o.nama.indexOf(o.k)===0?o.nama:o.k+' '+o.nama):o.k});
  return {n:s2.length,list:list,tanpa:tanpa};
 }
 function pilCp(){
  var s3=lingkup(3),c={};
  BSCP.URUT.forEach(function(k){c[k]=0});
  s3.forEach(function(s){var i=BSCP.info(s.id);if(!i)return;c[i.e]++;BSCP.tamList(i).forEach(function(k){c[k]++})});
  return c;
 }
 /* jaga agar status selalu cocok dengan pilihan yang tersedia (data bisa berubah; tingkat atas berganti) */
 function rapikan(){
  var f=BS.flt;if(!f)return;
  if(f.mp===undefined)f.mp='';if(f.kls===undefined)f.kls='';if(f.mod===undefined)f.mod='';
  if(f.mp){
   var ada1=false;bsSoalAll().forEach(function(s){if(!ada1&&G(s).g===f.mp)ada1=true});
   if(!ada1&&!TG[f.mp]){f.mp='';f.kls='';f.mod=''}
  }
  if(!f.mp){f.kls='';f.mod=''}
  else{
   if(f.kls&&pilKelas().ks.indexOf(f.kls)<0){f.kls='';f.mod=''}
   if(f.mod){var pm=pilModul();if(f.mod!=='-'&&!pm.list.some(function(o){return o.k===f.mod})||f.mod==='-'&&!pm.tanpa)f.mod=''}
  }
  if(f.cp&&!pilCp()[f.cp])f.cp='';
 }

 function op(v,sel,t){return '<option value="'+esc(v)+'"'+(sel?' selected':'')+'>'+esc(t)+'</option>'}
 function sel(id,no,judul,isi,mati){
  return '<label class="f">'+no+judul+'<select id="'+id+'"'+(mati?' disabled':'')+'>'+isi+'</select></label>';
 }
 function htmlMapel(){
  var f=BS.flt,all=bsSoalAll(),c={ddto:0,kk:0},lain={};
  all.forEach(function(s){var g=G(s).g;if(TG[g])c[g]++;else lain[g.slice(2)]=(lain[g.slice(2)]||0)+1});
  var h=op('',!f.mp,'Semua mapel ('+all.length+')');
  h+='<optgroup label="Program Keahlian Teknik Otomotif">'+['ddto','kk'].map(function(k){
   return op(k,f.mp===k,TG[k].judul+' · '+TG[k].label+' ('+c[k]+')');
  }).join('')+'</optgroup>';
  var nm=Object.keys(lain).filter(function(m){return m!==''}),kosong=lain[''];
  if(nm.length||kosong){
   if(ada(window.bsMapelGrup))nm=bsMapelGrup(nm).reduce(function(a,g){return a.concat(g.items)},[]);
   else nm.sort();
   if(kosong)nm.push('');
   h+='<optgroup label="Mapel lain">'+nm.map(function(m){return op('m:'+m,f.mp==='m:'+m,(m||'(Tanpa mapel)')+' ('+lain[m]+')')}).join('')+'</optgroup>';
  }
  return sel('bq-mp','1. ','Mapel',h,false);
 }
 function htmlKelas(){
  var f=BS.flt;
  if(!f.mp)return sel('bq-kls','2. ','Kelas',op('',true,'Pilih mapel dahulu'),true);
  var p=pilKelas();
  if(p.ks.length===1&&p.ks[0]==='-')return sel('bq-kls','2. ','Kelas',op('',true,'Mapel ini tidak dibagi per kelas'),true);
  var h=op('',!f.kls,'Semua kelas ('+p.n+')')+p.ks.map(function(k){
   return op(k,f.kls===k,(k==='-'?'Tanpa kelas':'Kelas '+k)+' ('+p.c[k]+')');
  }).join('');
  return sel('bq-kls','2. ','Kelas',h,false);
 }
 function htmlModul(){
  var f=BS.flt;
  if(!f.mp)return sel('bq-mod','3. ','Modul / LKPD',op('',true,'Pilih mapel dahulu'),true);
  if(!TG[f.mp])return sel('bq-mod','3. ','Modul / LKPD',op('',true,'Tidak ada modul/LKPD pada mapel ini'),true);
  var p=pilModul(),h=op('',!f.mod,'Semua modul/LKPD ('+p.n+')'),tk={};
  p.list.forEach(function(o){(tk[o.t]=tk[o.t]||[]).push(o)});
  var ts=Object.keys(tk),satu=ts.length<2;
  ts.forEach(function(t){
   var r=tk[t].map(function(o){return op(o.k,f.mod===o.k,o.label+' ('+o.c+')')}).join('');
   h+=satu?r:'<optgroup label="Kelas '+t+'">'+r+'</optgroup>';
  });
  if(p.tanpa)h+=op('-',f.mod==='-','Tanpa modul/LKPD ('+p.tanpa+')');
  return sel('bq-mod','3. ','Modul / LKPD',h,false);
 }
 function htmlCp(){
  var f=BS.flt,c=pilCp(),ada1=BSCP.URUT.some(function(k){return c[k]>0});
  var h=op('',!f.cp,'Semua elemen')+BSCP.URUT.filter(function(k){return c[k]>0}).map(function(k){
   return op(k,f.cp===k,BSCP.NM[k]+' ('+c[k]+')');
  }).join('');
  return sel('bq-cp','','Elemen CP (tambahan)',ada1?h:op('',true,'Tidak ada elemen CP pada pilihan ini'),!ada1);
 }
 window.bsBertingkatHtml=function(){rapikan();return htmlMapel()+htmlKelas()+htmlModul()+htmlCp()};

 /* penyaring */
 if(typeof bsFiltered==='function'){
  var _btF=bsFiltered;
  bsFiltered=function(){
   var l=_btF.apply(this,arguments),f=BS.flt||{};
   if(!f.mp)return l;
   return l.filter(function(s){var g=G(s);return g.g===f.mp&&cocokKls(g,f.kls)&&cocokMod(g,f.mod)});
  };
 }
 if(typeof BS!=='undefined'&&BS.flt){
  if(BS.flt.mp===undefined)BS.flt.mp='';
  if(BS.flt.kls===undefined)BS.flt.kls='';
  if(BS.flt.mod===undefined)BS.flt.mod='';
 }

 /* tampilan: tiga dropdown bertingkat + Elemen CP menggantikan dropdown Mapel bawaan; Jenis dan Peruntukan tetap sebaris di bawahnya */
 if(typeof bsViewBank==='function'){
  var _btVB=bsViewBank;
  bsViewBank=function(){
   rapikan();
   var h=_btVB.apply(this,arguments),blok=bsBertingkatHtml();
   var re=/<div class="two">(<label class="f">Mapel<select[\s\S]*?<\/select><\/label>)(<label class="f">Jenis<select[\s\S]*?<\/select><\/label>)<\/div>(<label class="f">Peruntukan<select[\s\S]*?<\/select><\/label>)/;
   if(re.test(h))return h.replace(re,function(_,m,j,p){return blok+'<div class="two">'+j+p+'</div>'});
   return h.replace(/<label class="f">Mapel<select[\s\S]*?<\/select><\/label>/,function(){return blok});
  };
 }
 document.addEventListener('change',function(e){
  var t=e.target;if(!t||!t.id||!BS||!BS.flt)return;
  var f=BS.flt,v=t.value;
  if(t.id==='bq-mp'){f.mp=v;f.kls='';f.mod=''}
  else if(t.id==='bq-kls')f.kls=v;
  else if(t.id==='bq-mod')f.mod=v;
  else if(t.id==='bq-cp')f.cp=v;
  else return;
  rapikan();f.n=30;render();
 });
})();
