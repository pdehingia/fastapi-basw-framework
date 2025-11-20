/**
 * System Configuration Service
 * Service for managing system configuration, feature flags, notifications, and OTP settings
 */

import { apiService } from './base';
import { CONFIG_ENDPOINTS } from '@/config/api';


// Configuration Types
export interface SystemConfiguration {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage?: number;
  target_users?: string[];
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_audience: 'all' | 'admins' | 'providers' | 'customers';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface OTPSettings {
  enabled: boolean;
  expiry_minutes: number;
  max_attempts: number;
  rate_limit_per_hour: number;
  sms_provider: string;
  email_enabled: boolean;
  sms_enabled: boolean;
}

export interface OTPStats {
  total_sent: number;
  total_verified: number;
  verification_rate: number;
  failed_attempts: number;
}

/**
 * System Configuration Service
 */
export class SystemConfigService {
  // Configuration Management
  async getConfiguration(params: {
    category?: string;
    is_public?: boolean;
  } = {}): Promise<SystemConfiguration[]> {
    return await apiService.get<SystemConfiguration[]>(
      CONFIG_ENDPOINTS.CONFIGURATION,
      params
    );
  }

  async getConfigByKey(key: string): Promise<SystemConfiguration> {
    return await apiService.get<SystemConfiguration>(
      CONFIG_ENDPOINTS.CONFIG_DETAIL(key)
    );
  }

  async updateConfig(
    key: string,
    data: Partial<SystemConfiguration>
  ): Promise<SystemConfiguration> {
    return await apiService.put<SystemConfiguration>(
      CONFIG_ENDPOINTS.CONFIG_DETAIL(key),
      data
    );
  }

  // Feature Flags Management
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return await apiService.get<FeatureFlag[]>(CONFIG_ENDPOINTS.FEATURE_FLAGS);
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    return await apiService.get<FeatureFlag>(
      CONFIG_ENDPOINTS.FEATURE_FLAG_DETAIL(id)
    );
  }

  async createFeatureFlag(
    data: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>
  ): Promise<FeatureFlag> {
    return await apiService.post<FeatureFlag>(
      CONFIG_ENDPOINTS.FEATURE_FLAGS,
      data
    );
  }

  async updateFeatureFlag(
    id: string,
    data: Partial<FeatureFlag>
  ): Promise<FeatureFlag> {
    return await apiService.put<FeatureFlag>(
      CONFIG_ENDPOINTS.FEATURE_FLAG_DETAIL(id),
      data
    );
  }

  async deleteFeatureFlag(id: string): Promise<void> {
    return await apiService.delete<void>(
      CONFIG_ENDPOINTS.FEATURE_FLAG_DETAIL(id)
    );
  }

  async toggleFeatureFlag(id: string): Promise<FeatureFlag> {
    return await apiService.post<FeatureFlag>(
      CONFIG_ENDPOINTS.TOGGLE_FLAG(id),
      {}
    );
  }

  // System Notifications Management
  async getSystemNotifications(): Promise<SystemNotification[]> {
    return await apiService.get<SystemNotification[]>(
      CONFIG_ENDPOINTS.SYSTEM_NOTIFICATIONS
    );
  }

  async getSystemNotification(
    id: string
  ): Promise<SystemNotification> {
    return await apiService.get<SystemNotification>(
      CONFIG_ENDPOINTS.NOTIFICATION_DETAIL(id)
    );
  }

  async createSystemNotification(
    data: Omit<SystemNotification, 'id' | 'created_at'>
  ): Promise<SystemNotification> {
    return await apiService.post<SystemNotification>(
      CONFIG_ENDPOINTS.SYSTEM_NOTIFICATIONS,
      data
    );
  }

  async updateSystemNotification(
    id: string,
    data: Partial<SystemNotification>
  ): Promise<SystemNotification> {
    return await apiService.put<SystemNotification>(
      CONFIG_ENDPOINTS.NOTIFICATION_DETAIL(id),
      data
    );
  }

  async deleteSystemNotification(id: string): Promise<void> {
    return await apiService.delete<void>(
      CONFIG_ENDPOINTS.NOTIFICATION_DETAIL(id)
    );
  }

  async sendSystemNotification(id: string): Promise<void> {
    return await apiService.post<void>(CONFIG_ENDPOINTS.SEND_NOTIFICATION, {
      notification_id: id,
    });
  }

  // OTP Management
  async getOTPSettings(): Promise<OTPSettings> {
    return await apiService.get<OTPSettings>(CONFIG_ENDPOINTS.OTP_SETTINGS);
  }

  async updateOTPSettings(
    data: Partial<OTPSettings>
  ): Promise<OTPSettings> {
    return await apiService.put<OTPSettings>(
      CONFIG_ENDPOINTS.OTP_SETTINGS,
      data
    );
  }

  async getOTPStats(): Promise<OTPStats> {
    return await apiService.get<OTPStats>(CONFIG_ENDPOINTS.OTP_STATS);
  }
}

// Export singleton instance
export const systemConfigService = new SystemConfigService();
export default systemConfigService;
