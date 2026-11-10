function viewKatalog(){
  var k=KELAS[S.kelas];
  var tabs=Object.keys(KELAS).map(function(c){return '<button type="button" data-act="kelas" data-v="'+c+'" aria-pressed="'+(S.kelas===c)+'"><b>'+KELAS[c].judul.replace('Kelas ','')+'</b><span>'+KELAS[c].sub+'</span></button>'}).join('');
  var jobs=JOBS.filter(function(j){return j.kelas===S.kelas}).map(function(j){
    var l=lastFor(j.id),st='<span class="pill plain">Belum dicoba</span>';
    if(l)st='<span class="pill '+(l.kompeten?'ok':'bad')+'">'+(l.kompeten?'Kompeten':'Belum kompeten')+' · '+l.score+'</span>';
    var wajib=j.items.filter(function(i){return i.k}).length;
    return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(j.judul)+'</h3></div>'+
      '<div class="meta"><span>'+esc(j.unit)+'</span><span class="mono">'+j.menit+' menit</span><span>'+j.items.length+' butir, '+wajib+' wajib</span></div>'+
      (j.skkni?'<div><span class="pill plain mono" title="Kode unit SKKNI">SKKNI '+j.skkni+'</span></div>':'')+
      '<div class="row sb">'+st+'<button type="button" class="btn primary small" data-act="start" data-v="'+j.id+'">'+(isStaff()?'Nilai siswa':'Mulai latihan')+'</button></div></article>';
  }).join('');
  return '<div class="kelas-tabs" role="group" aria-label="Pilih kelas">'+tabs+'</div>'+
    '<p class="note">'+(isStaff()?'Mode guru: menilai siswa dengan rubrik. Hasil tercatat sebagai Penilaian.':'Mode siswa: latihan mandiri dengan pengukur waktu. Hasil tercatat sebagai Latihan.')+' Kelas '+S.kelas+' berada di Fase '+k.fase+' Kurikulum Merdeka.</p><div class="jobs">'+jobs+'</div>';
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
    var ro=S.roster.filter(function(r){return r.kelas===j.kelas});
    pes='<label class="f">Siswa yang dinilai<select id="peserta">'+(ro.length?'':'<option value="">Belum ada siswa kelas '+j.kelas+'</option>')+ro.map(function(r){return '<option value="'+esc(r.nama)+'"'+(V.peserta===r.nama?' selected':'')+'>'+esc(r.nama)+(r.contoh?' (contoh)':'')+'</option>'}).join('')+'</select></label>'+
      '<div class="row"><div class="grow"><input id="newsiswa" placeholder="Tambah siswa kelas '+j.kelas+'" aria-label="Nama siswa baru"></div><button type="button" class="btn small" data-act="addsiswa">Tambah</button></div>';
  }else{
    pes='<label class="f">Nama kamu<input id="peserta" value="'+esc(V.peserta)+'" placeholder="Nama lengkap" autocomplete="name" readonly></label>';
  }
  var total=j.items.length,done=Object.keys(V.checks).length;
  return '<div class="row"><button type="button" class="btn small" data-act="back">Kembali</button><span class="pill">Kelas '+j.kelas+' · Fase '+KELAS[j.kelas].fase+'</span></div>'+
    '<div class="card"><h2>'+esc(j.judul)+'</h2><div class="meta muted" style="font-size:13px">'+esc(j.unit)+' · target '+j.menit+' menit'+(j.skkni?' · SKKNI '+j.skkni:'')+'</div>'+pes+
    '<p class="note">Butir bertanda Wajib menyangkut keselamatan atau ketepatan kerja. Satu butir wajib yang belum terpenuhi membuat hasil Belum Kompeten, berapa pun skornya.</p></div>'+groups+
    '<div class="bar"><div class="in"><div><div class="mono" style="font-size:20px;font-weight:600" id="clock">'+mmss(V.sec)+'</div><div class="note"><span id="prog">'+done+'</span>/'+total+' butir terisi</div></div>'+
    '<div class="row"><button type="button" class="btn small" data-act="timer" id="tbtn">'+(V.running?'Jeda':'Mulai waktu')+'</button><button type="button" class="btn primary" data-act="finish" id="fin"'+(done<total?' disabled':'')+'>Hitung hasil</button></div></div></div>';
}

function viewResult(){
  var j=V.job,r=V.res,c=r.calc;
  var asp=Object.keys(ASPEK).map(function(a){var t=c.by[a].y+c.by[a].n,p=t?Math.round(100*c.by[a].y/t):0;
    return '<div><div class="row sb"><span>'+ASPEK[a].n+'</span><span class="mono">'+c.by[a].y+'/'+t+'</span></div><div class="meter"><i class="'+(p<S.kkm?'low':'')+'" style="width:'+p+'%"></i></div></div>'}).join('');
  var why='';
  if(c.crit.length)why='<div class="card" style="border-color:var(--bad)"><h3>Butir wajib belum terpenuhi</h3><ul class="plain">'+c.crit.map(function(i){return '<li>'+esc(i.t)+'</li>'}).join('')+'</ul></div>';
  else if(c.score<S.kkm)why='<div class="card" style="border-color:var(--warn)"><h3>Skor di bawah KKM</h3><p class="note">Semua butir wajib terpenuhi, tetapi skor '+c.score+' belum mencapai KKM '+S.kkm+'.</p></div>';
  var other=c.unmet.filter(function(i){return !i.k});
  var tl=other.length?'<div class="card"><h3>Perlu diperbaiki</h3><ul class="plain">'+other.map(function(i){return '<li>'+esc(i.t)+'</li>'}).join('')+'</ul></div>':'';
  var wk=V.sec?'<span class="pill plain mono">Waktu '+mmss(V.sec)+' / '+j.menit+':00</span>':'';
  return '<div class="card"><div class="row sb"><span class="label">'+esc(j.judul)+'</span>'+wk+'</div>'+
    '<div class="row" style="gap:16px"><div class="score mono">'+c.score+'</div><div class="stack" style="gap:6px"><span class="pill '+(c.kompeten?'ok':'bad')+'" style="font-size:14px">'+(c.kompeten?'Kompeten':'Belum kompeten')+'</span><span class="note">'+esc(V.peserta||'Tanpa nama')+' · KKM '+S.kkm+'</span></div></div>'+asp+'</div>'+why+tl+
    '<div class="card"><label class="f">Catatan '+(isStaff()?'asesor':'untuk diri sendiri')+'<textarea id="catatan" placeholder="Temuan, saran perbaikan, atau bukti pendukung">'+esc(V.catatan)+'</textarea></label></div>'+
    '<div class="row"><button type="button" class="btn" data-act="redo">Ulangi</button><button type="button" class="btn" data-act="pdfone">Unduh PDF</button><button type="button" class="btn primary grow" data-act="save">Simpan ke rekap</button></div>';
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
