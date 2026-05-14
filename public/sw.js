// Service Worker placeholder to resolve 404 warnings from browser extensions or cached requests.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
