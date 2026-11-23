/* Bank soal TKA per unit LKPD: XII-2 Diagnosis Sistem EFI dan Pemeriksaan Pompa Bahan Bakar. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-2',M='LKPD XII-2 Diagnosis Sistem EFI dan Pemeriksaan Pompa Bahan Bakar',L=[];
function id(n){return 'lkxii2-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'DTC','DTC adalah ...',['Kode gangguan yang disimpan ECU','Jenis oli','Tipe busi','Ukuran ban','Merek lampu'],0,'DTC petunjuk awal diagnosis.');
P(2,'Tekanan bahan bakar','Sebelum melepas selang bahan bakar pada EFI, tekanan ...',['Dilepas terlebih dahulu','Dibiarkan','Ditambah','Dipanaskan','Diukur sendiri'],0,'Bensin bertekanan dapat menyembur.');
P(3,'Verifikasi DTC','Kode gangguan yang muncul sebaiknya ...',['Diverifikasi dengan pengukuran','Langsung diganti komponennya','Dihapus saja','Diabaikan','Dicatat tanpa pengujian'],0,'DTC perlu dibuktikan.');
P(4,'Spesifikasi pompa','Tekanan pompa bahan bakar dibandingkan dengan ...',['Spesifikasi manual','Perkiraan','Tekanan ban','Warna selang','Harga pompa'],0,'Spesifikasi menjadi acuan.');
P(5,'Setelah perbaikan','Setelah perbaikan, DTC ...',['Dihapus dan unit diuji ulang','Dibiarkan','Diabaikan','Dicat','Dicatat saja'],0,'Memastikan gangguan hilang.');
P(6,'Konektor sensor','Konektor sensor dilepas saat ...',['Kunci kontak OFF','Kunci kontak ON','Mesin hidup','Mesin panas','Motor berjalan'],0,'Mencegah kerusakan ECU atau sensor.');
P(7,'ECU','ECU membaca sensor dan ...',['Menentukan bahan bakar yang disemprotkan','Mengatur ban','Mengatur rem','Mengatur spion','Menyalakan lampu sein'],0,'ECU mengatur injeksi.');
P(8,'Injektor','Injektor menyemprotkan ...',['Bahan bakar sesuai perintah ECU','Oli mesin','Air','Udara saja','Cat'],0,'Injektor mengikuti perintah ECU.');
P(9,'Pompa bahan bakar','Pompa bahan bakar memberi ...',['Tekanan bahan bakar ke injektor','Tekanan ban','Tekanan oli','Tekanan rem','Tekanan udara ruang'],0,'Pompa menyalurkan bahan bakar bertekanan.');
P(10,'Alat scan','Alat scan dipakai untuk ...',['Membaca DTC dan data sensor','Mengukur ban','Menyetel rem','Mengecat','Mengukur kelurusan'],0,'Alat scan membaca data ECU.');
P(11,'Data sensor','Data sensor dibandingkan dengan ...',['Nilai spesifikasi','Warna sensor','Harga sensor','Merek alat','Ukuran konektor'],0,'Spesifikasi sebagai acuan.');
P(12,'Pompa diukur','Pompa bahan bakar diukur tegangan dan ...',['Arusnya','Warnanya','Beratnya','Panjangnya','Harganya'],0,'Tegangan dan arus diukur.');
P(13,'Sulit hidup','Mesin sulit hidup dapat disebabkan oleh ...',['Pompa atau sensor bermasalah','Ban kempes','Setang bengkok','Lampu sein','Spion'],0,'Pompa dan sensor memengaruhi penyalaan.');
P(14,'Lampu MIL','Lampu MIL menyala menandakan ...',['Gangguan terdeteksi ECU','Mesin baru','Oli penuh','Ban aman','Rem kuat'],0,'MIL menandakan gangguan.');
P(15,'Tenaga turun','Tenaga mesin turun dapat disebabkan ...',['Pasokan bahan bakar atau sensor bermasalah','Oli baru','Ban baru','Lampu terang','Spion baru'],0,'Pasokan dan sensor berpengaruh.');
P(16,'Idle','Idle yang tidak stabil dapat disebabkan oleh ...',['Sensor atau saluran udara bermasalah','Warna body','Berat motor','Stiker','Jok baru'],0,'Sensor dan udara memengaruhi idle.');
P(17,'Mati mendadak','Mesin mati mendadak dapat disebabkan oleh ...',['Sensor atau pasokan bahan bakar bermasalah','Lampu redup','Ban penuh','Setang lurus','Spion longgar'],0,'Sensor dan pasokan bahan bakar penting.');
P(18,'Konektor kotor','Konektor yang kotor dapat menyebabkan ...',['Kontak buruk','Tenaga naik','Bensin hemat','Tidak berpengaruh','Sensor lebih kuat'],0,'Kontak buruk mengganggu sinyal.');
P(19,'Tekanan dilepas','Tekanan bahan bakar dilepas agar ...',['Aman saat melepas selang','Mesin lebih cepat','Bensin bertambah','Oli habis','Ban tidak kempes'],0,'Keselamatan saat membuka sambungan.');
P(20,'Wiring diagram','Wiring diagram digunakan untuk ...',['Menelusuri jalur kabel dan sensor','Menghias bengkel','Menghitung upah','Mengecat','Menimbang motor'],0,'Diagram menunjukkan jalur.');
P(21,'Langkah pertama','Langkah pertama diagnosis adalah ...',['Mencatat gejala dan membaca manual','Mengganti ECU','Membuka tangki','Menyetel idle','Menghapus DTC'],0,'Gejala dan manual dulu.');
P(22,'Tegangan pompa','Tegangan pompa bahan bakar diukur pada posisi ...',['DC Volt','Ohm','AC Ampere','Continuity','Frekuensi'],0,'Tegangan DC.');
P(23,'Penghapusan DTC','Mengapa DTC tidak boleh langsung dihapus tanpa diagnosis?',['Karena menghilangkan informasi gangguan sebelum diperiksa','Karena menambah tenaga','Karena menghemat bensin','Karena membuat sensor kuat','Tidak ada alasan'],0,'Informasi gangguan hilang.');
P(24,'Konektor saat ON','Melepas sensor dengan kunci ON dapat ...',['Merusak ECU atau sensor','Mempercepat diagnosis','Tidak berpengaruh','Menambah tenaga','Menghemat listrik'],0,'Kunci ON berisiko merusak.');
P(25,'Sekring','Ukuran sekring harus ...',['Sesuai rating pabrikan','Sembarang','Lebih besar selalu','Kawat biasa','Tanpa rating'],0,'Rating pabrikan.');
P(26,'Arti DTC','Arti kode DTC dicocokkan dengan ...',['Manual servis','Perkiraan','Diabaikan','Dihapus','Difoto saja'],0,'Manual sebagai acuan.');
P(27,'Data tidak normal','Data sensor yang tidak normal sebaiknya ...',['Dicatat untuk analisis lanjut','Dibuang','Diabaikan','Dicampur','Disembunyikan'],0,'Dicatat untuk analisis.');
P(28,'Pompa lemah','Pompa bahan bakar yang lemah menyebabkan ...',['Tekanan dan aliran rendah','Tekanan tinggi','Oli penuh','Ban kempes','Lampu terang'],0,'Aliran kurang.');
P(29,'Injektor tersumbat','Injektor tersumbat dapat menyebabkan ...',['Pembakaran kurang sempurna','Tenaga naik','Bensin lebih hemat','Tidak berpengaruh','Oli cepat habis'],0,'Semprotan terganggu.');
P(30,'Sumber belajar','Sistem EFI dipelajari dari ...',['Buku pedoman dan wiring diagram','Warna motor','Harga suku cadang','Merek saja','Iklan'],0,'Sumber resmi.');
P(31,'Verifikasi','Gangguan dapat diverifikasi dengan ...',['Pengukuran dan uji ulang','Tebakan','Mengganti semua komponen','Menghapus DTC','Mengabaikan'],0,'Pengukuran membuktikan.');
P(32,'Sensor throttle','Sensor posisi throttle berfungsi untuk ...',['Membaca bukaan gas','Mengukur tekanan ban','Mengatur rem','Mengisi bensin','Menyalakan lampu'],0,'Bukaan gas dibaca ECU.');
P(33,'Sensor suhu','Sensor suhu mesin membantu ECU ...',['Menghitung campuran bahan bakar','Mengukur kecepatan','Mengatur lampu','Mengisi oli','Menambah tenaga'],0,'Suhu memengaruhi campuran.');
P(34,'Alat tekanan','Tekanan bahan bakar diukur dengan ...',['Alat ukur tekanan bahan bakar','Tachometer','Termometer','Jangka sorong','Multimeter saja'],0,'Alat tekanan khusus.');
P(35,'Konektor','Pemeriksaan konektor mencakup ...',['Kebersihan dan kekencangan','Warna saja','Harganya','Mereknya','Panjangnya'],0,'Kebersihan dan kekencangan.');
P(36,'Sensor rusak','Gejala sensor rusak antara lain ...',['Data tidak sesuai atau DTC muncul','Motor makin cepat','Oli habis','Ban aman','Tidak berpengaruh'],0,'Data dan DTC.');
P(37,'Area kerja','Pekerjaan EFI dilakukan di ...',['Area berventilasi dan jauh dari api','Ruang tertutup dekat api','Tanah becek','Dekat sumber panas','Tanpa ventilasi'],0,'Keselamatan bensin.');
P(38,'Uji tekanan','Saat uji tekanan, mesin ...',['Dimatikan sesuai prosedur','Dihidupkan terus','Dipanaskan','Diisi bensin','Dicuci'],0,'Prosedur mematikan.');
P(39,'Pencatatan diagnosis','Hasil uji diagnosis dicatat dengan ...',['Temuan dan kesimpulan','Dihapus','Tanpa catatan','Diabaikan','Dicampur'],0,'Pencatatan.');
P(40,'Kesimpulan','Kesimpulan diagnosis didasarkan pada ...',['Data dan pengukuran','Perkiraan','Warna','Tanpa catatan','Kebiasaan'],0,'Berbasis data.');

K(41,'Komponen EFI','Pilih komponen sistem EFI.',['ECU','Injektor','Pompa bahan bakar','Sensor','Kampas rem'],[0,1,2,3],'Kampas rem bukan EFI.');
K(42,'Tanda EFI','Pilih tanda gangguan EFI.',['Mesin sulit hidup','Lampu MIL menyala','Tenaga turun','Idle tidak stabil','Warna cat pudar'],[0,1,2,3],'Warna cat tidak berkaitan.');
K(43,'Pompa','Pilih pemeriksaan pompa bahan bakar.',['Tegangan','Arus','Tekanan','Warna pompa','Kebocoran'],[0,1,2,4],'Warna pompa bukan pemeriksaan.');
K(44,'K3 EFI','Pilih tindakan keselamatan dalam pekerjaan EFI.',['Lepaskan tekanan sebelum melepas selang','Jauhkan api dan percikan','Matikan kunci sebelum konektor','Jangan menjumper tanpa prosedur','Hirup bensin untuk memeriksa'],[0,1,2,3],'Menghirup bensin berbahaya.');
K(45,'Data sensor','Pilih data sensor yang diperiksa.',['Nilai dibanding spesifikasi','Kode dan arti DTC','Konektor','Warna kabel','Tegangan referensi'],[0,1,2,4],'Warna kabel bukan data sensor.');
K(46,'DTC','Pilih pernyataan benar tentang DTC.',['Petunjuk awal diagnosis','Harus diverifikasi','Dihapus setelah perbaikan','Keputusan akhir mutlak','Tidak perlu dibaca'],[0,1,2],'DTC bukan keputusan akhir.');
K(47,'Tekanan rendah','Pilih penyebab tekanan bahan bakar rendah.',['Pompa lemah','Saringan mampet','Selang bocor','Ban kempes','Lampu redup'],[0,1,2],'Ban dan lampu tidak berkaitan.');
K(48,'Konektor','Pilih yang diperiksa pada konektor.',['Kebersihan','Kekencangan','Korosi','Warna konektor','Ukuran sekring'],[0,1,2],'Ukuran sekring bukan pemeriksaan konektor.');
K(49,'Setelah perbaikan','Pilih tindakan setelah perbaikan.',['Hapus DTC lalu uji ulang','Pastikan gangguan tidak muncul','Catat hasil','Biarkan DTC','Lepas konektor saat mesin hidup'],[0,1,2],'Konektor tidak dilepas saat hidup.');
K(50,'Pernyataan EFI','Pilih pernyataan benar tentang pekerjaan EFI.',['Konektor dilepas saat kunci OFF','Pompa diukur tegangan dan arusnya','DTC dihapus setelah verifikasi','Selang dilepas tanpa melepas tekanan','Injeksi berjalan tanpa ECU'],[0,1,2],'Selang tidak boleh dilepas tanpa melepas tekanan.');

C(51,'DTC','Pernyataan berikut tentang DTC.',[['DTC adalah kode gangguan yang disimpan ECU',true],['DTC boleh dihapus tanpa diagnosis',false],['DTC diverifikasi dengan pengukuran',true]],'DTC perlu diverifikasi.');
C(52,'Konektor','Pernyataan berikut tentang konektor sensor.',[['Konektor sensor boleh dilepas saat kunci ON',false],['Konektor sensor dilepas saat kunci OFF',true],['Konektor kotor dapat menyebabkan kontak buruk',true]],'Kunci OFF.');
C(53,'Tekanan bahan bakar','Pernyataan berikut tentang tekanan bahan bakar.',[['Tekanan bahan bakar dilepas sebelum melepas selang',true],['Selang boleh dilepas tanpa melepas tekanan',false],['Tekanan dilepas untuk keselamatan',true]],'Keselamatan.');
C(54,'Penghapusan DTC','Pernyataan berikut tentang DTC.',[['DTC boleh dihapus tanpa diagnosis',false],['DTC dihapus setelah perbaikan dan uji ulang',true],['DTC dicocokkan dengan manual',true]],'DTC.');
C(55,'Pompa','Pernyataan berikut tentang pompa bahan bakar.',[['Pompa bahan bakar diukur tegangan dan arusnya',true],['Pompa cukup diperiksa warnanya',false],['Tekanan pompa dibandingkan dengan spesifikasi',true]],'Pemeriksaan pompa.');
C(56,'Data sensor','Pernyataan berikut tentang data sensor.',[['Data sensor dibandingkan dengan spesifikasi',true],['Data sensor tidak perlu dicatat',false],['Data sensor tidak normal dianalisis',true]],'Data sensor.');
C(57,'Sulit hidup','Pernyataan berikut tentang mesin sulit hidup.',[['Mesin sulit hidup dapat disebabkan pompa atau sensor',true],['Mesin sulit hidup selalu karena ban',false],['Sensor perlu diperiksa dalam diagnosis',true]],'Penyebab.');
C(58,'Verifikasi','Pernyataan berikut tentang verifikasi.',[['Kode DTC tidak perlu diverifikasi',false],['Gangguan diverifikasi dengan pengukuran',true],['Hasil verifikasi dicatat',true]],'Verifikasi.');
C(59,'Setelah perbaikan','Pernyataan berikut tentang setelah perbaikan.',[['Setelah perbaikan DTC dihapus dan diuji ulang',true],['Setelah perbaikan DTC dibiarkan',false],['Gangguan dipastikan hilang',true]],'Uji ulang.');
C(60,'Area kerja','Pernyataan berikut tentang area kerja EFI.',[['Api dijauhkan dari area kerja EFI',true],['Api boleh didekatkan ke bensin',false],['Area kerja berventilasi',true]],'K3.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
