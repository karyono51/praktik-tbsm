/* observasi-ukk.js: Lembar Observasi UKK, 4 lembar: Engine Injeksi (Vario KZR), Sistem CVT (Beat Pop), Sistem Rem (Supra X 125), Kelistrikan Bodi (Supra Fit).
   Untuk Admin dan Guru (penguji). Menu terpisah dari Observasi guru dan Observasi LKPD Praktik; berkas observasi.js tidak diubah.
   Penyimpanan: koleksi dan kunci yang sama dengan observasi lain (S.observasi, koleksi `observasi`) dengan tipe = 'ukk',
   sehingga sinkron Appwrite, antrean offline, hak akses (Admin semua, Guru miliknya), dan Cek sinkronisasi ikut berlaku. */
var OBU={
 meta:{tahun:'2026/2027',get satuan(){return schNama()},konsentrasi:'Teknik Bisnis Sepeda Motor',kode:'KM25.2.2.2',waktu:'20 Menit',penguji2:'Tim AHASS',unit:{vario:'Honda Vario KZR',cvt:'Honda Beat Pop',rem:'Honda Supra X 125 Karburator',bodi:'Honda Supra Fit'}},
 lembar:[{"k": "vario", "nama": "Observasi 1 · Engine Injeksi (Vario KZR)", "judul": "Perawatan Berkala Engine Injeksi 4 Tak (Honda Vario KZR)", "g": [{"g": "A. Persiapan", "t": [[1, "Memakai pakaian kerja dan APD (wearpack, sepatu, sarung tangan)", ""], [2, "Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan", ""], [3, "Memeriksa kondisi alat ukur sebelum dipakai", ""], [4, "Memposisikan sepeda motor dengan aman (standar tengah/dudukan)", ""]]}, {"g": "B. Proses kerja (16 item)", "t": [[5, "Memeriksa tegangan baterai", "Siswa mengukur tegangan baterai dengan voltmeter dan membandingkannya dengan 13,0–13,2 V."], [6, "Memeriksa dan mengganti oli mesin sesuai takaran", "Siswa menguras oli mesin lama dan mengisi oli baru sebanyak 0,8 L sesuai takaran."], [7, "Memeriksa dan mengganti oli transmisi matic (final drive)", "Siswa mengganti oli transmisi matic sebanyak 0,12 L sesuai takaran."], [8, "Membersihkan saringan oli (kasa dan sentrifugal)", "Siswa membersihkan kasa dan saringan sentrifugal hingga bersih dan tidak tersumbat."], [9, "Memeriksa level dan kondisi air radiator/coolant", "Siswa memeriksa level coolant berada di antara batas atas dan bawah pada 0,51 L."], [10, "Mengukur dan menyetel celah klep", "Siswa mengukur celah klep dan menyetelnya ke IN 0,10 ± 0,02 mm dan EX 0,24 ± 0,02 mm."], [11, "Memeriksa dan membersihkan filter udara", "Siswa memeriksa dan membersihkan filter udara hingga bersih, tidak sobek, dan tidak basah oli."], [12, "Memeriksa kondisi dan mengukur celah busi", "Siswa memeriksa kondisi busi dan mengukur celah busi 0,8–0,9 mm."], [13, "Memeriksa dan menyetel idle speed", "Siswa menyetel idle speed hingga 1.700 ± 100 rpm."], [14, "Memeriksa jarak main bebas throttle gas", "Siswa mengukur jarak main bebas handel gas dan memastikannya berada pada 2–6 mm."], [15, "Memeriksa saluran dan mengukur tekanan bahan bakar", "Siswa memeriksa saluran bahan bakar tidak bocor dan mengukur tekanan bahan bakar 294 kPa."], [16, "Memeriksa kode kerusakan sistem injeksi dan mereset kerusakan", "Siswa membaca kode kerusakan sistem injeksi dan mereset kerusakan hingga tidak ada kode tersisa."], [17, "Memeriksa kebocoran oli shock depan", "Siswa memeriksa shock depan dan memastikan tidak ada kebocoran oli."], [18, "Memeriksa kerja (tekan-lepas) shock depan", "Siswa menekan dan melepas shock depan dan memastikan kerjanya halus, tidak macet."], [19, "Memeriksa kebocoran shock belakang", "Siswa memeriksa shock belakang dan memastikan tidak ada kebocoran."], [20, "Memeriksa kerja shock belakang", "Siswa menekan dan melepas shock belakang dan memastikan kerjanya halus, tidak macet."]]}, {"g": "C. K3 dan lingkungan", "t": [[21, "Menerapkan K3 selama bekerja", ""], [22, "Menangani oli bekas dan limbah dengan benar", ""], [23, "Merapikan dan membersihkan area kerja serta alat setelah selesai", ""]]}, {"g": "D. Hasil dan waktu", "t": [[24, "Menyelesaikan pekerjaan dalam 20 menit", ""], [25, "Mengisi hasil pemeriksaan dengan jujur dan lengkap", ""], [26, "Menarik kesimpulan sesuai standar/spesifikasi", ""]]}]}, {"k": "cvt", "nama": "Observasi 2 · Sistem CVT (Beat Pop)", "judul": "Perawatan Berkala Sistem CVT (Honda Beat Pop)", "g": [{"g": "A. Persiapan", "t": [[1, "Memakai pakaian kerja dan APD (wearpack, sepatu, sarung tangan)", ""], [2, "Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan", ""], [3, "Memeriksa kondisi alat ukur sebelum dipakai", ""], [4, "Memposisikan sepeda motor dengan aman (standar tengah/dudukan)", ""]]}, {"g": "B. Proses kerja (9 item)", "t": [[5, "Melepas komponen CVT", "Siswa melepas komponen CVT sesuai prosedur tanpa merusak komponen."], [6, "V-belt (lebar dan keausan)", "Siswa mengukur lebar V-belt dan memastikannya di atas batas servis 17,5 mm (standar 18,5 mm)."], [7, "Roller weight (diameter dan keausan)", "Siswa mengukur diameter roller weight 17,92–18,08 mm dan menimbang bobotnya 15 g, di atas batas servis 17,3 mm."], [8, "Weight set clutch (kampas dan pegas)", "Siswa memeriksa tebal kampas kopling di atas 2,0 mm dan memastikan pegas tidak patah atau lemah."], [9, "Puli primer", "Siswa memeriksa ukuran boss dan bushing puli primer dalam batas servis sesuai buku manual."], [10, "Puli sekunder", "Siswa memeriksa ukuran boss dan bushing puli sekunder dalam batas servis sesuai buku manual."], [11, "Mangkok kopling CVT (diameter dalam dan keausan)", "Siswa mengukur diameter dalam mangkok kopling 112,0–112,2 mm, di bawah batas servis 112,5 mm."], [12, "Per CVT (panjang bebas dan kekenduran)", "Siswa mengukur panjang bebas per CVT 127,5 mm dan memastikannya di atas batas servis 124,7 mm."], [13, "Memasang komponen CVT", "Siswa memasang kembali komponen CVT sesuai prosedur dan mengencangkan baut sesuai torsi buku manual."]]}, {"g": "C. K3 dan lingkungan", "t": [[14, "Menerapkan K3 selama bekerja", ""], [15, "Menangani oli bekas dan limbah dengan benar", ""], [16, "Merapikan dan membersihkan area kerja serta alat setelah selesai", ""]]}, {"g": "D. Hasil dan waktu", "t": [[17, "Menyelesaikan pekerjaan dalam 20 menit", ""], [18, "Mengisi hasil pemeriksaan dengan jujur dan lengkap", ""], [19, "Menarik kesimpulan sesuai standar/spesifikasi", ""]]}]}, {"k": "rem", "nama": "Observasi 3 · Sistem Rem (Supra X 125)", "judul": "Perawatan Berkala Sistem Rem (Honda Supra X 125 Karburator)", "g": [{"g": "A. Persiapan", "t": [[1, "Memakai pakaian kerja dan APD (wearpack, sepatu, sarung tangan)", ""], [2, "Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan", ""], [3, "Memeriksa kondisi alat ukur sebelum dipakai", ""], [4, "Memposisikan sepeda motor dengan aman (standar tengah/dudukan)", ""]]}, {"g": "B. Proses kerja (13 item)", "t": [[5, "Drive chain dan sprocket", "Siswa mengukur kekenduran rantai 25–35 mm dan memeriksa kondisi sprocket."], [6, "Rem depan: jarak main bebas handel rem", "Siswa mengukur jarak main bebas handel rem depan dan memastikannya berada pada 10–20 mm."], [7, "Rem depan: ketebalan kampas rem (pad)", "Siswa mengukur ketebalan kampas rem depan dan memastikannya masih di atas batas servis."], [8, "Rem depan: kondisi dan ketebalan piringan (disc)", "Siswa mengukur tebal piringan depan 3,8–4,2 mm dan keolengan maksimal 0,30 mm, serta memastikan tebal tidak di bawah 3,0 mm."], [9, "Rem depan: level dan kondisi minyak rem", "Siswa memeriksa level minyak rem depan berada di antara batas dan tidak keruh."], [10, "Rem depan: kebocoran selang, kaliper, master rem", "Siswa memeriksa selang, kaliper, dan master rem depan dan memastikan tidak bocor."], [11, "Rem belakang: jarak main bebas pedal", "Siswa mengukur jarak main bebas pedal rem belakang dan memastikannya berada pada 20–30 mm."], [12, "Rem belakang: indikator keausan kampas", "Siswa memeriksa indikator keausan kampas rem belakang dan memastikan belum mencapai batas."], [13, "Rem belakang: penyetelan jarak main bebas", "Siswa menyetel jarak main bebas pedal rem belakang hingga 20–30 mm."], [14, "Rem belakang: diameter dalam tromol (jangka sorong)", "Siswa mengukur diameter dalam tromol dengan jangka sorong, 110,0 mm, di bawah batas servis 111,0 mm."], [15, "Sistem kemudi: kebebasan putaran stang", "Siswa memeriksa stang kemudi berputar halus ke kiri dan kanan serta tidak seret."], [16, "Sistem kemudi: kelonggaran bantalan kemudi", "Siswa memeriksa kelonggaran bantalan kemudi dan memastikannya tidak longgar serta tidak berbunyi."], [17, "Keolengan roda", "Siswa memeriksa keolengan roda dan memastikannya masih dalam batas servis sesuai buku manual."]]}, {"g": "C. K3 dan lingkungan", "t": [[18, "Menerapkan K3 selama bekerja", ""], [19, "Menangani oli bekas dan limbah dengan benar", ""], [20, "Merapikan dan membersihkan area kerja serta alat setelah selesai", ""]]}, {"g": "D. Hasil dan waktu", "t": [[21, "Menyelesaikan pekerjaan dalam 20 menit", ""], [22, "Mengisi hasil pemeriksaan dengan jujur dan lengkap", ""], [23, "Menarik kesimpulan sesuai standar/spesifikasi", ""]]}]}, {"k": "bodi", "nama": "Observasi 4 · Kelistrikan Bodi (Supra Fit)", "judul": "Perawatan Berkala Sistem Kelistrikan Bodi (Honda Supra Fit)", "g": [{"g": "A. Persiapan", "t": [[1, "Memakai pakaian kerja dan APD (wearpack, sepatu, sarung tangan)", ""], [2, "Menyiapkan alat dan bahan sesuai kebutuhan pekerjaan", ""], [3, "Memeriksa kondisi alat ukur sebelum dipakai", ""], [4, "Memposisikan sepeda motor dengan aman (standar tengah/dudukan)", ""]]}, {"g": "B. Proses kerja (10 item)", "t": [[5, "Lampu kepala: lampu jauh menyala", "Siswa mengaktifkan lampu jauh dan memastikan lampu menyala normal."], [6, "Lampu kepala: lampu dekat menyala", "Siswa mengaktifkan lampu dekat dan memastikan lampu menyala normal."], [7, "Lampu kepala: kondisi bohlam dan soket", "Siswa memeriksa daya bohlam sesuai buku manual dan memastikan soket tidak meleleh atau kotor."], [8, "Lampu sein: sein kanan", "Siswa mengaktifkan sein kanan dan memastikan menyala serta berkedip normal dengan bohlam 12 V 10 W."], [9, "Lampu sein: sein kiri", "Siswa mengaktifkan sein kiri dan memastikan menyala serta berkedip normal dengan bohlam 12 V 10 W."], [10, "Lampu sein: kondisi flasher", "Siswa memeriksa flasher dan memastikan lampu sein berkedip teratur."], [11, "Lampu sein: kondisi sakelar sein", "Siswa menguji sakelar sein dan memastikan berfungsi untuk kanan, kiri, dan netral."], [12, "Sistem starter: sakelar starter", "Siswa menekan sakelar starter dan memastikan ada kontinuitas."], [13, "Sistem starter: relay starter", "Siswa memeriksa kerja relay starter sesuai buku manual."], [14, "Sistem starter: kerja motor starter", "Siswa mengoperasikan motor starter dan memastikan berputar normal, tidak lemah."]]}, {"g": "C. K3 dan lingkungan", "t": [[15, "Menerapkan K3 selama bekerja", ""], [16, "Menangani oli bekas dan limbah dengan benar", ""], [17, "Merapikan dan membersihkan area kerja serta alat setelah selesai", ""]]}, {"g": "D. Hasil dan waktu", "t": [[18, "Menyelesaikan pekerjaan dalam 20 menit", ""], [19, "Mengisi hasil pemeriksaan dengan jujur dan lengkap", ""], [20, "Menarik kesimpulan sesuai standar/spesifikasi", ""]]}]}],lb:{}
};
/* Registri lembar: tiap lembar punya judul tugas, grup butir, dan daftar datar sendiri. Lembar lama (tanpa payload.lembar) = 'vario'. */
OBU.lembar.forEach(function(L){
 L.grup=L.g.map(function(g){return {g:g.g,items:g.t.map(function(t){return {id:'u'+t[0],no:t[0],t:t[1],d:t[2]}})}});
 L.flat=[];L.grup.forEach(function(g){g.items.forEach(function(i){i.g=g.g;L.flat.push(i)})});
 OBU.lb[L.k]=L;
});
function obuLb(k){return OBU.lb[k]||OBU.lb.vario}
function obuKey(r){var p=obsPay(r);return p.lembar&&OBU.lb[p.lembar]?p.lembar:'vario'}
var OU={mode:'list',d:null,view:null,q:'',lembar:'vario',kel:''};
ICO['observasi-ukk']=ICO.observasi;

/* Observasi bertipe 'ukk' tidak boleh muncul di daftar Observasi guru (obsTipe lama menganggap semua selain 'siswa' sebagai guru) */
obsTipe=function(r){return r&&r.tipe==='ukk'?'ukk':(r&&r.tipe==='siswa'?'siswa':'guru')};

/* Kriteria kesimpulan akhir dan nilai konversi: 91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, di bawah 61 Belum Kompeten. */
function obuKat(n){n=+n||0;return n>=91?'Sangat Kompeten':n>=75?'Kompeten':n>=61?'Cukup Kompeten':'Belum Kompeten'}
function obuPill(k){return k==='Sangat Kompeten'||k==='Kompeten'?'ok':k==='Cukup Kompeten'?'warn':'bad'}
/* Skala per aspek: 1 Belum Kompeten (<61), 2 Cukup Kompeten (61-74), 3 Kompeten (75-90), 4 Sangat Kompeten (91-100).
   Penguji memilih skala lalu mengisi nilai dalam rentangnya. Nilai akhir = jumlah nilai semua aspek / N. Payload v:2 (nilai + lvl). Data lama (tanpa v) = Kompeten/Belum Kompeten. */
var OBU_LVL=[null,{k:'Belum Kompeten',min:0,max:60,ket:'<61'},{k:'Cukup Kompeten',min:61,max:74,ket:'61-74'},{k:'Kompeten',min:75,max:90,ket:'75-90'},{k:'Sangat Kompeten',min:91,max:100,ket:'91-100'}];
function obuValid(l,v){var L=OBU_LVL[l];return !!L&&typeof v==='number'&&isFinite(v)&&v===Math.floor(v)&&v>=L.min&&v<=L.max}
function obuKet(l){var L=OBU_LVL[l];return L?L.k+': '+L.ket:'Pilih 1-4 sesuai kriteria'}
function obuHitung(src,lk){
 var F=obuLb(lk).flat,n=F.length,done=0,sum=0,kom=0,nl=(src&&src.nilai)||{},lv=(src&&src.lvl)||{},v2=!!src&&src.v===2;
 F.forEach(function(i){var v=nl[i.id];
  if(v2){if(obuValid(lv[i.id],v)){done++;sum+=v}}
  else if(v===1||v===0){done++;if(v===1)kom++}
 });
 var nilai=v2?(done?Math.round(sum/n):0):Math.round(kom/n*100),hasil=obuKat(nilai);
 return {n:n,done:done,sum:sum,kom:kom,belum:done-kom,nilai:nilai,ok:nilai>=75,hasil:hasil,v2:v2};
}
function obuVisible(){
 var L=(S.observasi||[]).filter(function(r){return r.tipe==='ukk'&&(can('observasi-semua')||(!!S.user&&r.pengamatId===S.user.id))});
 return L.sort(function(a,b){return String(b.tanggal).localeCompare(String(a.tanggal))||b.ts-a.ts});
}
function obuBaru(){return {id:'',lembar:OU.lembar,sel:'',nama:'',nis:'',kelas:Object.keys(KELAS)[0],tanggal:ymd(Date.now()),penguji:(S.user&&S.user.nama)||'',v:2,nilai:{},lvl:{},cat:{},catatan:''}}
function obuDraftDari(r){
 var p=obsPay(r),sel=(r.guruId&&S.users.some(function(u){return u.id===r.guruId}))?r.guruId:'__lain';
 return {id:r.id,lembar:obuKey(r),sel:sel,nama:sel==='__lain'?r.guru:'',nis:p.nis||'',kelas:r.kelas||Object.keys(KELAS)[0],tanggal:r.tanggal||ymd(Date.now()),penguji:p.penguji||r.pengamat||'',v:2,lama:p.v!==2,nilai:p.v===2?p.nilai:{},lvl:p.v===2?(p.lvl||{}):{},cat:p.cat,catatan:p.catatan||''};
}

/* ---- Tampilan ---- */
function viewObservasiUkk(){
 if(OU.mode==='form'&&OU.d)return obuFormView();
 if(OU.mode==='view'&&OU.view)return obuDetailView();
 if(OU.mode==='rekap')return obuRekapView();
 return obuListView();
}
function obuInfoCard(lk){
 var L=obuLb(lk),m=Object.assign({},OBU.meta,{judul:L.judul});
 return '<div class="card"><span class="label">Judul tugas</span><b>'+esc(m.judul)+'</b><div class="note">'+esc(m.satuan)+' · '+esc(m.konsentrasi)+' · Kode '+esc(m.kode)+' · Alokasi waktu '+esc(m.waktu)+' · Tahun pelajaran '+esc(m.tahun)+'</div></div>';
}
function obuListView(){
 var L=obuVisible(),q=OU.q.toLowerCase(),admin=can('observasi-semua');
 var F=L.filter(function(r){return !q||(r.guru+' '+r.kelas+' '+(r.pengamat||'')).toLowerCase().indexOf(q)>-1});
 var kom=L.filter(function(r){return (+r.skor||0)>=75}).length;
 var avg=L.length?Math.round(L.reduce(function(t,r){return t+(+r.skor||0)},0)/L.length):0;
 var cards=F.map(function(r){
  var kt=obuKat(r.skor);
  return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(r.guru)+'</h3><span class="pill '+obuPill(kt)+'">'+esc(kt)+'</span></div>'+
   '<div class="meta"><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div><div class="note">'+esc(obuLb(obuKey(r)).nama)+'</div>'+
   '<div class="row sb"><span class="note">'+(admin?'Penguji: '+esc(r.pengamat||'-'):'Observasi saya')+'</span><span class="mono" style="font-weight:600">Nilai '+(+r.skor||0)+'</span></div>'+
   '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="obu-view" data-v="'+esc(r.id)+'">Lihat</button><button type="button" class="btn small" data-act="obu-pdf" data-v="'+esc(r.id)+'">PDF</button>'+
   (obsBoleh(r)?'<button type="button" class="btn small" data-act="obu-edit" data-v="'+esc(r.id)+'">Ubah</button><button type="button" class="btn small danger" data-act="obu-del" data-v="'+esc(r.id)+'">Hapus</button>':'')+'</div></article>';
 }).join('');
 return '<div class="row sb"><div><h2>Observasi UKK</h2><p class="note">Lembar observasi praktik uji kompetensi keahlian. Hanya untuk Admin dan Guru.</p></div></div>'+'<label class="f">Lembar observasi<select id="obulb">'+OBU.lembar.map(function(L){return '<option value="'+L.k+'"'+(OU.lembar===L.k?' selected':'')+'>'+esc(L.nama)+'</option>'}).join('')+'</select></label>'+obuInfoCard(OU.lembar)+
  '<div class="stats"><div class="card"><span class="label">Observasi</span><b class="mono">'+L.length+'</b></div><div class="card"><span class="label">Kompeten ke atas</span><b class="mono">'+kom+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+avg+'</b></div></div>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="obu-new">+ Observasi baru</button>'+(L.length?'<button type="button" class="btn small" data-act="obu-rekap">Rekap nilai</button><button type="button" class="btn small" data-act="obu-xls">Excel rincian aspek</button>':'')+'</div>'+
  (L.length>3?'<label class="f">Cari<input id="obuq" type="search" value="'+esc(OU.q)+'" placeholder="Nama siswa, kelas, penguji"></label>':'')+
  '<div class="jobs">'+(cards||'<div class="card"><p class="muted">'+(L.length?'Tidak ada observasi yang cocok.':'Belum ada observasi. Ketuk <b>+ Observasi baru</b> untuk mulai.')+'</p></div>')+'</div>'+
  '<p class="note">'+(admin?'Admin melihat semua observasi.':'Anda hanya melihat observasi yang Anda isi sendiri.')+' '+(Cloud.on?'Data tersinkron ke Appwrite.':'Data tersimpan di peramban ini.')+'</p>';
}
function obuItemHtml(it,d){
 var l=d.lvl[it.id]||0,v=d.nilai[it.id],L=OBU_LVL[l],bad=!!l&&v!==undefined&&!obuValid(l,v);
 return '<div class="item" data-s="'+(l||'')+'"><div class="t" style="display:block"><b>'+it.no+'. '+esc(it.t)+'</b>'+(it.d?'<div class="note" style="font-style:italic;margin-top:3px">'+esc(it.d)+'</div>':'')+'</div>'+
  '<div class="seg rate" role="group" aria-label="Skor butir '+it.no+'">'+[1,2,3,4].map(function(k){return '<button type="button" data-act="obu-set" data-id="'+it.id+'" data-v="'+k+'" aria-pressed="'+(l===k)+'" title="'+OBU_LVL[k].k+'">'+k+'</button>'}).join('')+'</div>'+
  '<div class="note obu-ket'+(bad?' bad':'')+'">'+esc(obuKet(l))+'</div>'+
  '<input class="obu-nil" type="number" inputmode="numeric" step="1" data-id="'+it.id+'" '+(l?'min="'+L.min+'" max="'+L.max+'" placeholder="Nilai '+L.min+'-'+L.max+'"':'placeholder="Nilai" disabled')+' value="'+(v===undefined?'':esc(v))+'" aria-invalid="'+bad+'">'+
  '<input class="obu-cat" data-id="'+it.id+'" maxlength="300" placeholder="Keterangan (opsional)" value="'+esc(d.cat[it.id]||'')+'"></div>';
}
function obuFormView(){
 var d=OU.d,h=obuHitung(d,d.lembar),LB=obuLb(d.lembar);
 var gopt='<option value="">Pilih siswa</option>'+obsOrang('siswa').map(function(u){return '<option value="'+esc(u.id)+'"'+(d.sel===u.id?' selected':'')+'>'+esc(u.nama)+' ('+esc(u.kelas||'-')+')</option>'}).join('')+'<option value="__lain"'+(d.sel==='__lain'?' selected':'')+'>Lainnya (ketik nama)</option>';
 var kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(d.kelas===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var items=LB.grup.map(function(g){return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){return obuItemHtml(it,d)}).join('')}).join('');
 return '<div class="row sb"><h2>'+(d.id?'Ubah: ':'Baru: ')+'Observasi UKK</h2><button type="button" class="btn small" data-act="obu-cancel">Batal</button></div>'+obuInfoCard(d.lembar)+
  '<form class="card" data-form="obs-noop" onsubmit="return false">'+
  '<label class="f">Nama siswa<select data-obu="sel">'+gopt+'</select></label>'+
  (d.sel==='__lain'?'<label class="f">Nama siswa (manual)<input data-obu="nama" maxlength="120" value="'+esc(d.nama)+'"></label>':'')+
  '<div class="two"><label class="f">NIS<input data-obu="nis" maxlength="30" value="'+esc(d.nis)+'"></label><label class="f">Kelas<select data-obu="kelas">'+kopt+'</select></label></div>'+
  '<div class="two"><label class="f">Tanggal<input type="date" data-obu="tanggal" value="'+esc(d.tanggal)+'"></label><label class="f">Penguji<input data-obu="penguji" maxlength="120" value="'+esc(d.penguji)+'"></label></div></form>'+
  (d.lama?'<p class="note">Observasi ini dibuat dengan format lama (Kompeten / Belum Kompeten). Isi ulang setiap aspek dengan skala 1-4 sebelum menyimpan.</p>':'')+'<p class="note">Pilih skala 1-4 untuk setiap aspek, lalu isi nilai sesuai rentangnya: 1 Belum Kompeten (&lt;61), 2 Cukup Kompeten (61-74), 3 Kompeten (75-90), 4 Sangat Kompeten (91-100). Isi keterangan bila perlu.</p>'+items+
  '<div class="card"><div class="row sb"><span class="note">Terisi</span><b class="mono"><span id="obuprog">'+h.done+'</span> / '+h.n+'</b></div><div class="row sb"><span class="note">Jumlah / N · nilai</span><b class="mono" id="obunilai">'+obuRingkas(h)+'</b></div>'+
  '<p class="note">Nilai akhir = jumlah nilai semua aspek dibagi '+h.n+' (dibulatkan). Kesimpulan: 91-100 Sangat Kompeten, 75-90 Kompeten, 61-74 Cukup Kompeten, di bawah 61 Belum Kompeten.</p></div>'+
  '<div class="card"><label class="f">Catatan penguji<textarea data-obu="catatan" maxlength="800">'+esc(d.catatan)+'</textarea></label></div>'+
  '<div class="row"><button type="button" class="btn" data-act="obu-cancel">Batal</button><button type="button" class="btn primary grow" data-act="obu-save">Simpan observasi</button></div>';
}
function obuRingkas(h){return h.done?h.sum+' / '+h.n+' = '+h.nilai+(h.done>=h.n?' · '+h.hasil:''):'-'}
function obuSync(){if(!OU.d)return;var h=obuHitung(OU.d,OU.d.lembar),a=$('#obuprog'),b=$('#obunilai');if(a)a.textContent=h.done;if(b)b.textContent=obuRingkas(h)}
function obuDetailView(){
 var r=OU.view,p=obsPay(r),lk=obuKey(r),LB=obuLb(lk),h=obuHitung(p,lk),kt=obuKat(r.skor),m=Object.assign({},OBU.meta,{judul:LB.judul});
 var rows=LB.grup.map(function(g){return '<h3 class="obs-group">'+esc(g.g)+'</h3>'+g.items.map(function(it){
  var v=p.nilai[it.id],l=h.v2?((p.lvl||{})[it.id]||0):0,pill=h.v2?(l?'<span class="pill '+obuPill(OBU_LVL[l].k)+'">'+l+' · '+esc(OBU_LVL[l].k)+' · '+esc(v)+'</span>':'<span class="pill plain">-</span>'):'<span class="pill '+(v===1?'ok':v===0?'bad':'plain')+'">'+(v===1?'Kompeten':v===0?'Belum Kompeten':'-')+'</span>';
  return '<div class="card" style="gap:4px"><div class="row sb"><span>'+it.no+'. '+esc(it.t)+'</span>'+pill+'</div>'+(it.d?'<div class="note" style="font-style:italic">'+esc(it.d)+'</div>':'')+(p.cat[it.id]?'<div class="note">'+esc(p.cat[it.id])+'</div>':'')+'</div>'}).join('')}).join('');
 return '<div class="row sb"><h2>Detail observasi UKK</h2><button type="button" class="btn small" data-act="obu-back">Kembali</button></div>'+
  '<div class="card"><h3>'+esc(r.guru)+'</h3><div class="meta"><span>NIS '+esc(p.nis||'-')+'</span><span>Kelas '+esc(r.kelas)+'</span><span>'+esc(obsTgl(r.tanggal))+'</span></div>'+
  '<div class="note">'+esc(m.judul)+' · Kode '+esc(m.kode)+'</div><div class="note">Penguji: '+esc(p.penguji||r.pengamat||'-')+'</div>'+
  '<div class="row sb"><span class="pill '+obuPill(kt)+'">'+esc(kt)+'</span><b class="mono">Nilai '+(+r.skor||0)+(h.v2?' · jumlah '+h.sum+' / '+h.n:' · '+h.kom+'/'+h.n+' kompeten')+'</b></div></div>'+rows+
  (p.catatan?'<div class="card"><b>Catatan penguji</b><p>'+esc(p.catatan).replace(/\n/g,'<br>')+'</p></div>':'')+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary" data-act="obu-pdf" data-v="'+esc(r.id)+'">Unduh PDF</button>'+(obsBoleh(r)?'<button type="button" class="btn" data-act="obu-edit" data-v="'+esc(r.id)+'">Ubah</button>':'')+'</div>';
}

/* ---- Simpan, hapus ---- */
function obuSave(){
 var d=OU.d,h=obuHitung(d,d.lembar),LB=obuLb(d.lembar),nama='',gid='',kelas=d.kelas;
 if(d.sel==='__lain')nama=String(d.nama||'').trim();
 else if(d.sel){var u=S.users.find(function(x){return x.id===d.sel});if(u){nama=u.nama;gid=u.id}}
 if(!nama){toast('Pilih atau isi nama siswa');return}
 if(!d.tanggal){toast('Isi tanggal observasi');return}
 if(h.done<h.n){var ms=LB.flat.filter(function(i){return !obuValid(d.lvl[i.id],d.nilai[i.id])})[0];toast('Aspek '+(ms?ms.no:'')+' belum lengkap: pilih skala 1-4 dan isi nilai sesuai rentang ('+h.done+' dari '+h.n+' terisi)');return}
 var penguji=String(d.penguji||'').trim()||S.user.nama;
 var payload=JSON.stringify({v:2,nis:String(d.nis||'').trim(),penguji:penguji,nilai:d.nilai,lvl:d.lvl,cat:d.cat,catatan:String(d.catatan||'').trim(),kode:OBU.meta.kode,lembar:LB.k});
 var f={tipe:'ukk',guruId:gid,guru:nama.slice(0,120),mapel:LB.judul.slice(0,120),kelas:(KELAS[kelas]?kelas:Object.keys(KELAS)[0]),tanggal:d.tanggal,skor:h.nilai,kategori:h.hasil,payload:payload,pengamat:penguji.slice(0,120)};
 S.observasi=S.observasi||[];
 var rec=d.id?S.observasi.find(function(x){return x.id===d.id}):null;
 if(rec){Object.assign(rec,f);if(rec.r)rec.d=1}
 else S.observasi.push(Object.assign({id:uid(),ts:Date.now(),pengamatId:S.user.id},f));
 persist();OU.mode='list';OU.d=null;render();window.scrollTo(0,0);toast('Observasi tersimpan');
}
async function obuDelete(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||!obsBoleh(r))return;
 if(!(await uiConfirm('Hapus observasi UKK '+r.guru+' ('+obsTgl(r.tanggal)+')?\nTindakan ini tidak dapat dibatalkan.',{ok:'Hapus',danger:true})))return;
 if(Cloud.on&&r.r){if(navigator.onLine===false){toast('Hapus hanya bisa saat online');return}if(!(await Cloud.remove('observasi',id)))return}
 S.observasi=S.observasi.filter(function(x){return x.id!==id});persist();OU.mode='list';OU.view=null;render();toast('Observasi dihapus');
}

/* ---- Ekspor ---- */
function obuTglPanjang(t){
 try{var d=new Date(String(t)+'T00:00:00');if(isNaN(d))throw 0;return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}catch(e){return obsTgl(t)}
}
/* PDF mengikuti lembar UKK: kotak RAHASIA (kiri atas) dan Paket (kanan atas; acuan FORM_UKK.paket, semua lembar = P1), judul UKK, identitas, 13 kotak nomor peserta (NIS), tabel, pengesahan NILAI dan PENGUJI.
   Penguji 1 = nama akun yang mengisi (login), Penguji 2 = Tim AHASS. */
function obuPdf(id){
 var r=(S.observasi||[]).find(function(x){return x.id===id});if(!r||r.tipe!=='ukk'||!needP())return;
 var p=obsPay(r),lk=obuKey(r),LB=obuLb(lk),h=obuHitung(p,lk),m=OBU.meta,doc=new window.jspdf.jsPDF({unit:'mm',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();
 var tempat=(typeof FORM_UKK!=='undefined'&&FORM_UKK.tempat)||'Sumedang',tgl=obuTglPanjang(r.tanggal),paket='P'+String((typeof FORM_UKK!=='undefined'&&FORM_UKK.paket)||'1'),pg1=p.penguji||r.pengamat||'',pg2=m.penguji2,kat=obuKat(r.skor);
 /* Kop */
 doc.setLineWidth(.3).rect(14,10,44,9);
 doc.setFont('helvetica','normal').setFontSize(9).text('RAHASIA',36,16,{align:'center'});
 doc.rect(W-38,10,24,17);
 doc.setFontSize(8).text('Paket',W-26,16,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(13).text(paket,W-26,23,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(13).text('UJI KOMPETENSI KEAHLIAN',W/2,38,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text('TAHUN PELAJARAN '+m.tahun,W/2,45,{align:'center'});
 doc.setFont('helvetica','bold').setFontSize(11).text('LEMBAR OBSERVASI PRAKTIK',W/2,57,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text('UJIAN PRAKTIK KEJURUAN',W/2,63,{align:'center'});
 /* Identitas */
 doc.autoTable({startY:70,theme:'plain',styles:{fontSize:10,cellPadding:1,textColor:0},columnStyles:{0:{cellWidth:48}},body:[
  ['Satuan Pendidikan',': '+m.satuan],['Kompetensi Keahlian',': '+m.konsentrasi],['Kode',': '+m.kode],['Alokasi Waktu',': '+m.waktu],
  ['Tipe kendaraan',': '+(m.unit[lk]||'')],['Judul tugas',': '+LB.judul],['Nama Peserta',': '+(r.guru||'………………………………')],['Kelas',': '+r.kelas],['Tanggal',': '+tgl]]});
 var y=doc.lastAutoTable.finalY+4;
 doc.setFontSize(10).text('Nomor Peserta (NIS)',14,y+4);
 var nis=String(p.nis||'').toUpperCase().replace(/\s/g,''),bx=62,bw=6.5;
 for(var k=0;k<13;k++){doc.rect(bx+k*bw,y,bw,bw);if(nis[k])doc.setFontSize(10).text(nis[k],bx+k*bw+bw/2,y+4.6,{align:'center'})}
 y+=bw+6;
 /* Tabel aspek */
 var body=[];
 LB.grup.forEach(function(g){
  body.push([{content:g.g,colSpan:5,styles:{fontStyle:'bold',fillColor:235,halign:'left'}}]);
  g.items.forEach(function(it){var v=p.nilai[it.id],l=h.v2?((p.lvl||{})[it.id]||0):0;
   body.push([String(it.no),it.t+(it.d?'\n'+it.d:''),h.v2?(l?OBU_LVL[l].k:''):(v===1?'Kompeten':v===0?'Belum Kompeten':''),h.v2&&l?String(v):'',p.cat[it.id]||'']);
  });
 });
 doc.autoTable({startY:y,theme:'grid',styles:{fontSize:9,cellPadding:1.8,lineColor:60,lineWidth:.2,textColor:0,valign:'top'},
  headStyles:{fillColor:235,textColor:0,fontStyle:'bold',halign:'center',valign:'middle'},
  columnStyles:{0:{cellWidth:12,halign:'center'},2:{cellWidth:34,halign:'center'},3:{cellWidth:14,halign:'center'},4:{cellWidth:38}},
  head:[['No urut','Aspek yang diamati','Capaian','Nilai','Keterangan']],body:body});
 y=doc.lastAutoTable.finalY+5;
 /* Ringkasan dan catatan */
 if(y>H-30){doc.addPage();y=20}
 if(h.v2){doc.setFont('helvetica','normal').setFontSize(8).setTextColor(90).text('Rentang nilai: Belum Kompeten (<61) | Cukup Kompeten (61-74) | Kompeten (75-90) | Sangat Kompeten (91-100)',14,y+2);y+=6}
 doc.setFont('helvetica','normal').setFontSize(9).setTextColor(0).text((h.v2?'Jumlah nilai '+h.sum+' / '+h.n+' aspek = '+r.skor:'Kompeten '+h.kom+' dari '+h.n+' aspek = '+r.skor)+'. Kesimpulan: '+kat.toUpperCase()+'.',14,y+3);
 if(p.catatan){var lines=doc.splitTextToSize('Catatan: '+p.catatan,W-28);doc.text(lines,14,y+9);y+=lines.length*4.5}
 y+=14;
 /* Pengesahan: NILAI kiri, PENGUJI kanan (Penguji 1 dan Penguji 2 berdampingan) */
 if(y+62>H-16){doc.addPage();y=20}
 var bh=52,lx=14,lw=78,rx=W-14-86,rw=86,mid=rx+rw/2;
 doc.setFont('helvetica','bold').setFontSize(10).text('NILAI',lx+lw/2,y+6,{align:'center'});
 doc.rect(lx,y,lw,bh).line(lx,y+10,lx+lw,y+10);
 doc.setFont('helvetica','bold').setFontSize(16).text(String(r.skor),lx+lw/2,y+26,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(10).text(kat,lx+lw/2,y+36,{align:'center'});
 doc.setFontSize(9).text(tempat+', '+tgl,rx+rw,y-3,{align:'right'});
 doc.setFont('helvetica','bold').setFontSize(10).text('PENGUJI',rx+rw/2,y+6,{align:'center'});
 doc.setFont('helvetica','normal').setFontSize(9);
 doc.text('Penguji 1',rx+rw/4,y+17,{align:'center'});doc.line(rx+4,y+38,mid-4,y+38);
 doc.text('Penguji 2',mid+rw/4,y+17,{align:'center'});doc.line(mid+4,y+38,rx+rw-4,y+38);
 doc.setFontSize(8.5);
 /* nama penguji tepat di atas garis tanda tangan; baris kedua (nama panjang) naik ke atas */
 var n1=doc.splitTextToSize(pg1||'-',rw/2-8).slice(0,2),n2=doc.splitTextToSize(pg2,rw/2-8).slice(0,2);
 doc.text(n1,rx+rw/4,y+36.5-(n1.length-1)*4,{align:'center'});
 doc.text(n2,mid+rw/4,y+36.5-(n2.length-1)*4,{align:'center'});
 /* Footer: kiri paket-tahun pelajaran, tengah hak cipta, kanan PP. halaman/jumlah halaman */
 var np=doc.getNumberOfPages();
 for(var pg=1;pg<=np;pg++){doc.setPage(pg);doc.setFont('helvetica','normal').setFontSize(8).setTextColor(0);
  doc.text(paket+'-'+m.tahun,14,H-8);doc.text('Hak Cipta pada Kemendikdasmen',W/2,H-8,{align:'center'});doc.text('PP. '+pg+'/'+np,W-14,H-8,{align:'right'})}
 doc.save('Observasi_UKK_'+lk+'_'+slug(r.guru||'siswa')+'_'+r.tanggal+'.pdf');
}
function obuXls(){
 if(!needX())return;var all=obuVisible().slice().sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts});
 var sheets=[];
 OBU.lembar.forEach(function(LB){
  var L=all.filter(function(r){return obuKey(r)===LB.k});if(!L.length)return;
  var F=LB.flat,head=['No','Tanggal','Nama siswa','NIS','Kelas','Penguji'].concat(F.map(function(i){return i.no+'. '+i.t})).concat(['Jumlah nilai','Nilai','Hasil','Catatan']);
  var aoa=[head].concat(L.map(function(r,i){var p=obsPay(r),h=obuHitung(p,LB.k);
   return [i+1,r.tanggal,r.guru,p.nis||'',r.kelas,p.penguji||r.pengamat||''].concat(F.map(function(it){var v=p.nilai[it.id];return h.v2?(obuValid((p.lvl||{})[it.id],v)?v:''):(v===1?'K':v===0?'BK':'')})).concat([h.v2?h.sum:'',r.skor,obuKat(r.skor),p.catatan||''])}));
  sheets.push([LB.nama.replace(/[\\\/?*\[\]:\u00b7]/g,'').replace(/\s+/g,' ').slice(0,31),aoa,head.map(function(x,i){return i===2?24:i<6?14:i<6+F.length?10:i===6+F.length+3?36:14})]);
 });
 if(!sheets.length)return;
 book(sheets,'Rekap_Observasi_UKK');
}

/* ---- Rekap nilai ---- */
/* Satu baris per siswa; nilai tiap lembar diambil dari observasi terbaru pada lembar itu. Rata-rata dari lembar yang sudah dinilai. */
function obuRekapSumber(kel){return obuVisible().filter(function(r){return !kel||r.kelas===kel})}
function obuRekapData(kel){
 var M={},arr=[];
 obuRekapSumber(kel).sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts}).forEach(function(r){
  var key=r.guruId||(String(r.guru).trim().toLowerCase()+'|'+r.kelas),p=obsPay(r),lk=obuKey(r),o=M[key];
  if(!o){o=M[key]={key:key,nama:r.guru,nis:'',kelas:r.kelas,per:{}};arr.push(o)}
  if(p.nis)o.nis=p.nis;o.kelas=r.kelas;o.per[lk]={r:r,nilai:+r.skor||0,kat:obuKat(r.skor)};
 });
 arr.forEach(function(o){var ks=Object.keys(o.per);o.n=ks.length;o.avg=o.n?Math.round(ks.reduce(function(t,k){return t+o.per[k].nilai},0)/o.n):0;o.kat=obuKat(o.avg)});
 return arr.sort(function(a,b){return String(a.kelas).localeCompare(String(b.kelas))||String(a.nama).localeCompare(String(b.nama))});
}
function obuRekapView(){
 var R=obuRekapData(OU.kel),n=R.length,obs=R.reduce(function(t,o){return t+o.n},0),avg=n?Math.round(R.reduce(function(t,o){return t+o.avg},0)/n):0;
 var kopt='<option value="">Semua kelas</option>'+Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(OU.kel===k?' selected':'')+'>Kelas '+k+'</option>'}).join('');
 var per=OBU.lembar.map(function(LB){var xs=R.filter(function(o){return o.per[LB.k]});
  return '<div class="row sb"><span class="note">'+esc(LB.nama)+'</span><span class="mono">'+(xs.length?Math.round(xs.reduce(function(t,o){return t+o.per[LB.k].nilai},0)/xs.length)+' · '+xs.length+' siswa':'-')+'</span></div>'}).join('');
 var cards=R.map(function(o){
  var rows=OBU.lembar.map(function(LB){var x=o.per[LB.k];
   return '<div class="row sb"><span class="note">'+esc(LB.nama)+'</span>'+(x?'<span><b class="mono">'+x.nilai+'</b> <span class="pill '+obuPill(x.kat)+'">'+esc(x.kat)+'</span></span>':'<span class="muted">-</span>')+'</div>'}).join('');
  return '<article class="card job"><div class="row sb"><h3 class="grow">'+esc(o.nama)+'</h3>'+(o.n?'<span class="pill '+obuPill(o.kat)+'">'+esc(o.kat)+'</span>':'')+'</div>'+
   '<div class="meta"><span>Kelas '+esc(o.kelas)+'</span><span>NIS '+esc(o.nis||'-')+'</span></div>'+rows+
   '<div class="row sb"><span class="note">Rata-rata ('+o.n+' dari '+OBU.lembar.length+' lembar)</span><b class="mono">'+(o.n?o.avg:'-')+'</b></div></article>';
 }).join('');
 return '<div class="row sb"><div><h2>Rekap nilai Observasi UKK</h2><p class="note">Nilai terbaru tiap lembar per siswa. Rata-rata dihitung dari lembar yang sudah dinilai.</p></div><button type="button" class="btn small" data-act="obu-back">Kembali</button></div>'+
  '<label class="f">Kelas<select id="obukel">'+kopt+'</select></label>'+
  '<div class="stats"><div class="card"><span class="label">Siswa</span><b class="mono">'+n+'</b></div><div class="card"><span class="label">Observasi</span><b class="mono">'+obs+'</b></div><div class="card"><span class="label">Rata-rata</span><b class="mono">'+(n?avg:'-')+'</b></div></div>'+
  '<div class="card"><span class="label">Rata-rata per lembar</span>'+per+'</div>'+
  '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn small primary" data-act="obu-rekapxls"'+(n?'':' disabled')+'>Unduh rekap nilai (Excel)</button></div>'+
  '<div class="jobs">'+(cards||'<div class="card"><p class="muted">Belum ada observasi'+(OU.kel?' untuk kelas ini':'')+'.</p></div>')+'</div>';
}
function obuRekapXls(){
 if(!needX())return;var kel=OU.kel,R=obuRekapData(kel),L=obuRekapSumber(kel).sort(function(a,b){return String(a.tanggal).localeCompare(String(b.tanggal))||a.ts-b.ts});
 if(!L.length){toast('Belum ada data untuk diunduh');return}
 var m=OBU.meta,nm=OBU.lembar.map(function(x){return x.nama.replace(' · ',' - ')});
 var rek=[['No','Nama siswa','NIS','Kelas'].concat(nm).concat(['Lembar dinilai','Rata-rata','Kesimpulan'])].concat(R.map(function(o,i){
  return [i+1,o.nama,o.nis,o.kelas].concat(OBU.lembar.map(function(x){return o.per[x.k]?o.per[x.k].nilai:''})).concat([o.n,o.n?o.avg:'',o.n?o.kat:''])}));
 var dft=[['No','Tanggal','Nama siswa','NIS','Kelas','Lembar','Judul tugas','Penguji 1','Penguji 2','Jumlah nilai','Jumlah aspek (N)','Nilai','Kesimpulan','Catatan']].concat(L.map(function(r,i){
  var p=obsPay(r),lk=obuKey(r),h=obuHitung(p,lk);
  return [i+1,r.tanggal,r.guru,p.nis||'',r.kelas,obuLb(lk).nama.replace(' · ',' - '),obuLb(lk).judul,p.penguji||r.pengamat||'',m.penguji2,h.v2?h.sum:'',h.n,r.skor,obuKat(r.skor),p.catatan||'']}));
 var dist={};R.forEach(function(o){if(o.n)dist[o.kat]=(dist[o.kat]||0)+1});
 var n=R.length,avg=n?Math.round(R.reduce(function(t,o){return t+o.avg},0)/n):0;
 var info=[['Rekap Nilai Observasi UKK'],['Tahun pelajaran',m.tahun],['Satuan pendidikan',m.satuan],['Kompetensi keahlian',m.konsentrasi],['Kode',m.kode],['Kelas',kel||'Semua kelas'],['Jumlah siswa',n],['Jumlah observasi',L.length],['Rata-rata nilai siswa',n?avg:''],[],
  ['Kesimpulan (berdasarkan rata-rata siswa)','Jumlah siswa'],['Sangat Kompeten (91-100)',dist['Sangat Kompeten']||0],['Kompeten (75-90)',dist['Kompeten']||0],['Cukup Kompeten (61-74)',dist['Cukup Kompeten']||0],['Belum Kompeten (<61)',dist['Belum Kompeten']||0],[],
  ['Rata-rata per lembar','Rata-rata','Jumlah siswa']].concat(OBU.lembar.map(function(x,i){var xs=R.filter(function(o){return o.per[x.k]});return [nm[i],xs.length?Math.round(xs.reduce(function(t,o){return t+o.per[x.k].nilai},0)/xs.length):'',xs.length]}))
  .concat([[],['Catatan','Nilai akhir tiap observasi = jumlah nilai semua aspek / N. Rata-rata siswa = rata-rata nilai lembar yang sudah dinilai (observasi terbaru per lembar).'],['Penguji 1','Nama akun yang mengisi observasi'],['Penguji 2',m.penguji2]]);
 book([['Rekap Nilai',rek,[5,26,14,10,24,24,24,24,12,11,16]],['Daftar Observasi',dft,[5,12,26,14,10,24,44,22,14,12,14,8,16,36]],['Ringkasan',info,[40,22,14]]],'Rekap_Nilai_Observasi_UKK'+(kel?'_'+slug(kel):''));
}

/* ---- Aksi ---- */
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;if(a.indexOf('obu-')!==0)return;
 if(!can('observasi'))return;
 if(a==='obu-new'){OU.d=obuBaru();OU.mode='form';render();window.scrollTo(0,0)}
 else if(a==='obu-edit'){var r=(S.observasi||[]).find(function(x){return x.id===v});if(!r||r.tipe!=='ukk'||!obsBoleh(r))return;OU.d=obuDraftDari(r);OU.mode='form';render();window.scrollTo(0,0)}
 else if(a==='obu-view'){var r2=(S.observasi||[]).find(function(x){return x.id===v});if(!r2)return;OU.view=r2;OU.mode='view';render();window.scrollTo(0,0)}
 else if(a==='obu-back'){OU.mode='list';OU.view=null;render();window.scrollTo(0,0)}
 else if(a==='obu-cancel'){if(OU.d&&obuHitung(OU.d,OU.d.lembar).done&&!uiOk('obucancel','Batalkan observasi?\nIsian yang belum disimpan akan hilang.',b,{ok:'Batalkan',cancel:'Kembali',danger:true}))return;OU.mode='list';OU.d=null;render();window.scrollTo(0,0)}
 else if(a==='obu-set'&&OU.d){
  var sk=parseInt(v,10),id=b.dataset.id,card=b.closest('.item'),LV=OBU_LVL[sk],cur=OU.d.nilai[id];
  OU.d.lvl[id]=sk;if(!obuValid(sk,cur))delete OU.d.nilai[id];
  card.dataset.s=sk;$$('.seg button',card).forEach(function(x){x.setAttribute('aria-pressed',String(parseInt(x.dataset.v,10)===sk))});
  var ket=card.querySelector('.obu-ket'),inp=card.querySelector('.obu-nil');
  if(ket){ket.textContent=obuKet(sk);ket.classList.remove('bad')}
  if(inp){inp.disabled=false;inp.min=LV.min;inp.max=LV.max;inp.placeholder='Nilai '+LV.min+'-'+LV.max;if(!obuValid(sk,cur))inp.value='';inp.setAttribute('aria-invalid','false');inp.focus()}
  obuSync()}
 else if(a==='obu-save'&&OU.d)obuSave();
 else if(a==='obu-del')obuDelete(v);
 else if(a==='obu-pdf')obuPdf(v);
 else if(a==='obu-xls')obuXls();
 else if(a==='obu-rekap'){OU.mode='rekap';render();window.scrollTo(0,0)}
 else if(a==='obu-rekapxls')obuRekapXls();
});
document.addEventListener('input',function(e){
 var t=e.target;if(!OU.d||OU.mode!=='form')return;
 if(t.dataset&&t.dataset.obu&&t.tagName!=='SELECT')OU.d[t.dataset.obu]=t.value;
 else if(t.classList&&t.classList.contains('obu-cat'))OU.d.cat[t.dataset.id]=t.value;
 else if(t.classList&&t.classList.contains('obu-nil')){
  var nid=t.dataset.id,nl=OU.d.lvl[nid],raw=t.value;
  if(raw==='')delete OU.d.nilai[nid];else OU.d.nilai[nid]=Number(raw);
  var bd=raw!==''&&!obuValid(nl,OU.d.nilai[nid]),kt=t.closest('.item').querySelector('.obu-ket'),LN=OBU_LVL[nl];
  t.setAttribute('aria-invalid',String(bd));
  if(kt){kt.textContent=bd&&LN?'Nilai harus '+LN.min+'-'+LN.max+' ('+obuKet(nl)+')':obuKet(nl);kt.classList.toggle('bad',bd)}
  obuSync();
 }
});
document.addEventListener('change',function(e){
 var t=e.target;
 if(t.id==='obuq'){OU.q=t.value;render();return}
 if(t.id==='obukel'){OU.kel=t.value;render();return}
 if(t.id==='obulb'){OU.lembar=OBU.lb[t.value]?t.value:'vario';render();return}
 if(!OU.d||OU.mode!=='form'||!t.dataset||!t.dataset.obu)return;
 OU.d[t.dataset.obu]=t.value;
 if(t.dataset.obu==='sel'){var u=S.users.find(function(x){return x.id===t.value});if(u&&u.kelas&&KELAS[u.kelas])OU.d.kelas=u.kelas;render()}
});

/* ---- Menu, tab, dan tombol kembali ---- */
var _viewKatU=viewKatalog;
viewKatalog=function(){
 if(S.tab==='observasi-ukk'&&can('observasi'))return viewObservasiUkk();
 return _viewKatU.apply(this,arguments);
};
if(typeof NAVTABS!=='undefined'&&NAVTABS.indexOf('observasi-ukk')<0)NAVTABS.push('observasi-ukk');
var _renderU=render;
render=function(){
 _renderU.apply(this,arguments);
 try{
  if(!S.user||!can('observasi'))return;
  var sb=document.querySelector('.sbody');if(!sb||sb.querySelector('[data-v="observasi-ukk"]'))return;
  var cur=V.mode==='list'?S.tab:'';
  var html='<button type="button" class="srow" data-act="menu" data-v="observasi-ukk"'+(cur==='observasi-ukk'?' aria-current="page"':'')+'><span class="ico">'+svg(ICO['observasi-ukk'],22)+'</span><span class="st"><b>Observasi UKK</b><small>Lembar praktik skala 1-4 dan rekap nilai</small></span>'+svg(ICO.chev,18)+'</button>';
  var ks=sb.querySelectorAll('[data-v^="kelas:"]'),ref=ks.length?ks[ks.length-1]:null;
  if(ref)ref.insertAdjacentHTML('afterend',html);
  else{var chips=[].slice.call(sb.querySelectorAll('.chip')),sesi=chips.filter(function(c){return /Sesi/.test(c.textContent)})[0];if(sesi)sesi.insertAdjacentHTML('beforebegin',html);else sb.insertAdjacentHTML('beforeend',html)}
 }catch(err){}
};
window.addEventListener('load',function(){
 if(typeof bkBack!=='function')return;
 var b0=bkBack;
 bkBack=function(){
  if(S.user&&S.tab==='observasi-ukk'&&OU.mode!=='list'&&!document.querySelector('.ui-ov')){
   var c=document.querySelector('[data-act="obu-cancel"]');
   if(c){c.click();return}
   OU.mode='list';OU.d=null;OU.view=null;render();return;
  }
  return b0.apply(this,arguments);
 };
});
