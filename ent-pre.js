(function(){
var add=window.addEventListener;
window.addEventListener=function(t,f,o){if(t==='beforeunload')return;return add.call(this,t,f,o)};
var E=window.__ENT||{};var NS='entws:'+(E.key||'x')+':';var ls=null;try{ls=window['local'+'Storage']}catch(e){}
if(ls&&!(window.storage&&typeof window.storage.get==='function')){
  window.storage={
    get:function(k){return new Promise(function(res,rej){var v=ls.getItem(NS+k);if(v==null)rej(new Error('Key not found'));else res({key:k,value:v,shared:false})})},
    set:function(k,v){return new Promise(function(res){try{ls.setItem(NS+k,String(v));res({key:k,value:v,shared:false})}catch(e){res(null)}})},
    delete:function(k){return new Promise(function(res){ls.removeItem(NS+k);res({key:k,deleted:true,shared:false})})},
    list:function(p){return new Promise(function(res){var ks=[];for(var i=0;i<ls.length;i++){var k=ls.key(i);if(k&&k.indexOf(NS)===0){k=k.slice(NS.length);if(!p||k.indexOf(p)===0)ks.push(k)}}res({keys:ks,prefix:p,shared:false})})}
  };
}
})();
