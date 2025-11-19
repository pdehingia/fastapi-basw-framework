"""Promotions & Marketing schemas."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field


class PromoCodeType(str, Enum):
    """Promo code types."""
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"
    FREE_SHIPPING = "free_shipping"
    FIRST_TIME_USER = "first_time_user"


class PromoCodeStatus(str, Enum):
    """Promo code status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    EXHAUSTED = "exhausted"


class EmailCampaignStatus(str, Enum):
    """Email campaign status."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"


class SMSStatus(str, Enum):
    """SMS status."""
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    PENDING = "pending"


# Promo Code Schemas
class PromoCodeBase(BaseModel):
    """Base promo code schema."""
    code: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    type: PromoCodeType
    value: float = Field(..., ge=0)
    minimum_order_value: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    user_usage_limit: Optional[int] = Field(None, ge=1)
    valid_from: datetime
    valid_until: datetime
    applicable_services: Optional[List[str]] = None
    target_user_types: Optional[List[str]] = None


class PromoCodeCreate(PromoCodeBase):
    """Create promo code schema."""
    pass


class PromoCodeUpdate(BaseModel):
    """Update promo code schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    value: Optional[float] = Field(None, ge=0)
    minimum_order_value: Optional[float] = Field(None, ge=0)
    maximum_discount: Optional[float] = Field(None, ge=0)
    usage_limit: Optional[int] = Field(None, ge=1)
    user_usage_limit: Optional[int] = Field(None, ge=1)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    applicable_services: Optional[List[str]] = None
    target_user_types: Optional[List[str]] = None
    status: Optional[PromoCodeStatus] = None


class PromoCodeResponse(PromoCodeBase):
    """Promo code response schema."""
    id: str
    status: PromoCodeStatus
    total_usage: int = 0
    revenue_generated: float = 0.0
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True


class PromoCodeAnalytics(BaseModel):
    """Promo code analytics schema."""
    id: str
    code: str
    name: str
    total_usage: int
    unique_users: int
    revenue_generated: float
    discount_given: float
    conversion_rate: float
    daily_usage: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]


# Email Campaign Schemas
class EmailCampaignBase(BaseModel):
    """Base email campaign schema."""
    name: str = Field(..., min_length=1, max_length=100)
    subject: str = Field(..., min_length=1, max_length=200)
    sender_name: str = Field(..., min_length=1, max_length=100)
    sender_email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    content: str
    target_segments: List[str]
    scheduled_at: Optional[datetime] = None


class EmailCampaignCreate(EmailCampaignBase):
    """Create email campaign schema."""
    pass


class EmailCampaignUpdate(BaseModel):
    """Update email campaign schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    subject: Optional[str] = Field(None, min_length=1, max_length=200)
    sender_name: Optional[str] = Field(None, min_length=1, max_length=100)
    sender_email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    content: Optional[str] = None
    target_segments: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[EmailCampaignStatus] = None


class EmailCampaignResponse(EmailCampaignBase):
    """Email campaign response schema."""
    id: str
    status: EmailCampaignStatus
    recipients_count: int = 0
    sent_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0
    bounced_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True


# Email Template Schemas
class EmailTemplateBase(BaseModel):
    """Base email template schema."""
    name: str = Field(..., min_length=1, max_length=100)
    subject: str = Field(..., min_length=1, max_length=200)
    content: str
    category: str = Field(..., min_length=1, max_length=50)
    variables: Optional[List[str]] = None


class EmailTemplateCreate(EmailTemplateBase):
    """Create email template schema."""
    pass


class EmailTemplateUpdate(BaseModel):
    """Update email template schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    subject: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    variables: Optional[List[str]] = None


class EmailTemplateResponse(EmailTemplateBase):
    """Email template response schema."""
    id: str
    usage_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: str

    class Config:
        from_attributes = True


# SMS Schemas
class SMSBroadcastRequest(BaseModel):
    """SMS broadcast request schema."""
    message: str = Field(..., min_length=1, max_length=160)
    target_segments: List[str]
    sender_id: str = Field(..., min_length=1, max_length=11)
    schedule_at: Optional[datetime] = None


class SMSResponse(BaseModel):
    """SMS response schema."""
    id: str
    message: str
    sender_id: str
    recipients_count: int
    sent_count: int
    delivered_count: int
    failed_count: int
    status: SMSStatus
    cost: float
    created_at: datetime
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    created_by: str

    class Config:
        from_attributes = True