// Service Worker básico para activar la instalación nativa
const CACHE_NAME = 'aguapura-v1';

self.addEventListener('install', (e) => {
  console.log('Service Worker instalado');
});

self.addEventListener('fetch', (e) => {
  // Permite que la app cargue de forma normal
  e.respondWith(fetch(e.request));
});
