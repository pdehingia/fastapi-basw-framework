import { apiService } from './base';
import type {
  Business,
  BusinessCreate,
  BusinessUpdate,
  BusinessFilters,
  BusinessStatistics,
  BusinessStatusUpdate,
  Course,
  CourseCreate,
  CourseUpdate,
  CourseFilters,
  CourseStatistics,
  AcademyCourse,
  AcademyCourseCreate,
  AcademyCourseFilters,
  PaginatedResponse,
  QueryParams,
} from '@/types/api.types';

/**
 * Service for managing business content (salons, academies, courses)
 */
export class BusinessContentService {
  private readonly basePath = '/api/admin/v1/content-management';

  // ===== BUSINESS STATISTICS =====

  /**
   * Get comprehensive business statistics
   */
  async getBusinessStatistics() {
    return apiService.get<BusinessStatistics>(`${this.basePath}/business/statistics`);
  }

  // ===== SALON MANAGEMENT =====

  /**
   * Get salons with filters and pagination
   */
  async getSalons(filters: BusinessFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<Business>(`${this.basePath}/business/salons`, {
      params: {
        page: params.page || 1,
        size: params.page_size || 20,
        sort_by: params.sort_by || 'created_at',
        sort_order: params.sort_order || 'desc',
        ...filters,
      },
    });
  }

  /**
   * Create new salon
   */
  async createSalon(data: BusinessCreate) {
    return apiService.post<Business>(`${this.basePath}/business/salons`, data);
  }

  /**
   * Get salon by ID
   */
  async getSalon(salonId: string) {
    return apiService.get<Business>(`${this.basePath}/business/salons/${salonId}`);
  }

  /**
   * Update salon information
   */
  async updateSalon(salonId: string, data: BusinessUpdate) {
    return apiService.put<Business>(`${this.basePath}/business/salons/${salonId}`, data);
  }

  /**
   * Delete salon
   */
  async deleteSalon(salonId: string) {
    return apiService.delete<{ message: string }>(`${this.basePath}/business/salons/${salonId}`);
  }

  /**
   * Update salon status (active/verified)
   */
  async updateSalonStatus(salonId: string, statusUpdate: BusinessStatusUpdate) {
    return apiService.patch<Business>(
      `${this.basePath}/business/salons/${salonId}/status`,
      statusUpdate
    );
  }

  /**
   * Quick search salons by name
   */
  async searchSalons(query: string, limit: number = 10) {
    return apiService.get<Business[]>(`${this.basePath}/business/salons/search`, {
      params: { q: query, limit },
    });
  }

  // ===== ACADEMY MANAGEMENT =====

  /**
   * Get academies with filters and pagination
   */
  async getAcademies(filters: BusinessFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<Business>(`${this.basePath}/business/academies`, {
      params: {
        page: params.page || 1,
        size: params.page_size || 20,
        sort_by: params.sort_by || 'created_at',
        sort_order: params.sort_order || 'desc',
        ...filters,
      },
    });
  }

  /**
   * Create new academy
   */
  async createAcademy(data: BusinessCreate) {
    return apiService.post<Business>(`${this.basePath}/business/academies`, data);
  }

  /**
   * Get academy by ID
   */
  async getAcademy(academyId: string) {
    return apiService.get<Business>(`${this.basePath}/business/academies/${academyId}`);
  }

  /**
   * Update academy information
   */
  async updateAcademy(academyId: string, data: BusinessUpdate) {
    return apiService.put<Business>(`${this.basePath}/business/academies/${academyId}`, data);
  }

  /**
   * Delete academy
   */
  async deleteAcademy(academyId: string) {
    return apiService.delete<{ message: string }>(
      `${this.basePath}/business/academies/${academyId}`
    );
  }

  /**
   * Update academy status (active/verified)
   */
  async updateAcademyStatus(academyId: string, statusUpdate: BusinessStatusUpdate) {
    return apiService.patch<Business>(
      `${this.basePath}/business/academies/${academyId}/status`,
      statusUpdate
    );
  }

  /**
   * Quick search academies by name
   */
  async searchAcademies(query: string, limit: number = 10) {
    return apiService.get<Business[]>(`${this.basePath}/business/academies/search`, {
      params: { q: query, limit },
    });
  }

  // ===== COURSE MANAGEMENT =====

  /**
   * Get course statistics
   */
  async getCourseStatistics() {
    return apiService.get<CourseStatistics>(`${this.basePath}/courses/statistics`);
  }

  /**
   * Get courses with filters and pagination
   */
  async getCourses(filters: CourseFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<Course>(`${this.basePath}/courses`, {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        sort_by: params.sort_by || 'created_at',
        sort_order: params.sort_order || 'desc',
        ...filters,
      },
    });
  }

  /**
   * Create new course
   */
  async createCourse(data: CourseCreate) {
    return apiService.post<Course>(`${this.basePath}/courses`, data);
  }

  /**
   * Get course by ID
   */
  async getCourse(courseId: string) {
    return apiService.get<Course>(`${this.basePath}/courses/${courseId}`);
  }

  /**
   * Update course information
   */
  async updateCourse(courseId: string, data: CourseUpdate) {
    return apiService.put<Course>(`${this.basePath}/courses/${courseId}`, data);
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string) {
    return apiService.delete<void>(`${this.basePath}/courses/${courseId}`);
  }

  /**
   * Get available course categories
   */
  async getCourseCategories() {
    return apiService.get<string[]>(`${this.basePath}/courses/metadata/categories`);
  }

  /**
   * Get available course levels
   */
  async getCourseLevels() {
    return apiService.get<string[]>(`${this.basePath}/courses/metadata/levels`);
  }

  // ===== ACADEMY COURSES =====

  /**
   * Get academy courses with filters
   */
  async getAcademyCourses(filters: AcademyCourseFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<AcademyCourse>(
      `${this.basePath}/courses/academy-courses`,
      {
        params: {
          page: params.page || 1,
          page_size: params.page_size || 20,
          sort_by: params.sort_by || 'created_at',
          sort_order: params.sort_order || 'desc',
          ...filters,
        },
      }
    );
  }

  /**
   * Create academy course
   */
  async createAcademyCourse(data: AcademyCourseCreate) {
    return apiService.post<AcademyCourse>(`${this.basePath}/courses/academy-courses`, data);
  }

  /**
   * Get academy course by ID
   */
  async getAcademyCourse(academyCourseId: string) {
    return apiService.get<AcademyCourse>(
      `${this.basePath}/courses/academy-courses/${academyCourseId}`
    );
  }

  /**
   * Update academy course
   */
  async updateAcademyCourse(academyCourseId: string, data: Partial<AcademyCourseCreate>) {
    return apiService.put<AcademyCourse>(
      `${this.basePath}/courses/academy-courses/${academyCourseId}`,
      data
    );
  }

  /**
   * Delete academy course
   */
  async deleteAcademyCourse(academyCourseId: string) {
    return apiService.delete<void>(`${this.basePath}/courses/academy-courses/${academyCourseId}`);
  }

  /**
   * Toggle academy course availability
   */
  async toggleAcademyCourseAvailability(
    academyCourseId: string,
    isAvailable: boolean,
    reason?: string
  ) {
    return apiService.patch<AcademyCourse>(
      `${this.basePath}/courses/academy-courses/${academyCourseId}/availability`,
      { is_available: isAvailable, reason }
    );
  }

  /**
   * Bulk create academy courses
   */
  async bulkCreateAcademyCourses(data: { academy_id: string; course_ids: string[] }) {
    return apiService.post<{ created: number; failed: number; errors: any[] }>(
      `${this.basePath}/courses/academy-courses/bulk`,
      data
    );
  }

  // ===== SERVICES MANAGEMENT =====

  /**
   * Get services with filters
   */
  async getServices(filters: any = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<any>(`${this.basePath}/business/services`, {
      params: {
        page: params.page || 1,
        size: params.page_size || 20,
        sort_by: params.sort_by || 'created_at',
        sort_order: params.sort_order || 'desc',
        ...filters,
      },
    });
  }

  /**
   * Create service
   */
  async createService(data: any) {
    return apiService.post<any>(`${this.basePath}/business/services`, data);
  }

  /**
   * Get service by ID
   */
  async getService(serviceId: string) {
    return apiService.get<any>(`${this.basePath}/business/services/${serviceId}`);
  }

  /**
   * Update service
   */
  async updateService(serviceId: string, data: any) {
    return apiService.put<any>(`${this.basePath}/business/services/${serviceId}`, data);
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string) {
    return apiService.delete<{ message: string }>(
      `${this.basePath}/business/services/${serviceId}`
    );
  }

  /**
   * Health check
   */
  async healthCheck() {
    return apiService.get<{ status: string; service: string }>(
      `${this.basePath}/business/health`
    );
  }
}

export const businessContentService = new BusinessContentService();
