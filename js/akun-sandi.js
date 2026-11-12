/* akun-sandi.js: admin mengatur sandi akun (lewat Appwrite Function akun-admin) dan semua pengguna dapat mengganti sandinya */
if(Cloud.on){
 /* Membuat akun login langsung dari aplikasi tanpa fungsi server: permintaan tamu ke POST /account (tanpa cookie sesi admin).
    Tidak bisa mengubah sandi akun yang sudah ada; untuk itu perlu fungsi akun-admin atau Console. Batas Appwrite: sekitar 10 akun baru per jam per jaringan. */
 Cloud.buatLogin=async function(email,pw,nama){
  var res;
  try{res=await fetch(CFG.APPWRITE_ENDPOINT+'/account',{method:'POST',headers:{'Content-Type':'application/json','X-Appwrite-Project':CFG.APPWRITE_PROJECT},body:JSON.stringify({userId:'unique()',email:email,password:pw,name:nama||email})})}
  catch(e){throw new Error('Tidak bisa terhubung ke Appwrite. Periksa internet.')}
  var j={};try{j=await res.json()}catch(e2){}
  if(res.ok)return {ok:true,created:true};
  if(res.status===409)return {ok:false,exists:true};
  if(res.status===429)throw new Error('Terlalu banyak akun dibuat dalam satu jam (batas Appwrite). Coba lagi nanti.');
  throw new Error(j.message||('Gagal membuat akun login (kode '+res.status+')'));
 };
 Cloud.setPw=async function(email,pw,nama){
  var cl=(this.acc&&this.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
  var fn=new Appwrite.Functions(cl),ex,tanpaFn=this.tanpaFn===true;
  if(!tanpaFn)try{ex=await fn.createExecution(CFG.FN_AKUN||'akun-admin',JSON.stringify({action:'setpw',email:email,password:pw,name:nama}),false,'/','POST',{'content-type':'application/json'})}
  catch(e){if(e&&(e.code===404||/not found/i.test(e.message||''))){tanpaFn=true;this.tanpaFn=true}else throw e}
  if(tanpaFn){
   var r=await this.buatLogin(email,pw,nama);
   if(r.exists)throw new Error('Email ini sudah punya akun login, jadi sandinya tidak bisa diubah dari aplikasi. Ubah di Appwrite Console (Auth > Users > Update password), atau pasang fungsi akun-admin (docs-SANDI-AKUN.md).');
   r.via='bawaan';return r;
  }
  var out={};try{out=JSON.parse(ex.responseBody||'{}')}catch(e2){}
  if(!out.ok)throw new Error(out.error||('Fungsi akun-admin gagal (kode '+ex.responseStatusCode+')'));
  out.via='fungsi';return out;
 };
}
async function changeMyPw(){
 if(!S.user)return;
 if(Cloud.on){
  var o=await uiPrompt('Sandi lama (kosongkan bila masuk lewat Google).',{title:'Ganti sandi',type:'password',label:'Sandi lama',ok:'Lanjut'});if(o===null)return;
  var n=await uiPrompt('Sandi baru, minimal 8 karakter.',{title:'Ganti sandi',type:'password',label:'Sandi baru',ok:'Simpan'});if(n===null)return;
  if(n.length<8){toast('Sandi minimal 8 karakter');return}
  try{await Cloud.acc.updatePassword(n,o||undefined);toast('Sandi diganti')}catch(e){toast('Gagal mengganti sandi: '+((e&&e.message)||e))}
 }else{
  var n2=await uiPrompt('Sandi baru, minimal 6 karakter.',{title:'Ganti sandi',type:'password',label:'Sandi baru',ok:'Simpan'});if(n2===null)return;
  if(n2.length<6){toast('Sandi minimal 6 karakter');return}
  var u=S.users.find(function(x){return x.id===S.user.id});if(!u)return;
  await setPw(u,n2);u.d=1;save();toast('Sandi diganti');
 }
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="mypw"]');if(!b)return;
 if(typeof drOpen==='function')drOpen(false);changeMyPw();
});
