"""Admission Inquiries API endpoints."""

from typing import Optional, List
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status, Body

from .dependencies import get_admission_inquiries_service
from .schemas import (
    AdmissionInquiryCreate, AdmissionInquiryUpdate,
    AdmissionInquiryResponse, AdmissionInquiryListResponse,
    AdmissionInquiryFilters, AdmissionInquiryStatistics,
    AssignInquiryRequest
)
from .service import AdmissionInquiriesService


router = APIRouter(prefix="/admission-inquiries", tags=["Admission Inquiries"])


@router.post(
    "",
    response_model=AdmissionInquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create admission inquiry",
    description="Create a new admission inquiry for academy course enrollment"
)
def create_admission_inquiry(
    data: AdmissionInquiryCreate,
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Create a new admission inquiry."""
    return service.create_inquiry(data)


@router.get(
    "",
    response_model=AdmissionInquiryListResponse,
    summary="List admission inquiries",
    description="Get paginated list of admission inquiries with filtering options"
)
def list_admission_inquiries(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    academy_id: Optional[UUID] = Query(None, description="Filter by academy ID"),
    course_id: Optional[UUID] = Query(None, description="Filter by course ID"),
    inquiry_status: Optional[str] = Query(None, description="Filter by status"),
    inquiry_source: Optional[str] = Query(None, description="Filter by source"),
    assigned_to: Optional[UUID] = Query(None, description="Filter by assigned admin user"),
    follow_up_from: Optional[date] = Query(None, description="Filter follow-ups from date"),
    follow_up_to: Optional[date] = Query(None, description="Filter follow-ups to date"),
    min_conversion_probability: Optional[int] = Query(None, ge=1, le=10, description="Minimum conversion probability"),
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """List admission inquiries with filters."""
    filters = AdmissionInquiryFilters(
        academy_id=academy_id,
        course_id=course_id,
        inquiry_status=inquiry_status,
        inquiry_source=inquiry_source,
        assigned_to=assigned_to,
        follow_up_from=follow_up_from,
        follow_up_to=follow_up_to,
        min_conversion_probability=min_conversion_probability
    )
    return service.get_inquiries(filters, page, size)


@router.get(
    "/stats",
    response_model=AdmissionInquiryStatistics,
    summary="Get inquiry statistics",
    description="Get comprehensive admission inquiry statistics and conversion metrics"
)
def get_admission_inquiry_statistics(
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Get admission inquiry statistics."""
    return service.get_statistics()


@router.get(
    "/pending-follow-ups",
    response_model=List[AdmissionInquiryResponse],
    summary="Get pending follow-ups",
    description="Get inquiries with pending follow-ups (today or past due)"
)
def get_pending_follow_ups(
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Get pending follow-ups."""
    return service.get_pending_follow_ups()


@router.get(
    "/{inquiry_id}",
    response_model=AdmissionInquiryResponse,
    summary="Get admission inquiry",
    description="Get specific admission inquiry by ID"
)
def get_admission_inquiry(
    inquiry_id: UUID,
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Get admission inquiry by ID."""
    return service.get_inquiry_by_id(inquiry_id)


@router.put(
    "/{inquiry_id}",
    response_model=AdmissionInquiryResponse,
    summary="Update admission inquiry",
    description="Update admission inquiry details"
)
def update_admission_inquiry(
    inquiry_id: UUID,
    data: AdmissionInquiryUpdate,
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Update admission inquiry."""
    return service.update_inquiry(inquiry_id, data)


@router.delete(
    "/{inquiry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete admission inquiry",
    description="Delete an admission inquiry"
)
def delete_admission_inquiry(
    inquiry_id: UUID,
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Delete admission inquiry."""
    service.delete_inquiry(inquiry_id)


@router.post(
    "/{inquiry_id}/assign",
    response_model=AdmissionInquiryResponse,
    summary="Assign inquiry",
    description="Assign admission inquiry to an admin user for follow-up"
)
def assign_inquiry(
    inquiry_id: UUID,
    data: AssignInquiryRequest,
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Assign inquiry to admin user."""
    return service.assign_inquiry(inquiry_id, data)


@router.post(
    "/bulk-update-status",
    response_model=dict,
    summary="Bulk update status",
    description="Bulk update status for multiple admission inquiries"
)
def bulk_update_inquiry_status(
    inquiry_ids: List[UUID] = Body(..., description="List of inquiry IDs"),
    new_status: str = Body(..., description="New status to apply"),
    service: AdmissionInquiriesService = Depends(get_admission_inquiries_service)
):
    """Bulk update inquiry status."""
    return service.bulk_update_status(inquiry_ids, new_status)
