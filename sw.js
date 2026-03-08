const CACHE = 'eila-v2';
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
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
