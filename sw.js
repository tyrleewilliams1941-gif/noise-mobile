const CACHE = 'noise-survey-v3';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS.map(function(url){
        return new Request(url, {mode: 'no-cors'});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(res){
        if(!res || res.status !== 200) return res;
        var resClone = res.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, resClone);
        });
        return res;
      }).catch(function(){
        return cached;
      });
    })
  );
});
