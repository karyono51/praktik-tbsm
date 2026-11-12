/* Bank soal TKA per unit LKPD: X-5 Membaca dan Memahami Gambar Teknik. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='X-5',L=[];
function id(n){return 'lkx5-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){L.push({id:id(n),tipe:'pg',mapel:'LKPD X-5 Gambar Teknik',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:'LKPD X-5 Gambar Teknik',topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'X'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:'LKPD X-5 Gambar Teknik',topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'X'})}

P(1,'Jenis garis','Garis putus-putus pada gambar teknik menunjukkan ...',['Garis tepi','Bagian tersembunyi','Garis sumbu','Garis ukuran'],1,'Garis putus menggambarkan bagian yang tidak terlihat.');
P(2,'Jenis garis','Garis tebal pada gambar teknik umumnya digunakan untuk ...',['Garis tepi yang terlihat','Garis sumbu','Garis bantu','Garis tersembunyi'],0,'Garis tebal menggambarkan tepi yang terlihat.');
P(3,'Jenis garis','Garis bergantian titik dan strip pada gambar biasanya menunjukkan ...',['Sumbu atau lintasan','Tepi benda','Bagian tersembunyi','Ukuran'],0,'Garis sumbu berbentuk bergantian titik dan strip.');
P(4,'Skala','Skala 1 : 2 berarti ...',['Gambar dua kali ukuran asli','Gambar setengah ukuran asli','Gambar sama dengan asli','Gambar seperempat ukuran asli'],1,'Satu satuan gambar mewakili dua satuan benda.');
P(5,'Skala','Skala 2 : 1 berarti ...',['Gambar setengah ukuran asli','Gambar dua kali ukuran asli','Gambar sama dengan asli','Gambar tidak terukur'],1,'Gambar dua kali lebih besar dari benda.');
P(6,'Proyeksi','Tampak depan, atas, dan samping menggambarkan ...',['Benda tiga dimensi pada bidang datar','Warna benda','Berat benda','Harga benda'],0,'Proyeksi ortografik menggambarkan benda dalam bidang datar.');
P(7,'Tampak','Untuk menggambarkan tinggi suatu komponen, tampak yang paling tepat adalah ...',['Tampak depan atau samping','Tampak atas saja','Tampak bawah saja','Tidak ada tampak yang tepat'],0,'Tinggi dapat terlihat pada tampak depan atau samping.');
P(8,'Bagian tersembunyi','Bagian tersembunyi yang digambarkan dengan garis putus harus ...',['Dicocokkan dengan tampak lain','Dihapus dari gambar','Dianggap tidak ada','Dicetak tebal'],0,'Bagian tersembunyi dicocokkan dengan tampak lain.');
P(9,'Ukuran nominal','Ukuran nominal pada gambar adalah ...',['Ukuran yang diinginkan sebelum toleransi','Batas minimal saja','Batas maksimal saja','Harga komponen'],0,'Ukuran nominal adalah dimensi acuan.');
P(10,'Toleransi','Toleransi menunjukkan ...',['Harga komponen','Batas penyimpangan yang diizinkan','Warna komponen','Berat komponen'],1,'Toleransi adalah batas penyimpangan yang boleh.');
P(11,'Toleransi','Komponen yang berada di luar toleransi ...',['Tidak layak','Selalu layak','Harus dicat','Dibiarkan'],0,'Di luar toleransi komponen tidak memenuhi syarat.');
P(12,'Tanda kekasaran','Tanda kekasaran permukaan pada gambar menunjukkan ...',['Tingkat kehalusan permukaan yang diminta','Warna komponen','Jumlah komponen','Berat komponen'],0,'Tanda kekasaran menunjukkan kehalusan permukaan.');
P(13,'Judul gambar','Pertama kali yang perlu dibaca dari sebuah gambar adalah ...',['Judul, skala, satuan, dan keterangan','Ukuran terkecil','Simbol kelistrikan','Warna garis'],0,'Informasi awal ada di judul dan keterangan.');
P(14,'Simbol listrik','Simbol kelistrikan pada diagram digunakan untuk ...',['Menunjukkan komponen dan fungsinya','Menghias gambar','Menghitung harga','Menulis nama pembuat'],0,'Simbol menunjukkan komponen listrik.');
P(15,'Kode warna','Kode warna kabel pada diagram menunjukkan ...',['Jalur atau fungsi kabel sesuai legenda','Merek kabel','Panjang kabel','Harga kabel'],0,'Kode warna mengikuti legenda diagram.');
P(16,'Jalur daya','Pada diagram kelistrikan, jalur dari baterai ke beban ditelusuri untuk ...',['Memahami urutan aliran arus','Menghitung berat','Mengukur oli','Mengecat'],0,'Penelusuran jalur membantu diagnosis.');
P(17,'Skala gambar','Jika skala gambar 1 : 2 dan panjang gambar 6 cm, panjang benda sebenarnya adalah ...',['3 cm','12 cm','6 cm','4 cm'],1,'6 × 2 = 12 cm.');
P(18,'Skala gambar','Jika skala gambar 2 : 1 dan panjang gambar 8 cm, panjang benda sebenarnya adalah ...',['16 cm','4 cm','8 cm','10 cm'],1,'Benda setengah dari gambar: 8 ÷ 2 = 4 cm.');
P(19,'Bagian tersembunyi','Pada tampak samping, lubang yang tidak terlihat sebaiknya digambar dengan ...',['Garis putus','Garis tebal','Garis sumbu','Tidak digambar'],0,'Bagian tersembunyi digambar dengan garis putus.');
P(20,'Ukuran','Ukuran pada gambar sebaiknya dibaca ...',['Sesuai satuan dan keterangan pada gambar','Dengan perkiraan kasar','Dengan melihat warna','Tanpa melihat satuan'],0,'Satuan dan keterangan menentukan arti ukuran.');
P(21,'Proyeksi','Tampak atas menggambarkan ...',['Bentuk benda dilihat dari atas','Bagian dalam mesin','Tegangan listrik','Suhu komponen'],0,'Tampak atas memperlihatkan bentuk dari atas.');
P(22,'Perbandingan gambar','Mencocokkan gambar dengan komponen asli dilakukan untuk ...',['Memastikan kesesuaian ukuran dan bentuk','Menambah ukuran gambar','Menghapus bagian gambar','Mengganti warna'],0,'Pencocokan memastikan kesesuaian.');
P(23,'Simbol','Simbol yang tidak dikenal pada gambar sebaiknya ...',['Ditebak saja','Dicari artinya di legenda atau panduan','Dihapus','Diabaikan'],1,'Simbol harus dipahami dari legenda.');
P(24,'Gambar kelistrikan','Saat membaca diagram kelistrikan, komponen harus disambung ...',['Hanya berdasarkan gambar tanpa mematikan tegangan','Setelah tegangan dimatikan dan diperiksa','Dengan kabel sembarang','Dengan jumper'],1,'Tegangan harus dimatikan sebelum menyambung.');
P(25,'Kualitas gambar','Gambar yang sobek atau terkena oli sebaiknya ...',['Digunakan tetap','Disimpan dengan baik agar tetap terbaca','Dibuang','Dicoret'],1,'Gambar harus tetap bersih dan terbaca.');
P(26,'Ukuran dan skala','Hubungan antara gambar dan benda sebenarnya ditentukan oleh ...',['Skala','Warna garis','Jumlah lembar','Nama pembuat'],0,'Skala menghubungkan ukuran gambar dan benda.');
P(27,'Garis sumbu','Garis sumbu pada gambar berfungsi untuk ...',['Menunjukkan pusat atau sumbu simetri','Menunjukkan bagian tersembunyi','Menunjukkan tegangan','Menunjukkan harga'],0,'Garis sumbu menandai pusat dan simetri.');
P(28,'Pengamatan','Saat membaca gambar, pembaca sebaiknya ...',['Mencatat jenis garis dan simbol yang ada','Mengabaikan keterangan','Menebak ukuran','Melewati tampak'],0,'Pencatatan membantu pemahaman.');
P(29,'Tampak lengkap','Gambar yang lengkap biasanya terdiri dari ...',['Beberapa tampak dan ukuran','Satu garis saja','Foto saja','Tulisan tanpa gambar'],0,'Gambar teknik menggunakan beberapa tampak.');
P(30,'Ketelitian','Ukuran yang paling teliti dibaca dari ...',['Dimensi yang diberi toleransi dan satuan jelas','Perkiraan mata','Warna komponen','Bentuk jok'],0,'Ukuran dengan toleransi dibaca dengan teliti.');
P(31,'Ketidaksesuaian','Jika ukuran gambar dan komponen asli berbeda, tindakan yang benar adalah ...',['Mencatat dan memeriksa lebih lanjut','Mengganti gambar tanpa dicek','Mengabaikan perbedaan','Mengubah komponen tanpa alasan'],0,'Perbedaan harus diselidiki.');
P(32,'Simbol kabel','Kabel dengan kode warna tertentu harus dipasang sesuai ...',['Diagram kelistrikan','Selera teknisi','Warna body motor','Kebiasaan lama'],0,'Pemasangan mengikuti diagram.');
P(33,'Garis tepi','Garis tepi benda pada gambar umumnya digambar dengan ...',['Garis tebal','Garis putus','Garis sumbu','Titik-titik'],0,'Garis tepi digambar tebal agar terlihat jelas.');
P(34,'Bagian tersembunyi','Bagian tersembunyi tidak digambar dengan garis tebal karena ...',['Tidak terlihat dari arah pandang','Tidak penting','Tidak ada ukurannya','Harus dihapus'],0,'Bagian tersembunyi dibedakan dengan garis putus.');
P(35,'Pengecekan skala','Untuk memeriksa skala, pembaca dapat ...',['Mengukur komponen asli dan membandingkan dengan gambar','Menebak angkanya','Mengabaikan skala','Mengganti skala'],0,'Pengukuran langsung membuktikan skala.');
P(36,'Kelengkapan gambar','Gambar yang tidak memuat satuan ...',['Sulit ditafsirkan dengan benar','Lebih jelas','Lebih mudah dibaca','Tidak berpengaruh'],0,'Satuan wajib agar ukuran dapat dibaca benar.');
P(37,'Tampak samping','Tampak samping biasanya digunakan untuk melihat ...',['Ketinggian dan kedalaman','Warna','Harga','Berat'],0,'Tampak samping memperlihatkan dimensi tinggi dan lebar.');
P(38,'Diagram','Diagram kelistrikan menggambarkan ...',['Hubungan dan jalur antar komponen listrik','Bentuk fisik bodi motor','Harga komponen','Warna cat'],0,'Diagram menggambarkan hubungan dan jalur.');
P(39,'Pemahaman','Gambar teknik dipahami dengan ...',['Membaca garis, simbol, skala, dan ukuran secara berurutan','Hanya melihat sekilas','Mengabaikan keterangan','Menebak bentuk'],0,'Pembacaan berurutan mencegah kesalahan.');
P(40,'Kesimpulan','Kesimpulan membaca gambar sebaiknya ...',['Didasarkan pada hasil pembacaan dan pencocokan','Didasarkan pada perkiraan','Tidak dicatat','Berdasarkan warna gambar'],0,'Kesimpulan harus didasarkan pada data.');

K(41,'Jenis garis','Pilih jenis garis yang dipakai pada gambar teknik.',['Garis tebal','Garis putus','Garis sumbu','Garis warna merah'],[0,1,2],'Warna merah bukan jenis garis.');
K(42,'Skala','Pilih pernyataan yang benar tentang skala.',['Skala 1 : 2 berarti gambar setengah ukuran asli','Skala 2 : 1 berarti gambar dua kali ukuran asli','Skala 1 : 1 berarti gambar sama dengan asli','Skala tidak perlu dibaca'],[0,1,2],'Skala harus dibaca.');
K(43,'Proyeksi','Pilih tampak yang umum digunakan pada gambar komponen.',['Tampak depan','Tampak atas','Tampak samping','Tampak aroma'],[0,1,2],'Tampak aroma tidak dikenal.');
K(44,'Toleransi','Pilih pernyataan yang benar tentang toleransi.',['Toleransi adalah batas penyimpangan yang boleh','Komponen di luar toleransi tidak layak','Toleransi dicantumkan dengan ukuran nominal','Toleransi selalu sama untuk semua komponen'],[0,1,2],'Toleransi berbeda tiap komponen.');
K(45,'Kelistrikan','Pilih simbol atau elemen yang umum pada diagram kelistrikan.',['Simbol baterai','Simbol sekring','Kode warna kabel','Denah ruang tamu'],[0,1,2],'Denah ruang tamu bukan diagram listrik.');
K(46,'Bagian tersembunyi','Pilih cara menggambarkan bagian tersembunyi.',['Dengan garis putus','Dicocokkan dengan tampak lain','Dihapus dari gambar','Diberi keterangan'],[0,1,3],'Dihapus dari gambar menghilangkan informasi.');
K(47,'Ukuran','Pilih informasi yang tercantum dalam ukuran gambar.',['Ukuran nominal','Batas toleransi','Satuan','Warna pembuat gambar'],[0,1,2],'Warna pembuat tidak termasuk ukuran.');
K(48,'Pencocokan','Pilih langkah yang dilakukan saat mencocokkan gambar dengan komponen.',['Mengukur komponen asli','Membandingkan bentuk dengan tampak','Memeriksa toleransi','Menghapus gambar'],[0,1,2],'Gambar tidak dihapus saat pencocokan.');
K(49,'Kode warna','Pilih pernyataan tentang kode warna kabel.',['Kode warna mengikuti legenda diagram','Kode warna membantu menelusuri jalur','Kode warna harus dicocokkan dengan kabel asli','Kode warna boleh diabaikan'],[0,1,2],'Kode warna tidak boleh diabaikan.');
K(50,'Keselamatan gambar','Pilih tindakan yang benar saat menggunakan gambar kelistrikan.',['Mematikan tegangan sebelum menyambung','Menyimpan gambar agar tidak terkena oli','Menyambung komponen hanya dari gambar','Menggunakan alat ukur dengan hati-hati'],[0,1,3],'Menyambung hanya dari gambar tanpa mematikan tegangan berbahaya.');

C(51,'Jenis garis','Pernyataan berikut tentang jenis garis.',[['Garis putus digunakan untuk bagian tersembunyi',true],['Garis tebal digunakan untuk bagian tersembunyi',false],['Garis sumbu berbentuk titik dan strip',true]],'Garis tebal untuk tepi yang terlihat.');
C(52,'Skala','Pernyataan berikut tentang skala.',[['Skala 1 : 2 berarti gambar setengah ukuran asli',true],['Skala 2 : 1 berarti gambar setengah ukuran asli',false],['Skala 1 : 1 berarti gambar sama dengan asli',true]],'Skala 2 : 1 berarti gambar dua kali ukuran asli.');
C(53,'Proyeksi','Pernyataan berikut tentang proyeksi.',[['Tampak depan, atas, dan samping menggambarkan benda tiga dimensi',true],['Proyeksi hanya menampilkan warna benda',false],['Tampak samping menunjukkan tinggi dan lebar',true]],'Proyeksi menggambarkan bentuk.');
C(54,'Toleransi','Pernyataan berikut tentang toleransi.',[['Toleransi adalah batas penyimpangan yang boleh',true],['Komponen di luar toleransi tetap layak',false],['Ukuran nominal disertai toleransi',true]],'Di luar toleransi tidak layak.');
C(55,'Kelistrikan','Pernyataan berikut tentang diagram kelistrikan.',[['Diagram menunjukkan hubungan antar komponen',true],['Kode warna boleh tidak dicocokkan dengan kabel',false],['Simbol membantu memahami fungsi komponen',true]],'Kode warna harus dicocokkan.');
C(56,'Pencocokan','Pernyataan berikut tentang pencocokan gambar dan komponen.',[['Komponen asli diukur untuk dibandingkan dengan gambar',true],['Perbedaan ukuran diabaikan',false],['Hasil pencocokan dicatat',true]],'Perbedaan harus diselidiki.');
C(57,'Keselamatan','Pernyataan berikut tentang keselamatan.',[['Tegangan dimatikan sebelum menyambung komponen listrik',true],['Komponen listrik disambung hanya berdasarkan gambar',false],['Gambar disimpan agar tidak terkena oli',true]],'Keselamatan didahulukan.');
C(58,'Bagian tersembunyi','Pernyataan berikut tentang bagian tersembunyi.',[['Bagian tersembunyi digambar dengan garis putus',true],['Bagian tersembunyi dihapus dari gambar',false],['Bagian tersembunyi dicocokkan dengan tampak lain',true]],'Bagian tersembunyi tidak dihapus.');
C(59,'Ukuran','Pernyataan berikut tentang ukuran.',[['Satuan wajib diperhatikan',true],['Ukuran boleh diperkirakan tanpa skala',false],['Ukuran nominal dan toleransi dibaca bersama',true]],'Ukuran harus dibaca dengan skala.');
C(60,'Kesimpulan','Pernyataan berikut tentang kesimpulan.',[['Kesimpulan didasarkan pada pembacaan dan pencocokan',true],['Kesimpulan cukup berdasarkan warna gambar',false],['Hasil pencocokan dicatat dalam lembar kerja',true]],'Kesimpulan harus berdasarkan data.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
