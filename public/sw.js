const CACHE_VERSION = 'v2';
const STATIC_CACHE_NAME = `tezkorusta-static-${CACHE_VERSION}`;
const LEGACY_CACHE_PREFIXES = ['tezkorusta-cache-', 'tezkorusta-static-'];

const PRECACHE_ASSETS = [
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

const STATIC_EXTENSIONS = [
  '.css',
  '.js',
  '.mjs',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            const isManagedCache = LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
            const isCurrentCache = cacheName === STATIC_CACHE_NAME;

            if (isManagedCache && !isCurrentCache) {
              return caches.delete(cacheName);
            }

            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (isDynamicRequest(request, requestUrl)) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (isStaticAsset(request, requestUrl)) {
    event.respondWith(cacheFirst(request));
  }
});

function isDynamicRequest(request, requestUrl) {
  if (request.mode === 'navigate') {
    return true;
  }

  if (requestUrl.origin !== self.location.origin) {
    return true;
  }

  if (
    requestUrl.pathname.startsWith('/api/') ||
    requestUrl.pathname.startsWith('/listings') ||
    requestUrl.pathname.startsWith('/search') ||
    requestUrl.pathname.startsWith('/saved') ||
    requestUrl.pathname.startsWith('/profile') ||
    requestUrl.pathname.startsWith('/admin') ||
    requestUrl.pathname.includes('/rest/v1/') ||
    requestUrl.pathname.includes('/auth/v1/')
  ) {
    return true;
  }

  const acceptHeader = request.headers.get('accept') || '';
  return acceptHeader.includes('text/html') || acceptHeader.includes('application/json');
}

function isStaticAsset(request, requestUrl) {
  if (requestUrl.origin !== self.location.origin) {
    return false;
  }

  if (
    requestUrl.pathname.startsWith('/_next/static/') ||
    requestUrl.pathname === '/manifest.webmanifest' ||
    PRECACHE_ASSETS.includes(requestUrl.pathname)
  ) {
    return true;
  }

  return STATIC_EXTENSIONS.some((extension) => requestUrl.pathname.endsWith(extension));
}

async function networkOnly(request) {
  return fetch(request);
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  if (networkResponse && networkResponse.status === 200) {
    const responseToCache = networkResponse.clone();
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.put(request, responseToCache);
  }

  return networkResponse;
}
