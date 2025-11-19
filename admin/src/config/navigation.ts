/**
 * Route Navigation Utilities
 * Helper functions for type-safe navigation using route constants
 */

import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from './routes';

/**
 * Custom hook for type-safe navigation with route constants
 * Provides convenient methods for common navigation patterns
 */
export function useRouteNavigation() {
  const navigate = useNavigate();

  return {
    // Direct navigation methods
    goToDashboard: () => navigate({ to: ROUTES.DASHBOARD }),
    goToLogin: () => navigate({ to: ROUTES.LOGIN }),
    goToUsers: () => navigate({ to: ROUTES.USERS, search: { page: 1, limit: 10 } }),
    goToBookings: () => navigate({ to: ROUTES.BOOKINGS, search: { page: 1, limit: 10 } }),
    goToContentManagement: () => navigate({ to: ROUTES.CONTENT_MANAGEMENT }),
    goToApiIntegrations: () => navigate({ to: ROUTES.API_INTEGRATIONS }),
    goToAdvancedAnalytics: () => navigate({ to: ROUTES.ADVANCED_ANALYTICS }),
    goToSettings: () => navigate({ to: ROUTES.SETTINGS, search: { section: 'general' } }),
    
    // Navigation with parameters
    // TODO: Fix route typing for dynamic user detail route
    // goToUserDetail: (userId: string) => 
    //   navigate({ to: ROUTES.USER_DETAIL, params: { userId }, search: { tab: 'profile' } }),
    
    // Navigation with search params
    goToUsersWithSearch: (searchParams?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: 'admin' | 'manager' | 'customer' | 'provider';
      status?: 'active' | 'inactive' | 'pending' | 'suspended';
    }) => navigate({ to: ROUTES.USERS, search: { page: 1, limit: 10, ...searchParams } }),
    
    goToBookingsWithSearch: (searchParams?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      dateFrom?: string;
      dateTo?: string;
    }) => navigate({ to: ROUTES.BOOKINGS, search: { page: 1, limit: 10, ...searchParams } }),
    
    goToSettingsSection: (section?: 'general' | 'security' | 'notifications' | 'api') => 
      navigate({ to: ROUTES.SETTINGS, search: { section: section || 'general' } }),
    
    // Generic navigation with route constants
    navigateTo: navigate,
    
    // Back navigation
    goBack: () => window.history.back(),
  };
}

/**
 * Route path builder utilities
 * Generate route paths programmatically
 */
export const RoutePaths = {
  /**
   * Generate user detail path with userId
   */
  userDetail: (userId: string) => `/users/${userId}`,
  
  /**
   * Generate dashboard path with optional search params
   */
  dashboard: (search?: Record<string, any>) => {
    const searchString = search ? `?${new URLSearchParams(search).toString()}` : '';
    return `${ROUTES.DASHBOARD}${searchString}`;
  },
  
  /**
   * Generate users list path with optional filters
   */
  users: (filters?: {
    page?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    if (!filters) return ROUTES.USERS;
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    const searchString = searchParams.toString();
    return searchString ? `${ROUTES.USERS}?${searchString}` : ROUTES.USERS;
  },
  
  /**
   * Generate bookings path with optional filters
   */
  bookings: (filters?: {
    page?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    if (!filters) return ROUTES.BOOKINGS;
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, value.toString());
      }
    });
    const searchString = searchParams.toString();
    return searchString ? `${ROUTES.BOOKINGS}?${searchString}` : ROUTES.BOOKINGS;
  },
} as const;

/**
 * Route validation utilities
 */
export const RouteUtils = {
  /**
   * Check if current path matches a route
   */
  isCurrentRoute: (routePath: string, currentPath: string): boolean => {
    return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
  },
  
  /**
   * Extract route parameters from a path
   */
  extractParams: (template: string, path: string): Record<string, string> => {
    const templateParts = template.split('/');
    const pathParts = path.split('/');
    const params: Record<string, string> = {};
    
    templateParts.forEach((part, index) => {
      if (part.startsWith('$')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index] || '';
      }
    });
    
    return params;
  },
  
  /**
   * Check if a route requires authentication
   */
  requiresAuth: (path: string): boolean => {
    return path !== ROUTES.LOGIN && path !== ROUTES.ROOT;
  },
} as const;