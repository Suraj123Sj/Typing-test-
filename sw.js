const CACHE_NAME = 'notes-pwa-v2'; // Changed version
const ASSETS = [
    '/Typing-test/',
    '/Typing-test/index.html',
    '/Typing-test/styles.css',
    '/Typing-test/app.js',
    '/Typing-test/manifest.json',
    '/Typing-test/sw.js',
    'https://i.ibb.co/hxNQddXK/d980ba5fdc35.webp',
    'https://i.ibb.co/qLnrGxfy/5f5942d6ee32.webp'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS).catch(error => {
                    console.error('Failed to cache:', error);
                });
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Cache new requests
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, fetchResponse.clone());
                            return fetchResponse;
                        });
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
});
