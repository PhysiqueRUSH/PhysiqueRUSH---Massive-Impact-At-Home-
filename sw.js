const CACHE='physiquerush-mi-v7-version-footer';
const APP_SHELL=[
  './','./index.html','./css/app.css','./css/impact-theme.css','./css/home-footer.css','./manifest.webmanifest',
  './js/app.js','./js/config.js','./js/state.js','./js/scoring.js','./js/sessionStore.js',
  './js/data/exercises.js','./js/data/core.js','./js/data/cardio.js','./js/data/tests.js','./js/data/challenges.js','./js/data/drops.js','./js/data/program.js',
  './js/engine/workout.js','./js/engine/timer.js','./js/ui/components.js','./js/ui/screens.js',
  './assets/icons/icon-32.png','./assets/icons/icon-64.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/icon-1024.png','./assets/icons/icon-maskable-192.png','./assets/icons/icon-maskable-512.png','./assets/icons/apple-touch-icon-180.png','./assets/brand/physiquerush-symbol-master.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){e.respondWith(fetch(req).catch(()=>new Response('',{status:503})));return;}
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;}).catch(()=>caches.match('./index.html'))));
});
