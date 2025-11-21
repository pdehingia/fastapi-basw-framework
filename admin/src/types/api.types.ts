/**
 * API Response and Data Type Definitions
 * Based on Maya Admin Panel Postman Collection
 */

import type { Permission } from './auth.types';

// ==================== OTP MANAGEMENT TYPES ====================

/**
 * OTP Verification entity
 */
export interface OTPVerification {
  id: number;
  phone_number: string;
  country_code: string;
  purpose: string; // login, register, password_reset, etc.
  user_id?: string;
  user_type?: string;
  otp_code: string;
  attempts_count: number;
  max_attempts: number;
  is_verified: boolean;
  is_blocked: boolean;
  blocked_until?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  expires_at: string;
  verified_at?: string;
}

/**
 * OTP Verification filters
 */
export interface OTPVerificationFilters {
  phone_number?: string;
  user_id?: string;
  user_type?: string;
  purpose?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  created_from?: string;
  created_to?: string;
}

/**
 * OTP Verification list response
 */
export interface OTPVerificationListResponse {
  items: OTPVerification[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * OTP Statistics
 */
export interface OTPStatistics {
  total_otps: number;
  verified_otps: number;
  unverified_otps: number;
  blocked_numbers: number;
  expired_otps: number;
  by_purpose: Record<string, number>;
  by_user_type: Record<string, number>;
  verification_rate: number;
  avg_verification_time_seconds?: number;
}

/**
 * Blocked user information
 */
export interface BlockedUser {
  phone_number: string;
  country_code: string;
  attempts_count: number;
  blocked_until: string;
  last_attempt_at: string;
  reason: string;
}

/**
 * Resend OTP request
 */
export interface OTPResendRequest {
  phone_number: string;
  country_code?: string;
  purpose: string;
}

/**
 * Unblock phone request
 */
export interface OTPUnblockRequest {
  phone_number: string;
  country_code?: string;
  reason?: string;
}

// ==================== ROLES & PERMISSIONS TYPES ====================

/**
 * Role entity
 */
export interface Role {
  id: number;
  role_name: string;
  role_slug: string;
  description?: string;
  parent_role_id?: number;
  level: number;
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

/**
 * Role hierarchy node
 */
export interface RoleHierarchyNode {
  id: number;
  role_name: string;
  role_slug: string;
  level: number;
  children: RoleHierarchyNode[];
}

/**
 * Create role request
 */
export interface RoleCreate {
  role_name: string;
  role_slug: string;
  description?: string;
  parent_role_id?: number;
  level?: number;
  is_active?: boolean;
}

/**
 * Update role request
 */
export interface RoleUpdate {
  role_name?: string;
  description?: string;
  parent_role_id?: number;
  level?: number;
  is_active?: boolean;
}

/**
 * Role filters
 */
export interface RoleFilters {
  search?: string;
  is_active?: boolean;
  is_system_role?: boolean;
  parent_role_id?: number;
  level?: number;
}

/**
 * Role list response
 */
export interface RoleListResponse {
  roles: Role[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Role statistics
 */
export interface RoleStatistics {
  total_roles: number;
  active_roles: number;
  system_roles: number;
  custom_roles: number;
  roles_by_level: Record<string, number>;
}

/**
 * Permission entity
 */
export interface RolePermission {
  id: number;
  permission_name: string;
  permission_slug: string;
  category: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Permission filters
 */
export interface PermissionFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
}

/**
 * Permission list response
 */
export interface PermissionListResponse {
  permissions: RolePermission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Permission statistics
 */
export interface PermissionStatistics {
  total_permissions: number;
  active_permissions: number;
  permissions_by_category: Record<string, number>;
}

/**
 * Assign permissions to role request
 */
export interface RolePermissionAssign {
  permission_ids: number[];
}

// ==================== FEATURE FLAGS TYPES ====================

/**
 * Feature flag entity
 */
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number; // 0-100
  user_segments?: string[];
  conditions?: Record<string, any>;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create feature flag request
 */
export interface FeatureFlagCreate {
  name: string;
  key: string;
  description?: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  user_segments?: string[];
  conditions?: Record<string, any>;
}

/**
 * Update feature flag request
 */
export interface FeatureFlagUpdate {
  name?: string;
  description?: string;
  is_enabled?: boolean;
  rollout_percentage?: number;
  user_segments?: string[];
  conditions?: Record<string, any>;
}

/**
 * Feature flag filters
 */
export interface FeatureFlagFilters {
  is_enabled?: boolean;
  user_segment?: string;
  search?: string;
}

/**
 * Feature flag list response
 */
export interface FeatureFlagListResponse {
  items: FeatureFlag[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * Toggle feature flag request
 */
export interface FeatureFlagToggleRequest {
  is_enabled: boolean;
}

/**
 * Toggle feature flag response
 */
export interface FeatureFlagToggleResponse {
  id: string;
  key: string;
  is_enabled: boolean;
  message: string;
}

// ==================== ADDRESS MANAGEMENT TYPES ====================

export type OwnerType = 'admin' | 'provider' | 'customer';

/**
 * Address entity
 */
export interface Address {
  id: string;
  owner_user_id: string;
  owner_type: OwnerType;
  label?: string; // e.g., Home, Office
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contact_name?: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  // Detailed response fields
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
}

/**
 * Create address request
 */
export interface AddressCreate {
  owner_user_id: string;
  owner_type: OwnerType;
  label?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string; // defaults to "India"
  contact_name?: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

/**
 * Update address request
 */
export interface AddressUpdate {
  label?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  contact_name?: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Address filters
 */
export interface AddressFilters {
  search?: string;
  owner_user_id?: string;
  owner_type?: OwnerType;
  city?: string;
  state?: string;
  pincode?: string;
  is_verified?: boolean;
  is_default?: boolean;
}

/**
 * Address list response
 */
export interface AddressListResponse {
  addresses: Address[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Address statistics
 */
export interface AddressStatistics {
  total_addresses: number;
  verified_addresses: number;
  unverified_addresses: number;
  default_addresses: number;
  addresses_by_owner_type: Record<string, number>;
  addresses_by_state: Record<string, number>;
  addresses_by_city: Record<string, number>;
}

/**
 * Address verification request
 */
export interface AddressVerify {
  latitude: number;
  longitude: number;
  verification_notes?: string;
}

/**
 * Address verification response
 */
export interface AddressVerificationResponse {
  address_id: string;
  is_verified: boolean;
  verified_at: string;
  latitude: number;
  longitude: number;
  verification_notes?: string;
}

/**
 * Set default address request
 */
export interface SetDefaultRequest {
  user_id: string;
  owner_type: OwnerType;
}

/**
 * Bulk import single address item
 */
export interface AddressBulkImportItem {
  owner_user_id: string;
  owner_type: OwnerType;
  label?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  contact_name?: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Bulk import request
 */
export interface AddressBulkImport {
  addresses: AddressBulkImportItem[];
}

/**
 * Bulk import result
 */
export interface AddressBulkImportResult {
  total_submitted: number;
  successful_imports: number;
  failed_imports: number;
  imported_addresses: Address[];
  errors: Array<Record<string, any>>;
}

// ==================== BASE TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// ==================== AUTHENTICATION TYPES ====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AdminProfile;
  login_time: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  session_info: {
    device_type: string;
    device_name: string;
    location: string;
    ip_address: string;
    session_token: string;
    is_local: boolean;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  department?: string;
  employee_id?: string;
  can_manage_users: boolean;
  can_manage_system: boolean;
  can_view_reports: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  // Added for AuthUser compatibility
  role: 'super_admin' | 'admin' | 'manager' | 'support';
  permissions: Permission[];
}

// ==================== USER TYPES ====================

export interface User {
  user_id: string;
  id: string;
  email: string;
  username: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  role: 'admin' | 'customer' | 'manager' | 'provider' | 'artist';
  department: string;
  employee_id: string;
  can_manage_users: boolean;
  can_manage_system: boolean;
  can_view_reports: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'support' | 'moderator';
}

export interface UpdateUserRequest {
  full_name?: string;
  department?: string;
  phone?: string;
  can_manage_users?: boolean;
  can_manage_system?: boolean;
  can_view_reports?: boolean;
}

export interface UserDashboardStats {
  total_admin_users: number;
  total_provider_users: number;
  total_customers: number;
  active_sessions: number;
  recent_logins: number;
  system_alerts: number;
  // Additional fields for the component
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  verified_users: number;
}

// Alias for backward compatibility
export type DashboardStats = UserDashboardStats;

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
  reason?: string;
}

export interface BulkUserAction {
  user_ids: string[];
  action: 'suspend' | 'activate' | 'delete';
  reason?: string;
  notify_users?: boolean;
  suspend_duration_days?: number;
}

export interface UserFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
  role?: 'admin' | 'customer' | 'manager' | 'provider' | 'artist';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  is_verified?: boolean;
}

// Alias for backward compatibility
export type UserListFilters = UserFilters;

// ==================== BOOKING TYPES ====================

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BookingStatusUpdate {
  status: 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  refund_amount?: number;
}

export interface CreateBookingRequest {
  customer_id: string;
  provider_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateBookingRequest {
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface BookingFilters {
  page?: number;
  page_size?: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  customer_id?: string;
  provider_id?: string;
  service_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// Alias for backward compatibility
export type BookingListFilters = BookingFilters;

export interface BookingStatistics {
  total_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_booking_value: number;
}

export interface BookingDispute {
  resolution: 'partial_refund' | 'full_refund' | 'no_refund';
  refund_percentage?: number;
  admin_notes: string;
  notify_customer?: boolean;
  notify_provider?: boolean;
  resolution_details?: string;
}

// ==================== ANALYTICS TYPES ====================

export interface DashboardOverview {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  active_providers: number;
  pending_verifications: number;
  open_tickets: number;
  monthly_growth: number;
  revenue_trend: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  registrations: number;
  active_users: number;
  user_retention: number;
  growth_rate: number;
  demographic_breakdown: {
    age_groups: Array<{
      range: string;
      count: number;
    }>;
    locations: Array<{
      city: string;
      count: number;
    }>;
  };
}

export interface BookingAnalytics {
  booking_trends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  service_popularity: Array<{
    service_type: string;
    booking_count: number;
    revenue: number;
  }>;
  peak_hours: Array<{
    hour: number;
    booking_count: number;
  }>;
}

export interface FinancialReport {
  total_revenue: number;
  total_commissions: number;
  total_refunds: number;
  net_revenue: number;
  platform_fees_collected: number;
  payment_method_breakdown: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

// ==================== PAYMENT TYPES ====================

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  amount: number;
  reason: string;
  refund_type: 'full' | 'partial';
  admin_notes?: string;
  notify_customer?: boolean;
  processing_fee_waived?: boolean;
}

export interface PaymentDispute {
  id: string;
  payment_id: string;
  status: 'open' | 'in_progress' | 'resolved';
  reason: string;
  created_at: string;
}

export interface DisputeResolution {
  resolution: 'favor_customer' | 'favor_merchant' | 'partial_refund';
  refund_amount?: number;
  admin_notes: string;
}

// ==================== SYSTEM CONFIGURATION TYPES ====================

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
  category: string;
}

// Alias for backward compatibility
export type SystemSettings = SystemSetting[];

export interface PlatformFees {
  artist_commission_rate: number;
  platform_fee_rate: number;
  payment_processing_fee: number;
  cancellation_fee: number;
  minimum_booking_amount: number;
}

export interface EmailTemplate {
  type: string;
  subject: string;
  html_content: string;
  text_content: string;
  is_active: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database: boolean;
  redis: boolean;
  external_apis: boolean;
  disk_space: number;
  memory_usage: number;
  cpu_usage: number;
}

// ==================== SUPPORT TYPES ====================

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// Support Ticket Filters
export interface SupportTicketFilters {
  search?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_agent_id?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Create Support Ticket Request
export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  customer_id?: string;
  assigned_to?: string;
  status?: 'open' | 'in_progress';
  tags?: string[];
}

// Update Support Ticket Request
export interface UpdateSupportTicketRequest {
  subject?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution?: string;
  resolved_at?: string;
  priority_change_reason?: string;
}

// Support Ticket Comment
export interface SupportTicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  user_name: string;
  user_type: 'admin' | 'agent' | 'customer';
  content: string;
  is_internal: boolean;
  created_at: string;
  attachments?: string[];
}

// Create Comment Request
export interface CreateCommentRequest {
  content: string;
  is_internal?: boolean;
  attachments?: string[];
}

export interface TicketReply {
  message: string;
  is_internal: boolean;
  send_email_notification?: boolean;
  escalate_to_supervisor?: boolean;
  attachments?: string[];
  reply_type?: 'response' | 'resolution' | 'escalation';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category_id: number;
  order: number;
  is_published: boolean;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
}

// ==================== REVIEW TYPES ====================

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewModeration {
  status: 'approved' | 'rejected';
  admin_notes?: string;
}

export interface BulkReviewModeration {
  review_ids: string[];
  action: 'approve' | 'reject';
  admin_notes?: string;
  notify_reviewers?: boolean;
  notify_providers?: boolean;
}

// ==================== PROMOTION TYPES ====================

export interface PromotionCampaign {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'bonus' | 'referral';
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  target_audience: string;
  usage_limit: number;
  promo_code?: string;
  is_active: boolean;
}

export interface CouponCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_limit: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  minimum_amount: number;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  total_rewards_given: number;
  conversion_rate: number;
}

export interface ReferralConfig {
  referrer_reward_type: 'percentage' | 'fixed';
  referrer_reward_value: number;
  referee_reward_type: 'percentage' | 'fixed';
  referee_reward_value: number;
  minimum_booking_amount: number;
  is_active: boolean;
}

// ==================== ARTIST VERIFICATION TYPES ====================

export interface VerificationRequest {
  id: string;
  artist_id: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_type: 'identity' | 'business' | 'portfolio';
  documents: Array<{
    type: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export interface VerificationDecision {
  decision: 'approved' | 'rejected';
  verification_badge?: 'verified_pro' | 'verified_business';
  notes: string;
}

export interface PortfolioImage {
  id: string;
  artist_id: string;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

// ==================== ADMIN USER MANAGEMENT ====================

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'super_admin' | 'admin' | 'moderator';
  department?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_activity?: string;
}

export interface CreateAdminUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  department?: string;
  phone?: string;
  send_welcome_email?: boolean;
}

export interface UpdateAdminUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  department?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AdminUserFilters {
  role?: 'super_admin' | 'admin' | 'moderator';
  status?: 'active' | 'inactive' | 'suspended';
  department?: string;
  search?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AdminUserSession {
  id: string;
  admin_user_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  location?: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// ==================== EXPORT TYPES ====================

export interface ExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  include_fields?: string[];
}

export interface CustomReportRequest {
  report_type: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  metrics: string[];
  filters: Record<string, any>;
  format: 'excel' | 'pdf' | 'csv';
  include_charts?: boolean;
}

// ==================== COMMON QUERY PARAMS ====================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export type QueryParams = PaginationParams & SortParams & SearchParams & DateRangeParams;

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  title: string;
  message: string;
  recipient_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'clicked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  template_id?: string;
  metadata?: Record<string, any>;
  scheduled_for?: string;
  sent_at?: string;
  delivered_at?: string;
  clicked_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  subject?: string; // For email templates
  title?: string; // For push/in-app templates
  body: string;
  html_body?: string; // For email templates
  variables: string[]; // Available template variables
  is_active: boolean;
  is_default: boolean;
  preview_data?: Record<string, any>; // Sample data for preview
  metadata?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'push' | 'sms' | 'mixed';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  template_id: string;
  target_audience: {
    user_segments: string[];
    filters?: {
      user_role?: string[];
      registration_date_from?: string;
      registration_date_to?: string;
      last_login_from?: string;
      last_login_to?: string;
      booking_count_min?: number;
      booking_count_max?: number;
      total_spent_min?: number;
      total_spent_max?: number;
    };
    exclude_unsubscribed?: boolean;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    scheduled_for?: string;
    timezone?: string;
    recurring_pattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number; // Every N days/weeks/months
      days_of_week?: number[]; // For weekly (0=Sunday, 6=Saturday)
      day_of_month?: number; // For monthly
    };
    end_date?: string;
  };
  personalization?: Record<string, any>;
  tracking: {
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    clicked_count: number;
    failed_count: number;
    unsubscribe_count: number;
    conversion_count: number;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: {
    booking_confirmations: boolean;
    booking_reminders: boolean;
    booking_cancellations: boolean;
    payment_confirmations: boolean;
    payment_failures: boolean;
    system_updates: boolean;
    marketing_emails: boolean;
    security_alerts: boolean;
  };
  push_notifications: {
    booking_updates: boolean;
    payment_updates: boolean;
    system_notifications: boolean;
    marketing_notifications: boolean;
  };
  sms_notifications: {
    booking_reminders: boolean;
    security_alerts: boolean;
    urgent_updates: boolean;
  };
  frequency_limits: {
    marketing_max_per_week: number;
    system_max_per_day: number;
  };
  unsubscribed_from: string[]; // List of campaign types
  created_at: string;
  updated_at: string;
}

export interface NotificationAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  overview: {
    total_sent: number;
    total_delivered: number;
    total_clicked: number;
    total_failed: number;
    delivery_rate: number;
    click_rate: number;
    failure_rate: number;
  };
  by_type: {
    email: NotificationStats;
    push: NotificationStats;
    sms: NotificationStats;
    in_app: NotificationStats;
  };
  by_category: {
    booking: NotificationStats;
    payment: NotificationStats;
    system: NotificationStats;
    marketing: NotificationStats;
    security: NotificationStats;
  };
  trends: {
    daily_stats: Array<{
      date: string;
      sent: number;
      delivered: number;
      clicked: number;
      failed: number;
    }>;
  };
  top_performing: {
    templates: Array<{
      template_id: string;
      template_name: string;
      sent_count: number;
      click_rate: number;
    }>;
    campaigns: Array<{
      campaign_id: string;
      campaign_name: string;
      sent_count: number;
      conversion_rate: number;
    }>;
  };
}

interface NotificationStats {
  sent: number;
  delivered: number;
  clicked: number;
  failed: number;
  delivery_rate: number;
  click_rate: number;
}

// Response types for notifications
export interface NotificationListResponse extends PaginatedResponse<Notification> {}
export interface NotificationTemplateListResponse extends PaginatedResponse<NotificationTemplate> {}
export interface NotificationCampaignListResponse extends PaginatedResponse<NotificationCampaign> {}

// Request types for notifications
export interface CreateNotificationRequest {
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  title: string;
  message: string;
  recipient_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  template_id?: string;
  metadata?: Record<string, any>;
  scheduled_for?: string;
}

export interface CreateNotificationTemplateRequest {
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  subject?: string;
  title?: string;
  body: string;
  html_body?: string;
  variables?: string[];
  is_active?: boolean;
  is_default?: boolean;
  preview_data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateNotificationCampaignRequest {
  name: string;
  description?: string;
  type: 'email' | 'push' | 'sms' | 'mixed';
  template_id: string;
  target_audience: NotificationCampaign['target_audience'];
  schedule: NotificationCampaign['schedule'];
  personalization?: Record<string, any>;
}

// ==================== CONTENT MANAGEMENT TYPES ====================

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: 'page' | 'blog_post' | 'announcement' | 'help_article' | 'landing_page' | 'email_template';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility: 'public' | 'private' | 'members_only';
  featured_image?: string;
  gallery_images?: string[];
  seo: {
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
    canonical_url?: string;
    robots_meta?: string;
  };
  categories: string[];
  tags: string[];
  author_id: string;
  author_name: string;
  published_at?: string;
  scheduled_for?: string;
  view_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;
  reading_time?: number; // in minutes
  language: string;
  translations?: Record<string, string>; // language code -> content_id
  template_id?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  content_count: number;
  is_active: boolean;
  seo: {
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ContentTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  content_count: number;
  created_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  title?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  file_size: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for video/audio files in seconds
  url: string;
  thumbnail_url?: string;
  folder_id?: string;
  folder_path?: string;
  tags: string[];
  metadata?: Record<string, any>;
  uploaded_by: string;
  upload_date: string;
  last_accessed?: string;
  access_count: number;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id?: string;
  path: string;
  description?: string;
  file_count: number;
  size: number; // total size in bytes
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'page' | 'blog_post' | 'announcement' | 'help_article' | 'landing_page' | 'email_template';
  content_structure: {
    sections: Array<{
      id: string;
      type: 'text' | 'image' | 'video' | 'gallery' | 'form' | 'cta' | 'testimonial' | 'faq';
      title: string;
      content?: string;
      settings?: Record<string, any>;
    }>;
  };
  style_settings: {
    theme?: string;
    colors?: Record<string, string>;
    typography?: Record<string, any>;
    layout?: Record<string, any>;
  };
  default_seo: Partial<ContentItem['seo']>;
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentAnalytics {
  content_id: string;
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    views: number;
    unique_views: number;
    likes: number;
    shares: number;
    comments: number;
    time_spent: number; // average time in seconds
    bounce_rate: number;
    conversion_rate?: number;
  };
  traffic_sources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  geographic_data: Array<{
    country: string;
    visits: number;
    percentage: number;
  }>;
  device_breakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trending_score: number;
  engagement_score: number;
}

export interface ContentSchedule {
  id: string;
  content_id: string;
  action: 'publish' | 'unpublish' | 'update' | 'delete';
  scheduled_for: string;
  timezone: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  execution_log?: string;
  created_by: string;
  created_at: string;
  executed_at?: string;
}

export interface SEOAnalysis {
  content_id: string;
  analysis_date: string;
  overall_score: number; // 0-100
  issues: Array<{
    severity: 'error' | 'warning' | 'info';
    category: 'meta' | 'content' | 'technical' | 'readability';
    message: string;
    suggestion?: string;
  }>;
  keyword_analysis: {
    focus_keyword?: string;
    keyword_density: number;
    keyword_distribution: 'good' | 'low' | 'high';
    related_keywords: string[];
  };
  readability: {
    score: number;
    level: 'very_easy' | 'easy' | 'fairly_easy' | 'standard' | 'fairly_difficult' | 'difficult' | 'very_difficult';
    avg_sentence_length: number;
    avg_word_length: number;
    passive_voice_percentage: number;
  };
  technical_seo: {
    meta_title_length: number;
    meta_description_length: number;
    heading_structure: 'good' | 'needs_improvement';
    image_alt_text_coverage: number;
    internal_links: number;
    external_links: number;
  };
}

export interface ContentWorkflow {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    type: 'review' | 'approval' | 'edit' | 'seo_check' | 'publish';
    assignee_role?: string;
    assignee_id?: string;
    auto_advance: boolean;
    conditions?: Record<string, any>;
  }>;
  content_types: ContentItem['type'][];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContentReview {
  id: string;
  content_id: string;
  workflow_step_id: string;
  reviewer_id: string;
  reviewer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  comments?: string;
  changes_requested?: Array<{
    section: string;
    comment: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  reviewed_at: string;
  due_date?: string;
}

// Response types for content management
export interface ContentListResponse extends PaginatedResponse<ContentItem> {
  filters?: {
    categories: ContentCategory[];
    tags: ContentTag[];
    authors: Array<{ id: string; name: string }>;
  };
}

export interface MediaLibraryResponse extends PaginatedResponse<MediaFile> {
  folders: MediaFolder[];
  total_size: number;
  total_files: number;
}

export interface ContentTemplateListResponse extends PaginatedResponse<ContentTemplate> {}

// Request types for content management
export interface CreateContentRequest {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  type: ContentItem['type'];
  status?: ContentItem['status'];
  visibility?: ContentItem['visibility'];
  featured_image?: string;
  gallery_images?: string[];
  seo?: Partial<ContentItem['seo']>;
  categories?: string[];
  tags?: string[];
  scheduled_for?: string;
  template_id?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  id: string;
}

export interface CreateMediaRequest {
  file: File;
  title?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  folder_id?: string;
  tags?: string[];
}

export interface CreateContentTemplateRequest {
  name: string;
  description?: string;
  type: ContentTemplate['type'];
  content_structure: ContentTemplate['content_structure'];
  style_settings?: ContentTemplate['style_settings'];
  default_seo?: Partial<ContentItem['seo']>;
}

export interface BulkContentOperation {
  action: 'publish' | 'unpublish' | 'delete' | 'update_category' | 'update_tags';
  content_ids: string[];
  parameters?: Record<string, any>;
}

// ==================== API INTEGRATION FRAMEWORK TYPES ====================

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key_preview: string; // first 8 chars + asterisks
  permissions: string[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  };
  usage_stats: {
    total_requests: number;
    requests_today: number;
    last_used_at?: string;
    rate_limit_hits: number;
  };
  restrictions: {
    ip_whitelist?: string[];
    allowed_origins?: string[];
    allowed_endpoints?: string[];
  };
  status: 'active' | 'suspended' | 'revoked';
  expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_rotated_at?: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  description?: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  timeout: number; // seconds
  retry_config: {
    max_retries: number;
    retry_delay: number; // seconds
    backoff_strategy: 'linear' | 'exponential';
  };
  filters?: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with';
      value: string;
    }>;
    logic: 'and' | 'or';
  };
  status: 'active' | 'paused' | 'failed';
  stats: {
    total_deliveries: number;
    successful_deliveries: number;
    failed_deliveries: number;
    last_delivery_at?: string;
    average_response_time: number; // milliseconds
  };
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  response_status?: number;
  response_body?: string;
  response_time?: number; // milliseconds
  attempts: number;
  status: 'pending' | 'delivered' | 'failed' | 'abandoned';
  error_message?: string;
  scheduled_at: string;
  delivered_at?: string;
  created_at: string;
}

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'email' | 'sms' | 'analytics' | 'storage' | 'social' | 'crm' | 'other';
  description?: string;
  logo_url?: string;
  config: {
    base_url?: string;
    auth_type: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token';
    credentials: Record<string, string>; // encrypted in storage
    settings?: Record<string, any>;
  };
  capabilities: string[];
  endpoints: Array<{
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    description?: string;
    rate_limit?: number;
  }>;
  health_check: {
    endpoint?: string;
    method?: string;
    expected_status: number;
    timeout: number;
    last_check_at?: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    error_message?: string;
  };
  usage_stats: {
    total_requests: number;
    requests_today: number;
    success_rate: number;
    average_response_time: number;
    last_request_at?: string;
  };
  status: 'active' | 'inactive' | 'error' | 'setup_required';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  name: string;
  description?: string;
  category: string;
  version: string;
  public: boolean;
  deprecated: boolean;
  deprecation_date?: string;
  replacement_endpoint?: string;
  authentication_required: boolean;
  permissions_required: string[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    location: 'query' | 'path' | 'body' | 'header';
    required: boolean;
    description?: string;
    example?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      enum?: string[];
    };
  }>;
  responses: Array<{
    status_code: number;
    description: string;
    schema?: Record<string, any>;
    example?: any;
  }>;
  examples: Array<{
    name: string;
    description?: string;
    request: Record<string, any>;
    response: Record<string, any>;
  }>;
  usage_stats: {
    total_requests: number;
    requests_today: number;
    average_response_time: number;
    error_rate: number;
    last_request_at?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ApiRequest {
  id: string;
  endpoint_id?: string;
  api_key_id?: string;
  integration_id?: string;
  method: string;
  path: string;
  query_params?: Record<string, string>;
  headers: Record<string, string>;
  body?: Record<string, any>;
  response_status: number;
  response_body?: Record<string, any>;
  response_time: number; // milliseconds
  response_size: number; // bytes
  ip_address: string;
  user_agent?: string;
  user_id?: string;
  error_message?: string;
  rate_limited: boolean;
  cached_response: boolean;
  timestamp: string;
}

export interface ApiAnalytics {
  period: {
    start_date: string;
    end_date: string;
  };
  overview: {
    total_requests: number;
    successful_requests: number;
    error_requests: number;
    average_response_time: number;
    data_transferred: number; // bytes
    unique_users: number;
    unique_ips: number;
  };
  endpoints: Array<{
    endpoint_id: string;
    path: string;
    method: string;
    requests: number;
    success_rate: number;
    average_response_time: number;
    error_rate: number;
  }>;
  status_codes: Record<string, number>;
  response_times: Array<{
    timestamp: string;
    average: number;
    p50: number;
    p95: number;
    p99: number;
  }>;
  geographic_data: Array<{
    country: string;
    requests: number;
    percentage: number;
  }>;
  top_users: Array<{
    user_id?: string;
    api_key_id?: string;
    requests: number;
    data_transferred: number;
  }>;
  errors: Array<{
    error_type: string;
    count: number;
    percentage: number;
    sample_message?: string;
  }>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  description: string;
  category: 'user' | 'booking' | 'payment' | 'content' | 'system' | 'other';
  payload_schema: Record<string, any>;
  example_payload: Record<string, any>;
  frequency: 'rare' | 'occasional' | 'frequent' | 'very_frequent';
  retention_period: number; // days
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiDocumentation {
  id: string;
  title: string;
  description: string;
  version: string;
  base_url: string;
  authentication: {
    type: 'api_key' | 'oauth2' | 'basic_auth';
    description: string;
    example: string;
  };
  sections: Array<{
    id: string;
    title: string;
    description: string;
    endpoints: string[]; // endpoint IDs
    order: number;
  }>;
  changelog: Array<{
    version: string;
    date: string;
    changes: Array<{
      type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed';
      description: string;
    }>;
  }>;
  code_examples: Record<string, string>; // language -> example code
  sdk_links: Array<{
    language: string;
    name: string;
    url: string;
    version: string;
  }>;
  published: boolean;
  last_updated: string;
  created_at: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  logo_url?: string;
  setup_steps: Array<{
    step: number;
    title: string;
    description: string;
    fields: Array<{
      name: string;
      type: 'text' | 'password' | 'url' | 'select' | 'boolean';
      label: string;
      placeholder?: string;
      required: boolean;
      options?: Array<{ value: string; label: string }>;
    }>;
  }>;
  test_endpoints: Array<{
    name: string;
    method: string;
    path: string;
    expected_status: number;
  }>;
  webhook_events?: string[];
  documentation_url?: string;
  support_url?: string;
  popular: boolean;
  featured: boolean;
  installation_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface RateLimitRule {
  id: string;
  name: string;
  description?: string;
  scope: 'global' | 'user' | 'api_key' | 'ip' | 'endpoint';
  limits: {
    requests_per_minute?: number;
    requests_per_hour?: number;
    requests_per_day?: number;
    concurrent_requests?: number;
  };
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
    value: string | string[];
  }>;
  actions: {
    block: boolean;
    delay?: number; // seconds
    custom_response?: {
      status: number;
      message: string;
    };
  };
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Response types for API Integration
export interface ApiKeysResponse extends PaginatedResponse<ApiKey> {}
export interface WebhookEndpointsResponse extends PaginatedResponse<WebhookEndpoint> {}
export interface WebhookDeliveriesResponse extends PaginatedResponse<WebhookDelivery> {}
export interface ThirdPartyIntegrationsResponse extends PaginatedResponse<ThirdPartyIntegration> {}
export interface ApiEndpointsResponse extends PaginatedResponse<ApiEndpoint> {}
export interface ApiRequestsResponse extends PaginatedResponse<ApiRequest> {}
export interface WebhookEventsResponse extends PaginatedResponse<WebhookEvent> {}
export interface IntegrationTemplatesResponse extends PaginatedResponse<IntegrationTemplate> {}
export interface RateLimitRulesResponse extends PaginatedResponse<RateLimitRule> {}

// Request types for API Integration
export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions: string[];
  rate_limit?: Partial<ApiKey['rate_limit']>;
  restrictions?: Partial<ApiKey['restrictions']>;
  expires_at?: string;
}

export interface UpdateApiKeyRequest extends Partial<CreateApiKeyRequest> {
  id: string;
}

export interface CreateWebhookEndpointRequest {
  name: string;
  url: string;
  description?: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retry_config?: Partial<WebhookEndpoint['retry_config']>;
  filters?: WebhookEndpoint['filters'];
}

export interface UpdateWebhookEndpointRequest extends Partial<CreateWebhookEndpointRequest> {
  id: string;
}

export interface CreateThirdPartyIntegrationRequest {
  name: string;
  provider: string;
  type: ThirdPartyIntegration['type'];
  description?: string;
  config: ThirdPartyIntegration['config'];
  template_id?: string;
}

export interface UpdateThirdPartyIntegrationRequest extends Partial<CreateThirdPartyIntegrationRequest> {
  id: string;
}

export interface TestIntegrationRequest {
  integration_id: string;
  endpoint_name?: string;
  test_data?: Record<string, any>;
}

export interface CreateRateLimitRuleRequest {
  name: string;
  description?: string;
  scope: RateLimitRule['scope'];
  limits: RateLimitRule['limits'];
  conditions?: RateLimitRule['conditions'];
  actions?: Partial<RateLimitRule['actions']>;
  priority?: number;
}

export interface BulkApiKeyOperation {
  action: 'revoke' | 'suspend' | 'activate' | 'rotate';
  api_key_ids: string[];
}

// ==================== ADVANCED ANALYTICS & REPORTING TYPES ====================

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'standard' | 'custom' | 'scheduled' | 'dashboard';
  status: 'draft' | 'active' | 'archived' | 'error';
  category: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
  is_public: boolean;
  config: ReportConfig;
  metadata: ReportMetadata;
  permissions: ReportPermissions;
}

export interface ReportConfig {
  data_sources: DataSource[];
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters: ReportFilter[];
  grouping: ReportGrouping[];
  sorting: ReportSorting[];
  visualization: VisualizationConfig;
  export_settings: ExportSettings;
  schedule?: ScheduleConfig;
  cache_duration?: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'external';
  connection_string?: string;
  query?: string;
  refresh_interval?: number;
  last_updated?: string;
  schema: DataSourceSchema[];
}

export interface DataSourceSchema {
  field_name: string;
  field_type: 'string' | 'number' | 'date' | 'boolean' | 'json';
  is_nullable: boolean;
  description?: string;
  sample_values?: string[];
}

export interface ReportMetric {
  id: string;
  name: string;
  expression: string;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct' | 'custom';
  format_type: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes';
  decimal_places?: number;
  prefix?: string;
  suffix?: string;
  target_value?: number;
  threshold_values?: {
    warning: number;
    critical: number;
  };
}

export interface ReportDimension {
  id: string;
  name: string;
  field_name: string;
  data_type: string;
  grouping_type?: 'date' | 'text' | 'numeric' | 'boolean';
  date_format?: string;
  is_hierarchical?: boolean;
  hierarchy_level?: number;
}

export interface ReportFilter {
  id: string;
  field_name: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 
           'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null' |
           'regex' | 'date_range' | 'relative_date';
  value: any;
  values?: any[];
  is_dynamic?: boolean;
  parameter_name?: string;
}

export interface ReportGrouping {
  dimension_id: string;
  sort_order: 'asc' | 'desc';
  limit?: number;
  include_others?: boolean;
}

export interface ReportSorting {
  field_name: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface VisualizationConfig {
  chart_type: 'table' | 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge' | 
             'funnel' | 'treemap' | 'sankey' | 'waterfall' | 'bullet' | 'radar';
  layout: {
    width: number;
    height: number;
    responsive: boolean;
  };
  styling: {
    color_palette: string[];
    theme: 'light' | 'dark' | 'custom';
    custom_css?: string;
  };
  axes?: {
    x_axis: AxisConfig;
    y_axis: AxisConfig;
  };
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  interaction?: InteractionConfig;
}

export interface AxisConfig {
  title: string;
  scale_type: 'linear' | 'log' | 'time' | 'category';
  min_value?: number;
  max_value?: number;
  tick_format?: string;
  grid_lines: boolean;
  zero_line: boolean;
}

export interface LegendConfig {
  position: 'top' | 'bottom' | 'left' | 'right' | 'none';
  orientation: 'horizontal' | 'vertical';
  clickable: boolean;
}

export interface TooltipConfig {
  enabled: boolean;
  format: string;
  custom_template?: string;
}

export interface InteractionConfig {
  zoom_enabled: boolean;
  pan_enabled: boolean;
  drill_down_enabled: boolean;
  cross_filter_enabled: boolean;
  export_enabled: boolean;
}

export interface ExportSettings {
  enabled_formats: ('pdf' | 'excel' | 'csv' | 'png' | 'svg' | 'json')[];
  include_metadata: boolean;
  include_filters: boolean;
  custom_styling?: {
    logo_url?: string;
    header_text?: string;
    footer_text?: string;
    color_scheme?: string;
  };
}

export interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  time_of_day: string; // HH:mm format
  timezone: string;
  days_of_week?: number[]; // 0-6, Sunday = 0
  days_of_month?: number[]; // 1-31
  cron_expression?: string;
  recipients: ScheduleRecipient[];
  delivery_method: 'email' | 'slack' | 'webhook' | 'ftp' | 's3';
  delivery_config: Record<string, any>;
}

export interface ScheduleRecipient {
  type: 'user' | 'group' | 'email';
  identifier: string;
  name: string;
}

export interface ReportMetadata {
  execution_stats?: {
    avg_execution_time: number;
    last_execution_time: number;
    total_executions: number;
    error_count: number;
    cache_hit_rate: number;
  };
  data_stats?: {
    row_count: number;
    column_count: number;
    data_size_bytes: number;
    last_updated: string;
  };
  usage_stats?: {
    view_count: number;
    export_count: number;
    share_count: number;
    last_accessed: string;
    unique_viewers: number;
  };
}

export interface ReportPermissions {
  owner_id: string;
  viewers: string[];
  editors: string[];
  is_public: boolean;
  sharing_settings: {
    allow_public_link: boolean;
    require_authentication: boolean;
    expire_date?: string;
    password_protected?: boolean;
  };
}

// Dashboard Types
export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  is_default: boolean;
  is_public: boolean;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: GlobalFilter[];
  theme: DashboardTheme;
  permissions: ReportPermissions;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
  view_count: number;
}

export interface DashboardLayout {
  grid_size: {
    columns: number;
    rows: number;
  };
  responsive_breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  auto_refresh: {
    enabled: boolean;
    interval: number; // seconds
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  description?: string;
  type: 'report' | 'metric' | 'chart' | 'table' | 'text' | 'image' | 'iframe';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  data_source?: DataSource;
  refresh_interval?: number;
  cache_duration?: number;
}

export interface WidgetConfig {
  report_id?: string;
  metric_config?: {
    value_expression: string;
    comparison_value?: string;
    comparison_type?: 'previous_period' | 'target' | 'benchmark';
    trend_analysis?: boolean;
    sparkline?: boolean;
  };
  styling?: {
    background_color?: string;
    text_color?: string;
    border_style?: string;
    custom_css?: string;
  };
  interaction?: {
    click_action?: 'drill_down' | 'navigate' | 'modal' | 'none';
    target_url?: string;
    target_report_id?: string;
  };
}

export interface GlobalFilter {
  id: string;
  name: string;
  type: 'date_range' | 'dropdown' | 'multiselect' | 'text' | 'number' | 'checkbox';
  field_name: string;
  default_value?: any;
  options?: FilterOption[];
  applies_to_widgets: string[];
}

export interface FilterOption {
  label: string;
  value: any;
  description?: string;
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    font_family: string;
    header_size: string;
    body_size: string;
  };
  spacing: {
    widget_margin: number;
    widget_padding: number;
  };
}

// Request/Response Types
export interface CreateReportRequest {
  name: string;
  description?: string;
  report_type: 'standard' | 'custom' | 'scheduled' | 'dashboard';
  category: string;
  tags?: string[];
  config: ReportConfig;
  is_public?: boolean;
  permissions?: Partial<ReportPermissions>;
}

export interface UpdateReportRequest extends Partial<CreateReportRequest> {
  id: string;
}

export interface ExecuteReportRequest {
  id: string;
  parameters?: Record<string, any>;
  format?: 'json' | 'csv' | 'excel' | 'pdf';
  use_cache?: boolean;
  cache_duration?: number;
}

export interface ReportExecutionResult {
  report_id: string;
  execution_id: string;
  status: 'success' | 'error' | 'timeout' | 'cancelled';
  data?: any[];
  metadata: {
    total_rows: number;
    execution_time: number;
    cache_used: boolean;
    data_freshness: string;
  };
  errors?: string[];
  warnings?: string[];
}

export interface CreateDashboardRequest {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  layout: DashboardLayout;
  widgets: Omit<DashboardWidget, 'id'>[];
  filters?: GlobalFilter[];
  theme?: DashboardTheme;
  is_public?: boolean;
  permissions?: Partial<ReportPermissions>;
}

export interface UpdateDashboardRequest extends Partial<CreateDashboardRequest> {
  id: string;
}

export interface AnalyticsOverview {
  total_reports: number;
  total_dashboards: number;
  total_executions_24h: number;
  avg_execution_time: number;
  cache_hit_rate: number;
  most_viewed_reports: AnalyticsReport[];
  recent_executions: ReportExecution[];
  system_performance: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    query_queue_length: number;
  };
}

export interface ReportExecution {
  id: string;
  report_id: string;
  report_name: string;
  executed_by: string;
  execution_time: number;
  status: 'success' | 'error' | 'timeout';
  row_count: number;
  cache_used: boolean;
  executed_at: string;
}

// Search and Filtering
export interface ReportSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  report_type?: 'standard' | 'custom' | 'scheduled' | 'dashboard';
  status?: 'draft' | 'active' | 'archived' | 'error';
  created_by?: string;
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'last_run_at' | 'view_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  created_by?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'view_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Export Types
export interface ExportJob {
  id: string;
  report_id: string;
  format: 'pdf' | 'excel' | 'csv' | 'png' | 'svg' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  file_url?: string;
  file_size?: number;
  created_by: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface BulkExportRequest {
  report_ids: string[];
  format: 'pdf' | 'excel' | 'csv' | 'zip';
  include_metadata: boolean;
  custom_styling?: ExportSettings['custom_styling'];
}

// ==================== SESSION MANAGEMENT TYPES ====================

export interface UserSession {
  id: string;
  user_id: string;
  user_type: 'admin' | 'provider' | 'customer';
  session_token: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  is_active: boolean;
  is_current: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface AdminSession extends UserSession {
  user_type: 'admin';
  admin_email: string;
  admin_name: string;
  permissions: string[];
  role: string;
}

export interface ProviderSession extends UserSession {
  user_type: 'provider';
  provider_email: string;
  provider_name: string;
  business_name?: string;
}

export interface CustomerSession extends UserSession {
  user_type: 'customer';
  customer_email: string;
  customer_name: string;
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  inactive_sessions: number;
  sessions_today: number;
  unique_users: number;
  avg_session_duration: number;
  top_devices: Array<{
    device_type: string;
    count: number;
  }>;
  top_locations: Array<{
    location: string;
    count: number;
  }>;
}

export interface SessionFilters {
  page?: number;
  page_size?: number;
  user_id?: string;
  is_active?: boolean;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  location?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface RevokeSessionRequest {
  reason?: string;
  notify_user?: boolean;
}

export interface RevokeAllSessionsRequest {
  reason: string;
  notify_user?: boolean;
  exclude_current?: boolean;
}

// ==================== FINANCIAL MANAGEMENT TYPES ====================

export type UserType = 'admin' | 'customer' | 'provider';
export type TransactionType = 'payment' | 'refund' | 'commission' | 'withdrawal' | 'deposit' | 'transfer' | 'adjustment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
export type WalletTransactionType = 'credit' | 'debit' | 'transfer' | 'refund' | 'commission' | 'withdrawal' | 'adjustment';

export interface FinancialTransaction {
  id: string;
  transaction_id: string;
  user_id: string;
  user_type: UserType;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  description: string;
  booking_id?: string;
  payment_method?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, any>;
  commission_amount?: number;
  commission_percentage?: number;
  net_amount?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTransactionRequest {
  user_id: string;
  user_type: UserType;
  transaction_type: TransactionType;
  amount: number;
  currency?: string;
  description: string;
  booking_id?: string;
  payment_method?: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  commission_percentage?: number;
  metadata?: Record<string, any>;
}

export interface UpdateTransactionRequest {
  status?: TransactionStatus;
  description?: string;
  gateway_response?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface FinancialTransactionFilters {
  page?: number;
  size?: number;
  user_id?: string;
  user_type?: UserType;
  transaction_type?: TransactionType;
  status?: TransactionStatus;
  booking_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface BulkTransactionRequest {
  transactions: CreateTransactionRequest[];
}

export interface BulkTransactionResponse {
  success: boolean;
  created_count: number;
  failed_count: number;
  created_ids: string[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

export interface BankAccount {
  id: string;
  account_id: string;
  user_id: string;
  user_type: UserType;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  account_type: 'checking' | 'savings' | 'business';
  currency: string;
  is_primary: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountRequest {
  user_id: string;
  user_type: UserType;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  account_type: 'checking' | 'savings' | 'business';
  currency?: string;
  is_primary?: boolean;
}

export interface UpdateBankAccountRequest {
  account_holder_name?: string;
  bank_name?: string;
  is_primary?: boolean;
  is_verified?: boolean;
}

export interface Wallet {
  id: string;
  wallet_id: string;
  user_id: string;
  user_type: UserType;
  balance: number;
  available_balance: number;
  pending_balance: number;
  currency: string;
  is_active: boolean;
  last_transaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletRequest {
  user_id: string;
  user_type: UserType;
  currency?: string;
  initial_balance?: number;
}

export interface UpdateWalletRequest {
  is_active?: boolean;
}

export interface WalletTransaction {
  id: string;
  transaction_id: string;
  wallet_id: string;
  transaction_type: WalletTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateWalletTransactionRequest {
  wallet_id: string;
  transaction_type: WalletTransactionType;
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
}

export interface ProviderEarnings {
  provider_id: string;
  provider_name: string;
  total_earnings: number;
  total_commission: number;
  net_earnings: number;
  total_bookings: number;
  completed_bookings: number;
  average_booking_value: number;
  period_start: string;
  period_end: string;
  currency: string;
  earnings_by_month: Array<{
    month: string;
    earnings: number;
    bookings: number;
  }>;
}

export interface MonthlyEarnings {
  month: string;
  year: number;
  total_earnings: number;
  commission: number;
  net_earnings: number;
  booking_count: number;
}

export interface TopEarner {
  provider_id: string;
  provider_name: string;
  business_name?: string;
  total_earnings: number;
  booking_count: number;
  average_rating?: number;
  rank: number;
}

export interface FinancialStatistics {
  total_revenue: number;
  total_commission: number;
  net_revenue: number;
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_refunds: number;
  refund_amount: number;
  average_transaction_value: number;
  currency: string;
  period: {
    start: string;
    end: string;
  };
}

export interface WalletStatistics {
  total_wallets: number;
  active_wallets: number;
  inactive_wallets: number;
  total_balance: number;
  total_available_balance: number;
  total_pending_balance: number;
  currency: string;
}

export interface TransactionStatistics {
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_volume: number;
  average_transaction_size: number;
  transactions_by_type: Record<TransactionType, number>;
  transactions_by_status: Record<TransactionStatus, number>;
  currency: string;
}

// ==================== AUDIT LOGS TYPES ====================

// User Activity Logs
export interface UserActivityLog {
  id: number;
  user_id: string;
  user_type: 'admin' | 'provider' | 'customer';
  activity_type: string;
  activity_category?: string;
  description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  session_id?: string;
  created_at: string;
}

export interface UserActivityLogFilters {
  user_id?: string;
  user_type?: string;
  activity_type?: string;
  activity_category?: string;
  created_from?: string;
  created_to?: string;
}

export interface ActivityLogStatistics {
  total_logs: number;
  by_user_type: Record<string, number>;
  by_activity_type: Record<string, number>;
  by_activity_category: Record<string, number>;
  by_user: Record<string, number>; // Top 10 most active users
  logs_per_day: Array<{
    date: string;
    count: number;
  }>;
  unique_users: number;
  unique_sessions: number;
}

// Customer Audit Logs
export interface CustomerAuditLog {
  id: number;
  customer_user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  created_at: string;
}

export interface CustomerAuditLogFilters {
  customer_user_id?: string;
  action?: string;
  entity?: string;
  entity_id?: string;
  created_from?: string;
  created_to?: string;
}

// Provider Audit Logs
export interface ProviderAuditLog {
  id: number;
  provider_user_id?: string;
  action: string;
  entity?: string;
  entity_id?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  created_at: string;
}

export interface ProviderAuditLogFilters {
  provider_user_id?: string;
  action?: string;
  entity?: string;
  entity_id?: string;
  created_from?: string;
  created_to?: string;
}

// Shared audit statistics
export interface AuditLogStatistics {
  total_logs: number;
  by_action: Record<string, number>;
  by_entity: Record<string, number>;
  by_user: Record<string, number>; // Top 10 most active users
  logs_per_day: Array<{
    date: string;
    count: number;
  }>;
}

// ==================== CAMPAIGN MANAGEMENT TYPES ====================

// Campaign types and statuses
export type CampaignType = 'promotional' | 'newsletter' | 'notification' | 'reminder';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
export type TargetAudience = 'all_users' | 'academies' | 'artists' | 'customers';

// Email Campaign
export interface EmailCampaign {
  id: string;
  campaign_name: string;
  campaign_type: CampaignType;
  subject_line: string;
  template_id?: string;
  sender_name: string;
  sender_email: string;
  target_audience: TargetAudience;
  segment_criteria?: Record<string, any>;
  campaign_status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignCreate {
  campaign_name: string;
  campaign_type: CampaignType;
  subject_line: string;
  template_id?: string;
  sender_name: string;
  sender_email: string;
  target_audience: TargetAudience;
  segment_criteria?: Record<string, any>;
  scheduled_at?: string;
}

export interface EmailCampaignUpdate {
  campaign_name?: string;
  campaign_type?: CampaignType;
  subject_line?: string;
  template_id?: string;
  sender_name?: string;
  sender_email?: string;
  target_audience?: TargetAudience;
  segment_criteria?: Record<string, any>;
  campaign_status?: CampaignStatus;
  scheduled_at?: string;
}

export interface EmailCampaignFilters {
  campaign_type?: CampaignType;
  campaign_status?: CampaignStatus;
  target_audience?: TargetAudience;
  created_by?: string;
  scheduled_from?: string;
  scheduled_to?: string;
}

export interface EmailCampaignStatistics {
  total_campaigns: number;
  draft_campaigns: number;
  scheduled_campaigns: number;
  sent_campaigns: number;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_unsubscribed: number;
  average_open_rate: number;
  average_click_rate: number;
}

export interface SendCampaignRequest {
  send_test?: boolean;
  test_emails?: string[];
}

// SMS Campaign
export interface SMSCampaign {
  id: string;
  campaign_name: string;
  campaign_type: CampaignType;
  message_content: string;
  target_audience: TargetAudience;
  segment_criteria?: Record<string, any>;
  campaign_status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SMSCampaignCreate {
  campaign_name: string;
  campaign_type: CampaignType;
  message_content: string;
  target_audience: TargetAudience;
  segment_criteria?: Record<string, any>;
  scheduled_at?: string;
}

export interface SMSCampaignUpdate {
  campaign_name?: string;
  campaign_type?: CampaignType;
  message_content?: string;
  target_audience?: TargetAudience;
  segment_criteria?: Record<string, any>;
  campaign_status?: CampaignStatus;
  scheduled_at?: string;
}

export interface SMSCampaignFilters {
  campaign_type?: CampaignType;
  campaign_status?: CampaignStatus;
  target_audience?: TargetAudience;
  created_by?: string;
  scheduled_from?: string;
  scheduled_to?: string;
}

export interface SMSCampaignStatistics {
  total_campaigns: number;
  draft_campaigns: number;
  scheduled_campaigns: number;
  sent_campaigns: number;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  average_delivery_rate: number;
}

export interface SendSMSCampaignRequest {
  send_test?: boolean;
  test_numbers?: string[];
}

// ==================== SUBSCRIPTION MANAGEMENT TYPES ====================

// Subscription types
export type SubscriptionPlan = 'premium' | 'elite';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'paused' | 'payment_failed';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type BillingCycle = 'monthly' | 'yearly';

// Subscription
export interface Subscription {
  id: string;
  provider_user_id: string;
  plan_type: SubscriptionPlan;
  plan_name: string;
  plan_price: number;
  billing_cycle: BillingCycle;
  commission_rate: number;
  features: Record<string, any>;
  start_date: string;
  end_date: string;
  current_period_start: string;
  current_period_end: string;
  razorpay_subscription_id?: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  payment_failed_count: number;
  created_at: string;
  updated_at: string;
  // Extended fields
  provider_name?: string;
  provider_email?: string;
  provider_phone?: string;
  days_remaining?: number;
  is_expiring_soon?: boolean;
}

export interface SubscriptionCreate {
  provider_user_id: string;
  plan_type: SubscriptionPlan;
  plan_name: string;
  plan_price: number;
  billing_cycle: BillingCycle;
  commission_rate: number;
  features: Record<string, any>;
  start_date: string;
  end_date: string;
  auto_renew?: boolean;
}

export interface SubscriptionUpdate {
  plan_type?: SubscriptionPlan;
  plan_name?: string;
  plan_price?: number;
  billing_cycle?: BillingCycle;
  commission_rate?: number;
  features?: Record<string, any>;
  auto_renew?: boolean;
  end_date?: string;
}

export interface SubscriptionFilters {
  search?: string;
  plan_type?: SubscriptionPlan;
  status?: SubscriptionStatus;
  auto_renew?: boolean;
  provider_user_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  expiring_in_days?: number;
}

export interface SubscriptionStatistics {
  total_subscriptions: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  expired_subscriptions: number;
  paused_subscriptions: number;
  payment_failed_subscriptions: number;
  subscriptions_by_plan: Record<string, number>;
  total_mrr: number; // Monthly Recurring Revenue
  total_arr: number; // Annual Recurring Revenue
  avg_subscription_value: number;
  churn_rate: number;
  renewal_rate: number;
  subscriptions_expiring_30_days: number;
  subscriptions_expiring_7_days: number;
}

export interface SubscriptionCancel {
  cancel_immediately?: boolean;
  reason?: string;
}

export interface SubscriptionRenew {
  new_end_date: string;
  payment_id?: string;
}

export interface ExpiringSubscription {
  subscription_id: string;
  provider_user_id: string;
  provider_name: string;
  provider_email: string;
  provider_phone: string;
  plan_name: string;
  plan_type: SubscriptionPlan;
  end_date: string;
  days_remaining: number;
  auto_renew: boolean;
  status: SubscriptionStatus;
}

// Subscription Payment
export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  provider_user_id: string;
  amount: number;
  currency: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  billing_period_start: string;
  billing_period_end: string;
  status: PaymentStatus;
  failure_reason?: string;
  retry_attempt: number;
  transaction_id?: string;
  payment_date: string;
  created_at: string;
}

export interface SubscriptionPaymentCreate {
  subscription_id: string;
  provider_user_id: string;
  amount: number;
  currency?: string;
  billing_period_start: string;
  billing_period_end: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  status?: PaymentStatus;
}

export interface SubscriptionRetryPayment {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
}

export interface PaymentStatistics {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_revenue: number;
  avg_payment_amount: number;
  payment_success_rate: number;
  total_failed_amount: number;
  payments_by_month: Record<string, number>;
}

// ==================== BUSINESS & COURSE CONTENT MANAGEMENT TYPES ====================

// Business (Salon/Academy)
export interface Business {
  id: string;
  salon_name?: string;
  academy_name?: string;
  salon_slug?: string;
  provider_user_id?: string;
  address_id?: string;
  commission_rate?: number;
  gst_number?: string;
  registration_number?: string;
  is_verified: boolean;
  is_active: boolean;
  business_hours?: string;
  branding?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessCreate {
  salon_name?: string;
  academy_name?: string;
  salon_slug?: string;
  provider_user_id?: string;
  address_id?: string;
  commission_rate?: number;
  gst_number?: string;
  registration_number?: string;
  business_hours?: string;
  branding?: string;
}

export interface BusinessUpdate extends Partial<BusinessCreate> {}

export interface BusinessFilters {
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
  commission_min?: number;
  commission_max?: number;
  created_from?: string;
  created_to?: string;
}

export interface BusinessStatistics {
  total_salons: number;
  active_salons: number;
  verified_salons: number;
  total_academies: number;
  active_academies: number;
  verified_academies: number;
  total_services: number;
  active_services: number;
  new_salons_this_month: number;
  new_academies_this_month: number;
}

export interface BusinessStatusUpdate {
  is_active?: boolean;
  is_verified?: boolean;
  reason?: string;
}

// Courses
export interface Course {
  id: string;
  course_name: string;
  course_code: string;
  category: string;
  level: string;
  description?: string;
  duration_weeks?: number;
  total_hours?: number;
  certificate_provided: boolean;
  prerequisites?: string;
  learning_outcomes?: string[];
  syllabus_url?: string;
  image_url?: string;
  suggested_price?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  course_name: string;
  course_code: string;
  category: string;
  level: string;
  description?: string;
  duration_weeks?: number;
  total_hours?: number;
  certificate_provided?: boolean;
  prerequisites?: string;
  learning_outcomes?: string[];
  syllabus_url?: string;
  image_url?: string;
  suggested_price?: number;
}

export interface CourseUpdate extends Partial<CourseCreate> {}

export interface CourseFilters {
  category?: string;
  level?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
}

export interface CourseStatistics {
  total_courses: number;
  active_courses: number;
  featured_courses: number;
  total_academy_courses: number;
  courses_by_category: Record<string, number>;
  courses_by_level: Record<string, number>;
}

// Academy Courses
export interface AcademyCourse {
  id: string;
  academy_id: string;
  course_id: string;
  custom_course_name?: string;
  custom_description?: string;
  duration_weeks?: number;
  total_hours?: number;
  price?: number;
  discount_price?: number;
  max_students?: number;
  is_available: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademyCourseCreate {
  academy_id: string;
  course_id: string;
  custom_course_name?: string;
  custom_description?: string;
  duration_weeks?: number;
  total_hours?: number;
  price?: number;
  discount_price?: number;
  max_students?: number;
  is_available?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface AcademyCourseFilters {
  academy_id?: string;
  course_id?: string;
  is_available?: boolean;
  category?: string;
  level?: string;
}

// ==================== ACADEMY STUDENT MANAGEMENT TYPES ====================

// Enums
export type RegistrationStatus = 'pending' | 'invited' | 'registered' | 'active' | 'graduated' | 'dropped_out' | 'suspended';
export type StudentType = 'regular' | 'scholarship' | 'exchange' | 'part_time' | 'full_time';
export type BulkStudentAction = 'send_invitation' | 'update_status' | 'graduate' | 'transfer_course' | 'send_notification';
export type StudentExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

// Academy Student
export interface AcademyStudent {
  id: string;
  academy_id: string;
  artist_user_id: string;
  course_id?: string;
  course_name: string;
  enrollment_date: string;
  graduation_date?: string;
  maya_registration_status: RegistrationStatus;
  invitation_sent: boolean;
  invitation_sent_at?: string;
  student_photo_url?: string;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  academy_name?: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  
  // Progress tracking (for detail view)
  progress_percentage?: number;
  attendance_percentage?: number;
  assignments_completed?: number;
  total_assignments?: number;
  average_grade?: number;
  skills_acquired?: string[];
  certifications?: any[];
  notes?: string;
  last_activity?: string;
}

export interface AcademyStudentCreate {
  academy_id: string;
  artist_user_id: string;
  course_id?: string;
  course_name: string;
  enrollment_date: string;
  graduation_date?: string;
  maya_registration_status?: RegistrationStatus;
  send_invitation?: boolean;
  student_photo_url?: string;
  notes?: string;
}

export interface AcademyStudentUpdate {
  course_id?: string;
  course_name?: string;
  enrollment_date?: string;
  graduation_date?: string;
  maya_registration_status?: RegistrationStatus;
  student_photo_url?: string;
  certificate_url?: string;
  notes?: string;
}

export interface AcademyStudentFilters {
  search?: string;
  academy_id?: string;
  course_id?: string;
  registration_status?: RegistrationStatus;
  invitation_sent?: boolean;
  has_graduated?: boolean;
  enrolled_after?: string;
  enrolled_before?: string;
  graduation_after?: string;
  graduation_before?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Student Status Management
export interface StudentStatusUpdate {
  status: RegistrationStatus;
  reason?: string;
  notes?: string;
  send_notification?: boolean;
  update_graduation_date?: boolean;
  graduation_date?: string;
}

export interface StudentInvitation {
  student_ids: string[];
  custom_message?: string;
  include_course_details?: boolean;
  include_academy_info?: boolean;
}

// Bulk Operations
export interface BulkStudentOperation {
  student_ids: string[];
  action: BulkStudentAction;
  reason?: string;
  new_status?: RegistrationStatus;
  new_course_id?: string;
  graduation_date?: string;
  notification_message?: string;
  custom_invitation_message?: string;
}

export interface BulkStudentOperationResponse {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{ student_id: string; error: string }>;
}

// Progress & Performance
export interface StudentProgress {
  student_id: string;
  progress_percentage: number;
  attendance_percentage?: number;
  assignments_completed: number;
  total_assignments: number;
  average_grade?: number;
  skills_acquired: string[];
  notes?: string;
  last_updated: string;
}

export interface StudentCertification {
  certification_name: string;
  certification_type: string;
  issued_date: string;
  expiry_date?: string;
  certificate_url?: string;
  issuing_authority?: string;
  verification_code?: string;
}

// Statistics
export interface AcademyStudentStatistics {
  total_students: number;
  active_students: number;
  graduated_students: number;
  pending_registration: number;
  invited_students: number;
  dropout_students: number;
  new_enrollments_today: number;
  new_enrollments_this_week: number;
  new_enrollments_this_month: number;
  enrollment_growth_percentage: number;
  average_completion_rate: number;
  average_time_to_graduate?: number;
  top_performing_academies: Array<{ academy_id: string; academy_name: string; student_count: number }>;
  most_popular_courses: Array<{ course_id: string; course_name: string; enrollment_count: number }>;
  students_by_academy: Array<{ academy_id: string; academy_name: string; count: number }>;
  students_by_course: Array<{ course_name: string; count: number }>;
  enrollments_by_month: Array<{ month: string; count: number }>;
  graduation_trend: Array<{ month: string; count: number }>;
}

// Export default type for convenience
export type { ApiResponse as default };