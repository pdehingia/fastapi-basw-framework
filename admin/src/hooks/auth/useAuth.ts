/**
 * Authentication React hooks
 * Custom hooks for authentication operations
 */

import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import type { LoginCredentials } from '@/types/auth.types';

/**
 * Main authentication hook
 * Provides auth state and actions
 */
export const useAuth = () => {
  return useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    logout: state.logout,
    refreshAuth: state.refreshAuth,
    clearError: state.clearError,
  }));
};

/**
 * Login hook with navigation
 * Handles login flow and redirects
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      // Navigate to dashboard after successful login
      navigate({ to: '/dashboard' });
    } catch (error) {
      // Error is already set in store
      console.error('Login failed:', error);
    }
  }, [login, navigate]);

  return {
    login: handleLogin,
    isLoading,
    error,
    clearError,
  };
};

/**
 * Logout hook with navigation
 * Handles logout flow and redirects
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Navigate to login after successful logout
      navigate({ to: '/login' });
    } catch (error) {
      // Even if logout API fails, we still clear local state
      console.error('Logout error:', error);
      navigate({ to: '/login' });
    }
  }, [logout, navigate]);

  return {
    logout: handleLogout,
    isLoading,
  };
};

/**
 * Permission check hook
 * Provides permission checking utilities
 */
export const usePermissions = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
  };
};

/**
 * Protected route hook
 * Checks if user can access current route
 */
export const useProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const checkAccess = useCallback((requiredPermissions?: string[], requiredRoles?: string[]) => {
    if (!isAuthenticated || !user) {
      navigate({ to: '/login' });
      return false;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission as any)
      );
      if (!hasRequiredPermission) {
        navigate({ to: '/unauthorized' });
        return false;
      }
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        navigate({ to: '/unauthorized' });
        return false;
      }
    }

    return true;
  }, [isAuthenticated, user, navigate]);

  return {
    isAuthenticated,
    user,
    checkAccess,
  };
};