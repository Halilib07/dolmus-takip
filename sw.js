const CACHE_NAME = 'dolmus-pwa-v4'; // <-- BURAYI HER GÜNCELLEMEDE ARTIR (v4, v5, v6...)
const urlsToCache = [
  './',
  './index.html'
];

// Yeni Service Worker'ı hemen devreye sok
self.addEventListener('install', event => {
  self.skipWaiting(); // <-- KRİTİK: Beklemeden aktifleş
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek açıldı:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek siliniyor:', cacheName);
            return caches.delete(cacheName); // <-- KRİTİK: Eski v3'ü sil
          }
        })
      );
    }).then(() => self.clients.claim()) // <-- KRİTİK: Açık sayfaları ele geçir
  );
});

// Fetch: Önce ağdan dene, olmazsa önbellekten ver (Network First)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılıysa güncel halini önbelleğe de yaz
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Ağ yoksa (çevrimdışı) önbellekten ver
        return caches.match(event.request);
      })
  );
});
