/* Penilaian soal uraian (guru/admin), tab "Uraian" di CBT Online.
   Alur: pilih sesi, pilih soal uraian, lalu nilai jawaban siswa satu per satu memakai rubrik.
   Skor ditulis lewat fungsi server (aksi nilaiUraian), jadi siswa tidak bisa mengubah skornya sendiri.
   Nilai akhir dihitung ulang oleh server dan dikirim balik (score, benar, pend). */
(function(){
 var UR={sesi:'',qid:'',idx:0,anon:false,busy:false,bulk:false};
 try{UR.anon=localStorage.getItem('tbsm-ur-anon')==='1'}catch(e){}
 window.UR=UR;

 function qmap(){var m={};bsSoalAll().forEach(function(q){m[q.id]=q});return m}
 function hasilUjian(){return BS.D.hasil.filter(function(h){return h.mode==='ujian'&&Array.isArray(h.order)})}
 function jawab(h,qid){return h.ans?h.ans[qid]:null}
 function ada(q,h,qid){return !!q&&bsAnswered(q,jawab(h,qid))}
 function dinilai(h,qid){return !!(h.nu&&h.nu[qid])}

 /* jumlah jawaban uraian yang belum dinilai (untuk angka di tab) */
 window.urPending=function(){
  var m=qmap(),n=0;
  hasilUjian().forEach(function(h){h.order.forEach(function(id){var q=m[id];if(q&&q.tipe==='uraian'&&ada(q,h,id)&&!dinilai(h,id))n++})});
  return n;
 };

 function sesiList(){
  var m=qmap(),by={};
  hasilUjian().forEach(function(h){
   var ids=h.order.filter(function(id){return m[id]&&m[id].tipe==='uraian'});if(!ids.length)return;
   var o=by[h.sesiId]=by[h.sesiId]||{id:h.sesiId,judul:h.sesiJudul||'(sesi)',n:0,d:0,soal:{}};
   ids.forEach(function(id){
    var s=o.soal[id]=o.soal[id]||{id:id,n:0,d:0};
    if(!ada(m[id],h,id))return;
    s.n++;o.n++;if(dinilai(h,id)){s.d++;o.d++}
   });
  });
  BS.D.sesi.forEach(function(s){if(by[s.id])by[s.id].judul=s.judul||by[s.id].judul});
  return Object.keys(by).map(function(k){return by[k]}).sort(function(a,b){return (b.n-b.d)-(a.n-a.d)});
 }
 function daftarJawab(sesi,qid){
  var q=bsSoalById(qid);
  return hasilUjian().filter(function(h){return h.sesiId===sesi&&h.order.indexOf(qid)>-1&&ada(q,h,qid)})
   .sort(function(a,b){return String(a.siswa||'').localeCompare(String(b.siswa||''))});
 }
 function pesanDasar(){
  if(!window.Cloud||!Cloud.on)return '<div class="card"><p class="note">Penilaian uraian memerlukan koneksi ke server.</p></div>';
  if(typeof cbtFn!=='function')return '<div class="card"><p class="note">Fungsi CBT aman belum aktif, jadi uraian belum bisa dinilai.</p></div>';
  return '';
 }

 window.bsViewUraian=function(){
  var p=pesanDasar();if(p)return p;
  if(UR.sesi&&UR.qid)return viewNilai();
  if(UR.sesi)return viewSoal();
  return viewSesi();
 };

 function viewSesi(){
  var ls=sesiList();
  if(!ls.length)return '<div class="card"><p class="note">Belum ada jawaban uraian. Soal uraian dibuat di Bank soal (jenis Uraian), lalu dipakai pada sesi ujian.</p></div>';
  return '<p class="note">Pilih sesi untuk menilai jawaban uraian siswa.</p>'+ls.map(function(o){
   var sisa=o.n-o.d;
   return '<div class="card"><div class="row sb"><b>'+esc(o.judul)+'</b><span class="pill '+(sisa?'warn':'ok')+'">'+(sisa?sisa+' menunggu':'Selesai')+'</span></div>'+
    '<p class="note">'+o.d+' dari '+o.n+' jawaban sudah dinilai</p>'+
    '<button type="button" class="btn small" data-ur="sesi" data-v="'+esc(o.id)+'">Buka</button></div>';
  }).join('');
 }

 function viewSoal(){
  var o=sesiList().filter(function(x){return x.id===UR.sesi})[0];
  if(!o){UR.sesi='';return viewSesi()}
  var m=qmap();
  return '<div class="row"><button type="button" class="btn small" data-ur="home">Kembali</button><b>'+esc(o.judul)+'</b></div>'+
   Object.keys(o.soal).map(function(id){
    var s=o.soal[id],q=m[id],sisa=s.n-s.d;
    return '<div class="card"><div class="row sb"><span class="pill plain">'+esc((q&&q.mapel)||'')+'</span><span class="pill '+(sisa?'warn':'ok')+'">'+(sisa?sisa+' menunggu':'Selesai')+'</span></div>'+
     '<p class="bs-qs">'+esc(String((q&&q.q)||'').slice(0,160))+'</p><p class="note">'+s.d+' dari '+s.n+' dinilai · skor maksimum '+((q&&q.maks)||'?')+'</p>'+
     '<button type="button" class="btn small" data-ur="soal" data-v="'+esc(id)+'">Nilai jawaban</button></div>';
   }).join('');
 }

 function viewNilai(){
  var q=bsSoalById(UR.qid),L=daftarJawab(UR.sesi,UR.qid);
  if(!q||!L.length){UR.qid='';return viewSoal()}
  if(UR.idx>=L.length)UR.idx=L.length-1;if(UR.idx<0)UR.idx=0;
  var h=L[UR.idx],g=h.nu&&h.nu[UR.qid],rub=Array.isArray(q.rub)?q.rub:[],maks=q.maks||0;
  var nama=UR.anon?('Siswa '+(UR.idx+1)):esc(h.siswa||'(siswa)')+(h.kelas?' · '+esc(h.kelas):'');
  var done=L.filter(function(x){return dinilai(x,UR.qid)}).length;
  var out='<div class="row"><button type="button" class="btn small" data-ur="back">Kembali</button><span class="note">'+done+' dari '+L.length+' dinilai</span></div>';
  out+='<div class="card"><div class="row sb"><b>Soal</b><span class="pill plain">Maks '+maks+'</span></div><p class="bs-q">'+bsText(q.q)+'</p>'+(window.sgQHtml?sgQHtml(q):'')+
   (q.kj?'<details class="bs-urk"><summary>Kunci jawaban / pedoman</summary><p>'+bsText(q.kj)+'</p></details>':'')+'</div>';
  out+='<div class="card"><div class="row sb"><b>'+nama+'</b><span class="pill '+(g?'ok':'warn')+'">'+(g?'Skor '+g.skor:'Belum dinilai')+'</span></div>'+
   '<div class="bs-urj"><p>'+bsText(jawab(h,UR.qid))+'</p></div>'+
   '<label class="row"><input type="checkbox" data-ur="anon"'+(UR.anon?' checked':'')+'> Sembunyikan nama (penilaian anonim)</label></div>';
  if(!rub.length){
   out+='<div class="card"><p class="note">Rubrik soal ini belum termuat. Buka Bank soal lalu kembali ke sini.</p></div>';
  }else{
   out+='<div class="card"><b>Rubrik</b>'+rub.map(function(k,i){
    var dr=UR.draft,v=dr&&dr.rub&&dr.rub[i]!=null?dr.rub[i]:(g&&Array.isArray(g.rub)&&g.rub[i]!=null?g.rub[i]:'');
    return '<div class="two bs-rubrow"><div><span>'+esc(k[0])+'</span><span class="note"> maks '+k[1]+'</span></div>'+
     '<div class="row"><button type="button" class="btn small" data-ur="nol" data-v="'+i+'" aria-label="Skor 0">0</button>'+
     '<input class="ur-r" id="ur-r'+i+'" data-i="'+i+'" data-m="'+k[1]+'" type="number" inputmode="decimal" min="0" max="'+k[1]+'" step="0.5" value="'+esc(v)+'" aria-label="Skor '+esc(k[0])+'">'+
     '<button type="button" class="btn small" data-ur="penuh" data-v="'+i+'" aria-label="Skor penuh">Penuh</button></div></div>';
   }).join('')+
   '<p class="note">Jumlah skor: <b id="ur-tot" class="mono">'+(UR.draft?UR.draft.skor:(g?g.skor:0))+'</b> dari '+maks+'</p>'+
   '<label class="f">Komentar untuk siswa (opsional)<textarea id="ur-cat" rows="3" maxlength="300">'+esc(UR.draft?UR.draft.cat:(g?g.cat||'':''))+'</textarea></label>'+
   '<div class="row"><button type="button" class="btn small" data-ur="prev"'+(UR.idx?'':' disabled')+'>Sebelumnya</button>'+
   '<button type="button" class="btn primary" data-ur="simpan"'+(UR.busy?' disabled':'')+'>'+(UR.busy?'Menyimpan…':(UR.idx<L.length-1?'Simpan dan lanjut':'Simpan'))+'</button>'+
   '<button type="button" class="btn small" data-ur="next"'+(UR.idx<L.length-1?'':' disabled')+'>Berikutnya</button></div></div>';
   out+=viewBulk(L,h);
  }
  return out;
 }

 /* beri nilai yang sama ke beberapa siswa sekaligus (mis. banyak jawaban singkat yang identik) */
 function viewBulk(L,cur){
  var sisa=L.filter(function(x){return x.id!==cur.id&&!dinilai(x,UR.qid)});
  if(!sisa.length)return '';
  var out='<div class="card"><div class="row sb"><b>Nilai yang sama untuk banyak siswa</b><button type="button" class="btn small" data-ur="bulk">'+(UR.bulk?'Tutup':'Buka')+'</button></div>';
  if(UR.bulk){
   out+='<p class="note">Isi rubrik di atas, lalu centang siswa yang berhak mendapat skor dan komentar yang sama. Baca jawaban mereka dulu bila perlu. Hanya yang belum dinilai ('+sisa.length+') yang ditampilkan.</p>'+
    '<div class="row"><button type="button" class="btn small" data-ur="bsemua">Pilih semua</button><button type="button" class="btn small" data-ur="bkosong">Kosongkan</button></div>'+
    sisa.slice(0,60).map(function(x){
     var i=L.indexOf(x),nm=UR.anon?('Siswa '+(i+1)):esc(x.siswa||'(siswa)');
     var t=String(jawab(x,UR.qid)||'').replace(/\s+/g,' ').slice(0,90);
     return '<label class="row"><input type="checkbox" class="ur-b" data-h="'+esc(x.id)+'"> <span><b>'+nm+'</b> <span class="note">'+esc(t)+(String(jawab(x,UR.qid)||'').length>90?'…':'')+'</span></span></label>';
    }).join('')+(sisa.length>60?'<p class="note">Menampilkan 60 pertama dari '+sisa.length+'.</p>':'')+
    '<button type="button" class="btn primary" data-ur="bterap"'+(UR.busy?' disabled':'')+'>Terapkan nilai ke siswa terpilih</button>';
  }
  return out+'</div>';
 }
 function bacaForm(){
  var rub=[];$$('.ur-r').forEach(function(e){var v=parseFloat(String(e.value).replace(',','.'));rub[+e.dataset.i]=isFinite(v)?Math.max(0,Math.min(+e.dataset.m,v)):0});
  return {rub:rub,skor:totalNow(),cat:(document.getElementById('ur-cat')||{}).value||''};
 }
 async function kirim(h,v){
  var rs=await cbtFn({action:'nilaiUraian',hasilId:h.id,qid:UR.qid,skor:v.skor,rub:v.rub,cat:v.cat});
  var o=BS.D.hasil.filter(function(x){return x.id===h.id})[0]||h;
  o.nu=o.nu||{};o.nu[UR.qid]=rs.nu;o.score=rs.score;o.benar=rs.benar;o.pend=rs.pend||undefined;
  return rs;
 }
 async function terapkan(){
  if(UR.busy)return;
  var pil=$$('.ur-b').filter(function(e){return e.checked}).map(function(e){return e.dataset.h});
  if(!pil.length){toast('Centang siswa dahulu');return}
  var v=bacaForm();
  if(!(await uiConfirm('Beri skor '+v.skor+' ke '+pil.length+' siswa terpilih?\nJawaban mereka tidak dibaca ulang oleh aplikasi. Pastikan jawabannya memang setara.',{ok:'Terapkan'})))return;
  var L=daftarJawab(UR.sesi,UR.qid),ok=0,gagal=0;
  UR.busy=true;render();
  for(var i=0;i<pil.length;i+=4){
   var grp=pil.slice(i,i+4).map(function(id){return L.filter(function(x){return x.id===id})[0]}).filter(Boolean);
   var rs=await Promise.all(grp.map(function(h){return kirim(h,v).then(function(){ok++},function(){gagal++})}));
  }
  UR.draft=null;UR.busy=false;UR.bulk=false;toast(ok+' nilai tersimpan'+(gagal?', '+gagal+' gagal':''));render();window.scrollTo(0,0);
 }

 function totalNow(){
  var t=0;$$('.ur-r').forEach(function(e){var v=parseFloat(String(e.value).replace(',','.'));if(isFinite(v))t+=Math.max(0,Math.min(+e.dataset.m,v))});
  t=Math.round(t*100)/100;var el=document.getElementById('ur-tot');if(el)el.textContent=t;return t;
 }
 document.addEventListener('input',function(e){if(e.target&&e.target.classList&&e.target.classList.contains('ur-r'))totalNow()});

 async function simpan(){
  var q=bsSoalById(UR.qid),L=daftarJawab(UR.sesi,UR.qid),h=L[UR.idx];if(!q||!h||UR.busy)return;
  var v=bacaForm();
  UR.busy=true;render();
  try{
   await kirim(h,v);
   toast('Nilai tersimpan');
   if(UR.idx<L.length-1)UR.idx++;
  }catch(e){toast((e&&e.message)||'Gagal menyimpan nilai')}
  UR.busy=false;render();window.scrollTo(0,0);
 }

 document.addEventListener('click',function(e){
  var b=e.target.closest('[data-ur]');if(!b)return;
  var a=b.dataset.ur,v=b.dataset.v;
  if(a==='bulk'||a==='anon'){if($$('.ur-r').length)UR.draft=bacaForm()}
  else if(['sesi','home','soal','back','prev','next','simpan'].indexOf(a)>-1)UR.draft=null;
  if(a==='sesi'){UR.sesi=v;UR.qid='';UR.idx=0;render();window.scrollTo(0,0)}
  else if(a==='home'){UR.sesi='';UR.qid='';render()}
  else if(a==='soal'){UR.qid=v;var L=daftarJawab(UR.sesi,v),i=L.findIndex(function(x){return !dinilai(x,v)});UR.idx=i>-1?i:0;render();window.scrollTo(0,0)}
  else if(a==='back'){UR.qid='';render()}
  else if(a==='prev'){if(UR.idx>0){UR.idx--;render();window.scrollTo(0,0)}}
  else if(a==='next'){UR.idx++;render();window.scrollTo(0,0)}
  else if(a==='anon'){UR.anon=!!b.checked;try{localStorage.setItem('tbsm-ur-anon',UR.anon?'1':'0')}catch(e){}render()}
  else if(a==='bulk'){UR.bulk=!UR.bulk;render()}
  else if(a==='bsemua'||a==='bkosong'){$$('.ur-b').forEach(function(x){x.checked=a==='bsemua'})}
  else if(a==='bterap')terapkan();
  else if(a==='nol'||a==='penuh'){var el=document.getElementById('ur-r'+v);if(el){el.value=a==='nol'?0:el.dataset.m;totalNow()}}
  else if(a==='simpan')simpan();
 });
})();
