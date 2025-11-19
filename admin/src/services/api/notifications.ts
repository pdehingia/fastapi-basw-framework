/**
 * Notification API Service
 * Handles notification, template, and campaign operations
 */

import { apiClient, handleApiResponse, handleApiError } from './client';
import { API_VERSION } from '@/config/api';
import type {
  Notification,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreferences,
  NotificationAnalytics,
  NotificationListResponse,
  NotificationTemplateListResponse,
  NotificationCampaignListResponse,
  CreateNotificationRequest,
  CreateNotificationTemplateRequest,
  CreateNotificationCampaignRequest,
  QueryParams
} from '@/types/api.types';

export class NotificationService {
  // ==================== NOTIFICATIONS ====================

  /**
   * Get all notifications with filtering and pagination
   */
  static async getNotifications(params?: QueryParams & {
    type?: 'email' | 'push' | 'sms' | 'in_app';
    category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
    status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    recipient_id?: string;
  }): Promise<NotificationListResponse> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications`, { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get notification by ID
   */
  static async getNotification(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/${notificationId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new notification
   */
  static async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send notification immediately
   */
  static async sendNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/${notificationId}/send`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel notification
   */
  static async cancelNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/${notificationId}/cancel`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Retry failed notification
   */
  static async retryNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/${notificationId}/retry`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${API_VERSION.CURRENT}/notifications/${notificationId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==================== TEMPLATES ====================

  /**
   * Get all notification templates
   */
  static async getTemplates(params?: QueryParams & {
    type?: 'email' | 'push' | 'sms' | 'in_app';
    category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
    is_active?: boolean;
    is_default?: boolean;
  }): Promise<NotificationTemplateListResponse> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/templates`, { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get template by ID
   */
  static async getTemplate(templateId: string): Promise<NotificationTemplate> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/templates/${templateId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new template
   */
  static async createTemplate(data: CreateNotificationTemplateRequest): Promise<NotificationTemplate> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/templates`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update template
   */
  static async updateTemplate(
    templateId: string, 
    data: Partial<CreateNotificationTemplateRequest>
  ): Promise<NotificationTemplate> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/notifications/templates/${templateId}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete template
   */
  static async deleteTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${API_VERSION.CURRENT}/notifications/templates/${templateId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Preview template with data
   */
  static async previewTemplate(
    templateId: string, 
    data: Record<string, any>
  ): Promise<{ subject?: string; title?: string; body: string; html_body?: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/templates/${templateId}/preview`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Test template with sample data
   */
  static async testTemplate(
    templateId: string,
    testData: { recipient_email?: string; recipient_phone?: string; data?: Record<string, any> }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/templates/${templateId}/test`, testData);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==================== CAMPAIGNS ====================

  /**
   * Get all notification campaigns
   */
  static async getCampaigns(params?: QueryParams & {
    type?: 'email' | 'push' | 'sms' | 'mixed';
    status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
    template_id?: string;
  }): Promise<NotificationCampaignListResponse> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/campaigns`, { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaign(campaignId: string): Promise<NotificationCampaign> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create new campaign
   */
  static async createCampaign(data: CreateNotificationCampaignRequest): Promise<NotificationCampaign> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/campaigns`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(
    campaignId: string, 
    data: Partial<CreateNotificationCampaignRequest>
  ): Promise<NotificationCampaign> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Start campaign
   */
  static async startCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}/start`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Pause campaign
   */
  static async pauseCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}/pause`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Resume campaign
   */
  static async resumeCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}/resume`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel campaign
   */
  static async cancelCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}/cancel`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(campaignId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(campaignId: string): Promise<{
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    clicked_count: number;
    failed_count: number;
    unsubscribe_count: number;
    conversion_count: number;
    delivery_rate: number;
    click_rate: number;
    conversion_rate: number;
  }> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/campaigns/${campaignId}/analytics`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==================== PREFERENCES ====================

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/preferences/${userId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<Omit<NotificationPreferences, 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.patch(`${API_VERSION.CURRENT}/notifications/preferences/${userId}`, preferences);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get notification analytics
   */
  static async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    type?: 'email' | 'push' | 'sms' | 'in_app';
    category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  }): Promise<NotificationAnalytics> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/analytics`, { params });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get real-time notification stats
   */
  static async getRealTimeStats(): Promise<{
    total_pending: number;
    total_sending: number;
    total_sent_today: number;
    total_failed_today: number;
    avg_delivery_time: number;
    system_status: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const response = await apiClient.get(`${API_VERSION.CURRENT}/notifications/stats/realtime`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Send bulk notifications
   */
  static async sendBulkNotifications(
    notifications: CreateNotificationRequest[]
  ): Promise<{ success: boolean; sent_count: number; failed_count: number; errors: string[] }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/bulk`, { notifications });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Cancel multiple notifications
   */
  static async cancelBulkNotifications(
    notificationIds: string[]
  ): Promise<{ success: boolean; cancelled_count: number; failed_count: number; errors: string[] }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/bulk/cancel`, { notification_ids: notificationIds });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Retry multiple failed notifications
   */
  static async retryBulkNotifications(
    notificationIds: string[]
  ): Promise<{ success: boolean; retried_count: number; failed_count: number; errors: string[] }> {
    try {
      const response = await apiClient.post(`${API_VERSION.CURRENT}/notifications/bulk/retry`, { notification_ids: notificationIds });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default NotificationService;