/* Bank soal TKA per unit LKPD: XI-4 Pemeliharaan Engine dan Komponennya. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-4',M='LKPD XI-4 Pemeliharaan Engine dan Komponennya',L=[];
function id(n){return 'lkxi4-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,t=(n-1)%L5,r=(k-t+L5)%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=t;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Oli mesin','Oli mesin berfungsi untuk ...',['Melumasi, mendinginkan, membersihkan, dan melindungi','Mengisi bahan bakar','Mengatur rem','Menyetel idle','Menghasilkan listrik'],0,'Oli memiliki beberapa fungsi utama di mesin.');
P(2,'Filter oli','Filter oli berfungsi untuk ...',['Menyaring kotoran dari oli','Menambah tekanan udara','Mendinginkan udara','Mengisi oli','Mengatur rem'],0,'Filter menahan kotoran.');
P(3,'Level oli','Level oli dibaca pada posisi ...',['Antara batas bawah dan atas','Di atas batas atas','Di bawah batas bawah','Sembarang','Penuh sampai tutup'],0,'Level harus di antara batas.');
P(4,'Oli bekas','Oli bekas harus ...',['Ditampung dan dibuang sesuai prosedur','Dibuang ke tanah','Dicampur air','Dibakar','Disimpan di ember'],0,'Oli bekas limbah berbahaya.');
P(5,'K3 mesin panas','Mengganti oli saat mesin panas dapat menyebabkan ...',['Luka bakar','Tidak berbahaya sama sekali','Busi mati','Rantai putus','Mesin mati total'],0,'Mesin panas berbahaya.');
P(6,'Baut pembuangan','Baut pembuangan oli harus ...',['Terpasang dengan torsi yang sesuai','Dibiarkan longgar','Dilas','Dicat','Diganti kuningan'],0,'Torsi mencegah bocor.');
P(7,'Kebocoran','Kebocoran oli sering berasal dari ...',['Gasket dan seal','Ban','Kaca spion','Lampu','Lampu sein'],0,'Gasket dan seal rentan bocor.');
P(8,'Oli menetes','Oli menetes di bawah mesin, penyebab yang mungkin adalah ...',['Seal atau gasket bocor','Busi basah','Ban kempes','Rem seret','Lampu redup'],0,'Kebocoran dari seal atau gasket.');
P(9,'Level cepat turun','Level oli cepat turun dapat menunjukkan ...',['Kebocoran atau pembakaran oli','Tenaga bertambah','Oli baru','Tidak ada arti','Filter baru'],0,'Penurunan cepat berarti kehilangan oli.');
P(10,'Kompresi','Kompresi rendah dapat menunjukkan ...',['Kondisi ring, piston, atau katup perlu diperiksa','Oli baru','Ban baru','Lampu terang','Ban kempes'],0,'Kompresi menggambarkan kondisi ruang bakar.');
P(11,'Rantai keteng','Rantai keteng diperiksa ...',['Kekencangan dan suaranya','Warnanya','Mereknya','Panjang setang','Ukuran busi'],0,'Kekencangan dan bunyi diperiksa.');
P(12,'Suara mesin','Suara mesin abnormal dapat berasal dari ...',['Komponen aus atau rantai keteng kendur','Bunyi klakson','Lampu sein','Spion','Ban kempes'],0,'Komponen aus menimbulkan bunyi.');
P(13,'Dudukan mesin','Dudukan mesin yang rusak menyebabkan ...',['Getaran berlebih','Oli lebih awet','Tenaga bertambah','Tidak ada efek','Ban aus'],0,'Dudukan rusak menimbulkan getar.');
P(14,'Spesifikasi oli','Oli mesin harus sesuai dengan ...',['Kekentalan dan jumlah pada manual servis','Selera pemilik','Warna oli','Harga oli','Tekstur kemasan'],0,'Manual servis sebagai acuan.');
P(15,'Jadwal filter','Filter oli diganti ...',['Sesuai jadwal servis','Setiap hari','Tidak pernah','Hanya saat mesin rusak','Sebulan sekali tanpa cek'],0,'Penggantian mengikuti jadwal.');
P(16,'Kompresi','Pemeriksaan kompresi dilakukan ...',['Sesuai prosedur dan hasilnya dicatat','Sembarang waktu tanpa alat','Tanpa melepas busi','Tanpa mencatat','Dengan busi dipasang'],0,'Prosedur dan pencatatan penting.');
P(17,'Jadwal servis','Jadwal servis menentukan ...',['Waktu penggantian oli dan filter','Warna motor','Harga oli','Merek ban','Berat motor'],0,'Jadwal menentukan waktu servis.');
P(18,'Tumpahan oli','Tumpahan oli di area kerja harus ...',['Segera dilap','Dibiarkan','Dibakar','Ditutup kardus saja','Dilapis oli'],0,'Tumpahan licin berbahaya.');
P(19,'Gasket rusak','Gasket yang rusak sebaiknya ...',['Diganti untuk mencegah rembesan','Dipertahankan','Dipoles','Dicat','Oli habis tetap aman'],0,'Gasket rusak harus diganti.');
P(20,'Oli kurang','Oli yang terlalu sedikit dapat menyebabkan ...',['Pelumasan kurang dan keausan lebih cepat','Mesin lebih awet','Tenaga bertambah','Tidak berpengaruh','Mesin lebih senyap'],0,'Pelumasan kurang mempercepat aus.');
P(21,'Oli berlebih','Oli yang terlalu banyak dapat ...',['Menimbulkan masalah pada sistem pelumasan','Menambah pelumasan optimal','Tidak berpengaruh','Membuat mesin dingin','Dicat sebelum pasang'],0,'Kelebihan oli menimbulkan masalah.');
P(22,'Pemasangan filter','Filter oli dipasang dengan ...',['Gasket baru dan kekencangan yang tepat','Tanpa gasket','Dipukul','Dilem','Warna jok'],0,'Gasket baru mencegah bocor.');
P(23,'Dudukan mesin','Pemeriksaan dudukan mesin mencakup ...',['Kondisi karet dan kekencangan baut','Warna cat','Panjang rantai','Suara klakson','Warna knalpot'],0,'Karet dan baut diperiksa.');
P(24,'Uji setelah oli','Setelah mengganti oli, mesin diuji dengan ...',['Menghidupkan dan memeriksa kebocoran serta level','Mematikan langsung','Membiarkan panas','Memukul','Membuka tutup oli'],0,'Uji memastikan hasil.');
P(25,'Pengisian oli','Oli pengganti sebaiknya ...',['Sesuai spesifikasi manual','Asal oli','Oli bekas','Air','Minyak goreng'],0,'Spesifikasi manual adalah acuan.');
P(26,'Pembuangan oli','Oli bekas dibuang ...',['Sesuai prosedur limbah','Ke saluran air','Ke tanah','Dibakar','Ke tempat sampah biasa'],0,'Limbah diurus sesuai prosedur.');
P(27,'Penyetel rantai','Penyetel rantai keteng yang berisik ...',['Diperiksa dan disetel sesuai manual','Dibiarkan','Dipukul','Dilas','Dicat'],0,'Penyetelan mengikuti manual.');
P(28,'Baut carter','Kebocoran pada baut carter diatasi dengan ...',['Memeriksa torsi dan kondisi seal','Mengabaikannya','Memoles','Mengecat','Diganti dengan paku'],0,'Torsi dan seal dicek.');
P(29,'Langkah awal','Langkah awal pemeliharaan adalah ...',['Membaca jadwal servis dan menyiapkan alat','Membuka mesin','Menguras oli sembarang','Menguji','Mencuci oli'],0,'Persiapan dulu.');
P(30,'Oli bekas','Oli bekas dikumpulkan dalam ...',['Wadah penampung yang sesuai','Botol air','Ember tanpa tutup','Tanah','Kantong plastik'],0,'Wadah khusus untuk limbah.');
P(31,'Uji fungsi','Mesin dihidupkan untuk uji fungsi ...',['Setelah semua komponen terpasang','Sebelum oli diisi','Saat baut longgar','Tanpa pemeriksaan','Tanpa oli baru'],0,'Uji setelah semua terpasang.');
P(32,'Kompresi standar','Hasil kompresi dibandingkan dengan ...',['Standar atau spesifikasi','Warna oli','Harga ban','Merek busi','Harga oli'],0,'Standar sebagai acuan.');
P(33,'Rembesan','Rembesan di sekitar seal harus ...',['Ditelusuri sumbernya','Diabaikan','Ditutup lakban','Dibiarkan','Dilapis plastik'],0,'Sumber harus ditemukan.');
P(34,'Pemeriksaan suara','Pemeriksaan suara mesin dilakukan ...',['Dengan mesin hidup sesuai prosedur','Dengan memukul','Tanpa mesin','Dengan radio menyala','Dengan kipas menyala'],0,'Suara diperiksa saat mesin hidup.');
P(35,'Dudukan getar','Dudukan mesin yang getar berlebih ...',['Karet dan baut perlu diperiksa','Lampu diganti','Oli dibuang','Ban diisi','Lampu dicuci'],0,'Karet dan baut diperiksa.');
P(36,'Mesin panas','Saat mesin masih panas ...',['Tunggu hingga aman sebelum dikerjakan','Langsung dibuka','Disiram air dingin','Diabaikan','Didinginkan dengan es'],0,'Tunggu sampai aman.');
P(37,'Pembuangan limbah','Oli dibuang sesuai ...',['Prosedur limbah','Kebiasaan lama','Keinginan pribadi','Warna oli','Iklan'],0,'Prosedur limbah.');
P(38,'Filter lama','Filter oli yang lama ...',['Dibuang sesuai ketentuan','Dipasang lagi','Dicuci dan dipasang','Disimpan di kotak alat','Diberikan kepada tetangga'],0,'Filter lama dibuang.');
P(39,'Keberhasilan','Pemeliharaan dinyatakan berhasil jika ...',['Tidak ada kebocoran, level oli benar, dan suara normal','Warna cat baru','Berat motor berubah','Harga oli murah','Stiker baru'],0,'Tiga indikator itu penting.');
P(40,'Kesimpulan','Kesimpulan pemeliharaan didasarkan pada ...',['Pemeriksaan dan spesifikasi','Perkiraan','Tidak dicatat','Warna','Pendapat umum'],0,'Kesimpulan berbasis data.');

K(41,'Kebocoran','Pilih bagian yang diperiksa untuk kebocoran.',['Gasket','Seal','Baut carter','Warna cat'],[0,1,2],'Warna cat tidak diperiksa.');
K(42,'Gejala oli','Pilih gejala yang berkaitan dengan oli.',['Oli menetes di bawah mesin','Level oli cepat turun','Oli sangat kehitaman sebelum waktunya','Ban kempes'],[0,1,2],'Ban kempes tidak berkaitan.');
K(43,'K3 servis oli','Pilih tindakan keselamatan saat servis oli.',['Tunggu mesin tidak panas sebelum dikerjakan','Tampung oli bekas dan buang sesuai prosedur','Pastikan baut pembuangan terpasang dengan torsi','Buang oli bekas ke saluran air'],[0,1,2],'Membuang ke saluran air dilarang.');
K(44,'Komponen diperiksa','Pilih komponen mesin yang diperiksa.',['Rantai keteng','Dudukan mesin','Filter oli','Rantai roda'],[0,1,2],'Rantai roda bukan komponen mesin.');
K(45,'Kompresi','Pilih langkah pemeriksaan kompresi.',['Melepas busi','Mengukur dengan alat ukur kompresi','Mencatat hasil','Menyalakan mesin di ruang tertutup'],[0,1,2],'Ruang tertutup berbahaya.');
K(46,'Level oli rendah','Pilih akibat level oli di bawah batas.',['Pelumasan kurang','Keausan lebih cepat','Panas berlebih pada mesin','Oli lebih awet'],[0,1,2],'Oli lebih awet tidak benar.');
K(47,'Setelah oli','Pilih tindakan setelah penggantian oli.',['Uji fungsi mesin','Periksa kebocoran','Periksa level oli','Membuang oli bekas ke tanah'],[0,1,2],'Membuang ke tanah dilarang.');
K(48,'Suara mesin','Pilih hal yang diamati saat memeriksa suara mesin.',['Bunyi normal atau abnormal','Kondisi rantai keteng','Komponen yang bergerak','Warna lampu sein'],[0,1,2],'Lampu sein tidak berkaitan.');
K(49,'Filter oli','Pilih pernyataan yang benar tentang filter oli.',['Menyaring kotoran','Diganti sesuai jadwal servis','Dipasang dengan gasket baru','Dipoles agar awet'],[0,1,2],'Filter tidak dipoles.');
K(50,'Penyebab oli habis','Pilih penyebab oli cepat berkurang.',['Kebocoran eksternal','Pembakaran oli di ruang bakar','Level terlalu rendah saat diisi','Warna oli cerah'],[0,1,2],'Warna oli tidak menyebabkan oli habis.');

C(51,'Oli mesin','Pernyataan berikut tentang oli mesin.',[['Oli mesin melumasi dan mendinginkan',true],['Oli bekas boleh dibuang ke saluran air',false],['Level oli diukur di antara batas atas dan bawah',true]],'Oli bekas dilarang dibuang ke saluran air.');
C(52,'Filter oli','Pernyataan berikut tentang filter oli.',[['Filter oli boleh tidak diganti selamanya',false],['Filter oli menyaring kotoran',true],['Filter oli diganti sesuai jadwal servis',true]],'Filter harus diganti.');
C(53,'K3','Pernyataan berikut tentang keselamatan.',[['Mesin panas dapat menyebabkan luka bakar',true],['Mesin panas tidak berbahaya',false],['Baut pembuangan dikencangkan dengan torsi',true]],'Mesin panas berbahaya.');
C(54,'Kompresi','Pernyataan berikut tentang kompresi.',[['Kompresi rendah tidak perlu diselidiki',false],['Kompresi rendah dapat menunjukkan ring atau katup bermasalah',true],['Kompresi diukur sesuai prosedur',true]],'Kompresi rendah perlu diselidiki.');
C(55,'Rantai keteng','Pernyataan berikut tentang rantai keteng.',[['Rantai keteng perlu diperiksa kekencangannya',true],['Rantai keteng tidak perlu diperiksa',false],['Penyetel rantai keteng disetel sesuai manual',true]],'Rantai keteng penting.');
C(56,'Level oli','Pernyataan berikut tentang oli berlebih.',[['Oli berlebih tidak berpengaruh pada sistem pelumasan',false],['Oli berlebih dapat menimbulkan masalah pelumasan',true],['Level oli harus sesuai batas',true]],'Oli berlebih berpengaruh.');
C(57,'Torsi','Pernyataan berikut tentang torsi.',[['Baut pembuangan oli dikencangkan dengan torsi',true],['Baut pembuangan boleh dibiarkan longgar',false],['Torsi yang tepat mencegah kebocoran',true]],'Baut longgar bocor.');
C(58,'Dudukan','Pernyataan berikut tentang dudukan mesin.',[['Dudukan mesin dan karet perlu diperiksa',true],['Getar berlebih tidak perlu diperiksa',false],['Baut dudukan diperiksa kekencangannya',true]],'Dudukan penting.');
C(59,'Pembuangan','Pernyataan berikut tentang pembuangan limbah.',[['Oli bekas dibuang sesuai prosedur limbah',true],['Filter lama boleh dicuci lalu dipasang',false],['Oli bekas ditampung di wadah khusus',true]],'Filter lama dibuang.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pemeliharaan dicatat',true],['Hasil pemeliharaan tidak perlu dicatat',false],['Kesimpulan didasarkan pada pemeriksaan',true]],'Pencatatan wajib.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
