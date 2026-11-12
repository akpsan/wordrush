/** Offline play: register the service worker (public/sw.js) in production builds only, so dev reloads stay fresh. */
export function registerOffline(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline play is a bonus: the game works the same without it.
    });
  });
}
