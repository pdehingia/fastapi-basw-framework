"""
Pydantic schemas for Salon Provider Relationships
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, validator


# ============================================================================
# Salon Provider Schemas
# ============================================================================

class SalonProviderBase(BaseModel):
    """Base schema for SalonProvider"""
    salon_id: UUID = Field(..., description="Salon ID")
    provider_user_id: UUID = Field(..., description="Provider user ID")
    employment_type: str = Field(..., max_length=20, description="Employment type")
    joined_date: date = Field(..., description="Date provider joined salon")
    left_date: Optional[date] = Field(None, description="Date provider left salon")
    is_active: bool = Field(True, description="Employment is active")

    @validator('employment_type')
    def validate_employment_type(cls, v):
        allowed_types = ['full_time', 'part_time', 'freelance']
        if v.lower() not in allowed_types:
            raise ValueError(f"employment_type must be one of: {', '.join(allowed_types)}")
        return v.lower()

    @validator('left_date')
    def validate_left_date(cls, v, values):
        if v is not None and 'joined_date' in values:
            if v < values['joined_date']:
                raise ValueError("left_date must be after joined_date")
        return v


class SalonProviderCreate(SalonProviderBase):
    """Schema for adding a provider to a salon"""
    pass


class SalonProviderUpdate(BaseModel):
    """Schema for updating salon provider details"""
    employment_type: Optional[str] = Field(None, max_length=20)
    joined_date: Optional[date] = None
    left_date: Optional[date] = None
    is_active: Optional[bool] = None

    @validator('employment_type')
    def validate_employment_type(cls, v):
        if v is not None:
            allowed_types = ['full_time', 'part_time', 'freelance']
            if v.lower() not in allowed_types:
                raise ValueError(f"employment_type must be one of: {', '.join(allowed_types)}")
            return v.lower()
        return v


class SalonProviderResponse(SalonProviderBase):
    """Schema for salon provider response"""
    id: UUID
    total_bookings: int = Field(0, description="Total bookings count")
    total_revenue: Decimal = Field(Decimal("0.00"), description="Total revenue generated")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SalonProviderDetailResponse(SalonProviderResponse):
    """Schema for salon provider with additional details"""
    salon_name: Optional[str] = None
    provider_name: Optional[str] = None
    provider_email: Optional[str] = None
    provider_phone: Optional[str] = None


class SalonProviderListResponse(BaseModel):
    """Schema for paginated salon provider list"""
    items: List[SalonProviderDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SalonProviderMetrics(BaseModel):
    """Performance metrics for a salon-provider relationship"""
    salon_provider_id: UUID
    salon_id: UUID
    provider_user_id: UUID
    employment_type: str
    is_active: bool
    total_bookings: int
    total_revenue: Decimal
    average_booking_value: Decimal
    days_employed: int
    revenue_rank: Optional[int] = Field(None, description="Revenue rank among salon providers")


class SalonProviderStatistics(BaseModel):
    """Statistics for salon providers"""
    total_associations: int
    active_associations: int
    inactive_associations: int
    by_employment_type: dict
    total_bookings: int
    total_revenue: Decimal
    average_revenue_per_provider: Decimal


class SalonProviderStatusUpdate(BaseModel):
    """Schema for updating provider status"""
    is_active: bool = Field(..., description="Set provider active status")
    left_date: Optional[date] = Field(None, description="Set left date if deactivating")


# ============================================================================
# Filter and Query Schemas
# ============================================================================

class SalonProviderFilters(BaseModel):
    """Filters for salon provider queries"""
    salon_id: Optional[UUID] = None
    provider_user_id: Optional[UUID] = None
    employment_type: Optional[str] = None
    is_active: Optional[bool] = None
    joined_after: Optional[date] = Field(None, description="Filter by joined date after")
    joined_before: Optional[date] = Field(None, description="Filter by joined date before")
    search: Optional[str] = Field(None, description="Search in provider name, email")
