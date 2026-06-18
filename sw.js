// VERSIÓ: 2024061801
// Canvia aquest número cada vegada que publiques una actualització
const CACHE_NAME = 'porquet-v2024061801';

const PRECACHE = [
  './',
  './index.html'
];

// Instal·lació: guardar els fitxers base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activació: eliminar caches antics
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: xarxa primer, caché com a fallback
self.addEventListener('fetch', event => {
  // No interceptar peticions externes (imatges/sons de GitHub)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar còpia fresca a la caché
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
