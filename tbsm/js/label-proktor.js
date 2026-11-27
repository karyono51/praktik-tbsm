/* label-proktor.js: samakan label login Appwrite (admin, guru, proktor) dengan kolom peran di daftar akun.
   - Otomatis setelah admin menyimpan akun (hanya mode awan, akun beremail).
   - Tombol "Sinkron label" di menu Akun untuk menyamakan semua akun sekaligus (mis. setelah impor Excel).
   Server: fungsi akun-admin aksi setlabel (admin saja). Tanpa fungsi yang diperbarui, aplikasi memberi tahu dan data akun tetap tersimpan. */
(function(){
 var KELOLA=['admin','guru','proktor'];
 function peranKelola(p){var r=(Array.isArray(p)?p:String(p||'').split(/[,\s]+/));return KELOLA.filter(function(x){return r.indexOf(x)>-1})}
 function fnClient(){return (Cloud.acc&&Cloud.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT)}
 async function panggil(items){
  var ex;
  try{ex=await new Appwrite.Functions(fnClient()).createExecution(CFG.FN_AKUN||'akun-admin',JSON.stringify({action:'setlabel',items:items}),false,'/','POST',{'content-type':'application/json'})}
  catch(e){if(e&&(e.code===404||/not found/i.test(e.message||'')))throw new Error('Fungsi akun-admin belum dipasang.');throw e}
  var out={};try{out=JSON.parse(ex.responseBody||'{}')}catch(e2){}
  if(!out.ok){if(/Aksi tidak dikenal/i.test(out.error||''))throw new Error('Fungsi akun-admin belum diperbarui. Deploy ulang fungsi akun-admin dulu.');throw new Error(out.error||('Fungsi akun-admin gagal (kode '+ex.responseStatusCode+')'))}
  return out.hasil||[];
 }
 /* items: [{email, peran}] -> ringkasan {diubah, sama, belum, gagal, daftarGagal} */
 async function kirim(items){
  var r={diubah:0,sama:0,belum:0,gagal:0,gagalList:[]};
  for(var i=0;i<items.length;i+=200){
   var hs=await panggil(items.slice(i,i+200));
   hs.forEach(function(h){
    if(h.status==='diubah')r.diubah++;else if(h.status==='sudah-sama')r.sama++;else if(h.status==='belum-ada-login')r.belum++;
    else{r.gagal++;r.gagalList.push(h.email+' ('+h.status+(h.pesan?': '+h.pesan:'')+')')}
   });
  }
  return r;
 }
 function ringkas(r){
  var t=[];if(r.diubah)t.push(r.diubah+' diubah');if(r.sama)t.push(r.sama+' sudah sesuai');if(r.belum)t.push(r.belum+' belum punya akun login');if(r.gagal)t.push(r.gagal+' gagal');
  return t.join(', ')||'tidak ada akun';
 }
 window.labelProktor={kelola:peranKelola,kirim:kirim,ringkas:ringkas};

 /* Simpan akun -> sinkron label akun itu (admin, mode awan, ada email). */
 if(typeof window.saveAkun==='function'){
  var asli=window.saveAkun;
  window.saveAkun=async function(d){
   var em=String((d&&d.email)||'').trim().toLowerCase(),pr=(d&&d.peranAll)||[];
   await asli.apply(this,arguments);
   if(!(Cloud.on&&em&&S.user&&actRole()==='admin'))return;
   var ket='';
   try{
    var r=await kirim([{email:em,peran:peranKelola(pr)}]);
    ket=r.gagal?' Label login GAGAL diatur: '+r.gagalList.join('; ')+'.':r.belum?' Label login belum diatur karena akun belum punya login; ketuk Sinkron label setelah login dibuat.':r.diubah?' Label login disesuaikan dengan peran.':'';
   }catch(x){ket=' Label login belum disesuaikan: '+((x&&x.message)||x)+' Ketuk Sinkron label setelah fungsi siap.'}
   if(ket&&typeof A!=='undefined'){var m=A.msg||{ok:true,m:''};A.msg={ok:m.ok&&ket.indexOf('GAGAL')<0&&ket.indexOf('belum')<0,m:(m.m||'')+ket}}
  };
 }

 /* Tombol di menu Akun (admin saja). */
 if(typeof window.viewAkun==='function'){
  var v0=window.viewAkun;
  window.viewAkun=function(){
   var h=v0.apply(this,arguments);
   if(!(Cloud.on&&actRole()==='admin'))return h;
   var tb='<div class="row"><button type="button" class="btn small" data-act="labelsinkron">Sinkron label login</button><span class="note">Samakan label admin, guru, dan proktor di Appwrite dengan peran tiap akun.</span></div>';
   var i=h.indexOf('<input id="akunq"');
   return i<0?h+tb:h.slice(0,i)+tb+h.slice(i);
  };
 }
 var sibuk=false;
 document.addEventListener('click',async function(e){
  var b=e.target.closest&&e.target.closest('[data-act="labelsinkron"]');if(!b||sibuk)return;
  if(!(Cloud.on&&actRole()==='admin'))return;
  var items=(S.users||[]).filter(function(u){return u.email&&u.aktif!==false}).map(function(u){return {email:String(u.email).trim().toLowerCase(),peran:peranKelola(roleList(u))}});
  if(!items.length){toast('Belum ada akun beremail');return}
  var ok=await uiConfirm('Samakan label login '+items.length+' akun aktif dengan perannya? Akun yang peran admin, guru, atau proktornya dicabut akan kehilangan label itu di Appwrite.',{title:'Sinkron label login',ok:'Sinkronkan'});
  if(!ok)return;
  sibuk=true;b.disabled=true;
  try{var r=await kirim(items);A.msg={ok:!r.gagal,m:'Sinkron label selesai: '+ringkas(r)+'.'+(r.gagalList.length?' Gagal: '+r.gagalList.slice(0,5).join('; ')+(r.gagalList.length>5?' dan lainnya.':''):'')};toast('Sinkron label selesai')}
  catch(x){A.msg={ok:false,m:'Sinkron label gagal: '+((x&&x.message)||x)}}
  sibuk=false;render();
 });
})();
