import { apiService } from './base';
import type {
  UserActivityLog,
  UserActivityLogFilters,
  ActivityLogStatistics,
  CustomerAuditLog,
  CustomerAuditLogFilters,
  ProviderAuditLog,
  ProviderAuditLogFilters,
  AuditLogStatistics,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

/**
 * Service for managing audit logs (activity, customer, provider)
 */
export class AuditLogsService {
  private readonly basePath = '/api/admin/v1/audit-logs';

  // ===== USER ACTIVITY LOGS =====

  /**
   * Get paginated list of user activity logs
   */
  async getUserActivityLogs(filters: UserActivityLogFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<UserActivityLog>(
      `${this.basePath}/user-activity-logs`,
      {
        params: {
          page: params.page || 1,
          size: params.page_size || 20,
          ...filters,
        },
      }
    );
  }

  /**
   * Get specific user activity log by ID
   */
  async getUserActivityLog(logId: number) {
    return apiService.get<UserActivityLog>(`${this.basePath}/user-activity-logs/${logId}`);
  }

  /**
   * Get user activity log statistics
   */
  async getUserActivityLogStatistics() {
    return apiService.get<ActivityLogStatistics>(`${this.basePath}/user-activity-logs/stats`);
  }

  /**
   * Delete old activity logs (data retention)
   */
  async deleteOldActivityLogs(days: number = 90) {
    return apiService.delete<{ deleted_count: number; message: string }>(
      `${this.basePath}/user-activity-logs/cleanup?days=${days}`
    );
  }

  // ===== CUSTOMER AUDIT LOGS =====

  /**
   * Get paginated list of customer audit logs
   */
  async getCustomerAuditLogs(filters: CustomerAuditLogFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<CustomerAuditLog>(
      `${this.basePath}/customer-audit-logs`,
      {
        params: {
          page: params.page || 1,
          size: params.page_size || 20,
          ...filters,
        },
      }
    );
  }

  /**
   * Get specific customer audit log by ID
   */
  async getCustomerAuditLog(logId: number) {
    return apiService.get<CustomerAuditLog>(`${this.basePath}/customer-audit-logs/${logId}`);
  }

  /**
   * Get customer audit log statistics
   */
  async getCustomerAuditLogStatistics() {
    return apiService.get<AuditLogStatistics>(`${this.basePath}/customer-audit-logs/stats`);
  }

  // ===== PROVIDER AUDIT LOGS =====

  /**
   * Get paginated list of provider audit logs
   */
  async getProviderAuditLogs(filters: ProviderAuditLogFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<ProviderAuditLog>(
      `${this.basePath}/provider-audit-logs`,
      {
        params: {
          page: params.page || 1,
          size: params.page_size || 20,
          ...filters,
        },
      }
    );
  }

  /**
   * Get specific provider audit log by ID
   */
  async getProviderAuditLog(logId: number) {
    return apiService.get<ProviderAuditLog>(`${this.basePath}/provider-audit-logs/${logId}`);
  }

  /**
   * Get provider audit log statistics
   */
  async getProviderAuditLogStatistics() {
    return apiService.get<AuditLogStatistics>(`${this.basePath}/provider-audit-logs/stats`);
  }

  // ===== UNIFIED METHODS (for dashboard/overview) =====

  /**
   * Get all audit log statistics combined
   */
  async getAllStatistics() {
    const [activityStats, customerStats, providerStats] = await Promise.all([
      this.getUserActivityLogStatistics(),
      this.getCustomerAuditLogStatistics(),
      this.getProviderAuditLogStatistics(),
    ]);

    return {
      activity: activityStats.data,
      customer: customerStats.data,
      provider: providerStats.data,
    };
  }
}

export const auditLogsService = new AuditLogsService();
