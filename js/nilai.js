/* nilai.js: impor nilai dari Excel (xlsx/xls/csv), template nilai */
var HN={};
(function(){var H={tanggal:['tanggal','date','waktu'],kelas:['kelas','class'],siswa:['siswa','namasiswa','nama'],unit:['kodeunit','kode','unit','unitpraktik','judul'],skor:['skor','nilai','score'],status:['status','kompetensi'],tipe:['jenis','tipe'],penilai:['penilai'],catatan:['catatan']};Object.keys(H).forEach(function(c){H[c].forEach(function(a){HN[a]=c})})})();
function parseTgl(v){
 v=String(v==null?'':v).trim();if(!v)return Date.now();
 var m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3],12).getTime();
 m=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
 if(m){var y=+m[3];if(y<100)y+=2000;return new Date(y,+m[2]-1,+m[1],12).getTime()}
 return NaN}
function findJob(v){
 var k=String(v||'').trim().toLowerCase();if(!k)return null;
 return JOBS.filter(function(j){return j.id.toLowerCase()===k})[0]||JOBS.filter(function(j){return j.judul.toLowerCase()===k})[0]||null}
function dupKey(r){return [r.jobId,String(r.siswa||'').toLowerCase(),r.kelas,new Date(r.ts).toISOString().slice(0,10),r.score].join('|')}
async function parseNilai(f){
 if(!needX())throw new Error('Pustaka Excel belum termuat.');
 var wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
 var raw=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:'',raw:false});
 if(!raw.length)throw new Error('File kosong atau header tidak terbaca.');
 if(raw.length>1000)throw new Error('Maksimal 1000 baris per impor.');
 var have={};S.results.forEach(function(r){have[dupKey(r)]=1});
 var ok=[],err=[],dup=0,noacc=0,seen={};
 raw.forEach(function(r0,i){
  var line=i+2,r={},any=false;
  Object.keys(r0).forEach(function(k){var c=HN[String(k).toLowerCase().replace(/[^a-z0-9]/g,'')],v=String(r0[k]).trim();if(v)any=true;if(c&&!(c in r&&!v))r[c]=v});
  if(!any)return;
  function bad(m){err.push({line:line,msg:m})}
  var siswa=(r.siswa||'').trim();if(!siswa)return bad('Nama siswa kosong');
  var j=findJob(r.unit);if(!j)return bad('Unit tidak dikenal: '+(r.unit||'kosong')+'. Pakai kode dari sheet Daftar unit');
  var kelas=r.kelas?normKelas(r.kelas):j.kelas;
  if(!kelas||kelas!==j.kelas)return bad('Kelas tidak sesuai unit '+j.id+' (kelas '+j.kelas+')');
  var sk=String(r.skor||'').replace(',','.'),score=Math.round(parseFloat(sk));
  if(!sk||isNaN(score)||score<0||score>100)return bad('Skor harus angka 0 sampai 100');
  var ts=parseTgl(r.tanggal);if(isNaN(ts))return bad('Tanggal tidak terbaca: '+r.tanggal+' (pakai YYYY-MM-DD)');
  var st=String(r.status||'').toLowerCase().replace(/\s+/g,' ').trim(),kom;
  if(!st)kom=score>=S.kkm;else if(/^(belum|tidak|bk|no|n|0|false)/.test(st))kom=false;else if(/^(kompeten|k|ya|yes|y|1|true)/.test(st))kom=true;else return bad('Status harus Kompeten atau Belum kompeten');
  var tipe=/latihan/i.test(r.tipe||'')?'Latihan':'Penilaian';
  var row={id:uid(),ts:ts,jobId:j.id,kelas:kelas,siswa:siswa,tipe:tipe,score:score,kompeten:kom,catatan:(r.catatan||'').slice(0,1000),oleh:S.user.username,penilai:(r.penilai||S.user.nama).slice(0,128)};
  var ac=S.users.find(function(u){return hasRole(u,'siswa')&&u.nama.toLowerCase()===siswa.toLowerCase()&&(!u.kelas||u.kelas===kelas)});
  row.sid=ac?ac.id:'';
  var key=dupKey(row);
  if(have[key]||seen[key]){dup++;return}
  seen[key]=1;if(!ac)noacc++;ok.push(row)});
 if(!ok.length&&!err.length&&!dup)throw new Error('Tidak ada baris data. Pakai template dari tombol Template nilai.');
 return {ok:ok,err:err,dup:dup,noacc:noacc}}
function applyNilai(){
 var n=A.impn.ok.length;
 A.impn.ok.forEach(function(r){S.results.push(r)});
 A.impn=null;persist();toast(n+' nilai diimpor');}
function tplNilai(){
 if(!needX())return;
 var j1=JOBS[0],today=new Date().toISOString().slice(0,10);
 book([['Nilai',[['Tanggal','Kelas','Siswa','Kode unit','Skor','Status','Jenis','Penilai','Catatan'],[today,j1.kelas,'Contoh Siswa',j1.id,85,'Kompeten','Penilaian','',''],[today,j1.kelas,'Contoh Siswa Dua',j1.id,60,'Belum kompeten','Penilaian','','Perlu mengulang']],[12,8,26,11,7,16,11,20,36]],
  ['Daftar unit',[['Kode unit','Kelas','Unit praktik']].concat(JOBS.map(function(j){return [j.id,j.kelas,j.judul]})),[11,8,60]],
  ['Petunjuk',[['Kolom','Aturan'],['Tanggal','YYYY-MM-DD atau dd/mm/yyyy. Kosong = hari ini.'],['Kelas','X, XI, atau XII. Kosong = ikut unit.'],['Siswa','Wajib. Jika sama persis dengan nama akun siswa, nilai tampil di akun siswa itu.'],['Kode unit','Wajib. Lihat sheet Daftar unit. Judul unit juga diterima.'],['Skor','Angka 0 sampai 100.'],['Status','Kompeten atau Belum kompeten. Kosong = dihitung dari KKM.'],['Jenis','Penilaian atau Latihan. Kosong = Penilaian.'],['Catatan','Nilai yang sama (siswa, unit, tanggal, skor) dilewati, tidak digandakan. Hapus dua baris contoh sebelum impor. File Ekspor Excel Rekap juga bisa diimpor.']],[12,100]]],'Template_Impor_Nilai');
}
function imporNilaiHtml(){
 if(!can('nilai'))return '';
 var h='<div class="row"><label class="btn small filebtn">Impor nilai<input id="impnilai" type="file" accept=".xlsx,.xls,.csv" hidden></label><button type="button" class="btn small" data-act="tplnilai">Template nilai</button></div>';
 if(A.impn){var m=A.impn;
  h+='<div class="card"><h3>Pratinjau impor nilai</h3><div class="row"><span class="pill ok">'+m.ok.length+' baru</span><span class="pill">'+m.dup+' dilewati (sudah ada)</span><span class="pill '+(m.err.length?'bad':'plain')+'">'+m.err.length+' ditolak</span></div>'+
  (m.noacc?'<p class="note">'+m.noacc+' nilai atas nama tanpa akun siswa yang cocok. Nilai tetap masuk rekap, tapi tidak tampil di akun siswa.</p>':'')+
  (m.err.length?'<ul class="plain note">'+m.err.slice(0,8).map(function(x){return '<li>Baris '+x.line+': '+esc(x.msg)+'</li>'}).join('')+(m.err.length>8?'<li>dan '+(m.err.length-8)+' lainnya</li>':'')+'</ul>':'')+
  '<div class="row"><button type="button" class="btn" data-act="impncancel">Batal</button><button type="button" class="btn primary grow" data-act="impnapply"'+(m.ok.length?'':' disabled')+'>Terapkan '+m.ok.length+' nilai</button></div></div>'}
 return h}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act;
 if(a==='tplnilai')tplNilai();
 else if(a==='impnapply'&&A.impn&&can('nilai')){applyNilai();render()}
 else if(a==='impncancel'){A.impn=null;render()}
});
document.addEventListener('change',async function(e){
 if(e.target.id!=='impnilai')return;
 var f=e.target.files[0];if(!f)return;
 try{A.impn=await parseNilai(f)}catch(err){A.impn=null;toast(err.message||'Gagal membaca file')}
 render();
});
