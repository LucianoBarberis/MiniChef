/* MiniChef service worker (v1): install/activate only, no fetch handler.
 * Offline cache is an explicit v1 non-goal; this file exists for installability. */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
