/* neon-admin.js: kartu admin di CBT Online untuk menguji sambungan Neon, membuat tabel, dan menyalin data lama dari Appwrite.
   Hanya tampil untuk peran yang boleh mengelola akun; server tetap hanya melayani label admin. Dimuat setelah banksoal.js dan cbt.js. */
(function(){
 if(typeof window.bsCbtRingkas!=='function'||!window.Cloud||!Cloud.on)return;
 var st={msg:'',busy:false},o=window.bsCbtRingkas;
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function tampil(t){st.msg=t;var e=document.getElementById('neon-msg');if(e)e.textContent=t}
 function panel(){
  var neon=CFG.CBT_DB==='neon'&&CFG.CBT_AMAN===true;
  return '<details class="card" style="margin-top:10px"><summary><b>Neon</b> · penyimpanan ujian: <b>'+(neon?'Neon':'Appwrite')+'</b></summary>'
   +'<p class="note">'+(neon?'Catatan ujian, hasil, dan kunci disimpan di Neon lewat fungsi server.':'Klien masih memakai Appwrite. Untuk beralih, isi CBT_DB:\'neon\' di config.js dan CBT_DB=neon di variabel fungsi (docs-NEON.md).')+'</p>'
   +'<div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-neon="uji">Uji sambungan</button><button type="button" class="btn" data-neon="siap">Siapkan tabel</button><button type="button" class="btn" data-neon="salin">Salin data lama</button></div>'
   +'<p class="note" id="neon-msg" style="white-space:pre-wrap">'+esc(st.msg)+'</p></details>';
 }
 window.bsCbtRingkas=function(){
  var h=o.apply(this,arguments);
  try{if(h&&window.can&&can('akun'))return h+panel()}catch(e){}
  return h;
 };
 function ringkas(r){
  var t='Penyimpanan di fungsi: '+r.backend+(r.backend==='neon'?'\nSambungan '+r.ms+' ms\nBaris: '+Object.keys(r.tabel||{}).map(function(k){return k+' '+(r.tabel[k]===null?'(tabel belum ada)':r.tabel[k])}).join(', '):'\n'+(r.pesan||''));
  return t+'\nCadangan Appwrite: '+(r.CBT_LEGACY?'aktif':'mati')+' · prodi: '+r.PRODI;
 }
 async function salin(){
  var tot={},kolom=['soal_kunci','soal_hasil','soal_run'];
  for(var i=0;i<kolom.length;i++){
   var c=kolom[i],cur=null,baru=0,baca=0;
   for(;;){
    tampil('Menyalin '+c+'… '+baca+' dibaca, '+baru+' baru');
    var r=await cbtFn({action:'dbSalin',col:c,cursor:cur});
    baru+=r.baru;baca+=r.baca;
    if(!r.sisa)break;cur=r.cursor;
   }
   tot[c]=baru+' baru dari '+baca;
  }
  return 'Selesai.\n'+kolom.map(function(c){return c+': '+tot[c]}).join('\n')+'\nSetelah semua sesi lama selesai dan hasilnya terlihat, isi CBT_LEGACY=0 di fungsi dan CBT_LEGACY:false di config.js.';
 }
 document.addEventListener('click',async function(e){
  var b=e.target.closest&&e.target.closest('[data-neon]');if(!b)return;
  e.preventDefault();if(st.busy)return;st.busy=true;
  try{
   var a=b.getAttribute('data-neon');
   if(a==='salin')tampil(await salin());
   else{tampil('Menghubungi Neon…');tampil(ringkas(await cbtFn({action:'dbUji',siapkan:a==='siap'})))}
  }catch(er){tampil('Gagal: '+((er&&er.message)||er))}
  finally{st.busy=false}
 });
})();
