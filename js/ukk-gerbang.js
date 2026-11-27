/* ukk-gerbang.js: Gerbang praktik UKK untuk kelas X (UKK-X-1) dan kelas XI (UKK-XI-1). Dimuat setelah ukk-kelola.js, uji-waktu.js, ukk-foto.js, ukk-pdf.js.
   ATURAN (disamakan dengan gerbang masuk LKPD v2, lihat docs-LKPD-V2.md bagian 4A):
     - Gerbang = syarat kelayakan masuk praktik, BUKAN komponen nilai UKK. Berlaku untuk siswa (guru dan admin tidak terkunci).
     - 5 soal bentuk TKA: 3 PG, 1 PG kompleks, 1 PG kategori. Penilai soal sama dengan LKPD (lkqPoint): PG 1/0; kompleks dan kategori bernilai sebagian.
     - Nilai gerbang = jumlah poin / jumlah soal x 100 (bulat). Lulus bila nilai >= KKM gerbang = max(75, S.kkm). Soal belum dijawab bernilai 0.
     - Tanpa batas percobaan: siswa boleh mengubah jawaban sampai lulus. Kunci dan pembahasan tidak ditampilkan ke siswa (hanya ke guru di pratinjau).
     - Berlaku di mode Latihan dan Ujian. Gerbang dikerjakan SEBELUM unit dimulai, jadi tidak memakai waktu dan kesempatan ujian.
     - Siswa yang sudah punya pekerjaan berjalan (draf) tidak dihadang ulang.
   PENYIMPANAN: jawaban gerbang di perangkat (localStorage, per akun dan per unit), seperti penghitung kesempatan ujian: penegak di sisi aplikasi, bukan server.
   Nilai gerbang ikut ke rincian hasil unit (payload.gb) saat siswa menyimpan hasil, sehingga guru melihatnya di Hasil penilaian. Tidak ada perubahan skema Appwrite.
   Soal bawaan terikat ID unit; unit hasil Duplikat (ID baru) tidak membawa gerbang, tetapi guru dapat membuatnya di editor (js/ukk-gerbang-editor.js, maks. 20 soal). */
var UKG={KEY:'tbsm-ukk-gerbang-v1',KKM_MIN:75,MAX:20,job:null,jwb:{},fase:'soal',pv:false,ovr:null};
var UKK_GERBANG={
 'UKK-X-1':[
  {t:'pg',lvl:'Aplikasi',q:'Sebelum mengukur tegangan baterai sepeda motor 12 V dengan multimeter digital, selector dan colokan probe yang tepat adalah ...',
   o:['selector VAC rentang 20 V, probe merah di jack 10A dan probe hitam di COM','selector VDC pada rentang di atas 12 V (misalnya 20 V), probe merah di jack V dan probe hitam di COM','selector VDC rentang 200 mV agar pembacaan lebih teliti, probe merah di jack V','selector ohm (Ω) karena baterai memiliki hambatan dalam, probe merah di jack V','selector VDC rentang terkecil lebih dulu, lalu dinaikkan setelah probe menyentuh kutub baterai'],a:1,
   e:'Tegangan baterai adalah arus searah, jadi selector VDC pada rentang di atas 12 V, probe merah di jack V dan hitam di COM. Pengecoh: A memakai VAC dan jack arus; C rentang 200 mV terlalu kecil untuk 12 V; D ohmmeter hanya untuk rangkaian tanpa sumber; E rentang untuk besaran yang sudah diperkirakan dipilih lebih besar, bukan mencoba dari yang terkecil.'},
  {t:'pg',lvl:'Aplikasi',q:'Tegangan baterai tanpa beban diukur tiga kali: 12,52 V; 12,48 V; dan 12,50 V. Standar minimal 12,4 V. Rata-rata dan keputusan yang tepat adalah ...',
   o:['12,52 V; sesuai karena dipakai pembacaan pertama','12,48 V; tidak sesuai karena ada bacaan di bawah 12,5 V','12,50 V; sesuai karena rata-rata tiga kali ukur di atas 12,4 V','37,50 V; sesuai karena ketiga bacaan dijumlahkan','12,50 V; baterai lemah karena belum mencapai 12,6 V'],a:2,
   e:'Rata-rata = (12,52 + 12,48 + 12,50) ÷ 3 = 12,50 V, di atas 12,4 V sehingga Sesuai. Pengecoh: A memakai satu bacaan; B memakai batas yang bukan standar; D menjumlah, bukan merata-rata; E memakai batas yang bukan standar unit ini.'},
  {t:'pg',lvl:'Penalaran',q:'Seorang siswa mengukur arus rangkaian lampu. Selector sudah di rentang ampere, lalu kedua probe langsung disentuhkan ke kutub positif dan negatif baterai. Akibat yang paling mungkin dan cara pemasangan yang benar adalah ...',
   o:['aman karena ammeter mengukur arus langsung dari sumber sehingga hasilnya paling teliti','bacaan nol karena ammeter hanya bekerja pada tegangan di atas 24 V','lampu menyala lebih terang karena ada arus tambahan yang mengalir melalui ammeter','aman karena ammeter yang dipasang paralel hanya membaca tegangan baterai','terjadi hubung singkat dengan arus sangat besar sehingga fuse alat dapat putus atau kabel panas; ammeter harus dipasang seri dengan beban pada rentang arus terbesar'],a:4,
   e:'Ammeter berhambatan sangat kecil. Dipasang paralel pada sumber ia menjadi hubung singkat: arus sangat besar, fuse multimeter putus, kabel dan baterai panas. Ammeter dipasang seri dengan beban, rentang arus terbesar lebih dulu, rangkaian berfuse. Pengecoh A sampai D mengabaikan bahaya hubung singkat.'},
  {t:'kompleks',lvl:'Penalaran',q:'Hambatan filamen lampu depan diukur dengan ohmmeter, lalu dibandingkan dengan hasil R = V ÷ I saat lampu menyala. Pilih semua pernyataan yang benar.',
   o:['Lampu dilepas dari sumber tegangan lebih dulu karena ohmmeter memakai sumber sendiri dan tegangan luar membuat bacaan salah atau merusak alat.','Kedua probe disentuhkan lebih dulu untuk mencatat nol alat, lalu nilai itu diperhitungkan pada hasil ukur.','Ohmmeter boleh dipasang pada rangkaian yang sedang menyala selama selector berada pada rentang tertinggi.','Hambatan filamen saat menyala (V ÷ I) umumnya lebih besar daripada hasil ohmmeter saat dingin, sehingga selisihnya perlu dijelaskan.','Hambatan kabel dan sambungan yang baik harus terbaca sekitar 100 Ω agar arus tidak berlebihan.'],a:[0,1,3],
   e:'Benar: A (ohmmeter hanya pada rangkaian tanpa sumber), B (nol alat dicatat), D (filamen panas berhambatan lebih besar daripada saat dingin). Salah: C (tegangan luar merusak ohmmeter); E (kabel baik terbaca mendekati nol, maksimal 1 Ω).'},
  {t:'kategori',lvl:'Penalaran',q:'Pada rangkaian lampu 12 V diperoleh data: tegangan baterai tanpa beban rata-rata 12,2 V; tegangan terminal lampu menyala 10,9 V; hambatan kabel dan sambungan 0,4 Ω. Tentukan setiap pernyataan Benar atau Salah.',
   rows:[['Baterai 12,2 V berada di bawah standar minimal 12,4 V sehingga dilaporkan sebagai baterai lemah dan tindak lanjutnya dicatat.',true],['Penurunan tegangan dari baterai ke terminal lampu menyala adalah 1,3 V.',true],['Hambatan kabel 0,4 Ω melebihi batas maksimal 1 Ω sehingga kabel wajib diganti.',false],['Tegangan baterai cukup diukur satu kali karena hasil pengukuran selalu sama.',false],['Keputusan Sesuai atau Tidak sesuai dibandingkan dengan standar manual servis atau penguji, bukan dugaan.',true]],lab:['Benar','Salah'],
   e:'Benar: 12,2 V < 12,4 V; 12,2 - 10,9 = 1,3 V; keputusan memakai standar. Salah: 0,4 Ω masih di bawah batas 1 Ω; pengukuran diulang tiga kali dan dirata-rata karena bacaan bisa berbeda.'}
 ],
 'UKK-XI-1':[
  {t:'pg',lvl:'Aplikasi',q:'Lebar V-belt Honda Beat Pop diukur di empat titik: 18,1 mm; 17,9 mm; 17,4 mm; dan 18,0 mm. Lebar standar 18,5 mm dan batas servis 17,5 mm. Keputusan yang tepat adalah ...',
   o:['memakai kembali karena rata-rata keempat titik 17,85 mm masih di atas batas servis','memakai kembali karena tiga dari empat titik masih di atas batas servis','mengganti V-belt karena nilai terkecil 17,4 mm sudah di bawah batas servis 17,5 mm','mengganti V-belt karena semua titik lebih kecil daripada lebar standar 18,5 mm','memutar V-belt 180° agar titik yang menyempit tidak bergesekan dengan puli'],a:2,
   e:'V-belt diukur di beberapa titik dan nilai terkecil yang dibandingkan dengan batas servis: 17,4 mm < 17,5 mm, maka diganti. Pengecoh: A dan B melewatkan titik yang sudah aus; D memakai standar, bukan batas servis; E tidak memperbaiki keausan.'},
  {t:'pg',lvl:'Aplikasi',q:'Diameter dalam mangkok kopling CVT terukur 112,35 mm. Standar 112,0-112,2 mm dan batas servis 112,5 mm. Keputusan yang tepat adalah ...',
   o:['masih layak pakai karena belum melewati batas servis 112,5 mm; hasil ukur dicatat untuk dipantau','harus diganti karena sudah di luar rentang standar 112,0-112,2 mm','dibubut sampai masuk rentang standar 112,0-112,2 mm','diganti bersama kanvas karena selisih 0,15 mm dari standar sudah terlalu besar','layak pakai dan tidak perlu dicatat karena masih dalam batas'],a:0,
   e:'Keputusan ganti atau pakai memakai batas servis, bukan rentang standar. 112,35 mm belum melewati 112,5 mm sehingga layak pakai, dan nilainya dicatat agar dapat dipantau pada servis berikutnya. Pengecoh: B memakai standar; C membubut mengubah ukuran dan tidak diizinkan; D dan E tidak sesuai kaidah keputusan.'},
  {t:'pg',lvl:'Penalaran',q:'Pegas puli sekunder CVT tertekan kuat di dalam rumah kopling. Saat mur pengikatnya akan dilepas, tindakan yang paling aman dan benar adalah ...',
   o:['melepas mur dengan impact wrench agar pegas tidak sempat melonjak','menahan kopling dengan tangan lalu mengendurkan mur secara cepat','memanaskan rumah kopling agar pegas menjadi lunak sebelum mur dilepas','memasang SST kompresor pegas, memakai kacamata pelindung, lalu mengendurkan mur perlahan sambil menahan tekanan pegas','memukul mur dengan palu agar pegas mengendur sendiri'],a:3,
   e:'Pegas yang tertekan dapat terlontar dan melukai. SST kompresor menahan tekanan pegas, kacamata melindungi mata, dan mur dikendurkan perlahan. Pengecoh: A, B, dan E membuat pegas terlepas tiba-tiba; C memanaskan merusak sifat pegas dan tidak aman.'},
  {t:'kompleks',lvl:'Penalaran',q:'Pada pemeriksaan CVT ditemukan roller weight dan kanvas weight set clutch yang aus. Pilih semua pernyataan yang benar.',
   o:['Roller diganti satu set agar berat seragam dan gaya sentrifugal seimbang.','Cukup roller yang paling aus yang diganti karena selisih berat antarroller tidak berpengaruh.','Kanvas yang tebalnya di bawah batas servis 2,0 mm diganti, dan pegas diperiksa tidak patah atau lemah.','Kanvas yang berminyak cukup diamplas lalu dipakai kembali tanpa diukur tebalnya.','Mur puli dikencangkan dengan kunci torsi sesuai buku manual saat pemasangan.'],a:[0,2,4],
   e:'Benar: A (roller diganti sepaket), C (kanvas dinilai dari batas servis dan pegas diperiksa), E (kunci torsi sesuai manual). Salah: B (selisih berat menimbulkan getaran); D (kanvas berminyak tidak cukup diamplas, tebalnya tetap diukur dan sumber oli dicari).'},
  {t:'kategori',lvl:'Penalaran',q:'Sebuah skuter matik menghentak saat berangkat. Hasil ukur: lebar V-belt 17,2 mm; tebal kanvas 2,4; 2,2; dan 2,3 mm; panjang bebas per CVT 124,5 mm; diameter dalam mangkok kopling 112,1 mm. Batas servis: V-belt 17,5 mm, kanvas 2,0 mm, per CVT 124,7 mm, mangkok kopling 112,5 mm. Tentukan setiap pernyataan Benar atau Salah.',
   rows:[['V-belt harus diganti karena 17,2 mm sudah di bawah batas servis 17,5 mm.',true],['Kanvas harus diganti karena 2,2 sampai 2,4 mm lebih tipis daripada kanvas baru.',false],['Per CVT masih layak karena selisih dari panjang standar 127,5 mm hanya 3 mm.',false],['Mangkok kopling 112,1 mm layak pakai karena berada dalam rentang standar dan di bawah batas servis.',true],['Keputusan Layak pakai atau Ganti ditentukan dari batas servis dan alasannya dicatat.',true]],lab:['Benar','Salah'],
   e:'Benar: 17,2 < 17,5 mm; 112,1 mm di bawah 112,5 mm; keputusan memakai batas servis. Salah: kanvas masih di atas 2,0 mm sehingga layak; per CVT 124,5 mm sudah di bawah batas servis 124,7 mm sehingga diganti, bukan dinilai dari selisih terhadap standar.'}
 ]
};
/* Sumber soal, berurutan: (1) pratinjau draf editor, (2) gerbang buatan guru di unit (j.gerbang: {on,soal}), (3) soal bawaan UKK_GERBANG.
   Gerbang buatan guru yang dimatikan (on:false) berarti unit tidak bergerbang. Maksimal UKG.MAX soal; soal tidak sah dilewati. */
function ukgBersih(l){return (Array.isArray(l)?l:[]).filter(function(q){return typeof lkqValid==='function'?lkqValid(q):!!q}).slice(0,UKG.MAX)}
function ukgSoal(j){
 if(!j)return [];
 if(UKG.pv&&UKG.ovr&&UKG.ovr.id===j.id)return UKG.ovr.soal;
 var g=j.gerbang;
 if(g&&typeof g==='object')return g.on===false?[]:ukgBersih(g.soal);
 return UKK_GERBANG[j.id]||[];
}
/* Guru dan admin dapat mengatur gerbang unit kelas X dan XI (bawaan, buatan sendiri, dan hasil duplikat). */
function ukgBisa(j){return !!(j&&j.ukk&&isStaff()&&(j.kelas==='X'||j.kelas==='XI'))}
/* Tanda tangan isi soal (jenis, teks, pilihan, kunci; tanpa pembahasan): jawaban untuk soal lama tidak dibaca sebagai jawaban soal baru. */
function ukgSig(soal){
 var s=JSON.stringify((soal||[]).map(function(q){return [lkqType(q),q.q,q.o||null,q.rows||null,q.a===undefined?null:q.a]})),h=5381;
 for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;
 return 'g'+(soal||[]).length+'-'+(h>>>0).toString(36);
}
function ukgPerlu(j){return !isStaff()&&ukgSoal(j).length>0}
function ukgKkm(){return Math.max(UKG.KKM_MIN,+(typeof S!=='undefined'&&S.kkm)||0)}
function ukgDb(){try{return JSON.parse(localStorage.getItem(UKG.KEY)||'{}')||{}}catch(e){return {}}}
function ukgUid(){return (typeof S!=='undefined'&&S.user&&S.user.id)?String(S.user.id):''}
function ukgRec(jid){var d=ukgDb()[ukgUid()];return (d&&d[jid])||null}
/* Rekaman jawaban yang masih cocok dengan soal sekarang. Rekaman lama tanpa tanda tangan hanya berlaku untuk soal bawaan. */
function ukgRecOk(j){
 var r=ukgRec(j.id);if(!r)return null;
 if(r.sig)return r.sig===ukgSig(ukgSoal(j))?r:null;
 return j.gerbang?null:r;
}
function ukgSimpanJwb(j){
 if(UKG.pv||!ukgUid())return;
 var db=ukgDb(),u=ukgUid();db[u]=db[u]||{};db[u][j.id]={jwb:UKG.jwb,ts:Date.now(),sig:ukgSig(ukgSoal(j))};
 try{localStorage.setItem(UKG.KEY,JSON.stringify(db))}catch(e){}
}
/* Nilai gerbang: poin soal TKA (lkqPoint) / jumlah soal x 100. Soal belum dijawab bernilai 0. */
function ukgNilai(soal,jwb){
 var n=0,poin=0,kkm=ukgKkm();jwb=jwb||{};
 soal.forEach(function(q,i){var a=jwb[i];if(lkqAnswered(q,a)){n++;poin+=lkqPoint(q,a)}});
 poin=Math.round(poin*100)/100;
 var nilai=soal.length?Math.round(poin/soal.length*100):0;
 return {n:n,total:soal.length,poin:poin,nilai:nilai,kkm:kkm,lulus:soal.length>0&&n===soal.length&&nilai>=kkm};
}
/* Lulus dihitung ulang dari jawaban tersimpan: KKM yang naik atau soal yang berubah ikut berlaku. */
function ukgInfo(j){var r=ukgRecOk(j);return r&&r.jwb?ukgNilai(ukgSoal(j),r.jwb):null}
function ukgLulus(j){var g=ukgInfo(j);return !!(g&&g.lulus)}
function ukgModeTeks(j){return j&&j.cfg&&j.cfg.mode==='ujian'?'ujian':'latihan'}

/* ---------- Tampilan ---------- */
(function(){var st=document.createElement('style');st.textContent=
'.ukg-ov{position:fixed;inset:0;z-index:1000;background:var(--bg,#fff);overflow:auto;-webkit-overflow-scrolling:touch}'+
'.ukg-box{max-width:720px;margin:0 auto;padding:14px 14px 90px;display:grid;gap:10px}'+
'.ukg-q p{margin:6px 0}.ukg-opt{display:flex;gap:8px;align-items:flex-start;padding:8px 6px;border-radius:8px;line-height:1.45;font-size:14px}'+
'.ukg-opt input,.ukg-yn input{width:22px;height:22px;flex:none;accent-color:var(--accent,#0a7)}'+
'.ukg-row{display:grid;gap:6px;padding:8px 0;border-top:1px solid var(--line,#ddd);font-size:14px;line-height:1.45}'+
'.ukg-yn{display:flex;gap:18px}.ukg-yn label{display:flex;align-items:center;gap:6px}'+
'.ukg-bar{position:sticky;bottom:0;padding:10px 0;background:var(--bg,#fff);display:flex;gap:8px}'+
'.ukg-kunci{border-left:4px solid var(--accent,#0a7);font-size:13.5px;line-height:1.5}';
document.head.appendChild(st)})();
function ukgEl(){return document.getElementById('ukg-ov')}
function ukgGambar(){
 var j=jobById(UKG.job);if(!j)return;
 var ov=ukgEl();
 if(!ov){ov=document.createElement('div');ov.id='ukg-ov';ov.className='ukg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Gerbang praktik');document.body.appendChild(ov);document.body.style.overflow='hidden'}
 ov.innerHTML=UKG.fase==='hasil'?ukgHasilHtml(j):ukgSoalHtml(j);
 ov.scrollTop=0;
}
function ukgBuka(j,pv){
 var r=pv?null:ukgRecOk(j);
 UKG.job=j.id;UKG.pv=!!pv;UKG.fase='soal';UKG.jwb=(r&&r.jwb)?JSON.parse(JSON.stringify(r.jwb)):{};
 ukgGambar();
}
function ukgTutup(){UKG.ovr=null;var ov=ukgEl();if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);document.body.style.overflow='';UKG.job=null}
function ukgJenis(q){var t=lkqType(q);return t==='kompleks'?'PG kompleks (pilih semua yang benar)':t==='kategori'?'PG kategori (tentukan '+esc(q.lab[0])+' atau '+esc(q.lab[1])+')':'Pilihan ganda'}
function ukgKartu(q,i){
 var a=UKG.jwb[i],t=lkqType(q),L='ABCDE',h='<section class="card ukg-q" data-i="'+i+'"><span class="label">Soal '+(i+1)+' · '+esc(q.lvl||'')+' · '+ukgJenis(q)+'</span><p>'+esc(q.q)+'</p>';
 if(t==='kategori'){
  h+=q.rows.map(function(r,k){
   var v=(a&&typeof a==='object')?a[k]:undefined,nm='ukg'+i+'_'+k;
   return '<div class="ukg-row"><span>'+esc(r[0])+'</span><span class="ukg-yn"><label><input type="radio" name="'+nm+'" value="1" data-ukg-in="'+i+'" data-k="'+k+'"'+(v===true?' checked':'')+'> '+esc(q.lab[0])+'</label>'+
    '<label><input type="radio" name="'+nm+'" value="0" data-ukg-in="'+i+'" data-k="'+k+'"'+(v===false?' checked':'')+'> '+esc(q.lab[1])+'</label></span></div>';
  }).join('');
 }else{
  h+=q.o.map(function(o,k){
   var ck=t==='kompleks'?(Array.isArray(a)&&a.indexOf(k)>-1):a===k;
   return '<label class="ukg-opt"><input type="'+(t==='kompleks'?'checkbox':'radio')+'" name="ukg'+i+'" value="'+k+'" data-ukg-in="'+i+'"'+(ck?' checked':'')+'><span><b>'+L.charAt(k)+'.</b> '+esc(o)+'</span></label>';
  }).join('');
 }
 return h+'</section>';
}
function ukgSoalHtml(j){
 var soal=ukgSoal(j),nl=ukgNilai(soal,UKG.jwb);
 return '<div class="ukg-box"><div class="row sb"><div><span class="label">Gerbang praktik'+(UKG.pv?' · pratinjau guru (tidak disimpan)':'')+'</span><h2>'+esc(j.judul)+'</h2></div><button type="button" class="btn small" data-ukg="tutup">Tutup</button></div>'+
  '<p class="note">'+esc(j.unit)+'. Jawab semua soal. Nilai gerbang minimal '+nl.kkm+' untuk membuka '+ukgModeTeks(j)+'. Boleh diulang sampai lulus. Gerbang adalah syarat kelayakan masuk praktik dan tidak masuk nilai UKK.</p>'+
  '<p class="note" id="ukg-prog">Terjawab '+nl.n+' dari '+nl.total+'</p>'+
  soal.map(ukgKartu).join('')+
  '<div class="ukg-bar"><button type="button" class="btn primary grow" data-ukg="kirim">Kirim jawaban</button></div></div>';
}
function ukgKunciTeks(q){
 var t=lkqType(q),L='ABCDE';
 if(t==='kompleks')return q.a.map(function(k){return L.charAt(k)}).join(', ');
 if(t==='kategori')return q.rows.map(function(r,k){return (k+1)+'='+(r[1]?q.lab[0]:q.lab[1])}).join('; ');
 return L.charAt(q.a);
}
function ukgHasilHtml(j){
 var soal=ukgSoal(j),nl=ukgNilai(soal,UKG.jwb),h='<div class="ukg-box"><div class="row sb"><div><span class="label">Hasil gerbang praktik'+(UKG.pv?' · pratinjau guru':'')+'</span><h2>'+esc(j.judul)+'</h2></div><button type="button" class="btn small" data-ukg="tutup">Tutup</button></div>'+
  '<div class="card"><div class="row sb"><span class="pill '+(nl.lulus?'ok':'bad')+'">'+(nl.lulus?'Lulus':'Belum lulus')+'</span><b class="mono">Nilai gerbang '+nl.nilai+'</b></div>'+
  '<p class="note">KKM gerbang '+nl.kkm+' · poin '+lkqFmt(nl.poin)+' dari '+nl.total+'</p>'+
  (nl.lulus?'<p>'+(UKG.pv?'Siswa yang lulus langsung dapat memulai '+ukgModeTeks(j)+'.':'Praktik terbuka. Ketuk tombol di bawah untuk memulai '+ukgModeTeks(j)+'.')+'</p>':'<p>Nilai gerbang belum mencapai KKM. Periksa kembali jawabanmu, boleh diubah dan dikirim ulang sampai lulus.</p>')+'</div>';
 if(UKG.pv)h+=soal.map(function(q,i){return '<div class="card ukg-kunci"><b>Soal '+(i+1)+' · kunci: '+esc(ukgKunciTeks(q))+'</b><p class="note">'+esc(q.e||'')+'</p></div>'}).join('');
 h+='<div class="ukg-bar">'+(nl.lulus&&!UKG.pv?'<button type="button" class="btn primary grow" data-ukg="mulai">Mulai '+ukgModeTeks(j)+'</button>':'<button type="button" class="btn primary grow" data-ukg="ulang">'+(UKG.pv?'Ulangi pratinjau':'Perbaiki jawaban')+'</button>')+'</div></div>';
 return h;
}

/* ---------- Kejadian ---------- */
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||t.dataset.ukgIn===undefined||!UKG.job)return;
 var j=jobById(UKG.job);if(!j)return;
 var soal=ukgSoal(j),i=+t.dataset.ukgIn,q=soal[i];if(!q)return;
 var ty=lkqType(q);
 if(ty==='kompleks'){
  var a=Array.isArray(UKG.jwb[i])?UKG.jwb[i].slice():[],v=+t.value,p=a.indexOf(v);
  if(t.checked&&p<0)a.push(v);if(!t.checked&&p>-1)a.splice(p,1);
  a.sort(function(x,y){return x-y});
  if(a.length)UKG.jwb[i]=a;else delete UKG.jwb[i];
 }else if(ty==='kategori'){
  var o=Object.assign({},UKG.jwb[i]||{});o[+t.dataset.k]=(t.value==='1');UKG.jwb[i]=o;
 }else UKG.jwb[i]=+t.value;
 ukgSimpanJwb(j);
 var el=document.getElementById('ukg-prog');if(el)el.textContent='Terjawab '+ukgNilai(soal,UKG.jwb).n+' dari '+soal.length;
});
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-ukg]');if(!b)return;
 var a=b.dataset.ukg,j;
 if(a==='pratinjau'){j=jobById(b.dataset.v);if(j&&isStaff()&&ukgSoal(j).length)ukgBuka(j,true);return}
 j=UKG.job?jobById(UKG.job):null;
 if(a==='tutup'){ukgTutup();return}
 if(!j)return;
 if(a==='kirim'){
  var nl=ukgNilai(ukgSoal(j),UKG.jwb);
  if(nl.n<nl.total){toast('Jawab semua soal dulu ('+nl.n+' dari '+nl.total+')');return}
  ukgSimpanJwb(j);UKG.fase='hasil';ukgGambar();
 }else if(a==='ulang'){
  if(UKG.pv)UKG.jwb={};
  UKG.fase='soal';ukgGambar();
 }else if(a==='mulai'){
  var id=j.id;ukgTutup();window.startExam(id);
 }
});

/* ---------- Pengait ke alur UKK ---------- */
/* Siswa tanpa pekerjaan berjalan dan belum lulus gerbang: tampilkan gerbang, bukan unit. Pesan kunci unit (jadwal, kesempatan) tetap lebih dulu. */
(function(){
 var s0=window.startExam;
 window.startExam=function(id,keep){
  var j=jobById(id);
  if(j&&!keep&&ukgPerlu(j)){
   var dr=(typeof ujiDraftGet==='function'&&S.user)?ujiDraftGet(id):null;
   if(!dr&&!ukgLulus(j)){
    var msg=typeof ukkKunci==='function'?ukkKunci(j):'';
    if(msg){toast(msg);return}
    ukgBuka(j,false);return;
   }
  }
  return s0.apply(this,arguments);
 };
 /* Kartu unit: siswa melihat status gerbang; guru mendapat tombol Pratinjau gerbang */
 var c0=window.ukkCardAction;
 window.ukkCardAction=function(j){
  var h=c0.apply(this,arguments);
  if(isStaff()){
   var bt=(ukgSoal(j).length?'<button type="button" class="btn small" data-ukg="pratinjau" data-v="'+esc(j.id)+'">Pratinjau gerbang</button>':'')+
    (ukgBisa(j)?'<button type="button" class="btn small" data-uge="buka" data-v="'+esc(j.id)+'">Editor gerbang</button>':'');
   return bt?h+'<div class="lks-acts">'+bt+'</div>':h;
  }
  if(!ukgSoal(j).length)return h;
  var g=ukgInfo(j);
  return (g&&g.lulus?'<span class="pill ok">Gerbang lulus · '+g.nilai+'</span> ':'<span class="pill warn">Gerbang praktik belum lulus</span> ')+h;
 };
 /* Nilai gerbang ikut ke rincian hasil unit (payload.gb) */
 var r0=window.ukkSimpanRincian;
 window.ukkSimpanRincian=function(n0){
  r0.apply(this,arguments);
  try{
   if(!V.job||!V.job.ukk||isStaff()||!ukgSoal(V.job).length)return;
   var g=ukgInfo(V.job);if(!g)return;
   S.results.slice(n0).forEach(function(r){
    if(r.jobId!==V.job.id||!r.payload)return;
    try{var d=JSON.parse(r.payload);d.gb={nilai:g.nilai,kkm:g.kkm,lulus:g.lulus};r.payload=JSON.stringify(d)}catch(e){}
   });
  }catch(e){}
 };
 /* Hasil penilaian (guru): jenis hasil diberi keterangan nilai gerbang */
 var t0=window.jenisTampil;
 window.jenisTampil=function(r){
  var s=t0.apply(this,arguments);
  try{if(r&&r.payload&&String(r.payload).indexOf('"gb"')>-1){var d=JSON.parse(r.payload);if(d.gb)s+=' · Gerbang '+d.gb.nilai}}catch(e){}
  return s;
 };
})();
