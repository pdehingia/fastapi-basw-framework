"""System Notifications Dependencies."""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domains.admin.features.v1.system_notifications.service import SystemNotificationsService
from app.domains.admin.features.v1.auth.dependencies import get_current_admin


async def get_system_notifications_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> SystemNotificationsService:
    """Get system notifications service instance."""
    return SystemNotificationsService(db)


# Require admin authentication
RequireAuth = Annotated[dict, Depends(get_current_admin)]
