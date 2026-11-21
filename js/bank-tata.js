/* bank-tata.js: Tata Kelola Bank Soal (guru/admin), disamakan dengan pola Tata Kelola LKPD dan UKK.
   Tombol "Tata Kelola Bank Soal" di tab Bank soal membuka panel berisi:
   1. Pemeriksaan kelengkapan seluruh bank: total, aktif, nonaktif, siap latihan, siap ujian, belum sesuai aturan bentuk soal,
      tanpa kunci, tanpa pembahasan, tanpa topik, dan kemungkinan duplikat. Soal yang perlu perhatian tampil dengan tombol Ubah.
   2. Aksi massal untuk soal yang sedang tampil sesuai filter (tanpa filter = seluruh bank): Aktifkan semua, Nonaktifkan semua,
      dan atur Peruntukan (Latihan, Ujian, Latihan dan ujian). Setiap aksi meminta konfirmasi dan menyebut jumlah soal.
   Impor, Template, dan Ekspor Excel tetap di tombol Bank soal (banksoal-io.js) dan mengikuti filter yang sama.
   TEKNIS: tidak ada koleksi atau atribut baru. Penyimpanan lewat bsPut (soal sendiri) dan bsOverride (soal bawaan), sama dengan tombol
   Aktifkan/Nonaktifkan dan Peruntukan per soal. Soal yang nilainya sudah sama dilewati. Soal belum sesuai aturan yang diberi peruntukan
   Ujian tetap hanya dipakai untuk latihan (bsTujEf). Dimuat setelah bank-pilihan.js dan sebelum bank-filter.js. */
var BTT={open:false,busy:false};
(function(){
 var TUJ={latihan:'Latihan',ujian:'Ujian',keduanya:'Latihan dan ujian'};
 var MAXLIST=8;
 function ok(){return !!S.user&&typeof bsEdit==='function'&&bsEdit()&&actRole()!=='siswa'}
 function nFilter(){var f=(typeof BS!=='undefined'&&BS.flt)||{},n=0;['q','mapel','mp','tipe','tuj','stat','cp'].forEach(function(x){if(f[x])n++});return n}
 /* masalah per soal buatan guru; soal bawaan dikecualikan (sudah diperiksa saat dirilis) */
 function masalah(q){
  var m=[];
  if(!q||q.bawaan)return m;
  var ar=bsAturanSalah(q);if(ar)m.push('belum sesuai aturan ('+ar+')');
  if(!bsHasKey(q)&&(!bsAman()||BS.kcLoaded))m.push('tanpa kunci jawaban');
  if(q.tipe!=='uraian'&&!String(q.bahas||'').trim())m.push('tanpa pembahasan');
  if(!String(q.topik||'').trim())m.push('tanpa topik');
  return m;
 }
 function ringkas(all){
  var r={total:all.length,aktif:0,off:0,aturan:0,kunci:0,bahas:0,topik:0,butuh:[]};
  all.forEach(function(q){
   if(q.aktif)r.aktif++;else r.off++;
   var m=masalah(q);if(!m.length)return;
   if(bsAturanSalah(q))r.aturan++;
   if(m.some(function(x){return x.indexOf('kunci')>-1}))r.kunci++;
   if(m.some(function(x){return x.indexOf('pembahasan')>-1}))r.bahas++;
   if(m.some(function(x){return x.indexOf('topik')>-1}))r.topik++;
   r.butuh.push({q:q,m:m});
  });
  /* yang paling mendesak dulu: aturan atau kunci, lalu pembahasan dan topik */
  r.butuh.sort(function(a,b){
   var wa=a.m.some(function(x){return x.indexOf('aturan')>-1||x.indexOf('kunci')>-1})?0:1,wb=b.m.some(function(x){return x.indexOf('aturan')>-1||x.indexOf('kunci')>-1})?0:1;
   return wa-wb||String(a.q.mapel).localeCompare(String(b.q.mapel))||String(a.q.id).localeCompare(String(b.q.id));
  });
  return r;
 }
 function pill(n,l,bad){return '<span class="pill '+(n&&bad?'warn':'plain')+'">'+n+' '+l+'</span>'}
 function html(){
  if(!ok())return '';
  var h='<div class="lks-acts"><button type="button" class="btn small" data-bs="btt-tog" aria-expanded="'+(!!BTT.open)+'">Tata Kelola Bank Soal</button></div>';
  if(!BTT.open)return h;
  var all=bsSoalAll(),r=ringkas(all),sel=bsFiltered(),nf=nFilter(),b=BTT.busy?' disabled':'';
  var siapUjian=typeof bsSfBase==='function'?bsSfBase('').length:bsPool('ujian','').length,siapLat=bsPool('latihan','').length;
  var dup=0;try{dup=bsDupGrup().length}catch(e){}
  h+='<section class="card lks-more"><div class="row sb"><h3>Tata Kelola Bank Soal</h3><button type="button" class="btn small" data-bs="btt-tog">Tutup</button></div>'+
   '<p class="note">Periksa kelengkapan bank, lalu tampilkan atau sembunyikan soal dan atur peruntukan sekaligus. Impor dan ekspor Excel ada di tombol Bank soal di atas.</p>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px">'+pill(r.total,'soal')+pill(r.aktif,'aktif')+pill(r.off,'nonaktif',true)+pill(siapLat,'siap latihan')+pill(siapUjian,'siap ujian')+'</div>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px">'+pill(r.aturan,'belum sesuai aturan',true)+pill(r.kunci,'tanpa kunci',true)+pill(r.bahas,'tanpa pembahasan',true)+pill(r.topik,'tanpa topik',true)+pill(dup,'kelompok mirip',true)+'</div>'+
   (bsAman()?'<p class="note">Mode ujian aman: soal bawaan tidak dipakai untuk ujian.</p>':'')+
   (dup?'<div class="row"><button type="button" class="btn small" data-bs="dup" aria-pressed="'+(!!BS.dup)+'">'+(BS.dup?'Kembali ke daftar soal':'Lihat soal mirip')+'</button></div>':'')+
   '<h4>Aksi untuk '+(nf?sel.length+' soal sesuai filter':'seluruh bank ('+sel.length+' soal)')+'</h4>'+
   (nf?'':'<p class="note">Belum ada filter. Pilih mapel, jenis, atau peruntukan di bawah bila hanya sebagian soal yang ingin diatur.</p>')+
   '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small" data-bs="btt-aktif" data-v="1"'+(sel.length&&!b?'':' disabled')+'>Aktifkan semua</button><button type="button" class="btn small" data-bs="btt-aktif" data-v="0"'+(sel.length&&!b?'':' disabled')+'>Nonaktifkan semua</button></div>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px">'+Object.keys(TUJ).map(function(t){return '<button type="button" class="btn small" data-bs="btt-tuj" data-v="'+t+'"'+(sel.length&&!b?'':' disabled')+'>Peruntukan: '+TUJ[t]+'</button>'}).join('')+'</div>'+
   (BTT.busy?'<p class="note">Menyimpan perubahan…</p>':'');
  if(r.butuh.length){
   h+='<h4>Soal perlu perhatian ('+r.butuh.length+')</h4><div class="stack">'+r.butuh.slice(0,MAXLIST).map(function(x){
    return '<div class="card"><div class="row bs-tags"><span class="pill plain">'+esc(x.q.mapel||'')+'</span><span class="pill plain">'+esc(BS_TIPE[x.q.tipe]||x.q.tipe)+'</span></div><p class="bs-qs">'+esc(String(x.q.q).slice(0,100))+(String(x.q.q).length>100?'…':'')+'</p><p class="note">'+esc(x.m.join('; '))+'</p><div class="row"><button type="button" class="btn small" data-bs="ubah" data-q="'+esc(x.q.id)+'">Ubah</button></div></div>';
   }).join('')+(r.butuh.length>MAXLIST?'<p class="note">dan '+(r.butuh.length-MAXLIST)+' soal lainnya. Persempit dengan filter atau ekspor Excel untuk melengkapi sekaligus.</p>':'')+'</div>';
  }else h+='<p class="note">Semua soal buatan guru sudah lengkap.</p>';
  return h+'</section>';
 }
 /* terapkan patch ke daftar soal; mengembalikan {n: berubah, p: menunggu terkirim} */
 async function terapkan(list,patch){
  var n=0,p=0,i,q,raw,res;
  for(i=0;i<list.length;i++){
   q=list[i];
   if(Object.keys(patch).every(function(k){return q[k]===patch[k]}))continue;
   if(q.bawaan||BS_IDX[q.id])res=await bsOverride(q.id,patch);
   else{raw=BS.D.soal.filter(function(x){return x.id===q.id})[0];if(!raw)continue;res=await bsPut('soal',Object.assign(raw,patch))}
   n++;if(!res&&Cloud.on)p++;
  }
  return {n:n,p:p};
 }
 async function jalan(patch,pesan,opt){
  if(!ok()||BTT.busy)return;
  var sel=bsFiltered(),ubah=sel.filter(function(q){return !Object.keys(patch).every(function(k){return q[k]===patch[k]})});
  if(!ubah.length){toast('Tidak ada soal yang perlu diubah');return}
  var nf=nFilter(),tambah='';
  if(patch.tujuan&&patch.tujuan!=='latihan'){var kb=ubah.filter(function(q){return bsAturanSalah(q)}).length;if(kb)tambah='\n'+kb+' soal belum sesuai aturan tetap hanya dipakai untuk latihan.'}
  var yes=await uiConfirm(pesan+' untuk '+ubah.length+' soal'+(nf?' sesuai filter':' (seluruh bank)')+'?'+tambah,opt||{ok:'Terapkan'});
  if(!yes)return;
  BTT.busy=true;render();
  var r={n:0,p:0};
  try{r=await terapkan(ubah,patch)}finally{BTT.busy=false;BS.all=null;BS.dg=null}
  toast(r.n+' soal diperbarui'+(r.p?' ('+r.p+' menunggu terkirim)':''));
  render();
 }
 window.bttMasalah=masalah;window.bttRingkas=ringkas;window.bttHtml=html;
 var _v=bsViewBank,KEY='<div class="card"><label class="f">Cari';
 bsViewBank=function(){
  var h=_v.apply(this,arguments),i=h.indexOf(KEY);
  return i<0?h+html():h.slice(0,i)+html()+h.slice(i);
 };
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-bs^="btt-"]');if(!b||b.tagName==='SELECT'||b.disabled)return;
  var a=b.dataset.bs,v=b.dataset.v;
  if(a==='btt-tog'){BTT.open=!BTT.open;render()}
  else if(a==='btt-aktif')return jalan({aktif:v==='1'},v==='1'?'Aktifkan semua soal':'Nonaktifkan semua soal',v==='1'?{ok:'Aktifkan'}:{ok:'Nonaktifkan',danger:true});
  else if(a==='btt-tuj'&&TUJ[v])return jalan({tujuan:v},'Ubah peruntukan menjadi '+TUJ[v],{ok:'Ubah'});
 });
})();
