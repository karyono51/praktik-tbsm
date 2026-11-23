/* lkpd-pandu.js: pembeda LKPD mode Latihan dan mode Ujian.
   1. Latihan berpemandu, Ujian mandiri: Latihan menampilkan kartu panduan dan angka acuan lewat tombol Bantuan (dibuka bertahap);
      Ujian tanpa angka acuan, wajib foto bukti pada semua komponen (opsional), langkah saksi disaksikan guru.
   2. Gerbang Latihan ke Ujian: Ujian terbuka setelah siswa mencapai KKM pada LKPD Latihan (1 kali atau 2 kali berturut-turut).
      Siswa yang belum kompeten pada Ujian harus mengulang gerbang (nilai latihan sesudah Ujian terakhir) sebelum mencoba lagi.
   3. Paket cepat di Pengaturan: Paket Latihan dan Paket Ujian mengisi semua opsi sekaligus (belum tersimpan sampai Simpan pengaturan).
   Pengaturan disimpan pada objek LKPD (gerbang, gKali, fotoUjian, pandu) lewat lkpd-mode.js. Tidak ada perubahan Appwrite. */
(function(){var st=document.createElement('style');st.textContent=
'.lkp-pandu{border-left:4px solid var(--ok,#1b7f3b);font-size:13.5px;line-height:1.5}.lkp-mandiri{border-left:4px solid var(--warn,#b8860b);font-size:13.5px;line-height:1.5}'+
'.lkp-pandu ul,.lkp-mandiri ul{margin:6px 0 0;padding-left:18px}.lkp-b{display:block;margin-top:4px}.lkp-b>summary{cursor:pointer;color:var(--accent);font-size:12.5px}'+
'.lkp-paket{display:grid;gap:6px}.job .pill{white-space:normal;max-width:100%}.lkp-sec{display:grid;gap:10px;border:1px solid var(--line,#ddd);border-radius:14px;padding:12px;min-width:0}.lkp-sec>h4{display:flex;gap:8px;align-items:center;margin:0;font-size:15px}.lkp-no{flex:none;width:22px;height:22px;border-radius:50%;background:var(--accent);color:var(--onc,#fff);display:inline-grid;place-items:center;font-size:12px;font-weight:700}.lkp-ring{background:var(--bg,#f4f7f4);border:1px solid var(--line,#ddd);border-radius:12px;padding:10px 12px;font-size:13.5px;line-height:1.5}.lkp-ring ul{margin:6px 0 0;padding-left:18px}';
document.head.appendChild(st)})();

function lkpKkm(){return Number(S.kkm)||75}
function lkpMods(){return typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES||[]}
function lkpFind(id){return lkpMods().find(function(x){return x.id===id})}

/* ---- Foto wajib: Ujian dengan opsi fotoUjian mewajibkan foto pada semua komponen pemeriksaan ---- */
function lkpFotoWajib(m){
 var base=Array.isArray(m.fotoWajib)?m.fotoWajib.filter(function(i){return m.checks[i]}):[],c=lkmCfg(m);
 if(c.mode==='ujian'&&c.fotoUjian)return m.checks.map(function(x,i){return i});
 return base;
}

/* ---- Gerbang Latihan ke Ujian ---- */
/* Status gerbang untuk siswa yang sedang masuk. null = tidak ada gerbang (atau LKPD latihan rujukan tidak tersedia). */
function lkpGate(m){
 var c=lkmCfg(m);if(c.mode!=='ujian'||!c.gerbang||c.gerbang===m.id)return null;
 var ref=lkpFind(c.gerbang);if(!ref||!lkmPub(ref))return null;
 var need=c.gKali===2?2:1,kkm=lkpKkm();
 var uj=lkcRecs(m,false).filter(function(x){return lkmModeOf(x)!=='latihan'}).sort(function(a,b){return a.ts-b.ts}),
  last=uj.length?uj[uj.length-1]:null;
 if(c.maxTry>0&&uj.length>=c.maxTry)return null; /* jatah Ujian habis: latihan tambahan tidak membuka percobaan baru */
 var /* Ujian terakhir belum kompeten: hanya latihan sesudahnya yang dihitung (remedial). */
  since=last&&lkNilai(last)<kkm?last.ts:0,
  la=lkcRecs(ref,false).filter(function(x){return lkmModeOf(x)==='latihan'&&x.ts>since}).sort(function(a,b){return a.ts-b.ts}),
  run=0;
 for(var i=la.length-1;i>=0;i--){if(lkNilai(la[i])>=kkm)run++;else break}
 return {ref:ref,need:need,run:Math.min(run,need),ok:run>=need,remedial:since>0,kkm:kkm,n:la.length,pernah:!!last};
}
function lkpGateLock(m){
 var g=lkpGate(m);if(!g||g.ok)return '';
 return (g.remedial?'Latih lagi dulu: ':'Ujian terbuka setelah ')+'latihan mencapai nilai '+g.kkm+(g.need>1?' dua kali berturut-turut':'')+' ('+g.run+'/'+g.need+')';
}
/* Tambahan kartu LKPD Ujian di daftar siswa: penanda gerbang dan tombol ke Latihan. */
function lkpCardExtra(m,c,uj){
 var g=lkpGate(m);if(!g)return null;
 var tags,acts='';
 if(g.ok)tags='<span class="pill ok">Siap ujian'+(g.remedial?' ulang':'')+'</span>';
 else{
  tags='<span class="pill warn">Latih lagi '+g.run+'/'+g.need+'</span>'+(g.remedial?'<span class="pill bad">Remedial</span>':'');
  acts='<button type="button" class="btn primary small" data-act="lkc-open" data-v="'+lkEsc(g.ref.id)+'">'+(g.remedial?'Latihan terarah (remedial)':'Buka latihan')+'</button>';
 }
 return {tags:tags,acts:acts};
}
function lkpStaffTag(m,c){
 if(c.mode!=='ujian'||!c.gerbang)return '';
 var r=lkpFind(c.gerbang);
 return '<span class="pill plain">Prasyarat: '+lkEsc(r?r.title:c.gerbang)+' ≥ KKM'+(c.gKali===2?' 2× berturut-turut':'')+'</span>';
}

/* ---- Panel Pengaturan: bagian bernomor yang mengikuti mode ---- */
function lkpSec(no,judul,sub,isi){
 return '<section class="lkp-sec"><h4><span class="lkp-no">'+no+'</span>'+judul+'</h4>'+(sub?'<p class="note">'+sub+'</p>':'')+isi+'</section>';
}
function lkpCek(nama,jdl,ket,on){
 return '<label class="lk-check"><input type="checkbox" data-lkm="'+nama+'"'+(on?' checked':'')+'><span><b>'+jdl+'</b><small>'+ket+'</small></span></label>';
}
/* Ringkasan efek untuk siswa, dihitung dari pilihan yang sedang diatur (belum tersimpan). */
function lkpRingkas(m,d){
 var li=[],r=lkpFind(d.gerbang),mx=parseInt(d.maxTry,10)||0,fw=Array.isArray(d.fotoWajib)?d.fotoWajib.length:0;
 if(d.mode==='latihan'){
  li.push('Boleh diulang tanpa batas; nilai <b>tidak masuk</b> Rekap nilai');
  li.push('Kunci dan pembahasan: <b>'+(d.showKey?'tampil':'tidak tampil')+'</b>');
  li.push('Panduan bertahap dan Bantuan angka acuan: <b>'+(d.pandu!==false?'aktif':'mati')+'</b>');
 }else{
  li.push('Kesempatan mengirim: <b>'+(mx?mx+' kali':'tidak terbatas')+'</b>; nilai <b>masuk</b> Rekap nilai dan dikoreksi guru');
  var h=[d.hideTeori&&'teori',d.hideLangkah&&'penjelasan langkah',d.hidePetunjuk&&'petunjuk komponen','angka acuan'].filter(Boolean);
  li.push('Disembunyikan: <b>'+h.join(', ')+'</b>');
  li.push('Foto bukti: <b>'+(d.fotoUjian?'wajib pada semua '+m.checks.length+' komponen':fw?'wajib pada '+fw+' komponen':'opsional')+'</b>');
  li.push('Prasyarat latihan: <b>'+(d.gerbang?(r?lkEsc(r.title):lkEsc(d.gerbang))+', KKM '+(+d.gKali===2?'2 kali berturut-turut':'1 kali'):'tidak ada')+'</b>');
 }
 li.push('Status: <b>'+(d.tampil?'tampil ke siswa':'draft (disembunyikan)')+'</b>'+((d.buka||d.tutup)?'; terjadwal':''));
 return '<ul>'+li.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>';
}
function lkpRingUpdate(){
 var box=document.getElementById&&document.getElementById('lkp-ring');if(!box||!LKM.d)return;
 var m=lkpFind(LKM.edit);if(m)box.innerHTML=lkpRingkas(m,LKM.d);
}
function lkpPaket(d){
 return '<div class="lkp-paket"><div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small" data-act="lkp-paket" data-v="latihan">Paket Latihan</button><button type="button" class="btn small" data-act="lkp-paket" data-v="ujian">Paket Ujian</button></div>'+
  '<p class="note">Mengisi semua aturan di bagian bawah sekaligus. Jadwal dan status tampil tidak diubah. Tersimpan setelah Simpan pengaturan.</p>'+
  '<details class="lkp-b"><summary>Isi paket</summary><p class="note"><b>Latihan:</b> tanpa batas kesempatan, kunci dan pembahasan tampil, panduan aktif, tanpa prasyarat. <b>Ujian:</b> 1 kesempatan, teori, penjelasan langkah, dan petunjuk disembunyikan, kunci tidak tampil, foto bukti wajib pada semua komponen.</p></details></div>';
}
function lkpAturanLatihan(d){
 return lkpCek('showKey','Tampilkan kunci dan pembahasan','Siswa bisa memeriksa jawaban soal di tab Evaluasi.',d.showKey)+
  lkpCek('pandu','Latihan berpemandu','Kartu panduan tampil, dan angka acuan di Lembar Kerja dibuka siswa lewat tombol Bantuan.',d.pandu!==false);
}
function lkpAturanUjian(d){
 var tries=[[0,'Tidak terbatas'],[1,'1 kali'],[2,'2 kali'],[3,'3 kali']].map(function(o){return '<option value="'+o[0]+'"'+(+d.maxTry===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('');
 return '<label class="f">Kesempatan mengirim<select data-lkm="maxTry">'+tries+'</select></label>'+
  '<span class="label">Isi yang disembunyikan</span>'+
  lkpCek('hideTeori','Teori ringkas','Siswa tidak melihat materi teori di tab Materi.',d.hideTeori)+
  lkpCek('hideLangkah','Penjelasan langkah prosedur','Hanya judul dan durasi langkah yang tampil.',d.hideLangkah)+
  lkpCek('hidePetunjuk','Petunjuk komponen di Lembar Kerja','Keterangan di bawah nama komponen disembunyikan.',d.hidePetunjuk)+
  '<p class="note">Angka acuan standar selalu disembunyikan saat Ujian. Soal evaluasi, K3, alat dan bahan tetap tampil. Pratinjau menampilkan versi siswa.</p>'+
  lkpCek('fotoUjian','Foto bukti wajib pada semua komponen','Siswa tidak bisa mengirim sebelum semua komponen pemeriksaan punya foto.',d.fotoUjian);
}
function lkpPrasyarat(m,d){
 var opts=lkpMods().filter(function(x){return x.id!==m.id&&x.kelas===m.kelas&&lkmCfg(x).mode==='latihan'}).map(function(x){return '<option value="'+lkEsc(x.id)+'"'+(d.gerbang===x.id?' selected':'')+'>'+lkEsc(x.title)+' ('+lkEsc(x.id)+')</option>'}).join('');
 return '<label class="f">LKPD Latihan prasyarat<select data-lkm="gerbang"><option value="">Tanpa prasyarat</option>'+opts+'</select></label>'+
  (d.gerbang?'<label class="f">Syarat nilai latihan (KKM '+lkpKkm()+')<select data-lkm="gKali"><option value="1"'+(+d.gKali!==2?' selected':'')+'>Mencapai KKM 1 kali</option><option value="2"'+(+d.gKali===2?' selected':'')+'>Mencapai KKM 2 kali berturut-turut</option></select></label><p class="note">Siswa yang belum kompeten pada Ujian harus lulus prasyarat lagi (nilai latihan sesudah Ujian terakhir) sebelum mengulang.</p>':'<p class="note">'+(opts?'Pilih LKPD Latihan sebagai prasyarat.':'Belum ada LKPD berstatus Latihan di kelas ini.')+'</p>')+
  '<div><button type="button" class="btn small" data-act="lkp-salin">Buat salinan Latihan dari LKPD ini</button></div>';
}
/* Label bawaan di dalam panel lama diganti judul bagian bernomor. */
function lkpTanpaLabel(h){return String(h||'').replace(/^<div><span class="label">[^<]*<\/span>/,'<div>')}
function lkpLayout(m,d){
 var n=0,no=function(){return ++n},uj=d.mode==='ujian',
  mode='<div><span class="label">Mode</span><div class="seg" role="group" aria-label="Mode LKPD"><button type="button" data-act="lkm-mode" data-v="latihan" aria-pressed="'+(d.mode==='latihan')+'">Latihan</button><button type="button" data-act="lkm-mode" data-v="ujian" aria-pressed="'+uj+'">Ujian</button></div></div>'+
  '<p class="note">'+(uj?'Ujian: nilai masuk Rekap nilai dan dikoreksi guru. Gunakan Paket Ujian untuk mengisi aturan standar.':'Latihan: siswa boleh mengulang tanpa batas. Nilai tidak masuk Rekap nilai.')+'</p>',
  h='<section class="card" id="lkm-panel"><div class="row sb"><h3 class="grow">Pengaturan: '+lkEsc(m.title)+'</h3><button type="button" class="btn small" data-act="lkm-cancel">Batal</button></div>'+
  '<div class="lkp-ring"><b>Ringkasan untuk siswa</b><div id="lkp-ring">'+lkpRingkas(m,d)+'</div></div>';
 h+=lkpSec(no(),'Paket dan mode','',lkpPaket(d)+lkpCek('tampil','Tampilkan ke siswa','Matikan untuk menyembunyikan LKPD (jadi draft).',d.tampil)+mode);
 h+=uj?lkpSec(no(),'Aturan Ujian','',lkpAturanUjian(d))+lkpSec(no(),'Prasyarat Latihan','Ujian baru terbuka setelah siswa lulus latihan. Berbeda dengan Gerbang masuk soal di dalam LKPD.',lkpPrasyarat(m,d))
  :lkpSec(no(),'Aturan Latihan','',lkpAturanLatihan(d));
 var jadwal='<div class="two"><label class="f">Dibuka (opsional)<input type="datetime-local" data-lkm="buka" value="'+lkEsc(d.buka)+'"></label><label class="f">Ditutup (opsional)<input type="datetime-local" data-lkm="tutup" value="'+lkEsc(d.tutup)+'"></label></div>'+
  '<div><button type="button" class="btn small" data-act="lkm-clear">Kosongkan jadwal</button></div>'+(typeof lkkPanel==='function'?lkpTanpaLabel(lkkPanel(m,d)):'');
 h+=lkpSec(no(),'Jadwal dan kunci pertemuan','',jadwal);
 h+=lkpSec(no(),'Foto bukti per komponen','Dipakai di Latihan maupun Ujian. Pada Ujian, opsi foto semua komponen di bagian Aturan Ujian menambah daftar ini.',lkpTanpaLabel(lkmFotoPanel(m,d)));
 h+=lkpSec(no(),'Terapkan dan simpan','',lkpCek('semua','Terapkan mode, kesempatan, dan pembahasan ke semua LKPD '+lkEsc(lkcKelasInfo(S.kelas).judul),'Status tampil, jadwal, dan prasyarat tidak ikut diubah.',d.semua)+
  '<div class="row"><button type="button" class="btn" data-act="lkm-cancel">Batal</button><button type="button" class="btn primary grow" data-act="lkm-save">Simpan pengaturan</button></div>');
 return h+'</section>';
}
function lkpSalinId(base){
 var b=String(base).replace(/-L\d*$/,'').slice(0,28),id=b+'-L',n=2;
 while(lkpFind(id)){id=b+'-L'+n;n++}
 return id;
}
function lkpSalin(){
 var src=lkpFind(LKM.edit);if(!src)return;
 var cp=lkSerialize(JSON.parse(JSON.stringify(src)));
 cp.id=lkpSalinId(src.id);cp.title=String(src.title).replace(/ \(Latihan\)$/,'').slice(0,168)+' (Latihan)';
 cp.mode='latihan';cp.maxTry=0;cp.showKey=true;cp.pandu=true;cp.fotoUjian=false;cp.kunci=false;
 delete cp.gerbang;delete cp.gKali;delete cp.buka;delete cp.tutup;delete cp.payload;
 cp.status='published';cp.active=true;
 lkModuleStore(cp);
 if(LKM.d){LKM.d.gerbang=cp.id;if(LKM.d.mode!=='ujian')LKM.d.mode='ujian'}
 render();toast('Salinan Latihan "'+cp.title+'" dibuat dan ditampilkan. Simpan pengaturan untuk memasang gerbang.');
 setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500);
}
function lkpTerapkanPaket(d,jenis){
 if(jenis==='latihan'){
  d.mode='latihan';d.maxTry=0;d.showKey=true;d.pandu=true;d.fotoUjian=false;d.gerbang='';d.gKali=1;
 }else{
  d.mode='ujian';d.maxTry=1;d.showKey=false;d.hideTeori=true;d.hideLangkah=true;d.hidePetunjuk=true;d.fotoUjian=true;if(!d.gKali)d.gKali=1;
 }
 return d;
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="lkp-"]');if(!b||!isStaff())return;
 e.stopPropagation();
 var a=b.dataset.act;
 if(a==='lkp-paket'&&LKM.d){lkpTerapkanPaket(LKM.d,b.dataset.v);render();toast((b.dataset.v==='latihan'?'Paket Latihan':'Paket Ujian')+' diterapkan. Periksa lalu Simpan pengaturan.')}
 else if(a==='lkp-salin')lkpSalin();
},true);

/* Dipasang setelah pendengar lkpd-mode.js, jadi LKM.d sudah diperbarui saat ini dijalankan. */
document.addEventListener('change',function(e){
 var t=e.target;if(!LKM.d||!t||!t.dataset)return;
 if(t.dataset.lkm==='gerbang'){render();return}
 if(t.dataset.lkm!==undefined||t.dataset.lkmFoto!==undefined)lkpRingUpdate();
});

/* ---- Tampilan siswa: Latihan berpemandu ---- */
function lkpPanduKartu(){
 return '<section class="card lkp-pandu"><b>Latihan berpemandu</b><ul><li>Coba isi sendiri dulu, lalu buka <b>Bantuan</b> bila buntu atau ingin mencocokkan angka.</li><li>Poin kritis tiap langkah dan petunjuk komponen tampil penuh. Gunakan sebagai pegangan.</li><li>Hasil latihan boleh diulang dan tidak masuk rekap nilai. Ujian nanti tanpa petunjuk dan angka acuan.</li></ul></section>';
}
function lkpPandu(h,c){
 try{
  var m=lkmCur();if(!m||typeof lk2Is!=='function'||!lk2Is(m)||c.pandu===false)return h;
  if(LK.tab==='kerja'&&h.indexOf('lk2-cek')>-1){
   h=h.replace(/<small class="lk-acuan">([\s\S]*?)<\/small>/g,'<small class="lk-acuan"><details class="lkp-b"><summary>Bantuan: lihat angka acuan</summary>$1</details></small>');
   var i=h.indexOf('<section class="card">');
   h=i>-1?h.slice(0,i)+lkpPanduKartu()+h.slice(i):lkpPanduKartu()+h;
  }
 }catch(e){}
 return h;
}

/* ---- Tampilan siswa: Ujian mandiri ---- */
function lkpMandiri(h,c){
 try{
  var m=lkmCur();if(!m)return h;
  if(LK.tab==='kerja'&&h.indexOf('lk2-cek')>-1){
   h=h.replace(/<small class="lk-acuan">[\s\S]*?<\/small>/g,'');
   var li=['Tanpa petunjuk dan angka acuan: cari angka standar di manual servis kendaraan, lalu isi kolom Standar manual.','Langkah bertanda <b>saksi guru</b> harus disaksikan guru. Panggil guru sebelum mengerjakannya.'];
   if(c.fotoUjian)li.push('Foto bukti wajib pada <b>semua</b> komponen pemeriksaan sebelum LKPD dikirim.');
   if(c.maxTry)li.push('Kesempatan mengirim '+c.maxTry+' kali.');
   var k='<section class="card lkp-mandiri"><b>Ujian mandiri</b><ul>'+li.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></section>',i=h.indexOf('<section class="card">');
   h=i>-1?h.slice(0,i)+k+h.slice(i):k+h;
  }
 }catch(e){}
 return h;
}
