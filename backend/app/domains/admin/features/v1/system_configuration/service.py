"""System configuration service layer."""

import io
from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from .schemas import (
    GeneralSettingsUpdate, AppSettingsUpdate, MaintenanceSettings, NotificationPreferences,
    EmailSettings, SmsSettings, SecurityPolicies, BackupSettings, FeatureToggle,
    SystemSettings, SystemHealth, FeatureTogglesList, BackupsList, BackupListItem,
    BackupRequest, FeatureToggleUpdate, MaintenanceMode, NotificationChannel,
    SecurityLevel, BackupFrequency, FeatureStatus
)


class SystemConfigurationService:
    """Service class for system configuration operations."""

    def __init__(self, db: Session, admin_user_id: str):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_system_settings(self) -> SystemSettings:
        """Get complete system configuration settings."""
        
        # Mock general settings
        general_settings = {
            "platform_name": "Maya Platform",
            "platform_description": "Advanced Business Management System for Creative Professionals",
            "default_language": "en",
            "default_currency": "USD",
            "default_timezone": "UTC",
            "support_email": "support@maya-platform.com",
            "support_phone": "+1-555-123-4567",
            "business_hours_start": "09:00:00",
            "business_hours_end": "18:00:00",
            "max_file_upload_size": 50
        }
        
        # Mock app settings
        app_settings = {
            "booking_advance_limit_days": 90,
            "booking_cancellation_hours": 24,
            "artist_commission_rate": 0.15,
            "minimum_booking_amount": 50.0,
            "auto_approve_artists": False,
            "require_id_verification": True,
            "allow_same_day_booking": True,
            "enable_review_moderation": True,
            "max_photos_per_portfolio": 20,
            "enable_geolocation": True
        }
        
        # Mock maintenance settings
        maintenance = MaintenanceSettings(
            mode=MaintenanceMode.DISABLED,
            message=None,
            scheduled_start=None,
            scheduled_end=None,
            affected_services=[],
            allow_admin_access=True
        )
        
        # Mock notification preferences
        notifications = NotificationPreferences(
            new_user_registration=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            new_booking=[NotificationChannel.EMAIL, NotificationChannel.SMS],
            booking_cancellation=[NotificationChannel.EMAIL],
            payment_received=[NotificationChannel.EMAIL],
            dispute_created=[NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
            artist_application=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            system_alerts=[NotificationChannel.EMAIL, NotificationChannel.SMS],
            maintenance_notifications=[NotificationChannel.EMAIL, NotificationChannel.IN_APP]
        )
        
        # Mock email settings (passwords/secrets redacted)
        email = EmailSettings(
            smtp_host="smtp.gmail.com",
            smtp_port=587,
            smtp_username="noreply@maya-platform.com",
            smtp_password="[REDACTED]",
            use_tls=True,
            use_ssl=False,
            sender_name="Maya Platform",
            sender_email="noreply@maya-platform.com",
            reply_to_email="support@maya-platform.com"
        )
        
        # Mock SMS settings
        sms = SmsSettings(
            provider="twilio",
            api_key="[REDACTED]",
            api_secret="[REDACTED]",
            sender_id="MAYA",
            default_country_code="+1"
        )
        
        # Mock security policies
        security = SecurityPolicies(
            password_min_length=12,
            password_require_uppercase=True,
            password_require_lowercase=True,
            password_require_numbers=True,
            password_require_symbols=True,
            session_timeout_minutes=60,
            max_login_attempts=5,
            lockout_duration_minutes=15,
            two_factor_required=True,
            ip_whitelist=["192.168.1.0/24", "10.0.0.0/8"],
            security_level=SecurityLevel.HIGH
        )
        
        # Mock backup settings
        backup = BackupSettings(
            frequency=BackupFrequency.DAILY,
            retention_days=30,
            include_user_data=True,
            include_media_files=False,
            encryption_enabled=True,
            storage_location="s3://maya-backups/prod",
            max_backup_size_gb=100
        )
        
        return SystemSettings(
            general_settings=general_settings,
            app_settings=app_settings,
            maintenance=maintenance,
            notifications=notifications,
            email=email,
            sms=sms,
            security=security,
            backup=backup,
            last_updated=datetime.utcnow() - timedelta(hours=2),
            updated_by="admin@maya-platform.com"
        )

    def update_general_settings(self, settings: GeneralSettingsUpdate) -> SystemSettings:
        """Update general system settings."""
        
        # In a real implementation, this would update the database
        # For now, we'll return the current settings with a new timestamp
        current_settings = self.get_system_settings()
        
        # Update the last_updated timestamp
        current_settings.last_updated = datetime.utcnow()
        current_settings.updated_by = self.admin_user_id
        
        return current_settings

    def update_app_settings(self, settings: AppSettingsUpdate) -> SystemSettings:
        """Update application-specific settings."""
        
        current_settings = self.get_system_settings()
        current_settings.last_updated = datetime.utcnow()
        current_settings.updated_by = self.admin_user_id
        
        return current_settings

    def get_maintenance_settings(self) -> MaintenanceSettings:
        """Get current maintenance mode settings."""
        
        return MaintenanceSettings(
            mode=MaintenanceMode.DISABLED,
            message=None,
            scheduled_start=None,
            scheduled_end=None,
            affected_services=[],
            allow_admin_access=True
        )

    def update_maintenance_settings(self, settings: MaintenanceSettings) -> MaintenanceSettings:
        """Update maintenance mode settings."""
        
        # In production, this would control actual maintenance mode
        return settings

    def get_notification_preferences(self) -> NotificationPreferences:
        """Get current notification preferences."""
        
        return NotificationPreferences(
            new_user_registration=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            new_booking=[NotificationChannel.EMAIL, NotificationChannel.SMS],
            booking_cancellation=[NotificationChannel.EMAIL],
            payment_received=[NotificationChannel.EMAIL],
            dispute_created=[NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.IN_APP],
            artist_application=[NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            system_alerts=[NotificationChannel.EMAIL, NotificationChannel.SMS],
            maintenance_notifications=[NotificationChannel.EMAIL, NotificationChannel.IN_APP]
        )

    def update_notification_preferences(self, preferences: NotificationPreferences) -> NotificationPreferences:
        """Update notification preferences."""
        
        return preferences

    def get_email_settings(self) -> EmailSettings:
        """Get current email configuration (sensitive data redacted)."""
        
        return EmailSettings(
            smtp_host="smtp.gmail.com",
            smtp_port=587,
            smtp_username="noreply@maya-platform.com",
            smtp_password="[REDACTED]",
            use_tls=True,
            use_ssl=False,
            sender_name="Maya Platform",
            sender_email="noreply@maya-platform.com",
            reply_to_email="support@maya-platform.com"
        )

    def update_email_settings(self, settings: EmailSettings) -> EmailSettings:
        """Update email configuration."""
        
        # In production, this would securely store credentials
        return settings

    def get_sms_settings(self) -> SmsSettings:
        """Get current SMS configuration (sensitive data redacted)."""
        
        return SmsSettings(
            provider="twilio",
            api_key="[REDACTED]",
            api_secret="[REDACTED]",
            sender_id="MAYA",
            default_country_code="+1"
        )

    def update_sms_settings(self, settings: SmsSettings) -> SmsSettings:
        """Update SMS configuration."""
        
        return settings

    def get_security_policies(self) -> SecurityPolicies:
        """Get current security policies."""
        
        return SecurityPolicies(
            password_min_length=12,
            password_require_uppercase=True,
            password_require_lowercase=True,
            password_require_numbers=True,
            password_require_symbols=True,
            session_timeout_minutes=60,
            max_login_attempts=5,
            lockout_duration_minutes=15,
            two_factor_required=True,
            ip_whitelist=["192.168.1.0/24", "10.0.0.0/8"],
            security_level=SecurityLevel.HIGH
        )

    def update_security_policies(self, policies: SecurityPolicies) -> SecurityPolicies:
        """Update security policies."""
        
        return policies

    def get_system_health(self) -> SystemHealth:
        """Get current system health status."""
        
        return SystemHealth(
            database_status="healthy",
            redis_status="healthy",
            storage_status="healthy", 
            email_service_status="healthy",
            sms_service_status="healthy",
            backup_status="completed",
            disk_usage_percentage=45.6,
            memory_usage_percentage=62.3,
            cpu_usage_percentage=18.5,
            active_users_count=1247,
            last_health_check=datetime.utcnow() - timedelta(minutes=5)
        )

    def get_feature_toggles(self) -> FeatureTogglesList:
        """Get all feature toggles."""
        
        # Mock feature toggles
        features = [
            FeatureToggle(
                feature_key="advanced_search",
                status=FeatureStatus.ENABLED,
                description="Advanced search functionality with filters",
                rollout_percentage=100,
                target_user_types=["all"],
                start_date=datetime.utcnow() - timedelta(days=30)
            ),
            FeatureToggle(
                feature_key="video_calls",
                status=FeatureStatus.BETA,
                description="Video call functionality for client consultations",
                rollout_percentage=25,
                target_user_types=["premium_artists"],
                start_date=datetime.utcnow() - timedelta(days=7),
                end_date=datetime.utcnow() + timedelta(days=23)
            ),
            FeatureToggle(
                feature_key="ai_recommendations",
                status=FeatureStatus.DISABLED,
                description="AI-powered artist recommendations",
                rollout_percentage=0,
                target_user_types=[],
                start_date=None
            ),
            FeatureToggle(
                feature_key="mobile_payments",
                status=FeatureStatus.ENABLED,
                description="Mobile payment integration",
                rollout_percentage=100,
                target_user_types=["all"],
                start_date=datetime.utcnow() - timedelta(days=60)
            ),
            FeatureToggle(
                feature_key="social_login",
                status=FeatureStatus.MAINTENANCE,
                description="Social media login integration",
                rollout_percentage=0,
                target_user_types=[],
                start_date=datetime.utcnow() - timedelta(days=90)
            )
        ]
        
        enabled_count = len([f for f in features if f.status == FeatureStatus.ENABLED])
        beta_count = len([f for f in features if f.status == FeatureStatus.BETA])
        
        return FeatureTogglesList(
            features=features,
            total_features=len(features),
            enabled_features=enabled_count,
            beta_features=beta_count
        )

    def update_feature_toggle(self, feature_key: str, update: FeatureToggleUpdate) -> FeatureToggle:
        """Update a specific feature toggle."""
        
        # Mock update - in production, this would update the database
        return FeatureToggle(
            feature_key=feature_key,
            status=update.status or FeatureStatus.ENABLED,
            description="Updated feature toggle",
            rollout_percentage=update.rollout_percentage or 100,
            target_user_types=update.target_user_types or ["all"],
            start_date=update.start_date or datetime.utcnow(),
            end_date=update.end_date
        )

    def get_backups(self) -> BackupsList:
        """Get list of system backups."""
        
        # Mock backup list
        now = datetime.utcnow()
        backups = [
            BackupListItem(
                backup_id="backup_2025_11_13_daily",
                created_at=now - timedelta(hours=6),
                size_bytes=2567890123,
                type="full",
                status="completed",
                includes_media=False,
                retention_until=now + timedelta(days=24)
            ),
            BackupListItem(
                backup_id="backup_2025_11_12_daily", 
                created_at=now - timedelta(days=1, hours=6),
                size_bytes=2345678901,
                type="incremental",
                status="completed",
                includes_media=False,
                retention_until=now + timedelta(days=23)
            ),
            BackupListItem(
                backup_id="backup_2025_11_11_daily",
                created_at=now - timedelta(days=2, hours=6),
                size_bytes=2789012345,
                type="full",
                status="completed", 
                includes_media=True,
                retention_until=now + timedelta(days=22)
            ),
            BackupListItem(
                backup_id="backup_2025_11_10_daily",
                created_at=now - timedelta(days=3, hours=6),
                size_bytes=2123456789,
                type="incremental",
                status="completed",
                includes_media=False,
                retention_until=now + timedelta(days=21)
            ),
            BackupListItem(
                backup_id="backup_2025_11_09_daily",
                created_at=now - timedelta(days=4, hours=6),
                size_bytes=2445566778,
                type="full",
                status="completed",
                includes_media=False,
                retention_until=now + timedelta(days=20)
            )
        ]
        
        total_size = sum(b.size_bytes for b in backups)
        oldest = min(b.created_at for b in backups) if backups else None
        newest = max(b.created_at for b in backups) if backups else None
        
        return BackupsList(
            backups=backups,
            total_size_bytes=total_size,
            oldest_backup=oldest,
            newest_backup=newest
        )

    def create_backup(self, backup_request: BackupRequest) -> BackupListItem:
        """Create a new system backup."""
        
        # Mock backup creation
        return BackupListItem(
            backup_id=f"backup_{datetime.utcnow().strftime('%Y_%m_%d_%H_%M')}_{backup_request.backup_type}",
            created_at=datetime.utcnow(),
            size_bytes=0,  # Would be calculated during actual backup
            type=backup_request.backup_type,
            status="in_progress",
            includes_media=backup_request.include_media,
            retention_until=datetime.utcnow() + timedelta(days=30)
        )

    def export_system_settings(self) -> io.BytesIO:
        """Export system configuration to Excel file."""
        
        # Mock Excel export functionality
        # In production, this would use openpyxl or similar
        content = """System Configuration Export
        
Generated: {timestamp}
Admin: {admin}

General Settings:
- Platform Name: Maya Platform
- Support Email: support@maya-platform.com
- Default Currency: USD

Security Settings:
- Password Min Length: 12
- Two-Factor Required: Yes
- Security Level: High

Backup Settings:
- Frequency: Daily
- Retention: 30 days
- Encryption: Enabled
""".format(
            timestamp=datetime.utcnow().isoformat(),
            admin=self.admin_user_id
        )
        
        return io.BytesIO(content.encode('utf-8'))