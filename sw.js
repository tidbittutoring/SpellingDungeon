/**
 * Spelling Dungeon
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/
 * 
 * Copyright (c) 2026 The Spelling Dungeon Authors
 */

// Spelling Dungeon v5 - Fix for hotkeys and Heal spell
const CACHE_NAME = 'spelling-dungeon-v5';
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
    self.skipWaiting(); // Force update
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(), // Take control of all clients immediately
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
