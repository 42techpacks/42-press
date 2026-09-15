---
permalink: /service-worker.js
---
const CACHE = '42-press-v1';
const OFFLINE = [
  '{{ "/status/" | relative_url }}',
  '{{ "/assets/css/style.css" | relative_url }}',
  '{{ "/assets/js/site.js" | relative_url }}',
  '{{ "/assets/fonts/Redaction-Regular.woff2" | relative_url }}',
  '{{ "/assets/icons/icon-192.png" | relative_url }}'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(OFFLINE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || (event.request.mode === 'navigate' ? caches.match('{{ "/status/" | relative_url }}') : undefined))));
});
