/**
 * Admin User Service
 * API service for admin user management operations
 */

import { apiClient } from './client';
import { ADMIN_USER_ENDPOINTS } from '../../config/api';
import type {
  AdminUser,
  AdminUserFilters,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  QueryParams,
  PaginatedResponse,
  
} from '../../types/api.types';

export class AdminUserService {
  /**
   * Get paginated list of admin users
   */
  async getAdminUsers(params: AdminUserFilters & QueryParams = {}): Promise<PaginatedResponse<AdminUser>> {
    return apiClient.get(ADMIN_USER_ENDPOINTS.LIST, { params });
  }

  /**
   * Get single admin user by ID
   */
  async getAdminUser(id: string): Promise<AdminUser> {
    return apiClient.get(ADMIN_USER_ENDPOINTS.UPDATE(id));
  }

  /**
   * Create new admin user
   */
  async createAdminUser(data: CreateAdminUserRequest): Promise<AdminUser> {
    return apiClient.post(ADMIN_USER_ENDPOINTS.CREATE, data);
  }

  /**
   * Update admin user
   */
  async updateAdminUser(id: string, data: UpdateAdminUserRequest): Promise<AdminUser> {
    return apiClient.put(ADMIN_USER_ENDPOINTS.UPDATE(id), data);
  }

  /**
   * Delete admin user
   */
  async deleteAdminUser(id: string): Promise<{ message: string }> {
    return apiClient.delete(ADMIN_USER_ENDPOINTS.DELETE(id));
  }

  /**
   * Update admin user status
   */
  async updateAdminUserStatus(
    id: string, 
    data: { status: 'active' | 'inactive' | 'suspended'; reason?: string }
  ): Promise<AdminUser> {
    return apiClient.patch(`${ADMIN_USER_ENDPOINTS.UPDATE(id)}/status`, data);
  }

  /**
   * Update admin user role
   */
  async updateAdminUserRole(
    id: string, 
    data: { role: 'super_admin' | 'admin' | 'moderator' }
  ): Promise<AdminUser> {
    return apiClient.patch(`${ADMIN_USER_ENDPOINTS.UPDATE(id)}/role`, data);
  }

  /**
   * Get admin user activity logs
   */
  async getAdminActivityLogs(
    adminUserId: string, 
    params: QueryParams = {}
  ): Promise<PaginatedResponse<any>> {
    return apiClient.get(`${ADMIN_USER_ENDPOINTS.ACTIVITY_LOGS}/${adminUserId}`, { params });
  }

  /**
   * Get admin user sessions
   */
  async getAdminUserSessions(adminUserId: string): Promise<any[]> {
    return apiClient.get(`${ADMIN_USER_ENDPOINTS.UPDATE(adminUserId)}/sessions`);
  }

  /**
   * Terminate admin user sessions
   */
  async terminateAdminUserSessions(adminUserId: string): Promise<{ message: string }> {
    return apiClient.post(`${ADMIN_USER_ENDPOINTS.UPDATE(adminUserId)}/terminate-sessions`);
  }

  /**
   * Reset admin user password
   */
  async resetAdminUserPassword(id: string): Promise<{ message: string; temporary_password: string }> {
    return apiClient.post(ADMIN_USER_ENDPOINTS.RESET_PASSWORD(id));
  }

  /**
   * Get available admin roles
   */
  async getAdminRoles(): Promise<any[]> {
    return apiClient.get(ADMIN_USER_ENDPOINTS.ROLES);
  }

  /**
   * Create custom admin role
   */
  async createAdminRole(data: { name: string; permissions: string[] }): Promise<any> {
    return apiClient.post(ADMIN_USER_ENDPOINTS.CREATE_ROLE, data);
  }

  /**
   * Get admin permissions
   */
  async getAdminPermissions(): Promise<any[]> {
    return apiClient.get(ADMIN_USER_ENDPOINTS.PERMISSIONS);
  }

  /**
   * Bulk admin user actions
   */
  async bulkAdminUserActions(action: {
    action: 'activate' | 'deactivate' | 'suspend' | 'delete';
    admin_user_ids: string[];
    reason?: string;
  }): Promise<{
    successful: string[];
    failed: { id: string; reason: string }[];
  }> {
    return apiClient.post(`${ADMIN_USER_ENDPOINTS.LIST}/bulk-actions`, action);
  }
}

// Create and export service instance
export const adminUserService = new AdminUserService();
export { AdminUserService as default };
