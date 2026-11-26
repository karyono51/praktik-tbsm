/* absensi.js: absensi kehadiran dan absensi praktik lewat barcode (QR).
   Siswa: kartu barcode pribadi (menu "Barcode saya" dan kartu di beranda siswa), dapat disimpan sebagai gambar.
   Guru/admin: menu Absensi (kelas, tanggal, jenis Kehadiran atau Praktik), scan kamera, scan dari galeri,
   status Hadir/Sakit/Izin/Alpa per siswa, ikon barcode di tiap siswa untuk keterangan, rekap per bulan dan Excel.
   Admin juga mendapat ikon barcode di daftar Akun (baris siswa).
   Penyimpanan: koleksi `observasi` yang sama (S.observasi) dengan tipe = 'absen', satu dokumen per guru, kelas, tanggal, dan jenis;
   isi (payload) memuat status semua siswa pada sesi itu. Jadi tidak ada koleksi atau atribut Appwrite baru, dan sinkron,
   antrean offline, serta hak akses (admin semua, guru miliknya) ikut berlaku. Pemindai memakai BarcodeDetector bawaan peramban
   (Chrome Android); QR dibuat sendiri oleh qr.js. Lihat docs-ABSENSI.md. */
var AB={kelas:'',tgl:'',j:'h',ket:'',tab:'sesi',sheet:null,log:[],rk:{bulan:'',kelas:'',j:'h'},_last:{},_t:null};
var AB_ST={H:['Hadir','ok'],S:['Sakit','warn'],I:['Izin','plain'],A:['Alpa','bad']};
var AB_J={h:'Kehadiran',p:'Praktik'};
ICO.barcode='<path d="M4 5v14M7 5v14M11 5v14M14 5v14M17 5v14M20 5v14"/>';
ICO.absensi='<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 9v6M11 9v6M14 9v6M16 9v6"/>';

/* ---- isi barcode: TBSM|id|cek ; cek mencegah QR sembarang terbaca sebagai siswa ---- */
function abCek(id){var s='tbsm:'+id,h=5381,i;for(i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36).slice(-4)}
function abIsi(u){return 'TBSM|'+u.id+'|'+abCek(u.id)}
function abUrai(t){var p=String(t||'').trim().split('|');return(p.length===3&&p[0]==='TBSM'&&p[1]&&abCek(p[1])===p[2])?p[1]:null}

/* ---- sesi: satu dokumen observasi bertipe 'absen' per guru, kelas, tanggal, jenis ---- */
function abInit(){if(!AB.kelas)AB.kelas=(S.user&&S.user.kelas&&KLS.indexOf(S.user.kelas)>-1&&actRole()==='siswa')?S.user.kelas:KLS[0];if(!AB.tgl)AB.tgl=ymd(Date.now());if(!AB.rk.bulan)AB.rk.bulan=ymd(Date.now()).slice(0,7);if(!AB.rk.kelas)AB.rk.kelas=KLS[0]}
function abDocId(k,t,j){var g=(S.user&&S.user.id)||'',h=5381,i;for(i=0;i<g.length;i++)h=((h<<5)+h+g.charCodeAt(i))>>>0;return 'ab-'+String(t).replace(/-/g,'').slice(2)+'-'+j+'-'+String(k).toLowerCase()+'-'+h.toString(36)}
function abRec(k,t,j){var id=abDocId(k,t,j);return (S.observasi||[]).filter(function(r){return r.tipe==='absen'&&r.id===id})[0]||null}
function abPay(r){try{var p=JSON.parse(r.payload||'{}');if(!p.rows)p.rows={};return p}catch(e){return {v:1,rows:{}}}}
function abBaris(k,t,j){var r=abRec(k,t,j);return r?abPay(r).rows:{}}
function abSiswa(k){return S.users.filter(function(u){return hasRole(u,'siswa')&&u.kelas===k&&u.aktif!==false&&schAkunOk(u)}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')})}
function abJam(t){var d=new Date(t);return ('0'+d.getHours()).slice(-2)+'.'+('0'+d.getMinutes()).slice(-2)}
function abTglIndo(t){var b=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],p=String(t).split('-');return p.length===3?(+p[2])+' '+b[+p[1]-1]+' '+p[0]:t}
function abSimpan(){try{save()}catch(e){}clearTimeout(AB._t);AB._t=setTimeout(function(){try{persist()}catch(e){}},1200)}

/* st null = hapus status siswa dari sesi. ex: {m:'s'|'m', c:'catatan'} */
function abSet(k,t,j,sid,st,ex){
 ex=ex||{};
 var rec=abRec(k,t,j),p=rec?abPay(rec):{v:1,j:j,ket:'',rows:{}},old=p.rows[sid]||{};
 if(st==null)delete p.rows[sid];
 else{
  var c=ex.c!=null?String(ex.c).trim().slice(0,200):(old.c||'');
  p.rows[sid]={s:st,t:Date.now(),m:ex.m||'m'};if(c)p.rows[sid].c=c;
 }
 if(j==='p'&&AB.ket&&!p.ket)p.ket=AB.ket.slice(0,120);
 var h=0,key;for(key in p.rows)if(p.rows[key].s==='H')h++;
 var payload=JSON.stringify(p);
 if(payload.length>19000){toast('Sesi terlalu besar untuk disimpan');return false}
 var mapel=j==='p'?('Praktik'+(p.ket?': '+p.ket:'')).slice(0,120):'Kehadiran';
 if(rec){rec.payload=payload;rec.skor=h;rec.mapel=mapel;rec.ts=Date.now();if(rec.r)rec.d=1}
 else if(Object.keys(p.rows).length){
  S.observasi=S.observasi||[];
  S.observasi.push({id:abDocId(k,t,j),ts:Date.now(),tipe:'absen',guruId:S.user.id,guru:String(S.user.nama).slice(0,120),mapel:mapel,kelas:k,tanggal:t,pengamat:String(S.user.nama).slice(0,120),pengamatId:S.user.id,skor:h,kategori:j==='p'?'praktik':'hadir',payload:payload});
 }
 abSimpan();return true;
}

/* ---- catatan Observasi lain tidak boleh menampilkan sesi absensi ---- */
if(typeof obsTipe==='function'){var _obsTipeAb=obsTipe;obsTipe=function(r){return r&&r.tipe==='absen'?'absen':_obsTipeAb(r)}}

/* ---- kartu barcode siswa (canvas) ---- */
function abKartu(u){
 var isi=abIsi(u),nm=QR.buat(isi).n,sc=Math.max(6,Math.floor(400/nm)),q=QR.gambar(isi,sc,0),qs=q.width,
  W=640,y0=150,H=y0+qs+48+64+46+90,c=document.createElement('canvas'),g;
 c.width=W;c.height=H;g=c.getContext('2d');
 g.fillStyle='#fff';g.fillRect(0,0,W,H);
 g.fillStyle='#0d6b3a';g.fillRect(0,0,W,120);
 g.fillStyle='#fff';g.textAlign='center';g.font='bold 30px sans-serif';g.fillText('KARTU BARCODE ABSENSI',W/2,58);
 g.font='22px sans-serif';g.fillText(String(typeof schNama==='function'?schNama():'').slice(0,48),W/2,94);
 g.imageSmoothingEnabled=false;g.drawImage(q,Math.round(W/2-qs/2),y0+24,qs,qs);
 g.fillStyle='#111';g.font='bold 36px sans-serif';
 var nama=String(u.nama||''),y=y0+qs+48+64;
 while(g.measureText(nama).width>W-60&&nama.length>3)nama=nama.slice(0,-2);
 g.fillText(nama,W/2,y);
 g.font='28px sans-serif';g.fillStyle='#444';
 g.fillText('Kelas '+(u.kelas||'-')+'  ·  '+(u.username||''),W/2,y+46);
 g.font='20px sans-serif';g.fillStyle='#777';
 g.fillText('Tunjukkan ke guru saat absensi. Jangan dibagikan.',W/2,H-30);
 g.strokeStyle='#cfd8d2';g.lineWidth=3;g.strokeRect(6,6,W-12,H-12);
 return c;
}
function abTampil(u){
 if(!u)return;
 var old=document.getElementById('abkartu');if(old)old.remove();
 var ov=document.createElement('div');ov.id='abkartu';ov.className='ui-ov bp-ov';
 ov.innerHTML='<div class="bp-sheet abs-sheet" role="dialog" aria-modal="true" aria-label="Barcode absensi"><div class="bp-h"><span>Barcode · '+esc(u.nama)+'</span><button type="button" class="bp-x" data-ab2="x">Tutup</button></div><div class="abs-body"><div class="abs-img"></div><p class="note">Naikkan kecerahan layar lalu tunjukkan ke guru. Guru juga bisa memindai gambar kartu yang disimpan di galeri.</p><div class="row"><button type="button" class="btn primary grow" data-ab2="simpan">Simpan gambar</button></div></div></div>';
 document.body.appendChild(ov);
 var cv=abKartu(u);cv.style.cssText='width:auto;max-width:100%;max-height:52vh;height:auto;border-radius:14px;border:1px solid var(--line)';
 ov.querySelector('.abs-img').appendChild(cv);
 ov.addEventListener('click',function(e){
  var b=e.target.closest('[data-ab2]');if(!b&&e.target!==ov)return;
  var a=b&&b.dataset.ab2;
  if(!b||a==='x'){ov.remove();return}
  if(a==='simpan')cv.toBlob(function(bl){
   if(!bl){toast('Gagal membuat gambar');return}
   var url=URL.createObjectURL(bl),el=document.createElement('a');
   el.href=url;el.download='barcode-'+String(u.nama).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.png';
   document.body.appendChild(el);el.click();el.remove();setTimeout(function(){URL.revokeObjectURL(url)},4000);toast('Gambar disimpan');
  },'image/png');
 });
}

/* ---- pemindai ---- */
function abBip(ok){
 try{
  var A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  var x=abBip.c||(abBip.c=new A()),o=x.createOscillator(),g=x.createGain();
  o.frequency.value=ok?880:220;g.gain.value=.08;o.connect(g);g.connect(x.destination);o.start();o.stop(x.currentTime+(ok?.12:.25));
 }catch(e){}
 try{if(navigator.vibrate)navigator.vibrate(ok?60:[80,60,80])}catch(e){}
}
/* satu kode -> {ok,dup,msg}; mencatat Hadir untuk sesi yang sedang dibuka */
function abProses(raw){
 var sid=abUrai(raw);
 if(!sid)return {ok:false,msg:'Bukan barcode siswa TBSM'};
 var u=S.users.filter(function(x){return x.id===sid})[0];
 if(!u)return {ok:false,msg:'Siswa tidak ada di daftar akun'};
 if(!hasRole(u,'siswa')||!schAkunOk(u))return {ok:false,msg:u.nama+': bukan siswa sekolah ini'};
 if(u.aktif===false)return {ok:false,msg:u.nama+': akun nonaktif'};
 if(u.kelas!==AB.kelas)return {ok:false,msg:u.nama+' kelas '+(u.kelas||'?')+', sesi ini kelas '+AB.kelas};
 var cur=abBaris(AB.kelas,AB.tgl,AB.j)[sid];
 if(cur&&cur.s==='H')return {ok:true,dup:true,msg:u.nama+' sudah hadir '+abJam(cur.t)};
 if(!abSet(AB.kelas,AB.tgl,AB.j,sid,'H',{m:'s'}))return {ok:false,msg:'Gagal menyimpan'};
 return {ok:true,msg:u.nama+' hadir'+(cur?' (sebelumnya '+AB_ST[cur.s][0]+')':'')};
}
function abCatat(h){AB.log.unshift(h);AB.log=AB.log.slice(0,12)}

var abCam={stream:null,det:null,on:false,tm:null};
function abAda(){return typeof window.BarcodeDetector==='function'}
function abBuatDet(){try{return new BarcodeDetector({formats:['qr_code']})}catch(e){return null}}
function abTolak(){toast('Pemindai belum didukung peramban ini. Pakai Chrome terbaru di Android, atau tandai manual dengan tombol status.')}

async function abKamera(){
 if(!abAda()||!abBuatDet()){abTolak();return}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('Kamera butuh sambungan aman (https)');return}
 if(document.getElementById('abscan'))return;
 var ov=document.createElement('div');ov.id='abscan';ov.className='ab-scan';
 ov.innerHTML='<video playsinline muted autoplay></video><div class="ab-frame" aria-hidden="true"></div>'+
  '<div class="ab-top"><div><b>'+AB_J[AB.j]+' · Kelas '+esc(AB.kelas)+'</b><small>'+esc(abTglIndo(AB.tgl))+'</small></div><button type="button" class="btn small" data-ab3="x">Selesai</button></div>'+
  '<div class="ab-bot"><div class="ab-msg" id="abmsg" role="status" aria-live="polite">Arahkan kamera ke barcode siswa</div><div class="ab-cnt" id="abcnt"></div><ul class="ab-rec" id="abrec"></ul></div>';
 document.body.appendChild(ov);
 var vid=ov.querySelector('video');
 ov.addEventListener('click',function(e){if(e.target.closest('[data-ab3="x"]'))abTutupKamera()});
 try{
  abCam.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
  vid.srcObject=abCam.stream;await vid.play();
 }catch(err){
  abTutupKamera();toast(err&&err.name==='NotAllowedError'?'Izin kamera ditolak. Aktifkan di pengaturan peramban.':'Kamera tidak bisa dibuka');return;
 }
 abCam.det=abBuatDet();abCam.on=true;abHitung();
 var tik=async function(){
  if(!abCam.on)return;
  try{
   if(vid.readyState>=2){
    var codes=await abCam.det.detect(vid);
    for(var i=0;i<codes.length;i++){
     var raw=codes[i].rawValue,now=Date.now();
     if(AB._last[raw]&&now-AB._last[raw]<2500)continue;
     AB._last[raw]=now;
     var h=abProses(raw);abBip(h.ok&&!h.dup);abCatat(h);abTampilPesan(h);
    }
   }
  }catch(e){}
  if(abCam.on)abCam.tm=setTimeout(tik,200);
 };
 tik();
}
function abTampilPesan(h){
 var m=document.getElementById('abmsg'),r=document.getElementById('abrec');
 if(m){m.textContent=(h.ok?(h.dup?'• ':'✓ '):'✗ ')+h.msg;m.className='ab-msg '+(h.ok?(h.dup?'dup':'ok'):'bad')}
 if(r)r.innerHTML=AB.log.slice(0,4).map(function(x){return '<li class="'+(x.ok?'':'bad')+'">'+esc(x.msg)+'</li>'}).join('');
 abHitung();
}
function abHitung(){
 var c=document.getElementById('abcnt');if(!c)return;
 var R=abBaris(AB.kelas,AB.tgl,AB.j),n=abSiswa(AB.kelas),h=n.filter(function(u){return R[u.id]&&R[u.id].s==='H'}).length;
 c.textContent='Hadir '+h+' dari '+n.length+' siswa';
}
function abTutupKamera(){
 abCam.on=false;clearTimeout(abCam.tm);
 try{if(abCam.stream)abCam.stream.getTracks().forEach(function(t){t.stop()})}catch(e){}
 abCam.stream=null;
 var o=document.getElementById('abscan');if(o)o.remove();
 try{persist()}catch(e){}
 render();
}
/* scan gambar dari galeri: satu gambar boleh memuat beberapa barcode */
async function abGaleri(files){
 if(!files||!files.length)return;
 var det=abAda()?abBuatDet():null;
 if(!det){abTolak();return}
 var nOk=0,nDup=0,nGagal=0,i,j;
 toast('Memindai '+files.length+' gambar...');
 for(i=0;i<files.length;i++){
  var codes=[];
  try{var bm=await createImageBitmap(files[i]);codes=await det.detect(bm);if(bm.close)bm.close()}catch(e){codes=[]}
  if(!codes.length){abCatat({ok:false,msg:'Tidak ada barcode terbaca: '+String(files[i].name||'gambar').slice(0,40)});nGagal++;continue}
  for(j=0;j<codes.length;j++){var h=abProses(codes[j].rawValue);abCatat(h);if(!h.ok)nGagal++;else if(h.dup)nDup++;else nOk++}
 }
 abBip(nOk>0);
 toast(nOk+' hadir'+(nDup?', '+nDup+' sudah tercatat':'')+(nGagal?', '+nGagal+' gagal':''));
 try{persist()}catch(e){}
 render();
}

/* ---- tampilan ---- */
function abHitungSesi(R,L){
 var c={H:0,S:0,I:0,A:0,B:0};
 L.forEach(function(u){var x=R[u.id];if(x&&c[x.s]!=null)c[x.s]++;else c.B++});
 return c;
}
function abLembar(){
 var s=AB.sheet;if(!s)return '';
 var u=S.users.filter(function(x){return x.id===s.sid})[0];if(!u)return '';
 var R=abBaris(s.kelas,s.tgl,s.j),cur=s.pilih!==undefined?s.pilih:(R[u.id]?R[u.id].s:null),cat=s.cat!==undefined?s.cat:(R[u.id]&&R[u.id].c)||'';
 var chips=Object.keys(AB_ST).map(function(k){return '<button type="button" class="abst-b'+(cur===k?' on '+AB_ST[k][1]:'')+'" data-act="absp" data-v="'+k+'" aria-pressed="'+(cur===k)+'">'+AB_ST[k][0]+'</button>'}).join('');
 return '<div class="ui-ov bp-ov"><div class="bp-sheet abs-sheet" role="dialog" aria-modal="true" aria-label="Keterangan siswa"><div class="bp-h"><span>Keterangan · '+esc(u.nama)+'</span><button type="button" class="bp-x" data-act="absx">Tutup</button></div><div class="abs-body">'+
  '<div class="abs-qr">'+QR.svg(abIsi(u),{px:116,label:'Barcode '+u.nama})+'<div><b>'+esc(u.nama)+'</b><div class="note">Kelas '+esc(u.kelas||'-')+' · '+esc(u.username||'')+'</div><button type="button" class="btn small" data-act="abkartu" data-v="'+esc(u.id)+'">Lihat dan simpan kartu</button></div></div>'+
  '<div class="abs-two"><label class="f">Tanggal<input type="date" data-ab="stgl" value="'+esc(s.tgl)+'"></label><label class="f">Jenis<select data-ab="sj"><option value="h"'+(s.j==='h'?' selected':'')+'>Kehadiran</option><option value="p"'+(s.j==='p'?' selected':'')+'>Praktik</option></select></label></div>'+
  '<div class="abst" role="group" aria-label="Status">'+chips+'</div>'+
  '<label class="f">Keterangan (opsional)<textarea data-ab="cat" rows="2" maxlength="200" placeholder="Contoh: demam, surat dokter menyusul">'+esc(cat)+'</textarea></label>'+
  '<div class="row abs-act"><button type="button" class="btn" data-act="abkosong">Hapus status</button><button type="button" class="btn primary grow" data-act="absimpan">Simpan</button></div></div></div></div>';
}
function viewAbsensi(){
 abInit();
 if(AB.tab==='rekap')return abViewRekap();
 var L=abSiswa(AB.kelas),R=abBaris(AB.kelas,AB.tgl,AB.j),c=abHitungSesi(R,L),q='';
 var kls=KLS.map(function(k){return '<option value="'+k+'"'+(k===AB.kelas?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var pills=['H','S','I','A'].map(function(k){return '<span class="pill '+AB_ST[k][1]+'">'+AB_ST[k][0]+' <b class="mono">'+c[k]+'</b></span>'}).join('')+'<span class="pill plain">Belum <b class="mono">'+c.B+'</b></span>';
 var log=AB.log.length?'<div class="card ab-log"><div class="row sb"><b>Hasil pindai terakhir</b><button type="button" class="btn small" data-act="ablogx">Tutup</button></div><ul class="plain">'+AB.log.slice(0,6).map(function(x){return '<li class="'+(x.ok?'':'bad')+'">'+(x.ok?(x.dup?'• ':'✓ '):'✗ ')+esc(x.msg)+'</li>'}).join('')+'</ul></div>':'';
 var rows=L.map(function(u,i){
  var x=R[u.id],st=x?x.s:null;
  var info=esc(u.username||'')+(x?' · '+abJam(x.t)+(x.m==='s'?' · scan':''):'')+(x&&x.c?' · '+esc(x.c):'');
  var b=Object.keys(AB_ST).map(function(k){return '<button type="button" class="abst-b'+(st===k?' on '+AB_ST[k][1]:'')+'" data-act="abst" data-v="'+esc(u.id)+'|'+k+'" aria-pressed="'+(st===k)+'" aria-label="'+AB_ST[k][0]+' untuk '+esc(u.nama)+'">'+AB_ST[k][0]+'</button>'}).join('');
  return '<div class="card abr"><div class="row sb"><div class="grow"><b>'+(i+1)+'. '+esc(u.nama)+'</b><div class="note">'+info+'</div></div><button type="button" class="btn small abico" data-act="abkode" data-v="'+esc(u.id)+'" aria-label="Barcode dan keterangan '+esc(u.nama)+'">'+svg(ICO.barcode,20)+'</button></div><div class="abst" role="group">'+b+'</div></div>';
 }).join('');
 var ket=AB.j==='p'?'<label class="f">Kegiatan praktik<input data-ab="ket" maxlength="100" value="'+esc(abPay(abRec(AB.kelas,AB.tgl,'p')||{payload:'{}'}).ket||AB.ket)+'" placeholder="Contoh: Praktik mikrometer"></label>':'';
 return '<div class="row sb"><h2>Absensi</h2><button type="button" class="btn small" data-act="abrekap">Rekap dan Excel</button></div>'+
  '<div class="card">'+
  '<div class="abs-two"><label class="f">Kelas<select data-ab="kelas">'+kls+'</select></label><label class="f">Tanggal<input type="date" data-ab="tgl" value="'+esc(AB.tgl)+'"></label></div>'+
  '<div class="chips" role="group" aria-label="Jenis absensi"><button type="button" data-act="abjenis" data-v="h" aria-pressed="'+(AB.j==='h')+'">Kehadiran</button><button type="button" data-act="abjenis" data-v="p" aria-pressed="'+(AB.j==='p')+'">Praktik</button></div>'+ket+
  '<div class="row">'+pills+'</div>'+
  '<div class="row"><button type="button" class="btn primary grow" data-act="abscan">Scan kamera</button><label class="btn grow filebtn" style="text-align:center">Scan dari galeri<input id="abfile" type="file" accept="image/*" multiple hidden></label></div>'+
  (abAda()?'':'<p class="note">Peramban ini belum mendukung pemindai. Pakai Chrome terbaru di Android, atau tandai manual dengan tombol status di bawah.</p>')+
  '</div>'+log+
  (rows||'<div class="card"><p class="muted">Belum ada siswa di kelas '+esc(AB.kelas)+'.</p></div>')+
  (L.length?'<div class="row"><button type="button" class="btn" data-act="abalpa">Belum ada status → Alpa ('+c.B+')</button>'+(abRec(AB.kelas,AB.tgl,AB.j)?'<button type="button" class="btn danger" data-act="abhapus">Hapus sesi</button>':'')+'</div>':'')+
  '<p class="note">Scan mencatat Hadir. Untuk siswa yang tidak masuk, ketuk Sakit, Izin, atau Alpa; ikon barcode membuka keterangan dan kartu barcode siswa. Data tersimpan sebagai milik akun ini (admin melihat semua).</p>'+(AB.sheet&&AB.sheet.via!=='akun'?abLembar():'');
}

/* ---- rekap ---- */
function abRekapData(){
 var k=AB.rk.kelas,j=AB.rk.j,b=AB.rk.bulan,L=abSiswa(k),adm=can('observasi-semua'),kat=j==='p'?'praktik':'hadir';
 var S2=(typeof schObsList==='function'?schObsList(S.observasi||[]):(S.observasi||[])).filter(function(r){
  return r.tipe==='absen'&&r.kelas===k&&r.kategori===kat&&String(r.tanggal).slice(0,7)===b&&(adm||r.pengamatId===S.user.id)}).sort(function(a,c){return String(a.tanggal).localeCompare(String(c.tanggal))});
 var sess=S2.map(function(r){return {r:r,rows:abPay(r).rows}});
 var rec=L.map(function(u){
  var c={H:0,S:0,I:0,A:0};
  sess.forEach(function(s){var x=s.rows[u.id];if(x&&c[x.s]!=null)c[x.s]++});
  var tot=sess.length;return {u:u,c:c,tot:tot,pct:tot?Math.round(c.H*100/tot):0};
 });
 return {L:L,sess:sess,rec:rec};
}
function abViewRekap(){
 var D=abRekapData(),k=AB.rk.kelas;
 var kls=KLS.map(function(x){return '<option value="'+x+'"'+(x===k?' selected':'')+'>Kelas '+x+'</option>'}).join('');
 var rows=D.rec.map(function(o,i){
  return '<div class="card abr"><div class="row sb"><div class="grow"><b>'+(i+1)+'. '+esc(o.u.nama)+'</b><div class="note">'+esc(o.u.username||'')+'</div></div><span class="pill '+(o.tot&&o.pct>=75?'ok':o.tot?'warn':'plain')+'">'+(o.tot?o.pct+'%':'-')+'</span></div><div class="row"><span class="pill ok">H '+o.c.H+'</span><span class="pill warn">S '+o.c.S+'</span><span class="pill plain">I '+o.c.I+'</span><span class="pill bad">A '+o.c.A+'</span><span class="note">dari '+o.tot+' sesi</span></div></div>';
 }).join('');
 return '<div class="row sb"><h2>Rekap absensi</h2><button type="button" class="btn small" data-act="abback">Kembali</button></div>'+
  '<div class="card"><div class="abs-two"><label class="f">Kelas<select data-ab="rkelas">'+kls+'</select></label><label class="f">Bulan<input type="month" data-ab="rbulan" value="'+esc(AB.rk.bulan)+'"></label></div>'+
  '<div class="chips" role="group"><button type="button" data-act="abrj" data-v="h" aria-pressed="'+(AB.rk.j==='h')+'">Kehadiran</button><button type="button" data-act="abrj" data-v="p" aria-pressed="'+(AB.rk.j==='p')+'">Praktik</button></div>'+
  '<div class="row"><span class="pill plain">'+D.sess.length+' sesi</span><span class="pill plain">'+D.L.length+' siswa</span><button type="button" class="btn small primary" data-act="abxls"'+(D.sess.length?'':' disabled')+'>Ekspor Excel</button></div></div>'+
  (rows||'<div class="card"><p class="muted">Belum ada siswa di kelas '+esc(k)+'.</p></div>')+
  (D.sess.length?'':'<p class="note">Belum ada sesi '+AB_J[AB.rk.j].toLowerCase()+' pada bulan ini.</p>');
}
function abXls(){
 if(!needX())return;
 var D=abRekapData(),k=AB.rk.kelas,j=AB.rk.j;
 var a=[['No','Nama','NIS/Username','Hadir','Sakit','Izin','Alpa','Jumlah sesi','% Hadir']];
 D.rec.forEach(function(o,i){a.push([i+1,o.u.nama,o.u.username||'',o.c.H,o.c.S,o.c.I,o.c.A,o.tot,o.tot?o.pct:''])});
 var h=[['No','Nama','NIS/Username']];
 D.sess.forEach(function(s){h[0].push(abTglIndo(s.r.tanggal)+' ('+String(s.r.guru||'').split(' ')[0]+')')});
 D.rec.forEach(function(o,i){var r=[i+1,o.u.nama,o.u.username||''];D.sess.forEach(function(s){var x=s.rows[o.u.id];r.push(x?x.s+(x.c?' - '+x.c:''):'')});h.push(r)});
 var wb=XLSX.utils.book_new(),w1=XLSX.utils.aoa_to_sheet(a),w2=XLSX.utils.aoa_to_sheet(h);
 w1['!cols']=[{wch:5},{wch:30},{wch:16},{wch:8},{wch:8},{wch:8},{wch:8},{wch:12},{wch:9}];
 XLSX.utils.book_append_sheet(wb,w1,'Rekap');XLSX.utils.book_append_sheet(wb,w2,'Harian');
 dl(wb,'Absensi_'+AB_J[j]+'_Kelas'+k+'_'+AB.rk.bulan);
}

/* ---- gaya ---- */
(function(){
 var st=document.createElement('style');st.textContent=
  '.abs-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.abs-two .f{min-width:0}.abs-two input,.abs-two select{min-width:0;width:100%}'+
  '.abs-sheet{max-height:90vh}.abs-act{position:sticky;bottom:-16px;margin:0 -14px -16px;padding:10px 14px calc(12px + env(safe-area-inset-bottom));background:var(--surface);border-top:1px solid var(--line)}'+
  '.pill .mono{margin-left:5px}'+
  '.abst{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.abst-b{border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:12px;padding:9px 2px;font-weight:700;font-size:13px;min-height:40px}'+
  '.abst-b.on{color:#fff;border-color:transparent}.abst-b.on.ok{background:var(--ok)}.abst-b.on.warn{background:var(--warn)}.abst-b.on.plain{background:var(--accent)}.abst-b.on.bad{background:var(--bad)}'+
  '.abr .abico{flex:none;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center}'+
  '.abs-body{overflow-y:auto;overscroll-behavior:contain;padding:12px 14px 16px;display:grid;gap:12px}.abs-img{display:flex;justify-content:center}'+
  '.abs-qr{display:flex;gap:12px;align-items:center}.abs-qr svg{flex:none;border:1px solid var(--line);border-radius:10px}'+
  '.ab-log li.bad,.ab-rec li.bad{color:var(--bad)}.ab-log ul{margin:6px 0 0}'+
  '.ab-scan{position:fixed;inset:0;z-index:9999;background:#000;color:#fff;display:flex;flex-direction:column}.ab-scan video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}'+
  '.ab-frame{position:absolute;left:50%;top:42%;width:min(70vw,320px);aspect-ratio:1;transform:translate(-50%,-50%);border:3px solid rgba(255,255,255,.9);border-radius:18px;box-shadow:0 0 0 100vmax rgba(0,0,0,.45)}'+
  '.ab-top{position:relative;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;background:linear-gradient(#000a,#0000)}.ab-top small{display:block;opacity:.8}'+
  '.ab-bot{position:relative;margin-top:auto;padding:14px 14px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(#0000,#000c);display:grid;gap:8px}'+
  '.ab-msg{font-weight:700;padding:10px 12px;border-radius:12px;background:#ffffff26}.ab-msg.ok{background:#1b8a4ccc}.ab-msg.bad{background:#b3261ecc}.ab-msg.dup{background:#8a6d1bcc}'+
  '.ab-cnt{font-size:14px;opacity:.9}.ab-rec{list-style:none;margin:0;padding:0;font-size:13px;opacity:.9;display:grid;gap:2px}.ab-rec li.bad{color:#ffb4ab}';
 document.head.appendChild(st);
})();

/* ---- tindakan ---- */
/* hanya admin dan guru yang mencatat absensi (Kepala Sekolah hanya melihat data lain) */
function abBoleh(){return !!S.user&&can('observasi')&&(actRole()==='admin'||actRole()==='guru')}
document.addEventListener('click',async function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b||!S.user)return;
 var a=b.dataset.act,v=b.dataset.v;
 if(a==='abme'){drOpen(false);abTampil(S.user);return}
 if(a==='abkartu'){var u0=S.users.filter(function(x){return x.id===v})[0];if(u0)abTampil(u0);return}
 if(!isStaff()&&a.indexOf('ab')!==0)return;
 if(a==='abjenis'){AB.j=v;render();return}
 if(a==='abrj'){AB.rk.j=v;render();return}
 if(a==='abrekap'){AB.tab='rekap';render();window.scrollTo(0,0);return}
 if(a==='abback'){AB.tab='sesi';render();return}
 if(a==='abscan'){abKamera();return}
 if(a==='abxls'){abXls();return}
 if(a==='ablogx'){AB.log=[];render();return}
 if(a==='abst'){
  var p=String(v).split('|'),sid=p[0],st=p[1],cur=abBaris(AB.kelas,AB.tgl,AB.j)[sid];
  abSet(AB.kelas,AB.tgl,AB.j,sid,(cur&&cur.s===st)?null:st,{m:'m'});render();return;
 }
 if(a==='abkode'){
  var us=S.users.filter(function(x){return x.id===v})[0];if(!us)return;
  AB.sheet={sid:v,kelas:us.kelas||AB.kelas,tgl:AB.tgl,j:AB.j};render();return;
 }
 if(a==='abakun'){
  var ua=S.users.filter(function(x){return x.id===v})[0];if(!ua)return;
  abInit();AB.sheet={sid:v,kelas:ua.kelas||KLS[0],tgl:AB.tgl,j:AB.j,via:'akun'};render();return;
 }
 if(a==='absx'||a==='absx2'){AB.sheet=null;render();return}
 if(a==='absp'){if(AB.sheet){AB.sheet.pilih=(AB.sheet.pilih===v)?null:v;render()}return}
 if(a==='abkosong'){
  if(!AB.sheet)return;var s=AB.sheet;abSet(s.kelas,s.tgl,s.j,s.sid,null);AB.sheet=null;render();toast('Status dihapus');return;
 }
 if(a==='absimpan'){
  var s2=AB.sheet;if(!s2)return;
  var R2=abBaris(s2.kelas,s2.tgl,s2.j),st2=s2.pilih!==undefined?s2.pilih:(R2[s2.sid]?R2[s2.sid].s:null),cat=s2.cat!==undefined?s2.cat:(R2[s2.sid]&&R2[s2.sid].c)||'';
  if(!st2){toast('Pilih status dulu');return}
  var keep=R2[s2.sid];
  if(abSet(s2.kelas,s2.tgl,s2.j,s2.sid,st2,{m:keep&&keep.m||'m',c:cat})){AB.sheet=null;render();toast('Keterangan tersimpan')}
  return;
 }
 if(a==='abalpa'){
  var L=abSiswa(AB.kelas),R=abBaris(AB.kelas,AB.tgl,AB.j),kos=L.filter(function(u){return !R[u.id]});
  if(!kos.length){toast('Semua siswa sudah punya status');return}
  if(!(await uiConfirm('Tandai '+kos.length+' siswa yang belum punya status sebagai Alpa?',{ok:'Tandai Alpa'})))return;
  kos.forEach(function(u){abSet(AB.kelas,AB.tgl,AB.j,u.id,'A',{m:'m'})});render();toast(kos.length+' siswa ditandai Alpa');return;
 }
 if(a==='abhapus'){
  var r=abRec(AB.kelas,AB.tgl,AB.j);if(!r)return;
  if(!(await uiConfirm('Hapus seluruh sesi '+AB_J[AB.j].toLowerCase()+' kelas '+AB.kelas+' tanggal '+abTglIndo(AB.tgl)+'?\nTindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
  if(Cloud.on&&r.r){if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}if(!(await Cloud.remove('observasi',r.id)))return}
  S.observasi=S.observasi.filter(function(x){return x.id!==r.id});persist();render();toast('Sesi dihapus');return;
 }
});
document.addEventListener('change',function(e){
 var t=e.target,k=t&&t.dataset&&t.dataset.ab;if(!k)return;
 if(t.id==='abfile'||k==='file'){return}
 if(k==='kelas'){AB.kelas=t.value;render()}
 else if(k==='tgl'){if(t.value){AB.tgl=t.value;render()}}
 else if(k==='ket'){AB.ket=t.value.trim();var rr=abRec(AB.kelas,AB.tgl,'p');if(rr){var p=abPay(rr);p.ket=AB.ket;rr.payload=JSON.stringify(p);rr.mapel=('Praktik'+(AB.ket?': '+AB.ket:'')).slice(0,120);if(rr.r)rr.d=1;abSimpan()}}
 else if(k==='rkelas'){AB.rk.kelas=t.value;render()}
 else if(k==='rbulan'){if(t.value){AB.rk.bulan=t.value;render()}}
 else if(k==='stgl'&&AB.sheet){if(t.value){AB.sheet.tgl=t.value;AB.sheet.pilih=undefined;AB.sheet.cat=undefined;render()}}
 else if(k==='sj'&&AB.sheet){AB.sheet.j=t.value;AB.sheet.pilih=undefined;AB.sheet.cat=undefined;render()}
});
document.addEventListener('input',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.ab==='cat'&&AB.sheet)AB.sheet.cat=t.value});
document.addEventListener('change',function(e){
 var t=e.target;if(!t||t.id!=='abfile')return;
 var f=[].slice.call(t.files||[]);t.value='';abGaleri(f);
});

/* ---- menu, beranda, daftar Akun ---- */
var _viewKatAb=viewKatalog;
viewKatalog=function(){
 if(S.tab==='absensi'&&abBoleh())return viewAbsensi();
 var h=_viewKatAb.apply(this,arguments);
 try{
  if(actRole()==='siswa'&&S.tab==='katalog'){
   h='<div class="card"><div class="row sb"><div class="grow"><b>Barcode absensi saya</b><div class="note">Tunjukkan ke guru untuk absensi kehadiran dan praktik.</div></div><button type="button" class="btn small primary" data-act="abme">Tampilkan</button></div></div>'+h;
  }
 }catch(err){}
 return h;
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('absensi')<0)NAVTABS.push('absensi');
if(typeof NAVPERM!=='undefined')NAVPERM.absensi='observasi';
if(typeof window.viewAkun==='function'){
 var _vAkAb=window.viewAkun;
 window.viewAkun=function(){
  var h=_vAkAb.apply(this,arguments);
  h=h.replace(/<button type="button" class="btn small" data-act="akunedit" data-v="([^"]+)">/g,function(m,id){
   var u=S.users.filter(function(x){return x.id===id})[0];
   return (u&&hasRole(u,'siswa')?'<button type="button" class="btn small abico" data-act="abakun" data-v="'+esc(id)+'" aria-label="Barcode dan absensi '+esc(u.nama)+'">'+svg(ICO.barcode,18)+'</button>':'')+m;
  });
  if(AB.sheet&&AB.sheet.via==='akun'&&S.tab==='akun')h+=abLembar();
  return h;
 };
}
var _renderAb=render;
render=function(){
 _renderAb.apply(this,arguments);
 try{
  if(!S.user)return;
  var sb=document.querySelector('.sbody');if(!sb)return;
  var cur=V.mode==='list'?S.tab:'';
  if(abBoleh()&&!sb.querySelector('[data-v="absensi"]')){
   var html='<button type="button" class="srow" data-act="menu" data-v="absensi"'+(cur==='absensi'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO.absensi,22)+'</span><span class="st"><b>Absensi</b><small>Scan barcode, kehadiran dan praktik</small></span>'+svg(ICO.chev,18)+'</button>';
   var ref=sb.querySelector('[data-v="observasi"]');
   if(ref)ref.insertAdjacentHTML('beforebegin',html);else sb.insertAdjacentHTML('beforeend',html);
  }
  if(actRole()==='siswa'&&!sb.querySelector('[data-v="barcode"]')){
   var h2='<button type="button" class="srow" data-act="abme" data-v="barcode"><span class="ico">'+svg(ICO.barcode,22)+'</span><span class="st"><b>Barcode saya</b><small>Kartu absensi kehadiran dan praktik</small></span>'+svg(ICO.chev,18)+'</button>';
   var first=sb.querySelector('.srow');
   if(first)first.insertAdjacentHTML('afterend',h2);else sb.insertAdjacentHTML('beforeend',h2);
  }
 }catch(err){}
};
