"""
API Routes and Endpoint Constants

All API routes, prefixes, tags, and HTTP status codes used throughout the application.
"""

from typing import Dict, List


# ===== API ROUTE PREFIXES =====
class APIPrefixes:
    """API route prefixes for different domains."""
    ADMIN_V1 = "/admin/v1"
    PROVIDER_V1 = "/provider/v1" 
    WEB_V1 = "/web/v1"
    API_V1 = "/api/v1"
    
    # Feature-specific prefixes within admin
    ADMIN_AUTH = "/auth"
    ADMIN_USERS = "/users"
    ADMIN_CUSTOMERS = "/customers"
    ADMIN_PROVIDERS = "/providers"
    ADMIN_BUSINESS = "/business"
    ADMIN_FINANCIAL = "/financial"
    ADMIN_MARKETING = "/marketing"
    ADMIN_BOOKINGS = "/bookings"
    ADMIN_REVIEWS = "/reviews"
    ADMIN_SUPPORT = "/support"
    ADMIN_ANALYTICS = "/analytics"
    ADMIN_SETTINGS = "/settings"


# ===== API ROUTE PATHS =====
class APIRoutes:
    """Complete API route definitions."""
    
    # Authentication routes
    AUTH_LOGIN = "/login"
    AUTH_LOGOUT = "/logout"  
    AUTH_REGISTER = "/register"
    AUTH_REFRESH = "/refresh"
    AUTH_FORGOT_PASSWORD = "/forgot-password"
    AUTH_RESET_PASSWORD = "/reset-password"
    AUTH_VERIFY_EMAIL = "/verify-email"
    AUTH_CHANGE_PASSWORD = "/change-password"
    
    # Health and monitoring
    HEALTH_CHECK = "/health"
    HEALTH_DETAILED = "/health/detailed"
    METRICS = "/metrics"
    
    # User management
    USERS_LIST = "/users"
    USERS_PROFILE = "/users/me"
    USERS_BY_ID = "/users/{user_id}"
    USERS_BULK_ACTIONS = "/users/bulk"
    USERS_EXPORT = "/users/export"
    
    # Business management  
    SALONS_LIST = "/salons"
    SALONS_BY_ID = "/salons/{salon_id}"
    ACADEMIES_LIST = "/academies"
    ACADEMIES_BY_ID = "/academies/{academy_id}"
    SERVICES_LIST = "/services"
    SERVICES_BY_ID = "/services/{service_id}"
    
    # Financial management
    TRANSACTIONS_LIST = "/transactions"
    TRANSACTIONS_BY_ID = "/transactions/{transaction_id}"
    WALLETS_LIST = "/wallets"
    WALLETS_BY_ID = "/wallets/{wallet_id}"
    BANK_ACCOUNTS_LIST = "/bank-accounts"
    BANK_ACCOUNTS_BY_ID = "/bank-accounts/{account_id}"
    
    # Marketing management
    PROMO_CODES_LIST = "/promo-codes"
    PROMO_CODES_BY_ID = "/promo-codes/{promo_code_id}"
    REFERRALS_LIST = "/referrals" 
    REFERRALS_BY_ID = "/referrals/{referral_id}"
    ADS_LIST = "/ads"
    ADS_BY_ID = "/ads/{ad_id}"
    
    # Booking management
    BOOKINGS_LIST = "/bookings"
    BOOKINGS_BY_ID = "/bookings/{booking_id}"
    BOOKINGS_CALENDAR = "/bookings/calendar"
    BOOKINGS_SLOTS = "/bookings/slots"
    
    # Administrative actions
    ADMIN_RECONCILE_WALLETS = "/admin/reconcile-wallets"
    ADMIN_GENERATE_STATEMENTS = "/admin/generate-statements"
    ADMIN_AUDIT_LOGS = "/admin/audit-logs"
    ADMIN_SYSTEM_SETTINGS = "/admin/system-settings"
    
    # Bulk operations
    BULK_ACTIVATE = "/bulk-activate"
    BULK_DEACTIVATE = "/bulk-deactivate"
    BULK_UPDATE = "/bulk-update"
    BULK_DELETE = "/bulk-delete"
    
    # Status change actions
    ACTIVATE = "/activate"
    DEACTIVATE = "/deactivate"
    APPROVE = "/approve"
    REJECT = "/reject"
    COMPLETE = "/complete"
    CANCEL = "/cancel"


# ===== API TAGS =====
class APITags:
    """API documentation tags for grouping endpoints."""
    
    # Domain tags
    ADMIN = "Admin Management"
    PROVIDER = "Provider Management"
    WEB = "Web Interface"
    
    # Feature tags
    AUTHENTICATION = "Authentication"
    USER_MANAGEMENT = "User Management"
    CUSTOMER_MANAGEMENT = "Customer Management" 
    PROVIDER_MANAGEMENT = "Provider Management"
    ARTIST_VERIFICATION = "Artist Verification"
    BUSINESS_MANAGEMENT = "Business Management"
    SALON_MANAGEMENT = "Salon Management"
    ACADEMY_MANAGEMENT = "Academy Management"
    SERVICE_MANAGEMENT = "Service Management"
    BOOKING_MANAGEMENT = "Booking Management"
    PAYMENT_MANAGEMENT = "Payment Management"
    FINANCIAL_MANAGEMENT = "Financial Management"
    MARKETING_MANAGEMENT = "Marketing Management"
    PROMOTION_MANAGEMENT = "Promotion Management"
    REVIEW_MANAGEMENT = "Review Management"
    NOTIFICATION_MANAGEMENT = "Notification Management"
    SUPPORT_MANAGEMENT = "Support Management"
    ANALYTICS_REPORTS = "Analytics & Reports"
    SYSTEM_CONFIGURATION = "System Configuration"
    AUDIT_LOGGING = "Audit & Logging"
    
    # System tags
    HEALTH_MONITORING = "Health & Monitoring"
    FILE_UPLOAD = "File Upload"
    BULK_OPERATIONS = "Bulk Operations"


# ===== HTTP STATUS CODES =====
class HTTPStatusCodes:
    """Standard HTTP status codes with descriptions."""
    
    # Success codes
    OK = 200
    CREATED = 201
    ACCEPTED = 202
    NO_CONTENT = 204
    
    # Client error codes
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    METHOD_NOT_ALLOWED = 405
    CONFLICT = 409
    UNPROCESSABLE_ENTITY = 422
    TOO_MANY_REQUESTS = 429
    
    # Server error codes
    INTERNAL_SERVER_ERROR = 500
    NOT_IMPLEMENTED = 501
    BAD_GATEWAY = 502
    SERVICE_UNAVAILABLE = 503
    GATEWAY_TIMEOUT = 504


# ===== API CONFIGURATION =====
API_ROUTES = APIRoutes()
API_PREFIXES = APIPrefixes()
API_TAGS = APITags()
HTTP_STATUS_CODES = HTTPStatusCodes()


# ===== OPENAPI CONFIGURATION =====
class OpenAPIConfig:
    """OpenAPI/Swagger documentation configuration."""
    
    TITLE = "Maya Platform API"
    VERSION = "1.0.0"
    DESCRIPTION = """
    Maya Platform API - Comprehensive beauty and wellness platform
    
    ## Features
    
    * **Admin Management** - Complete admin panel functionality
    * **Provider Management** - Beauty professionals and service providers
    * **Business Management** - Salons, academies, and services
    * **Booking System** - Comprehensive appointment management
    * **Financial Management** - Payments, wallets, and transactions
    * **Marketing Tools** - Promotions, referrals, and advertisements
    * **Analytics & Reporting** - Business insights and reporting
    
    ## Authentication
    
    The API uses JWT (JSON Web Tokens) for authentication.
    Include the token in the Authorization header: `Bearer <token>`
    """
    
    CONTACT = {
        "name": "Maya Platform Support",
        "email": "support@mayaplatform.com",
    }
    
    LICENSE = {
        "name": "Proprietary",
    }
    
    SERVERS = [
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api-staging.mayaplatform.com",
            "description": "Staging server"
        },
        {
            "url": "https://api.mayaplatform.com", 
            "description": "Production server"
        }
    ]


OPENAPI_CONFIG = OpenAPIConfig()