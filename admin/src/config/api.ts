/**
 * API Configuration & Endpoints
 * CRITICAL: NO MAGIC STRINGS - All API endpoints must be defined here
 * Centralized API configuration for better maintainability
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
  LIST: `${API_VERSION.CURRENT}/users/`,
  CREATE: `${API_VERSION.CURRENT}/users/`,
  GET: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  UPDATE: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/users/${id}`,
  UPDATE_STATUS: (id: string) => `${API_VERSION.CURRENT}/users/${id}/status`,
  SEARCH: `${API_VERSION.CURRENT}/users/search`,
  DASHBOARD: `${API_VERSION.CURRENT}/users/dashboard`,
  ACTIVITY: (id: string) => `${API_VERSION.CURRENT}/users/${id}/activity`,
  NOTIFICATIONS: (id: string) => `${API_VERSION.CURRENT}/users/${id}/notifications`,
  EXPORT: `${API_VERSION.CURRENT}/users/export`,
  BULK_ACTIONS: `${API_VERSION.CURRENT}/users/bulk-actions`,
} as const;

// Booking Management Endpoints
export const BOOKING_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/bookings/`,
  CREATE: `${API_VERSION.CURRENT}/bookings/`,
  GET: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  UPDATE: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}`,
  UPDATE_STATUS: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}/status`,
  STATISTICS: `${API_VERSION.CURRENT}/bookings/statistics`,
  EXPORT: `${API_VERSION.CURRENT}/bookings/export`,
  DISPUTE: (id: string) => `${API_VERSION.CURRENT}/bookings/${id}/dispute`,
  CALENDAR: `${API_VERSION.CURRENT}/bookings/calendar`,
} as const;

// Payment Management Endpoints
export const PAYMENT_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/payments/`,
  GET: (id: string) => `${API_VERSION.CURRENT}/payments/${id}`,
  REFUND: (id: string) => `${API_VERSION.CURRENT}/payments/${id}/refund`,
  DISPUTES: `${API_VERSION.CURRENT}/payments/disputes`,
  RESOLVE_DISPUTE: (id: string) => `${API_VERSION.CURRENT}/payments/disputes/${id}/resolve`,
  REPORTS: `${API_VERSION.CURRENT}/payments/reports`,
  EXPORT: `${API_VERSION.CURRENT}/payments/export`,
  PLATFORM_FEES: `${API_VERSION.CURRENT}/payments/platform-fees`,
} as const;

// Review Management Endpoints
export const REVIEW_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/reviews/`,
  GET: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}`,
  MODERATE: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}/moderate`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/reviews/${id}`,
  ANALYTICS: `${API_VERSION.CURRENT}/reviews/analytics`,
  BULK_MODERATE: `${API_VERSION.CURRENT}/reviews/bulk-moderate`,
  FLAGGED: `${API_VERSION.CURRENT}/reviews/flagged`,
} as const;

// Analytics Endpoints
export const ANALYTICS_ENDPOINTS = {
  DASHBOARD: `${API_VERSION.CURRENT}/analytics/overview`,  // Backend uses /overview not /dashboard
  USERS: `${API_VERSION.CURRENT}/analytics/users`,
  BOOKINGS: `${API_VERSION.CURRENT}/analytics/bookings`,
  FINANCIAL: `${API_VERSION.CURRENT}/analytics/financial`,
  PERFORMANCE: `${API_VERSION.CURRENT}/analytics/platform-performance`, // Backend uses /platform-performance
  ARTISTS_PERFORMANCE: `${API_VERSION.CURRENT}/analytics/artists/performance`,
  GENERATE_REPORT: `${API_VERSION.CURRENT}/analytics/reports/generate`,
  EXPORT: `${API_VERSION.CURRENT}/analytics/export`,
  // Platform Analytics
  PLATFORM: `${API_VERSION.CURRENT}/analytics/platform`,
  PLATFORM_SUMMARY: `${API_VERSION.CURRENT}/analytics/platform/summary`,
  PLATFORM_TRENDS: `${API_VERSION.CURRENT}/analytics/platform/trends`,
  PLATFORM_CALCULATE: `${API_VERSION.CURRENT}/analytics/platform/calculate`,
  PLATFORM_EXPORT: `${API_VERSION.CURRENT}/analytics/platform/export`,
} as const;

// Settings Endpoints
export const SETTINGS_ENDPOINTS = {
  SYSTEM_SETTINGS: `${API_VERSION.CURRENT}/system/settings`,
  UPDATE_SETTING: (key: string) => `${API_VERSION.CURRENT}/system/settings/${key}`,
  PLATFORM_FEES: `${API_VERSION.CURRENT}/system/fees`,
  EMAIL_TEMPLATES: `${API_VERSION.CURRENT}/system/email-templates`,
  UPDATE_TEMPLATE: (type: string) => `${API_VERSION.CURRENT}/system/email-templates/${type}`,
  SYSTEM_HEALTH: `${API_VERSION.CURRENT}/system/health`,
  LOGS: `${API_VERSION.CURRENT}/system/logs`,
  CLEAR_CACHE: `${API_VERSION.CURRENT}/system/cache/clear`,
} as const;

// Admin User Management Endpoints  
export const ADMIN_USER_ENDPOINTS = {
  LIST: `${API_VERSION.CURRENT}/admin-users`,
  CREATE: `${API_VERSION.CURRENT}/admin-users`,
  UPDATE: (id: string) => `${API_VERSION.CURRENT}/admin-users/${id}`,
  DELETE: (id: string) => `${API_VERSION.CURRENT}/admin-users/${id}`,
  ROLES: `${API_VERSION.CURRENT}/admin-users/roles`,
  CREATE_ROLE: `${API_VERSION.CURRENT}/admin-users/roles`,
  PERMISSIONS: `${API_VERSION.CURRENT}/admin-users/permissions`,
  RESET_PASSWORD: (id: string) => `${API_VERSION.CURRENT}/admin-users/${id}/reset-password`,
  ACTIVITY_LOGS: `${API_VERSION.CURRENT}/admin-users/activity-logs`,
} as const;

// Artist Verification Endpoints
export const ARTIST_VERIFICATION_ENDPOINTS = {
  QUEUE: `${API_VERSION.CURRENT}/artist-verification/verification-queue`,
  GET_REQUEST: (id: string) => `${API_VERSION.CURRENT}/artist-verification/verification-queue/${id}`,
  DECISION: (id: string) => `${API_VERSION.CURRENT}/artist-verification/verification-queue/${id}/decision`,
  PORTFOLIO_QUEUE: `${API_VERSION.CURRENT}/artist-verification/portfolio/moderation-queue`,
  MODERATE_PORTFOLIO: (id: string) => `${API_VERSION.CURRENT}/artist-verification/portfolio/${id}/moderate`,
  BULK_MODERATE_PORTFOLIO: `${API_VERSION.CURRENT}/artist-verification/portfolio/bulk-moderate`,
  ARTIST_HISTORY: (artistId: string) => `${API_VERSION.CURRENT}/artist-verification/artists/${artistId}/history`,
  STATS: `${API_VERSION.CURRENT}/artist-verification/stats`,
  PORTFOLIO: `${API_VERSION.CURRENT}/artist-verification/portfolio`,
  DOWNLOAD_DOCUMENT: (documentId: string) => `${API_VERSION.CURRENT}/artist-verification/documents/${documentId}/download`,
  DELETE_PORTFOLIO_IMAGE: (imageId: string) => `${API_VERSION.CURRENT}/artist-verification/portfolio/${imageId}`,
  TOGGLE_PORTFOLIO_FEATURE: (imageId: string) => `${API_VERSION.CURRENT}/artist-verification/portfolio/${imageId}`,
} as const;

// Support Management Endpoints
export const SUPPORT_ENDPOINTS = {
  TICKETS: `${API_VERSION.CURRENT}/support/tickets`,
  GET_TICKET: (id: string) => `${API_VERSION.CURRENT}/support/tickets/${id}`,
  UPDATE_TICKET: (id: string) => `${API_VERSION.CURRENT}/support/tickets/${id}`,
  ADD_REPLY: (id: string) => `${API_VERSION.CURRENT}/support/tickets/${id}/replies`,
  FAQ_CATEGORIES: `${API_VERSION.CURRENT}/support/faq/categories`,
  FAQ: `${API_VERSION.CURRENT}/support/faq`,
  UPDATE_FAQ: (id: string) => `${API_VERSION.CURRENT}/support/faq/${id}`,
  KNOWLEDGE_BASE: `${API_VERSION.CURRENT}/support/knowledge-base/articles`,
  CREATE_ARTICLE: `${API_VERSION.CURRENT}/support/knowledge-base/articles`,
  SUPPORT_ANALYTICS: `${API_VERSION.CURRENT}/support/analytics`,
} as const;

// User Session Management Endpoints
export const SESSION_ENDPOINTS = {
  // Admin Sessions
  ADMIN_SESSIONS: `${API_VERSION.CURRENT}/user-sessions/admins`,
  ADMIN_SESSIONS_STATS: `${API_VERSION.CURRENT}/user-sessions/admins/stats`,
  ADMIN_SESSIONS_ACTIVE: `${API_VERSION.CURRENT}/user-sessions/admins/active`,
  ADMIN_SESSION_DETAIL: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/admins/${sessionId}`,
  ADMIN_SESSION_REVOKE: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/admins/${sessionId}/revoke`,
  ADMIN_USER_REVOKE_ALL: (userId: string) => `${API_VERSION.CURRENT}/user-sessions/admins/user/${userId}/revoke-all`,
  
  // Provider Sessions
  PROVIDER_SESSIONS: `${API_VERSION.CURRENT}/user-sessions/providers`,
  PROVIDER_SESSIONS_STATS: `${API_VERSION.CURRENT}/user-sessions/providers/stats`,
  PROVIDER_SESSIONS_ACTIVE: `${API_VERSION.CURRENT}/user-sessions/providers/active`,
  PROVIDER_SESSION_DETAIL: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/providers/${sessionId}`,
  PROVIDER_SESSION_REVOKE: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/providers/${sessionId}/revoke`,
  PROVIDER_USER_REVOKE_ALL: (userId: string) => `${API_VERSION.CURRENT}/user-sessions/providers/user/${userId}/revoke-all`,
  
  // Customer Sessions
  CUSTOMER_SESSIONS: `${API_VERSION.CURRENT}/user-sessions/customers`,
  CUSTOMER_SESSIONS_STATS: `${API_VERSION.CURRENT}/user-sessions/customers/stats`,
  CUSTOMER_SESSIONS_ACTIVE: `${API_VERSION.CURRENT}/user-sessions/customers/active`,
  CUSTOMER_SESSION_DETAIL: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/customers/${sessionId}`,
  CUSTOMER_SESSION_REVOKE: (sessionId: string) => `${API_VERSION.CURRENT}/user-sessions/customers/${sessionId}/revoke`,
  CUSTOMER_USER_REVOKE_ALL: (userId: string) => `${API_VERSION.CURRENT}/user-sessions/customers/user/${userId}/revoke-all`,
} as const;

// Promotions & Marketing Endpoints
export const PROMOTIONS_ENDPOINTS = {
  CAMPAIGNS: `${API_VERSION.CURRENT}/promotions/campaigns`,
  UPDATE_CAMPAIGN: (id: string) => `${API_VERSION.CURRENT}/promotions/campaigns/${id}`,
  COUPONS: `${API_VERSION.CURRENT}/promotions/coupons`,
  REFERRAL_STATS: `${API_VERSION.CURRENT}/promotions/referrals/stats`,
  REFERRAL_CONFIG: `${API_VERSION.CURRENT}/promotions/referrals/config`,
  EMAIL_CAMPAIGNS: `${API_VERSION.CURRENT}/promotions/email-campaigns`,
  MARKETING_ANALYTICS: `${API_VERSION.CURRENT}/promotions/analytics`,
} as const;

// Marketing Management Endpoints
export const MARKETING_ENDPOINTS = {
  // Campaigns
  CAMPAIGNS: `${API_VERSION.CURRENT}/marketing/campaigns`,
  CAMPAIGN_DETAIL: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}`,
  CAMPAIGN_DUPLICATE: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/duplicate`,
  CAMPAIGN_PAUSE: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/pause`,
  CAMPAIGN_RESUME: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/resume`,
  CAMPAIGN_ANALYTICS: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/analytics`,
  CAMPAIGNS_BULK: `${API_VERSION.CURRENT}/marketing/campaigns/bulk`,
  CAMPAIGNS_EXPORT: `${API_VERSION.CURRENT}/marketing/campaigns/export`,
  CAMPAIGN_EXPORT: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/export`,
  
  // Promotions
  PROMOTIONS: `${API_VERSION.CURRENT}/marketing/promotions`,
  PROMOTION_DETAIL: (id: string) => `${API_VERSION.CURRENT}/marketing/promotions/${id}`,
  
  // Coupons
  COUPONS: `${API_VERSION.CURRENT}/marketing/coupons`,
  COUPON_DETAIL: (id: string) => `${API_VERSION.CURRENT}/marketing/coupons/${id}`,
  COUPONS_GENERATE: `${API_VERSION.CURRENT}/marketing/coupons/generate`,
  
  // Analytics
  ANALYTICS: `${API_VERSION.CURRENT}/marketing/analytics`,
  ANALYTICS_EXPORT: `${API_VERSION.CURRENT}/marketing/analytics/export`,
  
  // Customer Segments
  SEGMENTS: `${API_VERSION.CURRENT}/marketing/segments`,
  SEGMENT_DETAIL: (id: string) => `${API_VERSION.CURRENT}/marketing/segments/${id}`,
  SEGMENT_CUSTOMERS: (id: string) => `${API_VERSION.CURRENT}/marketing/segments/${id}/customers`,
  
  // Referrals
  REFERRALS_STATS: `${API_VERSION.CURRENT}/marketing/referrals/stats`,
  REFERRALS_CONFIG: `${API_VERSION.CURRENT}/marketing/referrals/config`,
  
  // Templates
  TEMPLATES: `${API_VERSION.CURRENT}/marketing/templates`,
  
  // Test Email
  TEST_EMAIL: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/test-email`,
  SCHEDULE_CAMPAIGN: (id: string) => `${API_VERSION.CURRENT}/marketing/campaigns/${id}/schedule`,
} as const;

// Academy Management Endpoints
export const ACADEMY_ENDPOINTS = {
  PERFORMANCE: `${API_VERSION.CURRENT}/academy-management/performance`,
  ACADEMY_PERFORMANCE: (id: string) => `${API_VERSION.CURRENT}/academy-management/performance/academy/${id}`,
  ACADEMY_TRENDS: (id: string) => `${API_VERSION.CURRENT}/academy-management/performance/academy/${id}/trends`,
  TOP_PERFORMERS: `${API_VERSION.CURRENT}/academy-management/performance/top-performers`,
  CALCULATE_PERFORMANCE: `${API_VERSION.CURRENT}/academy-management/performance/calculate`,
  EXPORT_PERFORMANCE: `${API_VERSION.CURRENT}/academy-management/performance/export`,
} as const;

// System Configuration Endpoints
export const CONFIG_ENDPOINTS = {
  // Configuration
  CONFIGURATION: `${API_VERSION.CURRENT}/system/configuration`,
  CONFIG_DETAIL: (key: string) => `${API_VERSION.CURRENT}/system/configuration/${key}`,
  
  // Feature Flags
  FEATURE_FLAGS: `${API_VERSION.CURRENT}/system/feature-flags`,
  FEATURE_FLAG_DETAIL: (id: string) => `${API_VERSION.CURRENT}/system/feature-flags/${id}`,
  TOGGLE_FLAG: (id: string) => `${API_VERSION.CURRENT}/system/feature-flags/${id}/toggle`,
  
  // System Notifications
  SYSTEM_NOTIFICATIONS: `${API_VERSION.CURRENT}/system/notifications`,
  NOTIFICATION_DETAIL: (id: string) => `${API_VERSION.CURRENT}/system/notifications/${id}`,
  SEND_NOTIFICATION: `${API_VERSION.CURRENT}/system/notifications/send`,
  
  // OTP Management
  OTP_SETTINGS: `${API_VERSION.CURRENT}/system/otp`,
  OTP_STATS: `${API_VERSION.CURRENT}/system/otp/stats`,
  OTP_VERIFY: `${API_VERSION.CURRENT}/system/otp/verify`,
  OTP_RESEND: `${API_VERSION.CURRENT}/system/otp/resend`,
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

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Request timeout configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;