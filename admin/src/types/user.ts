export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  department?: string;
  created_at: string;
  last_login?: string;
  avatar_url?: string;
  role: string;
}

export interface UserDashboardStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_this_month: number;
  verified_users: number;
  unverified_users: number;
  recent_logins: number;
  growth_percentage: number;
}

export interface UserFilters {
  status?: 'active' | 'inactive' | 'suspended' | 'all';
  role?: string;
  department?: string;
  is_verified?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface CreateUserData {
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  password: string;
  role: string;
  department?: string;
  permissions?: string[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  department?: string;
  permissions?: string[];
}

export interface UserStatusUpdate {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface BulkUserAction {
  user_ids: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete';
  reason?: string;
  notify_users?: boolean;
}

export interface ExportUsersRequest {
  format: 'csv' | 'excel';
  filters?: UserFilters & { search?: string };
  include_fields?: string[];
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface UserNotification {
  type: 'email' | 'sms' | 'push';
  subject?: string;
  message: string;
  template?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}