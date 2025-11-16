/**
 * Authentication React hooks
 * Custom hooks for authentication operations
 */

import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/routes';
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
    console.log('🔐 [LOGIN] Starting login process with:', { username: credentials.username });
    
    try {
      console.log('🔐 [LOGIN] Calling auth store login...');
      await login(credentials);
      
      console.log('🔐 [LOGIN] Login successful, checking auth state...');
      const authState = useAuthStore.getState();
      console.log('🔐 [LOGIN] Auth state after login:', {
        isAuthenticated: authState.isAuthenticated,
        isInitialized: authState.isInitialized,
        user: authState.user?.email,
        hasUser: !!authState.user
      });
      
      // Ensure auth state is properly set before redirecting
      if (authState.isAuthenticated && authState.user) {
        console.log('🔐 [LOGIN] Auth state confirmed, redirecting to dashboard...');
        // Use TanStack Router navigation to maintain auth state
        navigate({ 
          to: ROUTES.DASHBOARD,
          replace: true 
        });
      } else {
        console.error('🔐 [LOGIN] Auth state not properly set after login');
        throw new Error('Authentication state not properly set');
      }
      
    } catch (error) {
      // Error is already set in store
      console.error('🔐 [LOGIN] Login failed:', error);
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
      navigate({ to: ROUTES.LOGIN });
    } catch (error) {
      // Even if logout API fails, we still clear local state
      console.error('Logout error:', error);
      navigate({ to: ROUTES.LOGIN });
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
    const { isAuthenticated, user } = useAuthStore.getState();
    console.log('🛡️  [PROTECTED] Checking route access:', {
      isAuthenticated,
      user: user?.email,
      hasUser: !!user,
      requiredPermissions,
      requiredRoles
    });
    
    if (!isAuthenticated || !user) {
      console.warn('🛡️  [PROTECTED] Access denied - not authenticated, redirecting to login');
      navigate({ to: ROUTES.LOGIN });
      return false;
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission => 
        user.permissions.includes(permission as any)
      );
      if (!hasRequiredPermission) {
        console.warn('🛡️  [PROTECTED] Access denied - insufficient permissions, redirecting to dashboard');
        // For now, redirect to dashboard since we don't have unauthorized route
        navigate({ to: ROUTES.DASHBOARD });
        return false;
      }
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        console.warn('🛡️  [PROTECTED] Access denied - insufficient role, redirecting to dashboard');
        // For now, redirect to dashboard since we don't have unauthorized route
        navigate({ to: ROUTES.DASHBOARD });
        return false;
      }
    }

    console.log('🛡️  [PROTECTED] Access granted');
    return true;
  }, [navigate]);

  return {
    isAuthenticated,
    user,
    checkAccess,
  };
};