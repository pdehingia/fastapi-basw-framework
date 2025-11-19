"""Provider user sessions schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== PROVIDER USER SESSION SCHEMAS =====

class ProviderUserSessionBase(BaseModel):
    """Base schema for provider user session."""
    device_type: Optional[str] = Field(None, max_length=30)
    device_name: Optional[str] = None
    os_version: Optional[str] = Field(None, max_length=50)
    app_version: Optional[str] = Field(None, max_length=50)
    ip_address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)


class ProviderUserSessionResponse(ProviderUserSessionBase):
    """Provider user session response schema."""
    id: UUID
    user_id: UUID
    device_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_active_at: datetime
    expires_at: Optional[datetime] = None
    logged_out_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProviderUserSessionListResponse(BaseModel):
    """Paginated provider user session list response."""
    items: List[ProviderUserSessionResponse]
    total: int
    page: int
    size: int
    pages: int


class ProviderUserSessionFilters(BaseModel):
    """Filter parameters for provider user sessions."""
    user_id: Optional[UUID] = None
    device_type: Optional[str] = None
    is_active: Optional[bool] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None
    city: Optional[str] = None
    country: Optional[str] = None


class SessionStatistics(BaseModel):
    """Provider session statistics."""
    total_sessions: int
    active_sessions: int
    expired_sessions: int
    by_device_type: dict
    by_country: dict
    avg_session_duration_hours: Optional[float] = None
    sessions_per_user: float


class ActiveSessionInfo(BaseModel):
    """Active session information."""
    user_id: UUID
    user_email: str
    active_session_count: int
    latest_session_at: datetime
    devices: List[str]
