/**
 * Marketing Management Hooks
 * TanStack Query hooks for marketing campaigns, analytics, and customer segmentation
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/services/toast';
import marketingService, { 
  MarketingFilters, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CreateSegmentRequest
} from '@/services/api/marketing';
import { QueryParams } from '@/types';

// Query Keys
export const MARKETING_QUERY_KEYS = {
  all: ['marketing'] as const,
  campaigns: () => [...MARKETING_QUERY_KEYS.all, 'campaigns'] as const,
  campaignsList: (filters: MarketingFilters & QueryParams) => [...MARKETING_QUERY_KEYS.campaigns(), filters] as const,
  campaign: (id: string) => [...MARKETING_QUERY_KEYS.campaigns(), id] as const,
  campaignAnalytics: (id: string) => [...MARKETING_QUERY_KEYS.campaign(id), 'analytics'] as const,
  promotions: () => [...MARKETING_QUERY_KEYS.all, 'promotions'] as const,
  coupons: () => [...MARKETING_QUERY_KEYS.all, 'coupons'] as const,
  analytics: () => [...MARKETING_QUERY_KEYS.all, 'analytics'] as const,
  segments: () => [...MARKETING_QUERY_KEYS.all, 'segments'] as const,
  segmentCustomers: (id: string) => [...MARKETING_QUERY_KEYS.segments(), id, 'customers'] as const,
  referrals: () => [...MARKETING_QUERY_KEYS.all, 'referrals'] as const,
  templates: () => [...MARKETING_QUERY_KEYS.all, 'templates'] as const,
};

// Campaign Hooks
export const useMarketingCampaigns = (params: MarketingFilters & QueryParams = {}) => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.campaignsList(params),
    queryFn: () => marketingService.getCampaigns(params),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMarketingCampaign = (id: string) => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.campaign(id),
    queryFn: () => marketingService.getCampaign(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => marketingService.createCampaign(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.analytics() });
      toast.success('Marketing campaign created successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create campaign');
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignRequest }) => 
      marketingService.updateCampaign(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaign(variables.id) });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.analytics() });
      toast.success('Campaign updated successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update campaign');
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingService.deleteCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.removeQueries({ queryKey: MARKETING_QUERY_KEYS.campaign(id) });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.analytics() });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete campaign');
    },
  });
};

export const usePauseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingService.pauseCampaign(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaign(id) });
      toast.success('Campaign paused');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to pause campaign');
    },
  });
};

export const useResumeCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingService.resumeCampaign(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaign(id) });
      toast.success('Campaign resumed');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resume campaign');
    },
  });
};

export const useDuplicateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => 
      marketingService.duplicateCampaign(id, newName),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      toast.success('Campaign duplicated successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to duplicate campaign');
    },
  });
};

// Analytics Hooks
export const useMarketingAnalytics = (params: {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  date_from?: string;
  date_to?: string;
} = {}) => {
  return useQuery({
    queryKey: [...MARKETING_QUERY_KEYS.analytics(), params],
    queryFn: () => marketingService.getMarketingAnalytics(params),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.campaignAnalytics(campaignId),
    queryFn: () => marketingService.getCampaignAnalytics(campaignId),
    select: (data) => data.data,
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Promotion Hooks
export const usePromotions = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: [...MARKETING_QUERY_KEYS.promotions(), params],
    queryFn: () => marketingService.getPromotions(params),
    select: (data) => data.data,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => marketingService.createPromotion(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.promotions() });
      toast.success('Promotion created successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create promotion');
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      marketingService.updatePromotion(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.promotions() });
      toast.success('Promotion updated successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update promotion');
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.promotions() });
      toast.success('Promotion deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete promotion');
    },
  });
};

// Coupon Hooks
export const useCoupons = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: [...MARKETING_QUERY_KEYS.coupons(), params],
    queryFn: () => marketingService.getCoupons(params),
    select: (data) => data.data,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => marketingService.createCoupon(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.coupons() });
      toast.success('Coupon created successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create coupon');
    },
  });
};

export const useGenerateCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      count: number;
      prefix?: string;
      length?: number;
      discount_type: 'percentage' | 'fixed';
      discount_value: number;
      expires_at?: string;
    }) => marketingService.generateCouponCodes(params),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.coupons() });
      toast.success(`${response.data?.length || 0} coupons generated successfully`);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate coupons');
    },
  });
};

// Customer Segmentation Hooks
export const useCustomerSegments = () => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.segments(),
    queryFn: () => marketingService.getCustomerSegments(),
    select: (data) => data.data,
  });
};

export const useCreateCustomerSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSegmentRequest) => marketingService.createCustomerSegment(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.segments() });
      toast.success('Customer segment created successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create customer segment');
    },
  });
};

export const useUpdateCustomerSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSegmentRequest> }) =>
      marketingService.updateCustomerSegment(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.segments() });
      toast.success('Customer segment updated successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update customer segment');
    },
  });
};

export const useDeleteCustomerSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingService.deleteCustomerSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.segments() });
      toast.success('Customer segment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete customer segment');
    },
  });
};

export const useSegmentCustomers = (segmentId: string, params: QueryParams = {}) => {
  return useQuery({
    queryKey: [...MARKETING_QUERY_KEYS.segmentCustomers(segmentId), params],
    queryFn: () => marketingService.getSegmentCustomers(segmentId, params),
    select: (data) => data.data,
    enabled: !!segmentId,
  });
};

// Template and Utility Hooks
export const useCampaignTemplates = () => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.templates(),
    queryFn: () => marketingService.getCampaignTemplates(),
    select: (data) => data.data,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useReferralStats = () => {
  return useQuery({
    queryKey: MARKETING_QUERY_KEYS.referrals(),
    queryFn: () => marketingService.getReferralStats(),
    select: (data) => data.data,
  });
};

export const useSendTestEmail = () => {
  return useMutation({
    mutationFn: ({ campaignId, emails }: { campaignId: string; emails: string[] }) =>
      marketingService.sendTestEmail(campaignId, emails),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send test email');
    },
  });
};

export const useScheduleCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, scheduledDate }: { campaignId: string; scheduledDate: string }) =>
      marketingService.scheduleCampaign(campaignId, scheduledDate),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaign(variables.campaignId) });
      toast.success('Campaign scheduled successfully');
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to schedule campaign');
    },
  });
};

export const useBulkUpdateCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignIds, action }: { campaignIds: string[]; action: 'pause' | 'resume' | 'archive' }) =>
      marketingService.bulkUpdateCampaigns(campaignIds, action),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: MARKETING_QUERY_KEYS.campaigns() });
      const successCount = response.data?.success?.length || 0;
      const failedCount = response.data?.failed?.length || 0;
      if (failedCount > 0) {
        toast.error(`${successCount} campaigns updated, ${failedCount} failed`);
      } else {
        toast.success(`${successCount} campaigns updated successfully`);
      }
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update campaigns');
    },
  });
};