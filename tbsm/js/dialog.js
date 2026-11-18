/* dialog.js: dialog konfirmasi dan isian di dalam aplikasi (pengganti confirm/prompt bawaan peramban).
   Dialog bawaan menampilkan alamat situs ("xxx.github.io menyatakan"), tidak bisa disesuaikan, dan tidak mengikuti tema.
   - uiConfirm(pesan, opsi) -> Promise<boolean>. Baris pertama pesan (bila pesan lebih dari satu baris) menjadi judul.
   - uiPrompt(pesan, opsi)  -> Promise<string|null>.
   - uiOk(kunci, pesan, ulang, opsi) -> boolean. Pengganti langsung confirm() pada kode yang harus berjalan sinkron:
     bila belum disetujui, dialog dibuka dan fungsi mengembalikan false. Setelah pengguna menekan tombol setuju,
     tindakan semula dijalankan ulang (ulang = elemen yang diklik ulang, atau fungsi) dan uiOk mengembalikan true. */
var UIK={};
(function(){
 var Q=Promise.resolve();
 var CSS='.ui-ov{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(8,16,12,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);animation:uifade .15s ease-out}'+
 '.ui-dlg{width:min(400px,100%);max-height:88vh;overflow:auto;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:18px;padding:20px 20px 16px;box-shadow:0 18px 48px rgba(0,0,0,.28);display:grid;gap:10px;animation:uipop .16s ease-out}'+
 '.ui-dlg h3{font-size:17px;margin:0}.ui-msg{display:grid;gap:4px;font-size:14px;line-height:1.5;color:var(--muted)}.ui-msg p{margin:0}'+
 '.ui-dlg input{margin-top:4px}.ui-bar{display:flex;gap:8px;justify-content:flex-end;margin-top:6px}.ui-bar .btn{min-width:84px}'+
 '.btn.primary.ui-danger{background:var(--bad);border-color:var(--bad);color:#fff}'+
 '@keyframes uifade{from{opacity:0}}@keyframes uipop{from{opacity:0;transform:translateY(8px) scale(.98)}}'+
 '@media(prefers-reduced-motion:reduce){.ui-ov,.ui-dlg{animation:none}}';
 var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

 function esc2(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function open(o){
  return new Promise(function(done){
   var lines=String(o.msg||'').split('\n').filter(function(x){return x.trim()}),title=o.title||'',body=lines;
   if(!title){if(lines.length>1){title=lines[0];body=lines.slice(1)}else{title='Konfirmasi'}}
   var prev=document.activeElement,ov=document.createElement('div'),fin=false;
   ov.className='ui-ov';
   ov.innerHTML='<div class="ui-dlg" role="alertdialog" aria-modal="true" aria-labelledby="ui-t" aria-describedby="ui-m"><h3 id="ui-t">'+esc2(title)+'</h3><div class="ui-msg" id="ui-m">'+body.map(function(x){return '<p>'+esc2(x)+'</p>'}).join('')+'</div>'+
    (o.input?'<input type="'+(o.type||'text')+'" autocomplete="'+(o.type==='password'?'new-password':'off')+'" aria-label="'+esc2(o.label||title)+'">':'')+
    '<div class="ui-bar">'+(o.info?'':'<button type="button" class="btn" data-u="x">'+esc2(o.cancel||'Batal')+'</button>')+'<button type="button" class="btn primary'+(o.danger?' ui-danger':'')+'" data-u="ok">'+esc2(o.ok||'Oke')+'</button></div></div>';
   document.body.appendChild(ov);
   var inp=ov.querySelector('input'),okb=ov.querySelector('[data-u="ok"]'),xb=ov.querySelector('[data-u="x"]');
   function end(v){
    if(fin)return;fin=true;document.removeEventListener('keydown',key,true);ov.remove();
    try{if(prev&&prev.focus&&document.contains(prev))prev.focus({preventScroll:true})}catch(e){}
    done(v);
   }
   function accept(){end(o.input?inp.value:true)}
   function cancel(){end(o.input?null:false)}
   function key(e){
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();o.info?accept():cancel()}
    else if(e.key==='Enter'&&inp&&document.activeElement===inp){e.preventDefault();accept()}
    else if(e.key==='Tab'){
     var f=Array.prototype.slice.call(ov.querySelectorAll('input,button')),i=f.indexOf(document.activeElement);
     if(!f.length)return;e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus();
    }
   }
   document.addEventListener('keydown',key,true);
   ov.addEventListener('click',function(e){
    if(e.target===ov){o.info?accept():cancel();return}
    var b=e.target.closest('[data-u]');if(!b)return;
    b.dataset.u==='ok'?accept():cancel();
   });
   /* tombol berbahaya: fokus awal ke Batal agar tidak tertekan tak sengaja */
   setTimeout(function(){(inp||(o.danger&&xb)||okb).focus()},30);
  });
 }
 function queue(o){var p=Q.then(function(){return open(o)});Q=p.then(function(){},function(){});return p}
 window.uiConfirm=function(msg,opt){return queue(Object.assign({msg:msg},opt||{}))};
 window.uiInfo=function(msg,opt){return queue(Object.assign({msg:msg,info:true},opt||{}))};
 window.uiPrompt=function(msg,opt){return queue(Object.assign({msg:msg,input:true},opt||{}))};
 window.uiOk=function(key,msg,again,opt){
  if(UIK[key]){delete UIK[key];return true}
  window.uiConfirm(msg,opt).then(function(ok){
   if(!ok)return;
   UIK[key]=1;
   try{if(typeof again==='function')again();else if(again&&again.click)again.click()}
   finally{delete UIK[key]}
  });
  return false;
 };
})();
