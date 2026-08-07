const CACHE_NAME = 'zapixal-cache-v5';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Helper to check if a request/response should be cached
function shouldCache(request, response) {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();

  // Only handle GET requests
  if (request.method !== 'GET') {
    return false;
  }

  // Only cache same-origin assets or trusted CDNs (like Google Fonts)
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  if (!isSameOrigin && !isGoogleFont) {
    return false;
  }

  // Strict Exclusions: Do NOT cache large WASM files, workers, codecs, or heavy conversion libraries
  if (
    path.endsWith('.wasm') ||
    path.endsWith('.wasm.br') ||
    path.includes('wasm') ||
    path.includes('codec') ||
    path.includes('worker') ||
    path.includes('jsquash') ||
    path.includes('imagequant') ||
    path.includes('upng') ||
    path.includes('heic2any') ||
    path.includes('heif') ||
    path.includes('pdfjs') ||
    path.includes('pdf.js')
  ) {
    return false;
  }

  // Maximum asset size protection (do not cache anything larger than 2MB)
  if (response) {
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      if (!isNaN(sizeInBytes) && sizeInBytes > 2 * 1024 * 1024) {
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

  // App Shell & Code Strategy: Network-First (Falling back to Cache if offline)
  // This guarantees that online users always receive the latest JavaScript and HTML deployments.
  const isAppShellOrCode = 
    path === '/' || 
    path === '/index.html' || 
    path.endsWith('.js') || 
    path.endsWith('.css') || 
    path.endsWith('.json') ||
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

  // Fallback default: Network-only (no caching) for external links, WASM, web workers, and heavy codecs
  event.respondWith(fetch(event.request));
});
