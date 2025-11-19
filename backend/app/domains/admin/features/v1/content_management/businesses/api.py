"""Business Management API for Admin Panel."""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from app.shared.constants import HTTP_STATUS_CODES, API_TAGS
from app.domains.admin.shared.dependencies import require_admin_role
from .dependencies import get_business_management_service
from .service import BusinessManagementService
from .schemas import (
    SalonResponse,
    AcademyResponse,
    ServiceResponse,
    SalonListResponse,
    AcademyListResponse,
    ServiceListResponse,
    SalonCreateRequest,
    AcademyCreateRequest,
    ServiceCreateRequest,
    SalonUpdateRequest,
    AcademyUpdateRequest,
    ServiceUpdateRequest,
    SalonFilters,
    AcademyFilters,
    ServiceFilters,
    BusinessStatisticsResponse,
    BusinessStatusUpdate,
    SalonBusinessHoursUpdate
)

router = APIRouter(prefix="/business", tags=[API_TAGS.BUSINESS_MANAGEMENT])


# Statistics endpoint
@router.get("/statistics", response_model=BusinessStatisticsResponse)
async def get_business_statistics(
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get business statistics.
    
    Returns comprehensive statistics about salons, academies, and services.
    """
    return business_service.get_business_statistics()


# ==== SALON MANAGEMENT ====

@router.get("/salons", response_model=SalonListResponse)
async def get_salons(
    # Filtering parameters
    search: Optional[str] = Query(None, description="Search in salon name"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verified status"),
    commission_min: Optional[float] = Query(None, description="Minimum commission rate"),
    commission_max: Optional[float] = Query(None, description="Maximum commission rate"),
    created_from: Optional[str] = Query(None, description="Filter created from date (YYYY-MM-DD)"),
    created_to: Optional[str] = Query(None, description="Filter created to date (YYYY-MM-DD)"),
    
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    
    # Sorting parameters
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Dependencies
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get salons with filtering and pagination.
    
    Supports filtering by various criteria and returns paginated results.
    """
    filters = SalonFilters(
        search=search,
        is_active=is_active,
        is_verified=is_verified,
        commission_min=commission_min,
        commission_max=commission_max,
        created_from=created_from,
        created_to=created_to
    )
    
    return business_service.get_salons_with_filters(
        filters=filters,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.post("/salons", response_model=SalonResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_salon(
    salon_data: SalonCreateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Create a new salon.
    
    Creates a salon with the provided information.
    Salon name and slug must be unique.
    """
    return business_service.create_salon(salon_data)


@router.get("/salons/search", response_model=List[SalonResponse])
async def search_salons(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Quick search for salons.
    
    Searches salon names for the given term.
    """
    return business_service.search_salons(search_term=q, limit=limit)


@router.get("/salons/{salon_id}", response_model=SalonResponse)
async def get_salon(
    salon_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get salon by ID.
    
    Returns detailed information about a specific salon.
    """
    return business_service.get_salon_by_id(salon_id)


@router.put("/salons/{salon_id}", response_model=SalonResponse)
async def update_salon(
    salon_id: UUID,
    salon_data: SalonUpdateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update salon information.
    
    Updates the specified salon with the provided data.
    """
    return business_service.update_salon(salon_id, salon_data)


@router.delete("/salons/{salon_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_salon(
    salon_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Delete salon.
    
    Permanently deletes the specified salon.
    """
    business_service.delete_salon(salon_id)


@router.patch("/salons/{salon_id}/status", response_model=SalonResponse)
async def update_salon_status(
    salon_id: UUID,
    status_data: BusinessStatusUpdate,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update salon status flags.
    
    Updates the active and verified status of the salon.
    """
    return business_service.update_salon_status(
        salon_id=salon_id,
        is_active=status_data.is_active,
        is_verified=status_data.is_verified
    )


@router.patch("/salons/{salon_id}/business-hours", response_model=SalonResponse)
async def update_salon_business_hours(
    salon_id: UUID,
    hours_data: SalonBusinessHoursUpdate,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update salon business hours.
    
    Updates the business hours configuration for the salon.
    """
    return business_service.update_salon(
        salon_id=salon_id,
        salon_data=SalonUpdateRequest(business_hours=hours_data.business_hours)
    )


# ==== ACADEMY MANAGEMENT ====

@router.get("/academies", response_model=AcademyListResponse)
async def get_academies(
    # Filtering parameters
    search: Optional[str] = Query(None, description="Search in academy name"),
    provider_user_id: Optional[UUID] = Query(None, description="Filter by provider user"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verified status"),
    has_gst: Optional[bool] = Query(None, description="Filter by GST number presence"),
    has_registration: Optional[bool] = Query(None, description="Filter by registration number presence"),
    created_from: Optional[str] = Query(None, description="Filter created from date (YYYY-MM-DD)"),
    created_to: Optional[str] = Query(None, description="Filter created to date (YYYY-MM-DD)"),
    
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    
    # Sorting parameters
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Dependencies
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get academies with filtering and pagination.
    
    Supports filtering by various criteria and returns paginated results.
    """
    filters = AcademyFilters(
        search=search,
        provider_user_id=provider_user_id,
        is_active=is_active,
        is_verified=is_verified,
        has_gst=has_gst,
        has_registration=has_registration,
        created_from=created_from,
        created_to=created_to
    )
    
    return business_service.get_academies_with_filters(
        filters=filters,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.post("/academies", response_model=AcademyResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_academy(
    academy_data: AcademyCreateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Create a new academy.
    
    Creates an academy with the provided information.
    Academy name must be unique.
    """
    return business_service.create_academy(academy_data)


@router.get("/academies/search", response_model=List[AcademyResponse])
async def search_academies(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Quick search for academies.
    
    Searches academy names for the given term.
    """
    return business_service.search_academies(search_term=q, limit=limit)


@router.get("/academies/{academy_id}", response_model=AcademyResponse)
async def get_academy(
    academy_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get academy by ID.
    
    Returns detailed information about a specific academy.
    """
    return business_service.get_academy_by_id(academy_id)


@router.put("/academies/{academy_id}", response_model=AcademyResponse)
async def update_academy(
    academy_id: UUID,
    academy_data: AcademyUpdateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update academy information.
    
    Updates the specified academy with the provided data.
    """
    return business_service.update_academy(academy_id, academy_data)


@router.delete("/academies/{academy_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_academy(
    academy_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Delete academy.
    
    Permanently deletes the specified academy.
    """
    business_service.delete_academy(academy_id)


@router.patch("/academies/{academy_id}/status", response_model=AcademyResponse)
async def update_academy_status(
    academy_id: UUID,
    status_data: BusinessStatusUpdate,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update academy status flags.
    
    Updates the active and verified status of the academy.
    """
    return business_service.update_academy_status(
        academy_id=academy_id,
        is_active=status_data.is_active,
        is_verified=status_data.is_verified
    )


# ==== SERVICE MANAGEMENT ====

@router.get("/services", response_model=ServiceListResponse)
async def get_services(
    # Filtering parameters
    search: Optional[str] = Query(None, description="Search in service name or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status"),
    price_min: Optional[float] = Query(None, description="Minimum price range"),
    price_max: Optional[float] = Query(None, description="Maximum price range"),
    duration_min: Optional[int] = Query(None, description="Minimum duration"),
    duration_max: Optional[int] = Query(None, description="Maximum duration"),
    
    # Pagination parameters
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    
    # Sorting parameters
    sort_by: str = Query("display_order", description="Sort by field"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    
    # Dependencies
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get services with filtering and pagination.
    
    Supports filtering by various criteria and returns paginated results.
    """
    filters = ServiceFilters(
        search=search,
        category=category,
        is_active=is_active,
        is_featured=is_featured,
        price_min=price_min,
        price_max=price_max,
        duration_min=duration_min,
        duration_max=duration_max
    )
    
    return business_service.get_services_with_filters(
        filters=filters,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.post("/services", response_model=ServiceResponse, status_code=HTTP_STATUS_CODES.CREATED)
async def create_service(
    service_data: ServiceCreateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Create a new service.
    
    Creates a service with the provided information.
    Service name and slug must be unique.
    """
    return business_service.create_service(service_data)


@router.get("/services/search", response_model=List[ServiceResponse])
async def search_services(
    q: str = Query(..., min_length=2, description="Search term"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Quick search for services.
    
    Searches service names and descriptions for the given term.
    """
    return business_service.search_services(search_term=q, limit=limit)


@router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service(
    service_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Get service by ID.
    
    Returns detailed information about a specific service.
    """
    return business_service.get_service_by_id(service_id)


@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: UUID,
    service_data: ServiceUpdateRequest,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update service information.
    
    Updates the specified service with the provided data.
    """
    return business_service.update_service(service_id, service_data)


@router.delete("/services/{service_id}", status_code=HTTP_STATUS_CODES.NO_CONTENT)
async def delete_service(
    service_id: UUID,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Delete service.
    
    Permanently deletes the specified service.
    """
    business_service.delete_service(service_id)


@router.patch("/services/{service_id}/status", response_model=ServiceResponse)
async def update_service_status(
    service_id: UUID,
    status_data: BusinessStatusUpdate,
    business_service: BusinessManagementService = Depends(get_business_management_service),
    current_user=Depends(require_admin_role)
):
    """
    Update service status flags.
    
    Updates the active and featured status of the service.
    """
    return business_service.update_service_status(
        service_id=service_id,
        is_active=status_data.is_active,
        is_featured=status_data.is_verified  # Using is_verified as is_featured for status update
    )


# Alias for backward compatibility and easier import
business_management_router = router