/* Evaluasi absensi mingguan (harian dan PKL) serta tombol arsip ke Drive (admin). Dipasang di rekap absensi dan rekap PKL. */
var AR={m:{}};
function arYmd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function arSenin(t){var d=t?new Date(t+'T00:00:00'):new Date();if(!t)d.setDate(d.getDate()-7);d.setDate(d.getDate()-(d.getDay()+6)%7);return arYmd(d)}
function arAkhir(s){var d=new Date(s+'T00:00:00');d.setDate(d.getDate()+6);return arYmd(d)}
/* baris: satu per siswa. Harian dihitung per sesi kehadiran; PKL per hari. */
function arHitung(j,senin){
 var akhir=arAkhir(senin),M={};
 function B(id,n,k){return M[id]||(M[id]={nama:n,kelas:k,H:0,S:0,I:0,A:0,hari:{}})}
 function dalam(t){return t>=senin&&t<=akhir}
 if(j==='harian'){
  var U={};(S.users||[]).forEach(function(u){U[u.id]=u});
  (typeof schObsList==='function'?schObsList(S.observasi||[]):S.observasi||[]).forEach(function(r){
   if(r.tipe!=='absen'||r.kategori!=='hadir'||!dalam(String(r.tanggal)))return;
   var R=abPay(r).rows;Object.keys(R).forEach(function(id){var u=U[id];if(!u)return;var b=B(id,u.nama,u.kelas||'');if(b[R[id].s]!=null)b[R[id].s]++});
  });
 }else{
  pkList('absen').forEach(function(a){
   if(!dalam(a.tanggal)||a.tipe==='pulang')return;
   var b=B(a.sid,pkNm(a),pkKl(a)),k=a.tipe==='masuk'?'H':a.tipe==='sakit'?'S':a.tipe==='izin'?'I':'';
   if(k&&!b.hari[a.tanggal]){b.hari[a.tanggal]=1;b[k]++}
  });
 }
 return Object.keys(M).map(function(id){return M[id]}).sort(function(a,b){return String(a.nama).localeCompare(String(b.nama),'id')});
}
function arKartu(j){
 var m=AR.m[j]||(AR.m[j]=arSenin()),L=arHitung(j,m);
 return '<div class="card"><b>Evaluasi mingguan '+(j==='pkl'?'PKL':'harian')+'</b><label class="f">Pilih tanggal dalam minggu<input type="date" data-ar="'+j+'" value="'+m+'"></label>'+
  '<div class="note">'+m+' s.d. '+arAkhir(m)+' · '+L.length+' siswa tercatat'+(j==='pkl'?'. Alpa PKL tidak dihitung di sini.':'')+'</div>'+
  '<div class="row"><button type="button" class="btn small primary" data-arxls="'+j+'">Ekspor Excel minggu</button>'+
  (S.role==='admin'&&Cloud.on?'<button type="button" class="btn small" data-arkirim="'+j+'">Arsipkan ke Drive</button>':'')+'</div></div>';
}
if(typeof abViewRekap==='function'){var _arAb=abViewRekap;abViewRekap=function(){return arKartu('harian')+_arAb()}}
if(typeof pkTabRekap==='function'){var _arPk=pkTabRekap;pkTabRekap=function(){return arKartu('pkl')+_arPk()}}
document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.ar&&t.value){AR.m[t.dataset.ar]=arSenin(t.value);render()}});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-arxls],[data-arkirim]');if(!b)return;
 var j=b.dataset.arxls||b.dataset.arkirim,m=AR.m[j];
 if(b.dataset.arxls){
  var L=arHitung(j,m);if(!L.length)return toast('Belum ada data pada minggu ini.');
  if(typeof XLSX==='undefined')return toast('Pustaka Excel belum termuat.');
  var wb=XLSX.utils.book_new(),A=[['Nama','Kelas','Hadir','Sakit','Izin'].concat(j==='harian'?['Alpa']:[])];
  L.forEach(function(x){A.push([x.nama,x.kelas,x.H,x.S,x.I].concat(j==='harian'?[x.A]:[]))});
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(A),'Mingguan');XLSX.writeFile(wb,'Absensi-'+j+'-'+m+'.xlsx');return;
 }
 b.disabled=true;
 ldCall({action:'arsip-absen',jenis:j,minggu:m}).then(function(r){toast(r.jumlah?'Terarsip dan terverifikasi: '+r.jumlah+' dokumen.':'Tidak ada data untuk diarsipkan.')})
  .catch(function(x){toast('Arsip gagal: '+x.message)}).then(function(){b.disabled=false});
});
