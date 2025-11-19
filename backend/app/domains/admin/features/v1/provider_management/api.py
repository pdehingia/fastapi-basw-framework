"""
Provider Management API for Admin Panel

Consolidated provider management with sub-routers for:
- Core provider operations
- Salon-provider employment relationships
- Provider business details and approval
- Salon ownership management
"""

from typing import Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException

from app.shared.constants import HTTP_STATUS_CODES, API_TAGS
from app.domains.admin.shared.dependencies import require_admin_role
from .dependencies import get_provider_management_service
from .service import ProviderManagementService
from .schemas import (
    ProviderUserResponse,
    ProviderUserListResponse,
    ProviderUserCreateRequest,
    ProviderUserUpdateRequest,
    ProviderUserFilters,
    ProviderStatisticsResponse,
    ProviderVerificationRequest,
    ProviderBusinessHoursUpdate,
    ProviderStatusUpdate
)

# Import sub-routers
from .salon_providers.api import router as salon_providers_router
# Business details router will be added when implemented
# from .business_details.api import router as business_details_router

router = APIRouter(prefix="/providers", tags=[API_TAGS.PROVIDER_MANAGEMENT])


@router.get("/", response_model=ProviderUserListResponse)
async def get_providers(
    # Filtering parameters
    search: Optional[str] = Query(None, description="Search in email, username, full_name, business_name"),
    email: Optional[str] = Query(None, description="Filter by email"),
    verification_status: Optional[str] = Query(None, description="Filter by verification status"),
    business_type: Optional[str] = Query(None, description="Filter by business type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verified status"),
    is_accepting_bookings: Optional[bool] = Query(None, description="Filter by booking acceptance"),
    has_business_registration: Optional[bool] = Query(None, description="Filter by business registration"),
    created_from: Optional[str] = Query(None, description="Filter created from date (YYYY-MM-DD)"),
    created_to: Optional[str] = Query(None, description="Filter created to date (YYYY-MM-DD)"),
    
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    
    # Sorting parameters
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Dependencies
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get providers with filtering and pagination.
    
    Supports filtering by various criteria and returns paginated results.
    """
    filters = ProviderUserFilters(
        search=search,
        email=email,
        verification_status=verification_status,
        business_type=business_type,
        is_active=is_active,
        is_verified=is_verified,
        is_accepting_bookings=is_accepting_bookings,
        has_business_registration=has_business_registration,
        created_from=created_from,
        created_to=created_to
    )
    
    return provider_service.get_providers_with_filters(
        filters=filters,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/statistics", response_model=ProviderStatisticsResponse)
async def get_provider_statistics(
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get provider user statistics.
    
    Returns comprehensive statistics about provider users including counts,
    verification status breakdown, and business type distribution.
    """
    return provider_service.get_provider_statistics()


@router.get("/search", response_model=list[ProviderUserResponse])
async def search_providers(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Quick search for providers.
    
    Searches across email, username, full_name, and business_name fields.
    """
    return provider_service.search_providers(search_term=q, limit=limit)


@router.post("/", response_model=ProviderUserResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_provider(
    provider_data: ProviderUserCreateRequest,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Create a new provider user.
    
    Creates a new provider with the provided information.
    Email and username must be unique.
    """
    return provider_service.create_provider(provider_data)


@router.get("/{provider_id}", response_model=ProviderUserResponse)
async def get_provider(
    provider_id: UUID,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get provider by ID.
    
    Returns detailed information about a specific provider.
    """
    return provider_service.get_provider_by_id(provider_id)


@router.put("/{provider_id}", response_model=ProviderUserResponse)
async def update_provider(
    provider_id: UUID,
    provider_data: ProviderUserUpdateRequest,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update provider information.
    
    Updates the specified provider with the provided data.
    """
    return provider_service.update_provider(provider_id, provider_data)


@router.delete("/{provider_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_provider(
    provider_id: UUID,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Delete provider user.
    
    Permanently deletes the specified provider.
    """
    provider_service.delete_provider(provider_id)


@router.patch("/{provider_id}/verification", response_model=ProviderUserResponse)
async def update_provider_verification(
    provider_id: UUID,
    verification_data: ProviderVerificationRequest,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update provider verification status.
    
    Updates the verification status of the provider.
    Valid statuses: pending, verified, rejected
    """
    return provider_service.update_provider_verification_status(
        provider_id=provider_id,
        verification_status=verification_data.verification_status,
        verification_notes=verification_data.verification_notes
    )


@router.patch("/{provider_id}/status", response_model=ProviderUserResponse)
async def update_provider_status(
    provider_id: UUID,
    status_data: ProviderStatusUpdate,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update provider status flags.
    
    Updates the active and booking acceptance status of the provider.
    """
    return provider_service.update_provider_status(
        provider_id=provider_id,
        is_active=status_data.is_active,
        is_accepting_bookings=status_data.is_accepting_bookings
    )


@router.patch("/{provider_id}/business-hours", response_model=ProviderUserResponse)
async def update_provider_business_hours(
    provider_id: UUID,
    hours_data: ProviderBusinessHoursUpdate,
    provider_service: ProviderManagementService = Depends(get_provider_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update provider business hours.
    
    Updates the business hours configuration for the provider.
    """
    return provider_service.update_provider_business_hours(
        provider_id=provider_id,
        business_hours=hours_data.business_hours
    )


# ============================================================================
# Include Sub-Routers for Provider-Related Operations
# ============================================================================

# Salon-Provider Employment Relationships
# Endpoints: /providers/salon-providers/*
router.include_router(salon_providers_router)

# Provider Business Details & Salon Ownership (to be implemented)
# Endpoints: /providers/business-details/* and /providers/salon-ownership/*
# router.include_router(business_details_router)


# ============================================================================
# Export
# ============================================================================

# Alias for backward compatibility and easier import
provider_management_router = router