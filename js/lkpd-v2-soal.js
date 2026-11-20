/* lkpd-v2-soal.js: tipe soal baru "isian angka" (t:'isian', kunci, tol) untuk mesin LKPD v2.
   Dimuat setelah lkpd-soal.js dan sebelum lkpd-v2.js memakainya saat berjalan. Membungkus fungsi soal tanpa mengubah lkpd-soal.js:
   soal PG, PG kompleks, dan PG kategori tetap diproses fungsi aslinya. Jawaban disimpan sebagai teks di d['q'+i] dan dinilai
   benar bila |jawaban - kunci| <= tol (koma atau titik boleh). Bergantung pada lk2Num/lk2Fmt/lk2Txt dari lkpd-v2.js. */
/* ---------- Soal isian angka (tipe baru pada m.quiz) ---------- */
var _lkqType2=lkqType;lkqType=function(q){return q&&q.t==='isian'?'isian':_lkqType2(q)};
var _lkqAnswered2=lkqAnswered;lkqAnswered=function(q,a){return lkqType(q)==='isian'?(typeof a==='string'&&a.trim()!==''):_lkqAnswered2(q,a)};
var _lkqPoint2=lkqPoint;lkqPoint=function(q,a){
 if(lkqType(q)!=='isian')return _lkqPoint2(q,a);
 var n=lk2Num(a);return isFinite(n)&&Math.abs(n-q.kunci)<=(q.tol>=0?q.tol:0.001)+1e-9?1:0;
};
var _lkqValid2=lkqValid;lkqValid=function(q){return lkqType(q)==='isian'?!!(q&&q.q&&typeof q.q==='string'&&typeof q.kunci==='number'&&isFinite(q.kunci)&&(q.tol===undefined||q.tol>=0)):_lkqValid2(q)};
var _lkqAnsText2=lkqAnsText;lkqAnsText=function(q,a){return lkqType(q)==='isian'?lk2Txt(a)+(q.u?' '+q.u:''):_lkqAnsText2(q,a)};
var _lkqKeyText2=lkqKeyText;lkqKeyText=function(q){return lkqType(q)==='isian'?lk2Fmt(q.kunci)+(q.u?' '+q.u:''):_lkqKeyText2(q)};
var _lkqVerdict2=lkqVerdict;lkqVerdict=function(q,a){
 if(lkqType(q)!=='isian')return _lkqVerdict2(q,a);
 if(typeof a!=='string'||a.trim()==='')return ['warn','Belum dijawab'];
 return lkqPoint(q,a)>=1?['ok','Benar']:['bad','Salah'];
};
var _lkqRender2=lkqRender;lkqRender=function(q,i,d){
 if(lkqType(q)!=='isian')return _lkqRender2(q,i,d);
 var a=d['q'+i];
 return '<div class="qbox lkq" data-t="isian"><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><span class="lkq-hint">Isi angka hasil bacaan'+(q.u?' dalam '+lkEsc(q.u):'')+'. Koma atau titik boleh dipakai.</span>'+
  '<label class="f"><input inputmode="decimal" autocomplete="off" data-lk-field="q'+i+'" value="'+lkEsc(typeof a==='string'?a:'')+'" aria-label="Jawaban '+lkEsc(q.id||i+1)+'"></label></div>';
};

