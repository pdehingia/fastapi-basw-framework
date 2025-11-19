"""
Customer management schemas for admin domain.
Comprehensive CRUD and oversight operations for customer users.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.shared.schemas.base import BaseSchema, BaseResponse


class CustomerStatus(str, Enum):
    """Customer status options."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class CustomerType(str, Enum):
    """Customer types."""
    REGULAR = "regular"
    VIP = "vip"
    PREMIUM = "premium"


# Customer filtering and search schemas
class CustomerFilterParams(BaseSchema):
    """Parameters for filtering customers."""
    
    search: Optional[str] = Field(None, description="Search in name, email, phone")
    status: Optional[CustomerStatus] = None
    customer_type: Optional[CustomerType] = None
    is_verified: Optional[bool] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
    last_login_after: Optional[datetime] = None
    last_login_before: Optional[datetime] = None
    min_bookings: Optional[int] = Field(None, ge=0)
    max_bookings: Optional[int] = Field(None, ge=0)
    min_spent: Optional[Decimal] = Field(None, ge=0)
    max_spent: Optional[Decimal] = Field(None, ge=0)
    has_oauth: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = Field("created_at", pattern="^(created_at|last_login|email|full_name|total_bookings|total_spent)$")
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")


# Customer CRUD schemas
class CustomerUserCreate(BaseSchema):
    """Schema for creating customer users."""
    
    email: Optional[EmailStr] = None  # Can be None for phone-only customers
    phone: str = Field(..., min_length=10, max_length=20)
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    profile_image_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    
    # OAuth fields
    oauth_google_id: Optional[str] = None
    oauth_facebook_id: Optional[str] = None
    oauth_apple_id: Optional[str] = None
    
    # Preferences
    preferred_language: str = Field("en", max_length=5)
    preferred_currency: str = Field("INR", max_length=3)
    email_notifications: bool = True
    sms_notifications: bool = True
    marketing_emails: bool = False
    
    # Initial settings
    loyalty_points: int = Field(0, ge=0)


class CustomerUserUpdate(BaseSchema):
    """Schema for updating customer users."""
    
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other|prefer_not_to_say)$")
    profile_image_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    
    # Preferences
    preferred_language: Optional[str] = Field(None, max_length=5)
    preferred_currency: Optional[str] = Field(None, max_length=3)
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    
    # Admin adjustments
    loyalty_points: Optional[int] = Field(None, ge=0)
    total_spent: Optional[Decimal] = Field(None, ge=0)


class CustomerUserResponse(BaseSchema):
    """Schema for customer user responses."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: Optional[EmailStr]
    phone: str
    full_name: Optional[str]
    date_of_birth: Optional[date]
    gender: Optional[str]
    profile_image_url: Optional[str]
    is_active: bool
    is_verified: bool
    phone_verified_at: Optional[datetime]
    email_verified_at: Optional[datetime]
    
    # OAuth information
    oauth_google_id: Optional[str]
    oauth_facebook_id: Optional[str]
    oauth_apple_id: Optional[str]
    
    # Activity information
    last_login: Optional[datetime]
    two_factor_enabled: bool
    
    # Customer metrics
    total_bookings: int
    total_spent: Decimal
    loyalty_points: int
    
    # Preferences
    preferred_language: str = "en"
    preferred_currency: str = "INR"
    email_notifications: bool = True
    sms_notifications: bool = True
    marketing_emails: bool = False
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class CustomerDetailResponse(CustomerUserResponse):
    """Extended customer details with additional information."""
    
    # Recent activity
    recent_bookings: List[Dict[str, Any]] = []
    recent_reviews: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]] = []
    
    # Customer addresses
    addresses: List[Dict[str, Any]] = []
    
    # Customer preferences and favorites
    preferences: Optional[Dict[str, Any]] = None
    favorite_services: List[str] = []
    
    # Statistical information
    avg_booking_value: Optional[Decimal] = None
    favorite_occasions: List[str] = []
    booking_frequency: Optional[str] = None
    customer_lifetime_value: Optional[Decimal] = None
    
    # Referral information
    referral_code: Optional[str] = None
    referred_customers: int = 0
    total_referral_rewards: Optional[Decimal] = None


# Customer activity and session management
class CustomerSessionResponse(BaseSchema):
    """Customer session information."""
    
    id: UUID
    device_type: Optional[str]
    device_name: Optional[str]
    os_version: Optional[str]
    app_version: Optional[str]
    ip_address: Optional[str]
    city: Optional[str]
    country: Optional[str]
    is_active: bool
    created_at: datetime
    last_active_at: Optional[datetime]
    expires_at: Optional[datetime]


class CustomerActivityLog(BaseSchema):
    """Customer activity log entry."""
    
    id: int
    activity_type: str
    activity_category: Optional[str]
    description: Optional[str]
    ip_address: Optional[str]
    created_at: datetime


# Customer statistics and analytics
class CustomerStatistics(BaseSchema):
    """Customer statistics for dashboard."""
    
    total_customers: int
    active_customers: int
    inactive_customers: int
    verified_customers: int
    pending_verification: int
    vip_customers: int
    new_customers_today: int
    new_customers_this_week: int
    new_customers_this_month: int
    customer_growth_percentage: float
    
    # Engagement metrics
    average_bookings_per_customer: float
    average_customer_value: Decimal
    top_spending_customers: List[Dict[str, Any]] = []
    most_active_customers: List[Dict[str, Any]] = []
    
    # Geographic distribution
    customers_by_city: List[Dict[str, Any]] = []
    customers_by_state: List[Dict[str, Any]] = []
    
    # Demographics
    customers_by_gender: List[Dict[str, Any]] = []
    customers_by_age_group: List[Dict[str, Any]] = []


# Customer status management
class CustomerStatusUpdate(BaseSchema):
    """Schema for updating customer status."""
    
    status: CustomerStatus
    reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    send_notification: bool = True


class CustomerVerificationUpdate(BaseSchema):
    """Schema for customer verification status."""
    
    is_verified: bool
    verification_type: str = Field(..., pattern="^(phone|email|both)$")
    reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    send_notification: bool = True


# Bulk operations
class BulkCustomerAction(str, Enum):
    """Bulk action types for customers."""
    ACTIVATE = "activate"
    DEACTIVATE = "deactivate"
    SUSPEND = "suspend"
    VERIFY = "verify"
    ADD_LOYALTY_POINTS = "add_loyalty_points"
    SEND_NOTIFICATION = "send_notification"


class BulkCustomerOperation(BaseSchema):
    """Schema for bulk customer operations."""
    
    customer_ids: List[UUID] = Field(..., min_length=1, max_length=100)
    action: BulkCustomerAction
    reason: Optional[str] = Field(None, max_length=500)
    
    # Additional parameters for specific actions
    loyalty_points: Optional[int] = Field(None, ge=0)  # For add_loyalty_points action
    notification_message: Optional[str] = Field(None, max_length=1000)  # For send_notification action


class BulkCustomerOperationResponse(BaseResponse):
    """Response for bulk customer operations."""
    
    processed: int
    successful: int
    failed: int
    errors: List[Dict[str, Any]] = []


# Customer communication schemas
class CustomerNotification(BaseSchema):
    """Schema for sending notifications to customers."""
    
    customer_ids: List[UUID] = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=1000)
    notification_type: str = Field("general", pattern="^(general|promotional|reminder|alert)$")
    send_email: bool = False
    send_sms: bool = False
    send_push: bool = True


# Customer export schemas
class CustomerExportFormat(str, Enum):
    """Export format options."""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"


class CustomerExportRequest(BaseSchema):
    """Request for customer data export."""
    
    format: CustomerExportFormat = CustomerExportFormat.CSV
    filters: Optional[CustomerFilterParams] = None
    include_activity: bool = False
    include_bookings: bool = False
    include_financial: bool = False
    date_range_start: Optional[datetime] = None
    date_range_end: Optional[datetime] = None