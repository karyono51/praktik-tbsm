/* lkpd-v2-xi18.js: LKPD v2 LKPD-TSM-PMT-03 (Perawatan dan Perbaikan Sistem Transmisi Otomatis (CVT)), Kelas XI Genap, TP XI.3.2. Hanya DATA, ditambahkan ke LKPD_EXTRA_MODULES.
   Mengikuti Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx: LKPD-TSM-PMT-03 = pecahan CVT dari LKPD-TSM-PMT-03 revisi2, 18 JP (pembagian 18 + 18 JP adalah usulan), unit SKKNI 027 (level 2). Transmisi manual ada di LKPD-TSM-PMT-02.
   Dimuat setelah lkpd-v2-xi17.js dan sebelum lkpd.js. Struktur mengikuti master LKPD V2 (LKPD-DDO-ALT-02). Status awal Draft.
   Angka spesifikasi komponen (standar, batas pakai, torsi, jenis dan jumlah oli) sengaja KOSONG: guru mengisinya dari manual servis. Angka pada soal hanya contoh hitung.
   Rujukan SKKNI 147/2019 hanya usulan pemetaan dan perlu diverifikasi sebelum dipakai untuk asesmen.
   3 pertemuan x 6 JP (270 menit, 45 menit per JP) = 18 JP, sesuai 6 JP per pertemuan Kelas XI. Pertemuan 1 = materi, prasyarat, APD + Kegiatan 1; Pertemuan 2 = Kegiatan 2 dan 3 (dua kartu); Pertemuan 3 = Kegiatan 4, analisis, penilaian kinerja, refleksi. */
(function(){
 var langkah=[
  {k:1,m:10,t:'Lepas cover CVT dan penutupnya sesuai manual servis; wadahi baut menurut letaknya',p:'Engine mati dan dingin'},
  {k:1,m:25,t:'Periksa V-belt (retak, tepi aus, berminyak); ukur lebar V-belt; catat pada Pemeriksaan dan bukti',p:'Belt tidak ditekuk tajam; jangan terkena oli',saksi:1},
  {k:1,m:10,t:'Periksa permukaan sisi puli (bersih, tanpa goresan dalam) dan catat kondisinya',p:'Tanpa amplas; bersihkan dengan majun dan pembersih yang disediakan'},
  {k:1,m:10,t:'Bandingkan lebar belt dengan standar manual servis dan putuskan Sesuai atau Tidak sesuai',p:'Standar dari manual servis, bukan dugaan'},
  {k:2,m:15,t:'Lepas puli primer dan roller; periksa roller (aus datar, retak) dan slider',p:'Roller disusun berurutan agar tidak tertukar'},
  {k:2,m:25,t:'Ukur diameter dan panjang roller catat pada Pemeriksaan dan bukti',p:'Ukur pada titik yang sama tiap roller; nol alat dicek',saksi:1},
  {k:2,m:15,t:'Bandingkan berat dan keausan roller sepaket dan putuskan tindakan',p:'Roller diganti sepaket'},
  {k:3,m:10,t:'Pasang SST penahan puli dan kopling; siapkan kacamata pelindung',p:'Puli ditahan dengan SST, bukan dengan obeng'},
  {k:3,m:25,t:'Tekan pegas puli sekunder dengan SST kompresor sebelum mengendurkan mur; lepas kopling sentrifugal dan puli sekunder',p:'Pegas tertekan menyimpan tenaga: kacamata wajib, mur dikendurkan perlahan',saksi:1},
  {k:3,m:25,t:'Ukur tebal 3 kampas kopling, diameter dalam rumah kopling, dan panjang bebas pegas; catat pada Pemeriksaan dan bukti',p:'Ukur pada titik yang sama; nol alat dicek',saksi:1},
  {k:3,m:10,t:'Periksa bearing, seal, dan gerak geser puli sekunder; periksa kampas dari oli',p:'Kampas berminyak berarti ada kebocoran seal yang harus dicari'},
  {k:4,m:20,t:'Pasang puli, roller, V-belt, dan kopling sentrifugal berurutan kebalikan bongkar; V-belt dipasang menurut arah putarnya',p:'Mur dikencangkan sesuai torsi pada manual servis',saksi:1},
  {k:4,m:10,t:'Isi atau ganti oli gigi reduksi sesuai jenis dan jumlah pada manual servis',p:'Jenis dan jumlah oli dari manual, bukan dugaan'},
  {k:4,m:15,t:'Uji fungsi atas izin guru: naikkan gas bertahap, periksa kopling tidak selip dan tidak ada bunyi kasar',p:'Engine di stand; tangan dijauhkan dari bagian berputar',saksi:1},
  {k:4,m:10,t:'Rapikan area (5R), pisahkan oli bekas dan majun kotor ke wadah limbah',p:'Oli bekas tidak dibuang ke saluran air'}
 ];
 /* Menit tiap kegiatan = jumlah menit langkahnya; angka pada target pertemuan dan rubrik dicocokkan dengan ini (diuji). */
 function jumMenit(ks){return langkah.filter(function(x){return ks.indexOf(x.k)>-1}).reduce(function(t,x){return t+x.m},0)}
 var kegiatan=['Pemeriksaan V-belt','Puli primer dan roller','Puli sekunder dan kopling sentrifugal','Perakitan, oli, dan uji fungsi'];
 var m={
  id:'LKPD-TSM-PMT-03',alias:['LKPD-XI-18'],prodi:'TSM',cp:'PMT',version:2,kelas:'XI',fase:'F',status:'draft',active:false,tahap:true,mode:'ujian',
  title:'Perawatan dan Perbaikan Sistem Transmisi Otomatis (CVT)',
  unit:'Sistem transmisi otomatis (CVT)',duration:810,
  skkni:'unit 027 (usulan, verifikasi)',
  objectives:['Menjelaskan fungsi, komponen, dan cara kerja CVT pada skuter matik.','Membongkar, memeriksa, dan memasang V-belt, puli, roller, dan kopling sentrifugal sesuai manual servis.','Mengukur lebar V-belt, roller, kampas kopling, dan pegas, lalu membandingkannya dengan standar dari manual servis.','Menentukan tindakan (setel, perbaiki, ganti) berdasarkan hasil ukur dan menyampaikan alasannya.','Merakit kembali, mengisi oli gigi reduksi, menguji fungsi, dan menerapkan K3 serta 5R selama praktik.'],
  theory:[
   ['Pertanyaan pemantik','Mengapa skuter matik cukup diputar gasnya tanpa memindah gigi? Apa yang terjadi bila V-belt atau roller sudah aus? Gejala apa yang pernah kamu rasakan pada motor matik yang tarikannya berat, menghentak saat berangkat, atau berbunyi kasar?'],
   ['CVT: komponen dan cara kerja','CVT (continuously variable transmission) mengubah rasio terus-menerus tanpa tingkat gigi. Puli primer (penggerak, berisi roller) ada di poros engine; puli sekunder (digerakkan, berpegas) menyatu dengan kopling sentrifugal. Saat putaran naik, roller terlempar keluar, puli primer menutup dan mendorong V-belt ke diameter lebih besar, sedangkan puli sekunder terbuka melawan pegasnya.'],
   ['Rasio CVT','Rasio CVT = diameter efektif puli sekunder ÷ diameter efektif puli primer: tinggi saat berangkat, menurun saat melaju. Putaran puli sekunder = putaran puli primer ÷ rasio CVT.'],
   ['Kopling sentrifugal','Pada putaran rendah, pegas menahan kampas sehingga roda tidak ikut berputar. Pada putaran tertentu, gaya sentrifugal melawan pegas sehingga kampas menempel pada rumah kopling dan tenaga diteruskan ke roda. Kampas aus, berminyak, atau pegas lemah menyebabkan selip atau menghentak.'],
   ['Gejala, penyebab, dan perawatan','Tarikan berat atau ngempos: V-belt aus atau roller aus. Getaran: roller tidak sepaket atau puli kotor. Selip saat berangkat: kampas aus atau berminyak. Perawatan berkala dan jenis serta jumlah oli gigi reduksi mengikuti manual servis. V-belt tidak boleh terkena oli dan tidak boleh ditekuk tajam. Roller diganti sepaket.'],
   ['Alat ukur dan SST pada praktik','Jangka sorong dipakai seperti pada praktik alat ukur: periksa nol, baca tegak lurus. Special service tool (SST) wajib dipakai pada puli dan kopling karena pegas tertekan menyimpan tenaga.'],
   ['Keselamatan dan kesehatan kerja (K3) pada praktik CVT','Bahaya: pegas puli sekunder terlontar saat mur dilepas tanpa SST, jari terjepit puli dan V-belt, bagian berputar saat uji fungsi, oli licin, dan engine panas. Pengendalian: SST kompresor, kacamata pelindung, engine dingin saat dibongkar, tangan dijauhkan dari bagian berputar saat uji fungsi, oli tumpah segera dilap, limbah ke wadah yang disediakan.']
  ],
  tools:['Kunci pas, kunci ring, kunci sok, obeng','SST penahan puli dan kompresor pegas puli sekunder','Jangka sorong dan timbangan','Engine atau trainer CVT, baki komponen','Majun, pembersih, wadah oli bekas, oli sesuai manual servis'],
  safety:['Pakaian praktik (wearpack) lengkap dan dikancing; lengan baju tidak menjuntai','Sepatu tertutup (sepatu safety) terpasang','Sarung tangan dipakai saat memegang benda tajam, panas, atau berminyak; dilepas saat membaca skala alat ukur','Kacamata pelindung dipakai saat menekan atau melepas pegas puli sekunder dan saat uji fungsi','Engine dingin dan mati, dan engine atau trainer terpasang kuat sebelum dibongkar','SST dipakai sesuai fungsinya; pegas tertekan tidak dilepas dengan tang atau obeng','Cincin, gelang, dan jam tangan dilepas; rambut panjang diikat','Engine hanya dihidupkan atas izin dan dengan pengawasan guru; tangan dijauhkan dari bagian berputar','Oli tumpah segera dilap; oli bekas dan majun kotor dibuang ke wadah limbah yang disediakan','Letak APAR, kotak P3K, jalur keluar, dan titik kumpul bengkel sudah diketahui; nama guru pembimbing dicatat'],
  steps:langkah.map(function(x){return ['Kegiatan '+x.k+' · '+x.t,0,x.p]}),
  checks:[
   ['Kondisi V-belt','Retak, aus tepi, atau berminyak dicatat; foto kondisi'],
   ['Lebar V-belt','Hasil ukur dibanding standar'],
   ['Kondisi roller dan slider','Aus datar atau retak dicatat; foto kondisi'],
   ['Ukuran roller','Hasil ukur dibanding standar'],
   ['Kondisi kampas dan rumah kopling sentrifugal','Aus, mengkilap, atau berminyak dicatat; foto kondisi'],
   ['Ukuran kampas, rumah kopling, dan pegas','Hasil ukur dibanding standar'],
   ['Perakitan dan pelumasan sesuai manual servis','Urutan benar, torsi dan oli sesuai manual; foto hasil'],
   ['Uji fungsi dan 5R','Tidak selip dan tidak ada bunyi kasar; area bersih, limbah terpisah']
  ],
  fotoWajib:[0,2,4,6],
  symptoms:[],
  quiz:[
   {t:'isian',id:'C1',q:'Lebar V-belt baru 22,00 mm. Hasil ukur setelah dikurangi nol alat 21,10 mm. Hitung penyusutan lebar belt.',kunci:0.9,tol:0.005,u:'mm',e:'22,00 − 21,10 = 0,90'},
   {t:'isian',id:'C2',q:'Pada putaran rendah, diameter efektif puli primer 50 mm dan puli sekunder 130 mm. Hitung rasio CVT (angka saja).',kunci:2.6,tol:0.005,u:'',e:'Rasio CVT = D sekunder ÷ D primer = 130 ÷ 50 = 2,6'},
   {t:'isian',id:'C3',q:'Enam roller ditimbang bersama dan hasilnya 40,2 g. Hitung berat rata-rata satu roller.',kunci:6.7,tol:0.005,u:'g',e:'40,2 ÷ 6 = 6,7'},
   {t:'isian',id:'C4',q:'Diameter roller baru 20,00 mm dan rata-rata hasil ukur 19,70 mm. Hitung penyusutan diameter roller.',kunci:0.3,tol:0.005,u:'mm',e:'20,00 − 19,70 = 0,30'},
   {t:'isian',id:'C5',q:'Tebal tiga kampas kopling terukur 3,95 mm; 3,90 mm; dan 4,05 mm. Hitung rata-ratanya (2 desimal).',kunci:3.97,tol:0.005,u:'mm',e:'(3,95 + 3,90 + 4,05) ÷ 3 = 11,90 ÷ 3 = 3,97 (dibulatkan 2 desimal)'},
   {t:'isian',id:'C6',q:'Panjang bebas pegas kopling menurut buku manual 109,0 mm; hasil ukur 106,4 mm. Hitung penyusutan panjang pegas.',kunci:2.6,tol:0.005,u:'mm',e:'109,0 − 106,4 = 2,6'}
  ],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:false,evidence:false,cause:false,conclusion:false,atLeastOneCheck:true},
  v2:{
   ver:2,jenis:'jobsheet',jp:18,tp:'XI.3.2',cp:'Perawatan dan perbaikan sistem pemindah tenaga',
   pertemuan:[
    {n:1,jp:6,menit:270,judul:'Pemantik, materi CVT, prasyarat masuk, APD, cek alat; Kegiatan 1 pemeriksaan V-belt, latihan soal 1–2',kegiatan:[1],latihan:['C1','C2'],praktik:jumMenit([1]),kartu:{judul:'Kegiatan 1 pemeriksaan V-belt'}},
    {n:2,jp:6,menit:270,judul:'Kegiatan 2 puli primer dan roller; Kegiatan 3 puli sekunder dan kopling sentrifugal, latihan soal 3–6',kegiatan:[2,3],latihan:['C3','C4','C5','C6'],praktik:jumMenit([2,3]),kartu:{judul:'Kegiatan 2 puli primer dan 3 puli sekunder',per:{2:'Kegiatan 2 puli primer dan roller',3:'Kegiatan 3 puli sekunder dan kopling'}}},
    {n:3,jp:6,menit:270,judul:'Kegiatan 4 perakitan, oli, dan uji fungsi, analisis; penilaian kinerja, refleksi, remedial atau pengayaan',kegiatan:[4],praktik:jumMenit([4]),kartu:{judul:'Kegiatan 4 perakitan, oli, dan uji fungsi'}}
   ],
   kegiatan:kegiatan,judulPendek:'Transmisi Otomatis (CVT)',
   cekAlat:['SST penahan puli dan kompresor pegas puli sekunder: lengkap, tidak retak, pas pada puli','Jangka sorong dan timbangan: permukaan ukur bersih, nol tepat atau penyimpangan dicatat','Engine atau trainer: terpasang kuat, dingin, tidak ada kebocoran oli; baki komponen dan wadah oli bekas siap'],
   tindak:{remedial:'Remedial (bila belum tuntas): ulangi latihan hitung dan pengukuran dengan soal dan komponen dari guru, lalu ulangi bongkar pasang bagian yang belum tepat.',pengayaan:'Pengayaan (bila sudah tuntas): analisis kasus tarikan berat dan menghentak pada motor matik, tentukan komponen yang diperiksa lebih dulu, dan putuskan setel, perbaiki, atau ganti berdasarkan batas servis.'},
   langkah:langkah.map(function(x,i){return {i:i,k:x.k,saksi:!!x.saksi,menit:x.m||0}}),
   apd:[0,1,2,3],
   k3grup:[{judul:'Alat pelindung diri (APD)',i:[0,1,2,3]},{judul:'Persiapan diri dan area kerja',i:[4,5,6]},{judul:'Larangan saat praktik',i:[7]},{judul:'Kebersihan dan keadaan darurat',i:[8,9]}],
   cekK:[1,1,2,2,3,3,4,4],
   gate:{qs:[
    {t:'pg',lvl:'Aplikasi',q:'Sebuah skuter matik terasa ngempos: putaran engine naik tetapi laju lambat. Hasil ukur lebar V-belt 20,5 mm, sedangkan batas pakai pada manual servis minimal 21,0 mm. Tindakan dan alasan yang paling tepat adalah ...',
     o:['mengganti pegas kopling sentrifugal, karena belt yang menyempit menambah beban pada pegas sehingga pegas cepat patah dan kopling selip','mengganti V-belt, karena belt di bawah batas pakai duduk terlalu dalam pada puli sehingga rasio tidak tercapai dan belt selip','menyetel ulang jarak puli saja, karena lebar belt tidak memengaruhi rasio selama belt masih utuh dan tidak retak','mengganti roller, karena roller yang aus membuat belt ikut menyempit hingga di bawah batas pakai servis','menambah oli pada belt, karena belt yang licin mengurangi gesekan sehingga tarikan menjadi lebih ringan'],a:1,
     e:'Belt yang lebarnya di bawah batas pakai duduk lebih dalam pada alur puli sehingga rasio tertinggi tidak tercapai dan belt mudah selip, maka belt diganti. Pengecoh: A pegas tidak patah karena lebar belt; C lebar belt memengaruhi rasio; D roller tidak menyempitkan belt; E belt tidak boleh terkena oli.'},
    {t:'pg',lvl:'Aplikasi',q:'Pada suatu saat CVT bekerja dengan diameter efektif puli primer 50 mm dan puli sekunder 130 mm. Putaran puli primer 5.200 rpm. Putaran puli sekunder adalah ...',
     o:['13.520 rpm','2.000 rpm','5.200 rpm','3.200 rpm','65 rpm'],a:1,
     e:'Rasio CVT = 130 ÷ 50 = 2,6. Putaran sekunder = 5.200 ÷ 2,6 = 2.000 rpm. Pengecoh: A mengalikan putaran dengan rasio; C menganggap rasio 1; D memakai selisih diameter ÷ diameter sekunder; E membagi dengan selisih diameter.'},
    {t:'kompleks',lvl:'Penalaran',q:'Pada pemeriksaan CVT, diameter keenam roller terukur lebih kecil dari batas pakai dan beratnya tidak seragam. Pilih semua pernyataan yang benar.',
     o:['Roller yang menyusut lebih ringan sehingga gaya sentrifugalnya lebih kecil dan puli primer menutup lebih lambat.','Roller yang aus boleh dipakai terus selama V-belt masih baik karena keduanya tidak saling memengaruhi.','Roller diganti sepaket agar berat dan keausan seragam sehingga getaran dan kerja CVT tetap seimbang.','Roller boleh diganti satu per satu pada yang aus saja karena selisih berat antarroller tidak memengaruhi getaran.','Roller cukup diperiksa dengan mata karena keausannya tidak dapat diukur dengan jangka sorong.'],a:[0,2],
     e:'Roller lebih ringan menghasilkan gaya sentrifugal lebih kecil sehingga puli menutup lebih lambat. Roller diganti sepaket agar berat seragam. Pengecoh: roller aus memengaruhi kerja CVT; selisih berat menimbulkan getaran; diameter dan panjang roller diukur dengan jangka sorong dan dibandingkan dengan manual servis.'},
    {t:'kategori',lvl:'Penalaran',q:'Sebuah skuter matik menghentak saat berangkat. Setelah kopling sentrifugal dilepas, kampasnya mengkilap dan berminyak. Tentukan setiap pernyataan Benar atau Salah.',
     rows:[['Kampas berminyak dapat menyebabkan selip atau menghentak saat berangkat, sehingga sumber oli seperti seal perlu dicari.',true],['Kampas yang mengkilap cukup diamplas kasar lalu dipakai kembali tanpa mengukur tebalnya.',false],['Tebal kampas harus diukur dan dibandingkan dengan batas pakai pada manual servis.',true],['Rumah kopling yang diameter dalamnya melebihi batas pakai tetap aman bila kampas baru dipasang.',false],['Pegas kopling yang lebih pendek dari panjang bebas standar dapat membuat kopling menggigit pada putaran lebih rendah dari seharusnya.',true]],lab:['Benar','Salah'],
     e:'Oli pada kampas menyebabkan selip atau hentakan dan sumbernya harus dicari. Kampas diukur terhadap batas pakai, bukan diamplas lalu dipakai. Rumah kopling yang melebihi batas pakai diganti. Pegas lebih pendek dari standar melemah sehingga kopling menggigit pada putaran lebih rendah.'},
    {t:'pg',lvl:'Aplikasi',q:'Siswa akan melepas kopling sentrifugal dan puli sekunder yang pegasnya tertekan. Langkah yang paling aman adalah ...',
     o:['menahan puli dengan obeng, lalu mengendurkan mur memakai kunci kejut sampai pegas lepas sendiri dari puli','memasang SST penahan dan kompresor pegas, memakai kacamata, lalu mengendurkan mur perlahan','mengendurkan mur dengan tang sampai pegas terlepas, lalu menangkap pegas dengan tangan kosong','memanaskan puli dengan blower agar pegas mengendur sehingga mur lepas tanpa alat khusus apa pun','menyemprot ulir dengan pelumas lalu melepas mur dengan sekali hentakan kuat tanpa penahan puli'],a:1,
     e:'Pegas puli sekunder menyimpan tenaga sehingga harus ditahan dan ditekan dengan SST, memakai kacamata, dan mur dikendurkan perlahan. Pengecoh: obeng dan tang tidak aman; pemanasan tidak melepas pegas; hentakan tanpa penahan membuat komponen terlontar.'}
   ]},
   tabel:[],
   analisis:[
    'Bandingkan hasil ukur pada Pemeriksaan dan bukti dengan standar manual servis. Bagian mana yang tidak sesuai dan apa dugaan penyebabnya?',
    'Mengapa nol alat ukur diperiksa dan alat dipegang dengan benar sebelum mengukur? Apa akibatnya pada keputusan Sesuai atau Tidak sesuai?',
    'Gejala apa yang muncul bila V-belt aus, roller menyusut, atau kampas kopling berminyak? Hubungkan dengan hasil periksamu.',
    'Untuk komponen yang melebihi batas pakai, tindakan apa yang kamu pilih (setel, perbaiki, ganti) dan mengapa?',
    'Mengapa pegas puli sekunder harus dilepas dengan SST? Apa risikonya bila tidak?',
    'Berapa waktumu dibanding waktu standar? Di langkah mana waktu terbuang?'
   ],
   refleksi:[
    'Bagian mana yang paling sulit (membongkar, mengukur, atau merakit) dan bagaimana kamu mengatasinya?',
    'Apa yang akan kamu lakukan berbeda pada praktik berikutnya?',
    'Bagaimana kerja kelompok membantu atau menghambat?',
    'Di bengkel atau DUDI, pekerjaan ini muncul pada situasi apa?'
   ],
   obs:{
    judul:'Observasi LKPD-TSM-PMT-03 Transmisi dan CVT',
    aspek:[
     {id:'k3',ket:'Yang dinilai: APD terpasang benar (kacamata pada pegas tertekan dan uji fungsi), engine dingin dan terpasang kuat, SST dipakai, tangan dijauhkan dari bagian berputar, larangan K3 dipatuhi.',n:'Persiapan dan K3',b:20,d:{4:'APD lengkap, SST dipakai, area aman tanpa diingatkan',3:'Lengkap, diingatkan 1 kali',2:'APD kurang atau area belum aman, diingatkan lebih dari 1 kali',1:'Mengabaikan K3 (praktik dihentikan)'},stop:1},
     {id:'prosedur',ket:'Yang dinilai: urutan bongkar dan pasang sesuai manual servis, penggunaan SST dan alat ukur, komponen disusun berurutan, torsi dan oli sesuai manual servis.',n:'Prosedur kerja',b:30,d:{4:'Semua langkah urut, SST dan manual dipakai, tanpa bantuan',3:'Urut dengan 1–2 koreksi kecil',2:'Beberapa langkah terbalik atau terlewat',1:'Tidak mengikuti prosedur, berisiko merusak komponen'}},
     {id:'hasil',ket:'Yang dinilai: bacaan ukur benar (Pemeriksaan dan bukti dan latihan hitung), keputusan Sesuai atau Tidak sesuai berdasarkan standar guru, foto bukti ada dan jelas, uji fungsi lulus.',n:'Hasil kerja dan data',b:25,d:{4:'Data akurat, keputusan sesuai standar, uji fungsi lulus',3:'Data akurat, 1 catatan perbaikan',2:'Data tidak lengkap atau keputusan kurang tepat',1:'Data salah atau tidak ada'}},
     {id:'waktu',ket:'Acuan waktu standar: total praktik '+jumMenit([1,2,3,4])+' menit, dibagi per kegiatan (V-belt '+jumMenit([1])+', puli primer dan roller '+jumMenit([2])+', puli sekunder dan kopling '+jumMenit([3])+', perakitan dan uji fungsi '+jumMenit([4])+'). Isi waktu aktualmu di tiap kartu kegiatan pada Lembar Kerja.',n:'Waktu dan efisiensi',b:10,d:{4:'Dalam waktu standar',3:'Hingga 125%',2:'Hingga 150%',1:'Lebih dari 150%'}},
     {id:'5r',ket:'Yang dinilai: meja bersih, komponen dan alat kembali, oli bekas dan majun kotor dipisah ke wadah limbah.',n:'5R dan limbah',b:5,d:{4:'Area bersih, alat kembali, limbah terpisah',3:'Satu hal terlewat',2:'Dua hal terlewat',1:'Area dibiarkan kotor'}},
     {id:'sikap',ket:'Yang dinilai: jujur mencatat hasil sendiri (tidak menyalin data teman), aktif, membantu teman, mengikuti arahan guru.',n:'Sikap dan kerja sama',b:10,d:{4:'Aktif, jujur, membantu teman',3:'Aktif, sesekali diingatkan',2:'Pasif',1:'Mengganggu kegiatan'}}
    ],
    indikator:[
     {t:'Menjelaskan fungsi, komponen, dan cara kerja CVT',bukti:'Prasyarat masuk, latihan soal 1–2'},
     {t:'Memeriksa V-belt dan mengukur lebarnya dengan benar',bukti:'Pemeriksaan dan bukti, kegiatan 1 disaksikan'},
     {t:'Memeriksa dan mengukur roller CVT',bukti:'Pemeriksaan dan bukti, latihan soal 3–4, disaksikan'},
     {t:'Melepas puli sekunder dan kopling sentrifugal dengan SST',bukti:'Kegiatan 3 disaksikan, APD kacamata'},
     {t:'Mengukur kampas, rumah kopling, dan pegas',bukti:'Pemeriksaan dan bukti, latihan soal 5–6, disaksikan'},
     {t:'Menentukan tindakan setel, perbaiki, atau ganti',bukti:'Analisis 1 dan 4'},
     {t:'Merakit, mengisi oli, dan menguji fungsi sesuai manual servis',bukti:'Kegiatan 4 disaksikan, foto hasil'},
     {t:'K3, APD, 5R, dan limbah',bukti:'Daftar APD, kegiatan 4'}
    ],
    panduan:[
     {k:'V-belt',lihat:'Belt tidak berminyak, lebar diukur dengan benar, nol alat dicek',salah:'Belt ditekuk tajam, tidak diukur, belt berminyak dipakai lagi'},
     {k:'Puli primer dan roller',lihat:'Roller diukur pada titik sama, roller sepaket dan berurutan',salah:'Roller tertukar urutan, hanya sebagian roller diganti'},
     {k:'Puli sekunder dan kopling sentrifugal',lihat:'SST dipakai, kacamata terpasang, mur dikendurkan perlahan',salah:'Puli ditahan obeng, pegas dilepas tanpa kompresor'},
     {k:'Perakitan dan uji fungsi',lihat:'Torsi dan oli sesuai manual, tangan dijauhkan dari bagian berputar',salah:'Torsi dan oli diperkirakan, engine dihidupkan tanpa izin guru'}
    ],
    henti:'Hentikan praktik bila siswa mengabaikan K3 (skor 1 pada Persiapan dan K3).'
   }
  }
 };
 if(typeof LKPD_EXTRA_MODULES==='undefined')window.LKPD_EXTRA_MODULES=[];
 LKPD_EXTRA_MODULES=LKPD_EXTRA_MODULES.concat([m]);
})();
