/**
 * Academy Performance Service
 * Service for academy performance analytics and metrics
 */

import { apiService } from './base';
import { ACADEMY_ENDPOINTS } from '@/config/api';


// Academy Performance Types
export interface AcademyPerformance {
  overview: {
    total_academies: number;
    total_students: number;
    total_courses: number;
    completion_rate: number;
    avg_rating: number;
  };
  top_performers: Array<{
    academy_id: string;
    academy_name: string;
    total_students: number;
    completion_rate: number;
    avg_rating: number;
    revenue: number;
  }>;
  performance_by_category: Array<{
    category: string;
    student_count: number;
    completion_rate: number;
    avg_rating: number;
  }>;
}

export interface AcademyDetailPerformance {
  academy_id: string;
  academy_name: string;
  total_students: number;
  active_students: number;
  completed_students: number;
  completion_rate: number;
  avg_course_rating: number;
  total_revenue: number;
  courses: Array<{
    course_id: string;
    course_name: string;
    enrolled_students: number;
    completed_students: number;
    avg_rating: number;
  }>;
}

export interface AcademyTrends {
  academy_id: string;
  period: string;
  trends: Array<{
    date: string;
    students: number;
    completions: number;
    revenue: number;
  }>;
}

export interface PerformanceCalculationRequest {
  academy_id?: string;
  start_date?: string;
  end_date?: string;
  metric_type: string;
}

export interface PerformanceExportRequest {
  academy_id?: string;
  format: 'csv' | 'xlsx' | 'pdf';
  start_date?: string;
  end_date?: string;
}

/**
 * Academy Performance Service
 */
export class AcademyPerformanceService {
  /**
   * Get overall academy performance
   */
  async getPerformance(params: {
    start_date?: string;
    end_date?: string;
    period?: 'day' | 'week' | 'month';
  } = {}): Promise<AcademyPerformance> {
    return await apiService.get<AcademyPerformance>(ACADEMY_ENDPOINTS.PERFORMANCE, params);
  }

  /**
   * Get performance for specific academy
   */
  async getAcademyPerformance(
    academyId: string,
    params: {
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<AcademyDetailPerformance> {
    return await apiService.get<AcademyDetailPerformance>(
      ACADEMY_ENDPOINTS.ACADEMY_PERFORMANCE(academyId),
      params
    );
  }

  /**
   * Get trends for specific academy
   */
  async getAcademyTrends(
    academyId: string,
    params: {
      start_date?: string;
      end_date?: string;
      period?: 'day' | 'week' | 'month';
    } = {}
  ): Promise<AcademyTrends> {
    return await apiService.get<AcademyTrends>(
      ACADEMY_ENDPOINTS.ACADEMY_TRENDS(academyId),
      params
    );
  }

  /**
   * Get top performing academies
   */
  async getTopPerformers(params: {
    limit?: number;
    sort_by?: 'students' | 'completion_rate' | 'revenue' | 'rating';
  } = {}): Promise<AcademyPerformance['top_performers']> {
    return await apiService.get<AcademyPerformance['top_performers']>(
      ACADEMY_ENDPOINTS.TOP_PERFORMERS,
      params
    );
  }

  /**
   * Calculate performance metrics
   */
  async calculatePerformance(
    data: PerformanceCalculationRequest
  ): Promise<any> {
    return await apiService.post<any>(
      ACADEMY_ENDPOINTS.CALCULATE_PERFORMANCE,
      data
    );
  }

  /**
   * Export performance data
   */
  async exportPerformance(
    data: PerformanceExportRequest
  ): Promise<{ download_url: string }> {
    return await apiService.post<{ download_url: string }>(
      ACADEMY_ENDPOINTS.EXPORT_PERFORMANCE,
      data
    );
  }
}

// Export singleton instance
export const academyPerformanceService = new AcademyPerformanceService();
export default academyPerformanceService;
