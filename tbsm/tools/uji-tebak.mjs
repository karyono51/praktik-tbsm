/* Uji kartu "Salah token" (klien, DOM tiruan): node tools/uji-tebak.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
let clicks=null,calls=[],role='proktor',confirmOk=true,balas={ok:true,rows:[]};
const els={'ru-sesi':{value:'S1'},'ru-body':{insertAdjacentHTML(){}}};
const ctx={console,JSON,Math,Date,Promise,Array,Object,String,
 document:{addEventListener:(t,f)=>{if(t==='click')clicks=f},getElementById:id=>els[id]||null,body:{},hidden:false},
 navigator:{onLine:true},MutationObserver:function(){this.observe=()=>{}},requestAnimationFrame:f=>setTimeout(f,0),setInterval:()=>0,
 toast:()=>{},esc:s=>String(s).replace(/</g,'&lt;'),S:{user:{id:'x'}},Cloud:{on:true},actRole:()=>role,
 uiConfirm:async()=>confirmOk,cbtFn:async b=>{calls.push(b);return balas}};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/tebak-token.js',import.meta.url),'utf8'),ctx);
const st=ctx.tebakToken.state;
T('tanpa data: kartu kosong',ctx.tebakToken.html()==='',0);
st.rows=[{sid:'A1',nama:'Budi <b>',kelas:'X-1',n:0,tot:12,lv:3,kunci:true,sisa:0},{sid:'A2',nama:'Sari',kelas:'X-1',n:0,tot:10,lv:1,kunci:false,sisa:240},{sid:'A3',nama:'Joko',kelas:'X-2',n:3,tot:3,lv:0,kunci:false,sisa:0}];st.t=Date.now();
const h=ctx.tebakToken.html();
T('menampilkan Terkunci, Diblokir, dan Salah ×n',/Terkunci/.test(h)&&/Diblokir 4:0\d/.test(h)&&/Salah ×3/.test(h),h.slice(0,200));
T('nama di-escape',h.indexOf('Budi <b>')<0&&/Budi &lt;b>/.test(h),0);
T('tombol Buka hanya untuk yang terkunci atau diblokir',(h.match(/data-tb="buka"/g)||[]).length===2,0);
T('tombol Buka semua muncul bila lebih dari satu',/data-tb="semua"/.test(h),0);
const klik=async(a,extra)=>{const b={dataset:Object.assign({tb:a},extra||{})};await clicks({target:{closest:()=>b}});await new Promise(r=>setTimeout(r,5))};
await klik('buka',{sid:'A1',nm:'Budi'});
T('Buka: kirim bukaTebak dengan sesi dan sid',calls.some(c=>c.action==='bukaTebak'&&c.sesiId==='S1'&&c.sid==='A1'),calls);
calls=[];await klik('semua');
T('Buka semua: kirim semua:true',calls.some(c=>c.action==='bukaTebak'&&c.semua===true),calls);
calls=[];confirmOk=false;await klik('buka',{sid:'A1'});
T('batal konfirmasi: tidak ada panggilan bukaTebak',!calls.some(c=>c.action==='bukaTebak'),calls);
confirmOk=true;calls=[];role='siswa';await klik('buka',{sid:'A1'});
T('siswa tidak bisa memakai tombol',calls.length===0,calls);
console.log(process.exitCode?'\nADA YANG GAGAL':'\nSemua uji kartu tebakan lolos');
