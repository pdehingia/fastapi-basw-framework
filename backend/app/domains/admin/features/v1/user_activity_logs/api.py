"""User Activity Logs API endpoints."""

from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from .dependencies import get_user_activity_logs_service
from .schemas import (
    UserActivityLogResponse, UserActivityLogListResponse,
    UserActivityLogFilters, ActivityLogStatistics
)
from .service import UserActivityLogsService


router = APIRouter(prefix="/user-activity-logs", tags=["User Activity Logs"])


@router.get(
    "",
    response_model=UserActivityLogListResponse,
    summary="List user activity logs",
    description="Get paginated list of user activity logs with filtering options"
)
def list_user_activity_logs(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    user_type: Optional[str] = Query(None, description="Filter by user type (admin/provider/customer)"),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    activity_category: Optional[str] = Query(None, description="Filter by activity category"),
    created_from: Optional[datetime] = Query(None, description="Filter from date"),
    created_to: Optional[datetime] = Query(None, description="Filter to date"),
    service: UserActivityLogsService = Depends(get_user_activity_logs_service)
):
    """List user activity logs with filters."""
    filters = UserActivityLogFilters(
        user_id=user_id,
        user_type=user_type,
        activity_type=activity_type,
        activity_category=activity_category,
        created_from=created_from,
        created_to=created_to
    )
    return service.get_activity_logs(filters, page, size)


@router.get(
    "/stats",
    response_model=ActivityLogStatistics,
    summary="Get activity log statistics",
    description="Get comprehensive user activity log statistics"
)
def get_activity_log_statistics(
    service: UserActivityLogsService = Depends(get_user_activity_logs_service)
):
    """Get activity log statistics."""
    return service.get_statistics()


@router.get(
    "/{log_id}",
    response_model=UserActivityLogResponse,
    summary="Get user activity log",
    description="Get specific user activity log by ID"
)
def get_user_activity_log(
    log_id: int,
    service: UserActivityLogsService = Depends(get_user_activity_logs_service)
):
    """Get user activity log by ID."""
    return service.get_activity_log_by_id(log_id)


@router.delete(
    "/cleanup",
    response_model=dict,
    summary="Delete old activity logs",
    description="Delete activity logs older than specified days (default 90 days)"
)
def delete_old_activity_logs(
    days: int = Query(90, ge=1, le=365, description="Delete logs older than this many days"),
    service: UserActivityLogsService = Depends(get_user_activity_logs_service)
):
    """Delete old activity logs for data retention compliance."""
    return service.delete_old_logs(days)
