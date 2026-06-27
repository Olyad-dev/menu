/* eslint-disable no-restricted-globals */

// IMPORTANT:
// This file is duplicated at /public/service-worker.js so that it is served
// from the site root (/service-worker.js). Service workers require this.

const SW_VERSION = 'dmenu-sw-v1';
const CACHE_ROOT = `dmenu-cache-${SW_VERSION}`;

const APP_SHELL_CACHE = `${CACHE_ROOT}-app-shell`;
const RUNTIME_CACHE = `${CACHE_ROOT}-runtime`;
const MENU_API_CACHE = `${CACHE_ROOT}-menu-api`;
const IMAGE_CACHE = `${CACHE_ROOT}-images`;

const OFFLINE_FALLBACK_BODY = {
  offline: true,
  message: 'You appear to be offline. Showing cached menu content.'
};

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
];

function isProbablyStaticFile(url) {
  return url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf');
}

function isMenuApiRequest(url) {
  return url.pathname === '/api/menu-items' || url.href.includes('/api/menu-items');
}

async function cachePut(cache, request, response) {
  try {
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
  } catch {
    // ignore
  }
}

async function getCachedResponse(cache, request) {
  const cached = await cache.match(request);
  return cached || null;
}

async function safeJsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const appShellCache = await caches.open(APP_SHELL_CACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (u) => {
          try {
            const res = await fetch(u, { cache: 'no-store' });
            if (res && res.ok) {
              await appShellCache.put(u, res);
            }
          } catch {
            // ignore missing files
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE && !k.includes('dmenu-cache-'))
          .map((k) => caches.delete(k))
      );

      await Promise.all(
        keys
          .filter((k) => k.startsWith('dmenu-cache-') && k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE && k !== MENU_API_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (isMenuApiRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(MENU_API_CACHE);
        const cached = await getCachedResponse(cache, request);

        const fetchPromise = (async () => {
          try {
            const fresh = await fetch(request);
            if (fresh && fresh.ok) {
              await cachePut(cache, request, fresh);
              return fresh;
            }
            return null;
          } catch {
            return null;
          }
        })();

        if (!navigator.onLine && cached) return cached;

        const fresh = await fetchPromise;
        if (fresh) return fresh;
        if (cached) return cached;

        return safeJsonResponse(OFFLINE_FALLBACK_BODY, 503);
      })()
    );
    return;
  }

  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      (async () => {
        const appShellCache = await caches.open(APP_SHELL_CACHE);
        const cached = await getCachedResponse(appShellCache, request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res && res.ok) {
            await cachePut(appShellCache, request, res);
            return res;
          }
          return cached || res;
        } catch {
          const indexCached = await appShellCache.match('/index.html');
          return indexCached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  if (url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
    event.respondWith(
      (async () => {
        const imageCache = await caches.open(IMAGE_CACHE);
        const cached = await getCachedResponse(imageCache, request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res && res.ok) {
            await cachePut(imageCache, request, res);
            return res;
          }
          return cached || res;
        } catch {
          return cached || new Response('', { status: 504 });
        }
      })()
    );
    return;
  }

  if (isProbablyStaticFile(url)) {
    event.respondWith(
      (async () => {
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        const cached = await getCachedResponse(runtimeCache, request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res && res.ok) {
            await cachePut(runtimeCache, request, res);
            return res;
          }
          return cached || res;
        } catch {
          return cached || new Response('', { status: 504 });
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      try {
        const res = await fetch(request);
        if (res && res.ok) {
          await cachePut(runtimeCache, request, res);
          return res;
        }
      } catch {
        // ignore
      }

      const cached = await getCachedResponse(runtimeCache, request);
      if (cached) return cached;
      return new Response('', { status: 504 });
    })()
  );
});

