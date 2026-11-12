/* Bank soal TKA per unit LKPD: X-2 Pengukuran dengan Jangka Sorong dan Mikrometer. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='X-2',L=[];
function id(n){return 'lkx2-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){L.push({id:id(n),tipe:'pg',mapel:'LKPD X-2 Jangka Sorong dan Mikrometer',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:'LKPD X-2 Jangka Sorong dan Mikrometer',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:'LKPD X-2 Jangka Sorong dan Mikrometer',topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'X'})}

P(1,'Jenis alat ukur','Alat ukur yang paling tepat untuk mengukur diameter dalam silinder dengan cepat adalah ...',['Jangka sorong','Mikrometer luar','Feeler gauge','Penggaris biasa'],0,'Jangka sorong dapat mengukur diameter dalam.');
P(2,'Ketelitian','Ketelitian mikrometer luar umumnya sampai ...',['0,1 mm','0,01 mm','0,5 mm','1 mm'],1,'Mikrometer luar umumnya teliti sampai 0,01 mm.');
P(3,'Kalibrasi nol','Sebelum mengukur, alat ukur harus ...',['Dibasahi oli','Dikalibrasi nol','Dipanaskan','Dicelupkan air'],1,'Kalibrasi nol memastikan hasil ukur tidak bergeser.');
P(4,'Ratchet','Fungsi ratchet pada mikrometer adalah ...',['Mengunci spindel selamanya','Menjaga tekanan ukur tetap konsisten','Menambah skala ukur','Mempercepat putaran'],1,'Ratchet membatasi gaya agar hasil ukur konsisten.');
P(5,'Paralaks','Mata sebaiknya tegak lurus terhadap skala agar tidak terjadi ...',['Paralaks','Korosi','Muai panas','Kebocoran oli'],0,'Pandangan miring menyebabkan kesalahan paralaks.');
P(6,'Batas servis','Titik ukur dan batas servis komponen mengacu pada ...',['Perkiraan guru','Manual servis unit','Merek alat ukur','Warna komponen'],1,'Batas servis berbeda untuk tiap komponen dan kendaraan.');
P(7,'Keputusan','Hasil ukur melewati batas servis. Tindakan yang tepat adalah ...',['Tetap dipakai','Dicatat dan direkomendasikan penggantian sesuai manual','Diampelas sampai pas','Diabaikan'],1,'Keputusan didasarkan pada data ukur dan manual servis.');
P(8,'Pembersihan','Sebelum diukur, komponen sebaiknya ...',['Dibiarkan berminyak agar licin','Dibersihkan dari oli dan kotoran','Dipanaskan dengan api','Dilapisi cat'],1,'Kotoran mengacaukan pembacaan.');
P(9,'Skala nonius','Pada jangka sorong, hasil dibaca dari ...',['Skala utama saja','Skala utama lalu skala nonius','Skala nonius saja','Warna skala'],1,'Pembacaan dilakukan dari skala utama dan nonius.');
P(10,'Keselamatan alat','Yang tidak boleh dilakukan pada alat ukur adalah ...',['Membersihkan alat setelah dipakai','Menjatuhkan atau membenturkan alat','Menyimpan alat di kotaknya','Memeriksa kondisi rahang'],1,'Benturan dapat merusak ketelitian alat.');
P(11,'Spindel','Spindel mikrometer sebaiknya diputar dengan ...',['Paksa sekuat tenaga','Ratchet','Tang','Palu'],1,'Ratchet menjaga tekanan ukur tetap sama.');
P(12,'Diameter luar','Jangka sorong digunakan untuk mengukur ...',['Diameter luar, diameter dalam, dan kedalaman','Hanya tegangan listrik','Hanya berat komponen','Hanya suhu'],0,'Jangka sorong multiguna untuk dimensi tersebut.');
P(13,'Satuan','Hasil ukur komponen sebaiknya dicatat dengan ...',['Satuan yang benar, misalnya mm','Tanpa satuan','Satuan sembarang','Dalam kilogram'],0,'Satuan wajib dicantumkan agar hasil dapat dibandingkan.');
P(14,'Kalibrasi nol','Jika pembacaan nol tidak tepat, tindakan yang benar adalah ...',['Mengabaikannya','Mencatat penyimpangan atau melaporkannya','Menambah angka pada hasil','Mengganti komponen'],1,'Penyimpangan nol harus dicatat atau dilaporkan.');
P(15,'Paralaks','Kesalahan pembacaan karena pandangan miring disebut ...',['Paralaks','Oksidasi','Kavitasi','Ekspansi'],0,'Paralaks adalah kesalahan pandang.');
P(16,'Alat ukur','Rahang jangka sorong yang aus berpengaruh pada ...',['Warna alat','Ketelitian hasil ukur','Berat alat','Kilau alat'],1,'Rahang aus membuat pengukuran tidak akurat.');
P(17,'Komponen piston','Pengukuran diameter piston dilakukan untuk ...',['Mengetahui keausan dibanding batas servis','Menghitung harga piston','Menentukan warna piston','Mengukur panjang rantai'],0,'Diameter dibandingkan dengan batas servis.');
P(18,'Blok silinder','Pengukuran diameter dalam blok silinder menggunakan ...',['Jangka sorong atau alat ukur lubang sesuai tugas','Penggaris kayu','Feeler gauge saja','Kunci pas'],0,'Diameter dalam diukur dengan alat yang sesuai.');
P(19,'Pengukuran ulang','Pengukuran diulang beberapa kali untuk ...',['Mengurangi kesalahan dan melihat konsistensi hasil','Memperbanyak lembar kerja','Menghabiskan waktu','Menambah ukuran'],0,'Pengulangan memastikan hasil stabil.');
P(20,'Komponen oval','Komponen yang diukur menunjukkan hasil berbeda di beberapa arah. Kemungkinan ...',['Komponen oval atau tirus','Alat ukur terlalu besar','Cahaya kurang','Suhu ruangan'],0,'Bentuk oval atau tirus menghasilkan ukuran berbeda.');
P(21,'Hasil dua alat','Hasil jangka sorong dan mikrometer berselisih jauh. Langkah awal yang tepat adalah ...',['Memilih hasil yang lebih kecil','Memeriksa kalibrasi nol dan cara baca kedua alat','Menghapus data','Menganggap keduanya benar'],1,'Selisih besar menunjukkan kemungkinan kesalahan kalibrasi atau pembacaan.');
P(22,'Kondisi alat','Alat ukur yang layak pakai harus ...',['Bersih, tidak cacat, dan rahang atau spindel mulus','Berkarat sedikit','Patah ujungnya','Tidak ada skala'],0,'Kondisi alat memengaruhi hasil ukur.');
P(23,'Penyimpanan alat','Alat ukur sebaiknya disimpan ...',['Di tempat terbuka dan lembap','Di kotaknya dalam keadaan bersih','Di lantai bengkel','Bercampur dengan baut'],1,'Penyimpanan yang baik menjaga ketelitian.');
P(24,'Manual servis','Batas keausan komponen sebaiknya dibandingkan dengan ...',['Ingatan teknisi','Manual servis','Harga suku cadang','Merek oli'],1,'Manual servis adalah acuan resmi.');
P(25,'Hasil ukur','Hasil ukur jangka sorong biasanya dinyatakan dalam ...',['Milimeter','Liter','Volt','Rpm'],0,'Dimensi komponen diukur dalam satuan panjang.');
P(26,'Kebersihan','Sebelum mengukur blok silinder, permukaan sebaiknya ...',['Dibiarkan kotor','Dibersihkan dan dikeringkan','Dilumuri oli tebal','Dicat'],1,'Kotoran menghalangi pengukuran yang tepat.');
P(27,'Pengukuran kedalaman','Jangka sorong dapat dipakai untuk mengukur ...',['Kedalaman lubang','Kecepatan motor','Arus listrik','Tekanan oli'],0,'Kedalaman termasuk fungsi jangka sorong.');
P(28,'Tekanan ukur','Mengukur dengan tekanan berlebih pada spindel dapat menyebabkan ...',['Hasil ukur lebih akurat','Hasil ukur berbeda dan alat cepat rusak','Alat menjadi lebih kuat','Tidak ada pengaruh'],1,'Tekanan berlebih mengacaukan hasil dan merusak alat.');
P(29,'Titik ukur','Titik ukur yang harus diukur ditentukan oleh ...',['Pemilik motor','Instruksi tugas dan manual servis','Warna komponen','Harga pasar'],1,'Titik ukur mengikuti instruksi dan manual.');
P(30,'Dokumentasi','Hasil ukur yang dicatat harus memuat ...',['Nilai, satuan, dan titik ukur','Nilai saja','Nama merek alat saja','Warna komponen'],0,'Data lengkap diperlukan agar dapat diverifikasi.');
P(31,'Keputusan kelayakan','Komponen dinyatakan layak pakai bila ...',['Ukuran masih dalam batas servis yang ditentukan manual','Tampilannya baru','Ukurannya tidak diketahui','Harga lebih murah'],0,'Kelayakan ditentukan oleh batas servis.');
P(32,'Alat ukur luar','Mikrometer luar cocok untuk mengukur ...',['Dimensi luar komponen yang membutuhkan ketelitian tinggi','Lubang sedalam tangki','Tegangan baterai','Waktu pengerjaan'],0,'Mikrometer luar dirancang untuk dimensi luar.');
P(33,'Pemilihan alat','Pemilihan alat ukur ditentukan oleh ...',['Kebutuhan ketelitian dan jenis dimensi yang diukur','Warna alat','Jumlah teman','Nama bengkel'],0,'Alat dipilih menurut dimensi dan ketelitian.');
P(34,'Pengukuran piston','Titik ukur pada piston umumnya ditentukan agar ...',['Hasil ukur mewakili kondisi keausan yang sebenarnya','Piston lebih ringan','Warna lebih cerah','Harga lebih murah'],0,'Titik ukur yang tepat menggambarkan keausan.');
P(35,'Pengukuran ulang','Selisih antar pengukuran yang besar menunjukkan ...',['Kemungkinan kesalahan cara atau alat ukur','Komponen pasti baik','Alat sudah sempurna','Tidak ada masalah'],0,'Konsistensi pengukuran perlu diperiksa.');
P(36,'Pembacaan skala','Pada mikrometer, pembacaan dimulai dari ...',['Skala selubung (skala utama)','Ratchet','Spindel saja','Skala putar yang dibaca terakhir'],0,'Skala selubung (skala utama) dibaca lebih dulu, lalu skala putar.');
P(37,'Pemeliharaan alat','Alat ukur setelah dipakai sebaiknya ...',['Dibersihkan dan disimpan dengan benar','Dibiarkan kotor','Dicelupkan air','Dilempar ke meja'],0,'Perawatan menjaga akurasi alat.');
P(38,'Komponen tirus','Pengukuran berulang pada beberapa titik dilakukan untuk mengetahui ...',['Keausan tidak merata seperti tirus','Harga komponen','Warna komponen','Berat unit'],0,'Keausan tidak merata menandakan tirus.');
P(39,'Batas servis','Komponen yang sudah melewati batas servis sebaiknya ...',['Tetap digunakan','Direkomendasikan penggantian sesuai manual','Diamplas','Dibiarkan'],1,'Komponen harus diganti bila melewati batas.');
P(40,'Kesimpulan','Dalam lembar kerja, kesimpulan pengukuran harus ...',['Didasarkan pada data ukur dibandingkan batas servis','Berdasarkan perkiraan','Berdasarkan merek alat','Dikosongkan'],0,'Kesimpulan wajib berdasarkan data.');

K(41,'Alat ukur','Pilih alat ukur yang termasuk dalam pekerjaan X-2.',['Jangka sorong','Mikrometer luar','Kunci torsi','Feeler gauge'],[0,1],'Kunci torsi dan feeler gauge bukan alat ukur dimensi pada X-2.');
K(42,'Kalibrasi','Pilih langkah yang dilakukan sebelum mengukur.',['Membersihkan komponen','Kalibrasi nol alat ukur','Menutup rahang atau spindel','Memanaskan alat dengan api'],[0,1,2],'Alat tidak dipanaskan dengan api.');
K(43,'Kondisi alat','Pilih kondisi alat ukur yang layak dipakai.',['Bersih','Tidak cacat','Rahang mulus','Berkarat parah'],[0,1,2],'Karat parah membuat alat tidak layak.');
K(44,'Sumber kesalahan','Pilih sumber kesalahan pengukuran.',['Pembacaan nol yang tidak tepat','Pandangan miring','Komponen kotor','Manual servis tersedia'],[0,1,2],'Adanya manual servis membantu, bukan sumber kesalahan.');
K(45,'Gejala komponen','Pilih gejala yang menunjukkan komponen perlu diperiksa lebih lanjut.',['Hasil ukur berbeda tiap pengulangan','Komponen lebih kecil dari batas servis','Warna komponen cerah','Komponen oval atau tirus'],[0,1,3],'Warna cerah tidak menunjukkan kerusakan.');
K(46,'Hasil ukur','Pilih pernyataan yang benar tentang pencatatan hasil ukur.',['Dicantumkan satuan','Dicantumkan titik ukur','Dicatat sesuai data asli','Diubah agar sesuai harapan'],[0,1,2],'Data tidak boleh diubah.');
K(47,'Jangka sorong','Pilih fungsi jangka sorong.',['Mengukur diameter luar','Mengukur diameter dalam','Mengukur kedalaman','Mengukur tegangan baterai'],[0,1,2],'Jangka sorong tidak mengukur tegangan.');
K(48,'Mikrometer','Pilih pernyataan yang benar tentang mikrometer.',['Ketelitiannya umumnya 0,01 mm','Memakai ratchet untuk tekanan konsisten','Dapat dijatuhkan agar bersih','Harus dikalibrasi nol sebelum dipakai'],[0,1,3],'Alat tidak boleh dijatuhkan.');
K(49,'Batas servis','Pilih sumber acuan yang sah untuk batas servis.',['Manual servis unit','Spesifikasi pabrikan','Perkiraan teknisi tanpa dasar','Data yang tercatat pada manual'],[0,1,3],'Perkiraan tanpa dasar tidak sah sebagai acuan.');
K(50,'Keselamatan','Pilih tindakan keselamatan saat mengukur komponen.',['Membersihkan komponen dari oli','Tidak menjatuhkan alat ukur','Menggunakan ratchet, bukan paksa','Memutar spindel dengan paksa'],[0,1,2],'Memutar spindel dengan paksa dilarang.');

C(51,'Kalibrasi nol','Pernyataan berikut tentang kalibrasi nol.',[['Alat ditutup tanpa benda dan pembacaan harus nol',true],['Hasil ukur boleh dipakai walau pembacaan nol bergeser',false],['Penyimpangan nol perlu dicatat atau dilaporkan',true]],'Penyimpangan nol harus diperhatikan.');
C(52,'Mikrometer','Pernyataan berikut tentang mikrometer.',[['Ketelitian umumnya 0,01 mm',true],['Spindel diputar dengan paksa agar cepat',false],['Ratchet menjaga tekanan ukur tetap konsisten',true]],'Putaran paksa merusak alat.');
C(53,'Paralaks','Pernyataan berikut tentang cara membaca skala.',[['Mata sebaiknya tegak lurus terhadap skala',true],['Pandangan miring tidak menyebabkan kesalahan',false],['Paralaks adalah kesalahan karena pandangan miring',true]],'Pandangan miring memang menyebabkan paralaks.');
C(54,'Batas servis','Pernyataan berikut tentang batas servis.',[['Batas servis mengacu pada manual servis',true],['Batas servis sama untuk semua komponen dan kendaraan',false],['Hasil di atas batas servis harus dicatat dan direkomendasikan',true]],'Batas servis berbeda tiap komponen.');
C(55,'Pembersihan','Pernyataan berikut tentang persiapan pengukuran.',[['Komponen dibersihkan dari oli dan kotoran sebelum diukur',true],['Komponen boleh diukur dalam keadaan berminyak',false],['Rahang alat diperiksa kondisinya sebelum dipakai',true]],'Kotoran dan oli mengganggu hasil.');
C(56,'Hasil ukur','Pernyataan berikut tentang pencatatan hasil.',[['Hasil dicatat dalam mm dengan titik ukur',true],['Hasil boleh dicatat tanpa satuan',false],['Hasil pengukuran ulang dibandingkan untuk melihat selisih',true]],'Satuan wajib dicatat.');
C(57,'Komponen tirus','Pernyataan berikut tentang keausan.',[['Hasil berbeda di beberapa arah dapat menandakan tirus',true],['Keausan tidak merata tidak perlu diperhatikan',false],['Komponen oval dapat diketahui dari pengukuran beberapa arah',true]],'Keausan tidak merata harus diperhatikan.');
C(58,'Keselamatan alat','Pernyataan berikut tentang perawatan alat.',[['Alat dijatuhkan tidak mengurangi ketelitian',false],['Alat disimpan dalam kotak setelah dipakai',true],['Alat yang kotor dibersihkan sebelum disimpan',true]],'Benturan dapat merusak ketelitian.');
C(59,'Kesimpulan','Pernyataan berikut tentang kesimpulan.',[['Kesimpulan didasarkan pada data ukur dan batas servis',true],['Kesimpulan cukup berdasarkan perkiraan',false],['Tindakan rekomendasi mengikuti hasil keputusan dan manual',true]],'Kesimpulan harus berdasarkan data.');
C(60,'Pemilihan alat','Pernyataan berikut tentang pemilihan alat ukur.',[['Alat dipilih sesuai dimensi dan ketelitian yang diperlukan',true],['Mikrometer selalu dipakai untuk mengukur kedalaman lubang',false],['Jangka sorong dapat mengukur diameter luar dan dalam',true]],'Mikrometer luar tidak dirancang untuk kedalaman lubang.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
