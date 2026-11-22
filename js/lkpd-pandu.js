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
'.lkp-paket{display:grid;gap:6px;border:1px dashed var(--line,#ccc);border-radius:12px;padding:10px}.lkp-gate{display:grid;gap:8px;border-top:1px solid var(--line,#ddd);padding-top:10px}';
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
  last=uj.length?uj[uj.length-1]:null,
  /* Ujian terakhir belum kompeten: hanya latihan sesudahnya yang dihitung (remedial). */
  since=last&&lkNilai(last)<kkm?last.ts:0,
  la=lkcRecs(ref,false).filter(function(x){return lkmModeOf(x)==='latihan'&&x.ts>since}).sort(function(a,b){return a.ts-b.ts}),
  run=0;
 for(var i=la.length-1;i>=0;i--){if(lkNilai(la[i])>=kkm)run++;else break}
 return {ref:ref,need:need,run:Math.min(run,need),ok:run>=need,remedial:since>0,kkm:kkm,n:la.length,pernah:!!last};
}
function lkpGateLock(m){
 var g=lkpGate(m);if(!g||g.ok)return '';
 return (g.remedial?'Latih lagi dulu: ':'Ujian terbuka setelah ')+'latihan "'+g.ref.title+'" mencapai nilai '+g.kkm+(g.need>1?' dua kali berturut-turut':'')+' ('+g.run+'/'+g.need+')';
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
 return '<span class="pill plain">Gerbang: '+lkEsc(r?r.title:c.gerbang)+' ≥ KKM'+(c.gKali===2?' 2× berturut-turut':'')+'</span>';
}

/* ---- Paket cepat dan panel gerbang di Pengaturan ---- */
function lkpPaket(d){
 return '<div class="lkp-paket"><span class="label">Paket cepat</span><div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small" data-act="lkp-paket" data-v="latihan">Paket Latihan</button><button type="button" class="btn small" data-act="lkp-paket" data-v="ujian">Paket Ujian</button></div>'+
  '<p class="note"><b>Paket Latihan:</b> boleh diulang tanpa batas, kunci dan pembahasan tampil, panduan bertahap aktif, tanpa gerbang. <b>Paket Ujian:</b> 1 kesempatan, teori, penjelasan langkah, dan petunjuk disembunyikan, kunci tidak tampil, foto bukti wajib pada semua komponen. Jadwal dan status tampil tidak diubah. Paket baru tersimpan setelah Simpan pengaturan.</p></div>';
}
function lkpPanel(m,d){
 if(d.mode==='latihan')return '<label class="lk-check"><input type="checkbox" data-lkm="pandu"'+(d.pandu!==false?' checked':'')+'><span><b>Latihan berpemandu</b><small>Kartu panduan tampil, dan angka acuan di Lembar Kerja dibuka siswa lewat tombol Bantuan.</small></span></label>';
 var opts=lkpMods().filter(function(x){return x.id!==m.id&&x.kelas===m.kelas&&lkmCfg(x).mode==='latihan'}).map(function(x){return '<option value="'+lkEsc(x.id)+'"'+(d.gerbang===x.id?' selected':'')+'>'+lkEsc(x.title)+' ('+lkEsc(x.id)+')</option>'}).join('');
 return '<div class="lkp-gate"><span class="label">Gerbang Latihan ke Ujian</span>'+
  '<label class="f">Ujian baru terbuka setelah siswa lulus latihan<select data-lkm="gerbang"><option value="">Tanpa gerbang</option>'+opts+'</select></label>'+
  (d.gerbang?'<label class="f">Syarat nilai latihan (KKM '+lkpKkm()+')<select data-lkm="gKali"><option value="1"'+(+d.gKali!==2?' selected':'')+'>Mencapai KKM 1 kali</option><option value="2"'+(+d.gKali===2?' selected':'')+'>Mencapai KKM 2 kali berturut-turut</option></select></label><p class="note">Siswa yang belum kompeten pada Ujian harus lulus gerbang lagi (nilai latihan sesudah Ujian terakhir) sebelum mengulang.</p>':'<p class="note">'+(opts?'Pilih LKPD Latihan sebagai prasyarat.':'Belum ada LKPD berstatus Latihan di kelas ini.')+' Tombol di bawah membuat salinan Latihan dari LKPD ini.</p>')+
  '<div><button type="button" class="btn small" data-act="lkp-salin">Buat salinan Latihan dari LKPD ini</button></div></div>'+
  '<label class="lk-check"><input type="checkbox" data-lkm="fotoUjian"'+(d.fotoUjian?' checked':'')+'><span><b>Foto bukti wajib pada semua komponen (Ujian)</b><small>Siswa tidak bisa mengirim sebelum semua komponen pemeriksaan punya foto. Angka acuan standar selalu disembunyikan saat Ujian.</small></span></label>';
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

/* ---- Tampilan siswa: Latihan berpemandu ---- */
function lkpPanduKartu(){
 return '<section class="card lkp-pandu"><b>Latihan berpemandu</b><ul><li>Coba isi sendiri dulu, lalu buka <b>Bantuan</b> bila buntu atau ingin mencocokkan angka.</li><li>Poin kritis tiap langkah dan petunjuk komponen tampil penuh. Gunakan sebagai pegangan.</li><li>Hasil latihan boleh diulang dan tidak masuk rekap nilai. Ujian nanti tanpa petunjuk dan angka acuan.</li></ul></section>';
}
function lkpPandu(h,c){
 try{
  var m=lkmCur();if(!m||typeof lk2Is!=='function'||!lk2Is(m)||c.pandu===false)return h;
  if(LK.tab==='kerja'){
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
  if(LK.tab==='kerja'){
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
