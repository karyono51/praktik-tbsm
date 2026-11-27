/* Bank soal TKA per unit LKPD: XII-3 Pengukuran Diameter Silinder dan Keausan. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-3',M='LKPD XII-3 Pengukuran Diameter Silinder dan Keausan',L=[];
function id(n){return 'lkxii3-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Ovalitas','Ovalitas silinder adalah selisih diameter ...',['Dua arah pada ketinggian yang sama','Atas dan bawah','Luar dan dalam','Kiri dan kanan saja','Ring dan piston'],0,'Ovalitas menunjukkan bentuk tidak bulat.');
P(2,'Konisitas','Konisitas silinder adalah selisih diameter ...',['Atas dan bawah','Dua arah pada ketinggian sama','Luar dan dalam','Piston dan ring','Dua silinder berbeda'],0,'Konisitas menunjukkan perbedaan atas dan bawah.');
P(3,'Keausan silinder','Keausan silinder menyebabkan ...',['Diameter membesar dan bentuk berubah','Diameter mengecil','Tidak berubah','Dinding lebih rapat','Oli lebih kental'],0,'Gesekan ring membesarkan diameter.');
P(4,'Titik ukur','Pengukuran diameter silinder dilakukan pada ...',['Tiga ketinggian dan dua arah','Satu titik saja','Di luar blok','Dengan mata saja','Tanpa alat'],0,'Pengukuran pada beberapa titik dan arah.');
P(5,'Kalibrasi','Alat bore gauge dikalibrasi dengan ...',['Mikrometer luar atau ring standar','Penggaris biasa','Termometer','Multimeter','Tachometer'],0,'Kalibrasi memakai ukuran standar.');
P(6,'Goresan','Silinder yang bergores vertikal dapat menandakan ...',['Kerusakan ring atau pelumasan kurang','Tenaga bertambah','Silinder baru','Tidak berpengaruh','Kompresi naik'],0,'Goresan menandakan gesekan berlebih.');
P(7,'Batas servis','Diameter yang melebihi batas servis ditindaklanjuti dengan ...',['Honing atau bor-up sesuai keputusan','Dibiarkan saja','Diberi lem','Dipoles','Ditutup kain'],0,'Tindakan sesuai hasil ukur.');
P(8,'Pembersihan','Silinder dibersihkan sebelum diukur agar ...',['Pengukuran tidak keliru','Lebih berat','Lebih cepat dicat','Tidak perlu','Oli habis'],0,'Kotoran mengacaukan hasil.');
P(9,'Alat ukur','Alat ukur tidak boleh ...',['Menggores dinding silinder','Diatur nol','Dibersihkan','Disimpan','Dicatat'],0,'Goresan merusak silinder.');
P(10,'Keselamatan blok','Blok silinder dipegang dengan hati-hati karena ...',['Berat dan licin','Ringan sekali','Selalu panas','Tidak berbahaya','Berwarna gelap'],0,'Berat dan licin berisiko.');
P(11,'Kalibrasi','Kalibrasi bore gauge dilakukan ...',['Sebelum pengukuran','Setelah dibuang','Tidak perlu','Saat silinder hangat','Dengan oli'],0,'Kalibrasi mendahului pengukuran.');
P(12,'Ring tidak rapat','Ring piston yang tidak rapat dapat menyebabkan ...',['Kompresi rendah','Tenaga naik','Oli lebih awet','Tidak berpengaruh','Idle naik'],0,'Kebocoran gas menurunkan kompresi.');
P(13,'Konis','Silinder konis berarti ...',['Diameter atas dan bawah berbeda','Diameter sama semua','Tidak ada ukuran','Berbentuk bulat sempurna','Warna berbeda'],0,'Perbedaan atas dan bawah.');
P(14,'Oval','Silinder oval berarti ...',['Diameter dua arah berbeda','Diameter sama','Tanpa selisih','Bulat sempurna','Tidak perlu diukur'],0,'Perbedaan dua arah.');
P(15,'Arah ukur','Pengukuran diameter atas dilakukan ...',['Dua arah pada tiap ketinggian','Satu arah saja','Sembarang arah','Tanpa tanda','Di luar silinder'],0,'Dua arah pada tiap titik.');
P(16,'Batas servis','Hasil pengukuran dibandingkan dengan ...',['Batas servis','Perkiraan','Harga','Merek','Warna'],0,'Batas servis sebagai acuan.');
P(17,'Ovalitas hitung','Ovalitas dihitung dengan ...',['Selisih diameter dua arah','Penjumlahan semua diameter','Perkiraan','Warna','Berat'],0,'Selisih dua arah.');
P(18,'Konisitas hitung','Konisitas dihitung dengan ...',['Selisih diameter atas dan bawah','Pembagian ring','Warna','Berat','Perkiraan'],0,'Selisih atas dan bawah.');
P(19,'Pilihan tindakan','Pilihan tindakan dari hasil ukur adalah ...',['Tetap pakai, honing, atau bor-up','Diabaikan','Dicat','Dipukul','Dilas'],0,'Tiga pilihan tindakan.');
P(20,'Bor-up','Bor-up dilakukan jika ...',['Silinder aus melebihi batas dan ukuran memungkinkan','Silinder masih bagus','Oli banyak','Ring baru','Warna blok'],0,'Keausan melebihi batas dan ukuran masih memungkinkan.');
P(21,'Persiapan','Persiapan pengukuran dimulai dengan ...',['Membersihkan silinder dan menyiapkan alat ukur','Memanaskan silinder','Memukul','Mengecat','Mengisi oli'],0,'Persiapan dulu.');
P(22,'Titik bawah','Pengukuran di bagian bawah silinder dilakukan pada ...',['Ketinggian bawah','Bagian atas','Di luar silinder','Kepala silinder','Piston'],0,'Titik bawah.');
P(23,'Gesekan ring','Gesekan ring piston pada dinding dapat menyebabkan ...',['Keausan silinder','Pendinginan lebih baik','Oli bertambah','Tenaga naik','Tidak berpengaruh'],0,'Gesekan menyebabkan aus.');
P(24,'Lubang oli','Lubang oli yang tersumbat dapat ...',['Mengurangi pelumasan dinding silinder','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh','Membuat ring kuat'],0,'Pelumasan terganggu.');
P(25,'Gerakan piston','Gerakan piston yang tidak rata dapat menyebabkan ...',['Keausan konis atau oval','Ring baru','Tenaga naik','Oli lebih awet','Tidak berpengaruh'],0,'Gerakan tidak rata menyebabkan bentuk tidak sesuai.');
P(26,'Kalibrasi alat','Alat ukur harus dikalibrasi agar ...',['Hasil akurat','Lebih cepat','Lebih mahal','Tidak perlu','Lebih berat'],0,'Ketelitian.');
P(27,'Area kerja','Pekerjaan silinder sebaiknya dilakukan di ...',['Meja kerja yang stabil dan bersih','Tanah becek','Dekat api','Lantai miring','Ruang sempit'],0,'Area aman dan bersih.');
P(28,'Tanda honing','Tanda silinder perlu honing adalah ...',['Goresan dan ketidakrataan dinding','Warna cerah','Berat blok','Tidak ada tanda','Lampu terang'],0,'Goresan dan permukaan tidak rata.');
P(29,'Langkah awal','Langkah awal pengukuran adalah ...',['Membaca manual dan menyiapkan alat ukur','Memukul blok','Mengukur kasar','Membuka oli','Menutup silinder'],0,'Persiapan dulu.');
P(30,'Sumber batas','Batas servis berasal dari ...',['Manual servis','Perkiraan','Warna blok','Harga','Pendapat teman'],0,'Manual sebagai acuan.');
P(31,'Oli silinder','Oli pelumas silinder membantu ...',['Mengurangi gesekan','Menambah diameter','Mengecilkan ring','Mengeraskan blok','Tidak berpengaruh'],0,'Pelumas mengurangi gesekan.');
P(32,'Keausan tak rata','Keausan yang tidak rata menandakan ...',['Tirus atau oval','Silinder baru','Ring baru','Tidak ada','Tekanan ban'],0,'Bentuk tidak rata.');
P(33,'Satuan ukur','Hasil ukur dicatat dalam ...',['Satuan mm','Tanpa satuan','Kilogram','Liter','Rpm'],0,'Satuan panjang.');
P(34,'Pengulangan','Pengukuran diulang untuk ...',['Memastikan konsistensi','Menambah waktu','Mengurangi ukuran','Menambah tenaga','Tidak perlu'],0,'Konsistensi hasil.');
P(35,'Silinder aus','Silinder yang aus parah dipertimbangkan untuk ...',['Honing atau bor-up','Dicat saja','Diberi stiker','Dipukul','Dibiarkan'],0,'Tindakan perbaikan.');
P(36,'Uji ring','Ring tidak rapat diperiksa dengan ...',['Pengukuran kompresi dan kondisi silinder','Warna oli','Stiker','Tachometer saja','Termometer'],0,'Kompresi dan kondisi.');
P(37,'Alat diameter dalam','Diameter dalam silinder diukur dengan ...',['Bore gauge atau alat ukur lubang','Penggaris kayu','Feeler gauge','Kunci pas','Obeng'],0,'Alat lubang.');
P(38,'Keputusan','Keputusan tindakan didasarkan pada ...',['Hasil ukur dan batas servis','Perkiraan','Warna','Tanpa data','Kebiasaan'],0,'Data dan batas.');
P(39,'Keberhasilan ukur','Pengukuran dinyatakan baik jika ...',['Data konsisten dan tercatat','Warna blok','Berat blok','Harga alat','Tanpa catatan'],0,'Konsistensi dan pencatatan.');
P(40,'Kesimpulan','Kesimpulan pengukuran didasarkan pada ...',['Pengukuran dan batas servis','Perkiraan','Tidak dicatat','Warna','Kebiasaan'],0,'Berbasis data.');

K(41,'Alat silinder','Pilih alat yang digunakan dalam pengukuran silinder.',['Bore gauge','Mikrometer luar untuk kalibrasi','Buku manual','Feeler gauge','Kain lap'],[0,1,2,4],'Feeler gauge tidak untuk diameter.');
K(42,'Titik ukur','Pilih titik yang diukur pada silinder.',['Diameter atas','Diameter tengah','Diameter bawah','Warna blok','Ovalitas'],[0,1,2,4],'Warna blok bukan titik ukur.');
K(43,'Tanda keausan','Pilih tanda keausan silinder.',['Diameter melebihi batas','Silinder oval','Silinder konis','Warna cat','Goresan vertikal'],[0,1,2,4],'Warna cat bukan tanda keausan.');
K(44,'K3 silinder','Pilih tindakan keselamatan dalam pengukuran silinder.',['Bersihkan silinder sebelum ukur','Jangan menggores dinding dengan alat','Pegang blok dengan hati-hati','Hirup debu honing','Angkat blok berat sendirian'],[0,1,2],'Debu dan angkat sendiri berbahaya.');
K(45,'Yang dihitung','Pilih nilai yang dihitung dari pengukuran.',['Ovalitas','Konisitas','Keausan','Warna blok','Panjang blok'],[0,1,2],'Warna dan panjang tidak dihitung.');
K(46,'Pilihan tindakan','Pilih pilihan tindakan dari hasil ukur.',['Tetap pakai','Honing','Bor-up','Dilas','Dicat'],[0,1,2],'Dilas dan dicat bukan tindakan.');
K(47,'Penyebab aus','Pilih penyebab keausan silinder.',['Gesekan ring piston','Pelumasan kurang','Pemakaian lama','Warna blok','Harga blok'],[0,1,2],'Warna dan harga tidak menyebabkan aus.');
K(48,'Kalibrasi','Pilih pernyataan benar tentang kalibrasi.',['Dilakukan sebelum pengukuran','Menggunakan mikrometer luar atau ring standar','Diabaikan saja','Hasil dicatat','Tanpa alat ukur'],[0,1,3],'Kalibrasi tidak diabaikan.');
K(49,'Gejala silinder','Pilih gejala yang menunjukkan silinder bermasalah.',['Ring tidak rapat','Diameter melebihi batas','Goresan vertikal','Lampu terang','Warna cerah'],[0,1,2],'Lampu dan warna bukan gejala silinder.');
K(50,'Pernyataan benar','Pilih pernyataan yang benar.',['Ovalitas selisih dua arah','Konisitas selisih atas dan bawah','Batas servis dari manual','Alat ukur boleh menggores silinder','Pengukuran boleh tanpa tiga ketinggian'],[0,1,2],'Alat tidak boleh menggores dan pengukuran harus tiga ketinggian.');

C(51,'Ovalitas','Pernyataan berikut tentang ovalitas.',[['Ovalitas adalah selisih diameter dua arah',true],['Ovalitas adalah selisih diameter atas dan bawah',false],['Ovalitas menunjukkan bentuk tidak bulat',true]],'Ovalitas dua arah.');
C(52,'Konisitas','Pernyataan berikut tentang konisitas.',[['Konisitas adalah selisih diameter dua arah',false],['Konisitas adalah selisih diameter atas dan bawah',true],['Konisitas menunjukkan silinder mengecil ke bawah atau atas',true]],'Konisitas atas bawah.');
C(53,'Titik ukur','Pernyataan berikut tentang titik ukur.',[['Pengukuran dilakukan pada tiga ketinggian',true],['Pengukuran cukup pada satu ketinggian',false],['Pengukuran dilakukan dua arah',true]],'Tiga ketinggian.');
C(54,'Alat ukur','Pernyataan berikut tentang alat ukur.',[['Alat ukur boleh menggores dinding silinder',false],['Alat ukur dibersihkan sebelum digunakan',true],['Alat ukur dikalibrasi sebelum pengukuran',true]],'Alat tidak boleh menggores.');
C(55,'Batas servis','Pernyataan berikut tentang batas servis.',[['Batas servis diambil dari manual servis',true],['Batas servis ditentukan dengan perkiraan',false],['Hasil ukur dibandingkan dengan batas servis',true]],'Manual.');
C(56,'Silinder konis','Pernyataan berikut tentang silinder konis.',[['Silinder konis memiliki diameter atas dan bawah berbeda',true],['Silinder konis memiliki diameter sama semua',false],['Konisitas perlu diukur',true]],'Konis.');
C(57,'Kalibrasi','Pernyataan berikut tentang kalibrasi.',[['Tanpa kalibrasi, hasil bore gauge tetap akurat',false],['Kalibrasi dilakukan dengan ukuran standar',true],['Kalibrasi dilakukan sebelum pengukuran',true]],'Kalibrasi wajib.');
C(58,'Ring','Pernyataan berikut tentang ring piston.',[['Ring tidak rapat dapat menurunkan kompresi',true],['Ring tidak rapat selalu menambah kompresi',false],['Ring diperiksa dengan pengukuran kompresi',true]],'Ring.');
C(59,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pengukuran dicatat dalam mm',true],['Hasil pengukuran tidak perlu dicatat',false],['Data pengukuran dibandingkan dengan batas servis',true]],'Pencatatan.');
C(60,'Pembersihan','Pernyataan berikut tentang pembersihan silinder.',[['Silinder dibersihkan sebelum diukur',true],['Silinder boleh diukur tanpa dibersihkan',false],['Kotoran dapat mengacaukan hasil',true]],'Kebersihan.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
