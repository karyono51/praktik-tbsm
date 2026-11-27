/* Bank soal TKA per unit LKPD: XII-4 Pemeriksaan Keselamatan dan Perawatan Dasar Sepeda Motor Listrik. 40 PG (5 pilihan), 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XII-4',M='LKPD XII-4 Pemeriksaan Keselamatan dan Perawatan Dasar Sepeda Motor Listrik',L=[];
function id(n){return 'lkxii4-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var L5=o.length,r=n%L5,o2=o.map(function(x,i){return o[(i+r)%L5]}),k2=(k-r+L5)%L5;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XII'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XII'})}

P(1,'Bahaya tegangan tinggi','Sistem kendaraan listrik tegangan tinggi ...',['Berbahaya dan dapat menyebabkan sengatan fatal','Tidak berbahaya','Hanya berbahaya saat hujan','Aman selalu','Sama dengan motor bensin'],0,'Tegangan tinggi berbahaya.');
P(2,'Prosedur pabrikan','Pengerjaan sistem tegangan tinggi wajib mengikuti ...',['Prosedur pabrikan','Kebiasaan bengkel','Tebakan teknisi','Iklan','Cara tetangga'],0,'Prosedur pabrikan wajib.');
P(3,'Warna kabel','Kabel tegangan tinggi umumnya berwarna ...',['Oranye','Hijau','Biru','Putih','Hitam'],0,'Oranye menandai tegangan tinggi.');
P(4,'Langkah pertama','Langkah pertama bekerja pada sistem tegangan tinggi adalah ...',['Menonaktifkan sistem sesuai prosedur','Menyentuh kabel','Mengisi baterai','Membuka jok','Menyalakan unit'],0,'Nonaktifkan lebih dulu.');
P(5,'Sarung tangan','Sarung tangan isolasi dipakai untuk ...',['Melindungi dari sengatan','Mempercepat kerja','Menjaga suhu','Menambah berat','Tidak perlu'],0,'Perlindungan dari sengatan.');
P(6,'Verifikasi','Verifikasi tidak bertegangan dilakukan dengan ...',['Alat ukur yang layak dan APD isolasi','Tangan kosong','Menyentuh kabel','Mata saja','Perkiraan'],0,'Alat ukur dan APD.');
P(7,'Latihan non-tegangan','Latihan non-tegangan dilakukan ...',['Di bawah pengawasan guru','Sendiri tanpa pengawasan','Di jalan raya','Tanpa APD','Dengan kabel terbuka'],0,'Pengawasan guru.');
P(8,'Kabel dilarang','Kabel tegangan tinggi tidak boleh disentuh sebelum ...',['Dinyatakan aman','Mesin hidup','Dicuci','Dipanaskan','Dibongkar'],0,'Dinyatakan aman dulu.');
P(9,'Service plug','Service plug atau pengaman dilepas ...',['Sesuai manual pabrikan','Sembarang','Dengan palu','Dengan kawat','Tanpa alasan'],0,'Manual pabrikan.');
P(10,'Baterai traksi','Baterai traksi diperiksa secara visual untuk melihat ...',['Bengkak, bocor, dan panas','Warna casing','Harga','Merek','Berat'],0,'Tanda bahaya baterai.');
P(11,'Konektor','Konektor yang longgar atau terbakar ...',['Harus diperiksa dan diperbaiki','Dibiarkan','Diberi lem','Dicat','Ditutup'],0,'Konektor harus diperbaiki.');
P(12,'Isolasi tergores','Isolasi kabel yang tergores ...',['Berisiko sengatan dan hubungan singkat','Menambah tenaga','Aman','Tidak berpengaruh','Menghemat listrik'],0,'Isolasi rusak berisiko.');
P(13,'Peringatan','Ketika peringatan sistem menyala, tindakan yang tepat adalah ...',['Memeriksa sesuai manual','Mengabaikannya','Menghapusnya','Menutupnya','Mengecatnya'],0,'Peringatan wajib diperiksa.');
P(14,'Tidak menyala','Unit tidak bisa menyala setelah diaktifkan ...',['Pemeriksaan dilakukan sesuai prosedur','Baterai langsung diganti tanpa cek','Diabaikan saja','Dipukul','Ditinggalkan'],0,'Pemeriksaan bertahap.');
P(15,'Pengosongan','Tegangan dibiarkan kosong sesuai ...',['Waktu pada manual','Perkiraan','Tidak perlu','Sebentar saja','Sesuka hati'],0,'Waktu sesuai manual.');
P(16,'Penanda','Tanda tegangan tinggi diberikan agar ...',['Tidak dihidupkan saat dikerjakan','Hanya hiasan','Stiker merek','Cat warna','Tidak perlu'],0,'Mencegah penghidupan.');
P(17,'Pengaman','Pengaman dilepas dengan ...',['Prosedur dan urutan pabrikan','Palu','Tang tanpa aturan','Kawat','Paksa'],0,'Urutan pabrikan.');
P(18,'Multimeter','Multimeter yang dipakai harus ...',['Memiliki rating sesuai','Sembarang','Rusak','Mainan','Tanpa rating'],0,'Rating yang sesuai.');
P(19,'Gejala tergores','Gejala isolasi kabel tergores adalah ...',['Isolasi rusak dan perlu diganti','Tenaga bertambah','Aman','Lampu terang','Warna baru'],0,'Isolasi rusak.');
P(20,'Mengapa dilarang','Mengapa kabel tegangan tinggi tidak boleh disentuh sembarangan?',['Karena dapat menyebabkan sengatan fatal','Karena membuat lampu redup','Karena menambah tenaga','Karena membuat ban kempes','Karena mengurangi oli'],0,'Sengatan fatal.');
P(21,'Latihan','Pada latihan ini, sistem tegangan tinggi berada ...',['Dalam keadaan tidak bertegangan','Dalam keadaan aktif','Dihidupkan','Dijumper','Dibongkar'],0,'Latihan non-tegangan.');
P(22,'Baterai bengkak','Baterai yang bengkak harus ...',['Dihentikan dan dilaporkan','Dipakai terus','Dipanaskan','Dipukul','Dicampur'],0,'Hentikan dan lapor.');
P(23,'Rem dan ban','Rem dan ban pada motor listrik ...',['Diperiksa kondisi dan fungsinya','Diabaikan','Dicat','Dipukul','Dibuang'],0,'Pemeriksaan dasar.');
P(24,'Konektor pengisian','Konektor dan kabel pengisian diperiksa ...',['Kondisi dan kekencangannya','Warnanya','Mereknya','Harganya','Beratnya'],0,'Kondisi dan kekencangan.');
P(25,'Penonaktifan tidak lengkap','Penonaktifan yang tidak lengkap ...',['Berpotensi menimbulkan bahaya','Aman','Mempercepat kerja','Tidak berpengaruh','Menambah tenaga'],0,'Bahaya.');
P(26,'Aktivasi kembali','Mengaktifkan kembali unit setelah pemeriksaan harus ...',['Sesuai prosedur dan dilaporkan','Langsung tanpa cek','Dengan jumper','Dengan palu','Tanpa laporan'],0,'Prosedur dan laporan.');
P(27,'Laporan bahaya','Bahaya yang ditemukan disampaikan kepada ...',['Guru atau penanggung jawab','Dirahasiakan','Dibuang','Diabaikan','Dicat'],0,'Pelaporan.');
P(28,'APD isolasi','APD isolasi terdiri dari ...',['Sarung tangan dan alas sesuai rating','Topi','Jas hujan','Sandal','Tanpa APD'],0,'APD isolasi.');
P(29,'Verifikasi wajib','Sebelum menyentuh bagian tegangan tinggi, wajib ...',['Memastikan tegangan nol dengan alat ukur','Menyentuh sebentar','Memastikan mesin hidup','Melepas baterai dengan paksa','Memanaskan'],0,'Verifikasi wajib.');
P(30,'Isolasi','Fungsi isolasi adalah ...',['Mencegah arus mengalir ke tubuh','Menambah arus','Menyimpan daya','Mengisi baterai','Mendinginkan'],0,'Isolasi melindungi.');
P(31,'Pemeliharaan','Pemeliharaan kendaraan listrik mengikuti ...',['Pedoman pabrikan','Tebakan','Iklan','Kebiasaan lama','Kata orang'],0,'Pedoman pabrikan.');
P(32,'Tindakan dilarang','Tindakan yang dilarang saat bekerja pada sistem tegangan tinggi adalah ...',['Menyentuh kabel sebelum dinyatakan aman','Memakai APD isolasi','Memeriksa tegangan dengan alat ukur','Menunggu pengosongan tegangan','Mengikuti prosedur pabrikan'],0,'Menyentuh tanpa cek.');
P(33,'Konektor bersih','Konektor yang bersih mencegah ...',['Kontak buruk','Tegangan naik','Perubahan rasio','Bunyi keras','Tidak ada efek'],0,'Kontak baik.');
P(34,'Inspeksi visual','Inspeksi visual baterai mencari ...',['Bengkak, bocor, dan panas','Warna casing','Harga','Merek','Berat'],0,'Tanda kerusakan.');
P(35,'Latihan motor listrik','Latihan motor listrik di sekolah dilakukan ...',['Hanya pada bagian non-tegangan','Dengan tegangan tinggi aktif','Dengan jumper','Di jalan raya','Dengan pembongkaran penuh'],0,'Non-tegangan.');
P(36,'Penanda unit','Penanda tegangan tinggi pada unit diperiksa agar ...',['Tidak tersentuh saat bekerja','Dapat dihidupkan','Dicat ulang','Dihias','Dijual'],0,'Keselamatan.');
P(37,'Peringatan sistem','Yang diperiksa saat peringatan sistem menyala adalah ...',['Kode atau pesan sesuai manual','Warna cat','Harga','Merek','Berat'],0,'Kode sesuai manual.');
P(38,'Pemahaman dasar','Kendaraan listrik memerlukan pemahaman tentang ...',['Bahaya tegangan tinggi','Bahan bakar','Oli mesin','Rantai','Busi'],0,'Bahaya tegangan tinggi.');
P(39,'Keberhasilan','Pemeriksaan dinyatakan baik jika ...',['Unit aman dan laporan lengkap','Warna cerah','Berat ringan','Harga murah','Tanpa laporan'],0,'Aman dan lengkap.');
P(40,'Kesimpulan','Kesimpulan pemeriksaan didasarkan pada ...',['Pemeriksaan dan manual pabrikan','Perkiraan','Tanpa catatan','Warna','Kebiasaan'],0,'Berbasis data.');

K(41,'Komponen nonaktif','Pilih komponen yang harus dinonaktifkan sebelum bekerja.',['Sistem tegangan tinggi','Kabel tegangan tinggi','Baterai traksi','Warna cat','Kursi'],[0,1,2],'Warna cat dan kursi tidak perlu.');
K(42,'Pemeriksaan visual','Pilih yang diperiksa secara visual.',['Kabel dan konektor','Baterai traksi','Isolasi kabel','Warna jok','Lampu depan'],[0,1,2],'Warna jok dan lampu bukan pemeriksaan kelistrikan.');
K(43,'APD','Pilih APD yang digunakan saat bekerja pada tegangan tinggi.',['Sarung tangan isolasi','Sepatu isolasi','Kacamata pelindung','Helm sepeda','Jas hujan'],[0,1,2],'Helm sepeda dan jas hujan bukan APD isolasi.');
K(44,'K3 listrik','Pilih tindakan K3 yang benar.',['Jangan sentuh kabel tegangan tinggi sebelum aman','Gunakan multimeter dengan rating sesuai','Pastikan tegangan nol sebelum bekerja','Sentuh kabel saat unit hidup','Jumper komponen tanpa prosedur'],[0,1,2],'Menyentuh saat hidup dan jumper dilarang.');
K(45,'Gejala','Pilih gejala yang perlu pemeriksaan.',['Isolasi kabel tergores','Konektor longgar','Baterai bengkak','Unit tidak menyala','Warna cat kusam'],[0,1,2,3],'Warna cat kusam bukan gejala teknis.');
K(46,'Pernyataan benar','Pilih pernyataan yang benar.',['Tegangan tinggi berbahaya','Prosedur nonaktif wajib diikuti','Verifikasi tegangan perlu alat ukur','Jumper boleh dipakai untuk mempercepat','Kabel tidak perlu diperiksa'],[0,1,2],'Jumper dan pengabaian kabel dilarang.');
K(47,'Latihan non-tegangan','Pilih ketentuan latihan non-tegangan.',['Dilakukan di bawah pengawasan guru','Memakai APD isolasi','Tidak menyentuh kabel tegangan tinggi','Dapat dilakukan tanpa APD','Dilakukan dengan kabel terbuka'],[0,1,2],'APD tetap wajib.');
K(48,'Pengaman','Pilih cara melepas pengaman sistem.',['Dilepas sesuai manual','Diberi tanda agar tidak dihidupkan','Dilakukan urut dan hati-hati','Dilepas dengan palu','Dilepas tanpa aturan'],[0,1,2],'Palu dan tanpa aturan dilarang.');
K(49,'Konsep isolasi','Pilih fungsi isolasi.',['Mencegah arus mengalir ke tubuh','Menjaga kabel tetap terlindung','Mencegah hubungan singkat','Mengalirkan arus ke massa','Menambah tegangan'],[0,1,2],'Mengalirkan ke massa bukan fungsi isolasi.');
K(50,'Dasar pemeriksaan','Pilih dasar pemeriksaan yang benar.',['Hasil ukur','Manual pabrikan','Perkiraan','Warna','Kebiasaan'],[0,1],'Perkiraan dan kebiasaan tidak sah.');

C(51,'Tegangan tinggi','Pernyataan berikut tentang sistem tegangan tinggi.',[['Sistem tegangan tinggi dinonaktifkan sebelum bekerja',true],['Kabel tegangan tinggi boleh disentuh tanpa verifikasi',false],['Verifikasi tidak bertegangan dilakukan dengan alat ukur',true]],'Verifikasi wajib.');
C(52,'Latihan','Pernyataan berikut tentang latihan.',[['Latihan non-tegangan dilakukan tanpa pengawasan',false],['Latihan non-tegangan dilakukan di bawah pengawasan guru',true],['Latihan memakai APD isolasi',true]],'Pengawasan.');
C(53,'Baterai traksi','Pernyataan berikut tentang baterai traksi.',[['Baterai traksi bengkak harus dihentikan pekerjaannya',true],['Baterai bengkak boleh dipakai terus',false],['Baterai diperiksa kondisi terminalnya',true]],'Baterai.');
C(54,'Jumper','Pernyataan berikut tentang jumper.',[['Jumper digunakan untuk mempercepat pengaktifan',false],['Jumper tanpa prosedur dilarang',true],['Jumper komponen berbahaya',true]],'Jumper.');
C(55,'Isolasi','Pernyataan berikut tentang isolasi kabel.',[['Isolasi kabel tergores perlu diperbaiki atau diganti',true],['Isolasi kabel tergores tidak berbahaya',false],['Isolasi kabel diperiksa dari kerusakan',true]],'Isolasi.');
C(56,'Pengaman','Pernyataan berikut tentang pengaman sistem.',[['Pengaman dilepas sesuai manual pabrikan',true],['Pengaman dilepas dengan palu',false],['Pengaman diberi tanda agar tidak dihidupkan',true]],'Pengaman.');
C(57,'Laporan','Pernyataan berikut tentang pelaporan.',[['Hasil pemeriksaan dilaporkan',true],['Hasil pemeriksaan disembunyikan',false],['Bahaya dilaporkan ke penanggung jawab',true]],'Laporan.');
C(58,'APD','Pernyataan berikut tentang APD.',[['Sarung tangan isolasi dipakai saat bekerja tegangan tinggi',true],['Sarung tangan isolasi tidak perlu dipakai',false],['APD disesuaikan dengan risiko',true]],'APD.');
C(59,'Konektor','Pernyataan berikut tentang konektor.',[['Konektor longgar harus diperiksa dan diperbaiki',true],['Konektor terbakar boleh dibiarkan',false],['Konektor dibersihkan agar kontak baik',true]],'Konektor.');
C(60,'Pemeliharaan','Pernyataan berikut tentang pemeliharaan.',[['Pemeliharaan mengikuti pedoman pabrikan',true],['Pemeliharaan mengikuti tebakan',false],['Hasil pemeliharaan dicatat',true]],'Pemeliharaan.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
