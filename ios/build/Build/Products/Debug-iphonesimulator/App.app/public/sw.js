const CACHE_NAME = 'futcard-pro-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/favicon.svg',
  '/src/data/mockData.js'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.log('PWA SW: Cache open error', err))
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event - Network first fallback to Cache
self.addEventListener('fetch', (e) => {
  // Avoid interception of external APIs or Chrome extensions
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).then((response) => {
      // Put clone in cache if it's a safe GET request
      if (response && response.status === 200 && e.request.method === 'GET') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Offline fallback
      return caches.match(e.request);
    })
  );
});
