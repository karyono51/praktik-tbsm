/* lkpd-v2-struktur.js: Edit LKPD v2 mengikuti form siswa. Berdiri sendiri: membungkus lkpd-editor.js dan lkpd-v2-editor.js tanpa mengubah berkasnya.
   Dimuat tepat setelah lkpd-v2-editor.js. Hanya berlaku untuk LKPD v2 (modul yang punya objek v2); LKPD lama tidak berubah.

   Urutan tab editor mengikuti form siswa: Info, lalu Materi (Tujuan & teori, Rencana pertemuan, Gerbang masuk, Alat & K3),
   Lembar Kerja (Langkah, Tabel data, Pemeriksaan, Syarat kirim), Evaluasi (Soal), dan Penilaian.

   1. Rencana pertemuan: judul, JP, menit, target praktik, kegiatan tiap pertemuan, kartu Lembar Kerja (judul, dipisah per kegiatan),
      latihan soal, nama kegiatan, serta kegiatan, menit, dan saksi guru tiap langkah. Total JP dan menit modul mengikuti pertemuan.
   2. Gerbang masuk: soal gerbang dipindah dari tab Soal ke tab sendiri (editornya tetap yang di lkpd-v2-editor.js).
   3. Tabel data: judul, kegiatan, label baris, baris, desimal, catatan, nama kolom; tambah tabel dari contoh dan hapus tabel.
      Kolom rumus (rata-rata, selisih) tetap karena dihitung otomatis.
   4. Pemeriksaan: kegiatan tiap komponen dan sumber hasil aktual otomatis dari tabel.
   5. Alat & K3: kelompok K3 (nama, urutan, butir mana masuk kelompok) dan butir yang diparaf guru (APD).
   6. Syarat kirim: ringkasan syarat, isian wajib siswa, dan komponen yang wajib foto.
   Jumlah dan urutan langkah, butir K3, dan komponen pemeriksaan tetap dikunci (terhubung ke indeks data siswa).
   Salinan kerja ada di d.S.v2s dan ditulis ke m.v2 (dan m.fotoWajib, m.duration) saat menyimpan. Tanpa perubahan, hasil simpan identik dengan aslinya.
   Bergantung pada: lkpd-editor.js (lke*), lkpd-v2-editor.js (lkv*). */
var LKS={
 BASE:LKE.TABS.slice(),
 TABS:[['info','Info'],['tujuan','Tujuan & teori'],['rencana','Rencana pertemuan'],['gerbang','Gerbang masuk'],['bahan','Alat & K3'],['langkah','Langkah'],['tabel','Tabel data'],['cek','Pemeriksaan'],['kirim','Syarat kirim'],['soal','Evaluasi'],['nilai','Penilaian']],
 GRP:{tujuan:'Materi',langkah:'Lembar Kerja',soal:'Evaluasi'},
 NEW:{rencana:1,gerbang:1,tabel:1,kirim:1}
};
(function(){var st=document.createElement('style');st.textContent=
'.lks-grp{flex:none;align-self:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);padding:0 2px 0 8px}'+
'.lks-sub{display:grid;gap:8px;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--bg)}.lks-sub h4{margin:0;font-size:14px}'+
'.lks-row{display:grid;grid-template-columns:1fr 34px;gap:8px;align-items:center}.lks-kol{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}'+
'.lks-hint{font-size:12.5px;color:var(--muted)}.lks-hint.warn{color:var(--warn)}';
document.head.appendChild(st)})();

/* ---------- Pembantu ---------- */
function lksCp(x,def){return JSON.parse(JSON.stringify(x==null?def:x))}
function lksN(v){var n=lkeNum(v);return isFinite(n)&&n>0?n:0}
function lksNum(v){return Number(v)}
/* Salinan kerja struktur v2: dibuat dari d.src bila belum ada (juga untuk draf lama yang dipulihkan) */
function lksV(d){
 var s=d.S;if(s.v2s)return s.v2s;
 var src=d.src||{},V=src.v2||{},n=(src.safety||[]).length,all=[],i;
 for(i=0;i<n;i++)all.push(i);
 s.v2s={pertemuan:lksCp(V.pertemuan,[]),langkah:lksCp(V.langkah,[]),kegiatan:lksCp(V.kegiatan,[]),
  k3grup:lksCp(V.k3grup,[{judul:'',i:all}]),apd:lksCp(V.apd,[]),cekK:lksCp(V.cekK,[]),cekAuto:lksCp(V.cekAuto,{}),
  tabel:lksCp(V.tabel,[]),foto:lksCp(src.fotoWajib,[])};
 return s.v2s;
}
function lksKegMenit(v,k){return v.langkah.reduce(function(t,l){if(lksNum(l.k)!==k)return t;var n=lkeNum(l.menit);return t+(n>0?n:0)},0)}
function lksPisah(p){return !!(p&&p.kartu&&p.kartu.per&&(p.kegiatan||[]).length>1)}
function lksJudulStep(t){return String(t||'').replace(/^Kegiatan \d+ · /,'')}
function lksTotals(v){
 var jp=0,mn=0;
 v.pertemuan.forEach(function(p){jp+=lksN(p.jp);mn+=lksN(p.menit)});
 return {jp:jp,menit:mn};
}
/* Total menit modul mengikuti pertemuan (alokasi waktu di tab Info ikut berubah) */
function lksSync(d){
 var v=lksV(d),t=lksTotals(v);
 if(t.menit>0)d.S.duration=t.menit;
}
function lksSetDeep(path,val){
 var o=LK.editor.S,a=path.split('.'),i;
 for(i=0;i<a.length-1;i++){
  var k=/^\d+$/.test(a[i])?+a[i]:a[i];
  if(o[k]==null||typeof o[k]!=='object')o[k]=/^\d+$/.test(a[i+1])?[]:{};
  o=o[k];
 }
 var l=a[a.length-1];o[/^\d+$/.test(l)?+l:l]=val;
}
function lksAda(a,x){return a.indexOf(x)>-1}
function lksIn(path,val,ph,num,label){
 return '<label class="f">'+label+'<input '+(num?'type="number" inputmode="numeric" min="0" ':'')+'data-lksp="'+path+'" value="'+esc(val==null?'':val)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>';
}
function lksSel(path,opts,cur,label,num){
 return '<label class="f">'+label+'<select data-lksp="'+path+'"'+(num?' data-lkst="n"':'')+'>'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(String(o[0])===String(cur)?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select></label>';
}
function lksChk(attrs,on,label,small){
 return '<label class="lk-check"><input type="checkbox" '+attrs+(on?' checked':'')+'><span><b>'+label+'</b>'+(small?'<small>'+small+'</small>':'')+'</span></label>';
}
function lksKegOpts(v,kosong){
 var o=kosong?[['','(tidak ada)']]:[];
 v.kegiatan.forEach(function(n,i){o.push([String(i+1),'Kegiatan '+(i+1)+(lkeT(n)?' · '+lkeT(n):'')])});
 return o;
}

/* ---------- Susun ke modul yang disimpan ---------- */
function lksCleanP(p){
 var c=lksCp(p,{}),ks=(p.kegiatan||[]).map(Number).filter(function(k){return k>=1}).sort(function(a,b){return a-b}).filter(function(k,i,a){return a.indexOf(k)===i});
 c.n=Number(p.n);c.jp=lksN(p.jp);c.menit=lksN(p.menit);c.judul=lkeT(p.judul);c.kegiatan=ks;
 var pr=lksN(p.praktik);if(pr>0)c.praktik=pr;else delete c.praktik;
 if(p.sembunyi)c.sembunyi=true;else delete c.sembunyi;
 var kt=p.kartu;
 if(kt&&(lkeT(kt.judul)||kt.per)){
  var k2={};if(lkeT(kt.judul))k2.judul=lkeT(kt.judul);
  if(kt.per&&ks.length>1){k2.per={};ks.forEach(function(k){var t=lkeT(kt.per[k]);if(t)k2.per[k]=t})}
  c.kartu=k2;
 }else delete c.kartu;
 if(Array.isArray(p.latihan))c.latihan=p.latihan.slice();
 return c;
}
function lksCleanT(t){
 var c=lksCp(t,{});
 c.k=Number(t.k);c.judul=lkeT(t.judul);c.dec=Number(t.dec);
 if(lkeT(t.cat))c.cat=lkeT(t.cat);else delete c.cat;
 if(t.labelBaris!==undefined)c.labelBaris=lkeT(t.labelBaris);
 c.baris=(t.baris||[]).map(lkeT);
 if(t.nolSekali)c.nolSekali=true;else delete c.nolSekali;
 c.kol=(t.kol||[]).map(function(k){var x=lksCp(k,{});x.l=lkeT(k.l);return x});
 return c;
}
(function(){
 var b0=lkeBuild;
 lkeBuild=function(d){
  var m=b0.apply(this,arguments);
  if(!lkvIs(d)||!m.v2||!d.S||!d.S.v2s)return m;
  var v=d.S.v2s,V=m.v2,src=d.src||{},t;
  V.pertemuan=v.pertemuan.map(lksCleanP);
  V.langkah=v.langkah.map(function(l){return {i:l.i,k:Number(l.k),saksi:!!l.saksi,menit:lksN(l.menit)}});
  V.kegiatan=v.kegiatan.map(lkeT);
  V.k3grup=v.k3grup.map(function(g){return {judul:lkeT(g.judul),i:g.i.map(Number).sort(function(a,b){return a-b})}});
  V.apd=v.apd.map(Number).filter(function(x,i,a){return a.indexOf(x)===i}).sort(function(a,b){return a-b});
  V.cekK=v.cekK.map(Number);
  if(src.v2.cekAuto!==undefined||Object.keys(v.cekAuto).length)V.cekAuto=lksCp(v.cekAuto,{});
  V.tabel=v.tabel.map(lksCleanT);
  t=lksTotals(v);
  V.jp=t.jp;if(t.menit>0)m.duration=t.menit;
  if(Array.isArray(src.fotoWajib)||v.foto.length){
   m.fotoWajib=v.foto.map(Number).filter(function(x,i,a){return x>=0&&x<m.checks.length&&a.indexOf(x)===i}).sort(function(a,b){return a-b});
  }
  return m;
 };
})();

/* ---------- Pemeriksaan ---------- */
function lksIssues(d){
 var v=lksV(d),s=d.S,I=[],nk=v.kegiatan.length,used={},k,nS=s.steps.length,nC=s.checks.length,nF=s.safety.length;
 function add(tab,msg){I.push({tab:tab,msg:msg})}
 v.pertemuan.forEach(function(p,i){
  var lb='Pertemuan '+(p.n||i+1),ks=(p.kegiatan||[]).map(Number),pr=lksN(p.praktik);
  if(!lkeT(p.judul))add('rencana',lb+': judul belum diisi');
  if(!(lksN(p.jp)>0))add('rencana',lb+': JP harus lebih dari 0');
  if(!(lksN(p.menit)>0))add('rencana',lb+': menit harus lebih dari 0');
  ks.forEach(function(k){
   if(!(k>=1&&k<=nk))add('rencana',lb+': kegiatan '+k+' tidak ada');
   else if(used[k])add('rencana','Kegiatan '+k+' dipakai di pertemuan '+used[k]+' dan '+(p.n||i+1)+'; satu kegiatan hanya boleh di satu pertemuan');
   else used[k]=p.n||i+1;
  });
  if(p.sembunyi&&ks.length)add('rencana',lb+': disembunyikan dari Lembar Kerja tetapi memuat kegiatan, jadi langkahnya tidak tampil');
  if(pr>0){
   var sm=ks.reduce(function(t,k){return t+lksKegMenit(v,k)},0);
   if(!ks.length)add('rencana',lb+': target praktik diisi tetapi tidak ada kegiatan');
   else if(pr!==sm)add('rencana',lb+': target praktik '+pr+' menit tidak sama dengan jumlah menit langkah ('+sm+')');
  }
 });
 for(k=1;k<=nk;k++){
  if(!lkeT(v.kegiatan[k-1]))add('rencana','Nama kegiatan '+k+' belum diisi');
  if(!used[k])add('rencana','Kegiatan '+k+' belum masuk pertemuan mana pun');
  if(!v.langkah.some(function(l){return lksNum(l.k)===k}))add('rencana','Kegiatan '+k+' belum punya langkah');
 }
 v.langkah.forEach(function(l,i){
  var kk=lksNum(l.k),mn=lkeT(l.menit)===''?0:lkeNum(l.menit);
  if(!(kk>=1&&kk<=nk))add('rencana','Langkah no. '+(i+1)+': pilih kegiatan');
  if(!(mn>=0))add('rencana','Langkah no. '+(i+1)+': menit harus angka 0 atau lebih');
 });
 /* K3 */
 var cnt={};
 v.k3grup.forEach(function(g,gi){
  if(!g.i.length)add('bahan','Kelompok K3 '+(gi+1)+' kosong: pindahkan butir ke sini atau hapus kelompoknya');
  if(v.k3grup.length>1&&!lkeT(g.judul))add('bahan','Kelompok K3 '+(gi+1)+': nama kelompok belum diisi');
  g.i.forEach(function(x){cnt[x]=(cnt[x]||0)+1});
 });
 for(k=0;k<nF;k++){if(cnt[k]!==1)add('bahan','Butir K3 no. '+(k+1)+(cnt[k]?' ada di lebih dari satu kelompok':' belum masuk kelompok mana pun, jadi tidak tampil di Materi'))}
 /* tabel */
 var ids={};
 v.tabel.forEach(function(t,i){
  var lb='Tabel '+(i+1);
  if(!lkeT(t.judul))add('tabel',lb+': judul belum diisi');
  if(!(lksNum(t.k)>=1&&lksNum(t.k)<=nk))add('tabel',lb+': pilih kegiatan');
  if(!(t.baris||[]).length)add('tabel',lb+': minimal satu baris');
  if(![0,1,2,3,4].some(function(x){return x===Number(t.dec)}))add('tabel',lb+': desimal harus 0 sampai 4');
  if(t.kol.some(function(c){return !lkeT(c.l)}))add('tabel',lb+': nama kolom ada yang kosong');
  if(ids[t.id])add('tabel',lb+': kode tabel kembar');ids[t.id]=1;
 });
 /* pemeriksaan */
 for(k=0;k<nC;k++){
  var kk=lksNum(v.cekK[k]);
  if(!(kk>=1&&kk<=nk))add('cek','Komponen no. '+(k+1)+': pilih kegiatan');
  var A=v.cekAuto[k];
  if(A&&!lksAutoOk(v,A))add('cek','Komponen no. '+(k+1)+': sumber otomatis dari tabel tidak ada lagi');
 }
 return I;
}
function lksAutoOk(v,A){
 var t=v.tabel.filter(function(x){return x.id===A.t})[0];
 if(!t)return false;
 return A.f==='nol'?t.kol.some(function(c){return c.k==='nol'}):t.kol.some(function(c){return c.k===A.f&&(c.t==='rata'||c.t==='selisih')});
}
(function(){
 var i0=lkeIssues;
 lkeIssues=function(d){
  var I=i0.apply(this,arguments);
  if(!lkvIs(d)||!d.S)return I;
  I.forEach(function(x){if(x.tab==='soal'&&/^Gerbang masuk/.test(x.msg))x.tab='gerbang'});
  return I.concat(lksIssues(d));
 };
})();

/* ---------- Tab dan kerangka ---------- */
(function(){
 var f0=lkEditorForm;
 lkEditorForm=function(d){
  var v2=lkvIs(d);
  LKE.TABS=v2?LKS.TABS:LKS.BASE;
  var h=f0.apply(this,arguments);
  if(!v2)return h;
  var extra=d.tab==='bahan'?lksK3Html(d):d.tab==='cek'?lksCekHtml(d):'';
  if(extra){var k=h.lastIndexOf('<div class="lke-nav">');if(k>-1)h=h.slice(0,k)+extra+h.slice(k)}
  return h;
 };
 var b0=lkeBar;
 lkeBar=function(d){
  var h=b0.apply(this,arguments);
  if(!lkvIs(d))return h;
  Object.keys(LKS.GRP).forEach(function(k){
   h=h.replace('<button type="button" role="tab" data-lke-a="tab" data-v="'+k+'"',function(s){return '<span class="lks-grp">'+LKS.GRP[k]+'</span>'+s});
  });
  return h;
 };
 var n0=lkeTabNilai;
 lkeTabNilai=function(d){
  if(lkvIs(d)&&LKS.NEW[d.tab])return lksTab(d);
  return n0.apply(this,arguments);
 };
 /* tab Evaluasi: soal gerbang pindah ke tab Gerbang masuk */
 var s0=lkeTabSoal;
 lkeTabSoal=function(d){
  if(!lkvIs(d)||!d.S||!d.S.gate)return s0.apply(this,arguments);
  var g=d.S.gate;d.S.gate=null;
  try{return s0.apply(this,arguments)}finally{d.S.gate=g}
 };
 var c0=lkeCalc;
 lkeCalc=function(d){
  if(lkvIs(d)&&d.S&&d.tab==='rencana')return lksCalc(d);
  var h=c0.apply(this,arguments);
  if(lkvIs(d)&&d.tab==='langkah')h=h.replace(/\.<\/span>$/,'. Kegiatan, menit, dan saksi guru tiap langkah diatur di tab Rencana pertemuan.</span>');
  return h;
 };
 var l0=lkeLive;
 lkeLive=function(){
  var d=LK.editor;
  if(d&&d.S&&lkvIs(d)&&d.S.v2s)lksSync(d);
  return l0.apply(this,arguments);
 };
})();
function lksTab(d){
 lksV(d);
 if(d.tab==='rencana')return lksTabRencana(d);
 if(d.tab==='gerbang')return d.S.gate?lkvGateHtml(d):'<section class="card"><p class="note">LKPD ini tidak punya soal gerbang masuk.</p></section>';
 if(d.tab==='tabel')return lksTabTabel(d);
 return lksTabKirim(d);
}

/* ---------- Rencana pertemuan ---------- */
function lksCalc(d){
 var v=lksV(d),t=lksTotals(v),h='<div class="row sb"><b>'+v.pertemuan.length+' pertemuan · '+t.jp+' JP · '+t.menit+' menit</b></div>';
 var rows=[];
 v.pertemuan.forEach(function(p,i){
  var ks=(p.kegiatan||[]).map(Number),pr=lksN(p.praktik);
  if(!ks.length)return;
  var sm=ks.reduce(function(a,k){return a+lksKegMenit(v,k)},0),ok=!pr||pr===sm;
  rows.push('<div class="row sb"><span>Pertemuan '+(p.n||i+1)+' · kegiatan '+ks.join(', ')+'</span><span class="pill '+(ok?'ok':'warn')+'">Langkah '+sm+' menit'+(pr?' · target '+pr:'')+'</span></div>');
 });
 return h+rows.join('');
}
function lksTabRencana(d){
 var v=lksV(d),s=d.S,h='';
 h+='<section class="card"><div><h3>Rencana pertemuan</h3><p class="note">Tampil di tab Materi siswa sebagai daftar lipat, dan menentukan kartu di Lembar Kerja. Total JP dan menit modul mengikuti pertemuan di bawah. Satu kegiatan hanya boleh di satu pertemuan.</p></div><div class="lke-calc" id="lke-calc">'+lksCalc(d)+'</div>';
 h+='<div class="lke-list">'+v.pertemuan.map(function(p,i){return lksPItem(d,v,p,i)}).join('')+'</div>';
 h+='<div><button type="button" class="btn small" data-lks-a="p-samakan-semua">Samakan semua target praktik dengan menit langkah</button></div></section>';
 h+='<section class="card"><div><h3>Nama kegiatan</h3><p class="note">Jumlah kegiatan tetap karena terhubung ke tabel dan komponen pemeriksaan. Namanya bisa diubah.</p></div><div class="lke-list">'+
  v.kegiatan.map(function(n,i){return lksIn('v2s.kegiatan.'+i,n,'Nama kegiatan',false,'Kegiatan '+(i+1)+' · '+lksKegMenit(v,i+1)+' menit')}).join('')+'</div></section>';
 h+='<section class="card"><div><h3>Langkah tiap kegiatan</h3><p class="note">Pilih kegiatan, isi menit, dan tandai langkah yang disaksikan guru. Judul dan isi langkah diubah di tab Langkah. Jumlah dan urutan langkah tetap.</p></div>';
 v.kegiatan.forEach(function(n,k0){
  var k=k0+1,ls=v.langkah.filter(function(l){return lksNum(l.k)===k});
  h+='<div class="lks-sub"><h4>Kegiatan '+k+(lkeT(n)?' · '+esc(lkeT(n)):'')+' · '+lksKegMenit(v,k)+' menit</h4>'+
   (ls.length?'<div class="lke-list">'+ls.map(function(l){return lksLRow(d,v,l)}).join('')+'</div>':'<p class="lks-hint warn">Belum ada langkah. Pindahkan langkah ke kegiatan ini dari kegiatan lain.</p>')+'</div>';
 });
 return h+'</section>';
}
function lksLRow(d,v,l){
 var i=l.i,st=d.S.steps[i],p='v2s.langkah.'+v.langkah.indexOf(l);
 return '<div class="lke-item"><span class="lke-n">'+(i+1)+'</span><div class="lke-f"><b>'+esc(lksJudulStep(st&&st.t)||'Langkah '+(i+1))+'</b>'+
  '<div class="two">'+lksSel(p+'.k',lksKegOpts(v),l.k,'Kegiatan',true)+lksIn(p+'.menit',l.menit,'0',true,'Menit')+'</div>'+
  lksChk('data-lksp="'+p+'.saksi"',!!l.saksi,'Saksi guru')+'</div><span></span></div>';
}
function lksPItem(d,v,p,i){
 var open=d.pi===i,ks=(p.kegiatan||[]).map(Number),sm=ks.reduce(function(a,k){return a+lksKegMenit(v,k)},0),pr=lksN(p.praktik),bad=pr>0&&pr!==sm;
 var head='<button type="button" class="lke-qh" data-lks-a="p-open" data-i="'+i+'" aria-expanded="'+open+'"><span class="pill'+(bad?' warn':' ok')+'">'+(p.n||i+1)+'</span><b>'+(lkeT(p.judul)?esc(p.judul):'<span class="muted">Judul belum diisi</span>')+'</b><span class="pill plain">'+lksN(p.jp)+' JP · '+lksN(p.menit)+' mnt</span></button>';
 if(!open)return '<div class="lke-q'+(bad?' err':'')+'">'+head+'</div>';
 var q='v2s.pertemuan.'+i,b='<div class="lke-qb">'+
  lksIn(q+'.judul',p.judul,'Judul pertemuan',false,'Judul pertemuan')+
  '<div class="two">'+lksIn(q+'.jp',p.jp,'4',true,'JP')+lksIn(q+'.menit',p.menit,'180',true,'Menit')+'</div>'+
  '<div class="two">'+lksIn(q+'.praktik',p.praktik,'kosong = tanpa target',true,'Target praktik (menit)')+
  '<div class="lke-f"><span class="label">Jumlah menit langkah</span><div class="row" style="gap:6px;align-items:center"><b>'+sm+'</b>'+(bad?'<button type="button" class="btn small" data-lks-a="p-samakan" data-i="'+i+'">Samakan</button>':'')+'</div></div></div>'+
  '<div><span class="label">Kegiatan di pertemuan ini</span></div>'+
  v.kegiatan.map(function(n,k0){return lksChk('data-lks-c="p-keg" data-i="'+i+'" data-k="'+(k0+1)+'"',lksAda(ks,k0+1),'Kegiatan '+(k0+1)+(lkeT(n)?' · '+esc(lkeT(n)):''))}).join('')+
  lksChk('data-lks-c="p-sembunyi" data-i="'+i+'"',!!p.sembunyi,'Tanpa kartu di Lembar Kerja','Untuk pertemuan teori, gerbang masuk, atau penilaian. Tidak boleh memuat kegiatan.');
 if(ks.length){
  b+=lksIn(q+'.kartu.judul',p.kartu&&p.kartu.judul,'Judul kartu di Lembar Kerja',false,'Judul kartu Lembar Kerja');
  if(ks.length>1){
   b+=lksChk('data-lks-c="p-pisah" data-i="'+i+'"',lksPisah(p),'Pisahkan kartu per kegiatan','Tiap kegiatan punya kartu, waktu aktual, dan kunci sendiri. Mengubahnya setelah siswa mengisi membuat waktu aktual lama tidak terbaca.');
   if(lksPisah(p))b+=ks.map(function(k){return lksIn(q+'.kartu.per.'+k,p.kartu.per[k],'Judul kartu kegiatan '+k,false,'Judul kartu kegiatan '+k)}).join('');
  }
 }
 var lat=d.S.quiz.filter(function(x){return x&&x.id});
 if(lat.length){
  b+='<div><span class="label">Latihan soal di pertemuan ini</span></div>'+lat.map(function(x){
   return lksChk('data-lks-c="p-lat" data-i="'+i+'" data-id="'+esc(x.id)+'"',lksAda(p.latihan||[],x.id),esc(x.id),esc(lkeT(x.q).slice(0,70)));
  }).join('');
 }
 b+='</div>';
 return '<div class="lke-q open'+(bad?' err':'')+'">'+head+b+'</div>';
}

/* ---------- Kelompok K3 dan paraf guru (tab Alat & K3) ---------- */
function lksK3Html(d){
 var v=lksV(d),s=d.S,g=v.k3grup,opts=g.map(function(x,gi){return [String(gi),lkeT(x.judul)||'Kelompok '+(gi+1)]});
 function gOf(i){var r=-1;g.forEach(function(x,gi){if(x.i.map(Number).indexOf(i)>-1)r=gi});return r}
 var h='<section class="card"><div><h3>Kelompok K3 dan paraf guru</h3><p class="note">Butir K3 tampil di tab Materi siswa per kelompok. Tiap butir harus masuk tepat satu kelompok. Butir yang bertanda paraf guru (APD) dihitung ke nilai bila guru memberi paraf di Detail pengumpulan. Teks butir diubah di daftar K3 di atas.</p></div>';
 h+='<div class="lke-list">'+g.map(function(x,gi){
  return '<div class="lks-sub"><div class="lks-row">'+lksIn('v2s.k3grup.'+gi+'.judul',x.judul,'Nama kelompok',false,'Kelompok '+(gi+1)+' · '+x.i.length+' butir')+
   '<div></div></div><div class="row" style="gap:6px;flex-wrap:wrap">'+
   '<button type="button" class="btn small" data-lks-a="g-up" data-i="'+gi+'"'+(gi===0?' disabled':'')+'>↑ Naik</button>'+
   '<button type="button" class="btn small" data-lks-a="g-down" data-i="'+gi+'"'+(gi===g.length-1?' disabled':'')+'>↓ Turun</button>'+
   '<button type="button" class="btn small danger" data-lks-a="g-del" data-i="'+gi+'">Hapus kelompok</button></div></div>';
 }).join('')+'</div><div><button type="button" class="btn small primary" data-lks-a="g-add">+ Kelompok</button></div>';
 h+='<div class="lke-list">'+s.safety.map(function(t,i){
  return '<div class="lks-sub"><b>'+(i+1)+'. '+esc(lkeT(t)||'(butir kosong)')+'</b>'+
   lksSel('x',gOf(i)<0?[['-1','(pilih kelompok)']].concat(opts):opts,gOf(i),'Kelompok',false).replace('data-lksp="x"','data-lks-c="k3-grup" data-i="'+i+'"')+
   lksChk('data-lks-c="k3-apd" data-i="'+i+'"',lksAda(v.apd.map(Number),i),'Paraf guru (APD)')+'</div>';
 }).join('')+'</div></section>';
 return h;
}

/* ---------- Penempatan komponen pemeriksaan (tab Pemeriksaan) ---------- */
function lksAutoOpts(v){
 var o=[['','Diisi siswa']];
 v.tabel.forEach(function(t){
  if(t.kol.some(function(c){return c.k==='nol'}))o.push([t.id+'|nol',(t.judul||t.id)+' · nol alat']);
  t.kol.forEach(function(c){if(c.t==='rata'||c.t==='selisih')o.push([t.id+'|'+c.k,(t.judul||t.id)+' · '+c.l])});
 });
 return o;
}
function lksCekHtml(d){
 var v=lksV(d),s=d.S,opts=lksAutoOpts(v);
 var h='<section class="card"><div><h3>Penempatan komponen di Lembar Kerja</h3><p class="note">Tiap komponen tampil di kartu kegiatannya, di bawah tabel kegiatan itu. Hasil aktual bisa terisi otomatis dari tabel data. Nama dan kriteria komponen diubah di atas. Jumlah dan urutannya tetap.</p></div><div class="lke-list">';
 h+=s.checks.map(function(c,i){
  var A=v.cekAuto[i],cur=A?A.t+'|'+A.f:'',has=opts.some(function(o){return o[0]===cur});
  var o2=has||!A?opts:opts.concat([[cur,'(sumber tidak ada lagi)']]);
  return '<div class="lks-sub"><b>'+(i+1)+'. '+esc(lkeT(c[0])||'(komponen kosong)')+'</b><div class="two">'+
   lksSel('v2s.cekK.'+i,lksKegOpts(v),v.cekK[i],'Kegiatan',true)+
   lksSel('x',o2,cur,'Hasil aktual',false).replace('data-lksp="x"','data-lks-c="cek-auto" data-i="'+i+'"')+'</div></div>';
 }).join('');
 return h+'</div></section>';
}

/* ---------- Tabel data ---------- */
var LKS_PRE={
 ukur3:{judul:'Pengukuran 3 kali (rata-rata)',baris:[''],nolSekali:true,kol:[{k:'benda',l:'Benda',t:'teks'},{k:'nol',l:'Nol alat',t:'num'},{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']},{k:'std',l:'Standar',t:'num'},{k:'status',l:'Status',t:'status'}]},
 selisih:{judul:'Terbesar dan terkecil (selisih)',baris:[''],kol:[{k:'benda',l:'Benda',t:'teks'},{k:'besar',l:'Terbesar',t:'num'},{k:'kecil',l:'Terkecil',t:'num'},{k:'selisih',l:'Selisih',t:'selisih',a:'besar',b:'kecil'},{k:'batas',l:'Batas',t:'num'},{k:'status',l:'Status',t:'status'}]}
};
var LKS_TIPE={teks:'teks',num:'angka',rata:'rata-rata otomatis',selisih:'selisih otomatis',status:'status'};
function lksTabTabel(d){
 var v=lksV(d),h='<section class="card"><div><h3>Tabel data</h3><p class="note">Tabel pengukuran di Lembar Kerja, di kartu kegiatannya. Kolom rata-rata dan selisih dihitung otomatis dari kolom angka, jadi rumusnya tetap. Baris hanya bisa ditambah atau dihapus dari bawah supaya isian siswa tidak bergeser.</p></div>';
 if(!v.tabel.length)h+='<p class="note">LKPD ini belum memakai tabel data. Siswa hanya mengisi Pemeriksaan dan bukti. Tambahkan tabel bila ada data ukur yang perlu dicatat.</p>';
 h+='<div class="lke-list">'+v.tabel.map(function(t,i){return lksTItem(d,v,t,i)}).join('')+'</div>';
 h+='<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small primary" data-lks-a="t-add" data-v="ukur3">+ Tabel ukur 3 kali</button><button type="button" class="btn small primary" data-lks-a="t-add" data-v="selisih">+ Tabel terbesar dan terkecil</button></div></section>';
 return h;
}
function lksTItem(d,v,t,i){
 var open=d.ti===i,q='v2s.tabel.'+i,bad=!lkeT(t.judul);
 var head='<button type="button" class="lke-qh" data-lks-a="t-open" data-i="'+i+'" aria-expanded="'+open+'"><span class="pill'+(bad?' warn':' ok')+'">'+(i+1)+'</span><b>'+(lkeT(t.judul)?esc(t.judul):'<span class="muted">Judul belum diisi</span>')+'</b><span class="pill plain">K'+esc(t.k)+' · '+(t.baris||[]).length+' baris</span></button>';
 if(!open)return '<div class="lke-q'+(bad?' err':'')+'">'+head+'</div>';
 var hasNol=t.kol.some(function(c){return c.k==='nol'});
 var b='<div class="lke-qb">'+lksIn(q+'.judul',t.judul,'Judul tabel',false,'Judul tabel')+
  '<div class="two">'+lksSel(q+'.k',lksKegOpts(v),t.k,'Kegiatan',true)+lksSel(q+'.dec',[[0,'0'],[1,'1'],[2,'2'],[3,'3'],[4,'4']],t.dec,'Desimal hasil hitung',true)+'</div>'+
  lksIn(q+'.labelBaris',t.labelBaris,'kosong = tanpa kolom label baris',false,'Judul kolom label baris')+
  '<div><span class="label">Baris</span></div><div class="lke-list">'+(t.baris||[]).map(function(r,j,a){
   return '<div class="lks-row"><input data-lksp="'+q+'.baris.'+j+'" value="'+esc(r)+'" placeholder="Label baris '+(j+1)+'" aria-label="Label baris '+(j+1)+'">'+
    (j===a.length-1?'<button type="button" class="lke-ic del" data-lks-a="t-row-del" data-i="'+i+'" aria-label="Hapus baris terakhir"'+(a.length<=1?' disabled':'')+'>✕</button>':'<span></span>')+'</div>';
  }).join('')+'</div><div><button type="button" class="btn small" data-lks-a="t-row-add" data-i="'+i+'">+ Baris</button></div>'+
  (hasNol?lksChk('data-lksp="'+q+'.nolSekali"',!!t.nolSekali,'Nol alat dicek sekali di awal','Siswa mengisi nol alat satu kali untuk seluruh baris; rata-rata sudah dikurangi nol alat.'):'')+
  '<label class="f">Catatan di bawah tabel (opsional)<textarea rows="3" data-lksp="'+q+'.cat" placeholder="Petunjuk mengisi tabel">'+esc(t.cat||'')+'</textarea></label>'+
  '<div><span class="label">Kolom</span></div><div class="lke-list">'+t.kol.map(function(c,j){
   return '<div class="lks-kol"><input data-lksp="'+q+'.kol.'+j+'.l" value="'+esc(c.l)+'" placeholder="Nama kolom" aria-label="Nama kolom '+(j+1)+'"><span class="pill plain">'+esc(LKS_TIPE[c.t]||c.t)+'</span></div>';
  }).join('')+'</div>'+
  '<div class="row" style="gap:6px"><button type="button" class="btn small danger" data-lks-a="t-del" data-i="'+i+'">Hapus tabel</button></div></div>';
 return '<div class="lke-q open'+(bad?' err':'')+'">'+head+b+'</div>';
}

/* ---------- Syarat kirim ---------- */
function lksTabKirim(d){
 var v=lksV(d),s=d.S,kkm=typeof lk2KkmGerbang==='function'?lk2KkmGerbang():75,gate=(s.gate||[]).length;
 var h='<section class="card"><div><h3>Syarat kirim</h3><p class="note">Siswa baru bisa menekan Kirim LKPD bila semua syarat ini terpenuhi.</p></div><ul class="plain">'+
  '<li><b>Gerbang masuk lulus</b>: nilai gerbang minimal '+kkm+' dari 100'+(gate?' ('+gate+' soal)':'')+'. Diatur di tab Gerbang masuk.</li>'+
  '<li><b>Semua butir K3 dicentang</b>: '+s.safety.length+' butir dalam '+v.k3grup.length+' kelompok. Diatur di tab Alat &amp; K3.</li>'+
  '<li><b>Pemeriksaan dan bukti</b>: minimal satu komponen berisi hasil aktual dan status.</li></ul>'+
  '<p class="lks-hint">Tiga syarat di atas berlaku untuk semua LKPD v2 dan tidak bisa dimatikan. Syarat tambahan ada di bawah.</p></section>';
 h+='<section class="card"><div><h3>Isian wajib siswa</h3><p class="note">Siswa tidak bisa mengirim sebelum bagian yang dicentang terisi. Pengaturan yang sama ada di tab Penilaian.</p></div>'+
  LKE.VAL.map(function(k){return '<label class="lk-check"><input type="checkbox" data-lke="val.'+k[0]+'"'+(s.val[k[0]]?' checked':'')+'><span><b>'+k[1]+'</b></span></label>'}).join('')+'</section>';
 h+='<section class="card"><div><h3>Foto bukti wajib</h3><p class="note">Komponen yang dicentang harus punya foto sebelum siswa bisa mengirim.</p></div>'+
  s.checks.map(function(c,i){return lksChk('data-lks-c="foto" data-i="'+i+'"',lksAda(v.foto.map(Number),i),(i+1)+'. '+esc(lkeT(c[0])||'(komponen kosong)'))}).join('')+
  '<p class="lks-hint">'+v.foto.length+' dari '+s.checks.length+' komponen wajib foto.</p></section>';
 return h;
}

/* ---------- Aksi ---------- */
function lksMoveK(v,k,to){
 v.pertemuan.forEach(function(p){p.kegiatan=(p.kegiatan||[]).map(Number).filter(function(x){return x!==k})});
 if(to){var t=to.kegiatan=(to.kegiatan||[]).map(Number);t.push(k);t.sort(function(a,b){return a-b})}
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-lks-a]');if(!b||b.disabled)return;
 var d=LK.editor;if(!d||!d.S||!lkvIs(d)||!isStaff())return;
 e.stopPropagation();
 var v=lksV(d),a=b.dataset.lksA,i=+b.dataset.i,j=+b.dataset.j,vv=b.dataset.v,p,t;
 if(a==='p-open'){d.pi=d.pi===i?-1:i;lkeRe()}
 else if(a==='t-open'){d.ti=d.ti===i?-1:i;lkeRe()}
 else if(a==='p-samakan'){
  p=v.pertemuan[i];if(!p)return;
  p.praktik=(p.kegiatan||[]).map(Number).reduce(function(s,k){return s+lksKegMenit(v,k)},0)||'';lkeRe();
 }
 else if(a==='p-samakan-semua'){
  v.pertemuan.forEach(function(q){var ks=(q.kegiatan||[]).map(Number);if(ks.length)q.praktik=ks.reduce(function(s,k){return s+lksKegMenit(v,k)},0)});
  lkeRe();toast('Target praktik disamakan dengan menit langkah');
 }
 else if(a==='g-add'){v.k3grup.push({judul:'',i:[]});lkeRe()}
 else if(a==='g-up'||a==='g-down'){lkeMove(v.k3grup,i,a==='g-up'?i-1:i+1);lkeRe()}
 else if(a==='g-del'){
  if(v.k3grup.length<=1){toast('Minimal satu kelompok K3');return}
  if(v.k3grup[i].i.length){toast('Pindahkan dulu butir di kelompok ini ke kelompok lain');return}
  v.k3grup.splice(i,1);lkeRe();
 }
 else if(a==='t-add'){
  var pre=lksCp(LKS_PRE[vv],{}),n=1,ids=v.tabel.map(function(x){return x.id});
  while(lksAda(ids,'T'+n))n++;
  pre.id='T'+n;pre.k=1;pre.dec=2;pre.cat='';pre.labelBaris='';
  v.tabel.push(pre);d.ti=v.tabel.length-1;lkeRe();
 }
 else if(a==='t-del'){
  t=v.tabel[i];if(!t)return;
  uiConfirm('Hapus tabel "'+(lkeT(t.judul)||t.id)+'"? Isian siswa pada tabel ini tidak akan terbaca lagi.',{ok:'Hapus',danger:true}).then(function(ok){
   if(!ok||LK.editor!==d)return;
   Object.keys(v.cekAuto).forEach(function(k){if(v.cekAuto[k]&&v.cekAuto[k].t===t.id)delete v.cekAuto[k]});
   v.tabel.splice(i,1);d.ti=-1;lkeRe();
  });
 }
 else if(a==='t-row-add'){t=v.tabel[i];if(t){t.baris.push('');lkeRe()}}
 else if(a==='t-row-del'){t=v.tabel[i];if(t&&t.baris.length>1){t.baris.pop();lkeRe()}}
},true);

/* Isian bertaut jalur: teks dan angka (input), pilihan dan centang (change) */
document.addEventListener('input',function(e){
 var t=e.target,p=t.dataset&&t.dataset.lksp;
 if(!p||!LK.editor||!LK.editor.S||t.type==='checkbox'||t.tagName==='SELECT')return;
 lksSetDeep(p,t.value);lkeLive();
});
document.addEventListener('change',function(e){
 var t=e.target,ds=t.dataset||{},d=LK.editor;
 if(!d||!d.S||!lkvIs(d))return;
 var v=lksV(d),i=+ds.i,p;
 if(ds.lksp&&(t.type==='checkbox'||t.tagName==='SELECT')){
  var val=t.type==='checkbox'?t.checked:(ds.lkst==='n'?Number(t.value):t.value);
  lksSetDeep(ds.lksp,val);
  var m=/^v2s\.langkah\.(\d+)\.k$/.exec(ds.lksp);
  if(m){var l=v.langkah[+m[1]],st=d.S.steps[l.i];if(st&&/^Kegiatan \d+ · /.test(st.t))st.t=st.t.replace(/^Kegiatan \d+ · /,'Kegiatan '+val+' · ')}
  lksSync(d);lkeRe();return;
 }
 var c=ds.lksC;if(!c)return;
 if(c==='p-keg'){
  p=v.pertemuan[i];var k=+ds.k;
  if(t.checked)lksMoveK(v,k,p);else lksMoveK(v,k,null);
  if(p&&lksPisah(p)&&p.kegiatan.length<2)delete p.kartu.per;
  lkeRe();
 }
 else if(c==='p-sembunyi'){v.pertemuan[i].sembunyi=t.checked;lkeRe()}
 else if(c==='p-pisah'){
  p=v.pertemuan[i];if(!p.kartu)p.kartu={};
  if(t.checked){p.kartu.per={};(p.kegiatan||[]).forEach(function(k){p.kartu.per[k]='Kegiatan '+k+' '+(lkeT(v.kegiatan[k-1]))})}
  else delete p.kartu.per;
  lkeRe();
 }
 else if(c==='p-lat'){
  p=v.pertemuan[i];var a=(p.latihan||[]).slice(),at=a.indexOf(ds.id);
  if(t.checked&&at<0)a.push(ds.id);else if(!t.checked&&at>-1)a.splice(at,1);
  p.latihan=a;lkeRe();
 }
 else if(c==='k3-grup'){
  var g=+t.value;
  v.k3grup.forEach(function(x){x.i=x.i.map(Number).filter(function(y){return y!==i})});
  if(v.k3grup[g]){v.k3grup[g].i.push(i);v.k3grup[g].i.sort(function(a,b){return a-b})}
  lkeRe();
 }
 else if(c==='k3-apd'){
  var ap=v.apd.map(Number).filter(function(y){return y!==i});
  if(t.checked)ap.push(i);
  v.apd=ap.sort(function(a,b){return a-b});lkeRe();
 }
 else if(c==='cek-auto'){
  if(!t.value)delete v.cekAuto[i];
  else{var x=t.value.split('|');v.cekAuto[i]={t:x[0],f:x[1]}}
  lkeRe();
 }
 else if(c==='foto'){
  var ft=v.foto.map(Number).filter(function(y){return y!==i});
  if(t.checked)ft.push(i);
  v.foto=ft.sort(function(a,b){return a-b});lkeRe();
 }
});

/* Salinan kerja ikut dibuat saat editor v2 dibuka (supaya status "berubah" dan draf akurat) */
(function(){
 var i0=lkeInit;
 lkeInit=function(d){
  var had=!!d.S,s=i0.apply(this,arguments);
  if(!had&&lkvIs(d)&&!s.v2s){
   lksV(d);d.snap=JSON.stringify(s);d.pi=-1;d.ti=-1;
   try{
    var raw=JSON.parse(localStorage.getItem(LKE.DKEY)||'null'),k=d.id||'(baru)';
    d.rec=(raw&&raw.k===k&&raw.S&&JSON.stringify(raw.S)!==d.snap&&Date.now()-raw.ts<14*864e5)?raw:null;
   }catch(e){}
  }
  return s;
 };
})();
