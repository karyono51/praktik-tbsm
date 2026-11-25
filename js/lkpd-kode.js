/* lkpd-kode.js: kode LKPD berbasis prodi dan CP: LKPD-<PRODI>-<CP>-<NN> (mis. LKPD-DDO-ALT-02, LKPD-TSM-PMT-03).
   Tingkat (X, XI, XII) BUKAN bagian kode, melainkan isian kelas pada modul, sehingga LKPD bisa naik atau turun tingkat tanpa mengubah kode
   dan tanpa memutus data siswa. DDO = Dasar-Dasar Program Keahlian Teknik Otomotif (dipakai bersama semua prodi otomotif), TSM, nanti TKR.
   Kode lama (LKPD-X-06, LKPD-XI-17, ...) tetap dikenali lewat AKD_LKPD_ALIAS (js/akademik-data.js, dibangun tools/matriks-lkpd.py) dan
   lewat isian alias pada modul. Data lama (hasil, bukti, modul terkelola) yang masih memuat kode lama dibaca sebagai kode baru
   (lkKodeNormalisasi, dijalankan di setiap lkRefreshModules). Dimuat setelah lkpd.js dan sebelum modul lain yang memakainya. */
var LKK_RE=/^LKPD-([A-Z]{3})-([A-Z0-9]{2,4})-(\d{2})$/;
function lkKodeParse(id){var m=LKK_RE.exec(String(id||''));return m?{prodi:m[1],cp:m[2],nn:m[3]}:null}
function lkKodeAlias(){return (typeof AKD_LKPD_ALIAS!=='undefined'&&AKD_LKPD_ALIAS)||{}}
/* kode lama atau baru -> kode baru; id yang tidak dikenal dikembalikan apa adanya (mis. X-1 dari LKPD v1) */
function lkKodeBaru(id){
 id=String(id==null?'':id);if(!id)return id;
 var a=lkKodeAlias();if(Object.prototype.hasOwnProperty.call(a,id))return a[id];
 var L=(typeof LKPD_DEFAULT_MODULES!=='undefined'&&LKPD_DEFAULT_MODULES)||[];
 for(var i=0;i<L.length;i++)if(Array.isArray(L[i].alias)&&L[i].alias.indexOf(id)>-1)return L[i].id;
 return id;
}
/* kode baru -> kode lama (bila ada) */
function lkKodeLama(id){
 id=lkKodeBaru(id);var a=lkKodeAlias(),k;
 for(k in a)if(Object.prototype.hasOwnProperty.call(a,k)&&a[k]===id)return k;
 var L=(typeof LKPD_DEFAULT_MODULES!=='undefined'&&LKPD_DEFAULT_MODULES)||[];
 for(var i=0;i<L.length;i++)if(L[i].id===id&&Array.isArray(L[i].alias)&&L[i].alias.length)return L[i].alias[0];
 return '';
}
function lkKodeSama(a,b){return lkKodeBaru(a)===lkKodeBaru(b)}
function lkKodeProdiNama(p){var P=(typeof AKD_LKPD_PRODI!=='undefined'&&AKD_LKPD_PRODI)||{};return P[p]||p||''}
function lkKodeProdiList(){var P=(typeof AKD_LKPD_PRODI!=='undefined'&&AKD_LKPD_PRODI)||{DDO:'DDO',TSM:'TSM',TKR:'TKR'};return Object.keys(P).map(function(k){return [k,P[k]]})}
function lkKodeCpNama(p,c){var C=(typeof AKD_LKPD_CP!=='undefined'&&AKD_LKPD_CP)||{};return (C[p]&&C[p][c])||c||''}
function lkKodeCpList(p){var C=(typeof AKD_LKPD_CP!=='undefined'&&AKD_LKPD_CP)||{},o=C[p]||{};return Object.keys(o).map(function(k){return [k,o[k]]})}
/* nomor urut berikutnya dalam satu prodi dan CP (dari peta matriks dan modul yang ada) */
function lkKodeBerikut(prodi,cp){
 var n=0,pre='LKPD-'+prodi+'-'+cp+'-';
 function lihat(id){id=String(id||'');if(id.indexOf(pre)===0){var v=parseInt(id.slice(pre.length),10);if(v>n)n=v}}
 var a=lkKodeAlias();Object.keys(a).forEach(function(k){lihat(a[k])});
 ((typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES)||[]).forEach(function(m){lihat(m.id)});
 return pre+(n+1<10?'0':'')+(n+1);
}
/* data lama yang masih memuat kode lama dibaca sebagai kode baru (hanya di memori; tidak ada isian baru) */
function lkKodeNormalisasi(){
 try{
  ['lkpd','lkpdBukti','lkpdModules'].forEach(function(k){
   var L=(typeof S!=='undefined'&&S&&S[k])||[];
   for(var i=0;i<L.length;i++){var x=L[i];if(!x)continue;
    if(x.moduleId){var b=lkKodeBaru(x.moduleId);if(b!==x.moduleId)x.moduleId=b}
    if(k==='lkpdModules'&&x.id){var c=lkKodeBaru(x.id);if(c!==x.id)x.id=c}
   }
  });
 }catch(e){}
}
(function(){
 var r0=window.lkRefreshModules;
 if(typeof r0==='function')window.lkRefreshModules=function(){lkKodeNormalisasi();return r0.apply(this,arguments)};
})();
