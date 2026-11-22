/* akademik-data.js: data acuan bawaan untuk Administrasi Akademik (mata pelajaran, elemen CP, SKKNI, regulasi).
   Ditinjau 15 November 2026. Sumber:
   - Permendikbudristek 12/2024 tentang Kurikulum, diubah dengan Permendikdasmen 13/2025 (struktur kurikulum SMK/MAK).
   - Keputusan Kepala BSKAP 046/H/KR/2025 (16 Juli 2025) tentang Capaian Pembelajaran; Lampiran III: SMK/MAK. Mencabut 032/H/KR/2024.
   - CP Teknik Sepeda Motor (Fase F, konsentrasi keahlian) dan Dasar-Dasar Teknik Otomotif (Fase E, dasar program keahlian).
   - SKKNI Bidang Teknik Sepeda Motor: Kepmenaker 147 Tahun 2019 (kode unit G.45TSM01.xxx.2).
   Jam pelajaran (JP) sengaja dikosongkan: isi sesuai struktur kurikulum satuan pendidikan. Pemetaan elemen ke unit SKKNI bersifat awal dan dapat diubah. */
var AKD_REF={
 ta:'2026/2027',
 regulasi:[
  {k:'Kurikulum',t:'Permendikbudristek No. 12 Tahun 2024 tentang Kurikulum pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, sebagaimana diubah dengan Permendikdasmen No. 13 Tahun 2025 (8 dimensi profil lulusan, pembelajaran mendalam, Koding dan Kecerdasan Artifisial sebagai mata pelajaran pilihan, PKL sebagai mata pelajaran).'},
  {k:'Capaian Pembelajaran',t:'Keputusan Kepala BSKAP No. 046/H/KR/2025 (berlaku 16 Juli 2025) tentang Capaian Pembelajaran PAUD, Dasar, dan Menengah; Lampiran III untuk SMK/MAK. Mencabut Keputusan Kepala BSKAP No. 032/H/KR/2024.'},
  {k:'Spektrum keahlian',t:'Konsentrasi Keahlian Teknik Sepeda Motor, Program Keahlian Teknik Otomotif, Bidang Keahlian Teknologi Manufaktur dan Rekayasa. Dalam dokumen CP, mata pelajaran konsentrasi bernama Teknik Sepeda Motor (Fase F) dan dasar program keahlian bernama Dasar-Dasar Teknik Otomotif (Fase E).'},
  {k:'SKKNI',t:'Keputusan Menteri Ketenagakerjaan No. 147 Tahun 2019 tentang SKKNI Kategori Perdagangan Besar dan Eceran; Reparasi dan Perawatan Mobil dan Sepeda Motor, Bidang Teknik Sepeda Motor (55 unit kompetensi, kode G.45TSM01.001.2 sampai G.45TSM01.055.2). Menggantikan acuan lama Kepmenaker KEP.95/MEN/IV/2005.'},
  {k:'SKKNI pendukung',t:'Keputusan Menteri Ketenagakerjaan No. 97 Tahun 2018 (SKKNI Otomotif Kendaraan Ringan Roda 4) menjadi salah satu rujukan materi Dasar-Dasar Teknik Otomotif.'}
 ],
 catatan:'Rujukan ini ringkasan untuk keperluan administrasi. Periksa dokumen resmi di kurikulum.kemdikbud.go.id, jdih.kemnaker.go.id, dan sidia.kemenperin.go.id sebelum dipakai sebagai dasar keputusan.'
};

/* Katalog SKKNI Teknik Sepeda Motor (Kepmenaker 147/2019): kode pendek => judul unit. Kode lengkap: G.45TSM01.<nomor>.2 */
var AKD_SKKNI={
 '001':'Menyusun program kerja bengkel','002':'Melakukan kegiatan evaluasi kinerja bengkel','003':'Membuat program pemasaran bengkel',
 '004':'Merencanakan program pengembangan sumber daya manusia','005':'Melakukan handling complain','006':'Menyusun program peningkatan efisiensi pekerjaan bengkel',
 '007':'Menentukan harga untuk setiap jenis pekerjaan','008':'Menyusun program pengembangan bengkel','009':'Membuat laporan kinerja bengkel berdasarkan workshop performance parameter',
 '010':'Melakukan pengelolaan pekerjaan mekanik','011':'Melakukan supervisi pekerjaan','012':'Melakukan pengelolaan tools','013':'Membuat perencanaan pekerjaan mekanik',
 '014':'Menentukan jenis pekerjaan service sepeda motor','015':'Memberikan konsultasi teknis','016':'Menawarkan produk jasa, suku cadang dan aksesoris',
 '017':'Mengevaluasi hasil pekerjaan mekanik berdasarkan perintah kerja','018':'Melakukan perawatan karburator','019':'Melakukan perawatan sistem injeksi',
 '020':'Melakukan perawatan renggang klep','021':'Melakukan perawatan free play throttle gas','022':'Melakukan perawatan filter udara','023':'Melakukan perawatan sistem clutch/kopling',
 '024':'Melakukan pemeriksaan dan penggantian oli mesin, oli transmisi, dan filter oli','025':'Melakukan pemeriksaan sistem pelumasan mesin','026':'Melakukan perawatan busi',
 '027':'Melakukan perawatan sistem Continuously Variable Transmission (CVT)','028':'Melakukan perawatan sistem pendinginan','029':'Melakukan penggantian rantai roda',
 '030':'Melakukan pemeriksaan keolengan roda','031':'Melakukan perawatan sistem pengereman','032':'Melakukan perawatan sistem kemudi','033':'Melakukan perawatan sistem suspensi',
 '034':'Melakukan bongkar pasang cover body','035':'Melakukan Perawatan Sistem ABS (Anti Lock Braking System)','036':'Melakukan Penggantian Sistem ABS (Anti Lock Braking System)','037':'Melakukan Perawatan Combi Brake System (CBS)/Unified Brake System (UBS)',
 '038':'Melakukan Penggantian Combi Brake System (CBS)/Unified Brake System (UBS)','039':'Melakukan perawatan baterai','040':'Melakukan perawatan instrumen kelistrikan (sistem sinyal dan penerangan)',
 '041':'Melakukan perbaikan idling stop system (ISS)/stop and start system (SSS)','042':'Melakukan Perbaikan Sistem Alternating Current Generator (ACG)/Smart Motor Generator (SMG)','043':'Melakukan pemeriksaan chassis',
 '044':'Melakukan penggantian frame','045':'Melakukan penggantian sistem kemudi','046':'Melakukan penggantian swing arm','047':'Melakukan pelepasan dan pemasangan mesin',
 '048':'Melakukan pemeriksaan abnormal engine','049':'Melakukan perbaikan komponen mesin bagian atas (power section)','050':'Melakukan perbaikan clutch/kopling',
 '051':'Melakukan perbaikan komponen mesin pada bagian transmisi (transmission section)','052':'Melakukan perbaikan komponen mesin pada generator section',
 '053':'Melakukan pembersihan injector','054':'Menentukan jenis kerusakan sistem injeksi','055':'Mengoperasikan diagnostic tools'
};
function akSkkniKode(n){return 'G.45TSM01.'+n+'.2'}

/* Fokus aplikasi: mata pelajaran produktif/kejuruan. Mapel (dan elemen CP-nya) pada daftar ini dibawa sebagai bawaan dan dihitung pada
   pemeriksaan kelengkapan; mapel lain tetap bisa ditambah dengan mencentang Mapel produktif. */
var AKD_PRODUKTIF_ID=['m_ddo','m_tsm','m_pkl'];

/* Mata pelajaran umum, kejuruan, dan pilihan (struktur kurikulum SMK). tingkat kosong = semua tingkat. */
var AKD_MAPEL_UMUM=[
 {id:'m_pabp',kode:'UM-01',nama:'Pendidikan Agama dan Budi Pekerti',kelompok:'umum'},
 {id:'m_pan',kode:'UM-02',nama:'Pendidikan Pancasila',kelompok:'umum'},
 {id:'m_bind',kode:'UM-03',nama:'Bahasa Indonesia',kelompok:'umum'},
 {id:'m_pjok',kode:'UM-04',nama:'Pendidikan Jasmani, Olahraga, dan Kesehatan',kelompok:'umum'},
 {id:'m_sej',kode:'UM-05',nama:'Sejarah',kelompok:'umum'},
 {id:'m_seni',kode:'UM-06',nama:'Seni dan Budaya',kelompok:'umum'},
 {id:'m_mulok',kode:'UM-07',nama:'Muatan Lokal',kelompok:'umum'},
 {id:'m_mtk',kode:'KJ-01',nama:'Matematika',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan'},
 {id:'m_bing',kode:'KJ-02',nama:'Bahasa Inggris',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan'},
 {id:'m_info',kode:'KJ-03',nama:'Informatika',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan'},
 {id:'m_ipas',kode:'KJ-04',nama:'Projek Ilmu Pengetahuan Alam dan Sosial',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan',tingkat:['X']},
 {id:'m_kik',kode:'KJ-05',nama:'Kreativitas, Inovasi, dan Kewirausahaan',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan',tingkat:['XI','XII']},
 {id:'m_pkl',kode:'KJ-06',nama:'Praktik Kerja Lapangan',kelompok:'kejuruan',komponen:'Mata pelajaran kejuruan',tingkat:['XI','XII']},
 {id:'m_kka',kode:'PL-01',nama:'Koding dan Kecerdasan Artifisial',kelompok:'pilihan',komponen:'Mata pelajaran pilihan'}
];

/* Dasar Program Keahlian: Dasar-Dasar Teknik Otomotif (Fase E, kelas X). Tiap elemen CP menjadi mata pelajaran. */
var AKD_DDO={id:'m_ddo',kode:'DP-01',nama:'Dasar-Dasar Teknik Otomotif',kelompok:'kejuruan',komponen:'Dasar-Dasar Program Keahlian',fase:'E',tingkat:['X'],
 sumber:'CP Dasar-Dasar Teknik Otomotif Fase E (Kepka BSKAP 046/H/KR/2025, Lampiran III)'};
var AKD_DDO_ELEMEN=[
 {n:'Proses Bisnis Bidang Otomotif, Profesi, dan Peluang Usaha',kata:['bisnis','profesi','usaha']},
 {n:'Keselamatan dan Kesehatan Kerja, Lingkungan Hidup (K3LH), dan Budaya Kerja Industri',kata:['k3','keselamatan','budaya kerja']},
 {n:'Teknik Dasar Pemeliharaan dan Perbaikan Bidang Otomotif',kata:['pemeliharaan','perbaikan dasar','teknik dasar']},
 {n:'Gambar Teknik Otomotif',kata:['gambar teknik']},
 {n:'Peralatan dan Perlengkapan Tempat Kerja',kata:['alat','peralatan','perlengkapan','tools']},
 {n:'Pemeliharaan Komponen Otomotif',kata:['komponen']},
 {n:'Dasar Elektronika Otomotif',kata:['elektronika','multimeter','pematrian']},
 {n:'Dasar Sistem Hidrolik dan Pneumatik',kata:['hidrolik','pneumatik']}
];

/* Konsentrasi Keahlian: Teknik Sepeda Motor (Fase F, kelas XI-XII). Tiap elemen CP menjadi mata pelajaran. */
var AKD_TSM={id:'m_tsm',kode:'KK-01',nama:'Teknik Sepeda Motor',kelompok:'kejuruan',komponen:'Konsentrasi Keahlian',fase:'F',tingkat:['XI','XII'],
 sumber:'CP Teknik Sepeda Motor Fase F (Kepka BSKAP 046/H/KR/2025, Lampiran III); SKKNI Kepmenaker 147/2019'};
var AKD_TSM_ELEMEN=[
 {n:'Perawatan dan Perbaikan Engine Sepeda Motor',kata:['engine','mesin','karburator','klep','oli','busi','pelumas','pendingin','kepala silinder'],
  skkni:['018','019','020','021','022','024','025','026','028','047','048','049','052']},
 {n:'Perawatan dan Perbaikan Sasis Sepeda Motor',kata:['sasis','chassis','rem','suspensi','kemudi','roda','ban','cover body'],
  skkni:['030','031','032','033','034','035','036','037','038','043','044','045','046']},
 {n:'Perawatan dan Perbaikan Sistem Pemindah Tenaga Sepeda Motor',kata:['pemindah tenaga','kopling','transmisi','cvt','rantai','gearbox'],
  skkni:['023','027','029','050','051']},
 {n:'Perawatan dan Perbaikan Sistem Kelistrikan Sepeda Motor',kata:['kelistrikan','baterai','starter','pengisian','pengapian','lampu','sinyal'],
  skkni:['039','040','041','042']},
 {n:'Perawatan dan Perbaikan Sepeda Motor Listrik dan Hybrid',kata:['listrik','hybrid','hibrida','ev'],skkni:[],
  catatan:'Belum ada unit khusus pada SKKNI 147/2019. Rujuk SKKNI kendaraan listrik bila telah ditetapkan.'},
 {n:'Perawatan dan Perbaikan Engine Management System Sepeda Motor',kata:['ems','injeksi','fuel injection','ecu','diagnostic','sensor','scan'],
  skkni:['019','053','054','055']},
 {n:'Pengelolaan Bengkel dan Kewirausahaan Sepeda Motor',kata:['bengkel','wirausaha','service advisor','pelayanan','pemasaran'],
  skkni:['001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017']}
];
