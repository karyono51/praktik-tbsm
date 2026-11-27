/* Uji cetak hasil per siswa (klien, DOM tiruan): node tools/uji-cetak-siswa.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
const soal={
 p1:{id:'p1',tipe:'pg',mapel:'TBSM',topik:'Mesin',kunci:2,opts:[1,2,3,4,5]},
 k1:{id:'k1',tipe:'kompleks',mapel:'TBSM',kunci:[0,3],opts:[1,2,3,4,5]},
 g1:{id:'g1',tipe:'kategori',mapel:'TBSM',lab:['Benar','Salah'],rows:[['a',true],['b',false],['c',true]],opts:[1,2,3]},
 u1:{id:'u1',tipe:'uraian',mapel:'TBSM',maks:10},
 x1:{id:'x1',tipe:'pg',mapel:'KIM',opts:[1,2,3,4,5]}   // tanpa kunci
};
const printed=[];
const el=()=>({set innerHTML(v){this._h=v},get innerHTML(){return this._h||''},set textContent(v){this._h=String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')},appendChild(){},remove(){},classList:{add(){}}});
const ctx={console,Date,JSON,Math,Promise,Array,Object,String,Number,
 document:{createElement:()=>el(),getElementById:()=>null,body:{appendChild(){},classList:{add(){}}},addEventListener(){}},
 toast:()=>{},SEK:{nama:'SMK Contoh',program:'TBSM',alamat:'Jl. A'},LOGO:'',S:{kkm:75,users:[],user:{id:'g'}},
 BS:{D:{hasil:[]},kcLoaded:true},Cloud:{on:false},
 bsSoalById:id=>soal[id],
 bsHasKey:q=>q.tipe==='pg'?typeof q.kunci==='number':q.tipe==='kompleks'?Array.isArray(q.kunci):q.tipe==='kategori'?q.rows.every(r=>typeof r[1]==='boolean'):false,
 bsAnswered:(q,a)=>a!=null&&a!==''&&!(Array.isArray(a)&&!a.length),
 bsFrac:(q,a)=>{if(q.tipe==='pg')return a===q.kunci?1:0;if(q.tipe==='kompleks'){const s=a||[];const b=s.filter(i=>q.kunci.includes(i)).length,x=s.length-b;return Math.max(0,(b-x)/q.kunci.length)}if(q.tipe==='kategori'){let b=0;q.rows.forEach((r,i)=>{if(a[i]===(r[1]?0:1))b++});return b/q.rows.length}return 0},
 rgList:()=>[],rgNomor:()=> ''};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/cetak-siswa.js',import.meta.url),'utf8'),ctx);
const s={id:'s1',judul:'PTS Mesin',durasi:60,kkm:75};
const u={nama:'Andi <b>',kelas:'X-1',username:'1234'};
const h={score:80,benar:3,total:5,detik:1800,ts:Date.UTC(2026,10,18,3,0),pindah:2,pend:0,
 order:['p1','k1','g1','u1','x1','hilang'],ans:{p1:2,k1:[3,0],g1:[0,0,0],u1:'jawaban panjang',x1:1},nu:{u1:{skor:7}}};
const ringkas=ctx.csHalaman({s,u,h,kkm:75,rg:'Ruang 1',pk:'Bu Sari',no:'26-TSM-001',rinci:false,now:new Date(Date.UTC(2026,10,18))});
T('ringkas: nama di-escape (tanpa tag mentah)',ringkas.includes('Andi &lt;b&gt;')&&!ringkas.includes('Andi <b>'),0);
T('ringkas: nilai, KKM, Tuntas, no. peserta, ruang, proktor',/>80</.test(ringkas)&&/KKM: 75/.test(ringkas)&&/Tuntas/.test(ringkas)&&ringkas.includes('26-TSM-001')&&ringkas.includes('Ruang 1')&&ringkas.includes('Bu Sari'),ringkas.slice(0,300));
T('ringkas: tanpa tabel rincian',!/Rincian jawaban/.test(ringkas));
T('keluar halaman dan soal benar tercetak',/Keluar halaman: 2 kali/.test(ringkas)&&/3 dari 5 soal/.test(ringkas));
const r=ctx.csHalaman({s,u,h,kkm:75,rinci:true,now:new Date()});
T('rincian: ada tabel dengan 6 baris soal',(r.match(/<tr><td>\d+<\/td>/g)||[]).length===6,(r.match(/<tr><td>\d+<\/td>/g)||[]).length);
T('PG benar: jawaban C kunci C Benar',/<td>1<\/td><td>TBSM · Mesin<\/td><td style="text-align:center">C<\/td><td style="text-align:center">C<\/td><td>Benar<\/td>/.test(r),r);
T('kompleks urut huruf: A, D = kunci A, D Benar',/A, D<\/td><td style="text-align:center">A, D<\/td><td>Benar/.test(r));
T('kategori B B B vs kunci B S B: Sebagian',/B B B<\/td><td style="text-align:center">B S B<\/td><td>Sebagian/.test(r),r);
T('uraian: tidak mencetak isi jawaban, tampil skor 7 / 10',!/jawaban panjang/.test(r)&&/Skor 7 \/ 10/.test(r));
T('tanpa kunci: kunci dan hasil "-"',/<td>5<\/td><td>KIM<\/td><td style="text-align:center">B<\/td><td style="text-align:center">-<\/td><td>-<\/td>/.test(r),r);
T('soal terhapus tidak menggagalkan cetak',/Soal tidak ditemukan/.test(r));
const p=ctx.csHalaman({s,u,h:{...h,pend:2,score:50},kkm:75,rinci:false});
T('uraian belum dinilai: nilai sementara, bukan Belum tuntas',/Nilai sementara, 2 soal uraian/.test(p)&&!/Belum tuntas/.test(p));
const bt=ctx.csHalaman({s,u,h:{...h,score:60},kkm:75,rinci:false});
T('di bawah KKM: Belum tuntas',/Belum tuntas/.test(bt));
T('halaman pertama tanpa jeda, berikutnya jeda halaman',!/break-before/.test(ringkas)&&/break-before:page/.test(ctx.csHalaman({s,u,h,kkm:75,baru:true})));
/* alur cetakSesi: urutan dan hanya siswa yang selesai */
const users=[{id:'a',nama:'Ani',kelas:'X-1'},{id:'b',nama:'Budi',kelas:'X-1'},{id:'c',nama:'Cici',kelas:'X-2'}];
let html='';
ctx.cbtStaf={PN:{sesiLoaded:'s1'},pnLoad:async()=>{},sesiById:()=>s,roster:()=>users,hasilSesi:()=>({a:{...h,siswa:'Ani'},c:{...h,siswa:'Cici',score:90}}),cetakHtml:x=>{html=x},sesiAktif:()=> 's1'};
await ctx.csCetakSesi('s1',false);
T('cetakSesi: 2 halaman (yang belum mengerjakan dilewati), urut daftar',(html.match(/cs-hal/g)||[]).length===2&&html.indexOf('Ani')<html.indexOf('Cici')&&!html.includes('Budi'),html.length);
T('hanya halaman kedua yang memakai jeda halaman',(html.match(/style="break-before/g)||[]).length===1);
ctx.cbtStaf.hasilSesi=()=>({});html='';
await ctx.csCetakSesi('s1',false);
T('tidak ada yang selesai: tidak mencetak',html==='');
console.log(process.exitCode?'\nADA YANG GAGAL':'\nSemua uji cetak per siswa lolos');
