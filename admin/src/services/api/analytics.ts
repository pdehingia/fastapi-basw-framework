/**
 * Advanced Analytics Service
 * Comprehensive analytics service for reports, dashboards, platform analytics, and exports
 */

import { apiService } from './base';
import { ANALYTICS_ENDPOINTS } from '@/config/api';


// Platform Analytics Types
export interface PlatformAnalytics {
  overview: {
    total_users: number;
    total_bookings: number;
    total_revenue: number;
    total_providers: number;
    active_users: number;
    growth_rate: number;
  };
  trends: {
    date: string;
    users: number;
    bookings: number;
    revenue: number;
  }[];
  top_metrics: {
    most_booked_services: Array<{ name: string; count: number }>;
    top_revenue_providers: Array<{ name: string; revenue: number }>;
    popular_locations: Array<{ location: string; count: number }>;
  };
}

export interface PlatformSummary {
  period: string;
  total_transactions: number;
  total_users: number;
  total_revenue: number;
  avg_booking_value: number;
  user_retention_rate: number;
  provider_satisfaction: number;
}

export interface PlatformTrends {
  metric: string;
  period: string;
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
}

export interface AnalyticsCalculationRequest {
  metric_type: string;
  start_date?: string;
  end_date?: string;
  filters?: Record<string, any>;
}

export interface ExportAnalyticsRequest {
  report_type: string;
  format: 'csv' | 'xlsx' | 'pdf';
  start_date?: string;
  end_date?: string;
  filters?: Record<string, any>;
}

export const analyticsService = {
  // Platform Analytics - New comprehensive platform-wide analytics
  platform: {
    async getAnalytics(params: {
      start_date?: string;
      end_date?: string;
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    } = {}): Promise<PlatformAnalytics> {
      return await apiService.get<PlatformAnalytics>(ANALYTICS_ENDPOINTS.PLATFORM, params);
    },

    async getSummary(params: {
      period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    } = {}): Promise<PlatformSummary> {
      return await apiService.get<PlatformSummary>(ANALYTICS_ENDPOINTS.PLATFORM_SUMMARY, params);
    },

    async getTrends(params: {
      metric: string;
      start_date?: string;
      end_date?: string;
      period?: 'day' | 'week' | 'month';
    }): Promise<PlatformTrends> {
      return await apiService.get<PlatformTrends>(ANALYTICS_ENDPOINTS.PLATFORM_TRENDS, params);
    },

    async calculate(data: AnalyticsCalculationRequest): Promise<any> {
      return await apiService.post<any>(ANALYTICS_ENDPOINTS.PLATFORM_CALCULATE, data);
    },

    async export(data: ExportAnalyticsRequest): Promise<{ download_url: string }> {
      return await apiService.post<{ download_url: string }>(
        ANALYTICS_ENDPOINTS.PLATFORM_EXPORT,
        data
      );
    },
  },

  reports: {
    async getReports(params = {}) {
      return await apiService.get('/analytics/reports', params);
    },
    
    async createReport(data: any) {
      return await apiService.post('/analytics/reports', data);
    },
    
    async updateReport(id: string, data: any) {
      return await apiService.put(`/analytics/reports/${id}`, data);
    },
    
    async deleteReport(id: string) {
      return await apiService.delete(`/analytics/reports/${id}`);
    },
    
    async runReport(id: string) {
      return await apiService.post(`/analytics/reports/${id}/run`);
    },
    
    async previewReport(config: any) {
      return await apiService.post('/analytics/reports/preview', config);
    }
  },

  dashboards: {
    async getDashboards(params = {}) {
      return await apiService.get('/analytics/dashboards', params);
    },
    
    async createDashboard(data: any) {
      return await apiService.post('/analytics/dashboards', data);
    },
    
    async updateDashboard(id: string, data: any) {
      return await apiService.put(`/analytics/dashboards/${id}`, data);
    },
    
    async deleteDashboard(id: string) {
      return await apiService.delete(`/analytics/dashboards/${id}`);
    },
    
    async getDashboardWidgets(id: string) {
      return await apiService.get(`/analytics/dashboards/${id}/widgets`);
    },
    
    async createDashboardWidget(dashboardId: string, widget: any) {
      return await apiService.post(`/analytics/dashboards/${dashboardId}/widgets`, widget);
    },
    
    async updateDashboardWidget(dashboardId: string, widgetId: string, data: any) {
      return await apiService.put(`/analytics/dashboards/${dashboardId}/widgets/${widgetId}`, data);
    },
    
    async deleteDashboardWidget(dashboardId: string, widgetId: string) {
      return await apiService.delete(`/analytics/dashboards/${dashboardId}/widgets/${widgetId}`);
    }
  },

  exports: {
    async getExportJobs(params = {}) {
      return await apiService.get('/analytics/exports', params);
    },
    
    async createExportJob(data: any) {
      return await apiService.post('/analytics/exports', data);
    },
    
    async getExportJob(id: string) {
      return await apiService.get(`/analytics/exports/${id}`);
    },
    
    async cancelExportJob(id: string) {
      return await apiService.post(`/analytics/exports/${id}/cancel`);
    }
  },

  dataSources: {
    async getDataSources() {
      return await apiService.get('/analytics/data-sources');
    },
    
    async getDataSource(id: string) {
      return await apiService.get(`/analytics/data-sources/${id}`);
    },
    
    async testDataSource(id: string) {
      return await apiService.post(`/analytics/data-sources/${id}/test`);
    }
  },

  overview: {
    async getOverview() {
      return await apiService.get('/analytics/overview');
    }
  }
};

export default analyticsService;
