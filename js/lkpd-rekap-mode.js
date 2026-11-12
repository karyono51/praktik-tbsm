/* lkpd-rekap-mode.js: label Latihan/Ujian dan filter mode di Rekap pengumpulan LKPD.
   Tidak mengubah lkpd.js: membungkus viewLKPD dan menyaring S.lkpd sementara saat tampilan dibuat. */
var LKR={m:'ALL'};
function lkrMode(x){return typeof lkmModeOf==='function'?lkmModeOf(x):'ujian'}
function lkrRows(){var staff=isStaff();return (S.lkpd||[]).filter(function(x){return staff||x.sid===S.user.id})}
var _lkrView=viewLKPD;
viewLKPD=function(){
 if(!LK.open||LK.tab!=='riwayat'||LK.detail||LK.editor||!S.user)return _lkrView();
 var all=lkrRows(),la=all.filter(function(x){return lkrMode(x)==='latihan'}),uj=all.length-la.length;
 if(!la.length&&LKR.m!=='ALL')LKR.m='ALL';
 var orig=S.lkpd,h;
 if(LKR.m!=='ALL'){S.lkpd=(orig||[]).filter(function(x){return lkrMode(x)===LKR.m})}
 try{h=_lkrView()}finally{S.lkpd=orig}
 /* label mode di tiap kartu */
 h=h.replace(/<button class="btn small" data-act="lk-detail" data-v="([^"]+)">Detail<\/button>/g,function(m,id){
  var r=all.find(function(x){return x.id===id});if(!r)return m;
  var lat=lkrMode(r)==='latihan';
  return '<div class="row" style="align-items:center"><span class="pill '+(lat?'ok':'warn')+'">'+(lat?'Latihan':'Ujian')+'</span>'+m+'</div>';
 });
 /* chip filter, hanya bila ada data latihan */
 if(la.length){
  var chips='<div class="chips" role="group" aria-label="Filter mode">'+
   [['ALL','Semua',all.length],['ujian','Ujian',uj],['latihan','Latihan',la.length]].map(function(c){return '<button type="button" data-act="lkr-mode" data-v="'+c[0]+'" aria-pressed="'+(LKR.m===c[0])+'">'+c[1]+' · '+c[2]+'</button>'}).join('')+'</div>'+
   (LKR.m==='ALL'?'<p class="note">Rata-rata kelas di bawah menggabungkan Ujian dan Latihan. Pilih Ujian untuk rata-rata nilai yang masuk rekap.</p>':'');
  var i=h.indexOf('Rekap pengumpulan LKPD'),j=i<0?-1:h.indexOf('</span></div>',i);
  if(j>-1)h=h.slice(0,j+13)+chips+h.slice(j+13);
 }
 return h;
};
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="lkr-mode"]');if(!b)return;
 LKR.m=b.dataset.v;render();
});
