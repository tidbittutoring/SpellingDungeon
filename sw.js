const CACHE_NAME = 'spelling-dungeon-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './WordLibrary.js',
    './ChallengeManager.js',
    './ItemData.js',
    './ItemManager.js',
    './icon.png',
    './manifest.json',
    'https://unpkg.com/three@0.160.0/build/three.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
