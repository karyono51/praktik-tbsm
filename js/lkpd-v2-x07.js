/* lkpd-v2-x07.js: LKPD v2 pilot LKPD-X-07 (Penggunaan dan Perawatan Alat Ukur). Hanya DATA, ditambahkan ke LKPD_EXTRA_MODULES.
   Dimuat setelah lkpd-modul.js dan sebelum lkpd.js. LKPD lama tidak disentuh. Status awal Draft: guru menerbitkan setelah pilot diperiksa.
   Angka spesifikasi komponen (standar, batas pakai) sengaja kosong: guru mengisinya dari manual servis lewat kolom Acuan/Standar.
   Rujukan SKKNI 147/2019 hanya usulan pemetaan dan perlu diverifikasi sebelum dipakai untuk asesmen. */
(function(){
 var langkah=[
  {k:1,t:'Bersihkan rahang dan benda; rapatkan rahang dan periksa nol',p:'Catat penyimpangan nol (foto)'},
  {k:1,t:'Ukur diameter luar, diameter dalam, dan kedalaman, masing-masing 3 kali',p:'Rahang tegak lurus, tekanan ringan'},
  {k:1,t:'Kunci, baca, catat pada tabel F1',p:'Baca tegak lurus skala',saksi:1},
  {k:2,t:'Bersihkan landasan dan poros; tutup dengan pemutar gelitik; periksa nol',p:'Selalu pakai gelitik'},
  {k:2,t:'Ukur diameter benda pada 3 titik; baca selubung lalu bidal',p:'Benda tidak miring',saksi:1},
  {k:3,t:'Pasang pada dudukan magnet, letakkan benda di blok V, beri pratekan, nolkan bezel',p:'Poros ukur tegak lurus, dudukan stabil'},
  {k:3,t:'Putar benda perlahan satu putaran; catat bacaan terbesar dan terkecil; hitung keolengan',p:'Putar perlahan, jangan terbentur',saksi:1},
  {k:4,t:'Bersihkan semua alat, olesi oli tipis, renggangkan poros mikrometer (jangan dikunci rapat), simpan di kotak',p:'Tanpa amplas; oli tipis saja',saksi:1},
  {k:4,t:'Rapikan area (5R), pisahkan limbah B3',p:'Majun kotor ke wadah khusus'}
 ];
 var kegiatan=['Jangka sorong','Mikrometer','Dial gauge','Perawatan dan penyimpanan'];
 var m={
  id:'LKPD-X-07',version:2,kelas:'X',fase:'E',status:'draft',active:false,
  title:'Penggunaan dan Perawatan Alat Ukur (Jangka Sorong, Mikrometer, Dial Gauge)',
  unit:'Alat ukur: jangka sorong, mikrometer, dial gauge',duration:810,
  skkni:'G.45TSM01.020.2; .027.2; .030.2; .031.2; .012.2 (usulan, verifikasi)',
  objectives:['Menyebut bagian, fungsi, dan ketelitian ketiga alat.','Memeriksa kondisi alat dan posisi nol sebelum mengukur.','Mengukur dan membaca skala jangka sorong, mikrometer, dan dial gauge dengan benar.','Mencatat hasil dan membandingkannya dengan standar dari guru.','Membersihkan, melumasi tipis, dan menyimpan alat dengan benar.'],
  theory:[
   ['Pertanyaan pemantik','Mengapa mekanik tidak cukup mengukur komponen mesin dengan penggaris? Apa akibatnya bila celah klep atau diameter piston salah baca 0,05 mm? Alat ukur apa yang pernah kamu lihat di bengkel, dan untuk mengukur apa?'],
   ['Jangka sorong','Hasil = skala utama + (nomor garis nonius yang tepat berimpit × ketelitian). Ketelitian umum 0,05 mm atau 0,02 mm. Mengukur diameter luar, diameter dalam (rahang atas), dan kedalaman (batang kedalaman).'],
   ['Mikrometer','Satu putaran bidal = 0,5 mm, 50 bagian, tiap bagian 0,01 mm. Baca selubung (tambah 0,5 mm bila garis setengah milimeter terlihat), lalu bidal × 0,01. Selalu pakai pemutar gelitik.'],
   ['Dial gauge','Mengukur selisih atau perubahan posisi, misalnya keolengan poros atau cakram. Pasang kuat, beri pratekan sampai jarum bergerak sedikit, putar bezel ke nol, lalu amati selisih bacaan.'],
   ['Koreksi nol alat','Rapatkan rahang atau tutup poros (mikrometer dengan pemutar gelitik), lalu baca. Bila tidak menunjuk nol, catat penyimpangannya. Hasil benar = bacaan − penyimpangan nol. Contoh: nol terbaca +0,05 mm dan benda terbaca 22,40 mm, maka ukuran benda 22,35 mm; nol terbaca −0,02 mm, maka hasil ditambah 0,02 mm. Menghitung rata-rata tidak menghilangkan penyimpangan nol.'],
   ['Perawatan dan penyimpanan','Setelah dipakai: lap bersih, olesi oli tipis, renggangkan poros mikrometer (jangan dikunci rapat), lalu simpan di kotak alat. Jangan menggosok permukaan ukur dengan amplas, jangan memakai oli tebal, dan jangan membiarkan alat terbuka atau kotor di meja kerja.'],
   ['Keselamatan dan kesehatan kerja (K3) pada praktik alat ukur','Bahaya: alat jatuh dan rusak, tepi benda kerja tajam, magnet dial gauge menjepit jari, oli licin, serpihan saat dibersihkan dengan udara bertekanan. Pengendalian: meja stabil beralas kain; sarung tangan hanya saat memegang benda tajam atau berminyak (dilepas saat membaca skala); kacamata bila memakai udara bertekanan; oli segera dilap; majun dan limbah oli ke wadah limbah.']
  ],
  tools:['Jangka sorong','Mikrometer luar','Dial gauge + dudukan magnet','Blok V, benda kerja (baut, pin piston, ring, cakram), majun, oli tipis, kotak alat'],
  safety:['Pakaian praktik (wearpack) lengkap dan dikancing; lengan baju tidak menjuntai','Sepatu tertutup (sepatu safety) terpasang','Sarung tangan hanya dipakai saat memegang benda tajam atau berminyak; dilepas saat membaca skala','Kacamata pelindung dipakai bila membersihkan dengan udara bertekanan','Meja kerja rata dan stabil, beralas kain; alat dan benda kerja tidak di tepi meja','Dudukan magnet dial gauge dijauhkan dari jari dan telepon seluler','Cincin, gelang, dan jam tangan dilepas; rambut panjang diikat','Tidak mengukur benda panas; alat ukur tidak dipakai memukul, mencongkel, atau dijatuhkan','Oli tumpah segera dilap; majun dan limbah oli dibuang ke wadah limbah yang disediakan','Letak APAR, kotak P3K, jalur keluar, dan titik kumpul bengkel sudah diketahui; nama guru pembimbing dicatat'],
  steps:langkah.map(function(x){return ['Kegiatan '+x.k+' · '+x.t,0,x.p]}),
  checks:[
   ['Posisi nol jangka sorong','Rahang rapat; catat penyimpangan nol'],
   ['Hasil ukur jangka sorong','Rata-rata 3 kali (tabel F1)'],
   ['Posisi nol mikrometer','Tutup dengan pemutar gelitik; catat penyimpangan nol'],
   ['Bacaan mikrometer pada benda','Selubung lalu bidal, 3 titik (tabel F2)'],
   ['Dial gauge terpasang dengan pratekan','Poros ukur tegak lurus, dudukan stabil, bezel dinolkan'],
   ['Keolengan hasil dial gauge','Terbesar dikurangi terkecil (tabel F3)'],
   ['Alat di kotak setelah perawatan (5R)','Bersih, oli tipis, poros mikrometer tidak terkunci']
  ],
  fotoWajib:[0,2,3,4,6],
  symptoms:[],
  quiz:[
   {t:'isian',id:'J1',q:'J1 · Jangka sorong 0,05 mm; skala utama 24 mm; garis nonius ke-7 berimpit',kunci:24.35,tol:0.005,u:'mm',e:'24 + 7 × 0,05'},
   {t:'isian',id:'J2',q:'J2 · Jangka sorong 0,02 mm; skala utama 31 mm; garis nonius ke-14 berimpit',kunci:31.28,tol:0.005,u:'mm',e:'31 + 14 × 0,02'},
   {t:'isian',id:'J3',q:'J3 · Jangka sorong 0,05 mm; skala utama 12 mm; garis nonius ke-9 berimpit',kunci:12.45,tol:0.005,u:'mm',e:'12 + 9 × 0,05'},
   {t:'isian',id:'M1',q:'M1 · Mikrometer 0,01 mm; selubung 7 mm, garis 0,5 mm terlihat; bidal 28',kunci:7.78,tol:0.005,u:'mm',e:'7 + 0,5 + 28 × 0,01 = 7,5 + 0,28'},
   {t:'isian',id:'M2',q:'M2 · Mikrometer: selubung 12 mm, garis 0,5 mm belum terlihat; bidal 35',kunci:12.35,tol:0.005,u:'mm',e:'12 + 35 × 0,01 = 12 + 0,35'},
   {t:'isian',id:'M3',q:'M3 · Mikrometer: selubung 5 mm, garis 0,5 mm terlihat; bidal 13',kunci:5.63,tol:0.005,u:'mm',e:'5 + 0,5 + 13 × 0,01 = 5,5 + 0,13'},
   {t:'isian',id:'D1',q:'D1 · Dial gauge 0,01 mm, 1 putaran jarum besar = 1 mm; jarum kecil 2, jarum besar garis ke-45',kunci:2.45,tol:0.005,u:'mm',e:'2 putaran = 2 mm; garis ke-45 × 0,01 = 0,45; 2 + 0,45. Ubah soal bila dial gauge sekolah berbeda.'},
   {t:'isian',id:'D2',q:'D2 · Keolengan: bacaan terbesar 0,32 mm, terkecil 0,10 mm',kunci:0.22,tol:0.005,u:'mm',e:'0,32 − 0,10'}
  ],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:false,evidence:false,cause:false,conclusion:false,atLeastOneCheck:true},
  v2:{
   ver:2,jenis:'jobsheet',jp:18,tp:'X.4.2',cp:'Peralatan dan Perlengkapan Tempat Kerja',
   pertemuan:[
    {n:1,jp:3,menit:135,judul:'Pemantik, materi, gerbang masuk, APD, cek alat',kegiatan:[]},
    {n:2,jp:3,menit:135,judul:'Kegiatan 1 jangka sorong, latihan J1–J3',kegiatan:[1],latihan:['J1','J2','J3']},
    {n:3,jp:3,menit:135,judul:'Kegiatan 2 mikrometer, latihan M1–M3',kegiatan:[2],latihan:['M1','M2','M3']},
    {n:4,jp:3,menit:135,judul:'Kegiatan 3 dial gauge, latihan D1–D2',kegiatan:[3],latihan:['D1','D2']},
    {n:5,jp:3,menit:135,judul:'Kegiatan 4 perawatan, analisis',kegiatan:[4]},
    {n:6,jp:3,menit:135,judul:'Penilaian kinerja, refleksi, remedial atau pengayaan',kegiatan:[]}
   ],
   kegiatan:kegiatan,judulPendek:'Alat Ukur',
   peta:[['Dua pengukuran jangka sorong selain diameter luar','1 (bagian jangka sorong menurut jenis ukur)'],['Ketelitian mikrometer dan satu putaran bidal','2 (bukaan dari putaran dan bagian bidal)'],['Yang dilakukan pada alat sebelum mengukur','3 (periksa nol dan koreksi penyimpangan nol)'],['Alasan pemutar gelitik dipakai','4 (tekanan ukur dan akibat memaksa bidal)'],['Dua hal yang tidak boleh dilakukan pada alat presisi','5 (perawatan dan penyimpanan yang benar)']],
   cekAlat:['Jangka sorong: permukaan ukur bersih dan tidak tergores; rahang geser bergerak halus; nol tepat atau penyimpangan dicatat','Mikrometer: landasan dan poros bersih; bidal berputar halus; pemutar gelitik berbunyi klik; nol tepat atau penyimpangan dicatat','Dial gauge: poros ukur bergerak lancar dan kembali; jarum tidak macet; dudukan magnet menempel kuat'],
   tindak:{remedial:'Remedial (bila belum tuntas): ulangi latihan membaca skala dengan soal baru dari guru dan ulangi pengukuran pada alat yang belum tepat.',pengayaan:'Pengayaan (bila sudah tuntas): ukur keolengan cakram atau diameter dalam silinder dan putuskan setel, perbaiki, atau ganti berdasarkan batas servis.'},
   langkah:langkah.map(function(x,i){return {i:i,k:x.k,saksi:!!x.saksi}}),
   apd:[0,1,2,3],
   k3grup:[{judul:'Alat pelindung diri (APD)',i:[0,1,2,3]},{judul:'Persiapan diri dan area kerja',i:[4,5,6]},{judul:'Larangan saat praktik',i:[7]},{judul:'Kebersihan dan keadaan darurat',i:[8,9]}],
   cekK:[1,1,2,2,3,3,4],
   gate:{min:4,qs:[
    {t:'pg',lvl:'Aplikasi',q:'Seorang siswa mengukur tiga hal pada satu piston: (1) diameter luar pin piston, (2) diameter dalam lubang bos pin, dan (3) kedalaman alur ring. Bagian jangka sorong yang dipakai secara berurutan adalah ...',
     o:['rahang atas, rahang bawah, batang kedalaman','rahang bawah, rahang atas, batang kedalaman','rahang bawah, batang kedalaman, rahang atas','batang kedalaman, rahang atas, rahang bawah','rahang atas, batang kedalaman, rahang bawah'],a:1,
     e:'Diameter luar: rahang bawah; diameter dalam: rahang atas; kedalaman: batang kedalaman.'},
    {t:'pg',lvl:'Aplikasi',q:'Mikrometer luar berketelitian 0,01 mm menunjuk nol saat tertutup. Bidal lalu diputar membuka sebanyak 2 putaran penuh ditambah 30 bagian. Bukaan antara landasan dan poros ukur adalah ...',
     o:['1,03 mm','2,30 mm','3,00 mm','1,30 mm','0,60 mm'],a:3,
     e:'2 putaran × 0,5 mm = 1,00 mm; 30 bagian × 0,01 mm = 0,30 mm; jumlah 1,30 mm. Pengecoh: A salah letak koma; B menganggap 1 putaran = 1 mm; C memakai ketelitian 0,1 mm (30 × 0,1); E menggandakan bagian bidal.'},
    {t:'kompleks',lvl:'Penalaran',q:'Sebelum mengukur pin piston, rahang jangka sorong (ketelitian 0,05 mm) dirapatkan. Garis nol nonius bergeser sedikit ke kanan dari garis nol skala utama dan garis nonius ke-1 yang berimpit. Setelah itu pin terbaca 22,40 mm. Pilih semua pernyataan yang benar.',
     o:['Penyimpangan nol bernilai +0,05 mm sehingga hasil ukur terbaca lebih besar dari ukuran sebenarnya.','Ukuran sebenarnya pin piston adalah 22,45 mm.','Ukuran sebenarnya pin piston adalah 22,35 mm.','Penyimpangan 0,05 mm tidak perlu dikoreksi karena akan hilang bila pin diukur tiga kali lalu dirata-rata.','Penyimpangan nol tidak perlu dicatat selama alat dipakai oleh orang yang sama.'],a:[0,2],
     e:'Nol terbaca +0,05 mm: hasil benar = 22,40 − 0,05 = 22,35 mm. Rata-rata tidak menghilangkan kesalahan sistematis; penyimpangan nol selalu dicatat dan dikoreksi.'},
    {t:'kategori',lvl:'Penalaran',q:'Dua siswa mengukur pin piston yang sama dengan mikrometer. Siswa A memutar bidal memakai pemutar gelitik sampai berbunyi klik dan memperoleh 21,98 mm. Siswa B memutar bidal kuat-kuat sampai tidak dapat berputar dan memperoleh 21,94 mm. Tentukan setiap pernyataan Benar atau Salah.',
     rows:[['Pemutar gelitik membatasi tekanan ukur sehingga tekanan pada tiap pengukuran relatif sama.',true],['Hasil siswa B lebih akurat karena tekanan yang lebih kuat menghilangkan celah antara benda dan permukaan ukur.',false],['Selisih 0,04 mm antara hasil siswa A dan B dapat berasal dari perbedaan tekanan ukur.',true],['Pemutar gelitik hanya dipakai saat memeriksa nol; saat mengukur benda, bidal boleh diputar langsung.',false],['Memutar bidal dengan paksa dapat merusak ulir atau permukaan ukur dan menurunkan ketelitian alat.',true]],lab:['Benar','Salah'],
     e:'Gelitik membatasi tekanan ukur. Tekanan berlebih mendeformasi benda dan alat sehingga hasil B lebih kecil dan kurang akurat. Gelitik dipakai setiap kali menutup poros, termasuk saat mengukur benda.'},
    {t:'pg',lvl:'Aplikasi',q:'Setelah praktik, sebuah mikrometer disimpan dengan poros dirapatkan lalu dikunci kuat pada landasan. Permukaan ukurnya digosok amplas agar mengilap, dan alat tidak diolesi apa pun. Dua minggu kemudian nol alat bergeser dan permukaan ukur berbintik karat. Perawatan yang benar adalah ...',
     o:['permukaan ukur diamplas halus agar mengilap, lalu poros dikunci rapat agar tidak bergerak di dalam kotak','alat diolesi oli tebal sampai seluruh permukaan tertutup, lalu poros dirapatkan dan dikunci pada landasan','alat dilap bersih, diolesi oli tipis, poros direnggangkan tanpa dikunci, lalu disimpan di kotak','alat dibiarkan terbuka di meja kerja agar kering oleh udara, tanpa dilap dan tanpa diolesi apa pun','alat dicuci dengan air dan sabun, dikeringkan di dekat mesin yang panas, lalu poros dikunci rapat'],a:2,
     e:'Lap bersih, oli tipis, poros direnggangkan (tidak dikunci rapat), simpan di kotak, tanpa amplas.'}
   ]},
   tabel:[
    {id:'F1',k:1,judul:'F1 · Jangka sorong (mm)',cat:'Bila nol alat menyimpang, koreksi tiap bacaan: hasil benar = bacaan − penyimpangan nol (contoh: nol +0,05 dan bacaan 22,40 menjadi 22,35 mm). Standar diisi dari manual atau guru.',baris:['Diameter luar','Diameter dalam','Kedalaman'],labelBaris:'Jenis ukur',
     kol:[{k:'benda',l:'Benda',t:'teks'},{k:'nol',l:'Nol alat',t:'num'},{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']}]},
    {id:'F2',k:2,judul:'F2 · Mikrometer (mm)',cat:'Titik 1, 2, dan 3 diambil pada tempat berbeda di sepanjang benda. Koreksi hasil dengan penyimpangan nol bila alat tidak menunjuk nol.',baris:[''],
     kol:[{k:'benda',l:'Benda',t:'teks'},{k:'nol',l:'Nol alat',t:'num'},{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']},{k:'std',l:'Standar',t:'num'},{k:'status',l:'Status',t:'status'}]},
    {id:'F3',k:3,judul:'F3 · Dial gauge (mm)',baris:[''],
     kol:[{k:'benda',l:'Benda',t:'teks'},{k:'besar',l:'Terbesar',t:'num'},{k:'kecil',l:'Terkecil',t:'num'},{k:'olengan',l:'Keolengan',t:'selisih',a:'besar',b:'kecil'},{k:'batas',l:'Batas',t:'num'},{k:'status',l:'Status',t:'status'}]}
   ],
   analisis:[
    'Bandingkan hasil ukur dengan standar. Bagian mana yang tidak sesuai dan apa dugaan penyebabnya?',
    'Mengapa pengukuran dilakukan 3 kali dan dirata-rata? Apa arti bila ketiganya sangat berbeda?',
    'Bila nol alat tidak tepat, apa yang kamu lakukan pada hasil ukur?',
    'Bila komponen melebihi batas pakai, tindakan apa yang kamu pilih (setel, perbaiki, ganti) dan mengapa?',
    'Apa risiko bila alat ukur tidak dirawat atau salah baca?',
    'Berapa waktumu dibanding waktu standar? Di langkah mana waktu terbuang?'
   ],
   refleksi:[
    'Bagian mana yang paling sulit dan bagaimana kamu mengatasinya?',
    'Apa yang akan kamu lakukan berbeda pada praktik berikutnya?',
    'Bagaimana kerja kelompok membantu atau menghambat?',
    'Di bengkel atau DUDI, pekerjaan ini muncul pada situasi apa?'
   ],
   obs:{
    judul:'Observasi LKPD-X-07 Alat Ukur',
    aspek:[
     {id:'k3',ket:'Yang dinilai: APD terpasang benar, meja dan area siap, alat diperiksa sebelum dipakai, larangan K3 dipatuhi, letak APAR dan P3K diketahui.',n:'Persiapan dan K3',b:20,d:{4:'APD lengkap, area aman, alat diperiksa tanpa diingatkan',3:'Lengkap, diingatkan 1 kali',2:'APD kurang atau area belum aman, diingatkan lebih dari 1 kali',1:'Mengabaikan K3 (praktik dihentikan)'},stop:1},
     {id:'prosedur',ket:'Yang dinilai: urutan langkah (periksa nol dulu, ukur 3 kali, baca, catat), cara memegang alat, tidak memaksa atau menjatuhkan alat.',n:'Prosedur kerja',b:30,d:{4:'Semua langkah urut, nol alat diperiksa, tanpa bantuan',3:'Urut dengan 1–2 koreksi kecil',2:'Beberapa langkah terbalik atau terlewat',1:'Tidak mengikuti prosedur, berisiko merusak'}},
     {id:'hasil',ket:'Yang dinilai: bacaan benar (latihan skala dan tabel F1–F3), rata-rata dan keolengan terhitung, keputusan Sesuai atau Tidak sesuai berdasarkan standar dari guru, foto bukti ada dan jelas.',n:'Hasil kerja dan data',b:25,d:{4:'Data akurat, bacaan benar semua, keputusan sesuai standar',3:'Data akurat, 1 catatan perbaikan',2:'Data tidak lengkap atau keputusan kurang tepat',1:'Data salah atau tidak ada'}},
     {id:'waktu',ket:'Acuan waktu standar: target menit tiap pertemuan pada Rencana pertemuan. Isi waktu aktualmu di Lembar Kerja.',n:'Waktu dan efisiensi',b:10,d:{4:'Dalam waktu standar',3:'Hingga 125%',2:'Hingga 150%',1:'Lebih dari 150%'}},
     {id:'5r',ket:'Yang dinilai: meja bersih, alat dibersihkan lalu diolesi oli tipis dan kembali ke kotak, majun dan limbah oli dipisah.',n:'5R dan limbah',b:5,d:{4:'Area bersih, alat kembali, limbah terpisah',3:'Satu hal terlewat',2:'Dua hal terlewat',1:'Area dibiarkan kotor'}},
     {id:'sikap',ket:'Yang dinilai: jujur mencatat hasil sendiri (tidak menyalin data teman), aktif, membantu teman, mengikuti arahan guru.',n:'Sikap dan kerja sama',b:10,d:{4:'Aktif, jujur, membantu teman',3:'Aktif, sesekali diingatkan',2:'Pasif',1:'Mengganggu kegiatan'}}
    ],
    indikator:[
     {t:'Menyebut bagian, fungsi, ketelitian',bukti:'Gerbang masuk'},
     {t:'Memeriksa kondisi dan nol alat',bukti:'Foto nol, penyimpangan tercatat'},
     {t:'Jangka sorong benar',bukti:'Tabel F1, J1–J3, disaksikan'},
     {t:'Mikrometer benar',bukti:'Tabel F2, M1–M3, disaksikan'},
     {t:'Dial gauge benar',bukti:'Tabel F3, D1–D2, disaksikan'},
     {t:'Mencatat dan membandingkan dengan standar',bukti:'Tabel F1–F3, analisis 1'},
     {t:'Merawat dan menyimpan alat',bukti:'Kegiatan 4 disaksikan'},
     {t:'K3, APD, dan limbah',bukti:'Daftar APD, kegiatan 4'}
    ],
    panduan:[
     {k:'Jangka sorong',lihat:'Nol alat, rahang tegak lurus, garis nonius berimpit',salah:'Salah pandang, rahang miring, tekanan kuat, lupa cek nol'},
     {k:'Mikrometer',lihat:'Pemutar gelitik, selubung lalu bidal',salah:'Tanpa gelitik, lupa menambah 0,5 mm, benda miring'},
     {k:'Dial gauge',lihat:'Dudukan stabil, pratekan, penolan bezel',salah:'Poros ukur tidak tegak lurus, tanpa pratekan, dudukan goyang'},
     {k:'Perawatan',lihat:'Bersih, oli tipis, mikrometer tidak terkunci, limbah dipisah',salah:'Disimpan kotor, bertumpuk dengan perkakas berat'}
    ],
    henti:'Hentikan praktik bila siswa mengabaikan K3 (skor 1 pada Persiapan dan K3).'
   }
  }
 };
 if(typeof LKPD_EXTRA_MODULES==='undefined')window.LKPD_EXTRA_MODULES=[];
 LKPD_EXTRA_MODULES=LKPD_EXTRA_MODULES.concat([m]);
})();
