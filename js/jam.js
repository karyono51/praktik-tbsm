/* jam.js (v70): jam global untuk ujian.
   Jam.now() = jam server Appwrite, bukan jam HP. Selisih (offset) dihitung dari cap waktu server pada respons tulis
   ($updatedAt dokumen) dan, bila terbaca, header Date. Sampel dengan waktu tempuh (RTT) terkecil dipertahankan.
   Jam monotonik performance.now() dipakai agar mengubah jam HP ke belakang tidak memperpanjang waktu ujian.
   Tanpa Appwrite (mode lokal) offset 0, sama dengan Date.now(). */
var Jam=(function(){
 var o={off:0,ok:false,rtt:1e9,at:0,base:0,pbase:0};
 function pn(){return (window.performance&&performance.now)?performance.now():0}
 o.now=function(){
  var d=Date.now()+o.off;
  if(o.ok){var m=o.base+(pn()-o.pbase);if(m>d)return m}
  return d;
 };
 /* sMs: waktu server (ms epoch) yang dicap kira-kira di tengah permintaan t0..t1 (jam HP) */
 o.sampleMs=function(sMs,t0,t1){
  if(!sMs||!(t1>=t0))return;
  var rtt=t1-t0;if(rtt>5000)return;
  var offNew=sMs-(t0+t1)/2,stale=Date.now()-o.at>300000,drift=o.ok&&Math.abs(offNew-o.off)>3000;
  if(o.ok&&!stale&&!drift&&rtt>o.rtt+400)return;
  o.off=offNew;o.rtt=rtt;o.at=Date.now();o.ok=true;
  o.base=t1+offNew;o.pbase=pn();
 };
 o.sample=function(iso,t0,t1){var s=Date.parse(iso);if(s)o.sampleMs(s,t0,t1)};
 /* Cadangan: header Date (hanya detik) dari endpoint publik Appwrite; diabaikan bila tidak terbaca (CORS) atau sudah ada sampel baru */
 o.probe=function(){
  try{
   if(typeof CFG==='undefined'||!CFG.APPWRITE_ENDPOINT||navigator.onLine===false||!window.fetch)return;
   if(o.ok&&Date.now()-o.at<600000)return;
   var t0=Date.now();
   fetch(CFG.APPWRITE_ENDPOINT+'/health/version',{cache:'no-store'}).then(function(r){
    var t1=Date.now(),h=r.headers.get('date');
    if(h&&!(o.ok&&Date.now()-o.at<600000)){var s=Date.parse(h);if(s)o.sampleMs(s+500,t0,t1)}
   }).catch(function(){});
  }catch(e){}
 };
 o.age=function(){return o.ok?Date.now()-o.at:Infinity};
 return o;
})();
window.Jam=Jam;
document.addEventListener('visibilitychange',function(){if(!document.hidden)Jam.probe()});
window.addEventListener('online',function(){Jam.probe()});
setTimeout(function(){Jam.probe()},1500);
