/**
 * NAVI SERVICE WORKER
 * ===================
 *
 * Advanced service worker for offline functionality and performance optimization
 * - App shell caching for instant loading
 * - API response caching with smart invalidation
 * - Font and asset caching for faster rendering
 * - Offline fallbacks for critical features
 * - Background sync for data updates
 */

// Cache configuration
const CACHE_NAME = 'navi-cache-v1'
const RUNTIME_CACHE = 'navi-runtime-v1'
const API_CACHE = 'navi-api-v1'
const ASSETS_CACHE = 'navi-assets-v1'

// Cache strategies
const CACHE_STRATEGIES = {
  // App shell - cache first, essential for offline
  APP_SHELL: 'cache-first',
  // API calls - network first with cache fallback
  API: 'network-first',
  // Assets - cache first with network fallback
  ASSETS: 'cache-first',
  // Dynamic content - network first
  DYNAMIC: 'network-first',
}

// Files to cache immediately (app shell)
const APP_SHELL_FILES = [
  '/',
  '/manifest.json',
  // Core CSS and JS will be added dynamically
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/studios',
  '/api/jobs',
  '/api/user/profile',
  '/api/user/settings',
  '/proxy/remoteok',
]

// Assets to cache
const CACHEABLE_ASSETS = [
  /\.(css|js|woff2?|ttf|eot|svg|png|jpg|jpeg|webp|gif|ico)$/,
  /\/assets\//,
  /materialdesignicons/,
]

// Install event - cache app shell
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell files')
        return cache.addAll(APP_SHELL_FILES)
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully')
        // Force activation of new service worker
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Failed to cache app shell:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Remove caches that don't match current version
              return (
                cacheName.startsWith('navi-') &&
                ![CACHE_NAME, RUNTIME_CACHE, API_CACHE, ASSETS_CACHE].includes(
                  cacheName
                )
              )
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Take control of all pages
      self.clients.claim(),
    ]).then(() => {
      console.log('[SW] Service worker activated successfully')
    })
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different request types
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request))
  } else if (isAssetRequest(url)) {
    event.respondWith(handleAssetRequest(request))
  } else if (isAppShellRequest(url)) {
    event.respondWith(handleAppShellRequest(request))
  } else {
    event.respondWith(handleDynamicRequest(request))
  }
})

// Check if request is for API
function isApiRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/proxy/') ||
    CACHEABLE_APIS.some(pattern => url.pathname.includes(pattern))
  )
}

// Check if request is for static assets
function isAssetRequest(url) {
  return CACHEABLE_ASSETS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(url.pathname)
    }
    return url.pathname.includes(pattern)
  })
}

// Check if request is for app shell
function isAppShellRequest(url) {
  return (
    url.pathname === '/' ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/jobs') ||
    url.pathname.startsWith('/portfolio') ||
    url.pathname.startsWith('/settings')
  )
}

// Handle API requests - Network first with cache fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      // Clone response for caching
      const responseClone = networkResponse.clone()

      // Add cache headers
      const headers = new Headers(responseClone.headers)
      headers.set('sw-cached', new Date().toISOString())

      const cachedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      })

      cache.put(request, cachedResponse)
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for API, trying cache:', request.url)

    // Try cache as fallback
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      console.log('[SW] Serving API from cache:', request.url)
      return cachedResponse
    }

    // Return offline response
    return createOfflineResponse(request)
  }
}

// Handle asset requests - Cache first with network fallback
async function handleAssetRequest(request) {
  const cache = await caches.open(ASSETS_CACHE)

  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    console.log('[SW] Serving asset from cache:', request.url)
    return cachedResponse
  }

  try {
    // Try network as fallback
    console.log('[SW] Fetching asset from network:', request.url)
    const networkResponse = await fetch(request)

    // Cache the asset
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch asset:', request.url, error)

    // Return placeholder for images or generic error
    if (request.url.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) {
      return createPlaceholderImage()
    }

    throw error
  }
}

// Handle app shell requests - Cache first with network fallback
async function handleAppShellRequest(request) {
  const cache = await caches.open(CACHE_NAME)

  // Try cache first for app shell
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    console.log('[SW] Serving app shell from cache:', request.url)
    return cachedResponse
  }

  try {
    // Try network as fallback
    const networkResponse = await fetch(request)

    // Cache the response
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for app shell, serving offline page')
    return createOfflinePage()
  }
}

// Handle dynamic requests - Network first
async function handleDynamicRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE)

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Cache successful responses (with size limit)
    if (
      networkResponse.ok &&
      networkResponse.headers.get('content-length') < 1024 * 1024
    ) {
      // 1MB limit
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for dynamic content, trying cache')

    // Try cache as fallback
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    throw error
  }
}

// Create offline response for API calls
function createOfflineResponse(request) {
  const offlineData = {
    error: 'offline',
    message: 'This data is not available offline',
    cached: false,
    timestamp: new Date().toISOString(),
  }

  return new Response(JSON.stringify(offlineData), {
    status: 200,
    statusText: 'OK (Offline)',
    headers: {
      'Content-Type': 'application/json',
      'sw-offline': 'true',
    },
  })
}

// Create offline page
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NAVI - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          padding: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .logo { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
        .message { font-size: 1.25rem; margin-bottom: 2rem; }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="logo">NAVI</div>
      <div class="message">
        You're currently offline<br>
        Some features may not be available
      </div>
      <button class="retry-btn" onclick="window.location.reload()">
        Try Again
      </button>
      <script>
        // Auto-retry when online
        window.addEventListener('online', () => {
          window.location.reload();
        });
      </script>
    </body>
    </html>
  `

  return new Response(offlineHTML, {
    status: 200,
    statusText: 'OK (Offline)',
    headers: { 'Content-Type': 'text/html' },
  })
}

// Create placeholder image
function createPlaceholderImage() {
  // Simple SVG placeholder
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="system-ui" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        Image unavailable offline
      </text>
    </svg>
  `

  return new Response(svg, {
    status: 200,
    statusText: 'OK (Placeholder)',
    headers: { 'Content-Type': 'image/svg+xml' },
  })
}

// Background sync for data updates
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag)

  if (event.tag === 'background-sync-jobs') {
    event.waitUntil(syncJobs())
  } else if (event.tag === 'background-sync-profile') {
    event.waitUntil(syncProfile())
  }
})

// Sync jobs data in background
async function syncJobs() {
  try {
    console.log('[SW] Syncing jobs data in background')

    const response = await fetch('/api/jobs')
    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put('/api/jobs', response.clone())
      console.log('[SW] Jobs data synced successfully')
    }
  } catch (error) {
    console.error('[SW] Failed to sync jobs data:', error)
  }
}

// Sync profile data in background
async function syncProfile() {
  try {
    console.log('[SW] Syncing profile data in background')

    const response = await fetch('/api/user/profile')
    if (response.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put('/api/user/profile', response.clone())
      console.log('[SW] Profile data synced successfully')
    }
  } catch (error) {
    console.error('[SW] Failed to sync profile data:', error)
  }
}

// Handle push notifications (for future implementation)
self.addEventListener('push', event => {
  console.log('[SW] Push notification received')

  const options = {
    body: 'New job opportunities available!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'job-notification',
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'View Jobs' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('NAVI - Career Assistant', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/jobs'))
  }
})

// Message handling for communication with main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status)
    })
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCaches().then(result => {
      event.ports[0].postMessage(result)
    })
  }
})

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {
    caches: {},
    total: 0,
  }

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    status.caches[cacheName] = keys.length
    status.total += keys.length
  }

  return status
}

// Clear all caches
async function clearCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))

  return { cleared: cacheNames.length }
}
