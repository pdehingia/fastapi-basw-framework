import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/services/toast';
import {
  ApiKeyService,
  WebhookService,
  IntegrationService,
  ApiDocumentationService,
  ApiAnalyticsService,
  RateLimitService,
} from '@/services/api/integrations';
import type {
  ApiKey,
  WebhookEndpoint,
  WebhookDelivery,
  ThirdPartyIntegration,
  ApiEndpoint,
  ApiRequest,
  ApiAnalytics,
  IntegrationTemplate,
  RateLimitRule,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  CreateWebhookEndpointRequest,
  UpdateWebhookEndpointRequest,
  CreateThirdPartyIntegrationRequest,
  UpdateThirdPartyIntegrationRequest,
  TestIntegrationRequest,
  CreateRateLimitRuleRequest,
  BulkApiKeyOperation,
} from '@/types/api.types';

// ==================== API KEY HOOKS ====================

export const useApiKeys = (params?: Parameters<typeof ApiKeyService.getApiKeys>[0]) => {
  return useQuery({
    queryKey: ['api-keys', params],
    queryFn: () => ApiKeyService.getApiKeys(params),
    staleTime: 30000,
  });
};

export const useApiKey = (id: string) => {
  return useQuery({
    queryKey: ['api-keys', id],
    queryFn: () => ApiKeyService.getApiKey(id),
    enabled: !!id,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => ApiKeyService.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.invalidateQueries({ queryKey: ['api-key-stats'] });
      toast.success('API key created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create API key');
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateApiKeyRequest) => ApiKeyService.updateApiKey(data),
    onSuccess: (updatedKey) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.setQueryData(['api-keys', updatedKey.id], updatedKey);
      toast.success('API key updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update API key');
    },
  });
};

export const useRotateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiKeyService.rotateApiKey(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.setQueryData(['api-keys', result.api_key.id], result.api_key);
      toast.success('API key rotated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to rotate API key');
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiKeyService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to revoke API key');
    },
  });
};

export const useSuspendApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiKeyService.suspendApiKey(id),
    onSuccess: (updatedKey) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.setQueryData(['api-keys', updatedKey.id], updatedKey);
      toast.success('API key suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to suspend API key');
    },
  });
};

export const useActivateApiKey = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ApiKeyService.activateApiKey(id),
    onSuccess: (updatedKey) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      queryClient.setQueryData(['api-keys', updatedKey.id], updatedKey);
      toast.success('API key activated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to activate API key');
    },
  });
};

export const useBulkApiKeyOperation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operation: BulkApiKeyOperation) => ApiKeyService.bulkApiKeyOperation(operation),
    onSuccess: (_, operation) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success(`${operation.api_key_ids.length} API keys ${operation.action}d successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to perform bulk operation');
    },
  });
};

export const useApiKeyUsage = (id: string, params?: Parameters<typeof ApiKeyService.getApiKeyUsage>[1]) => {
  return useQuery({
    queryKey: ['api-key-usage', id, params],
    queryFn: () => ApiKeyService.getApiKeyUsage(id, params),
    enabled: !!id,
    staleTime: 60000,
  });
};

export const useApiKeyStats = () => {
  return useQuery({
    queryKey: ['api-key-stats'],
    queryFn: () => ApiKeyService.getApiKeyStats(),
    staleTime: 60000,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

// ==================== WEBHOOK HOOKS ====================

export const useWebhookEndpoints = (params?: Parameters<typeof WebhookService.getWebhookEndpoints>[0]) => {
  return useQuery({
    queryKey: ['webhook-endpoints', params],
    queryFn: () => WebhookService.getWebhookEndpoints(params),
    staleTime: 30000,
  });
};

export const useWebhookEndpoint = (id: string) => {
  return useQuery({
    queryKey: ['webhook-endpoints', id],
    queryFn: () => WebhookService.getWebhookEndpoint(id),
    enabled: !!id,
  });
};

export const useCreateWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWebhookEndpointRequest) => WebhookService.createWebhookEndpoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      toast.success('Webhook endpoint created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create webhook endpoint');
    },
  });
};

export const useUpdateWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateWebhookEndpointRequest) => WebhookService.updateWebhookEndpoint(data),
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      queryClient.setQueryData(['webhook-endpoints', updatedEndpoint.id], updatedEndpoint);
      toast.success('Webhook endpoint updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update webhook endpoint');
    },
  });
};

export const useDeleteWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WebhookService.deleteWebhookEndpoint(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      queryClient.removeQueries({ queryKey: ['webhook-endpoints', id] });
      toast.success('Webhook endpoint deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete webhook endpoint');
    },
  });
};

export const usePauseWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WebhookService.pauseWebhookEndpoint(id),
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      queryClient.setQueryData(['webhook-endpoints', updatedEndpoint.id], updatedEndpoint);
      toast.success('Webhook endpoint paused successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to pause webhook endpoint');
    },
  });
};

export const useResumeWebhookEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WebhookService.resumeWebhookEndpoint(id),
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      queryClient.setQueryData(['webhook-endpoints', updatedEndpoint.id], updatedEndpoint);
      toast.success('Webhook endpoint resumed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resume webhook endpoint');
    },
  });
};

export const useTestWebhookEndpoint = () => {
  return useMutation({
    mutationFn: ({ id, eventType }: { id: string; eventType?: string }) => 
      WebhookService.testWebhookEndpoint(id, eventType),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Webhook test successful');
      } else {
        toast.error(`Webhook test failed: ${result.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test webhook endpoint');
    },
  });
};

export const useRegenerateWebhookSecret = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WebhookService.regenerateWebhookSecret(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-endpoints'] });
      queryClient.setQueryData(['webhook-endpoints', result.webhook.id], result.webhook);
      toast.success('Webhook secret regenerated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to regenerate webhook secret');
    },
  });
};

export const useWebhookDeliveries = (params?: Parameters<typeof WebhookService.getWebhookDeliveries>[0]) => {
  return useQuery({
    queryKey: ['webhook-deliveries', params],
    queryFn: () => WebhookService.getWebhookDeliveries(params),
    staleTime: 30000,
    refetchInterval: 60000, // Refresh every minute for real-time updates
  });
};

export const useWebhookDelivery = (id: string) => {
  return useQuery({
    queryKey: ['webhook-deliveries', id],
    queryFn: () => WebhookService.getWebhookDelivery(id),
    enabled: !!id,
  });
};

export const useRetryWebhookDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => WebhookService.retryWebhookDelivery(id),
    onSuccess: (updatedDelivery) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
      queryClient.setQueryData(['webhook-deliveries', updatedDelivery.id], updatedDelivery);
      toast.success('Webhook delivery retried successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to retry webhook delivery');
    },
  });
};

export const useWebhookEvents = () => {
  return useQuery({
    queryKey: ['webhook-events'],
    queryFn: () => WebhookService.getWebhookEvents(),
    staleTime: 600000, // 10 minutes - events don't change often
  });
};

export const useWebhookEventSchema = (eventType: string) => {
  return useQuery({
    queryKey: ['webhook-event-schema', eventType],
    queryFn: () => WebhookService.getWebhookEventSchema(eventType),
    enabled: !!eventType,
    staleTime: 600000,
  });
};

// ==================== INTEGRATION HOOKS ====================

export const useIntegrations = (params?: Parameters<typeof IntegrationService.getIntegrations>[0]) => {
  return useQuery({
    queryKey: ['integrations', params],
    queryFn: () => IntegrationService.getIntegrations(params),
    staleTime: 30000,
  });
};

export const useIntegration = (id: string) => {
  return useQuery({
    queryKey: ['integrations', id],
    queryFn: () => IntegrationService.getIntegration(id),
    enabled: !!id,
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateThirdPartyIntegrationRequest) => IntegrationService.createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create integration');
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateThirdPartyIntegrationRequest) => IntegrationService.updateIntegration(data),
    onSuccess: (updatedIntegration) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.setQueryData(['integrations', updatedIntegration.id], updatedIntegration);
      toast.success('Integration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update integration');
    },
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => IntegrationService.deleteIntegration(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.removeQueries({ queryKey: ['integrations', id] });
      toast.success('Integration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete integration');
    },
  });
};

export const useTestIntegration = () => {
  return useMutation({
    mutationFn: (data: TestIntegrationRequest) => IntegrationService.testIntegration(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Integration test successful (${result.response_time}ms)`);
      } else {
        toast.error(`Integration test failed: ${result.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test integration');
    },
  });
};

export const useHealthCheckIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => IntegrationService.healthCheckIntegration(id),
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', id] });
      if (result.status === 'healthy') {
        toast.success(`Integration is healthy (${result.response_time}ms)`);
      } else {
        toast.error(`Integration is unhealthy: ${result.error}`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to check integration health');
    },
  });
};

export const useIntegrationTemplates = (params?: Parameters<typeof IntegrationService.getIntegrationTemplates>[0]) => {
  return useQuery({
    queryKey: ['integration-templates', params],
    queryFn: () => IntegrationService.getIntegrationTemplates(params),
    staleTime: 300000, // 5 minutes - templates don't change often
  });
};

export const useIntegrationTemplate = (id: string) => {
  return useQuery({
    queryKey: ['integration-templates', id],
    queryFn: () => IntegrationService.getIntegrationTemplate(id),
    enabled: !!id,
    staleTime: 300000,
  });
};

export const useInstallIntegrationFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, config }: { templateId: string; config: Record<string, any> }) =>
      IntegrationService.installIntegrationFromTemplate(templateId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration installed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to install integration');
    },
  });
};

// ==================== API DOCUMENTATION HOOKS ====================

export const useApiEndpoints = (params?: Parameters<typeof ApiDocumentationService.getApiEndpoints>[0]) => {
  return useQuery({
    queryKey: ['api-endpoints', params],
    queryFn: () => ApiDocumentationService.getApiEndpoints(params),
    staleTime: 300000,
  });
};

export const useApiEndpoint = (id: string) => {
  return useQuery({
    queryKey: ['api-endpoints', id],
    queryFn: () => ApiDocumentationService.getApiEndpoint(id),
    enabled: !!id,
    staleTime: 300000,
  });
};

export const useUpdateApiEndpoint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiEndpoint> }) =>
      ApiDocumentationService.updateApiEndpoint(id, data),
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ['api-endpoints'] });
      queryClient.setQueryData(['api-endpoints', updatedEndpoint.id], updatedEndpoint);
      toast.success('API endpoint updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update API endpoint');
    },
  });
};

export const useApiDocumentation = () => {
  return useQuery({
    queryKey: ['api-documentation'],
    queryFn: () => ApiDocumentationService.getApiDocumentation(),
    staleTime: 300000,
  });
};

export const useUpdateApiDocumentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Parameters<typeof ApiDocumentationService.updateApiDocumentation>[0]) =>
      ApiDocumentationService.updateApiDocumentation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-documentation'] });
      toast.success('API documentation updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update API documentation');
    },
  });
};

export const usePublishApiDocumentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => ApiDocumentationService.publishApiDocumentation(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['api-documentation'] });
      toast.success(`Documentation published successfully: ${result.published_url}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to publish API documentation');
    },
  });
};

export const useGenerateApiDocumentation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => ApiDocumentationService.generateApiDocumentation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-documentation'] });
      toast.success('API documentation generated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate API documentation');
    },
  });
};

export const useGenerateSdk = () => {
  return useMutation({
    mutationFn: ({ language, version }: { language: string; version?: string }) =>
      ApiDocumentationService.generateSdk(language, version),
    onSuccess: (result) => {
      toast.success(`SDK generated successfully: ${result.download_url}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to generate SDK');
    },
  });
};

// ==================== API ANALYTICS HOOKS ====================

export const useApiRequests = (params?: Parameters<typeof ApiAnalyticsService.getApiRequests>[0]) => {
  return useQuery({
    queryKey: ['api-requests', params],
    queryFn: () => ApiAnalyticsService.getApiRequests(params),
    staleTime: 30000,
  });
};

export const useApiRequest = (id: string) => {
  return useQuery({
    queryKey: ['api-requests', id],
    queryFn: () => ApiAnalyticsService.getApiRequest(id),
    enabled: !!id,
  });
};

export const useApiAnalytics = (params: Parameters<typeof ApiAnalyticsService.getApiAnalytics>[0]) => {
  return useQuery({
    queryKey: ['api-analytics', params],
    queryFn: () => ApiAnalyticsService.getApiAnalytics(params),
    staleTime: 300000, // 5 minutes
  });
};

export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ['api-real-time-metrics'],
    queryFn: () => ApiAnalyticsService.getRealTimeMetrics(),
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 0,
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['api-system-health'],
    queryFn: () => ApiAnalyticsService.getSystemHealth(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
  });
};

export const usePerformanceMetrics = (params: Parameters<typeof ApiAnalyticsService.getPerformanceMetrics>[0]) => {
  return useQuery({
    queryKey: ['api-performance-metrics', params],
    queryFn: () => ApiAnalyticsService.getPerformanceMetrics(params),
    staleTime: 300000,
  });
};

export const useErrorAnalytics = (params: Parameters<typeof ApiAnalyticsService.getErrorAnalytics>[0]) => {
  return useQuery({
    queryKey: ['api-error-analytics', params],
    queryFn: () => ApiAnalyticsService.getErrorAnalytics(params),
    staleTime: 300000,
  });
};

// ==================== RATE LIMITING HOOKS ====================

export const useRateLimitRules = (params?: Parameters<typeof RateLimitService.getRateLimitRules>[0]) => {
  return useQuery({
    queryKey: ['rate-limit-rules', params],
    queryFn: () => RateLimitService.getRateLimitRules(params),
    staleTime: 30000,
  });
};

export const useRateLimitRule = (id: string) => {
  return useQuery({
    queryKey: ['rate-limit-rules', id],
    queryFn: () => RateLimitService.getRateLimitRule(id),
    enabled: !!id,
  });
};

export const useCreateRateLimitRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRateLimitRuleRequest) => RateLimitService.createRateLimitRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-rules'] });
      toast.success('Rate limit rule created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create rate limit rule');
    },
  });
};

export const useUpdateRateLimitRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRateLimitRuleRequest> }) =>
      RateLimitService.updateRateLimitRule(id, data),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-rules'] });
      queryClient.setQueryData(['rate-limit-rules', updatedRule.id], updatedRule);
      toast.success('Rate limit rule updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update rate limit rule');
    },
  });
};

export const useDeleteRateLimitRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => RateLimitService.deleteRateLimitRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-rules'] });
      queryClient.removeQueries({ queryKey: ['rate-limit-rules', id] });
      toast.success('Rate limit rule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete rate limit rule');
    },
  });
};

export const useToggleRateLimitRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      RateLimitService.toggleRateLimitRule(id, active),
    onSuccess: (updatedRule) => {
      queryClient.invalidateQueries({ queryKey: ['rate-limit-rules'] });
      queryClient.setQueryData(['rate-limit-rules', updatedRule.id], updatedRule);
      toast.success(`Rate limit rule ${updatedRule.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to toggle rate limit rule');
    },
  });
};

export const useRateLimitStats = () => {
  return useQuery({
    queryKey: ['rate-limit-stats'],
    queryFn: () => RateLimitService.getRateLimitStats(),
    staleTime: 60000,
    refetchInterval: 300000,
  });
};

export const useTestRateLimitRule = () => {
  return useMutation({
    mutationFn: ({ ruleId, testRequest }: { 
      ruleId: string; 
      testRequest: Parameters<typeof RateLimitService.testRateLimitRule>[1] 
    }) => RateLimitService.testRateLimitRule(ruleId, testRequest),
    onSuccess: (result) => {
      if (result.blocked) {
        toast.error(`Request would be blocked (delay: ${result.delay}s)`);
      } else {
        toast.success(`Request would be allowed (${result.remaining_requests} requests remaining)`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to test rate limit rule');
    },
  });
};