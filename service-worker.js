// service-worker.js
const CACHE_NAME = 'arvore-v2';
const urlsToCache = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'dados.json',
  // Adicione aqui todos os arquivos, incluindo o FamilyTree.js e suas fotos
  'icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});