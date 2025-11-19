/**
 * Authentication Zustand store
 * Manages authentication state, user data, and auth actions
 */

import { create } from 'zustand';
import { authService } from '@/services/api/auth';
import type { 
  AuthStore, 
  AuthUser, 
  LoginCredentials, 
  UserRole 
} from '@/types/auth.types';

// Initial auth state - NO PERSISTENCE (httpOnly cookies only)
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
};

// Flag to prevent concurrent initialization
let isInitializing = false;

export const useAuthStore = create<AuthStore>()(
  // NO PERSISTENCE - httpOnly cookies handle all auth state
  (set, get) => ({
    ...initialState,

    // Actions
    login: async (credentials: LoginCredentials) => {
      console.log('🏪 [AUTH STORE] Starting login process...');
      set({ isLoading: true, error: null });
      
      try {
        console.log('🏪 [AUTH STORE] Step 1: Calling authService.login...');
        // Step 1: Login - httpOnly cookies set by server
        await authService.login(credentials);
        console.log('🏪 [AUTH STORE] Step 1 completed - cookies should be set');
        
        console.log('🏪 [AUTH STORE] Step 2: Fetching user profile...');
        // Step 2: Fetch user profile to get complete user data
        const profileResponse = await authService.getProfile();
        console.log('🏪 [AUTH STORE] Step 2 completed - profile data received:', {
          userId: profileResponse.data.id,
          email: profileResponse.data.email
        });
        
        console.log('🏪 [AUTH STORE] Setting authenticated state...');
        set({
          user: profileResponse.data,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        
        console.log('🏪 [AUTH STORE] Login completed successfully, final state:', {
          isAuthenticated: true,
          user: profileResponse.data.email
        });
      } catch (error) {
        console.error('🏪 [AUTH STORE] Login failed:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Login failed',
        });
        throw error;
      }
    },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          // Log error but continue with logout
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshAuth: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.refreshToken();
          
          // After refresh, get fresh profile data
          const profileResponse = await authService.getProfile();
          
          set({
            user: profileResponse.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Session refresh failed',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: AuthUser | null) => {
        set({ 
          user, 
          isAuthenticated: user !== null 
        });
      },

      // Permission helpers - updated to match backend structure
      hasPermission: (permission: string): boolean => {
        const { user } = get();
        if (!user) return false;
        
        // Check based on user flags from backend
        switch (permission) {
          case 'users.manage':
            return user.can_manage_users;
          case 'system.manage':
            return user.can_manage_system;
          case 'reports.view':
            return user.can_view_reports;
          case 'superuser':
            return user.is_superuser;
          default:
            return user.is_superuser; // Fallback to superuser for unknown permissions
        }
      },

      hasRole: (role: UserRole): boolean => {
        const { user } = get();
        if (!user) return false;
        
        // Map backend flags to roles
        if (role === 'super_admin') return user.is_superuser;
        if (role === 'admin') return user.can_manage_users || user.can_manage_system;
        if (role === 'manager') return user.can_view_reports;
        if (role === 'support') return user.is_active && !user.is_superuser;
        
        return false;
      },

      hasAnyRole: (roles: UserRole[]): boolean => {
        const { hasRole } = get();
        return roles.some(role => hasRole(role));
      },

      // Initialize auth state from httpOnly cookies on app load
      initAuth: async () => {
        console.log('🏪 [AUTH STORE] initAuth called');
        
        // Prevent double initialization
        const currentState = get();
        if (currentState.isInitialized || isInitializing) {
          console.log('🏪 [AUTH STORE] Already initialized or initializing, skipping...');
          return;
        }
        
        isInitializing = true;
        set({ isLoading: true });
        
        try {
          console.log('🏪 [AUTH STORE] Attempting to get user profile from existing session...');
          // Try to get user profile - this will work if httpOnly cookies are valid
          const profileResponse = await authService.getProfile();
          console.log('🏪 [AUTH STORE] Profile retrieved successfully:', {
            userId: profileResponse.data.id,
            email: profileResponse.data.email
          });
          set({
            user: profileResponse.data,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
          console.log('🏪 [AUTH STORE] initAuth completed - user is authenticated');
        } catch (error) {
          console.log('🏪 [AUTH STORE] No valid session found (expected for logged out users)');
          // No valid session, stay logged out
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
          console.log('🏪 [AUTH STORE] initAuth completed - user is not authenticated');
        } finally {
          isInitializing = false;
        }
      },
    })
);

// Export individual selectors for performance
export const useAuthState = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  refreshAuth: state.refreshAuth,
  clearError: state.clearError,
  setLoading: state.setLoading,
  setUser: state.setUser,
  initAuth: state.initAuth,
}));

export const useAuthHelpers = () => useAuthStore((state) => ({
  hasPermission: state.hasPermission,
  hasRole: state.hasRole,
  hasAnyRole: state.hasAnyRole,
}));
