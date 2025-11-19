"""Customer management feature dependencies."""

from typing import Dict, Any

from fastapi import Depends

from app.domains.admin.features.v1.auth.dependencies import get_current_admin_user, require_admin_permissions


async def require_customer_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require customer management access permissions."""
    return await require_admin_permissions("can_manage_customers", current_user)


async def require_user_management_access(
    current_user: Dict[str, Any] = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """Require user management access permissions."""
    return await require_admin_permissions("can_manage_users", current_user)