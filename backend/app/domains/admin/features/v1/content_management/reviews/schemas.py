"""Review management schemas."""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ModerationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FLAGGED = "flagged"
    REMOVED = "removed"
    UNDER_REVIEW = "under_review"


class ModerationAction(str, Enum):
    APPROVE = "approve"
    FLAG = "flag"
    REMOVE = "remove"
    UNDER_REVIEW = "under_review"


class FlagReason(str, Enum):
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    SPAM = "spam"
    FAKE_REVIEW = "fake_review"
    OFFENSIVE_LANGUAGE = "offensive_language"
    MISLEADING_INFO = "misleading_info"
    PRIVACY_VIOLATION = "privacy_violation"
    COPYRIGHT_INFRINGEMENT = "copyright_infringement"
    OTHER = "other"


# Request Schemas
class ReviewFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    rating: Optional[int] = Field(None, ge=1, le=5)
    moderation_status: Optional[ModerationStatus] = None
    booking_id: Optional[int] = None
    customer_id: Optional[int] = None
    artist_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    has_images: Optional[bool] = None
    flagged_only: Optional[bool] = None


class ModerateReviewRequest(BaseModel):
    action: ModerationAction
    reason: Optional[FlagReason] = Field(None, description="Required for flag/remove actions")
    notes: Optional[str] = Field(None, max_length=1000, description="Admin moderation notes")
    notify_user: bool = Field(default=True, description="Send notification to user about moderation")


class RemoveImagesRequest(BaseModel):
    image_urls: List[str] = Field(..., min_items=1, description="List of image URLs to remove")
    reason: str = Field(..., min_length=10, max_length=500, description="Reason for image removal")


class ReviewResponseRequest(BaseModel):
    response: str = Field(..., min_length=10, max_length=1000, description="Response to the review")
    artist_id: int = Field(..., description="Artist ID for whom the response is being posted")


# Response Schemas
class ReviewerInfo(BaseModel):
    id: int
    name: str
    profile_image: Optional[str]
    total_reviews_count: int
    is_verified: bool


class BookingInfo(BaseModel):
    id: int
    event_type: str
    event_date: datetime
    amount_paid: float


class ArtistInfo(BaseModel):
    id: int
    name: str
    profile_image: Optional[str]
    average_rating: float
    total_reviews_count: int


class ReviewImageInfo(BaseModel):
    url: str
    caption: Optional[str]
    is_flagged: bool
    flagged_reason: Optional[str]


class ModerationHistory(BaseModel):
    id: int
    action: ModerationAction
    reason: Optional[FlagReason]
    notes: Optional[str]
    moderated_by: str
    moderated_at: datetime


class ReviewResponse(BaseModel):
    id: int
    booking_id: int
    rating: int
    title: Optional[str]
    comment: Optional[str]
    images: List[ReviewImageInfo]
    reviewer: ReviewerInfo
    booking_info: BookingInfo
    artist: ArtistInfo
    moderation_status: ModerationStatus
    moderation_notes: Optional[str]
    flag_reason: Optional[FlagReason]
    report_count: int
    helpful_count: int
    created_at: datetime
    updated_at: datetime
    moderated_at: Optional[datetime]
    moderated_by: Optional[str]


class ReviewDetailResponse(ReviewResponse):
    moderation_history: List[ModerationHistory]
    artist_response: Optional[str]
    artist_response_date: Optional[datetime]
    flagged_by_users: List[Dict[str, Any]]
    ip_address: Optional[str]
    device_info: Optional[Dict[str, str]]


class ReviewSummary(BaseModel):
    total_reviews: int
    pending_moderation: int
    approved_count: int
    flagged_count: int
    removed_count: int
    average_rating: float
    flagged_today: int
    requires_attention: int


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    summary: ReviewSummary
    pagination: Dict[str, Any]


class FlaggedReview(BaseModel):
    id: int
    review_id: int
    flag_reason: FlagReason
    flagged_by: str
    flagged_at: datetime
    admin_notes: Optional[str]
    priority_score: int


class FlaggedReviewsResponse(BaseModel):
    flagged_reviews: List[FlaggedReview]
    high_priority_count: int
    pending_count: int
    pagination: Dict[str, Any]