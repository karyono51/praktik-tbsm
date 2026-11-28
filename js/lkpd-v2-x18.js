/* lkpd-v2-x18.js: LKPD v2 LKPD-DDO-KOM-03 (Membongkar, Memeriksa, dan Memasang Komponen sesuai Manual Servis), Kelas X Genap, TP X.6.4. Hanya DATA, ditambahkan ke LKPD_EXTRA_MODULES.
   Mengikuti Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx: LKPD-DDO-KOM-03, job sheet praktik, 36 JP (9 pertemuan x 4 JP, Kelas X),
   unit SKKNI 034 (level 2, ditambahkan sebagai usulan), 049 (L3), 051 (L3), 052 (L3).
   Dimuat setelah lkpd-v2-x12.js dan sebelum lkpd.js. Struktur mengikuti master LKPD V2 (LKPD-DDO-ALT-02). Status awal Draft.
   Angka spesifikasi (torsi, batas kerataan, celah piston dan ring, hambatan stator, tebal plat kopling, jenis dan jumlah oli) sengaja KOSONG: guru mengisinya dari manual servis
   sepeda motor yang dipakai di bengkel. Angka pada soal hanya contoh hitung, bukan standar.
   Rujukan SKKNI 147/2019 hanya usulan pemetaan dan perlu diverifikasi sebelum dipakai untuk asesmen. Unit level 3 (049, 051, 052) dipakai pada tingkat pengenalan dan
   pemeriksaan (Kelas X); bak transmisi tidak dibuka (pembongkaran poros dan gigi dikerjakan pada LKPD-TSM-PMT-02).
   9 pertemuan x 4 JP (180 menit, 45 menit per JP) = 36 JP. Pertemuan 1 = pemantik, materi, prasyarat, APD, cek alat (tanpa kegiatan); Pertemuan 2 sampai 8 = Kegiatan 1 sampai 7,
   satu kegiatan per pertemuan; Pertemuan 9 = penilaian kinerja, refleksi, remedial atau pengayaan (tanpa kegiatan). Tiap kegiatan menyelesaikan satu siklus bongkar, periksa, pasang,
   sehingga engine atau trainer kembali utuh pada akhir pertemuan dan dapat dipakai rombel berikutnya. Praktik memakai engine atau trainer sepeda motor dingin, mesin hanya
   dihidupkan pada Kegiatan 7 atas izin guru. */
(function(){
 var langkah=[
  {k:1,m:10,t:'Baca perintah kerja dan halaman manual servis: temukan urutan pelepasan cover body, jenis baut dan klip, peringatan, dan daftar alat; catat nomor halaman',p:'Manual servis menjadi acuan, bukan ingatan'},
  {k:1,m:15,t:'Siapkan area dan wadah bernomor; kontak kunci OFF dan kunci dicabut; foto kondisi motor atau trainer sebelum dibongkar',p:'Foto sebelum dibongkar; kunci kontak dicabut'},
  {k:1,m:35,t:'Lepas cover body sesuai urutan manual; letakkan baut, klip, dan grommet pada wadah sesuai nomor langkah',p:'Klip dilepas dengan pencungkil, tidak ditarik paksa',saksi:1},
  {k:1,m:20,t:'Periksa cover, klip, grommet, dan lubang baut (retak, patah, ulir rusak, bekas panas); catat kondisinya pada Pemeriksaan dan bukti',p:'Klip patah diganti, tidak dipakai ulang'},
  {k:1,m:30,t:'Pasang kembali cover berurutan kebalikan urutan bongkar: kencangkan baut dengan tangan dulu, baru kencangkan akhir',p:'Tidak ada kabel terjepit; celah antar-cover rata',saksi:1},
  {k:1,m:10,t:'Bandingkan hasil pasang dengan foto awal dan manual servis, lalu putuskan Sesuai atau Tidak sesuai',p:'Keputusan berdasarkan manual, bukan dugaan'},
  {k:2,m:10,t:'Baca manual servis: nilai torsi, urutan pengencangan, dan satuan (N·m atau kgf·m) untuk baut latihan; catat pada Pemeriksaan dan bukti',p:'Satuan torsi dicek: N·m atau kgf·m'},
  {k:2,m:10,t:'Periksa kunci torsi (jenis, rentang kerja, kondisi) dan atur nilai torsi; kunci torsi tidak dipakai untuk melonggarkan baut',p:'Atur nilai dalam rentang kerja kunci torsi'},
  {k:2,m:30,t:'Pasang baut latihan pada papan latihan atau trainer: kencangkan tangan semua baut dulu, lalu bertahap bersilang (setengah torsi, kemudian torsi penuh) sampai kunci torsi berbunyi klik',p:'Tarik halus dan tegak lurus; berhenti saat klik',saksi:1},
  {k:2,m:15,t:'Periksa ulang semua baut dengan kunci torsi dan beri tanda; catat baut yang belum klik',p:'Tidak menarik kunci torsi melewati klik'},
  {k:2,m:20,t:'Lepas baut kebalikan urutan pasang (bersilang, dari luar ke dalam) dan periksa ulir serta ring',p:'Ulir rusak atau ring penyok dicatat dan diganti'},
  {k:2,m:15,t:'Kembalikan kunci torsi pada setelan terendah dan simpan pada kotaknya',p:'Kunci torsi tidak dijatuhkan dan disimpan pada setelan terendah'},
  {k:3,m:10,t:'Pastikan engine dingin, terpasang kuat, kunci kontak OFF, kabel busi dan busi dilepas; foto kondisi; baca urutan lepas tutup kepala silinder dan kepala silinder pada manual',p:'Engine dingin; kabel busi dilepas'},
  {k:3,m:25,t:'Lepas tutup kepala silinder dan periksa rocker arm atau poros (aus, goresan); catat kondisinya',p:'Komponen disusun berurutan di baki'},
  {k:3,m:25,t:'Lepas kepala silinder: kendurkan baut bertahap bersilang dari luar ke dalam; susun baut dan komponen berurutan',p:'Bidang rapat tidak dicongkel dengan obeng; gasket diganti',saksi:1},
  {k:3,m:20,t:'Bersihkan bidang rapat tanpa menggores; periksa ruang bakar (kerak, retak) dan dudukan klep secara visual',p:'Kerak dikikis hati-hati; bidang rapat tidak tergores'},
  {k:3,m:25,t:'Ukur kerataan bidang rapat: letakkan penggaris baja pada beberapa arah dan ukur celah dengan feeler gauge; catat pada Pemeriksaan dan bukti',p:'Feeler gauge digeser halus, tidak dipaksa; standar dari manual',saksi:1},
  {k:3,m:30,t:'Pasang gasket baru dan kepala silinder; kencangkan baut bertahap bersilang sesuai torsi manual; pasang tutup kepala silinder',p:'Torsi dan urutan sesuai manual servis',saksi:1},
  {k:4,m:10,t:'Pastikan engine dingin; baca manual: urutan lepas silinder, piston, dan ring; tutup lubang bak engkol dengan kain bersih',p:'Lubang bak engkol ditutup agar tidak ada benda jatuh'},
  {k:4,m:25,t:'Lepas silinder, lalu pen piston dan piston; beri tanda arah piston (panah) dan simpan berurutan',p:'Arah panah piston dicatat; pen piston tidak dipukul keras',saksi:1},
  {k:4,m:20,t:'Lepas ring piston dengan pelepas ring (tidak ditarik tangan), bersihkan alur ring, dan periksa goresan serta keausan',p:'Ujung ring tajam; pakai sarung tangan dan kacamata'},
  {k:4,m:25,t:'Ukur diameter piston dengan mikrometer dan diameter dalam silinder pada titik ukur manual; hitung celah piston dan silinder; catat pada Pemeriksaan dan bukti',p:'Mikrometer bersih dan nolnya dicek; ukur tegak lurus',saksi:1},
  {k:4,m:15,t:'Ukur celah ujung ring: dorong ring ke dalam silinder dengan kepala piston, ukur celah dengan feeler gauge; catat',p:'Ring masuk rata (tegak lurus) pada silinder'},
  {k:4,m:30,t:'Pasang ring dengan tanda atas menghadap ke atas dan celah ujung ring berselang sesuai manual, oles oli, pasang piston searah panah, pen piston, dan silinder',p:'Ring tidak dipaksa; arah panah dan tanda atas benar',saksi:1},
  {k:5,m:10,t:'Baca manual: urutan lepas cover generator, rotor (flywheel), dan stator; catat alat khusus (puller rotor, penahan rotor) dan peringatan magnet',p:'Alat khusus disiapkan sebelum mulai'},
  {k:5,m:10,t:'Lepas konektor kabel generator dan beri tanda kabel; lepas cover generator dengan hati-hati',p:'Rotor bermagnet menarik benda logam; alat logam dijauhkan'},
  {k:5,m:25,t:'Tahan rotor dengan penahan, lepas mur rotor, lalu tarik rotor dengan puller (tidak dipukul)',p:'Puller tegak lurus; rotor tidak dipukul',saksi:1},
  {k:5,m:20,t:'Periksa rotor (magnet, alur pasak) dan stator (kumparan, insulasi, kabel): retak, gosong, serbuk logam; catat pada Pemeriksaan dan bukti',p:'Serbuk logam pada magnet dibersihkan dengan pita perekat'},
  {k:5,m:15,t:'Ukur hambatan kumparan stator dengan multimeter ohm antar-kabel (konektor dilepas, rangkaian tanpa tegangan); catat nol alat dan hasilnya',p:'Nol alat dicatat; hanya pada rangkaian tanpa tegangan',saksi:1},
  {k:5,m:30,t:'Pasang kembali stator dan rotor (pasak pada alur), kencangkan mur rotor sesuai torsi manual dengan penahan rotor; pasang cover dan konektor',p:'Pasak masuk alur; torsi sesuai manual',saksi:1},
  {k:6,m:10,t:'Kuras oli transmisi ke wadah (engine dingin); catat warna dan serbuk logam; baca urutan lepas cover kopling pada manual',p:'Oli bekas ke wadah limbah'},
  {k:6,m:20,t:'Lepas cover kopling dan paket kopling (pegas, plat tekan, plat kopling, plat penghantar) sesuai urutan manual; susun berurutan pada baki',p:'Urutan plat tidak tertukar',saksi:1},
  {k:6,m:25,t:'Ukur tebal plat kopling dengan jangka sorong dan panjang bebas pegas kopling; catat pada Pemeriksaan dan bukti',p:'Nol jangka sorong dicek; rahang tegak lurus',saksi:1},
  {k:6,m:15,t:'Periksa plat penghantar (melengkung, bekas terbakar), rumah kopling, dan gigi primer (aus, retak); catat',p:'Plat diletakkan rata saat diperiksa'},
  {k:6,m:10,t:'Putar poros transmisi dengan tangan dan pindahkan gigi dengan pedal tanpa membuka bak transmisi; rasakan hambatan dan catat',p:'Bak transmisi tidak dibuka pada LKPD ini'},
  {k:6,m:30,t:'Pasang paket kopling berurutan sesuai manual, pasang cover dengan gasket, kencangkan sesuai torsi, dan isi oli transmisi sesuai manual',p:'Jenis dan jumlah oli dari manual, bukan dugaan',saksi:1},
  {k:7,m:15,t:'Periksa akhir: jumlah baut dan klip terpasang sama dengan yang dilepas, semua baut diberi tanda torsi, selang dan kabel terpasang, level oli pada batas',p:'Tidak boleh ada baut atau komponen tersisa',saksi:1},
  {k:7,m:10,t:'Pasang busi dan kabel busi; area bebas kain dan alat; siapkan engine dihidupkan di ruang berventilasi dengan knalpot dialirkan ke saluran gas buang',p:'Ventilasi dan saluran gas buang aktif sebelum engine dihidupkan'},
  {k:7,m:20,t:'Hidupkan engine atas izin dan pengawasan guru: dengarkan bunyi abnormal, amati kebocoran oli pada cover dan gasket, asap, dan getaran',p:'Tangan dan alat dijauhkan dari bagian berputar; atas izin guru',saksi:1},
  {k:7,m:15,t:'Matikan engine, tunggu dingin, periksa ulang kebocoran dan level oli; catat pada Pemeriksaan dan bukti',p:'Kebocoran dilaporkan kepada guru'},
  {k:7,m:30,t:'Lengkapi laporan servis: kegiatan, komponen yang dibongkar, hasil ukur dan standar, keputusan (setel, perbaiki, ganti), dan saran',p:'Hasil ukur disalin dari catatan sendiri, bukan dari teman'},
  {k:7,m:15,t:'Rapikan area (5R): alat dibersihkan dan dikembalikan, oli bekas dan majun kotor ke wadah limbah',p:'Oli bekas tidak dibuang ke saluran air'}
 ];
 /* Menit tiap kegiatan = jumlah menit langkahnya; angka pada target pertemuan dan rubrik dicocokkan dengan ini (diuji). */
 function jumMenit(ks){return langkah.filter(function(x){return ks.indexOf(x.k)>-1}).reduce(function(t,x){return t+x.m},0)}
 var kegiatan=['Manual servis dan cover body','Pengencangan sesuai torsi dan urutan','Kepala silinder','Silinder, piston, dan ring','Generator section','Kopling dan transmisi','Uji fungsi dan laporan servis'];
 var m={
  id:'LKPD-DDO-KOM-03',alias:['LKPD-X-18'],prodi:'DDO',cp:'KOM',version:2,kelas:'X',fase:'E',status:'draft',active:false,tahap:true,mode:'ujian',
  title:'Membongkar, Memeriksa, dan Memasang Komponen sesuai Manual Servis',
  unit:'Engine sepeda motor: cover body, kepala silinder, piston, generator, dan kopling',duration:1620,
  skkni:'unit 034, 049 (L3), 051 (L3), 052 (L3) (usulan, verifikasi)',
  objectives:['Membaca manual servis untuk menemukan urutan kerja, torsi, standar, batas pakai, alat khusus, dan peringatan.','Membongkar, memeriksa, dan memasang kembali cover body, kepala silinder, piston dan silinder, generator, serta kopling sesuai manual servis.','Mengencangkan baut dengan kunci torsi sesuai nilai dan urutan pada manual servis.','Mengukur kerataan, celah piston dan silinder, celah ujung ring, hambatan stator, dan tebal plat kopling, lalu membandingkannya dengan standar manual servis.','Menguji fungsi engine atas izin guru, menyusun laporan servis, dan menerapkan K3 serta 5R selama praktik.'],
  theory:[
   ['Pertanyaan pemantik','Mengapa pekerjaan bongkar pasang harus mengikuti manual servis dan bukan perkiraan? Apa akibatnya bila baut dikencangkan terlalu longgar atau terlalu kencang, atau bila komponen terpasang dengan urutan terbalik? Bagaimana kamu memastikan tidak ada baut yang tersisa setelah engine dirakit?'],
   ['Manual servis dan istilahnya','Manual servis memuat urutan kerja, spesifikasi (standar), batas pakai (service limit), nilai torsi, alat khusus, dan peringatan. Hasil ukur dalam standar berarti Sesuai. Hasil ukur melewati batas pakai berarti Tidak sesuai dan komponen disetel, diperbaiki, atau diganti. Nilai dan istilah selalu dibaca dari manual servis motor yang dikerjakan, bukan dari ingatan.'],
   ['Prosedur umum bongkar, periksa, pasang','Foto kondisi awal, siapkan wadah bernomor, bongkar sesuai urutan manual, bersihkan, periksa visual, ukur, bandingkan dengan standar, lalu pasang kembali berurutan kebalikan urutan bongkar. Gasket, seal, dan klip yang rusak atau sekali pakai diganti. Setelah dirakit, jumlah baut dan klip yang terpasang dicocokkan dengan yang dilepas.'],
   ['Alat tangan dan kunci torsi','Kunci pas, kunci ring, kunci sok, dan obeng dipilih sesuai ukuran dan bentuk kepala baut. Kunci torsi dipakai hanya untuk pengencangan akhir, tidak untuk melonggarkan, dan disimpan pada setelan terendah. Torsi = gaya × panjang lengan (N·m). Satuan lain: kgf·m (1 kgf·m ≈ 9,8 N·m). Baut multi-titik dikencangkan bertahap dan bersilang agar bidang rapat dan gasket menekan merata.'],
   ['Cover body','Cover body menutup rangka dan komponen lain dan diikat dengan baut, klip, dan grommet. Urutan pelepasan mengikuti manual; baut dan klip diletakkan sesuai nomor langkah. Klip patah dan grommet rusak diganti agar cover tidak bergetar, dan kabel tidak boleh terjepit saat dipasang.'],
   ['Power section: kepala silinder, silinder, piston, dan ring','Kepala silinder menutup silinder dan membentuk ruang bakar; gasket di antaranya harus rapat. Kerataan bidang rapat diukur dengan penggaris baja dan feeler gauge. Celah piston dan silinder = diameter dalam silinder − diameter piston pada titik ukur manual; celah ujung ring diukur dengan feeler gauge pada ring yang didorong rata ke dalam silinder. Volume langkah Vs = π/4 × D² × L, dan rasio kompresi = (Vs + Vc) ÷ Vc.'],
   ['Generator section','Generator terdiri dari rotor (flywheel dengan magnet) dan stator (kumparan). Rotor dilepas dengan penahan rotor dan puller, tidak dipukul. Kumparan stator diperiksa dengan multimeter pada rentang ohm, hanya pada rangkaian tanpa tegangan, dengan nol alat dicatat. Magnet rotor menarik benda logam sehingga alat logam dan jam tangan dijauhkan. Daya P = V × I (watt).'],
   ['Kopling dan transmisi (pengenalan)','Paket kopling terdiri dari pegas, plat tekan, plat kopling (bergesekan), dan plat penghantar. Plat kopling yang tipis dari batas pakai dan plat penghantar yang melengkung atau terbakar membuat kopling selip. Pada LKPD ini bak transmisi tidak dibuka; kamu memutar poros dan memindahkan gigi dengan tangan untuk merasakan hambatan. Oli transmisi dikuras, dan jenis serta jumlah oli pengganti mengikuti manual servis.'],
   ['Keselamatan dan kesehatan kerja (K3) pada bongkar pasang engine','Bahaya: komponen berat, tajam, dan panas, jari terjepit di antara bidang rapat, oli licin, bensin mudah terbakar, magnet rotor menarik benda logam, bagian berputar dan gas buang saat engine dihidupkan. Pengendalian: engine dingin dan terpasang kuat, kunci kontak OFF dan dicabut, sarung tangan dan kacamata sesuai pekerjaan, benda logam dijauhkan dari rotor, oli dan bensin tumpah segera dilap, engine hanya dihidupkan atas izin guru di ruang berventilasi.']
  ],
  tools:['Kunci pas, kunci ring, kunci sok dan gagang, obeng, pencungkil klip','Kunci torsi dan papan latihan baut','Jangka sorong, mikrometer, feeler gauge, dan penggaris baja','Puller dan penahan rotor, pelepas ring piston, multimeter','Engine atau trainer sepeda motor, baki komponen, wadah bernomor','Majun, pembersih, wadah oli bekas, gasket baru, dan oli sesuai manual servis'],
  safety:['Pakaian praktik (wearpack) lengkap dan dikancing; lengan baju tidak menjuntai','Sepatu tertutup (sepatu safety) terpasang','Sarung tangan dipakai saat memegang komponen berminyak, tajam, atau panas; dilepas saat membaca alat ukur dan di dekat bagian berputar','Kacamata pelindung dipakai saat melepas cover, klip dan ring, membersihkan, dan saat engine dihidupkan','Engine dingin, mati, dan terpasang kuat; kontak kunci OFF dan kunci dicabut sebelum dibongkar','Alat sesuai ukuran dan dalam kondisi baik; kunci torsi tidak dipakai untuk melonggarkan; komponen dipegang dari sisi dan jari tidak di antara bidang rapat','Cincin, gelang, dan jam tangan dilepas; rambut panjang diikat; alat logam dijauhkan dari rotor generator','Engine hanya dihidupkan atas izin dan pengawasan guru di ruang berventilasi; tangan dijauhkan dari bagian berputar; hanya mengerjakan komponen yang diperintahkan','Oli dan bensin tumpah segera dilap, api dijauhkan dari bensin; oli bekas dan majun kotor dibuang ke wadah limbah yang disediakan','Letak APAR, kotak P3K, jalur keluar, dan titik kumpul bengkel sudah diketahui; nama guru pembimbing dicatat'],
  steps:langkah.map(function(x){return ['Kegiatan '+x.k+' · '+x.t,0,x.p]}),
  checks:[
   ['Kondisi cover body, klip, dan grommet','Retak, patah, ulir rusak dicatat; foto kondisi'],
   ['Torsi dan urutan pengencangan baut latihan','Nilai, satuan, dan urutan dari manual servis; foto setelan kunci torsi'],
   ['Kerataan bidang rapat kepala silinder','Celah feeler gauge dibanding standar manual; foto pengukuran'],
   ['Kondisi ruang bakar dan dudukan klep','Kerak, retak, goresan dicatat'],
   ['Celah piston dan silinder','Diameter piston dan silinder serta selisihnya dibanding standar; foto bacaan'],
   ['Celah ujung ring piston','Hasil ukur dibanding standar manual'],
   ['Kondisi rotor dan stator generator','Magnet, kumparan, dan insulasi dicatat; foto kondisi'],
   ['Hambatan kumparan stator','Hasil ohmmeter dikurangi nol alat, dibanding standar'],
   ['Tebal plat kopling dan panjang pegas kopling','Hasil ukur dibanding batas pakai; foto bacaan'],
   ['Kondisi oli, paket kopling, dan gigi primer','Warna dan serbuk logam oli, aus atau terbakar dicatat'],
   ['Kebocoran dan level oli setelah uji fungsi','Tidak bocor dan level oli pada batas; foto hasil'],
   ['Laporan servis dan 5R','Laporan terisi, area bersih, limbah terpisah; foto hasil']
  ],
  fotoWajib:[0,1,2,4,8,10],
  symptoms:[],
  quiz:[
   {t:'isian',id:'T1',q:'Kunci torsi memiliki panjang lengan 0,25 m dan ditarik dengan gaya 40 N. Hitung torsi yang bekerja (N·m).',kunci:10,tol:0.005,u:'N·m',e:'Torsi = gaya × lengan = 40 × 0,25 = 10'},
   {t:'isian',id:'T2',q:'Manual servis menyebut torsi sebuah baut 1,2 kgf·m, sedangkan kunci torsi berskala N·m (1 kgf·m = 9,8 N·m). Hitung nilai yang diatur (N·m).',kunci:11.76,tol:0.005,u:'N·m',e:'1,2 × 9,8 = 11,76'},
   {t:'isian',id:'H1',q:'Kerataan bidang rapat kepala silinder diukur pada tiga arah dengan feeler gauge: 0,03 mm; 0,05 mm; dan 0,04 mm. Hitung rata-ratanya (mm).',kunci:0.04,tol:0.005,u:'mm',e:'(0,03 + 0,05 + 0,04) ÷ 3 = 0,12 ÷ 3 = 0,04'},
   {t:'isian',id:'H2',q:'Volume langkah silinder 108 cm³ dan volume ruang bakar 12 cm³. Hitung rasio kompresi (angka saja, rasio = (Vs + Vc) ÷ Vc).',kunci:10,tol:0.005,u:'',e:'(108 + 12) ÷ 12 = 120 ÷ 12 = 10'},
   {t:'isian',id:'V1',q:'Diameter silinder (bore) 50 mm dan langkah (stroke) 55 mm. Hitung volume langkah dalam cm³ (π = 3,14; Vs = π × r² × L; ubah mm ke cm).',kunci:107.94,tol:0.01,u:'cm³',e:'r = 2,5 cm; L = 5,5 cm; Vs = 3,14 × 2,5² × 5,5 = 3,14 × 6,25 × 5,5 = 107,94'},
   {t:'isian',id:'V2',q:'Diameter dalam silinder 50,010 mm dan diameter piston 49,975 mm. Hitung celah piston dan silinder (mm).',kunci:0.035,tol:0.0005,u:'mm',e:'50,010 − 49,975 = 0,035'},
   {t:'isian',id:'V3',q:'Celah ujung ring terukur 0,22 mm; 0,26 mm; dan 0,24 mm pada tiga kali pengukuran. Hitung rata-ratanya (mm).',kunci:0.24,tol:0.005,u:'mm',e:'(0,22 + 0,26 + 0,24) ÷ 3 = 0,72 ÷ 3 = 0,24'},
   {t:'isian',id:'G1',q:'Tiga kumparan stator terukur 0,6 Ω; 0,7 Ω; dan 0,5 Ω, sedangkan nol alat 0,1 Ω. Hitung rata-rata hambatan setelah dikurangi nol alat (Ω).',kunci:0.5,tol:0.005,u:'Ω',e:'(0,6 + 0,7 + 0,5) ÷ 3 = 0,6; 0,6 − 0,1 = 0,5'},
   {t:'isian',id:'G2',q:'Generator menghasilkan tegangan 14 V pada arus 8 A. Hitung dayanya (W).',kunci:112,tol:0.005,u:'W',e:'P = V × I = 14 × 8 = 112'},
   {t:'isian',id:'L1',q:'Tebal plat kopling terukur 2,90 mm; 2,95 mm; dan 3,00 mm. Hitung rata-ratanya (mm).',kunci:2.95,tol:0.005,u:'mm',e:'(2,90 + 2,95 + 3,00) ÷ 3 = 8,85 ÷ 3 = 2,95'},
   {t:'isian',id:'L2',q:'Tebal plat kopling rata-rata 2,95 mm dan batas pakai pada contoh manual 2,70 mm. Hitung sisa tebal sebelum mencapai batas pakai (mm).',kunci:0.25,tol:0.005,u:'mm',e:'2,95 − 2,70 = 0,25'},
   {t:'isian',id:'W1',q:'Waktu standar sebuah kegiatan 120 menit dan waktu aktual 150 menit. Hitung waktu aktual sebagai persen dari waktu standar (%).',kunci:125,tol:0.5,u:'%',e:'150 ÷ 120 × 100 = 125'}
  ],
  rubric:{steps:30,safety:20,checks:25,analysis:25,practiceWeight:85,theoryWeight:15},
  validation:{vehicle:false,evidence:false,cause:false,conclusion:false,atLeastOneCheck:true},
  v2:{
   ver:2,jenis:'jobsheet',jp:36,tp:'X.6.4',cp:'Komponen Otomotif',
   pertemuan:[
    {n:1,jp:4,menit:180,judul:'Pemantik, materi, prasyarat masuk, APD, cek alat',kegiatan:[],sembunyi:true},
    {n:2,jp:4,menit:180,judul:'Kegiatan 1 manual servis dan cover body',kegiatan:[1],latihan:[],praktik:jumMenit([1]),kartu:{judul:'Kegiatan 1 manual servis dan cover body'}},
    {n:3,jp:4,menit:180,judul:'Kegiatan 2 pengencangan sesuai torsi dan urutan, latihan soal 1–2',kegiatan:[2],latihan:['T1','T2'],praktik:jumMenit([2]),kartu:{judul:'Kegiatan 2 pengencangan sesuai torsi dan urutan'}},
    {n:4,jp:4,menit:180,judul:'Kegiatan 3 kepala silinder, latihan soal 3–4',kegiatan:[3],latihan:['H1','H2'],praktik:jumMenit([3]),kartu:{judul:'Kegiatan 3 kepala silinder'}},
    {n:5,jp:4,menit:180,judul:'Kegiatan 4 silinder, piston, dan ring, latihan soal 5–7',kegiatan:[4],latihan:['V1','V2','V3'],praktik:jumMenit([4]),kartu:{judul:'Kegiatan 4 silinder, piston, dan ring'}},
    {n:6,jp:4,menit:180,judul:'Kegiatan 5 generator section, latihan soal 8–9',kegiatan:[5],latihan:['G1','G2'],praktik:jumMenit([5]),kartu:{judul:'Kegiatan 5 generator section'}},
    {n:7,jp:4,menit:180,judul:'Kegiatan 6 kopling dan transmisi, latihan soal 10–11',kegiatan:[6],latihan:['L1','L2'],praktik:jumMenit([6]),kartu:{judul:'Kegiatan 6 kopling dan transmisi'}},
    {n:8,jp:4,menit:180,judul:'Kegiatan 7 uji fungsi dan laporan servis, latihan soal 12, analisis',kegiatan:[7],latihan:['W1'],praktik:jumMenit([7]),kartu:{judul:'Kegiatan 7 uji fungsi dan laporan servis'}},
    {n:9,jp:4,menit:180,judul:'Penilaian kinerja, refleksi, remedial atau pengayaan',kegiatan:[],sembunyi:true}
   ],
   kegiatan:kegiatan,judulPendek:'Bongkar Pasang Komponen',
   cekAlat:['Kunci torsi: tidak ada kerusakan, rentang kerja sesuai nilai torsi, mekanisme klik berfungsi, setelan terakhir terendah','Jangka sorong, mikrometer, dan feeler gauge: permukaan ukur bersih, nol tepat atau penyimpangan dicatat, bilah feeler tidak bengkok','Engine atau trainer: terpasang kuat, dingin, tidak ada kebocoran oli; baki komponen, wadah bernomor, puller, dan wadah oli bekas siap'],
   tindak:{remedial:'Remedial (bila belum tuntas): ulangi latihan hitung dan pengukuran dengan soal dan komponen dari guru, lalu ulangi bongkar pasang bagian yang belum tepat (urutan, torsi, atau pembacaan alat ukur).',pengayaan:'Pengayaan (bila sudah tuntas): analisis kasus tenaga engine turun dan oli boros, tentukan bagian yang diperiksa lebih dulu berdasarkan manual servis, dan putuskan setel, perbaiki, atau ganti berdasarkan batas pakai.'},
   langkah:langkah.map(function(x,i){return {i:i,k:x.k,saksi:!!x.saksi,menit:x.m||0}}),
   apd:[0,1,2,3],
   k3grup:[{judul:'Alat pelindung diri (APD)',i:[0,1,2,3]},{judul:'Persiapan diri dan area kerja',i:[4,5,6]},{judul:'Larangan saat praktik',i:[7]},{judul:'Kebersihan dan keadaan darurat',i:[8,9]}],
   cekK:[1,2,3,3,4,4,5,5,6,6,7,7],
   gate:{qs:[
    {t:'pg',lvl:'Aplikasi',q:'Siswa akan mengencangkan delapan baut kepala silinder setelah gasket baru dipasang. Manual servis menyebut nilai torsi dan urutan bersilang. Cara yang paling tepat adalah ...',
     o:['mengencangkan satu baut sampai torsi penuh, lalu baut di sebelahnya satu per satu berurutan melingkar','mengencangkan semua baut dengan tangan, lalu bertahap bersilang (setengah torsi, lalu torsi penuh) sampai kunci torsi klik','mengencangkan sekuat tenaga dengan gagang panjang agar gasket pasti rapat dan tidak perlu dikencangkan ulang','mengencangkan baut sudut sampai torsi penuh lebih dulu, lalu baut bagian tengah dengan torsi yang lebih kecil dari manual servis','mengencangkan dengan kunci sok biasa sampai terasa keras, karena kunci torsi hanya dipakai untuk melonggarkan'],a:1,
     e:'Baut dikencangkan bertahap dan bersilang sampai torsi manual agar bidang rapat dan gasket menekan merata. Pengecoh: A membuat bidang miring; C merusak ulir dan gasket; D membuat tekanan tidak merata; E tidak menjamin torsi dan kunci torsi bukan untuk melonggarkan.'},
    {t:'pg',lvl:'Aplikasi',q:'Manual servis menyebut torsi sebuah baut cover generator 1,5 kgf·m. Kunci torsi di bengkel berskala N·m dan 1 kgf·m = 9,8 N·m. Nilai yang diatur pada kunci torsi adalah ...',
     o:['0,15 N·m','1,5 N·m','14,7 N·m','6,5 N·m','11,3 N·m'],a:2,
     e:'1,5 × 9,8 = 14,7 N·m. Pengecoh: A membagi dengan 9,8 lalu salah letak koma; B tanpa konversi; D membagi 9,8 dengan 1,5; E menjumlahkan 1,5 dan 9,8.'},
    {t:'kompleks',lvl:'Penalaran',q:'Silinder dan piston sudah dilepas dan siswa akan mengukur celah piston dan silinder. Pilih semua pernyataan yang benar.',
     o:['Celah diperoleh dari diameter dalam silinder dikurangi diameter piston pada titik ukur yang disebut manual servis.','Diameter piston boleh diukur pada titik mana saja karena bentuknya sama di seluruh tinggi piston.','Bila celah melebihi batas pakai pada manual, piston atau silinder perlu diganti atau diperbaiki sesuai manual.','Celah yang melebihi batas pakai masih aman asalkan oli engine ditambah lebih banyak dari biasanya.','Mikrometer dibersihkan dan nolnya dicek sebelum mengukur diameter piston.'],a:[0,2,4],
     e:'Celah = diameter silinder − diameter piston pada titik ukur manual; bila melewati batas pakai, komponen diganti atau diperbaiki; mikrometer dicek nolnya. Pengecoh: B piston tidak sama diameternya di semua titik; D oli tidak memperbaiki celah yang terlalu besar.'},
    {t:'kategori',lvl:'Penalaran',q:'Rotor generator (flywheel) akan dilepas dan stator diperiksa. Tentukan setiap pernyataan Benar atau Salah.',
     rows:[['Rotor ditahan dengan penahan rotor dan ditarik dengan puller khusus.',true],['Rotor boleh dipukul dengan palu besi bila puller tidak tersedia karena magnetnya kuat.',false],['Hambatan kumparan stator diukur dengan ohmmeter pada rangkaian tanpa tegangan dan nol alat dicatat.',true],['Alat logam dan jam tangan dijauhkan dari rotor karena magnetnya menarik benda logam.',true],['Serbuk logam pada magnet rotor boleh dibiarkan karena tidak memengaruhi pemasangan.',false]],lab:['Benar','Salah'],
     e:'Rotor dilepas dengan penahan dan puller; pukulan merusak magnet. Hambatan kumparan diukur pada rangkaian tanpa tegangan dengan nol alat dicatat. Benda logam dijauhkan dari magnet, dan serbuk logam dibersihkan agar tidak mengganggu rotor.'},
    {t:'pg',lvl:'Aplikasi',q:'Setelah engine dirakit kembali, siswa menemukan dua baut kecil tersisa di meja kerja. Tindakan yang paling tepat sebelum uji fungsi adalah ...',
     o:['menganggapnya baut cadangan karena semua cover tampak terpasang, lalu engine dihidupkan atas izin guru','menyimpan baut itu ke wadah limbah agar meja kerja bersih dan rapi, lalu melanjutkan ke uji fungsi engine','mencocokkan jumlah baut dan klip dengan wadah bernomor dan manual, menemukan lokasinya, lalu memasangnya','memasang baut itu pada lubang kosong terdekat agar tidak hilang, tanpa memeriksa letak aslinya','menanyakan teman kelompok lain tentang letak baut dan memasangnya sesuai ingatan teman'],a:2,
     e:'Baut yang tersisa menandakan ada yang terlewat; jumlah baut dan klip dicocokkan dengan wadah bernomor dan manual servis, dan letaknya ditemukan sebelum uji fungsi. Pengecoh: A dan B mengabaikan temuan; D dan E memasang tanpa acuan manual.'}
   ]},
   tabel:[],
   analisis:[
    'Bandingkan hasil ukur pada Pemeriksaan dan bukti dengan standar dan batas pakai manual servis. Bagian mana yang tidak sesuai dan tindakan apa (setel, perbaiki, ganti) yang kamu pilih?',
    'Mengapa baut dikencangkan bertahap, bersilang, dan sesuai torsi? Apa akibatnya pada gasket dan kepala silinder bila torsi terlalu besar, terlalu kecil, atau urutannya salah?',
    'Mengapa foto awal diambil dan komponen disusun berurutan pada wadah bernomor? Berikan satu contoh akibat bila urutan pasang terbalik.',
    'Hubungkan celah piston dan silinder serta celah ujung ring yang kamu ukur dengan gejala yang mungkin muncul pada motor (tenaga turun, oli boros, bunyi kasar).',
    'Apa yang kamu temukan saat uji fungsi, dan bagaimana kamu memastikan tidak ada baut atau komponen yang tersisa?',
    'Berapa waktumu dibanding waktu standar? Di langkah mana waktu terbuang?'
   ],
   refleksi:[
    'Bagian mana yang paling sulit (membaca manual servis, membongkar, mengukur, atau merakit) dan bagaimana kamu mengatasinya?',
    'Apa yang akan kamu lakukan berbeda pada praktik berikutnya?',
    'Bagaimana kerja kelompok membantu atau menghambat?',
    'Di bengkel atau DUDI, pekerjaan ini muncul pada situasi apa?'
   ],
   obs:{
    judul:'Observasi LKPD-DDO-KOM-03 Bongkar Pasang Komponen',
    aspek:[
     {id:'k3',ket:'Yang dinilai: APD terpasang benar (sarung tangan, kacamata), engine dingin dan terpasang kuat, kunci kontak OFF dan dicabut, jari tidak di antara bidang rapat, alat logam dijauhkan dari rotor, engine hanya dihidupkan atas izin guru, larangan K3 dipatuhi.',n:'Persiapan dan K3',b:20,d:{4:'APD lengkap, area dan alat aman tanpa diingatkan',3:'Lengkap, diingatkan 1 kali',2:'APD kurang atau area belum aman, diingatkan lebih dari 1 kali',1:'Mengabaikan K3 (praktik dihentikan)'},stop:1},
     {id:'prosedur',ket:'Yang dinilai: manual servis dipakai tiap kegiatan, urutan bongkar dan pasang sesuai manual, komponen disusun berurutan, kunci torsi dipakai dengan nilai dan urutan benar, alat ukur dan alat khusus dipakai benar, jumlah baut dan klip dicocokkan.',n:'Prosedur kerja',b:30,d:{4:'Semua langkah urut, manual servis dipakai, tanpa bantuan',3:'Urut dengan 1–2 koreksi kecil',2:'Beberapa langkah terbalik atau terlewat',1:'Tidak mengikuti prosedur, berisiko merusak komponen'}},
     {id:'hasil',ket:'Yang dinilai: bacaan ukur benar (Pemeriksaan dan bukti dan latihan hitung), keputusan Sesuai atau Tidak sesuai berdasarkan standar guru, foto bukti ada dan jelas, engine lulus uji fungsi tanpa kebocoran, laporan servis lengkap.',n:'Hasil kerja dan data',b:25,d:{4:'Data akurat, keputusan sesuai standar, uji fungsi lulus',3:'Data akurat, 1 catatan perbaikan',2:'Data tidak lengkap atau keputusan kurang tepat',1:'Data salah atau tidak ada'}},
     {id:'waktu',ket:'Acuan waktu standar: total praktik '+jumMenit([1,2,3,4,5,6,7])+' menit, dibagi per kegiatan (cover body '+jumMenit([1])+', torsi '+jumMenit([2])+', kepala silinder '+jumMenit([3])+', piston dan ring '+jumMenit([4])+', generator '+jumMenit([5])+', kopling '+jumMenit([6])+', uji fungsi dan laporan '+jumMenit([7])+'). Isi waktu aktualmu di tiap kartu kegiatan pada Lembar Kerja.',n:'Waktu dan efisiensi',b:10,d:{4:'Dalam waktu standar',3:'Hingga 125%',2:'Hingga 150%',1:'Lebih dari 150%'}},
     {id:'5r',ket:'Yang dinilai: meja bersih, alat dan komponen kembali, oli bekas dan majun kotor dipisah ke wadah limbah, kunci torsi pada setelan terendah.',n:'5R dan limbah',b:5,d:{4:'Area bersih, alat kembali, limbah terpisah',3:'Satu hal terlewat',2:'Dua hal terlewat',1:'Area dibiarkan kotor'}},
     {id:'sikap',ket:'Yang dinilai: jujur mencatat hasil sendiri (tidak menyalin data teman), aktif, membantu teman, mengikuti arahan guru.',n:'Sikap dan kerja sama',b:10,d:{4:'Aktif, jujur, membantu teman',3:'Aktif, sesekali diingatkan',2:'Pasif',1:'Mengganggu kegiatan'}}
    ],
    indikator:[
     {t:'Membaca manual servis: urutan, torsi, standar, batas pakai, alat khusus',bukti:'Prasyarat masuk, kegiatan 1 dan 2, analisis 1'},
     {t:'Membongkar, memeriksa, dan memasang cover body sesuai manual servis',bukti:'Kegiatan 1 disaksikan, foto'},
     {t:'Mengencangkan baut dengan kunci torsi sesuai nilai dan urutan',bukti:'Kegiatan 2 disaksikan, latihan soal 1–2, foto'},
     {t:'Membongkar, memeriksa (kerataan), dan memasang kepala silinder',bukti:'Kegiatan 3 disaksikan, latihan soal 3–4'},
     {t:'Mengukur dan memasang silinder, piston, dan ring',bukti:'Kegiatan 4 disaksikan, latihan soal 5–7'},
     {t:'Memeriksa rotor dan stator generator dan mengukur hambatan kumparan',bukti:'Kegiatan 5 disaksikan, latihan soal 8–9'},
     {t:'Memeriksa dan memasang paket kopling serta mengukur plat kopling',bukti:'Kegiatan 6 disaksikan, latihan soal 10–11'},
     {t:'Uji fungsi, laporan servis, K3, APD, 5R, dan limbah',bukti:'Kegiatan 7 disaksikan, daftar APD, laporan servis'}
    ],
    panduan:[
     {k:'Manual servis dan cover body',lihat:'Manual dibuka, foto awal, baut dan klip pada wadah bernomor, tidak ada kabel terjepit',salah:'Bongkar tanpa manual, klip ditarik paksa, baut tercampur'},
     {k:'Pengencangan sesuai torsi dan urutan',lihat:'Nilai torsi dan satuan dari manual, tangan dulu, bertahap bersilang, berhenti saat klik',salah:'Menarik melewati klik, kunci torsi dipakai melonggarkan, urutan melingkar'},
     {k:'Kepala silinder',lihat:'Engine dingin, kendur bersilang, bidang rapat tidak dicongkel, feeler gauge digeser halus',salah:'Bidang rapat dicongkel obeng, gasket lama dipakai ulang'},
     {k:'Silinder, piston, dan ring',lihat:'Arah panah piston dicatat, nol mikrometer dicek, ring rata saat diukur',salah:'Ring ditarik tangan, piston dipasang terbalik, lubang bak engkol terbuka'},
     {k:'Generator section',lihat:'Rotor ditahan dan ditarik dengan puller, nol alat ohm dicatat, alat logam dijauhkan',salah:'Rotor dipukul, mengukur hambatan pada rangkaian bertegangan'},
     {k:'Kopling dan transmisi',lihat:'Plat disusun berurutan, nol jangka sorong dicek, bak transmisi tidak dibuka, oli sesuai manual',salah:'Urutan plat tertukar, oli diperkirakan, bak transmisi dibuka tanpa perintah'},
     {k:'Uji fungsi dan laporan servis',lihat:'Jumlah baut dicocokkan, ventilasi aktif, atas izin guru, kebocoran dicek setelah dingin',salah:'Engine dihidupkan tanpa izin, baut tersisa diabaikan, laporan disalin dari teman'}
    ],
    henti:'Hentikan praktik bila siswa mengabaikan K3 (skor 1 pada Persiapan dan K3).'
   }
  }
 };
 if(typeof LKPD_EXTRA_MODULES==='undefined')window.LKPD_EXTRA_MODULES=[];
 LKPD_EXTRA_MODULES=LKPD_EXTRA_MODULES.concat([m]);
})();
