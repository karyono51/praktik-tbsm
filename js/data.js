/* Data kurikulum, rubrik, dan perhitungan nilai (dari versi awal) */
var KELAS = {
  X:   {fase:'E', judul:'Kelas X',   sub:'Fase E · Dasar'},
  XI:  {fase:'F', judul:'Kelas XI',  sub:'Fase F · Mesin & sasis'},
  XII: {fase:'F', judul:'Kelas XII', sub:'Fase F · EMS & kesiapan UKK'}
};
var ASPEK = {
  P:{n:'Persiapan & K3', w:20},
  R:{n:'Proses kerja (SOP)', w:50},
  H:{n:'Hasil kerja', w:20},
  S:{n:'Sikap & waktu', w:10}
};
var COMMON_P = [
  ['Memakai wearpack, sepatu kerja, dan APD sesuai jenis pekerjaan', 1],
  ['Memposisikan unit dengan aman (standar tengah atau rem parkir, mesin mati) dan menata area kerja', 1],
  ['Menyiapkan serta memeriksa kelayakan alat dan bahan', 0],
  ['Merujuk buku manual atau SOP pekerjaan', 0]
];
var COMMON_S = [
  'Menyelesaikan pekerjaan dalam waktu yang ditentukan',
  'Membersihkan area kerja dan mengembalikan alat ke tempatnya',
  'Mengisi lembar kerja dengan lengkap dan jujur'
];
var JOBS = [
 {id:'X-1',kelas:'X',judul:'Pemeriksaan baterai dan sistem starter',unit:'Unit sepeda motor starter',menit:45,
  steps:[['Melepas terminal negatif baterai lebih dulu sebelum kabel lain',1],['Memeriksa kondisi terminal, kebersihan, dan ketinggian cairan baterai',0],['Mengukur tegangan baterai dengan multimeter dan membandingkan dengan spesifikasi',0],['Memeriksa relay starter dan kabel ke motor starter',0],['Memasang kembali terminal: positif lebih dulu, negatif terakhir',1]],
  hasil:[['Mesin dapat distarter normal setelah pemasangan',0],['Hasil ukur dicatat sesuai satuan dan spesifikasi',0]]},
 {id:'X-2',kelas:'X',judul:'Pengukuran dengan jangka sorong dan mikrometer',unit:'Piston, pin piston, dan blok silinder',menit:40,
  steps:[['Membersihkan komponen dan alat ukur sebelum mengukur',0],['Memeriksa dan mengkalibrasi nol alat ukur',0],['Menempatkan alat ukur pada titik ukur yang benar',0],['Membaca skala utama dan skala nonius dengan tepat',0],['Mengukur ulang minimal dua kali untuk memastikan hasil',0]],
  hasil:[['Hasil pengukuran sesuai nilai pembanding asesor',0],['Kesimpulan layak atau tidak layak pakai ditulis dengan alasan',0]]},
 {id:'X-3',kelas:'X',judul:'Pemeriksaan dan penyetelan rantai roda belakang',unit:'Sepeda motor tipe sport',menit:40,
  steps:[['Memeriksa keausan rantai dan gigi sproket',0],['Mengukur kekenduran rantai pada titik yang ditentukan buku manual',0],['Mengendurkan mur as roda belakang dan menyetel kekenduran',0],['Memastikan roda lurus dengan tanda penyetel kiri dan kanan',1],['Mengencangkan mur as dengan torsi sesuai spesifikasi',1],['Melumasi rantai dengan pelumas yang sesuai',0]],
  hasil:[['Kekenduran rantai berada dalam batas spesifikasi',0],['Roda berputar bebas tanpa suara rantai abnormal',0]]},
 {id:'XI-1',kelas:'XI',judul:'Tune-up mesin empat langkah',unit:'Sepeda motor injeksi atau karburator',menit:90,
  steps:[['Memeriksa dan membersihkan filter udara',0],['Melepas busi, memeriksa kondisi dan mengukur celah elektroda',0],['Memeriksa tekanan kompresi dengan alat yang benar',0],['Menyetel celah katup pada kondisi mesin dingin dan posisi TMA',1],['Memasang busi dengan torsi sesuai spesifikasi',0],['Memeriksa dan menyetel putaran idle',0]],
  hasil:[['Mesin hidup halus pada putaran idle sesuai spesifikasi',0],['Data hasil pemeriksaan dibandingkan dengan nilai standar',0]]},
 {id:'XI-2',kelas:'XI',judul:'Penggantian pad rem cakram depan',unit:'Sepeda motor tipe sport',menit:60,
  steps:[['Melepas kaliper dengan urutan yang benar tanpa merusak selang rem',1],['Memeriksa ketebalan pad, piringan, dan kondisi piston kaliper',0],['Mendorong piston kaliper kembali dan memasang pad baru',0],['Memasang kaliper dan mengencangkan baut dengan torsi',1],['Memeriksa level minyak rem dan memompa tuas hingga terasa keras',1]],
  hasil:[['Rem bekerja normal tanpa bunyi dan tanpa seret',1],['Piringan dan pad bebas dari minyak dan gemuk',0]]},
 {id:'XI-3',kelas:'XI',judul:'Pembongkaran dan pemasangan komponen CVT',unit:'Sepeda motor matic atau engine stand matic',menit:90,
  steps:[['Melepas cover CVT dan komponen penghalang dengan urutan benar',0],['Memakai kunci khusus dan menahan puli saat mengendurkan mur',0],['Memeriksa V-belt, roller, kampas kopling, dan pegas',0],['Mengukur keausan komponen dan membandingkan dengan batas servis',0],['Memasang kembali komponen dan mengencangkan mur dengan torsi',1]],
  hasil:[['Motor berjalan halus tanpa hentakan atau suara abnormal',0],['Komponen yang aus dicatat dan direkomendasikan penggantian',0]]},
 {id:'XII-1',kelas:'XII',judul:'Servis berkala sesuai buku pedoman reparasi',unit:'Sepeda motor matic injeksi',menit:120,
  steps:[['Menentukan item servis sesuai jarak tempuh pada buku pedoman',0],['Mengganti oli mesin dan menguras sesuai prosedur',1],['Memeriksa dan membersihkan filter udara dan busi',0],['Memeriksa sistem rem, ban, rantai atau belt, dan lampu-lampu',0],['Memeriksa baterai, kelistrikan, dan kebocoran fluida',0],['Mengecek tekanan angin ban dan baut-baut penting',1]],
  hasil:[['Seluruh item servis terlaksana sesuai pedoman',0],['Hasil uji jalan atau uji fungsi dicatat dan kondisi motor layak jalan',1]]},
 {id:'XII-2',kelas:'XII',judul:'Diagnosis sistem EFI dan pemeriksaan pompa bahan bakar',unit:'Sepeda motor matic dengan electronic injection',menit:90,
  steps:[['Menghubungkan alat scan dengan benar dan membaca kode gangguan (DTC)',0],['Membaca data sensor dan mencatat nilai yang tidak normal',0],['Memeriksa tegangan dan arus pompa bahan bakar',0],['Mengukur tekanan bahan bakar dengan alat yang sesuai dan melepas tekanan lebih dulu',1],['Menentukan sumber gangguan dan tindakan perbaikan secara runtut',0]],
  hasil:[['Diagnosis sesuai kondisi unit yang dipasangi gangguan oleh asesor',0],['Kode gangguan dihapus dan unit diuji ulang setelah perbaikan',0]]},
 {id:'XII-3',kelas:'XII',judul:'Pengukuran diameter silinder dan keausan',unit:'Blok silinder motor',menit:60,
  steps:[['Membersihkan silinder dan menyiapkan cylinder bore gauge atau mikrometer dalam',0],['Mengkalibrasi alat ukur sebelum dipakai',0],['Mengukur pada tiga ketinggian dan dua arah (sejajar dan tegak lurus poros)',0],['Menghitung ovalitas dan keausan silinder',0],['Membandingkan hasil dengan batas servis dan menentukan tindakan',0]],
  hasil:[['Hasil ukur dan perhitungan sesuai nilai pembanding asesor',0],['Keputusan (tetap pakai, honing, atau bor-up) tertulis dengan alasan',0]]},
 {id:'XII-4',kelas:'XII',judul:'Pemeriksaan keselamatan dan perawatan dasar sepeda motor listrik',unit:'Unit sepeda motor listrik (latihan non-tegangan)',menit:60,
  steps:[['Menonaktifkan sistem tegangan tinggi sesuai prosedur pabrikan sebelum bekerja',1],['Memakai sarung tangan isolasi dan memastikan tidak ada tegangan dengan alat ukur',1],['Memeriksa kondisi kabel, konektor, dan penutup isolasi',0],['Memeriksa baterai traksi secara visual: bengkak, kebocoran, dan konektor',0],['Memeriksa rem, ban, dan sistem pengisian daya',0]],
  hasil:[['Sistem diaktifkan kembali sesuai prosedur dan unit berfungsi normal',1],['Temuan pemeriksaan dicatat dan kondisi bahaya dilaporkan',0]]},
 {id:'X-4',kelas:'X',judul:'Prosedur K3 dan lingkungan di bengkel',unit:'Area bengkel dan unit sepeda motor',menit:30,skkni:'OTO.SM01.001.01',
  steps:[['Mengidentifikasi bahaya di area kerja (lantai licin, tumpahan, kabel berserakan)',0],['Memilih APD sesuai pekerjaan dan memeriksa kelayakannya',1],['Menangani bahan bakar, oli bekas, dan limbah sesuai prosedur lingkungan',1],['Menunjukkan lokasi dan cara memakai APAR serta kotak P3K',1],['Menyimpan alat dan bahan berbahaya pada tempat yang benar',0]],
  hasil:[['Area kerja bebas bahaya dan tumpahan setelah pekerjaan',0],['Laporan bahaya atau kejadian ditulis dengan benar',0]]},
 {id:'X-5',kelas:'X',judul:'Membaca dan memahami gambar teknik',unit:'Gambar kerja komponen dan diagram kelistrikan',menit:40,skkni:'OTO.SM01.002.01',
  steps:[['Mengenali jenis garis, simbol, dan skala pada gambar',0],['Membaca proyeksi dan tampak komponen',0],['Membaca ukuran, toleransi, dan tanda pengerjaan',0],['Membaca diagram kelistrikan sepeda motor (simbol dan kode warna kabel)',0],['Mencocokkan gambar dengan komponen yang sebenarnya',0]],
  hasil:[['Menyebut ukuran dan toleransi komponen dengan benar',0],['Menjelaskan bagian-bagian gambar kepada asesor dengan tepat',0]]},
 {id:'X-6',kelas:'X',judul:'Penggunaan dan perawatan alat tangan bengkel',unit:'Kunci pas, ring, soket, kunci torsi, standar unit',menit:40,skkni:'OTO.SM01.003.01',
  steps:[['Memilih jenis dan ukuran kunci sesuai baut',0],['Memakai kunci torsi dengan benar dan urutan pengencangan yang tepat',1],['Memakai obeng, tang, dan palu sesuai fungsinya',0],['Memakai standar atau dongkrak dengan aman',1],['Membersihkan, melumasi, dan menyimpan alat',0]],
  hasil:[['Tidak ada baut atau kepala baut yang rusak',0],['Alat lengkap dan layak pakai setelah dipakai',0]]},
 {id:'XI-4',kelas:'XI',judul:'Pemeliharaan engine dan komponennya',unit:'Sepeda motor empat langkah',menit:90,skkni:'OTO.SM02.001.01',
  steps:[['Memeriksa kebocoran oli, gasket, dan seal',0],['Mengganti oli mesin dan filter oli sesuai spesifikasi',1],['Memeriksa tekanan kompresi dan membandingkan dengan standar',0],['Memeriksa suara mesin dan kondisi rantai keteng',0],['Memeriksa dudukan mesin dan baut penguat',0]],
  hasil:[['Level oli tepat pada batas ukur',1],['Tidak ada kebocoran setelah mesin dihidupkan',0]]},
 {id:'XI-5',kelas:'XI',judul:'Pemeliharaan sistem pendingin',unit:'Sepeda motor berpendingin cairan',menit:60,skkni:'OTO.SM02.004.01',
  steps:[['Memeriksa level dan kondisi cairan pendingin saat mesin dingin, tidak membuka tutup radiator saat panas',1],['Memeriksa selang, klem, radiator, dan tutup radiator',0],['Memeriksa kipas, thermostat, dan sensor suhu',0],['Menguras dan mengisi cairan pendingin sesuai spesifikasi, lalu membuang udara dari sistem',0],['Menguji kebocoran sistem dengan tester tekanan',0]],
  hasil:[['Level cairan pendingin sesuai batas',0],['Tidak ada kebocoran dan suhu kerja normal',0]]},
 {id:'XI-6',kelas:'XI',judul:'Pemeliharaan sistem bahan bakar bensin',unit:'Sepeda motor karburator atau injeksi',menit:75,skkni:'OTO.SM02.006.01',
  steps:[['Memeriksa kebocoran tangki, selang, dan kran bahan bakar',1],['Memeriksa dan membersihkan saringan bahan bakar',0],['Memeriksa kerja pompa dan aliran bahan bakar',0],['Membersihkan filter udara serta throttle body atau bagian luar karburator',0],['Menyetel putaran idle dan campuran sesuai spesifikasi',0]],
  hasil:[['Tidak ada kebocoran bahan bakar setelah pekerjaan',1],['Mesin hidup stabil pada putaran idle',0]]},
 {id:'XI-7',kelas:'XI',judul:'Pemeriksaan sistem kemudi',unit:'Sepeda motor dengan fork teleskopik',menit:45,skkni:'OTO.SM02.017.01',
  steps:[['Mengangkat roda depan dengan aman dan memeriksa kebebasan putaran kemudi',1],['Memeriksa kelonggaran bearing kemudi (steering stem)',0],['Memeriksa kelurusan setang dan fork',0],['Memeriksa kebocoran seal shock depan',0],['Menyetel kekencangan mur kemudi sesuai spesifikasi',0]],
  hasil:[['Kemudi berputar halus tanpa celah atau seret',1],['Hasil pemeriksaan dan rekomendasi dicatat',0]]},
 {id:'XI-8',kelas:'XI',judul:'Pelepasan, pemasangan, dan penyetelan roda',unit:'Sepeda motor tipe sport atau matic',menit:60,skkni:'OTO.SM02.022.01',
  steps:[['Menopang unit dengan aman sebelum melepas roda',1],['Melepas as roda, spacer, dan komponen rem dengan urutan benar',0],['Memeriksa bearing roda, ban, dan kondisi pelek',0],['Memasang roda dan mengencangkan mur as dengan torsi spesifikasi',1],['Memeriksa lurus putaran roda dan ketegangan jari-jari bila ada',0]],
  hasil:[['Roda berputar bebas dan tidak oleng',0],['Rem berfungsi normal setelah roda terpasang kembali',1]]},
 {id:'XII-5',kelas:'XII',judul:'Perbaikan dan overhaul karburator',unit:'Karburator sepeda motor',menit:90,skkni:'OTO.SM02.007.01',
  steps:[['Menutup kran bahan bakar dan menampung sisa bensin saat melepas karburator',1],['Membongkar karburator urut dan menata komponen',0],['Membersihkan spuyer dan saluran dengan cairan pembersih dan udara bertekanan, bukan kawat',0],['Memeriksa jarum skep, katup pelampung, dan diafragma',0],['Merakit kembali, menyetel tinggi pelampung dan sekrup udara',0]],
  hasil:[['Karburator terpasang tanpa kebocoran bahan bakar',1],['Respons gas normal dan putaran idle stabil',0]]},
 {id:'XII-6',kelas:'XII',judul:'Perbaikan sistem pengapian',unit:'Sepeda motor sistem CDI atau ECU',menit:75,skkni:'OTO.SM02.033.01',
  steps:[['Memeriksa busi, kabel busi, dan tutup busi',0],['Menghindari sentuhan terminal tegangan tinggi saat mesin hidup atau distarter',1],['Memeriksa koil pengapian dengan multimeter (resistansi primer dan sekunder)',0],['Memeriksa pulser dan koil pengisi terhadap spesifikasi',0],['Memeriksa unit CDI atau ECU dan konektornya',0],['Memeriksa saat pengapian dengan timing light',0]],
  hasil:[['Percikan api kuat dan konsisten',0],['Mesin hidup normal setelah perbaikan',0]]},
 {id:'XII-7',kelas:'XII',judul:'Overhaul sistem transmisi manual',unit:'Engine stand tipe bebek atau sport',menit:120,skkni:'OTO.SM02.013.01',
  steps:[['Menguras oli dan membuka crankcase sesuai urutan buku manual',0],['Memeriksa gigi, garpu persneling, dan poros terhadap batas servis',0],['Mengukur celah dan keausan komponen',0],['Merakit kembali dengan urutan, shim, dan pelumasan yang benar',0],['Mengencangkan baut crankcase dengan urutan dan torsi spesifikasi',1]],
  hasil:[['Perpindahan gigi mulus pada semua tingkat',0],['Tidak ada kebocoran oli atau bunyi abnormal',0]]}
];
/* Kode unit SKKNI untuk unit yang sudah ada */
(function(){var m={'X-1':'OTO.SM02.026.01','X-2':'OTO.SM01.006.01','X-3':'OTO.SM02.024.01','XI-2':'OTO.SM02.014.01'};JOBS.forEach(function(j){if(m[j.id])j.skkni=m[j.id]})})();
JOBS.forEach(function(j){
  var it=[],n=0;
  COMMON_P.forEach(function(c){it.push({id:j.id+'-'+(n++),a:'P',t:c[0],k:!!c[1]})});
  j.steps.forEach(function(c){it.push({id:j.id+'-'+(n++),a:'R',t:c[0],k:!!c[1]})});
  j.hasil.forEach(function(c){it.push({id:j.id+'-'+(n++),a:'H',t:c[0],k:!!c[1]})});
  COMMON_S.forEach(function(c){it.push({id:j.id+'-'+(n++),a:'S',t:c,k:false})});
  j.items=it;
  it.forEach(function(i){i.m=/mengukur|pengukuran|hasil ukur|torsi|celah|tekanan|kekenduran|resistansi|putaran idle|tinggi pelampung|membaca skala/i.test(i.t)});
});
function jobById(id){return JOBS.filter(function(j){return j.id===id})[0]}

/* ===== Penilaian: kompeten bila semua butir wajib terpenuhi dan skor >= KKM ===== */
function calc(job,checks,kkm){
  var by={},crit=[],unmet=[];
  Object.keys(ASPEK).forEach(function(a){by[a]={y:0,n:0}});
  job.items.forEach(function(i){
    var ok=checks[i.id]===1;
    by[i.a][ok?'y':'n']++;
    if(!ok){unmet.push(i); if(i.k)crit.push(i)}
  });
  var score=0;
  Object.keys(ASPEK).forEach(function(a){var t=by[a].y+by[a].n;score+=ASPEK[a].w*(t?by[a].y/t:0)});
  score=Math.round(score);
  return {score:score,by:by,crit:crit,unmet:unmet,kompeten:crit.length===0&&score>=kkm};
}
