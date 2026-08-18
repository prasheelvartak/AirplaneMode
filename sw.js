// AirplaneMode Service Worker v1.0
const CACHE_NAME = 'airplanemode-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/modules/map.js',
  '/js/modules/flights.js',
  '/js/modules/stats.js',
  '/js/modules/storage.js',
  '/js/modules/parser.js',
  '/js/modules/aircraftView.js',
  '/js/modules/smartIngest.js',
  '/js/data/airports.js',
  '/js/data/aircraft.js',
  '/js/data/flightSchedules.js',
  '/js/data/sampleFlights.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some cache assets failed to pre-cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests, bypass external API or cross-origin POST
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networked = fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
