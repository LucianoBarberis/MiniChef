/* MiniChef service worker (v1): install/activate only, no fetch handler.
 * Offline cache is an explicit v1 non-goal; this file exists for installability. */

const SW_VERSION = 'minichef-sw-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
  console.info(`[sw] installed ${SW_VERSION}`)
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
  console.info(`[sw] activated ${SW_VERSION}`)
})
