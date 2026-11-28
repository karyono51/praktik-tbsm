/* Akses latihan siswa: guru/admin membuka dan menutup latihan CBT per tingkat kelas, dengan jadwal opsional.
   Tanpa akses yang dibuka, siswa tidak bisa memulai latihan dan tidak membaca bank soal dari Appwrite.
   Penyimpanan: dokumen koleksi soal_sesi bertanda payload.jenis='latihan' (BS.D.lat), tanpa skema baru.
   Logika gerbang ada di banksoal.js (bsLatAkses, bsLatBuka, bsAdaAkses). Dokumen: docs-AKSES-LATIHAN.md */
(function(){
 if(typeof bsViewSesi!=='function')return;
 var KLS=[['ALL','Semua kelas'],['X','Kelas X'],['XI','Kelas XI'],['XII','Kelas XII']];
 function daftar(){return (BS.D.lat||[]).filter(schAkunOk).sort(function(a,b){return (b.ts||0)-(a.ts||0)})}
 function kartu(){
  var L=daftar(),h='<div class="card" id="al-kartu"><b>Akses latihan siswa</b><p class="note">Siswa hanya bisa memulai latihan bila ada akses yang dibuka untuk kelasnya. Tanpa akses, siswa juga tidak membaca bank soal dari server.</p>';
  if(!L.length)h+='<p class="muted">Belum ada akses latihan. Latihan tertutup untuk semua siswa.</p>';
  h+=L.map(function(s){
   var st=bsSesiStatus(s);
   return '<div style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px"><div class="row sb"><b>'+esc(s.judul||'Akses latihan')+'</b><span class="pill '+st.c+'">'+st.t+'</span></div>'+
    '<p class="note">'+schLabelModul(s.sekolah)+' · Kelas '+esc(bsKlsLabel(s))+(s.mulai?' · mulai '+bsWaktu(s.mulai):'')+(s.selesai?' · tutup '+bsWaktu(s.selesai):'')+'</p>'+
    '<div class="row"><button type="button" class="btn small" data-lat="aktif" data-q="'+esc(s.id)+'">'+(s.aktif===false?'Buka':'Tutup')+'</button><button type="button" class="btn small" data-lat="hapus" data-q="'+esc(s.id)+'">Hapus</button></div></div>';
  }).join('');
  h+='<div style="border-top:1px solid var(--line);margin-top:10px;padding-top:10px"><label class="f">Buka latihan untuk<select id="al-kls">'+KLS.map(function(k){return '<option value="'+k[0]+'">'+k[1]+'</option>'}).join('')+'</select></label>'+
   '<div class="two"><label class="f">Dibuka mulai (opsional)<input id="al-mulai" type="datetime-local"></label><label class="f">Ditutup (opsional)<input id="al-selesai" type="datetime-local"></label></div>'+
   '<button type="button" class="btn primary" data-lat="buka">Buka akses latihan</button></div></div>';
  return h;
 }
 var _vs=bsViewSesi;
 bsViewSesi=function(){return kartu()+_vs.apply(this,arguments)};
 document.addEventListener('click',async function(e){
  var b=e.target.closest&&e.target.closest('[data-lat]');if(!b||!S.user)return;
  var a=b.dataset.lat,id=b.dataset.q;
  if(a==='buka'){
   var k=(document.getElementById('al-kls')||{}).value||'ALL',m=(document.getElementById('al-mulai')||{}).value,t=(document.getElementById('al-selesai')||{}).value;
   var mu=m?new Date(m).getTime():0,se=t?new Date(t).getTime():0;
   if(mu&&se&&se<=mu){toast('Waktu tutup harus setelah waktu mulai');return}
   var o={id:uid(),ts:Date.now(),judul:'Akses latihan · '+(k==='ALL'?'semua kelas':'Kelas '+k),kelas:k,durasi:0,jumlah:0,acak:false,mulai:mu,selesai:se,aktif:true,kkm:0,oleh:String(S.user.nama||'').slice(0,64),sekolah:(typeof schKode==='function'&&schKode())||'',jenis:'latihan'};
   bsPut('lat',o);render();toast('Akses latihan dibuka');
  }else if(a==='aktif'){
   var s=(BS.D.lat||[]).filter(function(x){return x.id===id})[0];if(!s)return;
   s.aktif=s.aktif===false;bsPut('lat',s);render();
  }else if(a==='hapus'){
   var s2=(BS.D.lat||[]).filter(function(x){return x.id===id})[0];if(!s2)return;
   if(typeof uiConfirm==='function'&&!(await uiConfirm('Hapus akses latihan ini? Siswa tidak bisa memulai latihan dari akses ini lagi.',{ok:'Hapus'})))return;
   await bsDel('lat',id);render();
  }
 });
})();
