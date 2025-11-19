"""User segments schemas."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ===== USER SEGMENT SCHEMAS =====

class UserSegmentBase(BaseModel):
    """Base schema for user segment."""
    segment_name: str = Field(..., max_length=255)
    segment_description: Optional[str] = None
    segment_type: str = Field(..., max_length=50, description="demographic, behavioral, or geographic")
    user_type: str = Field(..., max_length=50, description="admin, provider, or customer")
    criteria: dict = Field(..., description="Segment criteria as JSON")
    is_active: bool = Field(default=True)


class UserSegmentCreate(UserSegmentBase):
    """Schema for creating a user segment."""
    pass


class UserSegmentUpdate(BaseModel):
    """Schema for updating a user segment."""
    segment_name: Optional[str] = Field(None, max_length=255)
    segment_description: Optional[str] = None
    segment_type: Optional[str] = Field(None, max_length=50)
    user_type: Optional[str] = Field(None, max_length=50)
    criteria: Optional[dict] = None
    is_active: Optional[bool] = None


class UserSegmentResponse(UserSegmentBase):
    """User segment response schema."""
    id: UUID
    estimated_size: int
    last_calculated_at: Optional[datetime] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserSegmentListResponse(BaseModel):
    """Paginated user segment list response."""
    items: List[UserSegmentResponse]
    total: int
    page: int
    size: int
    pages: int


class UserSegmentFilters(BaseModel):
    """Filter parameters for user segments."""
    segment_type: Optional[str] = None
    user_type: Optional[str] = None
    is_active: Optional[bool] = None
    created_by: Optional[UUID] = None


class UserSegmentStatistics(BaseModel):
    """User segment statistics."""
    total_segments: int
    active_segments: int
    by_segment_type: dict
    by_user_type: dict
    total_users_in_segments: int
    avg_segment_size: float
    largest_segments: List[dict]  # Top 5 largest segments


class SegmentSizeResponse(BaseModel):
    """Response for segment size calculation."""
    segment_id: UUID
    estimated_size: int
    last_calculated_at: datetime
