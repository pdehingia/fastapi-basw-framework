"""Customer User Sessions API endpoints."""

from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from .dependencies import get_customer_user_sessions_service
from .schemas import (
    CustomerUserSessionResponse, CustomerUserSessionListResponse,
    CustomerUserSessionFilters, SessionStatistics, ActiveSessionInfo
)
from .service import CustomerUserSessionsService


router = APIRouter(prefix="/customer-user-sessions", tags=["Customer User Sessions"])


@router.get(
    "",
    response_model=CustomerUserSessionListResponse,
    summary="List customer user sessions",
    description="Get paginated list of customer user sessions with filtering options"
)
def list_customer_user_sessions(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    device_type: Optional[str] = Query(None, description="Filter by device type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    created_from: Optional[datetime] = Query(None, description="Filter from date"),
    created_to: Optional[datetime] = Query(None, description="Filter to date"),
    city: Optional[str] = Query(None, description="Filter by city"),
    country: Optional[str] = Query(None, description="Filter by country"),
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """List customer user sessions with filters."""
    filters = CustomerUserSessionFilters(
        user_id=user_id,
        device_type=device_type,
        is_active=is_active,
        created_from=created_from,
        created_to=created_to,
        city=city,
        country=country
    )
    return service.get_sessions(filters, page, size)


@router.get(
    "/stats",
    response_model=SessionStatistics,
    summary="Get session statistics",
    description="Get comprehensive customer session statistics"
)
def get_session_statistics(
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """Get session statistics."""
    return service.get_statistics()


@router.get(
    "/active",
    response_model=list[ActiveSessionInfo],
    summary="Get active sessions",
    description="Get list of customer users with currently active sessions"
)
def get_active_sessions(
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """Get active sessions."""
    return service.get_active_sessions()


@router.get(
    "/{session_id}",
    response_model=CustomerUserSessionResponse,
    summary="Get customer user session",
    description="Get specific customer user session by ID"
)
def get_customer_user_session(
    session_id: UUID,
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """Get customer user session by ID."""
    return service.get_session_by_id(session_id)


@router.post(
    "/{session_id}/revoke",
    response_model=dict,
    summary="Revoke session",
    description="Revoke (terminate) a specific customer user session"
)
def revoke_customer_session(
    session_id: UUID,
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """Revoke session."""
    return service.revoke_session(session_id)


@router.post(
    "/user/{user_id}/revoke-all",
    response_model=dict,
    summary="Revoke all user sessions",
    description="Revoke all active sessions for a specific customer user"
)
def revoke_all_user_sessions(
    user_id: UUID,
    service: CustomerUserSessionsService = Depends(get_customer_user_sessions_service)
):
    """Revoke all user sessions."""
    return service.revoke_user_sessions(user_id)
