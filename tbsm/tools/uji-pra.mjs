/* Uji pra-unduh soal (klien, dengan DOM tiruan): node tools/uji-pra.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
const store={};
const soal=[
 {id:'a',aktif:true,tujuan:'ujian',tipe:'pg',mapel:'TBSM',qi:'drive:G1',oi:['drive:G2','','','','']},
 {id:'b',aktif:true,tujuan:'keduanya',tipe:'pg',mapel:'TBSM',qi:'tmp:xx'},   // belum terunggah: diabaikan
 {id:'c',aktif:true,tujuan:'ujian',tipe:'pg',mapel:'KIM',oi:['drive:G3','drive:G2','','','']},
 {id:'d',aktif:true,tujuan:'ujian',tipe:'pg',mapel:'TBSM'}
];
const unduh=[]; let gagalId=null, online=true, started=0;
const ctx={console,setTimeout,clearTimeout,setInterval:()=>0,Date,JSON,Promise,Array,Object,String,Number,
 localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}},
 navigator:{get onLine(){return online}},
 toast:()=>{},render:()=>{},
 S:{user:{id:'u1',kelas:'X-1'},tab:'cbtonline'},actRole:()=> 'siswa',
 Jam:{now:()=>1000},Cloud:{on:true},
 BS:{D:{sesi:[],hasil:[]},loaded:true,loading:false},
 SG:{mem:{}},
 sgKey:r=>String(r).replace(/^drive:/,''),
 sgRefs:q=>{const a=[];if(q.qi)a.push(q.qi);(q.oi||[]).forEach(x=>{if(x)a.push(x)});return a},
 sgResolve:async r=>{const k=r.replace(/^drive:/,'');if(ctx.SG.mem[k])return ctx.SG.mem[k];if(k===gagalId)return null;unduh.push(k);ctx.SG.mem[k]='data:x';return 'data:x'},
 bsSoalById:id=>soal.find(q=>q.id===id),
 bsPool:(m,kelas)=>soal.filter(q=>q.aktif&&(q.tujuan==='keduanya'||q.tujuan===m)),
 bsSesiStatus:s=>s.mulai&&1000<s.mulai?{k:'soon'}:{k:'on'},
 bsSesiUntuk:()=>ctx.BS.D.sesi,
 bsLoad:async()=>{},
 bsMulaiUjian:async()=>{started++},
 document:{addEventListener(){}},window:{addEventListener(){}},APP_CONFIG:{}};
ctx.window=Object.assign(ctx.window,ctx); ctx.window.window=ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/pra-unduh.js',import.meta.url),'utf8'),ctx);
const W=ctx.window;
const sesiM={id:'s1',judul:'Manual',pilih:'manual',ids:['a','b','d']};
const sesiA={id:'s2',judul:'Acak',pilih:'acak',mapelF:['KIM']};
ctx.BS.D.sesi=[sesiM,sesiA];

T('kandidat manual: daftar guru',JSON.stringify(W.pdKandidat(sesiM))==='["a","b","d"]',W.pdKandidat(sesiM));
T('kandidat acak: pool menurut mapel',JSON.stringify(W.pdKandidat(sesiA))==='["c"]',W.pdKandidat(sesiA));
T('belum diunduh: tombol Siapkan soal',/Siapkan soal/.test(W.pdBaris(sesiM,null)));
T('selesai: tanpa baris',W.pdBaris(sesiM,{score:1})==='');
let h=await W.pdSiapkan(sesiM,{cap:5000});
T('unduh 2 gambar drive (tmp: dilewati), tanpa duplikat',h.ok&&h.n===2&&unduh.length===2&&unduh.includes('G1')&&unduh.includes('G2'),{h,unduh});
T('baris: Soal siap',/Soal siap/.test(W.pdBaris(sesiM,null))&&/2 gambar/.test(W.pdBaris(sesiM,null)),W.pdBaris(sesiM,null));
T('status tersimpan di perangkat',/"s1"/.test(store['tbsm-pra-u1']||''),store);
h=await W.pdSiapkan(sesiA,{cap:5000});
T('G2 sudah ada: hanya G3 yang baru diunduh',h.ok&&unduh.length===3&&unduh[2]==='G3',unduh);
gagalId='G9'; soal.push({id:'e',aktif:true,tujuan:'ujian',tipe:'pg',mapel:'ZZ',qi:'drive:G9'});
const sesiG={id:'s3',pilih:'manual',ids:['e']};ctx.BS.D.sesi.push(sesiG);
h=await W.pdSiapkan(sesiG,{cap:5000});
T('gambar gagal: tidak siap, jumlah gagal dicatat',!h.ok&&h.gagal===1,h);
T('baris: Belum lengkap dan Coba lagi',/Belum lengkap/.test(W.pdBaris(sesiG,null))&&/Coba lagi/.test(W.pdBaris(sesiG,null)),W.pdBaris(sesiG,null));
online=false;
T('tanpa sinyal: tombol dinonaktifkan',/disabled/.test(W.pdBaris(sesiG,null)));
online=true;
const sesiT={id:'s4',pilih:'manual',ids:['d']};ctx.BS.D.sesi.push(sesiT);
T('sesi tanpa gambar: tidak ada baris',W.pdBaris(sesiT,null)==='');
/* gerbang Mulai: gambar belum lengkap diunduh dulu, lalu ujian mulai satu kali */
const sesiH={id:'s5',pilih:'manual',ids:['c']};ctx.BS.D.sesi.push(sesiH);
ctx.SG.mem={}; unduh.length=0; delete W.PD.st.s5;
await W.bsMulaiUjian(sesiH,{});
T('Mulai: gambar diunduh dulu, lalu bsMulaiUjian dipanggil',started===1&&unduh.length===2,{started,unduh});
const sebelum=unduh.length;
await W.bsMulaiUjian(sesiH,{});
T('Mulai kedua: sudah siap, tidak mengunduh lagi',started===2&&unduh.length===sebelum,unduh);
console.log(process.exitCode?'\nADA YANG GAGAL':'\nSemua uji pra-unduh lolos');
