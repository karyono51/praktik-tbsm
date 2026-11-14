/* ui.js: tampilan utama, login, rekap, manajemen akun */
var A={q:'',peran:'ALL',edit:null,imp:null,impn:null,reg:false,err:''};
function opt(arr,sel,lab){return arr.map(function(v){return '<option value="'+v+'"'+(v===sel?' selected':'')+'>'+(lab?lab(v):v)+'</option>'}).join('')}

var ICO={
 beranda:'<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
 kelas:'<path d="M3 9.5 12 5l9 4.5-9 4.5zM7 12v4.5c1.4 1.3 3.2 2 5 2s3.6-.7 5-2V12"/>',
 rekap:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
 akun:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.3c1.9.8 3 2.7 3 5.7"/>',
 acuan:'<path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16z"/><path d="M5 16a3.5 3.5 0 0 1 3.5-3.5H19"/>',
 menu:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
 keluar:'<path d="M9 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H9M15 8l4 4-4 4M19 12H9"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
 chev:'<path d="m9 6 6 6-6 6"/>',
 swap:'<path d="M7 4 3.5 7.5 7 11M3.5 7.5H18M17 13l3.5 3.5L17 20M20.5 16.5H6"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.5-4.4L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.5 4.4L20 15.5M20 20v-4.5h-4.5"/>'
};
function svg(d,n){n=n||20;return '<svg viewBox="0 0 24 24" width="'+n+'" height="'+n+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>'}

function render(){
 if(!S.user){$('#app').innerHTML=viewLogin();return}
 var u=S.user,home=V.mode==='list'&&S.tab==='beranda',act=actRole(),multi=roleList(u).length>1;
 var logoBtn='<button type="button" class="logobtn" data-act="drawer" aria-label="Buka menu" aria-controls="drawer" aria-expanded="false"><img class="logo" src="'+LOGO+'" alt="Logo SMK Medina"></button>';
 var rolePill=multi?'<button type="button" class="pill glass role" data-act="switchrole" aria-label="Peran aktif '+PERAN[act]+'. Ketuk untuk berganti peran">'+PERAN[act]+svg(ICO.swap,14)+'</button>':'<span class="pill glass">'+PERAN[act]+'</span>';
 var kls=act==='siswa'&&u.kelas?'<span class="pill glass">Kelas '+esc(u.kelas)+'</span>':'';
 var who='<div class="hi"><p class="hello"><span>Halo,</span> <b>'+esc(String(u.nama).trim().split(/\s+/)[0])+'</b></p><p class="mail">'+esc(u.email||u.username||'')+'</p><div class="hmeta">'+rolePill+kls+'<button type="button" class="pill glass role" data-act="refresh" aria-label="Segarkan data">'+svg(ICO.refresh,14)+'Segarkan</button></div>'+(home?'':'<div class="netslot" id="netslot" hidden></div>')+'</div>';
 var moto='<svg class="moto" viewBox="0 0 170 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="66" r="19"/><circle cx="138" cy="66" r="19"/><circle cx="32" cy="66" r="5"/><circle cx="138" cy="66" r="5"/><path d="M32 66 56 42h40l14 24M96 42l12-22h16M108 20 138 66M60 42l-6-8h24M62 66h32l8-14"/></svg>';
 var head=home?
  '<header class="top big"><svg class="rings" viewBox="0 0 220 220" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="150" cy="70" r="30"/><circle cx="150" cy="70" r="60"/><circle cx="150" cy="70" r="90"/></svg>'+moto+
  '<div class="hrow">'+logoBtn+who+'</div><div class="netslot" id="netslot" hidden></div></header>':
  '<header class="top">'+logoBtn+who+'</header>';
 var body;
 if(V.mode==='exam')body=viewExam();else if(V.mode==='result')body=viewResult();
 else if(S.tab==='beranda')body=viewBeranda();else if(S.tab==='rekap')body=viewRekap();else if(S.tab==='akun'&&can('akun'))body=viewAkun();else if(S.tab==='acuan')body=viewAcuan();else if(S.tab==='lkpd')body=viewLKPD();else if((S.tab==='observasi'||S.tab==='observasi-siswa')&&can('observasi'))body=viewObservasi();else body=viewKatalog();
 var cur=V.mode==='list'?S.tab:'';
 var row=function(v,t,sub,ic,on,tone){return '<button type="button" class="srow'+(tone?' '+tone:'')+'" data-act="'+(v==='keluar'?'menulogout':v==='segarkan'?'refresh':v==='perbarui'?'updateapp':v==='gantisandi'?'mypw':'menu')+'" data-v="'+v+'"'+(on?' aria-current="page"':'')+'><span class="ico">'+svg(ICO[ic],22)+'</span><span class="st"><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span>'+svg(ICO.chev,18)+'</button>'};
 var kr=kelasBoleh().map(function(c){return row('lkpd:'+c,KELAS[c].judul,KELAS[c].sub,'kelas',cur==='lkpd'&&S.kelas===c)}).join('');
 var sh='<div class="scrim" data-act="drawerclose"></div><aside class="sheet" id="drawer" role="dialog" aria-modal="true" aria-label="Menu"><div class="grab" data-act="drawerclose" aria-hidden="true"><i></i></div><div class="sbody">'+
  '<div class="sbrand"><button type="button" class="logobtn" data-act="drawerclose" aria-label="Tutup menu"><img class="logo ring" src="'+LOGO+'" alt=""></button><b>SMKS Medina Bandung</b><address class="addr"><span>Jl. K.H. Ahmad Dahlan No. 13–15, Kel. Burangrang,</span><span>Kec. Lengkong, Kota Bandung, Jawa Barat 40262</span></address><span class="bar2"></span></div>'+
  '<div class="sprofile"><span class="av" aria-hidden="true">'+esc(String(u.nama).trim().charAt(0).toUpperCase())+'</span><div class="grow"><b>'+esc(u.nama)+'</b><div class="note">'+esc(u.email||u.username||'')+'</div></div>'+(multi?'<button type="button" class="pill role" data-act="switchrole" aria-label="Peran aktif '+PERAN[act]+'. Ketuk untuk berganti peran">'+PERAN[act]+svg(ICO.swap,14)+'</button>':'<span class="pill">'+PERAN[act]+'</span>')+'</div>'+
  row('beranda','Beranda','Ringkasan dan pintasan','beranda',cur==='beranda')+
  '<div class="chip">'+svg(ICO.kelas,16)+(kelasBoleh().length>1?'LKPD praktik':'LKPD praktik kelas saya')+'</div>'+kr+
  '<div class="chip">'+svg(ICO.menu,16)+'Lainnya</div>'+
  row('rekap','Rekap nilai','Nilai, ekspor Excel dan PDF','rekap',cur==='rekap')+
  (can('observasi')?row('observasi','Observasi guru','Supervisi pembelajaran','observasi',cur==='observasi')+row('observasi-siswa','Observasi praktik siswa','Pengamatan proses dan sikap kerja','observasi-siswa',cur==='observasi-siswa'):'')+
  '<div class="chip">'+svg(ICO.kelas,16)+(isStaff()?'UKK':'UKK kelas saya')+'</div>'+kelasBoleh().map(function(c){return row('kelas:'+c,'UKK '+KELAS[c].judul,isStaff()?'Kelola unit uji kompetensi':'Latihan uji kompetensi','kelas',cur==='katalog'&&S.kelas===c)}).join('')+
  (can('akun')?row('akun','Akun','Kelola akun, impor, dan KKM','akun',cur==='akun'):'')+
  row('acuan','Acuan','Rubrik dan standar penilaian','acuan',cur==='acuan')+
  '<div class="chip">'+svg(ICO.keluar,16)+'Sesi</div>'+row('gantisandi','Ganti sandi','Ubah sandi akun ini','akun',false)+row('segarkan','Segarkan data','Ambil data terbaru dari server','refresh',false)+row('perbarui','Perbarui aplikasi','<span id="appver">Cek pembaruan aplikasi</span>','refresh',false)+row('keluar','Keluar','Akhiri sesi di perangkat ini','keluar',false,'danger')+
  '</div></aside>';
 var foot='<footer class="school"><span>© 2026 SMKS Medina Bandung</span><i aria-hidden="true">|</i><span>supported by @pakar1501</span></footer>';
 var open=document.body.classList.contains('dr-open');
 $('#app').innerHTML=head+'<main class="stack'+(home?' home':'')+'">'+body+foot+'</main>'+sh;
 document.body.classList.toggle('has-bar',V.mode==='exam');
 if(open)document.querySelectorAll('[data-act="drawer"]').forEach(function(x){x.setAttribute('aria-expanded','true')});
 if(window.netbar)netbar();
 var cp=document.querySelector('.ptab[aria-current="true"]');if(cp&&cp.scrollIntoView)cp.scrollIntoView({inline:'center',block:'nearest'});
}

function viewLogin(){
 var reg=Cloud.on&&A.reg;
 return '<div class="auth"><img class="logo big" src="'+LOGO+'" alt="Logo SMK Medina"><h1>KBM Praktik TBSM</h1><p class="muted">SMKS Medina Bandung</p>'+
 '<form class="card" data-form="'+(reg?'register':'login')+'">'+
 (reg?'<label class="f">Nama lengkap<input name="nama" required autocomplete="name"></label>':'')+
 '<label class="f">'+(Cloud.on?'Email':'Username atau email')+'<input name="id" '+(Cloud.on?'type="email" ':'')+'required autocomplete="username"></label>'+
 '<label class="f">Kata sandi<input name="pw" type="password" required minlength="'+(reg?8:1)+'" autocomplete="'+(reg?'new-password':'current-password')+'"></label>'+
 (A.err?'<p class="err" role="alert">'+esc(A.err)+'</p>':'')+
 '<button class="btn primary" type="submit">'+(reg?'Daftar':'Masuk')+'</button>'+
 (Cloud.on?'<button type="button" class="link" data-act="togglereg">'+(reg?'Sudah punya akun? Masuk':'Belum punya akun? Daftar')+'</button>':'')+
 '</form>'+(Cloud.on?'':'<p class="note center">Mode lokal, data tersimpan di peramban ini. Akun awal: <b>admin</b> / <b>admin123</b>. Ganti sandinya di menu Akun.</p>')+'</div>';
}

function viewRekap(){
 var list=filt().sort(function(a,b){return b.ts-a.ts}),a=agg(list),n=a[0];
 var chips=['ALL','X','XI','XII'].map(function(c){return '<button type="button" data-act="filter" data-v="'+c+'" aria-pressed="'+(S.filter===c)+'">'+(c==='ALL'?'Semua':'Kelas '+c)+'</button>'}).join('');
 var rows=list.map(function(r){var j=jobById(r.jobId);
  return '<div class="card" style="gap:6px"><div class="row sb"><b>'+esc(r.siswa||'Tanpa nama')+'</b><span class="pill '+(r.kompeten?'ok':'bad')+'">'+(r.kompeten?'Kompeten':'Belum kompeten')+'</span></div>'+
  '<div class="note">'+esc(j?j.judul:r.jobId)+'</div><div class="row sb"><span class="note">Kelas '+r.kelas+' · '+jenisTampil(r)+' · '+tgl(r.ts)+(r.penilai?' · '+esc(r.penilai):'')+'</span><span class="mono" style="font-weight:600">'+r.score+'</span></div>'+
  (r.catatan?'<div class="note">'+esc(r.catatan)+'</div>':'')+'</div>'}).join('');
 return '<h2>Rekap nilai</h2><div class="chips" role="group" aria-label="Filter kelas">'+chips+'</div>'+
  '<div class="stats"><div class="card"><span class="label">Data</span><b class="mono">'+n+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+a[1]+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+Math.round(a[2]*100)+'%</b></div></div>'+
  '<div class="row"><button type="button" class="btn small" data-act="xlsrekap">Unduh Excel</button><button type="button" class="btn small primary" data-act="pdfrekap">Unduh PDF</button>'+(can('hapus')&&!Cloud.on?'<button type="button" class="btn small danger" data-act="rmall">Hapus semua</button>':'')+'</div>'+
  imporNilaiHtml()+
  (rows||(obsRekapList().length?'':'<div class="card"><p class="muted">Belum ada data untuk filter ini.</p></div>'))+obsRekapHtml()+
  '<p class="note">'+(Cloud.on?'Data tersinkron ke Appwrite.':'Data tersimpan di peramban ini. Unduh Excel atau PDF untuk arsip.')+'</p>';
}

function viewAkun(){
 var q=A.q.toLowerCase(),e=A.edit,nGanda=kelompokGanda().reduce(function(t,g){return t+g.hapus.length},0);
 var L=S.users.filter(function(u){return (A.peran==='ALL'||hasRole(u,A.peran))&&(!q||(u.nama+' '+u.username+' '+(u.email||'')).toLowerCase().indexOf(q)>-1)});
 var chips=['ALL','admin','guru','siswa'].map(function(c){return '<button type="button" data-act="akunfilter" data-v="'+c+'" aria-pressed="'+(A.peran===c)+'">'+(c==='ALL'?'Semua':PERAN[c])+' <span class="mono">'+(c==='ALL'?S.users.length:S.users.filter(function(u){return hasRole(u,c)}).length)+'</span></button>'}).join('');
 var form=e?'<form class="card" data-form="akun"><h3>'+(e.id?'Ubah akun':'Akun baru')+'</h3>'+
  '<label class="f">Nama<input name="nama" required value="'+esc(e.nama)+'"></label>'+
  '<div class="two"><label class="f">Username<input name="username" value="'+esc(e.username)+'" placeholder="otomatis"></label><label class="f">Email<input name="email" type="email" value="'+esc(e.email)+'"'+(Cloud.on?' required':'')+'></label></div>'+
  '<fieldset class="roles"><legend>Peran (boleh lebih dari satu)</legend>'+URUT.map(function(r){return '<label class="chk"><input type="checkbox" name="peran" value="'+r+'"'+(hasRole(e,r)?' checked':'')+'> '+PERAN[r]+'</label>'}).join('')+'</fieldset><label class="f">Kelas (jika siswa)<select name="kelas">'+opt(KLS,e.kelas||'X')+'</select></label>'+
  (Cloud.on?'<label class="f">Sandi login (opsional, minimal 8 karakter)'+(e.id?' · kosongkan jika tidak diubah':'')+'<input name="pw" type="password" autocomplete="new-password" minlength="8"></label><p class="note">Diisi: sandi diatur admin lewat fungsi server. Dikosongkan: pengguna membuat sandi sendiri lewat Daftar memakai email di atas.</p>':'<label class="f">Sandi'+(e.id?' (kosongkan jika tidak diubah)':'')+'<input name="pw" type="password" autocomplete="new-password"'+(e.id?'':' required')+' minlength="6"></label>')+
  '<label class="chk"><input type="checkbox" name="aktif"'+(e.aktif!==false?' checked':'')+'> Akun aktif</label>'+
  (A.err?'<p class="err" role="alert">'+esc(A.err)+'</p>':'')+
  '<div class="row"><button type="button" class="btn" data-act="akuncancel">Batal</button><button type="submit" class="btn primary grow">Simpan akun</button></div></form>':'';
 var im='';
 if(A.imp){var nb=A.imp.ok.filter(function(r){return !r.id}).length;
  im='<div class="card"><h3>Pratinjau impor</h3><div class="row"><span class="pill ok">'+nb+' baru</span><span class="pill">'+(A.imp.ok.length-nb)+' diperbarui</span><span class="pill '+(A.imp.err.length?'bad':'plain')+'">'+A.imp.err.length+' ditolak</span>'+(A.imp.skip?'<span class="pill plain">'+A.imp.skip+' sama, dilewati</span>':'')+'</div>'+
  (A.imp.err.length?'<ul class="plain note">'+A.imp.err.slice(0,8).map(function(x){return '<li>Baris '+x.line+': '+esc(x.msg)+'</li>'}).join('')+(A.imp.err.length>8?'<li>dan '+(A.imp.err.length-8)+' lainnya</li>':'')+'</ul>':'')+
  '<div class="row"><button type="button" class="btn" data-act="impcancel">Batal</button><button type="button" class="btn primary grow" data-act="impapply"'+(A.imp.ok.length&&!A.impBusy?'':' disabled')+'>Terapkan '+A.imp.ok.length+' akun</button></div></div>'}
 var rows=L.map(function(u){
  return '<div class="card user"><div class="row sb"><div class="grow"><b>'+esc(u.nama)+'</b><div class="note">'+esc(u.username)+(u.email?' · '+esc(u.email):'')+'</div></div><span class="pill '+(u.peran==='admin'?'warn':u.peran==='guru'?'':'plain')+'">'+PERAN[u.peran]+'</span></div>'+
  '<div class="row sb"><span class="note">'+(u.kelas?'Kelas '+u.kelas+' · ':'')+(u.aktif===false?'Nonaktif':'Aktif')+'</span><div class="row"><button type="button" class="btn small" data-act="akunedit" data-v="'+u.id+'">Ubah</button>'+(u.id!==S.user.id?'<button type="button" class="btn small danger" data-act="akundel" data-v="'+u.id+'">Hapus</button>':'')+'</div></div></div>'}).join('');
 return '<div class="row sb"><h2>Akun</h2><button type="button" class="btn small primary" data-act="akunnew">Tambah akun</button></div>'+
  '<div class="row"><label class="btn small filebtn">Impor Excel<input id="impfile" type="file" accept=".xlsx,.xls,.csv" hidden></label><button type="button" class="btn small" data-act="akuntpl">Template</button><button type="button" class="btn small" data-act="akunxls">Ekspor Excel</button>'+(nGanda?'<button type="button" class="btn small danger" data-act="akunganda">Hapus akun ganda ('+nGanda+')</button>':'')+'</div>'+
  (A.msg?'<div class="card job '+(A.msg.ok?'st-ok':'st-bad')+'" role="status"><p>'+esc(A.msg.m)+'</p><button type="button" class="btn small" data-act="akunmsg">Tutup</button></div>':'')+im+form+'<input id="akunq" type="search" placeholder="Cari nama, username, atau email" value="'+esc(A.q)+'" aria-label="Cari akun"><div class="chips" role="group" aria-label="Filter peran">'+chips+'</div>'+
  (rows||'<div class="card"><p class="muted">Tidak ada akun yang cocok.</p></div>')+
  '<p class="note">'+(Cloud.on?'Akun login dibuat pengguna lewat Daftar atau Google. Impor menyiapkan peran dan kelas berdasarkan email.':'Mode lokal: sandi disimpan sebagai hash di peramban ini.')+' Admin: kelola akun dan KKM. Guru: menilai dan melihat semua rekap. Siswa: latihan dan melihat nilai sendiri.</p>';
}

async function saveAkun(d){
 var e=A.edit,nama=(d.nama||'').trim(),em=(d.email||'').trim().toLowerCase(),un=(d.username||'').trim().toLowerCase().replace(/\s+/g,'')||(em?em.split('@')[0]:slug(nama));
 if(!nama)throw new Error('Nama wajib diisi.');
 var pr=URUT.filter(function(r){return (d.peranAll||[]).indexOf(r)>-1});if(!pr.length)throw new Error('Pilih minimal satu peran.');
 if(Cloud.on&&!em)throw new Error('Email wajib diisi.');
 if(S.users.some(function(u){return u.id!==e.id&&(u.username===un||(em&&u.email===em))}))throw new Error('Username atau email sudah dipakai.');
 var o=e.id?S.users.find(function(u){return u.id===e.id}):{id:uid(),dibuat:Date.now()};
 if(o.id===S.user.id&&(pr.indexOf('admin')<0||!d.aktif))throw new Error('Akun Anda sendiri tidak bisa diturunkan atau dinonaktifkan.');
 if(!Cloud.on&&d.pw&&d.pw.length<6)throw new Error('Sandi minimal 6 karakter.');
 if(Cloud.on&&d.pw&&d.pw.length<8)throw new Error('Sandi minimal 8 karakter.');
 Object.assign(o,{nama:nama,username:un,email:em,peran:pr.join(','),kelas:pr.indexOf('siswa')>-1?d.kelas:'',aktif:!!d.aktif});
 if(!Cloud.on&&d.pw)await setPw(o,d.pw);
 if(e.id)o.d=1;else S.users.push(o);
 A.edit=null;persist();
 if(Cloud.on&&d.pw){try{await Cloud.setPw(em,d.pw,nama);A.msg={ok:true,m:'Akun '+nama+' disimpan dan sandi login berhasil diatur. Akun ini sudah bisa masuk dengan email '+em+'.'};toast('Akun dan sandi disimpan')}catch(x){A.msg={ok:false,m:'Akun '+nama+' disimpan, tetapi sandi GAGAL diatur: '+((x&&x.message)||x)};toast('Sandi gagal diatur')}}else{A.msg={ok:true,m:'Akun '+nama+' disimpan'+(Cloud.on?' tanpa sandi. Pengguna membuat sandi sendiri lewat Daftar dengan email '+em+'.':'.')};toast('Akun disimpan')}
}

document.addEventListener('submit',async function(e){
 var f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
 var k=f.dataset.form,fd=new FormData(f),d=Object.fromEntries(fd);d.peranAll=fd.getAll('peran');A.err='';
 try{
  if(k==='login'){
   if(Cloud.on){await Cloud.login(d.id.trim(),d.pw);await Cloud.enter(await Cloud.me())}
   else{var u=await localLogin(d.id.trim(),d.pw);if(!u)throw new Error('Username atau sandi salah.');localStorage.setItem(SES,u.id);enter(u)}
  }else if(k==='register'){await Cloud.register(d.nama.trim(),d.id.trim(),d.pw);await Cloud.enter(await Cloud.me())}
  else if(k==='akun')await saveAkun(d);
 }catch(err){A.err=err&&err.message?err.message:String(err);
  if(/invalid credentials/i.test(A.err))A.err='Email atau kata sandi salah, atau akun login belum dibuat. Jika belum pernah mendaftar, ketuk Daftar dan pakai email yang sama dengan yang dicatat guru.';
  else if(/user.*already exists|same id, email, or phone/i.test(A.err))A.err='Email ini sudah terdaftar. Ketuk Masuk, bukan Daftar.';
  else if(/password must be/i.test(A.err))A.err='Kata sandi minimal 8 karakter.'}
 render();
});
async function doLogout(){
 stopTimer();
 if(Cloud.on){await Cloud.logout();dropSnap();S.users=[];S.results=[];S.lkpd=[];S.lkpdBukti=[];S.observasi=[];OB.mode='list';OB.d=null;OB.view=null}else localStorage.removeItem(SES);
 S.user=null;A.edit=null;A.imp=null;A.impn=null;A.err='';resetV();render();
}
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a==='logout')await doLogout();
 else if(a==='google')Cloud.google();
 else if(a==='togglereg'){A.reg=!A.reg;A.err='';render()}
 else if(a==='akunmsg'){A.msg=null;render()}
 else if(a==='akunnew'){A.msg=null;A.edit={peran:'siswa',kelas:'X',aktif:true};A.err='';render()}
 else if(a==='akunedit'){A.msg=null;A.edit=Object.assign({},S.users.find(function(u){return u.id===v}));A.err='';render()}
 else if(a==='akuncancel'){A.edit=null;A.err='';render()}
 else if(a==='akundel'){
  var u=S.users.find(function(x){return x.id===v});
  if(hasRole(u,'admin')&&S.users.filter(function(x){return hasRole(x,'admin')&&x.aktif!==false&&x.id!==v}).length<1){toast('Harus tersisa satu admin aktif');return}
  if(!(await uiConfirm('Hapus akun '+u.nama+'?\nData nilai tetap tersimpan.',{ok:'Hapus',danger:true})))return;
  S.users=S.users.filter(function(x){return x.id!==v});Cloud.remove('akun',v);persist();render();toast('Akun dihapus');
 }
 else if(a==='akunfilter'){A.peran=v;render()}
 else if(a==='akuntpl')tplAkun();
 else if(a==='akunxls')xlsAkun();
 else if(a==='impapply'){await applyImport();render()}
 else if(a==='akunganda'){await hapusGanda();render()}
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


/* ---- Dasbor dari bawah: dibuka dengan roda gigi atau logo, ditutup dengan tombol back HP ---- */
function drIsOpen(){return document.body.classList.contains('dr-open')}
function drSet(on){
 document.body.classList.toggle('dr-open',on);
 document.querySelectorAll('[data-act="drawer"]').forEach(function(x){x.setAttribute('aria-expanded',String(on))});
 if(on){var f=document.querySelector('#drawer [aria-current="page"],#drawer .srow');if(f)f.focus({preventScroll:true})}
 else{var g=document.querySelector('.gear');if(g&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#drawer'))g.focus({preventScroll:true})}
}
function drOpen(on){
 if(on===drIsOpen())return;
 if(on){history.pushState({sheet:1},'');drSet(true)}
 else{drSet(false);if(history.state&&history.state.sheet)history.back()}
}
window.addEventListener('popstate',function(){if(drIsOpen())drSet(false)});
function leaveExam(el){
 if(V.mode==='list')return true;
 if(V.mode==='exam'&&anyChecked()&&!uiOk('leave',V.t0?'Waktu tetap berjalan dan tidak bisa dijeda.\nIsian tersimpan otomatis; lanjutkan dari daftar unit sebelum waktu habis.':'Tinggalkan penilaian ini?\nIsian yang belum disimpan akan hilang.',el,{ok:'Tinggalkan',danger:true}))return false;
 stopTimer();V.mode='list';return true;
}
document.addEventListener('click',async function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
 if(a==='drawer')drOpen(!drIsOpen());
 else if(a==='drawerclose')drOpen(false);
 else if(a==='menu'&&String(b.dataset.v).indexOf('lkpd:')===0){drOpen(false);var kc=b.dataset.v.slice(5);if(kelasBoleh().indexOf(kc)<0){toast('Kelas ini bukan kelas kamu');return}if(!leaveExam(b))return;S.kelas=kc;S.tab='lkpd';LK.open=false;LK.detail=null;LK.editor=null;LK.preview=false;LK.tab='materi';LK.kf='';render();window.scrollTo(0,0)}
 else if(a==='menu'){drOpen(false);var v=b.dataset.v;if(v.indexOf('kelas:')===0&&kelasBoleh().indexOf(v.slice(6))<0){toast('Kelas ini bukan kelas kamu');return}if(!leaveExam(b))return;if(v.indexOf('kelas:')===0){S.kelas=v.slice(6);S.tab='katalog';persist()}else S.tab=v;render();window.scrollTo(0,0)}
 else if(a==='switchrole'){var rl=roleList(S.user),nx=rl[(rl.indexOf(actRole())+1)%rl.length];if(!leaveExam(b))return;setAct(nx);if(nx==='siswa'&&S.user.kelas)S.kelas=S.user.kelas;S.tab='beranda';render();window.scrollTo(0,0);toast('Peran aktif: '+PERAN[nx])}
 else if(a==='menulogout'){drOpen(false);if(!leaveExam(b))return;await doLogout()}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&drIsOpen())drOpen(false)});
