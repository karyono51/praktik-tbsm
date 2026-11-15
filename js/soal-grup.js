/* soal-grup.js: soal grup, yaitu satu stimulus (teks bacaan, data, atau gambar) yang dipakai beberapa soal berurutan.
   Berlaku untuk Bank soal dan kuis Editor LKPD. Tiga kolom opsional pada soal (soal lama tetap terbaca):
     gs  penanda grup (teks bebas, sama untuk semua anggota grup)
     st  teks stimulus (maksimal SGR.MAXT karakter)
     si  gambar stimulus: '' atau 'drive:<fileId>' (sebelum terunggah: 'tmp:<id>'), diolah mesin gambar soal-gambar.js
   Stimulus disimpan di tiap anggota grup (salinan sama). Mengubah stimulus di satu soal otomatis menyamakan anggota lain:
     Bank soal: saat Simpan soal. Editor LKPD: langsung saat mengetik.
   Tampilan: stimulus tampil sekali di atas deretan soal anggota grup (kuis LKPD, cetak) atau di atas tiap soal bila soal
   dikerjakan satu per satu (ujian Bank soal), dengan keterangan "Untuk soal no. a-b".
   Ujian: anggota grup selalu berdampingan dan berurutan menurut gn. Pengacakan memindahkan grup sebagai satu blok; bila
   jumlah soal membatasi pilihan, grup diambil utuh selama masih muat.
   Bergantung pada: soal-gambar.js (sg*), banksoal.js (bs*), lkpd-editor.js (lke*), lkpd-gambar.js (lkg*). Dimuat setelah lkpd-gambar.js. */
var SGR={MAXT:3000,upl:{}};

/* ---------- Pembantu umum ---------- */
function sgrTxt(s){return esc(String(s||'').replace(/\r\n?/g,'\n')).replace(/\n/g,'<br>')}
function sgrAda(q){return !!(q&&q.gs&&(q.st||q.si))}
/* [awal, akhir] deretan berurutan dengan penanda grup sama di sekitar posisi i (posisi mulai 0) */
function sgrSpan(list,i){
 var g=list[i]&&list[i].gs;if(!g)return [i,i];
 var a=i,b=i;
 while(a>0&&list[a-1]&&list[a-1].gs===g)a--;
 while(b+1<list.length&&list[b+1]&&list[b+1].gs===g)b++;
 return [a,b];
}
function sgrAwal(list,i){return sgrAda(list[i])&&sgrSpan(list,i)[0]===i}
function sgrLabel(list,i){var s=sgrSpan(list,i);return s[1]>s[0]?'untuk soal no. '+(s[0]+1)+'-'+(s[1]+1):'untuk soal no. '+(s[0]+1)}
/* kotak stimulus (siswa dan cetak layar). label boleh kosong. */
function sgrBox(q,label){
 if(!sgrAda(q))return '';
 return '<div class="sgr-box"><span class="sgr-lab">Stimulus'+(label?' · '+esc(label):'')+'</span>'+
  (q.st?'<div class="sgr-t">'+sgrTxt(q.st)+'</div>':'')+
  (q.si&&typeof sgImg==='function'?'<div class="sg-qwrap">'+sgImg(q.si,'sg-q ld-zoom','Gambar stimulus')+'</div>':'')+'</div>';
}
/* Anggota grup yang sama berdampingan (di posisi anggota pertama) dan urut menurut gn. get(item) memberi objek soal. */
function sgrAturList(list,get){
 get=get||function(x){return x};
 var grp={},out=[],done={};
 list.forEach(function(it){var q=get(it);if(q&&q.gs)(grp[q.gs]=grp[q.gs]||[]).push(it)});
 list.forEach(function(it){
  var q=get(it);
  if(!q||!q.gs){out.push(it);return}
  if(done[q.gs])return;done[q.gs]=1;
  grp[q.gs].map(function(x,k){return [x,k]}).sort(function(a,b){return ((get(a[0]).gn||0)-(get(b[0]).gn||0))||a[1]-b[1]}).forEach(function(x){out.push(x[0])});
 });
 return out;
}
/* Ambil paling banyak n soal dari pool (sudah diacak bila perlu); grup diambil utuh selama masih muat. */
function sgrPilih(pool,n){
 n=n>0?Math.min(n,pool.length):pool.length;
 var units=[],idx={};
 pool.forEach(function(q){if(q.gs){if(idx[q.gs]===undefined){idx[q.gs]=units.length;units.push([])}units[idx[q.gs]].push(q)}else units.push([q])});
 var out=[],rest=[];
 units.forEach(function(u){if(out.length+u.length<=n)out=out.concat(u);else rest.push(u)});
 rest.forEach(function(u){u.forEach(function(q){if(out.length<n)out.push(q)})});
 return out;
}

/* ---------- Gambar stimulus: ikut mesin gambar soal ---------- */
if(typeof sgRefs==='function'){
 var _sgrRefs=sgRefs;
 sgRefs=function(q){var a=_sgrRefs.apply(this,arguments);if(q&&q.si)a.push(q.si);return a};
}
/* unggahan yang sama (grup berisi beberapa soal) hanya dikirim sekali per penanda tmp: */
if(typeof sgUploadRef==='function'){
 var _sgrUp=sgUploadRef;
 sgUploadRef=function(ref,nama){
  if(!ref||ref.indexOf('drive:')===0||sgIsData(ref))return _sgrUp.apply(this,arguments);
  if(!SGR.upl[ref])SGR.upl[ref]=_sgrUp.apply(this,arguments).catch(function(e){delete SGR.upl[ref];throw e});
  return SGR.upl[ref];
 };
}
if(typeof sgUploadAll==='function'){
 var _sgrUa=sgUploadAll;
 sgUploadAll=async function(o){
  var ubah=await _sgrUa.apply(this,arguments);
  if(o.si&&o.si.indexOf('drive:')!==0){o.si=await sgUploadRef(o.si,'Soal_'+sgSlug(o.mapel,20)+'_'+sgSlug(String(o.id).slice(-6),6)+'_stimulus');ubah=true}
  return ubah;
 };
}
if(typeof sgStash==='function'){
 var _sgrSt=sgStash;
 sgStash=async function(o){
  await _sgrSt.apply(this,arguments);
  if(o.si&&sgIsData(o.si)){var id='tmp:'+uid();if(await sgPut(id,o.si))o.si=id}
  return o;
 };
}
if(typeof lkgUploadModul==='function'){
 var _sgrLu=lkgUploadModul;
 lkgUploadModul=async function(m){
  var ubah=await _sgrLu.apply(this,arguments);
  if(m&&Array.isArray(m.quiz)){
   var base='LKPD_'+sgSlug(m.id,24);
   for(var i=0;i<m.quiz.length;i++){
    var q=m.quiz[i];
    if(q.si&&q.si.indexOf('drive:')!==0){q.si=await sgUploadRef(q.si,base+'_s'+(i+1)+'_stimulus');ubah=true}
   }
  }
  return ubah;
 };
}

/* ---------- Bank soal: penyimpanan ---------- */
if(typeof bsPack==='function'){
 var _sgrPack=bsPack;
 bsPack=function(k,o){
  _sgrPack.apply(this,arguments);
  if(k==='soal'&&o&&o.gs&&!(typeof BS_IDX!=='undefined'&&BS_IDX[o.id])){
   try{var p=JSON.parse(o.payload);p.gs=o.gs;p.gn=o.gn||0;if(o.st)p.st=o.st;if(o.si)p.si=o.si;o.payload=JSON.stringify(p)}catch(e){}
  }
 };
}
/* Samakan stimulus anggota grup lain di Bank soal dengan soal o yang baru disimpan. */
function sgrSebar(o){
 if(!o||!o.gs||typeof BS==='undefined')return;
 BS.D.soal.slice().forEach(function(x){
  if(x.id===o.id||x.gs!==o.gs||BS_IDX[x.id])return;
  if((x.st||'')===(o.st||'')&&(x.si||'')===(o.si||''))return;
  if(o.st)x.st=o.st;else delete x.st;
  if(o.si)x.si=o.si;else delete x.si;
  bsPut('soal',x);
 });
 BS.all=null;
}
/* daftar grup stimulus di Bank soal (soal sendiri), untuk mapel tertentu bila diisi */
function sgrBankGroups(mapel){
 var g={},out=[];
 BS.D.soal.forEach(function(s){
  if(!s.gs||BS_IDX[s.id]||(mapel&&s.mapel!==mapel))return;
  if(!g[s.gs]){g[s.gs]={gs:s.gs,st:s.st||'',si:s.si||'',n:0,gn:0};out.push(g[s.gs])}
  g[s.gs].n++;g[s.gs].gn=Math.max(g[s.gs].gn,s.gn||0);
 });
 return out;
}
function sgrGnBaru(gs,selfId){
 var m=0,n=0;
 BS.D.soal.forEach(function(s){if(s.gs===gs&&s.id!==selfId){n++;m=Math.max(m,s.gn||0)}});
 return Math.max(m,n)+1;
}
function sgrLabelGrup(st,si){var t=String(st||'').replace(/\s+/g,' ').trim();return t?t.slice(0,48)+(t.length>48?'…':''):(si?'(stimulus gambar)':'(kosong)')}

/* Bagian form Bank soal: pilih stimulus bersama, isi teks dan gambar. */
function sgrFormHtml(f){
 var gl=sgrBankGroups(f.mapel),cur=gl.filter(function(x){return x.gs===f.gs})[0];
 var h='<div class="sgr-form"><label class="f">Stimulus bersama (opsional)<select id="bf-gs" data-sgr="bgrup"><option value="">Tanpa stimulus</option><option value="__new">Buat stimulus baru</option>';
 if(f.gs&&!cur)h+='<option value="'+esc(f.gs)+'" selected>Stimulus ini (belum disimpan)</option>';
 h+=gl.map(function(x){return '<option value="'+esc(x.gs)+'"'+(f.gs===x.gs?' selected':'')+'>'+esc(sgrLabelGrup(x.st,x.si))+' · '+x.n+' soal</option>'}).join('')+'</select></label>';
 if(f.gs){
  var lain=cur?cur.n-(f.id&&BS.D.soal.some(function(s){return s.id===f.id&&s.gs===f.gs})?1:0):0;
  h+='<label class="f">Teks stimulus<textarea id="bf-st" rows="5" maxlength="'+SGR.MAXT+'" placeholder="Teks bacaan, data, atau keterangan yang dipakai beberapa soal">'+esc(f.st||'')+'</textarea></label>';
  h+='<div class="sg-box">'+(f.si&&typeof sgImg==='function'?sgImg(f.si,'sg-th ld-zoom','Pratinjau gambar stimulus'):'')+
   '<button type="button" class="btn small" data-sgr="bpilih">'+(f.si?'Ganti':'Tambah')+' gambar stimulus</button>'+(f.si?'<button type="button" class="btn small danger" data-sgr="bhapus">Hapus</button>':'')+'</div>';
  h+='<p class="note">'+(lain>0?'Stimulus ini juga dipakai '+lain+' soal lain. Perubahan teks atau gambar stimulus berlaku untuk semuanya saat Simpan soal.':'Soal lain bisa memakai stimulus ini: pilih stimulus yang sama di form soal berikutnya.')+'</p>';
 }
 return h+'</div>';
}
document.addEventListener('change',function(e){
 var t=e.target;
 if(!t||!t.matches||!t.matches('[data-sgr="bgrup"]')||!BS.form)return;
 bsFormRead();
 var f=BS.form,v=t.value;
 if(!v){f.gs='';f.st='';f.si='';f.gn=0}
 else if(v==='__new'){f.gs='g'+uid();f.st='';f.si='';f.gn=1}
 else{
  var g=sgrBankGroups('').filter(function(x){return x.gs===v})[0];
  if(v!==f.gs){f.gs=v;f.st=g?g.st:'';f.si=g?g.si:'';f.gn=sgrGnBaru(v,f.id)}
 }
 render();
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-sgr="bpilih"],[data-sgr="bhapus"]');
 if(!b||!BS.form)return;
 e.stopPropagation();
 bsFormRead();
 var f=BS.form;
 if(b.dataset.sgr==='bhapus'){f.si='';render();return}
 sgPilih(function(d){if(BS.form!==f)return;bsFormRead();f.si=d;render()});
},true);

/* Excel tidak membawa stimulus: beri tahu */
if(typeof bsioExport==='function'){
 var _sgrBe=bsioExport;
 bsioExport=function(){
  var n=0;try{n=bsFiltered().filter(function(q){return q.gs}).length}catch(e){}
  var r=_sgrBe.apply(this,arguments);
  if(n)setTimeout(function(){toast(n+' soal memakai stimulus bersama. Stimulus tidak ikut diekspor ke Excel.')},3400);
  return r;
 };
}

/* ---------- Editor LKPD ---------- */
/* penyama: salin stimulus soal i ke semua soal lain dengan penanda grup sama */
function sgrLkeSebar(s,i){
 var q=s.quiz[i];if(!q||!q.gs)return;
 s.quiz.forEach(function(x,k){if(k!==i&&x.gs===q.gs){x.st=q.st||'';x.si=q.si||''}});
}
function sgrLkeGroups(s){
 var g={},out=[];
 s.quiz.forEach(function(q,i){
  if(!q.gs)return;
  if(!g[q.gs]){g[q.gs]={gs:q.gs,a:i,b:i,st:q.st||'',si:q.si||''};out.push(g[q.gs])}else g[q.gs].b=i;
 });
 return out;
}
function sgrLkeHtml(d,q,i){
 var s=d.S,gl=sgrLkeGroups(s),h='<div class="sgr-form"><label class="f">Stimulus bersama (opsional)<select data-sgr="lgrup" data-i="'+i+'"><option value="">Tanpa stimulus</option><option value="__new">Buat stimulus baru</option>';
 h+=gl.filter(function(x){return x.gs!==q.gs}).map(function(x){return '<option value="'+esc(x.gs)+'">Pakai stimulus soal no. '+(x.a+1)+': '+esc(sgrLabelGrup(x.st,x.si))+'</option>'}).join('');
 if(q.gs){var me=gl.filter(function(x){return x.gs===q.gs})[0];h+='<option value="'+esc(q.gs)+'" selected>Stimulus ini'+(me&&me.b>me.a?' (soal no. '+(me.a+1)+', dst.)':'')+'</option>'}
 h+='</select></label>';
 if(q.gs){
  var n=s.quiz.filter(function(x){return x.gs===q.gs}).length;
  h+='<label class="f">Teks stimulus<textarea rows="5" maxlength="'+SGR.MAXT+'" data-sgr="lst" data-i="'+i+'" placeholder="Teks bacaan, data, atau keterangan yang dipakai beberapa soal">'+esc(q.st||'')+'</textarea></label>'+
   '<div class="sg-box">'+(q.si&&typeof sgImg==='function'?sgImg(q.si,'sg-th ld-zoom','Pratinjau gambar stimulus'):'')+
   '<button type="button" class="btn small" data-sgr="lpilih" data-i="'+i+'">'+(q.si?'Ganti':'Tambah')+' gambar stimulus</button>'+(q.si?'<button type="button" class="btn small danger" data-sgr="lhapus" data-i="'+i+'">Hapus</button>':'')+'</div>'+
   '<p class="note">'+(n>1?'Dipakai '+n+' soal. Mengubah stimulus di sini mengubahnya di semua soal itu. Letakkan soal-soalnya berurutan.':'Soal berikutnya bisa memakai stimulus ini: buka soal itu lalu pilih "Pakai stimulus soal no. '+(i+1)+'".')+'</p>';
 }
 return h+'</div>';
}
document.addEventListener('change',function(e){
 var t=e.target;
 if(!t||!t.matches||!t.matches('[data-sgr="lgrup"]'))return;
 var d=LK.editor;if(!d||!d.S)return;
 var s=d.S,i=+t.dataset.i,q=s.quiz[i],v=t.value;if(!q)return;
 if(!v){delete q.gs;delete q.st;delete q.si}
 else if(v==='__new'){q.gs='g'+uid();q.st='';q.si=''}
 else if(v!==q.gs){
  var m=s.quiz.filter(function(x,k){return k!==i&&x.gs===v})[0];
  if(m){q.gs=v;q.st=m.st||'';q.si=m.si||''}
 }
 lkeRe();
});
document.addEventListener('input',function(e){
 var t=e.target;
 if(!t||!t.matches||!t.matches('[data-sgr="lst"]'))return;
 var d=LK.editor;if(!d||!d.S)return;
 var i=+t.dataset.i,q=d.S.quiz[i];if(!q)return;
 q.st=t.value;sgrLkeSebar(d.S,i);
 if(typeof lkeLive==='function')lkeLive();
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-sgr="lpilih"],[data-sgr="lhapus"]');
 if(!b)return;
 var d=LK.editor;if(!d||!d.S)return;
 e.stopPropagation();
 var i=+b.dataset.i,q=d.S.quiz[i];if(!q)return;
 if(b.dataset.sgr==='lhapus'){q.si='';sgrLkeSebar(d.S,i);lkeRe();return}
 if(typeof sgPilih!=='function'){toast('Pengolah gambar belum siap. Muat ulang aplikasi.');return}
 sgPilih(function(data){
  var id='tmp:'+uid();
  sgPut(id,data).then(function(ok){
   if(LK.editor!==d)return;
   q.si=ok?id:data;sgrLkeSebar(d.S,i);lkeRe();
  });
 });
},true);
/* Excel kuis LKPD tidak membawa stimulus */
if(typeof lkioExport==='function'){
 var _sgrLe=lkioExport;
 lkioExport=function(scope,id){
  var r=_sgrLe.apply(this,arguments),n=0;
  try{
   var mods=scope==='one'?(LKPD_MODULES||[]).filter(function(x){return x.id===id}):(LKPD_MODULES||[]);
   n=mods.filter(function(m){return (m.quiz||[]).some(function(q){return q.gs})}).length;
  }catch(e){}
  if(n)setTimeout(function(){toast(n+' modul punya stimulus bersama. Stimulus tidak ikut diekspor ke Excel.')},3400);
  return r;
 };
}

/* ---------- Gaya ---------- */
(function(){
 var s=document.createElement('style');
 s.textContent='.sgr-box{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;background:var(--surface);padding:10px 12px;margin:0 0 10px}'+
  '.sgr-lab{display:block;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin-bottom:4px}'+
  '.sgr-t{font-size:14.5px;line-height:1.55;overflow-wrap:anywhere}.sgr-box .sg-qwrap{margin:8px 0 0}'+
  '.sgr-form{display:grid;gap:8px;padding:10px;border:1px dashed var(--line);border-radius:12px}.sgr-form .sg-box{margin:0}'+
  '.bs-stim{margin:0 0 10px}';
 document.head.appendChild(s);
})();
