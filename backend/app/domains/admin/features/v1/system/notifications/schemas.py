"""System Notification Schemas."""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

from app.shared.models.system_notification import (
    NotificationType,
    NotificationPriority,
    TargetAudience
)


class SystemNotificationBase(BaseModel):
    """Base system notification schema."""
    
    title: str = Field(..., max_length=255, description="Notification title")
    message: str = Field(..., description="Notification message/content")
    notification_type: NotificationType = Field(NotificationType.INFO, description="Notification type")
    priority: NotificationPriority = Field(NotificationPriority.MEDIUM, description="Priority level")
    target_audience: TargetAudience = Field(TargetAudience.ALL, description="Target audience")
    starts_at: Optional[datetime] = Field(None, description="When notification becomes visible")
    ends_at: Optional[datetime] = Field(None, description="When notification expires")
    action_url: Optional[str] = Field(None, max_length=500, description="Optional action URL")
    action_label: Optional[str] = Field(None, max_length=100, description="Action button label")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    @field_validator("ends_at")
    @classmethod
    def validate_end_date(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate end date is after start date."""
        if v and "starts_at" in info.data and info.data["starts_at"]:
            if v <= info.data["starts_at"]:
                raise ValueError("ends_at must be after starts_at")
        return v


class SystemNotificationCreate(SystemNotificationBase):
    """Schema for creating system notification."""
    is_published: bool = Field(False, description="Publish immediately")


class SystemNotificationUpdate(BaseModel):
    """Schema for updating system notification."""
    
    title: Optional[str] = Field(None, max_length=255)
    message: Optional[str] = None
    notification_type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    target_audience: Optional[TargetAudience] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    action_url: Optional[str] = Field(None, max_length=500)
    action_label: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("ends_at")
    @classmethod
    def validate_end_date(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate end date is after start date."""
        if v and "starts_at" in info.data and info.data["starts_at"]:
            if v <= info.data["starts_at"]:
                raise ValueError("ends_at must be after starts_at")
        return v


class SystemNotificationResponse(SystemNotificationBase):
    """Schema for system notification response."""
    
    id: UUID
    is_published: bool
    created_by: Optional[UUID]
    updated_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""
        from_attributes = True


class SystemNotificationListResponse(BaseModel):
    """Schema for paginated system notification list."""
    
    items: list[SystemNotificationResponse]
    total: int
    page: int
    size: int
    pages: int


class SystemNotificationFilters(BaseModel):
    """Schema for filtering system notifications."""
    
    notification_type: Optional[NotificationType] = None
    priority: Optional[NotificationPriority] = None
    target_audience: Optional[TargetAudience] = None
    is_published: Optional[bool] = None
    search: Optional[str] = None  # Search in title, message


class SystemNotificationPublishRequest(BaseModel):
    """Schema for publishing system notification."""
    
    is_published: bool = Field(..., description="Publish or unpublish notification")


class SystemNotificationPublishResponse(BaseModel):
    """Schema for system notification publish response."""
    
    id: UUID
    title: str
    is_published: bool
    message: str
