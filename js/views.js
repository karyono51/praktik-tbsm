function viewKatalog(){
  var kb=kelasBoleh();if(kb.indexOf(S.kelas)<0)S.kelas=kb[0];
  var k=KELAS[S.kelas];
  var jobs=JOBS.filter(function(j){return j.kelas===S.kelas}).map(function(j){
    var l=lastFor(j.id),st='<span class="pill plain">Belum dicoba</span>';
    if(l)st='<span class="pill '+(l.kompeten?'ok':'bad')+'">'+(l.kompeten?'Kompeten':'Belum kompeten')+' · '+l.score+'</span>';
    var wajib=j.items.filter(function(i){return i.k}).length;
    return '<article class="card job '+(l?(l.kompeten?'st-ok':'st-bad'):'')+'"><div class="row sb"><h3 class="grow">'+esc(j.judul)+'</h3></div>'+
      '<div class="meta"><span>'+esc(j.unit)+'</span><span class="mono">'+j.menit+' menit</span><span>'+j.items.length+' butir, '+wajib+' wajib</span></div>'+
      (j.skkni?'<div><span class="pill plain mono" title="Kode unit SKKNI">SKKNI '+j.skkni+'</span></div>':'')+
      '<div class="row sb">'+st+'<button type="button" class="btn primary small" data-act="start" data-v="'+j.id+'">'+(isStaff()?'Nilai siswa':'Mulai latihan')+'</button></div></article>';
  }).join('');
  return '<div class="row sb"><div><h2>'+k.judul+'</h2><p class="note">'+k.sub+'</p></div><span class="pill plain">'+JOBS.filter(function(j){return j.kelas===S.kelas}).length+' unit</span></div>'+
    '<p class="note">'+(isStaff()?'Mode guru: menilai siswa dengan rubrik. Hasil tercatat sebagai Penilaian.':'Mode siswa: latihan mandiri dengan pengukur waktu. Hasil tercatat sebagai Latihan.')+' '+(kb.length>1?'Ganti kelas lewat menu di dasbor.':'Unit di sini khusus kelas kamu.')+'</p><div class="jobs">'+jobs+'</div>';
}

function viewExam(){
  var j=V.job,groups='';
  Object.keys(ASPEK).forEach(function(a){
    var its=j.items.filter(function(i){return i.a===a});
    groups+='<section class="aspek"><div class="aspek-head"><span class="label">'+ASPEK[a].n+'</span><span class="mono note">bobot '+ASPEK[a].w+'%</span></div>'+
      its.map(function(i){var v=V.checks[i.id];
        return '<div class="item" data-id="'+i.id+'" data-v="'+(v===undefined?'':v)+'"><div class="t"><span>'+esc(i.t)+'</span>'+(i.k?'<span class="pill warn">Wajib</span>':'')+'</div>'+
          '<div class="yn"><button type="button" class="y" data-act="chk" data-id="'+i.id+'" data-v="1" aria-pressed="'+(v===1)+'">Terpenuhi</button><button type="button" class="n" data-act="chk" data-id="'+i.id+'" data-v="0" aria-pressed="'+(v===0)+'">Belum</button></div></div>';
      }).join('')+'</section>';
  });
  var pes='';
  if(isStaff()){
    var ro=S.roster.filter(function(r){return r.kelas===j.kelas}),rest=ro.filter(function(r){return V.group.indexOf(r.nama)<0});
    var tot=j.items.length;
    var tabs=V.group.map(function(n){var on=!V.kel&&V.peserta===n;
      return '<div class="ptab'+(V.kel?' mem':'')+'" data-n="'+esc(n)+'"'+(on?' aria-current="true"':'')+'>'+(V.kel?'<span class="pn">'+esc(n)+'</span>':'<button type="button" class="pn" data-act="ptab" data-n="'+esc(n)+'">'+esc(n)+' <span class="mono pb">'+doneOf(n)+'/'+tot+'</span></button>')+
      (V.group.length>1?'<button type="button" class="px" data-act="prm" data-n="'+esc(n)+'" aria-label="Keluarkan '+esc(n)+'">&times;</button>':'')+'</div>'}).join('');
    pes='<div class="seg" role="group" aria-label="Cara menilai"><button type="button" data-act="gmode" data-v="0" aria-pressed="'+(!V.kel)+'">Per siswa</button><button type="button" data-act="gmode" data-v="1" aria-pressed="'+(!!V.kel)+'">Kelompok</button></div>'+
      '<p class="note">'+(V.kel?'Satu rubrik untuk seluruh anggota. Skor dan status yang sama disimpan untuk tiap anggota.':'Setiap siswa punya rubrik sendiri. Ketuk nama untuk berpindah siswa.')+'</p>'+
      '<div class="ptabs" role="group" aria-label="'+(V.kel?'Anggota kelompok':'Siswa yang dinilai')+'">'+(tabs||'<span class="note">Belum ada siswa kelas '+j.kelas+'. Tambahkan di bawah.</span>')+'</div>'+
      '<div class="row"><select id="addpes" class="grow" aria-label="Pilih siswa untuk ditambahkan"><option value="">'+(rest.length?'Tambah siswa…':'Semua siswa kelas '+j.kelas+' sudah dipilih')+'</option>'+rest.map(function(r){return '<option value="'+esc(r.nama)+'">'+esc(r.nama)+(r.contoh?' (contoh)':'')+'</option>'}).join('')+'</select><button type="button" class="btn small" data-act="padd">Tambah</button></div>'+
      '<div class="row"><div class="grow"><input id="newsiswa" placeholder="Atau tulis siswa baru kelas '+j.kelas+'" aria-label="Nama siswa baru"></div><button type="button" class="btn small" data-act="addsiswa">Tambah baru</button></div>';
  }else{
    pes='<label class="f">Nama kamu<input id="peserta" value="'+esc(V.peserta)+'" placeholder="Nama lengkap" autocomplete="name" readonly></label>';
  }
  var total=j.items.length,done=Object.keys(V.checks).length;
  return '<div class="row"><button type="button" class="btn small" data-act="back">Kembali</button><span class="pill">Kelas '+j.kelas+' · Fase '+KELAS[j.kelas].fase+'</span></div>'+
    '<div class="card"><h2>'+esc(j.judul)+'</h2>'+(isStaff()&&V.group.length&&!V.kel?'<div class="pill" style="align-self:flex-start">Menilai: '+esc(V.peserta)+'</div>':'')+'<div class="meta muted" style="font-size:13px">'+esc(j.unit)+' · target '+j.menit+' menit'+(j.skkni?' · SKKNI '+j.skkni:'')+'</div>'+pes+
    '<p class="note">Butir bertanda Wajib menyangkut keselamatan atau ketepatan kerja. Satu butir wajib yang belum terpenuhi membuat hasil Belum Kompeten, berapa pun skornya.</p></div>'+groups+
    '<div class="bar"><div class="in"><div><div class="mono" style="font-size:20px;font-weight:600" id="clock">'+mmss(V.sec)+'</div><div class="note"><span id="prog">'+done+'</span>/'+total+' butir terisi</div><div class="note" id="gcount">'+esc(gcText())+'</div></div>'+
    '<div class="row"><button type="button" class="btn small" data-act="timer" id="tbtn">'+(V.running?'Jeda':'Mulai waktu')+'</button><button type="button" class="btn primary" data-act="finish" id="fin"'+(groupComplete()?'':' disabled')+'>Hitung hasil</button></div></div></div>';
}

function viewResult(){
  var j=V.job,r=V.res,c=r.calc,its=V.items||[],multi=its.length>1,rname=(V.kel&&multi)?'Kelompok ('+its.length+' siswa)':(V.peserta||'Tanpa nama');
  var asp=Object.keys(ASPEK).map(function(a){var t=c.by[a].y+c.by[a].n,p=t?Math.round(100*c.by[a].y/t):0;
    return '<div><div class="row sb"><span>'+ASPEK[a].n+'</span><span class="mono">'+c.by[a].y+'/'+t+'</span></div><div class="meter"><i class="'+(p<S.kkm?'low':'')+'" style="width:'+p+'%"></i></div></div>'}).join('');
  var why='';
  if(c.crit.length)why='<div class="card" style="border-color:var(--bad)"><h3>Butir wajib belum terpenuhi</h3><ul class="plain">'+c.crit.map(function(i){return '<li>'+esc(i.t)+'</li>'}).join('')+'</ul></div>';
  else if(c.score<S.kkm)why='<div class="card" style="border-color:var(--warn)"><h3>Skor di bawah KKM</h3><p class="note">Semua butir wajib terpenuhi, tetapi skor '+c.score+' belum mencapai KKM '+S.kkm+'.</p></div>';
  var other=c.unmet.filter(function(i){return !i.k});
  var tl=other.length?'<div class="card"><h3>Perlu diperbaiki</h3><ul class="plain">'+other.map(function(i){return '<li>'+esc(i.t)+'</li>'}).join('')+'</ul></div>':'';
  var wk=V.sec?'<span class="pill plain mono">Waktu '+mmss(V.sec)+' / '+j.menit+':00</span>':'';
  var rtabs='';
  if(multi&&!V.kel)rtabs='<div class="ptabs" role="group" aria-label="Hasil per siswa">'+its.map(function(it,k){return '<div class="ptab" '+(k===V.rc?'aria-current="true"':'')+'><button type="button" class="pn" data-act="rtab" data-v="'+k+'">'+esc(it.nama||'Tanpa nama')+' <span class="mono pb">'+it.calc.score+'</span><i class="dot '+(it.calc.kompeten?'ok':'bad')+'"></i></button></div>'}).join('')+'</div>';
  else if(multi&&V.kel)rtabs='<div class="card"><span class="label">Anggota kelompok</span><div class="ptabs">'+its.map(function(it){return '<div class="ptab mem"><span class="pn">'+esc(it.nama||'Tanpa nama')+'</span></div>'}).join('')+'</div></div>';
  return rtabs+'<div class="card"><div class="row sb"><span class="label">'+esc(j.judul)+'</span>'+wk+'</div>'+
    '<div class="row" style="gap:16px"><div class="score mono">'+c.score+'</div><div class="stack" style="gap:6px"><span class="pill '+(c.kompeten?'ok':'bad')+'" style="font-size:14px">'+(c.kompeten?'Kompeten':'Belum kompeten')+'</span><span class="note">'+esc(rname)+' · KKM '+S.kkm+'</span></div></div>'+asp+'</div>'+why+tl+
    '<div class="card"><label class="f">Catatan '+(isStaff()?'asesor':'untuk diri sendiri')+'<textarea id="catatan" placeholder="Temuan, saran perbaikan, atau bukti pendukung">'+esc(V.notes[noteKey()]||'')+'</textarea></label></div>'+
    '<div class="row"><button type="button" class="btn" data-act="redo">Ulangi</button><button type="button" class="btn" data-act="pdfone">Unduh PDF</button><button type="button" class="btn primary grow" data-act="save">'+(multi?'Simpan '+its.length+' hasil':'Simpan ke rekap')+'</button></div>';
}
function viewAcuan(){
  function card(t,body){return '<div class="card"><h3>'+t+'</h3>'+body+'</div>'}
  return '<h2>Acuan dan aturan</h2>'+
  card('Pengaturan penilaian','<label class="f">KKM unit praktik (60 sampai 100)<input id="kkm" type="number" inputmode="numeric" min="60" max="100" '+(can('kkm')?'':'disabled ')+'value="'+S.kkm+'"></label><p class="note">KKM ditetapkan satuan pendidikan, jadi nilainya bisa disesuaikan. Bobot aspek: persiapan &amp; K3 20, proses 50, hasil 20, sikap &amp; waktu 10.</p>')+
  card('Kurikulum dan capaian pembelajaran','<p>Kurikulum Merdeka dengan capaian pembelajaran per fase (Keputusan BSKAP No. 32 Tahun 2024). Kelas X berada di Fase E, kelas XI dan XII di Fase F.</p><p class="note">CP Fase F Teknik Sepeda Motor mencakup perawatan dan perbaikan engine sepeda motor listrik dan hybrid, engine management system, dan pengelolaan bengkel. Unit ujian di aplikasi ini disusun mengikuti lingkup itu.</p>')+
  card('Uji Kompetensi Keahlian (UKK)','<p>UKK mengukur kompetensi setara KKNI jenjang 2 atau 3. Perangkat uji disusun LSP-P1 SMK, LSP-P2, atau LSP-P3 sesuai regulasi BNSP, dan siswa yang dinyatakan kompeten menerima sertifikat kompetensi.</p><p class="note">Acuan: Juknis UKK SMK TP 2025/2026 (Direktorat SMK) dan Peraturan BNSP No. 1/BNSP/II/2017 tentang sertifikasi lulusan SMK.</p>')+
  card('Hubungan dengan kelulusan','<p>Sertifikat UKK adalah dokumen kompetensi pendamping ijazah. Kelulusan tetap ditentukan satuan pendidikan. Mata uji Program Keahlian pada TKA SMK (Peraturan Kepala BKPDM No. 1 Tahun 2026) juga bukan penentu kelulusan.</p>')+
  card('SKKNI sepeda motor','<p>'+JOBS.filter(function(j){return j.skkni}).length+' dari '+JOBS.length+' unit ditautkan ke kode unit kompetensi SKKNI sepeda motor (OTO.SM01 untuk unit umum, OTO.SM02 untuk unit pemeliharaan dan perbaikan).</p><p class="note">Kode diambil dari skema uji kompetensi sepeda motor yang dipublikasikan, sedangkan rumusan langkah kerja disusun ulang untuk latihan. Cocokkan kode, elemen, dan kriteria unjuk kerja dengan dokumen SKKNI dan skema LSP sekolah Anda.</p>')+
  card('Cara penilaian di aplikasi','<ul class="plain"><li>Setiap butir dinilai Terpenuhi atau Belum, seperti observasi asesor pada skema sertifikasi.</li><li>Aspek yang dinilai: keselamatan kerja, kesesuaian SOP, penguasaan alat dan bahan, hasil, dan sikap.</li><li>Butir Wajib (K3 dan ketepatan kritis) harus terpenuhi semua untuk dinyatakan Kompeten.</li></ul>')+
  card('Batasan','<p>Aplikasi ini untuk simulasi dan latihan. Penilaian resmi UKK tetap memakai skema, tempat uji kompetensi, dan asesor bersertifikat dari LSP. Periksa juknis tahun pelajaran berjalan dan ketentuan dinas pendidikan provinsi sebelum memakai hasilnya sebagai nilai resmi.</p>')+
  card('Sumber','<ul class="plain"><li><a href="https://www.komunitasbelajar.id/2026/01/pedoman-atau-juknis-ukk-smk-tahun-2026.html" target="_blank" rel="noopener">Pedoman atau Juknis UKK SMK Tahun 2026</a></li><li><a href="https://www.komunitasbelajar.id/2026/08/peraturan-kepala-bkpdm-nomor-1-tahun-2026-kerangka-asesmen-tka-smk-mak.html" target="_blank" rel="noopener">Peraturan Kepala BKPDM No. 1 Tahun 2026 (TKA SMK/MAK)</a></li><li><a href="https://kurikulum.kemdikbud.go.id/" target="_blank" rel="noopener">Portal Kurikulum Kemdikbud (CP per mata pelajaran)</a></li></ul>');
}


function secHead(ic,t,extra){return '<div class="sechead"><span class="ico g1">'+svg(ICO[ic],18)+'</span><h2>'+t+'</h2>'+(extra||'')+'</div>'}
function viewBeranda(){
 var list=visibleResults().slice().sort(function(a,b){return b.ts-a.ts}),a=agg(list);
 var tried={};list.forEach(function(r){tried[r.jobId]=1});
 lkRefreshModules();var mine={};(S.lkpd||[]).forEach(function(x){if(isStaff()||x.sid===S.user.id)mine[x.moduleId]=1});
 var kc=kelasBoleh().map(function(c){
  var ms=LKPD_MODULES.filter(function(m){return m.kelas===c&&(isStaff()||(m.status==='published'&&m.active!==false))}),dn=ms.filter(function(m){return mine[m.id]}).length,pct=ms.length?Math.round(100*dn/ms.length):0;
  return '<button type="button" class="kcard" data-act="menu" data-v="lkpd:'+c+'"><span class="num" aria-hidden="true">'+c+'</span><span class="kt"><b>'+KELAS[c].judul+'</b><span>'+KELAS[c].sub+'</span><span class="meter" aria-hidden="true"><i style="width:'+pct+'%"></i></span><span class="mono kn">'+dn+' dari '+ms.length+' modul LKPD '+(isStaff()?'sudah ada pengumpulan':'sudah dikerjakan')+'</span></span></button>'}).join('');
 var tl=[['rekap','Rekap nilai','g1','menu']];if(can('observasi'))tl.push(['observasi','Observasi guru','g1','menu']);if(can('akun'))tl.push(['akun','Akun','g3','menu']);tl.push(['acuan','Acuan','g2','menu'],['drawer','Menu','g4','drawer']);
 var tiles=tl.map(function(t){return '<button type="button" class="tile" data-act="'+t[3]+'"'+(t[3]==='menu'?' data-v="'+t[0]+'"':'')+'><span class="ico '+t[2]+'">'+svg(ICO[t[0]==='drawer'?'menu':t[0]],26)+'</span><span>'+t[1]+'</span></button>'}).join('');
 var rec=list.slice(0,3).map(function(r){var j=jobById(r.jobId);
  return '<div class="rec"><span class="dot '+(r.kompeten?'ok':'bad')+'"></span><div class="grow"><b>'+esc(j?j.judul:r.jobId)+'</b><div class="note">'+(isStaff()?esc(r.siswa||'Tanpa nama')+' · ':'')+'Kelas '+r.kelas+' · '+tgl(r.ts)+'</div></div><span class="mono sc">'+r.score+'</span></div>'}).join('');
 return '<section class="strip" aria-label="Ringkasan"><div><b class="mono">'+a[0]+'</b><span>'+(isStaff()?'data nilai':'latihan')+'</span></div><div><b class="mono">'+a[1]+'</b><span>rata-rata</span></div><div><b class="mono">'+Math.round(a[2]*100)+'<small>%</small></b><span>kompeten</span></div></section>'+
  secHead('menu','Pintasan')+'<div class="tiles n'+tl.length+'">'+tiles+'</div>'+
  secHead('kelas',kelasBoleh().length>1?'Pilih kelas':'Kelas saya')+'<div class="kcards">'+kc+'</div>'+
  '<section class="recent">'+secHead('rekap','Terbaru',list.length?'<button type="button" class="link" data-act="menu" data-v="rekap">Lihat rekap</button>':'')+(rec||'<p class="muted">Belum ada nilai. Pilih kelas lalu mulai dari modul LKPD pertama.</p>')+'</section>';
}
