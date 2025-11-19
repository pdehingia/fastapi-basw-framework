"""
Response Messages Constants

All standardized response messages for API responses, notifications, and user feedback.
"""

from typing import Dict


# ===== SUCCESS MESSAGES =====
class SuccessMessages:
    """Success response messages."""
    
    # Authentication
    LOGIN_SUCCESS = "Successfully logged in"
    LOGOUT_SUCCESS = "Successfully logged out"
    REGISTRATION_SUCCESS = "Account created successfully"
    PASSWORD_CHANGED = "Password changed successfully"
    PASSWORD_RESET_SENT = "Password reset email sent successfully"
    EMAIL_VERIFIED = "Email verified successfully"
    
    # CRUD Operations
    CREATED_SUCCESS = "{entity} created successfully"
    UPDATED_SUCCESS = "{entity} updated successfully"
    DELETED_SUCCESS = "{entity} deleted successfully"
    ACTIVATED_SUCCESS = "{entity} activated successfully"
    DEACTIVATED_SUCCESS = "{entity} deactivated successfully"
    
    # Booking Operations
    BOOKING_CREATED = "Booking created successfully"
    BOOKING_CONFIRMED = "Booking confirmed successfully"
    BOOKING_CANCELLED = "Booking cancelled successfully"
    BOOKING_COMPLETED = "Booking completed successfully"
    BOOKING_RESCHEDULED = "Booking rescheduled successfully"
    
    # Payment Operations
    PAYMENT_SUCCESS = "Payment processed successfully"
    REFUND_SUCCESS = "Refund processed successfully"
    WALLET_TOPPED_UP = "Wallet topped up successfully"
    WITHDRAWAL_SUCCESS = "Withdrawal processed successfully"
    
    # Business Operations
    SALON_VERIFIED = "Salon verification completed"
    SERVICE_PUBLISHED = "Service published successfully"
    PROMOTION_ACTIVATED = "Promotion activated successfully"
    
    # Bulk Operations
    BULK_UPDATE_SUCCESS = "Bulk update completed successfully"
    BULK_DELETE_SUCCESS = "Bulk delete completed successfully"
    BULK_ACTIVATE_SUCCESS = "Bulk activation completed successfully"
    
    # File Operations
    FILE_UPLOADED = "File uploaded successfully"
    FILE_DELETED = "File deleted successfully"
    EXPORT_GENERATED = "Export generated successfully"
    
    # Notification Operations
    NOTIFICATION_SENT = "Notification sent successfully"
    EMAIL_SENT = "Email sent successfully"
    SMS_SENT = "SMS sent successfully"


# ===== ERROR MESSAGES =====
class ErrorMessages:
    """Error response messages."""
    
    # Authentication Errors
    INVALID_CREDENTIALS = "Invalid email or password"
    TOKEN_EXPIRED = "Token has expired"
    TOKEN_INVALID = "Invalid token"
    ACCESS_DENIED = "Access denied"
    UNAUTHORIZED_ACCESS = "Unauthorized access"
    SESSION_EXPIRED = "Session has expired"
    ACCOUNT_LOCKED = "Account has been locked"
    EMAIL_NOT_VERIFIED = "Email address not verified"
    
    # Validation Errors
    REQUIRED_FIELD_MISSING = "{field} is required"
    INVALID_FORMAT = "Invalid {field} format"
    INVALID_EMAIL = "Invalid email address"
    INVALID_PHONE = "Invalid phone number"
    PASSWORD_TOO_WEAK = "Password does not meet security requirements"
    PASSWORD_MISMATCH = "Passwords do not match"
    
    # Resource Errors
    NOT_FOUND = "{entity} not found"
    ALREADY_EXISTS = "{entity} already exists"
    DUPLICATE_ENTRY = "Duplicate entry for {field}"
    RESOURCE_CONFLICT = "Resource conflict occurred"
    
    # Database Errors
    DATABASE_ERROR = "Database error occurred"
    CONNECTION_FAILED = "Database connection failed"
    TRANSACTION_FAILED = "Transaction failed"
    
    # Business Logic Errors
    BOOKING_NOT_AVAILABLE = "Booking slot not available"
    INSUFFICIENT_BALANCE = "Insufficient wallet balance"
    SERVICE_UNAVAILABLE = "Service is currently unavailable"
    SALON_CLOSED = "Salon is closed at this time"
    BOOKING_DEADLINE_PASSED = "Booking deadline has passed"
    CANCELLATION_NOT_ALLOWED = "Cancellation not allowed at this time"
    REFUND_METHOD_CONFLICT = "Provide either refund_percentage or refund_amount, not both"
    
    # Payment Errors
    PAYMENT_FAILED = "Payment processing failed"
    PAYMENT_DECLINED = "Payment was declined"
    INVALID_PAYMENT_METHOD = "Invalid payment method"
    REFUND_FAILED = "Refund processing failed"
    INSUFFICIENT_FUNDS = "Insufficient funds"
    TRANSACTION_NOT_FOUND = "Transaction not found"
    TRANSACTION_RETRIEVE_FAILED = "Failed to retrieve transactions"
    WALLET_RETRIEVE_FAILED = "Failed to retrieve wallets"
    WITHDRAWAL_RETRIEVE_FAILED = "Failed to retrieve withdrawal requests"
    WITHDRAWAL_PROCESS_FAILED = "Failed to process withdrawal"
    WALLET_ADJUSTMENT_FAILED = "Failed to adjust wallet balance"
    TRANSACTION_EXPORT_FAILED = "Failed to export transactions"
    UTR_REQUIRED = "UTR number is required for approval"
    REJECTION_REASON_REQUIRED = "Rejection reason is required"
    
    # Admin User Management Errors  
    ADMIN_USER_NOT_FOUND = "Admin user not found"
    ADMIN_USER_DELETE_FAILED = "Failed to delete admin user"
    PASSWORD_CHANGE_FAILED = "Failed to change password"
    PERMISSION_ASSIGNMENT_FAILED = "Failed to assign permissions"
    
    # Artist Verification Errors
    VERIFICATION_QUEUE_FAILED = "Failed to retrieve verification queue"
    VERIFICATION_REQUEST_NOT_FOUND = "Verification request not found"
    VERIFICATION_PROCESS_FAILED = "Failed to process verification"
    VERIFICATION_REJECTION_REASON_REQUIRED = "Rejection reason is required when rejecting verification"
    PORTFOLIO_QUEUE_FAILED = "Failed to retrieve portfolio queue"
    IMAGE_MODERATION_FAILED = "Failed to moderate image"
    PORTFOLIO_REJECTION_REASON_REQUIRED = "Rejection reason is required for reject or flag actions"
    BULK_MODERATION_LIMIT = "Maximum 50 images can be processed in a single request"
    BULK_MODERATION_FAILED = "Failed to bulk moderate images"
    VERIFICATION_EXPORT_FAILED = "Failed to export verification requests"
    
    # Promotions Management Errors
    PROMO_CODE_NOT_FOUND = "Promo code not found"
    
    # Review Management Errors
    REVIEW_RETRIEVE_FAILED = "Failed to retrieve reviews"
    REVIEW_NOT_FOUND = "Review not found"
    REVIEW_MODERATION_REASON_REQUIRED = "Reason is required for flag or remove actions"
    REVIEW_MODERATION_FAILED = "Failed to moderate review"
    REVIEW_IMAGE_REMOVAL_FAILED = "Failed to remove images"
    REVIEW_RESPONSE_FAILED = "Failed to post response"
    FLAGGED_REVIEWS_RETRIEVE_FAILED = "Failed to retrieve flagged reviews"
    REVIEW_EXPORT_FAILED = "Failed to export reviews"
    
    # Support Management Errors
    TICKET_NOT_FOUND = "Ticket not found"
    NOTE_TOO_SHORT = "Note must be at least 5 characters long"
    PRIMARY_TICKET_ID_REQUIRED = "Primary ticket ID is required"
    SECONDARY_TICKET_IDS_REQUIRED = "At least one secondary ticket ID is required"
    MERGE_REASON_TOO_SHORT = "Merge reason must be at least 10 characters long"
    RESOLUTION_SUMMARY_TOO_SHORT = "Resolution summary must be at least 20 characters long"
    INVALID_TIMEFRAME = "Invalid timeframe. Please select a valid option"
    
    # System Configuration Errors
    FEATURE_KEY_EMPTY = "Feature key cannot be empty"
    
    # File Upload Errors
    FILE_TOO_LARGE = "File size exceeds maximum limit"
    INVALID_FILE_TYPE = "Invalid file type"
    UPLOAD_FAILED = "File upload failed"
    FILE_CORRUPTED = "File appears to be corrupted"
    
    # Rate Limiting
    RATE_LIMIT_EXCEEDED = "Too many requests. Please try again later"
    
    # System Errors
    INTERNAL_SERVER_ERROR = "Internal server error occurred"
    SERVICE_UNAVAILABLE = "Service temporarily unavailable"
    MAINTENANCE_MODE = "System is under maintenance"
    
    # Bulk Operation Errors
    BULK_OPERATION_FAILED = "Bulk operation failed"
    PARTIAL_SUCCESS = "Operation partially successful"
    
    # External Service Errors
    EXTERNAL_SERVICE_ERROR = "External service error"
    SMS_SERVICE_ERROR = "SMS service unavailable"
    EMAIL_SERVICE_ERROR = "Email service unavailable"
    PAYMENT_GATEWAY_ERROR = "Payment gateway error"


# ===== VALIDATION MESSAGES =====
class ValidationMessages:
    """Validation error messages."""
    
    # Field Validation
    FIELD_REQUIRED = "This field is required"
    FIELD_TOO_SHORT = "This field must be at least {min_length} characters"
    FIELD_TOO_LONG = "This field cannot exceed {max_length} characters"
    INVALID_RANGE = "Value must be between {min} and {max}"
    INVALID_CHOICE = "Invalid choice. Must be one of: {choices}"
    
    # String Validation
    INVALID_EMAIL_FORMAT = "Please enter a valid email address"
    INVALID_PHONE_FORMAT = "Please enter a valid phone number"
    INVALID_URL_FORMAT = "Please enter a valid URL"
    CONTAINS_INVALID_CHARACTERS = "Contains invalid characters"
    
    # Number Validation
    NOT_A_NUMBER = "Must be a valid number"
    NOT_AN_INTEGER = "Must be a valid integer"
    NUMBER_TOO_SMALL = "Number must be greater than {min}"
    NUMBER_TOO_LARGE = "Number must be less than {max}"
    
    # Date Validation
    INVALID_DATE_FORMAT = "Invalid date format. Use YYYY-MM-DD"
    INVALID_TIME_FORMAT = "Invalid time format. Use HH:MM"
    DATE_IN_PAST = "Date cannot be in the past"
    DATE_TOO_FAR = "Date is too far in the future"
    
    # Business Validation
    BOOKING_TIME_CONFLICT = "Booking time conflicts with existing appointment"
    SALON_HOURS_VIOLATION = "Booking time is outside salon operating hours"
    MINIMUM_ADVANCE_NOTICE = "Booking requires at least {hours} hours advance notice"
    MAXIMUM_ADVANCE_BOOKING = "Cannot book more than {days} days in advance"


# ===== NOTIFICATION MESSAGES =====
class NotificationMessages:
    """Notification and alert messages."""
    
    # Booking Notifications
    BOOKING_CONFIRMED = "Your booking has been confirmed for {date} at {time}"
    BOOKING_REMINDER = "Reminder: You have a booking today at {time}"
    BOOKING_CANCELLED_BY_SALON = "Your booking has been cancelled by the salon"
    BOOKING_RESCHEDULED = "Your booking has been rescheduled to {date} at {time}"
    
    # Payment Notifications
    PAYMENT_RECEIVED = "Payment of ₹{amount} received successfully"
    REFUND_PROCESSED = "Refund of ₹{amount} has been processed"
    WALLET_LOW_BALANCE = "Your wallet balance is low. Please top up"
    
    # Promotional Notifications
    NEW_PROMOTION = "New promotion available: {promotion_name}"
    PROMOTION_EXPIRING = "Promotion expires soon: {promotion_name}"
    LOYALTY_POINTS_EARNED = "You earned {points} loyalty points"
    
    # System Notifications
    PROFILE_UPDATED = "Your profile has been updated successfully"
    VERIFICATION_COMPLETE = "Your account verification is complete"
    PASSWORD_CHANGED_ALERT = "Your password was changed successfully"
    SUSPICIOUS_ACTIVITY = "Suspicious activity detected on your account"
    
    # Business Notifications
    NEW_BOOKING_RECEIVED = "New booking received from {customer_name}"
    REVIEW_RECEIVED = "New review received for your service"
    PAYOUT_PROCESSED = "Payout of ₹{amount} has been processed"


# ===== INFO MESSAGES =====
class InfoMessages:
    """Informational messages."""
    
    LOADING = "Loading..."
    PROCESSING = "Processing your request..."
    PLEASE_WAIT = "Please wait while we process your request"
    NO_DATA_AVAILABLE = "No data available"
    NO_RESULTS_FOUND = "No results found"
    FEATURE_COMING_SOON = "This feature is coming soon"
    MAINTENANCE_SCHEDULED = "Scheduled maintenance: {date} {time}"
    
    # Pagination
    SHOWING_RESULTS = "Showing {start} to {end} of {total} results"
    PAGE_INFO = "Page {current} of {total}"
    
    # Search
    SEARCH_RESULTS = "Found {count} results for '{query}'"
    SEARCH_SUGGESTIONS = "Did you mean: {suggestion}?"


# ===== EXPORT CONSTANTS =====
SUCCESS_MESSAGES = SuccessMessages()
ERROR_MESSAGES = ErrorMessages()
VALIDATION_MESSAGES = ValidationMessages()
NOTIFICATION_MESSAGES = NotificationMessages()
INFO_MESSAGES = InfoMessages()


# ===== MESSAGE TEMPLATES =====
MESSAGE_TEMPLATES = {
    "success": {
        "structure": {
            "success": True,
            "message": "",
            "data": None
        }
    },
    "error": {
        "structure": {
            "success": False,
            "message": "",
            "error_code": None,
            "details": None
        }
    },
    "validation": {
        "structure": {
            "success": False,
            "message": "Validation failed",
            "errors": []
        }
    }
}