/* Bank soal TKA per unit LKPD: XI-5 Pemeliharaan Sistem Pendingin. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-5',M='LKPD XI-5 Pemeliharaan Sistem Pendingin',L=[];
function id(n){return 'lkxi5-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Cairan pendingin','Cairan pada sistem pendingin berfungsi untuk ...',['Menyerap panas mesin dan melepaskannya di radiator','Mengisi bahan bakar','Menyaring udara','Mengatur rem'],0,'Cairan menyerap dan membuang panas.');
P(2,'Thermostat','Thermostat berfungsi untuk ...',['Mengatur aliran cairan agar suhu kerja stabil','Mengisi cairan','Mematikan mesin','Menambah tenaga'],0,'Thermostat menjaga suhu kerja.');
P(3,'Tutup radiator','Tutup radiator menjaga ...',['Tekanan sistem pendingin','Level oli mesin','Tegangan baterai','Putaran roda'],0,'Tutup menjaga tekanan sistem.');
P(4,'Tutup rusak','Tutup radiator yang rusak menyebabkan ...',['Cairan cepat habis','Mesin lebih dingin','Oli lebih awet','Tidak berpengaruh'],0,'Tekanan tidak tertahan, cairan hilang.');
P(5,'Membuka tutup','Tutup radiator sebaiknya dibuka saat ...',['Mesin dingin','Mesin panas','Mesin hidup','Sedang berjalan'],0,'Cairan panas bertekanan berbahaya.');
P(6,'Kipas','Kipas radiator berfungsi untuk ...',['Membantu melepaskan panas dari radiator','Menambah tenaga','Mengisi cairan','Mengatur rem'],0,'Kipas membantu pendinginan.');
P(7,'Sensor suhu','Sensor suhu berfungsi untuk ...',['Memberi informasi suhu mesin','Mengatur tekanan ban','Mengisi bahan bakar','Menyetel idle'],0,'Sensor memberi data suhu.');
P(8,'Cairan beracun','Cairan pendingin bersifat beracun sehingga ...',['Jangan diminum dan dibuang sesuai prosedur','Boleh dibuang ke selokan','Boleh diminum','Boleh dipakai sebagai oli'],0,'Cairan berbahaya dan limbah.');
P(9,'Level cairan','Level cairan pendingin diperiksa pada ...',['Tangki cadangan saat mesin dingin','Tangki bensin','Tangki oli','Tangki air wiper'],0,'Tangki cadangan menunjukkan level.');
P(10,'Selang retak','Selang yang retak dapat ...',['Menyebabkan kebocoran cairan','Menambah tekanan','Mendinginkan busi','Tidak berpengaruh'],0,'Selang retak membuat cairan bocor.');
P(11,'Klem selang','Klem selang harus ...',['Kencang agar tidak bocor','Dibiarkan longgar','Dipukul','Dilas'],0,'Klem kencang menahan sambungan.');
P(12,'Udara dalam sistem','Gelembung udara dalam sistem pendingin dapat ...',['Mengganggu pendinginan','Menambah tenaga','Mengurangi getaran','Tidak berpengaruh'],0,'Udara menghalangi aliran cairan.');
P(13,'Mesin panas','Mesin cepat panas dapat disebabkan oleh ...',['Sistem pendingin bermasalah','Tenaga naik','Oli habis','Ban aus'],0,'Pendinginan yang bermasalah menaikkan suhu.');
P(14,'Mesin panas','Saat mesin panas, sebaiknya ditunggu hingga ...',['Aman untuk dibuka','Disiram air dingin langsung','Tetap dihidupkan','Dipanaskan lagi'],0,'Tunggu agar aman.');
P(15,'Kipas mati','Kipas yang tidak berputar dapat menyebabkan ...',['Suhu mesin naik','Tenaga bertambah','Mesin lebih dingin','Tidak berpengaruh'],0,'Tanpa kipas, panas tidak terbuang.');
P(16,'Pengurasan','Pengurasan cairan dilakukan ...',['Sesuai manual dan prosedur','Asal saja','Dengan oli','Tanpa wadah'],0,'Prosedur dan wadah wajib.');
P(17,'Pengisian','Pengisian cairan dilakukan dengan ...',['Cairan sesuai spesifikasi','Air sembarang','Oli mesin','Tanpa membuang udara'],0,'Cairan harus sesuai spesifikasi.');
P(18,'Buang udara','Membuang udara dari sistem sebaiknya ...',['Sesuai prosedur manual','Dengan membuka tutup saat panas','Dengan memukul radiator','Tidak perlu'],0,'Prosedur manual dipakai.');
P(19,'Uji kebocoran','Kebocoran sistem pendingin diuji dengan ...',['Alat uji tekanan','Tachometer','Multimeter','Jangka sorong'],0,'Alat uji tekanan mencari bocor.');
P(20,'Radiator tersumbat','Radiator yang tersumbat dapat menyebabkan ...',['Panas berlebih pada mesin','Mesin lebih dingin','Tenaga bertambah','Tidak berpengaruh'],0,'Sumbatan menghalangi pendinginan.');
P(21,'Kebocoran radiator','Kebocoran pada radiator menyebabkan ...',['Cairan berkurang','Cairan bertambah','Tidak berpengaruh','Kipas mati'],0,'Kebocoran membuat cairan berkurang.');
P(22,'Thermostat terbuka','Thermostat yang macet terbuka menyebabkan mesin ...',['Lambat panas','Cepat panas','Oli habis','Tidak berpengaruh'],0,'Aliran cairan selalu terbuka.');
P(23,'Thermostat tertutup','Thermostat yang macet tertutup menyebabkan mesin ...',['Cepat panas','Lambat panas','Tidak berpengaruh','Tenaga naik'],0,'Aliran cairan terhambat.');
P(24,'Setelah perbaikan','Suhu kerja normal setelah perbaikan menandakan ...',['Sistem pendingin bekerja baik','Kipas rusak','Oli habis','Tidak ada arti'],0,'Suhu normal adalah tanda hasil baik.');
P(25,'Cairan pendingin','Cairan pendingin dipilih sesuai ...',['Spesifikasi manual','Harga termurah','Warna cairan','Merek saja'],0,'Spesifikasi menjadi acuan.');
P(26,'Tutup radiator','Pemeriksaan tutup radiator mencakup ...',['Kondisi karet dan kemampuan menahan tekanan','Warna tutup','Berat tutup','Panjang tutup'],0,'Karet dan tekanan diperiksa.');
P(27,'Sebelum mengisi','Sebelum mengisi cairan, sistem harus ...',['Tidak panas','Dalam kondisi mesin hidup','Dipanaskan dengan api','Tutupnya dibuka saat panas'],0,'Sistem dingin lebih aman.');
P(28,'Kipas','Kipas berputar sesuai ...',['Suhu mesin','Selera pengendara','Warna radiator','Waktu siang saja'],0,'Kipas bekerja berdasarkan suhu.');
P(29,'Langkah awal','Langkah awal pekerjaan pendingin adalah ...',['Membaca manual dan menyiapkan cairan dan alat','Membuka tutup panas','Mengisi cairan langsung','Menguji tanpa persiapan'],0,'Persiapan dulu.');
P(30,'Klem bocor','Klem selang yang bocor diperbaiki dengan ...',['Mengencangkan atau mengganti klem','Dibiarkan','Diberi lem','Ditutup kertas'],0,'Klem dikencangkan atau diganti.');
P(31,'Cairan keruh','Cairan yang keruh dapat menunjukkan ...',['Kotoran atau masalah pada sistem','Tanda baru','Kipas baik','Tidak berarti'],0,'Keruh menunjukkan kotoran.');
P(32,'Cairan cepat habis','Cairan yang cepat habis perlu ...',['Diperiksa kebocorannya','Dibiarkan saja','Diisi tanpa diperiksa','Diabaikan'],0,'Kebocoran harus dicari.');
P(33,'Suhu tinggi','Mesin yang bekerja pada suhu tinggi terus-menerus dapat ...',['Merusak komponen','Makin awet','Menambah tenaga','Tidak berpengaruh'],0,'Panas berlebih merusak.');
P(34,'Pendinginan cairan','Sistem pendingin cairan berbeda dengan pendingin udara karena ...',['Menggunakan cairan untuk menyerap panas','Menggunakan udara sebagai cairan','Tidak ada perbedaan','Hanya untuk motor kecil'],0,'Sistem cairan memakai cairan sebagai media.');
P(35,'Radiator','Radiator berfungsi untuk ...',['Melepaskan panas cairan ke udara','Menyerap udara','Menyimpan bensin','Mengatur rem'],0,'Radiator membuang panas ke udara.');
P(36,'Tangki cadangan','Tangki cadangan berfungsi untuk ...',['Menampung cairan saat terjadi muai','Menyimpan bensin','Menyaring udara','Tempat oli'],0,'Tangki menampung kelebihan cairan.');
P(37,'Alat uji','Alat untuk menguji tekanan sistem adalah ...',['Alat uji tekanan pendingin','Tachometer','Termometer saja','Jangka sorong'],0,'Alat uji tekanan khusus.');
P(38,'Pengisian','Cairan pendingin diisi saat ...',['Mesin dingin sesuai prosedur','Mesin panas','Mesin hidup','Mesin berputar'],0,'Mesin dingin untuk keamanan.');
P(39,'Hasil uji','Hasil uji kebocoran ...',['Dicatat dan disimpulkan','Diabaikan','Dibuang','Dicampur'],0,'Hasil perlu dicatat.');
P(40,'Kesimpulan','Kesimpulan pemeliharaan pendingin didasarkan pada ...',['Pemeriksaan dan spesifikasi','Perkiraan','Tidak dicatat','Warna'],0,'Berbasis data.');

K(41,'Komponen pendingin','Pilih komponen sistem pendingin.',['Radiator','Thermostat','Kipas','Karburator'],[0,1,2],'Karburator bukan komponen pendingin.');
K(42,'Gejala pendingin','Pilih gejala sistem pendingin bermasalah.',['Mesin cepat panas','Cairan berkurang','Kipas tidak berputar','Kaca spion bergetar'],[0,1,2],'Kaca spion tidak berkaitan.');
K(43,'K3 pendingin','Pilih tindakan keselamatan dalam pekerjaan pendingin.',['Jangan membuka tutup radiator saat panas','Cairan dibuang sesuai prosedur','Jauhkan tangan dari kipas saat hidup','Minum cairan jika haus'],[0,1,2],'Cairan pendingin beracun.');
K(44,'Selang','Pilih yang diperiksa pada selang.',['Retak','Bocor','Klem kencang','Warna selang'],[0,1,2],'Warna tidak menentukan kondisi.');
K(45,'Pembuangan cairan','Pilih cara membuang cairan pendingin bekas.',['Ke wadah limbah','Sesuai prosedur','Dicatat jumlahnya','Ke selokan air'],[0,1,2],'Selokan dilarang.');
K(46,'Thermostat','Pilih pemeriksaan thermostat.',['Membuka dan menutup sesuai suhu','Kondisi terbuka atau macet','Fungsinya mengatur aliran','Warna thermostat'],[0,1,2],'Warna tidak diperiksa.');
K(47,'Tutup rusak','Pilih akibat tutup radiator rusak.',['Cairan cepat habis','Tekanan sistem tidak stabil','Mesin mudah panas','Oli menjadi tebal'],[0,1,2],'Oli menebal tidak berkaitan.');
K(48,'Uji kebocoran','Pilih hal yang diperiksa dalam uji kebocoran.',['Tekanan sistem','Sambungan','Selang','Warna knalpot'],[0,1,2],'Knalpot tidak termasuk sistem pendingin.');
K(49,'Cairan pendingin','Pilih pernyataan yang benar tentang cairan pendingin.',['Bersifat beracun','Diisi sesuai spesifikasi','Levelnya diperiksa saat dingin','Boleh diminum saat haus'],[0,1,2],'Cairan tidak boleh diminum.');
K(50,'Setelah pengisian','Pilih tindakan setelah pengurasan dan pengisian.',['Membuang udara sesuai prosedur','Uji kebocoran','Pantau suhu kerja','Tuang sisa cairan di jalan'],[0,1,2],'Cairan tidak dituang di jalan.');

C(51,'Level cairan','Pernyataan berikut tentang level cairan.',[['Level cairan diperiksa saat mesin dingin',true],['Tutup radiator boleh dibuka saat mesin panas',false],['Level diperiksa pada tangki cadangan',true]],'Tutup radiator tidak boleh dibuka saat panas.');
C(52,'Thermostat','Pernyataan berikut tentang thermostat.',[['Thermostat mengatur aliran cairan',true],['Thermostat mengisi cairan',false],['Thermostat macet dapat mengganggu suhu kerja',true]],'Thermostat mengatur aliran.');
C(53,'Cairan','Pernyataan berikut tentang cairan pendingin.',[['Cairan pendingin boleh diminum',false],['Cairan pendingin beracun',true],['Cairan dibuang sesuai prosedur',true]],'Cairan beracun.');
C(54,'Kipas','Pernyataan berikut tentang kipas.',[['Kipas perlu diperiksa saat suhu naik',true],['Kipas tidak berpengaruh pada suhu',false],['Kipas membantu melepaskan panas',true]],'Kipas berfungsi mendinginkan.');
C(55,'Klem selang','Pernyataan berikut tentang klem.',[['Klem selang longgar dapat menyebabkan bocor',true],['Klem longgar lebih aman',false],['Klem diperiksa kekencangannya',true]],'Klem longgar bocor.');
C(56,'Udara','Pernyataan berikut tentang gelembung udara.',[['Gelembung udara tidak berpengaruh pada pendinginan',false],['Gelembung udara dapat mengganggu pendinginan',true],['Udara dibuang sesuai prosedur',true]],'Udara mengganggu.');
C(57,'Keselamatan','Pernyataan berikut tentang keselamatan.',[['Mesin panas harus ditunggu sampai aman',true],['Tutup radiator dibuka saat mesin panas',false],['Tangan dijauhkan dari kipas saat mesin hidup',true]],'Keselamatan.');
C(58,'Pembuangan','Pernyataan berikut tentang pembuangan cairan.',[['Cairan pendingin dibuang sesuai prosedur',true],['Cairan dibuang ke selokan air',false],['Limbah cairan ditampung',true]],'Limbah.');
C(59,'Uji tekanan','Pernyataan berikut tentang uji tekanan.',[['Uji tekanan membantu menemukan kebocoran',true],['Uji tekanan tidak perlu dilakukan',false],['Hasil uji dicatat',true]],'Uji tekanan.');
C(60,'Pencatatan','Pernyataan berikut tentang pencatatan.',[['Hasil perbaikan dicatat',true],['Hasil perbaikan tidak perlu dicatat',false],['Kesimpulan didasarkan pada pemeriksaan',true]],'Pencatatan wajib.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
