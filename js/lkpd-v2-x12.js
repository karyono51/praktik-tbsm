/* lkpd-v2-x12.js: LKPD v2 LKPD-DDO-ELK-01 (Arus, Tegangan, dan Hambatan pada Kendaraan), Kelas X Genap, TP X.5.1. Hanya DATA, ditambahkan ke LKPD_EXTRA_MODULES.
   Mengikuti Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx: LKPD-DDO-ELK-01, lembar kerja eksperimen, 12 JP (3 pertemuan x 4 JP, Kelas X), unit SKKNI 039 (level 2).
   Dimuat setelah lkpd-v2-xi18.js dan sebelum lkpd.js. Struktur mengikuti master LKPD V2 (LKPD-DDO-ALT-02). Status awal Draft.
   Angka spesifikasi (tegangan baterai standar, batas hambatan, arus beban) sengaja KOSONG: guru mengisinya dari manual servis lewat kolom Standar. Angka pada soal hanya contoh hitung.
   Rujukan SKKNI 147/2019 hanya usulan pemetaan dan perlu diverifikasi sebelum dipakai untuk asesmen.
   3 pertemuan x 4 JP (180 menit, 45 menit per JP) = 12 JP. Pertemuan 1 = pemantik, materi, prasyarat, APD, cek alat + Kegiatan 1 tegangan; Pertemuan 2 = Kegiatan 2 hambatan dan 3 arus (dua kartu); Pertemuan 3 = Kegiatan 4 verifikasi hukum Ohm, analisis, penilaian kinerja, refleksi.
   Praktik memakai rangkaian lampu 12 V dengan baterai kendaraan (mesin tidak dihidupkan), multimeter digital, dan kabel penghubung berfuse. */
(function(){
 var langkah=[
  {k:1,m:6,t:'Periksa multimeter dan kabel ukur (tidak terkelupas), atur selector ke VDC pada rentang di atas 12 V; probe merah ke jack V, hitam ke COM',p:'Selector dan jack benar sebelum probe disentuhkan'},
  {k:1,m:12,t:'Ukur tegangan baterai tanpa beban 3 kali: probe merah ke kutub positif, hitam ke kutub negatif; catat pada tabel F1',p:'Kontak kunci OFF; probe tidak boleh menyentuh kedua kutub sekaligus dengan satu probe',saksi:1},
  {k:1,m:12,t:'Nyalakan lampu uji, ukur tegangan pada terminal lampu (paralel dengan lampu) 3 kali; catat pada tabel F1',p:'Voltmeter dipasang paralel dengan beban',saksi:1},
  {k:1,m:5,t:'Bandingkan hasil dengan standar dari guru atau manual servis dan putuskan Sesuai atau Tidak sesuai',p:'Standar dari manual servis, bukan dugaan'},
  {k:2,m:6,t:'Lepas lampu uji dan kabel dari sumber: pastikan tidak ada tegangan pada bagian yang akan diukur',p:'Ohmmeter tidak boleh dipasang pada rangkaian bertegangan',saksi:1},
  {k:2,m:6,t:'Atur selector ke ohm, hubungkan kedua probe, catat nilai probe saat dihubung singkat sebagai nol alat',p:'Nol alat dicatat sekali di awal'},
  {k:2,m:14,t:'Ukur hambatan filamen lampu uji 3 kali dan catat pada tabel F2',p:'Tangan tidak menyentuh kedua ujung probe saat mengukur',saksi:1},
  {k:2,m:8,t:'Ukur hambatan kabel dan sambungan (kontinuitas) 3 kali; kabel baik terbaca mendekati nol; catat pada tabel F2',p:'Bandingkan dengan kabel yang rusak atau berkarat bila tersedia'},
  {k:3,m:8,t:'Siapkan multimeter pada ADC, rentang arus terbesar, probe merah ke jack arus; rangkaian lampu dalam keadaan terputus',p:'Ammeter selalu dipasang seri, tidak pernah paralel dengan baterai',saksi:1},
  {k:3,m:14,t:'Sambungkan multimeter seri antara baterai dan lampu, nyalakan, baca arus, lalu matikan; ukur tegangan lampu pada saat yang sama; catat pada tabel F3',p:'Atas izin guru; kabel berfuse terpasang; matikan sebelum melepas multimeter',saksi:1},
  {k:3,m:8,t:'Tambahkan lampu kedua secara paralel, ulangi pengukuran arus dan tegangan; catat pada tabel F3',p:'Rentang arus diturunkan hanya bila pembacaan terlalu kecil'},
  {k:3,m:6,t:'Kembalikan probe merah ke jack V, selector ke VDC, lepas rangkaian, dan periksa fuse multimeter',p:'Probe tidak dibiarkan di jack arus'},
  {k:4,m:15,t:'Hitung hambatan lampu dari tegangan dan arus (R = V ÷ I) untuk tiap baris F3; bandingkan dengan hasil ukur ohmmeter pada F2',p:'Satuan dicek: volt, ampere, ohm',saksi:1},
  {k:4,m:10,t:'Tulis penjelasan singkat bila hasil hitung dan hasil ukur berbeda, dan hubungkan dengan panas filamen',p:'Hambatan filamen menyala berbeda dengan filamen dingin'},
  {k:4,m:10,t:'Rapikan area (5R): selector multimeter ke OFF, kabel digulung, baterai kembali ke posisi, tumpahan dilap',p:'Elektrolit tumpah dilaporkan kepada guru'}
 ];
 /* Menit tiap kegiatan = jumlah menit langkahnya; angka pada target pertemuan dan rubrik dicocokkan dengan ini (diuji). */
 function jumMenit(ks){return langkah.filter(function(x){return ks.indexOf(x.k)>-1}).reduce(function(t,x){return t+x.m},0)}
 var kegiatan=['Mengukur tegangan','Mengukur hambatan','Mengukur arus','Verifikasi hukum Ohm dan penyimpanan'];
 var m={
  id:'LKPD-DDO-ELK-01',alias:['LKPD-X-12'],prodi:'DDO',cp:'ELK',version:2,kelas:'X',fase:'E',status:'draft',active:false,tahap:true,mode:'ujian',
  title:'Arus, Tegangan, dan Hambatan pada Kendaraan',
  unit:'Rangkaian lampu 12 V pada kendaraan: arus, tegangan, hambatan',duration:540,
  skkni:'unit 039 (usulan, verifikasi)',
  objectives:['Menjelaskan pengertian arus, tegangan, dan hambatan beserta satuan dan alat ukurnya pada kendaraan.','Memilih fungsi dan rentang multimeter yang tepat, dan memasangnya seri atau paralel dengan benar.','Mengukur tegangan, hambatan, dan arus pada rangkaian lampu 12 V secara aman.','Menghitung hambatan, arus, tegangan, dan daya dengan hukum Ohm, lalu membandingkannya dengan hasil ukur.','Menerapkan K3 kelistrikan dan 5R selama praktik.'],
  theory:[
   ['Pertanyaan pemantik','Mengapa lampu kendaraan menjadi redup saat baterai lemah? Apa bedanya tegangan dan arus? Mengapa kabel yang berkarat atau longgar bisa membuat lampu atau klakson lemah?'],
   ['Tegangan, arus, dan hambatan','Tegangan (V, satuan volt) adalah beda potensial yang mendorong muatan. Arus (I, satuan ampere) adalah aliran muatan dalam rangkaian. Hambatan (R, satuan ohm) menahan aliran arus. Analogi air: tegangan seperti tekanan, arus seperti debit, hambatan seperti penyempitan pipa.'],
   ['Hukum Ohm dan daya','V = I × R, sehingga I = V ÷ R dan R = V ÷ I. Daya listrik P = V × I (watt). Pada tegangan tetap, hambatan yang membesar (kabel berkarat, sambungan longgar) menurunkan arus dan membuat beban lemah.'],
   ['Rangkaian seri dan paralel','Seri: arus sama di semua beban, hambatan total = jumlah hambatan. Paralel: tegangan sama di semua cabang, arus total = jumlah arus cabang, dan hambatan gabungan lebih kecil dari cabang terkecil. Lampu kendaraan umumnya dipasang paralel pada baterai.'],
   ['Multimeter: cara memasang','Voltmeter dipasang paralel dengan bagian yang diukur dan dapat dipasang pada rangkaian hidup. Ammeter dipasang seri sehingga rangkaian diputus dulu; hambatan dalamnya sangat kecil, sehingga bila dipasang paralel pada baterai terjadi korsleting. Ohmmeter hanya untuk rangkaian tanpa sumber karena alat memberi arus uji sendiri.'],
   ['Gejala dan penyebab','Lampu redup: tegangan turun akibat baterai lemah atau hambatan sambungan besar. Lampu tidak menyala: filamen putus (hambatan tak hingga) atau kabel putus. Fuse sering putus: arus berlebih akibat korsleting atau beban terlalu besar.'],
   ['Keselamatan dan kesehatan kerja (K3) pada kelistrikan kendaraan','Bahaya: korsleting dan percikan pada kutub baterai, benda logam di atas baterai, elektrolit baterai (asam), kabel terkelupas, dan multimeter di jack arus saat mengukur tegangan. Pengendalian: kontak kunci OFF dan mesin mati, perhiasan dilepas, kacamata pelindung saat menyambung atau melepas kabel baterai, kabel berfuse, dan multimeter dicek selector serta jack-nya sebelum dipakai.']
  ],
  tools:['Multimeter digital dan kabel ukur','Baterai 12 V kendaraan (terpasang pada trainer atau motor, mesin tidak dihidupkan)','Lampu uji 12 V dan dudukan, kabel penghubung berfuse','Resistor atau komponen untuk latihan hambatan bila tersedia','Majun, kacamata pelindung, sarung tangan'],
  safety:['Pakaian praktik (wearpack) lengkap dan dikancing; lengan baju tidak menjuntai','Sepatu tertutup (sepatu safety) terpasang','Sarung tangan dipakai saat memegang baterai dan kabel; dilepas bila mengganggu pembacaan atau penyetelan selector','Kacamata pelindung dipakai saat menyambung atau melepas kabel baterai','Cincin, gelang, dan jam tangan dilepas; rambut panjang diikat; tidak ada benda logam di atas baterai','Kontak kunci OFF dan mesin mati; kabel baterai dilepas atau dipasang sesuai urutan dari guru','Selector dan jack multimeter diperiksa sebelum probe disentuhkan; kabel ukur tidak terkelupas','Dilarang mengukur arus secara paralel pada baterai dan dilarang mengukur hambatan pada rangkaian bertegangan; mesin tidak dihidupkan','Percikan dan api dijauhkan dari baterai; elektrolit tumpah segera dilaporkan dan dilap; majun kotor ke wadah limbah','Letak APAR, kotak P3K, jalur keluar, dan titik kumpul bengkel sudah diketahui; nama guru pembimbing dicatat'],
  steps:langkah.map(function(x){return ['Kegiatan '+x.k+' · '+x.t,0,x.p]}),
  checks:[
   ['Kondisi multimeter dan kabel ukur','Kabel utuh, selector dan jack benar; foto alat siap'],
   ['Tegangan baterai tanpa beban','Rata-rata 3 kali dibanding standar (tabel F1); foto bacaan'],
   ['Tegangan lampu menyala','Rata-rata 3 kali, hitung penurunan dari baterai (tabel F1)'],
   ['Hambatan filamen lampu','Rata-rata 3 kali, sudah dikurangi nol alat (tabel F2); foto bacaan'],
   ['Hambatan kabel dan sambungan','Mendekati nol atau tidak, dibanding standar (tabel F2)'],
   ['Arus rangkaian lampu','Ammeter seri, dibaca bersama tegangan (tabel F3); foto rangkaian'],
   ['Hasil hitung R = V ÷ I','Dibanding hasil ukur ohmmeter, selisih dicatat (tabel F3)'],
   ['Selector OFF dan 5R','Multimeter OFF, kabel rapi, area bersih; foto hasil']
  ],
  fotoWajib:[1,3,5,7],
  symptoms:[],
  quiz:[
   {t:'isian',id:'C1',q:'Lampu 12 V dengan hambatan filamen 6 Ω dihubungkan ke baterai 12 V. Hitung arus yang mengalir (A).',kunci:2,tol:0.005,u:'A',e:'I = V ÷ R = 12 ÷ 6 = 2'},
   {t:'isian',id:'C2',q:'Tegangan lampu terukur 12,6 V dan arusnya 2,1 A. Hitung hambatan lampu (Ω).',kunci:6,tol:0.005,u:'Ω',e:'R = V ÷ I = 12,6 ÷ 2,1 = 6'},
   {t:'isian',id:'C3',q:'Sebuah lampu 12 V menarik arus 4,5 A. Hitung dayanya (W).',kunci:54,tol:0.005,u:'W',e:'P = V × I = 12 × 4,5 = 54'},
   {t:'isian',id:'C4',q:'Dua beban 4 Ω dan 8 Ω dirangkai seri. Hitung hambatan totalnya (Ω).',kunci:12,tol:0.005,u:'Ω',e:'4 + 8 = 12'},
   {t:'isian',id:'C5',q:'Dua lampu 6 Ω dan 12 Ω dirangkai paralel pada baterai. Hitung hambatan gabungannya (Ω).',kunci:4,tol:0.005,u:'Ω',e:'(6 × 12) ÷ (6 + 12) = 72 ÷ 18 = 4'},
   {t:'isian',id:'C6',q:'Tegangan baterai tanpa beban 12,6 V; saat lampu menyala terbaca 12,1 V. Hitung penurunan tegangannya (V).',kunci:0.5,tol:0.005,u:'V',e:'12,6 − 12,1 = 0,5'}
  ],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:false,evidence:false,cause:false,conclusion:false,atLeastOneCheck:true},
  v2:{
   ver:2,jenis:'jobsheet',jp:12,tp:'X.5.1',cp:'Dasar Kelistrikan dan Elektronika Otomotif',
   pertemuan:[
    {n:1,jp:4,menit:180,judul:'Pemantik, materi arus, tegangan, hambatan, prasyarat masuk, APD, cek alat; Kegiatan 1 pengukuran tegangan, latihan soal 1–2',kegiatan:[1],latihan:['C1','C2'],praktik:jumMenit([1]),kartu:{judul:'Kegiatan 1 pengukuran tegangan'}},
    {n:2,jp:4,menit:180,judul:'Kegiatan 2 pengukuran hambatan dan Kegiatan 3 pengukuran arus, latihan soal 3–5',kegiatan:[2,3],latihan:['C3','C4','C5'],praktik:jumMenit([2,3]),kartu:{judul:'Kegiatan 2 hambatan dan 3 arus',per:{2:'Kegiatan 2 pengukuran hambatan',3:'Kegiatan 3 pengukuran arus'}}},
    {n:3,jp:4,menit:180,judul:'Kegiatan 4 verifikasi hukum Ohm dan penyimpanan, analisis; penilaian kinerja, refleksi, remedial atau pengayaan, latihan soal 6',kegiatan:[4],latihan:['C6'],praktik:jumMenit([4]),kartu:{judul:'Kegiatan 4 verifikasi hukum Ohm dan penyimpanan'}}
   ],
   kegiatan:kegiatan,judulPendek:'Arus, Tegangan, Hambatan',
   cekAlat:['Multimeter: layar menyala, baterai alat baik, selector berputar tegas; kabel ukur utuh dan fuse jack arus baik','Rangkaian lampu uji: lampu dan dudukan tidak retak, kabel berfuse terpasang dan tidak terkelupas','Baterai: kutub bersih, terpasang kuat, tidak ada tumpahan elektrolit; kontak kunci OFF']
   ,tindak:{remedial:'Remedial (bila belum tuntas): ulangi latihan hitung hukum Ohm dengan soal baru dari guru dan ulangi pengukuran bagian yang belum tepat (letak probe dan pilihan rentang).',pengayaan:'Pengayaan (bila sudah tuntas): rancang pengukuran untuk menentukan penyebab lampu kendaraan redup (baterai lemah atau hambatan sambungan besar) dan putuskan tindakan perbaikannya.'},
   langkah:langkah.map(function(x,i){return {i:i,k:x.k,saksi:!!x.saksi,menit:x.m||0}}),
   apd:[0,1,2,3],
   k3grup:[{judul:'Alat pelindung diri (APD)',i:[0,1,2,3]},{judul:'Persiapan diri dan area kerja',i:[4,5,6]},{judul:'Larangan saat praktik',i:[7]},{judul:'Kebersihan dan keadaan darurat',i:[8,9]}],
   cekK:[1,1,1,2,2,3,4,4],
   gate:{qs:[
    {t:'pg',lvl:'Aplikasi',q:'Siswa akan mengukur tegangan pada lampu belakang yang sedang menyala di sebuah sepeda motor dengan multimeter digital. Cara pemasangan yang benar adalah ...',
     o:['selector ADC, multimeter dipasang seri antara baterai dan lampu, lalu lampu dinyalakan','selector VDC pada rentang di atas 12 V, probe dipasang paralel pada kedua terminal lampu','selector ohm, probe dipasang pada kedua terminal lampu saat lampu menyala','selector VDC, multimeter dipasang seri pada kabel lampu agar seluruh arus melewati alat','selector ADC, probe dipasang paralel pada kedua kutub baterai agar arus terbaca sekaligus'],a:1,
     e:'Voltmeter dipasang paralel dengan bagian yang diukur, selector VDC, rentang di atas tegangan yang diharapkan. Pengecoh: A dan D memasang seri (itu cara ammeter); C ohmmeter tidak untuk rangkaian bertegangan; E menyebabkan korsleting.'},
    {t:'pg',lvl:'Aplikasi',q:'Sebuah lampu 12 V menyala dan menarik arus 3 A dari baterai. Hambatan lampu saat menyala adalah ...',
     o:['36 Ω','4 Ω','0,25 Ω','15 Ω','9 Ω'],a:1,
     e:'R = V ÷ I = 12 ÷ 3 = 4 Ω. Pengecoh: A mengalikan V × I; C membalik rumus (I ÷ V); D menjumlahkan; E mengurangkan.'},
    {t:'kompleks',lvl:'Penalaran',q:'Siswa akan mengukur arus lampu uji dengan multimeter. Pilih semua pernyataan yang benar.',
     o:['Multimeter dipasang seri dengan lampu sehingga seluruh arus rangkaian melewati alat.','Multimeter boleh dipasang paralel pada kedua kutub baterai agar pengukuran lebih cepat selama selector berada di ADC.','Hambatan dalam ammeter sangat kecil sehingga bila dipasang paralel pada baterai arus besar mengalir dan fuse alat dapat putus.','Rentang arus dipilih yang terkecil lebih dulu agar pembacaan paling teliti.','Probe merah dibiarkan di jack arus saat berikutnya mengukur tegangan karena tidak ada bedanya.'],a:[0,2],
     e:'Ammeter dipasang seri dan hambatan dalamnya kecil sehingga pemasangan paralel pada baterai menimbulkan korsleting. Pengecoh: B korsleting; D rentang dimulai dari yang terbesar lalu diturunkan; E probe dikembalikan ke jack V agar tidak terjadi korsleting saat mengukur tegangan.'},
    {t:'kategori',lvl:'Penalaran',q:'Siswa mengukur hambatan filamen lampu dengan lampu masih terpasang pada rangkaian dan kontak kunci ON. Tentukan setiap pernyataan Benar atau Salah.',
     rows:[['Ohmmeter memberi arus uji dari baterai multimeter sendiri, sehingga rangkaian harus tanpa sumber lain.',true],['Hasil ukur tetap benar selama selector diatur pada rentang ohm tertinggi.',false],['Lampu yang masih paralel dengan beban lain terbaca lebih kecil dari hambatan lampu sendiri, sehingga lampu perlu dilepas.',true],['Kabel yang baik terbaca sangat besar (tak hingga) pada ohmmeter.',false],['Kabel yang baik terbaca mendekati nol, dan nilai kedua probe dihubung singkat dicatat sebagai nol alat.',true]],lab:['Benar','Salah'],
     e:'Ohmmeter hanya untuk rangkaian tanpa sumber; rentang tidak memperbaiki pengukuran pada rangkaian bertegangan; cabang paralel menurunkan bacaan; kabel baik terbaca hampir nol, dan nol alat dicatat dari probe dihubung singkat.'},
    {t:'pg',lvl:'Aplikasi',q:'Pada baterai kendaraan terbaca 12,6 V tanpa beban. Saat lampu uji dinyalakan, tegangan pada kutub baterai terbaca 11,9 V. Penurunan tegangan akibat beban adalah ...',
     o:['0,07 V','0,7 V','1,06 V','11,9 V','24,5 V'],a:1,
     e:'12,6 − 11,9 = 0,7 V. Pengecoh: A salah letak koma; C hasil bagi 12,6 ÷ 11,9; D tegangan saat berbeban; E hasil penjumlahan.'}
   ]},
   tabel:[
    {id:'F1',k:1,dec:2,judul:'F1 · Tegangan (V)',cat:'Isi bacaan apa adanya, 3 kali tiap baris. Rata-rata dihitung otomatis dan dibulatkan 2 desimal. Standar diisi dari manual servis atau guru.',baris:['Baterai tanpa beban','Terminal lampu menyala'],labelBaris:'Titik ukur',
     kol:[{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']},{k:'std',l:'Standar',t:'num'},{k:'status',l:'Status',t:'status'}]},
    {id:'F2',k:2,nolSekali:true,dec:2,judul:'F2 · Hambatan (Ω)',cat:'Nol alat diisi sekali (nilai kedua probe dihubung singkat). Rata-rata dihitung otomatis dan sudah dikurangi nol alat, dibulatkan 2 desimal.',baris:['Filamen lampu uji','Kabel dan sambungan'],labelBaris:'Bagian',
     kol:[{k:'nol',l:'Nol alat',t:'num'},{k:'u1',l:'1',t:'num'},{k:'u2',l:'2',t:'num'},{k:'u3',l:'3',t:'num'},{k:'rata',l:'Rata-rata',t:'rata',dari:['u1','u2','u3']},{k:'std',l:'Standar',t:'num'},{k:'status',l:'Status',t:'status'}]},
    {id:'F3',k:3,dec:2,judul:'F3 · Arus, tegangan, dan hambatan',cat:'Isi tegangan (V) dan arus (A) yang terbaca bersamaan. R hitung = V ÷ I (Ω). R ukur dari tabel F2 (Ω). Selisih dihitung otomatis (R hitung dikurangi R ukur).',baris:['Lampu 1','Lampu 1 dan 2 paralel'],labelBaris:'Beban',
     kol:[{k:'v',l:'V',t:'num'},{k:'i',l:'I',t:'num'},{k:'rhit',l:'R hitung',t:'num'},{k:'rukur',l:'R ukur',t:'num'},{k:'selisih',l:'Selisih',t:'selisih',a:'rhit',b:'rukur'},{k:'status',l:'Status',t:'status'}]}
   ],
   analisis:[
    'Bandingkan tegangan baterai tanpa beban dengan tegangan lampu menyala. Berapa penurunannya dan apa dugaan penyebabnya?',
    'Mengapa voltmeter dipasang paralel, ammeter dipasang seri, dan ohmmeter hanya untuk rangkaian tanpa sumber? Apa akibatnya bila tertukar?',
    'Bandingkan hambatan lampu hasil hitung (V ÷ I) dengan hasil ukur ohmmeter. Mengapa dapat berbeda, dan apa hubungannya dengan panas filamen?',
    'Mengapa nol alat dicatat sebelum mengukur hambatan kecil, dan bagaimana pengaruhnya pada hasil?',
    'Bila lampu kendaraan redup padahal baterai baik, pengukuran apa yang kamu lakukan lebih dulu dan mengapa?',
    'Berapa waktumu dibanding waktu standar? Di langkah mana waktu terbuang?'
   ],
   refleksi:[
    'Bagian mana yang paling sulit (memilih fungsi multimeter, memasang seri atau paralel, atau menghitung) dan bagaimana kamu mengatasinya?',
    'Apa yang akan kamu lakukan berbeda pada praktik berikutnya?',
    'Bagaimana kerja kelompok membantu atau menghambat?',
    'Di bengkel atau DUDI, pekerjaan ini muncul pada situasi apa?'
   ],
   obs:{
    judul:'Observasi LKPD-DDO-ELK-01 Arus, Tegangan, dan Hambatan',
    aspek:[
     {id:'k3',ket:'Yang dinilai: APD terpasang benar (kacamata saat menyambung kabel baterai), perhiasan dilepas, kontak kunci OFF, tidak ada logam di atas baterai, multimeter diperiksa selector dan jack-nya, larangan K3 dipatuhi.',n:'Persiapan dan K3',b:20,d:{4:'APD lengkap, area dan alat aman tanpa diingatkan',3:'Lengkap, diingatkan 1 kali',2:'APD kurang atau area belum aman, diingatkan lebih dari 1 kali',1:'Mengabaikan K3 (praktik dihentikan)'},stop:1},
     {id:'prosedur',ket:'Yang dinilai: pemilihan fungsi dan rentang multimeter, pemasangan paralel untuk tegangan dan seri untuk arus, pengukuran hambatan tanpa sumber, nol alat dicatat, urutan langkah.',n:'Prosedur kerja',b:30,d:{4:'Semua langkah urut, pemasangan benar, tanpa bantuan',3:'Urut dengan 1–2 koreksi kecil',2:'Beberapa langkah terbalik atau terlewat',1:'Tidak mengikuti prosedur, berisiko merusak alat atau rangkaian'}},
     {id:'hasil',ket:'Yang dinilai: bacaan benar (tabel F1–F3 dan latihan hitung), keputusan Sesuai atau Tidak sesuai berdasarkan standar guru, foto bukti ada dan jelas.',n:'Hasil kerja dan data',b:25,d:{4:'Data akurat, hitungan benar, keputusan sesuai standar',3:'Data akurat, 1 catatan perbaikan',2:'Data tidak lengkap atau keputusan kurang tepat',1:'Data salah atau tidak ada'}},
     {id:'waktu',ket:'Acuan waktu standar: total praktik '+jumMenit([1,2,3,4])+' menit, dibagi per kegiatan (tegangan '+jumMenit([1])+', hambatan '+jumMenit([2])+', arus '+jumMenit([3])+', verifikasi dan penyimpanan '+jumMenit([4])+'). Isi waktu aktualmu di tiap kartu kegiatan pada Lembar Kerja.',n:'Waktu dan efisiensi',b:10,d:{4:'Dalam waktu standar',3:'Hingga 125%',2:'Hingga 150%',1:'Lebih dari 150%'}},
     {id:'5r',ket:'Yang dinilai: selector multimeter ke OFF, kabel digulung, alat kembali, tumpahan dilap, limbah terpisah.',n:'5R dan limbah',b:5,d:{4:'Area bersih, alat kembali, limbah terpisah',3:'Satu hal terlewat',2:'Dua hal terlewat',1:'Area dibiarkan kotor'}},
     {id:'sikap',ket:'Yang dinilai: jujur mencatat hasil sendiri (tidak menyalin data teman), aktif, membantu teman, mengikuti arahan guru.',n:'Sikap dan kerja sama',b:10,d:{4:'Aktif, jujur, membantu teman',3:'Aktif, sesekali diingatkan',2:'Pasif',1:'Mengganggu kegiatan'}}
    ],
    indikator:[
     {t:'Menjelaskan arus, tegangan, hambatan, dan satuannya',bukti:'Prasyarat masuk, latihan soal 1–2'},
     {t:'Mengukur tegangan baterai dan lampu dengan benar (paralel)',bukti:'Tabel F1, kegiatan 1 disaksikan'},
     {t:'Mengukur hambatan pada rangkaian tanpa sumber dan mencatat nol alat',bukti:'Tabel F2, kegiatan 2 disaksikan'},
     {t:'Mengukur arus dengan multimeter dipasang seri',bukti:'Tabel F3, kegiatan 3 disaksikan, foto rangkaian'},
     {t:'Menghitung arus, tegangan, hambatan, dan daya dengan hukum Ohm',bukti:'Latihan soal 1–6'},
     {t:'Membandingkan hasil hitung dan hasil ukur serta menjelaskan selisihnya',bukti:'Tabel F3, analisis 1 dan 3'},
     {t:'Menentukan langkah pengukuran awal pada lampu yang redup',bukti:'Analisis 5'},
     {t:'K3, APD, 5R, dan limbah',bukti:'Daftar APD, kegiatan 4'}
    ],
    panduan:[
     {k:'Mengukur tegangan',lihat:'Selector VDC, probe paralel, rentang di atas 12 V, probe tidak menyentuh kedua kutub sekaligus',salah:'Multimeter dipasang seri, selector ohm atau ADC, probe dibiarkan di jack arus'},
     {k:'Mengukur hambatan',lihat:'Sumber dilepas, nol alat dicatat, tangan tidak menyentuh probe',salah:'Mengukur pada rangkaian bertegangan, tidak mencatat nol alat'},
     {k:'Mengukur arus',lihat:'Rangkaian diputus lalu multimeter dipasang seri, kabel berfuse, rentang terbesar lebih dulu',salah:'Ammeter dipasang paralel pada baterai, mengukur tanpa izin guru'},
     {k:'Verifikasi dan penyimpanan',lihat:'Satuan dicek, R = V ÷ I benar, selector OFF dan kabel rapi',salah:'Satuan tertukar, hasil disalin dari teman, selector dibiarkan di ADC'}
    ],
    henti:'Hentikan praktik bila siswa mengabaikan K3 (skor 1 pada Persiapan dan K3).'
   }
  }
 };
 if(typeof LKPD_EXTRA_MODULES==='undefined')window.LKPD_EXTRA_MODULES=[];
 LKPD_EXTRA_MODULES=LKPD_EXTRA_MODULES.concat([m]);
})();
