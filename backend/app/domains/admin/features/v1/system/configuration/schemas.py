"""System configuration schemas for admin panel."""

from datetime import datetime, time
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, EmailStr, validator


# Enums
class MaintenanceMode(str, Enum):
    """System maintenance mode options."""
    ACTIVE = "active"
    SCHEDULED = "scheduled" 
    DISABLED = "disabled"


class NotificationChannel(str, Enum):
    """Notification delivery channels."""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


class SecurityLevel(str, Enum):
    """Security policy levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    STRICT = "strict"


class BackupFrequency(str, Enum):
    """Backup schedule frequencies."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"


class FeatureStatus(str, Enum):
    """Feature toggle status."""
    ENABLED = "enabled"
    DISABLED = "disabled"
    BETA = "beta"
    MAINTENANCE = "maintenance"


# Base Configuration Models
class GeneralSettingsUpdate(BaseModel):
    """Schema for updating general system settings."""
    platform_name: Optional[str] = Field(None, max_length=100, description="Platform display name")
    platform_description: Optional[str] = Field(None, max_length=500, description="Platform description")
    default_language: Optional[str] = Field(None, pattern="^[a-z]{2}$", description="Default language code (ISO 639-1)")
    default_currency: Optional[str] = Field(None, pattern="^[A-Z]{3}$", description="Default currency code (ISO 4217)")
    default_timezone: Optional[str] = Field(None, description="Default timezone (e.g., UTC, America/New_York)")
    support_email: Optional[EmailStr] = Field(None, description="Primary support email")
    support_phone: Optional[str] = Field(None, pattern="^\\+?[1-9]\\d{1,14}$", description="Support phone number")
    business_hours_start: Optional[time] = Field(None, description="Business hours start time")
    business_hours_end: Optional[time] = Field(None, description="Business hours end time")
    max_file_upload_size: Optional[int] = Field(None, ge=1, le=500, description="Max file upload size in MB")


class AppSettingsUpdate(BaseModel):
    """Schema for updating application-specific settings."""
    booking_advance_limit_days: Optional[int] = Field(None, ge=1, le=365, description="Maximum days in advance for bookings")
    booking_cancellation_hours: Optional[int] = Field(None, ge=1, le=168, description="Hours before booking for free cancellation")
    artist_commission_rate: Optional[float] = Field(None, ge=0.0, le=1.0, description="Platform commission rate (0-1)")
    minimum_booking_amount: Optional[float] = Field(None, ge=0.0, description="Minimum booking amount")
    auto_approve_artists: Optional[bool] = Field(None, description="Automatically approve artist applications")
    require_id_verification: Optional[bool] = Field(None, description="Require ID verification for artists")
    allow_same_day_booking: Optional[bool] = Field(None, description="Allow same-day bookings")
    enable_review_moderation: Optional[bool] = Field(None, description="Enable review moderation")
    max_photos_per_portfolio: Optional[int] = Field(None, ge=1, le=50, description="Maximum photos in artist portfolio")
    enable_geolocation: Optional[bool] = Field(None, description="Enable geolocation services")


class MaintenanceSettings(BaseModel):
    """Schema for maintenance mode settings."""
    mode: MaintenanceMode = Field(description="Current maintenance mode")
    message: Optional[str] = Field(None, max_length=500, description="Maintenance message to display")
    scheduled_start: Optional[datetime] = Field(None, description="Scheduled maintenance start time")
    scheduled_end: Optional[datetime] = Field(None, description="Scheduled maintenance end time")
    affected_services: Optional[List[str]] = Field(default_factory=list, description="List of affected services")
    allow_admin_access: bool = Field(True, description="Allow admin access during maintenance")
    
    @validator('scheduled_end')
    def end_after_start(cls, v, values):
        if v and values.get('scheduled_start') and v <= values['scheduled_start']:
            raise ValueError('Scheduled end time must be after start time')
        return v


class NotificationPreferences(BaseModel):
    """Schema for notification preferences."""
    new_user_registration: List[NotificationChannel] = Field(default_factory=list)
    new_booking: List[NotificationChannel] = Field(default_factory=list)
    booking_cancellation: List[NotificationChannel] = Field(default_factory=list)
    payment_received: List[NotificationChannel] = Field(default_factory=list)
    dispute_created: List[NotificationChannel] = Field(default_factory=list)
    artist_application: List[NotificationChannel] = Field(default_factory=list)
    system_alerts: List[NotificationChannel] = Field(default_factory=list)
    maintenance_notifications: List[NotificationChannel] = Field(default_factory=list)


class EmailSettings(BaseModel):
    """Schema for email configuration."""
    smtp_host: Optional[str] = Field(None, description="SMTP server host")
    smtp_port: Optional[int] = Field(None, ge=1, le=65535, description="SMTP server port")
    smtp_username: Optional[str] = Field(None, description="SMTP username")
    smtp_password: Optional[str] = Field(None, description="SMTP password (will be encrypted)")
    use_tls: Optional[bool] = Field(True, description="Use TLS encryption")
    use_ssl: Optional[bool] = Field(False, description="Use SSL encryption")
    sender_name: Optional[str] = Field(None, max_length=100, description="Sender display name")
    sender_email: Optional[EmailStr] = Field(None, description="Sender email address")
    reply_to_email: Optional[EmailStr] = Field(None, description="Reply-to email address")


class SmsSettings(BaseModel):
    """Schema for SMS configuration."""
    provider: Optional[str] = Field(None, description="SMS provider (twilio, aws, etc.)")
    api_key: Optional[str] = Field(None, description="Provider API key")
    api_secret: Optional[str] = Field(None, description="Provider API secret")
    sender_id: Optional[str] = Field(None, max_length=11, description="SMS sender ID")
    default_country_code: Optional[str] = Field(None, pattern="^\\+[1-9]\\d{0,3}$", description="Default country code")


class SecurityPolicies(BaseModel):
    """Schema for security policies."""
    password_min_length: Optional[int] = Field(None, ge=8, le=50, description="Minimum password length")
    password_require_uppercase: Optional[bool] = Field(None, description="Require uppercase letters")
    password_require_lowercase: Optional[bool] = Field(None, description="Require lowercase letters")
    password_require_numbers: Optional[bool] = Field(None, description="Require numbers")
    password_require_symbols: Optional[bool] = Field(None, description="Require special symbols")
    session_timeout_minutes: Optional[int] = Field(None, ge=15, le=1440, description="Session timeout in minutes")
    max_login_attempts: Optional[int] = Field(None, ge=3, le=10, description="Maximum login attempts before lockout")
    lockout_duration_minutes: Optional[int] = Field(None, ge=5, le=1440, description="Account lockout duration")
    two_factor_required: Optional[bool] = Field(None, description="Require two-factor authentication")
    ip_whitelist: Optional[List[str]] = Field(default_factory=list, description="Allowed IP addresses")
    security_level: Optional[SecurityLevel] = Field(None, description="Overall security level")


class BackupSettings(BaseModel):
    """Schema for backup configuration."""
    frequency: Optional[BackupFrequency] = Field(None, description="Backup frequency")
    retention_days: Optional[int] = Field(None, ge=7, le=365, description="Backup retention period")
    include_user_data: Optional[bool] = Field(True, description="Include user data in backups")
    include_media_files: Optional[bool] = Field(False, description="Include media files in backups")
    encryption_enabled: Optional[bool] = Field(True, description="Enable backup encryption")
    storage_location: Optional[str] = Field(None, description="Backup storage location")
    max_backup_size_gb: Optional[int] = Field(None, ge=1, le=1000, description="Maximum backup size in GB")


class FeatureToggle(BaseModel):
    """Schema for feature toggle."""
    feature_key: str = Field(description="Unique feature identifier")
    status: FeatureStatus = Field(description="Feature status")
    description: Optional[str] = Field(None, max_length=200, description="Feature description")
    rollout_percentage: Optional[int] = Field(0, ge=0, le=100, description="Rollout percentage (0-100)")
    target_user_types: Optional[List[str]] = Field(default_factory=list, description="Target user types")
    start_date: Optional[datetime] = Field(None, description="Feature start date")
    end_date: Optional[datetime] = Field(None, description="Feature end date")


# Response Models
class SystemSettings(BaseModel):
    """Complete system settings response."""
    general_settings: Dict[str, Any] = Field(description="General platform settings")
    app_settings: Dict[str, Any] = Field(description="Application-specific settings")
    maintenance: MaintenanceSettings = Field(description="Maintenance mode settings")
    notifications: NotificationPreferences = Field(description="Notification preferences")
    email: EmailSettings = Field(description="Email configuration")
    sms: SmsSettings = Field(description="SMS configuration")
    security: SecurityPolicies = Field(description="Security policies")
    backup: BackupSettings = Field(description="Backup settings")
    last_updated: datetime = Field(description="Last update timestamp")
    updated_by: str = Field(description="Admin who made the last update")


class SystemHealth(BaseModel):
    """System health and status information."""
    database_status: str = Field(description="Database connection status")
    redis_status: str = Field(description="Redis connection status")
    storage_status: str = Field(description="File storage status")
    email_service_status: str = Field(description="Email service status")
    sms_service_status: str = Field(description="SMS service status")
    backup_status: str = Field(description="Last backup status")
    disk_usage_percentage: float = Field(description="Disk usage percentage")
    memory_usage_percentage: float = Field(description="Memory usage percentage")
    cpu_usage_percentage: float = Field(description="CPU usage percentage")
    active_users_count: int = Field(description="Currently active users")
    last_health_check: datetime = Field(description="Last health check timestamp")


class FeatureTogglesList(BaseModel):
    """List of feature toggles response."""
    features: List[FeatureToggle] = Field(description="List of feature toggles")
    total_features: int = Field(description="Total number of features")
    enabled_features: int = Field(description="Number of enabled features")
    beta_features: int = Field(description="Number of beta features")


class BackupListItem(BaseModel):
    """Backup list item."""
    backup_id: str = Field(description="Unique backup identifier")
    created_at: datetime = Field(description="Backup creation time")
    size_bytes: int = Field(description="Backup size in bytes")
    type: str = Field(description="Backup type (full, incremental)")
    status: str = Field(description="Backup status")
    includes_media: bool = Field(description="Whether media files are included")
    retention_until: datetime = Field(description="Backup retention expiry date")


class BackupsList(BaseModel):
    """List of backups response."""
    backups: List[BackupListItem] = Field(description="List of backups")
    total_size_bytes: int = Field(description="Total size of all backups")
    oldest_backup: Optional[datetime] = Field(None, description="Oldest backup date")
    newest_backup: Optional[datetime] = Field(None, description="Newest backup date")


# Request Models
class BackupRequest(BaseModel):
    """Request to create a backup."""
    backup_type: str = Field("full", description="Type of backup (full, incremental)")
    include_media: bool = Field(False, description="Include media files")
    description: Optional[str] = Field(None, max_length=200, description="Backup description")


class FeatureToggleUpdate(BaseModel):
    """Update feature toggle request."""
    status: Optional[FeatureStatus] = Field(None, description="New feature status")
    rollout_percentage: Optional[int] = Field(None, ge=0, le=100, description="Rollout percentage")
    target_user_types: Optional[List[str]] = Field(None, description="Target user types")
    start_date: Optional[datetime] = Field(None, description="Feature start date")
    end_date: Optional[datetime] = Field(None, description="Feature end date")