/* lkpd-kelas.js: LKPD Praktik disusun per kelas dengan pola yang sama seperti Unit Ujian (pengganti Unit Ujian).
   Daftar kartu per kelas -> buka modul. Guru: kelola modul (baru, edit, terbit/draft, pratinjau, rekap). */
LK.open=false;
function lkcNum(id){var n=parseInt(String(id).split('-').pop(),10);return isNaN(n)?999:n}
function lkcModules(kelas,staff){
 lkRefreshModules();
 return LKPD_MODULES.filter(function(m){return m.kelas===kelas&&schAkunOk(m)&&(staff||(m.status==='published'&&m.active!==false))})
  .sort(function(a,b){return lkcNum(a.id)-lkcNum(b.id)||String(a.id).localeCompare(String(b.id))});
}
function lkcRecs(m,staff){return (S.lkpd||[]).filter(function(x){return x.moduleId===m.id&&(staff||x.sid===S.user.id)})}
function lkcKelasInfo(k){return KELAS[k]||{judul:'Kelas '+k,sub:''}}
function lkListView(){
 var staff=isStaff(),kb=kelasBoleh();if(kb.indexOf(S.kelas)<0)S.kelas=kb[0];
 var k=lkcKelasInfo(S.kelas),mods=lkcModules(S.kelas,staff);
 var cards=mods.map(function(m){
  var recs=lkcRecs(m,staff),st,cls='',acts;
  if(staff){
   var avg=recs.length?Math.round(recs.reduce(function(t,x){return t+lkNilai(x)},0)/recs.length):0,belum=recs.filter(function(x){return !lkHasK(x)}).length;
   st='<span class="pill plain">'+(recs.length?recs.length+' pengumpulan · rata-rata '+avg+(belum?' · '+belum+' belum dikoreksi':''):'Belum ada pengumpulan')+'</span>';
   acts='<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="lkc-open" data-v="'+lkEsc(m.id)+'">Buka modul</button><button type="button" class="btn small" data-act="lkc-preview" data-v="'+lkEsc(m.id)+'">Pratinjau</button><button type="button" class="btn small" data-act="lkc-edit" data-v="'+lkEsc(m.id)+'">Edit</button><button type="button" class="btn small" data-act="lk-toggle" data-v="'+lkEsc(m.id)+'">'+(m.status==='published'&&m.active!==false?'Jadikan draft':'Terbitkan')+'</button></div>';
  }else{
   var l=recs.slice().sort(function(a,b){return b.ts-a.ts})[0];
   if(l){var v=lkNilai(l),ok=v>=S.kkm;cls=ok?'st-ok':'st-bad';st='<span class="pill '+(ok?'ok':'bad')+'">'+(ok?'Kompeten':'Belum kompeten')+' · '+v+'</span>'+(lkHasK(l)?'':' <span class="pill plain">Menunggu guru</span>')}
   else st='<span class="pill plain">Belum dikerjakan</span>';
   acts='<button type="button" class="btn primary small" data-act="lkc-open" data-v="'+lkEsc(m.id)+'">'+(l?'Buka lagi':'Mulai praktik')+'</button>';
  }
  var pub=m.status==='published'&&m.active!==false;
  return '<article class="card job '+cls+'"><div class="row sb"><h3 class="grow">'+lkEsc(m.title)+'</h3>'+(staff?'<span class="pill '+(pub?'ok':'warn')+'">'+(pub?'Terbit':'Draft')+'</span>':'')+'</div>'+
   '<div class="meta"><span>'+lkEsc(m.unit)+'</span><span class="mono">'+lkEsc(m.duration)+' menit</span><span>'+m.steps.length+' langkah, '+m.quiz.length+' soal</span></div>'+
   (m.skkni?'<div><span class="pill plain mono" title="Kode unit SKKNI">SKKNI '+lkEsc(m.skkni)+'</span></div>':'')+
   '<div class="row sb" style="flex-wrap:wrap;gap:8px">'+st+'</div>'+acts+'</article>';
 }).join('');
 var top=staff?'<div class="row" style="flex-wrap:wrap;gap:6px"><button type="button" class="btn primary small" data-act="lkc-new">+ Modul baru</button><button type="button" class="btn small" data-act="lkc-rekap">Rekap kelas</button></div>':'<div class="row"><button type="button" class="btn small" data-act="lkc-rekap">Riwayat saya</button></div>';
 return '<div class="row sb"><div><h2>'+lkEsc(k.judul)+'</h2><p class="note">'+lkEsc(k.sub)+'</p></div><span class="pill plain">'+mods.length+' modul</span></div>'+
  '<p class="note">'+(staff?'Mode guru: kelola modul LKPD, lihat pengumpulan, dan beri nilai koreksi. Nilai dari guru menggantikan nilai otomatis.':'Mode siswa: kerjakan LKPD praktik, lampirkan foto bukti, lalu kirim. Nilai akhir ditentukan guru.')+' '+(kb.length>1?'Ganti kelas lewat menu di dasbor.':'Modul di sini khusus kelas kamu.')+'</p>'+top+
  '<div class="jobs">'+(cards||'<div class="card muted">'+(staff?'Belum ada modul untuk kelas ini.':'Belum ada modul LKPD terbit untuk kelas ini. Hubungi guru.')+'</div>')+'</div>';
}
var viewLKPD0=viewLKPD;
viewLKPD=function(){
 if(!LK.open&&!LK.detail&&!LK.editor)return lkListView();
 var h=viewLKPD0();
 if(LK.detail)return h;
 return '<div class="row"><button type="button" class="btn small" data-act="lkc-list">‹ Daftar LKPD '+lkEsc(lkcKelasInfo(S.kelas).judul)+'</button></div>'+h;
};
/* Unit Ujian lama (sementara): pilih kelas lewat chip karena baris kelas di dasbor kini membuka LKPD */
var viewKatalog0=viewKatalog;
viewKatalog=function(){
 var kb=kelasBoleh(),chips=kb.length>1?'<div class="chips">'+kb.map(function(c){return '<button type="button" data-act="kat-kelas" data-v="'+c+'" aria-pressed="'+(S.kelas===c)+'">'+esc(KELAS[c].judul)+'</button>'}).join('')+'</div>':'';
 return chips+viewKatalog0();
};
document.addEventListener('click',function(e){
 var b=e.target.closest('[data-act]');if(!b)return;var a=b.dataset.act,v=b.dataset.v,m;
 if(a.indexOf('lkc-')!==0&&a!=='kat-kelas')return;
 if(a==='kat-kelas'){if(kelasBoleh().indexOf(v)>-1){S.kelas=v;render()}return}
 if(a==='lkc-list'){LK.open=false;LK.detail=null;LK.editor=null;LK.preview=false;LK.tab='materi';render();window.scrollTo(0,0)}
 else if(a==='lkc-open'){LK.module=v;LK.tab='materi';LK.detail=null;LK.editor=null;LK.preview=false;LK.open=true;render();window.scrollTo(0,0)}
 else if(a==='lkc-preview'&&isStaff()){LK.module=v;LK.tab='materi';LK.detail=null;LK.editor=null;LK.preview=true;LK.open=true;render();window.scrollTo(0,0)}
 else if(a==='lkc-edit'&&isStaff()){m=LKPD_MODULES.find(function(x){return x.id===v});if(m){LK.module=v;LK.tab='editor';LK.detail=null;LK.preview=false;LK.open=true;LK.editor=lkEditorDefaults(m);render();window.scrollTo(0,0)}}
 else if(a==='lkc-new'&&isStaff()){var d=lkEditorDefaults(null);d.kelas=S.kelas;if(KELAS[S.kelas])d.fase=KELAS[S.kelas].fase;LK.tab='editor';LK.detail=null;LK.preview=false;LK.open=true;LK.editor=d;render();window.scrollTo(0,0)}
 else if(a==='lkc-rekap'){LK.tab='riwayat';LK.detail=null;LK.editor=null;LK.preview=false;LK.kf=isStaff()?S.kelas:'';LK.open=true;render();window.scrollTo(0,0)}
});
