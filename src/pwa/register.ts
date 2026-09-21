/** Registers the no-op service worker for installability. Safe no-op when unsupported. */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability is best-effort; the app works without it.
    })
  })
}
