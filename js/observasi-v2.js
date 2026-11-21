/* observasi-v2.js: Observasi LKPD Praktik v2 (aditif). Dimuat tepat setelah observasi.js.
   Tetap memakai tipe 'siswa' dan koleksi `observasi` yang sama; versi ditandai payload.v=2 dan payload.mod (ID modul LKPD v2).
   Rubrik, indikator, dan panduan diambil dari modul LKPD v2 (m.v2.obs), jadi tiap LKPD v2 membawa rubriknya sendiri.
   Penilaian aspek (format baru, sama dengan Observasi UKK): penguji memilih skala 1-4 (1 Belum Kompeten <61, 2 Cukup Kompeten 61-74,
   3 Kompeten 75-90, 4 Sangat Kompeten 91-100) lalu mengisi nilai bulat dalam rentang skala itu. Skala disimpan di payload.nilai['l_'+id aspek],
   nilai di payload.nilai[id aspek]; indikator kompeten sebagai i0..iN (1 = tercapai), sehingga pemilihan banyak siswa, simpan, ubah,
   dan sinkronisasi memakai alur formulir lama. Nilai akhir = jumlah(nilai aspek × bobot ÷ 100). Kompeten bila semua indikator tercentang,
   semua aspek terisi, dan aspek ber-stop tidak berskala 1.
   Indikator kompeten ikut berskala 1-4 + nilai (kunci l_i<n> dan i<n>, penanda format payload.nilai._fi=2); tercapai bila skala 3 atau 4.
   Indikator format lama (kotak centang, i<n>=1) tetap terbaca. Indikator tidak memengaruhi nilai akhir, hanya keputusan Kompeten.
   Catatan format lama (payload.nilai[id aspek] = skor 1-4 tanpa kunci l_) tetap terbaca di detail, PDF, dan Excel dengan hitungan lama:
   nilai = jumlah(skor ÷ 4 × bobot). Bila diubah, aspeknya diisi ulang dengan skala dan nilai.
   Formulir lama dan datanya tidak diubah; PDF dan Excel untuk catatan v2 belum tersedia (gunakan Cetak). */
(function(){var st=document.createElement('style');st.textContent=
'.ob2-opt{display:flex;gap:8px;align-items:flex-start;width:100%;text-align:left;border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 10px;font-size:13px;line-height:1.35}'+
'.ob2-opt b{flex:none;min-width:18px}.ob2-opt[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--onc)}'+
'.ob2-stop{border-left:4px solid var(--bad,#b3261e);font-size:13.5px}.ob2-card{display:grid;gap:6px}.ob2-ind{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line)}'+
'.ob2-ind input{width:20px;height:20px;flex:none;margin-top:2px;accent-color:var(--accent)}.ob2-ind small{display:block;color:var(--muted)}'+
'.ob2-stop[hidden],.ob2-desc[hidden]{display:none}.ob2-krit summary{font-size:13px;color:var(--muted);cursor:pointer}.ob2-krit p{margin:4px 0}';
document.head.appendChild(st)})();

/* ---------- Definisi dan hitungan ---------- */
function ob2Mods(){return (typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES||[]).filter(function(m){return m.v2&&m.v2.obs&&m.v2.obs.aspek&&m.v2.obs.aspek.length})}
function ob2Mod(id){return ob2Mods().find(function(m){return m.id===id})||null}
/* Skala per aspek (sama dengan Observasi UKK): penguji memilih skala lalu mengisi nilai bulat dalam rentangnya. */
var OB2_LVL=[null,{k:'Belum Kompeten',min:0,max:60,ket:'<61'},{k:'Cukup Kompeten',min:61,max:74,ket:'61-74'},{k:'Kompeten',min:75,max:90,ket:'75-90'},{k:'Sangat Kompeten',min:91,max:100,ket:'91-100'}];
function ob2Valid(l,v){var L=OB2_LVL[l];return !!L&&typeof v==='number'&&isFinite(v)&&v===Math.floor(v)&&v>=L.min&&v<=L.max}
function ob2Ket(l){var L=OB2_LVL[l];return L?L.k+': '+L.ket:'Pilih 1-4 sesuai kriteria'}
/* Format baru bila ada kunci l_<id aspek> (skala). Tanpa kunci itu = format lama (skor 1-4 per aspek). */
function ob2Baru(nl){return Object.keys(nl||{}).some(function(k){return k.indexOf('l_')===0})}
function ob2Hitung(nl,O){
 nl=nl||{};var baru=ob2Baru(nl),fi=nl._fi===2,done=0,sum=0,doneI=0,kom=0;
 O.aspek.forEach(function(a){
  if(baru){var l=+nl['l_'+a.id],v=nl[a.id];if(ob2Valid(l,v)){done++;sum+=v*a.b/100}}
  else{var v2=+nl[a.id];if(v2>=1&&v2<=4){done++;sum+=v2/4*a.b}}
 });
 /* Indikator: format baru (fi) berskala 1-4 + nilai, tercapai bila skala 3-4; format lama = kotak centang (1 = tercapai). */
 O.indikator.forEach(function(x,i){
  if(fi){var l=+nl['l_i'+i];if(ob2Valid(l,nl['i'+i])){doneI++;if(l>=3)kom++}}
  else if(+nl['i'+i]===1)kom++;
 });
 var nI=O.indikator.length,stop=O.aspek.some(function(a){return a.stop&&+nl[baru?'l_'+a.id:a.id]===1}),lengkap=done===O.aspek.length&&(!fi||doneI===nI);
 return {done:done,n:O.aspek.length,doneI:fi?doneI:0,fi:fi,tDone:done+(fi?doneI:0),tN:O.aspek.length+(fi?nI:0),nilai:Math.round(sum),kom:kom,nKom:nI,stop:stop,lengkap:lengkap,baru:baru,kompeten:lengkap&&kom===nI&&!stop};
}
function ob2KatNilai(n){n=+n||0;return n>=91?'Sangat Kompeten':n>=75?'Kompeten':n>=61?'Cukup Kompeten':'Belum Kompeten'}
function ob2Kat(h){return h.baru?(h.stop?'Belum Kompeten':ob2KatNilai(h.nilai)):(h.stop?'Kurang':obsKat(h.nilai/25))}
/* Pill kategori: label baru (Kompeten dst.) dan label lama (Sangat Baik, Baik, Cukup, Kurang) sama-sama dikenali. */
var _obsKatCls2=obsKatCls;
obsKatCls=function(k){return k==='Sangat Kompeten'||k==='Kompeten'?'ok':k==='Cukup Kompeten'?'warn':k==='Belum Kompeten'?'bad':_obsKatCls2(k)};

/* ---------- Tampilan penilaian ---------- */
function ob2Chips(d,O){
 var R=obsRoster(d);
 return '<div class="obs-chips" role="group" aria-label="Pilih siswa yang dinilai">'+d.pilih.map(function(k){
  var s=R[k]||{nama:'?'},h=ob2Hitung(k===d.cur?d.nilai:(d.per[k]||{}).nilai,O);
  return '<button type="button" class="obs-chip" data-act="ob-pick" data-v="'+esc(k)+'" data-full="'+(h.lengkap?1:0)+'" aria-pressed="'+(k===d.cur)+'">'+esc(String(s.nama).split(/\s+/).slice(0,2).join(' '))+' <small class="cn">'+h.tDone+'/'+h.tN+'</small></button>';
 }).join('')+'</div>';
}
function ob2SumHtml(d,O){
 var h=ob2Hitung(d.nilai,O);
 return '<div class="row sb"><span class="note">Aspek terisi</span><b class="mono">'+h.done+' / '+h.n+'</b></div>'+(h.fi?'<div class="row sb"><span class="note">Indikator terisi</span><b class="mono">'+h.doneI+' / '+h.nKom+'</b></div>':'')+
  '<div class="row sb"><span class="note">Nilai · kategori</span><b class="mono">'+(h.done?h.nilai+' · '+esc(ob2Kat(h)):'-')+'</b></div>'+
  '<div class="row sb"><span class="note">Indikator kompeten</span><b class="mono">'+h.kom+' / '+h.nKom+'</b></div>'+
  '<div class="row sb"><span class="note">Keputusan</span><b class="mono">'+(h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':h.lengkap?'Belum kompeten':'-')+'</b></div>';
}
function ob2AspekHtml(a,n,d){
 var l=+d.nilai['l_'+a.id]||0,v=d.nilai[a.id],L=OB2_LVL[l],bad=!!l&&v!==undefined&&!ob2Valid(l,v),m=ob2Mod(d.v2),henti=(m&&m.v2.obs.henti)||'Hentikan praktik.';
 return '<div class="item obu-item ob2-item" id="ob2i-'+esc(a.id)+'" data-a="'+esc(a.id)+'" data-s="'+(l||'')+'"><div class="t" style="display:block"><b>'+(n+1)+'. '+esc(a.n)+' <span class="pill plain mono">'+a.b+'%</span></b>'+(a.ket?'<div class="note" style="font-style:italic;margin-top:3px">'+esc(a.ket)+'</div>':'')+'</div>'+
  '<div class="seg rate" role="group" aria-label="Skala aspek '+(n+1)+'">'+[1,2,3,4].map(function(s){return '<button type="button" data-act="ob2-rate" data-id="'+esc(a.id)+'" data-v="'+s+'" aria-pressed="'+(l===s)+'" title="'+OB2_LVL[s].k+'">'+s+'</button>'}).join('')+'</div>'+
  '<div class="note obu-ket ob2-ket'+(bad?' bad':'')+'">'+esc(ob2Ket(l))+'</div>'+
  '<div class="note ob2-desc"'+(l?'':' hidden')+'>'+(l?esc(a.d[l]):'')+'</div>'+
  '<input class="obu-nil ob2-nil" type="number" inputmode="numeric" step="1" data-id="'+esc(a.id)+'" '+(l?'min="'+L.min+'" max="'+L.max+'" placeholder="Nilai '+L.min+'-'+L.max+'"':'placeholder="Nilai" disabled')+' value="'+(v===undefined?'':esc(v))+'" aria-invalid="'+bad+'">'+
  '<div class="ob2-stop card"'+(a.stop&&l===1?'':' hidden')+'>'+esc(henti)+'</div>'+
  '<details class="ob2-krit"><summary>Kriteria skala</summary>'+[4,3,2,1].map(function(s){return '<p class="note"><b>'+s+' · '+OB2_LVL[s].k+' ('+OB2_LVL[s].ket+')</b>: '+esc(a.d[s])+'</p>'}).join('')+'</details>'+
  '<input class="obs-cat" data-id="'+esc(a.id)+'" maxlength="300" placeholder="Keterangan (opsional)" value="'+esc(d.cat[a.id]||'')+'"></div>';
}
function ob2IndHtml(x,i,d){
 var id='i'+i,l=+d.nilai['l_'+id]||0,v=d.nilai[id],L=OB2_LVL[l],bad=!!l&&v!==undefined&&!ob2Valid(l,v);
 return '<div class="item obu-item ob2-item" id="ob2i-'+id+'" data-a="'+id+'" data-s="'+(l||'')+'"><div class="t" style="display:block"><b>'+(i+1)+'. '+esc(x.t)+'</b><div class="note" style="font-style:italic;margin-top:3px">Bukti: '+esc(x.bukti)+'</div></div>'+
  '<div class="seg rate" role="group" aria-label="Skala indikator '+(i+1)+'">'+[1,2,3,4].map(function(s){return '<button type="button" data-act="ob2-rate" data-id="'+id+'" data-v="'+s+'" aria-pressed="'+(l===s)+'" title="'+OB2_LVL[s].k+'">'+s+'</button>'}).join('')+'</div>'+
  '<div class="note obu-ket ob2-ket'+(bad?' bad':'')+'">'+esc(ob2Ket(l))+'</div>'+
  '<input class="obu-nil ob2-nil" type="number" inputmode="numeric" step="1" data-id="'+id+'" '+(l?'min="'+L.min+'" max="'+L.max+'" placeholder="Nilai '+L.min+'-'+L.max+'"':'placeholder="Nilai" disabled')+' value="'+(v===undefined?'':esc(v))+'" aria-invalid="'+bad+'"></div>';
}
function ob2BarTxt(h){return h.tDone?'Nilai '+h.nilai+(h.lengkap?' · '+ob2Kat(h):' (sementara)'):'Nilai -'}
function ob2BarHtml(h){
 return '<div class="obu-bar" role="region" aria-label="Ringkasan dan simpan"><div class="obu-bar-in"><div class="obu-stat"><b class="mono"><span id="ob2prog2">'+h.tDone+'</span> / '+h.tN+' terisi</b><span class="note" id="ob2nilai2">'+esc(ob2BarTxt(h))+'</span></div>'+
  '<div class="obu-bar-btns"><button type="button" class="btn" id="ob2next" data-act="ob2-next"'+(h.lengkap?' hidden':'')+'>Belum diisi</button><button type="button" class="btn primary" data-act="ob-save">Simpan</button></div></div></div>';
}
/* Gulir ke aspek pertama yang belum lengkap (skala dan nilai) dan beri sorotan singkat. Mengembalikan aspek itu, atau null bila lengkap. */
function ob2KeBelum(){
 var d=OB&&OB.d,m=d&&ob2Mod(d.v2);if(!m)return null;
 var O2=m.v2.obs,cand=O2.aspek.map(function(a){return a.id}).concat(d.nilai._fi===2?O2.indikator.map(function(x,i){return 'i'+i}):[]),
  ms=cand.filter(function(id){return !ob2Valid(+d.nilai['l_'+id],d.nilai[id])}).map(function(id){return {id:id}})[0];
 if(!ms)return null;
 var el=document.getElementById('ob2i-'+ms.id);if(!el)return ms;
 var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 el.scrollIntoView({block:'center',behavior:rm?'auto':'smooth'});
 el.classList.remove('obu-flash');void el.offsetWidth;el.classList.add('obu-flash');
 setTimeout(function(){el.classList.remove('obu-flash')},1600);
 return ms;
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
 var aspek=O.aspek.map(function(a,n){return ob2AspekHtml(a,n,d)}).join('');
 var ind=d.nilai._fi===2?
  '<h3 class="obs-group">Indikator kompeten</h3><p class="note">Nilai tiap indikator dengan skala 1-4 yang sama. Indikator tercapai bila berskala 3 (Kompeten) atau 4 (Sangat Kompeten). Kompeten bila semua indikator tercapai dan K3 tidak berskala 1.</p>'+O.indikator.map(function(x,i){return ob2IndHtml(x,i,d)}).join(''):
  '<div class="card ob2-card"><b>Indikator kompeten</b><p class="note">Centang bila terbukti. Kompeten bila semua tercentang dan K3 tidak bernilai 1.</p>'+
  O.indikator.map(function(x,i){return '<label class="ob2-ind"><input type="checkbox" data-ob2i="i'+i+'" '+(+d.nilai['i'+i]===1?'checked':'')+'><span>'+esc(x.t)+'<small>Bukti: '+esc(x.bukti)+'</small></span></label>'}).join('')+'</div>';
 return sel+ob2Chips(d,O)+
  '<div class="card"><div class="row sb"><b>Menilai: '+esc(cs.nama)+'</b><span class="pill plain mono">'+esc(cs.kelas||'-')+'</span></div><p class="note">Siswa '+(idx+1)+' dari '+d.pilih.length+'.</p>'+
  (multi?'<button type="button" class="btn small" data-act="ob-copy">Salin skor ini ke siswa lain yang belum diisi</button>':'')+'</div>'+
  guide+(d.lama2?'<p class="note">Observasi ini memakai skor 1-4 (format lama). Isi ulang setiap aspek dengan skala 1-4 dan nilai sebelum menyimpan.</p>':'')+'<p class="note">Pilih skala 1-4 untuk setiap aspek, lalu isi nilai sesuai rentangnya: 1 Belum Kompeten (&lt;61), 2 Cukup Kompeten (61-74), 3 Kompeten (75-90), 4 Sangat Kompeten (91-100). Nilai akhir = jumlah (nilai × bobot ÷ 100).</p>'+aspek+ind+'<div class="card" id="ob2sum">'+ob2SumHtml(d,O)+'</div>'+
  '<div class="card"><label class="f">Kekuatan yang teramati<textarea data-ob="kekuatan" maxlength="800">'+esc(d.kekuatan)+'</textarea></label>'+
  '<label class="f">Hal yang perlu ditingkatkan<textarea data-ob="perbaikan" maxlength="800">'+esc(d.perbaikan)+'</textarea></label>'+
  '<label class="f">Rekomendasi tindak lanjut<textarea data-ob="tindak" maxlength="800">'+esc(d.tindak)+'</textarea></label></div>'+
  (multi&&idx<d.pilih.length-1?'<button type="button" class="btn primary" data-act="ob-next">Siswa berikutnya</button>':'')+ob2BarHtml(ob2Hitung(d.nilai,O));
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
 var m=ob2Mod(d.v2);return m?ob2Hitung(k===d.cur?d.nilai:(d.per[k]||{}).nilai,m.v2.obs).tDone:0;
};
var _obsAnyDone2=obsAnyDone;
obsAnyDone=function(d){
 if(!d.v2)return _obsAnyDone2(d);
 var m=ob2Mod(d.v2);if(!m||d.tipe!=='siswa')return false;
 obsFlush(d);return Object.keys(d.per||{}).some(function(k){return ob2Hitung(d.per[k].nilai,m.v2.obs).tDone>0});
};
/* Siswa baru dinilai dengan indikator berskala (penanda _fi=2). */
var _obsLoad2=obsLoad;
obsLoad=function(d,k){_obsLoad2(d,k);if(d&&d.v2&&d.nilai&&!Object.keys(d.nilai).length)d.nilai._fi=2};
var _obsDraftDari2=obsDraftDari;
obsDraftDari=function(r){
 var d=_obsDraftDari2(r),p=obsPay(r);
 if(d.tipe==='siswa'&&p.v===2){
  d.v2=p.mod||'';
  /* Catatan format lama: aspek skor 1-4 dan/atau indikator kotak centang diisi ulang dengan skala dan nilai. */
  var nl=p.nilai,baru=ob2Baru(nl);
  if(!(baru&&nl._fi===2)){var keep={};Object.keys(nl).forEach(function(k){if(baru&&!/^i\d+$/.test(k))keep[k]=nl[k]});keep._fi=2;d.nilai=keep;d.lama2=true}
 }
 return d;
};

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
  if(!hh.lengkap){obsLoad(d,k);obsStuRefresh(true);toast('Lengkapi skor '+hh.n+' aspek'+(hh.fi?' dan '+hh.nKom+' indikator':'')+' '+((R[k]||{}).nama||'siswa')+' ('+hh.tDone+' dari '+hh.tN+'): pilih skala 1-4 dan isi nilai sesuai rentang');setTimeout(ob2KeBelum,60);return}}
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
  '<h3 class="obs-group">Aspek penilaian</h3>'+O.aspek.map(function(a,i){var v=+p.nilai[a.id]||0,l=h.baru?(+p.nilai['l_'+a.id]||0):v,ada=h.baru?!!l:!!v;
   return '<div class="card" style="gap:4px"><div class="row sb"><span>'+(i+1)+'. '+esc(a.n)+' ('+a.b+'%)</span><span class="pill plain mono">'+(ada?(h.baru?l+' · '+OB2_LVL[l].k+' · '+v:v):'-')+'</span></div>'+(ada&&a.d[l]?'<div class="note">'+esc(a.d[l])+'</div>':'')+(p.cat[a.id]?'<div class="note">Catatan: '+esc(p.cat[a.id])+'</div>':'')+'</div>'}).join('')+
  '<h3 class="obs-group">Indikator kompeten ('+h.kom+'/'+h.nKom+')</h3>'+O.indikator.map(function(x,i){var il=h.fi?(+p.nilai['l_i'+i]||0):0,okI=h.fi?il>=3:+p.nilai['i'+i]===1;return '<div class="card" style="gap:4px"><div class="row sb"><span>'+esc(x.t)+'</span><span class="pill '+(okI?'ok':'plain')+'">'+(h.fi?(il?il+' · '+OB2_LVL[il].k+' · '+p.nilai['i'+i]+' · '+(okI?'Tercapai':'Belum'):'-'):(okI?'Tercapai':'Belum'))+'</span></div><div class="note">Bukti: '+esc(x.bukti)+'</div></div>'}).join('')+
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
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[h.baru?['No','Aspek','Bobot','Skor','Nilai','Berbobot','Deskriptor dan catatan']:['No','Aspek','Bobot','Skor','Nilai','Deskriptor dan catatan']],
  body:O.aspek.map(function(a,i){
   if(h.baru){var l=+p.nilai['l_'+a.id]||0,nv=p.nilai[a.id],ok=ob2Valid(l,nv);return [i+1,a.n,a.b+'%',l?l+' '+OB2_LVL[l].k:'-',ok?nv:'-',ok?n2(nv*a.b/100):'-',(l?a.d[l]:'')+(p.cat[a.id]?' Catatan: '+p.cat[a.id]:'')]}
   var v=+p.nilai[a.id]||0;return [i+1,a.n,a.b+'%',v||'-',v?n2(v/4*a.b):'-',(v?a.d[v]:'')+(p.cat[a.id]?' Catatan: '+p.cat[a.id]:'')]}),
  columnStyles:h.baru?{0:{cellWidth:9,halign:'center'},2:{cellWidth:13,halign:'center'},3:{cellWidth:24,halign:'center'},4:{cellWidth:12,halign:'center'},5:{cellWidth:16,halign:'center'}}:{0:{cellWidth:9,halign:'center'},2:{cellWidth:13,halign:'center'},3:{cellWidth:11,halign:'center'},4:{cellWidth:13,halign:'center'}}});
 doc.autoTable({startY:doc.lastAutoTable.finalY+4,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[h.fi?['Indikator kompeten','Bukti','Skor','Nilai','Status']:['Indikator kompeten','Bukti','Status']],
  body:O.indikator.map(function(x,i){
   if(h.fi){var il=+p.nilai['l_i'+i]||0,iv=p.nilai['i'+i],okv=ob2Valid(il,iv);return [x.t,x.bukti,il?il+' '+OB2_LVL[il].k:'-',okv?iv:'-',il>=3&&okv?'Tercapai':'Belum']}
   return [x.t,x.bukti,+p.nilai['i'+i]===1?'Tercapai':'Belum']}),
  columnStyles:h.fi?{2:{cellWidth:26,halign:'center'},3:{cellWidth:13,halign:'center'},4:{cellWidth:22,halign:'center'}}:{2:{cellWidth:22,halign:'center'}}});
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
  var head=['No','Tanggal','Siswa','LKPD','Kelas','Tempat praktik','Guru pengamat'].concat(O.aspek.map(function(a){return a.n+' ('+a.b+'%)'})).concat(['Indikator tercapai','Nilai','Kategori','Keputusan','Kekuatan','Perlu ditingkatkan','Tindak lanjut','Format penilaian']);
  var aoa=[head].concat(grup[id].map(function(r,i){var p=obsPay(r),h=ob2Hitung(p.nilai,O);
   return [i+1,r.tanggal,r.guru,r.mapel,r.kelas,p.jenis||'',r.pengamat||''].concat(O.aspek.map(function(a){return p.nilai[a.id]===undefined?'':p.nilai[a.id]})).concat([h.kom+'/'+h.nKom,r.skor,r.kategori,h.stop?'Praktik dihentikan (K3)':h.kompeten?'Kompeten':'Belum kompeten',p.kekuatan||'',p.perbaikan||'',p.tindak||'',h.baru?'Skala 1-4 + nilai 0-100 per aspek':'Skor 1-4 per aspek (format lama)'])}));
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
 var pg=document.getElementById('ob2prog2'),nl2=document.getElementById('ob2nilai2'),nx=document.getElementById('ob2next');
 if(pg){pg.textContent=h.tDone;if(pg.nextSibling)pg.nextSibling.textContent=' / '+h.tN+' terisi'}if(nl2)nl2.textContent=ob2BarTxt(h);
 if(nx){if(h.lengkap)nx.setAttribute('hidden','');else nx.removeAttribute('hidden')}
 if(c){var cn=c.querySelector('.cn');if(cn)cn.textContent=h.tDone+'/'+h.tN;c.dataset.full=h.lengkap?'1':'0'}
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
  var sk=+b.dataset.v,id=b.dataset.id,LV=OB2_LVL[sk],cur=d.nilai[id],card=b.closest('[data-a]'),asp=m.v2.obs.aspek.find(function(x){return x.id===id});
  d.nilai['l_'+id]=sk;if(!ob2Valid(sk,cur))delete d.nilai[id];
  if(card){
   card.dataset.s=sk;card.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
   var ket=card.querySelector('.ob2-ket'),inp=card.querySelector('.ob2-nil'),ds=card.querySelector('.ob2-desc'),stp=card.querySelector('.ob2-stop');
   if(ket){ket.textContent=ob2Ket(sk);ket.classList.remove('bad')}
   if(ds&&asp){ds.textContent=asp.d[sk]||'';ds.hidden=!asp.d[sk]}
   if(stp)stp.hidden=!(asp&&asp.stop&&sk===1);
   if(inp){inp.disabled=false;inp.min=LV.min;inp.max=LV.max;inp.placeholder='Nilai '+LV.min+'-'+LV.max;if(!ob2Valid(sk,cur))inp.value='';inp.setAttribute('aria-invalid','false');inp.focus()}
  }
  ob2Sync();
 }else if(a==='ob2-next'){ob2KeBelum()}
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t.matches||!OB||!OB.d||!OB.d.v2)return;
 if(t.matches('[data-ob2i]')){OB.d.nilai[t.dataset.ob2i]=t.checked?1:0;ob2Sync()}
 else if(t.matches('[data-ob2mod]')){
  if(obsAnyDone(OB.d)){toast('Kosongkan skor dulu sebelum mengganti LKPD v2');t.value=OB.d.v2;return}
  var m=ob2Mod(t.value);if(!m)return;OB.d.v2=m.id;OB.d.per={};OB.d.nilai={};OB.d.cat={};OB.d.cur='';OB.d.mapel=m.title;obsEnsure(OB.d);obsStuRefresh();
 }
});
/* Nilai aspek: harus bulat dan dalam rentang skala yang dipilih; di luar rentang ditandai merah dan tidak dihitung. */
document.addEventListener('input',function(e){
 var t=e.target;if(!t.classList||!t.classList.contains('ob2-nil')||!OB||!OB.d||!OB.d.v2)return;
 var id=t.dataset.id,l=+OB.d.nilai['l_'+id],raw=t.value;
 if(raw==='')delete OB.d.nilai[id];else OB.d.nilai[id]=Number(raw);
 var bd=raw!==''&&!ob2Valid(l,OB.d.nilai[id]),kt=t.closest('[data-a]').querySelector('.ob2-ket'),LN=OB2_LVL[l];
 t.setAttribute('aria-invalid',String(bd));
 if(kt){kt.textContent=bd&&LN?'Nilai harus '+LN.min+'-'+LN.max+' ('+ob2Ket(l)+')':ob2Ket(l);kt.classList.toggle('bad',bd)}
 ob2Sync();
});
/* Salin skor: versi lama memakai obsHitung (selalu 0 untuk v2) sehingga bisa menimpa skor siswa lain; ganti dengan hitungan v2. */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="ob-copy"]');if(!b||!OB||!OB.d||!OB.d.v2)return;
 e.stopImmediatePropagation();
 var d=OB.d,m=ob2Mod(d.v2);if(!m)return;
 obsFlush(d);var src=d.nilai,cnt=0;
 d.pilih.forEach(function(k){if(k===d.cur)return;var pp=d.per[k]||(d.per[k]={nilai:{},cat:{},kekuatan:'',perbaikan:'',tindak:''});if(!ob2Hitung(pp.nilai,m.v2.obs).tDone){pp.nilai=Object.assign({},src);cnt++}});
 obsStuRefresh();toast(cnt?'Skor disalin ke '+cnt+' siswa. Periksa dan ubah per siswa.':'Semua siswa lain sudah punya skor');
},true);
