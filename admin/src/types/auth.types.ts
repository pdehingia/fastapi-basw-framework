/**
 * Authentication related TypeScript types
 */

// User roles for RBAC based on backend response
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'support';

// Permission type for RBAC
export type Permission = 
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  | 'bookings.view' | 'bookings.create' | 'bookings.edit' | 'bookings.delete'
  | 'payments.view' | 'payments.process' | 'payments.refund'
  | 'reviews.view' | 'reviews.moderate' | 'reviews.delete'
  | 'analytics.view' | 'analytics.export'
  | 'system.settings' | 'system.users' | 'system.reports';

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
  // Add missing properties
  role: UserRole;
  permissions: Permission[];
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
  isInitialized: boolean;
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
  initAuth: () => Promise<void>; // Initialize auth from httpOnly cookies
}

// Complete auth store type
export type AuthStore = AuthState & AuthActions;