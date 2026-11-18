/* Bank soal TKA per unit LKPD: XII-1 Servis Berkala Sesuai Buku Pedoman Reparasi. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-1',M='LKPD XII-1 Servis Berkala Sesuai Buku Pedoman Reparasi',L=[];
function id(n){return 'lkxii1-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Jadwal servis','Jadwal servis berkala ditentukan oleh ...',['Buku pedoman reparasi','Perkiraan teknisi','Warna motor','Harga oli','Kebiasaan pemilik'],0,'Pedoman resmi menyatakan interval servis.');
P(2,'Setelah servis','Setelah servis, hal yang wajib dilakukan adalah ...',['Uji fungsi dan pencatatan hasil','Menyerahkan tanpa uji','Langsung dijual','Tidak perlu dicatat','Hanya dicuci'],0,'Uji fungsi dan catatan memastikan kelayakan.');
P(3,'Dasar servis','Servis berkala didasarkan pada ...',['Jarak tempuh atau waktu','Warna body','Merek ban','Jumlah penumpang','Hari libur'],0,'Servis berjadwal menurut jarak atau waktu.');
P(4,'Oli mesin','Oli mesin diganti sesuai ...',['Spesifikasi dan jadwal manual','Perkiraan saja','Warna oli','Harga oli','Tanpa acuan'],0,'Manual menjadi acuan penggantian.');
P(5,'Filter udara','Filter udara diperiksa karena memengaruhi ...',['Campuran dan tenaga mesin','Sistem rem','Warna body','Lampu depan','Bunyi klakson'],0,'Udara bersih memengaruhi pembakaran.');
P(6,'Tekanan ban','Tekanan ban diperiksa sesuai ...',['Spesifikasi pabrikan','Kesan keras di tangan','Perkiraan pemilik','Warna ban','Berat jok'],0,'Acuan tekanan adalah spesifikasi pabrikan.');
P(7,'Rem','Rem diperiksa agar ...',['Ketebalan pad dan fungsi tetap normal','Warna cat terlihat baru','Motor lebih cepat','Ban lebih awet','Lampu menyala terang'],0,'Pemeriksaan rem menjaga keselamatan.');
P(8,'Kelistrikan','Komponen kelistrikan yang diperiksa adalah ...',['Tegangan baterai dan fungsi lampu','Warna kabel saja','Merek baterai','Panjang kabel','Berat kabel'],0,'Tegangan dan fungsi lampu diperiksa.');
P(9,'Topang','Saat servis, motor harus ditopang ...',['Stabil dan jauh dari bagian panas','Di jalan miring','Di atas bebatuan','Tanpa standar','Di atas pasir'],0,'Topang stabil mencegah jatuh.');
P(10,'Limbah','Oli bekas dibuang ...',['Sesuai prosedur limbah','Ke selokan','Ke tanah','Dibakar','Dicampur air'],0,'Limbah harus diserahkan.');
P(11,'Uji rem','Rem harus berfungsi sebelum ...',['Uji jalan','Pencucian motor','Pengecatan','Servis filter','Pengisian bensin'],0,'Keselamatan uji jalan.');
P(12,'Uji jalan','Uji jalan dilakukan ...',['Dengan izin guru dan perlengkapan keselamatan','Tanpa izin','Tanpa helm','Dengan banyak penumpang','Tanpa alat'],0,'Uji jalan diawasi dan memakai APD.');
P(13,'Motor tersendat','Motor yang tersendat dapat disebabkan oleh ...',['Filter atau busi bermasalah','Ban penuh','Lampu terang','Spion longgar','Warna body'],0,'Pasokan udara atau bensin bermasalah.');
P(14,'Rem kurang pakem','Rem kurang pakem dapat disebabkan oleh ...',['Pad aus atau minyak rem bermasalah','Ban terlalu keras','Lampu redup','Kaca spion kotor','Warna jok'],0,'Pad aus mengurangi gesekan.');
P(15,'Lampu redup','Lampu redup dapat disebabkan oleh ...',['Tegangan atau sambungan bermasalah','Ban kempes','Setang bengkok','Rem depan','Kaca spion'],0,'Tegangan atau sambungan lemah.');
P(16,'Kebocoran oli','Kebocoran oli sering berasal dari ...',['Seal atau gasket rusak','Ban aus','Lampu sein','Kaca spion','Setang'],0,'Seal dan gasket rentan bocor.');
P(17,'Ban kurang angin','Ban yang kurang angin harus ...',['Tekanannya dicek dan disetel','Dibiarkan','Dipukul','Ditambah oli','Diabaikan'],0,'Tekanan disetel sesuai spesifikasi.');
P(18,'Belt atau rantai','Belt atau rantai diperiksa kondisi dan ...',['Kekendurannya','Warnanya','Mereknya','Harganya','Ukuran spion'],0,'Kekenduran menentukan kerja penggerak.');
P(19,'Baterai','Baterai diperiksa tegangan dan ...',['Kondisi terminalnya','Warna casing','Harganya','Mereknya','Beratnya'],0,'Terminal dan tegangan diperiksa.');
P(20,'Jenis oli','Jenis oli yang dipakai sesuai ...',['Manual pabrikan','Selera pemilik','Harga termurah','Warna oli','Iklan'],0,'Manual pabrikan menentukan.');
P(21,'Persiapan','Persiapan servis dimulai dengan ...',['Membaca buku pedoman dan menentukan item servis','Membuka oli','Mencuci motor','Melepas lampu','Mengisi bensin'],0,'Persiapan dan penentuan item.');
P(22,'Busi','Penggantian busi dilakukan ...',['Sesuai jadwal dan kondisi','Setiap hari','Tidak pernah','Saat motor rusak saja','Secara acak'],0,'Jadwal dan kondisi busi.');
P(23,'Item servis','Penentuan item servis berdasarkan ...',['Jarak tempuh dan waktu','Warna motor','Merek','Berat motor','Harga oli'],0,'Jarak dan waktu menjadi dasar.');
P(24,'Kartu servis','Kartu servis berfungsi untuk ...',['Mencatat riwayat servis','Menyimpan oli','Menambah tenaga','Menutup filter','Menyimpan alat ukur'],0,'Kartu mencatat riwayat.');
P(25,'Filter oli','Filter oli diganti ...',['Bila sesuai jadwal atau kondisi','Tidak pernah','Setiap hari','Saat rusak saja','Hanya dibersihkan'],0,'Penggantian menurut jadwal dan kondisi.');
P(26,'Rantai','Rantai diberi pelumas sesuai ...',['Spesifikasi dan kondisi','Kebiasaan di rem','Kebiasaan di ban','Kebiasaan di spion','Tidak perlu'],0,'Pelumasan mengikuti kondisi.');
P(27,'Hasil servis','Hasil servis dinyatakan ...',['Layak jalan setelah uji fungsi','Layak tanpa uji','Tidak layak selalu','Tergantung warna','Belum diketahui'],0,'Kelayakan setelah uji.');
P(28,'Kunci torsi','Kunci torsi digunakan untuk ...',['Mengencangkan baut sesuai spesifikasi','Mengendurkan baut','Memukul','Memotong','Menimbang'],0,'Torsi sesuai spesifikasi.');
P(29,'Penggantian oli','Penggantian oli mesin dilakukan dengan ...',['Menguras dan mengisi oli sesuai spesifikasi','Menambah air','Mengecat mesin','Memasang busi baru saja','Menghapus stiker'],0,'Kuras dan isi sesuai spesifikasi.');
P(30,'Interval servis','Interval servis ditentukan oleh ...',['Pedoman resmi','Ingatan pemilik','Pendapat tetangga','Warna motor','Harga oli'],0,'Pedoman resmi.');
P(31,'Kebiasaan servis','Kebiasaan servis yang benar adalah ...',['Mengikuti pedoman dan mencatat','Menunda terus','Mengabaikan rem','Menunda penggantian oli','Tanpa catatan'],0,'Ikuti pedoman dan catat.');
P(32,'Kelistrikan','Servis kelistrikan mencakup ...',['Pemeriksaan baterai dan lampu','Mengecat rangka','Memoles knalpot','Menukar jok','Memasang stiker'],0,'Baterai dan lampu termasuk.');
P(33,'Kebersihan','Kebersihan area kerja ...',['Penting untuk keselamatan','Tidak penting','Menambah tenaga','Mengubah rasio','Menambah tegangan'],0,'Area bersih mendukung keselamatan.');
P(34,'Belt matic','Pemeriksaan belt pada unit matic meliputi ...',['Retak dan aus','Warna belt diubah','Belt dicat','Belt diberi lem','Belt dijemur'],0,'Retak dan aus diperiksa.');
P(35,'Komponen matic','Komponen utama servis matic antara lain ...',['Oli, filter, busi, dan rem','Kopling kering','Gearbox lima percepatan','Kampas kopling manual','Kickstarter'],0,'Komponen servis umum.');
P(36,'Kabel gas','Pelumasan kabel gas dilakukan pada ...',['Engsel dan kabel gas sesuai manual','Ban','Rem belakang','Lampu','Setang'],0,'Engsel dan kabel gas.');
P(37,'Kondisi unit','Sebelum servis, unit sebaiknya ...',['Stabil dan terparkir aman','Dalam keadaan panas','Dihidupkan terus','Dalam perjalanan','Terguling'],0,'Unit stabil dan aman.');
P(38,'Limbah filter','Filter bekas diserahkan ...',['Sesuai prosedur limbah','Ke sungai','Ditimbun','Dibakar','Diletakkan di lantai'],0,'Limbah diurus.');
P(39,'Keberhasilan servis','Servis dinyatakan berhasil jika ...',['Uji fungsi normal, tidak bocor, dan rem baik','Warna cat baru','Berat motor berubah','Harga oli murah','Klakson berbunyi'],0,'Tiga indikator keberhasilan.');
P(40,'Kesimpulan','Kesimpulan servis didasarkan pada ...',['Pemeriksaan dan pedoman','Perkiraan','Warna','Tanpa catatan','Kebiasaan'],0,'Berbasis data dan pedoman.');

K(41,'Komponen servis','Pilih komponen yang termasuk servis berkala.',['Oli mesin','Filter udara','Busi','Rem','Kopling kering'],[0,1,2,3],'Kopling kering bukan item servis umum.');
K(42,'Rem','Pilih item rem yang diperiksa.',['Ketebalan pad','Fungsi rem','Level minyak rem','Warna cat rem','Bunyi klakson'],[0,1,2],'Warna cat dan klakson tidak diperiksa.');
K(43,'Kelistrikan','Pilih pemeriksaan kelistrikan.',['Tegangan baterai','Fungsi lampu','Sambungan kabel','Warna jok','Panjang kabel'],[0,1,2],'Warna jok dan panjang kabel bukan pemeriksaan.');
K(44,'Tanda servis','Pilih tanda motor perlu diservis.',['Motor tersendat','Rem kurang pakem','Lampu redup','Kebocoran oli','Warna cat pudar'],[0,1,2,3],'Warna cat pudar tidak berarti rusak.');
K(45,'K3 servis','Pilih tindakan keselamatan saat servis.',['Topang motor stabil','Buang oli bekas sesuai prosedur','Pastikan rem berfungsi sebelum uji jalan','Hindari bagian panas','Hirup uap oli untuk memeriksa'],[0,1,2,3],'Menghirup uap oli berbahaya.');
K(46,'Pencatatan','Pilih yang dicatat setelah servis.',['Item servis','Hasil uji fungsi','Kondisi motor','Warna jok','Tanggal servis'],[0,1,2,4],'Warna jok tidak perlu dicatat.');
K(47,'Ban','Pilih yang diperiksa pada ban.',['Tekanan','Keausan','Kondisi permukaan','Warna velg','Merek ban'],[0,1,2],'Warna velg dan merek bukan pemeriksaan.');
K(48,'Motor tersendat','Pilih penyebab motor tersendat.',['Filter bermasalah','Busi kotor','Pasokan bensin kurang','Ban penuh','Spion longgar'],[0,1,2],'Ban penuh dan spion tidak menyebabkan.');
K(49,'Pernyataan servis','Pilih pernyataan benar tentang servis.',['Servis mengikuti pedoman','Uji jalan wajib dengan izin','Oli bekas dibuang sesuai prosedur','Rem boleh diabaikan','Kebersihan tidak penting'],[0,1,2],'Rem tidak boleh diabaikan.');
K(50,'Pengecekan','Pilih pengecekan yang termasuk servis.',['Tegangan baterai','Tekanan ban','Kekenduran belt','Warna body','Kebersihan filter'],[0,1,2,4],'Warna body bukan pengecekan teknis.');

C(51,'Jadwal servis','Pernyataan berikut tentang jadwal servis.',[['Jadwal servis berkala ditentukan oleh buku pedoman',true],['Jadwal servis ditentukan warna motor',false],['Servis berdasarkan jarak atau waktu',true]],'Pedoman menjadi acuan.');
C(52,'Setelah servis','Pernyataan berikut tentang setelah servis.',[['Setelah servis motor boleh langsung dijual tanpa uji',false],['Setelah servis dilakukan uji fungsi',true],['Hasil servis dicatat',true]],'Uji fungsi wajib.');
C(53,'Uji jalan','Pernyataan berikut tentang uji jalan.',[['Uji jalan dilakukan dengan izin guru',true],['Uji jalan boleh tanpa perlengkapan keselamatan',false],['Rem diuji sebelum uji jalan',true]],'Keselamatan uji jalan.');
C(54,'Oli bekas','Pernyataan berikut tentang oli bekas.',[['Oli bekas boleh dibuang ke selokan',false],['Oli bekas dibuang sesuai prosedur limbah',true],['Oli bekas ditampung dengan wadah',true]],'Limbah.');
C(55,'Tekanan ban','Pernyataan berikut tentang tekanan ban.',[['Tekanan ban diperiksa sesuai spesifikasi',true],['Tekanan ban cukup dengan perkiraan',false],['Ban kurang angin harus disetel',true]],'Spesifikasi.');
C(56,'Motor tersendat','Pernyataan berikut tentang motor tersendat.',[['Motor tersendat dapat disebabkan filter bermasalah',true],['Motor tersendat selalu karena ban',false],['Busi dapat memengaruhi kelancaran',true]],'Penyebab.');
C(57,'Lampu','Pernyataan berikut tentang lampu redup.',[['Lampu redup selalu normal',false],['Lampu redup dapat disebabkan tegangan lemah',true],['Sambungan lampu diperiksa',true]],'Lampu redup perlu diperiksa.');
C(58,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil servis dicatat',true],['Hasil servis tidak perlu dicatat',false],['Kartu servis mencatat riwayat',true]],'Pencatatan.');
C(59,'Rem','Pernyataan berikut tentang rem.',[['Rem diuji sebelum uji jalan',true],['Rem kurang pakem boleh dibiarkan',false],['Pad aus perlu diperiksa ketebalannya',true]],'Rem.');
C(60,'Kebersihan','Pernyataan berikut tentang kebersihan.',[['Kebersihan area kerja penting untuk keselamatan',true],['Kebersihan area kerja tidak penting',false],['Area bersih mengurangi risiko kecelakaan',true]],'K3.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
