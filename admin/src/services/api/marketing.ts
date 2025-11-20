/**
 * Marketing Management API Service
 * Handles campaigns, promotions, analytics, and customer segmentation
 */

import { ApiService } from './base';
import { 
  PromotionCampaign, 
  CouponCode, 
  ReferralStats, 
  ReferralConfig,
  
  PaginatedResponse,
  QueryParams
} from '@/types';

// Enhanced marketing types
export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'referral' | 'promotional' | 'seasonal';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  description: string;
  target_audience: 'all' | 'new_customers' | 'existing_customers' | 'high_value' | 'inactive';
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  channels: string[];
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
    roi: number;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MarketingAnalytics {
  overview: {
    total_campaigns: number;
    active_campaigns: number;
    total_budget: number;
    total_spent: number;
    avg_roi: number;
    total_conversions: number;
  };
  campaign_performance: {
    top_performing: MarketingCampaign[];
    lowest_performing: MarketingCampaign[];
    by_channel: Record<string, {
      impressions: number;
      clicks: number;
      conversions: number;
      roi: number;
    }>;
  };
  customer_insights: {
    acquisition_cost: number;
    lifetime_value: number;
    retention_rate: number;
    segmentation: Record<string, number>;
  };
  trends: {
    monthly_performance: Array<{
      month: string;
      campaigns: number;
      budget: number;
      conversions: number;
      roi: number;
    }>;
  };
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    age_range?: [number, number];
    location?: string[];
    purchase_history?: 'none' | 'low' | 'medium' | 'high';
    engagement_level?: 'inactive' | 'low' | 'medium' | 'high';
    signup_date_range?: [string, string];
    total_spent_range?: [number, number];
  };
  customer_count: number;
  avg_lifetime_value: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingFilters {
  type?: MarketingCampaign['type'];
  status?: MarketingCampaign['status'];
  target_audience?: MarketingCampaign['target_audience'];
  channel?: string;
  date_from?: string;
  date_to?: string;
  min_budget?: number;
  max_budget?: number;
  search?: string;
}

export interface CreateCampaignRequest {
  name: string;
  type: MarketingCampaign['type'];
  description: string;
  target_audience: MarketingCampaign['target_audience'];
  budget: number;
  start_date: string;
  end_date: string;
  channels: string[];
  content?: {
    subject?: string;
    message?: string;
    images?: string[];
    cta_text?: string;
    cta_url?: string;
  };
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  status?: MarketingCampaign['status'];
}

export interface CreateSegmentRequest {
  name: string;
  description: string;
  criteria: CustomerSegment['criteria'];
}

class MarketingService extends ApiService {
  private readonly basePath = '/api/admin/v1/marketing';

  // Campaign Management
  async getCampaigns(params: MarketingFilters & QueryParams = {}): Promise<PaginatedResponse<MarketingCampaign>> {
    return this.get(`${this.basePath}/campaigns`, { params });
  }

  async getCampaign(id: string): Promise<MarketingCampaign> {
    return this.get(`${this.basePath}/campaigns/${id}`);
  }

  async createCampaign(data: CreateCampaignRequest): Promise<MarketingCampaign> {
    return this.post(`${this.basePath}/campaigns`, data);
  }

  async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<MarketingCampaign> {
    return this.patch(`${this.basePath}/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string): Promise<void> {
    return this.delete(`${this.basePath}/campaigns/${id}`);
  }

  async duplicateCampaign(id: string, newName: string): Promise<MarketingCampaign> {
    return this.post(`${this.basePath}/campaigns/${id}/duplicate`, { name: newName });
  }

  async pauseCampaign(id: string): Promise<MarketingCampaign> {
    return this.patch(`${this.basePath}/campaigns/${id}/pause`);
  }

  async resumeCampaign(id: string): Promise<MarketingCampaign> {
    return this.patch(`${this.basePath}/campaigns/${id}/resume`);
  }

  // Promotion Management
  async getPromotions(params: QueryParams = {}): Promise<PaginatedResponse<PromotionCampaign>> {
    return this.get(`${this.basePath}/promotions`, { params });
  }

  async createPromotion(data: Partial<PromotionCampaign>): Promise<PromotionCampaign> {
    return this.post(`${this.basePath}/promotions`, data);
  }

  async updatePromotion(id: string, data: Partial<PromotionCampaign>): Promise<PromotionCampaign> {
    return this.patch(`${this.basePath}/promotions/${id}`, data);
  }

  async deletePromotion(id: string): Promise<void> {
    return this.delete(`${this.basePath}/promotions/${id}`);
  }

  // Coupon Management
  async getCoupons(params: QueryParams = {}): Promise<PaginatedResponse<CouponCode>> {
    return this.get(`${this.basePath}/coupons`, { params });
  }

  async createCoupon(data: Partial<CouponCode>): Promise<CouponCode> {
    return this.post(`${this.basePath}/coupons`, data);
  }

  async updateCoupon(id: string, data: Partial<CouponCode>): Promise<CouponCode> {
    return this.patch(`${this.basePath}/coupons/${id}`, data);
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.delete(`${this.basePath}/coupons/${id}`);
  }

  async generateCouponCodes(params: {
    count: number;
    prefix?: string;
    length?: number;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    expires_at?: string;
  }): Promise<CouponCode[]> {
    return this.post(`${this.basePath}/coupons/generate`, params);
  }

  // Analytics
  async getMarketingAnalytics(params: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    date_from?: string;
    date_to?: string;
  } = {}): Promise<MarketingAnalytics> {
    return this.get(`${this.basePath}/analytics`, { params });
  }

  async getCampaignAnalytics(campaignId: string): Promise<MarketingCampaign['metrics'] & {
    timeline: Array<{
      date: string;
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
  }> {
    return this.get(`${this.basePath}/campaigns/${campaignId}/analytics`);
  }

  // Customer Segmentation
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    return this.get(`${this.basePath}/segments`);
  }

  async createCustomerSegment(data: CreateSegmentRequest): Promise<CustomerSegment> {
    return this.post(`${this.basePath}/segments`, data);
  }

  async updateCustomerSegment(id: string, data: Partial<CreateSegmentRequest>): Promise<CustomerSegment> {
    return this.patch(`${this.basePath}/segments/${id}`, data);
  }

  async deleteCustomerSegment(id: string): Promise<void> {
    return this.delete(`${this.basePath}/segments/${id}`);
  }

  async getSegmentCustomers(id: string, params: QueryParams = {}): Promise<PaginatedResponse<any>> {
    return this.get(`${this.basePath}/segments/${id}/customers`, { params });
  }

  // Referral Management
  async getReferralStats(): Promise<ReferralStats> {
    return this.get(`${this.basePath}/referrals/stats`);
  }

  async getReferralConfig(): Promise<ReferralConfig> {
    return this.get(`${this.basePath}/referrals/config`);
  }

  async updateReferralConfig(data: Partial<ReferralConfig>): Promise<ReferralConfig> {
    return this.patch(`${this.basePath}/referrals/config`, data);
  }

  // Campaign Templates
  async getCampaignTemplates(): Promise<Array<{
    id: string;
    name: string;
    type: MarketingCampaign['type'];
    description: string;
    template: Partial<CreateCampaignRequest>;
  }>> {
    return this.get(`${this.basePath}/templates`);
  }

  // Email Marketing
  async sendTestEmail(campaignId: string, testEmails: string[]): Promise<void> {
    return this.post(`${this.basePath}/campaigns/${campaignId}/test-email`, { emails: testEmails });
  }

  async scheduleCampaign(campaignId: string, scheduledDate: string): Promise<MarketingCampaign> {
    return this.patch(`${this.basePath}/campaigns/${campaignId}/schedule`, { scheduled_date: scheduledDate });
  }

  // Bulk Operations
  async bulkUpdateCampaigns(campaignIds: string[], action: 'pause' | 'resume' | 'archive'): Promise<{ success: string[]; failed: string[] }> {
    return this.patch(`${this.basePath}/campaigns/bulk`, { campaign_ids: campaignIds, action });
  }

  // Export/Reporting
  async exportCampaignData(campaignId?: string, format: 'csv' | 'xlsx' = 'csv'): Promise<{ download_url: string }> {
    const endpoint = campaignId 
      ? `${this.basePath}/campaigns/${campaignId}/export`
      : `${this.basePath}/campaigns/export`;
    return this.get(endpoint, { params: { format } });
  }

  async exportAnalyticsReport(params: {
    period?: string;
    date_from?: string;
    date_to?: string;
    format?: 'csv' | 'xlsx' | 'pdf';
  }): Promise<{ download_url: string }> {
    return this.get(`${this.basePath}/analytics/export`, { params });
  }
}

export const marketingService = new MarketingService();
export default marketingService;
