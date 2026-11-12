/* Bank soal TKA per unit LKPD: XI-8 Pelepasan, Pemasangan, dan Penyetelan Roda. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-8',M='LKPD XI-8 Pelepasan, Pemasangan, dan Penyetelan Roda',L=[];
function id(n){return 'lkxi8-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Penopangan','Sebelum melepas roda, unit harus ...',['Ditopang dengan aman','Dihidupkan','Diisi bensin','Dicuci'],0,'Penopangan mencegah unit jatuh.');
P(2,'Torsi mur as','Mur as dikencangkan dengan ...',['Torsi spesifikasi','Sekuat tenaga','Tanpa kunci','Dipukul'],0,'Torsi menjamin keselamatan.');
P(3,'Bearing roda','Bearing roda yang aus dapat dikenali dari ...',['Bunyi dan putaran seret','Warna ban','Berat roda','Bentuk setang'],0,'Bearing rusak terdengar dan terasa.');
P(4,'Uji setelah pasang','Setelah roda terpasang, hal yang wajib diuji adalah ...',['Putaran roda dan rem','Penampilan saja','Klakson saja','Lampu saja'],0,'Roda dan rem harus normal.');
P(5,'Urutan lepas','Komponen yang dilepas sebaiknya ...',['Disusun berurutan','Dicampur','Dibuang','Dibiarkan'],0,'Urutan memudahkan pemasangan.');
P(6,'Gemuk','Gemuk tidak boleh mengenai ...',['Piringan dan pad rem','Bearing','As roda','Dudukan'],0,'Gemuk mengurangi daya rem.');
P(7,'Pengunci','Pengunci mur as harus ...',['Terpasang','Dibuang','Dicat','Dilas'],0,'Pengunci menahan mur.');
P(8,'Rem','Rem tidak boleh tertekan saat ...',['Roda dilepas','Roda dipasang','Motor diuji','Motor dipanaskan'],0,'Rem tertekan mengganggu pelepasan.');
P(9,'Kestabilan','Kestabilan unit saat ditopang diperiksa dengan ...',['Mengguncang ringan dan melihat posisinya','Memukul','Mengangkat satu sisi secara kasar','Tidak diperiksa'],0,'Uji kestabilan ringan.');
P(10,'Ban aus','Ban aus tidak rata dapat disebabkan oleh ...',['Masalah kelurusan atau tekanan yang tidak sesuai','Lampu redup','Klakson rusak','Kaca spion'],0,'Kelurusan dan tekanan memengaruhi keausan.');
P(11,'Pelek','Pelek yang oleng dapat disebabkan oleh ...',['Pelek bengkok atau roda tidak seimbang','Tangki penuh','Oli baru','Busi basah'],0,'Pelek bengkok menimbulkan oleng.');
P(12,'As','As dan spacer menjaga ...',['Kelurusan dan putaran halus','Tenaga mesin','Warna roda','Berat unit'],0,'Spacer dan as menjaga kelurusan.');
P(13,'Bearing','Bearing yang seret menyebabkan ...',['Roda sulit berputar halus','Roda lebih cepat','Ban lebih awet','Tidak ada efek'],0,'Putaran jadi seret.');
P(14,'Pelepasan','Mur as dilepas dengan ...',['Kunci yang sesuai ukuran','Palu','Tang','Obeng'],0,'Kunci pas sesuai ukuran.');
P(15,'Pemasangan roda','Pemasangan roda dilakukan sesuai ...',['Urutan yang benar','Selera pemasang','Tanpa urutan','Dengan palu'],0,'Urutan benar.');
P(16,'Ban dan pelek','Ban dan pelek diperiksa keausan, retak, dan ...',['Oleng','Warnanya','Mereknya','Beratnya'],0,'Oleng dan retak diperiksa.');
P(17,'Rem setelah pasang','Rem diperiksa setelah roda dipasang agar ...',['Berfungsi normal','Lebih berisik','Lebih lambat','Tidak perlu'],0,'Rem harus normal.');
P(18,'Pengencangan','Pengencangan mur as harus ...',['Sesuai torsi spesifikasi','Sekuat mungkin','Asal kencang','Tanpa kunci'],0,'Torsi sesuai spesifikasi.');
P(19,'Mur kendur','Mur as yang kendur dapat menyebabkan ...',['Roda lepas atau oleng','Mesin lebih halus','Tenaga naik','Tidak berpengaruh'],0,'Mur kendur berbahaya.');
P(20,'Ban tidak rata','Ban aus tidak rata menandakan ...',['Perlu diperiksa penyebabnya','Ban baru','Oli habis','Tidak ada masalah'],0,'Penyebab perlu dicari.');
P(21,'Langkah awal','Langkah awal pelepasan roda adalah ...',['Membaca manual dan menyiapkan unit','Melepas as','Memutar roda','Mengukur ban'],0,'Persiapan.');
P(22,'Topang','Topang unit dilakukan dengan ...',['Standar atau dongkrak yang stabil','Batu','Kayu lapuk','Ban'],0,'Penopang stabil.');
P(23,'Spacer','Spacer dipasang sesuai ...',['Posisinya semula','Selera','Warna','Ukuran apa saja'],0,'Posisi semula.');
P(24,'Bearing diputar','Bearing diputar untuk memeriksa ...',['Suara dan celah','Warna','Berat','Harga'],0,'Suara dan celah.');
P(25,'Oleng','Roda oleng setelah dipasang dapat disebabkan oleh ...',['Pemasangan atau pelek yang bermasalah','Lampu sein','Spion','Klakson'],0,'Pemasangan dan pelek.');
P(26,'Torsi','Torsi mur as yang berlebihan dapat ...',['Merusak bearing atau ulir','Membuat roda lebih lurus','Mengurangi getaran','Tidak berpengaruh'],0,'Torsi berlebih merusak.');
P(27,'Piringan','Piringan rem dijaga dari ...',['Oli atau gemuk','Air bersih','Debu kering','Sinar matahari'],0,'Oli dan gemuk mengganggu rem.');
P(28,'Standar paddock','Standar paddock digunakan untuk ...',['Menopang unit saat roda dilepas','Menambah tenaga','Mengisi bensin','Menghidupkan mesin'],0,'Standar menopang unit.');
P(29,'Roda terpasang','Roda yang telah terpasang diputar untuk memeriksa ...',['Oleng dan rem','Warna cat','Harga','Merek'],0,'Oleng dan rem diperiksa.');
P(30,'Housekeeping','Komponen dan alat setelah pekerjaan ...',['Disusun dan dirapikan','Dibiarkan','Dibuang','Ditinggal di jalan'],0,'Rapi.');
P(31,'Ban aus','Ban aus yang sudah batas harus ...',['Diganti sesuai batas','Dipakai terus','Diampelas','Ditambal'],0,'Batas keausan wajib diganti.');
P(32,'Ban dan tekanan','Tekanan ban diperiksa agar ...',['Keausan merata dan kendaraan stabil','Ban lebih keras','Berat motor berubah','Lampu terang'],0,'Tekanan menjaga keausan.');
P(33,'Mur as kendur','Mur as yang kendur harus ...',['Dikencangkan dengan torsi spesifikasi','Dibiarkan','Diberi lem','Dipukul'],0,'Torsi spesifikasi.');
P(34,'Pengunci mur','Pengunci mur as yang tidak terpasang dapat ...',['Menyebabkan mur lepas','Membuat mur kuat','Tidak berpengaruh','Menambah tenaga'],0,'Pengunci mencegah lepas.');
P(35,'Rem seret','Rem seret setelah roda dipasang dapat disebabkan oleh ...',['Pemasangan komponen rem yang keliru','Ban penuh','Lampu sein','Spion'],0,'Pemasangan rem.');
P(36,'Pemeriksaan bearing','Pemeriksaan bearing dilakukan dengan ...',['Memutar bearing dan memeriksa suara dan celah','Memukul','Memanaskan','Memotong'],0,'Pemeriksaan dengan memutar.');
P(37,'Setang','Setang yang bergetar tidak berkaitan langsung dengan ...',['Kelurusan roda','Keausan bearing roda','Ban oleng','Mur as kendur'],0,'Setang tidak langsung terkait roda.');
P(38,'Gangguan','Gangguan pada roda sebaiknya ...',['Diperiksa dan diperbaiki sebelum dikendarai','Diabaikan','Ditunda sampai lama','Dicat'],0,'Perbaikan sebelum dikendarai.');
P(39,'Kesimpulan','Kesimpulan pekerjaan roda didasarkan pada ...',['Pemeriksaan dan spesifikasi','Perkiraan','Tidak dicatat','Warna'],0,'Berbasis data.');
P(40,'Dokumentasi','Hasil pekerjaan roda dicatat dengan ...',['Temuan dan kesimpulan yang jelas','Tanpa catatan','Warna','Harga'],0,'Pencatatan.');

K(41,'Komponen roda','Pilih komponen yang dilepas dalam pekerjaan roda.',['As roda','Spacer','Komponen rem','Kopling kering'],[0,1,2],'Kopling kering bukan bagian roda.');
K(42,'Tanda bearing','Pilih tanda bearing roda bermasalah.',['Bunyi','Putaran seret','Celah pada roda','Warna ban'],[0,1,2],'Warna ban tidak menunjukkan bearing.');
K(43,'K3 roda','Pilih tindakan keselamatan dalam pekerjaan roda.',['Topang unit stabil','Jangan biarkan rem tertekan saat roda dilepas','Pastikan pengunci mur as terpasang','Jaga piringan dari oli'],[0,1,2,3],'Keempatnya keselamatan.');
K(44,'Pemeriksaan roda','Pilih hal yang diperiksa pada roda.',['Bearing roda','Ban','Pelek','Lampu sein'],[0,1,2],'Lampu sein tidak diperiksa.');
K(45,'Torsi','Pilih pernyataan benar tentang torsi mur as.',['Dikencangkan sesuai spesifikasi','Dipasang dengan pengunci','Dikencangkan sekuat tenaga','Diperiksa setelah pemasangan'],[0,1,3],'Sekuat tenaga salah.');
K(46,'Rem','Pilih hal yang diperiksa pada rem setelah roda dipasang.',['Kerja rem normal','Tidak seret','Respons tuas','Warna cat'],[0,1,2],'Warna cat tidak diperiksa.');
K(47,'Ban','Pilih yang diperiksa pada ban.',['Keausan','Retak','Kondisi tekanan','Warna'],[0,1,2],'Warna tidak diperiksa.');
K(48,'Penopangan','Pilih syarat penopangan saat melepas roda.',['Stabil','Standar sesuai','Dongkrak di titik benar','Ditopang di jalan miring'],[0,1,2],'Jalan miring tidak aman.');
K(49,'Gejala roda','Pilih gejala yang berkaitan dengan roda.',['Roda oleng','Bearing berbunyi','Mur as kendur','Lampu redup'],[0,1,2],'Lampu redup tidak berkaitan.');
K(50,'Setelah pemasangan','Pilih tindakan setelah roda dipasang.',['Periksa putaran roda','Uji rem','Periksa torsi mur as','Biarkan rem tertekan'],[0,1,2],'Rem tertekan berbahaya.');

C(51,'Penopangan','Pernyataan berikut tentang penopangan.',[['Unit ditopang dengan aman sebelum roda dilepas',true],['Unit boleh tidak ditopang saat roda dilepas',false],['Standar harus stabil',true]],'Penopangan aman.');
C(52,'Rem','Pernyataan berikut tentang rem saat pekerjaan roda.',[['Rem tidak boleh tertekan saat roda dilepas',true],['Rem boleh ditekan saat roda dilepas',false],['Rem diuji setelah pemasangan',true]],'Rem.');
C(53,'Torsi','Pernyataan berikut tentang mur as.',[['Mur as dikencangkan dengan torsi spesifikasi',true],['Mur as dikencangkan sekuat tenaga',false],['Pengunci mur as dipasang',true]],'Torsi.');
C(54,'Bearing','Pernyataan berikut tentang bearing roda.',[['Bearing yang aus menimbulkan bunyi',true],['Bearing yang aus tidak terasa',false],['Bearing diperiksa dengan memutar',true]],'Bearing.');
C(55,'Gemuk','Pernyataan berikut tentang gemuk.',[['Gemuk tidak boleh mengenai piringan dan pad',true],['Gemuk boleh mengenai piringan',false],['Piringan dijaga dari oli atau gemuk',true]],'Gemuk.');
C(56,'Ban','Pernyataan berikut tentang ban.',[['Ban aus tidak rata perlu diselidiki penyebabnya',true],['Ban aus tidak rata tidak perlu diperiksa',false],['Ban diperiksa dari retak',true]],'Ban.');
C(57,'Pelek','Pernyataan berikut tentang pelek.',[['Pelek retak harus diperiksa',true],['Pelek oleng boleh dibiarkan',false],['Pelek diperiksa dari keretakan',true]],'Pelek.');
C(58,'Mur kendur','Pernyataan berikut tentang mur kendur.',[['Mur as yang kendur dapat membuat roda lepas',true],['Mur as kendur selalu aman',false],['Mur as kendur dikencangkan sesuai torsi',true]],'Mur kendur.');
C(59,'Uji','Pernyataan berikut tentang uji roda.',[['Roda diputar untuk memeriksa oleng',true],['Uji roda tidak diperlukan',false],['Rem diuji setelah roda dipasang',true]],'Uji.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil pekerjaan dicatat',true],['Hasil pekerjaan tidak perlu dicatat',false],['Kesimpulan didasarkan pada pemeriksaan',true]],'Pencatatan.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
