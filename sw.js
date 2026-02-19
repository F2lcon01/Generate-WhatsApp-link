/* ============================================
   ⚙️ SERVICE WORKER — Offline + Cache
   WhatsApp Link Generator v0.4
   ============================================ */

const CACHE_NAME = 'whatsapp-gen-v0.4';
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

// External resources (cache on first use)
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Inter:wght@400;500;600;700&display=swap'
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
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // HTML — Network First (always try fresh)
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('./index.html'))
        );
        return;
    }
    
    // CSS/JS/Fonts — Cache First (fast loading)
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
                // Offline fallback for external resources
                return new Response('', { status: 408 });
            });
        })
    );
});
