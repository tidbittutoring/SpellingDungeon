const CACHE_NAME = 'spelling-dungeon-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './menu_refactor.css',
    './inventory.css',
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

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
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
