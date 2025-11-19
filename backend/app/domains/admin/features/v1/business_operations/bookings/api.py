"""Booking management API endpoints for admin panel."""

import io
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS

from app.core.database import get_db
from .dependencies import require_booking_management_access
from .schemas import (
    BookingFilterParams,
    BookingResponse,
    BookingDetailResponse,
    BookingStatusUpdate,
    DisputeResolution,
    BookingStatistics,
)
from .service import BookingManagementService
from app.shared.exceptions import ValidationException, NotFoundError
from app.shared.pagination import PaginationParams, PaginatedResponse

router = APIRouter(prefix="/bookings", tags=[API_TAGS.BOOKING_MANAGEMENT])


@router.get("/", response_model=PaginatedResponse[BookingResponse])
async def get_bookings_list(
    # Query parameters for filtering
    search: Optional[str] = Query(None, description="Search in booking number, customer name, provider name"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    occasion_type: Optional[str] = Query(None, description="Filter by occasion type"),
    service_type: Optional[str] = Query(None, description="Filter by service type"),
    city: Optional[str] = Query(None, description="Filter by city"),
    date_from: Optional[str] = Query(None, description="Filter bookings from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter bookings to date (YYYY-MM-DD)"),
    amount_min: Optional[float] = Query(None, description="Minimum booking amount"),
    amount_max: Optional[float] = Query(None, description="Maximum booking amount"),
    has_promo_code: Optional[bool] = Query(None, description="Filter bookings with promo codes"),
    
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    
    # Dependencies
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
) -> PaginatedResponse[BookingResponse]:
    """
    Get paginated list of bookings with filtering.
    
    **Required permissions:** admin, super_admin
    
    **Filters available:**
    - search: Search in booking number, customer/provider names
    - status: pending, confirmed, started, completed, cancelled, refunded, disputed
    - payment_status: pending, paid, failed, refunded
    - occasion_type: wedding, birthday, anniversary, corporate, festival, other
    - service_type: Filter by specific service type
    - city: Filter by event city
    - date_from/date_to: Filter by booking date range
    - amount_min/amount_max: Filter by booking amount range
    - has_promo_code: true/false to filter bookings with promo codes
    """
    try:
        # Create filter and pagination objects
        filters = BookingFilterParams(
            search=search,
            status=status,
            payment_status=payment_status,
            occasion_type=occasion_type,
            service_type=service_type,
            city=city,
            date_from=date_from,
            date_to=date_to,
            amount_min=amount_min,
            amount_max=amount_max,
            has_promo_code=has_promo_code
        )
        
        pagination = PaginationParams(page=page, page_size=size)
        
        # Initialize service and get bookings
        booking_service = BookingManagementService(db)
        result = await booking_service.get_bookings_list(filters, pagination)
        
        return result

    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/statistics", response_model=BookingStatistics)
async def get_booking_statistics(
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
) -> BookingStatistics:
    """
    Get booking statistics for admin dashboard.
    
    **Required permissions:** admin, super_admin
    
    **Returns:**
    - Total bookings count
    - Status-wise breakdown
    - Revenue metrics
    - Top cities and services
    - Monthly trends
    """
    try:
        booking_service = BookingManagementService(db)
        statistics = await booking_service.get_booking_statistics()
        return statistics

    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{booking_id}", response_model=BookingDetailResponse)
async def get_booking_detail(
    booking_id: int,
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
) -> BookingDetailResponse:
    """
    Get detailed information about a specific booking.
    
    **Required permissions:** admin, super_admin
    
    **Includes:**
    - Complete booking details
    - Customer and provider information
    - Payment and refund details
    - Review information
    - Timeline of events
    """
    try:
        booking_service = BookingManagementService(db)
        booking_detail = await booking_service.get_booking_detail(booking_id)
        return booking_detail

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=str(e)
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.patch("/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
) -> dict:
    """
    Update booking status with admin tracking.
    
    **Required permissions:** admin, super_admin
    
    **Body parameters:**
    - status: New booking status (required)
    - reason: Reason for status change (optional)
    - refund_amount: Refund amount if applicable (optional)
    - notes: Admin notes (optional)
    
    **Available statuses:**
    - pending, confirmed, started, completed, cancelled, refunded, disputed
    """
    try:
        booking_service = BookingManagementService(db)
        result = await booking_service.update_booking_status(
            booking_id=booking_id,
            status_update=status_update,
            admin_user_id=current_user["id"]
        )
        return result

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=str(e)
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/{booking_id}/resolve-dispute")
async def resolve_booking_dispute(
    booking_id: int,
    resolution: DisputeResolution,
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
) -> dict:
    """
    Resolve booking dispute with refund processing.
    
    **Required permissions:** admin, super_admin
    
    **Body parameters:**
    - resolution: Resolution description (required)
    - refund_percentage: Refund percentage (0-100, optional)
    - refund_amount: Fixed refund amount (optional)
    - notes: Resolution notes (optional)
    - notify_parties: Whether to notify customer/provider (default: true)
    
    **Note:** Provide either refund_percentage or refund_amount, not both.
    """
    try:
        # Validate that only one refund method is provided
        if resolution.refund_percentage is not None and resolution.refund_amount is not None:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.BAD_REQUEST,
                detail=ERROR_MESSAGES.REFUND_METHOD_CONFLICT
            )

        booking_service = BookingManagementService(db)
        result = await booking_service.resolve_dispute(
            booking_id=booking_id,
            resolution=resolution,
            admin_user_id=current_user["id"]
        )
        return result

    except NotFoundError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=str(e)
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/export/csv")
async def export_bookings_csv(
    # Filter parameters (same as list endpoint)
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    occasion_type: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    amount_min: Optional[float] = Query(None),
    amount_max: Optional[float] = Query(None),
    has_promo_code: Optional[bool] = Query(None),
    
    # Dependencies
    current_user: dict = Depends(require_booking_management_access),
    db: Session = Depends(get_db)
):
    """
    Export bookings to CSV format.
    
    **Required permissions:** admin, super_admin
    
    **Parameters:** Same filtering options as the list endpoint.
    
    **Returns:** CSV file download with all matching bookings.
    """
    try:
        # Create filter object
        filters = BookingFilterParams(
            search=search,
            status=status,
            payment_status=payment_status,
            occasion_type=occasion_type,
            service_type=service_type,
            city=city,
            date_from=date_from,
            date_to=date_to,
            amount_min=amount_min,
            amount_max=amount_max,
            has_promo_code=has_promo_code
        )
        
        # Generate CSV
        booking_service = BookingManagementService(db)
        csv_data = await booking_service.export_bookings(filters, "csv")
        
        # Create filename with timestamp
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"bookings_export_{timestamp}.csv"
        
        # Return CSV as streaming response
        response = StreamingResponse(
            io.BytesIO(csv_data.getvalue().encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
        return response

    except ValidationException as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
