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
function lk2Gate(m,d){var qs=m.v2.gate.qs,n=qs.filter(function(x,i){return lk2Txt(d['gate'+i]).length>=3}).length;return {n:n,total:qs.length,ok:n===qs.length}}
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
function lk2Materi(m,d){
 var V=m.v2,g=lk2Gate(m,d),h='<section class="card"><h2>Tujuan pembelajaran</h2><ul class="plain">'+m.objectives.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul>'+
  '<h3>Rencana pertemuan</h3><div class="tablewrap"><table><thead><tr><th>Pertemuan</th><th>JP</th><th>Menit</th><th>Kegiatan</th></tr></thead><tbody>'+
  V.pertemuan.map(function(p){return '<tr><td data-label="Pertemuan">'+p.n+'</td><td data-label="JP">'+p.jp+'</td><td data-label="Menit">'+p.menit+'</td><td data-label="Kegiatan">'+lkEsc(p.judul)+'</td></tr>'}).join('')+'</tbody></table></div></section>'+
  '<section class="card"><h2>Memahami</h2>'+m.theory.map(function(x){return '<p><b>'+lkEsc(x[0])+'</b><br>'+lkEsc(x[1])+'</p>'}).join('')+'</section>'+
  '<section class="card" id="lk2-gate"><h2>Gerbang masuk praktik</h2><p class="note">Jawab semua pertanyaan agar Lembar Kerja terbuka. Guru memeriksa jawabanmu; syarat lulus minimal '+V.gate.min+' dari '+g.total+' benar.</p>'+
  V.gate.qs.map(function(x,i){return '<label class="f">'+(i+1)+'. '+lkEsc(x.q)+'<textarea data-lk-field="gate'+i+'" rows="2">'+lkEsc(d['gate'+i]||'')+'</textarea></label>'}).join('')+
  '<p class="note">Terjawab '+g.n+' dari '+g.total+(g.ok?'. Lembar Kerja terbuka.':'.')+'</p></section>'+
  '<section class="card"><h2>Alat dan bahan</h2><ul class="plain">'+m.tools.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul>'+
  '<h2>K3 dan APD</h2><p class="note">Centang bila sudah siap. Paraf guru pada daftar APD diberikan di Detail setelah dikirim.</p><div class="lk-checks">'+m.safety.map(function(x,i){return lk2Chk(d,'safe'+i,lkEsc(x))}).join('')+'</div></section>';
 return h;
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
 if(!g.ok&&!isStaff())return '<section class="card"><h2>Lembar Kerja terkunci</h2><p>Jawab semua pertanyaan gerbang masuk di tab Materi dulu ('+g.n+' dari '+g.total+' terjawab).</p><button type="button" class="btn primary" data-act="lk-tab" data-v="materi">Ke gerbang masuk</button></section>';
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
 var A=m.v2.obs.aspek;
 return '<section class="card"><h2>Latihan membaca skala (F4)</h2><p class="note">Hitung dari soal, lalu isi angkanya. Dinilai otomatis dengan toleransi pembulatan kecil.</p>'+lkqQuizHtml(m,d)+'</section>'+
  '<section class="card"><h2>Penilaian kinerja oleh guru</h2><p class="note">Guru menilai kinerjamu saat praktik dengan rubrik berikut (skor 1–4 per aspek). Nilai = jumlah (skor ÷ 4 × bobot). Ketuntasan mengikuti KKTP sekolah.</p><div class="tablewrap"><table><thead><tr><th>Aspek</th><th>Bobot</th></tr></thead><tbody>'+
  A.map(function(a){return '<tr><td data-label="Aspek">'+lkEsc(a.n)+'</td><td data-label="Bobot">'+a.b+'%</td></tr>'}).join('')+'</tbody></table></div><div class="note">Nilai otomatis di aplikasi hanya perkiraan awal dari kelengkapan pengisian. Nilai akhir ditentukan guru lewat Observasi LKPD Praktik v2 dan nilai koreksi.</div></section>';
}
function lk2View(m){
 var d=lkDraft(),staff=isStaff(),tabs=[['materi','Materi &amp; Prosedur'],['kerja','Lembar Kerja'],['evaluasi','Evaluasi'],['riwayat',staff?'Rekap LKPD':'Riwayat']];
 var nav=(staff?'<div class="chips"><button data-act="lk-tab" data-v="editor" aria-pressed="false">Editor Guru</button>'+(LK.preview?'<button data-act="lk-print">Cetak</button>':'')+'</div>':'')+
  '<div class="chips">'+tabs.map(function(t){return '<button data-act="lk-tab" data-v="'+t[0]+'" aria-pressed="'+(LK.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
 var body=LK.tab==='materi'?lk2Materi(m,d):LK.tab==='kerja'?lk2Kerja(m,d):lk2Eval(m,d);
 return (LK.preview&&staff?'<div class="row"><button class="btn small" data-act="lk-preview-exit">Keluar pratinjau</button></div>':'')+
  '<div class="row sb"><div><span class="pill">Fase '+lkEsc(m.fase)+' · Kelas '+lkEsc(m.kelas)+'</span><h2>'+lkEsc(m.title)+'</h2><p class="note">'+lkEsc(m.unit)+' · '+m.v2.jp+' JP ('+m.duration+' menit, '+m.v2.pertemuan.length+' pertemuan)</p></div><span class="pill">LKPD '+lkEsc(m.id)+' · v2</span></div>'+
  nav+body+(LK.preview&&staff?'':'<div class="lk-actions"><div class="lk-progress" id="lk-progress">'+lkProgress(m,d)+'</div><div class="row"><button class="btn" data-act="lk-save">Simpan draf</button><button class="btn primary" data-act="lk-submit">Kirim LKPD</button><button class="btn" data-act="lk-print">Cetak</button></div></div>');
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
  vg=vf.g||{},vs=vf.s||{},va=vf.a||{},nG=Object.keys(vg).length,
  mark=function(ok){return ok?'<span class="lk2-ok">✓</span>':'<span class="note">belum</span>'};
 h+='<h3>Identitas</h3><div class="lk-kv">'+[['Sekolah',p.school],['Nama siswa',p.student],['Kelas',p.class],['Kelompok',p.group],['Tanggal',p.date],['Guru/instruktur',p.teacher],['Alat ukur',p.meter]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+lkEsc(x[1]||'-')+'</b></div>'}).join('')+'</div>';
 h+='<div id="lk2-verif"><h3>Gerbang masuk</h3>'+V.gate.qs.map(function(x,i){
  return '<p><b>'+(i+1)+'. '+lkEsc(x.q)+'</b><br><span class="lk-text">'+lkEsc(p['gate'+i]||'-')+'</span>'+
   (staff?'<br><small class="lk2-key">Kunci: '+lkEsc(x.kunci)+'</small><br><label class="lk-check"><input type="checkbox" data-lk2v="g'+i+'" '+(vg[i]?'checked':'')+'><span>Jawaban benar</span></label>':'<br>'+mark(vg[i]))+'</p>';
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
