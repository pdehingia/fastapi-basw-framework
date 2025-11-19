"""Business Management Schemas for Admin Panel."""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# Base response schemas
class SalonResponse(BaseModel):
    """Salon response schema for admin panel."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    salon_name: str
    salon_slug: str
    address_id: Optional[UUID] = None
    commission_rate: Optional[Decimal] = None
    
    # Status fields
    is_verified: bool
    is_active: bool
    
    # Business operations
    business_hours: Optional[str] = None  # JSON string
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class AcademyResponse(BaseModel):
    """Academy response schema for admin panel."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    provider_user_id: Optional[UUID] = None
    academy_name: str
    gst_number: Optional[str] = None
    registration_number: Optional[str] = None
    address_id: Optional[UUID] = None
    commission_rate: Optional[Decimal] = None
    
    # Status fields
    is_verified: bool
    is_active: bool
    
    # Academy branding
    branding: Optional[str] = None  # JSON string
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class ServiceResponse(BaseModel):
    """Service response schema for admin panel."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    service_name: str
    service_slug: str
    category: str
    description: Optional[str] = None
    
    # Pricing
    suggested_price_min: Optional[Decimal] = None
    suggested_price_max: Optional[Decimal] = None
    default_duration_minutes: Optional[int] = None
    
    # Media
    image_url: Optional[str] = None
    service_metadata: Optional[str] = None  # JSON string
    
    # Status
    is_active: bool
    is_featured: bool
    display_order: Optional[int] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


# List responses with pagination
class SalonListResponse(BaseModel):
    """Salon list response with pagination."""
    
    salons: List[SalonResponse]
    total: int
    page: int
    size: int
    total_pages: int


class AcademyListResponse(BaseModel):
    """Academy list response with pagination."""
    
    academies: List[AcademyResponse]
    total: int
    page: int
    size: int
    total_pages: int


class ServiceListResponse(BaseModel):
    """Service list response with pagination."""
    
    services: List[ServiceResponse]
    total: int
    page: int
    size: int
    total_pages: int


# Create request schemas
class SalonCreateRequest(BaseModel):
    """Create salon request schema."""
    
    salon_name: str = Field(..., min_length=1, max_length=255, description="Salon name")
    salon_slug: str = Field(..., min_length=1, max_length=255, description="URL-friendly slug")
    address_id: Optional[UUID] = Field(None, description="Address ID")
    commission_rate: Optional[Decimal] = Field(15.00, ge=0, le=100, description="Commission rate percentage")
    
    # Status
    is_verified: bool = Field(False, description="Verification status")
    is_active: bool = Field(True, description="Active status")
    
    # Business operations
    business_hours: Optional[Dict[str, Any]] = Field(None, description="Business hours configuration")


class AcademyCreateRequest(BaseModel):
    """Create academy request schema."""
    
    provider_user_id: Optional[UUID] = Field(None, description="Provider user ID")
    academy_name: str = Field(..., min_length=1, max_length=255, description="Academy name")
    gst_number: Optional[str] = Field(None, max_length=20, description="GST number")
    registration_number: Optional[str] = Field(None, max_length=100, description="Registration number")
    address_id: Optional[UUID] = Field(None, description="Address ID")
    commission_rate: Optional[Decimal] = Field(5.00, ge=0, le=100, description="Commission rate percentage")
    
    # Status
    is_verified: bool = Field(False, description="Verification status")
    is_active: bool = Field(True, description="Active status")
    
    # Branding
    branding: Optional[Dict[str, Any]] = Field(None, description="Branding configuration")


class ServiceCreateRequest(BaseModel):
    """Create service request schema."""
    
    service_name: str = Field(..., min_length=1, max_length=200, description="Service name")
    service_slug: str = Field(..., min_length=1, max_length=200, description="URL-friendly slug")
    category: str = Field(..., min_length=1, max_length=60, description="Service category")
    description: Optional[str] = Field(None, description="Service description")
    
    # Pricing
    suggested_price_min: Optional[Decimal] = Field(None, ge=0, description="Minimum suggested price")
    suggested_price_max: Optional[Decimal] = Field(None, ge=0, description="Maximum suggested price")
    default_duration_minutes: Optional[int] = Field(None, ge=1, description="Default duration in minutes")
    
    # Media
    image_url: Optional[str] = Field(None, description="Service image URL")
    service_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    # Status
    is_active: bool = Field(True, description="Active status")
    is_featured: bool = Field(False, description="Featured status")
    display_order: Optional[int] = Field(None, description="Display order")


# Update request schemas
class SalonUpdateRequest(BaseModel):
    """Update salon request schema."""
    
    salon_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Salon name")
    salon_slug: Optional[str] = Field(None, min_length=1, max_length=255, description="URL-friendly slug")
    address_id: Optional[UUID] = Field(None, description="Address ID")
    commission_rate: Optional[Decimal] = Field(None, ge=0, le=100, description="Commission rate percentage")
    
    # Status
    is_verified: Optional[bool] = Field(None, description="Verification status")
    is_active: Optional[bool] = Field(None, description="Active status")
    
    # Business operations
    business_hours: Optional[Dict[str, Any]] = Field(None, description="Business hours configuration")


class AcademyUpdateRequest(BaseModel):
    """Update academy request schema."""
    
    provider_user_id: Optional[UUID] = Field(None, description="Provider user ID")
    academy_name: Optional[str] = Field(None, min_length=1, max_length=255, description="Academy name")
    gst_number: Optional[str] = Field(None, max_length=20, description="GST number")
    registration_number: Optional[str] = Field(None, max_length=100, description="Registration number")
    address_id: Optional[UUID] = Field(None, description="Address ID")
    commission_rate: Optional[Decimal] = Field(None, ge=0, le=100, description="Commission rate percentage")
    
    # Status
    is_verified: Optional[bool] = Field(None, description="Verification status")
    is_active: Optional[bool] = Field(None, description="Active status")
    
    # Branding
    branding: Optional[Dict[str, Any]] = Field(None, description="Branding configuration")


class ServiceUpdateRequest(BaseModel):
    """Update service request schema."""
    
    service_name: Optional[str] = Field(None, min_length=1, max_length=200, description="Service name")
    service_slug: Optional[str] = Field(None, min_length=1, max_length=200, description="URL-friendly slug")
    category: Optional[str] = Field(None, min_length=1, max_length=60, description="Service category")
    description: Optional[str] = Field(None, description="Service description")
    
    # Pricing
    suggested_price_min: Optional[Decimal] = Field(None, ge=0, description="Minimum suggested price")
    suggested_price_max: Optional[Decimal] = Field(None, ge=0, description="Maximum suggested price")
    default_duration_minutes: Optional[int] = Field(None, ge=1, description="Default duration in minutes")
    
    # Media
    image_url: Optional[str] = Field(None, description="Service image URL")
    service_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    
    # Status
    is_active: Optional[bool] = Field(None, description="Active status")
    is_featured: Optional[bool] = Field(None, description="Featured status")
    display_order: Optional[int] = Field(None, description="Display order")


# Filter schemas
class SalonFilters(BaseModel):
    """Salon filtering options."""
    
    search: Optional[str] = Field(None, description="Search in salon name")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_verified: Optional[bool] = Field(None, description="Filter by verified status")
    commission_min: Optional[Decimal] = Field(None, description="Minimum commission rate")
    commission_max: Optional[Decimal] = Field(None, description="Maximum commission rate")
    created_from: Optional[datetime] = Field(None, description="Filter created from date")
    created_to: Optional[datetime] = Field(None, description="Filter created to date")


class AcademyFilters(BaseModel):
    """Academy filtering options."""
    
    search: Optional[str] = Field(None, description="Search in academy name")
    provider_user_id: Optional[UUID] = Field(None, description="Filter by provider user")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_verified: Optional[bool] = Field(None, description="Filter by verified status")
    has_gst: Optional[bool] = Field(None, description="Filter by GST number presence")
    has_registration: Optional[bool] = Field(None, description="Filter by registration number presence")
    created_from: Optional[datetime] = Field(None, description="Filter created from date")
    created_to: Optional[datetime] = Field(None, description="Filter created to date")


class ServiceFilters(BaseModel):
    """Service filtering options."""
    
    search: Optional[str] = Field(None, description="Search in service name or description")
    category: Optional[str] = Field(None, description="Filter by category")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_featured: Optional[bool] = Field(None, description="Filter by featured status")
    price_min: Optional[Decimal] = Field(None, description="Minimum price range")
    price_max: Optional[Decimal] = Field(None, description="Maximum price range")
    duration_min: Optional[int] = Field(None, description="Minimum duration")
    duration_max: Optional[int] = Field(None, description="Maximum duration")


# Statistics schemas
class BusinessStatisticsResponse(BaseModel):
    """Business statistics response."""
    
    # Salon statistics
    total_salons: int
    active_salons: int
    verified_salons: int
    
    # Academy statistics
    total_academies: int
    active_academies: int
    verified_academies: int
    
    # Service statistics
    total_services: int
    active_services: int
    featured_services: int
    services_by_category: Dict[str, int]
    
    # Recent additions (last 30 days)
    recent_salons: int
    recent_academies: int
    recent_services: int


# Status update schemas
class BusinessStatusUpdate(BaseModel):
    """Business status update request."""
    
    is_active: Optional[bool] = Field(None, description="Active status")
    is_verified: Optional[bool] = Field(None, description="Verified status")


class SalonBusinessHoursUpdate(BaseModel):
    """Salon business hours update request."""
    
    business_hours: Dict[str, Any] = Field(..., description="Business hours configuration")


class ServiceDisplayOrderUpdate(BaseModel):
    """Service display order update request."""
    
    services: List[Dict[str, Any]] = Field(..., description="List of service IDs with new display orders")