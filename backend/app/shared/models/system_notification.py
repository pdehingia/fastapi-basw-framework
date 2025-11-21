"""
System Notification Model

Platform-wide announcements and maintenance alerts
"""

from sqlalchemy import Column, String, Boolean, UUID, TIMESTAMP, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from app.shared.models.base import Base
import uuid
from datetime import datetime
import enum


class NotificationType(str, enum.Enum):
    """System notification types"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"
    MAINTENANCE = "maintenance"
    UPDATE = "update"


class NotificationPriority(str, enum.Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TargetAudience(str, enum.Enum):
    """Target audience for notifications"""
    ALL = "all"
    ADMINS = "admins"
    PROVIDERS = "providers"
    CUSTOMERS = "customers"
    ACADEMY_PROVIDERS = "academy_providers"
    SALON_PROVIDERS = "salon_providers"


class SystemNotification(Base):
    """System-wide notifications for platform announcements"""
    
    __tablename__ = "system_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    message = Column(String, nullable=False)
    notification_type = Column(
        SQLEnum(NotificationType, name="notification_type_enum", create_type=False),
        default=NotificationType.INFO,
        nullable=False
    )
    priority = Column(
        SQLEnum(NotificationPriority, name="notification_priority_enum", create_type=False),
        default=NotificationPriority.MEDIUM,
        nullable=False
    )
    target_audience = Column(
        SQLEnum(TargetAudience, name="target_audience_enum", create_type=False),
        default=TargetAudience.ALL,
        nullable=False
    )
    
    # Publishing control
    is_published = Column(Boolean, default=False, nullable=False)
    starts_at = Column(TIMESTAMP, nullable=True)
    ends_at = Column(TIMESTAMP, nullable=True)
    
    # Additional data
    action_url = Column(String, nullable=True)  # Optional action button URL
    action_label = Column(String(100), nullable=True)  # Action button text
    notification_metadata = Column(JSONB, nullable=True)  # Additional metadata
    
    # Tracking
    created_at = Column(TIMESTAMP, default=datetime.utcnow, nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    updated_by = Column(UUID(as_uuid=True), nullable=True)

    def __repr__(self):
        return f"<SystemNotification(title={self.title}, type={self.notification_type})>"
