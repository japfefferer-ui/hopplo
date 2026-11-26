/* Hopplo: works offline for the single-player games. Online (always the newest page first), the saved copy is only the fallback. */
const CACHE = 'hopplo-app-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'favicon-32.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))));});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method !== 'GET') return;
  let u; try { u = new URL(r.url); } catch(_) { return; }
  if(u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if(res && res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r.mode === 'navigate' ? 'index.html' : r, cp)).catch(() => {}); }
    return res;
  }).catch(() => caches.match(r, {ignoreSearch:true}).then(m => m || caches.match('index.html'))));
});
