/* Bank soal TKA per unit LKPD: XI-3 Pembongkaran dan Pemasangan Komponen CVT. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-3',M='LKPD XI-3 Pembongkaran dan Pemasangan Komponen CVT',L=[];
function id(n){return 'lkxi3-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Rasio CVT','CVT mengubah rasio secara ...',['Kontinu','Bertingkat','Manual','Tidak berubah'],0,'CVT tidak memakai gigi bertingkat.');
P(2,'Roller','Gaya yang menggeser roller adalah gaya ...',['Sentrifugal','Magnet','Gravitasi','Listrik statis'],0,'Putaran puli menimbulkan gaya sentrifugal.');
P(3,'Komponen CVT','Komponen utama CVT antara lain ...',['Puli depan, puli belakang, dan V-belt','Roda, rem, dan kemudi','Kopling kering dan gearbox','Jok dan spion'],0,'Ketiganya termasuk komponen CVT.');
P(4,'Roller','Roller bergeser karena ...',['Putaran puli','Panas ban','Berat jok','Cahaya lampu'],0,'Putaran memicu gaya pergeseran.');
P(5,'Belt aus','Belt yang aus menyebabkan ...',['Akselerasi kurang halus dan selip','Mesin lebih senyap','Oli bertambah','Tidak ada efek'],0,'Belt aus mengurangi cengkeraman.');
P(6,'Kampas kopling','Kampas kopling berfungsi untuk ...',['Menghubungkan tenaga dari puli ke roda belakang','Mengatur rem','Menyaring udara','Menyetel idle'],0,'Kampas menghubungkan tenaga.');
P(7,'Pegas','Pegas CVT yang melemah dapat ...',['Memengaruhi perpindahan rasio','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh'],0,'Pegas mengatur gaya penahan.');
P(8,'Sebelum membongkar','Sebelum membongkar CVT, mesin harus ...',['Mati dan kunci kontak dilepas','Hidup pelan','Dalam keadaan panas','Dicuci air'],0,'Keselamatan dulu.');
P(9,'Mur penahan puli','Mur penahan puli dilepas dengan ...',['Kunci khusus penahan puli','Palu','Tang','Obeng'],0,'Kunci khusus menahan puli.');
P(10,'Pelumasan','Gemuk atau oli tidak boleh diberikan pada ...',['Belt dan permukaan puli','Bantalan poros','Engsel cover','Baut cover'],0,'Belt dan puli harus kering dari pelumas.');
P(11,'Urutan','Komponen yang dilepas harus disusun berurutan agar ...',['Tidak tertukar saat pemasangan','Lebih berat','Lebih cepat','Tidak penting'],0,'Urutan memudahkan pemasangan.');
P(12,'Roller aus','Roller yang aus menyebabkan ...',['Akselerasi lambat dan perpindahan rasio tidak tepat','Rem lebih kuat','Oli lebih cepat habis','Tidak berpengaruh'],0,'Keausan roller memengaruhi rasio.');
P(13,'Pengukuran belt','Pengukuran lebar belt dilakukan dengan ...',['Jangka sorong dan pemeriksaan fisik','Tachometer','Multimeter','Termometer'],0,'Jangka sorong mengukur lebar.');
P(14,'Torsi mur','Torsi mur CVT harus ...',['Sesuai spesifikasi','Sekuat tenaga','Tanpa kunci','Dipukul'],0,'Torsi sesuai spesifikasi.');
P(15,'Belt retak','Belt yang retak dapat menyebabkan ...',['Selip dan kehilangan tenaga','Mesin lebih halus','Rem makin kuat','Tidak berpengaruh'],0,'Belt retak kehilangan daya cengkeram.');
P(16,'Cover CVT','Cover CVT dibuka dengan melepas ...',['Komponen penghalang dan baut cover','Rangka motor','Setang','Spion'],0,'Cover dilepas setelah penghalang.');
P(17,'Gejala tersendat','Motor yang tersendat saat jalan dapat disebabkan ...',['Roller, belt, atau kampas bermasalah','Ban penuh','Lampu redup','Klakson rusak'],0,'Komponen CVT memengaruhi jalan.');
P(18,'Kampas tipis','Kampas kopling yang tipis ...',['Mengurangi daya hubung dan dapat selip','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh'],0,'Kampas tipis mudah selip.');
P(19,'Puli','Puli depan dan belakang diperiksa ...',['Permukaan dan geraknya','Warna cat','Berat','Panjang kabel'],0,'Permukaan dan gerak puli diperiksa.');
P(20,'Bunyi kasar','Bunyi kasar dari CVT dapat disebabkan oleh ...',['Bantalan atau komponen yang aus','Oli penuh','Ban kempes','Setang lurus'],0,'Komponen aus menimbulkan bunyi.');
P(21,'Kampas','Ketebalan kampas dibandingkan dengan ...',['Batas servis manual','Perkiraan','Warna kampas','Merek oli'],0,'Acuan adalah batas servis.');
P(22,'Uji fungsi','Uji fungsi CVT dilakukan dengan ...',['Menghidupkan dan mengamati perpindahan','Membiarkan mati','Memukul','Mengecat'],0,'Uji fungsi memastikan kerja.');
P(23,'Rasio','Rasio CVT berubah karena ...',['Gaya sentrifugal menggeser roller','Tekanan ban','Panas knalpot','Warna belt'],0,'Gaya sentrifugal penyebabnya.');
P(24,'Belt','Belt yang lebar dan tipis harus ...',['Diukur sesuai batas servis','Dipakai bebas','Dipoles','Dicat'],0,'Ukuran belt dicek terhadap batas.');
P(25,'Pembongkaran','Pembongkaran harus memperhatikan ...',['Urutan dan posisi komponen','Warna cover','Merek alat','Jumlah teman'],0,'Urutan dan posisi penting.');
P(26,'Torsi pemasangan','Setelah pemasangan, mur dikencangkan dengan ...',['Torsi spesifikasi','Palu','Sekuat tenaga','Tanpa kunci'],0,'Torsi spesifikasi wajib.');
P(27,'Pegas','Pegas diperiksa dengan cara ...',['Mengukur panjang dan kelenturan','Melihat warnanya','Menimbang saja','Mendengar suaranya'],0,'Panjang dan kelenturan diperiksa.');
P(28,'Roller bentuk','Roller yang bentuknya tidak rata menandakan ...',['Keausan dan perlu diganti sesuai batas','Oli baru','Belt baru','Tidak ada masalah'],0,'Bentuk tidak rata berarti aus.');
P(29,'Langkah awal','Langkah pertama pekerjaan CVT adalah ...',['Membaca manual dan mencatat kondisi awal','Membuka cover','Melepas puli','Menguji'],0,'Persiapan dan catatan dulu.');
P(30,'Pemasangan','Pemasangan kembali dilakukan ...',['Sesuai urutan dan torsi','Asal pasang','Tanpa urutan','Dengan palu'],0,'Urutan dan torsi sesuai manual.');
P(31,'Kampas kopling','Kampas kopling diukur ketebalan dan ...',['Kebersihannya','Warnanya','Mereknya','Beratnya'],0,'Ketebalan dan kebersihan dicek.');
P(32,'CVT','CVT dikenal juga sebagai transmisi ...',['Otomatis dengan rasio kontinu','Manual lima percepatan','Hidrolik kaku','Bertingkat tetap'],0,'CVT adalah transmisi otomatis kontinu.');
P(33,'Puli kotor','Permukaan puli yang kotor oleh gemuk ...',['Mengurangi cengkeraman belt','Menambah cengkeraman','Tidak berpengaruh','Membuat motor cepat'],0,'Gemuk mengurangi cengkeraman.');
P(34,'Akselerasi lambat','Akselerasi motor matic terasa lambat, penyebab yang mungkin adalah ...',['Roller atau kampas aus','Ban terlalu keras','Rem depan','Kaca spion'],0,'Roller dan kampas memengaruhi akselerasi.');
P(35,'Torsi mur','Bagian yang dikencangkan dengan torsi tertentu adalah ...',['Mur penahan puli','Spion','Stiker','Lampu'],0,'Mur penahan puli wajib torsi.');
P(36,'Area kerja','Pekerjaan pada CVT sebaiknya dilakukan di ...',['Area bersih dan terang','Tempat licin oleh oli','Tanah becek','Ruang tertutup tanpa ventilasi'],0,'Area bersih mendukung keselamatan.');
P(37,'Pegas melemah','Pegas yang melemah menyebabkan ...',['Perpindahan rasio tidak optimal','Mesin mati','Oli bocor','Rem macet'],0,'Pegas memengaruhi rasio.');
P(38,'Pemeriksaan kampas','Pemeriksaan kampas dapat menemukan ...',['Keausan dan kebersihan','Warna cat','Panjang setang','Bunyi klakson'],0,'Keausan dan kebersihan diperiksa.');
P(39,'Hasil ukur','Hasil ukur keausan dibandingkan dengan ...',['Batas servis','Ingatan','Harga','Merek'],0,'Batas servis sebagai acuan.');
P(40,'Kesimpulan','Kesimpulan pekerjaan CVT didasarkan pada ...',['Data pengukuran dan manual','Perkiraan saja','Tidak dicatat','Warna komponen'],0,'Kesimpulan harus berdasarkan data.');

K(41,'Komponen CVT','Pilih komponen CVT.',['Puli depan','Puli belakang','V-belt','Kopling kering manual'],[0,1,2],'Kopling kering manual bukan CVT.');
K(42,'Gejala CVT','Pilih gejala yang perlu pemeriksaan CVT.',['Akselerasi lambat','Motor tersendat','Belt retak','Lampu berkedip'],[0,1,2],'Lampu berkedip tidak berkaitan.');
K(43,'K3 CVT','Pilih tindakan keselamatan saat membongkar CVT.',['Mematikan mesin dan melepas kunci kontak','Menahan puli dengan alat khusus','Tidak memberi oli pada belt','Bekerja dengan mesin hidup di dekat puli'],[0,1,2],'Bekerja dengan mesin hidup berbahaya.');
K(44,'Komponen diukur','Pilih komponen CVT yang diukur keausannya.',['Belt','Roller','Kampas kopling','Pegas'],[0,1,2,3],'Keempatnya diukur keausannya.');
K(45,'Gejala kampas','Pilih gejala kampas kopling yang selip.',['Akselerasi tidak sebanding dengan putaran mesin','Putaran mesin naik tanpa motor melaju sebanding','Bunyi selip saat akselerasi','Lampu menyala terang'],[0,1,2],'Lampu menyala tidak berkaitan.');
K(46,'Pemasangan','Pilih tindakan saat pemasangan CVT.',['Kencangkan mur sesuai torsi','Pasang sesuai urutan','Periksa seal dan cover','Lumasi belt dengan oli'],[0,1,2],'Belt tidak boleh diberi oli.');
K(47,'Pegas','Pilih pemeriksaan pegas.',['Panjang','Kelenturan','Kondisi','Warna cat'],[0,1,2],'Warna cat bukan pemeriksaan pegas.');
K(48,'Roller aus','Pilih pengaruh roller yang aus.',['Akselerasi lambat','Perpindahan rasio tidak tepat','Tenaga mesin turun','Ban cepat aus'],[0,1,2],'Ban aus tidak berkaitan langsung dengan roller.');
K(49,'Prinsip CVT','Pilih pernyataan yang benar tentang CVT.',['Rasio berubah kontinu','Gaya sentrifugal menggeser roller','Belt memindahkan tenaga','Puli dikunci dengan palu'],[0,1,2],'Puli tidak dikunci dengan palu.');
K(50,'Kesimpulan CVT','Pilih dasar keputusan dalam pekerjaan CVT.',['Hasil ukur','Batas servis','Spesifikasi manual','Perkiraan saja'],[0,1,2],'Perkiraan saja bukan dasar.');

C(51,'Rasio','Pernyataan berikut tentang CVT.',[['CVT mengubah rasio secara kontinu',true],['CVT memakai gigi bertingkat tetap',false],['Rasio berubah karena gaya sentrifugal',true]],'CVT tanpa gigi bertingkat.');
C(52,'Pelumasan','Pernyataan berikut tentang pelumasan CVT.',[['Gemuk boleh diberikan pada belt',false],['Oli tidak boleh diberikan pada belt',true],['Permukaan puli harus bersih dari gemuk',true]],'Gemuk mengurangi cengkeraman.');
C(53,'K3','Pernyataan berikut tentang keselamatan CVT.',[['Mesin dihidupkan saat membongkar CVT',false],['Mesin dimatikan dan kunci kontak dilepas',true],['Puli ditahan dengan alat khusus',true]],'Mesin mati saat membongkar.');
C(54,'Mur penahan puli','Pernyataan berikut tentang mur penahan puli.',[['Puli dikunci dengan alat khusus saat melepas mur',true],['Mur dilepas dengan palu',false],['Mur dikencangkan dengan torsi',true]],'Palu tidak dipakai.');
C(55,'Belt','Pernyataan berikut tentang belt.',[['Belt retak dapat menyebabkan selip',true],['Belt retak justru menambah tenaga',false],['Belt aus menyebabkan akselerasi kurang halus',true]],'Belt retak merugikan.');
C(56,'Urutan','Pernyataan berikut tentang urutan kerja.',[['Komponen dipasang sesuai urutan pembongkaran',true],['Komponen boleh dipasang asal',false],['Urutan menghindari komponen tertukar',true]],'Urutan penting.');
C(57,'Pegas','Pernyataan berikut tentang pegas.',[['Pegas tidak berpengaruh pada perpindahan rasio',false],['Pegas yang melemah memengaruhi rasio',true],['Pegas diukur panjang dan kelenturannya',true]],'Pegas berpengaruh.');
C(58,'Torsi','Pernyataan berikut tentang torsi.',[['Mur dikencangkan dengan torsi spesifikasi',true],['Torsi tidak perlu diperhatikan',false],['Torsi sesuai manual mencegah kerusakan',true]],'Torsi sesuai manual.');
C(59,'Kampas kopling','Pernyataan berikut tentang kampas kopling.',[['Kampas perlu diukur ketebalannya',true],['Kampas tipis menambah daya hubung',false],['Kebersihan kampas diperiksa',true]],'Kampas tipis mudah selip.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pemeriksaan dicatat dan disimpulkan',true],['Hasil pemeriksaan tidak perlu dicatat',false],['Data dibandingkan dengan batas servis',true]],'Pencatatan wajib.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
