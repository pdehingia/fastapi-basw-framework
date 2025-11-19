"""Provider audit logs schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== PROVIDER AUDIT LOG SCHEMAS =====

class ProviderAuditLogBase(BaseModel):
    """Base schema for provider audit log."""
    provider_user_id: Optional[UUID] = None
    action: str = Field(..., max_length=120, description="Action performed")
    entity: Optional[str] = Field(None, max_length=120, description="Entity type")
    entity_id: Optional[UUID] = None


class ProviderAuditLogResponse(ProviderAuditLogBase):
    """Provider audit log response schema."""
    id: int
    before: Optional[dict] = None
    after: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProviderAuditLogListResponse(BaseModel):
    """Paginated provider audit log list response."""
    items: List[ProviderAuditLogResponse]
    total: int
    page: int
    size: int
    pages: int


class ProviderAuditLogFilters(BaseModel):
    """Filter parameters for provider audit logs."""
    provider_user_id: Optional[UUID] = None
    action: Optional[str] = None
    entity: Optional[str] = None
    entity_id: Optional[UUID] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None


class AuditLogStatistics(BaseModel):
    """Provider audit log statistics."""
    total_logs: int
    by_action: dict
    by_entity: dict
    by_user: dict  # Top 10 most active users
    logs_per_day: List[dict]  # Last 30 days
