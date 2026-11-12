/* Bank soal TKA per unit LKPD: XI-6 Pemeliharaan Sistem Bahan Bakar Bensin. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-6',M='LKPD XI-6 Pemeliharaan Sistem Bahan Bakar Bensin',L=[];
function id(n){return 'lkxi6-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Sistem bahan bakar','Sistem bahan bakar berfungsi untuk ...',['Menyalurkan bensin dari tangki ke karburator atau injektor','Mendinginkan mesin','Mengatur rem','Menyetel katup'],0,'Sistem menyalurkan bensin dengan jumlah tepat.');
P(2,'Saringan bahan bakar','Saringan bahan bakar berfungsi untuk ...',['Menahan kotoran agar tidak masuk ke karburator atau injektor','Menambah tekanan','Mendinginkan bensin','Mengisi tangki'],0,'Saringan menahan kotoran.');
P(3,'Bensin mudah terbakar','Bensin harus dijauhkan dari ...',['Api dan percikan','Oli mesin','Air bersih','Kain lap'],0,'Bensin mudah terbakar.');
P(4,'Ventilasi','Pekerjaan dengan bensin sebaiknya dilakukan di ...',['Tempat berventilasi','Ruang tertutup','Dekat api','Tempat tanpa ventilasi'],0,'Ventilasi membuang uap bensin.');
P(5,'Tumpahan bensin','Tumpahan bensin harus dilap segera dan kain bekasnya ...',['Disimpan dengan aman','Dibiarkan kering','Dibakar','Disiram air keras'],0,'Kain bekas harus disimpan aman.');
P(6,'Tekanan injeksi','Pada sistem injeksi, tekanan bahan bakar dilepas sebelum ...',['Membuka selang','Mengisi tangki','Mengecat','Mencuci bodi'],0,'Tekanan bensin dilepas lebih dulu.');
P(7,'Filter udara','Filter udara dan throttle body berfungsi untuk ...',['Menjaga udara bersih dan jalur udara lancar','Mengisi bensin','Mengatur rem','Mendinginkan oli'],0,'Udara bersih mendukung pembakaran.');
P(8,'Kran bocor','Kran bahan bakar yang bocor dapat ...',['Menyebabkan kebocoran bensin','Menambah tenaga','Tidak berpengaruh','Menghemat bensin'],0,'Kebocoran bensin berbahaya.');
P(9,'Pompa bahan bakar','Pemeriksaan pompa bahan bakar meliputi ...',['Kerja dan aliran bensin','Warna pompa','Berat pompa','Panjang pompa'],0,'Kerja dan aliran diperiksa.');
P(10,'Idle naik-turun','Idle yang naik-turun dapat disebabkan ...',['Campuran atau saluran udara bermasalah','Ban penuh','Lampu terang','Rem belakang'],0,'Campuran dan udara memengaruhi idle.');
P(11,'Bau bensin','Bau bensin yang menyengat dapat menunjukkan ...',['Kebocoran bensin','Mesin baru','Oli baru','Ban baru'],0,'Bau menyengat berarti bocor.');
P(12,'Konsumsi boros','Konsumsi bensin yang boros dapat disebabkan oleh ...',['Campuran tidak tepat atau kebocoran','Mesin dingin sebentar','Oli penuh','Tidak ada penyebab'],0,'Campuran tidak tepat membuat boros.');
P(13,'Saringan kotor','Saringan bahan bakar dibersihkan atau diganti ketika ...',['Kotor atau sesuai kondisi','Mesin hidup','Panas','Tidak perlu'],0,'Mengikuti kondisi saringan.');
P(14,'Tersendat saat digas','Mesin tersendat saat digas dapat disebabkan oleh ...',['Aliran bensin atau udara tidak lancar','Oli terlalu sedikit selalu','Rem depan','Lampu sein'],0,'Aliran bensin dan udara menentukan.');
P(15,'Sulit hidup','Mesin sulit hidup dapat disebabkan oleh ...',['Aliran bensin atau busi bermasalah','Ban kempes','Setang bengkok','Spion longgar'],0,'Bensin dan busi memengaruhi penyalaan.');
P(16,'Penyetelan idle','Campuran dan idle disetel sesuai ...',['Spesifikasi manual','Selera pemilik','Diabaikan','Dengan memukul'],0,'Spesifikasi manual sebagai acuan.');
P(17,'Tangki bensin','Tangki bensin diperiksa kebocoran dan ...',['Keretakannya','Warna tangki','Merek tangki','Harga tangki'],0,'Retak dan bocor diperiksa.');
P(18,'Selang retak','Selang bahan bakar yang retak ...',['Harus diganti','Dilakban saja','Dibiarkan','Dicuci'],0,'Selang retak wajib diganti.');
P(19,'Saringan mampet','Saringan bahan bakar yang mampet ...',['Menghambat aliran bensin','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh'],0,'Aliran terhambat.');
P(20,'Pompa lemah','Pompa bahan bakar yang lemah menyebabkan ...',['Aliran bensin kurang','Tenaga bertambah','Konsumsi bensin turun','Tidak berpengaruh'],0,'Aliran kurang membuat mesin lemah.');
P(21,'Pemeriksaan kebocoran','Kebocoran bensin diperiksa dengan ...',['Pemeriksaan visual sesuai prosedur aman','Membakar sambungan','Menyalakan mesin di ruang tertutup','Tanpa melihat'],0,'Pemeriksaan visual yang aman.');
P(22,'Idle','Penyetelan idle mengikuti ...',['Spesifikasi manual','Selera pemilik','Suara knalpot','Warna kabel'],0,'Acuan manual.');
P(23,'Jalur bensin','Jalur bensin harus ...',['Bebas kebocoran','Memiliki celah','Berlubang','Dipanaskan'],0,'Jalur bensin harus rapat.');
P(24,'Pembersihan karburator','Karburator dibersihkan dengan ...',['Pembersih yang sesuai','Api terbuka','Air keras','Tanpa alat'],0,'Pembersih khusus dipakai.');
P(25,'Uji setelah perawatan','Setelah perawatan, mesin dihidupkan untuk ...',['Memeriksa kebocoran dan idle','Dibiarkan mati','Dipanaskan dengan api','Dipukul'],0,'Uji fungsi.');
P(26,'Wadah bensin','Bensin disimpan dalam wadah yang ...',['Tertutup dan berlabel','Terbuka','Berada dekat api','Diletakkan di lantai'],0,'Wadah tertutup dan berlabel.');
P(27,'Tekanan injeksi','Tekanan injeksi dilepas ...',['Sebelum membuka sambungan','Setelah membuka sambungan','Tidak perlu','Saat mesin hidup'],0,'Lepas tekanan sebelum membuka.');
P(28,'Filter udara kotor','Filter udara yang kotor berdampak pada ...',['Campuran dan tenaga','Ban dan rem','Lampu dan sein','Setang dan spion'],0,'Filter kotor memengaruhi campuran.');
P(29,'Langkah awal','Langkah awal pemeliharaan adalah ...',['Membaca manual dan menyiapkan alat dan wadah','Membuka tangki','Melepas selang','Menyalakan mesin'],0,'Persiapan dulu.');
P(30,'Uji fungsi','Uji fungsi dilakukan dengan ...',['Menghidupkan mesin dan memeriksa kebocoran','Mematikan segera','Memukul','Mengecat'],0,'Uji memastikan kerja.');
P(31,'Konsumsi bahan bakar','Konsumsi bahan bakar dipengaruhi oleh ...',['Campuran dan kebocoran','Warna motor','Merek ban','Tidak berpengaruh'],0,'Campuran dan kebocoran.');
P(32,'Pemasangan saringan','Saringan bahan bakar dipasang sesuai ...',['Arah aliran bensin','Arah sembarang','Tanpa arah','Di luar tangki'],0,'Arah aliran diperhatikan.');
P(33,'Bahaya kebocoran','Kebocoran bensin dapat ...',['Menimbulkan bahaya kebakaran','Tidak berbahaya','Menambah tenaga','Membuat mesin dingin'],0,'Bensin mudah terbakar.');
P(34,'Injeksi dan karburator','Sistem injeksi dan karburator ...',['Sama-sama mengatur campuran bahan bakar dan udara','Tidak ada hubungan','Hanya untuk motor listrik','Tidak perlu dibedakan'],0,'Keduanya mengatur campuran.');
P(35,'Idle','Idle dipengaruhi oleh ...',['Campuran dan saluran udara','Ban','Lampu','Setang'],0,'Campuran dan udara.');
P(36,'Selang saat dilepas','Saat melepas selang bahan bakar, mesin sebaiknya ...',['Mati','Hidup','Panas','Berputar'],0,'Mesin mati untuk keselamatan.');
P(37,'Wadah tumpahan','Tumpahan bensin ditampung dengan ...',['Wadah yang sesuai','Lantai','Tanah','Selokan'],0,'Wadah sesuai mencegah bahaya.');
P(38,'Kain bekas','Kain bekas bensin disimpan ...',['Di wadah tertutup yang aman','Dibuang sembarangan','Dibakar','Di dekat api'],0,'Penyimpanan aman.');
P(39,'Keberhasilan','Perawatan dinyatakan berhasil jika ...',['Aliran lancar, idle stabil, dan tidak bocor','Warna cat baru','Berat motor berubah','Harga bensin murah'],0,'Tiga indikator keberhasilan.');
P(40,'Kesimpulan','Kesimpulan perawatan didasarkan pada ...',['Pemeriksaan dan spesifikasi','Perkiraan','Tidak dicatat','Warna'],0,'Berbasis data.');

K(41,'Komponen bahan bakar','Pilih komponen sistem bahan bakar.',['Tangki','Selang','Kran bahan bakar','Busi'],[0,1,2],'Busi bukan komponen bahan bakar.');
K(42,'Kebocoran','Pilih bagian yang diperiksa untuk kebocoran.',['Tangki','Selang','Kran bahan bakar','Lampu sein'],[0,1,2],'Lampu sein tidak diperiksa.');
K(43,'K3 bensin','Pilih tindakan keselamatan saat bekerja dengan bensin.',['Jauhkan dari api dan percikan','Lakukan di tempat berventilasi','Lap tumpahan segera','Buang bensin ke saluran air'],[0,1,2],'Saluran air dilarang.');
K(44,'Gejala aliran','Pilih tanda masalah aliran bahan bakar.',['Mesin sulit hidup','Mesin tersendat saat digas','Bau bensin menyengat','Warna cat'],[0,1,2],'Warna cat tidak berkaitan.');
K(45,'Filter udara','Pilih yang diperiksa pada filter udara.',['Kondisi','Kebersihan','Kelancaran udara','Warna lampu'],[0,1,2],'Warna lampu tidak diperiksa.');
K(46,'Saringan bahan bakar','Pilih pernyataan yang benar tentang saringan bahan bakar.',['Menahan kotoran','Dibersihkan saat kotor','Diganti sesuai kondisi','Dipukul agar bersih'],[0,1,2],'Dipukul dapat merusak.');
K(47,'Uji aliran','Pilih yang diperiksa dalam uji aliran bahan bakar.',['Kerja pompa','Aliran bensin','Kelancaran aliran','Warna baut'],[0,1,2],'Warna baut tidak diperiksa.');
K(48,'Penyetelan idle','Pilih langkah dalam penyetelan idle.',['Setel sesuai spesifikasi','Pastikan campuran benar','Uji putaran mesin','Pukul karburator'],[0,1,2],'Memukul karburator dilarang.');
K(49,'Sifat bensin','Pilih pernyataan yang benar tentang bensin.',['Mudah terbakar','Harus dijauhkan dari api','Uapnya berbahaya','Boleh dibuang ke selokan'],[0,1,2],'Selokan dilarang.');
K(50,'Setelah perawatan','Pilih tindakan setelah perawatan.',['Uji kebocoran','Periksa idle','Catat hasil','Biarkan tumpahan'],[0,1,2],'Tumpahan harus dibersihkan.');

C(51,'Bensin','Pernyataan berikut tentang bensin.',[['Bensin mudah terbakar dan dijauhkan dari api',true],['Bensin boleh didekatkan ke api',false],['Uap bensin berbahaya',true]],'Bensin berbahaya.');
C(52,'Ventilasi','Pernyataan berikut tentang tempat kerja.',[['Kerja dengan bensin dilakukan di tempat berventilasi',true],['Kerja dengan bensin dilakukan di ruang tertutup tanpa ventilasi',false],['Ventilasi membuang uap',true]],'Ventilasi penting.');
C(53,'Saringan','Pernyataan berikut tentang saringan bahan bakar.',[['Saringan bahan bakar menahan kotoran',true],['Saringan bahan bakar menambah tekanan secara berlebihan',false],['Saringan diganti sesuai kondisi',true]],'Saringan menahan kotoran.');
C(54,'Tumpahan','Pernyataan berikut tentang tumpahan.',[['Tumpahan bensin dibiarkan menguap',false],['Tumpahan bensin dibersihkan segera',true],['Kain bekas disimpan dengan aman',true]],'Tumpahan harus dibersihkan.');
C(55,'Selang','Pernyataan berikut tentang selang.',[['Selang bahan bakar yang retak harus diganti',true],['Selang retak boleh dibiarkan',false],['Selang diperiksa kebocorannya',true]],'Selang retak wajib diganti.');
C(56,'Injeksi','Pernyataan berikut tentang sistem injeksi.',[['Tekanan injeksi dilepas sebelum membuka selang',true],['Selang boleh dibuka tanpa melepas tekanan',false],['Prosedur tekanan melindungi teknisi',true]],'Tekanan dilepas.');
C(57,'Idle','Pernyataan berikut tentang idle.',[['Idle disetel sesuai spesifikasi',true],['Idle boleh disetel sekehendak hati',false],['Idle yang stabil menandakan campuran benar',true]],'Idle sesuai spesifikasi.');
C(58,'Limbah','Pernyataan berikut tentang limbah.',[['Kain bekas bensin disimpan dengan aman',true],['Kain bekas dibakar di dekat bengkel',false],['Limbah ditampung dengan aman',true]],'Kain bekas aman.');
C(59,'Filter udara','Pernyataan berikut tentang filter udara.',[['Filter udara kotor dapat menurunkan tenaga',true],['Filter udara kotor selalu menambah tenaga',false],['Filter udara diperiksa kebersihannya',true]],'Filter kotor menurunkan tenaga.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pemeliharaan dicatat',true],['Hasil pemeliharaan tidak perlu dicatat',false],['Kesimpulan didasarkan pada pemeriksaan',true]],'Pencatatan wajib.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
