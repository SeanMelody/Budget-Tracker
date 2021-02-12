console.log("service worker connected")

const staticCache = "site-static";

const assets = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
];

self.addEventListener("install", (evt) => {
    // when service worker has been installed
    const preCache = async () => {
        try {
            const cache = await caches.open(staticCache);
            cache.addAll(assets);
            console.log("Service Worker Installed");
        } catch (err) {
            console.log("Problems installing Cache");
        }
    };
    evt.waitUntil(preCache());
});

self.addEventListener("activate", (evt) => {
    // grab keys from caches

    const getKeys = async () => {
        try {
            const keys = await caches.keys();
            console.log("Service Worker Activated")
            console.log(keys);
            return keys
                .filter((key) => key !== staticCache)
                .map((key) => caches.delete(key));
        } catch (err) {
            console.log(err);
        }
    };

    evt.waitUntil(getKeys());
});

self.addEventListener("fetch", (evt) => {
    console.log("there was a fetch: ", evt);

    const cacheResponse = async () => {
        try {
            const catchResponse = await caches.match(evt.request);
            return catchResponse || fetch(evt.request);
        } catch (err) {
            console.log("fetch Request Error", err)
        }

    }

    evt.respondWith(cacheResponse())
})