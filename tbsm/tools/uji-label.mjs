/* Uji label proktor (klien + server, tiruan): node tools/uji-label.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
/* ---- klien ---- */
let calls=[],balas=null,confirmOk=true,listeners={};
const ctx={console,JSON,Array,Object,String,Promise,Error,
 document:{addEventListener:(t,f)=>{listeners[t]=f}},toast(){},render(){},
 Cloud:{on:true,acc:{client:{}}},CFG:{FN_AKUN:'akun-admin'},
 S:{user:{id:'a'},users:[]},A:{msg:null},actRole:()=>'admin',roleList:u=>String(u.peran).split(','),
 uiConfirm:async()=>confirmOk,
 Appwrite:{Client:function(){},Functions:function(){this.createExecution=async(id,body)=>{calls.push(JSON.parse(body));if(balas instanceof Error)throw balas;return {responseStatusCode:200,responseBody:JSON.stringify(balas)}}}},
 saveAkun:async()=>{},viewAkun:()=>'<div></div><input id="akunq" type="search">'};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/label-proktor.js',import.meta.url),'utf8'),ctx);
T('peranKelola buang siswa',JSON.stringify(ctx.labelProktor.kelola('siswa,proktor,guru'))==='["guru","proktor"]',0);
T('tombol di viewAkun sebelum pencarian',ctx.viewAkun().indexOf('labelsinkron')>0&&ctx.viewAkun().indexOf('labelsinkron')<ctx.viewAkun().indexOf('akunq'),0);
ctx.Cloud.on=false; T('tanpa awan: tidak ada tombol',ctx.viewAkun().indexOf('labelsinkron')<0,0); ctx.Cloud.on=true;
balas={ok:true,hasil:[{email:'a@x.id',status:'diubah'},{email:'b@x.id',status:'sudah-sama'},{email:'c@x.id',status:'belum-ada-login'},{email:'d@x.id',status:'gagal',pesan:'x'}]};
let r=await ctx.labelProktor.kirim([{email:'a@x.id',peran:['proktor']}]);
T('ringkasan hitung',r.diubah===1&&r.sama===1&&r.belum===1&&r.gagal===1,r);
T('aksi setlabel dikirim',calls[0].action==='setlabel'&&calls[0].items.length===1,calls[0]);
calls=[]; balas={ok:true,hasil:[]}; await ctx.labelProktor.kirim(Array.from({length:450},(_, i)=>({email:i+'@x.id',peran:[]})));
T('450 akun dipecah 3 panggilan (maks 200)',calls.length===3&&calls[0].items.length===200&&calls[2].items.length===50,calls.map(c=>c.items.length));
balas={ok:false,error:'Aksi tidak dikenal.'};
let msg='';try{await ctx.labelProktor.kirim([{email:'a@x.id',peran:[]}])}catch(e){msg=e.message}
T('fungsi lama: pesan deploy ulang',/diperbarui/.test(msg),msg);
/* simpan akun: pesan ditambah */
calls=[]; balas={ok:true,hasil:[{email:'p@x.id',status:'diubah'}]}; ctx.A.msg={ok:true,m:'Akun P disimpan.'};
await ctx.saveAkun({email:'P@x.id',peranAll:['proktor','siswa']});
T('simpan akun memanggil setlabel dengan peran kelola saja',calls.length===1&&JSON.stringify(calls[0].items)==='[{"email":"p@x.id","peran":["proktor"]}]',calls);
T('pesan akun memuat info label',/Label login disesuaikan/.test(ctx.A.msg.m),ctx.A.msg);
calls=[]; ctx.A.msg={ok:true,m:'Akun Q disimpan.'}; await ctx.saveAkun({email:'',peranAll:['guru']});
T('tanpa email: tidak memanggil server',calls.length===0,calls);
balas=new Error('jaringan'); ctx.A.msg={ok:true,m:'Akun R.'}; await ctx.saveAkun({email:'r@x.id',peranAll:['guru']});
T('gagal jaringan: akun tetap tersimpan, pesan peringatan',ctx.A.msg.ok===false&&/belum disesuaikan/.test(ctx.A.msg.m),ctx.A.msg);
/* ---- server: ekstrak logika setlabel lewat modul asli dengan Appwrite tiruan ---- */
const src=fs.readFileSync(new URL('../functions/akun-admin/src/main.js',import.meta.url),'utf8');
T('server memuat aksi setlabel admin-only (sesudah pemeriksaan admin)',src.indexOf("body.action === 'setlabel'")>src.indexOf("includes('admin')) return res.json")&&src.includes('updateLabels'),0);
T('server tidak menyentuh label di luar admin/guru/proktor',src.includes("const KELOLA = ['admin', 'guru', 'proktor']")&&src.includes('!KELOLA.includes(l)'),0);
T('server menolak admin mencabut label admin sendiri',src.includes('ditolak-admin-sendiri'),0);
console.log(process.exitCode?'\nADA YANG GAGAL':'\nSemua uji label lolos');
