/* lkpd-skala-gambar.js: gambar skala alat ukur (jangka sorong, mikrometer, dial gauge) untuk soal isian angka.
   Soal memuat q.g (parameter gambar); gambar SVG digambar otomatis dari angka soal, jadi selalu cocok dengan soalnya,
   tanpa unggahan dan tanpa Drive. Bentuk q.g:
     {k:'jangka', res:0.05|0.02, main:<mm skala utama>, n:<garis nonius yang berimpit>}
     {k:'mikro',  sel:<mm selubung>, half:<garis 0,5 mm terlihat>, bidal:<0..49>}
     {k:'dial',   rev:<jarum kecil>, b:<garis jarum besar 0..99>}
     {k:'olengan', max:<garis terbesar>, min:<garis terkecil>}
   Dimuat setelah lkpd-gambar.js. Membungkus lkqRender (soal isian) dan lkgQHtml (pembahasan) tanpa mengubah berkas lain. */
var SKG={ink:'#1f2d27',mute:'#5b6b63',body:'#e6efe9',body2:'#cfe3d6',red:'#d32f2f',blue:'#1565c0'};

function skgF(v){return String(Math.round(v*100)/100).replace('.',',')}
function skgF2(v){return (Math.round(v)/100).toFixed(2).replace('.',',')}
function skgN(v){return Math.round(v*100)/100}
function skgT(x,y,t,o){o=o||{};return '<text x="'+skgN(x)+'" y="'+skgN(y)+'" font-size="'+(o.s||9)+'" text-anchor="'+(o.a||'middle')+'" fill="'+(o.c||SKG.ink)+'"'+(o.b?' font-weight="700"':'')+'>'+t+'</text>'}
function skgL(x1,y1,x2,y2,c,w){return '<line x1="'+skgN(x1)+'" y1="'+skgN(y1)+'" x2="'+skgN(x2)+'" y2="'+skgN(y2)+'" stroke="'+(c||SKG.ink)+'" stroke-width="'+(w||1)+'"/>'}
function skgSvgWrap(vb,alt,inner){return '<svg viewBox="0 0 '+vb+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+alt+'" font-family="system-ui,Arial,sans-serif">'+inner+'</svg>'}

/* ---------- Jangka sorong: skala utama di atas, nonius di bawah ---------- */
function skgJangka(g,bl){
 var N=Math.round(1/g.res),sp=(N-1)/N,len=N*sp,span=len+2,pad=10,px=(320-2*pad)/span,start=g.main-1;
 var X=function(mm){return pad+(mm-start)*px},total=g.main+g.n*g.res,x0=X(total),yb=50,h='';
 h+='<rect x="2" y="12" width="316" height="'+(yb-12)+'" rx="3" fill="'+SKG.body+'" stroke="'+SKG.mute+'"/>';
 var lab=px>=12?1:10;
 for(var v=start;v<=start+span+1e-9;v++){
  var x=X(v),big=(v%5===0);
  h+=skgL(x,yb,x,yb-(big?11:7));
  if(v%lab===0||v===g.main&&lab===1)h+=skgT(x,yb-15,v,{s:8.5});
 }
 var xe=x0+len*px;
 h+='<rect x="'+skgN(x0-6)+'" y="'+yb+'" width="'+skgN(len*px+12)+'" height="42" rx="3" fill="'+SKG.body2+'" stroke="'+SKG.mute+'"/>';
 var every=N/10;
 for(var k=0;k<=N;k++){
  var xk=x0+k*sp*px,long=(k%every===0);
  h+=skgL(xk,yb,xk,yb+(long?11:7),(!bl&&k===g.n)?SKG.red:SKG.ink,(!bl&&k===g.n)?2:1);
  if(long)h+=skgT(xk,yb+22,k/every,{s:8.5});
 }
 /* garis berimpit: dari garis utama (main+n) ke garis nonius ke-n */
 var xc=x0+g.n*sp*px;
 if(!bl)h+=skgL(xc,yb-14,xc,yb+14,SKG.red,2);
 h+=skgL(x0,yb-16,x0,yb+16,SKG.blue,1.6);
 h+=skgT(x0,yb+36,'0',{s:9,c:SKG.blue,b:1});
 if(!bl)h+=skgT(160,112,'garis nonius ke-'+g.n+' berimpit dengan garis skala utama',{s:9,c:SKG.red,b:1});else h+=skgT(160,112,'Cari garis nonius yang berimpit dengan garis skala utama',{s:9,c:SKG.mute});
 return skgSvgWrap('320 120',bl?'Skala jangka sorong ketelitian '+skgF(g.res)+' mm':'Skala jangka sorong ketelitian '+skgF(g.res)+' mm, garis nonius ke-'+g.n+' berimpit',h);
}

/* ---------- Mikrometer sekrup: selubung (kiri) dan bidal (kanan) ---------- */
function skgMikro(g,bl){
 var total=g.sel+(g.half?0.5:0)+g.bidal*0.01,px=26,xe=236,yb=68,h='';
 var X=function(mm){return xe-(total-mm)*px};
 h+='<rect x="2" y="36" width="'+(xe-2)+'" height="56" rx="3" fill="'+SKG.body+'" stroke="'+SKG.mute+'"/>';
 h+=skgL(2,yb,xe,yb,SKG.ink,1.2);
 for(var v=Math.ceil((total-(xe-6)/px)*2)/2;v<total-1e-9;v+=0.5){
  var x=X(v),isInt=Math.abs(v-Math.round(v))<1e-9;
  if(x<4||v<0)continue;
  if(isInt){h+=skgL(x,yb,x,yb-14);h+=skgT(x,yb-18,Math.round(v),{s:9})}
  else h+=skgL(x,yb,x,yb+9);
 }
 h+='<rect x="'+xe+'" y="26" width="84" height="84" rx="9" fill="'+SKG.body2+'" stroke="'+SKG.mute+'"/>';
 for(var j=-6;j<=6;j++){
  var d=g.bidal+j,y=yb+j*5.5,m5=((d%5)+5)%5===0;
  h+=skgL(xe,y,xe+(m5?15:9),y);
  if(m5&&j!==0)h+=skgT(xe+17,y+3,((d%50)+50)%50,{s:8.5,a:'start'});
 }
 h+=skgL(xe-60,yb,xe+30,yb,SKG.red,2);
 if(!bl)h+=skgT(xe+36,yb-4,'bidal '+g.bidal,{s:9,a:'start',c:SKG.red,b:1});
 h+=skgT(30,104,'selubung',{s:9,c:SKG.mute});
 h+=skgT(xe+42,122,'bidal',{s:9,c:SKG.mute});
 return skgSvgWrap('320 128',bl?'Skala mikrometer ketelitian 0,01 mm':'Skala mikrometer: selubung '+g.sel+' mm, garis 0,5 mm '+(g.half?'terlihat':'belum terlihat')+', bidal '+g.bidal,h);
}

/* ---------- Dial gauge ---------- */
function skgPol(cx,cy,r,deg){var a=deg*Math.PI/180;return [cx+r*Math.sin(a),cy-r*Math.cos(a)]}
function skgFace(cx,cy,r){
 var h='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff" stroke="'+SKG.ink+'" stroke-width="2"/>';
 for(var d=0;d<100;d++){
  var m10=d%10===0,p1=skgPol(cx,cy,r-3,d*3.6),p2=skgPol(cx,cy,r-(m10?12:7),d*3.6);
  h+=skgL(p1[0],p1[1],p2[0],p2[1],SKG.ink,m10?1.4:0.8);
  if(m10){var q=skgPol(cx,cy,r-23,d*3.6);h+=skgT(q[0],q[1]+3,d,{s:9})}
 }
 return h;
}
function skgNeedle(cx,cy,len,deg,c,w){
 var p=skgPol(cx,cy,len,deg),t=skgPol(cx,cy,-10,deg);
 return skgL(t[0],t[1],p[0],p[1],c,w);
}
function skgDial(g,bl){
 var cx=100,cy=96,r=86,h=skgFace(cx,cy,r),sx=cx,sy=62,sr=24;
 h+='<circle cx="'+sx+'" cy="'+sy+'" r="'+sr+'" fill="#f6faf7" stroke="'+SKG.mute+'"/>';
 for(var k=0;k<10;k++){
  var a=skgPol(sx,sy,sr-1,k*36),b=skgPol(sx,sy,sr-5,k*36);
  h+=skgL(a[0],a[1],b[0],b[1],SKG.mute,1);
  if(k%2===0){var t=skgPol(sx,sy,sr-10,k*36);h+=skgT(t[0],t[1]+2.3,k,{s:6.5})}
 }
 h+=skgNeedle(sx,sy,sr-4,g.rev*36,SKG.blue,1.8);
 h+='<circle cx="'+sx+'" cy="'+sy+'" r="2" fill="'+SKG.blue+'"/>';
 h+=skgNeedle(cx,cy,r-14,g.b*3.6,SKG.red,2.2)+'<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="'+SKG.red+'"/>';
 if(bl){
  h+=skgT(206,62,'Jarum kecil (biru)',{s:10,a:'start',c:SKG.blue,b:1});
  h+=skgT(206,78,'= putaran penuh',{s:8.5,a:'start',c:SKG.mute});
  h+=skgT(206,110,'Jarum besar (merah)',{s:10,a:'start',c:SKG.red,b:1});
  h+=skgT(206,125,'= per 0,01 mm',{s:8.5,a:'start',c:SKG.mute});
  return skgSvgWrap('320 190','Dial gauge ketelitian 0,01 mm',h);
 }
 h+=skgT(206,62,'Jarum kecil: '+g.rev,{s:10,a:'start',c:SKG.blue,b:1});
 h+=skgT(206,78,'(putaran penuh)',{s:8.5,a:'start',c:SKG.mute});
 h+=skgT(206,110,'Jarum besar:',{s:10,a:'start',c:SKG.red,b:1});
 h+=skgT(206,125,'garis ke-'+g.b,{s:10,a:'start',c:SKG.red,b:1});
 return skgSvgWrap('320 190','Dial gauge: jarum kecil '+g.rev+', jarum besar garis ke-'+g.b,h);
}

/* ---------- Keolengan: dua bacaan ekstrem pada satu dial ---------- */
function skgOlengan(g,bl){
 var cx=100,cy=96,r=86,h=skgFace(cx,cy,r),R=r-34;
 var a=skgPol(cx,cy,R,g.min*3.6),b=skgPol(cx,cy,R,g.max*3.6);
 h+='<path d="M'+skgN(a[0])+' '+skgN(a[1])+' A'+R+' '+R+' 0 0 1 '+skgN(b[0])+' '+skgN(b[1])+'" fill="none" stroke="#f9a825" stroke-width="6" stroke-linecap="round" opacity=".55"/>';
 h+=skgNeedle(cx,cy,r-14,g.min*3.6,SKG.blue,2.2);
 h+=skgNeedle(cx,cy,r-14,g.max*3.6,SKG.red,2.2);
 h+='<circle cx="'+cx+'" cy="'+cy+'" r="4" fill="'+SKG.ink+'"/>';
 h+=skgT(206,60,'Terbesar',{s:10,a:'start',c:SKG.red,b:1});
 if(!bl)h+=skgT(206,75,skgF2(g.max)+' mm',{s:10,a:'start',c:SKG.red,b:1});
 h+=skgT(206,108,'Terkecil',{s:10,a:'start',c:SKG.blue,b:1});
 if(!bl)h+=skgT(206,123,skgF2(g.min)+' mm',{s:10,a:'start',c:SKG.blue,b:1});
 h+=skgT(206,155,'Keolengan = ?',{s:10,a:'start',c:SKG.ink,b:1});
 if(bl)return skgSvgWrap('320 190','Dial gauge ketelitian 0,01 mm dengan dua jarum: terbesar (merah) dan terkecil (biru)',h);
 return skgSvgWrap('320 190','Dial gauge dengan bacaan terbesar '+skgF2(g.max)+' mm dan terkecil '+skgF2(g.min)+' mm',h);
}

/* bl=true: gambar untuk siswa tanpa label jawaban (angka dibaca dari skala). Pembahasan dan kunci memakai gambar berlabel. */
function skgSvg(g,bl){
 if(!g)return '';
 try{
  if(g.k==='jangka')return skgJangka(g,bl);
  if(g.k==='mikro')return skgMikro(g,bl);
  if(g.k==='dial')return skgDial(g,bl);
  if(g.k==='olengan')return skgOlengan(g,bl);
 }catch(e){}
 return '';
}
function skgBox(q,bl){var s=q&&q.g?skgSvg(q.g,bl):'';return s?'<div class="skg">'+s+'</div>':''}

/* Tampil di bawah teks soal (isian) dan di pembahasan. */
(function(){
 if(typeof lkqRender==='function'){
  var _r=lkqRender;
  lkqRender=function(q,i,d){
   var h=_r(q,i,d);
   if(q&&q.g){var k=h.indexOf('</b>');if(k>-1)h=h.slice(0,k+4)+skgBox(q,true)+h.slice(k+4)}
   return h;
  };
 }
 if(typeof lkgQHtml==='function'){
  var _g=lkgQHtml;
  lkgQHtml=function(q){return skgBox(q)+_g(q)};
 }
})();
