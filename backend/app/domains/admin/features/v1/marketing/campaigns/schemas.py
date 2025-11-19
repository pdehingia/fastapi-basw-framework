"""
Marketing Management Schemas

Pydantic schemas for marketing management API endpoints including
promo codes, referrals, and advertisements.
"""

from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, Field, validator
from enum import Enum


# Enums
class DiscountTypeEnum(str, Enum):
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class ReferralStatusEnum(str, Enum):
    PENDING = "pending"
    QUALIFIED = "qualified"
    REWARDED = "rewarded"
    EXPIRED = "expired"


class AdTypeEnum(str, Enum):
    BANNER = "banner"
    VIDEO = "video"
    NATIVE = "native"
    INTERSTITIAL = "interstitial"
    SPONSORED_POST = "sponsored_post"


class AdStatusEnum(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    REJECTED = "rejected"


class UserTypeEnum(str, Enum):
    ADMIN = "admin"
    PROVIDER = "provider"
    CUSTOMER = "customer"


# Promo Code Schemas
class PromoCodeBase(BaseModel):
    """Base promo code schema."""
    code: str = Field(..., min_length=3, max_length=40)
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    promo_type: str = Field(..., max_length=20)
    discount_type: DiscountTypeEnum
    discount_value: Decimal = Field(..., gt=0, decimal_places=2)
    max_discount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    valid_from: datetime
    valid_until: datetime
    usage_limit: Optional[int] = Field(None, gt=0)
    user_usage_limit: Optional[int] = Field(None, gt=0)
    restrictions: Optional[Dict[str, Any]] = None
    target: Optional[Dict[str, Any]] = None
    is_active: bool = True
    is_public: bool = False
    campaign_name: Optional[str] = Field(None, max_length=120)
    
    @validator('code')
    def validate_code(cls, v):
        return v.upper().strip()
    
    @validator('valid_until')
    def validate_dates(cls, v, values):
        if 'valid_from' in values and v <= values['valid_from']:
            raise ValueError('valid_until must be after valid_from')
        return v


class PromoCodeCreate(PromoCodeBase):
    """Schema for creating promo code."""
    created_by: UUID


class PromoCodeUpdate(BaseModel):
    """Schema for updating promo code."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    discount_value: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    max_discount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    usage_limit: Optional[int] = Field(None, gt=0)
    user_usage_limit: Optional[int] = Field(None, gt=0)
    restrictions: Optional[Dict[str, Any]] = None
    target: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class PromoCodeResponse(PromoCodeBase):
    """Schema for promo code response."""
    id: UUID
    usage_count: int
    created_by: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PromoCodeUsageStats(BaseModel):
    """Schema for promo code usage statistics."""
    total_usage: int
    usage_limit: Optional[int]
    usage_rate: float
    remaining_uses: int
    is_unlimited: bool
    days_remaining: int


# Referral Schemas
class ReferralBase(BaseModel):
    """Base referral schema."""
    referrer_user_id: UUID
    referrer_user_type: UserTypeEnum
    referral_code: str = Field(..., min_length=3, max_length=50)
    referee_phone: Optional[str] = Field(None, max_length=20)
    referrer_reward_amount: Decimal = Field(100.00, decimal_places=2)
    referee_reward_amount: Decimal = Field(50.00, decimal_places=2)
    expires_at: Optional[datetime] = None


class ReferralCreate(ReferralBase):
    """Schema for creating referral."""
    
    @validator('referral_code')
    def validate_referral_code(cls, v):
        return v.upper().strip()


class ReferralUpdate(BaseModel):
    """Schema for updating referral."""
    referee_user_id: Optional[UUID] = None
    referee_user_type: Optional[UserTypeEnum] = None
    status: Optional[ReferralStatusEnum] = None
    referee_first_booking_id: Optional[UUID] = None
    qualified_at: Optional[datetime] = None
    referrer_wallet_txn_id: Optional[UUID] = None
    referee_wallet_txn_id: Optional[UUID] = None
    expires_at: Optional[datetime] = None


class ReferralResponse(ReferralBase):
    """Schema for referral response."""
    id: UUID
    referee_user_id: Optional[UUID]
    referee_user_type: Optional[UserTypeEnum]
    status: ReferralStatusEnum
    referee_first_booking_id: Optional[UUID]
    qualified_at: Optional[datetime]
    referrer_wallet_txn_id: Optional[UUID]
    referee_wallet_txn_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ReferralStats(BaseModel):
    """Schema for referral statistics."""
    total_referrals: int
    qualified_referrals: int
    rewarded_referrals: int
    pending_referrals: int
    total_rewards_earned: float
    conversion_rate: float


# Advertisement Schemas
class AdBase(BaseModel):
    """Base advertisement schema."""
    advertiser_type: str = Field(..., max_length=20)
    advertiser_name: Optional[str] = Field(None, max_length=200)
    ad_type: AdTypeEnum
    campaign_name: Optional[str] = Field(None, max_length=200)
    creative: Optional[Dict[str, Any]] = None
    targeting: Optional[Dict[str, Any]] = None
    placement: Optional[Dict[str, Any]] = None
    budget: Optional[Dict[str, Any]] = None
    pricing: Optional[Dict[str, Any]] = None
    schedule: Optional[Dict[str, Any]] = None


class AdCreate(AdBase):
    """Schema for creating advertisement."""
    pass


class AdUpdate(BaseModel):
    """Schema for updating advertisement."""
    advertiser_name: Optional[str] = Field(None, max_length=200)
    campaign_name: Optional[str] = Field(None, max_length=200)
    creative: Optional[Dict[str, Any]] = None
    targeting: Optional[Dict[str, Any]] = None
    placement: Optional[Dict[str, Any]] = None
    budget: Optional[Dict[str, Any]] = None
    pricing: Optional[Dict[str, Any]] = None
    schedule: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    status: Optional[AdStatusEnum] = None
    approval: Optional[Dict[str, Any]] = None


class AdResponse(AdBase):
    """Schema for advertisement response."""
    id: UUID
    metrics: Optional[Dict[str, Any]]
    status: AdStatusEnum
    approval: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AdPerformanceMetrics(BaseModel):
    """Schema for advertisement performance metrics."""
    impressions: int
    clicks: int
    conversions: int
    spend: float
    ctr: float  # Click-through rate
    cvr: float  # Conversion rate
    cpc: float  # Cost per click
    cpm: float  # Cost per mille
    roas: float  # Return on ad spend


# Filter and Search Schemas
class PromoCodeFilters(BaseModel):
    """Schema for promo code filtering."""
    search_term: Optional[str] = None
    discount_type: Optional[DiscountTypeEnum] = None
    is_active: Optional[bool] = None
    campaign_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ReferralFilters(BaseModel):
    """Schema for referral filtering."""
    referrer_user_id: Optional[UUID] = None
    referrer_user_type: Optional[UserTypeEnum] = None
    status: Optional[ReferralStatusEnum] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class AdFilters(BaseModel):
    """Schema for advertisement filtering."""
    search_term: Optional[str] = None
    advertiser_type: Optional[str] = None
    ad_type: Optional[AdTypeEnum] = None
    status: Optional[AdStatusEnum] = None
    campaign_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


# Analytics Schemas
class PromoCodeAnalytics(BaseModel):
    """Schema for promo code analytics."""
    total_promo_codes: int
    active_promo_codes: int
    total_usage_count: int
    total_discount_given: float
    average_usage_per_code: float


class ReferralAnalytics(BaseModel):
    """Schema for referral analytics."""
    total_referrals: int
    qualified_referrals: int
    rewarded_referrals: int
    qualification_rate: float
    total_rewards_paid: float
    average_reward_per_referral: float


class AdAnalytics(BaseModel):
    """Schema for advertisement analytics."""
    total_ads: int
    active_ads: int
    total_impressions: int
    total_clicks: int
    total_spend: float
    average_ctr: float
    average_cpc: float


class CampaignPerformance(BaseModel):
    """Schema for campaign performance."""
    campaign_name: str
    type: str  # 'promo_code', 'referral', 'ad'
    performance_score: float
    total_usage: int
    revenue_impact: float


class MarketingDashboard(BaseModel):
    """Schema for marketing dashboard overview."""
    promo_code_analytics: PromoCodeAnalytics
    referral_analytics: ReferralAnalytics
    ad_analytics: AdAnalytics
    top_campaigns: List[CampaignPerformance]
    period_start: Optional[date]
    period_end: Optional[date]


# Bulk Operations Schemas
class BulkPromoCodeCreate(BaseModel):
    """Schema for bulk promo code creation."""
    promo_codes: List[PromoCodeCreate]


class BulkPromoCodeResponse(BaseModel):
    """Schema for bulk promo code response."""
    created_codes: List[PromoCodeResponse]
    failed_codes: List[Dict[str, Any]]
    success_count: int
    failure_count: int


# Campaign Management Schemas
class CampaignCreate(BaseModel):
    """Schema for creating marketing campaign."""
    campaign_name: str = Field(..., min_length=3, max_length=200)
    campaign_type: str = Field(..., pattern="^(promo_code|referral|ad|mixed)$")
    description: Optional[str] = Field(None, max_length=1000)
    start_date: datetime
    end_date: datetime
    budget: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    target_audience: Optional[Dict[str, Any]] = None
    goals: Optional[Dict[str, Any]] = None


class CampaignResponse(BaseModel):
    """Schema for campaign response."""
    id: UUID
    campaign_name: str
    campaign_type: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    budget: Optional[Decimal]
    target_audience: Optional[Dict[str, Any]]
    goals: Optional[Dict[str, Any]]
    performance_metrics: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


# Pagination Schemas
class MarketingPaginatedResponse(BaseModel):
    """Schema for paginated marketing responses."""
    items: List[Union[PromoCodeResponse, ReferralResponse, AdResponse]]
    total: int
    page: int
    size: int
    pages: int


# === FILTER PARAMETERS ===

class PromoCodeFilterParams(BaseModel):
    """Filter parameters for promo code queries."""
    active_only: Optional[bool] = None
    code: Optional[str] = None
    discount_type: Optional[str] = None
    min_discount_value: Optional[float] = None
    max_discount_value: Optional[float] = None


class ReferralFilterParams(BaseModel):
    """Filter parameters for referral queries."""
    status: Optional[str] = None
    referrer_id: Optional[int] = None
    referred_id: Optional[int] = None
    min_commission: Optional[float] = None
    max_commission: Optional[float] = None


class AdFilterParams(BaseModel):
    """Filter parameters for ad queries."""
    active_only: Optional[bool] = None
    ad_type: Optional[str] = None
    salon_id: Optional[int] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None


# === RESPONSE SCHEMAS FOR ANALYTICS ===

class MarketingAnalyticsResponse(BaseModel):
    """Response schema for marketing analytics."""
    promo_code_analytics: PromoCodeAnalytics
    referral_analytics: ReferralAnalytics
    ad_analytics: AdAnalytics


class CampaignPerformanceResponse(BaseModel):
    """Response schema for campaign performance."""
    campaign_name: str
    type: str
    performance_score: float
    total_usage: int
    revenue_impact: float


class BulkOperationResponse(BaseModel):
    """Response schema for bulk operations."""
    success_count: int
    failure_count: int
    failed_items: List[Dict[str, Any]]