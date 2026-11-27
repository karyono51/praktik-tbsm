/* Uji absensi barcode per rombel (QR, sesi, scan, rekap, pemindai cadangan): node tools/uji-absensi.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
let saves=0;const noop=()=>{};
const siswa=(id,nama,kelas,extra)=>Object.assign({id,nama,kelas,username:'26'+id,peran:'siswa',aktif:true},extra||{});
let ROMBEL=[
 {id:'rb1',nama:'X TBSM 1',tingkat:'X',aktif:true,tahunId:'t1',anggota:['s1','s2']},
 {id:'rb2',nama:'X TBSM 2',tingkat:'X',aktif:true,tahunId:'t1',anggota:['s6']},
 {id:'rb3',nama:'XI TBSM 1 (lama)',tingkat:'XI',aktif:true,tahunId:'t0',anggota:['s3']},
 {id:'rb4',nama:'XII Nonaktif',tingkat:'XII',aktif:false,tahunId:'t1',anggota:['s7']}];
const ctx={console,JSON,Math,Date,Array,Object,String,Number,Error,Promise,parseInt,unescape,encodeURIComponent,setTimeout,clearTimeout,
 document:{addEventListener:noop,createElement:()=>({style:{},appendChild:noop}),head:{appendChild:noop},getElementById:()=>null,querySelector:()=>null,body:{appendChild:noop}},
 navigator:{},ICO:{chev:''},KLS:['X','XI','XII'],
 S:{user:{id:'g1',nama:'Pak Guru',peran:'guru'},users:[siswa('s1','Andi','X'),siswa('s2','Budi','X'),siswa('s3','Cici','XI'),siswa('s4','Dedi','X',{aktif:false}),siswa('s5','Eko','X'),siswa('s6','Fani','X'),siswa('s7','Gita','XII'),{id:'g2',nama:'Guru Lain',peran:'guru'}],observasi:[]},
 V:{mode:'list'},NAVTABS:[],NAVPERM:{},hasRole:(u,r)=>String(u.peran).split(',').indexOf(r)>-1,schAkunOk:()=>true,schNama:()=>'SMKS Uji',
 AKD:{loaded:true},akKelasAll:()=>ROMBEL,akTahunAktif:()=>({nama:'2026/2027'}),akTahunNama:id=>({t1:'2026/2027',t0:'2025/2026'}[id]||''),
 ymd:t=>{const d=new Date(t);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)},
 toast:noop,save:()=>{saves++},persist:noop,render:noop,actRole:()=>'guru',isStaff:()=>true,can:()=>true,
 esc:s=>String(s==null?'':s),svg:()=>'<svg/>',needX:()=>true,dl:noop,uiConfirm:async()=>true,Cloud:{on:false},drOpen:noop,
 viewKatalog:()=>'<k/>',schObsList:l=>l,obsTipe:r=>r&&r.tipe==='siswa'?'siswa':'guru',
 viewAkun:()=>'<div><button type="button" class="btn small" data-act="akunedit" data-v="s1">Ubah</button><button type="button" class="btn small" data-act="akunedit" data-v="g2">Ubah</button></div>'};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/qr.js',import.meta.url),'utf8'),ctx);
vm.runInContext(fs.readFileSync(new URL('../js/absensi.js',import.meta.url),'utf8')+';this.__x={AB,abIsi,abUrai,abCek,abProses,abSet,abRec,abPay,abBaris,abDocId,abSiswa,abRekapData,abHitungSesi,viewAbsensi,abLembar,abViewRekap,abBuatDet,abMuat,abNative,abPilihan,abRbSiswa,abNamaRombel,abKunci,abInit}',ctx);
const X=ctx.__x; X.abInit(); X.AB.tgl='2026-11-26'; X.AB.rk.bulan='2026-11';
const ids=l=>l.map(u=>u.id).join();

/* barcode */
const u1=ctx.S.users[0],kode=X.abIsi(u1);
T('isi barcode berpola TBSM|id|cek',/^TBSM\|s1\|[0-9a-z]{1,4}$/.test(kode),kode);
T('urai kode benar, kode palsu ditolak',X.abUrai(kode)==='s1'&&X.abUrai('TBSM|s1|zzzz')===null&&X.abUrai('https://x.id')===null,0);
T('QR dibuat dari isi barcode',ctx.QR.buat(kode).n>=21&&ctx.QR.svg(kode).indexOf('<path')>0,0);

/* pilihan rombel */
const op=X.abPilihan();
T('pilihan: rombel aktif tahun ini + "Belum punya rombel" (rombel tahun lama dan nonaktif tidak ada)',op.map(o=>o.key).join()==='rb1,rb2,tanpa',op.map(o=>o.key));
T('rombel awal terpilih: X TBSM 1',X.AB.rb==='rb1',X.AB.rb);
T('roster rombel = anggota aktif',ids(X.abSiswa('rb1'))==='s1,s2'&&ids(X.abSiswa('rb2'))==='s6',[ids(X.abSiswa('rb1')),ids(X.abSiswa('rb2'))]);
T('tanpa rombel = siswa aktif yang belum masuk rombel tahun ini (Cici rombel lama ikut, Dedi nonaktif tidak)',ids(X.abSiswa('tanpa'))==='s3,s5,s7'||ids(X.abSiswa('tanpa')).split(',').sort().join()==='s3,s5,s7',ids(X.abSiswa('tanpa')));
T('rombel siswa dikenali',X.abRbSiswa(ctx.S.users[0])==='rb1'&&X.abRbSiswa(ctx.S.users[4])==='tanpa'&&X.abNamaRombel(ctx.S.users[5])==='X TBSM 2',0);

/* id dokumen */
const id=X.abDocId('rb1','2026-11-26','p');
T('id dokumen valid Appwrite (<=36)',id.length<=36&&/^[a-z0-9][a-z0-9_.-]*$/.test(id),id);
T('rombel berbeda -> dokumen berbeda',X.abDocId('rb1','2026-11-26','h')!==X.abDocId('rb2','2026-11-26','h'),0);

/* scan */
let h=X.abProses(kode);
T('scan anggota rombel: hadir tercatat',h.ok&&!h.dup&&/Andi hadir/.test(h.msg),h);
const rec=X.abRec('rb1','2026-11-26','h');
T('dokumen observasi absen: kelas=tingkat, mapel memuat nama rombel, payload memuat rb',rec&&rec.tipe==='absen'&&rec.kelas==='X'&&rec.kategori==='hadir'&&rec.skor===1&&/X TBSM 1/.test(rec.mapel)&&X.abPay(rec).rb==='rb1'&&X.abPay(rec).rn==='X TBSM 1',rec);
T('kolom kelas muat 8 karakter dan mapel 120',rec.kelas.length<=8&&rec.mapel.length<=120,0);
h=X.abProses(kode);
T('scan ulang: sudah hadir, tidak digandakan',h.ok&&h.dup&&ctx.S.observasi.length===1,h);
h=X.abProses(X.abIsi(ctx.S.users[5]));
T('siswa rombel lain (X TBSM 2) ditolak dengan nama rombelnya',!h.ok&&/bukan anggota X TBSM 1/.test(h.msg)&&/X TBSM 2/.test(h.msg)&&!X.abBaris('rb1','2026-11-26','h').s6,h);
h=X.abProses(X.abIsi(ctx.S.users[3]));
T('akun nonaktif ditolak',!h.ok,h);
T('siswa tidak ada / QR asing ditolak',!X.abProses(X.abIsi({id:'zzz'})).ok&&!X.abProses('bukan-barcode').ok,0);
/* ganti rombel aktif lalu scan */
X.AB.rb='rb2'; h=X.abProses(X.abIsi(ctx.S.users[5]));
T('pindah ke X TBSM 2: Fani tercatat di sesi rombel itu, bukan rombel 1',h.ok&&X.abBaris('rb2','2026-11-26','h').s6&&!X.abBaris('rb1','2026-11-26','h').s6&&ctx.S.observasi.length===2,h);
X.AB.rb='rb1';
/* status manual */
X.abSet('rb1','2026-11-26','h','s2','S',{c:'demam'});
let R=X.abBaris('rb1','2026-11-26','h');
T('sakit dengan keterangan',R.s2.s==='S'&&R.s2.c==='demam'&&X.abRec('rb1','2026-11-26','h').skor===1,R);
X.abSet('rb1','2026-11-26','h','s2',null);
T('hapus status siswa',!X.abBaris('rb1','2026-11-26','h').s2,0);
const c=X.abHitungSesi(X.abBaris('rb1','2026-11-26','h'),X.abSiswa('rb1'));
T('hitung ringkas H=1 belum=1',c.H===1&&c.B===1,c);
rec.r=1;rec.d=0;X.abSet('rb1','2026-11-26','h','s2','A');
T('dokumen tersinkron diubah -> d=1',rec.d===1,rec);
X.AB.ket='Mikrometer';X.abSet('rb1','2026-11-26','p','s1','H',{m:'s'});
const rp=X.abRec('rb1','2026-11-26','p');
T('sesi praktik dokumen terpisah dengan kegiatan dan rombel',rp&&rp.id!==rec.id&&rp.kategori==='praktik'&&rp.mapel==='Praktik: Mikrometer · X TBSM 1',rp&&rp.mapel);
/* rekap per rombel */
X.abSet('rb1','2026-11-27','h','s1','H'); X.abSet('rb1','2026-11-27','h','s2','I');
X.AB.rk.rb='rb1';
const D=X.abRekapData(),a1=D.rec.filter(o=>o.u.id==='s1')[0],a2=D.rec.filter(o=>o.u.id==='s2')[0];
T('rekap rombel 1: 2 sesi kehadiran, 2 siswa (praktik dan rombel 2 tidak ikut)',D.sess.length===2&&D.L.length===2,[D.sess.length,D.L.length]);
T('rekap Andi 100%, Budi alpa 1 izin 1',a1.c.H===2&&a1.pct===100&&a2.c.A===1&&a2.c.I===1&&a2.pct===0,[a1,a2]);
X.AB.rk.rb='rb2';T('rekap rombel 2 hanya sesinya',X.abRekapData().sess.length===1,0);
X.AB.rk.rb='rb1';X.AB.rk.bulan='2026-12';T('bulan lain kosong',X.abRekapData().sess.length===0,0);X.AB.rk.bulan='2026-11';
ctx.S.user={id:'g2',nama:'Guru Lain',peran:'guru'}; ctx.can=p=>p==='observasi';
T('guru lain hanya melihat miliknya (kosong)',X.abRekapData().sess.length===0,0);
ctx.can=()=>true;T('admin melihat semua',X.abRekapData().sess.length===2,0);
ctx.S.user={id:'g1',nama:'Pak Guru',peran:'guru'};
/* dokumen lama (tingkat) tetap terbaca bila pilihan jatuh ke tingkat */
const lama={id:'ab-lama',tipe:'absen',kelas:'X',kategori:'hadir',tanggal:'2026-11-20',guruId:'g1',pengamatId:'g1',guru:'Pak Guru',payload:JSON.stringify({rows:{s1:{s:'H',t:1}}})};
T('dokumen lama tanpa rb dikenali sebagai kelas tingkatnya',X.abKunci(lama)==='kX',X.abKunci(lama));
/* tampilan */
const v=X.viewAbsensi();
T('tampilan: pilihan rombel, scan, galeri, ikon barcode tiap siswa, status',/data-ab="rombel"/.test(v)&&/X TBSM 1/.test(v)&&/data-act="abscan"/.test(v)&&/abfile/.test(v)&&(v.match(/data-act="abkode"/g)||[]).length===2&&(v.match(/data-act="abst"/g)||[]).length===8,0);
T('tampilan tidak lagi menyebut pilihan Kelas X/XI/XII',!/<option value="X"/.test(v),0);
ctx.AB.sheet={sid:'s2',rb:'rb1',tgl:'2026-11-26',j:'h'};
const sh=X.abLembar();
T('lembar keterangan memuat QR, rombel siswa, status, catatan',/<svg/.test(sh)&&/X TBSM 1/.test(sh)&&/data-act="absimpan"/.test(sh)&&/data-ab="cat"/.test(sh),0);
ctx.AB.sheet=null;
T('rekap tampil dengan pilihan rombel',/Rekap absensi/.test(X.abViewRekap())&&/data-ab="rrombel"/.test(X.abViewRekap()),0);
T('obsTipe: absen bukan observasi guru',ctx.obsTipe({tipe:'absen'})==='absen'&&ctx.obsTipe({tipe:'siswa'})==='siswa'&&ctx.obsTipe({tipe:'guru'})==='guru',0);
T('tab absensi terdaftar',ctx.NAVTABS.indexOf('absensi')>-1&&ctx.NAVPERM.absensi==='observasi',0);
const ak=ctx.viewAkun();
T('Akun: ikon barcode hanya di baris siswa',/data-act="abakun" data-v="s1"/.test(ak)&&!/data-act="abakun" data-v="g2"/.test(ak),ak);
ctx.AB.sheet={sid:'s1',rb:'rb1',tgl:'2026-11-26',j:'h',via:'akun'};ctx.S.tab='akun';
T('Akun: lembar muncul dari daftar Akun, bukan di menu Absensi',/absimpan/.test(ctx.viewAkun())&&!/absimpan/.test(X.viewAbsensi()),0);
ctx.AB.sheet=null;
/* tanpa rombel sama sekali: jatuh ke tingkat */
ROMBEL=[];
const op2=X.abPilihan();
T('tanpa rombel: pilihan jatuh ke Kelas X, XI, XII',op2.map(o=>o.key).join()==='kX,kXI,kXII'&&op2[0].nama==='Kelas X',op2.map(o=>o.key));
T('tanpa rombel: roster = siswa aktif tingkat itu',ids(X.abSiswa('kX'))==='s1,s2,s5,s6'||ids(X.abSiswa('kX')).split(',').sort().join()==='s1,s2,s5,s6',ids(X.abSiswa('kX')));
X.AB.rb='kX';X.abInit();
const h2=X.abProses(X.abIsi(ctx.S.users[4]));
T('tanpa rombel: scan siswa tingkat X tercatat',h2.ok&&X.abBaris('kX','2026-11-26','h').s5.s==='H'&&X.abRec('kX','2026-11-26','h').kelas==='X',h2);
ROMBEL=[{id:'rb1',nama:'X TBSM 1',tingkat:'X',aktif:true,tahunId:'t1',anggota:['s1','s2']}];X.AB.rb='';X.abInit();
T('pilihan yang hilang diganti rombel pertama',X.AB.rb==='rb1',X.AB.rb);
/* payload 45 siswa muat */
ROMBEL=[{id:'rbBesar',nama:'XII TBSM 1',tingkat:'XII',aktif:true,tahunId:'t1',anggota:[]}];
const big=[];for(let i=0;i<45;i++){const u=siswa('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f'+i,'Siswa '+i,'XII');big.push(u);ROMBEL[0].anggota.push(u.id)}
ctx.S.users=ctx.S.users.concat(big);big.forEach(u=>X.abSet('rbBesar','2026-11-26','h',u.id,'H',{m:'s',c:'catatan lumayan panjang untuk uji ukuran'}));
T('45 siswa ber-ID 36 karakter muat di payload (<20000)',X.abRec('rbBesar','2026-11-26','h').payload.length<20000,X.abRec('rbBesar','2026-11-26','h').payload.length);
T('penyimpanan lokal dipanggil',saves>0,saves);
/* pemindai cadangan (iPhone) */
T('tanpa BarcodeDetector dan tanpa jsQR: tidak ada pemindai',X.abNative()===false&&X.abBuatDet()===null,0);
let gambar=null;
ctx.document.createElement=(t)=>t==='canvas'?{width:0,height:0,getContext:()=>({drawImage:(s,x,y,w,h)=>{gambar={w,h}},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(4),width:w,height:h})})}:{style:{},appendChild:noop};
ctx.jsQR=()=>({data:'TBSM|s1|'+X.abCek('s1')});
const det=X.abBuatDet();
const hasil=await det.detect({videoWidth:1920,videoHeight:1080},640);
T('cadangan jsQR: frame video diperkecil dan kode terbaca',hasil.length===1&&hasil[0].rawValue===X.abIsi(ctx.S.users[0])&&gambar.w===640&&gambar.h===360,[hasil,gambar]);
await det.detect({naturalWidth:4000,naturalHeight:3000},1400);
T('cadangan jsQR: foto galeri besar diperkecil ke 1400',gambar.w===1400&&gambar.h===1050,gambar);
ctx.jsQR=()=>null;
T('jsQR tidak menemukan kode: daftar kosong',(await det.detect({width:100,height:100})).length===0,0);
T('abMuat langsung benar bila jsQR sudah ada',(await X.abMuat())===true,0);
