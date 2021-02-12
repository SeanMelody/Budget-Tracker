console.log("service worker connected")

const staticCache = "site-static";
const dataCache = "data-cache";

const assets = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "./manifest.json"
];

// self.addEventListener("install", (evt) => {
//     // when service worker has been installed
//     const preCache = async () => {
//         try {
//             const cache = await caches.open(staticCache);
//             cache.addAll(assets);
//             console.log("Service Worker Installed");
//         } catch (err) {
//             console.log("Problems installing Cache");
//         }
//     };
//     evt.waitUntil(preCache());
// });

// self.addEventListener("activate", (evt) => {
//     // grab keys from caches

//     const getKeys = async () => {
//         try {
//             const keys = await caches.keys();
//             console.log("Service Worker Activated")
//             console.log(keys);
//             return keys
//                 .filter((key) => key !== staticCache && key !== dataCache)
//                 .map((key) => caches.delete(key));
//         } catch (err) {
//             console.log(err);
//         }
//     };

//     evt.waitUntil(getKeys());
// });

// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(staticCache).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(assets);
        })
    );

    self.skipWaiting();
});

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


// fetch
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
    // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
    evt.respondWith(
        caches.match(evt.request).then(function (response) {
            return response || fetch(evt.request);
        })
    );
});

// self.addEventListener("fetch", (evt) => {
//     console.log("there was a fetch: ", evt);

//     const cacheResponse = async () => {
//         try {
//             const catchResponse = await caches.match(evt.request);
//             return catchResponse || fetch(evt.request);
//         } catch (err) {
//             console.log("fetch Request Error", err)
//         }

//     }

//     evt.respondWith(cacheResponse())
// })
