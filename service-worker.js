"use strict";

/* A version number is useful when updating the worker logic,
   allowing you to remove outdated cache entries during the update.
*/
const VERSION = 'v1::';

const OFFLINE_FUNDAMENTALS = [
  "/",
  "/static/css/index.css",
  "/static/js/index.js",
];

/* The install event fires when the service worker is first installed.
   You can use this event to prepare the service worker to be able to serve
   files while visitors are offline.
*/
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches
      .open(VERSION + "cached")
      .then(function(cache) {
        return cache.addAll(OFFLINE_FUNDAMENTALS);
      })
    )
});

self.addEventListener("fetch", function(event) {
  /* We should only cache GET requests, and deal with the rest of method in the
     client-side, by handling failed POST,PUT,PATCH,etc. requests.
  */
  if (event.request.method !== 'GET') {
    /* If we don't block the event as shown below, then the request will go to
       the network as usual.
    */
    return;
  }
  /*
  Respond to all other fetch events from cache, falling back to network is there's a cache miss
  */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      let networked = fromNetwork(event.request, 5000).catch( () => {
        return fromCache(event.request);
      });
      return cached || networked;
    })
  );
 });

 /* Time limited network request. If the network fails or the response is not
   served before timeout, the promise is rejected.
*/
function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    // Reject in case of timeout.
    let timeoutId = setTimeout(reject, timeout);
    // Fulfill and store in cache in case of success.
    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      /* We copy the response before fulfilling the promise.
         This is the response that will be stored on the ServiceWorker cache.
      */
      let cacheCopy = response.clone();
      caches
        // We open a cache to store the response for this request.
        .open(VERSION + 'cached')
        .then(function add(cache) {
          /* We store the response for this request. It'll later become
             available to caches.match(event.request) calls, when looking
             for cached responses.
          */
          cache.put(request, cacheCopy);
      });
      fulfill(response);
    // Reject also if network fetch rejects.
    }, reject);
  });
}

/* Open the cache where the assets were stored and search for the requested
   resource. If the resource isn't found, then return offline page
*/
function fromCache(request) {
  return caches.open(VERSION + 'cached').then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching;
    });
  });
}

/* The activate event fires after a service worker has been successfully installed.
   It is most useful when phasing out an older version of a service worker, as at
   this point you know that the new worker was installed correctly. In this example,
   we delete old caches that don't match the version in the worker we just finished
   installing.
*/
self.addEventListener("activate", function(event) {
  /* Just like with the install event, event.waitUntil blocks activate on a promise.
     Activation will fail unless the promise is fulfilled.
  */
  event.waitUntil(
    caches
      /* This method returns a promise which will resolve to an array of available
         cache keys.
      */
      .keys()
      .then(function (keys) {
        // We return a promise that settles when all outdated caches are deleted.
        return Promise.all(
          keys
            .filter(function (key) {
              // Filter by keys that don't start with the latest version prefix.
              return !key.startsWith(VERSION);
            })
            .map(function (key) {
              /* Return a promise that's fulfilled
                 when each outdated cache is deleted.
              */
              return caches.delete(key);
            })
        );
      })
  );
});