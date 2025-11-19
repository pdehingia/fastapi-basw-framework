"""Address Management schemas."""

from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
from decimal import Decimal


class OwnerType(str, Enum):
    """Address owner type."""
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"


# Address Schemas
class AddressBase(BaseModel):
    """Base address schema."""
    label: Optional[str] = Field(None, max_length=100, description="Address label (e.g., Home, Office)")
    address_line1: str = Field(..., min_length=1, max_length=255, description="Address line 1")
    address_line2: Optional[str] = Field(None, max_length=255, description="Address line 2")
    city: str = Field(..., min_length=1, max_length=120, description="City")
    state: str = Field(..., min_length=1, max_length=120, description="State")
    pincode: str = Field(..., min_length=1, max_length=20, description="Pincode/ZIP")
    country: str = Field("India", max_length=60, description="Country")
    contact_name: Optional[str] = Field(None, max_length=120, description="Contact person name")
    contact_phone: Optional[str] = Field(None, max_length=20, description="Contact phone number")


class AddressCreate(AddressBase):
    """Schema for creating an address."""
    owner_user_id: str = Field(..., description="Owner user UUID")
    owner_type: OwnerType = Field(..., description="Owner type (admin/provider/customer)")
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90, description="Latitude")
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180, description="Longitude")
    is_default: bool = Field(False, description="Set as default address")


class AddressUpdate(BaseModel):
    """Schema for updating an address."""
    label: Optional[str] = Field(None, max_length=100)
    address_line1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=120)
    state: Optional[str] = Field(None, min_length=1, max_length=120)
    pincode: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, max_length=60)
    contact_name: Optional[str] = Field(None, max_length=120)
    contact_phone: Optional[str] = Field(None, max_length=20)
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)


class AddressResponse(AddressBase):
    """Schema for address response."""
    id: str
    owner_user_id: str
    owner_type: str
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    is_verified: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AddressDetailResponse(AddressResponse):
    """Detailed address with owner info."""
    owner_name: Optional[str]
    owner_email: Optional[str]
    owner_phone: Optional[str]


# Bulk Import Schemas
class AddressBulkImportItem(AddressBase):
    """Single address for bulk import."""
    owner_user_id: str
    owner_type: OwnerType
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None


class AddressBulkImport(BaseModel):
    """Schema for bulk address import."""
    addresses: List[AddressBulkImportItem] = Field(..., min_items=1, max_items=100)


class AddressBulkImportResult(BaseModel):
    """Result of bulk import."""
    total_submitted: int
    successful_imports: int
    failed_imports: int
    imported_addresses: List[AddressResponse]
    errors: List[Dict[str, Any]]


# Verification Schemas
class AddressVerify(BaseModel):
    """Schema for address verification."""
    latitude: Decimal = Field(..., ge=-90, le=90, description="Verified latitude")
    longitude: Decimal = Field(..., ge=-180, le=180, description="Verified longitude")
    verification_notes: Optional[str] = Field(None, description="Verification notes")


class AddressVerificationResponse(BaseModel):
    """Address verification response."""
    address_id: str
    is_verified: bool
    verified_at: datetime
    latitude: Decimal
    longitude: Decimal
    verification_notes: Optional[str]


# Filter Schemas
class AddressFilterParams(BaseModel):
    """Filters for address list."""
    search: Optional[str] = Field(None, description="Search in address fields")
    owner_user_id: Optional[str] = Field(None, description="Filter by owner user ID")
    owner_type: Optional[OwnerType] = Field(None, description="Filter by owner type")
    city: Optional[str] = Field(None, description="Filter by city")
    state: Optional[str] = Field(None, description="Filter by state")
    pincode: Optional[str] = Field(None, description="Filter by pincode")
    is_verified: Optional[bool] = Field(None, description="Filter by verification status")
    is_default: Optional[bool] = Field(None, description="Filter by default status")


class AddressListResponse(BaseModel):
    """Response for address list."""
    addresses: List[AddressDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AddressStatistics(BaseModel):
    """Address statistics."""
    total_addresses: int
    verified_addresses: int
    unverified_addresses: int
    default_addresses: int
    addresses_by_owner_type: Dict[str, int]
    addresses_by_state: Dict[str, int]
    addresses_by_city: Dict[str, int]


class SetDefaultRequest(BaseModel):
    """Request to set address as default."""
    user_id: str = Field(..., description="User ID")
    owner_type: OwnerType = Field(..., description="Owner type")
