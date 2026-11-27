#!/usr/bin/env node
/* Uji modul LKPD-DDO-ELK-01 (Arus, Tegangan, dan Hambatan): master 14 butir, menit, kunci hitung. node tools/uji-lkpd-x12.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import {fileURLToPath} from 'node:url'; const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'); let lulus=0,gagal=0; const ok=(c,m)=>{if(c)lulus++;else{gagal++;console.log('GAGAL: '+m)}};
const ctx=vm.createContext({console,JSON,Math,Object,Array,String,Number,Date,RegExp,window:null,document:{addEventListener(){},createElement(){return{style:{}}},head:{appendChild(){}},body:{}}});ctx.window=ctx;
const src=f=>fs.readFileSync(path.join(root,'js',f),'utf8'); const run=(c,n)=>vm.runInContext(c,ctx,{filename:n});
run(src('lkpd-modul.js'),'a');run(src('lkpd-v2-x06.js'),'b');run(src('lkpd-v2-x12.js'),'x12');run(src('lkpd.js').split('\n').slice(0,19).join('\n'),'d');
run(`function lk2Is(m){return !!(m&&m.v2&&m.v2.ver===2)}function lkEsc(x){return String(x==null?'':x)}
var STAFF=true;function isStaff(){return STAFF}var LKS={id:'LKPD-DDO-ALT-02'};function lksMod(){return null}function lksHub(){return ''}
var LK={},LKA={},LKM={};function render(){}function toast(){}function lkEditorDefaults(m){return {src:m}}`,'stub');
run(src('lkpd-master.js'),'master');
const G=e=>vm.runInContext(e,ctx);
const m=G('LKPD_MODULES.find(function(x){return x.id==="LKPD-DDO-ELK-01"})'); ok(!!m,'terdaftar'); const V=m.v2;
const cek=ctx.lkmsCek(m); console.log('master:',cek.filter(x=>!x.ok).map(x=>x.k+' ('+x.t+')').join('; ')||'semua lulus',cek.length);
const P=V.pertemuan; ok(P.length===3&&P.every(p=>p.jp===4&&p.menit===180),'3x4 JP'); ok(V.jp===12&&m.duration===540,'12 JP, 540 menit');
const mk=k=>V.langkah.filter(l=>l.k===k).reduce((t,l)=>t+l.menit,0);
P.forEach(p=>ok(p.praktik===p.kegiatan.reduce((t,k)=>t+mk(k),0)&&p.praktik<p.menit,'praktik P'+p.n));
ok(V.langkah.length===m.steps.length,'langkah=steps'); [1,2,3,4].forEach(k=>ok(V.langkah.some(l=>l.k===k&&l.saksi),'saksi '+k));
ok(V.obs.aspek.reduce((t,x)=>t+x.b,0)===100,'bobot 100'); const w=V.obs.aspek.find(x=>x.id==='waktu').ket; ok(w.includes('total praktik '+[1,2,3,4].reduce((t,k)=>t+mk(k),0)+' menit'),'waktu rubrik');
ok(V.cekK.length===m.checks.length,'cekK'); const q={};m.quiz.forEach(x=>q[x.id]=x);
ok(q.C1.kunci===12/6&&Math.abs(q.C2.kunci-12.6/2.1)<1e-9&&q.C3.kunci===12*4.5&&q.C4.kunci===12&&Math.abs(q.C5.kunci-72/18)<1e-9&&Math.abs(q.C6.kunci-(12.6-12.1))<1e-9,'kunci latihan');
ok(P.reduce((t,p)=>t.concat(p.latihan||[]),[]).sort().join()===m.quiz.map(x=>x.id).sort().join(),'latihan tiap pertemuan');
const g=V.gate.qs; ok(g[1].o[g[1].a]==='4 Ω'&&12/3===4,'gerbang 2'); ok(g[4].o[g[4].a]==='0,7 V'&&Math.abs(12.6-11.9-0.7)<1e-9,'gerbang 5');
g.filter(x=>x.t==='pg').forEach((x,i)=>{const L=x.o.map(s=>s.length),mx=Math.max(...L);ok(!(L[x.a]===mx&&L.filter(n=>n===mx).length===1&&L[x.a]>20),'PG'+i+' bukan terpanjang tunggal')});
ok(V.tabel.every(t=>!JSON.stringify(t).match(/"std":[^,}]*\d/)),'std kosong'); ok(!/undefined|NaN/.test(JSON.stringify(m)),'tanpa NaN');
console.log('lulus',lulus,'gagal',gagal);
