/**
 * Dashboard/Analytics API Service
 * Handles dashboard data and analytics operations
 */

import { apiClient, handleApiResponse, handleApiError } from './client';
import { ANALYTICS_ENDPOINTS } from '@/config/api';
import type { DashboardStats, TrendData } from '@/types/api.types';

export class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  static async getDashboardStats(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<DashboardStats> {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.DASHBOARD, {
        params: dateRange,
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get user analytics data
   */
  static async getUserAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalUsers: number;
    newUsers: TrendData[];
    activeUsers: TrendData[];
    usersByRole: Array<{ role: string; count: number }>;
    usersByStatus: Array<{ status: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.USERS, {
        params: { period },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get booking analytics data
   */
  static async getBookingAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalBookings: number;
    bookingTrends: TrendData[];
    bookingsByStatus: Array<{ status: string; count: number }>;
    bookingsByService: Array<{ serviceName: string; count: number; revenue: number }>;
    averageBookingValue: number;
    completionRate: number;
  }> {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.BOOKINGS, {
        params: { period },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get payment/revenue analytics data
   */
  static async getPaymentAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalRevenue: number;
    revenueTrends: TrendData[];
    paymentMethods: Array<{ method: string; count: number; amount: number }>;
    refunds: {
      total: number;
      amount: number;
      rate: number;
    };
    averageTransactionValue: number;
    topCustomers: Array<{
      id: string;
      name: string;
      totalSpent: number;
      bookingCount: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(ANALYTICS_ENDPOINTS.FINANCIAL, {
        params: { period },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get recent activity feed
   */
  static async getRecentActivity(limit: number = 20): Promise<Array<{
    id: string;
    type: 'user_created' | 'booking_created' | 'booking_completed' | 'payment_received' | 'review_submitted';
    title: string;
    description: string;
    timestamp: string;
    entityId?: string;
    entityType?: 'user' | 'booking' | 'payment' | 'review';
    actor?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/activity`, {
        params: { limit },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get platform health metrics
   */
  static async getPlatformHealth(): Promise<{
    apiStatus: 'healthy' | 'degraded' | 'down';
    databaseStatus: 'healthy' | 'degraded' | 'down';
    cacheStatus: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    version: string;
    environment: 'development' | 'staging' | 'production';
    lastDeployment: string;
  }> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/health`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get top performing services
   */
  static async getTopServices(
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    limit: number = 10
  ): Promise<Array<{
    id: string;
    name: string;
    category: string;
    bookings: number;
    revenue: number;
    averageRating: number;
    growth: number;
  }>> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/top-services`, {
        params: { period, limit },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get key performance indicators (KPIs)
   */
  static async getKPIs(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    churnRate: number;
    netPromoterScore: number;
    bookingConversionRate: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    providerUtilization: number;
  }> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/kpis`, {
        params: { period },
      });
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Export dashboard data
   */
  static async exportDashboardData(
    type: 'users' | 'bookings' | 'payments' | 'all',
    dateRange?: { startDate: string; endDate: string }
  ): Promise<Blob> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/export`, {
        params: { type, ...dateRange },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default DashboardService;