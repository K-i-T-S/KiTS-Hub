const CACHE_NAME = 'kits-hub-v1';
const STATIC_CACHE_NAME = 'kits-hub-static-v1';
const DYNAMIC_CACHE_NAME = 'kits-hub-dynamic-v1';
const REMOTE_CACHE_NAME = 'kits-hub-remote-v1';

// Cache URLs for static assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// Remote entry points for micro-frontends
const REMOTE_ENTRIES = [
  '/remoteEntry.js',
  '/inventory/remoteEntry.js',
  '/pos/remoteEntry.js',
  '/crm/remoteEntry.js',
  '/hr/remoteEntry.js',
  '/accounting/remoteEntry.js',
  '/analytics/remoteEntry.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== REMOTE_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (isRemoteEntry(request.url)) {
    event.respondWith(handleRemoteEntry(request));
  } else if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle remote entry points (cache-first with network fallback)
async function handleRemoteEntry(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(REMOTE_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
      }).catch(() => {
        // Network error, serve from cache
      });
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(REMOTE_CACHE_NAME);
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to handle remote entry', error);
    return new Response('Service unavailable', { status: 503 });
  }
}

// Handle static assets (cache-first with network fallback)
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to handle static asset', error);
    return new Response('Asset not found', { status: 404 });
  }
}

// Handle API requests (network-first with cache fallback)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('API unavailable', { status: 503 });
  }
}

// Handle navigation requests (serve index.html for SPA routing)
async function handleNavigationRequest(request) {
  try {
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch('/');
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put('/', responseClone);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to handle navigation request', error);
    return new Response('Application unavailable', { status: 503 });
  }
}

// Helper functions
function isRemoteEntry(url) {
  return REMOTE_ENTRIES.some(entry => url.includes(entry));
}

function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.includes('/images/') || 
         url.includes('/fonts/') ||
         url.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('/health');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get all pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        
        // Remove successful action from IndexedDB
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('KiTS Hub', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// IndexedDB helpers for offline storage
async function getPendingActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kits-hub-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };
  });
}

async function removePendingAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kits-hub-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Cache cleanup on storage pressure
self.addEventListener('quotaexceeded', (event) => {
  console.log('Service Worker: Storage quota exceeded, cleaning up old caches');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('kits-hub-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});
