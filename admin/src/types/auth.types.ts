/**
 * Authentication related TypeScript types
 */

// User roles for RBAC based on backend response
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'support';

// User interface for authenticated admin user
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  department?: string;
  employee_id?: string;
  can_manage_users: boolean;
  can_manage_system: boolean;
  can_view_reports: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Login response from API
export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

// User profile response
export interface ProfileResponse {
  success: boolean;
  data: AuthUser;
  message: string;
}

// Refresh token response
export interface RefreshResponse {
  message: string;
  user: AuthUser;
}

// Authentication state - NO TOKEN STORAGE (httpOnly cookies only)
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login form validation errors
export interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

// Auth actions for Zustand store - NO TOKEN METHODS (httpOnly cookies only)
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Complete auth store type
export type AuthStore = AuthState & AuthActions;