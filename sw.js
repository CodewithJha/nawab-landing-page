// Cache-first service worker so the booth screen reloads offline.
var CACHE = "nawab-booth-v5";
var FILES = ["./", "index.html", "booth.css", "mascot.css", "booth.js", "favicon.png", "qr-nawab.svg", "lucknow-motif.webp",
  "fonts/fredoka-latin.woff2", "fonts/googlesans-latin.woff2", "fonts/googlesans-symbols.woff2",
  "fonts/cormorant-latin-300.woff2", "fonts/cormorant-latin-300italic.woff2"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  // drop caches from older versions so a redeploy shows up
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request);
  }));
});
