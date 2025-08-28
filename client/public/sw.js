// Service Worker for Push Notifications and Offline Support
const CACHE_NAME = 'im-host-v1';
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Only cache essential files in development
const urlsToCache = isDevelopment ? [
  '/manifest.json',
  '/placeholder.svg'
] : [
  '/',
  '/manifest.json',
  '/placeholder.svg',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files:', urlsToCache);
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  self.clients.claim();
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Skip all development server requests
  if (isDevelopment) {
    // Skip all Vite development requests
    if (url.includes('@vite') || 
        url.includes('@react-refresh') ||
        url.includes('/@fs/') ||
        url.includes('?import') ||
        url.includes('?direct') ||
        url.includes('?t=') ||
        url.includes('.ts?') ||
        url.includes('.tsx?') ||
        url.includes('node_modules') ||
        url.includes('src/') ||
        event.request.method !== 'GET') {
      // Let the browser handle these requests normally
      return;
    }
  }

  // Only handle navigation requests and static assets in development
  if (isDevelopment && !event.request.mode === 'navigate' && !url.includes('/manifest.json') && !url.includes('/placeholder.svg')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch((error) => {
          console.warn('Fetch failed for:', event.request.url, error);
          
          // Only provide fallbacks for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/').then(cachedResponse => {
              return cachedResponse || new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
          }
          
          // For other requests, just let them fail naturally
          throw error;
        });
      })
  );
});

// Push event for notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/placeholder.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/placeholder.svg'
      }
    ]
  };

  let notificationData;
  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (e) {
    notificationData = { title: 'Im-Host Notification' };
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Im-Host Notification',
      {
        ...options,
        body: notificationData.body || options.body,
        data: notificationData.data || options.data
      }
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any queued offline actions
  const cache = await caches.open(CACHE_NAME);
  // Implementation for syncing offline data when back online
}
