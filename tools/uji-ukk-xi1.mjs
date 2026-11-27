/* Uji unit UKK-XI-1 (Pemeriksaan Komponen Sistem CVT, kelas XI): node tools/uji-ukk-xi1.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const rd=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx={console,schNama:()=>'SMKS X',schEf:()=>({kota:'Sumedang'}),document:{addEventListener(){}}};
vm.createContext(ctx);
vm.runInContext(rd('js/data.js'),ctx);
vm.runInContext(rd('js/ukk-aturan.js'),ctx);
let ok=0,bad=0; const T=(n,c)=>{c?ok++:(bad++,console.log('GAGAL',n))};
const j=vm.runInContext("jobById('UKK-XI-1')",ctx);
T('unit ada',!!j&&j.kelas==='XI'&&j.ukk&&j.items.length===10);
T('id unik & urut',new Set(j.items.map(i=>i.id)).size===10&&j.items.every((i,k)=>i.id==='UKK-XI-1-'+k&&i.no===k+1));
T('unit lain utuh',['UKK-1','UKK-2','UKK-3','UKK-4','UKK-X-1'].every(id=>vm.runInContext(`!!jobById('${id}')`,ctx)));
T('JOBS memuat 6 unit UKK',vm.runInContext("JOBS.filter(j=>j.ukk).length",ctx)===6);
// nilai: semua benar
const hs={},st={},hn={};
const isi={ 'UKK-XI-1-1':'17,9','UKK-XI-1-2':'17,95','UKK-XI-1-3':'3,1 mm, pegas baik','UKK-XI-1-6':'112,1','UKK-XI-1-7':'127,0 mm, tidak kendur'};
j.items.forEach(i=>{hs[i.id]=isi[i.id]||'Sesuai prosedur';st[i.id]=1;hn[i.id]='Layak pakai'});
ctx.__j=j;ctx.__st=st;ctx.__hs=hs;ctx.__hn=hn;
let r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('semua benar = 100',r.score===100&&r.kompeten);
// V-belt aus: 17,2 -> benar=0, status Sesuai (1) => tidak dapat nilai
hs['UKK-XI-1-1']='17,2';
r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('belt aus dinilai Sesuai = salah',r.score===90);
st['UKK-XI-1-1']=0; hn['UKK-XI-1-1']='Ganti V-belt';
r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('belt aus dinilai Tidak sesuai = benar',r.score===100);
// batas tepat
hs['UKK-XI-1-1']='17,5';st['UKK-XI-1-1']=1;
r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('tepat batas servis = Sesuai',r.score===100);
// mangkok 112,6 -> Tidak sesuai
hs['UKK-XI-1-6']='112,6';st['UKK-XI-1-6']=0;
r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('mangkok aus = Tidak sesuai benar',r.score===100);
// campuran tanpa teks
hs['UKK-XI-1-3']='3,1';
r=vm.runInContext("calc(__j,__st,75,__hs,__hn)",ctx);
T('butir campuran tanpa teks ditolak',r.score===90);
// observasi
const src=rd('js/observasi-ukk.js'); const cut=src.indexOf('var OU=');
const c2={schNama:()=>'SMKS X',console}; vm.createContext(c2);
vm.runInContext(src.slice(0,cut),c2);
const L=vm.runInContext("OBU.lb.cvt11",c2);
T('lembar cvt11 terdaftar tingkat XI',L&&L.tk==='XI'&&L.waktu==='30 Menit');
T('20 aspek (4+10+3+3)',L.flat.length===20&&L.grup.map(g=>g.items.length).join()==='4,10,3,3');
T('nomor aspek 1..20 urut',L.flat.every((i,k)=>i.no===k+1&&i.id==='u'+(k+1)));
T('lembar lain utuh',['vario','cvt','rem','bodi','tegangan'].every(k=>vm.runInContext(`!!OBU.lb.${k}`,c2)));
console.log(ok+' lulus, '+bad+' gagal'); process.exit(bad?1:0);
