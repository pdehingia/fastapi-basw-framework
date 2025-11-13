"""
User management schemas for admin domain.
Comprehensive CRUD and oversight operations for all user types.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.shared.schemas.base import BaseSchema, BaseResponse


class UserType(str, Enum):
    """User types in the system."""
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"


class UserStatus(str, Enum):
    """User status options."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class AdminRole(str, Enum):
    """Admin role types."""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MODERATOR = "moderator"


class ProviderStatus(str, Enum):
    """Provider-specific status."""
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


# User listing and filtering schemas
class UserFilterParams(BaseSchema):
    """Parameters for filtering users."""
    
    user_type: Optional[UserType] = None
    status: Optional[UserStatus] = None
    search: Optional[str] = Field(None, description="Search in name, email, username")
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    last_login_after: Optional[datetime] = None
    last_login_before: Optional[datetime] = None
    is_verified: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = Field("created_at", pattern="^(created_at|last_login|email|full_name)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")


# Admin user management schemas
class AdminUserCreate(BaseSchema):
    """Schema for creating admin users."""
    
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: AdminRole = AdminRole.ADMIN
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    can_manage_users: bool = False
    can_manage_system: bool = False
    can_view_reports: bool = False
    is_active: bool = True


class AdminUserUpdate(BaseSchema):
    """Schema for updating admin users."""
    
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[AdminRole] = None
    department: Optional[str] = Field(None, max_length=100)
    employee_id: Optional[str] = Field(None, max_length=50)
    can_manage_users: Optional[bool] = None
    can_manage_system: Optional[bool] = None
    can_view_reports: Optional[bool] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class AdminUserResponse(BaseSchema):
    """Schema for admin user responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    username: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str
    department: Optional[str]
    employee_id: Optional[str]
    is_active: bool
    is_verified: bool
    is_superuser: bool
    can_manage_users: bool
    can_manage_system: bool
    can_view_reports: bool
    last_login: Optional[datetime]
    failed_login_attempts: int
    locked_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# Provider user management schemas  
class ProviderUserCreate(BaseSchema):
    """Schema for creating provider users."""
    
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    business_name: str = Field(..., min_length=2, max_length=200)
    contact_person: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., max_length=20)
    business_type: str = Field(..., max_length=100)
    business_address: Optional[str] = Field(None, max_length=500)
    business_description: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=200)
    status: ProviderStatus = ProviderStatus.PENDING
    is_active: bool = True


class ProviderUserUpdate(BaseSchema):
    """Schema for updating provider users."""
    
    email: Optional[EmailStr] = None
    business_name: Optional[str] = Field(None, min_length=2, max_length=200)
    contact_person: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    business_type: Optional[str] = Field(None, max_length=100)
    business_address: Optional[str] = Field(None, max_length=500)
    business_description: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=200)
    status: Optional[ProviderStatus] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class ProviderUserResponse(BaseSchema):
    """Schema for provider user responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    business_name: str
    contact_person: str
    phone: str
    business_type: str
    business_address: Optional[str]
    business_description: Optional[str]
    website: Optional[str]
    status: str
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime]
    failed_login_attempts: int
    locked_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# Customer user management schemas
class CustomerUserCreate(BaseSchema):
    """Schema for creating customer users."""
    
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    is_active: bool = True


class CustomerUserUpdate(BaseSchema):
    """Schema for updating customer users."""
    
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class CustomerUserResponse(BaseSchema):
    """Schema for customer user responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str]
    date_of_birth: Optional[datetime]
    gender: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    is_active: bool
    is_verified: bool
    last_login: Optional[datetime]
    failed_login_attempts: int
    locked_until: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# Bulk operations schemas
class BulkUserAction(str, Enum):
    """Bulk action types."""
    ACTIVATE = "activate"
    DEACTIVATE = "deactivate"
    SUSPEND = "suspend"
    VERIFY = "verify"
    DELETE = "delete"


class BulkUserOperation(BaseSchema):
    """Schema for bulk user operations."""
    
    user_ids: List[UUID] = Field(..., min_length=1, max_length=100)
    action: BulkUserAction
    reason: Optional[str] = Field(None, max_length=500)


class BulkOperationResponse(BaseResponse):
    """Response for bulk operations."""
    
    processed: int
    successful: int
    failed: int
    errors: List[Dict[str, Any]] = []


# User statistics and analytics
class UserStatistics(BaseSchema):
    """User statistics for dashboard."""
    
    total_users: int
    admin_users: int
    provider_users: int
    customer_users: int
    active_users: int
    inactive_users: int
    verified_users: int
    pending_verification: int
    new_users_today: int
    new_users_this_week: int
    new_users_this_month: int
    user_growth_percentage: float


class UserActivitySummary(BaseSchema):
    """User activity summary."""
    
    user_id: UUID
    user_email: str
    user_type: UserType
    last_login: Optional[datetime]
    total_sessions: int
    failed_login_attempts: int
    recent_activities: List[Dict[str, Any]] = []


# Paginated responses
class PaginatedUsersResponse(BaseResponse):
    """Paginated user list response."""
    
    users: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


# Password reset schemas
class AdminPasswordReset(BaseSchema):
    """Schema for admin password reset."""
    
    user_id: UUID
    new_password: str = Field(..., min_length=8, max_length=100)
    force_password_change: bool = True
    notify_user: bool = True