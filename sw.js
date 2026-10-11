const CACHE = 'la-palma-app-v5';
const CORE = ['./', './index.html', './icon.svg', './icon-192.png', './manifest.webmanifest', './profiles.js', './profiles.css', './search.js', './search.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('la-palma-app-') && key !== CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode !== 'navigate') {
    const file = url.pathname.split('/').pop();
    if (['profiles.js', 'profiles.css', 'search.js', 'search.css', 'icon.svg', 'icon-192.png', 'manifest.webmanifest'].includes(file)) {
      event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    }
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE)
          .then((cache) => cache.put('./index.html', copy))
          .catch(() => {});
      }
      return response;
    }).catch(() => caches.match('./index.html'))
  );
});
