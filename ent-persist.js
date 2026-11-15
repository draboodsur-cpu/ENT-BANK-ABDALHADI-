(function(){
var E=window.__ENT||{};var BASE='entq:'+(E.key||'x');
var store=null;try{store=window['local'+'Storage']}catch(e){}
var HAS_S=typeof S!=='undefined';
var MOCK=HAS_S&&typeof startScreen==='function'&&typeof Q!=='undefined';
var MULTI=MOCK&&typeof PAPERS!=='undefined'&&typeof pickPaper==='function'&&typeof PI!=='undefined';
var BANK=!MOCK&&HAS_S&&typeof home==='function'&&typeof DATA!=='undefined';
var KNOWN=MOCK||BANK;
var restoring=false,stop=false,timer=null;
function slot(){return MULTI?':p'+PI:''}
function SK(){return BASE+slot()}
function getJ(k){try{return JSON.parse(store.getItem(k)||'null')}catch(e){return null}}

if(KNOWN){
  var views=MOCK?['startScreen','show','results','rshow']:['home','show','results','notes'];
  views.forEach(function(n){var f=window[n];if(typeof f!=='function')return;
    window[n]=function(){S.__view=n;S.__arg=(n==='notes')?arguments[0]:null;var r=f.apply(this,arguments);if(!restoring)queue();return r}});
  if(MOCK&&typeof begin==='function'){var b0=window.begin;window.begin=function(){S.__rec=false;var r=b0.apply(this,arguments);queue();return r}}
  if(MULTI){var pp=window.pickPaper;window.pickPaper=function(i){save();restoring=true;try{pp.call(this,i)}finally{restoring=false}
    if(store&&store.getItem(SK()))restoreSlot();else{S.__rec=false}save()}}
}

function snapshot(){
  var extra={};
  if(MOCK&&S.phase==='run'){extra.__elapsed=Date.now()-S.start;if(S.mode==='exam')extra.__remain=S.end-Date.now()}
  return JSON.stringify(Object.assign({},S,extra),function(k,v){if(k==='tick')return undefined;if(v instanceof Set)return {__set:Array.from(v)};return v});
}
function cur(){
  var total=0,ans=0,ok=0,k;
  if(MOCK){total=Q.length;for(k in S.ans){ans++;if(Q[k]&&S.ans[k]==Q[k].k)ok++}}
  else{total=DATA.reduce(function(t,c){return t+((c&&c.q)?c.q.length:1)},0);for(k in S.ans){ans++;if(S.ans[k]&&S.ans[k].ok)ok++}}
  return {total:total,ans:ans,ok:ok};
}
function meta(){
  var m=cur();m.kind=MOCK?'mock':'bank';m.phase=MOCK?S.phase:(m.ans?'run':'start');m.mode=S.mode||'';m.ts=Date.now();
  if(MULTI){m.papers=PAPERS.length;m.paper=PI+1;var d=0;for(var i=0;i<PAPERS.length;i++){var h=getJ(BASE+':p'+i+':hist');if(h&&h.attempts)d++}m.done=d}
  else{var h0=getJ(BASE+':hist');if(h0)m.hist=h0}
  return m;
}
function save(){
  if(stop||!store||!KNOWN)return;
  try{
    if(MOCK&&S.phase==='done'&&!S.__rec){
      S.__rec=true;var c=cur(),hk=SK()+':hist',h=getJ(hk)||{};
      h.attempts=(h.attempts||0)+1;h.last={ok:c.ok,total:c.total,ts:Date.now()};
      if(!h.best||c.ok>h.best.ok)h.best=h.last;store.setItem(hk,JSON.stringify(h));
    }
    store.setItem(SK(),snapshot());
    if(MULTI)store.setItem(BASE+':cur',String(PI));
    store.setItem(BASE+':meta',JSON.stringify(meta()));
    flash();
  }catch(e){}
}
function queue(){if(!KNOWN)return;clearTimeout(timer);timer=setTimeout(save,250)}
document.addEventListener('click',queue,true);
document.addEventListener('keydown',queue,true);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')save()});
window.addEventListener('pagehide',save);
setInterval(function(){if(MOCK&&S.phase==='run')save()},15000);

function startTick(){clearInterval(S.tick);S.tick=setInterval(function(){var r=S.end-Date.now();var t=document.querySelector('#tm');if(t){t.textContent=fmt(r);t.classList.toggle('low',r<600000)}if(r<=0){clearInterval(S.tick);submit(true)}},1000)}

function restoreSlot(){
  var raw=store&&store.getItem(SK());if(!raw)return false;
  var o;try{o=JSON.parse(raw,function(k,v){return v&&typeof v==='object'&&Array.isArray(v.__set)?new Set(v.__set):v})}catch(e){return false}
  var el=o.__elapsed,rem=o.__remain;delete o.__elapsed;delete o.__remain;delete o.tick;
  restoring=true;
  try{
    clearInterval(S.tick);Object.assign(S,o);S.tick=null;
    if(MOCK){
      if(S.phase==='run'){var now=Date.now();S.start=now-(el||0);
        if(S.mode==='exam'){S.end=now+Math.max(1000,rem||0);startTick()}
        show();note(S.mode==='exam'?'Resumed — the timer was paused while you were away':'Resumed where you left off')}
      else if(S.phase==='done'){if(S.__view==='rshow'&&S.list&&S.list.length)rshow();else results()}
      else startScreen();
    }else{
      var v=S.__view;
      if(v==='show'&&S.list&&S.list.length){S.pos=Math.min(S.pos||0,S.list.length-1);show();note('Resumed where you left off')}
      else if(v==='results')results();
      else if(v==='notes'&&typeof notes==='function'&&S.__arg!=null)notes(S.__arg);
      else home();
    }
  }catch(e){try{(MOCK?startScreen:home)()}catch(_){}}
  restoring=false;return true;
}
function restore(){
  if(!store||!KNOWN)return;
  if(MULTI){var c=parseInt(store.getItem(BASE+':cur'),10);
    if(!isNaN(c)&&c>=0&&c<PAPERS.length&&c!==PI){PI=c;P=PAPERS[c];Q=P.q;S.ans={};S.flag={};S.pos=0;
      if(!restoreSlot()){restoring=true;startScreen();restoring=false}return}}
  restoreSlot();
}

/* ---------- menu ---------- */
var css=document.createElement('style');
css.textContent='#entTab{position:fixed;right:0;top:46%;z-index:2147483646;width:30px;height:46px;border:0;border-radius:12px 0 0 12px;background:rgba(20,36,43,.62);color:#fff;font:700 18px/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;padding:0}'+
'#entTab .dot{position:absolute;left:5px;top:6px;width:6px;height:6px;border-radius:50%;background:#5BC48A;opacity:0;transition:opacity .3s}#entTab.saved .dot{opacity:1}'+
'#entMenu{position:fixed;right:38px;top:calc(46% - 40px);z-index:2147483647;background:#fff;color:#14242B;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.28);padding:6px;min-width:220px;display:none;font:15px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}'+
'#entMenu.open{display:block}#entMenu a,#entMenu button{display:block;width:100%;text-align:left;padding:11px 12px;border:0;background:none;border-radius:9px;color:inherit;text-decoration:none;font:inherit;cursor:pointer}#entMenu a:active,#entMenu button:active{background:#DDEEEE}#entMenu .st{font-size:12px;color:#5B6A71;padding:6px 12px 4px}#entMenu .rs{color:#A8261F}'+
'@media (prefers-color-scheme:dark){#entMenu{background:#16252B;color:#E4ECEE}#entMenu .st{color:#93A4AA}#entMenu .rs{color:#F08B83}#entMenu a:active,#entMenu button:active{background:#183A3D}}'+
'#entNote{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:2147483647;background:#14242B;color:#fff;padding:9px 14px;border-radius:10px;font:14px/1.4 system-ui,sans-serif;opacity:0;transition:opacity .25s;pointer-events:none;max-width:88vw;text-align:center}#entNote.show{opacity:1}';
document.head.appendChild(css);
var tab=document.createElement('button');tab.id='entTab';tab.setAttribute('aria-label','Exam menu');tab.innerHTML='<i class="dot"></i>⋮';
var menu=document.createElement('div');menu.id='entMenu';
menu.innerHTML='<div class="st" id="entSt"></div><a href="./">⌂ &nbsp;Back to library</a><button class="rs" id="entReset">↺ &nbsp;'+(MULTI?'Start this paper again':'Start this exam again')+'</button>';
var nt=document.createElement('div');nt.id='entNote';
document.body.appendChild(tab);document.body.appendChild(menu);document.body.appendChild(nt);
tab.addEventListener('click',function(e){e.stopPropagation();updSt();menu.classList.toggle('open')});
document.addEventListener('click',function(e){if(!menu.contains(e.target)&&e.target!==tab)menu.classList.remove('open')});
menu.querySelector('a').addEventListener('click',function(){save()});
document.getElementById('entReset').addEventListener('click',function(){
  var msg=MULTI?'Start this paper again from the beginning?\n\nYour answers for this paper will be cleared. Other papers and your past scores are kept.':
    MOCK?'Start this paper again from the beginning?\n\nYour current answers will be cleared. Your past scores stay in the library.':
    'Clear all your answers in this exam and start fresh?';
  if(!confirm(msg))return;
  stop=true;
  try{
    if(KNOWN){store.removeItem(SK());if(!MULTI)store.removeItem(BASE+':meta');else store.setItem(BASE+':meta',JSON.stringify(Object.assign(meta(),{ans:0,ok:0,phase:'start'})))}
    var pre='entws:'+(E.key||'x')+':',rm=[];for(var i=0;i<store.length;i++){var k=store.key(i);if(k&&k.indexOf(pre)===0)rm.push(k)}rm.forEach(function(k){store.removeItem(k)});
  }catch(e){}
  location.reload();
});
function updSt(){var t='Progress saves automatically';if(KNOWN){var m=cur();if(m.ans)t='Saved · '+(MULTI?'Paper '+(PI+1)+' · ':'')+m.ans+' of '+m.total+' answered'}document.getElementById('entSt').textContent=t}
var ft=null;function flash(){tab.classList.add('saved');clearTimeout(ft);ft=setTimeout(function(){tab.classList.remove('saved')},1200)}
var ntT=null;function note(t){nt.textContent=t;nt.classList.add('show');clearTimeout(ntT);ntT=setTimeout(function(){nt.classList.remove('show')},2600)}
if(E.title&&document.title)document.title=E.title;
restore();
})();
