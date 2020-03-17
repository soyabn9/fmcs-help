
var VERSION = "v3";

var cacheFirstFiles = [
  "/assets/"
];

var networkFirstFiles = [
  "/",
  "/index.html",
  "/404.html",
  "/sitemap.xml",
  "/sitemap.xml.gz",
  "/tos/",
  "/youtube-channel/",
  "/getting-started/",
  "/java/",
  "/nukkit/",
  "/site-builder/",
  "/search/",
  "/discord-server/",
  "/javascripts/",
  "/stylesheets/"
];

var cacheFiles = cacheFirstFiles.concat(networkFirstFiles);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }
  if (networkFirstFiles.indexOf(event.request.url) !== -1) {
    event.respondWith(networkElseCache(event));
    return;
  } else if (cacheFirstFiles.indexOf(event.request.url) !== -1) {
    event.respondWith(cacheElseNetwork(event));
    return;
  } else {
    event.respondWith(fetch(event.request));
  }
});

function cacheElseNetwork(event) {
  return caches.match(event.request).then(response => {
    function fetchAndCache() {
      return fetch(event.request).then(response => {
        caches
          .open(VERSION)
          .then(cache => cache.put(event.request, response.clone()));
        return response;
      });
    }

    if (!response) {
      return fetchAndCache();
    }

    fetchAndCache();
    return response;
  });
}

function networkElseCache(event) {
  return caches.match(event.request).then(match => {
    if (!match) {
      return fetch(event.request);
    }
    return fetch(event.request).then(response => {
      caches
        .open(VERSION)
        .then(cache => cache.put(event.request, response.clone()));
      return response;
    });
  });
}
