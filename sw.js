const CACHE = 'eila-v5';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './game.js',
  './levels/levelConfig.js',
  './scenes/BootScene.js',
  './scenes/MenuScene.js',
  './scenes/LevelSelectScene.js',
  './scenes/GameScene.js',
  './scenes/WinScene.js',
  './scenes/VictoryScene.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first: always try network, fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Update cache with fresh response
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
