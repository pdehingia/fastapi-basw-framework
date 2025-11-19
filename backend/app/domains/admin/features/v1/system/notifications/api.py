"""System Notifications API endpoints."""
from typing import Annotated, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from math import ceil

from app.domains.admin.features.v1.system_notifications.dependencies import (
    get_system_notifications_service,
    RequireAuth
)
from app.domains.admin.features.v1.system_notifications.service import SystemNotificationsService
from app.domains.admin.features.v1.system_notifications.schemas import (
    SystemNotificationCreate,
    SystemNotificationUpdate,
    SystemNotificationResponse,
    SystemNotificationListResponse,
    SystemNotificationFilters,
    SystemNotificationPublishRequest,
    SystemNotificationPublishResponse
)
from app.shared.models.system_notification import (
    NotificationType,
    NotificationPriority,
    TargetAudience
)

router = APIRouter(prefix="/system-notifications", tags=["System Notifications"])


@router.post(
    "",
    response_model=SystemNotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create system notification"
)
async def create_system_notification(
    data: SystemNotificationCreate,
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)]
) -> SystemNotificationResponse:
    """Create a new system-wide notification."""
    notification = await service.create_notification(data, current_admin["user_id"])
    return SystemNotificationResponse.model_validate(notification)


@router.get(
    "",
    response_model=SystemNotificationListResponse,
    summary="List system notifications"
)
async def list_system_notifications(
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)],
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(50, ge=1, le=100, description="Page size"),
    notification_type: Optional[NotificationType] = Query(None, description="Filter by type"),
    priority: Optional[NotificationPriority] = Query(None, description="Filter by priority"),
    target_audience: Optional[TargetAudience] = Query(None, description="Filter by audience"),
    is_published: Optional[bool] = Query(None, description="Filter by published status"),
    search: Optional[str] = Query(None, description="Search in title, message")
) -> SystemNotificationListResponse:
    """Get paginated list of system notifications with filters."""
    filters = SystemNotificationFilters(
        notification_type=notification_type,
        priority=priority,
        target_audience=target_audience,
        is_published=is_published,
        search=search
    )
    
    skip = (page - 1) * size
    notifications, total = await service.get_notifications(filters, skip, size)
    
    return SystemNotificationListResponse(
        items=[SystemNotificationResponse.model_validate(n) for n in notifications],
        total=total,
        page=page,
        size=size,
        pages=ceil(total / size) if total > 0 else 0
    )


@router.get(
    "/{notification_id}",
    response_model=SystemNotificationResponse,
    summary="Get system notification"
)
async def get_system_notification(
    notification_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)]
) -> SystemNotificationResponse:
    """Get system notification by ID."""
    notification = await service.get_notification_by_id(notification_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System notification not found"
        )
    return SystemNotificationResponse.model_validate(notification)


@router.put(
    "/{notification_id}",
    response_model=SystemNotificationResponse,
    summary="Update system notification"
)
async def update_system_notification(
    notification_id: UUID,
    data: SystemNotificationUpdate,
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)]
) -> SystemNotificationResponse:
    """Update system notification."""
    notification = await service.update_notification(
        notification_id,
        data,
        current_admin["user_id"]
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System notification not found"
        )
    return SystemNotificationResponse.model_validate(notification)


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete system notification"
)
async def delete_system_notification(
    notification_id: UUID,
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)]
) -> None:
    """Delete system notification."""
    success = await service.delete_notification(notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System notification not found"
        )


@router.post(
    "/{notification_id}/publish",
    response_model=SystemNotificationPublishResponse,
    summary="Publish/unpublish system notification"
)
async def publish_system_notification(
    notification_id: UUID,
    publish_data: SystemNotificationPublishRequest,
    current_admin: RequireAuth,
    service: Annotated[SystemNotificationsService, Depends(get_system_notifications_service)]
) -> SystemNotificationPublishResponse:
    """Publish or unpublish a system notification."""
    notification = await service.publish_notification(
        notification_id,
        publish_data,
        current_admin["user_id"]
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="System notification not found"
        )
    
    return SystemNotificationPublishResponse(
        id=notification.id,
        title=notification.title,
        is_published=notification.is_published,
        message=f"System notification '{'published' if notification.is_published else 'unpublished'}' successfully"
    )
