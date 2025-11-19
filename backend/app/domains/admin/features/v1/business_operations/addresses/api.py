"""Address Management API endpoints."""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.shared.models.user import AdminUser
from app.shared.pagination import PaginationParams
from app.shared.responses import SuccessResponse

from .schemas import (
    AddressCreate, AddressUpdate, AddressResponse, AddressDetailResponse,
    AddressFilterParams, AddressListResponse, AddressStatistics,
    AddressVerify, AddressVerificationResponse, SetDefaultRequest,
    AddressBulkImport, AddressBulkImportResult, OwnerType
)
from .service import AddressManagementService
from .dependencies import require_address_management


router = APIRouter(prefix="/addresses", tags=["Address Management"])


# ===== ADDRESS CRUD ENDPOINTS =====

@router.post(
    "",
    response_model=SuccessResponse[AddressResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create address",
    description="Create a new address for any user type (admin/provider/customer)"
)
async def create_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Create a new address."""
    service = AddressManagementService(db)
    address = service.create_address(address_data)
    
    return SuccessResponse(
        data=address,
        message="Address created successfully"
    )


@router.get(
    "",
    response_model=SuccessResponse[AddressListResponse],
    summary="List all addresses",
    description="Get paginated list of all addresses with filters"
)
async def list_addresses(
    search: Optional[str] = Query(None, description="Search in address fields"),
    owner_user_id: Optional[str] = Query(None, description="Filter by owner user ID"),
    owner_type: Optional[OwnerType] = Query(None, description="Filter by owner type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    pincode: Optional[str] = Query(None, description="Filter by pincode"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    is_default: Optional[bool] = Query(None, description="Filter by default status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Get paginated list of addresses with filters."""
    service = AddressManagementService(db)
    
    filters = AddressFilterParams(
        search=search,
        owner_user_id=owner_user_id,
        owner_type=owner_type,
        city=city,
        state=state,
        pincode=pincode,
        is_verified=is_verified,
        is_default=is_default
    )
    
    pagination = PaginationParams(page=page, page_size=page_size)
    
    result = service.get_addresses_list(filters, pagination)
    
    return SuccessResponse(
        data=result,
        message="Addresses retrieved successfully"
    )


@router.get(
    "/{address_id}",
    response_model=SuccessResponse[AddressDetailResponse],
    summary="Get address details",
    description="Get detailed information about a specific address"
)
async def get_address_details(
    address_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Get address details."""
    service = AddressManagementService(db)
    address = service.get_address_by_id(address_id)
    
    return SuccessResponse(
        data=address,
        message="Address details retrieved successfully"
    )


@router.put(
    "/{address_id}",
    response_model=SuccessResponse[AddressResponse],
    summary="Update address",
    description="Update address information"
)
async def update_address(
    address_id: str,
    address_data: AddressUpdate,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Update address details."""
    service = AddressManagementService(db)
    address = service.update_address(address_id, address_data)
    
    return SuccessResponse(
        data=address,
        message="Address updated successfully"
    )


@router.delete(
    "/{address_id}",
    response_model=SuccessResponse[dict],
    summary="Delete address",
    description="Delete an address"
)
async def delete_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Delete an address."""
    service = AddressManagementService(db)
    service.delete_address(address_id)
    
    return SuccessResponse(
        data={"address_id": address_id, "deleted": True},
        message="Address deleted successfully"
    )


# ===== ADDRESS ACTION ENDPOINTS =====

@router.get(
    "/users/{user_id}",
    response_model=SuccessResponse[List[AddressDetailResponse]],
    summary="Get user addresses",
    description="Get all addresses for a specific user (polymorphic across user types)"
)
async def get_user_addresses(
    user_id: str,
    owner_type: OwnerType = Query(..., description="Owner type (admin/provider/customer)"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Get all addresses for a user."""
    service = AddressManagementService(db)
    addresses = service.get_user_addresses(user_id, owner_type.value)
    
    return SuccessResponse(
        data=addresses,
        message=f"User addresses retrieved successfully ({len(addresses)} found)"
    )


@router.patch(
    "/{address_id}/set-default",
    response_model=SuccessResponse[AddressResponse],
    summary="Set default address",
    description="Set an address as the default address for a user"
)
async def set_default_address(
    address_id: str,
    request_data: SetDefaultRequest,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Set address as default for user."""
    service = AddressManagementService(db)
    address = service.set_default_address(address_id, request_data)
    
    return SuccessResponse(
        data=address,
        message="Address set as default successfully"
    )


@router.post(
    "/{address_id}/verify",
    response_model=SuccessResponse[AddressVerificationResponse],
    summary="Verify address",
    description="Verify address with geocoding/location services"
)
async def verify_address(
    address_id: str,
    verify_data: AddressVerify,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Verify address with location coordinates."""
    service = AddressManagementService(db)
    result = service.verify_address(address_id, verify_data)
    
    return SuccessResponse(
        data=result,
        message="Address verified successfully"
    )


@router.post(
    "/bulk-import",
    response_model=SuccessResponse[AddressBulkImportResult],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk import addresses",
    description="Import multiple addresses at once (max 100 per request)"
)
async def bulk_import_addresses(
    bulk_data: AddressBulkImport,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Bulk import addresses."""
    service = AddressManagementService(db)
    result = service.bulk_import_addresses(bulk_data)
    
    return SuccessResponse(
        data=result,
        message=f"Bulk import completed: {result.successful_imports} successful, {result.failed_imports} failed"
    )


# ===== STATISTICS ENDPOINT =====

@router.get(
    "/statistics/overview",
    response_model=SuccessResponse[AddressStatistics],
    summary="Get address statistics",
    description="Get address statistics and analytics"
)
async def get_address_statistics(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(require_address_management)
):
    """Get address statistics."""
    service = AddressManagementService(db)
    stats = service.get_address_statistics()
    
    return SuccessResponse(
        data=stats,
        message="Address statistics retrieved successfully"
    )
