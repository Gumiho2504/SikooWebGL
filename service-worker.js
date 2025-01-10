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
  event.respondWith(
    fetch(event.request.clone()).then((response) => {
      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        return response;
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const newResponse = new Response(
        new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();

            function read() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }

                loaded += value.byteLength;
                const progress = (loaded / total) * 100;

                self.clients.matchAll().then((clients) => {
                  clients.forEach((client) => {
                    client.postMessage({
                      type: 'PROGRESS',
                      progress: Math.round(progress)
                    });
                  });
                });

                controller.enqueue(value);
                read();
              });
            }

            read();
          }
        })
      );

      return newResponse;
    })
  );
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
