/* Bank soal TKA per unit LKPD: XI-7 Pemeriksaan Sistem Kemudi. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-7',M='LKPD XI-7 Pemeriksaan Sistem Kemudi',L=[];
function id(n){return 'lkxi7-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Sistem kemudi','Sistem kemudi terdiri dari ...',['Setang, steering stem, bearing, dan fork','Mesin, busi, dan karburator','Kampas rem dan kaliper','Rantai dan sproket'],0,'Komponen kemudi mengarahkan roda depan.');
P(2,'Bearing kemudi','Bearing kemudi yang aus atau longgar menyebabkan ...',['Celah dan kemudi tidak stabil','Tenaga mesin naik','Oli lebih awet','Tidak berpengaruh'],0,'Bearing longgar mengganggu kestabilan.');
P(3,'Fork teleskopik','Fork teleskopik berfungsi untuk ...',['Meredam kejut dan menjaga kestabilan','Menambah tenaga','Mengisi bahan bakar','Mendinginkan mesin'],0,'Fork meredam dan menstabilkan.');
P(4,'Roda terangkat','Sebelum memeriksa kemudi, roda depan harus ...',['Terangkat dengan stabil','Menyentuh tanah','Dilepas','Diikat rantai'],0,'Roda terangkat memudahkan pengecekan.');
P(5,'Celah fork','Celah saat fork digoyang maju mundur menandakan ...',['Bearing kemudi longgar atau aus','Ban bocor','Busi basah','Oli penuh'],0,'Celah menunjukkan bearing longgar.');
P(6,'Kemudi berat','Kemudi yang terasa berat atau seret dapat disebabkan oleh ...',['Bearing kemudi atau mur kemudi tidak sesuai','Ban penuh angin','Lampu redup','Kaca spion bergetar'],0,'Bearing dan mur memengaruhi kemudi.');
P(7,'Setang lurus','Setang yang tidak lurus terhadap roda depan dapat ...',['Mengganggu kestabilan berkendara','Menambah tenaga','Menghemat bensin','Tidak berpengaruh'],0,'Kelurusan memengaruhi kendali.');
P(8,'Seal shock','Seal shock yang bocor menyebabkan ...',['Oli rembes dan kemampuan redam berkurang','Tenaga naik','Ban aus','Lampu redup'],0,'Seal bocor mengurangi redaman.');
P(9,'Mur kemudi','Mur kemudi disetel sesuai ...',['Spesifikasi manual','Perasaan pemilik','Warna mur','Harga mur'],0,'Spesifikasi manual sebagai acuan.');
P(10,'Keselamatan','Pekerjaan kemudi sebaiknya dilakukan dengan unit ...',['Tertopang stabil','Dalam kondisi berjalan','Tanpa standar','Di jalan raya'],0,'Unit harus stabil.');
P(11,'Goyangan kasar','Fork tidak boleh digoyang secara kasar pada unit yang ...',['Tidak tertopang','Tertopang stabil','Sedang diperiksa dengan tepat','Terparkir rapi'],0,'Goyangan kasar merusak unit.');
P(12,'Pengendaraan','Motor tidak boleh dikendarai sebelum ...',['Kemudi diperiksa tuntas','Warnanya dicat','Lampu menyala','Spion dipasang'],0,'Kemudi wajib diperiksa.');
P(13,'Putaran kemudi','Putaran kemudi yang normal terasa ...',['Halus tanpa seret','Berat dan kasar','Tersendat','Tidak bisa diputar'],0,'Putaran halus menandakan kondisi baik.');
P(14,'Bunyi tok','Bunyi tok pada rem depan dapat berkaitan dengan ...',['Bearing atau fork yang longgar','Lampu depan','Spion','Klakson'],0,'Komponen depan longgar menimbulkan bunyi.');
P(15,'Kemudi bergoyang','Kemudi yang bergoyang pada kecepatan tertentu dapat disebabkan oleh ...',['Bearing kemudi atau kelurusan roda bermasalah','Tangki penuh','Warna body','Lampu sein'],0,'Bearing dan kelurusan memengaruhi goyangan.');
P(16,'Rembes fork','Oli yang merembes pada fork menandakan ...',['Seal bocor','Tangki penuh','Busi baru','Rantai kendur'],0,'Seal fork bocor.');
P(17,'Langkah awal','Langkah awal pemeriksaan kemudi adalah ...',['Membaca manual dan menyiapkan unit','Menggoyang fork kasar','Melepas setang','Menghidupkan mesin'],0,'Persiapan dulu.');
P(18,'Pengangkatan roda','Pengangkatan roda depan dilakukan untuk ...',['Memeriksa kebebasan putar kemudi','Mengecat roda','Mengisi ban','Membersihkan rem'],0,'Kebebasan putar diperiksa.');
P(19,'Kelurusan setang','Kelurusan setang diperiksa terhadap ...',['Roda depan','Roda belakang saja','Spion','Jok'],0,'Setang sejajar roda depan.');
P(20,'Tabung fork','Tabung fork yang bengkok dapat menyebabkan ...',['Gangguan kemudi dan kestabilan','Mesin lebih cepat','Oli bertambah','Tidak berpengaruh'],0,'Tabung bengkok mengganggu.');
P(21,'Mur kemudi disetel','Mur kemudi disetel lalu ...',['Ulangi uji putar','Langsung dikendarai','Dilepas','Dibiarkan'],0,'Uji ulang setelah penyetelan.');
P(22,'Kebebasan putar','Kebebasan putar kemudi diukur dengan cara ...',['Memutar setang kiri dan kanan dan merasakan seret','Menjatuhkan setang','Memukul','Mengukur tegangan'],0,'Uji putar sederhana.');
P(23,'Bearing diperiksa','Bearing kemudi diperiksa dengan cara ...',['Menggoyang fork maju mundur','Memukul bearing','Membakar bearing','Menjatuhkan fork'],0,'Goyang untuk cek kelonggaran.');
P(24,'Oli fork','Rembesan oli pada fork sebaiknya ...',['Ditelusuri penyebabnya','Diabaikan','Ditutup lakban','Dibiarkan'],0,'Sumber bocor harus dicari.');
P(25,'Kemudi seret','Kemudi yang seret dapat menyebabkan ...',['Kendali sulit dan berbahaya','Motor lebih cepat','Ban lebih awet','Tidak berpengaruh'],0,'Kendali menjadi sulit.');
P(26,'Standar','Standar yang digunakan untuk menopang unit harus ...',['Stabil dan sesuai','Miring','Licin','Tidak diperlukan'],0,'Penopang stabil wajib.');
P(27,'Torsi mur kemudi','Mur kemudi dikencangkan sesuai ...',['Spesifikasi kemudi','Perkiraan teknisi','Tenaga maksimal','Tidak perlu'],0,'Spesifikasi menjamin kekencangan.');
P(28,'Fork kasar','Penggerakan fork secara kasar pada unit tidak tertopang dapat ...',['Menyebabkan unit jatuh atau rusak','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh'],0,'Unit dapat jatuh.');
P(29,'Hasil uji','Hasil uji kemudi dicatat dengan ...',['Temuan yang jelas dan kesimpulan','Tanpa catatan','Warna','Harga'],0,'Pencatatan jelas.');
P(30,'Housekeeping','Setelah pemeriksaan, area kerja ...',['Dirapikan','Dibiarkan kotor','Dibakar','Ditinggalkan'],0,'Area dirapikan.');
P(31,'Kebocoran seal','Seal yang bocor harus ...',['Diganti sesuai prosedur','Dicat','Dibiarkan','Diberi lem'],0,'Seal bocor diganti.');
P(32,'Kemudi stabil','Kemudi yang stabil ditandai dengan ...',['Putaran halus dan tanpa celah berlebih','Berisik keras','Seret','Goyang'],0,'Kondisi stabil.');
P(33,'Bearing aus','Bearing kemudi yang aus menghasilkan ...',['Bunyi dan celah','Warna cerah','Berat lebih','Tidak ada efek'],0,'Bunyi dan celah khas bearing aus.');
P(34,'Uji putar ulang','Uji putar ulang dilakukan agar ...',['Memastikan kemudi tetap normal setelah penyetelan','Menambah pekerjaan','Memanaskan mesin','Menghabiskan waktu'],0,'Uji ulang memastikan.');
P(35,'Kemudi','Komponen kemudi yang bergerak adalah ...',['Setang dan steering stem','Spion dan lampu','Jok dan bodi','Tangki bensin'],0,'Setang dan stem bergerak.');
P(36,'Pengunci','Pengunci pada mur kemudi ...',['Dipasang bila diperlukan desain','Dibuang','Dilas','Tidak perlu'],0,'Pengunci mengikuti desain.');
P(37,'Pengaruh bearing','Bearing yang longgar dapat membuat ...',['Setang bergoyang','Lampu redup','Ban lebih awet','Oli lebih cepat'],0,'Setang goyang.');
P(38,'Kelurusan fork','Kelurusan fork diperiksa agar ...',['Roda sejajar dan kemudi lurus','Warna tetap','Berat sama','Tidak perlu'],0,'Kesejajaran.');
P(39,'Unit tertopang','Unit tertopang dengan baik agar ...',['Aman dan stabil saat diperiksa','Lebih berat','Cepat panas','Tidak perlu'],0,'Keamanan.');
P(40,'Kesimpulan','Kesimpulan pemeriksaan kemudi didasarkan pada ...',['Pengukuran dan pengamatan sesuai manual','Perkiraan saja','Tidak dicatat','Warna'],0,'Berbasis data.');

K(41,'Komponen kemudi','Pilih komponen sistem kemudi.',['Setang','Steering stem','Bearing kemudi','Kampas rem'],[0,1,2],'Kampas rem bukan komponen kemudi.');
K(42,'Gejala kemudi','Pilih gejala kemudi bermasalah.',['Kemudi berat atau seret','Kemudi bergoyang pada kecepatan tertentu','Setang tidak lurus','Lampu sein berkedip'],[0,1,2],'Lampu sein tidak berkaitan.');
K(43,'K3 kemudi','Pilih tindakan keselamatan dalam pemeriksaan kemudi.',['Pastikan roda depan terangkat stabil','Jangan goyang fork kasar pada unit tidak tertopang','Jangan kendarai sebelum diperiksa tuntas','Goyang fork kuat agar cepat selesai'],[0,1,2],'Goyang kasar berbahaya.');
K(44,'Pemeriksaan','Pilih hal yang diperiksa pada kemudi.',['Putaran kemudi','Bearing kemudi','Kelurusan setang','Tabung fork'],[0,1,2,3],'Keempatnya diperiksa.');
K(45,'Seal shock','Pilih yang diperiksa pada seal shock.',['Kebocoran oli','Kondisi seal','Rembesan','Warna cat shock'],[0,1,2],'Warna cat tidak diperiksa.');
K(46,'Mur kemudi','Pilih pernyataan benar tentang mur kemudi.',['Disetel sesuai spesifikasi','Diuji ulang setelah penyetelan','Dikencangkan dengan kekencangan yang tepat','Disetel dengan perkiraan'],[0,1,2],'Perkiraan tidak sah.');
K(47,'Gejala bearing','Pilih gejala bearing kemudi longgar atau aus.',['Celah saat fork digoyang','Bunyi pada kemudi','Kemudi tidak stabil','Ban oleng'],[0,1,2],'Ban oleng tidak berkaitan langsung.');
K(48,'Penopangan','Pilih syarat penopangan unit.',['Stabil','Standar sesuai','Tidak miring','Berada di jalan umum'],[0,1,2],'Jalan umum tidak aman untuk pemeriksaan.');
K(49,'Uji kemudi','Pilih langkah uji kemudi.',['Angkat roda depan','Putar setang kiri dan kanan','Goyang fork maju mundur','Hidupkan mesin dan lepas standar'],[0,1,2],'Mesin hidup tanpa standar berbahaya.');
K(50,'Setelah pemeriksaan','Pilih tindakan setelah pemeriksaan kemudi.',['Simpulkan temuan','Rapikan area kerja','Catat hasil','Abaikan temuan'],[0,1,2],'Temuan tidak boleh diabaikan.');

C(51,'Bearing','Pernyataan berikut tentang bearing kemudi.',[['Celah saat fork digoyang menandakan bearing longgar',true],['Bearing yang aus tidak memengaruhi kemudi',false],['Bearing aus dapat menimbulkan bunyi',true]],'Bearing aus berpengaruh.');
C(52,'Keselamatan','Pernyataan berikut tentang keselamatan.',[['Roda depan harus terangkat stabil',true],['Fork boleh digoyang kasar pada unit tidak tertopang',false],['Motor boleh dikendarai sebelum kemudi tuntas diperiksa',false]],'Keselamatan utama.');
C(53,'Kelurusan','Pernyataan berikut tentang kelurusan.',[['Setang yang bengkok perlu diperiksa',true],['Setang lurus tidak penting',false],['Tabung fork diperiksa dari bengkok',true]],'Kelurusan.');
C(54,'Seal shock','Pernyataan berikut tentang seal shock.',[['Seal diperiksa dari rembesan oli',true],['Rembesan oli pada seal boleh diabaikan',false],['Seal bocor mengurangi redaman',true]],'Seal bocor.');
C(55,'Mur kemudi','Pernyataan berikut tentang mur kemudi.',[['Mur kemudi disetel sesuai spesifikasi',true],['Mur kemudi disetel sesuai perkiraan',false],['Setelah disetel, uji putar diulang',true]],'Mur sesuai spesifikasi.');
C(56,'Putaran','Pernyataan berikut tentang putaran kemudi.',[['Putaran kemudi normal terasa halus',true],['Putaran kemudi berat selalu normal',false],['Seret menandakan perlu pemeriksaan',true]],'Putaran halus.');
C(57,'Penopang','Pernyataan berikut tentang penopangan.',[['Standar yang stabil diperlukan',true],['Standar miring tidak berpengaruh',false],['Unit ditopang sebelum pemeriksaan',true]],'Stabil.');
C(58,'Torsi','Pernyataan berikut tentang torsi.',[['Mur kemudi dikencangkan dengan spesifikasi',true],['Torsi mur kemudi boleh sekuat tenaga',false],['Torsi sesuai menjaga keselamatan',true]],'Torsi.');
C(59,'Tabung fork','Pernyataan berikut tentang tabung fork.',[['Tabung fork bengkok dapat mengganggu kemudi',true],['Tabung fork bengkok tidak berpengaruh',false],['Tabung fork diperiksa dari baret',true]],'Tabung.');
C(60,'Hasil','Pernyataan berikut tentang hasil pemeriksaan.',[['Hasil pemeriksaan dicatat',true],['Hasil pemeriksaan tidak perlu dicatat',false],['Kesimpulan didasarkan pada pengukuran',true]],'Hasil.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
