/**
 * API Response and Data Type Definitions
 * Based on Maya Admin Panel Postman Collection
 */

import type { Permission } from './auth.types';

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
  username: string;
  full_name: string;
  phone?: string;
  role: string;
  permissions: string[];
  department?: string;
  employee_id?: string;
  reports_to?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  full_name: string;
  username: string;
  phone?: string;
  role: string;
  permissions: string[];
  department?: string;
  employee_id?: string;
  reports_to?: string;
  is_active?: boolean;
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

// Export default type for convenience
export type { ApiResponse as default };