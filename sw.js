const CACHE = 'eila-v1';
const ASSETS = [
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
  'https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
