/* Bank soal TKA per unit LKPD: XII-7 Overhaul Sistem Transmisi Manual. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-7',M='LKPD XII-7 Overhaul Sistem Transmisi Manual',L=[];
function id(n){return 'lkxii7-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Transmisi manual','Transmisi manual menyalurkan putaran poros engkol ke roda dengan ...',['Rasio gigi yang berbeda','Rasio oli','Rasio rem','Rasio ban','Rasio spion'],0,'Rasio gigi berbeda.');
P(2,'Garpu persneling','Garpu persneling berfungsi ...',['Menggeser gigi agar bertaut','Menyaring oli','Mendinginkan mesin','Mengatur rem','Mengatur ban'],0,'Menggeser gigi.');
P(3,'Baut crankcase','Baut crankcase dikencangkan ...',['Sesuai urutan dan torsi manual','Secara acak','Sekuat tenaga','Tanpa kunci','Dengan dipukul'],0,'Urutan dan torsi.');
P(4,'Gigi aus','Gigi transmisi yang aus diperiksa dari ...',['Keausan dan keretakan','Warna cat','Harga','Merek','Berat'],0,'Keausan dan retak.');
P(5,'Garpu bengkok','Garpu persneling yang bengkok menyebabkan ...',['Perpindahan gigi sulit','Tenaga naik','Getaran berkurang','Tidak berpengaruh','Oli hemat'],0,'Perpindahan sulit.');
P(6,'Celah komponen','Celah komponen diukur dengan ...',['Jangka sorong, mikrometer, dan feeler gauge','Tachometer','Multimeter saja','Termometer','Penggaris kayu'],0,'Alat ukur celah.');
P(7,'Oli transmisi','Oli transmisi ditampung saat dikuras dan dibuang ...',['Sesuai prosedur limbah','Ke tanah','Dicampur air','Dibakar','Dibiarkan'],0,'Limbah oli.');
P(8,'Tepi tajam','Hati-hati terhadap tepi tajam dan komponen berat karena ...',['Dapat melukai','Tidak berbahaya','Menambah tenaga','Boleh diabaikan','Membuat motor cepat'],0,'Keselamatan.');
P(9,'Urutan komponen','Komponen disusun berurutan agar ...',['Tidak tertukar','Lebih berat','Cepat dicat','Tidak penting','Lebih mahal'],0,'Urutan.');
P(10,'Snap ring','Tang snap ring dipakai dengan ...',['Pelindung mata','Tanpa pelindung','Sambil memukul','Dengan api','Dengan air'],0,'Pelindung mata.');
P(11,'Perpindahan keras','Perpindahan gigi yang keras dapat disebabkan ...',['Garpu atau gigi aus','Ban penuh','Lampu terang','Spion longgar','Warna body'],0,'Garpu dan gigi.');
P(12,'Gigi sulit masuk','Gigi yang sulit masuk dapat disebabkan ...',['Garpu bengkok atau gigi aus','Ban kempes','Setang bengkok','Rem depan','Lampu sein'],0,'Garpu dan gigi.');
P(13,'Bunyi kasar','Bunyi kasar dari transmisi dapat disebabkan ...',['Bantalan atau gigi aus','Oli penuh','Ban kempes','Setang lurus','Warna cat'],0,'Bantalan dan gigi.');
P(14,'Oli bocor','Oli bocor dari crankcase biasanya karena ...',['Gasket atau seal rusak','Ban baru','Lampu terang','Spion','Setang'],0,'Gasket dan seal.');
P(15,'Gigi patah','Gigi yang patah ...',['Perlu diganti sesuai kondisi','Dipaksa masuk','Dibiarkan','Dicat','Dilem'],0,'Diganti.');
P(16,'Poros','Poros diperiksa kelurusan dan ...',['Keausannya','Warnanya','Beratnya','Harganya','Mereknya'],0,'Kelurusan dan aus.');
P(17,'Pelumasan','Pelumasan transmisi harus ...',['Merata saat dirakit','Dibiarkan kering','Berlebihan','Sekadar tetes','Dengan air'],0,'Merata.');
P(18,'Sebelum membuka','Sebelum membuka crankcase, oli ...',['Dikuras terlebih dahulu','Dipanaskan','Dihidupkan','Dicampur air','Dibakar'],0,'Kuras dulu.');
P(19,'Shim','Shim berfungsi untuk ...',['Mengatur celah komponen','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh','Mendinginkan'],0,'Shim mengatur celah.');
P(20,'Pembukaan','Pembukaan crankcase dilakukan ...',['Sesuai urutan baut di manual','Secara acak','Dengan dipukul','Dengan palu','Tanpa urutan'],0,'Urutan manual.');
P(21,'Engine stand','Engine stand berfungsi untuk ...',['Menopang mesin saat dikerjakan','Mengisi bensin','Menyetel rem','Mengecat','Menimbang'],0,'Penopang mesin.');
P(22,'Kunci crankcase','Crankcase dibuka dengan kunci ...',['Sesuai ukuran dan urutan','Palu besar','Tang buaya','Obeng pencungkil','Lem'],0,'Kunci sesuai.');
P(23,'Pemasangan gigi','Gigi dipasang sesuai ...',['Posisi dan urutan','Selera','Warna','Ukuran apa saja','Tanpa tanda'],0,'Posisi dan urutan.');
P(24,'Pelumas','Pelumas dioleskan pada ...',['Bagian yang bergerak','Piringan rem','Pad rem','Busi','Lampu'],0,'Bagian bergerak.');
P(25,'Nama lain','Transmisi manual dikenal juga dengan nama ...',['Gearbox bertingkat','CVT','Matic','Hidrolik','Otomatis penuh'],0,'Gearbox bertingkat.');
P(26,'Rasio gigi','Rasio gigi mengubah ...',['Torsi dan kecepatan','Warna','Berat','Harga','Suara klakson'],0,'Torsi dan kecepatan.');
P(27,'Batas keausan','Keausan celah komponen dibandingkan dengan ...',['Batas servis','Ingatan','Harga','Merek','Warna'],0,'Batas servis.');
P(28,'Penilaian gigi','Gigi dinilai dari ...',['Keausan dan kerusakan permukaan','Warna','Harga','Merek','Berat'],0,'Keausan dan kerusakan.');
P(29,'Perawatan','Perawatan transmisi mengikuti ...',['Jadwal dan manual','Keinginan pribadi','Tanpa oli','Tanpa catatan','Sesuka hati'],0,'Jadwal dan manual.');
P(30,'Langkah awal','Langkah pertama pekerjaan transmisi adalah ...',['Membaca manual dan menyiapkan alat','Membuka crankcase langsung','Memukul','Menguras sembarang','Merakit'],0,'Persiapan.');
P(31,'Tempat komponen','Komponen yang dilepas ditempatkan dalam ...',['Wadah berurutan','Lantai','Tanah','Selokan','Kantong'],0,'Wadah berurutan.');
P(32,'Lembar catatan','Lembar catatan berisi ...',['Hasil ukur dan kondisi','Gambar iklan','Harga suku cadang','Nomor telepon','Warna motor'],0,'Hasil ukur.');
P(33,'Gigi aus','Gigi transmisi yang aus ...',['Perlu diganti sesuai batas','Dipoles saja','Diamplas tebal','Dilas','Dibiarkan'],0,'Diganti sesuai batas.');
P(34,'Merakit kembali','Merakit kembali transmisi dilakukan dengan ...',['Urutan, shim, dan pelumasan','Tanpa shim','Tanpa pelumas','Dipaksa','Asal'],0,'Urutan dan shim.');
P(35,'Sulit berpindah','Transmisi yang sulit berpindah gigi perlu diperiksa ...',['Garpu atau gigi','Lampu sein','Spion','Ban','Setang'],0,'Garpu dan gigi.');
P(36,'Pengukuran keausan','Pengukuran keausan dilakukan terhadap ...',['Batas servis manual','Perkiraan','Warna','Harga','Kebiasaan'],0,'Batas servis.');
P(37,'Komponen bergerak','Komponen transmisi yang bergerak adalah ...',['Gigi dan poros','Kaca','Lampu','Jok','Spion'],0,'Gigi dan poros.');
P(38,'Pengisian oli','Oli transmisi diisi sesuai ...',['Spesifikasi dan level','Sembarang','Air','Oli bekas','Bensin'],0,'Spesifikasi dan level.');
P(39,'Hasil pemeriksaan','Hasil pemeriksaan transmisi ...',['Dicatat dan disimpulkan','Dihapus','Diabaikan','Dibuang','Dicampur'],0,'Dicatat.');
P(40,'Kesimpulan','Kesimpulan pekerjaan transmisi didasarkan pada ...',['Pemeriksaan dan manual','Perkiraan','Tanpa catatan','Warna','Kebiasaan'],0,'Berbasis data.');

K(41,'Komponen transmisi','Pilih komponen transmisi manual.',['Gigi','Poros','Garpu persneling','Shim','Kampas kopling matic'],[0,1,2,3],'Kampas kopling matic bukan transmisi manual.');
K(42,'Pemeriksaan','Pilih yang diperiksa pada transmisi.',['Gigi transmisi','Garpu persneling','Poros','Celah komponen','Warna body'],[0,1,2,3],'Warna body bukan pemeriksaan.');
K(43,'K3 transmisi','Pilih tindakan keselamatan dalam overhaul transmisi.',['Tampung oli saat menguras','Buang oli sesuai prosedur','Hati-hati tepi tajam','Gunakan pelindung mata saat snap ring','Hirup uap oli untuk memeriksa'],[0,1,2,3],'Menghirup uap berbahaya.');
K(44,'Gejala','Pilih gejala transmisi yang bermasalah.',['Gigi sulit masuk','Bunyi kasar','Oli bocor','Perpindahan keras','Ban kempes'],[0,1,2,3],'Ban kempes tidak berkaitan.');
K(45,'Pernyataan benar','Pilih pernyataan yang benar.',['Garpu menggeser gigi','Baut crankcase dikencangkan sesuai urutan','Komponen disusun berurutan','Pelumas dioleskan pada permukaan rem','Oli dibuang ke selokan'],[0,1,2],'Pelumas rem dan selokan salah.');
K(46,'Pemeriksaan termasuk','Pilih pemeriksaan yang termasuk overhaul transmisi.',['Gigi dan garpu','Poros dan kelurusannya','Celah komponen','Warna mesin','Tekanan ban'],[0,1,2],'Warna mesin dan tekanan ban bukan pemeriksaan.');
K(47,'Alat ukur','Pilih alat ukur yang digunakan pada transmisi.',['Jangka sorong','Mikrometer','Feeler gauge','Termometer','Multimeter untuk rasio'],[0,1,2],'Termometer dan multimeter tidak untuk celah komponen.');
K(48,'Perakitan','Pilih hal yang harus dijaga saat perakitan.',['Shim dipasang sesuai','Pelumas merata','Urutan dijaga','Dipaksa masuk','Torsi diabaikan'],[0,1,2],'Dipaksa dan torsi diabaikan salah.');
K(49,'Gigi aus','Pilih tindakan untuk gigi yang aus.',['Diganti sesuai batas','Dicek ulang','Dicatat','Dipoles','Dibiarkan'],[0,1,2],'Dipoles dan dibiarkan tidak tepat.');
K(50,'Pelumasan','Pilih pernyataan benar tentang pelumasan.',['Merata','Sesuai spesifikasi','Levelnya dicek','Berlebihan tanpa batas','Dengan air'],[0,1,2],'Berlebihan dan air salah.');

C(51,'Garpu','Pernyataan berikut tentang garpu persneling.',[['Garpu persneling menggeser gigi agar bertaut',true],['Garpu yang bengkok memudahkan perpindahan gigi',false],['Garpu diperiksa dari bengkok dan aus',true]],'Garpu bengkok menyulitkan.');
C(52,'Crankcase','Pernyataan berikut tentang crankcase.',[['Baut crankcase dikencangkan sesuai urutan dan torsi',true],['Baut crankcase dikencangkan acak',false],['Urutan membuka mengikuti manual',true]],'Urutan.');
C(53,'Gigi','Pernyataan berikut tentang gigi transmisi.',[['Gigi aus perlu diukur dan dibandingkan batas servis',true],['Gigi aus cukup dipoles',false],['Gigi patah perlu diganti',true]],'Gigi.');
C(54,'Oli','Pernyataan berikut tentang oli transmisi.',[['Oli transmisi boleh dibuang ke tanah',false],['Oli transmisi dibuang sesuai prosedur limbah',true],['Oli transmisi diisi sesuai spesifikasi',true]],'Limbah.');
C(55,'Shim','Pernyataan berikut tentang shim.',[['Shim berfungsi mengatur celah komponen',true],['Shim berfungsi menambah tenaga',false],['Shim dipasang sesuai urutan',true]],'Shim.');
C(56,'K3','Pernyataan berikut tentang keselamatan.',[['Tang snap ring dipakai dengan pelindung mata',true],['Tepi tajam dapat diabaikan',false],['Komponen berat ditangani hati-hati',true]],'K3.');
C(57,'Perakitan','Pernyataan berikut tentang perakitan.',[['Komponen disusun berurutan agar tidak tertukar',true],['Perakitan boleh dipaksa agar cepat',false],['Pelumasan dilakukan merata',true]],'Perakitan.');
C(58,'Pemeriksaan','Pernyataan berikut tentang pemeriksaan.',[['Poros diperiksa kelurusannya',true],['Poros tidak perlu diperiksa',false],['Keausan dibandingkan dengan batas servis',true]],'Pemeriksaan.');
C(59,'Pelumas','Pernyataan berikut tentang pelumas.',[['Pelumas dioleskan pada bagian yang bergerak',true],['Pelumas dioleskan pada permukaan rem',false],['Pelumasan merata saat dirakit',true]],'Pelumas.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pemeriksaan dicatat dan disimpulkan',true],['Hasil pemeriksaan dihapus',false],['Lembar catatan mencatat hasil ukur',true]],'Pencatatan.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
