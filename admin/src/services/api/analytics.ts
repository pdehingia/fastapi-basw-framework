/**
 * Analytics API Service
 * Handles all analytics and dashboard statistics
 */

import { ANALYTICS_ENDPOINTS } from '@/config/api';
import { apiService } from './base';
import type {
  ApiResponse,
  UserAnalytics,
  BookingAnalytics
} from '@/types/api.types';

export class AnalyticsService {
  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(): Promise<ApiResponse<{
    total_users: number;
    total_bookings: number;
    total_revenue: number;
    growth_metrics: {
      user_growth: number;
      booking_growth: number;
      revenue_growth: number;
    };
    recent_activities: Array<{
      type: string;
      description: string;
      timestamp: string;
    }>;
  }>> {
    return await apiService.get<{
      total_users: number;
      total_bookings: number;
      total_revenue: number;
      growth_metrics: {
        user_growth: number;
        booking_growth: number;
        revenue_growth: number;
      };
      recent_activities: Array<{
        type: string;
        description: string;
        timestamp: string;
      }>;
    }>(ANALYTICS_ENDPOINTS.DASHBOARD);
  }

  /**
   * Get user analytics and statistics
   */
  async getUserAnalytics(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<UserAnalytics>> {
    return await apiService.get<UserAnalytics>(ANALYTICS_ENDPOINTS.USERS, params);
  }

  /**
   * Get booking analytics and trends
   */
  async getBookingAnalytics(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
    service_type?: string;
  } = {}): Promise<ApiResponse<BookingAnalytics>> {
    return await apiService.get<BookingAnalytics>(ANALYTICS_ENDPOINTS.BOOKINGS, params);
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
    currency?: string;
  } = {}): Promise<ApiResponse<{
    total_revenue: number;
    total_commissions: number;
    pending_payouts: number;
    revenue_trends: Array<{
      date: string;
      revenue: number;
      commission: number;
    }>;
    top_earning_categories: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
  }>> {
    return await apiService.get<{
      total_revenue: number;
      total_commissions: number;
      pending_payouts: number;
      revenue_trends: Array<{
        date: string;
        revenue: number;
        commission: number;
      }>;
      top_earning_categories: Array<{
        category: string;
        revenue: number;
        percentage: number;
      }>;
    }>(ANALYTICS_ENDPOINTS.FINANCIAL, params);
  }

  /**
   * Get platform performance metrics
   */
  async getPlatformPerformance(params: {
    start_date?: string;
    end_date?: string;
  } = {}): Promise<ApiResponse<{
    response_time: number;
    uptime: number;
    error_rate: number;
    active_sessions: number;
    performance_trends: Array<{
      timestamp: string;
      response_time: number;
      active_sessions: number;
    }>;
  }>> {
    return await apiService.get<{
      response_time: number;
      uptime: number;
      error_rate: number;
      active_sessions: number;
      performance_trends: Array<{
        timestamp: string;
        response_time: number;
        active_sessions: number;
      }>;
    }>(ANALYTICS_ENDPOINTS.PERFORMANCE, params);
  }

  /**
   * Get artist performance analytics
   */
  async getArtistPerformance(params: {
    artist_id?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<ApiResponse<{
    total_artists: number;
    active_artists: number;
    top_performers: Array<{
      artist_id: string;
      artist_name: string;
      total_bookings: number;
      total_earnings: number;
      rating: number;
    }>;
  }>> {
    return await apiService.get<{
      total_artists: number;
      active_artists: number;
      top_performers: Array<{
        artist_id: string;
        artist_name: string;
        total_bookings: number;
        total_earnings: number;
        rating: number;
      }>;
    }>(ANALYTICS_ENDPOINTS.ARTISTS_PERFORMANCE, params);
  }

  /**
   * Generate analytics report
   */
  async generateReport(params: {
    report_type: 'users' | 'bookings' | 'financial' | 'comprehensive';
    start_date?: string;
    end_date?: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<ApiResponse<{
    report_id: string;
    status: 'processing' | 'completed' | 'failed';
    download_url?: string;
    estimated_completion?: string;
  }>> {
    return await apiService.post<{
      report_id: string;
      status: 'processing' | 'completed' | 'failed';
      download_url?: string;
      estimated_completion?: string;
    }>(ANALYTICS_ENDPOINTS.GENERATE_REPORT, params);
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(params: {
    report_type: 'users' | 'bookings' | 'financial' | 'comprehensive';
    start_date?: string;
    end_date?: string;
    format?: 'csv' | 'excel' | 'pdf';
  }): Promise<ApiResponse<{
    download_url: string;
    expires_at: string;
  }>> {
    return await apiService.post<{
      download_url: string;
      expires_at: string;
    }>(ANALYTICS_ENDPOINTS.EXPORT, params);
  }
}

export const analyticsService = new AnalyticsService();