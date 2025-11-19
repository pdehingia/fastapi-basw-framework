/**
 * Session Management API Service
 * Handles admin, provider, and customer session operations
 * Backend: Phase 2 - User Sessions Management (18 endpoints)
 */

import { SESSION_ENDPOINTS } from '@/config/api';
import { apiService } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  UserSession,
  AdminSession,
  ProviderSession,
  CustomerSession,
  SessionStats,
  SessionFilters,
  RevokeSessionRequest,
  RevokeAllSessionsRequest,
} from '@/types/api.types';

export class SessionManagementService {
  // ==================== ADMIN SESSIONS ====================

  /**
   * Get paginated list of admin sessions
   */
  async getAdminSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<AdminSession>>> {
    return await apiService.get<PaginatedResponse<AdminSession>>(
      SESSION_ENDPOINTS.ADMIN_SESSIONS,
      filters
    );
  }

  /**
   * Get admin sessions statistics
   */
  async getAdminSessionsStats(): Promise<ApiResponse<SessionStats>> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.ADMIN_SESSIONS_STATS);
  }

  /**
   * Get active admin sessions
   */
  async getActiveAdminSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<AdminSession>>> {
    return await apiService.get<PaginatedResponse<AdminSession>>(
      SESSION_ENDPOINTS.ADMIN_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get admin session details by ID
   */
  async getAdminSessionDetail(sessionId: string): Promise<ApiResponse<AdminSession>> {
    return await apiService.get<AdminSession>(
      SESSION_ENDPOINTS.ADMIN_SESSION_DETAIL(sessionId)
    );
  }

  /**
   * Revoke a specific admin session
   */
  async revokeAdminSession(
    sessionId: string,
    data: RevokeSessionRequest = {}
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiService.post<{ message: string }>(
      SESSION_ENDPOINTS.ADMIN_SESSION_REVOKE(sessionId),
      data
    );
  }

  /**
   * Revoke all sessions for a specific admin user
   */
  async revokeAllAdminUserSessions(
    userId: string,
    data: RevokeAllSessionsRequest
  ): Promise<ApiResponse<{ revoked_count: number; message: string }>> {
    return await apiService.post<{ revoked_count: number; message: string }>(
      SESSION_ENDPOINTS.ADMIN_USER_REVOKE_ALL(userId),
      data
    );
  }

  // ==================== PROVIDER SESSIONS ====================

  /**
   * Get paginated list of provider sessions
   */
  async getProviderSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<ProviderSession>>> {
    return await apiService.get<PaginatedResponse<ProviderSession>>(
      SESSION_ENDPOINTS.PROVIDER_SESSIONS,
      filters
    );
  }

  /**
   * Get provider sessions statistics
   */
  async getProviderSessionsStats(): Promise<ApiResponse<SessionStats>> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.PROVIDER_SESSIONS_STATS);
  }

  /**
   * Get active provider sessions
   */
  async getActiveProviderSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<ProviderSession>>> {
    return await apiService.get<PaginatedResponse<ProviderSession>>(
      SESSION_ENDPOINTS.PROVIDER_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get provider session details by ID
   */
  async getProviderSessionDetail(sessionId: string): Promise<ApiResponse<ProviderSession>> {
    return await apiService.get<ProviderSession>(
      SESSION_ENDPOINTS.PROVIDER_SESSION_DETAIL(sessionId)
    );
  }

  /**
   * Revoke a specific provider session
   */
  async revokeProviderSession(
    sessionId: string,
    data: RevokeSessionRequest = {}
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiService.post<{ message: string }>(
      SESSION_ENDPOINTS.PROVIDER_SESSION_REVOKE(sessionId),
      data
    );
  }

  /**
   * Revoke all sessions for a specific provider user
   */
  async revokeAllProviderUserSessions(
    userId: string,
    data: RevokeAllSessionsRequest
  ): Promise<ApiResponse<{ revoked_count: number; message: string }>> {
    return await apiService.post<{ revoked_count: number; message: string }>(
      SESSION_ENDPOINTS.PROVIDER_USER_REVOKE_ALL(userId),
      data
    );
  }

  // ==================== CUSTOMER SESSIONS ====================

  /**
   * Get paginated list of customer sessions
   */
  async getCustomerSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<CustomerSession>>> {
    return await apiService.get<PaginatedResponse<CustomerSession>>(
      SESSION_ENDPOINTS.CUSTOMER_SESSIONS,
      filters
    );
  }

  /**
   * Get customer sessions statistics
   */
  async getCustomerSessionsStats(): Promise<ApiResponse<SessionStats>> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.CUSTOMER_SESSIONS_STATS);
  }

  /**
   * Get active customer sessions
   */
  async getActiveCustomerSessions(
    filters: SessionFilters = {}
  ): Promise<ApiResponse<PaginatedResponse<CustomerSession>>> {
    return await apiService.get<PaginatedResponse<CustomerSession>>(
      SESSION_ENDPOINTS.CUSTOMER_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get customer session details by ID
   */
  async getCustomerSessionDetail(sessionId: string): Promise<ApiResponse<CustomerSession>> {
    return await apiService.get<CustomerSession>(
      SESSION_ENDPOINTS.CUSTOMER_SESSION_DETAIL(sessionId)
    );
  }

  /**
   * Revoke a specific customer session
   */
  async revokeCustomerSession(
    sessionId: string,
    data: RevokeSessionRequest = {}
  ): Promise<ApiResponse<{ message: string }>> {
    return await apiService.post<{ message: string }>(
      SESSION_ENDPOINTS.CUSTOMER_SESSION_REVOKE(sessionId),
      data
    );
  }

  /**
   * Revoke all sessions for a specific customer user
   */
  async revokeAllCustomerUserSessions(
    userId: string,
    data: RevokeAllSessionsRequest
  ): Promise<ApiResponse<{ revoked_count: number; message: string }>> {
    return await apiService.post<{ revoked_count: number; message: string }>(
      SESSION_ENDPOINTS.CUSTOMER_USER_REVOKE_ALL(userId),
      data
    );
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Revoke multiple sessions at once
   */
  async bulkRevokeSessions(
    sessionIds: string[],
    userType: 'admin' | 'provider' | 'customer',
    data: RevokeSessionRequest = {}
  ): Promise<ApiResponse<{
    revoked: string[];
    failed: Array<{ session_id: string; error: string }>;
  }>> {
    const endpoint =
      userType === 'admin'
        ? SESSION_ENDPOINTS.ADMIN_SESSIONS
        : userType === 'provider'
        ? SESSION_ENDPOINTS.PROVIDER_SESSIONS
        : SESSION_ENDPOINTS.CUSTOMER_SESSIONS;

    return await apiService.post<{
      revoked: string[];
      failed: Array<{ session_id: string; error: string }>;
    }>(`${endpoint}/bulk-revoke`, {
      session_ids: sessionIds,
      ...data,
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all sessions statistics (combined)
   */
  async getAllSessionsStats(): Promise<ApiResponse<{
    admin: SessionStats;
    provider: SessionStats;
    customer: SessionStats;
    total: {
      total_sessions: number;
      active_sessions: number;
      unique_users: number;
    };
  }>> {
    const [adminStats, providerStats, customerStats] = await Promise.all([
      this.getAdminSessionsStats(),
      this.getProviderSessionsStats(),
      this.getCustomerSessionsStats(),
    ]);

    return {
      success: true,
      data: {
        admin: adminStats.data,
        provider: providerStats.data,
        customer: customerStats.data,
        total: {
          total_sessions:
            adminStats.data.total_sessions +
            providerStats.data.total_sessions +
            customerStats.data.total_sessions,
          active_sessions:
            adminStats.data.active_sessions +
            providerStats.data.active_sessions +
            customerStats.data.active_sessions,
          unique_users:
            adminStats.data.unique_users +
            providerStats.data.unique_users +
            customerStats.data.unique_users,
        },
      },
      message: 'Sessions statistics retrieved successfully',
    };
  }

  /**
   * Search sessions across all user types
   */
  async searchSessions(
    query: string,
    userType?: 'admin' | 'provider' | 'customer'
  ): Promise<ApiResponse<PaginatedResponse<UserSession>>> {
    const filters: SessionFilters = { search: query };

    if (userType === 'admin') {
      return await this.getAdminSessions(filters);
    } else if (userType === 'provider') {
      return await this.getProviderSessions(filters);
    } else if (userType === 'customer') {
      return await this.getCustomerSessions(filters);
    }

    // If no user type specified, search admin sessions by default
    return await this.getAdminSessions(filters);
  }

  /**
   * Get sessions by user ID across all types
   */
  async getSessionsByUserId(
    userId: string,
    userType: 'admin' | 'provider' | 'customer'
  ): Promise<ApiResponse<PaginatedResponse<UserSession>>> {
    const filters: SessionFilters = { user_id: userId };

    switch (userType) {
      case 'admin':
        return await this.getAdminSessions(filters);
      case 'provider':
        return await this.getProviderSessions(filters);
      case 'customer':
        return await this.getCustomerSessions(filters);
      default:
        throw new Error(`Invalid user type: ${userType}`);
    }
  }
}

// Export service instance
export const sessionManagementService = new SessionManagementService();
export default SessionManagementService;
