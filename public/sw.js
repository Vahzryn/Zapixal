const CACHE_NAME = 'zapixal-cache-v6';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/conversionWorker-pOKn4ati.js',
  '/assets/heic2any-Bw2j7X8B.js',
  '/assets/heicWorker-DlHemkcA.js',
  '/assets/imagequant_bg-BcMVf2Ny.wasm',
  '/assets/imagequant-JolLgzfc.js',
  '/assets/imagequant-LRxOhkFz.js',
  '/assets/mozjpeg_enc-DO-zoExo.wasm',
  '/assets/UPNG-BIv4Qice.js',
  '/assets/UPNG-C0jdEaui.js',
  '/assets/jspdf.es.min-DSnjvGbf.js',
  '/assets/avif_enc-_C3kZEkJ.js',
  '/assets/avif_enc-Co4TcJko.wasm',
  '/assets/avif_enc_mt-CMxXiuUp.js',
  '/assets/avif_enc_mt-CZ_pikvB.js',
  '/assets/avif_enc_mt-DFoVXd45.wasm',
  '/assets/avif_enc_mt.worker-a9dNT6Io.js',
  '/assets/webp_enc-BpZvKflB.wasm',
  '/assets/webp_enc-DIy7VB-T.js',
  '/assets/webp_enc_simd-0PCv9qCn.js',
  '/assets/webp_enc_simd-CFvKQ_80.wasm'
];

// Helper to check if a request/response should be cached
function shouldCache(request, response) {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  // Only handle HTTP/HTTPS protocols (avoid blob: or data: URLs)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  // Only handle GET requests
  if (request.method !== 'GET') {
    return false;
  }

  // Only cache same-origin assets
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) {
    return false;
  }

  // Strict Exclusions: Do NOT cache extremely large or unsupported files
  if (
    path.endsWith('.wasm.br')
  ) {
    return false;
  }

  // Maximum asset size protection (do not cache anything larger than 5MB)
  if (response) {
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      if (!isNaN(sizeInBytes) && sizeInBytes > 5 * 1024 * 1024) {
        return false;
      }
    }
  }

  return true;
}

// 1. Install Event: Precache core app shell metadata
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become active immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Activate Event: Clean up old cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Cleaning up stale cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Claim clients immediately so the updated SW takes control
  );
});

// 3. Fetch Event: Implement specialized caching policies based on resource type
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const path = url.pathname.toLowerCase();

  // Navigation Fallback for SPA routing
  // If the request is for a webpage navigation, try the network first.
  // If the network is unavailable (offline), fall back to the cached index.html shell.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && shouldCache(event.request, networkResponse)) {
            const responseClone = networkResponse.clone();
            // Cache the index.html for future offline navigation fallback
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const indexMatch = await caches.match('/index.html');
          return indexMatch || await caches.match('/');
        })
    );
    return;
  }

  // App Shell & Code Strategy: Network-First (Falling back to Cache if offline)
  // This guarantees that online users always receive the latest JavaScript and HTML deployments.
  const isAppShellOrCode = 
    path === '/' || 
    path === '/index.html' || 
    path.endsWith('.js') || 
    path.endsWith('.css') || 
    path.endsWith('.json') ||
    path.endsWith('.wasm') ||
    path.includes('/api/');

  if (isAppShellOrCode) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && shouldCache(event.request, networkResponse)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static Assets Strategy: Stale-While-Revalidate (Serve instantly, update cache in background)
  // Perfect for fonts, icons, small image assets, and other highly static assets.
  const isStaticAsset = 
    path.endsWith('.woff') || 
    path.endsWith('.woff2') || 
    path.endsWith('.ttf') || 
    path.endsWith('.svg') || 
    path.endsWith('.png') || 
    path.endsWith('.jpg') || 
    path.endsWith('.jpeg') || 
    path.endsWith('.ico') || 
    path.endsWith('.webp');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && shouldCache(event.request, networkResponse)) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Silence background fetch failures (e.g. offline)
          });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Fallback default: Network-only (no caching) for external links, and heavy codecs not explicitly precached
  event.respondWith(fetch(event.request));
});
