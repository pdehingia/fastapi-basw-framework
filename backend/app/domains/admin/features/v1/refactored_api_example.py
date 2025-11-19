"""
Refactored API Example

Example showing how to refactor API endpoints to use constants.
"""

from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Path, status

# REFACTORED: Import all required constants
from app.shared.constants import (
    API_ROUTES,
    API_TAGS, 
    HTTP_STATUS_CODES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    VALIDATION_MESSAGES,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    USER_ROLES
)

# REFACTORED: Use constants for router configuration
router = APIRouter(
    prefix=API_ROUTES.BOOKINGS_LIST,  # Instead of "/bookings"
    tags=[API_TAGS.BOOKING_MANAGEMENT]  # Instead of ["Booking Management"]
)

# Mock service dependency (would be properly injected)
class MockBookingService:
    def get_bookings(self, **kwargs):
        return []
    def get_booking_by_id(self, booking_id: int):
        return None
    def create_booking(self, booking_data: dict):
        return {"id": 1, "status": BOOKING_STATUS.PENDING}
    def update_booking(self, booking_id: int, data: dict):
        return None
    def cancel_booking(self, booking_id: int, cancelled_by: str):
        return None

service = MockBookingService()

# REFACTORED: API Endpoints using constants

@router.get(
    "",  # Base path from router prefix
    response_model=List[Dict[str, Any]],
    status_code=HTTP_STATUS_CODES.OK  # Instead of 200
)
async def get_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None)
) -> List[Dict[str, Any]]:
    """
    Get bookings with filtering options.
    
    REFACTORED: Uses constants for status codes and validation.
    """
    try:
        # REFACTORED: Validate status using constants
        if status and status not in BOOKING_STATUS.get_all():
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.BAD_REQUEST,  # Instead of 400
                detail=VALIDATION_MESSAGES.INVALID_CHOICE.format(
                    choices=', '.join(BOOKING_STATUS.get_all())
                )
            )
        
        bookings = service.get_bookings(
            skip=skip, 
            limit=limit, 
            status=status, 
            customer_id=customer_id
        )
        return bookings
        
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,  # Instead of 500
            detail=ERROR_MESSAGES.DATABASE_ERROR  # Instead of "Database error"
        )


@router.get(
    "/{booking_id}",
    response_model=Dict[str, Any],
    status_code=HTTP_STATUS_CODES.OK
)
async def get_booking(
    booking_id: int = Path(..., gt=0, description="Booking ID")
) -> Dict[str, Any]:
    """
    Get booking by ID.
    
    REFACTORED: Uses constants for responses and error handling.
    """
    try:
        booking = service.get_booking_by_id(booking_id)
        if not booking:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,  # Instead of 404
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Booking")  # Dynamic message
            )
        return booking
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post(
    "",
    response_model=Dict[str, Any],
    status_code=HTTP_STATUS_CODES.CREATED  # Instead of 201
)
async def create_booking(
    booking_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create a new booking.
    
    REFACTORED: Uses constants for success messages and status codes.
    """
    try:
        # REFACTORED: Validation using constants
        required_fields = ['customer_id', 'provider_id', 'service_id', 'booking_date']
        for field in required_fields:
            if field not in booking_data:
                raise HTTPException(
                    status_code=HTTP_STATUS_CODES.BAD_REQUEST,
                    detail=VALIDATION_MESSAGES.FIELD_REQUIRED.replace("This field", field)
                )
        
        booking = service.create_booking(booking_data)
        
        # REFACTORED: Success response with constants
        return {
            "success": True,
            "message": SUCCESS_MESSAGES.BOOKING_CREATED,  # Instead of hardcoded
            "data": booking
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        )


@router.put(
    "/{booking_id}",
    response_model=Dict[str, Any],
    status_code=HTTP_STATUS_CODES.OK
)
async def update_booking(
    booking_id: int,
    update_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Update booking.
    
    REFACTORED: Uses constants for business logic validation.
    """
    try:
        # REFACTORED: Status validation using constants
        if 'status' in update_data:
            new_status = update_data['status']
            if new_status not in BOOKING_STATUS.get_all():
                raise HTTPException(
                    status_code=HTTP_STATUS_CODES.BAD_REQUEST,
                    detail=VALIDATION_MESSAGES.INVALID_CHOICE.format(
                        choices=', '.join(BOOKING_STATUS.get_all())
                    )
                )
        
        booking = service.update_booking(booking_id, update_data)
        if not booking:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Booking")
            )
            
        return {
            "success": True,
            "message": SUCCESS_MESSAGES.UPDATED_SUCCESS.format(entity="Booking"),
            "data": booking
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.DATABASE_ERROR
        )


@router.post(
    "/{booking_id}" + API_ROUTES.CANCEL,  # "/cancel" from constants
    response_model=Dict[str, Any],
    status_code=HTTP_STATUS_CODES.OK
)
async def cancel_booking(
    booking_id: int,
    cancellation_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Cancel booking.
    
    REFACTORED: Uses constants for role validation and business logic.
    """
    try:
        # REFACTORED: Role validation using constants
        cancelled_by = cancellation_data.get('cancelled_by')
        valid_roles = [USER_ROLES.CUSTOMER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN]
        
        if cancelled_by not in valid_roles:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.BAD_REQUEST,
                detail=VALIDATION_MESSAGES.INVALID_CHOICE.format(
                    choices=', '.join(valid_roles)
                )
            )
        
        booking = service.cancel_booking(booking_id, cancelled_by)
        if not booking:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Booking")
            )
        
        return {
            "success": True,
            "message": SUCCESS_MESSAGES.BOOKING_CANCELLED,  # Specific booking message
            "data": booking
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        )


# REFACTORED: Bulk operations using constants
@router.post(
    API_ROUTES.BULK_UPDATE,  # "/bulk-update" from constants
    response_model=Dict[str, Any],
    status_code=HTTP_STATUS_CODES.OK
)
async def bulk_update_bookings(
    bulk_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Bulk update bookings.
    
    REFACTORED: Demonstrates bulk operations using constants.
    """
    try:
        booking_ids = bulk_data.get('booking_ids', [])
        update_data = bulk_data.get('update_data', {})
        
        if not booking_ids:
            raise HTTPException(
                status_code=HTTP_STATUS_CODES.BAD_REQUEST,
                detail=VALIDATION_MESSAGES.FIELD_REQUIRED.replace("This field", "booking_ids")
            )
        
        # Process bulk update (mock implementation)
        results = {"success": 0, "failed": 0}
        
        for booking_id in booking_ids:
            try:
                service.update_booking(booking_id, update_data)
                results["success"] += 1
            except Exception:
                results["failed"] += 1
        
        return {
            "success": True,
            "message": SUCCESS_MESSAGES.BULK_UPDATE_SUCCESS,
            "data": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            detail=ERROR_MESSAGES.BULK_OPERATION_FAILED
        )


"""
REFACTORING BENEFITS DEMONSTRATED:

1. CONSISTENT ERROR HANDLING:
   - All HTTP status codes from constants
   - Standardized error messages
   - Consistent response format

2. MAINTAINABLE VALIDATION:
   - Status values validated against constants
   - Role validation using constants
   - Reusable validation patterns

3. CLEAR BUSINESS LOGIC:
   - Constants make business rules explicit
   - Easy to understand allowed values
   - Centralized business constants

4. BETTER API DOCUMENTATION:
   - Constants provide clear API structure
   - Self-documenting endpoint paths
   - Consistent response messages

5. EASIER TESTING:
   - Constants make test assertions clear
   - Mock data can use same constants
   - Consistent test expectations

BEFORE vs AFTER COMPARISON:

BEFORE:
```python
@router.post("/bookings", status_code=201)
async def create_booking():
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "message": "Booking created successfully"}
```

AFTER:
```python
@router.post("", status_code=HTTP_STATUS_CODES.CREATED)
async def create_booking():
    if not booking:
        raise HTTPException(
            status_code=HTTP_STATUS_CODES.NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND.format(entity="Booking")
        )
    return {
        "success": True, 
        "message": SUCCESS_MESSAGES.BOOKING_CREATED,
        "data": booking
    }
```
"""