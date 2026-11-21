/* lkpd-v2.js: mesin LKPD v2 (aditif). Hanya aktif untuk modul yang memiliki objek `v2` (mis. LKPD-X-07); LKPD lama tidak berubah.
   Dimuat tepat setelah lkpd.js, sebelum lkpd-kelas.js dan pembungkus lain, sehingga banner mode, timer, dan daftar kelas tetap bekerja.
   Tambahan v2:
   - Pertemuan: rencana per pertemuan (JP/menit) dan waktu aktual per pertemuan (isian menit).
   - Gerbang masuk: pertanyaan wajib dijawab agar Lembar Kerja terbuka; guru menandai benar/salah di Detail (minimal sesuai `gate.min`).
   - Tabel data terstruktur dengan rata-rata dan selisih otomatis (kolom rata/selisih tidak diisi siswa).
   - Soal isian angka (t:'isian', kunci, tol) dinilai otomatis, sebagai tipe soal baru pada m.quiz.
   - Langkah bertanda saksi dan paraf APD, diverifikasi guru di Detail (disimpan di payload.v2.verif).
   Semua data siswa memakai kunci yang sama dengan mesin lama (step<i>, safe<i>, actual<i>, q<i>), jadi draf, foto bukti, nilai koreksi,
   rekap, dan sinkronisasi tidak berubah. Foto wajib memakai m.fotoWajib yang sudah ada. */
var LK2={};
(function(){var st=document.createElement('style');st.textContent=
'.lk2-p{border-left:4px solid var(--accent)}.lk2-st{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}'+
'.lk2-saksi{display:inline-block;margin-left:6px;font-size:11px;padding:1px 6px;border-radius:8px;border:1px solid var(--warn,#b8860b);color:var(--warn,#b8860b)}'+
'.lk2-t input,.lk2-t select{min-width:64px;width:100%}.lk2-t td,.lk2-t th{padding:4px}.lk2-cek{border-top:1px solid var(--line,#ddd);padding:10px 0;display:grid;gap:6px}'+
'.lk2-dt{border:1px solid var(--line,#ddd);border-radius:12px;margin:8px 0;background:var(--surface,#fff)}.lk2-dt>summary{cursor:pointer;list-style:none;padding:11px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px}.lk2-dt>summary::-webkit-details-marker{display:none}.lk2-dt>summary::after{content:"\\25B8";flex:none;transition:transform .15s}.lk2-dt[open]>summary::after{transform:rotate(90deg)}.lk2-ttl{display:grid;gap:2px}.lk2-ttl small{color:var(--muted,#666);font-size:12.5px;line-height:1.3}.lk2-bd{padding:0 14px 12px;font-size:14px}.lk2-bd ul{margin:6px 0}.lk2-grp{margin:12px 0 4px;font-size:14px}'+
'.lk2-ok{color:var(--ok,#1b7f3b);font-weight:600}.lk2-no{color:var(--bad,#b3261e);font-weight:600}.lk2-key{font-size:12.5px}';
document.head.appendChild(st)})();

/* ---------- Dasar ---------- */
function lk2Cur(){return (typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES||[]).find(function(x){return x.id===LK.module})}
function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}
/* Angka dengan koma desimal ("24,35") atau titik. Tidak valid → NaN. */
function lk2Num(s){if(typeof s==='number')return s;var t=String(s==null?'':s).trim().replace(/\s/g,'').replace(',','.');return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)?Number(t):NaN}
function lk2Fmt(n){if(typeof n!=='number'||!isFinite(n))return '';return String(Math.round(n*1000)/1000).replace('.',',')}
function lk2K(tid,r,k){return 't_'+tid+'_'+r+'_'+k}
function lk2Txt(x){return String(x==null?'':x).trim()}
/* Bagian lipat. Status buka/tutup diingat selama sesi; saat mencetak semua dibuka. */
function lk2Det(id,ttl,sub,body){var op=LK2.cetak||(LK2.open&&LK2.open[id]);return '<details class="lk2-dt" data-lk2d="'+id+'"'+(op?' open':'')+'><summary><span class="lk2-ttl"><b>'+ttl+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span></summary><div class="lk2-bd">'+body+'</div></details>'}
document.addEventListener('toggle',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.lk2d){LK2.open=LK2.open||{};LK2.open[t.dataset.lk2d]=t.open}},true);

/* ---------- Tabel data: rata-rata dan selisih otomatis ---------- */
function lk2Calc(m,d){
 var out={};
 m.v2.tabel.forEach(function(t){
  out[t.id]=t.baris.map(function(lb,r){
   var o={};
   t.kol.forEach(function(c){
    if(c.t==='rata'){var v=c.dari.map(function(k){return lk2Num(d[lk2K(t.id,r,k)])});o[c.k]=v.every(isFinite)?v.reduce(function(a,b){return a+b},0)/v.length:NaN}
    else if(c.t==='selisih'){var a=lk2Num(d[lk2K(t.id,r,c.a)]),b=lk2Num(d[lk2K(t.id,r,c.b)]);o[c.k]=isFinite(a)&&isFinite(b)?a-b:NaN}
   });
   return o;
  });
 });
 return out;
}
/* Kelengkapan tabel: bagian sel isian (bukan kolom hitung) yang terisi, 0..1. */
function lk2TabelPct(m,d){
 var tot=0,ok=0;
 m.v2.tabel.forEach(function(t){t.baris.forEach(function(lb,r){t.kol.forEach(function(c){if(c.t==='rata'||c.t==='selisih')return;tot++;if(lk2Txt(d[lk2K(t.id,r,c.k)])!=='')ok++})})});
 return tot?ok/tot:0;
}
/* Gerbang masuk: soal PG (t:'pg'|'kompleks'|'kategori', format sama dengan m.quiz) atau soal isian lama (q + kunci teks).
   Jawaban soal PG disimpan di d['q'+(100+i)] (indeks 100 ke atas dipakai agar tidak bertabrakan dengan m.quiz yang berindeks 0..n), dibaca
   oleh pembaca jawaban lkpd-soal.js dan dinilai oleh fungsi soal yang sama. Soal isian lama tetap memakai d['gate'+i]. */
var LK2_GOFF=100;
function lk2GPG(q){return !!(q&&(q.o||q.rows))}
function lk2GKey(i){return 'q'+(LK2_GOFF+i)}
function lk2GOk(q,i,d){return lk2GPG(q)?lkqAnswered(q,d[lk2GKey(i)]):lk2Txt(d['gate'+i]).length>=3}
function lk2GBenar(q,i,d){return lk2GPG(q)&&lkqAnswered(q,d[lk2GKey(i)])&&lkqPoint(q,d[lk2GKey(i)])>=1}
function lk2Gate(m,d){var qs=m.v2.gate.qs,n=qs.filter(function(x,i){return lk2GOk(x,i,d)}).length,b=qs.filter(function(x,i){return lk2GBenar(x,i,d)}).length;return {n:n,total:qs.length,ok:n===qs.length,benar:b}}
function lk2Ana(m,d){return m.v2.analisis.filter(function(x,i){return lk2Txt(d['ana'+i]).length>=15}).length}

/* ---------- Penilaian otomatis (nilai koreksi guru tetap menggantikan) ---------- */
var _lkScore2=lkScore;
lkScore=function(d){
 var m=lk2Cur();if(!lk2Is(m))return _lkScore2(d);
 var r=m.rubric,safe=m.safety.filter(function(x,i){return d['safe'+i]}).length,work=m.steps.filter(function(x,i){return d['step'+i]}).length,
  rows=m.checks.filter(function(x,i){return lkRowOk(d,i)}).length,correct=0,answered=0;
 m.quiz.forEach(function(q,i){if(lkqAnswered(q,d['q'+i]))answered++;correct+=lkqPoint(q,d['q'+i])});
 var chk=(rows/m.checks.length+lk2TabelPct(m,d))/2,ana=lk2Ana(m,d)/m.v2.analisis.length;
 var practice=Math.round(work/m.steps.length*r.steps+safe/m.safety.length*r.safety+chk*r.checks+ana*r.analysis),
  theory=m.quiz.length?Math.round(correct/m.quiz.length*100):0;
 return {practice:practice,theory:theory,final:Math.round(practice*(r.practiceWeight/100)+theory*(r.theoryWeight/100)),answered:answered,correct:correct};
};
var _lkRead2=lkRead;
lkRead=function(){
 var d=_lkRead2(),m=lk2Cur();
 if(lk2Is(m)){var c=lk2Calc(m,d),g=lk2Gate(m,d);d.v2={ver:2,calc:c,gate:g.n,tabel:Math.round(lk2TabelPct(m,d)*100)}}
 return d;
};
var _lkProgress2=lkProgress;
lkProgress=function(m,d){
 var h=_lkProgress2(m,d);if(!lk2Is(m))return h;
 var g=lk2Gate(m,d),t=Math.round(lk2TabelPct(m,d)*100);
 return '<span class="lk-prog'+(g.ok?' done':'')+'">Gerbang '+g.n+'/'+g.total+'</span><span class="lk-prog'+(t===100?' done':'')+'">Tabel '+t+'%</span>'+h;
};
var _lkSubmit2=lkSubmit;
lkSubmit=function(){
 var m=lk2Cur();
 if(lk2Is(m)&&!LK.preview){var g=lk2Gate(m,lkRead());if(!g.ok){toast('Jawab semua pertanyaan gerbang masuk dulu ('+g.n+' dari '+g.total+')');LK.tab='materi';render();return}}
 return _lkSubmit2();
};

/* ---------- Tampilan siswa ---------- */
function lk2Chk(d,key,label){return '<label class="lk-check"><input type="checkbox" data-lk-check="'+key+'" '+(d[key]?'checked':'')+'><span>'+label+'</span></label>'}
function lk2Rencana(m){
 var V=m.v2,tot=V.pertemuan.reduce(function(t,p){return t+p.menit},0),jp=V.pertemuan.reduce(function(t,p){return t+p.jp},0);
 return '<section class="card"><h2>Rencana pertemuan</h2><p class="note">'+V.pertemuan.length+' pertemuan · '+jp+' JP · '+tot+' menit. Ketuk satu pertemuan untuk melihat kegiatannya.</p>'+V.pertemuan.map(function(p){
  var ls=[];p.kegiatan.forEach(function(k){V.langkah.forEach(function(l){if(l.k===k)ls.push('<li>'+lkEsc(String(m.steps[l.i][0]).replace(/^Kegiatan \d+ · /,''))+(l.saksi?' <span class="lk2-saksi">saksi guru</span>':'')+'</li>')})});
  var isi=p.kegiatan.length?'<p class="note">'+p.kegiatan.map(function(k){return 'Kegiatan '+k+' · '+lkEsc(V.kegiatan[k-1])}).join('; ')+'</p><ul class="plain">'+ls.join('')+'</ul>':'<p class="note">'+(p.n===1?'Jawab gerbang masuk dan centang butir K3 di tab ini, lalu periksa alat.':'Penilaian kinerja oleh guru, refleksi, remedial atau pengayaan.')+'</p>';
  return lk2Det('p'+p.n,'Pertemuan '+p.n,p.jp+' JP · '+p.menit+' menit · '+lkEsc(p.judul),isi);
 }).join('')+'</section>';
}
function lk2K3(m,d){
 var V=m.v2,g=V.k3grup||[{judul:'',i:m.safety.map(function(x,i){return i})}];
 return '<section class="card"><h2>Keselamatan dan Kesehatan Kerja (K3)</h2><p class="note">Centang setiap butir yang sudah kamu penuhi sebelum mulai praktik. Guru memberi paraf pada butir APD saat memeriksa (terlihat di Detail setelah dikirim).</p>'+
  g.map(function(x){return (x.judul?'<h3 class="lk2-grp">'+lkEsc(x.judul)+'</h3>':'')+'<div class="lk-checks">'+x.i.map(function(i){return lk2Chk(d,'safe'+i,lkEsc(m.safety[i]))}).join('')+'</div>'}).join('')+'</section>';
}
function lk2Materi(m,d){
 var V=m.v2,g=lk2Gate(m,d);
 return '<section class="card"><h2>Tujuan pembelajaran</h2><ul class="plain">'+m.objectives.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul></section>'+
  lk2Rencana(m)+
  '<section class="card"><h2>Memahami</h2>'+m.theory.map(function(x){return '<p><b>'+lkEsc(x[0])+'</b><br>'+lkEsc(x[1])+'</p>'}).join('')+'</section>'+
  '<section class="card" id="lk2-gate"><h2>Gerbang masuk praktik</h2><p class="note">Jawab semua soal agar Lembar Kerja terbuka. Syarat lulus gerbang minimal '+V.gate.min+' dari '+g.total+' soal benar; guru memeriksa jawabanmu.</p>'+
  V.gate.qs.map(function(x,i){if(lk2GPG(x))return lkqRender(x,LK2_GOFF+i,d).replace('<b>'+(LK2_GOFF+i+1)+'. ','<b>'+(i+1)+'. ');return '<label class="f">'+(i+1)+'. '+lkEsc(x.q)+'<textarea data-lk-field="gate'+i+'" rows="2">'+lkEsc(d['gate'+i]||'')+'</textarea></label>'}).join('')+
  '<p class="note">Terjawab '+g.n+' dari '+g.total+(g.ok?'. Lembar Kerja terbuka.':'.')+'</p></section>'+
  '<section class="card"><h2>Alat dan bahan</h2><ul class="plain">'+m.tools.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul></section>'+
  lk2K3(m,d);
}
function lk2StepHtml(m,i,d){
 var s=m.steps[i],V=m.v2.langkah[i],t=String(s[0]).replace(/^Kegiatan \d+ · /,'');
 return '<label class="lk-step"><input type="checkbox" data-lk-check="step'+i+'" '+(d['step'+i]?'checked':'')+'><span><b>'+lkEsc(t)+'</b>'+(V.saksi?'<span class="lk2-saksi">saksi guru</span>':'')+'<small>Poin kritis: '+lkEsc(s[2])+'</small></span></label>';
}
function lk2TabelHtml(m,t,d,c){
 var head=t.kol.map(function(k,j){return '<th>'+lkEsc(k.l)+'</th>'+(j===0&&t.labelBaris?'<th>'+lkEsc(t.labelBaris)+'</th>':'')}).join('');
 var rows=t.baris.map(function(lb,r){
  return '<tr>'+t.kol.map(function(k,j){
   var key=lk2K(t.id,r,k.k),cell;
   if(k.t==='rata'||k.t==='selisih')cell='<span class="mono" data-lk2-calc="'+t.id+'|'+r+'|'+k.k+'">'+lk2Fmt(c[t.id][r][k.k])+'</span>';
   else if(k.t==='status')cell='<select data-lk-field="'+key+'" aria-label="'+lkEsc(k.l)+'">'+['','Sesuai','Tidak sesuai'].map(function(o){return '<option'+(d[key]===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select>';
   else cell='<input '+(k.t==='num'?'inputmode="decimal" ':'')+'data-lk-field="'+key+'" data-lk2-t="1" value="'+lkEsc(d[key]||'')+'" aria-label="'+lkEsc(k.l)+(t.baris.length>1?' baris '+(r+1):'')+'">';
   return '<td data-label="'+lkEsc(k.l)+'">'+cell+'</td>'+(j===0&&t.labelBaris?'<td data-label="'+lkEsc(t.labelBaris)+'">'+lkEsc(lb)+'</td>':'');
  }).join('')+'</tr>';
 }).join('');
 return '<h4>'+lkEsc(t.judul)+'</h4><div class="tablewrap"><table class="lk2-t"><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></div><p class="note">Kolom rata-rata dan selisih dihitung otomatis dari angka yang kamu isi.</p>';
}
function lk2CekHtml(m,i,d){
 var x=m.checks[i];
 return '<div class="lk2-cek"><b>'+lkEsc(x[0])+'</b><small class="note">'+lkEsc(x[1])+'</small>'+(typeof ldRowCam==='function'?ldRowCam(i):'')+
  '<div class="formgrid"><label class="f">Hasil aktual<input data-lk-field="actual'+i+'" value="'+lkEsc(d['actual'+i]||'')+'"></label>'+
  '<label class="f">Standar manual<input data-lk-field="standard'+i+'" value="'+lkEsc(d['standard'+i]||'')+'">'+(x[2]?'<small class="lk-acuan">Acuan: '+lkEsc(x[2])+'</small>':'')+'</label>'+
  '<label class="f">Status<select data-lk-field="status'+i+'">'+['Belum diperiksa','Baik','Perlu tindakan','Tidak aman'].map(function(o){return '<option'+(d['status'+i]===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Catatan<input data-lk-field="note'+i+'" value="'+lkEsc(d['note'+i]||'')+'"></label></div>'+lk2Chk(d,'row'+i,'Sudah terisi')+'</div>';
}
function lk2Kerja(m,d){
 var V=m.v2,g=lk2Gate(m,d),c=lk2Calc(m,d);
 if(!g.ok&&!isStaff()&&!LK2.cetak)return '<section class="card"><h2>Lembar Kerja terkunci</h2><p>Jawab semua pertanyaan gerbang masuk di tab Materi dulu ('+g.n+' dari '+g.total+' terjawab).</p><button type="button" class="btn primary" data-act="lk-tab" data-v="materi">Ke gerbang masuk</button></section>';
 var h='<section class="card"><h2>Identitas praktik</h2><div class="formgrid">'+[['school','Sekolah',typeof schNama==='function'?schNama():''],['student','Nama siswa',S.user.nama],['class','Kelas',S.user.kelas||'X'],['group','Kelompok',''],['date','Tanggal',ymd(Date.now())],['teacher','Guru/instruktur',''],['meter','Alat ukur yang dipakai (ketelitian)','']].map(function(x){return '<label class="f">'+x[1]+'<input data-lk-field="'+x[0]+'" value="'+lkEsc(d[x[0]]||x[2])+'" '+(['student','class'].indexOf(x[0])>-1?'readonly':'')+'></label>'}).join('')+'</div></section>';
 V.pertemuan.forEach(function(p){
  h+='<section class="card lk2-p"><div class="row sb"><h2>Pertemuan '+p.n+'</h2><span class="pill">Target '+p.menit+' menit</span></div><p class="note">'+lkEsc(p.judul)+'</p>';
  if(!p.kegiatan.length)h+='<p class="note">'+(p.n===1?'Isi gerbang masuk dan daftar APD di tab Materi.':'Penilaian kinerja oleh guru. Lengkapi analisis dan refleksi di bawah.')+'</p>';
  p.kegiatan.forEach(function(k){
   h+='<h3>Kegiatan '+k+' · '+lkEsc(V.kegiatan[k-1])+'</h3>'+
    V.langkah.filter(function(l){return l.k===k}).map(function(l){return lk2StepHtml(m,l.i,d)}).join('')+
    V.tabel.filter(function(t){return t.k===k}).map(function(t){return lk2TabelHtml(m,t,d,c)}).join('')+
    '<h4>Pemeriksaan dan bukti</h4>'+V.cekK.map(function(kk,i){return kk===k?lk2CekHtml(m,i,d):''}).join('');
  });
  h+='<label class="f">Waktu aktual pertemuan '+p.n+' (menit)<input inputmode="numeric" data-lk-field="mt'+p.n+'" value="'+lkEsc(d['mt'+p.n]||'')+'"></label></section>';
 });
 h+='<section class="card"><h2>Analisis dan keputusan teknis</h2>'+V.analisis.map(function(q,i){return '<label class="f">'+(i+1)+'. '+lkEsc(q)+'<textarea data-lk-field="ana'+i+'">'+lkEsc(d['ana'+i]||'')+'</textarea></label>'}).join('')+'</section>'+
  '<section class="card"><h2>Refleksi</h2>'+V.refleksi.map(function(q,i){return '<label class="f">'+(i+1)+'. '+lkEsc(q)+'<textarea data-lk-field="ref'+i+'">'+lkEsc(d['ref'+i]||'')+'</textarea></label>'}).join('')+'</section>'+
  (typeof lkFotoSection==='function'?lkFotoSection():'');
 return h;
}
function lk2Eval(m,d){
 var O=m.v2.obs,nm=['','Kurang','Cukup','Baik','Sangat baik'],
  asp=O.aspek.map(function(a,i){
   var lv=[4,3,2,1].map(function(s){return '<li><b>Skor '+s+'</b> ('+nm[s]+'): '+lkEsc(a.d[s])+'</li>'}).join('');
   return lk2Det('a'+a.id,(i+1)+'. '+lkEsc(a.n),'Bobot '+a.b+'%'+(a.stop?' · aspek penghenti':''),(a.ket?'<p>'+lkEsc(a.ket)+'</p>':'')+'<ul class="plain">'+lv+'</ul>'+(a.stop?'<p class="note"><b>Penting:</b> skor 1 pada aspek ini menghentikan praktik dan keputusan menjadi Belum kompeten.</p>':''));
  }).join(''),
  pg=(O.panduan||[]).map(function(x,i){return lk2Det('g'+i,lkEsc(x.k),'',(x.lihat?'<p><b>Yang diamati:</b> '+lkEsc(x.lihat)+'</p>':'')+(x.salah?'<p><b>Kesalahan umum:</b> '+lkEsc(x.salah)+'</p>':''))}).join('');
 return '<section class="card"><h2>Latihan membaca skala (F4)</h2><p class="note">Hitung dari soal, lalu isi angkanya. Dinilai otomatis dengan toleransi pembulatan kecil.</p>'+lkqQuizHtml(m,d)+'</section>'+
  '<section class="card"><h2>Penilaian kinerja oleh guru</h2><p class="note">Guru menilai selama praktik (Pertemuan 2–5) dan menyaksikan langkah bertanda saksi guru. Tiap aspek diberi skor 1–4. Ketuk aspek untuk melihat poin yang dinilai dan arti tiap skor.</p>'+asp+
  '<p class="note"><b>Cara hitung:</b> nilai = jumlah dari (skor ÷ 4 × bobot), maksimum 100. Contoh: skor 3 pada Prosedur kerja (30%) memberi 3 ÷ 4 × 30 = 22,5.</p></section>'+
  '<section class="card"><h2>Syarat kompeten</h2><p class="note">Kompeten bila semua indikator di bawah tercapai, semua aspek sudah dinilai, dan skor Persiapan dan K3 bukan 1. Ketuntasan nilai mengikuti KKTP sekolah.</p><ul class="plain">'+O.indikator.map(function(x){return '<li><b>'+lkEsc(x.t)+'</b><br><small class="note">Bukti: '+lkEsc(x.bukti)+'</small></li>'}).join('')+'</ul></section>'+
  (pg?'<section class="card"><h2>Yang diamati dan kesalahan umum</h2><p class="note">Pelajari sebelum praktik agar kesalahan umum bisa dihindari.</p>'+pg+'</section>':'')+
  '<section class="card"><div class="note">Nilai otomatis di aplikasi hanya perkiraan awal dari kelengkapan pengisian. Nilai akhir ditentukan guru lewat Observasi LKPD Praktik v2 dan nilai koreksi.</div></section>';
}
function lk2View(m){
 var d=lkDraft(),staff=isStaff(),tabs=[['materi','Materi &amp; Prosedur'],['kerja','Lembar Kerja'],['evaluasi','Evaluasi'],['riwayat',staff?'Rekap LKPD':'Riwayat']];
 var nav=(staff?'<div class="chips"><button data-act="lk-tab" data-v="editor" aria-pressed="false">Editor Guru</button>'+(LK.preview?'<button data-act="lk-print">Cetak</button>':'')+'</div>':'')+
  '<div class="chips">'+tabs.map(function(t){return '<button data-act="lk-tab" data-v="'+t[0]+'" aria-pressed="'+(LK.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
 var body=LK.tab==='materi'?lk2Materi(m,d):LK.tab==='kerja'?lk2Kerja(m,d):lk2Eval(m,d);
 return (LK.preview&&staff?'<div class="row"><button class="btn small" data-act="lk-preview-exit">Keluar pratinjau</button></div>':'')+
  '<div class="row sb"><div><span class="pill">Fase '+lkEsc(m.fase)+' · Kelas '+lkEsc(m.kelas)+'</span><h2>'+lkEsc(m.title)+'</h2><p class="note">'+lkEsc(m.unit)+' · '+m.v2.jp+' JP ('+m.duration+' menit, '+m.v2.pertemuan.length+' pertemuan)</p></div><span class="pill">LKPD '+lkEsc(m.id)+' · v2</span></div>'+
  nav+body+(LK.preview&&staff?'':'<div class="lk-actions"><div class="lk-progress" id="lk-progress">'+lkProgress(m,d)+'</div><div class="row"><button class="btn" data-act="lk-save">Simpan draf</button><button class="btn primary" data-act="lk-submit">Kirim LKPD</button><button class="btn" data-act="lk-print">Cetak</button></div><div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small" data-act="lk2-backup">Cadangkan draf (berkas)</button><label class="btn small" style="cursor:pointer">Pulihkan draf<input type="file" accept="application/json,.json" data-lk2-restore hidden></label></div><p class="note">Draf tersimpan di perangkat ini. Untuk LKPD beberapa pertemuan, cadangkan draf ke berkas setelah tiap pertemuan.</p></div>');
}
var _viewLKPD2=viewLKPD;
viewLKPD=function(){
 if(LK.detail||LK.editor)return _viewLKPD2();
 var m=lk2Cur();
 if(!lk2Is(m)||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return _viewLKPD2();
 if(!isStaff()&&!(m.status==='published'&&m.active!==false))return _viewLKPD2();
 return lk2View(m);
};

/* ---------- Detail guru: verifikasi gerbang, saksi langkah, paraf APD ---------- */
function lk2Detail(z,p,m){
 var V=m.v2,vf=(p.v2&&p.v2.verif)||{},staff=isStaff(),calc=lk2Calc(m,p),h='',
  vg=vf.g||{},vs=vf.s||{},va=vf.a||{},nG=0,
  mark=function(ok){return ok?'<span class="lk2-ok">✓</span>':'<span class="note">belum</span>'};
 h+='<h3>Identitas</h3><div class="lk-kv">'+[['Sekolah',p.school],['Nama siswa',p.student],['Kelas',p.class],['Kelompok',p.group],['Tanggal',p.date],['Guru/instruktur',p.teacher],['Alat ukur',p.meter]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+lkEsc(x[1]||'-')+'</b></div>'}).join('')+'</div>';
 var auto=!vf.ts; /* sebelum guru menyimpan verifikasi, kotak Jawaban benar terisi dari penilaian otomatis soal PG */
 var gOn=function(x,i){return vg[i]||(auto&&lk2GBenar(x,i,p))};
 nG=V.gate.qs.filter(gOn).length;
 h+='<div id="lk2-verif"><h3>Gerbang masuk</h3>'+V.gate.qs.map(function(x,i){
  var pg=lk2GPG(x),a=p[lk2GKey(i)],on=gOn(x,i),v=pg?lkqVerdict(x,a):null,txt=pg?lkqAnsText(x,a):(p['gate'+i]||'-');
  return '<p><b>'+(i+1)+'. '+lkEsc(x.q)+'</b>'+(x.lvl?' <span class="pill plain">'+lkEsc(x.lvl)+'</span>':'')+'<br><span class="lk-text">'+lkEsc(txt||'-')+'</span>'+(pg&&v[1]!=='Belum dijawab'?' · <b>'+lkEsc(v[1].toLowerCase())+'</b>':'')+
   (staff?'<br><small class="lk2-key">Kunci: '+lkEsc(pg?lkqKeyText(x):x.kunci)+'</small>'+(pg&&x.e?'<br><small class="lk2-key">'+lkEsc(x.e)+'</small>':'')+'<br><label class="lk-check"><input type="checkbox" data-lk2v="g'+i+'" '+(on?'checked':'')+'><span>Jawaban benar</span></label>':'<br>'+mark(on))+'</p>';
 }).join('')+'<p class="note">Dinilai guru: '+nG+' dari '+V.gate.qs.length+' benar (syarat minimal '+V.gate.min+'): <b>'+(nG>=V.gate.min?'lulus':'belum lulus')+'</b>'+(vf.ts?'':' · belum diverifikasi')+'</p>';
 h+='<h3>Daftar APD</h3>'+V.apd.map(function(i){return '<div class="lk-check"><span>'+lkEsc(m.safety[i])+' · siswa: '+(p['safe'+i]?'ada':'belum')+'</span>'+(staff?'<label class="lk-check"><input type="checkbox" data-lk2v="a'+i+'" '+(va[i]?'checked':'')+'><span>Paraf guru</span></label>':' '+mark(va[i]))+'</div>'}).join('');
 h+='<h3>Langkah kerja</h3>'+V.langkah.map(function(l){
  var t=String(m.steps[l.i][0]).replace(/^Kegiatan \d+ · /,'');
  return '<div class="lk-check"><span>K'+l.k+' · '+lkEsc(t)+' · siswa: '+(p['step'+l.i]?'selesai':'belum')+(l.saksi?' · <b>saksi guru</b>':'')+'</span>'+(l.saksi?(staff?'<label class="lk-check"><input type="checkbox" data-lk2v="s'+l.i+'" '+(vs[l.i]?'checked':'')+'><span>Disaksikan</span></label>':' '+mark(vs[l.i])):'')+'</div>';
 }).join('');
 if(staff)h+='<div class="row"><button type="button" class="btn primary" data-act="lk2-verif">Simpan verifikasi guru</button></div>'+(vf.ts?'<p class="note">Terakhir diverifikasi '+lkEsc(vf.by||'-')+' · '+new Date(vf.ts).toLocaleString('id-ID')+'</p>':'');
 h+='</div>';
 h+='<h3>Data hasil pengukuran</h3>'+V.tabel.map(function(t){
  return '<h4>'+lkEsc(t.judul)+'</h4><div class="tablewrap"><table><thead><tr>'+t.kol.map(function(k,j){return '<th>'+lkEsc(k.l)+'</th>'+(j===0&&t.labelBaris?'<th>'+lkEsc(t.labelBaris)+'</th>':'')}).join('')+'</tr></thead><tbody>'+
   t.baris.map(function(lb,r){return '<tr>'+t.kol.map(function(k,j){var v=(k.t==='rata'||k.t==='selisih')?lk2Fmt(calc[t.id][r][k.k]):p[lk2K(t.id,r,k.k)];return '<td data-label="'+lkEsc(k.l)+'">'+lkEsc(v||'-')+'</td>'+(j===0&&t.labelBaris?'<td data-label="'+lkEsc(t.labelBaris)+'">'+lkEsc(lb)+'</td>':'')}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
 }).join('');
 h+='<h3>Hasil pemeriksaan dan foto bukti</h3><div class="tablewrap"><table><thead><tr><th>Komponen</th><th>Hasil aktual</th><th>Standar manual</th><th>Status</th><th>Catatan</th></tr></thead><tbody>'+m.checks.map(function(x,i){return '<tr><td data-label="Komponen">'+lkEsc(x[0])+(typeof ldDetailFoto==='function'?ldDetailFoto(z,i):'')+'</td><td data-label="Hasil aktual">'+lkEsc(p['actual'+i]||'-')+'</td><td data-label="Standar manual">'+lkEsc(p['standard'+i]||'-')+'</td><td data-label="Status">'+lkEsc(p['status'+i]||'Belum diperiksa')+'</td><td data-label="Catatan">'+lkEsc(p['note'+i]||'-')+'</td></tr>'}).join('')+'</tbody></table></div>';
 h+='<h3>Waktu per pertemuan</h3><p class="note">'+V.pertemuan.map(function(q){return 'P'+q.n+': '+lkEsc(p['mt'+q.n]||'-')+' / '+q.menit+' menit'}).join(' · ')+'</p>';
 h+='<h3>Latihan membaca skala (F4)</h3>'+m.quiz.map(function(q,i){return lkqDetail(q,i,p['q'+i])+(staff?'<small class="lk2-key">Kunci: '+lkEsc(lkqKeyText(q))+(q.e?' · '+lkEsc(q.e):'')+'</small>':'')}).join('');
 h+='<h3>Analisis dan refleksi</h3>'+V.analisis.map(function(q,i){return '<p><b>'+(i+1)+'. '+lkEsc(q)+'</b><br><span class="lk-text">'+lkEsc(p['ana'+i]||'-')+'</span></p>'}).join('')+V.refleksi.map(function(q,i){return '<p><b>R'+(i+1)+'. '+lkEsc(q)+'</b><br><span class="lk-text">'+lkEsc(p['ref'+i]||'-')+'</span></p>'}).join('');
 return h;
}
var _lkDetailBody2=lkDetailBody;
lkDetailBody=function(z,p){
 var m=(LKPD_MODULES||[]).find(function(x){return x.id===z.moduleId});
 if(!lk2Is(m))return _lkDetailBody2(z,p);
 if(!p||typeof p!=='object')p={};
 return lk2Detail(z,p,m);
};

/* ---------- Peristiwa ---------- */
/* Hitung ulang kolom rata-rata/selisih saat siswa mengetik, tanpa merender ulang (fokus tidak hilang). */
document.addEventListener('input',function(e){
 var t=e.target;if(!t.matches||!t.matches('[data-lk2-t]'))return;
 var m=lk2Cur();if(!lk2Is(m))return;
 var c=lk2Calc(m,lkRead());
 document.querySelectorAll('[data-lk2-calc]').forEach(function(el){var a=el.dataset.lk2Calc.split('|'),o=c[a[0]]&&c[a[0]][+a[1]];el.textContent=o?lk2Fmt(o[a[2]]):''});
});
/* Simpan verifikasi guru (gerbang, saksi, paraf APD) ke payload pengumpulan. */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="lk2-verif"]');if(!b||!isStaff()||!LK.detail)return;
 var z=(S.lkpd||[]).find(function(x){return x.id===LK.detail.id})||LK.detail,p;
 try{p=JSON.parse(z.payload||'{}')}catch(x){p={}}
 var vf={g:{},s:{},a:{}};
 document.querySelectorAll('#lk2-verif [data-lk2v]').forEach(function(el){if(el.checked)vf[el.dataset.lk2v.charAt(0)][el.dataset.lk2v.slice(1)]=1});
 vf.by=String(S.user.nama||'').slice(0,128);vf.ts=Date.now();
 p.v2=p.v2||{ver:2};p.v2.verif=vf;
 z.payload=JSON.stringify(p);z.d=1;LK.detail=z;
 if(Cloud.on)persist();else save();
 render();toast('Verifikasi guru tersimpan');
});
/* Editor LKPD lama belum memahami struktur v2: cegah penyuntingan/duplikasi agar data v2 tidak rusak. */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="lkc-edit"],[data-act="lk-edit"],[data-act="lk-clone"]');if(!b)return;
 var m=(LKPD_MODULES||[]).find(function(x){return x.id===b.dataset.v});
 if(lk2Is(m)){e.stopImmediatePropagation();e.preventDefault();toast('LKPD v2 belum bisa diedit lewat Editor lama. Editor v2 menyusul.')}
},true);

/* ---------- Cetak: Lembar Kerja tetap tercetak walau gerbang belum selesai ---------- */
document.addEventListener('click',function(e){
 if(!e.target.closest||!e.target.closest('[data-act="lk-print"]'))return;
 LK2.cetak=true;setTimeout(function(){LK2.cetak=false},0);
},true);

/* ---------- Cadangan dan pemulihan draf (draf LKPD hanya ada di perangkat) ---------- */
function lk2DrafBersih(x){
 var out={};if(!x||typeof x!=='object'||Array.isArray(x))return out;
 Object.keys(x).forEach(function(k){
  if(!/^[A-Za-z0-9_]{1,60}$/.test(k))return;
  var v=x[k],t=typeof v;
  if(t==='string')out[k]=v.slice(0,8000);
  else if(t==='number'||t==='boolean')out[k]=v;
  else if(v&&t==='object'&&JSON.stringify(v).length<20000)out[k]=v;
 });
 return out;
}
LK2.bersih=lk2DrafBersih;
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="lk2-backup"]');if(!b)return;
 var m=lk2Cur();if(!lk2Is(m))return;
 var d=lk2DrafBersih(Object.assign({},lkDraft(),lkRead()));delete d.v2;
 var pk={app:'tbsm-lkpd-draf',mod:m.id,uid:S.user.id,nama:S.user.nama||'',ts:Date.now(),data:d};
 var a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify(pk)],{type:'application/json'}));
 a.download=m.id+'_draf_'+String(S.user.nama||'siswa').replace(/[^A-Za-z0-9]+/g,'-')+'_'+ymd(Date.now())+'.json';
 document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},800);
 toast('Draf dicadangkan ke berkas');
});
document.addEventListener('change',function(e){
 var t=e.target;if(!t.matches||!t.matches('[data-lk2-restore]'))return;
 var f=t.files&&t.files[0];t.value='';if(!f)return;
 if(f.size>2000000){toast('Berkas terlalu besar untuk draf LKPD');return}
 var r=new FileReader();
 r.onload=function(){
  var pk,m=lk2Cur();try{pk=JSON.parse(r.result)}catch(x){toast('Berkas bukan draf LKPD');return}
  if(!pk||pk.app!=='tbsm-lkpd-draf'||!pk.data||typeof pk.data!=='object'){toast('Berkas bukan draf LKPD');return}
  if(!lk2Is(m)||pk.mod!==m.id){toast('Draf ini untuk LKPD '+lk2Txt(pk.mod)+', bukan LKPD yang sedang dibuka');return}
  if(pk.uid!==S.user.id){toast('Draf ini milik akun lain');return}
  uiConfirm('Ganti isian draf di perangkat ini dengan draf cadangan?',{ok:'Pulihkan'}).then(function(ok){
   if(!ok)return;
   try{localStorage.setItem(lkKey(),JSON.stringify(lk2DrafBersih(pk.data)))}catch(x){toast('Gagal menyimpan draf di perangkat');return}
   render();toast('Draf dipulihkan');
  });
 };
 r.readAsText(f);
});

