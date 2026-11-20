/* observasi-v2.js: Observasi LKPD Praktik v2 (aditif). Dimuat tepat setelah observasi.js.
   Tetap memakai tipe 'siswa' dan koleksi `observasi` yang sama; versi ditandai payload.v=2 dan payload.mod (ID modul LKPD v2).
   Rubrik, indikator, dan panduan diambil dari modul LKPD v2 (m.v2.obs), jadi tiap LKPD v2 membawa rubriknya sendiri.
   Skor aspek disimpan di payload.nilai (kunci = id aspek, nilai 1–4) dan indikator kompeten sebagai i0..iN (1 = tercapai),
   sehingga pemilihan banyak siswa, simpan, ubah, dan sinkronisasi memakai alur formulir lama.
   Nilai = jumlah(skor ÷ 4 × bobot). Kompeten bila semua indikator tercentang, semua aspek terisi, dan aspek ber-stop tidak bernilai 1.
   Formulir lama dan datanya tidak diubah; PDF dan Excel untuk catatan v2 belum tersedia (gunakan Cetak). */
(function(){var st=document.createElement('style');st.textContent=
'.ob2-opt{display:flex;gap:8px;align-items:flex-start;width:100%;text-align:left;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.35}'+
'.ob2-opt b{flex:none;min-width:18px}.ob2-opt[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--onc)}'+
'.ob2-stop{border-left:4px solid var(--bad,#b3261e);font-size:13.5px}.ob2-card{display:grid;gap:6px}.ob2-ind{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line)}'+
'.ob2-ind input{width:20px;height:20px;flex:none;margin-top:2px;accent-color:var(--accent)}.ob2-ind small{display:block;color:var(--muted)}';
document.head.appendChild(st)})();

/* ---------- Definisi dan hitungan ---------- */
function ob2Mods(){return (typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES||[]).filter(function(m){return m.v2&&m.v2.obs&&m.v2.obs.aspek&&m.v2.obs.aspek.length})}
function ob2Mod(id){return ob2Mods().find(function(m){return m.id===id})||null}
function ob2Hitung(nl,O){
 nl=nl||{};var done=0,sum=0;
 O.aspek.forEach(function(a){var v=+nl[a.id];if(v>=1&&v<=4){done++;sum+=v/4*a.b}});
 var kom=O.indikator.filter(function(x,i){return +nl['i'+i]===1}).length,
  stop=O.aspek.some(function(a){return a.stop&&+nl[a.id]===1}),lengkap=done===O.aspek.length;
 return {done:done,n:O.aspek.length,nilai:Math.round(sum),kom:kom,nKom:O.indikator.length,stop:stop,lengkap:lengkap,kompeten:lengkap&&kom===O.indikator.length&&!stop};
}
function ob2Kat(h){return h.stop?'Kurang':obsKat(h.nilai/25)}

/* ---------- Tampilan penilaian ---------- */
function ob2Chips(d,O){
 var R=obsRoster(d);
 return '<div class="obs-chips" role="group" aria-label="Pilih siswa yang dinilai">'+d.pilih.map(function(k){
  var s=R[k]||{nama:'?'},h=ob2Hitung(k===d.cur?d.nilai:(d.per[k]||{}).nilai,O);
  return '<button type="button" class="obs-chip" data-act="ob-pick" data-v="'+esc(k)+'" data-full="'+(h.lengkap?1:0)+'" aria-pressed="'+(k===d.cur)+'">'+esc(String(s.nama).split(/\s+/).slice(0,2).join(' '))+' <small class="cn">'+h.done+'/'+h.n+'</small></button>';
 }).join('')+'</div>';
}
function ob2SumHtml(d,O){
 var h=ob2Hitung(d.nilai,O);
 return '<div class="row sb"><span class="note">Aspek terisi</span><b class="mono">'+h.done+' / '+h.n+'</b></div>'+
  '<div class="row sb"><span class="note">Nilai · kategori</span><b class="mono">'+(h.done?h.nilai+' · '+esc(ob2Kat(h)):'-')+'</b></div>'+
  '<div class="row sb"><span class="note">Indikator kompeten</span><b class="mono">'+h.kom+' / '+h.nKom+'</b></div>'+
  '<div class="row sb"><span class="note">Keputusan</span><b class="mono">'+(h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':h.lengkap?'Belum kompeten':'-')+'</b></div>';
}
function ob2StuHtml(d){
 var m=ob2Mod(d.v2);
 var sel='<div class="card ob2-card"><div class="row sb"><b>Formulir v2</b>'+(d.id?'':'<button type="button" class="btn small" data-act="ob2-off">Pakai formulir lama</button>')+'</div>'+
  '<label class="f">LKPD v2<select data-ob2mod'+(d.id?' disabled':'')+'>'+ob2Mods().map(function(x){return '<option value="'+esc(x.id)+'"'+(x.id===d.v2?' selected':'')+'>'+esc(x.id+' · '+x.title)+'</option>'}).join('')+'</select></label></div>';
 if(!m)return sel+'<div class="card"><p class="muted">LKPD v2 tidak ditemukan. Pilih modul lain.</p></div>';
 if(!d.pilih.length)return sel+'<div class="card"><p class="muted">Pilih minimal satu siswa untuk mulai menilai.</p></div>';
 obsEnsure(d);
 var O=m.v2.obs,R=obsRoster(d),cs=R[d.cur]||{nama:'-',kelas:''},idx=d.pilih.indexOf(d.cur),multi=d.pilih.length>1;
 var guide='<details class="card"><summary><b>Yang diamati dan kesalahan umum</b></summary>'+O.panduan.map(function(g){return '<p><b>'+esc(g.k)+'</b><br>Yang diamati: '+esc(g.lihat)+'<br>Kesalahan umum: '+esc(g.salah)+'</p>'}).join('')+'</details>';
 var aspek=O.aspek.map(function(a,n){
  var v=+d.nilai[a.id]||0;
  return '<div class="card ob2-card" data-a="'+esc(a.id)+'"><b>'+(n+1)+'. '+esc(a.n)+' <span class="pill plain mono">'+a.b+'%</span></b>'+
   [4,3,2,1].map(function(s){return '<button type="button" class="ob2-opt" data-act="ob2-rate" data-id="'+esc(a.id)+'" data-v="'+s+'" aria-pressed="'+(v===s)+'"><b>'+s+'</b><span>'+esc(a.d[s])+'</span></button>'}).join('')+
   (a.stop&&v===1?'<div class="ob2-stop card">'+esc(O.henti||'Hentikan praktik.')+'</div>':'')+
   '<input class="obs-cat" data-id="'+esc(a.id)+'" maxlength="300" placeholder="Catatan (opsional)" value="'+esc(d.cat[a.id]||'')+'"></div>';
 }).join('');
 var ind='<div class="card ob2-card"><b>Indikator kompeten</b><p class="note">Centang bila terbukti. Kompeten bila semua tercentang dan K3 tidak bernilai 1.</p>'+
  O.indikator.map(function(x,i){return '<label class="ob2-ind"><input type="checkbox" data-ob2i="i'+i+'" '+(+d.nilai['i'+i]===1?'checked':'')+'><span>'+esc(x.t)+'<small>Bukti: '+esc(x.bukti)+'</small></span></label>'}).join('')+'</div>';
 return sel+ob2Chips(d,O)+
  '<div class="card"><div class="row sb"><b>Menilai: '+esc(cs.nama)+'</b><span class="pill plain mono">'+esc(cs.kelas||'-')+'</span></div><p class="note">Siswa '+(idx+1)+' dari '+d.pilih.length+'. Skor 4 terbaik, 1 terendah.</p>'+
  (multi?'<button type="button" class="btn small" data-act="ob-copy">Salin skor ini ke siswa lain yang belum diisi</button>':'')+'</div>'+
  guide+aspek+ind+'<div class="card" id="ob2sum">'+ob2SumHtml(d,O)+'</div>'+
  '<div class="card"><label class="f">Kekuatan yang teramati<textarea data-ob="kekuatan" maxlength="800">'+esc(d.kekuatan)+'</textarea></label>'+
  '<label class="f">Hal yang perlu ditingkatkan<textarea data-ob="perbaikan" maxlength="800">'+esc(d.perbaikan)+'</textarea></label>'+
  '<label class="f">Rekomendasi tindak lanjut<textarea data-ob="tindak" maxlength="800">'+esc(d.tindak)+'</textarea></label></div>'+
  (multi&&idx<d.pilih.length-1?'<button type="button" class="btn primary" data-act="ob-next">Siswa berikutnya</button>':'');
}
var _obsStuHtml2=obsStuHtml;
obsStuHtml=function(d){
 if(d.v2!==undefined&&d.v2!==null&&d.v2!=='')return ob2StuHtml(d);
 var h=_obsStuHtml2(d);
 if(d.id||!ob2Mods().length)return h;
 return '<div class="card"><div class="row sb"><span class="note">Formulir penilaian</span><button type="button" class="btn small" data-act="ob2-on">Pakai formulir v2</button></div></div>'+h;
};
var _obsDoneOf2=obsDoneOf;
obsDoneOf=function(d,k){
 if(!d.v2)return _obsDoneOf2(d,k);
 var m=ob2Mod(d.v2);return m?ob2Hitung(k===d.cur?d.nilai:(d.per[k]||{}).nilai,m.v2.obs).done:0;
};
var _obsAnyDone2=obsAnyDone;
obsAnyDone=function(d){
 if(!d.v2)return _obsAnyDone2(d);
 var m=ob2Mod(d.v2);if(!m||d.tipe!=='siswa')return false;
 obsFlush(d);return Object.keys(d.per||{}).some(function(k){return ob2Hitung(d.per[k].nilai,m.v2.obs).done>0});
};
var _obsDraftDari2=obsDraftDari;
obsDraftDari=function(r){var d=_obsDraftDari2(r),p=obsPay(r);if(d.tipe==='siswa'&&p.v===2)d.v2=p.mod||'';return d};

/* ---------- Simpan ---------- */
var _obsSaveSiswa2=obsSaveSiswa;
obsSaveSiswa=function(){
 var d=OB.d;if(!d||!d.v2)return _obsSaveSiswa2();
 var m=ob2Mod(d.v2);if(!m){toast('LKPD v2 tidak ditemukan');return}
 var O=m.v2.obs;obsFlush(d);
 if(!d.pilih.length){toast('Pilih minimal satu siswa');return}
 if(!d.tanggal){toast('Isi tanggal observasi');return}
 var R=obsRoster(d),i,k;
 for(i=0;i<d.pilih.length;i++){k=d.pilih[i];var hh=ob2Hitung((d.per[k]||{}).nilai,O);
  if(!hh.lengkap){obsLoad(d,k);obsStuRefresh(true);toast('Lengkapi skor 6 aspek '+((R[k]||{}).nama||'siswa')+' ('+hh.done+' dari '+hh.n+')');return}}
 var sesi=d.sesi||uid(),n=0,jml=d.pilih.length,mapel=String(d.mapel||'').trim()||m.title;
 S.observasi=S.observasi||[];
 d.pilih.forEach(function(k){
  var s=R[k],p=d.per[k],h=ob2Hitung(p.nilai,O);
  var payload=JSON.stringify({v:2,mod:m.id,modJudul:m.title,jenis:d.jenis,jam:String(d.jam||'').trim(),materi:String(d.materi||'').trim(),nilai:p.nilai,cat:p.cat,kekuatan:String(p.kekuatan||'').trim(),perbaikan:String(p.perbaikan||'').trim(),tindak:String(p.tindak||'').trim(),sesi:sesi,jumlah:jml,hasil:{nilai:h.nilai,kom:h.kom,nKom:h.nKom,stop:h.stop,kompeten:h.kompeten}});
  var f={tipe:'siswa',guruId:s.id||'',guru:String(s.nama).slice(0,120),mapel:mapel.slice(0,120),kelas:(s.kelas&&KELAS[s.kelas])?s.kelas:d.kelas,tanggal:d.tanggal,skor:h.nilai,kategori:ob2Kat(h),payload:payload};
  var rec=(d.id&&jml===1)?S.observasi.find(function(x){return x.id===d.id}):null;
  if(rec){Object.assign(rec,f);if(rec.r)rec.d=1}
  else S.observasi.push(Object.assign({id:uid(),ts:Date.now()+n,pengamat:S.user.nama,pengamatId:S.user.id},f));
  n++;
 });
 persist();OB.mode='list';OB.d=null;render();window.scrollTo(0,0);toast(n>1?n+' observasi tersimpan':'Observasi tersimpan');
};

/* ---------- Detail dan cetak ---------- */
function ob2Detail(r){
 var p=obsPay(r),m=ob2Mod(p.mod);
 if(!m)return '<div class="row sb"><h2>Detail observasi</h2><button type="button" class="btn small" data-act="ob-back">Kembali</button></div><div class="card"><p class="muted">LKPD v2 ('+esc(p.mod||'-')+') tidak ditemukan di aplikasi ini.</p></div>';
 var O=m.v2.obs,h=ob2Hitung(p.nilai,O),tx=function(j,t){return t?'<div class="card"><b>'+j+'</b><p>'+esc(t).replace(/\n/g,'<br>')+'</p></div>':''};
 return '<div class="row sb"><h2>Detail observasi v2</h2><button type="button" class="btn small" data-act="ob-back">Kembali</button></div>'+
  '<div class="card"><h3>'+esc(r.guru)+'</h3><div class="meta"><span>'+esc(r.mapel)+'</span><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
  '<div class="note">'+esc(p.jenis||'')+(p.jam?' · Jam ke-'+esc(p.jam):'')+(p.materi?' · '+esc(p.materi):'')+' · LKPD '+esc(m.id)+'</div><div class="note">Guru pengamat: '+esc(r.pengamat||'-')+'</div>'+
  '<div class="row sb"><span class="pill '+obsKatCls(r.kategori)+'">'+esc(r.kategori)+'</span><b class="mono">Nilai '+(+r.skor||0)+'</b></div>'+
  '<div class="row sb"><span class="note">Keputusan</span><b class="mono">'+(h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':'Belum kompeten')+'</b></div></div>'+
  '<h3 class="obs-group">Aspek penilaian</h3>'+O.aspek.map(function(a,i){var v=+p.nilai[a.id]||0;
   return '<div class="card" style="gap:4px"><div class="row sb"><span>'+(i+1)+'. '+esc(a.n)+' ('+a.b+'%)</span><span class="pill plain mono">'+(v||'-')+'</span></div>'+(v?'<div class="note">'+esc(a.d[v])+'</div>':'')+(p.cat[a.id]?'<div class="note">Catatan: '+esc(p.cat[a.id])+'</div>':'')+'</div>'}).join('')+
  '<h3 class="obs-group">Indikator kompeten ('+h.kom+'/'+h.nKom+')</h3>'+O.indikator.map(function(x,i){return '<div class="card" style="gap:4px"><div class="row sb"><span>'+esc(x.t)+'</span><span class="pill '+(+p.nilai['i'+i]===1?'ok':'plain')+'">'+(+p.nilai['i'+i]===1?'Tercapai':'Belum')+'</span></div><div class="note">Bukti: '+esc(x.bukti)+'</div></div>'}).join('')+
  tx('Kekuatan yang teramati',p.kekuatan)+tx('Hal yang perlu ditingkatkan',p.perbaikan)+tx('Rekomendasi tindak lanjut',p.tindak)+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary" data-act="ob2-print">Cetak</button>'+(obsBoleh(r)?'<button type="button" class="btn" data-act="ob-edit" data-v="'+esc(r.id)+'">Ubah</button>':'')+'</div>';
}
var _obsDetailView2=obsDetailView;
obsDetailView=function(){var r=OB.view;return r&&obsPay(r).v===2?ob2Detail(r):_obsDetailView2()};
var _obsPdf2=obsPdf;
function ob2Pdf(r){
 var p=obsPay(r),m=ob2Mod(p.mod);
 if(!m){toast('LKPD v2 ('+(p.mod||'-')+') tidak ditemukan di aplikasi ini');return}
 if(!needP())return;
 var O=m.v2.obs,h=ob2Hitung(p.nilai,O),D=obsDef('siswa'),doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),
  n2=function(x){return String(Math.round(x*100)/100).replace('.',',')};
 kop(doc,D.pdf);
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:50,fontStyle:'bold'}},body:[['Siswa',r.guru],['LKPD',m.id+' · '+m.title],['Kelas',r.kelas],['Tempat praktik',p.jenis||'-'],['Tanggal observasi',obsTgl(r.tanggal)],['Jam ke-',p.jam||'-'],['Materi',p.materi||'-'],['Guru pengamat',r.pengamat||'-']]});
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['No','Aspek','Bobot','Skor','Nilai','Deskriptor dan catatan']],
  body:O.aspek.map(function(a,i){var v=+p.nilai[a.id]||0;return [i+1,a.n,a.b+'%',v||'-',v?n2(v/4*a.b):'-',(v?a.d[v]:'')+(p.cat[a.id]?' Catatan: '+p.cat[a.id]:'')]}),
  columnStyles:{0:{cellWidth:9,halign:'center'},2:{cellWidth:13,halign:'center'},3:{cellWidth:11,halign:'center'},4:{cellWidth:13,halign:'center'}}});
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['Indikator kompeten','Bukti','Status']],
  body:O.indikator.map(function(x,i){return [x.t,x.bukti,+p.nilai['i'+i]===1?'Tercapai':'Belum']}),columnStyles:{2:{cellWidth:22,halign:'center'}}});
 var y=doc.lastAutoTable.finalY+7,H=doc.internal.pageSize.getHeight();
 if(y>H-45){doc.addPage();y=22}
 doc.setFontSize(10.5).setTextColor(0).setFont('helvetica','bold').text('Nilai '+(+r.skor||0)+'   Kategori: '+r.kategori+'   Keputusan: '+(h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':'Belum kompeten'),14,y);
 doc.setFont('helvetica','normal');y+=8;
 [['Kekuatan yang teramati',p.kekuatan],['Hal yang perlu ditingkatkan',p.perbaikan],['Rekomendasi tindak lanjut',p.tindak]].forEach(function(t){
  var lines=doc.splitTextToSize(t[1]||'-',180);
  if(y+6+lines.length*4.6>H-20){doc.addPage();y=22}
  doc.setFontSize(10).setFont('helvetica','bold').text(t[0],14,y);doc.setFont('helvetica','normal').text(lines,14,y+5);y+=9+lines.length*4.6;
 });
 ttd(doc,y+4,[[D.pengamat,r.pengamat||''],[D.diamati,r.guru]]);
 foot(doc);doc.save('Observasi_praktik_v2_'+slug(r.guru||'nama')+'_'+r.tanggal+'.pdf');
}
obsPdf=function(id){var r=(S.observasi||[]).find(function(x){return x.id===id});if(r&&obsPay(r).v===2){ob2Pdf(r);return}return _obsPdf2(id)};

/* Excel: lembar lama hanya memuat catatan formulir lama; catatan v2 masuk lembar sendiri per LKPD v2 (kolom mengikuti rubrik LKPD tsb). */
var _obsXls2=obsXls;
obsXls=function(){
 if(OB.tipe!=='siswa')return _obsXls2();
 var semua=obsVisible('siswa'),v2=semua.filter(function(r){return obsPay(r).v===2});
 if(!v2.length)return _obsXls2();
 if(!needX())return;
 var sheets=[],grup={};
 v2.slice().sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts}).forEach(function(r){var id=obsPay(r).mod||'-';(grup[id]=grup[id]||[]).push(r)});
 Object.keys(grup).forEach(function(id){
  var m=ob2Mod(id),O=m&&m.v2.obs;if(!O)return;
  var head=['No','Tanggal','Siswa','LKPD','Kelas','Tempat praktik','Guru pengamat'].concat(O.aspek.map(function(a){return a.n+' ('+a.b+'%)'})).concat(['Indikator tercapai','Nilai','Kategori','Keputusan','Kekuatan','Perlu ditingkatkan','Tindak lanjut']);
  var aoa=[head].concat(grup[id].map(function(r,i){var p=obsPay(r),h=ob2Hitung(p.nilai,O);
   return [i+1,r.tanggal,r.guru,r.mapel,r.kelas,p.jenis||'',r.pengamat||''].concat(O.aspek.map(function(a){return p.nilai[a.id]||''})).concat([h.kom+'/'+h.nKom,r.skor,r.kategori,h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':'Belum kompeten',p.kekuatan||'',p.perbaikan||'',p.tindak||''])}));
  sheets.push(['Obs v2 '+id.slice(0,22),aoa,head.map(function(x,i){return i===2||i===3?24:i>6&&i<7+O.aspek.length?14:i>=7+O.aspek.length+4?36:14})]);
 });
 var vis=obsVisible,real=book,n1=semua.length-v2.length;
 obsVisible=function(t){var L=vis.apply(this,arguments);return t==='siswa'?L.filter(function(r){return obsPay(r).v!==2}):L};
 book=function(pairs,name){var out=n1?pairs.concat(sheets):sheets;return real(out,n1?name:'Rekap_Observasi_LKPD_Praktik_v2')};
 try{_obsXls2()}finally{obsVisible=vis;book=real}
};

/* ---------- Peristiwa ---------- */
function ob2Sync(){
 var d=OB.d,m=d&&ob2Mod(d.v2);if(!m)return;
 var el=document.getElementById('ob2sum');if(el)el.innerHTML=ob2SumHtml(d,m.v2.obs);
 var c=document.querySelector('.obs-chip[aria-pressed="true"]'),h=ob2Hitung(d.nilai,m.v2.obs);
 if(c){var cn=c.querySelector('.cn');if(cn)cn.textContent=h.done+'/'+h.n;c.dataset.full=h.lengkap?'1':'0'}
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act^="ob2-"]');if(!b||!OB)return;var a=b.dataset.act,d=OB.d;
 if(a==='ob2-print'){window.print();return}
 if(!d)return;
 if(a==='ob2-on'){
  if(obsAnyDone(d)){toast('Kosongkan skor formulir lama dulu sebelum pindah ke v2');return}
  var ms=ob2Mods();if(!ms.length)return;
  d.v2=ms[0].id;d.per={};d.nilai={};d.cat={};d.cur='';if(!String(d.mapel||'').trim())d.mapel=ms[0].title;obsEnsure(d);obsStuRefresh();
 }else if(a==='ob2-off'){
  if(obsAnyDone(d)){toast('Kosongkan skor v2 dulu sebelum pindah ke formulir lama');return}
  d.v2='';d.per={};d.nilai={};d.cat={};d.cur='';obsEnsure(d);obsStuRefresh();
 }else if(a==='ob2-rate'){
  var m=ob2Mod(d.v2);if(!m)return;
  d.nilai[b.dataset.id]=+b.dataset.v;
  var card=b.closest('[data-a]');if(card){card.querySelectorAll('.ob2-opt').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})}
  obsStuRefresh();
 }
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t.matches||!OB||!OB.d||!OB.d.v2)return;
 if(t.matches('[data-ob2i]')){OB.d.nilai[t.dataset.ob2i]=t.checked?1:0;ob2Sync()}
 else if(t.matches('[data-ob2mod]')){
  if(obsAnyDone(OB.d)){toast('Kosongkan skor dulu sebelum mengganti LKPD v2');t.value=OB.d.v2;return}
  var m=ob2Mod(t.value);if(!m)return;OB.d.v2=m.id;OB.d.per={};OB.d.nilai={};OB.d.cat={};OB.d.cur='';OB.d.mapel=m.title;obsEnsure(OB.d);obsStuRefresh();
 }
});
/* Salin skor: versi lama memakai obsHitung (selalu 0 untuk v2) sehingga bisa menimpa skor siswa lain; ganti dengan hitungan v2. */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="ob-copy"]');if(!b||!OB||!OB.d||!OB.d.v2)return;
 e.stopImmediatePropagation();
 var d=OB.d,m=ob2Mod(d.v2);if(!m)return;
 obsFlush(d);var src=d.nilai,cnt=0;
 d.pilih.forEach(function(k){if(k===d.cur)return;var pp=d.per[k]||(d.per[k]={nilai:{},cat:{},kekuatan:'',perbaikan:'',tindak:''});if(!ob2Hitung(pp.nilai,m.v2.obs).done){pp.nilai=Object.assign({},src);cnt++}});
 obsStuRefresh();toast(cnt?'Skor disalin ke '+cnt+' siswa. Periksa dan ubah per siswa.':'Semua siswa lain sudah punya skor');
},true);
