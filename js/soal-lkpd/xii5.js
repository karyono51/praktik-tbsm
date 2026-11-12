/* Bank soal TKA per unit LKPD: XII-5 Perbaikan dan Overhaul Karburator. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-5',M='LKPD XII-5 Perbaikan dan Overhaul Karburator',L=[];
function id(n){return 'lkxii5-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Fungsi karburator','Karburator berfungsi mencampur ...',['Udara dan bensin sesuai beban mesin','Oli dan air','Udara dan oli','Bensin dan cat','Air dan solar'],0,'Campuran udara dan bensin.');
P(2,'Spuyer','Spuyer dan saluran mengatur ...',['Aliran bensin','Aliran oli','Aliran udara saja','Suhu mesin','Tegangan'],0,'Aliran bensin.');
P(3,'Pelampung','Pelampung dan katup menjaga ...',['Level bensin di ruang pelampung','Level oli','Tekanan ban','Tinggi setang','Posisi jok'],0,'Level bensin.');
P(4,'Pembersihan spuyer','Spuyer yang tersumbat dibersihkan dengan ...',['Cairan pembersih dan udara bertekanan','Kawat','Paku','Tang','Palu'],0,'Kawat dapat merusak lubang.');
P(5,'Larangan kawat','Kawat dilarang untuk membersihkan spuyer karena ...',['Dapat merusak lubang spuyer','Menambah tenaga','Menghemat bensin','Membuat mesin dingin','Tidak berpengaruh'],0,'Lubang spuyer bisa rusak.');
P(6,'Tinggi pelampung','Tinggi pelampung memengaruhi ...',['Level bensin di ruang pelampung','Warna bensin','Berat motor','Tekanan ban','Suara klakson'],0,'Level bensin.');
P(7,'Sebelum melepas','Sebelum melepas karburator, kran bahan bakar ...',['Ditutup dan bensin ditampung','Dibiarkan terbuka','Dipanaskan','Dibakar','Diabaikan'],0,'Keselamatan bensin.');
P(8,'Urutan bongkar','Karburator dibongkar dengan urutan agar ...',['Tidak tertukar saat dirakit','Lebih berat','Lebih cepat','Tidak penting','Lebih mahal'],0,'Urutan memudahkan perakitan.');
P(9,'Jarum skep aus','Jarum skep yang aus menyebabkan ...',['Campuran tidak tepat','Tenaga naik','Oli bertambah','Ban lebih awet','Tidak berpengaruh'],0,'Jarum mengatur campuran.');
P(10,'Diafragma bocor','Diafragma yang bocor dapat ...',['Mengganggu aliran dan campuran','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh','Membuat bensin hemat'],0,'Kebocoran mengganggu.');
P(11,'Saluran tersumbat','Saluran yang tersumbat ...',['Menghambat aliran bensin','Menambah tenaga','Membuat bensin hemat','Tidak berpengaruh','Mengurangi getaran'],0,'Aliran terhambat.');
P(12,'Susah hidup','Mesin susah hidup dapat disebabkan oleh ...',['Spuyer tersumbat atau pelampung salah','Ban penuh','Lampu terang','Spion longgar','Warna body'],0,'Spuyer dan pelampung.');
P(13,'Tersendat digas','Mesin tersendat saat digas dapat disebabkan ...',['Saluran bensin tersumbat','Ban kempes','Setang bengkok','Rem belakang','Lampu sein'],0,'Saluran bensin.');
P(14,'Idle','Idle tidak stabil dapat disebabkan ...',['Penyetelan atau spuyer bermasalah','Warna jok','Rem depan','Spion','Klakson'],0,'Penyetelan dan spuyer.');
P(15,'Bensin meluber','Bensin meluber dapat disebabkan ...',['Pelampung atau katup tidak rapat','Ban penuh','Oli baru','Lampu terang','Spion longgar'],0,'Pelampung dan katup.');
P(16,'Tenaga kurang','Tenaga kurang dapat disebabkan ...',['Campuran atau saluran bermasalah','Oli baru','Ban baru','Lampu terang','Warna body'],0,'Campuran dan saluran.');
P(17,'Pembersihan','Pembersihan spuyer harus dilakukan ...',['Tanpa merusak lubang','Dengan kawat tajam','Dengan paku','Dengan palu','Dengan api'],0,'Tidak merusak.');
P(18,'Pelepasan','Karburator dilepas dengan cara ...',['Menutup kran dan menampung sisa bensin','Membiarkan kran terbuka','Memukul','Memanaskan','Mengangkat dengan selang'],0,'Kran ditutup.');
P(19,'Area kerja','Pekerjaan karburator dilakukan di area ...',['Berventilasi dan jauh dari api','Ruang tertutup dekat api','Tanah becek','Dekat panas','Tanpa ventilasi'],0,'Keselamatan bensin.');
P(20,'Jarum skep','Jarum skep berfungsi ...',['Mengatur aliran bensin bersama spuyer','Mengatur rem','Mengatur lampu','Mengatur oli','Mengatur ban'],0,'Aliran bensin.');
P(21,'Diafragma diperiksa','Diafragma diperiksa ...',['Kebocoran dan kelenturannya','Warnanya','Beratnya','Panjangnya','Harganya'],0,'Kebocoran dan kelenturan.');
P(22,'Pelampung diperiksa','Pelampung diperiksa ...',['Tinggi dan kerapatan katup','Warna','Berat','Panjang','Merek'],0,'Tinggi dan katup.');
P(23,'Pembersih','Pembersihan karburator dilakukan dengan ...',['Cairan pembersih khusus','Air keras','Api','Bensin tanpa pelindung','Palu'],0,'Pembersih khusus.');
P(24,'Tinggi pelampung','Penyetelan tinggi pelampung dilakukan ...',['Sesuai spesifikasi manual','Sesuka hati','Dengan palu','Dengan lem','Tanpa acuan'],0,'Spesifikasi manual.');
P(25,'Karburator bocor','Karburator yang bocor dapat ...',['Menyebabkan bensin tumpah','Menambah tenaga','Menghemat bensin','Tidak berbahaya','Membuat mesin dingin'],0,'Bensin tumpah berbahaya.');
P(26,'Udara bertekanan','Udara bertekanan digunakan untuk ...',['Meniup kotoran dari saluran','Memukul','Memanaskan','Mengisi bensin','Mengukur'],0,'Meniup kotoran.');
P(27,'Perakitan','Karburator dirakit dengan ...',['Urutan dan posisi yang benar','Asal pasang','Tanpa urutan','Dengan palu','Dengan lem'],0,'Urutan benar.');
P(28,'Saluran udara','Saluran udara harus ...',['Lancar dan bersih','Tersumbat','Tertutup kain','Dilas','Dicat'],0,'Lancar.');
P(29,'Langkah awal','Langkah awal pekerjaan karburator adalah ...',['Membaca manual dan menyiapkan alat','Membongkar langsung','Menyalakan motor','Menggosok karburator','Mencuci motor'],0,'Persiapan.');
P(30,'Wadah','Wadah komponen digunakan untuk ...',['Komponen yang harus berurutan','Oli saja','Bensin saja','Tidak perlu','Ban'],0,'Komponen berurutan.');
P(31,'Jarum skep aus','Jarum skep yang aus ...',['Diganti sesuai batas','Diamplas','Dibiarkan','Dilas','Dicat'],0,'Penggantian.');
P(32,'Diafragma','Diafragma sebaiknya ...',['Dicek kebocorannya','Diabaikan','Diganti tanpa cek','Dibakar','Dicuci'],0,'Dicek.');
P(33,'Karburator dan campuran','Mesin dengan karburator memerlukan ...',['Penyetelan campuran','Tidak perlu penyetelan','Tanpa bensin','Tanpa udara','Tanpa saluran'],0,'Penyetelan campuran.');
P(34,'Level bensin','Level bensin dalam karburator diatur oleh ...',['Pelampung','Tangan','Dibiarkan','Air','Api'],0,'Pelampung mengatur level.');
P(35,'Kebocoran','Kebocoran bahan bakar pada karburator diperiksa ...',['Setelah perakitan sesuai prosedur','Dengan api terbuka','Dengan mata tertutup','Tanpa alat','Dengan kabel tegangan'],0,'Prosedur aman.');
P(36,'Bukan komponen','Yang bukan komponen karburator adalah ...',['Kopling kering','Spuyer','Pelampung','Jarum skep','Diafragma'],0,'Kopling kering bukan karburator.');
P(37,'Pembersih aman','Pembersih karburator sebaiknya ditangani dengan ...',['Pelindung mata','Tanpa pelindung','Api','Mulut','Air panas mendidih'],0,'Pelindung mata.');
P(38,'Tujuan pembersihan','Karburator dibersihkan agar ...',['Campuran dan aliran lancar','Berat','Warna','Harga','Suara'],0,'Campuran dan aliran.');
P(39,'Hasil uji','Hasil uji karburator ...',['Dicatat dan disimpulkan','Diabaikan','Dibuang','Dicampur','Tanpa catatan'],0,'Pencatatan.');
P(40,'Kesimpulan','Kesimpulan karburator didasarkan pada ...',['Pemeriksaan dan manual','Perkiraan','Tanpa catatan','Warna','Kebiasaan'],0,'Berbasis data.');

K(41,'Komponen karburator','Pilih komponen karburator.',['Spuyer','Pelampung','Jarum skep','Diafragma','Kopling kering'],[0,1,2,3],'Kopling kering bukan karburator.');
K(42,'Tanda masalah','Pilih tanda masalah karburator.',['Mesin sulit hidup','Mesin tersendat saat digas','Idle tidak stabil','Bensin meluber','Ban kempes'],[0,1,2,3],'Ban kempes tidak berkaitan.');
K(43,'K3 karburator','Pilih tindakan keselamatan saat mengerjakan karburator.',['Tutup kran dan tampung bensin','Jauhkan dari api','Kerja di ruang berventilasi','Jangan tusuk spuyer dengan kawat','Hirup bensin untuk memeriksa'],[0,1,2,3],'Menghirup bensin berbahaya.');
K(44,'Pemeriksaan','Pilih pemeriksaan karburator yang benar.',['Spuyer bersih','Saluran lancar','Jarum skep tidak aus','Pelampung dan katup tinggi serta rapat','Ban terisi'],[0,1,2,3],'Ban tidak diperiksa di karburator.');
K(45,'Pernyataan benar','Pilih pernyataan benar tentang karburator.',['Spuyer dibersihkan tanpa merusak','Tinggi pelampung diatur sesuai spesifikasi','Kawat tajam boleh dipakai','Bensin dibiarkan tumpah','Jarum skep diabaikan'],[0,1],'Kawat dan tumpahan dilarang.');
K(46,'Pencatatan','Pilih yang dicatat setelah pekerjaan karburator.',['Kondisi komponen','Hasil uji','Tindakan yang dilakukan','Warna jok','Nama teman'],[0,1,2],'Warna jok dan nama teman tidak perlu.');
K(47,'Diafragma','Pilih pemeriksaan diafragma.',['Kebocoran','Kelenturan','Kondisi sobekan','Warna plastik','Berat diafragma'],[0,1,2],'Warna dan berat tidak perlu.');
K(48,'Saluran tersumbat','Pilih pengaruh saluran yang tersumbat.',['Aliran bensin terhambat','Campuran tidak tepat','Mesin tersendat','Tenaga naik','Oli cepat habis'],[0,1,2],'Tenaga naik bukan akibat.');
K(49,'Pelampung','Pilih fungsi pelampung.',['Mengatur level bensin','Menentukan tinggi level','Menjaga katup tetap rapat','Mengatur udara sekaligus oli','Mengatur rem'],[0,1,2],'Udara dan oli bukan fungsi pelampung.');
K(50,'Pembersihan','Pilih cara membersihkan karburator yang aman.',['Cairan pembersih khusus','Udara bertekanan','Sikat lembut','Kawat tajam','Api terbuka'],[0,1,2],'Kawat dan api berbahaya.');

C(51,'Kawat','Pernyataan berikut tentang pembersihan spuyer.',[['Kawat boleh dipakai untuk membersihkan spuyer',false],['Pembersihan spuyer dilakukan tanpa merusak lubang',true],['Udara bertekanan dapat dipakai untuk meniup saluran',true]],'Kawat merusak lubang.');
C(52,'Fungsi karburator','Pernyataan berikut tentang karburator.',[['Karburator mencampur udara dan bensin',true],['Karburator mencampur oli dan air',false],['Campuran disesuaikan beban mesin',true]],'Karburator.');
C(53,'Pelampung','Pernyataan berikut tentang pelampung.',[['Pelampung menjaga level bensin',true],['Pelampung mengatur warna bensin',false],['Tinggi pelampung memengaruhi level bensin',true]],'Pelampung.');
C(54,'Sebelum melepas','Pernyataan berikut tentang keselamatan.',[['Kran bahan bakar ditutup sebelum melepas karburator',true],['Kerja dengan bensin dilakukan di ruang tertutup',false],['Bensin yang tumpah ditampung',true]],'Keselamatan.');
C(55,'K3','Pernyataan berikut tentang kerja bensin.',[['Kerja dengan bensin dilakukan di ruang tertutup',false],['Kerja dilakukan di ruang berventilasi',true],['Api dijauhkan dari area kerja',true]],'Ventilasi.');
C(56,'Jarum','Pernyataan berikut tentang jarum skep.',[['Jarum skep yang aus perlu diganti',true],['Jarum skep aus tidak berpengaruh',false],['Jarum skep mengatur aliran bersama spuyer',true]],'Jarum.');
C(57,'Diafragma','Pernyataan berikut tentang diafragma.',[['Diafragma diperiksa kebocorannya',true],['Diafragma tidak perlu diperiksa',false],['Diafragma diperiksa kelenturannya',true]],'Diafragma.');
C(58,'Gejala','Pernyataan berikut tentang bensin meluber.',[['Bensin meluber dapat disebabkan pelampung tidak rapat',true],['Bensin meluber selalu karena ban',false],['Katup pelampung diperiksa',true]],'Gejala.');
C(59,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil uji karburator dicatat',true],['Hasil uji karburator tidak perlu dicatat',false],['Kondisi komponen dicatat',true]],'Pencatatan.');
C(60,'Penyetelan','Pernyataan berikut tentang penyetelan pelampung.',[['Penyetelan tinggi pelampung boleh sesuka hati',false],['Penyetelan tinggi pelampung sesuai spesifikasi',true],['Penyetelan memakai acuan manual',true]],'Spesifikasi.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
