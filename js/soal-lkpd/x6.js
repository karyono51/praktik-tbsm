/* Bank soal TKA per unit LKPD: X-6 Penggunaan dan Perawatan Alat Tangan Bengkel. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='X-6',L=[];
function id(n){return 'lkx6-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){L.push({id:id(n),tipe:'pg',mapel:'LKPD X-6 Alat Tangan Bengkel',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:'LKPD X-6 Alat Tangan Bengkel',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:'LKPD X-6 Alat Tangan Bengkel',topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'X'})}

P(1,'Kunci ring dan soket','Kunci yang paling kuat memegang baut adalah ...',['Kunci pas','Kunci ring atau soket','Tang','Obeng'],1,'Ring dan soket mengelilingi kepala baut.');
P(2,'Kunci pas','Kunci pas yang longgar pada baut dapat menyebabkan ...',['Baut lebih mudah dikencangkan','Kepala baut bundar atau rusak','Tidak ada pengaruh','Baut lebih awet'],1,'Kunci longgar merusak kepala baut.');
P(3,'Kunci torsi','Kunci torsi digunakan untuk ...',['Mengendurkan baut karat','Mengencangkan baut sesuai torsi spesifikasi','Memukul baut','Memotong baut'],1,'Tujuannya mendapatkan kekencangan yang tepat.');
P(4,'Kunci torsi','Setelah dipakai, kunci torsi sebaiknya ...',['Dibiarkan pada nilai tinggi','Dikembalikan ke nilai terendah','Dilumasi dengan oli','Dicelupkan air'],1,'Pegas kunci torsi dijaga agar akurat.');
P(5,'Kunci torsi','Saat mengencangkan dengan kunci torsi, berhenti ketika ...',['Terasa berat saja','Terdengar bunyi klik','Baut mengeluarkan asap','Kunci mulai panas'],1,'Bunyi klik menandakan torsi tercapai.');
P(6,'Obeng','Obeng tidak boleh dipakai sebagai ...',['Pemutar sekrup','Pencungkil atau tuas','Alat uji sederhana','Penanda'],1,'Pemakaian yang salah dapat merusak obeng dan menyebabkan cedera.');
P(7,'Tang','Tang bukan pengganti ...',['Kunci','Obeng','Palu','Gunting'],0,'Tang tidak mengencangkan baut seperti kunci.');
P(8,'Palu','Palu lunak digunakan untuk ...',['Memukul komponen yang mudah rusak','Memotong baut','Mengukur torsi','Mengecat'],0,'Palu lunak menghindari kerusakan permukaan.');
P(9,'Standar','Sebelum mengerjakan unit di atas dongkrak, pastikan ...',['Dongkrak dilepas','Unit tertopang dan stabil','Mesin dihidupkan','Ban kempes'],1,'Kestabilan mencegah unit jatuh.');
P(10,'Pipa tambahan','Memperpanjang kunci dengan pipa ...',['Dianjurkan','Berbahaya dan dapat merusak baut atau alat','Tidak ada efek','Membuat kerja lebih cepat'],1,'Gaya berlebih menimbulkan kerusakan dan cedera.');
P(11,'Arah tarikan','Kunci sebaiknya ditarik ke arah ...',['Badan','Luar tubuh','Kaki','Bawah tanah'],0,'Menarik ke arah badan lebih aman.');
P(12,'Ukuran kunci','Memilih kunci sesuai ukuran baut bertujuan untuk ...',['Menghindari kerusakan kepala baut','Menambah berat','Menghemat tenaga saja','Tidak ada alasan'],0,'Ukuran pas melindungi kepala baut.');
P(13,'Obeng','Obeng yang tepat dipilih berdasarkan ...',['Ukuran dan bentuk alur sekrup','Warna gagang','Harga','Merek saja'],0,'Ukuran dan alur harus sesuai.');
P(14,'Perawatan alat','Alat tangan setelah dipakai sebaiknya ...',['Dibiarkan kotor','Dibersihkan, dilumasi bila perlu, dan disimpan','Dilempar ke lantai','Dibiarkan di tanah'],1,'Perawatan menjaga alat tetap layak.');
P(15,'Karat alat','Alat yang berkarat sebaiknya ...',['Dipakai tanpa dibersihkan','Dibersihkan atau diganti jika rusak','Dicat tebal','Disembunyikan'],1,'Karat dapat merusak kerja alat.');
P(16,'Kelengkapan alat','Setelah pekerjaan selesai, semua alat harus ...',['Ditinggal di unit','Kembali ke tempatnya dan terhitung','Dipinjamkan ke luar','Disimpan di saku'],1,'Kelengkapan alat dicek agar tidak hilang.');
P(17,'Penggunaan kunci','Kunci sebaiknya dipilih yang ...',['Pas dengan kepala baut','Terlalu besar','Terlalu kecil','Berkarat'],0,'Ukuran pas memberi gaya optimal.');
P(18,'Torsi bertahap','Pengencangan baut dengan kunci torsi dilakukan ...',['Bertahap','Sekali dengan tenaga penuh','Sambil memukul','Tanpa urutan'],0,'Pengencangan bertahap menjaga rata.');
P(19,'Gejala baut','Baut yang terlalu kencang atau kendur dapat menyebabkan ...',['Kerusakan komponen','Mesin lebih halus','Tidak ada pengaruh','Warna baut berubah'],0,'Torsi tidak sesuai merusak komponen.');
P(20,'Gejala kunci torsi','Kunci torsi yang tidak berbunyi klik menandakan ...',['Kemungkinan alat perlu diperiksa atau dikalibrasi','Alat sangat baik','Torsi sudah pas','Tidak ada masalah'],0,'Kunci torsi bermasalah perlu diperiksa.');
P(21,'Standar unit','Standar atau dongkrak harus diletakkan pada ...',['Titik angkat yang benar','Sembarang tempat','Knalpot','Setang'],0,'Titik angkat yang benar mencegah kerusakan dan kecelakaan.');
P(22,'Keselamatan alat','Alat yang rusak sebaiknya ...',['Tetap digunakan','Dilaporkan dan tidak dipakai sampai diperbaiki','Diperbaiki asal jadi','Dibuang diam-diam'],1,'Alat rusak tidak boleh digunakan.');
P(23,'Penggunaan palu','Palu yang digunakan di bengkel sebaiknya ...',['Sesuai jenis pekerjaan dan dalam kondisi baik','Asal palu','Berkarat','Patah'],0,'Palu harus sesuai dan layak.');
P(24,'Penyimpanan','Alat tangan sebaiknya disimpan ...',['Di kotak atau rak yang tertata','Berserakan di lantai','Di luar bengkel','Di dalam oli'],0,'Penataan memudahkan pencarian dan mencegah kehilangan.');
P(25,'Oli pada alat','Pelumas alat digunakan untuk ...',['Mencegah karat dan menjaga gerakan alat','Menambah berat','Menghitung alat','Mengecat'],0,'Pelumas menjaga alat tetap berfungsi.');
P(26,'Kunci torsi kembali','Mengembalikan kunci torsi ke nilai terendah bertujuan untuk ...',['Menjaga pegas tetap akurat','Menambah kekencangan','Menghemat listrik','Tidak ada tujuan'],0,'Pegas tetap akurat bila tidak dibebani.');
P(27,'Gaya','Memakai kunci dengan gaya berlebih dapat ...',['Mengurangi risiko cedera','Merusak alat dan melukai pengguna','Mempercepat kerja tanpa risiko','Tidak berbahaya'],1,'Gaya berlebih berbahaya.');
P(28,'Pengencangan baut','Baut yang dikencangkan harus ...',['Sesuai torsi spesifikasi','Sekuat mungkin','Sekadar terasa kencang','Dibiarkan longgar'],0,'Torsi spesifikasi memastikan kekencangan yang tepat.');
P(29,'Mengendurkan baut','Untuk mengendurkan baut yang sangat kencang, alat yang paling tepat adalah ...',['Kunci pas atau ring sesuai ukuran','Kunci torsi','Palu besar','Tang buaya'],0,'Kunci pas atau ring memberi kekuatan lebih.');
P(30,'Obeng pencungkil','Penggunaan obeng sebagai pencungkil dapat ...',['Membuat ujung obeng rusak dan melukai','Membuat alat lebih awet','Tidak berbahaya','Mempercepat kerja'],0,'Obeng bukan alat pencungkil.');
P(31,'Kebersihan alat','Alat yang bersih dan terawat ...',['Lebih awet dan akurat','Cepat berkarat','Mudah hilang','Tidak berpengaruh'],0,'Perawatan menjaga umur dan akurasi alat.');
P(32,'Pemilihan palu','Palu besi digunakan untuk pekerjaan yang ...',['Membutuhkan pukulan kuat dan tidak merusak permukaan keras','Membutuhkan permukaan lembut','Tidak butuh palu','Hanya untuk mengecat'],0,'Palu besi untuk pukulan kuat.');
P(33,'Sekrup','Sekrup yang alurnya rusak sebaiknya ...',['Dipaksa dengan obeng lain','Diganti atau diperbaiki sesuai prosedur','Dipukul-pukul','Dibiarkan'],1,'Alur rusak harus diganti.');
P(34,'Keselamatan standar','Saat menopang unit, yang harus diperiksa adalah ...',['Kestabilan dan posisi standar','Warna standar','Merek standar','Berat jok'],0,'Stabilitas adalah kunci keselamatan.');
P(35,'Alat tangan','Alat tangan yang paling sering digunakan di bengkel sepeda motor antara lain ...',['Kunci pas, ring, soket, dan obeng','Mesin las','Crane','Traktor'],0,'Alat tangan dasar meliputi kunci dan obeng.');
P(36,'Pengunci','Alat yang dipakai untuk menahan benda kerja agar tidak bergerak ...',['Klem atau penahan yang stabil','Kain lap','Kuas','Sikat'],0,'Penahan mencegah benda bergeser.');
P(37,'Ukuran baut','Baut ukuran besar memerlukan ...',['Kunci dengan ukuran yang sesuai','Kunci terkecil','Tang saja','Palu'],0,'Ukuran harus sesuai.');
P(38,'Cek alat','Sebelum digunakan, alat harus diperiksa ...',['Kondisinya dan tidak rusak','Harganya','Warnanya','Merek saja'],0,'Pemeriksaan kondisi mencegah kecelakaan.');
P(39,'Penggunaan kunci torsi','Kunci torsi tidak boleh digunakan untuk ...',['Mengencangkan baut sesuai torsi','Mengendurkan baut','Mengukur torsi','Memastikan kekencangan'],1,'Kunci torsi tidak untuk mengendurkan baut.');
P(40,'Kesimpulan','Pemeriksaan alat tangan sebaiknya ditutup dengan ...',['Mengembalikan semua alat dan mencatat temuan','Meninggalkan alat di unit','Membuang alat rusak','Tidak mencatat apa pun'],0,'Penutupan kerja mencakup pengembalian alat dan pencatatan.');

K(41,'Jenis kunci','Pilih jenis kunci yang memegang baut dengan baik.',['Kunci ring','Kunci soket','Kunci pas','Tang'],[0,1,2],'Tang kurang cocok untuk memegang baut.');
K(42,'Kunci torsi','Pilih langkah yang benar saat memakai kunci torsi.',['Mengatur nilai torsi sesuai manual','Menarik perlahan','Berhenti saat berbunyi klik','Mengembalikan ke nilai terendah setelah dipakai'],[0,1,2,3],'Semua langkah itu benar.');
K(43,'Kunci torsi','Pilih tindakan yang tidak boleh dilakukan dengan kunci torsi.',['Mengendurkan baut','Menambah panjang kunci dengan pipa','Mengencangkan sesuai torsi','Menyimpan pada nilai tinggi'],[0,1,3],'Mengencangkan sesuai torsi adalah tujuannya.');
K(44,'Obeng dan tang','Pilih penggunaan yang benar untuk obeng dan tang.',['Memilih obeng sesuai alur','Tang bukan pengganti kunci','Obeng dipakai sebagai pencungkil','Tang dipakai untuk memukul'],[0,1],'Obeng dan tang tidak boleh disalahgunakan.');
K(45,'Keselamatan','Pilih tindakan keselamatan saat menggunakan alat tangan.',['Menarik kunci ke arah badan','Tidak menambah panjang kunci dengan pipa','Memastikan standar stabil','Memaksa baut yang macet'],[0,1,2],'Memaksa baut macet berbahaya.');
K(46,'Perawatan','Pilih perawatan alat tangan yang benar.',['Membersihkan setelah dipakai','Melumasi bagian bergerak bila perlu','Menyimpan di tempatnya','Membiarkan berkarat'],[0,1,2],'Karat harus dicegah.');
K(47,'Kerusakan','Pilih kondisi alat yang tidak layak pakai.',['Kepala baut bundar akibat kunci tidak pas','Pegangan palu patah','Alur obeng rusak parah','Gagang kunci bersih'],[0,1,2],'Gagang bersih adalah kondisi baik.');
K(48,'Standar unit','Pilih hal yang harus diperiksa sebelum mengangkat unit dengan dongkrak.',['Titik angkat yang benar','Kestabilan unit','Posisi dongkrak','Warna unit'],[0,1,2],'Warna unit tidak berkaitan.');
K(49,'Gejala','Pilih gejala yang menunjukkan masalah pada pengencangan baut.',['Baut terlalu kencang','Baut terlalu kendur','Kunci torsi tidak berbunyi klik','Warna cat baut berubah'],[0,1,2],'Warna cat tidak menunjukkan torsi salah.');
K(50,'Pemeriksaan','Pilih komponen dalam pemeriksaan alat tangan.',['Pemilihan kunci','Kunci torsi','Obeng dan tang','Kelengkapan alat'],[0,1,2,3],'Semua termasuk pemeriksaan.');

C(51,'Kunci torsi','Pernyataan berikut tentang kunci torsi.',[['Kunci torsi mengencangkan baut sesuai torsi spesifikasi',true],['Kunci torsi digunakan untuk mengendurkan baut karat',false],['Kunci torsi dikembalikan ke nilai terendah setelah dipakai',true]],'Kunci torsi tidak untuk mengendurkan.');
C(52,'Kunci pas dan ring','Pernyataan berikut tentang kunci.',[['Kunci ring dan soket memegang baut lebih kuat',true],['Ukuran kunci boleh sembarang',false],['Ukuran kunci harus sesuai baut',true]],'Ukuran harus pas.');
C(53,'Obeng dan tang','Pernyataan berikut tentang obeng dan tang.',[['Obeng dipilih sesuai ukuran alur',true],['Tang dapat menggantikan kunci',false],['Obeng tidak digunakan sebagai pencungkil',true]],'Tang bukan pengganti kunci.');
C(54,'Palu','Pernyataan berikut tentang palu.',[['Palu lunak dipakai untuk komponen yang mudah rusak',true],['Palu boleh dipakai dalam kondisi rusak',false],['Palu dipilih sesuai pekerjaan',true]],'Palu rusak harus diganti.');
C(55,'Standar dan dongkrak','Pernyataan berikut tentang standar.',[['Unit harus tertopang dan stabil',true],['Standar boleh diletakkan di sembarang titik',false],['Titik angkat harus benar',true]],'Titik angkat yang benar penting.');
C(56,'Keselamatan','Pernyataan berikut tentang keselamatan alat.',[['Pipa tambahan pada kunci berbahaya',true],['Kunci boleh didorong tanpa kendali kecuali perlu',false],['Kunci ditarik ke arah badan lebih aman',true]],'Pipa tambahan berbahaya.');
C(57,'Perawatan','Pernyataan berikut tentang perawatan alat.',[['Alat dibersihkan setelah dipakai',true],['Alat dibiarkan berkarat agar kuat',false],['Alat disimpan di tempatnya',true]],'Karat merusak alat.');
C(58,'Torsi bertahap','Pernyataan berikut tentang pengencangan.',[['Pengencangan dilakukan bertahap',true],['Torsi berlebih membuat baut lebih awet',false],['Baut dikencangkan sesuai spesifikasi',true]],'Torsi berlebih merusak.');
C(59,'Gejala','Pernyataan berikut tentang gejala alat.',[['Kepala baut bundar dapat disebabkan kunci tidak pas',true],['Kunci torsi yang tidak klik perlu diperiksa',true],['Baut yang kendur selalu aman',false]],'Baut kendur bisa lepas.');
C(60,'Penutupan kerja','Pernyataan berikut tentang penutupan kerja.',[['Semua alat dikembalikan ke tempatnya',true],['Alat boleh ditinggal di unit',false],['Temuan alat dicatat',true]],'Kelengkapan dicek.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
