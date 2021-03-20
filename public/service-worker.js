const APP_PREFIX = 'Budget-Tracker-';
const VERSION = 'version_1';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = 'data-cache-' + VERSION;

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/idb.js',
    '/js/index.js',
    "./icons/icon-192x192.png",
];

// Keep in this order, Insatll > Fetch > Activate
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            return cache.match(e.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }

    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get('accept').include('text/html')) {
                    return caches.match('/');
                }
            });
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});