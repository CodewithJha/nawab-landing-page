// Cache-first service worker so the booth screen reloads offline.
var CACHE = "nawab-booth-v1";
var FILES = ["./", "index.html", "booth.css", "mascot.css", "booth.js", "favicon.png",
  "fonts/fredoka-latin.woff2", "fonts/googlesans-latin.woff2", "fonts/googlesans-symbols.woff2",
  "fonts/cormorant-latin-300.woff2", "fonts/cormorant-latin-300italic.woff2"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request);
  }));
});
