"""Review management service layer."""

from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, text

from app.shared.models.user import CustomerUser, ProviderUser
from app.shared.models.booking import Booking
from .schemas import (
    ReviewFilters, ModerateReviewRequest, RemoveImagesRequest, ReviewResponseRequest,
    ReviewResponse, ReviewDetailResponse, ReviewSummary, FlaggedReview,
    ReviewerInfo, BookingInfo, ArtistInfo, ReviewImageInfo, ModerationHistory,
    ModerationStatus, ModerationAction, FlagReason
)


class ReviewManagementService:
    """Service class for review management and moderation operations."""

    def __init__(self, db: Session, admin_user_id: int):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_reviews(self, filters: ReviewFilters) -> Tuple[List[ReviewResponse], ReviewSummary, Dict[str, Any]]:
        """Get paginated list of reviews with filters and summary."""
        # Mock review data - replace with actual database queries
        reviews = self._mock_review_data()
        
        # Mock summary calculation
        summary = ReviewSummary(
            total_reviews=250,
            pending_moderation=25,
            approved_count=200,
            flagged_count=15,
            removed_count=10,
            average_rating=4.2,
            flagged_today=5,
            requires_attention=8
        )
        
        # Mock pagination
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 250,
            "pages": 13,
            "has_next": filters.page < 13,
            "has_prev": filters.page > 1
        }
        
        return reviews, summary, pagination

    def get_review_detail(self, review_id: int) -> Optional[ReviewDetailResponse]:
        """Get detailed information about a specific review."""
        return ReviewDetailResponse(
            id=review_id,
            booking_id=1,
            rating=5,
            title="Amazing photographer!",
            comment="The photographer did an excellent job capturing our wedding moments. Highly recommended!",
            images=[
                ReviewImageInfo(
                    url="https://example.com/review1.jpg",
                    caption="Wedding ceremony",
                    is_flagged=False,
                    flagged_reason=None
                ),
                ReviewImageInfo(
                    url="https://example.com/review2.jpg",
                    caption="Reception photos",
                    is_flagged=False,
                    flagged_reason=None
                )
            ],
            reviewer=ReviewerInfo(
                id=1,
                name="John Doe",
                profile_image="https://example.com/john.jpg",
                total_reviews_count=15,
                is_verified=True
            ),
            booking_info=BookingInfo(
                id=1,
                event_type="Wedding",
                event_date=datetime(2025, 11, 15),
                amount_paid=25000.0
            ),
            artist=ArtistInfo(
                id=1,
                name="Jane Photographer",
                profile_image="https://example.com/jane.jpg",
                average_rating=4.8,
                total_reviews_count=120
            ),
            moderation_status=ModerationStatus.APPROVED,
            moderation_notes=None,
            flag_reason=None,
            report_count=0,
            helpful_count=10,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            moderated_at=datetime.now(),
            moderated_by=f"admin_{self.admin_user_id}",
            moderation_history=[
                ModerationHistory(
                    id=1,
                    action=ModerationAction.APPROVE,
                    reason=None,
                    notes="Review looks genuine and helpful",
                    moderated_by=f"admin_{self.admin_user_id}",
                    moderated_at=datetime.now()
                )
            ],
            artist_response="Thank you for the wonderful review! It was a pleasure working with you.",
            artist_response_date=datetime.now(),
            flagged_by_users=[],
            ip_address="192.168.1.100",
            device_info={"browser": "Chrome", "os": "Windows"}
        )

    def moderate_review(self, review_id: int, request: ModerateReviewRequest) -> ReviewResponse:
        """Moderate a review (approve, flag, or remove)."""
        # In production, this would:
        # 1. Update review moderation status
        # 2. Add moderation history record
        # 3. Send notification to user if requested
        # 4. Log admin action for audit
        
        return ReviewResponse(
            id=review_id,
            booking_id=1,
            rating=4,
            title="Good service",
            comment="The service was good overall.",
            images=[],
            reviewer=ReviewerInfo(
                id=1,
                name="John Customer",
                profile_image="https://example.com/john.jpg",
                total_reviews_count=5,
                is_verified=True
            ),
            booking_info=BookingInfo(
                id=1,
                event_type="Portrait",
                event_date=datetime(2025, 11, 10),
                amount_paid=5000.0
            ),
            artist=ArtistInfo(
                id=1,
                name="Jane Artist",
                profile_image="https://example.com/jane.jpg",
                average_rating=4.5,
                total_reviews_count=50
            ),
            moderation_status=ModerationStatus(request.action.value),
            moderation_notes=request.notes,
            flag_reason=request.reason,
            report_count=0,
            helpful_count=3,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            moderated_at=datetime.now(),
            moderated_by=f"admin_{self.admin_user_id}"
        )

    def remove_review_images(self, review_id: int, request: RemoveImagesRequest) -> ReviewResponse:
        """Remove specific images from a review."""
        # In production, this would:
        # 1. Mark images as removed in database
        # 2. Delete actual image files
        # 3. Update review moderation status if needed
        # 4. Log admin action
        
        return self.get_review_detail(review_id)

    def respond_to_review(self, review_id: int, request: ReviewResponseRequest) -> ReviewResponse:
        """Post an artist response to a review."""
        # In production, this would:
        # 1. Add artist response to review
        # 2. Verify admin permission to post for this artist
        # 3. Send notification to reviewer
        
        return self.get_review_detail(review_id)

    def get_flagged_reviews(self, page: int = 1, limit: int = 20) -> Tuple[List[FlaggedReview], Dict[str, Any]]:
        """Get reviews that have been flagged and require moderation."""
        flagged_reviews = [
            FlaggedReview(
                id=i,
                review_id=i,
                flag_reason=FlagReason.INAPPROPRIATE_CONTENT if i % 2 == 0 else FlagReason.FAKE_REVIEW,
                flagged_by=f"user_{i}",
                flagged_at=datetime.now(),
                admin_notes=None,
                priority_score=10 - i  # Higher numbers = higher priority
            )
            for i in range(1, 11)
        ]
        
        pagination = {
            "page": page,
            "limit": limit,
            "total": 25,
            "pages": 3,
            "has_next": page < 3,
            "has_prev": page > 1
        }
        
        return flagged_reviews, pagination

    def export_reviews(self, filters: ReviewFilters) -> bytes:
        """Export filtered reviews to Excel."""
        # Mock Excel generation
        # In production, use pandas or openpyxl to generate actual Excel file
        mock_excel_content = b"Mock Excel Content for Reviews Export"
        return mock_excel_content

    def _mock_review_data(self) -> List[ReviewResponse]:
        """Mock review data for development."""
        return [
            ReviewResponse(
                id=i,
                booking_id=i,
                rating=5 if i % 3 == 0 else 4,
                title=f"Review {i} Title",
                comment=f"This is review comment {i}. The service was great!",
                images=[
                    ReviewImageInfo(
                        url=f"https://example.com/review{i}_1.jpg",
                        caption=f"Image {i}",
                        is_flagged=False,
                        flagged_reason=None
                    )
                ] if i % 2 == 0 else [],
                reviewer=ReviewerInfo(
                    id=i,
                    name=f"Customer {i}",
                    profile_image=f"https://example.com/customer{i}.jpg",
                    total_reviews_count=5 + i,
                    is_verified=i % 3 == 0
                ),
                booking_info=BookingInfo(
                    id=i,
                    event_type="Wedding" if i % 2 == 0 else "Portrait",
                    event_date=datetime(2025, 11, i),
                    amount_paid=float(1000 * i)
                ),
                artist=ArtistInfo(
                    id=i,
                    name=f"Artist {i}",
                    profile_image=f"https://example.com/artist{i}.jpg",
                    average_rating=4.5,
                    total_reviews_count=20 + i
                ),
                moderation_status=ModerationStatus.APPROVED if i % 4 != 0 else ModerationStatus.PENDING,
                moderation_notes=None,
                flag_reason=None,
                report_count=0,
                helpful_count=i * 2,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                moderated_at=datetime.now() if i % 4 != 0 else None,
                moderated_by=f"admin_{self.admin_user_id}" if i % 4 != 0 else None
            )
            for i in range(1, 21)
        ]