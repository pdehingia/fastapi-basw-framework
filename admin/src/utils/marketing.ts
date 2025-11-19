/**
 * Marketing Management Utilities
 * Core utilities for campaign management, analytics, and customer segmentation
 */

import { format, parseISO, differenceInDays, addDays, startOfDay, endOfDay } from 'date-fns';

// ==================== Types & Interfaces ====================

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  targetAudience: TargetAudience;
  channels: MarketingChannel[];
  metrics: CampaignMetrics;
  settings: CampaignSettings;
}

export type CampaignType = 
  | 'email'
  | 'social'
  | 'display'
  | 'search'
  | 'influencer'
  | 'content'
  | 'event'
  | 'referral';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface TargetAudience {
  id: string;
  name: string;
  description: string;
  criteria: AudienceCriteria;
  estimatedSize: number;
  segments: CustomerSegment[];
}

export interface AudienceCriteria {
  demographics: {
    ageRange?: [number, number];
    gender?: 'male' | 'female' | 'other' | 'all';
    location?: string[];
    income?: [number, number];
  };
  behavioral: {
    purchaseHistory?: boolean;
    engagementLevel?: 'high' | 'medium' | 'low';
    lastActive?: number; // days
    categories?: string[];
  };
  psychographic: {
    interests?: string[];
    lifestyle?: string[];
    values?: string[];
  };
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: AudienceCriteria;
  size: number;
  value: number; // average customer value
  conversionRate: number;
  createdAt: string;
}

export interface MarketingChannel {
  id: string;
  name: string;
  type: ChannelType;
  platform: string;
  budget: number;
  spent: number;
  metrics: ChannelMetrics;
  settings: ChannelSettings;
}

export type ChannelType = 
  | 'email'
  | 'social_media'
  | 'google_ads'
  | 'facebook_ads'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'display'
  | 'native'
  | 'influencer'
  | 'content'
  | 'seo'
  | 'affiliate';

export interface ChannelMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number; // click-through rate
  cpc: number; // cost per click
  cpa: number; // cost per acquisition
  roas: number; // return on ad spend
  reach: number;
  engagement: number;
}

export interface ChannelSettings {
  targeting: AudienceCriteria;
  bidStrategy?: 'cpc' | 'cpm' | 'cpa' | 'target_roas';
  schedule?: ScheduleSettings;
  creative?: CreativeAssets;
  budget?: BudgetSettings;
}

export interface ScheduleSettings {
  timezone: string;
  dayParting: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface CreativeAssets {
  images: Asset[];
  videos: Asset[];
  copy: CopyVariant[];
  headlines: string[];
  descriptions: string[];
  callToActions: string[];
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  dimensions?: { width: number; height: number };
  alt?: string;
}

export interface CopyVariant {
  id: string;
  headline: string;
  description: string;
  callToAction: string;
  language: string;
  tone: 'formal' | 'casual' | 'friendly' | 'urgent' | 'professional';
}

export interface BudgetSettings {
  daily: number;
  total: number;
  currency: string;
  pacing: 'standard' | 'accelerated';
  optimization: 'conversions' | 'clicks' | 'impressions';
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  leads: number;
  sales: number;
  
  // Calculated metrics
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  roi: number;
  conversionRate: number;
  costPerLead: number;
  ltv: number; // lifetime value
  
  // Engagement metrics
  emailOpens: number;
  emailClicks: number;
  socialShares: number;
  socialLikes: number;
  socialComments: number;
  videoViews: number;
  pageViews: number;
  timeOnPage: number;
}

export interface CampaignSettings {
  autoOptimization: boolean;
  frequencyCap: number;
  attribution: AttributionModel;
  tracking: TrackingSettings;
  notifications: NotificationSettings;
}

export type AttributionModel = 
  | 'first_click'
  | 'last_click'
  | 'linear'
  | 'time_decay'
  | 'position_based'
  | 'data_driven';

export interface TrackingSettings {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
  conversionGoals: ConversionGoal[];
  pixelIds: string[];
}

export interface ConversionGoal {
  id: string;
  name: string;
  type: 'purchase' | 'lead' | 'signup' | 'download' | 'view' | 'custom';
  value: number;
  currency?: string;
}

export interface NotificationSettings {
  budgetAlerts: boolean;
  performanceAlerts: boolean;
  completionAlerts: boolean;
  emailRecipients: string[];
  slackWebhook?: string;
}

// ==================== Campaign Management Utilities ====================

export class CampaignManager {
  // Campaign CRUD operations
  static validateCampaign(campaign: Partial<Campaign>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!campaign.name?.trim()) {
      errors.push('Campaign name is required');
    }

    if (!campaign.type) {
      errors.push('Campaign type is required');
    }

    if (!campaign.startDate) {
      errors.push('Start date is required');
    }

    if (!campaign.endDate) {
      errors.push('End date is required');
    }

    if (campaign.startDate && campaign.endDate) {
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      
      if (start >= end) {
        errors.push('End date must be after start date');
      }

      if (start < new Date()) {
        errors.push('Start date cannot be in the past');
      }
    }

    if (!campaign.budget || campaign.budget <= 0) {
      errors.push('Budget must be greater than 0');
    }

    if (!campaign.targetAudience) {
      errors.push('Target audience is required');
    }

    if (!campaign.channels || campaign.channels.length === 0) {
      errors.push('At least one marketing channel is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static calculateCampaignMetrics(campaign: Campaign): CampaignMetrics {
    const channels = campaign.channels || [];
    
    // Aggregate metrics from all channels
    const aggregated = channels.reduce((acc, channel) => {
      const metrics = channel.metrics;
      return {
        impressions: acc.impressions + metrics.impressions,
        clicks: acc.clicks + metrics.clicks,
        conversions: acc.conversions + metrics.conversions,
        cost: acc.cost + metrics.cost,
        revenue: acc.revenue + metrics.revenue,
        reach: acc.reach + metrics.reach,
        engagement: acc.engagement + metrics.engagement,
      };
    }, {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      revenue: 0,
      reach: 0,
      engagement: 0,
    });

    // Calculate derived metrics
    const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
    const cpc = aggregated.clicks > 0 ? aggregated.cost / aggregated.clicks : 0;
    const cpa = aggregated.conversions > 0 ? aggregated.cost / aggregated.conversions : 0;
    const roas = aggregated.cost > 0 ? aggregated.revenue / aggregated.cost : 0;
    const roi = aggregated.cost > 0 ? ((aggregated.revenue - aggregated.cost) / aggregated.cost) * 100 : 0;
    const conversionRate = aggregated.clicks > 0 ? (aggregated.conversions / aggregated.clicks) * 100 : 0;

    return {
      ...aggregated,
      leads: Math.floor(aggregated.conversions * 0.7), // Estimate
      sales: Math.floor(aggregated.conversions * 0.3), // Estimate
      ctr,
      cpc,
      cpa,
      roas,
      roi,
      conversionRate,
      costPerLead: aggregated.conversions > 0 ? aggregated.cost / (aggregated.conversions * 0.7) : 0,
      ltv: aggregated.revenue > 0 ? aggregated.revenue / aggregated.conversions * 3 : 0, // Estimate
      emailOpens: Math.floor(aggregated.impressions * 0.2), // Estimate for email campaigns
      emailClicks: Math.floor(aggregated.clicks * 0.15), // Estimate
      socialShares: Math.floor(aggregated.engagement * 0.1),
      socialLikes: Math.floor(aggregated.engagement * 0.6),
      socialComments: Math.floor(aggregated.engagement * 0.3),
      videoViews: Math.floor(aggregated.impressions * 0.4), // For video campaigns
      pageViews: aggregated.clicks,
      timeOnPage: 120, // Estimate in seconds
    };
  }

  static getCampaignStatus(campaign: Campaign): { status: CampaignStatus; daysRemaining: number; progress: number } {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    
    const totalDays = differenceInDays(end, start);
    const daysElapsed = differenceInDays(now, start);
    const daysRemaining = differenceInDays(end, now);
    
    let status: CampaignStatus = campaign.status;
    let progress = 0;
    
    if (now < start) {
      status = 'scheduled';
      progress = 0;
    } else if (now >= start && now <= end && campaign.status === 'active') {
      status = 'active';
      progress = totalDays > 0 ? Math.min((daysElapsed / totalDays) * 100, 100) : 100;
    } else if (now > end) {
      status = 'completed';
      progress = 100;
    }
    
    return {
      status,
      daysRemaining: Math.max(daysRemaining, 0),
      progress,
    };
  }

  static generateCampaignReport(campaign: Campaign) {
    const metrics = this.calculateCampaignMetrics(campaign);
    const { status, daysRemaining, progress } = this.getCampaignStatus(campaign);
    
    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status,
        progress,
        daysRemaining,
      },
      budget: {
        allocated: campaign.budget,
        spent: campaign.spent,
        remaining: campaign.budget - campaign.spent,
        utilizationRate: (campaign.spent / campaign.budget) * 100,
      },
      performance: metrics,
      channels: campaign.channels.map(channel => ({
        name: channel.name,
        type: channel.type,
        spent: channel.spent,
        budget: channel.budget,
        ...channel.metrics,
      })),
      recommendations: this.generateRecommendations(campaign, metrics),
    };
  }

  private static generateRecommendations(campaign: Campaign, metrics: CampaignMetrics): string[] {
    const recommendations: string[] = [];
    
    // Performance recommendations
    if (metrics.ctr < 2) {
      recommendations.push('Consider improving ad copy or targeting - CTR is below average');
    }
    
    if (metrics.cpa > campaign.budget * 0.3) {
      recommendations.push('Cost per acquisition is high - optimize targeting or bidding');
    }
    
    if (metrics.roas < 3) {
      recommendations.push('Return on ad spend is low - review campaign strategy');
    }
    
    // Budget recommendations
    const budgetUtilization = (campaign.spent / campaign.budget) * 100;
    if (budgetUtilization > 80 && metrics.roas > 3) {
      recommendations.push('High ROAS detected - consider increasing budget');
    }
    
    if (budgetUtilization < 20) {
      recommendations.push('Low budget utilization - review bidding strategy');
    }
    
    // Channel recommendations
    const bestChannel = campaign.channels.reduce((best, current) => 
      current.metrics.roas > best.metrics.roas ? current : best
    );
    
    if (bestChannel.metrics.roas > 4) {
      recommendations.push(`${bestChannel.name} is performing well - consider allocating more budget`);
    }
    
    return recommendations;
  }
}

// ==================== Customer Segmentation Utilities ====================

export class CustomerSegmentationManager {
  static createSegment(criteria: AudienceCriteria, name: string, description: string): CustomerSegment {
    const estimatedSize = this.estimateSegmentSize(criteria);
    
    return {
      id: `segment-${Date.now()}`,
      name,
      description,
      criteria,
      size: estimatedSize,
      value: this.estimateCustomerValue(criteria),
      conversionRate: this.estimateConversionRate(criteria),
      createdAt: new Date().toISOString(),
    };
  }

  static estimateSegmentSize(criteria: AudienceCriteria): number {
    // Base size estimation logic
    let baseSize = 10000; // Assume 10k total users
    
    // Apply demographic filters
    if (criteria.demographics.ageRange) {
      const [min, max] = criteria.demographics.ageRange;
      const ageRange = max - min;
      baseSize = Math.floor(baseSize * (ageRange / 60)); // Assuming age range 18-78
    }
    
    if (criteria.demographics.gender && criteria.demographics.gender !== 'all') {
      baseSize = Math.floor(baseSize * 0.5); // Roughly 50% for specific gender
    }
    
    if (criteria.demographics.location && criteria.demographics.location.length > 0) {
      baseSize = Math.floor(baseSize * (criteria.demographics.location.length / 10)); // Assume 10 major locations
    }
    
    // Apply behavioral filters
    if (criteria.behavioral.purchaseHistory) {
      baseSize = Math.floor(baseSize * 0.3); // 30% have purchase history
    }
    
    if (criteria.behavioral.engagementLevel) {
      const multiplier = criteria.behavioral.engagementLevel === 'high' ? 0.2 : 
                        criteria.behavioral.engagementLevel === 'medium' ? 0.5 : 0.3;
      baseSize = Math.floor(baseSize * multiplier);
    }
    
    return Math.max(baseSize, 100); // Minimum segment size
  }

  static estimateCustomerValue(criteria: AudienceCriteria): number {
    let baseValue = 100; // Base customer value
    
    // Increase value based on criteria
    if (criteria.behavioral.purchaseHistory) {
      baseValue *= 2.5;
    }
    
    if (criteria.behavioral.engagementLevel === 'high') {
      baseValue *= 2;
    }
    
    if (criteria.demographics.income && criteria.demographics.income[0] > 50000) {
      baseValue *= 1.8;
    }
    
    return Math.floor(baseValue);
  }

  static estimateConversionRate(criteria: AudienceCriteria): number {
    let baseRate = 2; // 2% base conversion rate
    
    if (criteria.behavioral.purchaseHistory) {
      baseRate *= 3;
    }
    
    if (criteria.behavioral.engagementLevel === 'high') {
      baseRate *= 2;
    }
    
    if (criteria.psychographic.interests && criteria.psychographic.interests.length > 3) {
      baseRate *= 1.5; // Well-defined interests
    }
    
    return Math.min(baseRate, 20); // Cap at 20%
  }

  static compareSegments(segmentA: CustomerSegment, segmentB: CustomerSegment) {
    return {
      sizeComparison: {
        larger: segmentA.size > segmentB.size ? segmentA.name : segmentB.name,
        difference: Math.abs(segmentA.size - segmentB.size),
        percentageDiff: Math.abs((segmentA.size - segmentB.size) / Math.max(segmentA.size, segmentB.size)) * 100,
      },
      valueComparison: {
        higher: segmentA.value > segmentB.value ? segmentA.name : segmentB.name,
        difference: Math.abs(segmentA.value - segmentB.value),
        percentageDiff: Math.abs((segmentA.value - segmentB.value) / Math.max(segmentA.value, segmentB.value)) * 100,
      },
      conversionComparison: {
        higher: segmentA.conversionRate > segmentB.conversionRate ? segmentA.name : segmentB.name,
        difference: Math.abs(segmentA.conversionRate - segmentB.conversionRate),
        percentageDiff: Math.abs((segmentA.conversionRate - segmentB.conversionRate) / Math.max(segmentA.conversionRate, segmentB.conversionRate)) * 100,
      },
    };
  }
}

// ==================== Analytics Utilities ====================

export class MarketingAnalytics {
  static calculateROI(revenue: number, cost: number): number {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  }

  static calculateROAS(revenue: number, cost: number): number {
    if (cost === 0) return 0;
    return revenue / cost;
  }

  static calculateLTV(averageOrderValue: number, purchaseFrequency: number, customerLifespan: number): number {
    return averageOrderValue * purchaseFrequency * customerLifespan;
  }

  static calculateCohortAnalysis(campaigns: Campaign[], timeframe: 'week' | 'month' | 'quarter') {
    // Group campaigns by time periods
    const cohorts = new Map<string, Campaign[]>();
    
    campaigns.forEach(campaign => {
      const date = new Date(campaign.createdAt);
      let period: string;
      
      switch (timeframe) {
        case 'week':
          const weekStart = startOfDay(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = format(weekStart, 'yyyy-ww');
          break;
        case 'month':
          period = format(date, 'yyyy-MM');
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
      }
      
      if (!cohorts.has(period)) {
        cohorts.set(period, []);
      }
      cohorts.get(period)!.push(campaign);
    });
    
    // Calculate metrics for each cohort
    const cohortAnalysis = Array.from(cohorts.entries()).map(([period, cohortCampaigns]) => {
      const totalBudget = cohortCampaigns.reduce((sum, c) => sum + c.budget, 0);
      const totalSpent = cohortCampaigns.reduce((sum, c) => sum + c.spent, 0);
      const avgMetrics = this.calculateAverageMetrics(cohortCampaigns);
      
      return {
        period,
        campaignCount: cohortCampaigns.length,
        totalBudget,
        totalSpent,
        ...avgMetrics,
      };
    });
    
    return cohortAnalysis.sort((a, b) => a.period.localeCompare(b.period));
  }

  private static calculateAverageMetrics(campaigns: Campaign[]) {
    if (campaigns.length === 0) return {};
    
    const totalMetrics = campaigns.reduce((acc, campaign) => {
      const metrics = CampaignManager.calculateCampaignMetrics(campaign);
      return {
        impressions: acc.impressions + metrics.impressions,
        clicks: acc.clicks + metrics.clicks,
        conversions: acc.conversions + metrics.conversions,
        revenue: acc.revenue + metrics.revenue,
        cost: acc.cost + metrics.cost,
      };
    }, { impressions: 0, clicks: 0, conversions: 0, revenue: 0, cost: 0 });
    
    return {
      avgImpressions: Math.floor(totalMetrics.impressions / campaigns.length),
      avgClicks: Math.floor(totalMetrics.clicks / campaigns.length),
      avgConversions: Math.floor(totalMetrics.conversions / campaigns.length),
      avgRevenue: Math.floor(totalMetrics.revenue / campaigns.length),
      avgCost: Math.floor(totalMetrics.cost / campaigns.length),
      avgROAS: totalMetrics.cost > 0 ? totalMetrics.revenue / totalMetrics.cost : 0,
    };
  }

  static generateInsights(campaigns: Campaign[], segments: CustomerSegment[]) {
    const insights: string[] = [];
    
    // Campaign performance insights
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');
    
    if (activeCampaigns.length > 0) {
      const avgROAS = activeCampaigns.reduce((sum, c) => {
        const metrics = CampaignManager.calculateCampaignMetrics(c);
        return sum + metrics.roas;
      }, 0) / activeCampaigns.length;
      
      if (avgROAS > 4) {
        insights.push('Active campaigns are performing exceptionally well with high ROAS');
      } else if (avgROAS < 2) {
        insights.push('Active campaigns may need optimization to improve ROAS');
      }
    }
    
    // Segment insights
    if (segments.length > 0) {
      const bestSegment = segments.reduce((best, current) => 
        current.value > best.value ? current : best
      );
      insights.push(`Segment "${bestSegment.name}" has the highest customer value potential`);
      
      const largestSegment = segments.reduce((largest, current) => 
        current.size > largest.size ? current : largest
      );
      insights.push(`Segment "${largestSegment.name}" represents the largest addressable audience`);
    }
    
    // Budget insights
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    if (budgetUtilization < 50) {
      insights.push('Budget utilization is low - consider reallocating or increasing spend');
    } else if (budgetUtilization > 90) {
      insights.push('Budget utilization is high - monitor spend carefully');
    }
    
    return insights;
  }
}

// ==================== Export Utilities ====================

export const MarketingUtils = {
  CampaignManager,
  CustomerSegmentationManager,
  MarketingAnalytics,
  
  // Helper functions
  formatCurrency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },
  
  formatPercentage: (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  },
  
  formatNumber: (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  },
  
  getCampaignTypeLabel: (type: CampaignType) => {
    const labels: Record<CampaignType, string> = {
      email: 'Email Marketing',
      social: 'Social Media',
      display: 'Display Advertising',
      search: 'Search Marketing',
      influencer: 'Influencer Marketing',
      content: 'Content Marketing',
      event: 'Event Marketing',
      referral: 'Referral Program',
    };
    return labels[type] || type;
  },
  
  getStatusColor: (status: CampaignStatus) => {
    const colors: Record<CampaignStatus, string> = {
      draft: 'gray',
      scheduled: 'blue',
      active: 'green',
      paused: 'yellow',
      completed: 'purple',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  },
};