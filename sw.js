const CACHE='helene-anita-design-v7';
const STATIC=['./manifest.json','./icon-180.png','./icon-512.png','./anita-theme.css','./swipe-shop.js'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));
});

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

async function themedPage(request){
  try{
    const response=await fetch(request,{cache:'no-store'});
    const type=response.headers.get('content-type')||'';
    if(!type.includes('text/html')) return response;
    let html=await response.text();
    if(!html.includes('anita-theme.css')){
      html=html.replace('</head>','<link rel="stylesheet" href="./anita-theme.css?v=7"></head>');
    }
    if(!html.includes('swipe-shop.js')){
      html=html.replace('</body>','<script src="./swipe-shop.js?v=7"></script></body>');
    }
    return new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
  }catch(err){
    const cached=await caches.match(request);
    return cached||new Response('Offline',{status:503});
  }
}

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html')){
    e.respondWith(themedPage(e.request));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});