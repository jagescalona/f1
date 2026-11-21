var CACHE = 'f1-1dd0f5dc5228';
var PROPIOS = ["./", "index.html", "manifest.webmanifest", "iconos/icon-192.png", "iconos/icon-512.png", "iconos/icon-maskable-192.png", "iconos/icon-maskable-512.png", "iconos/apple-touch-icon.png"];
var COMUNES = ['/comun/jag-mini.svg', '/comun/jag-mini-oscuro.svg', '/comun/letras/AtkinsonHyperlegibleNext-400.woff2',
               '/comun/letras/AtkinsonHyperlegibleNext-800.woff2'];
self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(PROPIOS).then(function () {
      return Promise.all(COMUNES.map(function (u) { return c.add(u).catch(function () {   }); }));
    });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('f1-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (ev) {
  var r = ev.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url), base = new URL('./', self.registration.scope).pathname;
  if (u.origin !== location.origin || (u.pathname.indexOf(base) !== 0 && u.pathname.indexOf('/comun/') !== 0)) return;
  ev.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(r, { ignoreSearch: true }).then(function (guardada) {
      var red = fetch(r).then(function (resp) {
        if (resp && resp.ok) return c.put(r, resp.clone()).then(function () { return resp; });
        return resp;
      });
      if (guardada) { ev.waitUntil(red.catch(function () {   })); return guardada; }
      return red.catch(function () {
        return r.mode === 'navigate' ? c.match('./').then(function (p) { return p || Response.error(); }) : Response.error();
      });
    });
  }));
});