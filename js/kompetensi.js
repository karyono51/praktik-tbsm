/* kompetensi.js: Rekap kompetensi per siswa (Admin dan Guru).
   Menggabungkan nilai uji praktik, LKPD mode Ujian, dan observasi praktik siswa.
   Aturan status unit: memakai nilai TERBARU dari tiap sumber (praktik, LKPD). Unit Kompeten bila semua sumber yang ada Kompeten.
   Nilai Latihan tidak dihitung. Observasi ditampilkan sebagai bukti pendukung, tidak menentukan status unit. */
var KP={kelas:'ALL',st:'ALL',q:'',key:null};
ICO.kompetensi='<path d="M12 3 5 6v5c0 4.4 3 7.9 7 10 4-2.1 7-5.6 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>';

function kpIsStaffNilai(){return !!S.user&&typeof can==='function'&&can('nilai')}
function kpLow(s){return String(s||'').trim().toLowerCase()}
function kpAkunByNama(nama,kelas){
 var n=kpLow(nama);if(!n)return null;
 return S.users.filter(function(u){return hasRole(u,'siswa')&&u.aktif!==false&&kpLow(u.nama)===n&&(!u.kelas||!kelas||u.kelas===kelas)})[0]||null;
}
function kpUnitJudul(id,fallback){
 var j=typeof jobById==='function'?jobById(id):null;if(j)return j.judul;
 var m=(window.LKPD_MODULES||[]).filter(function(x){return x.id===id})[0];if(m)return m.title;
 return fallback||id;
}
function kpBangun(){
 var map={};
 function siswa(sid,nama,kelas){
  var u=sid?S.users.filter(function(x){return x.id===sid})[0]:kpAkunByNama(nama,kelas);
  var key=u?'s:'+u.id:'n:'+kpLow(nama)+'|'+(kelas||'');
  if(!map[key])map[key]={key:key,sid:u?u.id:'',nama:u?u.nama:String(nama||'Tanpa nama'),kelas:u?(u.kelas||kelas||''):(kelas||''),units:{},obs:[]};
  return map[key];
 }
 function unit(s,id,judul,kelas){return s.units[id]||(s.units[id]={id:id,judul:kpUnitJudul(id,judul),kelas:kelas||s.kelas,praktik:null,lkpd:null})}
 S.users.forEach(function(u){if(hasRole(u,'siswa')&&u.aktif!==false)siswa(u.id,u.nama,u.kelas)});
 (S.results||[]).forEach(function(r){
  if(r.tipe==='LKPD'||r.tipe==='Latihan')return;
  var s=siswa(r.sid,r.siswa,r.kelas),u=unit(s,r.jobId,'',r.kelas);
  if(!u.praktik||r.ts>u.praktik.ts)u.praktik={ts:r.ts,score:r.score,kompeten:!!r.kompeten};
 });
 (S.lkpd||[]).forEach(function(x){
  if(typeof lkmModeOf==='function'&&lkmModeOf(x)==='latihan')return;
  var s=siswa(x.sid,x.siswa,x.kelas),u=unit(s,x.moduleId,x.moduleTitle,x.kelas),n=lkNilai(x);
  if(!u.lkpd||x.ts>u.lkpd.ts)u.lkpd={ts:x.ts,score:n,kompeten:n>=S.kkm,koreksi:lkHasK(x)};
 });
 (S.observasi||[]).forEach(function(r){
  if(r.tipe!=='siswa')return;
  var s=siswa(r.guruId,r.guru,r.kelas);
  s.obs.push({id:r.id,tanggal:r.tanggal,mapel:r.mapel,skor:r.skor,kategori:r.kategori,ts:r.ts});
 });
 var out=Object.keys(map).map(function(k){var s=map[k];s.ids=Object.keys(s.units).sort();s.obs.sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))||b.ts-a.ts});kpHitung(s);return s});
 var ko=Object.keys(KELAS);
 out.sort(function(a,b){return (ko.indexOf(a.kelas)+1||9)-(ko.indexOf(b.kelas)+1||9)||String(a.nama).localeCompare(String(b.nama))});
 return out;
}
function kpUnitStatus(u){var src=[u.praktik,u.lkpd].filter(Boolean);if(!src.length)return 'kosong';return src.every(function(x){return x.kompeten})?'kompeten':'belum'}
function kpHitung(s){
 var n=0,k=0;s.ids.forEach(function(id){var st=kpUnitStatus(s.units[id]);s.units[id].status=st;if(st!=='kosong'){n++;if(st==='kompeten')k++}});
 s.n=n;s.k=k;s.status=!n?'kosong':(k===n?'kompeten':'belum');
 s.obsAvg=s.obs.length?Math.round(s.obs.reduce(function(t,o){return t+(+o.skor||0)},0)/s.obs.length):null;
}
function kpLabel(st){return st==='kompeten'?'Kompeten':st==='belum'?'Belum kompeten':'Belum dinilai'}
function kpCls(st){return st==='kompeten'?'ok':st==='belum'?'bad':'plain'}
function kpFiltered(all){
 var q=kpLow(KP.q);
 return all.filter(function(s){return (KP.kelas==='ALL'||s.kelas===KP.kelas)&&(KP.st==='ALL'||s.status===KP.st)&&(!q||kpLow(s.nama).indexOf(q)>-1)});
}
function kpCell(x,unitLabel){
 if(!x)return '<span class="muted">-</span>';
 return x.score+' <span class="pill '+(x.kompeten?'ok':'bad')+'">'+(x.kompeten?'K':'BK')+'</span>'+(x.koreksi?' <small>(dikoreksi)</small>':'');
}
function kpListHtml(list){
 if(!list.length)return '<div class="card"><p class="muted">Tidak ada siswa untuk filter ini.</p></div>';
 return list.map(function(s){
  return '<article class="card" style="gap:6px"><div class="row sb"><b>'+esc(s.nama)+'</b><span class="pill '+kpCls(s.status)+'">'+kpLabel(s.status)+'</span></div>'+
  '<p class="note">Kelas '+esc(s.kelas||'-')+' · '+(s.n?s.k+' dari '+s.n+' unit kompeten':'belum ada penilaian')+(s.obs.length?' · observasi '+s.obs.length+'× (rata-rata '+s.obsAvg+')':'')+'</p>'+
  '<div class="row"><button type="button" class="btn small" data-act="kp-open" data-v="'+encodeURIComponent(s.key)+'">Detail</button></div></article>';
 }).join('');
}
function viewKompetensi(){
 if(!kpIsStaffNilai())return '<div class="card"><p class="muted">Halaman ini hanya untuk guru dan admin.</p></div>';
 var all=kpBangun();
 if(KP.key){var cur=all.filter(function(s){return s.key===KP.key})[0];if(cur)return kpDetailHtml(cur);KP.key=null}
 var list=kpFiltered(all),nK=list.filter(function(s){return s.status==='kompeten'}).length,nB=list.filter(function(s){return s.status==='belum'}).length;
 var ck=['ALL'].concat(Object.keys(KELAS)).map(function(c){return '<button type="button" data-act="kp-kelas" data-v="'+c+'" aria-pressed="'+(KP.kelas===c)+'">'+(c==='ALL'?'Semua kelas':'Kelas '+c)+'</button>'}).join('');
 var cs=[['ALL','Semua status'],['kompeten','Kompeten'],['belum','Belum kompeten'],['kosong','Belum dinilai']].map(function(c){return '<button type="button" data-act="kp-st" data-v="'+c[0]+'" aria-pressed="'+(KP.st===c[0])+'">'+c[1]+'</button>'}).join('');
 return '<h2>Rekap kompetensi siswa</h2>'+
  '<div class="chips" role="group" aria-label="Filter kelas">'+ck+'</div>'+
  '<div class="chips" role="group" aria-label="Filter status">'+cs+'</div>'+
  '<label class="f">Cari nama siswa<input id="kp-q" type="search" value="'+esc(KP.q)+'" placeholder="Ketik nama" autocomplete="off"></label>'+
  '<div class="stats"><div class="card"><span class="label">Siswa</span><b class="mono" id="kp-n">'+list.length+'</b></div><div class="card"><span class="label">Kompeten</span><b class="mono" id="kp-k">'+nK+'</b></div><div class="card"><span class="label">Belum</span><b class="mono" id="kp-b">'+nB+'</b></div></div>'+
  '<div class="row"><button type="button" class="btn small" data-act="kp-xls">Unduh Excel</button></div>'+
  '<div id="kp-list" class="stack">'+kpListHtml(list)+'</div>'+
  '<p class="note">Status unit memakai nilai terbaru dari uji praktik dan LKPD mode Ujian. Unit Kompeten bila semua sumber yang ada Kompeten (LKPD: nilai akhir, termasuk koreksi guru, minimal KKM '+S.kkm+'). Nilai Latihan tidak dihitung. Observasi praktik hanya menjadi bukti pendukung'+(can('observasi-semua')?'.':' dan hanya memuat observasi yang Anda isi sendiri.')+'</p>';
}
function kpDetailHtml(s){
 var rows=s.ids.map(function(id){var u=s.units[id];
  return '<tr><td data-label="Unit">'+esc(u.judul)+'<small>'+esc(u.id)+'</small></td><td data-label="Praktik">'+kpCell(u.praktik)+'</td><td data-label="LKPD">'+kpCell(u.lkpd)+'</td><td data-label="Status"><span class="pill '+kpCls(u.status)+'">'+kpLabel(u.status)+'</span></td></tr>'}).join('');
 var obs=s.obs.map(function(o){return '<div class="row sb"><span class="note">'+esc(obsTgl(o.tanggal))+' · '+esc(o.mapel||'-')+'</span><span class="pill '+obsKatCls(o.kategori)+'">'+o.skor+' · '+esc(o.kategori)+'</span></div>'}).join('');
 return '<div class="row sb"><button type="button" class="btn small" data-act="kp-back">Kembali</button><button type="button" class="btn small primary" data-act="kp-pdf">Unduh PDF</button></div>'+
  '<section class="card"><div class="row sb"><div><h2>'+esc(s.nama)+'</h2><p class="note">Kelas '+esc(s.kelas||'-')+' · KKM '+S.kkm+'</p></div><span class="pill '+kpCls(s.status)+'">'+kpLabel(s.status)+'</span></div>'+
  '<p class="note">'+(s.n?s.k+' dari '+s.n+' unit kompeten.':'Belum ada unit yang dinilai.')+'</p></section>'+
  '<section class="card"><h3>Status per unit</h3>'+(rows?'<div class="tablewrap"><table><thead><tr><th>Unit</th><th>Praktik</th><th>LKPD</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="note">K = Kompeten, BK = Belum kompeten. Angka adalah nilai terbaru.</p>':'<p class="muted">Belum ada nilai uji praktik atau LKPD Ujian.</p>')+'</section>'+
  '<section class="card"><h3>Observasi praktik</h3>'+(obs?obs+'<p class="note">Rata-rata '+s.obsAvg+' dari '+s.obs.length+' observasi.</p>':'<p class="muted">Belum ada observasi praktik yang terlihat oleh akun ini.</p>')+'</section>';
}
function kpPdf(){
 if(!needP())return;
 var s=kpBangun().filter(function(x){return x.key===KP.key})[0];if(!s)return;
 var doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'});
 kop(doc,'REKAP KOMPETENSI SISWA');
 doc.autoTable({startY:45,theme:'plain',styles:{fontSize:10,cellPadding:1.2},columnStyles:{0:{cellWidth:42,fontStyle:'bold'}},body:[['Nama siswa',s.nama],['Kelas',s.kelas||'-'],['KKM',String(S.kkm)],['Unit kompeten',s.n?s.k+' dari '+s.n:'Belum ada penilaian'],['Status',kpLabel(s.status)]]});
 function c(x){return x?x.score+' ('+(x.kompeten?'Kompeten':'Belum')+')':'-'}
 doc.autoTable({startY:doc.lastAutoTable.finalY+5,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['No','Unit','Praktik','LKPD','Status']],
  body:s.ids.map(function(id,i){var u=s.units[id];return [i+1,u.judul+' ('+u.id+')',c(u.praktik),c(u.lkpd),kpLabel(u.status)]}),columnStyles:{0:{cellWidth:10,halign:'center'}}});
 if(s.obs.length){
  doc.autoTable({startY:doc.lastAutoTable.finalY+6,theme:'grid',styles:{fontSize:9,cellPadding:1.8},headStyles:TH,head:[['Tanggal','Unit/pekerjaan','Nilai','Kategori']],
   body:s.obs.map(function(o){return [obsTgl(o.tanggal),o.mapel||'-',o.skor,o.kategori]}),columnStyles:{2:{cellWidth:16,halign:'center'}}});
 }
 doc.setFontSize(8.5).setTextColor(90).text('Status unit memakai nilai terbaru uji praktik dan LKPD Ujian. Nilai Latihan tidak dihitung.',14,doc.lastAutoTable.finalY+6);
 ttd(doc,doc.lastAutoTable.finalY+12,[['Mengetahui,',''],['Guru/Asesor',S.user.nama]]);
 foot(doc);doc.save('Rekap_Kompetensi_'+slug(s.nama||'siswa')+'.pdf');
}
function kpXls(){
 if(!needX())return;
 var L=kpFiltered(kpBangun());if(!L.length){toast('Tidak ada data untuk diunduh');return}
 var A=[['No','Siswa','Kelas','Unit dinilai','Unit kompeten','Status','Jumlah observasi','Rata-rata observasi']],U=[['Siswa','Kelas','Kode unit','Unit','Praktik: nilai','Praktik: status','LKPD: nilai','LKPD: status','Status unit']],O=[['Siswa','Kelas','Tanggal','Unit/pekerjaan','Nilai','Kategori']];
 L.forEach(function(s,i){
  A.push([i+1,s.nama,s.kelas,s.n,s.k,kpLabel(s.status),s.obs.length,s.obsAvg==null?'':s.obsAvg]);
  s.ids.forEach(function(id){var u=s.units[id];U.push([s.nama,s.kelas,u.id,u.judul,u.praktik?u.praktik.score:'',u.praktik?(u.praktik.kompeten?'Kompeten':'Belum kompeten'):'',u.lkpd?u.lkpd.score:'',u.lkpd?(u.lkpd.kompeten?'Kompeten':'Belum kompeten'):'',kpLabel(u.status)])});
  s.obs.forEach(function(o){O.push([s.nama,s.kelas,o.tanggal,o.mapel||'',o.skor,o.kategori])});
 });
 book([['Ringkasan',A,[5,28,8,12,14,16,16,18]],['Per unit',U,[28,8,10,40,12,16,10,16,16]],['Observasi',O,[28,8,12,30,8,12]]],'Rekap_Kompetensi_Siswa');
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act^="kp-"]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a==='kp-kelas'){KP.kelas=v;render()}
 else if(a==='kp-st'){KP.st=v;render()}
 else if(a==='kp-open'){KP.key=decodeURIComponent(v);render();window.scrollTo(0,0)}
 else if(a==='kp-back'){KP.key=null;render();window.scrollTo(0,0)}
 else if(a==='kp-pdf')kpPdf();
 else if(a==='kp-xls')kpXls();
});
document.addEventListener('input',function(e){
 if(e.target.id!=='kp-q')return;
 KP.q=e.target.value;
 var list=kpFiltered(kpBangun()),el=document.getElementById('kp-list');if(!el)return;
 el.innerHTML=kpListHtml(list);
 var n=document.getElementById('kp-n'),k=document.getElementById('kp-k'),bb=document.getElementById('kp-b');
 if(n)n.textContent=list.length;if(k)k.textContent=list.filter(function(s){return s.status==='kompeten'}).length;if(bb)bb.textContent=list.filter(function(s){return s.status==='belum'}).length;
});
