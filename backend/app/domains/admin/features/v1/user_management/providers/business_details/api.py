"""Provider business details and salon ownership API endpoints."""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from .dependencies import get_business_details_service
from .schemas import (
    ProviderBusinessDetailCreate, ProviderBusinessDetailUpdate, ProviderBusinessDetailResponse,
    ProviderSalonCreate, ProviderSalonUpdate, ProviderSalonResponse,
    ApprovalRequest, FeaturedStatusUpdate, TransferOwnershipRequest,
    BusinessDetailFilterParams, SalonOwnershipFilterParams,
    BusinessStatistics, SalonOwnershipStatistics,
    ProviderBusinessDetailListResponse, ProviderSalonListResponse
)
from .service import BusinessDetailsService


router = APIRouter(prefix="/business-details", tags=["Provider Business Details"])


# ===== PROVIDER BUSINESS DETAIL ENDPOINTS =====

@router.post(
    "",
    response_model=ProviderBusinessDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create provider business detail",
    description="Create extended business details for a provider"
)
def create_business_detail(
    data: ProviderBusinessDetailCreate,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Create provider business detail."""
    return service.create_business_detail(data)


@router.get(
    "",
    response_model=ProviderBusinessDetailListResponse,
    summary="List provider business details",
    description="Get paginated list of provider business details with filtering"
)
def list_business_details(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    approval_status: Optional[str] = Query(None, description="Filter by approval status"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    mobile_service_available: Optional[bool] = Query(None, description="Filter by mobile service"),
    min_years_experience: Optional[int] = Query(None, ge=0, description="Minimum years experience"),
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    certification: Optional[str] = Query(None, description="Filter by certification"),
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """List provider business details with filters."""
    filters = BusinessDetailFilterParams(
        approval_status=approval_status,
        is_featured=is_featured,
        min_rating=min_rating,
        mobile_service_available=mobile_service_available,
        min_years_experience=min_years_experience,
        specialization=specialization,
        certification=certification
    )
    return service.get_business_details(filters, page, size)


@router.get(
    "/{detail_id}",
    response_model=ProviderBusinessDetailResponse,
    summary="Get business detail",
    description="Get specific provider business detail by ID"
)
def get_business_detail(
    detail_id: UUID,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Get business detail by ID."""
    return service.get_business_detail(detail_id)


@router.put(
    "/{detail_id}",
    response_model=ProviderBusinessDetailResponse,
    summary="Update business detail",
    description="Update provider business detail information"
)
def update_business_detail(
    detail_id: UUID,
    data: ProviderBusinessDetailUpdate,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Update business detail."""
    return service.update_business_detail(detail_id, data)


@router.delete(
    "/{detail_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete business detail",
    description="Delete provider business detail"
)
def delete_business_detail(
    detail_id: UUID,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Delete business detail."""
    service.delete_business_detail(detail_id)


# ===== APPROVAL WORKFLOW ENDPOINTS =====

@router.post(
    "/{detail_id}/approval",
    response_model=ProviderBusinessDetailResponse,
    summary="Approve or reject business detail",
    description="Approve or reject provider business detail with admin notes"
)
def approve_or_reject_business_detail(
    detail_id: UUID,
    request: ApprovalRequest,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Approve or reject business detail."""
    return service.approve_or_reject_business_detail(detail_id, request)


@router.patch(
    "/{detail_id}/featured",
    response_model=ProviderBusinessDetailResponse,
    summary="Update featured status",
    description="Update featured status of provider"
)
def update_featured_status(
    detail_id: UUID,
    status_update: FeaturedStatusUpdate,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Update featured status."""
    return service.update_featured_status(detail_id, status_update)


# ===== SALON OWNERSHIP ENDPOINTS =====

@router.post(
    "/salon-ownerships",
    response_model=ProviderSalonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create salon ownership",
    description="Create provider-salon ownership relationship"
)
def create_salon_ownership(
    data: ProviderSalonCreate,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Create salon ownership relationship."""
    return service.create_salon_ownership(data)


@router.get(
    "/salon-ownerships",
    response_model=ProviderSalonListResponse,
    summary="List salon ownerships",
    description="Get paginated list of salon ownership relationships"
)
def list_salon_ownerships(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    provider_user_id: Optional[UUID] = Query(None, description="Filter by provider"),
    salon_id: Optional[UUID] = Query(None, description="Filter by salon"),
    ownership_type: Optional[str] = Query(None, description="Filter by ownership type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """List salon ownership relationships with filters."""
    filters = SalonOwnershipFilterParams(
        provider_user_id=provider_user_id,
        salon_id=salon_id,
        ownership_type=ownership_type,
        is_active=is_active
    )
    return service.get_salon_ownerships(filters, page, size)


@router.get(
    "/salon-ownerships/{provider_user_id}/{salon_id}",
    response_model=ProviderSalonResponse,
    summary="Get salon ownership",
    description="Get specific salon ownership relationship"
)
def get_salon_ownership(
    provider_user_id: UUID,
    salon_id: UUID,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Get specific salon ownership relationship."""
    return service.get_salon_ownership(provider_user_id, salon_id)


@router.put(
    "/salon-ownerships/{provider_user_id}/{salon_id}",
    response_model=ProviderSalonResponse,
    summary="Update salon ownership",
    description="Update salon ownership relationship"
)
def update_salon_ownership(
    provider_user_id: UUID,
    salon_id: UUID,
    data: ProviderSalonUpdate,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Update salon ownership relationship."""
    return service.update_salon_ownership(provider_user_id, salon_id, data)


@router.delete(
    "/salon-ownerships/{provider_user_id}/{salon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete salon ownership",
    description="Delete salon ownership relationship"
)
def delete_salon_ownership(
    provider_user_id: UUID,
    salon_id: UUID,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Delete salon ownership relationship."""
    service.delete_salon_ownership(provider_user_id, salon_id)


@router.post(
    "/salon-ownerships/{provider_user_id}/{salon_id}/transfer",
    response_model=dict,
    summary="Transfer salon ownership",
    description="Transfer salon ownership from one provider to another"
)
def transfer_salon_ownership(
    provider_user_id: UUID,
    salon_id: UUID,
    transfer_request: TransferOwnershipRequest,
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Transfer salon ownership."""
    old_ownership, new_ownership = service.transfer_salon_ownership(
        provider_user_id, salon_id, transfer_request
    )
    return {
        "message": "Ownership transferred successfully",
        "old_ownership": old_ownership,
        "new_ownership": new_ownership
    }


# ===== STATISTICS ENDPOINTS =====

@router.get(
    "/statistics/business",
    response_model=BusinessStatistics,
    summary="Get business statistics",
    description="Get statistics for provider business details"
)
def get_business_statistics(
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Get business statistics."""
    return service.get_business_statistics()


@router.get(
    "/statistics/ownership",
    response_model=SalonOwnershipStatistics,
    summary="Get ownership statistics",
    description="Get statistics for salon ownership relationships"
)
def get_ownership_statistics(
    service: BusinessDetailsService = Depends(get_business_details_service)
):
    """Get salon ownership statistics."""
    return service.get_salon_ownership_statistics()
