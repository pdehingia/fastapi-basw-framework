"""Customer management API endpoints for admin panel."""

import io
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS
from app.core.database import get_db
from .dependencies import require_customer_management_access, require_user_management_access
from .schemas import (
    CustomerFilterParams,
    CustomerUserCreate,
    CustomerUserUpdate,
    CustomerUserResponse,
    CustomerDetailResponse,
    CustomerStatistics,
    CustomerStatusUpdate,
    CustomerVerificationUpdate,
    BulkCustomerOperation,
    BulkCustomerOperationResponse,
    CustomerNotification,
    CustomerExportRequest,
    CustomerSessionResponse,
    CustomerActivityLog
)
from .service import CustomerManagementService
from app.shared.exceptions import ValidationException, NotFoundError, ConflictError
from app.shared.pagination import PaginationParams, PaginatedResponse
from app.shared.responses import success_response

router = APIRouter(prefix="/customers", tags=[API_TAGS.CUSTOMER_MANAGEMENT])


@router.get("/", response_model=Dict[str, Any])
async def get_customers_list(
    # Query parameters for filtering
    search: Optional[str] = Query(None, description="Search in customer name, email, phone"),
    status: Optional[str] = Query(None, description="Filter by customer status (active/inactive/suspended)"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    city: Optional[str] = Query(None, description="Filter by city"),
    state: Optional[str] = Query(None, description="Filter by state"),
    country: Optional[str] = Query(None, description="Filter by country"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    created_after: Optional[str] = Query(None, description="Filter customers created after date (YYYY-MM-DD)"),
    created_before: Optional[str] = Query(None, description="Filter customers created before date (YYYY-MM-DD)"),
    last_login_after: Optional[str] = Query(None, description="Filter by last login after date (YYYY-MM-DD)"),
    last_login_before: Optional[str] = Query(None, description="Filter by last login before date (YYYY-MM-DD)"),
    min_bookings: Optional[int] = Query(None, description="Minimum number of bookings"),
    max_bookings: Optional[int] = Query(None, description="Maximum number of bookings"),
    min_spent: Optional[float] = Query(None, description="Minimum amount spent"),
    max_spent: Optional[float] = Query(None, description="Maximum amount spent"),
    has_oauth: Optional[bool] = Query(None, description="Filter customers with OAuth login"),
    
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    
    # Dependencies
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get paginated list of customers with filtering and search.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Filters available:**
    - search: Search in name, email, phone
    - status: active, inactive, suspended
    - is_verified: true/false for verification status
    - city/state/country: Geographic filters
    - gender: male, female, other, prefer_not_to_say
    - created_after/created_before: Date range filters
    - last_login_after/last_login_before: Activity filters
    - min_bookings/max_bookings: Booking count filters
    - min_spent/max_spent: Spending range filters
    - has_oauth: true/false for OAuth authentication
    """
    try:
        # Create filter and pagination objects
        filters = CustomerFilterParams(
            search=search,
            status=status,
            is_verified=is_verified,
            city=city,
            state=state,
            country=country,
            gender=gender,
            created_after=created_after,
            created_before=created_before,
            last_login_after=last_login_after,
            last_login_before=last_login_before,
            min_bookings=min_bookings,
            max_bookings=max_bookings,
            min_spent=min_spent,
            max_spent=max_spent,
            has_oauth=has_oauth,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        pagination = PaginationParams(page=page, page_size=page_size)
        
        # Initialize service and get customers
        customer_service = CustomerManagementService(db)
        result = await customer_service.get_customers_list(filters, pagination)
        
        return success_response(
            data=result.model_dump(),
            message="Customers retrieved successfully"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.get("/statistics", response_model=Dict[str, Any])
async def get_customer_statistics(
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get customer statistics for admin dashboard.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Returns:**
    - Total customer counts and breakdowns
    - Growth metrics and trends
    - Engagement and spending averages
    - Geographic and demographic distributions
    """
    try:
        customer_service = CustomerManagementService(db)
        statistics = await customer_service.get_customer_statistics()
        
        return success_response(
            data=statistics,
            message="Customer statistics retrieved successfully"
        )

    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.get("/{customer_id}", response_model=Dict[str, Any])
async def get_customer_detail(
    customer_id: UUID,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get detailed information about a specific customer.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Includes:**
    - Complete customer profile
    - Recent bookings and reviews
    - Activity history and sessions
    - Addresses and preferences
    - Statistical information
    - Referral information
    """
    try:
        customer_service = CustomerManagementService(db)
        customer_detail = await customer_service.get_customer_by_id(customer_id)
        
        return success_response(
            data=customer_detail.model_dump(),
            message="Customer details retrieved successfully"
        )

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.CUSTOMER_NOT_FOUND
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.post("/", response_model=Dict[str, Any])
async def create_customer(
    customer_data: CustomerUserCreate,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new customer user.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - email: Customer email (optional for phone-only customers)
    - phone: Customer phone number (required)
    - full_name: Customer full name
    - password: Initial password (optional)
    - Additional profile fields
    """
    try:
        customer_service = CustomerManagementService(db)
        new_customer = await customer_service.create_customer(customer_data)
        
        return success_response(
            data=new_customer.model_dump(),
            message="Customer created successfully"
        )

    except ConflictError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.CONFLICT,
            detail=ERROR_MESSAGES.ALREADY_EXISTS
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.put("/{customer_id}", response_model=Dict[str, Any])
async def update_customer(
    customer_id: UUID,
    update_data: CustomerUserUpdate,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Update customer information.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - All customer fields that can be updated
    - Only provided fields will be updated
    """
    try:
        customer_service = CustomerManagementService(db)
        updated_customer = await customer_service.update_customer(customer_id, update_data)
        
        return success_response(
            data=updated_customer.model_dump(),
            message="Customer updated successfully"
        )

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.CUSTOMER_NOT_FOUND
        )
    except ConflictError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.CONFLICT,
            detail=ERROR_MESSAGES.ALREADY_EXISTS
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.patch("/{customer_id}/status", response_model=Dict[str, Any])
async def update_customer_status(
    customer_id: UUID,
    status_update: CustomerStatusUpdate,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Update customer status (active/inactive/suspended).
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - status: New status (active/inactive/suspended)
    - reason: Reason for status change (optional)
    - notes: Additional notes (optional)
    - send_notification: Whether to notify customer (default: true)
    """
    try:
        customer_service = CustomerManagementService(db)
        updated_customer = await customer_service.update_customer_status(
            customer_id, status_update
        )
        
        return success_response(
            data=updated_customer.model_dump(),
            message="Customer status updated successfully"
        )

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.CUSTOMER_NOT_FOUND
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.patch("/{customer_id}/verification", response_model=Dict[str, Any])
async def update_customer_verification(
    customer_id: UUID,
    verification_update: CustomerVerificationUpdate,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Update customer verification status.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - is_verified: Verification status
    - verification_type: Type of verification (phone/email/both)
    - reason: Reason for verification change (optional)
    - notes: Additional notes (optional)
    - send_notification: Whether to notify customer (default: true)
    """
    try:
        # This would update verification status
        # Implementation would be similar to status update
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_IMPLEMENTED,
            detail="Customer verification update not yet implemented"
        )

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.CUSTOMER_NOT_FOUND
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.get("/{customer_id}/sessions", response_model=Dict[str, Any])
async def get_customer_sessions(
    customer_id: UUID,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get active sessions for a customer.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Returns:** List of active customer sessions with device and location information.
    """
    try:
        customer_service = CustomerManagementService(db)
        sessions = await customer_service.get_customer_sessions(customer_id)
        
        return success_response(
            data=sessions,
            message="Customer sessions retrieved successfully"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_ERROR
        )


@router.get("/{customer_id}/activity", response_model=Dict[str, Any])
async def get_customer_activity(
    customer_id: UUID,
    limit: int = Query(50, ge=1, le=200, description="Number of activity records to return"),
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get customer activity history.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Returns:** List of customer activities and actions.
    """
    try:
        customer_service = CustomerManagementService(db)
        activity = customer_service._get_customer_activity(customer_id)
        
        # Limit the results
        limited_activity = activity[:limit] if activity else []
        
        return success_response(
            data={"activities": limited_activity},
            message="Customer activity retrieved successfully"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/{customer_id}", response_model=Dict[str, Any])
async def delete_customer(
    customer_id: UUID,
    current_user: dict = Depends(require_user_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Delete a customer user (soft delete).
    
    **Required permissions:** can_manage_users (higher permission required for deletion)
    
    **Note:** This is a soft delete operation that preserves customer data for audit purposes.
    """
    try:
        # Implementation would mark customer as deleted
        # This is a sensitive operation, so it requires higher permissions
        raise HTTPException(
            status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
            detail="Customer deletion not yet implemented"
        )

    except NotFoundError as e:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/bulk-action", response_model=Dict[str, Any])
async def perform_bulk_customer_action(
    bulk_operation: BulkCustomerOperation,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Perform bulk actions on multiple customers.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - customer_ids: List of customer UUIDs (max 100)
    - action: Action to perform (activate/deactivate/suspend/verify/add_loyalty_points/send_notification)
    - reason: Reason for the action (optional)
    - Additional parameters based on action type
    """
    try:
        # Implementation would handle bulk operations
        raise HTTPException(
            status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
            detail="Bulk customer operations not yet implemented"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/export/csv")
async def export_customers_csv(
    # Filter parameters (same as list endpoint)
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    city: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    created_after: Optional[str] = Query(None),
    created_before: Optional[str] = Query(None),
    include_activity: bool = Query(False, description="Include activity data in export"),
    include_financial: bool = Query(False, description="Include financial data in export"),
    
    # Dependencies
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
):
    """
    Export customers to CSV format.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Parameters:** Same filtering options as the list endpoint.
    
    **Returns:** CSV file download with all matching customers.
    """
    try:
        # Implementation would generate CSV export
        raise HTTPException(
            status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
            detail="Customer CSV export not yet implemented"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/notify", response_model=Dict[str, Any])
async def send_customer_notification(
    notification: CustomerNotification,
    current_user: dict = Depends(require_customer_management_access),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Send notification to selected customers.
    
    **Required permissions:** can_manage_customers or can_manage_users
    
    **Body parameters:**
    - customer_ids: List of customer UUIDs to notify
    - title: Notification title
    - message: Notification message
    - notification_type: Type of notification (general/promotional/reminder/alert)
    - send_email: Send via email (default: false)
    - send_sms: Send via SMS (default: false)
    - send_push: Send push notification (default: true)
    """
    try:
        # Implementation would handle sending notifications
        raise HTTPException(
            status_code=http_status.HTTP_501_NOT_IMPLEMENTED,
            detail="Customer notification sending not yet implemented"
        )

    except ValidationException as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )