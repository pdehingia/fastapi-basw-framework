/**
 * User Management API Service
 * Handles all user CRUD operations, dashboard stats, and bulk actions
 */

import { USER_ENDPOINTS } from '@/config/api';
import { apiService } from './base';
import type { 
  
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserDashboardStats,
  UserFilters,
  BulkUserAction,
  ExportRequest,
  QueryParams
} from '@/types/api.types';

export class UserService {
  /**
   * Get user dashboard statistics
   */
  async getDashboardStats(): Promise<UserDashboardStats> {
    return await apiService.get<UserDashboardStats>(USER_ENDPOINTS.DASHBOARD);
  }

  /**
   * Get paginated list of users with filters
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    return await apiService.get<PaginatedResponse<User>>(USER_ENDPOINTS.LIST, filters);
  }

  /**
   * Get user details by ID
   */
  async getUser(userId: string): Promise<User> {
    return await apiService.get<User>(USER_ENDPOINTS.GET(userId));
  }

  /**
   * Create a new admin user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    return await apiService.post<User>(USER_ENDPOINTS.CREATE, userData);
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    return await apiService.put<User>(USER_ENDPOINTS.UPDATE(userId), updates);
  }

  /**
   * Update user status (activate/deactivate/suspend)
   */
  async updateUserStatus(
    userId: string, 
    statusUpdate: UpdateUserStatusRequest
  ): Promise<User> {
    return await apiService.patch<User>(USER_ENDPOINTS.UPDATE_STATUS(userId), statusUpdate);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<{ deleted_user_id: string }> {
    return await apiService.delete<{ deleted_user_id: string }>(USER_ENDPOINTS.DELETE(userId));
  }

  /**
   * Search users by query and type
   */
  async searchUsers(
    query: string, 
    searchType: 'name' | 'email' | 'phone' = 'name'
  ): Promise<User[]> {
    return await apiService.get<User[]>(USER_ENDPOINTS.SEARCH, {
      query,
      search_type: searchType,
    });
  }

  /**
   * Get user activity log
   */
  async getUserActivity(
    userId: string, 
    params: QueryParams = {}
  ): Promise<any[]> {
    return await apiService.get<any[]>(USER_ENDPOINTS.ACTIVITY(userId), params);
  }

  /**
   * Send notification to user
   */
  async sendUserNotification(
    userId: string, 
    notification: {
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      send_email?: boolean;
      send_sms?: boolean;
    }
  ): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>(
      USER_ENDPOINTS.NOTIFICATIONS(userId),
      notification
    );
  }

  /**
   * Bulk user actions (suspend, activate, delete)
   */
  async bulkUserActions(action: BulkUserAction): Promise<{
    successful: string[];
    failed: Array<{ user_id: string; error: string }>;
  }> {
    return await apiService.post<{
      successful: string[];
      failed: Array<{ user_id: string; error: string }>;
    }>(USER_ENDPOINTS.BULK_ACTIONS, action);
  }

  /**
   * Export user data
   */
  async exportUsers(exportRequest: ExportRequest): Promise<{
    download_url: string;
    expires_at: string;
  }> {
    return await apiService.post<{
      download_url: string;
      expires_at: string;
    }>(USER_ENDPOINTS.EXPORT, exportRequest);
  }

  /**
   * Get user statistics for analytics
   */
  async getUserStats(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  } = {}): Promise<{
    total_users: number;
    new_registrations: number;
    active_users: number;
    growth_rate: number;
    user_trends: Array<{
      date: string;
      new_users: number;
      active_users: number;
    }>;
  }> {
    return await apiService.get<{
      total_users: number;
      new_registrations: number;
      active_users: number;
      growth_rate: number;
      user_trends: Array<{
        date: string;
        new_users: number;
        active_users: number;
      }>;
    }>('/api/admin/v1/analytics/users', params);
  }
}

export const userService = new UserService();
