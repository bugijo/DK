export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/v1/register',
    LOGIN: '/api/v1/token',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
  },
  TABLES: {
    BASE: '/tables/',
    BY_ID: (tableId: string) => `/tables/${tableId}`,
    JOIN_REQUEST: (tableId: string) => `/tables/${tableId}/join`,
    APPROVE_JOIN: (tableId: string, requestId: string) => `/tables/${tableId}/join-requests/${requestId}/approve`,
    DECLINE_JOIN: (tableId: string, requestId: string) => `/tables/${tableId}/join-requests/${requestId}/decline`,
  },
  CHARACTERS: {
    BASE: '/characters/',
    BY_ID: (characterId: string) => `/characters/${characterId}`,
  },
  ITEMS: {
    BASE: '/items/',
    BY_ID: (itemId: string) => `/items/${itemId}`,
  },
  MONSTERS: {
    BASE: '/monsters/',
    BY_ID: (monsterId: string) => `/monsters/${monsterId}`,
  },
  NPCS: {
    BASE: '/npcs/',
    BY_ID: (npcId: string) => `/npcs/${npcId}`,
  },
  STORIES: {
    BASE: '/stories/',
    BY_ID: (storyId: string) => `/stories/${storyId}`,
  },
  USER: {
    PROFILE: '/users/me',
    AVATAR: '/users/me/avatar',
    NOTIFICATIONS: '/users/me/notifications',
    INVENTORY: '/users/me/inventory',
    IMPORT: '/users/import',
  },
} as const;

// Tipo para garantir type safety ao usar as rotas
export type ApiRoutes = typeof API_ROUTES;