/**
 * API endpoint constants
 * CRITICAL: NO MAGIC STRINGS - All API endpoints must be defined here
 */

// Base API URL - Environment dependent
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API Versions - using general naming for flexibility
export const API_VERSION = {
  CURRENT: '/api/admin/v1',
} as const;

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_VERSION.CURRENT}/auth/login`,
  LOGOUT: `${API_VERSION.CURRENT}/auth/logout`, 
  REFRESH: `${API_VERSION.CURRENT}/auth/refresh`,
  VERIFY: `${API_VERSION.CURRENT}/auth/verify`,
  ME: `${API_VERSION.CURRENT}/auth/me`,
} as const;

// User Management Endpoints
export const USER_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/users`,
  CREATE: `${API_VERSION.CURRENT}/users`,
  GET: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  UPDATE: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  TOGGLE_STATUS: (id: string) => `${API_VERSION.CURRENT}/users/${id}/toggle-status`,
} as const;

// Booking Management Endpoints
export const BOOKING_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/bookings`,
  CREATE: `${API_VERSION.CURRENT}/bookings`,
  GET: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  UPDATE: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  UPDATE_STATUS: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}/status`,
} as const;

// Payment Management Endpoints
export const PAYMENT_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/payments`,
  GET: (id: string) => `${API_VERSION.CURRENT}/payments/${id}`,
  REFUND: (id: string) => `${API_VERSION.CURRENT}/payments/${id}/refund`,
  TRANSACTIONS: `${API_VERSION.CURRENT}/payments/transactions`,
} as const;

// Review Management Endpoints
export const REVIEW_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/reviews`,
  GET: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}`,
  MODERATE: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}/moderate`,
  RESPOND: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}/respond`,
} as const;

// Analytics Endpoints
export const ANALYTICS_ENDPOINTS = {
  DASHBOARD: `${API_VERSION.CURRENT}/analytics/dashboard`,
  USERS: `${API_VERSION.CURRENT}/analytics/users`,
  BOOKINGS: `${API_VERSION.CURRENT}/analytics/bookings`,
  PAYMENTS: `${API_VERSION.CURRENT}/analytics/payments`,
  REVIEWS: `${API_VERSION.CURRENT}/analytics/reviews`,
} as const;

// Common query parameters
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  SORT: 'sort',
  ORDER: 'order',
  FILTER: 'filter',
} as const;

// Default pagination
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
} as const;