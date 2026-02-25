/* ============================================
   ⚙️ SERVICE WORKER — Offline + Cache
   WhatsApp Link Generator v0.5
   ============================================ */

const CACHE_NAME = 'whatsapp-gen-v0.5';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/animations.css',
    './css/responsive.css',
    './js/app.js',
    './js/animations.js',
    './js/particles.js',
    './manifest.json'
];

/* Install — cache core assets */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('⚙️ SW: Caching core assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log('⚙️ SW: Deleting old cache', key);
                        return caches.delete(key);
                    })
            );
        })
    );
    self.clients.claim();
});

/* Fetch — Network First for HTML, Cache First for assets */
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    if (event.request.method !== 'GET') return;
    
    // HTML — Network First
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => {
                    // #issue-9: proper fallback chain
                    return caches.match(event.request).then((cached) => {
                        return cached || caches.match('./index.html').then((fallback) => {
                            return fallback || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                        });
                    });
                })
        );
        return;
    }
    
    // CSS/JS/Fonts — Cache First
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                return new Response('', { status: 408, statusText: 'Offline' });
            });
        })
    );
});
