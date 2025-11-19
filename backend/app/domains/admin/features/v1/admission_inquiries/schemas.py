"""Admission inquiries schemas."""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


# ===== ADMISSION INQUIRY SCHEMAS =====

class AdmissionInquiryBase(BaseModel):
    """Base schema for admission inquiry."""
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    full_name: str = Field(..., max_length=255)
    email: EmailStr
    phone: str = Field(..., max_length=20)
    age: Optional[int] = Field(None, gt=0)
    education_level: Optional[str] = Field(None, max_length=100)
    previous_experience: Optional[str] = None
    inquiry_source: Optional[str] = Field(None, max_length=50)
    inquiry_status: str = Field(default="new", max_length=30)
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    conversion_probability: Optional[int] = Field(None, ge=1, le=10)
    assigned_to: Optional[UUID] = None


class AdmissionInquiryCreate(AdmissionInquiryBase):
    """Schema for creating an admission inquiry."""
    pass


class AdmissionInquiryUpdate(BaseModel):
    """Schema for updating an admission inquiry."""
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    age: Optional[int] = Field(None, gt=0)
    education_level: Optional[str] = Field(None, max_length=100)
    previous_experience: Optional[str] = None
    inquiry_source: Optional[str] = Field(None, max_length=50)
    inquiry_status: Optional[str] = Field(None, max_length=30)
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    conversion_probability: Optional[int] = Field(None, ge=1, le=10)
    assigned_to: Optional[UUID] = None


class AdmissionInquiryResponse(AdmissionInquiryBase):
    """Admission inquiry response schema."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdmissionInquiryListResponse(BaseModel):
    """Paginated admission inquiry list response."""
    items: List[AdmissionInquiryResponse]
    total: int
    page: int
    size: int
    pages: int


class AdmissionInquiryFilters(BaseModel):
    """Filter parameters for admission inquiries."""
    academy_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    inquiry_status: Optional[str] = None
    inquiry_source: Optional[str] = None
    assigned_to: Optional[UUID] = None
    follow_up_from: Optional[date] = None
    follow_up_to: Optional[date] = None
    min_conversion_probability: Optional[int] = None


class AdmissionInquiryStatistics(BaseModel):
    """Admission inquiry statistics."""
    total_inquiries: int
    by_status: dict
    by_source: dict
    by_academy: dict
    conversion_rate: float
    avg_conversion_probability: float
    follow_ups_pending: int
    inquiries_per_day: List[dict]  # Last 30 days


class AssignInquiryRequest(BaseModel):
    """Request to assign inquiry to admin user."""
    assigned_to: UUID
    notes: Optional[str] = None
