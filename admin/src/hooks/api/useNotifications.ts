/**
 * Notification API Hooks
 * TanStack Query hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/api';
import { toast } from '@/services/toast';
import type {
  Notification,
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreferences,
  NotificationAnalytics,
  CreateNotificationRequest,
  CreateNotificationTemplateRequest,
  CreateNotificationCampaignRequest,
  QueryParams
} from '@/types/api.types';

// Query Keys
export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  list: (params?: any) => [...NOTIFICATION_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...NOTIFICATION_QUERY_KEYS.all, 'detail', id] as const,
  templates: {
    all: ['notification-templates'] as const,
    list: (params?: any) => [...NOTIFICATION_QUERY_KEYS.templates.all, 'list', params] as const,
    detail: (id: string) => [...NOTIFICATION_QUERY_KEYS.templates.all, 'detail', id] as const,
    preview: (id: string, data: any) => [...NOTIFICATION_QUERY_KEYS.templates.all, 'preview', id, data] as const,
  },
  campaigns: {
    all: ['notification-campaigns'] as const,
    list: (params?: any) => [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list', params] as const,
    detail: (id: string) => [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'detail', id] as const,
    analytics: (id: string) => [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'analytics', id] as const,
  },
  preferences: (userId: string) => [...NOTIFICATION_QUERY_KEYS.all, 'preferences', userId] as const,
  analytics: (params?: any) => [...NOTIFICATION_QUERY_KEYS.all, 'analytics', params] as const,
  realTimeStats: () => [...NOTIFICATION_QUERY_KEYS.all, 'realtime-stats'] as const,
} as const;

// ==================== NOTIFICATION HOOKS ====================

/**
 * Hook to fetch notifications with filtering
 */
export const useNotifications = (params?: QueryParams & {
  type?: 'email' | 'push' | 'sms' | 'in_app';
  category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recipient_id?: string;
}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => NotificationService.getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch single notification
 */
export const useNotification = (notificationId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.detail(notificationId),
    queryFn: () => NotificationService.getNotification(notificationId),
    enabled: !!notificationId,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create notification
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationRequest) => NotificationService.createNotification(data),
    onSuccess: (newNotification) => {
      // Invalidate notification lists
      queryClient.invalidateQueries({ queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] });
      
      // Add to cache if we have a list query
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.detail(newNotification.id),
        newNotification
      );

      toast.success('Notification created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create notification');
    },
  });
};

/**
 * Hook to send notification
 */
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.sendNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Invalidate notification to refresh status
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.detail(notificationId) 
      });
      
      // Invalidate lists to update status
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });

      toast.success('Notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send notification');
    },
  });
};

/**
 * Hook to cancel notification
 */
export const useCancelNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.cancelNotification(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.detail(notificationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });

      toast.success('Notification cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel notification');
    },
  });
};

/**
 * Hook to retry failed notification
 */
export const useRetryNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.retryNotification(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.detail(notificationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });

      toast.success('Notification retry initiated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to retry notification');
    },
  });
};

/**
 * Hook to delete notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => NotificationService.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.detail(notificationId) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });

      toast.success('Notification deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete notification');
    },
  });
};

// ==================== TEMPLATE HOOKS ====================

/**
 * Hook to fetch notification templates
 */
export const useNotificationTemplates = (params?: QueryParams & {
  type?: 'email' | 'push' | 'sms' | 'in_app';
  category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  is_active?: boolean;
  is_default?: boolean;
}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.templates.list(params),
    queryFn: () => NotificationService.getTemplates(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch single template
 */
export const useNotificationTemplate = (templateId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.templates.detail(templateId),
    queryFn: () => NotificationService.getTemplate(templateId),
    enabled: !!templateId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create template
 */
export const useCreateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationTemplateRequest) => NotificationService.createTemplate(data),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.templates.all, 'list'] 
      });
      
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.templates.detail(newTemplate.id),
        newTemplate
      );

      toast.success('Notification template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create template');
    },
  });
};

/**
 * Hook to update template
 */
export const useUpdateNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: Partial<CreateNotificationTemplateRequest> }) => 
      NotificationService.updateTemplate(templateId, data),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.templates.detail(updatedTemplate.id),
        updatedTemplate
      );
      
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.templates.all, 'list'] 
      });

      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update template');
    },
  });
};

/**
 * Hook to delete template
 */
export const useDeleteNotificationTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => NotificationService.deleteTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.removeQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.templates.detail(templateId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.templates.all, 'list'] 
      });

      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete template');
    },
  });
};

/**
 * Hook to preview template
 */
export const usePreviewTemplate = (templateId: string, data: Record<string, any>) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.templates.preview(templateId, data),
    queryFn: () => NotificationService.previewTemplate(templateId, data),
    enabled: !!templateId && Object.keys(data).length > 0,
    staleTime: 0, // Always fresh for previews
  });
};

/**
 * Hook to test template
 */
export const useTestNotificationTemplate = () => {
  return useMutation({
    mutationFn: ({ templateId, testData }: { 
      templateId: string; 
      testData: { recipient_email?: string; recipient_phone?: string; data?: Record<string, any> }
    }) => NotificationService.testTemplate(templateId, testData),
    onSuccess: () => {
      toast.success('Test notification sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send test notification');
    },
  });
};

// ==================== CAMPAIGN HOOKS ====================

/**
 * Hook to fetch notification campaigns
 */
export const useNotificationCampaigns = (params?: QueryParams & {
  type?: 'email' | 'push' | 'sms' | 'mixed';
  status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  template_id?: string;
}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.campaigns.list(params),
    queryFn: () => NotificationService.getCampaigns(params),
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch single campaign
 */
export const useNotificationCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId),
    queryFn: () => NotificationService.getCampaign(campaignId),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to create campaign
 */
export const useCreateNotificationCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationCampaignRequest) => NotificationService.createCampaign(data),
    onSuccess: (newCampaign) => {
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });
      
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.campaigns.detail(newCampaign.id),
        newCampaign
      );

      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create campaign');
    },
  });
};

/**
 * Hook to update campaign
 */
export const useUpdateNotificationCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: Partial<CreateNotificationCampaignRequest> }) => 
      NotificationService.updateCampaign(campaignId, data),
    onSuccess: (updatedCampaign) => {
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.campaigns.detail(updatedCampaign.id),
        updatedCampaign
      );
      
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update campaign');
    },
  });
};

/**
 * Hook to start campaign
 */
export const useStartCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => NotificationService.startCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign started successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to start campaign');
    },
  });
};

/**
 * Hook to pause campaign
 */
export const usePauseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => NotificationService.pauseCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to pause campaign');
    },
  });
};

/**
 * Hook to resume campaign
 */
export const useResumeCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => NotificationService.resumeCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign resumed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resume campaign');
    },
  });
};

/**
 * Hook to cancel campaign
 */
export const useCancelCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => NotificationService.cancelCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel campaign');
    },
  });
};

/**
 * Hook to delete campaign
 */
export const useDeleteNotificationCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId: string) => NotificationService.deleteCampaign(campaignId),
    onSuccess: (_, campaignId) => {
      queryClient.removeQueries({ 
        queryKey: NOTIFICATION_QUERY_KEYS.campaigns.detail(campaignId) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.campaigns.all, 'list'] 
      });

      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete campaign');
    },
  });
};

/**
 * Hook to get campaign analytics
 */
export const useCampaignAnalytics = (campaignId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.campaigns.analytics(campaignId),
    queryFn: () => NotificationService.getCampaignAnalytics(campaignId),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for live data
  });
};

// ==================== ANALYTICS & PREFERENCES HOOKS ====================

/**
 * Hook to get notification analytics
 */
export const useNotificationAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  type?: 'email' | 'push' | 'sms' | 'in_app';
  category?: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
}) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.analytics(params),
    queryFn: () => NotificationService.getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get real-time notification stats
 */
export const useNotificationRealTimeStats = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.realTimeStats(),
    queryFn: () => NotificationService.getRealTimeStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};

/**
 * Hook to get user notification preferences
 */
export const useNotificationPreferences = (userId: string) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(userId),
    queryFn: () => NotificationService.getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update user notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, preferences }: { 
      userId: string; 
      preferences: Partial<Omit<NotificationPreferences, 'user_id' | 'created_at' | 'updated_at'>>
    }) => NotificationService.updateUserPreferences(userId, preferences),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.preferences(updatedPreferences.user_id),
        updatedPreferences
      );

      toast.success('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update preferences');
    },
  });
};

// ==================== BULK OPERATION HOOKS ====================

/**
 * Hook for bulk notification operations
 */
export const useBulkNotificationOperations = () => {
  const queryClient = useQueryClient();

  const sendBulk = useMutation({
    mutationFn: (notifications: CreateNotificationRequest[]) => 
      NotificationService.sendBulkNotifications(notifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });
      toast.success('Bulk notifications sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send bulk notifications');
    },
  });

  const cancelBulk = useMutation({
    mutationFn: (notificationIds: string[]) => 
      NotificationService.cancelBulkNotifications(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });
      toast.success('Bulk notifications cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel bulk notifications');
    },
  });

  const retryBulk = useMutation({
    mutationFn: (notificationIds: string[]) => 
      NotificationService.retryBulkNotifications(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...NOTIFICATION_QUERY_KEYS.all, 'list'] 
      });
      toast.success('Bulk notifications retry initiated');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to retry bulk notifications');
    },
  });

  return {
    sendBulk,
    cancelBulk,
    retryBulk,
  };
};