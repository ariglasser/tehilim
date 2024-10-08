const CACHE_NAME = 'tehilim-cache-v6';
const RESOURCES = [
"index.css",
"fonts/Shlomo.ttf",
"manifest.json",
"index.mjs",
"gematria.mjs",
"prakim.mjs",
"resources.mjs",
"images/harp2-192.png",
"images/harp2-512.png",
];
let goodLogCount = 3;

function getPerkUrls(perk){
  return [
    `./prakim/${perk.toString().padStart(3, '0')}.json`,
    `./mp3/${perk.toString().padStart(3, '0')}.mp3`
    ];
}

function getCachedUrls(){
  const c = Array.from({ length: 150 }, (a_, i) =>  getPerkUrls(i+1))
    .concat(...RESOURCES)
    .flat()

  console.log(CACHE_NAME, 'going to cache',c);
  return c;
}

self.addEventListener('install', (event) =>  {
  console.log(CACHE_NAME, 'installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(CACHE_NAME, 'Opened cache');
        return cache.addAll(getCachedUrls());
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the cached response
        if (response) {
          if (goodLogCount-- > 0 ) {
            console.log(CACHE_NAME, 'use cached resource', event.request.url);
          }
          return response;
        }
        console.log(CACHE_NAME,'need to fetch cached resource', event.request.url);
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(CACHE_NAME, 'activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (CACHE_NAME !== cacheName) {
            console.log(CACHE_NAME,'deleting cache', cacheName);
            return caches.delete(cacheName);
          }
          console.log(CACHE_NAME, 'not deleting cache', cacheName);
        })
      );
    })
  );
});
