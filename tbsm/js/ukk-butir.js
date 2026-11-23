/* ukk-butir.js (v90): analisis per butir UKK dan Excel nilai kelas (Admin dan Guru).
   SUMBER DATA: rincian per butir yang disimpan saat Simpan di hasil.payload (v89): status pilihan siswa (st), hasil aktual (hs),
   catatan (hn), dan salinan butir saat ujian. Poin tiap butir dihitung ulang dengan ukkNilaiButir (ukk-aturan.js), jadi
   persentase "dapat nilai" sama dengan cara nilai unit dihitung. Hasil yang disimpan sebelum v89 tidak punya rincian:
   tetap masuk nilai dan statistik, tidak masuk analisis butir.
   PENGELOMPOKAN: butir digabung menurut teks komponen (bukan nomor), sehingga tetap benar bila isi unit diedit atau diurutkan ulang.
   DIPAKAI: ukkAnalisis dan ukkXls di ukk-xls.js (panel dan sheet per unit), tombol Ekspor nilai kelas di daftar UKK. */
var UKB={};
(function(){var st=document.createElement('style');st.textContent='.ukb-chip{display:inline-flex;font-size:12px;border:1px solid var(--line);border-radius:99px;padding:2px 9px;background:var(--surface);white-space:nowrap}.ukb-chip.ok{background:var(--ok-bg);color:var(--ok);border-color:transparent}.ukb-chip.bad{background:var(--bad-bg);color:var(--bad);border-color:transparent}.ukb-wrap{display:flex;flex-wrap:wrap;gap:6px}';document.head.appendChild(st)})();

/* ---------- Rincian dari payload ---------- */
function ukbPay(r){
 if(!r||!r.payload)return null;
 try{var d=typeof r.payload==='string'?JSON.parse(r.payload):r.payload;return d&&d.job&&d.job.items&&d.st?d:null}catch(e){return null}
}
function ukbStatusTeks(v){return v===1?'Sesuai':(v===0?'Tidak sesuai':'Belum diperiksa')}
/* Penilaian tiap butir satu hasil; null bila tidak punya rincian */
function ukbRincian(r){
 var d=ukbPay(r);if(!d)return null;
 return d.job.items.map(function(it,k){
  var st=d.st[k],hs=(d.hs||{})[it.id]||'',hn=(d.hn||{})[it.id]||'';
  var n=typeof ukkNilaiButir==='function'?ukkNilaiButir(it,st,hs,hn):{poin:st===1?1:0,benar:null,kurang:[]};
  return {it:it,st:st,hs:hs,hn:hn,poin:n.poin,benar:n.benar,kurang:n.kurang||[]};
 });
}
function ukbKey(t){return String(t||'').replace(/\s+/g,' ').trim().toLowerCase()}

/* ---------- Siswa dan hasil terbaru ---------- */
function ukbMakeKey(){
 var m={};
 (S.users||[]).forEach(function(u){if(!hasRole(u,'siswa'))return;var k=String(u.nama||'').trim().toLowerCase()+'|'+(u.kelas||'');(m[k]=m[k]||[]).push(u)});
 return function(r){
  if(r.sid)return 's:'+r.sid;
  var n=String(r.siswa||'').trim().toLowerCase(),c=m[n+'|'+(r.kelas||'')];
  if(c&&c.length===1)return 's:'+c[0].id;
  return 'n:'+(n||'tanpa nama')+'|'+(r.kelas||'');
 };
}
function ukbRoster(kelas){return (S.users||[]).filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&schAkunOk(u)&&u.kelas===kelas})}
function ukbTerbaru(L,key){
 var m={};L.forEach(function(r){var k=key(r)+'#'+r.jobId;if(!m[k]||r.ts>m[k].ts)m[k]=r});
 return Object.keys(m).map(function(k){return m[k]});
}
function ukbNIS(r){var d=ukbPay(r);return d&&d.nis?String(d.nis):''}

/* ---------- Analisis per butir satu unit ---------- */
/* L: daftar hasil unit (sudah difilter jenis). Memakai hasil terbaru tiap siswa. */
function ukbUnit(j,L){
 var last=ukbTerbaru(L,ukbMakeKey()),rows=[];
 last.forEach(function(r){var rin=ukbRincian(r);if(rin)rows.push({r:r,rin:rin})});
 var map={},order=[];
 j.items.forEach(function(it){var k=ukbKey(it.t);if(map[k])return;map[k]={t:it.t,std:it.std,no:it.no,k:!!it.k,f:!!it.f,lama:false,n:0,poin:0,sesuai:0,tidak:0,keliru:0,kurang:0};order.push(k)});
 rows.forEach(function(x){
  x.rin.forEach(function(b){
   var k=ukbKey(b.it.t),m=map[k];
   if(!m){m=map[k]={t:b.it.t,std:b.it.std,no:b.it.no,k:!!b.it.k,f:!!b.it.f,lama:true,n:0,poin:0,sesuai:0,tidak:0,keliru:0,kurang:0};order.push(k)}
   m.n++;if(b.poin)m.poin++;
   if(b.st===1)m.sesuai++;else if(b.st===0)m.tidak++;
   if(b.benar!==null&&(b.st===1||b.st===0)&&b.st!==b.benar)m.keliru++;
   if(b.kurang.length)m.kurang++;
  });
 });
 var items=order.map(function(k){var m=map[k];m.p=m.n?Math.round(100*m.poin/m.n):0;return m});
 return {j:j,n:last.length,valid:rows.length,rows:rows,items:items,last:last};
}

/* Panel di Kelola unit > Hasil penilaian (di bawah Analisis unit) */
function ukbButirHtml(j){
 var L=typeof ukxList==='function'?ukxList(j):S.results.filter(function(r){return r.jobId===j.id&&r.tipe==='Penilaian'});
 if(!L.length)return '';
 var u=ukbUnit(j,L),h='<section class="card"><h3>Analisis per butir</h3>';
 if(!u.valid)return h+'<p class="muted">Rincian per butir belum tersedia. Hasil yang disimpan sebelum v89 hanya punya nilai akhir; analisis butir muncul otomatis untuk hasil baru.</p></section>';
 h+='<p class="note">Dari '+u.valid+' hasil terbaru yang punya rincian'+(u.valid<u.n?' ('+(u.n-u.valid)+' hasil lama tanpa rincian tidak dihitung)':'')+'. "Dapat nilai" artinya status yang dipilih cocok dengan hasil aktual dan standar, dan isiannya lengkap.</p>';
 var sorted=u.items.filter(function(i){return i.n>0}).sort(function(a,b){return a.p-b.p||b.keliru-a.keliru}).slice(0,8);
 h+=sorted.map(function(i){
  var ex=[];if(i.keliru)ex.push(i.keliru+' keliru menilai');if(i.kurang)ex.push(i.kurang+' isian belum lengkap');if(i.tidak)ex.push(i.tidak+' memilih Tidak sesuai');
  return naBar(esc(i.no+'. '+i.t)+(i.k?' <span class="pill warn">Wajib</span>':'')+(i.lama?' <span class="pill plain">versi lama</span>':'')+' · '+i.poin+' dari '+i.n,i.p/100,ex.join(' · '),'');
 }).join('');
 h+='<p class="note">Delapan butir dengan persentase dapat nilai terendah. Daftar lengkap ada di sheet Analisis butir pada Unduh Excel.</p></section>';
 return h;
}

/* ---------- Sheet tambahan untuk Excel per unit ---------- */
function ukbSheetsUnit(j,L){
 var u=ukbUnit(j,L),out=[];
 var ab=[['Kode unit','Unit','No','Komponen','Standar manual','Wajib','Wajib foto','Jumlah hasil','Dapat nilai','% Dapat nilai','Pilih Sesuai','Pilih Tidak sesuai','Keliru menilai','Isian belum lengkap','Catatan']];
 u.items.forEach(function(i){ab.push([j.id,j.judul,i.no,i.t,i.std,i.k?'Ya':'',i.f?'Ya':'',i.n,i.poin,i.n?i.p:'',i.sesuai,i.tidak,i.keliru,i.kurang,i.lama?'Butir dari versi unit sebelumnya':''])});
 out.push(['Analisis butir',ab,[10,40,5,44,44,7,10,12,11,13,12,16,14,18,30]]);
 var rb=[['Siswa','Kelas','NIS','Kode unit','Unit','Jenis','Tanggal','No','Komponen','Standar manual','Hasil aktual','Status dipilih','Status benar (sistem)','Dapat nilai','Kekurangan isian','Catatan butir']];
 u.rows.slice().sort(function(a,b){return String(a.r.siswa).localeCompare(String(b.r.siswa))}).forEach(function(x){
  var r=x.r,nis=ukbNIS(r);
  x.rin.forEach(function(b){rb.push([r.siswa||'',r.kelas,nis,j.id,j.judul,typeof jenisTampil==='function'?jenisTampil(r):r.tipe,ymd(r.ts),b.it.no,b.it.t,b.it.std,b.hs,ukbStatusTeks(b.st),b.benar===null?'':ukbStatusTeks(b.benar),b.poin,b.kurang.join(', '),b.hn])});
 });
 out.push(['Rincian butir',rb,[28,8,12,10,36,14,12,5,44,40,24,16,20,10,22,30]]);
 return out;
}
/* dipanggil dari ukkXls (ukk-xls.js) */
function ukbSheets(j,L){try{return ukbSheetsUnit(j,L)}catch(e){console.warn('Analisis butir gagal:',e);return []}}

/* ---------- Excel nilai kelas ---------- */
var UKB_FS={kompeten:'Kompeten',sebagian:'Belum lengkap',belum:'Belum kompeten',kosong:'Belum dinilai'};
function ukbKelasData(kelas){
 var key=ukbMakeKey(),all=JOBS.filter(function(j){return j.kelas===kelas&&j.ukk}),ids=all.map(function(j){return j.id});
 var resmi=ukbTerbaru(schHasilList(S.results).filter(function(r){return ids.indexOf(r.jobId)>-1&&r.tipe==='Penilaian'}),key),has={};
 resmi.forEach(function(r){has[r.jobId]=1});
 var units=all.filter(function(j){return ukkTampil(j)||has[j.id]}),wajib=units.filter(function(j){return ukkTampil(j)}),rows={};
 ukbRoster(kelas).forEach(function(u){rows['s:'+u.id]={nama:u.nama,kelas:kelas,cells:{},nis:''}});
 resmi.forEach(function(r){
  var k=key(r),o=rows[k]||(rows[k]={nama:r.siswa||'Tanpa nama',kelas:r.kelas||kelas,cells:{},nis:''});
  o.cells[r.jobId]=r;var nis=ukbNIS(r);if(nis&&!o.nis)o.nis=nis;
 });
 var list=Object.keys(rows).map(function(k){
  var o=rows[k],as=units.filter(function(j){return o.cells[j.id]});
  o.n=as.length;o.k=as.filter(function(j){return o.cells[j.id].kompeten}).length;
  o.avg=as.length?Math.round(as.reduce(function(t,j){return t+(+o.cells[j.id].score||0)},0)/as.length):'';
  o.fs=!as.length?'kosong':(as.some(function(j){return !o.cells[j.id].kompeten})?'belum':(wajib.every(function(j){return o.cells[j.id]})?'kompeten':'sebagian'));
  return o;
 }).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama))});
 return {units:units,list:list,resmi:resmi,roster:ukbRoster(kelas).length};
}
function ukbXlsKelas(kelas){
 if(!needX())return;
 var d=ukbKelasData(kelas);
 if(!d.units.length){toast('Tidak ada unit UKK untuk kelas ini');return}
 var ids=d.units.map(function(j){return j.id}),semua=schHasilList(S.results).filter(function(r){return ids.indexOf(r.jobId)>-1}).sort(function(a,b){return a.ts-b.ts});
 if(!semua.length){toast('Belum ada nilai UKK untuk diekspor');return}
 var tglx=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 var sum=[['Nilai UKK '+(KELAS[kelas]?KELAS[kelas].judul:kelas)],['Diekspor',tglx],['KKM',S.kkm],['Dasar hitung','Penilaian terbaru tiap siswa per unit (Latihan tidak dihitung)'],['Jumlah siswa kelas',d.roster],[],
  ['Kode unit','Unit','Tipe kendaraan','Mode','Siswa dinilai','Rata-rata','Tertinggi','Terendah','Kompeten','% Kompeten']];
 d.units.forEach(function(j){
  var L=d.resmi.filter(function(r){return r.jobId===j.id}),sc=L.map(function(r){return +r.score||0}),kom=L.filter(function(r){return r.kompeten}).length;
  sum.push([j.id,j.judul,j.unit,j.cfg&&j.cfg.mode==='ujian'?'Ujian':'Latihan',L.length,L.length?Math.round(sc.reduce(function(a,b){return a+b},0)/L.length):'',L.length?Math.max.apply(null,sc):'',L.length?Math.min.apply(null,sc):'',kom,L.length?Math.round(100*kom/L.length):'']);
 });
 var head=['No','Siswa','Kelas','NIS'];d.units.forEach(function(j){head.push(j.id+' nilai',j.id+' status')});head.push('Unit dinilai','Unit kompeten','Rata-rata','Status akhir');
 var mx=[head];
 d.list.forEach(function(o,i){
  var row=[i+1,o.nama,o.kelas,o.nis];
  d.units.forEach(function(j){var r=o.cells[j.id];row.push(r?(+r.score||0):'',r?(r.kompeten?'Kompeten':'Belum kompeten'):'')});
  row.push(o.n,o.k,o.avg,UKB_FS[o.fs]);mx.push(row);
 });
 var det=[['No','Tanggal','Kelas','Siswa','NIS','Kode unit','Unit','Jenis','Skor','Status','KKM','Penilai','Durasi (menit)','Catatan']];
 semua.forEach(function(r,i){var j=jobById(r.jobId)||{};det.push([i+1,new Date(r.ts).toLocaleString('id-ID'),r.kelas,r.siswa||'',ukbNIS(r),r.jobId,j.judul||r.jobId,typeof jenisTampil==='function'?jenisTampil(r):r.tipe,+r.score||0,r.kompeten?'Kompeten':'Belum kompeten',S.kkm,r.penilai||r.oleh||'',r.detik?Math.round(r.detik/6)/10:'',r.catatan||'']);});
 var pairs=[['Ringkasan',sum,[12,44,28,10,13,10,10,9,10,12]],['Matriks nilai',mx,[5,28,8,12].concat(d.units.reduce(function(a){return a.concat([11,16])},[])).concat([12,13,10,16])],['Detail percobaan',det,[5,20,8,28,12,10,40,14,7,16,6,22,13,50]]];
 var ab=null,rb=null;
 d.units.forEach(function(j){
  var L=schHasilList(S.results).filter(function(r){return r.jobId===j.id&&r.tipe==='Penilaian'});if(!L.length)return;
  ukbSheets(j,L).forEach(function(p){
   if(p[0]==='Analisis butir'){if(!ab)ab=p;else Array.prototype.push.apply(ab[1],p[1].slice(1))}
   else{if(!rb)rb=p;else Array.prototype.push.apply(rb[1],p[1].slice(1))}
  });
 });
 if(ab)pairs.push(ab);if(rb)pairs.push(rb);
 pairs.push(['Petunjuk',[['Lembar','Isi'],
  ['Ringkasan','Statistik per unit dari penilaian terbaru tiap siswa.'],
  ['Matriks nilai','Satu baris per siswa. Status akhir: Kompeten = semua unit yang tampil sudah dinilai dan kompeten; Belum lengkap = yang dinilai kompeten tetapi masih ada unit belum dinilai; Belum kompeten = ada unit dinilai yang belum kompeten; Belum dinilai = belum ada nilai. Ini ringkasan per unit; nilai akhir berbobot dengan observasi ada di Nilai Akhir UKK.'],
  ['Detail percobaan','Semua percobaan, termasuk Latihan UKK, urut waktu.'],
  ['Analisis butir','Persentase dapat nilai per butir dari hasil terbaru yang punya rincian (disimpan sejak v89). Dihitung dari Penilaian saja.'],
  ['Rincian butir','Satu baris per siswa per butir, siap dijadikan tabel pivot.']],[18,110]]);
 book(pairs,'Nilai_UKK_'+kelas);
 toast('Excel diunduh');
}

/* ---------- Aksi ---------- */
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="ukb-"]');if(!b)return;
 var a=b.dataset.act;
 if(a==='ukb-selesai'){resetV();render();window.scrollTo(0,0);return}
 if(!isStaff())return;
 if(a==='ukb-xls-kelas')ukbXlsKelas(S.kelas);
});
