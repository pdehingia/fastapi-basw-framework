/**
 * Settings API Service
 * Handles system configuration and settings operations
 */

import { apiClient, handleApiResponse, handleApiError } from './client';
import { SETTINGS_ENDPOINTS, API_VERSION } from '@/config/api';
import type { SystemSettings, SystemSetting } from '@/types/api.types';

export class SettingsService {
  /**
   * Get all system settings
   */
  static async getSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get(SETTINGS_ENDPOINTS.SYSTEM_SETTINGS);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update system settings
   */
  static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await apiClient.patch(SETTINGS_ENDPOINTS.SYSTEM_SETTINGS, settings);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update a specific setting
   */
  static async updateSetting(key: string, value: string): Promise<SystemSetting> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/settings/${key}`, { value });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reset settings to defaults
   */
  static async resetSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/settings/reset`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get specific settings section
   */
  static async getSettingsSection(
    section: 'general' | 'security' | 'notifications' | 'integrations'
  ): Promise<Partial<SystemSettings>> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/settings/${section}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update specific settings section
   */
  static async updateSettingsSection(
    section: 'general' | 'security' | 'notifications' | 'integrations',
    data: any
  ): Promise<Partial<SystemSettings>> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/settings/${section}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/settings/test-email`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Test SMS configuration
   */
  static async testSMSConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/settings/test-sms`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get system information
   */
  static async getSystemInfo(): Promise<{
    version: string;
    environment: string;
    uptime: number;
    lastDeployment: string;
    features: string[];
    limits: {
      maxUsers: number;
      maxBookings: number;
      storageLimit: number;
      apiRateLimit: number;
    };
  }> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/settings/system-info`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Enable/disable maintenance mode
   */
  static async toggleMaintenanceMode(enabled: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/settings/maintenance`, {
        enabled,
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Backup system settings
   */
  static async backupSettings(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/settings/backup`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Restore system settings from backup
   */
  static async restoreSettings(backupFile: File): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('backup', backupFile);
      
      const response = await apiClient.post(`${API_VERSION.CURRENT}/settings/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default SettingsService;