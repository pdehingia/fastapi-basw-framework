import { apiService } from './base';
import type {
  EmailCampaign,
  EmailCampaignCreate,
  EmailCampaignUpdate,
  EmailCampaignFilters,
  EmailCampaignStatistics,
  SendCampaignRequest,
  SMSCampaign,
  SMSCampaignCreate,
  SMSCampaignUpdate,
  SMSCampaignFilters,
  SMSCampaignStatistics,
  SendSMSCampaignRequest,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

/**
 * Service for managing email and SMS campaigns
 */
export class CampaignsService {
  private readonly emailBasePath = '/api/admin/v1/campaigns/email-campaigns';
  private readonly smsBasePath = '/api/admin/v1/campaigns/sms-campaigns';

  // ==================== EMAIL CAMPAIGNS ====================

  /**
   * Get email campaign statistics
   */
  async getEmailStatistics() {
    return apiService.get<EmailCampaignStatistics>(`${this.emailBasePath}/statistics`);
  }

  /**
   * Get paginated list of email campaigns
   */
  async getEmailCampaigns(filters: EmailCampaignFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<EmailCampaign>(this.emailBasePath, {
      ...params,
      ...filters,
    });
  }

  /**
   * Create a new email campaign
   */
  async createEmailCampaign(data: EmailCampaignCreate) {
    return apiService.post<EmailCampaign>(this.emailBasePath, data);
  }

  /**
   * Get email campaign by ID
   */
  async getEmailCampaign(campaignId: string) {
    return apiService.get<EmailCampaign>(`${this.emailBasePath}/${campaignId}`);
  }

  /**
   * Update email campaign
   */
  async updateEmailCampaign(campaignId: string, data: EmailCampaignUpdate) {
    return apiService.put<EmailCampaign>(`${this.emailBasePath}/${campaignId}`, data);
  }

  /**
   * Delete email campaign (only drafts)
   */
  async deleteEmailCampaign(campaignId: string) {
    return apiService.delete<{ message: string }>(`${this.emailBasePath}/${campaignId}`);
  }

  /**
   * Send email campaign
   */
  async sendEmailCampaign(campaignId: string, data: SendCampaignRequest = { send_test: false }) {
    return apiService.post<EmailCampaign>(`${this.emailBasePath}/${campaignId}/send`, data);
  }

  // ==================== SMS CAMPAIGNS ====================

  /**
   * Get SMS campaign statistics
   */
  async getSMSStatistics() {
    return apiService.get<SMSCampaignStatistics>(`${this.smsBasePath}/statistics`);
  }

  /**
   * Get paginated list of SMS campaigns
   */
  async getSMSCampaigns(filters: SMSCampaignFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<SMSCampaign>(this.smsBasePath, {
      ...params,
      ...filters,
    });
  }

  /**
   * Create a new SMS campaign
   */
  async createSMSCampaign(data: SMSCampaignCreate) {
    return apiService.post<SMSCampaign>(this.smsBasePath, data);
  }

  /**
   * Get SMS campaign by ID
   */
  async getSMSCampaign(campaignId: string) {
    return apiService.get<SMSCampaign>(`${this.smsBasePath}/${campaignId}`);
  }

  /**
   * Update SMS campaign
   */
  async updateSMSCampaign(campaignId: string, data: SMSCampaignUpdate) {
    return apiService.put<SMSCampaign>(`${this.smsBasePath}/${campaignId}`, data);
  }

  /**
   * Delete SMS campaign (only drafts)
   */
  async deleteSMSCampaign(campaignId: string) {
    return apiService.delete<{ message: string }>(`${this.smsBasePath}/${campaignId}`);
  }

  /**
   * Send SMS campaign
   */
  async sendSMSCampaign(campaignId: string, data: SendSMSCampaignRequest = { send_test: false }) {
    return apiService.post<SMSCampaign>(`${this.smsBasePath}/${campaignId}/send`, data);
  }
}

export const campaignsService = new CampaignsService();
