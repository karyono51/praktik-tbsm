/* sekolah.js: satu sistem untuk dua sekolah. Mengatur logo, nama, alamat, ikon/manifest PWA, pemilih sekolah untuk admin lintas sekolah, dan penyaring data per sekolah.
   Dimuat setelah logo.js dan sebelum data.js. Kode sekolah: DF (SMKS Darul Fatwa), MEDINA (SMKS Medina Bandung). Admin berisi sekolah ALL (atau kosong) = lintas sekolah. */
var SCH_KEY='tbsm-sch';
var SCH_LIST={
 DF:{kode:'DF',param:'df',nama:'SMKS Darul Fatwa',pendek:'Darul Fatwa',npsn:'20253021',kota:'Sumedang',
  program:'Program Keahlian Teknik Sepeda Motor',
  alamat:'Jl. Letda Lukito No. 90, Jatiroke, Kec. Jatinangor, Kab. Sumedang, Jawa Barat 45363',
  a1:'Jl. Letda Lukito No. 90, Jatiroke,',a2:'Kec. Jatinangor, Kab. Sumedang, Jawa Barat 45363',
  logo:LOGO_DF,file:'assets/logo-df.png',icon:'assets/icon-df-192.png',manifest:'manifest-df.json'},
 MEDINA:{kode:'MEDINA',param:'medina',nama:'SMKS Medina Bandung',pendek:'Medina',npsn:'20219163',kota:'Bandung',
  program:'Program Keahlian Teknik Sepeda Motor',
  alamat:'Jl. K.H. Ahmad Dahlan No. 13\u201315, Kel. Burangrang, Kec. Lengkong, Kota Bandung, Jawa Barat 40262',
  a1:'Jl. K.H. Ahmad Dahlan No. 13\u201315, Kel. Burangrang,',a2:'Kec. Lengkong, Kota Bandung, Jawa Barat 40262',
  logo:LOGO_MEDINA,file:'assets/logo-medina.png',icon:'assets/icon-medina-192.png',manifest:'manifest-medina.json'}
};
var SCH_URUT=['DF','MEDINA'];

function schNorm(v){
 v=String(v||'').trim().toUpperCase();
 if(v==='ALL'||/^(SEMUA|LINTAS)/.test(v))return 'ALL';
 if(SCH_LIST[v])return v;
 if(/DARUL|FATWA/.test(v))return 'DF';
 if(/MEDINA|YAPINU/.test(v))return 'MEDINA';
 return '';
}
function schParam(){
 try{var p=String(new URLSearchParams(location.search).get('s')||'').toLowerCase();
  for(var i=0;i<SCH_URUT.length;i++)if(SCH_LIST[SCH_URUT[i]].param===p)return SCH_URUT[i]}catch(e){}
 return '';
}
function schTersimpan(){try{var k=localStorage.getItem(SCH_KEY)||'';return SCH_LIST[k]?k:''}catch(e){return ''}}
function schSimpan(k){try{if(SCH_LIST[k])localStorage.setItem(SCH_KEY,k)}catch(e){}}
(function(){var p=schParam();if(p)schSimpan(p)})();

/* admin lintas sekolah: sekolah ALL, atau admin yang sekolahnya belum diisi */
function schLintas(u){
 u=u||(window.S&&S.user);if(!u)return false;
 var k=String(u.sekolah||'').toUpperCase();
 return k==='ALL'||(!SCH_LIST[k]&&/(^|,)admin(,|$)/.test(String(u.peran||'')));
}
/* kode sekolah yang sedang aktif: sekolah milik akun jika ada, selain itu pilihan/tautan yang tersimpan; '' = belum diketahui */
function schKode(){
 var u=window.S&&S.user;
 if(u){var k=String(u.sekolah||'').toUpperCase();if(SCH_LIST[k])return k}
 return schTersimpan();
}
function schCfg(){return SCH_LIST[schKode()]||null}
/* untuk kop, cetak, dan ekspor: selalu ada sekolah; bila belum diketahui dipakai Medina (tampilan lama) */
function schEf(){return schCfg()||SCH_LIST.MEDINA}
function schNama(){return schEf().nama}

/* objek SEK dipakai kop cetak; nilainya mengikuti sekolah aktif */
var SEK={get nama(){return schEf().nama},get program(){return schEf().program},get alamat(){return schEf().alamat}};

/* terapkan identitas sekolah aktif ke logo, judul, ikon, dan manifest PWA */
function schTerap(){
 var c=schEf(),k=schCfg();
 LOGO=c.logo;
 try{
  document.title='KBM Praktik TBSM | '+(k?k.nama:'SMKS Darul Fatwa & SMKS Medina Bandung');
  var set=function(sel,attr,val){var el=document.querySelector(sel);if(el&&val)el.setAttribute(attr,val)};
  if(k){set('link[rel="icon"]','href',k.file);set('link[rel="apple-touch-icon"]','href',k.icon);set('link[rel="manifest"]','href',k.manifest)}
 }catch(e){}
}
/* simpan sekolah akun saat masuk agar tampilan login berikutnya sudah berlogo sekolahnya */
function schMasuk(u){
 var k=String((u&&u.sekolah)||'').toUpperCase();
 if(SCH_LIST[k])schSimpan(k);
 schTerap();
}
/* admin: pilih sekolah yang sedang dikelola */
function schGanti(k){
 if(!SCH_LIST[k])return;
 schSimpan(k);schTerap();
 if(typeof syncRoster==='function')syncRoster();
 if(typeof render==='function')render();
}
function schPill(){
 if(!(window.S&&S.user&&schLintas(S.user)))return '';
 var c=schEf();
 return '<button type="button" class="pill glass role" data-act="schswitch" aria-label="Sekolah dikelola: '+c.nama+'. Ketuk untuk berganti sekolah">'+c.pendek+'</button>';
}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act="schswitch"]');if(!b)return;
 e.preventDefault();
 var cur=schKode()||'MEDINA',i=SCH_URUT.indexOf(cur);
 schGanti(SCH_URUT[(i+1)%SCH_URUT.length]);
 if(typeof toast==='function')toast('Mengelola '+schNama());
});

/* ---- penyaring data: akun tanpa sekolah tetap tampil di kedua sekolah sampai diisi ---- */
function schAkunOk(u){
 var k=schKode();if(!k||!u)return true;
 var s=String(u.sekolah||'').toUpperCase();
 return !SCH_LIST[s]||s===k;
}
function schPeta(){
 var m={};(window.S&&S.users||[]).forEach(function(u){var s=String(u.sekolah||'').toUpperCase();if(SCH_LIST[s])m[u.id]=s});return m;
}
function schHasilOk(r,m){
 var k=schKode();if(!k)return true;
 var s=r&&r.sid&&m[r.sid];return !s||s===k;
}
function schOpt(sel,adminSaja){
 var o='<option value="">Belum diatur</option>'+SCH_URUT.map(function(k){return '<option value="'+k+'"'+(sel===k?' selected':'')+'>'+SCH_LIST[k].nama+'</option>'}).join('');
 if(adminSaja)o+='<option value="ALL"'+(sel==='ALL'?' selected':'')+'>Semua sekolah (lintas)</option>';
 return o;
}

/* pilihan sekolah untuk sesi ujian, modul LKPD, dan unit UKK: kosong = dipakai bersama oleh semua sekolah */
function schOptModul(sel){
 sel=String(sel||'').toUpperCase();
 return '<option value="">Semua sekolah (bersama)</option>'+SCH_URUT.map(function(k){return '<option value="'+k+'"'+(sel===k?' selected':'')+'>'+SCH_LIST[k].nama+'</option>'}).join('');
}
function schLabelModul(v){v=String(v||'').toUpperCase();return SCH_LIST[v]?SCH_LIST[v].pendek:'Semua sekolah'}
