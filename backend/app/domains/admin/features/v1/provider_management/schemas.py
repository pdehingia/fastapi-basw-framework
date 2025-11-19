"""Provider Management Schemas for Admin Panel."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class ProviderUserResponse(BaseModel):
    """Provider user response schema for admin panel."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    
    # Status fields
    is_active: bool
    is_verified: bool
    email_verified_at: Optional[datetime] = None
    
    # Business information
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    
    # Provider status
    verification_status: str  # 'pending', 'verified', 'rejected'
    verified_at: Optional[datetime] = None
    verification_documents: Optional[str] = None  # JSON string
    
    # Business operations
    is_accepting_bookings: bool
    business_hours: Optional[str] = None  # JSON string
    service_area: Optional[str] = None
    
    # Security info
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class ProviderUserListResponse(BaseModel):
    """Provider user list response with pagination."""
    
    providers: List[ProviderUserResponse]
    total: int
    page: int
    size: int
    total_pages: int


class ProviderUserCreateRequest(BaseModel):
    """Create provider user request schema."""
    
    email: EmailStr = Field(..., description="Provider email address")
    username: str = Field(..., min_length=3, max_length=100, description="Unique username")
    password: str = Field(..., min_length=8, description="Password for the provider")
    full_name: Optional[str] = Field(None, max_length=150, description="Full name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    # Business information
    business_name: Optional[str] = Field(None, max_length=200, description="Business name")
    business_type: Optional[str] = Field(None, max_length=100, description="Business type")
    business_registration_number: Optional[str] = Field(None, max_length=100, description="Business registration number")
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID")
    
    # Business operations
    is_accepting_bookings: bool = Field(True, description="Whether accepting bookings")
    business_hours: Optional[Dict[str, Any]] = Field(None, description="Business hours configuration")
    service_area: Optional[str] = Field(None, description="Service area description")
    
    # Status
    is_active: bool = Field(True, description="Whether provider is active")
    verification_status: str = Field("pending", description="Verification status")


class ProviderUserUpdateRequest(BaseModel):
    """Update provider user request schema."""
    
    full_name: Optional[str] = Field(None, max_length=150, description="Full name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    # Business information
    business_name: Optional[str] = Field(None, max_length=200, description="Business name")
    business_type: Optional[str] = Field(None, max_length=100, description="Business type")
    business_registration_number: Optional[str] = Field(None, max_length=100, description="Business registration number")
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID")
    
    # Business operations
    is_accepting_bookings: Optional[bool] = Field(None, description="Whether accepting bookings")
    business_hours: Optional[Dict[str, Any]] = Field(None, description="Business hours configuration")
    service_area: Optional[str] = Field(None, description="Service area description")
    
    # Status
    is_active: Optional[bool] = Field(None, description="Whether provider is active")
    is_verified: Optional[bool] = Field(None, description="Whether provider is verified")
    verification_status: Optional[str] = Field(None, description="Verification status")


class ProviderUserFilters(BaseModel):
    """Provider user filtering options."""
    
    search: Optional[str] = Field(None, description="Search in email, username, full_name, business_name")
    email: Optional[str] = Field(None, description="Filter by email")
    verification_status: Optional[str] = Field(None, description="Filter by verification status")
    business_type: Optional[str] = Field(None, description="Filter by business type")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_verified: Optional[bool] = Field(None, description="Filter by verified status")
    is_accepting_bookings: Optional[bool] = Field(None, description="Filter by booking acceptance")
    has_business_registration: Optional[bool] = Field(None, description="Filter by business registration")
    created_from: Optional[datetime] = Field(None, description="Filter created from date")
    created_to: Optional[datetime] = Field(None, description="Filter created to date")


class ProviderStatisticsResponse(BaseModel):
    """Provider user statistics response."""
    
    total_providers: int
    active_providers: int
    verified_providers: int
    pending_verification: int
    accepting_bookings: int
    recent_registrations: int  # Last 30 days
    
    # By verification status
    verification_stats: Dict[str, int]
    
    # By business type
    business_type_stats: Dict[str, int]


class ProviderVerificationRequest(BaseModel):
    """Provider verification update request."""
    
    verification_status: str = Field(..., description="New verification status")
    verification_notes: Optional[str] = Field(None, description="Verification notes or reason")


class ProviderBusinessHoursUpdate(BaseModel):
    """Provider business hours update request."""
    
    business_hours: Dict[str, Any] = Field(..., description="Business hours configuration")


class ProviderStatusUpdate(BaseModel):
    """Provider status update request."""
    
    is_active: Optional[bool] = Field(None, description="Active status")
    is_accepting_bookings: Optional[bool] = Field(None, description="Booking acceptance status")
    verification_status: Optional[str] = Field(None, description="Verification status")