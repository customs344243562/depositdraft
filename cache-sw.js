/* global caches, fetch, self */

// Fill here with your cache name-version.
const CACHE_NAME = 'depositdraft-cache-v1'
// This is the list of URLs to be cached by your Progressive Web App.
const CACHED_URLS = [
  "/",
  "/index.html",
  "https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js",
  "https://unpkg.com/@picocss/pico@latest/css/pico.min.css",
  "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css",
  "https://unpkg.com/boxicons@2.1.4/fonts/boxicons.woff2",
  "https://unpkg.com/jquery@3/dist/jquery.min.js",
  "https://unpkg.com/bootstrap@4/dist/js/bootstrap.bundle.min.js",
  "/favicon.png",
  "/ios/16.png",
  "/ios/32.png",
  "/android/android-launchericon-512-512.png",
  "/android/android-launchericon-192-192.png",
]

// Open cache on install.
self.addEventListener('install', event => {
  event.waitUntil(async function () {
    const cache = await caches.open(CACHE_NAME)

    await cache.addAll(CACHED_URLS)
  }())
})

// Cache and update with stale-while-revalidate policy.
self.addEventListener('fetch', event => {
  try {
	  const { request } = event

	  // Prevent Chrome Developer Tools error:
	  // Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
	  //
	  // See also https://stackoverflow.com/a/49719964/1217468
	  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
		return
	  }

	  event.respondWith(async function () {
		const cache = await caches.open(CACHE_NAME)

		const cachedResponsePromise = await cache.match(request)
		const networkResponsePromise = fetch(request)

		if (request.url.startsWith(self.location.origin)) {
		  event.waitUntil(async function () {
			const networkResponse = await networkResponsePromise

			await cache.put(request, networkResponse.clone())
		  }())
		}

		return cachedResponsePromise || networkResponsePromise
	  }())
	}
	catch {
		return
	}
})

// Clean up caches other than current.
self.addEventListener('activate', event => {
  event.waitUntil(async function () {
    const cacheNames = await caches.keys()

    await Promise.all(
      cacheNames.filter((cacheName) => {
        const deleteThisCache = cacheName !== CACHE_NAME

        return deleteThisCache
      }).map(cacheName => caches.delete(cacheName))
    )
  }())
})
