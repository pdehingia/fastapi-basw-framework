"""Artist verification management schemas."""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"


class VerificationDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


class VerificationBadgeType(str, Enum):
    BASIC_VERIFIED = "basic_verified"
    PREMIUM_VERIFIED = "premium_verified"
    GOLD_VERIFIED = "gold_verified"
    FEATURED_ARTIST = "featured_artist"


class PortfolioAction(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    FLAG = "flag"


class DocumentType(str, Enum):
    ID_PROOF = "id_proof"
    ADDRESS_PROOF = "address_proof"
    BUSINESS_LICENSE = "business_license"
    PORTFOLIO_CERTIFICATE = "portfolio_certificate"
    BANK_DETAILS = "bank_details"
    PAN_CARD = "pan_card"
    GST_CERTIFICATE = "gst_certificate"


# Request Schemas
class VerificationFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    status: Optional[VerificationStatus] = None
    verification_type: Optional[str] = None
    submitted_date_start: Optional[datetime] = None
    submitted_date_end: Optional[datetime] = None
    artist_name: Optional[str] = None
    city: Optional[str] = None


class VerificationDecisionRequest(BaseModel):
    decision: VerificationDecision
    rejection_reason: Optional[str] = Field(None, description="Required for rejection")
    notes: Optional[str] = Field(None, max_length=1000)
    verification_badge: Optional[VerificationBadgeType] = Field(None, description="Badge type for approved artists")
    notify_artist: bool = Field(default=True, description="Send notification to artist")


class PortfolioModerationRequest(BaseModel):
    action: PortfolioAction
    rejection_reason: Optional[str] = Field(None, description="Required for reject/flag actions")
    notes: Optional[str] = Field(None, max_length=500)


class BulkPortfolioModerationRequest(BaseModel):
    image_ids: List[int] = Field(..., min_items=1, description="List of portfolio image IDs")
    action: PortfolioAction
    rejection_reason: Optional[str] = Field(None, description="Required for reject/flag actions")
    notes: Optional[str] = Field(None, max_length=500)


class PortfolioFilters(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    status: Optional[str] = Field(None, description="pending, approved, rejected")
    artist_id: Optional[int] = None
    uploaded_date_start: Optional[datetime] = None
    uploaded_date_end: Optional[datetime] = None


# Response Schemas
class ArtistBasicInfo(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    city: str
    profile_image: Optional[str]
    registration_date: datetime
    total_bookings: int
    average_rating: float
    is_active: bool


class VerificationDocument(BaseModel):
    id: int
    document_type: DocumentType
    document_url: str
    document_name: str
    uploaded_at: datetime
    file_size: int
    mime_type: str
    is_verified: bool
    verification_notes: Optional[str]


class VerificationRequestResponse(BaseModel):
    id: int
    artist: ArtistBasicInfo
    verification_type: str
    status: VerificationStatus
    documents: List[VerificationDocument]
    submitted_at: datetime
    processed_at: Optional[datetime]
    processed_by: Optional[str]
    rejection_reason: Optional[str]
    admin_notes: Optional[str]
    verification_badge: Optional[VerificationBadgeType]
    priority_score: int
    business_info: Optional[Dict[str, Any]]
    bank_details: Optional[Dict[str, str]]


class VerificationDetailResponse(VerificationRequestResponse):
    artist_profile: Dict[str, Any]
    portfolio_samples: List[Dict[str, Any]]
    booking_history: List[Dict[str, Any]]
    review_summary: Dict[str, Any]
    previous_verification_attempts: List[Dict[str, Any]]
    risk_assessment: Dict[str, Any]


class VerificationQueueSummary(BaseModel):
    total_pending: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue_reviews: int
    avg_processing_time_hours: float
    processed_today: int


class PortfolioImageInfo(BaseModel):
    id: int
    artist_id: int
    artist_name: str
    image_url: str
    thumbnail_url: str
    caption: Optional[str]
    category: str
    uploaded_at: datetime
    moderation_status: str
    moderation_notes: Optional[str]
    flagged_reason: Optional[str]
    moderated_by: Optional[str]
    moderated_at: Optional[datetime]
    file_size: int
    dimensions: Dict[str, int]


class PortfolioModerationSummary(BaseModel):
    total_pending: int
    approved_today: int
    rejected_today: int
    flagged_images: int
    requires_review: int


# List Response Schemas
class VerificationQueueResponse(BaseModel):
    verification_requests: List[VerificationRequestResponse]
    summary: VerificationQueueSummary
    pagination: Dict[str, Any]


class PortfolioModerationResponse(BaseModel):
    portfolio_images: List[PortfolioImageInfo]
    summary: PortfolioModerationSummary
    pagination: Dict[str, Any]