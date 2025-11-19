/**
 * Central type definitions and re-exports
 * This file provides type aliasing and centralized type management
 */

// Re-export specific types to avoid conflicts
export type { 
  AuthUser, 
  UserRole, 
  Permission, 
  LoginCredentials, 
  ProfileResponse, 
  RefreshResponse, 
  AuthState, 
  LoginFormErrors, 
  AuthActions, 
  AuthStore 
} from './auth.types';

export type { 
  ApiError,
  AdminProfile,
  Booking, 
  BookingStatusUpdate, 
  CreateBookingRequest, 
  UpdateBookingRequest, 
  BookingFilters, 
  BookingStatistics, 
  BookingDispute,
  DashboardOverview, 
  UserAnalytics, 
  BookingAnalytics, 
  FinancialReport,
  Payment, 
  RefundRequest, 
  PaymentDispute, 
  DisputeResolution,
  SystemSetting, 
  PlatformFees, 
  EmailTemplate, 
  SystemHealth,
  SupportTicket, 
  TicketReply, 
  FAQ, 
  KnowledgeBaseArticle,
  Review, 
  ReviewModeration, 
  BulkReviewModeration,
  PromotionCampaign, 
  CouponCode, 
  ReferralStats, 
  ReferralConfig,
  VerificationRequest, 
  VerificationDecision, 
  PortfolioImage,
  AdminUser, 
  CreateAdminUserRequest, 
  AdminRole, 
  AdminPermission,
  ExportRequest, 
  CustomReportRequest,
  PaginationParams, 
  SortParams, 
  SearchParams, 
  DateRangeParams, 
  QueryParams
} from './api.types';

export type { 
  User, 
  UserDashboardStats, 
  UserFilters, 
  CreateUserData, 
  UpdateUserData, 
  UserStatusUpdate, 
  BulkUserAction, 
  ExportUsersRequest, 
  UserActivity, 
  UserNotification, 
  PaginatedResponse 
} from './user';

// Re-export LoginResponse from auth.types to avoid conflict
export type { LoginResponse } from './auth.types';

// UI Component Types - Type aliases for better maintainability
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Header Component Types - Type aliasing instead of inline interfaces
export interface HeaderNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface UserMenuOption {
  value: string;
  label: string;
  icon?: string;
  divider?: boolean;
}

export interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showMobileSidebarToggle?: boolean;
  onMobileSidebarToggle?: () => void;
  isScrolled?: boolean;
  className?: string;
}

// Search Component Types
export interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  size?: 'sm' | 'md' | 'lg';
  shortcutKey?: string;
}

// Component Event Handler Types - Type aliases for consistency
export type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
export type ChangeHandler = (value: string) => void;
export type SubmitHandler = (data: any) => void;
export type SearchHandler = (query: string) => void;

// Layout Types
export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'default' | 'floating';
}

// Table/List Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Form Types - Type aliases for form handling
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | boolean;
  };
}

// Status and State Types - Common type aliases
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid' | 'card';

// Utility Types - Type aliases for common patterns
export type ID = string | number;
export type Timestamp = string; // ISO 8601 string
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// API Response Types - Type aliases for API patterns
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationInfo;
  filters?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Theme and Styling Types
export type ThemeColor = 
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose';

export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

// Component State Types
export interface ComponentState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ListState<T = any> extends ComponentState<T[]> {
  pagination: PaginationInfo;
  filters: Record<string, any>;
  sorting: {
    field: string;
    direction: SortDirection;
  };
}