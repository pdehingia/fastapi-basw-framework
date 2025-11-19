"""User activity logs schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== USER ACTIVITY LOG SCHEMAS =====

class UserActivityLogBase(BaseModel):
    """Base schema for user activity log."""
    user_id: UUID
    user_type: str = Field(..., max_length=20, description="admin, provider, or customer")
    activity_type: str = Field(..., max_length=100)
    activity_category: Optional[str] = Field(None, max_length=50)


class UserActivityLogResponse(UserActivityLogBase):
    """User activity log response schema."""
    id: int
    description: Optional[str] = None
    metadata: Optional[dict] = None
    ip_address: Optional[str] = None
    session_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserActivityLogListResponse(BaseModel):
    """Paginated user activity log list response."""
    items: List[UserActivityLogResponse]
    total: int
    page: int
    size: int
    pages: int


class UserActivityLogFilters(BaseModel):
    """Filter parameters for user activity logs."""
    user_id: Optional[UUID] = None
    user_type: Optional[str] = None
    activity_type: Optional[str] = None
    activity_category: Optional[str] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None


class ActivityLogStatistics(BaseModel):
    """User activity log statistics."""
    total_logs: int
    by_user_type: dict
    by_activity_type: dict
    by_activity_category: dict
    by_user: dict  # Top 10 most active users
    logs_per_day: List[dict]  # Last 30 days
    unique_users: int
    unique_sessions: int
