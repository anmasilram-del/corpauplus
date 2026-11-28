// Cache exclusivamente de archivos públicos. No guarda datos de usuario.
const PREFIX='pau-static:'+self.registration.scope+':';
const CACHE=PREFIX+'v14-3-repositorios-1';
const CORE=['./','./index.html','./ui.css','./app.js','./exchange.mjs','./core.mjs','./backup.mjs','./vault.mjs','./cleanup.mjs','./library.mjs','./classes.mjs','./annotations.mjs','./grade-report.mjs','./exam-tools.mjs','./pdf-output.mjs','./scan-pdf.mjs','./manifest.json','./icon-192.png','./icon-512.png','./icon.svg'];
const OPTIONAL=['./vendor/pdf.mjs','./vendor/pdf.worker.mjs'];
const url=f=>new URL(f,self.registration.scope).href;
const core=new Set(CORE.map(url)), optional=new Set(OPTIONAL.map(url));
const req=u=>new Request(u,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',cache:'reload'});
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE);await c.addAll(CORE.map(f=>req(url(f))));
 for(const f of OPTIONAL){try{const r=await fetch(req(url(f)));if(r.ok&&r.headers.get('content-type')?.includes('javascript'))await c.put(url(f),r)}catch{}}
 // No skipWaiting: la nueva versión no reemplaza una sesión de corrección abierta.
})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{const u=e.request.url;if(e.request.method!=='GET'||(!core.has(u)&&!optional.has(u)))return;
 e.respondWith((async()=>{const c=await caches.open(CACHE),cached=await c.match(u);if(cached)return cached;
 // Nunca mezclar los ficheros esenciales de una versión activa con otros de una actualización.
 if(core.has(u))return new Response('Falta un archivo de la versión instalada. Cierra todas las ventanas y vuelve a abrir.',{status:503});
 try{const r=await fetch(req(u));if(r.ok&&r.headers.get('content-type')?.includes('javascript'))return r}catch{}
 return new Response('Lector PDF no disponible',{status:404});
 })());
});
