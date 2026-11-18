/* Bank soal TKA per unit LKPD: XII-6 Perbaikan Sistem Pengapian. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-6',M='LKPD XII-6 Perbaikan Sistem Pengapian',L=[];
function id(n){return 'lkxii6-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Sistem pengapian','Sistem pengapian mengubah ...',['Tegangan baterai atau magnet menjadi tegangan tinggi','Tegangan rendah saja','Air menjadi uap','Bensin menjadi oli','Udara menjadi air'],0,'Pengapian menghasilkan tegangan tinggi.');
P(2,'Koil pengapian','Koil pengapian memiliki ...',['Resistansi primer dan sekunder','Kipas pendingin','Pelampung','Spuyer','Jok'],0,'Koil punya dua belitan.');
P(3,'Ukur resistansi','Resistansi koil diukur pada posisi ...',['Ohm','DC Volt tinggi','AC Ampere','Continuity suara','Frekuensi'],0,'Ohm untuk resistansi.');
P(4,'Rangkaian ukur','Saat mengukur resistansi, rangkaian harus ...',['Tidak bertegangan','Bertegangan','Terhubung listrik','Dalam keadaan hidup','Dipanaskan'],0,'Ukur resistansi tanpa tegangan.');
P(5,'Terminal tegangan tinggi','Jangan sentuh terminal tegangan tinggi saat ...',['Mesin hidup atau distarter','Mesin mati','Kunci OFF','Mesin dingin','Konektor dilepas'],0,'Tegangan tinggi berbahaya.');
P(6,'Kunci kontak','Matikan kunci kontak sebelum ...',['Melepas atau memasang konektor','Membaca manual','Mengukur busi','Memeriksa oli','Membersihkan'],0,'Mencegah kerusakan.');
P(7,'Sarung tangan','Sarung tangan isolasi dipakai saat ...',['Menguji percikan bila diperlukan','Mengetik','Memasak','Membaca','Tidur'],0,'Perlindungan saat uji percikan.');
P(8,'Busi','Busi diperiksa kondisi dan ...',['Celahnya','Warna cat','Harganya','Mereknya','Beratnya'],0,'Kondisi dan celah.');
P(9,'Kabel busi','Kabel busi diperiksa dari ...',['Isolasi dan resistansi','Warna','Harga','Merek','Panjang setang'],0,'Isolasi dan resistansi.');
P(10,'Pulser','Pulser menghasilkan ...',['Sinyal untuk ECU atau CDI','Oli','Bensin','Air','Udara'],0,'Sinyal pengapian.');
P(11,'Koil pengisi','Koil pengisi diukur dengan ...',['Ohm atau tegangan','Tekanan','Warna','Suhu','Berat'],0,'Ohm atau tegangan.');
P(12,'Saat pengapian','Saat pengapian diperiksa dengan ...',['Timing light sesuai spesifikasi','Tachometer saja','Termometer','Jangka sorong','Multimeter saja'],0,'Timing light.');
P(13,'Percikan lemah','Percikan lemah dapat disebabkan ...',['Koil atau busi bermasalah','Ban penuh','Setang bengkok','Spion longgar','Lampu sein'],0,'Koil dan busi.');
P(14,'Brebet','Mesin brebet dapat disebabkan ...',['Pengapian tidak stabil','Ban kempes','Rem depan','Warna body','Spion'],0,'Pengapian tidak stabil.');
P(15,'Mati mendadak','Mesin mati mendadak dapat disebabkan ...',['Sinyal pengapian hilang','Oli baru','Ban aman','Lampu terang','Warna body'],0,'Sinyal hilang.');
P(16,'Saat tidak sesuai','Saat pengapian yang tidak sesuai ...',['Perlu disetel sesuai spesifikasi','Dibiarkan','Diabaikan','Diganti tanpa cek','Dipukul'],0,'Disetel sesuai spesifikasi.');
P(17,'CDI atau ECU','Sistem CDI atau ECU berfungsi untuk ...',['Mengatur waktu pengapian','Mengatur rem','Mengatur ban','Mengatur oli','Mengatur spion'],0,'Pengatur waktu pengapian.');
P(18,'Pemasangan busi','Busi dipasang dengan ...',['Torsi sesuai spesifikasi','Sekuat tenaga','Palu','Tanpa kunci','Lem'],0,'Torsi sesuai.');
P(19,'Tutup busi','Tutup busi diperiksa ...',['Isolasi dan kondisi sambungan','Warnanya','Mereknya','Harganya','Beratnya'],0,'Isolasi dan sambungan.');
P(20,'Pengukuran koil','Pengukuran koil dilakukan dengan ...',['Membandingkan spesifikasi','Perkiraan','Warna','Tanpa alat','Iklan'],0,'Spesifikasi.');
P(21,'Bahaya tegangan','Mengapa tegangan tinggi berbahaya?',['Dapat menyebabkan sengatan','Membuat lampu terang','Menambah tenaga','Mengurangi getaran','Tidak berbahaya'],0,'Sengatan.');
P(22,'Langkah awal','Langkah awal perbaikan pengapian adalah ...',['Membaca manual dan wiring diagram','Membuka busi','Mengukur koil dulu','Menyalakan motor','Melepas kabel'],0,'Manual dulu.');
P(23,'Pengaruh pengapian','Pengapian memengaruhi ...',['Penyalaan campuran','Warna body','Berat motor','Ukuran ban','Lampu sein'],0,'Penyalaan campuran.');
P(24,'Timing light','Timing light digunakan untuk ...',['Memeriksa saat pengapian','Mengukur tekanan ban','Mengukur oli','Mengukur bensin','Menyetel rem'],0,'Saat pengapian.');
P(25,'Pulser dan koil','Pulser dan koil pengisi termasuk ...',['Komponen sistem pengapian','Komponen rem','Komponen kemudi','Komponen oli','Komponen bodi'],0,'Sistem pengapian.');
P(26,'CDI','Sistem CDI menggunakan ...',['Sinyal dan pengatur waktu','Pelampung','Diafragma','Jarum skep','Spuyer'],0,'Sinyal dan waktu.');
P(27,'Koil primer','Koil primer diukur dalam ...',['Ohm','Volt tinggi saja','Ampere saja','Liter','Rpm'],0,'Ohm.');
P(28,'Koil sekunder','Koil sekunder diukur dalam ...',['Ohm','Volt','Ampere','Rpm','Liter'],0,'Ohm.');
P(29,'Tanpa percikan','Mesin tidak hidup tanpa percikan dapat disebabkan ...',['Sumber pengapian bermasalah','Lampu sein','Spion','Setang','Ban'],0,'Sumber pengapian.');
P(30,'Penggantian busi','Penggantian busi dilakukan ...',['Sesuai jadwal dan kondisi','Setiap hari','Tidak pernah','Saat rusak saja','Secara acak'],0,'Jadwal dan kondisi.');
P(31,'Pengapian baik','Pengapian yang baik ditandai dengan ...',['Percikan kuat dan saat tepat','Percikan lemah','Saat tidak tepat','Tidak ada percikan','Tidak penting'],0,'Percikan kuat dan tepat.');
P(32,'Pengubah tegangan','Tegangan rendah diubah menjadi tegangan tinggi oleh ...',['Koil','Busi','Pelampung','Diafragma','Setang'],0,'Koil.');
P(33,'Ukur ohm','Komponen yang diukur dengan ohm antara lain ...',['Koil','Pulser','Koil pengisi','Kabel busi','Semua di atas'],4,'Semua dapat diukur resistansinya.');
P(34,'Tutup busi','Tutup busi penting untuk ...',['Mencegah kebocoran tegangan tinggi','Menambah bunyi','Mengurangi tenaga','Membuat busi dingin','Tidak penting'],0,'Isolasi.');
P(35,'Pengapian bergantung','Pengapian bergantung pada ...',['Sinyal dan koil','Oli','Ban','Rem','Setang'],0,'Sinyal dan koil.');
P(36,'Pengukuran pulser','Pulser diukur dengan ...',['Ohm atau sinyal','Warna','Berat','Ukuran','Merek'],0,'Ohm atau sinyal.');
P(37,'Pencatatan ukur','Hasil pengukuran dicatat ...',['Dengan nilai dan satuan','Tanpa nilai','Tanpa satuan','Dihapus','Diabaikan'],0,'Nilai dan satuan.');
P(38,'Area kerja','Area kerja pengapian sebaiknya ...',['Kering dan terang','Basah','Licin','Gelap','Panas'],0,'Kering dan terang.');
P(39,'Keberhasilan','Perbaikan dinyatakan berhasil jika ...',['Percikan dan pengapian sesuai spesifikasi','Warna cerah','Berat ringan','Harga murah','Tanpa uji'],0,'Sesuai spesifikasi.');
P(40,'Kesimpulan','Kesimpulan perbaikan didasarkan pada ...',['Pengukuran dan spesifikasi','Perkiraan','Tidak dicatat','Warna','Kebiasaan'],0,'Berbasis data.');

K(41,'Komponen pengapian','Pilih komponen sistem pengapian.',['Busi','Koil pengapian','Pulser','Pelampung','CDI atau ECU'],[0,1,2,4],'Pelampung bukan komponen pengapian.');
K(42,'Pemeriksaan koil','Pilih pemeriksaan koil.',['Resistansi primer','Resistansi sekunder','Kondisi isolasi','Warna body','Berat koil'],[0,1,2],'Warna body dan berat bukan pemeriksaan.');
K(43,'K3 pengapian','Pilih tindakan keselamatan pada pengapian.',['Jangan sentuh terminal tegangan tinggi saat hidup','Matikan kunci sebelum melepas konektor','Gunakan sarung tangan isolasi bila perlu','Hirup gas busi','Jumper komponen tanpa prosedur'],[0,1,2],'Hirup gas dan jumper dilarang.');
K(44,'Gejala pengapian','Pilih gejala pengapian bermasalah.',['Mesin tidak hidup tanpa percikan','Percikan lemah','Mesin brebet','Warna cat pudar','Mesin mati mendadak'],[0,1,2,4],'Warna cat tidak berkaitan.');
K(45,'Pemeriksaan busi','Pilih yang diperiksa pada busi dan komponennya.',['Kondisi busi','Celah busi','Kabel busi','Warna body','Tutup busi'],[0,1,2,4],'Warna body bukan pemeriksaan.');
K(46,'Pernyataan benar','Pilih pernyataan yang benar.',['Ohm dipakai untuk resistansi','Rangkaian tidak bertegangan saat ukur resistansi','Timing light untuk memeriksa saat pengapian','Terminal tegangan tinggi boleh disentuh saat hidup','Konektor boleh dilepas saat kunci ON'],[0,1,2],'Terminal dan konektor tidak boleh.');
K(47,'Percikan lemah','Pilih penyebab percikan lemah.',['Koil bermasalah','Busi bermasalah','Kabel bermasalah','Ban penuh','Lampu terang'],[0,1,2],'Ban dan lampu tidak berkaitan.');
K(48,'Pulser','Pilih fungsi pulser.',['Dibaca ECU atau CDI','Menentukan waktu pengapian','Berguna untuk sinkronisasi','Mengatur rem','Mengatur bahan bakar'],[0,1,2],'Rem dan bahan bakar bukan fungsi pulser.');
K(49,'Pengukuran','Pilih syarat pengukuran yang benar.',['Dengan alat yang sesuai','Dengan spesifikasi acuan','Hasilnya dicatat','Dengan perkiraan','Tanpa alat'],[0,1,2],'Perkiraan dan tanpa alat tidak benar.');
K(50,'Langkah pengapian','Pilih langkah yang benar dalam perbaikan pengapian.',['Baca manual','Siapkan alat','Ukur koil','Hidupkan mesin tanpa cek','Lepas kabel tanpa catatan'],[0,1,2],'Hidupkan tanpa cek dan lepas tanpa catatan salah.');

C(51,'Resistansi','Pernyataan berikut tentang resistansi koil.',[['Resistansi koil diukur dengan ohm',true],['Resistansi koil diukur dengan DC Volt tinggi',false],['Rangkaian tidak bertegangan saat diukur',true]],'Ohm.');
C(52,'Pengukuran','Pernyataan berikut tentang pengukuran resistansi.',[['Saat mengukur resistansi, rangkaian harus bertegangan',false],['Saat mengukur resistansi, rangkaian tidak bertegangan',true],['Ohm dipakai untuk resistansi',true]],'Tanpa tegangan.');
C(53,'Konektor','Pernyataan berikut tentang konektor.',[['Kunci kontak dimatikan sebelum melepas konektor',true],['Konektor boleh dilepas saat kunci ON',false],['Konektor kotor dibersihkan',true]],'Kunci OFF.');
C(54,'Terminal','Pernyataan berikut tentang terminal tegangan tinggi.',[['Terminal tegangan tinggi boleh disentuh saat mesin hidup',false],['Terminal tegangan tinggi tidak boleh disentuh saat mesin hidup',true],['Terminal dijauhkan saat mesin distarter',true]],'Keselamatan.');
C(55,'Timing light','Pernyataan berikut tentang timing light.',[['Timing light digunakan untuk memeriksa saat pengapian',true],['Timing light untuk mengukur tekanan ban',false],['Hasil dibandingkan dengan spesifikasi',true]],'Timing light.');
C(56,'Pulser','Pernyataan berikut tentang pulser.',[['Pulser berfungsi memberi sinyal',true],['Pulser mengatur tekanan ban',false],['Pulser dibaca ECU atau CDI',true]],'Pulser.');
C(57,'Busi','Pernyataan berikut tentang busi.',[['Busi diperiksa kondisi dan celahnya',true],['Busi tidak perlu diperiksa',false],['Busi dipasang dengan torsi',true]],'Busi.');
C(58,'Tutup busi','Pernyataan berikut tentang tutup busi.',[['Tutup busi tidak perlu diperiksa',false],['Tutup busi diperiksa isolasinya',true],['Tutup busi mencegah kebocoran tegangan tinggi',true]],'Tutup busi.');
C(59,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pengukuran dicatat dengan satuan',true],['Hasil pengukuran tidak perlu dicatat',false],['Nilai dibandingkan dengan spesifikasi',true]],'Satuan.');
C(60,'Keselamatan','Pernyataan berikut tentang keselamatan.',[['Terminal tegangan tinggi tidak boleh disentuh saat mesin hidup',true],['Sarung tangan isolasi tidak pernah diperlukan',false],['Area kerja dibuat kering dan terang',true]],'Keselamatan.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
