/**
 * Dashboard/Analytics API Service
 * Handles dashboard data and analytics operations
 */

import { apiClient, handleApiError } from './client';
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get recent activity feed
   */
  static async getRecentActivity(limit: number = 20): Promise<any> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/activity`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get platform health metrics
   */
  static async getPlatformHealth(): Promise<any> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/health`);
      return response.data;
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
  ): Promise<any> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/top-services`, {
        params: { period, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get key performance indicators (KPIs)
   */
  static async getKPIs(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> {
    try {
      const response = await apiClient.get(`${ANALYTICS_ENDPOINTS.DASHBOARD}/kpis`, {
        params: { period },
      });
      return response.data;
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
