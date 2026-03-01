

const CACHE = "gym-cache-v1";
const ASSETS = [
    ".",
    "index.html",
    "style.css",
    "app.js",
    "db.js",
    "notifications.js",
    "manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
        )
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

// BACKGROUND SYNC
self.addEventListener("sync", event => {
    if (event.tag === "sync-gym") {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    const dbReq = indexedDB.open("gymDB");
    dbReq.onsuccess = e => {
        const db = e.target.result;
        const tx = db.transaction("syncQueue", "readwrite");
        const store = tx.objectStore("syncQueue");

        store.getAll().onsuccess = res => {
            res.target.result.forEach(item => console.log("SYNCING:", item));
            store.clear();
        };
    };
}

// PUSH
self.addEventListener("push", e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, { body: data.body, icon: "slika_pwa.png" });
});