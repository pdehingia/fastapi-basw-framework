"""
Path Constants

All file paths, URLs, and directory constants used throughout the application.
"""

import os
from pathlib import Path


# ===== API PATHS =====
class APIPaths:
    """API path constants."""
    
    # Base API paths
    BASE = "/api"
    V1 = "/api/v1"
    ADMIN = "/admin/v1"
    PROVIDER = "/provider/v1"
    WEB = "/web/v1"
    
    # Documentation paths
    DOCS = "/docs"
    REDOC = "/redoc"
    OPENAPI = "/openapi.json"
    
    # Health check paths
    HEALTH = "/health"
    HEALTH_DETAILED = "/health/detailed"
    METRICS = "/metrics"
    
    # Static file paths
    STATIC = "/static"
    MEDIA = "/media"
    UPLOADS = "/uploads"


# ===== FILE STORAGE PATHS =====
class StoragePaths:
    """File storage path constants."""
    
    # Base directories
    BASE_UPLOAD_DIR = "uploads"
    STATIC_DIR = "static"
    MEDIA_DIR = "media"
    TEMP_DIR = "temp"
    
    # Upload subdirectories
    PROFILE_IMAGES = "profiles"
    SALON_IMAGES = "salons"
    SERVICE_IMAGES = "services"
    PORTFOLIO_IMAGES = "portfolios"
    DOCUMENTS = "documents"
    CERTIFICATES = "certificates"
    GALLERY = "gallery"
    BEFORE_AFTER = "before_after"
    
    # Document types
    ID_DOCUMENTS = "id_documents"
    BUSINESS_LICENSES = "business_licenses"
    INSURANCE_DOCS = "insurance"
    TAX_DOCUMENTS = "tax_docs"
    CONTRACTS = "contracts"
    
    # Export directories
    EXPORTS = "exports"
    REPORTS = "reports"
    BACKUPS = "backups"
    LOGS = "logs"
    
    @classmethod
    def get_upload_path(cls, category: str, filename: str) -> str:
        """Get full upload path for file."""
        return os.path.join(cls.BASE_UPLOAD_DIR, category, filename)
    
    @classmethod
    def get_profile_image_path(cls, user_id: int, filename: str) -> str:
        """Get profile image path."""
        return os.path.join(cls.BASE_UPLOAD_DIR, cls.PROFILE_IMAGES, str(user_id), filename)
    
    @classmethod
    def get_salon_image_path(cls, salon_id: int, filename: str) -> str:
        """Get salon image path.""" 
        return os.path.join(cls.BASE_UPLOAD_DIR, cls.SALON_IMAGES, str(salon_id), filename)
    
    @classmethod
    def ensure_directory(cls, path: str) -> None:
        """Ensure directory exists."""
        Path(path).mkdir(parents=True, exist_ok=True)


# ===== EXTERNAL URLs =====
class ExternalURLs:
    """External service URL constants."""
    
    # Payment Gateways
    RAZORPAY_API = "https://api.razorpay.com/v1"
    STRIPE_API = "https://api.stripe.com/v1"
    PAYU_API = "https://secure.payu.in"
    
    # Maps and Location
    GOOGLE_MAPS_API = "https://maps.googleapis.com/maps/api"
    GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place"
    GOOGLE_GEOCODING_API = "https://maps.googleapis.com/maps/api/geocode"
    
    # Communication Services
    TWILIO_API = "https://api.twilio.com"
    SENDGRID_API = "https://api.sendgrid.com/v3"
    SMS_GATEWAY = "https://api.textlocal.in"
    
    # Social Media APIs
    GOOGLE_OAUTH = "https://oauth2.googleapis.com"
    FACEBOOK_GRAPH = "https://graph.facebook.com"
    INSTAGRAM_BASIC = "https://graph.instagram.com"
    
    # CDN and Storage
    CLOUDINARY_API = "https://api.cloudinary.com/v1_1"
    AWS_S3_BASE = "https://s3.amazonaws.com"
    
    # Analytics and Monitoring
    GOOGLE_ANALYTICS = "https://www.google-analytics.com"
    SENTRY_API = "https://sentry.io/api"
    
    # IP and Location Services
    IPAPI_SERVICE = "https://ipapi.co"
    GEOIP_SERVICE = "https://freegeoip.app"


# ===== TEMPLATE PATHS =====
class TemplatePaths:
    """Email and notification template paths."""
    
    # Base template directory
    BASE_TEMPLATE_DIR = "templates"
    
    # Email templates
    EMAIL_TEMPLATES = "email"
    WELCOME_EMAIL = "welcome.html"
    BOOKING_CONFIRMATION = "booking_confirmation.html"
    BOOKING_REMINDER = "booking_reminder.html"
    PASSWORD_RESET = "password_reset.html"
    VERIFICATION_EMAIL = "email_verification.html"
    INVOICE_TEMPLATE = "invoice.html"
    
    # SMS templates
    SMS_TEMPLATES = "sms"
    BOOKING_SMS = "booking_confirmation.txt"
    OTP_SMS = "otp_verification.txt"
    
    # Push notification templates
    PUSH_TEMPLATES = "push"
    BOOKING_PUSH = "booking_notification.json"
    
    # Report templates
    REPORT_TEMPLATES = "reports"
    FINANCIAL_REPORT = "financial_report.html"
    BUSINESS_ANALYTICS = "business_analytics.html"
    
    @classmethod
    def get_email_template_path(cls, template_name: str) -> str:
        """Get email template path."""
        return os.path.join(cls.BASE_TEMPLATE_DIR, cls.EMAIL_TEMPLATES, template_name)
    
    @classmethod
    def get_sms_template_path(cls, template_name: str) -> str:
        """Get SMS template path."""
        return os.path.join(cls.BASE_TEMPLATE_DIR, cls.SMS_TEMPLATES, template_name)


# ===== LOG PATHS =====
class LogPaths:
    """Logging file path constants."""
    
    # Base log directory
    BASE_LOG_DIR = "logs"
    
    # Application logs
    APP_LOG = "app.log"
    ERROR_LOG = "error.log"
    ACCESS_LOG = "access.log"
    DEBUG_LOG = "debug.log"
    
    # Feature-specific logs
    AUTH_LOG = "auth.log"
    PAYMENT_LOG = "payment.log"
    BOOKING_LOG = "booking.log"
    API_LOG = "api.log"
    
    # Security logs
    SECURITY_LOG = "security.log"
    AUDIT_LOG = "audit.log"
    
    # Performance logs
    PERFORMANCE_LOG = "performance.log"
    SLOW_QUERY_LOG = "slow_queries.log"
    
    @classmethod
    def get_log_path(cls, log_type: str) -> str:
        """Get log file path."""
        return os.path.join(cls.BASE_LOG_DIR, log_type)


# ===== DATABASE PATHS =====
class DatabasePaths:
    """Database-related path constants."""
    
    # Migration directories
    ALEMBIC_DIR = "alembic"
    VERSIONS_DIR = "alembic/versions"
    
    # Backup directories
    BACKUP_DIR = "backups/database"
    
    # SQL script directories
    SCRIPTS_DIR = "scripts"
    SEED_DATA_DIR = "scripts/seed_data"
    MIGRATION_SCRIPTS = "scripts/migrations"
    
    # Database dump paths
    POSTGRES_DUMPS = "backups/postgres"
    MONGODB_DUMPS = "backups/mongodb"


# ===== CONFIGURATION PATHS =====
class ConfigPaths:
    """Configuration file path constants."""
    
    # Environment files
    ENV_FILE = ".env"
    ENV_LOCAL = ".env.local"
    ENV_PRODUCTION = ".env.production"
    ENV_STAGING = ".env.staging"
    ENV_DEVELOPMENT = ".env.development"
    
    # Configuration files
    CONFIG_DIR = "config"
    LOGGING_CONFIG = "logging.conf"
    CELERY_CONFIG = "celery.conf"
    NGINX_CONFIG = "nginx.conf"
    
    # SSL/TLS certificates
    SSL_DIR = "ssl"
    CERT_FILE = "cert.pem"
    KEY_FILE = "key.pem"
    CA_FILE = "ca.pem"


# ===== STATIC ASSET PATHS =====
class StaticPaths:
    """Static asset path constants."""
    
    # Web assets
    CSS_DIR = "static/css"
    JS_DIR = "static/js"
    IMAGES_DIR = "static/images"
    FONTS_DIR = "static/fonts"
    ICONS_DIR = "static/icons"
    
    # Default images
    DEFAULT_AVATAR = "images/default_avatar.png"
    DEFAULT_SALON_IMAGE = "images/default_salon.jpg"
    DEFAULT_SERVICE_IMAGE = "images/default_service.jpg"
    LOGO_IMAGE = "images/logo.png"
    FAVICON = "images/favicon.ico"
    
    # Loading and placeholder images
    LOADING_GIF = "images/loading.gif"
    PLACEHOLDER_IMAGE = "images/placeholder.jpg"
    
    @classmethod
    def get_default_image(cls, image_type: str) -> str:
        """Get default image path for type."""
        defaults = {
            'avatar': cls.DEFAULT_AVATAR,
            'salon': cls.DEFAULT_SALON_IMAGE,
            'service': cls.DEFAULT_SERVICE_IMAGE,
            'logo': cls.LOGO_IMAGE
        }
        return defaults.get(image_type, cls.PLACEHOLDER_IMAGE)


# ===== EXPORT CONSTANTS =====
API_PATHS = APIPaths()
UPLOAD_PATHS = StoragePaths()
STATIC_PATHS = StaticPaths()
EXTERNAL_URLS = ExternalURLs()
TEMPLATE_PATHS = TemplatePaths()
LOG_PATHS = LogPaths()
DATABASE_PATHS = DatabasePaths()
CONFIG_PATHS = ConfigPaths()