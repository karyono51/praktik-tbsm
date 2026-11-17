/* lkpd-elemen.js: LKPD adalah bagian dari Elemen CP.
   Tiap modul LKPD terkait ke satu Elemen CP (id mapel elemen di Administrasi Akademik, mis. m_tsm_4).
   Sumber tautan: field modul `elemen` (diisi di Editor Guru); bila kosong dipakai pemetaan bawaan di bawah.
   Elemen CP dibaca dari data bawaan akademik-data.js (AKD_DDO_ELEMEN untuk kelas X, AKD_TSM_ELEMEN untuk XI-XII). */
var LKPD_ELEMEN_MAP={
 'X-1':'m_ddo_7','X-2':'m_ddo_3','X-3':'m_ddo_3','X-4':'m_ddo_2','X-5':'m_ddo_4','X-6':'m_ddo_5',
 'XI-1':'m_tsm_1','XI-2':'m_tsm_2','XI-3':'m_tsm_3','XI-4':'m_tsm_1','XI-5':'m_tsm_1','XI-6':'m_tsm_1','XI-7':'m_tsm_2','XI-8':'m_tsm_2',
 'XII-1':'m_tsm_1','XII-2':'m_tsm_6','XII-3':'m_tsm_1','XII-4':'m_tsm_5','XII-5':'m_tsm_1','XII-6':'m_tsm_4','XII-7':'m_tsm_3'
};
function lkElAll(){
 var L=[];
 try{
  [[AKD_DDO,AKD_DDO_ELEMEN,'X'],[AKD_TSM,AKD_TSM_ELEMEN,'XI']].forEach(function(p){
   p[1].forEach(function(e,i){L.push({id:p[0].id+'_'+(i+1),no:i+1,nama:e.n,induk:p[0].nama,tingkat:p[0].tingkat||[],urut:L.length})});
  });
 }catch(x){}
 return L;
}
function lkElById(id){return lkElAll().filter(function(e){return e.id===id})[0]||null}
function lkElForKelas(kelas){return lkElAll().filter(function(e){return !kelas||e.tingkat.indexOf(kelas)>-1})}
function lkElOf(m){
 if(!m)return '';
 var id=m.elemen||LKPD_ELEMEN_MAP[m.id]||'';
 return lkElById(id)?id:'';
}
function lkElLabel(id){var e=lkElById(id);return e?'Elemen '+e.no+' · '+e.nama:'Tanpa Elemen CP'}
function lkElOpts(kelas,sel){
 var h='<option value="">Belum dikaitkan</option>';
 lkElForKelas(kelas).forEach(function(e){h+='<option value="'+e.id+'"'+(e.id===sel?' selected':'')+'>Elemen '+e.no+' · '+String(e.nama).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</option>'});
 return h;
}
/* modul LKPD milik satu Elemen CP */
function lkElModulOf(elId){return (window.LKPD_MODULES||[]).filter(function(m){return lkElOf(m)===elId})}
/* ringkasan di kartu Elemen CP (Administrasi Akademik) */
function lkElDetail(elId){
 var L=lkElModulOf(elId);if(!L.length)return '';
 function e(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 return '<details><summary class="note">'+L.length+' modul LKPD di elemen ini</summary>'+L.map(function(m){return '<div class="note"><span class="mono">'+e(m.id)+'</span> '+e(m.title)+'</div>'}).join('')+'</details>';
}
/* urutkan kartu LKPD menurut Elemen CP; nama elemen dilampirkan di bawah tiap kartu (lipat, seperti Sumber acuan).
   mods dan cards sejajar. Kartu tanpa elemen ditaruh di akhir tanpa lampiran. */
function lkElGroup(mods,cards){
 if(!mods.some(function(m){return lkElOf(m)}))return cards.join('');
 var pos={};lkElAll().forEach(function(e){pos[e.id]=e.urut});
 function e(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
 return mods.map(function(m,i){
  var k=lkElOf(m)||'';
  return {o:k?pos[k]:9999,i:i,k:k,c:cards[i]};
 }).sort(function(a,b){return a.o-b.o||a.i-b.i}).map(function(x){
  if(!x.k)return x.c;
  var lamp='<details class="lk-elnote"><summary class="note">Elemen CP</summary><div class="note">'+e(lkElLabel(x.k))+'</div></details>';
  var z=x.c.lastIndexOf('</article>');
  return z>-1?x.c.slice(0,z)+lamp+x.c.slice(z):x.c+lamp;
 }).join('');
}
