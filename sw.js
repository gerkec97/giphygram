const version = '1.0'
const appAssets = [
  'index.html',
  'main.js',
  'images/flame.png',
  'images/icon.png',
  'images/launch.png',
  'images/logo.png',
  'images/sync.png',
  'vendor/bootstrap.min.css',
  'vendor/jquery.min.js'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(`static-${version}`).then(cache => {
      cache.addAll(appAssets)
    })
  )
})

self.addEventListener('activate', e => {
  const cleaned = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== `static-${version}` && key.match('static-')) {
        return caches.delete(key)
      }
    })
  })
  e.waitUntil(cleaned)
})

// Cache with network fallback strategy
const staticCache = (req) => {
  return caches.match(req).then(cachedResponse => {
    if (cachedResponse) return cachedResponse

    return fetch(req).then(networkResponse => {
      caches.open(`static-${version}`).then(cache => {
        cache.put(req, networkResponse.clone())
        return networkResponse
      })
    })
  })
}

self.addEventListener('fetch', e => {
  // App Shell resources only
  if (e.request.url.match(location.origin)) {
    e.respondWith(staticCache(e.request))
  }
})