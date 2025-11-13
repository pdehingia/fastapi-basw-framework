"""
Super Admin Booking Management schemas.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum

from app.shared.models.booking import (
    BookingStatus, PaymentStatus, CancelledBy, ModerationStatus
)


class BookingFilterParams(BaseModel):
    """Parameters for filtering bookings."""
    
    search: Optional[str] = Field(None, description="Search in booking number, customer name, provider name")
    status: Optional[BookingStatus] = Field(None, description="Filter by booking status")
    payment_status: Optional[PaymentStatus] = Field(None, description="Filter by payment status")
    occasion_type: Optional[str] = Field(None, description="Filter by occasion type")
    service_type: Optional[str] = Field(None, description="Filter by service type")
    city: Optional[str] = Field(None, description="Filter by city")
    date_from: Optional[datetime] = Field(None, description="Filter bookings from date")
    date_to: Optional[datetime] = Field(None, description="Filter bookings to date")
    amount_min: Optional[Decimal] = Field(None, description="Minimum booking amount")
    amount_max: Optional[Decimal] = Field(None, description="Maximum booking amount")
    has_promo_code: Optional[bool] = Field(None, description="Filter bookings with promo codes")
    
    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    """Booking response schema."""
    
    id: int
    booking_number: str
    customer_user_id: int
    provider_user_id: int
    service_type: str
    occasion_type: str
    booking_date: datetime
    event_date: datetime
    event_duration_hours: int
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    city: str
    state: str
    status: BookingStatus
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[CancelledBy] = None
    cancelled_at: Optional[datetime] = None
    
    # Pricing
    base_price: Decimal
    platform_fee: Decimal
    taxes: Decimal
    discount_amount: Decimal
    promo_code: Optional[str] = None
    total_amount: Decimal
    academy_commission: Decimal
    academy_commission_rate: Decimal
    
    # Payment
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    refund_amount: Decimal
    refund_reason: Optional[str] = None
    
    # Additional details
    special_requests: Optional[str] = None
    guest_count: Optional[int] = None
    contact_phone: str
    contact_email: str
    metadata: Optional[Dict[str, Any]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class BookingDetailResponse(BookingResponse):
    """Extended booking response with related data."""
    
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    provider_name: Optional[str] = None
    provider_business_name: Optional[str] = None
    review_rating: Optional[int] = None
    review_text: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class BookingStatusUpdate(BaseModel):
    """Schema for updating booking status."""
    
    status: BookingStatus = Field(..., description="New booking status")
    reason: Optional[str] = Field(None, description="Reason for status change")
    refund_amount: Optional[Decimal] = Field(None, description="Refund amount if applicable")
    notes: Optional[str] = Field(None, description="Admin notes")
    
    model_config = ConfigDict(from_attributes=True)


class DisputeResolution(BaseModel):
    """Schema for resolving booking disputes."""
    
    resolution: str = Field(..., description="Resolution description")
    refund_percentage: Optional[float] = Field(None, ge=0, le=100, description="Refund percentage")
    refund_amount: Optional[Decimal] = Field(None, ge=0, description="Fixed refund amount")
    notes: Optional[str] = Field(None, description="Resolution notes")
    notify_parties: bool = Field(True, description="Notify customer and provider")
    
    model_config = ConfigDict(from_attributes=True)


class BookingStatistics(BaseModel):
    """Booking statistics for admin dashboard."""
    
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    disputed_bookings: int
    
    total_revenue: Decimal
    platform_fees_collected: Decimal
    refunds_processed: Decimal
    
    average_booking_value: Decimal
    top_cities: List[Dict[str, Any]]
    top_services: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    
    model_config = ConfigDict(from_attributes=True)


class BookingTimelineEntry(BaseModel):
    """Booking timeline entry."""
    
    timestamp: datetime
    action: str
    description: str
    performed_by: Optional[str] = None
    performed_by_type: Optional[str] = None  # customer, provider, admin
    
    model_config = ConfigDict(from_attributes=True)


class BookingTimeline(BaseModel):
    """Complete booking timeline."""
    
    booking_id: int
    timeline: List[BookingTimelineEntry]
    
    model_config = ConfigDict(from_attributes=True)


# Review Management Schemas
class ReviewFilterParams(BaseModel):
    """Parameters for filtering reviews."""
    
    search: Optional[str] = Field(None, description="Search in review text")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Filter by rating")
    moderation_status: Optional[ModerationStatus] = Field(None, description="Filter by moderation status")
    date_from: Optional[datetime] = Field(None, description="Filter reviews from date")
    date_to: Optional[datetime] = Field(None, description="Filter reviews to date")
    has_images: Optional[bool] = Field(None, description="Filter reviews with images")
    is_flagged: Optional[bool] = Field(None, description="Filter flagged reviews")
    
    model_config = ConfigDict(from_attributes=True)


class ReviewResponse(BaseModel):
    """Review response schema."""
    
    id: int
    booking_id: int
    customer_user_id: int
    provider_user_id: int
    rating: int
    review_text: Optional[str] = None
    review_images: Optional[List[str]] = None
    service_rating: Optional[int] = None
    communication_rating: Optional[int] = None
    value_rating: Optional[int] = None
    
    # Moderation
    moderation_status: ModerationStatus
    moderated_by: Optional[int] = None
    moderated_at: Optional[datetime] = None
    moderation_notes: Optional[str] = None
    flag_reason: Optional[str] = None
    helpful_count: int
    report_count: int
    
    # Provider response
    provider_response: Optional[str] = None
    provider_response_at: Optional[datetime] = None
    is_verified: bool
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ReviewDetailResponse(ReviewResponse):
    """Extended review response with related data."""
    
    customer_name: Optional[str] = None
    provider_name: Optional[str] = None
    booking_service_type: Optional[str] = None
    booking_occasion: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class ModerationAction(str, Enum):
    """Moderation actions."""
    APPROVE = "approve"
    FLAG = "flag"
    REMOVE = "remove"


class ReviewModerationRequest(BaseModel):
    """Schema for moderating reviews."""
    
    action: ModerationAction = Field(..., description="Moderation action")
    reason: Optional[str] = Field(None, description="Reason for moderation action")
    notes: Optional[str] = Field(None, description="Moderation notes")
    
    model_config = ConfigDict(from_attributes=True)


class ReviewImageRemovalRequest(BaseModel):
    """Schema for removing specific review images."""
    
    image_urls: List[str] = Field(..., description="URLs of images to remove")
    reason: str = Field(..., description="Reason for image removal")
    
    model_config = ConfigDict(from_attributes=True)


class ReviewStatistics(BaseModel):
    """Review statistics for admin dashboard."""
    
    total_reviews: int
    pending_moderation: int
    approved_reviews: int
    flagged_reviews: int
    removed_reviews: int
    
    average_rating: float
    rating_distribution: Dict[int, int]  # rating -> count
    reviews_with_images: int
    reviews_with_responses: int
    
    flagged_content_reasons: List[Dict[str, Any]]
    monthly_review_trends: List[Dict[str, Any]]
    
    model_config = ConfigDict(from_attributes=True)