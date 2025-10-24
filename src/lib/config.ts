// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 10000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Events
  EVENTS: {
    LIST: '/events',
    DETAIL: '/events',
    CREATE: '/events',
    UPDATE: '/events',
    DELETE: '/events',
    REGISTER: '/events',
    ANALYTICS: '/events',
  },

  // Payments
  PAYMENTS: {
    MOCK: '/payments/mock',
    HISTORY: '/payments',
    STATS: '/payments/stats',
    REFUND: '/payments',
  },

  // Tickets
  TICKETS: {
    ISSUE: '/tickets/issue',
    USER_TICKETS: '/tickets',
    DETAIL: '/tickets/detail',
    CANCEL: '/tickets',
    TRANSFER: '/tickets',
    EVENT_TICKETS: '/tickets/event',
    VALIDATE: '/tickets/validate',
  },

  // Seatmap
  SEATMAP: {
    GET: '/seatmap',
    RESERVE: '/seatmap/reserve',
    CANCEL_RESERVATION: '/seatmap/reserve',
    AVAILABLE: '/seatmap',
    AVAILABILITY: '/seatmap',
    PRICING: '/seatmap',
    UPDATE_PRICING: '/seatmap',
  },

  // Reservations
  RESERVATIONS: {
    CREATE: '/reservations',
    USER_RESERVATIONS: '/reservations',
    EXTEND: '/reservations',
    CANCEL: '/reservations',
    CONFIRM: '/reservations',
    DETAIL: '/reservations',
    CLEANUP: '/reservations/cleanup',
  },

  // Organizer
  ORGANIZER: {
    DASHBOARD: '/organizer/dashboard',
    EVENTS: '/organizer/events',
    EVENT_ANALYTICS: '/organizer/events',
    STAFF: '/organizer/staff',
    SPONSORS: '/organizer/sponsors',
    VENDORS: '/organizer/vendors',
    PROFILE: '/organizer/profile',
  },
};