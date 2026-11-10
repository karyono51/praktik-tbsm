/* ui.js: tampilan utama, login, rekap, manajemen akun */
var A={q:'',peran:'ALL',edit:null,imp:null,impn:null,reg:false,err:''};
function opt(arr,sel,lab){return arr.map(function(v){return '<option value="'+v+'"'+(v===sel?' selected':'')+'>'+(lab?lab(v):v)+'</option>'}).join('')}

function render(){
 if(!S.user){$('#app').innerHTML=viewLogin();return}
 var u=S.user;
 var head='<header class="top"><div class="brandrow"><img class="logo" src="'+LOGO+'" alt="Logo SMK Medina"><div class="brand"><b>Uji Praktik TBSM</b><span>SMKS Medina Bandung</span></div></div>'+
  '<div class="who"><div class="whotxt"><b>'+esc(u.nama)+'</b><span class="pill">'+PERAN[u.peran]+'</span></div><button type="button" class="btn small" data-act="logout">Keluar</button></div></header>';
 var body;
 if(V.mode==='exam')body=viewExam();else if(V.mode==='result')body=viewResult();
 else if(S.tab==='rekap')body=viewRekap();else if(S.tab==='akun'&&can('akun'))body=viewAkun();else if(S.tab==='acuan')body=viewAcuan();else body=viewKatalog();
 var tabs=[['katalog','Unit ujian'],['rekap','Rekap nilai']].concat(can('akun')?[['akun','Akun']]:[],[['acuan','Acuan']]);
 var nav=V.mode==='list'?'<nav class="bar" aria-label="Menu utama"><div class="in">'+tabs.map(function(t){return '<button type="button" data-act="tab" data-v="'+t[0]+'"'+(S.tab===t[0]?' aria-current="page"':'')+'>'+t[1]+'</button>'}).join('')+'</div></nav>':'';
 var foot='<footer class="school"><img src="'+LOGO+'" alt=""><div><b>SMKS Medina Bandung</b><div class="note">Jl. K.H. Ahmad Dahlan No. 13–15, Kel. Burangrang, Kec. Lengkong, Kota Bandung, Jawa Barat 40262</div></div></footer>';
 $('#app').innerHTML=head+'<main class="stack">'+body+foot+'</main>'+nav;
}

function viewLogin(){
 var reg=Cloud.on&&A.reg;
 return '<div class="auth"><img class="logo big" src="'+LOGO+'" alt="Logo SMK Medina"><h1>Uji Praktik TBSM</h1><p class="muted">SMKS Medina Bandung</p>'+
 '<form class="card" data-form="'+(reg?'register':'login')+'">'+
 (reg?'<label class="f">Nama lengkap<input name="nama" required autocomplete="name"></label>':'')+
 '<label class="f">'+(Cloud.on?'Email':'Username atau email')+'<input name="id" '+(Cloud.on?'type="email" ':'')+'required autocomplete="username"></label>'+
 '<label class="f">Kata sandi<input name="pw" type="password" required minlength="'+(reg?8:1)+'" autocomplete="'+(reg?'new-password':'current-password')+'"></label>'+
 (A.err?'<p class="err" role="alert">'+esc(A.err)+'</p>':'')+
 '<button class="btn primary" type="submit">'+(reg?'Daftar':'Masuk')+'</button>'+
 (Cloud.on?'<button type="button" class="btn" data-act="google">Lanjut dengan Google</button><button type="button" class="link" data-act="togglereg">'+(reg?'Sudah punya akun? Masuk':'Belum punya akun? Daftar')+'</button>':'')+
 '</form>'+(Cloud.on?'':'<p class="note center">Mode lokal, data tersimpan di peramban ini. Akun awal: <b>admin</b> / <b>admin123</b>. Ganti sandinya di menu Akun.</p>')+'</div>';
}

function viewRekap(){
 var list=filt().sort(function(a,b){return b.ts-a.ts}),a=agg(list),n=a[0];
 var chips=['ALL','X','XI','XII'].map(function(c){return '<button type="button" data-act="filter" data-v="'+c+'" aria-pressed="'+(S.filter===c)+'">'+(c==='ALL'?'Semua':'Kelas '+c)+'</button>'}).join('');
 var rows=list.map(function(r){var j=jobById(r.jobId);
  return '<div class="card" style="gap:6px"><div class="row sb"><b>'+esc(r.siswa||'Tanpa nama')+'</b><span class="pill '+(r.kompeten?'ok':'bad')+'">'+(r.kompeten?'Kompeten':'Belum kompeten')+'</span></div>'+
  '<div class="note">'+esc(j?j.judul:r.jobId)+'</div><div class="row sb"><span class="note">Kelas '+r.kelas+' · '+r.tipe+' · '+tgl(r.ts)+(r.penilai?' · '+esc(r.penilai):'')+'</span><span class="mono" style="font-weight:600">'+r.score+'</span></div>'+
  (r.catatan?'<div class="note">'+esc(r.catatan)+'</div>':'')+'</div>'}).join('');
 return '<h2>Rekap nilai</h2><div class="chips" role="group" aria-label="Filter kelas">'+chips+'</div>'+
  '<div class="stats"><div class="card"><span class="label">Data</span><b class="mono">'+n+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+a[1]+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+Math.round(a[2]*100)+'%</b></div></div>'+
  '<div class="row"><button type="button" class="btn small" data-act="xlsrekap">Unduh Excel</button><button type="button" class="btn small primary" data-act="pdfrekap">Unduh PDF</button>'+(can('hapus')&&!Cloud.on?'<button type="button" class="btn small danger" data-act="rmall">Hapus semua</button>':'')+'</div>'+
  imporNilaiHtml()+
  (rows||'<div class="card"><p class="muted">Belum ada data untuk filter ini. Mulai dari tab Unit ujian.</p></div>')+
  '<p class="note">'+(Cloud.on?'Data tersinkron ke Appwrite.':'Data tersimpan di peramban ini. Unduh Excel atau PDF untuk arsip.')+'</p>';
}

function viewAkun(){
 var q=A.q.toLowerCase(),e=A.edit;
 var L=S.users.filter(function(u){return (A.peran==='ALL'||u.peran===A.peran)&&(!q||(u.nama+' '+u.username+' '+(u.email||'')).toLowerCase().indexOf(q)>-1)});
 var chips=['ALL','admin','guru','siswa'].map(function(c){return '<button type="button" data-act="akunfilter" data-v="'+c+'" aria-pressed="'+(A.peran===c)+'">'+(c==='ALL'?'Semua':PERAN[c])+' <span class="mono">'+(c==='ALL'?S.users.length:S.users.filter(function(u){return u.peran===c}).length)+'</span></button>'}).join('');
 var form=e?'<form class="card" data-form="akun"><h3>'+(e.id?'Ubah akun':'Akun baru')+'</h3>'+
  '<label class="f">Nama<input name="nama" required value="'+esc(e.nama)+'"></label>'+
  '<div class="two"><label class="f">Username<input name="username" value="'+esc(e.username)+'" placeholder="otomatis"></label><label class="f">Email<input name="email" type="email" value="'+esc(e.email)+'"'+(Cloud.on?' required':'')+'></label></div>'+
  '<div class="two"><label class="f">Peran<select name="peran">'+opt(['admin','guru','siswa'],e.peran,function(v){return PERAN[v]})+'</select></label><label class="f">Kelas (siswa)<select name="kelas">'+opt(KLS,e.kelas||'X')+'</select></label></div>'+
  (Cloud.on?'':'<label class="f">Sandi'+(e.id?' (kosongkan jika tidak diubah)':'')+'<input name="pw" type="password" autocomplete="new-password"'+(e.id?'':' required')+' minlength="6"></label>')+
  '<label class="chk"><input type="checkbox" name="aktif"'+(e.aktif!==false?' checked':'')+'> Akun aktif</label>'+
  (A.err?'<p class="err" role="alert">'+esc(A.err)+'</p>':'')+
  '<div class="row"><button type="button" class="btn" data-act="akuncancel">Batal</button><button type="submit" class="btn primary grow">Simpan akun</button></div></form>':'';
 var im='';
 if(A.imp){var nb=A.imp.ok.filter(function(r){return !r.id}).length;
  im='<div class="card"><h3>Pratinjau impor</h3><div class="row"><span class="pill ok">'+nb+' baru</span><span class="pill">'+(A.imp.ok.length-nb)+' diperbarui</span><span class="pill '+(A.imp.err.length?'bad':'plain')+'">'+A.imp.err.length+' ditolak</span></div>'+
  (A.imp.err.length?'<ul class="plain note">'+A.imp.err.slice(0,8).map(function(x){return '<li>Baris '+x.line+': '+esc(x.msg)+'</li>'}).join('')+(A.imp.err.length>8?'<li>dan '+(A.imp.err.length-8)+' lainnya</li>':'')+'</ul>':'')+
  '<div class="row"><button type="button" class="btn" data-act="impcancel">Batal</button><button type="button" class="btn primary grow" data-act="impapply"'+(A.imp.ok.length?'':' disabled')+'>Terapkan '+A.imp.ok.length+' akun</button></div></div>'}
 var rows=L.map(function(u){
  return '<div class="card user"><div class="row sb"><div class="grow"><b>'+esc(u.nama)+'</b><div class="note">'+esc(u.username)+(u.email?' · '+esc(u.email):'')+'</div></div><span class="pill '+(u.peran==='admin'?'warn':u.peran==='guru'?'':'plain')+'">'+PERAN[u.peran]+'</span></div>'+
  '<div class="row sb"><span class="note">'+(u.kelas?'Kelas '+u.kelas+' · ':'')+(u.aktif===false?'Nonaktif':'Aktif')+'</span><div class="row"><button type="button" class="btn small" data-act="akunedit" data-v="'+u.id+'">Ubah</button>'+(u.id!==S.user.id?'<button type="button" class="btn small danger" data-act="akundel" data-v="'+u.id+'">Hapus</button>':'')+'</div></div></div>'}).join('');
 return '<div class="row sb"><h2>Akun</h2><button type="button" class="btn small primary" data-act="akunnew">Tambah akun</button></div>'+
  '<div class="row"><label class="btn small filebtn">Impor Excel<input id="impfile" type="file" accept=".xlsx,.xls,.csv" hidden></label><button type="button" class="btn small" data-act="akuntpl">Template</button><button type="button" class="btn small" data-act="akunxls">Ekspor Excel</button></div>'+
  im+form+'<input id="akunq" type="search" placeholder="Cari nama, username, atau email" value="'+esc(A.q)+'" aria-label="Cari akun"><div class="chips" role="group" aria-label="Filter peran">'+chips+'</div>'+
  (rows||'<div class="card"><p class="muted">Tidak ada akun yang cocok.</p></div>')+
  '<p class="note">'+(Cloud.on?'Akun login dibuat pengguna lewat Daftar atau Google. Impor menyiapkan peran dan kelas berdasarkan email.':'Mode lokal: sandi disimpan sebagai hash di peramban ini.')+' Admin: kelola akun dan KKM. Guru: menilai dan melihat semua rekap. Siswa: latihan dan melihat nilai sendiri.</p>';
}

async function saveAkun(d){
 var e=A.edit,nama=(d.nama||'').trim(),em=(d.email||'').trim().toLowerCase(),un=(d.username||'').trim().toLowerCase().replace(/\s+/g,'')||(em?em.split('@')[0]:slug(nama));
 if(!nama)throw new Error('Nama wajib diisi.');
 if(Cloud.on&&!em)throw new Error('Email wajib diisi.');
 if(S.users.some(function(u){return u.id!==e.id&&(u.username===un||(em&&u.email===em))}))throw new Error('Username atau email sudah dipakai.');
 var o=e.id?S.users.find(function(u){return u.id===e.id}):{id:uid(),dibuat:Date.now()};
 if(o.id===S.user.id&&(d.peran!=='admin'||!d.aktif))throw new Error('Akun Anda sendiri tidak bisa diturunkan atau dinonaktifkan.');
 if(!Cloud.on&&d.pw&&d.pw.length<6)throw new Error('Sandi minimal 6 karakter.');
 Object.assign(o,{nama:nama,username:un,email:em,peran:d.peran,kelas:d.peran==='siswa'?d.kelas:'',aktif:!!d.aktif});
 if(!Cloud.on&&d.pw)await setPw(o,d.pw);
 if(e.id)o.d=1;else S.users.push(o);
 A.edit=null;persist();toast('Akun disimpan');
}

document.addEventListener('submit',async function(e){
 var f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
 var k=f.dataset.form,d=Object.fromEntries(new FormData(f));A.err='';
 try{
  if(k==='login'){
   if(Cloud.on){await Cloud.login(d.id.trim(),d.pw);await Cloud.enter(await Cloud.me())}
   else{var u=await localLogin(d.id.trim(),d.pw);if(!u)throw new Error('Username atau sandi salah.');localStorage.setItem(SES,u.id);enter(u)}
  }else if(k==='register'){await Cloud.register(d.nama.trim(),d.id.trim(),d.pw);await Cloud.enter(await Cloud.me())}
  else if(k==='akun')await saveAkun(d);
 }catch(err){A.err=err&&err.message?err.message:String(err)}
 render();
});
async function doLogout(){
 stopTimer();
 if(Cloud.on){await Cloud.logout();dropSnap();S.users=[];S.results=[]}else localStorage.removeItem(SES);
 S.user=null;A.edit=null;A.imp=null;A.impn=null;A.err='';resetV();render();
}
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a==='logout')await doLogout();
 else if(a==='google')Cloud.google();
 else if(a==='togglereg'){A.reg=!A.reg;A.err='';render()}
 else if(a==='akunnew'){A.edit={peran:'siswa',kelas:'X',aktif:true};A.err='';render()}
 else if(a==='akunedit'){A.edit=Object.assign({},S.users.find(function(u){return u.id===v}));A.err='';render()}
 else if(a==='akuncancel'){A.edit=null;A.err='';render()}
 else if(a==='akundel'){
  var u=S.users.find(function(x){return x.id===v});
  if(u.peran==='admin'&&S.users.filter(function(x){return x.peran==='admin'&&x.aktif!==false&&x.id!==v}).length<1){toast('Harus tersisa satu admin aktif');return}
  if(!confirm('Hapus akun '+u.nama+'? Data nilai tetap tersimpan.'))return;
  S.users=S.users.filter(function(x){return x.id!==v});Cloud.remove('akun',v);persist();render();toast('Akun dihapus');
 }
 else if(a==='akunfilter'){A.peran=v;render()}
 else if(a==='akuntpl')tplAkun();
 else if(a==='akunxls')xlsAkun();
 else if(a==='impapply'){await applyImport();render()}
 else if(a==='impcancel'){A.imp=null;render()}
 else if(a==='xlsrekap')xlsRekap();
 else if(a==='pdfrekap')pdfRekap();
 else if(a==='pdfone')pdfOne();
});
document.addEventListener('change',async function(e){
 if(e.target.id!=='impfile')return;
 var f=e.target.files[0];if(!f)return;
 try{A.imp=await parseAkun(f)}catch(err){A.imp=null;toast(err.message||'Gagal membaca file')}
 render();
});
document.addEventListener('input',function(e){
 if(e.target.id!=='akunq')return;
 A.q=e.target.value;render();var x=$('#akunq');x.focus();x.setSelectionRange(x.value.length,x.value.length);
});
var KLS=['X','XI','XII'];
