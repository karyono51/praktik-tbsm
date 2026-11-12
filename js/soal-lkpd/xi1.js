/* Bank soal TKA per unit LKPD: XI-1 Tune-up Mesin Empat Langkah. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-1',M='LKPD XI-1 Tune-up Mesin Empat Langkah',L=[];
function id(n){return 'lkxi1-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Tune-up','Tune-up adalah ...',['Pemeriksaan dan penyetelan agar mesin bekerja optimal','Pengecatan ulang mesin','Penggantian rangka','Pengisian bahan bakar'],0,'Tune-up berisi pemeriksaan dan penyetelan untuk kerja optimal.');
P(2,'Busi','Busi berfungsi untuk ...',['Menyalakan campuran udara dan bahan bakar','Menyaring udara','Mendinginkan oli','Mengatur rem'],0,'Busi menghasilkan percikan untuk menyalakan campuran.');
P(3,'Celah busi','Celah elektroda busi yang tidak sesuai dapat menyebabkan ...',['Pembakaran tidak sempurna dan mesin sulit hidup','Tenaga naik','Oli berkurang','Tidak ada pengaruh'],0,'Celah yang salah mengganggu pengapian.');
P(4,'Warna busi','Warna elektroda busi dapat menunjukkan ...',['Kondisi pembakaran','Merek bensin','Tekanan ban','Jenis oli'],0,'Warna elektroda mencerminkan pembakaran.');
P(5,'Celah katup','Celah katup disetel saat mesin dalam kondisi ...',['Dingin','Panas','Berputar kencang','Mati di tengah langkah'],0,'Pemuaian pada mesin panas mengubah celah.');
P(6,'Celah katup','Penyetelan celah katup dilakukan saat piston di ...',['TMA langkah kompresi','TMB langkah isap','Sembarang posisi','TMB langkah buang'],0,'Katup tertutup saat piston di TMA kompresi.');
P(7,'Pengukuran kompresi','Sebelum mengukur kompresi, yang harus dilakukan adalah ...',['Mematikan bahan bakar dan melepas kabel busi','Menghidupkan mesin lama','Membuka tutup radiator','Mengisi oli'],0,'Langkah ini mencegah bahaya dan kerusakan.');
P(8,'K3','Mesin tidak boleh dinyalakan di ruang tertutup karena ...',['Gas buang beracun','Mesin cepat dingin','Oli membeku','Tidak ada pengaruh'],0,'Gas buang mengandung zat beracun.');
P(9,'Kompresi rendah','Tekanan kompresi rendah dapat disebabkan oleh ...',['Ring, piston, atau katup bocor dan aus','Filter udara bersih','Busi baru','Oli penuh'],0,'Kebocoran di ruang bakar menurunkan kompresi.');
P(10,'Tachometer','Alat untuk mengukur putaran mesin adalah ...',['Tachometer','Termometer','Jangka sorong','Feeler gauge'],0,'Tachometer mengukur rpm.');
P(11,'Feeler gauge','Feeler gauge digunakan untuk ...',['Mengukur celah','Mengukur tekanan','Mengukur suhu','Mengukur tegangan'],0,'Feeler gauge mengukur celah sempit.');
P(12,'Filter udara','Filter udara yang kotor dapat menyebabkan ...',['Campuran terlalu kaya dan tenaga turun','Campuran selalu terlalu miskin','Tidak ada pengaruh','Oli cepat habis'],0,'Udara terbatas membuat campuran kaya.');
P(13,'Idle','Idle yang tidak stabil dapat disebabkan oleh ...',['Penyetelan idle atau saluran udara bermasalah','Ban kempes','Rem depan','Kaca spion'],0,'Idle dipengaruhi penyetelan dan saluran udara.');
P(14,'Celah busi','Busi dengan celah terlalu lebar menyebabkan ...',['Pengapian lemah atau sulit menyala','Mesin lebih cepat','Oli bertambah','Tidak berpengaruh'],0,'Celah lebar melemahkan percikan.');
P(15,'Filter udara','Tujuan memeriksa filter udara adalah ...',['Memastikan udara bersih untuk pembakaran','Menambah bahan bakar','Mengatur rem','Memperbaiki rangka'],0,'Udara bersih mendukung pembakaran.');
P(16,'Kompresi','Pengukuran kompresi dilakukan dengan ...',['Busi dilepas dan throttle dibuka penuh','Busi tetap terpasang dan mesin dingin','Oli dicampur bensin','Kabel busi dilepas dan mesin dihidupkan'],0,'Prosedur ini menjaga hasil ukur tetap valid.');
P(17,'Pengunci','Setelah penyetelan celah katup, mur pengunci sebaiknya ...',['Dikencangkan','Dibiarkan kendur','Dipukul','Dicat'],0,'Mur pengunci menahan penyetelan.');
P(18,'Torsi busi','Busi harus dikencangkan dengan ...',['Torsi sesuai spesifikasi','Tangan kosong sekuat-kuatnya','Palu','Lem'],0,'Torsi tepat mencegah ulir rusak.');
P(19,'Hasil kompresi','Hasil pengukuran kompresi sebaiknya dibandingkan dengan ...',['Standar atau spesifikasi manual','Perkiraan teknisi','Warna busi','Merek oli'],0,'Acuan resmi adalah spesifikasi.');
P(20,'Idle','Putaran idle diatur sesuai ...',['Spesifikasi manual','Selera pemilik','Suara knalpot saja','Warna kabel'],0,'Idle mengikuti spesifikasi.');
P(21,'Siklus empat langkah','Pada langkah kompresi mesin empat langkah ...',['Piston bergerak dari TMB ke TMA dengan katup tertutup','Piston bergerak dari TMA ke TMB dengan katup terbuka','Piston diam','Piston bergerak tanpa katup'],0,'Kompresi terjadi saat katup tertutup.');
P(22,'Celah katup','Celah katup yang terlalu kecil dapat menyebabkan ...',['Katup tidak menutup rapat dan kompresi rendah','Mesin lebih halus','Oli menjadi tebal','Tidak ada efek'],0,'Katup yang tidak rapat menurunkan kompresi.');
P(23,'Celah katup','Celah katup yang terlalu besar dapat menyebabkan ...',['Bunyi ketukan dan tenaga turun','Mesin lebih senyap','Kompresi naik','Oli hemat'],0,'Celah besar menimbulkan ketukan.');
P(24,'Busi basah','Busi yang basah oli menandakan ...',['Kemungkinan oli masuk ruang bakar','Pembakaran sempurna','Campuran terlalu miskin','Busi baru'],0,'Oli di ruang bakar perlu diselidiki.');
P(25,'Pemeriksaan busi','Pemeriksaan busi dilakukan dengan ...',['Melepas busi dan menilai kondisi elektroda','Membakar busi','Memukul busi','Mengganti tanpa cek'],0,'Pemeriksaan dilakukan dengan melepas busi.');
P(26,'K3 mesin panas','Menyetel katup saat mesin panas berisiko ...',['Luka bakar dan hasil ukur tidak akurat','Tidak ada risiko','Busi mati','Oli membeku'],0,'Mesin panas berbahaya dan memengaruhi ukuran.');
P(27,'Idle','Pemeriksaan idle dilakukan dengan ...',['Mesin hidup dan tachometer','Mesin mati total','Motor didorong','Tanpa alat'],0,'Idle diukur saat mesin hidup.');
P(28,'Filter udara','Filter udara yang rusak sebaiknya ...',['Diganti sesuai kondisi','Dicuci bensin lalu dipakai lagi','Dibiarkan','Dibakar'],0,'Filter rusak harus diganti.');
P(29,'Langkah awal','Langkah pertama dalam tune-up adalah ...',['Membaca manual servis dan identifikasi unit','Menyetel katup','Mengukur kompresi','Menghidupkan mesin'],0,'Persiapan dan identifikasi dilakukan lebih dulu.');
P(30,'Kompresi','Pengukuran kompresi menggambarkan kondisi ...',['Ring, piston, dan katup','Roda dan rem','Lampu dan sein','Kopling'],0,'Kompresi mencerminkan ring, piston, dan katup.');
P(31,'Suara mesin','Mesin berisik pada kepala silinder dapat berasal dari ...',['Celah katup tidak sesuai','Ban aus','Rem berdecit','Spion longgar'],0,'Celah katup menimbulkan bunyi di kepala silinder.');
P(32,'Tenaga','Tenaga mesin yang turun dapat disebabkan oleh ...',['Filter udara kotor atau kompresi rendah','Oli baru','Ban baru','Lampu terang'],0,'Pembakaran dan udara memengaruhi tenaga.');
P(33,'Celah busi','Celah elektroda busi diukur dengan ...',['Feeler gauge khusus celah busi','Jangka sorong untuk diameter ban','Tachometer','Multimeter'],0,'Feeler gauge mengukur celah busi.');
P(34,'Uji akhir','Setelah tune-up, mesin diuji dengan cara ...',['Menghidupkan dan mengamati suara serta idle','Mematikan segera','Melepas kabel','Memukul bodi'],0,'Uji fungsi memastikan hasil.');
P(35,'Komponen tune-up','Komponen utama tune-up empat langkah antara lain ...',['Busi, filter udara, dan celah katup','Roda, rem, dan kemudi','Kopling dan CVT','Jok dan spion'],0,'Tiga komponen itu termasuk tune-up.');
P(36,'Pemasangan busi','Busi harus dipasang dengan ...',['Torsi sesuai spesifikasi','Tangan sekuat-kuatnya','Palu','Lem'],0,'Torsi sesuai menjamin pemasangan baik.');
P(37,'Idle','Penyetelan idle berpengaruh pada ...',['Kestabilan putaran mesin saat berhenti','Ukuran ban','Warna bodi','Berat motor'],0,'Idle menentukan kestabilan putaran.');
P(38,'Tachometer','Tachometer digunakan untuk ...',['Mengukur putaran mesin (rpm)','Mengukur tegangan baterai','Mengukur tekanan kompresi','Mengukur suhu oli'],0,'Tachometer membaca rpm.');
P(39,'Pengukuran kompresi','Hasil kompresi sebaiknya diukur ...',['Pada prosedur yang ditentukan dan dicatat','Sekali secara sembarang','Setelah mesin dingin satu menit','Tanpa catatan'],0,'Prosedur dan catatan menjaga akurasi.');
P(40,'Kesimpulan','Kesimpulan tune-up sebaiknya ...',['Berdasarkan data pengukuran dan spesifikasi','Berdasarkan perkiraan','Tanpa catatan','Berdasarkan warna'],0,'Kesimpulan harus didasarkan pada data.');

K(41,'Komponen tune-up','Pilih komponen yang termasuk pekerjaan tune-up.',['Filter udara','Busi','Celah katup','Kopling kering'],[0,1,2],'Kopling kering bukan bagian tune-up.');
K(42,'Gejala kompresi rendah','Pilih gejala yang dapat berhubungan dengan kompresi rendah.',['Tenaga mesin turun','Mesin sulit hidup','Mesin berisik pada kepala silinder','Lampu sein berkedip'],[0,1,2],'Lampu sein tidak berhubungan.');
K(43,'K3 tune-up','Pilih tindakan yang benar sebelum mengukur kompresi.',['Mematikan bahan bakar','Melepas kabel busi','Menyetel katup saat mesin panas','Menyalakan mesin di ruang tertutup'],[0,1],'Menyetel saat panas dan menyalakan di ruang tertutup berbahaya.');
K(44,'Celah katup','Pilih akibat celah katup yang tidak sesuai.',['Terlalu kecil: katup tidak menutup rapat','Terlalu besar: timbul bunyi ketukan','Idle tidak stabil','Oli lebih awet'],[0,1,2],'Oli lebih awet bukan akibat celah.');
K(45,'Pemeriksaan busi','Pilih aspek busi yang diperiksa.',['Warna elektroda','Celah elektroda','Kondisi isolator','Warna cat busi'],[0,1,2],'Warna cat busi tidak diperiksa.');
K(46,'Alat tune-up','Pilih alat yang digunakan saat tune-up.',['Alat ukur kompresi','Feeler gauge','Tachometer','Mesin las'],[0,1,2],'Mesin las tidak digunakan.');
K(47,'Filter udara','Pilih tanda filter udara perlu diganti.',['Kotor dan tersumbat','Tenaga mesin turun','Bahan bakar boros','Warna bodi pudar'],[0,1,2],'Warna bodi tidak terkait filter.');
K(48,'Hasil kompresi','Pilih faktor yang dapat mengubah hasil pengukuran kompresi.',['Mesin panas atau dingin tidak sesuai prosedur','Busi tidak dilepas','Throttle tidak dibuka penuh','Warna bodi motor'],[0,1,2],'Warna bodi tidak memengaruhi hasil.');
K(49,'Penyetelan katup','Pilih pernyataan yang benar tentang penyetelan katup.',['Dilakukan saat mesin dingin','Dilakukan saat piston di TMA kompresi','Mengikuti nilai dari manual servis','Mesin dihidupkan saat menyetel'],[0,1,2],'Menyetel dengan mesin hidup berbahaya.');
K(50,'Setelah penyetelan','Pilih langkah yang dilakukan setelah penyetelan.',['Menguji mesin dan mengamati suara','Membersihkan area kerja','Mencatat hasil pengukuran','Menutup mesin dengan kain basah'],[0,1,2],'Menutup mesin dengan kain basah bukan prosedur.');

C(51,'Penyetelan katup','Pernyataan berikut tentang penyetelan celah katup.',[['Celah katup disetel hanya saat mesin dingin',true],['Mesin panas boleh disetel tanpa risiko',false],['Piston di TMA kompresi saat penyetelan',true]],'Mesin panas berisiko dan memengaruhi ukuran.');
C(52,'K3','Pernyataan berikut tentang keselamatan mesin.',[['Mesin boleh dinyalakan di ruang tertutup asal sebentar',false],['Bahan bakar dimatikan sebelum mengukur kompresi',true],['Gas buang dapat beracun',true]],'Ruang tertutup berbahaya.');
C(53,'Pengukuran kompresi','Pernyataan berikut tentang pengukuran kompresi.',[['Busi dilepas sebelum pengukuran kompresi',true],['Kabel busi dibiarkan terpasang saat mengukur',false],['Hasil dibandingkan dengan spesifikasi',true]],'Busi dilepas untuk pengukuran.');
C(54,'Celah katup','Pernyataan berikut tentang celah katup.',[['Celah katup dapat disetel dengan mesin panas tanpa risiko',false],['Celah katup terlalu kecil dapat menurunkan kompresi',true],['Celah katup terlalu besar dapat menimbulkan ketukan',true]],'Mesin panas berisiko.');
C(55,'Tachometer','Pernyataan berikut tentang alat ukur.',[['Tachometer digunakan untuk mengukur putaran mesin',true],['Feeler gauge digunakan untuk mengukur suhu',false],['Feeler gauge digunakan untuk mengukur celah',true]],'Feeler gauge untuk celah.');
C(56,'Filter udara','Pernyataan berikut tentang filter udara.',[['Filter udara bersih membantu pembakaran',true],['Filter udara kotor selalu menambah tenaga',false],['Filter udara rusak sebaiknya diganti',true]],'Filter kotor mengurangi tenaga.');
C(57,'Kompresi','Pernyataan berikut tentang kompresi rendah.',[['Kompresi rendah tidak berhubungan dengan ring dan katup',false],['Ring dan katup yang bocor dapat menurunkan kompresi',true],['Piston yang aus dapat menurunkan kompresi',true]],'Ring dan katup berhubungan langsung.');
C(58,'Idle','Pernyataan berikut tentang idle.',[['Penyetelan idle mengikuti spesifikasi manual',true],['Idle boleh diatur sesuai selera pemilik',false],['Idle yang stabil menandakan penyetelan baik',true]],'Idle mengikuti manual.');
C(59,'Torsi busi','Pernyataan berikut tentang pemasangan busi.',[['Busi dipasang dengan torsi spesifikasi',true],['Busi boleh dipasang tanpa torsi',false],['Ulir busi yang rusak perlu diperiksa',true]],'Torsi harus sesuai.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan hasil.',[['Hasil tune-up dicatat dan disimpulkan',true],['Hasil tune-up tidak perlu dicatat',false],['Data pengukuran dibandingkan dengan spesifikasi',true]],'Pencatatan adalah bagian prosedur.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
