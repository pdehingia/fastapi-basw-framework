"""Customer audit logs schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== CUSTOMER AUDIT LOG SCHEMAS =====

class CustomerAuditLogBase(BaseModel):
    """Base schema for customer audit log."""
    customer_user_id: Optional[UUID] = None
    action: str = Field(..., max_length=120, description="Action performed")
    entity: Optional[str] = Field(None, max_length=120, description="Entity type")
    entity_id: Optional[UUID] = None


class CustomerAuditLogResponse(CustomerAuditLogBase):
    """Customer audit log response schema."""
    id: int
    before: Optional[dict] = None
    after: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerAuditLogListResponse(BaseModel):
    """Paginated customer audit log list response."""
    items: List[CustomerAuditLogResponse]
    total: int
    page: int
    size: int
    pages: int


class CustomerAuditLogFilters(BaseModel):
    """Filter parameters for customer audit logs."""
    customer_user_id: Optional[UUID] = None
    action: Optional[str] = None
    entity: Optional[str] = None
    entity_id: Optional[UUID] = None
    created_from: Optional[datetime] = None
    created_to: Optional[datetime] = None


class AuditLogStatistics(BaseModel):
    """Customer audit log statistics."""
    total_logs: int
    by_action: dict
    by_entity: dict
    by_user: dict  # Top 10 most active users
    logs_per_day: List[dict]  # Last 30 days
