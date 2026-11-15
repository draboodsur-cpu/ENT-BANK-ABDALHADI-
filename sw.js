const SHELL='ent-shell-v3';
const SHELL_FILES=['./','index.html','exam.html','ent-pre.js','ent-persist.js','library.json','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(async c=>{for(const f of SHELL_FILES){try{await c.add(new Request(f,{cache:'reload'}))}catch(err){}}}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!=='ent-lib').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin)return;
  if(req.cache==='reload'||req.cache==='no-store')return;
  const scope=new URL(self.registration.scope);
  const rel=url.pathname.startsWith(scope.pathname)?url.pathname.slice(scope.pathname.length):url.pathname;
  const isShell=rel===''||SHELL_FILES.includes(rel);
  if(isShell){
    e.respondWith(caches.open(SHELL).then(async c=>{
      const hit=await c.match(req,{ignoreSearch:true});
      const key=url.origin+url.pathname;const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r}).catch(()=>null);
      if(hit){e.waitUntil(net);return hit}
      return (await net)||c.match('index.html')||Response.error();
    }));
    return;
  }
  e.respondWith((async()=>{
    const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;
    try{const r=await fetch(req);if(r&&r.ok&&/\.html?$/i.test(url.pathname)){const c=await caches.open('ent-lib');c.put(req,r.clone())}return r}
    catch(err){return Response.error()}
  })());
});
