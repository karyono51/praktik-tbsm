function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mmss(s){var m=Math.floor(s/60),r=s%60;return (m<10?'0':'')+m+':'+(r<10?'0':'')+r}
function tgl(ts){return new Date(ts).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}
function uid(){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}V.running=false}
function startTimer(){if(timer)return;V.running=true;timer=setInterval(function(){V.sec++;var el=$('#clock');if(el){el.textContent=mmss(V.sec);var lim=V.job.menit*60;el.style.color=V.sec>lim?'var(--bad)':''}},1000)}
