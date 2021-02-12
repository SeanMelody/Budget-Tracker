console.log("service worker connected")

const staticCache = "site-static-v2";

const assets = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
];

self.addEventListener("install", (evt) => {
    // when service worker has been installed

    console.log("Service Worker Installed");

    const preCache = async () => {
        try {
            const cache = await caches.open(staticCache);
            cache.addAll(assets);
        } catch (err) {
            console.log("problems happened installing Cache");
        }
    };

    evt.waitUntil(preCache());
});

self.addEventListener("activate", (evt) => {
    // grab keys from caches

    const getKeys = async () => {
        try {
            const keys = await caches.keys();
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
            const catchReponse = await caches.match(evt.request);
            return catchReponse || fetch(evt.request);
        } catch (err) {
            console.log(err);
        }
    };

    evt.respondWith(cacheResponse());
});