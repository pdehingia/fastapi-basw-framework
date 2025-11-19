"""Subscription Management schemas."""

from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field, validator


# Enums
class SubscriptionPlan(str, Enum):
    """Subscription plan types."""
    PREMIUM = "premium"
    ELITE = "elite"


class SubscriptionStatus(str, Enum):
    """Subscription status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAUSED = "paused"
    PAYMENT_FAILED = "payment_failed"


class PaymentStatus(str, Enum):
    """Payment status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# Subscription Schemas
class SubscriptionBase(BaseModel):
    """Base subscription schema."""
    plan_type: SubscriptionPlan = Field(..., description="Plan type (premium/elite)")
    plan_name: str = Field(..., min_length=1, max_length=100, description="Plan name")
    plan_price: Decimal = Field(..., ge=0, description="Plan price")
    billing_cycle: str = Field(..., description="Billing cycle (monthly/yearly)")
    commission_rate: Decimal = Field(..., ge=0, le=100, description="Commission rate percentage")
    features: Dict[str, Any] = Field(..., description="Plan features as JSON")
    auto_renew: bool = Field(True, description="Auto-renewal enabled")


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription."""
    provider_user_id: str = Field(..., description="Provider user UUID")
    start_date: date = Field(..., description="Subscription start date")
    end_date: date = Field(..., description="Subscription end date")
    
    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription."""
    plan_type: Optional[SubscriptionPlan] = None
    plan_name: Optional[str] = Field(None, min_length=1, max_length=100)
    plan_price: Optional[Decimal] = Field(None, ge=0)
    billing_cycle: Optional[str] = None
    commission_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    features: Optional[Dict[str, Any]] = None
    auto_renew: Optional[bool] = None
    end_date: Optional[date] = None


class SubscriptionResponse(SubscriptionBase):
    """Schema for subscription response."""
    id: str
    provider_user_id: str
    start_date: date
    end_date: date
    current_period_start: date
    current_period_end: date
    razorpay_subscription_id: Optional[str]
    status: SubscriptionStatus
    cancel_at_period_end: bool
    cancelled_at: Optional[datetime]
    payment_failed_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionDetailResponse(SubscriptionResponse):
    """Detailed subscription with provider info."""
    provider_name: Optional[str]
    provider_email: Optional[str]
    provider_phone: Optional[str]
    days_remaining: int
    is_expiring_soon: bool


# Subscription Payment Schemas
class SubscriptionPaymentBase(BaseModel):
    """Base subscription payment schema."""
    amount: Decimal = Field(..., ge=0, description="Payment amount")
    currency: str = Field("INR", max_length=3, description="Currency code")


class SubscriptionPaymentCreate(SubscriptionPaymentBase):
    """Schema for creating a subscription payment."""
    subscription_id: str = Field(..., description="Subscription UUID")
    provider_user_id: str = Field(..., description="Provider user UUID")
    billing_period_start: date = Field(..., description="Billing period start")
    billing_period_end: date = Field(..., description="Billing period end")
    razorpay_payment_id: Optional[str] = Field(None, description="Razorpay payment ID")
    razorpay_order_id: Optional[str] = Field(None, description="Razorpay order ID")
    status: PaymentStatus = Field(PaymentStatus.PENDING, description="Payment status")


class SubscriptionPaymentResponse(SubscriptionPaymentBase):
    """Schema for subscription payment response."""
    id: str
    subscription_id: str
    provider_user_id: str
    razorpay_payment_id: Optional[str]
    razorpay_order_id: Optional[str]
    billing_period_start: date
    billing_period_end: date
    status: PaymentStatus
    failure_reason: Optional[str]
    retry_attempt: int
    transaction_id: Optional[str]
    payment_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


# Action Schemas
class SubscriptionCancel(BaseModel):
    """Schema for canceling a subscription."""
    cancel_immediately: bool = Field(
        False, 
        description="Cancel immediately or at period end"
    )
    reason: Optional[str] = Field(None, description="Cancellation reason")


class SubscriptionRenew(BaseModel):
    """Schema for renewing a subscription."""
    new_end_date: date = Field(..., description="New subscription end date")
    payment_id: Optional[str] = Field(None, description="Associated payment ID")


class SubscriptionRetryPayment(BaseModel):
    """Schema for retrying failed payment."""
    razorpay_payment_id: Optional[str] = Field(None, description="New Razorpay payment ID")
    razorpay_order_id: Optional[str] = Field(None, description="New Razorpay order ID")


# Filter Schemas
class SubscriptionFilterParams(BaseModel):
    """Filters for subscription list."""
    search: Optional[str] = Field(None, description="Search in plan name or provider details")
    plan_type: Optional[SubscriptionPlan] = Field(None, description="Filter by plan type")
    status: Optional[SubscriptionStatus] = Field(None, description="Filter by status")
    auto_renew: Optional[bool] = Field(None, description="Filter by auto-renewal status")
    provider_user_id: Optional[str] = Field(None, description="Filter by provider")
    start_date_from: Optional[date] = Field(None, description="Subscription start date from")
    start_date_to: Optional[date] = Field(None, description="Subscription start date to")
    end_date_from: Optional[date] = Field(None, description="Subscription end date from")
    end_date_to: Optional[date] = Field(None, description="Subscription end date to")
    expiring_in_days: Optional[int] = Field(None, ge=1, le=90, description="Expiring within days")


class PaymentFilterParams(BaseModel):
    """Filters for payment list."""
    subscription_id: Optional[str] = Field(None, description="Filter by subscription")
    provider_user_id: Optional[str] = Field(None, description="Filter by provider")
    status: Optional[PaymentStatus] = Field(None, description="Filter by payment status")
    payment_date_from: Optional[date] = Field(None, description="Payment date from")
    payment_date_to: Optional[date] = Field(None, description="Payment date to")
    min_amount: Optional[Decimal] = Field(None, ge=0, description="Minimum payment amount")
    max_amount: Optional[Decimal] = Field(None, ge=0, description="Maximum payment amount")


# List Response Schemas
class SubscriptionListResponse(BaseModel):
    """Response for subscription list."""
    subscriptions: List[SubscriptionDetailResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaymentListResponse(BaseModel):
    """Response for payment list."""
    payments: List[SubscriptionPaymentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Statistics Schemas
class SubscriptionStatistics(BaseModel):
    """Subscription statistics."""
    total_subscriptions: int
    active_subscriptions: int
    cancelled_subscriptions: int
    expired_subscriptions: int
    paused_subscriptions: int
    payment_failed_subscriptions: int
    subscriptions_by_plan: Dict[str, int]
    total_mrr: Decimal  # Monthly Recurring Revenue
    total_arr: Decimal  # Annual Recurring Revenue
    avg_subscription_value: Decimal
    churn_rate: Decimal
    renewal_rate: Decimal
    subscriptions_expiring_30_days: int
    subscriptions_expiring_7_days: int


class PaymentStatistics(BaseModel):
    """Payment statistics."""
    total_payments: int
    successful_payments: int
    failed_payments: int
    pending_payments: int
    total_revenue: Decimal
    avg_payment_amount: Decimal
    payment_success_rate: Decimal
    total_failed_amount: Decimal
    payments_by_month: Dict[str, Decimal]


class ExpiringSubscription(BaseModel):
    """Expiring subscription summary."""
    subscription_id: str
    provider_user_id: str
    provider_name: str
    provider_email: str
    provider_phone: str
    plan_name: str
    plan_type: SubscriptionPlan
    end_date: date
    days_remaining: int
    auto_renew: bool
    status: SubscriptionStatus


class ExpiringSubscriptionsResponse(BaseModel):
    """Response for expiring subscriptions."""
    expiring_subscriptions: List[ExpiringSubscription]
    total: int
    days_threshold: int
