const CACHE_NAME = 'travel-planner-v1';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/favicon.svg',
  '/manifest.json',
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API calls (backend subdomain or /api/*): network-only, no caching
// - Navigation requests: network-first, fall back to cached '/' for SPA routing
// - Static assets: cache-first, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests that aren't our own origin
  // (API calls to backend subdomain go straight to network)
  if (url.origin !== self.location.origin) return;

  // Skip /api/* routes
  if (url.pathname.startsWith('/api/')) return;

  // Navigation requests: network-first, SPA fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a fresh copy of the page
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: serve cached '/' so the SPA can handle routing
          caches.match('/').then((cached) => cached ?? Response.error())
        )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response.ok) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
