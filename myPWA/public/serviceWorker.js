const assetsToCache = [ // The list of filepaths starting from public that should be cached.
  "/",
  "manifest.json",
  "html/schoolPage.html",
  "js/initServiceWorker.js",
  "js/createTimetable.js",
  "icons/pwaLogo128px.png",
  "icons/pwaLogo192px.png",
  "icons/pwaLogo384px.png",
  "icons/pwaLogo512px.png",
  "images/pwaLogoImage.png",
];

const cachedAssetsList = "cachedAssetsList"; // Name of the cache.

self.addEventListener("install", (installEvt) => { // When serviceWorker is installed.
  installEvt.waitUntil(caches.open(cachedAssetsList).then((cacheEditor) => { // Don't go to the next step until.
    return cacheEditor.addAll(assetsToCache); // You open the cache and write all the files in the list into it.
  })
  .then(() => {
    self.skipWaiting(); // Then skip the waiting step.
  })
  .catch((error) => {
    console.log(error);
  }));
});

self.addEventListener("activate", (activateEvt) => { // Go to activate.
  activateEvt.waitUntil(caches.keys().then((existingCacheLists) => { // Don't end activation step until.
    return Promise.all(existingCacheLists.map((key) => {
      if (key !== cachedAssetsList) { // Check if any of the saved caches don't have the same name as the current one.
        console.log("Removed old cache from", key);
        return caches.delete(key); // And delete them if True.
      }
    }));
  })
  .then(() => self.clients.claim())); // Take control of the tab once this happens.
});

self.addEventListener("fetch", (fetchEvt) => { // When fetch event is fired.
  fetchEvt.respondWith(fetch(fetchEvt.request).catch((error) => { // Respond with what the server serves for the request.
    console.log("Server dont wanna play along cuz: " + error);
    return caches.open(cachedAssetsList).then((cacheEditor) => { // If theres an error when getting the requested file.
      console.log("Unable to fetch requested file, serving from cache instead.")
      return cacheEditor.match(fetchEvt.request); // Try get it from the cache instead (maybe offline).
    });
  }));
})