/* Cetak hasil per siswa (guru/admin/proktor): satu halaman lembar hasil untuk tiap siswa pada satu sesi ujian.
   Tombol: Analisis dan Pantau > "Hasil per siswa" (ringkas) dan "Hasil per siswa + rincian" (dengan tabel jawaban per soal),
   serta tombol Cetak pada kartu hasil ujian di tab Hasil (satu siswa).
   Isi halaman: kop sekolah, identitas (nama, kelas, no. peserta, username, ruang), sesi, jadwal, nilai, KKM, ketuntasan,
   jumlah benar, keluar halaman, catatan uraian yang belum dinilai, lalu (opsional) rincian per soal tanpa teks soal.
   Rincian memakai kunci di perangkat guru/admin (BS.kc); tanpa kunci, kolom kunci dan hasil ditulis "-".
   Siswa yang belum mengerjakan tidak dicetak. Memakai window.print(); pilih "Simpan sebagai PDF" bila ingin berkas.
   Bergantung pada: cbt-staf.js (window.cbtStaf), banksoal.js (BS, bsSoalById, bsFrac, bsAnswered), ruang.js, sekolah.js, logo.js.
   Tidak mengubah data atau koleksi Appwrite. Uji: tools/uji-cetak-siswa.mjs */
(function(){
'use strict';
var HURUF='ABCDEFGHIJ';
function t(v){var d=document.createElement('div');d.textContent=v==null?'':String(v);return d.innerHTML}
function tglPanjang(ts){return new Date(ts).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function jamS(ts){return ts?new Date(ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'-'}
function durasiTeks(dt){dt=Math.max(0,Math.round(+dt||0));var m=Math.floor(dt/60),s=dt%60;return m+' menit'+(s?' '+s+' detik':'')}

/* teks jawaban dan kunci satu soal (huruf pilihan; kategori: B/S per pernyataan) */
function jawabTeks(q,a){
 if(a==null||a==='')return '-';
 if(q.tipe==='pg')return typeof a==='number'?HURUF[a]||'-':'-';
 if(q.tipe==='kompleks')return Array.isArray(a)&&a.length?a.slice().sort().map(function(i){return HURUF[i]}).join(', '):'-';
 if(q.tipe==='kategori'){
  if(!Array.isArray(a))return '-';
  var l=Array.isArray(q.lab)?q.lab:['Benar','Salah'];
  return a.map(function(v){return v===0?String(l[0]||'B').charAt(0):v===1?String(l[1]||'S').charAt(0):'·'}).join(' ');
 }
 if(q.tipe==='uraian')return String(a).trim()?'(uraian)':'-';
 return '-';
}
function kunciTeks(q){
 if(!q||!window.bsHasKey||!bsHasKey(q))return '-';
 if(q.tipe==='pg')return HURUF[q.kunci]||'-';
 if(q.tipe==='kompleks')return (q.kunci||[]).slice().sort().map(function(i){return HURUF[i]}).join(', ');
 if(q.tipe==='kategori'){var l=Array.isArray(q.lab)?q.lab:['Benar','Salah'];return (q.rows||[]).map(function(r){return r[1]?String(l[0]||'B').charAt(0):String(l[1]||'S').charAt(0)}).join(' ')}
 return '-';
}
/* hasil satu soal: Benar, Sebagian, Salah, Kosong, atau status uraian */
function hasilSoal(q,h,id){
 var a=h.ans?h.ans[id]:null,jwb=window.bsAnswered&&bsAnswered(q,a);
 if(q.tipe==='uraian'){
  var g=h.nu&&h.nu[id];
  if(!jwb)return 'Kosong';
  return g&&g.skor!=null?'Skor '+g.skor+(q.maks?' / '+q.maks:''):'Belum dinilai';
 }
 if(!jwb)return 'Kosong';
 if(!window.bsHasKey||!bsHasKey(q))return '-';
 var f=bsFrac(q,a);
 return f>=1?'Benar':f>0?'Sebagian':'Salah';
}

/* Susun HTML satu halaman. o = {s (sesi), u (akun), h (hasil), kkm, rg (ruang), pk (nama proktor), no (no. peserta), rinci (bool), now}
   Fungsi murni, mudah diuji. */
function halaman(o){
 var s=o.s,u=o.u||{},h=o.h,sk=typeof SEK!=='undefined'?SEK:{nama:'',program:'',alamat:''},logo=typeof LOGO!=='undefined'?LOGO:'';
 var kkm=+o.kkm||0,tuntas=h.score>=kkm,pend=+h.pend||0;
 var kop='<div class="ujk"><img src="'+logo+'" alt=""><div><b>'+t(sk.nama)+'</b><span>'+t(sk.program)+'</span><small>'+t(sk.alamat)+'</small></div></div>';
 var mulaiTs=h.ts?h.ts-(h.detik||0)*1000:0;
 var info=[
  ['Nama',t(u.nama||h.siswa||'-')],['Sesi ujian',t(s.judul)],
  ['Kelas',t(u.kelas||h.kelas||'-')],['Hari dan tanggal',h.ts?t(tglPanjang(mulaiTs||h.ts)):'-'],
  ['No. peserta',o.no?t(o.no):'-'],['Waktu',(mulaiTs?jamS(mulaiTs)+' sampai ':'')+jamS(h.ts)+(h.detik?' ('+durasiTeks(h.detik)+')':'')],
  ['Username',t(u.username||'-')],['Durasi sesi',(s.durasi||0)+' menit']
 ];
 if(o.rg)info.push(['Ruang',t(o.rg)],['Proktor',t(o.pk||'-')]);
 var ib='';
 for(var i=0;i<info.length;i+=2)ib+='<tr><td style="width:17%">'+info[i][0]+'</td><td>'+info[i][1]+'</td><td style="width:17%">'+(info[i+1]?info[i+1][0]:'')+'</td><td>'+(info[i+1]?info[i+1][1]:'')+'</td></tr>';
 var ket=pend?'Nilai sementara, '+pend+' soal uraian belum dinilai':(tuntas?'Tuntas':'Belum tuntas');
 var nilai='<table style="margin:10px 0"><tbody><tr>'+
  '<td style="width:25%;text-align:center"><span style="font-size:9pt">NILAI</span><br><b style="font-size:26pt">'+t(h.score)+'</b></td>'+
  '<td>KKM: '+t(kkm)+'<br>Keterangan: <b>'+t(ket)+'</b><br>Soal benar: '+t(h.benar==null?'-':h.benar)+' dari '+t(h.total==null?'-':h.total)+' soal<br>Keluar halaman: '+(+h.pindah||0)+' kali</td></tr></tbody></table>';
 var rinci='';
 if(o.rinci){
  var ids=Array.isArray(h.order)?h.order:[],baris='',ada=0;
  ids.forEach(function(id,i){
   var q=window.bsSoalById?bsSoalById(id):null;
   if(!q){baris+='<tr><td>'+(i+1)+'</td><td colspan="4">Soal tidak ditemukan (sudah dihapus)</td></tr>';return}
   ada++;
   baris+='<tr><td>'+(i+1)+'</td><td>'+t((q.mapel||'')+(q.topik?' · '+q.topik:''))+'</td><td style="text-align:center">'+t(jawabTeks(q,h.ans?h.ans[id]:null))+'</td><td style="text-align:center">'+t(kunciTeks(q))+'</td><td>'+t(hasilSoal(q,h,id))+'</td></tr>';
  });
  rinci='<h3 style="margin:10px 0 4px">Rincian jawaban</h3><table><thead><tr><th>No</th><th>Mapel dan topik</th><th>Jawaban</th><th>Kunci</th><th>Hasil</th></tr></thead><tbody>'+(baris||'<tr><td colspan="5">Rincian soal tidak tersedia untuk hasil ini.</td></tr>')+'</tbody></table>'+
   '<p style="font-size:8.5pt;margin:4px 0 0">Jawaban pilihan ganda memakai huruf pilihan asli (bukan urutan acak di layar siswa). Pernyataan kategori ditulis berurutan.</p>';
 }
 var tg=(o.now||new Date()).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
 return '<div class="cs-hal"'+(o.baru?' style="break-before:page;page-break-before:always"':'')+'>'+kop+'<h2 style="text-align:center;margin:6px 0">LEMBAR HASIL UJIAN</h2><table style="margin-bottom:4px"><tbody>'+ib+'</tbody></table>'+nilai+rinci+
  '<div style="display:flex;justify-content:space-between;margin-top:22px;text-align:center"><div style="width:45%">Orang tua/wali<br><br><br><br>(................................)</div><div style="width:45%">'+t(tg)+'<br>Guru mata pelajaran<br><br><br>(................................)</div></div></div>';
}
window.csHalaman=halaman;
/* catat ke log audit lewat aksi catat yang sudah ada (tanpa perubahan fungsi); hanya mode aman, gagal tidak menghalangi cetak */
function audit(sesiId,ket){try{if(window.bsAman&&bsAman()&&window.cbtFn)cbtFn({action:'catat',aksi:'cetak.hasil-siswa',sesiId:sesiId||'',ket:ket}).catch(function(){})}catch(e){}}

/* urutan cetak: per ruang (bila beruang), lalu urutan daftar peserta (kelas, nama) */
function urutan(s,ros){
 if(!(window.rgList&&rgList(s).length))return ros.map(function(u){return {u:u,g:null}});
 var L=rgList(s),out=ros.map(function(u,i){var g=rgOf(s,u.id);return {u:u,g:g,i:i,k:g?L.indexOf(g):999}});
 out.sort(function(a,b){return a.k-b.k||a.i-b.i});return out;
}

async function cetakSesi(id,rinci){
 var C=window.cbtStaf;if(!C)return;
 var s=C.sesiById(id);if(!s){toast('Pilih sesi ujian dahulu');return}
 if(Cloud.on&&C.PN.sesiLoaded!==id){C.PN.sesi=id;await C.pnLoad()}
 var hs=C.hasilSesi(id),ros=C.roster(s),kkm=+s.kkm||S.kkm;
 var daftar=urutan(s,ros).filter(function(x){return hs[x.u.id]});
 /* proktor beruang hanya mencetak ruang yang ia awasi */
 if(window.rgList&&rgList(s).length&&window.actRole&&actRole()==='proktor'){
  daftar=daftar.filter(function(x){return x.g&&x.g.pk===S.user.id});
 }
 if(!daftar.length){toast('Belum ada siswa yang selesai pada sesi ini');return}
 if(rinci&&window.bsLoadRahasia&&!BS.kcLoaded&&window.isStaff&&isStaff()){try{await bsLoadRahasia()}catch(e){}}
 var now=new Date();
 var html=daftar.map(function(x,ix){
  return halaman({s:s,u:x.u,h:hs[x.u.id],kkm:kkm,rg:x.g?(window.rgLabel?rgLabel(x.g):x.g.nama):'',pk:x.g&&x.g.pk&&window.rgPkNama?rgPkNama(x.g.pk):'',no:window.rgNomor?rgNomor(s,x.u.id):'',rinci:rinci,now:now,baru:ix>0});
 }).join('');
 audit(id,daftar.length+' lembar'+(rinci?' dengan rincian':''));
 C.cetakHtml(html);
}
window.csCetakSesi=cetakSesi;

/* satu siswa dari tab Hasil */
async function cetakSatu(hid){
 var C=window.cbtStaf,h=BS.D.hasil.filter(function(x){return x.id===hid})[0];
 if(!C||!h||h.mode!=='ujian'){toast('Hasil ujian tidak ditemukan');return}
 var s=C.sesiById(h.sesiId)||{judul:h.sesiJudul||'Ujian',durasi:0},u=(S.users||[]).filter(function(x){return x.id===h.sid})[0]||{nama:h.siswa,kelas:h.kelas};
 var g=window.rgOf&&s.ruang?rgOf(s,h.sid):null;
 if(window.bsLoadRahasia&&!BS.kcLoaded&&window.isStaff&&isStaff()){try{await bsLoadRahasia()}catch(e){}}
 audit(h.sesiId,'1 lembar dengan rincian');
 C.cetakHtml(halaman({s:s,u:u,h:h,kkm:+s.kkm||S.kkm,rg:g&&window.rgLabel?rgLabel(g):'',pk:g&&g.pk&&window.rgPkNama?rgPkNama(g.pk):'',no:window.rgNomor&&s.nomor?rgNomor(s,h.sid):'',rinci:true,now:new Date()}));
}
window.csCetakSatu=cetakSatu;

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-bs]');if(!b||!window.cbtStaf)return;
 var a=b.dataset.bs;
 if(a==='an-siswa')cetakSesi(window.cbtStaf.sesiAktif(),false);
 else if(a==='an-siswa-r')cetakSesi(window.cbtStaf.sesiAktif(),true);
 else if(a==='hs-cetak')cetakSatu(b.dataset.v);
});
})();
