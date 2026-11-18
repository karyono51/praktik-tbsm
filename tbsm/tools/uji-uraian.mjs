/* Uji impor soal uraian (rubrik, bobot, batas karakter): node tools/uji-uraian.mjs */
import fs from 'node:fs'; import vm from 'node:vm';
const ctx = { console, bsViewBank(){}, bsRerenderList(){}, document:{addEventListener(){}}, window:{}, $$(){return []}, BS_LABS:[['Benar','Salah'],['Sesuai','Tidak Sesuai']], BS_TIPE:{pg:'PG',kompleks:'PG kompleks',kategori:'PG kategori',uraian:'Uraian'}, BS_TUJ:{}, bsLabIdx:()=>0, bsLtr:(i)=>String.fromCharCode(65+i) };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL('../js/banksoal-io.js', import.meta.url),'utf8'), ctx);
const T=(n,c,i)=>console.log((c?'  ok   ':'  GAGAL ')+n+(c?'':' '+JSON.stringify(i)));
const base={mapel:'TBSM',q:'Jelaskan X'};
let b=ctx.bsioBuild({...base,rubrik:'Langkah | 4\nHasil | 6',kunci:'pedoman'},'uraian');
T('rubrik 2 kriteria: maks 10, bobot 2, batas 1500, kunci tersimpan',b.f&&b.f.maks===10&&b.f.bobot===2&&b.f.pj===1500&&b.f.kj==='pedoman'&&b.f.rub.length===2,b);
b=ctx.bsioBuild({...base,rubrik:'Langkah | 2,5\nHasil | 7.5',bobot:'3',pj:'800'},'uraian');
T('skor desimal koma dan titik, bobot 3, batas 800',b.f&&b.f.maks===10&&b.f.bobot===3&&b.f.pj===800,b);
T('tanpa rubrik ditolak',!!ctx.bsioBuild(base,'uraian').err);
T('format rubrik salah ditolak',/berformat/.test(ctx.bsioBuild({...base,rubrik:'tanpa skor'},'uraian').err||''));
T('skor 0 ditolak',/lebih dari 0/.test(ctx.bsioBuild({...base,rubrik:'a | 0'},'uraian').err||''));
T('7 kriteria ditolak',/maksimal 6/.test(ctx.bsioBuild({...base,rubrik:'a|1\nb|1\nc|1\nd|1\ne|1\nf|1\ng|1'},'uraian').err||''));
T('jumlah skor >100 ditolak',/maksimal 100/.test(ctx.bsioBuild({...base,rubrik:'a|60\nb|50'},'uraian').err||''));
T('bobot 20 ditolak',/Bobot/.test(ctx.bsioBuild({...base,rubrik:'a|5',bobot:'20'},'uraian').err||''));
T('batas karakter 50 ditolak',/Batas/.test(ctx.bsioBuild({...base,rubrik:'a|5',pj:'50'},'uraian').err||''));
T('bsioTipe: Uraian, essay, Esai',['Uraian','essay','Esai'].every(x=>ctx.bsioTipe(x)==='uraian'));
