const CACHE_NAME = 'trampoff-cache-v1';
const ASSETS_TO_CACHE = [
  '/trampoff/',
  '/trampoff/index.html',
  '/trampoff/offline.html',
  '/trampoff/logo.png',
  '/trampoff/src/assets/imgs/logo.png',
  '/trampoff/icons/icon-192.png',
  '/trampoff/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          // optional: update cache with new resource
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);

      // Prefer cached, fall back to network, then offline page
      return cached || networked.then(res => res || caches.match('/trampoff/offline.html'));
    })
  );
});
