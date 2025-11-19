"""User Segments API endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from .dependencies import get_user_segments_service
from .schemas import (
    UserSegmentCreate, UserSegmentUpdate,
    UserSegmentResponse, UserSegmentListResponse,
    UserSegmentFilters, UserSegmentStatistics,
    SegmentSizeResponse
)
from .service import UserSegmentsService


router = APIRouter(prefix="/user-segments", tags=["User Segments"])


@router.post(
    "",
    response_model=UserSegmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user segment",
    description="Create a new user segment for targeted campaigns and analytics"
)
def create_user_segment(
    data: UserSegmentCreate,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Create a new user segment."""
    # TODO: Extract admin_user_id from dependency
    admin_user_id = UUID('00000000-0000-0000-0000-000000000000')  # Placeholder
    return service.create_segment(data, admin_user_id)


@router.get(
    "",
    response_model=UserSegmentListResponse,
    summary="List user segments",
    description="Get paginated list of user segments with filtering options"
)
def list_user_segments(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    segment_type: Optional[str] = Query(None, description="Filter by segment type"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    created_by: Optional[UUID] = Query(None, description="Filter by creator"),
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """List user segments with filters."""
    filters = UserSegmentFilters(
        segment_type=segment_type,
        user_type=user_type,
        is_active=is_active,
        created_by=created_by
    )
    return service.get_segments(filters, page, size)


@router.get(
    "/stats",
    response_model=UserSegmentStatistics,
    summary="Get segment statistics",
    description="Get comprehensive user segment statistics"
)
def get_user_segment_statistics(
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Get user segment statistics."""
    return service.get_statistics()


@router.get(
    "/{segment_id}",
    response_model=UserSegmentResponse,
    summary="Get user segment",
    description="Get specific user segment by ID"
)
def get_user_segment(
    segment_id: UUID,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Get user segment by ID."""
    return service.get_segment_by_id(segment_id)


@router.put(
    "/{segment_id}",
    response_model=UserSegmentResponse,
    summary="Update user segment",
    description="Update user segment details"
)
def update_user_segment(
    segment_id: UUID,
    data: UserSegmentUpdate,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Update user segment."""
    return service.update_segment(segment_id, data)


@router.delete(
    "/{segment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user segment",
    description="Delete a user segment"
)
def delete_user_segment(
    segment_id: UUID,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Delete user segment."""
    service.delete_segment(segment_id)


@router.post(
    "/{segment_id}/calculate-size",
    response_model=SegmentSizeResponse,
    summary="Calculate segment size",
    description="Calculate the number of users matching segment criteria"
)
def calculate_segment_size(
    segment_id: UUID,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Calculate segment size."""
    return service.calculate_segment_size(segment_id)


@router.post(
    "/{segment_id}/duplicate",
    response_model=UserSegmentResponse,
    summary="Duplicate segment",
    description="Create a copy of an existing user segment"
)
def duplicate_user_segment(
    segment_id: UUID,
    service: UserSegmentsService = Depends(get_user_segments_service)
):
    """Duplicate user segment."""
    # TODO: Extract admin_user_id from dependency
    admin_user_id = UUID('00000000-0000-0000-0000-000000000000')  # Placeholder
    return service.duplicate_segment(segment_id, admin_user_id)
