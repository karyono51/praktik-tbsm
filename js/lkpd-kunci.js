/* Kunci hasil pengisian tiap pertemuan (LKPD v2).
   Pengganti cadangan draf ke berkas: siswa menekan "Kunci Pertemuan N" di akhir tiap pertemuan. Isian yang sudah terisi
   saat itu disimpan sebagai catatan kunci (koleksi lkpd_bukti, label "kunci|N", lkpdId "k|<id LKPD>") dan menjadi tidak
   dapat diubah. Siswa hanya boleh membuat catatan (tidak bisa mengubah atau menghapusnya di server). Guru/admin mengatur
   di Pengaturan LKPD: aktif atau tidak, pertemuan yang dibuka, dan membuka kembali kunci per siswa.
   Isian lama yang belum terkunci tetap bebas diedit. Kunci ini penegak di sisi aplikasi, bukan di server.
   Aturan: siswa boleh mengunci pertemuan mana saja (urutan bebas), kecuali pertemuan awal dan akhir. Kunci Pertemuan N hanya mengunci isian yang
   termasuk pertemuan N (langkah, tabel, pemeriksaan, soal latihan, dan analisis dipetakan lewat data pertemuan); isian lain (gerbang, K3, refleksi) tetap bebas.
   Tiap catatan hanya memuat isian barunya, jadi guru dapat membuka kunci pertemuan mana pun tanpa memengaruhi pertemuan lain. */
var LKK={loaded:{},all:{},busy:false,msg:''};
var LKK_PFX='kunci|';
var LKK_SKIP={student:1,'class':1,date:1,v2:1,detik:1,kunci:1,qsig:1,school:1,vehicle:1,evidence:1,cause:1,conclusion:1};
var LKK_DEFAULT={'Belum diperiksa':1};

function lkkOn(m){return !!m&&typeof lk2Is==='function'&&lk2Is(m)&&m.kunci!==false&&!!(m.v2&&m.v2.pertemuan&&m.v2.pertemuan.length>1)}
function lkkTotal(m){return m.v2.pertemuan.length}
function lkkBuka(m){var n=parseInt(m.pertBuka,10)||0;return n>0?Math.min(n,lkkTotal(m)):lkkTotal(m)}
function lkkRid(m){return 'k|'+m.id}
function lkkIsRec(o){return !!o&&String(o.label||'').indexOf(LKK_PFX)===0}
function lkkN(o){return parseInt(String(o.label).slice(LKK_PFX.length),10)||0}
function lkkParse(o){try{var j=JSON.parse(o.data);return j&&j.f&&typeof j.f==='object'?j:null}catch(e){return null}}
function lkkMirKey(m){return 'tbsm-kunci-'+(S.user?S.user.id:'')+'-'+m.id}
function lkkRecs(m,sid){return (S.lkpdBukti||[]).filter(function(x){return x.moduleId===m.id&&x.sid===sid&&lkkIsRec(x)})}
function lkkMirror(m){try{return JSON.parse(localStorage.getItem(lkkMirKey(m))||'[]')}catch(e){return []}}
function lkkSaveMirror(m){try{localStorage.setItem(lkkMirKey(m),JSON.stringify(lkkRecs(m,S.user.id)))}catch(e){}}

/* Kunci milik siswa yang sedang masuk: {n:{ts,f,id}}. Catatan yang belum dimuat dari server diambil dari salinan di perangkat. */
function lkkLocks(m){
 var out={},list=lkkRecs(m,S.user.id);
 if(!list.length&&!LKK.loaded[m.id])list=lkkMirror(m);
 list.forEach(function(o){var j=lkkParse(o),n=lkkN(o);if(j&&n>0)out[n]={ts:o.ts,f:j.f,id:o.id}});
 return out}
function lkkNums(L){return Object.keys(L).map(Number).sort(function(a,b){return a-b})}
function lkkMerged(m){var L=lkkLocks(m),f={};lkkNums(L).forEach(function(n){Object.keys(L[n].f).forEach(function(k){if(!(k in f))f[k]=L[n].f[k]})});return f}
function lkkIsLockable(m,n){return n>1&&n<lkkTotal(m)}
function lkkLockable(m){var a=[];for(var n=2;n<lkkTotal(m);n++)a.push(n);return a}
/* Peta isian -> nomor pertemuan, dari data pertemuan modul (kegiatan, latihan, judul analisis). Isian tanpa pertemuan tidak dikunci siswa. */
function lkkKeyMap(m){
 var V=m.v2,P=V.pertemuan,mp={};
 function pK(k){for(var i=0;i<P.length;i++)if((P[i].kegiatan||[]).indexOf(k)>=0)return P[i].n;return 0}
 function pQ(id){for(var i=0;i<P.length;i++)if((P[i].latihan||[]).indexOf(id)>=0)return P[i].n;return 0}
 (V.langkah||[]).forEach(function(l){var n=pK(l.k);if(n)mp['step'+l.i]=n});
 (V.tabel||[]).forEach(function(t){var n=pK(t.k);if(!n)return;t.baris.forEach(function(b,r){t.kol.forEach(function(c){mp[lk2K(t.id,r,c.k)]=n})})});
 (V.cekK||[]).forEach(function(k,i){var n=pK(k);if(n)['actual','standard','status','note'].forEach(function(f){mp[f+i]=n})});
 (m.quiz||[]).forEach(function(q,i){var n=pQ(q.id);if(n)mp['q'+i]=n});
 var an=P.filter(function(p){return /analisis/i.test(p.judul)})[0];
 if(an)(V.analisis||[]).forEach(function(x,i){mp['ana'+i]=an.n});
 P.forEach(function(p){mp['mt'+p.n]=p.n});
 return mp}
function lkkSig(m){return lkkNums(lkkLocks(m)).join(',')}

/* Draf dan hasil baca: nilai yang terkunci selalu menang atas isi kolom. */
function lkkActive(){
 if(typeof lk2Cur!=='function'||!S.user)return null;
 if(typeof isStaff==='function'&&isStaff())return null;
 if(LK.preview)return null;
 var m=lk2Cur();return lkkOn(m)?m:null}
var _lkDraftK=lkDraft;
lkDraft=function(){
 var d=_lkDraftK(),m=lkkActive();
 if(m){var f=lkkMerged(m);Object.keys(f).forEach(function(k){d[k]=f[k]})}
 return d};
var _lkReadK=lkRead;
lkRead=function(){
 var d=_lkReadK(),m=lkkActive();
 if(m){var f=lkkMerged(m),L=lkkLocks(m),t={};Object.keys(f).forEach(function(k){d[k]=f[k]});lkkNums(L).forEach(function(n){t[n]=L[n].ts});if(Object.keys(t).length)d.kunci=t}
 return d};

/* Matikan kolom yang terkunci pada HTML tampilan. */
function lkkDisable(h,f){
 return h.replace(/<(input|select|textarea)\b[^>]*>/g,function(tag){
  var k=null,a=tag.match(/data-lk-(?:field|check|yn)="([^"]+)"/);
  if(a)k=a[1];else{var b=tag.match(/data-lk-answer="([^"]+)"/);if(b)k='q'+b[1]}
  return (k&&Object.prototype.hasOwnProperty.call(f,k)&&tag.indexOf(' disabled')<0)?tag.replace(/^<(\w+)/,'<$1 disabled'):tag})}
var _viewK=viewLKPD;
viewLKPD=function(){
 var h=_viewK(),m=lkkActive();
 if(!m)return h;
 var f=lkkMerged(m),L=lkkLocks(m),ns=lkkNums(L);
 if(Cloud.on)setTimeout(function(){lkkLoad(m)},0);
 if(ns.length){
  h=lkkDisable(h,f);
  h=h.replace('· v2</span>','· v2</span><span class="pill plain" title="Hasil pertemuan ini dikunci">Terkunci: P'+ns.join(', P')+'</span>')}
 return h};

/* Blok di bilah bawah siswa (menggantikan cadangan berkas bila kunci aktif). */
function lkkBlock(m){
 var L=lkkLocks(m),ns=lkkNums(L),tot=lkkTotal(m),buka=lkkBuka(m),opts=lkkLockable(m),sisa=opts.filter(function(n){return !L[n]}),st;
 if(!opts.length)st='<p class="note">Tidak ada pertemuan yang bisa dikunci siswa pada LKPD ini.</p>';
 else if(!sisa.length)st='<p class="note">Semua pertemuan yang bisa dikunci (Pertemuan 2 sampai '+(tot-1)+') sudah terkunci. Kirim LKPD bila sudah selesai.</p>';
 else st='<div class="row" style="gap:6px;flex-wrap:wrap">'+sisa.map(function(n){return n<=buka?'<button type="button" class="btn small primary" data-act="lkk-lock" data-n="'+n+'">Kunci Pertemuan '+n+'</button>':'<button type="button" class="btn small" disabled title="Belum dibuka guru">Kunci Pertemuan '+n+'</button>'}).join('')+'</div>'+(sisa.some(function(n){return n>buka})?'<p class="note">Pertemuan yang belum dibuka guru belum bisa dikunci.</p>':'');
 return '<div class="lk2-kb"><b>Kunci hasil pertemuan</b><p class="note">'+(ns.length?'Terkunci: Pertemuan '+ns.join(', ')+'. ':'Belum ada yang dikunci. ')+'Kunci pertemuan mana saja yang sudah selesai, kecuali Pertemuan 1 (awal) dan Pertemuan '+tot+' (akhir). Isian pertemuan itu tersimpan di server dan tidak bisa diubah lagi kecuali guru membuka kunci.</p>'+st+'</div>'}

function lkkFlush(){setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},300)}

function lkkLock(n){
 var m=lkkActive();if(!m)return;
 n=parseInt(n,10)||0;
 if(!lkkIsLockable(m,n)){toast('Pertemuan awal dan akhir tidak dikunci oleh siswa');return}
 if(lkkLocks(m)[n]){toast('Pertemuan '+n+' sudah dikunci');return}
 if(n>lkkBuka(m)){toast('Guru belum membuka Pertemuan '+n+' untuk dikunci');return}
 var d=lkRead(),have=lkkMerged(m),mp=lkkKeyMap(m),f={},add=0;
 Object.keys(d).forEach(function(k){
  if(LKK_SKIP[k]||/^row\d/.test(k)||mp[k]!==n||Object.prototype.hasOwnProperty.call(have,k))return;
  var v=d[k];if(v===''||v===false||v==null||typeof v==='object'||LKK_DEFAULT[v])return;
  f[k]=v;add++});
 if(!add){toast('Belum ada isian Pertemuan '+n+' untuk dikunci');return}
 if(!uiOk('lkkunci','Kunci hasil Pertemuan '+n+'?\n'+add+' isian akan dikunci dan tidak bisa diubah, kecuali guru membuka kunci.',function(){lkkLock(n)},{ok:'Kunci'}))return;
 var rec={id:uid(),lkpdId:lkkRid(m),sid:S.user.id,moduleId:m.id,ts:Date.now(),label:LKK_PFX+n,data:JSON.stringify({n:n,f:f})};
 if(rec.data.length>280000){toast('Isian terlalu besar untuk dikunci');return}
 S.lkpdBukti=S.lkpdBukti||[];S.lkpdBukti.push(rec);
 if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti',JSON.stringify(S.lkpdBukti))}catch(e){toast('Penyimpanan perangkat penuh, kunci tidak tersimpan');S.lkpdBukti.pop();return}}
 lkkSaveMirror(m);
 try{localStorage.setItem(lkKey(),JSON.stringify(lkRead()))}catch(e){}
 persist();render();
 toast('Pertemuan '+n+' terkunci'+(Cloud.on?(navigator.onLine===false?'. Terkirim ke server saat online':''):''));
 lkkFlush()}

/* Muat catatan kunci siswa dari server (sekali tiap 5 menit per LKPD). */
async function lkkLoad(m,force){
 if(!Cloud.on||!m||!S.user)return;
 var t=LKK.loaded[m.id];if(!force&&t&&Date.now()-t<300000)return;
 LKK.loaded[m.id]=Date.now();
 try{
  var before=lkkSig(m),docs=await Cloud.list('lkpd_bukti',[Appwrite.Query.equal('lkpdId',[lkkRid(m)])]),mine=docs.map(fromDoc).filter(function(x){return x.sid===S.user.id&&lkkIsRec(x)}),ids={};
  mine.forEach(function(x){ids[x.id]=1});
  S.lkpdBukti=(S.lkpdBukti||[]).filter(function(x){return !(x.moduleId===m.id&&x.sid===S.user.id&&lkkIsRec(x)&&(x.r||ids[x.id]))}).concat(mine);
  lkkSaveMirror(m);
  if(lkkSig(m)!==before&&LK.open&&LK.module===m.id&&!(typeof isStaff==='function'&&isStaff()))render();
 }catch(e){LKK.loaded[m.id]=0}}

/* ---------- Pengaturan guru/admin (Kelola LKPD > Pengaturan) ---------- */
function lkkAllRecs(m){return Cloud.on?(LKK.all[m.id]||[]):(S.lkpdBukti||[]).filter(function(x){return x.moduleId===m.id&&lkkIsRec(x)})}
function lkkNama(sid){var u=(S.users||[]).find(function(x){return x.id===sid});return u?u.nama:'Siswa'}
function lkkStatus(m){
 var by={};lkkAllRecs(m).forEach(function(o){(by[o.sid]=by[o.sid]||[]).push(o)});
 var ids=Object.keys(by).sort(function(a,b){return lkkNama(a).localeCompare(lkkNama(b))});
 var rows=ids.map(function(sid){
  var L=by[sid].slice().sort(function(a,b){return lkkN(a)-lkkN(b)});
  return '<div class="lk2-krow"><div><b>'+lkEsc(lkkNama(sid))+'</b><small>Terkunci: P'+L.map(lkkN).join(', P')+'</small></div><div class="row" style="gap:4px;flex-wrap:wrap">'+L.map(function(o){return '<button type="button" class="btn small" data-act="lkk-unlock" data-v="'+lkEsc(o.id)+'">Buka kunci P'+lkkN(o)+'</button>'}).join('')+'</div></div>'}).join('');
 return '<div class="lk2-kstat"><div class="row" style="gap:6px;flex-wrap:wrap;align-items:center"><span class="label grow">Status kunci siswa</span>'+(Cloud.on?'<button type="button" class="btn small" data-act="lkk-load">'+(LKK.busy?'Memuat...':'Muat status')+'</button>':'')+'</div>'+
  (rows||'<p class="note">'+(Cloud.on&&LKK.all[m.id]===undefined?'Ketuk "Muat status" untuk melihat siswa yang sudah mengunci.':'Belum ada siswa yang mengunci pertemuan.')+'</p>')+(LKK.msg?'<p class="note">'+lkEsc(LKK.msg)+'</p>':'')+'</div>'}
function lkkPanel(m,d){
 if(typeof lk2Is!=='function'||!lk2Is(m)||!(m.v2.pertemuan&&m.v2.pertemuan.length>1))return '';
 var tot=m.v2.pertemuan.length,sel=parseInt(d.pertBuka,10)||0,opt='<option value="0"'+(sel===0?' selected':'')+'>Semua pertemuan</option>';
 for(var i=1;i<=tot;i++)opt+='<option value="'+i+'"'+(sel===i?' selected':'')+'>Sampai Pertemuan '+i+'</option>';
 return '<div><span class="label">Kunci hasil per pertemuan</span>'+
  '<label class="lk-check"><input type="checkbox" data-lkm="kunci"'+(d.kunci?' checked':'')+'><span><b>Aktifkan kunci per pertemuan</b><small>Siswa mengunci pertemuan mana saja yang sudah selesai (urutan bebas), kecuali pertemuan awal dan akhir. Hasil tersimpan di server dan tidak bisa diubah siswa, jadi tidak perlu cadangan berkas.</small></span></label>'+
  '<label class="f">Pertemuan yang dibuka untuk dikunci<select data-lkm="pertBuka">'+opt+'</select></label>'+
  '<p class="note">"Semua pertemuan" = siswa bebas mengunci Pertemuan 2 sampai sebelum terakhir. Batasi dengan "Sampai Pertemuan N" bila perlu, lalu naikkan tiap pertemuan selesai. Simpan pengaturan agar berlaku.</p>'+lkkStatus(m)+'</div>'}

async function lkkLoadAll(m){
 if(!Cloud.on||LKK.busy)return;
 LKK.busy=true;LKK.msg='';render();
 try{var docs=await Cloud.list('lkpd_bukti',[Appwrite.Query.equal('lkpdId',[lkkRid(m)])]);LKK.all[m.id]=docs.map(fromDoc).filter(lkkIsRec)}
 catch(e){LKK.msg='Gagal memuat status kunci: '+((e&&e.message)||e)}
 LKK.busy=false;render()}
async function lkkUnlock(id){
 var m=LKPD_MODULES.find(function(x){return x.id===LKM.edit});if(!m)return;
 var o=lkkAllRecs(m).find(function(x){return x.id===id});if(!o)return;
 if(!(await uiConfirm('Buka kunci Pertemuan '+lkkN(o)+' milik '+lkkNama(o.sid)+'?\nIsiannya bisa diubah lagi dan perlu dikunci ulang.',{ok:'Buka kunci'})))return;
 if(Cloud.on){
  if(navigator.onLine===false){toast('Buka kunci hanya bisa saat online');return}
  try{await Cloud.db.deleteDocument(CFG.DB,'lkpd_bukti',id)}
  catch(e){if(!/not be found|not found|404/i.test(String((e&&e.message)||e))){toast('Gagal membuka kunci: '+((e&&e.message)||e));return}}
  LKK.all[m.id]=(LKK.all[m.id]||[]).filter(function(x){return x.id!==id})}
 S.lkpdBukti=(S.lkpdBukti||[]).filter(function(x){return x.id!==id});
 if(!Cloud.on){try{localStorage.setItem('tbsm-lkpd-bukti',JSON.stringify(S.lkpdBukti))}catch(e){}}
 render();toast('Kunci dibuka. Siswa melihat perubahan saat membuka ulang LKPD')}

document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act^="lkk-"]');if(!b)return;
 var a=b.dataset.act;
 if(a==='lkk-lock')lkkLock(b.dataset.n);
 else if(a==='lkk-load'){var m=LKPD_MODULES.find(function(x){return x.id===LKM.edit});if(m)lkkLoadAll(m)}
 else if(a==='lkk-unlock')lkkUnlock(b.dataset.v)});
