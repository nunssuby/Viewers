// https://developers.google.com/web/tools/workbox/guides/troubleshoot-and-debug

//
// Uncomment the 'Embedded version' and use the 'Internet version' if
// the internet version is preferred. Make sure to use the correct
// version though.
//

// Embedded version
importScripts('/third_party/workbox/workbox-v5.1.4/workbox-sw.js');

workbox.setConfig({
  modulePathPrefix: '/third_party/workbox/workbox-v5.1.4/',
});

// Internet version
/*
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/5.0.0-beta.1/workbox-sw.js'
);
*/

// Immediately activate any updated worker.
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// This worker intentionally removes old SW state/caches and unregisters itself.
// We do this to avoid stale JS bundle delivery from prior runtime-cache strategy.
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(cacheKey => caches.delete(cacheKey)));

      await self.registration.unregister();

      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      clients.forEach(client => client.navigate(client.url));
    })()
  );
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// TODO: Cache API
// https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/cache-api
// Store DICOMs?
// Clear Service Worker cache?
// navigator.storage.estimate().then(est => console.log(est)); (2GB?)
