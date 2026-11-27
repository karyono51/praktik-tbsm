/* Ruang dan gelombang ujian (guru/admin).
   Data ada di payload sesi: ruang: [{id, nama, gel, pk (id akun proktor), kap (kapasitas, kosong = tanpa batas), m, s (jadwal ruang, kosong = jadwal sesi), sis: [id akun siswa]}].
   Yang dipakai: formulir sesi (bagian "Ruang dan gelombang"), Pantau, kartu peserta, dan daftar hadir per ruang.
   Penegakan (siswa harus punya ruang, jadwal per gelombang, proktor hanya untuk ruangnya) dikerjakan fungsi server cbt. */
(function(){
'use strict';
function e(v){return window.esc?esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function F(){return window.BS&&BS.sf}
function ts(v){return v?new Date(v).getTime()||0:0}

window.rgList=function(s){return s&&Array.isArray(s.ruang)?s.ruang.filter(function(r){return r&&Array.isArray(r.sis)}):[]};
window.rgOf=function(s,uid){var l=rgList(s);for(var i=0;i<l.length;i++)if(l[i].sis.indexOf(uid)>-1)return l[i];return null};
/* Rombel (dari menu Administrasi Akademik): peta id siswa -> nama rombel aktif, disimpan 2 detik agar daftar panjang tetap cepat.
   Siswa tanpa rombel memakai tingkatnya (kolom kelas akun). */
var RG_PETA=null,RG_TS=0;
window.rgPeta=function(){
 var now=Date.now();if(RG_PETA&&now-RG_TS<2000)return RG_PETA;
 var m={};
 try{if(window.AKD&&AKD.D&&Array.isArray(AKD.D.kelas))AKD.D.kelas.forEach(function(k){if(k.aktif===false)return;(k.anggota||[]).forEach(function(id){if(!m[id])m[id]=String(k.nama||'')})})}catch(x){}
 RG_PETA=m;RG_TS=now;return m;
};
window.rgPetaReset=function(){RG_PETA=null};
window.rgGrup=function(u){return (u&&(rgPeta()[u.id]||u.kelas))||''};
window.rgUrut=function(list){
 var m=rgPeta(),T=['X','XI','XII'];
 function tk(u){var i=T.indexOf(u.kelas);return i<0?9:i}
 return list.slice().sort(function(a,b){return tk(a)-tk(b)||String(m[a.id]||a.kelas||'').localeCompare(String(m[b.id]||b.kelas||''),'id',{numeric:true})||String(a.nama).localeCompare(String(b.nama),'id')});
};
/* rombel aktif yang boleh dipilih untuk sesi: sesuai tingkat dan sekolah sesi */
window.rgRombelList=function(f){
 var sk=String(f.sekolah||'').toUpperCase();
 if(bsKls(f).length!==1)return [];   /* rombel dipilih dalam satu tingkat; 'semua kelas' tidak memilih rombel */
 try{return (window.akKelasAll?akKelasAll():[]).filter(function(k){return k.aktif!==false&&bsKlsCocok(f,k.tingkat)&&(!sk||!k.sekolah||String(k.sekolah).toUpperCase()===sk)})}catch(x){return []}
};
window.rgDariRombel=function(f){
 var ok={};(f.rmb||[]).forEach(function(id){ok[id]=1});
 var ang={};(window.AKD&&AKD.D?AKD.D.kelas:[]).forEach(function(k){if(ok[k.id])(k.anggota||[]).forEach(function(id){ang[id]=1})});
 return rgUrut(S.users.filter(function(u){return ang[u.id]&&hasRole(u,'siswa')&&u.aktif!==false}));
};
/* siswa terdaftar untuk sesi (kelas dan sekolah) */
window.rgRoster=function(s){
 if(Array.isArray(s.pes)){   /* daftar tetap: persis siswa di daftar, urut kelas lalu nama */
  var ps={};s.pes.forEach(function(x){if(x)ps[x]=1});
  return rgUrut(S.users.filter(function(u){return ps[u.id]}));
 }
 return rgDinamis(s);
};
window.rgDinamis=function(s){
 return rgUrut(S.users.filter(function(u){
  if(!hasRole(u,'siswa')||u.aktif===false)return false;
  if(!bsKlsCocok(s,u.kelas))return false;
  var sk=String(s.sekolah||'').toUpperCase(),uk=String(u.sekolah||'').toUpperCase();
  return !(sk&&uk&&uk!=='ALL'&&sk!==uk);
 }));
};
/* nomor peserta dari daftar tetap: awalan + urutan, celah ('') dijaga agar nomor tidak bergeser */
window.rgNomor=function(s,uid){
 if(!s||!s.nomor||!Array.isArray(s.pes))return '';
 var ix=s.pes.indexOf(uid);if(ix<0)return '';
 var n=s.nomor,d=Math.max(2,Math.min(5,+n.d||3)),a=+n.a||1,v=String(a+ix);
 while(v.length<d)v='0'+v;
 return String(n.p||'').slice(0,16)+v;
};
window.rgLabel=function(r){return r?String(r.nama||'Ruang')+(r.gel?' · gelombang '+r.gel:''):''};
function pkNama(id){var u=S.users.filter(function(x){return x.id===id})[0];return u?u.nama:''}
/* jadwal efektif siswa: ruang menimpa jadwal sesi */
window.rgJadwal=function(s,r){
 var m=(r&&r.m)||s.mulai||0,x=(r&&r.s)||s.selesai||0;
 return (m?bsWaktu(m):'Sesuai jadwal guru')+(x?' sampai '+bsWaktu(x):'');
};
window.rgPak=function(l){
 return (l||[]).map(function(r){var o={id:r.id,nama:String(r.nama||'').slice(0,40),sis:r.sis.slice()};if(r.gel)o.gel=String(r.gel).slice(0,12);if(r.pk)o.pk=r.pk;if(+r.kap>0)o.kap=Math.min(999,Math.floor(+r.kap));if(r.m)o.m=r.m;if(r.s)o.s=r.s;return o});
};
/* pemeriksaan saat sesi disimpan: pesan galat, atau '' bila aman */
window.rgCek=function(f){
 var l=f.ruang||[],nm={};if(!l.length)return '';
 for(var i=0;i<l.length;i++){
  var n=String(l[i].nama||'').trim().toLowerCase();
  if(!n)return 'Ruang '+(i+1)+' belum diberi nama';
  if(nm[n])return 'Nama ruang "'+l[i].nama+'" dipakai dua kali';nm[n]=1;
  if(l[i].m&&l[i].s&&l[i].s<=l[i].m)return 'Ruang "'+l[i].nama+'": waktu tutup harus setelah waktu buka';
  if(+l[i].kap>0&&l[i].sis.length>+l[i].kap)return 'Ruang "'+l[i].nama+'" berisi '+l[i].sis.length+' siswa, melebihi kapasitas '+l[i].kap;
 }
 if(JSON.stringify(rgPak(l)).length+JSON.stringify(f.ids||[]).length+JSON.stringify(f.pes||[]).length>17000)return 'Penempatan terlalu besar untuk satu sesi. Bagi siswa ke beberapa sesi (misalnya per kelas)';
 return '';
};
/* Membagi siswa (sudah terurut kelas lalu nama) ke ruang sesuai kapasitas.
   mode 'rata'  : jumlah per ruang dibuat serata mungkin tanpa melewati kapasitas; siswa diisi berurutan sehingga satu kelas utuh berada di ruang-ruang yang berdekatan.
   mode 'penuh' : ruang diisi satu per satu sampai kapasitas (ruang tanpa batas menampung sisanya).
   mode 'campur': bergilir, tiap ruang berisi campuran kelas (ruang penuh dilewati).
   Hasil: {per: [[id siswa] untuk tiap ruang, urut seperti R], sisa: [id siswa yang tidak muat]} */
window.rgBagi=function(ros,R,mode){
 var n=ros.length,m=R.length,cap=R.map(function(r){return +r.kap>0?Math.floor(+r.kap):Infinity}),per=R.map(function(){return []}),sisa=[],i,k;
 if(!m)return {per:per,sisa:ros.map(function(u){return u.id})};
 if(mode==='campur'){
  var p=0;
  ros.forEach(function(u){
   for(k=0;k<m;k++){var j=(p+k)%m;if(per[j].length<cap[j]){per[j].push(u.id);p=(j+1)%m;return}}
   sisa.push(u.id);
  });
  return {per:per,sisa:sisa};
 }
 var cnt=R.map(function(){return 0}),left=n;
 if(mode==='penuh'){
  for(i=0;i<m&&left>0;i++){cnt[i]=Math.min(cap[i],left);left-=cnt[i]}
 }else{
  while(left>0){
   var open=[];for(i=0;i<m;i++)if(cnt[i]<cap[i])open.push(i);
   if(!open.length)break;
   var give=Math.max(1,Math.floor(left/open.length));
   for(k=0;k<open.length&&left>0;k++){var a=Math.min(give,cap[open[k]]-cnt[open[k]],left);cnt[open[k]]+=a;left-=a}
  }
 }
 var at=0;
 for(i=0;i<m;i++){for(k=0;k<cnt[i];k++)per[i].push(ros[at++].id)}
 for(;at<n;at++)sisa.push(ros[at].id);
 return {per:per,sisa:sisa};
};
/* komposisi rombel (atau kelas bila belum ada rombel) isi satu ruang, mis. "XI TSM 1 20 · XI TSM 2 10" */
window.rgKomp=function(r){
 var c={},o=[];
 r.sis.forEach(function(id){var u=S.users.filter(function(x){return x.id===id})[0],k=(u&&rgGrup(u))||'-';c[k]=(c[k]||0)+1});
 Object.keys(c).sort(function(a,b){return String(a).localeCompare(String(b),'id',{numeric:true})}).forEach(function(k){o.push(k+' '+c[k])});
 return o.join(' · ');
};
window.rgBelum=function(f){
 var ass={};(f.ruang||[]).forEach(function(r){r.sis.forEach(function(x){ass[x]=1})});
 return (f.ruang&&f.ruang.length)?rgRoster(f).filter(function(u){return !ass[u.id]}).length:0;
};

/* ---------- Formulir ---------- */
function inner(f){
 var R=f.ruang=f.ruang||[],ros=rgRoster(f),pk=S.users.filter(function(u){return hasRole(u,'proktor')&&u.aktif!==false});
 var belum=rgBelum(f),h='';
 h+='<p class="note">Opsional. Tiap ruang punya kapasitas, proktor, dan jadwal (gelombang). Bila ada ruang, hanya siswa yang ditempatkan yang bisa mulai.</p>';
 R.forEach(function(r,i){
  h+='<div class="card"><div class="row sb"><b>Ruang '+(i+1)+'</b><button type="button" class="btn small danger" data-rg="del" data-i="'+i+'">Hapus</button></div>'+
   '<div class="two"><label class="f">Nama ruang<input data-rgf="nama" data-i="'+i+'" value="'+e(r.nama)+'" maxlength="40" placeholder="Lab TSM 1"></label>'+
   '<label class="f">Gelombang<input data-rgf="gel" data-i="'+i+'" value="'+e(r.gel||'')+'" maxlength="12" placeholder="1"></label></div>'+
   '<label class="f">Proktor<select data-rgf="pk" data-i="'+i+'"><option value="">Belum ditentukan</option>'+pk.map(function(u){return '<option value="'+e(u.id)+'"'+(u.id===r.pk?' selected':'')+'>'+e(u.nama)+'</option>'}).join('')+'</select></label>'+
   '<label class="f">Kapasitas (0 = tanpa batas)<input type="number" inputmode="numeric" min="0" max="999" data-rgf="kap" data-i="'+i+'" value="'+(+r.kap>0?+r.kap:0)+'"></label>'+
   '<div class="two"><label class="f">Dibuka (kosong = jadwal sesi)<input type="datetime-local" data-rgf="m" data-i="'+i+'" value="'+bsDtv(r.m)+'"></label>'+
   '<label class="f">Ditutup<input type="datetime-local" data-rgf="s" data-i="'+i+'" value="'+bsDtv(r.s)+'"></label></div>'+
   '<p class="note"><b class="mono">'+r.sis.length+'</b>'+(+r.kap>0?' dari '+(+r.kap):'')+' siswa'+(r.sis.length?' · '+e(rgKomp(r)):'')+'</p>'+(+r.kap>0&&r.sis.length>+r.kap?'<p class="note" style="color:var(--bad,#c0392b)">Melebihi kapasitas '+(r.sis.length-r.kap)+' siswa. Pindahkan sebelum menyimpan.</p>':'')+'</div>';
 });
 if(!pk.length&&R.length)h+='<p class="note">Belum ada akun berperan Proktor. Buat di menu Akun, lalu beri label proktor di Appwrite (docs-PENGAWAS.md).</p>';
 h+='<label class="f">Cara bagi otomatis<select data-rgf="mode"><option value="rata"'+((f.rgMode||'rata')==='rata'?' selected':'')+'>Rata, rombel berurutan</option><option value="penuh"'+(f.rgMode==='penuh'?' selected':'')+'>Isi satu per satu sampai penuh</option><option value="campur"'+(f.rgMode==='campur'?' selected':'')+'>Bergilir, rombel dicampur</option></select></label>';
 h+='<div class="btn-grid"><button type="button" class="btn small" data-rg="add">Tambah ruang</button>'+
  '<button type="button" class="btn small primary" data-rg="auto"'+(R.length?'':' disabled')+'>Bagi otomatis</button>'+
  '<button type="button" class="btn small" data-rg="man"'+(R.length?'':' disabled')+'>'+(f.rgMan?'Tutup manual':'Atur manual')+'</button>'+
  '<button type="button" class="btn small" data-rg="clear"'+(R.length?'':' disabled')+'>Kosongkan</button></div>';
 if(R.length)h+='<p class="note">Siswa terdaftar <b class="mono">'+ros.length+'</b> · belum ditempatkan <b class="mono" style="'+(belum?'color:var(--bad,#c0392b)':'')+'">'+belum+'</b>'+(belum?' (tidak bisa mulai ujian)':'')+'</p>';
 if(f.rgMan&&R.length)h+='<div id="rg-man">'+man(f)+'</div>';
 return h;
}
function man(f){
 var q=String(f.rgQ||'').toLowerCase().trim(),R=f.ruang,ros=rgRoster(f).filter(function(u){return !q||String(u.nama).toLowerCase().indexOf(q)>-1||String(u.kelas||'').toLowerCase().indexOf(q)>-1});
 var lm=40,h='<label class="f">Cari siswa<input data-rgf="q" type="search" value="'+e(f.rgQ||'')+'" placeholder="Nama atau kelas"></label><div id="rg-rows">';
 h+=ros.slice(0,lm).map(function(u){
  var cur=rgOf(f,u.id);
  return '<div class="row sb"><span>'+e(u.nama)+' <small class="muted">'+e(u.kelas||'')+'</small></span><select data-rgf="sis" data-u="'+e(u.id)+'"><option value="">Belum</option>'+R.map(function(r){return '<option value="'+e(r.id)+'"'+(cur&&cur.id===r.id?' selected':'')+'>'+e(r.nama||'Ruang')+'</option>'}).join('')+'</select></div>';
 }).join('');
 return h+'</div>'+(ros.length>lm?'<p class="note">Menampilkan '+lm+' dari '+ros.length+'. Persempit dengan pencarian.</p>':'');
}
/* ---------- Daftar peserta tetap ---------- */
function pesN(f){return f.pes.filter(Boolean).length}
function nomorBox(f){
 var n=f.nomor,h='<label class="bs-ck"><input type="checkbox" data-rgf="nomor-on"'+(n?' checked':'')+'> Beri nomor peserta</label>';
 if(n){
  var ct=rgNomor({nomor:n,pes:[1]},1);
  h+='<div class="two"><label class="f">Awalan<input data-rgf="nomor-p" value="'+e(n.p||'')+'" maxlength="16" placeholder="26-TSM-"></label><label class="f">Digit<input data-rgf="nomor-d" type="number" inputmode="numeric" min="2" max="5" value="'+(n.d||3)+'"></label></div>'+
   '<label class="f">Mulai dari<input data-rgf="nomor-a" type="number" inputmode="numeric" min="0" value="'+(n.a||1)+'"></label>'+
   '<p class="note" id="nomor-ct">Contoh nomor pertama: <b class="mono">'+e(ct)+'</b>. Nomor mengikuti urutan di daftar tetap (kelas lalu nama saat dibekukan). Siswa susulan mendapat nomor berikutnya, dan siswa yang dikeluarkan meninggalkan nomor kosong supaya nomor lain tidak berubah.</p>';
 }
 return h;
}
window.rgRombel=function(f){
 if(window.AKD&&!AKD.loaded&&!AKD.loading&&window.akLoad&&!f.rmbMuat){f.rmbMuat=1;try{akLoad().then(function(){repaint()})}catch(x){}}
 var kl=bsKls(f);
 if(kl.length!==1)return '<p class="note">Pilih satu tingkat untuk memilih rombelnya. "Semua kelas" mengikutkan seluruh siswa sekolah ini.</p>';
 var L=rgRombelList(f),sel=f.rmb=(f.rmb||[]).filter(function(id){return L.some(function(k){return k.id===id})}),h='<div class="sf-rmb"><span class="label">Rombel kelas '+e(kl[0])+'</span>';
 if(!L.length)return h+'<p class="note">Belum ada rombel kelas '+e(kl[0])+' di sekolah ini (buat di Administrasi Akademik). Semua siswa kelas '+e(kl[0])+' ikut.</p></div>';
 h+='<p class="note">Centang rombel yang ikut. Tanpa centang, semua siswa kelas '+e(kl[0])+' ikut.</p><div class="sf-rl">';
 h+=L.map(function(k){var n=(k.anggota||[]).filter(function(id){var u=S.users.filter(function(x){return x.id===id})[0];return u&&hasRole(u,'siswa')&&u.aktif!==false}).length;return '<label class="bs-ck"><input type="checkbox" data-rgf="rmb" data-k="'+e(k.id)+'"'+(sel.indexOf(k.id)>-1?' checked':'')+'> '+e(k.nama)+' <small class="muted">'+n+' siswa</small></label>'}).join('')+'</div>';
 h+='<div class="btn-grid"><button type="button" class="btn small" data-rg="rmbsemua">Semua rombel</button><button type="button" class="btn small" data-rg="rmbkosong"'+(sel.length?'':' disabled')+'>Kosongkan</button></div>';
 if(sel.length)h+='<p class="note"><b class="mono">'+sel.length+'</b> rombel terpilih · <b class="mono">'+(Array.isArray(f.pes)?f.pes.length:0)+'</b> siswa</p>';
 return h+'</div>';
};
/* daftar peserta mengikuti rombel terpilih (daftar tetap); tanpa rombel terpilih, kembali dihitung dari tingkat */
window.rgSinkronRombel=function(f){
 var R=f.ruang=f.ruang||[],L=rgRombelList(f);
 f.rmb=(f.rmb||[]).filter(function(id){return L.some(function(k){return k.id===id})});   /* rombel tingkat lain atau yang sudah dihapus tidak ikut */
 if(f.rmb.length){
  f.pes=rgDariRombel(f).map(function(u){return u.id});f.pesTs=Date.now();f.pesRmb=1;
  var ok={};f.pes.forEach(function(x){ok[x]=1});R.forEach(function(r){r.sis=r.sis.filter(function(x){return ok[x]})});
 }else if(f.pesRmb){f.pes=null;f.pesTs=0;f.pesMan=false;f.pesRmb=0}
};
/* ganti tingkat: rombel tingkat lama dilepas, daftar yang berasal dari rombel ikut dilepas */
window.rgGantiTingkat=function(f){
 var ada=f.rmb&&f.rmb.length;f.rmb=[];
 if(f.pesRmb||ada){f.pes=null;f.pesTs=0;f.pesMan=false;f.pesRmb=0}
 (f.ruang||[]).forEach(function(r){r.sis=[]});
};
function pesInner(f){
 var tetap=Array.isArray(f.pes),din=rgDinamis(f),h='';
 if(!tetap){
  return '<p class="note"><b class="mono">'+din.length+'</b> siswa, dihitung dari kelas dan sekolah. Bekukan daftar agar tidak berubah bila ada siswa pindah kelas.</p>'+
   '<div class="btn-grid"><button type="button" class="btn small primary" data-rg="beku">Bekukan daftar sekarang</button></div>';
 }
 var ada={};f.pes.forEach(function(x){ada[x]=1});var dd={};din.forEach(function(u){dd[u.id]=1});
 var baru=din.filter(function(u){return !ada[u.id]}).length,hilang=f.pes.filter(function(x){return x&&!dd[x]}).length;
 h+='<p class="note">Daftar tetap: <b class="mono">'+pesN(f)+'</b> siswa, dibekukan '+(f.pesTs?bsWaktu(f.pesTs):'')+'. Dibanding kelas sekarang: '+baru+' siswa baru di kelas, '+hilang+' tidak lagi cocok dengan kelas/sekolah. Hanya siswa di daftar yang bisa mulai ujian.</p>';
 h+='<div class="row"><button type="button" class="btn small" data-rg="pesman">'+(f.pesMan?'Tutup kelola daftar':'Tambah atau keluarkan siswa')+'</button><button type="button" class="btn small" data-rg="segar">Perbarui dari kelas</button><button type="button" class="btn small danger" data-rg="lepas">Lepas pembekuan</button></div>';
 if(f.pesMan)h+='<div id="pes-man">'+pesMan(f)+'</div>';
 return h+nomorBox(f);
}
function pesMan(f){
 var q=String(f.pesQ||'').toLowerCase().trim(),ada={};f.pes.forEach(function(x){ada[x]=1});
 var src=q?S.users.filter(function(u){return hasRole(u,'siswa')&&(String(u.nama).toLowerCase().indexOf(q)>-1||String(u.kelas||'').toLowerCase().indexOf(q)>-1)}):S.users.filter(function(u){return ada[u.id]});
 src=src.slice().sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
 var lm=40,h='<label class="f">Cari siswa (semua kelas)<input data-rgf="pesq" type="search" value="'+e(f.pesQ||'')+'" placeholder="Nama atau kelas, untuk menambah siswa susulan"></label><div>';
 h+=src.slice(0,lm).map(function(u){return '<label class="bs-ck"><input type="checkbox" data-rgf="pes" data-u="'+e(u.id)+'"'+(ada[u.id]?' checked':'')+'> '+e(u.nama)+' <small class="muted">'+e(u.kelas||'')+'</small></label>'}).join('');
 return h+'</div>'+(src.length>lm?'<p class="note">Menampilkan '+lm+' dari '+src.length+'. Persempit dengan pencarian.</p>':(q?'':'<p class="note">Daftar siswa di sesi ini. Ketik nama untuk mencari siswa lain.</p>'));
}
window.rgForm=function(f){return '<div class="card" style="background:var(--bg)"><b>Daftar peserta</b><div id="pes-box">'+pesInner(f)+'</div></div><div class="card" style="background:var(--bg)"><b>Ruang dan gelombang</b><div id="rg-box">'+inner(f)+'</div></div>'};
function repaint(){var f=F(),rb=document.getElementById('rmb-box');if(f&&rb)rb.innerHTML=rgRombel(f);var b=document.getElementById('rg-box');if(f&&b)b.innerHTML=inner(f);var c=document.getElementById('pes-box');if(f&&c)c.innerHTML=pesInner(f)}

function baru(f){
 var n=(f.ruang||[]).length+1,id='r'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);
 return {id:id,nama:'Ruang '+n,gel:'1',pk:'',m:0,s:0,sis:[]};
}
document.addEventListener('click',async function(ev){
 var b=ev.target.closest&&ev.target.closest('[data-rg]');if(!b)return;
 var f=F();if(!f)return;
 var a=b.dataset.rg,R=f.ruang=f.ruang||[],i=+b.dataset.i;
 ev.preventDefault();
 if(a==='beku'){f.pes=rgDinamis(f).map(function(u){return u.id});f.pesTs=Date.now();repaint();toast('Daftar dibekukan: '+f.pes.length+' siswa. Simpan sesi untuk menyimpannya.')}
 else if(a==='segar'){
  if(!(await uiConfirm('Ganti daftar tetap dengan daftar kelas saat ini? Nomor peserta ikut dihitung ulang. Siswa susulan yang ditambah manual hilang, dan siswa yang sudah ditempatkan di ruang tapi tidak lagi di daftar dikeluarkan dari ruang.',{ok:'Perbarui'})))return;
  f.pes=(f.rmb&&f.rmb.length?rgDariRombel(f):rgDinamis(f)).map(function(u){return u.id});f.pesTs=Date.now();var ok={};f.pes.forEach(function(x){ok[x]=1});R.forEach(function(r){r.sis=r.sis.filter(function(x){return ok[x]})});repaint();
 }else if(a==='lepas'){
  if(!(await uiConfirm('Lepas pembekuan? Daftar peserta kembali dihitung dari kelas dan sekolah.',{ok:'Lepas'})))return;
  f.pes=null;f.pesTs=0;f.pesMan=false;f.rmb=[];f.pesRmb=0;repaint();
 }else if(a==='pesman'){f.pesMan=!f.pesMan;repaint()}
 else if(a==='rmbsemua'||a==='rmbkosong'){
  var tr=rgRombelList(f);
  if(a==='rmbkosong'&&f.ruang&&f.ruang.some(function(r){return r.sis.length})&&!(await uiConfirm('Daftar peserta kembali dihitung dari seluruh tingkat. Penempatan siswa di ruang dikosongkan?',{ok:'Lanjutkan'})))return;
  f.rmb=a==='rmbsemua'?tr.map(function(k){return k.id}):[];
  rgSinkronRombel(f);repaint();
  if(a==='rmbsemua'){if(!f.pes||!f.pes.length)toast('Rombel terpilih belum punya siswa aktif');else toast('Daftar peserta: '+f.pes.length+' siswa dari '+f.rmb.length+' rombel')}
 }
 else if(a==='add'){R.push(baru(f));repaint()}
 else if(a==='del'){
  var r=R[i];if(!r)return;
  if(r.sis.length&&!(await uiConfirm('Hapus '+r.nama+'? '+r.sis.length+' siswa di dalamnya menjadi belum ditempatkan.',{ok:'Hapus',danger:true})))return;
  R.splice(i,1);repaint();
 }else if(a==='auto'){
  var ros=rgRoster(f);if(!R.length||!ros.length){toast('Belum ada ruang atau siswa');return}
  var ada=R.some(function(r){return r.sis.length});
  if(ada&&!(await uiConfirm('Penempatan yang sudah ada diganti. Lanjutkan?',{ok:'Bagi ulang'})))return;
  var hb=rgBagi(ros,R,f.rgMode||'rata');
  R.forEach(function(r,k){r.sis=hb.per[k]});
  repaint();toast(hb.sisa.length?hb.sisa.length+' siswa belum muat. Tambah kapasitas atau ruang.':'Siswa dibagi ke '+R.length+' ruang');
 }else if(a==='man'){f.rgMan=!f.rgMan;repaint()}
 else if(a==='clear'){
  if(!(await uiConfirm('Kosongkan penempatan semua siswa? Ruang tetap ada.',{ok:'Kosongkan',danger:true})))return;
  R.forEach(function(r){r.sis=[]});repaint();
 }
});
function ubah(ev){
 var t=ev.target;if(!t||!t.dataset||!t.dataset.rgf)return;
 var f=F();if(!f)return;
 var k=t.dataset.rgf,R=f.ruang=f.ruang||[],r=R[+t.dataset.i];
 if(k==='nama'&&r)r.nama=t.value;
 else if(k==='gel'&&r)r.gel=t.value.trim();
 else if(k==='kap'&&r){r.kap=Math.max(0,Math.min(999,parseInt(t.value,10)||0));if(ev.type==='change')repaint();return}
 else if(k==='mode'){f.rgMode=t.value;return}
 else if(k==='pk'&&r)r.pk=t.value;
 else if(k==='m'&&r)r.m=ts(t.value);
 else if(k==='s'&&r)r.s=ts(t.value);
 else if(k==='q'){f.rgQ=t.value;var b=document.getElementById('rg-man');if(b)b.innerHTML=man(f);var q=document.querySelector('[data-rgf="q"]');if(q){q.focus();try{q.setSelectionRange(q.value.length,q.value.length)}catch(x){}}return}
 else if(k==='pesq'){f.pesQ=t.value;var pm=document.getElementById('pes-man');if(pm){pm.innerHTML=pesMan(f);var q2=document.querySelector('[data-rgf="pesq"]');if(q2){q2.focus();try{q2.setSelectionRange(q2.value.length,q2.value.length)}catch(x){}}}return}
 else if(k==='nomor-on'){f.nomor=t.checked?(f.nomor||{p:'',d:3,a:1}):null;repaint();return}
 else if(k==='nomor-p'||k==='nomor-d'||k==='nomor-a'){
  f.nomor=f.nomor||{p:'',d:3,a:1};
  if(k==='nomor-p')f.nomor.p=t.value.replace(/[^A-Za-z0-9\-\/.]/g,'').slice(0,16);else if(k==='nomor-d')f.nomor.d=Math.max(2,Math.min(5,+t.value||3));else f.nomor.a=Math.max(0,+t.value||1);
  var ctn=document.getElementById('nomor-ct');if(ctn)ctn.innerHTML='Contoh nomor pertama: <b class="mono">'+e(rgNomor({nomor:f.nomor,pes:[1]},1))+'</b>. Nomor mengikuti urutan di daftar tetap.';return;
 }
 else if(k==='rmb'){var kid=t.dataset.k,rx=f.rmb=f.rmb||[],ix=rx.indexOf(kid);if(t.checked&&ix<0)rx.push(kid);else if(!t.checked&&ix>-1)rx.splice(ix,1);if(ev.type==='change'){rgSinkronRombel(f);repaint()}return}
 else if(k==='pes'){
  var u2=t.dataset.u,in2=f.pes.indexOf(u2)>-1;
  if(t.checked&&!in2)f.pes.push(u2);
  else if(!t.checked&&in2){if(f.nomor)f.pes[f.pes.indexOf(u2)]='';else f.pes=f.pes.filter(function(x){return x!==u2});R.forEach(function(x){x.sis=x.sis.filter(function(id){return id!==u2})})}
  var pb=document.getElementById('pes-box');
  if(pb){var ps=pb.querySelector('p.note');if(ps)ps.innerHTML='Daftar tetap: <b class="mono">'+pesN(f)+'</b> siswa';}
  return;
 }
 else if(k==='sis'){
  R.forEach(function(x){x.sis=x.sis.filter(function(id){return id!==t.dataset.u})});
  var tj=R.filter(function(x){return x.id===t.value})[0];if(tj)tj.sis.push(t.dataset.u);
 }
 if(ev.type==='change'&&(k==='nama'||k==='sis'))repaint();
}
document.addEventListener('input',ubah);
document.addEventListener('change',ubah);

/* ---------- Pantau: pilihan ruang ---------- */
window.rgPilih=function(s,cur){
 var l=rgList(s);if(!l.length)return '';
 return '<label class="f">Ruang<select data-bs="pn-rg"><option value="">Semua ruang</option>'+l.map(function(r){return '<option value="'+e(r.id)+'"'+(cur===r.id?' selected':'')+'>'+e(rgLabel(r))+' ('+r.sis.length+')</option>'}).join('')+'<option value="-"'+(cur==='-'?' selected':'')+'>Belum ditempatkan</option></select></label>';
};
window.rgSaring=function(s,rows,cur){
 if(!cur||!rgList(s).length)return rows;
 return rows.filter(function(r){var g=rgOf(s,r.u.id);return cur==='-'?!g:(g&&g.id===cur)});
};
window.rgPkNama=pkNama;
window.rgBeku=function(s){
 if(Array.isArray(s.pes))return '<p class="note">Daftar peserta tetap: <b class="mono">'+s.pes.length+'</b> siswa'+(s.pesTs?', dibekukan '+bsWaktu(s.pesTs):'')+'.</p>';
 return '<div class="card"><p class="note">Daftar peserta masih dihitung dari kelas, jadi bisa berubah bila akun diubah. Bekukan sebelum ujian berjalan.</p><button type="button" class="btn small" data-bs="pn-beku" data-v="'+e(s.id)+'">Bekukan daftar peserta</button></div>';
};
})();
