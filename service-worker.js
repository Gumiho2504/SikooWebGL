const CACHE_NAME = 'unity-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './Build/Build.json',
  './Build/data.unityweb',
  './Build/wasm.unityweb'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Failed to cache some files:', error);
      });
    })
  );
});

// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('fetch', (event) => {
  // Mock progress example
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ url: event.request.url, progress });
      });
    });
    if (progress >= 100) clearInterval(interval);
  }, 500);
});




self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
