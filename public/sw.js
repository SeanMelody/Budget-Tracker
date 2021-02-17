// Const for static cache and data cache
const staticCache = "site-static";
const dataCache = "data-cache";

// Set the assets to be saved
const assets = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/styles.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "./manifest.json",
    "./icons/Favicon.png"
];

// install the service worker
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(staticCache).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(assets);
        })
    );
    self.skipWaiting();
});

// add the service worker
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== staticCache && key !== dataCache) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});


// event listener for the fetch request
self.addEventListener("fetch", function (evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(dataCache).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }

    // if the request is not for the API, serve static assets using "offline-first" approach.
    evt.respondWith(
        caches.match(evt.request).then(function (response) {
            return response || fetch(evt.request);
        })
    );
});