import { apiClient } from './client';
import type {
  ApiKey,
  WebhookEndpoint,
  WebhookDelivery,
  ThirdPartyIntegration,
  ApiEndpoint,
  ApiRequest,
  ApiAnalytics,
  ApiDocumentation,
  IntegrationTemplate,
  RateLimitRule,
  ApiKeysResponse,
  WebhookEndpointsResponse,
  WebhookDeliveriesResponse,
  ThirdPartyIntegrationsResponse,
  ApiEndpointsResponse,
  ApiRequestsResponse,
  WebhookEventsResponse,
  IntegrationTemplatesResponse,
  RateLimitRulesResponse,
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

// ==================== API KEY MANAGEMENT ====================

export const ApiKeyService = {
  // API Key CRUD operations
  getApiKeys: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ApiKey['status'];
    sort_by?: 'created_at' | 'name' | 'last_used_at' | 'expires_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiKeysResponse> => {
    const response = await apiClient.get('/admin/api/keys', { params });
    return response.data;
  },

  getApiKey: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.get(`/admin/api/keys/${id}`);
    return response.data;
  },

  createApiKey: async (data: CreateApiKeyRequest): Promise<{ api_key: ApiKey; secret: string }> => {
    const response = await apiClient.post('/admin/api/keys', data);
    return response.data;
  },

  updateApiKey: async (data: UpdateApiKeyRequest): Promise<ApiKey> => {
    const response = await apiClient.put(`/admin/api/keys/${data.id}`, data);
    return response.data;
  },

  rotateApiKey: async (id: string): Promise<{ api_key: ApiKey; secret: string }> => {
    const response = await apiClient.post(`/admin/api/keys/${id}/rotate`);
    return response.data;
  },

  revokeApiKey: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/admin/api/keys/${id}/revoke`);
    return response.data;
  },

  suspendApiKey: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.post(`/admin/api/keys/${id}/suspend`);
    return response.data;
  },

  activateApiKey: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.post(`/admin/api/keys/${id}/activate`);
    return response.data;
  },

  bulkApiKeyOperation: async (operation: BulkApiKeyOperation): Promise<any> => {
    const response = await apiClient.post('/admin/api/keys/bulk', operation);
    return response.data;
  },

  // API Key analytics
  getApiKeyUsage: async (id: string, params?: {
    start_date: string;
    end_date: string;
  }): Promise<{
    requests_over_time: Array<{ timestamp: string; count: number }>;
    top_endpoints: Array<{ path: string; count: number }>;
    error_breakdown: Array<{ status: number; count: number }>;
    geographic_data: Array<{ country: string; count: number }>;
  }> => {
    const response = await apiClient.get(`/admin/api/keys/${id}/usage`, { params });
    return response.data;
  },

  getApiKeyStats: async (): Promise<{
    total_keys: number;
    active_keys: number;
    suspended_keys: number;
    revoked_keys: number;
    total_requests_today: number;
    rate_limit_hits_today: number;
  }> => {
    const response = await apiClient.get('/admin/api/keys/stats');
    return response.data;
  },
};

// ==================== WEBHOOK MANAGEMENT ====================

export const WebhookService = {
  // Webhook endpoint CRUD operations
  getWebhookEndpoints: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: WebhookEndpoint['status'];
    event_type?: string;
  }): Promise<WebhookEndpointsResponse> => {
    const response = await apiClient.get('/admin/webhooks', { params });
    return response.data;
  },

  getWebhookEndpoint: async (id: string): Promise<WebhookEndpoint> => {
    const response = await apiClient.get(`/admin/webhooks/${id}`);
    return response.data;
  },

  createWebhookEndpoint: async (data: CreateWebhookEndpointRequest): Promise<WebhookEndpoint> => {
    const response = await apiClient.post('/admin/webhooks', data);
    return response.data;
  },

  updateWebhookEndpoint: async (data: UpdateWebhookEndpointRequest): Promise<WebhookEndpoint> => {
    const response = await apiClient.put(`/admin/webhooks/${data.id}`, data);
    return response.data;
  },

  deleteWebhookEndpoint: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/webhooks/${id}`);
    return response.data;
  },

  pauseWebhookEndpoint: async (id: string): Promise<WebhookEndpoint> => {
    const response = await apiClient.post(`/admin/webhooks/${id}/pause`);
    return response.data;
  },

  resumeWebhookEndpoint: async (id: string): Promise<WebhookEndpoint> => {
    const response = await apiClient.post(`/admin/webhooks/${id}/resume`);
    return response.data;
  },

  testWebhookEndpoint: async (id: string, eventType?: string): Promise<{ delivery_id: string; success: boolean; error?: string }> => {
    const response = await apiClient.post(`/admin/webhooks/${id}/test`, { event_type: eventType });
    return response.data;
  },

  regenerateWebhookSecret: async (id: string): Promise<{ webhook: WebhookEndpoint; secret: string }> => {
    const response = await apiClient.post(`/admin/webhooks/${id}/regenerate-secret`);
    return response.data;
  },

  // Webhook deliveries
  getWebhookDeliveries: async (params?: {
    page?: number;
    limit?: number;
    webhook_id?: string;
    status?: WebhookDelivery['status'];
    event_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<WebhookDeliveriesResponse> => {
    const response = await apiClient.get('/admin/webhook-deliveries', { params });
    return response.data;
  },

  getWebhookDelivery: async (id: string): Promise<WebhookDelivery> => {
    const response = await apiClient.get(`/admin/webhook-deliveries/${id}`);
    return response.data;
  },

  retryWebhookDelivery: async (id: string): Promise<WebhookDelivery> => {
    const response = await apiClient.post(`/admin/webhook-deliveries/${id}/retry`);
    return response.data;
  },

  // Webhook events
  getWebhookEvents: async (): Promise<WebhookEventsResponse> => {
    const response = await apiClient.get('/admin/webhook-events');
    return response.data;
  },

  getWebhookEventSchema: async (eventType: string): Promise<{ schema: Record<string, any>; example: Record<string, any> }> => {
    const response = await apiClient.get(`/admin/webhook-events/${eventType}/schema`);
    return response.data;
  },
};

// ==================== THIRD-PARTY INTEGRATIONS ====================

export const IntegrationService = {
  // Integration CRUD operations
  getIntegrations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: ThirdPartyIntegration['type'];
    status?: ThirdPartyIntegration['status'];
    provider?: string;
  }): Promise<ThirdPartyIntegrationsResponse> => {
    const response = await apiClient.get('/admin/integrations', { params });
    return response.data;
  },

  getIntegration: async (id: string): Promise<ThirdPartyIntegration> => {
    const response = await apiClient.get(`/admin/integrations/${id}`);
    return response.data;
  },

  createIntegration: async (data: CreateThirdPartyIntegrationRequest): Promise<ThirdPartyIntegration> => {
    const response = await apiClient.post('/admin/integrations', data);
    return response.data;
  },

  updateIntegration: async (data: UpdateThirdPartyIntegrationRequest): Promise<ThirdPartyIntegration> => {
    const response = await apiClient.put(`/admin/integrations/${data.id}`, data);
    return response.data;
  },

  deleteIntegration: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/integrations/${id}`);
    return response.data;
  },

  testIntegration: async (data: TestIntegrationRequest): Promise<{
    success: boolean;
    response_time: number;
    response_status?: number;
    response_body?: any;
    error?: string;
  }> => {
    const response = await apiClient.post('/admin/integrations/test', data);
    return response.data;
  },

  healthCheckIntegration: async (id: string): Promise<{
    status: 'healthy' | 'unhealthy';
    response_time: number;
    error?: string;
    last_check: string;
  }> => {
    const response = await apiClient.post(`/admin/integrations/${id}/health-check`);
    return response.data;
  },

  // Integration templates
  getIntegrationTemplates: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    provider?: string;
    popular?: boolean;
  }): Promise<IntegrationTemplatesResponse> => {
    const response = await apiClient.get('/admin/integration-templates', { params });
    return response.data;
  },

  getIntegrationTemplate: async (id: string): Promise<IntegrationTemplate> => {
    const response = await apiClient.get(`/admin/integration-templates/${id}`);
    return response.data;
  },

  installIntegrationFromTemplate: async (templateId: string, config: Record<string, any>): Promise<ThirdPartyIntegration> => {
    const response = await apiClient.post(`/admin/integration-templates/${templateId}/install`, { config });
    return response.data;
  },
};

// ==================== API DOCUMENTATION ====================

export const ApiDocumentationService = {
  // API endpoints
  getApiEndpoints: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    method?: string;
    public?: boolean;
    deprecated?: boolean;
  }): Promise<ApiEndpointsResponse> => {
    const response = await apiClient.get('/admin/api/endpoints', { params });
    return response.data;
  },

  getApiEndpoint: async (id: string): Promise<ApiEndpoint> => {
    const response = await apiClient.get(`/admin/api/endpoints/${id}`);
    return response.data;
  },

  updateApiEndpoint: async (id: string, data: Partial<ApiEndpoint>): Promise<ApiEndpoint> => {
    const response = await apiClient.put(`/admin/api/endpoints/${id}`, data);
    return response.data;
  },

  // API documentation
  getApiDocumentation: async (): Promise<ApiDocumentation> => {
    const response = await apiClient.get('/admin/api/documentation');
    return response.data;
  },

  updateApiDocumentation: async (data: Partial<ApiDocumentation>): Promise<ApiDocumentation> => {
    const response = await apiClient.put('/admin/api/documentation', data);
    return response.data;
  },

  publishApiDocumentation: async (): Promise<{ published_url: string }> => {
    const response = await apiClient.post('/admin/api/documentation/publish');
    return response.data;
  },

  generateApiDocumentation: async (): Promise<any> => {
    const response = await apiClient.post('/admin/api/documentation/generate');
    return response.data;
  },

  // SDK generation
  generateSdk: async (language: string, version?: string): Promise<{ download_url: string }> => {
    const response = await apiClient.post('/admin/api/sdk/generate', { language, version });
    return response.data;
  },

  getSdkDownloadUrl: async (language: string, version?: string): Promise<{ download_url: string }> => {
    const response = await apiClient.get('/admin/api/sdk/download', { 
      params: { language, version } 
    });
    return response.data;
  },
};

// ==================== API ANALYTICS & MONITORING ====================

export const ApiAnalyticsService = {
  // API request logs
  getApiRequests: async (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    endpoint_id?: string;
    api_key_id?: string;
    status_code?: number;
    method?: string;
    ip_address?: string;
  }): Promise<ApiRequestsResponse> => {
    const response = await apiClient.get('/admin/api/requests', { params });
    return response.data;
  },

  getApiRequest: async (id: string): Promise<ApiRequest> => {
    const response = await apiClient.get(`/admin/api/requests/${id}`);
    return response.data;
  },

  // API analytics
  getApiAnalytics: async (params: {
    start_date: string;
    end_date: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
    endpoint_id?: string;
    api_key_id?: string;
  }): Promise<ApiAnalytics> => {
    const response = await apiClient.get('/admin/api/analytics', { params });
    return response.data;
  },

  getRealTimeMetrics: async (): Promise<{
    active_requests: number;
    requests_per_minute: number;
    average_response_time: number;
    error_rate: number;
    rate_limit_hits: number;
    top_endpoints: Array<{ path: string; requests: number }>;
  }> => {
    const response = await apiClient.get('/admin/api/metrics/realtime');
    return response.data;
  },

  getSystemHealth: async (): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    uptime: number; // seconds
    response_time: number; // ms
    error_rate: number; // percentage
    database_status: 'connected' | 'disconnected';
    redis_status: 'connected' | 'disconnected';
    external_services: Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      response_time?: number;
    }>;
    last_check: string;
  }> => {
    const response = await apiClient.get('/admin/api/health');
    return response.data;
  },

  // Performance monitoring
  getPerformanceMetrics: async (params: {
    start_date: string;
    end_date: string;
    metric?: 'response_time' | 'throughput' | 'error_rate' | 'availability';
  }): Promise<{
    metrics: Array<{
      timestamp: string;
      value: number;
    }>;
    summary: {
      average: number;
      min: number;
      max: number;
      p50: number;
      p95: number;
      p99: number;
    };
  }> => {
    const response = await apiClient.get('/admin/api/performance', { params });
    return response.data;
  },

  // Error tracking
  getErrorAnalytics: async (params: {
    start_date: string;
    end_date: string;
    error_type?: string;
    endpoint_id?: string;
  }): Promise<{
    total_errors: number;
    error_rate: number;
    top_errors: Array<{
      error_type: string;
      count: number;
      percentage: number;
      sample_message: string;
    }>;
    errors_over_time: Array<{
      timestamp: string;
      count: number;
    }>;
    affected_endpoints: Array<{
      endpoint_id: string;
      path: string;
      error_count: number;
    }>;
  }> => {
    const response = await apiClient.get('/admin/api/errors', { params });
    return response.data;
  },
};

// ==================== RATE LIMITING ====================

export const RateLimitService = {
  // Rate limit rules
  getRateLimitRules: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    scope?: RateLimitRule['scope'];
    active?: boolean;
  }): Promise<RateLimitRulesResponse> => {
    const response = await apiClient.get('/admin/rate-limits', { params });
    return response.data;
  },

  getRateLimitRule: async (id: string): Promise<RateLimitRule> => {
    const response = await apiClient.get(`/admin/rate-limits/${id}`);
    return response.data;
  },

  createRateLimitRule: async (data: CreateRateLimitRuleRequest): Promise<RateLimitRule> => {
    const response = await apiClient.post('/admin/rate-limits', data);
    return response.data;
  },

  updateRateLimitRule: async (id: string, data: Partial<CreateRateLimitRuleRequest>): Promise<RateLimitRule> => {
    const response = await apiClient.put(`/admin/rate-limits/${id}`, data);
    return response.data;
  },

  deleteRateLimitRule: async (id: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/rate-limits/${id}`);
    return response.data;
  },

  toggleRateLimitRule: async (id: string, active: boolean): Promise<RateLimitRule> => {
    const response = await apiClient.post(`/admin/rate-limits/${id}/toggle`, { active });
    return response.data;
  },

  // Rate limit monitoring
  getRateLimitStats: async (): Promise<{
    total_rules: number;
    active_rules: number;
    rate_limit_hits_today: number;
    blocked_requests_today: number;
    top_blocked_ips: Array<{ ip: string; blocks: number }>;
    top_limited_endpoints: Array<{ endpoint: string; hits: number }>;
  }> => {
    const response = await apiClient.get('/admin/rate-limits/stats');
    return response.data;
  },

  testRateLimitRule: async (ruleId: string, testRequest: {
    ip?: string;
    user_id?: string;
    api_key_id?: string;
    endpoint?: string;
  }): Promise<{
    blocked: boolean;
    delay: number;
    remaining_requests: number;
    reset_time: string;
  }> => {
    const response = await apiClient.post(`/admin/rate-limits/${ruleId}/test`, testRequest);
    return response.data;
  },
};
