"""Artist verification and portfolio moderation API endpoints."""

import io
from typing import Annotated, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.shared.responses import SuccessResponse
from .dependencies import get_artist_verification_service
from .service import ArtistVerificationService
from .schemas import (
    VerificationFilters, PortfolioFilters, VerificationDecisionRequest,
    PortfolioModerationRequest, BulkPortfolioModerationRequest,
    VerificationQueueResponse, VerificationDetailResponse,
    PortfolioModerationResponse
)


router = APIRouter(prefix="/artist-verification", tags=[API_TAGS.ARTIST_VERIFICATION])


@router.get("/verification-queue", response_model=SuccessResponse[VerificationQueueResponse])
async def get_verification_queue(
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: str = Query(None, description="Filter by verification status"),
    verification_type: str = Query(None, description="Filter by verification type"),
    submitted_date_start: str = Query(None, description="Start date (YYYY-MM-DD)"),
    submitted_date_end: str = Query(None, description="End date (YYYY-MM-DD)"),
    artist_name: str = Query(None, description="Search by artist name"),
    city: str = Query(None, description="Filter by city")
):
    """
    Get artist verification requests pending admin approval.
    
    **Required Permission:** admin.verification.view
    
    **Features:**
    - Priority-based queue (high priority first)
    - SLA tracking for overdue reviews
    - Comprehensive filtering options
    - Document preview and validation
    
    **Filters:**
    - status: pending, approved, rejected, under_review
    - verification_type: basic, full_verification, business_verification
    - Date range: submitted_date_start and submitted_date_end
    - artist_name: Search by artist name
    - city: Filter by artist city
    
    **Response includes:**
    - Verification requests with priority scoring
    - Queue summary statistics
    - Document list and validation status
    - Artist basic information
    - Processing time metrics
    """
    try:
        filters = VerificationFilters(
            page=page,
            limit=limit,
            status=status,
            verification_type=verification_type,
            submitted_date_start=submitted_date_start,
            submitted_date_end=submitted_date_end,
            artist_name=artist_name,
            city=city
        )
        
        requests, summary, pagination = verification_service.get_verification_queue(filters)
        
        return SuccessResponse(
            data=VerificationQueueResponse(
                verification_requests=requests,
                summary=summary,
                pagination=pagination
            ),
            message="Verification queue retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.VERIFICATION_QUEUE_FAILED}: {str(e)}"
        )


@router.get("/verification-queue/{request_id}", response_model=SuccessResponse[VerificationDetailResponse])
async def get_verification_detail(
    request_id: int,
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)]
):
    """
    Get detailed information about a specific verification request.
    
    **Required Permission:** admin.verification.view
    
    **Returns:**
    - Complete verification request details
    - All uploaded documents with preview URLs
    - Artist profile and business information
    - Portfolio samples for quality assessment
    - Booking history and performance metrics
    - Review summary and ratings
    - Risk assessment and red flags
    - Previous verification attempts
    
    **Document Types:**
    - ID Proof (Aadhaar, PAN, Passport)
    - Address Proof (Utility bills, bank statements)
    - Business License (if applicable)
    - Portfolio certificates
    - Bank account details
    """
    verification_detail = verification_service.get_verification_detail(request_id)
    
    if not verification_detail:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND, 
            detail=ERROR_MESSAGES.VERIFICATION_REQUEST_NOT_FOUND
        )
    
    return SuccessResponse(
        data=verification_detail,
        message="Verification details retrieved successfully"
    )


@router.post("/verification-queue/{request_id}/decision", response_model=SuccessResponse[str])
async def process_verification_decision(
    request_id: int,
    decision: VerificationDecisionRequest,
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)]
):
    """
    Approve or reject an artist verification request.
    
    **Required Permission:** admin.verification.approve
    
    **Decisions:**
    - approve: Approve verification and assign badge
    - reject: Reject with detailed reason
    
    **For Approval:**
    - verification_badge: basic_verified, premium_verified, gold_verified, featured_artist
    - Artist gains verified status and enhanced visibility
    - Automatic notification sent to artist
    
    **For Rejection:**
    - rejection_reason: Detailed reason for rejection (required)
    - Artist can resubmit after addressing issues
    - Guidance provided for resubmission
    
    **Process:**
    - Document validation completed
    - Risk assessment reviewed
    - Artist profile updated with verification status
    - Badge assigned to artist profile
    - Audit trail maintained for compliance
    
    **Verification Badges:**
    - basic_verified: Standard verification for individual artists
    - premium_verified: Enhanced verification with business validation
    - gold_verified: Premium artists with proven track record
    - featured_artist: Top-tier artists featured on platform
    """
    if decision.decision.value == "reject" and not decision.rejection_reason:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST, 
            detail=ERROR_MESSAGES.VERIFICATION_REJECTION_REASON_REQUIRED
        )
    
    try:
        verification_result = verification_service.process_verification_decision(request_id, decision)
        
        action_message = "approved" if decision.decision.value == "approve" else "rejected"
        return SuccessResponse(
            data=f"Verification request {action_message} successfully",
            message=f"Artist verification has been {action_message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.VERIFICATION_PROCESS_FAILED}: {str(e)}"
        )


@router.get("/portfolio/moderation-queue", response_model=SuccessResponse[PortfolioModerationResponse])
async def get_portfolio_moderation_queue(
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)],
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: str = Query(None, description="Filter by moderation status"),
    artist_id: int = Query(None, description="Filter by artist ID"),
    uploaded_date_start: str = Query(None, description="Start date (YYYY-MM-DD)"),
    uploaded_date_end: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Get portfolio images pending moderation approval.
    
    **Required Permission:** admin.portfolio.moderate
    
    **Use Cases:**
    - Review newly uploaded portfolio images
    - Moderate flagged content from user reports
    - Ensure platform content quality standards
    - Remove inappropriate or copyrighted content
    
    **Filters:**
    - status: pending, approved, rejected, flagged
    - artist_id: Focus on specific artist's portfolio
    - Date range: uploaded_date_start and uploaded_date_end
    
    **Response includes:**
    - Portfolio images with preview thumbnails
    - Artist information and context
    - Moderation status and history
    - Image metadata (size, dimensions, category)
    - Batch moderation capabilities
    
    **Content Guidelines:**
    - Professional quality images only
    - No inappropriate or offensive content
    - No copyrighted material
    - Relevant to artist's service category
    """
    try:
        filters = PortfolioFilters(
            page=page,
            limit=limit,
            status=status,
            artist_id=artist_id,
            uploaded_date_start=uploaded_date_start,
            uploaded_date_end=uploaded_date_end
        )
        
        images, summary, pagination = verification_service.get_portfolio_moderation_queue(filters)
        
        return SuccessResponse(
            data=PortfolioModerationResponse(
                portfolio_images=images,
                summary=summary,
                pagination=pagination
            ),
            message="Portfolio moderation queue retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.PORTFOLIO_QUEUE_FAILED}: {str(e)}"
        )


@router.post("/portfolio/{image_id}/moderate", response_model=SuccessResponse[str])
async def moderate_portfolio_image(
    image_id: int,
    moderation: PortfolioModerationRequest,
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)]
):
    """
    Moderate a single portfolio image.
    
    **Required Permission:** admin.portfolio.moderate
    
    **Actions:**
    - approve: Approve image for public display
    - reject: Reject image with reason (artist can resubmit)
    - flag: Flag for further review or policy violation
    
    **Rejection Reasons:**
    - Poor image quality
    - Inappropriate content
    - Copyright violation
    - Not relevant to service category
    - Duplicate image
    - Misleading representation
    
    **Process:**
    - Image moderation status updated
    - Artist notification sent (if configured)
    - Admin action logged for audit
    - Image visibility updated on platform
    """
    if moderation.action.value in ["reject", "flag"] and not moderation.rejection_reason:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=ERROR_MESSAGES.PORTFOLIO_REJECTION_REASON_REQUIRED
        )
    
    try:
        moderated_image = verification_service.moderate_portfolio_image(image_id, moderation)
        
        return SuccessResponse(
            data=f"Portfolio image {moderation.action.value}ed successfully",
            message=f"Image has been {moderation.action.value}ed"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.IMAGE_MODERATION_FAILED}: {str(e)}"
        )


@router.post("/portfolio/bulk-moderate", response_model=SuccessResponse[Dict[str, Any]])
async def bulk_moderate_portfolio(
    moderation: BulkPortfolioModerationRequest,
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)]
):
    """
    Moderate multiple portfolio images at once.
    
    **Required Permission:** admin.portfolio.moderate
    
    **Use Cases:**
    - Approve multiple high-quality images quickly
    - Reject batch of inappropriate content
    - Flag multiple policy violations from same artist
    
    **Required:**
    - image_ids: List of portfolio image IDs (1-50 images max)
    - action: approve, reject, or flag
    - rejection_reason: Required for reject/flag actions
    
    **Efficiency Features:**
    - Process up to 50 images in single request
    - Atomic operation (all succeed or all fail)
    - Bulk notification to affected artists
    - Batch audit logging
    
    **Response:**
    - Number of images processed
    - Success/failure counts
    - Processing timestamp and admin ID
    """
    if moderation.action.value in ["reject", "flag"] and not moderation.rejection_reason:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=ERROR_MESSAGES.PORTFOLIO_REJECTION_REASON_REQUIRED
        )
    
    if len(moderation.image_ids) > 50:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=ERROR_MESSAGES.BULK_MODERATION_LIMIT
        )
    
    try:
        result = verification_service.bulk_moderate_portfolio(moderation)
        
        return SuccessResponse(
            data=result,
            message=f"Bulk moderation completed: {result['successful_count']} images processed"
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.BULK_MODERATION_FAILED}: {str(e)}"
        )


@router.get("/verification-queue/export")
async def export_verification_requests(
    verification_service: Annotated[ArtistVerificationService, Depends(get_artist_verification_service)],
    status: str = Query(None, description="Filter by verification status"),
    verification_type: str = Query(None, description="Filter by verification type"),
    submitted_date_start: str = Query(None, description="Start date (YYYY-MM-DD)"),
    submitted_date_end: str = Query(None, description="End date (YYYY-MM-DD)")
):
    """
    Export verification requests to Excel file.
    
    **Required Permission:** admin.verification.export
    
    **Export includes:**
    - All verification request data
    - Artist information and contact details
    - Document list and validation status
    - Processing timeline and admin notes
    - Risk assessment scores
    - Business information
    
    **Use Cases:**
    - Compliance reporting
    - Performance analytics
    - Audit trail documentation
    - External review processes
    
    **Filters:** Same as verification queue endpoint
    
    **Returns:** Excel file download with verification data
    """
    try:
        filters = VerificationFilters(
            page=1,
            limit=10000,  # Export all matching records
            status=status,
            verification_type=verification_type,
            submitted_date_start=submitted_date_start,
            submitted_date_end=submitted_date_end
        )
        
        excel_content = verification_service.export_verification_requests(filters)
        
        return StreamingResponse(
            io.BytesIO(excel_content),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=verification_requests_export.xlsx"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, 
            detail=f"{ERROR_MESSAGES.VERIFICATION_EXPORT_FAILED}: {str(e)}"
        )