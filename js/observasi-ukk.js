/* observasi-ukk.js: Lembar Observasi UKK "Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR)".
   Untuk Admin dan Guru (penguji). Menu terpisah dari Observasi guru dan Observasi praktik siswa; berkas observasi.js tidak diubah.
   Penyimpanan: koleksi dan kunci yang sama dengan observasi lain (S.observasi, koleksi `observasi`) dengan tipe = 'ukk',
   sehingga sinkron Appwrite, antrean offline, hak akses (Admin semua, Guru miliknya), dan Cek sinkronisasi ikut berlaku. */
var OBU={
 meta:{tahun:'2026/2027',satuan:'SMKS Darul Fatwa',konsentrasi:'Teknik Bisnis Sepeda Motor',kode:'KM25.2.2.2',waktu:'20 Menit',judul:'Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR)'},
 grup:[{"g": "A. Persiapan", "t": [[1, "Memakai pakaian kerja dan APD (wearpack, sepatu, sarung tangan)", ""], [2, "Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan", ""], [3, "Memeriksa kondisi alat ukur sebelum dipakai", ""], [4, "Memposisikan sepeda motor dengan aman (standar tengah/dudukan)", ""]]}, {"g": "B. Proses kerja (16 item)", "t": [[5, "Memeriksa tegangan baterai", "Siswa mengukur tegangan baterai dengan voltmeter dan membandingkannya dengan 13,0–13,2 V."], [6, "Memeriksa dan mengganti oli mesin sesuai takaran", "Siswa menguras oli mesin lama dan mengisi oli baru sebanyak 0,8 L sesuai takaran."], [7, "Memeriksa dan mengganti oli transmisi matic (final drive)", "Siswa mengganti oli transmisi matic sebanyak 0,12 L sesuai takaran."], [8, "Membersihkan saringan oli (kasa dan sentrifugal)", "Siswa membersihkan kasa dan saringan sentrifugal hingga bersih dan tidak tersumbat."], [9, "Memeriksa level dan kondisi air radiator/coolant", "Siswa memeriksa level coolant berada di antara batas atas dan bawah pada 0,51 L."], [10, "Mengukur dan menyetel celah klep", "Siswa mengukur celah klep dan menyetelnya ke IN 0,10 ± 0,02 mm dan EX 0,24 ± 0,02 mm."], [11, "Memeriksa dan membersihkan filter udara", "Siswa memeriksa dan membersihkan filter udara hingga bersih, tidak sobek, dan tidak basah oli."], [12, "Memeriksa kondisi dan mengukur celah busi", "Siswa memeriksa kondisi busi dan mengukur celah busi 0,8–0,9 mm."], [13, "Memeriksa dan menyetel idle speed", "Siswa menyetel idle speed hingga 1.700 ± 100 rpm."], [14, "Memeriksa jarak main bebas throttle gas", "Siswa mengukur jarak main bebas handel gas dan memastikannya berada pada 2–6 mm."], [15, "Memeriksa saluran dan mengukur tekanan bahan bakar", "Siswa memeriksa saluran bahan bakar tidak bocor dan mengukur tekanan bahan bakar 294 kPa."], [16, "Memeriksa kode kerusakan sistem injeksi dan mereset kerusakan", "Siswa membaca kode kerusakan sistem injeksi dan mereset kerusakan hingga tidak ada kode tersisa."], [17, "Memeriksa kebocoran oli shock depan", "Siswa memeriksa shock depan dan memastikan tidak ada kebocoran oli."], [18, "Memeriksa kerja (tekan-lepas) shock depan", "Siswa menekan dan melepas shock depan dan memastikan kerjanya halus, tidak macet."], [19, "Memeriksa kebocoran shock belakang", "Siswa memeriksa shock belakang dan memastikan tidak ada kebocoran."], [20, "Memeriksa kerja shock belakang", "Siswa menekan dan melepas shock belakang dan memastikan kerjanya halus, tidak macet."]]}, {"g": "C. K3 dan lingkungan", "t": [[21, "Menerapkan K3 selama bekerja", ""], [22, "Menangani oli bekas dan limbah dengan benar", ""], [23, "Merapikan dan membersihkan area kerja serta alat setelah selesai", ""]]}, {"g": "D. Hasil dan waktu", "t": [[24, "Menyelesaikan pekerjaan dalam 20 menit", ""], [25, "Mengisi hasil pemeriksaan dengan jujur dan lengkap", ""], [26, "Menarik kesimpulan sesuai standar/spesifikasi", ""]]}]
};
OBU.grup=OBU.grup.map(function(g){return {g:g.g,items:g.t.map(function(t){return {id:'u'+t[0],no:t[0],t:t[1],d:t[2]}})}});
OBU.flat=[];OBU.grup.forEach(function(g){g.items.forEach(function(i){i.g=g.g;OBU.flat.push(i)})});
var OU={mode:'list',d:null,view:null,q:''};
ICO['observasi-ukk']=ICO.observasi;

/* Observasi bertipe 'ukk' tidak boleh muncul di daftar Observasi guru (obsTipe lama menganggap semua selain 'siswa' sebagai guru) */
obsTipe=function(r){return r&&r.tipe==='ukk'?'ukk':(r&&r.tipe==='siswa'?'siswa':'guru')};

function obuHitung(nl){
 var n=OBU.flat.length,done=0,kom=0;
 OBU.flat.forEach(function(i){var v=nl&&nl[i.id];if(v===1||v===0){done++;if(v===1)kom++}});
 var nilai=Math.round(kom/n*100),ok=nilai>=S.kkm;
 return {n:n,done:done,kom:kom,belum:done-kom,nilai:nilai,ok:ok,hasil:ok?'Kompeten':'Belum Kompeten'};
}
function obuVisible(){
 var L=(S.observasi||[]).filter(function(r){return r.tipe==='ukk'&&(can('observasi-semua')||(!!S.user&&r.pengamatId===S.user.id))});
 return L.sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))||b.ts-a.ts});
}
function obuBaru(){return {id:'',sel:'',nama:'',nis:'',kelas:Object.keys(KELAS)[0],tanggal:ymd(Date.now()),penguji:(S.user&&S.user.nama)||'',nilai:{},cat:{},catatan:''}}
function obuDraftDari(r){
 var p=obsPay(r),sel=(r.guruId&&S.users.some(function(u){return u.id===r.guruId}))?r.guruId:'__lain';
 return {id:r.id,sel:sel,nama:sel==='__lain'?r.guru:'',nis:p.nis||'',kelas:r.kelas||Object.keys(KELAS)[0],tanggal:r.tanggal||ymd(Date.now()),penguji:p.penguji||r.pengamat||'',nilai:p.nilai,cat:p.cat,catatan:p.catatan||''};
}

/* ---- Tampilan ---- */
function viewObservasiUkk(){
 if(OU.mode==='form'&&OU.d)return obuFormView();
 if(OU.mode==='view'&&OU.view)return obuDetailView();
 return obuListView();
}
function obuInfoCard(){
 var m=OBU.meta;
 return '<div class="card"><span class="label">Judul tugas</span><b>'+esc(m.judul)+'</b><div class="note">'+esc(m.satuan)+' · '+esc(m.konsentrasi)+' · Kode '+esc(m.kode)+' · Alokasi waktu '+esc(m.waktu)+' · Tahun pelajaran '+esc(m.tahun)+'</div></div>';
}
function obuListView(){
 var L=obuVisible(),q=OU.q.toLowerCase(),admin=can('observasi-semua');
 var F=L.filter(function(r){return !q||(r.guru+' '+r.kelas+' '+(r.pengamat||'')).toLowerCase().indexOf(q)>-1});
 var kom=L.filter(function(r){return r.kategori==='Kompeten'}).length;
 var avg=L.length?Math.round(L.reduce(function(t,r){return t+(+r.skor||0)},0)/L.length):0;
 var cards=F.map(function(r){
  var ok=r.kategori==='Kompeten';
  return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(r.guru)+'</h3><span class="pill '+(ok?'ok':'bad')+'">'+esc(r.kategori)+'</span></div>'+
   '<div class="meta"><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
   '<div class="row sb"><span class="note">'+(admin?'Penguji: '+esc(r.pengamat||'-'):'Observasi saya')+'</span><span class="mono" style="font-weight:600">Nilai '+(+r.skor||0)+'</span></div>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="obu-view" data-v="'+esc(r.id)+'">Lihat</button><button type="button" class="btn small" data-act="obu-pdf" data-v="'+esc(r.id)+'">PDF</button>'+
   (obsBoleh(r)?'<button type="button" class="btn small" data-act="obu-edit" data-v="'+esc(r.id)+'">Ubah</button><button type="button" class="btn small danger" data-act="obu-del" data-v="'+esc(r.id)+'">Hapus</button>':'')+'</div></article>';
 }).join('');
 return '<div class="row sb"><div><h2>Observasi UKK</h2><p class="note">Lembar observasi praktik uji kompetensi keahlian. Hanya untuk Admin dan Guru.</p></div></div>'+obuInfoCard()+
  '<div class="stats"><div class="card"><span class="label">Observasi</span><b class="mono">'+L.length+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono">'+kom+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div></div>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="obu-new">+ Observasi baru</button>'+(L.length?'<button type="button" class="btn small" data-act="obu-xls">Unduh Excel</button>':'')+'</div>'+
  (L.length>3?'<label class="f">Cari<input id="obuq" type="search" value="'+esc(OU.q)+'" placeholder="Nama siswa, kelas, penguji"></label>':'')+
  '<div class="jobs">'+(cards||'<div class="card"><p class="muted">'+(L.length?'Tidak ada observasi yang cocok.':'Belum ada observasi. Ketuk <b>+ Observasi baru</b> untuk mulai.')+'</p></div>')+'</div>'+
  '<p class="note">'+(admin?'Admin melihat semua observasi.':'Anda hanya melihat observasi yang Anda isi sendiri.')+' '+(Cloud.on?'Data tersinkron ke Appwrite.':'Data tersimpan di peramban ini.')+'</p>';
}
function obuItemHtml(it,d){
 var v=d.nilai[it.id],on=(v===1||v===0)?v:'';
 return '<div class="item" data-s="'+(v===1?4:v===0?1:'')+'"><div class="t" style="display:block"><b>'+it.no+'. '+esc(it.t)+'</b>'+(it.d?'<div class="note" style="font-style:italic;margin-top:3px">'+esc(it.d)+'</div>':'')+'</div>'+
  '<div class="seg" role="group" aria-label="Capaian butir '+it.no+'">'+
  '<button type="button" data-act="obu-set" data-id="'+it.id+'" data-v="1" aria-pressed="'+(v===1)+'">Kompeten</button>'+
  '<button type="button" data-act="obu-set" data-id="'+it.id+'" data-v="0" aria-pressed="'+(v===0)+'">Belum Kompeten</button></div>'+
  '<input class="obu-cat" data-id="'+it.id+'" maxlength="300" placeholder="Keterangan (opsional)" value="'+esc(d.cat[it.id]||'')+'"></div>';
}
function obuFormView(){
 var d=OU.d,h=obuHitung(d.nilai);
 var gopt='<option value="">Pilih siswa</option>'+obsOrang('siswa').map(function(u){return '<option value="'+esc(u.id)+'"'+(d.sel===u.id?' selected':'')+'>'+esc(u.nama)+' ('+esc(u.kelas||'-')+')</option>'}).join('')+'<option value="__lain"'+(d.sel==='__lain'?' selected':'')+'>Lainnya (ketik nama)</option>';
 var kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(d.kelas===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var items=OBU.grup.map(function(g){return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){return obuItemHtml(it,d)}).join('')}).join('');
 return '<div class="row sb"><h2>'+(d.id?'Ubah: ':'Baru: ')+'Observasi UKK</h2><button type="button" class="btn small" data-act="obu-cancel">Batal</button></div>'+obuInfoCard()+
  '<form class="card" data-form="obs-noop" onsubmit="return false">'+
  '<label class="f">Nama siswa<select data-obu="sel">'+gopt+'</select></label>'+
  (d.sel==='__lain'?'<label class="f">Nama siswa (manual)<input data-obu="nama" maxlength="120" value="'+esc(d.nama)+'"></label>':'')+
  '<div class="two"><label class="f">NIS<input data-obu="nis" maxlength="30" value="'+esc(d.nis)+'"></label><label class="f">Kelas<select data-obu="kelas">'+kopt+'</select></label></div>'+
  '<div class="two"><label class="f">Tanggal<input type="date" data-obu="tanggal" value="'+esc(d.tanggal)+'"></label><label class="f">Penguji<input data-obu="penguji" maxlength="120" value="'+esc(d.penguji)+'"></label></div></form>'+
  '<p class="note">Pilih Kompeten atau Belum Kompeten untuk setiap aspek. Isi keterangan bila perlu.</p>'+items+
  '<div class="card"><div class="row sb"><span class="note">Terisi</span><b class="mono"><span id="obuprog">'+h.done+'</span> / '+h.n+'</b></div><div class="row sb"><span class="note">Kompeten · nilai</span><b class="mono" id="obunilai">'+obuRingkas(h)+'</b></div>'+
  '<p class="note">Nilai = jumlah butir Kompeten dibagi '+h.n+' x 100. Hasil akhir Kompeten bila nilai minimal KKM ('+S.kkm+').</p></div>'+
  '<div class="card"><label class="f">Catatan penguji<textarea data-obu="catatan" maxlength="800">'+esc(d.catatan)+'</textarea></label></div>'+
  '<div class="row"><button type="button" class="btn" data-act="obu-cancel">Batal</button><button type="button" class="btn primary grow" data-act="obu-save">Simpan observasi</button></div>';
}
function obuRingkas(h){return h.done?h.kom+'/'+h.n+' · '+h.nilai+(h.done>=h.n?' · '+h.hasil:''):'-'}
function obuSync(){if(!OU.d)return;var h=obuHitung(OU.d.nilai),a=$('#obuprog'),b=$('#obunilai');if(a)a.textContent=h.done;if(b)b.textContent=obuRingkas(h)}
function obuDetailView(){
 var r=OU.view,p=obsPay(r),h=obuHitung(p.nilai),ok=r.kategori==='Kompeten',m=OBU.meta;
 var rows=OBU.grup.map(function(g){return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){
  var v=p.nilai[it.id];
  return '<div class="card" style="gap:4px"><div class="row sb"><span>'+it.no+'. '+esc(it.t)+'</span><span class="pill '+(v===1?'ok':v===0?'bad':'plain')+'">'+(v===1?'Kompeten':v===0?'Belum Kompeten':'-')+'</span></div>'+(it.d?'<div class="note" style="font-style:italic">'+esc(it.d)+'</div>':'')+(p.cat[it.id]?'<div class="note">'+esc(p.cat[it.id])+'</div>':'')+'</div>'}).join('')}).join('');
 return '<div class="row sb"><h2>Detail observasi UKK</h2><button type="button" class="btn small" data-act="obu-back">Kembali</button></div>'+
  '<div class="card"><h3>'+esc(r.guru)+'</h3><div class="meta"><span>NIS '+esc(p.nis||'-')+'</span><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
  '<div class="note">'+esc(m.judul)+' · Kode '+esc(m.kode)+'</div><div class="note">Penguji: '+esc(p.penguji||r.pengamat||'-')+'</div>'+
  '<div class="row sb"><span class="pill '+(ok?'ok':'bad')+'">'+esc(r.kategori)+'</span><b class="mono">Nilai '+(+r.skor||0)+' · '+h.kom+'/'+h.n+' kompeten</b></div></div>'+rows+
  (p.catatan?'<div class="card"><b>Catatan penguji</b><p>'+esc(p.catatan).replace(/\n/g,'<br>')+'</p></div>':'')+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary" data-act="obu-pdf" data-v="'+esc(r.id)+'">Unduh PDF</button>'+(obsBoleh(r)?'<button type="button" class="btn" data-act="obu-edit" data-v="'+esc(r.id)+'">Ubah</button>':'')+'</div>';
}

/* ---- Simpan, hapus ---- */
function obuSave(){
 var d=OU.d,h=obuHitung(d.nilai),nama='',gid='',kelas=d.kelas;
 if(d.sel==='__lain')nama=String(d.nama||'').trim();
 else if(d.sel){var u=S.users.find(function(x){return x.id===d.sel});if(u){nama=u.nama;gid=u.id}}
 if(!nama){toast('Pilih atau isi nama siswa');return}
 if(!d.tanggal){toast('Isi tanggal observasi');return}
 if(h.done<h.n){toast('Lengkapi semua aspek ('+h.done+' dari '+h.n+')');return}
 var penguji=String(d.penguji||'').trim()||S.user.nama;
 var payload=JSON.stringify({nis:String(d.nis||'').trim(),penguji:penguji,nilai:d.nilai,cat:d.cat,catatan:String(d.catatan||'').trim(),kode:OBU.meta.kode});
 var f={tipe:'ukk',guruId:gid,guru:nama.slice(0,120),mapel:OBU.meta.judul.slice(0,120),kelas:(KELAS[kelas]?kelas:Object.keys(KELAS)[0]),tanggal:d.tanggal,skor:h.nilai,kategori:h.hasil,payload:payload,pengamat:penguji.slice(0,120)};
 S.observasi=S.observasi||[];
 var rec=d.id?S.observasi.find(function(x){return x.id===d.id}):null;
 if(rec){Object.assign(rec,f);if(rec.r)rec.d=1}
 else S.observasi.push(Object.assign({id:uid(),ts:Date.now(),pengamatId:S.user.id},f));
 persist();OU.mode='list';OU.d=null;render();window.scrollTo(0,0);toast('Observasi tersimpan');
}
async function obuDelete(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||!obsBoleh(r))return;
 if(!(await uiConfirm('Hapus observasi UKK '+r.guru+' ('+obsTgl(r.tanggal)+')?\nTindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
 if(Cloud.on&&r.r){if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}if(!(await Cloud.remove('observasi',id)))return}
 S.observasi=S.observasi.filter(function(x){return x.id!==id});persist();OU.mode='list';OU.view=null;render();toast('Observasi dihapus');
}

/* ---- Ekspor ---- */
function obuPdf(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||r.tipe!=='ukk'||!needP())return;
 var p=obsPay(r),h=obuHitung(p.nilai),m=OBU.meta,doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 kop(doc,'Lembar Observasi Praktik - Uji Kompetensi Keahlian '+m.tahun);
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:50,fontStyle:'bold'}},body:[
  ['Satuan Pendidikan',m.satuan],['Konsentrasi Keahlian',m.konsentrasi],['Kode',m.kode],['Alokasi Waktu',m.waktu],['Judul Tugas',m.judul],
  ['Nama Siswa',r.guru],['NIS / Kelas',(p.nis||'-')+' / '+r.kelas],['Tanggal',obsTgl(r.tanggal)],['Penguji',p.penguji||r.pengamat||'-']]});
 var body=[];
 OBU.grup.forEach(function(g){
  body.push([{content:g.g,colSpan:4,styles:{fontStyle:'bold',fillColor:[232,240,235]}}]);
  g.items.forEach(function(it){var v=p.nilai[it.id];body.push([it.no,it.t+(it.d?'\n'+it.d:''),v===1?'Kompeten':v===0?'Belum Kompeten':'-',p.cat[it.id]||''])});
 });
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['No','Aspek yang diamati','Capaian','Keterangan']],body:body,columnStyles:{0:{cellWidth:10,halign:'center'},2:{cellWidth:28,halign:'center'}}});
 var y=doc.lastAutoTable.finalY+7,H=doc.internal.pageSize.getHeight();
 if(y>H-40){doc.addPage();y=22}
 doc.setFontSize(10.5).setTextColor(0).setFont('helvetica','bold').text('Kompeten '+h.kom+' dari '+h.n+' aspek   Nilai '+r.skor+'   Hasil: '+r.kategori+' (KKM '+S.kkm+')',14,y);doc.setFont('helvetica','normal');y+=8;
 var lines=doc.splitTextToSize(p.catatan||'-',180);
 if(y+6+lines.length*4.6>H-20){doc.addPage();y=22}
 doc.setFontSize(10).setFont('helvetica','bold').text('Catatan',14,y);doc.setFont('helvetica','normal').text(lines,14,y+5);y+=9+lines.length*4.6;
 ttd(doc,y+4,[['Siswa',r.guru],['Penguji',p.penguji||r.pengamat||'']]);
 foot(doc);doc.save('Observasi_UKK_'+slug(r.guru||'siswa')+'_'+r.tanggal+'.pdf');
}
function obuXls(){
 if(!needX())return;var L=obuVisible().slice().sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts});
 var head=['No','Tanggal','Nama siswa','NIS','Kelas','Penguji'].concat(OBU.flat.map(function(i){return i.no+'. '+i.t})).concat(['Jumlah kompeten','Nilai','Hasil','Catatan']);
 var aoa=[head].concat(L.map(function(r,i){var p=obsPay(r),h=obuHitung(p.nilai);
  return [i+1,r.tanggal,r.guru,p.nis||'',r.kelas,p.penguji||r.pengamat||''].concat(OBU.flat.map(function(it){var v=p.nilai[it.id];return v===1?'K':v===0?'BK':''})).concat([h.kom,r.skor,r.kategori,p.catatan||''])}));
 book([['Rekap Observasi UKK',aoa,head.map(function(x,i){return i===2?24:i<6?14:i<6+OBU.flat.length?10:i===6+OBU.flat.length+3?36:14})]],'Rekap_Observasi_UKK');
}

/* ---- Aksi ---- */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;if(a.indexOf('obu-')!==0)return;
 if(!can('observasi'))return;
 if(a==='obu-new'){OU.d=obuBaru();OU.mode='form';render();window.scrollTo(0,0)}
 else if(a==='obu-edit'){var r=(S.observasi||[]).find(function(x){return x.id===v});if(!r||r.tipe!=='ukk'||!obsBoleh(r))return;OU.d=obuDraftDari(r);OU.mode='form';render();window.scrollTo(0,0)}
 else if(a==='obu-view'){var r2=(S.observasi||[]).find(function(x){return x.id===v});if(!r2)return;OU.view=r2;OU.mode='view';render();window.scrollTo(0,0)}
 else if(a==='obu-back'){OU.mode='list';OU.view=null;render();window.scrollTo(0,0)}
 else if(a==='obu-cancel'){if(OU.d&&obuHitung(OU.d.nilai).done&&!uiOk('obucancel','Batalkan observasi?\nIsian yang belum disimpan akan hilang.',b,{ok:'Batalkan',cancel:'Kembali',danger:true}))return;OU.mode='list';OU.d=null;render();window.scrollTo(0,0)}
 else if(a==='obu-set'&&OU.d){var s=parseInt(v,10),card=b.closest('.item');OU.d.nilai[b.dataset.id]=s;card.dataset.s=s===1?4:1;$$('button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===s))});obuSync()}
 else if(a==='obu-save'&&OU.d)obuSave();
 else if(a==='obu-del')obuDelete(v);
 else if(a==='obu-pdf')obuPdf(v);
 else if(a==='obu-xls')obuXls();
});
document.addEventListener('input',function(e){
 var t=e.target;if(!OU.d||OU.mode!=='form')return;
 if(t.dataset&&t.dataset.obu&&t.tagName!=='SELECT')OU.d[t.dataset.obu]=t.value;
 else if(t.classList&&t.classList.contains('obu-cat'))OU.d.cat[t.dataset.id]=t.value;
});
document.addEventListener('change',function(e){
 var t=e.target;
 if(t.id==='obuq'){OU.q=t.value;render();return}
 if(!OU.d||OU.mode!=='form'||!t.dataset||!t.dataset.obu)return;
 OU.d[t.dataset.obu]=t.value;
 if(t.dataset.obu==='sel'){var u=S.users.find(function(x){return x.id===t.value});if(u&&u.kelas&&KELAS[u.kelas])OU.d.kelas=u.kelas;render()}
});

/* ---- Menu, tab, dan tombol kembali ---- */
var _viewKatU=viewKatalog;
viewKatalog=function(){
 if(S.tab==='observasi-ukk'&&can('observasi'))return viewObservasiUkk();
 return _viewKatU.apply(this,arguments);
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('observasi-ukk')<0)NAVTABS.push('observasi-ukk');
var _renderU=render;
render=function(){
 _renderU.apply(this,arguments);
 try{
  if(!S.user||!can('observasi'))return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="observasi-ukk"]'))return;
  var cur=V.mode==='list'?S.tab:'';
  var html='<button type="button" class="srow" data-act="menu" data-v="observasi-ukk"'+(cur==='observasi-ukk'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO['observasi-ukk'],22)+'</span><span class="st"><b>Observasi UKK</b><small>Lembar praktik Kompeten / Belum Kompeten</small></span>'+svg(ICO.chev,18)+'</button>';
  var ref=sb.querySelector('[data-v="observasi-siswa"]');
  if(ref)ref.insertAdjacentHTML('afterend',html);
  else{var chips=[].slice.call(sb.querySelectorAll('.chip')),sesi=chips.filter(function(c){return /Sesi/.test(c.textContent)})[0];if(sesi)sesi.insertAdjacentHTML('beforebegin',html);else sb.insertAdjacentHTML('beforeend',html)}
 }catch(err){}
};
window.addEventListener('load',function(){
 if(typeof bkBack!=='function')return;
 var b0=bkBack;
 bkBack=function(){
  if(S.user&&S.tab==='observasi-ukk'&&OU.mode!=='list'&&!document.querySelector('.ui-ov')){
   var c=document.querySelector('[data-act="obu-cancel"]');
   if(c){c.click();return}
   OU.mode='list';OU.d=null;OU.view=null;render();return;
  }
  return b0.apply(this,arguments);
 };
});
