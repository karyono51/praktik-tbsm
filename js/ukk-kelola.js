/* ukk-kelola.js: Kelola UKK untuk guru dan admin (diadaptasi dari modul LKPD).
   Penyimpanan: dokumen UKK ikut koleksi lkpd_modules (penanda jenis:'ukk'), jadi sinkronisasi Appwrite, antrean offline, dan izin
   label lkpdeditor sama persis dengan modul LKPD. Unit bawaan (UKK-1..4) boleh diedit: hasil edit disimpan sebagai dokumen penimpa.
   Pengaturan per unit: tampil/sembunyi, kesempatan mengerjakan, jadwal buka dan tutup. */
var UKM={edit:null,set:null,err:''};
var UKK_BASE=JOBS.filter(function(j){return j.ukk}).map(function(j){return j});
var UKK_ARSIP0=JOBS_ARSIP.slice();
function ukkIsBase(id){return UKK_BASE.some(function(j){return j.id===id})}
function ukkDocs(){return (S.lkpdModules||[]).map(function(m){
 var x=Object.assign({},m),p=null;
 if(x.payload&&typeof x.payload==='string'){try{p=JSON.parse(x.payload)}catch(e){}}
 if(p&&typeof p==='object'){delete p.payload;x=Object.assign({},p,x)}
 return x}).filter(function(x){return x.jenis==='ukk'})}
function ukkT(s){var t=s?new Date(s).getTime():0;return isNaN(t)?0:t}
function ukkFmt(s){var t=ukkT(s);return t?new Date(t).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
function ukkMakeJob(d,base){
 var f=Object.assign({},(base&&base.form)||FORM_UKK,d.form||{});
 var items=(d.items||[]).map(function(i,k){return {id:d.id+'-'+k,a:'R',no:k+1,t:String(i.t||''),std:String(i.std||''),k:!!i.k}});
 return {id:d.id,kelas:d.kelas,judul:d.title,unit:d.unit||'',menit:Number(d.duration)||20,ukk:true,skkni:d.skkni||'',form:f,items:items,
  cfg:{tampil:d.status==='published'&&d.active!==false,maxTry:Math.max(0,parseInt(d.maxTry,10)||0),buka:d.buka||'',tutup:d.tutup||''},
  custom:!base,dihapus:!!d.dihapus,diubah:!!base};
}
function ukkRebuild(){
 var docs=ukkDocs(),map={},arsip=[],order=[];
 UKK_BASE.forEach(function(j){
  var b=Object.assign({},j);b.cfg={tampil:true,maxTry:0,buka:'',tutup:''};map[j.id]=b;order.push(j.id)});
 docs.forEach(function(d){
  if(d.reset){return}
  var base=UKK_BASE.filter(function(j){return j.id===d.id})[0];
  var job=ukkMakeJob(d,base);
  if(!(d.id in map))order.push(d.id);
  map[d.id]=job;
 });
 var jobs=[];
 order.forEach(function(id){var j=map[id];if(j.dihapus)arsip.push(j);else jobs.push(j)});
 JOBS=jobs;
 JOBS_ARSIP=UKK_ARSIP0.concat(arsip);
}
/* LKPD tidak boleh ikut menampilkan dokumen UKK */
(function(){
 var r0=lkRefreshModules;
 window.lkRefreshModules=function(){r0.apply(this,arguments);LKPD_MODULES=LKPD_MODULES.filter(function(m){return m.jenis!=='ukk'});ukkRebuild()};
 try{lkRefreshModules()}catch(e){ukkRebuild()}
})();

/* ---- Aturan tampil untuk siswa ---- */
function ukkTampil(j){return !j.cfg||j.cfg.tampil!==false}
function ukkPakai(j){var id=S.user?S.user.id:'';return visibleResults().filter(function(r){return r.jobId===j.id&&(isStaff()||r.sid===id)}).length}
function ukkKunci(j){
 if(isStaff()||!j||!j.cfg)return '';
 if(!ukkTampil(j))return 'Unit ini belum dibuka oleh guru.';
 var n=Date.now(),b=ukkT(j.cfg.buka),t=ukkT(j.cfg.tutup);
 if(b&&n<b)return 'Belum dibuka. Dibuka '+ukkFmt(j.cfg.buka);
 if(t&&n>t)return 'Sudah ditutup sejak '+ukkFmt(j.cfg.tutup);
 if(j.cfg.maxTry>0&&ukkPakai(j)>=j.cfg.maxTry)return 'Kesempatan mengerjakan habis ('+j.cfg.maxTry+' kali).';
 return '';
}
function ukkSimpanDoc(d){
 S.lkpdModules=S.lkpdModules||[];
 delete d.payload;
 var i=S.lkpdModules.findIndex(function(x){return x.id===d.id}),old=i>=0?S.lkpdModules[i]:null;
 d.jenis='ukk';d.updatedAt=Date.now();d.updatedBy=S.user.username||S.user.id;d.r=old&&old.r?1:0;d.d=1;
 if(i<0)S.lkpdModules.push(d);else S.lkpdModules[i]=d;
 lkSaveModules();lkRefreshModules();
}
function ukkDocOf(id){return ukkDocs().filter(function(x){return x.id===id})[0]||null}
/* Susun dokumen dari job (untuk unit bawaan yang belum pernah diedit) */
function ukkDocFromJob(j){
 return {id:j.id,jenis:'ukk',title:j.judul,kelas:j.kelas,fase:(KELAS[j.kelas]||{}).fase||'F',unit:j.unit,duration:j.menit,skkni:j.skkni||'',
  form:Object.assign({},j.form),items:j.items.map(function(i){return {t:i.t,std:i.std,k:!!i.k}}),
  status:j.cfg&&j.cfg.tampil===false?'draft':'published',active:!(j.cfg&&j.cfg.tampil===false),maxTry:j.cfg?j.cfg.maxTry:0,buka:j.cfg?j.cfg.buka:'',tutup:j.cfg?j.cfg.tutup:''};
}
function ukkJobBy(id){return JOBS.filter(function(j){return j.id===id})[0]||null}

/* ---- Tampilan ---- */
function ukkItemsText(j){return (j.items||[]).map(function(i){return i.t+' | '+i.std+(i.k?' | wajib':'')}).join('\n')}
function ukkParseItems(txt){
 return String(txt||'').split('\n').map(function(x){return x.trim()}).filter(Boolean).map(function(l){
  var p=l.split('|').map(function(x){return x.trim()});
  var k=false;if(p.length>=3&&/^(wajib|1|ya|y|true)$/i.test(p[p.length-1])){k=true;p.pop()}
  return {t:p[0]||'',std:p.slice(1).join(' | '),k:k};
 });
}
function ukkField(n,label,v,wide,type,extra){return '<label class="f'+(wide?' wide':'')+'">'+label+'<input data-ukm="'+n+'" type="'+(type||'text')+'" value="'+esc(v==null?'':v)+'"'+(extra||'')+'></label>'}
function ukkEditPanel(){
 var d=UKM.edit;if(!d)return '';
 var kopt=Object.keys(KELAS).map(function(k){return '<option value="'+k+'"'+(d.kelas===k?' selected':'')+'>'+esc(KELAS[k].judul)+'</option>'}).join('');
 var f=d.form||{};
 return '<section class="card" id="ukm-edit"><div class="row sb"><h2 class="grow">'+(d.baru?'UKK baru':'Edit '+esc(d.id))+'</h2><button type="button" class="btn small" data-act="ukm-batal">Batal</button></div>'+
  (UKM.err?'<div class="err" role="alert">'+esc(UKM.err)+'</div>':'')+
  '<div class="formgrid">'+
  ukkField('title','Judul unit',d.title,1)+ukkField('unit','Tipe kendaraan / unit',d.unit,1)+
  '<label class="f">Kelas<select data-ukm="kelas">'+kopt+'</select></label>'+
  ukkField('duration','Alokasi waktu (menit)',d.duration,0,'number',' min="1" max="600" inputmode="numeric"')+
  ukkField('skkni','Kode SKKNI (opsional)',d.skkni,0)+'</div>'+
  '<h3>Identitas pada lembar UKK</h3><div class="formgrid">'+
  ukkField('f_satuan','Sekolah / satuan pendidikan',f.satuan,1)+ukkField('f_konsentrasi','Konsentrasi keahlian',f.konsentrasi,1)+
  ukkField('f_kode','Kode',f.kode)+ukkField('f_tahun','Tahun pelajaran',f.tahun)+ukkField('f_bentuk','Bentuk',f.bentuk,1)+'</div>'+
  '<label class="f wide">Butir pemeriksaan (satu baris satu butir)<textarea data-ukm="items" rows="12" spellcheck="false" placeholder="Komponen | Standar manual | wajib">'+esc(d.itemsText)+'</textarea></label>'+
  '<p class="note">Format: <b>Komponen | Standar manual</b>. Tambahkan <b>| wajib</b> di akhir baris bila butir menyangkut keselamatan atau ketepatan kerja (satu butir wajib yang belum sesuai membuat hasil Belum Kompeten). Nomor otomatis mengikuti urutan baris.</p>'+
  '<div class="row"><button type="button" class="btn" data-act="ukm-batal">Batal</button><button type="button" class="btn primary grow" data-act="ukm-simpan">Simpan unit</button></div></section>';
}
function ukkSetPanel(){
 var d=UKM.set,j=d&&ukkJobBy(d.id);if(!d||!j)return '';
 var tries=[[0,'Tidak terbatas'],[1,'1 kali'],[2,'2 kali'],[3,'3 kali']].map(function(o){return '<option value="'+o[0]+'"'+(+d.maxTry===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('');
 return '<section class="card" id="ukm-set"><div class="row sb"><h3 class="grow">Pengaturan: '+esc(j.judul)+'</h3><button type="button" class="btn small" data-act="ukm-batal">Batal</button></div>'+
  '<label class="lk-check"><input type="checkbox" data-ukm-s="tampil"'+(d.tampil?' checked':'')+'><span><b>Tampilkan ke siswa</b><small>Matikan untuk menyembunyikan unit dari daftar siswa.</small></span></label>'+
  '<label class="f">Kesempatan mengerjakan (per siswa)<select data-ukm-s="maxTry">'+tries+'</select></label>'+
  '<div class="two"><label class="f">Dibuka (opsional)<input type="datetime-local" data-ukm-s="buka" value="'+esc(d.buka)+'"></label><label class="f">Ditutup (opsional)<input type="datetime-local" data-ukm-s="tutup" value="'+esc(d.tutup)+'"></label></div>'+
  '<div><button type="button" class="btn small" data-act="ukm-kosongjadwal">Kosongkan jadwal</button></div>'+
  '<label class="lk-check"><input type="checkbox" data-ukm-s="semua"'+(d.semua?' checked':'')+'><span><b>Terapkan kesempatan ke semua UKK '+esc(KELAS[j.kelas].judul)+'</b><small>Status tampil dan jadwal tidak ikut diubah.</small></span></label>'+
  '<p class="note">Waktu mengerjakan tetap '+j.menit+' menit. Waktu berjalan otomatis, tidak bisa dijeda, dan hasil dihitung otomatis saat waktu habis.</p>'+
  '<div class="row"><button type="button" class="btn" data-act="ukm-batal">Batal</button><button type="button" class="btn primary grow" data-act="ukm-simpan-set">Simpan pengaturan</button></div></section>';
}
window.ukkPanel=function(){return UKM.edit?ukkEditPanel():(UKM.set?ukkSetPanel():'')};
window.ukkTopBar=function(){
 if(!isStaff())return '';
 return '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="ukm-baru">+ UKK baru</button></div>';
};
window.ukkCardInfo=function(j){
 var c=j.cfg||{},tags='';
 if(isStaff()){
  tags='<span class="pill '+(ukkTampil(j)?'ok':'warn')+'">'+(ukkTampil(j)?'Tampil':'Tersembunyi')+'</span>'+
   (c.maxTry?'<span class="pill plain">'+c.maxTry+'× kesempatan</span>':'')+(c.buka?'<span class="pill plain">Buka '+esc(ukkFmt(c.buka))+'</span>':'')+(c.tutup?'<span class="pill plain">Tutup '+esc(ukkFmt(c.tutup))+'</span>':'')+
   (j.diubah?'<span class="pill plain">Diedit</span>':'')+(j.custom?'<span class="pill plain">Unit sendiri</span>':'');
 }else{
  if(c.maxTry)tags='<span class="pill plain">Kesempatan '+ukkPakai(j)+'/'+c.maxTry+'</span>';
  if(c.tutup)tags+='<span class="pill plain">Tutup '+esc(ukkFmt(c.tutup))+'</span>';
 }
 return tags?'<div class="lkm-tags" style="display:flex;flex-wrap:wrap;gap:6px">'+tags+'</div>':'';
};
window.ukkCardAction=function(j){
 var id=esc(j.id);
 if(isStaff()){
  return '<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="start" data-v="'+id+'">Nilai siswa</button>'+
   '<button type="button" class="btn small" data-act="ukm-edit" data-v="'+id+'">Edit</button>'+
   '<button type="button" class="btn small" data-act="ukm-set" data-v="'+id+'">Pengaturan</button>'+
   '<button type="button" class="btn small" data-act="ukm-dup" data-v="'+id+'">Duplikat</button>'+
   (j.diubah&&ukkIsBase(j.id)?'<button type="button" class="btn small" data-act="ukm-reset" data-v="'+id+'">Kembalikan bawaan</button>':'')+
   '<button type="button" class="btn small danger" data-act="ukm-hapus" data-v="'+id+'">Hapus</button></div>';
 }
 var msg=ukkKunci(j),sisa=ujiSisaDraft?ujiSisaDraft(j.id,j.menit):null;
 if(sisa!==null)return '<span class="pill warn">'+(sisa>0?'Waktu berjalan · sisa '+mmss(sisa):'Waktu habis')+'</span> <button type="button" class="btn primary small" data-act="start" data-v="'+id+'">'+(sisa>0?'Lanjutkan':'Lihat hasil')+'</button>';
 if(msg)return '<span class="pill warn">'+esc(msg)+'</span>';
 return '<button type="button" class="btn primary small" data-act="start" data-v="'+id+'">Mulai latihan</button>';
};

/* ---- Aksi ---- */
function ukkBacaEdit(){
 var d=UKM.edit;if(!d)return;
 $$('[data-ukm]').forEach(function(el){
  var n=el.dataset.ukm;
  if(n==='items')d.itemsText=el.value;
  else if(n.indexOf('f_')===0){d.form=d.form||{};d.form[n.slice(2)]=el.value}
  else d[n]=el.value;
 });
}
function ukkValid(d){
 var items=ukkParseItems(d.itemsText);
 if(!String(d.title||'').trim()||d.title.trim().length>180)return 'Judul wajib diisi (maks. 180 karakter).';
 if(!String(d.unit||'').trim())return 'Tipe kendaraan / unit wajib diisi.';
 if(!KELAS[d.kelas])return 'Kelas tidak valid.';
 var m=parseInt(d.duration,10);if(!(m>=1&&m<=600))return 'Alokasi waktu 1 sampai 600 menit.';
 if(!items.length)return 'Isi minimal satu butir pemeriksaan.';
 if(items.length>60)return 'Maksimal 60 butir per unit.';
 for(var i=0;i<items.length;i++){if(!items[i].t)return 'Baris '+(i+1)+': nama komponen kosong.';if(items[i].t.length>200||items[i].std.length>300)return 'Baris '+(i+1)+': terlalu panjang (komponen maks. 200, standar maks. 300 karakter).'}
 return '';
}
function ukkIdBaru(){return 'UKK-'+Date.now().toString(36).toUpperCase()}
function ukkFlush(){setTimeout(function(){try{if(Cloud.on)Cloud.flush()}catch(e){}},1500)}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v;
 if(a.indexOf('ukm-')!==0||!isStaff())return;
 e.stopPropagation();
 var j=v?ukkJobBy(v):null;
 if(a==='ukm-baru'){
  var f=Object.assign({},FORM_UKK);
  UKM.edit={baru:true,id:ukkIdBaru(),title:'',unit:'',kelas:S.kelas,duration:20,skkni:'',form:f,itemsText:'',status:'published',active:true};UKM.set=null;UKM.err='';render();window.scrollTo(0,0);
 }
 else if(a==='ukm-edit'&&j){
  UKM.edit={baru:false,id:j.id,title:j.judul,unit:j.unit,kelas:j.kelas,duration:j.menit,skkni:j.skkni||'',form:Object.assign({},j.form),itemsText:ukkItemsText(j)};UKM.set=null;UKM.err='';render();window.scrollTo(0,0);
 }
 else if(a==='ukm-dup'&&j){
  UKM.edit={baru:true,id:ukkIdBaru(),title:j.judul+' (salinan)',unit:j.unit,kelas:j.kelas,duration:j.menit,skkni:j.skkni||'',form:Object.assign({},j.form),itemsText:ukkItemsText(j)};UKM.set=null;UKM.err='';render();window.scrollTo(0,0);
 }
 else if(a==='ukm-set'&&j){
  var c=j.cfg||{};UKM.set={id:j.id,tampil:ukkTampil(j),maxTry:c.maxTry||0,buka:c.buka||'',tutup:c.tutup||'',semua:false};UKM.edit=null;render();window.scrollTo(0,0);
 }
 else if(a==='ukm-batal'){UKM.edit=null;UKM.set=null;UKM.err='';render()}
 else if(a==='ukm-kosongjadwal'&&UKM.set){UKM.set.buka='';UKM.set.tutup='';render()}
 else if(a==='ukm-simpan'&&UKM.edit){
  ukkBacaEdit();var d=UKM.edit,err=ukkValid(d);
  if(err){UKM.err=err;render();window.scrollTo(0,0);return}
  var old=ukkDocOf(d.id),base=!old&&ukkJobBy(d.id)?ukkDocFromJob(ukkJobBy(d.id)):null,src=old||base||{};
  var doc=Object.assign({},src,{id:d.id,jenis:'ukk',title:d.title.trim(),unit:d.unit.trim(),kelas:d.kelas,fase:KELAS[d.kelas].fase,duration:parseInt(d.duration,10),skkni:String(d.skkni||'').trim(),
   form:Object.assign({},d.form),items:ukkParseItems(d.itemsText),status:src.status||'published',active:src.active!==false,maxTry:src.maxTry||0,buka:src.buka||'',tutup:src.tutup||''});
  delete doc.reset;delete doc.dihapus;
  ukkSimpanDoc(doc);UKM.edit=null;UKM.err='';render();toast('Unit UKK tersimpan');ukkFlush();
 }
 else if(a==='ukm-simpan-set'&&UKM.set){
  var s=UKM.set;if(s.buka&&s.tutup&&ukkT(s.tutup)<=ukkT(s.buka)){toast('Waktu tutup harus setelah waktu buka');return}
  var target=[ukkJobBy(s.id)];if(s.semua)target=JOBS.filter(function(x){return x.kelas===ukkJobBy(s.id).kelas});
  var n=0;
  target.forEach(function(x){
   if(!x)return;
   var dc=ukkDocOf(x.id)||ukkDocFromJob(x),doc=Object.assign({},dc);
   doc.maxTry=s.maxTry;
   if(x.id===s.id){doc.status=s.tampil?'published':'draft';doc.active=!!s.tampil;if(s.buka)doc.buka=s.buka;else delete doc.buka;if(s.tutup)doc.tutup=s.tutup;else delete doc.tutup}
   delete doc.reset;ukkSimpanDoc(doc);n++;
  });
  UKM.set=null;render();toast(n>1?'Pengaturan diterapkan ke '+n+' unit':'Pengaturan tersimpan');ukkFlush();
 }
 else if(a==='ukm-reset'&&j){
  uiConfirm('Kembalikan '+j.judul+' ke isi bawaan aplikasi? Hasil edit akan hilang.',{ok:'Kembalikan'}).then(function(ok){
   if(!ok)return;var dc=ukkDocOf(j.id)||{id:j.id,title:j.judul,kelas:j.kelas,fase:(KELAS[j.kelas]||{}).fase||'F',duration:j.menit};
   var doc=Object.assign({},dc,{reset:true,status:'published',active:true});ukkSimpanDoc(doc);render();toast('Dikembalikan ke bawaan');ukkFlush();
  });
 }
 else if(a==='ukm-hapus'&&j){
  uiConfirm('Hapus unit "'+j.judul+'" dari daftar?\nNilai yang sudah tersimpan tetap ada di rekap.',{ok:'Hapus',danger:true}).then(function(ok){
   if(!ok)return;var dc=ukkDocOf(j.id)||ukkDocFromJob(j),doc=Object.assign({},dc,{dihapus:true,status:'draft',active:false});delete doc.reset;
   ukkSimpanDoc(doc);render();toast('Unit dihapus');ukkFlush();
  });
 }
},true);
document.addEventListener('change',function(e){
 var t=e.target;if(!t||!t.dataset||!UKM.set)return;
 if(t.dataset.ukmS!==undefined){var n=t.dataset.ukmS;UKM.set[n]=t.type==='checkbox'?t.checked:(n==='maxTry'?parseInt(t.value,10)||0:t.value)}
});
