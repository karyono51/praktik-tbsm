/* qr.js: pembuat kode QR sendiri (tanpa pustaka luar, jalan offline).
   Mode byte (UTF-8), koreksi galat M, versi 1-20 dipilih otomatis, topeng dipilih lewat penalti.
   Dipakai absensi: QR.buat(teks) -> {n, a(x,y)}; QR.svg(teks,opsi); QR.gambar(teks,skala) -> canvas.
   Algoritma mengikuti spesifikasi ISO 18004 (Reed-Solomon GF(256), pola fungsi, penempatan zig-zag). */
var QR=(function(){
 var EC_PER_BLOK=[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26];
 var JML_BLOK=[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16];
 function utf8(s){
  var o=[],i,c;s=unescape(encodeURIComponent(String(s)));
  for(i=0;i<s.length;i++){c=s.charCodeAt(i);o.push(c)}
  return o;
 }
 function rawModul(v){
  var r=(16*v+128)*v+64;
  if(v>=2){var na=Math.floor(v/7)+2;r-=(25*na-10)*na-55;if(v>=7)r-=36}
  return r;
 }
 function dataKode(v){return Math.floor(rawModul(v)/8)-EC_PER_BLOK[v]*JML_BLOK[v]}
 /* GF(256), polinomial 0x11D */
 var EXP=[],LOG=[];
 (function(){var x=1,i;for(i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11D}for(i=255;i<512;i++)EXP[i]=EXP[i-255]})();
 function gmul(a,b){return (a&&b)?EXP[LOG[a]+LOG[b]]:0}
 function rsGen(d){
  var g=[1],i,j,n;
  for(i=0;i<d;i++){
   n=[];for(j=0;j<=g.length;j++)n[j]=0;
   for(j=0;j<g.length;j++){n[j]^=g[j];n[j+1]^=gmul(g[j],EXP[i])}
   g=n;
  }
  return g;
 }
 function rsSisa(data,g){
  var d=g.length-1,r=[],i,j,f;
  for(i=0;i<d;i++)r[i]=0;
  for(i=0;i<data.length;i++){
   f=data[i]^r[0];r.shift();r.push(0);
   for(j=0;j<d;j++)r[j]^=gmul(g[j+1],f);
  }
  return r;
 }
 function posisiAlign(v){
  if(v===1)return [];
  var na=Math.floor(v/7)+2,sz=v*4+17,step=Math.ceil((v*4+4)/(na*2-2))*2,r=[6],p;
  for(p=sz-7;r.length<na;p-=step)r.splice(1,0,p);
  return r;
 }
 function bchFormat(d){var r=d,i;for(i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);return ((d<<10)|r)^0x5412}
 function bchVersi(v){var r=v,i;for(i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);return (v<<12)|r}

 function buat(teks){
  var bytes=utf8(teks),v,bits,i,kap;
  for(v=1;v<=20;v++){
   kap=dataKode(v)*8;
   if(4+(v<10?8:16)+bytes.length*8<=kap)break;
  }
  if(v>20)throw new Error('Teks terlalu panjang untuk QR');
  /* aliran bit data */
  bits=[];
  function put(val,len){for(var k=len-1;k>=0;k--)bits.push((val>>>k)&1)}
  put(4,4);put(bytes.length,v<10?8:16);
  for(i=0;i<bytes.length;i++)put(bytes[i],8);
  put(0,Math.min(4,kap-bits.length));
  while(bits.length%8)bits.push(0);
  var pad=[0xEC,0x11];
  for(i=0;bits.length<kap;i++)put(pad[i%2],8);
  var data=[];
  for(i=0;i<bits.length;i+=8){var b=0,k;for(k=0;k<8;k++)b=(b<<1)|bits[i+k];data.push(b)}
  /* blok dan koreksi galat */
  var nb=JML_BLOK[v],ec=EC_PER_BLOK[v],raw=Math.floor(rawModul(v)/8),nShort=nb-raw%nb,lenShort=Math.floor(raw/nb),gen=rsGen(ec),blok=[],ecs=[],off=0,j;
  for(i=0;i<nb;i++){
   var len=lenShort-ec+(i<nShort?0:1),dat=data.slice(off,off+len);off+=len;
   blok.push(dat);ecs.push(rsSisa(dat,gen));
  }
  var all=[],maxD=lenShort-ec+1;
  for(i=0;i<maxD;i++)for(j=0;j<nb;j++)if(i<blok[j].length)all.push(blok[j][i]);
  for(i=0;i<ec;i++)for(j=0;j<nb;j++)all.push(ecs[j][i]);
  /* matriks */
  var n=v*4+17,M=[],F=[],x,y;
  for(y=0;y<n;y++){M[y]=[];F[y]=[];for(x=0;x<n;x++){M[y][x]=0;F[y][x]=0}}
  function set(x,y,d){M[y][x]=d?1:0;F[y][x]=1}
  function cari(cx,cy){
   var dx,dy,d;
   for(dy=-4;dy<=4;dy++)for(dx=-4;dx<=4;dx++){
    d=Math.max(Math.abs(dx),Math.abs(dy));
    if(cx+dx>=0&&cx+dx<n&&cy+dy>=0&&cy+dy<n)set(cx+dx,cy+dy,d!==2&&d!==4);
   }
  }
  function sejajar(cx,cy){var dx,dy;for(dy=-2;dy<=2;dy++)for(dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
  for(i=0;i<n;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  cari(3,3);cari(n-4,3);cari(3,n-4);
  var al=posisiAlign(v),na=al.length;
  for(i=0;i<na;i++)for(j=0;j<na;j++){
   if((i===0&&j===0)||(i===0&&j===na-1)||(i===na-1&&j===0))continue;
   sejajar(al[i],al[j]);
  }
  function formatBit(mask){
   var d=bchFormat((0<<3)|mask),k;   /* ECC M = 00 */
   for(k=0;k<=5;k++)set(8,k,(d>>>k)&1);
   set(8,7,(d>>>6)&1);set(8,8,(d>>>7)&1);set(7,8,(d>>>8)&1);
   for(k=9;k<15;k++)set(14-k,8,(d>>>k)&1);
   for(k=0;k<8;k++)set(n-1-k,8,(d>>>k)&1);
   for(k=8;k<15;k++)set(8,n-15+k,(d>>>k)&1);
   set(8,n-8,1);
  }
  formatBit(0);
  if(v>=7){
   var vi=bchVersi(v),k;
   for(k=0;k<18;k++){var bt=(vi>>>k)&1,a=n-11+k%3,b=Math.floor(k/3);set(a,b,bt);set(b,a,bt)}
  }
  /* data zig-zag */
  var idx=0,total=all.length*8,right,vert,up,xx;
  for(right=n-1;right>=1;right-=2){
   if(right===6)right=5;
   for(vert=0;vert<n;vert++){
    for(j=0;j<2;j++){
     xx=right-j;up=((right+1)&2)===0;
     y=up?n-1-vert:vert;
     if(!F[y][xx]&&idx<total){M[y][xx]=(all[idx>>>3]>>>(7-(idx&7)))&1;idx++}
    }
   }
  }
  /* pilih topeng */
  function topeng(m,x,y){
   switch(m){
    case 0:return (x+y)%2===0;case 1:return y%2===0;case 2:return x%3===0;case 3:return (x+y)%3===0;
    case 4:return (Math.floor(x/3)+Math.floor(y/2))%2===0;case 5:return x*y%2+x*y%3===0;
    case 6:return (x*y%2+x*y%3)%2===0;default:return ((x+y)%2+x*y%3)%2===0;
   }
  }
  function terap(m){for(y=0;y<n;y++)for(x=0;x<n;x++)if(!F[y][x]&&topeng(m,x,y))M[y][x]^=1}
  function penalti(){
   var p=0,hitam=0,r,c,run,prev;
   for(r=0;r<n;r++){
    run=1;prev=M[r][0];
    for(c=1;c<n;c++){if(M[r][c]===prev){run++;if(run===5)p+=3;else if(run>5)p++}else{run=1;prev=M[r][c]}}
    run=1;prev=M[0][r];
    for(c=1;c<n;c++){if(M[c][r]===prev){run++;if(run===5)p+=3;else if(run>5)p++}else{run=1;prev=M[c][r]}}
   }
   for(r=0;r<n-1;r++)for(c=0;c<n-1;c++){var q=M[r][c];if(q===M[r][c+1]&&q===M[r+1][c]&&q===M[r+1][c+1])p+=3}
   for(r=0;r<n;r++)for(c=0;c<n;c++)hitam+=M[r][c];
   p+=Math.floor(Math.abs(hitam*20-n*n*10)/(n*n))*10;
   return p;
  }
  var best=0,bestP=1e9,m,pp;
  for(m=0;m<8;m++){terap(m);formatBit(m);pp=penalti();if(pp<bestP){bestP=pp;best=m}terap(m)}
  terap(best);formatBit(best);
  return {n:n,v:v,topeng:best,a:function(x,y){return M[y][x]===1}};
 }

 /* SVG: satu path per baris agar ringan; margin (quiet zone) 4 modul */
 function svg(teks,o){
  o=o||{};var q=buat(teks),m=o.margin==null?4:o.margin,n=q.n,d='',x,y,s,px=o.px||240,fg=o.fg||'#000',bg=o.bg||'#fff';
  for(y=0;y<n;y++){x=0;while(x<n){if(q.a(x,y)){s=x;while(x<n&&q.a(x,y))x++;d+='M'+(s+m)+' '+(y+m)+'h'+(x-s)+'v1h-'+(x-s)+'z'}else x++}}
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(n+2*m)+' '+(n+2*m)+'" width="'+px+'" height="'+px+'" shape-rendering="crispEdges" role="img" aria-label="'+(o.label||'Kode QR')+'"><rect width="100%" height="100%" fill="'+bg+'"/><path d="'+d+'" fill="'+fg+'"/></svg>';
 }
 /* canvas: skala piksel per modul (bulat, supaya tegas saat dipindai dari galeri) */
 function gambar(teks,skala,margin){
  var q=buat(teks),m=margin==null?4:margin,s=skala||8,sz=(q.n+2*m)*s,c=document.createElement('canvas'),g,x,y;
  c.width=c.height=sz;g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,sz,sz);g.fillStyle='#000';
  for(y=0;y<q.n;y++)for(x=0;x<q.n;x++)if(q.a(x,y))g.fillRect((x+m)*s,(y+m)*s,s,s);
  return c;
 }
 return {buat:buat,svg:svg,gambar:gambar};
})();
