import { apiService } from './base';
import type {
  AcademyStudent,
  AcademyStudentCreate,
  AcademyStudentUpdate,
  AcademyStudentFilters,
  AcademyStudentStatistics,
  StudentStatusUpdate,
  StudentInvitation,
  BulkStudentOperation,
  BulkStudentOperationResponse,
  StudentProgress,
  StudentCertification,
  QueryParams,
  PaginatedResponse,
} from '@/types/api.types';

/**
 * Service for managing academy students
 */
export class StudentsService {
  private readonly basePath = '/api/admin/v1/academy-management/academy-students';

  // ===== STUDENT CRUD =====

  /**
   * Create new academy student enrollment
   */
  async createStudent(data: AcademyStudentCreate) {
    return apiService.post<AcademyStudent>(this.basePath, data);
  }

  /**
   * Get student by ID with detailed information
   */
  async getStudent(studentId: string) {
    return apiService.get<AcademyStudent>(`${this.basePath}/${studentId}`);
  }

  /**
   * Update student information
   */
  async updateStudent(studentId: string, data: AcademyStudentUpdate) {
    return apiService.put<AcademyStudent>(`${this.basePath}/${studentId}`, data);
  }

  /**
   * Delete student enrollment
   */
  async deleteStudent(studentId: string) {
    return apiService.delete<{ message: string }>(`${this.basePath}/${studentId}`);
  }

  /**
   * Search students with filters and pagination
   */
  async searchStudents(filters: AcademyStudentFilters = {}, params: QueryParams = {}) {
    return apiService.get<PaginatedResponse<AcademyStudent>>(this.basePath, {
      params: {
        page: params.page || 1,
        page_size: params.page_size || 20,
        ...filters,
      },
    });
  }

  // ===== STATUS MANAGEMENT =====

  /**
   * Update student registration status
   */
  async updateStudentStatus(studentId: string, statusUpdate: StudentStatusUpdate) {
    return apiService.post<AcademyStudent>(`${this.basePath}/${studentId}/status`, statusUpdate);
  }

  /**
   * Send invitation to student
   */
  async sendInvitation(studentId: string, customMessage?: string) {
    return apiService.post<{ message: string; student_id: string; sent_at: string }>(
      `${this.basePath}/${studentId}/invite`,
      { custom_message: customMessage }
    );
  }

  /**
   * Graduate student
   */
  async graduateStudent(
    studentId: string,
    data: { graduation_date?: string; certificate_url?: string }
  ) {
    return apiService.post<AcademyStudent>(`${this.basePath}/${studentId}/graduate`, data);
  }

  // ===== STATISTICS & ANALYTICS =====

  /**
   * Get comprehensive student statistics
   */
  async getStatistics() {
    return apiService.get<AcademyStudentStatistics>(`${this.basePath}/analytics/statistics`);
  }

  /**
   * Get enrollment trends
   */
  async getEnrollmentTrends(months: number = 12, academyId?: string) {
    return apiService.get<any>(`${this.basePath}/analytics/enrollment-trends`, {
      params: { months, academy_id: academyId },
    });
  }

  /**
   * Get academy performance analytics
   */
  async getAcademyPerformance(academyId?: string, courseId?: string) {
    return apiService.get<any>(`${this.basePath}/analytics/performance`, {
      params: { academy_id: academyId, course_id: courseId },
    });
  }

  // ===== BULK OPERATIONS =====

  /**
   * Send bulk invitations to students
   */
  async bulkSendInvitations(invitation: StudentInvitation) {
    return apiService.post<BulkStudentOperationResponse>(
      `${this.basePath}/bulk-invite`,
      invitation
    );
  }

  /**
   * Bulk update student status
   */
  async bulkUpdateStatus(operation: BulkStudentOperation) {
    return apiService.post<BulkStudentOperationResponse>(
      `${this.basePath}/bulk-update-status`,
      operation
    );
  }

  /**
   * Bulk graduate students
   */
  async bulkGraduate(studentIds: string[], graduationDate?: string) {
    return apiService.post<BulkStudentOperationResponse>(`${this.basePath}/bulk-graduate`, {
      student_ids: studentIds,
      graduation_date: graduationDate,
    });
  }

  // ===== PROGRESS TRACKING =====

  /**
   * Get student progress details
   */
  async getStudentProgress(studentId: string) {
    return apiService.get<StudentProgress>(`${this.basePath}/${studentId}/progress`);
  }

  /**
   * Update student progress
   */
  async updateStudentProgress(studentId: string, progressData: StudentProgress) {
    return apiService.post<{ message: string; student_id: string; updated_at: string }>(
      `${this.basePath}/${studentId}/progress`,
      progressData
    );
  }

  // ===== CERTIFICATION MANAGEMENT =====

  /**
   * Get student certifications
   */
  async getStudentCertifications(studentId: string) {
    return apiService.get<{ student_id: string; certifications: StudentCertification[] }>(
      `${this.basePath}/${studentId}/certifications`
    );
  }

  /**
   * Add student certification
   */
  async addStudentCertification(studentId: string, certification: StudentCertification) {
    return apiService.post<{
      message: string;
      student_id: string;
      certification_id: string;
      added_at: string;
    }>(`${this.basePath}/${studentId}/certifications`, certification);
  }

  // ===== EXPORT & REPORTING =====

  /**
   * Export students report
   */
  async exportStudents(params: {
    format?: 'csv' | 'excel' | 'json' | 'pdf';
    academy_id?: string;
    course_id?: string;
    registration_status?: string;
    enrolled_after?: string;
    enrolled_before?: string;
    include_progress?: boolean;
  } = {}): Promise<Blob> {
    const response = await apiService.get(`${this.basePath}/export/students`, {
      params,
      responseType: 'blob',
    });
    return response as Blob;
  }

  /**
   * Get enrollment summary report
   */
  async getEnrollmentSummary(params: {
    start_date?: string;
    end_date?: string;
    academy_id?: string;
  } = {}) {
    return apiService.get<any>(`${this.basePath}/reports/enrollment-summary`, { params });
  }

  /**
   * Health check
   */
  async healthCheck() {
    return apiService.get<{
      service: string;
      status: string;
      version: string;
      features: string[];
    }>(`${this.basePath}/health`);
  }
}

export const studentsService = new StudentsService();
