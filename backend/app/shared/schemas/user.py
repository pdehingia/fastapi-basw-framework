"""
User schemas for different user types with domain-specific validations.
"""

from typing import Optional, List
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, ConfigDict, Field, validator

from app.shared.schemas.base import BaseSchema, BaseDBSchema


# Base user schemas
class BaseUserSchema(BaseSchema):
    """Base schema for all user types."""
    
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: bool = True
    is_verified: bool = False


class BaseUserCreate(BaseUserSchema):
    """Base create schema with password."""
    
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class BaseUserUpdate(BaseSchema):
    """Base update schema."""
    
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class BaseUserInDB(BaseDBSchema, BaseUserSchema):
    """Base schema for database user representation."""
    
    hashed_password: str
    email_verified_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    failed_login_attempts: str = "0"
    locked_until: Optional[datetime] = None


# Admin user schemas
class AdminUserCreate(BaseUserCreate):
    """Schema for creating admin users."""
    
    is_superuser: bool = False
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    can_manage_users: bool = False
    can_manage_system: bool = False
    can_view_reports: bool = False
    can_manage_providers: bool = False
    can_manage_customers: bool = False


class AdminUserUpdate(BaseUserUpdate):
    """Schema for updating admin users."""
    
    is_superuser: Optional[bool] = None
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    can_manage_users: Optional[bool] = None
    can_manage_system: Optional[bool] = None
    can_view_reports: Optional[bool] = None
    can_manage_providers: Optional[bool] = None
    can_manage_customers: Optional[bool] = None


class AdminUserResponse(BaseUserInDB):
    """Schema for admin user API responses."""
    
    is_superuser: bool
    permissions: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    can_manage_users: bool
    can_manage_system: bool
    can_view_reports: bool
    can_manage_providers: bool
    can_manage_customers: bool


# Provider user schemas
class ProviderUserCreate(BaseUserCreate):
    """Schema for creating provider users."""
    
    business_name: Optional[str] = Field(None, max_length=200)
    business_type: Optional[str] = Field(None, max_length=100)
    business_license: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)


class ProviderUserUpdate(BaseUserUpdate):
    """Schema for updating provider users."""
    
    business_name: Optional[str] = Field(None, max_length=200)
    business_type: Optional[str] = Field(None, max_length=100)
    business_license: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    service_categories: Optional[List[str]] = None
    service_areas: Optional[List[str]] = None
    is_featured: Optional[bool] = None


class ProviderUserResponse(BaseUserInDB):
    """Schema for provider user API responses."""
    
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    business_license: Optional[str] = None
    tax_id: Optional[str] = None
    is_approved: bool
    approval_date: Optional[datetime] = None
    approved_by: Optional[UUID] = None
    service_categories: Optional[str] = None
    service_areas: Optional[str] = None
    rating: str = "0.0"
    total_bookings: str = "0"
    is_featured: bool = False


# Customer user schemas
class CustomerUserCreate(BaseUserCreate):
    """Schema for creating customer users."""
    
    preferred_language: str = Field("en", max_length=10)
    preferred_currency: str = Field("USD", max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)


class CustomerUserUpdate(BaseUserUpdate):
    """Schema for updating customer users."""
    
    preferred_language: Optional[str] = Field(None, max_length=10)
    preferred_currency: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=200)
    address_line2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None


class CustomerUserResponse(BaseUserInDB):
    """Schema for customer user API responses."""
    
    preferred_language: str = "en"
    preferred_currency: str = "USD"
    timezone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    total_bookings: str = "0"
    total_spent: str = "0.00"
    loyalty_points: str = "0"
    preferred_providers: Optional[str] = None
    email_notifications: bool = True
    sms_notifications: bool = False
    marketing_emails: bool = False


# Audit log schema
class UserAuditLogCreate(BaseSchema):
    """Schema for creating audit logs."""
    
    user_type: str = Field(..., pattern="^(admin|provider|customer)$")
    user_id: UUID
    user_email: EmailStr
    action: str = Field(..., max_length=100)
    domain: str = Field(..., pattern="^(admin|provider|web)$")
    ip_address: Optional[str] = Field(None, max_length=50)
    user_agent: Optional[str] = Field(None, max_length=500)
    details: Optional[str] = None
    status: str = Field(..., pattern="^(success|failed|blocked)$")


class UserAuditLogResponse(BaseDBSchema):
    """Schema for audit log API responses."""
    
    user_type: str
    user_id: UUID
    user_email: str
    action: str
    domain: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    status: str


# Authentication schemas
class LoginRequest(BaseSchema):
    """Schema for login requests."""
    
    email: EmailStr
    password: str
    domain: str = Field(..., pattern="^(admin|provider|web)$")


class LoginResponse(BaseSchema):
    """Schema for login responses."""
    
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_type: str
    user_id: UUID
    email: str


class PasswordChangeRequest(BaseSchema):
    """Schema for password change requests."""
    
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v