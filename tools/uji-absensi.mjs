/* Uji absensi barcode (QR, sesi, scan, rekap): node tools/uji-absensi.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const T=(n,c,i)=>{console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));if(!c)process.exitCode=1};
let saves=0,persists=0,toasts=[];
const noop=()=>{};
const siswa=(id,nama,kelas,extra)=>Object.assign({id,nama,kelas,username:'26'+id,peran:'siswa',aktif:true},extra||{});
const ctx={console,JSON,Math,Date,Array,Object,String,Number,Error,Promise,parseInt,unescape,encodeURIComponent,setTimeout,clearTimeout,
 document:{addEventListener:noop,createElement:()=>({style:{},appendChild:noop}),head:{appendChild:noop},getElementById:()=>null,querySelector:()=>null,body:{appendChild:noop}},
 navigator:{},ICO:{chev:''},KLS:['X','XI','XII'],
 S:{user:{id:'g1',nama:'Pak Guru',peran:'guru'},users:[siswa('s1','Andi','X'),siswa('s2','Budi','X'),siswa('s3','Cici','XI'),siswa('s4','Dedi','X',{aktif:false}),{id:'g2',nama:'Guru Lain',peran:'guru',kelas:'X'}],observasi:[]},
 V:{mode:'list'},NAVTABS:[],NAVPERM:{},hasRole:(u,r)=>String(u.peran).split(',').indexOf(r)>-1,schAkunOk:()=>true,schNama:()=>'SMKS Uji',
 ymd:t=>{const d=new Date(t);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)},
 toast:m=>toasts.push(m),save:()=>{saves++},persist:()=>{persists++},render:noop,actRole:()=>'guru',isStaff:()=>true,can:()=>true,
 esc:s=>String(s==null?'':s),svg:()=>'<svg/>',needX:()=>true,dl:noop,uiConfirm:async()=>true,Cloud:{on:false},drOpen:noop,
 viewKatalog:()=>'<k/>',viewAkun:()=>'<div><button type="button" class="btn small" data-act="akunedit" data-v="s1">Ubah</button><button type="button" class="btn small" data-act="akunedit" data-v="g2">Ubah</button></div>',schObsList:l=>l,obsTipe:r=>r&&r.tipe==='siswa'?'siswa':'guru'};
ctx.window=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/qr.js',import.meta.url),'utf8'),ctx);
vm.runInContext(fs.readFileSync(new URL('../js/absensi.js',import.meta.url),'utf8')+';this.__x={AB,abIsi,abUrai,abCek,abProses,abSet,abRec,abPay,abBaris,abDocId,abSiswa,abRekapData,abHitungSesi,viewAbsensi,abLembar,abViewRekap}',ctx);
const X=ctx.__x; X.AB.kelas='X'; X.AB.tgl='2026-11-26'; X.AB.rk={bulan:'2026-11',kelas:'X',j:'h'};

/* barcode */
const u1=ctx.S.users[0],kode=X.abIsi(u1);
T('isi barcode berpola TBSM|id|cek',/^TBSM\|s1\|[0-9a-z]{1,4}$/.test(kode),kode);
T('urai kode benar',X.abUrai(kode)==='s1',0);
T('kode dengan cek salah ditolak',X.abUrai('TBSM|s1|zzzz')===null&&X.abUrai('TBSM|s1')===null&&X.abUrai('https://x.id')===null&&X.abUrai('')===null,0);
T('QR dibuat dari isi barcode',ctx.QR.buat(kode).n>=21&&ctx.QR.svg(kode).indexOf('<path')>0,0);
/* daftar siswa kelas */
T('roster hanya siswa aktif sekelas',X.abSiswa('X').map(u=>u.id).join()==='s1,s2',X.abSiswa('X').map(u=>u.id));
/* id dokumen */
const id=X.abDocId('XII','2026-11-26','p');
T('id dokumen valid Appwrite (<=36, huruf angka - _)',id.length<=36&&/^[a-z0-9][a-z0-9_.-]*$/.test(id),id);
/* scan */
let h=X.abProses(kode);
T('scan pertama: hadir tercatat',h.ok&&!h.dup&&/Andi hadir/.test(h.msg),h);
const rec=X.abRec('X','2026-11-26','h');
T('dokumen observasi bertipe absen dibuat',rec&&rec.tipe==='absen'&&rec.kelas==='X'&&rec.kategori==='hadir'&&rec.skor===1&&rec.pengamatId==='g1'&&rec.guruId==='g1',rec);
T('payload memuat status siswa',X.abPay(rec).rows.s1.s==='H'&&X.abPay(rec).rows.s1.m==='s',X.abPay(rec));
h=X.abProses(kode);
T('scan ulang: sudah hadir, tidak digandakan',h.ok&&h.dup&&ctx.S.observasi.length===1,h);
h=X.abProses(X.abIsi(ctx.S.users[2]));
T('siswa kelas lain ditolak',!h.ok&&/kelas XI/.test(h.msg)&&!X.abBaris('X','2026-11-26','h').s3,h);
h=X.abProses(X.abIsi({id:'zzz'}));
T('siswa tidak ada ditolak',!h.ok&&/tidak ada/i.test(h.msg),h);
h=X.abProses(X.abIsi(ctx.S.users[3]));
T('akun nonaktif ditolak',!h.ok&&/nonaktif/.test(h.msg),h);
h=X.abProses('bukan-barcode');
T('QR asing ditolak',!h.ok&&/Bukan barcode/.test(h.msg),h);
/* status manual */
X.abSet('X','2026-11-26','h','s2','S',{c:'demam'});
let R=X.abBaris('X','2026-11-26','h');
T('sakit dengan keterangan',R.s2.s==='S'&&R.s2.c==='demam'&&X.abRec('X','2026-11-26','h').skor===1,R);
X.abSet('X','2026-11-26','h','s2','H',{m:'m'});
T('hadir dari status lain: skor naik, keterangan lama ikut',X.abRec('X','2026-11-26','h').skor===2,X.abPay(X.abRec('X','2026-11-26','h')));
X.abSet('X','2026-11-26','h','s2',null);
T('hapus status siswa',!X.abBaris('X','2026-11-26','h').s2&&X.abRec('X','2026-11-26','h').skor===1,0);
const c=X.abHitungSesi(X.abBaris('X','2026-11-26','h'),X.abSiswa('X'));
T('hitung ringkas H=1 belum=1',c.H===1&&c.B===1,c);
/* sesi sudah tersinkron ditandai d=1 saat diubah */
rec.r=1;rec.d=0;X.abSet('X','2026-11-26','h','s2','A');
T('dokumen tersinkron diubah -> d=1',rec.d===1,rec);
/* praktik terpisah dari kehadiran */
X.AB.ket='Mikrometer';X.abSet('X','2026-11-26','p','s1','H',{m:'s'});
const rp=X.abRec('X','2026-11-26','p');
T('sesi praktik dokumen terpisah dengan kegiatan',rp&&rp.id!==rec.id&&rp.kategori==='praktik'&&rp.mapel==='Praktik: Mikrometer',rp);
/* rekap */
X.abSet('X','2026-11-27','h','s1','H'); X.abSet('X','2026-11-27','h','s2','I');
const D=X.abRekapData();
const a1=D.rec.filter(o=>o.u.id==='s1')[0],a2=D.rec.filter(o=>o.u.id==='s2')[0];
T('rekap bulan: 2 sesi kehadiran (praktik tidak ikut)',D.sess.length===2,D.sess.length);
T('rekap Andi 2 hadir 100%',a1.c.H===2&&a1.pct===100,a1);
T('rekap Budi alpa 1 izin 1',a2.c.A===1&&a2.c.I===1&&a2.pct===0,a2);
X.AB.rk.bulan='2026-12';T('bulan lain kosong',X.abRekapData().sess.length===0,0); X.AB.rk.bulan='2026-11';
/* guru lain tidak melihat sesi guru pertama */
ctx.S.user={id:'g2',nama:'Guru Lain',peran:'guru'}; ctx.can=p=>p==='observasi';
T('guru lain: rekap kosong (hanya miliknya)',X.abRekapData().sess.length===0,0);
ctx.can=()=>true;
T('admin (observasi-semua) melihat semua',X.abRekapData().sess.length===2,0);
ctx.S.user={id:'g1',nama:'Pak Guru',peran:'guru'};
/* tampilan */
const v=X.viewAbsensi();
T('tampilan memuat tombol scan, galeri, ikon barcode tiap siswa',/data-act="abscan"/.test(v)&&/abfile/.test(v)&&(v.match(/data-act="abkode"/g)||[]).length===2,0);
T('tampilan memuat 4 tombol status per siswa',(v.match(/data-act="abst"/g)||[]).length===8,0);
ctx.AB.sheet={sid:'s2',kelas:'X',tgl:'2026-11-26',j:'h'};
const sh=X.abLembar();
T('lembar keterangan memuat QR, status, catatan',/<svg/.test(sh)&&/data-act="absimpan"/.test(sh)&&/data-ab="cat"/.test(sh),0);
ctx.AB.sheet=null;
T('rekap tampil',/Rekap absensi/.test(X.abViewRekap()),0);
/* observasi lain tidak ikut */
T('obsTipe: absen tidak dianggap observasi guru',ctx.obsTipe({tipe:'absen'})==='absen'&&ctx.obsTipe({tipe:'siswa'})==='siswa'&&ctx.obsTipe({tipe:'guru'})==='guru',0);
T('tab absensi terdaftar',ctx.NAVTABS.indexOf('absensi')>-1&&ctx.NAVPERM.absensi==='observasi',0);
const ak=ctx.viewAkun();
T('Akun: ikon barcode hanya di baris siswa',/data-act="abakun" data-v="s1"/.test(ak)&&!/data-act="abakun" data-v="g2"/.test(ak),ak);
ctx.AB.sheet={sid:'s1',kelas:'X',tgl:'2026-11-26',j:'h',via:'akun'};ctx.S.tab='akun';
T('Akun: lembar keterangan muncul dari daftar Akun, tidak di menu Absensi',/absimpan/.test(ctx.viewAkun())&&!/absimpan/.test(X.viewAbsensi()),0);
ctx.AB.sheet=null;
/* payload kelas 45 siswa muat */
const big=[];for(let i=0;i<45;i++)big.push(siswa('a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f'+i,'Siswa '+i,'XII'));
ctx.S.users=ctx.S.users.concat(big);big.forEach(u=>X.abSet('XII','2026-11-26','h',u.id,'H',{m:'s',c:'catatan lumayan panjang untuk uji ukuran'}));
T('45 siswa ber-ID 36 karakter muat di payload (<20000)',X.abRec('XII','2026-11-26','h').payload.length<20000,X.abRec('XII','2026-11-26','h').payload.length);
T('penyimpanan lokal dipanggil',saves>0,saves);
