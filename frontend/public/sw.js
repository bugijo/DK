// frontend/public/sw.js
// Service Worker para Dungeon Keeper PWA

const CACHE_NAME = 'dungeon-keeper-v1.0.0';
const STATIC_CACHE = 'dk-static-v1';
const DYNAMIC_CACHE = 'dk-dynamic-v1';
const API_CACHE = 'dk-api-v1';

// Assets para cache offline
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico'
];

// URLs da API para cache
const API_URLS = [
  '/api/v1/tables',
  '/api/v1/characters',
  '/api/v1/items',
  '/api/v1/monsters',
  '/api/v1/npcs',
  '/api/v1/stories'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Configuração de rotas
const ROUTE_CONFIG = {
  // Assets estáticos - cache first
  static: {
    pattern: /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
  },
  // API de dados estáticos - stale while revalidate
  staticApi: {
    pattern: /\/api\/v1\/(items|monsters|npcs|stories)/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: API_CACHE,
    maxAge: 60 * 60 * 1000 // 1 hora
  },
  // API dinâmica - network first
  dynamicApi: {
    pattern: /\/api\/v1\/(tables|characters|users)/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    maxAge: 5 * 60 * 1000 // 5 minutos
  },
  // Autenticação - network only
  auth: {
    pattern: /\/api\/v1\/(token|register|refresh|logout)/,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY
  },
  // WebSocket - network only
  websocket: {
    pattern: /\/ws\//,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY
  },
  // Páginas - network first com fallback
  pages: {
    pattern: /\/(tables|characters|tools|settings)/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    fallback: '/'
  }
};

// Event Listeners
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Remove caches antigos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Determina a estratégia de cache
  const strategy = getStrategy(request);
  
  if (strategy) {
    event.respondWith(handleRequest(request, strategy));
  }
});

// Determina a estratégia baseada na URL
function getStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Verifica cada configuração de rota
  for (const [name, config] of Object.entries(ROUTE_CONFIG)) {
    if (config.pattern.test(pathname)) {
      return config;
    }
  }
  
  // Estratégia padrão para outras requisições
  return {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    maxAge: 5 * 60 * 1000
  };
}

// Manipula requisições baseado na estratégia
async function handleRequest(request, config) {
  const { strategy, cacheName, maxAge, fallback } = config;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, maxAge);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, maxAge, fallback);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, maxAge);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request, cacheName);
    
    default:
      return fetch(request);
  }
}

// Estratégia Cache First
async function cacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Fallback para cache expirado
    }
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName, maxAge, fallback) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
    
    // Fallback para páginas
    if (fallback && request.mode === 'navigate') {
      const fallbackResponse = await cache.match(fallback);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    throw error;
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Atualiza em background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {});
  
  // Retorna cache se disponível, senão espera network
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }
  
  return fetchPromise;
}

// Estratégia Cache Only
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  return cache.match(request);
}

// Verifica se resposta está expirada
function isExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseTime = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - responseTime) > maxAge;
}

// Background Sync para requisições offline
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Executa sincronização em background
async function doBackgroundSync() {
  try {
    // Aqui você pode implementar lógica para sincronizar dados
    // quando a conexão for restaurada
    console.log('[SW] Performing background sync...');
    
    // Exemplo: reenviar requisições falhadas
    // await replayFailedRequests();
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received:', event);
  
  const options = {
    body: 'Nova atividade na sua mesa de RPG!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Mesa',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Dungeon Keeper', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/tables')
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Utilitários
function log(message, ...args) {
  console.log(`[SW] ${message}`, ...args);
}

function logError(message, error) {
  console.error(`[SW] ${message}`, error);
}