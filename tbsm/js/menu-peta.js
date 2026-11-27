/* menu-peta.js: SATU SUMBER susunan menu. Dipakai laci menu (menu-dasbor.js), judul dan breadcrumb (judul-menu.js),
   serta alamat dan judul tab (rute.js).
   Memindah menu ke kelompok lain: cukup pindahkan id-nya di MENU_KELOMPOK.
   Menu baru: tambahkan id ke kelompoknya, lalu alamat dan nama pendeknya di MENU_ITEM.
   Peta ini TIDAK mengatur hak akses; baris menu tetap dibuat (atau tidak) oleh modul masing-masing sesuai peran. */
/* keys = id baris; pre = awalan id (menu per kelas); urutan di sini = urutan tampil (keys, lalu pre, lalu post) */
var MENU_KELOMPOK=[
 {key:'home',label:'',keys:['beranda','barcode','ruangujian']},
 {key:'ajar',label:'Pembelajaran',siswa:'Pembelajaran saya',ic:'kelas',pre:['lkpd:'],post:['absensi']},
 {key:'ukk',label:'Uji Kompetensi (UKK)',ic:'kelas',pre:['kelas:'],post:['observasi-ukk','nilai-akhir-ukk']},
 {key:'uji',label:'CBT dan bank soal',siswa:'Latihan dan CBT',ic:'menu',keys:['banksoal','cbtonline','riwayatlatihan']},
 {key:'nilai',label:'Nilai dan laporan',siswa:'Nilai dan acuan',ic:'rekap',keys:['rekap','kompetensi'],postSiswa:['acuan']},
 {key:'pkl',label:'Praktik Kerja Lapangan',ic:'pkl',keys:['pkl'],compact:true},
 {key:'obs',label:'Supervisi',ic:'observasi',keys:['observasi','observasi-siswa']},
 {key:'akd',label:'Administrasi Akademik',ic:'akdTata',keys:['akd-guru','akd-kelas','akd-siswa','akd-mapel','akd-lkpd','akd-tata'],compact:true},
 {key:'alm',label:'Alumni dan Tracer',ic:'alumni',keys:['alumni'],compact:true},
 {key:'sys',label:'Pengaturan',ic:'menu',keys:['acuan','akun','hapusnilai','logaudit','sinkron']},
 {key:'app',label:'Akun dan aplikasi',ic:'keluar',keys:['tampilan','gantisandi','segarkan','perbarui'],compact:true},
 {key:'keluar',label:'',keys:['keluar'],compact:true}
];
/* id: [alamat setelah #, nama untuk judul tab] */
var MENU_ITEM={
 beranda:['','Beranda'],ruangujian:['ruang-ujian','Ruang ujian'],absensi:['absensi','Absensi'],
 'observasi-ukk':['observasi-ukk','Observasi UKK'],'nilai-akhir-ukk':['nilai-akhir-ukk','Rekap nilai akhir UKK'],
 banksoal:['bank-soal','Bank soal'],cbtonline:['cbt-online','CBT Online'],riwayatlatihan:['riwayat-latihan','Riwayat latihan siswa'],
 rekap:['rekap-nilai','Rekap nilai'],kompetensi:['rekap-kompetensi','Rekap kompetensi siswa'],pkl:['pkl','Praktik Kerja Lapangan'],
 observasi:['observasi-guru','Observasi guru'],'observasi-siswa':['observasi-lkpd','Observasi LKPD Praktik'],
 'akd-guru':['akademik-guru','Akademik: Guru'],'akd-kelas':['akademik-rombel','Akademik: Rombel'],'akd-siswa':['akademik-siswa','Akademik: Siswa'],
 'akd-mapel':['akademik-mapel','Akademik: Mata pelajaran'],'akd-lkpd':['akademik-lkpd','Akademik: LKPD'],'akd-tata':['akademik-tata','Akademik: Tata kelola'],
 alumni:['alumni','Alumni dan Tracer'],acuan:['acuan','Acuan dan aturan'],akun:['akun','Akun'],hapusnilai:['hapus-nilai','Hapus nilai'],
 logaudit:['log-audit','Log audit'],sinkron:['cek-sinkronisasi','Cek sinkronisasi']
};
function menuKelompok(id,siswa){
 for(var i=0;i<MENU_KELOMPOK.length;i++){
  var g=MENU_KELOMPOK[i];
  if(siswa&&g.postSiswa&&g.postSiswa.indexOf(id)>-1)return g;
  if(siswa&&id==='acuan')continue;
  if([].concat(g.keys||[],g.post||[]).indexOf(id)>-1)return g;
  if((g.pre||[]).some(function(p){return String(id).indexOf(p)===0}))return g;
 }
 return null;
}
function menuLabel(g,siswa){return g?((siswa&&g.siswa)||g.label):''}
