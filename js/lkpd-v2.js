/* lkpd-v2.js: mesin LKPD v2 (aditif). Hanya aktif untuk modul yang memiliki objek `v2` (mis. LKPD-X-06); LKPD lama tidak berubah.
   Dimuat tepat setelah lkpd.js, sebelum lkpd-kelas.js dan pembungkus lain, sehingga banner mode, timer, dan daftar kelas tetap bekerja.
   Tambahan v2:
   - Pertemuan: rencana per pertemuan (JP/menit) dan waktu aktual per pertemuan (isian menit).
   - Gerbang masuk: dinilai otomatis dengan acuan TKA (PG 1/0; kompleks dan kategori nilai sebagian); Lembar Kerja terbuka bila nilai gerbang >= KKM (minimal 75). Gerbang adalah syarat kelayakan masuk praktik, bukan komponen nilai akhir.
   - Tabel data terstruktur dengan rata-rata dan selisih otomatis (kolom rata/selisih tidak diisi siswa).
   - Soal isian angka (t:'isian', kunci, tol) dinilai otomatis, sebagai tipe soal baru pada m.quiz.
   - Langkah bertanda saksi dan paraf APD, diverifikasi guru di Detail (disimpan di payload.v2.verif).
   Semua data siswa memakai kunci yang sama dengan mesin lama (step<i>, safe<i>, actual<i>, q<i>), jadi draf, foto bukti, nilai koreksi,
   rekap, dan sinkronisasi tidak berubah. Foto wajib memakai m.fotoWajib yang sudah ada. */
var LK2={};
(function(){var st=document.createElement('style');st.textContent=
'.lk2-p{border-left:4px solid var(--accent)}.lk2-mnt{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;background:var(--accent-soft,#e3f1e8);color:var(--accent);font-size:12px;font-weight:600;white-space:nowrap}.lk2-st{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start}'+
'.lk2-saksi{display:inline-block;margin-left:6px;font-size:11px;padding:1px 6px;border-radius:8px;border:1px solid var(--warn,#b8860b);color:var(--warn,#b8860b)}'+
'.lk2-t input,.lk2-t select{min-width:64px;width:100%}.lk2-t td,.lk2-t th{padding:4px}.lk2-cek{border-top:1px solid var(--line,#ddd);padding:10px 0;display:grid;gap:6px}'+
'.lk2-dt{border:1px solid var(--line,#ddd);border-radius:12px;margin:8px 0;background:var(--surface,#fff)}.lk2-dt>summary{cursor:pointer;list-style:none;padding:11px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px}.lk2-dt>summary::-webkit-details-marker{display:none}.lk2-dt>summary::after{content:"\\25B8";flex:none;transition:transform .15s}.lk2-dt[open]>summary::after{transform:rotate(90deg)}.lk2-ttl{display:grid;gap:2px}.lk2-ttl small{color:var(--muted,#666);font-size:12.5px;line-height:1.3}.lk2-bd{padding:0 14px 12px;font-size:14px}.lk2-bd ul{margin:6px 0}.lk2-grp{margin:12px 0 4px;font-size:14px}'+
'.lk2-ok{color:var(--ok,#1b7f3b);font-weight:600}.lk2-no{color:var(--bad,#b3261e);font-weight:600}.lk2-key{font-size:12.5px}';
document.head.appendChild(st)})();

/* ---------- Dasar ---------- */
function lk2Cur(){return (typeof LKPD_MODULES!=='undefined'&&LKPD_MODULES||[]).find(function(x){return x.id===LK.module})}

/* Bilah bawah: bila kunci per pertemuan aktif (lkpd-kunci.js) tombol kunci menggantikan cadangan berkas. */
function lk2Kunci(m){return typeof lkkOn==='function'&&lkkOn(m)}
function lk2BkBlock(m){
 if(lk2Kunci(m))return lkkBlock(m)+'<p class="note">Draf juga tersimpan otomatis di perangkat ini.</p>';
 return '<div class="lk2-bk"><button type="button" class="btn small" data-act="lk2-backup">Cadangkan draf (berkas)</button><label class="btn small" style="cursor:pointer">Pulihkan draf<input type="file" accept="application/json,.json" data-lk2-restore hidden></label></div><p class="note">Draf tersimpan di perangkat ini. Untuk LKPD beberapa pertemuan, cadangkan draf ke berkas setelah tiap pertemuan.</p>';
}
/* Kegiatan (kartu) yang sudah dikunci siswa (lkpd-kunci.js). Satuan kunci kartu dicari lewat peta isian: kunci kartu 'mt2' / 'mtk4' -> nomor satuan. */
function lk2Terkunci(m,key){
 try{if(typeof lkkOn!=='function'||!lkkOn(m)||!S.user)return false;var u=lkkKeyMap(m)[key];return !!(u&&lkkLocks(m)[u])}catch(e){return false}}
function lk2KunciIkon(m,key){
 if(LK2.cetak||!lk2Terkunci(m,key))return '';
 return '<span class="lk2-lock" role="img" aria-label="Kegiatan ini sudah dikunci" title="Kegiatan ini sudah dikunci"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>'}
function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}
/* Angka dengan koma desimal ("24,35") atau titik. Tidak valid → NaN. */
function lk2Num(s){if(typeof s==='number')return s;var t=String(s==null?'':s).trim().replace(/\s/g,'').replace(',','.');return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)?Number(t):NaN}
function lk2Fmt(n,dec){if(typeof n!=='number'||!isFinite(n))return '';var f=Math.pow(10,dec>=0?dec:3);return String(Math.round((n+Number.EPSILON*Math.abs(n))*f)/f).replace('.',',')}
function lk2K(tid,r,k){return 't_'+tid+'_'+r+'_'+k}
function lk2Dec(id){var m=lk2Cur(),t=m&&m.v2&&m.v2.tabel?m.v2.tabel.filter(function(x){return x.id===id})[0]:null;return t?t.dec:undefined}
function lk2Txt(x){return String(x==null?'':x).trim()}
/* Bagian lipat. Status buka/tutup diingat selama sesi; saat mencetak semua dibuka. */
function lk2DetB(id,t,b){return lk2Det(id,t,'',b)}
function lk2Det(id,ttl,sub,body){var op=LK2.cetak||(LK2.open&&LK2.open[id]);return '<details class="lk2-dt" data-lk2d="'+id+'"'+(op?' open':'')+'><summary><span class="lk2-ttl"><b>'+ttl+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span></summary><div class="lk2-bd">'+body+'</div></details>'}
/* Banner lipat (kartu bagian Materi dan Lembar Kerja). Tertutup secara bawaan; status buka/tutup diingat selama sesi (LK2.open, kunci 'bn-<id>'); cetak membuka semua. */
function lk2Bn(id,ttl,body,attr,sub){var op=LK2.cetak||(LK2.open&&LK2.open['bn-'+id]);return '<section class="card lk2-bn-c"'+(attr||'')+'><details class="lk2-bn" data-lk2d="bn-'+id+'"'+(op?' open':'')+'><summary><span class="lk2-ttl"><h2>'+ttl+'</h2>'+(sub?'<small>'+sub+'</small>':'')+'</span></summary><div class="lk2-bnb">'+body+'</div></details></section>'}
document.addEventListener('toggle',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.lk2d){LK2.open=LK2.open||{};LK2.open[t.dataset.lk2d]=t.open}},true);

/* ---------- Tabel data: rata-rata dan selisih otomatis ---------- */
function lk2Calc(m,d){
 var out={};
 m.v2.tabel.forEach(function(t){
  out[t.id]=t.baris.map(function(lb,r){
   var o={};
   t.kol.forEach(function(c){
    if(c.t==='rata'){var v=c.dari.map(function(k){return lk2Num(d[lk2K(t.id,r,k)])});
      /* Koreksi nol alat: hasil benar = bacaan - penyimpangan nol. Nol alat diperiksa sekali (nolSekali) atau per baris; kosong dianggap 0. */
      var hasNol=t.kol.some(function(x){return x.k==='nol'}),z=hasNol?lk2Num(d[lk2K(t.id,t.nolSekali?0:r,'nol')]):0;if(!isFinite(z))z=0;
      var mean=v.every(isFinite)?v.reduce(function(a,b){return a+b},0)/v.length-z:NaN;
      if(isFinite(mean)&&t.dec>=0){var f=Math.pow(10,t.dec);mean=Math.round((mean+Number.EPSILON*Math.abs(mean))*f)/f}
      o[c.k]=mean}
    else if(c.t==='selisih'){var a=lk2Num(d[lk2K(t.id,r,c.a)]),b=lk2Num(d[lk2K(t.id,r,c.b)]);o[c.k]=isFinite(a)&&isFinite(b)?a-b:NaN}
   });
   return o;
  });
 });
 return out;
}
/* Isi otomatis "Hasil aktual" (m.v2.cekAuto) dari tabel: nol alat = isian nol (1 kali di awal); rata-rata/keolengan = hasil hitung tabel. */
function lk2Auto(m,i,d,c){
 var A=m.v2&&m.v2.cekAuto&&m.v2.cekAuto[i];if(!A)return null;
 var t=m.v2.tabel.filter(function(x){return x.id===A.t})[0];if(!t)return null;
 if(A.f==='nol'){var z=lk2Txt(d[lk2K(t.id,0,'nol')]);return z===''?'':z+' mm'}
 c=c||lk2Calc(m,d);
 var a=[];t.baris.forEach(function(lb,r){var v=c[t.id]&&c[t.id][r]?c[t.id][r][A.f]:NaN;if(isFinite(v))a.push((t.baris.length>1?lb+' ':'')+lk2Fmt(v,t.dec))});
 return a.length?a.join('; ')+' mm':'';
}
/* Kelengkapan tabel: bagian sel isian (bukan kolom hitung) yang terisi, 0..1. */
function lk2TabelPct(m,d){
 if(!m.v2.tabel||!m.v2.tabel.length)return null; /* tanpa tabel: nilai pemeriksaan hanya dari Pemeriksaan dan bukti */
 var tot=0,ok=0;
 m.v2.tabel.forEach(function(t){t.baris.forEach(function(lb,r){t.kol.forEach(function(c){if(c.t==='rata'||c.t==='selisih')return;if(t.nolSekali&&c.k==='nol'&&r>0)return;tot++;if(lk2Txt(d[lk2K(t.id,r,c.k)])!=='')ok++})})});
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
/* Nilai gerbang memakai penilai soal TKA (lkqPoint): PG 1/0; kompleks (benar terpilih - salah terpilih) / jumlah kunci, minimal 0; kategori pernyataan tepat / jumlah pernyataan.
   Nilai gerbang = jumlah poin / jumlah soal x 100. Soal belum dijawab bernilai 0. Lembar Kerja terbuka bila nilai >= KKM gerbang (tidak pernah di bawah 75).
   Gerbang lama (soal isian teks, tanpa penilai otomatis): lulus bila semua soal terjawab. */
var LK2_KKM_MIN=75;
function lk2KkmGerbang(){return Math.max(LK2_KKM_MIN,+(typeof S!=='undefined'&&S.kkm)||0)}
function lk2GPoin(q,i,d){return lk2GPG(q)&&lkqAnswered(q,d[lk2GKey(i)])?lkqPoint(q,d[lk2GKey(i)]):0}
function lk2Gate(m,d){
 var qs=m.v2.gate.qs,n=qs.filter(function(x,i){return lk2GOk(x,i,d)}).length,b=qs.filter(function(x,i){return lk2GBenar(x,i,d)}).length,
  auto=qs.length>0&&qs.every(lk2GPG),poin=0,kkm=lk2KkmGerbang();
 qs.forEach(function(x,i){poin+=lk2GPoin(x,i,d)});
 poin=Math.round(poin*100)/100;
 var nilai=auto?Math.round(poin/qs.length*100):0,ok=n===qs.length;
 return {n:n,total:qs.length,ok:ok,benar:b,auto:auto,poin:poin,nilai:nilai,kkm:kkm,lulus:auto?nilai>=kkm:ok};
}
/* ---------- Praktik terverifikasi guru dan pembukaan Evaluasi ----------
   Evaluasi terbuka bila nilai praktik terverifikasi >= KKM evaluasi (75). Praktik terverifikasi = langkah (langkah bersaksi guru dihitung bila disaksikan)
   + K3 (butir APD dihitung bila berparaf) + pemeriksaan dan tabel + analisis (nilai 0-100 dari guru), dengan bobot m.rubric. Disimpan guru di payload.v2.verif. */
var LK2_KKM_EVALUASI=75;
function lk2KkmEvaluasi(){return Math.max(LK2_KKM_EVALUASI,+(typeof S!=='undefined'&&S.kkm)||0)}
function lk2PraktikV(m,p,vf){
 var V=m.v2,r=m.rubric,vs=(vf&&vf.s)||{},va=(vf&&vf.a)||{},saksi={},apd={};
 V.langkah.forEach(function(l){if(l.saksi)saksi[l.i]=1});
 (V.apd||[]).forEach(function(i){apd[i]=1});
 var st=m.steps.filter(function(x,i){return p['step'+i]&&(!saksi[i]||vs[i])}).length,
  sf=m.safety.filter(function(x,i){return p['safe'+i]&&(!apd[i]||va[i])}).length,
  rows=m.checks.filter(function(x,i){return lkRowOk(p,i)}).length,tb=lk2TabelPct(m,p),
  ana=(vf&&typeof vf.n==='number'&&isFinite(vf.n))?Math.max(0,Math.min(100,vf.n)):null,
  chk=tb===null?rows/m.checks.length:(rows/m.checks.length+tb)/2,kkm=lk2KkmEvaluasi(),
  praktik=Math.round(st/m.steps.length*r.steps+sf/m.safety.length*r.safety+chk*r.checks+(ana===null?0:ana/100)*r.analysis);
 return {praktik:praktik,kkm:kkm,lulus:praktik>=kkm,st:st,stN:m.steps.length,sf:sf,sfN:m.safety.length,rows:rows,rowsN:m.checks.length,tabel:tb===null?null:Math.round(tb*100),ana:ana};
}
/* Status siswa yang sedang masuk: sudah mengirim, sudah diverifikasi, nilai praktik terverifikasi tertinggi, dan apakah Evaluasi terbuka. */
function lk2Status(m){
 var sid=S.user&&S.user.id,out={ada:false,verif:false,praktik:null,lulus:false,kkm:lk2KkmEvaluasi()};
 (S.lkpd||[]).forEach(function(x){
  if(x.moduleId!==m.id||x.sid!==sid)return;
  var p;try{p=JSON.parse(x.payload||'{}')}catch(e){p={}}
  if(p.v2&&p.v2.evaluasi)return;
  out.ada=true;var vf=p.v2&&p.v2.verif;
  if(vf&&vf.ts&&typeof vf.praktik==='number'){out.verif=true;if(out.praktik===null||vf.praktik>out.praktik)out.praktik=vf.praktik}
 });
 out.lulus=out.verif&&out.praktik>=out.kkm;return out;
}
function lk2EvalBuka(m){return isStaff()||LK.preview||!!LK2.cetak||lk2Status(m).lulus}
function lk2EvalSoal(m,d){
 if(lk2EvalBuka(m))return '<section class="card"><h2>Latihan membaca skala</h2><p class="note">Hitung dari soal, lalu isi angkanya. Dinilai otomatis dengan toleransi pembulatan kecil.</p>'+lkqQuizHtml(m,d)+'</section>';
 var s=lk2Status(m);
 return '<section class="card"><h2>Evaluasi terkunci</h2><p>'+(!s.ada?'Kirim Lembar Kerja (Kirim LKPD) dulu. Evaluasi terbuka setelah guru memverifikasi praktikmu dengan nilai minimal '+s.kkm+'.':!s.verif?'Lembar Kerja sudah terkirim. Menunggu verifikasi dan penilaian guru. Evaluasi terbuka bila nilai praktik terverifikasi minimal '+s.kkm+'.':'Nilai praktik terverifikasimu '+s.praktik+', belum mencapai KKM '+s.kkm+'. Perbaiki praktik sesuai arahan guru, lalu kirim ulang Lembar Kerja.')+'</p></section>';
}
/* Kirim Evaluasi: kiriman terpisah berisi jawaban latihan. Nilai = praktik terverifikasi x bobot praktik + teori x bobot teori. */
function lk2KirimEvaluasi(){
 var m=lk2Cur();if(!lk2Is(m)||isStaff()||LK.preview||!S.user)return;
 var s=lk2Status(m);
 if(!s.lulus){toast('Evaluasi belum terbuka: nilai praktik terverifikasi minimal '+s.kkm);LK.tab='evaluasi';render();return}
 var d=lkRead(),ans=0,benar=0,pay={};
 m.quiz.forEach(function(q,i){if(lkqAnswered(q,d['q'+i]))ans++;benar+=lkqPoint(q,d['q'+i]);pay['q'+i]=d['q'+i]});
 var miss=m.quiz.length-ans;
 if(!uiOk('lk2eval','Kirim Evaluasi sekarang?'+(miss?'\n'+miss+' soal belum dijawab (dihitung salah).':''),function(){lk2KirimEvaluasi()},{ok:'Kirim'}))return;
 var r=m.rubric,teori=m.quiz.length?Math.round(benar/m.quiz.length*100):0,akhir=Math.round(s.praktik*(r.practiceWeight/100)+teori*(r.theoryWeight/100));
 pay.student=S.user.nama;pay['class']=S.user.kelas||'X';pay.date=ymd(Date.now());pay.qsig=lkqSig(m);pay.v2={ver:2,evaluasi:1,praktik:s.praktik,kkm:s.kkm};
 var rec={id:uid(),ts:Date.now(),moduleId:m.id,moduleTitle:m.title,kelas:m.kelas,siswa:S.user.nama,sid:S.user.id,score:akhir,practice:s.praktik,theory:teori,kompeten:akhir>=S.kkm,payload:JSON.stringify(pay),oleh:S.user.username};
 S.lkpd=S.lkpd||[];S.lkpd.push(rec);
 S.results.push({id:uid(),ts:rec.ts,jobId:m.id,kelas:m.kelas,siswa:S.user.nama,tipe:'LKPD',score:akhir,kompeten:rec.kompeten,catatan:'Evaluasi: praktik terverifikasi '+s.praktik+'/100; teori '+teori+'/100. Detail tersimpan pada pengumpulan LKPD.',detik:0,oleh:S.user.username,penilai:S.user.nama,sid:S.user.id});
 if(Cloud.on)persist();else{try{localStorage.setItem('tbsm-lkpd-records',JSON.stringify(S.lkpd));save()}catch(e){}}
 LK.tab='riwayat';render();toast('Evaluasi terkirim · nilai '+akhir);
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-act="lk2-eval-kirim"]');if(b)lk2KirimEvaluasi()});
function lk2Ana(m,d){return m.v2.analisis.filter(function(x,i){return lk2Txt(d['ana'+i]).length>=15}).length}

/* ---------- Penilaian otomatis (nilai koreksi guru tetap menggantikan) ---------- */
var _lkScore2=lkScore;
function lk2ScoreFor(m,d){
 var r=m.rubric,safe=m.safety.filter(function(x,i){return d['safe'+i]}).length,work=m.steps.filter(function(x,i){return d['step'+i]}).length,
  rows=m.checks.filter(function(x,i){return lkRowOk(d,i)}).length,correct=0,answered=0;
 m.quiz.forEach(function(q,i){if(lkqAnswered(q,d['q'+i]))answered++;correct+=lkqPoint(q,d['q'+i])});
 var tp=lk2TabelPct(m,d),chk=tp===null?rows/m.checks.length:(rows/m.checks.length+tp)/2,ana=lk2Ana(m,d)/m.v2.analisis.length;
 var practice=Math.round(work/m.steps.length*r.steps+safe/m.safety.length*r.safety+chk*r.checks+ana*r.analysis),
  theory=m.quiz.length?Math.round(correct/m.quiz.length*100):0;
 return {practice:practice,theory:theory,final:Math.round(practice*(r.practiceWeight/100)+theory*(r.theoryWeight/100)),answered:answered,correct:correct,work:work,safe:safe};
}
lkScore=function(d){
 var m=lk2Cur();if(!lk2Is(m))return _lkScore2(d);
 return lk2ScoreFor(m,d);
};
var _lkRead2=lkRead;
lkRead=function(){
 var d=_lkRead2(),m=lk2Cur();
 if(lk2Is(m)){var c0=lk2Calc(m,d);m.checks.forEach(function(x,i){var au=lk2Auto(m,i,d,c0);if(au!==null&&au!=='')d['actual'+i]=au});m.checks.forEach(function(x,i){d['row'+i]=lk2Txt(d['actual'+i])!==''&&!!d['status'+i]&&d['status'+i]!=='Belum diperiksa'});var c=lk2Calc(m,d),g=lk2Gate(m,d);d.v2={ver:2,calc:c,gate:g.n,gerbang:{nilai:g.nilai,poin:g.poin,kkm:g.kkm,lulus:g.lulus},tabel:lk2TabelPct(m,d)===null?null:Math.round(lk2TabelPct(m,d)*100)}}
 return d;
};
var _lkProgress2=lkProgress;
lkProgress=function(m,d){
 var h=_lkProgress2(m,d);if(!lk2Is(m))return h;
 var g=lk2Gate(m,d),tp=lk2TabelPct(m,d),t=tp===null?null:Math.round(tp*100);
 return '<span class="lk-prog'+(g.lulus?' done':'')+'">Gerbang '+(g.auto?g.nilai+'/100':g.n+'/'+g.total)+'</span>'+(t===null?'':'<span class="lk-prog'+(t===100?' done':'')+'">Tabel '+t+'%</span>')+h;
};
/* Syarat kirim yang belum terpenuhi, dengan nama kolomnya: K3 harus dicentang semua; Pemeriksaan dan bukti minimal satu komponen berisi hasil aktual dan status. */
function lk2Kurang(m,d){
 var out=[],k3=[];
 m.safety.forEach(function(x,i){if(!d['safe'+i])k3.push(i+1)});
 if(k3.length)out.push({tab:'materi',t:'K3: centang '+(k3.length===m.safety.length?'semua butir':'butir '+k3.join(', '))+' di tab Materi'});
 if(!m.checks.some(function(x,i){return lkRowOk(d,i)})){
  var st=[],ak=[];
  m.checks.forEach(function(x,i){if(lk2Txt(d['actual'+i])==='')ak.push(x[0]);else if(!d['status'+i]||d['status'+i]==='Belum diperiksa')st.push(x[0])});
  if(st.length)out.push({tab:'kerja',t:'Pemeriksaan dan bukti: pilih Status pada \u201c'+st[0]+'\u201d'+(st.length>1?' dan '+(st.length-1)+' komponen lain':'')});
  else out.push({tab:'kerja',t:'Pemeriksaan dan bukti: isi hasil aktual dan pilih Status minimal satu komponen, mis. \u201c'+(ak[0]||m.checks[0][0])+'\u201d'});
 }
 return out;
}
var _lkSubmit2=lkSubmit;
lkSubmit=function(){
 var m=lk2Cur();
 if(lk2Is(m)&&!LK.preview){
  var d0=lkRead(),g=lk2Gate(m,d0);
  if(!g.lulus){toast(g.auto?'Nilai gerbang masuk '+g.nilai+' belum mencapai KKM '+g.kkm+'. Perbaiki gerbang masuk dulu.':'Jawab semua pertanyaan gerbang masuk dulu ('+g.n+' dari '+g.total+')');LK.tab='materi';render();return}
  if(!isStaff()){var kr=lk2Kurang(m,d0);if(kr.length){LK2.tandai=true;toast(kr[0].t+(kr.length>1?' (masih '+(kr.length-1)+' syarat lain)':''));LK.tab=kr[0].tab;render();if(typeof lk2BukaYangKurang==='function')lk2BukaYangKurang();return}}
  LK2.tandai=false;
 }
 return _lkSubmit2();
};

/* ---------- Tampilan siswa ---------- */
function lk2Chk(d,key,label){return '<label class="lk-check'+(LK2.tandai&&!d[key]?' lk2-need':'')+'"><input type="checkbox" data-lk-check="'+key+'" '+(d[key]?'checked':'')+'><span>'+label+'</span></label>'}
/* Waktu praktik: total semua kegiatan dibagi per kegiatan (p.praktik). Menit langkah (v2.langkah[].menit) menjumlah ke target kegiatannya. */
function lk2PertPraktik(V){var a=V.pertemuan.filter(function(p){return (p.kegiatan||[]).length}).map(function(p){return p.n});return a.length?(a[0]===a[a.length-1]?String(a[0]):a[0]+'–'+a[a.length-1]):''}
function lk2PraktikTotal(V){return V.pertemuan.reduce(function(t,p){return t+(p.sembunyi?0:Number(p.praktik)||0)},0)}
function lk2KegMenit(V,k){return V.langkah.filter(function(l){return l.k===k}).reduce(function(t,l){return t+(Number(l.menit)||0)},0)}
/* Kartu Lembar Kerja: satu kartu per pertemuan, kecuali pertemuan dengan kartu:{per:{k:judul}} yang memuat beberapa kegiatan: satu kartu per kegiatan (tidak digabung).
   key = kolom waktu aktual: mt<n> bila kartu mewakili pertemuan, mtk<k> bila kartu mewakili satu kegiatan dari pertemuan yang dipisah. */
function lk2Pisah(p){return !!(p&&p.kartu&&p.kartu.per&&(p.kegiatan||[]).length>1)}
function lk2WaktuKey(p,k){return lk2Pisah(p)?'mtk'+k:'mt'+p.n}
/* Teks waktu praktik sebuah pertemuan: pertemuan yang dipisah menyebut tiap kegiatan sendiri (K3 20 + K4 15), tidak dijumlah jadi satu angka. */
function lk2PraktikTeks(V,p){return lk2Pisah(p)?p.kegiatan.map(function(k){return 'K'+k+' '+(lk2KegMenit(V,k)||0)}).join(' + '):String(p.praktik||'')}
function lk2Kartu(V,p){
 var kt=p.kartu||{};
 if(lk2Pisah(p))return p.kegiatan.map(function(k){return {ks:[k],judul:kt.per[k]||('Kegiatan '+k+' '+V.kegiatan[k-1]),menit:lk2KegMenit(V,k)||0,key:'mtk'+k,k:k}});
 return [{ks:p.kegiatan,judul:kt.judul||'',menit:p.praktik||p.menit,key:'mt'+p.n}]}
function lk2PraktikRingkas(V){var a=V.pertemuan.filter(function(p){return !p.sembunyi&&p.praktik});return a.length?' Praktik '+lk2PraktikTotal(V)+' menit ('+a.map(function(p){return lk2Pisah(p)?lk2PraktikTeks(V,p):(p.kegiatan.length?'K'+p.kegiatan.join('+'):'P'+p.n)+' '+p.praktik}).join(' + ')+').':''}
function lk2Rencana(m){
 var V=m.v2,tot=V.pertemuan.reduce(function(t,p){return t+p.menit},0),jp=V.pertemuan.reduce(function(t,p){return t+p.jp},0);
 return lk2Bn('rencana','Rencana pertemuan','<p class="note">'+V.pertemuan.length+' pertemuan · '+jp+' JP · '+tot+' menit.'+lk2PraktikRingkas(V)+' Ketuk satu pertemuan untuk melihat kegiatannya.</p>'+V.pertemuan.map(function(p){
  var ls=[];p.kegiatan.forEach(function(k){V.langkah.forEach(function(l){if(l.k===k)ls.push('<li>'+lkEsc(String(m.steps[l.i][0]).replace(/^Kegiatan \d+ · /,''))+(l.saksi?' <span class="lk2-saksi">saksi guru</span>':'')+'</li>')})});
  var pisah=lk2Pisah(p);
  var isi=pisah?p.kegiatan.map(function(k){var li=[];V.langkah.forEach(function(l){if(l.k===k)li.push('<li>'+lkEsc(String(m.steps[l.i][0]).replace(/^Kegiatan \d+ · /,''))+(l.saksi?' <span class="lk2-saksi">saksi guru</span>':'')+'</li>')});return '<p class="note"><b>Kegiatan '+k+' · '+lkEsc(V.kegiatan[k-1])+'</b> · target '+(lk2KegMenit(V,k)||0)+' menit</p><ul class="plain">'+li.join('')+'</ul>'}).join(''):p.kegiatan.length?'<p class="note">'+p.kegiatan.map(function(k){return 'Kegiatan '+k+' · '+lkEsc(V.kegiatan[k-1])}).join('; ')+'</p><ul class="plain">'+ls.join('')+'</ul>':'<p class="note">'+(p.n===1?'Jawab gerbang masuk dan centang butir K3 di tab ini, lalu periksa alat.':'Penilaian kinerja oleh guru, refleksi, remedial atau pengayaan.')+'</p>';
  return lk2Det('p'+p.n,'Pertemuan '+p.n,p.jp+' JP · '+p.menit+' menit'+(p.praktik?' · target praktik '+(pisah?lk2PraktikTeks(V,p):p.praktik)+' menit':'')+' · '+lkEsc(p.judul),isi);
 }).join(''));
}
function lk2K3(m,d){
 var V=m.v2,g=V.k3grup||[{judul:'',i:m.safety.map(function(x,i){return i})}];
 var tot=m.safety.length,ok=m.safety.filter(function(x,i){return d['safe'+i]}).length;
 return lk2Bn('k3','Keselamatan dan Kesehatan Kerja (K3)','<p class="note">Centang setiap butir yang sudah kamu penuhi sebelum mulai praktik. Semua butir harus tercentang sebelum Kirim LKPD. Guru memberi paraf pada butir APD saat memeriksa (terlihat di Detail setelah dikirim).</p>'+
  g.map(function(x){return (x.judul?'<h3 class="lk2-grp">'+lkEsc(x.judul)+'</h3>':'')+'<div class="lk-checks">'+x.i.map(function(i){return lk2Chk(d,'safe'+i,lkEsc(m.safety[i]))}).join('')+'</div>'}).join(''),'',ok+' dari '+tot+' butir dicentang');
}
function lk2Materi(m,d){
 var V=m.v2,g=lk2Gate(m,d);
 return lk2Bn('tujuan','Tujuan pembelajaran','<ul class="plain">'+m.objectives.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul>')+
  lk2Rencana(m)+
  lk2Bn('teori','Teori singkat',m.theory.map(function(x){return '<p><b>'+lkEsc(x[0])+'</b><br>'+lkEsc(x[1])+'</p>'+(typeof lkvMateriImg==='function'?lkvMateriImg(x):'')}).join(''))+
  lk2Bn('gate','Gerbang masuk praktik','<p class="note">'+(g.auto?'Jawab semua soal. Penilaian mengikuti soal TKA: pilihan ganda benar bernilai 1; PG kompleks dan PG kategori bernilai sebagian sesuai pilihan yang tepat. Lembar Kerja terbuka bila nilai gerbang minimal '+g.kkm+'.':'Jawab semua soal agar Lembar Kerja terbuka.')+'</p>'+
  V.gate.qs.map(function(x,i){if(lk2GPG(x))return lkqRender(x,LK2_GOFF+i,d).replace('<b>'+(LK2_GOFF+i+1)+'. ','<b>'+(i+1)+'. ');return '<label class="f">'+(i+1)+'. '+lkEsc(x.q)+'<textarea data-lk-field="gate'+i+'" rows="2">'+lkEsc(d['gate'+i]||'')+'</textarea></label>'}).join('')+
  '<p class="note">Terjawab '+g.n+' dari '+g.total+(g.auto?' · Nilai gerbang <b class="mono">'+g.nilai+'</b> (KKM '+g.kkm+'): '+(g.lulus?'lulus, Lembar Kerja terbuka.':'belum lulus, Lembar Kerja masih terkunci.'):(g.ok?'. Lembar Kerja terbuka.':'.'))+'</p>',' id="lk2-gate"','Terjawab '+g.n+' dari '+g.total+(g.auto?' · nilai '+g.nilai+' (KKM '+g.kkm+')':''))+
  lk2Bn('alat','Alat dan bahan','<ul class="plain">'+m.tools.map(function(x){return '<li>'+lkEsc(x)+'</li>'}).join('')+'</ul>')+
  lk2K3(m,d);
}
function lk2StepHtml(m,i,d){
 var s=m.steps[i],V=m.v2.langkah[i],t=String(s[0]).replace(/^Kegiatan \d+ · /,'');
 return '<label class="lk-step"><input type="checkbox" data-lk-check="step'+i+'" '+(d['step'+i]?'checked':'')+'><span><b>'+lkEsc(t)+'</b>'+(V.saksi?'<span class="lk2-saksi">saksi guru</span>':'')+(V.menit?'<span class="lk2-mnt">'+V.menit+' menit</span>':'')+'<small>Poin kritis: '+lkEsc(s[2])+'</small></span></label>';
}
function lk2TabelHtml(m,t,d,c){
 var KOL=t.nolSekali?t.kol.filter(function(k){return k.k!=='nol'}):t.kol,nolKey=lk2K(t.id,0,'nol'),nolIn=t.nolSekali?'<label class=\"f lk2-nol\">Nol alat (cek 1 kali di awal, mm)<input inputmode=\"decimal\" data-lk-field=\"'+nolKey+'\" data-lk2-t=\"1\" value=\"'+lkEsc(d[nolKey]||'')+'\"></label>':'';
 /* Sel pertama = label baris (bila ada), lalu kolom. data-w menandai lebar kartu di ponsel: full = satu baris, half = berdampingan. */
 var ws=KOL.map(function(k){return (k.t==='teks'||k.k==='nol')?'full':'half'}),run=[];
 ws.forEach(function(w,j){if(w==='half')run.push(j);if(w==='full'||j===ws.length-1){if(run.length%2===1)ws[run[run.length-1]]='full';run=[]}});
 var head=(t.labelBaris?'<th>'+lkEsc(t.labelBaris)+'</th>':'')+KOL.map(function(k){return '<th>'+lkEsc(k.l)+'</th>'}).join('');
 var rows=t.baris.map(function(lb,r){
  return '<tr>'+(t.labelBaris?'<td class=\"lk2-rl\" data-label=\"'+lkEsc(t.labelBaris)+'\">'+lkEsc(lb)+'</td>':'')+KOL.map(function(k,j){
   var key=lk2K(t.id,r,k.k),cell,calc=(k.t==='rata'||k.t==='selisih');
   if(calc)cell='<span class=\"mono lk2-hit\" data-lk2-calc=\"'+t.id+'|'+r+'|'+k.k+'\">'+lk2Fmt(c[t.id][r][k.k],t.dec)+'</span>';
   else if(k.t==='status')cell='<select data-lk-field=\"'+key+'\" aria-label=\"'+lkEsc(k.l)+'\">'+['','Sesuai','Tidak sesuai'].map(function(o){return '<option'+(d[key]===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select>';
   else cell='<input '+(k.t==='num'?'inputmode=\"decimal\" ':'')+'data-lk-field=\"'+key+'\" data-lk2-t=\"1\" value=\"'+lkEsc(d[key]||'')+'\" aria-label=\"'+lkEsc(k.l)+(t.baris.length>1?' baris '+(r+1):'')+'\">';
   return '<td data-label=\"'+lkEsc(k.l)+'\" data-w=\"'+ws[j]+'\"'+(calc?' class=\"lk2-calc\"':'')+'>'+cell+'</td>';
  }).join('')+'</tr>';
 }).join('');
 return '<h4>'+lkEsc(t.judul)+'</h4>'+nolIn+'<div class=\"tablewrap\"><table class=\"lk2-t\"><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table></div><p class=\"note\">Kolom rata-rata dan selisih dihitung otomatis dari angka yang kamu isi'+(t.nolSekali?' (rata-rata sudah dikurangi nol alat)':'')+'.</p>'+(t.cat?'<p class=\"note\">'+lkEsc(t.cat)+'</p>':'');
}
function lk2CekHtml(m,i,d,c){
 var x=m.checks[i],au=lk2Auto(m,i,d,c),tb=m.v2.cekAuto&&m.v2.cekAuto[i]?m.v2.cekAuto[i].t:'';
 return '<div class="lk2-cek"><b>'+lkEsc(x[0])+'</b><small class="note">'+lkEsc(x[1])+'</small>'+(typeof ldRowCam==='function'?ldRowCam(i):'')+
  '<div class="formgrid"><label class="f">Hasil aktual'+(au!==null?'<small class="lk-acuan">Terisi otomatis dari tabel '+lkEsc(tb)+'</small>':'')+'<input data-lk-field="actual'+i+'" '+(au!==null?'readonly data-lk2-auto="'+i+'" value="'+lkEsc(au)+'"':'value="'+lkEsc(d['actual'+i]||'')+'"')+'></label>'+
  '<label class="f">Standar manual<input data-lk-field="standard'+i+'" value="'+lkEsc(d['standard'+i]||'')+'">'+(x[2]?'<small class="lk-acuan">Acuan: '+lkEsc(x[2])+'</small>':'')+'</label>'+
  '<label class="f'+(LK2.tandai&&lk2Txt(d['actual'+i]||au)!==''&&(!d['status'+i]||d['status'+i]==='Belum diperiksa')?' lk2-need':'')+'">Status<select data-lk-field="status'+i+'">'+['Belum diperiksa','Baik','Perlu tindakan','Tidak aman'].map(function(o){return '<option'+(d['status'+i]===o?' selected':'')+'>'+o+'</option>'}).join('')+'</select></label>'+
  '<label class="f">Catatan<input data-lk-field="note'+i+'" value="'+lkEsc(d['note'+i]||'')+'"></label></div>'+'</div>';
}
/* Latihan membaca skala dikerjakan di Lembar Kerja pada pertemuan yang memuatnya (p.latihan = id soal). Jawabannya memakai kunci q<i> yang sama dengan tab Evaluasi. */
function lk2Latihan(m,p,d){
 var ids=(p&&p.latihan)||[],h=ids.map(function(id){var i=-1;m.quiz.forEach(function(q,j){if(q.id===id)i=j});return i<0?'':lkqRender(m.quiz[i],i,d)}).join('');
 return h?'<h4>Latihan membaca skala</h4><p class="note">Baca skala pada gambar, lalu isi angkanya dalam mm. Koma atau titik boleh dipakai. Dinilai otomatis.</p>'+h:'';
}
function lk2Kerja(m,d){
 var V=m.v2,g=lk2Gate(m,d),c0=lk2Calc(m,d);
 if(!g.lulus&&!isStaff()&&!LK2.cetak){LK2.open=LK2.open||{};LK2.open['bn-gate']=true;return '<section class="card"><h2>Lembar Kerja terkunci</h2><p>'+(g.auto?'Lembar Kerja terbuka bila nilai gerbang masuk minimal '+g.kkm+'. Nilai gerbangmu sekarang '+g.nilai+' ('+g.n+' dari '+g.total+' soal terjawab). Pelajari Materi, lalu perbaiki jawaban di gerbang masuk.':'Jawab semua pertanyaan gerbang masuk di tab Materi dulu ('+g.n+' dari '+g.total+' terjawab).')+'</p><button type="button" class="btn primary" data-act="lk-tab" data-v="materi">Ke gerbang masuk</button></section>'}
var h=lk2Bn('identitas','Identitas praktik','<div class="formgrid">'+[['school','Sekolah',typeof schNama==='function'?schNama():''],['student','Nama siswa',S.user.nama],['class','Kelas',S.user.kelas||'X'],['group','Kelompok',''],['date','Tanggal',ymd(Date.now())],['teacher','Guru/instruktur',''],['meter','Alat ukur yang dipakai (ketelitian)','']].map(function(x){return '<label class="f">'+x[1]+'<input data-lk-field="'+x[0]+'" value="'+lkEsc(d[x[0]]||x[2])+'" '+(['student','class'].indexOf(x[0])>-1?'readonly':'')+'></label>'}).join('')+'</div>');
 V.pertemuan.forEach(function(p){
  if(p.sembunyi)return;
  lk2Kartu(V,p).forEach(function(c){
   h+='<section class="card lk2-p'+(LK2.cetak||LK2.kartu===c.key?' is-open':'')+'" data-lk2k="'+c.key+'"><div class="lk2-ph" role="button" tabindex="0" aria-expanded="'+(LK2.cetak||LK2.kartu===c.key?'true':'false')+'" data-act="lk2-kartu" data-key="'+c.key+'"><h2>'+(c.judul?lkEsc(c.judul):'Pertemuan '+p.n)+'</h2><div class="lk2-pm"><span class="pill">Target '+c.menit+' menit</span>'+(typeof lkcRow==='function'&&!LK2.cetak?lkcRow(m,c,true):'')+lk2KunciIkon(m,c.key)+'</div></div><div class="lk2-pb">'+(c.judul?'<p class="note">Alokasi praktik '+c.menit+' dari total '+lk2PraktikTotal(V)+' menit.</p>':'<p class="note">'+lkEsc(p.judul)+'</p>');
   if(!c.ks.length)h+='<p class="note">'+(p.n===1?'Isi gerbang masuk dan daftar APD di tab Materi.':'Penilaian kinerja oleh guru. Lengkapi analisis dan refleksi di bawah.')+'</p>';
   c.ks.forEach(function(k){
    h+=(c.judul&&c.ks.length<2?'<h4>Langkah kerja</h4>':'<h3>Kegiatan '+k+' · '+lkEsc(V.kegiatan[k-1])+(lk2KegMenit(V,k)?' · target '+lk2KegMenit(V,k)+' menit':'')+'</h3>')+
     V.langkah.filter(function(l){return l.k===k}).map(function(l){return lk2StepHtml(m,l.i,d)}).join('')+
     V.tabel.filter(function(t){return t.k===k}).map(function(t){return lk2TabelHtml(m,t,d,c0)}).join('')+
     '<h4>Pemeriksaan dan bukti</h4>'+V.cekK.map(function(kk,i){return kk===k?lk2CekHtml(m,i,d,c0):''}).join('');
   });
   if(!c.ks.length||c.ks[0]===(p.kegiatan||[])[0])h+=lk2Latihan(m,p,d);
   h+='<label class="f">Waktu aktual '+(c.judul&&c.ks.length?'Kegiatan '+c.ks.join(' dan '):'pertemuan '+p.n)+' (menit)<input inputmode="numeric" data-lk-field="'+c.key+'" value="'+lkEsc(d[c.key]||'')+'"'+(typeof lkcRO==='function'&&lkcRO(m,c.key)?' readonly':'')+'></label></div></section>';
  });
 });
 h+=lk2Bn('analisis','Analisis dan keputusan teknis',V.analisis.map(function(q,i){return '<label class="f">'+(i+1)+'. '+lkEsc(q)+'<textarea data-lk-field="ana'+i+'">'+lkEsc(d['ana'+i]||'')+'</textarea></label>'}).join(''))+
  lk2Bn('refleksi','Refleksi',V.refleksi.map(function(q,i){return '<label class="f">'+(i+1)+'. '+lkEsc(q)+'<textarea data-lk-field="ref'+i+'">'+lkEsc(d['ref'+i]||'')+'</textarea></label>'}).join(''))+
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
 return lk2EvalSoal(m,d)+
  '<section class="card"><h2>Penilaian kinerja oleh guru</h2><p class="note">Guru menilai selama praktik (Pertemuan '+lk2PertPraktik(m.v2)+') dan menyaksikan langkah bertanda saksi guru. Tiap aspek diberi skor 1–4. Ketuk aspek untuk melihat poin yang dinilai dan arti tiap skor.</p>'+asp+
  '<p class="note"><b>Cara hitung:</b> nilai = jumlah dari (skor ÷ 4 × bobot), maksimum 100. Contoh: skor 3 pada Prosedur kerja (30%) memberi 3 ÷ 4 × 30 = 22,5.</p></section>'+
  '<section class="card"><h2>Syarat kompeten</h2><p class="note">Kompeten bila semua indikator di bawah tercapai, semua aspek sudah dinilai, dan skor Persiapan dan K3 bukan 1. Ketuntasan nilai mengikuti KKTP sekolah.</p><ul class="plain">'+O.indikator.map(function(x){return '<li><b>'+lkEsc(x.t)+'</b><br><small class="note">Bukti: '+lkEsc(x.bukti)+'</small></li>'}).join('')+'</ul></section>'+
  (pg?'<section class="card"><h2>Yang diamati dan kesalahan umum</h2><p class="note">Pelajari sebelum praktik agar kesalahan umum bisa dihindari.</p>'+pg+'</section>':'')+
  '<section class="card"><div class="note">Nilai otomatis di aplikasi hanya perkiraan awal dari kelengkapan pengisian. Nilai akhir ditentukan guru lewat Observasi LKPD Praktik v2 dan nilai guru yang diisi pada Detail pengumpulan (menggantikan nilai otomatis).</div></section>';
}
/* Overlay tombol Materi &amp; Prosedur dan Lembar Kerja. Menumpang: ikut bilah tombol bawah (melayang tepat di atasnya, posisi dari CSS tanpa hitungan skrip). Bila tidak ada bilah menempel (tab Materi siswa, pratinjau) melayang di bawah layar. */
function lk2Ov(naik){return '<div class="lk-ov'+(naik?' lk-ov-bar':'')+'" role="group" aria-label="Pindah bagian">'+[['materi','Materi &amp; Prosedur'],['kerja','Lembar Kerja']].map(function(t){return '<button type="button" data-act="lk-tab" data-v="'+t[0]+'" aria-pressed="'+(LK.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>'}
/* Kartu paling bawah (banner lipat): Kunci pertemuan dan progres, atau Progres dan cadangan draf. */
function lk2BawahKartu(m,d){
 return lk2Bn('kunci',lk2Kunci(m)?'Kunci pertemuan dan progres':'Progres dan cadangan draf','<div class="lk-progress" id="lk-progress">'+lkProgress(m,d)+'</div>'+lk2BkBlock(m))}
/* Bilah tombol bawah (menempel di bawah layar kecuali tab Materi siswa). ov = overlay yang menumpang di atas bilah. */
function lk2Bar(m,staff,ov){
 return '<div class="lk-actions">'+ov+'<div class="row"><button class="btn" data-act="lk-save">Simpan draf</button>'+(LK.tab==='materi'&&!staff?'':LK.tab==='evaluasi'&&!staff&&!LK.preview&&lk2Status(m).lulus?'<button class="btn primary" data-act="lk2-eval-kirim">Kirim Evaluasi</button>':'<button class="btn primary" data-act="lk-submit">Kirim LKPD</button>')+'<button class="btn" data-act="lk-print">Cetak</button>'+(staff&&m.v2&&m.v2.gate?'<button class="btn" data-act="lk-print-kunci">Cetak kunci</button>':'')+'</div></div>'}
function lk2View(m){
 var d=lkDraft(),staff=isStaff(),tabs=[['evaluasi','Evaluasi'],['riwayat',staff?'Rekap LKPD':'Riwayat']];
 var nav=(staff?'<div class="chips"><button data-act="lk-tab" data-v="editor" aria-pressed="false">Editor Guru</button>'+(LK.preview?'<button data-act="lk-print">Cetak</button>'+(m.v2&&m.v2.gate?'<button data-act="lk-print-kunci">Cetak kunci</button>':''):'')+'</div>':'')+
  '<div class="chips">'+tabs.map(function(t){return '<button data-act="lk-tab" data-v="'+t[0]+'" aria-pressed="'+(LK.tab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
 var body=LK.tab==='materi'?lk2Materi(m,d):LK.tab==='kerja'?lk2Kerja(m,d):lk2Eval(m,d);
 return (LK.preview&&staff?'<div class="row"><button class="btn small" data-act="lk-preview-exit">Keluar pratinjau</button></div>':'')+
  '<div class="row sb"><div><span class="pill">Fase '+lkEsc(m.fase)+' · Kelas '+lkEsc(m.kelas)+'</span><h2 class="lk-h2s">'+lkEsc(m.title)+'</h2><p class="note">'+lkEsc(m.unit)+' · '+m.v2.jp+' JP ('+m.duration+' menit, '+m.v2.pertemuan.length+' pertemuan)</p></div><span class="pill">'+lkEsc(/^LKPD/i.test(m.id)?m.id:'LKPD '+m.id)+' · v2</span></div>'+
  nav+body+(LK.preview&&staff?'':lk2BawahKartu(m,d))+
  (LK.preview&&staff?lk2Ov(false)+'<div class="lk-ovsp" aria-hidden="true"></div>':
   LK.tab==='materi'&&!staff?'<i class="lk-lite"></i>'+lk2Bar(m,staff,'')+lk2Ov(false)+'<div class="lk-ovsp" aria-hidden="true"></div>':
   '<div class="lk-ovsp" aria-hidden="true"></div>'+lk2Bar(m,staff,lk2Ov(true)));
}
var _viewLKPD2=viewLKPD;
viewLKPD=function(){
 if(LK.detail||LK.editor)return _viewLKPD2();
 var m=lk2Cur();
 if(!lk2Is(m)||['materi','kerja','evaluasi'].indexOf(LK.tab)<0)return _viewLKPD2();
 if(!isStaff()&&!(m.status==='published'&&m.active!==false))return _viewLKPD2();
 return lk2View(m);
};


/* ---------- Pengaturan mode Latihan/Ujian untuk LKPD v2 ----------
   Pengaturan (Kelola LKPD > Pengaturan) memakai tiga sakelar untuk mode Ujian; di v2 artinya:
   - Teori ringkas  -> banner "Teori singkat" disembunyikan
   - Penjelasan langkah -> isi tiap pertemuan di Rencana pertemuan dan "Poin kritis" di Lembar Kerja disembunyikan
   - Petunjuk komponen -> keterangan dan acuan di bawah nama komponen pemeriksaan disembunyikan
   Dipanggil dari lkmFilter (lkpd-mode.js) hanya untuk tampilan siswa/pratinjau. */
function lk2ModeFilter(h,c){
 if(c.mode!=='ujian')return h;
 try{
  if(LK.tab==='materi'){
   if(c.hideTeori)h=h.replace(/<section class="card lk2-bn-c"><details class="lk2-bn" data-lk2d="bn-teori"[\s\S]*?<\/section>/,function(){return lk2Bn('teori','Teori singkat','<p class="note">Teori singkat tidak ditampilkan pada mode Ujian.</p>')});
   if(c.hideLangkah)h=h.replace(/(<details class="lk2-dt" data-lk2d="p\d+"[^>]*><summary>[\s\S]*?<\/summary>)<div class="lk2-bd">[\s\S]*?<\/div>/g,'$1<div class="lk2-bd"><p class="note">Rincian langkah tidak ditampilkan pada mode Ujian.</p></div>');
  }else if(LK.tab==='kerja'){
   if(c.hideLangkah)h=h.replace(/<small>Poin kritis:[\s\S]*?<\/small>/g,'');
   if(c.hidePetunjuk)h=h.replace(/(<div class="lk2-cek"><b>[^<]*<\/b>)<small class="note">[\s\S]*?<\/small>/g,'$1').replace(/<small class="lk-acuan">[\s\S]*?<\/small>/g,'');
  }
 }catch(e){}
 return h;
}
/* Pembahasan mode Latihan untuk soal v2 (termasuk isian angka dan PG kompleks/kategori); pembaca jawaban memakai fungsi soal bersama. */
function lk2KeyBlock(m,d,on){
 var h='<section class="card" data-lkm="1"><h2 class="lk-h2s">Pembahasan latihan</h2>';
 if(!on)return h+'<p class="note">Jawab soal di atas, lalu periksa jawabanmu dan baca pembahasannya.</p><button type="button" class="btn small primary" data-act="lkm-reveal">Periksa jawaban</button></section>';
 var ok=0,rows=m.quiz.map(function(q,i){
  var a=d['q'+i],ans=lkqAnswered(q,a),good=ans&&lkqPoint(q,a)>=1;if(good)ok++;
  return '<div class="qbox"><b>'+(i+1)+'. '+lkEsc(q.q)+'</b><div><span class="pill '+(!ans?'warn':good?'ok':'bad')+'">'+(!ans?'Belum dijawab':good?'Benar':'Kurang tepat')+'</span></div>'+
   (good?'':'<p>Kunci: <b>'+lkEsc(lkqKeyText(q))+'</b></p>')+(q.e?'<p class="note">'+lkEsc(q.e)+'</p>':'')+'</div>';
 }).join('');
 return h+'<p><b>Benar '+ok+' dari '+m.quiz.length+'</b></p>'+rows+'<button type="button" class="btn small" data-act="lkm-reveal">Sembunyikan pembahasan</button></section>';
}

/* ---------- Detail guru: verifikasi gerbang, saksi langkah, paraf APD ---------- */
/* Detail kiriman Evaluasi (jawaban latihan; nilai = praktik terverifikasi x bobot + teori x bobot). */
function lk2DetailEval(p,m){
 var staff=isStaff(),h='<h3>Evaluasi (latihan membaca skala)</h3><div class="lk-kv">'+[['Nama siswa',p.student],['Kelas',p['class']],['Tanggal',p.date],['Nilai praktik terverifikasi',p.v2&&p.v2.praktik]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+lkEsc(x[1]==null?'-':x[1])+'</b></div>'}).join('')+'</div>';
 return h+m.quiz.map(function(q,i){return lkqDetail(q,i,p['q'+i])+(staff?'<small class="lk2-key">Kunci: '+lkEsc(lkqKeyText(q))+(q.e?' · '+lkEsc(q.e):'')+'</small>':'')}).join('');
}
/* Kartu penilaian praktik: nilai analisis oleh guru, rincian praktik terverifikasi, dan tombol simpan verifikasi (guru). */
function lk2NilaiCard(p,m,vf,staff){
 var R=lk2PraktikV(m,p,vf),has=!!vf.ts&&typeof vf.n==='number',
  h='<div id="lk2-nilai"><h3>Penilaian praktik oleh guru</h3>';
 h+=staff?'<label class="f">Nilai analisis (0–100), dinilai guru dari jawaban analisis di atas<input id="lk2-ana-n" type="number" min="0" max="100" inputmode="numeric" value="'+(typeof vf.n==='number'?vf.n:'')+'"></label>':'<p>Nilai analisis: <b>'+(typeof vf.n==='number'?vf.n:'belum dinilai')+'</b></p>';
 if(has)h+='<p class="note">Langkah '+R.st+'/'+R.stN+' (langkah saksi dihitung bila disaksikan guru) · K3 '+R.sf+'/'+R.sfN+' (butir APD dihitung bila berparaf) · Pemeriksaan '+R.rows+'/'+R.rowsN+(R.tabel===null||R.tabel===undefined?'':' · Tabel '+R.tabel+'%')+' · Analisis '+R.ana+'.</p><p>Nilai praktik terverifikasi: <b class="mono">'+R.praktik+'</b> · KKM '+R.kkm+': <b>'+(R.lulus?'lulus, Evaluasi terbuka':'belum lulus, Evaluasi belum terbuka')+'</b></p>';
 else h+='<p class="note">Belum diverifikasi. Nilai praktik terverifikasi dihitung setelah guru menyimpan verifikasi dan nilai analisis. Evaluasi terbuka bila nilainya minimal '+R.kkm+'.</p>';
 if(staff)h+='<div class="row"><button type="button" class="btn primary" data-act="lk2-verif">Simpan verifikasi guru</button></div>'+(vf.ts?'<p class="note">Terakhir diverifikasi '+lkEsc(vf.by||'-')+' · '+new Date(vf.ts).toLocaleString('id-ID')+'</p>':'');
 return h+'</div>';
}
function lk2Detail(z,p,m){
 if(p&&p.v2&&p.v2.evaluasi)return lk2DetailEval(p,m);
 var V=m.v2,vf=(p.v2&&p.v2.verif)||{},staff=isStaff(),calc=lk2Calc(m,p),h='',
  vs=vf.s||{},va=vf.a||{},
  mark=function(ok){return ok?'<span class="lk2-ok">✓</span>':'<span class="note">belum</span>'};
 h+='<h3>Identitas</h3><div class="lk-kv">'+[['Sekolah',p.school],['Nama siswa',p.student],['Kelas',p.class],['Kelompok',p.group],['Tanggal',p.date],['Guru/instruktur',p.teacher],['Alat ukur',p.meter]].map(function(x){return '<div><span>'+x[0]+'</span><b>'+lkEsc(x[1]||'-')+'</b></div>'}).join('')+'</div>';
 var G=lk2Gate(m,p); /* gerbang dinilai otomatis (acuan TKA); guru melihat poin tiap soal, bukan lagi kotak Jawaban benar */
 h+='<div id="lk2-verif">'+lk2DetB('dg','Gerbang masuk',''+V.gate.qs.map(function(x,i){
  var pg=lk2GPG(x),a=p[lk2GKey(i)],v=pg?lkqVerdict(x,a):null,txt=pg?lkqAnsText(x,a):(p['gate'+i]||'-');
  return '<p><b>'+(i+1)+'. '+lkEsc(x.q)+'</b>'+(x.lvl?' <span class="pill plain">'+lkEsc(x.lvl)+'</span>':'')+'<br><span class="lk-text">'+lkEsc(txt||'-')+'</span>'+(pg&&v[1]!=='Belum dijawab'?' · <b>'+lkEsc(v[1].toLowerCase())+'</b>':'')+
   (pg?'<br><small class="note">Poin: '+lkqFmt(lk2GPoin(x,i,p))+' dari 1</small>':'')+
   (staff?'<br><small class="lk2-key">Kunci: '+lkEsc(pg?lkqKeyText(x):x.kunci)+'</small>'+(pg&&x.e?'<br><small class="lk2-key">'+lkEsc(x.e)+'</small>':''):'')+'</p>';
 }).join('')+(G.auto?'<p class="note">Nilai gerbang (acuan TKA): <b>'+G.nilai+'</b> dari 100 · poin '+lkqFmt(G.poin)+' dari '+G.total+' · KKM '+G.kkm+': <b>'+(G.lulus?'lulus':'belum lulus')+'</b></p>':'<p class="note">Soal gerbang isian: '+G.n+' dari '+G.total+' terjawab. Penilaian otomatis tidak tersedia untuk bentuk soal ini.</p>'));
 h+='<h3>Daftar APD</h3>'+V.apd.map(function(i){return '<div class="lk-check"><span>'+lkEsc(m.safety[i])+' · siswa: '+(p['safe'+i]?'ada':'belum')+'</span>'+(staff?'<label class="lk-check"><input type="checkbox" data-lk2v="a'+i+'" '+(va[i]?'checked':'')+'><span>Paraf guru</span></label>':' '+mark(va[i]))+'</div>'}).join('');
 h+='<h3>Langkah kerja</h3>'+V.langkah.map(function(l){
  var t=String(m.steps[l.i][0]).replace(/^Kegiatan \d+ · /,'');
  return '<div class="lk-check"><span>K'+l.k+' · '+lkEsc(t)+' · siswa: '+(p['step'+l.i]?'selesai':'belum')+(l.saksi?' · <b>saksi guru</b>':'')+'</span>'+(l.saksi?(staff?'<label class="lk-check"><input type="checkbox" data-lk2v="s'+l.i+'" '+(vs[l.i]?'checked':'')+'><span>Disaksikan</span></label>':' '+mark(vs[l.i])):'')+'</div>';
 }).join('');
 h+='</div>';
 if(V.tabel.length)h+=lk2DetB('dd','Data hasil pengukuran',''+V.tabel.map(function(t){
  return '<h4>'+lkEsc(t.judul)+'</h4><div class="tablewrap"><table><thead><tr>'+t.kol.map(function(k,j){return '<th>'+lkEsc(k.l)+'</th>'+(j===0&&t.labelBaris?'<th>'+lkEsc(t.labelBaris)+'</th>':'')}).join('')+'</tr></thead><tbody>'+
   t.baris.map(function(lb,r){return '<tr>'+t.kol.map(function(k,j){var v=(k.t==='rata'||k.t==='selisih')?lk2Fmt(calc[t.id][r][k.k],t.dec):p[lk2K(t.id,(t.nolSekali&&k.k==='nol')?0:r,k.k)];return '<td data-label="'+lkEsc(k.l)+'">'+lkEsc(v||'-')+'</td>'+(j===0&&t.labelBaris?'<td data-label="'+lkEsc(t.labelBaris)+'">'+lkEsc(lb)+'</td>':'')}).join('')+'</tr>'}).join('')+'</tbody></table></div>';
 }).join(''));
 h+=lk2DetB('dh','Hasil pemeriksaan dan foto bukti','<div class="tablewrap"><table><thead><tr><th>Komponen</th><th>Hasil aktual</th><th>Standar manual</th><th>Status</th><th>Catatan</th></tr></thead><tbody>'+m.checks.map(function(x,i){return '<tr><td data-label="Komponen">'+lkEsc(x[0])+(typeof ldDetailFoto==='function'?ldDetailFoto(z,i):'')+'</td><td data-label="Hasil aktual">'+lkEsc(p['actual'+i]||'-')+'</td><td data-label="Standar manual">'+lkEsc(p['standard'+i]||'-')+'</td><td data-label="Status">'+lkEsc(p['status'+i]||'Belum diperiksa')+'</td><td data-label="Catatan">'+lkEsc(p['note'+i]||'-')+'</td></tr>'}).join('')+'</tbody></table></div>');
 h+='<h3>Waktu per kartu kegiatan</h3><p class="note">'+V.pertemuan.filter(function(q){return !q.sembunyi}).map(function(q){return lk2Kartu(V,q).map(function(c){return (c.k?'K'+c.k:(q.kartu&&q.kartu.judul&&q.kegiatan.length?'K'+q.kegiatan.join('+'):'P'+q.n))+': '+lkEsc(p[c.key]||'-')+' / '+c.menit+' menit'}).join(' · ')}).join(' · ')+'</p>';
 h+=lk2DetB('dl','Latihan membaca skala',''+m.quiz.map(function(q,i){return lkqDetail(q,i,p['q'+i])+(staff?'<small class="lk2-key">Kunci: '+lkEsc(lkqKeyText(q))+(q.e?' · '+lkEsc(q.e):'')+'</small>':'')}).join(''));
 h+=lk2DetB('da','Analisis dan refleksi',''+V.analisis.map(function(q,i){return '<p><b>'+(i+1)+'. '+lkEsc(q)+'</b><br><span class="lk-text">'+lkEsc(p['ana'+i]||'-')+'</span></p>'}).join('')+V.refleksi.map(function(q,i){return '<p><b>R'+(i+1)+'. '+lkEsc(q)+'</b><br><span class="lk-text">'+lkEsc(p['ref'+i]||'-')+'</span></p>'}).join(''));
 h+=lk2NilaiCard(p,m,vf,staff);
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
 document.querySelectorAll('[data-lk2-calc]').forEach(function(el){var a=el.dataset.lk2Calc.split('|'),o=c[a[0]]&&c[a[0]][+a[1]];el.textContent=o?lk2Fmt(o[a[2]],lk2Dec(a[0])):''});
 var d0=lkRead();document.querySelectorAll('[data-lk2-auto]').forEach(function(el){var v=lk2Auto(m,+el.dataset.lk2Auto,d0,c);if(v!==null)el.value=v});
});
/* Simpan verifikasi guru (gerbang, saksi, paraf APD) ke payload pengumpulan. */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="lk2-verif"]');if(!b||!isStaff()||!LK.detail)return;
 var z=(S.lkpd||[]).find(function(x){return x.id===LK.detail.id})||LK.detail,p;
 try{p=JSON.parse(z.payload||'{}')}catch(x){p={}}
 var vf={g:{},s:{},a:{}};
 document.querySelectorAll('#lk2-verif [data-lk2v]').forEach(function(el){if(el.checked)vf[el.dataset.lk2v.charAt(0)][el.dataset.lk2v.slice(1)]=1});
 var m=(LKPD_MODULES||[]).find(function(x){return x.id===z.moduleId}),inp=document.getElementById('lk2-ana-n'),raw=inp?String(inp.value).trim():'',n=Number(raw);
 if(raw===''||!Number.isInteger(n)||n<0||n>100){toast('Isi nilai analisis (bilangan bulat 0–100) dulu');return}
 vf.n=n;vf.by=String(S.user.nama||'').slice(0,128);vf.ts=Date.now();
 if(m&&lk2Is(m)){var R=lk2PraktikV(m,p,vf);vf.praktik=R.praktik;vf.kkm=R.kkm;vf.lulus=R.lulus}
 p.v2=p.v2||{ver:2};p.v2.verif=vf;
 z.payload=JSON.stringify(p);z.d=1;LK.detail=z;
 if(Cloud.on)persist();else save();
 render();toast('Verifikasi guru tersimpan'+(typeof vf.praktik==='number'?' · praktik terverifikasi '+vf.praktik:''));
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


/* Kartu Lembar Kerja: satu kartu terbuka. Terbuka otomatis saat dipilih (ketuk judul atau fokus ke isian di dalamnya), tertutup saat berpindah ke kartu lain. */
function lk2Gulung(){var e=document.scrollingElement||document.documentElement;return e}
function lk2Buka(key){
 if(!key||LK2.kartu===key)return;
 var tj=document.querySelector('.lk2-p[data-lk2k="'+key+'"] .lk2-ph'),y0=tj?tj.getBoundingClientRect().top:0;
 LK2.kartu=key;
 document.querySelectorAll('.lk2-p[data-lk2k]').forEach(function(el){
  var on=el.getAttribute('data-lk2k')===key;
  el.classList.toggle('is-open',on);
  var h=el.querySelector('.lk2-ph');if(h)h.setAttribute('aria-expanded',on?'true':'false');
 });
 /* Kartu sebelumnya menutup dan menggeser isi halaman; judul kartu yang dipilih dijaga tetap di posisi layar semula agar tidak meloncat. */
 if(tj){var d=tj.getBoundingClientRect().top-y0;if(d)lk2Gulung().scrollTop+=d}
 /* Kartu terbuka = pewaktunya jalan, kartu lain berhenti (semua kartu Kegiatan). */
 if(typeof lkcSelaras==='function')lkcSelaras();
}
function lk2KartuDari(t){var el=t&&t.closest?t.closest('.lk2-p[data-lk2k]'):null;return el?el.getAttribute('data-lk2k'):''}
document.addEventListener('click',function(e){
 var h=e.target.closest('[data-act="lk2-kartu"]');
 if(h){var k=h.getAttribute('data-key'),el=h.closest('.lk2-p');
  if(el&&el.classList.contains('is-open')){LK2.kartu='';el.classList.remove('is-open');h.setAttribute('aria-expanded','false');if(typeof lkcSelaras==='function')lkcSelaras()}else lk2Buka(k);
  return}
 var k2=lk2KartuDari(e.target);if(k2)lk2Buka(k2);
});
document.addEventListener('focusin',function(e){
 if(e.target.closest&&e.target.closest('.lk2-ph'))return;
 var k=lk2KartuDari(e.target);if(k)lk2Buka(k)});
document.addEventListener('keydown',function(e){
 if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[data-act="lk2-kartu"]')){e.preventDefault();e.target.click()}
});
/* Setelah render dengan penanda "kurang", buka kartu yang memuat isian merah pertama */
function lk2BukaYangKurang(){
 var n=document.querySelector('.lk2-need');if(!n)return;
 var bn=n.closest('details.lk2-bn');if(bn){bn.open=true;LK2.open=LK2.open||{};LK2.open[bn.getAttribute('data-lk2d')]=true}
 var k=lk2KartuDari(n);if(k)lk2Buka(k);
 try{n.scrollIntoView({block:'center'})}catch(e){}}
/* Tutup semua kartu Kegiatan (mis. setelah Kirim berhasil) dan hentikan pewaktunya. */
function lk2TutupKartu(){LK2.kartu='';document.querySelectorAll('.lk2-p[data-lk2k]').forEach(function(el){el.classList.remove('is-open');var h=el.querySelector('.lk2-ph');if(h)h.setAttribute('aria-expanded','false')});if(typeof lkcSelaras==='function')lkcSelaras()}
