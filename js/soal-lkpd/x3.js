/* Bank soal TKA per unit LKPD: X-3 Pemeriksaan dan Penyetelan Rantai Roda Belakang. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='X-3',L=[];
function id(n){return 'lkx3-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){L.push({id:id(n),tipe:'pg',mapel:'LKPD X-3 Rantai Roda Belakang',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:'LKPD X-3 Rantai Roda Belakang',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:'LKPD X-3 Rantai Roda Belakang',topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'X'})}

P(1,'Komponen penggerak','Komponen yang memindahkan tenaga dari sproket depan ke sproket belakang adalah ...',['Rantai','Kopling kering','Kampas rem','Pelampung'],0,'Rantai memindahkan tenaga dari sproket depan ke belakang.');
P(2,'Kekenduran','Nilai kekenduran rantai yang benar ditentukan oleh ...',['Perasaan teknisi','Manual servis','Panjang rantai','Warna rantai'],1,'Nilai kekenduran mengikuti spesifikasi pabrikan.');
P(3,'Kekencangan','Rantai terlalu kencang berisiko ...',['Rantai lebih awet','Membebani bearing dan rantai','Tidak ada efek','Membuat roda lebih cepat'],1,'Beban berlebih mempercepat keausan.');
P(4,'Kekendoran','Rantai yang terlalu kendur dapat menimbulkan ...',['Hentakan atau rantai terlepas','Putaran mesin naik','Ban lebih awet','Kampas rem lebih tebal'],0,'Rantai kendur bisa menghentak dan terlepas.');
P(5,'Kelurusan roda','Tanda penyetel kiri dan kanan harus sama agar ...',['Rantai dan roda sejajar','Roda lebih ringan','Ban cepat aus','Warna rantai sama'],0,'Kesejajaran mencegah rantai dan roda tidak lurus.');
P(6,'Pelumasan','Pelumas rantai yang tepat digunakan untuk ...',['Mengurangi gesekan pada rantai','Membersihkan oli mesin','Menggantikan pelumas rem','Mengisi tangki bensin'],0,'Pelumas rantai menjaga gesekan tetap rendah.');
P(7,'Pelumasan','Pelumasan rantai tidak boleh mengenai ...',['Sisi dalam rantai','Ban atau rem belakang','Sproket','Mata rantai'],1,'Pelumas pada ban atau rem membahayakan pengereman.');
P(8,'Keselamatan','Sebelum roda belakang disentuh, motor harus ...',['Ditopang standar yang stabil','Dibiarkan menyala','Dilepas bannya','Diguyur air'],0,'Topang yang stabil mencegah motor jatuh.');
P(9,'Keselamatan','Saat roda diputar, tangan harus dijauhkan dari ...',['Rantai dan sproket','Setang','Spion','Jok'],0,'Rantai dan sproket dapat menjepit tangan.');
P(10,'Keausan sproket','Sproket yang aus biasanya berbentuk ...',['Runcing','Bulat sempurna','Rata','Berlubang kecil'],0,'Gigi sproket aus menjadi runcing.');
P(11,'Keausan rantai','Pemeriksaan keausan rantai dilakukan dengan memeriksa ...',['Kekakuan mata rantai dan pemanjangan rantai','Warna cat','Suara klakson','Merek ban'],0,'Mata rantai kaku dan rantai memanjang menandakan keausan.');
P(12,'Pengukuran','Pengukuran kekenduran rantai dilakukan pada ...',['Titik dan posisi yang ditentukan manual','Sembarang titik','Hanya saat motor mati','Pada rem'],0,'Pengukuran harus pada titik standar.');
P(13,'Penyetelan','Penyetelan kekenduran rantai dilakukan dengan cara ...',['Memutar penyetel kiri dan kanan sama banyak','Memutar hanya satu sisi','Menarik rantai dengan tangan','Memukul rantai'],0,'Penyetel kiri dan kanan harus sama agar roda lurus.');
P(14,'Mur as','Sebelum menyetel rantai, mur as harus ...',['Dikendurkan','Dipanaskan','Dilas','Dicat'],0,'Mur as dikendurkan agar roda bisa digeser.');
P(15,'Torsi mur as','Mur as dikencangkan dengan ...',['Torsi spesifikasi','Sekuat tenaga','Tanpa kunci','Palu besar'],0,'Torsi spesifikasi menjamin pengencangan yang tepat.');
P(16,'Pengunci mur','Pengunci mur as digunakan bila ...',['Ada dan diperlukan oleh desain unit','Tidak pernah diperlukan','Hanya untuk hiasan','Hanya saat servis mesin'],0,'Pengunci mengikuti desain unit.');
P(17,'Gejala rantai','Rantai berbunyi saat berjalan. Kemungkinan penyebabnya adalah ...',['Pelumasan kurang atau keausan rantai dan sproket','Rem terlalu kuat','Ban terlalu keras','Lampu redup'],0,'Pelumasan dan keausan menjadi penyebab umum.');
P(18,'Gejala rantai','Roda belakang tidak lurus. Penyebab yang perlu diperiksa adalah ...',['Tanda penyetel yang tidak sama','Warna ban','Berat jok','Warna setang'],0,'Penyetel tidak seimbang membuat roda miring.');
P(19,'Gejala rantai','Rantai terlalu kencang menyebabkan ...',['Beban berlebih pada bearing','Rem lebih kuat','Ban lebih awet','Rantai lebih longgar'],0,'Ketegangan berlebih membebani komponen.');
P(20,'Sproket runcing','Sproket berbentuk runcing menandakan ...',['Keausan sproket','Sproket baru','Pelumasan cukup','Rantai pas'],0,'Bentuk runcing adalah tanda keausan.');
P(21,'Pelumasan','Pelumasan yang benar dilakukan pada ...',['Sisi dalam rantai','Permukaan luar roda','Kaliper rem','Dudukan lampu'],0,'Pelumasan pada sisi dalam rantai lebih efektif.');
P(22,'Pelumasan merata','Pelumasan dinyatakan merata bila ...',['Seluruh rantai terlumasi dan tidak mengenai rem','Hanya satu mata rantai','Lumasnya menetes ke ban','Tidak ada pelumas'],0,'Pelumasan merata dan terkontrol.');
P(23,'Uji putar','Setelah penyetelan, uji putar dilakukan untuk ...',['Mengamati suara dan gerakan rantai','Menghidupkan radio','Mengukur tegangan baterai','Mengganti bantalan'],0,'Uji putar memastikan rantai bekerja baik.');
P(24,'Analisis','Setelah pemeriksaan, hasil harus ...',['Dibandingkan dengan spesifikasi lalu disimpulkan','Dibuang','Diabaikan','Dicampur dengan hasil lain'],0,'Hasil dibandingkan dengan spesifikasi.');
P(25,'Tanda penyetel','Tanda penyetel kiri dan kanan digunakan untuk ...',['Memastikan posisi roda sejajar','Menghias rangka','Menandai merek','Menunjukkan bahan bakar'],0,'Tanda penyetel menjaga kesejajaran.');
P(26,'Kelurusan roda','Roda belakang yang tidak lurus dapat menyebabkan ...',['Keausan tidak merata dan rantai bermasalah','Rantai lebih awet','Ban lebih cepat aus, tetapi tidak ada masalah lain','Rem lebih ringan'],0,'Kesejajaran buruk mempercepat keausan.');
P(27,'Persiapan','Persiapan pemeriksaan rantai dimulai dengan ...',['Membaca manual servis dan menyiapkan alat','Melepas roda langsung','Mencuci motor di jalan','Menyalakan mesin'],0,'Pekerjaan dimulai dari persiapan dan identifikasi.');
P(28,'Mata rantai','Mata rantai yang kaku menandakan ...',['Rantai perlu diperiksa lebih lanjut','Rantai sangat baru','Pelumasan berlebihan','Roda sejajar'],0,'Mata rantai kaku adalah tanda keausan.');
P(29,'Karat rantai','Karat pada rantai dapat menyebabkan ...',['Gesekan dan keausan lebih cepat','Rantai lebih ringan','Roda lebih lurus','Tidak ada pengaruh'],0,'Karat mempercepat keausan.');
P(30,'Dasar pemeriksaan','Keputusan penyetelan rantai didasarkan pada ...',['Hasil ukur dan spesifikasi manual','Perkiraan saja','Warna rantai','Harga suku cadang'],0,'Penyetelan berdasarkan data ukur dan manual.');
P(31,'Sproket depan dan belakang','Pemeriksaan sproket harus memeriksa ...',['Sproket depan dan belakang','Hanya sproket depan','Hanya sproket belakang','Spion'],0,'Kedua sproket perlu diperiksa karena saling terkait.');
P(32,'Torsi','Pengencangan mur as dengan torsi berlebih dapat ...',['Merusak bearing atau ulir','Membuat roda lebih lurus','Mengurangi getaran','Tidak ada pengaruh'],0,'Torsi berlebih merusak komponen.');
P(33,'Kekenduran rantai','Kekenduran rantai diukur dengan cara ...',['Menekan rantai naik turun pada titik ukur','Menarik rantai sekuat mungkin','Memotong rantai','Mengukur panjang kabel'],0,'Pengukuran dengan menekan rantai pada titik standar.');
P(34,'Rantai kendur','Rantai kendur yang berhentak sering menandakan ...',['Penyetelan belum sesuai','Rem belakang terlalu kuat','Ban terlalu keras','Lampu mati'],0,'Kekendoran yang tidak sesuai perlu disetel.');
P(35,'Area kerja','Area kerja saat menyetel rantai sebaiknya ...',['Stabil, bersih, dan terang','Licin oleh oli','Penuh serpihan','Miring'],0,'Area kerja yang aman mencegah kecelakaan.');
P(36,'Penggunaan alat','Kunci torsi dipakai untuk ...',['Mengencangkan mur as sesuai torsi','Mengendurkan baut karat','Memukul baut','Mengukur rantai'],0,'Kunci torsi untuk pengencangan terkontrol.');
P(37,'Penutup','Setelah rantai disetel, mur as yang tadi dikendurkan harus ...',['Dikencangkan kembali sesuai torsi','Dibiarkan kendur','Dilas','Dicat'],0,'Mur as harus dikencangkan dengan torsi yang tepat.');
P(38,'Mesin hidup','Pemeriksaan rantai sebaiknya dilakukan dengan mesin ...',['Mati dan standar terpasang','Hidup dalam posisi gigi tinggi','Dibiarkan panas','Ditutup'],0,'Mesin mati lebih aman saat rantai diperiksa.');
P(39,'Rantai baru','Mengganti rantai baru tanpa sproket yang sesuai dapat menyebabkan ...',['Cepat aus dan tidak pas','Lebih awet','Lebih senyap','Tidak ada pengaruh'],0,'Rantai dan sproket harus saling sesuai.');
P(40,'Kesimpulan','Dalam lembar kerja, kesimpulan penyetelan rantai harus ...',['Didasarkan pada hasil ukur dan spesifikasi','Didasarkan pada perkiraan','Dikosongkan','Ditulis tanpa data'],0,'Kesimpulan wajib berdasarkan data.');

K(41,'Komponen rantai','Pilih komponen yang termasuk sistem penggerak rantai.',['Rantai','Sproket depan','Sproket belakang','Kampas rem'],[0,1,2],'Kampas rem bukan penggerak rantai.');
K(42,'Keausan','Pilih tanda keausan rantai dan sproket.',['Mata rantai kaku','Gigi sproket runcing','Rantai berkarat parah','Warna cat sproket'],[0,1,2],'Warna cat bukan tanda keausan.');
K(43,'Kekenduran','Pilih akibat rantai terlalu kencang.',['Membebani bearing','Mempercepat keausan rantai','Mengurangi beban sproket','Menghentikan roda'],[0,1],'Rantai kencang tidak mengurangi beban.');
K(44,'Kekendoran','Pilih akibat rantai terlalu kendur.',['Hentakan saat berjalan','Rantai bisa terlepas','Gerakan rantai menjadi halus','Mengurangi getaran'],[0,1],'Rantai kendur membuat gerakan kasar.');
K(45,'Pelumasan','Pilih tindakan pelumasan yang benar.',['Melumasi sisi dalam rantai','Menghindari ban dan rem','Menjaga pelumas tidak menetes ke ban','Melumasi hingga mengenai rem'],[0,1,2],'Pelumas pada rem berbahaya.');
K(46,'Keselamatan','Pilih tindakan keselamatan saat bekerja dengan rantai dan sproket.',['Menjauhkan tangan saat roda berputar','Menopang motor dengan stabil','Mengenakan sarung tangan','Memasang tangan di antara sproket'],[0,1,2],'Tangan tidak boleh di antara sproket.');
K(47,'Penyetelan','Pilih langkah yang benar dalam penyetelan.',['Mengendurkan mur as','Memutar penyetel kiri dan kanan sama banyak','Mengencangkan mur as dengan torsi','Memutar penyetel hanya satu sisi'],[0,1,2],'Penyetelan satu sisi membuat roda miring.');
K(48,'Gejala','Pilih gejala yang menunjukkan roda belakang tidak lurus atau rantai bermasalah.',['Rantai berbunyi saat berjalan','Roda belakang tidak lurus','Rantai terlalu kencang','Lampu sein berkedip'],[0,1,2],'Lampu sein tidak berkaitan dengan rantai.');
K(49,'Pengukuran','Pilih hal yang harus dicatat saat pengukuran kekenduran.',['Hasil ukur dalam mm','Titik ukur','Posisi kiri dan kanan penyetel','Warna motor'],[0,1,2],'Warna motor tidak perlu dicatat.');
K(50,'Dasar keputusan','Pilih sumber acuan dalam penyetelan rantai.',['Manual servis','Hasil ukur','Spesifikasi pabrikan','Perkiraan tanpa data'],[0,1,2],'Perkiraan tanpa data bukan acuan.');

C(51,'Keausan rantai','Pernyataan berikut tentang rantai dan sproket.',[['Keausan rantai dan sproket harus dinilai bersama',true],['Sproket runcing tidak menandakan keausan',false],['Mata rantai kaku dapat menandakan keausan',true]],'Sproket runcing adalah tanda keausan.');
C(52,'Kekenduran','Pernyataan berikut tentang kekenduran.',[['Nilai kekenduran mengikuti manual servis',true],['Kekenduran boleh ditentukan dengan perasaan saja',false],['Pengukuran dilakukan pada titik standar',true]],'Pengukuran harus berdasarkan spesifikasi.');
C(53,'Kelurusan roda','Pernyataan berikut tentang kelurusan roda.',[['Tanda penyetel kiri dan kanan harus sama',true],['Kelurusan tidak memengaruhi rantai',false],['Roda yang lurus memperlancar kerja rantai',true]],'Kelurusan memengaruhi kerja rantai.');
C(54,'Pelumasan','Pernyataan berikut tentang pelumasan.',[['Pelumas rantai mengurangi gesekan',true],['Pelumas boleh mengenai ban dan rem',false],['Pelumasan dilakukan pada sisi dalam rantai',true]],'Pelumas pada rem berbahaya.');
C(55,'Keselamatan','Pernyataan berikut tentang keselamatan.',[['Motor harus ditopang standar yang stabil',true],['Tangan boleh berada dekat rantai saat roda berputar',false],['Pemeriksaan rantai dilakukan dengan mesin mati',true]],'Tangan harus dijauhkan dari rantai.');
C(56,'Torsi','Pernyataan berikut tentang torsi mur as.',[['Mur as dikencangkan dengan torsi spesifikasi',true],['Torsi berlebih tidak merusak bearing',false],['Pengunci mur dipasang bila desain unit memerlukan',true]],'Torsi berlebih merusak bearing.');
C(57,'Gejala','Pernyataan berikut tentang gejala rantai.',[['Rantai berbunyi bisa berasal dari pelumasan kurang',true],['Rantai kendur dapat menghentak',true],['Rantai kencang selalu membuat rantai lebih awet',false]],'Rantai kencang justru mempercepat keausan.');
C(58,'Pengukuran','Pernyataan berikut tentang pengukuran.',[['Pengukuran dilakukan pada titik dan posisi sesuai manual',true],['Pengukuran boleh sembarang titik',false],['Hasil dinyatakan dalam mm',true]],'Titik ukur harus standar.');
C(59,'Penyelesaian','Pernyataan berikut tentang penyelesaian pekerjaan.',[['Mur as dikencangkan kembali setelah penyetelan',true],['Pengukuran ulang tidak diperlukan setelah penyetelan',false],['Hasil dibandingkan dengan spesifikasi sebelum disimpulkan',true]],'Hasil akhir perlu diverifikasi.');
C(60,'Analisis','Pernyataan berikut tentang analisis.',[['Analisis dilakukan dengan membandingkan hasil dengan spesifikasi',true],['Area kerja dibiarkan kotor sebagai bagian kerja',false],['Serpihan dibersihkan setelah pekerjaan',true]],'Area kerja harus rapi.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
