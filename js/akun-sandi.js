/* akun-sandi.js: admin mengatur sandi akun (lewat Appwrite Function akun-admin) dan semua pengguna dapat mengganti sandinya */
if(Cloud.on){
 Cloud.setPw=async function(email,pw,nama){
  var cl=(this.acc&&this.acc.client)||new Appwrite.Client().setEndpoint(CFG.APPWRITE_ENDPOINT).setProject(CFG.APPWRITE_PROJECT);
  var fn=new Appwrite.Functions(cl),ex;
  try{ex=await fn.createExecution(CFG.FN_AKUN||'akun-admin',JSON.stringify({action:'setpw',email:email,password:pw,name:nama}),false,'/','POST',{'content-type':'application/json'})}
  catch(e){if(e&&(e.code===404||/not found/i.test(e.message||'')))throw new Error('Fungsi akun-admin belum dipasang di Appwrite. Lihat docs-SANDI-AKUN.md.');throw e}
  var out={};try{out=JSON.parse(ex.responseBody||'{}')}catch(e2){}
  if(!out.ok)throw new Error(out.error||('Fungsi akun-admin gagal (kode '+ex.responseStatusCode+')'));
  return out;
 };
}
async function changeMyPw(){
 if(!S.user)return;
 if(Cloud.on){
  var o=prompt('Sandi lama (kosongkan bila masuk lewat Google):');if(o===null)return;
  var n=prompt('Sandi baru (minimal 8 karakter):');if(n===null)return;
  if(n.length<8){toast('Sandi minimal 8 karakter');return}
  try{await Cloud.acc.updatePassword(n,o||undefined);toast('Sandi diganti')}catch(e){toast('Gagal mengganti sandi: '+((e&&e.message)||e))}
 }else{
  var n2=prompt('Sandi baru (minimal 6 karakter):');if(n2===null)return;
  if(n2.length<6){toast('Sandi minimal 6 karakter');return}
  var u=S.users.find(function(x){return x.id===S.user.id});if(!u)return;
  await setPw(u,n2);u.d=1;save();toast('Sandi diganti');
 }
}
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act="mypw"]');if(!b)return;
 if(typeof drOpen==='function')drOpen(false);changeMyPw();
});
