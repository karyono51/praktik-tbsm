/* Ruang dan gelombang ujian (guru/admin).
   Data ada di payload sesi: ruang: [{id, nama, gel, pk (id akun proktor), m, s (jadwal ruang, kosong = jadwal sesi), sis: [id akun siswa]}].
   Yang dipakai: formulir sesi (bagian "Ruang dan gelombang"), Pantau, kartu peserta, dan daftar hadir per ruang.
   Penegakan (siswa harus punya ruang, jadwal per gelombang, proktor hanya untuk ruangnya) dikerjakan fungsi server cbt. */
(function(){
'use strict';
function e(v){return window.esc?esc(v):String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function F(){return window.BS&&BS.sf}
function ts(v){return v?new Date(v).getTime()||0:0}

window.rgList=function(s){return s&&Array.isArray(s.ruang)?s.ruang.filter(function(r){return r&&Array.isArray(r.sis)}):[]};
window.rgOf=function(s,uid){var l=rgList(s);for(var i=0;i<l.length;i++)if(l[i].sis.indexOf(uid)>-1)return l[i];return null};
/* siswa terdaftar untuk sesi (kelas dan sekolah) */
window.rgRoster=function(s){
 if(Array.isArray(s.pes)){   /* daftar tetap: persis siswa di daftar, urut kelas lalu nama */
  var ps={};s.pes.forEach(function(x){ps[x]=1});
  return S.users.filter(function(u){return ps[u.id]}).sort(function(a,b){return String(a.kelas||'').localeCompare(String(b.kelas||''),'id')||String(a.nama).localeCompare(String(b.nama),'id')});
 }
 return rgDinamis(s);
};
window.rgDinamis=function(s){
 return S.users.filter(function(u){
  if(!hasRole(u,'siswa')||u.aktif===false)return false;
  if(s.kelas&&s.kelas!=='ALL'&&u.kelas!==s.kelas)return false;
  var sk=String(s.sekolah||'').toUpperCase(),uk=String(u.sekolah||'').toUpperCase();
  return !(sk&&uk&&uk!=='ALL'&&sk!==uk);
 }).sort(function(a,b){return String(a.kelas||'').localeCompare(String(b.kelas||''),'id')||String(a.nama).localeCompare(String(b.nama),'id')});
};
window.rgLabel=function(r){return r?String(r.nama||'Ruang')+(r.gel?' · gelombang '+r.gel:''):''};
function pkNama(id){var u=S.users.filter(function(x){return x.id===id})[0];return u?u.nama:''}
/* jadwal efektif siswa: ruang menimpa jadwal sesi */
window.rgJadwal=function(s,r){
 var m=(r&&r.m)||s.mulai||0,x=(r&&r.s)||s.selesai||0;
 return (m?bsWaktu(m):'Sesuai jadwal guru')+(x?' sampai '+bsWaktu(x):'');
};
window.rgPak=function(l){
 return (l||[]).map(function(r){var o={id:r.id,nama:String(r.nama||'').slice(0,40),sis:r.sis.slice()};if(r.gel)o.gel=String(r.gel).slice(0,12);if(r.pk)o.pk=r.pk;if(r.m)o.m=r.m;if(r.s)o.s=r.s;return o});
};
/* pemeriksaan saat sesi disimpan: pesan galat, atau '' bila aman */
window.rgCek=function(f){
 var l=f.ruang||[],nm={};if(!l.length)return '';
 for(var i=0;i<l.length;i++){
  var n=String(l[i].nama||'').trim().toLowerCase();
  if(!n)return 'Ruang '+(i+1)+' belum diberi nama';
  if(nm[n])return 'Nama ruang "'+l[i].nama+'" dipakai dua kali';nm[n]=1;
  if(l[i].m&&l[i].s&&l[i].s<=l[i].m)return 'Ruang "'+l[i].nama+'": waktu tutup harus setelah waktu buka';
 }
 if(JSON.stringify(rgPak(l)).length+JSON.stringify(f.ids||[]).length+JSON.stringify(f.pes||[]).length>17000)return 'Penempatan terlalu besar untuk satu sesi. Bagi siswa ke beberapa sesi (misalnya per kelas)';
 return '';
};
window.rgBelum=function(f){
 var ass={};(f.ruang||[]).forEach(function(r){r.sis.forEach(function(x){ass[x]=1})});
 return (f.ruang&&f.ruang.length)?rgRoster(f).filter(function(u){return !ass[u.id]}).length:0;
};

/* ---------- Formulir ---------- */
function inner(f){
 var R=f.ruang=f.ruang||[],ros=rgRoster(f),pk=S.users.filter(function(u){return hasRole(u,'proktor')&&u.aktif!==false});
 var belum=rgBelum(f),h='';
 h+='<p class="note">Bagi siswa ke ruang. Tiap ruang bisa punya proktor sendiri dan jadwal sendiri (gelombang). Bila ada ruang, hanya siswa yang ditempatkan yang bisa mulai, dan proktor hanya mengawasi ruangnya. Tanpa ruang, sesi berjalan seperti biasa.</p>';
 R.forEach(function(r,i){
  h+='<div class="card"><div class="row sb"><b>Ruang '+(i+1)+'</b><button type="button" class="btn small danger" data-rg="del" data-i="'+i+'">Hapus</button></div>'+
   '<div class="two"><label class="f">Nama ruang<input data-rgf="nama" data-i="'+i+'" value="'+e(r.nama)+'" maxlength="40" placeholder="Lab TSM 1"></label>'+
   '<label class="f">Gelombang<input data-rgf="gel" data-i="'+i+'" value="'+e(r.gel||'')+'" maxlength="12" placeholder="1"></label></div>'+
   '<label class="f">Proktor<select data-rgf="pk" data-i="'+i+'"><option value="">Belum ditentukan</option>'+pk.map(function(u){return '<option value="'+e(u.id)+'"'+(u.id===r.pk?' selected':'')+'>'+e(u.nama)+'</option>'}).join('')+'</select></label>'+
   '<div class="two"><label class="f">Dibuka (kosong = jadwal sesi)<input type="datetime-local" data-rgf="m" data-i="'+i+'" value="'+bsDtv(r.m)+'"></label>'+
   '<label class="f">Ditutup<input type="datetime-local" data-rgf="s" data-i="'+i+'" value="'+bsDtv(r.s)+'"></label></div>'+
   '<p class="note"><b class="mono">'+r.sis.length+'</b> siswa</p></div>';
 });
 if(!pk.length&&R.length)h+='<p class="note">Belum ada akun berperan Proktor. Buat di menu Akun, lalu beri label proktor di Appwrite (docs-PENGAWAS.md).</p>';
 h+='<div class="row"><button type="button" class="btn small" data-rg="add">Tambah ruang</button>'+
  '<button type="button" class="btn small primary" data-rg="auto"'+(R.length?'':' disabled')+'>Bagi otomatis</button>'+
  '<button type="button" class="btn small" data-rg="man"'+(R.length?'':' disabled')+'>'+(f.rgMan?'Tutup penempatan manual':'Tempatkan manual')+'</button>'+
  '<button type="button" class="btn small" data-rg="clear"'+(R.length?'':' disabled')+'>Kosongkan penempatan</button></div>';
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
function pesInner(f){
 var tetap=Array.isArray(f.pes),din=rgDinamis(f),h='';
 if(!tetap){
  return '<p class="note">Daftar peserta dihitung dari kelas dan sekolah setiap kali dibuka: <b class="mono">'+din.length+'</b> siswa saat ini. Siswa yang pindah kelas atau akunnya diubah setelah ujian dijadwalkan mengubah daftar hadir dan rekap. Bekukan daftar agar tetap.</p>'+
   '<div class="row"><button type="button" class="btn small primary" data-rg="beku">Bekukan daftar sekarang</button></div>';
 }
 var ada={};f.pes.forEach(function(x){ada[x]=1});var dd={};din.forEach(function(u){dd[u.id]=1});
 var baru=din.filter(function(u){return !ada[u.id]}).length,hilang=f.pes.filter(function(x){return !dd[x]}).length;
 h+='<p class="note">Daftar tetap: <b class="mono">'+f.pes.length+'</b> siswa, dibekukan '+(f.pesTs?bsWaktu(f.pesTs):'')+'. Dibanding kelas sekarang: '+baru+' siswa baru di kelas, '+hilang+' tidak lagi cocok dengan kelas/sekolah. Hanya siswa di daftar yang bisa mulai ujian.</p>';
 h+='<div class="row"><button type="button" class="btn small" data-rg="pesman">'+(f.pesMan?'Tutup kelola daftar':'Tambah atau keluarkan siswa')+'</button><button type="button" class="btn small" data-rg="segar">Perbarui dari kelas</button><button type="button" class="btn small danger" data-rg="lepas">Lepas pembekuan</button></div>';
 if(f.pesMan)h+='<div id="pes-man">'+pesMan(f)+'</div>';
 return h;
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
function repaint(){var f=F(),b=document.getElementById('rg-box');if(f&&b)b.innerHTML=inner(f);var c=document.getElementById('pes-box');if(f&&c)c.innerHTML=pesInner(f)}

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
  if(!(await uiConfirm('Ganti daftar tetap dengan daftar kelas saat ini? Siswa susulan yang ditambah manual hilang, dan siswa yang sudah ditempatkan di ruang tapi tidak lagi di daftar dikeluarkan dari ruang.',{ok:'Perbarui'})))return;
  f.pes=rgDinamis(f).map(function(u){return u.id});f.pesTs=Date.now();var ok={};f.pes.forEach(function(x){ok[x]=1});R.forEach(function(r){r.sis=r.sis.filter(function(x){return ok[x]})});repaint();
 }else if(a==='lepas'){
  if(!(await uiConfirm('Lepas pembekuan? Daftar peserta kembali dihitung dari kelas dan sekolah.',{ok:'Lepas'})))return;
  f.pes=null;f.pesTs=0;f.pesMan=false;repaint();
 }else if(a==='pesman'){f.pesMan=!f.pesMan;repaint()}
 else if(a==='add'){R.push(baru(f));repaint()}
 else if(a==='del'){
  var r=R[i];if(!r)return;
  if(r.sis.length&&!(await uiConfirm('Hapus '+r.nama+'? '+r.sis.length+' siswa di dalamnya menjadi belum ditempatkan.',{ok:'Hapus',danger:true})))return;
  R.splice(i,1);repaint();
 }else if(a==='auto'){
  var ros=rgRoster(f);if(!R.length||!ros.length){toast('Belum ada ruang atau siswa');return}
  var ada=R.some(function(r){return r.sis.length});
  if(ada&&!(await uiConfirm('Penempatan yang sudah ada diganti. Lanjutkan?',{ok:'Bagi ulang'})))return;
  R.forEach(function(r){r.sis=[]});
  ros.forEach(function(u,k){R[k%R.length].sis.push(u.id)});   /* bergilir: tiap ruang berisi campuran kelas */
  repaint();toast('Siswa dibagi rata ke '+R.length+' ruang');
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
 else if(k==='pk'&&r)r.pk=t.value;
 else if(k==='m'&&r)r.m=ts(t.value);
 else if(k==='s'&&r)r.s=ts(t.value);
 else if(k==='q'){f.rgQ=t.value;var b=document.getElementById('rg-man');if(b)b.innerHTML=man(f);var q=document.querySelector('[data-rgf="q"]');if(q){q.focus();try{q.setSelectionRange(q.value.length,q.value.length)}catch(x){}}return}
 else if(k==='pesq'){f.pesQ=t.value;var pm=document.getElementById('pes-man');if(pm){pm.innerHTML=pesMan(f);var q2=document.querySelector('[data-rgf="pesq"]');if(q2){q2.focus();try{q2.setSelectionRange(q2.value.length,q2.value.length)}catch(x){}}}return}
 else if(k==='pes'){
  var u2=t.dataset.u,in2=f.pes.indexOf(u2)>-1;
  if(t.checked&&!in2)f.pes.push(u2);
  else if(!t.checked&&in2){f.pes=f.pes.filter(function(x){return x!==u2});R.forEach(function(x){x.sis=x.sis.filter(function(id){return id!==u2})})}
  var pb=document.getElementById('pes-box');
  if(pb){var ps=pb.querySelector('p.note');if(ps)ps.innerHTML='Daftar tetap: <b class="mono">'+f.pes.length+'</b> siswa';}
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
