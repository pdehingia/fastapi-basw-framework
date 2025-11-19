"""Platform analytics feature dependencies."""

from typing import Dict, Any

from fastapi import Depends

from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user, require_admin_permissions


async def require_platform_analytics_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require platform analytics access permissions."""
    return await require_admin_permissions("can_view_analytics", current_user)


async def require_analytics_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require analytics management access permissions."""
    return await require_admin_permissions("can_manage_analytics", current_user)