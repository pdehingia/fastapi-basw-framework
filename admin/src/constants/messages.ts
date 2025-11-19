/**
 * UI Messages and Text Constants
 * CRITICAL: All user-facing messages must be defined here
 * NO MAGIC STRINGS in components
 */

// Authentication Messages
export const AUTH_MESSAGES = {
  LOGIN: {
    TITLE: 'Welcome back',
    SUBTITLE: 'Sign in to your admin account',
    EMAIL_LABEL: 'Email',
    PASSWORD_LABEL: 'Password',
    SUBMIT_BUTTON: 'Sign in',
    LOADING: 'Signing in...',
    SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    REMEMBER_ME: 'Remember me',
    FORGOT_PASSWORD: 'Forgot your password?',
  },
  LOGOUT: {
    SUCCESS: 'Logged out successfully',
    CONFIRM: 'Are you sure you want to log out?',
    ERROR: 'Error logging out. Please try again.',
  },
  REFRESH: {
    ERROR: 'Session refresh failed. Please log in again.',
    SUCCESS: 'Session refreshed successfully',
  },
} as const;

// General UI Messages
export const UI_MESSAGES = {
  LOADING: {
    DEFAULT: 'Loading...',
    USERS: 'Loading users...',
    BOOKINGS: 'Loading bookings...',
    PAYMENTS: 'Loading payments...',
    REVIEWS: 'Loading reviews...',
    DASHBOARD: 'Loading dashboard...',
  },
  SUCCESS: {
    SAVED: 'Changes saved successfully',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    ACTIVATED: 'Activated successfully',
    DEACTIVATED: 'Deactivated successfully',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access forbidden. You do not have permission.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Internal server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    FILE_TOO_LARGE: 'File size is too large. Maximum size is 10MB.',
    INVALID_FILE_TYPE: 'Invalid file type. Only images and PDFs are allowed.',
  },
  CONFIRM: {
    DELETE: 'Are you sure you want to delete this item?',
    DELETE_MULTIPLE: 'Are you sure you want to delete {count} items?',
    DEACTIVATE: 'Are you sure you want to deactivate this user?',
    ACTIVATE: 'Are you sure you want to activate this user?',
    CANCEL: 'Are you sure you want to cancel? Unsaved changes will be lost.',
  },
  ACTIONS: {
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    VIEW: 'View',
    CREATE: 'Create',
    UPDATE: 'Update',
    ACTIVATE: 'Activate',
    DEACTIVATE: 'Deactivate',
    SEARCH: 'Search',
    FILTER: 'Filter',
    EXPORT: 'Export',
    IMPORT: 'Import',
    REFRESH: 'Refresh',
    RESET: 'Reset',
    SUBMIT: 'Submit',
  },
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address',
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    MIN_LENGTH: 'Password must be at least 8 characters',
    MAX_LENGTH: 'Password must be less than 128 characters',
    COMPLEXITY: 'Password must contain at least one uppercase, lowercase, number, and special character',
  },
  NAME: {
    REQUIRED: 'Name is required',
    MIN_LENGTH: 'Name must be at least 2 characters',
    MAX_LENGTH: 'Name must be less than 100 characters',
    INVALID_CHARACTERS: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  },
  PHONE: {
    REQUIRED: 'Phone number is required',
    INVALID: 'Please enter a valid phone number',
  },
  FILE: {
    REQUIRED: 'File is required',
    TOO_LARGE: 'File size must be less than 10MB',
    INVALID_TYPE: 'File type not supported',
  },
} as const;

// Navigation & Page Titles
export const PAGE_TITLES = {
  DASHBOARD: 'Dashboard',
  USERS: 'User Management',
  USER_DETAIL: 'User Details',
  USER_CREATE: 'Create User',
  USER_EDIT: 'Edit User',
  BOOKINGS: 'Booking Management',
  BOOKING_DETAIL: 'Booking Details',
  PAYMENTS: 'Payment Management',
  PAYMENT_DETAIL: 'Payment Details',
  REVIEWS: 'Review Management',
  REVIEW_DETAIL: 'Review Details',
  ANALYTICS: 'Analytics',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  LOGIN: 'Login',
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  USER: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    PENDING: 'Pending Verification',
    VERIFIED: 'Verified',
  },
  BOOKING: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  },
  PAYMENT: {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
  },
  REVIEW: {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    FLAGGED: 'Flagged',
  },
} as const;

// Placeholder Messages
export const PLACEHOLDERS = {
  SEARCH: {
    USERS: 'Search users by name, email, or phone...',
    BOOKINGS: 'Search bookings by ID, customer, or provider...',
    PAYMENTS: 'Search payments by transaction ID or amount...',
    REVIEWS: 'Search reviews by content or rating...',
    GENERAL: 'Search...',
  },
  SELECT: {
    STATUS: 'Select status...',
    ROLE: 'Select role...',
    DATE_RANGE: 'Select date range...',
    USER: 'Select user...',
    PROVIDER: 'Select provider...',
  },
} as const;

// Empty State Messages
export const EMPTY_STATES = {
  USERS: {
    TITLE: 'No users found',
    DESCRIPTION: 'There are no users matching your criteria.',
    ACTION: 'Create new user',
  },
  BOOKINGS: {
    TITLE: 'No bookings found',
    DESCRIPTION: 'There are no bookings matching your criteria.',
    ACTION: 'View all bookings',
  },
  PAYMENTS: {
    TITLE: 'No payments found',
    DESCRIPTION: 'There are no payments matching your criteria.',
    ACTION: 'View all payments',
  },
  REVIEWS: {
    TITLE: 'No reviews found',
    DESCRIPTION: 'There are no reviews matching your criteria.',
    ACTION: 'View all reviews',
  },
  SEARCH: {
    TITLE: 'No results found',
    DESCRIPTION: 'Try adjusting your search criteria.',
    ACTION: 'Clear search',
  },
} as const;

// Time and Date Messages
export const TIME_MESSAGES = {
  JUST_NOW: 'Just now',
  MINUTES_AGO: '{minutes} minutes ago',
  HOURS_AGO: '{hours} hours ago',
  DAYS_AGO: '{days} days ago',
  WEEKS_AGO: '{weeks} weeks ago',
  MONTHS_AGO: '{months} months ago',
  YEARS_AGO: '{years} years ago',
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  TOMORROW: 'Tomorrow',
} as const;

// Helper function to replace placeholders in messages
export const formatMessage = (message: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce(
    (msg, [key, value]) => msg.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    message
  );
};

// Type for all message keys (for TypeScript safety)
export type MessageKey = 
  | keyof typeof AUTH_MESSAGES.LOGIN
  | keyof typeof AUTH_MESSAGES.LOGOUT
  | keyof typeof UI_MESSAGES.LOADING
  | keyof typeof UI_MESSAGES.SUCCESS
  | keyof typeof UI_MESSAGES.ERROR
  | keyof typeof VALIDATION_MESSAGES;