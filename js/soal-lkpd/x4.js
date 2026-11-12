/* Bank soal TKA per unit LKPD: X-4 Prosedur K3 dan Lingkungan di Bengkel. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='X-4',L=[];
function id(n){return 'lkx4-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:'LKPD X-4 K3 dan Lingkungan Bengkel',topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'X'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:'LKPD X-4 K3 dan Lingkungan Bengkel',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:'LKPD X-4 K3 dan Lingkungan Bengkel',topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'X'})}

P(1,'Bahaya dan risiko','Perbedaan bahaya dan risiko adalah ...',['Bahaya adalah sumber kerugian; risiko adalah kemungkinan dan akibatnya','Bahaya dan risiko sama saja','Risiko adalah sumber kerugian; bahaya adalah kemungkinannya','Bahaya hanya berlaku di luar bengkel'],0,'Bahaya adalah sumbernya, risiko adalah peluang terjadinya dan akibatnya.');
P(2,'Contoh bahaya','Yang termasuk bahaya di area bengkel adalah ...',['Tumpahan oli di lantai','Lampu menyala terang','Kursi kerja yang nyaman','Tanaman di pot'],0,'Tumpahan oli dapat menyebabkan terpeleset.');
P(3,'APD','Tujuan utama APD adalah ...',['Gaya berpakaian','Melindungi pekerja dari bahaya','Membuat kerja lebih cepat','Menambah tinggi badan'],1,'APD mengurangi risiko cedera.');
P(4,'APD','Pemilihan APD harus sesuai ...',['Bahaya pekerjaan yang dilakukan','Selera pribadi','Harga termurah','Warna seragam'],0,'APD dipilih menurut jenis bahaya.');
P(5,'Limbah oli','Oli bekas harus ...',['Dibuang ke selokan','Ditampung di wadah khusus','Dibakar di belakang bengkel','Dicampur dengan sampah biasa'],1,'Oli bekas termasuk limbah berbahaya.');
P(6,'Tumpahan bensin','Tumpahan bensin di lantai harus ...',['Dibiarkan menguap','Dibersihkan segera dengan aman','Ditutup kardus','Disiram air panas'],1,'Bensin mudah terbakar dan harus dibersihkan segera.');
P(7,'Merokok','Di area bahan bakar, aktivitas yang dilarang adalah ...',['Membuat api atau merokok','Mengecek APD','Membaca prosedur','Menutup wadah'],0,'Api di dekat bahan bakar sangat berbahaya.');
P(8,'APAR','APAR adalah ...',['Alat pemadam api ringan','Alat pengukur tegangan','Alat penyetel rantai','Alat pelumas'],0,'APAR digunakan untuk memadamkan api awal.');
P(9,'APAR','APAR kelas B digunakan untuk kebakaran yang disebabkan oleh ...',['Kayu dan kertas','Cairan seperti bensin dan oli','Listrik saja','Logam ringan'],1,'Kelas B untuk cairan mudah terbakar.');
P(10,'APAR','APAR kelas C digunakan untuk kebakaran akibat ...',['Kayu','Cairan','Listrik','Gas'],2,'Kelas C untuk kebakaran listrik.');
P(11,'Kotak P3K','Kotak P3K harus ...',['Terkunci dan sulit dijangkau','Lengkap dan mudah dijangkau','Berisi obat kedaluwarsa','Disimpan di gudang jauh'],1,'P3K harus lengkap dan mudah diakses saat darurat.');
P(12,'Wadah limbah','Wadah limbah harus ...',['Berlabel dan tidak bocor','Tanpa label','Terbuka lebar','Berbentuk karung'],0,'Label memudahkan pemisahan limbah.');
P(13,'Jalur darurat','Jalur keluar darurat harus ...',['Tidak terhalang','Dipakai untuk menyimpan alat','Ditutup kardus','Digunakan parkir'],0,'Jalur darurat harus bebas agar evakuasi lancar.');
P(14,'Kabel','Kabel yang berserakan di lantai dapat menyebabkan ...',['Terjatuh atau tersandung','Mesin lebih cepat','Oli bertambah','Ban lebih awet'],0,'Kabel berserakan menjadi bahaya tersandung.');
P(15,'APD sepatu','Sepatu kerja di bengkel sebaiknya ...',['Sandal jepit','Sepatu tertutup','Sepatu hak tinggi','Tanpa alas'],1,'Sepatu tertutup melindungi kaki dari benda jatuh dan tumpahan.');
P(16,'Kacamata','Kacamata pelindung digunakan untuk melindungi ...',['Kaki','Mata dari percikan dan serpihan','Telinga','Kepala dari debu saja'],1,'Kacamata melindungi mata.');
P(17,'Sarung tangan','Sarung tangan dipakai saat ...',['Menangani bahan kimia atau oli bekas','Mengetik laporan','Membaca buku','Membuka pintu'],0,'Sarung tangan melindungi tangan dari bahan berbahaya.');
P(18,'Masker','Masker digunakan untuk melindungi dari ...',['Debu, uap, atau asap','Suara','Cahaya','Panas matahari saja'],0,'Masker melindungi saluran napas.');
P(19,'Lantai licin','Lantai licin karena tumpahan oli harus ...',['Dibiarkan kering sendiri','Dibersihkan dan diberi peringatan','Diinjak agar kering','Ditutup kain saja'],1,'Area licin harus segera dibersihkan dan diberi tanda.');
P(20,'Bahan bakar','Bahan bakar sebaiknya disimpan ...',['Di wadah tertutup dan terpisah dari sumber api','Di dekat api','Di tempat terbuka','Dalam botol tanpa tutup'],0,'Penyimpanan tertutup dan jauh dari api mencegah kebakaran.');
P(21,'Pembuangan','Kain majun bekas oli harus ...',['Dibuang sembarangan','Ditampung di wadah limbah yang sesuai','Dibakar','Dibawa pulang'],1,'Kain terkontaminasi termasuk limbah.');
P(22,'Hubungan kerja','Sebelum bekerja, area kerja sebaiknya ...',['Diperiksa dari bahaya','Dibiarkan seadanya','Dikotori','Diabaikan'],0,'Pemeriksaan awal mencegah kecelakaan.');
P(23,'Identifikasi bahaya','Lembar identifikasi bahaya membantu untuk ...',['Mencatat dan menilai bahaya di area kerja','Menghitung upah','Menulis surat','Menghias dinding'],0,'Lembar ini digunakan untuk pencatatan bahaya.');
P(24,'Perhiasan','Saat bekerja, perhiasan logam sebaiknya ...',['Dipakai sebagai hiasan','Dilepas agar tidak tersangkut atau menghantarkan listrik','Dipakai lebih banyak','Ditaruh di saku'],1,'Perhiasan logam dapat tersangkut atau menghantarkan listrik.');
P(25,'Api dan rokok','Api terbuka di bengkel ...',['Boleh di dekat bahan bakar','Dilarang di dekat bahan bakar dan oli','Bebas digunakan','Dianjurkan'],1,'Api terbuka dilarang di dekat bahan mudah terbakar.');
P(26,'Penanganan oli','Oli bekas sebaiknya dikumpulkan dan ...',['Dibuang ke tanah','Diserahkan sesuai prosedur limbah','Dicampur dengan air','Dibiarkan di lantai'],1,'Limbah harus diserahkan sesuai prosedur.');
P(27,'Pemisahan limbah','Limbah dipisahkan berdasarkan ...',['Jenisnya','Warna saja','Ukurannya saja','Tanggalnya saja'],0,'Pemisahan menurut jenis memudahkan pengelolaan.');
P(28,'Pengecekan APAR','APAR yang baik harus ...',['Terletak mudah dijangkau dan tidak terhalang','Disimpan di gudang','Tersegel tetapi kedaluwarsa','Dibuka segelnya'],0,'APAR harus mudah diakses dan layak pakai.');
P(29,'Area terhalang','Benda yang menghalangi APAR harus ...',['Dibiarkan','Dipindahkan agar APAR mudah dijangkau','Ditumpuk di depan APAR','Ditutup kain'],1,'APAR harus bebas dari halangan.');
P(30,'Kebakaran','Pada saat kebakaran kecil, langkah awal adalah ...',['Lari tanpa memberi tahu','Memberitahu rekan dan menggunakan APAR jika aman','Menutup pintu dan pergi','Menyiram dengan oli'],1,'Tindakan awal harus aman dan terkoordinasi.');
P(31,'Sumber bahaya listrik','Kabel yang kulitnya terkelupas berbahaya karena ...',['Dapat menimbulkan sengatan dan hubungan singkat','Membuat lampu terang','Menambah tenaga mesin','Tidak berbahaya'],0,'Kabel terbuka berisiko sengatan dan kebakaran.');
P(32,'Ventilasi','Ruang kerja yang berventilasi baik penting untuk ...',['Mengurangi uap berbahaya','Menambah suara','Menghemat listrik','Mengurangi cahaya'],0,'Ventilasi membuang uap dan asap.');
P(33,'Hukum K3','Tujuan K3 di bengkel adalah ...',['Mencegah kecelakaan dan penyakit akibat kerja','Mempercepat produksi saja','Menambah pekerjaan','Menghemat listrik'],0,'K3 bertujuan mencegah kecelakaan dan penyakit.');
P(34,'Tanggung jawab','Setiap pekerja di bengkel sebaiknya ...',['Mengabaikan K3','Menjalankan prosedur K3 dan melaporkan bahaya','Mengerjakan tanpa APD','Menyimpan bahaya'],1,'Setiap pekerja bertanggung jawab atas K3.');
P(35,'Pelaporan','Bahaya yang ditemukan sebaiknya ...',['Disembunyikan','Dilaporkan kepada penanggung jawab','Dibiarkan saja','Diperbaiki sendiri tanpa izin'],1,'Pelaporan memungkinkan penanganan yang tepat.');
P(36,'Gas buang','Gas buang kendaraan di ruang tertutup berbahaya karena ...',['Mengandung gas beracun','Berbau harum','Tidak berbahaya','Membuat ruangan sejuk'],0,'Gas buang mengandung zat beracun seperti karbon monoksida.');
P(37,'Alat ukur','Alat ukur dalam bengkel sebaiknya ...',['Diperiksa kondisinya sebelum dipakai','Dibiarkan rusak','Dipakai sembarangan','Dicampur dengan alat lain'],0,'Alat rusak dapat membahayakan pengguna.');
P(38,'Jalur evakuasi','Jalur evakuasi dan pintu darurat harus ...',['Dikunci saat jam kerja','Mudah dilihat dan bebas hambatan','Ditutupi benda','Dipakai untuk menyimpan oli'],1,'Jalur evakuasi harus bebas dan terlihat.');
P(39,'Cedera kecil','Jika terjadi cedera ringan, tindakan pertama adalah ...',['Mengabaikan','Menggunakan P3K dan melapor','Pulang tanpa lapor','Menunggu sembuh sendiri'],1,'P3K dan laporan dilakukan segera.');
P(40,'Kesimpulan K3','Kesimpulan pemeriksaan K3 sebaiknya ...',['Didasarkan pada temuan dan dicatat','Didasarkan pada perkiraan','Tidak dicatat','Berdasarkan merek alat'],0,'Temuan dicatat sebagai dasar tindakan.');

K(41,'Bahaya','Pilih contoh bahaya di area bengkel.',['Tumpahan oli','Kabel berserakan','Benda tajam di lantai','Meja kerja yang rapi'],[0,1,2],'Meja rapi bukan bahaya.');
K(42,'APD','Pilih APD yang lazim dipakai di bengkel.',['Wearpack','Sarung tangan','Kacamata','Helm sepeda'],[0,1,2],'Helm sepeda tidak termasuk APD bengkel umum.');
K(43,'Limbah','Pilih limbah yang termasuk limbah berbahaya.',['Oli bekas','Aki bekas','Kain terkontaminasi','Kertas bersih'],[0,1,2],'Kertas bersih bukan limbah B3.');
K(44,'APAR','Pilih pernyataan yang benar tentang APAR.',['Ada lokasi yang mudah dijangkau','Harus tidak terhalang','Harus diperiksa tekanannya','Boleh disimpan di gudang tertutup'],[0,1,2],'APAR harus mudah diakses.');
K(45,'Bahan bakar','Pilih tindakan yang benar untuk bahan bakar.',['Simpan di wadah tertutup','Jauhkan dari api','Lap tumpahan segera','Biarkan tumpahan menguap'],[0,1,2],'Tumpahan harus segera dibersihkan.');
K(46,'Keselamatan','Pilih larangan saat bekerja di bengkel.',['Merokok di dekat bahan bakar','Membuang oli ke saluran air','Membuat api di dekat bahan bakar','Membersihkan tumpahan'],[0,1,2],'Membersihkan tumpahan adalah tindakan benar.');
K(47,'P3K','Pilih isi kotak P3K yang umum.',['Plester','Kain kasa','Antiseptik','Sepatu cadangan'],[0,1,2],'Sepatu bukan isi P3K.');
K(48,'Gejala','Pilih kondisi yang perlu dilaporkan.',['APD rusak atau tidak lengkap','Limbah oli tercampur sampah biasa','APAR kedaluwarsa','Area kerja dibersihkan'],[0,1,2],'Area yang sudah bersih tidak perlu dilaporkan.');
K(49,'Pemeriksaan','Pilih komponen yang diperiksa dalam K3 area kerja.',['Area kerja bebas bahaya','Wadah limbah berlabel','Kotak P3K lengkap','Warna dinding'],[0,1,2],'Warna dinding tidak termasuk pemeriksaan K3.');
K(50,'Pelaporan','Pilih tindakan yang tepat saat menemukan bahaya.',['Melaporkan kepada penanggung jawab','Memperbaiki jika aman dan berwenang','Menyembunyikannya','Membiarkannya tanpa tanda'],[0,1],'Bahaya tidak boleh disembunyikan atau dibiarkan.');

C(51,'Bahaya dan risiko','Pernyataan berikut tentang bahaya dan risiko.',[['Bahaya adalah sumber kerugian',true],['Risiko adalah sumber kerugian',false],['Risiko mencakup kemungkinan dan akibat',true]],'Bahaya adalah sumber, risiko adalah kemungkinan.');
C(52,'APD','Pernyataan berikut tentang APD.',[['APD harus sesuai bahaya pekerjaan',true],['APD tidak perlu diperiksa kelayakannya',false],['Sarung tangan termasuk APD',true]],'APD harus dicek sebelum dipakai.');
C(53,'Limbah','Pernyataan berikut tentang limbah.',[['Oli bekas harus ditampung di wadah khusus',true],['Oli bekas boleh dibuang ke selokan',false],['Limbah diberi label',true]],'Pembuangan ke selokan dilarang.');
C(54,'APAR','Pernyataan berikut tentang APAR.',[['APAR harus mudah dijangkau',true],['APAR boleh terhalang benda',false],['APAR diperiksa segel dan tekanannya',true]],'APAR harus siap digunakan.');
C(55,'Bahan bakar','Pernyataan berikut tentang bahan bakar.',[['Api terbuka boleh dipakai di dekat bensin',false],['Tumpahan bensin dibersihkan segera',true],['Bahan bakar disimpan di wadah tertutup',true]],'Api dilarang di dekat bensin.');
C(56,'Kebakaran','Pernyataan berikut tentang penanganan kebakaran.',[['Tindakan awal dilakukan jika aman',true],['Kebakaran kecil dibiarkan saja',false],['Rekan diberi tahu saat kebakaran terjadi',true]],'Keselamatan didahulukan.');
C(57,'P3K','Pernyataan berikut tentang P3K.',[['Kotak P3K harus lengkap',true],['Kotak P3K harus terkunci dan sulit dijangkau',false],['Isi P3K harus mudah dijangkau',true]],'P3K harus mudah diakses saat darurat.');
C(58,'Jalur darurat','Pernyataan berikut tentang jalur darurat.',[['Jalur keluar darurat tidak boleh terhalang',true],['Jalur darurat boleh ditumpuk barang',false],['Pintu darurat harus mudah dikenali',true]],'Jalur darurat harus bebas.');
C(59,'Pelaporan','Pernyataan berikut tentang pelaporan.',[['Bahaya dilaporkan kepada penanggung jawab',true],['Cedera ringan tidak perlu dilaporkan',false],['Temuan K3 dicatat',true]],'Cedera harus dilaporkan.');
C(60,'Lingkungan','Pernyataan berikut tentang lingkungan kerja.',[['Oli bekas dan limbah dipisah dan diberi label',true],['Limbah dibuang ke tanah',false],['Area kerja dijaga bersih',true]],'Lingkungan kerja harus terjaga.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
