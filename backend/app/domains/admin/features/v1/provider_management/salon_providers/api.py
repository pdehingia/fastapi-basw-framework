"""
FastAPI router for Salon Provider Management
"""

from typing import Optional
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from .schemas import (
    SalonProviderCreate,
    SalonProviderUpdate,
    SalonProviderResponse,
    SalonProviderDetailResponse,
    SalonProviderListResponse,
    SalonProviderFilters,
    SalonProviderMetrics,
    SalonProviderStatistics,
    SalonProviderStatusUpdate,
)
from .service import SalonProviderService


router = APIRouter(prefix="/salon-providers", tags=["Salon Provider Management"])


# ============================================================================
# Salon Provider Endpoints
# ============================================================================

@router.post(
    "",
    response_model=SalonProviderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add provider to salon",
    description="Create a new salon-provider relationship"
)
def add_provider_to_salon(
    salon_provider_data: SalonProviderCreate,
    db: Session = Depends(get_db)
):
    """Add a provider to a salon"""
    return SalonProviderService.add_provider_to_salon(db, salon_provider_data)


@router.get(
    "",
    response_model=SalonProviderListResponse,
    summary="Get salon providers",
    description="Get paginated list of salon-provider relationships with filters"
)
def get_salon_providers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    salon_id: Optional[UUID] = Query(None, description="Filter by salon"),
    provider_user_id: Optional[UUID] = Query(None, description="Filter by provider"),
    employment_type: Optional[str] = Query(None, description="Filter by employment type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    joined_after: Optional[date] = Query(None, description="Filter by joined date after"),
    joined_before: Optional[date] = Query(None, description="Filter by joined date before"),
    search: Optional[str] = Query(None, description="Search in provider name, email"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """Get all salon providers with filters and pagination"""
    filters = SalonProviderFilters(
        salon_id=salon_id,
        provider_user_id=provider_user_id,
        employment_type=employment_type,
        is_active=is_active,
        joined_after=joined_after,
        joined_before=joined_before,
        search=search
    )
    
    salon_providers, total = SalonProviderService.get_salon_providers(
        db,
        filters=filters,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return SalonProviderListResponse(
        items=salon_providers,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get(
    "/{salon_provider_id}",
    response_model=SalonProviderResponse,
    summary="Get salon provider by ID",
    description="Get detailed information about a salon-provider relationship"
)
def get_salon_provider(
    salon_provider_id: UUID,
    db: Session = Depends(get_db)
):
    """Get salon provider by ID"""
    return SalonProviderService.get_salon_provider(db, salon_provider_id)


@router.put(
    "/{salon_provider_id}",
    response_model=SalonProviderResponse,
    summary="Update salon provider",
    description="Update salon-provider relationship details"
)
def update_salon_provider(
    salon_provider_id: UUID,
    update_data: SalonProviderUpdate,
    db: Session = Depends(get_db)
):
    """Update salon provider relationship"""
    return SalonProviderService.update_salon_provider(db, salon_provider_id, update_data)


@router.delete(
    "/{salon_provider_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove provider from salon",
    description="Remove a provider from a salon (hard delete if no bookings)"
)
def remove_provider_from_salon(
    salon_provider_id: UUID,
    db: Session = Depends(get_db)
):
    """Remove provider from salon"""
    SalonProviderService.remove_provider_from_salon(db, salon_provider_id)
    return None


@router.patch(
    "/{salon_provider_id}/status",
    response_model=SalonProviderResponse,
    summary="Update provider status",
    description="Update provider active status at a salon"
)
def update_provider_status(
    salon_provider_id: UUID,
    status_data: SalonProviderStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update provider active status"""
    return SalonProviderService.update_provider_status(db, salon_provider_id, status_data)


@router.get(
    "/{salon_provider_id}/metrics",
    response_model=SalonProviderMetrics,
    summary="Get provider metrics",
    description="Get performance metrics for a salon-provider relationship"
)
def get_provider_metrics(
    salon_provider_id: UUID,
    db: Session = Depends(get_db)
):
    """Get provider performance metrics at salon"""
    return SalonProviderService.get_provider_metrics(db, salon_provider_id)


@router.get(
    "/statistics/overview",
    response_model=SalonProviderStatistics,
    summary="Get salon provider statistics",
    description="Get comprehensive statistics about salon-provider relationships"
)
def get_salon_provider_statistics(db: Session = Depends(get_db)):
    """Get salon provider statistics"""
    return SalonProviderService.get_salon_provider_statistics(db)
