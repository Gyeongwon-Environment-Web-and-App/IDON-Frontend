// Service Worker for efficient caching and offline support
// Version 1.0.0

const CACHE_NAME = 'kyungwon-env-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';
const EXTERNAL_CACHE = 'external-v1.0.0';

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/logo.svg',
  '/robot.txt',
];

// External resources that should be cached aggressively
const EXTERNAL_RESOURCES = [
  '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for API calls
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for external resources
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache external resources
      caches.open(EXTERNAL_CACHE).then((cache) => {
        console.log('Service Worker: Caching external resources');
        return Promise.all(
          EXTERNAL_RESOURCES.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  cache.put(url, response);
                }
              })
              .catch((err) => {
                console.log('Failed to cache external resource:', url, err);
              })
          )
        );
      }),
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== EXTERNAL_CACHE
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine cache strategy based on request type
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else if (isExternalResource(request)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (isApiRequest(request)) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Helper functions to determine request types
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
  );
}

function isExternalResource(request) {
  const url = new URL(request.url);
  return (
    url.hostname.includes('dapi.kakao.com') ||
    url.hostname.includes('t1.daumcdn.net') ||
    url.hostname.includes('maps.apigw.ntruss.com') ||
    url.hostname.includes('openapi.naver.com')
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy - for API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy - for external resources
async function staleWhileRevalidate(request) {
  const cache = await caches.open(EXTERNAL_CACHE);
  const cachedResponse = await cache.match(request);

  // Return cached version immediately if available
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // If network fails, return cached version
      return cachedResponse;
    });

  // Return cached version immediately, or wait for network if no cache
  return cachedResponse || fetchPromise;
}

// Background sync for cache updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(updateCaches());
  }
});

// Update caches in background
async function updateCaches() {
  try {
    const cache = await caches.open(EXTERNAL_CACHE);

    // Update external resources
    for (const url of EXTERNAL_RESOURCES) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.log('Failed to update external resource:', url, error);
      }
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
}
