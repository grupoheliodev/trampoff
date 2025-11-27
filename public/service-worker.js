const CACHE_NAME = 'trampoff-cache-v1';
// During development the app may be served under a base path (Vite `base`).
// Use the service worker scope to build correct absolute asset paths.
const scopePath = (self.registration && self.registration.scope) ? new URL(self.registration.scope).pathname : '/';
const prefix = scopePath.endsWith('/') ? scopePath.slice(0, -1) : scopePath;

const ASSETS_TO_CACHE = [
  `${prefix}/`,
  `${prefix}/index.html`,
  `${prefix}/offline.html`,
  `${prefix}/logo.png`,
  `${prefix}/src/assets/imgs/logo.png`,
  `${prefix}/icons/icon-192.png`,
  `${prefix}/icons/icon-512.png`
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
      return cached || networked.then(res => res || caches.match('/offline.html'));
    })
  );
});
