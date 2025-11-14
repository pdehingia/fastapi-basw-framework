/**
 * Authentication Zustand store
 * Manages authentication state, user data, and auth actions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthService } from '@/services/api/auth';
import type { 
  AuthStore, 
  AuthUser, 
  LoginCredentials, 
  Permission, 
  UserRole 
} from '@/types/auth.types';

// Initial auth state - NO TOKEN STORAGE (httpOnly cookies only)
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Step 1: Login - httpOnly cookies set by server
          await AuthService.login(credentials);
          
          // Step 2: Fetch user profile to get complete user data
          const profileResponse = await AuthService.getUserProfile();
          
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
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.logout();
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
          const response = await AuthService.refresh();
          
          set({
            user: response.user,
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
    }),
    {
      name: 'maya-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential user data, not loading states
      // NO TOKEN STORAGE - httpOnly cookies managed by server
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
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
}));

export const useAuthHelpers = () => useAuthStore((state) => ({
  hasPermission: state.hasPermission,
  hasRole: state.hasRole,
  hasAnyRole: state.hasAnyRole,
}));