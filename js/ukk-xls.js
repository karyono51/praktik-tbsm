/* ukk-xls.js: analisis dan ekspor Excel hasil per unit UKK (Admin dan Guru).
   Dipakai di Kelola unit > Hasil penilaian. Filter Penilaian atau Penilaian + Latihan mengikuti UKS.f.
   Bergantung pada fungsi naAgg, naDist, naBar, naNum, dan naPct dari nilai-analisis.js (dipanggil saat render). */
function ukxList(j){
 return S.results.filter(function(r){return r.jobId===j.id&&(UKS.f==='semua'||r.tipe==='Penilaian')}).sort(function(a,b){return a.ts-b.ts});
}
/* Siswa kelas unit yang belum punya penilaian (tipe Penilaian) untuk unit ini */
function ukxBelum(j){
 var sudah={};S.results.forEach(function(r){if(r.jobId===j.id&&r.tipe==='Penilaian'&&r.sid)sudah[r.sid]=1});
 return (S.users||[]).filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&u.kelas===j.kelas&&!sudah[u.id]})
  .sort(function(a,b){return String(a.nama).localeCompare(String(b.nama))});
}
function ukkAnalisis(j){
 var L=ukxList(j),a=naAgg(L),belum=ukxBelum(j),h='<section class="card"><h3>Analisis unit</h3>';
 if(a.n)h+='<p class="note">Terendah '+a.min+', tertinggi '+a.max+', KKM '+S.kkm+'. Dihitung dari '+(UKS.f==='semua'?'Penilaian dan Latihan':'Penilaian')+'.</p>'+naDist(L).map(function(b){return naBar(b.t+' ('+b.n+')',b.p,'','ok')}).join('');
 else h+='<p class="muted">Belum ada data untuk dianalisis.</p>';
 h+='</section><section class="card"><h3>Belum dinilai ('+belum.length+')</h3>'+(belum.length?
  '<p class="note">Siswa kelas '+esc(KELAS[j.kelas].judul)+' yang belum punya penilaian untuk unit ini.</p>'+belum.map(function(u){return '<div class="row sb"><span>'+esc(u.nama)+'</span><span class="note">'+esc(u.kelas||'')+'</span></div>'}).join(''):
  '<p class="muted">Semua siswa kelas ini sudah dinilai, atau data siswa belum tersedia.</p>')+'</section>';
 return h;
}
function ukkXls(j){
 if(!needX())return;
 var L=ukxList(j);if(!L.length){toast('Belum ada data untuk diunduh');return}
 var a=naAgg(L),c=j.cfg||{},f=j.form||{},wb=XLSX.utils.book_new();
 var info=[['Unit UKK',j.judul],['Kode unit',j.id],['Kelas',j.kelas],['Tipe kendaraan',j.unit],['Alokasi waktu (menit)',j.menit],['Sekolah',f.satuan||''],['Kode',f.kode||''],['Tahun pelajaran',f.tahun||''],
  ['Mode',c.mode==='ujian'?'Ujian':'Latihan'],['Kesempatan ujian',c.mode==='ujian'&&c.maxTry?c.maxTry+' kali':'Tidak terbatas'],['Jadwal buka',c.buka?ukkFmt(c.buka):'-'],['Jadwal tutup',c.tutup?ukkFmt(c.tutup):'-'],
  [],['Data',UKS.f==='semua'?'Penilaian + Latihan':'Penilaian'],['Jumlah data',a.n],['Rata-rata',a.avg],['Nilai terendah',a.min],['Nilai tertinggi',a.max],['KKM',S.kkm],['Persen kompeten',Math.round(a.kom*100)],['Belum dinilai',ukxBelum(j).length]];
 XLSX.utils.book_append_sheet(wb,sheet(info,[30,44]),'Ringkasan');
 var hs=[['No','Tanggal','Siswa','Kelas','Jenis','Skor','Status','Penilai','Durasi (menit)','Catatan']].concat(L.map(function(r,i){
  return [i+1,new Date(r.ts).toLocaleDateString('id-ID'),r.siswa||'',r.kelas,r.tipe,naNum(r),r.kompeten?'Kompeten':'Belum kompeten',r.penilai||r.oleh||'',r.detik?Math.round(r.detik/6)/10:'',r.catatan||''];}));
 XLSX.utils.book_append_sheet(wb,sheet(hs,[5,12,26,8,11,7,16,20,13,44]),'Hasil');
 var ds=[['Rentang nilai','Jumlah','Persen']].concat(naDist(L).map(function(b){return [b.t,b.n,b.p]}));
 var dsh=sheet(ds,[16,10,10]);naPct(dsh,ds.length,'C');XLSX.utils.book_append_sheet(wb,dsh,'Distribusi');
 var bl=[['Siswa','Kelas']].concat(ukxBelum(j).map(function(u){return [u.nama,u.kelas||'']}));
 XLSX.utils.book_append_sheet(wb,sheet(bl,[28,10]),'Belum dinilai');
 dl(wb,'UKK_'+String(j.id).replace(/[^A-Za-z0-9_-]/g,''));
}
