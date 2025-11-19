"""Artist verification management service layer."""

from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from .schemas import (
    VerificationFilters, PortfolioFilters, VerificationDecisionRequest,
    PortfolioModerationRequest, BulkPortfolioModerationRequest,
    VerificationRequestResponse, VerificationDetailResponse,
    PortfolioImageInfo, VerificationQueueSummary, PortfolioModerationSummary,
    ArtistBasicInfo, VerificationDocument, VerificationStatus,
    VerificationBadgeType, DocumentType, PortfolioAction
)


class ArtistVerificationService:
    """Service class for artist verification and portfolio moderation operations."""

    def __init__(self, db: Session, admin_user_id: int):
        self.db = db
        self.admin_user_id = admin_user_id

    def get_verification_queue(self, filters: VerificationFilters) -> Tuple[List[VerificationRequestResponse], VerificationQueueSummary, Dict[str, Any]]:
        """Get paginated list of verification requests pending approval."""
        # Mock verification queue data
        verification_requests = self._mock_verification_queue_data()
        
        # Mock summary
        summary = VerificationQueueSummary(
            total_pending=25,
            high_priority=8,
            medium_priority=12,
            low_priority=5,
            overdue_reviews=3,
            avg_processing_time_hours=24.5,
            processed_today=7
        )
        
        # Mock pagination
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 25,
            "pages": 2,
            "has_next": filters.page < 2,
            "has_prev": filters.page > 1
        }
        
        return verification_requests, summary, pagination

    def get_verification_detail(self, request_id: int) -> Optional[VerificationDetailResponse]:
        """Get detailed information about a specific verification request."""
        return VerificationDetailResponse(
            id=request_id,
            artist=ArtistBasicInfo(
                id=1,
                name="John Artist",
                email="john@example.com",
                phone="+91-9876543210",
                city="Mumbai",
                profile_image="https://example.com/john.jpg",
                registration_date=datetime(2025, 10, 1),
                total_bookings=15,
                average_rating=4.7,
                is_active=True
            ),
            verification_type="full_verification",
            status=VerificationStatus.PENDING,
            documents=[
                VerificationDocument(
                    id=1,
                    document_type=DocumentType.ID_PROOF,
                    document_url="https://example.com/id_proof.pdf",
                    document_name="Aadhaar_Card.pdf",
                    uploaded_at=datetime.now(),
                    file_size=2048576,
                    mime_type="application/pdf",
                    is_verified=False,
                    verification_notes=None
                ),
                VerificationDocument(
                    id=2,
                    document_type=DocumentType.ADDRESS_PROOF,
                    document_url="https://example.com/address_proof.pdf",
                    document_name="Utility_Bill.pdf",
                    uploaded_at=datetime.now(),
                    file_size=1536000,
                    mime_type="application/pdf",
                    is_verified=False,
                    verification_notes=None
                )
            ],
            submitted_at=datetime.now(),
            processed_at=None,
            processed_by=None,
            rejection_reason=None,
            admin_notes=None,
            verification_badge=None,
            priority_score=8,
            business_info={
                "business_name": "John's Photography Studio",
                "business_type": "Photography Services",
                "years_of_experience": 5,
                "specialization": ["Wedding", "Portrait", "Event"]
            },
            bank_details={
                "account_holder": "John Artist",
                "account_number": "****1234",
                "ifsc_code": "HDFC0001234",
                "bank_name": "HDFC Bank"
            },
            artist_profile={
                "bio": "Professional photographer with 5+ years experience",
                "services": ["Wedding Photography", "Portrait Sessions"],
                "pricing_range": "₹25,000 - ₹75,000",
                "availability": "Available for bookings"
            },
            portfolio_samples=[
                {
                    "id": 1,
                    "image_url": "https://example.com/portfolio1.jpg",
                    "category": "Wedding",
                    "likes": 45
                },
                {
                    "id": 2,
                    "image_url": "https://example.com/portfolio2.jpg",
                    "category": "Portrait",
                    "likes": 32
                }
            ],
            booking_history=[
                {
                    "booking_id": 1,
                    "event_date": datetime(2025, 11, 1),
                    "event_type": "Wedding",
                    "amount": 50000,
                    "status": "completed",
                    "rating": 5
                }
            ],
            review_summary={
                "total_reviews": 15,
                "average_rating": 4.7,
                "five_star": 12,
                "four_star": 2,
                "three_star": 1,
                "two_star": 0,
                "one_star": 0
            },
            previous_verification_attempts=[],
            risk_assessment={
                "risk_score": 15,  # Lower is better
                "risk_level": "Low",
                "factors": ["No previous violations", "Good customer reviews", "Complete documentation"]
            }
        )

    def process_verification_decision(self, request_id: int, decision: VerificationDecisionRequest) -> VerificationRequestResponse:
        """Approve or reject an artist verification request."""
        # In production, this would:
        # 1. Update verification status in database
        # 2. If approved, assign verification badge
        # 3. Send notification to artist
        # 4. Update artist profile with verification status
        # 5. Log admin action for audit
        
        return VerificationRequestResponse(
            id=request_id,
            artist=ArtistBasicInfo(
                id=1,
                name="John Artist",
                email="john@example.com",
                phone="+91-9876543210",
                city="Mumbai",
                profile_image="https://example.com/john.jpg",
                registration_date=datetime(2025, 10, 1),
                total_bookings=15,
                average_rating=4.7,
                is_active=True
            ),
            verification_type="full_verification",
            status=VerificationStatus(decision.decision.value + "d"),  # approved or rejected
            documents=[],
            submitted_at=datetime.now(),
            processed_at=datetime.now(),
            processed_by=f"admin_{self.admin_user_id}",
            rejection_reason=decision.rejection_reason,
            admin_notes=decision.notes,
            verification_badge=decision.verification_badge,
            priority_score=0,
            business_info=None,
            bank_details=None
        )

    def get_portfolio_moderation_queue(self, filters: PortfolioFilters) -> Tuple[List[PortfolioImageInfo], PortfolioModerationSummary, Dict[str, Any]]:
        """Get portfolio images pending moderation."""
        # Mock portfolio images
        portfolio_images = self._mock_portfolio_images_data()
        
        # Mock summary
        summary = PortfolioModerationSummary(
            total_pending=30,
            approved_today=15,
            rejected_today=3,
            flagged_images=5,
            requires_review=7
        )
        
        # Mock pagination
        pagination = {
            "page": filters.page,
            "limit": filters.limit,
            "total": 30,
            "pages": 2,
            "has_next": filters.page < 2,
            "has_prev": filters.page > 1
        }
        
        return portfolio_images, summary, pagination

    def moderate_portfolio_image(self, image_id: int, request: PortfolioModerationRequest) -> PortfolioImageInfo:
        """Moderate a single portfolio image."""
        # In production, this would:
        # 1. Update image moderation status
        # 2. Add moderation notes
        # 3. If rejected/flagged, notify artist
        # 4. Log admin action
        
        return PortfolioImageInfo(
            id=image_id,
            artist_id=1,
            artist_name="John Artist",
            image_url="https://example.com/portfolio1.jpg",
            thumbnail_url="https://example.com/portfolio1_thumb.jpg",
            caption="Beautiful wedding shot",
            category="Wedding",
            uploaded_at=datetime.now(),
            moderation_status=request.action.value + "d",
            moderation_notes=request.notes,
            flagged_reason=request.rejection_reason if request.action == PortfolioAction.FLAG else None,
            moderated_by=f"admin_{self.admin_user_id}",
            moderated_at=datetime.now(),
            file_size=2048576,
            dimensions={"width": 1920, "height": 1080}
        )

    def bulk_moderate_portfolio(self, request: BulkPortfolioModerationRequest) -> Dict[str, Any]:
        """Moderate multiple portfolio images at once."""
        # In production, this would update all specified images
        return {
            "processed_count": len(request.image_ids),
            "successful_count": len(request.image_ids),
            "failed_count": 0,
            "action": request.action.value,
            "processed_by": f"admin_{self.admin_user_id}",
            "processed_at": datetime.now()
        }

    def export_verification_requests(self, filters: VerificationFilters) -> bytes:
        """Export verification requests to Excel."""
        # Mock Excel generation
        mock_excel_content = b"Mock Excel Content for Verification Requests Export"
        return mock_excel_content

    def _mock_verification_queue_data(self) -> List[VerificationRequestResponse]:
        """Mock verification queue data for development."""
        return [
            VerificationRequestResponse(
                id=i,
                artist=ArtistBasicInfo(
                    id=i,
                    name=f"Artist {i}",
                    email=f"artist{i}@example.com",
                    phone=f"+91-987654321{i}",
                    city="Mumbai" if i % 2 == 0 else "Delhi",
                    profile_image=f"https://example.com/artist{i}.jpg",
                    registration_date=datetime(2025, 10, i),
                    total_bookings=i * 3,
                    average_rating=4.0 + (i % 5) * 0.2,
                    is_active=True
                ),
                verification_type="full_verification",
                status=VerificationStatus.PENDING,
                documents=[
                    VerificationDocument(
                        id=i,
                        document_type=DocumentType.ID_PROOF,
                        document_url=f"https://example.com/doc{i}.pdf",
                        document_name=f"ID_Proof_{i}.pdf",
                        uploaded_at=datetime.now(),
                        file_size=2048576,
                        mime_type="application/pdf",
                        is_verified=False,
                        verification_notes=None
                    )
                ],
                submitted_at=datetime.now(),
                processed_at=None,
                processed_by=None,
                rejection_reason=None,
                admin_notes=None,
                verification_badge=None,
                priority_score=10 - i,  # Higher numbers = higher priority
                business_info={"business_name": f"Studio {i}"},
                bank_details={"account_number": f"****123{i}"}
            )
            for i in range(1, 21)
        ]

    def _mock_portfolio_images_data(self) -> List[PortfolioImageInfo]:
        """Mock portfolio images data for development."""
        return [
            PortfolioImageInfo(
                id=i,
                artist_id=i,
                artist_name=f"Artist {i}",
                image_url=f"https://example.com/portfolio{i}.jpg",
                thumbnail_url=f"https://example.com/portfolio{i}_thumb.jpg",
                caption=f"Portfolio image {i}",
                category="Wedding" if i % 2 == 0 else "Portrait",
                uploaded_at=datetime.now(),
                moderation_status="pending",
                moderation_notes=None,
                flagged_reason=None,
                moderated_by=None,
                moderated_at=None,
                file_size=1024000 * i,
                dimensions={"width": 1920, "height": 1080}
            )
            for i in range(1, 21)
        ]