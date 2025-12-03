const CACHE_NAME = 'trampoff-cache-v1';
// During development the app may be served under a base path (Vite `base`).
// Use the service worker scope to build correct absolute asset paths.
const scopePath = (self.registration && self.registration.scope) ? new URL(self.registration.scope).pathname : '/';
const prefix = scopePath.endsWith('/') ? scopePath.slice(0, -1) : scopePath;

const ASSETS_TO_CACHE = [
  `${prefix}/`,
  `${prefix}/index.html`,
  `${prefix}/offline.html`,
  `${prefix}/logo_escuro.png`,
  `${prefix}/src/assets/imgs/logo_escuro.png`,
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
  // Ignore extension and non-http(s) schemes to avoid noisy errors
  const url = event.request.url;
  if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://') || url.startsWith('edge-extension://')) {
    return; // let the browser handle it directly
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);
      // Fallback chain: cache -> network -> offline.html (scoped)
      const offlinePath = `${prefix}/offline.html`;
      return cached || networked.then(res => res || caches.match(offlinePath));
    })
  );
});

// Focus app window on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const url = (self.registration && self.registration.scope) ? self.registration.scope : '/';
    let client = allClients.find(c => c.url.startsWith(url));
    if (client) {
      await client.focus();
    } else {
      await self.clients.openWindow(url);
    }
  })());
});
