"""Provider Audit Logs API endpoints."""

from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from .dependencies import get_provider_audit_logs_service
from .schemas import (
    ProviderAuditLogResponse, ProviderAuditLogListResponse,
    ProviderAuditLogFilters, AuditLogStatistics
)
from .service import ProviderAuditLogsService


router = APIRouter(prefix="/provider-audit-logs", tags=["Provider Audit Logs"])


@router.get(
    "",
    response_model=ProviderAuditLogListResponse,
    summary="List provider audit logs",
    description="Get paginated list of provider audit logs with filtering options"
)
def list_provider_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    provider_user_id: Optional[UUID] = Query(None, description="Filter by provider user ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    entity: Optional[str] = Query(None, description="Filter by entity type"),
    entity_id: Optional[UUID] = Query(None, description="Filter by entity ID"),
    created_from: Optional[datetime] = Query(None, description="Filter from date"),
    created_to: Optional[datetime] = Query(None, description="Filter to date"),
    service: ProviderAuditLogsService = Depends(get_provider_audit_logs_service)
):
    """List provider audit logs with filters."""
    filters = ProviderAuditLogFilters(
        provider_user_id=provider_user_id,
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
    description="Get comprehensive provider audit log statistics"
)
def get_audit_log_statistics(
    service: ProviderAuditLogsService = Depends(get_provider_audit_logs_service)
):
    """Get audit log statistics."""
    return service.get_statistics()


@router.get(
    "/{log_id}",
    response_model=ProviderAuditLogResponse,
    summary="Get provider audit log",
    description="Get specific provider audit log by ID"
)
def get_provider_audit_log(
    log_id: int,
    service: ProviderAuditLogsService = Depends(get_provider_audit_logs_service)
):
    """Get provider audit log by ID."""
    return service.get_audit_log_by_id(log_id)
