"""Provider business details and salon ownership schemas."""

from datetime import date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator


# ===== PROVIDER BUSINESS DETAIL SCHEMAS =====

class ProviderBusinessDetailBase(BaseModel):
    """Base schema for provider business details."""
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax identification number")
    business_license: Optional[str] = Field(None, max_length=100, description="Business license number")
    insurance_policy: Optional[str] = Field(None, max_length=100, description="Insurance policy number")
    years_experience: Optional[int] = Field(None, ge=0, le=99, description="Years of experience")
    specializations: Optional[List[str]] = Field(default_factory=list, description="Service specializations")
    certifications: Optional[List[str]] = Field(default_factory=list, description="Professional certifications")
    languages_spoken: Optional[List[str]] = Field(default_factory=list, description="Languages spoken")
    service_radius_km: Optional[Decimal] = Field(None, ge=0, description="Service radius in kilometers")
    mobile_service_available: bool = Field(default=False, description="Offers mobile services")
    accepts_walk_ins: bool = Field(default=True, description="Accepts walk-in customers")
    payment_methods: Optional[List[str]] = Field(default_factory=list, description="Accepted payment methods")


class ProviderBusinessDetailCreate(ProviderBusinessDetailBase):
    """Schema for creating provider business details."""
    provider_user_id: UUID = Field(..., description="Provider user ID")


class ProviderBusinessDetailUpdate(BaseModel):
    """Schema for updating provider business details."""
    tax_id: Optional[str] = Field(None, max_length=50)
    business_license: Optional[str] = Field(None, max_length=100)
    insurance_policy: Optional[str] = Field(None, max_length=100)
    years_experience: Optional[int] = Field(None, ge=0, le=99)
    specializations: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    languages_spoken: Optional[List[str]] = None
    service_radius_km: Optional[Decimal] = Field(None, ge=0)
    mobile_service_available: Optional[bool] = None
    accepts_walk_ins: Optional[bool] = None
    payment_methods: Optional[List[str]] = None


class ProviderBusinessDetailResponse(ProviderBusinessDetailBase):
    """Schema for provider business detail response."""
    id: UUID
    provider_user_id: UUID
    approval_status: str
    approval_date: Optional[date] = None
    approved_by: Optional[UUID] = None
    rejection_reason: Optional[str] = None
    is_featured: bool
    featured_until: Optional[date] = None
    rating: Optional[Decimal] = None
    total_reviews: int
    total_bookings: int
    revenue_generated: Optional[Decimal] = None
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True


# ===== APPROVAL WORKFLOW SCHEMAS =====

class ApprovalRequest(BaseModel):
    """Schema for approval/rejection request."""
    approved: bool = Field(..., description="True to approve, False to reject")
    notes: Optional[str] = Field(None, max_length=500, description="Admin notes")
    rejection_reason: Optional[str] = Field(None, max_length=500, description="Reason for rejection (required if rejected)")

    @model_validator(mode='after')
    def validate_rejection_reason(self):
        """Ensure rejection reason is provided when rejected."""
        if not self.approved and not self.rejection_reason:
            raise ValueError("rejection_reason is required when approved=False")
        return self


class FeaturedStatusUpdate(BaseModel):
    """Schema for updating featured status."""
    is_featured: bool = Field(..., description="Featured status")
    featured_until: Optional[date] = Field(None, description="Featured until date (required if is_featured=True)")

    @model_validator(mode='after')
    def validate_featured_date(self):
        """Ensure featured_until is provided when is_featured=True."""
        if self.is_featured and not self.featured_until:
            raise ValueError("featured_until is required when is_featured=True")
        return self


# ===== PROVIDER SALON OWNERSHIP SCHEMAS =====

class ProviderSalonBase(BaseModel):
    """Base schema for provider-salon relationship."""
    ownership_type: str = Field(..., max_length=50, description="owner, manager, partner")
    ownership_percentage: Optional[Decimal] = Field(None, ge=0, le=100, description="Ownership percentage")
    joined_date: date = Field(..., description="Date joined/acquired ownership")
    is_active: bool = Field(default=True, description="Active status")
    permissions: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Management permissions")

    @field_validator('ownership_type')
    @classmethod
    def validate_ownership_type(cls, v: str) -> str:
        """Validate ownership type."""
        allowed_types = ['owner', 'manager', 'partner']
        if v.lower() not in allowed_types:
            raise ValueError(f"ownership_type must be one of: {', '.join(allowed_types)}")
        return v.lower()


class ProviderSalonCreate(ProviderSalonBase):
    """Schema for creating provider-salon relationship."""
    provider_user_id: UUID = Field(..., description="Provider user ID")
    salon_id: UUID = Field(..., description="Salon ID")


class ProviderSalonUpdate(BaseModel):
    """Schema for updating provider-salon relationship."""
    ownership_type: Optional[str] = Field(None, max_length=50)
    ownership_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None
    left_date: Optional[date] = Field(None, description="Date left (deactivates relationship)")
    permissions: Optional[Dict[str, Any]] = None

    @field_validator('ownership_type')
    @classmethod
    def validate_ownership_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate ownership type."""
        if v is None:
            return v
        allowed_types = ['owner', 'manager', 'partner']
        if v.lower() not in allowed_types:
            raise ValueError(f"ownership_type must be one of: {', '.join(allowed_types)}")
        return v.lower()


class ProviderSalonResponse(ProviderSalonBase):
    """Schema for provider-salon relationship response."""
    provider_user_id: UUID
    salon_id: UUID
    left_date: Optional[date] = None

    class Config:
        from_attributes = True


class TransferOwnershipRequest(BaseModel):
    """Schema for transferring salon ownership."""
    new_owner_id: UUID = Field(..., description="New owner provider ID")
    ownership_percentage: Decimal = Field(..., ge=0, le=100, description="Ownership percentage to transfer")
    transfer_date: date = Field(..., description="Effective transfer date")
    notes: Optional[str] = Field(None, max_length=500, description="Transfer notes")


# ===== FILTER AND STATISTICS SCHEMAS =====

class BusinessDetailFilterParams(BaseModel):
    """Filter parameters for provider business details."""
    approval_status: Optional[str] = Field(None, description="Filter by approval status")
    is_featured: Optional[bool] = Field(None, description="Filter by featured status")
    min_rating: Optional[Decimal] = Field(None, ge=0, le=5, description="Minimum rating")
    mobile_service_available: Optional[bool] = Field(None, description="Filter by mobile service availability")
    min_years_experience: Optional[int] = Field(None, ge=0, description="Minimum years of experience")
    specialization: Optional[str] = Field(None, description="Filter by specialization")
    certification: Optional[str] = Field(None, description="Filter by certification")


class SalonOwnershipFilterParams(BaseModel):
    """Filter parameters for salon ownership."""
    provider_user_id: Optional[UUID] = Field(None, description="Filter by provider")
    salon_id: Optional[UUID] = Field(None, description="Filter by salon")
    ownership_type: Optional[str] = Field(None, description="Filter by ownership type")
    is_active: Optional[bool] = Field(None, description="Filter by active status")


class BusinessStatistics(BaseModel):
    """Statistics for provider business details."""
    total_details: int = Field(..., description="Total business details")
    pending_approval: int = Field(..., description="Pending approval")
    approved: int = Field(..., description="Approved")
    rejected: int = Field(..., description="Rejected")
    featured_providers: int = Field(..., description="Featured providers")
    avg_rating: Optional[Decimal] = Field(None, description="Average rating")
    avg_years_experience: Optional[Decimal] = Field(None, description="Average years of experience")
    total_revenue: Optional[Decimal] = Field(None, description="Total revenue generated")
    by_approval_status: Dict[str, int] = Field(default_factory=dict, description="Count by approval status")
    top_specializations: List[Dict[str, Any]] = Field(default_factory=list, description="Top specializations")


class SalonOwnershipStatistics(BaseModel):
    """Statistics for salon ownership."""
    total_relationships: int = Field(..., description="Total relationships")
    active_relationships: int = Field(..., description="Active relationships")
    by_ownership_type: Dict[str, int] = Field(default_factory=dict, description="Count by ownership type")
    providers_with_multiple_salons: int = Field(..., description="Providers owning multiple salons")
    salons_with_multiple_owners: int = Field(..., description="Salons with multiple owners")


# ===== LIST RESPONSE SCHEMAS =====

class ProviderBusinessDetailListResponse(BaseModel):
    """Response schema for listing provider business details."""
    items: List[ProviderBusinessDetailResponse]
    total: int
    page: int
    size: int
    pages: int


class ProviderSalonListResponse(BaseModel):
    """Response schema for listing provider-salon relationships."""
    items: List[ProviderSalonResponse]
    total: int
    page: int
    size: int
    pages: int
