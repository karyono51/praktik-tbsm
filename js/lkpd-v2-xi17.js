/* lkpd-v2-xi17.js: LKPD v2 LKPD-XI-17 (Perawatan dan Perbaikan Sistem Transmisi Manual), Kelas XI Genap, TP XI.3.2. Hanya DATA, ditambahkan ke LKPD_EXTRA_MODULES.
   Mengikuti Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx: LKPD-XI-17 = pecahan transmisi manual dari LKPD-XI-18 revisi2, 18 JP (pembagian 18 + 18 JP adalah usulan), unit SKKNI 051 (level 3, di atas level 2).
   Dimuat setelah lkpd-v2-x06.js dan sebelum lkpd.js. Struktur mengikuti master LKPD V2 (LKPD-X-06). Status awal Draft.
   Angka spesifikasi komponen (standar, batas pakai, jenis dan jumlah oli) sengaja KOSONG: guru mengisinya dari manual servis. Angka pada soal hanya contoh hitung.
   Rujukan SKKNI 147/2019 hanya usulan pemetaan dan perlu diverifikasi sebelum dipakai untuk asesmen.
   3 pertemuan x 6 JP (270 menit, 45 menit per JP) = 18 JP, sesuai 6 JP per pertemuan Kelas XI. Pertemuan 1 = materi, gerbang, APD + Kegiatan 1; Pertemuan 2 = Kegiatan 2 dan 3 (dua kartu); Pertemuan 3 = Kegiatan 4, analisis, penilaian kinerja, refleksi. */
(function(){
 var langkah=[
  {k:1,m:10,t:'Cek kondisi engine/trainer dan alat; kuras oli transmisi ke wadah, catat warna, kekentalan, dan ada tidaknya serbuk logam',p:'Engine dingin; oli bekas ke wadah limbah'},
  {k:1,m:30,t:'Buka cover dan bongkar poros transmisi sesuai urutan manual servis; susun komponen berurutan di baki',p:'Foto sebelum dibongkar; jangan memukul poros',saksi:1},
  {k:1,m:20,t:'Bersihkan komponen dan periksa visual gigi (aus, retak, ujung gigi tumpul)',p:'Gigi dipegang dari sisi, jari tidak di antara gigi'},
  {k:2,m:15,t:'Periksa garpu pemilih, shift drum, dan bearing (aus, bengkok, alur, putaran bearing)',p:'Putar bearing dengan tangan; periksa ujung garpu'},
  {k:2,m:30,t:'Ukur tebal ujung garpu pemilih dan lebar alur gigi geser, masing-masing 3 kali; catat pada tabel F1',p:'Rahang jangka sorong tegak lurus; nol alat dicek',saksi:1},
  {k:2,m:15,t:'Bandingkan hasil dengan standar manual servis dan putuskan Sesuai atau Tidak sesuai',p:'Standar dari manual servis, bukan dugaan'},
  {k:3,m:10,t:'Pasang dial gauge pada dudukan, letakkan poros transmisi pada blok V, beri pratekan, nolkan bezel',p:'Poros ukur tegak lurus, dudukan stabil'},
  {k:3,m:25,t:'Putar poros perlahan satu putaran; catat bacaan terbesar dan terkecil; hitung keolengan pada tabel F2',p:'Putar perlahan, jangan terbentur',saksi:1},
  {k:3,m:15,t:'Periksa alur spline dan bearing poros; putuskan setel, perbaiki, atau ganti',p:'Alasan keputusan dicatat pada analisis'},
  {k:4,m:25,t:'Pasang kembali poros dan cover berurutan kebalikan bongkar; periksa perpindahan gigi dengan tangan',p:'Urutan pasang kebalikan urutan bongkar',saksi:1},
  {k:4,m:10,t:'Isi oli transmisi sesuai jenis dan jumlah pada manual servis',p:'Jenis dan jumlah oli dari manual, bukan dugaan'},
  {k:4,m:15,t:'Uji fungsi atas izin guru: gigi masuk dan keluar halus, tidak loncat, tidak ada bunyi kasar',p:'Tangan dijauhkan dari bagian berputar',saksi:1},
  {k:4,m:10,t:'Rapikan area (5R), pisahkan oli bekas dan majun kotor ke wadah limbah',p:'Oli bekas tidak dibuang ke saluran air'}
 ];
 /* Menit tiap kegiatan = jumlah menit langkahnya; angka pada target pertemuan dan rubrik dicocokkan dengan ini (diuji). */
 function jumMenit(ks){return langkah.filter(function(x){return ks.indexOf(x.k)>-1}).reduce(function(t,x){return t+x.m},0)}
 var kegiatan=['Pembongkaran dan pemeriksaan gigi','Garpu pemilih, shift drum, dan bearing','Keolengan poros dengan dial gauge','Perakitan, oli, dan uji fungsi'];
 var m={
  id:'LKPD-XI-17',version:2,kelas:'XI',fase:'F',status:'draft',active:false,tahap:true,mode:'ujian',
  title:'Perawatan dan Perbaikan Sistem Transmisi Manual',
  unit:'Sistem transmisi manual',duration:810,
  skkni:'unit 051 (level 3, di atas level 2; usulan, verifikasi)',
  objectives:['Menjelaskan fungsi, komponen, dan cara kerja transmisi manual.','Membongkar, memeriksa, dan memasang komponen transmisi manual sesuai manual servis.','Mengukur garpu pemilih, alur gigi geser, dan keolengan poros, lalu membandingkannya dengan standar dari manual servis.','Menentukan tindakan (setel, perbaiki, ganti) berdasarkan hasil ukur dan menyampaikan alasannya.','Merakit kembali, mengisi oli, menguji fungsi, dan menerapkan K3 serta 5R selama praktik.'],
  theory:[
   ['Pertanyaan pemantik','Mengapa sepeda motor bebek perlu memindah gigi, dan apa yang terjadi di dalam bak transmisi saat pedal perseneling diinjak? Apa akibatnya bila gigi sering loncat atau susah masuk? Gejala apa yang pernah kamu rasakan atau dengar dari transmisi yang bermasalah?'],
   ['Fungsi dan rasio gigi','Transmisi memindahkan dan mengubah tenaga engine ke roda. Rasio gigi = jumlah gigi yang digerakkan ÷ jumlah gigi penggerak. Rasio total = rasio primer × rasio gigi × rasio akhir. Putaran roda = putaran engine ÷ rasio total.'],
   ['Komponen dan cara kerja','Pedal perseneling menggerakkan shift drum. Alur pada shift drum menggerakkan garpu pemilih, dan garpu menggeser gigi geser pada poros sehingga gigi yang dipilih terkunci dengan poros. Poros ditumpu bearing. Oli transmisi melumasi dan mendinginkan gigi.'],
   ['Gejala, penyebab, dan perawatan','Gigi loncat: garpu atau alur gigi geser aus. Susah masuk gigi: garpu bengkok atau oli tidak sesuai. Bunyi kasar: gigi atau bearing aus. Serbuk logam pada oli menandakan keausan. Jenis dan jumlah oli serta interval penggantian mengikuti manual servis.'],
   ['Alat ukur pada praktik','Jangka sorong untuk tebal garpu dan lebar alur: periksa nol, rahang tegak lurus, ukur 3 kali. Dial gauge untuk keolengan poros: pasang stabil, beri pratekan, nolkan bezel, putar perlahan, keolengan = bacaan terbesar − terkecil.'],
   ['Keselamatan dan kesehatan kerja (K3) pada praktik transmisi manual','Bahaya: gigi dan poros berat dan tajam, jari terjepit saat membongkar dan memasang, oli licin dan panas, percikan oli saat cover dibuka, bagian berputar saat uji fungsi. Pengendalian: engine dingin dan terpasang kuat, sarung tangan saat memegang gigi, kacamata saat membuka cover, oli tumpah segera dilap, uji fungsi hanya atas izin guru.']
  ],
  tools:['Kunci pas, kunci ring, kunci sok, obeng','Jangka sorong dan dial gauge dengan dudukan magnet, blok V','Engine atau trainer transmisi manual, baki komponen','Majun, pembersih, wadah oli bekas, oli sesuai manual servis'],
  safety:['Pakaian praktik (wearpack) lengkap dan dikancing; lengan baju tidak menjuntai','Sepatu tertutup (sepatu safety) terpasang','Sarung tangan dipakai saat memegang gigi, poros, atau benda berminyak; dilepas saat membaca skala alat ukur','Kacamata pelindung dipakai saat membuka cover transmisi dan saat membersihkan dengan udara bertekanan','Engine dingin dan mati, dan engine atau trainer terpasang kuat sebelum dibongkar','Gigi dan poros dipegang dari sisi, jari tidak di antara gigi; poros tidak dipukul atau dijatuhkan','Cincin, gelang, dan jam tangan dilepas; rambut panjang diikat','Engine hanya dihidupkan atas izin dan dengan pengawasan guru; tangan dijauhkan dari bagian berputar','Oli tumpah segera dilap; oli bekas dan majun kotor dibuang ke wadah limbah yang disediakan','Letak APAR, kotak P3K, jalur keluar, dan titik kumpul bengkel sudah diketahui; nama guru pembimbing dicatat'],
  steps:langkah.map(function(x){return ['Kegiatan '+x.k+' · '+x.t,0,x.p]}),
  checks:[
   ['Kondisi oli transmisi dan gigi','Warna, serbuk logam, aus atau tumpul dicatat; foto kondisi'],
   ['Kondisi garpu pemilih, shift drum, dan bearing','Aus, bengkok, atau longgar dicatat; foto kondisi'],
   ['Ukuran garpu pemilih dan alur gigi geser','Rata-rata 3 kali (tabel F1) dibanding standar'],
   ['Dial gauge terpasang dengan pratekan','Poros ukur tegak lurus, dudukan stabil, bezel dinolkan'],
   ['Keolengan poros transmisi','Terbesar dikurangi terkecil (tabel F2) dibanding batas'],
   ['Perakitan dan pelumasan sesuai manual servis','Urutan benar, jenis dan jumlah oli sesuai manual; foto hasil'],
   ['Uji fungsi dan 5R','Gigi halus, tidak loncat, tidak berbunyi kasar; area bersih, limbah terpisah']
  ],
  fotoWajib:[0,1,3,5],
  symptoms:[],
  quiz:[
   {t:'isian',id:'M1',q:'Gigi penggerak pada poros primer bergigi 14 dan gigi yang digerakkan bergigi 35. Hitung rasio giginya (angka saja).',kunci:2.5,tol:0.005,u:'',e:'Rasio = gigi digerakkan ÷ gigi penggerak = 35 ÷ 14 = 2,5'},
   {t:'isian',id:'M2',q:'Rasio primer 3,0, rasio gigi yang dipakai 1,5, dan rasio akhir 2,8. Hitung rasio total (angka saja).',kunci:12.6,tol:0.005,u:'',e:'Rasio total = 3,0 × 1,5 × 2,8 = 12,6'},
   {t:'isian',id:'M3',q:'Tebal ujung garpu pemilih terukur 5,90 mm; 5,85 mm; dan 5,95 mm. Hitung rata-ratanya (2 desimal).',kunci:5.9,tol:0.005,u:'mm',e:'(5,90 + 5,85 + 5,95) ÷ 3 = 17,70 ÷ 3 = 5,90'},
   {t:'isian',id:'M4',q:'Lebar alur gigi geser 6,30 mm dan tebal ujung garpu rata-rata 5,90 mm. Hitung celah antara garpu dan alur.',kunci:0.4,tol:0.005,u:'mm',e:'6,30 − 5,90 = 0,40'},
   {t:'isian',id:'M5',q:'Dial gauge ketelitian 0,01 mm. Jarum biru menunjuk bacaan terkecil dan jarum merah bacaan terbesar pada poros transmisi. Hitung keolengan.',kunci:0.08,tol:0.005,u:'mm',e:'0,12 − 0,04 = 0,08',g:{k:'olengan',max:12,min:4}},
   {t:'isian',id:'M6',q:'Putaran engine 6.000 rpm dan rasio total transmisi 12,0. Hitung putaran roda belakang.',kunci:500,tol:0.5,u:'rpm',e:'6.000 ÷ 12,0 = 500'}
  ],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:false,evidence:false,cause:false,conclusion:false,atLeastOneCheck:true},
  v2:{
   ver:2,jenis:'jobsheet',jp:18,tp:'XI.3.2',cp:'Perawatan dan perbaikan sistem pemindah tenaga',
   pertemuan:[
    {n:1,jp:6,menit:270,judul:'Pemantik, materi transmisi manual, gerbang masuk, APD, cek alat; Kegiatan 1 pembongkaran dan pemeriksaan gigi, latihan soal 1–2',kegiatan:[1],latihan:['M1','M2'],praktik:jumMenit([1]),kartu:{judul:'Kegiatan 1 pembongkaran dan pemeriksaan gigi'}},
    {n:2,jp:6,menit:270,judul:'Kegiatan 2 garpu pemilih, shift drum, dan bearing; Kegiatan 3 keolengan poros dengan dial gauge, latihan soal 3–5',kegiatan:[2,3],latihan:['M3','M4','M5'],praktik:jumMenit([2,3]),kartu:{judul:'Kegiatan 2 garpu pemilih dan 3 keolengan poros',per:{2:'Kegiatan 2 garpu pemilih, shift drum, dan bearing',3:'Kegiatan 3 keolengan poros dengan dial gauge'}}},
    {n:3,jp:6,menit:270,judul:'Kegiatan 4 perakitan, oli, dan uji fungsi, latihan soal 6, analisis; penilaian kinerja, refleksi, remedial atau pengayaan',kegiatan:[4],latihan:['M6'],praktik:jumMenit([4]),kartu:{judul:'Kegiatan 4 perakitan, oli, dan uji fungsi'}}
   ],
   kegiatan:kegiatan,judulPendek:'Transmisi Manual',
   cekAlat:['Jangka sorong: permukaan ukur bersih, nol tepat atau penyimpangan dicatat','Dial gauge: poros ukur bergerak lancar dan kembali, jarum tidak macet, dudukan magnet dan blok V stabil','Engine atau trainer: terpasang kuat, dingin, tidak ada kebocoran oli; baki komponen dan wadah oli bekas siap'],
   tindak:{remedial:'Remedial (bila belum tuntas): ulangi latihan hitung dan pengukuran dengan soal dan komponen dari guru, lalu ulangi bongkar pasang bagian yang belum tepat.',pengayaan:'Pengayaan (bila sudah tuntas): analisis kasus gigi loncat atau susah masuk gigi, tentukan komponen yang diperiksa lebih dulu, dan putuskan setel, perbaiki, atau ganti berdasarkan batas servis.'},
   langkah:langkah.map(function(x,i){return {i:i,k:x.k,saksi:!!x.saksi,menit:x.m||0}}),
   apd:[0,1,2,3],
   k3grup:[{judul:'Alat pelindung diri (APD)',i:[0,1,2,3]},{judul:'Persiapan diri dan area kerja',i:[4,5,6]},{judul:'Larangan saat praktik',i:[7]},{judul:'Kebersihan dan keadaan darurat',i:[8,9]}],
   cekK:[1,2,2,3,3,4,4],
   gate:{qs:[
    {t:'pg',lvl:'Aplikasi',q:'Gigi 3 sebuah sepeda motor sering loncat saat dipacu. Hasil ukur tebal ujung garpu pemilih 5,70 mm, sedangkan batas pakai pada manual servis minimal 5,80 mm. Tindakan dan alasan yang paling tepat adalah ...',
     o:['mengganti garpu pemilih, karena garpu di bawah batas pakai longgar pada alur sehingga gigi tidak terkunci','menambah oli transmisi saja, karena loncat gigi hanya terjadi bila oli kurang dari batas bawah servis','mengganti kampas kopling, karena kampas yang aus menyebabkan gigi lepas dari poros saat dipacu','mengganti bearing poros, karena bearing yang longgar membuat garpu menipis dengan sendirinya saat berputar','menyetel jarak main pedal perseneling saja, karena garpu yang aus tidak memengaruhi penguncian gigi geser'],a:0,
     e:'Garpu di bawah batas pakai longgar pada alur gigi geser sehingga gigi geser tidak terkunci penuh dan loncat; garpu diganti. Pengecoh: oli kurang tidak menyebabkan gigi lepas; kampas kopling tidak mengunci gigi; bearing tidak menipiskan garpu; penyetelan pedal tidak memperbaiki garpu yang aus.'},
    {t:'pg',lvl:'Aplikasi',q:'Sebuah transmisi manual memiliki rasio primer 3,0, rasio gigi yang sedang dipakai 1,8, dan rasio akhir 2,5. Putaran engine 5.400 rpm. Putaran roda belakang adalah ...',
     o:['1.000 rpm','400 rpm','2.160 rpm','1.800 rpm','72.900 rpm'],a:1,
     e:'Rasio total = 3,0 × 1,8 × 2,5 = 13,5. Putaran roda = 5.400 ÷ 13,5 = 400 rpm. Pengecoh: A mengabaikan rasio akhir; C hanya memakai rasio akhir; D hanya memakai rasio primer; E mengalikan putaran dengan rasio.'},
    {t:'kompleks',lvl:'Penalaran',q:'Saat dikuras, oli transmisi tampak keabu-abuan dengan serbuk logam halus. Pilih semua pernyataan yang benar.',
     o:['Serbuk logam halus pada oli menandakan keausan gigi atau bearing sehingga komponen perlu diperiksa.','Cukup mengganti oli baru karena serbuk logam hilang bersama oli lama dan tidak akan muncul lagi.','Oli diganti dan penyebab keausan dicari melalui pembongkaran dan pengukuran komponen.','Oli yang lebih kental menghentikan keausan sehingga pemeriksaan komponen tidak diperlukan.','Serbuk logam termasuk normal dan tidak perlu dicatat selama gigi masih dapat dipindah.'],a:[0,2],
     e:'Serbuk logam menandakan keausan sehingga komponen diperiksa dan penyebabnya dicari, bukan hanya ganti oli. Pengecoh: B keausan tetap berlanjut; D oli kental tidak memperbaiki komponen aus; E kondisi oli selalu dicatat sebagai temuan.'},
    {t:'kategori',lvl:'Penalaran',q:'Poros transmisi diukur dengan dial gauge. Bacaan terbesar 0,12 mm dan terkecil 0,04 mm; batas keolengan pada manual servis 0,06 mm. Tentukan setiap pernyataan Benar atau Salah.',
     rows:[['Keolengan poros adalah 0,08 mm.',true],['Karena keolengan melebihi batas 0,06 mm, poros dinyatakan tidak sesuai dan perlu diluruskan atau diganti.',true],['Bacaan terbesar saja sudah cukup untuk menyimpulkan keolengan.',false],['Dial gauge boleh dipasang tanpa pratekan asalkan jarum terlihat bergerak.',false],['Poros diputar perlahan agar bacaan terbesar dan terkecil terbaca.',true]],lab:['Benar','Salah'],
     e:'Keolengan = 0,12 − 0,04 = 0,08 mm, melebihi batas 0,06 mm sehingga tidak sesuai. Keolengan diperoleh dari selisih bacaan terbesar dan terkecil, dan dial gauge diberi pratekan serta poros diputar perlahan.'},
    {t:'pg',lvl:'Aplikasi',q:'Oli transmisi hendak dikuras dari engine yang baru saja dimatikan. Langkah yang paling aman dan benar adalah ...',
     o:['menunggu engine dingin, menampung oli ke wadah, dan membuang oli bekas ke wadah limbah','menguras langsung saat engine panas memakai tangan kosong agar oli keluar lebih cepat','menguras ke lantai bengkel lalu menyiram dengan air ke saluran pembuangan','menampung oli lalu membuangnya ke selokan di luar bengkel agar area kerja tetap bersih','membiarkan oli menetes di lantai tanpa wadah selama pembongkaran sedang berlangsung'],a:0,
     e:'Engine didinginkan dulu agar tidak melepuh, oli ditampung, dan oli bekas masuk wadah limbah. Pengecoh: engine panas berbahaya; oli ke lantai atau selokan mencemari dan membuat lantai licin.'}
   ]},
   /* Hasil aktual pada Pemeriksaan dan bukti terisi otomatis dari tabel (t = id tabel, f = kolom). */
   cekAuto:{2:{t:'F1',f:'rata'},4:{t:'F2',f:'olengan'}},
   tabel:[
    {id:'F1',k:2,dec:2,judul:'F1 · Garpu pemilih dan alur gigi geser (mm)',cat:'Isi bacaan apa adanya. Rata-rata dihitung otomatis dari 3 pengukuran dan dibulatkan 2 desimal. Standar diisi dari manual servis atau guru.',baris:['Tebal ujung garpu pemilih 1','Tebal ujung garpu pemilih 2','Lebar alur gigi geser'],labelBaris:'Bagian yang diukur',
     kol:[{k:'benda',l:'Benda',t:'teks'},{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']},{k:'std',l:'Standar',t:'num'},{k:'status',l:'Status',t:'status'}]},
    {id:'F2',k:3,dec:2,judul:'F2 · Keolengan poros transmisi (mm)',baris:[''],
     kol:[{k:'benda',l:'Benda',t:'teks'},{k:'besar',l:'Terbesar',t:'num'},{k:'kecil',l:'Terkecil',t:'num'},{k:'olengan',l:'Keolengan',t:'selisih',a:'besar',b:'kecil'},{k:'batas',l:'Batas',t:'num'},{k:'status',l:'Status',t:'status'}]}
   ],
   analisis:[
    'Bandingkan hasil ukur tabel F1 dan F2 dengan standar manual servis. Bagian mana yang tidak sesuai dan apa dugaan penyebabnya?',
    'Mengapa tiap komponen diukur 3 kali dan dirata-rata? Apa arti bila ketiganya sangat berbeda?',
    'Gejala apa (gigi loncat, susah masuk, bunyi kasar) yang berhubungan dengan temuan pada garpu, alur, atau bearing?',
    'Untuk komponen yang melebihi batas pakai, tindakan apa yang kamu pilih (setel, perbaiki, ganti) dan mengapa?',
    'Apa yang kamu periksa pada oli transmisi dan apa artinya bila ada serbuk logam?',
    'Berapa waktumu dibanding waktu standar? Di langkah mana waktu terbuang?'
   ],
   refleksi:[
    'Bagian mana yang paling sulit (membongkar, mengukur, atau merakit) dan bagaimana kamu mengatasinya?',
    'Apa yang akan kamu lakukan berbeda pada praktik berikutnya?',
    'Bagaimana kerja kelompok membantu atau menghambat?',
    'Di bengkel atau DUDI, pekerjaan ini muncul pada situasi apa?'
   ],
   obs:{
    judul:'Observasi LKPD-XI-17 Transmisi Manual',
    aspek:[
     {id:'k3',ket:'Yang dinilai: APD terpasang benar (kacamata saat membuka cover), engine dingin dan terpasang kuat, jari tidak di antara gigi, tangan dijauhkan dari bagian berputar saat uji fungsi, larangan K3 dipatuhi.',n:'Persiapan dan K3',b:20,d:{4:'APD lengkap, area aman tanpa diingatkan',3:'Lengkap, diingatkan 1 kali',2:'APD kurang atau area belum aman, diingatkan lebih dari 1 kali',1:'Mengabaikan K3 (praktik dihentikan)'},stop:1},
     {id:'prosedur',ket:'Yang dinilai: urutan bongkar dan pasang sesuai manual servis, komponen disusun berurutan, penggunaan jangka sorong dan dial gauge, jenis dan jumlah oli sesuai manual servis.',n:'Prosedur kerja',b:30,d:{4:'Semua langkah urut, manual servis dipakai, tanpa bantuan',3:'Urut dengan 1–2 koreksi kecil',2:'Beberapa langkah terbalik atau terlewat',1:'Tidak mengikuti prosedur, berisiko merusak komponen'}},
     {id:'hasil',ket:'Yang dinilai: bacaan ukur benar (tabel F1, F2, dan latihan hitung), rata-rata dan keolengan terhitung, keputusan Sesuai atau Tidak sesuai berdasarkan standar guru, foto bukti ada dan jelas, uji fungsi lulus.',n:'Hasil kerja dan data',b:25,d:{4:'Data akurat, keputusan sesuai standar, uji fungsi lulus',3:'Data akurat, 1 catatan perbaikan',2:'Data tidak lengkap atau keputusan kurang tepat',1:'Data salah atau tidak ada'}},
     {id:'waktu',ket:'Acuan waktu standar: total praktik '+jumMenit([1,2,3,4])+' menit, dibagi per kegiatan (pembongkaran '+jumMenit([1])+', garpu dan bearing '+jumMenit([2])+', keolengan poros '+jumMenit([3])+', perakitan dan uji fungsi '+jumMenit([4])+'). Isi waktu aktualmu di tiap kartu kegiatan pada Lembar Kerja.',n:'Waktu dan efisiensi',b:10,d:{4:'Dalam waktu standar',3:'Hingga 125%',2:'Hingga 150%',1:'Lebih dari 150%'}},
     {id:'5r',ket:'Yang dinilai: meja bersih, komponen dan alat kembali, oli bekas dan majun kotor dipisah ke wadah limbah.',n:'5R dan limbah',b:5,d:{4:'Area bersih, alat kembali, limbah terpisah',3:'Satu hal terlewat',2:'Dua hal terlewat',1:'Area dibiarkan kotor'}},
     {id:'sikap',ket:'Yang dinilai: jujur mencatat hasil sendiri (tidak menyalin data teman), aktif, membantu teman, mengikuti arahan guru.',n:'Sikap dan kerja sama',b:10,d:{4:'Aktif, jujur, membantu teman',3:'Aktif, sesekali diingatkan',2:'Pasif',1:'Mengganggu kegiatan'}}
    ],
    indikator:[
     {t:'Menjelaskan fungsi, rasio, dan cara kerja transmisi manual',bukti:'Gerbang masuk, latihan soal 1–2'},
     {t:'Membongkar transmisi dan memeriksa gigi sesuai manual servis',bukti:'Kondisi dicatat, foto, kegiatan 1 disaksikan'},
     {t:'Mengukur garpu pemilih dan alur gigi geser dengan benar',bukti:'Tabel F1, latihan soal 3–4, disaksikan'},
     {t:'Memeriksa shift drum dan bearing',bukti:'Kondisi dicatat, foto'},
     {t:'Mengukur keolengan poros dengan dial gauge',bukti:'Tabel F2, latihan soal 5, disaksikan'},
     {t:'Menentukan tindakan setel, perbaiki, atau ganti',bukti:'Analisis 1 dan 4'},
     {t:'Merakit, mengisi oli, dan menguji fungsi sesuai manual servis',bukti:'Kegiatan 4 disaksikan, foto hasil'},
     {t:'K3, APD, 5R, dan limbah',bukti:'Daftar APD, kegiatan 4'}
    ],
    panduan:[
     {k:'Pembongkaran dan pemeriksaan gigi',lihat:'Urutan bongkar, komponen berurutan di baki, foto sebelum dibongkar',salah:'Komponen tercampur urutannya, poros dipukul, jari di antara gigi'},
     {k:'Garpu pemilih, shift drum, dan bearing',lihat:'Nol alat dicek, rahang tegak lurus, ukur 3 kali',salah:'Lupa cek nol, rahang miring, tidak mengukur'},
     {k:'Keolengan poros',lihat:'Dudukan stabil, pratekan, bezel dinolkan, poros diputar perlahan',salah:'Poros ukur tidak tegak lurus, tanpa pratekan, poros diputar cepat'},
     {k:'Perakitan dan uji fungsi',lihat:'Oli sesuai manual, tangan dijauhkan dari bagian berputar, atas izin guru',salah:'Oli diperkirakan, engine dihidupkan tanpa izin guru'}
    ],
    henti:'Hentikan praktik bila siswa mengabaikan K3 (skor 1 pada Persiapan dan K3).'
   }
  }
 };
 if(typeof LKPD_EXTRA_MODULES==='undefined')window.LKPD_EXTRA_MODULES=[];
 LKPD_EXTRA_MODULES=LKPD_EXTRA_MODULES.concat([m]);
})();
