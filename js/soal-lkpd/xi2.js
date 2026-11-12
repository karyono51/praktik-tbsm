/* Bank soal TKA per unit LKPD: XI-2 Penggantian Pad Rem Cakram Depan. 40 PG, 10 PG kompleks, 10 PG kategori. */
(function(){
var U='XI-2',M='LKPD XI-2 Penggantian Pad Rem Cakram Depan',L=[];
function id(n){return 'lkxi2-'+(n<10?'0':'')+n}
function P(n,topik,q,o,k,b){var r=n%4,o2=o.map(function(x,i){return o[(i+r)%4]}),k2=(k-r+4)%4;L.push({id:id(n),tipe:'pg',mapel:M,topik:topik,unit:U,q:q,opts:o2,kunci:k2,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function K(n,topik,q,o,k,b){L.push({id:id(n),tipe:'kompleks',mapel:M,topik:topik,unit:U,q:q,opts:o,kunci:k,bahas:b,tujuan:'keduanya',kelas:'XI'})}
function C(n,topik,q,rows,b){L.push({id:id(n),tipe:'kategori',mapel:M,topik:topik,unit:U,q:q,rows:rows,lab:['Benar','Salah'],bahas:b,tujuan:'keduanya',kelas:'XI'})}

P(1,'Prinsip rem cakram','Rem cakram bekerja dengan cara ...',['Minyak rem mendorong piston ke pad yang menjepit piringan','Kabel menarik roda','Pegas menahan roda','Udara menekan roda'],0,'Tekanan minyak rem menggerakkan piston dan pad.');
P(2,'Pad aus','Pad rem yang sudah tipis harus ...',['Diganti sesuai batas servis','Ditambal lem','Diamplas','Dibiarkan'],0,'Pad di bawah batas servis wajib diganti.');
P(3,'Minyak rem','Minyak rem bersifat ...',['Higroskopis dan dapat merusak cat','Tahan air sepenuhnya','Padat seperti gemuk','Menyerap panas'],0,'Minyak rem menyerap air dari udara.');
P(4,'Minyak rem pad','Minyak rem yang mengenai pad menyebabkan ...',['Daya rem turun dan pad harus diganti','Rem makin kuat','Tidak ada efek','Ban lebih awet'],0,'Pad terkontaminasi kehilangan daya gesek.');
P(5,'Pemasangan pad','Sebelum memasang pad baru, piston kaliper ...',['Didorong kembali dengan pelan','Dibiarkan menonjol','Dipukul','Dilumasi dengan oli mesin'],0,'Piston didorong agar pad baru muat.');
P(6,'K3 kaliper','Tuas rem tidak boleh ditekan saat kaliper dilepas karena ...',['Piston dapat keluar dari silinder','Lampu rem menyala','Ban bocor','Rantai putus'],0,'Piston bisa terlepas.');
P(7,'Debu rem','Debu pad rem sebaiknya dibersihkan dengan ...',['Pembersih rem','Udara bertekanan','Air keras','Bensin'],0,'Pembersih rem lebih aman daripada udara.');
P(8,'Piringan','Piringan rem yang bergelombang menyebabkan ...',['Getaran dan rem tidak merata','Rem lebih ringan','Ban lebih awet','Tidak ada efek'],0,'Permukaan tidak rata menimbulkan getaran.');
P(9,'Gejala rem','Rem berdecit dapat disebabkan oleh ...',['Pad aus atau kotor','Ban penuh angin','Setang lurus','Lampu terang'],0,'Pad aus atau kotor menimbulkan bunyi.');
P(10,'Gejala rem','Tuas rem terasa lembek dapat disebabkan oleh ...',['Udara dalam sistem atau minyak rem kurang','Pad terlalu tebal','Rantai kencang','Lampu redup'],0,'Udara dan minyak kurang melemahkan tekanan.');
P(11,'Gejala rem','Rem seret terjadi ketika ...',['Piston tidak kembali dengan baik','Pad baru dipasang tepat','Minyak rem penuh','Roda bebas berputar'],0,'Piston macet membuat pad tetap menempel.');
P(12,'Level minyak rem','Level minyak rem diperiksa agar ...',['Berada di antara batas atas dan bawah','Penuh sampai tutup','Kosong total','Dicampur air'],0,'Level harus di rentang batas.');
P(13,'Kebocoran','Minyak rem yang berkurang drastis menunjukkan kemungkinan ...',['Kebocoran pada sistem','Pad terlalu tipis saja','Piringan baru','Tidak ada masalah'],0,'Penurunan drastis berarti kebocoran.');
P(14,'Uji rem','Uji rem sebelum motor dijalankan bertujuan untuk ...',['Memastikan rem bekerja normal','Menambah kecepatan','Menghemat bahan bakar','Mengecat rangka'],0,'Uji rem demi keselamatan.');
P(15,'Pelepasan kaliper','Kaliper dilepas dengan cara ...',['Melepas baut kaliper dan menopang tanpa meregangkan selang','Memotong selang','Memukul kaliper','Mengangkat dengan selang'],0,'Selang tidak boleh diregangkan.');
P(16,'Selang rem','Selang rem yang retak harus ...',['Diganti','Dilakban','Dicuci','Dibiarkan'],0,'Selang retak dapat bocor.');
P(17,'Minyak rem','Minyak rem tidak boleh terkena ...',['Pad dan piringan rem','Setang','Jok','Spion'],0,'Minyak mengurangi daya gesek.');
P(18,'Piston','Pemeriksaan piston dan karet debu bertujuan untuk melihat ...',['Kebocoran dan gerak piston','Warna jok','Ukuran rantai','Bunyi klakson'],0,'Piston dan karet debu menentukan kerja kaliper.');
P(19,'Uji fungsi','Setelah penggantian pad, rem diuji dengan ...',['Tuas ditekan dan roda diputar','Dibiarkan begitu saja','Diabaikan','Dilumasi gemuk'],0,'Uji fungsi memastikan rem bekerja.');
P(20,'Piringan','Piringan rem diperiksa keausan dan ...',['Alurnya','Warna bodi','Kilau cat','Berat ban'],0,'Alur dan keausan dicek.');
P(21,'Tuas keras','Tuas rem yang terasa keras dan tidak seret menandakan ...',['Sistem rem berfungsi normal','Pad sudah lepas','Minyak bocor','Tidak ada informasi'],0,'Tuas keras menandakan tekanan yang baik.');
P(22,'Pembersihan','Komponen rem tidak boleh dibersihkan dengan ...',['Oli atau gemuk','Pembersih rem khusus','Kain lap bersih','Sikat kering'],0,'Oli atau gemuk merusak daya gesek.');
P(23,'Pad terkontaminasi','Pad yang terkena oli harus ...',['Diganti karena daya rem turun','Dibiarkan kering sendiri','Dilumasi lagi','Ditambah gemuk'],0,'Pad yang terkontaminasi tidak boleh dipakai.');
P(24,'Bunyi rem','Bunyi tok pada rem depan dapat berasal dari ...',['Bearing atau fork yang longgar','Lampu depan','Spion','Klakson'],0,'Komponen depan yang longgar menimbulkan bunyi.');
P(25,'Penggantian pad','Penggantian pad sebaiknya dilakukan berdasarkan ...',['Ketebalan pad dan manual','Jadwal bulanan tanpa cek','Sembarang waktu','Tidak perlu dicatat'],0,'Keputusan berdasarkan pengukuran.');
P(26,'Higroskopis','Minyak rem yang higroskopis berarti ...',['Menyerap air dari udara','Menolak air','Menghasilkan panas sendiri','Tidak berpengaruh'],0,'Penyerapan air menurunkan titik didih.');
P(27,'Selang rem','Pemeriksaan selang rem mencakup ...',['Retak, bocor, dan kondisinya','Warna selang','Panjang selang saja','Bunyi selang'],0,'Kondisi selang yang diperiksa.');
P(28,'Gemuk','Gemuk pada piringan rem menyebabkan ...',['Daya rem berkurang','Rem makin kuat','Ban cepat aus','Tidak ada efek'],0,'Gemuk mengurangi gesekan yang dibutuhkan.');
P(29,'Persiapan','Hal pertama sebelum membongkar kaliper adalah ...',['Membaca manual dan menopang motor dengan aman','Menekan tuas rem','Melepas selang','Mencuci piringan dengan bensin'],0,'Persiapan dan keselamatan lebih dulu.');
P(30,'Pad baru','Pad baru yang dipasang harus ...',['Sesuai tipe dan ukuran kaliper','Dipilih bebas','Ukuran apa saja','Dibuat sendiri'],0,'Pad harus cocok dengan kaliper.');
P(31,'Keausan tidak rata','Keausan pad yang tidak rata dapat menandakan ...',['Masalah pada kaliper atau piston','Pelumasan rantai','Ban kurang angin','Lampu redup'],0,'Kaliper atau piston perlu diperiksa.');
P(32,'Pembersih rem','Pembersih rem digunakan untuk ...',['Membersihkan pad dan piringan dari kotoran','Menambah minyak rem','Mengecat kaliper','Melumasi rantai'],0,'Pembersih menjaga permukaan gesek.');
P(33,'Batas servis','Pad yang sudah melewati batas servis ...',['Harus diganti','Boleh dipakai terus','Diamplas','Ditambal'],0,'Batas servis wajib dipatuhi.');
P(34,'Pemeriksaan minyak','Pemeriksaan minyak rem dilakukan ...',['Dengan sistem dalam kondisi wajar sesuai manual','Setelah dipanaskan dengan api','Dengan air','Dengan oli mesin'],0,'Pemeriksaan sesuai manual.');
P(35,'Pompa tuas','Tujuan memompa tuas rem setelah pemasangan adalah ...',['Memastikan tekanan mengembalikan pad ke posisi kerja','Memanaskan minyak','Mengosongkan minyak','Menggerakkan rantai'],0,'Pompa tuas menggerakkan piston ke posisi kerja.');
P(36,'Piston kaliper','Piston kaliper didorong kembali agar ...',['Pad baru dapat dipasang','Rem makin kuat','Minyak menetes','Roda lepas'],0,'Ruang untuk pad baru tersedia.');
P(37,'Pin pad','Pin atau pengunci pad sebaiknya ...',['Dipasang sesuai urutan','Dibuang','Dicat','Diganti merek'],0,'Urutan pemasangan dijaga.');
P(38,'Torsi baut','Baut kaliper dikencangkan dengan ...',['Torsi spesifikasi','Sekuat tenaga','Palu','Tanpa kunci'],0,'Torsi sesuai mencegah kerusakan.');
P(39,'Hasil uji rem','Rem yang berfungsi baik memberikan ...',['Tuas keras dan roda berhenti dengan baik','Tuas lembek','Bunyi keras saja','Tidak ada respons'],0,'Respons rem menunjukkan kondisi baik.');
P(40,'Kesimpulan','Kesimpulan penggantian pad sebaiknya ...',['Didasarkan pada hasil pemeriksaan dan manual','Didasarkan perkiraan','Tidak dicatat','Berdasarkan warna pad'],0,'Kesimpulan wajib berdasarkan data.');

K(41,'Komponen rem','Pilih komponen rem cakram depan.',['Kaliper','Pad rem','Piringan rem','Kopling kering'],[0,1,2],'Kopling kering bukan komponen rem.');
K(42,'Tanda ganti pad','Pilih tanda pad perlu diganti.',['Ketebalan di bawah batas servis','Rem berdecit','Rem seret','Warna bodi pudar'],[0,1,2],'Warna bodi tidak berkaitan.');
K(43,'Keselamatan','Pilih tindakan keselamatan dalam pekerjaan rem.',['Menopang motor dengan stabil','Tidak menekan tuas saat kaliper dilepas','Memakai pembersih rem','Menghirup debu rem'],[0,1,2],'Menghirup debu rem berbahaya.');
K(44,'Gejala minyak rem','Pilih gejala yang berkaitan dengan minyak rem.',['Tuas lembek','Minyak rem berkurang','Rem seret','Ban oleng'],[0,1,2],'Ban oleng tidak berkaitan.');
K(45,'Piringan','Pilih pemeriksaan piringan rem.',['Keausan','Alur','Bergelombang','Warna bodi'],[0,1,2],'Warna bodi tidak diperiksa.');
K(46,'Minyak rem','Pilih pernyataan yang benar tentang minyak rem.',['Bersifat higroskopis','Dapat merusak cat','Tidak boleh terkena pad','Boleh dicampur air'],[0,1,2],'Minyak rem tidak boleh dicampur air.');
K(47,'Kontaminasi','Pilih bahan yang dapat mengotori pad.',['Oli','Gemuk','Minyak rem','Air hujan bersih'],[0,1,2],'Air hujan bersih tidak mengotori pad secara berarti.');
K(48,'Alat penggantian','Pilih alat untuk penggantian pad.',['Kunci pas','Kunci soket','Kunci torsi','Mesin las'],[0,1,2],'Mesin las tidak digunakan.');
K(49,'Pemeriksaan kaliper','Pilih bagian kaliper yang diperiksa.',['Piston dan karet debu','Baut kaliper','Selang rem','Lampu sein'],[0,1,2],'Lampu sein bukan bagian kaliper.');
K(50,'Setelah penggantian','Pilih tindakan setelah penggantian pad.',['Memeriksa level minyak rem','Menguji fungsi rem','Mencatat hasil','Melap tumpahan minyak'],[0,1,2,3],'Keempatnya termasuk tindakan lanjutan.');

C(51,'Minyak rem','Pernyataan berikut tentang minyak rem dan pad.',[['Pad yang terkena minyak rem perlu diganti',true],['Pembersih rem boleh diganti udara bertekanan',false],['Minyak rem bersifat higroskopis',true]],'Udara bertekanan bukan pembersih rem.');
C(52,'Tuas rem','Pernyataan berikut tentang tuas rem.',[['Tuas rem tidak boleh ditekan saat kaliper dilepas',true],['Tuas rem boleh ditekan kapan saja',false],['Piston dapat keluar bila tuas ditekan saat kaliper dilepas',true]],'Tuas tidak boleh ditekan.');
C(53,'Selang rem','Pernyataan berikut tentang selang rem.',[['Selang rem yang retak harus diganti',true],['Selang rem retak boleh dilakban',false],['Selang rem diperiksa dari kebocoran',true]],'Selang retak harus diganti.');
C(54,'Piringan','Pernyataan berikut tentang piringan rem.',[['Piringan bergelombang dapat menimbulkan getaran',true],['Piringan bergelombang membuat rem lebih ringan',false],['Piringan diperiksa keausannya',true]],'Piringan bergelombang mengganggu rem.');
C(55,'Level minyak','Pernyataan berikut tentang level minyak rem.',[['Level minyak rem diperiksa di antara batas atas dan bawah',true],['Level minyak rem boleh di bawah batas bawah',false],['Minyak rem yang berkurang drastis perlu diselidiki',true]],'Level di bawah batas berbahaya.');
C(56,'Uji rem','Pernyataan berikut tentang uji rem.',[['Rem diuji sebelum motor dijalankan',true],['Uji rem tidak perlu dilakukan',false],['Uji rem dilakukan dengan menekan tuas dan memutar roda',true]],'Uji rem penting.');
C(57,'Pelumasan','Pernyataan berikut tentang pelumasan.',[['Gemuk boleh dioleskan pada pad rem',false],['Gemuk pada piringan mengurangi daya rem',true],['Pelumas tidak boleh mengenai pad dan piringan',true]],'Gemuk merusak daya gesek.');
C(58,'Torsi','Pernyataan berikut tentang pengencangan baut.',[['Baut kaliper dikencangkan dengan torsi spesifikasi',true],['Baut kaliper dikencangkan sekuat tenaga',false],['Pengunci mur dipasang bila diperlukan',true]],'Torsi sesuai.');
C(59,'Pemeriksaan','Pernyataan berikut tentang pemeriksaan rem.',[['Bearing dan fork longgar dapat menimbulkan bunyi tok',true],['Bunyi tok selalu dari lampu depan',false],['Pemeriksaan dicatat dalam lembar kerja',true]],'Bunyi tok dari komponen depan.');
C(60,'Kesimpulan','Pernyataan berikut tentang kesimpulan.',[['Kesimpulan didasarkan pada hasil pemeriksaan',true],['Kesimpulan tidak perlu manual servis',false],['Hasil uji fungsi dicatat',true]],'Kesimpulan harus berdasarkan data.');

(window.SOAL_TKA=window.SOAL_TKA||[]);
Array.prototype.push.apply(window.SOAL_TKA,L);
})();
