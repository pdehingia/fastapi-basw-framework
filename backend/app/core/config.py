"""
Application configuration using pydantic-settings.
All configuration values come from environment variables.
No hardcoded values - everything is configurable via .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, computed_field
from typing import Literal, List, Union
from functools import lru_cache
import json


class Settings(BaseSettings):
    """Application settings with environment-based configuration."""

    # =============================================================================
    # GENERAL SETTINGS
    # =============================================================================
    PROJECT_NAME: str = Field(..., description="Application name - REQUIRED from .env")
    PROJECT_VERSION: str = Field(..., description="Application version - REQUIRED from .env")
    ENVIRONMENT: Literal["development", "staging", "production"] = Field(
        ..., description="Environment type - REQUIRED from .env"
    )
    DEBUG: bool = Field(..., description="Enable debug mode - REQUIRED from .env")
    
    # API Configuration
    API_HOST: str = Field(..., description="API host binding - REQUIRED from .env")
    API_PORT: int = Field(..., description="API port - REQUIRED from .env")
    API_V1_STR: str = Field(..., description="API v1 prefix - REQUIRED from .env")
    APP_URL: str = Field(..., description="Application base URL - REQUIRED from .env")

    # =============================================================================
    # SECURITY CONFIGURATION
    # =============================================================================
    SECRET_KEY: str = Field(..., min_length=32, description="Application secret key - REQUIRED from .env")
    JWT_SECRET_KEY: str = Field(..., min_length=32, description="JWT secret key - REQUIRED from .env")
    API_KEY: str = Field(..., description="API key for external access - REQUIRED from .env")
    ALGORITHM: str = Field(..., description="JWT algorithm - REQUIRED from .env")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(..., description="Access token expiry - REQUIRED from .env")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(..., description="Refresh token expiry - REQUIRED from .env")
    PASSWORD_MIN_LENGTH: int = Field(..., description="Minimum password length - REQUIRED from .env")

    # =============================================================================
    # CORS CONFIGURATION
    # =============================================================================
    ENABLE_CORS: bool = Field(..., description="Enable CORS middleware - REQUIRED from .env")
    BACKEND_CORS_ORIGINS: List[str] = Field(
        ..., description="Allowed CORS origins - REQUIRED from .env"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(..., description="Allow credentials in CORS - REQUIRED from .env")
    CORS_ALLOW_METHODS: List[str] = Field(
        ..., description="Allowed HTTP methods - REQUIRED from .env"
    )
    CORS_ALLOW_HEADERS: List[str] = Field(..., description="Allowed headers - REQUIRED from .env")

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v

    @field_validator("CORS_ALLOW_METHODS", "CORS_ALLOW_HEADERS", mode="before")
    @classmethod
    def parse_list_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v

    # =============================================================================
    # DATABASE CONFIGURATION - POSTGRESQL
    # =============================================================================
    POSTGRES_SERVER: str = Field(..., description="PostgreSQL server host - REQUIRED from .env")
    POSTGRES_USER: str = Field(..., description="PostgreSQL username - REQUIRED from .env")
    POSTGRES_PASSWORD: str = Field(..., description="PostgreSQL password - REQUIRED from .env")
    POSTGRES_DB: str = Field(..., description="PostgreSQL database name - REQUIRED from .env")
    POSTGRES_PORT: int = Field(..., description="PostgreSQL port - REQUIRED from .env")
    DATABASE_URL: str = Field(default="", description="Complete PostgreSQL connection URL - optional if components provided")
    
    # Database pool settings
    DB_POOL_SIZE: int = Field(..., description="Database connection pool size - REQUIRED from .env")
    DB_MAX_OVERFLOW: int = Field(..., description="Database max overflow connections - REQUIRED from .env")
    DB_ECHO: bool = Field(..., description="Enable SQL query logging - REQUIRED from .env")

    @computed_field
    @property
    def database_url_computed(self) -> str:
        """Compute database URL if not provided."""
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @computed_field
    @property
    def database_url_async(self) -> str:
        """Get async database URL for async drivers."""
        url = self.database_url_computed
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://")
        return url

    # =============================================================================
    # DATABASE CONFIGURATION - MONGODB
    # =============================================================================
    MONGODB_SERVER: str = Field(..., description="MongoDB server host - REQUIRED from .env")
    MONGODB_PORT: int = Field(..., description="MongoDB port - REQUIRED from .env")
    MONGODB_USER: str = Field(..., description="MongoDB username - REQUIRED from .env")
    MONGODB_PASSWORD: str = Field(..., description="MongoDB password - REQUIRED from .env")
    MONGODB_DATABASE: str = Field(..., description="MongoDB database name - REQUIRED from .env")
    MONGODB_URL: str = Field(default="", description="Complete MongoDB connection URL - optional if components provided")

    @computed_field
    @property
    def mongodb_url_computed(self) -> str:
        """Compute MongoDB URL if not provided."""
        if self.MONGODB_URL:
            return self.MONGODB_URL
        
        if self.MONGODB_USER and self.MONGODB_PASSWORD:
            return f"mongodb://{self.MONGODB_USER}:{self.MONGODB_PASSWORD}@{self.MONGODB_SERVER}:{self.MONGODB_PORT}/{self.MONGODB_DATABASE}?authSource=admin"
        return f"mongodb://{self.MONGODB_SERVER}:{self.MONGODB_PORT}/{self.MONGODB_DATABASE}"

    # =============================================================================
    # CACHE CONFIGURATION - REDIS
    # =============================================================================
    REDIS_HOST: str = Field(..., description="Redis server host - REQUIRED from .env")
    REDIS_PORT: int = Field(..., description="Redis port - REQUIRED from .env")
    REDIS_PASSWORD: str = Field(..., description="Redis password - REQUIRED from .env")
    REDIS_DB: int = Field(..., description="Redis database number - REQUIRED from .env")
    REDIS_URL: str = Field(default="", description="Complete Redis connection URL - optional if components provided")
    CACHE_TTL: int = Field(..., description="Default cache TTL in seconds - REQUIRED from .env")
    CACHE_ENABLED: bool = Field(..., description="Enable caching - REQUIRED from .env")

    @computed_field
    @property
    def redis_url_computed(self) -> str:
        """Compute Redis URL if not provided."""
        if self.REDIS_URL:
            return self.REDIS_URL
        
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # =============================================================================
    # RATE LIMITING CONFIGURATION
    # =============================================================================
    ENABLE_RATE_LIMITING: bool = Field(..., description="Enable rate limiting - REQUIRED from .env")
    RATE_LIMIT_PER_MINUTE: int = Field(..., description="Rate limit per minute - REQUIRED from .env")
    RATE_LIMIT_BURST: int = Field(..., description="Rate limit burst size - REQUIRED from .env")
    RATE_LIMIT_STORAGE: Literal["redis", "memory"] = Field(
        ..., description="Rate limit storage backend - REQUIRED from .env"
    )

    # =============================================================================
    # LOGGING CONFIGURATION
    # =============================================================================
    ENABLE_LOGGING: bool = Field(..., description="Enable logging - REQUIRED from .env")
    LOG_LEVEL: str = Field(..., description="Logging level - REQUIRED from .env")
    LOG_FORMAT: Literal["json", "text"] = Field(..., description="Log format - REQUIRED from .env")
    LOG_FILE_ENABLED: bool = Field(..., description="Enable file logging - REQUIRED from .env")
    LOG_FILE_PATH: str = Field(..., description="Log file path - REQUIRED from .env")
    LOG_ROTATION_SIZE: str = Field(..., description="Log rotation size - REQUIRED from .env")
    LOG_RETENTION_COUNT: int = Field(..., description="Number of log files to keep - REQUIRED from .env")

    # =============================================================================
    # EMAIL CONFIGURATION
    # =============================================================================
    SMTP_HOST: str = Field(..., description="SMTP server host - REQUIRED from .env")
    SMTP_PORT: int = Field(..., description="SMTP server port - REQUIRED from .env")
    SMTP_USER: str = Field(..., description="SMTP username - REQUIRED from .env")
    SMTP_PASSWORD: str = Field(..., description="SMTP password - REQUIRED from .env")
    SMTP_TLS: bool = Field(..., description="Enable SMTP TLS - REQUIRED from .env")
    SMTP_SECURE: bool = Field(..., description="SMTP secure connection - REQUIRED from .env")
    FROM_EMAIL: str = Field(..., description="From email address - REQUIRED from .env")
    FROM_NAME: str = Field(..., description="From name - REQUIRED from .env")

    # =============================================================================
    # FILE STORAGE CONFIGURATION
    # =============================================================================
    STORAGE_TYPE: Literal["local", "s3"] = Field(..., description="Storage type - REQUIRED from .env")
    UPLOAD_DIR: str = Field(..., description="Upload directory - REQUIRED from .env")
    MAX_UPLOAD_SIZE: int = Field(..., description="Max upload size in bytes - REQUIRED from .env")
    ALLOWED_FILE_TYPES: List[str] = Field(
        ..., description="Allowed file extensions - REQUIRED from .env"
    )

    @field_validator("ALLOWED_FILE_TYPES", mode="before")
    @classmethod
    def parse_file_types(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [i.strip() for i in v.split(",")]
        return v

    # AWS S3 Configuration (if using S3 storage)
    AWS_ACCESS_KEY_ID: str = Field(default="", description="AWS access key - optional, required if STORAGE_TYPE=s3")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", description="AWS secret key - optional, required if STORAGE_TYPE=s3")
    AWS_S3_BUCKET: str = Field(default="", description="S3 bucket name - optional, required if STORAGE_TYPE=s3")
    AWS_REGION: str = Field(default="us-east-1", description="AWS region - optional")

    # =============================================================================
    # PAGINATION CONFIGURATION
    # =============================================================================
    DEFAULT_PAGE_SIZE: int = Field(..., description="Default pagination page size - REQUIRED from .env")
    MAX_PAGE_SIZE: int = Field(..., description="Maximum pagination page size - REQUIRED from .env")

    # =============================================================================
    # DEVELOPMENT & FEATURE FLAGS
    # =============================================================================
    ENABLE_DOCS: bool = Field(..., description="Enable API documentation - REQUIRED from .env")
    ENABLE_SWAGGER_UI: bool = Field(..., description="Enable Swagger UI - REQUIRED from .env")
    ENABLE_REDOC: bool = Field(..., description="Enable ReDoc - REQUIRED from .env")
    ENABLE_DEBUG_TOOLBAR: bool = Field(..., description="Enable debug toolbar - REQUIRED from .env")
    ENABLE_PROFILER: bool = Field(..., description="Enable profiler - REQUIRED from .env")
    ENABLE_METRICS: bool = Field(..., description="Enable metrics collection - REQUIRED from .env")

    # =============================================================================
    # BUSINESS FEATURE FLAGS
    # =============================================================================
    ENABLE_USER_REGISTRATION: bool = Field(..., description="Allow user registration - REQUIRED from .env")
    ENABLE_SOCIAL_LOGIN: bool = Field(..., description="Enable social login - REQUIRED from .env")
    ENABLE_EMAIL_VERIFICATION: bool = Field(..., description="Require email verification - REQUIRED from .env")
    ENABLE_TWO_FACTOR_AUTH: bool = Field(..., description="Enable 2FA - REQUIRED from .env")
    ENABLE_GEOLOCATION: bool = Field(..., description="Enable geolocation features - REQUIRED from .env")
    ENABLE_REAL_TIME_CHAT: bool = Field(..., description="Enable real-time chat - REQUIRED from .env")
    ENABLE_PUSH_NOTIFICATIONS: bool = Field(..., description="Enable push notifications - REQUIRED from .env")

    # =============================================================================
    # EXTERNAL SERVICES
    # =============================================================================
    # Google Services
    GOOGLE_MAPS_API_KEY: str = Field(default="", description="Google Maps API key - optional")
    GOOGLE_OAUTH_CLIENT_ID: str = Field(default="", description="Google OAuth client ID - optional")
    GOOGLE_OAUTH_CLIENT_SECRET: str = Field(default="", description="Google OAuth client secret - optional")

    # Payment Processing - Razorpay (Primary for India)
    RAZORPAY_KEY_ID: str = Field(default="", description="Razorpay key ID - optional")
    RAZORPAY_KEY_SECRET: str = Field(default="", description="Razorpay key secret - optional")

    # Payment Processing - Stripe (Optional for international)
    STRIPE_SECRET_KEY: str = Field(default="", description="Stripe secret key - optional")
    STRIPE_PUBLISHABLE_KEY: str = Field(default="", description="Stripe publishable key - optional")
    STRIPE_WEBHOOK_SECRET: str = Field(default="", description="Stripe webhook secret - optional")

    # Communication
    TWILIO_ACCOUNT_SID: str = Field(default="", description="Twilio account SID - optional")
    TWILIO_AUTH_TOKEN: str = Field(default="", description="Twilio auth token - optional")
    TWILIO_PHONE_NUMBER: str = Field(default="", description="Twilio phone number - optional")

    # Monitoring & Analytics
    SENTRY_DSN: str = Field(default="", description="Sentry DSN - optional")
    GOOGLE_ANALYTICS_ID: str = Field(default="", description="Google Analytics ID - optional")

    # =============================================================================
    # BACKGROUND TASKS (CELERY)
    # =============================================================================
    CELERY_BROKER_URL: str = Field(..., description="Celery broker URL - REQUIRED from .env")
    CELERY_RESULT_BACKEND: str = Field(..., description="Celery result backend - REQUIRED from .env")

    @computed_field
    @property
    def celery_broker_computed(self) -> str:
        """Return the configured Celery broker URL."""
        return self.CELERY_BROKER_URL

    @computed_field
    @property
    def celery_result_computed(self) -> str:
        """Return the configured Celery result backend URL."""
        return self.CELERY_RESULT_BACKEND

    @computed_field
    @property
    def app_url_computed(self) -> str:
        """Return the configured application URL."""
        return self.APP_URL

    # =============================================================================
    # COMPUTED PROPERTIES
    # =============================================================================
    @computed_field
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"

    @computed_field
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"

    @computed_field
    @property
    def is_staging(self) -> bool:
        """Check if running in staging environment."""
        return self.ENVIRONMENT == "staging"

    @computed_field
    @property
    def docs_url(self) -> Union[str, None]:
        """Get docs URL based on configuration."""
        if not self.ENABLE_DOCS:
            return None
        return "/docs" if self.ENABLE_SWAGGER_UI else None

    @computed_field
    @property
    def redoc_url(self) -> Union[str, None]:
        """Get ReDoc URL based on configuration."""
        if not self.ENABLE_DOCS or not self.ENABLE_REDOC:
            return None
        return "/redoc"

    # =============================================================================
    # VALIDATION
    # =============================================================================
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v):
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of {valid_levels}")
        return v.upper()

    @field_validator("MAX_UPLOAD_SIZE")
    @classmethod
    def validate_upload_size(cls, v):
        if v > 100 * 1024 * 1024:  # 100MB
            raise ValueError("MAX_UPLOAD_SIZE cannot exceed 100MB")
        return v

    @field_validator("APP_URL")
    @classmethod
    def validate_app_url(cls, v, info):        
        if not v:
            raise ValueError("APP_URL is required and must be set in .env file")
        
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError("APP_URL must start with http:// or https://")
        
        return v

    # =============================================================================
    # CONFIGURATION
    # =============================================================================
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"
        validate_assignment = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Using lru_cache ensures settings are loaded once and reused.
    """
    return Settings()


# Global settings instance
settings = get_settings()
