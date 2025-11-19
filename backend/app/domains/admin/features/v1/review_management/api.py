"""Review management and moderation API endpoints."""

import io
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.shared.responses import SuccessResponse
from .dependencies import get_review_service
from .service import ReviewManagementService
from .schemas import (
    ReviewFilters, ModerateReviewRequest, RemoveImagesRequest, ReviewResponseRequest,
    ReviewListResponse, ReviewDetailResponse, FlaggedReviewsResponse
)


router = APIRouter(prefix="/review-management", tags=[API_TAGS.REVIEW_MANAGEMENT])


@router.get("/reviews", response_model=SuccessResponse[ReviewListResponse])
async def get_reviews(
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    rating: int = Query(None, ge=1, le=5, description="Filter by rating (1-5)"),
    moderation_status: str = Query(None, description="Filter by moderation status"),
    booking_id: int = Query(None, description="Filter by booking ID"),
    customer_id: int = Query(None, description="Filter by customer ID"),
    artist_id: int = Query(None, description="Filter by artist ID"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)"),
    has_images: bool = Query(None, description="Filter reviews with/without images"),
    flagged_only: bool = Query(None, description="Show only flagged reviews")
):
    """
    Get paginated list of all reviews with comprehensive filtering options.
    
    **Required Permission:** admin.reviews.view
    
    **Filters:**
    - rating: 1-5 star rating filter
    - moderation_status: pending, approved, flagged, removed, under_review
    - booking_id: Filter by specific booking
    - customer_id: Filter by specific customer
    - artist_id: Filter by specific artist
    - Date range: start_date and end_date
    - has_images: true/false for reviews with images
    - flagged_only: Show only reviews requiring moderation
    
    **Response includes:**
    - Paginated review list with moderation status
    - Summary statistics (total, pending, approved, flagged)
    - Review images and metadata
    - Reviewer and artist information
    """
    try:
        filters = ReviewFilters(
            page=page,
            limit=limit,
            rating=rating,
            moderation_status=moderation_status,
            booking_id=booking_id,
            customer_id=customer_id,
            artist_id=artist_id,
            start_date=start_date,
            end_date=end_date,
            has_images=has_images,
            flagged_only=flagged_only
        )
        
        reviews, summary, pagination = review_service.get_reviews(filters)
        
        return SuccessResponse(
            data=ReviewListResponse(
                reviews=reviews,
                summary=summary,
                pagination=pagination
            ),
            message="Reviews retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.REVIEW_RETRIEVE_FAILED}: {str(e)}"
        )


@router.get("/reviews/{review_id}", response_model=SuccessResponse[ReviewDetailResponse])
async def get_review_detail(
    review_id: int,
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)]
):
    """
    Get detailed information about a specific review.
    
    **Required Permission:** admin.reviews.view
    
    **Returns:**
    - Complete review details with images
    - Moderation history and notes
    - Reviewer and booking information
    - Artist response (if any)
    - Flag reports and user information
    - Technical metadata (IP, device info)
    """
    review = review_service.get_review_detail(review_id)
    
    if not review:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.REVIEW_NOT_FOUND
        )
    
    return SuccessResponse(
        data=review,
        message="Review details retrieved successfully"
    )


@router.post("/reviews/{review_id}/moderate", response_model=SuccessResponse[str])
async def moderate_review(
    review_id: int,
    request: ModerateReviewRequest,
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)]
):
    """
    Moderate a review - approve, flag, or remove.
    
    **Required Permission:** admin.reviews.moderate
    
    **Actions:**
    - approve: Approve the review for public display
    - flag: Flag for further review (specify reason)
    - remove: Remove from public display (specify reason)
    - under_review: Mark as under review
    
    **For flag/remove actions:**
    - Reason is required (inappropriate_content, spam, fake_review, etc.)
    - Optional admin notes for internal tracking
    
    **Notifications:**
    - User notification can be enabled/disabled
    - Email sent to reviewer about moderation action
    
    **Audit trail:**
    - All moderation actions are logged with admin user ID
    - Moderation history preserved for compliance
    """
    if request.action in ["flag", "remove"] and not request.reason:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.REVIEW_MODERATION_REASON_REQUIRED
        )
    
    try:
        review = review_service.moderate_review(review_id, request)
        
        return SuccessResponse(
            data=f"Review {request.action.value}ed successfully",
            message=f"Review has been {request.action.value}ed"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.REVIEW_MODERATION_FAILED}: {str(e)}"
        )


@router.post("/reviews/{review_id}/remove-images", response_model=SuccessResponse[str])
async def remove_review_images(
    review_id: int,
    request: RemoveImagesRequest,
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)]
):
    """
    Remove specific images from a review.
    
    **Required Permission:** admin.reviews.moderate
    
    **Use cases:**
    - Remove inappropriate images while keeping review
    - Remove copyrighted content
    - Remove privacy-violating images
    
    **Required fields:**
    - image_urls: List of specific image URLs to remove
    - reason: Detailed reason for image removal (minimum 10 characters)
    
    **Process:**
    - Images are permanently deleted from storage
    - Review remains active with remaining images
    - Action logged in moderation history
    """
    try:
        review = review_service.remove_review_images(review_id, request)
        
        return SuccessResponse(
            data="Images removed successfully",
            message=f"Removed {len(request.image_urls)} image(s) from review"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.REVIEW_IMAGE_REMOVAL_FAILED}: {str(e)}"
        )


@router.post("/reviews/{review_id}/respond", response_model=SuccessResponse[str])
async def respond_to_review(
    review_id: int,
    request: ReviewResponseRequest,
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)]
):
    """
    Post an artist response to a review on behalf of the artist.
    
    **Required Permission:** admin.reviews.respond
    
    **Use cases:**
    - Help artists respond to reviews
    - Post responses for artists who need assistance
    - Manage dispute resolution through responses
    
    **Required fields:**
    - response: Artist response text (10-1000 characters)
    - artist_id: Artist for whom the response is being posted
    
    **Validation:**
    - Admin must have permission to post for this artist
    - Only one response allowed per review
    - Response is publicly visible
    
    **Notifications:**
    - Reviewer is notified of the artist response
    """
    try:
        review = review_service.respond_to_review(review_id, request)
        
        return SuccessResponse(
            data="Response posted successfully",
            message="Artist response has been posted to the review"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.REVIEW_RESPONSE_FAILED}: {str(e)}"
        )


@router.get("/reviews/flagged", response_model=SuccessResponse[FlaggedReviewsResponse])
async def get_flagged_reviews(
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get reviews that have been flagged by users and require moderation.
    
    **Required Permission:** admin.reviews.view
    
    **Priority queue:**
    - Reviews sorted by priority score
    - High priority items shown first
    - Multiple flags increase priority
    
    **Returns:**
    - Flagged reviews requiring immediate attention
    - Flag reasons and reporter information
    - Priority scores for triage
    - Summary counts by priority level
    """
    try:
        flagged_reviews, pagination = review_service.get_flagged_reviews(page, limit)
        
        high_priority_count = len([r for r in flagged_reviews if r.priority_score >= 8])
        
        return SuccessResponse(
            data=FlaggedReviewsResponse(
                flagged_reviews=flagged_reviews,
                high_priority_count=high_priority_count,
                pending_count=len(flagged_reviews),
                pagination=pagination
            ),
            message="Flagged reviews retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.FLAGGED_REVIEWS_RETRIEVE_FAILED}: {str(e)}"
        )


@router.get("/reviews/export")
async def export_reviews(
    review_service: Annotated[ReviewManagementService, Depends(get_review_service)],
    rating: int = Query(None, ge=1, le=5, description="Filter by rating"),
    moderation_status: str = Query(None, description="Filter by moderation status"),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Export filtered reviews to Excel file.
    
    **Required Permission:** admin.reviews.export
    
    **Export includes:**
    - All review data and metadata
    - Moderation history
    - Reviewer and artist information
    - Booking details
    - Image information (URLs only)
    
    **Filters:** Same as review list endpoint
    
    **Returns:** Excel file download with review data
    """
    try:
        filters = ReviewFilters(
            page=1,
            limit=10000,  # Export all matching records
            rating=rating,
            moderation_status=moderation_status,
            start_date=start_date,
            end_date=end_date
        )
        
        excel_content = review_service.export_reviews(filters)
        
        return StreamingResponse(
            io.BytesIO(excel_content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=reviews_export.xlsx"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.REVIEW_EXPORT_FAILED}: {str(e)}"
        )