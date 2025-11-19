/**
 * Route Configuration & Constants
 * Centralized route definitions and configuration
 */

// Main route paths
export const ROUTES = {
  // Public routes
  ROOT: '/',
  LOGIN: '/auth/login',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USER_DETAIL: '/users/$userId',
  BOOKINGS: '/bookings',
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments/$paymentId',
  PAYMENT_DISPUTES: '/payments/disputes',
  
  // Review management
  REVIEWS: '/reviews',
  REVIEW_DETAIL: '/reviews/$reviewId',
  REVIEW_ANALYTICS: '/reviews/analytics',
  REVIEW_FLAGGED: '/reviews/flagged',
  
  // Artist verification
  ARTIST_VERIFICATION_QUEUE: '/artist-verification/verification-queue',
  ARTIST_VERIFICATION_DETAIL: '/artist-verification/verification-queue/$requestId',
  ARTIST_PORTFOLIO_MODERATION: '/artist-verification/portfolio-moderation',
  
  // Content Management
  CONTENT_MANAGEMENT: '/content-management',
  
  // API Integration
  API_INTEGRATIONS: '/api-integrations',
  
  // Advanced Analytics & Reporting
  ADVANCED_ANALYTICS: '/advanced-analytics',
  
  SETTINGS: '/settings',
  
  // API routes
  LOGOUT: '/auth/logout',
} as const;

// Route metadata for navigation and SEO
export const ROUTE_META = {
  [ROUTES.LOGIN]: {
    title: 'Login - Maya Admin',
    description: 'Sign in to Maya Admin Dashboard',
    requiresAuth: false,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard - Maya Admin',
    description: 'Maya Admin Dashboard Overview',
    requiresAuth: true,
  },
  [ROUTES.USERS]: {
    title: 'User Management - Maya Admin',
    description: 'Manage users and permissions',
    requiresAuth: true,
  },
  [ROUTES.BOOKINGS]: {
    title: 'Booking Management - Maya Admin',
    description: 'Manage bookings and reservations',
    requiresAuth: true,
  },
  [ROUTES.PAYMENTS]: {
    title: 'Payment Management - Maya Admin',
    description: 'Manage payments, refunds, and disputes',
    requiresAuth: true,
  },
  [ROUTES.REVIEWS]: {
    title: 'Review Management - Maya Admin',
    description: 'Manage customer reviews and ratings',
    requiresAuth: true,
  },
  [ROUTES.ARTIST_VERIFICATION_QUEUE]: {
    title: 'Artist Verification Queue - Maya Admin',
    description: 'Manage artist verification requests',
    requiresAuth: true,
  },
  [ROUTES.ARTIST_PORTFOLIO_MODERATION]: {
    title: 'Portfolio Moderation - Maya Admin',
    description: 'Review and moderate artist portfolios',
    requiresAuth: true,
  },
  [ROUTES.CONTENT_MANAGEMENT]: {
    title: 'Content Management - Maya Admin',
    description: 'Manage website content, media, and SEO',
    requiresAuth: true,
  },
  [ROUTES.API_INTEGRATIONS]: {
    title: 'API Integrations - Maya Admin',
    description: 'Manage API keys, webhooks, and third-party integrations',
    requiresAuth: true,
  },
  [ROUTES.ADVANCED_ANALYTICS]: {
    title: 'Advanced Analytics - Maya Admin',
    description: 'Advanced reporting, dashboards, and data visualization',
    requiresAuth: true,
  },
  [ROUTES.SETTINGS]: {
    title: 'Settings - Maya Admin',
    description: 'Application settings and configuration',
    requiresAuth: true,
  },
} as const;

// Navigation structure
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'ChartBarIcon',
    description: 'Overview and analytics',
  },
  {
    name: 'Users',
    href: ROUTES.USERS,
    icon: 'UsersIcon',
    description: 'User management',
  },
  {
    name: 'Bookings',
    href: ROUTES.BOOKINGS,
    icon: 'CalendarIcon',
    description: 'Booking management',
  },
  {
    name: 'Payments',
    href: ROUTES.PAYMENTS,
    icon: 'CreditCardIcon',
    description: 'Payment management',
  },
  {
    name: 'Reviews',
    href: ROUTES.REVIEWS,
    icon: 'StarIcon',
    description: 'Review management',
  },
  {
    name: 'Artist Verification',
    href: ROUTES.ARTIST_VERIFICATION_QUEUE,
    icon: 'ShieldCheckIcon',
    description: 'Artist verification management',
  },
  {
    name: 'Content Management',
    href: ROUTES.CONTENT_MANAGEMENT,
    icon: 'DocumentTextIcon',
    description: 'Content and media management',
  },
  {
    name: 'API Integrations',
    href: ROUTES.API_INTEGRATIONS,
    icon: 'LinkIcon',
    description: 'API management and integrations',
  },
  {
    name: 'Advanced Analytics',
    href: ROUTES.ADVANCED_ANALYTICS,
    icon: 'ChartPieIcon',
    description: 'Advanced reporting and dashboards',
  },
  {
    name: 'Settings',
    href: ROUTES.SETTINGS,
    icon: 'CogIcon',
    description: 'Application settings',
  },
] as const;

// Route permissions (can be extended for role-based access)
export const ROUTE_PERMISSIONS = {
  [ROUTES.DASHBOARD]: ['admin', 'user'],
  [ROUTES.USERS]: ['admin'],
  [ROUTES.BOOKINGS]: ['admin', 'manager'],
  [ROUTES.PAYMENTS]: ['admin', 'manager'],
  [ROUTES.REVIEWS]: ['admin', 'manager'],
  [ROUTES.ARTIST_VERIFICATION_QUEUE]: ['admin', 'manager'],
  [ROUTES.ARTIST_PORTFOLIO_MODERATION]: ['admin', 'manager'],
  [ROUTES.CONTENT_MANAGEMENT]: ['admin', 'manager'],
  [ROUTES.API_INTEGRATIONS]: ['admin'],
  [ROUTES.ADVANCED_ANALYTICS]: ['admin', 'manager'],
  [ROUTES.SETTINGS]: ['admin'],
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

// Re-export navigation utilities for convenience
export { useRouteNavigation, RoutePaths, RouteUtils } from './navigation';