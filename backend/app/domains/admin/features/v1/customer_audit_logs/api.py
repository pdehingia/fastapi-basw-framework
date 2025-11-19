"""Customer Audit Logs API endpoints."""

from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from .dependencies import get_customer_audit_logs_service
from .schemas import (
    CustomerAuditLogResponse, CustomerAuditLogListResponse,
    CustomerAuditLogFilters, AuditLogStatistics
)
from .service import CustomerAuditLogsService


router = APIRouter(prefix="/customer-audit-logs", tags=["Customer Audit Logs"])


@router.get(
    "",
    response_model=CustomerAuditLogListResponse,
    summary="List customer audit logs",
    description="Get paginated list of customer audit logs with filtering options"
)
def list_customer_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    customer_user_id: Optional[UUID] = Query(None, description="Filter by customer user ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    entity: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[UUID] = Query(None, description="Filter by entity ID"),
    created_from: Optional[datetime] = Query(None, description="Filter from date"),
    created_to: Optional[datetime] = Query(None, description="Filter to date"),
    service: CustomerAuditLogsService = Depends(get_customer_audit_logs_service)
):
    """List customer audit logs with filters."""
    filters = CustomerAuditLogFilters(
        customer_user_id=customer_user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        created_from=created_from,
        created_to=created_to
    )
    return service.get_audit_logs(filters, page, size)


@router.get(
    "/stats",
    response_model=AuditLogStatistics,
    summary="Get audit log statistics",
    description="Get comprehensive customer audit log statistics"
)
def get_audit_log_statistics(
    service: CustomerAuditLogsService = Depends(get_customer_audit_logs_service)
):
    """Get audit log statistics."""
    return service.get_statistics()


@router.get(
    "/{log_id}",
    response_model=CustomerAuditLogResponse,
    summary="Get customer audit log",
    description="Get specific customer audit log by ID"
)
def get_customer_audit_log(
    log_id: int,
    service: CustomerAuditLogsService = Depends(get_customer_audit_logs_service)
):
    """Get customer audit log by ID."""
    return service.get_audit_log_by_id(log_id)
