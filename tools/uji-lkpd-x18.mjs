#!/usr/bin/env node
/* Uji modul LKPD-X-18 (Membongkar, Memeriksa, dan Memasang Komponen sesuai Manual Servis): master V2, 9 x 4 JP, menit, kunci hitung. node tools/uji-lkpd-x18.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import {fileURLToPath} from 'node:url'; const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'); let lulus=0,gagal=0; const ok=(c,m)=>{if(c)lulus++;else{gagal++;console.log('GAGAL: '+m)}};
const ctx=vm.createContext({console,JSON,Math,Object,Array,String,Number,Date,RegExp,window:null,document:{addEventListener(){},createElement(){return{style:{}}},head:{appendChild(){}},body:{}}});ctx.window=ctx;
const src=f=>fs.readFileSync(path.join(root,'js',f),'utf8'); const run=(c,n)=>vm.runInContext(c,ctx,{filename:n});
run(src('lkpd-modul.js'),'a');run(src('lkpd-v2-x06.js'),'b');run(src('lkpd-v2-x12.js'),'x12');run(src('lkpd-v2-x18.js'),'x18');run(src('lkpd.js').split('\n').slice(0,19).join('\n'),'d');
run(`function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}function lkEsc(x){return String(x==null?'':x)}
var STAFF=true;function isStaff(){return STAFF}var LKS={id:'LKPD-X-06'};function lksMod(){return null}function lksHub(){return ''}
var LK={},LKA={},LKM={};function render(){}function toast(){}function lkEditorDefaults(m){return {src:m}}`,'stub');
run(src('lkpd-master.js'),'master');
const G=e=>vm.runInContext(e,ctx);
const m=G('LKPD_MODULES.find(function(x){return x.id==="LKPD-X-18"})'); ok(!!m,'terdaftar'); const V=m.v2;
ok(G('LKPD_MODULES.filter(function(x){return x.id==="LKPD-X-18"}).length')===1,'terdaftar satu kali');
ok(G('LKPD_MODULES.some(function(x){return x.id==="LKPD-X-06"})')&&G('LKPD_MODULES.some(function(x){return x.id==="LKPD-X-12"})'),'X-06 dan X-12 tetap ada');
ok(m.title==='Membongkar, Memeriksa, dan Memasang Komponen sesuai Manual Servis','judul sesuai matriks ringkas');
ok(m.status==='draft'&&m.active===false&&m.kelas==='X'&&V.tp==='X.6.4'&&V.jenis==='jobsheet','Draft, tidak aktif, Kelas X, TP X.6.4, job sheet');
ok(m.skkni.indexOf('unit 034, 049 (L3), 051 (L3), 052 (L3)')===0&&m.skkni.indexOf('verifikasi')>-1,'unit SKKNI sesuai matriks dan bertanda verifikasi');
const cek=ctx.lkmsCek(m); ok(cek.length===14&&cek.every(x=>x.ok),'memenuhi 14 butir master: '+cek.filter(x=>!x.ok).map(x=>x.k+' ('+x.t+')').join('; '));
const P=V.pertemuan; ok(P.length===9&&P.every(p=>p.jp===4&&p.menit===180),'9 pertemuan x 4 JP x 180 menit'); ok(V.jp===36&&P.reduce((t,p)=>t+p.jp,0)===36,'36 JP sesuai matriks ringkas'); ok(m.duration===1620&&m.duration===P.reduce((t,p)=>t+p.menit,0),'duration 1620 menit');
ok(!P[0].kegiatan.length&&!P[8].kegiatan.length&&P[0].sembunyi&&P[8].sembunyi,'pertemuan awal dan akhir tanpa kegiatan');
ok(V.kegiatan.length===7&&P.slice(1,8).every((p,i)=>p.kegiatan.join()===String(i+1)),'Kegiatan 1 sampai 7 satu per pertemuan 2 sampai 8 (tidak disatukan)');
const mk=k=>V.langkah.filter(l=>l.k===k).reduce((t,l)=>t+l.menit,0);
P.slice(1,8).forEach(p=>ok(p.praktik===p.kegiatan.reduce((t,k)=>t+mk(k),0)&&p.praktik>0&&p.praktik<p.menit,'praktik P'+p.n+' = jumlah menit langkah dan < menit pertemuan ('+p.praktik+')'));
ok(P.slice(1,8).every(p=>p.kartu&&p.kartu.judul&&!p.kartu.per),'tiap pertemuan satu kartu kegiatan');
ok(V.langkah.length===m.steps.length&&V.langkah.every((l,i)=>l.i===i&&l.menit>0),'langkah sejajar steps'); [1,2,3,4,5,6,7].forEach(k=>ok(V.langkah.some(l=>l.k===k&&l.saksi),'saksi kegiatan '+k));
const a=V.obs.aspek; ok(a.reduce((t,x)=>t+x.b,0)===100&&a.filter(x=>x.stop).length===1&&a.find(x=>x.stop).id==='k3','rubrik 100, penghenti K3');
const w=a.find(x=>x.id==='waktu').ket; ok(w.includes('total praktik '+[1,2,3,4,5,6,7].reduce((t,k)=>t+mk(k),0)+' menit')&&[1,2,3,4,5,6,7].every(k=>w.includes(' '+mk(k))),'waktu rubrik = menit langkah');
ok(V.obs.indikator.length===8&&V.obs.panduan.length===7,'8 indikator, 7 panduan');
ok(V.cekK.length===m.checks.length&&V.cekK.every(k=>k>=1&&k<=7)&&[1,2,3,4,5,6,7].every(k=>V.cekK.includes(k))&&m.fotoWajib.every(i=>i<m.checks.length),'cekK dan fotoWajib valid, tiap kegiatan punya pemeriksaan');
ok(Array.isArray(V.tabel)&&V.tabel.length===0&&!V.cekAuto,'tanpa tabel F dan cekAuto');
const cov=V.k3grup.reduce((t,g)=>t.concat(g.i),[]).sort((x,y)=>x-y); ok(cov.length===10&&m.safety.length===10&&cov.every((v,i)=>v===i),'10 butir K3 masing-masing satu kelompok');
const q={};m.quiz.forEach(x=>q[x.id]=x);
ok(q.T1.kunci===40*0.25&&Math.abs(q.T2.kunci-1.2*9.8)<1e-9&&Math.abs(q.H1.kunci-(0.03+0.05+0.04)/3)<1e-9&&q.H2.kunci===(108+12)/12,'kunci T1, T2, H1, H2');
ok(Math.abs(q.V1.kunci-3.14*2.5*2.5*5.5)<0.01&&Math.abs(q.V2.kunci-(50.010-49.975))<1e-9&&Math.abs(q.V3.kunci-(0.22+0.26+0.24)/3)<1e-9,'kunci V1, V2, V3');
ok(Math.abs(q.G1.kunci-((0.6+0.7+0.5)/3-0.1))<1e-9&&q.G2.kunci===14*8&&Math.abs(q.L1.kunci-(2.90+2.95+3.00)/3)<1e-9&&Math.abs(q.L2.kunci-(2.95-2.70))<1e-9&&q.W1.kunci===150/120*100,'kunci G1, G2, L1, L2, W1');
ok(m.quiz.every(x=>x.t==='isian'&&x.tol>0&&x.e),'soal isian berkunci, bertoleransi, berpembahasan');
ok(P.reduce((t,p)=>t.concat(p.latihan||[]),[]).sort().join()===m.quiz.map(x=>x.id).sort().join(),'tiap soal latihan masuk tepat satu pertemuan');
const g=V.gate.qs; ok(g.length===5&&g.filter(x=>x.t==='pg').length===3&&g.some(x=>x.t==='kompleks')&&g.some(x=>x.t==='kategori'),'gerbang: 3 PG, 1 kompleks, 1 kategori');
ok(g[1].o[g[1].a]==='14,7 N·m'&&Math.abs(1.5*9.8-14.7)<1e-9,'gerbang 2: 1,5 kgf·m = 14,7 N·m');
g.filter(x=>x.t==='pg').forEach((x,i)=>{const L=x.o.map(s=>s.length),mx=Math.max(...L);ok(x.o.length===5&&x.a>=0&&x.a<5&&!(L[x.a]===mx&&L.filter(n=>n===mx).length===1&&L[x.a]>20),'PG '+(i+1)+': kunci bukan opsi terpanjang tunggal')});
ok(g.every(x=>x.e&&x.e.length>40&&(x.lvl==='Aplikasi'||x.lvl==='Penalaran')),'soal gerbang berpembahasan dan berlevel'); ok(g[2].a.length>=2&&g[3].rows.some(r=>r[1])&&g[3].rows.some(r=>!r[1]),'kompleks >1 kunci, kategori punya Benar dan Salah');
ok(!/undefined|NaN/.test(JSON.stringify(m)),'tanpa undefined atau NaN');
ok(!/\d+(,\d+)?\s*(kgf·m|N·m)/.test(m.steps.map(s=>s.join(' ')).join(' '))&&!/\d\s*mm/.test(m.steps.map(s=>s.join(' ')).join(' ')),'langkah tidak memuat angka spesifikasi (diisi guru dari manual servis)');
console.log('lulus',lulus,'gagal',gagal); process.exit(gagal?1:0);
