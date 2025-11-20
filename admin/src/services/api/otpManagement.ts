import { apiService } from './base';
import type {
  OTPVerification,
  OTPVerificationFilters,
  OTPVerificationListResponse,
  OTPStatistics,
  OTPResendRequest,
  OTPUnblockRequest,
  BlockedUser,
  PaginationParams,
} from '../../types/api.types';

/**
 * OTP Management Service
 * Handles OTP verification monitoring, statistics, and management
 */
export class OTPManagementService {
  private readonly basePath = '/api/admin/v1/system/otp-verifications';

  // ===== OTP VERIFICATION OPERATIONS =====

  /**
   * Get paginated list of OTP verifications with filters
   */
  async getOTPVerifications(
    filters?: OTPVerificationFilters,
    pagination?: PaginationParams
  ): Promise<OTPVerificationListResponse> {
    const params = {
      ...filters,
      page: pagination?.page || 1,
      size: pagination?.page_size || 20,
    };
    return apiService.get<OTPVerificationListResponse>(this.basePath, { params });
  }

  /**
   * Get OTP verification by ID
   */
  async getOTPVerification(otpId: number): Promise<OTPVerification> {
    return apiService.get<OTPVerification>(`${this.basePath}/${otpId}`);
  }

  /**
   * Delete OTP verification record
   */
  async deleteOTPVerification(otpId: number): Promise<void> {
    return apiService.delete<void>(`${this.basePath}/${otpId}`);
  }

  // ===== STATISTICS =====

  /**
   * Get OTP statistics
   */
  async getStatistics(): Promise<OTPStatistics> {
    return apiService.get<OTPStatistics>(`${this.basePath}/stats`);
  }

  // ===== BLOCKING & UNBLOCKING =====

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    return apiService.get<BlockedUser[]>(`${this.basePath}/blocked-users`);
  }

  /**
   * Unblock a phone number
   */
  async unblockPhone(data: OTPUnblockRequest): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.basePath}/unblock`, data);
  }

  // ===== RESEND OPERATIONS =====

  /**
   * Resend OTP to phone number
   */
  async resendOTP(data: OTPResendRequest): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(`${this.basePath}/resend`, data);
  }

  // ===== SEARCH & FILTER HELPERS =====

  /**
   * Get OTP verifications by phone number
   */
  async getByPhoneNumber(
    phoneNumber: string,
    pagination?: PaginationParams
  ): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ phone_number: phoneNumber }, pagination);
  }

  /**
   * Get verified OTPs only
   */
  async getVerifiedOTPs(pagination?: PaginationParams): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ is_verified: true }, pagination);
  }

  /**
   * Get unverified OTPs only
   */
  async getUnverifiedOTPs(pagination?: PaginationParams): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ is_verified: false }, pagination);
  }

  /**
   * Get blocked OTPs only
   */
  async getBlockedOTPs(pagination?: PaginationParams): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ is_blocked: true }, pagination);
  }

  /**
   * Get OTPs by purpose
   */
  async getByPurpose(
    purpose: string,
    pagination?: PaginationParams
  ): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ purpose }, pagination);
  }

  /**
   * Get OTPs by user type
   */
  async getByUserType(
    userType: string,
    pagination?: PaginationParams
  ): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications({ user_type: userType }, pagination);
  }

  /**
   * Get OTPs within date range
   */
  async getByDateRange(
    fromDate: string,
    toDate: string,
    pagination?: PaginationParams
  ): Promise<OTPVerificationListResponse> {
    return this.getOTPVerifications(
      {
        created_from: fromDate,
        created_to: toDate,
      },
      pagination
    );
  }
}

// Export singleton instance
export const otpManagementService = new OTPManagementService();
