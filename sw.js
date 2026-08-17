// Minimal service worker with no caching — its only job is to satisfy
// Chrome's PWA "installability" requirement (a controlled fetch handler),
// which is what makes "Add to Home Screen" use the manifest icon instead
// of falling back to a generic shortcut icon. Everything just passes
// straight through to the network.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
