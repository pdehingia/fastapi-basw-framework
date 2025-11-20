/**
 * Session Management API Service
 * Handles admin, provider, and customer session operations
 * Backend: Phase 2 - User Sessions Management (18 endpoints)
 */

import { SESSION_ENDPOINTS } from '@/config/api';
import { apiService } from './base';
import type {
  
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
  ): Promise<PaginatedResponse<AdminSession>> {
    return await apiService.get<PaginatedResponse<AdminSession>>(
      SESSION_ENDPOINTS.ADMIN_SESSIONS,
      filters
    );
  }

  /**
   * Get admin sessions statistics
   */
  async getAdminSessionsStats(): Promise<SessionStats> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.ADMIN_SESSIONS_STATS);
  }

  /**
   * Get active admin sessions
   */
  async getActiveAdminSessions(
    filters: SessionFilters = {}
  ): Promise<PaginatedResponse<AdminSession>> {
    return await apiService.get<PaginatedResponse<AdminSession>>(
      SESSION_ENDPOINTS.ADMIN_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get admin session details by ID
   */
  async getAdminSessionDetail(sessionId: string): Promise<AdminSession> {
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
  ): Promise<{ message: string }> {
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
  ): Promise<{ revoked_count: number; message: string }> {
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
  ): Promise<PaginatedResponse<ProviderSession>> {
    return await apiService.get<PaginatedResponse<ProviderSession>>(
      SESSION_ENDPOINTS.PROVIDER_SESSIONS,
      filters
    );
  }

  /**
   * Get provider sessions statistics
   */
  async getProviderSessionsStats(): Promise<SessionStats> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.PROVIDER_SESSIONS_STATS);
  }

  /**
   * Get active provider sessions
   */
  async getActiveProviderSessions(
    filters: SessionFilters = {}
  ): Promise<PaginatedResponse<ProviderSession>> {
    return await apiService.get<PaginatedResponse<ProviderSession>>(
      SESSION_ENDPOINTS.PROVIDER_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get provider session details by ID
   */
  async getProviderSessionDetail(sessionId: string): Promise<ProviderSession> {
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
  ): Promise<{ message: string }> {
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
  ): Promise<{ revoked_count: number; message: string }> {
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
  ): Promise<PaginatedResponse<CustomerSession>> {
    return await apiService.get<PaginatedResponse<CustomerSession>>(
      SESSION_ENDPOINTS.CUSTOMER_SESSIONS,
      filters
    );
  }

  /**
   * Get customer sessions statistics
   */
  async getCustomerSessionsStats(): Promise<SessionStats> {
    return await apiService.get<SessionStats>(SESSION_ENDPOINTS.CUSTOMER_SESSIONS_STATS);
  }

  /**
   * Get active customer sessions
   */
  async getActiveCustomerSessions(
    filters: SessionFilters = {}
  ): Promise<PaginatedResponse<CustomerSession>> {
    return await apiService.get<PaginatedResponse<CustomerSession>>(
      SESSION_ENDPOINTS.CUSTOMER_SESSIONS_ACTIVE,
      filters
    );
  }

  /**
   * Get customer session details by ID
   */
  async getCustomerSessionDetail(sessionId: string): Promise<CustomerSession> {
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
  ): Promise<{ message: string }> {
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
  ): Promise<{ revoked_count: number; message: string }> {
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
  ): Promise<{
    revoked: string[];
    failed: Array<{ session_id: string; error: string }>;
  }> {
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
  async getAllSessionsStats(): Promise<{
    admin: SessionStats;
    provider: SessionStats;
    customer: SessionStats;
    total: {
      total_sessions: number;
      active_sessions: number;
      unique_users: number;
    };
  }> {
    const [adminStats, providerStats, customerStats] = await Promise.all([
      this.getAdminSessionsStats(),
      this.getProviderSessionsStats(),
      this.getCustomerSessionsStats(),
    ]);

    return {
      admin: adminStats,
      provider: providerStats,
      customer: customerStats,
      total: {
        total_sessions:
          adminStats.total_sessions +
          providerStats.total_sessions +
          customerStats.total_sessions,
        active_sessions:
          adminStats.active_sessions +
          providerStats.active_sessions +
          customerStats.active_sessions,
        unique_users:
          adminStats.unique_users +
          providerStats.unique_users +
          customerStats.unique_users,
      },
    };
  }

  /**
   * Search sessions across all user types
   */
  async searchSessions(
    query: string,
    userType?: 'admin' | 'provider' | 'customer'
  ): Promise<PaginatedResponse<UserSession>> {
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
  ): Promise<PaginatedResponse<UserSession>> {
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
